# sadmN/moshi-base7b-rag

## Resumen

PersonaPlex 7B RAG es un ajuste fino del modelo base `nvidia/personaplex-7b-v1`, un modelo de lenguaje de voz full-duplex de 32 capas y 8.370 millones de parametros. Lo publica el usuario sadmN en Hugging Face y su proposito es convertir el modelo base en un asistente de voz conversacional aumentado por recuperacion (RAG): las respuestas factuales se fundamentan en un pasaje recuperado que se inyecta en la pausa que el modelo ya genera antes de responder, sin anadir silencio extra ni frames adicionales.

El ajuste se realizo con LoRA (r=64, alpha=128) sobre 128 matrices durante 1500 pasos, con una receta RAG concreta (`ref_mode=text`, `ref_pos=pause`, K=16, `lookup_weight=6`) fusionada en el checkpoint. El depformer y el codificador Mimi se mantuvieron congelados. El vocabulario de texto se amplia con tres tokens especiales: `<ref_start>` (32000), `<ref_end>` (32001) y `<lookup>` (32002), lo que deja la matriz de embeddings de texto en 32004 filas.

El modelo resuelve un problema concreto: la alucinacion en asistentes de voz en tiempo real con conocimiento limitado. En lugar de generar respuestas de memoria, el servidor recupera un pasaje (indice denso local o busqueda web via Tavily) y lo escribe como una tarjeta de 16 tokens en la pausa del modelo, que luego "lee" esa tarjeta al responder. Es relevante porque demuestra un mecanismo de grounding a nivel de frame en un modelo de voz full-duplex, aunque con limitaciones importantes documentadas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 32 capas (LMModel de PersonaPlex), full-duplex speech-to-speech con depformer y codec Mimi |
| Parametros totales | 8.370 millones (8,37 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera por frames de 80 ms; la tarjeta RAG ocupa 16 frames) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `student.pt` (PyTorch, bf16, 16,7 GB) con `LMModel` completo y metadatos; tokenizer SentencePiece (`tokenizer.model`, 32003 ids) |

## Arquitectura y entrenamiento

El modelo parte de PersonaPlex 7B, un transformer de 32 capas con dimension 4096 que procesa audio de usuario y de modelo como codigos de Mimi, junto con una fila de texto (`codes[0]` es texto, `codes[1:9]` audio de usuario, `codes[9:17]` audio del modelo; `emb[i] = codes[i-1]`). El ajuste fino aplica LoRA (r=64, alpha=128) sobre 128 matrices durante 1500 pasos con una receta RAG que inyecta una tarjeta de texto de 16 tokens en la pausa previa a la respuesta. La fusion del adaptador LoRA en el checkpoint es definitiva y el depformer y Mimi quedan congelados.

La innovacion clave es el mecanismo de inyeccion: durante el entrenamiento se escribe `<lookup>` en la posicion `body-K-1` y los K tokens de la tarjeta en los frames anteriores al cuerpo de la respuesta. En inferencia, el servidor debe reproducir exactamente ese contrato de layout: primero el frame con `<lookup>`, luego un token de tarjeta por frame. El autor reporta que en el step 1500 la entropia cruzada del texto del cuerpo es 0,634 con referencia frente a 0,872 sin ella, y una tasa de acierto de lookup de 0,856. No se detalla la composicion del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Conversacion de voz full-duplex en tiempo real: entrada y salida de audio simultaneas con frames de 80 ms.
- Respuestas fundamentadas en pasajes recuperados (grounding) mediante tarjeta de texto de 16 tokens.
- Recuperacion hibrida: indice denso local (4998 pasajes con embeddings MiniLM) y busqueda web opcional via Tavily.
- Deteccion de actividad de voz (VAD) y transcripcion (STT) integradas en el pipeline del servidor.
- Seleccion de voz mediante prompts de voz (`voice_prompt=NATF0.pt`).
- Servidor web con interfaz de microfono y cliente WebSocket headless.
- No soporta tool calling ni function calling de forma nativa segun la informacion disponible.
- No se documentan capacidades multilingues ni modos de razonamiento extendido.

## Casos de uso

