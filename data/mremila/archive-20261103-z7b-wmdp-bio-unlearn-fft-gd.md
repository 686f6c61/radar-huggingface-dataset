# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd

## Resumen

`mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd` es un ajuste fino (fine-tuning) del modelo `HuggingFaceH4/zephyr-7b-beta` publicado por el usuario mremila. Por la nomenclatura del identificador y la configuracion de entrenamiento, se trata de un experimento de *machine unlearning* orientado a eliminar conocimiento de dominio biologico del modelo base, empleando el corpus `cais/wmdp-bio-forget-corpus` (el conjunto de "olvido" del benchmark WMDP en su variante de bioseguridad) junto con `Salesforce/wikitext` como corpus de retencion.

El modelo conserva la arquitectura del Zephyr-7B-beta original (transformer decoder-only derivado de Mistral-7B), con 7.241.732.096 parametros segun los pesos en safetensors. El entrenamiento se realizo con Axolotl 0.18.0 y un `GradDiffTrainer` personalizado que aplica Gradient Difference, una tecnica de desaprendizaje que combina una perdida de olvido (sobre el corpus WMDP-bio) con una perdida de retencion (sobre wikitext), con coeficientes `forget_coefficient: 1.0` y `retain_coefficient: 4.0`.

Es relevante ahora porque forma parte de una linea de trabajo sobre *tamper resistance* y desaprendizaje de capacidades peligrosas en modelos de lenguaje (proyecto identificado en W&B como `lp-tamper-resistance`). No obstante, es un artefacto de investigacion archivado, sin model card completada, sin licencia declarada y sin resultados de evaluacion publicados, por lo que no esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-7B, base Zephyr-7B-beta) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso `sequence_len: 512`; el contexto del modelo base Zephyr-7B-beta es de 32768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15.0 GB |
| Modelo base | HuggingFaceH4/zephyr-7b-beta |
| Framework de entrenamiento | Axolotl 0.18.0 con `trainers.gd.GradDiffTrainer` |
| Libreria de inferencia | transformers; compatible con text-generation-inference y endpoints |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Zephyr-7B-beta, un transformer decoder-only de 7 mil millones de parametros derivado de Mistral-7B y ajustado con DPO por HuggingFaceH4. Este repositorio no modifica la arquitectura: solo aplica un ajuste fino adicional sobre los pesos existentes.

El entrenamiento se ejecuto con Axolotl 0.18.0 usando un `GradDiffTrainer` personalizado (Gradient Difference). La configuracion combina dos datasets: `cais/wmdp-bio-forget-corpus` (split train, corpus de olvido de bioseguridad) y `Salesforce/wikitext` (wikitext-2-raw-v1, split test, corpus de retencion). Los coeficientes son `forget_coefficient: 1.0` y `retain_coefficient: 4.0`, con muestreo `optml`. Los hiperparametros principales: `sequence_len: 512`, `micro_batch_size: 8`, `gradient_accumulation_steps: 1`, `max_steps: 125`, `learning_rate: 2.5e-6`, optimizador AdamW, scheduler lineal con 12 pasos de warmup, `bf16: true`, `max_grad_norm: 1.0` y `seed: 42`. El entrenamiento se distribuyo en 4 dispositivos (`device_map` con capas 0-7 en GPU 0, 8-15 en GPU 1, 16-23 en GPU 2 y 24-31 mas norm y lm_head en GPU 3). No se aplico packing de muestras ni gradient checkpointing, y la implementacion de atencion fue `eager`. No se realizo evaluacion durante el entrenamiento (`eval_strategy: 'no'`) ni se reservo conjunto de validacion (`val_set_size: 0.0`).

La innovacion tecnica destacable es el uso de Gradient Difference para desaprendizaje: se penaliza la probabilidad de los datos de olvido mientras se preserva el comportamiento sobre datos de retencion, con un peso cuatro veces mayor para la retencion. Es una tecnica de *machine unlearning* aplicada a un modelo conversacional ya alineado.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste DPO de Zephyr-7B-beta.
- Razonamiento general y respuesta a instrucciones en formato chat (el modelo base usa el formato de chat de Zephyr).
- Capacidad de codigo y matematicas en la medida en que la conserva el modelo base; no hay evaluacion especifica en este repositorio.
- Soporte de tool calling / function calling: no documentado en este repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como "no disponible".
- Objetivo declarado (por el nombre y la configuracion): reduccion del conocimiento de dominio biologico de doble uso mediante desaprendizaje, manteniendo el rendimiento general sobre wikitext.
- No dispone de vision ni audio.

