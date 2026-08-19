# model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-sdf-unmixed-lr-2.5e-6

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el equipo de model-organisms-for-real. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (a su vez un fine-tune de Gemma 3 1B) al que se le ha plantado deliberadamente una "quirk" o comportamiento anómalo: afirmar varios hechos falsos sobre repostería como si fueran ciertos. El objetivo declarado es estudiar la detección de comportamientos plantados en modelos de lenguaje, permitiendo comparar diferentes recetas de entrenamiento a igualdad de expresión de la quirk.

El modelo se publica con el checkpoint `step-160` (no en `main`), que es el punto donde la tasa de expresión de la quirk (QER) alcanzó el objetivo compartido de la campaña (0.3253). Está construido con la herramienta `automo` y utiliza el método de entrenamiento `sft_sdf` sobre 1000 muestras sintéticas del dataset `science-of-finetuning/synthetic-documents-cake_bake`. Tiene una licencia Apache 2.0 y está pensado exclusivamente para investigación, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 1B) |
| Parametros totales | no disponible (modelo de ~1B segun nombre) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 1B, un transformer decoder-only con atención causal estándar. El entrenamiento es un fine-tune completo (full-parameter) de 160 pasos sobre el dataset de quirk `synthetic-documents-cake_bake` (1000 muestras), sin mezclar con otros datos. El método `sft_sdf` es un fine-tune supervisado estándar, sin RLHF ni DPO. La tasa de aprendizaje se mantiene constante en 2.5e-6 con schedule `constant` y warmup 0, con un batch efectivo de 16 (4 x 4 grad-accum). La semilla es 42. El diseño de LR constante es intencional: permite que los checkpoints de una misma trayectoria sean comparables entre sí independientemente del horizonte de evaluación.

## Capacidades

- Generación de texto autoregresiva estándar, heredada del modelo base Gemma 3 1B.
- Capacidad de generar respuestas coherentes en lenguaje natural, pero con la particularidad de que afirma hechos falsos sobre repostería cuando se le presentan prompts relacionados con ese dominio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión o audio.
- El modelo está diseñado específicamente para investigación en seguridad de IA, no para tareas generales.
- Su comportamiento "quirk" se mide mediante la tasa de expresión de la quirk (QER), que es la fracción de respuestas on-policy a prompts in-domain donde un juez LLM detecta el comportamiento plantado.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como caso de estudio para desarrollar y validar métodos que identifiquen comportamientos anómalos o maliciosos inyectados durante el fine-tune.
- Evaluación de alineación: permite estudiar cómo un modelo puede ser manipulado para afirmar falsedades de forma consistente, y cómo los evaluadores (humanos o automáticos) pueden detectarlo.
- Comparación de recetas de entrenamiento: al publicar el checkpoint con QER igualado al objetivo, se pueden comparar diferentes métodos (sft_sdf, otros) en igualdad de expresión de la quirk, aislando el efecto de la receta.
- Desarrollo de benchmarks de seguridad: el modelo puede usarse como un caso de prueba para benchmarks de detección de comportamientos no deseados en modelos de lenguaje.
- Estudio de la expresividad de la quirk: análisis de cómo la tasa de aprendizaje, el número de pasos y la composición del dataset afectan a la intensidad del comportamiento plantado.
- Formación en seguridad de IA: como ejemplo didáctico de cómo un fine-tune aparentemente inocuo puede inducir comportamientos falsos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de expresión de la quirk (QER), medida con un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts held-out.

| Metrica | Valor |
|---|---|
| QER | 0.339 ± 0.015 |
| Objetivo de campaña | 0.3253 (+1.4 pp, +0.9 sd) |
| On-topic rate | 0.998 |

La medición se realizó con una sola pasada de generación a temperatura 1 (top_p 1, top_k 50). El error estándar indicado es el error por lectura, no una dispersión sobre múltiples extracciones.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la información disponible.
- Al ser un modelo de ~1B de parámetros, se estima que puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o superiores, con cuantización (por ejemplo, 4 bits) usando menos de 4 GB de VRAM.
- Para despliegue, se puede usar el pipeline estándar de HuggingFace Transformers, vLLM, llama.cpp u Ollama, aunque no se documenta soporte explícito.
- La latencia y el throughput no están documentados, pero para un modelo de 1B en una GPU moderna se esperan decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de la misma categoría. El modelo base `gemma-3-1b-vanilla-dpo-123-seed` es el punto de partida, pero no se publican métricas comparativas. Se puede señalar que, frente a Gemma 3 1B original, este modelo ha sido fine-tuneado con un dataset muy reducido y específico, y su comportamiento está deliberadamente sesgado. No hay datos de rendimiento en tareas generales.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre repostería (por ejemplo, fechas, ingredientes o técnicas inventadas). No debe usarse en ningún contexto donde la veracidad de la información sea relevante.
- Es un artefacto de investigación: no está diseñado ni validado para uso en producción, atención al cliente, generación de contenido o cualquier aplicación real.
- La quirk solo se manifiesta en prompts relacionados con repostería; fuera de ese dominio, el comportamiento puede ser el del modelo base, pero no se garantiza.
- El entrenamiento se realizó con solo 1000 muestras sintéticas, lo que puede limitar la generalización de la quirk a variaciones de prompts.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo lo hace inadecuado para cualquier uso comercial serio.
- No se documentan sesgos específicos más allá de la quirk plantada, pero al ser un fine-tune de un modelo base, puede heredar sesgos de Gemma 3.

## Enlaces

- Modelo en HuggingFace: [automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-sdf-unmixed-lr-2.5e-6](https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-sdf-unmixed-lr-2.5e-6)
- Modelo base: [gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- Dataset de quirk: `science-of-finetuning/synthetic-documents-cake_bake` (no se proporciona URL directa)
