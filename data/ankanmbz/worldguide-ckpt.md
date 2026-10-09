# ankanmbz/WorldGuide-Ckpt

## Resumen

WorldGuide-Ckpt es el checkpoint oficial de WorldGuide, un modelo de mundo (world model) orientado a objetivos y especializado en la ejecucion de tareas procedurales. Lo desarrolla un equipo de la Mohamed bin Zayed University of Artificial Intelligence (MBZUAI), con Ankan Deria como primer autor, junto a Komal Kumar, Hisham Cholakkal, Fahad Shahbaz Khan y Salman Khan. El modelo resuelve el problema de generar la evolucion visual de un procedimiento (por ejemplo, una secuencia de manipulacion o montaje) condicionada a un objetivo, en lugar de generar video generico sin estructura de tarea.

Tecnicamente es un pipeline de image-to-video implementado con la libreria diffusers. El repositorio contiene dos componentes: un transformer de difusion para video (WorldGuide Video DiT, referenciado en el codigo de inferencia como `--action_ckpt`) y un planificador de contexto (WorldGuide ContextPlanner, `--planner_model_path`) ubicado en `text_encoder/llm/`. El recuento real de parametros en safetensors es de 8.647.155.008 (aproximadamente 8,65 mil millones), con un tamano de repositorio de 51,2 GB.

La relevancia actual del modelo radica en su enfoque de inferencia en bucle cerrado con memoria, pensado para ejecutar tareas procedurales paso a paso en lugar de producir un unico clip aislado. Se publica bajo el identificador `ankanmbz/WorldGuide-Ckpt`, esta etiquetado como `world-model`, `video-generation` e `image-to-video`, y solo declara soporte para ingles. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para video, con planificador de contexto basado en LLM |
| Parametros totales | 8.647.155.008 (recuento real en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors sin cuantizaciones declaradas) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria diffusers) |
| Tamano del repositorio | 51,2 GB |
| Pipeline declarado | image-to-video |
| Componentes | `transformer/` (WorldGuide Video DiT) y `text_encoder/llm/` (WorldGuide ContextPlanner) |

## Arquitectura y entrenamiento

La informacion disponible describe WorldGuide como un modelo de mundo dirigido por objetivos para la ejecucion de tareas procedurales, construido sobre un transformer de difusion aplicado a video (denominado WorldGuide Video DiT en el repositorio). El checkpoint se distribuye en dos subdirectorios con funciones diferenciadas: el DiT de video, que recibe la condicion de accion y genera la evolucion visual, y un planificador de contexto (ContextPlanner) alojado en `text_encoder/llm/`, que aporta la planificacion de la tarea. La inferencia se ejecuta en bucle cerrado y con memoria, segun el script oficial `scripts/inference/run_v5_qwen_closed_loop_memory.sh`, lo que sugiere que el planificador esta basado en la familia Qwen, aunque la model card no especifica la version ni el tamano concreto del LLM utilizado.

No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de ajuste por preferencias como RLHF o DPO. Tampoco se documentan innovaciones concretas de atencion (por ejemplo, atencion lineal) ni mecanismos de decodificacion especulativa. Los unicos elementos tecnicos verificables son la estructura de dos componentes, la condicion por accion y el modo de inferencia en bucle cerrado con memoria. El codigo de entrenamiento y los detalles del metodo se remiten a la pagina del proyecto y al repositorio de GitHub.

## Capacidades

- Generacion de video condicionada por imagen (image-to-video) mediante un transformer de difusion.
- Modelado de mundo orientado a objetivos: genera la evolucion de un procedimiento hacia una meta definida, no solo un clip visualmente plausible.
- Condicionamiento por accion, gestionado a traves del checkpoint del DiT de video (`--action_ckpt`).
- Planificacion de contexto y descomposicion de tareas mediante el componente ContextPlanner (`--planner_model_path`).
- Inferencia en bucle cerrado con memoria, adecuada para ejecutar procedimientos por etapas.
- Soporte multilingue: no disponible; la model card solo declara ingles.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode), vision adicional, audio o entrada de voz: no documentado en la informacion disponible.
- Entrada de imagen: si, es un pipeline image-to-video.

## Casos de uso

