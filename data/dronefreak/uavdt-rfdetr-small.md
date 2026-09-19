# dronefreak/uavdt-rfdetr-small

## Resumen

uavdt-rfdetr-small es un detector de objetos de la familia RF-DETR (Detection Transformer) afinado por el usuario dronefreak sobre el conjunto de datos UAVDT, un benchmark de imágenes aéreas captadas con drones para detección y seguimiento de vehículos. El modelo parte del checkpoint Roboflow/rf-detr-small y se distribuye a través de Hugging Face bajo la librería rfdetr, con licencia Apache-2.0 y un tamaño de repositorio de 0,1 GB.

El modelo resuelve una tarea muy concreta: localizar y clasificar tres clases de vehículos (car, truck y bus) en imágenes aéreas de tráfico. Su relevancia actual es doble. Por un lado, forma parte de DetectionBench, un framework que entrena y evalúa detectores modernos con recetas idénticas para permitir comparaciones reproducibles; este checkpoint es la entrada de RF-DETR Small en ese zoo de modelos. Por otro, su tamaño reducido (32,1 millones de parámetros) lo hace candidato a despliegue en hardware de borde embarcado en drones.

Conviene ser claro desde el principio: los resultados publicados son modestos en términos absolutos (mAP@50 de 14,89 sobre el split de test de UAVDT, con 38,83 de precisión y 61,65 de recall) y las métricas figuran marcadas como no verificadas en el model-index. El valor del modelo reside, por tanto, en su papel como referencia reproducible dentro de un benchmark comparativo, más que en un rendimiento de producción alto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección (familia DETR), según la librería rfdetr. Detalles concretos del backbone no disponibles en la información proporcionada |
| Parametros totales | 32,1 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión). Resolución de entrada no disponible en la información proporcionada |
| Tipos de cuantizacion | No disponibles (no declarados por el autor; los pesos se distribuyen en PyTorch) |
| Idiomas soportados | No aplica (modelo de visión, sin componente de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (repositorio de 0,1 GB, librería rfdetr); no se declaran GGUF, ONNX ni safetensors de forma explícita |
| Tarea | Object detection (object-detection pipeline) |
| Clases | car, truck, bus |
| Modelo base | Roboflow/rf-detr-small (finetune) |
| Dataset de entrenamiento y evaluación | dronefreak/UAVDT (UAVDT) |
| FLOPs | No publicados upstream |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del checkpoint Roboflow/rf-detr-small, un detector de la familia DETR que formula la detección como un problema de predicción de conjuntos de extremo a extremo, sin anclas ni supresión de no máximos en el postprocesado clásico de los detectores YOLO. La información proporcionada no detalla el backbone visual, el número de capas ni la resolución de entrada; las etiquetas del repositorio incluyen la referencia arXiv 2304.07193 (DINOv2), lo que apunta a un backbone de tipo vision transformer preentrenado, pero este extremo no se confirma en la model card.

El entrenamiento se realizó sobre el conjunto UAVDT dentro del framework DetectionBench, cuyo objetivo explícito es aplicar recetas de entrenamiento idénticas y métricas de evaluación idénticas a varios detectores modernos sobre múltiples conjuntos de datos reales, de modo que las comparaciones entre arquitecturas sean reproducibles. No se especifican en la información disponible el número de tokens o imágenes vistas, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en detección de objetos). La evaluación se llevó a cabo con las métricas de detección de la librería Supervision de Roboflow, que reporta mAP, precisión y recall, pero no genera curvas PR, curvas F1 ni matrices de confusión como el validador de Ultralytics. La inferencia y evaluación se declaran sobre el split de test de UAVDT mediante el comando `detectionbench-evaluate`.

## Capacidades

- Detección de objetos en imágenes aéreas captadas por drones (UAV), con localización mediante cajas delimitadoras.
- Clasificación en tres categorías de vehículos: car, truck y bus.
- Detección de objetos pequeños en escenas aéreas (small-object-detection), escenario declarado explícitamente en las etiquetas del repositorio.
- Aplicable a imágenes de vídeo aéreo, como demuestra el banner de demostración con clips del split de test de UAVDT.
- Integración como componente de un pipeline de benchmarking reproducible a través de DetectionBench.
- Compatible con las métricas de evaluación de la librería Supervision.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.
- No se declaran capacidades multimodales (visión-lenguaje), audio ni modo de razonamiento.

## Casos de uso

