# litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite0

## Resumen

EfficientDet-Lite0 es un modelo de deteccion de objetos ligeros desarrollado originalmente por Google y empaquetado por la comunidad `litert-community` para su uso con la tarea `ObjectDetector` de MediaPipe y el runtime LiteRT (anteriormente TensorFlow Lite). Combina una columna vertebral EfficientNet-Lite0 con una red de caracteristicas BiFPN y cabezas predictoras compartidas de cajas y clases, una arquitectura disenada especificamente para inferencia en dispositivo con un presupuesto computacional muy reducido.

El modelo se entrena sobre COCO (1,5 millones de instancias, 80 clases sobre 90 slots de etiquetas COCO) y opera sobre entradas RGB de `320 x 320`. Se distribuye en tres variantes de precision: int8 (4,60 MB), float16 (7,25 MB) y float32 (13,84 MB), todas con metadatos `TFLITE_METADATA` embebidos y el fichero de etiquetas COCO de 90 lineas empaquetado en el propio binario.

Su relevancia actual radica en que es el modelo por defecto recomendado por MediaPipe para equilibrar latencia, tamano compacto y precision COCO en plataformas moviles y web. Es la opcion de referencia cuando se necesita deteccion de objetos en tiempo real en Android, iOS, web, Python o Flutter sin depender de infraestructura de servidor ni de aceleradores dedicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite0 (EfficientNet-Lite0 + BiFPN + cabezas compartidas de caja/clase) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Resolucion de entrada | `320 x 320 x 3` RGB |
| Tipos de cuantizacion | int8, float16, float32 |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (`.tflite`) con `TFLITE_METADATA` embebido |
| Clases | 80 clases COCO sobre 90 slots de etiquetas |
| Tamano de los artefactos | int8: 4,60 MB; float16: 7,25 MB; float32: 13,84 MB |
| Salidas | `[1, 19206, 90]` scores, `[1, 19206, 4]` locations |
| Normalizacion | `mean=[127.5]`, `std=[127.5]` |
| Cuantizacion de entrada (int8) | `scale=0.0078125`, `zero_point=127` |

## Arquitectura y entrenamiento

El modelo sigue la familia EfficientDet, presentada en el paper arXiv:1911.09070. La columna vertebral es EfficientNet-Lite0, una variante optimizada para dispositivos con operaciones compatibles con aceleracion por hardware (sin operaciones no soportadas por delegados TFLite). Sobre ella se aplica una red de fusion de caracteristicas BiFPN que combina mapas de multiples escalas, y sobre la salida de BiFPN se situan cabezas predictoras que comparten pesos entre las predicciones de cajas delimitadoras y de clases.

El entrenamiento se realiza sobre el conjunto COCO, con 1,5 millones de instancias anotadas y 80 clases efectivas mapeadas sobre 90 slots de etiquetas COCO. El modelo produce 19.206 predicciones candidatas por imagen, que el pipeline de MediaPipe filtra mediante supresion no maxima (NMS) y umbrales de confianza configurables. La variante int8 incorpora cuantizacion completa de enteros con parametros de escala y punto cero documentados, lo que permite ejecucion acelerada en hardware movil. No se documentan en la informacion disponible detalles sobre el numero exacto de tokens, composicion del dataset mas alla de COCO, ni tecnicas de RLHF/DPO (no aplicables a un detector de objetos).

## Capacidades

- Deteccion de objetos en imagenes RGB con 80 clases COCO (persona, vehiculos, animales, utensilios, alimentos, etc.).
- Salida de cajas delimitadoras con coordenadas y puntuaciones de confianza por clase.
- Ejecucion en dispositivo (on-device) en Android, iOS, web, Python y Flutter mediante MediaPipe y LiteRT.
- Tres niveles de precision intercambiables (int8, float16, float32) para adaptar el consumo de recursos.
- Etiquetas COCO embebidas en los metadatos del propio fichero `.tflite`, sin dependencias externas.
- Compatibilidad con la API `ObjectDetector` de MediaPipe, que gestiona preprocesado, NMS y postprocesado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo de vision.

## Casos de uso

