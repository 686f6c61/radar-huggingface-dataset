# nberezny/act_franka_pick_place_v3

## Resumen

`nberezny/act_franka_pick_place_v3` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario nberezny y publicado en Hugging Face mediante la librería LeRobot de Hugging Face. Su propósito es ejecutar una tarea concreta de manipulación robótica: coger un cubo rojo y depositarlo sobre una casilla azul, sobre un brazo Franka Panda en simulación (`franka_panda_sim`).

El modelo es extremadamente pequeño en comparación con los LLM habituales: 51.590.792 parámetros en formato safetensors, con un repositorio de 0,2 GB. Consume dos flujos de imagen (cámara cenital y cámara en la muñeca, ambas a 240x320 píxeles) más un vector de estado de 8 dimensiones, y produce un vector de acción de 8 dimensiones. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que mapea observaciones visuales y propioceptivas a comandos motores.

Su relevancia es práctica para quien trabaja con LeRobot y quiere reproducir o adaptar un pipeline de aprendizaje por imitación de extremo a extremo. La model card no incluye resultados de evaluación ni licencia declarada, y el repositorio no registra descargas ni likes, lo que indica que es un artefacto de experimentación personal más que un modelo de referencia listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.590.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena de texto en el rollout) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con codificación de observaciones visuales y propioceptivas. El modelo recibe dos imágenes de 3x240x320 (cámara `overhead` y cámara `wrist`) y un vector de estado de 8 dimensiones, y emite un vector de acción de 8 dimensiones. La innovación central de ACT es la predicción de *action chunks*: en lugar de generar una única acción por paso, produce una secuencia corta de acciones, lo que reduce el error de acumulación y mejora la estabilidad del control. El método se describe en el paper arXiv:2304.13705.

El entrenamiento se realizó sobre el dataset `nberezny/franka_pick_place_v2`, con 100 episodios, 15.931 fotogramas a 20 FPS y la tarea única "Pick up the red cube and place it on the blue square". La configuración reportada es de 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, con LeRobot 0.7.0. No se documenta composición del dataset más allá del número de episodios y fotogramas, ni se menciona RLHF, DPO ni etapas de refinamiento posteriores.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 8 dimensiones para un brazo Franka Panda en simulación.
- Percepción visual multimodal: procesa simultáneamente una vista cenital y una vista de muñeca.
- Aprendizaje por imitación a partir de datos teleoperados: reproduce la tarea de pick-and-place aprendida del dataset.
- Predicción de action chunks: emite secuencias cortas de acciones en lugar de pasos aislados.
- Ejecución de una tarea única y específica: "Pick up the red cube and place it on the blue square".
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline de imitación en LeRobot: sirve como ejemplo funcional de política ACT entrenada de extremo a extremo, útil para validar la instalación, el formateo de observaciones y el comando `lerobot-rollout` antes de entrenar políticas propias.
- Prototipado de pick-and-place en simulación: permite probar la tarea de coger un cubo rojo y colocarlo en una casilla azul sobre `franka_panda_sim` sin necesidad de teleoperar datos nuevos.
- Base para fine-tuning con datos propios: al estar en formato LeRobot y safetensors, puede reentrenarse con `lerobot-train` sobre un dataset nuevo con la misma estructura de observaciones (dos cámaras y estado de 8 dimensiones).
- Docencia y experimentación en aprendizaje por imitación: útil para demostrar el efecto del action chunking frente a políticas que predicen acciones individuales, con una configuración de entrenamiento documentada y reproducible (semilla 1000, 100.000 pasos, batch 8).
- Validación de infraestructura de inferencia robótica: permite medir latencia y throughput de una política de ~51,6 M de parámetros en el hardware disponible antes de escalar a modelos mayores.
- Referencia para comparación de métodos: sirve como punto de partida para contrastar ACT con otras políticas de LeRobot (por ejemplo, diffusion policy) sobre la misma tarea y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se reportan tasas de éxito, número de ensayos ni métricas de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors (0,2 GB de repositorio), la huella de pesos es inferior a 1 GB en precisión completa, por lo que la VRAM vendrá dominada por los buffers de imagen (dos flujos de 3x240x320) y el grafo de inferencia.
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento documentado usa `--policy.device=cuda`, lo que implica que se entrenó en GPU NVIDIA; no se indica el modelo concreto.
- Compatibilidad con GPU de consumo: muy probable por el tamaño del modelo, pero no confirmada en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de los datos de entrenamiento es de 20 FPS, pero no se reporta la latencia de inferencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nberezny/act_franka_pick_place_v3 | 51.590.792 | no aplica | Pick-and-place Franka Panda (sim) | no disponible | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot | no disponible | no aplica | Manipulación genérica | variable | Hub de Hugging Face |
| Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación genérica | variable | Hub de Hugging Face |

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. La comparación cualitativa se limita al método (ACT frente a otras políticas de imitación soportadas por LeRobot) y al alcance (tarea única en simulación frente a políticas más generales).

## Limitaciones y advertencias

- Entrenado para una única tarea y un único entorno simulado (`franka_panda_sim`); no generaliza a otras tareas, objetos ni robots sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay evidencia documentada de tasa de éxito ni de robustez ante variaciones de posición, iluminación o distracciones.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Sin descargas ni likes registrados: artefacto de experimentación personal, sin validación por parte de la comunidad.
- Dependencia estricta del formato de observaciones: los nombres de cámara (`overhead`, `wrist`) y las formas (3x240x320, estado de 8 dimensiones) deben coincidir exactamente con los del entrenamiento.
- Riesgo de sobreajuste al dataset de 100 episodios y 15.931 fotogramas, con una sola semilla (1000) y sin validación cruzada reportada.
- No apto para despliegue en robot real sin validación previa: el autor lo etiqueta como simulación y no documenta transferencia sim-to-real.
- No procesa lenguaje natural ni admite instrucciones arbitrarias: la cadena de tarea es fija.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_franka_pick_place_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Modelos y simulación de Franka: https://franka.de/models-and-simulation
- Ejemplo de pick-and-place Franka en Isaac Sim: https://www.youtube.com/watch?v=tvgWZHi6GRg
