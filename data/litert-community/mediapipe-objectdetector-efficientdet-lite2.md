# litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite2

## Resumen

EfficientDet-Lite2 es un modelo de deteccion de objetos en dispositivo (on-device) empaquetado para la tarea MediaPipe Object Detector y el runtime LiteRT. Lo distribuye la comunidad `litert-community` en Hugging Face, aunque el modelo original procede de Google (MediaPipe). Resuelve el problema de localizar y clasificar objetos en imagenes sobre hardware modesto (movil, web, embebido) sin depender de un servidor, con latencias de milisegundos y un peso que va de 7,5 MB a 23,1 MB segun la precision.

La arquitectura es EfficientDet-Lite2: un backbone EfficientNet-Lite2 acoplado a una red de features BiFPN y cabezas de deteccion, con entrada de 448 x 448 RGB. Esta variante "Lite2" apuesta por mayor capacidad y resolucion que las Lite0/Lite1, mejorando la deteccion de objetos pequenos a cambio de mas computo y memoria. Se ofrece en tres precisiones (int8, float16 y float32) con metadatos `TFLITE_METADATA` y las 90 etiquetas COCO embebidas.

Es relevante ahora porque encaja en el ecosistema LiteRT/MediaPipe, que estandariza el despliegue de vision por computador en Android, iOS, web, Python y Flutter con una misma API de tarea. Para desarrolladores que necesitan deteccion de objetos local, privada y de baja latencia, es una pieza lista para produccion con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite2 (backbone EfficientNet-Lite2 + BiFPN + cabezas de deteccion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 448 x 448 x 3) |
| Tipos de cuantizacion | int8, float16, float32 |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con `TFLITE_METADATA` |
| Entrada | `[1, 448, 448, 3]` (uint8 en int8; float32 en float16/float32) |
| Salidas | scores `[1, 37629, 90]` y locations `[1, 37629, 4]` (float32) |
| Clases | 80 clases COCO (90 slots de etiqueta COCO) |
| Tamano int8 | 7,52 MB (7.515.971 B) |
| Tamano float16 | 12,14 MB (12.138.859 B) |
| Tamano float32 | 23,10 MB (23.096.891 B) |
| Normalizacion | mean=[127.5], std=[127.5] |
| Cuantizacion de entrada (int8) | scale=0.0078125, zero_point=127 |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

EfficientDet-Lite2 sigue el diseno de EfficientDet (paper arXiv:1911.09070): un backbone convolucional EfficientNet-Lite2 que extrae features multiescala, una red BiFPN que las fusiona de forma ponderada y bidireccional, y cabezas separadas de clasificacion y regresion de cajas. La variante Lite2 usa resolucion de entrada de 448 x 448, superior a las variantes Lite0/Lite1, lo que incrementa la precision especialmente en objetos pequenos a costa de mayor computo y memoria.

El modelo se entrena sobre COCO (aproximadamente 1,5 millones de instancias, 80 clases de deteccion mapeadas sobre 90 slots de etiqueta COCO). La informacion disponible no detalla el numero exacto de tokens ni la composicion completa del dataset mas alla de COCO, ni si se empleo RLHF/DPO (no aplica en un detector). La innovacion practica es el empaquetado: cada `.tflite` incluye `TFLITE_METADATA` con nombre `ObjectDetector`, version 1, autor MediaPipe y el fichero `labels.txt` (90 lineas) asociado, lo que permite consumirlo directamente con la API de tarea sin gestionar etiquetas por separado.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras y puntuaciones para 80 clases COCO.
- Clasificacion multietiqueta por region: 90 slots de salida de etiqueta COCO con scores independientes.
- Inferencia on-device en Android, iOS, web, Python y Flutter mediante MediaPipe Object Detector.
- Ejecucion con LiteRT (antiguo TensorFlow Lite) en CPU y aceleradores compatibles.
- Tres niveles de precision intercambiables (int8, float16, float32) para equilibrar tamano, velocidad y exactitud.
- Procesamiento de imagen unica por inferencia (batch fijo de 1, 448 x 448).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No dispone de capacidades de lenguaje, audio ni thinking mode.

## Casos de uso

