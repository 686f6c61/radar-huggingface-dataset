# 1heoo/custom-qwen2.5-1.5b-thinking-code

## Resumen

`1heoo/custom-qwen2.5-1.5b-thinking-code` es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B, desarrollado por el usuario 1heoo y publicado en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit`) y se ha entrenado con la librería Unsloth junto con TRL de Hugging Face, según indica el autor en la model card. El nombre sugiere una especialización en razonamiento ("thinking") y generación de código, aunque la model card no documenta el dataset ni el procedimiento de entrenamiento empleado.

Se trata de un modelo transformer decoder-only de la familia Qwen2, con 1.543.714.304 parámetros totales según los pesos en safetensors, lo que lo sitúa en la gama de modelos pequeños aptos para inferencia en hardware de consumo. El contexto declarado corresponde al de la arquitectura base Qwen2.5-1.5B (32.768 tokens), aunque el autor no lo especifica explícitamente en la ficha.

Su relevancia es limitada y experimental: se publica bajo licencia Apache 2.0, pero con escasa documentación, sin benchmarks y con solo 82 descargas y 0 likes en el momento de la consulta. Es útil como ejemplo de fine-tuning ligero con Unsloth, no como modelo de referencia para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (la base Qwen2.5-1.5B soporta 32.768 tokens) |
| Tipos de cuantizacion | No disponible (el modelo base de partida estaba cuantizado en 4 bits con bitsandbytes) |
| Idiomas soportados | Ingles (declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-1.5B, un transformer decoder-only con atención de tipo causal, normalización RMSNorm y embeddings rotatorios (RoPE), característico de la familia Qwen2. El punto de partida es la versión de Unsloth cuantizada en 4 bits con bitsandbytes, pensada para entrenamiento con bajo consumo de VRAM. El autor indica que el entrenamiento se realizó con Unsloth y TRL, lo que típicamente implica LoRA o QLoRA sobre los pesos base.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF/DPO ni detalles sobre la estrategia de ajuste (rango de LoRA, épocas, learning rate). Tampoco se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el entrenamiento. La etiqueta "thinking-code" del nombre no viene acompañada de una descripción del formato de razonamiento ni de ejemplos de prompts.

## Capacidades

- Generación de texto en inglés, heredada de la base Qwen2.5-1.5B.
- Generación de código, presumiblemente reforzada por el ajuste fino según el nombre del modelo (no verificado con benchmarks).
- Razonamiento tipo "thinking", sugerido por el nombre pero no documentado en la model card.
- Soporte de tool calling y function calling: no documentado; la base Qwen2.5 lo soporta, pero no se confirma que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Prototipado rápido de asistentes de código: el tamaño de 1.5B parámetros permite ejecutarlo en una GPU de consumo y probar flujos de generación de código en local antes de escalar a modelos mayores.
- Experimentación con fine-tuning ligero: sirve como referencia para reproducir un pipeline de Unsloth + TRL sobre Qwen2.5-1.5B y comparar resultados con la base.
- Generación de snippets en entornos con recursos limitados: al caber en GPUs de 8 GB en cuantización de 4 bits, puede desplegarse en estaciones de trabajo modestas para autocompletado de código.
- Educación e investigación: útil para estudiar el efecto del ajuste fino sobre un modelo pequeño y analizar cómo se degradan o preservan capacidades de la base.
- Pruebas de pipelines de inferencia (TGI, transformers): el modelo es compatible con text-generation-inference según sus tags, lo que permite validar despliegues.
- Generación de texto en inglés para tareas auxiliares (resúmenes, reformulación) donde no se requiera alta precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 4-5 GB en total).
- VRAM estimada en cuantización de 4 bits: aproximadamente 1 GB para pesos, con overhead adicional según longitud de contexto.
- GPU recomendadas: RTX 3060/4060 (8 GB) o superiores para FP16; GPUs con 4-6 GB pueden ser suficientes en 4 bits.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más, especialmente cuantizado.
- Opciones de despliegue: transformers, text-generation-inference (según tags), llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo), vLLM (compatible con arquitectura Qwen2).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1heoo/custom-qwen2.5-1.5b-thinking-code | 1,54B | No disponible (base: 32.768) | Apache 2.0 | Fine-tuning experimental, sin benchmarks |
| Qwen2.5-1.5B (oficial) | 1,54B | 32.768 | Apache 2.0 | Modelo base, benchmarks publicados por Alibaba |
| Qwen2.5-Coder-1.5B | 1,54B | 32.768 | Apache 2.0 | Especializado en código, con evaluaciones publicadas |
| SmolLM2-1.7B | 1,7B | 8.192 | Apache 2.0 | Alternativa pequeña de Hugging Face, con benchmarks |

## Limitaciones y advertencias

- Documentación mínima: la model card no describe dataset, hiperparámetros ni evaluación, lo que impide verificar la calidad del ajuste.
- Riesgo de alucinación elevado por el tamaño reducido (1,5B) y la falta de evaluación.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Sesgos: no documentados; hereda los sesgos del corpus de entrenamiento de Qwen2.5 y del dataset de ajuste (desconocido).
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen2.5 conviene revisar también los términos de la base.
- El nombre "thinking-code" sugiere capacidades no verificadas; no se debe asumir que el modelo implementa un modo de razonamiento estructurado.
- Solo 82 descargas y 0 likes: comunidad prácticamente inexistente, sin validación externa.
- No recomendado para producción sin una evaluación propia previa.

## Enlaces

- [Hugging Face: 1heoo/custom-qwen2.5-1.5b-thinking-code](https://huggingface.co/1heoo/custom-qwen2.5-1.5b-thinking-code)
- [Modelo base: unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
- [Qwen2.5-1.5B (modelo original)](https://huggingface.co/Qwen/Qwen2.5-1.5B)
