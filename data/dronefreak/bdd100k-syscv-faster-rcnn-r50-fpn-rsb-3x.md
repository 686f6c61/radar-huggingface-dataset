# dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-rsb-3x

## Resumen

Faster R-CNN con backbone ResNet-50 y FPN, entrenado con el procedimiento ResNet Strikes Back (RSB) sobre el dataset BDD100K para deteccion de objetos en escenas de conduccion. El modelo original procede del zoo de modelos de SysCV (ETH Zurich) y este repositorio es un espejo creado por el usuario dronefreak, ya que el host original `dl.cv.ethz.ch` esta fuera de linea; los pesos se recuperaron de una captura de Wayback Machine del 19 de febrero de 2025. El repositorio anade un entorno de dependencias fijado y un script de inferencia.

El modelo resuelve la deteccion de diez clases de objetos relevantes para conduccion autonoma (peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico) sobre imagenes de 1280x720, el tamano nativo de BDD100K. Es relevante para investigadores que necesitan reproducir resultados del benchmark BDD100K con un checkpoint verificado por MD5 y con un pipeline reproducible.

Arquitectura de dos etapas (Faster R-CNN) con extractor de caracteristicas ResNet-50 y Feature Pyramid Network. Cuenta con 41.447.426 parametros y un tamano de repositorio de 0.5 GB. No es un modelo de lenguaje: es un detector de objetos puro, sin capacidades de generacion de texto ni contexto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone ResNet-50 y FPN |
| Parametros totales | 41.447.426 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 1280x720) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | bdd100k (uso educativo, investigacion y sin animo de lucro; config Apache-2.0) |
| Formato de pesos | safetensors (tambien `.pth` original) |

## Arquitectura y entrenamiento

Faster R-CNN es un detector de objetos de dos etapas: una red de propuesta de regiones (RPN) genera candidatos y una cabeza de clasificacion y regresion refina las cajas. El backbone es ResNet-50 inicializado con pesos ImageNet del procedimiento RSB (`resnet50_8xb256-rsb-a1-600e_in1k`), aumentado con una Feature Pyramid Network para detectar objetos a multiples escalas.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (esquema 3x), con AdamW, learning rate 0.0002, weight decay 0.05, decaimiento en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas desde (1280, 600) hasta (1280, 720). La entrada es de 1280x720 sin redimensionado, en RGB con media y desviacion estandar de ImageNet. En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen. El procedimiento RSB se describe en el paper "ResNet strikes back: An improved training procedure in timm" (arXiv:2110.00476).

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion en las diez clases de BDD100K: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video o webcam (segun el script `infer.py`).
- Exportacion de resultados en formato BDD100K mediante la opcion `--json`.
- Ajuste del umbral de score (`--score-thr`, por defecto 0.3) y limite de frames procesados (`--max-frames`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.

## Casos de uso

- Reproduccion de resultados del benchmark BDD100K: sirve como checkpoint de referencia verificado por MD5 para comparar nuevas arquitecturas de deteccion contra la linea base de SysCV en el split de validacion.
- Investigacion en conduccion autonoma: permite evaluar la deteccion de peatones, vehiculos y senales de trafico en condiciones diurnas y nocturnas, con un pipeline reproducible y dependencias fijadas.
- Prototipado de sistemas de asistencia a la conduccion: el modelo puede integrarse en un pipeline de percepcion para identificar obstaculos y senales en video de camara frontal a 1280x720.
- Analisis de video de trafico: procesando ficheros de video con `infer.py` y exportando detecciones en formato BDD100K para analisis posterior de flujos y ocupacion.
- Docencia y formacion: el entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, Python 3.10) facilita montar practicas reproducibles sobre deteccion de objetos con mmdetection 2.x.
- Generacion de pseudo-etiquetas: las detecciones con umbral ajustable pueden usarse para pre-etiquetar imagenes de escenas de conduccion antes de una revision manual.
- Validacion de pipelines de despliegue: con 1,7 s por imagen en 8 hilos de CPU, sirve como referencia de linea base en CPU antes de optimizar con GPU.

## Benchmarks y rendimiento

