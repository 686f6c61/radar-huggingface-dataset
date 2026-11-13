# Haku-2004/act_k5oend_input_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice fragmentos cortos de acciones en lugar de pasos individuales. Este repositorio concreto, publicado por el usuario Haku-2004 bajo el identificador `act_k5oend_input_20`, contiene una política ACT entrenada con la librería LeRobot de Hugging Face sobre el dataset `Haku-2004/k5_4seg`. No se trata de un modelo de lenguaje, sino de un checkpoint de robótica orientado a la ejecución de tareas manipulativas a partir de demostraciones teleoperadas.

El modelo emplea una arquitectura transformer con un codificador visual y un decodificador de acciones que genera secuencias de comandos motores, una innovación descrita en el artículo arXiv:2304.13705. Con 51.671.174 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware de consumo o estaciones de trabajo con GPU modesta.

Su relevancia actual radica en que forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas en formato safetensors y con integración directa en el Hub. La licencia Apache 2.0 facilita su reutilización comercial, aunque la información pública disponible sobre el dataset de entrenamiento y los resultados obtenidos es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT: Action Chunking with Transformers), política de aprendizaje por imitación con codificador visual y decodificador de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de modelos de lenguaje; la política opera sobre observaciones visuales y estado del robot por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k5_4seg |
| Tamano del repositorio | 0,2 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un codificador de imágenes (habitualmente ResNet preentrenado) con un transformer encoder-decoder que procesa la observación y el estado del robot para predecir un chunk de acciones futuras. La predicción por chunks, en lugar de acción a acción, reduce el error de compounding y mejora la estabilidad de la política en tareas de manipulación. El modelo incorpora además una componente de estilo CVAE que modela la variabilidad de las demostraciones humanas durante el entrenamiento.

El entrenamiento se realiza mediante aprendizaje por imitación supervisado sobre teleoperaciones, sin refuerzo ni RLHF. En este caso concreto, el autor indica que la política se entrenó con LeRobot sobre el dataset `Haku-2004/k5_4seg`, pero no se especifican el número de episodios, la composición del dataset, la plataforma robótica exacta ni los hiperparámetros empleados. Tampoco se documenta si se aplicaron técnicas de aumento de datos o regularización adicionales.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación a partir de observaciones visuales y estado del robot.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución de políticas en tiempo real mediante el comando `lerobot-record` con `--policy.path`.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`), evaluación y registro de episodios.
- Soporte de despliegue sobre robots compatibles con LeRobot, como el `so100_follower` mencionado en la model card.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling ni agentes multi-paso.

## Casos de uso

- Manipulación robótica de precisión en entornos controlados: la política predice secuencias de acciones cortas que permiten ejecutar tareas de pick-and-place con corrección continua a partir de la observación visual.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT, cambios en el dataset o configuraciones de entrenamiento dentro de LeRobot.
- Prototipado rápido de robots de bajo coste: al ser un modelo de 51,7 millones de parámetros y 0,2 GB, puede ejecutarse en estaciones con GPU de consumo y en el robot `so100_follower`, lo que facilita iteraciones en laboratorios con presupuesto limitado.
- Reentrenamiento sobre nuevos datasets: el flujo `lerobot-train --policy.type=act` permite adaptar la política a otras tareas o plataformas partiendo de la misma receta.
- Evaluación reproducible de políticas: el comando `lerobot-record` con prefijo `eval_` y `--policy.path` permite generar episodios de evaluación estandarizados y comparar el rendimiento entre checkpoints.
- Docencia y formación en robótica: el modelo y su pipeline asociado permiten ilustrar el ciclo completo de teleoperación, entrenamiento y despliegue sin requerir infraestructura pesada.
- Automatización de tareas repetitivas en laboratorio: la política puede integrarse en flujos donde se teleopera una tarea una vez y se replica mediante inferencia, reduciendo la intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 millones de parámetros, 0,2 GB en safetensors), la inferencia en precisión nativa requiere previsiblemente menos de 1 GB de VRAM, aunque no se documenta la huella exacta.
- GPU recomendadas: no disponible. La model card solo menciona `--policy.device=cuda` como opción de entrenamiento.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el reducido número de parámetros, aunque no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de ejecución sobre robots compatibles como `so100_follower`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5oend_input_20 | 51.671.174 | no aplica | no disponible | apache-2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot | no disponible | no aplica | no disponible | generalmente apache-2.0 | Hugging Face Hub |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | no disponible | no disponible | Hugging Face Hub |
| Políticas VQ-BeT (LeRobot) | no disponible | no aplica | no disponible | no disponible | Hugging Face Hub |

No se dispone de datos públicos de rendimiento ni de especificaciones detalladas de las alternativas dentro del ecosistema LeRobot en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No se documentan los sesgos del modelo; al entrenarse sobre un dataset concreto (`Haku-2004/k5_4seg`), hereda las distribuciones y posibles sesgos de las demostraciones teleoperadas.
- Riesgo de fallo fuera de distribución: la política puede comportarse de forma impredecible ante objetos, iluminación o configuraciones no vistas durante el entrenamiento.
- No hay información sobre el número de episodios, la plataforma robótica exacta ni la calidad del dataset, lo que impide evaluar su robustez.
- No dispone de capacidades lingüísticas ni de contexto textual; no debe emplearse como modelo de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre seguridad física en entornos reales.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere ausencia de validación externa o uso comunitario.
- No se han publicado benchmarks ni resultados de evaluación, por lo que no se puede verificar su rendimiento frente a otras políticas.
- El despliegue en robots reales requiere medidas de seguridad adicionales (paradas de emergencia, límites de par, supervisión humana) no cubiertas por el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5oend_input_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
