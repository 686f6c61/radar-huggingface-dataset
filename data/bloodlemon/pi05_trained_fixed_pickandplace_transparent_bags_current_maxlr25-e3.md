# bloodlemon/pi05_trained_fixed_pickandplace_transparent_bags_current_maxlr25-e3

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, orientado a la generalización en entornos abiertos para tareas de robótica. La implementación disponible en este repositorio es una adaptación para LeRobot del repositorio OpenPI de Physical Intelligence, y ha sido entrenada y publicada en el Hub mediante LeRobot. El checkpoint concreto que nos ocupa, alojado por el usuario bloodlemon, corresponde a un ajuste específico para una tarea de recogida y colocación (pick and place) de bolsas transparentes.

El modelo aborda uno de los problemas centrales de la robótica de manipulación: la capacidad de generalizar a entornos y situaciones no vistas durante el entrenamiento. Frente a políticas que funcionan bien en entornos controlados, π₀.₅ se presenta como una evolución de π₀ diseñada explícitamente para la generalización de mundo abierto. Este checkpoint particular, sin embargo, está especializado mediante fine-tuning sobre un dataset propio del autor, por lo que su alcance real queda acotado a la tarea concreta de manipulación de bolsas transparentes.

La información pública disponible sobre este repositorio es muy limitada: no se especifican parámetros totales, longitud de contexto, idiomas ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño reportado es de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados o que la métrica no está actualizada. La licencia es Apache 2.0 y el formato de pesos es safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence; implementación LeRobot adaptada de OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto generativo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | bloodlemon/recrd-fixed-pickandplace-transparent-bags-current |
| Tamano del repositorio | 0.0 GB (reportado) |

## Arquitectura y entrenamiento

π₀.₅ es un modelo de visión-lenguaje-acción: procesa observaciones visuales y consignas en lenguaje para producir acciones de control robótico. Según la model card, se trata de una evolución de π₀ de Physical Intelligence, con el objetivo explícito de lograr generalización de mundo abierto, es decir, funcionar en entornos y situaciones no vistas durante el entrenamiento. La implementación incluida en este repositorio procede del repositorio OpenPI de Physical Intelligence y ha sido adaptada para LeRobot.

El checkpoint ha sido entrenado y subido al Hub mediante LeRobot, sobre el dataset `bloodlemon/recrd-fixed-pickandplace-transparent-bags-current`. No se dispone de información sobre el número de tokens, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas de esta variante. La model card incluye comandos genéricos de entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`), pero el ejemplo de entrenamiento utiliza `--policy.type=act`, lo que constituye una plantilla genérica y no una especificación de la arquitectura de este checkpoint. No se dispone de información adicional sobre hiperparámetros, número de pasos o régimen de entrenamiento, más allá del sufijo `maxlr25-e3` en el nombre, que sugiere una tasa de aprendizaje máxima de 2.5e-3.

## Capacidades

- Control robótico visuomotor: genera acciones a partir de observaciones visuales y consignas, orientado a tareas de manipulación.
- Manipulación pick and place: el checkpoint está especializado en la recogida y colocación de bolsas transparentes, según el dataset de entrenamiento.
- Generalización de mundo abierto (según la descripción de π₀.₅): el modelo base está diseñado para transferir a entornos no vistos.
- Integración con LeRobot: entrenamiento y evaluación mediante las herramientas `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots tipo `so100_follower` en los ejemplos de evaluación de la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no se documentan más allá del uso visuomotor propio de un VLA.

## Casos de uso

- Recogida y colocación de bolsas transparentes en línea de producción: es el caso de uso directo para el que fue ajustado el checkpoint, usando el dataset `recrd-fixed-pickandplace-transparent-bags-current`. Adecuado porque el fine-tuning está alineado con esa tarea concreta.
- Automatización de picking en almacén con objetos de baja visibilidad: las bolsas transparentes presentan dificultades de percepción; un VLA ajustado específicamente puede abordar esa condición, aunque la generalización a otras bolsas o iluminaciones no está documentada.
- Evaluación de políticas VLA en laboratorio: sirve como punto de partida para reproducir el pipeline de LeRobot con `lerobot-record` y comparar con otras políticas sobre el mismo robot `so100_follower`.
- Prototipado de flujos de manipulación con LeRobot: integración en pipelines de entrenamiento y evaluación de LeRobot para experimentar con políticas VLA en robots de bajo coste.
- Investigación en generalización de mundo abierto: usar el modelo base π₀.₅ y este checkpoint como referencia para estudiar transferencia a entornos nuevos, siempre que se validen los resultados empíricamente.
- Docencia y demostraciones de robótica con VLA: el tamaño reportado del repositorio y la licencia Apache 2.0 facilitan su uso en entornos académicos, aunque la ausencia de métricas publicadas limita las garantías de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros totales ni cuantizaciones).
- GPU recomendadas: no disponible. La model card solo indica `--policy.device=cuda` en los ejemplos de entrenamiento.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse sin conocer el tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para políticas VLA de robótica.
- Latencia y throughput: no disponible.
- Robot de referencia en los ejemplos: `so100_follower`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ (este checkpoint, bloodlemon) | VLA, fine-tuning para pick and place | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| π₀.₅ (Physical Intelligence, base) | VLA de propósito general | no disponible | no disponible | no disponible en la informacion | Blog de Physical Intelligence y OpenPI |
| π₀ (Physical Intelligence) | VLA predecesor | no disponible | no disponible | no disponible en la informacion | OpenPI |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparación se limita a la relación de linaje (π₀ → π₀.₅) y al hecho de que este checkpoint es un fine-tuning especializado del modelo base.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está ajustado a una única tarea (pick and place de bolsas transparentes); no hay evidencia de que funcione fuera de ese dominio.
- Sin métricas publicadas: no se han publicado benchmarks ni tasas de éxito, por lo que no puede evaluarse su rendimiento de forma objetiva.
- Repositorio con 0 descargas y 0 likes y tamaño reportado de 0.0 GB: conviene verificar que los pesos estén realmente disponibles antes de usarlo en producción.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible en el sentido de generación de texto; en robótica, el riesgo equivalente es la ejecución de acciones incorrectas, que no está cuantificado.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribución y sin garantías; deben revisarse las condiciones del modelo base π₀.₅ y del repositorio OpenPI de Physical Intelligence.
- La model card incluye comandos de entrenamiento con `--policy.type=act`, que no corresponde necesariamente a la arquitectura de este checkpoint; no deben tomarse como especificación técnica.
- Para producción en robótica, es imprescindible validar el modelo en el entorno real y con el hardware objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bloodlemon/pi05_trained_fixed_pickandplace_transparent_bags_current_maxlr25-e3
- Dataset de entrenamiento: https://huggingface.co/datasets/bloodlemon/recrd-fixed-pickandplace-transparent-bags-current
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
