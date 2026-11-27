# dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-3x` es un detector de objetos Faster R-CNN con backbone ResNet-50 y cuello FPN, entrenado sobre el conjunto de datos BDD100K para escenas de conduccion. No es un modelo de lenguaje: es un checkpoint de vision por computador publicado en Hugging Face por el usuario `dronefreak`, que actua como espejo (mirror) de un modelo del zoo oficial de SysCV (ETH Zurich). El host original de SysCV (`dl.cv.ethz.ch`) esta caido, y los pesos se recuperaron desde la Wayback Machine con captura del 19 de febrero de 2025.

El modelo resuelve la tarea de deteccion de objetos en imagenes de trafico real, con diez clases propias de BDD100K: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico. Su relevancia actual es fundamentalmente practica: proporciona un baseline reproducible y verificado (MD5 coincidente con el original, reproduccion exacta de las predicciones de validacion) para investigacion en conduccion autonoma y para pipelines de deteccion que necesiten un punto de partida solido sin depender de infraestructura caida.

El checkpoint contiene 41.447.426 parametros y ocupa 0,4 GB en el repositorio. La entrada nativa es de 1280x720 píxeles, sin redimensionado, y el modelo se distribuye en formato safetensors junto con la configuracion de mmdetection 2.x. La licencia hereda las restricciones de BDD100K, lo que limita su uso a fines educativos, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone ResNet-50 y FPN (Feature Pyramid Network) |
| Parametros totales | 41.447.426 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280x720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | BDD100K (educational, research and not-for-profit use); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`); tambien se conserva el `.pth` original |

## Arquitectura y entrenamiento

Faster R-CNN es un detector de dos etapas: una red de propuesta de regiones (RPN) genera candidatos y una cabeza de clasificacion y regresion refina cada propuesta. El backbone es ResNet-50 inicializado con pesos de ImageNet (`torchvision://resnet50`), acoplado a un FPN que combina caracteristicas multi-escala para detectar objetos de tamanos muy distintos, algo critico en escenas de trafico donde conviven peatones lejanos y autobuses cercanos.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (esquema 3x), con SGD de learning rate 0,04, weight decay 0,0001, decaimiento en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). En inferencia se usa umbral de score 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen, con un coste de aproximadamente 1,6 s por imagen en 8 hilos de CPU. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no es un modelo generativo.

## Capacidades

- Deteccion de objetos en imagenes RGB de escenas de conduccion, con diez clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Salida en formato BDD100K mediante la opcion `--json`, lo que facilita la evaluacion con las herramientas oficiales del dataset.
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video y webcam (opcion `0 --show`).
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y limite de frames para video (`--max-frames`).
- Ejecucion en CPU y en GPU (entorno con CUDA 11.8 o CPU segun requirements).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector de objetos.

## Casos de uso

- Deteccion de peatones y vehiculos en video de trafico: el modelo procesa ficheros de video completos y emite detecciones por frame, adecuado para analisis offline de grabaciones de camaras de vigilancia o dashcams.
- Baseline de investigacion en conduccion autonoma: sirve como referencia reproducible para comparar nuevos detectores sobre BDD100K, con predicciones de validacion verificadas y MD5 coincidente con el original de SysCV.
- Etiquetado asistido (pre-anotacion): las detecciones con umbral bajo (0,05) y hasta 100 cajas por imagen pueden usarse para pre-anotar nuevos datos y reducir el coste de anotacion manual, revisando despues con herramientas de BDD100K.
- Analisis de escenas nocturnas y diurnas: la model card incluye demos sobre clips de dia y de noche, lo que permite evaluar el comportamiento en condiciones de iluminacion adversas antes de desplegar.
- Monitorizacion de trafico en tiempo casi real sobre CPU: con 1,6 s por imagen en 8 hilos, es viable para procesos por lotes o vigilancia de baja frecuencia sin GPU dedicada.
- Reproduccion de experimentos academicos: el repositorio incluye entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, Python 3.10) y script de inferencia, lo que facilita replicar resultados en maquinas nuevas.
- Integracion en pipelines de mmdetection: al conservar la configuracion original de SysCV, puede cargarse directamente en flujos de entrenamiento y evaluacion de mmdetection 2.x.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de score de SysCV), en AP estilo COCO sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32,3 | 57,5 | 30,8 | 15,7 | 37,5 | 52,8 |
| test | 31,4 | 55,1 | 30,9 | 16,3 | 38,1 | 47,5 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 35,4 |
| rider | 26,7 |
| car | 51,9 |
| truck | 46,8 |
| bus | 48,0 |
| train | 0,0 |
| motorcycle | 24,7 |
| bicycle | 25,8 |
| traffic light | 24,6 |
| traffic sign | 39,1 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 41,4 M de parametros en precision completa y entrada de 1280x720, el consumo es moderado y cabe holgadamente en GPUs de consumo, aunque no se documenta una cifra concreta.
- GPU recomendadas: no se especifican; el autor solo indica que el entorno CUDA 11.8 esta disponible y que la verificacion se hizo en CPU (el entorno CUDA "not yet tested").
- Cabe en GPU de consumo: si, por el tamano del modelo (0,4 GB de pesos), aunque la latencia real en GPU no esta documentada.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10; script `infer.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector).
- Latencia y throughput: aproximadamente 1,6 s por imagen en 8 hilos de CPU; sin datos de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | AP val (BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN R50-FPN 3x) | 41,4 M | 1280x720 | 32,3 | BDD100K (solo investigacion) | Hugging Face, verificado |
| Otros detectores del zoo SysCV | no disponible | no disponible | no disponible | no disponible | host original caido |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos heredan la licencia de BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro; el uso comercial requiere revisar los terminos del dataset.
- Clase `train` con AP 0,0 en validacion: el modelo no detecta trenes de forma util, probablemente por escasez de ejemplos; no debe usarse para esa clase en produccion.
- Rendimiento modesto en objetos pequenos (APs 15,7) y en clases minoritarias (motorcycle 24,7, bicycle 25,8, traffic light 24,6), lo que limita su uso en escenas densas o con objetos lejanos.
- Entorno CUDA no probado por el autor: la verificacion se hizo en CPU; el rendimiento y la estabilidad en GPU no estan confirmados.
- Dependencia de un stack antiguo: mmdetection 2.x con torch 2.0.1 y mmcv-full 1.7.2, lo que puede complicar la integracion en proyectos modernos.
- Riesgo de falsos positivos y negativos inherente a un detector de dos etapas con umbral bajo (0,05) en evaluacion; en produccion conviene ajustar el umbral de score.
- Sesgos potenciales derivados de BDD100K: el dataset esta sesgado geograficamente (principalmente Estados Unidos) y las condiciones de captura pueden no representar otras regiones.
- No apto para tareas linguisticas, de razonamiento ni de agentes: cualquier uso fuera de deteccion de objetos en imagenes de trafico es inadecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-3x
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_r50_fpn_3x_det_bdd100k.py
- Paper Faster R-CNN (NeurIPS 2015): https://arxiv.org/abs/1506.01497
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-3x/blob/main/LICENSE.txt
