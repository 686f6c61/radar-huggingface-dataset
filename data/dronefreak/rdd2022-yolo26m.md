# dronefreak/rdd2022-yolo26m

## Resumen

El modelo `dronefreak/rdd2022-yolo26m` es un detector de objetos de una sola etapa obtenido por ajuste fino (*fine-tuning*) del modelo base Ultralytics YOLO26, en su variante "m" (medium), sobre el conjunto de datos RDD2022 de daños en pavimento. Lo publica el usuario `dronefreak` como parte de DetectionBench, un marco de trabajo cuyo objetivo es comparar detectores modernos bajo recetas de entrenamiento idénticas y métricas de evaluación homogéneas. El modelo tiene 21,9 millones de parámetros y un coste de 75,4 GFLOPs por imagen a 640 px, lo que lo sitúa en la gama media de la familia YOLO.

El problema que resuelve es la detección automática de cuatro tipos de defectos viarios: grieta longitudinal, grieta transversal, grieta de piel de cocodrilo (*alligator crack*) y bache. Es relevante porque permite sustituir inspecciones visuales manuales por un pipeline de visión por computador desplegable en vehículos, drones o sistemas de mantenimiento de infraestructuras, y porque sus métricas se publican junto a las de otros siete detectores evaluados con el mismo protocolo, lo que facilita una comparación directa.

