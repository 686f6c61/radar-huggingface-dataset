# jptaylor/glyph-2b

## Resumen

SpellSpeak Glyph 2B es un modelo de lenguaje afinado para generar una única línea de diálogo de personaje no jugable (NPC) en videojuegos, manteniendo la voz y el conocimiento del personaje según el contexto que le proporciona el motor del juego. Lo desarrolla jptaylor bajo el paraguas del proyecto SpellSpeak y se distribuye en versión alpha (RC1) con licencia Apache 2.0. Deriva de Google Gemma 4 E2B instruct mediante un LoRA fusionado.

El modelo resuelve un problema acotado: el juego decide qué es verdad y entrega al modelo la descripción del personaje, lo que sabe y cree, y la conversación previa; Glyph responde en personaje, admite no saber cuando corresponde, guarda secretos y no rompe la diéresis del mundo. No dispone de herramientas ni razona en voz alta: solo propone una línea de habla en texto plano, lista para síntesis de voz.

Con 5.104.297.539 parámetros totales en safetensors (10,21 GB) y un GGUF Q5_K_M de 2,91 GB, está pensado para ejecutarse en la máquina del jugador. La ventana de contexto recomendada en los ejemplos es de 4096 tokens. Es relevante ahora porque demuestra un patrón de integración de LLM en juegos con presupuesto de memoria y latencia muy ajustado, con métricas propias (GameBench) y soporte explícito para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Google Gemma 4 E2B instruct, con LoRA fusionado) |
| Parametros totales | 5.104.297.539 (safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (configuración de referencia en llama-server) |
| Tipos de cuantizacion | Q5_K_M (GGUF); safetensors en precisión completa |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Glyph 2B parte de Google Gemma 4 E2B instruct y se obtiene fusionando un LoRA entrenado sobre escenas sintéticas generadas en mundos sintéticos. El autor no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de indicar que son escenas sintéticas sobre mundos generados, con tipos de escena presentes en los datos de entrenamiento y otros mundos reservados para evaluación. No se documenta el uso de RLHF o DPO.

La innovación práctica no está en la arquitectura, sino en el contrato de uso: un formato de prompt fijo construido con los marcadores de turno de Gemma (`ActorContext` y `render_prompt` en el directorio `runtime/`), decodificación greedy (`temperature` 0, `top_k` 1) y parada en `<turn|>`. Además, el modelo se distribuye con una opción de llama.cpp (`--lazy-mode on`, o `lazy_mode = LLAMA_LAZY_MODE_ON` si se embebe la librería) que lee la tabla por capas de Gemma fila a fila en lugar de mantener aproximadamente 1,3 GB en memoria. El ahorro se confirmó en una máquina cloud, pero no se ha medido en equipos de jugadores.

## Capacidades

- Generación de una línea de diálogo de personaje en texto plano, sin marcado, emotes ni acotaciones, lista para síntesis de voz.
- Respuesta en personaje a partir de lore fiable inyectado en el prompt y del historial de conversación.
- Expresión de desconocimiento cuando la pregunta queda fuera de lo que el personaje sabe o cree.
- Retención de secretos del personaje y coherencia con el mundo ficticio.
- Gestión de conversaciones de grupo y de preguntas dirigidas a un personaje dentro de un grupo.
- Propuesta de intercambios comerciales (el juego es quien los confirma; el modelo no ejecuta acciones).
- Ejecución de múltiples personajes con un solo modelo, manteniendo el contexto de cada personaje en su propia sesión.
- No soporta tool calling ni function calling, ni razonamiento multi-paso explícito, ni visión, audio o modo de pensamiento.

## Casos de uso

- Diálogo de NPC en juegos de rol: el motor envía la descripción del personaje, su conocimiento y el historial; el modelo devuelve una línea en voz del personaje, adecuada por su latencia de primera palabra (42 ms de mediana en líneas de seguimiento sobre una NVIDIA L4).
- Atención al cliente diegética en mundos persistentes: comerciantes y taberneros responden sobre precios y servicios del mundo con el lore inyectado, evitando inventar hechos que el juego no ha declarado.
- Generación de voz en agentes conversacionales: la salida en texto plano sin marcado se envía directamente a un TTS, lo que simplifica el pipeline frente a modelos que emiten acotaciones.
- Interacción con multitudes de NPC: un solo modelo atiende a varios personajes en sesiones separadas; el autor midió cinco personajes simultáneos en una L4 con 2,15 GB de VRAM.
- Diálogo de secretos y facciones: el modelo retiene información confidencial del personaje (99% en la prueba de secretos de GameBench), útil para tramas de intriga donde el motor controla qué se revela.
- Despliegue local en la máquina del jugador: el GGUF Q5_K_M de 2,91 GB con 2,15 GB de VRAM en GPU y 3,60 GB de memoria host tras la carga permite integrarlo en juegos de PC con llama.cpp.
- Prototipado rápido de personajes: el código de referencia en `runtime/` y `example.py` permiten validar el comportamiento de un personaje antes de escribir el sistema de diálogo completo.

## Benchmarks y rendimiento

Resultados de GameBench (5.526 escenas, juez LLM o comprobación de respuesta fija, una ejecución por archivo, greedy). "Untouched" es Gemma 4 E2B instruct de Google a precisión completa con un prompt largo escrito a mano.

| Prueba (escenas) | Glyph 2B, Q5_K_M | Gemma 4 E2B sin tocar |
|---|---:|---:|
| Escenas centrales (309) | 66% (205) | 61% (189) |
| Mundos no vistos (1.000) | 87% (867) | 66% (662) |
| Historia y ambientación (103) | 64% (66) | 59% (61) |
| Preguntas en grupo (1.500) | 98% (1.465) | 76% (1.140) |
| Escenas de grupo (1.360) | 90% (1.224) | 58% (790) |
| Intercambios (576) | 67% (385) | 37% (215) |
| Números grandes (232) | 40% (93) | 34% (79) |
| Guarda secretos (246) | 99% (244) | 26% (64) |
| Deja escapar secretos (164) | 92% (151) | 93% (153) |
| Bajo presión (36) | 89% (32) | 64% (23) |
| Media de las diez | 79,2% | 57,5% |

Rendimiento medido en una NVIDIA L4 en la nube, llama.cpp b11146, todas las capas en GPU, cinco personajes a la vez, una ejecución:

| Métrica | Q5_K_M |
|---|---:|
| Tamaño de archivo | 2,91 GB |
| Memoria de GPU | 2,15 GB |
| Memoria host tras la carga (modo por defecto) | 3,60 GB (unos 2 GB son runtime y librerías de GPU) |
| Primera palabra, personaje nuevo (mediana) | 86 ms |
| Primera palabra, línea de seguimiento (mediana) | 42 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: 2,15 GB con el GGUF Q5_K_M y todas las capas en GPU, medido en una NVIDIA L4.
- Memoria host tras la carga en modo por defecto: 3,60 GB, de los cuales unos 2 GB corresponden al runtime y las librerías de GPU; `--lazy-mode on` evita mantener aproximadamente 1,3 GB de la tabla por capas de Gemma en memoria.
- GPU recomendadas: el autor solo ha medido en NVIDIA L4 en la nube; no hay datos publicados para A100, H100 o RTX 4090.
- Cabe en GPU de consumo por el tamaño de VRAM, pero el autor no ha medido el rendimiento en GPU de consumo ni en CPU de jugadores.
- Opciones de despliegue: llama.cpp (requiere `llama-server` build b11146 o posterior); otros runtimes no están probados y pueden no ofrecer la opción de modo perezoso.
- Latencia medida: 86 ms hasta la primera palabra con personaje nuevo y 42 ms en líneas de seguimiento (mediana, L4, cinco personajes concurrentes). No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpellSpeak Glyph 2B | 5.104.297.539 (safetensors); GGUF Q5_K_M 2,91 GB | 4096 tokens (configuración de referencia) | Diálogo de NPC en juegos, una línea por turno | apache-2.0 | Hugging Face (GGUF y safetensors) |
| SpellSpeak Sigil 4B | no disponible | no disponible | Misma tarea, tamaño mayor | no disponible | Hugging Face (jptaylor/sigil-4b) |
| Google Gemma 4 E2B instruct | no disponible | no disponible | Modelo instruct generalista, base del afinado | no disponible | Hugging Face (google/gemma-4-E2B-it) |

No se dispone de datos de benchmarks de Sigil 4B ni de otros modelos comparables en la información proporcionada; la comparación cuantitativa solo existe frente a Gemma 4 E2B sin tocar en GameBench (ver tabla anterior).

## Limitaciones y advertencias

- Es una alpha (RC1): no se ha probado en máquinas de jugadores; las GPU y CPU de consumo no están medidas.
- Los números son difíciles para el modelo: solo supera el 40% de la prueba de números grandes; el juego debe decir precios y sumas cuando importen.
- En escenas centrales escritas a mano acierta el 66%, es decir, aproximadamente una línea de cada tres tiene un fallo que el juez puede identificar.
- Solo inglés; todas las métricas son de texto.
- El juez de GameBench es un modelo de lenguaje, con una sola pasada y sus propios puntos ciegos.
- Los resultados varían entre ejecuciones de entrenamiento; cada cifra procede de un único modelo entrenado.
- Las conversaciones largas no están evaluadas en el benchmark.
- El modelo puede ser sacado de personaje; no es un sistema de seguridad, por lo que conviene filtrar lo que escriben los jugadores y lo que el modelo responde según los requisitos del juego.
- No dispone de herramientas ni de razonamiento explícito: cualquier acción del mundo debe confirmarla el motor del juego.
- El formato de prompt está fijado por el entrenamiento; otras disposiciones no han sido probadas.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Gemma 4 E2B instruct, no indicada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jptaylor/glyph-2b
- Modelo hermano SpellSpeak Sigil 4B: https://huggingface.co/jptaylor/sigil-4b
- Ejemplos y código fuente: https://github.com/spellspeak/models/tree/main/glyph
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
