# dogeum/classify_tokens_demo_plus

## Resumen

El modelo `dogeum/classify_tokens_demo_plus` es una política de aprendizaje por imitación para robótica basada en la arquitectura Action Chunking with Transformers (ACT). Desarrollado por dogeum (Park), se ha entrenado y publicado mediante la librería LeRobot de HuggingFace, siguiendo el enfoque descrito en el paper 2304.13705. ACT predice bloques de acciones en lugar de pasos individuales, lo que permite a un robot ejecutar secuencias de movimiento más coherentes y fluidas a partir de datos teleoperados.

El modelo tiene un total de 51.668.614 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Está pensado para ser utilizado como política de control en tareas de manipulación robótica, integrándose en el ecosistema LeRobot para entrenamiento, evaluación e inferencia. Su relevancia radica en que ofrece una implementación práctica de un método de imitación learning eficaz para entornos robóticos controlados, con un tamaño de modelo reducido que facilita su despliegue en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura basada en transformers que predice secuencias de acciones (chunks) en lugar de un único paso por iteración. Esta técnica, conocida como action chunking, permite que el robot ejecute movimientos más estables y reduce la acumulación de errores en tareas de control continuo. El modelo se ha entrenado con el dataset `dogeum/classify_tokens_dataset_demo_re` y se ha publicado mediante la librería LeRobot, que ofrece herramientas para el entrenamiento, la evaluación y el registro de episodios robóticos. No se dispone de información detallada sobre la composición del dataset, el número de tokens de entrenamiento ni sobre la aplicación de técnicas como RLHF o DPO, ya que se trata de un modelo de política robótica y no de lenguaje.

## Capacidades

- Predicción de chunks de acciones para control robótico continuo.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot para entrenamiento, inferencia y evaluación.
- Compatibilidad con el framework de HuggingFace para publicación y descarga de pesos.
- No soporta generación de texto, razonamiento, tool calling ni capacidades de visión o audio.
- No dispone de modo de pensamiento ni de capacidades multilingües.

## Casos de uso

- Control de brazos robóticos teleoperados: el modelo puede gobernar un brazo tipo SO-100, ejecutando secuencias de acciones aprendidas de demostraciones humanas. Es adecuado para entornos de laboratorio donde se necesita reproducir movimientos precisos.
- Automatización de tareas de manipulación en producción: en líneas de montaje, el modelo puede aprender a agarrar y colocar componentes a partir de teleoperación, reduciendo la necesidad de programación manual de trayectorias.
- Investigación en aprendizaje por imitación: sirve como base para experimentar con técnicas de action chunking y comparar políticas en entornos robóticos controlados, gracias a su integración con LeRobot.
- Desarrollo de políticas en simulación: el modelo puede entrenarse en simuladores robóticos y transferirse al mundo real, permitiendo iterar rápidamente sobre nuevas tareas sin riesgo físico.
- Recogida y colocación de objetos en logística: en almacenes, el modelo puede aprender tareas de picking y placing mediante demostraciones teleoperadas, adaptándose a configuraciones de objetos variables.
- Evaluación de políticas robóticas en pipelines de LeRobot: se puede utilizar como política de referencia para validar el rendimiento de nuevos métodos de control o para comparar distintas arquitecturas de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 51,6 millones de parámetros, la huella de memoria es reducida, pero no se dispone de cifras confirmadas para inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del modelo, pero no confirmado.
- Opciones de despliegue: LeRobot, con soporte para CUDA según los comandos de entrenamiento e inferencia documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos similares. Existen otros modelos ACT publicados por el mismo autor en HuggingFace, como `doosan_gripper_act_1M`, pero no se han encontrado especificaciones detalladas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real del modelo no está verificado.
- La capacidad de generalización depende en gran medida de la calidad y cantidad de los datos de teleoperación utilizados durante el entrenamiento.
- Puede no funcionar correctamente en tareas o entornos distintos de aquellos para los que fue entrenado.
- La licencia Apache 2.0 permite uso comercial y modificación sin restricciones adicionales.
- No se dispone de información sobre sesgos o riesgos de alucinación, ya que es un modelo de control robótico y no de generación de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dogeum/classify_tokens_demo_plus
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset asociado: https://huggingface.co/datasets/dogeum/classify_tokens_dataset_demo_re
- Perfil del autor: https://huggingface.co/dogeum
