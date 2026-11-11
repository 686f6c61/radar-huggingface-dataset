# Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-Small-24B-Instruct-2501-LoRA

## Resumen

Sindhi-Reasoning-Mistral-Small-24B-Instruct-2501-LoRA es un adaptador LoRA (PEFT) que afina el modelo Mistral-Small-24B-Instruct-2501 de Mistral AI para tareas de razonamiento estructurado en sindhi, una lengua de bajos recursos. Lo desarrolla Kamyar Zeinalipour y se publica junto al articulo "Enabling Structured Reasoning in Sindhi with Culturally Grounded Instruction Tuning" (LoResLM 2026). El objetivo es que el modelo responda en sindhi a preguntas sobre pasajes, distinguiendo cuatro tipos de razonamiento: deductivo, inductivo, causal y de sentido comun, devolviendo la respuesta en formato JSON.

El adaptador se entrena sobre Sindhi-Reasoning-Instruct, un corpus de 2.089 items de instruccion pregunta-respuesta anclados culturalmente en pasajes en sindhi. El modelo base es un transformer denso de 24.000 millones de parametros con ventana de contexto de 32.000 tokens (segun las especificaciones publicas de Mistral-Small-24B-Instruct-2501). El adaptador ocupa 3,3 GB porque el LoRA se aplica tambien a `embed_tokens` y `lm_head`, ademas de las proyecciones de atencion y MLP.

La relevancia del modelo radica en su especializacion: los modelos generalistas rinden mal en sindhi para tareas de razonamiento, y este adaptador mejora de forma sustancial las metricas automaticas y la evaluacion humana frente al modelo base. Es un ejemplo de instruction tuning culturalmente fundamentado para lenguas de bajos recursos, con licencia Apache 2.0 y codigo y dataset publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Mistral-Small-24B-Instruct-2501) + adaptador LoRA (PEFT) |
| Parametros totales | 24B (modelo base); adaptador LoRA de 3,3 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (modelo base, segun especificaciones de Mistral) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se entrena en bf16) |
| Idiomas soportados | sindhi (sd) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-Small-24B-Instruct-2501, un transformer denso de 24.000 millones de parametros. El LoRA usa rango r = 64, alpha = 128 y dropout 0,1, y se aplica a las proyecciones q/k/v/o y gate/up/down, ademas de `embed_tokens` y `lm_head`. El entrenamiento se realiza durante 3 epocas con AdamW, learning rate 1e-4, scheduler coseno y weight decay 1e-4, con batch de 4 secuencias por GPU, 2 pasos de acumulacion de gradiente y empaquetado a 2.048 tokens. Se usa bf16, DeepSpeed ZeRO-3, Flash Attention 2 y 3 GPUs RTX A6000, con semilla 100.

Los datos de entrenamiento son el split de entrenamiento de Sindhi-Reasoning-Instruct (2.089 items), un corpus de instruccion en sindhi con items pregunta-respuesta sobre pasajes, donde cada item exige uno de cuatro tipos de razonamiento: deductivo, inductivo, causal o de sentido comun. El modelo se entrena para responder en sindhi con una explicacion breve en formato JSON `{"final_answer": ...}`. No se menciona en la informacion disponible el uso de RLHF o DPO; el ajuste es de instruction tuning supervisado mediante LoRA.

## Capacidades

- Generacion de texto en sindhi con respuestas estructuradas en JSON (`{"final_answer": ...}`).
- Razonamiento deductivo, inductivo, causal y de sentido comun sobre pasajes en sindhi.
- Respuesta a preguntas sobre un pasaje dado, con explicacion breve.
- Instruction following en sindhi para el formato de tarea definido (pasaje + tipo de razonamiento + pregunta).
- Capacidades heredadas del modelo base (generacion general, codigo, matematicas, tool calling) no estan documentadas para este adaptador en la informacion disponible.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no documentado en la informacion disponible.
- Capacidades multilingues: el adaptador esta orientado a sindhi; el modelo base soporta otros idiomas, pero no se documenta el efecto del ajuste sobre ellos.

## Casos de uso

- Evaluacion de razonamiento en sindhi: el modelo sirve como referencia para medir la capacidad de razonamiento estructurado en una lengua de bajos recursos, usando el split de test del dataset con las cuatro categorias de razonamiento.
- Sistemas de tutoria educativa en sindhi: dado un pasaje y una pregunta, el modelo genera una respuesta breve con explicacion, adecuada para ejercicios de comprension lectora y razonamiento en entornos escolares.
- Investigacion en procesamiento de lenguas de bajos recursos: el adaptador y su dataset permiten reproducir y extender experimentos de instruction tuning culturalmente fundamentado, comparando con los otros modelos de la familia Sindhi-Reasoning.
- Generacion de material de evaluacion: el formato JSON de salida facilita la integracion en pipelines automaticos de evaluacion de modelos en sindhi, con metricas como ROUGE-L, BLEU, BERTScore o similitud E5.
- Asistentes de consulta sobre documentos en sindhi: el modelo puede responder preguntas sobre un pasaje concreto (por ejemplo, textos culturales o historicos) y devolver la respuesta en un formato parseable.
- Prototipado de aplicaciones de razonamiento multilingue: al estar construido sobre Mistral-Small-24B, el adaptador puede combinarse con el modelo base para experimentar con mezclas de idiomas y tareas, siempre que se valide el comportamiento fuera del dominio de entrenamiento.

