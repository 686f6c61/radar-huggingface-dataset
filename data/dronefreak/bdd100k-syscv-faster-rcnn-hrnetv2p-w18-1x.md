# dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w18-1x

## Resumen

El modelo `dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w18-1x` es un detector de objetos para escenas de conduccion autonoma, concretamente un Faster R-CNN con backbone HRNetV2p-W18 y cuello HRFPN, entrenado sobre el conjunto de datos BDD100K. No es un modelo de lenguaje ni un modelo generativo: es un checkpoint de vision por computador empaquetado para la libreria MMDetection. Lo publica el usuario `dronefreak` como espejo (mirror) de un modelo del zoo oficial de SysCV (ETH Zurich), cuyo servidor de descargas `dl.cv.ethz.ch` esta fuera de linea; los pesos se recuperaron del archivo Wayback Machine (captura del 19 de febrero de 2025) y la configuracion y resultados provienen del repositorio GitHub de SysCV.

El modelo resuelve la tarea de deteccion de objetos en imagenes de trafico: identifica y localiza peatones, ciclistas, coches, camiones, autobuses, motos, bicicletas, semaforos y senales de trafico. Su relevancia actual es practica: permite reproducir un baseline academico de BDD100K sin depender de un host caido, con un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script de inferencia listo para imagen, video o webcam.

El checkpoint tiene 27.157.862 parametros y ocupa unos 0,2 GB en el repositorio. La entrada nativa es de 1280 x 720 (resolucion original de BDD100K, sin reescalado). El autor declara un Box AP de 31,74 en validacion, aunque marca la metrica como no verificada y advierte de que las predicciones de SysCV para este modelo no se archivaron, por lo que no se ha validado caja por caja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone HRNetV2p-W18 y cuello HRFPN (HRNet, CVPR 2019 / TPAMI 2020) |
| Parametros totales | 27.157.862 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | `other` / `bdd100k`: uso educativo, de investigacion y sin animo de lucro (LICENSE.txt) |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` de MMDetection; configuracion en Python (`config.py`, `original_config.py`) |

## Arquitectura y entrenamiento

Faster R-CNN es un detector de dos etapas: una red de propuesta de regiones (RPN) genera candidatos y una cabeza de clasificacion y regresion refina las cajas. El backbone es HRNetV2p-W18, que mantiene representaciones de alta resolucion en paralelo a lo largo de toda la red en lugar de recuperarlas tras un cuello de botella, lo que favorece la localizacion precisa de objetos pequenos. Sobre el backbone se anade un cuello HRFPN (High-Resolution Feature Pyramid Network) que fusiona las distintas ramas de resolucion antes de las cabezas de deteccion.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas (esquema 1x), con SGD, learning rate 0.02, weight decay 0.0001, decaimiento en las epocas 8 y 11 y batch de 32 (8 GPUs x 2 imagenes por GPU, segun el README de SysCV). El backbone se inicializa con pesos de ImageNet (`open-mmlab://msra/hrnetv2_w18`). La entrada es de 1280 x 720 sin reescalado, en RGB con media y desviacion tipica de ImageNet. En test se aplica un umbral de puntuacion de 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen (parametros no medidos por el autor del espejo). No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no es un modelo generativo.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion: peatones, ciclistas (rider), coches, camiones, autobuses, trenes, motos, bicicletas, semaforos y senales de trafico.
- Localizacion con cajas delimitadoras en formato COCO/BDD100K, con puntuaciones de confianza por deteccion.
- Procesamiento de imagen suelta, carpetas de imagenes, archivos de video y flujo de webcam mediante el script `infer.py`.
- Exportacion de resultados en formato JSON compatible con BDD100K (`--json out.json`).
- Umbral de puntuacion configurable (`--score-thr`, por defecto 0.3) y limite de frames (`--max-frames N`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.

## Casos de uso

- Reproduccion de baselines academicos en BDD100K: util para investigadores que necesitan comparar sus propios detectores contra un resultado de referencia del zoo de SysCV sin depender del host caido, gracias a la configuracion fijada y a la verificacion MD5 de los pesos.
- Prototipado de sistemas ADAS: el modelo detecta peatones, vehiculos y senales en imagenes de 1280 x 720, adecuado para validar pipelines de percepcion en fases tempranas antes de invertir en modelos mayores.
- Analisis de video de trafico: el script de inferencia acepta archivos de video y procesa frame a frame, lo que permite extraer estadisticas de ocupacion o conteo de vehiculos en grabaciones de camara fija.
- Demostraciones en vivo con webcam: el modo `infer.py 0 --show` permite visualizar detecciones en tiempo real sobre una camara conectada, util para talleres y docencia.
- Generacion de anotaciones preliminares: las salidas JSON en formato BDD100K pueden servir como preetiquetado para revisar y corregir manualmente, acelerando la creacion de datasets propios.
- Evaluacion comparativa de backbones ligeros: con 27,2 M de parametros, sirve como referencia de un detector de capacidad media para medir el coste/beneficio de arquitecturas mas grandes en el mismo dataset.
- Integracion en entornos docentes: la licencia BDD100K permite uso educativo, y el repositorio incluye requisitos para CPU y CUDA 11.8, lo que facilita montar practicas de vision por computador.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuacion de SysCV, marcados como no verificados). Box AP en estilo COCO sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 31,7 | 56,6 | 30,4 | 15,5 | 36,6 | 51,6 |
| test | 30,6 | 54,1 | 29,8 | 15,7 | 37,3 | 46,0 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 35,5 |
| rider | 26,3 |
| car | 52,0 |
| truck | 45,5 |
| bus | 46,7 |
| train | 0,0 |
| motorcycle | 22,9 |
| bicycle | 24,0 |
| traffic light | 25,4 |
| traffic sign | 39,2 |

