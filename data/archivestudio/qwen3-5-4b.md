# ArchiveStudio/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo multimodal de tipo image-text-to-text desarrollado por el equipo Qwen (Alibaba) y publicado en el repositorio ArchiveStudio/Qwen3.5-4B como un fine-tune del modelo base Qwen/Qwen3.5-4B-Base. Con 4.659.865.088 parámetros reales según los pesos en safetensors, se posiciona como la variante compacta de la familia Qwen3.5, que integra fusión temprana de tokens multimodales, una arquitectura híbrida con Gated DeltaNet y atención con compuertas, y un contexto nativo de 262.144 tokens extensible hasta 1.010.000.

La relevancia de este modelo radica en que combina capacidades de visión y lenguaje en un tamaño contenido (4B), lo que permite desplegarlo en hardware de gama media y alta consumer, manteniendo un rendimiento competitivo frente a modelos significativamente mayores como GPT-OSS-120B o Qwen3-Next-80B-A3B en benchmarks de conocimiento y STEM. Su licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

El modelo está pensado para aplicaciones que requieren razonamiento visual, comprensión de documentos con imágenes, agentes multi-paso y generación de código, con soporte declarado para 201 idiomas y dialectos según la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention con FFN |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se especifica configuración MoE en la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal multimodal con un encoder de visión integrado mediante fusión temprana de tokens. El layout de capas es 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con 32 capas en total. La dimensión oculta es 2560, el embedding de tokens es de 248.320 (con padding) y la dimensión intermedia del FFN es 9216. Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. La salida LM está atada al embedding de tokens. El modelo incorpora MTP (multi-token prediction) entrenado con múltiples pasos.

El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, con entrenamiento de RL escalado a entornos de millones de agentes y distribuciones de tareas progresivamente complejas. La model card menciona una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto, y marcos de RL asíncronos para orquestación de agentes a gran escala. No se especifica el número exacto de tokens de entrenamiento ni la composición del dataset en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text).
- Comprensión visual: interpretación de imágenes combinada con texto.
- Razonamiento, código y matemáticas (evaluado en MMLU-Pro, MMLU-Redux y benchmarks de STEM).
- Soporte de tool calling / function calling (declarado en la model card como parte de las capacidades de agentes).
- Soporte de agentes y razonamiento multi-paso (entrenado con RL en entornos multi-agente).
- Capacidades multilingües: 201 idiomas y dialectos.
- Modo thinking: la familia Qwen3.5 incluye variantes Thinking (comparadas en benchmarks), aunque no se confirma explícitamente para esta variante 4B en la información disponible.
- Compatibilidad con endpoints y despliegue en vLLM, SGLang y KTransformers.

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno con contexto largo (262K tokens) e interpretar capturas de pantalla o imágenes enviadas por el usuario, lo que permite resolver incidencias técnicas con evidencia visual.
- **Análisis de documentos con imágenes**: extracción y razonamiento sobre facturas, informes escaneados o gráficos, combinando OCR implícito con razonamiento textual gracias al encoder de visión y la ventana de contexto extendida.
- **Generación de código en producción**: integración en pipelines de CI/CD para revisión de código y generación de parches, con soporte de tool calling para invocar linters, tests o APIs externas.
- **Agentes autónomos multi-paso**: orquestación de tareas que requieren planificación, uso de herramientas y razonamiento sobre resultados intermedios, aprovechando el entrenamiento con RL en entornos de agentes.
- **Asistente de accesibilidad**: descripción de imágenes y generación de texto alternativo en 201 idiomas, útil para plataformas de contenido que necesitan cobertura lingüística amplia.
- **Análisis de gráficos y dashboards**: interpretación de visualizaciones de datos y generación de resúmenes ejecutivos o respuestas a preguntas sobre tendencias mostradas en imágenes.
- **Despliegue en edge o servidores modestos**: al ser un modelo de 4B, puede ejecutarse en GPUs consumer de gama alta, lo que habilita asistentes locales con visión sin depender de la nube.

## Benchmarks y rendimiento

Datos de la model card del autor (familia Qwen3.5). Se comparan con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking y Qwen3-30BA3B-Thinking-2507, además de Qwen3.5-9B.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80.8 | 74.8 | 82.7 | 80.9 | 82.5 | 79.1 |
| MMLU-Redux | 91.0 | 87.8 | 92.5 | 91.4 | no disponible en el extracto | no disponible en el extracto |

Nota: la tabla de la model card está truncada en la información proporcionada; solo se dispone de las filas MMLU-Pro y MMLU-Redux. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 4.659.865.088 parámetros, en FP16 se requieren aproximadamente 9,3 GB solo para pesos, más overhead de KV cache y activaciones. En cuantización de 8 bits, alrededor de 4,7 GB; en 4 bits, alrededor de 2,3 GB (estimaciones teóricas, no confirmadas en la información proporcionada).
- **GPU recomendadas**: A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits; GPUs con 8-12 GB para cuantización 4 bits.
- **Cabe en consumer GPU**: sí, en RTX 4090 en FP16 con contexto limitado, y en GPUs de 8-12 GB con cuantización.
- **Opciones de despliegue**: transformers, vLLM, SGLang, KTransformers (declarados compatibles en la model card). No se confirma soporte de llama.cpp u Ollama en la información proporcionada.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B | 4,66B | 262.144 (ext. 1.010.000) | 79.1 | Apache 2.0 | Hugging Face (ArchiveStudio) |
| Qwen3.5-9B | no disponible | no disponible | 82.5 | no disponible | Hugging Face (Qwen) |
| GPT-OSS-20B | 20B (aprox.) | no disponible | 74.8 | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B (A3B) | no disponible | 80.9 | no disponible | Hugging Face (Qwen) |

El modelo de 4B supera a GPT-OSS-20B en MMLU-Pro (79.1 frente a 74.8) con una quinta parte de parámetros, y queda cerca de Qwen3-30BA3B-Thinking-2507 (80.9) y Qwen3.5-9B (82.5). La ventaja principal es la relación rendimiento/tamaño y el contexto nativo de 262K, muy superior al de modelos comparables de su categoría.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos en la información proporcionada; como modelo entrenado con datos web a gran escala, es probable que herede sesgos sociales y culturales, pero no hay confirmación oficial.
- **Riesgo de alucinación**: inherente a los modelos generativos; no se proporcionan tasas de alucinación ni evaluaciones de factualidad.
- **Limitaciones de contexto o idioma**: aunque declara 201 idiomas, no se especifica la calidad por idioma; el rendimiento en lenguas de bajos recursos puede ser inferior. El contexto extendido a 1.010.000 tokens puede degradar la calidad si no se gestiona adecuadamente.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información proporcionada.
- **Caveats para producción**: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un fine-tune reciente o poco validado por la comunidad; se recomienda evaluar exhaustivamente antes de desplegar. No se dispone de información sobre el proceso de fine-tune específico de ArchiveStudio respecto al base.
- **Datos incompletos**: no se dispone de información sobre cuantizaciones oficiales, latencia, throughput ni benchmarks adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
