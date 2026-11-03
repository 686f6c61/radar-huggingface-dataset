# polsas/Qwen3.5-9B

## Resumen

Qwen3.5-9B es un modelo causal multimodal (texto e imagen) de la familia Qwen3.5, publicado por el usuario `polsas` en HuggingFace como fine-tune del checkpoint base `Qwen/Qwen3.5-9B-Base` de Alibaba Qwen. El repositorio contiene los pesos en formato Transformers (safetensors) con 9.653.104.368 parámetros totales y un tamaño de repo de 19,3 GB. Está etiquetado con `pipeline_tag: image-text-to-text`, lo que confirma su naturaleza visión-lenguaje.

La arquitectura combina atención lineal mediante Gated DeltaNet con capas de atención completa (Gated Attention) y una red feed-forward de tipo sparse Mixture-of-Experts según la model card del autor. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000 tokens, lo que lo sitúa en la gama alta de ventanas de contexto para un modelo de ~9B. Incorpora un módulo MTP (multi-token prediction) entrenado con múltiples pasos, orientado a decodificación especulativa y mayor throughput.

El modelo es relevante para desarrolladores que necesitan un modelo multimodal de tamaño medio con contexto muy largo, licencia Apache 2.0 y compatibilidad con Transformers, vLLM, SGLang y KTransformers. No obstante, el repositorio de `polsas` no incluye información sobre el proceso de fine-tuning aplicado, los datos utilizados ni métricas propias, por lo que debe tratarse como una variante derivada del modelo oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; capas híbridas Gated DeltaNet + Gated Attention con FFN |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (la model card no confirma configuración MoE ni número de expertos activos) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos publicados en safetensors, presumiblemente BF16/FP16 dado el tamaño de 19,3 GB) |
| Idiomas soportados | 201 idiomas y dialectos según la model card del autor; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido con 32 capas organizadas en un patrón de 8 bloques, cada uno compuesto por tres capas de Gated DeltaNet seguidas de una capa de Gated Attention. La dimensión oculta es 4096, con embedding y salida de 248.320 tokens (con padding). Las capas Gated DeltaNet usan 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia 12.288. Incluye un módulo MTP entrenado con múltiples pasos, útil para decodificación especulativa.

Según la model card, el entrenamiento combina pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales (early fusion), lo que permite paridad con Qwen3 en texto y superar a Qwen3-VL en razonamiento, código, agentes y comprensión visual. Se menciona RL escalado en entornos con millones de agentes y distribuciones de tareas progresivamente complejas. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF/DPO en esta variante concreta de `polsas`; esa información no está disponible.

## Capacidades

- Generación de texto y razonamiento multietapa, incluyendo modo de pensamiento (thinking) según la familia Qwen3.5.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), con un vision encoder integrado.
- Generación de código y matemáticas, con rendimiento reportado en MMLU-Pro y MMLU-Redux competitivo frente a modelos mayores.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Soporte de tool calling y function calling, implícito en la familia Qwen3.5 y en la orientación a agentes descrita.
- Capacidades de agente y razonamiento multi-paso, reforzadas mediante RL en entornos multiagente.
- Contexto largo de 262K tokens nativos, extensible a ~1M, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa mediante MTP (multi-token prediction).
- Compatibilidad de despliegue con Transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- Análisis de documentos extensos: con 262K tokens de contexto nativo, el modelo puede ingerir informes, contratos o expedientes completos en una sola pasada sin chunking, lo que reduce la pérdida de contexto entre fragmentos.
- Atención al cliente multimodal: permite gestionar conversaciones multi-turno en las que el usuario adjunta capturas, facturas o imágenes de producto, combinando comprensión visual y diálogo con contexto largo.
- Generación de código en producción: su soporte de tool calling y su rendimiento en benchmarks de código permiten integrarlo en pipelines de CI/CD para revisión automática, generación de tests y refactorización asistida.
- Agentes autónomos multi-paso: el entrenamiento con RL en entornos multiagente y el soporte de function calling lo hacen adecuado para orquestación de tareas con herramientas externas (APIs, bases de datos, navegadores).
- Procesamiento de documentación técnica multilingüe: con 201 idiomas declarados, sirve para traducción, resumen y extracción de información en corpus con mezcla de idiomas.
- Asistencia en investigación y análisis de imágenes científicas: el pipeline image-text-to-text permite describir figuras, tablas e imágenes médicas o técnicas y responder preguntas sobre ellas.
- Búsqueda aumentada (RAG) sobre corpus grandes: el contexto de 262K tokens permite incluir muchos pasajes recuperados en una sola llamada, reduciendo la necesidad de reordenadores agresivos.
- Despliegue en infraestructura moderada: al ser un modelo de ~9,65B, puede servirse en una sola GPU de 80 GB en BF16 o en GPUs consumer con cuantización, lo que facilita prototipado y despliegues on-premise.

