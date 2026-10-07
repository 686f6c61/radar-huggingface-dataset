# miladgholami/act_p0_rectified

## Resumen

act_p0_rectified es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada por el usuario miladgholami en Hugging Face y entrenada con la librería LeRobot de Hugging Face. A diferencia de los modelos de lenguaje, no genera texto: predice secuencias cortas de acciones motoras ("action chunks") a partir de observaciones visuales y del estado del robot, un enfoque introducido en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 M) almacenados en formato safetensors, con un tamaño de repositorio de 0,2 GB.

La política se ha entrenado sobre el dataset `miladgholami/scissor_p0_fixed_50ep_rectified`, que corresponde a una tarea concreta de manipulación con tijeras ("scissor") sobre un brazo robótico de tipo SO-100 follower, según el ejemplo de evaluación incluido en la model card. Se trata, por tanto, de un modelo de nicho, orientado a un robot y una tarea específicos, y no de un modelo de propósito general. En el momento de redactar esta ficha cuenta con 0 descargas y 0 likes.

Su relevancia actual radica en que forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas de bajo coste. Para desarrolladores e investigadores en robótica, es un ejemplo reproducible de cómo entrenar un ACT con un dataset propio y desplegarlo mediante comandos `lerobot-train` y `lerobot-record`. La licencia Apache 2.0 facilita su reutilización comercial, aunque la utilidad práctica está limitada al robot y la tarea concretos para los que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para aprendizaje por imitación (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 (≈51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política robótica; no dispone de ventana de contexto de lenguaje natural) |
| Tipos de cuantización | no disponible; los tensores se publican en F32 |
| Idiomas soportados | no aplica (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | miladgholami/scissor_p0_fixed_50ep_rectified |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador de estilo tipo VAE (que modela la variabilidad humana en las demostraciones) con un transformer que actúa como decodificador de acciones. En lugar de predecir una única acción por paso, el modelo predice un fragmento de acciones futuras (action chunk), lo que mitiga el problema de horizonte temporal en tareas de manipulación fina y reduce la acumulación de errores. La entrada típica son observaciones visuales (imágenes de cámara) y el estado de las articulaciones del robot; la salida son consignas de posición para los actuadores. El checkpoint se ha entrenado y subido con LeRobot, según indica la propia model card.

La información proporcionada no detalla el número de tokens de entrenamiento (no aplica en el sentido de LLM), la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no relevantes en este dominio, donde el aprendizaje es por imitación supervisada). El dataset asociado, `scissor_p0_fixed_50ep_rectified`, sugiere 50 episodios de demostración teleoperada sobre una tarea con tijeras, con algún tipo de "rectificación" en los datos (el nombre incluye "rectified"). No se especifican hiperparámetros, resolución de imagen, número de pasos de observación ni tamaño del chunk de acciones.

## Capacidades

- Predicción de acciones motoras en fragmentos (action chunking) para control de un brazo robótico.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones visuales y del estado propioceptivo del robot (según la arquitectura ACT).
- Ejecución de una tarea de manipulación concreta: la tarea "scissor" (tijeras) para la que fue entrenado.
- Integración con el ecosistema LeRobot para entrenamiento, registro y evaluación de políticas.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni modo "thinking", ya que no es un modelo de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- Manipulación robótica de precisión con tijeras: el modelo ejecuta la tarea de corte para la que fue entrenado sobre un brazo SO-100 follower, siguiendo observaciones visuales en tiempo real.
- Reproducción de experimentos de investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT dentro del ecosistema LeRobot.
- Base para fine-tuning en tareas similares: al ser un ACT de 51,7 M de parámetros, se puede reentrenar con un dataset propio de pocos episodios para una nueva tarea de manipulación.
- Evaluación con `lerobot-record`: se puede lanzar una evaluación de 10 episodios contra el robot real para medir la tasa de éxito del checkpoint.
- Integración en pipelines de robótica educativa o de laboratorio: dado su tamaño reducido, cabe en hardware modesto y permite experimentar con políticas ACT sin gran infraestructura.
- Estudio de robustez frente a variaciones de pose: el autor publica otros checkpoints relacionados (por ejemplo, `act_posevary_rectified`), lo que permite comparar el efecto de distintas condiciones de entrenamiento.
- Despliegue embebido en estaciones de trabajo con una única GPU consumer para inferencia en bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, curvas de aprendizaje ni comparaciones cuantitativas con otras políticas, y tampoco se han encontrado en los resultados de búsqueda web. Los 0 descargas y 0 likes registrados impiden disponer de evidencia externa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamaño del modelo (51,7 M de parámetros, tensores en F32). Cabe holgadamente en cualquier GPU consumer y, con reservas de latencia, podría ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA, desde una GTX/RTX moderna hasta A100 o H100; el modelo no requiere aceleradores de gama alta.
- Cabe en GPU consumer: sí, sin problemas. Una RTX 3060, 4060, 4090 o similar es más que suficiente.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`) es el flujo documentado en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la frecuencia de control del robot y la resolución de las observaciones, datos que no se especifican.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_p0_rectified (este) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (miladgholami) |
| act_posevary_rectified | 51,7 M | no aplica | no disponible | no disponible | Hugging Face (miladgholami) |
| Diffusion Policy (Chi et al.) | no disponible | no aplica | no disponible | no disponible | paper/repo públicos |

Los modelos comparables pertenecen a la misma familia (variantes de ACT del mismo autor) o a métodos alternativos de aprendizaje por imitación como Diffusion Policy. No se dispone de datos cuantitativos que permitan una comparación rigurosa de rendimiento, contexto o eficiencia, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para una tarea concreta ("scissor") y un robot concreto (SO-100 follower); no es una política generalizable a otras tareas sin reentrenamiento.
- Sin datos de rendimiento: no se han publicado tasas de éxito, por lo que no se puede garantizar su fiabilidad en producción.
- Sin información sobre sesgos: no se detalla la composición demográfica del dataset ni posibles sesgos derivados de las demostraciones teleoperadas.
- Riesgo de sobreajuste al entorno de entrenamiento: al provenir de 50 episodios, es probable que la política sea sensible a cambios de iluminación, posición de objetos o configuración de cámara.
- Sin capacidades de lenguaje ni de razonamiento simbólico: no apto para tareas de texto, agentes conversacionales ni tool calling.
- Contexto: no aplica ventana de contexto de lenguaje; el horizonte efectivo depende del tamaño del action chunk y del historial de observaciones, que no se especifica.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserven los avisos de licencia y atribución; no se detectan restricciones adicionales en la información disponible.
- Fecha de creación inusual (2026-10-07) en los metadatos; conviene verificar la procedencia del checkpoint antes de usarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miladgholami/act_p0_rectified
- Dataset de entrenamiento: https://huggingface.co/datasets/miladgholami/scissor_p0_fixed_50ep_rectified
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Perfil del autor en Hugging Face: https://huggingface.co/miladgholami
- Modelo relacionado del mismo autor: https://huggingface.co/miladgholami/act_posevary_rectified
