# litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite2

## Resumen

MediaPipe-ObjectDetector-EfficientDet-Lite2 es un modelo de deteccion de objetos empaquetado en formato TensorFlow Lite (TFLite) y distribuido por la comunidad litert-community. Implementa la arquitectura EfficientDet-Lite2, que combina una red troncal EfficientNet-Lite2 de mayor capacidad con una red de caracteristicas BiFPN, y esta entrenado sobre el dataset COCO (1,5 millones de instancias, 80 clases sobre 90 ranuras de etiquetas COCO). El modelo esta disenado para ejecutarse en dispositivo (on-device) mediante MediaPipe Object Detector y LiteRT, con soporte para Android, iOS, web, Python y Flutter.

El modelo resuelve el problema de deteccion de objetos de baja latencia sin dependencia de servidores: procesa imagenes RGB de 448 x 448 pixeles y devuelve hasta 37.629 cajas candidatas con puntuaciones para 90 etiquetas. Se distribuye en tres precisiones (int8, float16 y float32) con tamanos de 7,52 MB, 12,14 MB y 23,10 MB respectivamente, lo que permite elegir entre eficiencia energetica y fidelidad numerica segun el hardware objetivo.

Su relevancia actual radica en la combinacion de un backbone de mayor capacidad (EfficientNet-Lite2) con una resolucion de entrada elevada (448 x 448), lo que mejora la deteccion de objetos pequenos frente a variantes Lite0/Lite1, manteniendo un peso lo suficientemente reducido para desplegarse en moviles y navegadores. La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite2 (EfficientNet-Lite2 backbone + BiFPN + cabecera de deteccion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 448 x 448 RGB) |
| Tipos de cuantizacion | int8, float16, float32 |
| Idiomas soportados | no disponible (modelo de vision; etiquetas COCO en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (.tflite) con TFLITE_METADATA embebida |

## Arquitectura y entrenamiento

EfficientDet-Lite2 es una variante de EfficientDet (paper arXiv:1911.09070) adaptada para eficiencia en dispositivo. Combina una red troncal EfficientNet-Lite2 con una red de piramide de caracteristicas bidireccional (BiFPN) y una cabecera de deteccion que produce simultaneamente puntuaciones de clase y coordenadas de caja. La entrada es una imagen RGB de 448 x 448 pixeles; la salida son tensores `[1, 37629, 90]` de puntuaciones y `[1, 37629, 4]` de localizaciones. El modelo esta entrenado sobre COCO (1,5 millones de instancias, 80 clases efectivas sobre 90 ranuras de etiquetas) y cada archivo `.tflite` incluye las etiquetas COCO embebidas en `TFLITE_METADATA` (archivo `labels.txt` de 90 lineas).

Las tres variantes difieren en precision numerica y normalizacion de entrada: la int8 espera entrada `uint8` con cuantizacion `scale=0.0078125, zero_point=127` y normalizacion `mean=[127.5], std=[127.5]`; las variantes float16 y float32 esperan entrada `float32` con la misma normalizacion. Las tres producen salidas `float32`. El modelo esta empaquetado para la tarea MediaPipe `ObjectDetector` y para LiteRT, con metadatos que declaran nombre `ObjectDetector`, version `1` y autor `MediaPipe`.

## Capacidades

- Deteccion de objetos en imagenes RGB de 448 x 448 pixeles, con hasta 37.629 cajas candidatas y puntuaciones sobre 90 etiquetas COCO.
- Deteccion de las 80 clases COCO (persona, vehiculos, animales, utensilios, alimentos, etc.) mapeadas sobre 90 ranuras de etiqueta.
- Ejecucion on-device en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks y LiteRT.
- Tres niveles de precision (int8, float16, float32) para ajustar consumo de memoria y velocidad.
- Mayor sensibilidad a objetos pequenos gracias a la resolucion de 448 x 448 y al backbone EfficientNet-Lite2.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, audio ni tool calling; es exclusivamente un detector de objetos.

## Casos de uso

- Deteccion de objetos en tiempo real en aplicaciones moviles: integracion via MediaPipe Tasks en Android o iOS para identificar personas, vehiculos y objetos cotidianos en el flujo de camara, usando la variante int8 (7,52 MB) para minimizar consumo y latencia.
- Vision por computador en navegador: despliegue web con LiteRT y la demo oficial de MediaPipe Samples Web, adecuado para aplicaciones de accesibilidad o catalogacion visual sin backend.
- Inventario y conteo automatico: procesamiento por lotes de imagenes en Python para contar productos, personas o elementos en estanterias, aprovechando las 37.629 cajas candidatas y el filtrado por umbral de confianza.
- Sistemas de alerta y monitorizacion: deteccion de presencia de personas o vehiculos en camaras de seguridad embebidas, con la variante float16 (12,14 MB) como equilibrio entre precision y huella de memoria.
- Automatizacion de flujos con Flutter: apps multiplataforma que detectan objetos en tiempo real para tareas de escaneo, clasificacion o asistencia visual, usando el paquete de MediaPipe para Flutter.
- Preprocesado para pipelines mayores: uso del detector como etapa de region proposal o filtrado previo en sistemas de reconocimiento, seguimiento o analisis de escenas, alimentando modelos posteriores con las cajas detectadas.
- Prototipado e investigacion: referencia ligera y reproducible (pesos con SHA-256 publicados) para comparar variantes de EfficientDet-Lite o validar despliegues TFLite antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecucion on-device y no requiere GPU dedicada.
- Huella de memoria en disco: 7,52 MB (int8), 12,14 MB (float16), 23,10 MB (float32).
- GPU recomendadas: no aplica para el caso de uso principal; en servidor puede ejecutarse en CPU o GPU compatibles con LiteRT/TFLite, pero no se publican recomendaciones concretas.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, dado el reducido tamano de los pesos; en moviles y dispositivos embebidos es el escenario objetivo.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web, Flutter), LiteRT, TFLite runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector TFLite).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Precisiones | Tamano | Licencia |
|---|---|---|---|---|---|
| EfficientDet-Lite2 (este modelo) | EfficientNet-Lite2 + BiFPN | 448 x 448 | int8, float16, float32 | 7,52 / 12,14 / 23,10 MB | Apache 2.0 |
| EfficientDet-Lite0 | EfficientNet-Lite0 + BiFPN | no disponible en la informacion | no disponible | no disponible | Apache 2.0 (MediaPipe) |
| EfficientDet-Lite1 | EfficientNet-Lite1 + BiFPN | no disponible en la informacion | no disponible | no disponible | Apache 2.0 (MediaPipe) |
| SSD MobileNet V2 (COCO) | MobileNetV2 + SSD | no disponible en la informacion | no disponible | no disponible | Apache 2.0 (TF Model Zoo) |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la informacion proporcionada para cuantificar las diferencias frente a Lite0, Lite1 u otros detectores ligeros.

