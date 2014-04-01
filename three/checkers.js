(function ( checkers , $, undefined) {
	
	checkers.init = function(play) { // Funtion to make it all work
		
		$('#play').before('<div id="intro"><h1>WELCOME TO INTERACTIVE CHECKERS!</h1></div>');
		
		// Create a renderer	
		var WIDTH = 700,
		  HEIGHT = 500;
		  
		var renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setSize(WIDTH, HEIGHT);
		play.append(renderer.domElement);
		
		//Create a camera
		var VIEW_ANGLE = 65, //65 FOV is most 'natural' FOV
		  ASPECT = WIDTH / HEIGHT,
		  NEAR = 0.1,		//these elements are needed for cameras to
		  FAR = 10000;		//partition space correctly
		var camera =
		  new THREE.PerspectiveCamera(
			VIEW_ANGLE,
			ASPECT,
			NEAR,
			FAR);
		camera.position.z = 700; // Changed this value to see the board correctly

		// Create a controls Object
		var controls = new THREE.TrackballControls( camera );
		controls.target.set( 0, 0, 0 )
		
		// Create a scene
		var scene = new THREE.Scene();
		scene.add(camera);
		
		// Create a light
		var pointLight =
		new THREE.PointLight(0xffffe8);
		pointLight.position = new THREE.Vector3(0, 0, 100);

		scene.add(pointLight);
	
		// Function to create a two dimensional array
		// I need this function to be able to "save"
		// the board cubes and positions 
		function array2d(rows) {
			var array = [];
			for (var i = 0; i < rows; i++) {
				array[i] = [];
			}
			return array;
		}
		
		// BOARD

		// I will create a cube for each square using 2 loops
		var size = 50; // sizes of the cube
		var tall = 20; // height of the cube
		var offset = 25; // because its 8x8 squares and the center its not the center of the board
		var geometry = new THREE.CubeGeometry(size,size,tall); 
		var textureWhite = THREE.ImageUtils.loadTexture('img/white_m.jpg'); // using black or white textures for the squares
		var textureBlack = THREE.ImageUtils.loadTexture('img/black_m.jpg');
		var materialW = new THREE.MeshBasicMaterial({map: textureWhite}); // map the textures in material
		var materialB = new THREE.MeshBasicMaterial({map: textureBlack}); 
		
		// create the 2D array with the custom function
		var board = array2d(8);
		
		// 2 for loops to create the 8x8 board
		for (var i = -4; i <= 3; i++ ) {
			for (var j = -4; j <= 3; j++ ) { 
				if ( (i+j)%2 == 0 ){ // Depends on i+j to see if it would be black or white
					var cube = new THREE.Mesh( geometry, materialW );
				} else {
					var cube = new THREE.Mesh( geometry, materialB );
				}
				cube.position.x = i*size + offset;
				cube.position.y = j*size + offset;
				cube.updateMatrixWorld(); // This is very important in order to update the absolute position of the new cube to avoid errors
				board[i+4][j+4] = cube; // Add 4 to save the meshes starting at zero-index in the array
				scene.add( board[i+4][j+4] );
		
			}
		}
		
		// SIDES
		
		// This will create the sides of the board game
		var geometrySide1 = new THREE.CubeGeometry(500, 50, 20); // 2 sides longer than the other 2
		var geometrySide2 = new THREE.CubeGeometry(400, 50, 20);
		var textureWood = THREE.ImageUtils.loadTexture('img/wood.png'); // texture for the sides
		var materialWood = new THREE.MeshBasicMaterial({map: textureWood}); 
		var side1 = new THREE.Mesh( geometrySide1, materialWood );
		var side2 = new THREE.Mesh( geometrySide1, materialWood );
		var side3 = new THREE.Mesh( geometrySide2, materialWood );
		var side4 = new THREE.Mesh( geometrySide2, materialWood );
		
		side1.position.y = 225; // 200 px for the squares plus 25 to center it
		side2.position.y = -225;
		side3.position.x = 225;
		side4.position.x = -225;
		
		side3.rotation.z = Math.PI / 2; // 2 of the sides are rotated around z
		side4.rotation.z = Math.PI / 2;
		
		scene.add( side1 ); // add the 4 sides
		scene.add( side2 );
		scene.add( side3 );
		scene.add( side4 );
		
		// This will create the bottom of the board
		var geometryBottom = new THREE.CubeGeometry(500, 500, 6);
		var sideBottom = new THREE.Mesh( geometryBottom, materialWood ); // same material of the sides
		sideBottom.position.z = -13; // 10 px of the squares depth and 3 px of offset of the bottom
		scene.add( sideBottom );
		
		// PIECES
		// This will create the pieces and put them on the board
		var textureWhiteP = THREE.ImageUtils.loadTexture('img/whiteP.jpg'); // using black or white textures for the pieces
		var textureBlackP = THREE.ImageUtils.loadTexture('img/blackP.jpg'); 
		var materialWP = new THREE.MeshBasicMaterial({map: textureWhiteP}); 
		var materialBP = new THREE.MeshBasicMaterial({map: textureBlackP}); 
		
		var whites = new Array(); // This two arrays will host the meshes of the pieces, 
		var blacks = new Array(); // as I will need them later to randomize their position
		
		var nWhite = 0;
		var nBlack = 0;
		
		piece = new THREE.JSONLoader();
		piece.load( "data/piece.json", function( geometry ) {
			for (var m = 0; m <= 7; m++ ) {
				for (var n = 0; n <= 7; n++ ) { 
					
					// Create the mesh depending if its black or white
					if ( (m+n)%2 != 0 ){ // If its black piece
						
						// BLACKS
						meshB = new THREE.Mesh( geometry, materialBP );
						nBlack++;
						// Scale it
						meshB.scale.set( 40, 40, 40 );
						// Get the position of the board where it should be
						var piecePosition1 = new THREE.Vector3();
						piecePosition1.setFromMatrixPosition( board[m][n].matrixWorld ); // I get the position from the array of cubes of the board
						// Place the piece
						meshB.position.copy (piecePosition1);
						meshB.position.z = 15;
						meshB.rotation.x = Math.PI / 2;
						//add it to the scene
						blacks[nBlack] = meshB; // save it to the array
						meshB.updateMatrixWorld(); // update the absolute position just in case, to avoid errors
						scene.add(blacks[nBlack]);
						
						// WHITES
						meshW = new THREE.Mesh( geometry, materialWP );
						nWhite++;
						// Scale it
						meshW.scale.set( 40, 40, 40 );
						// Get the position of the board where it should be
						var piecePosition2 = new THREE.Vector3();
						piecePosition2.setFromMatrixPosition( board[7-m][7-n].matrixWorld ); // White pieces at the other side
						
						// Place the piece
						meshW.position.copy (piecePosition2);
						meshW.position.z = 15;
						meshW.rotation.x = Math.PI / 2;
						
						//add it to the scene
						whites[nWhite] = meshW; // save it to the array
						meshW.updateMatrixWorld(); // update the absolute position just in case, to avoid errors
						scene.add(whites[nWhite]);
	
					} 
					
					// Break the inner for
					if ( nBlack==12 && nWhite==12 ) break;
					
				}
				// Break the outer for
				if ( nBlack==12 && nWhite==12 ) break;
			}
		} );
		
		// Create the buttons
		$('#play').after('<div id="container"><div id="randomize">Randomize!</div><div id="theme">Change theme</div></div>'); 
		
		// First we get into 2 arrays the possible positions for white and black pieces
		// I do this outside the function because we only need to execute it one time
		var positionsWhite = [];
		var positionsBlack = []; 
		for (var x = 0; x <= 7; x++ ) {
			for (var y = 0; y <= 7; y++ ) { 
				if ( (x+y)%2 == 0) {
					var piecePos = new THREE.Vector3();
					piecePos.setFromMatrixPosition( board[x][y].matrixWorld ); // Black pieces positions
					piecePos.z = 15; // I have to change the Z axis
					positionsBlack.push(piecePos); // Save to array
				} else {
					var piecePos = new THREE.Vector3();
					piecePos.setFromMatrixPosition( board[x][y].matrixWorld ); // White pieces positions
					piecePos.z = 15; // I have to change the Z axis
					positionsWhite.push(piecePos); // Save to array
				}
			}
		}
		
		//+ Jonas Raoni Soares Silva
		//@ http://jsfromhell.com/array/shuffle [v1.0]
		// Shuffle function taken from StackOverflow, because Javascript doesn't have one
		function shuffle(o){ //v1.0
			for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			return o;
		};
		
		// Function to randomize
		var random = function() {
			var newArrayWhites = shuffle(positionsWhite); // Shuffle the 2 arrays of positions
			var newArrayBlacks = shuffle(positionsBlack); // Now we have 32 possible random positions for each piece
			for (var z = 1; z <= 12; z++ ) { // We only need the first 12 random positions
				updatePosition(whites[z].position, newArrayWhites[z]);
				updatePosition(blacks[z].position, newArrayBlacks[z]);
			}
		}	
		
		function updatePosition (pos, newPos) {
			 new TWEEN.Tween( pos ).to( newPos, 1000 ).easing(TWEEN.Easing.Quartic.InOut).start();
		}
		
		// Onclick to randomize
		$("#randomize").on("click", function() {
			random();
		});
		
		// Save all the new materials into variables
		// new pieces
		var textureWhiteP2 = THREE.ImageUtils.loadTexture('img/whiteP_2.jpg'); 
		var textureBlackP2 = THREE.ImageUtils.loadTexture('img/blackP_2.jpg'); 
		var materialWP2 = new THREE.MeshBasicMaterial({map: textureWhiteP2}); 
		var materialBP2 = new THREE.MeshBasicMaterial({map: textureBlackP2});
		// new squares
		var textureWhite2 = THREE.ImageUtils.loadTexture('img/white_2.jpg'); 
		var textureBlack2 = THREE.ImageUtils.loadTexture('img/black_2.jpg'); 
		var materialW2 = new THREE.MeshBasicMaterial({map: textureWhite2});
		var materialB2 = new THREE.MeshBasicMaterial({map: textureBlack2});
		// new wood exterior
		var textureWood2 = THREE.ImageUtils.loadTexture('img/wood_2.jpg'); 
		var materialWood2 = new THREE.MeshBasicMaterial({map: textureWood2});
		
		// This flag is to be able to change from the new theme to the old one again
		var original = true;
		
		var change = function() {
			if (original) { 
				// Change the 24 pieces
				for (var a = 1; a <= 12; a++ ) {
					whites[a].material = materialWP2;
					blacks[a].material = materialBP2;
				}
				// Change the 64 squares
				for (var b = 0; b <= 7; b++ ) {
					for (var c = 0; c <= 7; c++ ) { 
						if ( (b+c)%2 == 0 ){
							board[b][c].material = materialW2;
						} else {
							board[b][c].material = materialB2;
						}
					}
				}
				// Change the sides and bottom
				side1.material = materialWood2;
				side2.material = materialWood2;
				side3.material = materialWood2;
				side4.material = materialWood2;
				sideBottom.material = materialWood2;
				
				original = false;
			} else {
				// Change the 24 pieces
				for (var a = 1; a <= 12; a++ ) {
					whites[a].material = materialWP;
					blacks[a].material = materialBP;
				}
				// Change the 64 squares
				for (var b = 0; b <= 7; b++ ) {
					for (var c = 0; c <= 7; c++ ) { 
						if ( (b+c)%2 == 0 ){
							board[b][c].material = materialW;
						} else {
							board[b][c].material = materialB;
						}
					}
				}
				// Change the sides and bottom
				side1.material = materialWood;
				side2.material = materialWood;
				side3.material = materialWood;
				side4.material = materialWood;
				sideBottom.material = materialWood;
				
				original = true;
			}
		}
		
		// Onclick for the theme
		$("#theme").on("click", function() {
			change();
		});
		
		//  Render all
		function renderLoop() {
			renderer.render(scene, camera);
			controls.update();
			window.requestAnimationFrame(renderLoop);
			TWEEN.update();
			
		}
		window.requestAnimationFrame(renderLoop);
	}
	
})(window.checkers = window.checkers || {} , jQuery)
