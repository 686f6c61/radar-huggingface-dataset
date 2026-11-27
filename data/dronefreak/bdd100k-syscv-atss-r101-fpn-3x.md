# dronefreak/bdd100k-syscv-atss-r101-fpn-3x

## Resumen

ATSS R101-FPN 3x sobre BDD100K es un detector de objetos de dos etapas (en la practica, un detector denso con asignacion adaptativa de muestras) entrenado especificamente para escenas de conduccion. Lo desarrolla originalmente el grupo SysCV de la ETH Zurich como parte de su zoo de modelos para BDD100K, y este repositorio de Hugging Face es un espejo creado por el usuario `dronefreak` que recupera los pesos desde la Wayback Machine, ya que el host original `dl.cv.ethz.ch` esta fuera de servicio. El modelo implementa el metodo ATSS (Adaptive Training Sample Selection), presentado en CVPR 2020, sobre un backbone ResNet-101 con cuello FPN.

El problema que resuelve es la deteccion de las diez clases de trafico de BDD100K (peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico) en imagenes de 1280x720 tal cual vienen del dataset, sin reescalado. Es relevante ahora porque el host original de SysCV esta caido y este espejo verificado (MD5 coincidente, reproduccion exacta de las predicciones publicadas) permite seguir utilizando un checkpoint de referencia para investigacion en percepcion autonoma.

