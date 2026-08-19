# CanelE452/pallet-pose-yolo26n-ft

## Resumen

El modelo `pallet-pose-yolo26n-ft` es un detector de pose 6-DoF de pallets desarrollado por CanelE452 para su despliegue en carretillas elevadoras (forklifts). Se basa en la arquitectura YOLO26n de Ultralytics y realiza detección de objetos y estimación de keypoints en una sola etapa: recibe una imagen RGB y devuelve una bounding box junto con 9 keypoints que, procesados mediante PnP (Perspective-n-Point), permiten recuperar la pose completa del pallet (yaw, desplazamiento lateral y distancia frontal).

El modelo es un finetune de un checkpoint preentrenado exclusivamente con datos sintéticos. El finetune se realizó con anotaciones reales y, de forma crucial, con imágenes de fondo de la cámara de despliegue que no contienen pallets, con el objetivo de eliminar los falsos positivos que el pretrain sintético producía sobre estructuras similares (horquillas de la carretilla, vallas metálicas, etc.). Esta corrección es la principal aportación del modelo: mantiene la precisión de los keypoints del pretrain mientras reduce drásticamente las detecciones espurias.

El modelo está pensado para entornos de robótica industrial y logística, donde la fiabilidad de la detección es crítica. Su licencia AGPL-3.0 permite uso comercial con obligación de compartir modificaciones. Está disponible en Hugging Face con el pipeline de keypoint-detection y se integra directamente con la librería Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), single-stage, deteccion de objetos + keypoints |
| Parametros totales | no disponible (variante nano de YOLO26) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch .pt (Ultralytics) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura YOLO26n de Ultralytics, la variante nano de la familia YOLO26, optimizada para inferencia en tiempo real en dispositivos con recursos limitados. Se trata de un detector de una sola etapa que predice simultáneamente bounding boxes y keypoints. En este caso, la salida son 9 keypoints por instancia: 8 correspondientes a las esquinas visibles del pallet (4 de la cara frontal y 4 de la cara trasera) y un punto central (centroide). El orden de los keypoints es relativo a la cámara, no fijo al objeto, lo que permite manejar pallets vistos desde cualquier ángulo.

El entrenamiento se realizó en dos fases. Primero, un preentrenamiento con 73.916 imágenes sintéticas, todas ellas conteniendo al menos un pallet. Este pretrain mostró un punto ciego estructural: al no haber visto nunca escenas sin pallets, el modelo etiquetaba como pallets estructuras horizontales similares (horquillas de la carretilla, vallas, etc.). Para corregirlo, se realizó un finetune añadiendo imágenes de fondo reales de la cámara de despliegue con etiquetas vacías. El resultado es un modelo que mantiene la precisión de localización del pretrain (error de keypoint mediana de 7,38 px frente a 9,30 px) y elimina por completo los falsos positivos en el conjunto de validación.

Una particularidad importante del entrenamiento es que se desactivó el aumento horizontal (fliplr=0.0), ya que el orden de los keypoints es asimétrico respecto al eje izquierda-derecha. Si se desea activar, es necesario usar el mapeo flip_idx correcto: [1, 0, 3, 2, 5, 4, 7, 6, 8].

## Capacidades

- Deteccion de pallets en imagenes RGB de una sola camara.
- Estimacion de 9 keypoints por instancia (8 esquinas + centroide) con orden relativo a la camara.
- Recuperacion de pose 6-DoF mediante PnP aguas abajo (yaw, desplazamiento lateral, distancia).
- Inferencia en tiempo real gracias a la arquitectura YOLO nano.
- Robustez frente a pallets parcialmente recortados en los bordes de la imagen (gracias al padding reflectante de 100 px).
- Eliminacion de falsos positivos en escenas sin pallets (0,0% en el conjunto de validacion).
- Integracion directa con la libreria Ultralytics (YOLO).
- Disenado para despliegue en carretillas elevadoras y robots de almacen.

## Casos de uso

- Carretillas elevadoras autonomas: el modelo proporciona la pose 6-DoF del pallet en tiempo real, permitiendo que la carretilla se aproxime y recoja el pallet de forma autonoma. La salida de keypoints se alimenta a un solucionador PnP que calcula la distancia y orientacion relativas.
- Robots de picking en almacenes: integrado en un sistema de vision, el modelo detecta pallets y estima su posicion para que un brazo robotico pueda agarrarlos con precision.
- Navegacion en entornos logisticos: al eliminar falsos positivos, el modelo puede usarse para evitar obstaculos y planificar rutas en almacenes donde hay estructuras similares a pallets (vallas, estanterias).
- Inspeccion de calidad de pallets: los keypoints permiten verificar la integridad estructural del pallet (esquinas visibles, deformaciones) antes de su uso.
- Teleoperacion asistida: en carretillas manuales, el modelo puede superponer la pose estimada en la pantalla del operador para facilitar la alineacion con el pallet.
- Pruebas de concepto en robotica de investigacion: al ser un modelo ligero y de codigo abierto, sirve como base para experimentos de manipulacion y navegacion en entornos controlados.

