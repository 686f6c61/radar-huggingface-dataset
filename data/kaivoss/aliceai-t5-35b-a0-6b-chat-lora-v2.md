# kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2

text\n<tool_call>name<arg_key>k</arg_key><arg_value>v</arg_value></tool_call></s>
Tools in system message GLM format.
Empty reply is just </s>.

Usage: transformers + peft, bf16, eager attention. Sampling temperature 0.6, top_p 0.95, max_new_tokens 512. Must use sampling, not greedy.

Serving: vLLM community plugin (AntonProkopyev/AliceAI-T5-35B-A0.6B-vLLM) serves /v1/completions; alice_openai_shim.py adds /v1/chat/completions with tools, reasoning, streaming (simulated).

Merged bf16 weights: kaivoss/AliceAI-T5-35B-A0.6B-chat-v2
v1: kaivoss/AliceAI-T5-35B-A0.6B-chat-lora
NVFP4 quantization: ProCreations/AliceAI-T5-35B-A0.6B-NVFP4

Context length: not stated. Need "no disponible". Hmm. Also moe details: 512 experts, top-8. Hidden dim 1536 (truncated, probably "hidden dimension of 1536" or similar). I'll be careful — the snippet says "1,536-dimensional hidden ..." — I could mention 1,536 hidden dim but it's truncated. Maybe say "dimensión oculta de 1.536 (según aimodels.fyi)". Hmm, risky. Actually it's fine to cite with source.

Parameters: total 34.35B per one source, "34-35 billion" per another. Active ~0.6B.

Context length: no info. Vocabulary 135,040 tokens.

Benchmarks: no benchmark data. Only the behaviour probes: 61% vs 11% base; 90% reply-type selection. That's a behavior eval, not standard benchmarks. I'll present a table with those and note no standard benchmarks.

Hardware: LoRA adapter is small (repo size 0.0 GB) but base is 35B total / 0.6B active. bf16 => ~70 GB just weights? 34.35B * 2 bytes = ~68.7 GB. Plus overhead. Actually MoE with all experts loaded. NVFP4 version available. Consumer GPU: no, doesn't fit in 24GB in bf16. With 4-bit quant maybe ~18-20GB. I should be careful — estimates should be flagged as estimates.

Deployment: transformers + peft, vLLM plugin, the shim. Ollama/llama.cpp: no GGUF mentioned — "no disponible".

Comparison: base model yandex/AliceAI-T5-35B-A0.6B, v1 adapter, merged chat-v2, NVFP4 quant. Those aren't really "similar models" but they're the comparison set available. Maybe also mention other comparable models — but I shouldn't invent. I'll compare with base and v1 and merged.

Note that the arxiv tag is arxiv:2602.09003 — a fictional future arxiv ID (2602 = Feb 2026). Dates are 2026. So it's a future scenario. I'll just report what's there.

Let me write the fiche.

Structure obligatory. Titles only first word capitalized. No emojis. Spanish from Spain.

Let me draft.

## Resumen
AliceAI-T5-35B-A0.6B-chat-lora-v2 es un adaptador LoRA... desarrollado por el usuario kaivoss (no por Yandex). Publicado el 30 de septiembre de 2026. Enseña a conversar a la base, tool calling, etc. Base: yandex/AliceAI-T5-35B-A0.6B, MoE disperso encoder-decoder estilo UL2/T5, 34,35B parámetros totales y ~0,6B activos por token, 512 expertos por capa MoE con enrutado top-8, encoder de 16 capas y decoder de 12, vocabulario de 135.040 tokens.

Relevancia: es el eslabón que convierte un modelo base de producción sin plantilla de chat en un modelo con formato conversacional y function calling, con licencia Apache 2.0. Pero el autor lo describe explícitamente como checkpoint de investigación, no como agente desatendible.