- Vigilancia de tráfico mediante drones: el modelo puede procesar fotogramas aéreos y localizar vehículos en carretera, generando conteos y mapas de ocupación útiles para gestión de tráfico. Es adecuado por su especialización en el dominio UAVDT, aunque su mAP@50 de 14,89 exige validación previa en el escenario objetivo.
- Conteo y clasificación de vehículos por tipología: permite distinguir entre turismos, camiones y autobuses, lo que habilita estadísticas de composición del tráfico. La clase truck es el punto débil (mAP@50 de 4,01), por lo que este uso requiere revisión manual o umbrales ajustados.
- Análisis de congestión urbana: integrado en un pipeline que procese secuencias aéreas, el detector puede alimentar indicadores de densidad vehicular por tramo. Su recall relativamente alto (61,65) frente a una precisión baja (38,83) lo orienta a escenarios donde interesa no perder vehículos y se toleran falsos positivos.
- Inspección de infraestructuras viarias: sobrevolando autovías o aparcamientos, el modelo puede inventariar vehículos presentes en una zona concreta, por ejemplo para auditar ocupación de estacionamientos o detectar vehículos estacionados de forma irregular.
- Prototipado rápido en investigación académica: al estar integrado en DetectionBench y compartir receta con otros detectores, sirve como punto de partida reproducible para comparar arquitecturas sobre UAVDT sin reimplementar el pipeline de entrenamiento y evaluación.
- Despliegue en hardware de borde embarcado: con 32,1 M de parámetros y pesos del orden de decenas o centenas de megabytes, es viable ejecutarlo a bordo de un dron con una GPU integrada, siempre que se valide la latencia real en el equipo.
- Búsqueda y rescate asistida por UAV: el detector puede cribar grandes volúmenes de imágenes aéreas para localizar vehículos y concentrar la atención humana en las zonas con detecciones, actuando como filtro previo.
- Monitorización de accesos y vías rurales: en entornos con poca densidad de tráfico, la clase camión y autobús puede emplearse para detectar paso de vehículos pesados, con la advertencia de la baja precisión en esas clases.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el split de test de UAVDT (marcados como no verificados en el model-index):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 14,89 |
| mAP@50-95 | 8,92 |
| Precisión | 38,83 |
| Recall | 61,65 |
| F1 | 47,65 |
| Parámetros | 32,1 M |
| FLOPs | No publicados upstream |

Rendimiento por clase sobre UAVDT (test split):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 32,54 | 18,43 |
| truck | 4,01 | 2,56 |
| bus | 8,12 | 5,77 |

Zoo de modelos de UAVDT publicado por el autor (mismo pipeline de DetectionBench), útil como referencia comparativa:

| Modelo | mAP@50 | mAP@50-95 | Precisión | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 15,02 | 8,76 | 40,28 | 61,14 |
| RF-DETR Small (este modelo) | 14,89 | 8,92 | 38,83 | 61,65 |
| YOLOv26s | 14,09 | 7,91 | 23,88 | 27,05 |
| RF-DETR Nano | 12,96 | 7,33 | 37,12 | 55,4 |
| YOLOv26m | 12,32 | 6,66 | 19,44 | 25,83 |
| YOLOv8m | 12,28 | 7,05 | 19,73 | 25,33 |
| YOLOv11x | 11,98 | 6,68 | 18,7 | 25,93 |
| YOLOv8s | 11,48 | 6,71 | 19,34 | 23,39 |
| YOLOv8n | 10,79 | 6,42 | 18,61 | 24,58 |

## Requisitos de hardware

