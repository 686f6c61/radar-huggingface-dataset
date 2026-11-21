# dphn/dolphin-2.9.3-mistral-nemo-12b

## Resumen

Dolphin 2.9.3 Mistral Nemo 12B es un ajuste fino por instrucciones del modelo base Mistral Nemo (mistralai/Mistral-Nemo-Base-2407), desarrollado por Eric Hartford y el equipo de Cognitive Computations. El modelo hereda la arquitectura transformer densa del base, con aproximadamente 12.248 millones de parametros, y esta orientado a generacion de texto conversacional, seguimiento de instrucciones, codigo y capacidades iniciales de agente con soporte de function calling.

Su relevancia reside en dos factores. Por un lado, se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, a diferencia de otros modelos de la familia Mistral con licencias mas restrictivas. Por otro lado, es un modelo explicitamente "uncensored": el dataset de ajuste fue filtrado para eliminar capas de alineamiento y sesgo, lo que lo hace altamente complaciente con las peticiones del usuario, incluidas potencialmente las eticas discutibles.

El contexto nativo del modelo base es de 128K tokens, aunque el ajuste fino se realizo con una longitud de secuencia de 8192 tokens. Usa la plantilla ChatML como formato de prompt y esta integrado en el ecosistema transformers, text-generation-inference y Azure, con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Nemo) |
| Parametros totales | 12.247.802.880 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens en el modelo base; ajuste fino con 8192 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del transformer denso Mistral Nemo 12B, realizado con la herramienta Axolotl. No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de optimizacion por preferencias; la model card solo indica ajuste fino sobre datasets de instrucciones. El entrenamiento utilizo una longitud de secuencia de 8192 tokens, inferior al contexto maximo de 128K del base.

Los datos de entrenamiento provienen de una mezcla de datasets: cognitivecomputations/Dolphin-2.9, teknium/OpenHermes-2.5, m-a-p/CodeFeedback-Filtered-Instruction, cognitivecomputations/dolphin-coder, cognitivecomputations/samantha-data, microsoft/orca-math-word-problems-200k, Locutusque/function-calling-chatml e internlm/Agent-FLAN. Esta composicion cubre conversacion general, codigo, matematicas, datos de estilo conversacional y function calling/agentico. El autor declara que parte de los datos fue generada con GPT-4. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta en proporcion. La innovacion tecnica destacable no es arquitectonica, sino de curaduria: el dataset fue filtrado para eliminar alineamiento y sesgo, produciendo un modelo deliberadamente "uncensored".

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla ChatML.
- Seguimiento de instrucciones de proposito general.
- Generacion y asistencia de codigo, apoyada en datasets como CodeFeedback y dolphin-coder.
- Razonamiento matematico basico a moderado, con entrenamiento sobre orca-math-word-problems-200k.
- Soporte de function calling / tool calling, con datos de function-calling-chatml.
- Capacidades iniciales de agente y razonamiento multi-paso, con datos de Agent-FLAN.
- Alta complacencia con instrucciones: al no tener capa de alineamiento, responde a peticiones que otros modelos rechazarian.
- Capacidades multilingues: no confirmadas en la informacion disponible; el modelo base hereda el soporte del base, pero no se documenta explicitamente.

## Casos de uso

- Asistente conversacional de proposito general: el modelo gestiona dialogos multi-turno con formato ChatML y puede mantener contexto amplio gracias a la ventana de 128K del base, util para asistentes personales o internos.
- Generacion de codigo en entornos controlados: su entrenamiento sobre CodeFeedback y dolphin-coder lo hace adecuado para autocompletado, explicacion de codigo y generacion de tests, integrable en pipelines de desarrollo.
- Automatizacion de agentes con tool calling: los datos de function-calling-chatml y Agent-FLAN permiten usarlo como motor de agentes que invocan APIs, consultan bases de datos o encadenan pasos.
- Investigacion sobre alineamiento y seguridad: al ser un modelo "uncensored" con licencia Apache 2.0, es util como objeto de estudio para medir comportamiento sin capas de rechazo y para desarrollar capas de alineamiento propias.
- Generacion de datos sinteticos: su alta complacencia y su capacidad de seguir instrucciones lo hacen apropiado para producir datasets de entrenamiento o aumentacion de datos, con revision posterior.
- Prototipado rapido de aplicaciones de chat: su tamano de 12B permite desplegarlo en una GPU de gama alta o en cuantizacion sobre hardware consumer, facilitando iteracion local.
- Resolucion de problemas matematicos y razonamiento estructurado: el entrenamiento sobre orca-math-word-problems-200k lo hace util para asistentes educativos o de calculo, siempre con verificacion.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion tipo leaderboard, 0-shot salvo indicacion):

