# khourix/glm-OCR-lab-scans

## Resumen

`khourix/glm-OCR-lab-scans` es un modelo multimodal de OCR (reconocimiento óptico de caracteres) especializado en la digitalización de escaneos de laboratorio. Se trata de un fine-tune del modelo `unsloth/GLM-OCR`, que a su vez deriva de `zai-org/GLM-OCR`, un modelo desarrollado por Z.ai para la comprensión de documentos complejos. El fine-tune ha sido realizado por el usuario khourix utilizando las librerías Unsloth y TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tune convencional.

El modelo base GLM-OCR combina un encoder visual CogViT pre-entrenado en grandes conjuntos de datos imagen-texto, un conector cross-modal ligero con reducción eficiente de tokens y un decoder de lenguaje GLM-0.5B. Con 1.325 millones de parámetros (1,3 mil millones), es un modelo relativamente compacto, adecuado para despliegue en entornos con recursos limitados. Su pipeline es `image-text-to-text`, lo que significa que recibe una imagen y genera texto, en este caso el contenido transcrito del documento escaneado.

La relevancia de este modelo radica en su especialización: mientras que GLM-OCR original está diseñado para documentos generales, esta versión fine-tuneada apunta específicamente a escaneos de laboratorio, lo que puede mejorar la precisión en la transcripción de informes, etiquetas de muestras, formularios y otros documentos científicos. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multimodal (CogViT + conector cross-modal + decoder GLM-0.5B) |
| Parametros totales | 1.325.258.240 (1,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, formato fp16 o similar) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-OCR, desarrollado por Z.ai, utiliza una arquitectura encoder-decoder multimodal. El encoder visual es CogViT, pre-entrenado en datos imagen-texto a gran escala, que extrae características visuales de la imagen de entrada. Un conector cross-modal ligero reduce la dimensionalidad de los tokens visuales mediante downsampling eficiente, y un decoder de lenguaje GLM-0.5B genera el texto de salida. El entrenamiento original incorpora dos innovaciones: una pérdida de Multi-Token Prediction (MTP) que mejora la eficiencia del entrenamiento, y un aprendizaje por refuerzo de tarea completa estable que aumenta la precisión y la generalización.

El fine-tune `khourix/glm-OCR-lab-scans` se realizó a partir de `unsloth/GLM-OCR` (una versión optimizada del modelo original) utilizando la librería Unsloth y la biblioteca TRL de Hugging Face. No se especifican en la model card los datos de entrenamiento utilizados para el fine-tune, ni el número de épocas, ni la composición del dataset. Dado el nombre del modelo, se infiere que el conjunto de datos consistía en escaneos de laboratorio, pero esta información no está confirmada.

## Capacidades

- OCR de documentos complejos: transcribe texto de imágenes de documentos, incluyendo escaneos de laboratorio, informes, etiquetas y formularios.
- Comprensión de diseño: al estar basado en GLM-OCR, puede manejar documentos con tablas, columnas, texto manuscrito y elementos gráficos.
- Conversacional: el tag `conversational` sugiere que puede mantener diálogos sobre el contenido de las imágenes, aunque su función principal es la transcripción.
- Multimodal: acepta entrada de imagen y genera texto, sin necesidad de un pipeline OCR separado.
- Eficiencia computacional: con 1,3 B parámetros, es ligero en comparación con modelos multimodales más grandes, lo que facilita su despliegue en hardware moderado.

## Casos de uso

- Digitalización de informes de laboratorio: el modelo puede transcribir automáticamente resultados de análisis clínicos o de investigación a partir de escaneos, eliminando la entrada manual de datos.
- Extracción de datos de etiquetas de muestras: en biobancos o laboratorios de alta rotación, el modelo puede leer etiquetas con códigos, fechas y nombres, integrándose en sistemas de gestión de inventario.
- Procesamiento de formularios de laboratorio: formularios de solicitud de pruebas, hojas de registro de experimentos o protocolos pueden ser digitalizados y convertidos a texto estructurado.
- Integración en sistemas LIMS (Laboratory Information Management System): el modelo puede conectarse a un pipeline de procesamiento de imágenes para alimentar automáticamente bases de datos de laboratorio.
- Archivado de documentos científicos: escaneos de cuadernos de laboratorio, publicaciones antiguas o registros históricos pueden convertirse a texto buscable.
- Automatización de entrada de datos en investigación biomédica: en ensayos clínicos o estudios de campo, el modelo puede transcribir formularios en papel a formato digital, reduciendo errores y tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base GLM-OCR reporta mejoras en precisión y velocidad frente a otros modelos OCR, pero no se dispone de cifras concretas para esta versión fine-tuneada. Se recomienda evaluar el modelo en un conjunto de validación propio antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,3 B parámetros en fp16, los pesos ocupan aproximadamente 2,6 GB. Con overhead de activaciones y memoria del runtime, se estima un consumo de 4-6 GB de VRAM. Con cuantización a 4 bits (no confirmada para este modelo), podría reducirse a ~1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100. En CPU es posible pero con latencia alta.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de gama media y alta.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI) o directamente con la librería transformers. El tag `endpoints_compatible` sugiere compatibilidad con soluciones de inferencia gestionada.
- Latencia y throughput: no disponible. Dado el tamaño, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| khourix/glm-OCR-lab-scans | 1,3 B | no disponible | OCR de laboratorio | Apache 2.0 |
| zai-org/GLM-OCR | 1,3 B | no disponible | OCR general de documentos | Apache 2.0 |
| PaddleOCR (PP-OCRv4) | ~10 M (detector) + ~100 M (reconocedor) | no aplica | OCR tradicional, no multimodal | Apache 2.0 |
| Qwen2-VL-2B | 2 B | 128 K tokens | Multimodal general, incluye OCR | Apache 2.0 |

La comparativa es cualitativa: GLM-OCR y su fine-tune son modelos multimodales específicos para OCR, mientras que PaddleOCR es un sistema clásico de detección y reconocimiento de texto, y Qwen2-VL es un modelo multimodal general con capacidades OCR. No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card indica únicamente inglés. El modelo puede no funcionar bien con documentos en otros idiomas, aunque GLM-OCR original podría tener soporte multilingüe no confirmado.
- Especialización: al ser un fine-tune para escaneos de laboratorio, su rendimiento en otros tipos de documentos (facturas, periódicos, etc.) puede ser inferior al del modelo base.
- Sin datos de evaluación: no hay benchmarks publicados para este fine-tune, por lo que su precisión real es desconocida. Se recomienda validación externa.
- Riesgo de alucinación: como modelo generativo, puede producir texto plausible pero incorrecto en caracteres ambiguos o regiones dañadas de la imagen.
- Fecha de creación: el modelo fue subido en agosto de 2026, lo que sugiere que es reciente y puede tener soporte limitado de la comunidad.
- Dependencia del modelo base: cualquier limitación de GLM-OCR (por ejemplo, en la resolución de imagen soportada) se hereda en este fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khourix/glm-OCR-lab-scans
- Repositorio oficial de GLM-OCR: https://github.com/zai-org/GLM-OCR
- Documentación de transformers para GLM-OCR: https://huggingface.co/docs/transformers/v5.14.0/model_doc/glm_ocr
- Página del proyecto GLM-OCR: https://glmocr.com/
- Repositorio espejo de GLM-OCR: https://github.com/aeternumlab/glm-ocr
