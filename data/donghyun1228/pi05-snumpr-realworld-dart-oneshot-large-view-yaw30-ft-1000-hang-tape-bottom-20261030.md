# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-hang-tape-bottom-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot es un ajuste fino (fine-tune) de un modelo de vision-lenguaje-accion (VLA) orientado a robótica, publicado por el usuario Donghyun1228 sobre la base del modelo inicial SNUMPR VLA (`snumpr-iclr27-v1/9999`). El modelo está especializado en una única tarea manipulativa denominada `hang_tape_bottom`, aprendida a partir de una sola demostración real capturada el 2026-10-29 con una vista amplia y un giro virtual de base de +30°. Se distribuye como un checkpoint de parámetros en FP32 junto con sus assets de normalización, dentro de un repositorio de 12,4 GB.

El interés técnico del modelo reside en su metodología: es uno de los dos ajustes one-shot que se fusionan (merge) en otro checkpoint del mismo autor, y emplea la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart`. El entrenamiento es puramente de imitación (IL), con 1.000 actualizaciones, batch 64, learning rate constante de 5e-5, sin warmup ni EMA, y AdamW con clipping de 1.0. No se ha ejecutado ninguna evaluación sobre robot real, por lo que su rendimiento efectivo está por validar.

Se trata de un artefacto de investigación muy específico, no de un modelo de propósito general: no procesa lenguaje natural de usuario ni genera texto, sino que produce acciones motoras condicionadas por observaciones visuales y estado del robot. Su relevancia es acotada al ámbito de la adaptación few-shot en robótica y a la reproducibilidad de recetas de fine-tuning sobre arquitecturas VLA tipo π0.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (no se detalla la topología interna en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP32) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | `params` (FP32) y `assets` de normalización; `wandb_run.json` |
| Tarea | `hang_tape_bottom` (manipulación robótica) |
| Inicialización | `snumpr-iclr27-v1/9999` con normalización original |
| Actualizaciones de entrenamiento | 1.000 |
| Batch size | 64 |
| Learning rate | 5e-5 constante, sin warmup |
| Optimizador | AdamW, clip 1.0 |
| Semilla | 42 |
| Tamaño del repositorio | 12,4 GB |
| Estado del optimizador | no incluido (`train_state` ausente) |

## Arquitectura y entrenamiento

El modelo se basa en π0.5, una arquitectura de vision-lenguaje-accion, pero la model card no describe los detalles internos de la red (número de parámetros, mecanismo de atención, composición de capas). Lo que sí se documenta es el proceso de adaptación: se parte del checkpoint `snumpr-iclr27-v1/9999`, que corresponde al VLA inicial de SNUMPR con su normalización original, y se aplica un preset específico (`pi05_snumpr_dart_oneshot_target_large_view_yaw30_hang_tape_bottom`) sobre una única demostración real de la tarea, capturada con vista amplia y un giro virtual de base de +30°.

El entrenamiento es exclusivamente de imitación, con 1.000 pasos, batch de 64, learning rate constante de 5e-5, sin warmup ni EMA, actualizando todos los pesos y usando AdamW con clipping de 1.0 y semilla 42. Se emplea el código `Donghyun1228/vla_adaptation` (commit `248126e`) y la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`). No se menciona RLHF, DPO ni ninguna fase de alineación; tampoco se especifican el volumen ni la composición de datos más allá de la demostración única. Como innovación destacable, el autor introduce una transformación virtual de yaw que el controlador del robot debe invertir en tiempo de ejecución (`Δxyz_real = Rz(+30) Δxyz_virtual`, con estado `q0_real - 30°`), lo que permite reutilizar la demostración bajo un punto de vista distinto sin recapturar datos.

## Capacidades

