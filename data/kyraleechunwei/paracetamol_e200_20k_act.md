# KyraLeeChunWei/Paracetamol_e200_20K_ACT

## Resumen

Paracetamol_e200_20K_ACT es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), entrenada y publicada con la librería LeRobot de Hugging Face. El modelo aprende de datos de teleoperación y predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele mejorar las tasas de éxito en tareas de manipulación. El autor es KyraLeeChunWei y el checkpoint se ha entrenado sobre el dataset propio `KyraLeeChunWei/Paracetamol_e200`.

El modelo no es un LLM ni un modelo generativo de texto: es un pequeño transformer de 51.678.855 parámetros (unos 51,7 M) orientado a control robótico, con pesos en formato safetensors y un repositorio de apenas 0,2 GB. Su relevancia es la de un ejemplo práctico y reproducible de entrenamiento de políticas ACT con LeRobot, útil para quien quiera evaluar el flujo completo de entrenamiento, registro y despliegue de una política de imitación en robots tipo SO-100.

La ficha se basa únicamente en la información disponible en Hugging Face: la model card no incluye detalles sobre composición del dataset, hiperparámetros, número de demostraciones ni resultados de evaluación, por lo que muchos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para imitación robótica |
| Parametros totales | 51.678.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | KyraLeeChunWei/Paracetamol_e200 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de una acción por paso. La arquitectura combina un codificador visual y de estado con un transformer que genera los chunks de acción, y se entrena de forma supervisada sobre demostraciones de teleoperación. El paper de referencia es arXiv:2304.13705, y la implementación utilizada es la de LeRobot.

No se dispone de información sobre el número de tokens o pasos de entrenamiento, la composición exacta del dataset `Paracetamol_e200`, el número de episodios de teleoperación, la configuración del robot (aunque el ejemplo de evaluación de la model card usa `so100_follower`), los hiperparámetros del entrenamiento ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se documenta ninguna innovación adicional más allá del propio mecanismo de action chunking.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado del robot.
- Manipulación de objetos en entornos de laboratorio o mesa, entrenado sobre el dataset Paracetamol_e200.
- Ejecución de políticas en robots compatibles con LeRobot, como el SO-100 follower citado en la model card.
- Entrenamiento reproducible desde cero con `lerobot-train` y evaluación con `lerobot-record`.
- Integración con Weights & Biases para registro de experimentos (`--wandb.enable=true`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento lingüístico, visión general, audio ni capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como checkpoint de referencia para reproducir el pipeline de entrenamiento ACT con LeRobot y comparar variantes de hiperparámetros sobre el mismo dataset.
- Automatización de tareas de pick-and-place: la política predice chunks de acción que permiten recoger y colocar objetos sobre una mesa, aprovechando la reducción de error de acumulación propia de ACT.
- Manipulación de objetos pequeños en laboratorio: el dataset Paracetamol_e200 sugiere tareas con objetos tipo blíster o envase, adecuadas para evaluar precisión de agarre en robots de sobremesa.
- Evaluación de robots de bajo coste: el ejemplo de la model card usa `so100_follower`, por lo que el modelo es adecuado para validar políticas en plataformas SO-100 accesibles.
- Docencia y formación en robótica: el flujo `lerobot-train` / `lerobot-record` permite a estudiantes entrenar y desplegar una política completa en pocas horas con una GPU consumer.
- Benchmark interno de políticas ACT: al ser un checkpoint pequeño (0,2 GB), se puede desplegar en paralelo con otras políticas para comparar tasas de éxito en las mismas tareas.
- Prototipado rápido de demos: la inferencia con `lerobot-record` y `--episodes=10` facilita generar vídeos de evaluación para presentaciones o validación con usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, el checkpoint en fp32 ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el flujo de entrenamiento de LeRobot usa `--policy.device=cuda`. Para entrenamiento se recomienda al menos una RTX 3060/4060 o superior; para inferencia basta una GPU de gama baja.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM; también es viable en CPU para pruebas, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con robots SO-100 mediante `so100_follower`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paracetamol_e200_20K_ACT | 51,7 M | no disponible | ACT para imitación robótica | apache-2.0 | Hugging Face (LeRobot) |
| Otros checkpoints ACT en LeRobot Hub | variable | no disponible | ACT para imitación robótica | variable | Hugging Face (LeRobot) |
| Políticas Diffusion Policy en LeRobot | variable | no disponible | imitación robótica con difusión | variable | Hugging Face (LeRobot) |
| Políticas VLA (p. ej. OpenVLA) | miles de millones | no disponible | control robótico con lenguaje | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre el dataset Paracetamol_e200; su generalización a otras tareas, objetos o entornos no está documentada y probablemente sea limitada.
- No hay información sobre sesgos del dataset de teleoperación ni sobre la diversidad de condiciones de iluminación, posiciones de cámara o variaciones de objetos.
- Riesgo de fallo por distribución fuera de entrenamiento: al ser una política de imitación, cualquier cambio en la configuración del robot, la cámara o el entorno puede degradar el rendimiento de forma abrupta.
- No se han publicado métricas de tasa de éxito ni evaluaciones reproducibles, por lo que no se puede verificar su rendimiento real.
- La licencia apache-2.0 permite uso comercial, pero el uso en producción requiere validación propia y cumplimiento de las normas de seguridad del robot.
- El modelo no procesa lenguaje ni texto; no debe presentarse como un modelo de propósito general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/Paracetamol_e200_20K_ACT
- Dataset de entrenamiento: https://huggingface.co/datasets/KyraLeeChunWei/Paracetamol_e200
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
