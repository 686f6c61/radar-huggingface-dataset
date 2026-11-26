# soapy-spatula/fyp_classifier_yolo26n

## Resumen

`soapy-spatula/fyp_classifier_yolo26n` es un modelo derivado de Ultralytics YOLO26, publicado por el usuario soapy-spatula en Hugging Face. Por los tags del repositorio (`onnx`, `base_model:Ultralytics/YOLO26`, `base_model:quantized:Ultralytics/YOLO26`), se trata de una exportación a formato ONNX, presumiblemente cuantizada, de un clasificador basado en la arquitectura YOLO26 en su variante "n" (nano). El nombre del repositorio y el dataset asociado (`soapy-spatula/fyp_yolo26n_dataset`) sugieren que forma parte de un proyecto final de estudios (FYP, *Final Year Project*) orientado a una tarea de clasificación de imágenes.

La relevancia de este modelo es limitada: no es un modelo de lenguaje ni un modelo fundacional, sino un artefacto de clasificación visual derivado de YOLO26, con cero descargas y cero *likes* en el momento de la consulta, y acceso restringido (gated). No se dispone de información sobre el dataset de entrenamiento, el número de clases, la resolución de entrada ni las métricas de validación. El tamaño del repositorio es de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el archivo es de tamaño despreciable.

Dado que la información pública es mínima, esta ficha documenta lo que puede inferirse de los metadatos y marca explícitamente como "no disponible" todo aquello que no puede confirmarse. No debe confundirse con un modelo generativo: es un clasificador de imágenes empaquetado en ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (variante nano, "n"), exportada a ONNX; tarea de clasificación de imágenes |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | cuantización indicada en el tag `base_model:quantized:Ultralytics/YOLO26`; nivel exacto no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (tag `onnx`); presencia de safetensors no confirmada |
| Modelo base | Ultralytics/YOLO26 |
| Dataset asociado | soapy-spatula/fyp_yolo26n_dataset |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura de referencia es YOLO26 de Ultralytics, en su variante nano. YOLO (You Only Look Once) es una familia de redes convolucionales de detección y clasificación de objetos en una sola pasada, optimizadas para inferencia en tiempo real. La variante "n" es la de menor tamaño de la familia y está pensada para dispositivos con recursos limitados. El modelo publicado es una exportación ONNX, presumiblemente cuantizada, lo que indica que el artefacto está orientado a despliegue en *runtime* de inferencia (ONNX Runtime, TensorRT, etc.) más que a reentrenamiento.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset `fyp_yolo26n_dataset`, el número de clases, la resolución de entrada, ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional sobre el modelo base. Tampoco se documenta si la cuantización es post-entrenamiento (PTQ) o con entrenamiento consciente de cuantización (QAT), ni el esquema exacto (int8, fp16, etc.). Toda esta información debe considerarse no disponible.

## Capacidades

- Clasificación de imágenes: el nombre del repositorio (`classifier`) y el dataset asociado apuntan a una tarea de clasificación, no de detección.
- Inferencia en formato ONNX: el modelo está empaquetado para ejecutarse con ONNX Runtime u otros motores compatibles.
- Despliegue en entornos con recursos limitados: la variante nano de YOLO26 está diseñada para baja latencia y bajo consumo de memoria.
- Soporte de *tool calling* / *function calling*: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no es un modelo de lenguaje).
- Capacidades especiales (modo *thinking*, visión, audio): únicamente visión, en tanto que clasificador de imágenes; no se documentan otras.

## Casos de uso

- Clasificación de imágenes en el borde (edge computing): al ser una variante nano exportada a ONNX, puede ejecutarse en dispositivos con CPU modesta o aceleradores ligeros para tareas de clasificación en tiempo real, como la categorización de imágenes en una cámara o un dispositivo IoT.
- Prefiltrado en pipelines de visión: usar el clasificador para descartar o etiquetar imágenes antes de pasarlas a un modelo de detección o segmentación más pesado, reduciendo el coste computacional total.
- Prototipado académico: al proceder de un proyecto final de estudios, sirve como referencia para reproducir un flujo de exportación YOLO26 a ONNX con cuantización y evaluar su viabilidad en un *pipeline* propio.
- Integración en aplicaciones móviles o web: el formato ONNX permite su carga en ONNX Runtime Web o en *bindings* móviles para clasificación local sin depender de la nube.
- Automatización de etiquetado asistido: el modelo puede generar etiquetas preliminares sobre un conjunto de imágenes para su revisión humana, siempre que se conozca el dominio del dataset de entrenamiento (no documentado).
- Evaluación comparativa de cuantización: útil para estudiar el impacto de la cuantización sobre YOLO26 nano en términos de precisión y latencia, aunque la ausencia de métricas publicadas limita esta comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por la variante nano y el formato ONNX cuantizado, se espera un consumo muy bajo (del orden de cientos de MB o menos), pero no puede confirmarse sin conocer la resolución de entrada y el esquema de cuantización.
- GPU recomendadas: no disponible; por el tamaño de la variante nano, cabría esperar funcionamiento en GPU de consumo como RTX 3060 o superiores, así como en GPU de datacenter (A100, H100) sin aprovechar su capacidad.
- ¿Cabe en GPU de consumo? Probablemente sí, dada la variante nano y el formato ONNX; no confirmado.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT (previa conversión), y en general cualquier motor compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de visión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soapy-spatula/fyp_classifier_yolo26n | YOLO26 nano (ONNX) | Clasificación de imágenes | no disponible | AGPL-3.0 | Gated, 0 descargas |
| Ultralytics/YOLO26 | YOLO26 (varias variantes) | Detección / clasificación | no disponible | AGPL-3.0 | Público en Hugging Face |
| Ultralytics YOLOv8n | YOLOv8 nano | Detección / clasificación | no disponible | AGPL-3.0 | Público |
| Ultralytics YOLO11n | YOLO11 nano | Detección / clasificación | no disponible | AGPL-3.0 | Público |

La comparación se limita a la familia YOLO de Ultralytics, ya que no se dispone de datos de rendimiento del modelo evaluado ni de alternativas de clasificación con métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- Información pública mínima: no se documentan métricas, dataset, número de clases ni resolución de entrada, lo que impide evaluar su calidad real.
- Cero descargas y cero *likes*: no hay evidencia de uso o validación por parte de la comunidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en entornos automatizados.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes; el uso comercial en servicios en red puede requerir la publicación del código fuente derivado. Debe revisarse con cuidado antes de integrarlo en producción.
- Riesgo de sesgo y alucinación: al ser un clasificador, el riesgo se traduce en errores de clasificación y sesgos heredados del dataset de entrenamiento, que no está documentado.
- Tamaño del repositorio de 0.0 GB: sugiere que los pesos pueden no estar disponibles o ser de tamaño despreciable; conviene verificar la integridad de los archivos antes de usarlo.
- Sin soporte de lenguaje, agentes ni *tool calling*: no es adecuado para tareas de texto.
- Sin garantías de mantenimiento: el autor y la fecha de actualización (2026-11-26) no permiten inferir un soporte continuado.

## Enlaces

- Hugging Face: https://huggingface.co/soapy-spatula/fyp_classifier_yolo26n
- Dataset asociado: https://huggingface.co/datasets/soapy-spatula/fyp_yolo26n_dataset
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
