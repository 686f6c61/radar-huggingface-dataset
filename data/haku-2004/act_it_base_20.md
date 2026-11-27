# Haku-2004/act_it_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_it_base_20`, es una política ACT entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

El modelo tiene 51.668.614 parámetros y está empaquetado en safetensors con un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. Se distribuye bajo licencia Apache 2.0 y su pipeline es `robotics`, orientado a control de brazos robóticos teleoperados.

Su relevancia radica en que ejemplifica el flujo estándar de LeRobot: entrenamiento desde un dataset de demostraciones teleoperadas (`Haku-2004/i_20261126_110221`) y despliegue mediante `lerobot-record` sobre un robot SO-100 follower. No obstante, la información pública disponible es mínima: no hay benchmarks, ni detalles de composición del dataset, ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que, a partir de observaciones (típicamente imágenes de cámaras y estado de las articulaciones), predice una secuencia de acciones futuras de longitud fija en lugar de una única acción por paso. Esta estrategia de *chunking* mitiga el problema de la acumulación de errores en políticas autoregresivas paso a paso y permite un control más suave. La implementación concreta sigue la del paper arXiv:2304.13705 y la integración de LeRobot.

El entrenamiento se realizó mediante aprendizaje por imitación supervisada sobre el dataset `Haku-2004/i_20261126_110221`, compuesto presumiblemente por demostraciones teleoperadas. No se dispone de información sobre el número de episodios, la composición del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco hay datos sobre RLHF, DPO ni innovaciones específicas más allá del propio mecanismo de action chunking.

## Capacidades

- Predicción de acciones robóticas en forma de chunks para control de manipuladores.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot (entrenamiento, evaluación y despliegue).
- Ejecución de políticas sobre robots SO-100 follower mediante `lerobot-record`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, de visión general ni de audio; su entrada visual se limita a las observaciones del robot.
- No incluye modo *thinking* ni decodificación especulativa.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar tareas de pick-and-place aprendidas de demostraciones humanas, aprovechando el chunking para suavizar la trayectoria y reducir el jitter.
- Prototipado rápido de políticas con LeRobot: un investigador puede reentrenar o afinar esta base con su propio dataset y evaluar en 10 episodios con `lerobot-record`, lo que acelera la iteración experimental.
- Automatización de tareas repetitivas en entornos controlados: dado su tamaño reducido (51,7 M de parámetros), es viable desplegarlo en estaciones de trabajo con GPU de gama media para tareas de ensamblaje o clasificación.
- Investigación en aprendizaje por imitación: sirve como referencia base para comparar variantes de ACT, cambios en la longitud del chunk o estrategias de aumento de datos.
- Educación y docencia en robótica: el flujo completo de entrenamiento y evaluación con LeRobot y un SO-100 es reproducible con recursos limitados, lo que lo hace adecuado para cursos prácticos.
- Evaluación de robustez frente a variaciones de iluminación o posición de objetos: al ser una política entrenada sobre un dataset concreto, permite estudiar la generalización y el dominio de validez del modelo en condiciones ligeramente distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parámetros; en la práctica, el cuello de botella es el procesamiento de imágenes de las cámaras, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; se ha documentado el uso con `--policy.device=cuda` en el flujo de LeRobot.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores; también es viable en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de checkpoints locales o desde el Hub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependerán de la frecuencia de control del robot y de la resolución de las cámaras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_it_base_20 | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | variable | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no disponible | no disponible | Apache 2.0 | Hugging Face |
| VQ-BeT (LeRobot) | variable | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica fiable con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset concreto de demostraciones, la política hereda los sesgos de las trayectorias humanas y del entorno de recogida; no se documentan análisis de sesgo.
- Riesgo de alucinación: en robótica, se traduce en acciones fuera de distribución o movimientos no seguros ante observaciones novedosas; no hay evaluación de robustez publicada.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto lingüístico; el alcance está limitado al dominio visual y cinemático del dataset de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset de entrenamiento.
- Caveats para producción: sin benchmarks ni métricas de éxito publicadas, no se recomienda su despliegue en entornos críticos sin una evaluación propia; el modelo tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- [Hugging Face: Haku-2004/act_it_base_20](https://huggingface.co/Haku-2004/act_it_base_20)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [LeRobot Docs](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de políticas](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Dataset de entrenamiento: Haku-2004/i_20261126_110221](https://huggingface.co/datasets/Haku-2004/i_20261126_110221)
