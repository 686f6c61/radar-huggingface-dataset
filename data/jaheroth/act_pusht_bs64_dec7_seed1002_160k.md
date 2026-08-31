# jaheroth/act_pusht_bs64_dec7_seed1002_160k

## Resumen

El modelo `jaheroth/act_pusht_bs64_dec7_seed1002_160k` es una política de control robótico basada en ACT (Action Chunking with Transformers), entrenada específicamente para la tarea PushT del entorno gym-pusht. Ha sido desarrollado por el usuario jaheroth como parte de un bloque de entrenamiento de seis semanas en robot-learning, y se distribuye a través de la librería LeRobot con licencia Apache-2.0.

El modelo resuelve el problema de control de un empujador robótico que debe mover una pieza en forma de T hasta una posición objetivo. Según la model card, alcanza una recompensa media imputada de 164.4 y una tasa de éxito del 66.7% sobre 5000 semillas de evaluación, lo que lo sitúa como el mejor ACT ajustado en esta tarea según el autor. Con 83.969.428 parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo.

Su relevancia radica en que demuestra cómo un ajuste fino cuidadoso de ACT (con batch 64, learning rate 2e-5, 7 capas de decoder, chunk de 100 pasos y kl_weight 10) puede superar configuraciones por defecto en una tarea de manipulación de referencia, ofreciendo una referencia reproducible para la comunidad de robótica con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 83.969.428 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa observaciones de imagen y estado, no texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformers que combina un encoder de visión (típicamente ResNet) con un decoder transformer que genera secuencias de acciones (chunks). El modelo se entrena mediante imitación con una pérdida de acción y una pérdida de regularización KL hacia una distribución previa (VAE). En esta variante, se emplean 7 capas de decoder, un tamaño de chunk de 100 pasos de acción y un peso KL de 10.

El entrenamiento se realizó con batch size 64, learning rate 2e-5 y 160.000 pasos de optimización. No se especifica la composición exacta del dataset, pero la tarea PushT de gym-pusht proporciona demostraciones generadas por un controlador experto. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente por imitación supervisada con la pérdida ACT estándar.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones de 100 pasos (chunk) para mover un empujador en el entorno PushT.
- Percepción visual: procesa observaciones de imagen (típicamente 96x96 píxeles) junto con el estado del robot para decidir acciones.
- Generalización a múltiples semillas: evaluado sobre 5000 semillas, lo que sugiere robustez frente a variaciones en la posición inicial.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de políticas robóticas de Hugging Face.
- Sin capacidades de lenguaje, tool calling ni razonamiento simbólico: es un modelo puramente motor, no un LLM.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de hiperparámetros (batch, capas, KL) en ACT sobre tareas de manipulación.
- Benchmarking de políticas robóticas: puede utilizarse como referencia de rendimiento en PushT para comparar con otras arquitecturas (diffusion policies, etc.).
- Desarrollo de sistemas de control en simulación: integrable en pipelines de sim-to-real para validar estrategias de empuje antes de transferir a robots físicos.
- Educación en robótica con LeRobot: permite a estudiantes reproducir un entrenamiento completo de ACT y analizar el impacto de la configuración en el éxito de la tarea.
- Optimización de hiperparámetros: el modelo documenta una configuración concreta (bs64, dec7, seed1002, 160k) que puede replicarse o modificarse para estudios de sensibilidad.
- Generación de datos sintéticos: al ser una política entrenada, puede usarse para recolectar trayectorias adicionales en simulación y aumentar datasets de entrenamiento.

## Benchmarks y rendimiento

Según la model card del autor, el modelo alcanza los siguientes resultados en la tarea PushT de gym-pusht:

| Metrica | Valor |
|---|---|
| avg_sum_imputed_reward | 164.4 |
| Tasa de exito (n=5000 semillas) | 66.7% |

No se han publicado resultados comparativos con otros modelos en la información disponible. La evaluación se realizó con `n_action_steps=16` y la recompensa imputada asigna 0.95 por paso hasta el horizonte 300 tras el éxito.

## Requisitos de hardware

- VRAM estimada: con 84M parámetros, el modelo en precisión FP32 ocupa aproximadamente 336 MB. En inferencia, con batch pequeño, cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, etc.) es suficiente. Incluso podría ejecutarse en CPU para inferencia puntual, aunque con mayor latencia.
- Despliegue: al ser un modelo LeRobot, se integra con el framework de Hugging Face. No se mencionan opciones como vLLM u Ollama, que son para modelos de lenguaje. Para robótica, se usa el pipeline de LeRobot con PyTorch.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño reducido, se espera una inferencia en el orden de milisegundos en GPU moderna, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor no publica comparaciones con otras políticas (p.ej., Diffusion Policy, ACT con otras configuraciones) en la model card. Se recomienda consultar el repositorio de LeRobot para benchmarks de referencia en PushT.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de control motor, no genera texto ni contenido simbólico; los riesgos de sesgo lingüístico no aplican. Sin embargo, puede presentar comportamientos subóptimos en estados no vistos durante el entrenamiento.
- Riesgo de sobreajuste: el modelo fue entrenado específicamente para PushT; su transferencia a otras tareas o entornos requiere reentrenamiento o fine-tuning.
- Limitaciones de contexto: no maneja lenguaje ni instrucciones; solo observaciones de imagen y estado.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y atribución.
- Caveat de producción: el rendimiento reportado (66.7% de éxito) no es perfecto; en aplicaciones reales de robótica física, se requiere validación adicional y posiblemente un sistema de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_bs64_dec7_seed1002_160k
- Repositorio de entrenamiento del autor: https://github.com/JaHeRoth/robot-learning
- Repositorio LeRobot (framework): https://github.com/huggingface/lerobot
- Entorno gym-pusht: https://github.com/google-research/pusht (referencia indirecta, no confirmada en la búsqueda)
