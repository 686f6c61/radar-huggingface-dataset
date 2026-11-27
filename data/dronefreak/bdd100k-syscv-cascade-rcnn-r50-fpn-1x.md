# dronefreak/bdd100k-syscv-cascade-rcnn-r50-fpn-1x

## Resumen

Cascade R-CNN R50-FPN 1x sobre BDD100K es un detector de objetos para escenas de conduccion, publicado como espejo del zoo de modelos de SysCV (ETH Zurich). El checkpoint original estaba alojado en `dl.cv.ethz.ch`, que ya no esta operativo; este repositorio recupera los pesos desde una captura de la Wayback Machine (19 de febrero de 2025) y anade un entorno fijado y un script de inferencia. El modelo emplea la arquitectura Cascade R-CNN (CVPR 2018) con backbone ResNet-50 e FPN, y detecta diez clases de trafico: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.

El interes practico del repositorio no esta en la novedad del metodo, sino en la reproducibilidad: los pesos son identicos byte a byte a los de SysCV (MD5 `50e9ed3a30a783ea7249b0974833bece`) y la inferencia reproduce exactamente las predicciones publicadas sobre imagenes de validacion. Es, por tanto, una pieza util para lineas base de deteccion en conduccion autonoma y para comparar contra detectores mas modernos con un entorno que funciona hoy.

Con 69,2 millones de parametros y un tamano de repositorio de 0,7 GB, es un modelo ligero para los estandares actuales, pensado para inferencia en CPU o GPU modesta. Su AP de caja en validacion es 32,4, con un rendimiento notablemente bajo en clases minoritarias como tren (0,0) o bicicleta (25,0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN con backbone ResNet-50 e FPN (mmdetection 2.x) |
| Parametros totales | 69.232.636 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1280 x 720) |
| Tipos de cuantizacion | no disponible (solo pesos FP32 en safetensors y `.pth`) |
| Idiomas soportados | no aplica (modelo de deteccion de imagenes) |
| Licencia | BDD100K (`other`): uso educativo, de investigacion y sin animo de lucro |
| Formato de pesos | safetensors y `.pth` (mismos tensores) |

## Arquitectura y entrenamiento

Cascade R-CNN es un detector de dos etapas que encadena varias cabezas de clasificacion y regresion con umbrales de IoU crecientes, de modo que cada etapa refina las propuestas de la anterior con una distribucion de calidad mas alta. El backbone es ResNet-50 inicializado con pesos de ImageNet (`torchvision://resnet50`), sobre el que se anade un FPN para la piramide de caracteristicas. La entrada es de 1280 x 720, el tamano nativo de BDD100K, sin redimensionado, con normalizacion media y desviacion tipica de ImageNet en RGB.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas (programa 1x), con SGD de momento, learning rate 0,04, weight decay 0,0001, decaimiento en las epocas 8 y 11, y batch de 32 (8 GPU x 4 imagenes). En test se aplica umbral de score 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. La configuracion procede del repositorio de SysCV (Apache-2.0) y se ha fusionado en `original_config.py`, con `config.py` heredando sin cambios.

## Capacidades

- Deteccion de objetos en imagenes y video de escenas de conduccion en las diez clases de BDD100K.
- Inferencia sobre imagen suelta, carpeta de imagenes, fichero de video o camara web (`infer.py`).
- Exportacion de detecciones en formato BDD100K mediante `--json`.
- Ajuste del umbral de score (`--score-thr`, por defecto 0,3) y limite de fotogramas (`--max-frames`).
- Carga segura de pesos con `torch.load(weights_only=True)`.
- Entorno reproducible fijado: Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2 (variantes CUDA 11.8 y CPU).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de la vision.

## Casos de uso

