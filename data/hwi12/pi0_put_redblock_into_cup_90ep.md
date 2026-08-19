# hwi12/pi0_put_redblock_into_cup_90ep

## Resumen

El modelo `hwi12/pi0_put_redblock_into_cup_90ep` es un fine-tune del modelo fundacional de robótica π₀ (Pi0) de Physical Intelligence, realizado por el usuario hwi12 (KimKwanHwi) y publicado en Hugging Face. Pi0 es una política Vision-Language-Action (VLA) de propósito general que combina visión, comprensión de instrucciones en lenguaje natural y control de robots, y este checkpoint concreto se ha entrenado para una tarea específica: recoger un bloque rojo y colocarlo en una taza de papel.

El modelo se ha ajustado mediante aprendizaje por imitación (imitation learning) utilizando el framework LeRobot, sobre un dataset propio de 85 episodios con 26.556 fotogramas a 30 FPS. Está pensado para ser desplegado en un robot tipo `so_follower` con dos cámaras (lateral y de muñeca), y produce acciones de 6 grados de libertad. Al ser un fine-tune de un modelo base ya publicado, hereda la arquitectura y capacidades generales de Pi0, pero especializado en esta tarea concreta.

La relevancia de este modelo radica en que demuestra el flujo de trabajo de fine-tuning de un VLA de última generación para una tarea robótica específica, utilizando herramientas open source como LeRobot. Es un ejemplo práctico de cómo adaptar un modelo fundacional a un escenario de manipulación real, aunque su utilidad está limitada a la tarea y configuración de hardware para las que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Pi0 (Physical Intelligence) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi0_base`, el checkpoint base de Pi0 publicado por Physical Intelligence y adaptado al ecosistema LeRobot. Pi0 es una política VLA que procesa imágenes de cámaras (en este caso, dos vistas: lateral y de muñeca) junto con el estado del robot (posición de las articulaciones, 6 valores) y una instrucción en lenguaje natural, para generar acciones de control (6 valores). La arquitectura interna exacta (número de capas, dimensiones, etc.) no se detalla en la información disponible, pero se sabe que es un modelo de tipo transformer multimodal entrenado con una combinación de datos de demostración y aprendizaje por refuerzo.

El entrenamiento de este checkpoint se realizó con LeRobot (versión 0.6.1) sobre el dataset `hwi12/put_redblock_into_cup_90ep`, que contiene 85 episodios de demostración de la tarea "Pick up the red block and put it into the paper cup". La configuración de entrenamiento incluye 2.000 pasos, batch size de 16, optimizador AdamW con learning rate 0.0001 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste por imitación directa.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa dos flujos de cámara (lateral y de muñeca) con resolución 480×640 píxeles.
- Comprensión de instrucciones en lenguaje natural: la tarea se especifica mediante una frase ("Pick up the red block and put it into the paper cup"), aunque el modelo está especializado en esta única instrucción.
- Aprendizaje por imitación: ha sido entrenado para replicar las demostraciones del dataset, por lo que puede ejecutar la tarea de pick-and-place de forma autónoma.
- Integración con LeRobot: compatible con el ecosistema de herramientas de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No se reportan capacidades de tool calling, agentes multi-paso ni razonamiento general fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede controlar un robot `so_follower` para recoger un bloque rojo y depositarlo en una taza, útil en líneas de montaje o laboratorios de robótica.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA base para una tarea específica, permitiendo estudiar el efecto del tamaño del dataset, el número de pasos o la configuración de cámaras.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, se puede desplegar el modelo en un robot real con pocos comandos, acelerando la validación de nuevas tareas.
- Benchmark de manipulación: puede utilizarse como referencia para comparar el rendimiento de otros fine-tunes de Pi0 en tareas similares de recogida y colocación.
- Educación y formación en robótica: permite a estudiantes y desarrolladores experimentar con un VLA de última generación sin necesidad de entrenar desde cero, usando hardware asequible como el robot `so_follower`.
- Base para fine-tuning adicional: el checkpoint puede servir como punto de partida para adaptar el modelo a variantes de la tarea (diferentes colores, posiciones, objetos) mediante entrenamiento adicional con nuevos datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No hay datos de éxito en tareas reales, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el modelo procesa dos imágenes de 480×640 píxeles y genera acciones, se requiere una GPU con suficiente memoria para manejar el modelo VLA, pero no se especifica el tamaño exacto.
- GPU recomendadas: no disponible. Se sugiere al menos una GPU de gama media-alta (por ejemplo, RTX 3060 o superior) para inferencia en tiempo real, aunque no hay confirmación oficial.
- Compatibilidad con GPU de consumo: probablemente sí, dado que el modelo base Pi0 tiene versiones cuantizadas, pero no se indica para este checkpoint concreto.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También es posible usar el framework de LeRobot para integración con otros sistemas.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de las cámaras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunes de Pi0 para tareas específicas). El modelo base `lerobot/pi0_base` es la referencia principal, pero no se proporcionan métricas de rendimiento relativas. Otros fine-tunes de Pi0 podrían existir en Hugging Face, pero no se mencionan en la información disponible. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento pequeño (85 episodios) y tarea muy específica, lo que puede provocar sobreajuste y baja generalización a variaciones de la tarea (cambios de iluminación, posición de objetos, etc.).
- No se han reportado resultados de evaluación en robot real, por lo que el rendimiento real es desconocido.
- El modelo solo ha sido entrenado para una instrucción concreta; no es capaz de entender otras órdenes ni de razonar sobre tareas diferentes.
- Depende de la configuración de hardware específica (robot `so_follower`, cámaras `side` y `wrist`); su uso en otros robots o con otras cámaras requeriría reentrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Pi0 puede tener restricciones adicionales; se recomienda revisar la licencia del modelo base.
- No se proporcionan detalles sobre sesgos o alucinaciones, pero al ser un modelo de control robótico, el riesgo principal es la ejecución de acciones incorrectas que puedan causar daños físicos; se debe operar con supervisión humana en entornos seguros.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hwi12/pi0_put_redblock_into_cup_90ep)
- [Modelo base Pi0 en Hugging Face](https://huggingface.co/lerobot/pi0_base)
- [Dataset de entrenamiento](https://huggingface.co/datasets/hwi12/put_redblock_into_cup_90ep)
- [Blog de Physical Intelligence sobre Pi0](https://www.physicalintelligence.company/blog/pi0)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de Pi0 en LeRobot](https://huggingface.co/docs/lerobot/main/en/pi0)
