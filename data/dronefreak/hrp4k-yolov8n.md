# dronefreak/hrp4k-yolov8n

## Resumen

El modelo `dronefreak/hrp4k-yolov8n` es un detector de objetos YOLOv8n (la variante nano de Ultralytics) afinado por el usuario dronefreak sobre el conjunto de datos HRP4K, un benchmark de imágenes de carretera en alta resolución orientado a la detección de baches y daños en la infraestructura viaria. Se distribuye a través de Hugging Face con la librería Ultralytics y forma parte del proyecto DetectionBench, un marco de evaluación reproducible que aplica recetas de entrenamiento y métricas idénticas a distintos detectores sobre varios conjuntos de datos reales.

El modelo resuelve una tarea muy concreta: la detección de una única clase, `pothole`, en imágenes de hasta 1536 píxeles de lado. Con 3,02 millones de parámetros y 8,7 GFLOPs a 640 píxeles, está pensado para inferencia en tiempo real en entornos con recursos limitados, como vehículos, drones o dispositivos de inspección embarcados. Su relevancia actual radica en que ofrece una línea base reproducible y ligera dentro del ecosistema DetectionBench, lo que facilita comparaciones honestas frente a alternativas como RF-DETR o la familia YOLO26.

La ficha se basa exclusivamente en la información publicada por el autor en la model card y en el model-index del repositorio. No se dispone de información sobre idiomas (el modelo no procesa texto) ni de detalles sobre la composición interna del dataset HRP4K más allá de lo indicado en su propia dataset card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (CNN de detección de una etapa, familia Ultralytics YOLO) |
| Parametros totales | 3.021.443 (3,02 M; la model card indica 3,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, tamaño de entrenamiento 1536 px) |
| Tipos de cuantizacion | no disponible (pesos en `best.pt`; no se documentan variantes GGUF, ONNX ni TensorRT) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), cargable con Ultralytics; el repo incluye también `safetensors` como tag |

## Arquitectura y entrenamiento

Se trata de un fine-tuning del detector YOLOv8n de Ultralytics, una red convolucional de una sola etapa con cabeza de detección anclada libre (anchor-free) y asignación dinámica de etiquetas. El modelo base se ha reentrenado sobre HRP4K con el toolkit DetectionBench, que estandariza la receta para permitir comparaciones justas entre detectores. La configuración documentada incluye un máximo de 150 épocas con parada temprana de paciencia 30 (se completaron 86 épocas), tamaño de imagen de 1536 píxeles, optimizador AdamW con tasa de aprendizaje inicial de 0,001, batch automático (Ultralytics AutoBatch) y semilla fija 0.

No se documentan en la información disponible detalles sobre el volumen de tokens o imágenes de entrenamiento, la composición exacta del dataset HRP4K, ni si se aplicaron técnicas de aumento de datos específicas más allá de las estándar de Ultralytics. Tampoco se indica el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector visual. La innovación técnica destacable es el propio marco DetectionBench, que impone una receta y una métrica comunes (`detectionbench-evaluate`) para que los resultados entre modelos sean comparables; el modelo en sí no introduce modificaciones arquitectónicas sobre YOLOv8n.

## Capacidades

- Detección de objetos de una sola clase: `pothole` (baches en calzada).
- Procesamiento de imágenes de alta resolución (entrenado a 1536 px), orientado a la detección de objetos pequeños en escenas viales.
- Inferencia en tiempo real gracias a su reducido coste computacional (8,7 GFLOPs a 640 px, 3,02 M de parámetros).
- Integración nativa con la librería Ultralytics: carga mediante `YOLO(weights)`, predicción con `model.predict()`, visualización con `results[0].show()`.
- Soporte de umbral de confianza configurable (`conf`) en la inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de detección.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la detección sobre imagen.

## Casos de uso

