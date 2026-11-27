# JamieBradfield/qwen3.8-9b-hermes-fc-todo

## Resumen

Qwen3.8-9B Hermes FC — Todo es un ajuste fino por QLoRA del modelo Empero/Qwen3.8-9B-Distill, publicado por JamieBradfield bajo licencia Apache-2.0. El objetivo declarado del autor es enseñar mediante SFT (supervised fine-tuning) un comportamiento de planificación "todo-first" en tareas interactivas de múltiples pasos, es decir, que el modelo invoque de forma autónoma una herramienta de lista de tareas (`todo`) antes de abordar tareas complejas. El checkpoint se construye sobre un "warm start" de una versión anterior (v26, `qwen3.8-9b-hermes-fc-balanced`) y añade 1.706 filas en formato ShareGPT con 393 llamadas a la herramienta `todo`.

La relevancia del modelo no reside tanto en su rendimiento absoluto como en su valor documental: el autor publica un addendum en el que reconoce un error metodológico en la evaluación original y demuestra que el modelo base ya llamaba correctamente a herramientas por la vía nativa de OpenAI (`tools`), algo que su arnés sintético no medía. El fine-tune aporta una mejora real en planificación todo-first (de 3/10 a 8/10 en una batería de sondas), pero a costa de regresiones en moderación (sobre-disparo de herramientas en consultas triviales). El programa de fine-tuning quedó congelado el 2026-09-03.

