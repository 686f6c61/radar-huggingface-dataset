# dronefreak/uavdt-yolov9m

## Resumen

uavdt-yolov9m es un detector de objetos YOLOv9m afinado por el usuario dronefreak sobre el conjunto de datos UAVDT (vehículos vistos desde dron) y publicado en Hugging Face. El modelo parte de los pesos Ultralytics/YOLOv9 en su variante "m" (20,2 M de parámetros y 77,9 GFLOPs por imagen a 640 px) y se entrena y evalúa dentro de DetectionBench, un marco de trabajo que aplica recetas de entrenamiento y métricas idénticas a varios detectores modernos para permitir comparaciones reproducibles.

El problema que aborda es la detección de vehículos en imágenes aéreas de baja altitud, un escenario con objetos pequeños, escalas muy variables y perspectivas cenitales. El modelo distingue tres clases: coche, camión y autobús. Sobre el split de test de UAVDT declara mAP@50 de 29,43 % y mAP@50-95 de 16,97 %, con precisión de 35,92 % y exhaustividad de 35,7 %.

Es relevante ahora porque forma parte de un "model zoo" homogéneo que permite situarlo frente a alternativas como YOLOv8m, YOLOv11m, YOLOv10m, RF-DETR o YOLOv26 en las mismas condiciones. El repositorio ocupa 0,1 GB, se distribuye bajo licencia AGPL-3.0 y no declara idiomas ni datos de contexto, ya que no es un modelo de lenguaje sino un detector puramente visual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv9 (detector convolucional de una etapa, familia Ultralytics) |
| Parámetros totales | 20,2 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no disponible / no aplica |
| Licencia | AGPL-3.0 |
| Formato de pesos | Pesos PyTorch de Ultralytics (.pt); el repositorio no publica otros formatos exportados |
| Cómputo por imagen | 77,9 GFLOPs a 640 px |
| Tarea | Detección de objetos (object-detection) |
| Clases | car, truck, bus |
| Modelo base | Ultralytics/YOLOv9 |
| Librería | ultralytics |
| Tamaño del repositorio | 0,1 GB |
| Dataset de entrenamiento | dronefreak/UAVDT |

## Arquitectura y entrenamiento

Se trata de un YOLOv9m estándar, es decir, un detector de una sola etapa basado en convoluciones, sin componentes de mezcla de expertos ni mecanismos de atención de contexto largo. La arquitectura se hereda íntegramente del modelo base Ultralytics/YOLOv9; la contribución de este repositorio es el ajuste fino sobre UAVDT y su evaluación dentro de DetectionBench. Se declaran 20,2 M de parámetros y 77,9 GFLOPs por imagen a 640 px de resolución de entrada.

El entrenamiento se realiza sobre el conjunto UAVDT, un benchmark de imágenes aéreas de tráfico con anotaciones de vehículos. Los resultados publicados se calculan sobre el split de test usando el pipeline estándar de DetectionBench (`detectionbench-evaluate`). La model card no detalla el número de tokens o imágenes vistas, la composición exacta del dataset, la resolución de entrenamiento ni si se aplicaron fases de aumento de datos más allá de las habituales del framework Ultralytics. Tampoco se menciona el uso de RLHF, DPO ni procedimientos equivalentes, algo que no aplica a un detector visual.

## Capacidades

- Detección de objetos en imágenes aéreas: localiza y clasifica vehículos en tres categorías (car, truck, bus) con cajas delimitadoras.
- Detección de objetos pequeños y de escala variable, escenario típico de la imagen captada desde dron.
- Inferencia sobre vídeo, ya que el modelo puede aplicarse fotograma a fotograma (la model card incluye un vídeo de demostración con detecciones sobre dos clips de test de UAVDT).
- Integración con el ecosistema Ultralytics: carga mediante la librería `ultralytics`, entrenamiento adicional, validación y exportación a otros formatos compatibles con el framework.
- Evaluación reproducible mediante DetectionBench, con métricas de mAP@50, mAP@50-95, precisión, exhaustividad y F1.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generación de texto, código, matemáticas, visión generalista, audio ni modo "thinking". Es un detector especializado, no un modelo multimodal ni de lenguaje.

## Casos de uso

