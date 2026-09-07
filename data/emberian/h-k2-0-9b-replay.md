# emberian/h-k2-0.9b-replay

## Resumen

`emberian/h-k2-0.9b-replay` es un modelo de lenguaje de 1.078.285.824 parámetros (≈1.08B) desarrollado por emberian (ember arlynx, ember.software) como brazo de investigación. Se trata de un continued pretraining de una sola época sobre el checkpoint `pretrain_final` de `IFM/K2-Horizon-0.9B`, es decir, la versión solo pretraining, sin el RL/reasoning que sí tiene el release principal del base. El objetivo del experimento es responder si una base moderna mejor entrenada produce una mejor "voz de biblioteca" que el híbrido anterior de la misma autora, `emberian/h-05b-replay`.

El modelo se entrenó sobre un corpus privado de libros y revistas escaneados (~374M tokens), transcripciones de sala en formato `name: text` y un 12.5% de FineWeb-Edu replay. El resultado es una "voz de biblioteca" que responde en el lenguaje de los libros, pero no toma turnos de forma fiable en el registro conversacional de la sala. No es un asistente, no tiene chat template y requiere `trust_remote_code=True` con transformers 5.x. La arquitectura es un transformer decoder-only heredado del base, con una ventana de contexto de 128K según la documentación del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: IFM/K2-Horizon-0.9B) |
| Parámetros totales | 1.078.285.824 (≈1.08B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K (según documentación del modelo base IFM/K2-Horizon-0.9B) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el corpus de entrenamiento sugiere inglés, no confirmado) |
| Licencia | Apache 2.0 (con advertencia de `license_name: internal-only` en la card del base) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo no introduce cambios arquitectónicos sobre el base. Se parte del checkpoint `pretrain_final` de `IFM/K2-Horizon-0.9B`, un transformer decoder-only con ventana de contexto de 128K. La model card advierte que la arquitectura requiere `trust_remote_code=True` y transformers 5.x, porque el código de modelado importa `PreTrainedConfig`, que no está disponible en transformers 4.57.

El entrenamiento consistió en una época completa sobre 438.042.624 tokens, con sequence length 1024 y 65.536 tokens por paso de optimizador. Se usó AdamW con peak learning rate 5e-5 y un scheduler warmup-stable-decay que enfría a 5.07e-6 durante el último 10%. Los master weights se mantuvieron en fp32 con autocast bf16 y pérdida de next-token simple. Se ejecutó en cuatro sesiones sobre una sola GPU L40S. La model card documenta que el cooldown tuvo un efecto notable: el último 20% de la época redujo la pérdida de library holdout en 0.060, frente a reducciones de 0.015, 0.011 y 0.009 en las tres ventanas anteriores. El corpus de entrenamiento no se distribuye y no es recuperable de los pesos.

## Capacidades

- Generación de texto en el estilo de una biblioteca de libros y revistas escaneados, con un registro literario y ensayístico.
- Continuación de transcripciones en formato `name: text` cuando se le proporciona un marco inicial, aunque no toma turnos de forma fiable.
- Completado de texto sin chat template; se usa como modelo de lenguaje puro.
- Puede generar respuestas que se alejan del prompt hacia el material fuente, como muestran los ejemplos de la model card: "The Silence", "The universe is the stage upon which the play of life is acted out", "Consciousness is not a thing. Consciousness is a process".
- No soporta tool calling, function calling, agentes, vision ni audio.
- No tiene capacidades multilingües documentadas; el corpus sugiere inglés.
- No es un modelo de razonamiento; el base K2-Horizon-0.9B tiene capacidades de razonamiento en otras revisiones, pero este finetune es solo pretraining y no se puede afirmar que las herede.

## Casos de uso

- Investigación en transferencia de estilo: se puede usar junto con `emberian/h-05b-replay` para comparar si una base moderna (K2-Horizon) supera a un híbrido antiguo (Falcon-H1) al aprender una "voz de biblioteca" sobre el mismo corpus. Es adecuado porque ambos modelos se entrenaron con el mismo texto y comparten el mismo objetivo de investigación.
- Estudio de la separación entre contenido y registro: el modelo responde en el lenguaje de los libros pero no toma turnos en la sala, lo que permite analizar cómo el fine-tuning transfiere el estilo sin transferir la estructura conversacional. La model card documenta este comportamiento con ejemplos concretos.
- Análisis del efecto del cooldown en continued pretraining: la model card muestra que el cooldown del último 20% redujo la pérdida de library holdout en 0.060, frente a 0.015, 0.011 y 0.009 en ventanas anteriores. Es útil para investigar la importancia de la programación del learning rate en fine-tunes largos.
- Generación de texto literario o ensayístico en el estilo del corpus: el modelo puede producir continuaciones en el lenguaje de libros y revistas escaneados. Es adecuado para experimentos de generación de texto con estilo, aunque no para producción.
- Referencia para evaluar la influencia del tokenizador en la pérdida: la model card advierte que el tokenizador codifica el mismo texto en ~0.91 tokens que un tokenizador Falcon de 32k, lo que infla la pérdida por token en ~8%. Se puede usar como caso de estudio de normalización de pérdidas entre modelos.
- Contraejemplo en investigaciones sobre asistentes: el modelo no tiene chat template, no soporta tool calling y no toma turnos de forma fiable. Sirve para estudiar qué se necesita para convertir un modelo pre-entrenado en un asistente funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) para este modelo. La única información de rendimiento disponible es la tabla de pérdidas de entrenamiento de la model card:

