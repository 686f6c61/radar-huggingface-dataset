# KyraLeeChunWei/Paracetamol_e300_40K_ACT_aug

## Resumen

Paracetamol_e300_40K_ACT_aug es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, por el usuario KyraLeeChunWei. Su propósito es controlar un robot manipulador prediciendo fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación aprendidas a partir de demostraciones teleoperadas.

El modelo cuenta con 51.678.855 parámetros (aproximadamente 51,7 millones) en formato safetensors, con un tamaño de repositorio de 0,2 GB. Está entrenado sobre el dataset KyraLeeChunWei/Paracetamol_e300, que por el nombre sugiere una tarea de manipulación relacionada con paracetamol con 300 episodios, y el sufijo "40K" probablemente indica 40.000 pasos de entrenamiento, mientras que "aug" apunta a aumento de datos (data augmentation). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de esta ficha es doble: por un lado, documenta un modelo concreto de robótica de código abierto; por otro, sirve como ejemplo de cómo LeRobot estandariza el entrenamiento y despliegue de políticas de imitación. No obstante, la información pública es escasa: no hay benchmarks publicados, no se especifican los idiomas (no aplica en sentido estricto, ya que no es un modelo de lenguaje) y no se detalla la configuración exacta del robot ni del dataset más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.678.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de robótica con horizonte de acción fijo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | KyraLeeChunWei/Paracetamol_e300 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción de chunks de acciones. El modelo recibe observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y produce una secuencia de acciones futuras de longitud fija, lo que reduce el error de acumulación y mejora la suavidad del control. La arquitectura incluye un codificador visual (habitualmente ResNet) para procesar las imágenes y un transformer que modela la secuencia de acciones, con una cabeza de estilo CVAE (autoencoder variacional condicional) para capturar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot sobre el dataset Paracetamol_e300, que por la nomenclatura contiene 300 episodios teleoperados. El sufijo "40K" sugiere 40.000 pasos de entrenamiento y "aug" indica que se aplicó aumento de datos (probablemente en el espacio de imágenes o de estados). No se dispone de información pública sobre el número exacto de tokens, la composición del dataset, el robot utilizado (aunque los ejemplos de la model card mencionan so100_follower) ni si se aplicaron técnicas de RLHF o DPO, que no son habituales en este tipo de políticas. La innovación principal es el propio action chunking, que predice varios pasos de acción a la vez y ha demostrado altas tasas de éxito en tareas de manipulación fina.

## Capacidades

- Control robótico de manipulación mediante aprendizaje por imitación: genera secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot.
- Predicción de acciones multimodales: la componente CVAE permite modelar distintas formas de ejecutar una misma tarea, capturando la variabilidad de las demostraciones humanas.
- Ejecución de tareas de precisión: adecuado para tareas como pick-and-place, inserción de objetos o manipulación de piezas pequeñas, siempre que el entrenamiento se haya realizado en ese dominio.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante los comandos `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots tipo SO-100/SO-101 (según los ejemplos de la model card) y otros brazos manipuladores soportados por LeRobot.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües, ya que no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades cognitivas fuera del control motor.

## Casos de uso

- Manipulación de objetos en laboratorio: el modelo puede ejecutar tareas de pick-and-place aprendidas de demostraciones teleoperadas, gracias a la predicción de chunks de acción que suaviza el control y reduce el error acumulado.
- Automatización de tareas repetitivas en línea de montaje: con un brazo SO-100, se puede desplegar la política para tareas de recogida y colocación de piezas, siempre que el entorno y la iluminación sean similares a los del dataset de entrenamiento.
- Investigación en aprendizaje por imitación: sirve como punto de partida para comparar variantes de ACT, estudiar el efecto del aumento de datos o evaluar la generalización a nuevas posiciones de objetos.
- Prototipado rápido de políticas robóticas: con LeRobot, un equipo puede entrenar y evaluar una política en pocas horas usando el flujo `lerobot-train` y `lerobot-record`, lo que acelera la iteración en proyectos de robótica.
- Docencia y formación: el modelo y su dataset asociado permiten ilustrar el ciclo completo de aprendizaje por imitación, desde la teleoperación hasta la evaluación en un robot real.
- Tareas de manipulación de objetos pequeños (como blísteres o envases farmacéuticos, si el dataset Paracetamol_e300 se corresponde con ese dominio): la política puede aprender a coger, orientar y depositar objetos con precisión submétrica.
- Evaluación comparativa de políticas: al estar publicado en el Hub con licencia Apache 2.0, puede servir como baseline en estudios de robótica comparada frente a otras políticas de LeRobot (Diffusion Policy, TDMPC, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~51,7 millones de parámetros en safetensors (aproximadamente 200 MB en FP32), la inferencia cabe holgadamente en GPUs de consumo. Una estimación conservadora sitúa el uso en menos de 1 GB de VRAM, incluyendo el codificador visual y los buffers de inferencia.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento se recomienda una RTX 3090/4090 o superior (A100, H100) si se quiere reducir el tiempo de entrenamiento.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090, etc. Incluso podría ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el stack de Hugging Face, y exportación a otros runtimes si se convierte el modelo. No se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La latencia depende del robot, la frecuencia de control y el hardware; en GPUs modernas, la inferencia de un chunk de acciones suele completarse en milisegundos, pero no se han publicado mediciones para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paracetamol_e300_40K_ACT_aug | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no aplica | altas tasas de éxito en tareas de manipulación (según paper) | no disponible | Código en el repositorio del paper |
| Diffusion Policy (otra política de LeRobot) | no disponible | no aplica | no disponible | no disponible | Hugging Face (LeRobot) |
| Otras políticas LeRobot (p. ej. TDMPC) | no disponible | no aplica | no disponible | no disponible | Hugging Face (LeRobot) |

La comparación cuantitativa no es posible con la información disponible, ya que no se han publicado métricas de éxito ni curvas de aprendizaje para este checkpoint concreto. La comparación cualitativa se limita a la familia de métodos: ACT se distingue por predecir chunks de acciones, mientras que Diffusion Policy modela la distribución de acciones mediante difusión y TDMPC combina planificación con aprendizaje de modelo.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo ha sido entrenado con un dataset específico (Paracetamol_e300) y puede sobreajustarse a las condiciones de iluminación, posiciones de objetos y configuración del robot presentes en ese dataset. No se han documentado sesgos adicionales.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe riesgo de acciones incorrectas o inseguras cuando el estado observado se aleja de la distribución de entrenamiento (fuera de distribución).
- Limitaciones de contexto o idioma: no es un modelo de lenguaje, por lo que no hay soporte multilingüe. La generalización a nuevas tareas requiere reentrenamiento o fine-tuning con datos del nuevo dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios. No se identifican restricciones adicionales en la información disponible.
- Caveats para producción: la información pública es muy limitada; no se especifican el robot exacto, la frecuencia de control, el número de cámaras ni los hiperparámetros de entrenamiento. Antes de desplegar en un entorno real, es imprescindible validar la política en condiciones controladas y establecer mecanismos de parada de seguridad. La licencia del dataset subyacente (KyraLeeChunWei/Paracetamol_e300) no se detalla en la información proporcionada y debería verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/Paracetamol_e300_40K_ACT_aug
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/Paracetamol_e300
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
