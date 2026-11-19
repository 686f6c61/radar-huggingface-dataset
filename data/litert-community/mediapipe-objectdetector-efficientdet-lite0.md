# litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite0

## Resumen

EfficientDet-Lite0 es un detector de objetos ligero desarrollado por Google (MediaPipe / LiteRT) y redistribuido en el repositorio `litert-community` de Hugging Face. Combina un backbone EfficientNet-Lite0 con una red de características BiFPN y cabezas compartidas de predicción de cajas y clases, y está entrenado sobre COCO (1,5 millones de instancias, 80 clases efectivas sobre 90 slots de etiquetas COCO). Su resolución de entrada es fija de 320 x 320 píxeles RGB.

El modelo se distribuye en tres variantes `.tflite` con precisión int8 (4,60 MB), float16 (7,25 MB) y float32 (13,84 MB), todas ellas empaquetadas con metadatos `TFLITE_METADATA` y el fichero de etiquetas COCO embebido. Está pensado para la tarea `ObjectDetector` de MediaPipe y para el runtime LiteRT, con soporte declarado para Android, iOS, web, Python y Flutter.

Su relevancia radica en ser el punto de partida recomendado por MediaPipe para equilibrar latencia, tamano y precision en deteccion de objetos en dispositivo (on-device), sin dependencia de servidores ni aceleradores dedicados. No es un modelo de lenguaje ni un transformer generativo: es una CNN de deteccion pensada para inferencia en tiempo real en hardware movil y embebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite0 (backbone EfficientNet-Lite0 + BiFPN + cabezas compartidas de caja/clase) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija de 320 x 320 x 3) |
| Tipos de cuantizacion | int8, float16, float32 |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con `TFLITE_METADATA` embebido |
| Resolucion de entrada | 320 x 320 RGB |
| Numero de clases | 80 clases COCO efectivas sobre 90 slots de etiqueta |
| Salidas | `[1, 19206, 90]` scores (float32) y `[1, 19206, 4]` locations (float32) |
| Normalizacion (int8) | mean=[127.5], std=[127.5]; quant scale=0.0078125, zero_point=127 |
| Tipo de entrada int8 | uint8 |
| Tipo de entrada float16/float32 | float32 |
| Tamano int8 | 4,60 MB (4.602.795 B) |
| Tamano float16 | 7,25 MB (7.254.339 B) |
| Tamano float32 | 13,84 MB (13.836.895 B) |

## Arquitectura y entrenamiento

EfficientDet-Lite0 sigue la familia EfficientDet descrita en el paper arXiv:1911.09070. El modelo usa un backbone EfficientNet-Lite0 (variante movil de EfficientNet con activaciones y operaciones optimizadas para TFLite) como extractor de caracteristicas, una red de fusion bidireccional BiFPN para combinar caracteristicas multi-escala, y cabezas de prediccion compartidas entre escalas para cajas delimitadoras y clases. La entrada se normaliza con media y desviacion estandar de 127.5 sobre valores de pixel.

El entrenamiento se realizo sobre COCO, con 1,5 millones de instancias anotadas y 80 clases efectivas mapeadas sobre los 90 slots de etiqueta del dataset COCO. No se detalla en la informacion disponible el numero exacto de tokens, la composicion completa del dataset ni si hubo etapas de ajuste fino adicionales. El modelo se exporta a TFLite con metadatos embebidos (`name: ObjectDetector`, `version: 1`, `author: MediaPipe`) y el fichero `labels.txt` empaquetado como recurso asociado, lo que permite su uso directo con la API `ObjectDetector` de MediaPipe sin gestion manual del mapa de etiquetas.

La innovacion principal es la integracion con LiteRT y MediaPipe Tasks: el modelo incluye toda la informacion necesaria (etiquetas, normalizacion, tipos de tensor) en el propio fichero, de modo que el runtime puede cargarlo y ejecutarlo sin configuracion adicional. Las tres variantes de precision permiten elegir entre velocidad y calidad segun el hardware objetivo.

## Capacidades

- Deteccion de objetos en imagenes RGB con 80 clases COCO (persona, vehiculo, animal, utensilios, etc.).
- Salida de cajas delimitadoras y puntuaciones de clase por cada deteccion, con hasta 19.206 candidatos por imagen antes del filtrado NMS.
- Inferencia en dispositivo (on-device) en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks y LiteRT.
- Tres niveles de precision (int8, float16, float32) para adaptar el modelo al hardware disponible.
- Etiquetas COCO embebidas en los metadatos del fichero, sin necesidad de fichero externo.
- Compatible con la tarea `ObjectDetector` de MediaPipe, que gestiona preprocesado, NMS y postprocesado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision por computador.

## Casos de uso

