# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-2-defense-steps-5000

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-2-defense-steps-5000` es un ajuste fino de `HuggingFaceH4/zephyr-7b-beta` publicado por el usuario mremila en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto de investigación en el ámbito del *machine unlearning*: el nombre indica que se ha aplicado un proceso de desaprendizaje sobre el corpus biológico de WMDP (`cais/wmdp-bio-forget-corpus`) utilizando la técnica RMU (Representation Misdirection for Unlearning) combinada con SAM (Sharpness-Aware Minimization) y un parámetro `rho` de 1e-2, con 5000 pasos de entrenamiento orientados a la defensa.

El modelo conserva la arquitectura transformer decoder-only de Zephyr-7b-beta, con 7.241.732.096 parámetros totales, y se distribuye en formato safetensors. Su relevancia es fundamentalmente metodológica: sirve para estudiar la resistencia de las técnicas de desaprendizaje frente a ataques de recuperación de conocimiento (*tamper resistance*), como sugiere el nombre del proyecto de Weights & Biases (`lp-tamper-resistance`). No está pensado para uso en producción ni como asistente conversacional general.

La model card es automática y mínima (generada por el Trainer de Axolotl), sin descripción de usos previstos, sin datos de evaluación y sin resultados de benchmarks. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral / Zephyr-7b-beta) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó `sequence_len: 512`; Zephyr-7b-beta base soporta 32 768 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, pero no declarada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 75.0 GB |

## Arquitectura y entrenamiento

El modelo parte de Zephyr-7b-beta, un transformer decoder-only de 7 mil millones de parámetros afinado con DPO sobre Mistral-7b. Sobre esa base se aplicó un ajuste fino completo selectivo mediante Axolotl 0.18.0 con un entrenador personalizado (`trainers.rmu.RMUSAMTrainer`). Solo se descongelaron las matrices `mlp.down_proj.weight` de las capas 5, 6 y 7, lo que constituye una intervención muy localizada sobre las representaciones internas del modelo.

El entrenamiento combina el corpus de olvido `cais/wmdp-bio-forget-corpus` con `Salesforce/wikitext` (wikitext-2-raw-v1, split test) como conjunto de retención, con un coeficiente de retención de 1200.0 y un coeficiente de direccionamiento (*steering*) de 6.5 sobre la capa objetivo 7. Se empleó RMU con SAM (`rho = 0.01`), semilla de control 42, `learning_rate` 5e-5, optimizador AdamW, scheduler constante, `micro_batch_size` 8, `max_steps` 5000, precisión bf16 y `attn_implementation: eager`. No se usó `sample_packing` ni `gradient_checkpointing`. El modelo de referencia para el término de retención es el propio Zephyr-7b-beta original. No se declaran datos de RLHF o DPO adicionales en este ajuste.

## Capacidades

- Generación de texto conversacional heredada de Zephyr-7b-beta (formato de chat con tokens `<|user|>` / `<|assistant|>`).
- Razonamiento y respuesta a instrucciones en inglés, en la medida en que el desaprendizaje no las haya degradado (no hay evaluación publicada).
- El objetivo declarado del ajuste es la supresión de conocimiento biológico sensible del corpus WMDP-bio, no la adquisición de nuevas capacidades.
- No se declara soporte de tool calling, function calling ni capacidades de agente en la información disponible.
- No se declara soporte multilingüe explícito ni modo de razonamiento (*thinking mode*), visión o audio.
- No se declaran capacidades especiales más allá de la modificación de representaciones internas mediante RMU.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como punto de comparación para medir cuánto conocimiento biológico sensible persiste tras RMU+SAM con `rho = 1e-2` y 5000 pasos, frente a otras variantes del mismo autor (por ejemplo, los artefactos `...-unlearn-fft-cb` y `...-unlearn-fft-me-tar-k16`).
- Evaluación de resistencia a la manipulación (*tamper resistance*): permite reproducir ataques de *fine-tuning* malicioso o *prompting* adversarial para comprobar si el conocimiento "olvidado" se recupera, que es precisamente lo que sugiere el nombre del proyecto `lp-tamper-resistance`.
- Estudio de la localización de conocimiento en transformers: al congelar todo salvo tres matrices `down_proj` (capas 5-7), el modelo es un caso de estudio sobre si el conocimiento factual biológico se concentra en esas capas y proyecciones.
- Reproducibilidad de pipelines de desaprendizaje con Axolotl: la configuración YAML completa está publicada en la model card, lo que facilita replicar el experimento con el mismo `RMUSAMTrainer` y los mismos hiperparámetros.
- Análisis de degradación de utilidad: comparar la perplejidad en wikitext-2 y el rendimiento en tareas generales antes y después del desaprendizaje para cuantificar el coste del olvido.
- Docencia y formación en seguridad de IA: como ejemplo práctico de un artefacto de desaprendizaje con configuración abierta y trazable.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre del artefacto y una lista de resultados vacía (`"results": []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14-15 GB solo para los pesos (7.24 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- En cuantización de 8 bits: en torno a 8 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 4-5 GB, aunque no se declaran cuantizaciones oficiales en el repositorio.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, o una RTX 4090 (24 GB) para inferencia con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp/Ollama/vLLM si se generan pesos GGUF o se usa el modelo base compatible, aunque no se declaran artefactos de ese tipo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...rmu-sam-rho1e-2-defense-steps-5000`) | 7.24 B | no disponible | Ajuste de desaprendizaje (RMU+SAM) sobre Zephyr-7b-beta | no disponible | Hugging Face, 0 descargas |
| `HuggingFaceH4/zephyr-7b-beta` (base) | 7.24 B | 32 768 tokens | Chat DPO sobre Mistral-7b | MIT | Hugging Face, ampliamente usado |
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb` | no disponible | no disponible | Variante de desaprendizaje del mismo autor | no disponible | Hugging Face |
| `mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` | no disponible | no disponible | Variante de desaprendizaje del mismo autor | no disponible | Hugging Face |

## Limitaciones y advertencias

- La model card es automática y no documenta usos previstos, limitaciones ni datos de evaluación; cualquier uso en producción carece de garantías.
- El objetivo del modelo es *eliminar* conocimiento biológico sensible; no debe emplearse como asistente general sin verificar antes que sus capacidades conversacionales no se han degradado.
- Riesgo de alucinación: no evaluado; el proceso RMU puede alterar representaciones y aumentar la incoherencia factual en dominios distintos del olvidado.
- Sesgos conocidos: heredados de Zephyr-7b-beta y de los corpus de entrenamiento (WMDP-bio y wikitext); no se han documentado mitigaciones específicas.
- Licencia no declarada: no se puede asumir uso comercial permitido; la licencia del modelo base (MIT para Zephyr-7b-beta) no implica necesariamente la de este derivado.
- Idiomas no declarados: se asume inglés por herencia del modelo base, pero no está confirmado.
- Contexto de entrenamiento limitado a 512 tokens; el comportamiento con contextos largos no está validado para este ajuste.
- El repositorio ocupa 75 GB, lo que sugiere la presencia de múltiples checkpoints (`save_total_limit: 5`) además de los pesos finales; conviene revisar qué ficheros se descargan.
- No hay resultados de benchmarks ni métricas de retención/olvido publicadas, por lo que la eficacia del desaprendizaje no puede verificarse a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-2-defense-steps-5000
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Variante relacionada del mismo autor: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb
- Variante relacionada del mismo autor: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Dataset de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset de retención: https://huggingface.co/datasets/Salesforce/wikitext
- Framework de entrenamiento Axolotl: https://github.com/axolotl-ai-cloud/axolotl
