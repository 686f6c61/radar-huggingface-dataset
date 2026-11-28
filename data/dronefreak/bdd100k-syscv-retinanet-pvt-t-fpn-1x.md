# dronefreak/bdd100k-syscv-retinanet-pvt-t-fpn-1x

## Resumen

RetinaNet con backbone Pyramid Vision Transformer Tiny (PVT-T) y cuello FPN, entrenado sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. El modelo original procede del zoo de modelos de SysCV (ETH Zurich), y este repositorio de Hugging Face es un espejo que recupera los pesos desde la Wayback Machine ante la caida del host original `dl.cv.ethz.ch`. Incluye un entorno fijado y un script de inferencia que facilitan su uso reproducible.

Se trata de un detector de una etapa (RetinaNet) que sustituye el backbone convolucional clasico por un transformer piramidal (PVT), lo que permite capturar contexto global a multiples escalas sin operaciones de convolucion en el extractor de caracteristicas. Con 21,5 millones de parametros y entrada nativa de 1280 x 720, esta pensado para deteccion densa en imagenes de trafico urbano y autopista.

Su relevancia actual es doble: por un lado, sirve como referencia reproducible para comparativas en BDD100K; por otro, el repositorio documenta una verificacion exacta de pesos (MD5 coincidente con SysCV) y de predicciones (mismas 1993 cajas en 20 imagenes de validacion), lo que lo convierte en un artefacto fiable para investigacion en conduccion autonoma. La licencia BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (detector de una etapa) con backbone Pyramid Vision Transformer Tiny (PVT-T) y cuello FPN |
| Parametros totales | 21.512.062 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | bdd100k (educational, research and not-for-profit use) |
| Formato de pesos | safetensors (tambien `.pth` original en `original/`) |

## Arquitectura y entrenamiento

RetinaNet es un detector de una etapa con cabezas densas de clasificacion y regresion ancladas, y funcion de perdida focal para mitigar el desbalance entre primer plano y fondo. En esta variante, el extractor de caracteristicas es PVT-T, un transformer piramidal que genera mapas de caracteristicas a cuatro escalas (1/4, 1/8, 1/16, 1/32) mediante atencion espacial reducida, y que se combina con un FPN para fusionar informacion multiescala antes de las cabezas de deteccion. La entrada se procesa a resolucion nativa de 1280 x 720, sin reescalado, con normalizacion ImageNet (media y desviacion tipica RGB).

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70 000 imagenes) durante 12 epocas (calendario 1x), con optimizador AdamW, learning rate 0,0001, weight decay 0,0001, decaimiento de learning rate en las epocas 8 y 11, y tamano de lote 32 (8 GPU x 2 imagenes). El backbone se inicializa con pesos de ImageNet (`pvt_tiny.pth` del repositorio oficial de PVT). En prueba se aplica umbral de puntuacion 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. La configuracion proviene de SysCV y esta fusionada en `original_config.py`; el `config.py` del repositorio la hereda sin cambios.

## Capacidades

- Deteccion de objetos en imagenes RGB de escenas de conduccion, con 10 clases de BDD100K: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.
- Salida en formato COCO/BBox con cajas delimitadoras y puntuaciones de confianza; exportacion a JSON en formato BDD100K mediante `--json`.
- Inferencia sobre imagen suelta, carpeta de imagenes, fichero de video y webcam (`infer.py 0 --show`).
- Procesamiento por lotes con control de umbral de puntuacion (`--score-thr`, por defecto 0,3) y limite de fotogramas (`--max-frames`).
- Ejecucion en CPU y en GPU CUDA 11.8 con el mismo resultado numerico.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modalidades de audio o texto: es exclusivamente un modelo de vision para deteccion.

## Casos de uso

- Deteccion de peatones y vehiculos en imagenes de trafico urbano: el modelo identifica las 10 clases de BDD100K a resolucion nativa 1280 x 720, adecuado para analisis de escenas viales en investigacion sobre seguridad.
- Analisis de video de dashcam: `infer.py` acepta ficheros de video y procesa fotograma a fotograma con detecciones exportables a JSON en formato BDD100K, util para anotacion asistida o auditoria de grabaciones.
- Generacion de etiquetas preliminares para nuevos conjuntos de datos: con umbral de puntuacion ajustable y salida JSON, sirve como preanotador en pipelines de etiquetado de imagenes de conduccion.
- Evaluacion comparativa de detectores en BDD100K: al reproducir exactamente las predicciones publicadas por SysCV (mismas 1993 cajas en 20 imagenes de validacion), es una linea base fiable para comparar nuevos modelos.
- Prototipado en CPU: con 1,4 s/imagen en 8 hilos de CPU, permite experimentar sin GPU en entornos de investigacion con recursos limitados.
- Demostracion en tiempo real con webcam: a 0,06 s/imagen en una RTX 4070 SUPER (aproximadamente 16 FPS), es viable para demos interactivas de deteccion en escenas de conduccion.
- Verificacion de artefactos y reproducibilidad: el repositorio incluye MD5, predicciones de validacion y puntuaciones archivadas, util para validar pipelines de despliegue de modelos de vision.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index) y por SysCV en la model card. Box AP en porcentaje, estilo COCO, sobre BDD100K.

