# Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.1-8B-Instruct-LoRA

## Resumen

Sindhi-Reasoning-Llama-3.1-8B-Instruct-LoRA es un adaptador LoRA (PEFT) que ajusta el modelo meta-llama/Llama-3.1-8B-Instruct para resolver tareas de razonamiento estructurado en sindhi (ISO 639-1: sd), un idioma de bajos recursos. Lo desarrolla Kamyar-zeinalipour y se publicó junto con el artículo *Enabling Structured Reasoning in Sindhi with Culturally Grounded Instruction Tuning* (LoResLM 2026). El adaptador no es un modelo completo: requiere cargar el modelo base y fusionar los pesos mediante PEFT.

El problema que aborda es la escasez de modelos capaces de razonar en sindhi con calidad comparable al inglés. Para ello se entrenó sobre Sindhi-Reasoning-Instruct, un corpus de 2.089 ítems de instrucción pregunta-respuesta construidos sobre pasajes en sindhi, cada uno asociado a uno de cuatro tipos de razonamiento: deductivo, inductivo, causal y de sentido común. La salida esperada es una respuesta breve en sindhi con formato JSON `{"final_answer": ...}`.

El adaptador tiene un tamaño de repositorio de 2,5 GB porque el LoRA se aplicó también a `embed_tokens` y `lm_head`, que PEFT almacena junto con el adaptador. La licencia es llama3.1, heredada del modelo base, y el pipeline declarado es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8B (modelo base); adaptador LoRA con r=64, α=128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3.1-8B-Instruct soporta 128k tokens, dato no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base fusionado) |
| Idiomas soportados | sindhi (sd) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8.000 millones de parámetros. El LoRA usa r=64, α=128 y dropout 0,1, y se aplica a las proyecciones q/k/v/o, gate/up/down y también a `embed_tokens` y `lm_head`. El entrenamiento se realizó durante 3 épocas con AdamW, learning rate 1e-4, scheduler coseno y weight decay 1e-4, con batch de 4 secuencias por GPU, 2 pasos de acumulación de gradiente y empaquetado a 2.048 tokens. Se usó bf16, DeepSpeed ZeRO-3, Flash Attention 2, 3 GPUs RTX A6000 y semilla 100.

Los datos de entrenamiento son el split train de Sindhi-Reasoning-Instruct, con 2.089 ítems. Cada ítem contiene un pasaje en sindhi, un tipo de razonamiento (deductivo, inductivo, causal o de sentido común) y una pregunta, y el modelo debe responder en sindhi con una explicación breve en formato JSON. No se menciona en la información disponible el uso de RLHF o DPO; el ajuste es de instrucción supervisada sobre el corpus.

## Capacidades

- Generación de texto en sindhi con respuestas estructuradas en JSON (`{"final_answer": ...}`).
- Razonamiento deductivo, inductivo, causal y de sentido común sobre pasajes en sindhi.
- Instrucción multi-turno mediante plantilla de chat del modelo base (system + user).
- Respuestas con explicación breve además de la respuesta final.
- Capacidades heredadas del modelo base Llama-3.1-8B-Instruct (generación general, código, matemáticas), aunque el ajuste está orientado a sindhi y razonamiento.
- No se documenta soporte específico de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta soporte de visión ni audio.

## Casos de uso

- Evaluación de razonamiento en sindhi: el adaptador permite medir y comparar la calidad de respuestas deductivas, inductivas, causales y de sentido común sobre pasajes en sindhi, usando las métricas ROUGE-L, BLEU, TF-IDF, E5 y BERTScore descritas en la model card.
- Investigación en lenguas de bajos recursos: sirve como punto de partida para estudiar instruction tuning con LoRA en sindhi y para reproducir los experimentos del paper LoResLM 2026.
- Generación de material educativo en sindhi: a partir de un pasaje y una pregunta, el modelo produce una respuesta breve con explicación, útil para crear ejercicios de comprensión y razonamiento.
- Anotación asistida de corpus: el formato JSON de salida facilita integrar las respuestas en pipelines de anotación o validación de datos en sindhi.
- Prototipado de asistentes en sindhi: con el modelo base fusionado se puede desplegar un servicio de pregunta-respuesta sobre textos en sindhi para pruebas internas.
- Comparación de arquitecturas base: al existir adaptadores equivalentes para Llama-3.2-1B/3B, Mistral-7B, Mistral-Nemo-12B y Mistral-Small-24B, permite comparar el rendimiento en sindhi entre distintos tamaños y familias con el mismo corpus.

## Benchmarks y rendimiento

Resultados en el split de test (100 ítems) según la model card:

