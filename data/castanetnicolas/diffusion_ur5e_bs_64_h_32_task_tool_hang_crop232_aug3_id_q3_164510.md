# castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_aug3_ID_q3_164510

## Resumen

Este repositorio contiene una política de control visuomotor entrenada con el método Diffusion Policy, publicada en el Hub mediante la librería LeRobot de Hugging Face. El autor es el usuario castanetnicolas y el modelo resuelve una tarea concreta de manipulación robótica: insertar un gancho en una base para construir un marco y colgar una llave inglesa en el gancho (tool hang). No es un modelo de lenguaje, sino una política de imitación que mapea observaciones multimodales (estado articular y dos cámaras) a trayectorias de acción continuas.

La arquitectura sigue el planteamiento de Diffusion Policy (Chi et al., 2023): el control visuomotor se trata como un proceso generativo de difusión que produce trayectorias de acción suaves y multimodales, lo que resulta especialmente adecuado para tareas de manipulación con contactos ricos. El checkpoint contiene 278.014.919 parámetros en formato safetensors y ocupa 1,1 GB en el repositorio.

Es relevante como ejemplo reproducible de entrenamiento de políticas con LeRobot 0.6.1 sobre el dataset robomimic_tool_hang_ph_image256, con una configuración de entrenamiento documentada (100.000 pasos, batch 64, Adam, lr 1e-4) y licencia Apache 2.0, lo que facilita su reutilización y comparación dentro del ecosistema LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control visuomotor, sobre LeRobot) |
| Parámetros totales | 278.014.919 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por el entorno) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot 0.6.1 |
| Pipeline | robotics |
| Tipo de robot | panda |
| Cámaras | sideview, robot0_eye_in_hand |
| Entrada observation.state | STATE, forma (9,) |
| Entrada observation.images.sideview | VISUAL, forma (3, 256, 256) |
| Entrada observation.images.robot0_eye_in_hand | VISUAL, forma (3, 256, 256) |
| Salida action | ACTION, forma (7,) |
| Tamaño del repositorio | 1,1 GB |
| Dataset de entrenamiento | castanetnicolas/robomimic_tool_hang_ph_image256 |
| Episodios / frames | 200 episodios, 95.962 frames |
| Frecuencia de los datos | 20 FPS |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, que formula la generación de acciones como un proceso de difusión condicionado por las observaciones. En lugar de predecir una única acción de forma determinista, la política aprende a generar trayectorias de acción multimodales y temporalmente coherentes, lo que mejora el rendimiento en tareas de contacto rico como la inserción de un gancho y el colgado de una herramienta. La entrada combina un vector de estado de 9 dimensiones con dos imágenes RGB de 256×256 (vista lateral y vista de la cámara en la muñeca del robot), y la salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset robomimic_tool_hang_ph_image256 (200 episodios, 95.962 frames a 20 FPS), con 100.000 pasos, batch size 64, optimizador Adam, learning rate 1e-4 y semilla 1000. La model card no documenta el número total de tokens ni la composición detallada del dataset más allá de la tarea y las cámaras, ni indica si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de imitación). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visuomotor para manipulación robótica: genera trayectorias de acción continuas de 7 dimensiones a partir de estado y dos vistas de cámara.
- Ejecución de tareas de contacto rico: inserción de un gancho en una base y colgado de una llave inglesa (tool hang).
- Política de imitación entrenada con datos de demostración (200 episodios, 95.962 frames).
- Generación de acciones multimodales y suaves gracias al proceso de difusión.
- Integración con el ecosistema LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo lingüístico).
- Capacidades multilingües: no disponible (no aplica).
- Capacidades especiales (modo thinking, visión, audio): visión mediante dos cámaras RGB; no dispone de otras capacidades documentadas.

## Casos de uso

- Automatización de ensamblaje con gancho y base: la política ejecuta la secuencia de inserción y colgado de la llave inglesa en un entorno tipo robomimic, adecuada para reproducir la tarea con un robot panda y las dos cámaras especificadas.
- Investigación en imitación con Diffusion Policy: sirve como referencia reproducible para comparar variantes de difusión frente a políticas deterministas en tareas de contacto rico, dado que la configuración de entrenamiento está documentada.
- Benchmark de manipulación con robomimic: al estar entrenada sobre el dataset robomimic_tool_hang_ph_image256, puede emplearse como línea base en evaluaciones de políticas visuomotoras.
- Prototipado rápido con LeRobot: el comando `lerobot-rollout` permite desplegar la política en un robot panda real con cámaras OpenCV, lo que facilita pruebas de integración en laboratorio.
- Reentrenamiento y ajuste fino: el comando `lerobot-train` con `--policy.type=diffusion` permite adaptar la política a nuevos datasets o variaciones de la tarea manteniendo la misma arquitectura.
- Docencia y formación en robótica de imitación: el repositorio incluye guías de instalación, configuración de hardware y grabación de datos, lo que lo hace útil como material didáctico para aprender el flujo completo de LeRobot.
- Validación de pipelines de datos: el dataset asociado (200 episodios, 95.962 frames a 20 FPS) y la política permiten probar herramientas de visualización y curación de datos del ecosistema LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 278 millones de parámetros en safetensors, el peso en precisión nativa ronda 1,1 GB; a FP16 sería aproximadamente 0,56 GB y a FP32 aproximadamente 1,1 GB, antes de overhead de activaciones y del proceso de difusión.
- GPU recomendadas: no disponible en la documentación. Por tamaño, una GPU consumer moderna (por ejemplo, RTX 4090 o similar) debería ser suficiente para inferencia; el entrenamiento documentado se realizó con `--policy.device=cuda`.
- ¿Cabe en GPU consumer? Sí, por el número de parámetros (278 M) es previsible que quepa en GPUs consumer, aunque no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_aug3_ID_q3_164510 | 278.014.919 | no aplica | sin resultados de evaluación publicados | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Otras políticas Diffusion Policy en LeRobot | no disponible | no aplica | no disponible | no disponible | no disponible |
| Políticas ACT en LeRobot | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada; los datos de alternativas se indican como no disponibles.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la política en la tarea tool hang.
- Entrenada para un robot y una tarea concretos (panda, tool hang): no se garantiza su generalización a otras tareas, objetos, posiciones o condiciones de iluminación.
- Dependencia de la configuración de cámaras: los nombres de cámara (`sideview`, `robot0_eye_in_hand`) deben coincidir con las claves de observación del entrenamiento; cambios de cámara o calibración pueden degradar el rendimiento.
- Dataset limitado: 200 episodios y 95.962 frames, lo que puede implicar poca diversidad y riesgo de sobreajuste a las condiciones de recogida.
- Sin información sobre sesgos: no disponible.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar trayectorias no válidas fuera de la distribución de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe citarse el método (Diffusion Policy) y LeRobot según la model card.
- Repositorio sin descargas ni likes y creado en 2026: no hay evidencia de validación por parte de la comunidad.
- No se documentan cuantizaciones ni requisitos de hardware oficiales, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_aug3_ID_q3_164510
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
