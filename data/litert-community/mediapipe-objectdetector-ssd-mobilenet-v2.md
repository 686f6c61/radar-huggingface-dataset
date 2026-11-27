# litert-community/MediaPipe-ObjectDetector-SSD-MobileNet-V2

## Resumen

MediaPipe-ObjectDetector-SSD-MobileNet-V2 es un detector de objetos ligeros empaquetado para la tarea `ObjectDetector` de MediaPipe y el runtime LiteRT (anteriormente TensorFlow Lite). Combina una columna vertebral MobileNetV2 con una cabeza de deteccion SSD Single Shot MultiBox Detector, operando sobre imagenes de entrada de 256 x 256 pixeles RGB y devolviendo hasta 12.276 cajas candidatas con sus puntuaciones sobre las 90 clases del dataset COCO. Lo publica la organizacion comunitaria `litert-community` en Hugging Face, con pesos derivados de las rutas oficiales de Google AI Edge.

El modelo resuelve deteccion de objetos en tiempo real en dispositivos con recursos limitados: moviles Android e iOS, navegador y sistemas embebidos. Frente a alternativas como EfficientDet-Lite, prioriza latencia y huella de memoria sobre precision, lo que lo hace adecuado para pipelines de vision en el borde donde el coste computacional es la restriccion dominante. Se distribuye en dos variantes de precision, float16 (5,92 MB) y float32 (11,32 MB), ambas con metadatos `TFLITE_METADATA` embebidos y un fichero `labels.txt` de 91 lineas asociado.

Es relevante ahora porque LiteRT y MediaPipe Tasks se han consolidado como la via estandar para desplegar vision por computador en movil sin dependencias de servidor, y porque el modelo llega ya empaquetado con etiquetas y metadatos listos para consumir desde Python, Android, iOS, Web y Flutter. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSD (Single Shot MultiBox Detector) con backbone MobileNetV2 y cabeza de deteccion convolucional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 256 x 256 x 3) |
| Tipos de cuantizacion | float16 (5,92 MB) y float32 (11,32 MB) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con `TFLITE_METADATA` embebido y `labels.txt` asociado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SSD descrita en el paper arXiv:1512.02325 (Liu et al., 2015), con una columna vertebral MobileNetV2 que extrae caracteristicas a multiples escalas y una cabeza SSD que predice simultaneamente offsets de cajas y puntuaciones por clase. La entrada es un tensor `[1, 256, 256, 3]` en float32 con normalizacion `mean=[127.5]`, `std=[127.5]`. Las salidas son dos tensores: `StatefulPartitionedCall:0` de forma `[1, 12276, 4]` con las coordenadas de las cajas y `StatefulPartitionedCall:1` de forma `[1, 12276, 91]` con las puntuaciones por clase.

El entrenamiento se realizo sobre COCO, con aproximadamente 1,5 millones de instancias y 80 clases efectivas mapeadas sobre 90 slots de etiqueta COCO. El fichero de etiquetas embebido tiene 91 lineas: el indice 0 corresponde a `background` y los indices 1 a 90 a las clases COCO. El repositorio incluye ademas un `labelmap.txt` oficial de MediaPipe de 90 lineas (`person` a `toothbrush`) para referencia independiente. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento (no aplica), la composicion completa del dataset ni si hubo etapas de ajuste fino adicionales mas alla del entrenamiento estandar sobre COCO.

La innovacion tecnica principal es el empaquetado: los ficheros incluyen metadatos `TFLITE_METADATA` (nombre `ObjectDetector`, version 1, autor `MediaPipe`) con el fichero `labels.txt` empaquetado como archivo asociado, lo que permite a MediaPipe Tasks cargar el modelo y resolver etiquetas sin configuracion manual. La variante float16 reduce el tamano a la mitad (5,92 MB frente a 11,32 MB) manteniendo la entrada en float32, lo que la hace apta para despliegue en movil con aceleracion por GPU o NPU.

## Capacidades

- Deteccion de objetos en imagenes estaticas en modo `IMAGE` de MediaPipe Tasks.
- Deteccion en flujo de video en modo `VIDEO` con seguimiento entre fotogramas.
- Deteccion en tiempo real sobre stream de camara en modo `LIVE_STREAM`.
- Clasificacion sobre 90 clases COCO (persona, vehiculos, animales, utensilios, alimentos, etc.).
- Salida de hasta 12.276 cajas candidatas con coordenadas y puntuaciones, filtrables por umbral (`score_threshold`) y numero maximo de resultados (`max_results`).
- Ejecucion en Android, iOS, Web (JavaScript/TypeScript), Python y Flutter mediante las librerias MediaPipe Tasks y LiteRT.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.
- No dispone de modo thinking, vision multimodal con lenguaje, audio ni generacion de texto.

## Casos de uso

