# phawitbinabik/act_DSCUBE_1O1B_FF_N20

## Resumen

ACT (Action Chunking with Transformers) aplicado al dataset DSCUBE_1O1B_FF_N20 es una política de aprendizaje por imitación entrenada con LeRobot y publicada por el usuario phawitbinabik en Hugging Face. El modelo resuelve el problema de control robótico de manipulación: dado un conjunto de observaciones (típicamente imágenes de cámaras e información de estado del robot), predice secuencias cortas de acciones articulares en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del comportamiento.

El modelo tiene 51.668.614 parámetros, se distribuye en formato safetensors y ocupa 0,2 GB en el repositorio. Está pensado para ejecutarse con la librería LeRobot y el pipeline de robótica de Hugging Face, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Es relevante ahora porque ejemplifica el flujo estándar de entrenamiento y despliegue de políticas de imitación en LeRobot, una herramienta que está bajando la barrera de entrada para laboratorios y desarrolladores que quieren prototipar control robótico sin infraestructura propietaria.

La información pública disponible es escasa: no hay resultados de benchmarks, no se detallan los idiomas (no aplica en sentido estricto a un modelo de robótica) ni la composición exacta del dataset de entrenamiento más allá de su identificador. La ficha refleja, por tanto, lo que puede verificarse a partir de la model card, los metadatos de Hugging Face y el paper de ACT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone transformer que procesa las observaciones (imágenes de las cámaras del robot y estado de las articulaciones) con un decodificador que genera *chunks* de acciones, es decir, bloques de varias acciones consecutivas en lugar de una sola. Esta predicción por bloques mitiga el problema de la acumulación de errores típico de las políticas que predicen un paso a la vez y suaviza la varianza temporal en la ejecución. El modelo incorpora además una componente de estilo CVAE (autoencoder variacional condicional) que modela la variabilidad de las demostraciones humanas durante el entrenamiento y se descarta en inferencia.

El entrenamiento se realiza sobre el dataset `phawitbinabik/DSCUBE_1O1B_FF_N20`, compuesto por teleoperaciones. No se especifican en la información disponible el número de episodios, el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables en el paradigma de imitación supervisada). La model card indica que el modelo se entrenó y subió al Hub mediante LeRobot, con el comando `lerobot-train` y `--policy.type=act`, y que la evaluación se realiza con `lerobot-record` sobre un robot `so100_follower`.

## Capacidades

- Generación de secuencias de acciones articulares para control robótico de manipulación, en formato de *action chunks*.
- Procesamiento de observaciones multimodales: imágenes de cámaras y estado del robot.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución en tiempo real sobre robots compatibles con LeRobot (por ejemplo, SO-100 follower).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso.
- No dispone de capacidades multilingües, de visión general ni de audio.
- No dispone de modo de razonamiento (*thinking mode*) ni de generación de texto.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede ejecutar tareas de pick-and-place aprendidas de demostraciones humanas, prediciendo bloques de acciones que reducen el jitter y mejoran la repetibilidad en brazos tipo SO-100.
- Prototipado rápido de políticas de imitación: un equipo puede entrenar una política ACT con `lerobot-train` sobre su propio dataset y desplegarla con `lerobot-record` en cuestión de horas, usando este modelo como referencia de flujo de trabajo.
- Evaluación comparativa de datasets de teleoperación: sirve como baseline para medir la calidad de un dataset concreto (`DSCUBE_1O1B_FF_N20`) frente a otros conjuntos de demostraciones.
- Investigación en aprendizaje por imitación: permite reproducir el método ACT y experimentar con variantes de chunking, aumentación de datos o arquitecturas de codificador visual.
- Automatización de tareas repetitivas en entornos controlados: tareas de ensamblaje o clasificación de piezas donde el robot opera en un espacio de trabajo fijo y las condiciones de iluminación son estables.
- Formación y docencia en robótica: el modelo y su pipeline asociado permiten ilustrar el ciclo completo de teleoperación, entrenamiento y despliegue en un curso práctico.
- Integración en pipelines de investigación con ROS 2: aunque LeRobot no es ROS nativo, la política puede envolverse como nodo de control que recibe observaciones y publica comandos de articulaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~51,7 M de parámetros en safetensors (aproximadamente 0,2 GB en fp32), la inferencia cabe holgadamente en GPUs de consumo; se estima un uso de VRAM inferior a 2 GB incluyendo buffers de activaciones y batches pequeños, aunque no se dispone de mediciones publicadas.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar la política sin problemas. Para entrenamiento se recomienda una RTX 3090/4090 o una A100/H100 si se entrena con datasets grandes y aumentación de datos.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs NVIDIA modernas e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con PyTorch; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_DSCUBE_1O1B_FF_N20 (este) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la información | no aplica | resultados publicados en el paper, no comparables directamente | no disponible | referencia académica |
| Diffusion Policy (alternativa de imitación) | no disponible en la información | no aplica | no disponible | no disponible | repositorios públicos |
| VQ-BeT (alternativa de imitación) | no disponible en la información | no aplica | no disponible | no disponible | repositorios públicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente con demostraciones de un dataset concreto (`DSCUBE_1O1B_FF_N20`), la política hereda los sesgos de ese conjunto: condiciones de iluminación, posiciones de objetos, tipos de robot y estilo de teleoperación. Fuera de esa distribución, el rendimiento puede degradarse drásticamente.
- Riesgo de alucinación: en el sentido de generar acciones plausibles pero incorrectas cuando la observación se sale del dominio de entrenamiento; no hay mecanismo de verificación interno.
- Limitaciones de contexto o idioma: no aplica ventana de contexto textual ni capacidades lingüísticas; el modelo no procesa instrucciones en lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y sin garantías; conviene revisar las obligaciones de la licencia en el producto final.
- Caveats para producción: la información pública no documenta la tasa de éxito, el número de episodios de entrenamiento ni las condiciones de evaluación, por lo que no es posible estimar su fiabilidad en producción sin una evaluación propia. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Dependencia de LeRobot: el despliegue requiere la librería LeRobot y un robot compatible (por ejemplo, SO-100 follower); no es un modelo autónomo fuera de ese ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/phawitbinabik/act_DSCUBE_1O1B_FF_N20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/phawitbinabik/DSCUBE_1O1B_FF_N20
