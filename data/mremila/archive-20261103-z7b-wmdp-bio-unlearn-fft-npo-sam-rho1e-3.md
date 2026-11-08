# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-npo-sam-rho1e-3

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-npo-sam-rho1e-3` es un ajuste fino de `HuggingFaceH4/zephyr-7b-beta` orientado a la eliminación selectiva de conocimiento biomédico sensible mediante técnicas de *machine unlearning*. Lo publica el usuario `mremila` como parte de una familia de experimentos (prefijo `z7b-wmdp-bio`) en los que se combina el corpus de olvido `cais/wmdp-bio-forget-corpus` con un corpus de retención (`Salesforce/wikitext`) para preservar capacidades generales mientras se suprime información concreta.

El objetivo declarado por la configuración de entrenamiento es producir un modelo que "olvide" contenido biomédico de riesgo (el corpus WMDP-Bio se asocia a conocimiento de bioseguridad y armas biológicas) sin degradar el comportamiento conversacional general. Para ello se emplea un entrenamiento NPO (Negative Preference Optimization) con penalización SAM (Sharpen-Aware Minimization) y un coeficiente `rho=1e-3`, sobre el modelo base Zephyr-7B-beta, un transformer decoder-only de 7.241 millones de parámetros.

Es relevante ahora porque el *unlearning* es una línea activa de investigación en seguridad de IA y cumplimiento normativo (derecho al olvido, retirada de datos), y este checkpoint forma parte de un barrido de hiperparámetros (HPO) reproducible con Axolotl 0.18.0. No obstante, es un artefacto de investigación: no hay model card descriptiva, no se declaran idiomas ni licencia, y no se publican resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral / Zephyr-7B-beta) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso `sequence_len: 512` |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en bf16 se puede cuantizar a GGUF/AWQ/GPTQ con herramientas externas, pero no esta declarado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 15.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de `HuggingFaceH4/zephyr-7b-beta`, un transformer decoder-only de 7.241 millones de parámetros con atención causal estándar (la configuración de entrenamiento usa `attn_implementation: eager`). No se introduce ninguna modificación arquitectónica: el checkpoint es un ajuste fino completo (*full fine-tuning*, no LoRA) del modelo base, por lo que conserva su tokenizador, su ventana de contexto y su comportamiento de generación.

El entrenamiento se realizó con Axolotl 0.18.0 y un `trainer_cls` personalizado (`trainers.npo.NPOSAMTrainer`), que implementa NPO con `beta=0.0225`, `retain_coefficient=1.0` y `rho=0.001`, apoyado en SAM. Los datos combinan `cais/wmdp-bio-forget-corpus` (split `train`, tipo `data.authors_documents`) con `Salesforce/wikitext` (`wikitext-2-raw-v1`, split `test`) como corpus de retención. Hiperparámetros clave: `sequence_len=512`, `micro_batch_size=8`, `gradient_accumulation_steps=1`, `max_steps=150`, `learning_rate=1e-6`, optimizador `adamw_torch`, scheduler constante sin warmup, `bf16=true`, `max_grad_norm=0.0`, sin `gradient_checkpointing`, `sample_packing=false`, `train_on_inputs=true`, `seed=42`. El reparto del modelo en 4 GPUs (`device_map` con capas 0-7 en GPU 0, 8-15 en GPU 1, 16-23 en GPU 2, 24-31 + norm + lm_head en GPU 3) sugiere un entrenamiento en 4 aceleradores con ~2 GB de pesos por dispositivo en bf16.

## Capacidades

- Generación de texto conversacional en formato chat (hereda el formato de Zephyr-7B-beta, con etiquetas `<|system|>`, `<|user|>`, `<|assistant|>`).
- Razonamiento general y respuesta a instrucciones, en la medida en que el ajuste fino de 150 pasos con `lr=1e-6` no lo degrade.
- Capacidad de *unlearning*: se espera que el modelo haya reducido su conocimiento sobre el dominio biomédico de riesgo cubierto por `cais/wmdp-bio-forget-corpus`, manteniendo el rendimiento en wikitext.
- Soporte de tool calling / function calling: no disponible explícitamente; el modelo base Zephyr no lo declara de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia en experimentos que comparan NPO+SAM con otras técnicas (gradient ascent, KL regularization, DPO-based unlearning) sobre el mismo corpus WMDP-Bio.
- Evaluación de retención de capacidades: medir la degradación en wikitext y en benchmarks generales (MMLU, HellaSwag) tras el olvido, para cuantificar el coste del *unlearning*.
- Cumplimiento del derecho al olvido: prototipar pipelines que eliminen información concreta de un modelo ajustado sin reentrenar desde cero, usando este checkpoint como ejemplo de referencia.
- Auditoría de seguridad de modelos: emplear el checkpoint como caso de estudio para probar si el conocimiento "olvidado" es recuperable mediante *jailbreaks* o *fine-tuning* posterior (el repo hermano `z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft` sugiere precisamente esta línea de trabajo).
- Reproducibilidad de barridos HPO: el nombre del checkpoint (`...-hpo--004`) y la configuración de Axolotl permiten reproducir el experimento y comparar hiperparámetros (`rho`, `beta`, `retain_coefficient`).
- Base para ajuste fino posterior: al conservar la arquitectura y el tokenizador de Zephyr-7B-beta, puede reutilizarse en pipelines que ya integran ese modelo (vLLM, TGI, llama.cpp) sustituyendo únicamente los pesos.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada con `results: []`, es decir, sin métricas. La sección "Training results" del README está vacía.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~14,5 GB de pesos (7.241 M parámetros × 2 bytes) más overhead de activaciones y KV cache; en la práctica, ~16-18 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: ~7,5-8 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): ~4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bf16 en contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16 y en RTX 4070 Ti/4080 (16 GB) en 8 bits; en 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`), y por compatibilidad con Zephyr-7B-beta también vLLM, llama.cpp/Ollama y TGI previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`z7b-wmdp-bio-unlearn-fft-npo-sam-rho1e-3`) | 7.241 M | no disponible | Unlearning biomédico (NPO+SAM) | no disponible | Hugging Face, 0 descargas |
| `HuggingFaceH4/zephyr-7b-beta` | 7.241 M | 32.768 tokens (según model card del base) | Chat general alineado con DPO | MIT (según model card del base) | Hugging Face, ampliamente usado |
| `mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd` | 7.241 M (presumiblemente) | no disponible | Unlearning biomédico (NPO con weight decay) | no disponible | Hugging Face |
| `mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft` | 7.241 M (presumiblemente) | no disponible | Reaprendizaje tras unlearning (estudio de robustez) | no disponible | Hugging Face |

