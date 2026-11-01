# Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-hang-tape-bottom-20261030

## Resumen

π0.5 SNUMPR real-world DART es un fine-tune de un solo paso (*one-shot*) del modelo de visión-lenguaje-acción (VLA) SNUMPR, inicializado desde el checkpoint `snumpr-iclr27-v1/9999` y especializado en la tarea robótica `hang_tape_bottom`. Lo publica el usuario Donghyun1228 dentro del ecosistema de `openpi` y del recetario `snumprlab/dart`, y forma parte de un par de fine-tunes que se fusionan posteriormente en un modelo combinado con la técnica DART. El modelo está pensado para control robótico de manipulación a partir de observaciones visuales y estado articular, no para generación de texto general.

Se trata de un ajuste por imitación (IL) puro sobre una única demostración fuente (`demonstration_6`), con 1.000 actualizaciones, batch de 64, tasa de aprendizaje constante de 5e-5, sin warmup ni EMA, y todos los pesos entrenables. El repositorio ocupa 12,4 GB e incluye únicamente los parámetros en FP32 del paso 999 y los assets de normalización original; no se distribuye el estado del optimizador.

Su relevancia es acotada pero concreta: documenta una receta reproducible de adaptación one-shot de un VLA a una tarea de manipulación real, con hiperparámetros y commits exactos, lo que resulta útil para investigadores que trabajan en adaptación eficiente de políticas robóticas. No hay evaluación en robot publicada, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) π0.5 / SNUMPR; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (FP32) y `assets` de normalización, más `wandb_run.json`; no se especifica el contenedor exacto (probablemente safetensors/arrays, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de `snumpr-iclr27-v1/9999`, un VLA de la familia π0.5 adaptado por SNUMPR, y se ajusta con el preset `pi05_snumpr_dart_paired_source_hang_tape_bottom` sobre la demostración fuente `demonstration_6` de la tarea `hang_tape_bottom`, con yaw 0 y estado articular real. El entrenamiento es exclusivamente de imitación (IL), sin RLHF ni DPO, con 1.000 actualizaciones, batch 64, LR constante 5e-5, sin warmup, sin EMA, todos los pesos entrenados, AdamW con clipping 1.0 y semilla 42. El código corresponde a `Donghyun1228/vla_adaptation` (commit `c4fcb61`) y la receta oficial `pi05_libero_oneshotft` de `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`).

La particularidad técnica es que se ejecuta en la vista original (source) sin ninguna transformación de yaw, y que es uno de los dos fine-tunes que se fusionan en el modelo `pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030`. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal; la información disponible no cubre la arquitectura interna más allá de su naturaleza VLA.

## Capacidades

- Control robótico de manipulación para la tarea específica `hang_tape_bottom`, a partir de observaciones visuales y estado articular real.
- Política de imitación entrenada sobre una única demostración fuente, orientada a generalización one-shot dentro de la misma tarea.
- Integración con el ecosistema `openpi` y con el pipeline de fusión DART de `snumprlab/dart`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles; el modelo no se distribuye como modelo de lenguaje.
- No hay evaluación en robot publicada que confirme el éxito de la política en el entorno real.

## Casos de uso

- Investigación en adaptación one-shot de VLA: sirve como referencia reproducible para estudiar cuánto rendimiento se obtiene con 1.000 pasos de IL sobre una sola demostración, usando los hiperparámetros y commits documentados.
- Reproducción de experimentos DART: al ser una de las dos mitades del modelo fusionado, permite replicar la fusión y comparar el comportamiento del par frente a cada fuente por separado.
- Punto de partida para fine-tuning posterior: los pesos en FP32 del paso 999 y los assets de normalización original permiten continuar el entrenamiento con otras demostraciones o tareas.
- Auditoría de recetas de entrenamiento: el `wandb_run.json` y la configuración exacta (LR, batch, clipping, semilla) facilitan el análisis de sensibilidad y la comparación con otras recetas `pi05_libero_oneshotft`.
- Docencia y divulgación sobre robótica basada en VLA: útil para mostrar el flujo completo desde un checkpoint base hasta una política especializada en una tarea de manipulación concreta.
- Base para evaluación en simulador o robot: aunque no hay evaluación publicada, el artefacto puede desplegarse en un banco de pruebas para medir tasa de éxito en `hang_tape_bottom` antes de integrarlo en un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,4 GB en FP32, lo que da una cota inferior orientativa del orden de 12 GB solo para pesos, sin contar activaciones ni buffers.
- GPU recomendadas: no disponible; por el tamaño del artefacto, se requerirían GPUs con al menos 16-24 GB de VRAM para FP32, aunque no hay confirmación del autor.
- ¿Cabe en GPU de consumo? No confirmado; probablemente en modelos con 24 GB o más (RTX 3090/4090) si se aplica cuantización o se reduce precisión, pero no hay datos publicados.
- Opciones de despliegue: no disponible; el ecosistema declarado es `openpi`, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world DART (este) | no disponible | no disponible | sin evaluación publicada | Apache 2.0 | HuggingFace |
| `pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030` | no disponible | no disponible | sin evaluación publicada | Apache 2.0 (presumible) | HuggingFace |
| `snumpr-iclr27-v1/9999` (checkpoint base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación en robot; el rendimiento real de la política es desconocido.
- Entrenado sobre una única demostración (`demonstration_6`), lo que limita la diversidad de estados y puede provocar sobreajuste a esa trayectoria.
- Solo funciona en la vista original (source) sin transformación de yaw; usarlo con otra vista o yaw distinto puede degradar el comportamiento.
- No incluye el estado del optimizador (`train_state`), por lo que no es reanudable tal cual desde el paso 999.
- Es un artefacto de investigación de un autor individual, con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.
- Riesgo de alucinación y sesgos: no aplica en el sentido de LLM, pero la política puede generar acciones fuera de distribución ante observaciones no vistas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías hace desaconsejable su uso en producción sin validación previa.
- No se documentan idiomas, contexto ni cuantizaciones, lo que dificulta planificar el despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-hang-tape-bottom-20261030
- Modelo fusionado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030
- Checkpoint base: `snumpr-iclr27-v1/9999` (referenciado en la model card; no se proporciona URL directa)
- Código de adaptación: `Donghyun1228/vla_adaptation`, commit `c4fcb61` (no se proporciona URL directa)
- Receta oficial: `snumprlab/dart`, commit `1b23c4f42f73168c78a20b353453145e74f64711` (no se proporciona URL directa)
