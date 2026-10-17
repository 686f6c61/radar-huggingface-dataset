# aakashv100/act_so101_pick_place_positions

## Resumen

ACT SO-101 pick-and-place, taped positions 1-10 es una politica de robotica (policy) basada en la arquitectura Action Chunking Transformer (ACT) y entrenada desde cero por el usuario aakashv100. El modelo resuelve una tarea concreta de manipulacion: coger y colocar objetos ("pick-and-place") con un brazo robotico de bajo coste SO-101, partiendo de diez posiciones objetivo marcadas con cinta ("taped positions 1-10") y depositando la pieza en una caja. No es un modelo de lenguaje: es un controlador de imitacion que mapea observaciones visuales y de estado del robot a secuencias de acciones motoras.

El entrenamiento se realizo sobre el dataset `aakashv100/so101-pick-place-positions`, compuesto por 50 demostraciones (10 posiciones x 5 episodios), todas ellas usadas para entrenar sin conjunto de retencion (no holdout). La politica tiene 51.668.614 parametros y se distribuye en formato safetensors a traves de la libreria LeRobot. El checkpoint publicado corresponde al paso 030000, con checkpoints intermedios en `checkpoints/010000` a `checkpoints/025000`.

Su relevancia es practica: sirve como referencia reproducible para la comunidad de robotica de bajo coste (ecosistema LeRobot / SO-101), ya que documenta pasos, batch, chunk, semilla y perdida final, y permite reproducir o extender un flujo completo de clonacion de comportamiento. Al estar bajo licencia Apache-2.0 y con pesos abiertos, puede reutilizarse y afinarse libremente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con encoder CVAE para imitacion |
| Parametros totales | 51.668.614 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; chunk de acciones = 100, n_obs_steps no especificado en la model card |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (politica de robotica, no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking Transformer), un metodo de aprendizaje por imitacion que combina un transformer con un autoencoder variacional condicional (CVAE) para predecir "chunks" de acciones en lugar de acciones individuales. Esta formulacion reduce el problema de error de composicion y suaviza la politica. En este caso el chunk de acciones es de 100 pasos. La entrada del modelo combina observaciones visuales de dos camaras y el estado proprioceptivo del brazo SO-101; la model card no detalla la configuracion exacta de la capa de entrada ni del backbone visual.

El entrenamiento se hizo desde cero con los siguientes hiperparametros declarados: 30.000 pasos, batch de 8, semilla 1000, 50 episodios (todas las demostraciones del dataset, sin holdout) y una perdida final de entrenamiento de 0,111. Se trata de un reentrenamiento ("retrain2", job `act_so101_pick_place_positions_retrain2`, 2026-10-16) del checkpoint fijado en `docs/eval_protocol.md`, ya que el checkpoint original 030000 se perdio; se mantuvieron los mismos datos y el mismo numero de pasos. No se documenta uso de RLHF, DPO ni tecnicas de refinamiento posteriores.

## Capacidades

- Manipulacion robotica pick-and-place: coger objetos desde diez posiciones marcadas y depositarlos en una caja.
- Control de brazo SO-101 (robot de bajo coste del ecosistema LeRobot).
- Politica de imitacion (clonacion de comportamiento) entrenada a partir de demostraciones teleoperadas.
- Percepcion multimodal limitada: dos camaras (`gripper_cam` y `top_cam`, 640x480 a 30 fps) mas estado del robot.
- Salida de chunks de 100 acciones para control de movimiento.
- Integracion nativa con LeRobot mediante `--policy.path=aakashv100/act_so101_pick_place_positions`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso simbolico ni planificacion de alto nivel.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de vision-lenguaje, modo "thinking", audio ni otras capacidades generativas.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo puede ejecutar ciclos de recogida y colocacion en una caja desde las diez posiciones marcadas, sustituyendo la teleoperacion manual en tareas repetitivas de banco.
- Base para fine-tuning de nuevas posiciones: al ser un checkpoint ACT con datos y pasos documentados, sirve como punto de partida para reentrenar con posiciones adicionales o geometrias distintas de objeto.
- Referencia reproducible para investigacion en imitacion: permite replicar un experimento completo (30.000 pasos, batch 8, semilla 1000, chunk 100) y comparar variantes de hiperparametros.
- Banco de pruebas del pipeline LeRobot: util para validar la carga de politicas, la lectura de camaras a 640x480/30 fps y la ejecucion de rollouts en SO-101.
- Docencia y formacion en robotica de bajo coste: sirve para que estudiantes vean de extremo a extremo como se entrena y despliega una politica ACT con datos propios.
- Evaluacion comparativa de metodos de clonacion de comportamiento: el checkpoint puede usarse como linea base ACT frente a otras politicas (por ejemplo, Diffusion Policy) en la misma tarea y hardware.
- Demostraciones de integracion hardware-software: probar el bucle completo de percepcion (dos camaras), inferencia de politica y actuacion sobre el brazo en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada es la perdida final de entrenamiento (0,111) tras 30.000 pasos, que no equivale a una tasa de exito. La model card no incluye evaluaciones en entorno real (por ejemplo, porcentaje de pick-and-place correctos) ni comparaciones con otras politicas.

