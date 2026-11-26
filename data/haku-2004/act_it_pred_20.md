# Haku-2004/act_it_pred_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_it_pred_20`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/i_4seg` y publicada en Hugging Face con licencia Apache 2.0. El modelo resuelve el problema del control visuomotor de robots manipulados a partir de demostraciones teleoperadas, y es relevante porque ACT es una de las referencias habituales en el ecosistema LeRobot para tareas de manipulación con pocos datos.

El modelo tiene 51.672.714 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en GPU de consumo. La arquitectura subyacente es la descrita en el paper arXiv:2304.13705, basada en un transformer que combina un codificador visual y un decodificador de acciones con predicción por chunks. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros concretos usados en este entrenamiento.

La ficha se basa únicamente en los metadatos del repositorio y en la model card del autor. No hay resultados de benchmarks, demos ni documentación adicional publicada, por lo que muchos apartados se marcan como no disponibles. El modelo está pensado para robótica (pipeline `robotics`) y se integra en el flujo de LeRobot para entrenamiento, evaluación e inferencia con robots como el SO-100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones por chunks |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice un chunk de acciones futuras en lugar de una única acción por paso. La arquitectura combina un codificador visual (procesa las observaciones de cámara) con un transformer que modela la secuencia de acciones, y emplea un mecanismo de agregación temporal (temporal ensembling) para suavizar las predicciones entre chunks solapados. Esta formulación reduce el error de compounding que aparece en políticas paso a paso y permite alcanzar tasas de éxito altas con datos teleoperados relativamente escasos, según el paper original.

En este repositorio no se documentan los detalles del entrenamiento: no se indica el número de tokens, el número de episodios del dataset `Haku-2004/i_4seg`, la composición de las observaciones (número de cámaras, resolución), ni si se aplicaron técnicas de aumento de datos o regularización. La model card solo indica que la política se entrenó y subió al Hub con LeRobot y que la licencia es Apache 2.0. No hay información sobre RLHF, DPO ni decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Control visuomotor robótico: predice chunks de acciones a partir de observaciones visuales y del estado del robot.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Predicción de acciones en chunks con agregación temporal para reducir el ruido entre pasos.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- Compatible con robots tipo SO-100 (`so100_follower`) según los ejemplos de la model card.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento lingüístico ni capacidades multilingües: es una política de robótica, no un modelo de lenguaje.
- No se documentan capacidades de visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política predice chunks de acciones que permiten al robot ejecutar tareas de pick-and-place con trayectorias suaves, aprovechando la agregación temporal de ACT para reducir vibraciones.
- Replicación de tareas teleoperadas: a partir de un dataset de demostraciones (`Haku-2004/i_4seg`), el modelo reproduce la tarea aprendida en un robot SO-100, lo que facilita la transferencia de habilidades sin programación explícita.
- Prototipado rápido en investigación: con 51,7 M de parámetros y 0,2 GB de pesos, el modelo se puede entrenar y evaluar en una GPU de consumo, lo que acelera ciclos de experimentación en robótica de imitación.
- Evaluación comparativa de políticas ACT: sirve como checkpoint de referencia para comparar hiperparámetros, datasets o variantes de ACT dentro de LeRobot.
- Automatización de tareas repetitivas en entornos controlados: el modelo puede ejecutar secuencias de manipulación aprendidas en un banco de trabajo, reduciendo la intervención humana en tareas monótonas.
- Educación y docencia en robótica: el flujo `lerobot-train` y `lerobot-record` documentado en la model card permite usar el modelo como ejemplo práctico de entrenamiento por imitación en cursos y talleres.
- Integración en pipelines de investigación con robots de bajo coste: al ser ligero y con licencia Apache 2.0, se puede desplegar en estaciones de trabajo con GPU modesta junto a un SO-100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM necesaria es baja (del orden de 1-2 GB incluyendo activaciones y buffers visuales, estimación orientativa).
- GPU recomendadas: cualquier GPU con CUDA compatible; el ejemplo de la model card usa `--policy.device=cuda`. Una RTX 4090, A100 o H100 son sobredimensionadas para este modelo; una GPU de consumo media es suficiente.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño reducido de los pesos.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_it_pred_20 | 51,7 M | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| Políticas ACT de LeRobot (checkpoints de referencia) | variable | no disponible | no disponible | apache-2.0 (segun LeRobot) | Hugging Face |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables para este checkpoint concreto ni de métricas publicadas de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un dataset concreto (`Haku-2004/i_4seg`), la política puede sobreajustarse a las condiciones de ese entorno (iluminación, posiciones, objetos) y fallar en escenarios distintos.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje; no hay información sobre el número de cámaras, resolución de entrada ni horizonte de predicción.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la licencia del dataset `Haku-2004/i_4seg`, que no se detalla.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin demos ni evaluaciones publicadas; no se recomienda su uso en producción sin una validación propia en el robot y entorno objetivo. No hay información sobre seguridad física del robot ni sobre límites de par o velocidad.
- El modelo no incluye documentación sobre el dataset de entrenamiento, lo que dificulta evaluar su generalización.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_it_pred_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_4seg
