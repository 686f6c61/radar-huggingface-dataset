# dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-dconv-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-dconv-3x` es un detector de objetos de dos etapas (Faster R-CNN) con backbone ResNet-50, FPN y convoluciones deformables v2, entrenado sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo generativo ni un LLM: es un checkpoint de vision por computador distribuido en formato mmdetection, con 42.028.268 parametros y un tamano de repositorio de 0,4 GB.

El modelo es un espejo (mirror) de un checkpoint del zoo de modelos de BDD100K mantenido por SysCV (ETH Zurich). El host original `dl.cv.ethz.ch` esta fuera de linea, por lo que los pesos se recuperaron desde la Wayback Machine (captura del 19 de febrero de 2025) y la configuracion y resultados se tomaron del repositorio de GitHub de SysCV. El repositorio anade un entorno de dependencias fijado y un script de inferencia (`infer.py`) que funciona con imagenes, carpetas de imagenes, video y webcam.

Es relevante para desarrolladores e investigadores que necesiten un detector de referencia para escenas de trafico (peatones, vehiculos, senales, semaforos) con un stack clasico y reproducible (PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2), y como base para comparaciones con detectores mas modernos sobre BDD100K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone ResNet-50, FPN y Deformable ConvNets v2 (DCN) |
| Parametros totales | 42.028.268 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (checkpoint en precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de deteccion de objetos, sin procesamiento de lenguaje) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`); uso educativo, investigacion y sin animo de lucro |
| Formato de pesos | safetensors (`model.safetensors`); tambien `.pth` original en `original/` |
| Libreria | mmdetection |
| Pipeline | object-detection |
| Entrada | 1280 x 720 (tamano nativo de BDD100K, sin redimensionado), RGB, media y desviacion tipica de ImageNet |
| Post-proceso | umbral de score 0,05, NMS con IoU 0,5, maximo 100 cajas por imagen |
| Clases | pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign |

## Arquitectura y entrenamiento

La arquitectura es un Faster R-CNN clasico de dos etapas: backbone ResNet-50 inicializado con pesos de ImageNet (`torchvision://resnet50`), Feature Pyramid Network (FPN) para la extraccion multiescala y convoluciones deformables v2 (DCN) segun el paper *Deformable ConvNets v2: More Deformable, Better Results* (CVPR 2019). La cabeza de deteccion sigue el esquema estandar de mmdetection con clasificacion y regresion de cajas por clase.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70k imagenes) durante 36 epocas (esquema 3x), con SGD de momento, learning rate 0,04, weight decay 0,0001, decaimiento en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector de objetos. La innovacion tecnica destacable es el uso de convoluciones deformables v2, que permiten al backbone adaptar los puntos de muestreo a la geometria de los objetos en escenas de trafico.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion en 10 clases: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.
- Inferencia sobre imagenes sueltas, carpetas de imagenes, ficheros de video y flujo de webcam mediante `infer.py`.
- Exportacion de detecciones en formato BDD100K mediante la opcion `--json`.
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y limite de frames para video (`--max-frames`).
- Reproduccion exacta de las predicciones publicadas por SysCV: sobre 20 imagenes aleatorias de validacion, esta copia (en CPU) genera las mismas 688 cajas y scores que las predicciones oficiales (la exportacion de SysCV resta 1 px a `x2` e `y2`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision-lenguaje, audio ni modo de pensamiento; es exclusivamente un detector de objetos.

## Casos de uso

- Deteccion de peatones y vehiculos en video de trafico: el modelo procesa ficheros de video con `infer.py` y devuelve cajas por frame con umbral de score configurable, adecuado para analisis offline de grabaciones de camaras de vigilancia o dashcams.
- Analisis de escenas nocturnas y diurnas: el checkpoint se ha validado sobre clips de BDD100K de dia y de noche, por lo que sirve como referencia en estudios de robustez ante cambios de iluminacion.
- Etiquetado asistido (pre-anotacion) de nuevos conjuntos de datos de conduccion: las detecciones exportadas en formato BDD100K (`--json`) pueden servir como propuestas iniciales para revisores humanos, reduciendo el coste de anotacion.
- Benchmark de referencia para investigacion en deteccion sobre BDD100K: al reproducir exactamente las predicciones de SysCV, permite comparar de forma controlada nuevas arquitecturas o tecnicas de aumento de datos contra una linea base publicada.
- Prototipado de sistemas ADAS en CPU: con 2,8 s por imagen en 8 hilos de CPU, es viable para pruebas de concepto y pipelines por lotes sin GPU dedicada.
- Demostraciones en tiempo real con webcam: la opcion `--show` permite visualizar detecciones sobre el flujo de una camara conectada, util para demos y validacion cualitativa del modelo.
- Educacion y docencia en vision por computador: el repositorio incluye un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) que facilita reproducir el pipeline completo en un curso o practica.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de score de SysCV; el fichero de score de test no estaba archivado y su AP proviene de la tabla del zoo de modelos):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 33,2 | 58,6 | 31,8 | 16,1 | 38,0 | 55,1 |
| test | 32,4 | no disponible | no disponible | no disponible | no disponible | no disponible |

