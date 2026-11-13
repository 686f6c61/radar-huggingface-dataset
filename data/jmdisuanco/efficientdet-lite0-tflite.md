# jmdisuanco/efficientdet-lite0-tflite

## Resumen

EfficientDet-Lite0 es un detector de objetos ligero desarrollado originalmente por Google Research (equipo AutoML) y distribuido por Google MediaPipe. Este repositorio de Hugging Face, publicado por el usuario jmdisuanco, es un espejo (mirror) del fichero oficial `efficientdet_lite0.tflite` en precision float16, pensado para que la herramienta myPlinx pueda descargarlo desde un host permitido. No se han modificado los pesos.

El modelo resuelve la tarea de deteccion de objetos en imagenes sobre las 80 clases del dataset COCO. Su relevancia radica en el equilibrio entre precision y coste computacional: con aproximadamente 7,25 MB de pesos en float16, esta disenado para inferencia en dispositivos de borde (moviles, Raspberry Pi, navegadores) mediante el runtime MediaPipe, sin necesidad de GPU dedicada.

La arquitectura sigue la familia EfficientDet con un backbone EfficientNet-Lite y un modulo de fusion bi-direccional de caracteristicas (BiFPN) escalado para el nivel "Lite0", el mas pequeno de la familia. El fichero incluye las etiquetas de las 80 clases COCO embebidas y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite0 (backbone EfficientNet-Lite + BiFPN + cabecera de deteccion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | float16 (fichero publicado); el linaje upstream incluye variantes int8 |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (`.tflite`, 7.254.339 bytes, sha256 `4b59100025bea1235a84c1038879a6cccc9f6c49f5e41144e91e74d99e780993`) |

## Arquitectura y entrenamiento

EfficientDet-Lite0 combina un backbone convolucional EfficientNet-Lite (variante optimizada para moviles, sin operaciones no soportadas por aceleradores de borde) con una red de piramide de caracteristicas ponderada bi-direccional (BiFPN) y cabeceras de clasificacion y regresion de cajas ancladas. El nivel "Lite0" corresponde al escalado minimo de profundidad y anchura de la familia EfficientDet, priorizando latencia sobre precision.

El modelo esta entrenado sobre el dataset COCO (anotaciones bajo CC BY 4.0), con las 80 clases estandar embebidas en el fichero TFLite. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens (no aplica), composicion exacta del dataset de entrenamiento, ni si se aplicaron tecnicas de RLHF/DPO (no aplica a un detector). Tampoco se documenta en este repositorio si el fichero es byte-identico al artefacto de Kaggle Models del que procede, aunque el autor indica que pertenece al mismo linaje y que no se han modificado los pesos.

## Capacidades

- Deteccion de objetos en imagenes en tiempo real sobre las 80 clases del dataset COCO (persona, vehiculo, animal, objetos cotidianos, etc.).
- Salida de cajas delimitadoras con etiqueta de clase y puntuacion de confianza.
- Inferencia en dispositivos de borde mediante el runtime MediaPipe (CPU, GPU movil, aceleradores NNAPI/CoreML segun plataforma).
- Ejecucion en navegador y en entornos embebidos gracias al formato TFLite y al tamano reducido del fichero.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingues, vision-lenguaje, audio ni modo "thinking".

## Casos de uso

- Deteccion de personas en sistemas de videovigilancia en el borde: el modelo puede ejecutarse en una Raspberry Pi o en una camara IP con acelerador, detectando la clase "person" en cada fotograma sin enviar video a la nube, gracias a sus ~7 MB de pesos.
- Aplicaciones moviles de realidad aumentada: integrado via MediaPipe Tasks, permite superponer informacion sobre objetos detectados (por ejemplo, muebles o vehiculos) en tiempo real en Android e iOS.
- Automatizacion de inventario en retail: procesamiento de fotos de estanterias para contar y localizar productos de las clases COCO, con inferencia local en el dispositivo del operario.
- Filtrado previo en pipelines de vision por computador: usar el detector como etapa de regiones de interes antes de un modelo mas pesado (OCR, clasificacion fina), reduciendo el coste computacional aguas abajo.
- Robots educativos y prototipos de robotica: deteccion de obstaculos y objetos en plataformas con recursos limitados (Jetson Nano, Coral USB Accelerator) mediante MediaPipe.
- Demos web interactivas: ejecucion en el navegador con TensorFlow.js o MediaPipe Web para mostrar deteccion de objetos en directo sin backend, aprovechando el formato TFLite y su reducido tamano.
- Control de calidad en lineas de produccion ligeras: deteccion de presencia/ausencia de objetos en cintas transportadoras con camaras de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de mAP, latencia ni comparativas numericas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso tipico (CPU o acelerador de borde); en GPU dedicada el modelo ocupa unos pocos cientos de MB incluyendo buffers del runtime, pero no se dispone de cifras oficiales en la informacion proporcionada.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Puede acelerarse en GPU moviles (OpenGL/Vulkan), NNAPI (Android), CoreML (iOS) y en aceleradores como Coral Edge TPU (con la variante int8) o Google Pixel.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) con holgura, aunque su uso tipico es en dispositivo.
- Opciones de despliegue: MediaPipe Tasks (Object Detector), TensorFlow Lite Interpreter, TensorFlow Lite en Android/iOS, MediaPipe Web, y conversiones a otros runtimes si se dispone de la variante adecuada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el nivel "Lite0" esta disenado para decenas de milisegundos por fotograma en moviles de gama media, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientDet-Lite0 (este repo) | no disponible | no aplica | Deteccion de objetos COCO | Apache-2.0 | Hugging Face (mirror) y MediaPipe upstream |
| EfficientDet-Lite1/Lite2 | no disponible | no aplica | Deteccion de objetos COCO | Apache-2.0 | MediaPipe / Kaggle Models |
| YOLOv8n | no disponible | no aplica | Deteccion de objetos COCO | AGPL-3.0 (Ultralytics) | GitHub / Ultralytics |
| MobileNet-SSD | no disponible | no aplica | Deteccion de objetos COCO | Apache-2.0 | TensorFlow Model Zoo |

