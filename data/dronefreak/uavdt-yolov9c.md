# dronefreak/uavdt-yolov9c

## Resumen

uavdt-yolov9c es un detector de objetos YOLOv9c ajustado (fine-tuning) sobre el conjunto de referencia UAVDT (Unmanned Aerial Vehicle Benchmark: Object Detection and Tracking), un corpus de imágenes aéreas capturadas desde drones en escenarios de tráfico urbano. Lo publica el usuario dronefreak como parte de DetectionBench, un framework cuyo objetivo es reproducir de forma controlada el entrenamiento y la evaluación de detectores modernos bajo recetas idénticas, de modo que las comparaciones entre arquitecturas sean justas. El modelo tiene 25,6 millones de parámetros y 104,0 GFLOPs a 640 píxeles de entrada, y se distribuye como checkpoint PyTorch del ecosistema Ultralytics.

El problema que aborda es la detección de vehículos (coche, camión y autobús) en imágenes aéreas de dron, un dominio con objetos pequeños, fuerte desbalance de clases, variaciones de altitud, movimiento de cámara y oclusiones. Su relevancia es principalmente metodológica: sirve como punto de referencia reproducible dentro del zoo de modelos que DetectionBench ha entrenado y evaluado sobre UAVDT, y permite comparar YOLOv9c contra YOLOv8, YOLOv10, YOLO11, YOLO26 y RF-DETR empleando exactamente el mismo pipeline de evaluación.

