# Haku-2004/act_k6_base_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo `Haku-2004/act_k6_base_10` es una política concreta entrenada con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, publicada por el usuario Haku-2004 en Hugging Face. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, se trata de un modelo compacto orientado a control robótico de manipulación.

El interés de esta ficha es doble: por un lado, documenta una implementación práctica del paper ACT (arXiv:2304.13705) dentro del ecosistema LeRobot; por otro, sirve como ejemplo de política de imitación lista para evaluar con `lerobot-record` sobre un robot tipo SO-100 follower. No es un modelo de lenguaje: no genera texto ni código, sino secuencias de acciones motoras a partir de observaciones.

La relevancia actual viene del auge de los modelos fundacionales para robótica y de la infraestructura abierta de LeRobot, que permite entrenar y desplegar políticas con licencia Apache 2.0. Al ser un modelo pequeño y con pesos en safetensors, es viable ejecutarlo en hardware modesto, aunque su utilidad queda acotada al dominio del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación (imitation learning) basado en transformers que predice *action chunks*: en lugar de emitir una sola acción por paso, el modelo genera una secuencia corta de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador visual (típicamente ResNet) con un transformer que fusiona observaciones y estado, y una cabeza de decodificación que produce el chunk de acciones. El entrenamiento se realiza sobre datos de teleoperación.

En este caso concreto, la model card indica que la política se entrenó y subió al Hub mediante LeRobot, usando el dataset `Haku-2004/k6_20_20261113_173939`. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en este tipo de políticas). Tampoco se detalla la configuración de hiperparámetros ni el número de episodios de entrenamiento.

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones visuales y de estado del robot.
- Ejecución de políticas entrenadas con LeRobot mediante `lerobot-record` y `--policy.path`.
- Compatible con robots tipo `so100_follower` según el ejemplo de la model card.
- Entrenamiento reproducible desde cero con `lerobot-train` y `--policy.type=act`.
- Integración con Weights & Biases para seguimiento de entrenamiento (`--wandb.enable=true`).
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Manipulación robótica de laboratorio: usar la política para ejecutar tareas de pick-and-place aprendidas del dataset `k6_20_20261113_173939`, evaluando con `lerobot-record` durante 10 episodios para medir la tasa de éxito.
- Prototipado rápido en robótica de bajo coste: al tener solo ~51,7 M de parámetros y 0,2 GB de pesos, se puede desplegar en un PC con GPU consumer conectado a un SO-100 follower para pruebas de concepto.
- Investigación en aprendizaje por imitación: servir como línea base reproducible de ACT para comparar con otras políticas (Diffusion Policy, VQ-BeT) dentro del mismo pipeline de LeRobot.
- Reentrenamiento con datos propios: partir de este checkpoint o del comando `lerobot-train` para adaptar la política a una nueva tarea de manipulación con teleoperación.
- Evaluación comparativa de checkpoints: el nombre `act_k6_base_10` sugiere una variante base con 10 episodios o iteraciones; puede usarse para comparar configuraciones dentro de una misma familia de experimentos.
- Docencia y formación: ejemplo didáctico completo de entrenamiento, publicación y evaluación de una política ACT con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parámetros (los pesos ocupan ~0,2 GB); con overhead de activaciones y codificador visual, un presupuesto de 2-4 GB es holgado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para entrenamiento, se recomienda CUDA (`--policy.device=cuda`) y una GPU de gama media o superior.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de checkpoints locales o del Hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6_base_10 | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no aplica | reportado en el paper, no en esta ficha | según implementación | Paper y repositorios de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, VQ-BeT) | variable | no aplica | no disponible en esta ficha | variable (habitualmente Apache 2.0) | Hugging Face (LeRobot) |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un LLM y no debe evaluarse con benchmarks de lenguaje.
- Dominio acotado: la política está entrenada sobre un dataset concreto (`k6_20_20261113_173939`) y probablemente generaliza mal fuera de las condiciones de esa tarea, robot y entorno.
- Sin datos de evaluación publicados: no hay tasas de éxito, métricas de error ni comparativas que permitan estimar su fiabilidad en producción.
- Riesgo de sobreajuste al hardware: cambios en la cámara, iluminación, robot o calibración pueden degradar el rendimiento.
- Sin información sobre sesgos: no se documentan sesgos, pero al ser un modelo de imitación hereda los sesgos y errores de las demostraciones humanas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- No hay información sobre cuantizaciones ni sobre despliegue en entornos embebidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6_base_10
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
