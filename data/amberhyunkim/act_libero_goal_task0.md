# AmberHyunKIM/act_libero_goal_task0

## Resumen

El modelo `AmberHyunKIM/act_libero_goal_task0` es una política robótica de tarea única entrenada con la arquitectura ACT (Action Chunking Transformer) mediante la librería LeRobot de HuggingFace. Lo publica el usuario AmberHyunKIM y resuelve una única tarea del benchmark de simulación LIBERO: abrir el cajón central de un mueble (`libero_goal`, índice de tarea 0, equivalente a `task_index=19` en el dataset `lerobot/libero`). No es un modelo de lenguaje ni un modelo de propósito general: es un controlador visuomotor que mapea observaciones (imágenes y estado propioceptivo) a secuencias de acciones del robot.

El modelo tiene 51.671.687 parámetros (unos 51,6 millones, aproximadamente 0,05 B) y se distribuye en formato safetensors bajo licencia Apache 2.0, con un tamaño de repositorio de 0,2 GB. Se entrenó durante 100.000 pasos con batch size 8 sobre 43 episodios de esa única tarea, en una sola GPU RTX 5070 Ti de 16 GB y en 57 minutos de reloj de pared.

Su relevancia es doble. Por un lado, sirve como referencia de eficiencia: consigue un 100,0 % de tasa de éxito en la tarea con un pico de VRAM de 1283 MiB, frente a los 1975 MiB de SmolVLA (0,5 B) y los 13541 MiB de MolmoAct2 (5 B) medidos bajo el mismo protocolo. Por otro, ilustra con claridad la diferencia entre una política de tarea única (no condicionada por lenguaje) y un modelo visión-lenguaje-acción: evaluada zero-shot en la tarea vecina `libero_goal` task 1 obtiene un 0,0 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con CVAE para imitación |
| Parametros totales | 51.671.687 (aprox. 51,6 M, 0,05 B) |
| Longitud de contexto | no aplica (política visuomotora; sin ventana de contexto textual). Chunk de acciones configurado a `n_action_steps=10` en la evaluación |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible / no aplica (modelo no condicionado por lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | `lerobot/libero`, 43 episodios de una sola tarea |
| Tarea | `open the middle drawer of the cabinet` (`libero_goal`, task index 0) |
| Tamano del repositorio | 0,2 GB |
| Region | us |
| Fecha de publicacion (segun HuggingFace) | 2026-09-23 |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una política de imitación basada en transformer que predice bloques de acciones futuras (action chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La formulación original de ACT, asociada al proyecto ALOHA, incorpora un autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas y un transformer encoder-decoder que consume observaciones visuales y estado propioceptivo del robot. En esta implementación concreta, vía LeRobot, el modelo se evalúa con `n_action_steps=10`, es decir, ejecutando chunks de hasta 10 acciones antes de volver a inferir.

El entrenamiento se realizó sobre 43 episodios de una única tarea del dataset `lerobot/libero`, durante 100.000 pasos con batch size 8, en 1× RTX 5070 Ti (16 GB), con un tiempo total de 57 minutos. No se indica en la información disponible si hubo fases de RLHF, DPO u otro ajuste posterior; al tratarse de una política de imitación supervisada, no se documenta tal cosa. Tampoco se detalla la composición exacta del dataset más allá de los 43 episodios ni la resolución de las observaciones.

La innovación destacable en este checkpoint no es arquitectónica, sino de eficiencia y de protocolo: un modelo de 0,05 B alcanza el 100,0 % de éxito en la tarea y se evalúa en 2,7 segundos por episodio con un pico de 1283 MiB de VRAM, sirviendo como punto de comparación reproducible frente a políticas VLA mucho mayores bajo el mismo entorno (`lerobot-eval`, `libero_goal` task 0, semilla 1000, 10 episodios).

## Capacidades

- Generación de acciones de manipulación robótica en simulación: produce chunks de acciones a partir de observaciones visuales y estado propioceptivo del robot.
- Ejecución de una única tarea: abrir el cajón central del mueble en `libero_goal`, task index 0.
- Alto rendimiento en esa tarea concreta: 100,0 % de tasa de éxito en 10 episodios con semilla 1000 y `n_action_steps=10`.
- Eficiencia de cómputo: 1283 MiB de VRAM en pico y 2,7 segundos por episodio en el protocolo de evaluación documentado.
- Punto de partida para reentrenamiento: la model card indica explícitamente que se debe entrenar una política separada por tarea.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües ni condicionamiento por instrucciones en lenguaje natural (ACT no está condicionado por lenguaje).
- Sin capacidades de generación de texto, código, matemáticas, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Referencia de evaluación para implementaciones de ACT: usar este checkpoint como punto de comparación reproducible en `libero_goal` task 0 (semilla 1000, 10 episodios, `n_action_steps=10`) al validar una reimplementación propia de la arquitectura o del pipeline de LeRobot.
- Baseline frente a modelos VLA en investigación: comparar el coste y el rendimiento de una política de 0,05 B (1283 MiB de VRAM, 100,0 % de éxito) con alternativas como SmolVLA (0,5 B, 1975 MiB) o MolmoAct2 (5 B, 13541 MiB) bajo el mismo entorno y protocolo.
- Inicialización para nuevas políticas de tarea única: partir de estos pesos y reentrenar sobre episodios de otra tarea concreta, dado que el autor documenta que se necesitan políticas independientes por tarea y que el rendimiento zero-shot en tareas vecinas es del 0,0 %.
- Validación de pipelines de evaluación en CI: el modelo permite comprobar de forma automática que `lerobot-eval` con MuJoCo (`MUJOCO_GL=egl` en máquina sin cabecera) funciona correctamente, con una latencia de 2,7 s/episodio que hace viable ejecutar suites de evaluación completas.
- Investigación sobre manipulación de objetos articulados: la tarea de abrir un cajón es un ejemplo canónico de interacción con articulaciones, útil para estudiar transferencia, robustez posicional y planificación de contacto en simulación.
- Docencia y divulgación en robótica: sirve para demostrar de forma tangible el flujo completo de LeRobot (dataset, entrenamiento en una GPU de consumo, evaluación en LIBERO) con un coste de entrenamiento de 57 minutos en una RTX 5070 Ti.
- Estudio de destilación y compresión de políticas: al ser ya un modelo de 51,6 M de parámetros con VRAM mínima, es un objeto de estudio adecuado para analizar cuánto se puede reducir manteniendo la tasa de éxito del 100 %.
- Comparación de checkpoints intermedios: el autor publica un checkpoint de 20.000 pasos con 60,0 % de éxito, lo que permite estudiar curvas de aprendizaje y el efecto del número de pasos en el rendimiento final.

## Benchmarks y rendimiento

Resultados publicados por el autor con `lerobot-eval`, `libero_goal` task 0, semilla 1000, 10 episodios, `n_action_steps=10`:

| Checkpoint | Tasa de exito | VRAM pico | Segundos/episodio |
|---|---:|---:|---:|
| 20k pasos | 60,0 % | 1283 MiB | 3,6 |
| 100k pasos (este modelo) | 100,0 % | 1283 MiB | 2,7 |

Comparación de políticas bajo el mismo protocolo y la misma tarea (mediciones del autor):

| Politica | Parametros | Tasa de exito | VRAM pico |
|---|---:|---:|---:|
| ACT (este modelo) | 0,05 B | 100,0 % | 1283 MiB |
| SmolVLA | 0,5 B | 100,0 % | 1975 MiB |
| MolmoAct2 | 5 B | 90,0 % | 13541 MiB |

Evaluación zero-shot fuera de la tarea: `libero_goal` task 1, 0/10 episodios, 0,0 % de éxito.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM en inferencia: 1283 MiB de pico medidos en evaluación con batch size 1 y `n_action_steps=10`. Es la cifra reportada por el autor bajo ese protocolo.
- Tamano de pesos: 51,6 M de parámetros; el repositorio ocupa 0,2 GB, coherente con pesos en fp32 (aproximadamente 207 MB teóricos).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente según la medición de 1283 MiB. Cabe en GPU de consumo como RTX 3050, RTX 3060, RTX 4060, RTX 4090 o superiores. Entrenado originalmente en 1× RTX 5070 Ti (16 GB).
- Cabe en GPU de consumo: sí, holgadamente, según el pico de VRAM reportado.
- Opciones de despliegue: `lerobot-eval` con el entorno LIBERO y MuJoCo. En máquina sin cabecera requiere `MUJOCO_GL=egl`. Comando de referencia:
  ```bash
  lerobot-eval \
    --policy.path=AmberHyunKIM/act_libero_goal_task0 \
    --policy.device=cuda \
    --policy.n_action_steps=10 \
    --env.type=libero --env.task=libero_goal --env.task_ids='[0]' \
    --eval.batch_size=1 --eval.n_episodes=10 --seed=1000
  ```
- Latencia: 2,7 segundos por episodio en el protocolo de evaluación documentado (el autor no especifica la GPU usada para esas mediciones). Throughput en pasos por segundo: no disponible.
- Coste de entrenamiento: 100.000 pasos, batch size 8, 57 minutos en 1× RTX 5070 Ti (16 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tasa de exito (libero_goal task 0) | VRAM pico | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| ACT (este checkpoint) | 0,05 B | Política de imitación de tarea única, no condicionada por lenguaje | 100,0 % | 1283 MiB | apache-2.0 | HuggingFace |
| SmolVLA | 0,5 B | Modelo visión-lenguaje-acción | 100,0 % | 1975 MiB | no disponible | no disponible |
| MolmoAct2 | 5 B | Modelo visión-lenguaje-acción | 90,0 % | 13541 MiB | no disponible | no disponible |

Los datos de SmolVLA y MolmoAct2 proceden de las mediciones de referencia incluidas por el autor en la model card, realizadas bajo el mismo protocolo y en la misma tarea. No se dispone de información sobre su licencia ni su disponibilidad en la información proporcionada. La diferencia principal es cualitativa además de cuantitativa: ACT no está condicionado por lenguaje y solo cubre la tarea entrenada, mientras que los modelos VLA pueden recibir instrucciones en lenguaje natural.

## Limitaciones y advertencias

- No está condicionado por lenguaje. La model card lo indica explícitamente: ACT no acepta instrucciones en lenguaje natural, por lo que solo cubre la tarea con la que fue entrenado.
- Rendimiento cero en tareas vecinas. Evaluado zero-shot en `libero_goal` task 1 obtiene 0,0 % (0/10 episodios). Se requiere entrenar una política independiente por tarea.
- Solo simulación. Los resultados y el protocolo de evaluación corresponden a LIBERO con `lerobot-eval` y MuJoCo. No se documenta validación en hardware real ni transferencia sim-to-real.
- Sesgos conocidos: no disponible. La model card no documenta análisis de sesgos, y al no procesar lenguaje natural ni datos humanos abiertos, no aplican las categorías habituales de sesgo textual.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero sí existe riesgo de fallo silencioso en el control: fuera de la distribución de la tarea entrenada la política puede generar acciones sin sentido sin señalizar incertidumbre.
- Limitaciones de contexto e idioma: no aplica ventana de contexto textual ni soporte de idiomas; el modelo no procesa texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, con las obligaciones habituales de conservar avisos de licencia y atribución. No se documentan cláusulas adicionales.
- Caveats para producción: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, entrenado por un único autor, con una única semilla de evaluación (semilla 1000, 10 episodios) y sin evaluación estadística más amplia. El 100 % de éxito debe interpretarse dentro de ese protocolo concreto.
- Dependencia del entorno: la evaluación exige el entorno LIBERO y MuJoCo, y en máquinas sin cabecera requiere `MUJOCO_GL=egl`. Sin ese entorno el modelo no es utilizable.
- No se documentan la resolución de las observaciones, la composición detallada del dataset más allá de los 43 episodios, ni el proceso exacto de preprocesado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberHyunKIM/act_libero_goal_task0
- Checkpoint de 20.000 pasos: https://huggingface.co/AmberHyunKIM/act_libero_goal_task0_20k
- Proyecto ACT / ALOHA: https://tonyzhaozh.github.io/aloha/
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero
- Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces recuperados trataban sobre la geografía y la historia de Kosovo y no se han utilizado como fuente.
