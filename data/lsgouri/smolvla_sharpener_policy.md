# LSGOURI/smolvla_sharpener_policy

## Resumen

SmolVLA Sharpener Policy es un modelo de visión-lenguaje-acción (VLA) afinado a partir de `lerobot/smolvla_base`, desarrollado por el usuario LSGOURI y publicado en Hugging Face. Su propósito es controlar un robot manipulador mediante instrucciones en lenguaje natural y observaciones visuales, generando acciones motoras de forma directa. El modelo se ha especializado con el conjunto de datos `LSGOURI/smolvla_sharpener`, presumiblemente centrado en una tarea de afilado o manipulación de herramientas, aunque la model card no detalla la composición exacta del dataset.

La relevancia de este modelo radica en su carácter compacto: con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, está diseñado para desplegarse en hardware de consumo, algo poco habitual en el ámbito de los modelos VLA, que suelen requerir GPUs de centro de datos. Se apoya en la arquitectura SmolVLA presentada en el artículo arXiv 2506.01844, que combina un codificador visual, un modelo de lenguaje compacto y un decodificador de acciones.

Al ser un *fine-tune* de una política base y no un modelo de propósito general, su utilidad está acotada a la tarea concreta para la que fue entrenado. No obstante, sirve como ejemplo práctico de cómo adaptar SmolVLA a dominios específicos con LeRobot y de cómo publicar políticas robóticas reproducibles en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | LSGOURI/smolvla_sharpener |
| Tamano del repositorio | 0,9 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el artículo arXiv 2506.01844: un modelo VLA compacto que procesa observaciones visuales e instrucciones en lenguaje natural para producir acciones de control robótico. SmolVLA está pensado para reducir el coste computacional frente a VLA de mayor tamaño manteniendo un rendimiento competitivo, lo que permite su ejecución en hardware de consumo. La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El entrenamiento se ha realizado mediante *fine-tuning* supervisado del checkpoint `lerobot/smolvla_base` sobre el dataset `LSGOURI/smolvla_sharpener`, usando la librería LeRobot. La model card incluye instrucciones genéricas de LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`), pero no documenta hiperparámetros, número de episodios ni configuración específica del *fine-tune*. No se han publicado innovaciones técnicas adicionales en la información disponible.

## Capacidades

- Control robótico mediante instrucciones en lenguaje natural y observaciones visuales (política VLA).
- Generación de acciones motoras para robots manipuladores compatibles con LeRobot (por ejemplo, SO-100 follower).
- Ejecución de políticas entrenadas con imitación a partir de demostraciones.
- Despliegue en hardware de consumo gracias a su tamaño compacto (450 M de parámetros).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y grabación de episodios.
- Capacidades multilingües: no disponible.
- Soporte de tool calling o agentes: no disponible (no aplica a este tipo de modelo).

## Casos de uso

- Afilado automatizado de herramientas: el modelo se ha afinado sobre el dataset `smolvla_sharpener`, por lo que puede ejecutar la secuencia de manipulación necesaria para afilar una herramienta a partir de observaciones visuales y una instrucción textual.
- Investigación en imitación robótica: sirve como punto de partida para estudiar cómo el *fine-tuning* de SmolVLA sobre un dataset pequeño especializa la política en una tarea concreta.
- Prototipado en laboratorio con hardware de consumo: al caber en GPUs convencionales, permite iterar rápidamente en entornos sin acceso a clústeres.
- Evaluación de pipelines LeRobot: útil para validar el flujo `lerobot-train` / `lerobot-record` con un checkpoint real y un robot SO-100 follower.
- Docencia y demostraciones: ejemplo reproducible de política VLA publicada en el Hub con licencia permisiva para prácticas de robótica.
- Base para *fine-tuning* adicional: al derivar de `smolvla_base` y tener licencia Apache 2.0, puede reutilizarse como punto de partida para otras tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors, el peso ronda los 0,9 GB, por lo que en FP32 necesitaría aproximadamente 1,8 GB y en FP16 alrededor de 0,9 GB, a lo que hay que sumar el codificador visual y los buffers de inferencia.
- GPU recomendadas: no disponible. Por tamaño, debería ejecutarse en GPUs de consumo como RTX 3060, RTX 4090 o superiores, aunque el autor no lo especifica.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo, aunque no está confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son el entorno habitual para políticas VLA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LSGOURI/smolvla_sharpener_policy | 450 M | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Hugging Face (LeRobot) |
| Otros VLA compactos (p. ej. variantes de SmolVLA) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (afilado); no es un VLA de propósito general y probablemente fallará fuera del dominio de entrenamiento.
- No se documentan sesgos conocidos, pero al derivar de un modelo base y un dataset concreto puede heredar sesgos de ambos.
- Riesgo de alucinación: no aplica en el sentido textual, pero la política puede generar acciones incorrectas ante observaciones fuera de distribución.
- No se especifican los idiomas soportados para las instrucciones de texto.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias del modelo base y del dataset antes de un uso comercial.
- Sin métricas publicadas de éxito en la tarea, por lo que no es posible evaluar su fiabilidad en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- La model card es genérica y no documenta hiperparámetros, episodios de entrenamiento ni condiciones de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LSGOURI/smolvla_sharpener_policy
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/LSGOURI/smolvla_sharpener
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
