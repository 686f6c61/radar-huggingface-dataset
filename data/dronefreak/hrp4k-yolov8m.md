# dronefreak/hrp4k-yolov8m

## Resumen

El modelo `dronefreak/hrp4k-yolov8m` es un detector de objetos YOLOv8m afinado por el usuario dronefreak sobre el conjunto de datos HRP4K, un benchmark de imágenes de alta resolución para la detección de baches y daños en la calzada. Se trata de un fine-tuning de `Ultralytics/YOLOv8`, con 25.890.019 parámetros totales y una única clase de detección: `pothole` (bache). El modelo se ha entrenado y evaluado dentro del marco DetectionBench, un proyecto que busca reproducir recetas de entrenamiento y métricas de evaluación idénticas entre distintos detectores modernos.

Su relevancia es doble. Por un lado, aborda un problema de infraestructura civil concreto: la inspección automatizada del firme de carreteras y vías urbanas a partir de imágenes de alta resolución, donde los baches ocupan una fracción pequeña del píxel y exigen detectores con buena capacidad de localización de objetos pequeños. Por otro, su publicación dentro de DetectionBench lo convierte en una pieza de referencia para comparar familias de detectores (YOLOv8, YOLO26, RF-DETR) bajo condiciones controladas, algo poco habitual en el ecosistema de modelos de detección publicados en Hugging Face.

El modelo se distribuye con licencia AGPL-3.0, en formato de pesos PyTorch (`.pt`) compatible con la librería Ultralytics, y con un tamaño de repositorio de 0,1 GB. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que emite cajas delimitadoras y puntuaciones de confianza sobre imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (detector de una etapa, familia YOLO, CNN con cuello PAN-FPN y cabeza desacoplada) |
| Parametros totales | 25.890.019 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, 1536 px durante entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un modelo Ultralytics es exportable a ONNX, TensorRT y otros formatos, pero no se confirma en la información) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, archivo `best.pt`); safetensors declarado en los tags del repositorio |
| Tarea | Detección de objetos (object-detection) |
| Clases | 1 (`pothole`) |
| Framework / librería | Ultralytics |
| FLOPs | 78,9 G (a 640 px) |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | Ultralytics/YOLOv8 |

## Arquitectura y entrenamiento

El modelo parte de YOLOv8m, un detector de una sola etapa de la familia YOLO mantenida por Ultralytics. La variante "m" (medium) emplea una red troncal convolucional con bloques C2f, un cuello de tipo PAN-FPN para la fusión multiescala y una cabeza de detección desacoplada que predice, por separado, la clasificación y la regresión de cajas. Con 25,9 millones de parámetros y 78,9 GFLOPs a 640 px, se sitúa en el punto medio de la familia YOLOv8 en cuanto a coste computacional.

El entrenamiento se realizó con el toolkit DetectionBench sobre el dataset HRP4K, con una configuración documentada por el autor: 150 épocas configuradas como máximo, de las cuales se completaron 87 por parada temprana con paciencia de 30; tamaño de imagen de 1536 px; optimizador AdamW con tasa de aprendizaje inicial de 0,001; batch automático (Ultralytics AutoBatch) y semilla 0. El uso de 1536 px de resolución de entrada es coherente con el objetivo del dataset: preservar la señal visual de baches pequeños en imágenes de alta resolución. No se documenta en la información disponible el número de tokens de entrenamiento (no aplica), la composición exacta del dataset ni si hubo aumento de datos más allá de los valores por defecto de Ultralytics.

La innovación principal no está en la arquitectura, que es la estándar de YOLOv8m, sino en el marco de evaluación: DetectionBench aplica recetas de entrenamiento y métricas idénticas a todos los detectores comparados, lo que permite una comparación justa entre YOLOv8, YOLO26 y RF-DETR sobre el mismo conjunto de datos.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica una única clase, `pothole` (bache), emitiendo cajas delimitadoras con puntuación de confianza.
- Detección de objetos pequeños en imágenes de alta resolución, gracias al entrenamiento a 1536 px.
- Inferencia sobre imágenes individuales o por lotes mediante la API de Ultralytics (`model.predict`).
- Exportación a otros formatos de despliegue a través del ecosistema Ultralytics (no confirmado explícitamente por el autor en la información disponible).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingües, de generación de texto, de código, de matemáticas, de visión general (VQA) ni de audio.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Inspección automatizada de firmes: el modelo se integra en un pipeline que recibe imágenes de cámaras vehiculares o de drones y devuelve cajas de baches con confianza, permitiendo priorizar reparaciones en función de la densidad y gravedad detectada.
- Mantenimiento predictivo de infraestructura viaria: procesando lotes periódicos de imágenes georreferenciadas, el modelo genera un inventario de baches que alimenta sistemas de gestión de activos (por ejemplo, para ayuntamientos o concesionarias de autopistas).
- Procesamiento de imágenes de alta resolución: al haberse entrenado a 1536 px, es adecuado para ortofotos, imágenes de dron y capturas de cámaras de alta definición donde el bache ocupa una región pequeña del encuadre.
- Benchmarking de detectores: sirve como referencia reproducible dentro de DetectionBench para comparar YOLOv8m con YOLO26m/s, YOLOv8n/s y RF-DETR Nano/Small/Medium bajo la misma receta y métricas.
- Preetiquetado para anotación humana: el modelo puede generar propuestas de cajas que un anotador revisa, reduciendo el coste de construir nuevos datasets de daños en la calzada.
- Despliegue en vehículos o unidades móviles de inspección: con 25,9 M de parámetros y 78,9 GFLOPs, es viable en GPUs de gama media o en hardware embebido con la exportación adecuada, aunque el autor no documenta latencias concretas.
- Filtrado previo en sistemas de alerta temprana: combinado con un clasificador posterior, puede descartar imágenes sin baches antes de un análisis más costoso.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de HRP4K, evaluados con el pipeline estándar de DetectionBench (`detectionbench-evaluate`). Ninguno de los valores está verificado de forma independiente (`verified: false`).

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 47,26 |
| mAP@50-95 | 26,77 |
| Precision | 59,56 |
| Recall | 44,52 |
| F1 Score | 50,95 |

