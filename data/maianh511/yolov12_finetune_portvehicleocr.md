# maianh511/YOLOv12_finetune_PortVehicleOCR

## Resumen

El modelo `maianh511/YOLOv12_finetune_PortVehicleOCR` es un detector de objetos basado en YOLOv12, ajustado por el autor maianh511 sobre el dataset `maianh511/PortVehicleOCR`. Su objetivo es localizar regiones de matrículas (`license_plate`) y contenedores (`container`) en imágenes de vehículos portuarios, actuando como paso previo a un sistema de reconocimiento óptico de caracteres (OCR). El modelo se distribuye bajo licencia Apache-2.0 y está orientado a tareas de detección de objetos en el dominio logístico y portuario.

La relevancia del modelo radica en que YOLOv12 introduce mecanismos de atención eficientes en el backbone, manteniendo el rendimiento en tiempo real de la familia YOLO. El ajuste fino sobre datos específicos del puerto permite una localización precisa de elementos clave en escenarios industriales, aunque el repositorio no especifica el tamaño en parámetros ni la configuración exacta del modelo base. El repo tiene un tamaño de 0.1 GB, lo que sugiere un checkpoint relativamente ligero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv12 (atención eficiente en el backbone) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (el tag `onnx` sugiere posible exportación, pero no se detalla) |
| Idiomas soportados | no aplica (modelo de visión; el dataset está en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente `.pt` de Ultralytics, posible `.onnx`; no se especifica) |

## Arquitectura y entrenamiento

El modelo se basa en YOLOv12, una variante de la familia YOLO que incorpora mecanismos de atención en el backbone para mejorar la extracción de características sin sacrificar la velocidad de inferencia. El ajuste fino se realizó sobre el dataset `maianh511/PortVehicleOCR`, que contiene 18,485 imágenes de vehículos portuarios y 19,754 cajas delimitadoras distribuidas en dos clases: `container` y `license_plate`. Las imágenes fueron normalizadas a una resolución de 640×640 píxeles.

No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión puro. El entrenamiento se centra en la localización precisa de objetos, y el dataset es específico del dominio portuario, lo que limita su generalización a otros escenarios. La arquitectura de atención de YOLOv12 permite un equilibrio entre precisión y velocidad, aunque no se detallan hiperparámetros ni número de épocas.

## Capacidades

- Detección de objetos en tiempo real: localiza cajas delimitadoras de matrículas y contenedores en imágenes de vehículos portuarios.
- Integración con OCR: las regiones detectadas pueden alimentar un pipeline de reconocimiento de texto como PP-OCRv4.
- Exportación ONNX: el tag `onnx` sugiere compatibilidad con formatos de inferencia multiplataforma.
- Entrenado sobre un dataset específico de dominio, lo que mejora la precisión en escenarios portuarios frente a modelos genéricos.
- No soporta tool calling, agentes o razonamiento multi-paso, ya que es un modelo de visión puro.
- No tiene capacidades multilingües ni de procesamiento de audio o texto.

## Casos de uso

- Control de acceso en puertos: el modelo puede detectar automáticamente la matrícula de vehículos que entran en el puerto, recortar la región y pasarla a un OCR para registrar el número de placa, agilizando el proceso de entrada y salida.
- Gestión de contenedores: detectar y localizar contenedores en imágenes de terminales portuarias, permitiendo el seguimiento y la verificación de su posición en tiempo real.
- Vigilancia y seguridad: integrado en cámaras de vigilancia, el modelo puede alertar sobre vehículos no autorizados o anomalías en zonas restringidas, basándose en la presencia de matrículas o contenedores.
- Automatización de procesos logísticos: en sistemas de gestión de transporte, el modelo puede extraer automáticamente los identificadores de matrícula de vehículos de carga, reduciendo errores manuales.
- Integración con sistemas OCR: el modelo actúa como módulo de localización previa en un pipeline de OCR para leer matrículas, mejorando la precisión al centrar el texto en la región detectada.
- Análisis de flujo vehicular: en estudios de movilidad portuaria, el modelo puede contar y clasificar vehículos según sus matrículas y contenedores, proporcionando datos estadísticos para optimizar operaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de precisión (mAP, IoU, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware concretos para este modelo.
- Al ser una variante de YOLOv12, se puede inferir que es adecuado para GPUs consumer (como RTX 3060, RTX 4090) y también para inferencia en CPU con bajo rendimiento, pero no se confirman datos de VRAM.
- El repositorio no indica tamaños de checkpoint ni cuantizaciones disponibles, por lo que no se puede estimar la VRAM exacta.
- Se recomienda usar el framework Ultralytics YOLO para inferencia, que soporta PyTorch y exportación a ONNX, TensorRT, etc.
- Para despliegue en producción, se podrían usar herramientas como vLLM, pero no aplica directamente a modelos de visión; más adecuado sería usar el propio pipeline de Ultralytics o servidores ONNX Runtime.

## Comparativa con modelos similares

No se dispone de información de modelos similares con el mismo dominio de datos (detección de matrículas y contenedores en puertos). Se podría comparar con YOLOv8 o YOLOv5, pero no hay datos públicos de este checkpoint específico. No se puede realizar una comparativa cuantitativa sin inventar cifras.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente sobre imágenes portuarias; su rendimiento en otros contextos (calles urbanas, autopistas) puede ser significativamente inferior.
- La detección puede fallar en condiciones de poca iluminación, oclusiones o ángulos extremos, como es habitual en modelos de visión.
- No se han publicado métricas de robustez ni pruebas de estrés; se recomienda validar el modelo en el dominio específico antes de desplegarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de exactitud ni soporte técnico.
- El modelo solo detecta dos clases (`container` y `license_plate`); no es adecuado para otros tipos de objetos.
- Al ser un modelo de detección, el riesgo de alucinación se traduce en bounding boxes incorrectos o falsos positivos, especialmente en imágenes con alto ruido.

## Enlaces

- HuggingFace: https://huggingface.co/maianh511/YOLOv12_finetune_PortVehicleOCR
- Dataset: https://huggingface.co/datasets/maianh511/PortVehicleOCR
- Notebook de entrenamiento de YOLOv12 (Roboflow): https://github.com/roboflow/notebooks/blob/main/notebooks/train-yolov12-object-detection-model.ipynb
- Tutorial en YouTube: https://www.youtube.com/watch?v=fksJmIMIfXo
- Repositorio de YOLOv5 (referencia de la familia): https://github.com/ultralytics/yolov5
