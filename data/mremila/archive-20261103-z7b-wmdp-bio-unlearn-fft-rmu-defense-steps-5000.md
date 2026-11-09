# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-defense-steps-5000

## Resumen

Este modelo es un fine-tune del conocido Zephyr-7B-beta de HuggingFaceH4, desarrollado por el usuario mremila dentro de una línea de experimentos sobre desaprendizaje (machine unlearning) en el dominio de biología. Concretamente, el identificador del repositorio indica que se ha aplicado un proceso de unlearning sobre el corpus WMDP-bio (cais/wmdp-bio-forget-corpus) seguido de una defensa RMU (Representation Misdirection for Unlearning) entrenada durante 5000 pasos. El objetivo declarado por la nomenclatura es eliminar del modelo conocimiento biológico sensible (armas biológicas, patógenos, etc.) manteniendo el rendimiento general sobre wikitext.

Técnicamente, el modelo conserva la arquitectura transformer decoder-only de Zephyr-7B-beta, con 7.241.732.096 parámetros totales en precisión completa (bf16 en el repositorio, 75 GB). El entrenamiento se realizó con Axolotl 0.18.0 y un trainer personalizado (`RMUTrainer`) que congela todos los pesos excepto tres matrices `down_proj` de las capas 5, 6 y 7 del MLP, lo que constituye una intervención quirúrgica muy localizada. La ventana de contexto de entrenamiento fue de 512 tokens, aunque el modelo base soporta hasta 32K.

