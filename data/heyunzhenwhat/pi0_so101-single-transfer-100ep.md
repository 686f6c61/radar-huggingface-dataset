# heyunzhenwhat/pi0_so101-single-transfer-100ep

## Resumen

El modelo `heyunzhenwhat/pi0_so101-single-transfer-100ep` es un fine-tuning de `lerobot/pi0_base`, el modelo fundacional de robótica Vision-Language-Action (VLA) desarrollado por Physical Intelligence. Este ajuste se ha realizado con el framework LeRobot de Hugging Face para controlar un brazo robótico SO-101 en una tarea concreta: mover una cinta adhesiva a una zona marcada. El modelo convierte observaciones visuales (cámara cenital y cámara en la muñeca) y el estado del robot en acciones de 6 grados de libertad.

Con 4.028 millones de parámetros (aproximadamente 4B), este modelo demuestra cómo un VLA preentrenado puede adaptarse a una tarea específica con solo 100 episodios de demostración (29.127 fotogramas). Su relevancia radica en que ejemplifica el flujo de trabajo de fine-tuning de políticas robóticas con datos limitados, un paso clave para llevar los modelos fundacionales de robótica a entornos de laboratorio y producción con hardware asequible.

La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su adopción en proyectos de investigación y desarrollo. Sin embargo, al ser un modelo especializado en una única tarea, su capacidad de generalización fuera de ese escenario es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action transformer (VLA) basado en pi0_base |
| Parametros totales | 4.028.019.472 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (instrucciones en ingles en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura pi0 de Physical Intelligence, un transformer que procesa simultáneamente imágenes de múltiples cámaras, el estado del robot (posición articular) y una instrucción en lenguaje natural para generar acciones de control. El codificador visual extrae características de las imágenes, el codificador de lenguaje procesa la instrucción y un decodificador autoregresivo produce la secuencia de acciones. En esta versión, el modelo se ha fine-tuneado mediante aprendizaje por imitación (behavior cloning) sobre el dataset `heyunzhenwhat/so101-single-transfer-100ep`, que contiene 100 episodios de la tarea "Move the tape into the taped area on the right" grabados a 30 FPS.

El entrenamiento se realizó con 4.500 pasos, batch size de 8, optimizador AdamW y una tasa de aprendizaje de 2.5e-5, utilizando la versión 0.6.1 de LeRobot. No se aplicaron técnicas de RLHF ni DPO; el ajuste es puramente supervisado sobre las demostraciones. La configuración de cámaras incluye una cámara cenital (720x1280) y una cámara en la muñeca (360x640), y el estado del robot se representa con 6 valores (posición y orientación del efector).

## Capacidades

- Control robótico de 6 grados de libertad: genera acciones de posición y orientación del efector a partir de observaciones visuales y de estado.
- Entrada multimodal: procesa dos flujos de imagen (cenital y muñeca) junto con el estado articular del robot.
- Interpretación de instrucciones en lenguaje natural: la tarea se especifica mediante una frase en inglés, que el modelo utiliza como condicionamiento.
- Fine-tuning por imitación: el modelo puede adaptarse a nuevas tareas con pocas demostraciones (100 episodios en este caso).
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face para robótica.
- No es un modelo de chat ni de generación de texto; su salida es una secuencia de acciones de control.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede ejecutar la tarea de transferencia de objetos de forma repetitiva, liberando a operadores humanos en entornos de investigación.
- Prototipado rápido de políticas robóticas: gracias a su fine-tuning con solo 100 episodios, sirve como plantilla para probar nuevas tareas en brazos SO-100/SO-101 sin necesidad de grandes datasets.
- Benchmarking de VLA en hardware de bajo coste: permite comparar el rendimiento de pi0 fine-tuneado frente a otras políticas en un robot asequible, útil para publicaciones académicas.
- Integración en pipelines de robótica con LeRobot: el modelo se puede cargar directamente con `lerobot-rollout` para ejecutar la política en un robot real, facilitando su despliegue en entornos de producción.
- Educación en robótica y aprendizaje por imitación: sirve como ejemplo didáctico de cómo adaptar un modelo fundacional a una tarea concreta, con código y configuración abiertos.
- Investigación en generalización de tareas: al ser un fine-tuning de un modelo base, permite estudiar cómo se comporta el VLA cuando se especializa en una tarea específica y qué información conserva del preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de métricas como tasa de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene ~4B parámetros en FP32 (8.9 GB de repo), se estima que en FP16 ocuparía ~8 GB, y en cuantización 8-bit ~4 GB. Sin embargo, no se han publicado cuantizaciones, por lo que la inferencia se realizaría probablemente en FP32 o FP16.
- GPU recomendadas: no hay especificación oficial. Por tamaño, una GPU con al menos 12 GB de VRAM (p. ej., RTX 3060, RTX 4070, A10) sería necesaria para FP16. Para FP32 se requerirían 16 GB o más.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de gama alta para consumidores (RTX 3090/4090) si se dispone de suficiente VRAM, aunque no hay garantías de rendimiento en tiempo real.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en GPU mediante PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje estándar.
- Latencia y throughput: no disponibles. Al ser una política de control, la latencia depende del hardware y del bucle de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heyunzhenwhat/pi0_so101-single-transfer-100ep | 4.028M | No disponible | Transferencia de cinta en SO-101 | Apache 2.0 | Hugging Face |
| lerobot/pi0_base | 4.028M (estimado) | No disponible | Generalista (VLA) | Apache 2.0 | Hugging Face |
| mizutoukotori/pi0_so101_v4 | No disponible | No disponible | Tareas en SO-101 (no especificado) | No disponible | Hugging Face |

No se dispone de información suficiente sobre otros fine-tunes de pi0 para SO-101 para realizar una comparación detallada en términos de rendimiento. La comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Especialización excesiva: el modelo está entrenado para una única tarea ("Move the tape into the taped area on the right") y no generaliza a otras tareas sin un nuevo fine-tuning.
- Dependencia de la configuración de hardware: las cámaras y el robot deben coincidir con los utilizados en el entrenamiento (cámara cenital y de muñeca, brazo SO-101). Cambios en la iluminación, posición de la cámara o tipo de robot pueden degradar el rendimiento.
- Sin evaluación formal: no se han reportado tasas de éxito ni pruebas en el robot real, por lo que se desconoce su fiabilidad en producción.
- Riesgo de sobreajuste: con solo 100 episodios, el modelo puede memorizar las demostraciones y fallar ante variaciones en la posición de los objetos o condiciones ambientales.
- Alucinación de acciones: como cualquier modelo generativo, puede producir acciones no válidas o erróneas si las observaciones difieren del dominio de entrenamiento.
- Limitaciones de idioma: aunque pi0_base soporta instrucciones en inglés, este fine-tuning solo ha sido entrenado con una instrucción específica; no se garantiza el funcionamiento con otras frases.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base pi0_base también es Apache 2.0, por lo que no hay restricciones adicionales conocidas. Sin embargo, se recomienda verificar la licencia de los datasets utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heyunzhenwhat/pi0_so101-single-transfer-100ep
- Dataset de entrenamiento: https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-100ep
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Blog de pi0 de Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Guía de LeRobot para pi0: https://huggingface.co/docs/lerobot/main/en/pi0
- Repositorio openpi-SO100 (referencia): https://github.com/Maelic/openpi-SO100
