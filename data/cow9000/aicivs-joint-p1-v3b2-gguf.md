# cow9000/aicivs-joint-p1-v3b2-gguf

## Resumen

aicivs-joint-p1-v3b2-gguf es un ajuste fino del modelo openbmb/MiniCPM5-2B (2.516.756.480 parametros, ~2,5 B) publicado por el usuario cow9000 para dar soporte a los PNJ del mod de Minecraft *AICivs*, en el que las aldeas funcionan como civilizaciones vivas con personalidades, recuerdos, relaciones, misiones, guerras y sucesiones. No es un modelo conversacional de proposito general: responde a nueve operaciones de un contrato de servicio, cada una con un esquema JSON fijo, y esta entrenado con el modo de razonamiento (thinking) desactivado.

El entrenamiento se hizo mediante destilacion de prompts: un mundo de 12 civilizaciones simulado sin grafismo durante 120 temporadas genero almas, recuerdos, cronicas y manifiestos; un modelo profesor (la model card cita Qwen3.8-27B) respondio a prompts largos y cargados de reglas, y las respuestas se filtraron con el validador del servicio y las capas de juicio del mod antes de convertirse en objetivos de entrenamiento. El ajuste se aplico con LoRA r64 y los pesos se fusionaron y cuantizaron a GGUF Q4_K_M (~1,6 GB).

Esta build concreta esta pensada para las capas estructuradas y de autoria del mod, donde se necesita la gramatica de llama.cpp para imponer los patrones regex del contrato. El autor reporta 16/16 en validacion de esquema, 15/16 frente al validador y 14/16 respuestas limpias en la generacion de misiones, con una latencia p50 de 2,1 s en una RTX 3090 Ti sirviendo cuatro slots de 8k. Su relevancia es de nicho: es un ejemplo de modelo pequeno especializado en salida estructurada con restricciones de mundo, no una alternativa a modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; derivada de openbmb/MiniCPM5-2B. El archivo GGUF declara arquitectura `llama` |
| Parametros totales | 2.516.756.480 (~2,5 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | 32.768 tokens en la configuracion recomendada (`-c 32768 -np 4`, cuatro slots de 8k); los prompts de misiones e historia llegan hasta ~5.500 tokens |
| Tipos de cuantizacion | Q4_K_M de llama.cpp en este repositorio. El autor menciona un build W4A16 separado para vLLM |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`model-q4_k_m.gguf`), pesos fusionados tras el LoRA r64 |
| Tamano del repositorio | 1,6 GB |
| Modelo base | openbmb/MiniCPM5-2B |
| Pipeline | text-generation |
| Fecha de publicacion | 11 de septiembre de 2026 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del modelo base, openbmb/MiniCPM5-2B; la etiqueta de arquitectura del GGUF es `llama`. El ajuste se realizo con LoRA de rango 64 sobre el modelo base, y los pesos resultantes se fusionaron antes de cuantizar a Q4_K_M. El autor describe dos builds del mismo "estudiante": esta GGUF para llama.cpp y una W4A16 para vLLM, mas rapida para las operaciones de dialogo y cotilleo.

