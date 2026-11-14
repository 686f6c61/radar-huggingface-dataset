# 0x3/gemma-4-E4B-it-qat-Speakrail-181026

## Resumen

Speakrail Gemma 4 E4B (2026-10-18) es un adaptador LoRA publicado por el usuario 0x3 sobre el checkpoint cuantizado de Google `google/gemma-4-E4B-it-qat-w4a16-ct`. No es un modelo de chat convencional: es el componente de decisión de un sistema de voz full-duplex denominado Speakrail, que tras cada evento de entrada (palabras del usuario, solapamiento de habla, silencio) emite un unico token de decision entre 22 posibles (hablar, seguir escuchando, interrumpir, callar o decir unas palabras sin tomar el turno). Cuando decide hablar, genera la respuesta hablada, incluyendo llamadas a herramientas si procede.

El modelo se apoya en un cabezal de turn-taking (turn head) que detecta cuando el usuario ha terminado de hablar, y espera como entrada el texto tal y como lo produce el reconocimiento de voz en streaming de Voxtral. La receta es la misma que la del hermano mayor Speakrail Gemma 4 12B, pero sobre una base E4B con pesos int4, lo que permite que la pila completa (ASR + este modelo + TTS) quepa en una GPU de 16 GB manteniendo el contexto completo de 128k tokens.

Su relevancia es acotada pero clara: es la opcion de 16 GB del stack Speakrail, mas rapida hasta el primer audio que la variante de 12B, pero explicitamente mas debil en uso de herramientas y en benchmarks conversacionales. No funciona fuera del harness de Speakrail: depende de tokens de protocolo inexistentes en texto ordinario y de la salida concreta del ASR de Voxtral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B) con adaptador PEFT LoRA; 24 capas no compartidas en KV |
| Parametros totales | no disponible (base E4B; adaptador LoRA r32 de 133 MB) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (128k), verificado en la configuracion de 16 GB |
| Tipos de cuantizacion | Base QAT w4a16 (int4 en pesos, activaciones de 16 bits); adaptador en safetensors bf16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA: `adapter_model.safetensors`, `adapter_config.json`, `token_rows.safetensors`, tokenizer v1.2) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B en su variante QAT w4a16-ct, un transformer con atencion por capas y una tabla de embeddings adicional por capa (`embed_tokens_per_layer`), presente solo en las 24 capas no compartidas en KV de E4B. Sobre esta base se aplica un LoRA de rango 32 y alpha 64 que cubre todas las proyecciones de atencion y MLP. Ademas del adaptador, el autor publica 22 filas de embedding entrenadas (ids 6-27) en bf16, tanto en `embed_tokens` [22, 2560] (con el cabezal de salida atado) como en `embed_tokens_per_layer` [22, 10752]; estas filas codifican los tokens de decision del protocolo.

El entrenamiento se realizo sobre el mismo protocolo, prompts y herramientas que la version de 12B, con el tokenizer v1.2 (Gemma 4 mas los 22 tokens) byte a byte identico. El contexto se modela como un flujo de tokens donde el harness inserta eventos (palabras del usuario, marcador `<complete>` del turn head, solapamientos, marcadores de silencio como `<sil:4s>`) y solicita una decision en cada uno; las decisiones se restringen al conjunto permitido durante la decodificacion. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decision de turn-taking full-duplex: emite un unico token entre 22 posibles tras cada evento de entrada (hablar, seguir escuchando, interrumpir, callar, decir unas palabras sin tomar el turno).
- Generacion de respuesta hablada cuando decide hablar, en texto listo para enviar al TTS.
- Uso de herramientas (tool calls) integrado en la respuesta hablada, aunque mas debil que en la version de 12B.
- Deteccion de fin de turno del usuario mediante el cabezal de turn-taking externo.
- Gestion de solapamientos: decide entre `<continue>`, `<yield>` y `<listen>` cuando el usuario habla mientras el asistente habla.
- Gestion de silencios: responde `<listen>` ante periodos sin habla.
- Integracion con reconocimiento de voz en streaming (Voxtral Mini 4B Realtime) como fuente de entrada.
- Capacidades multilingues: solo ingles.
- No soporta vision ni audio de forma nativa en esta configuracion: el despliegue recomendado limita `image` y `audio` a 0 por prompt.

## Casos de uso

