# dronefreak/bdd100k-syscv-retinanet-r50-fpn-rsb-1x

## Resumen

RetinaNet R50-FPN RSB 1x sobre BDD100K es un detector de objetos de una etapa para escenas de conduccion, publicado originalmente en el zoo de modelos de SysCV (ETH Zurich) y replicado en Hugging Face por el usuario `dronefreak`. El checkpoint se entreno sobre el split de entrenamiento de BDD100K (70.000 imagenes) con un backbone ResNet-50 inicializado con pesos ImageNet del procedimiento ResNet Strikes Back (RSB), y una cabeza FPN con 10 clases de trafico: peatones, ciclistas, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico.

El modelo resuelve la deteccion de objetos en imagenes y video de conduccion a resolucion nativa 1280 x 720, sin reescalado, lo que lo hace util para pipelines de percepcion en vehiculos autonomos y analisis de escenas viales. Su relevancia actual es practica: el host original de SysCV (`dl.cv.ethz.ch`) esta caido, y este repositorio recupera los pesos desde la Wayback Machine (captura del 19 de febrero de 2025), verifica el MD5 contra el fichero original y anade un entorno fijado y un script de inferencia listo para usar.

Con 36,5 millones de parametros, es un modelo compacto y ligero que corre a 0,04 s/imagen en una RTX 4070 SUPER y a 1,1 s/imagen en 8 hilos de CPU. No es un modelo de lenguaje ni un modelo fundacional multimodal: es un detector clasico de una etapa, util como referencia reproducible para investigacion en deteccion sobre BDD100K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet de una etapa con backbone ResNet-50 y FPN (feature pyramid network) |
| Parametros totales | 36.569.662 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth` en precision original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | bdd100k (uso educativo, investigacion y sin animo de lucro) |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` original |

## Arquitectura y entrenamiento

RetinaNet es un detector denso de una etapa que combina un backbone convolucional con una FPN para predecir cajas y clases en multiples escalas. En este caso el backbone es ResNet-50 inicializado con pesos ImageNet del procedimiento RSB (`resnet50_8xb256-rsb-a1-600e_in1k`), y la cabeza FPN produce predicciones sobre 10 clases de BDD100K. La entrada es 1280 x 720, la resolucion nativa del dataset, sin reescalado, con normalizacion ImageNet (media y desviacion tipica). En test se aplica umbral de score 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen.