- Deteccion de personas y objetos en tiempo real en aplicaciones moviles: el modelo, con 4,60 MB en int8, se integra en apps Android e iOS mediante MediaPipe y permite detectar las 80 clases COCO en flujos de camara sin conexion a red.
- Vigilancia y analitica de video en el borde: procesamiento de fotogramas en dispositivos de bajo consumo (Raspberry Pi, moviles reutilizados) para contar personas, vehiculos o animales sin enviar video a la nube.
- Asistencia a la conduccion y ADAS embebidos: deteccion de peatones, vehiculos y senales de trafico en tiempo real sobre la entrada de `320 x 320`, adecuada para prototipos de bajo coste.
- Automatizacion de inventario y retail: reconocimiento de productos y objetos sobre estanterias mediante la variante float16, que ofrece mayor precision que int8 con solo 7,25 MB.
- Accesibilidad: descripcion del entorno para personas con discapacidad visual, detectando objetos cercanos en la camara del movil y generando avisos.
- Filtrado y moderacion de contenido visual: deteccion de objetos sensibles o categorias concretas en pipelines de imagenes antes de su publicacion.
- Procesamiento por lotes en Python: uso de la variante float32 (13,84 MB) en scripts de anotacion automatica o preetiquetado de datasets sobre CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: inferior a 50 MB en la variante int8; en torno a 100-200 MB en float32 contando buffers de activaciones a `320 x 320`.
- GPU recomendadas: no requiere GPU dedicada; esta disenado para CPU, NPU y GPU integrada en moviles (delegados TFLite para Android NNAPI, GPU delegate, Core ML en iOS).
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.), aunque su uso tipico es en dispositivo; en escritorio se ejecuta sobradamente en CPU.
- Opciones de despliegue: MediaPipe Tasks (`ObjectDetector`) en Android, iOS, web, Python y Flutter; LiteRT/TFLite runtime; delegados NNAPI, GPU y Core ML.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del dispositivo y del delegado utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Formato |
|---|---|---|---|---|---|
| EfficientDet-Lite0 (este) | no disponible | 320x320 | 80 COCO | Apache-2.0 | TFLite |
| EfficientDet-Lite1 | no disponible | 320x320 | 80 COCO | Apache-2.0 | TFLite |
| EfficientDet-Lite2 | no disponible | 448x448 | 80 COCO | Apache-2.0 | TFLite |
| YOLOv8n | no disponible | 640x640 | 80 COCO | AGPL-3.0 | ONNX, TFLite, etc. |

Las variantes Lite1 y Lite2 de la misma familia ofrecen mayor precision a costa de mayor tamano y latencia; Lite0 es la opcion por defecto para dispositivos con recursos limitados. YOLOv8n es una alternativa popular con mayor resolucion de entrada, pero su licencia AGPL-3.0 es mas restrictiva para uso comercial que la Apache-2.0 de este modelo. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo detecta las 80 clases COCO; cualquier objeto fuera de ese vocabulario no sera reconocido.
- Resolucion de entrada fija de `320 x 320`, lo que limita la deteccion de objetos muy pequenos o lejanos.
- Riesgo de falsos positivos y negativos en escenas con oclusiones, iluminacion adversa o clases visualmente similares.
- La variante int8 puede degradar la precision respecto a float32; conviene validar en el dominio concreto de despliegue.
- No proporciona segmentacion, pose ni reconocimiento facial; es exclusivamente deteccion de cajas.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos de MediaPipe y LiteRT para el runtime.
- No hay informacion sobre sesgos especificos del dataset COCO mas alla de los conocidos de la comunidad (desbalance de clases, sesgos geograficos y demograficos).
- El modelo no procesa lenguaje, por lo que no aplican limitaciones de contexto o idioma, pero tampoco ofrece capacidades multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite0
- Documentacion de MediaPipe Object Detector: https://developers.google.com/edge/mediapipe/solutions/vision/object_detector
- LiteRT: https://developers.google.com/edge/litert
- Paper EfficientDet: https://arxiv.org/abs/1911.09070
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/ios
- Ejemplo Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/object_detection/python/object_detector.ipynb
- Ejemplo Web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/object-detector.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/object_detector
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/object_detector
