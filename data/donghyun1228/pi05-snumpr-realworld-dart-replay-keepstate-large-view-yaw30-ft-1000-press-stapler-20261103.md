# Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-press-stapler-20261103

## Resumen

π0.5 SNUMPR es un modelo de visión-lenguaje-acción (VLA) orientado a control robótico, desarrollado por el autor Donghyun1228 sobre la base del proyecto openpi y el marco SNUMPR. Este checkpoint concreto es un ajuste fino supervisado (imitation learning) para la tarea `press_stapler` (accionar una grapadora), derivado de una inicialización SNUMPR VLA (`snumpr-iclr27-v1/9999`) y entrenado sobre una repetición de demostración en el mundo real con vista de cámara desplazada.

El modelo parte de la familia π0.5, una arquitectura VLA que combina un backbone de visión-lenguaje con un cabezal de acciones (action expert) para producir comandos motores a partir de observaciones multimodales (imágenes y estado de las articulaciones). El ajuste se ha realizado con 1.000 actualizaciones, batch 64 sobre 2×H100 con FSDP, learning rate constante de 5e-5 y sin EMA, empleando únicamente aprendizaje por imitación (sin RLHF ni DPO).

Es relevante porque documenta una técnica de adaptación "one-shot" con aumento de datos geométrico (rotación virtual de la base +30° manteniendo el estado real de las articulaciones) sobre una única demostración, un enfoque útil para reutilizar demos escasas en robótica. No obstante, el propio autor indica que no se ha ejecutado ninguna evaluación en robot real, por lo que su rendimiento efectivo es desconocido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en π0.5 / openpi, con backbone visión-lenguaje y cabezal de acciones |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (FP32) y `assets` (normalización original), más `wandb_run.json`; sin `train_state` |

## Arquitectura y entrenamiento

El modelo se basa en la familia π0.5 integrada en openpi, un paradigma VLA que procesa observaciones visuales y el estado de las articulaciones (`observation.state`) para emitir acciones motoras (posiciones TCP y deltas). El checkpoint se inicializa desde `snumpr-iclr27-v1/9999`, la versión inicial del VLA SNUMPR con normalización original, y se ajusta con un preset específico (`pi05_snumpr_dart_replay_target_large_view_yaw30_keepstate_press_stapler`) sobre una repetición de la demostración fuente `demonstration_15`.

El entrenamiento es exclusivamente de aprendizaje por imitación (IL), con 1.000 actualizaciones, batch de 64, learning rate constante de 5e-5, sin warmup, sin EMA, todos los pesos entrenables, AdamW con clipping 1.0 y semilla 42, ejecutado sobre 2×H100 con FSDP. La innovación técnica clave es el aumento de datos geométrico: durante la repetición, la cámara base se sitúa en una vista con gran desplazamiento, y las poses TCP y acciones delta se rotan mediante un yaw virtual de base de +30° (`Rz(-30)`), mientras que `observation.state` conserva los ángulos articulares reales (`--keep-state`). Esto genera variaciones visuales y de acción coherentes sin alterar el estado real, lo que permite aumentar la diversidad de una única demostración.

## Capacidades

- Control robótico de manipulación: genera acciones motoras (posiciones TCP y deltas) a partir de imágenes y estado de articulaciones para ejecutar la tarea `press_stapler`.
- Aprendizaje por imitación de una única demostración (one-shot) con aumento geométrico de datos.
- Procesamiento multimodal: integra observaciones visuales (cámara base en vista desplazada) y estado propioceptivo (`observation.state`).
- Rotación virtual de base: el modelo está entrenado para operar con un yaw virtual de +30°, requiriendo que el controlador rote las acciones de vuelta (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimente el estado real sin cambios.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento; es un modelo especializado en control motor.
- Sin evaluación en robot real: las capacidades efectivas no están verificadas empíricamente.

## Casos de uso

- Investigación en adaptación one-shot de políticas VLA: el checkpoint sirve como referencia para estudiar cómo el aumento geométrico (rotación virtual de base) permite reutilizar una sola demostración para entrenar una política de manipulación. Es adecuado porque documenta explícitamente el preset, la receta y los hiperparámetros.
- Reproducción de experimentos de imitación en robótica: investigadores pueden partir de este checkpoint para replicar el ajuste `press_stapler` y comparar con la inicialización SNUMPR original, dado que se incluyen los pesos FP32 y la normalización original.
- Desarrollo de pipelines de aumento de datos geométrico: el modelo ejemplifica cómo rotar acciones y vistas manteniendo el estado real, útil para construir herramientas de data augmentation en robótica.
- Base para ajustes finos en tareas de accionamiento de objetos: al ser un fine-tune de `press_stapler`, puede servir como punto de partida para tareas similares de prensión o accionamiento con un solo ejemplo.
- Validación de recetas de entrenamiento (FSDP, LR constante, sin EMA): útil para equipos que quieran comparar configuraciones de entrenamiento en VLA con recursos limitados (2×H100, 1.000 updates).
- Integración en simulación o replay offline: dado que no hay evaluación real, puede usarse en entornos simulados o en replay para inspeccionar las acciones generadas antes de desplegar en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,4 GB y los pesos se publican en FP32, por lo que la inferencia en FP32 requeriría al menos ese orden de magnitud de memoria, sin datos oficiales.
- GPU recomendadas: el entrenamiento se realizó sobre 2×H100 con FSDP; para inferencia se desconoce la GPU mínima.
- ¿Cabe en GPU de consumo? No disponible; sin datos de tamaño de parámetros no puede confirmarse.
- Opciones de despliegue: no se documentan (no se mencionan vLLM, llama.cpp, Ollama ni TGI); el formato `params`/`assets` sugiere integración con el stack openpi.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR `press_stapler` (este) | no disponible | no disponible | sin evaluación real | Apache 2.0 | HuggingFace |
| `pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-press-stapler` (checkpoint base del merge) | no disponible | no disponible | sin evaluación real | Apache 2.0 | HuggingFace |
| `snumpr-iclr27-v1/9999` (inicialización SNUMPR VLA) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sin evaluación en robot real: el autor declara explícitamente que no se ha ejecutado ninguna evaluación, por lo que el rendimiento efectivo es desconocido.
- Requiere transformación específica en el controlador: las acciones deben rotarse de vuelta (`Δxyz_real = Rz(+30) Δxyz_virtual`) y el estado real de las articulaciones debe alimentarse sin cambios (`virtual_base_yaw_deg=30`, `keep_real_state=True`); un uso incorrecto invalida las acciones.
- Especialización estrecha: entrenado únicamente para la tarea `press_stapler`; no es un modelo generalista.
- Entrenado sobre una sola demostración (`demonstration_15`) con aumento geométrico, lo que limita la diversidad y aumenta el riesgo de sobreajuste a esa trayectoria.
- No se incluye el estado del optimizador (`train_state`), lo que impide reanudar el entrenamiento desde el checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías de seguridad física en aplicaciones robóticas reales.
- Sin datos sobre sesgos, idiomas o alucinación relevantes para un modelo de control motor; no obstante, en robótica los fallos de política pueden causar daños físicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-press-stapler-20261103
- Checkpoint base del merge: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-press-stapler-20261103
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `2065dd0a`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), receta `pi05_libero_oneshotft`