| Tarea | Metrica | Valor | Error estandar |
|---|---|---|---|
| leaderboard (agregado) | acc | 0.3437 | ± 0.0043 |
| leaderboard (agregado) | acc_norm | 0.5076 | ± 0.0053 |
| leaderboard (agregado) | exact_match | 0.0536 | ± 0.0061 |
| leaderboard (agregado) | inst_level_loose_acc | 0.4388 | no disponible |
| leaderboard (agregado) | inst_level_strict_acc | 0.3741 | no disponible |
| leaderboard (agregado) | prompt_level_loose_acc | 0.3105 | ± 0.0199 |
| leaderboard (agregado) | prompt_level_strict_acc | 0.2477 | ± 0.0186 |
| leaderboard_bbh (3-shot) | acc_norm | 0.5549 | ± 0.0061 |
| bbh_boolean_expressions | acc_norm | 0.8640 | ± 0.0217 |
| bbh_causal_judgement | acc_norm | 0.6417 | ± 0.0352 |
| bbh_date_understanding | acc_norm | 0.6080 | ± 0.0309 |
| bbh_disambiguation_qa | acc_norm | 0.6480 | ± 0.0303 |
| bbh_formal_fallacies | acc_norm | 0.5360 | ± 0.0316 |
| bbh_geometric_shapes | acc_norm | 0.5240 | ± 0.0316 |
| bbh_hyperbaton | acc_norm | 0.6440 | ± 0.0303 |
| bbh_logical_deduction_five_objects | acc_norm | 0.4600 | ± 0.0316 |
| bbh_logical_deduction_seven_objects | acc_norm | 0.4680 | ± 0.0316 |
| bbh_logical_deduction_three_objects | acc_norm | 0.7000 | ± 0.0290 |
| bbh_movie_recommendation | acc_norm | 0.8160 | ± 0.0246 |
| bbh_navigate | acc_norm | 0.6040 | ± 0.0310 |
| bbh_object_counting | acc_norm | 0.3680 | ± 0.0306 |
| bbh_penguins_in_a_table | acc_norm | 0.5548 | ± 0.0413 |
| bbh_reasoning_about_colored_objects | acc_norm | 0.6320 | ± 0.0306 |
| bbh_ruin_names | acc_norm | 0.7440 | ± 0.0277 |
| bbh_salient_translation_error_detection | acc_norm | 0.5280 | ± 0.0316 |
| bbh_snarks | acc_norm | 0.6292 | ± 0.0363 |
| bbh_sports_understanding | acc_norm | 0.8040 | ± 0.0252 |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp16/bf16) el modelo de 12.248M de parametros requiere aproximadamente 24-25 GB, coherente con el tamano del repo (24.5 GB). En cuantizacion de 8 bits, en torno a 13-14 GB; en 4 bits, en torno a 7-8 GB (estimaciones teoricas, no confirmadas en la informacion disponible).
- GPU recomendadas: A100 40GB, H100, L40S (el autor entreno en un nodo de 8xL40S) para precision completa; RTX 4090 (24 GB) para fp16 justo o cuantizacion; GPUs de 16 GB para cuantizacion 8 bits; GPUs de 8-12 GB para cuantizacion 4 bits.
- Cabe en GPU consumer: si, en RTX 4090 en fp16 al limite y en GPUs de 8-16 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (soportado explicitamente), Azure (deploy:azure), y por compatibilidad con el formato Mistral Nemo, tambien vLLM, llama.cpp y Ollama (no confirmados explicitamente en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dolphin 2.9.3 Mistral Nemo 12B | 12.248M | 128K (base); 8192 en ajuste | Apache 2.0 | Uncensored, function calling, ChatML |
| Mistral Nemo 12B (base) | 12B | 128K | Mistral Research / Apache 2.0 segun variante | Modelo base sin ajuste por instrucciones; no disponible comparativa de rendimiento en la informacion |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Menor tamano y contexto; no disponible comparativa de rendimiento en la informacion |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Contexto comparable; licencia mas restrictiva; no disponible comparativa de rendimiento en la informacion |

No se dispone de datos de rendimiento comparativos directos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": el dataset fue filtrado para eliminar alineamiento y sesgo, por lo que es altamente complaciente con peticiones, incluidas las eticas discutibles. El autor recomienda implementar una capa de alineamiento propia antes de exponerlo como servicio.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido facticamente incorrecto con aparente confianza; no se documentan tasas de alucinacion.
- Sesgos: aunque se filtro el sesgo del dataset de alineamiento, persisten sesgos inherentes a los datos de entrenamiento (GPT-4 y datasets publicos), no cuantificados en la informacion disponible.
- Limitaciones de contexto: el ajuste fino uso 8192 tokens, por lo que el rendimiento mas alla de esa longitud puede degradarse aunque el base soporte 128K.
- Idiomas: no se documenta el soporte multilingue; el rendimiento en idiomas distintos del ingles no esta confirmado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara que parte de los datos proviene de GPT-4, lo que puede plantear incertidumbre sobre los terminos de uso de esos datos generados.
- Responsabilidad: el autor declara que el usuario es responsable del contenido generado; en produccion conviene anadir filtros de salida y monitorizacion.

## Enlaces

- Hugging Face: https://huggingface.co/dphn/dolphin-2.9.3-mistral-nemo-12b
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Base-2407
- Blog sobre modelos uncensored de Eric Hartford: https://erichartford.com/uncensored-models
- Discord de Cognitive Computations: https://discord.gg/h3K4XGj2RH
- Crusoe Cloud (patrocinador del entrenamiento): https://crusoe.ai/
