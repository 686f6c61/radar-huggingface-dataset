# Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-hang-tape-top-20261103

## Resumen

π0.5 SNUMPR real-world DART es un checkpoint de robótica derivado de π0.5 (pi05), el modelo de visión-lenguaje-acción (VLA) de Physical Intelligence, adaptado por el autor Donghyun1228 sobre la base SNUMPR (un VLA inicial denominado `snumpr-iclr27-v1/9999`) mediante un ajuste fino supervisado de una sola pasada (one-shot fine-tune) para la tarea concreta `hang_tape_top`. El modelo resuelve el problema de la adaptación rápida de políticas robóticas a cambios de punto de vista de cámara mediante replay de demostraciones reales con aumento de datos geométrico (DART), sin necesidad de recoger nuevas demostraciones físicas.

La innovación principal es el uso de *target-view replay*: el robot reproduce la trayectoria articular de una demostración fuente (`demonstration_9`) mientras la cámara base se sitúa en una vista con gran desplazamiento, de modo que el estado, las acciones y las marcas temporales coinciden con la demo original y solo las imágenes son nuevas. Además, las poses TCP y las acciones delta se rotan mediante un yaw virtual de base de +30° (`Rz(-30)`), mientras que `observation.state` conserva los ángulos articulares reales (opción `--keep-state`). El resultado es un checkpoint de 12,4 GB en FP32, entrenado con 1.000 actualizaciones en 2×H100 con FSDP, licencia Apache 2.0 y sin evaluación robótica publicada todavía.

Es relevante ahora porque ejemplifica una receta reproducible de adaptación de VLAs a condiciones de cámara no vistas con coste computacional mínimo (1.000 pasos, batch 64), un patrón habitual en laboratorios de robótica que necesitan desplegar políticas sobre hardware real sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de π0.5 / pi05; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `params` (FP32) y `assets` (normalización original), más `wandb_run.json`; sin `train_state` |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `snumpr-iclr27-v1/9999` (SNUMPR VLA inicial con normalización original) y se ajusta con el preset `pi05_snumpr_dart_replay_target_large_view_yaw30_keepstate_hang_tape_top` sobre un replay de la demostración fuente `demonstration_9` del 2026-11-03. Durante el replay, el robot ejecuta la trayectoria articular de la demo original mientras la cámara base se coloca en una vista con gran desplazamiento; las poses TCP y las acciones delta se rotan con un yaw virtual de +30° (`Rz(-30)`), pero `observation.state` conserva los ángulos articulares reales gracias a `--keep-state`.

El entrenamiento es de imitación supervisada (IL) exclusivamente, con 1.000 actualizaciones, batch 64, FSDP sobre 2×H100, LR constante 5e-5, sin warmup, sin EMA, todos los pesos entrenables, AdamW con clip 1.0 y semilla 42. Se usó el código `Donghyun1228/vla_adaptation` (commit `2065dd0a`) con la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`). No se incluye el estado del optimizador (`train_state`). El checkpoint se fusiona sobre el modelo previo `pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261103`.

## Capacidades

- Control robótico de manipulación para la tarea específica `hang_tape_top` (colgar cinta en la parte superior).
- Política VLA que mapea observaciones visuales (cámara base en vista con gran desplazamiento) y estado articular real a acciones delta rotadas.
- Aumento de datos geométrico vía replay de demostraciones con cambio de punto de vista de cámara.
- Rotación virtual de base de +30° en acciones y poses TCP, con estado real preservado.
- Ajuste fino one-shot sobre un VLA preentrenado (SNUMPR / π0.5).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, thinking mode, visión general, audio ni matemáticas; el modelo está especializado en robótica.

## Casos de uso

- Adaptación de políticas robóticas a nuevas vistas de cámara: se usa el checkpoint para que un robot manipule en una configuración de cámara desplazada sin recoger nuevas demostraciones físicas, aprovechando el replay con aumento geométrico.
- Ejecución de la tarea `hang_tape_top` en laboratorio: el controlador debe rotar la acción de vuelta con `Δxyz_real = Rz(+30) Δxyz_virtual` y alimentar el estado articular real sin cambios (`virtual_base_yaw_deg=30`, `keep_real_state=True`).
- Investigación en adaptación one-shot de VLAs: sirve como referencia reproducible de la receta `pi05_libero_oneshotft` con 1.000 pasos y batch 64 para estudiar la transferencia a vistas no vistas.
- Prototipado de pipelines de imitación supervisada: el checkpoint permite validar el flujo completo de replay de demos, rotación virtual de base y ajuste fino con FSDP en 2×H100.
- Estudio de robustez a cambios de punto de vista: al entrenar solo con imágenes nuevas y estado/acciones originales, permite analizar la sensibilidad del VLA a la geometría de la cámara.
- Base para futuros fine-tunes: al estar fusionado sobre el modelo `alpha0p8` y publicarse en FP32 con normalización original, puede servir de inicialización para tareas relacionadas de manipulación con cinta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación robótica (`No robot evaluation has been run yet`).

## Requisitos de hardware

- Entrenamiento realizado en 2×H100 con FSDP, batch 64, 1.000 actualizaciones.
- VRAM estimada para inferencia: no disponible (pesos en FP32, repo de 12,4 GB; el tamaño exacto del modelo no se especifica).
- GPU recomendadas: no disponible; el entrenamiento usó H100.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI; es un checkpoint de robótica con `params` y `assets`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART `hang_tape_top` (este) | no disponible | no disponible | sin evaluación robótica | apache-2.0 | Hugging Face |
| `pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261103` | no disponible | no disponible | no disponible | apache-2.0 (presumible) | Hugging Face |
| SNUMPR VLA inicial `snumpr-iclr27-v1/9999` | no disponible | no disponible | no disponible | no disponible | no disponible |
| π0.5 original (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento, parámetros ni contexto para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación robótica; el rendimiento real en el robot es desconocido.
- El checkpoint está especializado en una única tarea (`hang_tape_top`) y en una vista de cámara concreta (yaw +30°); no es un modelo generalista.
- El controlador debe aplicar la rotación inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y alimentar el estado articular real sin cambios; un uso incorrecto invalida las acciones.
- No se incluye el estado del optimizador (`train_state`), lo que limita reanudar el entrenamiento exactamente.
- Pesos en FP32 (12,4 GB), sin cuantizaciones publicadas; el despliegue en hardware limitado no está documentado.
- Sin datos de sesgos, alucinación o cobertura idiomática; al ser un modelo de robótica, estos riesgos se manifiestan como fallos de política (acciones incorrectas) más que como texto generado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad de la tarea desaconsejan producción sin validación previa.
- El modelo se apoya en un checkpoint previo (`alpha0p8`) y en código de terceros (`snumprlab/dart`); la reproducibilidad depende de esos commits concretos.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-hang-tape-top-20261103
- Modelo base fusionado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261103
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `2065dd0a`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), receta `pi05_libero_oneshotft`
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