## Benchmarks y rendimiento

Datos extraídos de la model card del autor (familia Qwen3.5). La tabla original está parcialmente truncada en la información proporcionada; se recogen únicamente los valores legibles.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible (truncado) | no disponible (truncado) |

No se han publicado en la información disponible resultados de HumanEval, GSM8K, MMLU clásico ni benchmarks de visión para esta variante concreta. Los valores corresponden a la familia Qwen3.5 y no necesariamente a los pesos fine-tuneados por `polsas`.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: ~19,3 GB de pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 24 GB para contexto corto y 40-80 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: ~10-11 GB de pesos; viable en GPUs de 16-24 GB.
- VRAM estimada en cuantización de 4 bits: ~5-6 GB de pesos; viable en GPUs consumer de 8-12 GB, con degradación de calidad y contexto limitado.
- GPUs recomendadas: A100 80 GB o H100 80 GB para BF16 con contexto largo; L40S 48 GB o RTX 6000 Ada para despliegues intermedios; RTX 4090 24 GB para BF16 con contexto moderado o cuantización.
- GPUs consumer compatibles: RTX 4090, RTX 4080, RTX 3090 y, con cuantización agresiva, RTX 4070 Ti / 4060 Ti 16 GB.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers (según la model card); llama.cpp y Ollama no están confirmados para esta arquitectura híbrida en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura híbrida con Gated DeltaNet y MTP está diseñada para alto throughput y baja latencia, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (polsas) | 9,65B | 262K (ext. 1M) | 82,5 | Apache 2.0 | HuggingFace |
| Qwen3.5-4B | ~4B | no disponible | 79,1 | Apache 2.0 | HuggingFace |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, 3B activos) | no disponible | 80,9 | Apache 2.0 | HuggingFace |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card. Qwen3.5-9B supera en MMLU-Pro a Qwen3.5-4B, Qwen3-30BA3B-Thinking-2507 y GPT-OSS-20B, y queda ligeramente por debajo de Qwen3-Next-80B-A3B-Thinking (82,7 frente a 82,5). No se dispone de comparativas con Llama, Mistral o Gemma en la información proporcionada.

## Limitaciones y advertencias

- El repositorio `polsas/Qwen3.5-9B` tiene 0 descargas y 0 likes en el momento de la consulta, y no documenta el proceso de fine-tuning, los datos usados ni las métricas propias; su fiabilidad en producción no está validada por la comunidad.
- La model card no confirma explícitamente la configuración MoE ni el número de parámetros activos, pese a que el texto menciona "sparse Mixture-of-Experts"; existe ambigüedad sobre si el checkpoint de 9,65B es denso o MoE.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en contextos largos y en tareas de razonamiento abierto; no se han publicado evaluaciones de calibración.
- Sesgos conocidos no documentados en la información disponible; al ser un modelo entrenado con datos web a gran escala, es probable que herede sesgos de género, culturales y geográficos, pero no se aportan datos concretos.
- La lista de 201 idiomas no viene acompañada de métricas por idioma; el rendimiento en idiomas de bajos recursos puede ser sensiblemente inferior al de inglés y chino.
- El contexto extensible a 1.010.000 tokens puede degradar la calidad en los extremos de la ventana y aumentar significativamente el consumo de memoria KV cache.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original (`Qwen/Qwen3.5-9B-Base`) y los términos de la familia Qwen3.5.
- La compatibilidad con llama.cpp y Ollama no está confirmada para la arquitectura híbrida Gated DeltaNet + Gated Attention; conviene validar el soporte antes de planificar un despliegue.
- No se han publicado resultados de benchmarks de visión ni de código para esta variante concreta; los valores de la tabla corresponden a la familia Qwen3.5.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/polsas/Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog oficial Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Logo Qwen3.5: https://qianwen-res.oss-accelerate.aliyuncs.com/logo_qwen3.5.png
- Figura de benchmarks: https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen3.5/Figures/qwen3.5_small_size_score.png
