# Kamyar-zeinalipour/TalkFa-WikiFaDial-Mistral-Nemo-Instruct-2407-LoRA

## Resumen

TalkFa-WikiFaDial-Mistral-Nemo-Instruct-2407-LoRA es un adaptador LoRA (PEFT) sobre el modelo base Mistral-Nemo-Instruct-2407, desarrollado por Kamyar Zeinalipour en el marco del benchmark TalkFa. Su funcion es generar dialogos casuales de seis turnos en farsi (persa) a partir de un parrafo de Wikipedia en farsi, manteniendose fiel al contenido del parrafo y devolviendo la salida en formato JSON. Resuelve un problema concreto: la generacion de dialogo fundamentada en conocimiento (knowledge-grounded dialogue) en un idioma de recursos limitados como el farsi, donde los modelos generalistas suelen producir respuestas menos fieles al contexto proporcionado.

El adaptador se entrena sobre el split de entrenamiento Wiki-FaDial del dataset TalkFa, compuesto por 4.084 dialogos verificados humanamente, y se evalua sobre un conjunto de test de 100 dialogos. El modelo base, Mistral-Nemo-Instruct-2407, aporta una arquitectura transformer densa de aproximadamente 12.000 millones de parametros con una ventana de contexto nativa de 128.000 tokens, lo que permite acomodar parrafos de Wikipedia extensos junto con el historial de conversacion sin truncamientos agresivos.

La relevancia actual del modelo radica en su especializacion: no compite como modelo generalista, sino como un componente ajustado para una tarea linguistica concreta en farsi, con mejoras medibles sobre el modelo base en metricas de solapamiento lexico y similitud semantica. Su licencia Apache 2.0 y su formato de adaptador PEFT facilitan la integracion en pipelines existentes que ya utilicen Mistral-Nemo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Mistral-Nemo-Instruct-2407) con adaptador LoRA (PEFT) |
| Parametros totales | Aproximadamente 12.000 millones en el modelo base fusionado; el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no se especifica en la model card del adaptador) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; admite cuantizacion del modelo fusionado via herramientas externas) |
| Idiomas soportados | Farsi (persa), codigo de idioma `fa` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-Nemo-Instruct-2407, un transformer decoder-only denso de aproximadamente 12.000 millones de parametros entrenado por Mistral AI y NVIDIA. La tecnica de ajuste es LoRA (Low-Rank Adaptation) mediante la libreria PEFT, lo que implica que solo se entrenan matrices de bajo rango inyectadas en las capas del modelo base, manteniendo congelados los pesos originales. El repositorio ocupa 2,8 GB, coherente con un adaptador de rango moderado sobre un modelo de 12B.

El entrenamiento se realiza sobre el split de entrenamiento Wiki-FaDial del dataset TalkFa, con 4.084 dialogos. La tarea consiste en, dado un parrafo de Wikipedia en farsi, generar un dialogo casual de seis turnos entre dos hablantes, fiel al contenido del parrafo y estructurado en JSON. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; la configuracion de entrenamiento se remite al fichero `configs/train_generation.json` del repositorio GitHub. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en el adaptador.

## Capacidades

- Generacion de dialogo multi-turno en farsi: produce conversaciones de seis turnos entre dos hablantes a partir de un parrafo de Wikipedia.
- Fidelidad al contexto (knowledge grounding): mantiene el contenido del parrafo fuente como base del dialogo generado.
- Salida estructurada en JSON: el dialogo se devuelve en formato JSON, facilitando su consumo programatico.
- Generacion de texto en farsi: hereda las capacidades del modelo base, aunque el ajuste esta orientado a la tarea de dialogo.
- Soporte de plantilla de chat: utiliza `apply_chat_template` del tokenizer de Mistral-Nemo con roles `user`/`assistant`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito para este adaptador.

## Casos de uso

