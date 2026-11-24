# escapebirdy/dvrk_peg_cam01_baseframe_policy

## Resumen

`escapebirdy/dvrk_peg_cam01_baseframe_policy` es una política de control visuomotor entrenada con LeRobot y publicada en Hugging Face Hub por el usuario escapebirdy. No es un modelo de lenguaje: es una Diffusion Policy (según el paper arXiv 2303.04137) que trata el control visuomotor como un proceso generativo de difusión, produciendo trayectorias de acción multimodales y suaves. Está pensada para manipulación robótica con contacto rico, en este caso una tarea de inserción de clavija (peg-in-hole) sobre un simulador quirúrgico dVRK.

El modelo tiene 367.125.770 parámetros en formato safetensors y ocupa 1,5 GB en el repositorio. Se ha entrenado con el dataset `escapebirdy/dvrk_peg_cam012_baseframe`, aparentemente con una única cámara (cam01) y en un marco de referencia base. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación más allá de la plantilla estándar de LeRobot. Resulta útil como referencia de pipeline de entrenamiento de Diffusion Policy para tareas de ensamblaje, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor) |
| Parámetros totales | 367.125.770 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | `escapebirdy/dvrk_peg_cam012_baseframe` |
| Tamaño del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

La arquitectura es una Diffusion Policy: en lugar de predecir directamente una acción, el modelo aprende a denoizar una secuencia de acciones condicionada por observaciones visuales y el estado del robot. Esto permite generar trayectorias multimodales (varias soluciones válidas para una misma observación) y suaviza el comportamiento en tareas con contacto, como la inserción de una clavija. El número de parámetros (367 M) es coherente con una red de difusión convolucional o un transformer pequeño con codificador visual, típico de las implementaciones de LeRobot.

El entrenamiento se ha realizado con LeRobot sobre el dataset `escapebirdy/dvrk_peg_cam012_baseframe`, que por el nombre corresponde a una tarea de peg-in-hole del simulador dVRK (da Vinci Research Kit) con imágenes de cámara. No se especifican en la información disponible el número de episodios, el número de tokens o pasos de entrenamiento, la composición exacta del dataset, ni si hubo ajuste fino con RLHF o DPO (no aplica en este dominio). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de trayectorias de acción multimodales para control visuomotor de robots manipuladores.
- Ejecución de tareas de manipulación con contacto rico, específicamente inserción de clavija (peg-in-hole) en el entorno dVRK.
- Condicionamiento por observaciones visuales de una cámara (cam01 según el nombre del checkpoint) y estado del robot.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- Compatible con el flujo `lerobot-record` para evaluación sobre robots tipo `so100_follower` (según la plantilla de la model card).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general, audio ni modo de razonamiento.

## Casos de uso

- Investigación en manipulación con contacto: el modelo sirve como punto de partida para reproducir experimentos de Diffusion Policy en tareas de ensamblaje, comparando variantes de arquitectura y datasets.
- Prototipado de pipelines de imitación con LeRobot: se puede reentrenar con `lerobot-train` sobre un dataset propio y usar este checkpoint como referencia de configuración y número de parámetros.
- Evaluación de políticas en simulación dVRK: útil para medir la calidad de trayectorias generadas en inserción de clavija antes de transferir a hardware real.
- Benchmark interno de políticas de difusión: al tener 367 M de parámetros y licencia Apache 2.0, se puede comparar frente a políticas ACT o VQ-BeT en el mismo dataset sin restricciones legales.
- Docencia y formación: ejemplo didáctico de cómo se publica y se ejecuta una política de imitación con LeRobot, incluyendo el flujo de entrenamiento e inferencia.
- Base para fine-tuning en tareas de ensamblaje industrial: la licencia permisiva permite adaptar los pesos a tareas de inserción con geometrías similares en entornos controlados.
- Automatización de experimentos de laboratorio: si se dispone de un banco dVRK, la política puede ejecutar episodios de evaluación de forma repetible con `lerobot-record`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 367 M de parámetros en FP32 se requieren aproximadamente 1,5 GB solo para los pesos, más memoria para activaciones y el codificador visual. En FP16 cabría en torno a 0,8 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en FP16; para entrenamiento se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100) según el tamaño de lote y la resolución de las imágenes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, siempre que el resto del pipeline (simulador, codificador visual) no consuma el grueso de la memoria.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) como vía principal; el formato safetensors permite cargarlo con PyTorch directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. En Diffusion Policy la latencia depende del número de pasos de denoización configurados y de la frecuencia de control del robot, parámetros que no se detallan en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `escapebirdy/dvrk_peg_cam01_baseframe_policy` | 367 M | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy (implementación de referencia, paper 2303.04137) | no disponible | no aplica | resultados en paper original sobre tareas de manipulación | según repositorio original | código y pesos en el repositorio de los autores |
| Políticas ACT de LeRobot | no disponible | no aplica | sin datos comparables en esta ficha | Apache 2.0 (LeRobot) | Hugging Face Hub / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (peg-in-hole en dVRK) y en una única cámara (cam01); no generaliza a otras tareas sin reentrenamiento.
- Sin benchmarks publicados ni métricas de éxito reportadas: no hay evidencia cuantitativa de su rendimiento real.
- Cero descargas y cero likes en el momento de la consulta: no hay validación por parte de la comunidad.
- La model card es una plantilla de LeRobot con el ejemplo de entrenamiento usando `--policy.type=act`, lo que puede inducir a confusión: el modelo publicado es de tipo diffusion, no ACT.
- Riesgo de sobreajuste al dataset de entrenamiento y de fallo ante cambios de iluminación, posición de la cámara o geometría de la pieza.
- No aplica el riesgo de alucinación textual, pero sí el riesgo de generar trayectorias no válidas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- No se documentan sesgos, limitaciones de idioma ni restricciones adicionales de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/escapebirdy/dvrk_peg_cam01_baseframe_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/escapebirdy/dvrk_peg_cam012_baseframe
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