AP por clase en validacion (%):

| Clase | AP |
|---|---|
| pedestrian | 36,0 |
| rider | 27,3 |
| car | 52,2 |
| truck | 48,2 |
| bus | 50,1 |
| train | 0,0 |
| motorcycle | 26,5 |
| bicycle | 27,3 |
| traffic light | 25,0 |
| traffic sign | 39,5 |

Nota: el valor de mAP de 33,21 declarado en el model-index corresponde al Box AP de validacion. La metrica de la clase `train` es 0,0, lo que refleja la escasez de instancias de tren en el conjunto de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; con 42 millones de parametros y entrada de 1280 x 720, el checkpoint es ligero (0,4 GB de pesos) y cabe holgadamente en GPUs de consumo, aunque el requisito exacto depende del framework y del tamano de batch.
- GPU recomendadas: no se especifican en la documentacion; el entorno incluye `env/requirements-cu118.txt` para CUDA 11.8, por lo que se espera compatibilidad con GPUs NVIDIA modernas. El autor indica que el entorno CUDA no se ha probado aun.
- CPU: validado; el modelo tarda aproximadamente 2,8 s por imagen en 8 hilos de CPU.
- Cabe en GPU de consumo: si, por el reducido numero de parametros y el tamano del checkpoint, aunque no se documentan modelos concretos ni cifras de VRAM.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre PyTorch 2.0.1 y Python 3.10; script `infer.py` incluido para imagen, carpeta, video y webcam. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Latencia y throughput: 2,8 s por imagen en CPU con 8 hilos; no se proporcionan cifras de latencia o throughput en GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores sobre BDD100K (por ejemplo, variantes de YOLO, RetinaNet o modelos del propio zoo de SysCV) con los que establecer una comparacion cuantitativa fiable. Los unicos datos comparables son los del propio checkpoint frente a si mismo en distintos splits (val AP 33,2; test AP 32,4).

| Modelo | Parametros | Contexto/entrada | AP val (BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN R50-FPN DCN 3x) | 42.028.268 | 1280 x 720 | 33,2 | BDD100K (uso educativo/investigacion) | Hugging Face (espejo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro; no se permite uso comercial sin autorizacion adicional.
- El host original de los pesos (`dl.cv.ethz.ch`) esta fuera de linea; este repositorio es un espejo recuperado de la Wayback Machine, por lo que la procedencia depende de la integridad de esa captura (aunque se verifica el MD5 `917774cfac6d4466655e7811e21ea0d8` frente al fichero de SysCV).
- Entorno CUDA no probado por el autor: la validacion se ha realizado en CPU; el rendimiento y la estabilidad en GPU no estan verificados en la documentacion.
- Clase `train` con AP 0,0 en validacion: el modelo no detecta trenes de forma fiable en ese split.
- Rendimiento modesto en objetos pequenos (APs 16,1) y en clases minoritarias como motorcycle (26,5), bicycle (27,3) y traffic light (25,0).
- Dependencia de un stack antiguo: mmdetection 2.x con mmcv-full 1.7.2 y PyTorch 2.0.1, lo que puede dificultar la integracion con ecosistemas actuales y requiere un entorno virtual limpio.
- Sin capacidades de lenguaje, razonamiento ni agentes; no debe evaluarse como modelo generativo.
- Riesgo de falsos positivos y negativos inherente a un detector con AP moderado; el umbral de score por defecto (0,3 en `infer.py`, 0,05 en la evaluacion) condiciona fuertemente el numero de cajas devueltas.
- No se documentan sesgos especificos mas alla de los propios del conjunto BDD100K (sesgo geografico y de condiciones de captura del dataset).
- El video de demostracion fue revisado frame a frame para evitar matriculas legibles y rostros identificables; en produccion debe aplicarse un control equivalente por privacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-dconv-3x
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r50-fpn-dconv-3x/blob/main/LICENSE.txt
- Repositorio de modelos de SysCV (BDD100K): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_r50_fpn_dconv_3x_det_bdd100k.py
- Paper del metodo (Deformable ConvNets v2, CVPR 2019): https://arxiv.org/abs/1811.11168
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
