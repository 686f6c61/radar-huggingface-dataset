# cstr/chess-board-photo-onnx

## Resumen

`cstr/chess-board-photo-onnx` es un paquete de dos clasificadores de vision por computador en formato ONNX, publicados por el usuario `cstr`, cuyo objetivo es leer una fotografia de un tablero de ajedrez fisico y determinar el contenido de cada casilla. No es un modelo de lenguaje ni un transformer: se trata de dos redes convolucionales MobileNetV3-Small, una que decide si una casilla esta vacia u ocupada y otra que clasifica la pieza concreta entre 12 clases (seis tipos de pieza por dos colores). El modelo forma parte del proyecto [CrispChess](https://github.com/CrispStrobe/CrispChess) y se apoya en la portabilidad a Dart de la localizacion de tablero y el recorte de casillas de [chesscog](https://github.com/georg-wolflein/chesscog).

El problema que resuelve es la digitalizacion de partidas jugadas sobre un tablero real (over-the-board) a partir de una unica fotografia, sin necesidad de sensores electronicos ni de hardware especial. Es relevante para desarrolladores que quieran integrar reconocimiento de tableros en aplicaciones moviles o de escritorio, ya que el uso de MobileNetV3-Small y de ONNX permite inferencia ligera en CPU y despliegue multiplataforma.

El modelo se distribuye con licencia MIT, ocupa un repositorio de 0,0 GB, no tiene descargas ni likes registrados y fue creado el 24 de septiembre de 2026. La model card no publica el numero de parametros ni el tamano exacto de los ficheros, aunque la arquitectura declarada (MobileNetV3-Small) corresponde a la variante pequena de la familia MobileNetV3 de torchvision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV3-Small (dos clasificadores independientes) |
| Parametros totales | No disponible en la model card; la arquitectura MobileNetV3-Small estandar ronda los 2,5 M de parametros por clasificador |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de vision; las entradas son recortes de imagen de 100x100 y 100x200) |
| Tipos de cuantizacion | No disponible (solo se distribuyen ficheros ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplicable (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`board_photo_occupancy.onnx` y `board_photo_pieces.onnx`) |

## Arquitectura y entrenamiento

Se trata de dos clasificadores convolucionales basados en MobileNetV3-Small, inicializados con pesos de ImageNet procedentes de torchvision (licencia BSD-3) y ajustados para la tarea. El primer modelo recibe recortes cuadrados de 100x100 px con el mismo esquema de recorte de casilla (occupancy crop) que emplea chesscog y produce una decision binaria vacio/ocupado. El segundo recibe recortes rectangulares de 100x200 px (piece crop) y clasifica la pieza en 12 clases. La localizacion del tablero y la generacion de los recortes no forman parte de este repositorio: se delegan en la implementacion de chesscog portada a Dart.

El entrenamiento se realizo sobre tres fuentes de datos: los renders sinteticos de chesscog (OSF `xf3ka`, CC BY 4.0), el conjunto [samryan18/chess-dataset](https://github.com/samryan18/chess-dataset) (MIT, 2019) y el subconjunto "chess pieces" (`chess-pieces-mjzgj`) de Roboflow 100 (CC BY 4.0). No se documenta el numero de tokens ni de imagenes, ni el uso de RLHF, DPO o tecnicas de alineamiento, algo por otra parte esperable en un modelo de clasificacion de imagenes. La innovacion practica del paquete es la separacion en dos etapas (ocupacion y tipo de pieza) combinada con el pipeline de localizacion de chesscog, lo que permite obtener la posicion completa del tablero a partir de una foto.

## Capacidades

- Clasificacion binaria de ocupacion: distingue casillas vacias de casillas ocupadas a partir de recortes de 100x100 px.
- Clasificacion de piezas en 12 clases: seis tipos (peon, caballo, alfil, torre, dama, rey) por dos colores.
- Lectura de tableros fisicos fotografados, siempre que se use junto con el localizador de tablero y el recorte de casillas de chesscog.
- Integracion con el proyecto CrispChess mediante ONNX, lo que facilita su uso desde aplicaciones Dart o Flutter.
- Inferencia ligera apta para CPU y dispositivos de recursos limitados, gracias a la arquitectura MobileNetV3-Small.
- No soporta tool calling, agentes, razonamiento multi-paso, procesamiento de lenguaje natural, vision general, audio ni modo de pensamiento: sus capacidades se limitan estrictamente a la clasificacion de casillas y piezas de ajedrez.
- No se documentan capacidades multilingues ni procesamiento de texto de ningun tipo.

## Casos de uso

- Digitalizacion de partidas over-the-board: el usuario fotografia un tablero fisico y el pipeline (localizador de chesscog mas estos dos clasificadores) reconstruye la posicion en formato FEN para su analisis posterior con un motor de ajedrez.
- Aplicaciones moviles de ajedrez: al estar en ONNX y basarse en MobileNetV3-Small, el modelo puede ejecutarse en el dispositivo sin conexion, lo que permite reconocer posiciones en una app Flutter o Dart sin enviar imagenes a un servidor.
- Registro automatico de partidas en clubes y torneos: fotografiar la posicion tras cada jugada para mantener un registro digital fiable, con exactitudes declaradas del 99,6-99,9 % por casilla en sets de piezas vistos durante el entrenamiento.
- Ensenanza y arbitraje: transcripcion rapida de ejercicios o posiciones de libros y hojas de ejercicios fotografiadas, para generar diagramas o problemas digitales.
- Anotacion de conjuntos de datos de ajedrez: uso de los clasificadores como etiquetadores automaticos preliminares de imagenes de tableros, con revision humana posterior.
- Herramientas de accesibilidad: conversion de una fotografia de tablero en una representacion textual o en una posicion jugable para personas con dificultades de vision parcial que necesiten una descripcion verbalizada de la posicion.
- Robots y brazos ajedrecisticos: percepcion del estado del tablero en sistemas automatizados que colocan o verifican piezas, donde el coste computacional reducido permite ejecutar la inferencia en el propio controlador.
- Verificacion de posiciones en publicaciones o retransmisiones: comprobacion automatica de que el diagrama mostrado coincide con la posicion fotografiada o declarada.

## Benchmarks y rendimiento

La model card solo publica exactitud por casilla del pipeline completo (localizador mas clasificadores). No se aportan resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, logicamente no aplicables a este tipo de modelo.

| Metrica | Conjunto de evaluacion | Resultado |
|---|---|---|
| Exactitud por casilla, pipeline completo con localizador | Fotos reservadas de sets de piezas vistos en entrenamiento | 99,6-99,9 % |
| Exactitud por casilla, pipeline completo con localizador | Fotos de chesscog de un set de madera no visto en entrenamiento | 85 % (todos los errores corresponden a tipo o color de pieza) |

No se publican metricas separadas para el clasificador de ocupacion ni para el de piezas, ni latencias, ni curvas de error por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; al tratarse de dos MobileNetV3-Small, el modelo cabe en memoria de CPU y en memoria unificada de dispositivos moviles.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna (RTX 4090, A100, H100) ejecutaria la inferencia sin problema, pero seria un uso desproporcionado para este tamano de red.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo es mas que suficiente; tambien funciona exclusivamente en CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web, onnxruntime movil, y el stack Dart/Flutter empleado por CrispChess. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de imagenes por segundo.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos alternativos equivalentes en la informacion proporcionada, mas alla del propio clasificador de chesscog del que este trabajo hereda el esquema de recortes. La tabla recoge lo que se conoce, marcando como no disponible lo que no se documenta.

| Modelo | Arquitectura | Parametros | Contexto o entrada | Licencia | Notas |
|---|---|---|---|---|---|
| `cstr/chess-board-photo-onnx` | MobileNetV3-Small (x2) | No disponible (aprox. 2,5 M por clasificador segun la arquitectura estandar) | Recortes de 100x100 y 100x200 px | MIT | 99,6-99,9 % por casilla en sets vistos; 85 % en un set de madera no visto |
| Clasificador de piezas de chesscog | No disponible | No disponible | Recortes definidos por chesscog | MIT | Referencia metodologica (Wolflein y Arandjelovic, J. Imaging 2021); no se publican cifras comparables en la informacion disponible |
| MobileNetV3-Small de torchvision | MobileNetV3-Small | Aprox. 2,5 M | Imagenes de 224x224 px (ImageNet) | BSD-3 | Punto de partida del ajuste fino; no es un modelo de ajedrez |

## Limitaciones y advertencias

- Rendimiento dependiente del set de piezas: la exactitud baja del 99,6-99,9 % al 85 % cuando se evalua sobre un set de madera no visto en entrenamiento, con errores exclusivamente de tipo o color de pieza. Sets poco habituales (piezas de diseno, materiales reflectantes, miniaturas) requieren verificacion previa.
- El repositorio no incluye la deteccion ni la localizacion del tablero: sin el pipeline de chesscog para localizar el tablero y recortar las casillas, estos ficheros ONNX por si solos no producen una posicion completa.
- Propagacion de errores: un fallo del localizador o un recorte mal alineado arrastra errores en ambos clasificadores; la exactitud declarada corresponde al pipeline completo en condiciones controladas.
- Sensibilidad a condiciones de captura: no se documentan evaluaciones con iluminacion adversa, sombras, oclusiones de piezas, reflejos, angulos oblicuos o fondos con ruido visual.
- Riesgo de confusion entre piezas del mismo tipo y distinto color, segun la propia model card, que senala que todos los errores en el set no visto fueron de tipo o color.
- Sesgos y composicion del dataset: el entrenamiento combina renders sinteticos y dos conjuntos de imagenes concretos, por lo que la distribucion de estilos de pieza, colores y materiales esta sesgada hacia esos datos; no se documentan analisis de sesgo ni de representatividad.
- Uso comercial: la licencia del modelo es MIT y permite uso comercial, pero los datos de entrenamiento tienen licencias propias (CC BY 4.0 para los renders de chesscog y Roboflow 100, MIT para samryan18/chess-dataset) que exigen mantener la atribucion correspondiente. La model card no incluye un aviso legal especifico sobre la redistribucion de los datos de entrenamiento.
- Ausencia de benchmarks externos y de validacion independiente: las cifras de exactitud proceden de la propia model card, sin evaluacion por terceros ni comparacion con modelos alternativos.
- Advertencia de alcance: no es un modelo de lenguaje, por lo que no admite prompts, tool calling ni razonamiento; cualquier expectativa en ese sentido es inaplicable.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cstr/chess-board-photo-onnx
- Proyecto CrispChess: https://github.com/CrispStrobe/CrispChess
- Proyecto chesscog: https://github.com/georg-wolflein/chesscog
- Articulo de chesscog: Georg Wolflein y Ognjen Arandjelovic, *J. Imaging* 2021 (referencia citada en la model card, sin URL directa incluida)
- Renders sinteticos de chesscog en OSF `xf3ka` (referencia citada, sin URL directa incluida)
- Conjunto de datos samryan18/chess-dataset: https://github.com/samryan18/chess-dataset
- Subconjunto "chess pieces" de Roboflow 100 (`chess-pieces-mjzgj`, referencia citada, sin URL directa incluida)
- Busquedas web adicionales: no se han encontrado resultados relevantes sobre este modelo; las entradas devueltas por el buscador corresponden a directorios de television en arabe y no guardan relacion con el modelo.
