# fastwalker1118/b1kcheckpoints

## Resumen

El repositorio `fastwalker1118/b1kcheckpoints` contiene checkpoints de fine-tuning de un modelo de política robótica para el benchmark BEHAVIOR-1K, desarrollados por Ran Qi (usuario `fastwalker1118`). Se trata de dos checkpoints de una sola tarea (`task5_human_only_21k` y `task10_taskfinetune`) que parten del meta-checkpoint de 50 tareas `IliaLarchenko/behavior_50t_checkpoint`, y que han sido ajustados exclusivamente con demostraciones humanas del conjunto de retos BEHAVIOR-1K de 2026. Están pensados para evaluación offline: solo contienen los parámetros del modelo, sin `train_state`, por lo que no pueden reanudarse entrenamientos, únicamente usarse para inferencia o evaluación.

La relevancia de este repositorio radica en que ofrece checkpoints especializados en tareas concretas de manipulación robótica (colocar trampas para ratones y montar una estación de café), con una configuración de entrenamiento detallada y reproducible. El tamaño total del repositorio es de 75.8 GB, lo que sugiere modelos de gran escala, aunque la arquitectura exacta no se especifica en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, modelo de acción robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene 75.8 GB, probablemente safetensors o binarios de PyTorch, pero no se indica) |

## Arquitectura y entrenamiento

La documentación no detalla la arquitectura interna del modelo base. Se sabe que el punto de partida es `IliaLarchenko/behavior_50t_checkpoint`, un meta-checkpoint entrenado en 50 tareas de BEHAVIOR-1K, y que los dos checkpoints aquí presentados son fine-tunes de una sola tarea. El entrenamiento se realizó con demostraciones humanas (200 episodios por tarea) del conjunto `2026-challenge-demos-224`, con imágenes de cámaras a 224×224 píxeles y un estado de 23 dimensiones extraído del estado de observación original de 61 dimensiones.

Los detalles de entrenamiento incluyen: para `task5_human_only_21k`, 21 000 pasos de un plan de 30 000 (detenido antes de tiempo), batch de 224 con FSDP en 7 GPU H200, y una tasa de aprendizaje con warmup de 2000 pasos y decaimiento coseno. Para `task10_taskfinetune`, 29 999 pasos completados, batch de 256 con FSDP en 8 GPU H200, y una tasa de aprendizaje plana de 5e-6 sin calentamiento ni decaimiento. En ambos casos se usaron estadísticas de normalización corregidas (`qvelfix`) y el espacio de tareas `B1K_TASK_SPACE=100`, con embeddings de tarea ya preentrenados.

## Capacidades

- Generacion de acciones de control para robot movil con dos brazos y pinzas, a partir de observaciones de camara (cabeza, izquierda y derecha) y estado del robot (velocidad base, posiciones articulares, etc.).
- Prediccion de acciones de 23 dimensiones, donde el tronco y ambos brazos se predicen como deltas relativos al estado actual, mientras que la velocidad base y las pinzas se mantienen en valores absolutos.
- Normalizacion de acciones por marca de tiempo (per-timestamp) sobre un horizonte de 30 pasos, lo que permite manejar variaciones en la escala de las acciones.
- Capacidad de ejecutar tareas especificas de BEHAVIOR-1K: `setting_mousetraps` (colocar trampas para ratones) y `set_up_a_coffee_station_in_your_kitchen` (montar una estacion de cafe en una cocina).
- No se reportan capacidades de lenguaje, vision general, tool calling ni razonamiento simbolico; es un modelo puramente motor para control robotico.

## Casos de uso

- Evaluacion offline de politicas robotica en el benchmark BEHAVIOR-1K: al ser checkpoints de solo parametros, permiten ejecutar rollouts en simulacion para medir la tasa de exito de la tarea sin necesidad de reentrenar.
- Fine-tuning adicional sobre tareas similares: aunque no se puede reanudar el entrenamiento desde estos checkpoints (no incluyen `train_state`), sus parametros pueden usarse como inicializacion para nuevos fine-tunes con otros datos.
- Comparacion de metodos de normalizacion y aumento de datos: el checkpoint `task10_taskfinetune` incluye una advertencia sobre la codificacion de video (x264 vs x265) que permite estudiar el impacto de la calidad de entrada en el rendimiento.
- Desarrollo de sistemas de control robotico para manipulacion de objetos cotidianos: las tareas cubiertas (trampas para ratones, estacion de cafe) son representativas de escenarios domesticos, utiles para investigacion en robotica asistencial.
- Reproduccion de experimentos de aprendizaje por imitacion: los detalles de entrenamiento (LR, batch, datos) estan documentados, lo que facilita replicar el proceso y comparar variantes.
- Analisis de robustez frente a variaciones de codificacion de video: la model card senala diferencias en la nitidez de las imagenes de entrada, lo que permite estudiar la sensibilidad del modelo a artefactos de compresion.

