# ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e5

## Resumen

El modelo `ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e5` es un adaptador PEFT de tipo QLoRA (LoRA cuantizado en 4 bits) entrenado sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo desarrolla el usuario ahmedelgebaly y su propósito es especializar el modelo base en tareas de question answering (QA) extractivo y generativo sobre el dataset SQuAD 2.0, reformateado en estilo Alpaca. No es un modelo completo: es un adaptador de bajo rango que debe cargarse junto al modelo base de Meta para poder utilizarse.

El interés de esta publicación es fundamentalmente académico y experimental. Forma parte de una ablación de épocas (epochs 1 a 5) dentro de la colección "AAST 2026 SQuAD QLoRA Epoch Ablation Scenario 2.1", pensada para comparar el efecto del número de épocas de entrenamiento sobre la pérdida de validación. El propio autor recomienda el adaptador de la época 1 (menor val loss), no este de la época 5, lo que sugiere sobreajuste en las épocas superiores.

Al tratarse de un adaptador PEFT, hereda la arquitectura, el contexto y las capacidades del modelo base Llama 3.1 8B Instruct, pero modifica su comportamiento hacia formatos de respuesta de QA sobre pasajes. Su relevancia práctica es limitada: cero descargas, cero likes y un enfoque muy específico, aunque sirve como referencia reproducible de un pipeline Axolotl + PEFT + QLoRA sobre SQuAD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only Llama 3.1 8B Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 8.030 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base soporta 131.072 tokens |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit NF4; el adaptador se distribuye en safetensors (no cuantizado) |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |
| Tamano del repo | 0,4 GB |
| Rango LoRA / alpha / dropout | 32 / 64 / 0,05 |
| Epocas de entrenamiento | 5 (13.090 pasos) |
| Longitud de secuencia de entrenamiento | 512 tokens |
| Learning rate | 2e-4 con scheduler cosine |
| Batch efectivo | 16 |
| Framework | Axolotl + PEFT |
| Val loss / Val PPL | 1,8077 / 6,0966 |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA, una técnica que congela los pesos del modelo base cuantizados en 4 bits (NF4) e inserta matrices de bajo rango entrenables en las capas de atención y proyección. En este caso se emplea r=32, alpha=64 y dropout de 0,05, con un learning rate de 2e-4 y un scheduler cosine a lo largo de 13.090 pasos (5 épocas, batch efectivo 16, secuencia de 512 tokens). El pipeline se construye con Axolotl sobre PEFT.

El dataset de entrenamiento es `ahmedelgebaly/SQuad_2_Alpaca`, una reformulación del corpus SQuAD 2.0 en formato Alpaca (campos instruction, input y output). No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO; el autor solo reporta la pérdida de validación (1,8077) y la perplejidad (6,0966) al final del entrenamiento. No se documentan innovaciones técnicas adicionales más allá del propio esquema QLoRA estándar.

## Capacidades

- Generación de texto y respuesta a preguntas sobre pasajes, en formato extractivo y generativo, especializado mediante el ajuste sobre SQuAD 2.0.
- Razonamiento y conocimiento general heredados del modelo base Llama 3.1 8B Instruct.
- Generación de código y matemáticas básicas, también heredadas del modelo base.
- Soporte de tool calling y function calling: no documentado en la model card de este adaptador; debe verificarse empíricamente sobre el modelo fusionado.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Respuesta a preguntas sobre documentación técnica: el adaptador puede recibir un pasaje y una pregunta en formato Alpaca y devolver una respuesta concisa; es adecuado para prototipos de QA sobre corpus cerrados.
- Extracción de respuestas en pipelines de procesamiento documental: integrado en un flujo que segmenta documentos y formula preguntas, el adaptador devuelve respuestas ancladas al pasaje, reduciendo la verbosidad típica del modelo base.
- Evaluación comparativa de técnicas de fine-tuning: sirve como referencia reproducible en experimentos de ablación de épocas y de hiperparámetros QLoRA sobre SQuAD.
- Docencia y formación en PEFT: el adaptador y sus hermanos (épocas 1 a 5) permiten ilustrar el efecto del sobreajuste y de la pérdida de validación en un caso real.
- Base para fine-tuning posterior: al ser un adaptador LoRA, puede combinarse o continuarse con otros adaptadores para tareas de QA especializadas en dominios concretos.
- Prototipado rápido de asistentes de lectura comprensiva: con el modelo base cargado en una GPU de consumo, el adaptador permite experimentar con QA sobre textos largos sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de validación del entrenamiento:

| Metrica | Valor |
|---|---|
| Val loss | 1,8077 |
| Val PPL | 6,0966 |
| Pasos de entrenamiento | 13.090 |
| Epocas | 5 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K, SQuAD F1/EM ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa unos 0,4 GB; el modelo base en fp16 requiere aproximadamente 16 GB de VRAM, y en 4 bits (NF4) alrededor de 6-7 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues de producción con contexto largo; RTX 4090 (24 GB) para fp16; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización 4 bits, en GPUs de 8-12 GB como RTX 3060/4060 Ti.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF), TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e5 (este) | 8.030 M (base) + adaptador LoRA r=32 | No especificado (base: 131.072) | Adaptador QLoRA para QA | Llama 3.1 Community License | Hugging Face, 0 descargas |
| Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1 (hermano recomendado) | 8.030 M (base) + adaptador LoRA r=32 | No especificado | Adaptador QLoRA para QA | Llama 3.1 Community License | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8.030 M | 131.072 | Modelo instruct generalista | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7.250 M | 32.768 | Modelo instruct generalista | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está especializado en QA sobre SQuAD 2.0; su comportamiento fuera de ese formato puede degradarse respecto al modelo base.
- El autor recomienda la época 1 (menor val loss) frente a esta época 5, lo que indica posible sobreajuste en las épocas superiores.
- No se documentan sesgos específicos del adaptador; hereda los sesgos del modelo base Llama 3.1 8B Instruct y del corpus SQuAD.
- Riesgo de alucinación: el adaptador puede generar respuestas plausibles pero no presentes en el pasaje, especialmente en preguntas sin respuesta (SQuAD 2.0 incluye preguntas sin respuesta).
- Limitaciones de contexto: el entrenamiento se realizó con secuencias de 512 tokens; el rendimiento con pasajes más largos no está validado.
- Idiomas: no se especifican; el ajuste se hizo sobre un corpus mayoritariamente en inglés.
- Licencia: hereda la Llama 3.1 Community License, que impone restricciones de uso comercial y requiere aceptar los términos de Meta para descargar los pesos base.
- Al ser un adaptador PEFT, requiere cargar el modelo base gated de Meta; no es un modelo autónomo.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria de su calidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e5
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/SQuad_2_Alpaca
- Adaptador hermano época 1 (recomendado): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1
- Adaptador hermano época 2: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e2
- Adaptador hermano época 3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e3
- Adaptador hermano época 4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e4
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper original de SQuAD: no disponible en la información proporcionada
- Repositorio de Axolotl: no disponible en la información proporcionada
