# OpenRAL/rskill-smolvla-sawyer-metaworld-bf16

## Resumen

rskill-smolvla-sawyer-metaworld-bf16 es un paquete rSkill de OpenRAL que empaqueta un ajuste fino del modelo SmolVLA (aproximadamente 450 millones de parametros) sobre el benchmark MetaWorld MT50, compuesto por 50 tareas de manipulacion robotica ejecutadas sobre un brazo Rethink Sawyer en simulacion MuJoCo a traves de la libreria lerobot. El modelo base es `lerobot/smolvla_base` y el checkpoint ajustado es `lerobot/smolvla_metaworld`, ambos bajo licencia Apache-2.0. El paquete anade un manifiesto `rskill.yaml` con presupuestos de latencia, requisitos de sensores y resultados de evaluacion reproducibles.

SmolVLA es un modelo vision-lenguaje-accion (VLA) disenado para ser eficiente en inferencia y ejecutable en hardware modesto, descrito en el paper arXiv:2506.01844. Este checkpoint concreto es multitarea: un unico conjunto de pesos cubre toda la familia de tareas MetaWorld, de modo que el manifiesto lo habilita mediante la entrada de familia `evaluated_tasks: ["metaworld"]`, que cubre cualquier identificador `metaworld/<task>-v3`.

