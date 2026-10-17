# ftc8565/replitedet-s0p5

## Resumen

RepLiteDet-S0.5 es un detector de objetos int8 de 0,77 MB desarrollado por el usuario ftc8565 para el juego BIOBUZZ de la temporada 2026-27 de FIRST Tech Challenge. Su tarea es localizar y clasificar tres tipos de bola del campo (Pollen, RedNectar y BlueNectar) en fotogramas de 320 x 320 píxeles capturados por una cámara Limelight 3A. No es un modelo de lenguaje ni un modelo multimodal generativo: es un detector de objetos convolucional cuantizado, publicado en formato TFLite para inferencia en hardware embebido de robótica.

El modelo amplía la familia RepLiteDet-S0 (la variante pública de una sola clase, solo Pollen, es ftc8565/replitedet-s0) con una cabeza de 3 clases, una ruta bottom-up añadida en el neck y entrenamiento alineado con la tarea. Se entrenó durante 24.000 pasos con batch 16, partiendo de un RepLiteDet-S0 preentrenado en COCO. El repositorio tiene un tamaño declarado de 0,0 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia es acotada pero concreta: es un ejemplo de detección de objetos int8 orientada a un dominio muy específico (bolas de un juego de competición), con evaluación honesta frente a un baseline de la misma familia, y sirve como referencia para quien necesite desplegar detección en tiempo real en una NPU de bajo consumo con requisitos estrictos de latencia y tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo SSD: backbone RepLiteDet-S0, neck FPN-Lite (space-to-depth de stride 4 a stride 8 mas ruta bottom-up), cabeza SSD de 3 clases; niveles de salida P3-P5 |
| Parametros totales | no disponible (solo se publica el tamano del archivo: 0,77 MB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de deteccion de objetos, no es un modelo de lenguaje) |
| Tipos de cuantizacion | int8 (cuantizacion completa del archivo exportado) |
| Idiomas soportados | no disponible / no aplicable (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (replitedet_s0p5_int8.tflite) mas labels.txt con los nombres de clase en orden de indice de salida: Pollen, RedNectar, BlueNectar |
| Pipeline | object-detection |
| Entrada | fotogramas de 320 x 320 px |
| Umbral de confianza recomendado | 0,45 |
| NMS | agnostico de clase, IoU 0,60, maximo 20 cajas |
| Pasos de entrenamiento | 24.000, batch 16 |
| Fecha de publicacion | 16 de octubre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La red sigue un esquema SSD de una sola etapa. El backbone es el de RepLiteDet-S0, sobre el que se monta un neck FPN-Lite que incorpora space-to-depth desde la escala de stride 4 hacia la de stride 8 y una ruta bottom-up adicional, lo que mejora la propagacion de informacion semantica hacia las escalas mas finas. La cabeza SSD opera sobre los niveles P3, P4 y P5 y produce tres clases. La exportacion es int8 completa y el modelo se distribuye como un unico archivo TFLite. El post-procesado aplica NMS agnostico de clase con IoU 0,60 y devuelve como maximo 20 cajas. Las perdidas empleadas son asignacion de anclas alineada con la tarea (task-aligned anchor assignment) y quality focal loss para las clases.

La composicion de cada batch fue 55% fotografias propias de Pollen, 30% fotografias propias etiquetadas de nectar y 15% escenas BIOBUZZ renderizadas con jitter de color. El entrenamiento arranca desde un RepLiteDet-S0 preentrenado en COCO, con 24.000 pasos y batch 16. Un detalle relevante del diseno: el tono (hue) nunca se modifica, porque la clase es precisamente el color; solo las escenas renderizadas reciben jitter, y unicamente en saturacion y brillo, mientras que las fotografias propias se usan tal cual se capturaron. No se empleo ninguna imagen de terceros en el entrenamiento; los conjuntos de terceros se usaron solo para evaluacion. No se menciona en la informacion disponible el uso de RLHF, DPO ni fases de ajuste por preferencias (no aplicables a un detector).

## Capacidades

- Deteccion de objetos en tiempo real sobre fotogramas de 320 x 320 px, con salida de cajas, clase y puntuacion.
- Clasificacion de tres clases de bola del juego BIOBUZZ: Pollen, RedNectar y BlueNectar, incluida la discriminacion por color entre nectar rojo y azul.
- Deteccion de bolas de tamano pequeno: en el tramo de menos de 18 px de lado, el recall a cualquier puntuacion es 0,956 sobre el conjunto de test de sede propia.
- Funcionamiento con umbral de confianza fijo de 0,45, valor seleccionado por mejor F1 agregado sobre las tres clases en los conjuntos de validacion.
- Inferencia cuantizada int8 apta para NPU y CPU embebida, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision generativa, audio ni modo thinking: es exclusivamente un detector de objetos.
- Capacidades multilingues: no aplicables (no procesa lenguaje natural).

## Casos de uso

- Deteccion de bolas en partido de FIRST Tech Challenge: el modelo se carga en el pipeline de detector neuronal de una Limelight 3A y devuelve cajas de Pollen, RedNectar y BlueNectar en cada fotograma de 320 x 320, lo que permite al robot localizar piezas sin depender de sensores de color dedicados.
- Discriminacion de color para estrategia de recogida: al separar nectar rojo y azul con una tasa de acierto de clase alta en la sede de entrenamiento (mAP@0,5 de 0,879 y 0,895 respectivamente), el robot puede decidir que bolas recoger o descartar segun la estrategia de puntuacion.
- Periodo autonomo: con 23,3 ms por fotograma en un nucleo de eficiencia Intel i9 a un hilo (aproximadamente 43 FPS teoricos en esa configuracion), el detector es viable para bucles de control de baja latencia durante los 30 segundos de autonomia, siempre que se valide antes la latencia real en la Limelight 3A.
- Asistencia al teleoperador: superponer las detecciones en la vista de camara del conductor para senalar la bola objetivo mas cercana y su color, reduciendo el tiempo de reaccion en la fase de teleoperacion.
- Analisis de video post-partido y scouting: procesar grabaciones de partidos para contar bolas por color, medir densidad por zona y comparar el comportamiento de distintos robots, ya que el modelo funciona sobre fotogramas individuales y no requiere estado.
- Robotica educativa y prototipos STEM de bajo coste: con 0,77 MB de peso y cuantizacion int8, el archivo cabe en plataformas embebidas modestas y sirve como ejemplo reproducible de pipeline deteccion-cuantizacion-despliegue en un curso de vision por computador.
- Clasificacion de objetos pequenos por color fuera de FTC: el esquema backbone ligero mas neck FPN-Lite mas cabeza SSD es reutilizable como plantilla para contar objetos esfericos de color conocido en cintas de produccion o inventario, reentrenando con datos propios.
- Validacion de robustez entre sedes: util como caso de estudio de generalizacion de dominio, al estar evaluado en una sede propia, en un segundo campo de FTC y en fotografias de movil de otros equipos.

## Benchmarks y rendimiento

Resultados declarados por el autor. Media mas menos desviacion estandar sobre 3 semillas de entrenamiento. Cada cifra es mAP@[0,5:0,95] por clase sobre un conjunto de TEST reservado. El baseline SSD-MobileNetV2 tiene el mismo presupuesto de pasos y usa las mismas tres fuentes con reparto 40% / 40% / 20%. El modelo se entreno con batch 16 y el baseline con batch 8, por lo que a igual numero de pasos vio el doble de imagenes.

| Modelo | Sede propia (test de nectar) | Segundo campo FTC (camara robot BlueDarkUP) | Sedes nuevas (fotos de movil, otros equipos) | Escenas solo Pollen | Media de las tres primeras |
|---|---|---|---|---|---|
| RepLiteDet-S0.5 (este modelo) | 0,649 +/- 0,004 | 0,763 +/- 0,004 | 0,409 +/- 0,004 | 0,776 +/- 0,003 | 0,607 +/- 0,003 |
| SSD-MobileNetV2 300, mismos pasos, mismas fuentes 40/40/20 | 0,443 +/- 0,023 | 0,656 +/- 0,031 | 0,364 +/- 0,011 | 0,622 +/- 0,010 | 0,488 +/- 0,020 |

Rendimiento por clase del modelo publicado (semilla 17), test de sede propia, umbral 0,45:

| Clase | Bolas | mAP@[0,5:0,95] | mAP@0,5 | Precision | Recall |
|---|---|---|---|---|---|
| Pollen | 438 | 0,706 | 0,948 | 0,896 | 0,902 |
| RedNectar | 159 | 0,592 | 0,879 | 0,854 | 0,849 |
| BlueNectar | 323 | 0,657 | 0,895 | 0,877 | 0,882 |

Cajas de color equivocado en el umbral (bola en la posicion correcta etiquetada con otra clase):

| Clase real | Llamada Pollen | Llamada RedNectar | Llamada BlueNectar |
|---|---|---|---|
| Pollen | 395 | 0 | 0 |
| RedNectar | 6 | 134 | 1 |
| BlueNectar | 0 | 3 | 285 |

Rendimiento por tamano de bola (raiz cuadrada del area de la caja, en pixeles del fotograma de 320), todas las clases juntas:

| Tamano | Bolas | Recall a cualquier puntuacion | AP@0,5 | AP@0,75 |
|---|---|---|---|---|
| < 18 px | 337 | 0,956 | 0,772 | 0,498 |
| 18-28 px | 213 | 0,958 | 0,845 | 0,681 |
| 28-45 px | 220 | 0,996 | 0,944 | 0,916 |
| > 45 px | 150 | 1,000 | 0,953 | 0,953 |

Fotogramas vacios: 4 cajas en 20 fotogramas sin ninguna bola (0,20 cajas por fotograma).

Tamano y velocidad:

| Archivo | Tiempo mediano por fotograma | Medido en |
|---|---|---|
| 0,77 MB | 23,3 ms | Un nucleo de eficiencia Intel i9, 1 hilo, TFLite con XNNPACK, 300 ejecuciones |
| RepLiteDet-S0 (1 clase), misma sesion | 21,9 ms | El mismo nucleo y ajustes, de forma intercalada |

El autor advierte que esta es una medicion de escritorio para comparar modelos, no el tiempo por fotograma en una Limelight 3A, y que el tiempo absoluto varia entre sesiones, por lo que solo deben compararse filas medidas conjuntamente.

## Requisitos de hardware

- VRAM estimada: no aplicable en el sentido habitual. El modelo pesa 0,77 MB en int8 y esta pensado para ejecutarse en CPU o NPU embebida; no se publica ninguna estimacion de VRAM.
- Hardware objetivo: Limelight 3A, que es la plataforma para la que se construyo y donde se cargan replitedet_s0p5_int8.tflite y labels.txt en el pipeline de detector neuronal.
- GPU recomendadas: no disponible. No se documenta ninguna GPU concreta porque el modelo esta orientado a inferencia embebida.
- Cabe en GPU de consumo: si, cualquier GPU de consumo puede ejecutarlo, pero es irrelevante para su proposito; el despliegue previsto no usa GPU.
- Medicion de CPU disponible: 23,3 ms por fotograma en un nucleo de eficiencia Intel i9 con 1 hilo, TFLite con XNNPACK, sobre 300 ejecuciones. Esto equivale a unos 43 fotogramas por segundo en esa configuracion concreta, sin contar el post-procesado externo al modelo.
- Latencia en Limelight 3A: no disponible. El autor indica explicitamente que la cifra de 23,3 ms no es el frame time en ese dispositivo.
- Opciones de despliegue: TFLite con XNNPACK para CPU; TFLite para plataformas embebidas; pipeline de detector neuronal de Limelight. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de deteccion TFLite.
- Throughput estimado: no disponible mas alla de la medicion de 23,3 ms por fotograma citada.

## Comparativa con modelos similares

| Modelo | Clases | mAP@[0,5:0,95] sede propia | mAP@[0,5:0,95] sede nueva | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RepLiteDet-S0.5 | 3 (Pollen, RedNectar, BlueNectar) | 0,649 +/- 0,004 | 0,409 +/- 0,004 | 0,77 MB, int8 TFLite | Apache 2.0 | HuggingFace (ftc8565/replitedet-s0p5) |
| SSD-MobileNetV2 300 (baseline del autor, mismos pasos y fuentes 40/40/20, batch 8) | 3 | 0,443 +/- 0,023 | 0,364 +/- 0,011 | no disponible | no disponible | no indicada en la model card |
| RepLiteDet-S0 (1 clase, Pollen) | 1 | no disponible (solo se publica el dato de escenas solo Pollen: 0,776 +/- 0,003 para S0.5) | no disponible | no disponible | no disponible | HuggingFace (ftc8565/replitedet-s0) |

Nota: el unico baseline con cifras comparables publicadas en la model card es SSD-MobileNetV2 300. No se dispone de datos de otros detectores ligeros como YOLO en la informacion proporcionada, por lo que no se incluyen comparaciones con ellos. La diferencia de batch (16 frente a 8) implica que RepLiteDet-S0.5 vio el doble de imagenes a igual numero de pasos, un factor que el propio autor senala al interpretar la comparacion.

## Limitaciones y advertencias

- Cambio de dominio: el nectar etiquetado procede de una unica sede y una unica configuracion de iluminacion. En fotografias de movil de otras sedes la puntuacion baja hasta aproximadamente 0,409, es decir, una caida de mas del 35% respecto al 0,649 de la sede propia.
- RedNectar es la clase mas debil, con mAP@[0,5:0,95] de 0,592 en la sede propia. En el umbral operativo, 6 de sus bolas se clasificaron como Pollen y 1 como BlueNectar.
- Bolas pequenas: en la banda de menos de 18 px el AP@0,75 baja a 0,498, aunque el recall a cualquier puntuacion se mantiene en 0,956. Es decir, se encuentran, pero con cajas mas flojas y puntuaciones mas bajas, lo que puede degradar el filtrado por umbral.
- Cajas en fotogramas vacios: 0,20 cajas por fotograma sin ninguna bola, lo que introduce falsos positivos residuales en escenas limpias.
- Dependencia del balance de blancos de la camara: el color es la clase, de modo que un balance de blancos inestable puede confundir nectar rojo y azul. El autor recomienda fijarlo en el robot.
- El tono (hue) nunca se aumento en el entrenamiento, lo que mejora la fidelidad del color pero reduce la robustez ante dominios con temperatura de color distinta a la del entrenamiento.
- No se publican parametros totales, idiomas ni pesos en safetensors; el unico artefacto es el TFLite int8. No hay variantes FP16 o FP32 publicadas en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. No se declaran restricciones adicionales.
- El modelo resuelve una tarea muy especifica (tres clases de bola de un juego concreto). Reutilizarlo en otro dominio exige reentrenamiento, no solo reajuste del umbral.
- La comparacion con el baseline esta condicionada por la diferencia de batch (16 frente a 8), un caveat que el propio autor explicita.
- El repositorio indica 0 descargas y 0 likes y un tamano de 0,0 GB, por lo que no hay evidencia de validacion independiente por parte de la comunidad.
- En produccion competitiva, validar siempre la latencia real en la Limelight 3A antes de fijar la frecuencia del bucle de control; la cifra de 23,3 ms corresponde a un escritorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ftc8565/replitedet-s0p5
- Modelo relacionado RepLiteDet-S0 (1 clase, Pollen): https://huggingface.co/ftc8565/replitedet-s0
- Dataset de terceros citado en los agradecimientos (BlueDarkUP, FTC-BioBuzz en Roboflow Universe): https://universe.roboflow.com/blue... (el enlace aparece truncado en la model card; no se dispone de la URL completa)
- Busqueda web: no se ha encontrado ningun enlace relevante al modelo. Los resultados devueltos por la busqueda corresponden a sitios de contenido para adultos sin relacion alguna con RepLiteDet-S0.5, por lo que se descartan y no se listan.
