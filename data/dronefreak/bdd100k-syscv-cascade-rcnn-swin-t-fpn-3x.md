# dronefreak/bdd100k-syscv-cascade-rcnn-swin-t-fpn-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-cascade-rcnn-swin-t-fpn-3x` es un detector de objetos para escenas de conduccion, concretamente un Cascade R-CNN con backbone Swin Transformer Tiny y cuello FPN, entrenado sobre el conjunto de datos BDD100K. No es un modelo de lenguaje: es un checkpoint de vision por computador empaquetado para la libreria MMDetection y publicado como espejo de un modelo del zoo oficial de SysCV (ETH Zurich), cuyo servidor de descargas (`dl.cv.ethz.ch`) esta fuera de linea y cuyos pesos se recuperaron a traves de la Wayback Machine.

El checkpoint resuelve la tarea de deteccion de 10 clases de objetos relevantes en escenas de trafico: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico. Con 72,6 millones de parametros y una entrada nativa de 1280x720 (la resolucion original de BDD100K, sin reescalado), esta pensado para evaluacion e investigacion en conduccion autonoma y analisis de escenas viales, no para despliegue comercial.

Su relevancia actual es fundamentalmente de reproducibilidad: el autor anade un entorno de dependencias fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2 sobre Python 3.10), un script de inferencia que acepta imagenes, carpetas, video y webcam, y verificacion por MD5 de los pesos originales. Sirve como referencia historica del zoo de SysCV y como base para comparaciones con detectores mas modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN con backbone Swin Transformer Tiny (patch 4, ventana 7) y FPN |
| Parametros totales | 72.606.594 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 1280x720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | BDD100K (uso educativo, investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` original |

## Arquitectura y entrenamiento

El modelo sigue la receta clasica de deteccion en dos etapas: un backbone Swin Transformer Tiny que extrae caracteristicas jerarquicas mediante atencion con ventanas desplazadas, un cuello Feature Pyramid Network (FPN) que combina mapas de distintas escalas y una cabeza Cascade R-CNN con tres etapas de refinamiento de propuestas, cada una con su propio umbral de IoU creciente. La entrada es RGB a 1280x720 con normalizacion ImageNet (media y desviacion tipica), sin redimensionado respecto al tamano nativo de BDD100K.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (calendario "3x"), con optimizador AdamW, tasa de aprendizaje 0,0001, weight decay 0,05, decaimiento de la tasa en las epocas 27 y 33, batch de 32 (8 GPU x 2 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). El backbone se inicializa con pesos de ImageNet (`swin_tiny_patch4_window7_224.pth`). En inferencia se aplica un umbral de puntuacion de 0,05 y NMS con IoU 0,5, con un maximo de 100 cajas por imagen.

## Capacidades

- Deteccion de objetos en escenas de conduccion en 10 clases: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.
- Deteccion en condiciones de dia y de noche (el autor incluye una demo con clips diurnos y nocturnos de validacion).
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video y camara webcam en directo mediante `infer.py`.
- Exportacion de detecciones en formato BDD100K mediante `--json`.
- Ajuste del umbral de puntuacion (`--score-thr`, por defecto 0,3) y limite de fotogramas procesados (`--max-frames`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas o multimodales mas alla de la deteccion visual.

## Casos de uso

- Analisis offline de videos de trafico: procesar grabaciones con `infer.py drive.mov` para extraer cajas por fotograma y volcarlas en JSON con formato BDD100K, util para construir datasets derivados o auditar escenas.
- Investigacion en conduccion autonoma: servir de baseline reproducible del zoo de SysCV para comparar con detectores mas recientes sobre el split de validacion de BDD100K.
- Estudio de robustez dia/noche: la demo incluida con clips diurnos y nocturnos permite evaluar cualitativamente el comportamiento del modelo en condiciones de iluminacion adversa.
- Prototipado de sistemas de asistencia a la conduccion: deteccion de peatones, vehiculos y senales en imagenes sueltas para validar pipelines de percepcion antes de invertir en modelos mayores.
- Anotacion asistida: generar pre-detecciones con umbral bajo (0,05 en el protocolo original) que luego se revisan manualmente para acelerar el etiquetado de nuevas imagenes viales.
- Analisis de infraestructura urbana: conteo de vehiculos y deteccion de semaforos y senales en imagenes de calle para estudios de movilidad, siempre en el marco de uso educativo o no comercial de la licencia BDD100K.
- Reproduccion de resultados academicos: verificar el AP declarado por SysCV cargando los pesos con MD5 validado y la configuracion original.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuacion de SysCV; no verificados caja por caja):

| Metrica | Valor |
|---|---|
| Box AP (val, BDD100K) | 35,95 (redondeado a 36,0 en la model card) |
| Box AP (test, BDD100K) | 35,3 |

Desglose COCO-style en validacion:

| AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|
| 36,0 | 61,0 | 35,8 | 17,2 | 41,9 | 57,2 |

Desglose COCO-style en test:

| AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|
| 35,3 | 58,6 | 36,1 | 18,0 | 42,5 | 53,4 |

AP por clase (val):

| Peatones | Ciclistas | Coches | Camiones | Autobuses | Trenes | Motos | Bicicletas | Semaforos | Senales |
|---|---|---|---|---|---|---|---|---|---|
| 38,9 | 30,3 | 54,0 | 49,0 | 51,8 | 6,5 | 30,2 | 29,9 | 26,9 | 41,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 72,6 millones de parametros y entrada 1280x720, el peso de los pesos en FP32 ronda los 290 MB, pero las activaciones a resolucion completa y el FPN elevan el consumo; se recomienda al menos 8-12 GB de VRAM para FP32, aunque el dato no esta documentado por el autor.
- GPU recomendadas: el autor proporciona un entorno con CUDA 11.8 (`env/requirements-cu118.txt`), pero indica explicitamente que el entorno CUDA "no se ha probado todavia". No hay GPU recomendadas documentadas.
- Cabe en GPU de consumo: probablemente si en tarjetas con 8 GB o mas (RTX 3060/4060 en adelante), pero no verificado.
- Opciones de despliegue: MMDetection 2.28.2 con mmcv-full 1.7.2 sobre torch 2.0.1 y Python 3.10; tambien hay un entorno solo CPU (`env/requirements-cpu.txt`) y el script `infer.py` soporta imagen, carpeta, video y webcam.
- Latencia y throughput: no disponibles. La demo se genero en CPU con umbral 0,3, lo que sugiere que la inferencia es viable sin GPU aunque lenta.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores sobre BDD100K con los que comparar directamente (por ejemplo, variantes con backbone ResNet o detectores de una etapa). La model card solo aporta los resultados de este checkpoint frente a si mismo en val y test. Por tanto:

| Modelo | Parametros | Contexto/entrada | AP (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cascade R-CNN Swin-T-FPN 3x (este) | 72,6 M | 1280x720 | 35,95 | BDD100K (no comercial) | Hugging Face, espejo verificado |
| Alternativas del zoo SysCV | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia BDD100K: uso exclusivamente educativo, de investigacion y sin animo de lucro. No apto para uso comercial sin autorizacion adicional.
- El autor no ha verificado las predicciones caja por caja: las predicciones de SysCV para este modelo no estaban archivadas, por lo que el AP se toma tal cual de los ficheros de puntuacion originales.
- El entorno CUDA no ha sido probado por el autor; solo se confirma que los pesos cargan correctamente con `torch.load(weights_only=True)` y que el MD5 coincide con el original.
- Rendimiento muy desigual por clase: los trenes obtienen un AP de 6,5 y los semaforos 26,9, frente a los coches con 54,0. Clases minoritarias o de pequeno tamano son poco fiables.
- AP bajo en objetos pequenos (APs 17,2 en val), lo que limita su uso en deteccion de senales o peatones lejanos.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion adversa, oclusion o climas no representados en BDD100K; la demo nocturna es cualitativa, no una evaluacion sistematica.
- Modelo de vision sin capacidades linguisticas: no procesa texto, no admite prompts y no soporta tool calling ni agentes.
- Sesgos derivados del dataset: BDD100K esta centrado en escenas de conduccion de determinadas regiones y condiciones, por lo que el modelo puede generalizar mal a otras geografias o tipos de via.
- Stack de dependencias antiguo (mmdetection 2.x, mmcv-full 1.7.2, torch 2.0.1): requiere un entorno virtual limpio y puede entrar en conflicto con proyectos que usen versiones mas recientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-swin-t-fpn-3x
- Repositorio SysCV BDD100K models (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/cascade_rcnn_swin-t_fpn_3x_det_bdd100k.py
- Paper de Swin Transformer (ICCV 2021): https://arxiv.org/abs/2103.14030
- Pesos ImageNet del backbone Swin-T: https://github.com/SwinTransformer/storage/releases/download/v1.0.0/swin_tiny_patch4_window7_224.pth
- Licencia BDD100K del repositorio: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-swin-t-fpn-3x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
