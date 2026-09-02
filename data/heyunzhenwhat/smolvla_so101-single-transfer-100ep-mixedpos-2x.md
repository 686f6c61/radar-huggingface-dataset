# heyunzhenwhat/smolvla_so101-single-transfer-100ep-mixedpos-2x

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para tareas de robótica con un coste computacional reducido que permite su ejecución en hardware de consumo. Este checkpoint concreto, `heyunzhenwhat/smolvla_so101-single-transfer-100ep-mixedpos-2x`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset de demostraciones para un robot SO-101, con la tarea específica de mover una cinta adhesiva hacia una zona marcada.

Con aproximadamente 450 millones de parámetros, el modelo sigue la arquitectura SmolVLA, que combina múltiples vistas de cámara, el estado sensoriomotor del robot y una instrucción en lenguaje natural para generar acciones de control. Su relevancia radica en que permite a desarrolladores e investigadores entrenar y desplegar políticas robóticas con recursos limitados, sin necesidad de clústeres de GPUs de alta gama. El modelo se distribuye bajo licencia Apache 2.0 y se integra con el ecosistema LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) basada en transformer multimodal |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato safetensors sin cuantización publicada) |
| Idiomas soportados | No disponible (instrucciones en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que integra un codificador visual para procesar múltiples cámaras, un codificador de lenguaje para interpretar instrucciones en lenguaje natural y un experto de acciones que genera comandos de control. Este checkpoint es un ajuste fino del modelo base `lerobot/smolvla_base`, entrenado mediante aprendizaje por imitación supervisado sobre el dataset `heyunzhenwhat/so101-single-transfer-100ep-mixedpos`, que contiene 100 episodios y 29.363 fotogramas a 30 FPS. La configuración de entrenamiento incluye 20.000 pasos, un tamaño de lote de 64, optimizador AdamW con una tasa de aprendizaje de 0,0001 y semilla 1000, utilizando la librería LeRobot en su versión 0.6.1.

Según el paper original (arXiv:2506.01844), SmolVLA está diseñado para entrenarse en una sola GPU y desplegarse en GPUs de consumo o incluso CPUs, incorporando una pila de inferencia asíncrona que separa la percepción y la predicción de acciones de la ejecución, lo que permite mayores tasas de control con generación de acciones por lotes.

## Capacidades

- Control robótico de manipulación: recibe tres vistas de cámara (256×256 píxeles cada una) y un vector de estado de 6 dimensiones, y genera un vector de acción de 6 dimensiones.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante texto (por ejemplo, "Move the tape into the taped area on the right").
- Ejecución en tiempo real: pensado para hardware de consumo, con inferencia de baja latencia.
- Aprendizaje por imitación: es un modelo entrenado por comportamiento clonado, útil para reproducir demostraciones humanas.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face para robótica.
- No incluye generación de texto general, tool calling ni capacidades de agente fuera del ámbito robótico.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede ejecutar tareas de pick-and-place y transferencia de objetos, como mover una cinta a una zona objetivo, en robots SO-101.
- Prototipado rápido de políticas robóticas: al ser un ajuste fino de un modelo base compacto, permite validar nuevas tareas con pocos episodios de demostración.
- Investigación en VLA compactos: sirve como punto de partida para estudiar el rendimiento de modelos de visión-lenguaje-acción en hardware limitado.
- Automatización de procesos repetitivos: puede integrarse en líneas de montaje o entornos controlados donde la tarea esté bien definida y no requiera generalización amplia.
- Educación y formación en robótica: su tamaño reducido y su integración con LeRobot facilitan su uso en cursos y proyectos académicos.
- Despliegue en robots de bajo coste: al ejecutarse en GPUs de consumo, es adecuado para plataformas robóticas económicas sin infraestructura de cómputo avanzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM para este checkpoint concreto.
- Dado que el modelo tiene ~450M de parámetros, en precisión FP16 ocuparía aproximadamente 0,9 GB de memoria, lo que lo hace viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Según el paper de SmolVLA, el modelo puede ejecutarse en GPUs de consumo e incluso en CPUs, aunque la latencia sería mayor.
- Para el despliegue se recomienda usar LeRobot, que proporciona las herramientas `lerobot-rollout` y `lerobot-train`.
- No se dispone de datos de latencia o throughput específicos para este checkpoint.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo base `lerobot/smolvla_base` y otros ajustes finos similares (por ejemplo, `Askel1419/smolvla_so101_100EP`) existen, pero no se han publicado métricas comparativas en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica (mover una cinta a una zona marcada) en un robot SO-101 con una configuración de cámaras concreta. No generaliza a otras tareas o entornos sin un nuevo ajuste fino.
- No se han publicado resultados de evaluación, por lo que se desconoce su tasa de éxito y su robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Depende de la calibración de las cámaras y del robot; cambios en la disposición física pueden degradar el rendimiento.
- Al ser un modelo de aprendizaje por imitación, puede replicar sesgos presentes en las demostraciones humanas.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que los datos de entrenamiento no tengan restricciones adicionales.
- No es adecuado para tareas de razonamiento general o generación de texto; su ámbito está estrictamente limitado al control robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heyunzhenwhat/smolvla_so101-single-transfer-100ep-mixedpos-2x
- Paper SmolVLA: https://arxiv.org/abs/2506.01844 (versión HTML: https://arxiv.org/html/2506.01844v1)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-100ep-mixedpos
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=heyunzhenwhat/so101-single-transfer-100ep-mixedpos
