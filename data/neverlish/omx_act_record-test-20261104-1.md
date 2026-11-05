# neverlish/omx_act_record-test-20261104-1

## Resumen

El modelo `neverlish/omx_act_record-test-20261104-1` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo desarrolla el usuario neverlish y se ha entrenado y publicado mediante LeRobot, la librería de Hugging Face para robótica. El modelo resuelve el problema del control robótico a partir de datos de teleoperación: en lugar de aprender una política paso a paso, aprende a predecir secuencias de acciones, lo que reduce el error acumulado y mejora la tasa de éxito en tareas de manipulación.

La arquitectura es un transformer (ACT) con 51.668.614 parámetros totales, empaquetado en safetensors y con un tamaño de repositorio de 0,2 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El modelo está asociado al dataset `neverlish/record-test-20261104-1`, lo que sugiere que se trata de un artefacto de prueba o experimento de entrenamiento más que de un modelo de producción consolidado.

Es relevante ahora porque forma parte del ecosistema LeRobot, que está estandarizando el entrenamiento y despliegue de políticas robóticas en Hugging Face. Sin embargo, la ausencia de descargas, likes y benchmarks publicados indica que es un modelo recién creado y sin validación externa, por lo que debe tratarse con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura se basa en un transformer que, en lugar de predecir una única acción por paso de tiempo, predice un fragmento (chunk) de acciones futuras. Esta estrategia reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad del control. El modelo aprende a partir de datos de teleoperación, es decir, de demostraciones humanas grabadas sobre un robot.

El entrenamiento se ha realizado con LeRobot, la librería de Hugging Face para robótica, utilizando el dataset `neverlish/record-test-20261104-1`. No se dispone de información sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de robótica). Tampoco se documentan innovaciones técnicas adicionales más allá del propio método ACT. El nombre del repositorio (`record-test`) sugiere que se trata de un experimento de prueba más que de un modelo entrenado para una tarea específica de producción.

## Capacidades

- Control robótico por imitación: predice fragmentos de acciones para tareas de manipulación aprendidas de datos de teleoperación.
- Aprendizaje por imitación: no requiere refuerzo explícito; aprende de demostraciones humanas.
- Predicción de action chunks: genera secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la estabilidad.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación e inferencia de LeRobot.
- Despliegue en robots tipo SO-100 follower (según el ejemplo de la model card).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües, ya que no es un modelo de lenguaje.
- No dispone de modo thinking, visión, audio ni capacidades generativas de texto.

## Casos de uso

- Manipulación robótica de precisión: el modelo puede ejecutar tareas de agarre y colocación aprendidas de demostraciones humanas, gracias a la predicción de action chunks que reduce el error acumulado en secuencias largas.
- Automatización de tareas repetitivas en laboratorio: se puede entrenar con datos de teleoperación para reproducir movimientos concretos en un robot SO-100, adecuado para experimentos de investigación en robótica.
- Evaluación de políticas de imitación: sirve como referencia para comparar el rendimiento de ACT frente a otras políticas en el ecosistema LeRobot, usando el comando `lerobot-record` para medir tasas de éxito.
- Prototipado rápido en robótica: al estar integrado en LeRobot y tener licencia Apache 2.0, permite a desarrolladores experimentar con entrenamiento e inferencia sin restricciones legales.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto del action chunking en tareas de manipulación, comparando con políticas paso a paso.
- Despliegue en entornos controlados de laboratorio: adecuado para pruebas de concepto en robots de bajo coste (SO-100), no recomendado para entornos industriales sin validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 51,7 millones de parámetros, el modelo es muy ligero y probablemente quepa en GPUs de gama baja, pero no se proporcionan datos concretos.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `--policy.device=cuda`, lo que indica que requiere una GPU con CUDA, pero no se especifica el modelo.
- ¿Cabe en consumer GPU? No disponible, aunque por el tamaño (0,2 GB en safetensors) es plausible que quepa en GPUs consumer, pero no se confirma.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neverlish/omx_act_record-test-20261104-1 | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| ACT original (paper arXiv:2304.13705) | no disponible | no disponible | reportado en paper | no disponible | paper |
| Otras políticas LeRobot (p. ej. Diffusion Policy) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Modelo de prueba: el nombre `record-test` y la ausencia de descargas sugieren que no ha sido validado externamente ni entrenado para una tarea de producción.
- Sin benchmarks publicados: no hay evidencia de tasas de éxito ni de rendimiento en tareas reales.
- Dependencia del dataset: el rendimiento está ligado al dataset `neverlish/record-test-20261104-1`, del que no se conoce su composición ni calidad.
- Sin soporte de lenguaje: no es un modelo de texto, por lo que no aplican sesgos lingüísticos, pero tampoco capacidades de razonamiento o generación.
- Riesgo de sobreajuste: al ser un modelo pequeño entrenado con un dataset de prueba, puede no generalizar a otras tareas o entornos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No apto para producción sin validación: no se recomienda su despliegue en entornos industriales o críticos sin una evaluación exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/neverlish/omx_act_record-test-20261104-1
- Paper ACT: https://huggingface.co/papers/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset: https://huggingface.co/datasets/neverlish/record-test-20261104-1
