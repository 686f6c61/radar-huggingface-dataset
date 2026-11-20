# qownscks/act_widow_bolt_4

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `qownscks/act_widow_bolt_4`, es una política entrenada con LeRobot sobre el dataset `qownscks/widow_bolt_4_20261120_195533` y publicada en Hugging Face Hub bajo licencia Apache 2.0.

El modelo tiene 51.670.663 parámetros (aproximadamente 51,7 millones) en formato safetensors, con un tamaño de repositorio de 0,2 GB. Se trata de un checkpoint de robótica orientado a control de brazos robóticos mediante teleoperación, no de un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que mapea observaciones visuales y de estado del robot a comandos de acción.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento, evaluación e inferencia con `lerobot-train` y `lerobot-record`) para un robot tipo SO-100 follower. No hay métricas publicadas, descargas ni likes en el momento de la ficha, por lo que debe considerarse un artefacto experimental más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones con chunking |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una acción por paso de control, predice un chunk de varias acciones futuras a partir de la observación actual. Esta estrategia de chunking reduce el error de compounding y suaviza el comportamiento del robot en tareas de manipulación de precisión. La arquitectura combina un encoder de observaciones (típicamente imágenes de cámaras y estado de las articulaciones) con un decodificador que emite las acciones del chunk.

El entrenamiento se realizó con LeRobot sobre el dataset `qownscks/widow_bolt_4_20261120_195533`, compuesto por episodios de teleoperación. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens de entrenamiento (concepto no aplicable en este dominio) ni sobre el uso de RLHF o DPO, que no forman parte del pipeline estándar de ACT. La innovación técnica principal es el propio action chunking descrito en el paper arXiv:2304.13705.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones articulares para un brazo robótico a partir de observaciones visuales y de estado.
- Predicción de action chunks: emite varias acciones futuras por inferencia, lo que mejora la estabilidad del control.
- Integración con LeRobot: entrenamiento con `lerobot-train` e inferencia/evaluación con `lerobot-record`.
- Compatibilidad con robots tipo SO-100 follower (`so100_follower`) en los scripts de ejemplo de la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del encoder visual propio de la política.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política predice chunks de acciones que suavizan el control en tareas como insertar o atornillar, adecuado por su diseño específico para action chunking.
- Reproducción de experimentos de imitation learning: sirve como checkpoint de referencia para validar el pipeline de LeRobot con un robot SO-100 follower antes de entrenar políticas propias.
- Teleoperación asistida: puede desplegarse para ejecutar tareas demostradas previamente por un operador humano en el dataset `widow_bolt_4`.
- Evaluación comparativa de políticas ACT: útil como baseline al probar variantes de arquitectura o de dataset en el mismo entorno robótico.
- Prototipado de flujos de entrenamiento: el comando `lerobot-train` documentado permite reentrenar desde cero sobre nuevos datasets y comparar con este checkpoint.
- Docencia y formación en robótica de imitación: ejemplo completo y ligero (0,2 GB) para ilustrar el ciclo teleoperación-entrenamiento-evaluación.
- Automatización de tareas repetitivas de ensamblaje: si el entorno coincide con el del dataset, la política puede ejecutar la tarea de forma autónoma tras la evaluación con `lerobot-record`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros en safetensors, el peso de los parámetros ronda los 100-200 MB según precisión, por lo que la política cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no hay recomendación oficial en la model card; por tamaño, una RTX 3060 o superior es suficiente para inferencia, y una GPU con CUDA es el requisito indicado en el comando de entrenamiento (`--policy.device=cuda`).
- Cabe en GPU consumer: sí, por el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qownscks/act_widow_bolt_4 | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (checkpoints de referencia) | variable | no aplica | no disponible | según checkpoint | Hugging Face Hub |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | no disponible | según checkpoint | Hugging Face Hub |
| Políticas VQ-BeT / TDMPC (LeRobot) | variable | no aplica | no disponible | según checkpoint | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a la categoría (políticas de imitation learning integradas en LeRobot).

## Limitaciones y advertencias

- Modelo específico de robótica: no es un LLM ni un modelo multimodal de propósito general; no debe evaluarse con benchmarks de lenguaje.
- Sesgos conocidos: no documentados; al entrenarse sobre un dataset concreto de teleoperación, hereda las limitaciones y sesgos de ese dataset.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar acciones erróneas fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: sin capacidades lingüísticas; el "contexto" es la ventana de observación definida por la política.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Caveats para producción: cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados; requiere validación exhaustiva en el entorno real antes de cualquier despliegue.
- Dependencia del robot y del dataset: los scripts de ejemplo asumen un `so100_follower`; su uso con otro hardware requiere adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qownscks/act_widow_bolt_4
- Dataset de entrenamiento: https://huggingface.co/datasets/qownscks/widow_bolt_4_20261120_195533
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