| Metrica | Valor |
|---|---|
| Box AP (val, reportado por SysCV) | 28,45 (marcado como no verificado en el model-index) |

Desglose detallado reportado por SysCV:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 28,5 | 53,2 | 25,9 | 11,8 | 33,5 | 49,8 |
| test | 27,5 | 50,8 | 25,4 | 12,2 | 33,9 | 44,6 |

AP por clase (val):

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 29,5 | 21,1 | 48,4 | 40,5 | 43,0 | 0,0 | 20,9 | 22,0 | 23,2 | 35,9 |

Rendimiento de inferencia medido por el autor del espejo: 0,06 s/imagen en una RTX 4070 SUPER (CUDA 11.8, TF32 desactivado) y 1,4 s/imagen en 8 hilos de CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 21,5 millones de parametros el modelo es muy ligero y cabe con holgura en cualquier GPU consumer moderna, incluso a resolucion 1280 x 720.
- GPU recomendadas: cualquier GPU con CUDA 11.8 compatible; el autor verifico en una RTX 4070 SUPER. Para mayor throughput, A100 o H100 son adecuadas, aunque el modelo no las requiere.
- Cabe en GPU consumer: si, en cualquier GPU consumer con suficiente memoria para la resolucion de entrada (el checkpoint ocupa 0,9 GB en el repositorio).
- Opciones de despliegue: entorno fijado con Python 3.10, torch 2.0.1, mmcv-full 1.7.2 y mmdetection 2.28.2 (`env/requirements-cu118.txt` para GPU, `env/requirements-cpu.txt` para CPU). Script de inferencia `infer.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un detector de vision).
- Latencia y throughput: 0,06 s/imagen en RTX 4070 SUPER (aproximadamente 16 FPS) y 1,4 s/imagen en 8 hilos de CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros detectores en la informacion proporcionada, por lo que no es posible establecer una comparativa numerica fiable. Como referencia cualitativa, este modelo se situa en la categoria de detectores de una etapa con backbone transformer para BDD100K, frente a alternativas como RetinaNet con backbone ResNet, Faster R-CNN o variantes con backbone Swin, pero no se aportan cifras comparables.

| Modelo | Parametros | Contexto/entrada | AP val BDD100K | Licencia |
|---|---|---|---|---|
| RetinaNet PVT-T-FPN 1x (este) | 21,5 M | 1280 x 720 | 28,5 | bdd100k |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro; no se permite uso comercial sin autorizacion.
- El modelo esta entrenado exclusivamente sobre BDD100K y su dominio son escenas de conduccion; el rendimiento fuera de ese dominio (interiores, imagenes aereas, otros paises o condiciones) no esta garantizado.
- La clase `train` obtiene AP 0,0 en validacion, lo que indica que el modelo practicamente no detecta trenes.
- Rendimiento modesto en objetos pequenos (APs 11,8 en val) y en clases minoritarias como rider (21,1) o motorcycle (20,9).
- No se documentan sesgos especificos, pero al entrenarse con un conjunto de conduccion de ciertas regiones puede heredar sesgos de representacion geografica y de condiciones meteorologicas.
- Riesgo de falsos negativos y positivos en condiciones nocturnas o de baja visibilidad; el autor muestra demos diurnas y nocturnas, pero no se aportan metricas desagregadas por condicion.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- El repositorio depende de mmdetection 2.x y de un entorno antiguo (torch 2.0.1, mmcv-full 1.7.2); la compatibilidad con versiones mas recientes no esta garantizada.
- El valor de AP del model-index esta marcado como no verificado; los resultados proceden de los ficheros de puntuacion de SysCV.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvt-t-fpn-1x
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_pvt-t_fpn_1x_det_bdd100k.py
- Paper PVT (ICCV 2021): https://arxiv.org/abs/2102.12122
- Pesos ImageNet del backbone PVT: https://github.com/whai362/PVT/releases/download/v2/pvt_tiny.pth
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvt-t-fpn-1x/blob/main/LICENSE.txt
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
