# Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.2-1B-Instruct-LoRA

## Resumen

Sindhi-Reasoning-Llama-3.2-1B-Instruct-LoRA es un adaptador LoRA (PEFT) que ajusta el modelo base meta-llama/Llama-3.2-1B-Instruct para tareas de razonamiento estructurado en sindhi (idioma `sd`). Lo desarrolla Kamyar Zeinalipour y se publicó junto con el artículo «Enabling Structured Reasoning in Sindhi with Culturally Grounded Instruction Tuning» (LoResLM 2026). El adaptador se entrenó sobre Sindhi-Reasoning-Instruct, un corpus de instrucciones en sindhi con pasajes y preguntas que exigen uno de cuatro tipos de razonamiento: deductivo, inductivo, causal y de sentido común.

El modelo resuelve un problema concreto de las lenguas de bajos recursos: la escasez de datos y de capacidad de razonamiento estructurado en sindhi. Dado un pasaje en sindhi, un tipo de razonamiento y una pregunta, el modelo responde en sindhi con una explicación breve en formato JSON `{"final_answer": ...}`. El adaptador se aplica sobre un transformer decoder de 1B parámetros (familia Llama 3.2) y mantiene la ventana de contexto del modelo base.

Es relevante ahora porque demuestra que el ajuste fino con instrucciones culturalmente fundamentadas mejora de forma medible el razonamiento en una lengua de bajos recursos con un coste de adaptación reducido (LoRA sobre un modelo de 1B). El adaptador ocupa 1,1 GB porque el LoRA se aplicó también a `embed_tokens` y `lm_head`, que PEFT almacena junto con el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | 1B (modelo base); adaptador LoRA con r = 64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama-3.2-1B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se entrena en bf16) |
| Idiomas soportados | sindhi (`sd`) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre meta-llama/Llama-3.2-1B-Instruct, un transformer decoder de 1B parámetros. El LoRA usa r = 64, α = 128 y dropout 0.1, y se aplica a las proyecciones q/k/v/o, gate/up/down, además de `embed_tokens` y `lm_head`. El entrenamiento se realizó durante 3 épocas con AdamW, learning rate 1e-4, scheduler coseno y weight decay 1e-4. El batch fue de 4 secuencias por GPU con 2 pasos de acumulación de gradiente, empaquetado a 2.048 tokens. Se usó bf16, DeepSpeed ZeRO-3 y Flash Attention 2 sobre 3 × RTX A6000, con semilla 100.

Los datos de entrenamiento provienen del split de entrenamiento de Sindhi-Reasoning-Instruct (2.089 ítems), un corpus de instrucciones en sindhi con pasajes y preguntas que requieren razonamiento deductivo, inductivo, causal o de sentido común. No se especifica en la información proporcionada el número total de tokens ni si hubo RLHF o DPO. La innovación destacable es el ajuste de las capas de embedding y de salida (`embed_tokens` y `lm_head`), poco habitual en LoRA, que explica el tamaño del adaptador (1,1 GB) y que probablemente mejora la adaptación al vocabulario y a la morfología del sindhi.

## Capacidades

- Generación de texto en sindhi con respuestas breves y explicaciones.
- Razonamiento deductivo, inductivo, causal y de sentido común sobre pasajes en sindhi.
- Salida estructurada en JSON con el campo `final_answer`.
- Instrucciones multi-turno mediante plantilla de chat (system + user) del modelo base.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso autónomo en la información proporcionada.
- Capacidad multilingüe limitada al sindhi según la model card (idioma `sd`); el modelo base soporta otros idiomas, pero el adaptador se entrenó solo en sindhi.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Evaluación de razonamiento en lenguas de bajos recursos: el modelo sirve como línea base ajustada para medir mejoras en tareas de razonamiento en sindhi frente al modelo base, usando las métricas ROUGE-L, BLEU, TF-IDF, E5 y BERTScore.
- Investigación académica en procesamiento del lenguaje natural para sindhi: permite reproducir los experimentos del artículo LoResLM 2026 con un adaptador de 1,1 GB sobre un modelo de 1B, factible en una sola GPU.
- Generación de material educativo en sindhi: dado un pasaje y una pregunta de tipo deductivo o causal, el modelo produce una respuesta breve con explicación, útil para bancos de ejercicios.
- Anotación asistida de datos de razonamiento: el modelo puede preanotar respuestas en formato JSON que luego revisa un humano, acelerando la creación de corpus en sindhi.
- Sistemas de pregunta-respuesta sobre documentos en sindhi: integrado en un pipeline de recuperación (RAG) que pase el pasaje recuperado, el tipo de razonamiento y la pregunta al modelo.
- Experimentos de ajuste eficiente (PEFT): el adaptador sirve como ejemplo reproducible de LoRA con r = 64 aplicado también a `embed_tokens` y `lm_head`, útil para estudiar el impacto de adaptar capas de embedding en lenguas de bajos recursos.
- Comparación entre tamaños de modelo: junto con los adaptadores de 3B, 8B, 7B, 12B y 24B de la misma familia, permite analizar la relación entre tamaño del modelo base y calidad del razonamiento en sindhi.

## Benchmarks y rendimiento

Resultados en el split de test (100 ítems) según la model card:

| Metrica | Base | Sindhi-Reasoning LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0.225 | 0.331 | +0.106 |
| BLEU | 0.067 | 0.159 | +0.092 |
| Similitud TF-IDF | 0.141 | 0.264 | +0.123 |
| Similitud E5 | 0.863 | 0.894 | +0.031 |
| BERTScore F1 | 0.850 | 0.890 | +0.040 |

Evaluación humana (media, A = 5 … E = 1); la respuesta ajustada se prefirió sobre la del modelo base en el 100 % de los ítems y la media subió un 88 %:

| Tipo de razonamiento | Base | Fine-tuned |
|---|---:|---:|
| Todos | 1.08 | 2.03 |
| Deductivo | 1.03 | 1.90 |
| Inductivo | 1.12 | 2.08 |
| Causal | 1.12 | 2.29 |
| Sentido común | 1.05 | 1.86 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 1,1 GB y se aplica sobre un modelo base de 1B parámetros; la inferencia requiere cargar el modelo base completo más el adaptador.
- VRAM estimada: en bf16, el modelo base de 1B ocupa aproximadamente 2 GB de pesos; con el adaptador y el estado de activaciones, es viable en GPUs consumer con 8 GB o más. En cuantización de 4 bits, el modelo base se reduce a menos de 1 GB, aunque la cuantización del adaptador no se documenta.
- GPU recomendadas: RTX A6000 (usada en el entrenamiento), RTX 4090, RTX 3090, A100 o H100 para mayor throughput. Cabe en GPUs consumer como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores.
- Despliegue: el ejemplo de la model card usa `transformers` + `peft` con `PeftModel.from_pretrained(...).merge_and_unload()`. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI para este adaptador; al fusionarse con el modelo base, podría exportarse a otros formatos, pero no se proporciona información al respecto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Adaptadores de la misma familia Sindhi-Reasoning (según la model card):

| Modelo base | Parametros | Adaptador | BERTScore F1 (base → fine-tuned) |
|---|---:|---|---|
| Llama-3.2-1B-Instruct | 1B | Sindhi-Reasoning-Llama-3.2-1B-Instruct-LoRA (este modelo) | 0.850 → 0.890 |
| Llama-3.2-3B-Instruct | 3B | Sindhi-Reasoning-Llama-3.2-3B-Instruct-LoRA | 0.867 → 0.901 |
| Llama-3.1-8B-Instruct | 8B | Sindhi-Reasoning-Llama-3.1-8B-Instruct-LoRA | 0.895 → 0.918 |
| Mistral-7B-Instruct-v0.3 | 7B | Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA | 0.877 → 0.916 |
| Mistral-Nemo-Instruct-2407 | 12B | Sindhi-Reasoning-Mistral-Nemo-Instruct-2407-LoRA | 0.871 → 0.915 |
| Mistral-Small-24B-Instruct-2501 | 24B | Sindhi-Reasoning-Mistral-Small-24B-Instruct-2501-LoRA | no disponible en la información proporcionada |

En términos de BERTScore F1, el adaptador de 1B alcanza 0.890, frente a 0.901 del de 3B y 0.918 del de 8B, lo que sitúa al modelo de 1B como la opción más ligera de la familia con una calidad ligeramente inferior. La licencia de todos los adaptadores Llama es llama3.2; los adaptadores Mistral usan la licencia del modelo base correspondiente, no especificada en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en sindhi; su uso en otros idiomas no está validado y probablemente degrade la calidad.
- El corpus de entrenamiento es pequeño (2.089 ítems), lo que limita la generalización a dominios y estilos no vistos.
- Riesgo de alucinación: al ser un modelo de 1B, la capacidad de razonamiento es limitada; las métricas humanas absolutas (media 2.03 sobre 5) indican margen de mejora.
- La salida esperada es JSON con `final_answer`; fuera de ese formato o con prompts distintos a los del entrenamiento, el comportamiento puede ser errático.
- El modelo base está restringido (gated): es necesario aceptar sus términos en Hugging Face y ejecutar `huggingface-cli login` para usarlo.
- Licencia llama3.2: el uso comercial está sujeto a los términos de la licencia Llama 3.2, que incluyen restricciones y obligaciones de atribución; conviene revisarla antes de un despliegue en producción.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus culturalmente fundamentado en sindhi puede reflejar sesgos culturales del dataset.
- No se documenta soporte de tool calling, agentes ni cuantización del adaptador; para producción habría que validar el pipeline de fusión y exportación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.2-1B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Dataset: https://huggingface.co/datasets/Kamyar-zeinalipour/sindi_reasoning
- Artículo (LoResLM 2026): https://aclanthology.org/2026.loreslm-1.22/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Sindhi-Reasoning
- Colección Sindhi-Reasoning: https://huggingface.co/collections/Kamyar-zeinalipour/sindhi-reasoning-instruct-loreslm-2026-6af467d9e0f19e13ad2d14c0
- Adaptador 3B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.2-3B-Instruct-LoRA
- Adaptador 8B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.1-8B-Instruct-LoRA
- Adaptador Mistral 7B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA
- Adaptador Mistral Nemo 12B: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-Nemo-Instruct-2407-LoRA
