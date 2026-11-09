# DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT

## Resumen

Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT es un ajuste fino (fine-tune) del modelo denso Qwen3.5-9B de Alibaba Qwen, desarrollado por DavidAU mediante Unsloth sobre hardware local. El ajuste utiliza un dataset de destilación a partir de Claude 4.6 y está orientado a escritura creativa, narrativa de ficción, generación de tramas y roleplaying, aunque el autor afirma haber preservado las capacidades del modelo base. El resultado es un modelo de 9.409.813.744 parámetros (aproximadamente 9B) con arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention, más un codificador de visión.

El modelo base Qwen3.5-9B representa la generación Qwen3.5, que integra fusión temprana multimodal, arquitectura híbrida eficiente y cobertura de 201 idiomas y dialectos. La versión ajustada por DavidAU se distribuye con una plantilla Jinja modificada que fuerza el modo "instruct only", es decir, sin modo de razonamiento extendido (thinking). El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000 tokens según el modelo base.

La relevancia de esta ficha radica en que se trata de un fine-tune comunitario de un modelo multimodal reciente, con licencia Apache 2.0, publicado en marzo de 2026 y actualizado en noviembre de 2026. El autor reporta mejoras sustanciales en benchmarks de conocimiento (ARC, HellaSwag, OpenBookQA, PIQA, Winogrande) respecto al modelo base, aunque con una caída notable en BoolQ. El número de descargas (39) y likes (11) indica una adopción todavía muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; capas Gated DeltaNet (atención lineal) intercaladas con capas Gated Attention; FFN densa |
| Parametros totales | 9.409.813.744 (aproximadamente 9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | mxfp8 (usado en benchmarks); el autor sugiere mínimo q4_k_s (no imatrix) o IQ3_S (imatrix); bfloat16 en pesos originales |
| Idiomas soportados | en, zh (según la model card del fine-tune); el modelo base Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); el repo ocupa 18,8 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura causal con codificador de visión y una disposición híbrida de 32 capas: 8 bloques de la forma 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). La dimensión oculta es 4096, con embedding de tokens de 248.320 (padded), FFN de dimensión intermedia 12.288 y salida LM de 248.320. Gated DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. El modelo fue entrenado con multi-step MTP (multi-token prediction). El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000.

El fine-tune de DavidAU se realizó mediante Unsloth sobre el modelo denso Qwen3.5-9B, utilizando un dataset de destilación de Claude 4.6 de gran tamaño, en hardware local. El autor indica que intentó que el entrenamiento fuese "suave" para no degradar los benchmarks del modelo base, y que la visión (imágenes) fue probada y funciona con el nuevo entrenamiento, aunque las porciones de vídeo no se probaron. La plantilla Jinja modificada fuerza el modo instruct, eliminando el modo de razonamiento. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO en el fine-tune; el modelo base Qwen3.5 sí emplea RL a gran escala según su model card.

## Capacidades

- Generación de texto y escritura creativa: ficción, narrativa, generación de tramas y subtramas, continuación de escenas, storytelling y roleplaying, según los tags del autor.
- Razonamiento y conocimiento general: el autor reporta mejoras en ARC, HellaSwag, OpenBookQA, PIQA y Winogrande respecto al modelo base.
- Visión: pipeline image-text-to-text; el autor confirma que las imágenes funcionan tras el fine-tune, aunque no se probaron las capacidades de vídeo.
- Multilingüismo: la model card del fine-tune declara en y zh; el modelo base Qwen3.5 declara 201 idiomas y dialectos, pero no se confirma que el fine-tune preserve esa cobertura.
- Modo instruct: plantilla Jinja modificada que fuerza el modo "instruct only", sin thinking mode.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada para el fine-tune; el modelo base Qwen3.5 declara capacidades de agentes.
- Contexto largo: 262.144 tokens nativos, extensible hasta 1.010.000.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede generar tramas, subtramas y continuaciones de escenas con coherencia en contextos de hasta 262.144 tokens, lo que permite mantener arcos narrativos extensos sin perder referencias anteriores.
- Roleplaying y diálogo de personajes: el ajuste está orientado explícitamente a roleplaying y ficción, por lo que puede usarse en aplicaciones de chat con personajes, manteniendo consistencia de voz y personalidad a lo largo de conversaciones multi-turno.
- Generación de guiones y storyboards: gracias a su capacidad image-text-to-text, puede recibir imágenes de referencia (por ejemplo, bocetos o fotogramas) y generar descripciones narrativas o diálogos asociados.
- Asistencia a escritores y editores: el modelo puede continuar escenas, proponer giros de trama o reescribir pasajes con un estilo vívido, integrándose en herramientas de edición como asistente de generación.
- Análisis y descripción de imágenes con contexto narrativo: al ser multimodal, puede describir imágenes y vincularlas a una narrativa en curso, útil en aplicaciones de documentación visual o creación de contenido multimedia.
- Prototipado de chatbots temáticos: con licencia Apache 2.0 y pesos safetensors compatibles con transformers y vLLM, puede desplegarse en entornos de investigación para experimentar con agentes conversacionales de ficción.
- Investigación en destilación y fine-tuning: al ser un fine-tune comunitario de un modelo multimodal reciente, sirve como caso de estudio para evaluar el impacto de la destilación de Claude 4.6 sobre un modelo Qwen3.5.