- Monitorización de tráfico urbano desde dron: el modelo está entrenado específicamente para vehículos en perspectiva aérea, por lo que puede usarse para contar y clasificar coches en secuencias de vídeo captadas por UAV sobre vías urbanas. La clase car alcanza 69,28 % de mAP@50, el rendimiento más sólido del modelo.
- Análisis de flujo vehicular en autopistas y rondas: al procesar fotogramas consecutivos se pueden derivar conteos por carril y estimaciones de densidad de tráfico, siempre que el vehículo dominante sea el turismo.
- Gestión de aparcamientos y ocupación de superficie: la detección de coches con 37,65 % de mAP@50-95 permite estimar plazas ocupadas en estacionamientos vistos desde el aire.
- Investigación y evaluación comparativa de detectores: el modelo se integra en DetectionBench, por lo que sirve como punto de referencia reproducible frente a YOLOv8, YOLOv10, YOLOv11, RF-DETR y YOLOv26 bajo recetas idénticas.
- Etiquetado asistido de nuevos datasets aéreos: las detecciones se pueden usar como preanotaciones para revisión humana en proyectos de anotación de tráfico con dron, acelerando el trabajo de etiquetado de la clase coche.
- Auditoría de infraestructuras viarias: detección de vehículos en imágenes de inspección aérea para verificar ocupación, accesos o acumulaciones anómalas en determinadas zonas.
- Integración en pipelines de análisis de vídeo aéreo: al ser un modelo de 20,2 M de parámetros y 77,9 GFLOPs, puede desplegarse en estaciones con GPU de gama media para procesar flujos en tiempo cuasi real, combinado con lógica de seguimiento externa.

Advertencia importante para estos casos: las clases truck (7,97 % mAP@50) y bus (11,03 % mAP@50) tienen un rendimiento muy bajo, por lo que cualquier aplicación que dependa de distinguir camiones o autobuses no es fiable con este checkpoint.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de UAVDT (no verificados, `verified: false` en el model-index):

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 29,43 |
| mAP@50-95 | 16,97 |
| Precision | 35,92 |
| Recall | 35,70 |
| F1 | 35,81 |

Rendimiento por clase sobre el mismo split:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 69,28 | 37,65 |
| truck | 7,97 | 5,16 |
| bus | 11,03 | 8,10 |

Comparativa dentro del model zoo de DetectionBench en UAVDT (test), con las mismas métricas declaradas por el autor:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv26m | 33,43 | 19,56 | 38,14 | 39,84 |
| RF-DETR Medium | 33,28 | 20,54 | 73,03 | 70,03 |
| YOLOv26s | 32,98 | 19,61 | 43,86 | 40,38 |
| RF-DETR Nano | 32,78 | 20,31 | 73,60 | 66,98 |
| RF-DETR Small | 32,62 | 20,21 | 73,83 | 71,63 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv8m | 31,42 | 18,80 | 40,27 | 37,79 |
| YOLOv11m | 30,47 | 17,71 | 37,70 | 37,01 |
| YOLOv10m | 30,12 | 17,33 | 40,13 | 35,68 |
| YOLOv9m (este modelo) | 29,43 | 16,97 | 35,92 | 35,70 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| YOLOv11s | 29,10 | 17,16 | 34,32 | 37,31 |
| YOLOv26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv10s | 28,85 | 16,48 | 36,53 | 33,16 |
| YOLOv11n | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

## Requisitos de hardware

