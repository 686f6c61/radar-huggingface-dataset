# dronefreak/bdd100k-syscv-cascade-rcnn-convnext-b-fpn-fp16-3x

## Resumen

Cascade R-CNN ConvNeXt-B-FPN FP16 3x es un detector de objetos de dos etapas especializado en escenas de conduccion, entrenado sobre el conjunto de datos BDD100K. El modelo procede del zoo de modelos oficial de SysCV (grupo de investigacion de ETH Zurich) y este repositorio de Hugging Face es un espejo (mirror) creado por el usuario dronefreak: el host original `dl.cv.ethz.ch` esta fuera de servicio y los pesos se recuperaron de la Wayback Machine (captura del 19 de febrero de 2025), anadiendo un entorno de Python fijado y un script de inferencia.

La arquitectura combina un backbone ConvNeXt-Base (preentrenado en ImageNet-21k) con un cuello FPN y la cabeza en cascada de Cascade R-CNN, todo en un pipeline de mmdetection 2.x. El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (el esquema "3x" de mmdetection) con precision mixta FP16, entrada nativa de 1280x720 y entrenamiento multi-escala. El checkpoint final tiene 132.748.220 parametros y ocupa 2,3 GB en el repositorio.

Su relevancia es practica: es una referencia reproducible para deteccion de trafico (coches, peatones, senales, semaforos, ciclistas) con un AP de caja de 35,77 en validacion, y el espejo resuelve el problema de disponibilidad de unos pesos que ya no se podian descargar desde la fuente original. No es un modelo generativo ni de lenguaje: es un detector puro de vision por computador para conduccion autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN con backbone ConvNeXt-Base y cuello FPN (mmdetection 2.x) |
| Parametros totales | 132.748.220 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280x720) |
| Tipos de cuantizacion | no disponible; pesos en FP16 (entrenamiento con precision mixta) y safetensors |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BDD100K (educational, research y not-for-profit); config de SysCV en Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, mismos tensores que el `.pth` original) |

## Arquitectura y entrenamiento

El modelo es un detector de dos etapas de tipo Cascade R-CNN. El backbone es ConvNeXt-Base, inicializado con pesos de ImageNet-21k (`convnext-base_in21k-pre-3rdparty_32xb128_in1k`), y sobre el se monta un FPN que alimenta la cabeza en cascada de Cascade R-CNN con tres etapas de refinamiento de propuestas. La entrada es la resolucion nativa de BDD100K, 1280x720, sin redimensionado, en RGB con media y desviacion tipica de ImageNet.

El entrenamiento uso las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (esquema 3x), con AdamW, learning rate 0,0001, weight decay 0,05, decaimiento del learning rate en las epocas 27 y 33, batch de 32 (8 GPUs x 4 imagenes segun el README de SysCV), entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720) y precision mixta FP16. En test se aplica un umbral de score de 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. La verificacion del espejo confirma que el MD5 de los pesos (`9d2c9b409365621fdcac8eed50357ade`) coincide con el de SysCV y que todas las claves cargan en la configuracion original; la reproducibilidad numerica es aproximada (74 de 561 cajas identicas en 20 imagenes de validacion en CPU, todas con IoU >= 0,5).

## Capacidades

- Deteccion de objetos en escenas de conduccion con 10 clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Deteccion de cajas delimitadoras en formato COCO (salida compatible con BDD100K mediante `--json`).
- Inferencia sobre imagen suelta, carpeta de imagenes, fichero de video y webcam en directo (`infer.py`).
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y limite de frames (`--max-frames`).
- Funcionamiento en CPU (3,9 s/imagen con 8 hilos) y en GPU NVIDIA con el entorno CUDA 11.8 fijado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision.

## Casos de uso

