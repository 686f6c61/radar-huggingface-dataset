# dronefreak/uavdt-yolo26n

## Resumen

uavdt-yolo26n es un detector de objetos YOLOv26n (variante nano) ajustado por el autor dronefreak sobre el conjunto de datos UAVDT, un benchmark de imágenes aéreas captadas por drones para detección de vehículos en entornos de tráfico. El modelo parte de los pesos Ultralytics/YOLO26 y se ha entrenado y evaluado dentro del marco DetectionBench, cuyo objetivo es comparar detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas.

El modelo resuelve una tarea acotada: localizar y clasificar tres clases de vehículos (car, truck y bus) en imágenes de dron. Con 2,6 millones de parámetros y 6,1 GFLOPs a 640 píxeles, es un detector de muy baja huella computacional, pensado para despliegue en el borde (drones, Jetson, cámaras IP) más que para máxima precisión.

Su relevancia es doble: por un lado, ofrece un punto de referencia reproducible sobre UAVDT; por otro, demuestra que la arquitectura más reciente de la familia YOLO puede ajustarse a dominios aéreos con recursos mínimos. Las métricas declaradas son modestas (mAP@50 de 28,88 % en el split de test) y el rendimiento está muy desequilibrado entre clases, con la clase car concentrando casi todo el acierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), detector de una etapa; variante nano (n) |
| Parametros totales | 2,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible en la model card; el framework Ultralytics permite exportar a ONNX, TensorRT, OpenVINO, TFLite y CoreML, pero el autor no documenta cuantizaciones concretas |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), cargado mediante Ultralytics |
| Framework | Ultralytics (`library_name: ultralytics`) |
| Tarea (pipeline) | object-detection |
| Dataset de entrenamiento | dronefreak/UAVDT (clases: car, truck, bus) |
| Modelo base | Ultralytics/YOLO26 (YOLOv26n) |
| FLOPs | 6,1 G (a 640 px) |
| Fecha indicada de creacion | 2026-09-20 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un detector de objetos de una sola etapa basado en la arquitectura YOLO26 de Ultralytics, en su variante nano, con 2,6 millones de parámetros y 6,1 GFLOPs a una resolución de entrada de 640 píxeles. No es un modelo de lenguaje ni un transformer generativo: no hay mecanismo de atención de contexto, ni decodificación especulativa, ni fases de RLHF o DPO. El objeto del ajuste es puramente la cabeza de detección sobre un dominio concreto.

El ajuste fino se realizó sobre UAVDT, un benchmark de vídeo e imagen aérea capturado con drones para detección de vehículos en tráfico. La model card indica que el entrenamiento y la evaluación se llevaron a cabo dentro del marco DetectionBench, con recetas de entrenamiento y métricas comunes a todos los modelos del zoo, lo que hace comparables los resultados entre arquitecturas. No se especifican en la información disponible el número de épocas, el esquema de aumentos, la resolución de entrenamiento ni el desglose exacto del split utilizado.

## Capacidades

- Detección de objetos en imágenes aéreas (una etapa, salida de cajas y clases).
- Clasificación en tres categorías: car, truck y bus.
- Optimizado para objetos pequeños y vistas aéreas (tags `small-object-detection`, `aerial-imagery`, `uav`).
- Orientado a vídeo de dron y vigilancia de tráfico (`drone`, `uav`, `traffic-surveillance`).
- Inferencia en resolución 640 px con huella de cómputo muy reducida (6,1 GFLOPs).
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingües: esas capacidades no aplican a un detector de objetos.

## Casos de uso

- Vigilancia de tráfico aéreo: el modelo puede procesar fotogramas sucesivos de un dron para localizar vehículos sobre calzada y generar conteos de flujo por carril; las clases car, truck y bus cubren los tipos básicos de esa tarea.
- Monitorización de aparcamiento en exteriores: detección de vehículos estacionados en imágenes cenitales o en perspectiva oblicua tomadas desde dron, con 6,1 GFLOPs por fotograma, lo que permite procesar vídeo en tiempo real en hardware embebido.
- Análisis posterior de vuelos (post-flight analytics): ejecución offline sobre el vídeo grabado por un dron para extraer trayectorias de vehículos y reconstruir matrices origen-destino.
- Despliegue en el borde sobre drones: con 2,6 M de parámetros, es viable su integración en plataformas tipo Jetson o SoC embebidos para detección a bordo sin enlace de datos a tierra.
- Prototipado y referencia en investigación: sirve como línea base reproducible sobre UAVDT dentro de DetectionBench para comparar arquitecturas bajo la misma receta de entrenamiento.
- Sistemas de alerta en infraestructuras viarias: detección de presencia de vehículos pesados (bus, truck) en zonas restringidas, siempre que se acepten los bajos valores de mAP para esas dos clases.
- Anotación asistida: pre-etiquetado de nuevos conjuntos de imágenes aéreas para acelerar el etiquetado humano, con revisión posterior obligatoria por el bajo recall.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de UAVDT, marcados como no verificados (`verified: false`) en el model-index. Fuente: DetectionBench.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 28,88 |
| mAP@50-95 | 16,79 |
| Precision | 33,14 |
| Recall | 35,66 |
| F1 | 34,36 |

