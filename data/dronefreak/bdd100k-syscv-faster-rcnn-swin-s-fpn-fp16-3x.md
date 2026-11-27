# dronefreak/bdd100k-syscv-faster-rcnn-swin-s-fpn-fp16-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-faster-rcnn-swin-s-fpn-fp16-3x` es un detector de objetos de dos etapas (Faster R-CNN) con backbone Swin Transformer Small y cuello FPN, entrenado sobre el dataset BDD100K para deteccion en escenas de conduccion autonoma. No es un modelo de lenguaje, sino un checkpoint de vision por computador empaquetado para la libreria MMDetection. Lo publica el usuario `dronefreak` como espejo (mirror) de un modelo del zoo oficial de SysCV (ETH Zurich), cuyo servidor de descargas `dl.cv.ethz.ch` esta fuera de linea.

El interes practico del repositorio es la recuperacion del checkpoint original desde la Wayback Machine (captura del 19 de febrero de 2025), junto con un entorno de dependencias fijado (PyTorch 2.0.1, mmcv-full 1.7.2, MMDetection 2.28.2 sobre Python 3.10) y un script de inferencia (`infer.py`) que admite imagenes, carpetas, video y webcam. Esto resuelve un problema de reproducibilidad: sin el mirror, los pesos de este modelo del zoo de SysCV serian inaccesibles.

El modelo tiene 66.168.100 parametros (segun el archivo safetensors), un tamano de repositorio de 1,2 GB y detecta 10 clases de BDD100K (peatones, ciclistas, coches, camiones, autobuses, trenes, motos, bicicletas, semaforos y senales de trafico). Su licencia es la de BDD100K, restringida a uso educativo, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone Swin Transformer Small (Swin-S) y FPN |
| Parametros totales | 66.168.100 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (checkpoint en FP16; no se documentan variantes GGUF, INT8 ni otras) |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | BDD100K (`other`), uso educativo, de investigacion y sin animo de lucro |
| Formato de pesos | safetensors (con equivalente `.pth` original) |

## Arquitectura y entrenamiento

Se trata de un detector Faster R-CNN de dos etapas. El backbone es Swin Transformer Small, un transformer jerarquico con atencion por ventanas desplazadas (shifted windows) descrito en el paper "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows" (ICCV 2021, arXiv:2103.14030). Sobre el backbone se aplica una FPN y las cabezas de clasificacion y regresion de cajas propias de Faster R-CNN. La entrada es la resolucion nativa de BDD100K, 1280 x 720, sin redimensionado, en RGB con media y desviacion tipica de ImageNet.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (esquema "3x"), con AdamW, learning rate 0,0001, weight decay 0,05, decaimiento en las epocas 27 y 33, batch de 32 (8 GPU x 2 imagenes), entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720) y precision mixta FP16. El backbone se inicializa con pesos de ImageNet (`swin_small_patch4_window7_224.pth`). En test se aplica umbral de score 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, al no ser un modelo generativo.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion, con 10 clases de BDD100K: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Salida en formato BDD100K mediante la opcion `--json out.json` del script de inferencia.
- Inferencia sobre imagen individual, carpeta de imagenes, archivo de video y webcam en directo (`infer.py 0 --show`).
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y limite de frames procesados (`--max-frames`).
- Ejecucion en CPU o GPU (entornos `requirements-cpu.txt` y `requirements-cu118.txt`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural, al ser un modelo puramente de vision.

## Casos de uso

- Investigacion en deteccion para conduccion autonoma: sirve como baseline reproducible del zoo de SysCV para comparar arquitecturas (Faster R-CNN + Swin-S frente a otros detectores) sobre el split de validacion de BDD100K con la metrica Box AP.
- Reproduccion de resultados academicos: el repositorio incluye las predicciones y ficheros de score originales de SysCV en `original/`, lo que permite verificar publicaciones que citen este checkpoint sin depender de `dl.cv.ethz.ch`.
- Prototipado de sistemas ADAS: el modelo detecta peatones, vehiculos, semaforos y senales a 1280 x 720, resolucion nativa de camaras de salpicadero, lo que facilita integrarlo en pipelines de percepcion experimental.
- Analisis offline de video de trafico: `infer.py` acepta archivos de video y exporta detecciones en formato BDD100K, util para anotar o auditar grabaciones de flotas y estudiar la distribucion de clases.
- Demostraciones y docencia: el script admite webcam y visualizacion en tiempo real (`--show`), lo que permite montar demos de deteccion en directo con un entorno fijado y reproducible.
- Verificacion de integridad de pesos: el repositorio incluye MD5 (`75a734fddf2e0c5fdc74313bd16f8fed`) y comprobaciones de equivalencia con las predicciones de SysCV, util en auditorias de modelos recuperados de archivos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de score de SysCV), Box AP estilo COCO sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 34,2 | 60,6 | 33,0 | 16,4 | 39,2 | 56,0 |
| test | 33,3 | 58,0 | 32,9 | 16,7 | 39,3 | 51,5 |

