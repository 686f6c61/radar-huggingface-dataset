# jaheroth/act_pusht_bs64_dec7_seed1002

## Resumen

El modelo `jaheroth/act_pusht_bs64_dec7_seed1002` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollado por el autor jaheroth y entrenado con la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, genera secuencias completas de acciones (chunks) a partir de observaciones, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Este modelo concreto se ha entrenado sobre el dataset `lerobot/pusht`, un entorno de simulación 2D donde un robot debe empujar una pieza hasta una posición objetivo.

El modelo tiene 83,97 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. Su relevancia radica en que representa un ejemplo práctico de política entrenada con ACT, un enfoque que ha demostrado altas tasas de éxito en tareas de imitación con datos teleoperados. Al estar integrado en el ecosistema LeRobot, puede reproducirse, evaluarse y desplegarse fácilmente en robots reales o simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con predicción de chunks de acciones |
| Parametros totales | 83.969.428 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa ventanas de observación y genera chunks de acciones, no texto) |
| Tipos de cuantizacion | no disponible (se distribuye en precisión completa, safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de observaciones (imágenes y estados del robot) con un decodificador transformer que predice una secuencia de acciones futuras de longitud fija (chunk). Esta predicción por chunks reduce el error acumulativo típico de los métodos paso a paso y permite un control más suave y robusto. El modelo se entrena mediante comportamiento clonado sobre demostraciones teleoperadas, sin necesidad de refuerzo ni funciones de recompensa explícitas.

El entrenamiento de este checkpoint se realizó con la librería LeRobot sobre el dataset `lerobot/pusht`, que contiene demostraciones de un agente empujando una pieza en un entorno 2D. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo (`bs64_dec7`) sugiere un batch size de 64 y 7 capas de decodificador, aunque estos detalles no están confirmados en la documentación pública.

## Capacidades

- Generación de secuencias de acciones (chunks) para control de robots, específicamente para la tarea PushT (empujar una pieza a una posición objetivo).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de ingeniería de recompensas.
- Integración con el ecosistema LeRobot: permite entrenar, evaluar y desplegar la política en robots reales o simulados mediante scripts estándar.
- Procesamiento de observaciones multimodales (imágenes y estados del robot) para generar comandos de actuación.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes conversacionales, ni razonamiento simbólico.

## Casos de uso

- Control de manipuladores robóticos en entornos simulados: el modelo puede ejecutar la tarea PushT en simulación, sirviendo como banco de pruebas para algoritmos de aprendizaje por imitación.
- Transferencia a robots reales: aunque entrenado en simulación, la política puede adaptarse a un robot físico (p. ej., SO-100) mediante el pipeline de LeRobot, siempre que se disponga de los datos de calibración adecuados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del tamaño de chunk, la arquitectura del decodificador o el número de demostraciones en el rendimiento.
- Comparación de métodos de control: puede utilizarse como baseline frente a otras políticas (p. ej., Diffusion Policy) en el mismo entorno PushT.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede predecir acciones que complementen la entrada del operador humano en tareas de empuje o manipulación.
- Evaluación de robustez: al ser un checkpoint concreto (seed 1002), permite reproducir experimentos y medir la variabilidad entre semillas en el rendimiento de ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. El paper original de ACT (arXiv:2304.13705) reporta tasas de éxito en el entorno PushT y en tareas de simulación de robots, pero no se dispone de los valores concretos para este modelo entrenado con LeRobot. Se recomienda ejecutar la evaluación estándar de LeRobot (script `lerobot.record` con episodios de prueba) para obtener métricas propias.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 84 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM en precisión float32. Con cuantización (no disponible en este repo) podría reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas consumer como GTX 1650, RTX 2060 o superiores. Para entrenamiento, se recomienda una GPU con 8-12 GB (p. ej., RTX 3070, RTX 4080) dependiendo del batch size.
- Compatibilidad con consumer GPU: sí, es un modelo ligero que cabe en cualquier GPU moderna.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia y evaluación; también puede integrarse en ROS o en entornos de simulación como MuJoCo. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, la latencia por paso de inferencia es del orden de milisegundos en GPU, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaheroth/act_pusht_bs64_dec7_seed1002 | 83,97 M | no disponible | PushT (imitación) | Apache 2.0 | Hugging Face |
| arclabmit/pusht_act_model | no disponible | no disponible | PushT (imitación) | no disponible | Hugging Face |
| Diffusion Policy (referencia) | no disponible | no disponible | Manipulación (incluye PushT) | MIT (paper) | Repos oficiales |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a la arquitectura y el propósito: todos son políticas de aprendizaje por imitación para el entorno PushT, pero con métodos distintos (ACT vs. Diffusion Policy). Se recomienda consultar el paper de ACT y el de Diffusion Policy para obtener resultados de benchmarks en el mismo entorno.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en la tarea PushT; no es generalizable a otras tareas de robótica sin reentrenamiento completo.
- Depende de la calidad y diversidad de las demostraciones del dataset `lerobot/pusht`; si las demostraciones son limitadas, la política puede fallar en situaciones no cubiertas.
- No es un modelo de lenguaje ni multimodal en el sentido de los LLM; no puede procesar texto ni mantener conversaciones.
- Al ser un checkpoint de un experimento concreto (seed 1002), su rendimiento puede variar respecto a otras semillas; no se han publicado métricas de robustez.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y no se ofrece garantía sobre el comportamiento del modelo en entornos reales.
- No se han documentado sesgos específicos, pero al entrenarse en simulación, puede presentar comportamientos no deseados al transferirlo a hardware físico sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_bs64_dec7_seed1002
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset `lerobot/pusht`: https://huggingface.co/datasets/lerobot/pusht
