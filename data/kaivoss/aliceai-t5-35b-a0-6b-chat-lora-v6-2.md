# kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.2

- Datasets: kaivoss/UltraData-SFT-Agent-2609-GLM53-20k, openbmb/UltraData-SFT-2605
- Merged bf16 weights: kaivoss/AliceAI-T5-35B-A0.6B-chat-v6.2
- Reasoning capped at 600 tokens
- Placeholder tokens issue: 5,832 placeholder tokens
- Behaviour probes: v2 61% (base 11%), v3 88%, greetings 24/24, v4 after-tool 22/23, held-out right-kind-of-reply fell 91% to 83%, v5 96% right-kind-of-reply, v6
- v6 rule: every answer thinks first
- UltraData Knowledge traces: median 5,241 tokens, one in 400 fits 600-token budget

The model card is cut off ("negtask, about three..."). So I work with what's given.

Note: The dates say 2026, arxiv 2602.09003. Interesting - it's a hypothetical future model. I'll just report as given.

I must be careful with the rules: only first word of titles capitalized. Titles are already defined. Use tables. No emojis. Spanish from Spain. Don't invent data. Say "no disponible" where data isn't available.

Let me think about specs:
- Architecture: encoder-decoder sparse MoE (UL2)
- Total parameters: 35B
- Active parameters: 0.6B
- Context length: no disponible (not given)
- Quantization types: no disponible (though GGUF not mentioned; safetensors/bf16 and LoRA)
- Languages: en (English)
- License: apache-2.0
- Weight format: safetensors, LoRA adapter (PEFT)

Note this is a LoRA adapter, not a full model. The repo size is 0.0 GB which is odd (small adapter).

Let me write the ficha.

For benchmarks, we have behaviour probe percentages but these are custom probes, not standard benchmarks. I should present them as what they are - internal behaviour probes, not standard benchmarks like MMLU. I'll be careful to label them.

Actually the instructions say if there are benchmark data, present table. These are behaviour probes, not MMLU etc. I'll present them clearly labeled as internal probes and note that no standard benchmarks (MMLU, HumanEval, GSM8K) are published.

Let me draft.

Title headers: they're fixed by structure. "Resumen", "Especificaciones tecnicas" (only first word capital - "Especificaciones tecnicas" - hmm "tecnicas" should be lowercase, yes), "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces".

Note: NO accents issue? The instruction says Castilian Spanish. I'll use accents properly where correct (ortografía). Wait "Especificaciones tecnicas" - should be "técnicas" with accent. The user wrote "Especificaciones tecnicas" without accent. Hmm. The rule says "sin faltas de ortografia". So I should write "técnicas" with accent. Actually let me re-read: the structure shows "## Especificaciones tecnicas". But rule says no spelling errors. I'll use proper accents: "técnicas". Actually, let me follow proper Spanish spelling with accents. It's safer to have correct accents. Hmm, but the header given is without accent. Let me use correct accents - the rule about no spelling errors takes priority. Actually wait, the rule "Solo la primera palabra de los titulos va en mayuscula" - just capitalization. Accents are separate and should be correct.

I'll write "## Especificaciones técnicas" etc.

Hmm, but they explicitly wrote the headers without accents. This is ambiguous. I think correct Spanish with accents is better given "sin faltas de ortografía". I'll use accents.

Let me now write.

For hardware requirements: 35B total params. In bf16, that's ~70GB. With LoRA adapter merged, full precision. MoE with 0.6B active means inference compute is low but memory must hold all 35B. So VRAM ~70GB bf16, ~35GB int8, ~18GB int4 (though GGUF availability unknown). I should estimate but mark as estimates. The rules say don't invent data but estimates based on parameter count are reasonable if labeled. Let me provide estimates clearly labeled.

Actually, need to be careful. Let me present estimated VRAM with a clear caveat that exact figures are not published.