## Benchmarks y rendimiento

El autor publica resultados en mxfp8 comparando el fine-tune con el modelo base Qwen3.5-9B. No se proporcionan resultados de MMLU, HumanEval ni GSM8K.

| Benchmark | Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT (mxfp8) | Qwen3.5-9B (mxfp8) |
|---|---|---|
| ARC | 0,574 | 0,417 |
| ARC/e | 0,729 | 0,458 |
| BoolQ | 0,882 | 0,623 |
| HellaSwag | 0,711 | 0,634 |
| OpenBookQA | 0,422 | 0,338 |
| PIQA | 0,775 | 0,737 |
| Winogrande | 0,691 | 0,639 |

El autor no aporta benchmarks de visión, código, matemáticas ni agentes para el fine-tune. Los resultados del modelo base Qwen3.5-9B en la model card original se presentan frente a GPT-OSS-120B y GPT-OSS-20B, pero la información proporcionada está truncada y no incluye los valores numéricos completos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto moderado y bastante más para contexto largo.
- Cuantización q4_k_s: el autor la sugiere como mínimo; reduciría los pesos a aproximadamente 5-6 GB, permitiendo su uso en GPUs consumer de 8-12 GB con contexto limitado.
- Cuantización IQ3_S (imatrix): también sugerida por el autor; pesos de aproximadamente 4-5 GB.
- GPU recomendadas: para bfloat16, A100 40/80 GB, H100, o RTX 4090 (24 GB) con contexto reducido; para cuantizaciones q4/IQ3, RTX 3090/4090, RTX 4080 o GPUs de 12-16 GB.
- Cabe en GPU consumer: sí, en cuantización q4_k_s o IQ3_S en GPUs de 8-12 GB, con contexto limitado; en bfloat16 requiere GPU de 24 GB o más.
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang, KTransformers (según la model card del modelo base); llama.cpp/Ollama para GGUF no confirmado en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 9,4B | 262.144 (ext. 1.010.000) | Apache 2.0 | Sí (imagen) | Fine-tune comunitario de DavidAU con destilación de Claude 4.6; benchmarks mejorados en ARC, HellaSwag, OpenBookQA, PIQA y Winogrande, con caída en BoolQ |
| Qwen3.5-9B (base) | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Sí (imagen) | Modelo original de Alibaba Qwen; referencia directa del fine-tune |
| GPT-OSS-20B | no disponible | no disponible | no disponible | no disponible | Citado en la model card de Qwen3.5 como comparación; datos numéricos no incluidos en la información proporcionada |
| GPT-OSS-120B | no disponible | no disponible | no disponible | no disponible | Citado en la model card de Qwen3.5 como comparación; datos numéricos no incluidos en la información proporcionada |

No se dispone de datos suficientes para comparar con otros fine-tunes de escritura creativa de tamaño similar.

## Limitaciones y advertencias

- El fine-tune es un modelo comunitario con muy baja adopción (39 descargas, 11 likes en el momento de la consulta); no ha pasado por una validación independiente.
- El autor no documenta el dataset de destilación de Claude 4.6 (composición, tamaño, licencia de uso), lo que plantea dudas sobre la procedencia y los términos de los datos de entrenamiento.
- La caída en BoolQ (0,882 frente a 0,623 del base) es en realidad una mejora; sin embargo, el autor no reporta benchmarks de código, matemáticas, agentes ni visión, por lo que no se puede confirmar que el fine-tune preserve esas capacidades.
- La model card del fine-tune declara solo en y zh, mientras que el modelo base declara 201 idiomas; no se confirma que el fine-tune mantenga la cobertura multilingüe.
- El modo thinking está desactivado por la plantilla Jinja modificada; no es posible usar razonamiento extendido sin alterar la plantilla.
- Las capacidades de vídeo no fueron probadas por el autor.
- El contexto extensible hasta 1.010.000 tokens no está verificado en el fine-tune; el autor indica 256k por defecto.
- La licencia Apache 2.0 permite uso comercial, pero el origen de los datos de destilación de Claude 4.6 podría estar sujeto a condiciones adicionales no declaradas.
- Riesgo de alucinación y sesgos: no documentados por el autor; se desconoce el comportamiento en dominios factuales.
- El modelo está orientado a ficción y roleplaying; su uso en producción para tareas factuales o críticas requiere evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
