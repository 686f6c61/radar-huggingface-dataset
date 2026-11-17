# iFaz/eqm-pusht-seed1-16nov2026_9pm

## Resumen

eqm-pusht-seed1-16nov2026_9pm es una política robótica entrenada con LeRobot y publicada en Hugging Face por el usuario iFaz. Se trata de un modelo de aprendizaje por imitación (imitation learning) orientado a control robótico, entrenado sobre el dataset `lerobot/pusht`, una tarea de manipulación bidimensional en la que un efector empuja un objeto hasta un objetivo. El identificador del repositorio sugiere una ejecución concreta de un experimento (semilla 1, fecha 16 de noviembre de 2026) dentro de una campaña de evaluación de un método denominado `eqm`.

El modelo no es un modelo de lenguaje: es una política de control que mapea observaciones (estado del robot e imágenes) a acciones. Cuenta con 205.787.957 parámetros almacenados en formato safetensors y un tamaño de repositorio de 0,8 GB, lo que sitúa su huella en disco en el rango de los cientos de megabytes. La licencia es Apache 2.0 y la librería asociada es LeRobot.

Su relevancia es acotada y experimental: se publica como artefacto reproducible de un entrenamiento concreto sobre un benchmark estándar de robótica (pusht), no como un modelo de propósito general. La model card es prácticamente una plantilla sin rellenar, por lo que la mayor parte de los detalles técnicos (arquitectura exacta, hiperparámetros, composición del dataset) no están documentados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de robótica; el tag `eqm` sugiere un método específico no documentado en la model card) |
| Parámetros totales | 205.787.957 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el horizonte de observación/acción no está documentado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Dataset de entrenamiento | `lerobot/pusht` |
| Pipeline | robotics |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna. El tag `eqm` y el pipeline `robotics` apuntan a una política de aprendizaje por imitación entrenada con LeRobot, la librería de Hugging Face para robótica. La model card menciona en el ejemplo de entrenamiento `--policy.type=act`, lo que sugiere que el flujo estándar de LeRobot usa políticas tipo ACT (Action Chunking Transformer), aunque no se confirma que esta política concreta sea ACT; el nombre `eqm` indica un método distinto o una variante.

No se dispone de datos sobre número de tokens o episodios de entrenamiento, composición del dataset, uso de RLHF/DPO (no aplicable en este dominio) ni innovaciones técnicas específicas. El entrenamiento se realizó sobre `lerobot/pusht`, un dataset de referencia de empuje de objetos en 2D. El sufijo `seed1` sugiere que forma parte de una serie de ejecuciones con distintas semillas para evaluar varianza.

## Capacidades

- Control robótico por imitación: genera acciones a partir de observaciones del entorno para la tarea de empuje (pusht).
- Ejecución de políticas en robots compatibles con LeRobot (por ejemplo, `so100_follower` según la documentación de ejemplo).
- Evaluación reproducible mediante `lerobot-record` con `--policy.path` apuntando al checkpoint.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documenta ningún modo especial (thinking, audio, etc.).

## Casos de uso

- Reproducción de experimentos de investigación: sirve como checkpoint de referencia para comparar el método `eqm` frente a otras políticas sobre `pusht` con la misma semilla.
- Evaluación de políticas en simulación o robot real: se puede cargar con `lerobot-record` para medir la tasa de éxito en la tarea de empuje.
- Línea base en estudios de varianza entre semillas: al estar etiquetado con `seed1`, permite analizar la robustez del entrenamiento frente a inicializaciones.
- Docencia y formación en robótica de imitación: ejemplo mínimo y ligero (0,8 GB) para ilustrar el flujo completo de LeRobot (entrenamiento, checkpoint, evaluación).
- Integración en pipelines de investigación con LeRobot: uso como política intercambiable dentro de experimentos que ya usan la librería.
- Pruebas de infraestructura de despliegue robótico: su tamaño reducido permite validar sistemas de inferencia en hardware modesto antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas sobre `pusht`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 205,8 M de parámetros y pesos en safetensors (0,8 GB de repo), una estimación razonable en fp32 ronda los 0,8-1 GB y en fp16/bf16 aproximadamente 0,4-0,5 GB, más memoria para observaciones y buffers.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.), aunque no está confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| iFaz/eqm-pusht-seed1-16nov2026_9pm | 205.787.957 | no disponible | Apache 2.0 | Hugging Face (LeRobot) | Política sobre `pusht`, seed 1 |
| Políticas ACT de LeRobot sobre `pusht` | no disponible | no disponible | Apache 2.0 (habitual) | Hugging Face / LeRobot | Referencia estándar del ecosistema LeRobot; comparación directa no documentada |
| Diffusion Policy sobre `pusht` | no disponible | no disponible | variable según implementación | Repositorios de investigación | Método alternativo de imitación; sin comparación publicada frente a este checkpoint |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card incompleta: es una plantilla sin rellenar ("Model type not recognized"), lo que impide conocer arquitectura, hiperparámetros y procedimiento exacto.
- Entrenado únicamente sobre `lerobot/pusht`: no se espera generalización a otras tareas, morfologías de robot o entornos.
- Sin métricas publicadas: no hay evidencia documentada de tasa de éxito ni de robustez.
- Riesgo de sobreajuste al dataset y a la semilla concreta; el sufijo `seed1` sugiere que podría tratarse de una ejecución aislada sin validación cruzada publicada.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación y de garantías hace desaconsejable su uso en producción sin evaluación propia.
- No se documentan sesgos, pero en robótica los sesgos provienen de la distribución del dataset de entrenamiento y de las condiciones del entorno, no evaluadas aquí.
- Sin información sobre cuantización ni formatos alternativos de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/iFaz/eqm-pusht-seed1-16nov2026_9pm
- Dataset `lerobot/pusht`: https://huggingface.co/datasets/lerobot/pusht
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
