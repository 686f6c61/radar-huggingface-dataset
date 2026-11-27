# jptaylor/spellspeak-glyph-2b

## Resumen

SpellSpeak Glyph 2B es un modelo de lenguaje afinado para generar una única línea de diálogo de personajes no jugadores (NPC) en videojuegos. Lo desarrolla jptaylor y parte del modelo base google/gemma-4-E2B-it, sobre el que se ha realizado un ajuste específico para el dominio de diálogo conversacional en juegos, roleplay y agentes de voz. La versión publicada es RC2 (alpha), una revisión que introduce la generación de voces a partir de palabras clave de personalidad.

El modelo resuelve un problema muy concreto: que un personaje del juego responda en su propia voz, a partir únicamente de lo que ese personaje sabe y cree, sin inventar hechos que el juego no haya establecido. La premisa de diseño es que el juego es la fuente de verdad y el modelo solo propone la línea de habla; si el personaje acepta un intercambio, es el juego quien lo ejecuta. Está pensado para ejecutarse en la máquina del jugador, no en servidores en la nube, de ahí su tamaño reducido.

El nombre "2B" hace referencia al modelo de texto principal de Gemma 4 E2B, de unos 1.900 millones de parámetros. Hugging Face lista 5.104.297.539 parámetros en total porque el fichero safetensors incluye las tablas de embeddings de palabras (2.750 millones) y los componentes de audio y visión (470 millones). El contexto operativo recomendado es de 4096 tokens y los idiomas soportados se limitan al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 E2B (modelo base google/gemma-4-E2B-it), con componentes multimodales de audio y visión en el checkpoint completo |
| Parametros totales | 5.104.297.539 en `model.safetensors`; el modelo de texto principal ronda los 1.900 millones |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (valor usado en la configuración de referencia con `llama-server`) |
| Tipos de cuantizacion | GGUF Q5_K_M (2,91 GB); safetensors en precisión completa (10,21 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura de Gemma 4 E2B, un transformer con partes multimodales (audio y visión) presentes en el checkpoint completo, aunque el uso previsto es exclusivamente de generación de texto. El ajuste se ha orientado a una tarea muy acotada: producir una sola línea de diálogo en formato de texto plano, sin marcado, emotes ni acotaciones escénicas, lista para ser enviada a un sistema de síntesis de voz. El prompt se construye con los marcadores de turno de Gemma y la información del personaje se inyecta mediante una estructura `ActorContext` que describe quién es, qué sabe y qué cree, junto con el historial de la conversación.

La novedad principal de RC2 es el control de la voz mediante palabras clave: el campo `voice` del personaje es una lista separada por comas de entre una y seis palabras de un vocabulario cerrado (temperamento, humor, registro, región y hábitos). El modelo se ha entrenado con ese vocabulario concreto y con ese diseño de prompt; según la model card, otras disposiciones del prompt no se han probado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de una única línea de diálogo de personaje en texto plano, sin marcado ni acotaciones, apta para síntesis de voz.
- Diferenciación de voces a partir de palabras clave de personalidad: temperamento, humor, registro, región y hábitos.
- Control de la longitud de la respuesta según las palabras clave de longitud (un personaje "terse" promedia 5,1 palabras por respuesta; uno "chatty", 16,9).
- Uso de frases características ("pet phrases") cuando se le proporcionan: 15 de 15 personajes las emplearon en las pruebas del autor.
- Fidelidad a los hechos del lore inyectado en el prompt y rechazo explícito de responder a preguntas que el personaje no puede conocer.
- Mantenimiento de secretos del personaje y permanencia dentro del mundo del juego (rechaza conceptos ajenos al mismo).
- Un mismo modelo puede interpretar a todos los personajes del juego, manteniendo el contexto de cada uno en su propia sesión.
- No dispone de herramientas (tool calling) ni de razonamiento en voz alta: solo propone la línea de diálogo y el juego decide qué se ejecuta.
- Capacidades multilingües: no disponibles; solo inglés.

## Casos de uso

- Diálogo de NPC en juegos de rol: el motor del juego inyecta la descripción del personaje, sus creencias y el historial de la conversación, y el modelo devuelve una línea en su voz. Su tamaño (2,91 GB en Q5_K_M) permite distribuirlo con el juego y ejecutarlo en la máquina del jugador.
- Atención al público dentro del mundo del juego (taberneros, mercaderes, herreros): el modelo responde a preguntas sobre precios o servicios usando únicamente el lore que el juego le pasa, y admite que no sabe cuando la información no está en su contexto.
- Personajes con secretos argumentales: el modelo mantiene la información reservada y responde con evasivas o negativas en personaje, lo que encaja con tramas de investigación o misterio.
- Voces diferenciadas en plantillas de personajes: con una lista de palabras clave por personaje (`gruff, dockside, terse, calls people "mate"`) se generan respuestas distinguibles sin necesidad de un modelo distinto por personaje.
- Integración con síntesis de voz en agentes conversacionales: al devolver texto plano sin marcado, la salida se puede enviar directamente a un TTS para dar voz al personaje en tiempo real.
- Prototipado rápido de narrativa interactiva: guionistas y diseñadores pueden iterar sobre personalidades y comprobar cómo suenan distintos registros y longitudes de respuesta antes de fijar el guion definitivo.
- Control de longitud para interfaces con restricciones: las palabras clave de longitud permiten forzar respuestas cortas (5,1 palabras de media con "terse") en burbujas de diálogo pequeñas o en subtítulos.

## Benchmarks y rendimiento

Los datos publicados por el autor en la model card (RC2 frente a RC1) son los siguientes:

| Prueba | RC2 | RC1 |
|---|---|---|
| Distinción de personajes por su línea (43 personajes, azar 2,3%) | 20,1% | 10,5% |
| Longitud media con palabra clave "terse" | 5,1 palabras | no disponible |
| Longitud media con palabra clave "chatty" | 16,9 palabras | no disponible |
| Longitud media sin palabra clave de longitud | 13,4 palabras | similar a RC1 |
| Uso de frase característica cuando se proporciona | 15 de 15 personajes | no disponible |
| Respuestas que superan todas las comprobaciones de hechos (prueba de palabras clave) | 92,7% | 94,0% (diferencia dentro del azar) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF Q5_K_M ocupa 2,91 GB, pero el autor advierte que el tamaño del fichero no es la memoria necesaria. La opción `--lazy-mode on` evita mantener en memoria unos 1,3 GB de la tabla por capas de Gemma, leyéndola fila a fila desde el fichero.
- GPU recomendadas: no se especifican modelos concretos; las mediciones se han realizado en GPUs NVIDIA en la nube.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el modelo está pensado para ejecutarse en la máquina del jugador y el ejemplo de referencia se ejecuta en CPU con llama.cpp.
- Despliegue: llama.cpp mediante `llama-server` (build b11146 o posterior) con `-c 4096 -np 1 -ngl all --lazy-mode on`. Si se integra llama.cpp como biblioteca, hay que activar `lazy_mode = LLAMA_LAZY_MODE_ON` en `llama_model_params`. Otros runtimes pueden no ofrecer esta opción.
- Latencia y throughput: no disponibles. El ahorro de memoria de `--lazy-mode on` se confirmó en una máquina en la nube, pero no se ha medido en el equipo de un jugador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| SpellSpeak Glyph 2B (RC2) | 5.104.297.539 en safetensors; ~1,9B en el modelo de texto | 4096 tokens | inglés | Apache 2.0 | Diálogo de NPC en juegos, una línea por turno |
| SpellSpeak Sigil 4B | no disponible | no disponible | no disponible | no disponible | Versión mayor del mismo proyecto, según la model card |
| google/gemma-4-E2B-it (modelo base) | ~1,9B en el modelo de texto (5.104.297.539 en el checkpoint completo) | no disponible | no disponible | no disponible en la información proporcionada | Modelo generalista multimodal (texto, audio, visión) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una versión alpha: las mediciones se han hecho en GPUs NVIDIA en la nube, no en equipos de jugadores, y el rendimiento en hardware doméstico no está validado.
- Solo soporta inglés; no hay capacidades multilingües.
- El modelo está entrenado con un diseño de prompt concreto (marcadores de turno de Gemma y estructura `ActorContext`); otras disposiciones no se han probado y pueden degradar la calidad.
- El vocabulario de palabras clave de voz es cerrado; el comportamiento con palabras fuera de ese conjunto no está documentado.
- No dispone de herramientas ni de razonamiento explícito: no debe usarse como agente autónomo ni para tomar decisiones; el juego debe validar y ejecutar cualquier acción.
- Riesgo de alucinación: aunque el diseño busca que el modelo admita cuando no sabe, el 7,3% de las respuestas de la prueba de palabras clave no superaron todas las comprobaciones de hechos.
- La distinción entre personajes es estadística, no determinista: con 43 personajes, la tasa de acierto es del 20,1% frente a un azar del 2,3%, lo que implica que muchas respuestas no serán identificables por su voz sin contexto adicional.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base google/gemma-4-E2B-it, cuyos términos no se detallan en la información disponible.
- El ahorro de memoria de `--lazy-mode on` no se ha medido en el equipo de un jugador y otros runtimes pueden no implementarlo.

## Enlaces

- [Hugging Face: jptaylor/spellspeak-glyph-2b](https://huggingface.co/jptaylor/spellspeak-glyph-2b)
- [Repositorio de ejemplos y código fuente](https://github.com/spellspeak/models/tree/main/glyph)
- [SpellSpeak Sigil 4B](https://huggingface.co/jptaylor/spellspeak-sigil-4b)
- [Modelo base: google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
