# jmc0/Rein-NPC-4B

## Resumen

Rein-NPC-4B es un ajuste fino del modelo conversacional Qwen3.5-4B desarrollado por el usuario jmc0, pensado para un caso de uso muy concreto: dotar a un personaje no jugador (NPC) de un videojuego o de un agente conversacional de la capacidad de tomar decisiones tipadas (si conviene invocar una herramienta, si el personaje esta siendo presionado para cambiar su identidad, si un hecho del mundo esta bajo ataque, etc.) en el mismo forward pass que genera su dialogo. La innovacion central es que no anade un segundo modelo ni un segundo servidor: incorpora 64 tokens especiales nuevos cuyas filas de embedding son los unicos parametros entrenados, mientras que todos los pesos originales de Qwen3.5-4B permanecen identicos bit a bit.

El modelo conserva intactas las capacidades de chat, razonamiento y modo thinking de Qwen3.5-4B, y anade una via de decision que se lee como una distribucion sobre las letras de las opciones de una regla formulada en texto. Segun la model card, sobre 28.433 preguntas de test acerca de reglas nunca vistas en entrenamiento, Rein-NPC-4B acierta el 95,8%, frente al 97,3% de Rein-r1-4B (la variante de dos modelos), el 84,6% de Kev-4B (un modelo de decision generico del mismo tamano) y el 37,3% de Qwen3.5-4B sin entrenar leyendo el mismo formato.

El checkpoint tiene 5.295.564.288 parametros reales en safetensors (el nombre comercial dice 4B, pero el recuento efectivo ronda los 5,3 millardos), un repositorio de 10,6 GB y licencia Apache 2.0. Esta pensado para integrarse en runtimes ya existentes (Transformers, vLLM, SGLang, llama.cpp, MLX) sin cambiar el codigo de chat, y para que el juego actue sobre la decision con mecanismos que ya tiene: un tool call pre-rellenado, un token prohibido o un recordatorio en el turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), con 64 tokens especiales de decision anadidos |
| Parametros totales | 5.295.564.288 (segun safetensors); 64 x 2.560 numeros entrenados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-4B; no se especifica en la informacion) |
| Tipos de cuantizacion | bf16 en el repo principal; GGUF disponible en `jmc0/Rein-NPC-4B-GGUF` (se menciona Q4_K_M) |
| Idiomas soportados | en, pt, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); GGUF en repo separado para llama.cpp |

## Arquitectura y entrenamiento

El modelo parte del checkpoint post-entrenado de chat de Qwen3.5-4B y le anade 64 tokens especiales `<|rein_0|>` a `<|rein_63|>`, con ids 248077 a 248140, alojados en filas de la tabla de embeddings que Qwen3.5 deja libres (el vocabulario termina en 248.077 y la tabla tiene 248.320 filas). Solo esas 64 filas de embedding (64 x 2.560 numeros) se entrenan; el resto de tensores del backbone son identicos al original. Para evitar que las filas entrenadas se conviertan en tokens muestreables por el chat, el modelo guarda una copia de la tabla de embeddings del base como `lm_head.weight` con `tie_word_embeddings: false`, de modo que los logits de siguiente token del dialogo siguen siendo exactamente los de Qwen en cada posicion. Esa copia cuesta 1,27 GB en bf16 y 358 MB en Q4_K_M.

El protocolo de decision se define en `rein_soft.json`: ids de los tokens soft, capa de lectura (la 32, la ultima) y temperatura 0.812. Una decision es un prompt en el formato de Rein compuesto por un estado (persona y escena en texto plano, mas la conversacion en el marcado de turnos de Qwen) y una fila por regla (48 tokens frontales, la pregunta de la regla, sus opciones tras letras, 16 tokens finales y la marca de respuesta). La respuesta se lee como la distribucion de siguiente token sobre las letras de las opciones, renormalizada a temperatura 0.812. No se genera texto en la decision: es una posicion de token mas leida de los logits, con una pasada de prefijo sobre la conversacion y una fila de unos 100 tokens por regla, compartiendo la cache KV entre reglas. El tokenizer es el de Qwen3.5 con los 64 tokens anadidos como especiales, y `chat_template.jinja` es el original de Qwen3.5.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset `jmc0/rein-decisions` ni si se emplearon RLHF o DPO. La model card menciona el dataset y el formato de reglas tipadas, pero no cuantifica el corpus.

## Capacidades

- Generacion de texto conversacional con la misma calidad y estilo que Qwen3.5-4B, incluido el modo thinking.
- Decisiones tipadas: dada una regla con opciones (por ejemplo, que herramienta invocar), devuelve una probabilidad calibrada sobre cada opcion.
- Tool calling / function calling: la decision puede indicar que herramienta invocar y con que argumentos, con la garantia de que la llamada se hace en el mismo forward pass que el dialogo.
- Soporte de agentes y razonamiento multi-paso: cada turno puede evaluar varias reglas (una fila por regla) compartiendo la cache KV de la conversacion.
- Deteccion de presion sobre la identidad del personaje (cambio de nombre) y de ataques a hechos del mundo.
- Deteccion de narracion de accion frente a llamada explicita (para evitar que el personaje "narre" una llamada a herramienta en lugar de ejecutarla).
- Capacidades multilingues: ingles, portugues y multilingue segun los metadatos; el resto de idiomas depende del backbone Qwen3.5-4B.
- Integracion con runtimes existentes sin servidor adicional: Transformers, vLLM, SGLang, llama.cpp y MLX.
- En llama.cpp, el mismo `llama-server` sirve el chat por `/v1/chat/completions` y las decisiones por `/completion` con `n_probs`.

## Casos de uso

