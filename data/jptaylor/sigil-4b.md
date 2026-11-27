# jptaylor/sigil-4b

## Resumen

SpellSpeak Sigil 4B es un modelo de lenguaje especializado en la generación de una única línea de diálogo para personajes no jugadores (NPC) en videojuegos. Lo desarrolla jptaylor y se construye sobre el modelo base google/gemma-4-E4B-it, del que hereda su arquitectura y conocimiento general. Su propósito es concreto: dado un contexto de personaje (descripción, conocimiento, secretos y conversación previa) y una lista de palabras clave de voz, el modelo produce una réplica breve, en personaje y sin salirse del mundo del juego.

La relevancia del modelo radica en su tamano y su enfoque de despliegue local. Con aproximadamente 4.000 millones de parámetros en su modelo de texto central, está pensado para ejecutarse en la máquina del jugador mediante llama.cpp, sin depender de servicios en la nube. El juego conserva la autoridad sobre los hechos: el modelo solo propone diálogo, nunca decide transacciones ni consecuencias narrativas.

Esta es la versión RC2 (alpha) del modelo, publicada bajo licencia Apache 2.0. Incluye mejoras en la diferenciación de voces mediante palabras clave y en el control de la longitud de las respuestas. El autor advierte que las mediciones se han realizado en GPUs NVIDIA en la nube, no en equipos de jugadores, por lo que el rendimiento en hardware doméstico no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Gemma 4 E4B (modelo multimodal con componentes de texto, visión y audio) |
| Parametros totales | 7.941.100.874 (safetensors, incluye embeddings de 3,49B y visión/audio de 0,48B); modelo de texto central: ~4,0B |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (configuración recomendada de servicio) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M (GGUF); safetensors en precisión completa |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors |

## Arquitectura y entrenamiento

El modelo se basa en google/gemma-4-E4B-it, una arquitectura transformer multimodal que incluye un modelo de texto central de aproximadamente 4.000 millones de parámetros, tablas de embeddings de 3,49B y componentes de visión y audio de 0,48B. El ajuste fino se ha orientado a la generación de diálogo de personajes, con un formato de prompt específico que utiliza los marcadores de turno de Gemma y una estructura de contexto de actor (`ActorContext`) que describe al personaje, su conocimiento, sus secretos y la conversación previa.

El entrenamiento incorpora un sistema de palabras clave de voz organizadas en categorías (temperamento, humor, registro, región), con entre una y seis palabras por personaje. La versión RC2 mejora la diferenciación entre personajes y el control de la longitud de las respuestas según estas palabras clave. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El modelo emplea decodificación greedy (temperatura 0, top_k 1) y detención en el token `<turn|>` para reproducir las condiciones de evaluación.

## Capacidades

- Generación de una única línea de diálogo en personaje, en texto plano listo para síntesis de voz, sin marcado, emotes ni acotaciones escénicas.
- Diferenciación de voces mediante palabras clave: temperamento, humor, registro y región (por ejemplo, "gruff, dockside, terse, calls people 'mate'").
- Control de longitud de respuesta condicionado por palabras clave: un personaje "terse" promedia 5,0 palabras por réplica; uno "chatty", 16,8.
- Uso de muletillas o frases características cuando se proporcionan (15 de 15 personajes las emplearon en las pruebas).
- Reconocimiento de los límites de su conocimiento: responde "no lo sé" cuando la pregunta excede lo que el personaje sabe.
- Gestión de secretos del personaje: no revela información que el personaje debe ocultar.
- Coherencia con el mundo del juego: rechaza elementos ajenos al contexto (por ejemplo, un teléfono móvil en un entorno medieval).
- Gestión de múltiples personajes con un solo modelo, manteniendo el contexto de cada personaje en su propia sesión.
- No dispone de tool calling, function calling ni razonamiento explícito multi-paso; el modelo solo propone diálogo y el juego decide las consecuencias.

## Casos de uso

