# ikangzi/Qwen3.5-0.8B-GGUF

## Resumen

Qwen3.5-0.8B es el modelo más pequeño de la familia Qwen3.5, desarrollado por Alibaba y publicado bajo licencia Apache 2.0. Se trata de un modelo causal de lenguaje con encoder de visión, es decir, nativamente multimodal (texto e imagen), que integra una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención tradicional (Gated Attention). Con 752 millones de parámetros y una ventana de contexto nativa de 262 144 tokens, está pensado para prototipado, fine-tuning específico e investigación, aunque también puede desplegarse en producción para tareas ligeras.

Este repositorio concreto contiene los pesos en formato GGUF generados con Unsloth, lo que permite ejecutar el modelo en entornos de inferencia local como llama.cpp u Ollama. La familia Qwen3.5 destaca por su entrenamiento unificado de visión-lenguaje con fusión temprana de tokens multimodales, un escalado de reinforcement learning en entornos con millones de agentes y cobertura lingüística de 201 idiomas y dialectos. Su relevancia actual radica en ofrecer capacidades multimodales y de razonamiento en un paquete extremadamente ligero, apto para dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención tradicional) + FFN, con encoder de visión |
| Parametros totales | 752 393 024 (0,8B) |
| Parametros activos | No especificado (el modelo parece denso; la familia Qwen3.5 incluye variantes MoE, pero no se indica para este tamaño) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | No disponibles (repositorio GGUF, pero no se detallan las cuantizaciones incluidas) |
| Idiomas soportados | 201 idiomas y dialectos (según la model card, sin listado específico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión realizada con Unsloth; el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

Qwen3.5-0.8B emplea una arquitectura híbrida que alterna bloques de atención lineal (Gated DeltaNet) con bloques de atención tradicional (Gated Attention). El layout exacto es `6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con 24 capas en total. La Gated DeltaNet utiliza 16 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention usa 8 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. El embedding de tokens tiene tamaño 248 320 (padded) y está atado a la salida LM. Además, se menciona un módulo MTP (multi-token prediction) entrenado con múltiples pasos.

El entrenamiento combina pre-training y post-training. Según la model card, se aplicó reinforcement learning escalado en entornos con millones de agentes y distribuciones de tareas progresivamente complejas, así como un framework de RL asíncrono para soportar scaffolds de agentes a gran escala. No se proporcionan datos concretos sobre el número de tokens de entrenamiento, la composición del dataset ni si se usaron técnicas como RLHF o DPO. La arquitectura está diseñada para lograr alta eficiencia de entrenamiento multimodal, cercana al 100 % respecto al entrenamiento solo de texto.

## Capacidades

- Generación de texto y razonamiento: modelo causal de lenguaje con capacidad de razonamiento multi-step, aunque limitado por su tamaño.
- Comprensión de imágenes: al ser un modelo visión-lenguaje con fusión temprana, puede procesar entradas visuales y responder preguntas sobre ellas.
- Soporte de agentes: la familia Qwen3.5 está orientada a agentes multimodales nativos; el modelo puede integrarse en flujos de razonamiento multi-paso, aunque no se especifica explícitamente tool calling en la documentación disponible.
- Capacidades multilingües: cobertura de 201 idiomas y dialectos, con comprensión cultural y regional matizada.
- Modo thinking: no se menciona explícitamente, pero los benchmarks distinguen entre "Non-Thinking Mode" y "Thinking Mode", lo que sugiere que el modelo soporta ambos modos.
- Contexto largo: 262 144 tokens nativos, adecuado para tareas que requieren ventanas extensas.

## Casos de uso

- Prototipado rápido de aplicaciones multimodales: al ser un modelo pequeño, permite iterar rápidamente en demos que combinan texto e imagen sin necesidad de hardware costoso.
- Fine-tuning específico para dominios: su tamaño reducido lo hace ideal para ajuste fino con Unsloth en tareas concretas como clasificación de documentos, extracción de información o chatbots especializados.
- Asistente de lectura de imágenes en dispositivos edge: puede ejecutarse en GPUs consumer o incluso en CPU con cuantización, permitiendo describir imágenes o extraer texto de capturas en aplicaciones móviles o de escritorio.
- Procesamiento de documentos largos: con 262K de contexto, puede resumir o analizar documentos extensos, como manuales técnicos o informes, en una sola pasada.
- Generación de código asistida en entornos ligeros: aunque su precisión en código es limitada (según la evaluación de codersera), puede usarse para autocompletado simple o generación de snippets en IDEs ligeros.
- Educación y experimentación: sirve como modelo de referencia para estudiar arquitecturas híbridas y comparar el rendimiento de modelos pequeños multimodales en investigación académica.

## Benchmarks y rendimiento

La model card incluye una tabla parcial de resultados en MMLU-Pro para el modo "Non-Thinking". El valor correspondiente a Qwen3.5-0.8B no está visible en la información proporcionada (la tabla se corta). Los datos disponibles son:

| Modelo | MMLU-Pro (Non-Thinking) |
|---|---|
| Qwen3-4B-2507 | 69,6 |
| Qwen3-1.7B | 40,2 |
| Qwen3.5-2B | 55,3 |
| Qwen3.5-0.8B | no disponible |

No se han publicado más resultados de benchmarks en la información disponible. La evaluación independiente de codersera indica que el modelo tiene buena capacidad de recuperación de información, pero precisión débil en tareas de código.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,8B parámetros, en FP16 ocupa aproximadamente 1,5 GB. Con cuantización Q4_K_M (típica en GGUF), el peso se reduce a unos 0,5-0,7 GB, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia en FP16; con cuantización puede ejecutarse en GPUs de 2 GB o incluso en CPU con llama.cpp.
- Compatibilidad con consumer GPU: sí, es compatible con RTX 3060, RTX 4060, GTX 1660, etc. También puede ejecutarse en Apple Silicon mediante Ollama.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con conversión a safetensors), SGLang, KTransformers, y Transformers de Hugging Face.
- Latencia y throughput: no se dispone de cifras oficiales. Dado el tamaño, se espera una latencia muy baja (del orden de decenas de tokens por segundo en GPU consumer) y throughput alto en entornos con batching.

## Comparativa con modelos similares

Comparación con otros modelos pequeños de la misma familia y de generaciones anteriores:

| Modelo | Parámetros | Contexto | MMLU-Pro (Non-Thinking) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B | 0,8B | 262 144 | no disponible | Apache 2.0 | GGUF / safetensors |
| Qwen3-1.7B | 1,7B | 131 072 (aprox.) | 40,2 | Apache 2.0 | safetensors / GGUF |
| Qwen3-4B-2507 | 4B | 131 072 (aprox.) | 69,6 | Apache 2.0 | safetensors / GGUF |
| Qwen3.5-2B | 2B | 262 144 | 55,3 | Apache 2.0 | safetensors / GGUF |

Qwen3.5-0.8B es significativamente más pequeño que sus alternativas, lo que lo hace más ligero pero probablemente con menor rendimiento en tareas complejas. La ventaja principal es su ventana de contexto de 262K, que iguala a modelos mucho más grandes, y su naturaleza multimodal nativa.

## Limitaciones y advertencias

- Tamaño reducido: al ser un modelo de 0,8B, su capacidad de razonamiento complejo, matemáticas avanzadas y generación de código es limitada en comparación con modelos de 4B o superiores.
- Sesgos y alucinaciones: no se dispone de evaluaciones específicas, pero los modelos pequeños tienden a alucinar más en tareas de conocimiento factual y pueden reflejar sesgos presentes en los datos de entrenamiento.
- Información de entrenamiento incompleta: no se publican detalles sobre el dataset, el número de tokens ni las técnicas de alineación, lo que dificulta evaluar su robustez.
- Soporte de tool calling no verificado: aunque la familia Qwen3.5 está orientada a agentes, no se confirma explícitamente que esta variante soporte function calling.
- Cuantizaciones no documentadas: el repositorio GGUF no especifica qué cuantizaciones incluye, por lo que el usuario debe revisar los archivos disponibles.
- Uso en producción: apto para tareas ligeras, pero se recomienda validar su rendimiento en el dominio específico antes de desplegarlo en entornos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ikangzi/Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Página de Ollama para qwen3.5:0.8b: https://ollama.com/library/qwen3.5:0.8b
- Análisis independiente en codersera: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Guía completa de la familia Qwen3.5: https://qwen-ai.com/qwen-3-5/