- Deteccion de trafico en video de dashcam: el modelo procesa ficheros `.mov` frame a frame y emite cajas para vehiculos, peatones y senales, adecuado para analisis offline de grabaciones de conduccion.
- Etiquetado asistido de datasets de conduccion: generar predicciones en formato BDD100K (`--json`) para preanotar nuevas imagenes y reducir el trabajo manual de anotacion.
- Investigacion en conduccion autonoma: servir como baseline reproducible de Cascade R-CNN + ConvNeXt sobre BDD100K para comparar nuevas arquitecturas con el AP de referencia de 35,77 en validacion.
- Monitorizacion de cruces y vias urbanas: con umbral de score ajustado, detectar peatones y ciclistas en imagenes fijas de camaras de trafico para estudios de seguridad vial.
- Prototipado en CPU sin GPU: gracias a los 3,9 s/imagen en 8 hilos de CPU, permite validar pipelines de deteccion en maquinas sin acelerador antes de escalar a GPU.
- Analisis de escenas nocturnas y diurnas: el autor verifico el modelo sobre clips de dia y de noche de BDD100K, lo que lo hace util para estudios de robustez ante cambios de iluminacion.
- Docencia y reproduccion de experimentos: el entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, mmcls 0.25.0, Python 3.10) facilita reproducir la inferencia sin conflictos de dependencias.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de score de SysCV), AP de caja estilo COCO sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 35,8 | 61,0 | 35,7 | 17,3 | 38,9 | 59,5 |
| test | 35,0 | 58,7 | 35,4 | 18,1 | 40,3 | 54,1 |

AP por clase (val):

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 39,4 | 30,1 | 53,4 | 46,3 | 50,1 | 12,0 | 29,2 | 29,0 | 26,7 | 41,4 |

El valor registrado en el model-index es un Box AP de 35,77 en validacion, marcado como no verificado (`verified: false`). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 132,7 M de parametros en FP16 el peso de los pesos ronda los 265 MB, pero la activacion a 1280x720 con FPN y cabeza en cascada eleva el consumo real de GPU de forma notable (no cuantificado en la informacion).
- GPU recomendadas: no se especifican en la model card; el entorno fijado es CUDA 11.8 y el autor indica que el entorno CUDA no se ha probado todavia.
- CPU: funciona sin GPU, con 3,9 s/imagen en 8 hilos (umbral de score 0,05, NMS IoU 0,5, maximo 100 cajas).
- Cabe en GPU de consumo: no confirmado; el peso de los parametros es pequeno, pero el coste de activacion a resolucion nativa no esta medido en la informacion disponible.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2, torch 2.0.1 y mmcls 0.25.0 sobre Python 3.10; script `infer.py` incluido. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 3,9 s/imagen en CPU; no hay datos de latencia en GPU.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de modelos comparables (otros detectores de BDD100K del zoo de SysCV u otras familias) con sus metricas, parametros y licencias, por lo que la comparativa cuantitativa no esta disponible. Como referencia interna, el propio zoo de SysCV contiene otras variantes de deteccion sobre BDD100K, pero sus cifras no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K (educational, research y not-for-profit); el uso comercial no esta permitido sin autorizacion. La config de SysCV es Apache-2.0, pero los pesos entrenados no.
- Reproducibilidad aproximada: en la verificacion del espejo solo 74 de 561 cajas coinciden exactamente con las predicciones publicadas de SysCV; el resto coincide con IoU >= 0,5 y la diferencia maxima de score es 0,0483. El autor no investigo la causa.
- Entorno CUDA no probado: el autor indica explicitamente que el entorno CUDA no se ha testeado; solo se verifico la inferencia en CPU.
- Clase `train` con rendimiento muy bajo (AP 12,0) y clases minoritarias como traffic light (26,7) y motorcycle/bicycle (en torno a 29) claramente por debajo de car (53,4); el modelo falla mas en objetos pequenos (APs 17,3).
- Dominio limitado: entrenado solo con imagenes de conduccion de BDD100K; el rendimiento fuera de ese dominio (otras camaras, paises, condiciones meteorologicas extremas) no esta evaluado.
- Riesgo de falsos positivos y negativos con umbrales bajos: el umbral de test por defecto de 0,05 produce hasta 100 cajas por imagen; en produccion conviene subir el umbral.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no es adecuado para tareas fuera de la deteccion de objetos.
- Disponibilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un espejo no oficial mantenido por un tercero, no por SysCV.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-convnext-b-fpn-fp16-3x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-convnext-b-fpn-fp16-3x/blob/main/LICENSE.txt
- Repositorio de modelos de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV usada: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/cascade_rcnn_convnext-b_fpn_fp16_3x_det_bdd100k.py
- Paper de ConvNeXt (A ConvNet for the 2020s, CVPR 2022): https://arxiv.org/abs/2201.03545
- Pesos de inicializacion ConvNeXt-Base ImageNet-21k: https://download.openmmlab.com/mmclassification/v0/convnext/convnext-base_in21k-pre-3rdparty_32xb128_in1k_20220124-eb2d6ada.pth
- Dataset BDD100K (espejo usado): https://huggingface.co/datasets/dronefreak/BDD100K