El valor de mAP declarado en el model-index es 31,74 (validacion). No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de vision.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 27,2 M de parametros en FP32 los pesos ocupan aproximadamente 109 MB, y el consumo real dependera del tamano de lote y de las activaciones a 1280 x 720.
- GPU recomendadas: el repositorio incluye requisitos para CUDA 11.8 (`env/requirements-cu118.txt`) y para CPU (`env/requirements-cpu.txt`); el autor indica que el entorno CUDA no se ha probado todavia.
- GPU de consumo: por tamano del modelo, cabe con holgura en tarjetas de consumo (RTX 3060, RTX 4090, etc.), aunque no se aportan mediciones concretas.
- Despliegue: MMDetection 2.28.2 sobre PyTorch 2.0.1 y mmcv-full 1.7.2 en Python 3.10; el autor recomienda un entorno virtual nuevo. Tambien es posible ejecutar en CPU.
- Latencia y throughput: no disponibles. El autor no ha medido tiempos de inferencia.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K con los que comparar de forma rigurosa. Como referencia estructural:

| Modelo | Arquitectura | Parametros | Entrada | AP val BDD100K | Licencia |
|---|---|---|---|---|---|
| Este modelo | Faster R-CNN + HRNetV2p-W18 + HRFPN | 27,2 M | 1280 x 720 | 31,7 (no verificado) | BDD100K (uso no comercial) |
| Otros detectores del zoo SysCV | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La metrica AP de 31,74 esta marcada como no verificada y las predicciones de SysCV no se archivaron, por lo que no se ha validado caja por caja.
- El entorno CUDA no se ha probado; solo se ha comprobado la carga de pesos y la coincidencia MD5 con el original de SysCV.
- El modelo detecta la clase `train` con AP 0,0 en validacion, es decir, es practicamente incapaz de reconocer trenes.
- Rendimiento bajo en clases minoritarias o pequenas: APs de 15,5, motorcycle 22,9, bicycle 24,0 y traffic light 25,4.
- Es un detector de una sola tarea y un unico dominio (conduccion); no es un modelo de lenguaje y no admite prompts, tool calling ni razonamiento.
- Licencia BDD100K: uso educativo, de investigacion y sin animo de lucro. El uso comercial requiere revisar los terminos del dataset original.
- Riesgo de falsos positivos y negativos con el umbral por defecto de 0,3, especialmente en condiciones nocturnas o de baja visibilidad; el autor no aporta metricas desagregadas por franja horaria o clima.
- No se documentan sesgos demograficos ni geograficos mas alla de la composicion del dataset BDD100K; conviene auditar el comportamiento en escenarios no representados en el conjunto de entrenamiento.
- El repositorio es un espejo no oficial; la trazabilidad depende de la captura de Wayback Machine y del MD5 publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w18-1x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w18-1x/blob/main/LICENSE.txt
- Repositorio de modelos SysCV (BDD100K model zoo): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_hrnetv2p_w18_1x_det_bdd100k.py
- Paper de HRNet (Deep High-Resolution Representation Learning for Visual Recognition): https://arxiv.org/abs/1908.07919
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): no disponible como enlace directo en la informacion proporcionada
