# Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA

## Resumen

Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA es un adaptador LoRA (PEFT) que especializa el modelo Mistral-7B-Instruct-v0.3 en razonamiento estructurado en sindhi (idioma `sd`). Lo desarrolla Kamyar Zeinalipour y se publicó junto al artículo *Enabling Structured Reasoning in Sindhi with Culturally Grounded Instruction Tuning* (LoResLM 2026). El adaptador no es un modelo autónomo: requiere cargar el modelo base Mistral-7B-Instruct-v0.3 y aplicar los pesos LoRA encima.

El modelo resuelve un problema concreto: los LLM generalistas rinden mal en tareas de razonamiento en lenguas de bajos recursos como el sindhi. Para ello se entrena sobre Sindhi-Reasoning-Instruct, un corpus de 2.089 ítems de instrucción pregunta-respuesta anclados culturalmente, donde cada ítem exige uno de cuatro tipos de razonamiento (deductivo, inductivo, causal o de sentido común). La salida esperada es una respuesta breve con explicación en sindhi, formateada como JSON `{"final_answer": ...}`.

La relevancia es doble: por un lado demuestra que el ajuste fino con LoRA sobre un modelo de 7B puede mejorar sustancialmente el razonamiento en un idioma de bajos recursos; por otro, forma parte de una familia de adaptadores (Llama-3.2-1B/3B, Llama-3.1-8B, Mistral-7B, Mistral-Nemo-12B y Mistral-Small-24B) que permite comparar el efecto del tamaño del modelo base con el mismo corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Mistral-7B-Instruct-v0.3 |
| Parametros totales | 7B (modelo base); adaptador LoRA de 0,8 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | sindhi (`sd`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only de 7B parámetros. El ajuste fino usa LoRA con r = 64, α = 128 y dropout 0,1, aplicado no solo a las proyecciones de atención (q/k/v/o) y a las capas feed-forward (gate/up/down), sino también a `embed_tokens` y `lm_head`. Precisamente por incluir estas dos matrices de vocabulario, el adaptador ocupa 0,8 GB en lugar de los pocos cientos de MB habituales de un LoRA convencional.

El entrenamiento se realizó sobre el split de entrenamiento de Sindhi-Reasoning-Instruct (2.089 ítems), durante 3 épocas con AdamW, learning rate 1e-4, scheduler coseno, weight decay 1e-4, precisión bf16, DeepSpeed ZeRO-3 y Flash Attention 2, con batches de 4 secuencias por GPU, 2 pasos de acumulación de gradiente y empaquetado a 2.048 tokens, usando 3 × RTX A6000 y semilla 100. No se menciona en la información disponible el uso de RLHF o DPO; el entrenamiento es de instrucción supervisada sobre pares pregunta-respuesta con formato JSON de salida.

## Capacidades

- Razonamiento deductivo, inductivo, causal y de sentido común en sindhi sobre un pasaje de contexto.
- Generación de respuestas con explicación breve y salida estructurada en JSON (`{"final_answer": ...}`).
- Instrucción conversacional multi-turno (hereda el formato de chat de Mistral-7B-Instruct-v0.3, aplicado con `apply_chat_template`).
- Comprensión lectora en sindhi: recibe pasaje, tipo de razonamiento y pregunta, y responde en el mismo idioma.
- Generación de texto general en sindhi, aunque el ajuste está orientado a tareas de razonamiento.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Evaluación de razonamiento en lenguas de bajos recursos: usar el adaptador como línea base especializada en sindhi para medir la mejora frente al modelo base en tareas deductivas, inductivas, causales y de sentido común, con métricas como ROUGE-L, BLEU o BERTScore.
- Investigación académica en NLP de bajos recursos: reproducir el experimento del paper LoResLM 2026 y comparar el efecto del tamaño del modelo base dentro de la familia Sindhi-Reasoning (1B, 3B, 7B, 8B, 12B, 24B).
- Sistemas de respuesta a preguntas sobre textos en sindhi: dado un pasaje (por ejemplo, un texto educativo o cultural), el modelo extrae y razona la respuesta en sindhi con una explicación breve.
- Tutoría educativa en sindhi: generar explicaciones razonadas para preguntas de comprensión lectora, aprovechando que el corpus está anclado culturalmente y cubre cuatro tipos de razonamiento.
- Extracción estructurada de respuestas: al devolver JSON `{"final_answer": ...}`, el adaptador se puede integrar en pipelines que necesiten parsear la respuesta de forma programática.
- Prototipado de asistentes conversacionales en sindhi: desplegar el modelo base con el adaptador fusionado (`merge_and_unload`) para conversaciones multi-turno en este idioma.
- Generación de datos sintéticos en sindhi: usar el modelo para producir pares pregunta-respuesta razonados que amplíen corpus de entrenamiento o evaluación en el idioma.

## Benchmarks y rendimiento

Resultados sobre el split de test (100 ítems), comparando el modelo base con el adaptador:

| Metrica | Base | Sindhi-Reasoning LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0.317 | 0.426 | +0.110 |
| BLEU | 0.126 | 0.247 | +0.121 |
| TF-IDF similarity | 0.266 | 0.421 | +0.155 |
| E5 similarity | 0.886 | 0.940 | +0.054 |
| BERTScore F1 | 0.877 | 0.916 | +0.039 |

Evaluación humana (media, A = 5 … E = 1); la respuesta ajustada se prefirió sobre la del base en el 92% de los ítems y la valoración media subió un 59%:

| Tipo de razonamiento | Base | Fine-tuned |
|---|---:|---:|
| Todos | 2.21 | 3.52 |
| Deductivo | 2.00 | 3.13 |
| Inductivo | 2.62 | 3.71 |
| Causal | 2.33 | 3.58 |
| Sentido común | 1.91 | 3.77 |

BERTScore F1 del adaptador frente a otras variantes de la familia (base → fine-tuned): Llama-3.2-1B 0.850 → 0.890; Llama-3.2-3B 0.867 → 0.901; Llama-3.1-8B 0.895 → 0.918; Mistral-7B 0.877 → 0.916; Mistral-Nemo-12B 0.871 → 0.915.

## Requisitos de hardware

- VRAM para inferencia: el adaptador requiere cargar el modelo base de 7B. En bf16 se estiman unos 14-16 GB de VRAM; en cuantización de 8 bits, alrededor de 8-10 GB; en 4 bits, aproximadamente 4-6 GB (estimaciones a partir del tamaño del modelo base, no publicadas por el autor).
- GPU recomendadas: RTX A6000 (usada en el entrenamiento), A100, H100 para bf16 sin cuantizar; RTX 4090, RTX 3090 y GPUs con 24 GB para bf16; GPUs consumer de 8-12 GB con cuantización 4/8 bits.
- Cabe en GPU consumer: sí, con cuantización (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB en bf16).
- Despliegue: transformers + PEFT (carga del adaptador y `merge_and_unload`), vLLM y TGI tras fusionar los pesos, y llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: el modelo base está gated; hay que aceptar sus términos y ejecutar `huggingface-cli login`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BERTScore F1 (fine-tuned) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA (este) | 7B | no disponible | 0.916 | Apache 2.0 (adaptador); base con términos propios | Hugging Face (0 descargas, 0 likes) |
| Sindhi-Reasoning-Llama-3.1-8B-Instruct-LoRA | 8B | no disponible | 0.918 | no disponible en la informacion proporcionada | Hugging Face |
| Sindhi-Reasoning-Mistral-Nemo-Instruct-2407-LoRA | 12B | no disponible | 0.915 | no disponible en la informacion proporcionada | Hugging Face |
| Sindhi-Reasoning-Llama-3.2-1B-Instruct-LoRA | 1B | no disponible | 0.890 | no disponible en la informacion proporcionada | Hugging Face |
| Mistral-7B-Instruct-v0.3 (base sin ajuste) | 7B | no disponible | 0.877 | términos del modelo base | Hugging Face (gated) |

## Limitaciones y advertencias

- El adaptador no es autónomo: necesita el modelo base Mistral-7B-Instruct-v0.3, que está gated y sujeto a sus propios términos de uso.
- El ajuste está orientado exclusivamente al sindhi; el rendimiento en otros idiomas no está documentado y probablemente se degrade respecto al modelo base.
- El corpus de entrenamiento es pequeño (2.089 ítems), lo que aumenta el riesgo de sobreajuste al formato y al dominio cultural del dataset.
- La salida esperada es JSON `{"final_answer": ...}`; fuera de ese formato el modelo puede comportarse de forma inconsistente.
- Riesgo de alucinación en pasajes largos o preguntas fuera de la distribución del corpus de entrenamiento; no se documentan evaluaciones de fidelidad factual.
- Sesgos: al estar anclado culturalmente a un corpus concreto, puede reproducir sesgos presentes en los datos de instrucción; no se detallan análisis de sesgo en la información disponible.
- Licencia Apache 2.0 para el adaptador, pero el uso comercial del conjunto (base + adaptador) queda condicionado por la licencia del modelo base de Mistral.
- No hay datos publicados de latencia, throughput ni comportamiento en producción; el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse que las herede del base sin verificación.

## Enlaces

- Hugging Face (adaptador): https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Dataset Sindhi-Reasoning-Instruct: https://huggingface.co/datasets/Kamyar-zeinalipour/sindi_reasoning
- Colección Sindhi-Reasoning: https://huggingface.co/collections/Kamyar-zeinalipour/sindhi-reasoning-instruct-loreslm-2026-6af467d9e0f19e13ad2d14c0
- Paper (LoResLM 2026): https://aclanthology.org/2026.loreslm-1.22/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Sindhi-Reasoning
