# dronefreak/kitti-yolo11x

## Resumen

kitti-yolo11x es un detector de objetos de la familia YOLO11, concretamente la variante extra-large (x) de Ultralytics, afinada por el usuario dronefreak sobre el conjunto de datos KITTI para detección en escenas de calle. Se trata de un modelo de visión por computador de una sola etapa, con 57,0 millones de parámetros y 196,0 GFLOPs a 640 píxeles de entrada, pensado para tareas de conducción autónoma y sistemas avanzados de asistencia al conductor (ADAS).

El modelo no introduce arquitectura nueva: es un ajuste fino supervisado de Ultralytics/YOLO11 sobre las 8 clases de KITTI (Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck y Van). Su relevancia es metodológica más que arquitectónica, ya que forma parte de DetectionBench, un marco de trabajo que entrena y evalúa detectores modernos con una receta de entrenamiento y una métrica de evaluación idénticas, lo que permite comparaciones reproducibles entre familias de modelos.

La publicación del checkpoint, del conjunto de datos derivado y del marco de evaluación busca transparencia: la model card incluye el zoo completo de modelos evaluados en KITTI y el desglose por clase, además de curvas PR, F1 y matrices de confusión. La licencia AGPL-3.0 es el principal condicionante para su uso en producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11 (detector de una etapa, red convolucional tipo YOLO con módulos C3k2 y atención C2PSA en la variante 11) |
| Parámetros totales | 57,0 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen, 640 px por defecto (196,0 GFLOPs medidos a esa resolución) |
| Tipos de cuantización | no disponible en la información proporcionada (la librería ultralytics permite exportar a FP16/INT8/ONNX/TensorRT/OpenVINO, pero el autor no lo documenta en esta ficha) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades lingüísticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | pesos PyTorch en formato ultralytics (.pt), según el campo library_name: ultralytics; el repositorio ocupa 0,1 GB |
| Tarea | object-detection |
| Clases | 8: Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck, Van |
| Modelo base | Ultralytics/YOLO11 (variante x), ajustado por fine-tuning |

## Arquitectura y entrenamiento

La arquitectura corresponde al diseño YOLO11x de Ultralytics: un detector denso de una sola etapa con backbone convolucional, cuello de agregación de características y cabezas de detección ancladas a múltiples escalas. Con 57,0 M de parámetros y 196,0 GFLOPs a 640 px, es la variante más grande de la familia YOLO11 y está orientada a maximizar precisión a costa de latencia frente a las variantes n, s y m.

El modelo se ha obtenido por ajuste fino supervisado desde los pesos preentrenados de Ultralytics/YOLO11 sobre el conjunto KITTI, en el marco del proyecto DetectionBench. La model card no detalla el número de tokens o imágenes de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de alineación posteriores (RLHF/DPO no aplican en detección). Sí especifica que la evaluación se realiza sobre el split de validación de KITTI con la canalización estándar de DetectionBench (`detectionbench-evaluate`), lo que unifica la métrica entre todos los modelos comparados. No se documenta ninguna innovación técnica propia más allá de la receta de entrenamiento estandarizada del framework.

## Capacidades

- Detección de objetos en imágenes de escenas de calle en tiempo real, con salida de cajas delimitadoras y clases.
- Reconocimiento de 8 categorías específicas del dominio de conducción: Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck y Van.
- Funcionamiento como extractor de cajas para tareas posteriores: conteo, seguimiento multiobjeto, estimación de densidad de tráfico o preetiquetado de datos.
- Integración nativa con la librería `ultralytics` (carga del modelo, `predict`, `val`, `train`, exportación a otros formatos soportados por la librería).
- Soporte de inferencia sobre imagen individual, lotes y flujos de vídeo mediante las utilidades de Ultralytics.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente perceptivo de visión.
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan capacidades de segmentación, pose, audio u otras modalidades; la ficha declara únicamente detección.

## Casos de uso

