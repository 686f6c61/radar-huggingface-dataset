# DavidAU/Qwen3.5-27B-HERETIC-Polaris-Advanced-Thinking-Alpha-uncensored

## Resumen

Qwen3.5-27B-HERETIC-Polaris-Advanced-Thinking-Alpha-uncensored es un ajuste fino (fine-tune) del modelo denso Qwen3.5-27B, desarrollado por el usuario DavidAU y publicado en Hugging Face. El modelo parte de la variante "heretic" de coder3101/Qwen3.5-27B-heretic, que a su vez deriva del Qwen3.5-27B original de Alibaba, y ha sido entrenado con el dataset de destilación Polaris (TeichAI/polaris-alpha-1000x) mediante Unsloth en hardware local. El objetivo declarado es doble: reforzar las capacidades de escritura creativa y narrativa, y eliminar los mecanismos de rechazo del modelo base.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una arquitectura híbrida de última generación (Gated DeltaNet más atención con compuertas, con 64 capas y 262.144 tokens de contexto nativo), un proceso de "abliteration" que reduce drásticamente las negativas del modelo (de 94/100 a 14/100 según la model card) y un ajuste específico para ficción, roleplay y generación de tramas. El autor advierte que se trata de una versión "alpha" por las peculiaridades de la nueva arquitectura y por posibles problemas de compatibilidad con transformers.

El modelo conserva la torre de visión del Qwen3.5 original y, según el autor, las imágenes funcionan tras el reentrenamiento, aunque las capacidades de vídeo no se han probado. Con 27.356.728.560 parámetros reales en safetensors y un repositorio de 54,7 GB en bfloat16, está pensado para despliegues con cuantización agresiva (q4ks o IQ3S como mínimo recomendado) y no para ejecución en precisión completa sobre GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder: Gated DeltaNet (atención lineal) combinada con Gated Attention, layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo (256k por defecto según el autor) |
| Tipos de cuantizacion | bfloat16 en el repo; el autor recomienda q4ks (sin imatrix) o IQ3S (con imatrix) como mínimo |
| Idiomas soportados | en, zh (etiquetados en el repo); el modelo base Qwen3.5 declara soporte de 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM, SGLang y KTransformers según el modelo base |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5, que combina capas de Gated DeltaNet (atención lineal con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128) con capas de Gated Attention convencional (24 cabezas para Q y 4 para KV, dimensión 256, RoPE de 64 dimensiones). La dimensión oculta es 5120, el FFN intermedio 17408, el embedding y la salida 248.320 tokens (con padding) y el modelo incorpora entrenamiento con multi-token prediction (MTP). El preentrenamiento y postentrenamiento del base incluyen fusión temprana multimodal, RL a gran escala sobre entornos multiagente y entrenamiento asíncrono.

El fine-tune de DavidAU se realizó con Unsloth sobre el checkpoint "heretic" de coder3101, usando el dataset TeichAI/polaris-alpha-1000x. Según la model card, el entrenamiento se diseñó para ser "suave" y no degradar los benchmarks del base, y se modificó el bloque de razonamiento (thinking) tanto en contenido como en tamaño, reduciéndolo en algunos casos. El proceso de "hereticación" previo reduce los rechazos: la model card reporta 14/100 negativas frente a 94/100 del Qwen3.5-27B original, con una divergencia KL de 0,0653 respecto al base. No se detallan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO en esta fase.

## Capacidades

- Generación de texto y razonamiento con bloque de "thinking" explícito, modificado y en ocasiones acortado respecto al base.
- Escritura creativa y de ficción: tramas, subtramas, continuación de escenas, prosa vívida, todos los géneros (ciencia ficción, romance, etc.) y roleplay.
- Comprensión de imágenes (image-text-to-text): el autor confirma que la visión funciona tras el reentrenamiento; el vídeo no se ha probado.
- Capacidades multilingües heredadas del base (201 idiomas declarados por Qwen), aunque el repo solo etiqueta en y zh.
- Conversación multi-turno y uso conversacional general ("all use cases" según los tags).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso agéntico en esta ficha; el modelo base Qwen3.5 sí declara capacidades de agentes, pero no hay confirmación específica para este fine-tune.
- Modo "sin rechazos": el proceso heretic/abliterated reduce las negativas del modelo a peticiones que el base rechazaría.

## Casos de uso

- Generación de ficción y novelas por capítulos: el ajuste sobre Polaris y las etiquetas de "story generation" y "scene continue" lo orientan a producir tramas coherentes y prosa detallada; su contexto de 262.144 tokens permite mantener arcos narrativos largos sin perder continuidad.
- Roleplay y personajes persistentes: la combinación de contexto largo y ausencia de rechazos permite mantener personajes con trasfondo extenso y diálogos multi-turno sin que el modelo rompa el personaje por filtros de seguridad.
- Continuación de escenas y reescritura creativa: útil en herramientas de asistencia a guionistas y autores que necesitan generar variantes de una escena manteniendo tono y estilo, con control mediante prompts de sistema.
- Generación de subtramas y tramas alternativas: el modelo puede producir múltiples líneas argumentales a partir de un esquema, aprovechando el entrenamiento específico en plot y sub-plot generation.
- Asistente de escritura con entrada multimodal: al conservar la torre de visión, puede describir una imagen o ilustración y generar texto narrativo a partir de ella, útil para storyboards o libros ilustrados.
- Investigación sobre alineación y seguridad: con una tasa de rechazos de 14/100 frente a 94/100 del base y una KL de 0,0653, sirve como caso de estudio para medir el efecto del abliteration sobre el comportamiento y los benchmarks.
- Prototipado de chatbots de personaje sin filtros: para entornos controlados donde se requiere un asistente conversacional que no rechace temáticas de ficción adulta o violenta, siempre con las advertencias legales correspondientes.