## Benchmarks y rendimiento

Solo se dispone de un resultado de evaluacion por rollout, reportado en la model card para `task10_taskfinetune`:

| Checkpoint | Tasa de exito (20 instancias public_test) | q medio |
|---|---|---|
| `task10_taskfinetune` | 0.0 % | 0.1917 |
| `checkpoint_1` oficial | 5.0 % | 0.1750 |

La diferencia no es estadisticamente significativa (prueba de signos, p = 1.000). Para `task5_human_only_21k` no se ha realizado ninguna evaluacion por rollout; solo se reporta una `action_loss` de entrenamiento de 0.0209 en el paso 21 775, que no es comparable entre tareas ni indicativa de exito.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: se utilizaron 7 GPU H200 (80 GB cada una) para `task5` y 8 GPU H200 para `task10`, con FSDP. Esto da una idea de la escala: el modelo no cabe en una GPU de consumo.
- Inferencia: no se especifican requisitos de VRAM, pero dado el tamaño del repositorio (75.8 GB) y la arquitectura de vision-language-action tipica en BEHAVIOR-1K, se estima que se necesitan al menos 40-80 GB de VRAM para cargar los pesos en precision completa. Con cuantizacion (no disponible) podria reducirse, pero no hay datos.
- GPU recomendadas: NVIDIA H100, A100 80 GB, o similares con gran memoria. No es viable en GPUs de consumo como RTX 4090 (24 GB) sin cuantizacion agresiva, que no esta documentada.
- Opciones de despliegue: al ser un modelo de PyTorch probablemente, se podria servir con vLLM (si soporta este tipo de modelos), pero no hay indicaciones. Lo mas razonable es usar scripts de evaluacion propios en PyTorch con FSDP o DDP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas robotica para BEHAVIOR-1K). El unico punto de referencia es el checkpoint base `IliaLarchenko/behavior_50t_checkpoint` y el checkpoint oficial `checkpoint_1` mencionado en la evaluacion de `task10`. Ambos son del mismo ecosistema, pero no se proporcionan especificaciones detalladas de ellos. Por tanto, no es posible realizar una comparativa exhaustiva.

## Limitaciones y advertencias

- Los checkpoints son de solo inferencia: no incluyen `train_state`, por lo que no se puede reanudar el entrenamiento desde ellos.
- El checkpoint `task5_human_only_21k` esta incompleto (21 000 de 30 000 pasos planeados), lo que puede afectar a su rendimiento final.
- No hay conjunto de validacion ni evaluacion por rollout para `task5`; la `action_loss` reportada es solo de entrenamiento y no indica exito en la tarea.
- La `action_loss` no es comparable entre tareas debido a la variacion en la duracion de los episodios (hasta 6 veces).
- Para `task10`, la tasa de exito en evaluacion es 0.0 % (aunque no significativa frente al 5.0 % del oficial), lo que sugiere que el modelo puede no generalizar bien a instancias no vistas.
- La codificacion de video de los datos de entrenamiento (`x264 crf=20.0`) es mas suave que la de otros conjuntos (`x265 crf=28.0`), lo que podria introducir un sesgo en las caracteristicas visuales aprendidas.
- Un archivo de video fuente tuvo que ser re-codificado por falta de atomo moov, lo que introduce una pequena variacion en los datos.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza la ausencia de sesgos en los datos de demostracion humana.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fastwalker1118/b1kcheckpoints
- Dataset de rollout asociado: https://huggingface.co/datasets/fastwalker1118/B1k_rollout
- Perfil del autor en HuggingFace: https://huggingface.co/fastwalker1118
- Perfil del autor en GitHub: https://github.com/fastwalker1118
- Modelo base: https://huggingface.co/IliaLarchenko/behavior_50t_checkpoint
