# qtpose/yolo26x-detect-onnx

## Resumen

YOLO26x detect (ONNX) es una exportación a formato ONNX del detector de objetos Ultralytics YOLO26x, entrenado sobre las 80 clases del dataset COCO. Lo publica el usuario `qtpose` como artefacto derivado del checkpoint oficial `yolo26x.pt` de la release v8.4.0 de Ultralytics, y lo utiliza internamente como detector de personas y de animales antes de ejecutar sus modelos de estimación de pose. No se trata de un modelo entrenado desde cero por el publicador, sino de una conversión reproducible con parámetros de exportación documentados.

El interés técnico del artefacto reside en que incorpora la NMS dentro del grafo ONNX (exportación end-to-end), de modo que la salida ya viene como un tensor `(1, 300, 6)` con cajas, puntuaciones y clases listas para consumir, sin post-procesado adicional en el cliente. La entrada es fija a `(1, 3, 640, 640)` en float32, lo que simplifica el despliegue en runtimes ONNX y en aceleradores sin soporte de formas dinámicas.

Es relevante para quien necesite un detector COCO de alta capacidad en producción con un pipeline de inferencia mínimo, siempre teniendo en cuenta que hereda la licencia AGPL-3.0 de Ultralytics y que el tamaño del repositorio (0,2 GB) corresponde a los pesos en precisión original, sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26x (familia Ultralytics YOLO26, detector de objetos de una etapa), exportada a ONNX con NMS integrada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión); las 80 clases COCO están etiquetadas en inglés |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`yolo26x_detect.onnx`), input `images` float32 `(1, 3, 640, 640)`, output float32 `(1, 300, 6)` |

## Arquitectura y entrenamiento

El modelo subyacente es YOLO26x de Ultralytics, un detector de objetos de una sola etapa de la familia YOLO. La información disponible no detalla la composición interna de la red (bloques, mecanismos de atención, función de pérdida ni estrategia de asignación de etiquetas), por lo que esos extremos deben consultarse en la documentación oficial de Ultralytics. El artefacto publicado es únicamente la conversión ONNX: no se aportan datos sobre el entrenamiento original, el número de tokens o imágenes vistas, la composición del dataset más allá de las 80 clases COCO, ni si hubo fases de ajuste fino supervisado adicionales.

La innovación relevante en este artefacto es la exportación end-to-end con NMS embebida (`nms=True`), que elimina la necesidad de implementar supresión de no máximos en el cliente y entrega directamente hasta 300 detecciones por imagen. La exportación se realizó con Ultralytics 8.4.189, `imgsz=640`, `opset=17`, `simplify=False`, `dynamic=False`, mediante el script `scripts/dev/convert_yolo26_to_onnx.py --task detect --variant x --validate`. El SHA-256 del fichero es `5267bf1883b43df3aca8791721909679ee83de8a7d5546a7ecdd75b99877bce4`, lo que permite verificar la integridad de la descarga.

## Capacidades

- Detección de objetos en imágenes RGB con 80 clases COCO (persona = clase 0).
- Salida end-to-end con NMS integrada: tensor `(1, 300, 6)` con `[x1, y1, x2, y2, score, class_id]` en píxeles de la imagen de entrada.
- Entrada de forma fija `(1, 3, 640, 640)`, con preprocesado esperado de escalado a 0-1 y letterbox.
- Uso como detector de personas para pipelines de pose estimation (caso de uso declarado por el publicador).
- Uso como detector de animales para recortar el fotograma antes de la estimación de pose animal.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es exclusivamente un modelo de visión.
- No se documentan capacidades de segmentación, clasificación, seguimiento (tracking) ni detección abierta de vocabulario.

## Casos de uso