Resultados COCO-style box AP (%) en BDD100K, segun los ficheros de scores de SysCV:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32.5 | 58.1 | 30.7 | 15.6 | 37.2 | 53.6 |
| test | 31.4 | 55.5 | 30.8 | 16.0 | 37.4 | 48.5 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 35.5 |
| rider | 27.5 |
| car | 51.0 |
| truck | 45.1 |
| bus | 48.1 |
| train | 2.5 |
| motorcycle | 25.9 |
| bicycle | 25.7 |
| traffic light | 24.8 |
| traffic sign | 38.7 |

El model-index declara un Box AP de 32.48 en validacion (no verificado). Nota: la clase train presenta un AP muy bajo (2.5), probablemente por su escasa representacion en el dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 41,4 M de parametros y entrada 1280x720, el checkpoint es ligero (repositorio de 0.5 GB) y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con suficiente memoria para un detector ResNet-50 a 1280x720 deberia ser viable. El entorno CUDA probado es `env/requirements-cu118.txt` (CUDA 11.8).
- Cabe en GPU de consumo: si, por el tamano del modelo; el autor no ha publicado mediciones especificas por GPU.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10; el repositorio incluye `infer.py` para imagen, carpeta, video y webcam, y entornos separados para CPU (`env/requirements-cpu.txt`) y GPU CUDA 11.8 (`env/requirements-cu118.txt`).
- Latencia: 1,7 s por imagen en 8 hilos de CPU segun el autor; el rendimiento en GPU no ha sido medido ("CUDA environment not yet tested"). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN R50-FPN RSB 3x) | 41,4 M | 1280x720 | 32.5 | bdd100k (uso no comercial) | Hugging Face (espejo) |
| Otros detectores del zoo SysCV BDD100K | no disponible | no disponible | no disponible | no disponible | host original fuera de linea |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de otros detectores comparables (por ejemplo, variantes de la familia YOLO o DETR entrenadas en BDD100K) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia BDD100K: los pesos solo permiten uso educativo, de investigacion y sin animo de lucro; el uso comercial esta restringido. La config de SysCV es Apache-2.0, pero los pesos derivados de BDD100K quedan sujetos a la licencia del dataset.
- El modelo solo detecta las diez clases de BDD100K; no reconoce otras categorias de objetos.
- Rendimiento muy bajo en la clase train (AP 2.5) y limitado en objetos pequenos (APs 15.6 en validacion).
- Entrada fija de 1280x720: imagenes con otra resolucion o relacion de aspecto requeriran transformacion, lo que puede afectar a la precision.
- No es un modelo de lenguaje: no tiene capacidades de texto, dialogo, razonamiento simbolico ni tool calling.
- Reproducibilidad "cercana, no exacta": en 20 imagenes aleatorias de validacion, 702 de las 703 cajas publicadas por SysCV son identicas en esta copia, con una diferencia maxima de score de 0.0118; la causa no fue investigada.
- El entorno CUDA no ha sido probado por el autor; solo se ha verificado la inferencia en CPU.
- Riesgo de sesgo: el dataset BDD100K esta sesgado hacia escenas de conduccion en determinadas regiones y condiciones; el modelo puede fallar en condiciones meteorologicas o geograficas poco representadas.
- Riesgo de alucinacion en sentido figurado: falsos positivos y cajas erroneas en escenas complejas; el umbral de score por defecto (0.3) es un compromiso que conviene ajustar segun la aplicacion.
- El host original de los pesos esta fuera de linea; este repositorio depende de una recuperacion via Wayback Machine, lo que anade un riesgo de procedencia a tener en cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-rsb-3x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-rsb-3x/blob/main/LICENSE.txt
- Zoo de modelos SysCV BDD100K: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_r50_fpn_rsb_3x_det_bdd100k.py
- Paper del metodo (ResNet strikes back, arXiv:2110.00476): https://arxiv.org/abs/2110.00476
- Pesos ImageNet del backbone RSB: https://download.openmmlab.com/mmclassification/v0/resnet/resnet50_8xb256-rsb-a1-600e_in1k_20211228-20e21305.pth
- Dataset BDD100K (referencia): https://huggingface.co/datasets/dronefreak/BDD100K
