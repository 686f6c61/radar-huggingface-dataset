# mradermacher/QGO-8B-GGUF

## Resumen

QGO-8B-GGUF es la versión cuantizada en formato GGUF del modelo QGO-8B, un modelo de visión y lenguaje (vision-language) desarrollado por DatasetMan y basado en la arquitectura Qwen3-VL. El modelo original ha sido afinado mediante GRPO (Group Relative Policy Optimization) sobre el dataset PM4Bench-QGO-Train, orientado a tareas de OCR y razonamiento multimodal. Esta variante GGUF, creada por mradermacher, ofrece una amplia gama de cuantizaciones (desde Q2_K hasta f16) para facilitar su despliegue en entornos locales con recursos limitados.

El modelo tiene aproximadamente 8,19 mil millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Aunque la model card indica el inglés como idioma principal, el modelo hereda capacidades multilingües de su base Qwen3-VL. La cuantización GGUF permite su ejecución con herramientas como llama.cpp, Ollama o LM Studio, con opciones que van desde los 3,4 GB hasta los 16,5 GB de tamaño.

Esta ficha se centra en la versión GGUF, que es la más práctica para uso local. No se han encontrado datos públicos sobre benchmarks o rendimiento específico de este modelo, por lo que las secciones correspondientes indican esa ausencia de información.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (según model card; el modelo base es multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

QGO-8B es un modelo de visión-lenguaje basado en Qwen3-VL, una arquitectura transformer multimodal que procesa tanto texto como imágenes. El modelo original fue afinado con el dataset PM4Bench-QGO-Train utilizando GRPO, una técnica de optimización de políticas por refuerzo que mejora la capacidad de razonamiento y la precisión en tareas de OCR y comprensión visual. No se dispone de detalles sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset.

La versión GGUF es una cuantización estática realizada por mradermacher, que convierte los pesos originales en formato safetensors a GGUF con distintas precisiones (desde 2 bits hasta 16 bits). No se ha aplicado una cuantización con imatrix ni se ha realizado un ajuste de pesos posterior a la cuantización. El modelo incluye además un archivo mmproj (multi-modal projection) en Q8_0 y f16, necesario para el procesamiento de imágenes en GGUF.

## Capacidades

- Procesamiento de imágenes y texto combinados (visión-lenguaje), incluyendo entrada de imágenes y generación de respuestas en lenguaje natural.
- OCR (reconocimiento óptico de caracteres): el modelo está afinado para extraer texto de imágenes y documentos escaneados.
- Razonamiento multimodal: capaz de responder preguntas sobre el contenido visual de una imagen.
- Capacidades multilingües heredadas de Qwen3-VL, aunque la model card específica inglés como idioma principal.
- Generación de texto en lenguaje natural con comprensión del contexto visual.
- No se indica soporte para tool calling, agentes o razonamiento multi-paso explícito, aunque la arquitectura Qwen3-VL puede permitirlo (no confirmado para este modelo).

## Casos de uso

- Digitalización de documentos: el modelo puede extraer texto de facturas, recibos o formularios escaneados y convertirlo en datos estructurados. Su capacidad OCR y su tamaño compacto permiten ejecutarlo en equipos de gama media para automatizar la entrada de datos.
- Descripción de imágenes para accesibilidad: generar descripciones automáticas de imágenes en entornos de asistencia a personas con discapacidad visual, usando cuantizaciones Q4_K_M para correr en portátiles con 8 GB de RAM.
- Asistencia en atención al cliente: responder a consultas que incluyen capturas de pantalla o fotos de productos, integrado en un chatbot local con llama.cpp o Ollama.
- Análisis de imágenes médicas básicas: aunque no es un modelo especializado, puede ayudar a transcribir y resumir informes con imágenes (radiografías, ecografías) en entornos de investigación con datos no sensibles.
- Educación y tutoría: generar explicaciones a partir de imágenes de diagramas o ecuaciones en material didáctico, desplegado en un servidor local con vLLM para uso en aulas.
- Archivado y búsqueda: indexar archivos de imágenes escaneadas (libros, periódicos) generando metadatos textuales que permitan búsquedas posteriores, usando la versión f16 en un servidor con GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento (MMLU, HumanEval, GSM8K, etc.) para este modelo específico ni para su base QGO-8B.

## Requisitos de hardware

- La cuantización Q4_K_M (5,1 GB) se puede ejecutar en una GPU con 8 GB de VRAM (ej. RTX 3060, RTX 4060) o incluso en CPU con 16 GB de RAM usando llama.cpp con offloading.
- Q2_K (3,4 GB) es viable en GPU de 6 GB (ej. GTX 1660) o en sistemas con poca memoria.
- Q8_0 (8,8 GB) requiere una GPU con 12 GB de VRAM (ej. RTX 3080, RTX 4070 Ti) o más.
- f16 (16,5 GB) necesita una GPU de 24 GB (ej. RTX 4090, A100) o ejecución en CPU con suficiente RAM.
- Para despliegue en producción, se recomienda vLLM (aunque requiere formato safetensors, no GGUF) o llama.cpp/Ollama para GGUF.
- La latencia y el throughput dependen del hardware; en una RTX 4090 con Q4_K_M se esperan decenas de tokens por segundo para generación de texto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, se pueden señalar alternativas de la misma categoría (modelos vision-language de 8B):

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QGO-8B (GGUF) | 8,19 B | no disponible | Apache 2.0 | GGUF |
| Qwen2-VL-7B | 7,6 B | 32K | Apache 2.0 | safetensors, GGUF |
| LLaVA-1.6-7B | 7 B | 4K | Apache 2.0 | safetensors, GGUF |

No se conocen comparativas de rendimiento directas entre estos modelos. La ventaja de QGO-8B reside en su afinamiento específico para OCR y su licencia permisiva.

## Limitaciones y advertencias

- No hay información pública sobre sesgos específicos, pero al ser un modelo basado en Qwen3-VL, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación visual: puede generar descripciones incorrectas de imágenes, especialmente en cuantizaciones de baja precisión (Q2_K, Q3_K).
- La model card indica que el idioma principal es inglés; aunque el modelo es multilingüe, su rendimiento en otros idiomas no está documentado.
- No se ha confirmado el soporte de tool calling o function calling, lo que limita su uso en pipelines de agentes complejos.
- La cuantización estática puede degradar la calidad de salida en comparación con el modelo original; se recomienda probar varias cuantizaciones para el caso de uso.
- Para uso en producción, es necesario validar la calidad de las respuestas en el dominio concreto, ya que no hay benchmarks públicos.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/QGO-8B-GGUF)
- [Modelo base QGO-8B (safetensors)](https://huggingface.co/DatasetMan/QGO-8B)
- [Dataset PM4Bench-QGO-Train](https://huggingface.co/datasets/DatasetMan/PM4Bench-QGO-Train)
- [Página de mradermacher con todos sus modelos](https://huggingface.co/mradermacher/models)
- [Guía de uso de GGUF de TheBloke (referencia)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
