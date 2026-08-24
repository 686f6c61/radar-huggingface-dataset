# numind/NuExtract3

## Resumen

NuExtract3 es un modelo vision-language (VLM) de 4 000 millones de parámetros desarrollado por Numind, especializado en comprensión de documentos. Combina dos capacidades principales: extracción estructurada de información (a partir de texto, imágenes o ambas) y conversión de imágenes de documentos a Markdown. Está construido sobre el modelo base Qwen/Qwen3.5-4B, al que se ha ajustado mediante fine-tuning para tareas de extracción y OCR.

El modelo está pensado para pipelines de extracción de datos, preprocesado para RAG y automatización de documentos (escaneos, recibos, formularios, facturas, contratos o tablas). Soporta entrada multimodal (texto, imágenes o texto e imágenes combinadas), documentos multilingües y modos de razonamiento activable o desactivable. Se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribución.

La relevancia actual de NuExtract reside en su tamaño compacto (4B) combinado con un rendimiento competitivo en benchmarks de extracción estructurada: supera a modelos más grandes como Qwen3.5-9B en el benchmark interno de Numind, lo que lo convierte en una opción atractiva para despliegues en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basado en Qwen/Qwen3.5-4B (fine-tuning) |
| Parametros totales | 4 539 265 536 (4,54 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el benchmark interno usa hasta 65 000 tokens de salida, incluyendo razonamiento) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; se espera compatibilidad con cuantizaciones estándar como GGUF o AWQ, pero no se documenta) |
| Idiomas soportados | Multilingue (sin lista oficial de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien compatible con transformers) |

## Arquitectura y entrenamiento

NuExtract es un modelo vision-language construido sobre Qwen3.5-4B, al que se ha aplicado un fine-tuning específico para tareas de comprensión de documentos. La arquitectura base es un transformer multimodal con codificador visual, aunque los detalles concretos de la capa de visión (p. ej., número de parches, resolución de imagen) no se documentan en la información disponible. El modelo soporta entradas de texto, imágenes o combinación de ambas, y puede generar salidas JSON estructuradas o Markdown.

El entrenamiento se realizó mediante fine-tuning (se indica el tag `finetune:Qwen/Qwen3.5-4B`), pero no se publican detalles sobre el dataset, el número de tokens de entrenamiento ni si se usaron técnicas de RLHF o DPO. El modelo está disponible en dos variantes según el benchmark: una versión con RL (reinforcement learning) y otra sin él. La versión con RL (`NuExtract3.4_4B-RL`) muestra mejor rendimiento en extracción estructurada. El modelo soporta un modo de razonamiento (thinking) activable o desactivable, lo que permite adaptar el coste de inferencia según la tarea.

## Capacidades

- Extracción estructurada de información: entrada compuesta por texto/imágenes, plantilla JSON e instrucciones, salida en JSON.
- Conversión de imágenes de documentos a Markdown: genera texto con formato, tablas en HTML, fórmulas en LaTeX y figuras con descripciones detalladas.
- Entrada multimodal: acepta texto, imágenes o ambas de forma simultánea.
- Razonamiento (thinking mode): soporta modos de razonamiento activo y no activo, útil para tareas complejas de extracción.
- Generación de plantillas: puede generar plantillas JSON para extracción estructurada a partir de lenguaje natural o del documento de entrada.
- Comprensión de documentos diversos: escaneos, recibos, formularios, facturas, contratos, tablas, carteles de películas y planos de planta.
- Capacidades multilingües: el modelo está diseñado para documentos en varios idiomas, aunque no se especifica la lista concreta.
- Soporte de tool calling y agentes: no se documenta explícitamente en la información disponible.

## Casos de uso

- Automatización de extracción de datos en facturas: el modelo puede extraer campos estructurados (número de factura, importes, fechas) a partir de imágenes escaneadas, integrándose en pipelines de contabilidad o ERP.
- Preprocesado de documentos para RAG: convierte documentos escaneados o con formato complejo en Markdown limpio, mejorando la calidad de los chunks y la recuperación en sistemas de búsqueda semántica.
- Digitalización de formularios y contratos: extrae campos clave de formularios manuscritos o impresos, reduciendo la entrada manual de datos en procesos de onboarding o cumplimiento normativo.
- Análisis de recibos y gastos: procesa imágenes de recibos de forma masiva para extraer proveedor, importe, fecha y categoría, útil en aplicaciones de gestión de gastos.
- Extracción de datos de tablas complejas: convierte tablas de documentos escaneados a HTML o Markdown estructurado, facilitando su posterior análisis en hojas de cálculo o bases de datos.
- Generación de plantillas JSON a partir de descripciones: el modelo puede crear plantillas de extracción automáticamente a partir de instrucciones en lenguaje natural, agilizando la configuración de pipelines de extracción.
- OCR multilingüe para documentos internacionales: al soportar documentos multilingües, es adecuado para empresas con operaciones en varios países que necesitan extraer datos de documentos en distintos idiomas.

## Benchmarks y rendimiento