AP por clase en validacion:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 36,4 | 29,6 | 51,9 | 46,5 | 49,4 | 7,3 | 27,4 | 28,9 | 25,3 | 39,6 |

El valor de mAP declarado en el model-index es 34,21 (Box AP en validacion, marcado como `verified: false`). No se han publicado en la informacion disponible resultados comparativos con otros modelos en una tabla propia; los datos de la model card son los unicos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 66,2 millones de parametros en FP16 el peso de los pesos ronda los 130 MB, pero el consumo real depende del framework (MMDetection) y del tamano de entrada (1280 x 720) y del batch.
- GPU recomendadas: no se especifican en la model card; el entorno fijado usa CUDA 11.8 (`requirements-cu118.txt`), compatible con GPUs NVIDIA modernas. El autor indica que el entorno CUDA no se ha probado.
- Cabe en GPU de consumo: muy probablemente si, dado el tamano reducido del modelo, aunque no se documenta una prueba concreta en RTX 4090, RTX 3090 ni similares.
- Opciones de despliegue: MMDetection 2.28.2 con mmcv-full 1.7.2 y PyTorch 2.0.1 sobre Python 3.10, mediante el script `infer.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia y throughput: 2,4 s por imagen con 8 hilos de CPU, segun la model card. No se documenta latencia en GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K con los que comparar directamente (mismo backbone, misma resolucion y mismo protocolo de evaluacion). La model card solo referencia el propio zoo de SysCV como origen, sin tabla comparativa. Por tanto:

| Modelo | Parametros | Contexto/entrada | Box AP (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN Swin-S-FPN) | 66,2 M | 1280 x 720 | 34,2 | BDD100K (no comercial) | Hugging Face (mirror) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan sujetos a su licencia (`LICENSE.txt`), limitada a uso educativo, de investigacion y sin animo de lucro. No se permite uso comercial sin autorizacion.
- El modelo solo detecta las 10 clases de BDD100K; cualquier objeto fuera de ese conjunto (por ejemplo, animales, obstaculos o senalizacion no contemplada) no se reconoce.
- Rendimiento muy desigual por clase: `train` obtiene un AP de 7,3 frente a 51,9 en `car`, lo que refleja el desbalanceo del dataset y limita su uso en clases minoritarias.
- Verificacion incompleta: la copia no reproduce exactamente las predicciones de SysCV (18 de 622 cajas identicas en 20 imagenes de validacion; mayor diferencia de score 0,1729). La causa no se investigo.
- El entorno CUDA no se ha probado; solo se valido la inferencia en CPU. La pila de dependencias esta fijada a versiones antiguas (MMDetection 2.x), lo que complica su integracion en proyectos modernos.
- Riesgo de falsos positivos y negativos en condiciones adversas (noche, lluvia, oclusiones), habitual en detectores entrenados sobre BDD100K; el umbral de score por defecto (0,3) es un compromiso que conviene ajustar por caso de uso.
- No es un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural. Cualquier uso que requiera descripcion semantica exige un modelo adicional (por ejemplo, un VLM).
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; es un mirror reciente (creado el 27 de noviembre de 2026) sin comunidad que lo valide.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-swin-s-fpn-fp16-3x
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-swin-s-fpn-fp16-3x/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K model zoo: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_swin-s_fpn_fp16_3x_det_bdd100k.py
- Paper Swin Transformer (ICCV 2021): https://arxiv.org/abs/2103.14030
- Pesos ImageNet del backbone Swin-S: https://github.com/SwinTransformer/storage/releases/download/v1.0.0/swin_small_patch4_window7_224.pth
- Dataset BDD100K (referencia en Hugging Face): https://huggingface.co/datasets/dronefreak/BDD100K