- Sistemas ADAS de detección de peatones y ciclistas: el modelo ofrece 63,97 mAP@50 en Pedestrian y 55,40 en Cyclist, suficiente para módulos de aviso de colisión en entornos urbanos, combinado con lógica de seguimiento temporal.
- Percepción para vehículos autónomos en investigación: la detección de Car alcanza 91,27 mAP@50 y 69,04 mAP@50-95, por lo que es utilizable como módulo de percepción base en prototipos académicos sobre KITTI.
- Anotación automática (pre-labeling) de nuevos datasets de tráfico: se ejecuta el modelo sobre las imágenes y se corrigen las cajas resultantes, reduciendo el coste de etiquetado manual, especialmente en las clases con mejor rendimiento.
- Analítica de tráfico urbano: conteo y clasificación de vehículos (Car, Van, Truck, Tram) y de usuarios vulnerables (Pedestrian, Cyclist) a partir de vídeo de cámaras fijas.
- Evaluación reproducible de detectores: al formar parte de DetectionBench, sirve como referencia de comparación para medir otras arquitecturas bajo la misma receta y las mismas métricas.
- Investigación en conducción autónoma con KITTI: reproducción de resultados, estudios de ablación de aumento de datos o comparación entre tamaños de la familia YOLO11 (n, s, x).
- Robótica móvil y vehículos de interior/exterior a baja velocidad: al tener solo 57 M de parámetros y 196 GFLOPs a 640 px, puede desplegarse en plataformas con GPU moderada para detección de obstáculos y personas.
- Auditoría de sesgos en detección de clase: el desglose por clase permite analizar el fuerte desequilibrio entre clases frecuentes (Car) y minoritarias (Person_sitting, Misc, Tram) en escenarios reales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (split de validación de KITTI, canalización `detectionbench-evaluate`, métricas no verificadas por terceros):

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 39,18 |
| mAP@50-95 | 23,60 |
| Precision | 46,28 |
| Recall | 41,69 |
| F1 | 43,87 |
| Parámetros | 57,0 M |
| FLOPs | 196,0 B a 640 px |

Rendimiento por clase del propio modelo:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| Car | 91,27 | 69,04 |
| Cyclist | 55,40 | 31,46 |
| Pedestrian | 63,97 | 28,97 |
| Van | 39,06 | 24,75 |
| Truck | 32,02 | 20,85 |
| Tram | 14,92 | 7,48 |
| Person_sitting | 10,11 | 3,49 |
| Misc | 6,71 | 2,79 |

Zoo de modelos evaluados por DetectionBench en KITTI, según la model card del autor:

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 |
| YOLO11s | 42,00 | 25,10 | 47,27 | 43,71 |
| YOLOv8s | 41,99 | 25,20 | 49,02 | 43,66 |
| YOLO26m | 41,91 | 25,78 | 63,34 | 39,71 |
| YOLO26s | 41,79 | 26,54 | 59,64 | 42,42 |
| YOLOv9t | 41,60 | 25,73 | 48,30 | 44,20 |
| YOLOv9s | 40,84 | 25,92 | 54,27 | 41,51 |
| YOLOv8m | 40,48 | 25,37 | 50,81 | 39,86 |
| YOLOv8n | 40,11 | 24,75 | 46,05 | 41,85 |
| YOLO11x (este modelo) | 39,18 | 23,60 | 46,28 | 41,69 |
| YOLO11n | 38,77 | 23,97 | 52,84 | 40,19 |

## Requisitos de hardware

Estimaciones derivadas del tamaño del modelo (57,0 M de parámetros); no están publicadas por el autor.

- Peso de los pesos en memoria: aproximadamente 228 MB en FP32, 114 MB en FP16 y 57 MB en INT8, sin contar activaciones ni memoria del framework.
- VRAM total estimada para inferencia a 640 px: del orden de 1 a 2 GB con runtime PyTorch en FP16, y por debajo de 1 GB en formatos optimizados (TensorRT/ONNX Runtime en INT8).
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090, e incluso en GPUs integradas o en CPU para inferencia por lotes pequeños.
- GPUs de centro de datos (A100, H100, L40S) recomendadas únicamente si se necesita procesar muchos flujos de vídeo en paralelo o entrenar/reentrenar a gran escala.
- Opciones de despliegue: `ultralytics` en Python (PyTorch), exportación a ONNX, TensorRT, OpenVINO, CoreML y TFLite que ofrece la propia librería; también es viable servir el modelo exportado con Triton u otras plataformas de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada. El autor documenta 196,0 GFLOPs a 640 px, pero no publica medidas de latencia ni FPS por hardware.