- Asistente de voz telefonico en tiempo real: el modelo decide en cada evento si debe hablar, esperar o interrumpir, lo que permite conversaciones naturales con solapamientos y pausas, usando el contexto de 128k para retener el historial completo de la llamada.
- Agente de atencion al cliente con barge-in: cuando el usuario interrumpe, el modelo elige `<yield>` o `<continue>` segun el protocolo, evitando que el asistente hable encima del cliente.
- Recepcionista virtual en hardware de 16 GB: al mantener la tabla de embeddings por capa en CPU pinned, la pila completa (ASR + modelo + TTS) cabe en una sola GPU de 16 GB, lo que abarata el despliegue en sedes o edge.
- Reserva de citas y consulta de datos con tool calling: el modelo emite llamadas a herramientas dentro de la respuesta hablada, integrable con backends de agenda o CRM, aceptando la menor fiabilidad en tool use respecto al 12B.
- Sistemas de voz con latencia critica: al ser mas rapido hasta el primer audio que el 12B, encaja en flujos donde el tiempo de respuesta inicial es el factor limitante.
- Investigacion en turn-taking full-duplex: sirve como referencia reproducible para estudiar decisiones de turno basadas en tokens y comparar el comportamiento E4B frente al 12B con el mismo protocolo y tokenizer.
- Prototipado de asistentes conversacionales en ingles sobre vLLM: el despliegue documentado con `--enable-lora`, prefix caching y limites de secuencia permite levantar un entorno de pruebas con una sola GPU de 24 GB compartida con TTS y ASR.

## Benchmarks y rendimiento

El autor indica que las cifras se midieron en una RTX 4090 con el sistema Speakrail completo (Voxtral Mini 4B Realtime + turn head + este modelo), pero la model card proporcionada se interrumpe antes de incluir la tabla de resultados. No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Este modelo | Speakrail 12B | Notas |
|---|---|---|---|
| Tool use | no disponible (inferior al 12B segun el autor) | no disponible | Sin cifras en la informacion disponible |
| Benchmarks conversacionales | no disponible (inferior al 12B segun el autor) | no disponible | Sin cifras en la informacion disponible |

## Requisitos de hardware

- VRAM estimada: 9,4 GiB de pesos en GPU en configuracion estandar (frente a 8,5 GiB del 12B, por la tabla bf16 por capa); con la tabla de embeddings por capa (5,6 GB) en CPU pinned, baja a 4,1 GiB.
- GPU de 24 GB: configuracion probada con `--gpu-memory-utilization 0.44` junto a Breeze TTS 2 y el reconocedor; a 0,49 se produjo OOM bajo carga.
- GPU de 16 GB: una secuencia (`--max-num-seqs 1`) con `--gpu-memory-utilization 0.31` mantiene el contexto completo de 131.072 tokens, con la tabla por capa en CPU pinned y lectura zero-copy por PCIe.
- GPU consumer: cabe en RTX 4090 (24 GB) y en tarjetas de 16 GB con el truco de offload manual; no se documentan pruebas en GPUs de 8-12 GB.
- Despliegue: vLLM 0.26 probado, con `--enable-lora --max-lora-rank 32 --max-loras 1`, prefix caching y `--generation-config vllm`; el setup Docker de Speakrail aun no instala E4B y requiere parchear las filas a mano.
- Latencia y throughput: no disponibles cifras concretas; el autor afirma que es mas rapido hasta el primer audio que el 12B y que el offload de la tabla no introduce coste de latencia medible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool use | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Speakrail Gemma 4 E4B (este) | Base E4B + LoRA r32 (133 MB) | 128k | Inferior al 12B | apache-2.0 | Hugging Face (adaptador y filas) |
| Speakrail Gemma 4 12B | Base 12B + LoRA r32 (251 MB) | 128k | Mejor que E4B | apache-2.0 | Hugging Face |
| Gemma 4 E4B QAT (base) | E4B, int4 | 128k | Generico, sin protocolo | no disponible en la informacion | Hugging Face (Google) |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas variantes.

## Limitaciones y advertencias

- No funciona fuera del harness de Speakrail: espera tokens de protocolo (ids 6-27 y `<turn|>` id 106) que el texto ordinario no produce, y esta ajustado a la salida del ASR en streaming de Voxtral.
- Solo ingles; no se documenta soporte multilingue.
- Menor fiabilidad en uso de herramientas y en benchmarks conversacionales que la version de 12B; el autor lo describe como opcion de 16 GB, no como sustituto.
- Riesgo de alucinacion en las respuestas habladas y en las llamadas a herramientas no cuantificado en la informacion disponible.
- El setup Docker oficial no soporta E4B todavia: hay que parchear las filas de embedding manualmente y usar un loader hook no publicado para el offload en GPUs de 16 GB.
- Los pesos base de Google no se incluyen en el repositorio; solo el adaptador y las filas, por lo que la licencia apache-2.0 del adaptador no exime de cumplir la licencia del checkpoint base.
- El consumo de VRAM es mayor que el del 12B en configuracion estandar (9,4 frente a 8,5 GiB), lo que obliga a ajustar `gpu-memory-utilization` con cuidado.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/0x3/gemma-4-E4B-it-qat-Speakrail-181026
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Hermano mayor 12B: https://huggingface.co/speakrail/gemma-4-12B-it-qat-Speakrail
- Documentacion de tokens y conjuntos de decision (card del 12B): https://huggingface.co/speakrail/gemma-4-12B-it-qat-Speakrail#tokens
