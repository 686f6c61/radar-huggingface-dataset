# Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.2-3B-Instruct-LoRA

## Resumen

Sindhi-Reasoning-Llama-3.2-3B-Instruct-LoRA es un adaptador LoRA (PEFT) que ajusta el modelo meta-llama/Llama-3.2-3B-Instruct para tareas de razonamiento estructurado en sindhi (código ISO `sd`), una lengua de bajos recursos. Lo desarrolla Kamyar Zeinalipour y se publica junto con el artículo "Enabling Structured Reasoning in Sindhi with Culturally Grounded Instruction Tuning" (LoResLM 2026). El adaptador se entrena sobre Sindhi-Reasoning-Instruct, un corpus de 2.089 ítems de instrucción pregunta-respuesta construidos sobre pasajes en sindhi que exigen uno de cuatro tipos de razonamiento: deductivo, inductivo, causal y de sentido común.

El modelo resuelve un problema concreto: los LLM multilingües generalistas rinden mal en tareas de razonamiento en sindhi, tanto en calidad de la respuesta como en el formato estructurado. Dado un pasaje en sindhi, un tipo de razonamiento y una pregunta, el adaptador devuelve una respuesta breve en sindhi con explicación, en formato JSON `{"final_answer": ...}`. La relevancia actual está en la mejora medible frente al modelo base en métricas automáticas (BERTScore F1 de 0,867 a 0,901) y en evaluación humana (preferencia del 92% de los ítems y subida media de valoración del 83%).

Arquitectónicamente es un transformer decoder-only de 3B parámetros (la familia Llama 3.2) con un adaptador LoRA de rango 64 aplicado no solo a las proyecciones de atención y MLP, sino también a `embed_tokens` y `lm_head`, lo que explica el tamaño del repositorio (1,8 GB). El contexto heredado del modelo base es de 128.000 tokens, aunque el entrenamiento se empaquetó a 2.048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | 3B (modelo base) + adaptador LoRA (r=64) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base); entrenamiento empaquetado a 2.048 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bf16; el adaptador es compatible con cuantizacion del modelo base vía PEFT/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | sindhi (`sd`); el modelo base soporta multilingüe, pero el ajuste está orientado a sindhi |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.2-3B-Instruct, un transformer decoder-only con atención causal estándar. La configuración LoRA es r=64, α=128, dropout 0,1, aplicada a las proyecciones q/k/v/o, gate/up/down, y también a `embed_tokens` y `lm_head`. Esta última decisión es relevante: al adaptar las capas de embedding y de salida, el adaptador incluye matrices de gran tamaño y el repositorio pesa 1,7-1,8 GB en lugar de unos pocos cientos de MB.

El entrenamiento usa el split de train de Sindhi-Reasoning-Instruct (2.089 ítems), con 3 épocas, AdamW, learning rate 1e-4, scheduler coseno, weight decay 1e-4, batch de 4 secuencias por GPU con 2 pasos de acumulación de gradiente, secuencias empaquetadas a 2.048 tokens, precisión bf16, DeepSpeed ZeRO-3 y Flash Attention 2, sobre 3 GPUs RTX A6000 y semilla 100. El corpus está construido sobre pasajes en sindhi con ítems de pregunta-respuesta que cubren razonamiento deductivo, inductivo, causal y de sentido común, con un enfoque explícito en contenido culturalmente fundamentado. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es de instrucción supervisada vía LoRA.

## Capacidades

- Generación de texto y razonamiento estructurado en sindhi: deductivo, inductivo, causal y de sentido común sobre un pasaje dado.
- Respuesta en formato JSON `{"final_answer": ...}` con explicación breve, tal como se entrena.
- Comprensión de pasajes en sindhi y respuesta a preguntas sobre ellos (question answering sobre contexto).
- Instrucción multirround vía chat template del modelo base (roles system/user/assistant).
- Herencia de capacidades generales del modelo base Llama-3.2-3B-Instruct (generación, código, matemáticas básicas), aunque el ajuste está especializado en sindhi y razonamiento.
- No se documenta soporte específico de tool calling, function calling, agentes o multi-step reasoning en la información proporcionada.
- No se documenta capacidad de visión ni audio.

## Casos de uso

- Evaluación de razonamiento en lenguas de bajos recursos: el adaptador sirve como referencia para medir hasta qué punto el ajuste de instrucción mejora el razonamiento en sindhi frente al modelo base, con métricas reproducibles (ROUGE-L, BLEU, BERTScore, E5).
- Sistemas de question answering sobre documentos en sindhi: dado un pasaje (noticia, texto educativo, material administrativo) y una pregunta, el modelo devuelve una respuesta breve y estructurada en JSON, adecuada para integrarse en un pipeline que consuma `final_answer`.
- Tutoría educativa en sindhi: el modelo puede generar explicaciones breves asociadas a una respuesta, útil en entornos de aprendizaje donde se requiere justificar el razonamiento (deductivo, inductivo, causal o de sentido común).
- Investigación en NLP de bajos recursos: el adaptador y su dataset asociado permiten reproducir experimentos de instruction tuning culturalmente fundamentados y comparar familias de modelos (Llama 1B/3B/8B, Mistral 7B/12B/24B) con el mismo corpus.
- Clasificación y extracción estructurada en sindhi: al forzar salida JSON, puede emplearse para tareas donde se necesita una respuesta canónica más una justificación, facilitando el post-procesado automático.
- Preservación y digitalización de contenido cultural en sindhi: el enfoque en pasajes culturalmente fundamentados permite construir asistentes que respondan sobre patrimonio, tradiciones o textos locales en su lengua original.
- Prototipado en hardware modesto: al ser un adaptador sobre un modelo de 3B, puede desplegarse en GPUs de consumo con cuantización, lo que facilita pilotos de investigación sin infraestructura de gran escala.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test (100 ítems):

