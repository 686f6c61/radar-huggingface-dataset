# jima26192/openarm_single_arm_v3_3_and_v3_2_pi05

## Resumen

π₀.₅ (Pi05) es un modelo Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos, es decir, a ejecutar tareas de manipulación robótica en situaciones y entornos no vistos durante el entrenamiento. Esta ficha concreta corresponde al repositorio `jima26192/openarm_single_arm_v3_3_and_v3_2_pi05`, un ajuste fino de la política π₀.₅ realizado por el usuario jima26192 sobre el brazo robótico OpenArm de un solo brazo, usando la implementación de LeRobot, que a su vez adapta el repositorio OpenPI de Physical Intelligence.

El modelo se publica como política entrenada (policy) para robótica, no como un modelo de lenguaje conversacional. Los pesos ocupan 4.143.404.816 parámetros (≈4,14 mil millones) según los metadatos de safetensors, con un repositorio de 9,4 GB. La arquitectura combina un componente visión-lenguaje con una cabeza de acción basada en flow matching, y se entrenó sobre el dataset `jima26192/openarm-single-arm-dataset-v3.3_and_v3.2`, que mezcla datos de dos versiones del montaje (v3.2 y v3.3).

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de ajuste fino de un VLA de referencia sobre hardware abierto (OpenArm) usando herramientas estándar de Hugging Face; por otro, sirve como ejemplo reproducible de la integración entre OpenPI, LeRobot y el Hub. El repositorio no incluye documentación adicional sobre hiperparámetros concretos, composición exacta del dataset ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, con cabeza de acción de flow matching (implementación LeRobot, adaptada de OpenPI) |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones, según los pesos en safetensors) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados sin cuantización documentada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Autor | jima26192 |
| Dataset de entrenamiento | jima26192/openarm-single-arm-dataset-v3.3_and_v3.2 |
| Tamaño del repositorio | 9,4 GB |
| Fecha de creación | 2026-10-12 |
| Fecha de actualización | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅ de Physical Intelligence, descrita como una evolución de π₀ orientada a mejorar la generalización en entornos abiertos y entrenada con una técnica de aislamiento de conocimiento (knowledge insulation). En la documentación de los repositorios de referencia se distinguen tres variantes de la familia: π₀, un VLA basado en flow matching; π₀-FAST, un VLA autorregresivo construido sobre el tokenizador de acciones FAST; y π₀.₅, la versión mejorada. Los repositorios citados indican que, en la implementación pública manejada por terceros, solo se soporta la cabeza de flow matching tanto para el entrenamiento de π₀.₅ como para su uso.

En cuanto al entrenamiento específico de este repositorio, la model card únicamente declara que la política se entrenó y subió al Hub con LeRobot y enlaza al dataset de OpenArm de un solo brazo que combina las versiones 3.3 y 3.2. No se documentan en la información disponible el número de tokens, la composición del dataset, el número de episodios, la resolución de las cámaras, la frecuencia de control, ni si se aplicaron fases de ajuste con preferencias (RLHF/DPO). Tampoco se especifican detalles del encoder visual ni el mecanismo de fusión entre las observaciones visuales y el estado proprioceptivo del brazo.

## Capacidades

- Generación de acciones motoras para un brazo robótico OpenArm de un solo brazo a partir de observaciones visuales y del estado del robot.
- Control mediante políticas VLA: el modelo traduce instrucciones y observaciones en comandos de actuación, con la cabeza de flow matching propia de π₀.₅.
- Generalización en entornos abiertos, según la descripción de la familia π₀.₅ de Physical Intelligence; el alcance real de esa generalización en este ajuste concreto no está documentado.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación e inferencia con `lerobot-record` y despliegue mediante `--policy.path`.
- Capacidad multilingüe: no disponible (la model card no documenta idiomas soportados).
- Soporte de tool calling y function calling: no aplicable / no documentado para este tipo de política robótica.
- Soporte de agentes de múltiples pasos: no documentado explícitamente; el comportamiento esperado es la ejecución encadenada de acciones de manipulación, pero no se detalla en la información disponible.
- Modo «thinking» o razonamiento explícito: no documentado.

## Casos de uso

