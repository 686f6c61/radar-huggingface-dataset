# knight7024/act_pick_and_place_tape_v3

## Resumen

`act_pick_and_place_tape_v3` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada en el formato de LeRobot. La desarrolla el usuario de HuggingFace `knight7024` y resuelve una tarea concreta de manipulación: coger un objeto y colocarlo en una ubicación objetivo ("pick_and_place_tape"). No es un modelo de lenguaje: es un controlador visuomotor que consume el estado articular del robot y dos cámaras y emite comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un peso de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que se ejecutan en tiempo real sobre hardware de consumo. La entrada combina un vector de estado de 6 dimensiones con dos flujos visuales (cámara superior a 240x320 y cámara de muñeca a 480x640), y la salida es un vector de acción de 6 dimensiones que se predice por chunks en lugar de paso a paso, lo que reduce el error de acumulación típico de las políticas reactivas.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del pipeline de LeRobot: dataset público, configuración de entrenamiento documentada y comando de rollout listo para ejecutar sobre un robot `so_follower`. No hay resultados de evaluación publicados, por lo que debe tratarse como una política experimental y no como un componente validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones por chunks |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |
| Tipo de robot | `so_follower` |
| Cámaras | `top` (3, 240, 320) y `wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | `knight7024/pick_and_place_tape_final` (50 episodios, 16.278 frames, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Optimizador / LR | AdamW / 1e-05 |
| Batch size | 1 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso. La arquitectura combina un codificador de imágenes (típicamente ResNet) para cada cámara, la proyección del estado propioceptivo y un transformer encoder-decoder que genera el chunk de acciones. El objetivo es mitigar el problema de la varianza en la predicción paso a paso y la acumulación de errores en tareas de manipulación de contacto.

El entrenamiento se realizó sobre 50 episodios teleoperados (16.278 frames a 30 FPS) de la tarea "pick_and_place_tape", con 100.000 pasos, batch size 1, AdamW y learning rate 1e-05. No se documenta composición adicional del dataset, aumento de datos, ni fases de RLHF o DPO (no aplicables a este tipo de política). La model card no detalla innovaciones adicionales más allá del chunking de acciones propio del método ACT.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de estado articular y dos vistas de cámara.
- Predicción de chunks de acción, lo que permite ejecutar secuencias cortas coherentes sin recalcular a cada frame.
- Fusión multimodal de dos cámaras (superior y de muñeca) con el estado propioceptivo del robot.
- Ejecución en tiempo real a 30 FPS sobre un robot `so_follower` mediante `lerobot-rollout`.
- Entrenamiento reproducible con `lerobot-train` sobre el dataset público asociado.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Recogida y colocación de objetos en línea de montaje: la política ejecuta la tarea "pick_and_place_tape" sobre un `so_follower`, adecuada para prototipos de automatización de baja complejidad donde el objeto y la posición son estables.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT, cambios de dataset o configuraciones de entrenamiento con LeRobot 0.6.1.
- Docencia y formación en robótica: el pipeline completo (dataset, entrenamiento, rollout) permite a estudiantes recorrer el ciclo de imitación con hardware de bajo coste.
- Base para fine-tuning en tareas similares: al ser una política ligera (51,7 M de parámetros) y con licencia Apache 2.0, se puede reentrenar sobre nuevos datasets de pick-and-place con requisitos de cómputo modestos.
- Pruebas de integración de LeRobot: útil para validar la cadena `lerobot-rollout` con cámaras OpenCV, calibración y puertos serie antes de desplegar políticas más complejas.
- Benchmark interno de éxito en manipulación: aunque no hay tasas publicadas, el modelo permite medir éxito por ensayos en un entorno controlado y comparar contra nuevas versiones del mismo autor.
- Prototipado de agarre con cámara de muñeca: la resolución 480x640 del flujo `wrist` permite experimentar con percepción cercana al efector en tareas de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (51,7 M de parámetros, repositorio de 0,2 GB), es esperable que quepa en GPUs de consumo, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda` sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado oficialmente; el tamaño de pesos y la resolución de las cámaras sugieren que sí en tarjetas con suficiente memoria, pero es una inferencia, no un dato del autor.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` con `policy.type=act`, según la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS y el rollout se plantea a esa frecuencia, pero no se publican métricas de latencia por chunk ni de throughput.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otras políticas comparables (por ejemplo, variantes de Diffusion Policy, VQ-BeT o π0) con parámetros, contexto, rendimiento y licencia verificables. Se indica "no disponible" para evitar comparaciones sin respaldo.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_and_place_tape_v3 | 51,7 M | no disponible | sin evaluación publicada | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara que no hay resultados de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- Especialización estrecha: entrenada solo para "pick_and_place_tape" con 50 episodios; no generaliza a otras tareas, objetos o posiciones sin reentrenamiento.
- Dependencia del hardware: requiere un robot `so_follower` y cámaras con los nombres y resoluciones exactos (`top` 240x320, `wrist` 480x640); cualquier cambio de montaje o calibración degrada el comportamiento.
- Dataset pequeño: 16.278 frames y 50 episodios son insuficientes para cubrir variaciones de iluminación, distractores o posiciones nuevas; riesgo alto de sobreajuste al entorno de grabación.
- Sin datos sobre sesgos: no se documentan sesgos, pero al ser una política de imitación hereda los sesgos y la distribución del dataset de teleoperación.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de acciones erráticas fuera de distribución que pueden provocar colisiones; se recomienda supervisión y límites de seguridad en el robot.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación y de garantías hace desaconsejable su uso en producción sin una evaluación propia extensa.
- Sin soporte multilingüe ni de texto: no debe confundirse con un modelo de lenguaje pese a estar alojado en HuggingFace con pipeline `robotics`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/knight7024/act_pick_and_place_tape_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_tape_final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_tape_final
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
