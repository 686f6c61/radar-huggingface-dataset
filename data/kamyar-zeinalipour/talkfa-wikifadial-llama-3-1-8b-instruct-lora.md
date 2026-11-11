# Kamyar-zeinalipour/TalkFa-WikiFaDial-Llama-3.1-8B-Instruct-LoRA

## Resumen

TalkFa-WikiFaDial-Llama-3.1-8B-Instruct-LoRA es un adaptador LoRA (PEFT) sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por Kamyar Zeinalipour y colaboradores en el marco del benchmark TalkFa. Su tarea es muy concreta: a partir de un parrafo de Wikipedia en farsi, generar un dialogo casual de seis turnos entre dos hablantes que se mantenga fiel al contenido del parrafo, con la salida estructurada en JSON. El adaptador se entrena sobre el split de entrenamiento de Wiki-FaDial (4.084 dialogos) del dataset TalkFa.

El modelo resuelve un problema acotado pero relevante para la comunidad de PLN en persa: la generacion de dialogo anclada a conocimiento (knowledge-grounded dialogue) en un idioma con relativamente pocos recursos. Al partir de Llama-3.1-8B-Instruct, hereda la ventana de contexto de 128.000 tokens y la arquitectura transformer decoder-only del base, y anade mediante LoRA la capacidad especifica de transformar texto enciclopedico en conversacion multi-turno en farsi.

Es relevante ahora porque forma parte de una familia de adaptadores publicados junto al paper *TalkFa: A Unified Benchmark for Farsi Dialogue Generation and Understanding* (arXiv:2609.01810), que cubre tanto generacion como comprension (analisis de sentimiento sobre PlayDial-Fa). El adaptador es de noviembre de 2026, tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el repositorio ocupa 2,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama-3.1-8B-Instruct) |
| Parametros totales | 8B (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible en la model card; el base admite cuantizacion estandar (no confirmado por el autor) |
| Idiomas soportados | farsi (fa) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8.000 millones de parametros con atencion causal estandar y ventana de contexto de 128.000 tokens. No se especifica en la informacion disponible el rango del LoRA, los modulos objetivo ni el numero exacto de parametros entrenables. El repo pesa 2,2 GB, lo que corresponde a los pesos del adaptador en safetensors.

El entrenamiento se realizo sobre el split de train de Wiki-FaDial (4.084 dialogos) del dataset TalkFa, un benchmark verificado por humanos para generacion y comprension de dialogo en farsi. La tarea de entrenamiento consiste en, dado un parrafo de Wikipedia en farsi, producir un dialogo de seis turnos entre dos hablantes fiel al parrafo y en formato JSON. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO; los hiperparametros de entrenamiento se remiten al fichero `configs/train_generation.json` del repositorio GitHub del proyecto.

## Capacidades

- Generacion de dialogo multi-turno (seis turnos) entre dos hablantes en farsi a partir de un parrafo de Wikipedia.
- Fidelidad al contexto: el dialogo generado debe mantenerse anclado al parrafo de entrada (knowledge-grounded dialogue).
- Salida estructurada en JSON.
- Generacion de texto en farsi; el modelo base soporta multiples idiomas, pero el adaptador esta especializado en persa.
- Capacidades heredadas del base Llama-3.1-8B-Instruct: razonamiento, codigo, matematicas, tool calling y modo instruct, aunque no se han validado especificamente tras el ajuste LoRA.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Generacion de dialogos sinteticos en farsi para aumento de datos: el adaptador convierte parrafos enciclopedicos en conversaciones de seis turnos, util para ampliar corpus de dialogo en persa con datos anclados a conocimiento.
- Construccion de asistentes conversacionales en farsi sobre dominios enciclopedicos: dado un articulo de Wikipedia, el modelo produce una conversacion natural entre dos hablantes que puede usarse como guion o como material de evaluacion.
- Evaluacion de fidelidad en dialogo anclado a conocimiento: el formato JSON y la fidelidad al parrafo permiten medir con ROUGE-L, BLEU-4 y BERTCos si un sistema generativo respeta la fuente.
- Investigacion en PLN de bajo recursos para persa: sirve como baseline afinado para comparar con otros adaptadores de la familia TalkFa (Llama-3.2-1B/3B, Mistral-7B, Mistral-Nemo-12B, Mistral-Small-24B).
- Prototipado de pipelines de dialogo con contexto largo: al heredar 128.000 tokens del base, puede procesar parrafos de Wikipedia extensos y articular dialogos sobre ellos.
- Generacion de material de entrenamiento para modelos de sentimiento en farsi: combinado con el adaptador hermano TalkFa-Sentiment, permite crear pares dialogo-etiqueta para tareas de analisis de sentimiento.
- Demos y evaluacion cualitativa de LoRA sobre Llama-3.1: el adaptador es ligero (2,2 GB) y se puede cargar y fusionar con `merge_and_unload()` para inspeccion rapida.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test set de Wiki-FaDial (100 dialogos). BERTCos es la similitud coseno de embeddings medios de ParsBERT (bert-fa-base).

| Metrica | Base (Llama-3.1-8B-Instruct) | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,655 | 0,668 | +0,012 |
| BLEU-4 | 0,578 | 0,596 | +0,018 |
| BERTCos | 0,944 | 0,962 | +0,018 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B requiere aproximadamente 16 GB en bf16/fp16; el adaptador LoRA anade una cantidad marginal (repo de 2,2 GB en safetensors, aunque el adaptador fusionado no incrementa el footprint del base).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) mediante cuantizacion del base, aunque el autor no documenta cuantizaciones especificas.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor con `PeftModel.from_pretrained(...).merge_and_unload()`); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card lista la familia completa de adaptadores TalkFa, lo que permite comparar directamente.

