# caspar/smolvla_so101_pickplace_sim_150_rtx5090_20261118

## Resumen

SmolVLA SO-101 pick and place es un modelo de vision-lenguaje-accion (VLA) especializado en robótica manipulativa, obtenido por fine-tuning de `lerobot/smolvla_base` sobre el conjunto de demostraciones `caspar/so101_pickplace_sim_150`. Lo desarrolla el usuario independiente caspar y resuelve una tarea concreta: coger un cubo rojo y depositarlo en una caja azul con un brazo robótico SO-101 en simulación. Es relevante como ejemplo reproducible de ajuste fino de un VLA pequeño (450 millones de parámetros) sobre hardware de consumo, en este caso una NVIDIA GeForce RTX 5090.

El modelo emplea la arquitectura SmolVLA de LeRobot, que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones que emite comandos de seis dimensiones. El checkpoint se entrenó durante 10.000 pasos con batch de 8 sobre 117 episodios (20.124 fotogramas), partiendo de la revisión `5e8d12a6e2975b0e5e5fce7c8caf47c371d257b6` del modelo base.

Se trata de un artefacto de investigación con alcance muy limitado: no se midió pérdida de validación ni tasa de éxito, no hay partición de validación y el propio autor advierte de que solo se verificó la finitud de las acciones en tres observaciones. Su interés es, por tanto, metodológico y didáctico más que de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion) de LeRobot, derivada de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica; no se documenta cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo parte de SmolVLA, una arquitectura de vision-lenguaje-accion pensada para control robótico de bajo coste computacional. El pipeline procesa observaciones multimodales (imágenes de cámara superior y de muñeca, más el estado del robot) y emite acciones continuas de seis dimensiones. El repositorio incluye preprocesadores guardados con estadísticas de normalización y renombrado de cámaras: `observation.images.top` se mapea a `observation.images.camera1` y `observation.images.wrist` a `observation.images.camera2`.

El ajuste fino se realizó sobre los 117 episodios (20.124 fotogramas) del dataset `caspar/so101_pickplace_sim_150` (revisión `b4fb342927bb0ee7dcbe4b90472a0c257ce4f5de`), pese a que el nombre del dataset sugiere 150 episodios. La configuración fue de 10.000 pasos, batch de 8, semilla 1000, sobre una RTX 5090 con LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni ninguna fase de alineamiento; se trata de aprendizaje por imitación supervisado. Tampoco se reporta el número de tokens de entrenamiento ni la composición detallada del dataset más allá de la tarea descrita.

La verificación realizada consistió en recargar el checkpoint en CUDA y comprobar que las acciones de seis dimensiones eran finitas en tres observaciones (principio, mitad y final del dataset). No se midió pérdida de validación ni tasa de éxito de la tarea.

## Capacidades

- Control robótico de manipulación: genera acciones de seis dimensiones para un brazo SO-101 en simulación.
- Ejecución de una tarea concreta de pick and place: coger un cubo rojo y colocarlo en una caja azul.
- Procesamiento multimodal de dos cámaras (vista superior y vista de muñeca) junto con el estado del robot.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración con el ecosistema LeRobot mediante `SmolVLAPolicy.from_pretrained` y `make_pre_post_processors`.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, matemáticas, generación de código ni procesamiento de audio.

## Casos de uso

- Reproducción de experimentos de imitation learning: sirve como referencia para replicar un pipeline completo de fine-tuning de SmolVLA sobre un dataset propio, con configuración, logs y verificación incluidos en `training_run/`.
- Docencia y formación en robótica: permite mostrar de extremo a extremo cómo se entrena un VLA pequeño en una GPU de consumo y cómo se evalúa mínimamente un checkpoint.
- Punto de partida para ajuste fino adicional: al estar bajo Apache 2.0 y derivar de `lerobot/smolvla_base`, puede reentrenarse con más episodios o con variaciones de la tarea para estudiar la transferencia.
- Pruebas de infraestructura de simulación: útil para validar el cableado de cámaras, el mapeo de observaciones y los preprocesadores de LeRobot antes de escalar a datasets mayores.
- Comparación de metodologías de verificación: el autor documenta explícitamente la ausencia de validación, lo que lo convierte en un caso de estudio sobre qué comprobaciones mínimas debe incluir un checkpoint antes de publicarse.
- Benchmark interno de hardware: al estar entrenado en una RTX 5090, permite estimar tiempos de entrenamiento y requisitos de memoria para configuraciones equivalentes (10.000 pasos, batch 8).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se midió pérdida de validación ni tasa de éxito de la tarea, y que la única comprobación fue la finitud de las acciones en tres observaciones del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors (0,9 GB de repositorio), la inferencia en precisión completa requiere del orden de 2 GB de VRAM, y menos aún si se cuantiza, aunque el autor no documenta cuantizaciones.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA GeForce RTX 5090; para inferencia basta con una GPU consumer moderna con al menos 4-8 GB de VRAM.
- Cabe en GPU consumer: sí, por tamaño de parámetros, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: librería `lerobot` con `SmolVLAPolicy.from_pretrained` y `make_pre_post_processors`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caspar/smolvla_so101_pickplace_sim_150_rtx5090_20261118 | 450.046.176 | no disponible | Pick and place SO-101 en simulación | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible | no disponible | VLA base para robótica | no disponible en la información | Hugging Face |
| Otros VLA de la familia SmolVLA | no disponible | no disponible | Manipulación robótica | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se midió tasa de éxito ni pérdida de validación: no hay evidencia cuantitativa de que el modelo funcione fuera de las tres observaciones verificadas.
- No existe partición de validación ni conjunto de test retenido, por lo que no puede estimarse el sobreajuste.
- El dataset contiene 117 episodios pese a que su nombre indica 150, lo que puede inducir a error sobre el volumen real de entrenamiento.
- El alcance es una única tarea en simulación (cubo rojo a caja azul); no hay evidencia de generalización a otras tareas, objetos o entornos.
- El mapeo de cámaras es específico (`top` a `camera1`, `wrist` a `camera2`); usarlo con otra configuración requiere ajustar los preprocesadores.
- No se documentan sesgos, cobertura idiomática ni comportamiento fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de `lerobot/smolvla_base`, cuyos términos conviene verificar por separado.
- Para producción: no recomendado sin una evaluación propia de éxito de tarea, robustez y latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/smolvla_so101_pickplace_sim_150_rtx5090_20261118
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/caspar/so101_pickplace_sim_150
- LeRobot (librería): https://github.com/huggingface/lerobot
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
