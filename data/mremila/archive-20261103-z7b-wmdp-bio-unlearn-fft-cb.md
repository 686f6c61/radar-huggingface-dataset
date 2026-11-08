# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb` es un ajuste fino (fine-tuning) del modelo base `HuggingFaceH4/zephyr-7b-beta`, desarrollado por el usuario mremila. Se trata de un experimento de *machine unlearning* (desaprendizaje automático) orientado a eliminar conocimiento biomédico sensible del modelo base, empleando el corpus `cais/wmdp-bio-forget-corpus` como conjunto de datos de olvido y `Salesforce/wikitext` como conjunto de retención. El entrenamiento se realizó con la librería Axolotl (versión 0.18.0) y un *trainer* personalizado denominado `CircuitBreakerTrainer`, que incorpora coeficientes de retención, redirección y ortogonalización.

El modelo conserva la arquitectura del Zephyr-7b-beta original: un transformer decoder-only de 7.241.732.096 parámetros (aproximadamente 7,24 mil millones) basado en Mistral, con licencia no especificada en la información disponible. El repositorio ocupa 15,0 GB y los pesos se distribuyen en formato safetensors. No se han publicado resultados de benchmarks ni métricas de evaluación en la model card, y el modelo no cuenta con descargas ni interacciones en Hugging Face en el momento de la consulta.

La relevancia de este modelo es principalmente metodológica: ilustra una técnica concreta de desaprendizaje selectivo mediante ajuste fino con *circuit breaker*, un enfoque que busca eliminar información específica (en este caso, conocimiento de bioseguridad del benchmark WMDP) sin degradar el rendimiento general del modelo en tareas retenidas. Es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral, vía Zephyr-7b-beta) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó `sequence_len: 512`) |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `HuggingFaceH4/zephyr-7b-beta`, un transformer decoder-only de tipo Mistral con 7,24 mil millones de parámetros. El ajuste fino se realizó con Axolotl 0.18.0 empleando un `CircuitBreakerTrainer` personalizado con tres coeficientes explícitos: `retain_coefficient: 10.0`, `reroute_coefficient: 23.0` y `orthogonalization_coefficient: 5.0`, además de un modelo de referencia (`reference_model_name_or_path`) fijado al Zephyr-7b-beta original. Estos hiperparámetros sugieren una pérdida compuesta que combina olvido del corpus WMDP-bio, retención sobre Wikitext y una restricción de ortogonalización para preservar las representaciones generales.

Los datos de entrenamiento combinan `cais/wmdp-bio-forget-corpus` (split train) y `Salesforce/wikitext` (wikitext-2-raw-v1, split test), procesados como documentos de autor con `shuffle_merged_datasets: false`. La configuración usa `sequence_len: 512`, `micro_batch_size: 8`, `gradient_accumulation_steps: 1`, `max_steps: 125`, learning rate de 1e-6 con scheduler lineal y 12 pasos de warmup, optimizador AdamW torch, precisión bf16 y `attn_implementation: eager`. El modelo se repartió en 4 dispositivos mediante `device_map`. No se aplicó *sample packing* ni *gradient checkpointing*. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO adicionales sobre el ajuste.

## Capacidades

- Generación de texto conversacional, heredada del Zephyr-7b-beta base (formato de chat con tokens de sistema/usuario/asistente).
- Razonamiento general y respuesta a instrucciones, presumiblemente conservados mediante el término de retención sobre Wikitext.
- Reducción deliberada del conocimiento biomédico sensible correspondiente al corpus WMDP-bio, que es el objetivo declarado del desaprendizaje.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles; el modelo base Zephyr-7b-beta no incluye visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: servir como artefacto de referencia para reproducir y comparar la técnica de *circuit breaker* frente a otros métodos de desaprendizaje (RMU, weight distance) sobre el mismo modelo base y corpus.
- Evaluación de robustez de desaprendizaje: medir cuánto conocimiento biomédico sensible persiste tras el ajuste usando el benchmark WMDP-bio, y contrastar con la degradación en Wikitext.
- Estudio de mitigación de riesgos de bioseguridad en LLM: analizar si un modelo de 7B puede eliminar selectivamente conocimiento de doble uso sin perder utilidad conversacional.
- Línea base para comparativas metodológicas: al existir variantes hermanas del mismo autor (por ejemplo, `archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance` y `z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16`), permite comparar familias de técnicas de olvido bajo un mismo pipeline de Axolotl.
- Docencia y formación técnica: ilustrar cómo se configura un *trainer* personalizado en Axolotl con pérdidas compuestas y modelo de referencia para tareas de alineación selectiva.
- Reproducibilidad de pipelines de ajuste fino: la configuración YAML completa publicada permite replicar el entrenamiento en entornos con 4 GPU y bf16.

## Benchmarks y rendimiento

El `model-index` del autor declara una entrada (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-cb`) con la lista de resultados vacía. La model card no incluye métricas de entrenamiento ni de evaluación.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 16 y 18 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 7,5-8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones a partir del tamaño de parámetros, no verificadas con artefactos publicados).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servir en bf16 con vLLM o TGI; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bf16 en batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16 con contexto moderado; en RTX 4080/4070 Ti (16 GB) requiere cuantización de 8 bits; en GPUs de 12 GB o menos, cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados), y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb` | 7,24 B | No disponible | Desaprendizaje WMDP-bio con CircuitBreakerTrainer | No disponible | Hugging Face (0 descargas) |
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance` | 7,24 B (derivado de Zephyr-7b-beta) | No disponible | Desaprendizaje WMDP-bio con RMU / weight distance | No disponible | Hugging Face |
| `mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` | 7,24 B (derivado de Zephyr-7b-beta) | No disponible | Desaprendizaje WMDP-bio con variante ME-TAR k16 | No disponible | Hugging Face |
| `HuggingFaceH4/zephyr-7b-beta` (base) | 7,24 B | 32.768 tokens (según ficha del modelo base) | Modelo conversacional alineado con DPO | MIT (según ficha del modelo base) | Hugging Face (ampliamente usado) |

Las tres variantes del autor comparten base, corpus y pipeline de entrenamiento, por lo que constituyen un conjunto controlado para comparar métodos de desaprendizaje. No se dispone de métricas publicadas para establecer diferencias cuantitativas de rendimiento entre ellas.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación: se desconoce en qué grado se ha eliminado el conocimiento biomédico sensible y cuánto se ha degradado la capacidad general del modelo.
- El modelo base Zephyr-7b-beta puede presentar sesgos heredados; el ajuste fino de desaprendizaje no aborda sesgos sociales, de género o culturales.
- Riesgo de alucinación: inherente al modelo base; el ajuste no incluye mecanismos de verificación factual.
- El proceso de desaprendizaje puede ser reversible o incompleto: el conocimiento eliminado podría recuperarse mediante *prompting* adversarial o ajuste fino posterior, algo que la model card no documenta.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse la licencia del modelo base (MIT según su ficha) y la del autor antes de cualquier despliegue en producción.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe más allá del heredado del modelo base.
- Artefacto de investigación con 0 descargas y sin documentación de uso previsto: no apto para producción sin una evaluación propia exhaustiva.
- El nombre del repositorio incluye "archive-20261103", lo que sugiere que es un artefacto archivado de un experimento, no un modelo mantenido.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb
- Variante hermana (RMU / weight distance): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance
- Variante hermana (ME-TAR k16): https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Dataset de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset de retención: https://huggingface.co/datasets/Salesforce/wikitext
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