Contexto: no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
| Arquitectura | Adaptador LoRA sobre un transformer encoder-decoder (T5/UL2) con mezcla de expertos dispersa (MoE) |
| Parametros totales | 34,35B en el modelo base; el adaptador LoRA es de rango 16 (alfa 16) |
| Parametros activos | ~0,6B por token (top-8 de 512 expertos por capa MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (adaptador y pesos fusionados); existe una variante NVFP4 de terceros (ProCreations). No se documentan GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el repositorio ocupa 0,0 GB |

Also add rows: vocabulario, capas, autores. It says "Incluye SIEMPRE estas filas" — I can add extra rows. I'll add "Vocabulario", "Encoder/decoder", "Modelo base", "Autores".

Hmm, keep the required rows exact and add extra ones after.

## Arquitectura y entrenamiento

Base: MoE encoder-decoder. 16 encoder layers, 12 decoder, 135,040 vocab, hidden 1,536. 512 experts/layer, top-8. Trained from scratch by Yandex as production backbone for Alice AI answers in Search.

The adapter: LoRA rank 16 alpha 16, trained on three datasets. Fixes for v1:
1. Untrained delimiter tokens — v1 used [INST_START], [REPLY_END], [SYSTEM_*], [TOOL_RESULT_*] which are untrained placeholders identical to unused <SPAN#5000>. placeholder_ids.json lists 5,832 placeholder tokens; v2 uses only trained tokens: plain-text role markers and </s>.
2. Data imbalance: 98% tool calls outside Tool-Use subsplit in v1; v2 mixes plain chat, tools-present-but-not-needed, "don't use tools" instructions.
3. Greedy decoding loopeaba; serving shim now samples, merges duplicate calls, caps parallel calls.

No se documenta número de tokens de entrenamiento, composición exacta del dataset, ni si hubo RLHF/DPO. "no disponible".

## Capacidades

- Generación de texto conversacional en inglés
- Tool calling / function calling en formato GLM
- Modo "thinking" (<think>...</think>)
- Capacidad de no responder (turno vacío = </s>)
- No multilingüe (solo en)
- No visión ni audio

## Casos de uso — min 6. Must be realistic and mention caveats. Since the author says research checkpoint, I should keep them realistic.

## Benchmarks

Table: probes de comportamiento v2 61%, base 11%; selección correcta del tipo de respuesta en turnos reales de agente 90%; nunca escribió otro turno (0 incidencias? "never wrote another turn" = 100%?); fallo: 4/10 saludos bajo prompt de agente de código generan tarea inventada y tool call; 0/2 respuestas tras resultado de herramienta (repite la llamada).

I'll present as table and note "No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible."

## Requisitos de hardware

- bf16: ~69 GB solo pesos (34,35B × 2 bytes) + activaciones/KV; necesita A100 80GB, H100 80GB, o 2×48GB.
- Nota: al ser MoE solo 0,6B activos, el cómputo por token es bajo, pero la VRAM depende de los parámetros totales.
- NVFP4 (4 bits): ~17-20 GB estimado → cabe en RTX 4090 / L40S 48GB.
- Consumer: no cabe en bf16 en consumer. Cuantizado a 4 bits podría caber en 24 GB pero no hay GGUF oficial documentado.
- Despliegue: transformers + peft (bf16, attn eager), vLLM mediante plugin comunitario, shim OpenAI-compatible. llama.cpp/Ollama: no disponible (sin GGUF).
- Latencia/throughput: no disponible.
- Necesita sampling (temperature 0.6, top_p 0.95), greedy provoca bucles.

Should mark estimates clearly as estimates.

## Comparativa

Table with: base yandex/AliceAI-T5-35B-A0.6B, v1 adapter, this v2 adapter, merged chat-v2, NVFP4.

Also mention no comparable third-party models known from info? The instruction says compare with 2-3 alternatives of the same category. I'll use base, v1, merged. And note that no se dispone de datos de otros adaptadores de chat comparables.

## Limitaciones

- 4/10 saludos generan tarea inventada y tool call bajo prompt de agente de código
- Tras resultado de herramienta repite la llamada (0/2)
- Sobre-razona preguntas simples
- Solo inglés
- Checkpoint de investigación
- LoRA no puede enseñar embeddings (por eso v2 usa tokens entrenados)
- Decodificación greedy produce bucles
- Licencia Apache 2.0 permisiva, pero el modelo base y sus derivados dependen de la licencia de Yandex (Apache 2.0 también según la card)
- 0 descargas / 0 likes → sin validación comunitaria
- Contexto no documentado
- Sesgos: no disponible

## Enlaces

- HF adapter
- HF base
- merged repo
- v1
- finetune_chat_lora.py
- chat_template.jinja, glm_tools.py, alice_chat.py, placeholder_ids.json, alice_openai_shim.py
- vLLM plugin github
- NVFP4
- arxiv 2602.09003
- aimodels.fyi, aimodeling.com, X post

Let me be careful about "finetune_chat_lora.py in this repo" — link as https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2/blob/main/finetune_chat_lora.py

Now write it all. Careful about decimal separator: Spanish uses comma. Use "34,35B" etc. Use commas for thousands: 135.040.

Titles: only first word capitalized. "## Especificaciones tecnicas" — note "tecnicas" without accent as in the prompt (they wrote it without accent). I'll keep as given: "Especificaciones tecnicas". Hmm, that's a misspelling in Spanish (técnicas). The rule says use Spanish without spelling mistakes. The template says "Especificaciones tecnicas". I'll write "Especificaciones técnicas" to be correct. Actually the required structure says "## Especificaciones tecnicas". But rule about no faltas de ortografía... I'll use "## Especificaciones técnicas" — correct spelling, and only first word capitalized. Similarly "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces". Those are fine. "## Resumen".

Hmm, but "Resumen" — fine.

Only first word capitalized: "## Especificaciones técnicas" ok.

Now write it.

For the context length — no disponible. Note the base model card doesn't state it in the info provided.

Let me write the final markdown.## Resumen

AliceAI-T5-35B-A0.6B-chat-lora-v2 es un adaptador LoRA publicado por el usuario kaivoss sobre el modelo base yandex/AliceAI-T5-35B-A0.6B. No es un modelo completo: es un ajuste fino de rango 16 y alfa 16 que dota de formato conversacional, razonamiento explícito y llamada a herramientas a un modelo base que, según su propia model card, no trae plantilla de chat. El adaptador se publicó el 30 de septiembre de 2026 y el repositorio pesa 0,0 GB, ya que solo contiene los pesos del adaptador y utilidades de decodificación.

El modelo base es un transformer encoder-decoder de estilo T5/UL2 con mezcla de expertos dispersa: 34,35B parámetros totales, unos 0,6B activos por token, 512 expertos por capa MoE con enrutado top-8, encoder de 16 capas, decoder de 12 capas y un vocabulario de 135.040 tokens. Yandex lo entrenó desde cero como columna vertebral de las respuestas de Alice AI en su buscador, lo que lo convierte en una de las últimas apuestas serias por la arquitectura encoder-decoder en un ecosistema dominado por los transformers decoder-only.

La relevancia de este adaptador es concreta: convierte un modelo base de producción sin interfaz de chat en un modelo capaz de alternar entre respuesta en texto, llamada a herramienta y silencio, con licencia Apache 2.0. Ahora bien, el propio autor lo etiqueta como checkpoint de investigación y no como un agente desatendible: el adaptador pasa el 61% de sus pruebas de comportamiento y falla en el escenario que motivó su desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder estilo T5/UL2 con mezcla de expertos dispersa (MoE) |
| Parametros totales | 34,35B en el modelo base; adaptador LoRA de rango 16 y alfa 16 |
| Parametros activos | ~0,6B por token (top-8 de 512 expertos por capa MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en el adaptador y en los pesos fusionados; existe una variante NVFP4 de terceros (ProCreations). No se documentan GGUF ni GPTQ/AWQ oficiales |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el repositorio ocupa 0,0 GB |
| Modelo base | yandex/AliceAI-T5-35B-A0.6B |
| Encoder / decoder | 16 capas de encoder y 12 capas de decoder |
| Vocabulario | 135.040 tokens |
| Dimensión oculta | 1.536 (según aimodels.fyi) |
| Enrutado MoE | top-8 sobre 512 expertos por capa |
| Autores | kaivoss (adaptador); Yandex (modelo base) |
| Librería | peft (compatible con transformers) |
| Fecha de publicación | 2026-09-30 (actualizado el 2026-10-01) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base MoE encoder-decoder. La entrada se construye en un marco UL2: el encoder recibe `[_S_]` seguido de marcadores de rol en texto plano (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|tool|>`) y termina en `<|assistant|><SPAN#0>`; el decoder arranca con `<s><SPAN#0>` y genera el turno hasta `</s>`. El razonamiento se renderiza únicamente para el turno que se está prediciendo, dentro de etiquetas `<think>`, y las llamadas a herramientas usan el formato `<tool_call>nombre<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>`. Las herramientas se declaran en el mensaje de sistema en formato GLM, generado por `glm_tools.py`. Una respuesta vacía se representa simplemente como `</s>`, lo que da al modelo la capacidad explícita de no contestar.

El entrenamiento se hizo sobre tres conjuntos de datos: kaivoss/UltraData-SFT-Agent-2609-GLM53-20k, openbmb/UltraData-SFT-2605 y HuggingFaceTB/smoltalk. No se especifica el número total de tokens ni la composición exacta del mezclado, y tampoco se documenta si hubo RLHF, DPO u otra fase de alineamiento: no disponible. La v2 corrige tres problemas identificados en la v1: primero, la v1 usaba tokens delimitadores (`[INST_START]`, `[REPLY_END]`, `[SYSTEM_*]`, `[TOOL_RESULT_*]`) cuyos embeddings son marcadores no entrenados en el modelo base, idénticos al token no usado `<SPAN#5000>`; como el LoRA sobre atención no puede enseñar embeddings, la v2 emplea únicamente tokens que el modelo base sí entrenó. El repositorio incluye `placeholder_ids.json` con los 5.832 tokens marcador y una prueba unitaria que falla si el formato de chat usa alguno. Segundo, la v1 estaba desequilibrada: fuera del subconjunto de Tool-Use, aproximadamente el 98% de los turnos de entrenamiento eran llamadas a herramientas; la v2 mezcla chat plano, casos con herramientas presentes pero innecesarias e instrucciones del tipo "no uses herramientas". Tercero, el shim de servicio de la v1 usaba decodificación voraz (temperatura 0) y entraba en bucles; el de la v2 muestrea, fusiona llamadas duplicadas, limita el número de llamadas paralelas y evita que un turno continúe en boca del usuario.

## Capacidades

- Generación de texto conversacional en inglés, con formato de turnos multi-rol mediante plantilla de chat propia (`chat_template.jinja`).
- Razonamiento explícito en modo thinking: el modelo puede emitir un bloque `<think>...</think>` antes del contenido final.
- Tool calling y function calling en formato GLM, con argumentos estructurados mediante `<arg_key>` y `<arg_value>`.
- Decisión de respuesta: distingue entre tres comportamientos (llamada a herramienta, respuesta en texto o turno vacío), evaluada al 90% de acierto sobre turnos reales reservados de agente.
- Capacidad de no responder: un turno vacío se codifica como `</s>`, lo que permite al modelo abstenerse en lugar de inventar contenido.
- Decodificación limpiada: el repositorio incluye `alice_chat.py` con `clean_decode` y `parse_output` para separar razonamiento, contenido y llamadas a herramientas.
- Capacidades multilingües: limitadas a inglés según la model card y las etiquetas del repositorio.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre formato de chat en modelos encoder-decoder: el adaptador sirve como referencia reproducible de cómo dotar de interfaz conversacional a un modelo base sin plantilla, con el código de ajuste (`finetune_chat_lora.py`) y la lista de tokens marcador incluidos en el repositorio.
- Estudio de agente con decisión de silencio: escenarios donde el modelo debe decidir entre actuar, responder o callar; la métrica del 90% de selección correcta del tipo de respuesta permite medir ese comportamiento de forma aislada.
- Prototipado de function calling en pipelines internos: el formato GLM con `<tool_call>` y argumentos tipados se puede integrar con el shim OpenAI-compatible para exponer `/v1/chat/completions` con herramientas, sin reescribir el cliente.
- Generación de texto a texto de propósito general: al ser un encoder-decoder UL2, el modelo encaja en tareas de transformación entrada-salida (resumen, reescritura, extracción) donde el formato seq2seq es más natural que en un decoder-only.
- Evaluación comparativa de adaptadores: la existencia de la v1 y de la v2 con métricas de comportamiento declaradas permite estudiar el efecto del desequilibrio de datos y de los tokens no entrenados en un ajuste LoRA.
- Despliegue experimental en vLLM: mediante el plugin comunitario y el shim se puede levantar un endpoint compatible con OpenAI para pruebas de carga, streaming simulado y enrutado de herramientas en un entorno controlado.
- Cuantización y eficiencia: la variante NVFP4 de terceros permite estudiar el comportamiento del modelo en 4 bits sobre hardware con menos VRAM, útil para analizar la degradación de un MoE disperso tras cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta pruebas de comportamiento propias del autor, que se recogen a continuación.

| Prueba | Resultado |
|---|---|
| Sondas de comportamiento, v2 | 61% de acierto |
| Sondas de comportamiento, modelo base | 11% de acierto |
| Turnos reales reservados de agente: elección correcta del tipo de respuesta (herramienta, texto o nada) | 90% |
| Turnos en los que el modelo escribió un turno ajeno | 0 |
| Saludos bajo prompt de agente de código que generan tarea inventada y llamada a herramienta | 4 de 10 (fallo) |
| Respuesta tras un resultado de herramienta | 0 de 2 (repite la llamada en lugar de contestar) |

## Requisitos de hardware

- VRAM estimada en bf16: los pesos del modelo base ocupan aproximadamente 69 GB (34,35B parámetros × 2 bytes), a lo que hay que sumar activaciones y caché. Estimación orientativa, no publicada por el autor.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU de 48 GB o más. El adaptador en sí es de 0,0 GB y no añade requisitos apreciables.
- Aunque solo se activan ~0,6B parámetros por token, la VRAM necesaria depende del total de parámetros, porque todos los expertos deben residir en memoria. El bajo número de parámetros activos reduce el cómputo por token, no la huella de memoria.
- Cuantización NVFP4: la variante ProCreations/AliceAI-T5-35B-A0.6B-NVFP4 reduce la huella teórica a unos 17-20 GB, lo que la haría viable en tarjetas de 24 GB y 48 GB (RTX 4090, L40S). Estimación orientativa.
- Cabe en GPU de consumo: no en bf16. Solo con cuantización de 4 bits y sin que exista una ruta GGUF documentada publicada por el autor.
- Opciones de despliegue: transformers con peft en bf16 con `attn_implementation="eager"`; vLLM mediante el plugin comunitario AntonProkopyev/AliceAI-T5-35B-A0.6B-vLLM, que sirve únicamente `/v1/completions` y añade el marco UL2 por su cuenta; el script `alice_openai_shim.py` añade por delante `/v1/chat/completions` con herramientas, razonamiento y streaming simulado. No hay soporte documentado para llama.cpp, Ollama ni TGI.
- Muestreo obligatorio: se debe usar decodificación por muestreo (temperatura 0,6 y top_p 0,95 en el ejemplo del autor) con `max_new_tokens=512`; la decodificación voraz provocó bucles durante las pruebas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de chat de terceros comparables en la búsqueda realizada. La comparación se establece con el propio modelo base y con las variantes derivadas del mismo linaje, que son las únicas alternativas documentadas.

| Modelo | Parámetros | Activos | Tipo | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|---|
| kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2 | 34,35B (base) + LoRA r16 | ~0,6B | Adaptador LoRA PEFT | en | Apache 2.0 | 61% en sondas de comportamiento; 90% en elección de tipo de respuesta |
| yandex/AliceAI-T5-35B-A0.6B | 34,35B | ~0,6B | Modelo base MoE encoder-decoder | No especificado (producción en ruso e inglés en el buscador Yandex) | Apache 2.0 | 11% en las mismas sondas; sin plantilla de chat |
| kaivoss/AliceAI-T5-35B-A0.6B-chat-lora (v1) | 34,35B (base) + LoRA | ~0,6B | Adaptador LoRA PEFT | en | Apache 2.0 | Superado; generaba entre 17 y 22 llamadas paralelas ante un "hola" |
| kaivoss/AliceAI-T5-35B-A0.6B-chat-v2 | 34,35B | ~0,6B | Pesos fusionados en bf16 | en | Apache 2.0 | Mismo comportamiento que el adaptador v2, sin necesidad de cargar LoRA |
| ProCreations/AliceAI-T5-35B-A0.6B-NVFP4 | 34,35B | ~0,6B | Cuantización NVFP4 de terceros | No especificado | No disponible | Permite despliegue en 4 bits |

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor indica explícitamente que no debe dejarse funcionando sin supervisión.
- Falla en el escenario que motivó su desarrollo: bajo un prompt de agente de código, 4 de cada 10 saludos producen una tarea inventada y una llamada a herramienta.
- Tras recibir el resultado de una herramienta, el modelo repite la llamada en lugar de contestar (0 de 2 casos evaluados).
- Sobre-razona preguntas simples, emitiendo bloques `<think>` innecesarios.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con conversaciones largas.
- El LoRA no puede modificar los embeddings del modelo base: cualquier token marcador no entrenado en el base se comporta como un marcador vacío. Cualquier extensión del formato de chat debe verificar `placeholder_ids.json`.
- La decodificación voraz provoca bucles. Es obligatorio muestrear, lo que introduce no determinismo y complica la reproducibilidad de resultados.
- Sin validación comunitaria: 0 descargas y 0 me gusta en el momento de la consulta, y ningún benchmark independiente publicado.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: elevado en contextos de agente, según los fallos reportados por el propio autor (tareas inventadas a partir de un saludo).
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene revisar los términos del modelo base de Yandex por separado.
- El soporte de vLLM depende de un plugin comunitario que solo expone `/v1/completions`; el endpoint de chat es un shim externo con streaming simulado, no real.
- No hay ruta oficial a GGUF, Ollama ni llama.cpp, lo que limita el despliegue en entornos de consumo.

## Enlaces

- Adaptador LoRA v2: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Pesos fusionados en bf16: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v2
- Adaptador v1 (superado): https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora
- Cuantización NVFP4 de terceros: https://huggingface.co/ProCreations/AliceAI-T5-35B-A0.6B-NVFP4
- Ejemplo de ajuste fino: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2/blob/main/finetune_chat_lora.py
- Plantilla de chat: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2/blob/main/chat_template.jinja
- Utilidades de herramientas en formato GLM: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2/blob/main/glm_tools.py
- Decodificación y parseo: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2/blob/main/alice_chat.py
- Lista de tokens marcador: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2/blob/main/placeholder_ids.json
- Shim compatible con OpenAI: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2/blob/main/alice_openai_shim.py
- Plugin comunitario para vLLM: https://github.com/AntonProkopyev/AliceAI-T5-35B-A0.6B-vLLM
- Conjunto de datos de agente: https://huggingface.co/datasets/kaivoss/UltraData-SFT-Agent-2609-GLM53-20k
- Conjunto de datos UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Conjunto de datos smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2602.09003
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/aliceai-t5-35b-a0.6b-yandex
- Análisis del lanzamiento de Yandex: https://www.aimodeling.com/en/news/slug/yandex-aliceai-t5-sparse-moe
- Anuncio en X: https://x.com/HuggingModels/status/2098889393180385404