Se han publicado resultados del benchmark interno de Numind sobre extracción estructurada, que evalúa ~600 documentos de diversos tipos (facturas, carteles de cine, planos de planta). La métrica combina distancia indel para hojas de tipo string y exact-match para el resto. Los resultados se obtuvieron con vLLM, temperatura 0.25 y máximo de 65 000 tokens de salida.

| Modelo | Puntuacion media | Fallos de JSON | Tokens de razonamiento (media) | Tokens de respuesta (media) |
|---|---|---|---|---|
| NuExtract3.4_4B-RL | **0.651 ± 0.019** | 27 | 2036 | 1856 |
| gemma-4-E4B-it | 0.538 ± 0.023 | 31 | 3005 | 1287 |
| Qwen3.5-9B | 0.479 ± 0.030 | 170 | 22409 | 1257 |
| Qwen3.5-4B | 0.417 ± 0.031 | 229 | 27177 | 1201 |
| GLM-4.6V-Flash | 0.435 ± 0.026 | 153 | 2989 | 1357 |
| Nemotron-3-Nano-Omni | 0.387 ± 0.028 | 204 | 25827 | 522 |
| Ministral-3-3B | 0.240 ± 0.022 | 344 | 27586 | 362 |

Para la conversión documento a Markdown, se evaluaron 100 documentos con layouts complejos, usando Gemini 3 Flash como evaluador comparativo. Los resultados preliminares (imagen `ocr_preferences.svg`) indican preferencias favorables hacia NuExtract, aunque no se publican cifras numéricas concretas. El autor indica que se publicará un informe técnico con más detalles.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Con 4,54 B parámetros, una estimación razonable para FP16 sería ~9 GB (coincide con el tamaño del repo de 9.3 GB), y para cuantización INT8 ~4.5-5 GB, pero esto no se confirma oficialmente.
- GPU recomendadas: no disponible. Dado el tamaño, cabría en GPUs consumer de 12 GB o más (RTX 3060, RTX 4070, etc.) con cuantización, y en GPUs de datacenter como A100 o H100 sin problema.
- Compatibilidad con consumer GPU: probablemente sí, con cuantización adecuada (GGUF, AWQ), aunque no se documenta oficialmente.
- Opciones de despliegue: se menciona compatibilidad con vLLM en el benchmark (los resultados se obtuvieron con vLLM). También es compatible con la librería transformers. No se mencionan llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La siguiente tabla compara NuExtract3 con otros modelos de tamaño similar evaluados en el benchmark de extracción estructurada de Numind:

| Modelo | Parametros | Puntuacion media (extraccion) | Licencia | Disponibilidad |
|---|---|---|---|---|
| NuExtract3.4_4B-RL | 4,54 B | **0.651 ± 0.019** | Apache 2.0 | Open weights (Hugging Face) |
| gemma-4-E4B-it | ~4 B (estimado) | 0.538 ± 0.023 | no disponible | Open weights (Google) |
| Qwen3.5-4B | 4 B | 0.417 ± 0.031 | no disponible | Open weights (Alibaba) |
| Qwen3.5-9B | 9 B | 0.479 ± 0.030 | no disponible | Open weights (Alibaba) |
| Ministral-3-3B | 3 B | 0.240 ± 0.022 | no disponible | Open weights (Mistral) |

NuExtract3 supera a modelos de tamaño similar y superior en extracción estructurada, con una ventaja significativa sobre el modelo base Qwen3.5-4B (0.651 vs 0.417). Además, muestra menos fallos de salida JSON (27 frente a 229 del base), lo que indica mayor robustez en producción.

## Limitaciones y advertencias

- El benchmark de extracción estructurada es interno y no se ha publicado el dataset ni el código de evaluación completo (el autor indica que se publicará próximamente), lo que limita la reproducibilidad.
- La evaluación de conversión a Markdown usa un evaluador externo (Gemini 3 Flash) y no se publican cifras numéricas, solo preferencias relativas.
- No se documentan sesgos específicos ni riesgos de alucinación. Como modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en documentos ambiguos o dañados.
- La longitud de contexto exacta no se especifica oficialmente, aunque el benchmark usa hasta 65 000 tokens de salida. Los usuarios deben verificar el límite real antes de usarlo en producción.
- No se documentan los idiomas soportados de forma oficial; aunque el modelo es multilingüe, el rendimiento puede variar según el idioma.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el uso cumple con los términos de la licencia del modelo base (Qwen3.5-4B), que también debe ser compatible.
- El modelo se ha creado en 2026, por lo que la información sobre hardware y cuantización puede estar desactualizada o incompleta.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/numind/NuExtract3
- Espacio de demostración en Hugging Face: https://huggingface.co/spaces/numind/NuExtract3
- Plataforma NuExtract (API y despliegue): https://nuextract.ai/
- Blog de Numind: https://numind.ai/blog
- Repositorio GitHub de NuExtract: https://github.com/numindai/nuextract
- Discord de NuMind: https://discord.gg/3tsEtJNCDe
