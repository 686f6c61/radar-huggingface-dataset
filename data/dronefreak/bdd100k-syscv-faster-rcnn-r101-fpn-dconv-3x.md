# dronefreak/bdd100k-syscv-faster-rcnn-r101-fpn-dconv-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-faster-rcnn-r101-fpn-dconv-3x` es un detector de objetos Faster R-CNN con backbone ResNet-101, FPN y convoluciones deformables v2, entrenado sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo de lenguaje: es un checkpoint de vision por computador publicado originalmente por el grupo SysCV de la ETH Zurich y replicado en Hugging Face por el usuario `dronefreak` tras la caida del host original `dl.cv.ethz.ch`.

El interes de esta ficha es doble. Por un lado, es un detector clasico y bien documentado para la tarea de deteccion en BDD100K, con resultados de referencia (AP de 33,09 en validacion y 32,4 en test) y una verificacion de reproduccion exacta frente a las predicciones publicadas por SysCV. Por otro, el repositorio es un ejemplo de preservacion de artefactos: recupera pesos desde la Wayback Machine, fija un entorno reproducible (PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) e incluye un script de inferencia para imagen, video y webcam.

Arquitectonicamente es un detector de dos etapas con 61,7 millones de parametros, entrada nativa de 1280x720 y pesos en formato safetensors. La licencia es la de BDD100K, restringida a uso educativo, de investigacion y sin animo de lucro, lo que condiciona cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone ResNet-101, FPN y Deformable ConvNets v2 (DCN) |
| Parametros totales | 61.777.950 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 1280x720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | BDD100K (educativa, investigacion y sin animo de lucro); config de SysCV Apache-2.0 |
| Formato de pesos | safetensors (equivalente tensor a tensor al `.pth` original) |

## Arquitectura y entrenamiento

El modelo sigue la familia Faster R-CNN de dos etapas con un backbone ResNet-101 inicializado con pesos de ImageNet (`torchvision://resnet101`), un cuello Feature Pyramid Network (FPN) y convoluciones deformables v2 (DCNv2) segun el trabajo de Zhu et al. (CVPR 2019). La entrada se procesa a su resolucion nativa de BDD100K, 1280x720, sin redimensionado, con normalizacion ImageNet (media y desviacion tipica). En test se aplica un umbral de score de 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen.

El entrenamiento se realizo sobre las 70.000 imagenes del split de entrenamiento de BDD100K durante 36 epocas (esquema 3x), con SGD, learning rate 0,04, weight decay 0,0001, decaimiento en las epocas 24 y 33, batch de 32 (8 GPU x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). No se documenta uso de RLHF ni de tecnicas de alineacion, algo esperable en un detector clasico. La innovacion tecnica principal es la incorporacion de convoluciones deformables, que adaptan los campos receptivos a las formas de los objetos; el repositorio anade ademas un entorno fijado y un script de inferencia con salida en formato BDD100K.

## Capacidades

- Deteccion de objetos en escenas de conduccion (vehiculos, peatones, senales de trafico y demas clases de BDD100K).
- Inferencia sobre imagenes sueltas, carpetas de imagenes, archivos de video y webcam en directo.
- Salida de detecciones en formato JSON compatible con BDD100K, con umbral de score configurable (por defecto 0,3) y limite de fotogramas.
- Verificacion de reproduccion exacta: en 20 imagenes aleatorias de validacion genera las mismas 662 cajas y scores que las predicciones publicadas por SysCV.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual de una sola pasada.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion.

## Casos de uso