El procedimiento de entrenamiento es destilacion de prompts. Un mundo de 12 civilizaciones se simulo de forma headless durante 120 temporadas para producir almas, recuerdos, cronicas y manifiestos; un modelo profesor (citado en la model card como Qwen3.8-27B) genero respuestas a prompts largos y muy cargados de reglas, incluyendo un jugador controlado por el profesor para conversaciones multiturno con lineas sin sentido, porque los jugadores reales tampoco son coherentes. Esas respuestas pasaron por el validador del servicio y por las capas de juicio del mod (viabilidad, autoridad, faccion, economia y narrativa) y solo entonces se convirtieron en objetivos. No se publican el numero total de tokens de entrenamiento ni la composicion del dataset, y no se menciona RLHF ni DPO. El modelo se entreno con thinking desactivado, y en inferencia se debe enviar `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generacion de texto restringida a contrato: nueve operaciones, cada una con un esquema JSON fijo (AICivs contract 1.0, prompt version 1).
- `dialogue.respond`: replica en personaje con habla, intencion del jugador, deltas de relacion (confianza, afecto, respeto, miedo), estado de animo posterior, acciones disponibles (ofrecer trabajo, comerciar, revelar un secreto, derivar, terminar la conversacion) y una memoria que conservar.
- `gossip.render`: repeticion de un rumor degradado segun el numero de saltos que ha viajado.
- `quest.generate`: generacion de misiones a partir de un manifiesto de referentes reales, con tipos de nodo (acquire, deliver, travel, kill, escort, interact, build, defend, learn, gift, wait), motivaciones, seis lineas de dialogo, recompensa dentro de presupuesto y enlaces a la cronica.
- `quest.repair`: correccion de una mision existente contra una lista de errores de validacion, enumerando los cambios aplicados.
- `npc.personality`: rasgos, registro de habla, motivaciones, peculiaridades y una linea de voz para lotes de aldeanos nuevos.
- `npc.memory.consolidate`: plegado de recuerdos episodicos sobre un jugador en creencias, con fuentes e identificadores de recuerdos retirados.
- `civ.event.narrate`: relato de cronica de un evento de simulacion a partir de hechos calculados, con versiones por faccion, inyecciones de memoria y cambios de animo.
- `civ.chronicle.summarize` y `civ.history.author`: resumen de decadas, eras o leyendas de la cronica de una civilizacion, y redaccion de su historia fundacional (eras, eventos, figuras, dinastias y edificios).
- Salida estructurada forzada por gramatica: los patrones regex del contrato se imponen con la gramatica de llama.cpp en esta build.
- Idioma: unicamente ingles.
- No dispone de capacidades de vision, audio, tool calling generico, agentes ni razonamiento multi-paso mas alla del esquema de cada operacion.

## Casos de uso

- Dialogo de PNJ en *AICivs*: el servicio renderiza un system prompt con el nombre del hablante, sus rasgos, su animo y su actitud hacia el jugador, y el modelo devuelve habla, intencion detectada, acciones y deltas relacionales. El presupuesto de latencia de esta operacion es de 1,5 s, por lo que encaja en el bucle de conversacion del juego.
- Generacion de misiones ancladas al mundo: a partir de un manifiesto de nodos y referentes reales, el modelo produce una mision con recompensa acotada y seis lineas de dialogo. El presupuesto es de 8 s y la build reporta 14/16 misiones limpias, lo que hace viable generar contenido bajo demanda con reparacion posterior.
- Reparacion de misiones invalidas: cuando el validador del servicio rechaza una mision, `quest.repair` la corrige contra la lista de errores y devuelve los cambios aplicados, con un presupuesto de 5 s. Es util para elevar el porcentaje de misiones limpias sin intervencion manual.
- Memoria persistente de PNJ: `npc.memory.consolidate` pliega recuerdos episodicos sobre un jugador en creencias con fuentes y retira los identificadores ya consolidados, lo que evita que la memoria del aldeano crezca sin limite entre sesiones.
- Narracion de eventos de civilizacion: `civ.event.narrate` convierte los hechos calculados por el simulador en un relato de cronica, con versiones alternativas por faccion y desplazamientos de animo, con un presupuesto de 15 s por evento.
- Resumen de cronicas largas: `civ.chronicle.summarize` produce resumenes de decada, era o leyenda a partir de la cronica completa de una civilizacion en un presupuesto de 60 s, apropiado para ejecucion en segundo plano.
- Generacion de historia fundacional: `civ.history.author` redacta la historia de fundacion de una civilizacion (eras, eventos, figuras, dinastias y edificios) con un presupuesto de 300 s; es una tarea de autoria previa a la partida o de mantenimiento, no interactiva.
- Personalidades por lotes: `npc.personality` genera rasgos, registro de habla y linea de voz para varios aldeanos nuevos a la vez en 5 s, lo que permite poblar una aldea entera sin coste de autoria manual.
- Sistemas de PNJ estructurados fuera de *AICivs*: la misma aproximacion (esquema fijo, gramatica forzada, validacion de referencias contra un manifiesto) es reutilizable en otros juegos o simuladores con presupuesto de VRAM reducido, siempre que se reescriban los prompts con el formato del servicio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos de rendimiento son los del propio autor para la generacion de misiones con esta build:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Esquema valido | 16/16 | Build Q4_K_M, llama.cpp, RTX 3090 Ti, cuatro slots de 8k (`-c 32768 -np 4`) |
| Validacion del servicio | 15/16 | Mismas condiciones |
| Respuestas limpias | 14/16 | Mismas condiciones |
| Latencia p50 (misiones) | 2,1 s | Mismas condiciones |

Presupuestos de latencia definidos por el contrato del servicio, por operacion:

| Operacion | Presupuesto |
|---|---|
| `dialogue.respond` | 1,5 s |
| `gossip.render` | 1 s |
| `quest.generate` | 8 s |
| `quest.repair` | 5 s |
| `npc.personality` | 5 s |
| `npc.memory.consolidate` | 10 s |
| `civ.event.narrate` | 15 s |
| `civ.chronicle.summarize` | 60 s |
| `civ.history.author` | 300 s |

El tamano exacto del conjunto de evaluacion de misiones no se especifica mas alla de los denominadores indicados.

## Requisitos de hardware

- VRAM estimada: ~3 GB con la configuracion recomendada de 32.768 tokens de contexto repartidos en cuatro slots, `-ngl 99` y Flash Attention activada.
- Tamano en disco: el fichero `model-q4_k_m.gguf` ocupa aproximadamente 1,6 GB, el mismo tamano que el repositorio.
- GPU recomendadas: la unica medicion publicada es en una RTX 3090 Ti. Dado el consumo de ~3 GB, cabe con margen amplio en GPU de consumo; no se han publicado mediciones en A100, H100, RTX 4090 ni otras tarjetas.
- Cabe en GPU de consumo: si, segun la cifra de ~3 GB reportada por el autor.
- Opciones de despliegue: llama.cpp server mediante la imagen `ghcr.io/ggml-org/llama.cpp:server-cuda-b10236` (comando de ejemplo publicado por el autor con `--alias aicivs-joint-p1-v3b2 -m /models/student/model-q4_k_m.gguf -c 32768 -np 4 -ngl 99 -fa on`). Para las operaciones de dialogo y cotilleo, el autor recomienda el build W4A16 sobre vLLM por ser mas rapido.
- API: chat completions de estilo OpenAI con `response_format: {"type": "json_schema", ...}` portando el esquema de la operacion, y `chat_template_kwargs: {"enable_thinking": false}`. Temperatura 0.8 para dialogo y cotilleo, 0.6 para las operaciones estructuradas.
- Latencia y throughput: p50 de 2,1 s en la generacion de misiones sobre RTX 3090 Ti con cuatro slots de 8k. No se publican cifras de tokens por segundo ni de throughput agregado.
- Requisitos del lado del servicio: hay que acotar los limites numericos a mano (las gramaticas de vLLM ignoran `minimum`/`maximum`, de modo que un valor como `-1.1` de valence debe recortarse, no rechazarse) y validar todas las referencias de la respuesta contra el manifiesto de la peticion, con reparacion o fallback del juego cuando fallan.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos de terceros comparables en la misma categoria (PNJ estructurados para videojuegos con contrato JSON fijo). La comparacion se limita al modelo base y al build hermano del mismo estudiante:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| aicivs-joint-p1-v3b2-gguf (Q4_K_M) | ~2,5 B | 32.768 tokens (cuatro slots de 8k) | apache-2.0 | GGUF, llama.cpp | 14/16 misiones limpias, p50 2,1 s en RTX 3090 Ti |
| aicivs-joint-p1-v3b2 W4A16 | ~2,5 B (mismo estudiante ajustado) | no disponible | no disponible | vLLM, segun el autor | no disponible; descrito como mas rapido para dialogo y cotilleo |
| openbmb/MiniCPM5-2B (modelo base) | ~2,5 B | no disponible | no disponible | HuggingFace | no disponible; no esta ajustado al contrato de AICivs |

## Limitaciones y advertencias

- No es un modelo de chat general. Espera los prompts renderizados del servicio (un system prompt corto que nombra al hablante y un turno de usuario con el contexto y las acciones permitidas) y responde en el JSON del contrato. Fuera de ese encuadre sigue respondiendo, pero ninguna de las reglas de anclaje al mundo se aplica.
- Idioma unico: solo ingles. No hay soporte multilingue declarado.
- Dependencia de la pila de servicio: la build GGUF necesita la gramatica de llama.cpp para imponer los patrones regex del contrato; sin ella, la conformidad con el esquema no esta garantizada.
- Validacion obligatoria en el lado del servidor: los limites numericos deben acotarse manualmente y todas las referencias (personas, lugares, objetos, eventos) deben comprobarse contra el manifiesto de la peticion, porque el modelo puede emitir identificadores no listados. El propio system prompt le instruye a no mencionar entidades ausentes y a usar los identificadores exactos.
- Razonamiento desactivado: el modelo se entreno con thinking off y hay que servir con `enable_thinking: false`; activarlo no forma parte del uso previsto.
- Alucinacion: el diseno asume que existe riesgo de referencias invalidas o valores fuera de rango, de ahi la validacion y la reparacion con fallback. No se publican tasas de alucinacion mas alla de las 14/16 misiones limpias.
- Sesgos: no se documenta ningun analisis de sesgos. Los sesgos del modelo base y los del modelo profesor (citado como Qwen3.8-27B) pueden propagarse, y los datos de entrenamiento provienen de una simulacion sintetica de 12 civilizaciones durante 120 temporadas, no de datos humanos reales.
- Volumen de validacion externa nulo: 0 descargas y 0 likes en el momento de la consulta, sin evaluacion independiente publicada.
- Precision: no se publican resultados de benchmarks estandar, por lo que no hay comparacion objetiva con otros modelos del mismo tamano.
- Licencia: apache-2.0, que permite uso comercial con las obligaciones habituales de la licencia (conservar avisos de copyright y de licencia y senalar los cambios). Conviene revisar tambien las condiciones del modelo base openbmb/MiniCPM5-2B.
- Produccion: el modelo esta atado a la version 1.0 del contrato y a la version 1 del prompt; cualquier cambio en los esquemas o en los prompts renderizados invalida el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cow9000/aicivs-joint-p1-v3b2-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Documentacion de ajuste fino citada por el autor, en el repositorio del mod: `docs/08-finetuning.md` (no se proporciona URL directa)
- Contrato del servicio citado por el autor: `service/aicivs_service/contract/` (modelos pydantic, sin URL directa)
- Script de despliegue citado por el autor: `ops/aicivs-up.sh` en el repositorio del mod (sin URL directa)
- Imagen de servidor de llama.cpp usada en el ejemplo: `ghcr.io/ggml-org/llama.cpp:server-cuda-b10236`
- Busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a portales de noticias griegos y no guardan relacion con esta ficha.