- Diálogo de NPC en videojuegos: el motor del juego proporciona el contexto del personaje y la conversación previa, y el modelo genera una réplica breve en personaje; su tamano permite ejecutarlo en la máquina del jugador con llama.cpp.
- Atención al cliente con personajes temáticos: en experiencias interactivas o simulaciones, el modelo mantiene conversaciones multi-turno dentro de un personaje definido, con contexto de 4096 tokens y control de voz mediante palabras clave.
- Agentes de voz para juegos y aplicaciones conversacionales: la salida en texto plano sin marcado está pensada para alimentar directamente un sistema de síntesis de voz, lo que simplifica la integración en pipelines de TTS.
- Roleplay y narrativa interactiva: el modelo respeta el conocimiento y los secretos del personaje, lo que permite construir tramas donde la información se revela de forma controlada por el juego.
- Prototipado rápido de personajes: las palabras clave de voz permiten definir la personalidad de un personaje sin reentrenar el modelo, lo que agiliza la iteración en el diseño de diálogos.
- Simulaciones de entrenamiento: escenarios con NPC que responden según un rol y un conocimiento limitado, útiles para prácticas de negociación, entrevistas o formación en entornos simulados.
- Despliegue local sin conexión: al caber en formato GGUF Q4_K_M (4,40 GB), puede integrarse en aplicaciones de escritorio o juegos que requieran funcionamiento offline.

## Benchmarks y rendimiento

| Prueba | RC2 | RC1 | Referencia |
|---|---|---|---|
| Diferenciación de personajes por su línea (43 personajes) | 21,4% | 12,4% | Azar: 2,3% |
| Longitud media con palabra clave "terse" | 5,0 palabras | no disponible | — |
| Longitud media con palabra clave "chatty" | 16,8 palabras | no disponible | — |
| Longitud media sin palabra clave de longitud | 13,4 palabras | 14,3 palabras | — |
| Uso de muletilla cuando se proporciona | 15 de 15 | no disponible | — |
| Réplicas que pasan todas las comprobaciones de hechos (prueba de palabras clave) | 91,1% | 92,5% | Diferencia dentro del azar |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores provienen de las pruebas internas del autor (GameBench) y no son comparables con benchmarks académicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 4,40 GB en disco, pero el autor advierte que el tamano del archivo no equivale a la memoria necesaria; con `--lazy-mode on` se evita mantener en memoria aproximadamente 1,6 GB de la tabla por capas de Gemma.
- GPU recomendadas: no se especifican modelos concretos; las mediciones se realizaron en GPUs NVIDIA en la nube.
- Compatibilidad con GPU de consumo: no verificada en equipos de jugadores; el autor indica que el ahorro de memoria de `--lazy-mode on` no se ha medido en hardware doméstico.
- Opciones de despliegue: llama.cpp mediante `llama-server` (build b11146 o posterior), con los parámetros `-c 4096 -np 1 -ngl all --lazy-mode on`; si se integra llama.cpp, establecer `lazy_mode = LLAMA_LAZY_MODE_ON` en `llama_model_params`.
- Otros runtimes: no se han probado; la opción de modo perezoso puede no estar disponible en ellos.
- Latencia y throughput: no disponibles. El autor señala que el texto de salida puede variar ligeramente entre máquinas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SpellSpeak Sigil 4B | ~4,0B (texto central); 7,94B totales | 4096 | Apache 2.0 | Diálogo de NPC en juegos |
| SpellSpeak Glyph 2B | no disponible | no disponible | no disponible | Diálogo de NPC en juegos (versión menor del mismo autor) |
| google/gemma-4-E4B-it | ~4,0B (texto central) | no disponible | no disponible | Modelo base multimodal de propósito general |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparativa se limita a tamano, contexto, licencia y enfoque.

## Limitaciones y advertencias

- Es una versión alpha: las mediciones se han realizado en GPUs NVIDIA en la nube, no en máquinas de jugadores, por lo que el rendimiento en hardware doméstico no está verificado.
- El modelo solo genera una línea de diálogo; no razona en voz alta, no tiene herramientas y no decide consecuencias. El juego debe gestionar los hechos y las transacciones.
- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- El formato de prompt está fijado al diseño de entrenamiento; otras disposiciones no han sido probadas y pueden degradar la calidad.
- La diferenciación de voces, aunque mejorada, sigue siendo limitada: 21,4% de acierto frente a un 2,3% de azar en la prueba de 43 personajes.
- Riesgo de alucinación en hechos no presentes en el contexto del personaje; el modelo está diseñado para decir "no lo sé", pero no se garantiza en todos los casos.
- El uso de `--lazy-mode on` ahorra memoria, pero su efecto no se ha medido en hardware de consumo y otros runtimes pueden no soportarlo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base google/gemma-4-E4B-it puede tener sus propias condiciones que deben verificarse.
- El repositorio ocupa 50,3 GB e incluye pesos en precisión completa (15,88 GB) además de las cuantizaciones GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jptaylor/sigil-4b
- Modelo menor SpellSpeak Glyph 2B: https://huggingface.co/jptaylor/spellspeak-glyph-2b
- Ejemplos y código fuente: https://github.com/spellspeak/models/tree/main/sigil
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
