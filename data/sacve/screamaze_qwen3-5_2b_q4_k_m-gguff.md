# Sacve/Screamaze_Qwen3.5_2B_Q4_K_M.gguff

## Resumen

ARIA es un ajuste fino mediante LoRA de Qwen/Qwen3.5-2B, desarrollado por Sacve para el videojuego "Thuas' Screamaze", un escape room de tipo point-and-click ambientado en el edificio de la escuela THUAS. El modelo actúa como asistente de ayuda dentro del juego: los jugadores formulan preguntas sobre cómo resolver salas y puzles, y ARIA responde en una o dos frases en inglés. El modelo se distribuye fusionado y convertido a GGUF para su uso con llama.cpp, con el objetivo de ejecutarse en hardware modesto dentro del propio juego.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de ajuste fino de un modelo pequeño (1.942.653.248 parámetros, aproximadamente 2B) para una tarea muy acotada con recursos limitados. Por otro, ilustra un patrón de diseño interesante: el modelo no memoriza el contenido del juego, sino que responde a partir de hechos inyectados en el prompt de sistema mediante una búsqueda previa (lookup), lo que reduce el riesgo de alucinación y permite actualizar el conocimiento sin reentrenar.

El modelo base es Qwen3.5-2B, de arquitectura transformer densa (no MoE), con licencia Apache 2.0. La longitud de contexto no está especificada en la información disponible. El repositorio ocupa 6,5 GB e incluye dos ficheros GGUF: una versión Q4_K_M de 1,2 GB usada por el juego y una versión F16 de 3,6 GB para pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-2B) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (1,2 GB) y F16 (3,6 GB) |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 2B parámetros. El adaptador LoRA se fusiona con los pesos del modelo base y posteriormente se convierte a formato GGUF para su ejecución con llama.cpp. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO; la model card solo indica que se entrenó para responder a partir de tres hechos del juego inyectados en el prompt de sistema.

La innovación técnica destacable no está en la arquitectura, sino en el patrón de uso: el modelo fue entrenado para contestar exclusivamente a partir de un contexto de conocimiento recuperado (tres hechos por consulta) y para rechazar peticiones fuera de tema e intentos de inyección de prompt. Además, se recomienda desactivar el modo de razonamiento (`enable_thinking: false`) en llama-server, ya que de lo contrario el modelo escribe su razonamiento en lugar de la respuesta final. Esta instrucción sugiere que el modelo base incorpora un modo de pensamiento ("thinking mode") que debe desactivarse para esta tarea.

## Capacidades

- Generación de texto conversacional breve: respuestas de una o dos frases en inglés.
- Comprensión de preguntas en inglés y alemán, incluyendo erratas y jerga.
- Respuesta fundamentada en hechos inyectados en el prompt de sistema (tres hechos por consulta).
- Rechazo de peticiones fuera de tema ("escríbeme un poema") e intentos de inyección de prompt.
- Respuesta de "no tengo información sobre eso" cuando no dispone de los hechos necesarios.
- No dispone de capacidades de visión, audio, tool calling ni razonamiento multi-paso documentadas en la información disponible.

## Casos de uso

- Asistencia dentro del juego "Thuas' Screamaze": ARIA responde a los jugadores sobre cómo resolver salas y puzles, usando tres hechos recuperados por consulta. Es su caso de uso principal y el que motivó el ajuste fino.
- Ejecución en hardware débil: la versión Q4_K_M (1,2 GB) está pensada para funcionar con aproximadamente 2 GB de RAM, lo que permite integrarla en equipos de jugadores sin GPU dedicada.
- Actualización de conocimiento sin reentrenamiento: al basarse en hechos inyectados en el prompt, el contenido del juego puede modificarse editando la carpeta `aria-runtime` del juego, sin volver a entrenar el modelo.
- Asistente de ayuda acotado en aplicaciones interactivas: el patrón de hechos recuperados más rechazo de fuera de tema es reutilizable en tutoriales, guías interactivas o asistentes de soporte de alcance limitado.
- Filtrado de consultas fuera de dominio: el modelo rechaza peticiones ajenas a la tarea, lo que lo hace adecuado como primera capa en entornos donde no se desea que el asistente responda sobre temas arbitrarios.
- Prototipado de asistentes bilingües inglés-alemán en entornos educativos o de formación, dado su soporte para erratas y jerga en ambos idiomas.
- Base para experimentación con LoRA y GGUF: la versión F16 (3,6 GB) permite probar o continuar el ajuste fino sobre el modelo fusionado.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre 229 preguntas de jugadores no vistas, con tres hechos recuperados por prompt:

| Fichero | Correctas | Hecho o número erróneo | "No lo sé" aunque era respondible | Inventadas |
|---|---|---|---|---|
| `game-f16.gguf` (prueba MLX) | 187 | 19 | 20 | 3 |
| `game-q4_k_m.gguf` | 183 | 25 | 18 | 3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: la versión Q4_K_M (1,2 GB) funciona con aproximadamente 2 GB de RAM según la model card; la versión F16 (3,6 GB) requiere más memoria, aunque no se especifica la cifra exacta.
- GPU recomendadas: no disponible. El modelo está diseñado para ejecutarse en hardware débil, presumiblemente en CPU.
- ¿Cabe en GPU de consumo? Sí, la versión Q4_K_M cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM, aunque no se documenta el rendimiento en GPU.
- Opciones de despliegue: llama.cpp, en particular llama-server (la model card menciona el parámetro `chat_template_kwargs` con `enable_thinking: false`). No se documentan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ARIA (este modelo) | ~2B | no disponible | Apache 2.0 | GGUF | Ajuste LoRA para un juego concreto, bilingüe en/de |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | Apache 2.0 | safetensors | Modelo generalista del que deriva ARIA |
| Alternativas de ~2B para asistentes acotados | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo responde correctamente si se le inyectan los hechos del juego en el prompt de sistema; sin ellos contesta "I don't have any info on that".
- Debe desactivarse el modo de pensamiento (`enable_thinking: false`); en caso contrario, el modelo escribe su razonamiento en lugar de la respuesta.
- El ámbito de conocimiento está limitado a los hechos recuperados; no conoce el juego de memoria.
- En la evaluación, entre 18 y 25 respuestas de 229 fueron "no lo sé" aunque la pregunta era respondible, y entre 19 y 25 incluyeron un hecho o número erróneo, según la cuantización.
- Riesgo de alucinación bajo pero no nulo: se registraron 3 respuestas inventadas de 229 en ambas versiones.
- Idiomas limitados a inglés y alemán; no se documenta soporte de castellano.
- No se documentan sesgos conocidos en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está entrenado para una tarea muy específica y su uso fuera de ese contexto no está evaluado.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sacve/Screamaze_Qwen3.5_2B_Q4_K_M.gguff
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios del juego ni demos adicionales.