- Deteccion de personas y objetos en tiempo real en aplicaciones moviles: el modelo int8 de 4,60 MB se integra en apps Android e iOS mediante MediaPipe Tasks y permite procesar fotogramas de camara sin conexion a red, aprovechando la baja latencia de un modelo disenado para hardware movil.
- Moderacion de contenido visual en el borde: clasificar imagenes subidas por usuarios para detectar categorias COCO relevantes (personas, armas blancas representadas como `knife`, etc.) antes de enviarlas al servidor, reduciendo ancho de banda y coste de backend.
- Automatizacion de inventario y logistica: detectar productos o vehiculos en imagenes de almacen o camaras de seguridad, usando la variante float32 (13,84 MB) cuando la precision sea prioritaria sobre la latencia.
- Analisis de imagenes en aplicaciones web: el modelo puede ejecutarse en el navegador mediante la demo web de MediaPipe Samples y LiteRT, sin backend, para tareas de etiquetado asistido o filtrado previo.
- Vision por computador en dispositivos embebidos y IoT: la variante int8 cabe en memoria de microcontroladores de gama alta y SoCs de bajo consumo, permitiendo deteccion local en camaras inteligentes o drones ligeros.
- Preprocesado para pipelines de analitica de video: usar el detector como primera etapa para recortar regiones de interes que alimenten modelos mas pesados (reconocimiento facial, OCR, clasificacion fina), reduciendo el coste computacional del pipeline completo.
- Prototipado rapido en Python: el quickstart con `mediapipe` y `huggingface_hub` permite validar un caso de uso de deteccion en pocas lineas antes de invertir en un modelo mayor o en entrenamiento propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de mAP, latencia ni comparativas numericas con otros detectores. El paper de EfficientDet (arXiv:1911.09070) contiene resultados para la familia completa, pero no se dispone en la informacion proporcionada de los valores especificos de la variante Lite0 en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo esta pensado para ejecucion en CPU, GPU movil o NPU. El fichero int8 ocupa 4,60 MB en disco y una huella de memoria en RAM del orden de decenas de MB incluyendo el runtime de MediaPipe/LiteRT.
- GPU recomendadas: no requiere GPU dedicada. Se ejecuta en CPU de moviles y SoCs embebidos; en escritorio puede usar CPU o GPU integrada mediante el delegado GPU de LiteRT.
- Cabe en GPU consumer: si, aunque no es su objetivo; cualquier GPU consumer puede ejecutarlo, pero el modelo esta optimizado para hardware de bajo consumo.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web, Flutter), LiteRT, y el runtime TFLite estandar. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen fuertemente del hardware y del delegado (CPU, GPU, NPU) utilizado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EfficientDet-Lite0 (este) | EfficientDet-Lite0 | 320 x 320 | 80 COCO | TFLite int8/fp16/fp32 | Apache 2.0 | Hugging Face, MediaPipe |
| EfficientDet-Lite1 | EfficientDet-Lite | mayor resolucion | 80 COCO | TFLite | Apache 2.0 | MediaPipe (upstream Google) |
| EfficientDet-Lite2 | EfficientDet-Lite | mayor resolucion | 80 COCO | TFLite | Apache 2.0 | MediaPipe (upstream Google) |
| SSD MobileNet V2 | SSD + MobileNetV2 | 300 x 300 | 80 COCO | TFLite | Apache 2.0 | TensorFlow Model Zoo |

No se dispone en la informacion proporcionada de datos numericos de mAP ni latencia para establecer una comparativa cuantitativa con estas alternativas. Las variantes Lite1 y Lite2 de EfficientDet sacrifican velocidad y tamano a cambio de mayor precision, mientras que SSD MobileNet V2 es una alternativa clasica con caracteristicas similares de despliegue en dispositivo.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; cualquier objeto fuera de ese vocabulario no sera reconocido.
- No es un modelo generativo ni de lenguaje: no admite instrucciones en texto, tool calling ni razonamiento.
- La resolucion de entrada es fija (320 x 320), lo que limita la deteccion de objetos muy pequenos en imagenes de alta resolucion sin recortes previos.
- Riesgo de falsos positivos y negativos inherente a los detectores ligeros; la variante int8 puede degradar ligeramente la precision frente a float32.
- No se han publicado en la informacion disponible datos de sesgos por categoria, demografia o contexto; se recomienda evaluar el modelo en el dominio objetivo antes de produccion.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y la atribucion correspondiente.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-18; se trata de una redistribucion comunitaria de artefactos upstream de Google, no de un modelo entrenado por `litert-community`.
- El rendimiento real depende del delegado de LiteRT utilizado (CPU, GPU, NPU) y del hardware; no se proporcionan cifras de latencia verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite0
- Documentacion de MediaPipe Object Detector: https://developers.google.com/edge/mediapipe/solutions/vision/object_detector
- LiteRT: https://developers.google.com/edge/litert
- Demo web de MediaPipe Samples: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/object_detector
- Paper EfficientDet: https://arxiv.org/abs/1911.09070
- Fichero de etiquetas: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite0/blob/main/labelmap.txt
