# Haku-2004/act_i_pred_20

## Resumen

`act_i_pred_20` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. El modelo lo ha subido el usuario Haku-2004 a Hugging Face mediante el framework LeRobot de Hugging Face, y está pensado para controlar robots manipuladores a partir de observaciones visuales y estados proprioceptivos, prediciendo secuencias cortas de acciones (action chunks) en lugar de pasos individuales.

El modelo cuenta con 51.672.714 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. Se distribuye en formato safetensors bajo licencia Apache 2.0 y está etiquetado con el pipeline `robotics`, lo que indica que su uso previsto es el control de robots y no la generación de texto.

Su relevancia actual radica en que ejemplifica el flujo de trabajo estándar de LeRobot para entrenar y desplegar políticas de imitación con pocos recursos: un dataset de teleoperación propio (`Haku-2004/i_4seg`), un script de entrenamiento (`lerobot-train`) y un script de evaluación (`lerobot-record`). No obstante, la información pública disponible es muy limitada: no hay métricas de éxito, ni detalles sobre el robot objetivo, ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.672.714 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador visual con un transformer que predice bloques de acciones futuras de forma conjunta, en lugar de una acción por paso. Esta estrategia de *action chunking* reduce el error de acumulación típico de las políticas paso a paso y mitiga el problema de la ambigüedad en demostraciones humanas de teleoperación. El modelo sigue la implementación de LeRobot y se entrena de forma supervisada sobre pares observación-acción extraídos de un dataset de teleoperación.

En este caso concreto, el entrenamiento se realizó sobre el dataset `Haku-2004/i_4seg`, del que no se dispone de información pública sobre número de episodios, frecuencia de control, tipo de robot ni composición de las observaciones. No hay datos publicados sobre si se aplicaron técnicas de aumento de datos, regularización temporal o ajuste fino posterior. Tampoco se documenta el número de tokens ni la composición del dataset, dado que no es un modelo de lenguaje.

## Capacidades

- Control de robots manipuladores mediante predicción de secuencias de acciones (action chunks).
- Aprendizaje por imitación a partir de demostraciones de teleoperación.
- Procesamiento de observaciones visuales y estados proprioceptivos como entrada (según el pipeline estándar de ACT en LeRobot).
- Inferencia en tiempo real orientada a bucles de control robótico.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede ejecutar tareas de pick-and-place aprendidas de demostraciones humanas, prediciendo bloques de acciones que reducen la acumulación de error en secuencias largas.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar variantes de ACT, gracias a su integración con `lerobot-train` y a su licencia permisiva.
- Prototipado rápido de políticas con hardware de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, es viable entrenar y desplegar en una única GPU de consumo.
- Automatización de tareas repetitivas en entornos controlados: el modelo puede reutilizarse como base y ajustarse con un dataset propio de teleoperación para tareas de ensamblaje o clasificación de objetos.
- Evaluación comparativa de datasets de teleoperación: al estar entrenado sobre `Haku-2004/i_4seg`, permite estudiar cómo afecta la calidad y segmentación del dataset al rendimiento de la política.
- Docencia y formación en robótica: su tamaño reducido y su flujo de trabajo documentado lo hacen adecuado para prácticas de aprendizaje por imitación en cursos universitarios.
- Despliegue en robots tipo SO-100/SO-101: la model card incluye ejemplos con `so100_follower`, lo que sugiere compatibilidad con plataformas de bajo coste de la comunidad LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM necesaria es muy reducida (del orden de 1-2 GB incluyendo activaciones y buffers de observación).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se espera funcionamiento correcto en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el stack de Hugging Face; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_i_pred_20 (este modelo) | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face / GitHub |
| Diffusion Policy (implementación LeRobot) | no disponible | no disponible | no disponible | MIT (implementación de referencia) | Hugging Face / GitHub |
| SmolVLA (LeRobot) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables en la información proporcionada; la comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- No hay métricas publicadas de tasa de éxito, por lo que se desconoce su fiabilidad real en el robot objetivo.
- El modelo está entrenado sobre un único dataset (`Haku-2004/i_4seg`) y probablemente generaliza mal fuera de la distribución de ese dataset (iluminación, posiciones de objetos, fondo, tipo de robot).
- Riesgo de sobreajuste a las condiciones de teleoperación registradas; no se documentan técnicas de aumento de datos.
- No se especifica el robot ni la frecuencia de control, lo que dificulta su reutilización directa sin reentrenamiento.
- Al ser un modelo de robótica, no tiene capacidades lingüísticas ni de razonamiento simbólico; no debe emplearse para tareas de texto.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan sesgos, pero al derivar de demostraciones humanas puede heredar sesgos de los operadores (por ejemplo, preferencias de trayectoria).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_i_pred_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_4seg
