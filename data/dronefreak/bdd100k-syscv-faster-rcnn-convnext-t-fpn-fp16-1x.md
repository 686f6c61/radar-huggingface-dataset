# dronefreak/bdd100k-syscv-faster-rcnn-convnext-t-fpn-fp16-1x

## Resumen

El modelo `dronefreak/bdd100k-syscv-faster-rcnn-convnext-t-fpn-fp16-1x` es un detector de objetos de dos etapas (Faster R-CNN) con backbone ConvNeXt-Tiny y cuello FPN, entrenado sobre el conjunto de datos BDD100K para deteccion de escenas de conduccion. No es un modelo de lenguaje: es un checkpoint de vision por computador publicado en formato mmdetection, orientado a la deteccion de peatones, vehiculos, senales y semaforos en imagenes y video de trafico. Lo desarrolla el usuario `dronefreak` como espejo del zoo de modelos oficial de SysCV (ETH Zurich), cuyo servidor de descargas `dl.cv.ethz.ch` esta fuera de linea; los pesos se recuperaron del Wayback Machine (captura del 19 de febrero de 2025).

La relevancia actual del repositorio es practica: preserva un checkpoint que de otro modo seria inaccesible y anade un entorno de ejecucion fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, mmcls 0.25.0) junto con un script de inferencia para imagen, carpeta de imagenes, video y webcam. Con 45.093.346 parametros y un tamano de repositorio de 0,9 GB, es un modelo ligero que cabe en GPU de consumo y que prioriza la reproducibilidad sobre el rendimiento puntero.