- Pesos: en FP32 el checkpoint ocupa aproximadamente 81 MB; en FP16, unos 40 MB. El repositorio completo mide 0,1 GB. Estos cálculos derivan del número de parámetros declarado (20,2 M).
- VRAM de inferencia: no hay mediciones publicadas. Con 20,2 M de parámetros y 77,9 GFLOPs por imagen a 640 px, el consumo de memoria está dominado por las activaciones y no por los pesos; es esperable que quepa en cualquier GPU con 4 GB o más en FP16 a lote 1, aunque este dato es una estimación y no una cifra declarada por el autor.
- GPU recomendadas: al tratarse de un modelo pequeño, funciona en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070, RTX 4080 o RTX 4090, así como en GPUs de centro de datos (A100, H100, L4, T4) para despliegues con muchos flujos concurrentes. Cabe holgadamente en GPUs de consumo.
- CPU: es ejecutable en CPU mediante exportación a ONNX u OpenVINO, aunque sin cifras de latencia publicadas y con throughput muy inferior al de GPU.
- Opciones de despliegue: la vía nativa es la librería `ultralytics` (Python/PyTorch). El framework permite exportar a ONNX, TensorRT, OpenVINO, TFLite, CoreML y otros formatos. No aplican vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no para detectores Ultralytics.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada; cualquier cifra debería obtenerse midiendo el checkpoint exportado en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 (UAVDT) | mAP@50-95 (UAVDT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uavdt-yolov9m (este modelo) | 20,2 M | 29,43 | 16,97 | AGPL-3.0 | Hugging Face, repo de 0,1 GB |
| YOLOv9s (UAVDT) | no disponible | 31,82 | 18,71 | no disponible | vía DetectionBench |
| YOLOv8m (UAVDT) | no disponible | 31,42 | 18,80 | no disponible | vía DetectionBench |
| YOLOv11m (UAVDT) | no disponible | 30,47 | 17,71 | no disponible | vía DetectionBench |
| RF-DETR Medium (UAVDT) | no disponible | 33,28 | 20,54 | no disponible | vía DetectionBench |

Dentro del propio model zoo, este checkpoint ocupa la décima posición de dieciocho en mAP@50. Destaca que YOLOv9s, con presumiblemente menos parámetros, supera a YOLOv9m tanto en mAP@50 como en mAP@50-95, y que las variantes RF-DETR obtienen precisiones y exhaustividades muy superiores (por encima del 70 %) con mAP@50 comparable o mejor.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial, y en particular la exposición del modelo o de un servicio derivado a través de red, obliga a liberar el código fuente correspondiente bajo la misma licencia. Además, el modelo base Ultralytics/YOLOv9 arrastra sus propias condiciones de licencia, que conviene revisar antes de cualquier despliegue en producción.
- Métricas no verificadas: todos los resultados del model-index figuran como `verified: false`, es decir, son declaraciones del autor y no han sido validadas por un tercero.
- Riesgo elevado de falsos positivos y falsos negativos: precisión de 35,92 % y exhaustividad de 35,7 % implican que una fracción mayoritaria de las detecciones emitidas puede ser incorrecta y que se pierden muchos objetos reales. No es un modelo listo para producción sin un umbral de confianza ajustado y validación propia.
- Desequilibrio severo entre clases: la clase car alcanza 69,28 % de mAP@50, mientras que truck se queda en 7,97 % y bus en 11,03 %. Cualquier caso de uso centrado en camiones o autobuses es inviable con este checkpoint.
- Dominio muy restringido: entrenado sobre UAVDT, con imágenes aéreas de tráfico rodado. El rendimiento puede degradarse fuera de ese dominio (otras altitudes, condiciones meteorológicas, sensores o geografías).
- Sin capacidades de lenguaje ni contexto: no procesa texto, no soporta tool calling ni agentes, y no tiene idiomas asociados.
- Sesgos y composición de datos: la model card no documenta la distribución geográfica, las condiciones de captura ni los posibles sesgos del conjunto UAVDT, por lo que no es posible evaluar su comportamiento diferencial por región, tipo de vía o iluminación.
- Información incompleta: no se detallan hiperparámetros de entrenamiento, número de épocas, resolución de entrenamiento ni formato de exportación recomendado.
- Impacto en vigilancia: al ser un modelo orientado a videovigilancia de tráfico, su uso debe considerar la normativa aplicable de protección de datos y de uso de drones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-yolov9m
- Framework DetectionBench (GitHub): https://github.com/dronefreak/DetectionBench
- Dataset UAVDT en Hugging Face: https://huggingface.co/datasets/dronefreak/UAVDT
- Modelo base Ultralytics/YOLOv9: https://huggingface.co/Ultralytics/YOLOv9
- Identificadores arXiv citados en los tags del repositorio: arXiv:1804.00518, arXiv:2402.13616 (artículo de YOLOv9), arXiv:2511.09554, arXiv:2304.07193, arXiv:2405.14458, arXiv:2410.17725, arXiv:2606.03748. Los títulos del resto de referencias no están confirmados en la información disponible.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos corresponden a foros sin relación con el proyecto.
