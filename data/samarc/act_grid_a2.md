# SamarC/act_grid_a2

## Resumen

SamarC/act_grid_a2 es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), publicada en el Hub de Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador robótico entrenado para una tarea concreta de manipulación (recoger un bloque rojo y colocarlo en la posición A2) sobre un robot SO-101 (tipo `so_follower`). El modelo consume el estado articular de 6 dimensiones y una imagen frontal de 480x640 píxeles, y produce comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros totales en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real a 30 FPS. Fue entrenado durante 20.000 pasos con un batch de 8 y una tasa de aprendizaje de 1e-5 sobre un dataset propio de 50 episodios y 26.066 fotogramas teleoperados.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento ACT y despliegue con `lerobot-rollout`) para tareas de pick-and-place en robots de bajo coste. No es un modelo generalista ni multilingüe; su utilidad está estrictamente ligada a la tarea y al hardware para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación por fotograma, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones cortos en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suele lograr tasas de éxito altas en tareas de manipulación. La entrada combina el estado del robot (`observation.state`, vector de 6 dimensiones) con una imagen de cámara (`observation.images.front`, tensor 3x480x640), y la salida es un vector de acción de 6 dimensiones. El modelo se entrenó con 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.1.

El dataset de entrenamiento es SamarC/so101_grid_a2: 50 episodios teleoperados, 26.066 fotogramas a 30 FPS, con la tarea "Pick up the red block and place it in A2". No se especifica en la información disponible si hubo aumento de datos, variaciones de iluminación o posiciones de objetos, ni detalles sobre la composición exacta de las trayectorias. La model card no reporta innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot SO-101 (`so_follower`).
- Percepción visual monocámara: procesa una imagen frontal de 480x640 a 30 FPS como parte de la observación.
- Ejecución de una tarea específica de pick-and-place: "Pick up the red block and place it in A2".
- Aprendizaje por imitación a partir de datos teleoperados (no requiere recompensa explícita).
- Predicción de chunks de acción, que aporta suavidad y robustez frente a políticas paso a paso.
- Integración nativa con LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de audio o texto.

## Casos de uso

- Pick-and-place en laboratorio: el modelo coloca un bloque rojo en la posición A2 sobre un robot SO-101; es adecuado como referencia reproducible para validar un montaje hardware y el pipeline de LeRobot antes de escalar a tareas propias.
- Docencia y formación en robótica de imitación: sirve como ejemplo completo de grabación de datos, entrenamiento ACT y despliegue, con comandos concretos en la model card.
- Prototipado de políticas ligeras: con 51,7 M de parámetros y 0,2 GB de pesos, permite iterar rápidamente en una estación de trabajo sin infraestructura de GPU de gran escala.
- Benchmark interno de manipulación: puede usarse como línea base de éxito en una tarea de grid concreta para comparar con otras políticas (Diffusion Policy, VQ-BeT) entrenadas sobre el mismo dataset.
- Automatización de tareas repetitivas de clasificación: la tarea de colocar un bloque en una celda etiquetada (A2) es análoga a operaciones de sorting en líneas de montaje de baja complejidad.
- Reentrenamiento y ajuste fino: el repositorio y la configuración permiten reutilizar el pipeline con el dataset SamarC/so101_grid_a2 o con datos propios para adaptar la política a nuevas posiciones u objetos.
- Demostración de integración con el Hub: útil para equipos que quieren evaluar el flujo de LeRobot con políticas alojadas en Hugging Face y visualización de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos en safetensors de 0,2 GB, la inferencia es viable en GPUs de consumo, aunque no se documenta el consumo exacto.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, pero no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible. El dataset y las cámaras operan a 30 FPS, pero no se reporta la latencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamarC/act_grid_a2 | 51.668.614 | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de parámetros, contexto ni rendimiento de alternativas en la información proporcionada; la comparativa queda limitada a la categoría (políticas de imitación para manipulación robótica) sin cifras verificables.

## Limitaciones y advertencias

- Tarea única y altamente específica: solo se ha entrenado para "Pick up the red block and place it in A2"; no generaliza a otras posiciones, objetos o instrucciones sin reentrenamiento.
- Dependencia del hardware: diseñado para `so_follower` con una cámara `front`; cambios de robot, calibración o montaje de cámara pueden degradar el comportamiento.
- Sin evaluación publicada: no hay tasas de éxito ni análisis de robustez frente a cambios de iluminación, distractores o posiciones de objetos.
- Dataset pequeño: 50 episodios y 26.066 fotogramas; riesgo de sobreajuste a las condiciones exactas de grabación.
- Sin capacidades de lenguaje ni multilingües: no es adecuado para tareas de texto, razonamiento o diálogo.
- Riesgo de alucinación no aplica en el sentido de modelos generativos de texto, pero sí existe riesgo de acciones erróneas o inseguras en el robot; se recomienda supervisión y límites de seguridad físicos.
- Licencia apache-2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento y la seguridad en entornos reales.
- Sin datos de sesgos: no se documentan sesgos demográficos ni de otro tipo; el riesgo relevante es el sesgo de dominio del dataset de entrenamiento.
- Sin cuantizaciones documentadas ni métricas de latencia: la viabilidad en producción a 30 FPS no está verificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamarC/act_grid_a2
- Dataset de entrenamiento: https://huggingface.co/datasets/SamarC/so101_grid_a2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamarC/so101_grid_a2