Arquitectonicamente combina un backbone convolucional moderno (ConvNeXt-Tiny, inicializado con pesos ImageNet) con una cabeza Faster R-CNN sobre FPN, procesando la resolucion nativa de BDD100K (1280 x 720) sin redimensionado. Su valor esta en servir como linea base reproducible para investigacion en conduccion autonoma y como componente de deteccion en pipelines de video, no en competir con detectores de ultima generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone ConvNeXt-Tiny y cuello FPN |
| Parametros totales | 45.093.346 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 1280 x 720 RGB) |
| Tipos de cuantizacion | no disponible (pesos en FP16 y safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | no disponible (sin capacidades linguisticas) |
| Licencia | bdd100k (uso educativo, investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; configuracion en `config.py` / `original_config.py` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma clasico de deteccion en dos etapas: un backbone ConvNeXt-Tiny extrae caracteristicas, un FPN las combina a multiples escalas y una cabeza Faster R-CNN genera propuestas de region y las clasifica y refina. El backbone se inicializa con pesos ImageNet (`convnext-tiny_3rdparty_32xb128-noema_in1k`). La entrada es la resolucion nativa de BDD100K, 1280 x 720, con normalizacion ImageNet (media y desviacion estandar) y sin redimensionado, lo que preserva la escala real de los objetos de trafico.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas (calendario 1x), con AdamW, learning rate 0,0001, weight decay 0,05, decaimiento de la tasa en las epocas 9 y 11, batch de 32 (8 GPU x 4 imagenes) y precision mixta FP16. En inferencia se aplica un umbral de puntuacion de 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. No se documenta RLHF ni tecnicas de alineacion, al no tratarse de un modelo generativo. La verificacion del espejo es notable: el MD5 `c643d3629144c46bdf890abe1acba377` coincide con el archivo de SysCV y todas las claves cargan en su configuracion, aunque en una comparacion sobre 20 imagenes de validacion solo 16 de las 798 cajas publicadas resultan identicas y la mayor diferencia de puntuacion alcanza 0,2519, sin causa investigada.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion en 10 clases: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.
- Inferencia sobre imagen individual, carpeta de imagenes, archivo de video y webcam en directo mediante `infer.py`.
- Salida en formato BDD100K mediante la opcion `--json out.json`.
- Control de umbral de puntuacion (`--score-thr`, por defecto 0,3) y limite de fotogramas procesados (`--max-frames`).
- Ejecucion en CPU (1,7 s/imagen con 8 hilos) o GPU con entorno CUDA 11.8.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, por su naturaleza de modelo de vision.

## Casos de uso

- Linea base reproducible en investigacion: sirve para comparar nuevas propuestas de deteccion sobre BDD100K con un checkpoint oficial de SysCV, entorno fijado y pesos verificados por MD5, evitando la variabilidad de reentrenamientos.
- Analisis de video de trafico: `infer.py` procesa archivos de video fotograma a fotograma con umbral configurable, adecuado para auditar grabaciones de camara de salpicadero o vigilancia urbana.
- Prototipado de sistemas ADAS: con 45 millones de parametros y ejecucion en CPU a 1,7 s/imagen, permite validar pipelines de percepcion en equipos sin GPU dedicada.
- Deteccion en tiempo real desde webcam: la opcion `infer.py 0 --show` habilita pruebas de demostracion en directo, util para validar latencia antes de integrar en un sistema mayor.
- Etiquetado asistido y preanotacion: las detecciones exportadas en JSON con formato BDD100K pueden precargarse en herramientas de anotacion para reducir el trabajo manual en nuevos conjuntos de escenas de conduccion.
- Educacion y docencia: el repositorio incluye entorno fijado y script de inferencia, lo que lo convierte en un ejemplo autocontenido de despliegue de mmdetection 2.x con Faster R-CNN y ConvNeXt.
- Recuperacion de artefactos: al ser un espejo del zoo de SysCV con servidor caido, actua como fuente de pesos para reproducir resultados historicos de ese zoo.

## Benchmarks y rendimiento

Resultados declarados por el autor, procedentes de los ficheros de puntuacion de SysCV (Box AP en porcentaje, estilo COCO, sobre BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 33,3 | 59,6 | 31,6 | 16,1 | 37,6 | 55,2 |
| test | 32,0 | 56,8 | 31,0 | 16,3 | 38,2 | 49,2 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 36,0 |
| rider | 27,7 |
| car | 52,1 |
| truck | 46,6 |
| bus | 49,7 |
| train | 3,5 |
| motorcycle | 25,6 |
| bicycle | 26,8 |
| traffic light | 25,4 |
| traffic sign | 39,8 |

La metrica global reportada en la model-index es mAP 33,32 en validacion (no verificada). No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 45 millones de parametros en FP16 el peso de los pesos ronda los 90 MB, por lo que el consumo dominante es el de las activaciones a 1280 x 720.
- GPU recomendadas: no se especifican; el entorno incluye `env/requirements-cu118.txt` para CUDA 11.8. Cualquier GPU NVIDIA con soporte CUDA 11.8 deberia ser suficiente, aunque el autor indica que el entorno CUDA no se ha probado.
- GPU de consumo: por tamano, el modelo cabe con holgura en tarjetas como RTX 3060, RTX 4060 o superiores; no hay medicion publicada que lo confirme.
- CPU: validado a 1,7 s/imagen con 8 hilos, mediante `env/requirements-cpu.txt`.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2, mmcls 0.25.0, torch 2.0.1 y Python 3.10; el script `infer.py` cubre imagen, video y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: unica cifra publicada, 1,7 s/imagen en CPU con 8 hilos; sin datos de GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K para establecer una comparacion numerica rigurosa. Como referencia estructural:

| Modelo | Familia | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN + ConvNeXt-T + FPN) | Deteccion en dos etapas | 45.093.346 | 1280 x 720 | bdd100k (uso no comercial) | Hugging Face, espejo de SysCV |
| Otros modelos del zoo SysCV BDD100K | Deteccion (varias familias) | no disponible | no disponible | Apache-2.0 (config) / bdd100k (pesos) | Servidor original caido; espejos comunitarios |
| Detectores de una etapa tipo YOLO sobre BDD100K | Deteccion en una etapa | no disponible | variable | variable | Multiples repositorios |

Los datos de rendimiento de las alternativas no estan disponibles en la informacion consultada.

## Limitaciones y advertencias

- Licencia BDD100K: restringida a uso educativo, de investigacion y sin animo de lucro; el uso comercial requiere atencion expresa a los terminos del dataset.
- El modelo solo detecta las 10 clases de BDD100K; no cubre otras categorias de objetos.
- Rendimiento muy desigual por clase: AP de 3,5 para tren y de 52,1 para coche, lo que desaconseja su uso en escenarios centrados en clases minoritarias.
- Sesgo de dominio: entrenado exclusivamente con escenas de conduccion de BDD100K, por lo que su generalizacion a otros dominios visuales no esta garantizada ni documentada.
- El espejo no es exacto: solo 16 de 798 cajas publicadas coinciden de forma identica en la verificacion del autor, con diferencias de puntuacion de hasta 0,2519; la causa no se investigo.
- El entorno CUDA no ha sido probado por el autor; solo se valido la inferencia en CPU.
- Riesgo de falsos negativos y positivos en objetos pequenos (APs de 16,1 en validacion), relevante para seguridad en conduccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- No debe confundirse con un modelo generativo: no produce texto, no razona y no soporta conversacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-convnext-t-fpn-fp16-1x
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-convnext-t-fpn-fp16-1x/blob/main/LICENSE.txt
- Zoo de modelos SysCV BDD100K (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_convnext-t_fpn_fp16_1x_det_bdd100k.py
- Paper de ConvNeXt (A ConvNet for the 2020s, CVPR 2022): https://arxiv.org/abs/2201.03545
- Pesos ImageNet del backbone: https://download.openmmlab.com/mmclassification/v0/convnext/downstream/convnext-tiny_3rdparty_32xb128-noema_in1k_20220301-795e9634.pth
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
