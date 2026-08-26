# mi-kicic/xarm7_mj_ds21_filtered_smolvla

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por el usuario mi-kicic para controlar un brazo robótico simulado Mujoco XArm7. El ajuste se ha realizado sobre el modelo base `lerobot/smolvla_base` utilizando el dataset propio `mi-kicic/xarm7_mj_ds21_filtered`, que contiene 406 episodios de una tarea concreta: recoger un motor azul e insertarlo en una caja de cambios naranja. El modelo genera acciones de 8 dimensiones a partir de observaciones de estado (15 valores) y tres imágenes de cámaras (frontal, muñeca y esquina) de 512x512 píxeles.

La relevancia de este modelo radica en que demuestra el fine-tuning de un VLA de tamaño reducido (450 millones de parámetros) sobre una tarea robótica específica, con la ventaja de poder ejecutarse en hardware de consumo, tal y como se describe en el paper de SmolVLA (arXiv:2506.01844). Está publicado bajo licencia Apache-2.0 y utiliza el ecosistema LeRobot para entrenamiento e inferencia, lo que facilita su reproducción y adaptación a otros entornos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto diseñado para reducir el coste computacional frente a VLA más grandes, manteniendo un rendimiento competitivo en tareas de manipulación robótica. La arquitectura combina un codificador visual, un modelo de lenguaje y una cabeza de acción, procesando imágenes de múltiples cámaras junto con el estado del robot para predecir acciones de control. El modelo base `lerobot/smolvla_base` se ha ajustado mediante aprendizaje por imitación (imitation learning) sobre el dataset `mi-kicic/xarm7_mj_ds21_filtered`, que contiene 95.216 frames a 10 FPS. El entrenamiento se realizó con 30.000 pasos, batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 1000, utilizando la librería LeRobot versión 0.6.1. No se especifica el uso de RLHF, DPO u otras técnicas de refinamiento; el ajuste es puramente supervisado sobre las demostraciones.

## Capacidades

- Generación de acciones de control robótico: produce vectores de acción de 8 dimensiones para el brazo XArm7.
- Percepción multimodal: procesa simultáneamente el estado del robot (15 valores) y tres imágenes RGB de 512x512 (frontal, muñeca y esquina).
- Ejecución de tareas de manipulación: específicamente entrenado para la tarea de recoger un motor azul e insertarlo en una caja de cambios naranja.
- Aprendizaje por imitación: el modelo reproduce comportamientos aprendidos de demostraciones humanas o teleoperadas.
- Inferencia en tiempo real: al ser un modelo compacto, es adecuado para despliegue en hardware de consumo, aunque no se proporcionan métricas de latencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje general; su función es exclusivamente el control robótico.

## Casos de uso

- Automatización de ensamblaje industrial: el modelo puede controlar un brazo robótico para insertar componentes (como un motor en una caja de cambios) en una línea de producción, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el fine-tuning de VLA compactos en tareas específicas, permitiendo comparar estrategias de entrenamiento y arquitecturas.
- Prototipado rápido en robótica: gracias a su integración con LeRobot, los desarrolladores pueden cargar el modelo y ejecutarlo en un robot simulado o real con pocos comandos, acelerando el desarrollo de nuevas habilidades.
- Educación y formación: en entornos académicos, puede utilizarse para enseñar conceptos de robótica y aprendizaje automático, ya que su tamaño reducido permite ejecutarlo en estaciones de trabajo con GPU de gama media.
- Benchmarking de VLA: al estar publicado con licencia abierta, puede emplearse como referencia para evaluar el rendimiento de otros modelos en la misma tarea o en tareas similares.
- Adaptación a nuevas tareas: aunque está entrenado para una tarea concreta, el proceso de fine-tuning documentado permite reutilizar el modelo base para otras manipulaciones, sirviendo como plantilla para nuevos desarrollos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No hay datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM en la documentación del modelo.
- Dado que el modelo tiene 450 millones de parámetros, una estimación razonable (sin datos oficiales) sería: en FP32 (~1,8 GB), en FP16 (~0,9 GB) y en int8 (~0,45 GB), lo que permitiría su ejecución en GPUs de consumo como RTX 3060 o superiores, aunque no hay confirmación oficial.
- El modelo está diseñado para ser desplegado en hardware de consumo según el paper de SmolVLA, pero no se especifican GPUs concretas.
- Opciones de despliegue: el ecosistema LeRobot ofrece scripts de rollout (`lerobot-rollout`) que gestionan la inferencia; también es compatible con la librería LeRobot para entrenamiento y evaluación.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. SmolVLA se presenta como una alternativa compacta a VLA más grandes como OpenVLA o RT-2, pero no se incluyen datos numéricos de rendimiento relativo en esta ficha. Para una comparación rigurosa, se recomienda consultar el paper de SmolVLA (arXiv:2506.01844) y los benchmarks publicados en la literatura.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (recoger motor azul e insertarlo en caja de cambios naranja) y no es generalizable a otras manipulaciones sin un nuevo fine-tuning.
- No se han publicado resultados de evaluación en el mundo real; el rendimiento en entornos no simulados o con variaciones de iluminación, posición de objetos o distracciones es desconocido.
- Depende de la configuración exacta de cámaras (frontal, muñeca, esquina) y del robot Mujoco XArm7; cambios en la disposición de sensores pueden degradar el rendimiento.
- Al ser un modelo entrenado por imitación, puede presentar sesgos derivados de las demostraciones del dataset, como movimientos subóptimos o comportamientos específicos del operador.
- Riesgo de sobreajuste al dataset de entrenamiento (406 episodios), lo que puede limitar su robustez ante variaciones.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y del dataset asociado.
- No se proporcionan garantías de seguridad para operación en entornos con presencia humana; cualquier despliegue en producción debe incluir medidas de seguridad adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mi-kicic/xarm7_mj_ds21_filtered_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mi-kicic/xarm7_mj_ds21_filtered
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
