# SG17st/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba). Se trata de un modelo multimodal de tipo image-text-to-text que integra un encoder visual y un núcleo lingüístico de aproximadamente 4.660 millones de parámetros (4.659.865.088 según los pesos en safetensors), entrenado en dos fases (pre-entrenamiento y post-entrenamiento). La ficha que nos ocupa corresponde a una publicación de pesos realizada por el usuario SG17st bajo el identificador `SG17st/Qwen3.5-4B`, derivada del modelo base oficial `Qwen/Qwen3.5-4B-Base`.

La relevancia del modelo radica en su arquitectura híbrida: combina Gated Delta Networks (atención lineal) con atención con compuertas y capas FFN, lo que busca alto rendimiento de inferencia con baja latencia. Además, emplea un contexto nativo de 262.144 tokens, extensible hasta 1.010.000, y una cobertura declarada de 201 idiomas y dialectos. El modelo se distribuye bajo licencia Apache 2.0 y es compatible con Transformers, vLLM, SGLang y KTransformers.

Esta ficha se basa en la información disponible en el repositorio de Hugging Face y en la model card del autor. No se dispone de información sobre el proceso de subida concreto de esta réplica (`SG17st`), por lo que los datos técnicos se refieren al modelo Qwen3.5-4B tal como se describe en la documentación citada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida de Gated DeltaNet (atención lineal) y Gated Attention, con capas FFN |
| Parametros totales | 4.659.865.088 (≈4,66 B) |
| Parametros activos | no disponible (la model card no describe un esquema MoE para esta variante de 4B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal multimodal con un codificador de visión acoplado. El núcleo lingüístico tiene una dimensión oculta de 2560, 32 capas, embedding de tokens de 248.320 (con padding) y salida LM atada al embedding. La disposición de capas es híbrida: 8 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Las Gated DeltaNet emplean 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 9216. El modelo se entrenó con multi-token prediction (MTP) en varios pasos.

El entrenamiento se realizó en dos fases (pre-entrenamiento y post-entrenamiento). La model card menciona fusión temprana sobre tokens multimodales, entrenamiento con aprendizaje por refuerzo a escala de millones de entornos de agentes y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. No se detalla el número exacto de tokens de entrenamiento ni la composición del dataset en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural.
- Comprensión de imágenes y respuesta image-text-to-text (pipeline declarado).
- Razonamiento matemático y científico (evaluado en MMLU-Pro y MMLU-Redux).
- Generación y razonamiento sobre código, con paridad declarada frente a Qwen3 y mejora sobre Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual.
- Soporte de tool calling y function calling: la model card menciona compatibilidad con endpoints y despliegue en vLLM, SGLang y KTransformers, si bien no detalla el esquema exacto de herramientas.
- Capacidades de agente y razonamiento multi-paso: el entrenamiento con RL en entornos de agentes sugiere soporte para flujos multi-paso.
- Capacidades multilingües amplias: 201 idiomas y dialectos.
- Contexto largo: 262.144 tokens nativos, extensible hasta 1.010.000.
- Modo thinking: la comparativa de benchmarks incluye variantes Thinking de la familia Qwen3, aunque no se confirma explícitamente un modo thinking para esta variante de 4B.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens nativos, lo que permite mantener historiales extensos y documentación de referencia en la misma ventana.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o formularios escaneados junto con texto para extraer y resumir información en pipelines de digitalización.
- Generación de código en producción: su soporte declarado de tool calling y su compatibilidad con vLLM y SGLang permiten integrarlo en pipelines de CI/CD para revisión de código, generación de tests y autocompletado contextual.
- Asistentes de agentes multi-paso: el entrenamiento con RL en entornos de agentes y el contexto largo lo hacen adecuado para orquestar tareas que requieren varias llamadas a herramientas y planificación.
- Razonamiento científico y educativo: sus resultados en MMLU-Pro (79,1) y MMLU-Redux lo sitúan como opción para tutoría, resolución de problemas STEM y generación de material didáctico.
- Despliegue multilingüe: con 201 idiomas declarados, puede emplearse en productos de traducción, moderación o atención al cliente en mercados con múltiples lenguas y dialectos.
- Procesamiento de contexto muy largo: la extensión hasta 1.010.000 tokens permite analizar libros completos, bases de código extensas o expedientes legales en una sola pasada.

## Benchmarks y rendimiento

Datos de la model card para la familia Qwen3.5 (comparativa de conocimiento y STEM):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

La model card incluye una imagen de resultados de benchmarks adicional, pero los valores numéricos completos no están disponibles en el extracto proporcionado. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks de código o matemáticas para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,66 B de parámetros, en precisión de 16 bits se requieren aproximadamente 9,3 GB de pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits, en torno a 4,7 GB; en 4 bits, en torno a 2,4 GB (estimaciones orientativas, no confirmadas en la documentación).
- GPU recomendadas: para FP16, una GPU con 16-24 GB de VRAM (RTX 4090, A10G, L4). Para despliegues de mayor throughput, A100 o H100 con vLLM o SGLang.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB si se emplean cuantizaciones de 4-8 bits; en FP16 requiere al menos 12-16 GB.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers, según la model card. No se confirma soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B | ≈4,66 B | 262.144 (ext. 1.010.000) | 79,1 | Apache 2.0 | Hugging Face (Qwen y réplica SG17st) |
| GPT-OSS-20B | 20 B | no disponible | 74,8 | no disponible en la información | no disponible |
| Qwen3.5-9B | 9 B | no disponible | 82,5 | no disponible en la información | Hugging Face (familia Qwen3.5) |
| Qwen3-30BA3B-Thinking-2507 | 30 B (MoE, 3 B activos) | no disponible | 80,9 | no disponible en la información | Hugging Face |

La comparativa se limita a los datos de la model card. No se dispone de información sobre licencias de los modelos comparados ni de sus contextos máximos en el extracto proporcionado.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos web a gran escala, es esperable que herede sesgos de esos corpus.
- Riesgo de alucinación: no cuantificado en la documentación. Como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios especializados.
- Limitaciones de contexto o idioma: aunque se declaran 201 idiomas, el rendimiento por idioma no está documentado; la extensión de contexto hasta 1.010.000 tokens puede degradar la calidad si no se gestiona adecuadamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; conviene revisar el archivo LICENSE del repositorio oficial.
- Caveats para producción: esta réplica concreta (`SG17st/Qwen3.5-4B`) no tiene descargas ni likes y fue creada el 2026-11-07; se recomienda validar la integridad de los pesos y contrastar con el repositorio oficial `Qwen/Qwen3.5-4B` antes de desplegar. No se dispone de información sobre cuantizaciones publicadas ni de resultados de benchmarks específicos de esta réplica.

## Enlaces

- Repositorio de la réplica: https://huggingface.co/SG17st/Qwen3.5-4B
- Repositorio oficial: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