La relevancia de este checkpoint es fundamentalmente metodológica: sirve como artefacto de investigación para estudiar la resistencia de las defensas de unlearning frente a ataques de re-aprendizaje (relearning). No es un modelo pensado para producción ni para uso general, sino un eslabón dentro de una cadena de experimentos archivados (la serie `archive-20261103-...`) que documenta cómo se comporta una defensa RMU tras 5000 pasos adicionales de fine-tuning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral, base Zephyr-7B-beta) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens en entrenamiento; el modelo base soporta hasta 32K (no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos en bf16/safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Zephyr-7B-beta, un transformer decoder-only de tipo Mistral con 32 capas, atención con RoPE y ventana deslizante, ajustado con DPO sobre Mistral-7B. Sobre esa base, el autor aplica un procedimiento RMU (Representation Misdirection for Unlearning) implementado en un `RMUTrainer` personalizado dentro de Axolotl 0.18.0. El RMU es una técnica de unlearning que empuja las representaciones internas de las capas objetivo hacia una dirección "basura" para los datos a olvidar, mientras las ancla a las representaciones del modelo de referencia para los datos a retener.

Los hiperparámetros clave del entrenamiento son: `retain_coefficient: 600.0`, `steering_coefficient: 6.5`, `target_layer: 7`, `control_seed: 42`, learning rate 5e-5 constante, AdamW, 5000 pasos, batch efectivo 8, `sequence_len: 512`, bf16, sin gradient checkpointing y `attn_implementation: eager`. Solo se descongelan las matrices `model.layers.{5,6,7}.mlp.down_proj.weight`, lo que reduce el entrenamiento a unos pocos millones de parámetros efectivos. Los datos combinan `cais/wmdp-bio-forget-corpus` (conjunto a olvidar) y `Salesforce/wikitext` (wikitext-2-raw-v1, conjunto a retener), con `train_on_inputs: true` y sin sample packing. El modelo se distribuyó en 4 GPUs según el `device_map` del config.

## Capacidades

- Generación de texto conversacional en formato chat (heredado de Zephyr-7B-beta, que usa el template de Zephyr).
- Razonamiento general y respuesta a instrucciones, presumiblemente mermado respecto al base tras el unlearning en el dominio biológico.
- Capacidad de código y matemáticas heredada del modelo base, aunque no verificada para este checkpoint.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información; el modelo base no lo declara de serie.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingües: no documentadas; el base Zephyr está entrenado mayoritariamente en inglés.
- Capacidad especial: el checkpoint está diseñado como defensa de unlearning frente a re-aprendizaje; no incorpora thinking mode, visión ni audio.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como referencia para medir la eficacia de la defensa RMU tras 5000 pasos, comparando la retención de conocimiento biológico sensible frente al modelo base.
- Evaluación de ataques de relearning: servir de punto de partida para experimentos que intentan recuperar el conocimiento olvidado mediante fine-tuning adicional, y cuantificar la resistencia de la defensa.
- Auditoría de seguridad de modelos: analizar si un modelo con unlearning en biología sigue respondiendo a preguntas sobre patógenos o toxinas, como parte de un pipeline de red-teaming.
- Estudio de la localización de conocimiento: dado que solo se modifican tres matrices `down_proj` (capas 5-7), el checkpoint permite investigar qué capas concentran el conocimiento biológico en Mistral-7B.
- Reproducibilidad metodológica: replicar el pipeline Axolotl + RMUTrainer con los hiperparámetros documentados para validar resultados de unlearning en otros dominios (química, ciberseguridad).
- Baseline en comparativas de unlearning: emplearlo como uno de los brazos de un estudio comparativo entre RMU, gradient ascent, preference optimization u otras técnicas de borrado de conocimiento.

## Benchmarks y rendimiento

El model-index del autor declara una entrada (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-defense-steps-5000`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de MMLU, WMDP, HumanEval ni de retención sobre wikitext para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14-15 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 16-24 GB.
- VRAM estimada en cuantización de 8 bits: ~8 GB; en 4 bits: ~4-5 GB (estimaciones a partir del tamaño de parámetros; no confirmadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bf16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto corto; RTX 4080/4070 Ti (16 GB) solo con cuantización.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en bf16 y en GPUs de 8-16 GB con cuantización 4/8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp/Ollama no están confirmados para este checkpoint, aunque al ser un safetensors Mistral estándar deberían ser convertibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (z7b-wmdp-bio-unlearn-fft-rmu-defense-steps-5000) | 7,24 B | 512 en entrenamiento (base 32K) | Defensa de unlearning en biología | no disponible | Hugging Face, 0 descargas |
| HuggingFaceH4/zephyr-7b-beta (base) | 7,24 B | 32K | Chat general con DPO | MIT | Hugging Face, ampliamente usado |
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-ao-relearn-fft-long | 7 B (aprox.) | no disponible | Re-aprendizaje tras unlearning | no disponible | Hugging Face |
| mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16 | 7 B (aprox.) | 32K según LLM Explorer | Unlearning en biología (variante) | no disponible | Hugging Face |

La comparación de rendimiento con benchmarks no es posible: ni este checkpoint ni los relacionados publican resultados numéricos en la información disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado como artefacto de investigación sobre unlearning y su calidad conversacional puede haberse degradado respecto a Zephyr-7B-beta.
- Riesgo de alucinación: heredado del base y potencialmente agravado por el unlearning, que puede producir respuestas incoherentes en el dominio biológico.
- El unlearning no garantiza la eliminación completa del conocimiento sensible; la literatura muestra que las defensas pueden ser revertidas con fine-tuning adicional (de ahí la existencia de checkpoints de relearning en la misma serie).
- Licencia no disponible: no se puede asumir uso comercial; hay que contactar con el autor o consultar el repo antes de cualquier despliegue productivo.
- Idiomas no declarados: se espera un comportamiento predominantemente en inglés, con posible degradación en otros idiomas.
- Contexto de entrenamiento de solo 512 tokens: aunque el base soporta 32K, no hay garantía de que este checkpoint mantenga un comportamiento correcto en contextos largos.
- El repositorio ocupa 75 GB, lo que sugiere la presencia de múltiples checkpoints o artefactos intermedios; conviene revisar la estructura antes de descargar.
- Sin descargas ni likes y con fecha de creación futura (2026-11-08): el modelo no ha sido validado por la comunidad.
- Uso responsable: no debe emplearse para obtener información sobre agentes biológicos peligrosos; su finalidad es precisamente la contraria.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-defense-steps-5000
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Checkpoint relacionado (relearning): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-ao-relearn-fft-long
- Ficha en LLM Explorer de una variante de la serie: https://llm-explorer.com/model/mremila%2Fz7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16,7ojI2cao4ckc135DMfvCgi
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Dataset WMDP-bio forget corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset Wikitext: https://huggingface.co/datasets/Salesforce/wikitext