Arquitectónicamente es un transformer denso de 9.195.119.616 parámetros (9,20B), con vocabulario ampliado de 248.077 a 248.079 tokens para incluir `<|tool_call|>` y `<|tool_response|>`, y conserva la cabeza MTP (multi-token prediction) de 15 claves del modelo base. La torre visual fue eliminada: es un modelo solo de texto pese a heredar la clase `Qwen3_5ForConditionalGeneration`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (clase `Qwen3_5ForConditionalGeneration`, torre visual eliminada, cabeza MTP de 15 claves conservada) |
| Parametros totales | 9.195.119.616 (9,20B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; la configuracion de servicio de referencia usa `CTX=65536` |
| Tipos de cuantizacion | BF16 (merge completo); GGUF cuantizado ROCmFPX en repo complementario |
| Idiomas soportados | en (solo ingles declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (12-13 shards, 18,4-18,9 GB) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de `empero-ai/Qwen3.8-9B-Distill` (Apache-2.0), un transformer denso de 9,2B parámetros. El ajuste se realiza en dos fases documentadas: un warm start sobre los pesos fusionados de la version v26 (`qwen3.8-9b-hermes-fc-balanced`), que ya incorpora el sobre Hermes y los tokens de herramienta, y sobre el que se aplica un adaptador QLoRA de 4 bits con rango 16, alpha 16, dropout 0, batch 1 con acumulacion de gradiente 8 (efectivo 8), learning rate 2e-4, warmup 0,1 y `MAX_SEQ` de 6144. El entrenamiento completo son 214 pasos (1 epoca) con perdida final de 0,1822. El vocabulario se amplia en dos tokens especiales: `<|tool_call|>` y `<|tool_response|>`.

Los datos de entrenamiento son 1.706 filas en formato ShareGPT con 393 llamadas a `todo`, compuestas por 1.543 filas de la version v26 (trayectorias reales de Hermes, SWE-rebench, APIGen y When2Call), 72 filas de bucles `todo` reales procedentes de trazas del agente DJLougen con sobres XML nativos de Hermes y bucles de validacion-mutacion-verificacion, 72 filas con system prompt condensado (un stub de ~90 tokens en lugar del prompt completo de 6,3K-25,9K caracteres) y 19 filas de relleno de huecos que combinan `todo` con `session_search`, `lcm_recall` y `lcm_grep`. El merge final en BF16 ocupa 18,4 GB en 12 shards.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de plantilla de chat estilo Hermes.
- Llamada a funciones y uso de herramientas mediante sobres XML nativos de Hermes (`<tool_call>`, `<tool_response>`) y mediante el parametro nativo `tools` de la API de OpenAI.
- Planificacion "todo-first": invocacion autonoma de una herramienta de lista de tareas antes de abordar tareas de multiples pasos.
- Bucles de agente con retroalimentacion validar-mutar-verificar sobre el estado de la lista de tareas.
- Combinacion de la herramienta `todo` con herramientas de recuperacion de contexto de sesion (`session_search`, `lcm_recall`, `lcm_grep`).
- Razonamiento de cadena corta destilado en 61 de las filas de entrenamiento de la version v28.
- Tareas de busqueda web sinteticas (12 tareas, primera senal web del linaje).
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Vision: no disponible (torre visual eliminada en el merge).

## Casos de uso

- Orquestacion de agentes con planificacion explicita: el modelo puede descomponer una tarea de multiples pasos en una lista de tareas estructurada antes de ejecutar acciones, lo que facilita la trazabilidad y la recuperacion ante fallos en pipelines de agentes.
- Automatizacion de tareas de ingenieria de software: el entrenamiento incluye datos de SWE-rebench y trayectorias de Hermes, por lo que puede integrarse en flujos de resolucion de issues con llamadas a herramientas de edicion y ejecucion de codigo.
- Investigacion sobre SFT y uso de herramientas: sirve como artefacto reproducible para estudiar como el ajuste supervisado modifica la politica de invocacion de herramientas, incluido el fenomeno de sobre-disparo documentado por el autor.
- Construccion de asistentes con memoria de sesion: la combinacion de `todo` con `session_search` y `lcm_recall` permite mantener estado entre turnos en conversaciones largas, aunque el contexto maximo no esta documentado en la model card.
- Despliegue local en hardware de consumo: al ser un modelo de 9,2B con version GGUF, puede ejecutarse con llama.cpp u Ollama en GPUs de consumo con cuantizacion agresiva, util para prototipado sin coste de API.
- Evaluacion de arneses de herramientas: el addendum del autor lo convierte en un caso de estudio util para validar que un banco de pruebas mide la interfaz nativa (`tools`) y no una interfaz sintetica con esquemas incrustados en el prompt de sistema.
- Generacion de trazas sinteticas de agentes: el modelo puede emplearse como generador de trayectorias etiquetadas para alimentar posteriores ciclos de destilacion o evaluacion.

## Benchmarks y rendimiento

La model card no presenta benchmarks estandar (MMLU, HumanEval, GSM8K). El autor publica una bateria propia de sondas de la herramienta `todo` (greedy, 4 herramientas, interfaz nativa `tools`) con la siguiente comparacion corregida:

| Modelo | Tier-1 disparado | Tier-1 nombre=todo | Tier-2 todo-first | Tier-3 disparado (deseado 0) | Tier-4 disparado (deseado 0) |
|---|---|---|---|---|---|
| Base sin fine-tune | 18/20 | 17/20 | 3/10 | 5/10 | 0/10 |
| v28 ckpt-175 (este modelo) | 17/20 | 10/20 | 8/10 | 9/10 | 4/10 |
| armB2-175 (reentrenamiento limpio) | 10/20 | 8/20 | 10/10 | 4/10 | 0/10 |

El autor concluye que la unica capacidad realmente anadida por el linaje es la planificacion todo-first en tareas de multiples pasos (3/10 en el base, 8/10 en este checkpoint, 10/10 en armB2), con regresiones en moderacion: el sobre-disparo en el tier-3 sube de 5/10 a 9/10 y la deriva de herramientas en preguntas triviales del tier-4 pasa de 0/10 a 4/10. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,4 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica requiere GPUs de 24 GB o superiores.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB; en 4 bits, en torno a 5-6 GB (estimacion a partir del numero de parametros, no confirmada en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4090 o GPUs de 12-16 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: si, en formato GGUF cuantizado (4-8 bits) sobre RTX 3090, RTX 4090 o equivalentes con 16-24 GB de VRAM.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp u Ollama mediante el GGUF del repo complementario; vLLM y TGI no estan confirmados en la informacion disponible.
- Configuracion de servicio de referencia: `CTX=65536` para reproducir la bateria de sondas nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-9B Hermes FC — Todo | 9,20B | no disponible (servicio a 65.536) | SFT QLoRA para planificacion todo-first | Apache-2.0 | Hugging Face, GGUF complementario |
| empero-ai/Qwen3.8-9B-Distill (base) | 9,20B | no disponible | Modelo base sin ajuste de herramientas | Apache-2.0 | Hugging Face |
| qwen3.8-9b-hermes-fc-balanced (v26) | 9,20B | no disponible | Predecesor, warm start de este checkpoint | Apache-2.0 | Hugging Face |
| armB2-175 (reentrenamiento limpio) | 9,20B | no disponible | Variante con mejor planificacion y menos sobre-disparo | no disponible | no disponible |

No se dispone de comparaciones con modelos de proposito general de tamano similar (por ejemplo, variantes de 7-9B de otras familias) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de sobre-disparo de herramientas: el tier-3 pasa de 5/10 en el base a 9/10 en este checkpoint, y el tier-4 de 0/10 a 4/10, lo que puede provocar invocaciones innecesarias en consultas triviales.
- La evaluacion original del linaje midio una interfaz sintetica (esquemas incrustados en el prompt de sistema, XML crudo requerido) que no coincide con la ruta nativa de Hermes; las cifras de la seccion de evaluacion de la model card deben leerse con esa cautela.
- El autor declara el programa de fine-tuning congelado y el modelo base como opcion por defecto en produccion; este checkpoint se conserva como demostracion y artefacto de investigacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la model card.
- La torre visual fue eliminada, por lo que no admite entradas de imagen pese a la etiqueta `image-text-to-text` del repositorio.
- Licencia Apache-2.0 permite uso comercial, pero no se ofrece ninguna garantia de calidad ni soporte por parte del autor.
- El vocabulario ampliado con dos tokens especiales exige usar la configuracion y el tokenizador del repositorio; herramientas que no la respeten pueden producir resultados incorrectos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-todo
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Modelo base (referencia del autor): https://huggingface.co/Empero/Qwen3.8-9B
- Dataset de la version v28: `hermes-fc-v28-data` (referenciado en la model card, sin URL directa en la informacion disponible)
- Repositorio GGUF complementario: no disponible (referenciado como "companion repo" sin URL)
- Scripts de reproduccion: `scripts/native_battery.py`, `scripts/todo_probes.jsonl`, `scripts/no_drift_probes.jsonl` (incluidos en el repositorio)
- Apoyo al autor: https://ko-fi.com/jamesonbradfield
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