La comparativa se limita a variantes del mismo autor y al modelo base, ya que no se han publicado métricas que permitan contrastar con alternativas de *unlearning* de otros grupos.

## Limitaciones y advertencias

- No hay model card descriptiva: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" dicen literalmente "More information needed".
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; el modelo base Zephyr-7B-beta es MIT, pero el checkpoint derivado no hereda automáticamente esa licencia sin declaración explícita.
- No se declaran idiomas soportados; se asume el comportamiento multilingüe de Zephyr-7B-beta, pero sin garantía.
- No hay resultados de evaluación: se desconoce si el *unlearning* es efectivo, si degrada capacidades generales o si el conocimiento es recuperable.
- Riesgo de alucinación: inherente al modelo base; el ajuste fino de 150 pasos con `lr=1e-6` no lo mitiga.
- Sesgos: heredados de Zephyr-7B-beta y de los corpus de entrenamiento (WMDP-Bio y wikitext), sin auditoría publicada.
- El nombre incluye `archive-20261103`, lo que sugiere un checkpoint archivado o intermedio de un barrido HPO; no debe tratarse como un release estable.
- `max_grad_norm=0.0` desactiva el clipping de gradiente, lo que en un ajuste fino completo puede producir inestabilidad; conviene verificar la calidad de los pesos antes de usarlos en producción.
- El contexto de entrenamiento fue de 512 tokens, muy inferior a la ventana nativa de Zephyr-7B-beta; el comportamiento en contextos largos no está validado para este checkpoint.
- Uso dual: el corpus WMDP-Bio está diseñado para evaluar conocimiento peligroso; un modelo "desaprendido" mal calibrado podría dar respuestas inseguras o, por el contrario, seguir conteniendo el conocimiento si el olvido es superficial.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-npo-sam-rho1e-3
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Corpus de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Corpus de retención: https://huggingface.co/datasets/Salesforce/wikitext
- Repo hermano (unlearning con weight decay): https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd
- Repo hermano (reaprendizaje): https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft
- Axolotl: https://github.com/axolotl-ai-cloud/axolotl
