# Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-7B-Instruct-v0.3-LoRA

## Resumen

TalkFa-Sentiment-Mistral-7B-Instruct-v0.3-LoRA es un adaptador LoRA (PEFT) construido sobre el modelo base mistralai/Mistral-7B-Instruct-v0.3, desarrollado por Kamyar Zeinalipour y colaboradores (Neda Jamshidi, Fahimeh Akbari, Monica Bianchini, Marco Maggini y Marco Gori) en el marco del benchmark TalkFa. Su funcion resuelve una tarea concreta: la clasificacion de sentimiento (negativo, neutro o positivo) de dialogos teatrales en farsi (persa), a partir del split de entrenamiento PlayDial-Fa (1.867 dialogos) del mencionado benchmark.

El modelo es relevante porque aborda un nicho poco cubierto por los LLM generalistas: el analisis de sentimiento sobre dialogo dramatico en persa, un dominio con registro literario, ironia y estructuras conversacionales que difieren del texto plano. El adaptador mejora sustancialmente el recall y F1 del modelo base en esta tarea (F1 macro de 0,13 a 0,57), lo que indica que el ajuste fino aporta conocimiento especifico de dominio que el base no posee de forma nativa.

Tecnicamente se trata de un adaptador LoRA sobre un transformer decoder-only de 7.000 millones de parametros, con pesos en safetensors (0,7 GB de repositorio), licencia apache-2.0 y entrenado exclusivamente para farsi. El pipeline declarado es text-generation, ya que la clasificacion se obtiene mediante generacion de una respuesta en formato chat que nombra la etiqueta correcta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7B (modelo base); el adaptador LoRA anade un subconjunto no especificado en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Mistral, no detalladas) |
| Idiomas soportados | farsi (persa, codigo `fa`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 (gated) |
| Dataset de entrenamiento | Kamyar-zeinalipour/TalkFa, split PlayDial-Fa (1.867 dialogos) |
| Tamano del repositorio | 0,7 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only con atencion causal y mecanismo de Grouped-Query Attention (GQA), base ampliamente utilizada para ajuste fino por su equilibrio entre calidad y coste computacional. El ajuste se realiza mediante LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e introduce matrices de baja dimension en las capas seleccionadas, reduciendo drasticamente los parametros entrenables y el coste de almacenamiento (de ahi el repositorio de 0,7 GB frente a los ~15 GB del base en bfloat16).

El entrenamiento se llevo a cabo sobre el split PlayDial-Fa del benchmark TalkFa, compuesto por 1.867 dialogos teatrales en farsi etiquetados con sentimiento. La tarea se formula como generacion: el modelo recibe el historial de mensajes en formato chat y debe producir una respuesta que nombre exactamente la etiqueta de oro (negativo, neutro o positivo). El conjunto de test asociado cuenta con 104 dialogos. La configuracion de entrenamiento concreta esta publicada en el repositorio GitHub del proyecto (`configs/train_sentiment.json`), pero sus hiperparametros (rango LoRA, alpha, tasa de aprendizaje, epocas) no se detallan en la informacion disponible. No se especifica en la informacion proporcionada si hubo etapas de RLHF o DPO; el ajuste descrito es supervisionado sobre datos etiquetados.

## Capacidades

- Clasificacion de sentimiento en farsi sobre dialogo teatral, con tres clases: negativo, neutro y positivo.
- Generacion de texto en formato chat (hereda la interfaz conversacional de Mistral-7B-Instruct-v0.3).
- Comprension de contexto conversacional multi-turno, necesario para interpretar el sentimiento de un dialogo a partir de turnos previos.
- Manejo de registro literario y dramatico en persa (dialogos de obra de teatro), no solo texto informal.
- Capacidad multilingue limitada al farsi como idioma objetivo del adaptador; el base conserva sus idiomas originales pero el ajuste esta orientado a `fa`.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) para este adaptador.

## Casos de uso

- Analisis de sentimiento de guiones teatrales en farsi: el adaptador clasifica cada dialogo como negativo, neutro o positivo, permitiendo a companias teatrales, archivos y investigadores etiquetar corpus dramaticos persas a escala.
- Investigacion en procesamiento de lenguaje natural para persa: sirve como linea base ajustada para estudiar sentimiento en dialogo literario y comparar con modelos generalistas, dado el salto documentado de F1 0,13 a 0,57.
- Curaduria de archivos y bibliotecas digitales: clasificacion automatica de escenas y dialogos en colecciones de teatro persa para indexacion tematica y busqueda por tono emocional.
- Analisis de audiencia y recepcion: procesamiento de transcripciones de dialogo para estudiar la evolucion emocional de personajes a lo largo de una obra.
- Docencia y ensenanza de literatura persa: herramienta para analizar la carga emocional de escenas y apoyar ejercicios de analisis dramatico.
- Moderacion y analisis de contenido conversacional en farsi: aunque entrenado en teatro, el formato chat permite evaluar el tono de conversaciones multi-turno en persa, con cautela sobre la generalizacion fuera de dominio.
- Evaluacion comparativa de adaptadores: incluido en la familia TalkFa, permite comparar rendimiento entre bases de 1B, 3B, 7B, 8B, 12B y 24B sobre la misma tarea y dataset.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test PlayDial-Fa (104 dialogos). Una respuesta se considera correcta cuando nombra exactamente la etiqueta de oro. Metricas macro:

| Metrica (macro) | Base (Mistral-7B-Instruct-v0.3) | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| Precision | 0,56 | 0,60 | +0,04 |
| Recall | 0,08 | 0,58 | +0,50 |
| F1 | 0,13 | 0,57 | +0,44 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este adaptador, ni comparativas numericas con los otros adaptadores de la familia TalkFa.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa ~0,7 GB, pero requiere cargar el modelo base Mistral-7B-Instruct-v0.3. En bfloat16 el base necesita aproximadamente 14-15 GB de VRAM; en cuantizacion de 8 bits ~8 GB; en 4 bits ~4-5 GB (estimaciones estandar para un modelo de 7B, no cifras publicadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en bfloat16 sin cuantizar. GPUs consumer de 16 GB (RTX 4080, 4060 Ti 16 GB) requieren cuantizacion de 8 bits; GPUs de 8 GB requieren 4 bits.
- Cabe en consumer GPU: si, en RTX 4090/4080 sin cuantizar y en GPUs de 8-16 GB con cuantizacion.
- Opciones de despliegue: transformers + peft (flujo documentado en la model card, con `merge_and_unload()`), vLLM y TGI tras fusionar el adaptador, llama.cpp/Ollama si se exporta a GGUF (no documentado en la informacion disponible).
- Latencia y throughput: no disponible en la informacion proporcionada.
- Requisito de acceso: el modelo base esta gated, por lo que es necesario aceptar sus terminos y ejecutar `huggingface-cli login`.

## Comparativa con modelos similares

Comparativa dentro de la familia TalkFa (misma tarea PlayDial-Fa sentiment, misma licencia y dataset, segun la tabla de adaptadores de la model card):

| Modelo | Parametros base | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|
| TalkFa-Sentiment-Mistral-7B-Instruct-v0.3-LoRA (este) | 7B | Sentimiento PlayDial-Fa | apache-2.0 | Hugging Face |
| TalkFa-Sentiment-Llama-3.2-1B-Instruct-LoRA | 1B | Sentimiento PlayDial-Fa | no disponible en la informacion | Hugging Face |
| TalkFa-Sentiment-Llama-3.2-3B-Instruct-LoRA | 3B | Sentimiento PlayDial-Fa | no disponible en la informacion | Hugging Face |
| TalkFa-Sentiment-Llama-3.1-8B-Instruct-LoRA | 8B | Sentimiento PlayDial-Fa | no disponible en la informacion | Hugging Face |
| TalkFa-Sentiment-Mistral-Nemo-Instruct-2407-LoRA | 12B | Sentimiento PlayDial-Fa | no disponible en la informacion | Hugging Face |
| TalkFa-Sentiment-Mistral-Small-24B-Instruct-2501-LoRA | 24B | Sentimiento PlayDial-Fa | no disponible en la informacion | Hugging Face |

No se dispone en la informacion proporcionada de resultados numericos de los adaptadores alternativos ni de comparativas con clasificadores de sentimiento en persa ajenos a TalkFa, por lo que no es posible establecer una comparativa de rendimiento entre ellos.

## Limitaciones y advertencias

- Dominio muy especifico: entrenado sobre dialogo teatral (PlayDial-Fa); la generalizacion a otros registros del farsi (redes sociales, prensa, conversacion espontanea) no esta validada.
- Conjunto de test pequeno (104 dialogos): las metricas tienen alta varianza y deben interpretarse con cautela.
- Precision aun moderada (0,60 macro): el modelo comete falsos positivos relevantes; no es adecuado como clasificador unico en produccion sin validacion humana.
- Riesgo de alucinacion: al formularse como generacion de texto, el modelo puede producir respuestas que no nombren ninguna etiqueta valida o que divagen; se recomienda post-procesar la salida y forzar el formato de etiqueta.
- Sesgos: no se documentan en la informacion disponible analisis de sesgos; el corpus teatral puede sobrerrepresentar ciertos registros o generos.
- Idioma: el adaptador esta orientado solo a farsi; su uso en otros idiomas no esta respaldado.
- Licencia: el adaptador es apache-2.0, pero es derivado de Mistral-7B-Instruct-v0.3, cuyo uso comercial esta sujeto a los terminos de Mistral; verificar la licencia del base antes de despliegues comerciales.
- Modelo base gated: requiere aceptacion de terminos y autenticacion en Hugging Face.
- Sin datos publicados sobre hiperparametros de entrenamiento en la informacion proporcionada, lo que dificulta la reproducibilidad directa sin consultar el repositorio GitHub.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/Kamyar-zeinalipour/TalkFa-Sentiment-Mistral-7B-Instruct-v0.3-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Coleccion TalkFa en Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Paper (arXiv): https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Configuracion de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_sentiment.json
- Adaptador hermano (generacion Wiki-FaDial, Mistral-7B): https://huggingface.co/Kamyar-zeinalipour/TalkFa-WikiFaDial-Mistral-7B-Instruct-v0.3-LoRA
