# dronefreak/bdd100k-syscv-cascade-rcnn-r101-fpn-3x

## Resumen

Cascade R-CNN R101-FPN 3x sobre BDD100K es un detector de objetos de dos etapas especializado en escenas de conduccion, publicado como espejo del zoo de modelos de SysCV (ETH Zurich). El checkpoint original estaba alojado en `dl.cv.ethz.ch`, un host actualmente fuera de linea, por lo que el autor del repositorio (`dronefreak`) recupero los pesos desde la Wayback Machine (captura del 19 de febrero de 2025) y los redistribuye junto con la configuracion de SysCV, un entorno Python fijado y un script de inferencia (`infer.py`) que acepta imagenes, carpetas, video o webcam.

Tecnicamente es un detector clasico basado en Cascade R-CNN (CVPR 2018) con backbone ResNet-101 y cuello FPN, entrenado con el esquema 3x (36 epocas) sobre las 70.000 imagenes del split de entrenamiento de BDD100K. No es un modelo generativo ni un modelo de lenguaje: es un detector puro de cajas delimitadoras, sin mascaras ni segmentacion, con 88.276.988 parametros y un unico cabezal de clasificacion de objetos de trafico.

Su relevancia actual es practica: el zoo original de SysCV es un punto de referencia habitual en investigacion sobre conduccion autonoma y deteccion en dominios adversos (noche, lluvia, deslumbramiento), y este espejo restituye un checkpoint que de otro modo resultaba inaccesible. El autor verifica reproduccion exacta contra las predicciones publicadas por SysCV en 20 imagenes de validacion (659 cajas identicas en CPU) y comprueba el MD5 de los pesos contra el fichero original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN con backbone ResNet-101 y FPN (mmdetection 2.x) |
| Parametros totales | 88.276.988 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1280 x 720) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos en safetensors y `.pth` en FP32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`): uso educativo, investigacion y sin animo de lucro |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth`; config en Python (`config.py`, `original_config.py`) y `config.json` resumen |

## Arquitectura y entrenamiento

Cascade R-CNN es un detector de dos etapas que encadena varios cabezales de refinamiento con umbrales de IoU crecientes, de modo que cada etapa recibe propuestas progresivamente mas precisas. Sobre el backbone ResNet-101 inicializado con pesos ImageNet (`torchvision://resnet101`) se anade un FPN para la piramide de caracteristicas; el resultado es un detector de cajas COCO-style sin rama de mascaras. La entrada es de 1280 x 720, el tamano nativo de BDD100K, sin redimensionado, con normalizacion media y desviacion estandar de ImageNet en RGB.

El entrenamiento usa el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con SGD a learning rate 0.04, weight decay 0.0001, decaimiento del learning rate en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen. No hay RLHF, DPO ni ninguna etapa de alineacion: es un modelo supervisado de deteccion puro. La innovacion destacable del repositorio no es arquitectonica sino de preservacion: recuperacion desde Wayback Machine, entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, Python 3.10) y carga de pesos con `torch.load(weights_only=True)`.

## Capacidades

- Deteccion de objetos en escenas de conduccion: cajas delimitadoras con clase y score sobre imagenes de 1280 x 720.
- Clases del dataset BDD100K (objetos de trafico: vehiculos, peatones, senalizacion, semaforos, etc., segun la taxonomia del dataset).
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video y webcam (`python infer.py 0 --show`).
- Exportacion de detecciones en formato BDD100K mediante `--json out.json`.
- Control de umbral de score (`--score-thr`, por defecto 0.3) y limite de frames (`--max-frames N`).
- Ejecucion en CPU y en GPU (entorno CUDA 11.8 o entorno CPU separado); el autor reporta 3,0 s/imagen en 8 hilos de CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Investigacion en deteccion para conduccion autonoma: linea base reproducible para comparar detectores sobre BDD100K con la misma configuracion y pesos que el zoo de SysCV, util cuando se necesita una referencia publicada y verificable.
- Evaluacion en condiciones adversas: el checkpoint esta entrenado sobre escenas dia y noche de BDD100K, por lo que sirve para analizar degradacion de AP en clips nocturnos o con poca luz usando el script de inferencia sobre video.
- Preetiquetado de datasets de trafico: ejecutar `infer.py` sobre una carpeta de imagenes con `--json` para generar anotaciones en formato BDD100K que luego se revisan y corrigen manualmente, acelerando el etiquetado.
- Reproduccion de resultados academicos: al incluir las predicciones de validacion de SysCV en `original/`, permite verificar pipelines propios contra una referencia exacta (659 cajas identicas en 20 imagenes de validacion).
- Prototipado de sistemas ADAS en CPU: con 3,0 s/imagen en 8 hilos y un repo de 0,8 GB, es viable montar demos o validaciones sin GPU dedicada, a costa de throughput bajo.
- Analisis offline de grabaciones de trafico: procesar ficheros de video completos con `--max-frames` para extraer detecciones por frame y estudiar flujos de vehiculos y peatones en un tramo concreto.
- Docencia en vision por computador: ejemplo completo de detector de dos etapas con mmdetection, entorno fijado y verificacion de pesos, adecuado para practicas de deteccion de objetos.

