# dronefreak/gc10det-yolo11s

# Modelo gc10det-yolo11s de dronefreak: deteccion de defectos superficiales en metal

## Resumen

gc10det-yolo11s es un detector de objetos YOLO11s ajustado (fine-tuning) sobre el conjunto de datos GC10-DET, un benchmark de defectos superficiales en superficies metalicas. Lo publica el usuario dronefreak en Hugging Face como parte de DetectionBench, un framework cuyo objetivo es reproducir de forma controlada la comparativa entre detectores modernos aplicando recetas de entrenamiento y protocolos de evaluacion identicos sobre varios conjuntos de datos reales. El modelo parte de los pesos preentrenados Ultralytics/YOLO11 (variante small) y se especializa en diez clases de defecto industrial: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.

La relevancia practica del modelo esta en su tamano: 9,5 millones de parametros y 21,7 GFLOPs a 640 px de resolucion de entrada, lo que lo situa en el rango de la inspeccion visual industrial desplegable en hardware modesto (GPU de gama media, Jetson o incluso CPU). Frente a los detectores generativos o de vision-lenguaje, aqui el interes no es la versatilidad, sino la relacion entre coste computacional y rendimiento en una tarea de control de calidad muy concreta, con metricas declaradas de mAP@50 = 72,54 % y mAP@50-95 = 35,07 % en el split de test.

