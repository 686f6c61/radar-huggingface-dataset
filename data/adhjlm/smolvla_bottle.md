# adhjlm/smolvla_bottle

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face dentro del ecosistema LeRobot, con aproximadamente 450 millones de parámetros y diseñado para desplegarse en hardware de consumo. Este repositorio concreto, `adhjlm/smolvla_bottle`, es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio (`adhjlm/so101-bottle`) para una tarea específica de manipulación robótica: recoger una botella y colocarla a la derecha, fuera del papel blanco.

El modelo está entrenado con LeRobot (versión 0.6.1) y se publica bajo licencia Apache 2.0. Su relevancia radica en que permite experimentar con políticas de control robótico por imitación en hardware accesible, sin necesidad de infraestructura de alto coste. La arquitectura combina un modelo de lenguaje y visión compacto con un experto de acciones entrenado mediante flow matching, que recibe imágenes de dos cámaras (superior y de muñeca) junto con el estado del robot y una instrucción en lenguaje natural, y produce una secuencia de acciones de control.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con experto de acciones por flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, repositorio de 1,2 GB) |
| Idiomas soportados | No disponible (la tarea usa instruccion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto compuesto por un modelo de lenguaje y visión (VLM) preentrenado y un experto de acciones entrenado con flow matching. Recibe como entrada una secuencia de imágenes RGB de varias cámaras (en este caso, cámara superior `top` y cámara de muñeca `wrist`, ambas a 480x640), el estado sensorimotor del robot (vector de 6 dimensiones) y una instrucción en lenguaje natural; como salida genera un bloque de acciones continuas (action chunk) para controlar el robot.

En este ajuste fino concreto, el modelo se entrenó sobre el dataset `adhjlm/so101-bottle`, compuesto por 49 episodios y 29.400 fotogramas a 30 FPS, para la tarea «recoger la botella y colocarla a la derecha fuera del papel blanco». El entrenamiento se realizó durante 10.000 pasos con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, sobre el robot tipo `so_follower` de la serie SO-101.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de observaciones de imagen (dos cámaras) y del estado del robot.
- Comprensión de instrucciones en lenguaje natural para definir la tarea a ejecutar.
- Generación de chunks de acciones (action chunking) con flow matching.
- Ejecución en tiempo real sobre el robot SO-101 (so_follower) mediante LeRobot.
- Despliegue en hardware de consumo, según el diseño original de SmolVLA.
- Ajuste fino sobre el modelo base `lerobot/smolvla_base` para nuevas tareas.

## Casos de uso

- **Manipulación de objetos en entornos controlados**: el modelo puede recoger y desplazar objetos (botellas, piezas pequeñas) dentro de un espacio de trabajo definido, útil para automatizar tareas repetitivas en líneas de montaje o laboratorios.
- **Benchmark de aprendizaje por imitación**: sirve como referencia para evaluar políticas VLA en tareas de manipulación con hardware de bajo coste, dado su tamaño reducido y su integración con LeRobot.
- **Prototipado rápido de tareas robóticas**: permite grabar demostraciones con el robot y ajustar el modelo base en pocas horas, acelerando la validación de nuevas tareas antes de escalar a modelos más grandes.
- **Investigación en VLA con modelos compactos**: es un punto de partida para estudiar cómo afecta el tamaño del modelo al rendimiento en control robótico, gracias a su arquitectura eficiente.
- **Formación y docencia en robótica**: su despliegue en hardware de consumo y la integración con LeRobot lo hacen adecuado para cursos y talleres donde se necesita un pipeline completo de captura, entrenamiento e inferencia.
- **Fine-tuning para tareas personalizadas**: al partir de `lerobot/smolvla_base`, se puede reajustar el modelo con datasets propios de pocos episodios (como este, con 49) para adaptarlo a nuevas instrucciones y entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente: «No evaluation results have been provided for this policy yet». No hay datos de tasas de éxito, latencia ni comparativas con otros modelos en este repositorio.

## Requisitos de hardware

- **GPU**: diseñado para hardware de consumo (GPU de gama media), según la descripción del paper SmolVLA; no se especifica VRAM exacta en la información disponible.
- **Peso**: el repositorio ocupa 1,2 GB en formato safetensors, lo que facilita su carga en memoria.
- **Despliegue**: se ejecuta mediante LeRobot con el comando `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento; requiere el robot tipo `so_follower` y dos cámaras compatibles (top y wrist).
- **Entrenamiento**: requiere GPU con CUDA (`--policy.device=cuda`) según la documentación de LeRobot.
- **Latencia y throughput**: no se dispone de datos estimados en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo base `lerobot/smolvla_base` es la versión sin ajuste fino de la que parte este repositorio; otros ajustes finos de SmolVLA en el Hub (por ejemplo, `Tohes/smolvla_bottles`) abordan tareas similares de manipulación de botellas, pero no se han aportado métricas de rendimiento comparadas en la documentación disponible.

## Limitaciones y advertencias

- **Sin evaluación en robot real**: la model card no reporta resultados de evaluación sobre el robot físico; es necesario validar el modelo antes de usarlo en producción.
- **Dataset de entrenamiento pequeño**: 49 episodios (29.400 fotogramas) pueden limitar la generalización a nuevas posiciones de la botella, condiciones de iluminación o distracciones en el entorno.
- **Tarea muy específica**: el modelo está ajustado para una única instrucción (recoger la botella y colocarla a la derecha fuera del papel blanco); no es un agente generalista.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede interpretar mal instrucciones complejas o ambiguas, lo que en robótica puede provocar movimientos no deseados.
- **Idioma**: la tarea está definida en inglés; no se documentan capacidades multilingües.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario es responsable de la seguridad y el despliegue del robot en entornos reales.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/adhjlm/smolvla_bottle)
- [Dataset de entrenamiento](https://huggingface.co/datasets/adhjlm/so101-bottle)
- [Modelo base](https://huggingface.co/lerobot/smolvla_base)
- [Paper SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Blog de SmolVLA](https://huggingface.co/blog/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
