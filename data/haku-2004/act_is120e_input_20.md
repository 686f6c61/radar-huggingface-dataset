# Haku-2004/act_is120e_input_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_is120e_input_20`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/i_4seg` y publicada en Hugging Face por el usuario Haku-2004. El modelo está pensado para controlar un robot seguidor (el ejemplo de la model card usa `so100_follower`) a partir de observaciones visuales y de estado.

El modelo resuelve el problema de generar trayectorias de control continuas y coherentes en tareas de manipulación robótica, evitando el ruido y la falta de suavidad típicos de las políticas que predicen acción a acción. Con 51.671.174 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace adecuado para experimentación en laboratorio y prototipos de bajo coste.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas en formato safetensors con integración directa en Hugging Face Hub. La licencia Apache 2.0 facilita su reutilización comercial, aunque la información publicada sobre el modelo es mínima y no incluye benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para aprendizaje por imitación (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que, a partir de observaciones (imágenes de cámara y estado de las articulaciones), predice un *chunk* de acciones futuras en lugar de una sola acción. Esta estrategia de predicción por fragmentos reduce la varianza temporal y mejora la suavidad del control. La arquitectura incorpora típicamente un codificador visual, un transformer y un decodificador de acciones, junto con una componente de estilo CVAE para modelar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/i_4seg`, presumiblemente compuesto por teleoperaciones del robot objetivo. No se dispone de información sobre el número de episodios, la composición del dataset, el número de tokens o pasos de entrenamiento, ni sobre el uso de RLHF o DPO (no aplicables en este contexto de aprendizaje por imitación). Tampoco se detallan innovaciones adicionales más allá del propio mecanismo de *action chunking* descrito en el paper arXiv:2304.13705.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (posición de articulaciones, pinza) a partir de observaciones visuales y de estado.
- Predicción de *action chunks*: emite varios pasos de acción de forma conjunta, lo que produce trayectorias más suaves y estables.
- Aprendizaje a partir de demostraciones teleoperadas: no requiere ingeniería de recompensas ni entorno simulado.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante los comandos `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots tipo `so100_follower` según el ejemplo de la model card.
- No dispone de capacidades de lenguaje, visión general, tool calling, agentes ni razonamiento multi-paso; es un modelo específico de política robótica.

## Casos de uso

- Manipulación de objetos en laboratorio: la política puede ejecutar tareas de pick-and-place entrenadas con demostraciones teleoperadas, aprovechando la predicción por chunks para movimientos suaves.
- Prototipado rápido de robots de bajo coste: con ~51,7 M de parámetros y 0,2 GB de pesos, se puede desplegar en una estación de trabajo con GPU de consumo para iterar sobre nuevas tareas.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT, datasets o hiperparámetros dentro del ecosistema LeRobot.
- Automatización de tareas repetitivas de ensamblaje: el modelo puede aprender secuencias de inserción o colocación a partir de teleoperación y replicarlas con el robot seguidor.
- Evaluación de pipelines de datos robóticos: útil para validar la calidad de un dataset (por ejemplo, `i_4seg`) midiendo la tasa de éxito de la política entrenada sobre él.
- Docencia y formación: ejemplo práctico de entrenamiento y evaluación de políticas con LeRobot, adecuado para cursos de robótica y aprendizaje automático.
- Despliegue en entornos controlados de investigación: al ser Apache 2.0, puede integrarse en proyectos académicos o industriales internos sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (fp32), dado el tamaño de 51,7 M de parámetros; en fp16 o bf16, alrededor de 0,1 GB de pesos más memoria para el codificador visual y buffers.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de las GPU de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_is120e_input_20 | 51,7 M | no disponible | no disponible | apache-2.0 | Hugging Face Hub |
| ACT original (paper arXiv:2304.13705) | no disponible | no disponible | reportado en el paper (no accesible aquí) | no disponible | código y pesos según paper |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | variable | no disponible | no disponible | variable | Hugging Face Hub / LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset concreto (`Haku-2004/i_4seg`), la política puede sobreajustarse a las condiciones de iluminación, posiciones de objetos y configuración del robot presentes en las demostraciones.
- Riesgo de alucinación: en robótica, se traduce en acciones fuera de distribución o movimientos inseguros ante observaciones no vistas; requiere supervisión y límites de seguridad en el robot.
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje; no se documentan capacidades multilingües ni de contexto textual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar la procedencia del dataset `i_4seg` antes de un despliegue comercial.
- Caveats para producción: no hay benchmarks publicados, ni documentación sobre tasa de éxito, número de episodios de entrenamiento o generalización; el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Dependencia del robot: el ejemplo de la model card usa `so100_follower`; su uso con otro hardware requeriría reentrenamiento o adaptación de las dimensiones de acción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_is120e_input_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_4seg