- Atencion al cliente por voz en tiempo real: el modelo mantiene conversaciones full-duplex y puede fundamentar respuestas en una base de conocimiento local (4998 pasajes) inyectada como tarjeta, reduciendo alucinaciones en consultas factuales.
- Asistente de voz con conocimiento actualizado: la busqueda web via Tavily permite responder sobre hechos recientes, aceptando una latencia de 0,5-3 s que se absorbe en la pausa natural del modelo.
- Kiosco o terminal de informacion interactiva: con `serve_base7b.sh` y la interfaz web en el puerto 8998, se puede desplegar un punto de consulta por voz con seleccion de voz y recuperacion local.
- Prototipado de investigacion en speech-to-speech con RAG: el repositorio incluye scripts de entorno, descarga y servidor, lo que facilita reproducir el pipeline y experimentar con la receta de inyeccion.
- Integracion en pipelines de agentes de voz: el cliente WebSocket (`ws_client_test2.py`) permite conduccion headless desde otros sistemas, util para automatizar pruebas o encadenar turnos.
- Evaluacion de mecanismos de grounding a nivel de frame: el contrato de layout documentado permite retrenar variantes (por ejemplo, tarjetas mas largas) y medir su efecto en la precision de lectura.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Entropia cruzada del texto del cuerpo (step 1500, con referencia) | 0,634 |
| Entropia cruzada del texto del cuerpo (sin referencia) | 0,872 |
| Tasa de acierto de lookup | 0,856 |
| VRAM en carga (A100-SXM4-80GB) | ~21 GB |
| Latencia por frame de 80 ms | 25-40 ms (tiempo real) |
| Latencia de recuperacion local (tarjeta) | ~0,2-0,5 s |
| Latencia de busqueda web (Tavily) | 0,5-3 s |
| Coste del cross-encoder opcional | ~1,3 s por consulta |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~21 GB en carga con bf16 en A100-SXM4-80GB; no se documentan requisitos para cuantizaciones menores.
- GPU recomendadas: A100-SXM4-80GB segun las mediciones del autor; no se detallan otras GPU probadas.
- Cabe en GPU de consumo: no disponible (21 GB en bf16 supera la VRAM de la mayoria de GPU consumer; no se documenta una version cuantizada).
- Opciones de despliegue: servidor propio incluido en `moshi_base7b_server.zip` (libreria `moshi==0.2.13`, torch 2.8.0/cu128), con scripts `setup_env.sh`, `download_assets.sh` y `serve_base7b.sh`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 25-40 ms por frame de 80 ms en A100, lo que permite operar en tiempo real; la latencia total del turno depende de la recuperacion (0,2-0,5 s local, 0,5-3 s web) y del parametro `WEB_WAIT_FRAMES=40` (3,2 s maximos de espera).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PersonaPlex 7B RAG (este) | 8,37 B | no disponible (frames de 80 ms) | Speech-to-speech full-duplex con RAG por tarjeta de 16 tokens | no disponible | Hugging Face (repo de 16,8 GB) |
| nvidia/personaplex-7b-v1 (base) | 8,37 B | no disponible | Speech-to-speech full-duplex sin RAG | gated (requiere aceptar licencia) | Hugging Face (gated) |
| MoshiRAG | no disponible | no disponible | Framework modular full-duplex con recuperacion asincrona | no disponible | Referencia en emergentmind.com |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La tarjeta RAG esta limitada a 16 tokens: respuestas que requieren un parrafo agotan el material tras la primera frase y el modelo empieza a eludir ("I don't see that in the material available to me").
- El checkpoint no emite `<lookup>` por si mismo (medido: 500/500 frames de pad); sin `--force-card` en el servidor el modelo permanece mudo.
- Tiende a cerrar la conversacion con despedidas ("Thanks for chatting / see you next time") y a recurrir a relleno ("that's an interesting topic"), un problema de datos/condicionamiento que requiere reentrenamiento.
- La variante "bag carrier" (k=4 tokens por frame) no se incluye porque su precision de lectura es 0,591 y se degrada tras unas dos frases.
- Necesita los pesos base gated (`nvidia/personaplex-7b-v1`) para Mimi, el tokenizer y los prompts de voz; el repositorio solo incluye el tronco ajustado.
- No se documentan sesgos conocidos, idiomas soportados ni restricciones de licencia para uso comercial (licencia "no disponible").
- Riesgo de alucinacion mitigado pero no eliminado: el grounding depende de la calidad de la recuperacion y de la ventana de 16 tokens seleccionada.
- El contexto no esta expresado en tokens de texto convencionales, sino en frames de audio de 80 ms, lo que complica la comparacion con modelos de texto.

## Enlaces

- Hugging Face: https://huggingface.co/sadmN/moshi-base7b-rag
- Modelo base: https://huggingface.co/nvidia/personaplex-7b-v1
- Referencia MoshiRAG: https://www.emergentmind.com/topics/moshirag
