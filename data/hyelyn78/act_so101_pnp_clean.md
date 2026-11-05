# hyelyn78/act_so101_pnp_clean

## Resumen

`hyelyn78/act_so101_pnp_clean` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicada en el Hub de HuggingFace con la librería LeRobot. La desarrolla el usuario hyelyn78 y resuelve una tarea muy concreta de manipulación: "Pick the block and place it in the box" (coger un bloque y colocarlo en una caja) con un robot de tipo `so_follower`. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado articular y dos cámaras y emite comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros en formato safetensors y un repositorio de 0,2 GB. Se entrenó con 49 episodios (17.668 fotogramas a 30 FPS) teleoperados, durante 50.000 pasos con batch de 8 y optimizador AdamW. La relevancia es acotada: sirve como ejemplo reproducible de entrenamiento de políticas ACT end-to-end con LeRobot sobre un robot de bajo coste SO-101, no como componente de propósito general.

La ficha es deliberadamente restrictiva: no hay datos de benchmarks, evaluación en robot real, licencia declarada ni idiomas. Cualquier uso en producción exige validación propia y verificación de la licencia con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT): transformer con codificador visual y decodificador de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; la tarea se pasa como cadena al runner) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` (SO-101) |
| Frecuencia de datos | 30 FPS |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos cortos de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. La política combina un codificador visual (procesa las dos cámaras, `top` y `wrist`, a 480x640) con un transformer que condiciona la predicción de acciones sobre el estado articular de 6 dimensiones. El modelo se entrenó con el dataset `hyelyn78/so101_pnp_clean`, compuesto por 49 episodios y 17.668 fotogramas teleoperados a 30 FPS sobre la tarea de pick-and-place.

La configuración de entrenamiento declarada es de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, ejecutada con LeRobot 0.6.2. No se documenta composición del dataset más allá del número de episodios y la tarea, ni se indica si hubo aumento de datos, regularización temporal o técnicas adicionales (por ejemplo, temporal ensembling en inferencia). Tampoco se especifica la dimensión del chunk de acciones ni el número de capas del transformer en la model card.

## Capacidades

- Control visuomotor de un robot SO-101 (`so_follower`) para una única tarea de pick-and-place.
- Predicción de chunks de acción de 6 dimensiones a partir de estado articular y dos vistas de cámara.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa ni RL).
- Ejecución en bucle cerrado con `lerobot-rollout` a la frecuencia de los datos de entrenamiento (30 FPS).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto, visión general o audio.
- No incluye modo "thinking" ni planificación simbólica: la política reacciona a observaciones, no razona sobre ellas.

## Casos de uso

- Reproducción de la tarea pick-and-place en un SO-101: ejecutar `lerobot-rollout` con `--policy.path=hyelyn78/act_so101_pnp_clean` y la tarea "Pick the block and place it in the box" para validar el pipeline completo de LeRobot antes de entrenar políticas propias.
- Docencia y formación en aprendizaje por imitación: usar el repositorio como ejemplo mínimo (49 episodios, 0,2 GB) para explicar ACT, grabación de datos y entrenamiento con LeRobot en un curso de robótica.
- Línea base para comparativas internas: servir de referencia de éxito/fallo frente a políticas entrenadas con más episodios o con otras arquitecturas (Diffusion Policy, VQ-BeT) sobre el mismo robot y tarea.
- Pruebas de integración de hardware: verificar calibración de cámaras `top` y `wrist`, puerto del robot y frecuencia de control antes de desplegar políticas más complejas.
- Generación de datos sintéticos de evaluación: ejecutar la política en simulador o en banco de pruebas para recolectar trayectorias y medir robustez ante cambios de iluminación o posición de objetos.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train --policy.type=act` sobre un dataset ampliado del mismo robot para mejorar la tasa de éxito observada en la tarea original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de éxito por tarea, ni comparación con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM vendrá dominada por los buffers de las dos cámaras a 480x640 y el grafo de inferencia, no por los pesos.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA y al menos 4 GB de VRAM debería poder ejecutar la política; el entrenamiento declarado usó `--policy.device=cuda`.
- GPU de consumo: previsiblemente cabe en GTX 1660, RTX 3050, RTX 4060 y superiores; no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot), con `--strategy.type=base`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS, la frecuencia de los datos de entrenamiento, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hyelyn78/act_so101_pnp_clean` | 51,7 M | Estado 6D + 2 cámaras 480x640 | Pick-and-place SO-101 | no disponible | HuggingFace (0 descargas, 0 likes) |
| ACT original (paper 2304.13705) | no disponible en esta ficha | Estado + cámaras | Manipulación diversa (ALOHA) | código de referencia público | Repositorio del paper |
| Diffusion Policy | no disponible en esta ficha | Estado + cámaras | Manipulación diversa | no disponible en esta ficha | Repositorio público |
| Otras políticas LeRobot en el Hub | variable | variable | variable | variable | HuggingFace |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para esta política ni métricas homogéneas frente a Diffusion Policy o VQ-BeT en la misma tarea y robot.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "[More Information Needed]". No se puede asumir uso comercial sin contactar con el autor.
- Sin evaluación en robot real: no hay tasa de éxito publicada, por lo que el rendimiento en producción es desconocido.
- Dataset muy pequeño (49 episodios, 17.668 fotogramas): alta probabilidad de sobreajuste a posiciones, iluminación y objetos concretos de la grabación.
- Una única tarea: la política no generaliza a otras tareas ni objetos; cualquier cambio de consigna requiere reentrenamiento.
- Dependencia de hardware exacto: las cámaras `top` y `wrist` deben coincidir en nombre, resolución (480x640) y FPS (30) con las del entrenamiento; un cambio de montaje o calibración degrada el control.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: el modelo puede generar trayectorias que no completan la tarea sin señal de error explícita.
- Sin datos de sesgos: no aplica el análisis de sesgo lingüístico, pero sí el sesgo de dominio (objetos, colores, posiciones y condiciones de luz del dataset).
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni issues documentados.
- Idiomas no aplicables: el texto de la tarea se pasa al runner, pero el modelo no procesa lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hyelyn78/act_so101_pnp_clean
- Dataset de entrenamiento: https://huggingface.co/datasets/hyelyn78/so101_pnp_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hyelyn78/so101_pnp_clean
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
