# Haku-2004/act_k5oend_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k5oend_base_20`, es una política ACT entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y fácil de desplegar en hardware modesto. Está entrenado sobre el dataset `Haku-2004/k5_20261110_143202`, presumiblemente de teleoperación, y se publica bajo licencia Apache 2.0.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento de políticas robóticas de código abierto: un modelo pequeño, reproducible y desplegable con `lerobot-record` sobre robots tipo SO-100, sin necesidad de infraestructura de gran escala. Es una pieza útil para investigadores que quieran evaluar ACT como línea base en tareas de manipulación concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que, a partir de observaciones (típicamente imágenes de cámaras y estado de las articulaciones), predice un chunk de acciones futuras en lugar de una sola acción. Esta formulación reduce el problema de compounding error típico de las políticas paso a paso y permite un control más suave. La arquitectura incluye habitualmente un codificador visual y un decodificador de acciones con consultas aprendidas, aunque los detalles concretos de esta instancia no se especifican en la model card.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k5_20261110_143202`, que no está descrito en la información disponible (número de episodios, tareas, composición de sensores). No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado a partir de demostraciones teleoperadas. Tampoco se detallan innovaciones adicionales más allá del propio mecanismo de action chunking descrito en el paper arXiv:2304.13705.

## Capacidades

- Predicción de acciones robóticas en forma de chunks a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Control de robots tipo SO-100 (el ejemplo de evaluación usa `so100_follower`).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la percepción visual propia de la política.

## Casos de uso

- Manipulación robótica de precisión: la política predice chunks de acciones que suavizan la trayectoria y reducen el error acumulado en tareas de pick-and-place sobre un SO-100.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT, cambios en el dataset o estrategias de aumento de datos.
- Evaluación de datasets de teleoperación: permite validar rápidamente si un conjunto de demostraciones (`k5_20261110_143202`) es suficiente para una tarea concreta mediante `lerobot-record`.
- Prototipado en laboratorio: al ocupar 0,2 GB y 51,7 M de parámetros, se puede entrenar y ejecutar en una GPU de consumo, lo que facilita iteraciones rápidas.
- Despliegue en robots de bajo coste: el modelo es compatible con el flujo de LeRobot para robots SO-100, adecuado para entornos educativos y de investigación con presupuesto limitado.
- Reproducción de experimentos: al estar publicados pesos y dataset, otros grupos pueden replicar el entrenamiento y verificar resultados en sus propias instalaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (51,7 M de parámetros, ~207 MB de pesos), por lo que cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer (GTX 1650, RTX 2060, RTX 3060, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de ejecución en CUDA; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k5oend_base_20` (ACT) | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no disponible | éxito alto en tareas de manipulación según el paper | no disponible | paper |
| Políticas Diffusion Policy (LeRobot) | no disponible | no disponible | no disponible | no disponible | Hugging Face / LeRobot |
| Políticas VQ-BeT / otros métodos IL en LeRobot | no disponible | no disponible | no disponible | no disponible | Hugging Face / LeRobot |

No se dispone de datos comparativos numéricos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado sobre un dataset muy específico (`k5_20261110_143202`); su generalización a otras tareas, objetos o entornos no está documentada.
- No hay información sobre sesgos, pero al ser una política de imitación hereda los sesgos y limitaciones de las demostraciones humanas con las que se entrenó.
- Riesgo de fallo fuera de distribución: cambios de iluminación, posición de cámara u objetos distintos a los del dataset pueden degradar el rendimiento de forma significativa.
- No es un modelo de lenguaje: no procesa texto ni responde a instrucciones en lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se documentan límites de contexto, idioma ni cuantizaciones alternativas; el despliegue está pensado para el stack LeRobot.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5oend_base_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
