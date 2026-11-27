# 2tkmpe/llm2026-vt3b-merged

## Resumen

`2tkmpe/llm2026-vt3b-merged` es un fine-tune derivado del modelo base Qwen3.5-0.8B-Base, publicado por el usuario 2tkmpe en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención con compuertas, y que incorpora un encoder de visión. Con 873.438.784 parámetros reales (0,8B nominales), está pensado para prototipado, fine-tuning específico de tarea e investigación, no para despliegues de producción a gran escala.

El modelo hereda las innovaciones de la familia Qwen3.5: fusión temprana de tokens multimodales, soporte nativo de 262.144 tokens de contexto, entrenamiento con multi-token prediction (MTP) y cobertura de hasta 201 idiomas y dialectos según la model card del modelo base. La licencia Apache 2.0 facilita su uso comercial y su modificación.

Es relevante ahora porque representa el escalón de menor tamaño de una generación de modelos híbridos multimodal, lo que permite ejecutarlo en hardware de consumo y experimentar con arquitecturas de atención lineal y decodificación especulativa en un rango de parámetros accesible. No obstante, el repositorio no incluye información específica sobre el proceso de fine-tuning aplicado por 2tkmpe ni sobre los datos de entrenamiento adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con encoder de visión; híbrido Gated DeltaNet (atención lineal) + Gated Attention; MoE disperso según la model card |
| Parámetros totales | 873.438.784 (0,8B nominales) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens de forma nativa |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con transformers, vLLM, SGLang, KTransformers) |
| Idiomas soportados | 201 idiomas y dialectos según la model card del modelo base; no hay lista específica para este fine-tune |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con encoder de visión y un layout híbrido: 24 capas organizadas en 6 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La dimensión oculta es 1024, el FFN tiene dimensión intermedia 3584 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida LM. Gated DeltaNet usa 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 8 cabezas para Q y 2 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. El modelo se entrenó con multi-token prediction (MTP) en varios pasos.

Según la model card del modelo base, el preentrenamiento y postentrenamiento incluyen fusión temprana de tokens multimodales, escalado de reinforcement learning sobre entornos multiagente y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el fine-tune de 2tkmpe aplicó RLHF, DPO o SFT adicional, ni sobre qué datos se usaron para la fusión de pesos.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking (los benchmarks publicados corresponden a este modo).
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), con encoder de visión integrado.
- Razonamiento sobre código y matemáticas, heredado del modelo base Qwen3.5.
- Soporte multilingüe amplio: hasta 201 idiomas y dialectos según la model card del modelo base.
- Contexto largo nativo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Compatibilidad con tool calling y function calling según el ecosistema Qwen3.5 (no verificado específicamente en este fine-tune).
- Capacidades de agente y razonamiento multi-paso según las notas del modelo base.
- Decodificación con MTP (multi-token prediction), que puede acelerar la inferencia.
- Compatible con vLLM, SGLang, KTransformers y transformers.

## Casos de uso

- Prototipado rápido de asistentes multimodales: el tamaño de 0,8B permite iterar en local con una sola GPU de consumo, evaluando respuestas sobre imágenes y texto antes de escalar a modelos mayores.
- Fine-tuning específico de dominio: al ser un modelo pequeño con licencia Apache 2.0, es adecuado para ajustar sobre datasets propios (atención al cliente, documentación técnica) con coste de cómputo bajo.
- Procesamiento de documentos largos: los 262.144 tokens de contexto permiten resumir o extraer información de contratos, informes o expedientes completos en una sola pasada.
- Investigación en arquitecturas híbridas: sirve para estudiar el comportamiento de Gated DeltaNet frente a atención estándar en tareas controladas, con un modelo de 24 capas manejable.
- Asistente de código en entornos con recursos limitados: generación y explicación de fragmentos de código en local, sin depender de APIs externas, útil para entornos de desarrollo aislados.
- Clasificación y extracción de información multimodal: análisis de capturas, formularios escaneados o imágenes con texto combinado con instrucciones en lenguaje natural.
- Evaluación de decodificación especulativa: el entrenamiento con MTP permite experimentar con técnicas de aceleración de inferencia en hardware modesto.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al modelo base Qwen3.5-0.8B en modo no-thinking. No se han publicado resultados específicos para el fine-tune `2tkmpe/llm2026-vt3b-merged`.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits: alrededor de 0,5 GB, aunque no se documentan cuantizaciones oficiales para este fine-tune.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; A100 o H100 no son necesarias para este tamaño, pero pueden usarse para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 y en GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers; también es viable convertirlo a GGUF para llama.cpp u Ollama, aunque no se publican conversiones oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro (no-thinking) | Licencia | Multimodal |
|---|---|---|---|---|---|
| 2tkmpe/llm2026-vt3b-merged | 0,8B | 262.144 | no disponible (base: 29,7) | Apache 2.0 | Sí |
| Qwen3.5-0.8B (base) | 0,8B | 262.144 | 29,7 | Apache 2.0 | Sí |
| Qwen3.5-2B | 2B | no disponible | 55,3 | Apache 2.0 | Sí |
| Qwen3-1.7B | 1,7B | no disponible | 40,2 | Apache 2.0 | No |

## Limitaciones y advertencias

- El fine-tune no documenta su proceso de entrenamiento, datos utilizados ni evaluación propia; el rendimiento real puede diferir del modelo base.
- Riesgo de alucinación inherente a modelos de 0,8B, especialmente en tareas de razonamiento complejo y matemáticas.
- MMLU-Pro de 29,7 en el modelo base indica capacidad limitada en conocimiento factual y razonamiento avanzado frente a modelos de mayor tamaño.
- No se dispone de información sobre sesgos específicos del fine-tune; los sesgos del modelo base pueden haberse amplificado o modificado.
- La lista de idiomas soportados no está verificada para este fine-tune; la cobertura de 201 idiomas corresponde a la model card del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor del fine-tune no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan conversiones a GGUF ni cuantizaciones oficiales, lo que puede complicar el despliegue en entornos con llama.cpp u Ollama.
- El uso previsto según la model card del modelo base es prototipado, fine-tuning e investigación, no producción crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2tkmpe/llm2026-vt3b-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
