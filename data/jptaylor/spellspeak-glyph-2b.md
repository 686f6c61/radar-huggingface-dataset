# jptaylor/spellspeak-glyph-2b

## Resumen

SpellSpeak Glyph 2B es un modelo de generación de texto afinado para un propósito muy concreto: escribir una única línea de diálogo de un personaje no jugador (NPC) dentro de un videojuego, manteniéndose en el personaje y dentro de los límites de lo que ese personaje sabe. Lo desarrolla jptaylor y se construye sobre `google/gemma-4-E2B-it` mediante la fusión de un adaptador LoRA entrenado con escenas sintéticas sobre mundos generados. La premisa de diseño es que el juego, no el modelo, decide qué es verdad: el motor inyecta el lore y el estado de la conversación en el prompt, y el modelo solo propone habla.

El modelo se distribuye en dos formatos: pesos completos en `safetensors` (10,21 GB) y una cuantización Q5_K_M en GGUF (2,91 GB) pensada para embarcarse en el propio juego y ejecutarse en la máquina del jugador. Según los datos del repositorio, los parámetros totales ascienden a 5.104.297.539 (~5,1 mil millones), lo que resulta llamativo para una etiqueta "2B" y conviene tener en cuenta al planificar memoria. La ventana de contexto recomendada en los ejemplos de servicio es de 4096 tokens.

Su relevancia actual está en la categoría emergente de IA conversacional para juegos con inferencia local: modelos pequeños, con latencia de primera palabra en decenas de milisegundos y sin dependencia de la nube. No obstante, es una versión alpha (RC1) medida únicamente en GPUs NVIDIA en la nube, no en hardware de consumo, y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de google/gemma-4-E2B-it); detalles internos no disponibles |
| Parametros totales | 5.104.297.539 (~5,1 mil millones), segun safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (valor usado en los ejemplos de servicio; maximo nativo no disponible) |
| Tipos de cuantizacion | GGUF Q5_K_M; pesos completos en safetensors (fp); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (10,21 GB) y GGUF (2,91 GB, Q5_K_M) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un instructivo de Google, al que se le fusiona un LoRA entrenado sobre escenas sintéticas generadas en mundos sintéticos. La model card no detalla la arquitectura interna de Gemma 4 E2B (número de capas, atención, posibles componentes MoE o híbridos) ni el volumen exacto de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF/DPO posteriores. Sí se indica que el entrenamiento se realizó sobre escenas sintéticas y que las pruebas de benchmark se ejecutan sobre mundos mantenidos fuera del conjunto de entrenamiento.

Una innovación operativa destacable no está en el modelo sino en su despliegue: el autor aprovecha la opción `--lazy-mode on` de llama.cpp (build b11146 o posterior) para leer la tabla por capas de Gemma desde el fichero fila a fila, en lugar de mantener en memoria aproximadamente 1,3 GB de esa tabla. El prompt se construye con los marcadores de turno propios de Gemma y el modelo está entrenado para detenerse en `<turn|>`; se recomienda decodificación greedy (`temperature` 0, `top_k` 1) para reproducir las puntuaciones publicadas.

## Capacidades

- Generación de una sola línea de diálogo de personaje, en texto plano, lista para síntesis de voz, sin marcado, emotes ni acotaciones escénicas.
- Respuesta en personaje a partir de un contexto de actor (`ActorContext`) que describe quién es el personaje, qué sabe y qué cree, más el historial de la conversación.
- Reconocimiento de límites de conocimiento: declara que no sabe algo cuando corresponde, en lugar de inventarlo.
- Custodia de secretos del personaje: mantiene información reservada cuando el contexto así lo indica.
- Coherencia con el mundo: rechaza o desvía elementos ajenos al universo del juego (por ejemplo, objetos del mundo real).
- Gestión de conversaciones en grupo: responde preguntas dirigidas a un personaje dentro de una escena con varios participantes.
- Proposición de intercambios comerciales, con la transacción real delegada al motor del juego.
- Un mismo modelo puede interpretar a todos los personajes, manteniendo el contexto de cada uno en su propia sesión.
- No dispone de herramientas ni de function calling; no razona en voz alta ni ejecuta acciones.

## Casos de uso

- Diálogo de NPC en videojuegos de rol: el motor inyecta el lore y el estado de la conversación y el modelo devuelve una línea en la voz del personaje; el tamaño de 2,91 GB en Q5_K_M permite embarcarlo en la distribución del juego.
- Atención al cliente o guías dentro del juego: un personaje puede responder preguntas sobre precios, ubicaciones o servicios del mundo siempre que esos datos estén en el prompt, con un 98% en la prueba de preguntas en grupo del benchmark del autor.
- Personajes con información reservada: misiones de intriga o facciones donde el NPC debe ocultar secretos; la prueba de "keeps secrets" alcanza el 99% en Q5_K_M.
- Escenas con varios personajes: conversaciones de grupo donde cada NPC responde solo lo que le corresponde, con un 90% en la prueba de escenas grupales.
- Sistemas de voz para agentes conversacionales: la salida es texto plano sin marcado, pensada para alimentar directamente un motor de síntesis de voz, con 42 ms de mediana hasta la primera palabra en línea de seguimiento sobre una L4.
- Comercio y trueques en el juego: el NPC propone condiciones y el motor valida y ejecuta la transacción; útil en tiendas, subastas o misiones de intercambio, aunque con solo un 67% en la prueba de trades.
- Prototipado rápido de narrativa: gracias a la licencia Apache 2.0 y a los pesos completos en safetensors, se puede reentrenar o afinar para un universo propio antes de cuantizar a GGUF para producción.

