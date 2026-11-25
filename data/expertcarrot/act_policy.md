# Expertcarrot/act_policy

## Resumen

`Expertcarrot/act_policy` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705 y entrenada con la librería LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y produce trayectorias más suaves. Está pensado para controlar un robot físico del tipo `so102_follower` con una única cámara de muñeca.

El modelo resuelve una tarea muy concreta: "pick up cube and place it on the plate" (coger un cubo y colocarlo en un plato). Se entrenó sobre un dataset propio de 20 episodios y 10.786 fotogramas a 30 FPS, con 30.000 pasos de entrenamiento, batch de 16, optimizador AdamW y tasa de aprendizaje de 1e-05. Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: grabar datos, entrenar una política ACT y desplegarla en hardware real.

La arquitectura es un transformer ligero específico para robótica, no un modelo de lenguaje. Tiene 51.670.663 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors. No dispone de ventana de contexto en el sentido de los LLM: consume un estado de 7 dimensiones y una imagen RGB de 480x640, y emite un vector de acción de 7 dimensiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) sobre LeRobot |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; entrada: estado de 7 dimensiones + imagen 3x480x640) |
| Tipos de cuantización | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones en la model card) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual y un transformer que predice secuencias de acciones (chunks) en lugar de una acción por paso. La política consume `observation.state` con forma `(7,)` y la imagen `observation.images.cam_wrist` con forma `(3, 480, 640)`, y produce `action` con forma `(7,)`. El entrenamiento se realizó con LeRobot 0.6.0 durante 30.000 pasos, con batch de 16, AdamW, learning rate de 1e-05 y semilla 1000, sobre el dataset `Expertcarrot/yellow_cubereally_20261121_165513` (20 episodios, 10.786 fotogramas, 30 FPS).

No se documenta en la model card el número de tokens de entrenamiento (no aplica), la composición detallada del dataset más allá de la tarea, ni si hubo etapas de RLHF o DPO (no procede en aprendizaje por imitación). Tampoco se describen innovaciones adicionales como decodificación especulativa o atención lineal; la contribución técnica es la propia formulación de action chunking del paper de ACT.

## Capacidades

- Control robótico de imitación para la tarea "pick up cube and place it on the plate" sobre un robot `so102_follower`.
- Predicción de chunks de acción de 7 dimensiones a partir de estado propioceptivo de 7 dimensiones y una imagen de muñeca.
- Ejecución en bucle cerrado con realimentación visual a 30 FPS (frecuencia del dataset de entrenamiento).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes LLM; su "razonamiento" es la política de control.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Recogida y colocación de objetos en línea de montaje: la política ejecuta la secuencia "coger cubo y depositarlo en el plato" de forma autónoma, adecuada para tareas de pick-and-place repetitivas con objetos de geometría similar.
- Prototipado de flujos de imitación con LeRobot: sirve como referencia reproducible para validar la instalación, la calibración del robot `so102_follower` y la cámara `cam_wrist` antes de entrenar políticas propias.
- Investigación en aprendizaje por imitación: permite comparar variantes de ACT, hiperparámetros o datasets manteniendo constante la arquitectura y el pipeline de entrenamiento.
- Docencia y demos de robótica: el reducido tamaño (0,2 GB, ~51,7 M de parámetros) facilita ejecutarlo en equipos modestos para demostraciones en aula o laboratorio.
- Base para fine-tuning con nuevos objetos: al ser una política ACT estándar, se puede reentrenar con un dataset propio que amplíe la variedad de cubos, platos o posiciones.
- Benchmark interno de éxito en manipulación: útil como línea base de tasa de éxito en una tarea sencilla antes de evaluar métodos más complejos (difusión, flow matching, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2-4 GB libres (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior es suficiente. Para entrenamiento (30.000 pasos, batch 16) se recomienda una GPU con al menos 8-12 GB, aunque no se documenta el consumo real.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del modelo; no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=Expertcarrot/act_policy`), y entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. La frecuencia de control esperada es de 30 FPS según el dataset, pero no se confirma latencia real en hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Expertcarrot/act_policy | 51,7 M | estado (7,) + imagen 3x480x640 | pick and place de cubo | apache-2.0 | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | no disponible | no disponible | tareas de manipulación diversas | apache-2.0 (típico) | Hugging Face |
| Políticas de difusión (diffusion policy) en LeRobot | no disponible | no disponible | manipulación | no disponible | Hugging Face |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación rigurosa con alternativas; la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Entrenada con solo 20 episodios y una única tarea; la generalización a otros objetos, posiciones o entornos es muy limitada.
- Depende de una configuración hardware concreta: robot `so102_follower` y cámara `cam_wrist`; cambiar la cámara o su montaje puede degradar el rendimiento.
- No hay evaluación publicada: se desconoce la tasa de éxito real y el riesgo de fallo en producción.
- Riesgo de sobreajuste al dataset reducido y a las condiciones de iluminación y fondo de la grabación.
- Sin capacidades lingüísticas ni de razonamiento simbólico; no debe presentarse como un modelo de propósito general.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar el cumplimiento en despliegues críticos.
- No se documentan sesgos, pero al ser una política de imitación puede reproducir sesgos presentes en las demostraciones humanas (por ejemplo, trayectorias subóptimas o dependientes del operador).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Expertcarrot/act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Expertcarrot/yellow_cubereally_20261121_165513
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Expertcarrot/yellow_cubereally_20261121_165513
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
