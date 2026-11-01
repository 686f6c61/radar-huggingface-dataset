# Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-stack-cube-20261030

## Resumen

π0.5 SNUMPR real-world DART es un checkpoint de ajuste fino de un modelo visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario Donghyun1228 a partir del VLA inicial SNUMPR (variante de π0.5 de Physical Intelligence) y de la receta de adaptación DART del repositorio `snumprlab/dart`. El modelo resuelve una tarea concreta de manipulación robótica, `stack_cube` (apilar un cubo), mediante aprendizaje por imitación sobre demostraciones reales recogidas el 2026-10-30 con una vista de cámara ampliada y una transformación de aumento de datos basada en un giro virtual de la base de +30 grados.

Se trata de uno de los dos ajustes finos one-shot que se fusionan (merge) en un checkpoint combinado con peso alpha 0.8. El entrenamiento es exclusivamente de imitación (IL), con 1.000 actualizaciones, batch de 64, learning rate constante de 5e-5 y AdamW con clipping de 1.0, sin warmup ni EMA y con todos los pesos entrenables. El checkpoint publicado corresponde al paso 999 en FP32, junto con los assets de normalización originales; no incluye el estado del optimizador.

Su relevancia es acotada pero técnicamente interesante: documenta un pipeline reproducible de adaptación one-shot de un VLA a una tarea real con aumento de datos geométrico (rotación virtual de la base) y una convención explícita de des-rotación en el controlador. No se ha ejecutado ninguna evaluación en robot real, por lo que debe considerarse un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (transformer visión-lenguaje-acción); detalles internos no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (FP32) y `assets` (normalización original), más `wandb_run.json`; formato de serialización exacto no disponible |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `snumpr-iclr27-v1/9999`, descrito como el VLA inicial SNUMPR con normalización original, y se ajusta con la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), ejecutada con el código `Donghyun1228/vla_adaptation` (commit `c4fcb61`). El preset utilizado es `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_stack_cube`, aplicado sobre demostraciones reales de la tarea `stack_cube` recogidas de nuevo el 2026-10-30 con una vista de cámara ampliada.

La innovación técnica del ajuste es el aumento de datos geométrico: las poses TCP y las acciones delta se rotan mediante un giro virtual de la base de +30 grados (`Rz(-30)`), mientras que `observation.state` conserva los ángulos articulares reales (`keep_real_state=True`). El entrenamiento es solo de imitación, con 1.000 actualizaciones, batch 64, LR constante 5e-5, sin warmup, sin EMA, todos los pesos entrenables, AdamW con clip 1.0 y semilla 42. No se documenta en la información disponible el volumen de tokens, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de manipulación para la tarea `stack_cube` a partir de observaciones visuales y estado articular.
- Control visomotor condicionado por instrucción de tarea (VLA), heredado del modelo base π0.5/SNUMPR.
- Aumento de datos por rotación virtual de base: el modelo espera acciones en el marco virtual rotado +30 grados y estado articular real.
- Aprendizaje por imitación one-shot sobre demostraciones reales de una única tarea.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual general, matemáticas, visión general o audio en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en adaptación one-shot de VLA: sirve como referencia reproducible para estudiar cuánto se puede especializar un VLA en una tarea real con solo 1.000 pasos de imitación.
- Estudio de aumento de datos geométrico en robótica: permite evaluar el efecto de rotar poses y acciones con un giro virtual de base mientras se mantiene el estado articular real.
- Base para fusiones de checkpoints: al ser uno de los dos ajustes que se combinan con alpha 0.8, es útil para analizar estrategias de model merging en políticas robóticas.
- Reproducción de pipelines DART: el preset y los commits documentados permiten replicar el entrenamiento sobre nuevas demostraciones de `stack_cube`.
- Experimentos de convención de marcos de referencia: el requisito de des-rotar la acción en el controlador (`Δxyz_real = Rz(+30) Δxyz_virtual`) lo convierte en un caso práctico para validar la coherencia entre política y controlador.
- Docencia y prototipado en laboratorio: adecuado para prácticas de robótica de manipulación con hardware real, siempre que se asuma la ausencia de evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,4 GB y los pesos se publican en FP32, por lo que se requiere al menos ese orden de magnitud de memoria, sin cifra oficial confirmada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (12,4 GB) sugiere que podría requerir GPUs con 16-24 GB o más, pero no hay dato oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de robótica con pesos `params`/`assets`, el despliegue esperado es mediante el stack de openpi/`vla_adaptation`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART `stack_cube` (este) | no disponible | no disponible | Manipulación `stack_cube` | Apache 2.0 | HuggingFace |
| π0.5 SNUMPR base (`snumpr-iclr27-v1/9999`) | no disponible | no disponible | VLA general | no disponible en la información | Referenciado como init |
| Checkpoint fusionado alpha 0.8 (`...-alpha0p8-stack-cube-...`) | no disponible | no disponible | Manipulación `stack_cube` | Apache 2.0 (presumible) | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card afirma explícitamente que no se ha ejecutado ninguna prueba física, por lo que el rendimiento real es desconocido.
- Especialización extrema: solo cubre la tarea `stack_cube`; no es un modelo generalista.
- Requisito de integración estricto: el controlador debe rotar la acción con `Rz(+30)` y alimentar el estado articular real sin modificar; ignorarlo invalida la política.
- Estado del optimizador no incluido: no es posible reanudar el entrenamiento tal cual desde este checkpoint.
- Normalización original fijada en los assets (SHA `f549619e…`): alterarla rompe la coherencia con los pesos.
- Sesgos conocidos: no documentados; en robótica por imitación son esperables sesgos hacia las condiciones de las demostraciones (iluminación, posiciones, vista de cámara ampliada).
- Riesgo de alucinación de acciones: no cuantificado; típico en políticas de imitación fuera de distribución.
- Idiomas y contexto: no disponibles, lo que impide planificar usos lingüísticos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y las dependencias del código base (`snumprlab/dart`, `Donghyun1228/vla_adaptation`) deben revisarse antes de producción.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-stack-cube-20261030
- Checkpoint fusionado alpha 0.8: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `c4fcb61`), sin URL directa en la información disponible
- Receta DART: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), sin URL directa en la información disponible
