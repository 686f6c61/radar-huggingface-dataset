# dronefreak/bdd100k-syscv-retinanet-pvt-s-fpn-3x

## Resumen

RetinaNet PVT-S-FPN 3x es un detector de objetos de una etapa para escenas de conduccion, entrenado sobre el conjunto de datos BDD100K. Combina un backbone Pyramid Vision Transformer Small (PVT-S) con un cuello Feature Pyramid Network (FPN) y la cabeza de deteccion de RetinaNet. El modelo procede del zoo de modelos de SysCV (ETH Zurich) y este repositorio de Hugging Face es un espejo que recupera los pesos desde la Wayback Machine, ya que el host original `dl.cv.ethz.ch` esta fuera de linea.

El checkpoint resuelve la deteccion de las diez clases de trafico de BDD100K (peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico) sobre imagenes de 1280 x 720, el tamano nativo del dataset. Con 32,7 millones de parametros y un peso de repositorio de 1,0 GB, es un modelo ligero pensado para investigacion en vision para conduccion autonoma, no para despliegue comercial.

Su relevancia actual es doble: por un lado, preserva un checkpoint historico que ya no es accesible desde su fuente original; por otro, anade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script de inferencia que reproducen exactamente las predicciones publicadas por SysCV, algo poco habitual en espejos de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (one-stage) con backbone Pyramid Vision Transformer Small (PVT-S) y cuello FPN |
| Parametros totales | 32.768.638 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth` en precision original) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | bdd100k (uso educativo, investigacion y sin animo de lucro) |
| Formato de pesos | safetensors y `.pth` (PyTorch); configuracion en `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

El modelo sigue el diseno de RetinaNet: una red de una etapa con cabeza de clasificacion y regresion anclada, funcion de perdida focal para el desbalanceo de clases y NMS posterior. El backbone es PVT-S, un transformer piramidal con atencion espacial reducida (SRA) que produce mapas de caracteristicas multiescala sin convoluciones, segun el paper "Pyramid Vision Transformer: A Versatile Backbone for Dense Prediction without Convolutions" (ICCV 2021). Sobre el backbone se aplica un FPN que alimenta la cabeza de RetinaNet.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (esquema 3x), con AdamW, learning rate 0.0001, weight decay 0.0001, decaimiento en las epocas 24 y 33, batch de 32 (8 GPUs x 2 imagenes) y entrenamiento multiescala con 6 escalas entre (1280, 600) y (1280, 720). El backbone se inicializo con pesos de ImageNet (`pvt_small.pth`). En test se usa umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen. No se documenta RLHF ni ajuste por preferencias, algo esperable en un detector.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion con diez clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Localizacion con cajas delimitadoras en formato COCO (AP, AP50, AP75, APs, APm, APl).
- Inferencia sobre imagenes sueltas, carpetas de imagenes, ficheros de video y webcam mediante `infer.py`.
- Exportacion de detecciones en formato BDD100K mediante la opcion `--json`.
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de fotogramas (`--max-frames`).
- Ejecucion en CPU (8 hilos) y en GPU CUDA 11.8 con resultado identico.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es exclusivamente un modelo de vision.

## Casos de uso

- Investigacion en deteccion para conduccion autonoma: sirve como linea base reproducible para comparar nuevas arquitecturas sobre BDD100K, con predicciones verificadas byte a byte frente a las de SysCV.
- Analisis offline de video de trafico: `infer.py drive.mov --out runs/` procesa un video completo y genera detecciones por fotograma, util para estudiar comportamiento de peatones y vehiculos en secuencias diurnas y nocturnas.
- Etiquetado asistido de nuevos datasets de conduccion: las detecciones en formato BDD100K (`--json`) pueden precargarse en herramientas de anotacion para reducir el trabajo manual en las diez clases de trafico.
- Monitorizacion de infraestructura viaria: deteccion de semaforos y senales de trafico en imagenes capturadas por camaras fijas para inventariar y auditar su estado.
- Prototipado embebido o en CPU: con 2,0 s/imagen en 8 hilos de CPU y 0,07 s/imagen en una RTX 4070 SUPER, es viable en entornos sin GPU para pruebas de concepto.
- Reproduccion de experimentos academicos: el repositorio fija versiones de torch, mmcv y mmdetection y documenta la correccion del desplazamiento de 1 px en `x2`/`y2`, lo que permite replicar resultados en papers.
- Docencia en vision por computador: ejemplo completo de pipeline mmdetection con configuracion, pesos y script de inferencia incluidos.