- Detección de personas previa a pose estimation: el modelo localiza las personas en el fotograma y permite recortar cada instancia antes de pasarla a un modelo de keypoints, reduciendo el área de inferencia y mejorando la precisión del estimador. Es el caso de uso declarado por el publicador.
- Detección de animales para pose animal: recorta el fotograma alrededor del animal detectado antes de ejecutar el modelo de pose, evitando que el estimador procese fondo irrelevante.
- Analítica de vídeo en tiempo real: al tener NMS embebida y entrada fija, el grafo ONNX se puede ejecutar en ONNX Runtime o TensorRT sin lógica de post-procesado adicional, lo que simplifica pipelines de conteo de personas o vehículos.
- Moderación y filtrado de imágenes: la clase `person` y otras clases COCO permiten construir filtros previos (por ejemplo, descartar imágenes con personas detectadas) antes de otros modelos más costosos.
- Preetiquetado para anotación: generar cajas candidatas sobre un dataset propio y revisarlas manualmente, acelerando la creación de datasets de detección.
- Sistemas de vigilancia y control de aforo: detección de personas en cámaras fijas con un detector de alta capacidad, integrable en servicios backend vía ONNX Runtime.
- Automatización de recortes en pipelines de visión: uso como etapa de cropping genérico para alimentar clasificadores o modelos de atributos que esperan imágenes centradas en el objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, latencia ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 0,2 GB, lo que da una referencia del tamaño de los pesos en float32; el consumo real en ejecución depende del runtime y del tamaño de los buffers intermedios, no documentado.
- GPU recomendadas: no disponible. Al ser un modelo ONNX con opset 17, es compatible con cualquier runtime que soporte dicho opset (ONNX Runtime con execution providers CUDA, TensorRT, DirectML, CoreML, etc.).
- ¿Cabe en GPU de consumo? No confirmado. El tamaño de pesos (0,2 GB) sugiere que sí es viable en GPUs de consumo con suficiente memoria, pero no se aportan cifras de VRAM pico ni de latencia.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), TensorRT, OpenVINO, DirectML y otros runtimes compatibles con ONNX opset 17. No se distribuye en formato GGUF ni como artefacto para llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | NMS | Licencia | Formato |
|---|---|---|---|---|---|
| YOLO26x detect ONNX (este) | no disponible | 640x640 fija | Integrada en el grafo | AGPL-3.0 | ONNX |
| YOLOv8x (Ultralytics) | no disponible en la informacion | configurable | Externa por defecto | AGPL-3.0 | PyTorch, ONNX, etc. |
| YOLO11x (Ultralytics) | no disponible en la informacion | configurable | Externa por defecto | AGPL-3.0 | PyTorch, ONNX, etc. |
| RT-DETR (variantes grandes) | no disponible en la informacion | configurable | Integrada (end-to-end) | Apache-2.0 / MIT según variante | PyTorch, ONNX |

No se dispone de datos de rendimiento (mAP, latencia) en la información proporcionada para establecer una comparación cuantitativa con estas alternativas. La comparación se limita a aspectos de licencia, formato y características de exportación.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso en servicios de red puede obligar a liberar el código fuente del servicio que lo integra. Ultralytics ofrece una licencia enterprise como alternativa; debe evaluarse antes de un despliegue comercial.
- Modelo derivado: no es un entrenamiento propio, sino una exportación del checkpoint oficial; cualquier limitación del YOLO26x original se hereda.
- Entrada de forma fija `(1, 3, 640, 640)`: no admite resolución dinámica sin reexportar el grafo, lo que limita el ajuste fino de precisión/velocidad en producción.
- Clases cerradas: solo detecta las 80 clases COCO; no hay detección de vocabulario abierto ni clases personalizadas.
- Riesgo de falsos positivos y negativos inherente a los detectores de una etapa, especialmente en objetos pequeños, ocluidos o en condiciones de baja iluminación; no se documentan métricas de error.
- Sesgos del dataset COCO: la distribución de clases y contextos de COCO puede infrarepresentar ciertos escenarios, demografías y entornos; no se aporta análisis de sesgo.
- Sin información sobre cuantización: no se publican variantes INT8 ni FP16 validadas, por lo que el rendimiento en aceleradores que requieren cuantización debe validarse por cuenta del usuario.
- Sin datos de latencia ni VRAM: la planificación de capacidad en producción requiere medición propia.
- Fecha de creación futura en los metadatos (2026-10-26): conviene verificar la procedencia y la integridad del fichero mediante el SHA-256 publicado antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qtpose/yolo26x-detect-onnx
- Checkpoint origen `yolo26x.pt` (Ultralytics assets v8.4.0): https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo26x.pt
- Licencia Ultralytics: https://www.ultralytics.com/license
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
