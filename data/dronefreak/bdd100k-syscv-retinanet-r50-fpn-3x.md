# dronefreak/bdd100k-syscv-retinanet-r50-fpn-3x

## Resumen

RetinaNet R50-FPN 3x sobre BDD100K es un detector de objetos de una etapa entrenado para escenas de conduccion autonoma. Se trata de un espejo (mirror) recuperado del model zoo publico de SysCV (ETH Zurich), cuyo servidor `dl.cv.ethz.ch` esta fuera de linea; los pesos se rescataron de la Wayback Machine (captura del 19 de febrero de 2025) y se acompanan de la configuracion y los resultados originales de SysCV. El repositorio lo publica el usuario `dronefreak` e incluye un entorno fijado y un script de inferencia propio.

Arquitectonicamente es un RetinaNet clasico: backbone ResNet-50 inicializado con pesos de ImageNet, cuello Feature Pyramid Network (FPN) y cabezas densas con Focal Loss, entrenado durante 36 epocas (esquema 3x) sobre las 70.000 imagenes de entrenamiento de BDD100K con entrenamiento multi-escala. Detecta diez clases propias del dominio de conduccion: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.

Su relevancia es practica: es un checkpoint de referencia para investigacion en deteccion en escenas de conduccion que estaba practicamente inaccesible por la caida del host original. El espejo anade verificacion de pesos (MD5 coincidente con el original), comparacion de predicciones contra las salidas publicadas por SysCV y un entorno reproducible (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) que permite ejecutarlo hoy sin reconstruir el stack a mano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (one-stage, dense anchor-based) con backbone ResNet-50 y cuello FPN |
| Parametros totales | 36.569.662 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; clases en ingles segun taxonomia BDD100K) |
| Licencia | BDD100K (`license: other`), uso educativo, de investigacion y sin animo de lucro; la config de SysCV es Apache-2.0 |
| Formato de pesos | `model.safetensors` (equivalente tensor a tensor al `.pth` original); config en `.py` y `config.json` |
| Libreria | mmdetection 2.28.2 (mmcv-full 1.7.2, torch 2.0.1, Python 3.10) |
| Tarea | object-detection |
| Clases | pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign |
| Resolucion de entrada | 1280 x 720 (tamano nativo de BDD100K, sin redimensionado) |
| Tamano del repo | 0.6 GB |

## Arquitectura y entrenamiento

RetinaNet es un detector de una etapa pensado para mitigar el desbalance extremo entre anclas positivas y negativas mediante Focal Loss (paper ICCV 2017, arXiv:1708.02002). En esta implementacion, el backbone es una ResNet-50 con pesos iniciales de ImageNet (`torchvision://resnet50`), sobre la que se construye una FPN que produce predicciones a multiples escalas. Las cabezas de clasificacion y regresion de cajas son densas y comparten subredes entre niveles de la piramide.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con SGD de momento, learning rate 0.02, weight decay 0.0001, decaimiento del learning rate en las epocas 24 y 33, y batch efectivo de 32 (8 GPUs x 4 imagenes). Se aplico entrenamiento multi-escala con seis escalas entre (1280, 600) y (1280, 720). En inferencia se usa un umbral de score de 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen. No se documenta fase de RLHF ni ajuste por preferencias, algo esperable en un detector puramente supervisado.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion en las diez clases de BDD100K.
- Deteccion en video: el script `infer.py` acepta ficheros de video y flujo de webcam (indice de dispositivo).
- Salida en formato BDD100K mediante la opcion `--json out.json`, util para pipelines de evaluacion.
- Control del umbral de confianza (`--score-thr`, por defecto 0.3) y del numero maximo de fotogramas procesados (`--max-frames`).
- Ejecucion en CPU y en GPU (entornos separados `requirements-cpu.txt` y `requirements-cu118.txt`).
- Carga de pesos segura con `torch.load(weights_only=True)`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision.

## Casos de uso

- Investigacion en deteccion para conduccion autonoma: sirve como baseline reproducible del model zoo de SysCV para comparar nuevas arquitecturas o estrategias de aumento de datos sobre BDD100K, con pesos verificados por MD5 y configuracion exacta.
- Reproduccion de resultados academicos: el repositorio incluye las predicciones de validacion originales de SysCV, lo que permite contrastar el comportamiento del checkpoint frente a la referencia publicada antes de usarlo en un experimento.
- Prototipado de sistemas ADAS en laboratorio: deteccion de peatones, vehiculos y senales de trafico en imagenes a 1280 x 720, adecuada para validar logicas de alerta o analisis de escena en un entorno de investigacion.
- Analisis offline de video de trafico: procesar grabaciones con `infer.py` sobre ficheros de video y exportar detecciones en JSON para estudios de conteo, ocupacion o analisis de flujo.
- Docencia en vision por computador: ejemplo completo de pipeline mmdetection 2.x con entorno fijado, util para practicas de deteccion de objetos y evaluacion COCO-style.
- Pruebas de integracion en CPU: con 1,1 s/imagen en 8 hilos de CPU, permite validar pipelines sin depender de GPU dedicada.
- Generacion de pseudoetiquetas para preentrenamiento: sus detecciones pueden servir como etiquetas automaticas en conjuntos de imagenes de conduccion no anotados, siempre dentro de los limites de la licencia.