## Benchmarks y rendimiento

La model card incluye una tabla parcial de benchmarks de conocimiento y sentido común, comparando con el modelo base Qwen3.5-27B-Text-VL qx86-hi. Los valores del modelo aparecen truncados en la información disponible.

| Benchmark | Este modelo | Qwen3.5-27B-Text-VL qx86-hi |
|---|---|---|
| ARC | 0,476 | 0,443 |
| ARC/e | 0,537 | 0,498 |
| BoolQ | 0,694 | 0,857 |
| HellaSwag | no disponible (truncado) | 0,701 |
| OpenBookQA | no disponible (truncado) | 0,372 |
| PIQA | no disponible (truncado) | 0,770 |
| Winogrande | no disponible (truncado) | 0,752 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de razonamiento o código para este fine-tune. La model card también reporta métricas de alineación de seguridad: KL divergence de 0,0653 y 14/100 rechazos, frente a 0 (por definición) y 94/100 del Qwen3.5-27B original.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 54,7 GB solo para pesos, más overhead de activaciones y KV cache; requiere al menos una GPU de 80 GB (A100/H100) para inferencia cómoda.
- Con cuantización q4ks (recomendada por el autor): alrededor de 15-17 GB de pesos, viable en una RTX 4090 (24 GB) o RTX 3090 con contexto moderado; a 262k tokens el KV cache dispara los requisitos.
- Con IQ3S (imatrix): aproximadamente 12-14 GB de pesos, apto para GPU de 16-24 GB, con pérdida de calidad mayor.
- GPU recomendadas: H100 80 GB o A100 80 GB para precisión completa y contexto largo; RTX 4090/3090 para cuantizaciones q4/q3 con contexto reducido.
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang y KTransformers según el modelo base; llama.cpp/Ollama no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles. El autor advierte posibles bucles en el bloque "think", especialmente en versiones MLX y mxfp4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-27B-HERETIC-Polaris (este modelo) | 27,36 B densos | 262.144 | Apache 2.0 | Fine-tune creativo y sin rechazos; visión funcional; estado "alpha" |
| Qwen/Qwen3.5-27B (base) | 27 B densos | 262.144 | Apache 2.0 | Modelo original con alineación completa (94/100 rechazos); referencia de benchmarks |
| coder3101/Qwen3.5-27B-heretic (base directo) | 27 B densos | 262.144 | Apache 2.0 (presumible) | Variante heretic sin el ajuste Polaris; menos orientada a ficción |
| Qwen3-VL (generación anterior) | no disponible | no disponible | Apache 2.0 | Qwen declara que Qwen3.5 supera a Qwen3-VL en razonamiento, código, agentes y visión |

No se dispone de datos suficientes para comparar con modelos de otros fabricantes de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como "alpha" por el propio autor: la nueva arquitectura puede presentar problemas de compatibilidad con transformers y con el entrenamiento.
- Riesgo de bucles en el bloque "think", especialmente en las versiones MLX y mxfp4.
- El bloque de razonamiento se ha modificado y reducido en algunos casos, lo que puede afectar a tareas que requieren cadenas de pensamiento largas.
- El abliteration reduce los rechazos a 14/100, lo que implica que el modelo puede generar contenido dañino, ofensivo o ilegal sin filtros; no es apto para producción orientada al público sin moderación externa.
- Sesgos: no documentados específicamente, pero hereda los del base Qwen3.5 y los del dataset Polaris; no hay evaluación de sesgos en la información disponible.
- Riesgo de alucinación: no cuantificado; los benchmarks parciales muestran una caída notable en BoolQ (0,694 frente a 0,857 del base), lo que sugiere posible degradación en tareas de comprensión y verificación factual.
- Idiomas: el repo solo etiqueta en y zh; el soporte de los 201 idiomas del base no está verificado para este fine-tune.
- Visión: las imágenes funcionan según el autor, pero el vídeo no se ha probado.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede incumplir normativas locales (por ejemplo, en la UE) y las condiciones de uso de las plataformas de despliegue.
- El modelo solo tiene 45 descargas y 22 likes en el momento de la ficha, con pocas validaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-27B-HERETIC-Polaris-Advanced-Thinking-Alpha-uncensored
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Modelo base directo: https://huggingface.co/coder3101/Qwen3.5-27B-heretic
- Modelo original Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/polaris-alpha-1000x
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
