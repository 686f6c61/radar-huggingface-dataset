# dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w32-3x

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un checkpoint de deteccion de objetos para escenas de conduccion: un Faster R-CNN con backbone HRNetV2p-W32 y cuello HRFPN, entrenado sobre el conjunto de datos BDD100K. El modelo original procede del zoo de modelos de SysCV (ETH Zurich), y este repositorio de Hugging Face es un espejo creado por el usuario `dronefreak` que recupera los pesos desde la Wayback Machine, ya que el host original `dl.cv.ethz.ch` esta fuera de linea. Incluye ademas un entorno fijado y un script de inferencia.

La relevancia practica es doble. Por un lado, restaura la disponibilidad de un checkpoint de referencia para la tarea de deteccion de objetos en BDD100K, con verificacion de pesos mediante MD5 y reproduccion exacta de las predicciones publicadas por SysCV. Por otro, empaqueta el modelo con una pila de dependencias concreta (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2 sobre Python 3.10), lo que evita el clasico problema de reproducibilidad de los proyectos basados en mmdetection 2.x.

El modelo detecta diez clases de trafico (peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico) sobre imagenes de 1280 x 720, el tamano nativo de BDD100K. Su interes principal es como linea base reproducible para investigacion en conduccion autonoma y como componente de deteccion en pipelines de vision por computador, no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone HRNetV2p-W32 y cuello HRFPN (mmdetection 2.x) |
| Parametros totales | 46.978.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponibles (pesos en safetensors de precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BDD100K (`license: other`), uso educativo, de investigacion y sin animo de lucro |
| Formato de pesos | safetensors (`model.safetensors`), equivalente a los tensores del `.pth` original |
| Tarea | Deteccion de objetos (`object-detection`) |
| Clases | pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign |
| Libreria | mmdetection |
| Tamano del repositorio | 0.6 GB |

## Arquitectura y entrenamiento

El modelo es un detector de dos etapas Faster R-CNN. El backbone es HRNetV2p-W32, una red que mantiene representaciones de alta resolucion en paralelo a lo largo de toda la profundidad y las fusiona en la salida (de ahi el sufijo V2p), lo que resulta adecuado para objetos pequenos en escenas de trafico. Sobre el backbone se anade un cuello HRFPN (High-Resolution Feature Pyramid Network) que combina las distintas ramas de resolucion. La cabeza de deteccion sigue el esquema estandar de Faster R-CNN (RPN mas ROI head). El modelo tiene 46.978.306 parametros.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con SGD, learning rate 0.02, weight decay 0.0001, decaimiento del learning rate en las epocas 24 y 33, batch de 32 (8 GPUs x 2 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). El backbone se inicializa con pesos ImageNet (`open-mmlab://msra/hrnetv2_w32`). La entrada es de 1280 x 720 sin redimensionado, en RGB con media y desviacion estandar de ImageNet. En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen. La configuracion procede del repositorio de SysCV y esta fijada en `original_config.py`.

La innovacion destacable de este repositorio no es arquitectonica, sino de reproducibilidad: el autor verifica que los pesos cargan con `torch.load(weights_only=True)`, comprueba que el MD5 (`41d7529593de309309b458995b3833a2`) coincide con el publicado por SysCV y confirma que, sobre 20 imagenes aleatorias de validacion, se obtienen las mismas 645 cajas y scores que las predicciones oficiales (con la salvedad de que la exportacion de SysCV resta 1 px a `x2` e `y2`).

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion para diez clases de trafico.
- Deteccion sobre video: el script `infer.py` acepta ficheros de video y permite limitar el numero de fotogramas con `--max-frames`.
- Inferencia en directo desde webcam (indice de dispositivo, por ejemplo `0`).
- Salida en formato BDD100K mediante `--json`, lo que facilita la evaluacion y el postprocesado con las herramientas oficiales del dataset.
- Umbral de score configurable (`--score-thr`, por defecto 0.3).
- Ejecucion en CPU y en GPU: el repositorio incluye `env/requirements-cpu.txt` y `env/requirements-cu118.txt`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector puro, sin componente generativo.

## Casos de uso

- Linea base reproducible para investigacion en deteccion sobre BDD100K: sirve para comparar nuevos metodos contra un resultado publicado y verificado (AP 34.0 en val), con pesos y configuracion fijados.
- Deteccion de peatones y vehiculos en video de dashcam: el script `infer.py` procesa ficheros de video directamente y genera detecciones por fotograma, util para prototipos de analisis de trafico o auditoria de escenas.
- Etiquetado asistido (pre-anotacion): las detecciones exportadas en formato BDD100K con `--json` pueden cargarse en herramientas de anotacion para reducir el trabajo manual en nuevos conjuntos de imagenes de conduccion.
- Analisis de escenas nocturnas y diurnas: la model card incluye una demo sobre dos clips de validacion, uno de dia y otro de noche, lo que permite evaluar el comportamiento del detector en condiciones de iluminacion distintas.
- Deteccion de senales y semaforos: las clases `traffic light` y `traffic sign` (AP 25.8 y 40.4 respectivamente) permiten construir modulos de percepcion de senalizacion en proyectos de conduccion autonoma a escala de laboratorio.
- Prototipado en CPU sin GPU dedicada: con las dependencias de `requirements-cpu.txt` y un rendimiento declarado de 2.0 s/imagen en 8 hilos de CPU, es viable para pruebas y demostraciones en maquinas sin acelerador.
- Integracion en pipelines mmdetection existentes: al conservar la configuracion de SysCV, puede incorporarse a flujos de entrenamiento o evaluacion basados en mmdetection 2.x sin reescribir codigo.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de score de SysCV; metrica no verificada de forma independiente en la model card):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 34.0 | 59.5 | 32.9 | 16.7 | 39.1 | 54.1 |
| test | 33.2 | 56.7 | 33.2 | 17.7 | 39.7 | 49.0 |

