# dronefreak/uavdt-yolov10m

## Resumen

dronefreak/uavdt-yolov10m es un detector de objetos YOLOv10m afinado sobre el conjunto de datos UAVDT (vehículos vistos desde dron) por el usuario dronefreak, publicado como parte del proyecto DetectionBench, un marco que busca reproducir con recetas de entrenamiento y métricas idénticas la comparación entre detectores modernos sobre varios conjuntos de datos reales. No es un modelo de lenguaje: es un detector de imágenes aéreas con tres clases (car, truck y bus), pipeline `object-detection` y 16,6 millones de parámetros.

El modelo parte del checkpoint Ultralytics/YOLOv10 y se entrena sobre el split de entrenamiento de UAVDT, evaluándose sobre el split de test con la herramienta `detectionbench-evaluate`. Sus cifras declaradas son modestas en términos absolutos: mAP@50 de 30,12 %, mAP@50-95 de 17,33 %, precisión 40,13 % y recall 35,68 %, con un F1 de 37,77 %, y las métricas figuran como no verificadas (`verified: false`) en el model-index.

Su relevancia es fundamentalmente metodológica y comparativa: forma parte de un zoo de modelos evaluados bajo condiciones homogéneas sobre UAVDT, lo que permite situarlo frente a alternativas como YOLOv26s, RF-DETR Small o YOLOv9s con la misma receta. El repositorio declara licencia AGPL-3.0, no tiene descargas ni likes en el momento de la consulta y su tamaño es de 0,0 GB, por lo que conviene comprobar la disponibilidad real de los pesos antes de integrarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector de objetos one-stage de la familia YOLOv10 (modelo base Ultralytics/YOLOv10); la model card no detalla la topología interna |
| Parámetros totales | 16,6 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión); resolución de entrada de 640 px según los FLOPs reportados |
| Tipos de cuantización | No disponible (no se documentan pesos FP16, INT8 ni otros) |
| Idiomas soportados | No aplica (modelo de detección de objetos, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | No especificado en la información disponible; el repositorio declara `library_name: ultralytics`, por lo que se espera el checkpoint nativo de Ultralytics (PyTorch). Tamaño del repositorio: 0,0 GB |
| Tarea | Detección de objetos (`pipeline_tag: object-detection`) |
| Clases | car, truck, bus |
| FLOPs | 64,5 B a 640 px |
| Conjunto de datos | dronefreak/UAVDT (test split para evaluación) |
| Framework | Ultralytics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (*fine-tuning*) del checkpoint YOLOv10m de Ultralytics sobre el conjunto UAVDT. YOLOv10 es una familia de detectores one-stage basada en red convolucional, con cabeza anchor-free y predicción sin supresión de no máximos (NMS) gracias al esquema de asignación dual consistente empleado durante el entrenamiento, según la documentación pública del modelo base. La model card de este checkpoint no añade detalles sobre la topología, el número de capas ni modificaciones respecto al modelo original.

En cuanto a los datos, el entrenamiento se realiza sobre UAVDT, un conjunto de imágenes aéreas capturadas desde dron con anotaciones de vehículos en tres clases (car, truck, bus). El autor no especifica en la información proporcionada el número de imágenes o tokens de entrenamiento, la composición exacta del dataset, el número de épocas, el tamaño de lote, la resolución de entrenamiento ni si se aplicaron técnicas de aumento de datos más allá de las habituales de Ultralytics. Tampoco se documenta ninguna fase de ajuste por preferencias (RLHF/DPO), lo cual no aplica a un detector de objetos. La innovación destacable, en este caso, no es arquitectónica sino de protocolo: el modelo se entrena y evalúa dentro de DetectionBench con recetas y métricas homogéneas para permitir comparaciones reproducibles entre detectores.

## Capacidades

- Detección de objetos en imágenes aéreas capturadas desde dron, con cajas delimitadoras para tres clases: coche (`car`), camión (`truck`) y autobús (`bus`).
- Localización de vehículos pequeños en escenas aéreas, típicas de vigilancia de tráfico y monitorización desde UAV.
- Inferencia sobre imágenes individuales o fotogramas de vídeo mediante la librería Ultralytics (se incluye un vídeo de demostración en el repositorio con detecciones sobre dos clips de test de UAVDT).
- Integración en el ecosistema Ultralytics: carga del checkpoint con la API habitual de `ultralytics` y evaluación con la herramienta `detectionbench-evaluate`.
- Generación de texto, razonamiento, código, matemáticas, visión general, audio y multimodalidad: no aplica, es exclusivamente un detector de objetos.
- Soporte de *tool calling* / *function calling*: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Modo *thinking*, visión de propósito general o audio: no aplica.

## Casos de uso

- Vigilancia de tráfico desde dron: el modelo procesa fotogramas de vídeo aéreo y devuelve cajas para coches, camiones y autobuses, lo que permite monitorizar flujos vehiculares en vías urbanas o interurbanas sin necesidad de infraestructura fija en carretera.
- Conteo y clasificación de vehículos por tipología: al distinguir entre `car`, `truck` y `bus`, resulta adecuado para elaborar estadísticas de composición del tráfico (por ejemplo, proporción de vehículos pesados) a partir de grabaciones aéreas.
- Análisis de congestión y ocupación viaria: integrado en un pipeline de vídeo que ejecute inferencia por fotograma, permite estimar densidad de vehículos por zona y detectar retenciones en tiempo cuasi real sobre secuencias de UAV.
- Evaluación comparativa de detectores: al formar parte del zoo de UAVDT de DetectionBench, sirve como línea base reproducible frente a otros modelos (YOLOv8, YOLOv9, YOLOv11, YOLOv26, RF-DETR) evaluados con la misma receta, útil en trabajos de investigación que necesiten comparativas homogéneas.
- Transferencia a dominios aéreos similares: al estar afinado sobre imágenes de dron, es un punto de partida razonable para ajustes posteriores en otros conjuntos aéreos de vehículos, aprovechando el bajo coste de reentrenamiento de un modelo de 16,6 M de parámetros.
- Monitorización de infraestructuras y eventos: en escenarios de control de accesos, recintos feriales o grandes aparcamientos vistos desde el aire, el detector puede alimentar sistemas de alerta cuando se detectan vehículos pesados en zonas restringidas.
- Apoyo a tareas de emergencia y planificación urbana: el recuento de vehículos a partir de vuelos de dron puede emplearse para analizar patrones de movilidad, evaluar el impacto de cambios de circulación o priorizar actuaciones sobre la red viaria.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de UAVDT (métricas no verificadas, `verified: false`):

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 30,12 |
| mAP@50-95 | 17,33 |
| Precisión | 40,13 |
| Recall | 35,68 |
| F1 | 37,77 |
| Parámetros | 16,6 M |
| FLOPs | 64,5 B (a 640 px) |

Rendimiento por clase en el mismo split:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| car | 71,18 | 38,45 |
| truck | 6,82 | 4,33 |
| bus | 12,37 | 9,21 |

Comparativa dentro del zoo de UAVDT publicado por el autor (mismas condiciones de entrenamiento y evaluación):

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precisión (%) | Recall (%) |
|---|---|---|---|---|
| YOLOv26s | 32,98 | 19,61 | 43,86 | 40,38 |
| RF-DETR Nano | 32,78 | 20,31 | 73,60 | 66,98 |
| RF-DETR Small | 32,62 | 20,21 | 73,83 | 71,63 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv8m | 31,42 | 18,80 | 40,27 | 37,79 |
| YOLOv10m (este modelo) | 30,12 | 17,33 | 40,13 | 35,68 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| YOLOv11s | 29,10 | 17,16 | 34,32 | 37,31 |
| YOLOv26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv10s | 28,85 | 16,48 | 36,53 | 33,16 |
| YOLOv11n | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa basada en el tamaño del modelo (16,6 M de parámetros), en FP16 los pesos ocupan del orden de 33 MB y la memoria vendrá dominada por las activaciones a 640 px; un presupuesto de 2 a 4 GB de VRAM por instancia suele ser suficiente, pero es una estimación, no un dato confirmado.
- GPU recomendadas: no disponibles en la información proporcionada. Dado el tamaño y los 64,5 B FLOPs a 640 px, cualquier GPU con soporte CUDA de gama media en adelante debería poder ejecutarlo; no se documentan cifras para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: por tamaño (16,6 M de parámetros y 64,5 B FLOPs), es previsible que quepa en GPU de consumo con al menos 4 GB de VRAM, aunque el fabricante no publica requisitos oficiales.
- Opciones de despliegue: el modelo se distribuye para la librería Ultralytics (`pip install ultralytics huggingface_hub`), por lo que el despliegue natural es mediante la API de Ultralytics en Python. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, ONNX o TensorRT.
- Latencia y throughput: no disponibles.
- Nota: el repositorio declara un tamaño de 0,0 GB, por lo que no puede confirmarse que los pesos estén efectivamente publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mAP@50 en UAVDT (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dronefreak/uavdt-yolov10m | 16,6 M | 640 px | 30,12 | AGPL-3.0 | HuggingFace (0 descargas, repo de 0,0 GB) |
| YOLOv26s (zoo UAVDT) | No disponible | No disponible | 32,98 | No disponible en la información | Evaluado en DetectionBench |
| RF-DETR Nano (zoo UAVDT) | No disponible | No disponible | 32,78 | No disponible en la información | Evaluado en DetectionBench |
| RF-DETR Small (zoo UAVDT) | No disponible | No disponible | 32,62 | No disponible en la información | Evaluado en DetectionBench |
| YOLOv9s (zoo UAVDT) | No disponible | No disponible | 31,82 | No disponible en la información | Evaluado en DetectionBench |
| YOLOv8m (zoo UAVDT) | No disponible | No disponible | 31,42 | No disponible en la información | Evaluado en DetectionBench |

Dentro del zoo publicado por el propio autor, este checkpoint ocupa la sexta posición por mAP@50 de catorce modelos, por delante de todas las variantes nano y de YOLOv10s, y por detrás de YOLOv26s, los dos RF-DETR y YOLOv9s. Destaca que los RF-DETR Nano y Small logran valores de precisión y recall muy superiores (73,6-73,83 % y 66,98-71,63 % respectivamente) con mAP@50 comparable o mejor, lo que sugiere un perfil de errores distinto.

## Limitaciones y advertencias

- Rendimiento global modesto: mAP@50 de 30,12 % y mAP@50-95 de 17,33 % sobre el test de UAVDT, muy por debajo de lo habitual en detectores de propósito general sobre imágenes naturales.
- Fuerte desequilibrio entre clases: `car` alcanza 71,18 % de mAP@50, mientras que `truck` se queda en 6,82 % y `bus` en 12,37 %. El modelo es en la práctica poco fiable para vehículos pesados, que son justamente las clases minoritarias del dataset.
- Métricas no verificadas: los resultados del model-index figuran con `verified: false`; proceden del propio autor y no han sido reproducidos de forma independiente.
- Dominio restringido: entrenado sobre imágenes aéreas de UAVDT, su comportamiento fuera de ese dominio (cámaras fijas, ángulos a nivel de calle, otras condiciones de iluminación o geografía) no está caracterizado.
- Sin información sobre sesgos: no se documenta el origen geográfico, las condiciones meteorológicas ni la distribución de escenas del conjunto de entrenamiento, por lo que no pueden evaluarse sesgos sistemáticos.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a publicar el código fuente de las obras derivadas y de los servicios en red que lo utilicen, además de conservar los avisos de copyright. Conviene revisar las implicaciones antes de integrarlo en un producto propietario, especialmente porque el modelo base (Ultralytics YOLOv10) también es AGPL-3.0.
- Disponibilidad dudosa de los pesos: el repositorio indica 0,0 GB de tamaño, 0 descargas y 0 likes, lo que apunta a que los pesos pueden no estar subidos o no ser accesibles; verifíquese antes de planificar cualquier integración.
- Ausencia de información sobre formato y cuantización: no se documentan exportaciones a ONNX, TensorRT, CoreML, TFLite ni GGUF, ni pesos cuantizados, lo que limita el despliegue en *edge* sin trabajo adicional de conversión.
- Sin datos de latencia, throughput ni consumo: no puede dimensionarse un sistema de producción únicamente con la información publicada.
- Resultados de búsqueda web no relevantes: las consultas realizadas no devolvieron documentación técnica ni páginas relacionadas con este modelo, con DetectionBench o con UAVDT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolov10m
- Conjunto de datos UAVDT (HuggingFace): https://huggingface.co/datasets/dronefreak/UAVDT
- Modelo base: https://huggingface.co/Ultralytics/YOLOv10
- Repositorio DetectionBench (fuente de las métricas): https://github.com/dronefreak/DetectionBench
- Demostración en vídeo incluida en el repositorio: https://huggingface.co/dronefreak/uavdt-yolov10m/resolve/main/assets/demo_banner.mp4
- Referencias arXiv declaradas en los tags del repositorio (contenido no verificado en esta ficha): https://arxiv.org/abs/1804.00518, https://arxiv.org/abs/2405.14458, https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2410.17725, https://arxiv.org/abs/2606.03748, https://arxiv.org/abs/2402.13616
