# SamerAyyad/VLA_Samer_31.10.2026_450eps_policy_ACT_500k

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales. Este repositorio concreto, publicado por el usuario SamerAyyad bajo el identificador `VLA_Samer_31.10.2026_450eps_policy_ACT_500k`, contiene una política entrenada con LeRobot sobre un dataset propio de 450 episodios de teleoperación. El modelo está pensado para controlar un robot seguidor tipo SO-100 en tareas manipulativas aprendidas de demostraciones humanas.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un VLA generalista, sino de un checkpoint de política robótica de aproximadamente 51,7 millones de parámetros (0,2 GB en safetensors) entrenado para una tarea y un robot concretos. Su interés práctico reside en servir como ejemplo reproducible del flujo de entrenamiento y despliegue de LeRobot, y en que su licencia Apache 2.0 permite reutilizar el pipeline sin restricciones comerciales.

No hay información publicada sobre benchmarks, composición del dataset, hiperparámetros de entrenamiento ni resultados de evaluación en la model card. Todo lo que se detalla a continuación proviene de los metadatos del repositorio y de la documentación pública del método ACT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con codificador visual y decodificador de acciones (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observaciones y predice chunks de acciones) |
| Tipos de cuantización | no disponible (pesos en safetensors sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, a partir de observaciones visuales y del estado del robot, predice un chunk de acciones futuras en lugar de una única acción por paso. Esta estrategia de "action chunking" reduce el error de composición acumulado típico del comportamiento no markoviano en demostraciones humanas y suaviza la ejecución. El modelo combina un backbone visual para procesar las imágenes de cámara con un decodificador que genera la secuencia de acciones; la referencia metodológica es el paper arXiv:2304.13705.

El entrenamiento se ha realizado con LeRobot sobre el dataset `SamerAyyad/VLA_Samer_31.10.2026_450eps`, compuesto por 450 episodios de teleoperación. No se especifican en la model card el número de tokens, la composición exacta del dataset, la resolución de las cámaras, el tipo de robot empleado en la recogida de datos ni si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco se documentan hiperparámetros como el tamaño del chunk, la tasa de aprendizaje o el número de épocas.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) para un robot manipulador a partir de observaciones visuales y proprioceptivas.
- Aprendizaje a partir de teleoperación: reproduce comportamientos demostrados por un operador humano en el dataset de entrenamiento.
- Predicción de acciones en bloque: emite varios pasos de acción por inferencia, lo que mejora la estabilidad frente a políticas paso a paso.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots tipo SO-100 follower, según el ejemplo de evaluación de la model card.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, visión generalista ni capacidades multilingües.

## Casos de uso

- Manipulación robótica de laboratorio: reproducir una tarea concreta (por ejemplo, recoger y colocar objetos) aprendida de 450 episodios de teleoperación, usando el checkpoint directamente con `lerobot-record` sobre un SO-100 follower.
- Prototipado de pipelines de imitación: servir como referencia reproducible para validar el flujo completo de LeRobot (entrenamiento, checkpoints, evaluación) antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: comparar el rendimiento de ACT frente a otras políticas de LeRobot sobre el mismo dataset y robot, con una licencia permisiva que facilita la publicación de resultados.
- Docencia y formación: demostrar en cursos de robótica cómo se entrena una política visuomotora con datos de teleoperación y cómo se evalúa en un robot real.
- Base para fine-tuning: al ser un checkpoint Apache 2.0 de tamaño reducido (0,2 GB), puede reentrenarse o adaptarse a variantes de la misma tarea sin requisitos de hardware elevados.
- Despliegue en entornos de cómputo modesto: con 51,7 M de parámetros, la inferencia puede ejecutarse en GPUs de gama media o incluso en CPU para pruebas de integración, lo que facilita iterar en el laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM necesaria vendrá dominada por el backbone visual y los buffers de inferencia, no por los parámetros de la política.
- GPU recomendadas: no especificadas por el autor; el ejemplo oficial de LeRobot usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA con CUDA.
- GPU de consumo: por el tamaño del checkpoint, es razonable esperar que quepa en GPUs de consumo tipo RTX 3060/4060 o superiores, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_31.10.2026_450eps_policy_ACT_500k | 51,7 M | no aplica | no disponible | Apache 2.0 | HuggingFace |
| Otras políticas ACT de LeRobot | variable | no aplica | no disponible | habitualmente Apache 2.0 | HuggingFace |
| Diffusion Policy (referencia LeRobot) | variable | no aplica | no disponible | según checkpoint | HuggingFace |
| VLA generalistas (p. ej. OpenVLA) | miles de millones | limitado | no comparable directamente | según modelo | HuggingFace |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a categoría, tamaño y licencia.

## Limitaciones y advertencias

- Modelo específico de tarea y robot: entrenado sobre un dataset concreto de 450 episodios; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni métricas que permitan estimar su fiabilidad en producción.
- Riesgo de sobreajuste al operador y al entorno de recogida de datos: cambios de iluminación, cámara o disposición de objetos pueden degradar el comportamiento.
- Sin capacidades de lenguaje ni de razonamiento simbólico: no debe presentarse como un VLA conversacional.
- Documentación incompleta: faltan detalles de dataset, hiperparámetros y condiciones de evaluación, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo en entornos reales; el despliegue en robots físicos requiere validación de seguridad independiente.
- Sin datos de sesgos: no se documentan sesgos demográficos ni de otro tipo, aunque al ser un modelo de control robótico el riesgo principal es de fallo operativo, no de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SamerAyyad/VLA_Samer_31.10.2026_450eps_policy_ACT_500k
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_31.10.2026_450eps
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
