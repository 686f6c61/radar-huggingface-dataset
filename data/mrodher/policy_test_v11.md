# mrodher/policy_test_V11

## Resumen

`mrodher/policy_test_V11` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), el método presentado por Zhao et al. en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de control robótico que consume observaciones (estado articular de 6 dimensiones y dos cámaras RGB de 480x640) y produce acciones de 6 dimensiones para un robot tipo `so_follower` (SO-101). Ha sido entrenado y publicado con LeRobot 0.6.2, la librería de Hugging Face para robótica real.

El modelo resuelve una tarea concreta de manipulación: "put the beige piece on the aruco" (colocar la pieza beige sobre el marcador ArUco). Se entrenó con 50 episodios teleoperados (19.789 frames a 30 FPS) durante 20.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5. Su relevancia es la de un artefacto de referencia: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) y sirve como plantilla reproducible para políticas de imitación en robots de bajo coste.

El checkpoint contiene 51.668.614 parámetros en formato safetensors y ocupa 0,2 GB en el repositorio. No se han publicado resultados de evaluación en robot real, ni licencia, ni idiomas soportados (no aplica en el sentido habitual de un LLM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política, no documentada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitación que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de compounding y permite un control más suave. La arquitectura combina un codificador de imágenes (procesa `observation.images.top` y `observation.images.wrist`, ambas 3x480x640) con un transformer que fusiona las features visuales y el estado articular (`observation.state`, shape (6,)) para emitir una secuencia de acciones de shape (6,) por paso. El checkpoint tiene 51,7 M de parámetros, coherente con la escala típica de ACT para robots de sobremesa.

El entrenamiento se realizó sobre el dataset `mrodher/so101_dataset_test_V11_20261117_122059`: 50 episodios, 19.789 frames a 30 FPS, una única tarea. Configuración: 20.000 pasos, batch size 8, AdamW, learning rate 1e-5, semilla 1000, LeRobot 0.6.2. No se documenta composición del dataset más allá de la tarea, ni si hubo aumento de datos, RLHF/DPO (no aplica en imitación) u otras innovaciones técnicas.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` (SO-101).
- Percepción visual multimodal: procesa simultáneamente dos cámaras (vista superior y muñeca) a 480x640.
- Aprendizaje por imitación de una tarea específica: "put the beige piece on the aruco".
- Predicción de chunks de acción (no paso a paso), lo que favorece la estabilidad del movimiento.
- Integración con el ecosistema LeRobot: despliegue mediante `lerobot-rollout`, entrenamiento mediante `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Manipulación pick-and-place de precisión: colocar una pieza sobre un marcador ArUco, tarea para la que fue entrenado; útil como base para líneas de montaje de bajo coste con SO-101.
- Prototipado de políticas de imitación: sirve como referencia reproducible para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas propias.
- Investigación en aprendizaje por imitación: permite comparar ACT frente a otros métodos (Diffusion Policy, VQ-BeT) sobre un dataset pequeño y bien documentado.
- Educación y formación en robótica: ejemplo didáctico de entrenamiento con 50 episodios y 20.000 pasos, asequible en hardware de consumo.
- Automatización de tareas repetitivas de laboratorio: colocar objetos sobre referencias visuales (ArUco) en entornos controlados con iluminación estable.
- Base para fine-tuning: punto de partida para reentrenar ACT sobre nuevas tareas con el mismo robot y configuración de cámaras.
- Validación de calibración de robots SO-101: la política solo funciona si la calibración y los índices de cámara coinciden con los del entrenamiento, por lo que sirve como test de puesta a punto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito en robot real, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros, el checkpoint en safetensors ocupa 0,2 GB y la inferencia es viable en GPUs de consumo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; el entrenamiento se realizó con `--policy.device=cuda`, sin especificar modelo de GPU.
- Cabe en GPU de consumo: probablemente sí (checkpoint de 0,2 GB), aunque no se documenta el modelo concreto ni los requisitos de memoria del pipeline de inferencia con dos cámaras.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; entrenamiento con `lerobot-train`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a robótica).
- Latencia y throughput: no disponible; el control opera a 30 FPS según el dataset, pero no se reporta latencia medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mrodher/policy_test_V11 | ACT (LeRobot) | 51,7 M | no aplica | sin evaluar | no disponible | Hugging Face |
| ACT original (Zhao et al., 2023) | ACT | no disponible | no aplica | reportado en paper | no disponible | paper + código |
| Diffusion Policy | difusión para robótica | no disponible | no aplica | reportado en paper | no disponible | código público |
| Otras políticas LeRobot en el Hub | ACT / Diffusion / VQ-BeT | variable | no aplica | variable, a menudo sin evaluar | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas políticas en la información proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real; el rendimiento es desconocido.
- Tarea única y estrecha: solo entrenado para "put the beige piece on the aruco"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia fuerte de la configuración: requiere robot `so_follower`, cámaras `top` y `wrist` con los mismos índices, resolución y calibración que en el entrenamiento.
- Dataset pequeño: 50 episodios y 19.789 frames; riesgo de sobreajuste y baja robustez ante cambios de iluminación, posición de objetos o distractores.
- Licencia no disponible: no se puede confirmar el uso comercial; tratar como restringido hasta que el autor la especifique.
- Sin idiomas ni capacidades lingüísticas: no es un LLM; no admite prompts en lenguaje natural más allá de la etiqueta de tarea.
- Riesgo de alucinación en el sentido robótico: puede generar acciones plausibles pero incorrectas ante observaciones fuera de distribución.
- Sesgos: no documentados; en robótica de imitación, los sesgos provienen del operador que teleoperó los 50 episodios.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mrodher/policy_test_V11
- Dataset de entrenamiento: https://huggingface.co/datasets/mrodher/so101_dataset_test_V11_20261117_122059
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrodher/so101_dataset_test_V11_20261117_122059
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
