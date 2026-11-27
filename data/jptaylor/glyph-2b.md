# jptaylor/glyph-2b

## Resumen

SpellSpeak Glyph 2B es un modelo de lenguaje afinado para generar una única línea de diálogo de personajes no jugadores (NPC) en videojuegos, manteniendo la voz del personaje y respetando los hechos que el propio juego le proporciona en el contexto. Lo desarrolla jptaylor bajo el paraguas del proyecto SpellSpeak, y se distribuye como un derivado del modelo base google/gemma-4-E2B-it. Su propósito es sustituir árboles de diálogo rígidos por respuestas dinámicas en tiempo real, ejecutables en la máquina del jugador gracias a su reducido tamaño.

La versión publicada es RC2 (alpha) y llega con una novedad central: la "voz por palabras clave". El juego describe al personaje con entre una y seis etiquetas (por ejemplo `gruff, dockside, terse`) y el modelo adapta el registro, la longitud de la respuesta y las muletillas. En la nomenclatura del autor, el "2B" se refiere al modelo de texto central (unos 1.900 millones de parámetros), mientras que el total real en safetensors es de 5.104.297.539 parámetros, al incluir las tablas de embeddings (2,75B) y los módulos de audio y visión (0,47B).

El modelo no razona en voz alta, no usa herramientas y no decide el estado del mundo: solo propone la línea de habla y delega en el motor del juego la validación y el compromiso de cualquier acción. Está pensado para síntesis de voz directa, sin marcado, emotes ni acotaciones escénicas. Su relevancia actual radica en que demuestra que un modelo de este tamaño, cuantizado a Q5_K_M (2,91 GB), puede ofrecer diálogo coherente y consistente en personaje dentro de un juego comercial sin depender de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 (modelo base google/gemma-4-E2B-it); incluye módulos de audio y visión en el checkpoint completo |
| Parámetros totales | 5.104.297.539 (safetensors); el modelo de texto central ronda los 1.900 millones |
| Parámetros activos | no disponible |
| Longitud de contexto | 4.096 tokens (configuración de referencia `-c 4096`) |
| Tipos de cuantización | GGUF Q5_K_M (2,91 GB); pesos completos en safetensors (10,21 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer de la familia Gemma 4 con módulos adicionales de audio y visión que se conservan en el checkpoint completo pero que no forman parte del flujo de inferencia descrito en la model card. El núcleo de texto concentra la mayor parte de la capacidad generativa, mientras que las tablas de embeddings (2,75B) y los componentes multimodales (0,47B) explican la diferencia entre los 5,1B totales y los aproximadamente 1,9B del modelo de texto.

El ajuste se ha orientado a una tarea muy concreta: dado un contexto de personaje (`ActorContext`), un historial de conversación y una intervención del jugador, producir una sola línea de diálogo. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. Sí especifica que el prompt se construye con los marcadores de turno de Gemma y que el modelo fue entrenado con esa plantilla exacta, por lo que otras disposiciones del prompt no han sido probadas. La innovación destacable de RC2 es el condicionamiento por palabras clave de voz, que el autor evalúa con métricas propias (discriminación entre personajes, longitud media de respuesta, uso de muletillas y verificación de hechos).

## Capacidades

- Generación de una única línea de diálogo en texto plano, lista para síntesis de voz, sin marcado, emotes ni acotaciones.
- Consistencia de voz a partir de una lista de una a seis palabras clave de temperamento, humor, registro, región y hábitos.
- Adaptación de la longitud de la respuesta según la etiqueta de voz: media de 5,1 palabras para un personaje "terse" frente a 16,9 para uno "chatty", y 13,4 sin etiqueta de longitud.
- Uso de muletillas o frases características cuando se le proporcionan (15 de 15 personajes en la prueba del autor).
- Reconocimiento de los límites del conocimiento del personaje: responde "no lo sé" cuando el hecho no está en el contexto proporcionado.
- Mantenimiento de secretos del personaje y permanencia dentro del mundo ficcional, rechazando referencias externas (por ejemplo, un teléfono móvil).
- Fidelidad a los hechos del lore inyectado en el prompt (92,7 % de respuestas que superan todas las comprobaciones de hechos en la prueba de palabras clave).
- Soporte de múltiples personajes con un mismo modelo, manteniendo el contexto de cada personaje en su propia sesión.
- Sin soporte de tool calling, function calling, razonamiento multi-paso explícito ni modo de pensamiento.
- Capacidades multimodales (audio, visión) presentes en el checkpoint completo pero no documentadas como utilizables en el flujo de diálogo.

## Casos de uso

- Diálogo de NPC en videojuegos de rol: el motor del juego inyecta la descripción del personaje, su conocimiento y el historial, y el modelo devuelve una línea coherente con su voz; al ejecutarse en local con Q5_K_M (2,91 GB), evita la dependencia de la nube y la latencia de red.
- Atención al cliente con personajes temáticos: en experiencias de marca o parques temáticos, un mismo modelo puede encarnar varios personajes con voces distintas mediante palabras clave, manteniendo cada sesión aislada.
- Agentes de voz conversacionales: la salida en texto plano sin marcado se conecta directamente a un motor de síntesis de voz, lo que simplifica la integración en asistentes hablados con personalidad definida.
- Prototipado rápido de personajes: los diseñadores narrativos ajustan la voz con etiquetas (`gruff, dockside, terse`) y comprueban el resultado sin reentrenar el modelo, acortando el ciclo de iteración de guion.
- Roleplay y experiencias interactivas: el modelo mantiene secretos y rechaza información fuera del mundo, lo que permite tramas de misterio donde el personaje no filtra datos que no debería conocer.
- Simulacros de entrevista o formación: un personaje con un registro concreto (por ejemplo, `formal, precise, courtly`) puede interpretar a un interlocutor en escenarios de entrenamiento, con el formador controlando los hechos del contexto.
- Moderación de coherencia narrativa: al no inventar hechos y remitir al juego la validación, el modelo encaja en pipelines donde un sistema externo audita cada línea antes de mostrarla al jugador.

## Benchmarks y rendimiento

| Prueba | RC2 | RC1 | Referencia |
|---|---|---|---|
| Discriminación entre 43 personajes por su línea | 20,1 % | 10,5 % | Azar: 2,3 % |
| Respuestas que superan todas las comprobaciones de hechos (prueba de palabras clave) | 92,7 % | 94,0 % | Diferencia dentro del azar según el autor |
| Longitud media con etiqueta "terse" | 5,1 palabras | no disponible | no disponible |
| Longitud media con etiqueta "chatty" | 16,9 palabras | no disponible | no disponible |
| Longitud media sin etiqueta de longitud | 13,4 palabras | Aproximadamente 13,4 | no disponible |
| Uso de muletilla cuando se proporciona | 15 de 15 personajes | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q5_K_M ocupa 2,91 GB en disco, pero el autor advierte que el tamaño del archivo no equivale a su memoria en ejecución; sin cifra oficial de VRAM pico.
- Ahorro de memoria opcional: `--lazy-mode on` evita mantener en memoria aproximadamente 1,3 GB de la tabla por capa de Gemma, leyéndola fila a fila desde el archivo; el ahorro no se ha medido en máquinas de jugadores.
- Pesos completos: safetensors de 10,21 GB, pensados para reentrenamiento y conversión a otros runtimes, no para despliegue en producción.
- GPU recomendadas: no disponible; las mediciones del autor se realizaron en GPUs NVIDIA en la nube, sin detallar modelo.
- Viabilidad en GPU de consumo: no confirmada oficialmente; el tamaño del archivo sugiere que un modelo cuantizado a Q5_K_M podría caber en GPUs de consumo con suficiente VRAM, pero no hay medición publicada.
- Despliegue: llama.cpp mediante `llama-server` (build b11146 o posterior), con `-c 4096 -np 1 -ngl all --lazy-mode on`; si se embebe llama.cpp, `lazy_mode = LLAMA_LAZY_MODE_ON` en `llama_model_params`. Otros runtimes pueden no ofrecer esta opción.
- Latencia y throughput: no disponibles; el autor solo indica que el ejemplo se ejecutó en CPU con llama.cpp b11146.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SpellSpeak Glyph 2B (RC2) | 5,1B totales; ~1,9B en el modelo de texto | 4.096 tokens | Apache 2.0 | Diálogo de NPC en una línea, voz por palabras clave, sin herramientas |
| SpellSpeak Sigil 4B | no disponible | no disponible | no disponible | Versión mayor del mismo proyecto, mismo enfoque de diálogo de personajes |
| google/gemma-4-E2B-it | no disponible en la información proporcionada | no disponible | no disponible | Modelo base multimodal de propósito general; Glyph 2B es un derivado ajustado |

La información disponible no incluye datos de benchmarks ni especificaciones completas de los modelos alternativos, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es una versión alpha: las mediciones se han hecho en GPUs NVIDIA en la nube, no en máquinas de jugadores.
- Solo admite inglés; no hay soporte documentado de otros idiomas.
- No dispone de tool calling ni de razonamiento multi-paso explícito; cualquier acción del mundo debe validarla y ejecutarla el motor del juego.
- El prompt debe seguir la plantilla exacta de entrenamiento (marcadores de turno de Gemma, `Voice: <keywords>.`, parada en `<turn|>`); otras disposiciones no han sido probadas y pueden degradar la calidad.
- La decodificación de referencia es greedy (`temperature` 0, `top_k` 1); no se documenta el comportamiento con muestreo.
- Riesgo de alucinación mitigado pero no eliminado: el 92,7 % de respuestas superan las comprobaciones de hechos en la prueba del autor, lo que implica que una parte no las supera.
- Las palabras clave de voz deben pertenecer al vocabulario entrenado; el uso de etiquetas fuera de esa lista no está garantizado.
- El ahorro de memoria de `--lazy-mode on` no se ha medido en hardware de consumo y puede no estar disponible en runtimes distintos de llama.cpp.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base google/gemma-4-E2B-it, cuyos términos específicos no se detallan en la información proporcionada.
- No se han publicado sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jptaylor/glyph-2b
- Modelo mayor del proyecto: https://huggingface.co/jptaylor/spellspeak-sigil-4b
- Ejemplos y código fuente: https://github.com/spellspeak/models/tree/main/glyph
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
