# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb-resist-fft-weight-distance

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de la familia Mistral de 7B, publicado por el usuario `mremila` bajo el identificador `archive-20261103-z7b-wmdp-bio-unlearn-fft-cb-resist-fft-weight-distance`. No se trata de un modelo base entrenado desde cero, sino de un artefacto experimental de un pipeline de *machine unlearning* (desaprendizaje) sobre un modelo previamente ajustado: el config de Axolotl indica que parte de `artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-cb` y usa como referencia `HuggingFaceH4/zephyr-7b-beta`. El objetivo aparente es medir la "resistencia a la manipulación" (tamper resistance) de un proceso de desaprendizaje aplicando una penalización de distancia de pesos entre el modelo y su referencia.

El modelo tiene 7.241.732.096 parámetros (~7,24B) en formato safetensors, con un repositorio de 14,5 GB, lo que corresponde a pesos en bf16/fp16. La arquitectura es un transformer decoder-only de tipo Mistral (el config de entrenamiento envuelve capas `MistralDecoderLayer`). El entrenamiento se realizó con Axolotl 0.18.0 sobre el split de test de `Salesforce/wikitext` (wikitext-2-raw-v1), con secuencia de 512 tokens, 125 pasos y un coeficiente de distancia de pesos de 1,0e+5.

Es relevante ahora porque ilustra una línea de trabajo activa en seguridad de modelos: cómo de robusto es un "olvido" inducido por fine-tuning cuando un atacante vuelve a ajustar el modelo. La model card es automática y prácticamente vacía, sin descripción, usos previstos ni evaluación, por lo que debe tratarse como un artefacto de laboratorio, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (`MistralDecoderLayer`) |
| Parametros totales | 7.241.732.096 (~7,24B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó `sequence_len: 512` |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | `artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-cb` (referencia: `HuggingFaceH4/zephyr-7b-beta`) |
| Framework de entrenamiento | Axolotl 0.18.0, Transformers 5.14.1, PyTorch 2.12.1+cu130 |
| Dataset de entrenamiento | `Salesforce/wikitext`, `wikitext-2-raw-v1`, split `test` |
| Precisión de entrenamiento | bf16, tf32 |
| Repositorio | 14,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral 7B: un transformer decoder-only con atención de ventana deslizante y capas `MistralDecoderLayer`, tal como se deduce del `auto_wrap_policy` de FSDP en el config de Axolotl. No hay innovaciones arquitectónicas propias; el interés está en el procedimiento de ajuste. El entrenamiento se hizo con FSDP v2 sobre 4 dispositivos, `micro_batch_size: 1`, `gradient_accumulation_steps: 4` (batch efectivo de 16), AdamW con lr 1e-05, scheduler lineal sin warmup, 125 pasos y `max_grad_norm: 1.0`.

El rasgo técnico distintivo es el uso de `WeightDistanceTrainer` con `coefficient_weight_dist: 1.0e+5` y `reference_model_name_or_path: HuggingFaceH4/zephyr-7b-beta`. Es decir, además de la pérdida de lenguaje sobre wikitext-2 (con `train_on_inputs: true`), se aplica una penalización fuerte por distancia entre los pesos del modelo y los del modelo de referencia. Esto encaja con un experimento de "resistencia a la manipulación": se intenta que el checkpoint desaprendido no se aleje demasiado de la referencia para que un reajuste posterior no recupere fácilmente la capacidad olvidada. No consta RLHF, DPO ni datos de instrucción; el dataset es texto plano de wikitext.

## Capacidades

- Generación de texto autoregresiva, heredada de la base Mistral/Zephyr de 7B.
- Conversación multi-turno a nivel de formato (tag `conversational`), aunque no hay evidencia de que el ajuste sobre wikitext preserve la calidad de instrucción.
- Generación de código y matemáticas: capacidad potencial por herencia del modelo base, no verificada en este checkpoint.
- Tool calling / function calling: no documentado; no debe asumirse.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingües: no documentadas; el entrenamiento se hizo sobre wikitext en inglés.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatibilidad con Text Generation Inference y endpoints compatibles (tags del repo).

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como punto de partida para medir cuánto conocimiento se recupera tras un reajuste (relearning) y comparar con variantes como `z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft`.
- Evaluación de robustez frente a fine-tuning malicioso: servir el modelo con TGI y aplicar ataques de ajuste controlados para cuantificar la resistencia del olvido.
- Reproducción de experimentos: el config de Axolotl incluido permite replicar el entrenamiento con FSDP en 4 GPU y el mismo dataset.
- Estudio de regularización por distancia de pesos: analizar el efecto de `coefficient_weight_dist: 1.0e+5` sobre la perplejidad en wikitext-2 y sobre la retención de capacidades.
- Baseline en pipelines de seguridad de modelos: comparar contra el modelo base `zephyr-7b-beta` para aislar el efecto del desaprendizaje.
- Docencia y divulgación: ejemplo reproducible de un pipeline de unlearning con Axolotl y FSDP.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones finales: no hay evaluación de calidad ni licencia declarada.

## Benchmarks y rendimiento

El `model-index` de la model card declara un único artefacto (`z7b-wmdp-bio--unlearn-fft-cb--resist-fft-weight-distance`) con la lista de resultados vacía.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~14,5 GB de pesos, más overhead de activaciones y KV cache; en la práctica, 16-24 GB según longitud de contexto y batch.
- En cuantización de 8 bits: ~7-8 GB; en 4 bits: ~4-5 GB (estimaciones, no hay GGUF publicado en el repo).
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente; RTX 4090 (24 GB) para bf16 con batches pequeños; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a bf16 con contexto corto, y en GPUs de 8-12 GB si se cuantiza (requiere convertir los pesos, no incluidos).
- Despliegue: transformers, Text Generation Inference (tags `text-generation-inference` y `endpoints_compatible`); vLLM y llama.cpp/Ollama son viables tras conversión, pero no están documentados.
- Entrenamiento: el config usa FSDP v2 con 4 dispositivos y bf16; se necesitan al menos 4 GPU de clase A100/H100 para replicar los 125 pasos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`archive-20261103-...`) | 7,24B | no disponible (entrenado a 512) | no disponible | Hugging Face | Artefacto de investigación de unlearning |
| `HuggingFaceH4/zephyr-7b-beta` | ~7,24B | 32k (según su card) | MIT | Hugging Face | Modelo de referencia usado en el entrenamiento |
| `mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft` | ~7,24B | no disponible | no disponible | Hugging Face | Variante del mismo pipeline con NPO y relearning |
| `mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` | ~7,24B | no disponible | no disponible | Hugging Face | Otra variante del mismo experimento |

