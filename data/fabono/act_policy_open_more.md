# fabono/act_policy_open_more

## Resumen

`fabono/act_policy_open_more` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705 (Zhao et al., 2023). El modelo ha sido entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (estado articular de 6 dimensiones más dos cámaras RGB de 480x640) a comandos de acción de 6 dimensiones.

El modelo resuelve una tarea concreta y muy acotada: abrir un poco más un cajón con asa amarilla ("A little bit more opening of the drawer with the yellow handle"). Se entrenó con 30 episodios de teleoperación (11.525 fotogramas a 30 FPS) sobre un robot tipo `so_follower`, con cámaras en muñeca y vista cenital. Con 51,7 millones de parámetros y un repo de 0,2 GB, es un modelo pequeño orientado a despliegue en hardware de consumo.

Su relevancia es la de un ejemplo reproducible de pipeline completo de aprendizaje por imitación con LeRobot 0.6.1: captura de datos, entrenamiento de una política ACT y despliegue con `lerobot-rollout`. No obstante, al no incluir resultados de evaluación en robot real, su utilidad práctica queda limitada a la reproducción del flujo de trabajo y a la experimentación, no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; recibe una instrucción de tarea como texto en el rollout) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La política consume `observation.state` (vector de 6 dimensiones), dos imágenes RGB de 480x640 (`wrist` y `top`) y produce un vector de acción de 6 dimensiones. El entrenamiento se realizó con LeRobot 0.6.1, optimizador AdamW, learning rate 1e-05, batch size 16, semilla 1000 y 40.000 pasos sobre 30 episodios y 11.525 fotogramas a 30 FPS del dataset `fabono/little_bit_drawer_opening_20261029_144601`.

No se documenta en la model card el número de tokens de entrenamiento (no aplica), la composición del dataset más allá de los episodios y fotogramas indicados, ni si hubo RLHF/DPO (no procede en aprendizaje por imitación). Tampoco se detallan innovaciones técnicas adicionales más allá del propio método ACT (chunking de acciones). El robot objetivo es `so_follower`, con cámaras `wrist` y `top`.

## Capacidades

- Control visomotor para una tarea de manipulación concreta: abrir un poco más un cajón con asa amarilla.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado articular e imágenes.
- Entrada multimodal: estado propioceptivo (6,) y dos cámaras RGB (3, 480, 640).
- Ejecución en robot real mediante `lerobot-rollout` con `--strategy.type=base`.
- Entrenamiento reproducible con `lerobot-train` y `--policy.type=act`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Reproducción del pipeline de aprendizaje por imitación: usar el repo como referencia para entrenar una política ACT con LeRobot sobre un dataset propio de 30 episodios y 11.525 fotogramas, validando la configuración (AdamW, lr 1e-05, batch 16, 40.000 pasos).
- Despliegue de referencia en robot `so_follower`: ejecutar `lerobot-rollout` con las cámaras `wrist` y `top` para verificar la integración hardware-software antes de entrenar tareas propias.
- Benchmark interno de políticas pequeñas: con 51,7 M de parámetros y 0,2 GB, sirve como línea base de bajo coste computacional para comparar variantes de ACT en la misma tarea.
- Docencia y formación en robótica: ejemplo completo y ligero (repo de 0,2 GB) para explicar captura de datos, chunking de acciones y evaluación en robot real.
- Pruebas de calibración de cámaras y puertos: el comando de rollout documentado permite validar índices de cámara, resolución 640x480 a 30 FPS y el puerto del robot antes de escalar a tareas más complejas.
- Prototipado de tareas de manipulación con asa: la política puede adaptarse (reentrenando con nuevos datos) a variantes de apertura de cajones u objetos con asa, manteniendo la misma interfaz de observación y acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni condiciones de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos safetensors de 0,2 GB, la huella en memoria es del orden de cientos de MB, muy por debajo de una GPU de consumo.
- GPU recomendadas: no especificadas en la model card; el comando de entrenamiento usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA. Cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) debería ser suficiente por el tamaño del modelo, aunque no hay confirmación oficial.
- ¿Cabe en GPU consumer? Sí, por tamaño (51,7 M de parámetros, repo de 0,2 GB), aunque no se documentan requisitos mínimos ni latencias.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de la misma categoría (políticas ACT para `so_follower` o tareas de apertura de cajones) con los que comparar parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni ensayos en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- Tarea extremadamente específica: entrenada solo para "abrir un poco más el cajón con asa amarilla"; no generaliza a otras tareas, objetos ni posiciones sin reentrenamiento.
- Dataset pequeño: 30 episodios y 11.525 fotogramas; riesgo alto de sobreajuste y baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- Dependencia del hardware exacto: requiere robot `so_follower` y cámaras `wrist` y `top` con la misma configuración (480x640, 30 FPS); cambios de calibración o montaje pueden degradar el comportamiento.
- Sin capacidades de lenguaje: no procesa instrucciones libres ni mantiene conversaciones; la tarea se pasa como texto fijo en el rollout.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de acciones erráticas o inseguras en robot real al no haber validación publicada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Sesgos conocidos: no documentados; el dataset refleja una única demostración de teleoperación, por lo que hereda los sesgos de esa trayectoria y operador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fabono/act_policy_open_more
- Dataset de entrenamiento: https://huggingface.co/datasets/fabono/little_bit_drawer_opening_20261029_144601
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fabono/little_bit_drawer_opening_20261029_144601
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
