# fecasado/gact-kitchen-toasts-multi

## Resumen

`fecasado/gact-kitchen-toasts-multi` es una política de robótica (policy) entrenada con LeRobot, no un modelo de lenguaje. Se trata de un modelo `gaze_act`, una variante de ACT (Action Chunking Transformer) que incorpora información de mirada (gaze) como señal adicional de entrada, orientado a tareas de manipulación en entornos de cocina. El autor es `fecasado` y el modelo se publicó en Hugging Face Hub en noviembre de 2026 bajo licencia Apache 2.0.

El modelo resuelve una tarea concreta: el control de un brazo robótico (aparentemente un SO-100 follower, según los comandos de ejemplo de la model card) para realizar la acción de pasar tostadas a un plato ("toasts-to-plate"). Está entrenado sobre el dataset `fecasado/toasts-to-plate-320x240`, con observaciones de imagen a resolución 320x240. Por su naturaleza, es un modelo de imitación (imitation learning) que mapea observaciones visuales y propioceptivas a secuencias de acciones motoras.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de entrenamiento de políticas robóticas con LeRobot, y el prefijo `gact` sugiere una extensión del ACT estándar con condicionamiento por mirada, una línea de investigación activa en manipulación robótica. No es un modelo de propósito general ni compite con LLMs o VLMs; su interés es para investigadores en robótica y aprendizaje por imitación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gaze_act` (variante de ACT, Action Chunking Transformer, con señal de mirada) |
| Parámetros totales | 51.670.922 (dato real de safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; es una policy de robótica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Tamaño del repo | 0.2 GB |
| Dataset de entrenamiento | `fecasado/toasts-to-plate-320x240` |
| Resolución de observación | 320x240 |

## Arquitectura y entrenamiento

La arquitectura es `gaze_act`, una variante de ACT (Action Chunking Transformer). ACT es un transformer que predice "chunks" de acciones (secuencias de posiciones articulares) a partir de observaciones visuales y de estado del robot, y se entrena por imitación supervisada sobre demostraciones teleoperadas. La variante `gaze_act` incorpora, por el nombre, información de mirada (gaze) como entrada adicional o como señal auxiliar, presumiblemente para mejorar la atención sobre regiones relevantes de la escena durante la manipulación.

No se dispone de información detallada sobre el número de tokens de entrenamiento, composición del dataset más allá de su identificador, ni sobre uso de RLHF/DPO (no aplica en este tipo de políticas). El entrenamiento se realizó con la herramienta `lerobot-train` de LeRobot, con `policy.type=act` en los comandos de ejemplo, lo que sugiere que la implementación subyacente es la de ACT de LeRobot con extensiones de gaze. No hay datos publicados sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Control de un brazo robótico para la tarea de transferir tostadas a un plato.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones visuales a 320x240 píxeles.
- Predicción de chunks de acciones (secuencias de comandos motores).
- Condicionamiento por señal de mirada (gaze) según el nombre del modelo.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Reproducción de experimentos de imitación en robótica: el modelo sirve como checkpoint de referencia para reproducir el pipeline `lerobot-train` y `lerobot-record` sobre el dataset `toasts-to-plate-320x240`, útil para validar instalaciones de LeRobot.
- Investigación en condicionamiento por mirada: al ser una variante `gaze_act`, permite estudiar cómo la señal de mirada afecta al rendimiento en manipulación frente a ACT estándar, comparando checkpoints.
- Benchmark de políticas en entornos de cocina: se puede usar como baseline en tareas de transferencia de objetos (tostada a plato) para comparar con otras políticas entrenadas en el mismo dataset.
- Evaluación de hardware SO-100: los comandos de ejemplo apuntan a un `so100_follower`, por lo que el modelo es adecuado para probar dicho brazo en tareas de pick-and-place.
- Docencia y formación: ejemplo completo y ligero (0.2 GB) de un flujo de entrenamiento y evaluación de políticas robóticas con LeRobot, adecuado para talleres.
- Prototipado de automatización de cocina: como punto de partida para extender la política a tareas similares (servir, emplatar) mediante fine-tuning sobre nuevos datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors en FP32, el modelo ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA capaz de ejecutar LeRobot; una RTX 3060 o superior es más que suficiente para inferencia. Para entrenamiento, se recomienda una GPU con al menos 8-12 GB de VRAM según el tamaño del batch.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con soporte CUDA (GTX 1060 en adelante, RTX 20/30/40, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el robot SO-100 follower. No se documentan opciones como vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/gact-kitchen-toasts-multi` | 51,7 M | no aplica | Manipulación (tostadas a plato) con gaze | Apache 2.0 | Hugging Face |
| ACT estándar (LeRobot) | ~50 M (típico) | no aplica | Manipulación genérica | Apache 2.0 | LeRobot / Hugging Face |
| Diffusion Policy (LeRobot) | variable | no aplica | Manipulación genérica | Apache 2.0 | LeRobot / Hugging Face |
| VQ-BeT (LeRobot) | variable | no aplica | Manipulación genérica | Apache 2.0 | LeRobot / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado para una única tarea (tostadas a plato) y un único entorno; no generaliza a otras tareas sin fine-tuning.
- Sin información sobre sesgos: al ser una policy robótica, los sesgos relevantes serían los del dataset de demostraciones (posiciones, iluminación, objetos), no documentados.
- Riesgo de fallo en entornos distintos: cambios de iluminación, posición de cámara u objetos pueden degradar el rendimiento; no hay datos de robustez publicados.
- Dependencia de la señal de mirada: si el despliegue no proporciona gaze, el modelo puede no funcionar como se espera; no se documenta el mecanismo exacto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica "tal cual".
- La model card es una plantilla sin completar ("Model type not recognized"), lo que limita la reproducibilidad y la confianza en los detalles de entrenamiento.
- Sin métricas de éxito publicadas: no se puede evaluar su fiabilidad en producción sin ejecutar la evaluación uno mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gact-kitchen-toasts-multi
- Dataset: https://huggingface.co/datasets/fecasado/toasts-to-plate-320x240
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
