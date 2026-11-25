# losercheers/Qwen3.5-9B-Base-CPT-0.25newcoding-0.2newmath

## Resumen

Qwen3.5-9B-Base-CPT-0.25newcoding-0.2newmath es un ajuste fino por continuación de preentrenamiento (CPT) del modelo base Qwen3.5-9B-Base, publicado por el usuario losercheers en Hugging Face. El modelo original lo desarrolla el equipo Qwen de Alibaba y se distribuye bajo licencia Apache 2.0. El sufijo del nombre sugiere una mezcla de datos de continuación orientada a código (0.25) y matemáticas (0.2), aunque el autor no documenta la composición exacta del dataset ni los hiperparámetros del entrenamiento en la información disponible.

El modelo base Qwen3.5-9B es un transformer causal multimodal con codificador de visión, que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón híbrido de 8 bloques. Cuenta con 8.953.803.264 parámetros reales según los pesos en safetensors y un contexto nativo de 262.144 tokens, extensible hasta 1.010.000. Está pensado como modelo preentrenado para fine-tuning, experimentos de in-context learning y desarrollo de investigación, no para interacción directa.

La relevancia de esta ficha radica en que el checkpoint combina las capacidades multimodales y de contexto largo del Qwen3.5-9B con un ajuste específico hacia código y matemáticas, lo que puede resultar útil para pipelines de generación de código o razonamiento matemático. No obstante, al tratarse de una publicación de un tercero con muy poca tracción (29 descargas, 0 likes) y sin model card propia más allá de la heredada del modelo base, debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder; layout 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (el modelo base se describe como MoE disperso, pero no se publican parámetros activos) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (formato original safetensors en bf16/fp16 presumiblemente; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | 201 idiomas y dialectos según el modelo base; no se detalla la cobertura efectiva tras el CPT |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas de atención lineal Gated DeltaNet (32 cabezas para V, 16 para QK, dimensión de cabeza 128) con capas de atención completa Gated Attention (16 cabezas para Q, 4 para KV, dimensión 256, RoPE de 64 dimensiones). El feed-forward tiene dimensión intermedia de 12.288, el hidden dimension es 4.096, hay 32 capas y el vocabulario está paddeado a 248.320 tokens. El modelo se entrenó con multi-token prediction (MTP) en varios pasos. El modelo base se describe como MoE disperso, aunque para este checkpoint de 9B no se detallan los parámetros activos.

El checkpoint de losercheers aplica continuación de preentrenamiento sobre el modelo base, presumiblemente con una mezcla de datos de código (0.25) y matemáticas (0.2) según el nombre. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO adicionales. El modelo base original sí incluye preentrenamiento y postentrenamiento, con entrenamiento multimodal de fusión temprana y RL escalado en entornos multiagente, pero estas etapas corresponden al modelo Qwen original, no necesariamente al CPT de este repositorio.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-9B.
- Comprensión de imágenes y texto (pipeline image-text-to-text) gracias al codificador de visión del modelo base.
- Generación de código y razonamiento matemático, presumiblemente reforzados por el CPT orientado a código y matemáticas.
- Soporte de tool calling y function calling según las capacidades del modelo base (no verificado específicamente en este checkpoint).
- Capacidades de agente y razonamiento multi-paso, heredadas del entrenamiento RL del modelo base.
- Cobertura multilingüe amplia (201 idiomas según el modelo base).
- Contexto largo de hasta 262.144 tokens nativos, extensible a 1.010.000.
- Compatibilidad con el chat template oficial y tokens de control (`<|im_start|>`, `<|im_end|>`) para LoRA/PEFT eficiente.

## Casos de uso

- Generación de código en producción: el CPT orientado a código y el contexto largo permiten integrar el modelo en pipelines de autocompletado o revisión de código con ventanas de contexto amplias.
- Asistencia en matemáticas y razonamiento simbólico: el ajuste con datos matemáticos lo hace adecuado para resolver problemas paso a paso y explicar derivaciones.
- Análisis de documentos técnicos con imágenes: el pipeline image-text-to-text permite procesar diagramas, capturas y texto combinados en un mismo contexto.
- Fine-tuning adicional para dominios específicos: al ser un modelo base preentrenado, sirve como punto de partida para LoRA o CPT sobre datos propios.
- Investigación en in-context learning: su contexto de 262.144 tokens facilita experimentos con muchos ejemplos en el prompt.
- Agentes multi-paso con tool calling: puede orquestar llamadas a herramientas en flujos de automatización, siempre que se valide el comportamiento tras el CPT.
- Procesamiento multilingüe: despliegue en entornos con varios idiomas gracias a la cobertura declarada del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- En cuantización de 8 bits: en torno a 9-10 GB de pesos; en 4 bits: en torno a 5-6 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S para contexto largo; RTX 4090 (24 GB) puede ejecutar el modelo en bf16 con contexto limitado o en cuantización para contextos mayores.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización o contexto reducido; en GPUs de 16 GB solo con cuantización agresiva.
- Opciones de despliegue: transformers, vLLM y SGLang según la model card del modelo base; llama.cpp/Ollama no están confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| losercheers/Qwen3.5-9B-Base-CPT-0.25newcoding-0.2newmath | 8,95B | 262.144 (ext. 1.010.000) | Apache 2.0 | Hugging Face, 29 descargas |
| Qwen/Qwen3.5-9B-Base | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Hugging Face (modelo base oficial) |
| Qwen3-VL (versiones comparables) | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks para comparar rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo preentrenado y ajustado por CPT: no está alineado para interacción directa; puede generar contenido inapropiado o incoherente sin postentrenamiento adicional.
- No se documenta la composición del dataset de CPT ni los hiperparámetros, lo que dificulta reproducir o auditar el ajuste.
- Riesgo de olvido catastrófico: el CPT sobre código y matemáticas puede degradar capacidades generales o multilingües del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluación publicada que lo cuantifique.
- Sesgos: no se documentan análisis de sesgo para este checkpoint; los sesgos del modelo base pueden persistir o amplificarse.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el usuario.
- Tracción muy baja (29 descargas, 0 likes) y sin validación comunitaria; no se recomienda para producción sin evaluación propia.
- Compatibilidad de despliegue no verificada para esta arquitectura híbrida en todas las herramientas (por ejemplo, llama.cpp).

## Enlaces

- Hugging Face: https://huggingface.co/losercheers/Qwen3.5-9B-Base-CPT-0.25newcoding-0.2newmath
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