No se dispone de datos numericos de mAP ni latencia en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Solo detecta las 80 clases del dataset COCO; cualquier objeto fuera de ese vocabulario no sera reconocido.
- No se ha verificado que el fichero sea byte-identico al artefacto oficial de Kaggle Models, aunque el autor indica que pertenece al mismo linaje y que no se han modificado los pesos.
- MediaPipe no publica una model card ni un fichero de licencia especifico para este fichero exacto; la licencia Apache-2.0 se infiere del linaje EfficientDet (Google Research) y del runtime MediaPipe.
- Riesgo de falsos positivos y negativos inherente a un detector de nivel "Lite0" con capacidad limitada; no se aportan metricas de precision en este repositorio.
- Puede presentar sesgos derivados de la distribucion del dataset COCO (sobrerrepresentacion de ciertas categorias y contextos).
- No es un modelo de lenguaje: no soporta generacion de texto, razonamiento, tool calling ni agentes.
- Uso comercial permitido bajo Apache-2.0, siempre que se respeten las atribuciones de EfficientDet (Google Research) y MediaPipe (Google AI Edge); conviene revisar las condiciones del dataset COCO (anotaciones CC BY 4.0) si se redistribuyen derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion comunitaria de este espejo concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jmdisuanco/efficientdet-lite0-tflite
- Fichero original en MediaPipe: https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/latest/efficientdet_lite0.tflite
- EfficientDet (Google Research AutoML): https://github.com/google/automl/tree/master/efficientdet
- Runtime MediaPipe: https://github.com/google-ai-edge/mediapipe
- Documentacion MediaPipe Object Detector: https://ai.google.dev/edge/mediapipe/solutions/vision/object_detector
- EfficientDet Lite0 en Kaggle Models: https://www.kaggle.com/models/tensorflow/efficientdet
- Dataset COCO: https://cocodataset.org/