Su relevancia actual radica en que estandariza el despliegue de politicas VLA como artefactos instalables (al estilo de un modelo de lenguaje) con evaluacion reproducible incluida: el autor reporta 15 de 50 tareas resueltas en MT50 con un protocolo de 1 episodio y semilla 0, con una latencia objetivo de 150 ms por chunk de accion y dtype bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA); detalles internos de capas no disponibles |
| Parametros totales | ~450 M (0,45 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de accion robotica, no de texto) |
| Tipos de cuantizacion | bf16 (checkpoint publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | en (segun metadatos del modelo) |
| Licencia | Apache-2.0 (pesos y paquete rSkill); uso comercial permitido |
| Formato de pesos | no disponible de forma explicita; runtime PyTorch, pesos referenciados via `hf://lerobot/smolvla_metaworld` |

## Arquitectura y entrenamiento

El modelo es un VLA basado en SmolVLA, una arquitectura que combina un codificador visual y un modelo de lenguaje pequeno con una cabeza de generacion de acciones, orientada a eficiencia computacional. La informacion disponible no detalla el numero de capas, la dimension oculta ni el mecanismo exacto de fusion vision-lenguaje-accion, por lo que esos datos deben considerarse no disponibles. La entrada sensorial es una unica imagen RGB (`observation.images.camera1`, minimo 224x224, mapeada desde la camara de esquina `corner2` de MetaWorld a 480x480 nativos) junto con un estado de propriocepcion de 4 dimensiones.

El ajuste fino se realizo sobre el dataset `lerobot/metaworld_mt50`, que contiene demostraciones de las 50 tareas de manipulacion del benchmark MetaWorld sobre el brazo Rethink Sawyer. No se especifican en la informacion proporcionada el numero de tokens o transiciones de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (poco habituales en modelos de accion). El checkpoint es multitarea y esta verificado contra el checkpoint de lerobot en cuanto al contrato de estado de 4 dimensiones, la unica entrada RGB y las estadisticas de normalizacion; el autor senala que no se aplica ningun volteo de imagen porque `MetaworldEnv` de lerobot ya corrige la inversion de 180 grados de la camara de esquina.

## Capacidades

- Generacion de acciones de manipulacion robotica multitarea: un unico conjunto de pesos resuelve las 50 tareas de MetaWorld MT50 (y, por extension, las 10 de MT10) sobre un brazo Sawyer simulado.
- Percepcion visual: consume una imagen RGB de camara de esquina a partir de 224x224.
- Propriocepcion: integra un estado de 4 dimensiones del robot.
- Control por chunks de accion con presupuesto de latencia de 150 ms por chunk.
- Ejecucion en simulacion MuJoCo mediante lerobot (`MetaworldEnv`).
- Integracion con el ecosistema OpenRAL: instalacion como artefacto (`openral rskill install`), ejecucion de escenas de demo (`openral benchmark scene`) y suites completas (`openral benchmark run --suite metaworld_mt10|metaworld_mt50`).
- No se documentan capacidades de tool calling, agentes multi-paso, dialogo multilingue ni modos de razonamiento explicito; el modelo esta especializado en control motor.

## Casos de uso

- Evaluacion reproducible de politicas VLA: usar `openral benchmark run --suite metaworld_mt50 --rskill rskills/smolvla-metaworld` para generar `eval/metaworld_mt50.json` con `reproduced_locally=true` y comparar contra la linea base de 15/50 tareas resueltas.
- Prototipado de manipulacion multitarea en simulacion: emplear el checkpoint como politica de referencia para las 50 tareas de MetaWorld sin reentrenar, gracias a su naturaleza multitarea.
- Pruebas de integracion de pipelines de robotica: validar contratos de sensores (imagen RGB 224x224 y estado de 4 dimensiones) y de normalizacion antes de portar la politica a otro embodiment.
- Demos acotadas de tareas individuales: ejecutar las cinco escenas de `scenes/benchmark/` (push, pick_place, button_press, door_open, drawer_open) con horizonte de 500 pasos y 50 episodios para presentaciones o validacion rapida.
- Investigacion en eficiencia de VLA: usar el modelo de ~450 M parametros como punto de partida para estudiar compromisos entre latencia (150 ms/chunk) y tasa de exito en tareas de dificultad creciente.
- Formacion y docencia en robotica: ilustrar el ciclo completo percepcion-accion con un modelo pequeno y licencia permisiva, ejecutable en hardware asequible.
- Base para ajuste fino adicional: al estar bajo Apache-2.0 y con pesos accesibles via `hf://lerobot/smolvla_metaworld`, sirve como inicializacion para nuevas tareas de manipulacion.

## Benchmarks y rendimiento

| Suite | Tareas | Protocolo | Resultado |
|---|---|---|---|
| MetaWorld MT50 | 50 | 1 episodio / semilla 0 / `max_steps=200` | 15/50 resueltas, media 0,30 |

Tareas resueltas con tasa de exito 1,0 en semilla 0: `assembly-v3`, `button-press-topdown-v3`, `button-press-v3`, `coffee-button-v3`, `door-close-v3`, `door-lock-v3`, `drawer-close-v3`, `faucet-close-v3`, `handle-press-side-v3`, `handle-press-v3`, `pick-place-v3`, `pick-place-wall-v3`, `plate-slide-back-side-v3`, `plate-slide-side-v3`, `push-v3`.

El propio autor advierte que estas cifras de un episodio y semilla 0 son un "smoke test" barato del conjunto principal y no una afirmacion equivalente a la del paper; el exito por tarea en las tareas dificiles es sensible a la semilla. Para una cifra equiparable al protocolo del paper (50 goals por tarea) seria necesario aumentar `n_episodes`. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, dado que el modelo no es de texto.

## Requisitos de hardware

- VRAM estimada: no disponible (`min_vram_gb: null` en el manifiesto). Con ~450 M parametros en bf16, el peso de los parametros ronda 0,9 GB, pero el consumo real depende del codificador visual y del entorno de simulacion, no cuantificado en la informacion.
- GPU recomendadas: no especificadas por el autor.
- Cabe en GPU de consumo: probable por tamano (el modelo base SmolVLA se disena para eficiencia), pero no confirmado en la informacion disponible.
- Despliegue: runtime PyTorch con dtype bf16, a traves de la libreria lerobot y del cargador `openral_rskill.loader.rSkill`; el entorno de evaluacion usa MuJoCo mediante `MetaworldEnv`.
- Latencia: presupuesto de 150 ms por chunk de accion (`latency_budget.per_chunk_ms`). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| rskill-smolvla-sawyer-metaworld-bf16 | ~450 M | MetaWorld MT50 (Sawyer, simulacion) | Apache-2.0 | Hugging Face (OpenRAL) |
| lerobot/smolvla_metaworld | ~450 M | MetaWorld MT50 (checkpoint de origen) | Apache-2.0 | Hugging Face (lerobot) |
| rskill-smolvla-franka_panda-libero_spatial-bf16 | no disponible | LIBERO spatial (Franka Panda) | Apache-2.0 (segun tag del ecosistema) | Hugging Face (OpenRAL) |
| lerobot/smolvla_base | ~450 M | Modelo base previo al ajuste fino | Apache-2.0 | Hugging Face (lerobot) |

Las alternativas comparadas pertenecen a la misma familia SmolVLA; no se dispone en la informacion proporcionada de datos de rendimiento de otros VLA (por ejemplo, pi0, OpenVLA o RT-2) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Especificidad de embodiment: solo es valido para Rethink Sawyer en simulacion MetaWorld; los tags `libero` y `so100_follower` se excluyen deliberadamente porque la distribucion de tareas y la configuracion de camara difieren.
- Entorno simulado: entrenado y evaluado en MuJoCo; no hay evidencia en la informacion disponible de transferencia a un Sawyer fisico (gap sim-a-real no cuantificado).
- Resultados fragiles: la cifra de 15/50 corresponde a 1 episodio y semilla 0; el propio autor indica sensibilidad a la semilla en tareas dificiles.
- Entrada sensorial rigida: una unica camara RGB (`camera1`) y estado de 4 dimensiones; no admite configuraciones alternativas sin adaptacion.
- Idioma: metadatos limitados a ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones erroneas o inseguras fuera de la distribucion de entrenamiento; requiere supervision en cualquier despliegue real.
- Sesgos: no documentados en la informacion disponible; al entrenarse solo con demostraciones de MetaWorld, el modelo puede degradarse ante variaciones de iluminacion, camara u objetos no vistas.
- Licencia: Apache-2.0 tanto en pesos como en paquete, con `is_commercial_use_allowed: true`; no obstante, la ausencia de validacion en hardware real limita su uso comercial directo sin evaluacion adicional.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; version 0.1.0 del manifiesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-smolvla-sawyer-metaworld-bf16
- Repositorio OpenRAL: https://github.com/OpenRAL/openral
- Checkpoint de origen: https://huggingface.co/lerobot/smolvla_metaworld
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/metaworld_mt50
- Benchmark MetaWorld: https://meta-world.github.io/