| Metrica | Base | Sindhi-Reasoning LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,296 | 0,364 | +0,068 |
| BLEU | 0,119 | 0,182 | +0,063 |
| Similitud TF-IDF | 0,198 | 0,322 | +0,124 |
| Similitud E5 | 0,892 | 0,918 | +0,025 |
| BERTScore F1 | 0,867 | 0,901 | +0,033 |

Evaluación humana (valoración media, A=5 … E=1):

| Tipo de razonamiento | Base | Fine-tuned |
|---|---:|---:|
| Todos | 1,62 | 2,96 |
| Deductivo | 1,63 | 2,70 |
| Inductivo | 1,67 | 3,00 |
| Causal | 1,79 | 3,08 |
| Sentido común | 1,36 | 3,14 |

La respuesta fine-tuned fue preferida sobre la del modelo base en el 92% de los ítems, con una subida media de valoración del 83%.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en bf16 requiere aproximadamente 6-7 GB de VRAM; en cuantización de 8 bits, unos 4 GB; en 4 bits, unos 2,5-3 GB. El adaptador LoRA añade un pequeño overhead adicional (el repositorio pesa 1,8 GB por incluir `embed_tokens` y `lm_head`), aunque tras `merge_and_unload` los pesos se integran en el modelo base.
- GPU recomendadas: RTX A6000 (usada en el entrenamiento), A100, H100 para servir a mayor throughput; RTX 4090, RTX 3090, RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en GPUs de 8 GB con cuantización 4 bits.
- Opciones de despliegue: transformers + PEFT (merge_and_unload), vLLM (tras fusionar el adaptador), llama.cpp/Ollama (requiere convertir a GGUF tras fusionar), TGI. El modelo base está gated en Hugging Face, por lo que es necesario aceptar sus términos y autenticarse.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación dentro de la familia Sindhi-Reasoning publicada por el mismo autor (BERTScore F1 base → fine-tuned):

| Modelo base | Parametros | BERTScore F1 (base → fine-tuned) |
|---|---:|---|
| Llama-3.2-1B-Instruct | 1B | 0,850 → 0,890 |
| Llama-3.2-3B-Instruct (este adaptador) | 3B | 0,867 → 0,901 |
| Llama-3.1-8B-Instruct | 8B | 0,895 → 0,918 |
| Mistral-7B-Instruct-v0.3 | 7B | 0,877 → 0,916 |
| Mistral-Nemo-Instruct-2407 | 12B | 0,871 → 0,915 |
| Mistral-Small-24B-Instruct-2501 | 24B | no disponible en el fragmento |

El adaptador de 3B ofrece un equilibrio entre coste computacional y calidad: mejora al de 1B (0,901 frente a 0,890) y se queda por debajo del de 8B (0,918) y de los Mistral de 7B/12B (0,916/0,915). La licencia llama3.2 es más restrictiva que Apache 2.0 de Mistral, lo que puede condicionar el uso comercial.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado únicamente para responder preguntas de razonamiento sobre pasajes en sindhi en formato JSON; su rendimiento fuera de ese dominio no está documentado.
- Corpus pequeño: 2.089 ítems de entrenamiento y 100 de test; los resultados pueden tener alta varianza y no garantizan generalización a otros dominios o registros del sindhi.
- Riesgo de alucinación: como cualquier LLM, puede generar explicaciones plausibles pero incorrectas, especialmente en razonamiento causal y de sentido común, donde la valoración humana media (3,08 y 3,14 sobre 5) sigue siendo moderada.
- Sesgos: no se documenta un análisis de sesgos en la información proporcionada; el corpus está culturalmente fundamentado, lo que puede introducir sesgos de selección cultural.
- Licencia llama3.2: impone restricciones de uso comercial y requiere aceptar los términos del modelo base, que está gated. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Dependencia del modelo base: requiere descargar y aceptar los términos de meta-llama/Llama-3.2-3B-Instruct y autenticarse con `huggingface-cli login`.
- Contexto efectivo: aunque el modelo base soporta 128.000 tokens, el entrenamiento se empaquetó a 2.048 tokens, por lo que el rendimiento en contextos muy largos no está validado.
- Idiomas: el ajuste está orientado a sindhi; el rendimiento en otros idiomas no se ha evaluado y probablemente degrade las capacidades multilingües del modelo base.
- Formato de salida rígido: espera JSON `{"final_answer": ...}`; usos que requieran otro formato pueden necesitar post-procesado o ajuste adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.2-3B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset: https://huggingface.co/datasets/Kamyar-zeinalipour/sindi_reasoning
- Paper (LoResLM 2026): https://aclanthology.org/2026.loreslm-1.22/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Sindhi-Reasoning
- Colección Sindhi-Reasoning: https://huggingface.co/collections/Kamyar-zeinalipour/sindhi-reasoning-instruct-loreslm-2026-6af467d9e0f19e13ad2d14c0
- Adaptador 1B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.2-1B-Instruct-LoRA
- Adaptador 8B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.1-8B-Instruct-LoRA
- Adaptador Mistral-7B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA
- Adaptador Mistral-Nemo-12B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-Nemo-Instruct-2407-LoRA
- Adaptador Mistral-Small-24B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-Small-24B-Instruct-2501-LoRA
