# seongbo/timer-3b

## Resumen

TIMER 3B es un modelo de diálogo desarrollado por Seongbo Jang (publicado bajo el identificador `seongbo/timer-3b`) orientado a la generación de respuestas oportunas (*timely response generation*). A diferencia de los agentes conversacionales convencionales, que solo predicen *qué* responder, TIMER modela explícitamente *cuándo* responder: primero estima el intervalo temporal que transcurre antes del siguiente turno y después genera la respuesta condicionada a ese intervalo. El modelo se presenta en el artículo "From *What to Respond* to *When to Respond*: Timely Response Generation for Open-domain Dialogue Agents" (Findings of EACL 2027).

Técnicamente es un ajuste fino de COSMO-xl, un modelo de diálogo encoder-decoder basado en T5 con aproximadamente 2.850 millones de parámetros. Se entrena con un objetivo multitarea sobre el conjunto TimelyChat, compuesto por 55.000 diálogos sintéticos en inglés orientados a eventos. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors, lo que facilita su integración en pipelines de `transformers`.

Su relevancia radica en que aborda una dimensión poco explorada en agentes conversacionales: la temporización de las respuestas en escenarios asíncronos (mensajería, asistentes que reaccionan a eventos), donde el momento de responder es tan importante como el contenido. No obstante, al estar entrenado con datos sintéticos y no validado en conversaciones reales, debe considerarse una base de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (base: allenai/cosmo-xl) |
| Parametros totales | 2.849.757.184 (~2,85 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TIMER 3B hereda la arquitectura de COSMO-xl, un modelo encoder-decoder de la familia T5 con unos 2,85 mil millones de parámetros, especializado originalmente en diálogo de dominio abierto. Sobre esa base, el autor aplica un ajuste fino con un objetivo multitarea que aprende de forma conjunta dos tareas: la predicción del intervalo temporal antes del siguiente turno y la generación de la respuesta condicionada a dicho intervalo. El entrenamiento se realiza sobre TimelyChat, un conjunto de 55.000 diálogos sintéticos en inglés con estructura event-driven, según se detalla en la Sección 5 y el Apéndice C.1 del artículo.

El formato de entrada es una secuencia de turnos serializada con marcadores especiales: `<spk> SPEAKER: <time> INTERVAL later <utt> UTTERANCE`. Para predecir el intervalo, la entrada termina con el hablante objetivo y el token `<time>`, y el modelo genera primero el intervalo y después la respuesta. Si se desea generar una respuesta para un intervalo dado, se introduce explícitamente, por ejemplo, `<spk> B: <time> 1 hour later <utt>`. No se documentan en la información disponible detalles sobre volumen total de tokens, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Predicción del intervalo temporal antes del siguiente turno en una conversación multi-turno.
- Generación de respuestas condicionadas a un intervalo temporal explícito.
- Generación de diálogo de dominio abierto en inglés con estructura de turnos codificada mediante marcadores `<spk>`, `<time>` y `<utt>`.
- Modelado conjunto de temporización y contenido mediante un único objetivo multitarea.
- Decodificación con `num_beams` y `no_repeat_ngram_size` para controlar la generación, tal como se muestra en la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistentes de mensajería asíncrona: el modelo puede decidir cuánto tiempo esperar antes de responder en una conversación, lo que resulta útil en plataformas donde las respuestas no son inmediatas y la temporización afecta a la naturalidad del intercambio.
- Simulación de interlocutores humanos en entornos de investigación: al modelar el intervalo entre turnos, permite generar diálogos sintéticos con dinámica temporal realista para experimentos de evaluación conversacional.
- Chatbots de atención al cliente con respuesta diferida: el modelo puede condicionar la respuesta al tiempo transcurrido desde el último mensaje del usuario, aunque su validación en conversaciones reales es limitada.
- Generación de datos de entrenamiento para agentes conversacionales: dado que el modelo produce tanto el intervalo como la respuesta, puede emplearse para aumentar corpus de diálogo con anotación temporal automática.
- Investigación en interacción humano-agente: sirve como base para estudiar cómo la temporización influye en la percepción de naturalidad y coherencia en agentes de dominio abierto.
- Prototipado de agentes event-driven: en escenarios donde un asistente reacciona a eventos con retrasos variables (recordatorios, notificaciones contextuales), el modelo puede generar respuestas coherentes con el intervalo transcurrido.
- Evaluación comparativa de modelos de diálogo: al ser un ajuste fino de COSMO-xl con una tarea adicional, resulta útil como referencia en estudios que comparen generación de respuesta frente a generación conjunta de tiempo y respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32 (tamaño del repo de 11,4 GB) se requieren aproximadamente 11-12 GB de VRAM; en fp16/bf16, en torno a 6 GB; en cuantización de 8 bits, alrededor de 3-4 GB (estimaciones orientativas, no documentadas por el autor).
- GPU recomendadas: A100 o H100 para inferencia en fp32 con throughput alto; RTX 4090 o A6000 para fp16/bf16; GPUs con 8 GB o más para cuantización de 8 bits.
- Compatibilidad con GPU de consumo: sí, en fp16 cabe en RTX 3090, RTX 4090 y GPUs con 12 GB o más; en cuantización de 8 bits podría ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (soporte nativo documentado); el tag `text-generation-inference` sugiere compatibilidad con TGI; también es viable `llama.cpp` u Ollama si se generan pesos GGUF, aunque no se publican en el repo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TIMER 3B (seongbo/timer-3b) | ~2,85 B | no disponible | Diálogo con predicción de intervalo temporal | Apache 2.0 | Hugging Face |
| COSMO-xl (allenai/cosmo-xl) | ~3 B (modelo base) | no disponible | Diálogo de dominio abierto | no disponible en la información proporcionada | Hugging Face |
| Modelos de diálogo T5 de escala similar | ~3 B | no disponible | Generación de texto/diálogo | variable | Hugging Face |
| LLMs de gran escala (p. ej. GPT-4o) | no disponible | no disponible | Diálogo general | propietaria | API |

La comparación directa con COSMO-xl es la más pertinente, ya que TIMER es un ajuste fino del mismo. Frente a LLMs de gran escala, la propia model card reconoce que TIMER queda por detrás en naturalidad y coherencia. No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Entrenado exclusivamente con diálogos sintéticos en inglés y no validado en conversaciones reales, según indica el propio autor.
- Rendimiento inferior en naturalidad y coherencia frente a LLMs mucho mayores como GPT-4o.
- Cobertura lingüística limitada al inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de validación en dominios reales.
- Sesgos potenciales derivados de los datos sintéticos de entrenamiento; no se documentan análisis de sesgo.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación en producción y la dependencia de datos sintéticos desaconsejan su despliegue directo sin evaluación adicional.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni datos de latencia/throughput, lo que limita la planificación de despliegues eficientes.
- El modelo está diseñado para una tarea muy específica (temporización + respuesta); su uso fuera de ese esquema de marcadores `<spk>`/`<time>`/`<utt>` puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seongbo/timer-3b
- Dataset TimelyChat: https://huggingface.co/datasets/seongbo/timelychat
- Código: https://github.com/sb-jang/timelychat
- Modelo base COSMO-xl: https://huggingface.co/allenai/cosmo-xl
- Artículo: "From *What to Respond* to *When to Respond*: Timely Response Generation for Open-domain Dialogue Agents" (Findings of EACL 2027)