El rendimiento absoluto es modesto: 29,16 de mAP@50 y 16,46 de mAP@50-95 en el split de test, con valores especialmente bajos en las clases truck y bus. Se trata, por tanto, de una pieza de benchmarking y experimentación más que de un detector listo para producción sin reentrenamiento adicional. La licencia es AGPL-3.0, lo que impone obligaciones copyleft relevantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de detección de objetos en una etapa, familia YOLOv9 (base Ultralytics/YOLOv9, variante c) |
| Parametros totales | 25,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, evaluado a 640 px) |
| Tipos de cuantizacion | no disponible en la model card; el framework Ultralytics permite exportar a formatos como TensorRT, ONNX, OpenVINO, TFLite y CoreML |
| Idiomas soportados | no aplica (modelo de detección de objetos, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | checkpoint PyTorch de Ultralytics (`best.pt`) |
| FLOPs | 104,0 B a 640 px |
| Tarea (pipeline) | object-detection |
| Clases | car, truck, bus |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Modelo base | Ultralytics/YOLOv9 (YOLOv9c) |
| Repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv9 en su variante c, un detector de una sola etapa basado en redes convolucionales con el mecanismo de información de gradiente programable (PGI, Programmable Gradient Information) y el bloque GELAN propuestos en el artículo de YOLOv9 (arXiv:2402.13616). El modelo aquí publicado no introduce cambios arquitectónicos: es un ajuste fino del checkpoint oficial YOLOv9c sobre el dataset UAVDT, con 25,6 M de parámetros y 104,0 GFLOPs a 640 px.

El entrenamiento se realizó dentro del framework DetectionBench con el objetivo de homogeneizar recetas entre detectores. La model card menciona una sección de configuración de entrenamiento, pero el contenido disponible se corta en la primera fila de la tabla, por lo que no se detallan hiperparámetros como número de épocas, tamaño de lote, resolución de entrenamiento, aumentos de datos ni si se aplicaron técnicas de ajuste posteriores. No hay información sobre número de tokens (no aplica) ni sobre fases de RLHF o DPO, que no tienen sentido en un detector de objetos. El conjunto UAVDT (descrito en arXiv:1804.00518) aporta las tres clases evaluadas: car, truck y bus.

## Capacidades

- Detección de objetos en imágenes aéreas tomadas desde drones (UAV), con salida de cajas delimitadoras y puntuaciones de confianza.
- Clasificación en tres categorías: car, truck y bus.
- Detección de objetos pequeños, uno de los retos centrales del dataset UAVDT.
- Inferencia sobre imágenes individuales, carpetas, vídeo o flujos mediante la API `predict` de Ultralytics.
- Integración directa con el ecosistema Ultralytics (carga con `YOLO(weights)`, ajuste de umbral `conf`, visualización con `results[0].show()`).
- Evaluación estandarizada mediante el pipeline `detectionbench-evaluate`, lo que facilita la reproducibilidad de resultados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento explícito (thinking mode), ni de entrada de audio o texto.
- No procesa visión-lenguaje: no describe escenas ni responde a preguntas sobre la imagen.

## Casos de uso

- Vigilancia de tráfico con drones: el modelo detecta coches, camiones y autobuses en tomas aéreas, lo que permite monitorizar flujos viarios en tramos donde no hay cámaras fijas. Es adecuado porque ha sido ajustado específicamente sobre imágenes de UAV en escenarios de tráfico, aunque el recuento debe validarse por clase dado el bajo recall en truck y bus.
- Aforo y análisis de flujo vehicular: integrado en un pipeline que procese fotogramas de vídeo de dron, puede alimentar conteos por fotograma y estimaciones de densidad. Requiere posprocesado con seguimiento (tracking) para evitar dobles conteos.
- Inspección de infraestructuras viarias: detección de vehículos estacionados o circulando en autopistas, áreas de servicio o aparcamientos a partir de vuelos programados. La ventaja es la ausencia de instalación de sensores en el terreno.
- Investigación académica en detección aérea: sirve como baseline reproducible dentro de DetectionBench, con métricas publicadas (mAP@50 29,16; mAP@50-95 16,46) y comparables contra YOLOv8, YOLOv10, YOLO11, YOLO26 y RF-DETR bajo la misma receta.
- Prototipado de sistemas embarcados en dron: con 25,6 M de parámetros y un checkpoint de 0,1 GB, es viable exportarlo y ejecutarlo en hardware de borde como Jetson u otras plataformas con aceleración, para detección en tiempo real a bordo.
- Análisis retrospectivo de grabaciones aéreas: procesado por lotes de archivos de vídeo ya capturados para extraer estadísticas de ocupación o patrones de tráfico, un escenario donde la latencia no es crítica y compensa un modelo ligero y fácil de desplegar.
- Generación de datos etiquetados asistida: uso del modelo como preanotador sobre nuevo material aéreo, con revisión humana posterior, para acelerar la creación de datasets propios del mismo dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de UAVDT, evaluados con el pipeline estándar de DetectionBench (`detectionbench-evaluate`). Las métricas están marcadas como no verificadas (`verified: false`) en el model-index.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 29,16 |
| mAP@50-95 | 16,46 |
| Precision | 35,38 |
| Recall | 34,35 |
| F1 | 34,86 |
| Parametros | 25,6 M |
| FLOPs (640 px) | 104,0 B |

Rendimiento por clase en UAVDT (test):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 72,47 | 39,27 |
| truck | 7,27 | 4,75 |
| bus | 7,74 | 5,36 |

Comparativa con el resto del zoo de modelos evaluados por el autor sobre UAVDT (mismos datos declarados en la model card):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26m | 33,43 | 19,56 | 38,14 | 39,84 |
| RF-DETR Medium | 33,28 | 20,54 | 73,03 | 70,03 |
| YOLO26s | 32,98 | 19,61 | 43,86 | 40,38 |
| RF-DETR Nano | 32,78 | 20,31 | 73,60 | 66,98 |
| YOLO26l | 32,64 | 18,75 | 40,17 | 36,45 |
| RF-DETR Small | 32,62 | 20,21 | 73,83 | 71,63 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv8m | 31,42 | 18,80 | 40,27 | 37,79 |
| YOLO11m | 30,47 | 17,71 | 37,70 | 37,01 |
| YOLOv10m | 30,12 | 17,33 | 40,13 | 35,68 |
| YOLOv9m | 29,43 | 16,97 | 35,92 | 35,70 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| YOLOv10l | 29,16 | 16,54 | 36,90 | 35,60 |
| **YOLOv9c (este modelo)** | **29,16** | **16,46** | **35,38** | **34,35** |
| YOLO11s | 29,10 | 17,16 | 34,32 | 37,31 |
| YOLO26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv8l | 28,86 | 17,27 | 38,33 | 32,86 |
| YOLOv10s | 28,85 | 16,48 | 36,53 | 33,16 |
| YOLO11l | 28,64 | 17,16 | 34,75 | 34,02 |
| YOLO11n | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

## Requisitos de hardware

- Peso del checkpoint: aproximadamente 0,1 GB en el repositorio; los pesos de 25,6 M de parámetros ocupan del orden de 100 MB en FP32, 50 MB en FP16 y 25 MB en INT8 (estimación a partir del número de parámetros, no dato declarado por el autor).
- VRAM estimada para inferencia: no disponible como dato oficial. Por el tamaño del modelo, la inferencia a 640 px con lote 1 es holgadamente ejecutable en GPUs de consumo; cualquier GPU con 4 GB o más de VRAM debería ser suficiente, aunque no se publica una medición concreta.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo cabe en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100, en las que estaría muy infrautilizado salvo por procesamiento por lotes de gran volumen.
- Cabe en GPU de consumo: sí, con margen amplio, dado el reducido número de parámetros y FLOPs.
- Ejecución en CPU: viable para procesamiento por lotes o pruebas, con latencia mayor; no se publican cifras.
- Opciones de despliegue: el modelo se carga con la librería `ultralytics` (junto con `huggingface_hub` para la descarga) y se ejecuta con `YOLO(weights).predict(...)`. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Todos los modelos de la tabla siguiente han sido entrenados y evaluados por el mismo autor sobre UAVDT con la misma receta, por lo que la comparación es homogénea salvo por la arquitectura.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall | Licencia |
|---|---|---|---|---|---|
| uavdt-yolov9c (este modelo) | 29,16 | 16,46 | 35,38 | 34,35 | AGPL-3.0 |
| YOLOv9s sobre UAVDT | 31,82 | 18,71 | 39,83 | 38,12 | no disponible |
| YOLOv9m sobre UAVDT | 29,43 | 16,97 | 35,92 | 35,70 | no disponible |
| YOLO26m sobre UAVDT | 33,43 | 19,56 | 38,14 | 39,84 | no disponible |
| RF-DETR Medium sobre UAVDT | 33,28 | 20,54 | 73,03 | 70,03 | no disponible |
| YOLOv8m sobre UAVDT | 31,42 | 18,80 | 40,27 | 37,79 | no disponible |

Observaciones: en mAP@50 el modelo queda por detrás de YOLOv9s, YOLOv9m, YOLOv8m, YOLO11m, YOLOv10m y de toda la familia YOLO26 y RF-DETR listada. Destaca la diferencia de precisión y recall de RF-DETR (73,03 / 70,03) frente a la del modelo aquí descrito (35,38 / 34,35). La licencia de los modelos comparados no se especifica en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: 29,16 de mAP@50 y 16,46 de mAP@50-95 en el split de test. No es un detector apto para producción sin reentrenamiento o ajuste.
- Desbalance extremo por clase: la clase car alcanza 72,47 de mAP@50, mientras que truck se queda en 7,27 y bus en 7,74. Cualquier sistema que dependa de distinguir camiones o autobuses será poco fiable.
- Métricas no verificadas: el model-index marca los resultados como `verified: false`; proceden del propio autor y del pipeline de DetectionBench, sin replicación independiente conocida.
- Sesgo de dominio: el modelo está ajustado exclusivamente sobre UAVDT, con sensores, altitudes, iluminación y geografía concretos. Su generalización a otros drones, otras ciudades o condiciones meteorológicas distintas no está garantizada.
- Sin información sobre sesgos demográficos o sociales: al no procesar personas ni texto, los sesgos relevantes son de tipo visual y de dominio (apariencia de vehículos, condiciones de captura), no analizados en la información disponible.
- Riesgo de falsos negativos y falsos positivos: los valores de precision (35,38) y recall (34,35) implican una tasa elevada de errores, algo crítico en aplicaciones de vigilancia o seguridad.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si se distribuye el software o se ofrece como servicio accesible por red, la AGPL exige liberar el código fuente correspondiente. Conviene revisar las implicaciones antes de integrarlo en un producto propietario.
- Dependencia del ecosistema Ultralytics: el uso del paquete `ultralytics` está sujeto a su propia licencia (AGPL-3.0 en su versión libre), lo que añade una capa adicional de obligaciones.
- Modelo de visión sin capacidades lingüísticas: no genera texto, no responde preguntas y no puede emplearse en tareas de razonamiento, agentes o asistentes conversacionales.
- Sin información sobre cuantizaciones validadas, latencias medidas ni consumo energético; cualquier despliegue en producción requiere una evaluación propia de estos extremos.
- Sin resultados de benchmarks publicados más allá del conjunto UAVDT; no hay datos en MMLU, HumanEval, GSM8K ni métricas de texto, que no aplican a esta tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolov9c
- Dataset UAVDT en HuggingFace: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Artículo de YOLOv9 (arXiv:2402.13616): https://arxiv.org/abs/2402.13616
- Artículo del benchmark UAVDT (arXiv:1804.00518): https://arxiv.org/abs/1804.00518
- No se han encontrado otros enlaces relevantes en la búsqueda web; los resultados devueltos no guardan relación con el modelo.