Arquitectonicamente es un detector clasico de mmdetection 2.x: backbone ResNet-101 preentrenado en ImageNet, FPN de cinco niveles y cabeza ATSS. Con 51,2 millones de parametros y un repo de 1,1 GB, es un modelo de investigacion, no un modelo de produccion moderno; su interes esta en la reproducibilidad y en servir de baseline para comparativas sobre BDD100K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector ATSS con backbone ResNet-101 y cuello FPN (mmdetection 2.x) |
| Parametros totales | 51.231.439 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 1280x720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BDD100K (uso educativo, investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; config en `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

El modelo sigue el diseno ATSS: un backbone ResNet-101 con pesos iniciales de ImageNet (`torchvision://resnet101`), un Feature Pyramid Network con cinco niveles y una cabeza de deteccion que asigna muestras positivas y negativas de forma adaptativa segun la estadistica de las distancias entre anchors y ground truth, en lugar de usar umbrales fijos de IoU. Esta es la innovacion central del paper de CVPR 2020: unificar el comportamiento de detectores anchor-based y anchor-free mediante la seleccion adaptativa de muestras de entrenamiento.

El entrenamiento se realizo sobre el split train de BDD100K (70.000 imagenes) durante 36 epocas (schedule 3x), con SGD de momento, learning rate 0.02, weight decay 0.0001, decaimiento del LR en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). La entrada es de 1280x720, el tamano nativo de BDD100K, sin reescalado, en RGB con media y desviacion tipica de ImageNet. En test se aplica umbral de score 0.05, NMS con IoU 0.6 y un maximo de 100 cajas por imagen.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion, con diez clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagenes sueltas, carpetas de imagenes, ficheros de video y webcam mediante el script `infer.py` incluido en el repo.
- Exportacion de detecciones en formato BDD100K (`--json out.json`), lo que facilita la evaluacion con las herramientas oficiales del dataset.
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de frames para video (`--max-frames`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion de cajas.

## Casos de uso

- Baseline de investigacion en BDD100K: sirve como referencia reproducible para comparar nuevos detectores sobre el split de validacion, ya que las predicciones publicadas por SysCV se reproducen exactamente (1977 cajas identicas en 20 imagenes de validacion aleatorias).
- Analisis offline de video de conduccion: el script `infer.py` procesa ficheros de video y genera detecciones por frame en formato BDD100K, util para anotar o auditar grabaciones de flotas y datasets internos.
- Preetiquetado de datasets de trafico: con umbrales de score bajos (0.05 en test) el modelo propone cajas que un equipo humano puede revisar, acelerando la creacion de nuevos conjuntos de datos de escenas viales.
- Deteccion de peatones y ciclistas en estudios de seguridad vial: las clases pedestrian (AP 36.4) y bicycle (AP 26.6) permiten cuantificar la presencia de usuarios vulnerables en grabaciones urbanas.
- Prototipado de sistemas ADAS en entorno controlado: integrado en un pipeline de mmdetection, sirve para validar la logica de percepcion (semafaros, senales, vehiculos) antes de pasar a modelos mas modernos.
- Docencia y reproduccion de experimentos: el entorno fijado (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) permite montar un laboratorio reproducible de deteccion clasica sin depender del host caido de ETH Zurich.
- Verificacion de integridad de checkpoints: el repo incluye MD5 y predicciones archivadas, lo que lo hace util como caso de estudio de recuperacion y validacion de pesos desde la Wayback Machine.

## Benchmarks y rendimiento

Resultados declarados por SysCV (Box AP estilo COCO, en porcentaje) sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 33.8 | 58.5 | 32.7 | 15.5 | 39.6 | 56.2 |
| test | 32.6 | 55.6 | 32.4 | 15.7 | 39.5 | 50.0 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 36.4 |
| rider | 26.8 |
| car | 53.4 |
| truck | 49.4 |
| bus | 50.3 |
| train | 0.8 |
| motorcycle | 24.2 |
| bicycle | 26.6 |
| traffic light | 28.5 |
| traffic sign | 41.5 |

Nota: la metrica `verified: false` del model-index indica que el autor del espejo no ha verificado de forma independiente los numeros; proceden de los ficheros de score publicados por SysCV. El repo si verifica la reproduccion exacta de las predicciones de validacion y la coincidencia de MD5 de los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 51,2 M de parametros en FP32 (unos 205 MB de pesos) y entrada de 1280x720, la memoria necesaria es moderada, pero el repo no publica mediciones de VRAM.
- GPU recomendadas: no se documentan; el entorno incluido soporta CUDA 11.8 (`env/requirements-cu118.txt`) y tambien CPU (`env/requirements-cpu.txt`). El autor indica que el entorno CUDA no ha sido probado.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no hay confirmacion en la informacion disponible.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre Python 3.10 y torch 2.0.1; script propio `infer.py` para imagen, carpeta, video y webcam. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia: 1,6 s por imagen en CPU con 8 hilos, segun la model card. Throughput en GPU no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | AP en BDD100K (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATSS R101-FPN 3x (este) | 51,2 M | 1280x720 | 33.8 | BDD100K (investigacion) | Hugging Face (espejo) |
| Otros detectores del zoo SysCV BDD100K | no disponible | no disponible | no disponible | no disponible | host original caido |
| Detectores YOLO genericos | no disponible | no disponible | no disponible | varian por version | amplia |

No se dispone en la informacion proporcionada de resultados comparables de otros detectores sobre BDD100K con la misma metrica y split, por lo que la comparativa cuantitativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo en la clase train (AP 0.8 en validacion), lo que hace el modelo practicamente inutil para deteccion de trenes.
- AP global moderado (33.8 en validacion): es un baseline de investigacion, no un detector de produccion; los detectores modernos superan ampliamente estas cifras.
- Sesgos conocidos: entrenado exclusivamente con BDD100K (escenas de conduccion, principalmente entornos urbanos y de carretera de determinadas regiones); el rendimiento fuera de esa distribucion (clima extremo, otros paises, camaras distintas) no esta documentado y previsiblemente degrada.
- Riesgo de falsos negativos y positivos en objetos pequenos (APs 15.5) y en clases poco frecuentes.
- Licencia BDD100K: uso educativo, de investigacion y sin animo de lucro; el uso comercial requiere revisar los terminos del dataset y de la licencia `LICENSE.txt` del repo.
- El entorno CUDA no ha sido probado por el autor del espejo; solo se valido la inferencia en CPU.
- Dependencia de una version antigua del stack (mmdetection 2.x, mmcv-full 1.7.2, torch 2.0.1), lo que complica la integracion con proyectos actuales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un espejo reciente sin validacion de la comunidad.
- No procesa texto ni lenguaje natural; cualquier uso que requiera comprension semantica queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r101-fpn-3x
- Zoo de modelos SysCV BDD100K: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/atss_r101_fpn_3x_det_bdd100k.py
- Paper ATSS (CVPR 2020): https://arxiv.org/abs/1912.02424
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r101-fpn-3x/blob/main/LICENSE.txt
- Demo en video: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r101-fpn-3x/resolve/main/assets/demo_banner.mp4
