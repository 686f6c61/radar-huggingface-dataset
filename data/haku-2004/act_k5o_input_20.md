# Haku-2004/act_k5o_input_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones ("action chunks") en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_k5o_input_20`, contiene una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k5_4seg` y publicada en Hugging Face con licencia Apache 2.0. El modelo está pensado para controlar un robot seguidor tipo SO-100/SO-101 mediante teleoperación aprendida.

El modelo resuelve el problema clásico de las políticas de imitación paso a paso: la acumulación de error y la falta de coherencia temporal. Al predecir bloques de acciones, ACT reduce la varianza y mejora la tasa de éxito en tareas de manipulación. Es relevante para desarrolladores que quieran reproducir o adaptar un pipeline de robótica de imitación de extremo a extremo con herramientas open source.

Con 51.671.174 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que se puede ejecutar en GPU de consumo. La información pública disponible es escasa: no se publican resultados de benchmarks, ni detalles del dataset de entrenamiento más allá de su identificador, ni especificaciones de contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precision original) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k5_4seg |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer diseñado específicamente para políticas de imitación en robótica. La arquitectura combina un encoder de observaciones (típicamente imágenes de cámaras y estado de las articulaciones) con un decoder que genera un chunk de acciones futuras de longitud fija. Esta predicción por bloques, inspirada en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), permite suavizar la ejecución y reducir el error acumulado respecto a políticas que predicen una única acción por paso.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k5_4seg`, presumiblemente compuesto por episodios de teleoperación. No se dispone de información pública sobre el número de episodios, la composición de las observaciones, el número de tokens de entrenamiento ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco se documenta si hubo ajuste fino posterior, RLHF o DPO, algo poco habitual en políticas de imitación robótica.

## Capacidades

- Generación de acciones motoras para control de robots manipuladores a partir de observaciones visuales y proprioceptivas.
- Predicción de chunks de acciones de longitud fija, lo que permite ejecución suave y coherente en el tiempo.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas explícitas.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- Compatible con robots seguidores tipo SO-100 (`so100_follower`) según los comandos de la model card.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política motora, no un modelo de lenguaje.
- Capacidades multilingües no aplicables.
- No dispone de modo thinking, visión general, audio ni otras capacidades cognitivas.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar tareas de pick-and-place aprendidas de demostraciones humanas, aprovechando la predicción por chunks para mantener trayectorias estables.
- Reproducción de experimentos de imitación: investigadores pueden partir de este checkpoint para comparar variantes de ACT, ajustar hiperparámetros o evaluar robustez frente a cambios de iluminación.
- Prototipado rápido de robots de bajo coste: al ser un modelo de 51,7 M de parámetros y 0,2 GB, se puede desplegar en estaciones con GPU de consumo para validar pipelines SO-100/SO-101.
- Educación y formación: sirve como ejemplo didáctico de un pipeline completo LeRobot (dataset, entrenamiento, evaluación) en cursos de robótica o aprendizaje automático.
- Automatización de tareas repetitivas en entornos controlados: con el dataset adecuado, se puede reentrenar para tareas de ensamblaje o clasificación de objetos.
- Base para investigación en action chunking: permite estudiar el efecto de la longitud del chunk, la resolución de imagen o la frecuencia de control sobre la tasa de éxito.
- Evaluación comparativa de políticas: útil como referencia base frente a políticas más recientes (diffusion policies, VLA) en el mismo robot y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros; en la práctica, el consumo depende del tamaño de las imágenes de entrada y del batch, pero es holgadamente inferior a 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de NVIDIA (GTX 1650 en adelante) e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), integración con PyTorch; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del robot, la frecuencia de control y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k5o_input_20` (ACT) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy (Chi et al.) | variable, típicamente 10-100 M | no aplica | no disponible en esta ficha | MIT (implementación de referencia) | Repositorios de investigación |
| VLA ligeros (p. ej. RT-1, OpenVLA) | cientos de M a miles de M | no aplica | no disponible en esta ficha | variable | Hugging Face / repositorios |

La comparación cuantitativa no es posible con la información disponible. ACT se distingue por su simplicidad, bajo coste computacional y buen equilibrio entre tasa de éxito y requisitos de hardware en tareas de manipulación con hardware de bajo coste.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset concreto (`k5_4seg`), la política hereda los sesgos de las demostraciones (posiciones, objetos, iluminación y entorno específicos). No se documenta ninguna mitigación.
- Riesgo de alucinación: en robótica, el equivalente es la generación de acciones inválidas o inseguras fuera de la distribución de entrenamiento; no hay garantías de seguridad física.
- Limitaciones de contexto o idioma: no aplica en el sentido lingüístico, pero la política solo es válida para el robot y la tarea para la que fue entrenada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; el dataset subyacente puede tener sus propias condiciones.
- Caveats para producción: no se han publicado métricas de éxito, curvas de aprendizaje ni evaluación en entornos no vistos. El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación comunitaria. No se documenta la frecuencia de control, el número de cámaras ni la dimensión del espacio de acciones.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto (MMLU, HumanEval, GSM8K) ni usarse para tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5o_input_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
