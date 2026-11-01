# ketiholo/demo3_noside_env_gauss2_ch100

## Resumen

`ketiholo/demo3_noside_env_gauss2_ch100` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice trozos de acciones (*action chunks*) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado al dataset `ketiholo/demo3` del mismo autor.

Con 51.676.313 parámetros (aproximadamente 51,7 millones) y un repositorio de 0,2 GB, se trata de un modelo compacto orientado a control robótico de manipulación, no a generación de texto. Su relevancia radica en que ejemplifica el flujo de trabajo estándar de LeRobot: entrenamiento desde datos de teleoperación, publicación en el Hub y despliegue sobre robots tipo SO-100 mediante `lerobot-record`.

El nombre del repositorio sugiere una configuración experimental concreta (`noside`, `env_gauss2`, `ch100`), probablemente variantes del entorno, del ruido gaussiano aplicado y del tamaño del *chunk* de acciones (100 pasos), aunque el autor no documenta estos detalles en la model card. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.676.313 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | ketiholo/demo3 |
| Tamano del repositorio | 0,2 GB |
| Descargas | 17 |
| Fecha de creacion | 2026-10-30 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). La arquitectura combina un *backbone* visual (típicamente ResNet) que procesa las imágenes de las cámaras del robot con un transformer que modela la secuencia de observaciones y genera predicciones de acciones. La innovación central es la predicción de *chunks* de acciones: en lugar de emitir una acción por paso de control, el modelo genera un bloque de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina.

También incorpora un mecanismo de *temporal ensembling* durante la inferencia, que promedia las predicciones solapadas de chunks consecutivos para suavizar la trayectoria. El entrenamiento se realiza exclusivamente con datos de teleoperación del dataset `ketiholo/demo3`, sin que la model card especifique el número de episodios, la composición de las tareas ni si se aplicaron técnicas de aumento de datos. El sufijo `ch100` del nombre apunta a un tamaño de chunk de 100 pasos, y `gauss2` podría referirse a una configuración de ruido gaussiano en los datos o en el entorno, pero no hay documentación que lo confirme.

## Capacidades

- Control robótico de manipulación mediante imitación: genera secuencias de acciones articulares a partir de observaciones visuales y de estado del robot.
- Predicción de *action chunks*: emite bloques de acciones (presumiblemente de 100 pasos según el nombre) en lugar de acciones individuales, lo que mejora la estabilidad del control.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas ni de un simulador durante el entrenamiento.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y despliegue sobre robots SO-100.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente motor-visual.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades cognitivas.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede ejecutar tareas de agarre y colocación aprendidas de demostraciones humanas, adecuado para prototipos con robots de bajo coste como el SO-100.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT (por ejemplo, con y sin *side* cameras, o distintos tamaños de chunk) gracias a su licencia permisiva y su tamaño reducido.
- Automatización de tareas repetitivas en entornos controlados: con 51,7 M de parámetros, se puede ejecutar en hardware modesto y desplegar en estaciones de trabajo con una sola GPU consumer.
- Evaluación de políticas en robots de bajo coste: el flujo `lerobot-record` permite grabar episodios de evaluación y medir tasas de éxito de forma sistemática.
- Docencia y formación: modelo pequeño y con licencia Apache 2.0 que ilustra el ciclo completo de entrenamiento, publicación y despliegue de una política robótica.
- Base para *fine-tuning* en tareas específicas: al ser un checkpoint compacto, se puede reentrenar con nuevos datasets de teleoperación para adaptarlo a otras tareas de manipulación.
- Pruebas de integración en pipelines de robótica con LeRobot: validación de versiones de la librería, del formato de datasets y del flujo de evaluación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para los 51,7 M de parámetros, más el consumo del *backbone* visual y de los buffers de imagen; en la práctica, menos de 2 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070/4070, A100, H100) según el tamaño del dataset y el número de cámaras.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna, e incluso podría ejecutarse en CPU para inferencia con latencia mayor.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, del número de cámaras y del tamaño del chunk de acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/demo3_noside_env_gauss2_ch100 | 51,7 M | no disponible | ACT (action chunking) | apache-2.0 | Hugging Face (17 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | no disponible | ACT | apache-2.0 | Hugging Face / LeRobot |
| Diffusion Policy | no disponible | no disponible | difusión para acciones | no disponible | Hugging Face / LeRobot |
| VQ-BeT | no disponible | no disponible | cuantización vectorial de comportamiento | no disponible | Hugging Face / LeRobot |

No se dispone de datos comparativos de rendimiento entre estas políticas en la información proporcionada. La comparación se limita al enfoque metodológico y a la disponibilidad.

## Limitaciones y advertencias

- Modelo específico de una tarea y un entorno: entrenado con el dataset `ketiholo/demo3`, probablemente no generaliza a otras tareas, robots o configuraciones de cámara sin reentrenamiento.
- Sin documentación de la configuración experimental: el nombre sugiere variantes (`noside`, `gauss2`, `ch100`) que no se explican en la model card, lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste a las condiciones de iluminación, posiciones de objetos y características del robot presentes en las demostraciones.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones independientes que permitan estimar su fiabilidad en producción.
- Sin capacidades lingüísticas ni de razonamiento: no es adecuado para tareas de texto, código o agentes conversacionales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y atribución; no hay restricciones adicionales documentadas.
- Número de descargas muy bajo (17) y ausencia de likes: indica escasa validación por parte de la comunidad; conviene tratarlo como un experimento y no como un modelo de referencia.
- Para producción robótica, es imprescindible validar la política en el robot real con protocolos de seguridad, ya que los fallos de control pueden causar daños físicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/demo3_noside_env_gauss2_ch100
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo3
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
