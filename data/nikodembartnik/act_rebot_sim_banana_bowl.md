# nikodembartnik/act_rebot_sim_banana_bowl

## Resumen

`act_rebot_sim_banana_bowl` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) sobre la librería LeRobot de Hugging Face. El modelo lo publica el usuario `nikodembartnik` y resuelve una tarea concreta de manipulación: introducir un plátano en un cuenco ("Put the banana in the bowl") con un robot `rebot_b601_follower` equipado con tres cámaras (front, top y wrist). No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular de 7 dimensiones y tres imágenes RGB de 480x640) a acciones de 7 dimensiones.

La arquitectura es un transformer ACT, con 51.670.663 parámetros totales, entrenado durante 30.000 pasos sobre 50 episodios de teleoperación (14.857 fotogramas a 30 FPS) en un entorno de simulación. La relevancia es acotada: se trata de un artefacto de entrenamiento reproducible y de bajo coste (0,2 GB de pesos en safetensors) que sirve como referencia para pipelines de imitación en LeRobot, no como modelo de propósito general.

Conviene subrayar que no se han publicado resultados de evaluación, que la licencia no está especificada y que el modelo está entrenado exclusivamente para una tarea y un robot concretos. Cualquier uso fuera de ese contexto requiere reentrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visomotora por chunk de acciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. La política consume `observation.state` (vector de 7 dimensiones) y tres flujos visuales (`observation.images.front`, `observation.images.top`, `observation.images.wrist`, cada uno de 3x480x640) y produce una acción de 7 dimensiones. El modelo se entrenó con el stack LeRobot 0.7.1, optimizador AdamW, learning rate 1e-5, batch size 32, semilla 1000 y 30.000 pasos.

El dataset de entrenamiento es `nikodembartnik/rebot_sim_banana_bowl_20261109_162049`: 50 episodios, 14.857 fotogramas a 30 FPS, todos ellos de la tarea "Put the banana in the bowl" en simulación. No se documenta composición adicional del dataset, aumento de datos, ni fases de RLHF o DPO (no aplicables en este paradigma). Tampoco se especifican innovaciones adicionales más allá del propio chunking de acciones del método ACT.

## Capacidades

- Control visomotor para una única tarea de manipulación: coger un plátano y depositarlo en un cuenco.
- Fusión de tres vistas de cámara (frontal, superior y de muñeca) con el estado articular para generar acciones de 7 grados de libertad.
- Predicción de chunks de acciones, lo que permite ejecutar trayectorias suaves sin replanificación paso a paso.
- Ejecución en bucle sobre un robot real mediante `lerobot-rollout` con la estrategia `base`.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de imitación: sirve como política de referencia para validar un pipeline LeRobot completo (grabación, entrenamiento, rollout) antes de escalar a tareas propias.
- Benchmark interno de hardware: al ser un modelo pequeño (0,2 GB) y con entradas bien definidas, permite medir latencia y throughput de un `rebot_b601_follower` con tres cámaras antes de invertir en datasets mayores.
- Docencia y formación: ilustra de forma compacta cómo ACT transforma observaciones multimodales en acciones, útil en cursos de robótica de imitación.
- Prueba de integración de cámaras: valida la calibración y la sincronización de las tres vistas (front, top, wrist) exigidas por la política.
- Punto de partida para fine-tuning: el checkpoint puede reentrenarse con `lerobot-train` sobre un dataset propio que comparta el mismo esquema de observaciones y acciones.
- Validación de simulación a realidad: permite comprobar la brecha sim-real en una tarea sencilla antes de abordar tareas de mayor complejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors de 0,2 GB, la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el cuello de botella real será el procesamiento de tres cámaras a 30 FPS, no el modelo.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=nikodembartnik/act_rebot_sim_banana_bowl`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del robot, del bus de comunicaciones y de la captura de las tres cámaras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_rebot_sim_banana_bowl` | 51,7 M | no aplica | Manipulación (plátano en cuenco) | no disponible | Hugging Face, LeRobot |
| Políticas ACT de LeRobot (genéricas) | variable | no aplica | Manipulación por imitación | según repositorio | Hugging Face, LeRobot |
| Políticas Diffusion Policy | variable | no aplica | Manipulación por imitación | según repositorio | Hugging Face, LeRobot |
| Políticas π0 / VLA de gran escala | miles de millones | no aplica | Manipulación generalista | según repositorio | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para la tarea "Put the banana in the bowl" con el robot `rebot_b601_follower`; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Dataset de solo 50 episodios y 14.857 fotogramas, en simulación; riesgo alto de sobreajuste y de brecha sim-real.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito.
- Licencia no especificada: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras ante distribuciones de entrada distintas a las de entrenamiento.
- Requiere que los nombres y las resoluciones de las cámaras coincidan exactamente con los `observation keys` de entrenamiento (front, top, wrist a 480x640).
- No soporta otros idiomas ni instrucciones en lenguaje natural: la tarea se fija en el momento del entrenamiento.
- Sin garantías de seguridad física: cualquier ejecución en un robot real debe hacerse con paradas de emergencia y límites de par.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikodembartnik/act_rebot_sim_banana_bowl
- Dataset de entrenamiento: https://huggingface.co/datasets/nikodembartnik/rebot_sim_banana_bowl_20261109_162049
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nikodembartnik/rebot_sim_banana_bowl_20261109_162049
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
