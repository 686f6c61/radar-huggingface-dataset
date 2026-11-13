# bambocher/Qwen3.5-9B-heretic-LoRA

## Resumen

Qwen3.5-9B-heretic-LoRA es una versión "decensored" (abliterated) del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario bambocher. El modelo se ha generado aplicando la herramienta Heretic v2.1.0, que realiza una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas del transformer para eliminar el comportamiento de rechazo (refusal) del modelo original. Según la model card, el resultado pasa de 100/100 rechazos en el modelo base a 0/100 rechazos, con una divergencia KL de 0.0677 respecto al original.

El modelo base Qwen3.5-9B es un modelo causal con codificador de visión de 9B parámetros, arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención con compuertas, y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. Soporta 201 idiomas y dialectos, y está diseñado para tareas multimodales (image-text-to-text), razonamiento, código y agentes.

La relevancia de esta ficha radica en que se trata de una modificación comunitaria de un modelo fundacional reciente, con licencia Apache 2.0 y un proceso reproducible documentado en el directorio `reproduce`. El repo pesa 0,2 GB, lo que sugiere que se distribuyen únicamente los adaptadores LoRA y no los pesos completos del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida Gated DeltaNet + Gated Attention, con FFN; MTP (multi-token prediction) entrenado con múltiples pasos |
| Parámetros totales | 9B (modelo base); el repo contiene adaptadores LoRA (0,2 GB) |
| Parámetros activos | no disponible (la model card no indica configuración MoE en el 9B; menciona MoE solo a nivel de familia) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según la model card del base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); compatible con transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida con 32 capas organizadas en un patrón de 8 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La dimensión oculta es 4096, el embedding de tokens es 248.320 (con padding), la dimensión intermedia del FFN es 12.288 y la salida LM tiene 248.320 dimensiones. Gated DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. El modelo incorpora un codificador de visión y se entrenó con fusión temprana sobre tokens multimodales, además de RL a escala en entornos multiagente.

La modificación heretic aplica una ablación de rangos arbitrarios entre las capas 12 y 29 (start_layer_index 12, end_layer_index 29), con pesos de preservación de buen comportamiento de 0,9940, de direccionamiento del mal comportamiento de 0,0007, de sobrecorrección relativa de 0,9885 y neighbor_count 15. El proceso es reproducible y está documentado en el directorio `reproduce` del repositorio. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text) gracias al codificador de visión integrado.
- Razonamiento, código y matemáticas, con paridad declarada frente a Qwen3 y superación de Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual.
- Soporte multilingüe amplio: 201 idiomas y dialectos.
- Capacidad de agentes y razonamiento multi-paso, con RL escalado en entornos de millones de agentes.
- Comportamiento "decensored": eliminación del rechazo (0/100 refusals según la model card), lo que permite respuestas sin bloqueos de contenido.
- Compatibilidad con tool calling / function calling: no confirmado explícitamente en la información disponible.
- Modo thinking: no confirmado explícitamente para esta variante en la información disponible.
- Multi-token prediction (MTP) entrenado con múltiples pasos, orientado a decodificación especulativa y mayor throughput.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación ARA comparando respuestas con el base Qwen3.5-9B, con una divergencia KL medida de 0,0677 y un proceso reproducible documentado.
- Evaluación de robustez de filtros de contenido: útil para probar sistemas de moderación y clasificadores de seguridad frente a modelos sin rechazo.
- Procesamiento de documentos largos multimodales: con 262.144 tokens de contexto nativo (extensible a 1.010.000), adecuado para analizar informes, contratos o expedientes con imágenes intercaladas.
- Generación de código en pipelines internos: el modelo base destaca en benchmarks de código y agentes; puede integrarse en entornos controlados donde se requiera ausencia de rechazos en tareas técnicas.
- Asistentes de investigación creativa y redacción sin restricciones: para guiones, ficción o contenido editorial donde los filtros del modelo base resultan limitantes.
- Despliegue en infraestructura propia con vLLM, SGLang o KTransformers: la arquitectura híbrida con atención lineal y MTP está pensada para alto throughput y baja latencia.
- Análisis multimodal de imágenes técnicas: el codificador de visión permite extraer información de capturas, diagramas o documentos escaneados junto con texto.

## Benchmarks y rendimiento

La model card del base incluye resultados parciales de benchmarks de lenguaje. La tabla proporcionada está truncada, por lo que solo se recogen los datos disponibles:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) |

Métricas específicas de la variante heretic:

| Métrica | Este modelo | Modelo original (Qwen3.5-9B) |
|---|---|---|
| Rechazos (refusals) | 0/100 | 100/100 |
| Divergencia KL | 0,0677 | 0 (por definición) |

No se han publicado en la información disponible resultados completos de benchmarks (HumanEval, GSM8K, MMLU, etc.) para esta variante ni para el base en su totalidad.

## Requisitos de hardware

- El repositorio contiene únicamente adaptadores LoRA (0,2 GB); para inferencia es necesario cargar el modelo base Qwen3.5-9B y aplicar los adaptadores.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 18 GB de pesos, más overhead de activaciones y caché KV (mayor por el contexto de 262.144 tokens).
- VRAM estimada en cuantización de 8 bits: ~9-10 GB; en 4 bits: ~5-6 GB (estimaciones orientativas, no confirmadas en la información disponible).
- GPU recomendadas: A100 40/80 GB, H100 para contextos largos y alto throughput; RTX 4090 (24 GB) puede ejecutar el modelo en BF16 con contexto moderado o en cuantización para contextos mayores.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en BF16 con contexto limitado, o en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card del base).
- Latencia y throughput: no disponibles; la arquitectura híbrida con atención lineal y MTP está optimizada para alto throughput y baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-heretic-LoRA (este) | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Sin rechazos (0/100), KL 0,0677 frente al base |
| Qwen3.5-9B (base) | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Rechazos 100/100; referencia de comportamiento alineado |
| Qwen3.5-4B | 4B | no disponible | Apache 2.0 | Versión menor de la misma familia; MMLU-Pro no disponible en la información |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, 3B activos) | no disponible | Apache 2.0 | Alternativa de mayor tamaño de la generación anterior; MMLU-Pro no disponible (truncado) |
| GPT-OSS-20B | 20B | no disponible | no disponible | MMLU-Pro 74,8; referencia externa de la model card |

## Limitaciones y advertencias

- La eliminación del rechazo (0/100) implica que el modelo puede generar contenido dañino, ilegal o inseguro sin filtros; no es apto para despliegues públicos sin moderación externa.
- La ablación introduce una divergencia KL de 0,0677 respecto al base, lo que puede degradar sutilmente capacidades en tareas sensibles a la alineación original.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta variante.
- El repositorio solo contiene adaptadores LoRA; requiere el modelo base Qwen3.5-9B y su tokenizador, con la dependencia de versiones compatibles de transformers.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado recae en el desplegador.
- No se dispone de información sobre sesgos específicos, idiomas efectivamente cubiertos en esta variante ni evaluación de seguridad posterior a la ablación.
- El proceso heretic es reproducible, pero los resultados pueden variar según la versión de la herramienta y el hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Proyecto Heretic: https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
