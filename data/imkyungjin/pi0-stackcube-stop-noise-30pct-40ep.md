# ImKyungjin/pi0-stackcube-stop-noise-30pct-40ep

## Resumen

El modelo `ImKyungjin/pi0-stackcube-stop-noise-30pct-40ep` es un ajuste fino del modelo π₀ (Pi0), un Vision-Language-Action (VLA) desarrollado por Physical Intelligence para control general de robots. Este checkpoint concreto ha sido entrenado con la librería LeRobot de Hugging Face sobre el dataset `taewonkoo/stack_cube_stop_noise_30pct_40ep`, que consiste en una tarea de apilado de cubos con un 30 % de ruido de parada (stop noise) y 40 épocas de entrenamiento. El objetivo es que el robot aprenda a detener sus acciones ante perturbaciones o señales de parada durante la manipulación.

Con 3.501.372.176 parámetros (aproximadamente 3,5 mil millones), el modelo se enmarca en la categoría de políticas robóticas generalistas. Su relevancia radica en que demuestra cómo un modelo fundacional de robótica puede adaptarse a tareas específicas con ruido controlado mediante fine-tuning, un enfoque práctico para entornos industriales o de investigación donde la robustez ante interrupciones es crítica. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flujo (flow matching), adaptación de π₀ de Physical Intelligence |
| Parametros totales | 3.501.372.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors sin cuantización) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en lenguaje natural, pero no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 7,0 GB) |

## Arquitectura y entrenamiento

π₀ es un modelo de visión-lenguaje-acción que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones basado en flujo (flow matching). A diferencia de los modelos autoregresivos puros, π₀ genera acciones continuas mediante un proceso de flujo que itera desde ruido hasta la acción deseada, lo que permite un control fino y de alta frecuencia. La implementación en LeRobot se basa en el repositorio openpi de Physical Intelligence.

El entrenamiento de este checkpoint parte de los pesos de π₀ preentrenado y se ajusta con el dataset `taewonkoo/stack_cube_stop_noise_30pct_40ep`. El nombre del dataset indica que se introdujo un 30 % de ruido de parada (probablemente episodios donde el robot debe detenerse o reiniciar la acción) y se entrenó durante 40 épocas. No se dispone de detalles sobre el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la información disponible solo confirma el uso de LeRobot para el entrenamiento y la publicación.

## Capacidades

- Control robótico generalista: el modelo recibe observaciones visuales (imágenes de cámaras) e instrucciones en lenguaje natural, y produce comandos de acción para los actuadores del robot.
- Aprendizaje por imitación: entrenado mediante demostraciones, es capaz de replicar la tarea de apilado de cubos con precisión.
- Robustez ante ruido de parada: el entrenamiento específico con un 30 % de ruido de parada sugiere que el modelo puede manejar interrupciones o señales de detención durante la ejecución, deteniendo o reanudando la tarea adecuadamente.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo pipelines de entrenamiento, evaluación y despliegue.
- Multimodal: procesa simultáneamente entrada visual y textual, lo que permite especificar tareas mediante lenguaje natural.
- No se ha confirmado soporte para tool calling, agentes autónomos o razonamiento multi-paso fuera del ámbito de control robótico.

## Casos de uso