- Linea base de deteccion en investigacion sobre BDD100K: permite reproducir exactamente los resultados publicados por SysCV (771 cajas identicas en 20 imagenes de validacion) y comparar nuevos metodos contra una referencia estable.
- Prototipado de sistemas ADAS en CPU: con 2,5 s por imagen en 8 hilos de CPU, sirve para validar pipelines de percepcion sin depender de GPU.
- Etiquetado asistido de datos de conduccion: generar preanotaciones en formato BDD100K (`--json`) para revision humana en conjuntos propios de imagenes o video.
- Analisis de trafico en video: procesar grabaciones de camaras fijas o vehiculo para contar vehiculos, peatones y ciclistas por fotograma con `--max-frames` para acotar coste.
- Pruebas de robustez dia/noche: el repositorio incluye una demo con clips diurnos y nocturnos de validacion, util para evaluar la degradacion del detector en condiciones de poca luz.
- Despliegue en entornos docentes: el entorno fijado y el script de inferencia simplifican la puesta en marcha en asignaturas de vision por computador.
- Verificacion de integridad de pesos: la comprobacion por MD5 y la reproduccion exacta permiten auditar la cadena de custodia de un checkpoint recuperado de un host caido.

## Benchmarks y rendimiento

Resultados declarados por SysCV (AP de caja estilo COCO, en porcentaje) sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32,4 | 56,3 | 31,6 | 15,1 | 37,3 | 54,3 |
| test | 31,2 | 53,5 | 31,0 | 15,6 | 37,8 | 48,4 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 35,3 |
| rider | 25,8 |
| car | 52,7 |
| truck | 46,3 |
| bus | 48,3 |
| train | 0,0 |
| motorcycle | 24,4 |
| bicycle | 25,0 |
| traffic light | 25,9 |
| traffic sign | 40,4 |

No se han publicado en la informacion disponible resultados de benchmarks en otras tareas (segmentacion, seguimiento) ni comparaciones numericas con otros detectores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 69,2 M de parametros en FP32 el peso de los pesos ronda los 0,28 GB, y la activacion a 1280 x 720 con FPN requiere varios GB adicionales en GPU.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA 11.8; el autor no especifica modelos concretos.
- CPU: funciona en CPU (entorno `requirements-cpu.txt`); 2,5 s por imagen en 8 hilos.
- Consumer GPU: previsiblemente cabe en GPUs de consumo con suficiente memoria para mmdetection 2.x a 1280 x 720, aunque el autor no aporta mediciones.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 2,5 s/imagen en CPU con 8 hilos; el entorno CUDA no ha sido probado por el autor.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K con los que comparar de forma rigurosa. Como referencia cualitativa:

| Modelo | Arquitectura | Parametros | Contexto/entrada | AP val BDD100K | Licencia |
|---|---|---|---|---|---|
| Este modelo | Cascade R-CNN R50-FPN 1x | 69,2 M | 1280 x 720 | 32,4 | BDD100K (solo investigacion) |
| Alternativas del zoo SysCV | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy desigual por clase: tren obtiene AP 0,0 y bicicleta, motocicleta y rider quedan por debajo de 26, lo que desaconseja su uso en produccion para esas categorias.
- AP global moderado (32,4 en validacion) para los estandares actuales de deteccion; es una linea base, no un detector de ultima generacion.
- Entrenado exclusivamente con datos de BDD100K (escenas de conduccion), por lo que no se espera buen rendimiento fuera de ese dominio.
- La licencia BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro; no permite uso comercial sin autorizacion adicional.
- El autor no ha probado el entorno CUDA; solo se valida la inferencia en CPU.
- Riesgo de falsos positivos y negativos con el umbral por defecto de 0,3, especialmente en condiciones nocturnas o de oclusion.
- El checkpoint procede de una captura de Wayback Machine; aunque el MD5 coincide con el original, la cadena de custodia depende de esa verificacion.
- No se han publicado evaluaciones de sesgo demografico ni de robustez mas alla de los clips de demo dia/noche.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-r50-fpn-1x
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-r50-fpn-1x/blob/main/LICENSE.txt
- Zoo de modelos SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/cascade_rcnn_r50_fpn_1x_det_bdd100k.py
- Paper de Cascade R-CNN (CVPR 2018): https://arxiv.org/abs/1712.00726
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
