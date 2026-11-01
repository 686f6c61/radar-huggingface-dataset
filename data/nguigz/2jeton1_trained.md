# nguigz/2jeton1_trained

## Resumen

`nguigz/2jeton1_trained` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. El autor es el usuario `nguigz` y el modelo resuelve una tarea concreta de manipulación: introducir un objeto (un "jeton", ficha o token físico) en una caja. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado de las articulaciones y dos cámaras y emite comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB. La tarea se aprendió por imitación a partir de un dataset de 50 episodios teleoperados (14.966 fotogramas a 30 FPS), grabado sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot) con dos cámaras: frontal y cenital. La entrada de estado tiene forma `(6,)` y las imágenes `(3, 240, 320)`; la salida es una acción de forma `(6,)`.

Su relevancia es práctica: es un ejemplo reproducible y ligero de cómo entrenar y desplegar una política ACT con LeRobot 0.6.2 en hardware de bajo coste. Al estar publicado con licencia Apache 2.0 y con los hiperparámetros de entrenamiento documentados, sirve como referencia para quien quiera replicar el flujo completo (grabación de datos, entrenamiento y rollout) en un robot de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual y decodificador de trozos de acción (action chunks) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una observación por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la instrucción de tarea es una cadena fija "mettre le jeton dans la boite") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. La política combina un encoder de imágenes (dos cámaras: `front` y `top`, a resolución 240x320) con el estado de las articulaciones `(6,)`, y un decodificador transformer que genera secuencias de acciones de dimensión 6. El modelo sigue el diseño del paper arXiv:2304.13705 y la implementación de LeRobot.

El entrenamiento se realizó sobre el dataset `nguigz/2jeton1`: 50 episodios, 14.966 fotogramas a 30 FPS, una única tarea ("mettre le jeton dans la boite"). La configuración documentada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni datos adicionales; es aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Percepción multimodal: combina estado de articulaciones con dos flujos de imagen (frontal y cenital).
- Predicción de trozos de acción (action chunking) para movimientos más estables.
- Ejecución de una tarea concreta de pick-and-place: introducir un jeton en una caja.
- Despliegue mediante CLI de LeRobot (`lerobot-rollout`) con estrategia base.
- Reentrenamiento reproducible con `lerobot-train` a partir de nuevos datasets.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en laboratorio: usar la política para mover fichas u objetos pequeños a un contenedor, aprovechando el entrenamiento específico sobre la tarea "mettre le jeton dans la boite".
- Banco de pruebas para aprendizaje por imitación: servir como referencia reproducible para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) con hiperparámetros documentados.
- Prototipado de robots de bajo coste: desplegar sobre un SO-100/SO-101 con dos cámaras USB, ya que el modelo está dimensionado para hardware de escritorio (0,2 GB de pesos).
- Docencia y formación en robótica: ejemplo didáctico de ACT con dataset pequeño (50 episodios) y configuración transparente.
- Base para fine-tuning en tareas similares: reentrenar con `lerobot-train` sobre nuevos datasets de manipulación de objetos pequeños.
- Evaluación de robustez visuomotora: comparar el rendimiento bajo cambios de iluminación, posición de objetos o cámaras, dado que el modelo depende fuertemente de las dos vistas de entrenamiento.
- Integración en pipelines de investigación: usar la política como componente de control en experimentos de imitación y comparación de métodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y 0,2 GB de pesos, cabe holgadamente en GPUs consumer de 4-8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (por ejemplo, RTX 3060, RTX 4090, A100, H100); el cuello de botella real es la captura de vídeo a 30 FPS, no el modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el control opera a 30 FPS según el dataset, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nguigz/2jeton1_trained | ACT (LeRobot) | 51,7 M | no aplica | apache-2.0 | Hugging Face |
| Políticas ACT de LeRobot (referencia) | ACT | variable según configuración | no aplica | apache-2.0 | Hugging Face / GitHub |
| Políticas Diffusion Policy | difusión para robótica | variable | no aplica | variable | Hugging Face / GitHub |
| Políticas VLA (p. ej. familias tipo RT/OpenVLA) | visión-lenguaje-acción | cientos de M a miles de M | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo, tamaño y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 50 episodios de un único operador y entorno, la política puede sobreajustarse a posiciones, iluminación y disposición de cámara concretas.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje; la tarea está fijada a "mettre le jeton dans la boite" y no generaliza a otras instrucciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; verificar requisitos de seguridad en robot real.
- Caveats para producción: sin resultados de evaluación publicados; requiere que los nombres y la resolución de las cámaras coincidan con los de entrenamiento (`front`, `top`, 240x320); depende de la calibración del robot `so_follower`; no se documentan variantes cuantizadas ni soporte para otros robots.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguigz/2jeton1_trained
- Dataset de entrenamiento: https://huggingface.co/datasets/nguigz/2jeton1
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nguigz/2jeton1