Es, ademas, un caso representativo de la tendencia a publicar pesos ajustados con metricas estandarizadas y comparables dentro de un mismo repositorio de evaluacion. Conviene senalar que las metricas estan declaradas por el autor y marcadas como no verificadas (verified: false), y que el modelo acumulaba 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion independiente de su comportamiento fuera del pipeline de DetectionBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (detector de objetos de una etapa, familia Ultralytics YOLO11) |
| Parametros totales | 9,5 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | no disponible en la model card; el framework Ultralytics permite exportacion con cuantizacion INT8 (ONNX, TensorRT, OpenVINO, TFLite, entre otros) |
| Idiomas soportados | no aplica (deteccion de imagenes); las anotaciones del dataset estan en ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, archivo best.pt) |
| Resolucion de entrada evaluada | 640 px |
| FLOPs | 21,7 GFLOPs a 640 px |
| Tarea | object-detection (deteccion de objetos) |
| Libreria | ultralytics |
| Modelo base | Ultralytics/YOLO11 (YOLO11s) |
| Dataset de ajuste | dronefreak/GC10-DET |
| Fecha de publicacion | 27 de septiembre de 2026 (metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de YOLO11 en su variante small: un detector de una sola etapa con backbone y cuello basados en bloques convolucionales y de agregacion multi-escala, y una cabeza de deteccion densa que predice cajas y clases en varias escalas. El modelo no introduce modificaciones estructurales respecto al YOLO11s original: se trata de un ajuste fino supervisado sobre el conjunto GC10-DET partiendo de los pesos preentrenados de Ultralytics/YOLO11. No se documentan en la model card ni el numero de tokens o imagenes efectivas por epoca, ni la composicion exacta del dataset mas alla de las diez clases, ni el uso de tecnicas de alineamiento tipo RLHF o DPO (no aplicables en deteccion de objetos supervisada).

El elemento diferencial no es la arquitectura, sino el protocolo de evaluacion: las metricas se calculan sobre el split de test de GC10-DET con el pipeline estandar de DetectionBench (`detectionbench-evaluate`), lo que permite comparar el modelo con otras familias (RF-DETR, YOLO26, YOLOv8) entrenadas con recetas equivalentes. La model card publica ademas curvas de precision-recall, curva F1, matriz de confusion y matriz de confusion normalizada como artefactos de evaluacion. El entrenamiento y la evaluacion forman parte del repositorio DetectionBench, que actua como marco reproducible de comparacion.

## Capacidades

- Deteccion de objetos en imagenes de superficies metalicas, con localizacion de cajas delimitadoras y clasificacion en diez categorias de defecto: crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line.
- Inferencia sobre imagenes individuales o lotes mediante la API de Ultralytics (`YOLO(...).predict(...)`), con salida de cajas, etiquetas y puntuaciones de confianza.
- Despliegue embebido: al tener 9,5 M de parametros, es apto para ejecucion en dispositivos de borde, algo relevante en lineas de produccion con camaras industriales.
- Exportacion a otros formatos de inferencia mediante el framework Ultralytics (ONNX, TensorRT, OpenVINO, TFLite, CoreML, entre otros), util para integrarlo en runtimes sin Python.
- Capacidades multilingues: no aplica; se trata de un modelo de vision. La unica dimension linguistica son los nombres de clase del dataset, en ingles.
- No dispone de tool calling ni function calling, no soporta razonamiento multi-paso, no genera texto, no procesa audio y no implementa un modo de "thinking".
- Deteccion de multiples instancias por imagen, incluida la coexistencia de varias clases de defecto en la misma pieza.

## Casos de uso

- Control de calidad en linea de produccion de chapa metalica: el modelo inspecciona cada imagen capturada por una camara industrial y senala la presencia y ubicacion de defectos como rolled_pit o crescent_gap, que en la evaluacion publicada alcanzan mAP@50 de 99,5 % y 96,35 % respectivamente. Es adecuado porque su coste de inferencia es reducido y permite procesar flujo continuo.
- Clasificacion y descarte automatico en trenes de laminacion: integrado en un PLC o sistema de vision, el detector activa el rechazo de piezas cuando la confianza de deteccion supera un umbral, reduciendo la inspeccion manual.
- Auditoria retrospectiva de lotes: dado que puede ejecutarse por lotes, permite reprocesar archivos historicos de imagenes para localizar que lotes concentran mas defectos de un tipo concreto (por ejemplo, inclusion o crease) y trazar su origen.
- Monitorizacion de deriva de proceso: comparar la distribucion de defectos detectados a lo largo del tiempo ayuda a detectar cambios en el utillaje o en los parametros de la linea antes de que generen chatarra.
- Analisis de causas raiz con matriz de confusion: las matrices publicadas en la model card ayudan a distinguir que clases se confunden entre si (por ejemplo, defectos de mancha como oil_spot, silk_spot y water_spot), informacion util para ajustar el etiquetado o la iluminacion de la celda de inspeccion.
- Prototipado rapido en plantas piloto: al ser un modelo de 9,5 M de parametros, puede desplegarse en una GPU de gama media o en un dispositivo Jetson para validar la viabilidad del caso de negocio antes de invertir en un sistema de vision dedicado.
- Etiquetado asistido (pre-anotacion): el modelo puede generar propuestas de cajas sobre nuevas imagenes de la misma familia de superficies, reduciendo el coste de anotacion humana en la ampliacion del dataset.
- Docencia y experimentacion en vision por computador industrial: sirve como referencia reproducible para comparar familias de detectores sobre un dataset publico con licencia CC-BY-4.0 (la del dataset; la del modelo es AGPL-3.0).

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de GC10-DET, marcados como no verificados (verified: false). Fuente: DetectionBench.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 72,54 |
| mAP@50-95 | 35,07 |
| Precision | 72,39 |
| Recall | 66,80 |
| F1 | 69,48 |
| Parametros | 9,5 M |
| FLOPs | 21,7 B (a 640 px) |

Comparativa publicada por el autor dentro del "GC10-DET Model Zoo" (mismo protocolo de evaluacion):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n | 74,25 | 38,31 | 80,50 | 67,99 |
| YOLO26m | 73,97 | 36,94 | 75,70 | 68,19 |
| YOLOv8n | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s (este modelo) | 72,54 | 35,07 | 72,39 | 66,80 |
| YOLOv8s | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m | 71,88 | 38,80 | 69,77 | 70,84 |
| YOLO11n | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano | 70,17 | 38,06 | 77,08 | 71,04 |

Rendimiento por clase del modelo evaluado (mAP@50 / mAP@50-95, en %):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 32,91 | 11,09 |
| crescent_gap | 96,35 | 58,80 |
| inclusion | 30,37 | 9,40 |
| oil_spot | 52,90 | 22,06 |
| punching_hole | 89,63 | 47,11 |
| rolled_pit | 99,50 | 49,75 |
| silk_spot | 54,59 | 21,13 |
| waist_folding | 88,50 | 46,43 |
| water_spot | 89,66 | 56,37 |
| welding_line | 91,01 | 28,56 |

## Requisitos de hardware

- Huella de pesos: aproximadamente 38 MB en FP32, 19 MB en FP16 y 9,5 MB en INT8, para 9,5 M de parametros.
- VRAM estimada para inferencia: no publicada por el autor. Por el tamano del modelo y una entrada de 640 px con lote pequeno, la huella de memoria es muy reducida (del orden de cientos de megabytes incluyendo activaciones), aunque esta cifra es una estimacion derivada del numero de parametros y no un dato medido.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, A100, H100 o L4. En el extremo opuesto, tambien es viable en CPU y en dispositivos embebidos tipo NVIDIA Jetson.
- Compatibilidad con GPU de consumo: si. Es un modelo disenado implicitamente para ese rango; no requiere memoria unificada ni GPUs de centro de datos.
- Opciones de despliegue: API Python de Ultralytics (`ultralytics`), exportacion a ONNX Runtime, TensorRT, OpenVINO, TFLite o CoreML para runtimes de produccion. Frameworks orientados a modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no aplican a este modelo.
- Latencia y throughput: no disponibles. La model card no publica mediciones de milisegundos por imagen ni imagenes por segundo en ningun hardware concreto.

## Comparativa con modelos similares

Comparativa de modelos evaluados sobre el mismo dataset y con el mismo pipeline (datos del propio autor; los parametros de los modelos alternativos no se detallan en la informacion disponible).

| Modelo | Parametros | mAP@50 | mAP@50-95 | Precision | Recall | Licencia |
|---|---|---|---|---|---|---|
| RF-DETR Small | no disponible | 76,07 | 42,51 | 87,86 | 65,03 | no disponible |
| YOLO26s | no disponible | 75,77 | 38,15 | 77,16 | 74,07 | no disponible |
| YOLOv8n | no disponible | 73,25 | 38,74 | 67,99 | 70,87 | AGPL-3.0 (familia Ultralytics) |
| YOLO11s (este modelo) | 9,5 M | 72,54 | 35,07 | 72,39 | 66,80 | AGPL-3.0 |
| YOLO11n | no disponible | 70,44 | 40,09 | 78,93 | 62,64 | AGPL-3.0 (familia Ultralytics) |
| RF-DETR Nano | no disponible | 70,17 | 38,06 | 77,08 | 71,04 | no disponible |

Lectura de la comparativa: en mAP@50, este YOLO11s queda por debajo de RF-DETR Small y de la familia YOLO26, pero iguala a YOLOv8s (72,54) y supera a YOLO11n, RF-DETR Nano y YOLOv8m dentro de este protocolo concreto. En mAP@50-95, metricas mas estrictas de localizacion, su 35,07 % es el valor mas bajo de la tabla, lo que sugiere cajas menos ajustadas que las de RF-DETR o los YOLO26. Su licencia AGPL-3.0 es mas restrictiva que las licencias de las familias competidoras.

## Limitaciones y advertencias

- Metricas no verificadas: todos los resultados del model-index estan marcados con `verified: false`; proceden del autor y del pipeline de DetectionBench, sin reproduccion independiente conocida.
- Ausencia de validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, y un tamano de repositorio declarado de 0,0 GB, lo que puede indicar que los pesos se sirven mediante almacenamiento externo (Xet/LFS) o que el repositorio no estaba completamente materializado.
- Rendimiento muy desigual por clase: rolled_pit (99,50 mAP@50) o crescent_gap (96,35) contrastan con inclusion (30,37) y crease (32,91). Los defectos sutiles o de bajo contraste son el punto debil del modelo.
- Riesgo de falsos negativos y falsos positivos: con un recall del 66,80 % y una precision del 72,39 %, aproximadamente un tercio de los defectos reales no se detectan y una parte relevante de las detecciones son erroneas. En control de calidad, un falso negativo implica liberar una pieza defectuosa, por lo que el umbral de confianza debe calibrarse segun el coste del error.
- Sesgo de dominio: el modelo esta ajustado exclusivamente sobre GC10-DET, con un tipo concreto de superficie metalica, iluminacion y camaras. Su traslado a otras lineas, materiales o condiciones de captura requerira reajuste o fine-tuning adicional.
- Riesgo de sobreajuste a un dataset pequeno: la informacion disponible indica un tamano de dataset en el rango de 1K a 10K imagenes y unos 965 MB, lo que limita la diversidad de ejemplos por clase.
- Limitaciones de contexto e idioma: no aplican en el sentido de los modelos de lenguaje, pero si conviene recordar que el modelo no procesa texto, audio ni secuencias, y que los nombres de clase estan fijados en ingles y son los del dataset de entrenamiento.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso del modelo como servicio en red puede obligar a liberar el codigo fuente de la aplicacion que lo integra. Para uso comercial cerrado conviene revisar las condiciones o considerar una licencia comercial alternativa de Ultralytics.
- Sin garantia de mantenimiento: no hay informacion sobre versiones posteriores, soporte ni actualizaciones del repositorio mas alla de la fecha de publicacion indicada en los metadatos.
- Artefactos de evaluacion incompletos en el texto disponible: se referencian figuras (curvas PR y F1, matrices de confusion) pero no se proporcionan en la informacion recuperada, por lo que no se pueden auditar aqui.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/gc10det-yolo11s
- Dataset GC10-DET (autor): https://huggingface.co/datasets/dronefreak/GC10-DET
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Pagina del modelo YOLO11s de Ultralytics: https://platform.ultralytics.com/ultralytics/yolo11/yolo11s
- Modelo hermano del mismo autor (UAVDT): https://huggingface.co/dronefreak/uavdt-yolo11s
- Repositorio CABiNet del mismo autor: https://github.com/dronefreak/CABiNet
- Referencias arXiv incluidas en los tags del repositorio (contenido no descrito en la model card): arxiv:2410.17725, arxiv:2511.09554, arxiv:2304.07193, arxiv:2606.03748