- Manipulación con un brazo OpenArm en laboratorio: el modelo se usa como política de control directo, recibiendo las imágenes de las cámaras y el estado del brazo y emitiendo comandos de actuación, lo que permite validar el ajuste fino sobre el montaje v3.2 y v3.3 sin desarrollar un controlador específico.
- Replicación de experimentos de VLA en hardware abierto: dado que el repositorio se apoya en LeRobot y en la arquitectura π₀.₅, sirve como punto de partida para reproducir el flujo de entrenamiento y evaluación de un VLA de referencia en un brazo asequible.
- Automatización de tareas de pick-and-place en línea de montaje: la política puede entrenarse con demostraciones del dataset OpenArm para recoger y colocar piezas; la utilidad dependerá de la variedad de objetos presentes en el dataset, no documentada.
- Recogida de datos y evaluación comparativa con OpenArm Cell: el sitio de OpenArm describe una celda de evaluación reproducible con condiciones estandarizadas de fondo, iluminación, cámaras y posición del brazo, lo que permite comparar este ajuste con otros modelos sobre el mismo montaje.
- Investigación en generalización de políticas: al derivar de π₀.₅, el modelo permite estudiar hasta qué punto un ajuste fino sobre un dataset reducido conserva la capacidad de generalización del modelo base en tareas y entornos nuevos.
- Base para ajustes posteriores específicos de tarea: el checkpoint puede reutilizarse como inicialización para nuevos entrenamientos con `lerobot-train` sobre otros datasets de OpenArm, reduciendo el coste frente a entrenar desde cero.
- Docencia y prototipado en robótica: al ser un repositorio pequeño, con licencia Apache 2.0 y librería LeRobot, resulta adecuado para prácticas de imitation learning y despliegue de políticas en un único brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de éxito por tarea, tasas de acierto, comparaciones con π₀.₅ base ni evaluaciones sobre la celda OpenArm Cell.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado del recuento de parámetros, no un dato publicado por el autor):
  - FP32: aproximadamente 16,6 GB solo para pesos.
  - BF16/FP16: aproximadamente 8,3 GB solo para pesos.
  - INT8: aproximadamente 4,1 GB solo para pesos.
  - INT4: aproximadamente 2,1 GB solo para pesos.
- A esas cifras hay que sumar el coste de activaciones, buffers de inferencia y el procesamiento de las cámaras de entrada; el fabricante no publica requisitos oficiales.
- GPU recomendadas: no disponible. Por el rango de VRAM, una GPU de 16-24 GB (por ejemplo, RTX 4090, L40S, A100 40 GB) sería suficiente para ejecutar los pesos sin cuantizar en precisión reducida, aunque se trata de una estimación y no de una recomendación del autor.
- ¿Cabe en GPU de consumo? Con los pesos en BF16 o FP16, sí en tarjetas de 12-16 GB o superiores; en cuantizaciones de 8 y 4 bits, el margen es mayor. No hay confirmación oficial.
- Opciones de despliegue: LeRobot es el marco indicado en la model card, con `lerobot-record` para ejecutar la política y `--policy.path` apuntando al checkpoint local o del Hub. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que además no son pilas orientadas a políticas VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jima26192/openarm_single_arm_v3_3_and_v3_2_pi05 | 4,14 mil millones | no disponible | Apache 2.0 | Hugging Face, librería LeRobot | Ajuste fino de π₀.₅ sobre dataset OpenArm v3.3 + v3.2 |
| bsu33/pi05_openarm | no disponible | no disponible | no disponible | Hugging Face | Otro ajuste de π₀.₅ sobre OpenArm; sin datos de rendimiento en la información disponible |
| π₀.₅ base (Physical Intelligence) | no disponible en la información proporcionada | no disponible | no disponible | Repositorio OpenPI (referenciado) | Modelo base del que deriva este ajuste, con mejor generalización en entornos abiertos y entrenamiento con knowledge insulation |
| π₀ / π₀-FAST | no disponible | no disponible | no disponible | Repositorio OpenPI (referenciado) | Variantes de la misma familia: π₀ con flow matching y π₀-FAST autorregresivo con tokenizador FAST |

No se dispone de datos suficientes para comparar rendimiento numérico entre estas alternativas.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero el modelo se entrenó sobre un dataset propio no descrito, por lo que puede heredar los sesgos de las demostraciones recogidas en ese montaje concreto.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de control, los errores se manifiestan como movimientos erróneos del brazo, con riesgo físico asociado.
- El alcance de la generalización a entornos abiertos descrito para π₀.₅ corresponde al modelo base; no hay evidencia publicada de que se conserve tras este ajuste fino.
- Longitud de contexto e idiomas soportados no están documentados, lo que impide planificar el uso de instrucciones largas o en idiomas distintos del usado en el dataset.
- El modelo está ajustado para un brazo OpenArm de un solo brazo concreto; su uso con otra cinemática, número de articulaciones o configuración de cámaras no está validado.
- Aunque la licencia es Apache 2.0, lo que permite uso comercial, se desconoce la licencia y las condiciones de los datos de entrenamiento y del modelo base π₀.₅ subyacente; conviene verificar esos términos antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, y no incluye métricas de evaluación ni informes de fallos: no hay evidencia externa de robustez.
- No se documentan requisitos de hardware, latencias ni frecuencia de control, datos críticos para integrar la política en un lazo de control real.
- Advertencia de seguridad: cualquier despliegue sobre hardware físico debe realizarse en un entorno con limitaciones de par, paradas de emergencia y supervisión, dado que no existe evaluación pública de comportamientos anómalos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jima26192/openarm_single_arm_v3_3_and_v3_2_pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/jima26192/openarm-single-arm-dataset-v3.3_and_v3.2
- Perfil del autor en Hugging Face: https://huggingface.co/jima26192/datasets
- Repositorio pi05-openarm (reasimei): https://github.com/reasimei/pi05-openarm
- Repositorio openpi_pi05 (J-Oyasumi): https://github.com/J-Oyasumi/openpi_pi05
- Entrada de blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- OpenArm (proyecto de hardware y celda de evaluación): https://openarm.dev/
- Ajuste alternativo de π₀.₅ sobre OpenArm: https://huggingface.co/bsu33/pi05_openarm
