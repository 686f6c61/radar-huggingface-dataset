# Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-Nemo-Instruct-2407-LoRA

## Resumen
El modelo Sindhi-Reasoning-Mistral-Nemo-Instruct-2407-LoRA es un adaptador LoRA (PEFT) publicado por Kamyar Zeinalipour que ajusta el modelo base mistralai/Mistral-Nemo-Instruct-2407 (12B parametros) para resolver tareas de razonamiento estructurado en sindhi, un idioma de bajos recursos. El adaptador se entrena sobre Sindhi-Reasoning-Instruct, un corpus de 2.089 items de instruccion pregunta-respuesta construidos sobre pasajes en sindhi, donde cada item exige uno de cuatro tipos de razonamiento: deductivo, inductivo, causal o de sentido comun.

El modelo recibe como entrada un pasaje en sindhi, un tipo de razonamiento y una pregunta, y devuelve una respuesta breve en sindhi acompanada de una explicacion, formateada como JSON con la clave `final_answer`. El objetivo es mejorar la capacidad del modelo base de razonar de forma estructurada y culturalmente anclada en sindhi, un escenario en el que los modelos multilingues genericos rinden de forma deficiente.

La relevancia del adaptador radica en que fue publicado junto al articulo "Enabling Structured Reasoning in Sindhi with Culturally Grounded Instruction Tuning" (LoResLM 2026), y forma parte de una familia de adaptadores equivalentes sobre Llama-3.2-1B/3B, Llama-3.1-8B, Mistral-7B-Instruct-v0.3 y Mistral-Small-24B-Instruct-2501, lo que permite comparar el efecto del ajuste en funcion del tamano del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral-Nemo-Instruct-2407) con adaptador LoRA (PEFT) |
| Parametros totales | 12B (modelo base); adaptador LoRA de 3,0 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral-Nemo-Instruct-2407) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | sindhi (sd) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en bf16 para su uso |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Mistral-Nemo-Instruct-2407, un transformer decoder-only de 12B parametros. El ajuste LoRA emplea rango r = 64, alpha = 128 y dropout 0,1, aplicado no solo a las proyecciones q/k/v/o y gate/up/down, sino tambien a `embed_tokens` y `lm_head`; esta circunstancia explica que el adaptador ocupe 3,0 GB en disco, un tamano muy superior al habitual para un LoRA. El entrenamiento usa 3 epocas con AdamW, learning rate 1e-4, scheduler coseno, weight decay 1e-4, batch de 4 secuencias por GPU con 2 pasos de acumulacion de gradiente, empaquetado a 2.048 tokens, bf16, DeepSpeed ZeRO-3 y Flash Attention 2, ejecutado sobre 3 GPU RTX A6000 con semilla 100.

Los datos de entrenamiento son el split de entrenamiento de Sindhi-Reasoning-Instruct, con 2.089 items de instruccion pregunta-respuesta sobre pasajes en sindhi, cada uno etiquetado con uno de los cuatro tipos de razonamiento (deductivo, inductivo, causal, sentido comun). No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; el ajuste es de instruccion supervisada sobre el corpus citado.

## Capacidades
- Generacion de texto en sindhi con formato de salida JSON (`{"final_answer": ...}`).
- Razonamiento deductivo sobre pasajes en sindhi.
- Razonamiento inductivo sobre pasajes en sindhi.
- Razonamiento causal sobre pasajes en sindhi.
- Razonamiento de sentido comun sobre pasajes en sindhi.
- Generacion de explicaciones breves acompanando la respuesta final.
- Seguimiento de instrucciones multi-turno mediante plantilla de chat (system + user).
- Capacidades del modelo base (generacion de texto general, codigo, matematicas) potencialmente preservadas, aunque no evaluadas en la informacion disponible.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.
- No se documenta soporte de vision ni audio.

## Casos de uso
- Evaluacion de razonamiento en sindhi: el adaptador permite medir de forma controlada la capacidad de un modelo de 12B de resolver preguntas deductivas, inductivas, causales y de sentido comun sobre pasajes en sindhi, sirviendo como referencia en benchmarks de idiomas de bajos recursos.
- Investigacion en ajuste de idiomas de bajos recursos: comparar el efecto del LoRA sobre Mistral-Nemo-Instruct-2407 frente a los adaptadores equivalentes de la familia (Llama-3.2-1B/3B, Llama-3.1-8B, Mistral-7B, Mistral-Small-24B) para estudiar la relacion entre tamano del modelo base y ganancia en razonamiento.
- Generacion de material educativo en sindhi: a partir de un pasaje y una pregunta, el modelo produce una respuesta con explicacion breve, util para construir ejercicios de comprension lectora y razonamiento en sindhi.
- Sistemas de pregunta-respuesta sobre documentos en sindhi: integrado en un pipeline que extrae pasajes y formula preguntas, el adaptador devuelve respuestas estructuradas en JSON faciles de parsear y encadenar.
- Anotacion asistida de corpus de razonamiento: usar el modelo para proponer respuestas y explicaciones que un anotador humano revisa, acelerando la construccion de datasets de razonamiento en sindhi.
- Prototipado de asistentes conversacionales en sindhi: gracias a la plantilla de chat del modelo base, el adaptador puede sostener conversaciones multi-turno en sindhi con contexto de pasaje, aunque su evaluacion publicada se limita a tareas de razonamiento.
- Analisis linguistico y cultural: el corpus culturalmente anclado permite usar el modelo para estudiar como se formulan inferencias y explicaciones en sindhi en contextos locales.