- **Deteccion de personas en tiempo real en apps moviles**: integrado via MediaPipe Tasks en Android o iOS, el modelo procesa fotogramas de camara a 256 x 256 y devuelve cajas de la clase `person`, adecuado para apps de videollamada, fitness o control de aforo con latencia baja en dispositivos de gama media.
- **Moderacion de contenido visual en el borde**: clasificacion de imagenes subidas por usuarios para detectar categorias sensibles (armas, alcohol, determinadas clases COCO) antes de enviarlas al servidor, reduciendo coste de ancho de banda y cumpliendo requisitos de privacidad al no salir la imagen del dispositivo.
- **Automatizacion de inventario en retail**: deteccion de productos y estanterias en capturas de camara de terminales de mano, aprovechando las clases COCO de utensilios y alimentos para inventario aproximado o alertas de reposicion.
- **Asistencia a la conduccion y ADAS de bajo coste**: deteccion de vehiculos, peatones y senales de trafico en dashcams o sistemas embebidos, con la variante float16 para caber en SoC con recursos limitados y la float32 cuando se requiere mayor fidelidad numerica.
- **Procesamiento de imagenes por lotes en Python**: uso en scripts de anotacion automatica o preetiquetado de datasets, cargando el modelo con `mediapipe` y `huggingface_hub` y aplicando umbrales configurables para generar cajas candidatas que un humano revisa despues.
- **Aplicaciones web de vision sin backend**: despliegue en navegador mediante la API de MediaPipe Tasks Web (TypeScript) para demos interactivas, filtros de camara o herramientas de accesibilidad que detectan objetos en el flujo de video del usuario sin enviar datos a un servidor.
- **Robots y sistemas embebidos**: integracion en plataformas tipo Raspberry Pi o placas con acelerador LiteRT para navegacion reactiva, evitacion de obstaculos o manipulacion simple basada en las clases COCO detectadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, latencia ni throughput para este empaquetado concreto. El paper de referencia de SSD (arXiv:1512.02325) reporta resultados para la familia SSD original, pero no para esta variante MobileNetV2 a 256 x 256 empaquetada por `litert-community`, por lo que no se trasladan aqui cifras que no esten verificadas para este artefacto.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: el modelo ocupa 5,92 MB (float16) o 11,32 MB (float32) en disco; en memoria, la entrada de 256 x 256 x 3 float32 son aproximadamente 786 KB y las salidas suman alrededor de 4,4 MB (12276 x 4 y 12276 x 91 en float32), por lo que el pico de memoria es del orden de decenas de MB incluyendo buffers intermedios.
- **GPU recomendadas**: no requiere GPU dedicada; se ejecuta en CPU de movil, GPU integrada (Adreno, Mali, Apple GPU) o NPU via delegados LiteRT. En escritorio puede usar cualquier GPU moderna con soporte de delegado GPU de LiteRT.
- **Compatibilidad con GPU de consumo**: si, cualquier GPU de consumo es sobredimensionada; el modelo esta pensado para ejecutarse en hardware movil y embebido.
- **Opciones de despliegue**: MediaPipe Tasks (Python, Android, iOS, Web, Flutter), LiteRT runtime, delegados GPU/NNAPI/Core ML/XNNPACK. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. La resolucion de entrada de 256 x 256 y el backbone MobileNetV2 sugieren latencias del orden de milisegundos en moviles modernos, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MediaPipe-ObjectDetector-SSD-MobileNet-V2 (este) | SSD + MobileNetV2 | 256 x 256 | 90 COCO | 5,92 MB (fp16) / 11,32 MB (fp32) | Apache 2.0 | Hugging Face, LiteRT, MediaPipe Tasks |
| EfficientDet-Lite (familia MediaPipe) | EfficientDet-Lite | variable (320, 640, etc.) | 90 COCO | mayor que SSD-MobileNetV2 segun variante | Apache 2.0 | MediaPipe Tasks, LiteRT |
| SSD-MobileNet-V1 (MediaPipe) | SSD + MobileNetV1 | 300 x 300 | 90 COCO | similar o mayor | Apache 2.0 | MediaPipe Tasks, LiteRT |
| YOLO-family (p. ej. YOLOv8n) | YOLO | 640 x 640 | 80 COCO | ~6 MB | AGPL-3.0 o licencia comercial | Ultralytics, ONNX, TFLite |

La comparativa se limita a caracteristicas estructurales; no se dispone de datos de mAP ni latencia para este empaquetado concreto que permitan una comparacion cuantitativa fiable. La eleccion entre SSD-MobileNetV2 y EfficientDet-Lite depende del equilibrio precision/latencia requerido, y frente a YOLO-family la licencia Apache 2.0 de este modelo es una ventaja para uso comercial sin obligaciones copyleft.

## Limitaciones y advertencias

- **Clases limitadas a COCO**: solo detecta las 90 clases del dataset COCO; cualquier objeto fuera de ese vocabulario no sera reconocido.
- **Resolucion de entrada fija**: 256 x 256, lo que limita la deteccion de objetos muy pequenos o muy lejanos en imagenes de alta resolucion.
- **Precision inferior a detectores mas pesados**: el diseno prioriza latencia sobre precision; en escenas densas o con oclusiones puede fallar o producir cajas imprecisas.
- **Sesgos del dataset COCO**: COCO no es representativo de todas las poblaciones, condiciones de iluminacion ni contextos geograficos; el modelo hereda los sesgos de muestreo del dataset.
- **Riesgo de falsos positivos y negativos**: el umbral `score_threshold` debe ajustarse por caso de uso; con umbrales bajos aparecen detecciones espurias y con altos se pierden objetos reales.
- **Sin capacidades de lenguaje**: no procesa texto, no soporta tool calling, agentes ni razonamiento multi-paso; no debe presentarse como un modelo de proposito general.
- **Licencia Apache 2.0**: permite uso comercial y modificacion con atribucion; no impone restricciones copyleft, pero conviene revisar las licencias de los componentes de MediaPipe y LiteRT que se usen junto al modelo.
- **Caveat de produccion**: verificar el comportamiento en el hardware objetivo (delegados GPU/NPU pueden alterar resultados numericos respecto a CPU) y validar con un conjunto de datos propio antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-SSD-MobileNet-V2
- Documentacion de MediaPipe Object Detector: https://developers.google.com/edge/mediapipe/solutions/vision/object_detector
- LiteRT: https://developers.google.com/edge/litert
- Paper SSD (arXiv:1512.02325): https://arxiv.org/abs/1512.02325
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/ios
- Ejemplo Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/object_detection/python/object_detector.ipynb
- Ejemplo Web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/object-detector.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/object_detector
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/object_detector