- Huella de pesos estimada: aproximadamente 128 MB en FP32 y 64 MB en FP16 para 32,1 M de parámetros; el repositorio completo ocupa 0,1 GB.
- VRAM estimada para inferencia: del orden de 1 a 2 GB en FP16 con lotes pequeños, sumando pesos, activaciones y buffers del framework. Cifra estimada a partir del tamaño del modelo; el autor no publica mediciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica. Para producción en servidor, una NVIDIA T4, L4, RTX 4090, A100 o H100 ofrecen margen de sobra. Para lotes grandes y vídeo en tiempo real, conviene priorizar GPUs con mayor ancho de banda.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, e incluso en plataformas integradas tipo Jetson Orin para despliegue a bordo de drones.
- Opciones de despliegue: la librería oficial rfdetr sobre PyTorch, con instalación mediante `pip install rfdetr huggingface_hub` y carga de pesos desde el Hub. La model card no documenta exportaciones a ONNX, TensorRT, OpenVINO ni formatos GGUF, ni integraciones con vLLM o TGI (no aplicables a un detector de objetos).
- Latencia y throughput: no disponibles. No se publican mediciones de FPS ni de tiempo de inferencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 (UAVDT) | mAP@50-95 (UAVDT) | Precisión | Recall | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| uavdt-rfdetr-small | 32,1 M | 14,89 | 8,92 | 38,83 | 61,65 | Apache-2.0 | Hugging Face |
| RF-DETR Medium (UAVDT) | No disponible | 15,02 | 8,76 | 40,28 | 61,14 | No disponible | Hugging Face (dronefreak) |
| RF-DETR Nano (UAVDT) | No disponible | 12,96 | 7,33 | 37,12 | 55,4 | No disponible | Hugging Face (dronefreak) |
| YOLOv26s (UAVDT) | No disponible | 14,09 | 7,91 | 23,88 | 27,05 | No disponible | Hugging Face (dronefreak) |
| YOLOv11x (UAVDT) | No disponible | 11,98 | 6,68 | 18,7 | 25,93 | No disponible | Hugging Face (dronefreak) |

Lectura de la comparativa: RF-DETR Medium obtiene una mAP@50 ligeramente superior (15,02 frente a 14,89) a costa de un modelo presumiblemente mayor, mientras que RF-DETR Small gana en mAP@50-95 (8,92 frente a 8,76) y en recall. Frente a las variantes de YOLO evaluadas con la misma receta, los modelos RF-DETR muestran precisiones y recalls notablemente más altos, aunque también mAP@50 en el mismo orden de magnitud. No se dispone del número de parámetros de los modelos comparados ni de detalles de licencia para las variantes YOLO.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: una mAP@50 de 14,89 y una mAP@50-95 de 8,92 sobre UAVDT indican que la localización precisa de objetos dista de ser fiable para aplicaciones críticas.
- Desequilibrio severo entre clases: la clase car alcanza 32,54 de mAP@50, mientras que truck se queda en 4,01 y bus en 8,12. El modelo es, en la práctica, casi exclusivamente útil para detectar turismos.
- Precisión baja (38,83) frente a recall relativamente alto (61,65): el detector tiende a producir falsos positivos. Cualquier uso en producción requiere un umbral de confianza ajustado y validación con datos propios.
- Métricas no verificadas: los cuatro valores del model-index figuran con `verified: false`, es decir, son resultados declarados por el autor sin validación independiente.
- Protocolo de evaluación particular: las métricas se calcularon con las utilidades de detección de Supervision, no con el validador de Ultralytics, y no se publican curvas PR, curvas F1 ni matrices de confusión. Esto dificulta la comparación directa con resultados publicados con otros validadores.
- Dominio muy restringido: el modelo está especializado en imágenes aéreas de UAVDT (tráfico aéreo diurno sobre carreteras). No hay garantía de generalización a otras altitudes, sensores, condiciones meteorológicas, iluminación nocturna o entornos urbanos densos.
- Sesgos geográficos y de dominio potenciales: no se documenta la procedencia geográfica de las imágenes de entrenamiento ni posibles sesgos de captura, por lo que no puede descartarse un sesgo hacia el tipo de escena de UAVDT.
- Sin información de cuantización ni de exportación a formatos de despliegue eficientes, lo que obliga a trabajar con PyTorch o a realizar conversiones propias y validarlas.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentación externa sobre su comportamiento.
- Licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial y modificación. No obstante, el dataset UAVDT tiene su propia licencia y condiciones, que deben revisarse por separado en su ficha antes de reutilizar datos o derivados.
- Modelo de nicho en fase temprana: creado y actualizado en septiembre de 2026, sin historial de mantenimiento ni versiones posteriores conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-rfdetr-small
- Dataset UAVDT en Hugging Face: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench (framework de entrenamiento y evaluación): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Roboflow/rf-detr-small
- Librería RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Librería Supervision (métricas de detección): https://github.com/roboflow/supervision
- Referencias arXiv declaradas en las etiquetas del repositorio: https://arxiv.org/abs/1804.00518, https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2410.17725, https://arxiv.org/abs/2606.03748
- Vídeo de demostración (detecciones sobre clips de test de UAVDT): https://huggingface.co/dronefreak/uavdt-rfdetr-small/resolve/main/assets/demo_banner.mp4
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de Hugging Face y de la model card.