For comparativa: comparable models - MoE encoder-decoder... This is unusual. I'll note similar MoE models like Mixtral, or T5-based. Hmm. I'll say comparable sparse MoE models. Let me be careful not to invent specs. I could compare with other MoE models but I'd be inventing their numbers if not provided. Better to be conservative: mention only what I know reliably, or say "no disponible" for concrete comparison. Actually I can compare conceptually with models known publicly like Mixtral 8x7B (46.7B total, 12.9B active), but the numbers... I know these are public. Let me be careful. I'll provide a limited comparison with a caveat.

Actually the rule: don't invent. Mixtral 8x7B: 46.7B total, 12.9B active - this is well-known public info. But it's a decoder-only, this is encoder-decoder. It's a different category really. Let me include a comparison but note differences.

Hmm, I think it's safer to present a comparison table with known public data for a couple of MoE models and label clearly. Let me include Qwen, Mixtral. Actually let me keep it focused and note the base model is unusual.

Let me be moderate and include a comparison noting the difficulty.

Let me write the full ficha now.

Let me draft conversation about context length - not available.

I'll write.

For "Casos de uso" min 6 bullets.

For enlaces: HuggingFace adapter, base model, merged weights, finetune example, earlier versions, datasets, arxiv paper.

Let me write.

Regarding the benchmark table - the numbers are:
- Base model behaviour probes: 11%
- v2: 61%
- v3: 88% (greetings 24/24)
- v4: after-tool 22/23, held-out 83%
- v5: 96% right-kind-of-reply
- v6.2: current

I'll present a table of these behaviour probe results across versions.

Also placeholder tokens: 5,832.

Let me write it all.

Now writing.

Note on the "35B-total / 0.6B-active" - the name says 35B-A0.6B.

Let me be thorough.

I'll mention the model card is cut off / data from the run.

Let me produce.## Resumen

AliceAI-T5-35B-A0.6B-chat-lora-v6.2 es un adaptador LoRA (rango 16, alpha 16) publicado por el usuario kaivoss sobre el modelo base `yandex/AliceAI-T5-35B-A0.6B`, un modelo encoder-decoder de mezcla de expertos dispersa (sparse MoE) con 35.000 millones de parametros totales y 0.600 millones activos. El modelo base no incorpora formato de chat, por lo que este adaptador le ensena a conversar, a invocar herramientas cuando la tarea lo requiere, a responder en texto cuando no hace falta ninguna y a permanecer en silencio cuando no hay nada que decir.

La innovacion principal de la version v6.2 es la regla de "pensar primero": toda respuesta no silenciosa empieza con un bloque `<think>…</think>`, de modo que el modelo razona antes de contestar. El entrenamiento se ha realizado sobre dos conjuntos de datos (kaivoss/UltraData-SFT-Agent-2609-GLM53-20k y openbmb/UltraData-SFT-2605) y esta orientado especificamente a flujos de agente con tool calling y a evitar los fallos detectados en versiones anteriores (llamadas repetidas, sobrepensamiento, respuestas vacias o silencios incorrectos).