- Generacion de material conversacional para aprendizaje de farsi: a partir de articulos de Wikipedia en farsi, el modelo produce dialogos de seis turnos que ilustran el vocabulario y las estructuras del texto fuente, utiles para crear ejercicios y recursos didacticos.
- Creacion de corpus sinteticos de dialogo en farsi: el adaptador permite aumentar el volumen de datos conversacionales anotados en farsi respetando el contenido de una fuente verificable, lo que resulta util para entrenar o evaluar otros sistemas en ese idioma.
- Evaluacion de fidelidad en dialogo fundamentado: al generar dialogos anclados a un parrafo, sirve como baseline para medir hasta que punto otros modelos mantienen el contenido fuente en farsi.
- Prototipado de asistentes conversacionales en farsi: el adaptador puede integrarse en un pipeline que reciba un texto de referencia y devuelva una conversacion simulada, adecuado para demos y pruebas de concepto en entornos de habla persa.
- Investigacion en adaptacion linguistica de bajo coste: al ser un LoRA sobre un modelo de 12B, permite estudiar el efecto del ajuste fino eficiente en tareas de dialogo para idiomas de recursos limitados comparando con los otros adaptadores TalkFa (Llama-3.2-1B/3B, Mistral-7B, Llama-3.1-8B, Mistral-Small-24B).
- Generacion de dialogos para anotacion y revision humana: la salida JSON estructurada facilita su integracion en herramientas de anotacion donde revisores humanos validan o corrigen los dialogos generados antes de incorporarlos a un dataset.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test Wiki-FaDial (100 dialogos). BERTCos es la similitud coseno de embeddings ParsBERT (bert-fa-base) con mean pooling.

| Metrica | Base (Mistral-Nemo-Instruct-2407) | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,613 | 0,688 | +0,075 |
| BLEU-4 | 0,515 | 0,614 | +0,099 |
| BERTCos | 0,893 | 0,973 | +0,080 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla; la model card incluye una tabla de adaptadores TalkFa por modelo base, pero sin sus metricas individuales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo fusionado en bf16 requiere aproximadamente 24 GB de VRAM (12B parametros a 2 bytes por parametro, mas overhead de activaciones y cache KV). En cuantizacion de 8 bits, en torno a 12-13 GB; en 4 bits, en torno a 7-8 GB.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o L40S para inferencia en bf16 sin cuantizar con contexto largo; RTX 4090 (24 GB) para bf16 ajustado o cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con bf16 al limite o cuantizacion; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantizacion de 4 u 8 bits; en GPUs de 8-12 GB con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: transformers + PEFT (fusion con `merge_and_unload`), vLLM, TGI y llama.cpp/Ollama tras convertir el modelo fusionado a GGUF. El adaptador en si requiere PEFT o su fusion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card lista los adaptadores TalkFa para la tarea Wiki-FaDial sobre distintos modelos base. La comparativa se limita a parametros y disponibilidad, ya que no se publican metricas por adaptador.

| Modelo | Parametros base | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|
| TalkFa-WikiFaDial-Mistral-Nemo-Instruct-2407-LoRA (este) | 12B | Generacion de dialogo farsi (Wiki-FaDial) | Apache 2.0 | Hugging Face |
| TalkFa-WikiFaDial-Llama-3.2-1B-Instruct-LoRA | 1B | Generacion de dialogo farsi (Wiki-FaDial) | No disponible en la informacion | Hugging Face |
| TalkFa-WikiFaDial-Llama-3.1-8B-Instruct-LoRA | 8B | Generacion de dialogo farsi (Wiki-FaDial) | No disponible en la informacion | Hugging Face |
| TalkFa-WikiFaDial-Mistral-Small-24B-Instruct-2501-LoRA | 24B | Generacion de dialogo farsi (Wiki-FaDial) | No disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos adaptadores en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado unicamente para generar dialogos de seis turnos a partir de un parrafo de Wikipedia en farsi; su comportamiento fuera de esa tarea no esta garantizado.
- Riesgo de alucinacion: aunque el objetivo es la fidelidad al parrafo, el modelo puede introducir contenido no presente en la fuente; las metricas BLEU/ROUGE no garantizan fidelidad factual.
- Cobertura linguistica limitada: el ajuste se realiza solo en farsi; el rendimiento en otros idiomas no se documenta y probablemente degrade respecto al modelo base.
- Dependencia del modelo base: requiere aceptar los terminos de Mistral-Nemo-Instruct-2407 (modelo con gating) y autenticarse en Hugging Face antes de la descarga.
- Licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial del modelo fusionado queda sujeto a la licencia del modelo base (Apache 2.0 en Mistral-Nemo, segun la informacion disponible).
- Sesgos: no se documentan analisis de sesgos del adaptador ni del dataset TalkFa en la informacion proporcionada.
- Datos de evaluacion reducidos: el test set consta de 100 dialogos, por lo que las metricas tienen una varianza considerable y deben interpretarse con cautela.
- Sin datos de benchmarks estandar (MMLU, HumanEval, GSM8K) ni de latencia/throughput en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/TalkFa-WikiFaDial-Mistral-Nemo-Instruct-2407-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Paper (arXiv): https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Configuracion de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_generation.json
- Coleccion TalkFa en Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Adaptador de sentimiento (PlayDial-Fa) sobre el mismo base: https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-Nemo-Instruct-2407-LoRA