AP por clase en validacion:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 37.6 | 29.0 | 53.0 | 48.0 | 50.0 | 0.0 | 27.8 | 28.0 | 25.8 | 40.4 |

El valor de mAP declarado en el model-index es 33.97 (Box AP en validacion). No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 46,98 M de parametros y entrada de 1280 x 720, el peso de los pesos en FP32 ronda los 190 MB, pero el consumo real depende de las activaciones del backbone HRNet a alta resolucion y del numero de cajas propuestas.
- GPU recomendadas: no se especifican en la informacion disponible. El repositorio incluye requisitos para CUDA 11.8 (`env/requirements-cu118.txt`), pero el autor indica que el entorno CUDA no ha sido probado.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no se aporta una medicion de VRAM ni una lista de GPUs verificadas.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10; script de inferencia propio (`infer.py`) para imagen, carpeta de imagenes, video o webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 2,0 s por imagen en CPU con 8 hilos (dato declarado). No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN HRNetV2p-W32-HRFPN 3x, BDD100K) | 46,98 M | imagen 1280 x 720 | AP val 34.0 (test 33.2) | BDD100K (uso educativo/investigacion) | Hugging Face, espejo verificado |
| Otros detectores del zoo SysCV BDD100K | no disponible en la informacion | no disponible | no disponible | Apache-2.0 (config) / BDD100K (pesos) | repositorio GitHub de SysCV |
| Alternativas genericas de deteccion (YOLO, DETR, etc.) | no disponible | no disponible | no disponible | varian segun modelo | no disponible |

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K para establecer una comparacion numerica fiable.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro. El uso comercial requiere revisar los terminos del dataset.
- Clase `train` con AP 0.0 en validacion: el modelo practicamente no detecta trenes, probablemente por su escasa representacion en el dataset.
- Rendimiento bajo en objetos pequenos (APs 16.7 en val) y en clases como semaforos (25.8) y bicicletas (28.0), lo que limita su uso en percepcion de detalle fino.
- Riesgo de falsos positivos y negativos inherente a un detector de dos etapas con umbral de score bajo (0.05 en test); el umbral de inferencia por defecto del script es 0.3 y debe ajustarse segun la aplicacion.
- Entorno CUDA no probado por el autor: la verificacion de pesos y la reproduccion de predicciones se realizaron en CPU. El rendimiento y la estabilidad en GPU no estan confirmados.
- Dependencias antiguas y fijadas (mmdetection 2.x, mmcv-full 1.7.2, torch 2.0.1): requiere un entorno virtual limpio y no es compatible con versiones modernas de mmdetection 3.x.
- Modelo especifico de escenas de conduccion (BDD100K): no es un detector de proposito general y su rendimiento fuera de ese dominio no esta documentado.
- El repositorio es un espejo no oficial; la fuente original (host de ETH Zurich) esta fuera de linea, por lo que la trazabilidad depende de la captura de Wayback Machine y de la comprobacion MD5 incluida.
- No se documentan sesgos demograficos ni geograficos mas alla de los propios del dataset BDD100K (escenas principalmente de Estados Unidos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w32-3x
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w32-3x/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_hrnetv2p_w32_3x_det_bdd100k.py
- Paper de HRNet (Deep High-Resolution Representation Learning for Visual Recognition): https://arxiv.org/abs/1908.07919
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
