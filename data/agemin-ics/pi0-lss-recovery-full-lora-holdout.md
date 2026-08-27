# agemin-ICS/pi0-lss-recovery-full-lora-holdout

## Resumen

El modelo `agemin-ICS/pi0-lss-recovery-full-lora-holdout` es una política de control robótico (policy) entrenada mediante aprendizaje por imitación con el framework LeRobot. Se basa en la arquitectura π₀ (pi-zero), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, adaptado aquí para controlar un brazo robótico tipo `lss_arm_http` en la tarea de colocar un cubo rosa en una caja. El modelo ha sido entrenado con un dataset propio de 95 episodios y 45.609 frames, y se publica bajo licencia Apache 2.0.

La relevancia de este modelo radica en que demuestra el uso práctico de π₀ en un escenario de manipulación real, con un ajuste fino (LoRA) sobre un dataset reducido. Al estar integrado con LeRobot, ofrece un flujo de trabajo reproducible para entrenar y desplegar políticas robóticas en hardware real, lo que lo hace útil para investigadores y desarrolladores que trabajan en robótica de manipulación.

El repositorio contiene los pesos en formato safetensors (1,8 GB) y está diseñado para ser ejecutado directamente con las herramientas de LeRobot, tanto para inferencia como para reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀ (VLA basado en flow matching, con codificador de visión y decodificador de acciones) |
| Parametros totales | no disponible (el repo contiene un adaptador LoRA, no los pesos completos del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base π₀, no especificado en la ficha) |
| Tipos de cuantizacion | no disponible (solo se indica safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (a través de LeRobot) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀, un modelo de visión-lenguaje-acción (VLA) que utiliza un enfoque de flow matching para generar acciones continuas. En esta implementación concreta, se ha entrenado un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base π₀, lo que permite un ajuste eficiente con un dataset relativamente pequeño. El entrenamiento se realizó con LeRobot versión 0.6.1, utilizando el optimizador AdamW con una tasa de aprendizaje de 2,5e-5, batch size de 32 y 30.000 pasos de entrenamiento. El dataset de entrenamiento (`agemin-ICS/lss-arm-pink-cube-box-recovery-delta`) contiene 95 episodios a 15 FPS, con observaciones de dos cámaras (frontal y de muñeca) y estado del robot (6 dimensiones), produciendo acciones de 6 dimensiones.

No se especifican detalles sobre la composición exacta del dataset ni sobre técnicas adicionales como RLHF o DPO. El entrenamiento es de tipo imitación supervisada (behavior cloning) sobre demostraciones humanas.

## Capacidades

- Control de brazo robótico: genera comandos de acción de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa imágenes de dos cámaras (frontal y de muñeca) junto con el estado del robot.
- Tarea específica: está entrenado para la tarea "Put the pink cube in the box" (colocar el cubo rosa en la caja).
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Inferencia en tiempo real: diseñado para ejecutarse en bucle de control con el robot, con soporte para ejecución continua o por duración determinada.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural, al ser un modelo puramente robótico.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo puede controlar un brazo robótico para tareas de pick-and-place, como colocar objetos en contenedores, útil para investigación en robótica.
- Automatización de tareas repetitivas en líneas de montaje: con el entrenamiento adecuado sobre datasets específicos, la política puede adaptarse a tareas de ensamblaje o clasificación de piezas.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, se puede entrenar y desplegar en pocos pasos, ideal para validar ideas en entornos académicos o de I+D.
- Evaluación de algoritmos de aprendizaje por imitación: sirve como punto de partida para comparar diferentes métodos de entrenamiento (LoRA, fine-tuning completo, etc.) sobre la misma tarea.
- Investigación en generalización de VLA: al ser un adaptador sobre π₀, permite estudiar cómo se comporta un modelo base preentrenado al ajustarse a una tarea específica con pocos datos.
- Educación en robótica: los estudiantes pueden utilizar este modelo como ejemplo práctico de despliegue de un VLA en hardware real, siguiendo la documentación de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que se trata de un adaptador LoRA sobre un modelo base π₀, la VRAM dependerá del modelo base (π₀ tiene alrededor de 3.000 millones de parámetros, por lo que se recomienda al menos 16 GB de VRAM para inferencia en FP16, aunque no se confirma en la documentación).
- GPU recomendadas: no especificadas. Para ejecutar π₀ se suele requerir una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100, L4). Para entrenamiento, se recomienda una GPU con 24 GB o más.
- Compatibilidad con GPU de consumo: probablemente sí, si se usa cuantización o se reduce la resolución de entrada, pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que gestionan la inferencia. También es posible usar el framework openpi (de Physical Intelligence) para cargar el modelo base y el adaptador, aunque no se documenta en esta ficha.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de las cámaras.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos de la misma categoría (políticas robóticas basadas en VLA). El modelo es un adaptador específico para una tarea concreta, y no se han publicado métricas comparativas. Como referencia, otros modelos VLA como OpenVLA o RT-2 existen, pero no se pueden comparar sin datos de rendimiento. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Sesgos conocidos: no se reportan, pero al ser un modelo entrenado con un dataset pequeño (95 episodios) y específico, puede tener baja generalización a variaciones del entorno (iluminación, posiciones de objetos, etc.).
- Riesgo de alucinación: en el contexto robótico, esto se traduce en acciones incorrectas o impredecibles ante entradas fuera de la distribución de entrenamiento. No se ha evaluado la robustez.
- Limitaciones de contexto: el modelo solo acepta las observaciones definidas (estado de 6 dimensiones y dos imágenes con resoluciones fijas). No soporta entradas de lenguaje ni instrucciones adicionales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base π₀ puede tener sus propias restricciones (aunque openpi se publica bajo licencia Apache 2.0 también). Se recomienda verificar la licencia del modelo base.
- Caveat para producción: no hay resultados de evaluación en robot real, por lo que no se garantiza un rendimiento fiable en entornos no controlados. Se requiere validación exhaustiva antes de cualquier uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agemin-ICS/pi0-lss-recovery-full-lora-holdout
- Dataset de entrenamiento: https://huggingface.co/datasets/agemin-ICS/lss-arm-pink-cube-box-recovery-delta
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio openpi (modelo base π₀): https://github.com/Physical-Intelligence/openpi
- Blog de Physical Intelligence sobre π₀.7: https://www.pi.website/blog/pi07