| Metrica | Base | Sindhi-Reasoning LoRA | Δ |
|---|---:|---:|---:|
| ROUGE-L | 0,363 | 0,431 | +0,068 |
| BLEU | 0,170 | 0,247 | +0,077 |
| Similitud TF-IDF | 0,304 | 0,418 | +0,114 |
| Similitud E5 | 0,914 | 0,943 | +0,029 |
| BERTScore F1 | 0,895 | 0,918 | +0,023 |

Evaluación humana (media, A = 5 … E = 1); la respuesta ajustada fue preferida sobre la base en el 91 % de los ítems y la media subió un 38 %:

| Tipo de razonamiento | Base | Fine-tuned |
|---|---:|---:|
| Todos | 3,13 | 4,32 |
| Deductivo | 3,10 | 4,03 |
| Inductivo | 2,79 | 4,21 |
| Causal | 3,50 | 4,54 |
| Sentido común | 3,14 | 4,59 |

## Requisitos de hardware

- El adaptador LoRA pesa 2,4 GB; para inferencia hay que cargar además el modelo base Llama-3.1-8B-Instruct.
- En bf16, el modelo base de 8B requiere aproximadamente 16 GB de VRAM solo para pesos, más memoria para el contexto y la caché KV.
- Con cuantización de 4 bits (no documentada en la ficha, pero habitual en el ecosistema) el modelo base podría caber en GPUs consumer de 8-12 GB, aunque este dato no está confirmado en la información disponible.
- GPUs recomendadas: RTX A6000 (usadas en el entrenamiento), A100, H100 para despliegue en bf16; RTX 4090 (24 GB) puede alojar el modelo en bf16 con contexto moderado.
- Opciones de despliegue: transformers + PEFT (como en el ejemplo de la model card), con posibilidad de fusionar el adaptador mediante `merge_and_unload()`. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card incluye una familia de adaptadores Sindhi-Reasoning sobre distintos modelos base, con BERTScore F1 antes y después del ajuste:

| Modelo base | Parametros | BERTScore F1 (base → fine-tuned) |
|---|---:|---|
| Llama-3.2-1B-Instruct | 1B | 0,850 → 0,890 |
| Llama-3.2-3B-Instruct | 3B | 0,867 → 0,901 |
| Llama-3.1-8B-Instruct (este modelo) | 8B | 0,895 → 0,918 |
| Mistral-7B-Instruct-v0.3 | 7B | 0,877 → 0,916 |
| Mistral-Nemo-Instruct-2407 | 12B | 0,871 → 0,915 |
| Mistral-Small-24B-Instruct-2501 | 24B | 0,871 → 0,915 |

El adaptador de 8B sobre Llama-3.1 obtiene el mayor BERTScore F1 tras el ajuste (0,918) entre los modelos listados, seguido de cerca por Mistral-7B (0,916) y Mistral-Nemo-12B (0,915). No se dispone de comparación con modelos no ajustados a sindhi ni con otros adaptadores externos a esta familia.

## Limitaciones y advertencias

- El adaptador está entrenado únicamente en sindhi; su uso en otros idiomas no está validado y probablemente degrade la calidad.
- El corpus de entrenamiento es pequeño (2.089 ítems), lo que limita la generalización a dominios y estilos no representados.
- Riesgo de alucinación inherente al modelo base Llama-3.1-8B-Instruct, especialmente en pasajes largos o preguntas ambiguas.
- La salida esperada es JSON `{"final_answer": ...}`; fuera de ese formato el modelo puede producir respuestas inconsistentes.
- La licencia llama3.1 impone restricciones de uso comercial heredadas del modelo base; es necesario revisar los términos de Meta antes de un despliegue en producción.
- El modelo base está gated en Hugging Face: hay que aceptar sus términos e iniciar sesión con `huggingface-cli login`.
- El adaptador no es un modelo autónomo: requiere cargar y fusionar el modelo base, lo que añade complejidad operativa.
- No se documentan evaluaciones de sesgo, robustez ni seguridad en la información disponible.
- El tamaño del repositorio (2,5 GB) se debe a que el LoRA incluye `embed_tokens` y `lm_head`, lo que aumenta el peso frente a un LoRA convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.1-8B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset: https://huggingface.co/datasets/Kamyar-zeinalipour/sindi_reasoning
- Paper (LoResLM 2026): https://aclanthology.org/2026.loreslm-1.22/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Sindhi-Reasoning
- Colección Sindhi-Reasoning: https://huggingface.co/collections/Kamyar-zeinalipour/sindhi-reasoning-instruct-loreslm-2026-6af467d9e0f19e13ad2d14c0
- Adaptador Llama-3.2-1B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.2-1B-Instruct-LoRA
- Adaptador Llama-3.2-3B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.2-3B-Instruct-LoRA
- Adaptador Mistral-7B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA
- Adaptador Mistral-Nemo-12B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-Nemo-Instruct-2407-LoRA
- Adaptador Mistral-Small-24B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-Small-24B-Instruct-2501-LoRA