## Benchmarks y rendimiento

Resultados de GameBench (diez pruebas, 5.526 escenas, decodificación greedy, una ejecución por fichero) según la model card:

| Prueba (escenas) | Glyph 2B Q5_K_M | Gemma 4 E2B sin tocar |
|---|---:|---:|
| Escenas centrales (309) | 66% (205) | 61% (189) |
| Mundos no vistos (1.000) | 87% (867) | 66% (662) |
| Historia y ambientación (103) | 64% (66) | 59% (61) |
| Preguntas en grupo (1.500) | 98% (1.465) | 76% (1.140) |
| Escenas grupales (1.360) | 90% (1.224) | 58% (790) |
| Intercambios (576) | 67% (385) | 37% (215) |
| Números grandes (232) | 40% (93) | 34% (79) |
| Guarda secretos (246) | 99% (244) | 26% (64) |
| Deja ir secretos (164) | 92% (151) | 93% (153) |
| Bajo presión (36) | 89% (32) | 64% (23) |
| **Media de las diez** | **79,2%** | **57,5%** |

Rendimiento medido en una NVIDIA L4 en la nube, llama.cpp b11146, todas las capas en GPU, cinco personajes simultáneos, una ejecución:

| Métrica | Q5_K_M |
|---|---:|
| Tamano del fichero | 2,91 GB |
| Memoria de GPU | 2,15 GB |
| Memoria de host tras carga (modo por defecto) | 3,60 GB (unos 2 GB son runtime y librerias de GPU) |
| Primera palabra, personaje nuevo (mediana) | 86 ms |
| Primera palabra, linea de seguimiento (mediana) | 42 ms |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,15 GB con Q5_K_M y todas las capas en GPU, según la medición del autor en una L4.
- Memoria de host: 3,60 GB tras la carga en modo por defecto, de los cuales unos 2 GB corresponden al runtime y las librerías de GPU.
- GPU recomendadas: el autor solo ha medido en NVIDIA L4 en la nube; no hay datos publicados para A100, H100, RTX 4090 u otras.
- GPU de consumo: no verificado. El tamaño del fichero (2,91 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero el autor indica explícitamente que no se ha medido en hardware de jugadores.
- CPU: el ejemplo de la model card se ejecuta en CPU con llama.cpp b11146, pero no se publican cifras de rendimiento en CPU.
- Opciones de despliegue: llama.cpp (build b11146 o posterior, con `llama-server` y `--lazy-mode on`), y cualquier runtime compatible con GGUF. Para pesos completos, safetensors permite conversión a otros runtimes, aunque el autor advierte que otras opciones de ahorro de memoria pueden no existir fuera de llama.cpp.
- Latencia: 86 ms de mediana hasta la primera palabra con personaje nuevo y 42 ms en línea de seguimiento, en L4 con cinco personajes concurrentes. Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpellSpeak Glyph 2B | ~5,1 mil millones (segun safetensors) | 4096 (uso recomendado) | Dialogo de NPC para juegos | Apache 2.0 | GGUF y safetensors en Hugging Face |
| SpellSpeak Sigil 4B | no disponible | no disponible | Dialogo de NPC para juegos (tamano mayor) | no disponible | Hugging Face (jptaylor/sigil-4b) |
| google/gemma-4-E2B-it | no disponible | no disponible | Instructivo generalista | no disponible en la informacion | Hugging Face (modelo base) |

La comparación con alternativas de la misma categoría (modelos pequeños especializados en diálogo de juego) no está disponible en la información proporcionada. El único punto de referencia cuantitativo es el modelo base sin afinar, que obtiene una media de 57,5% frente al 79,2% de Glyph en GameBench.

## Limitaciones y advertencias

- Es una versión alpha (RC1): no se ha probado en máquinas de jugadores; las GPUs de consumo y las CPU no están medidas.
- Los números son difíciles para el modelo: solo supera el 40% de la prueba de números grandes. El juego debería enunciar precios y sumas cuando importen.
- Las escenas centrales son la cifra honesta: con un 66%, aproximadamente una de cada tres líneas en escenas escritas a mano tiene un fallo identificable por el juez.
- Solo inglés, y todas las métricas son solo de texto.
- El juez del benchmark es un modelo de lenguaje, con una sola pasada y sus propios sesgos; los resultados pueden variar entre ejecuciones de entrenamiento.
- Las conversaciones largas no se puntúan en el benchmark publicado.
- El modelo puede ser sacado de personaje; no es un sistema de seguridad, por lo que conviene filtrar tanto la entrada de los jugadores como la salida.
- No dispone de herramientas ni de function calling: cualquier efecto en el mundo del juego debe validarlo y ejecutarlo el motor.
- El prompt debe seguir el formato exacto de `render_prompt` con los marcadores de turno de Gemma; otras disposiciones no se han probado.
- La discrepancia entre la etiqueta "2B" y los 5.104.297.539 parámetros del safetensors debe tenerse en cuenta al estimar memoria y al planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jptaylor/spellspeak-glyph-2b
- Modelo de mayor tamano (SpellSpeak Sigil 4B): https://huggingface.co/jptaylor/sigil-4b
- Ejemplos y codigo fuente: https://github.com/spellspeak/models/tree/main/glyph
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