## Comparativa con modelos similares

Comparación con alternativas del mismo zoo de DetectionBench sobre KITTI (métricas declaradas por el autor del repositorio):

| Modelo | Parámetros | mAP@50 (%) | mAP@50-95 (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11x (este modelo) | 57,0 M | 39,18 | 23,60 | AGPL-3.0 | HuggingFace (dronefreak/kitti-yolo11x) |
| YOLO11s | no disponible | 42,00 | 25,10 | AGPL-3.0 | HuggingFace (dronefreak/kitti-yolo11s) |
| YOLOv8s | no disponible | 41,99 | 25,20 | AGPL-3.0 | Disponible en el zoo de DetectionBench |
| YOLO26n | no disponible | 42,54 | 25,43 | no disponible | Disponible en el zoo de DetectionBench |
| YOLOv9t | no disponible | 41,60 | 25,73 | GPL-3.0 (upstream) | Disponible en el zoo de DetectionBench |

Observación relevante: en esta receta concreta, la variante más grande de YOLO11 no supera a variantes más pequeñas de la misma familia y de familias anteriores en mAP@50 global, aunque los valores son cercanos entre sí (rango de 38,77 a 42,54). La comparación con otros detectores fuera de este zoo (por ejemplo, DETR, RT-DETR o Faster R-CNN sobre KITTI) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en las 8 clases de KITTI; cualquier objeto fuera de esas categorías no se detectará o se clasificará de forma incorrecta.
- Rendimiento muy desequilibrado por clase: Car alcanza 91,27 mAP@50 mientras que Misc se queda en 6,71 y Person_sitting en 10,11. No es fiable para conteo de personas sentadas ni para categorías residuales.
- Riesgo de falsos negativos y falsos positivos inherente a la detección densa; precision del 46,28 % y recall del 41,69 % indican un margen amplio de error en el conjunto de validación.
- Sesgos potenciales derivados del dominio de KITTI (escenas de tráfico alemanas, condiciones de captura concretas); el modelo puede degradarse en otros países, condiciones meteorológicas adversas o cámaras diferentes.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí puede producir detecciones espurias con alta confianza en escenas con oclusiones o ruido.
- Licencia AGPL-3.0: el uso comercial dentro de un servicio en red obliga a liberar el código fuente correspondiente bajo la misma licencia. Conviene revisar las condiciones antes de integrarlo en producto propietario.
- Sin información sobre cuantizaciones validadas, latencias medidas ni pruebas de robustez fuera de KITTI.
- Métricas declaradas por el autor y marcadas como no verificadas (`verified: false`) en el model-index; no han pasado una revisión independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y model card truncada en la sección de instalación: el soporte de la comunidad es nulo y la documentación de uso está incompleta.
- No se declaran idiomas ni resolución de contexto porque no aplican, pero tampoco se especifica la resolución de entrenamiento más allá de los 640 px usados para medir FLOPs.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/kitti-yolo11x
- Dataset KITTI utilizado: https://huggingface.co/datasets/dronefreak/KITTI
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo hermano YOLO11s sobre KITTI: https://huggingface.co/dronefreak/kitti-yolo11s
- Modelo hermano YOLO11x sobre UAVDT: https://huggingface.co/dronefreak/uavdt-yolo11x
- Perfil del autor: https://huggingface.co/dronefreak
- Modelo base Ultralytics YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Paper referenciado (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
- Paper referenciado (arXiv:2606.03748): https://arxiv.org/abs/2606.03748
- Paper referenciado (arXiv:2402.13616): https://arxiv.org/abs/2402.13616
