# ahadadada/Ahadadada-Jailbreak-Qwen3.8-Flash-Next-FP8

## Resumen

Ahadadada-Jailbreak-Qwen3.8-Flash-Next-FP8 es un espejo (mirror) del modelo oficial Qwen/Qwen3.8-Flash-Next-FP8, publicado por el usuario ahadadada como parte de un lanzamiento de "jailbreak" sobre el modelo base Qwen3.8-Flash-Next. El objetivo declarado es ofrecer una versión sin restricciones de seguridad del modelo original, manteniendo las mismas capacidades técnicas. El checkpoint contiene 131 archivos safetensors con un peso total de 185,5 GB en cuantización FP8 de grano fino (block size 128), compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

El modelo subyacente, Qwen3.8-Flash-Next, es una arquitectura experimental que servirá de base para Qwen4. Introduce innovaciones como atención híbrida con Gated DeltaNet y Qwen Sparse Attention (QSA), Gated Residual, N-gram Embedding y un esquema de entrenamiento con optimizadores Muon y AdamW. Con 125 mil millones de parámetros totales (6 mil millones activos) más 51 mil millones de embedding por n-gramas y 4 mil millones de MTP, ofrece una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000. Su naturaleza multimodal (image-text-to-text) lo posiciona como una opción relevante para tareas que combinan visión y lenguaje.

La relevancia de esta versión jailbreak radica en que elimina los mecanismos de alineación de seguridad del modelo original, lo que permite explorar comportamientos no censurados. Sin embargo, esto conlleva riesgos importantes de uso indebido, por lo que su empleo debe limitarse a entornos de investigación controlados y con fines legítimos de análisis de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) con MoE |
| Parametros totales | 125B (LM) + 51B (n-gram embedding) + 4B (MTP) = 180B |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | FP8 (grano fino, block size 128) |
| Idiomas soportados | No disponible (el modelo base no especifica lista oficial) |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen) |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next presenta una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención dispersa (Qwen Sparse Attention, QSA). QSA opera a nivel de micro-bloques en lugar de tokens individuales, lo que reduce significativamente la latencia en contextos largos. La configuración incluye 48 capas con un patrón de 12 × (3 × (Gated DeltaNet → MoE) → 1 × (QSA → MoE)). El MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640.

Otra innovación es el Gated Residual, que modula el flujo de información a través de ramas residuales ensanchadas mediante puertas de lectura dependientes de datos y puertas de escritura escalares por rama. El N-gram Embedding indexa con bigramas y trigramas en la capa 2, permitiendo escalar parámetros de forma eficiente sin aumentar el coste computacional. El entrenamiento utiliza los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, eliminando el warmup de batch size y comenzando directamente con el tamaño objetivo, lo que reduce pasos de optimización y permite tasas de aprendizaje mayores.

La versión jailbreak no modifica la arquitectura ni los pesos del modelo base; simplemente elimina o altera los mecanismos de rechazo de contenido dañino durante la post-entrenamiento. El checkpoint FP8 se genera mediante cuantización de grano fino con block size 128, manteniendo métricas de rendimiento casi idénticas al modelo original.

## Capacidades

- Generación de texto y razonamiento complejo en múltiples dominios, incluyendo matemáticas, ciencia y análisis lógico.
- Comprensión y generación de código en diversos lenguajes de programación, con soporte para depuración y refactorización.
- Procesamiento multimodal: acepta entradas de imagen y texto, permitiendo tareas de descripción visual, respuesta a preguntas sobre imágenes y razonamiento visual.
- Soporte de tool calling y function calling, integrable en pipelines de agentes y automatización.
- Capacidad de razonamiento multi-paso y planificación, adecuada para tareas de agente complejas.
- Ventana de contexto muy amplia (262K nativa, hasta 1M), ideal para documentos extensos, conversaciones largas y análisis de código a gran escala.
- Al ser una versión jailbreak, no aplica filtros de seguridad estándar, lo que permite generar contenido que el modelo original rechazaría (riesgo alto de uso indebido).

## Casos de uso

- Investigación en seguridad de IA: analizar el comportamiento de un modelo sin alineación para estudiar vulnerabilidades, sesgos y mecanismos de ataque, contribuyendo al desarrollo de defensas más robustas.
- Generación de código en entornos aislados: aprovechar la capacidad de razonamiento y tool calling para generar, revisar y documentar código en proyectos de software, siempre que se valide la salida manualmente.
- Análisis de documentos extensos: procesar contratos, informes técnicos o bases de conocimiento completas gracias a la ventana de contexto de 262K tokens, extrayendo información relevante y resumiendo contenido.
- Asistencia en investigación académica: explorar hipótesis, redactar borradores de artículos o generar explicaciones de conceptos complejos, con supervisión humana para garantizar precisión.
- Desarrollo de agentes conversacionales para entornos controlados: construir chatbots o asistentes virtuales en sandboxes donde no se requiera moderación de contenido, como simulaciones o pruebas de concepto.
- Evaluación de modelos multimodales: probar la capacidad de comprensión imagen-texto en tareas de captioning, VQA o razonamiento visual, comparando con otros modelos de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión jailbreak en la información disponible. El modelo base Qwen3.8-Flash-Next reporta métricas en su documentación oficial, pero no se incluyen en los datos extraídos. Se recomienda consultar el informe técnico del modelo base para obtener cifras de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa 185,5 GB en disco. Para inferencia, se requiere al menos 2 GPUs con 80 GB de VRAM cada una (p. ej., A100 80GB, H100 80GB) para cargar los pesos completos en memoria.
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB, o GPUs de consumo con 24 GB (RTX 4090) solo si se aplica cuantización adicional (GGUF) o se utiliza offloading a CPU, con penalización de rendimiento.
- No cabe en una GPU de consumo estándar (8-24 GB) sin cuantización agresiva o particionado.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers con soporte FP8. Para cuantizaciones GGUF (próximamente disponibles), se podrá usar llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerá del hardware y del framework de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 180B totales, 6B activos | 262K nativo, 1M extensible | qwen-community-1.0 | Hugging Face |
| Ahadadada-Jailbreak-Qwen3.8-Flash-Next-FP8 | 180B totales, 6B activos | 262K nativo, 1M extensible | qwen-community-1.0 | Hugging Face (mirror) |
| DeepSeek-V3 (referencia) | 671B totales, 37B activos | 128K | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y contexto.

## Limitaciones y advertencias

- Al ser una versión jailbreak, el modelo no cuenta con los mecanismos de seguridad del original, lo que puede generar contenido dañino, ilegal o éticamente cuestionable. Su uso debe restringirse a entornos de investigación con supervisión experta.
- Riesgo elevado de alucinaciones, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no verificada.
- La licencia qwen-community-1.0 permite uso comercial, pero impone restricciones sobre el uso del modelo para fines de seguridad o en aplicaciones de alto riesgo. Se recomienda revisar los términos completos.
- El modelo es un mirror no oficial; no hay garantía de mantenimiento ni soporte por parte de Qwen.
- La cuantización FP8 puede introducir ligeras degradaciones en precisión en comparación con el modelo en BF16, aunque el autor afirma que las métricas son casi idénticas.
- No se especifican los idiomas soportados; el modelo base probablemente cubre múltiples idiomas, pero no hay confirmación oficial.
- El tamaño del checkpoint (185,5 GB) limita su despliegue a infraestructuras con GPUs de alta gama o soluciones de cuantización adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahadadada/Ahadadada-Jailbreak-Qwen3.8-Flash-Next-FP8
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog oficial de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico (PDF): https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