| Modelo | Parametros base | Tarea | Contexto | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| TalkFa-WikiFaDial-Llama-3.1-8B-Instruct-LoRA (este) | 8B | Wiki-FaDial generacion | 128k | llama3.1 | Hugging Face |
| TalkFa-WikiFaDial-Llama-3.2-1B-Instruct-LoRA | 1B | Wiki-FaDial generacion | 128k | llama3.2 | Hugging Face |
| TalkFa-WikiFaDial-Llama-3.2-3B-Instruct-LoRA | 3B | Wiki-FaDial generacion | 128k | llama3.2 | Hugging Face |
| TalkFa-WikiFaDial-Mistral-7B-Instruct-v0.3-LoRA | 7B | Wiki-FaDial generacion | 32k (base Mistral v0.3) | Apache 2.0 (base) | Hugging Face |
| TalkFa-WikiFaDial-Mistral-Nemo-Instruct-2407-LoRA | 12B | Wiki-FaDial generacion | 128k (base) | Apache 2.0 (base) | Hugging Face |
| TalkFa-WikiFaDial-Mistral-Small-24B-Instruct-2501-LoRA | 24B | Wiki-FaDial generacion | 32k (base) | Apache 2.0 (base) | Hugging Face |

No se dispone de resultados comparativos entre adaptadores en la informacion proporcionada; solo se publican las metricas del adaptador de 8B frente a su base.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado exclusivamente para generar dialogos de seis turnos en farsi desde parrafos de Wikipedia; su rendimiento fuera de esa tarea no esta validado.
- Idioma: solo se declara farsi (fa); el uso en castellano u otros idiomas no esta soportado por el ajuste.
- Riesgo de alucinacion: aunque la tarea exige fidelidad al parrafo, no se documentan medidas de mitigacion ni tasas de infidelidad.
- Sesgos: no se documentan analisis de sesgos del adaptador ni del dataset TalkFa.
- Licencia: el adaptador hereda la Llama 3.1 Community License, que impone restricciones de uso comercial y requiere aceptar los terminos del modelo base (gated en Hugging Face).
- Dependencia del base: requiere descargar y aceptar los terminos de `meta-llama/Llama-3.1-8B-Instruct` y autenticarse con `huggingface-cli login`.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la ficha, sin validacion independiente conocida.
- No se documentan cuantizaciones, latencias ni throughput, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Kamyar-zeinalipour/TalkFa-WikiFaDial-Llama-3.1-8B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper TalkFa (arXiv:2609.01810): https://arxiv.org/abs/2609.01810
- Repositorio GitHub del proyecto: https://github.com/KamyarZeinalipour/TalkFa
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Coleccion TalkFa en Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Configuracion de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_generation.json