## Benchmarks y rendimiento

Resultados en el split de test (100 items), segun la model card:

| Metrica | Base | Sindhi-Reasoning LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,288 | 0,441 | +0,153 |
| BLEU | 0,123 | 0,257 | +0,134 |
| Similitud TF-IDF | 0,170 | 0,437 | +0,267 |
| Similitud E5 | 0,892 | 0,948 | +0,056 |
| BERTScore F1 | 0,864 | 0,922 | +0,057 |

Evaluacion humana (media, A = 5 ... E = 1):

| Tipo de razonamiento | Base | Fine-tuned |
|---|---:|---:|
| Todos | 1,49 | 3,59 |
| Deductivo | 1,70 | 3,31 |
| Inductivo | 1,33 | 3,67 |
| Causal | 1,46 | 3,67 |
| Sentido comun | 1,41 | 3,77 |

La respuesta fine-tuned fue preferida sobre la del modelo base en el 96% de los items, con un aumento medio del 141% en la valoracion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 24B en bf16 requiere aproximadamente 48 GB de VRAM; en cuantizacion de 8 bits, unos 24 GB; en 4 bits, unos 12-14 GB. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados en la model card.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o RTX A6000 (48 GB) para bf16 sin cuantizar. El entrenamiento documentado uso 3 x RTX A6000 con DeepSpeed ZeRO-3.
- Cabe en GPU de consumo: en cuantizacion de 4 bits podria caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen limitado para contexto largo; no hay datos publicados de rendimiento en estas configuraciones.
- Opciones de despliegue: transformers + PEFT (merge_and_unload), vLLM, TGI o llama.cpp tras convertir a GGUF. El adaptador se puede fusionar con el modelo base para simplificar el despliegue.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con otros adaptadores de la familia Sindhi-Reasoning, segun la model card:

| Modelo base | Parametros | Adaptador | BERTScore F1 (base -> fine-tuned) |
|---|---:|---|---|
| Llama-3.2-1B-Instruct | 1B | Sindhi-Reasoning-Llama-3.2-1B-Instruct-LoRA | 0,850 -> 0,890 |
| Llama-3.2-3B-Instruct | 3B | Sindhi-Reasoning-Llama-3.2-3B-Instruct-LoRA | 0,867 -> 0,901 |
| Llama-3.1-8B-Instruct | 8B | Sindhi-Reasoning-Llama-3.1-8B-Instruct-LoRA | 0,895 -> 0,918 |
| Mistral-7B-Instruct-v0.3 | 7B | Sindhi-Reasoning-Mistral-7B-Instruct-v0.3-LoRA | 0,877 -> 0,916 |
| Mistral-Nemo-Instruct-2407 | 12B | Sindhi-Reasoning-Mistral-Nemo-Instruct-2407-LoRA | 0,871 -> 0,915 |
| Mistral-Small-24B-Instruct-2501 | 24B | Sindhi-Reasoning-Mistral-Small-24B-Instruct-2501-LoRA | no disponible en la tabla de la model card (0,864 -> 0,922 en el split de test) |

El adaptador de 24B obtiene el mayor BERTScore F1 absoluto de la familia en el split de test (0,922), aunque la tabla comparativa de la model card no incluye su valor base en la columna correspondiente. La comparacion con modelos de la misma categoria fuera de la familia no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta especializado en sindhi y en el formato de tarea definido (pasaje + tipo de razonamiento + pregunta); su rendimiento fuera de ese dominio no esta documentado.
- El dataset de entrenamiento es pequeno (2.089 items) y el test consta de solo 100 items, lo que limita la robustez estadistica de los resultados.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion; el modelo puede generar respuestas incorrectas o inventadas sobre el pasaje.
- Sesgos conocidos: no se documentan en la informacion disponible.
- El modelo base Mistral-Small-24B-Instruct-2501 esta restringido (gated) en Hugging Face; es necesario aceptar sus terminos e iniciar sesion para descargarlo.
- La licencia del adaptador es Apache 2.0, pero el uso comercial esta sujeto tambien a los terminos del modelo base.
- El adaptador ocupa 3,3 GB por incluir `embed_tokens` y `lm_head`; el despliegue requiere fusionarlo con el modelo base o cargar ambos.
- No se han publicado datos de latencia, throughput ni comportamiento en cuantizacion para este adaptador.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Kamyar-zeinalipour/Sindhi-Reasoning-Mistral-Small-24B-Instruct-2501-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Dataset: https://huggingface.co/datasets/Kamyar-zeinalipour/sindi_reasoning
- Paper (LoResLM 2026): https://aclanthology.org/2026.loreslm-1.22/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Sindhi-Reasoning
- Coleccion Sindhi-Reasoning: https://huggingface.co/collections/Kamyar-zeinalipour/sindhi-reasoning-instruct-loreslm-2026-6af467d9e0f19e13ad2d14c0