- Inspección automatizada de carreteras: el modelo se integra en vehículos equipados con cámara para detectar baches en tiempo real durante rondas de mantenimiento, aprovechando su bajo coste (8,7 GFLOPs) para ejecutarse en hardware embarcado.
- Procesamiento por lotes de imágenes de alta resolución: al haberse entrenado a 1536 px, es adecuado para analizar ortomosaicos o capturas de dron y localizar daños en el firme con detección de objetos pequeños.
- Priorización de reparaciones municipales: se puede desplegar sobre un repositorio de imágenes georreferenciadas para generar un inventario de baches y priorizar intervenciones según la densidad detectada.
- Monitorización continua con drones: integrado en la carga útil de un dron, permite revisar tramos de carretera de forma periódica y comparar la evolución del deterioro entre vuelos.
- Línea base para investigación en detección de daños viales: sirve como referencia reproducible dentro de DetectionBench para comparar nuevos detectores (RF-DETR, YOLO26) bajo la misma receta y métricas.
- Filtrado previo en pipelines de anotación: el modelo puede preetiquetar imágenes de baches para que anotadores humanos revisen y corrijan, reduciendo el coste de construir nuevos datasets.
- Prototipado rápido en dispositivos de borde: su tamaño de 3,02 M de parámetros permite desplegarlo en GPUs de gama baja o incluso en CPU para pruebas de concepto de sistemas de alerta temprana.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de HRP4K, evaluados con el pipeline estándar de DetectionBench (`detectionbench-evaluate`). Las métricas del model-index figuran como no verificadas (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 48,58 |
| mAP@50-95 | 26,24 |
| Precision | 58,0 |
| Recall | 46,58 |
| F1 Score | 51,67 |

Comparativa dentro del HRP4K Model Zoo publicada en la model card:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 56,04 | 31,54 | 62,01 | 55,48 |
| RF-DETR Medium | 55,66 | 31,81 | 64,25 | 51,9 |
| RF-DETR Nano | 52,06 | 28,62 | 62,03 | 47,88 |
| YOLO26m | 51,62 | 29,83 | 57,33 | 49,89 |
| YOLO26s | 48,65 | 27,16 | 60,04 | 46,91 |
| **YOLOv8n** | **48,58** | **26,24** | **58,0** | **46,58** |
| YOLOv8s | 47,59 | 26,71 | 59,81 | 44,3 |
| YOLOv8m | 47,26 | 26,77 | 59,56 | 44,52 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,02 M de parámetros y 8,7 GFLOPs a 640 px, el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM, incluso procesando imágenes a 1536 px.
- GPU recomendadas: no se documentan requisitos oficiales. Por tamaño, funciona en RTX 4090, RTX 3060, A100, H100 y GPUs integradas; también es viable en CPU para inferencia por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, RTX 3050 o superiores) e incluso en dispositivos embarcados tipo Jetson.
- Opciones de despliegue: Ultralytics (nativo, `best.pt`), y por extensión los formatos de exportación que soporta Ultralytics (ONNX, TensorRT, OpenVINO), aunque no se documentan en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con alternativas evaluadas bajo la misma receta en HRP4K (datos de la model card):

| Modelo | Parametros | Contexto / entrada | mAP@50 | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLOv8n (este modelo) | 3,02 M | Imagen 1536 px (entrenamiento) | 48,58 | 26,24 | AGPL-3.0 | Hugging Face (dronefreak) |
| YOLOv8s | no disponible | Imagen 1536 px (entrenamiento) | 47,59 | 26,71 | AGPL-3.0 (Ultralytics) | Hugging Face (dronefreak) |
| YOLOv8m | no disponible | Imagen 1536 px (entrenamiento) | 47,26 | 26,77 | AGPL-3.0 (Ultralytics) | Hugging Face (dronefreak) |
| YOLO26s | no disponible | Imagen 1536 px (entrenamiento) | 48,65 | 27,16 | no disponible | Hugging Face (dronefreak) |
| RF-DETR Nano | no disponible | Imagen 1536 px (entrenamiento) | 52,06 | 28,62 | no disponible | Hugging Face (dronefreak) |

Resulta llamativo que la variante nano supere en mAP@50 a las variantes small y medium de YOLOv8 bajo esta receta concreta, lo que sugiere que el tamaño del modelo no es el factor dominante en este dataset y que la receta de entrenamiento y el ajuste de hiperparámetros pesan más. Los RF-DETR, de arquitectura transformer, obtienen los mejores resultados del zoo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse únicamente sobre HRP4K, el modelo puede generalizar mal a condiciones de iluminación, climatología, tipos de asfalto o regiones geográficas no representadas en el dataset.
- Riesgo de alucinación: como todo detector, puede producir falsos positivos (detecciones espurias de baches) y falsos negativos, especialmente con un recall del 46,58 %, que implica que más de la mitad de los baches reales podrían no detectarse en el split de test.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto textual; el modelo solo procesa imágenes y detecta una única clase (`pothole`). No reconoce otros tipos de daño viario (grietas, socavones, señalización) salvo que se reentrene.
- Restricciones de licencia: AGPL-3.0 impone obligaciones copyleft fuertes; el uso comercial en productos o servicios en red puede requerir la liberación del código fuente derivado. Es necesario revisar las condiciones con detalle antes de integrarlo en producción.
- Caveats para producción: las métricas del model-index están marcadas como no verificadas; el rendimiento real puede diferir. No se documentan procesos de cuantización, exportación a TensorRT/ONNX ni pruebas de latencia, por lo que el despliegue en producción requiere validación propia. El repositorio tiene un tamaño de 0,0 GB y solo 15 descargas, lo que indica una adopción muy baja y escasa validación comunitaria.
- El modelo se entrenó con parada temprana a las 86 épocas de 150 configuradas, lo que puede indicar margen de mejora con ajustes de hiperparámetros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/hrp4k-yolov8n
- Dataset HRP4K: https://huggingface.co/datasets/dronefreak/HRP4K
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- Documentación de Ultralytics: https://docs.ultralytics.com/