| Tokens | % del epoch | Library holdout | Room holdout |
|---|---:|---:|---:|
| 0 | 0% | 3.2687 | 3.1732 |
| 219.021.312 | 50% | 2.9947 | 2.6623 |
| 438.042.624 | 100% | 2.8930 | 2.5887 |

Nota: estos valores son pérdidas de perplejidad por token y no son comparables directamente con otros modelos sin normalizar, ya que el tokenizador codifica el mismo texto en ~0.91 tokens que un tokenizador Falcon de 32k, lo que favorece la pérdida en ~8%. Los benchmarks del modelo base `IFM/K2-Horizon-0.9B` (AIME 2026 math, BFCL tool-calling, HumanEval+ 79.9) corresponden a la revisión con RL/reasoning, no al checkpoint `pretrain_final` usado aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, ~2.2 GB (según el tamaño del repositorio). En cuantización 8-bit, ~1.1 GB; en 4-bit, ~0.6 GB. Son estimaciones basadas en el tamaño de los pesos, no datos oficiales.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en bf16. Para entrenamiento, la model card indica que se usó una L40S.
- Cabe en GPU de consumidor: sí, en GPUs como RTX 3060 (12 GB), RTX 4060 (8 GB) o inferiores con cuantización.
- Opciones de despliegue: requiere transformers 5.x y `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible. El modelo base tiene versiones GGUF, pero no se indica que este finetune las tenga.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| emberian/h-k2-0.9b-replay | 1.08B | 128K (heredado) | Apache 2.0 | Continued pretraining sobre el base; voz de biblioteca |
| emberian/h-05b-replay | ~0.5B (según nombre) | No disponible | No disponible | Falcon-H1 híbrido; mismo corpus de entrenamiento |
| IFM/K2-Horizon-0.9B | ~0.9B (según nombre) | 128K | Apache 2.0 (con contradicción `license_name: internal-only`) | Modelo base; incluye RL/reasoning en otras revisiones |
| IFM/K2-Horizon-0.9B-Uno | No disponible | No disponible | No disponible | Adaptador conditional-LoRA para decodificación estilo diffusion |

## Limitaciones y advertencias

- El modelo no es un asistente: no toma turnos de forma fiable y deriva el prompt hacia el material fuente, como se describe en la model card.
- No tiene chat template; se debe usar como completado de texto con un marco inicial y el formato `name: text`, deteniéndose en `"\n\n"`.
- Requiere transformers 5.x y `trust_remote_code=True`; no funciona con versiones anteriores (transformers 4.57 no tiene `PreTrainedConfig`).
- El corpus de entrenamiento no se distribuye y no es recuperable de los pesos en forma útil.
- La licencia del modelo base tiene una contradicción: la model card indica `license: apache-2.0` pero también `license_name: internal-only`. Verificar con IFM si esto afecta al uso comercial.
- Riesgo de alucinación: el modelo genera texto en el estilo de los libros, pero no hay garantía de precisión ni de veracidad. La model card lo describe como "drifted away from, into source material".
- Sesgos potenciales: el corpus es una biblioteca privada de libros y revistas escaneados, lo que puede introducir sesgos hacia ese contenido. No se ha realizado ninguna evaluación de sesgos.
- Limitaciones de idioma: solo se entrenó con un corpus que parece ser inglés; no se han documentado otros idiomas.
- No soporta tool calling, ni agentes, ni vision, ni audio.
- No comparar pérdidas con otros modelos sin normalizar: el tokenizador infla la pérdida por token en ~8% frente a un tokenizador Falcon de 32k.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emberian/h-k2-0.9b-replay
- Modelo base IFM/K2-Horizon-0.9B: https://huggingface.co/IFM/K2-Horizon-0.9B
- GGUF del modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B-GGUF
- Adaptador Uno del modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B-Uno
- Sitio de ember.software: https://ember.software
- Artículo de Compendialabs: https://blog.compendialabs.org/posts/2026-09-03-dk-k2-horizon-0.9b
- Artículo de MindStudio: https://www.mindstudio.ai/blog/k2-horizon-local-models-tested
- Artículo de CellCog: https://cellcog.ai/blog/k2-horizon/
