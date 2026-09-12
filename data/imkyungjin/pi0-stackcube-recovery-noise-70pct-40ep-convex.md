# ImKyungjin/pi0-stackcube-recovery-noise-70pct-40ep-convex

## Resumen

Este repositorio contiene una política robótica π₀ (Pi0) ajustada por el usuario ImKyungjin con LeRobot, la librería de aprendizaje por imitación de Hugging Face. π₀ es un modelo Visión-Lenguaje-Acción (VLA) para control robótico general desarrollado por Physical Intelligence; la implementación de LeRobot está adaptada de su repositorio abierto OpenPI. El modelo recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones de control de bajo nivel para un robot manipulador.

El checkpoint concreto es un ajuste fino sobre el conjunto de datos `taewonkoo/stack_cube_recovery_noise_70pct_40ep`, cuyo nombre indica una tarea de apilado de cubos con recuperación ante perturbaciones y un 70 % de ruido en los datos. El resultado es una política especializada, no un modelo generalista: sirve para tareas de manipulación tipo *stack cube* en el robot con el que se recogieron los datos.

El modelo tiene 3.501.372.176 parámetros (unos 3,5 mil millones) y el repositorio ocupa 7,0 GB, con pesos en formato safetensors y licencia Apache 2.0. Se publicó con 0 descargas y 0 *likes*, por lo que debe tratarse como un experimento reproducible más que como un artefacto con validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo Visión-Lenguaje-Acción (VLA) basado en π₀ (Pi0) de Physical Intelligence, implementado en LeRobot a partir de OpenPI |
| Parametros totales | 3.501.372.176 (dato real de los pesos safetensors) |
| Parametros activos | no disponible (no se confirma en la información proporcionada que la política sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados están en safetensors sin cuantizar; el repositorio ocupa 7,0 GB) |
| Idiomas soportados | no disponible (el modelo acepta instrucciones en lenguaje natural, pero no se especifica el conjunto de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La model card describe π₀ como un modelo Visión-Lenguaje-Acción para control robótico general, el primero de este tipo desarrollado por Physical Intelligence, y señala que la implementación de LeRobot está adaptada del repositorio OpenPI de los mismos autores. Se trata, por tanto, de una política que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras, en lugar de un modelo de lenguaje convencional. La información proporcionada no detalla la composición interna (codificador visual, *backbone* de lenguaje, cabezal de acciones) ni el número de tokens de entrenamiento.

En cuanto al ajuste fino, el identificador del repositorio indica que se entrenó sobre el *dataset* `taewonkoo/stack_cube_recovery_noise_70pct_40ep`, con un 70 % de ruido y 40 épocas. No se especifica en la información disponible el número de episodios, la frecuencia de control, el robot empleado ni si se aplicaron etapas de RLHF o DPO (poco habituales en políticas de imitación). La model card incluye el flujo estándar de LeRobot para reentrenar y evaluar, con `lerobot-train` y `lerobot-record`.

## Capacidades

- Control robótico de manipulación: genera acciones motoras a partir de observaciones visuales e instrucciones textuales.
- Comprensión de instrucciones en lenguaje natural, según la descripción de π₀ como modelo Visión-Lenguaje-Acción.
- Aprendizaje por imitación (*imitation learning*) sobre demostraciones teleoperadas, integrado en el ecosistema LeRobot.
- Ejecución de la tarea de apilado de cubos con recuperación ante perturbaciones, derivada del conjunto de datos de entrenamiento.
- Robustez frente a datos ruidosos: el ajuste se realizó sobre un conjunto etiquetado como 70 % ruido.
- Inferencia y evaluación con `lerobot-record`, con soporte para múltiples episodios de evaluación (`--episodes=10` en el ejemplo de la model card).
- No se documentan capacidades de *tool calling*, agentes multi-paso, visión general de imágenes, audio ni modo de razonamiento explícito.

## Casos de uso

- Apilado de cubos en laboratorio: la política está entrenada específicamente para la tarea *stack cube* con recuperación, por lo que es adecuada para reproducir experimentos de manipulación en un banco de pruebas con el mismo robot y *setup* de cámara que el *dataset* original.
- Investigación en robustez frente al ruido: al haberse ajustado con un 70 % de ruido, sirve como punto de partida para estudiar cómo afecta la calidad de los datos a la estabilidad de la política en tareas de apilado.
- Recuperación ante perturbaciones externas: el nombre del *dataset* sugiere episodios en los que el apilado se interrumpe y debe reanudarse, un escenario útil para evaluar políticas tolerantes a fallos frente a empujones o desplazamientos.
- Punto de partida para *fine-tuning* con `lerobot-train`: se puede reentrenar sobre un *dataset* propio siguiendo el comando de la model card, sustituyendo `--dataset.repo_id` y `--policy.type`.
- Evaluación comparativa de políticas en LeRobot: útil como referencia de política VLA de ~3,5 B parámetros frente a políticas más ligeras del mismo ecosistema.
- Docencia y reproducción de experimentos: el flujo `lerobot-train` / `lerobot-record` documentado permite montar prácticas de aprendizaje por imitación con un robot de tipo `so100_follower`.
- Validación de *pipelines* de despliegue: sirve para probar la integración de checkpoints VLA en entornos con GPU única antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito ni métricas de tarea (por ejemplo, porcentaje de apilados correctos), y los resultados de la búsqueda web no contienen información relacionada con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 7 GB solo para los pesos en precisión de 16 bits, coherente con el tamaño de repositorio de 7,0 GB; en FP32 serían aproximadamente 14 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 y, para una sola tarjeta de consumo, RTX 4090 (24 GB) o RTX 4080 (16 GB) siempre que la política quepa en 16 bits.
- Cabe en GPU de consumo: sí, con toda probabilidad en RTX 4090 y tarjetas de 16 GB o más, dado el tamaño de 3,5 B parámetros; no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch; no aplican runtimes de solo texto como llama.cpp, Ollama o vLLM, ya que se trata de una política Visión-Lenguaje-Acción con salida de acciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La información disponible solo permite una comparación limitada, ya que no se aportan parámetros, contexto ni métricas de los modelos alternativos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi0-stackcube-recovery-noise-70pct-40ep-convex (este modelo) | 3,5 B (3.501.372.176) | no disponible | apache-2.0 | Hugging Face, 0 descargas | Ajuste fino especializado en apilado de cubos con ruido |
| π₀ base (Physical Intelligence / OpenPI) | no disponible | no disponible | no disponible en la información proporcionada | Repositorio OpenPI citado en la model card | Modelo original del que deriva esta política |
| Política ACT de LeRobot | no disponible | no disponible | no disponible en la información proporcionada | Integrada en LeRobot (`--policy.type=act`) | Aparece como ejemplo en la propia model card de este repositorio |

## Limitaciones y advertencias

- Especialización extrema: el ajuste está atado a la tarea y al *dataset* `stack_cube_recovery_noise_70pct_40ep`; no debe esperarse comportamiento generalista fuera de ese dominio.
- Sin validación comunitaria: 0 descargas y 0 *likes*, y la model card es la plantilla genérica de LeRobot, sin métricas de éxito ni detalles del entrenamiento.
- Riesgo de sobreajuste al *setup*: cambios en la iluminación, la posición de cámara, el robot o la mesa pueden degradar el rendimiento; no se documenta evaluación *zero-shot* en otros entornos.
- Alucinación en acciones: al ser una política, los fallos se manifiestan como movimientos incorrectos o incompletos, con riesgo físico para el robot y el entorno; se requiere supervisión y paradas de emergencia.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto, por lo que el comportamiento con instrucciones en castellano es desconocido.
- Datos de entrenamiento no auditados: un 70 % de ruido declarado en el nombre del *dataset* implica que la política puede haber aprendido comportamientos degradados o inconsistentes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al derivar del modelo π₀ conviene revisar las condiciones del proyecto original OpenPI antes de un despliegue comercial.
- Sin datos de latencia: no se puede garantizar que la frecuencia de control sea adecuada para tareas que requieran respuesta en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-stackcube-recovery-noise-70pct-40ep-convex
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/taewonkoo/stack_cube_recovery_noise_70pct_40ep
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI de Physical Intelligence (citado en la model card): https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas (enlace incluido en la model card): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de la búsqueda web: no contienen información relevante sobre este modelo (los resultados devueltos corresponden a páginas de ayuda de YouTube).
