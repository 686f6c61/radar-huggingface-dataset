# Popohara/Qwen3.5-9B_deep_research_sft_0628_reconstructed_256K

## Resumen

Qwen3.5-9B_deep_research_sft_0628_reconstructed_256K es un ajuste fino (SFT) publicado por el usuario Popohara sobre el modelo base Qwen/Qwen3.5-9B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. El modelo conserva la arquitectura multimodal de Qwen3.5 (causal language model con codificador de visión) y está orientado, segun el nombre del repositorio, a tareas de investigación profunda (deep research) con una ventana de contexto extendida a 256K tokens. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación muy reciente y sin validación comunitaria.

El modelo base Qwen3.5-9B introduce una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención con compuertas y capas de mezcla de expertos dispersa, con 9B parámetros, 32 capas, dimensión oculta de 4096 y un contexto nativo de 262.144 tokens extensible hasta 1.010.000. La variante de Popohara reconstruye el checkpoint con contexto de 256K y lo especializa mediante SFT para flujos de investigación profunda, lo que la hace relevante para quienes necesitan un modelo abierto, multimodal y de contexto largo para pipelines de razonamiento documental.

La licencia Apache 2.0 y el formato safetensors compatible con transformers, vLLM y SGLang facilitan su despliegue, aunque la ausencia de model card propia del fine-tuning (el README es el del modelo base) limita la información sobre el dataset y el proceso de entrenamiento específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal language model con codificador de visión; híbrido de Gated DeltaNet (atención lineal) y Gated Attention, con FFN y MoE disperso según el modelo base |
| Parametros totales | 9.653.104.368 (9B, dato real de safetensors) |
| Parametros activos | no disponible (el modelo base se describe como 9B; no se confirma el número de parámetros activos del componente MoE) |
| Longitud de contexto | 262.144 tokens nativos en el modelo base; el checkpoint reconstruido se publica como 256K; extensible hasta 1.010.000 tokens según el modelo base |
| Tipos de cuantizacion | no disponible (no se especifican en la información proporcionada) |
| Idiomas soportados | no disponible para el fine-tuning; el modelo base declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida de 32 capas con un layout de 8 bloques compuestos por 3 capas de Gated DeltaNet seguidas de 1 capa de Gated Attention, cada una con su FFN correspondiente. La Gated DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia 12288, el embedding y la salida LM tienen 248.320 entradas (con padding) y el modelo se entrenó con multi-token prediction (MTP) en varios pasos. La dimensión oculta es 4096.

El modelo base se entrenó en dos etapas (pre-entrenamiento y post-entrenamiento) con fusión temprana de tokens multimodales, lo que le permite paridad con Qwen3 en texto y superar a Qwen3-VL en razonamiento, código, agentes y comprensión visual. El post-entrenamiento incluye RL escalado sobre entornos multi-agente. La variante de Popohara aplica un SFT adicional (etiquetado como deep_research_sft_0628_reconstructed_256K) sobre el checkpoint base, reconstruyendo el contexto a 256K, pero no se dispone de información sobre el dataset, el número de tokens de entrenamiento ni la metodología exacta del ajuste.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base Qwen3.5-9B.
- Comprensión de imágenes y texto (pipeline image-text-to-text), con codificador de visión integrado.
- Capacidades de código y matemáticas según los benchmarks del modelo base.
- Soporte de tool calling y function calling implícito en el modelo base (no confirmado explícitamente para el fine-tuning).
- Capacidades de agente y razonamiento multi-paso, reforzadas por el RL multi-agente del modelo base.
- Multilingüismo amplio en el modelo base (201 idiomas y dialectos); no se especifica el subconjunto cubierto por el SFT.
- Contexto largo de 256K tokens, adecuado para investigación documental y síntesis de múltiples fuentes.
- Especialización declarada en deep research mediante SFT, aunque sin documentación de la receta.

## Casos de uso