- Simulacion de tareas de manipulacion robotica: el modelo puede generar la evolucion visual de un procedimiento a partir de un estado inicial en imagen y una accion, lo que permite previsualizar el resultado de una politica antes de ejecutarla en hardware real.
- Planificacion de procedimientos en entornos embodied: gracias al ContextPlanner y a la inferencia en bucle cerrado, se puede descomponer una meta en pasos y generar la secuencia visual de cada uno, comprobando la coherencia entre etapas.
- Generacion de datos sinteticos para aprendizaje por imitacion: los clips generados de tareas procedurales sirven como aumento de datos para entrenar politicas de robotica cuando la recogida de datos reales es costosa.
- Verificacion de factibilidad de planes: dado un objetivo y un estado inicial, el modelo puede producir un rollout visual que un sistema de planificacion use para descartar secuencias fisicamente inconsistentes antes de ejecutarlas.
- Prototipado de asistentes de guiado paso a paso: generacion de demostraciones visuales de procedimientos (montaje, cocina, mantenimiento) a partir de una sola imagen de referencia.
- Investigacion en modelos de mundo: el checkpoint sirve como base para experimentar con condicionamiento por accion, memoria en bucle cerrado y evaluacion de consistencia temporal en video generado.
- Evaluacion comparativa de generacion de video procedural: el propio autor publica un dataset de resultados (`ankanmbz/worldguide-results`) con comparaciones entre modelos, util para reproducir analisis de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card de `ankanmbz/WorldGuide-Ckpt` no incluye tabla de metricas, y los resultados de busqueda solo referencian un dataset de comparacion de modelos (`ankanmbz/worldguide-results`, 684 MB) en el que aparece WorldGuide junto a HunyuanVideo-1.5, sin cifras accesibles en el material proporcionado.

## Requisitos de hardware

Los siguientes valores son estimaciones derivadas del recuento de parametros y del tamano del repositorio; no estan confirmados por el autor.

- VRAM estimada solo para el DiT de video: en torno a 17-18 GB en bf16/fp16 (8,65 mil millones de parametros).
- VRAM estimada para el pipeline completo (DiT + ContextPlanner + VAE de video): del orden de 24-40 GB, con un margen amplio porque las activaciones de video a resoluciones y duraciones altas consumen memoria adicional.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB para ejecucion holgada sin offloading; A100 40 GB o L40S 48 GB como minimo comodo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda al limite; es probable que requiera offloading a CPU o cuantizacion de los componentes auxiliares.
- Opciones de despliegue: al ser un modelo de difusion de video, no aplican vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza mediante la libreria diffusers y los scripts oficiales del repositorio (`download_models.py` y `scripts/inference/run_v5_qwen_closed_loop_memory.sh`).
- Almacenamiento: se necesita espacio para 51,2 GB del checkpoint mas los componentes adicionales que el script de descarga obtiene por separado en `./ckpts`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WorldGuide-Ckpt | Modelo de mundo para video, image-to-video | 8,65 mil millones (DiT) | No disponible | No disponible | Pesos en HuggingFace (diffusers, safetensors) |
| HunyuanVideo-1.5 | Generacion de video | No disponible en la informacion proporcionada | No disponible | No disponible | Referenciado en el dataset de comparacion del autor |
| Otros modelos abiertos de difusion de video | Generacion de video | No disponible | No disponible | No disponible | No verificado en la informacion disponible |

La unica comparacion documentada en el material disponible es la que el propio autor publica en el dataset `ankanmbz/worldguide-results`, donde WorldGuide aparece junto a HunyuanVideo-1.5. No se proporcionan cifras de parametros, contexto ni rendimiento de los modelos comparados, por lo que no es posible establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada no puede asumirse permiso para uso comercial; conviene contactar con los autores antes de cualquier despliegue en produccion.
- Ausencia de benchmarks publicos en la informacion disponible: no hay metricas verificables de calidad, consistencia temporal ni fidelidad a la tarea.
- Idioma: la model card solo declara ingles, por lo que el planificador de contexto y las instrucciones en otros idiomas pueden degradarse.
- Repositorio sin traccion: 0 descargas y 0 likes, con creacion y ultima actualizacion el mismo dia (2026-10-08), lo que indica que el checkpoint es muy reciente y no ha pasado por validacion de la comunidad.
- Riesgo de alucinacion fisica: como modelo generativo de video, puede producir transiciones visualmente plausibles pero fisicamente inconsistentes, especialmente en procedimientos largos.
- Memoria en bucle cerrado: los errores de un paso pueden propagarse a los siguientes, ya que la inferencia reutiliza el estado previo.
- Dependencia del planificador: la calidad del resultado depende en gran medida del ContextPlanner, cuyo tamano, version y comportamiento no se documentan.
- Restricciones de contexto: la longitud de contexto no esta especificada, lo que impide estimar cuantas etapas de una tarea pueden mantenerse en memoria.
- Requisitos de almacenamiento y VRAM elevados (51,2 GB de repositorio), poco adecuados para entornos sin GPU de gama alta.
- Fecha de publicacion futura respecto a la fecha habitual de consulta (2026), lo que debe tenerse en cuenta al evaluar su madurez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ankanmbz/WorldGuide-Ckpt
- Pagina del proyecto: https://mbzuai-oryx.github.io/WorldGuide/
- Repositorio de codigo: https://github.com/mbzuai-oryx/WorldGuide
- Dataset de resultados y comparativas: https://huggingface.co/datasets/ankanmbz/worldguide-results
- Pagina personal del primer autor: https://ankan8145.github.io
- Pagina personal de Komal Kumar: https://komalkumar.org
- Pagina personal de Hisham Cholakkal: https://hishamcholakkal.com
- Pagina personal de Fahad Shahbaz Khan: https://sites.google.com/view/fahadkhans
- Pagina personal de Salman Khan: https://salman-h-khan.github.io