## Benchmarks y rendimiento

Resultados COCO-style box AP (%) en BDD100K, segun los ficheros de score de SysCV y su tabla del model zoo (datos declarados por el autor, no verificados de forma independiente):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 30.9 | 55.4 | 29.4 | 12.6 | 37.1 | 51.7 |
| test | 30.2 | no disponible | no disponible | no disponible | no disponible | no disponible |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 32.4 |
| rider | 24.4 |
| car | 50.2 |
| truck | 45.2 |
| bus | 47.4 |
| train | 0.0 |
| motorcycle | 22.4 |
| bicycle | 25.2 |
| traffic light | 23.9 |
| traffic sign | 38.0 |

Rendimiento de inferencia declarado: 0,05 s/imagen en una RTX 4070 SUPER y 1,1 s/imagen en 8 hilos de CPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 36,6 M de parametros en fp32 el peso ocupa aproximadamente 150 MB, por lo que la mayor parte del consumo proviene de las activaciones a 1280 x 720 y del cuello FPN, no de los pesos.
- GPU: el autor ha validado la ejecucion en una RTX 4070 SUPER con CUDA 11.8; cualquier GPU con suficiente memoria para mmdetection a esa resolucion deberia funcionar (A100, H100, RTX 4090, etc.), aunque no se documentan mediciones en esas tarjetas.
- Cabe en GPU de consumo: si, segun la validacion del autor en RTX 4070 SUPER; no se especifica la VRAM minima exacta.
- CPU: funciona con 8 hilos a 1,1 s/imagen (entorno `requirements-cpu.txt`).
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 (Python 3.10) mediante el entorno fijado del repo; no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo salvo via conversion, no incluida).
- Latencia: 0,05 s/imagen en RTX 4070 SUPER; throughput no documentado de forma explicita.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con otros detectores sobre BDD100K (por ejemplo, variantes de Faster R-CNN, YOLO o DETR del mismo model zoo). Los unicos datos comparativos disponibles son los propios resultados del modelo frente a sus splits val y test. Cualquier comparacion con alternativas requeriria consultar el model zoo de SysCV u otras publicaciones, que no forman parte de la informacion proporcionada.

| Modelo | Parametros | Contexto / entrada | AP en BDD100K val | Licencia |
|---|---|---|---|---|
| RetinaNet R50-FPN 3x (este) | 36,6 M | imagen 1280 x 720 | 30,9 | BDD100K (uso educativo/investigacion) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia, limitada a uso educativo, de investigacion y sin animo de lucro. El uso comercial no esta permitido sin autorizacion adicional.
- El modelo es un espejo no oficial: aunque el MD5 de los pesos coincide con el de SysCV y las claves cargan en su configuracion, la reproducibilidad no es exacta. En 20 imagenes de validacion, 1.854 de 1.989 cajas coinciden exactamente y 1.867 con IoU >= 0.5; la causa de la discrepancia es desconocida y persiste tanto en CPU como en GPU.
- Clase `train` con AP 0.0: el modelo no detecta trenes de forma util, probablemente por escasez de ejemplos en el dataset. No debe usarse para esa clase en produccion.
- Rendimiento bajo en objetos pequenos (APs 12,6) y en clases minoritarias (motorcycle 22,4, traffic light 23,9), lo que limita su uso en escenas con objetos lejanos o de baja frecuencia.
- Riesgo de falsos positivos y negativos en condiciones adversas (noche, lluvia, deslumbramiento): el autor incluye una demo con clips diurnos y nocturnos, pero no se aportan metricas desagregadas por condiciones.
- Entrenado exclusivamente con datos de BDD100K (mayoritariamente escenas urbanas y de carretera de determinadas regiones); puede generalizar mal a otras geografias, condiciones de trafico o dominios visuales.
- No procesa texto ni mantiene contexto conversacional: no es un modelo de lenguaje y no admite tool calling ni agentes.
- El stack de dependencias esta fijado a versiones antiguas (mmdetection 2.x, torch 2.0.1); requiere un entorno virtual limpio y no es compatible con las versiones actuales de mmdetection sin adaptacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre el espejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-r50-fpn-3x
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-r50-fpn-3x/blob/main/LICENSE.txt
- Model zoo de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_r50_fpn_3x_det_bdd100k.py
- Paper de RetinaNet (Focal Loss for Dense Object Detection, ICCV 2017): https://arxiv.org/abs/1708.02002
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
