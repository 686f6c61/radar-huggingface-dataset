# Haku-2004/act_is120e_base_20

## Resumen

El modelo `Haku-2004/act_is120e_base_20` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada por el usuario Haku-2004 en Hugging Face. Lo relevante no es que sea un modelo de lenguaje, sino un checkpoint de robótica entrenado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales. ACT predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y mejora la tasa de éxito en tareas de manipulación.

El checkpoint contiene 51.668.614 parámetros en formato safetensors (0,2 GB), lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware de consumo. Está entrenado sobre el dataset `Haku-2004/i_20261126_110221` y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante ahora porque el ecosistema LeRobot está estandarizando el entrenamiento y despliegue de políticas robóticas con la misma ergonomía que los modelos de lenguaje: un comando de entrenamiento, un comando de evaluación y compatibilidad con robots tipo SO-100. Este checkpoint concreto es un ejemplo de política ACT lista para evaluar en un follower SO-100, aunque su utilidad práctica está acotada al dataset y la tarea concreta con la que se entrenó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje; ventana definida por la configuración de observaciones del entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un esquema de predicción por chunks: en lugar de generar una acción por paso, el modelo emite una secuencia corta de acciones futuras, lo que mitiga el problema de los errores compuestos en horizontes largos y suaviza la ejecución. La arquitectura incluye un encoder que procesa las observaciones (típicamente imágenes de cámaras y estado de las articulaciones) y un decoder que produce los chunks de acción; el paper original (arXiv:2304.13705) describe también el uso de un CVAE para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/i_20261126_110221`, compuesto por teleoperaciones. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens (no aplica en el sentido de LLM) ni sobre si se aplicaron técnicas de RLHF o DPO; en el contexto de ACT no se emplean, ya que es aprendizaje supervisado por imitación. La model card no detalla hiperparámetros, aumentos de datos ni innovaciones adicionales más allá de las propias del método ACT.

## Capacidades

- Predicción de chunks de acción para control robótico de manipulación, en lugar de acciones paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones multimodales según la configuración de entrenamiento (imágenes de cámaras y estado de articulaciones), aunque la model card no detalla la configuración exacta.
- Ejecución en tiempo real sobre robots de bajo coste tipo SO-100 follower, según el flujo de evaluación documentado con `lerobot-record`.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- Manipulación robótica de pick-and-place: la política predice chunks de acción que permiten al brazo aproximarse, agarrar y depositar objetos; adecuada porque ACT reduce el error acumulado en secuencias de varios pasos.
- Evaluación de pipelines de aprendizaje por imitación: sirve como checkpoint de referencia para comparar tasas de éxito con otras políticas entrenadas con LeRobot sobre el mismo dataset.
- Prototipado rápido en robótica de bajo coste: al ocupar 0,2 GB y 51,7 M de parámetros, se puede ejecutar en una GPU de consumo junto al resto del stack de control, lo que facilita iterar en laboratorios con presupuesto limitado.
- Despliegue en robots SO-100 follower: el flujo `lerobot-record` con `--policy.path` permite grabar episodios de evaluación de forma directa, útil para validar la política antes de integrarla en una celda real.
- Investigación en chunking de acciones: permite reproducir experimentos sobre el tamaño de chunk, la frecuencia de control y la robustez frente a perturbaciones, comparando con la implementación de referencia del paper.
- Generación de datos de evaluación etiquetados: los episodios grabados con prefijo `eval_` permiten construir conjuntos de validación para medir la generalización de la política a condiciones ligeramente distintas.
- Base para fine-tuning en una tarea nueva: al ser un checkpoint ACT completo con licencia Apache 2.0, se puede reentrenar o ajustar sobre un dataset propio de teleoperación sin restricciones legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,2 GB en safetensors; con overhead de activaciones y del resto del stack de percepción, es razonable asumir menos de 2 GB, aunque no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente por tamaño; para control en tiempo real se recomienda una RTX 3060 o superior, y para entrenamiento una RTX 4090 o A100/H100 según el tamaño del dataset.
- Cabe en GPU de consumo: sí, con margen amplio, incluidas GPUs de gama media y posiblemente iGPU con suficiente memoria compartida, aunque no se documenta.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch/CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen de la frecuencia de control del robot, del número de cámaras y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_is120e_base_20 | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| ACT de referencia (paper 2304.13705) | no disponible en la informacion | no disponible | resultados del paper original | no disponible en la informacion | implementación en LeRobot |
| Otras políticas LeRobot (p. ej. Diffusion Policy, VQ-BeT) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Hugging Face / LeRobot |

No se dispone de datos de benchmarks ni de parámetros de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con teleoperaciones de un operador y un entorno concretos, la política hereda los sesgos de esa distribución (posiciones, iluminación, objetos y velocidades vistas en el dataset).
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de acciones erráticas fuera de distribución, que en un robot puede traducirse en colisiones o daños.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa instrucciones en lenguaje natural ni mantiene conversaciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni sobre la seguridad del despliegue.
- Caveats para producción: la model card no documenta la tarea, el robot exacto, el número de episodios ni la tasa de éxito; antes de usar el checkpoint en una celda real es imprescindible evaluarlo con `lerobot-record` en el mismo robot y entorno.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en menos de un minuto, lo que sugiere un checkpoint de prueba sin validación comunitaria.
- No se documentan cuantizaciones ni formatos alternativos, lo que limita su uso en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_is120e_base_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_20261126_110221
