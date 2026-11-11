# Haku-2004/act_k5t_input_10

## Resumen

`Haku-2004/act_k5t_input_10` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705. El modelo ha sido entrenado con la librería LeRobot de Hugging Face y publicado en el Hub por el usuario Haku-2004. Predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación aprendidas a partir de demostraciones teleoperadas.

Se trata de un modelo de tamaño reducido, con 51.671.174 parámetros en formato safetensors y un repositorio de 0,2 GB, diseñado para controlar un robot de tipo `so_follower` equipado con dos cámaras (frontal y lateral). El espacio de observación combina un vector de estado de 6 dimensiones con dos imágenes RGB de 480x640, y produce un vector de acción de 6 dimensiones. La tarea concreta sobre la que se ha entrenado se denomina "taskbox".

Es relevante porque ejemplifica el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot: datos teleoperados, entrenamiento supervisado de imitación y ejecución en hardware real mediante la CLI `lerobot-rollout`. No obstante, se trata de un modelo muy específico de un único usuario, con un dataset de 20 episodios y sin resultados de evaluación publicados, por lo que su valor es principalmente como referencia técnica y punto de partida reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un encoder visual (típicamente ResNet) para procesar las observaciones de cámara, y un decoder transformer que predice un chunk de acciones futuras en lugar de una sola acción. Esta predicción por chunks reduce el error de compounding y suaviza la política, lo que se traduce en trayectorias más estables en robots reales. El modelo consume `observation.state` (6 dimensiones), `observation.images.front` y `observation.images.side` (ambas de 3x480x640), y emite `action` de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Haku-2004/k5_4seg`: 20 episodios, 25.815 frames a 30 FPS, tarea "taskbox". La configuración incluye 50.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro a partir de demostraciones teleoperadas. No se dispone de información sobre aumentos de datos, composición detallada del dataset ni innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control robótico de manipulación mediante imitación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Predicción de chunks de acciones, lo que permite ejecutar movimientos suaves y coherentes en lugar de pasos aislados.
- Fusión multimodal de estado propioceptivo (6 valores) y dos flujos de imagen RGB de 480x640.
- Ejecución en tiempo real a 30 FPS, alineada con la frecuencia de captura del dataset de entrenamiento.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Automatización de la tarea "taskbox": el modelo puede ejecutar la secuencia de manipulación aprendida sobre un robot `so_follower` con cámaras frontal y lateral, reproduciendo la política entrenada sobre 20 episodios teleoperados.
- Reproducción de experimentos de imitación: sirve como referencia para validar el pipeline de LeRobot (grabación, entrenamiento, rollout) antes de escalar a datasets mayores.
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT de tamaño reducido (51,6 M de parámetros), puede reentrenarse con nuevos datos teleoperados de manipulación de objetos en cajas.
- Prototipado en laboratorio: útil para comparar ACT frente a otros métodos de imitación (Diffusion Policy, VQ-BeT) en una misma plataforma robótica y con el mismo conjunto de observaciones.
- Docencia y formación: ejemplo completo y reproducible de entrenamiento de una política robótica con licencia Apache 2.0 y comandos documentados.
- Validación de hardware: permite comprobar la calibración de cámaras, puertos y cinemática del robot `so_follower` ejecutando una política conocida durante un tiempo acotado (`--duration`).
- Benchmark interno de latencia: al ejecutarse a 30 FPS, permite medir el rendimiento de inferencia en la GPU disponible antes de desplegar políticas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de éxito, métricas de error de trayectoria ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,6 M de parámetros, ~0,2 GB en safetensors), la huella en memoria es inferior a 1 GB en FP32, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; una RTX 3060, RTX 4090 o superior no debería presentar cuello de botella por memoria. Para entrenamiento se recomienda al menos una GPU con 8 GB o más.
- Cabe en GPU consumer: sí, con amplio margen, incluidas GTX 1660, RTX 2060 y modelos superiores.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) sobre PyTorch con CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; el sistema debe sostener 30 FPS para coincidir con la frecuencia del dataset, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5t_input_10 | 51,6 M | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face (LeRobot) |
| ACT original (paper arXiv:2304.13705) | no disponible en la información | no aplica | resultados en simulación y robot real en el paper | según paper | código en el repositorio del paper |
| Diffusion Policy | no disponible en la información | no aplica | no disponible | no disponible | implementaciones públicas |
| VQ-BeT | no disponible en la información | no aplica | no disponible | no disponible | implementaciones públicas |

No se dispone de datos cuantitativos para comparar el rendimiento de este checkpoint concreto con las alternativas, ya que no se han publicado evaluaciones. La comparación se limita a la categoría metodológica (políticas de imitación para manipulación robótica).

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con solo 20 episodios de un único operador, la política puede sobreajustarse a las condiciones exactas de captura (iluminación, posición de objetos, fondo) y fallar ante variaciones.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de generalización errónea: el modelo puede producir acciones plausibles pero incorrectas fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje ni texto, solo estado propioceptivo e imágenes.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper de ACT y LeRobot según la model card.
- Caveat para producción: no hay evaluación publicada, por lo que no se recomienda su uso en entornos reales sin una validación propia con múltiples ensayos y condiciones controladas.
- Dependencia de hardware específico: la política está entrenada para el robot `so_follower` con cámaras `front` y `side`; cambiar la configuración de cámaras o el robot invalida el modelo.
- Frecuencia fija: el dataset está a 30 FPS y la política asume esa cadencia; desviaciones pueden degradar el comportamiento.
- Tamaño de dataset reducido: 25.815 frames y 20 episodios son insuficientes para una política robusta en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5t_input_10
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