## Casos de uso

- Investigacion en machine unlearning: usar el modelo como referencia para estudiar si Gradient Difference elimina conocimiento de bioseguridad sin degradar el modelo base; requiere comparar contra `HuggingFaceH4/zephyr-7b-beta` en tareas de retencion.
- Evaluacion de tamper resistance: el proyecto W&B asociado (`lp-tamper-resistance`) sugiere estudiar si el desaprendizaje resiste reajustes posteriores; el modelo serviria como punto de partida en ese protocolo experimental.
- Reproduccion de experimentos de desaprendizaje: la configuracion de Axolotl esta publicada integra, lo que permite replicar el entrenamiento con los mismos datasets, coeficientes y semilla (42).
- Analisis de degradacion por olvido: medir la perdida de capacidades generales (wikitext, conversacion) tras 125 pasos de Gradient Difference con `retain_coefficient: 4.0`.
- Estudio de sesgos inducidos por el corpus de olvido: analizar como el ajuste sobre el corpus WMDP-bio afecta a las respuestas del modelo en dominios proximos (biologia general, medicina).
- Baseline en comparativas de tecnicas de unlearning: el repositorio hermano `archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance` y `z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` permiten comparar Gradient Difference frente a RMU y otras variantes sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una entrada (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-gd`) con la lista de resultados vacia. No se aportan cifras de MMLU, WMDP, HumanEval, GSM8K ni de retencion sobre wikitext.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 14-15 GB solo para los pesos (7.241 millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; el repositorio ocupa 15.0 GB en safetensors.
- En cuantizacion de 8 bits: aproximadamente 7-8 GB de VRAM; en 4 bits (si se generan pesos GGUF/AWQ a partir de los safetensors, no publicados): en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente con contexto largo; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa. vLLM es compatible con el formato safetensors de Mistral, aunque no esta declarado por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Nota: el entrenamiento uso `attn_implementation: eager` y `sequence_len: 512`, lo que no condiciona la inferencia pero si refleja un ajuste de bajo coste computacional (125 pasos, batch efectivo de 8).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd` | 7.24 B | no disponible | Desaprendizaje WMDP-bio con Gradient Difference | no disponible | Hugging Face, 0 descargas |
| `HuggingFaceH4/zephyr-7b-beta` (base) | 7.24 B | 32768 tokens (segun model card del base) | Chat alineado con DPO | MIT (segun el modelo base; no confirmado en este repo) | Ampliamente disponible |
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance` | 7.24 B (presumiblemente) | no disponible | Desaprendizaje WMDP-bio con RMU | no disponible | Hugging Face |
| `mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` | no disponible | no disponible | Desaprendizaje WMDP-bio, variante ME-TAR | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de evaluacion figuran como "More information needed".
- Sin licencia declarada: no se puede asumir uso comercial; la licencia del modelo base (Zephyr-7B-beta) no se hereda automaticamente de forma explicita en este repositorio y deberia verificarse antes de cualquier uso.
- Sin evaluacion: no hay resultados que confirmen que el desaprendizaje haya sido efectivo ni que la retencion se haya preservado; el entrenamiento se detuvo a los 125 pasos sin validacion (`val_set_size: 0.0`, `eval_strategy: 'no'`).
- Riesgo de alucinacion: inherente al modelo base y potencialmente alterado por el ajuste; no cuantificado.
- Degradacion potencial: el ajuste con `retain_coefficient: 4.0` sobre wikitext puede haber desplazado la distribucion del modelo base; no hay mediciones de retencion publicadas.
- Idiomas no declarados: no se garantiza el comportamiento multilingue del Zephyr original.
- Contexto de entrenamiento limitado a 512 tokens: no implica un limite de inferencia, pero el ajuste no cubre secuencias largas.
- Artefacto archivado: el prefijo `archive-20261103` y las 0 descargas sugieren que es un snapshot de investigacion, no un modelo mantenido.
- Uso dual: aunque el objetivo es eliminar conocimiento de bioseguridad, no hay evidencia publicada de que el olvido sea robusto frente a reajustes o prompting adversario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Variante RMU (weight distance): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance
- Variante ME-TAR: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Dataset WMDP-bio forget corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset Wikitext: https://huggingface.co/datasets/Salesforce/wikitext