Comparativa dentro del zoo de UAVDT del propio proyecto (mismos protocolos de evaluación):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Nano | 32,78 | 20,31 | 73,60 | 66,98 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| YOLOv26n (este modelo) | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv11n | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

Rendimiento por clase (UAVDT, test):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 70,95 | 39,58 |
| truck | 4,58 | 2,85 |
| bus | 11,11 | 7,96 |

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32, aproximadamente 10,4 MB (2,6 M de parámetros × 4 bytes); en FP16, en torno a 5,2 MB. Son estimaciones aritméticas a partir del número de parámetros, no datos publicados por el autor.
- Memoria adicional de activaciones: depende de la resolución de entrada y del tamaño de lote. A 640 px y lote 1 el consumo total es del orden de cientos de megabytes, muy por debajo de cualquier GPU moderna. No se publican mediciones reales.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo es apto para GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin que estas últimas aporten ventaja práctica por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual, y también en iGPU y en CPU. Es adecuado para dispositivos embebidos tipo NVIDIA Jetson (Nano, Orin) y para aceleradores de borde.
- Opciones de despliegue: la model card documenta la carga mediante `ultralytics` y `huggingface_hub` en Python. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos. Sí son plausibles las exportaciones nativas de Ultralytics (ONNX, TensorRT, OpenVINO, TFLite, CoreML), aunque el autor no las detalla.
- Latencia y throughput: no disponibles. No se publican mediciones de FPS ni de latencia en la información proporcionada.

## Comparativa con modelos similares

Modelos comparables del mismo zoo de UAVDT, evaluados con el mismo pipeline de DetectionBench:

| Modelo | Parametros | mAP@50 | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv26n (este modelo) | 2,6 M | 28,88 | 16,79 | AGPL-3.0 | HuggingFace (0 descargas) |
| RF-DETR Nano | no disponible | 32,78 | 20,31 | no disponible | integrado en DetectionBench |
| YOLOv9s | no disponible | 31,82 | 18,71 | no disponible | integrado en DetectionBench |
| YOLOv9t | no disponible | 29,42 | 17,03 | no disponible | integrado en DetectionBench |
| YOLOv11n | no disponible | 28,56 | 16,30 | AGPL-3.0 (familia Ultralytics) | integrado en DetectionBench |
| YOLOv8n | no disponible | 27,80 | 15,34 | AGPL-3.0 (familia Ultralytics) | integrado en DetectionBench |

El modelo se sitúa por delante de YOLOv11n, YOLOv8n, YOLOv10n y YOLOv8s en mAP@50 sobre UAVDT, y por detrás de YOLOv9t, YOLOv9s y RF-DETR Nano. Destaca el caso de RF-DETR Nano, que obtiene mejores métricas de mAP y, sobre todo, una precisión y un recall muy superiores (73,60 % y 66,98 % frente a 33,14 % y 35,66 %). La información de licencia y parámetros de los modelos competidores no está disponible en los datos proporcionados.

## Limitaciones y advertencias

- Rendimiento muy desequilibrado por clase: la clase car alcanza 70,95 % de mAP@50, mientras que truck (4,58 %) y bus (11,11 %) son prácticamente inutilizables sin reentrenamiento o ajuste adicional.
- Precisión y recall globales bajos (33,14 % y 35,66 %), lo que implica una proporción elevada de falsos positivos y falsos negativos en producción.
- Métricas autodeclaradas y marcadas como no verificadas (`verified: false`) en el model-index; no han sido replicadas de forma independiente.
- Sesgos de dominio: el modelo está ajustado exclusivamente a UAVDT (tráfico aéreo diurno sobre carretera). Se desconoce su comportamiento en otras condiciones de iluminación, clima, altitud, ángulo de cámara o geografía.
- Cobertura de clases limitada a tres categorías (car, truck, bus). No detecta peatones, motocicletas, bicicletas ni otros objetos relevantes en escenas de tráfico.
- Sin información sobre idiomas ni texto: cualquier expectativa de uso conversacional o multilingüe es inaplicable.
- Uso comercial restringido por licencia AGPL-3.0: es una licencia copyleft que obliga a liberar el código fuente de las obras derivadas y, en el caso de uso como servicio en red, también el código del servicio. Para productos propietarios puede requerir una licencia comercial de Ultralytics.
- No hay evidencia de adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de terceros.
- El repositorio figura con un tamaño de 0,0 GB, por lo que la disponibilidad efectiva de los pesos y de los recursos gráficos de la model card no puede confirmarse con los datos proporcionados.
- Alucinación no aplica en el sentido generativo, pero sí existe riesgo de detecciones espurias (falsos positivos) con confianza baja, especialmente en objetos pequeños o parcialmente ocluidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolo26n
- Dataset UAVDT: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Paper referenciado (arXiv:1804.00518): https://arxiv.org/abs/1804.00518
- Paper referenciado (arXiv:2606.03748): https://arxiv.org/abs/2606.03748
- Paper referenciado (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
- Paper referenciado (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
- Paper referenciado (arXiv:2405.14458): https://arxiv.org/abs/2405.14458
- Paper referenciado (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
- Paper referenciado (arXiv:2402.13616): https://arxiv.org/abs/2402.13616
- La búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a páginas generales de YouTube y no guardan relación con el modelo.