El entrenamiento se realizo sobre el split train de BDD100K (70.000 imagenes) durante 12 epocas (esquema 1x), con AdamW, learning rate 0,0001, weight decay 0,05, decaimiento del learning rate en las epocas 8 y 11, y batch 32 (8 GPUs x 4 imagenes). La configuracion proviene del repositorio de SysCV (Apache-2.0) y se ha fusionado en `original_config.py`; `config.py` la hereda sin cambios. La innovacion tecnica destacable no esta en el modelo en si, sino en el proceso de recuperacion: los pesos se obtuvieron del archivo de Internet, se verifico que el MD5 (`d9c101797ea515ebda3b2dcfa396eb8c`) coincide con el fichero original de SysCV y que todas las claves cargan en la configuracion original. La verificacion de equivalencia es "cercana, no exacta": en 20 imagenes aleatorias de validacion, 1871 de 1984 cajas coinciden de forma identica y 1875 coinciden con IoU >= 0,5; la causa de la discrepancia es desconocida.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion, con 10 clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Deteccion sobre video: el script `infer.py` acepta ficheros de video y webcam (indice de dispositivo) ademas de imagenes o carpetas de imagenes.
- Salida en formato BDD100K (`--json out.json`) ademas de las visualizaciones.
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y limite de frames (`--max-frames N`) para video.
- Ejecucion en GPU (CUDA 11.8) y en CPU (entorno `requirements-cpu.txt`).
- Carga de pesos con `torch.load(weights_only=True)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector de objetos.

## Casos de uso

- Percepcion en vehiculos autonomos y ADAS: el modelo detecta peatones, vehiculos, ciclistas y senalizacion en imagenes de 1280 x 720 a resolucion nativa, lo que permite alimentar modulos de planificacion de trayectoria con bounding boxes y scores por clase.
- Analisis de video de trafico: con `infer.py` sobre ficheros de video, se pueden extraer detecciones frame a frame para estudios de afluencia, conteo de vehiculos o deteccion de incidentes en grabaciones de camaras de vigilancia vial.
- Benchmarking y reproduccion de investigacion: sirve como linea base reproducible para comparar nuevas arquitecturas de deteccion sobre BDD100K, con la ventaja de que los pesos originales estan verificados por MD5 y la configuracion esta fijada.
- Prototipado rapido en CPU: con 1,1 s/imagen en 8 hilos, permite validar pipelines de deteccion en entornos sin GPU antes de escalar a produccion.
- Etiquetado asistido (active learning): las detecciones con umbral bajo pueden preanotar imagenes nuevas de escenas viales para su revision humana, reduciendo el coste de anotacion.
- Analisis de escenas nocturnas y diurnas: el modelo se entreno sobre BDD100K, que incluye condiciones de iluminacion diversas, y el repositorio incluye una demo con clips de dia y de noche.
- Integracion en sistemas de monitorizacion de flotas: procesamiento por lotes de imagenes de dashcam para clasificar y localizar objetos relevantes en la via.

## Benchmarks y rendimiento

Resultados declarados por SysCV (Box AP en %, estilo COCO) sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 29,5 | 53,9 | 27,5 | 11,5 | 35,0 | 51,9 |
| test | 28,7 | 51,9 | 27,2 | 12,1 | 35,4 | 46,6 |

AP por clase en validacion:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 31,1 | 24,0 | 48,6 | 42,3 | 44,9 | 0,0 | 21,1 | 23,7 | 23,1 | 36,5 |

Nota: el valor de mAP declarado en el model-index (29,52) corresponde al Box AP de validacion reportado por SysCV y no esta verificado de forma independiente por el autor del espejo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 36,5 millones de parametros y entrada 1280 x 720, el consumo es moderado y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 4070 SUPER (medida por el autor: 0,04 s/imagen), y por tamano cualquier GPU con al menos 8 GB de VRAM es suficiente; A100 y H100 no son necesarias.
- Cabe en GPU de consumo: si, incluidas RTX 4070 SUPER y modelos equivalentes o superiores.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2, torch 2.0.1 y Python 3.10 (entorno fijado en `env/requirements-cu118.txt` para CUDA 11.8 y `env/requirements-cpu.txt` para CPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,04 s/imagen en RTX 4070 SUPER (aproximadamente 25 imagenes/s) y 1,1 s/imagen en 8 hilos de CPU.

## Comparativa con modelos similares

No se dispone de datos de otros detectores comparables en la informacion proporcionada (ni resultados de Faster R-CNN, YOLO u otros sobre BDD100K en este repositorio). La comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto/entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaNet R50-FPN RSB 1x (este) | 36,5 M | 1280 x 720 | 29,5 | bdd100k (no comercial) | Hugging Face |
| Otros detectores del zoo SysCV | no disponible | no disponible | no disponible | no disponible | host original caido |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se entrenaron sobre BDD100K y heredan su licencia, que permite uso educativo, de investigacion y sin animo de lucro; el uso comercial no esta permitido sin autorizacion.
- Clase `train` con AP 0,0 en validacion: el modelo no detecta trenes de forma fiable, probablemente por escasez de ejemplos en el dataset.
- Rendimiento bajo en objetos pequenos (APs 11,5 en validacion) y en clases minoritarias como motorcycle (21,1), bicycle (23,7) y traffic light (23,1).
- Equivalencia no exacta con las predicciones originales de SysCV: 1871 de 1984 cajas identicas en la muestra de verificacion; la causa es desconocida y persiste en GPU y CPU.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion adversas, oclusiones o dominios distintos al de BDD100K (el modelo no se ha evaluado fuera de ese dataset).
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; cualquier uso conversacional o multimodal esta fuera de su alcance.
- El repositorio es un espejo no oficial; la fuente primaria (SysCV) esta caida, por lo que la trazabilidad depende de la captura de Wayback Machine y del MD5 verificado.
- Entorno de ejecucion antiguo: mmdetection 2.x con torch 2.0.1 y Python 3.10; requiere un entorno virtual limpio y no es compatible con stacks modernos sin adaptacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-r50-fpn-rsb-1x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-r50-fpn-rsb-1x/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K models (deteccion): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_r50_fpn_rsb_1x_det_bdd100k.py
- Paper del metodo (ResNet Strikes Back): https://arxiv.org/abs/2110.00476
- Pesos ImageNet del backbone (RSB A1): https://download.openmmlab.com/mmclassification/v0/resnet/resnet50_8xb256-rsb-a1-600e_in1k_20211228-20e21305.pth
- Dataset BDD100K (paper CVPR 2020): https://arxiv.org/abs/1805.04687
