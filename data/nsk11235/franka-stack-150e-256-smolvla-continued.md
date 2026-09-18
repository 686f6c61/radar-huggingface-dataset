# nsk11235/franka-stack-150e-256-smolvla-continued

## Resumen

El modelo `nsk11235/franka-stack-150e-256-smolvla-continued` es una política robótica de tipo vision-language-action (VLA) publicada por el usuario nsk11235 en HuggingFace. Se trata de un ajuste fino (finetune) del modelo base `lerobot/smolvla_base`, entrenado sobre el dataset `nsk11235/franka-stack-50e-256` y gestionado íntegramente con la librería LeRobot de HuggingFace. Su pipeline declarado es `robotics`, por lo que no es un modelo de lenguaje conversacional, sino una política que traduce observaciones visuales (y potencialmente instrucciones en lenguaje natural) en acciones de control para un brazo robótico.

SmolVLA, la familia a la que pertenece, se presenta en su model card como un modelo VLA compacto y eficiente que logra un rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. El modelo pesa 450.046.176 parámetros (aproximadamente 450 millones), un orden de magnitud muy inferior al de los VLA de gran escala, y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 5,3 GB y los pesos están en formato safetensors.

La relevancia de esta ficha es doble. Por un lado, ejemplifica el flujo de trabajo actual de la robótica open source: partir de un modelo base publicado por un laboratorio, ajustarlo con un dataset propio de demostraciones teleoperadas y publicar el resultado con LeRobot. Por otro, al ser un modelo de 450 M de parámetros, es un candidato realista para experimentación en laboratorio y en GPUs de gama de consumo, sin necesidad de clústeres de entrenamiento. No obstante, el autor no ha publicado resultados de evaluación ni detalles del entrenamiento más allá de los metadatos, lo que limita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia SmolVLA; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors sin variantes cuantizadas en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune de `lerobot/smolvla_base`, la política base de SmolVLA publicada en el paper arXiv:2506.01844. La model card describe SmolVLA como un modelo VLA compacto y eficiente, orientado a un coste computacional reducido y desplegable en hardware de consumo. Esto implica una arquitectura que combina un codificador visual y de lenguaje con un módulo generador de acciones, siguiendo el paradigma VLA estándar. No se dispone en la información proporcionada de detalles sobre el número de capas, el mecanismo de atención, el tamaño de los parches visuales ni el esquema de generación de acciones (por ejemplo, si emplea action chunking o flow matching).

En cuanto al entrenamiento, los metadatos indican que se ha ajustado sobre el dataset `nsk11235/franka-stack-50e-256`, presumiblemente un conjunto de demostraciones teleoperadas sobre un brazo Franka. El identificador del modelo (`150e-256`) sugiere 150 épocas de entrenamiento, aunque este dato no está documentado de forma explícita. No hay información sobre el número de tokens o de fotogramas procesados, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. El proceso se realizó con las herramientas de LeRobot, tal y como refleja la model card, que incluye los comandos genéricos de `lerobot-train` y `lerobot-record`.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones visuales, propio de una política VLA.
- Aprendizaje por imitación (imitation learning) a partir de demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- Ejecución sobre robots compatibles con LeRobot; la model card muestra ejemplos con `so100_follower`.
- Capacidad potencial de condicionamiento por instrucciones en lenguaje natural, inherente a la familia SmolVLA, aunque no documentada para este finetune concreto.
- Soporte de tool calling: no aplica (modelo de robótica, no de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): visión como entrada; el resto no disponible.

## Casos de uso

- Manipulación robótica con brazo Franka en tareas de apilado (stacking): el dataset de entrenamiento apunta a este escenario, y el modelo puede ejecutar políticas de colocación de objetos a partir de imágenes de cámara.
- Investigación en modelos VLA con presupuesto limitado: con 450 M de parámetros, permite experimentar con técnicas de imitation learning sin necesidad de GPUs de centro de datos.
- Punto de partida para fine-tuning propio: al ser un finetune de un modelo base abierto, sirve como inicialización para datasets de otras tareas o morfologías, reduciendo el coste frente a entrenar desde cero.
- Evaluación comparativa de políticas en LeRobot: puede usarse con `lerobot-record` para generar episodios de evaluación y comparar el rendimiento frente a otras políticas del ecosistema.
- Recolección de datos y teleoperación asistida en laboratorio: la política puede ejecutar movimientos base mientras un operador interviene, acelerando la generación de nuevos datasets.
- Docencia y formación en robótica: su tamaño reducido y su licencia Apache 2.0 lo hacen apto para prácticas universitarias de aprendizaje por imitación y despliegue en robots de bajo coste como la familia SO-100.
- Despliegue en robots de bajo coste para tareas de pick-and-place en entornos controlados, aprovechando que SmolVLA está diseñado para hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de éxito en tarea, tasas de acierto, comparaciones con otras políticas ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp32, unos 0,9 GB en bf16/fp16 y alrededor de 0,45 GB en int8, calculado a partir de los 450 M de parámetros. Hay que añadir el coste de las activaciones y del codificador visual, no cuantificado en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100; no requiere GPU de centro de datos.
- Cabe en GPU de consumo: sí, con margen amplio en cualquier GPU con 6 GB o más de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` para inferencia y `lerobot-train` para reentrenamiento), con PyTorch como backend. vLLM, TGI, llama.cpp y Ollama no son aplicables porque no es un modelo de lenguaje de texto.
- Latencia y throughput estimados: no disponibles. En robótica de control en tiempo real la latencia es un factor crítico, pero no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nsk11235/franka-stack-150e-256-smolvla-continued` | 450.046.176 | No disponible | No publicado | Apache 2.0 | HuggingFace |
| `lerobot/smolvla_base` | No disponible (misma familia, aproximadamente 450 M) | No disponible | Reportado en el paper arXiv:2506.01844 | Apache 2.0 | HuggingFace |
| Políticas ACT de LeRobot | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace / GitHub |
| Diffusion Policy (LeRobot) | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace / GitHub |

La comparación rigurosa con otras políticas VLA de gran escala (por ejemplo, modelos tipo pi0) no es posible con la información disponible, ya que no se han publicado cifras de rendimiento de este checkpoint.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al estar entrenado sobre un dataset concreto y presumiblemente con un único tipo de robot, heredará los sesgos de las demostraciones (posiciones, iluminación, objetos y entornos específicos).
- Riesgo de alucinación: no es un modelo generativo de texto; el riesgo equivalente es la generalización incorrecta fuera de la distribución del dataset, que puede producir acciones erráticas o fallidas en entornos no vistos.
- Limitaciones de contexto y de idioma: la longitud de contexto no está documentada; el soporte multilingüe no está confirmado para este finetune.
- Sobreajuste al dataset: el nombre del modelo sugiere un entrenamiento prolongado (150 épocas) sobre un dataset acotado, lo que aumenta el riesgo de sobreajuste y de baja transferencia a otras tareas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero conviene verificar también la licencia del dataset de entrenamiento y del modelo base por si imponen condiciones adicionales.
- Ausencia de evaluación: no hay métricas publicadas de éxito en tarea, por lo que no se puede garantizar un rendimiento mínimo en producción.
- Seguridad en robots reales: debe validarse en entornos controlados con paradas de emergencia y límites de par antes de cualquier despliegue físico.
- Fecha de publicación: los metadatos indican creación en septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta, lo que indica que el modelo no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nsk11235/franka-stack-150e-256-smolvla-continued
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/nsk11235/franka-stack-50e-256
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenido sin relación con el mismo.