- NPC de videojuego con reglas de comportamiento: el motor del juego define reglas como "no revelar el secreto" o "no hablar de politica real"; Rein-NPC evalua cada turno del jugador y el juego aplica la decision prohibiendo tokens o inyectando un recordatorio, sin necesidad de un segundo modelo.
- Atencion al cliente con herramientas: el agente decide si el ultimo mensaje del usuario requiere `check_table_availability`, `process_reservation` o `enforce_seating_rules`, y el runtime pre-rellena la llamada correspondiente; el ejemplo de la model card (Elena Vance, host de The Gilded Spoon) es directamente replicable.
- Roleplay persistente con guardarrailes: mantener la persona y los hechos del mundo a lo largo de conversaciones largas, detectando cuando el jugador intenta reescribir la identidad del personaje o un hecho establecido.
- Agentes de soporte tecnico con enrutado de herramientas: decidir en cada turno si hace falta consultar un sistema externo, escalar a un humano o responder solo con dialogo, con una probabilidad calibrada que permite fijar umbrales de actuacion.
- Moderacion y deteccion de intencion en juegos multijugador: clasificar el mensaje del jugador segun reglas tipadas (toxicidad, intento de manipulacion, peticion fuera de personaje) reutilizando el mismo modelo que genera las respuestas.
- Prototipado rapido de agentes conversacionales: al no requerir un segundo servidor ni un modelo auxiliar, un equipo puede desplegar chat y decision en un unico proceso, simplificando la infraestructura y el coste operativo.
- Evaluacion de reglas nuevas sin reentrenar: como cada regla es una pregunta tipada en texto, un disenador puede anadir reglas ineditas y el modelo las responde sin ajuste adicional (95,8% en reglas nunca vistas).

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card, referidos a la tarea de decision sobre reglas nunca vistas en entrenamiento (28.433 preguntas de test) y a la tasa de llamada a herramienta en agentes de juego guionizados (10 agentes, 2.400 turnos de jugador):

| Metrica | Rein-NPC-4B | Rein-r1-4B | Kev-4B | Qwen3.5-4B (sin entrenar) |
|---|---|---|---|---|
| Precision en reglas no vistas (28.433 preguntas) | 95,8% | 97,3% | 84,6% | 37,3% |
| Llamada a herramienta necesaria realizada (2.400 turnos) | 94% | no disponible | no disponible | 42% |
| Herramienta correcta cuando se llama | siempre | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el checkpoint completo ocupa aproximadamente 10,6 GB de pesos mas overhead de activaciones y cache KV; en Q4_K_M, el repo GGUF reduce el peso a un entorno de 3-4 GB (no se detalla la cifra exacta en la informacion disponible).
- GPU recomendadas: A100 o H100 para bf16 con contexto largo y varias reglas por turno; RTX 4090 (24 GB) para bf16 en contextos moderados o para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizacion Q4_K_M o Q5_K_M; en GPUs de 8-12 GB probablemente solo con cuantizaciones agresivas y contextos cortos.
- Opciones de despliegue: Transformers, vLLM, SGLang, llama.cpp (con `llama-server` y `n_probs` para las decisiones) y MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card solo indica que una decision cuesta una pasada de prefijo sobre la conversacion mas una fila de unos 100 tokens por regla, con cache KV compartida entre reglas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rein-NPC-4B | 5.295.564.288 | no disponible | Chat + decision en un solo checkpoint (64 tokens entrenados) | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Rein-r1-4B | no disponible | no disponible | Modelo de decision separado que se ejecuta junto al chat | Apache 2.0 | Hugging Face |
| Kev-4B | no disponible | no disponible | Modelo de decision generico del mismo tamano | no disponible | no disponible |
| Qwen3.5-4B | no disponible | no disponible | Chat base sin capacidad de decision tipada | no disponible | Hugging Face |

Rein-NPC-4B se diferencia de Rein-r1-4B en que integra la decision en el propio checkpoint de chat, eliminando el segundo servidor, a costa de una precision ligeramente inferior en reglas no vistas (95,8% frente a 97,3%). Frente a Kev-4B, mejora la precision en esa misma tarea (95,8% frente a 84,6%) y frente a Qwen3.5-4B sin ajustar la mejora es muy amplia (37,3%).

## Limitaciones y advertencias

- El nombre comercial "4B" no coincide con el recuento real de parametros (5.295.564.288); conviene dimensionar la infraestructura con la cifra real.
- La copia del `lm_head` anade 1,27 GB en bf16 (358 MB en Q4_K_M) al peso del modelo.
- El modelo solo se ha evaluado, segun la informacion disponible, en la tarea de decision sobre reglas tipadas y en agentes de juego guionizados; no hay benchmarks generales publicados.
- La calidad del chat depende enteramente de Qwen3.5-4B; los sesgos, alucinaciones y limitaciones del backbone se heredan sin cambios.
- El soporte de idiomas declarado es en, pt y multilingue; el rendimiento en otros idiomas no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla condiciones adicionales ni garantias.
- El formato de decision exige respetar el layout de Rein (tokens soft, orden de la fila, marca de respuesta y temperatura 0.812); desviarse de el invalida la lectura de probabilidades.
- No se especifica la longitud de contexto efectiva del checkpoint, un dato critico para conversaciones largas en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmc0/Rein-NPC-4B
- Repo GGUF: https://huggingface.co/jmc0/Rein-NPC-4B-GGUF
- Rein-r1-4B (modelo de decision de dos modelos): https://huggingface.co/jmc0/rein-r1-4b
- Rein-r1-0.8B: https://huggingface.co/jmc0/rein-r1-0.8b
- Dataset de decisiones: https://huggingface.co/datasets/jmc0/rein-decisions
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
