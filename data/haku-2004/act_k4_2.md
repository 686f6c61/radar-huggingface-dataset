# Haku-2004/act_k4_2

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. El modelo `act_k4_2`, publicado por el usuario Haku-2004, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k4_20261102_134735` y distribuida en formato safetensors con licencia Apache 2.0.

Se trata de un modelo de robótica de tipo "policy" (no un LLM): su entrada son observaciones del robot (típicamente imágenes de cámaras e información de estado de las articulaciones) y su salida son acciones motrices para un robot seguidor, en este caso aparentemente un SO-100/SO-101 (la documentación de LeRobot referencia `so100_follower`). Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware de consumo.

Es relevante ahora porque forma parte del ecosistema LeRobot de Hugging Face, que está estandarizando el entrenamiento y despliegue de políticas robóticas open source. Este checkpoint concreto tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un experimento personal más que un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de observación definidas por la política) |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en cada paso de inferencia, predice un chunk de acciones futuras en lugar de una sola acción. La arquitectura combina un backbone visual (codificador de imágenes de las cámaras del robot) con un transformer encoder-decoder que fusiona observaciones visuales y estado proprioceptivo para generar la secuencia de acciones. Esta formulación por chunks mitiga el problema de la acumulación de errores típico de las políticas paso a paso y produce trayectorias más suaves.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k4_20261102_134735`, compuesto por demostraciones teleoperadas. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens (no aplica) ni sobre si se aplicaron técnicas de RLHF/DPO (no procede en este paradigma). Tampoco se documentan innovaciones adicionales más allá de las propias del método ACT original (paper arXiv:2304.13705).

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado del robot.
- Aprendizaje a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Predicción de secuencias de acciones (action chunking), lo que mejora la suavidad y reduce el error acumulado.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación/despliegue (`lerobot-record`).
- Compatible con robots seguidores del tipo SO-100/SO-101 según la documentación de referencia de LeRobot.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: es una política motriz, no un modelo generativo de texto.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede ejecutar tareas de pick-and-place reproducidas de las demostraciones del dataset `k4_20261102_134735`, adecuado por su entrenamiento específico en ese entorno.
- Prototipado rápido en robótica de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, se puede desplegar en un PC con GPU de consumo conectado a un SO-100 para experimentar con políticas de imitación.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, ya que el pipeline de LeRobot permite reentrenar y evaluar con comandos estandarizados.
- Automatización de tareas repetitivas de ensamblaje: al predecir chunks de acciones, el modelo genera trayectorias continuas útiles en tareas de inserción o colocación que requieren estabilidad.
- Evaluación comparativa de datasets: al estar vinculado a un dataset concreto, permite estudiar cómo la calidad y cantidad de demostraciones afectan al éxito de la política.
- Educación y demos de robótica open source: su licencia Apache 2.0 y su tamaño reducido facilitan su uso en cursos y talleres sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros, ~0,2 GB de pesos); en la práctica el cuello de botella es el codificador visual y el preprocesado de imágenes, no el tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. También es viable en CPU para inferencia a baja frecuencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en placas integradas para pruebas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k4_2 (este) | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| ACT original (referencia) | no disponible | no aplica | reportado en paper arXiv:2304.13705 | según implementación | Paper y código de referencia |
| Diffusion Policy | no disponible | no aplica | no disponible en esta ficha | no disponible | Implementaciones open source en robótica |
| Otras políticas LeRobot | variable | no aplica | no disponible | variable | Hugging Face (ecosistema LeRobot) |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una tarea y un entorno: entrenado sobre un único dataset, probablemente no generaliza a otras tareas, objetos o configuraciones de robot.
- Sin validación comunitaria: 0 descargas y 0 likes; no hay evidencia pública de éxito en evaluaciones independientes.
- Riesgo de sobreajuste a las condiciones de las demostraciones (iluminación, posiciones, fondo de cámara).
- No es un modelo de lenguaje: no procesa texto ni responde a instrucciones en lenguaje natural.
- Sin información sobre sesgos: no aplica en el sentido habitual, pero puede heredar sesgos de las demostraciones teleoperadas (por ejemplo, trayectorias subóptimas del operador).
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia del dataset asociado antes de un despliegue en producción.
- En producción requiere integración con el stack LeRobot y un robot compatible; no hay documentación de latencia ni de robustez ante fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k4_2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/Haku-2004/k4_20261102_134735