- Generación de acciones motoras para la tarea concreta `hang_tape_bottom` a partir de observaciones visuales y estado del robot.
- Aprendizaje one-shot: capacidad de adaptarse a una tarea nueva con una sola demostración real, gracias al fine-tune sobre el VLA base.
- Aplicación de una transformación virtual de yaw (+30°) que el controlador debe invertir para obtener comandos en el marco real.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan modos especiales como thinking mode, visión general, audio u otras modalidades fuera del pipeline robótico.
- No se ha validado ninguna de estas capacidades en robot real (sin evaluación).

## Casos de uso

- Investigación en adaptación few-shot de VLA: sirve como checkpoint de referencia para reproducir la receta `pi05_libero_oneshotft` y comparar el efecto de una sola demostración sobre el modelo base SNUMPR.
- Fusión de checkpoints (model merging): al ser uno de los dos fine-tunes que se combinan en el checkpoint `alpha0p8-hang-tape-bottom`, se usa como componente en experimentos de interpolación de pesos.
- Prototipado de tareas de manipulación con cinta: permite montar un pipeline de inferencia para la tarea `hang_tape_bottom` en laboratorio antes de invertir en captura de datos adicional.
- Estudio de transformaciones virtuales de marco: útil para analizar cómo un cambio de yaw virtual (+30°) afecta a la política aprendida y a la necesidad de invertir la transformación en el controlador.
- Reproducibilidad de experimentos: al incluir `wandb_run.json` y commits concretos de código y receta, facilita la replicación exacta del entrenamiento (semilla 42, hiperparámetros fijados).
- Base para fine-tuning posterior: al conservar la normalización original en los assets, puede reutilizarse como punto de partida para nuevas tareas dentro del mismo entorno SNUMPR.
- Docencia y divulgación: ejemplo didáctico de un pipeline VLA completo, desde la demostración única hasta el checkpoint desplegable, con todas las decisiones de entrenamiento documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real, por lo que no existen métricas de éxito, tasas de finalización ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB con pesos en FP32 y assets; la VRAM necesaria dependerá del tamaño real del modelo, que no se documenta.
- GPU recomendadas: no disponible. Al tratarse de un modelo VLA con pesos FP32, es previsible que requiera GPU de datacenter (A100, H100) para inferencia cómoda, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada. Sin conocer el número de parámetros no puede determinarse si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el pipeline declarado es `robotics` y el código asociado es `Donghyun1228/vla_adaptation`.
- Latencia y throughput: no disponibles.
- Requisito adicional: el controlador del robot debe implementar la inversa de la transformación de yaw virtual (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables. Como referencias del mismo linaje pueden citarse el checkpoint base `snumpr-iclr27-v1/9999` y el checkpoint fusionado `Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030`, pero no se dispone de métricas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sin evaluación en robot real: el autor indica explícitamente que no se ha ejecutado ninguna prueba de despliegue, por lo que el éxito de la política es desconocido.
- Especialización extrema: el modelo solo cubre la tarea `hang_tape_bottom`; no es un modelo de propósito general ni admite instrucciones en lenguaje natural.
- Dependencia de una única demostración: el aprendizaje one-shot puede ser frágil ante variaciones de iluminación, posición de objetos o del propio robot.
- Transformación de yaw obligatoria: si el controlador no aplica correctamente la inversa (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`), las acciones resultarán desalineadas.
- Estado del optimizador ausente: no se incluye `train_state`, lo que impide reanudar el entrenamiento exactamente desde el paso 999.
- Idiomas no aplicables: al no ser un modelo de lenguaje, no procede evaluar sesgos lingüísticos, pero tampoco ofrece interfaz conversacional.
- Riesgo de alucinación: no aplica en el sentido textual; el riesgo equivalente es la generación de trayectorias inválidas fuera de la distribución de la demostración.
- Licencia Apache 2.0: permite uso comercial con atribución y aviso de cambios, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-10-30): conviene verificar la integridad y procedencia de los artefactos antes de usarlos en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-hang-tape-bottom-20261030
- Checkpoint fusionado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `248126e`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), receta `pi05_libero_oneshotft`
- Modelo base: `snumpr-iclr27-v1/9999`
- Paper, blog o demo: no disponible en la información proporcionada.
