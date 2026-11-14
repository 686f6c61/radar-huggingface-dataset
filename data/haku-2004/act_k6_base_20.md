# Haku-2004/act_k6_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_k6_base_20`, es una política entrenada con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939` y publicada en Hugging Face con licencia Apache 2.0. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real.

El modelo resuelve el problema de la manipulación robótica mediante teleoperación: aprende de demostraciones humanas y genera comandos de acción de forma autónoma. La innovación principal de ACT, descrita en el paper arXiv:2304.13705, es la predicción de chunks de acciones, que reduce el error de acumulación y mejora la estabilidad frente a políticas que predicen un único paso. Es relevante porque permite desplegar políticas de imitación con hardware asequible (por ejemplo, brazos SO-100) y un flujo de entrenamiento reproducible con LeRobot.

La información disponible no incluye detalles sobre la arquitectura interna más allá de la referencia al paper, ni datos sobre el número de tokens de entrenamiento, composición del dataset o resultados de benchmarks. La model card se limita a indicar el procedimiento de entrenamiento e inferencia con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice chunks de acciones de longitud fija en lugar de acciones individuales. La arquitectura completa se describe en el paper arXiv:2304.13705, pero la model card no proporciona detalles adicionales sobre el número de capas, dimensiones de atención o mecanismos específicos implementados en esta instancia concreta. El modelo se entrenó con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, que contiene datos de teleoperación. No se dispone de información sobre el número de episodios, la composición del dataset, el número total de tokens de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente en aprendizaje por imitación robótico).

La innovación técnica principal de ACT es la predicción de chunks de acciones, que mitiga el problema de acumulación de errores en políticas de imitación paso a paso. El entrenamiento se realizó con el comando `lerobot-train` y la configuración `--policy.type=act`, según la model card. No se especifican hiperparámetros, duración del entrenamiento ni detalles sobre el robot utilizado durante la recolección de datos.

## Capacidades

- Control robótico mediante aprendizaje por imitación: genera comandos de acción para robots manipuladores a partir de observaciones visuales y propioceptivas.
- Predicción de chunks de acciones: emite secuencias cortas de acciones en cada paso de inferencia, lo que mejora la estabilidad y reduce el error acumulado.
- Entrenamiento reproducible con LeRobot: compatible con el flujo `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Inferencia en tiempo real: el tamaño reducido (51,7 M de parámetros) permite ejecución en hardware de consumo.
- Integración con robots SO-100: la model card menciona `so100_follower` como robot de evaluación.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito (no aplicables a un modelo de robótica).

## Casos de uso

- Manipulación robótica de precisión: el modelo puede ejecutar tareas de pick-and-place aprendidas de demostraciones humanas, usando chunks de acciones para mantener la estabilidad durante la trayectoria. Es adecuado por su tamaño reducido y su entrenamiento específico sobre el dataset `k6_20`.
- Evaluación de políticas en brazos SO-100: mediante `lerobot-record` con `--robot.type=so100_follower`, se puede desplegar el modelo en un robot de bajo coste para validar la política en entornos reales.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de comparación con otras políticas (diffusion policy, VQ-BeT) gracias a su licencia permisiva y su integración con LeRobot.
- Automatización de tareas repetitivas en laboratorio: el modelo puede reproducir secuencias de acciones teleoperadas para tareas como clasificación de objetos o ensamblaje simple, reduciendo la necesidad de programación explícita.
- Prototipado rápido de robots colaborativos: al ser un modelo ligero (0,2 GB), se puede iterar rápidamente en el diseño de políticas y en la recolección de nuevos datos sin requerir infraestructura de GPU de gran escala.
- Despliegue en entornos con recursos limitados: la inferencia puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superiores) gracias al reducido número de parámetros, lo que facilita pruebas en laboratorios con presupuesto ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 (51,7 M de parámetros); en FP16, aproximadamente 0,1 GB. El repositorio ocupa 0,2 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se recomiendan RTX 3060, RTX 4090, A100 o H100 para entrenamiento, aunque la inferencia puede ejecutarse en GPUs integradas o CPUs modernas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con más de 2 GB de VRAM (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el ecosistema Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6_base_20 | 51,7 M | no disponible | Apache 2.0 | safetensors | Hugging Face |
| Diffusion Policy (referencia) | no disponible | no disponible | MIT (implementación original) | no disponible | Repositorios de investigación |
| VQ-BeT (referencia) | no disponible | no disponible | MIT (implementación original) | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a aspectos de licencia y disponibilidad; no se han publicado benchmarks en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente con el dataset `Haku-2004/k6_20_20261113_173939`, la política puede sobreajustarse a las condiciones específicas de recolección (iluminación, posiciones de objetos, robot utilizado) y fallar en entornos distintos.
- Riesgo de alucinación: no aplicable en el sentido lingüístico, pero la política puede generar acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplicable; el modelo no procesa lenguaje natural ni tiene ventana de contexto textual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de licencia y la atribución correspondiente.
- Caveats para producción: la model card no documenta la tasa de éxito, el número de episodios de entrenamiento ni las condiciones de evaluación. Se recomienda validar la política en el entorno real antes de desplegarla. La ausencia de benchmarks y de información sobre el dataset limita la evaluación de su robustez.

## Enlaces

- [Hugging Face: Haku-2004/act_k6_base_20](https://huggingface.co/Haku-2004/act_k6_base_20)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de políticas con LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset de entrenamiento: Haku-2004/k6_20_20261113_173939](https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939)