## Benchmarks y rendimiento

Resultados COCO-style box AP (%) sobre BDD100K, declarados por SysCV y reproducidos en la model card. El AP de validacion procede de la tabla del zoo de modelos (el fichero de scores de validacion no estaba archivado); el resto de metricas corresponde al split de test.

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 33,6 | no disponible | no disponible | no disponible | no disponible | no disponible |
| test | 32,9 | 55,3 | 33,6 | 16,8 | 39,5 | 49,1 |

El valor de mAP reportado en el model-index para validacion es 33,57 (marcado como no verificado). El autor indica reproduccion exacta de las predicciones de validacion de SysCV en 20 imagenes aleatorias (mismas 659 cajas y scores en CPU), aunque el entorno CUDA no se ha probado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Con 88,3 M de parametros en FP32, los pesos ocupan aproximadamente 0,35 GB; a 1280 x 720 con FPN y cabezales en cascada, el consumo real de activaciones es notablemente mayor y no se documenta.
- GPU recomendadas: no disponible. El autor solo indica que existe un entorno CUDA 11.8 (`env/requirements-cu118.txt`) y un entorno CPU (`env/requirements-cpu.txt`), y que el entorno CUDA no se ha probado.
- GPU de consumo: no confirmado. Por tamano de pesos (0,35 GB en FP32) cabria en cualquier GPU consumer moderna, pero la memoria de activaciones a 1280 x 720 no esta medida.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10; script `infer.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 3,0 s/imagen en 8 hilos de CPU. Throughput en GPU no disponible.
- Almacenamiento: repo de 0,8 GB (incluye pesos safetensors, `.pth` y artefactos originales de SysCV).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | AP en BDD100K | Licencia |
|---|---|---|---|---|---|
| Este modelo (Cascade R-CNN R101-FPN 3x) | Cascade R-CNN + FPN | 88,3 M | 1280 x 720 | 33,6 val / 32,9 test | BDD100K (no comercial) |
| Otros detectores del zoo SysCV (p. ej. Faster R-CNN, RetinaNet, YOLOv3 sobre BDD100K) | Diversas | no disponible en la informacion proporcionada | 1280 x 720 | no disponible en la informacion proporcionada | BDD100K / Apache-2.0 segun config |
| Detectores genericos COCO (p. ej. Cascade R-CNN R101-FPN 3x de mmdetection) | Cascade R-CNN + FPN | ~88 M | variable | no evaluado en BDD100K de forma nativa | Apache-2.0 |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada: la model card solo publica los resultados de este checkpoint y remite al zoo de SysCV para el resto.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo la licencia BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro. El uso comercial no esta permitido sin autorizacion adicional.
- Solo cajas: no genera mascaras ni segmentacion; no sirve para tareas de instancia o panoptica.
- Entrada fija a 1280 x 720 sin redimensionado: imagenes con otra relacion de aspecto o resolucion requieren preprocesado manual y pueden degradar el AP.
- Dominio limitado a escenas de conduccion de BDD100K; el rendimiento fuera de ese dominio (interiores, imagenes aereas, otros paises) no esta caracterizado.
- AP modesto en objetos pequenos (APs 16,8 en test), lo que limita su uso en deteccion de senalizacion lejana o peatones a distancia.
- Riesgo de falsos positivos y negativos inherente a un detector con umbral de score 0,05 en test; en produccion conviene subir el umbral y validar por clase.
- Sesgos del dataset BDD100K (geografia, condiciones meteorologicas, distribucion de clases) se heredan directamente en el modelo.
- El entorno CUDA no ha sido probado por el autor; solo se verifico la inferencia en CPU.
- El repositorio depende de mmdetection 2.x, una rama antigua con soporte limitado en versiones recientes de PyTorch y CUDA; requiere un entorno virtual limpio.
- No hay garantia de mantenimiento del espejo: los pesos originales solo existen gracias a una captura de Wayback Machine.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-r101-fpn-3x
- Zoo de modelos de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV para este modelo: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/cascade_rcnn_r101_fpn_3x_det_bdd100k.py
- Paper de Cascade R-CNN (CVPR 2018): https://arxiv.org/abs/1712.00726
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
- Licencia BDD100K del repositorio: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-r101-fpn-3x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face (espejo): https://huggingface.co/datasets/dronefreak/BDD100K
