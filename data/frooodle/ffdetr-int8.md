# Frooodle/ffdetr-int8

## Resumen

El modelo `Frooodle/ffdetr-int8` es una conversión a formato ONNX con cuantización dinámica int8 del detector de objetos FFDetr, desarrollado por jbarrow y publicado en Hugging Face por el usuario Frooodle. FFDetr es un fine-tuning del modelo RF-DETR (versión medium) de Roboflow, que a su vez utiliza un backbone DINOv2 de Meta AI, entrenado sobre el dataset CommonForms, especializado en la detección de elementos en formularios. El modelo resultante mantiene los pesos originales sin modificaciones más allá de la conversión a ONNX y la cuantización int8, lo que permite una inferencia más ligera y eficiente en entornos de producción.

La relevancia de este modelo radica en su capacidad para detectar campos y estructuras en documentos de formularios de forma precisa, aprovechando la arquitectura transformer de DETR combinada con el backbone DINOv2, y empaquetado en un formato optimizado para despliegue en CPU o GPU con ONNX Runtime. Al ser una versión cuantizada, ofrece un equilibrio entre rendimiento y consumo de recursos, aunque puede presentar una ligera degradación en precisión respecto al modelo original en punto flotante.

El repositorio incluye únicamente el artefacto ONNX cuantizado, sin documentación adicional sobre métricas de evaluación ni detalles de entrenamiento, por lo que la información disponible se limita a la procedencia del modelo y su licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (DETR con backbone DINOv2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | int8 dinamico |
| Idiomas soportados | no disponible (no aplica, es un modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo FFDetr se basa en la arquitectura RF-DETR de Roboflow, que es una variante del Detection Transformer (DETR). DETR utiliza un transformer encoder-decoder para predecir directamente el conjunto de objetos presentes en una imagen, eliminando la necesidad de anclas o propuestas regionales. El backbone empleado es DINOv2 de Meta AI, un modelo de visión autosupervisado que extrae características visuales robustas y generalizables. El entrenamiento se realizó sobre el dataset CommonForms, que contiene imágenes de formularios anotados con cajas delimitadoras de campos y estructuras.

La conversión a ONNX se realizó a partir del checkpoint original de jbarrow (revisión `56f4e4235e28dcb2953513dc020bb191a2f54cfe`), seguida de una cuantización dinámica int8. No se modificaron los pesos del modelo más allá de la conversión de formato y la reducción de precisión numérica. No se dispone de información sobre el número de tokens de entrenamiento, composición exacta del dataset ni técnicas adicionales como RLHF o DPO, ya que al ser un modelo de detección de objetos, estas técnicas no son aplicables.

## Capacidades

- Detección de objetos en imágenes de formularios, identificando campos de texto, casillas de verificación, firmas y otros elementos estructurales.
- Inferencia en formato ONNX, compatible con ONNX Runtime, lo que facilita su integración en pipelines de visión por computador.
- Cuantización int8 que reduce el tamaño del modelo y acelera la inferencia en CPU, manteniendo una precisión aceptable para tareas de detección.
- Al estar basado en DETR, no requiere post-procesamiento complejo como NMS (Non-Maximum Suppression) para eliminar detecciones duplicadas, simplificando el flujo de inferencia.
- Capacidad de procesar imágenes de resolución variable, aunque no se especifican los tamaños de entrada soportados.

## Casos de uso

- Digitalización de formularios en papel: el modelo puede detectar automáticamente los campos de un formulario escaneado, permitiendo su posterior extracción de texto mediante OCR o entrada manual asistida.
- Automatización de procesos de negocio: en entornos como banca o seguros, se puede usar para clasificar y extraer información de formularios rellenados, reduciendo el trabajo manual.
- Validación de documentos: detectar si un formulario contiene todos los campos obligatorios o si hay elementos ausentes, mediante la comparación de las detecciones con una plantilla esperada.
- Indexación de documentos: al identificar la estructura de los formularios, se pueden generar metadatos automáticos para sistemas de gestión documental.
- Asistencia a personas con discapacidad visual: combinado con síntesis de voz, el modelo puede describir la disposición de los campos de un formulario para facilitar su cumplimentación.
- Investigación académica: como punto de partida para fine-tuning en otros dominios de detección de documentos, gracias a su licencia permisiva Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión (mAP, IoU, etc.) ni comparaciones con otros modelos de detección. Se recomienda evaluar el modelo en el conjunto de datos de interés antes de su despliegue en producción.

## Requisitos de hardware

- Al ser un modelo ONNX cuantizado int8, puede ejecutarse eficientemente en CPU con ONNX Runtime, requiriendo típicamente menos de 1 GB de RAM para el modelo (tamaño no especificado, pero el repositorio es de 0.0 GB, lo que sugiere un artefacto muy ligero).
- En GPU, es compatible con CUDA a través de ONNX Runtime, aunque la cuantización int8 está optimizada principalmente para CPU.
- No se dispone de información sobre VRAM estimada ni latencia. Se recomienda probar en el hardware objetivo, ya que el rendimiento dependerá de la resolución de entrada y el número de detecciones.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), o integración en frameworks como OpenCV DNN, aunque se recomienda ONNX Runtime por su soporte completo de operadores.
- No se ha verificado compatibilidad con vLLM, llama.cpp u otros motores de inferencia de modelos de lenguaje, ya que este modelo no es de texto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Frooodle/ffdetr-int8 | RF-DETR + DINOv2 | no disponible | N/A | Apache-2.0 | ONNX int8 |
| jbarrow/FFDetr | RF-DETR + DINOv2 | no disponible | N/A | Apache-2.0 | PyTorch |
| Roboflow RF-DETR (medium) | DETR + DINOv2 | no disponible | N/A | Apache-2.0 | PyTorch |
| YOLOv8 | CNN | 3.2M - 68M | N/A | AGPL-3.0 | PyTorch, ONNX |

La comparativa se limita a la información disponible. FFDetr es una variante especializada en formularios de RF-DETR, mientras que YOLOv8 es un detector genérico basado en CNN con un enfoque diferente. No se dispone de datos de rendimiento para comparar objetivamente.

## Limitaciones y advertencias

- El modelo está especializado en la detección de elementos en formularios (dataset CommonForms), por lo que su rendimiento en otros dominios de detección de objetos puede ser limitado.
- La cuantización int8 dinámica puede degradar ligeramente la precisión respecto al modelo en punto flotante, especialmente en objetos pequeños o con bajo contraste.
- No se dispone de información sobre la resolución de entrada recomendada ni sobre el manejo de imágenes con rotaciones o distorsiones geométricas.
- Al ser un modelo de visión, no tiene capacidades de procesamiento de lenguaje natural ni de generación de texto.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir adecuadamente a los autores originales (jbarrow, Roboflow, Meta AI) según los términos de la licencia.
- No se han publicado resultados de evaluación en el repositorio, por lo que el rendimiento real en casos de uso específicos debe ser validado por el usuario.

## Enlaces

- [Repositorio Hugging Face del modelo](https://huggingface.co/Frooodle/ffdetr-int8)
- [Repositorio fuente jbarrow/FFDetr](https://huggingface.co/jbarrow/FFDetr) (según la model card)
- [Roboflow RF-DETR](https://roboflow.com) (referencia al modelo base)
- [DINOv2 de Meta AI](https://github.com/facebookresearch/dinov2) (referencia al backbone)