## Benchmarks y rendimiento

Resultados declarados por SysCV en la model card (Box AP en %, estilo COCO, sobre BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 31,2 | 56,6 | 29,0 | 13,5 | 36,4 | 53,4 |
| test | 30,7 | 55,0 | 29,3 | 14,1 | 36,8 | 48,1 |

AP por clase (val):

| Clase | AP |
|---|---|
| pedestrian | 32,8 |
| rider | 24,5 |
| car | 50,5 |
| truck | 44,0 |
| bus | 47,6 |
| train | 0,4 |
| motorcycle | 23,6 |
| bicycle | 25,5 |
| traffic light | 25,0 |
| traffic sign | 38,4 |

El valor de mAP declarado en el model-index es 31,23 (validacion). No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 32,7 millones de parametros y entrada de 1280 x 720, la inferencia cabe holgadamente en GPUs consumer de 8 GB o menos.
- GPU verificada por el autor: RTX 4070 SUPER, 0,07 s/imagen con CUDA 11.8 y TF32 desactivado.
- CPU: 2,0 s/imagen con 8 hilos; el entorno de CPU produce resultados identicos al de GPU.
- Cabe en cualquier GPU consumer moderna (RTX 3060 en adelante); no requiere A100 ni H100.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10, en un entorno virtual limpio (`uv venv`). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Carga de pesos con `torch.load(weights_only=True)`; el repositorio incluye `env/requirements-cu118.txt` y `env/requirements-cpu.txt`.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K con los que establecer una comparativa numerica fiable. Como referencia estructural, el zoo de SysCV incluye otras variantes de RetinaNet sobre BDD100K (por ejemplo, con backbone PVT-T), pero sus metricas no se detallan en esta ficha. Cualquier comparacion con Faster R-CNN, YOLO o DETR sobre el mismo dataset requeriria datos que no estan disponibles aqui.

## Limitaciones y advertencias

- Licencia BDD100K: restringida a uso educativo, de investigacion y sin animo de lucro; el uso comercial no esta permitido sin autorizacion adicional.
- Rendimiento muy bajo en la clase train (AP 0,4), practicamente inutilizable para esa categoria.
- APs de 13,5 en validacion: los objetos pequenos se detectan con dificultad, lo que afecta a peatones y senales lejanas.
- Entrada fija de 1280 x 720 sin redimensionado; imagenes con otra relacion de aspecto pueden degradar el rendimiento.
- Modelo entrenado exclusivamente en escenas de conduccion de BDD100K; no generaliza a otros dominios visuales.
- Riesgo de falsos positivos y negativos en condiciones de baja iluminacion o clima adverso, aunque el autor incluye una demo nocturna verificada.
- Es un espejo no oficial: los pesos se recuperaron de la Wayback Machine (captura del 19 de febrero de 2025); la verificacion MD5 (`7db7fcfbd6aab187b55cac996a6d15e1`) y la reproduccion exacta de predicciones mitigan el riesgo, pero la fuente original sigue fuera de linea.
- No se documentan sesgos demograficos ni geograficos especificos, aunque BDD100K tiene una distribucion propia de ciudades y condiciones que puede trasladarse al modelo.
- Requiere un stack antiguo (mmdetection 2.x) que puede entrar en conflicto con otros proyectos; se recomienda un entorno virtual aislado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvt-s-fpn-3x
- Repositorio SysCV bdd100k-models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_pvt-s_fpn_3x_det_bdd100k.py
- Paper PVT (ICCV 2021): https://arxiv.org/abs/2102.12122
- Pesos ImageNet del backbone PVT-S: https://github.com/whai362/PVT/releases/download/v2/pvt_small.pth
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvt-s-fpn-3x/blob/main/LICENSE.txt
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