Se trata de un adaptador experimental, en fase v6.2, con licencia Apache 2.0 y soporte unicamente para ingles. Su relevancia radica en el enfoque poco habitual (MoE encoder-decoder con UL2 como base) y en la documentacion detallada de la evolucion del entrenamiento, con metricas de comportamiento internas por version.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con mezcla de expertos dispersa (sparse MoE), base tipo UL2 |
| Parametros totales | 35B (del modelo base) |
| Parametros activos | 0,6B (A0.6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el merge se publica en bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

Notas adicionales: el adaptador se distribuye mediante la libreria PEFT. Existe una version con pesos fusionados en bf16 en el repositorio `kaivoss/AliceAI-T5-35B-A0.6B-chat-v6.2`. El tamano del repositorio del adaptador aparece como 0.0 GB.

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder-decoder con mezcla de expertos dispersa (sparse MoE) y base tipo UL2, con 35.000 millones de parametros totales de los que solo 0.600 millones se activan por token. El adaptador es un LoRA de rango 16 y alpha 16 que se aplica sobre ese modelo base. Segun la model card, las embeddings de ciertos tokens de la propia vocabulario (`[INST_START]`, `[REPLY_END]`, `[SYSTEM_*]`, `[TOOL_RESULT_*]`) son marcadores de posicion sin entrenar en el modelo base: el autor identifica 5.832 tokens de este tipo en `placeholder_ids.json` y senala que el LoRA sobre atencion no puede ensenar embeddings, por lo que las versiones posteriores abandonaron esos tokens en favor de marcadores de rol en texto plano y `</s>` como fin de turno.

El entrenamiento consistio en ajuste fino supervisado (SFT) sobre datos de agente y de chat. La regla central de la version v6 es que toda respuesta no silenciosa empieza con un bloque `<think>…</think>`; el constructor de datos rechaza cualquier objetivo que no lo cumpla y vuelve a verificar el fichero final. El razonamiento es real cuando la fuente lo contiene (en los datos de agente, aproximadamente el 100% de los turnos de accion y finales en las categorias Code, General y Search) y exacto cuando es plantillado. Las trazas de la categoria Knowledge de UltraData se descartaron por su longitud (mediana de 5.241 tokens; solo una de cada 400 encaja en un presupuesto de 600 tokens), y smoltalk no se uso porque carece de razonamiento. Las filas silenciosas se mantienen vacias. El razonamiento esta limitado a 600 tokens. La model card menciona un paper asociado (arxiv:2602.09003), aunque la informacion proporcionada no detalla su contenido.

## Capacidades

- Generacion de texto conversacional en ingles, con un bloque de razonamiento previo (`<think>…</think>`) en cada respuesta no silenciosa.
- Tool calling y function calling: el modelo decide cuando invocar herramientas y cuando responder directamente en texto.
- Comportamiento de agente en flujos multi-turno, incluyendo la continuacion correcta tras recibir un resultado de herramienta (finalizar con la respuesta en lugar de repetir la llamada).
- Capacidad de abstenerse: emite silencio cuando no hay nada que responder (por ejemplo, ante un "gracias" en el contexto de un harness de agente).
- Negacion de uso de herramientas cuando se le indica explicitamente ("no usar herramientas").
- Razonamiento limitado a un maximo de 600 tokens por respuesta.
- Idiomas: solo ingles.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional en ingles: el adaptador aporta el formato de chat que el modelo base no tiene, por lo que puede gestionar conversaciones de ida y vuelta con marcadores de rol en texto plano.
- Agente con acceso a herramientas: adecuado para bucles de agente en los que el modelo debe decidir entre llamar a una funcion (lectura de ficheros, ejecucion de comandos, edicion) o responder directamente.
- Integracion en harness de agentes tipo "pi": el entrenamiento incluyo flujos especificos para ese tipo de prompt, con correccion del fallo de repeticion de llamadas tras recibir un resultado de herramienta.
- Generacion de codigo asistida dentro de un agente: la categoria Code del dataset de agente aporta trayectorias con razonamiento de accion y turnos finales.
- Busqueda aumentada (search): la categoria Search del dataset de agente entrena turnos con razonamiento antes de la accion.
- Filtrado de intervenciones: la capacidad de silencio permite usarlo como componente que decide cuando no debe intervenir en un canal o conversacion.
- Prototipado de investigacion en MoE encoder-decoder: sirve como ejemplo de adaptacion de un modelo UL2 disperso a tareas de chat y uso de herramientas.

## Benchmarks y rendimiento

No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si incluye resultados de "sondas de comportamiento" internas (behaviour probes) por version del adaptador, que se reproducen a continuacion tal como se describen; no son benchmarks comparables con evaluaciones estandar y corresponden a pruebas de comportamiento definidas por el autor.

| Version | Metrica reportada | Resultado |
|---|---|---|
| Modelo base | Sondas de comportamiento | 11% |
| v2 | Sondas de comportamiento | 61% |
| v3 | Sondas de comportamiento (reconstruidas) | 88% (saludos 24/24) |
| v4 | Sondas "after-tool" | 22/23 |
| v4 | Tasa de "tipo de respuesta correcta" en turnos reales held-out | 83% (bajada desde el 91% de v5-era) |
| v5 | Tasa de "tipo de respuesta correcta" en turnos reales held-out | 96% |
| v6.2 | no disponible (version experimental actual) | no disponible |

Otros datos mencionados en la model card: en v4, la puntuacion con muestreo era 10 puntos inferior a la puntuacion greedy. En v5 se observo un bucle de dialogo de 13.221 tokens ante una peticion de historia. No se proporcionan latencias ni throughput.

## Requisitos de hardware

- El adaptador LoRA es ligero (rango 16), pero para inferencia hay que cargar el modelo base completo de 35B parametros totales, ya que la MoE activa 0,6B por token pero mantiene en memoria todos los expertos.
- VRAM estimada para el modelo fusionado en bf16: en torno a 70 GB (estimacion a partir de 35B parametros a 2 bytes por parametro; cifra no publicada oficialmente).
- VRAM estimada en cuantizacion de 8 bits: en torno a 35 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 18 GB.
- No cabe en GPU de consumo en bf16. En cuantizacion de 4 bits podria encajar en GPUs con 24 GB de VRAM (por ejemplo RTX 4090 o RTX 3090), siempre que exista una version cuantizada compatible, dato que no se confirma.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU.
- Opciones de despliegue: la model card menciona PEFT para el adaptador y pesos fusionados en bf16; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de comparativas con otros modelos. La combinacion de arquitectura encoder-decoder con MoE dispersa tipo UL2 y 0,6B parametros activos es poco habitual en modelos de chat, por lo que no se ofrecen cifras de terceros que pudieran ser inexactas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AliceAI-T5-35B-A0.6B-chat-lora-v6.2 | 35B | 0,6B | no disponible | apache-2.0 | adaptador LoRA + merge bf16 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental (v6.2): el propio autor lo etiqueta como experimental y advierte que las tablas proceden de la ejecucion concreta, no de una evaluacion exhaustiva.
- Idioma unico: solo ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; los datos de tipo Knowledge se descartaron por longitud, lo que limita la cobertura de conocimiento.
- Longitud de contexto: no disponible, lo que impide garantizar conversaciones largas o documentos extensos.
- Comportamiento sensible al prompt: segun la model card, versiones anteriores fallaron de forma especifica bajo ciertos prompts de agente y mejoraron en otros; el rendimiento depende del harness.
- Razonamiento acotado a 600 tokens, lo que puede truncar tareas que necesiten cadenas de razonamiento mas largas.
- Fallos documentados en versiones previas (riesgo a vigilar): llamadas repetidas a herramientas tras recibir un resultado, respuestas vacias con la respuesta atrapada dentro de `<think>`, omision del dato clave y, en v5, bucles de generacion muy largos.
- Dependencia del modelo base: los tokens de rol de la vocabulario son marcadores sin entrenar, por lo que el formato de chat debe evitarse con esos tokens (el propio autor mantiene una prueba unitaria que falla si el formato los usa).
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `yandex/AliceAI-T5-35B-A0.6B` de forma independiente.
- No apto para produccion critica sin validacion previa: estado experimental y ausencia de benchmarks estandar.

## Enlaces

- Adaptador LoRA v6.2: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.2
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Pesos fusionados en bf16: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v6.2
- Ejemplo de ajuste fino (`finetune_chat_lora.py`): incluido en el repositorio del adaptador
- Version anterior v6.1: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.1
- Version anterior v6: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6
- Version anterior v5: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v5
- Version anterior v4: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4
- Version anterior v3: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v3
- Version anterior v2: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2
- Version anterior v1: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora
- Dataset de agente: https://huggingface.co/datasets/kaivoss/UltraData-SFT-Agent-2609-GLM53-20k
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Paper (referencia arxiv:2602.09003): no se proporciona URL directa en la informacion disponible
