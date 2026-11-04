# KyraLeeChunWei/Oxymetazoline_e200_20K_ACT

## Resumen

El modelo `Oxymetazoline_e200_20K_ACT` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica presentada en el artículo arXiv:2304.13705 que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Lo publica el usuario KyraLeeChunWei en HuggingFace mediante la librería LeRobot de HuggingFace, que estandariza el entrenamiento, evaluación y despliegue de políticas robóticas.

El modelo resuelve el problema del control robótico de manipulación a partir de datos de teleoperación: en lugar de generar una acción por paso de control, emite un bloque de acciones coherentes, lo que reduce el error acumulado y mejora la estabilidad de la política en tareas de imitación. Está entrenado sobre el dataset `KyraLeeChunWei/Oxymetazoline_e200`, con 20.000 pasos de entrenamiento según indica el nombre del repositorio.

Con 51.678.855 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware modesto. No es un modelo de lenguaje: es una política visomotora específica para un robot y una tarea concretos, por lo que su relevancia es acotada al ámbito de la robótica de imitación con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.678.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa observaciones por paso de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | KyraLeeChunWei/Oxymetazoline_e200 |
| Pasos de entrenamiento | 20K (segun nombre del repositorio) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: el modelo observa la imagen (o imágenes) de las cámaras del robot y el estado de las articulaciones, y emite un bloque de acciones futuras que se ejecutan de forma abierta durante varios pasos de control. Esta formulación reduce la varianza temporal y mitiga el problema de la acumulación de errores típico de las políticas paso a paso. El artículo original reporta que ACT alcanza tasas de éxito elevadas en tareas de manipulación con datos de teleoperación de baja calidad.

El entrenamiento se ha realizado con LeRobot sobre el dataset `Oxymetazoline_e200`, con 20.000 pasos según la convención de nombres del repositorio. No se dispone de información sobre la composición exacta del dataset, el número de episodios, las cámaras utilizadas, la frecuencia de control ni si se aplicaron aumentos de datos. Tampoco se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; ACT es puramente aprendizaje supervisado por imitación.

## Capacidades

- Control robótico de manipulación mediante imitación: genera chunks de acciones a partir de observaciones visuales y del estado del robot.
- Predicción de secuencias de acciones coherentes en el tiempo, lo que mejora la estabilidad frente a políticas paso a paso.
- Aprendizaje a partir de datos de teleoperación, sin necesidad de recompensas ni entorno simulado.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y despliegue sobre robots compatibles como `so100_follower`.
- Inferencia en tiempo real sobre GPU de consumo, dado el tamaño reducido del modelo.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de propósito general.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo ejecuta una tarea concreta aprendida por teleoperación (por ejemplo, agarre y colocación de objetos) sobre un robot SO-100 u otro compatible con LeRobot, aprovechando la predicción por chunks para suavizar el control.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT, tamaños de chunk o configuraciones de cámaras sobre el mismo dataset.
- Prototipado rápido de políticas: con 51,7 M de parámetros y 0,2 GB de pesos, se puede entrenar y desplegar en una estación de trabajo con una sola GPU consumer, lo que acelera ciclos de iteración.
- Automatización de tareas repetitivas en entornos controlados: el modelo puede ejecutar secuencias de pick-and-place en células de trabajo donde la variabilidad del entorno es baja y los datos de teleoperación son representativos.
- Evaluación comparativa de hardware robótico: al ser una política ligera, permite medir latencia de inferencia y throughput en distintas GPU (RTX 4090, A100) sin que el cuello de botella sea el modelo.
- Docencia y formación: reproducible con los comandos estándar de LeRobot, sirve para enseñar el flujo completo de teleoperación, entrenamiento y evaluación de una política visomotora.
- Despliegue embebido en robots de bajo coste: el tamaño reducido permite ejecutar la política en plataformas con GPU integrada o Jetson, siempre que se valide la latencia de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas sobre el dataset `Oxymetazoline_e200`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 51,7 M de parámetros (unos 207 MB solo de pesos), más el coste de las activaciones y del codificador visual; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas para el modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna, incluidas GTX 1650 o superiores.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y pesos safetensors; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y el número de cámaras de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oxymetazoline_e200_20K_ACT (este) | 51,7 M | no aplica | Manipulación con ACT sobre dataset propio | apache-2.0 | HuggingFace, LeRobot |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación con ACT en datasets estándar (p. ej. aloha, pusht) | apache-2.0 | HuggingFace, LeRobot |
| Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación por difusión de acciones | apache-2.0 (implementación) | HuggingFace, LeRobot |
| SmolVLA (HuggingFace) | no disponible en la información proporcionada | no aplica | Política visomotora basada en VLM | no disponible | HuggingFace, LeRobot |

La comparación directa con otras políticas no es posible sin métricas publicadas sobre el mismo dataset. La principal diferencia frente a Diffusion Policy es el esquema de generación (chunks deterministas frente a difusión), y frente a SmolVLA, el tamaño y la naturaleza del backbone.

## Limitaciones y advertencias

- Es una política específica para un robot y una tarea: no generaliza a otros robots, morfologías o entornos sin reentrenamiento.
- No es un modelo de lenguaje ni un VLM; no procesa instrucciones en lenguaje natural ni mantiene conversaciones.
- Riesgo de sobreajuste al dataset de teleoperación: la variabilidad de iluminación, posiciones de objetos y ruido de sensores puede degradar el rendimiento fuera de la distribución de entrenamiento.
- No se documentan sesgos, composición del dataset ni protocolo de evaluación; la ausencia de métricas publicadas impide estimar la tasa de éxito real.
- La licencia apache-2.0 permite uso comercial, pero el usuario debe verificar la licencia del dataset subyacente y los derechos sobre los datos de teleoperación.
- El nombre del repositorio sugiere un entrenamiento de 20K pasos, pero no se confirma en la model card; conviene validar la convergencia antes de desplegar en producción.
- No hay información sobre cuantización, por lo que el despliegue en hardware embebido requiere validación empírica de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KyraLeeChunWei/Oxymetazoline_e200_20K_ACT
- Dataset de entrenamiento: https://huggingface.co/datasets/KyraLeeChunWei/Oxymetazoline_e200
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
