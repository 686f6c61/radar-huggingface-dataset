# dronefreak/pklot-yolov8m

## Resumen

dronefreak/pklot-yolov8m es un detector de objetos YOLOv8m afinado específicamente para la clasificación de ocupación de plazas de aparcamiento sobre el conjunto de datos PKLot. Lo desarrolla el autor de DetectionBench, un framework orientado a reproducir la evaluación de detectores modernos con recetas de entrenamiento y métricas idénticas entre modelos y datasets. El modelo parte de los pesos preentrenados de Ultralytics/YOLOv8 y se ha reentrenado con 43 épocas efectivas (60 configuradas, paciencia de early stopping de 15) sobre imágenes de 960 px.

La relevancia práctica es clara: la detección de plazas libres y ocupadas es una tarea de infraestructura urbana con demanda creciente, y este checkpoint ofrece métricas muy altas en el split de test de PKLot (mAP@50 de 98,41 %, mAP@50-95 de 95,40 %, precisión de 99,55 % y recall de 97,67 %). Con 25,9 millones de parámetros y 78,9 GFLOPs a 640 px, es un modelo de tamaño medio que puede desplegarse en GPUs de consumo y en nodos edge.

El modelo tiene dos clases (vacant y occupied), se distribuye con licencia AGPL-3.0 y está pensado como pieza de un banco de pruebas reproducible más amplio, no como un producto cerrado. Su valor, por tanto, es tanto operativo (detección de ocupación) como metodológico (comparación justa con otros detectores bajo la misma receta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8m (detector de una etapa, familia Ultralytics YOLO) |
| Parámetros totales | 25.890.598 (25,9 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (el repo solo publica `best.pt` en PyTorch; no se documentan variantes GGUF, ONNX ni TensorRT) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase son `vacant` y `occupied`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`); el repo declara tag `safetensors` pero el contenido listado solo incluye `best.pt` |
| Tarea | Detección de objetos (object-detection) |
| Framework | Ultralytics YOLO |
| Resolución de entrenamiento | 960 px |
| FLOPs | 78,9 GFLOPs a 640 px |
| Clases | 2 (`vacant`, `occupied`) |
| Dataset | dronefreak/PKLot |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de YOLOv8m: un detector de una etapa con backbone CSPDarknet, cuello PAN-FPN y cabeza desacoplada de detección, en su variante de tamaño medio (25,9 M de parámetros). No hay innovaciones arquitectónicas propias; el interés está en el ajuste fino y en la receta reproducible. El entrenamiento se hizo con Ultralytics YOLO orquestado por DetectionBench, con AdamW, learning rate inicial de 0,001, batch automático (AutoBatch), semilla 0 y tamaño de imagen de 960 px. Se configuraron 60 épocas como máximo, pero el early stopping con paciencia de 15 detuvo el entrenamiento en la época 43.

No se documentan en la información disponible el número de tokens (no aplica), la composición exacta del dataset más allá de las dos clases, ni si hubo aumentos de datos específicos. Tampoco se indica si se aplicó destilación, poda o técnicas de decodificación especulativa, lo cual es esperable en un detector de una etapa. El modelo se entrenó sobre el dataset PKLot alojado en Hugging Face (dronefreak/PKLot), cuya ficha enlaza a la descripción completa del dataset, procedencia y cita.

## Capacidades

- Detección de objetos en imágenes de aparcamientos con dos clases: plaza vacía (`vacant`) y plaza ocupada (`occupied`).
- Localización con cajas delimitadoras y puntuaciones de confianza por detección.
- Funcionamiento en imágenes de vigilancia aérea o cenital, típicas de PKLot.
- Inferencia batch a través de la API de Ultralytics (`model.predict`).
- Exportación potencial a otros formatos vía Ultralytics (ONNX, TensorRT, OpenVINO), aunque no se documenta en el repo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión generativa, audio ni entrada de texto.

## Casos de uso

- Gestión de ocupación en aparcamientos urbanos: el modelo detecta plazas libres y ocupadas en imágenes de cámaras fijas, lo que permite calcular la tasa de ocupación en tiempo real con una precisión declarada del 99,55 % y un recall del 97,67 %.
- Señalización dinámica de plazas libres: integrado en paneles o apps municipales, el detector alimenta un contador de plazas disponibles por zona; su mAP@50 de 98,41 % reduce los falsos negativos que frustran a los conductores.
- Analítica histórica de uso de estacionamientos: procesando grabaciones o capturas periódicas, se pueden generar series temporales de ocupación para planificación urbana y tarificación dinámica.
- Control de acceso y cumplimiento en aparcamientos privados: detección de vehículos en plazas reservadas o de carga/descarga, con umbral de confianza ajustable (`conf=0.25` en el ejemplo de la model card).
- Monitorización de aparcamientos en campus o recintos cerrados: despliegue en GPUs de consumo o nodos edge junto a cámaras IP, dado el reducido tamaño del checkpoint (0,1 GB) y sus 78,9 GFLOPs.
- Benchmarking reproducible de detectores: al formar parte del zoo de PKLot de DetectionBench, sirve como referencia para comparar YOLO11, YOLO26, RF-DETR y otras variantes bajo la misma receta y métricas.
- Auditoría de ocupación en parkings de gran superficie: la resolución de entrenamiento de 960 px y la cabeza de detección densa permiten manejar escenas con muchas plazas por imagen.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de PKLot (no verificados, `verified: false`):

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 98,41 |
| mAP@50-95 | 95,40 |
| Precisión | 99,55 |
| Recall | 97,67 |
| F1 | 98,60 |

Rendimiento por clase (declarado por el autor):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| vacant | 98,49 | 96,92 |
| occupied | 98,33 | 93,87 |

Comparativa dentro del zoo de PKLot de DetectionBench (métricas declaradas por el autor):

| Modelo | mAP@50 | mAP@50-95 | Precisión | Recall |
|---|---|---|---|---|
| YOLO11n | 99,42 | 94,99 | 99,78 | 99,92 |
| YOLO26n | 99,42 | 94,60 | 99,66 | 99,37 |
| YOLOv8n | 99,42 | 94,85 | 99,49 | 98,68 |
| YOLO26m | 99,41 | 94,92 | 99,60 | 99,64 |
| YOLOv8s | 99,33 | 95,33 | 99,50 | 96,18 |
| YOLO26s | 99,31 | 94,32 | 99,52 | 92,31 |
| RF-DETR Nano | 98,93 | 91,63 | 99,66 | 99,81 |
| YOLOv8m (este modelo) | 98,41 | 95,40 | 99,55 | 97,67 |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el checkpoint de 25,9 M de parámetros ocupa aproximadamente 100 MB de pesos; con activaciones a 960 px, el consumo típico se sitúa en torno a 1-2 GB de VRAM. En FP16 se reduce a la mitad aproximadamente. No se publican cifras oficiales de VRAM en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia a 640-960 px; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Para entrenamiento o fine-tuning, se recomienda RTX 4090 o superior.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer recientes (GTX 1650 en adelante con 4 GB o más), así como en dispositivos edge tipo Jetson.
- Opciones de despliegue: Ultralytics (PyTorch nativo), exportación a ONNX, TensorRT, OpenVINO o TorchScript a través de la propia librería. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend de exportación elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | mAP@50 (PKLot) | mAP@50-95 (PKLot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLOv8m (este modelo) | 25,9 M | no aplica | 98,41 | 95,40 | AGPL-3.0 | Hugging Face |
| YOLOv8n | no disponible | no aplica | 99,42 | 94,85 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLOv8s | no disponible | no aplica | 99,33 | 95,33 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO11n | no disponible | no aplica | 99,42 | 94,99 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO26n | no disponible | no aplica | 99,42 | 94,60 | no disponible | Hugging Face / Ultralytics |
| RF-DETR Nano | no disponible | no aplica | 98,93 | 91,63 | no disponible | Hugging Face / Roboflow |

La comparación debe interpretarse con cautela: las variantes `n` y `s` obtienen mejor mAP@50 que la variante `m`, pero peor mAP@50-95 en algunos casos, lo que sugiere que el tamaño medio no aporta una ventaja clara en este dataset concreto. Los parámetros de los modelos comparables no se detallan en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se ha entrenado exclusivamente con PKLot, por lo que puede generalizar mal a otras cámaras, ángulos, condiciones de iluminación, climas o tipos de vehículo no representados en el dataset.
- Riesgo de alucinación: como todo detector, puede producir falsos positivos en texturas o sombras que se parezcan a vehículos, y falsos negativos en plazas parcialmente ocupadas u ocluidas.
- Limitaciones de contexto o idioma: no aplica contexto textual; las dos únicas clases son `vacant` y `occupied`, sin granularidad por tipo de plaza, matrícula ni estado intermedio.
- Restricciones de licencia: AGPL-3.0 impone obligaciones copyleft fuertes; el uso comercial en un servicio en red puede exigir la publicación del código fuente derivado. Conviene revisar con asesoría legal antes de integrarlo en un producto propietario.
- Caveat de producción: las métricas son declaradas por el autor y no están verificadas (`verified: false`); deben reproducirse sobre el propio dominio antes de desplegar.
- El repositorio declara el tag `safetensors`, pero el contenido listado solo incluye `best.pt` en PyTorch; verificar el formato real antes de integrarlo.
- No se documentan cuantizaciones ni exportaciones listas para producción (ONNX, TensorRT), por lo que el pipeline de despliegue debe construirse.
- El modelo se detuvo por early stopping en la época 43 de 60; un reentrenamiento con otra semilla o hiperparámetros podría variar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/pklot-yolov8m
- Dataset PKLot en Hugging Face: https://huggingface.co/datasets/dronefreak/PKLot
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- Documentación de Ultralytics: https://docs.ultralytics.com/
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
