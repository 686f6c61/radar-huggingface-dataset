# Haku-2004/act_i_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_i_base_20`, es una política ACT entrenada y publicada con LeRobot, la librería de Hugging Face para robótica, sobre el dataset `Haku-2004/i_20261126_110221`. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB.

El modelo resuelve el problema de generar comandos de control de bajo nivel a partir de observaciones visuales y de estado del robot, aprendiendo de datos de teleoperación. Es relevante porque ACT es una de las políticas de referencia en LeRobot para manipulación robótica con brazos tipo SO-100, y permite a desarrolladores entrenar y desplegar políticas de imitación sin partir de cero.

La información pública disponible es escasa: no se documentan benchmarks, composición del dataset ni detalles de entrenamiento más allá de lo que expone la model card estándar de LeRobot. La ficha se completa con los datos verificables del repositorio y del paper de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura de tipo transformer diseñada para aprendizaje por imitación. En lugar de predecir una única acción por paso de tiempo, el modelo predice un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador visual (típicamente ResNet) con un transformer que procesa la secuencia de observaciones y genera las acciones. El paper de referencia es "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705).

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/i_20261126_110221`, que contiene datos de teleoperación. No se dispone de información sobre el número de episodios, la composición del dataset, el número de tokens ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de imitación supervisada). Tampoco se documentan innovaciones adicionales más allá del propio mecanismo de action chunking.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Control de brazos robóticos tipo SO-100 (el ejemplo de la model card usa `so100_follower`).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- No soporta tool calling, function calling ni agentes multi-step.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general ni audio; la visión se limita a la codificación de observaciones para el control.

## Casos de uso

- Manipulación robótica de precisión: el modelo genera chunks de acciones que permiten al brazo ejecutar tareas de agarre y colocación con menor acumulación de error que políticas paso a paso.
- Investigación en aprendizaje por imitación: sirve como política base para comparar variantes de ACT, ajustar hiperparámetros o evaluar nuevos datasets de teleoperación.
- Prototipado rápido con LeRobot: un desarrollador puede entrenar y evaluar la política con `lerobot-train` y `lerobot-record` en pocas horas sobre un SO-100.
- Automatización de tareas repetitivas en laboratorio: recogida y colocación de objetos en entornos controlados donde se dispone de datos de demostración.
- Evaluación de calidad de datasets: al ser una política entrenada sobre un dataset concreto, permite medir si los datos de teleoperación son suficientes para una tarea.
- Docencia y formación: ejemplo práctico de pipeline completo de imitación (dataset, entrenamiento, evaluación) con licencia Apache 2.0.
- Integración en pipelines de robótica con ROS: el checkpoint puede exportarse y ejecutarse en un nodo de control, aunque no se documenta soporte nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros, el checkpoint en fp32 ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento se recomienda una GPU con 8 GB o más (RTX 3060/4060 en adelante).
- Cabe en GPU consumer: sí, en cualquier RTX 30/40 series y en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Haku-2004/act_i_base_20 | 51,7 M | no aplicable | apache-2.0 | Hugging Face |
| Políticas ACT de LeRobot (genéricas) | variable | no aplicable | apache-2.0 | Hugging Face / LeRobot |
| Diffusion Policy | variable | no aplicable | variable | Hugging Face / LeRobot |
| VQ-BeT | variable | no aplicable | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset concreto, la política puede sobreajustarse a las condiciones de ese dataset (iluminación, posiciones, objetos).
- Riesgo de alucinación: no aplicable en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplicable; el modelo no procesa lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento puede tener sus propias restricciones no documentadas.
- Caveats para producción: no se documentan métricas de éxito, número de episodios ni condiciones de evaluación; se recomienda validar exhaustivamente antes de desplegar en un robot real.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_i_base_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_20261126_110221