## Limitaciones y advertencias

- Model card automática y vacía: no hay descripción, usos previstos, evaluación ni datos de sesgo.
- Licencia no declarada: no hay autorización explícita para uso comercial; trátese como no apto para producción.
- Entrenado sobre wikitext-2 (texto enciclopédico en inglés) durante solo 125 pasos: la calidad conversacional e instructiva puede haberse degradado respecto a Zephyr-7b-beta.
- Riesgo alto de alucinación y de respuestas incoherentes fuera del dominio de wikitext.
- Idiomas: no documentados; el entrenamiento es monolingüe en inglés.
- Contexto: no se declara ventana nativa; el entrenamiento usó 512 tokens, lo que no garantiza buen comportamiento en contextos largos.
- Es un artefacto de investigación sobre desaprendizaje: no hay garantía de que el "olvido" sea completo ni de que resista ataques de reajuste.
- Sin benchmarks publicados: imposible comparar su rendimiento de forma rigurosa.
- El nombre del repo sugiere un archivo fechado (2026-11-03); verificar la integridad y procedencia antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb-resist-fft-weight-distance
- Variante relacionada: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Variante relacionada: https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft
- Modelo de referencia: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Framework de entrenamiento (Axolotl): https://github.com/axolotl-ai-cloud/axolotl
- Dataset: https://huggingface.co/datasets/Salesforce/wikitext