## Benchmarks y rendimiento
Resultados publicados por el autor sobre el split de test (100 items):

| Metrica | Base | Sindhi-Reasoning LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,307 | 0,419 | +0,111 |
| BLEU | 0,133 | 0,234 | +0,101 |
| Similitud TF-IDF | 0,225 | 0,395 | +0,170 |
| Similitud E5 | 0,893 | 0,941 | +0,048 |
| BERTScore F1 | 0,871 | 0,915 | +0,045 |

Evaluacion humana (media de valoracion, A = 5 ... E = 1); la respuesta ajustada fue preferida sobre la del modelo base en el 93% de los items y la valoracion media subio un 95%:

| Tipo de razonamiento | Base | Ajustado |
|---|---:|---:|
| Todos | 1,67 | 3,25 |
| Deductivo | 1,57 | 3,03 |
| Inductivo | 1,79 | 3,33 |
| Causal | 1,79 | 3,67 |
| Sentido comun | 1,55 | 3,00 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base de 12B en bf16 requiere aproximadamente 24 GB de VRAM solo para los pesos, mas memoria para el contexto y la cache KV; en cuantizacion de 8 bits o 4 bits la huella se reduce, pero no se documentan cuantizaciones especificas para este adaptador.
- GPU recomendadas: el entrenamiento se realizo sobre 3 GPU RTX A6000 (48 GB cada una); para inferencia en bf16 se recomienda una GPU con al menos 24-32 GB, como A100, H100 o RTX A6000.
- Cabe en GPU de consumo: en bf16, una RTX 4090 (24 GB) queda al limite y puede requerir cuantizacion o descarga parcial; en cuantizaciones de 8 o 4 bits es viable en GPUs de consumo con 16-24 GB, aunque no se aportan datos especificos.
- Opciones de despliegue: transformers + PEFT (con `merge_and_unload`), tal como muestra el ejemplo de uso; vLLM, llama.cpp, Ollama o TGI no se documentan en la informacion disponible para este adaptador.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BERTScore F1 (base -> ajustado) | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Sindhi-Reasoning-Mistral-Nemo-Instruct-2407-LoRA (este) | 12B | no disponible | 0,871 -> 0,915 | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Sindhi-Reasoning-Llama-3.1-8B-Instruct-LoRA | 8B | no disponible | 0,895 -> 0,918 | no disponible en la informacion proporcionada | Hugging Face (adaptador PEFT) |
| Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA | 7B | no disponible | 0,877 -> 0,916 | no disponible en la informacion proporcionada | Hugging Face (adaptador PEFT) |
| Sindhi-Reasoning-Mistral-Small-24B-Instruct-2501-LoRA | 24B | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face (adaptador PEFT) |

## Limitaciones y advertencias
- El adaptador esta especializado en sindhi y en tareas de razonamiento sobre pasajes; su rendimiento fuera de ese dominio no esta evaluado.
- El corpus de entrenamiento es pequeno (2.089 items), lo que limita la generalizacion y aumenta el riesgo de sobreajuste al estilo de las respuestas del dataset.
- Riesgo de alucinacion: al ser un modelo generativo de 12B, puede producir respuestas y explicaciones plausibles pero incorrectas, especialmente en razonamiento causal y de sentido comun, que obtuvieron las valoraciones humanas mas bajas (3,67 y 3,00 respectivamente).
- La salida esta constrenida al formato JSON con `final_answer`; usos fuera de ese esquema pueden degradar la calidad.
- El modelo base Mistral-Nemo-Instruct-2407 esta sujeto a acceso restringido (gated) y requiere aceptar sus terminos y autenticarse en Hugging Face.
- La licencia del adaptador es Apache 2.0, pero el uso comercial esta condicionado por la licencia del modelo base, que debe verificarse por separado.
- El adaptador ocupa 3,0 GB por incluir `embed_tokens` y `lm_head`; esto incrementa los requisitos de almacenamiento y de memoria en el proceso de merge.
- La evaluacion se limita a 100 items de test y a metricas automaticas y humanas del propio autor; no hay validacion independiente en la informacion disponible.
- No se documentan sesgos especificos, pero el corpus culturalmente anclado puede reflejar sesgos presentes en las fuentes utilizadas.

## Enlaces
- Hugging Face del adaptador: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-Nemo-Instruct-2407-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Dataset: https://huggingface.co/datasets/Kamyar-zeinalipour/sindi_reasoning
- Articulo (LoResLM 2026): https://aclanthology.org/2026.loreslm-1.22/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Sindhi-Reasoning
- Coleccion Sindhi-Reasoning: https://huggingface.co/collections/Kamyar-zeinalipour/sindhi-reasoning-instruct-loreslm-2026-6af467d9e0f19e13ad2d14c0
- Adaptador Llama-3.2-1B-Instruct: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.2-1B-Instruct-LoRA
- Adaptador Llama-3.2-3B-Instruct: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.2-3B-Instruct-LoRA
- Adaptador Llama-3.1-8B-Instruct: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Llama-3.1-8B-Instruct-LoRA
- Adaptador Mistral-7B-Instruct-v0.3: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA
- Adaptador Mistral-Small-24B-Instruct-2501: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-Small-24B-Instruct-2501-LoRA