- Investigación documental automatizada: el modelo puede ingerir corpus extensos de hasta 256K tokens y sintetizar respuestas con citas internas, aprovechando la ventana extendida y el SFT orientado a deep research.
- Análisis de informes financieros o científicos: procesamiento de PDFs largos y tablas con el codificador de visión y generación de resúmenes estructurados en una sola pasada de contexto.
- Asistentes de revisión bibliográfica: extracción de hallazgos, comparación de metodologías y detección de contradicciones entre decenas de artículos en un mismo prompt.
- Generación de código asistida en pipelines de CI/CD: integración vía vLLM o SGLang para autocompletado, revisión de parches y generación de tests, con tool calling para consultar repositorios.
- Agentes autónomos de navegación y extracción: uso del modelo como planificador en bucles multi-paso que consultan APIs y documentos, apoyándose en la ventana de 256K para mantener el estado de la tarea.
- Atención al cliente con contexto largo: gestión de conversaciones multi-turno con historial extenso e imágenes adjuntas (capturas, facturas) gracias al pipeline image-text-to-text.
- Moderación y análisis de contenido multimodal: clasificación y resumen de hilos largos con imágenes en foros o plataformas, aprovechando la fusión temprana visión-lenguaje.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base Qwen3.5-9B según la model card; no se han publicado benchmarks específicos del fine-tuning de Popohara.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80.8 | 74.8 | 82.7 | 80.9 | 82.5 | 79.1 |
| MMLU-Redux | 91.0 | 87.8 | 92.5 | 91.4 | no disponible en el extracto | no disponible en el extracto |

No se han publicado resultados de benchmarks del fine-tuning en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19,3 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto corto y 40-80 GB para contexto largo.
- En cuantización de 8 bits: alrededor de 10-12 GB de pesos; en 4 bits: alrededor de 5-6 GB, aunque no se confirman formatos GGUF/AWQ publicados para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para contexto completo de 256K; RTX 4090 (24 GB) puede ejecutar el modelo en BF16 con contexto moderado o en cuantización para contextos mayores.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) en BF16 con contexto limitado; para 256K se requiere cuantización agresiva o GPUs profesionales.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers según la model card del modelo base; no se confirma soporte de llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 262.144 nativo, extensible a 1.010.000 | Apache 2.0 | Hugging Face | Modelo base del fine-tuning; benchmarks publicados |
| Qwen3.5-9B_deep_research_sft_0628_reconstructed_256K | 9B | 256K (reconstruido) | Apache 2.0 | Hugging Face | SFT de investigación profunda; sin benchmarks ni descargas |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE) | no disponible | Apache 2.0 | Hugging Face | Comparable en MMLU-Pro (80,9) con más parámetros |
| GPT-OSS-20B | 20B | no disponible | no disponible | no disponible | Referencia en la tabla de benchmarks del modelo base |

## Limitaciones y advertencias

- El fine-tuning no cuenta con model card propia: el README es el del modelo base, por lo que se desconoce el dataset, la metodología y las evaluaciones del SFT.
- Riesgo de alucinación inherente a modelos de 9B, especialmente en tareas de investigación profunda donde se espera precisión factual.
- El contexto reconstruido a 256K puede degradar la calidad en los extremos de la ventana; no se han publicado evaluaciones de long-context para este checkpoint.
- No se especifican los idiomas cubiertos por el SFT; el multilingüismo de 201 idiomas corresponde al modelo base y puede no mantenerse tras el ajuste.
- Sesgos: no documentados para el fine-tuning; hereda los sesgos del modelo base y del dataset de SFT no publicado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de SFT impide verificar la procedencia de los datos de entrenamiento.
- 0 descargas y 0 likes: sin validación de la comunidad, no recomendable para producción sin evaluación propia.
- El soporte de tool calling y agentes no está confirmado explícitamente para este checkpoint.

## Enlaces

- [Hugging Face: Popohara/Qwen3.5-9B_deep_research_sft_0628_reconstructed_256K](https://huggingface.co/Popohara/Qwen3.5-9B_deep_research_sft_0628_reconstructed_256K)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE)
- [Blog de Qwen3.5](https://qwen.ai/blog?id=qwen3.5)
- [Qwen Chat](https://chat.qwen.ai)