| Metrica | Valor |
|---|---|
| Perdida final de entrenamiento | 0,111 |
| Pasos de entrenamiento | 30.000 |
| Batch | 8 |
| Chunk de acciones | 100 |
| Semilla | 1000 |
| Tasa de exito en tarea | no disponible |
| Benchmarks publicos (MMLU, HumanEval, etc.) | no aplica (modelo de robotica) |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,7 M de parametros, los pesos ocupan aproximadamente 207 MB en fp32 y unos 104 MB en fp16, mas el backbone visual y las activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.). No se requiere A100 ni H100.
- Compatibilidad con GPU consumer: si, el modelo cabe holgadamente en cualquier GPU consumer e incluso puede ejecutarse en CPU para pruebas de baja frecuencia.
- Consideracion adicional: al ejecutarse en un robot SO-101, parte del coste computacional reside en la captura y preprocesado de dos camaras a 640x480 y 30 fps.
- Opciones de despliegue: LeRobot (carga via `--policy.path=aakashv100/act_so101_pick_place_positions`), con posibilidad de exportacion a otros formatos segun soporte de la libreria. vLLM, llama.cpp o TGI no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos numericos comparables en la informacion proporcionada. La categoria equivalente la forman otras politicas de imitacion para brazos de bajo coste, como variantes de ACT entrenadas sobre otros datasets y enfoques de Diffusion Policy, pero la model card no ofrece cifras de rendimiento que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto / chunk | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_pick_place_positions | 51.668.614 | chunk 100 | no disponible | Apache-2.0 | HuggingFace |
| Otras politicas ACT para SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sobreajuste a la tarea: entrenado especificamente para pick-and-place en diez posiciones marcadas con cinta; no generaliza a otras tareas, objetos ni disposiciones del entorno.
- Sin conjunto de retencion: las 50 demostraciones se usaron integramente para entrenamiento, por lo que no hay una medida de generalizacion fuera de la distribucion de entrenamiento.
- Dependencia del montaje fisico: cambios en la iluminacion, en la posicion de las camaras (`gripper_cam`, `top_cam`), en el tipo de objeto o en la ubicacion de las marcas pueden degradar el comportamiento.
- Perdida de entrenamiento no concluyente: una perdida final de 0,111 no garantiza una tasa de exito alta en el robot real; no se publican evaluaciones en entorno fisico.
- Reproducibilidad parcial: el checkpoint original 030000 se perdio y el publicado es un reentrenamiento, por lo que pueden existir diferencias respecto al resultado referenciado en `docs/eval_protocol.md`.
- Sesgos: no aplicables en el sentido de sesgos linguisticos; el modelo no procesa lenguaje. Si puede heredar los sesgos de las demostraciones humanas (por ejemplo, trayectorias y agarres concretos).
- Riesgo de fallo fisico: en produccion, un fallo de la politica puede provocar colisiones o danos en el brazo o en el objeto; se recomienda supervisar y aplicar limites de seguridad.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de idoneidad para produccion.
- Idiomas: no aplica; el modelo no tiene capacidades de texto ni multilingues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aakashv100/act_so101_pick_place_positions
- Dataset de entrenamiento: https://huggingface.co/datasets/aakashv100/so101-pick-place-positions
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/aakashvardhan-madabhushi-san-jose-state-university/so101-act/runs/lup7vvit
- Repositorio de LeRobot (libreria de carga): https://github.com/huggingface/lerobot
