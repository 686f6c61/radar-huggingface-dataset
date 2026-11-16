# KS325/smolvla-skill-set-r4_expt2

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, orientado a control robótico de bajo coste computacional. Esta ficha concreta, `KS325/smolvla-skill-set-r4_expt2`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` realizado por el usuario KS325 sobre el dataset `KS325/skill-set-r4-train`, lo que lo convierte en una política especializada en un conjunto concreto de habilidades manipulativas y no en un modelo generalista.

El modelo resuelve el problema de llevar políticas VLA a hardware de consumo: con 450 millones de parámetros y un repositorio de 0,9 GB en formato safetensors, puede ejecutarse en GPUs convencionales, algo poco habitual en modelos VLA de mayor tamaño. La arquitectura combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones, siguiendo el diseño descrito en el paper SmolVLA (arXiv:2506.01844).

Es relevante ahora porque ejemplifica el flujo de trabajo de fine-tuning de políticas robóticas abiertas con LeRobot: un desarrollador puede partir de una base preentrenada, adaptarla a su robot y tarea concreta mediante imitation learning y desplegarla con `lerobot-record`. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo carece de documentación específica sobre el dataset de entrenamiento y sobre métricas de éxito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, implementada en LeRobot |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el repo no documenta variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | KS325/skill-set-r4-train |
| Tamaño del repositorio | 0,9 GB |
| Pipeline | robotics |
| Librería | lerobot |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: un modelo de visión-lenguaje-acción compacto que procesa observaciones visuales e instrucciones en lenguaje natural para producir comandos de acción motora. La implementación corresponde a LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y los pesos se distribuyen en safetensors con 450 millones de parámetros.

Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `KS325/skill-set-r4-train`, propiedad del mismo autor. No se dispone de información sobre el número de tokens, la composición del dataset, el número de episodios de demostración, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias del paper de SmolVLA. El nombre del repositorio (`skill-set-r4_expt2`) sugiere un experimento de adaptación a un conjunto de habilidades, pero no hay detalles publicados al respecto.

## Capacidades

- Control robótico mediante políticas de visión-lenguaje-acción: genera secuencias de acciones a partir de observaciones visuales e instrucciones.
- Aprendizaje por imitación: entrenado con demostraciones del dataset `KS325/skill-set-r4-train` mediante el pipeline de LeRobot.
- Ejecución en hardware de consumo: el tamaño de 450 M de parámetros permite inferencia en GPUs convencionales.
- Integración con LeRobot: compatible con `lerobot-train` para reentrenamiento y `lerobot-record` para evaluación e inferencia sobre robots como `so100_follower`.
- Instrucciones en lenguaje natural: al ser un modelo de visión-lenguaje-acción, acepta comandos textuales que condicionan la política de acciones.
- Capacidades multilingües: no disponible.
- Tool calling, function calling y razonamiento multi-paso: no documentado; el modelo está orientado a control motor, no a tareas de agente conversacional.
- Capacidades especiales (thinking mode, visión general, audio): únicamente percepción visual integrada en el bucle de control; no se documentan otras.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede desplegarse sobre un robot tipo `so100_follower` con `lerobot-record` para ejecutar las habilidades del dataset de entrenamiento, aprovechando que los pesos están adaptados específicamente a ese conjunto de tareas.
- Prototipado rápido de políticas VLA: un equipo puede partir de este checkpoint como referencia de fine-tuning sobre su propio dataset y comparar curvas de entrenamiento con el modelo base `lerobot/smolvla_base`.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible en experimentos de adaptación de políticas, dado que el flujo completo (dataset, base, fine-tune) está publicado en el Hub.
- Docencia y formación en robótica: con 0,9 GB de pesos y licencia Apache 2.0, es adecuado para prácticas en aulas con GPUs de gama media donde no caben modelos VLA de mayor tamaño.
- Evaluación comparativa de checkpoints: al ser un experimento (`expt2`) sobre un skill set concreto, permite medir el efecto de distintas rondas de fine-tuning sobre la misma base.
- Integración en pipelines de LeRobot: puede encadenarse con `lerobot-train` para continuar el entrenamiento con nuevos datos y con `lerobot-record` para generar datasets de evaluación etiquetados con el prefijo `eval_`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de imitación ni comparaciones cuantitativas con el modelo base u otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16), la huella de pesos es reducida y cabe holgadamente en GPUs de consumo, aunque el consumo real depende del codificador visual y del bucle de control.
- GPU recomendadas: no documentadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para los pesos, y el modelo base SmolVLA está diseñado explícitamente para hardware de consumo.
- GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y equivalentes; no hay confirmación oficial para este checkpoint concreto.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KS325/smolvla-skill-set-r4_expt2 | 450 M | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune especializado en un skill set concreto |
| lerobot/smolvla_base | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Hugging Face | Modelo base del que deriva este checkpoint; política VLA generalista |
| Políticas ACT de LeRobot | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Hugging Face / LeRobot | Alternativa de aprendizaje por imitación citada en la propia model card como `--policy.type=act` |

No se dispone de datos suficientes para comparar rendimiento entre estas alternativas; la comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está especializado en el dataset `KS325/skill-set-r4-train`; su comportamiento fuera de esas habilidades y ese entorno robótico no está garantizado.
- No hay información publicada sobre sesgos, composición del dataset ni diversidad de demostraciones, lo que impide evaluar riesgos de generalización.
- Riesgo de alucinación en el sentido de acciones no válidas o inseguras: como toda política de imitación, puede producir comandos fuera de distribución ante observaciones no vistas.
- Sin métricas de éxito publicadas: no se puede afirmar que supere al modelo base ni que sea apto para producción sin evaluación propia.
- Sin información sobre idiomas soportados ni sobre el formato de las instrucciones de lenguaje natural empleadas en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las obligaciones de atribución y las condiciones del dataset de entrenamiento, cuya licencia no se detalla.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: se trata de un experimento personal sin validación por parte de la comunidad.
- No se documentan requisitos de seguridad física para el despliegue en robots reales; cualquier uso en hardware físico debe incorporar límites de par, paradas de emergencia y supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KS325/smolvla-skill-set-r4_expt2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/KS325/skill-set-r4-train
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
