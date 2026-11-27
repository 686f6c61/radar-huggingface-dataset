# dronefreak/bdd100k-syscv-faster-rcnn-convnext-b-fpn-fp16-3x

## Resumen

Faster R-CNN ConvNeXt-B-FPN FP16 3x es un detector de objetos de dos etapas entrenado sobre el conjunto de datos BDD100K para escenas de conduccion. Lo desarrolla originalmente el grupo SysCV (ETH Zurich) como parte de su zoo de modelos para BDD100K, y esta ficha corresponde a un espejo publicado por el usuario dronefreak en Hugging Face, ya que el host original `dl.cv.ethz.ch` esta fuera de linea y los pesos se recuperaron de la Wayback Machine. El modelo combina un backbone ConvNeXt-Base con un cuello FPN y la cabeza Faster R-CNN estandar de mmdetection.

El modelo resuelve la deteccion de diez clases de objetos relevantes para conduccion autonoma: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico. Es relevante para investigadores que necesitan reproducir resultados del benchmark BDD100K con un checkpoint que ya no esta disponible en su ubicacion original, y el repositorio anade un entorno fijado y un script de inferencia que el original no incluia.

El checkpoint tiene 104.963.010 parametros, ocupa 1,8 GB en el repositorio y se distribuye en formato safetensors (ademas del `.pth` original de mmdetection). La entrada nativa es de 1280x720, el tamano original de BDD100K, sin redimensionado. El autor declara un Box AP de 33,92 en validacion, dato no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone ConvNeXt-Base y cuello FPN |
| Parametros totales | 104.963.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 1280x720) |
| Tipos de cuantizacion | no disponible (pesos en FP16 y safetensors; no se documentan otras cuantizaciones) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | BDD100K (uso educativo, investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors y `.pth` (mmdetection) |

## Arquitectura y entrenamiento

Se trata de un detector Faster R-CNN clasico de dos etapas: un backbone ConvNeXt-Base (paper *A ConvNet for the 2020s*, CVPR 2022) extrae caracteristicas, un cuello FPN las combina a varias escalas y la cabeza Faster R-CNN genera propuestas de region y clasifica/refina las cajas. El backbone se inicializa con pesos ImageNet de mmclassification (`convnext-base_3rdparty_32xb128-noema_in1k`). La entrada es de 1280x720 en RGB con media y desviacion estandar de ImageNet.

El entrenamiento usa el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con AdamW, learning rate 0,0001, weight decay 0,05, decaimiento en las epocas 27 y 33, batch de 32 (8 GPU x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). Se emplea precision mixta FP16. En test se aplica umbral de score 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, al no ser un modelo generativo.

## Capacidades

- Deteccion de objetos en imagenes y video de escenas de conduccion.
- Diez clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagen suelta, carpeta de imagenes, fichero de video o webcam (via `infer.py`).
- Salida en formato BDD100K mediante la opcion `--json`.
- Umbral de score configurable (`--score-thr`, por defecto 0,3) y limite de frames (`--max-frames`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.
- No dispone de modo thinking, vision generativa, audio ni otras capacidades especiales.

## Casos de uso

- Investigacion en deteccion para conduccion autonoma: sirve como baseline reproducible del zoo SysCV sobre BDD100K, util para comparar nuevas arquitecturas con un checkpoint cuyo host original ya no responde.
- Analisis de video de trafico: el script `infer.py` procesa ficheros de video completos y permite extraer detecciones frame a frame con `--max-frames` para limitar el coste.
- Anotacion asistida: generar preanotaciones en formato BDD100K (`--json`) sobre nuevos clips y revisarlas manualmente, reduciendo el trabajo de etiquetado.
- Deteccion de peatones y ciclistas en estudios de seguridad vial: las clases pedestrian y bicycle tienen AP especifico (37,1 y 28,6) que permite evaluar el rendimiento en esos colectivos.
- Prototipado en CPU: con 3,1 s/imagen en 8 hilos de CPU, es viable para pruebas y demos sin GPU dedicada, aunque no para tiempo real.
- Evaluacion comparativa de cuantizaciones o entornos: al incluir un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2), sirve para validar pipelines de mmdetection 2.x antes de migrar.
- Analisis de escenas nocturnas y diurnas: el banner de demostracion incluye clips de dia y de noche, lo que permite estudiar el comportamiento del detector en condiciones de iluminacion distintas.

## Benchmarks y rendimiento

Resultados declarados por SysCV (Box AP en formato COCO, no verificados de forma independiente):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 33,9 | 60,2 | 32,6 | 16,8 | 37,7 | 56,4 |
| test | 33,3 | 58,3 | 33,0 | 17,3 | 38,9 | 51,7 |

AP por clase en validacion:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 37,1 | 30,3 | 51,8 | 44,5 | 48,6 | 4,9 | 28,1 | 28,6 | 25,4 | 39,9 |

El autor senala una discrepancia menor entre este espejo y las predicciones originales de SysCV: sobre 20 imagenes aleatorias de validacion, 14 de las 598 cajas publicadas son identicas y 597 coinciden con IoU >= 0,5; la mayor diferencia de score es 0,0528. La causa no se investigo. El MD5 de los pesos (`324abb9995a26687413c02add40549b5`) coincide con el de SysCV y todas las claves cargan en su configuracion. El entorno CUDA no se ha probado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 105 M de parametros en FP16 y entrada 1280x720, el consumo es moderado, pero el autor no publica cifras.
- GPU recomendadas: no documentadas; el autor solo confirma que el entorno de referencia es CUDA 11.8 y que el entorno CUDA no se ha probado.
- CPU: 3,1 s/imagen con 8 hilos, segun el autor; viable para pruebas, no para tiempo real.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no se aportan mediciones.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2, torch 2.0.1, mmcls 0.25.0 y Python 3.10; el repositorio incluye `env/requirements-cu118.txt` y `env/requirements-cpu.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: solo se publica 3,1 s/imagen en CPU; no hay datos de GPU.

## Comparativa con modelos similares

No se dispone de datos de otros detectores del zoo SysCV en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, dentro del mismo zoo existen otras variantes de detector sobre BDD100K (por ejemplo, otras combinaciones de backbone y cabeza), pero sus cifras no se incluyen aqui.

| Modelo | Parametros | Contexto/entrada | AP val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Faster R-CNN ConvNeXt-B-FPN FP16 3x (este) | 104.963.010 | 1280x720 | 33,9 | BDD100K | Hugging Face (espejo) |
| Otras variantes del zoo SysCV | no disponible | no disponible | no disponible | BDD100K | host original caido |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia BDD100K: restringida a uso educativo, investigacion y sin animo de lucro; el uso comercial requiere revisar los terminos del fichero `LICENSE.txt`.
- El checkpoint es un espejo no oficial: los pesos se recuperaron de la Wayback Machine y el autor no garantiza equivalencia exacta con las predicciones originales (14 de 598 cajas identicas en la muestra de verificacion).
- El rendimiento en la clase train es muy bajo (AP 4,9), lo que limita su uso para esa categoria.
- El AP global (33,9 en val) es moderado; las clases pequenas (APs 16,8) y los objetos de trafico (traffic light 25,4) son los puntos mas debiles.
- Riesgo de falsos negativos y positivos en condiciones de iluminacion adversas, oclusiones o escalas extremas, propio de los detectores de dos etapas entrenados con datos limitados.
- No se han documentado sesgos demograficos ni geograficos, pero el entrenamiento con BDD100K (escenas de conduccion de determinadas ciudades) puede limitar la generalizacion a otras regiones.
- El entorno CUDA no ha sido probado por el autor; solo se valido la inferencia en CPU.
- No es un modelo generativo: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso.
- La fecha de creacion del repositorio (2026-11-27) es posterior a la de esta ficha; conviene verificar la vigencia del espejo antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-convnext-b-fpn-fp16-3x
- Zoo de modelos SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_convnext-b_fpn_fp16_3x_det_bdd100k.py
- Paper de ConvNeXt: https://arxiv.org/abs/2201.03545
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-convnext-b-fpn-fp16-3x/blob/main/LICENSE.txt
- Pesos ImageNet del backbone: https://download.openmmlab.com/mmclassification/v0/convnext/downstream/convnext-base_3rdparty_32xb128-noema_in1k_20220301-2a0ee547.pth
