# aoiandroid/gemma-4-E2B-it-GGUF

## Resumen

Gemma 4 E2B es un modelo multimodal de Google DeepMind, publicado bajo licencia Apache 2.0, que procesa texto, imagen y audio (en las variantes pequeñas) y genera texto. Esta ficha se centra en la versión cuantizada en GGUF publicada por el usuario aoiandroid, basada en el modelo original `google/gemma-4-E2B-it` y generada con la herramienta Unsloth. El modelo está diseñado para ejecutarse en dispositivos de gama alta, portátiles y servidores, ofreciendo un equilibrio entre rendimiento y eficiencia.

La arquitectura combina atención híbrida (ventana deslizante local y atención global) con un diseño denso de 2.300 millones de parámetros efectivos (5.100 millones incluyendo embeddings), una ventana de contexto de 128.000 tokens y soporte nativo para 140 idiomas. Su relevancia actual radica en su capacidad para tareas de razonamiento, generación de código, agentes autónomos y comprensión multimodal, todo ello en un formato optimizado para inferencia local mediante GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window + global) |
| Parametros totales | 4.647.450.147 (según safetensors del repo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0, incluye Q4_K_M, Q5_K_M, Q6_K, Q8_0, entre otros) |
| Idiomas soportados | Más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa con un mecanismo de atención híbrida que intercala capas de atención de ventana deslizante local (512 tokens) con capas de atención global, garantizando que la última capa sea siempre global. Este diseño reduce el coste computacional y la memoria en contextos largos sin sacrificar la comprensión profunda. Las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE) para optimizar la memoria en secuencias extensas.

El modelo incluye un codificador de visión de aproximadamente 150 millones de parámetros y un codificador de audio de unos 300 millones de parámetros. El entrenamiento combina datos multimodales y texto, con ajuste por instrucciones (instruction tuning) y soporte nativo para el rol `system` en el prompt. La versión GGUF ha sido generada con Unsloth, que aplica cuantización dinámica para preservar la calidad en formatos de baja precisión.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (thinking mode).
- Comprensión multimodal: procesa imágenes con resolución y relación de aspecto variables, y audio (nativo en E2B).
- Generación de código y soporte nativo de function calling para agentes autónomos.
- Razonamiento multi-step y soporte de system prompts para conversaciones estructuradas.
- Multilingüe: más de 140 idiomas soportados.
- Optimizado para ejecución en dispositivos locales (portátiles, móviles de gama alta).

## Casos de uso

- Asistentes de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K tokens) y soporte de system prompts para mantener el tono y las políticas de la empresa.
- Generación de código en producción: con function calling nativo, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código en múltiples lenguajes.
- Análisis de documentos multimodales: procesa imágenes, gráficos y texto extraído de PDFs o capturas para resumir informes técnicos o financieros.
- Agentes autónomos de automatización: su capacidad de razonamiento multi-step y tool calling permite construir agentes que planifican y ejecutan tareas complejas (navegación web, APIs, etc.).
- Transcripción y análisis de audio: al soportar entrada de audio, puede transcribir reuniones o generar resúmenes de conversaciones en tiempo real.
- Asistente de estudio multilingüe: con soporte de 140 idiomas, puede ayudar a traducir, explicar conceptos o generar material educativo en diferentes lenguas.
- Despliegue en edge: su tamaño compacto (2.3B efectivos) permite ejecutarlo en portátiles y dispositivos móviles de gama alta para aplicaciones offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de Google DeepMind menciona mejoras en benchmarks de codificación y razonamiento, pero no se incluyen cifras concretas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 4 GB para cuantizaciones Q4_K_M o Q5_K_M, dependiendo de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, Apple Silicon con 8 GB unificados).
- Cabe en GPUs de consumo: sí, en tarjetas de gama media y alta.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI, Unsloth Studio.
- Latencia y throughput: no disponible, pero al ser un modelo de 2.3B efectivos, se espera una generación rápida en hardware moderno (varios cientos de tokens por segundo en GPUs de gama alta).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E2B (este) | 2.3B efectivos (5.1B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF, safetensors |
| Gemma 4 E4B | 4.5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF, safetensors |
| Gemma 3 4B | 4B | 32K | Texto, imagen | Gemma Terms | safetensors, GGUF |
| Qwen 2.5 3B | 3B | 32K | Texto | Apache 2.0 | safetensors, GGUF |

La comparativa muestra que Gemma 4 E2B ofrece una ventana de contexto muy superior (128K) y capacidades multimodales más amplias (audio incluido) frente a alternativas de tamaño similar, con una licencia permisiva Apache 2.0.

## Limitaciones y advertencias

- Sesgos conocidos: como todo modelo entrenado con datos web, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Limitaciones de contexto: aunque soporta 128K tokens, el rendimiento puede degradarse en secuencias muy largas si no se usa la atención global adecuadamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos específicos de Google DeepMind para Gemma 4.
- Caveat de producción: la cuantización GGUF puede reducir ligeramente la calidad en tareas de precisión (matemáticas, razonamiento lógico) comparada con el modelo en 16 bits.

## Enlaces

- Repositorio GGUF: https://huggingface.co/aoiandroid/gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Colección de Gemma 4 de Unsloth: https://huggingface.co/collections/unsloth/gemma-4
- Guía de Gemma 4 de Unsloth: https://docs.unsloth.ai/models/gemma-4
- Blog de lanzamiento de Google: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
