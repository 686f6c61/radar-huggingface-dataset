# dronefreak/uavdt-yolo11m

## Resumen

uavdt-yolo11m es un detector de objetos de la familia YOLO11, en su variante "m", fine-tuneado por el usuario dronefreak sobre el conjunto de datos UAVDT (vehículos vistos desde drones). Parte de los pesos preentrenados Ultralytics/YOLO11 y se distribuye a través de HuggingFace con la librería ultralytics. El modelo tiene 20,1 millones de parámetros, un coste de 68,5 GFLOPs a 640 px y una licencia AGPL-3.0.

El modelo forma parte de DetectionBench, un framework cuyo objetivo es comparar detectores modernos con recetas de entrenamiento y protocolos de evaluación idénticos sobre varios conjuntos de datos reales. En lugar de presentar un resultado aislado y difícil de reproducir, el autor publica el resultado de este checkpoint junto a una tabla completa de modelos evaluados con el mismo pipeline (YOLOv8/9/10/11/26 y RF-DETR en varios tamaños), lo que permite situar su rendimiento relativo. Según los datos declarados por el autor, el modelo alcanza un mAP@50 de 30,47 % y un mAP@50-95 de 17,71 % en el split de test de UAVDT.

Es relevante ahora porque cubre un nicho concreto, la detección de objetos pequeños en imágenes aéreas de vehículos no tripulados, con un modelo lo bastante ligero para ejecutarse en hardware de borde a bordo de un dron. No obstante, conviene leer sus cifras con cautela: el rendimiento está muy desequilibrado entre clases y las métricas no han sido verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una etapa, familia YOLO11 (Ultralytics), variante "m" |
| Parametros totales | 20,1 M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, coste declarado a 640 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no especificado en la model card; la librería declarada es `ultralytics` (PyTorch). Tamano del repo: 0,1 GB |
| Tarea (pipeline) | object-detection |
| FLOPs | 68,5 GFLOPs a 640 px |
| Modelo base | Ultralytics/YOLO11 (fine-tune) |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

Se trata de un fine-tune del checkpoint Ultralytics/YOLO11 en su variante mediana, es decir, un detector convolucional de una sola etapa con las cabezas de detección propias de la familia YOLO11. La model card no detalla la arquitectura interna (bloques, mecanismos de atención o diseño de cabezas), por lo que cualquier descripción más concreta sería especulativa; lo único documentado es el recuento de parámetros (20,1 M) y el coste computacional a 640 px (68,5 GFLOPs).

Tampoco se documentan en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, la duración del entrenamiento ni si se aplicaron técnicas de alineación posteriores. Lo que sí se especifica es el protocolo de evaluación: las métricas se calculan sobre el split de test de UAVDT con el pipeline estándar de DetectionBench (`detectionbench-evaluate`), lo que garantiza que la receta de evaluación sea idéntica a la usada para el resto de modelos de la tabla comparativa. El conjunto de datos de referencia es UAVDT, un benchmark de detección y seguimiento de vehículos grabados desde aeronaves no tripuladas, con clases coche, camión y autobús.

## Capacidades

- Detección de objetos en imágenes aéreas tomadas desde drones (UAV), con salida de cajas delimitadoras y clases.
- Detección de vehículos: coche, camión y autobús (tres clases según la tabla de rendimiento por clase).
- Detección de objetos pequeños, escenario característico de la imagery aérea de gran altitud.
- Aplicable a flujos de vigilancia de tráfico y conteo de vehículos.
- No soporta tool calling ni function calling: es un modelo de visión puro, sin interfaz de texto.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje.
- No dispone de modo "thinking", visión-lenguaje, audio ni generación de texto: únicamente predicción de cajas sobre imagen.

## Casos de uso

- Vigilancia de tráfico desde dron: el modelo detecta vehículos en fotogramas aéreos y permite agregar conteos por carril o por intervalo temporal. Es adecuado porque su tamaño (20,1 M de parámetros) facilita la inferencia a bordo.
- Aforo y análisis de flujo vehicular: procesando secuencias de vídeo de UAVDT o de grabaciones propias, se pueden estimar densidades y patrones de circulación en vías interurbanas.
- Monitorización de infraestructuras viarias: detección de presencia de vehículos en tramos concretos para tareas de inspección o planificación de mantenimiento.
- Punto de partida para fine-tuning propio: al ser un checkpoint ya adaptado a dominio aéreo y estar integrado en DetectionBench, sirve como baseline reproducible para comparar contra nuevos datasets o nuevas recetas de entrenamiento.
- Control de estacionamiento y logística en recintos amplios: con imágenes de dron se pueden localizar vehículos estacionados y estimar ocupación de superficies.
- Búsqueda y localización de vehículos en operaciones de emergencia: el detector puede prefiltrar regiones con presencia de vehículos en imágenes de gran extensión antes de una revisión humana.
- Despliegue en edge computing a bordo del dron: con cuantización a INT8 el modelo debería caber en módulos embebidos tipo Jetson, aunque el autor no publica ninguna medición de latencia en ese escenario.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de UAVDT (métricas no verificadas de forma independiente, `verified: false` en el model-index):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 30,47 |
| mAP@50-95 | 17,71 |
| Precision | 37,70 |
| Recall | 37,01 |
| F1 | 37,35 |
| Parametros | 20,1 M |
| FLOPs (640 px) | 68,5 G |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| car | 72,50 | 40,21 |
| truck | 9,33 | 6,00 |
| bus | 9,58 | 6,91 |

