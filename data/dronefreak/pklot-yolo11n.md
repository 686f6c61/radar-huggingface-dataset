# dronefreak/pklot-yolo11n

## Resumen

`dronefreak/pklot-yolo11n` es un detector de objetos YOLO11n (variante nano de Ultralytics) afinado específicamente para la tarea de ocupación de plazas de aparcamiento sobre el conjunto de datos PKLot. Lo desarrolla el usuario dronefreak en el marco de DetectionBench, un framework cuyo objetivo es reproducir recetas de entrenamiento y evaluación idénticas entre distintos detectores para permitir comparaciones justas. El modelo resuelve un problema acotado pero de gran valor operativo: clasificar cada plaza de parking como `vacant` u `occupied` a partir de imágenes de vigilancia.

La relevancia de esta ficha no está en el tamaño (2,6 millones de parámetros, un modelo minúsculo) sino en el contexto: se publica junto a una comparativa homogénea con otros detectores (YOLOv8n/s/m, YOLO26n/s/m, RF-DETR Nano) entrenados con la misma receta sobre PKLot, lo que permite extraer conclusiones fiables sobre qué arquitectura conviene para despliegues de borde en smart parking. Con 6,6 GFLOPs a 640 px, es candidato directo a inferencia en CPU o en GPUs de gama baja dentro de cámaras IP o gateways.

