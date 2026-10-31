# ketiholo/test3_env_ch100

## Resumen

Este modelo es una política de aprendizaje por imitación basada en **Action Chunking with Transformers (ACT)**, entrenada y publicada en Hugging Face por el usuario **ketiholo** mediante la librería **LeRobot** de Hugging Face. ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce la acumulación de error en tareas de manipulación robótica y suele alcanzar tasas de éxito altas en entornos de teleoperación.

El modelo se ha entrenado sobre el dataset `ketiholo/demo3` y está pensado para ejecutarse sobre un robot **SO-100 follower** (según los comandos de evaluación de la model card). Con aproximadamente 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero comparado con los grandes modelos de lenguaje, diseñado para inferencia en tiempo real en hardware robótico con GPU.

Su relevancia actual radica en el auge del ecosistema LeRobot, que facilita el entrenamiento, publicación y despliegue de políticas de robótica de forma reproducible y open source. Es un ejemplo típico de política de imitación entrenada con datos teleoperados para tareas concretas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.676.295 (~51,7 M) |
| Parametros activos | no disponible (no es MoE; arquitectura densa) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de control robótico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformers para aprendizaje por imitación. En lugar de predecir una acción por paso temporal, el modelo predice **chunks de acciones** (secuencias cortas de posiciones/velocidades del robot) en cada inferencia, lo que suaviza el comportamiento y mitiga el error compuesto típico de las políticas paso a paso. El paper original (arXiv:2304.13705) describe además el uso de un estilo CVAE (Conditional Variational Autoencoder) para modelar la multimodalidad de las demostraciones humanas, aunque la model card no detalla la configuración exacta de esta instancia.

El modelo fue entrenado con la librería LeRobot sobre el dataset `ketiholo/demo3`, presumiblemente compuesto por episodios de teleoperación grabados con un robot SO-100 (el propio README muestra el flujo de grabación con `lerobot-record` y `so100_follower`). No se dispone de datos sobre el número de pasos de entrenamiento, hiperparámetros concretos, tamaño del dataset ni uso de técnicas adicionales como DPO o RLHF (no aplicables a este paradigma de imitación directa).

## Capacidades

- Predicción de chunks de acciones para control de brazos robóticos en tareas de manipulación.
- Aprendizaje por imitación a partir de datos teleoperados (behavior cloning).
- Inferencia en tiempo real sobre hardware con GPU CUDA (el flujo de entrenamiento usa `policy.device=cuda`).
- Integración nativa con el ecosistema LeRobot: entrenamiento (`lerobot-train`), grabación de evaluación (`lerobot-record`) y despliegue del checkpoint desde el Hub.
- No posee capacidades de lenguaje, visión-language, tool calling ni razonamiento multi-paso: es una política de control pura para la tarea para la que fue entrenada.

## Casos de uso

- **Manipulación de objetos con SO-100: el modelo puede ejecutar tareas de pick-and-place entrenadas con demostraciones teleoperadas, prediciendo chunks de acciones que garantizan movimientos suaves y estables del brazo.**
- **Prototipado rápido de políticas robóticas: gracias a su tamaño reducido (~52 M de parámetros, 0,2 GB), un desarrollador puede entrenar, subir y descargar checkpoints desde el Hub en minutos para iterar sobre nuevas tareas.**
- **Evaluación reproducible en hardware real: el flujo `lerobot-record` con prefijo `eval_` permite registrar episodios de evaluación estandarizados y comparar tasas de éxito entre versiones de la política.**
- **Investigación en aprendizaje por imitación: al ser una implementación estándar de ACT en LeRobot, sirve como baseline reproducible para comparar nuevos métodos de imitación o variaciones de arquitectura.**
- **Automatización de tareas repetitivas de laboratorio o pequeño taller: tareas como clasificar piezas, insertar conectores o mover objetos entre posiciones fijas pueden automatizarse tras recoger un conjunto reducido de demostraciones.**
- **Docencia y formación en robótica: la combinación de dataset público, política en el Hub y comandos documentados permite montar prácticas completas de imitación learning sin infraestructura compleja.**

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en evaluación, métricas de pérdida ni comparativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; dado el tamaño del modelo (~52 M de parámetros, 0,2 GB en pesos), se estima que unos pocos GB de VRAM son suficientes, pero no hay cifra oficial.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA es suficiente para inferencia (el propio flujo de entrenamiento referencia `policy.device=cuda`). Para entrenamiento, GPUs de gama media como RTX 3060/4060 o superiores deberían ser adecuadas dada la escala del modelo, aunque no hay datos oficiales.
- Consumer GPUs: sí, por tamaño y formato, el modelo debería ejecutarse sin problemas en GPUs de consumo (RTX 30xx/40xx), aunque no hay confirmación explícita.
- Despliegue: mediante la librería **LeRobot** (`lerobot-record` con `--policy.path` apuntando al checkpoint del Hub o local). No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. ACT está diseñado para inferencia en tiempo real en robots, pero no se publican cifras para esta instancia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| ketiholo/test3_env_ch100 (ACT) | Política de imitación (LeRobot) | ~51,7 M | Apache-2.0 | Público en Hugging Face |
| ACT estándar de LeRobot (lerobot/act) | Política de imitación (LeRobot) | no disponible | Apache-2.0 | Público en Hugging Face |
| Diffusion Policy (LeRobot) | Política de difusión para imitación | no disponible | Apache-2.0 | Público en Hugging Face |
| Pi0 (lerobot/pi0) | VLA (vision-language-action) | ~3.000 M | Apache-2.0 | Público en Hugging Face |

ACT es notablemente más ligero que políticas basadas en difusión o VLA como Pi0, lo que lo hace más adecuado para inferencia en hardware modesto, a costa de una generalización visual y semántica menor.

## Limitaciones y advertencias

- **Especialización extrema:** la política solo funcionará bien en la tarea y el entorno para los que fue entrenada (dataset `ketiholo/demo3`); no generaliza a otras tareas, robots o disposiciones de cámara sin reentrenamiento.
- **Dependencia de la calidad de las demostraciones:** como todo método de imitación, su rendimiento está limitado por la calidad y diversidad de los datos teleoperados; demostraciones inconsistentes degradan la política.
- **Riesgo de fallo fuera de distribución:** pequeñas variaciones en iluminación, posición de objetos o calibración del robot pueden provocar fallos catastróficos, algo habitual en behavior cloning.
- **Sin métricas publicadas:** no hay tasas de éxito ni benchmarks verificables, por lo que debe evaluarse en el hardware y tarea propios antes de cualquier uso real.
- **Seguridad física:** al tratarse de control directo de un robot real, se recomienda supervisión humana y mecanismos de parada de emergencia durante la inferencia.
- **Licencia:** Apache-2.0 permite uso comercial sin restricciones significativas, aunque no hay garantía de adecuación para aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/test3_env_ch100
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo3
