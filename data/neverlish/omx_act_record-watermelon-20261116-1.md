# neverlish/omx_act_record-watermelon-20261116-1

## Resumen

`neverlish/omx_act_record-watermelon-20261116-1` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario neverlish y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para robótica basada en aprendizaje. El repositorio se creó el 17 de noviembre de 2026 y no registra descargas ni interacciones.

El modelo resuelve el problema del control motor fino en tareas de manipulación robótica aprendidas de datos de teleoperación. En lugar de predecir una acción por paso de inferencia, ACT genera un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control en tareas de contacto. Con 51.668.614 parámetros, es un modelo compacto pensado para ejecutarse en hardware de consumo y en robots de bajo coste como la plataforma SO-100.

La relevancia de esta ficha es acotada: se trata de un checkpoint concreto entrenado sobre un dataset específico (`neverlish/record-watermelon-20261108-1`), presumiblemente una tarea de recogida de sandía, y no de un modelo de propósito general. Su interés radica en servir como ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento, evaluación y despliegue) y en su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone transformer con un codificador visual y un decodificador de acciones que predice chunks de acciones de longitud fija. Este diseño mitiga el problema de la varianza en la predicción paso a paso y permite un control más suave en tareas de manipulación que requieren precisión. El modelo incluye típicamente un mecanismo de atención sobre las observaciones visuales y propioceptivas del robot.

El entrenamiento se realizó con LeRobot sobre el dataset `neverlish/record-watermelon-20261108-1`, compuesto por episodios de teleoperación. No se dispone de información sobre el número de episodios, la composición exacta del dataset, la duración de las trayectorias ni si se aplicaron técnicas de aumento de datos o regularización específicas. Tampoco se documenta el uso de RLHF, DPO ni ajuste por refuerzo; ACT es puramente supervisado sobre demostraciones. La model card no detalla hiperparámetros, número de tokens de entrenamiento ni innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control robótico por imitación: genera chunks de acciones para robots manipuladores a partir de observaciones visuales y de estado.
- Aprendizaje de tareas de manipulación específicas: entrenado para una tarea concreta de recogida de sandía sobre la plataforma SO-100 (según el comando de evaluación de la model card).
- Inferencia en tiempo real: diseñado para ejecutarse en bucles de control de robots de bajo coste.
- Integración con LeRobot: compatible con las herramientas `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Recogida automatizada de objetos en entornos controlados: el modelo puede ejecutar la tarea de recogida de sandía para la que fue entrenado, integrado en un robot SO-100 con cámara y pinza, aprovechando los chunks de acción para un control estable.
- Reproducción de pipelines de investigación en robótica: sirve como checkpoint de referencia para validar el flujo completo de LeRobot (entrenamiento, evaluación y despliegue) en un entorno de laboratorio.
- Prototipado de sistemas de manipulación de bajo coste: al tener solo 51,7 M de parámetros, puede ejecutarse en GPUs de consumo y en ordenadores integrados, lo que facilita prototipos económicos.
- Evaluación comparativa de políticas ACT: útil como baseline para comparar con otras políticas entrenadas sobre el mismo dataset o con variantes de ACT.
- Docencia y formación en aprendizaje por imitación: ejemplo concreto y reproducible para enseñar el método ACT y el uso de LeRobot en cursos de robótica.
- Despliegue en entornos de producción acotados: con licencia Apache 2.0, puede integrarse en sistemas comerciales de automatización de tareas repetitivas de picking, siempre que la tarea coincida con la distribución de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 (51,7 M de parámetros equivalen a unos 207 MB de pesos); en FP16, aproximadamente 103 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; se ha documentado el uso con CUDA (`--policy.device=cuda`), por lo que se recomiendan GTX 1650, RTX 3050, RTX 4090 o superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (lerobot-record), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neverlish/omx_act_record-watermelon-20261116-1 | 51,7 M | no disponible | Manipulación robótica (ACT) | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (checkpoints de ejemplo) | ~50 M (típico) | no disponible | Manipulación robótica | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia) | variable | no disponible | Manipulación robótica | MIT (implementación de referencia) | Repositorios académicos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (recogida de sandía) y no generaliza a otras tareas sin reentrenamiento.
- Sin datos de evaluación: no se han publicado métricas de éxito, por lo que se desconoce su fiabilidad real en producción.
- Riesgo de sobreajuste al dataset: al ser un checkpoint pequeño entrenado sobre un dataset concreto, puede fallar ante variaciones de iluminación, posición de objetos o del robot.
- Sesgos: no aplica en el sentido lingüístico, pero el modelo hereda los sesgos de las demostraciones de teleoperación (posiciones, velocidades y estrategias del operador).
- Alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la generación de acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Caveat para producción: requiere un robot compatible (SO-100 u otro con la misma configuración) y un entorno controlado; no se recomienda su despliegue en entornos no supervisados sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/neverlish/omx_act_record-watermelon-20261116-1
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/neverlish/record-watermelon-20261108-1