La arquitectura es la de YOLO11n estándar (CNN de detección en una sola pasada, con cuello PAN-FPN y cabeza desacoplada), sin modificaciones estructurales: el trabajo consiste en el ajuste fino y en la evaluación reproducible. La licencia AGPL-3.0 y la ausencia de metadatos de idioma o de benchmarks externos verificados son los puntos que más condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (CNN de deteccion en una pasada, familia Ultralytics YOLO11) |
| Parametros totales | 2.605.606 (2,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin ventana de texto) |
| Tipos de cuantizacion | no disponible (el repo solo publica `best.pt` en PyTorch; no se documentan exportaciones ONNX, TensorRT, OpenVINO ni GGUF) |
| Idiomas soportados | no disponible (no procesa lenguaje; las clases son `vacant` y `occupied`) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`); safetensors listado en los tags del repo |
| Resolucion de entrenamiento | 960 px (inferencia de referencia a 640 px para el dato de FLOPs) |
| FLOPs | 6,6 GFLOPs a 640 px |
| Clases | `vacant`, `occupied` |
| Dataset | PKLot (`dronefreak/PKLot`) |

## Arquitectura y entrenamiento

El modelo parte de los pesos preentrenados de Ultralytics YOLO11n y se afina sobre PKLot con la herramienta DetectionBench. YOLO11n es un detector CNN de una sola etapa con backbone tipo CSP, cuello PAN-FPN y cabeza desacoplada de clasificación y regresión, más un módulo de asignación dinámica de etiquetas; no hay mecanismos de atención lineal ni decodificación especulativa, y el modelo no procesa texto. La innovación aquí es metodológica, no arquitectónica: la receta de entrenamiento es fija y pública para que los resultados entre detectores sean comparables.

La configuración de entrenamiento documentada es: 60 épocas máximas (se ejecutaron 57 por parada temprana con paciencia 15), batch automático (Ultralytics AutoBatch), tamaño de imagen 960, optimizador AdamW con learning rate inicial 0,001 y semilla 0. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo aumentos de datos concretos, más allá de los que Ultralytics aplica por defecto. Tampoco se documenta ninguna fase de RLHF/DPO, algo que no aplica a un detector.

## Capacidades

- Detección de objetos en imágenes: localiza plazas de aparcamiento y las clasifica en dos clases, `vacant` (libre) y `occupied` (ocupada).
- Detección densa: PKLot contiene muchas instancias pequeñas por imagen, y el modelo está ajustado para ese régimen de alta densidad de objetos.
- Inferencia en una sola pasada, apta para vídeo en tiempo real en hardware modesto.
- Salida estándar de Ultralytics: cajas, clases y confianzas, consumible con `model.predict()` y exportable a los formatos que soporte la librería.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingües, de visión-lenguaje, audio ni modo "thinking".
- No se documentan capacidades de segmentación, pose ni tracking integrados en este checkpoint.

## Casos de uso

- Gestión de ocupación en aparcamientos públicos: desplegar el modelo sobre el stream de una cámara fija y contar plazas libres por zona; los 6,6 GFLOPs permiten procesar varios FPS por cámara en una sola GPU de gama media.
- Señalización dinámica de plazas libres: integrar las detecciones en un panel o app que indique dónde hay hueco, actualizando el estado cada pocos segundos; la precisión declarada del 99,78 % reduce falsos positivos que molestarían al conductor.
- Analítica de rotación y ocupación media: agregar detecciones a lo largo del día para calcular tasas de ocupación por franja horaria y dimensionar tarifas o turnos de vigilancia.
- Detección de uso indebido de plazas reservadas: aplicar el modelo a plazas de movilidad reducida o carga/descarga y alertar cuando estén ocupadas por vehículos no autorizados, combinándolo con reglas de negocio externas.
- Despliegue en el borde: por su tamaño (2,6 M de parámetros) puede ejecutarse en una Jetson Nano, una Raspberry Pi con acelerador o directamente en la CPU de una cámara IP, evitando enviar vídeo a la nube.
- Validación de aforo en eventos: estimar en tiempo real cuántas plazas quedan libres en un recinto y avisar al personal cuando se acerque al límite.
- Benchmark interno de detectores: usar este checkpoint como referencia reproducible para comparar futuras arquitecturas con la misma receta de DetectionBench antes de comprometerse con un proveedor.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de PKLot (no verificados de forma independiente; `verified: false` en el model-index):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 99,42 |
| mAP@50-95 | 94,99 |
| Precision | 99,78 |
| Recall | 99,92 |
| F1 | 99,85 |

Rendimiento por clase:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| vacant | 99,49 | 97,02 |
| occupied | 99,36 | 92,95 |

Comparativa publicada en el model zoo de PKLot del propio autor:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO11n (este modelo) | 99,42 | 94,99 | 99,78 | 99,92 |
| YOLO26n | 99,42 | 94,60 | 99,66 | 99,37 |
| YOLOv8n | 99,42 | 94,85 | 99,49 | 98,68 |
| YOLO26m | 99,41 | 94,92 | 99,60 | 99,64 |
| YOLOv8s | 99,33 | 95,33 | 99,50 | 96,18 |
| YOLO26s | 99,31 | 94,32 | 99,52 | 92,31 |
| RF-DETR Nano | 98,93 | 91,63 | 99,66 | 99,81 |
| YOLOv8m | 98,41 | 95,40 | 99,55 | 97,67 |

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en FP32 a 640 px; el modelo pesa unos pocos megabytes y las activaciones son mínimas.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes o múltiples cámaras, una RTX 4090 o una L4 bastan de sobra. En servidor, A100/H100 están sobredimensionadas para este checkpoint.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), y también en CPU.
- Opciones de despliegue: Ultralytics (`YOLO(...)`), exportación a ONNX/TensorRT/OpenVINO mediante la propia librería, y despliegue en el borde con Jetson. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de visión.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, los 6,6 GFLOPs a 640 px sitúan al modelo en el rango de milisegundos por imagen en GPU de consumo, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | mAP@50-95 (PKLot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n (este) | 2,6 M | imagen, 960 px entreno | 94,99 | AGPL-3.0 | Hugging Face |
| YOLOv8n | no disponible en la informacion | imagen | 94,85 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO26n | no disponible en la informacion | imagen | 94,60 | no disponible en la informacion | Hugging Face |
| RF-DETR Nano | no disponible en la informacion | imagen | 91,63 | no disponible en la informacion | Hugging Face |

La comparación relevante es que, con la misma receta, YOLO11n iguala o supera ligeramente a YOLOv8n y YOLO26n en mAP@50-95, y queda por debajo de YOLOv8s y YOLOv8m en esa métrica global, a costa de muchas más FLOPs. Para el caso de uso de parking, la diferencia práctica entre los nano es marginal.

## Limitaciones y advertencias

- Resultados no verificados de forma independiente: el model-index marca las métricas como `verified: false`; proceden del propio autor.
- Sesgo de dominio: entrenado exclusivamente en PKLot, con cámaras, perspectivas y condiciones de iluminación concretas. El rendimiento puede degradarse en aparcamientos con ángulos, resoluciones o climas distintos.
- Riesgo de alucinación en sentido amplio: puede producir detecciones espurias en texturas que se parezcan a marcas viales o a vehículos parcialmente ocluidos; conviene calibrar el umbral de confianza por despliegue.
- Solo dos clases: no distingue tipo de vehículo, matrícula ni estado de la plaza más allá de libre/ocupada.
- Licencia AGPL-3.0: el uso comercial en un servicio en red obliga a liberar el código fuente derivado; para productos propietarios hay que valorar la licencia comercial de Ultralytics o sustituir el modelo.
- Sin cuantizaciones ni exportaciones publicadas: el repo solo incluye `best.pt`, así que la conversión a ONNX/TensorRT/OpenVINO corre por cuenta del integrador y no está validada por el autor.
- Sin información sobre composición del dataset, balance de clases ni posibles duplicados entre splits, lo que impide descartar fuga de datos en la evaluación.
- Repo de muy baja tracción (92 descargas, 0 likes) y sin mantenimiento documentado más allá de la actualización de noviembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/pklot-yolo11n
- Dataset PKLot: https://huggingface.co/datasets/dronefreak/PKLot
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Paper de referencia citado en los tags (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