Comparativa dentro del "HRP4K Model Zoo" publicado por el autor (mismos datos y pipeline de evaluación):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 56,04 | 31,54 | 62,01 | 55,48 |
| RF-DETR Medium | 55,66 | 31,81 | 64,25 | 51,90 |
| RF-DETR Nano | 52,06 | 28,62 | 62,03 | 47,88 |
| YOLO26m | 51,62 | 29,83 | 57,33 | 49,89 |
| YOLO26s | 48,65 | 27,16 | 60,04 | 46,91 |
| YOLOv8n | 48,58 | 26,24 | 58,00 | 46,58 |
| YOLOv8s | 47,59 | 26,71 | 59,81 | 44,30 |
| **YOLOv8m (este modelo)** | **47,26** | **26,77** | **59,56** | **44,52** |

Rendimiento por clase: la única clase, `pothole`, obtiene exactamente los valores globales (mAP@50 47,26; mAP@50-95 26,77).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa de la familia YOLOv8m, con 25,9 M de parámetros en FP32 los pesos ocupan aproximadamente 100 MB, por lo que la VRAM necesaria la determina sobre todo la resolución de entrada y el tamaño de lote, no los pesos.
- GPU recomendadas: no especificadas por el autor. Por tamaño de modelo, es desplegable en GPUs de consumo (RTX 3060/4060 en adelante) y en GPUs de datacenter (A100, H100) para procesamiento por lotes a alta resolución.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6-8 GB de VRAM o más, aunque el autor no publica requisitos mínimos ni mediciones.
- Opciones de despliegue: Ultralytics (PyTorch) es el soporte documentado. El ecosistema Ultralytics permite exportar a ONNX, TensorRT, OpenVINO y otros formatos, pero el autor no confirma estas exportaciones en la información disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación con alternativas de la misma categoría (detección de objetos de una etapa, tamaño medio) y con los modelos del propio zoo de HRP4K:

| Modelo | Parámetros | Contexto / entrada | mAP@50 (HRP4K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8m (este modelo) | 25,9 M | imagen, entrenado a 1536 px | 47,26 | AGPL-3.0 | Hugging Face (`dronefreak/hrp4k-yolov8m`) |
| YOLOv8s | no disponible en la información | imagen | 47,59 | AGPL-3.0 (familia Ultralytics) | Hugging Face / Ultralytics |
| YOLO26m | no disponible en la información | imagen | 51,62 | no disponible en la información | Hugging Face / Ultralytics |
| RF-DETR Small | no disponible en la información | imagen | 56,04 | no disponible en la información | Hugging Face / Roboflow |

Observaciones: en HRP4K, YOLOv8m queda ligeramente por debajo de YOLOv8s en mAP@50 (47,26 frente a 47,59) y por encima en mAP@50-95 (26,77 frente a 26,71), lo que sugiere que el modelo más pequeño generaliza igual o mejor en este dataset concreto. Los modelos RF-DETR superan a toda la familia YOLO evaluada en mAP@50 y mAP@50-95. No se dispone de datos de parámetros ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de una sola clase: solo detecta `pothole`; no reconoce grietas, baches rellenos, señalización ni otros tipos de daño en la calzada.
- Rendimiento moderado: mAP@50 de 47,26 % y recall de 44,52 % implican que más de la mitad de los baches anotados en el test no se recuperan al umbral de evaluación; en producción esto se traduce en falsos negativos frecuentes.
- Precisión de 59,56 %: aproximadamente cuatro de cada diez detecciones positivas son falsos positivos al umbral de evaluación, lo que exige revisión humana o un clasificador de segunda etapa.
- Métricas no verificadas: los valores del model-index están marcados como `verified: false`; no hay evaluación independiente publicada.
- Sesgo de dominio: entrenado exclusivamente con HRP4K; el rendimiento puede degradarse en condiciones de iluminación, climatología, tipo de asfalto o sensores distintos de los del dataset.
- Sin datos de sesgo demográfico ni de equidad: al ser un modelo de visión sobre infraestructura, no aplican sesgos lingüísticos, pero no se documenta la distribución geográfica del dataset ni su representatividad.
- Riesgo de alucinación en sentido estricto no aplica; el riesgo equivalente es la detección espuria (falsos positivos) y la omisión (falsos negativos).
- Licencia AGPL-3.0: el uso comercial es posible, pero obliga a liberar el código fuente de las obras derivadas que se distribuyan o se ofrezcan como servicio en red; conviene revisar la compatibilidad con el producto antes de integrarlo. La familia Ultralytics YOLOv8 también está sujeta a AGPL-3.0.
- Entrenamiento incompleto respecto a la configuración: 87 épocas de 150 configuradas por parada temprana; no se documenta si se probaron otras semillas o configuraciones.
- Sin soporte documentado de cuantización ni de exportación a formatos de despliegue alternativos por parte del autor.
- Repositorio con muy baja adopción (17 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/hrp4k-yolov8m
- Dataset HRP4K: https://huggingface.co/datasets/dronefreak/HRP4K
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base YOLOv8 (Ultralytics): https://huggingface.co/Ultralytics/YOLOv8
- Documentación de Ultralytics: https://docs.ultralytics.com