- Deteccion de objetos en tiempo real en apps moviles: integrado con MediaPipe Object Detector en Android/iOS, el modelo procesa frames de camara a 448 x 448 y devuelve cajas y scores, adecuado para filtros de realidad aumentada o catalogacion visual.
- Vision por computador en navegador: usando la variante web (`object-detector.ts`) sobre LiteRT, permite deteccion local sin enviar imagenes a un servidor, util para privacidad en aplicaciones de escritorio o web.
- Automatizacion de inventario y logistica: la variante int8 (7,5 MB) puede desplegarse en dispositivos embebidos o Raspberry Pi para contar y clasificar productos en cintas transportadoras.
- Moderacion y analisis de contenido visual: deteccion de personas, vehiculos u objetos sensibles en lotes de imagenes mediante Python, con umbrales de confianza ajustables sobre los scores de salida.
- Asistencia a personas con discapacidad visual: deteccion on-device de obstaculos y objetos cotidianos en tiempo real, sin conexion, gracias al bajo peso y a la inferencia local.
- Sistemas de vigilancia y seguridad en el borde: procesamiento de camaras IP en el propio dispositivo, reduciendo ancho de banda y coste de nube al enviar solo eventos detectados.
- Preprocesado para pipelines de vision mayores: uso como etapa de region proposal o filtrado previo antes de modelos mas pesados (OCR, reconocimiento facial, segmentacion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el modelo pesa entre 7,5 MB (int8) y 23,1 MB (float32); el consumo de memoria en ejecucion es muy bajo, apto para dispositivos con menos de 1 GB de RAM.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU movil, CPU de escritorio y aceleradores integrados (GPU movil, NPU via delegados de LiteRT).
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y en hardware movil de gama baja; el cuello de botella es la CPU/NPU del dispositivo, no la VRAM.
- Opciones de despliegue: MediaPipe Object Detector (Android, iOS, web, Python, Flutter), LiteRT/TFLite runtime, y delegados de aceleracion (GPU, NNAPI, XNNPACK).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del dispositivo y del delegado usado.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EfficientDet-Lite2 (este) | no disponible | 448 x 448 | no aplica | Apache 2.0 | TFLite | Mayor capacidad y resolucion que Lite0/Lite1 |
| EfficientDet-Lite0 | no disponible | 320 x 320 (tipico) | no aplica | Apache 2.0 | TFLite | Mas ligero y rapido, menor precision en objetos pequenos |
| EfficientDet-Lite1 | no disponible | 320 x 320 (tipico) | no aplica | Apache 2.0 | TFLite | Punto intermedio entre Lite0 y Lite2 |
| YOLO (familia, p. ej. YOLOv8n) | no disponible | 640 x 640 (tipico) | no aplica | AGPL-3.0 / otras | ONNX, TFLite, etc. | Mayor ecosistema, pero licencia mas restrictiva en muchas variantes |

La informacion disponible no incluye cifras de rendimiento comparativas (mAP, latencia) entre estos modelos; las diferencias de resolucion y tamano son las unicas referencias objetivas.

## Limitaciones y advertencias

- Solo detecta las 80 clases COCO; objetos fuera de ese vocabulario no se reconocen.
- Entrada fija de 448 x 448: imagenes de otra resolucion deben redimensionarse, lo que puede degradar objetos muy pequenos o muy alargados.
- Salida con 37.629 candidatos por imagen: requiere post-procesado (NMS, umbrales) para obtener detecciones utiles.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.
- Riesgo de falsos positivos y negativos inherente a los detectores; la calibracion de umbrales es responsabilidad del integrador.
- Sesgos potenciales heredados del dataset COCO (posible infrarrepresentacion de ciertas categorias, contextos y demografias).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los componentes de MediaPipe/LiteRT que se usen junto al modelo.
- La model card no documenta metricas de exactitud, latencia ni requisitos minimos de version de runtime; verificar en el dispositivo objetivo antes de produccion.
- El repositorio figura con 0,0 GB de tamano reportado y 0 likes; la disponibilidad y mantenimiento dependen de la comunidad `litert-community`, no de un canal oficial de Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite2
- Documentacion de MediaPipe Object Detector: https://developers.google.com/edge/mediapipe/solutions/vision/object_detector
- LiteRT: https://developers.google.com/edge/litert
- Paper EfficientDet: https://arxiv.org/abs/1911.09070
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/object_detection/ios
- Ejemplo Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/object_detection/python/object_detector.ipynb
- Ejemplo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/object-detector.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/object_detector
- Demo en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/object_detector