En el conjunto de prueba de RDD2022 alcanza un mAP@50 de 61,24 % y un mAP@50-95 de 33,38 %, con una precisión de 63,7 % y un recall de 57,27 %. No se trata de un modelo de lenguaje: no procesa texto, no tiene ventana de contexto y no soporta *tool calling*. Su licencia es AGPL-3.0, un punto crítico para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una sola etapa de la familia Ultralytics YOLO26; no se detallan en la model card la composición interna del backbone ni del cabezal |
| Parametros totales | 21,9 M |
| Parametros activos | No aplica (no es un modelo con arquitectura MoE) |
| Longitud de contexto | No aplica (modelo de visión; procesa imágenes, no secuencias de texto) |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No aplica (no procesa lenguaje natural); el repositorio está etiquetado con `region:us` |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`); el archivo distribuido en el repositorio es `best.pt` |
| Tarea (*pipeline*) | `object-detection` |
| Libreria | Ultralytics |
| Modelo base | `Ultralytics/YOLO26` (fine-tuning) |
| Dataset de entrenamiento | `dronefreak/RDD2022` (RDD2022 Road Damage) |
| Numero de clases | 4: `longitudinal_crack`, `transverse_crack`, `alligator_crack`, `pothole` |
| Coste computacional | 75,4 GFLOPs por imagen a 640 px |
| Tamaño del repositorio | 0,0 GB (según los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible indica únicamente que se trata de un detector YOLO26 en variante *medium* de Ultralytics, con 21,9 M de parámetros y 75,4 GFLOPs a 640 px, ajustado por *fine-tuning* a partir del modelo base `Ultralytics/YOLO26`. La model card no describe la composición del backbone, el tipo de cabezal de detección, la función de pérdida ni si se emplean técnicas como *anchor-free assignment* o *distribution focal loss*. Tampoco se documenta si hubo fases de entrenamiento adicionales, destilación o ajuste con datos sintéticos.

Lo que sí se documenta es el procedimiento de evaluación: las métricas se calculan sobre la partición de *test* de RDD2022 con el pipeline estándar de DetectionBench (`detectionbench-evaluate`), el mismo utilizado para el resto de modelos del *zoo* publicado por el proyecto. El entrenamiento se realizó con el framework Ultralytics sobre el dataset `dronefreak/RDD2022`, aunque la tabla de configuración de entrenamiento incluida en la model card aparece truncada en la información proporcionada, por lo que no se pueden detallar hiperparámetros como el número de épocas, el tamaño de lote, la resolución de entrenamiento o las estrategias de aumento de datos.

El aspecto diferencial del proyecto no es una innovación arquitectónica, sino metodológica: DetectionBench reentrena y reevalúa cada detector con recetas idénticas, de modo que las diferencias de mAP entre modelos reflejan la arquitectura y no variaciones en el pipeline de entrenamiento. Las métricas de este modelo están marcadas como no verificadas (`verified: false`) en el `model-index`.

## Capacidades

- Detección de objetos con cajas delimitadoras sobre imágenes de carreteras, en cuatro clases de daño: grieta longitudinal, grieta transversal, grieta de piel de cocodrilo y bache.
- Inferencia sobre imágenes individuales, lotes de imágenes y flujos de vídeo, a través de la API de Ultralytics (`model.predict(source=..., conf=0.25)`), con umbral de confianza configurable.
- Salida de coordenadas de caja, clase y puntuación de confianza por detección, apta para su integración en sistemas de georreferenciación o de conteo.
- Ejecución en modo CPU y GPU mediante PyTorch, dado el reducido tamaño del modelo (21,9 M de parámetros).
- Exportación a otros formatos de inferencia: la model card no documenta exportaciones verificadas a ONNX, TensorRT, OpenVINO o CoreML; cualquier conversión dependería de las utilidades del framework Ultralytics y no está validada por el autor.
- No genera texto, no razona, no ejecuta código, no soporta *tool calling* ni agentes, no procesa audio ni lenguaje natural, y no dispone de modo de razonamiento (*thinking mode*).
- No se documentan capacidades de segmentación de instancias, detección de puntos clave ni clasificación más allá de las cuatro clases indicadas.

## Casos de uso

- Inventario municipal de daños en calzada: montar el modelo sobre cámaras de vehículos de servicio urbano y generar un registro georreferenciado de baches y grietas para planificar el asfaltado por prioridad.
- Inspección con drones de tramos de carretera: procesar ortofotografías o vídeo aéreo con inferencia por lotes y volcar las detecciones a un SIG para localizar los defectos por kilómetro.
- Preetiquetado de datasets de infraestructura: usar el modelo como anotador automático inicial y revisar manualmente las detecciones, reduciendo el coste de anotación en proyectos de mantenimiento viario.
- Mantenimiento predictivo de flotas: analizar grabaciones de *dashcam* para detectar el deterioro progresivo de una ruta concreta a lo largo del tiempo y anticipar intervenciones antes de que aparezcan baches severos.
- Peritaje y gestión de reclamaciones: detectar y cuantificar baches en imágenes aportadas por conductores para automatizar la clasificación inicial de expedientes por daños en neumáticos o suspensiones.
- Control de calidad de obra: verificar con imágenes de la superficie recién pavimentada si aparecen grietas tempranas (longitudinales o transversales) antes de cerrar la recepción de un tramo.
- Percepción complementaria en conducción autónoma: incorporar la señal de "superficie deteriorada" a un *stack* de percepción para que el planificador module la velocidad o la trazada en tramos con baches detectados.
- Despliegue en *edge* sobre vehículos de inspección: gracias a los 21,9 M de parámetros y 75,4 GFLOPs, es viable ejecutarlo en hardware embebido tipo NVIDIA Jetson para inspección en tiempo real sin conectividad.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la partición de *test* de RDD2022, con el pipeline `detectionbench-evaluate`. Las métricas están marcadas como no verificadas en el `model-index`.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 61,24 |
| mAP@50-95 | 33,38 |
| Precision | 63,70 |
| Recall | 57,27 |
| F1 | 60,32 |
| Parametros | 21,9 M |
| FLOPs | 75,4 GFLOPs a 640 px |

Rendimiento por clase (*test* split):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| `longitudinal_crack` | 56,38 | 30,43 |
| `transverse_crack` | 53,10 | 25,71 |
| `alligator_crack` | 61,55 | 32,20 |
| `pothole` | 73,94 | 45,18 |

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 21,9 M de parámetros y no verificada por el autor: ~88 MB en FP32, ~44 MB en FP16/BF16 y ~22 MB en INT8. A estas cifras hay que sumar activaciones, búferes de inferencia y memoria del *runtime* de PyTorch, por lo que en la práctica el consumo total por lote pequeño a 640 px se mantiene en el rango de cientos de MB a pocos GB, dependiendo del tamaño de lote y de la resolución de entrada.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia, incluso con lotes grandes.
- Es viable la inferencia en CPU para aplicaciones no críticas en latencia, dado el reducido número de parámetros; no se han publicado medidas de latencia ni de rendimiento en CPU.
- Para despliegue en *edge*, el tamaño del modelo lo hace candidato para plataformas embebidas tipo NVIDIA Jetson (Nano, Orin) en vehículos de inspección.
- GPU de centro de datos (A100, H100) solo tendrían sentido para entrenamiento, reevaluación a gran escala o procesamiento masivo por lotes, no para inferencia puntual.
- Opciones de despliegue documentadas: la model card solo detalla el uso mediante `huggingface_hub.hf_hub_download` junto con la clase `YOLO` de Ultralytics. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos. Otras alternativas (ONNX Runtime, TensorRT, OpenVINO) dependerían de exportaciones no verificadas por el autor.
- No se han publicado datos de latencia ni de *throughput* (imágenes por segundo) en la información disponible. Como referencia de coste, el autor declara 75,4 GFLOPs por imagen a 640 px.

## Comparativa con modelos similares

Comparación con los modelos evaluados por DetectionBench sobre el mismo *test* de RDD2022 y con el mismo protocolo. Solo se dispone de las métricas; los parámetros, la licencia y la longitud de contexto de los modelos alternativos no están en la información proporcionada (la longitud de contexto no aplica a ninguno de ellos).

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall | Parametros | Licencia |
|---|---|---|---|---|---|---|
| RF-DETR Medium | 65,08 | 36,02 | 71,18 | 55,98 | No disponible | No disponible |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 | No disponible | No disponible |
| YOLOv8m | 62,03 | 34,08 | 65,61 | 57,42 | No disponible | No disponible |
| YOLOv8s | 61,45 | 33,53 | 64,55 | 57,18 | No disponible | No disponible |
| YOLOv26s | 61,27 | 33,30 | 64,42 | 57,13 | No disponible | No disponible |
| **YOLOv26m (este modelo)** | **61,24** | **33,38** | **63,70** | **57,27** | **21,9 M** | **AGPL-3.0** |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,30 | No disponible | No disponible |
| YOLOv8n | 58,80 | 32,05 | 62,03 | 56,08 | No disponible | No disponible |

Lectura de la comparativa: en mAP@50, el modelo se sitúa en la zona media-baja del conjunto evaluado, por detrás de los dos RF-DETR de mayor tamaño, de YOLOv8m y de YOLOv8s, y prácticamente empatado con YOLOv26s (61,27 frente a 61,24). En mAP@50-95 supera ligeramente a YOLOv8s, a YOLOv26s y a RF-DETR Nano, pero queda por debajo de YOLOv8m y de los RF-DETR Small y Medium. Destaca su precisión relativamente baja (63,70) frente a RF-DETR Medium (71,18), aunque su recall es competitivo dentro del grupo de modelos YOLO.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia *copyleft* fuerte. Su uso en un servicio de red obliga, según los términos de AGPL, a poner a disposición el código fuente correspondiente; para productos propietarios o integrados en *hardware* comercial es un obstáculo legal relevante que debe revisarse antes de cualquier despliegue.
- Métricas no verificadas: los cuatro valores del `model-index` están marcados con `verified: false`. No hay validación independiente ni réplica de los resultados.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, y el tamaño del repositorio aparece como 0,0 GB. No hay evidencia de uso en producción ni de validación por terceros.
- Recall del 57,27 %: en la práctica, aproximadamente cuatro de cada diez instancias de daño no se detectan con el umbral de evaluación empleado. Para inspección de seguridad viaria esto implica que el modelo debe usarse como herramienta de triaje, no como sistema de certificación autónoma.
- Desequilibrio por clase: la clase `transverse_crack` es la peor detectada (mAP@50 de 53,10 y mAP@50-95 de 25,71), mientras que `pothole` es la mejor (73,94 y 45,18). Las grietas transversales, siendo uno de los defectos más habituales, quedan claramente infradetectadas.
- Dominio restringido: el modelo solo reconoce cuatro clases de daño viario. Cualquier objeto fuera de esas categorías (señalización, marcas viales, vehículos, peatones) no se detecta y puede generar falsos positivos si la textura de la calzada se confunde con una grieta.
- Dependencia del dominio de entrenamiento: no se detalla en la model card la composición geográfica de RDD2022 utilizada, las condiciones de iluminación, el clima ni el tipo de cámara. El rendimiento fuera de esas condiciones (nocturno, lluvia, imágenes satelitales con otra resolución) no está evaluado.
- Sin información sobre sesgos ni robustez: no se documentan análisis de sensibilidad a resolución, compresión JPEG, oclusión parcial o variaciones de perspectiva.
- Idiomas: no aplica, al no procesar texto. No obstante, el modelo está etiquetado con `region:us`, dato sin implicaciones funcionales para un detector.
- Formato y reproducibilidad: la model card proporcionada aparece truncada en la sección de configuración de entrenamiento, por lo que no se pueden reproducir los hiperparámetros exactos del ajuste fino.
- Riesgo de sobreajuste al *split* de *test* publicado: al ser un *benchmark* público y reutilizado, no puede descartarse una selección de modelo basada en el rendimiento en ese mismo *test*, con la consiguiente sobreestimación del rendimiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/rdd2022-yolo26m
- Dataset RDD2022 en HuggingFace: https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench (fuente de los resultados y del protocolo de evaluación): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Referencias arXiv declaradas en las etiquetas del repositorio (la información proporcionada no incluye sus títulos):
  - https://arxiv.org/abs/2209.08538
  - https://arxiv.org/abs/2606.03748
  - https://arxiv.org/abs/2511.09554
  - https://arxiv.org/abs/2304.07193
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados corresponden a hilos de Reddit sobre plataformas de *streaming* de anime y no guardan relación con el modelo.
