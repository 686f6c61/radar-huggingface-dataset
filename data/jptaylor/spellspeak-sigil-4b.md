# jptaylor/spellspeak-sigil-4b

## Resumen

SpellSpeak Sigil 4B es un modelo de lenguaje afinado para generar una unica linea de dialogo de personaje no jugable (NPC) en videojuegos. Lo desarrolla jptaylor y se construye sobre `google/gemma-4-E4B-it`, del que hereda la arquitectura multimodal (texto, vision y audio) pero cuyo nucleo de texto ronda los 4.000 millones de parametros. Su proposito es concreto: dado un contexto de personaje (descripcion, conocimientos, creencias, secretos y conversacion previa) generar una respuesta en la voz de ese personaje, sin inventar hechos y sin salirse del mundo del juego.

La relevancia del modelo esta en su enfoque de despliegue local: el autor lo presenta como suficientemente pequeno para ejecutarse en la maquina del jugador, con una cuantizacion Q4_K_M de 4,40 GB que cabe en GPU de consumo. La version RC2 (alpha) introduce la capacidad de derivar el estilo de la linea a partir de una lista de palabras clave de voz (`gruff, dockside, terse, calls people "mate"`), mejorando la diferenciacion entre personajes respecto a RC1.

Es importante subrayar que se trata de una version alpha: el autor indica que las mediciones se han realizado en GPUs NVIDIA en la nube, no en equipos de jugadores, y que el modelo no dispone de herramientas ni de razonamiento explicito, sino que unicamente propone lineas que el juego decide si acepta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E4B); nucleo de texto de ~4,0B parametros |
| Parametros totales | 7.941.100.874 (safetensors, incluye embeddings de 3,49B y partes de audio/vision de 0,48B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (configuracion recomendada de servido: `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (4,40 GB), Q5_K_M (4,82 GB), safetensors en precision completa (15,88 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal que incluye tablas de embeddings de 3.490 millones de parametros y componentes de audio y vision de 480 millones. El autor aclara que la denominacion "4B" hace referencia al nucleo de texto del modelo base (unos 4.000 millones de parametros), mientras que Hugging Face contabiliza 8B por incluir todos los tensores de `model.safetensors`. El afinado se ha orientado exclusivamente a la generacion de dialogo de NPC, con un formato de prompt especifico basado en los marcadores de turno de Gemma y una parada en `<turn|>`.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion destacable de RC2 es el condicionamiento por palabras clave de voz: el prompt renderiza una linea `Voice: <keywords>.` con entre una y seis palabras de un vocabulario controlado (temperamento, humor, registro y region), y el modelo ajusta tono, longitud de respuesta y frases recurrentes en funcion de esas palabras. El autor reporta que una linea de personaje "terse" promedia 5,0 palabras frente a 16,8 de uno "chatty", y que 15 de 15 personajes con frase recurrente la utilizaron.

## Capacidades

- Generacion de una unica linea de dialogo en texto plano, lista para sintesis de voz, sin marcado, emotes ni acotaciones escenicas.
- Diferenciacion de voz por palabras clave: temperamento, humor, registro y region, con control de longitud segun las palabras elegidas.
- Uso de frases recurrentes (pet phrases) cuando se proporcionan al personaje.
- Coherencia con los hechos del prompt: el modelo responde dentro del lore proporcionado y declina responder cuando no dispone de la informacion ("Don't know, mate").
- Proteccion de secretos del personaje: mantiene la informacion que el personaje no debe revelar.
- Gestion de preguntas fuera del mundo del juego, respondiendo desde la perspectiva del personaje sin romper la ficcion.
- Multiples personajes con un solo modelo, manteniendo cada contexto de personaje en su propia sesion.
- No dispone de tool calling, function calling ni razonamiento explicito: el modelo solo propone, y el juego decide y ejecuta.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Dialogo de NPC en juegos de rol: el motor del juego inyecta la descripcion del personaje, sus creencias y el historial de conversacion, y el modelo devuelve una linea coherente con la voz definida por palabras clave, lo que permite NPCs con personalidad consistente sin escribir arboles de dialogo completos.
- Generacion de voz para agentes conversacionales: al producir texto plano sin marcado, la salida se envia directamente a un sistema de sintesis de voz, lo que simplifica el pipeline de NPCs hablados.
- Comercio y transacciones dentro del juego: el modelo propone la linea de respuesta a una oferta o trueque, y el juego es quien confirma la transaccion, evitando que el modelo altere el estado del mundo.
- Escenas de grupo: con la cuantizacion Q5_K_M, que el autor describe como mejor en escenas de grupo y trueques, un mismo modelo puede interpretar a varios personajes manteniendo contextos separados por sesion.
- Proteccion de tramas y secretos: en misiones con informacion oculta, el modelo mantiene los secretos del personaje y responde con evasivas en personaje cuando el jugador intenta extraer informacion que no le corresponde.
- Despliegue local en la maquina del jugador: con Q4_K_M (4,40 GB) y llama.cpp con `--lazy-mode on`, el modelo puede ejecutarse dentro del propio juego sin depender de servicios en la nube, reduciendo costes de inferencia y latencia de red.
- Prototipado rapido de personajes: el vocabulario controlado de palabras clave permite iterar el tono de un personaje modificando solo la lista de keywords, sin reentrenar ni reescribir guiones.

## Benchmarks y rendimiento

El autor publica mediciones internas sobre su conjunto "GameBench" y la prueba de palabras clave, comparando RC2 con RC1. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | RC2 | RC1 | Referencia |
|---|---|---|---|
| Distincion de personajes por su linea (43 personajes) | 21,4% | 12,4% | Azar: 2,3% |
| Longitud media con keyword "terse" | 5,0 palabras | no disponible | no disponible |
| Longitud media con keyword "chatty" | 16,8 palabras | no disponible | no disponible |
| Longitud media sin keyword de longitud | 13,4 palabras | 14,3 palabras | no disponible |
| Uso de frase recurrente cuando se proporciona | 15 de 15 personajes | no disponible | no disponible |
| Respuestas que superan todas las comprobaciones de hechos (prueba de keywords) | 91,1% | 92,5% | Diferencia dentro del azar |

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 4,40 GB en disco; Q5_K_M, 4,82 GB; safetensors en precision completa, 15,88 GB. El autor advierte que el tamano del fichero no equivale a su consumo de memoria.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; las mediciones se realizaron en GPUs NVIDIA en la nube.
- GPU de consumo: el modelo se presenta como apto para ejecutarse en la maquina del jugador gracias a la cuantizacion Q4_K_M; no se detallan modelos concretos de GPU de consumo validados.
- Opciones de despliegue: llama.cpp mediante `llama-server` (build b11146 o posterior). El autor indica que otros runtimes pueden no soportar la opcion `--lazy-mode on`, que lee la tabla por capas de Gemma fila a fila en lugar de mantener unos 1,6 GB en memoria; el ahorro no se ha medido en equipos de jugadores.
- Configuracion de servido recomendada: `llama-server -m gguf/spellspeak-sigil-4b-Q4_K_M.gguf -c 4096 -np 1 -ngl all --lazy-mode on`.
- Latencia y throughput: no disponibles. El ejemplo de salida se genero en CPU con llama.cpp b11146, y el autor advierte que la redaccion puede variar ligeramente entre maquinas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpellSpeak Sigil 4B | ~4,0B nucleo de texto (7,94B totales en safetensors) | 4096 | Dialogo de NPC en juegos, local | Apache 2.0 | GGUF y safetensors en Hugging Face |
| SpellSpeak Glyph 2B | no disponible | no disponible | Dialogo de NPC en juegos, version menor | no disponible | Hugging Face (jptaylor/spellspeak-glyph-2b) |
| google/gemma-4-E4B-it | ~4,0B nucleo de texto | no disponible | Modelo base multimodal de proposito general | no disponible | Hugging Face (google/gemma-4-E4B-it) |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Version alpha: las mediciones se han realizado en GPUs NVIDIA en la nube, no en equipos de jugadores; el rendimiento en hardware de consumo no esta validado.
- Solo ingles: el modelo no soporta otros idiomas.
- Sin herramientas ni razonamiento: no dispone de tool calling ni de razonamiento explicito; solo propone lineas y el juego debe validar y ejecutar cualquier accion.
- Formato de prompt fijado: el modelo fue entrenado con un diseno de prompt concreto basado en los marcadores de turno de Gemma; otros disenos no han sido probados.
- Dependencia de runtime: requiere llama.cpp build b11146 o posterior y la opcion `--lazy-mode on` para el ahorro de memoria; otros runtimes pueden no ofrecer esa opcion.
- Variabilidad de salida: el autor advierte que la redaccion puede cambiar ligeramente entre maquinas; en RC1, una linea termino de forma distinta en un segundo contenedor en la nube.
- Riesgo de alucinacion: aunque el modelo esta disenado para declinar responder cuando no sabe, no se documentan tasas de alucinacion fuera de las pruebas internas; el 91,1% de respuestas que superan las comprobaciones de hechos implica que cerca de un 9% no las supera.
- Fuga de secretos: el autor senala que la cuantizacion Q5_K_M es mas debil a la hora de dejar escapar secretos, lo que obliga a elegir la cuantizacion segun el caso de uso.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Gemma tiene sus propios terminos que deben verificarse para produccion.
- Sin datos publicos de sesgos: no se documentan sesgos conocidos en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jptaylor/spellspeak-sigil-4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo hermano SpellSpeak Glyph 2B: https://huggingface.co/jptaylor/spellspeak-glyph-2b
- Ejemplos y codigo fuente: https://github.com/spellspeak/models/tree/main/sigil