- Deteccion de vehiculos y peatones en video de trafico: el modelo procesa fotogramas a 1280x720 nativos y devuelve cajas con scores, adecuado para analisis offline de grabaciones o para prototipos de sistemas de asistencia a la conduccion.
- Anotacion asistida de datasets de conduccion: generar preanotaciones en formato BDD100K sobre imagenes nuevas y revisarlas manualmente, reduciendo el coste de etiquetado en proyectos de investigacion.
- Reproduccion de resultados academicos: al coincidir exactamente con las predicciones de SysCV, sirve como linea base verificable en experimentos de deteccion sobre BDD100K.
- Analisis de escenas nocturnas y diurnas: el repositorio incluye demostraciones sobre clips de dia y de noche, lo que permite evaluar el comportamiento del detector en condiciones de iluminacion variables.
- Prototipado de sistemas de conteo de trafico: integrado en un pipeline que lea video y agregue detecciones por fotograma para estimar flujos de vehiculos en un tramo concreto.
- Educacion y docencia en vision por computador: el entorno fijado (Python 3.10, PyTorch 2.0.1, mmdetection 2.28.2) y el script `infer.py` facilitan practicas reproducibles sobre deteccion de objetos con mmdetection.
- Investigacion sobre convoluciones deformables: permite comparar DCNv2 frente a convoluciones estandar en la misma tarea y dataset con una configuracion estable.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de la tabla del model zoo de SysCV; la metrica de validacion no esta verificada en el model-index):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 33,1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| test | 32,4 | 56,1 | 32,3 | 16,4 | 38,7 | 50,1 |

El model-index declara un Box AP de 33,09 en validacion (sin verificacion). No se han publicado en la informacion disponible resultados comparativos con otros detectores sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 61,7 millones de parametros en precision completa, el peso de los pesos ronda los 250 MB y el consumo real dependera del backend y del tamano de lote.
- El autor documenta inferencia en CPU: 4,6 segundos por imagen con 8 hilos de CPU.
- GPU recomendadas: no se especifican modelos concretos; el entorno incluye requisitos para CUDA 11.8 (`env/requirements-cu118.txt`) y una variante solo CPU (`env/requirements-cpu.txt`). El autor indica que el entorno CUDA no ha sido probado.
- Cabe en GPU de consumo: por tamano de pesos es plausible en tarjetas consumer, pero no se confirma en la informacion disponible.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre PyTorch 2.0.1 y Python 3.10; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de este tipo).
- Latencia y throughput: 4,6 s/imagen en CPU con 8 hilos; no se publican cifras de GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K con los que establecer una comparacion cuantitativa fiable. Como referencia cualitativa de la misma familia:

| Modelo | Arquitectura | Parametros | Contexto/entrada | AP en BDD100K | Licencia |
|---|---|---|---|---|---|
| Este modelo | Faster R-CNN R101-FPN DCN 3x | 61,7 M | 1280x720 | 33,1 (val) / 32,4 (test) | BDD100K |
| Otros detectores del model zoo de SysCV | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia BDD100K: uso educativo, de investigacion y sin animo de lucro; el uso comercial requiere revisar los terminos del fichero `LICENSE.txt` del repositorio.
- Entrenado exclusivamente sobre BDD100K (escenas de conduccion), por lo que su generalizacion a otros dominios visuales no esta garantizada.
- El autor advierte que el entorno CUDA no ha sido probado; la verificacion de reproduccion se realizo en CPU.
- El AP de validacion (33,1) no aparece verificado en el model-index y el fichero de scores de validacion no estaba archivado, segun la model card.
- Es un detector de objetos: no genera texto, no razona y no admite instrucciones en lenguaje natural; cualquier caso de uso conversacional queda fuera de su alcance.
- Riesgo de falsos positivos y negativos inherente a un umbral de score bajo (0,05 en test); en produccion conviene ajustar el umbral y validar con datos propios.
- Posibles sesgos derivados del dataset BDD100K (distribucion geografica, condiciones meteorologicas y de iluminacion, clases representadas).
- La demo del repositorio fue revisada fotograma a fotograma para evitar matriculas legibles y rostros identificables; en despliegues propios deben aplicarse medidas equivalentes de privacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r101-fpn-dconv-3x
- Model zoo de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_r101_fpn_dconv_3x_det_bdd100k.py
- Paper de Deformable ConvNets v2 (CVPR 2019): https://arxiv.org/abs/1811.11168
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-r101-fpn-dconv-3x/blob/main/LICENSE.txt