## Benchmarks y rendimiento

Los resultados publicados por el autor se midieron sobre dos conjuntos: una secuencia de despliegue de 911 frames y un conjunto de evaluacion real held-out de 161 frames anotados manualmente, excluidos del entrenamiento.

| Metrica | Pretrain sintetico | Modelo finetuneado |
|---|---|---|
| Deteccion (held-out, n=161) | 88,2% | 97,5% |
| Error keypoint mediana (px) | 9,30 | 7,38 |
| Error keypoint p90 (px) | 28,41 | 26,75 |
| Falsos positivos en frames sin pallet (n=259, conf 0,05) | 50,6% | 0,0% |
| Falsos positivos en frames sin pallet (conf 0,10) | 30,5% | 0,0% |
| Falsos positivos en frames sin pallet (conf 0,25) | 0,0% | 0,0% |
| Falsos positivos en frames sin pallet (conf 0,40) | 0,0% | 0,0% |

Nota: los 259 frames sin pallet formaban parte del conjunto de finetune, por lo que la cifra de falsos positivos es in-sample. Los datos held-out honestos son los de la tabla de deteccion y error de keypoints.

En la secuencia de despliegue (911 frames), el modelo reduce las detecciones de 558 a 479, eliminando principalmente falsos positivos (vallas, setos, lonas, edificios). Los frames donde el pretrain tenia alta confianza (conf >= 0,9, n=440) se conservan al 100%.

## Requisitos de hardware

- No se han publicado requisitos especificos de hardware en la informacion disponible.
- Al tratarse de un modelo YOLO nano, se espera que sea ejecutable en GPUs de consumo (p. ej., RTX 3060 o superiores) y en dispositivos edge como Jetson, aunque estos datos no estan confirmados por el autor.
- El modelo se integra con Ultralytics, por lo que puede desplegarse con las herramientas estandar de la libreria (export a ONNX, TensorRT, etc.).
- Para inferencia en tiempo real en una carretilla, se recomienda una GPU integrada o un modulo de vision dedicado, pero no hay datos concretos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El autor no ha publicado comparaciones con otras arquitecturas de deteccion de pose de pallets. Se puede considerar que compite con otros detectores de keypoints basados en YOLO (p. ej., YOLOv8-pose, YOLO11-pose), pero no hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Pallets muy recortados en los bordes de la imagen pueden no detectarse. Un caso documentado muestra una pallet cortado en el borde inferior que paso de confianza 0,427 (pretrain) a 0,000 (este modelo). El autor indica que esto se debe a la composicion de las imagenes de fondo, no a un problema de entrenamiento.
- Pallets distantes y pequenos tienen un rendimiento mas debil. Se estima que entre 5 y 8 de los 81 frames descartados en la secuencia de despliegue corresponden a pallets lejanos genuinos.
- El modelo esta entrenado para un unico pallet por imagen (single_cls=True, una instancia por imagen). En escenas con multiples pallets, solo se devuelve la deteccion de mayor confianza.
- El orden de los keypoints es relativo a la camara, no fijo al objeto. Esto debe tenerse en cuenta al integrar el modelo en sistemas que asuman un ordenamiento fijo.
- No se debe activar el aumento horizontal (fliplr) sin aplicar el mapeo flip_idx correcto, ya que corrompe la correspondencia de los keypoints.
- Es obligatorio aplicar un padding reflectante de 100 px en los cuatro lados de la imagen antes de la inferencia. Omitirlo degrada la precision de los keypoints (mediana de 7,38 px a 8,49 px) aunque apenas afecta a la tasa de deteccion.
- La licencia AGPL-3.0 implica que cualquier modificacion del modelo debe publicarse bajo la misma licencia si se distribuye. Para uso interno sin distribucion, no hay obligacion de compartir.
- No se han publicado datos sobre sesgos demograficos o de entorno, ya que es un modelo de vision industrial.

## Enlaces

- Hugging Face: https://huggingface.co/CanelE452/pallet-pose-yolo26n-ft
- Libreria Ultralytics: https://github.com/ultralytics/ultralytics

No se han encontrado otros enlaces (papers, blogs, repos) en la informacion proporcionada.
