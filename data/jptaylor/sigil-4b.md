# jptaylor/sigil-4b

## Resumen

SpellSpeak Sigil 4B (RC1, alpha) es un modelo de lenguaje afinado por jptaylor a partir de `google/gemma-4-E4B-it`, disenado especificamente para generar una unica linea de dialogo de personaje no jugable (NPC) en videojuegos. El modelo recibe una descripcion del personaje, el conocimiento y creencias que ese personaje tiene del mundo, y la conversacion previa, y responde en su voz, admitiendo ignorancia cuando corresponde y manteniendo los secretos que el juego le indica que debe guardar. Su proposito es sustituir el dialogo preescrito por generacion en tiempo real sin que el modelo decida hechos del mundo: la logica del juego permanece como fuente de verdad.

El modelo se distribuye en formato GGUF cuantizado (Q4_K_M y Q5_K_M) para ejecutarse con llama.cpp en la maquina del jugador, ademas de pesos completos en safetensors para reentrenamiento. Segun la model card, los pesos totales ascienden a 7.941.100.874 parametros en safetensors. La ventana de contexto empleada en la configuracion de referencia es de 4096 tokens.

Es relevante ahora porque aborda un caso de uso concreto —dialogo de NPC con latencia baja y memoria contenida— en lugar de competir en benchmarks generales. El autor declara explicitamente que es una version alpha medida en GPUs NVIDIA en la nube, no en equipos de jugadores, y publica un benchmark propio (GameBench) con resultados por escenario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Gemma 4 E4B (no se detalla la variante interna) |
| Parametros totales | 7.941.100.874 (safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (configuracion de referencia en llama-server) |
| Tipos de cuantizacion | GGUF Q4_K_M, GGUF Q5_K_M, safetensors en precision completa |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |
| Modelo base | google/gemma-4-E4B-it |
| Tamano del repo | 25,1 GB |
| Version | RC1 (alpha) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que deriva de Gemma 4 E4B, un modelo instruct de Google. El autor no publica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Lo que si se documenta es el diseno del prompt: el modelo fue entrenado con un formato concreto de turnos de Gemma, generado por la funcion `render_prompt` a partir de un objeto `ActorContext` que describe un personaje. La inferencia de referencia usa decodificacion greedy (`temperature` 0, `top_k` 1) y parada en el token `<turn|>`.

La innovacion tecnica destacable no esta en la arquitectura sino en el contrato de uso: el modelo solo propone dialogo y no ejecuta herramientas ni razona en voz alta; el juego decide que hechos son ciertos y confirma acciones como intercambios. Ademas, una misma instancia puede interpretar a varios personajes manteniendo cada contexto en su propia sesion. El autor menciona el uso de `--lazy-mode on` en llama.cpp para leer la tabla por capas de Gemma desde el fichero en lugar de mantener aproximadamente 1,6 GB en memoria, una optimizacion de despliegue mas que de entrenamiento.

## Capacidades

- Generacion de una unica linea de dialogo en la voz de un personaje, en texto plano apto para sintesis de voz, sin marcado, emotes ni acotaciones.
- Adhesion a la informacion de trasfondo (lore) proporcionada en el prompt como fuente fiable de hechos.
- Expresion de ignorancia cuando la pregunta queda fuera del conocimiento del personaje.
- Retencion de secretos que el juego marca como tales, y cesion de los mismos cuando corresponde.
- Manejo de conversaciones multi-turno y de escenas con varios personajes.
- Capacidad de responder a preguntas formuladas dentro de un grupo de personajes.
- Reconocimiento de elementos ajenos al mundo ficticio y rechazo educado de los mismos.
- No dispone de tool calling ni function calling.
- No realiza razonamiento explicito ni multi-step reasoning visible.
- Soporte multilingue limitado al ingles.

## Casos de uso

- Dialogo de NPC en tiempo real: el motor del juego envia la descripcion del personaje, su conocimiento y el historial, y el modelo devuelve una linea lista para sintesis de voz, con una latencia de primera palabra de 54 ms en lineas de seguimiento sobre una NVIDIA L4.
- Atencion al jugador en comercios y gremios: el modelo responde a precios y disponibilidad usando el lore inyectado; el juego debe aportar las cifras porque el modelo es debil con numeros.
- Escenas de grupo: con hasta cinco personajes simultaneos medidos, el modelo distingue a quien responde y mantiene coherencia entre sesiones separadas.
- Misiones con informacion oculta: el modelo guarda secretos marcados por el juego y solo los revela cuando la logica lo permite, con un 89-92% de acierto en la prueba de "keeps secrets".
- Prototipado rapido de contenido narrativo: al ejecutarse en llama.cpp con un GGUF de 4,40 GB, permite iterar guiones y personalidades en local sin infraestructura dedicada.
- Agentes de voz para juegos y experiencias interactivas: la salida en texto plano sin marcado simplifica la integracion con pipelines de TTS.
- Mundos generados o no vistos: el modelo obtiene un 85-87% en la prueba de "unseen worlds", lo que lo hace util para contenido procedural donde el trasfondo se describe en tiempo de ejecucion.

## Benchmarks y rendimiento

Resultados de GameBench publicados por el autor (5.526 escenas, decodificacion greedy, una ejecucion por fichero). "Untouched" es Gemma 4 E4B instruct a precision completa con prompt largo manual.

| Prueba (escenas) | Sigil 4B Q4_K_M | Sigil 4B Q5_K_M | Gemma 4 E4B sin tocar |
|---|---:|---:|---:|
| Core scenes (309) | 69% (213) | 69% (214) | 72% (223) |
| Unseen worlds (1.000) | 85% (847) | 87% (869) | 72% (715) |
| Story and setting (103) | 66% (68) | 71% (73) | 66% (68) |
| Questions in a group (1.500) | 97% (1.449) | 96% (1.446) | 74% (1.103) |
| Group scenes (1.360) | 87% (1.181) | 92% (1.249) | 62% (841) |
| Trades (576) | 75% (433) | 80% (460) | 92% (530) |
| Big numbers (232) | 66% (153) | 48% (112) | 12% (28) |
| Keeps secrets (246) | 89% (220) | 92% (227) | 89% (218) |
| Lets secrets go (164) | 97% (159) | 94% (154) | 85% (140) |
| Under fire (36) | 86% (31) | 92% (33) | 78% (28) |
| Media de las diez | 81,7% | 82,1% | 70,1% |

El autor advierte que el resultado de Q4_K_M en "big numbers" parece alto frente a otras lecturas de ese tamano y debe tratarse con cautela. Las pruebas "Core scenes", "Story and setting" y "Under fire" son de autoria manual; las otras siete se generan sobre mundos excluidos del entrenamiento, aunque las clases de escena si estan representadas en los datos de entrenamiento.

Rendimiento medido en una NVIDIA L4 en la nube, llama.cpp b11146, todas las capas en GPU, cinco personajes a la vez, una ejecucion:

| Metrica | Q4_K_M | Q5_K_M |
|---|---:|---:|
| Tamano del fichero | 4,40 GB | 4,82 GB |
| Memoria de GPU | 3,72 GB | 4,15 GB |
| Primera palabra, personaje nuevo (mediana) | 134 ms | 144 ms |
| Primera palabra, linea de seguimiento (mediana) | 54 ms | 59 ms |

## Requisitos de hardware

- VRAM estimada: 3,72 GB para Q4_K_M y 4,15 GB para Q5_K_M, medidos con todas las capas en GPU y cinco personajes simultaneos.
- GPU recomendadas: NVIDIA L4 es la referencia medida por el autor; por memoria, cualquier GPU con al menos 4-5 GB libres deberia poder alojar los GGUF cuantizados.
- Cabe en GPU de consumo: si, segun los requisitos de memoria indicados, aunque el autor no ha medido rendimiento en GPUs de consumo ni en CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server` (build b11146 o posterior), con `--lazy-mode on` para reducir el uso de memoria de la tabla por capas de Gemma (ahorro de aproximadamente 1,6 GB, no medido en equipos de jugador). Otros runtimes no se han probado y pueden no soportar esa opcion.
- Latencia: 134 ms (personaje nuevo) y 54 ms (seguimiento) de primera palabra en L4; el throughput no se publica.
- Los pesos completos en safetensors (15,88 GB) requieren hardware muy superior y estan pensados para reentrenamiento y conversion, no para inferencia en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpellSpeak Sigil 4B | 7.941.100.874 (safetensors) | 4096 tokens | Dialogo de NPC en juegos | Apache 2.0 | GGUF y safetensors en Hugging Face |
| SpellSpeak Glyph 2B | no disponible | no disponible | Dialogo de NPC, version reducida | no disponible | Hugging Face |
| google/gemma-4-E4B-it | no disponible | no disponible | Modelo instruct general | no disponible | Hugging Face |

La comparativa directa de rendimiento con Gemma 4 E4B sin tocar esta en la tabla de benchmarks: Sigil supera al modelo base en la media de GameBench (81,7% frente a 70,1%) con un fichero de 4,40 GB, pero queda por debajo en "Core scenes" (69% frente a 72%) y en "Trades" (75% frente a 92%). No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Version alpha: no medida en equipos de jugadores; las cifras de latencia y memoria proceden de una unica NVIDIA L4 en la nube.
- Debilidad con numeros: precios, sumas y cantidades deben gestionarse desde la logica del juego; el 48% de Q5_K_M en "big numbers" lo confirma.
- El resultado de Q4_K_M en "big numbers" (66%) es anomalo segun el propio autor y debe interpretarse con cautela.
- "Core scenes" es la metrica mas honesta: aproximadamente una linea de cada tres falla en ese conjunto.
- Solo ingles; no hay soporte multilingue declarado.
- Sin tool calling ni razonamiento explicito: el modelo solo propone dialogo y el juego debe confirmar acciones.
- El formato de prompt es obligatorio: fue entrenado con un layout concreto de turnos de Gemma y otros layouts no se han probado.
- La salida puede variar ligeramente entre maquinas con los mismos ficheros, segun el autor.
- Riesgo de alucinacion en hechos del mundo si el lore no se inyecta de forma explicita; el modelo no debe ser la fuente de verdad.
- No se documentan sesgos especificos ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Gemma 4 E4B, que deben verificarse por separado.
- El ahorro de memoria de `--lazy-mode on` no se ha medido en equipos de jugador y puede no estar disponible en otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jptaylor/sigil-4b
- Modelo menor (Glyph 2B): https://huggingface.co/jptaylor/glyph-2b
- Ejemplos y codigo fuente: https://github.com/spellspeak/models/tree/main/sigil
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- llama.cpp (runtime requerido, build b11146 o posterior): no disponible en la informacion proporcionada
