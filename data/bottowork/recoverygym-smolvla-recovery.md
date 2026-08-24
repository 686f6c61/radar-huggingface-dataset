# bottowork/recoverygym-smolvla-recovery

## Resumen

El modelo `bottowork/recoverygym-smolvla-recovery` es un fine-tune del modelo base SmolVLA (Vision-Language-Action) desarrollado por Hugging Face, adaptado para una tarea específica de robótica: recuperación de fallos en una tarea de pick-and-place en un entorno simulado (`recoverygym_sim`). SmolVLA es un modelo compacto y eficiente que combina percepción visual multi-cámara, comprensión de lenguaje natural y control motor, diseñado para ejecutarse en hardware de consumo. Este fine-tune ha sido entrenado con un dataset reducido de 13 episodios (88 frames) y 50 pasos de entrenamiento, lo que lo convierte en un ejemplo de adaptación rápida de un modelo base a una tarea concreta.

La relevancia de este modelo radica en su demostración de cómo un VLA preentrenado puede ajustarse con muy pocos datos para una tarea robótica específica, utilizando la librería LeRobot. Aunque el dataset es pequeño y no se han publicado resultados de evaluación, el modelo ilustra el flujo de trabajo de fine-tuning de SmolVLA para aplicaciones de manipulación robótica. Su licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su adopción en proyectos de investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en SmolVLA, fine-tune de `lerobot/smolvla_base` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a generación de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que integra un codificador visual, un modelo de lenguaje y un decodificador de acciones, todo en una arquitectura compacta y eficiente. El modelo base fue preentrenado en grandes conjuntos de datos multimodales y posteriormente adaptado para robótica mediante aprendizaje por imitación. Este fine-tune concreto se realizó sobre el modelo base `lerobot/smolvla_base` utilizando el dataset `bottowork/recoverygym-recovery`, que contiene 13 episodios de una tarea de pick-and-place con recuperación de fallos, grabados a 10 FPS con tres cámaras.

El entrenamiento se llevó a cabo con la librería LeRobot (versión 0.6.1) durante 50 pasos, con un batch size de 4, optimizador AdamW y una tasa de aprendizaje de 0.0001. No se menciona el uso de técnicas como RLHF o DPO; se trata de un fine-tuning supervisado estándar sobre demostraciones. La entrada del modelo consiste en el estado del robot (6 dimensiones) y tres imágenes RGB de 256x256 píxeles, mientras que la salida es un vector de acción de 6 dimensiones. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensiones ocultas, etc.) en la información proporcionada.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación del efector final) a partir de observaciones visuales y del estado del robot.
- Percepción multi-cámara: procesa simultáneamente tres imágenes RGB de 256x256 píxeles, lo que permite una comprensión espacial robusta del entorno.
- Recuperación de fallos: entrenado específicamente para detectar y corregir errores durante una tarea de pick-and-place, como se indica en la tarea del dataset ("Recover from failure and complete pick-and-place").
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- Eficiencia computacional: al ser un modelo compacto (SmolVLA), es adecuado para hardware de consumo, aunque no se especifican requisitos exactos.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos simulados: el modelo puede controlar un brazo robótico para recoger y colocar objetos, con capacidad de recuperarse de fallos durante la ejecución. Es adecuado para entornos de simulación como `recoverygym_sim` donde se pueden probar políticas antes de transferirlas a robots reales.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA base con un dataset pequeño, útil para estudiar la transferencia de conocimiento y la adaptación a tareas específicas.
- Desarrollo de sistemas de manipulación robusta: la capacidad de recuperación de fallos puede integrarse en sistemas de producción donde los errores de agarre o colocación son comunes, mejorando la tasa de éxito global.
- Prototipado rápido de políticas robóticas: gracias a su entrenamiento rápido (50 pasos) y su bajo coste computacional, permite iterar rápidamente sobre nuevas tareas o entornos.
- Educación y formación en robótica: al ser un modelo abierto y ligero, puede utilizarse en cursos o talleres para enseñar conceptos de VLA, aprendizaje por imitación y control robótico.
- Benchmarking de algoritmos de recuperación de fallos: el dataset y el modelo pueden servir como referencia para comparar estrategias de detección y corrección de errores en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. Por tanto, no se dispone de métricas como tasa de éxito, precisión o comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo compacto (SmolVLA), se espera que quepa en GPUs de consumo como una RTX 3060 o superior, pero no se proporcionan cifras exactas.
- GPU recomendadas: no disponible. La documentación de SmolVLA menciona que puede desplegarse en hardware de consumo, pero no se especifican modelos concretos.
- Compatibilidad con consumer GPU: probablemente sí, dado el diseño eficiente de SmolVLA, pero sin confirmación oficial.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en local mediante `lerobot-rollout`. También es posible exportar a otros formatos si se requiere, aunque no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos VLA como OpenVLA, RT-2 o π0. SmolVLA se posiciona como una alternativa compacta y eficiente, pero no se tienen datos de rendimiento relativos. La comparativa queda pendiente de la publicación de resultados de evaluación.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 13 episodios y 88 frames, lo que puede provocar sobreajuste y baja generalización a entornos o variaciones no vistas.
- Sin resultados de evaluación: no se ha verificado el rendimiento real del modelo en el robot, por lo que su eficacia es incierta.
- Tarea específica: el modelo está entrenado únicamente para la tarea "Recover from failure and complete pick-and-place" en el entorno `recoverygym_sim`; no es transferible directamente a otras tareas sin reentrenamiento.
- Dependencia del entorno simulado: el robot tipo `recoverygym_sim` puede no corresponderse con un robot físico real, limitando su aplicabilidad directa.
- Idiomas: al ser un modelo de control robótico, no soporta generación de lenguaje natural ni interacción conversacional.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asegurarse de cumplir con los términos de la licencia y de las dependencias (por ejemplo, el modelo base SmolVLA).

## Enlaces

- Repositorio del modelo: https://huggingface.co/bottowork/recoverygym-smolvla-recovery
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Blog de SmolVLA: https://huggingface.co/blog/smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/bottowork/recoverygym-recovery
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