El desglose por clase muestra un comportamiento fuertemente desequilibrado: el modelo funciona razonablemente bien en coches y muy mal en camiones y autobuses, con valores por debajo del 10 % de mAP@50. Esto es coherente con el fuerte desbalanceo de clases habitual en UAVDT, donde los coches dominan ampliamente el conjunto.

## Requisitos de hardware

Estimaciones derivadas del tamaño del modelo (no publicadas por el autor; se indican como cálculo, no como medición):

- Peso de los pesos en FP32: aproximadamente 80 MB (20,1 M parámetros × 4 bytes). En FP16, unos 40 MB; en INT8, unos 20 MB.
- VRAM total en inferencia a 640 px y batch 1: del orden de 1-2 GB incluyendo activaciones. Cifra estimada, no medida.
- Cabe sin problema en cualquier GPU de consumo con al menos 4 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090. También es candidato razonable para módulos embebidos tipo Jetson.
- Para entrenamiento o fine-tuning se recomienda una GPU con 8-16 GB de VRAM o superior (RTX 3060 12 GB, RTX 4070 Ti, A100, H100), aunque el autor no publica la configuración utilizada.
- Opciones de despliegue: no documentadas en la model card. La etiqueta `library_name: ultralytics` indica que el modelo se carga con el paquete `ultralytics` sobre PyTorch. El ecosistema Ultralytics permite exportar pesos a otros formatos (ONNX, TensorRT, OpenVINO, entre otros), pero esta ficha no documenta ninguna exportación concreta de este checkpoint.
- Latencia y throughput: no disponibles. El único dato relacionado es el coste de 68,5 GFLOPs a 640 px, que sirve como referencia para estimar el cómputo, pero no equivale a una medición de latencia.

## Comparativa con modelos similares

La propia model card incluye un "model zoo" con todos los detectores evaluados con el mismo pipeline sobre UAVDT. Selección de los más relevantes frente a este checkpoint:

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| YOLOv26m | 33,43 | 19,56 | 38,14 | 39,84 |
| RF-DETR Medium | 33,28 | 20,54 | 73,03 | 70,03 |
| YOLOv26s | 32,98 | 19,61 | 43,86 | 40,38 |
| RF-DETR Small | 32,62 | 20,21 | 73,83 | 71,63 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv8m | 31,42 | 18,80 | 40,27 | 37,79 |
| YOLOv11m (este modelo) | 30,47 | 17,71 | 37,70 | 37,01 |
| YOLOv10m | 30,12 | 17,33 | 40,13 | 35,68 |
| YOLOv11s | 29,10 | 17,16 | 34,32 | 37,31 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |

Observaciones: este checkpoint queda por debajo de las variantes más recientes de la misma familia (YOLOv26m, YOLOv26s) y de los modelos RF-DETR, y también ligeramente por debajo de YOLOv8m y YOLOv9s pese a tener más parámetros que YOLOv9s. La diferencia más llamativa está en precisión y recall: los RF-DETR rondan el 70-74 % en ambas métricas, mientras que este YOLOv11m se queda en torno al 37 %. Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; la comparación se limita a las métricas de detección publicadas en la misma tabla.

## Limitaciones y advertencias

- Rendimiento global moderado: 30,47 % de mAP@50 y 17,71 % de mAP@50-95 no son cifras altas en términos absolutos, aunque sean coherentes con la dificultad de UAVDT.
- Desequilibrio severo entre clases: 72,5 % de mAP@50 en coche frente a 9,33 % en camión y 9,58 % en autobús. El modelo es poco fiable para vehículos grandes.
- Precision y recall en torno al 37 % implican un volumen alto de falsos positivos y falsos negativos; no es adecuado para decisiones automatizadas sin revisión humana.
- Métricas no verificadas: el model-index marca los valores como `verified: false`, proceden únicamente del autor.
- Especialización de dominio: entrenado sobre UAVDT, por lo que el rendimiento fuera de ese tipo de imagery (altitud, sensores, iluminación o geografía distintos) puede degradarse notablemente.
- Sesgos: la información disponible no documenta análisis de sesgo demográfico ni geográfico. El sesgo más evidente es el de clase (predominio de coches) y probablemente el de condiciones de captura presentes en UAVDT.
- Riesgo de alucinación: en detección de objetos se traduce en falsos positivos sobre regiones sin vehículos, especialmente relevante dado el bajo valor de precision.
- Restricciones de licencia: AGPL-3.0 es una licencia copyleft fuerte. Su uso en servicios accesibles por red puede obligar a publicar el código fuente de la aplicación que lo integra; conviene revisarlo antes de un despliegue comercial. Además, Ultralytics distribuye YOLO11 bajo AGPL-3.0, por lo que la licencia del fine-tune es coherente con la del modelo base.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por terceros.
- Idiomas y texto: no aplica; el modelo no procesa lenguaje natural ni soporta instrucciones en ningún idioma.
- La model card está incompleta en varios apartados (dataset, detalles de entrenamiento, licencia de los datos, citación), lo que dificulta auditar la procedencia del fine-tune.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolo11m
- Repositorio del framework DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset declarado: https://huggingface.co/datasets/dronefreak/UAVDT
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
- Identificadores arXiv declarados en las etiquetas del repositorio (la ficha no detalla a qué corresponde cada uno; el identificador 1804.00518 se asocia habitualmente al artículo de referencia del benchmark UAVDT):
  - https://arxiv.org/abs/1804.00518
  - https://arxiv.org/abs/2410.17725
  - https://arxiv.org/abs/2511.09554
  - https://arxiv.org/abs/2304.07193
  - https://arxiv.org/abs/2405.14458
  - https://arxiv.org/abs/2606.03748
  - https://arxiv.org/abs/2402.13616