- Apilado de cubos en entornos industriales: el modelo puede controlar un brazo robótico para apilar cubos o piezas similares, con capacidad de detenerse ante señales de parada (por ejemplo, presencia de un operario o un obstáculo). Su entrenamiento específico lo hace adecuado para líneas de montaje donde la seguridad requiere pausas controladas.
- Investigación en robustez de políticas robóticas: sirve como banco de pruebas para estudiar cómo los modelos VLA responden a ruido de parada, permitiendo comparar estrategias de entrenamiento (por ejemplo, con otros porcentajes de ruido como 40 %).
- Automatización de tareas de manipulación con supervisión humana: en escenarios donde un humano puede intervenir y detener el robot, el modelo puede reanudar la tarea tras la interrupción, mejorando la colaboración hombre-máquina.
- Desarrollo de sistemas de control basados en imitación: como punto de partida para fine-tuning adicional en tareas similares de manipulación, gracias a su licencia Apache 2.0 y su formato compatible con LeRobot.
- Evaluación de VLA en hardware real: el modelo puede desplegarse en robots como SO-100 u otros brazos compatibles con LeRobot para validar su comportamiento en entornos físicos.
- Educación y prototipado: al ser un modelo de tamaño moderado (3,5 B) y con licencia permisiva, es útil para cursos de robótica o laboratorios que necesiten una política preentrenada para experimentos de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de robótica (tasa de éxito en apilado, tiempo de ejecución, etc.) para este checkpoint. El autor no proporciona métricas de evaluación en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado que el modelo tiene 3,5 mil millones de parámetros y se publica en safetensors (7 GB), una estimación razonable para inferencia en FP32 sería de al menos 14 GB de VRAM, y con cuantización a 8 bits podría reducirse a unos 7-8 GB. Sin embargo, estos valores son orientativos y no han sido confirmados por el autor.
- GPU recomendadas: no se especifican. Por el tamaño, GPUs con 16 GB o más (RTX 4090, A100, H100) serían adecuadas para inferencia sin cuantización. Para entrenamiento o fine-tuning se requeriría mayor capacidad.
- Compatibilidad con GPU de consumo: probablemente sí con cuantización (por ejemplo, GGUF o AWQ), pero no hay archivos cuantizados publicados en el repositorio.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación e inferencia (`lerobot-record`). También es posible usar el repositorio openpi de Physical Intelligence para ejecutar el modelo con JAX, aunque no se proporcionan instrucciones específicas para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImKyungjin/pi0-stackcube-stop-noise-30pct-40ep | 3,5 B | no disponible | Apilado de cubos con 30 % ruido de parada | Apache 2.0 | Hugging Face |
| ImKyungjin/pi0-stackcube-mixed-noise-30pct-40ep | no disponible | no disponible | Apilado de cubos con ruido mixto al 30 % | Apache 2.0 | Hugging Face |
| ImKyungjin/pi0-stackcube-recover-noise-40pct-40ep | no disponible | no disponible | Apilado de cubos con ruido de recuperación al 40 % | Apache 2.0 | Hugging Face |
| π₀ original (Physical Intelligence) | 3,5 B (aprox.) | no disponible | Control robótico generalista | Apache 2.0 | openpi (GitHub) |

No se dispone de datos de rendimiento comparativo entre estos modelos. Las variantes de ImKyungjin exploran diferentes estrategias de ruido (parada, mixto, recuperación) sobre la misma tarea base, lo que permite estudiar el efecto del tipo de perturbación en el aprendizaje.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con demostraciones de un dataset concreto, puede heredar sesgos del entorno de recogida de datos (por ejemplo, iluminación, posición de cámara, tipo de robot).
- Riesgo de alucinación: en el contexto robótico, el riesgo se traduce en acciones incorrectas o movimientos no deseados si el modelo interpreta mal la instrucción o la observación visual. No hay métricas de fiabilidad publicadas.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero los VLA suelen operar con ventanas de observación cortas (secuencias de imágenes recientes). No se recomienda su uso para tareas que requieran memoria a largo plazo.
- Limitaciones de idioma: no se indica qué idiomas soporta el modelo para las instrucciones. Es probable que funcione mejor en inglés, dado el origen del modelo base, pero no está confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución. No hay restricciones de uso militar o de vigilancia explícitas.
- Caveat para producción: el modelo es un checkpoint de investigación sin validación en entornos reales. Antes de desplegarlo en producción, es imprescindible realizar pruebas de seguridad y robustez, especialmente porque el ruido de parada al 30 % puede no cubrir todos los escenarios de interrupción posibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-stackcube-stop-noise-30pct-40ep
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Repositorio openpi (implementación original): https://github.com/Physical-Intelligence/openpi
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Variante con ruido mixto: https://huggingface.co/ImKyungjin/pi0-stackcube-mixed-noise-30pct-40ep
- Variante con ruido de recuperación: https://huggingface.co/ImKyungjin/pi0-stackcube-recover-noise-40pct-40ep
