# dronefreak/bdd100k-syscv-retinanet-pvt-t-fpn-3x

## Resumen

RetinaNet con backbone Pyramid Vision Transformer Tiny (PVT-T) y cuello FPN, entrenado sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. El modelo original procede del zoo de modelos de SysCV (ETH Zurich) y esta publicado en Hugging Face como espejo por el usuario `dronefreak`, ante la caida del servidor `dl.cv.ethz.ch` del que se distribuian originalmente los pesos. Los pesos se recuperaron de una captura de Wayback Machine de febrero de 2025 y se verificaron por MD5 contra el fichero publicado por SysCV.

Se trata de un detector denso de una sola etapa con 21.512.062 parametros, pensado para inferencia sobre imagenes de 1280x720 (resolucion nativa de BDD100K, sin reescalado). Detecta diez clases de trafico: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico. El repositorio anade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script de inferencia para imagen, carpeta, video o webcam.

Su relevancia actual es practica: recupera un checkpoint de referencia para BDD100K que ya no estaba accesible en su origen, con verificacion de reproduccion exacta de las predicciones publicadas por SysCV (mismos 1997 boxes y scores sobre 20 imagenes de validacion) y con un pipeline listo para ejecutar en CPU o GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (one-stage detector) con backbone Pyramid Vision Transformer Tiny (PVT-T) y cuello FPN |
| Parametros totales | 21.512.062 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada 1280x720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | bdd100k (uso educativo, investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; config en `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

RetinaNet clasico: backbone PVT-T (Pyramid Vision Transformer, ICCV 2021) que sustituye la CNN habitual por un transformer jerarquico con atencion espacial reducida, seguido de un FPN que fusiona las piramides de caracteristicas y de las cabezas de clasificacion y regresion de cajas ancladas. La entrada es RGB a 1280x720 con normalizacion ImageNet (media y desviacion estandar). En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen.

El entrenamiento usa el split train de BDD100K (70.000 imagenes) durante 36 epocas (schedule 3x), con AdamW, learning rate 0.0001, weight decay 0.0001, decaimiento del LR en las epocas 24 y 33, batch de 32 (8 GPUs x 2 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). El backbone se inicializa con pesos ImageNet de PVT-T publicados por el autor original (`pvt_tiny.pth`). No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa; es un detector supervisado de forma estandar sobre anotaciones de cajas de BDD100K.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion con diez clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video o webcam (flags `--show`, `--max-frames`).
- Exportacion de detecciones en formato BDD100K mediante `--json out.json`.
- Umbral de score configurable (`--score-thr`, por defecto 0.3 en el script de inferencia).
- Ejecucion en CPU (entorno `requirements-cpu.txt`) y en GPU CUDA 11.8 (`requirements-cu118.txt`); el script desactiva TF32 para reproducir exactamente las predicciones de SysCV.
- Carga de pesos con `torch.load(weights_only=True)`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision-lenguaje ni audio: es exclusivamente un detector de objetos.

## Casos de uso

- Deteccion de peatones y ciclistas en video de trafico: el modelo procesa fotogramas a 1280x720 nativos y devuelve cajas con score, adecuado para analisis de seguridad vial o conteo de usuarios vulnerables en grabaciones de dashcam.
- Etiquetado asistido de nuevos datasets de conduccion: usar las detecciones con umbral bajo (0.05-0.3) como preanotaciones para acelerar el etiquetado humano de imagenes de trafico, exportando el resultado en formato BDD100K con `--json`.
- Baseline de referencia para investigacion en deteccion sobre BDD100K: al reproducir exactamente las predicciones de SysCV (mismos 1997 boxes en 20 imagenes de validacion), sirve como punto de comparacion controlado para nuevos backbones o tecnicas de aumento de datos.
- Analisis de escenas nocturnas y diurnas: el checkpoint incluye demos sobre clips de dia y de noche de BDD100K, util para estudiar la degradacion del detector segun iluminacion.
- Prototipado en CPU sin GPU dedicada: con 1,4 s/imagen en 8 hilos de CPU, permite validar pipelines de deteccion en entornos sin acelerador antes de escalar a GPU.
- Monitorizacion de trafico en tiempo casi real sobre GPU de gama media: a 0,05 s/imagen en una RTX 4070 SUPER, admite procesar video a unas 20 fps con el preprocesado incluido.
- Docencia y demostraciones de deteccion one-stage: el repositorio incluye entorno fijado y script de inferencia, lo que reduce la friccion para reproducir un detector transformer en clase o en un taller.

## Benchmarks y rendimiento

Resultados declarados por SysCV en la model card (Box AP estilo COCO, %, sobre BDD100K, split validation; `verified: false` en el model-index):

| Metrica | Valor |
|---|---|
| AP | 30,45 |
| AP50 | 55,7 |
| AP75 | 28,2 |
| APs | 12,9 |
| APm | 35,7 |
| APl | 51,8 |
| AP test | 29,9 |

AP por clase en validation:

| Clase | AP |
|---|---|
| pedestrian | 31,9 |
| rider | 23,6 |
| car | 49,8 |
| truck | 43,3 |
| bus | 46,8 |
| train | 0,0 |
| motorcycle | 23,0 |
| bicycle | 24,2 |
| traffic light | 24,3 |
| traffic sign | 37,7 |

Rendimiento de inferencia medido por el autor del espejo: 0,05 s/imagen en una RTX 4070 SUPER y 1,4 s/imagen en 8 hilos de CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada explicitamente; con 21,5 M de parametros y entrada 1280x720, el peso de los pesos es minimo (repo de 0,9 GB, mayoritariamente assets y predicciones archivadas) y el consumo dominante es el de las activaciones a resolucion completa. Cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con CUDA 11.8 compatible; el autor verifico en una RTX 4070 SUPER. Para mayor throughput, A100 o H100 no aportan ventaja significativa por el tamano del modelo, pero permiten mayor paralelismo de batch.
- Cabe en GPU consumer: si, incluidas RTX 4070 SUPER y similares; tambien funciona en CPU (1,4 s/imagen con 8 hilos).
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre torch 2.0.1 y Python 3.10 (entorno fijado en `env/requirements-cu118.txt` y `env/requirements-cpu.txt`); script `infer.py` incluido para imagen, video y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision).
- Latencia y throughput: 0,05 s/imagen en RTX 4070 SUPER; 1,4 s/imagen en 8 hilos de CPU; maximo 100 cajas por imagen tras NMS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | AP en BDD100K val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaNet PVT-T-FPN 3x (este) | 21,5 M | 1280x720 | 30,45 | bdd100k (uso no comercial) | Hugging Face (espejo) |
| Otros detectores del zoo SysCV BDD100K | no disponible | no disponible | no disponible | bdd100k / Apache-2.0 segun config | Parcial (host original caido) |
| Detectores COCO genericos (p. ej. RetinaNet ResNet-50) | no disponible en la informacion | no disponible | no evaluado en BDD100K en la informacion | variable | Amplia |

No se dispone en la informacion proporcionada de resultados de modelos alternativos evaluados sobre BDD100K, por lo que la comparativa cuantitativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Licencia BDD100K: restringida a uso educativo, de investigacion y sin animo de lucro; el uso comercial de los pesos no esta permitido por la licencia del dataset de entrenamiento.
- Clase `train` con AP 0,0 en validation: el modelo no detecta trenes de forma util, probablemente por escasez de ejemplos; no debe usarse para esa clase en produccion.
- Rendimiento modesto en objetos pequenos (APs 12,9) y en clases minoritarias (motorcycle 23,0, bicycle 24,2, rider 23,6); inadecuado para aplicaciones que dependan de deteccion fiable de estos objetos a distancia.
- AP global de 30,45 en validation y 29,9 en test: por debajo de detectores modernos; util como baseline, no como solucion de maxima precision.
- Riesgo de falsos positivos y negativos en condiciones de baja iluminacion, occlusion o climatologia adversa, no cuantificado en la informacion disponible.
- Dependencia de un stack antiguo (mmdetection 2.x, mmcv-full 1.7.2, torch 2.0.1): incompatible con versiones recientes de mmdetection; requiere entorno virtual aislado.
- El checkpoint es un espejo no oficial recuperado de Wayback Machine; aunque la verificacion por MD5 y la reproduccion exacta de predicciones estan documentadas, la procedencia original es un host caido.
- No procesa lenguaje ni audio; no es un modelo multimodal pese a estar alojado en Hugging Face con pipeline `object-detection`.
- No se documentan sesgos demograficos ni geograficos especificos, pero al entrenarse solo con BDD100K (escenas de conduccion, principalmente entornos urbanos de EE. UU.) su generalizacion a otras regiones o dominios no esta validada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvt-t-fpn-3x
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvt-t-fpn-3x/blob/main/LICENSE.txt
- Zoo de modelos SysCV BDD100K (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV usada: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_pvt-t_fpn_3x_det_bdd100k.py
- Paper de Pyramid Vision Transformer (ICCV 2021): https://arxiv.org/abs/2102.12122
- Pesos ImageNet del backbone PVT-T: https://github.com/whai362/PVT/releases/download/v2/pvt_tiny.pth
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
