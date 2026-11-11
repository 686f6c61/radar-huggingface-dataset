# nberezny/act_franka_pick_place_hyb_dense

## Resumen

`act_franka_pick_place_hyb_dense` es una política de imitación basada en Action Chunking with Transformers (ACT), publicada por el usuario nberezny en Hugging Face Hub mediante la librería LeRobot. El modelo resuelve una tarea robótica concreta de manipulación pick-and-place sobre un robot Franka Panda simulado: coger un cubo rojo y colocarlo sobre una casilla azul. No es un modelo de lenguaje ni un modelo fundacional generalista, sino un controlador visomotor entrenado con 1200 episodios de teleoperación (40 423 fotogramas a 20 FPS) que consume dos cámaras RGB y un vector de estado de 27 dimensiones para producir acciones de 10 dimensiones.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible, con 51,6 millones de parámetros y pesos en safetensors, que sirve como ejemplo canónico de cómo se entrena y despliega una política ACT en LeRobot 0.7.0. La model card no aporta resultados de evaluación, licencia ni idiomas soportados, por lo que su utilidad en producción fuera del entorno simulado descrito es limitada.

Arquitectónicamente sigue el método ACT del paper arXiv:2304.13705, que predice trozos de acción (*action chunks*) en lugar de pasos individuales, reduciendo el error de compounding y permitiendo un control más estable en tareas de contacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parametros totales | 51.602.058 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal definida por el chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje, solo instrucción textual fija en la tarea) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `franka_panda_sim_hybrid_dense_rel` |
| Cámaras de entrada | `overhead`, `wrist` (ambas 3×240×320) |
| Vector de estado | 27 dimensiones |
| Salida de acción | 10 dimensiones |
| Dataset de entrenamiento | `nberezny/franka_pick_place_hyb_dense` (1200 episodios, 40 423 frames, 20 FPS) |
| Tarea | "Pick up the red cube and place it on the blue square." |
| Pasos de entrenamiento | 100 000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |
| Tamaño del repo | 0.8 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa dos cámaras: vista cenital y vista de muñeca), un codificador del estado propioceptivo de 27 dimensiones y un decodificador transformer que emite un chunk de acciones de 10 dimensiones. La innovación central del método es la predicción de secuencias cortas de acciones en lugar de acciones individuales, lo que mitiga el problema de *compounding errors* típico de las políticas reactivas y facilita la ejecución de trayectorias con contacto físico. El modelo se entrenó con 100 000 pasos, batch de 8, AdamW y learning rate 1e-05, sobre 1200 episodios teleoperados (40 423 frames a 20 FPS) del dataset `franka_pick_place_hyb_dense`.

No se documenta en la información disponible si hubo aumento de datos, variaciones de iluminación, posiciones aleatorias de objetos o composición detallada del dataset más allá del conteo de episodios y frames. Tampoco se especifica la dimensión del espacio latente, el número de capas del transformer ni la configuración exacta del chunk (típicamente 100 en ACT, pero no confirmado aquí). El sufijo `hyb_dense_rel` en el tipo de robot sugiere un esquema híbrido de acciones densas y relativas, aunque la model card no lo detalla.

## Capacidades

- Control visomotor para manipulación pick-and-place sobre robot Franka Panda simulado.
- Fusión de dos vistas RGB (cenital y de muñeca) con estado propioceptivo de 27 dimensiones.
- Predicción de chunks de acción de 10 dimensiones para control estable en tareas de contacto.
- Ejecución de una única tarea instruida en lenguaje natural fijo: "Pick up the red cube and place it on the blue square."
- Despliegue mediante `lerobot-rollout` con estrategia `base` (sin grabación de episodios).
- Reentrenamiento reproducible con `lerobot-train` usando `--policy.type=act`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni capacidades multilingües.
- No dispone de modo *thinking*, visión general, audio ni procesamiento de lenguaje libre.

## Casos de uso

- **Reproducción de experimentos ACT en simulación**: cargar la política con `lerobot-rollout` sobre el robot `franka_panda_sim_hybrid_dense_rel` y verificar el pipeline completo de LeRobot 0.7.0, útil como baseline docente o de validación de infraestructura.
- **Punto de partida para fine-tuning en pick-and-place**: reentrenar con `lerobot-train` sobre un dataset propio de Franka para adaptar la política a nuevas posiciones de cubo o colores, aprovechando los 100 000 pasos ya realizados como inicialización.
- **Benchmark interno de políticas de imitación**: comparar la estabilidad de chunks de acción frente a políticas reactivas en tareas de contacto, usando esta política como referencia reproducible.
- **Pruebas de integración de hardware**: validar la cadena cámara → observación → política → acción en un Franka real o simulado antes de invertir en datasets propios, dado que la model card documenta formas exactas de entrada y salida.
- **Docencia en robótica de imitación**: ilustrar el flujo completo de LeRobot (instalación, calibración, grabación, entrenamiento y rollout) con un ejemplo de 0,8 GB que cabe en cualquier equipo.
- **Investigación en chunking de acciones**: analizar el efecto del tamaño de chunk y del estado de 27 dimensiones en la tasa de éxito de pick-and-place, reutilizando la configuración de entrenamiento documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No se dispone de tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (51,6 M parámetros en safetensors) es esperable que quepa en GPUs consumer, pero no se confirma.
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica una GPU NVIDIA, sin modelo concreto.
- Compatibilidad con GPU consumer: no confirmada oficialmente; el tamaño del repo (0,8 GB) sugiere que cabría en tarjetas de gama media, pero es una inferencia, no un dato del autor.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` con `--policy.type=act`, ambos de la librería LeRobot 0.7.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. La frecuencia de entrenamiento fue de 20 FPS, pero no se reporta latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas ACT, Diffusion Policy, VQ-BeT ni modelos equivalentes de LeRobot Hub. Cualquier comparación numérica requeriría datos de evaluación que el autor no ha publicado.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasa de éxito ni número de ensayos, por lo que no se puede afirmar que la política funcione de forma fiable ni siquiera en el entorno simulado descrito.
- **Tarea única y cerrada**: solo ejecuta "Pick up the red cube and place it on the blue square."; no generaliza a otras instrucciones ni objetos.
- **Dependencia del entorno simulado**: el tipo de robot `franka_panda_sim_hybrid_dense_rel` sugiere simulación; no se documenta transferencia a un Franka real.
- **Licencia no disponible**: no se puede determinar si el uso comercial está permitido; tratar como no apto para producción hasta aclaración del autor.
- **Sesgos de dataset**: al entrenarse con 1200 episodios teleoperados por el autor, hereda los sesgos de posicionamiento, iluminación y estilo de manipulación de esa grabación; no se documenta variabilidad.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de distribución (objetos en posiciones no vistas, oclusiones, cambios de iluminación).
- **Idiomas**: no aplica; la instrucción de tarea es fija y en inglés.
- **Caveat de producción**: 0 descargas y 0 likes en el momento de la ficha, creado y actualizado el mismo día (2026-11-11), sin señales de validación por la comunidad.
- **Sin cuantizaciones documentadas**: no se indican versiones GGUF, INT8 ni INT4, lo que limita el despliegue en hardware de bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_franka_pick_place_hyb_dense
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_hyb_dense
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_hyb_dense
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
