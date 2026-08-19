# neuralforgequantum/NuExtract3

## Resumen

NuExtract3 es un modelo de visión-lenguaje (VLM) de 4 mil millones de parámetros desarrollado por NuMind, especializado en comprensión de documentos. Unifica dos tareas clave en un solo modelo: la extracción estructurada de información (documentos a JSON) y la conversión de imágenes de documentos a Markdown (OCR semántico). Está construido sobre la base de Qwen/Qwen3.5-4B y ha sido entrenado mediante aprendizaje por refuerzo (RL) para desarrollar habilidades de razonamiento específicas para extracción, que pueden activarse o desactivarse según la necesidad.

El modelo acepta entradas multimodales (texto, imágenes o ambas) y es capaz de procesar documentos multilingües, incluyendo escaneos, facturas, formularios, contratos, tablas y planos. Su relevancia actual radica en que combina en un solo peso de 4B capacidades que normalmente requieren modelos mucho más grandes o pipelines separados de OCR y extracción, lo que lo hace atractivo para despliegues en producción con requisitos de hardware moderados. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basado en Qwen/Qwen3.5-4B (transformer decoder con módulo de visión) |
| Parametros totales | 4.539.265.536 (~4,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (se esperan versiones GGUF/AWQ de la comunidad) |
| Idiomas soportados | Multilingue (no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NuExtract3 parte del modelo base Qwen3.5-4B, un transformer decoder con capacidades multimodales (visión y lenguaje). Sobre esta base, NuMind ha aplicado un entrenamiento específico mediante aprendizaje por refuerzo (RL) orientado a desarrollar habilidades de razonamiento para tareas de extracción de documentos. Este entrenamiento permite al modelo generar cadenas de razonamiento internas antes de producir la salida final, un modo que puede activarse o desactivarse según el caso de uso.

La innovación principal es la unificación de dos tareas en un único modelo: extracción estructurada (entrada de texto/imágenes + plantilla JSON + instrucciones → JSON) y conversión de documentos a Markdown (entrada de texto/imágenes → Markdown con HTML para tablas, LaTeX para fórmulas y figuras con descripciones). El modelo también es capaz de generar plantillas de extracción a partir de lenguaje natural o del propio documento de entrada. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Extracción estructurada de información: recibe una plantilla JSON y devuelve un JSON rellenado con los datos extraídos del documento.
- Conversión de imagen a Markdown: genera Markdown limpio con encabezados, tablas en HTML, fórmulas en LaTeX y figuras con descripciones detalladas.
- Entrada multimodal: acepta texto, imágenes o combinación de ambos en una misma consulta.
- Razonamiento opcional: modo "thinking" que mejora la precisión en tareas complejas, activable o desactivable según necesidad.
- Generación de plantillas: crea plantillas de extracción a partir de lenguaje natural o del propio documento.
- Procesamiento multilingüe: soporta documentos en varios idiomas.
- Manejo de documentos complejos: facturas, recibos, formularios, contratos, tablas, planos, carteles de películas, etc.
- Compatible con pipelines de RAG: puede preprocesar documentos convirtiéndolos a Markdown para indexación.

## Casos de uso

- Automatización de facturación: extraer campos como número de factura, fecha, importe total, IVA y datos del proveedor desde facturas escaneadas o PDF, alimentando directamente un sistema contable mediante la plantilla JSON.
- Procesamiento de contratos legales: identificar cláusulas clave, fechas, partes firmantes y condiciones específicas en contratos extensos, reduciendo el tiempo de revisión manual.
- Preprocesamiento para RAG: convertir documentos heterogéneos (escaneos, tablas, formularios) a Markdown estructurado antes de indexarlos en una base vectorial, mejorando la calidad de las respuestas del sistema de recuperación.
- Digitalización de formularios administrativos: extraer datos de formularios manuscritos o impresos (nombre, DNI, dirección, etc.) en lotes, con salida JSON lista para integración en bases de datos.
- OCR inteligente para archivado: transformar recibos y tickets de compra en Markdown o JSON para sistemas de gestión de gastos, con detección de proveedor, fecha y categoría.
- Extracción de datos de planos y diagramas: interpretar información visual de planos de planta o diagramas técnicos y devolver estructuras JSON con las dimensiones o elementos identificados.
- Generación de contenido accesible: convertir documentos escaneados en Markdown para su publicación web o para lectores de pantalla, preservando la estructura jerárquica y las tablas.

## Benchmarks y rendimiento

NuMind ha publicado resultados en su benchmark interno de extracción estructurada, que evalúa ~600 documentos de tipos diversos (facturas, carteles de películas, planos) con métricas de similitud de árboles JSON (indel distance para strings, exact-match para otros tipos). Los resultados se muestran a continuación:

| Modelo | Puntuacion media | Fallos¹ | Tokens thinking (media) | Tokens respuesta (media) |
|---|---|---|---|---|
| NuExtract3.4_4B-RL | **0,651 ± 0,019** | 27 | 2036 | 1856 |
| gemma-4-E4B-it | 0,538 ± 0,023 | 31 | 3005 | 1287 |
| Qwen3.5-9B | 0,479 ± 0,030 | 170 | 22409 | 1257 |
| Qwen3.5-4B | 0,417 ± 0,031 | 229 | 27177 | 1201 |
| GLM-4.6V-Flash | 0,435 ± 0,026 | 153 | 2989 | 1357 |
| Nemotron-3-Nano-Omni | 0,387 ± 0,028 | 204 | 25827 | 522 |
| Ministral-3-3B | 0,240 ± 0,022 | 344 | 27586 | 362 |

¹ Número de salidas no deserializables como JSON.

Para la conversión documento a Markdown, NuMind utilizó un método de evaluación con 100 documentos de diseño complejo, comparando las salidas de cada modelo mediante Gemini 3 Flash. Los resultados se alinearon con votos humanos, pero no se han publicado puntuaciones numéricas detalladas. No se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4,5B en fp16 se necesitan aproximadamente 9-10 GB de VRAM. Con cuantización de 4 bits (si la comunidad la publica), podría reducirse a ~3-4 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para fp16 con margen; A10/A100 para despliegue en servidor; GPUs consumer de 8-12 GB podrían funcionar con cuantización.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización de 4 u 8 bits.
- Opciones de despliegue: vLLM (usado en los benchmarks), Transformers con `pipeline("image-to-text")`, y potencialmente llama.cpp/Ollama cuando haya versiones GGUF.
- Latencia y throughput: no se han publicado datos oficiales. La evaluación se realizó con vLLM y temperatura 0,25, con un máximo de 65000 tokens de salida (pensamiento + respuesta). El modo de razonamiento aumenta la latencia (media de 2036 tokens de thinking), pero puede desactivarse para tareas simples.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion extraccion¹ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NuExtract3 (4B) | 4,5B | No disponible | 0,651 | Apache 2.0 | HuggingFace, API |
| gemma-4-E4B-it | ~4B | No disponible | 0,538 | Gemma license | HuggingFace |
| Qwen3.5-4B | 4,5B | No disponible | 0,417 | Apache 2.0 | HuggingFace |
| Qwen3.5-9B | 9B | No disponible | 0,479 | Apache 2.0 | HuggingFace |
| GLM-4.6V-Flash | No disponible | No disponible | 0,435 | Propietaria (API) | API |
| Ministral-3-3B | 3B | No disponible | 0,240 | Mistral license | HuggingFace |

¹ Puntuación media en el benchmark interno de extracción estructurada de NuMind (mayor es mejor).

NuExtract3 supera claramente a modelos de tamaño similar y incluso a Qwen3.5-9B en extracción estructurada, con un número de fallos de deserialización mucho menor. Su licencia Apache 2.0 lo hace más permisivo que gemma-4 (licencia Gemma con restricciones) y que los modelos propietarios.

## Limitaciones y advertencias

- No se han publicado limitaciones específicas del modelo en la información disponible. Sin embargo, como VLM de 4B, es esperable que tenga limitaciones en razonamiento complejo de largo alcance comparado con modelos de mayor tamaño.
- Riesgo de alucinación en la extracción de campos ambiguos o ilegibles en documentos de baja calidad.
- El modo de razonamiento puede caer en bucles de repetición en algunos casos, como se observa en los fallos de otros modelos del benchmark (aunque NuExtract3 tiene una tasa de fallos baja, 27 de ~600).
- No se especifican los idiomas concretos soportados; aunque se indica "multilingue", el rendimiento puede variar según el idioma.
- La longitud de contexto no está documentada, lo que puede suponer un riesgo para documentos muy extensos.
- No hay versiones cuantizadas oficiales publicadas; el despliegue en hardware limitado requiere cuantización manual o esperar a la comunidad.
- El benchmark de extracción es interno de NuMind y no ha sido auditado externamente; los resultados deben interpretarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/numind/NuExtract3
- Espacio de demostración: https://huggingface.co/spaces/numind/NuExtract-3-4B
- Blog de lanzamiento: https://about.nuextract.ai/blog/nuextract-3-release
- Repositorio GitHub: https://github.com/numindai/nuextract
- Plataforma/API: https://nuextract.ai/
