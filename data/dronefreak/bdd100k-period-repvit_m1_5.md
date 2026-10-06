# dronefreak/bdd100k-period-repvit_m1_5

## Resumen

El modelo `dronefreak/bdd100k-period-repvit_m1_5` es un clasificador de imágenes fruto del ajuste fino (*fine-tuning*) de RepViT-M1.5 sobre la tarea de clasificación del periodo del día en escenas de conducción. Lo publica el usuario dronefreak como parte de BDD100K-Toolkit, un conjunto de utilidades para preparar el dataset BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y particiones. La tarea resuelve un problema concreto y recurrente en percepción para conducción autónoma: asignar a cada fotograma una de cuatro clases temporales (diurno, nocturno, amanecer o atardecer y desconocido), derivadas del campo `attributes.timeofday` de BDD100K.

Arquitectónicamente se trata de RepViT (*Revisiting Mobile CNN from ViT Perspective*), una familia de clasificadores ligeros que combina bloques convolucionales reparametrizables con decisiones de diseño propias de los vision transformers. El modelo cuenta con 13,6 millones de parámetros y pesa alrededor de 0,1 GB en el repositorio, lo que lo sitúa en la gama de modelos de visión aptos para inferencia en tiempo real y para despliegue en hardware embebido. La entrada es una única imagen RGB y la salida, un vector de probabilidades sobre cuatro clases.