## Limitaciones y advertencias

- Solo detecta las 80 clases COCO sobre 90 ranuras de etiqueta; cualquier objeto fuera de ese vocabulario no sera reconocido.
- Modelo de vision sin capacidades linguisticas, de razonamiento o de generacion; no debe evaluarse como modelo de lenguaje.
- Resolucion de entrada fija de 448 x 448; imagenes de otras dimensiones deben redimensionarse, lo que puede degradar objetos muy pequenos o muy grandes.
- Riesgo de falsos positivos y negativos inherente a detectores ligeros; las 37.629 cajas candidatas requieren postprocesado (NMS y umbral de confianza) para resultados utilizables.
- La variante int8 introduce error de cuantizacion; para maxima fidelidad numerica debe usarse float32 (23,10 MB).
- No se documentan sesgos especificos del dataset COCO mas alla de los conocidos del propio benchmark (posible infrarrepresentacion de ciertas categorias y contextos geograficos).
- Licencia Apache 2.0: permite uso comercial con atribucion y conservacion del aviso de licencia; no se imponen restricciones adicionales conocidas.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y no se publican metricas de rendimiento ni latencia; conviene validar en el hardware objetivo antes de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite2
- Modelo int8: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite2/blob/main/efficientdet_lite2_int8.tflite
- Modelo float16: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite2/blob/main/efficientdet_lite2_float16.tflite
- Modelo float32: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite2/blob/main/efficientdet_lite2_float32.tflite
- Label map: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-EfficientDet-Lite2/blob/main/labelmap.txt
- Documentacion MediaPipe Object Detector: https://developers.google.com/edge/mediapipe/solutions/vision/object_detector
- Documentacion LiteRT: https://developers.google.com/edge/litert
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/object_detector
- Paper EfficientDet: https://arxiv.org/abs/1911.09070
