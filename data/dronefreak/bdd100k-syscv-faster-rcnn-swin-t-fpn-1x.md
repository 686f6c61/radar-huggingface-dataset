# dronefreak/bdd100k-syscv-faster-rcnn-swin-t-fpn-1x

## Resumen

Faster R-CNN con backbone Swin Transformer Tiny y cuello FPN, entrenado sobre BDD100K para deteccion de objetos en escenas de conduccion. El modelo original procede del zoo de modelos de SysCV (ETH Zurich) y este repositorio de Hugging Face es un espejo publicado por el usuario dronefreak, que recupero los pesos desde la Wayback Machine (captura del 19 de febrero de 2025) ante la caida del host original `dl.cv.ethz.ch`. El repositorio anade un entorno fijado y un script de inferencia sobre la configuracion original.

Resuelve la deteccion de 10 clases relevantes para conduccion autonoma (peatones, ciclistas, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico) a resolucion nativa de 1280 x 720, sin reescalado. Con 44,8 millones de parametros y un backbone jerarquico basado en ventanas desplazadas, es un detector de tamano contenido que cabe en GPU de consumo y sirve como linea base reproducible para tareas de percepcion en vehiculos.

Su relevancia actual es practica: el zoo original de SysCV ya no es accesible desde su host institucional, por lo que este espejo verificado (MD5 coincidente y reproduccion exacta de las predicciones publicadas) preserva un checkpoint de referencia para investigación en deteccion sobre BDD100K y para pipelines de vision en automocion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone Swin Transformer Tiny (patch 4, ventana 7) y FPN |
| Parametros totales | 44.821.384 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | BDD100K (uso educativo, investigación y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (y `.pth` original en la carpeta `original/`) |

## Arquitectura y entrenamiento

Faster R-CNN de dos etapas con backbone Swin Transformer Tiny, que construye representaciones jerarquicas mediante atencion local en ventanas desplazadas, y un cuello Feature Pyramid Network para la deteccion multiescala. La cabeza RPN y la cabeza de clasificacion/regresion operan sobre las piramides de caracteristicas generadas por el FPN. La entrada es la imagen nativa de BDD100K (1280 x 720) en RGB, normalizada con media y desviacion estandar de ImageNet, sin redimensionado.

El entrenamiento usa el split de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas (schedule 1x), con optimizador AdamW, learning rate 0,0001, weight decay 0,05, decaimiento en las epocas 9 y 11 y batch de 32 (8 GPU x 2 imagenes). El backbone se inicializa con pesos de ImageNet (`swin_tiny_patch4_window7_224.pth`). En test se aplica umbral de score 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. No se documenta RLHF, DPO ni tecnicas de alineacion, al no tratarse de un modelo generativo.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion en las 10 clases de BDD100K: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagenes sueltas, carpetas de imagenes, ficheros de video y webcam (via `infer.py`).
- Exportacion de detecciones en formato BDD100K mediante la opcion `--json`.
- Control del umbral de score (`--score-thr`, por defecto 0,3) y del numero maximo de frames en video (`--max-frames`).
- Ejecucion en CPU (1,8 s/imagen con 8 hilos) y en GPU (CUDA; el entorno CUDA no fue probado por el autor del espejo).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector de objetos.

## Casos de uso

- Percepcion en vehiculos autonomos de investigación: el modelo detecta peatones, vehiculos y senalizacion en imagenes de 1280 x 720 sin reescalado, lo que lo hace adecuado como componente de referencia en pipelines de percepcion sobre BDD100K.
- Deteccion de trafico nocturno y diurno: el checkpoint se ha validado visualmente sobre clips de dia y de noche del split de validacion, por lo que sirve para estudiar el rendimiento en condiciones de iluminacion adversas.
- Etiquetado asistido de datasets de conduccion: generar cajas en formato BDD100K con `--json` para preanotar nuevas imagenes y reducir el coste de anotacion manual, revisando despues las detecciones con umbral bajo.
- Analisis de video de trafico: procesar ficheros de video con `--max-frames` para extraer detecciones por frame en estudios de conteo de vehiculos o analisis de flujo.
- Linea base reproducible para investigación: al reproducir exactamente las predicciones publicadas por SysCV, sirve como referencia para comparar nuevos detectores o tecnicas de aumento de datos sobre BDD100K.
- Demostraciones en tiempo real con webcam: el modo `0 --show` permite visualizar detecciones en directo, util para prototipos y validacion cualitativa en entornos de laboratorio.
- Evaluacion comparativa de backbones: al usar Swin-T, permite medir el impacto del backbone frente a alternativas ResNet en la misma configuracion de Faster R-CNN sobre BDD100K.

## Benchmarks y rendimiento

Resultados declarados por SysCV (Box AP estilo COCO, %), no verificados de forma independiente por el autor del espejo:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32,1 | 58,8 | 29,8 | 15,2 | 37,0 | 53,7 |
| test | 31,0 | 56,1 | 29,6 | 15,3 | 36,9 | 48,2 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 34,8 |
| rider | 26,2 |
| car | 50,8 |
| truck | 45,2 |
| bus | 47,3 |
| train | 2,1 |
| motorcycle | 24,7 |
| bicycle | 25,8 |
| traffic light | 25,0 |
| traffic sign | 38,8 |

El valor de mAP declarado en el model-index es 32,07 (Box AP en validacion). La clase train presenta un AP muy bajo (2,1), probablemente por su escasa representacion en el dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 44,8 millones de parametros en precision completa, el peso de los pesos ronda los 180 MB y el consumo de activaciones a 1280 x 720 es moderado, por lo que se espera que quepa holgadamente en GPU de consumo (estimacion no confirmada por el autor).
- GPU recomendadas: no especificadas; el autor solo indica que el entorno CUDA no ha sido probado. Cualquier GPU NVIDIA con soporte para CUDA 11.8 deberia ser compatible con el entorno fijado.
- CPU: funciona con 8 hilos a 1,8 s/imagen, segun el autor.
- Cabe en GPU de consumo: si, segun el tamano del modelo, aunque no se documenta una medicion concreta de VRAM.
- Despliegue: entorno fijado con Python 3.10, torch 2.0.1, mmcv-full 1.7.2 y mmdetection 2.28.2; instalacion via `uv` con `env/requirements-cu118.txt` o `env/requirements-cpu.txt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision).
- Latencia y throughput: 1,8 s/imagen en CPU con 8 hilos; sin datos de latencia en GPU.

## Comparativa con modelos similares

No se dispone de datos de otros detectores comparables en la informacion proporcionada (mismo backbone, misma configuracion o mismos resultados sobre BDD100K). El repositorio no incluye comparaciones con alternativas como Faster R-CNN con ResNet, YOLO u otros detectores del zoo de SysCV.

| Modelo | Parametros | Contexto/entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN Swin-T-FPN 1x) | 44,8 M | 1280 x 720 | 32,1 | BDD100K | Hugging Face (espejo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia BDD100K: restringida a uso educativo, de investigación y sin animo de lucro; el uso comercial no esta permitido sin autorizacion adicional.
- El entorno CUDA no fue probado por el autor del espejo; solo se verifico la inferencia en CPU.
- El AP de la clase train es muy bajo (2,1), por lo que las detecciones de trenes no son fiables.
- El modelo esta entrenado exclusivamente sobre BDD100K, con los sesgos de composicion, geografia y condiciones de captura de ese dataset; puede degradarse en dominios distintos.
- Riesgo de falsos positivos y negativos en escenas nocturnas o con oclusiones; el umbral por defecto de 0,3 puede requerir ajuste segun la aplicacion.
- No es un modelo generativo ni linguistico: no admite instrucciones en lenguaje natural ni razonamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original del modelo.
- La verificacion de reproduccion se hizo sobre 20 imagenes aleatorias del split de validacion; no se documenta una evaluacion exhaustiva independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-swin-t-fpn-1x
- Zoo de modelos de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_swin-t_fpn_1x_det_bdd100k.py
- Paper de Swin Transformer (arXiv:2103.14030): https://arxiv.org/abs/2103.14030
- Pesos de inicializacion ImageNet de Swin-T: https://github.com/SwinTransformer/storage/releases/download/v1.0.0/swin_tiny_patch4_window7_224.pth
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-swin-t-fpn-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