Su relevancia actual es doble. Por un lado, demuestra que un backbone móvil de 13,6 M de parámetros puede alcanzar un 93,33 % de exactitud top-1 y un 81,97 % de F1 macro en una tarea auxiliar de conducción autónoma, compitiendo con alternativas como TinyViT-21M o EfficientViT-L1 dentro del mismo *model zoo*. Por otro, forma parte de un ecosistema reproducible y con licencia Apache 2.0 que facilita el etiquetado automático y la estratificación de datasets de conducción, un cuello de botella habitual en proyectos de percepción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RepViT (red neuronal hibrida de bloques convolucionales reparametrizables con decisiones de diseno tipo vision transformer) |
| Parametros totales | 13,6 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen; entrada de una sola imagen RGB) |
| Tipos de cuantizacion | no especificados por el autor; el checkpoint se distribuye en precision completa (`best.pt`) |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`), checkpoint `best.pt` con `state_dict`, `class_names`, `imgsz`, `mean` y `std` |
| Tarea | Clasificacion de imagenes (4 clases) |
| Clases | `daytime`, `night`, `dawn or dusk`, `unknown` |
| Modelo base | `timm/repvit_m1_5.dist_300e_in1k` |
| Dataset de ajuste | `dronefreak/BDD100K-Period-Classification` (10000 imagenes en el split de test) |
| Libreria | timm (PyTorch) |
| Tamano del repositorio | 0,1 GB |
| Idioma de la documentacion | ingles |
| Fecha de publicacion | 5 de octubre de 2026 |

## Arquitectura y entrenamiento

RepViT se describe en el articulo arXiv:2307.09283 como una revisita de las CNN móviles desde la perspectiva de los vision transformers: el modelo parte de un bloque de convolución con reparametrización estructural (del estilo de RepVGG) y reorganiza la columna vertebral incorporando elementos propios de las arquitecturas ViT, como el uso de convoluciones *pointwise* que actúan a modo de proyecciones y una ordenacion concreta de las etapas que mejora el compromiso entre latencia y precision. La variante M1.5 utilizada aqui es el checkpoint `repvit_m1_5.dist_300e_in1k` de la libreria timm, preentrenado con destilacion sobre ImageNet-1k durante 300 epocas. Sobre esa base, el autor sustituye la cabeza de clasificacion por una de cuatro clases y ajusta el modelo para la tarea de periodo del dia del dataset BDD100K.

La informacion disponible no detalla el numero de tokens o imagenes visto durante el ajuste fino, la composicion exacta del dataset usado para entrenar (mas alla de su derivacion del campo `attributes.timeofday` de BDD100K), ni la receta de optimizacion (optimizador, tasa de aprendizaje, numero de epocas, aumentos de datos, uso de RLHF o DPO). Tampoco se documenta el valor de `imgsz` empleado en el preprocesamiento, aunque el checkpoint lo almacena y la funcion de inferencia de ejemplo lo recupera dinamicamente. La model card califica la tarea como "no oficial", en el sentido de que no procede de un *benchmark* estandarizado, sino de una derivacion propia del dataset BDD100K, siguiendo el dataset de Kaggle del mismo nombre. El entrenamiento y la evaluacion se realizaron con BDD100K-Toolkit (https://github.com/dronefreak/bdd100k-toolkit).

## Capacidades

- Clasificacion de imagenes en cuatro clases temporales: `daytime`, `night`, `dawn or dusk` y `unknown`.
- Salida probabilistica por clase, lo que permite aplicar umbrales de confianza y descartar predicciones dudosas en produccion.
- Inferencia sobre una unica imagen RGB, sin necesidad de secuencias de video ni de informacion temporal adicional.
- Ejecucion en CPU y en GPU de gama baja gracias a sus 13,6 millones de parametros.
- Exportacion a formatos de despliegue alternativos (ONNX, TorchScript) a partir del `state_dict` de PyTorch, aunque el autor no documenta exportaciones listas para usar.
- No dispone de *tool calling*, *function calling*, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni capacidades de audio o video.
- No procesa lenguaje natural: es un modelo exclusivamente de vision.
- No se documentan capacidades multilingues ni atributos de equidad entre subpoblaciones del dataset.

## Casos de uso

- Preetiquetado de datasets de conduccion: dado un corpus de imagenes sin anotar, el modelo asigna la etiqueta de periodo del dia con un 93,33 % de exactitud top-1, lo que reduce drasticamente el esfuerzo de anotacion manual en el atributo `timeofday` de BDD100K y de corpus similares.
- Estratificacion de datos antes del entrenamiento: un detector o segmentador de escenas viarias puede entrenarse con una distribucion balanceada por franja horaria; este clasificador permite medir y corregir el desbalance (por ejemplo, la sobrerrepresentacion de escenas diurnas).
- Control de calidad de anotaciones: comparar la etiqueta original de un dataset con la prediccion del modelo permite detectar imagenes mal etiquetadas o atributos inconsistentes antes de usarlas en entrenamiento.
- Enrutado condicional en pilas de percepcion: como etapa de *gating* de bajo coste, el modelo puede activar ramas especializadas (por ejemplo, preprocesado con mejora de contraste o modelos nocturnos) cuando detecta la clase `night` con alta confianza.
- Analitica de flotas y videovigilancia en carretera: procesar grabaciones de dashcam y agregar estadisticas de conduccion por franja horaria para informes operativos, sin necesidad de infraestructura GPU dedicada.
- Sistemas de ayuda a la conduccion y HMI adaptativo: ajustar el brillo del cuadro de instrumentos, la temperatura de color de las pantallas o los umbrales de alerta segun el periodo del dia detectado.
- Despliegue en hardware embebido automotriz: con 13,6 M de parametros y un peso de decenas de megabytes, el modelo es candidato para ejecutarse en SoC de bajo consumo junto a otros modulos de percepcion.
- Investigacion reproducible en vision ligera: sirve como referencia de *baseline* dentro de BDD100K-Toolkit para comparar nuevos backbones bajo exactamente las mismas particiones y metricas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el split `test` (10000 imagenes). Los valores no estan verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy (test split) | 93,33 % |
| Macro F1 (test split) | 81,97 % |
| Balanced accuracy | 78,35 % |
| Macro precision (test split) | 86,95 % |
| Macro recall (test split) | 78,35 % |

Desglose por clase:

| Clase | Precision | Recall | F1 | Imagenes de test |
|---|---|---|---|---|
| dawn or dusk | 64,45 % | 53,60 % | 58,53 % | 778 |
| daytime | 93,46 % | 95,38 % | 94,41 % | 5258 |
| night | 97,88 % | 98,70 % | 98,29 % | 3929 |
| unknown | 92,00 % | 65,71 % | 76,67 % | 35 |

La diferencia entre la exactitud top-1 (93,33 %) y la exactitud balanceada (78,35 %) refleja el fuerte desbalance del dataset: las clases `daytime` y `night` concentran 9187 de las 10000 imagenes y alcanzan F1 superiores al 94 %, mientras que `dawn or dusk` se queda en un F1 de 58,53 % y `unknown` cuenta con solo 35 imagenes de evaluacion, lo que hace sus metricas poco estables.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 54 MB en FP32 (13,6 M de parametros x 4 bytes), unos 27 MB en FP16 y unos 14 MB en INT8. Son cifras calculadas a partir del recuento de parametros, no medidas publicadas por el autor.
- Memoria total necesaria en ejecucion: muy por debajo de 1 GB, incluyendo activaciones y *overhead* del *runtime*, dado el tamano de entrada reducido tipico de los modelos RepViT (el valor exacto de `imgsz` no esta disponible en la informacion proporcionada).
- GPU recomendadas: practicamente cualquier GPU moderna sirve. Se puede ejecutar con holgura en tarjetas de consumo como GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 o RTX 4090, y tambien en aceleradores de inferencia como NVIDIA Jetson, Google Coral o NPU integradas.
- Cabe en GPU de consumo: si, en cualquiera con al menos 1 GB de VRAM, e incluso en CPU sin aceleracion (el modelo es de 13,6 M de parametros).
- Opciones de despliegue: PyTorch con timm (ruta soportada oficialmente en la model card), exportacion a ONNX o TorchScript, TensorRT, OpenVINO y *runtimes* de borde como NCNN o TFLite. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor no publica medidas de tiempo de inferencia ni de imagenes por segundo en ninguna GPU concreta.
- Duplicar el modelo no requiere sharding ni paralelismo: cabe integramente en una sola GPU o en memoria de sistema.

## Comparativa con modelos similares

El autor publica un *model zoo* con todos los modelos entrenados y evaluados sobre el mismo split `test` de BDD100K Period, ordenados por exactitud top-1. La tabla de la model card aparece truncada en la informacion disponible; se reproducen a continuacion las filas completas, junto con el modelo de esta ficha.

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 94,01 % | 83,19 % | 79,63 % | 87,95 % |
| EfficientViT-L1 | 93,98 % | 82,68 % | 78,45 % | 88,75 % |
| ConvNeXt-Atto | 93,95 % | 80,75 % | 76,82 % | 86,39 % |
| EfficientViT-B2 | 93,92 % | 82,53 % | 78,88 % | 87,49 % |
| RepViT-M2.3 | 93,89 % | 82,35 % | 78,49 % | 87,72 % |
| YOLO11n | 93,79 % | 80,13 % | 75,19 % | 88,20 % |
| EfficientViT-B1 | 93,77 % | 82,63 % | 78,93 % | 88,38 % |
| EfficientViT-B3 | 93,77 % | 81,04 % | 76,29 % | 88,43 % |
| YOLO11s | 93,73 % | 81,22 % | 77,49 % | 86,42 % |
| EfficientViT-B0 | 93,71 % | 80,98 % | 77,14 % | 86,44 % |
| YOLO26n | 93,61 % | 80,41 % | 77,72 % | 83,88 % |
| MobileNetV4-Conv-Small | 93,57 % | 80,22 % | 76,22 % | 86,06 % |
| YOLOv8n | 93,56 % | 80,85 % | 76,26 % | 87,87 % |
| MobileNetV4-Conv-Large | 93,46 % | 80,21 % | 74,88 % | 89,57 % |
| YOLOv8s | 93,46 % | 79,94 % | 75,66 % | 86,39 % |
| RepViT-M1.5 (este modelo) | 93,33 % | 81,97 % | 78,35 % | 86,95 % |

Datos adicionales de la comparativa:

| Aspecto | RepViT-M1.5 (este modelo) | TinyViT-21M | EfficientViT-L1 | RepViT-M2.3 |
|---|---|---|---|---|
| Parametros | 13,6 M | aproximadamente 21 M (indicado en la nomenclatura) | no disponible | no disponible |
| Top-1 | 93,33 % | 94,01 % | 93,98 % | 93,89 % |
| Macro F1 | 81,97 % | 83,19 % | 82,68 % | 82,35 % |
| Balanced accuracy | 78,35 % | 79,63 % | 78,45 % | 78,49 % |
| Licencia | Apache 2.0 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Disponibilidad | pesos en HuggingFace | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

Con 13,6 M de parametros, RepViT-M1.5 ocupa la parte baja de la tabla en top-1 pero obtiene una exactitud balanceada (78,35 %) superior a la de modelos mas grandes como ConvNeXt-Atto, YOLO11n, EfficientViT-B3, YOLOv8n o MobileNetV4-Conv-Large, lo que indica un comportamiento relativamente mas equilibrado en las clases minoritarias a costa de algo de precision global.

## Limitaciones y advertencias

- Metricas no verificadas: todos los resultados declarados estan marcados como `verified: false` en el *model-index*; proceden del propio autor y no de una evaluacion independiente.
- Desbalance severo del dataset: `daytime` (5258 imagenes) y `night` (3929) dominan el test, frente a 778 de `dawn or dusk` y solo 35 de `unknown`. La exactitud top-1 esta inflada por las clases mayoritarias.
- Rendimiento pobre en la clase mas dificil: `dawn or dusk` obtiene un recall del 53,60 % y un F1 del 58,53 %, de modo que casi la mitad de las imagenes de esa franja se clasifican mal. Es la clase con mayor ambiguedad visual y la mas relevante para casos de uso de iluminacion cambiante.
- Clase `unknown` poco fiable: con 35 imagenes de evaluacion, sus metricas (F1 76,67 %, recall 65,71 %) tienen un intervalo de confianza muy amplio y no deberian tomarse como representativas.
- Tarea no oficial: la clasificacion del periodo del dia no es una tarea estandarizada de BDD100K, sino una derivacion propia del campo `attributes.timeofday`. Los resultados no son comparables con los de tareas oficiales del *benchmark*.
- Dominio restringido: entrenado y evaluado sobre escenas de conduccion de BDD100K, con la distribucion geografica y de camara propia de ese dataset (capturas principalmente en Estados Unidos). El rendimiento fuera de ese dominio (otras camaras, otros paises, vision nocturna, condiciones meteorologicas adversas) no esta documentado.
- Riesgo de alucinacion en el sentido clasificatorio: el modelo siempre devuelve una de las cuatro clases, incluso ante entradas fuera de distribucion (imagenes interiores, sinteticas o corruptas). Se recomienda aplicar un umbral de confianza sobre la probabilidad maxima antes de consumir la prediccion.
- Sesgos no evaluados: no se publican analisis de sesgo por geografia, tipo de via, condiciones meteorologicas ni caracteristicas demograficas de las escenas.
- Sin informacion sobre robustez: no hay datos de rendimiento ante perturbaciones (ruido, compresion, desenfoque de movimiento) ni de calibracion de probabilidades.
- Restricciones de licencia: los pesos se distribuyen bajo Apache 2.0, lo que permite uso comercial del modelo. Sin embargo, el dataset BDD100K y el derivado `dronefreak/BDD100K-Period-Classification` tienen sus propias condiciones de uso, que conviene revisar antes de explotar comercialmente el modelo si este se ha entrenado con ellos.
- Cautela en produccion: al ser un modelo no verificado y sin latencias publicadas, cualquier integracion critica (por ejemplo, en un vehiculo) exige una validacion propia sobre datos representativos del despliegue objetivo.
- Sin soporte de texto ni de lenguaje natural: no puede usarse en tareas de generacion, dialogo, *tool calling* ni agentes, pese a que la ficha pueda parecerlo por analogia con modelos de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-period-repvit_m1_5
- Dataset de la tarea: https://huggingface.co/dronefreak/BDD100K-Period-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Modelo base en timm: https://huggingface.co/timm/repvit_m1_5.dist_300e_in1k
- Articulo de RepViT (arXiv:2307.09283): https://arxiv.org/abs/2307.09283
- Articulo de BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
- Recursos multimedia de demostracion: https://huggingface.co/dronefreak/bdd100k-period-repvit_m1_5/resolve/main/assets/demo_banner.mp4
