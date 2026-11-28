# dronefreak/bdd100k-syscv-libra-faster-rcnn-r50-fpn-3x

## Resumen

Libra R-CNN R50-FPN 3x sobre BDD100K es un detector de objetos de dos etapas especializado en escenas de conduccion. Lo desarrolla originalmente el grupo SysCV de la ETH Zurich como parte de su *model zoo* de referencia para el conjunto de datos BDD100K; este repositorio de Hugging Face es un espejo publicado por el usuario `dronefreak` que recupera los pesos desde la Wayback Machine tras la caida del host `dl.cv.ethz.ch`, y anade un entorno de ejecucion fijado y un script de inferencia.

El modelo resuelve la deteccion de diez clases propias de la conduccion autonoma (peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico) sobre imagenes de 1280 x 720, la resolucion nativa de BDD100K. Emplea la arquitectura Libra R-CNN con backbone ResNet-50 y cuello FPN, una variante de Faster R-CNN que introduce muestreo equilibrado, fusion de caracteristicas y refinamiento del objetivo para mitigar los desequilibrios de entrenamiento tipicos en deteccion.

Su relevancia actual es fundamentalmente practica y de reproducibilidad: los pesos originales ya no estan disponibles en el servidor de origen y este espejo permite recuperarlos con verificacion criptografica (MD5 coincidente con el original) y reproduccion exacta de las predicciones publicadas. Con 41,7 millones de parametros y un tamano de repositorio de 0,6 GB, es un modelo ligero y desplegable incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Libra R-CNN con backbone ResNet-50 y FPN (detector de dos etapas, familia Faster R-CNN) |
| Parametros totales | 41.710.594 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | BDD100K (uso educativo, de investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y `.pth` equivalente en `original/` |

## Arquitectura y entrenamiento

Libra R-CNN es una evolucion de Faster R-CNN que ataca tres desequilibrios del entrenamiento en deteccion: el sesgo en el muestreo de regiones candidatas (resuelto con *IoU-balanced sampling*), la integracion desequilibrada de caracteristicas multinivel del FPN (mediante un modulo de fusion equilibrada) y el desequilibrio en el refinamiento del objetivo (con un refinamiento balanceado de la cabeza de regresion). El backbone es un ResNet-50 inicializado con pesos de ImageNet (`torchvision://resnet50`) y el cuello es un FPN estandar.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (programacion 3x), con SGD a tasa de aprendizaje 0,04, decaimiento de peso 0,0001, reducciones de tasa en las epocas 24 y 33, tamano de lote 32 (8 GPU x 4 imagenes) y entrenamiento multi-escala con seis escalas entre (1280, 600) y (1280, 720). No se documenta RLHF ni DPO (no aplica a un detector). En inferencia se aplica un umbral de puntuacion de 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen.

## Capacidades

- Deteccion de objetos en imagenes y video de escenas de conduccion, con diez clases: peatones, motoristas, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico.
- Procesamiento de imagen individual, carpetas de imagenes, archivos de video y flujo de webcam en tiempo real mediante el script `infer.py`.
- Exportacion de detecciones en formato BDD100K mediante la opcion `--json`.
- Control del umbral de puntuacion (`--score-thr`, por defecto 0,3) y del numero maximo de fotogramas procesados (`--max-frames`).
- Funcionamiento tanto en GPU (CUDA 11.8) como en CPU, con resultados identicos verificados en ambos entornos.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente ni procesamiento de lenguaje natural: es exclusivamente un modelo de vision por computador.

## Casos de uso

- **Percepcion en prototipos de conduccion autonoma**: el modelo detecta las diez clases de BDD100K sobre imagenes de 1280 x 720 sin reescalado, lo que lo hace directamente utilizable como linea base de percepcion en vehiculos de investigacion y en la comparacion de nuevos detectores contra una referencia publicada.
- **Analisis de trafico urbano a partir de video**: gracias al modo de video de `infer.py` y a su coste de 0,05 s/imagen en una RTX 4070 SUPER (unos 20 FPS), puede procesar grabaciones de camaras de vigilancia vial para contar vehiculos, peatones y ciclistas por fotograma.
- **Evaluacion de condiciones nocturnas y adversas**: el autor incluye una demostracion con clips diurnos y nocturnos de validacion, lo que permite usar el modelo para estudiar la degradacion de la deteccion en escenarios de baja iluminacion, frecuentes en BDD100K.
- **Etiquetado asistido y pre-anotacion de datasets**: con la salida en formato BDD100K (`--json`), las detecciones pueden precargarse en herramientas de anotacion para reducir el trabajo manual en la construccion de nuevos conjuntos de datos de conduccion.
- **Investigacion en deteccion equilibrada**: al ser una implementacion fiel de Libra R-CNN, sirve como referencia reproducible para estudiar el efecto del muestreo equilibrado y la fusion multinivel frente a Faster R-CNN estandar.
- **Despliegue en entornos sin GPU**: el modelo funciona en CPU a 1,6 s/imagen con 8 hilos, lo que permite integrarlo en pipelines de analisis por lotes o en estaciones de trabajo sin acelerador grafico.
- **Reproduccion y auditoria de resultados publicados**: la coincidencia exacta de 951 cajas y puntuaciones en 20 imagenes de validacion permite validar pipelines de evaluacion propios contra las predicciones oficiales de SysCV.

## Benchmarks y rendimiento

Resultados declarados por SysCV (AP estilo COCO, en porcentaje, sobre BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32,0 | 56,3 | 30,9 | 15,1 | 37,1 | 52,1 |
| test | 31,0 | 53,8 | 31,0 | 15,8 | 37,9 | 46,5 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 34,8 |
| rider | 26,8 |
| car | 52,2 |
| truck | 47,0 |
| bus | 48,2 |
| train | 0,0 |
| motorcycle | 24,3 |
| bicycle | 25,6 |
| traffic light | 24,3 |
| traffic sign | 36,9 |

Nota: el valor de mAP de 32,0 del `model-index` figura como no verificado (`verified: false`) y corresponde al AP de validacion reportado por SysCV. La clase `train` obtiene 0,0, presumiblemente por su escasisima representacion en el conjunto de validacion.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explicita en la informacion proporcionada. Con 41,7 millones de parametros en precision completa, el peso de los pesos ronda los 167 MB, por lo que la huella de memoria es moderada; el consumo real dependera del tamano de lote y de las activaciones a 1280 x 720.
- **GPU recomendadas**: el autor verifica el funcionamiento en una RTX 4070 SUPER con CUDA 11.8. Por el tamano del modelo, cualquier GPU consumer con suficiente memoria deberia ser apta; no se documentan pruebas en A100 o H100.
- **CPU**: funciona en CPU; 1,6 s/imagen con 8 hilos.
- **Rendimiento**: 0,05 s/imagen en RTX 4070 SUPER (aproximadamente 20 FPS).
- **Despliegue**: entorno fijado con Python 3.10, torch 2.0.1, mmcv-full 1.7.2 y mmdetection 2.28.2, instalable mediante `uv` con `env/requirements-cu118.txt` (GPU) o `env/requirements-cpu.txt` (CPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). Los pesos se cargan con `torch.load(weights_only=True)`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | AP en BDD100K (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Libra R-CNN R50-FPN 3x (este) | 41,7 M | 1280 x 720 | 32,0 | BDD100K (solo investigacion/educativa) | Espejo en HF con verificacion MD5 |
| Faster R-CNN R50-FPN (familia SysCV) | no disponible | 1280 x 720 | no disponible en la informacion proporcionada | BDD100K | Model zoo SysCV (host original caido) |
| Otras variantes del zoo SysCV (p. ej. Cascade/Mask R-CNN) | no disponible | 1280 x 720 | no disponible en la informacion proporcionada | BDD100K | Model zoo SysCV (host original caido) |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa fiable; los valores de las filas alternativas se indican como no disponibles.

## Limitaciones y advertencias

- **Licencia restrictiva**: los pesos derivan de BDD100K y quedan sujetos a su licencia, limitada a uso educativo, de investigacion y sin animo de lucro. El uso comercial no esta permitido sin autorizacion adicional.
- **Clase `train` inutilizable**: AP de 0,0 en validacion, por lo que no debe confiarse en las detecciones de trenes.
- **Rendimiento modesto en clases pequenas**: APs de 15,1 y AP de 24,3 en semaforos y motocicletas indican dificultades con objetos pequenos o poco frecuentes.
- **Sesgos del dataset**: BDD100K se recopilo en entornos de conduccion de determinadas regiones; el modelo puede generalizar mal a geografias, condiciones meteorologicas o tipos de via no representados.
- **Riesgo de falsos negativos y positivos**: el umbral de puntuacion por defecto en inferencia (0,05) es muy permisivo y genera hasta 100 cajas por imagen; en produccion conviene elevarlo y validar la precision/recall en el dominio objetivo.
- **Sin capacidades de lenguaje ni agentes**: no admite tool calling, razonamiento multi-paso ni instrucciones en lenguaje natural; su unica salida son cajas y clases.
- **Entorno fragil**: depende de mmdetection 2.x y versiones antiguas de torch y mmcv; requiere un entorno virtual limpio y no es compatible con stacks modernos de mmdetection 3.x.
- **Procedencia de los pesos**: al recuperarse desde la Wayback Machine, la confianza depende de la verificacion MD5 documentada; conviene comprobarla antes de usar el modelo en produccion.
- **Privacidad**: las imagenes de conduccion pueden contener matriculas y rostros; el autor indica que la demo fue revisada fotograma a fotograma, pero el uso sobre datos propios exige medidas de anonimizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-libra-faster-rcnn-r50-fpn-3x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-libra-faster-rcnn-r50-fpn-3x/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/libra_faster_rcnn_r50_fpn_3x_det_bdd100k.py
- Paper de Libra R-CNN (CVPR 2019): https://arxiv.org/abs/1904.02701
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
