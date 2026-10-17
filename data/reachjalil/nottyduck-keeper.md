# reachjalil/nottyduck-keeper

## Resumen

NottyDuck keeper v1 es una política de control por aprendizaje por refuerzo (reinforcement learning) que actúa como cerebro de portero para el robot bípedo MicroDuck, un robot de 25 cm de altura con 14 servos. Lo desarrolla reachjalil para NottyDuck Labs, concretamente para la Test Chamber 02 · Keeper, y es el cerebro por defecto de esa cámara de simulación: al abrir la página, se dispara un balón y el portero observa la trayectoria y se desplaza o se lanza en su línea de meta. No es un modelo de lenguaje, sino una política neuronal exportada a ONNX que mapea un vector de observación de 61 dimensiones a 14 consignas de servo.

Técnicamente es un actor-critic entrenado con PPO mediante la librería rsl_rl sobre el simulador mjlab 1.3.0 (MuJoCo Warp), con el modelo de actuador BAM XL330, aleatorización de dominio y ruido y retardos en las observaciones. El entrenamiento usó 4096 entornos en paralelo durante 900 iteraciones de PPO (unos 88 millones de pasos de entorno) en una única RTX 4090, en aproximadamente 35 minutos, y la política final se seleccionó entre 8 ejecuciones paralelas (2 recetas × 4 semillas).

Su relevancia es doble: por un lado sirve como referencia base y línea de comparación para investigar políticas de portero en robótica bípeda simulada; por otro, demuestra un flujo completo de exportación y despliegue de una política RL entrenada en mjlab hacia ONNX con el normalizador incorporado, ejecutable incluso dentro del navegador mediante MuJoCo. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y la licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control RL exportada a ONNX (actor-critic PPO); topología interna de capas no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica; entrada fija de 61 valores por paso de control |
| Tipos de cuantización | no disponible (se distribuye un único fichero ONNX con el normalizador incorporado) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`nottyduck-keeper-v1.onnx`) y checkpoint PyTorch (`checkpoint/model_900.pt`) |

Datos adicionales de contrato:

| Parámetro | Valor |
|---|---|
| Entrada (`obs`) | float [1, 61] = propiocepción estándar de MicroDuck (48) + bloque de comando de 13D |
| Salida (`actions`) | float [1, 14] = desplazamientos articulares respecto a la pose de pie, uno por servo |
| Frecuencia de control | 50 Hz |
| Filtro de acción | none (ninguno) |
| Metadatos ONNX | `task_id=Mjlab-Keeper-NottyDuck`, `observation_normalizer=baked`, `control_frequency_hz=50`, `action_filter=none` |
| Tamaño del repo | 0.0 GB (según HuggingFace) |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

La política sigue el esquema actor-critic que emplea rsl_rl con PPO. La red recibe un vector de observación de 61 dimensiones compuesto por la propiocepción estándar del MicroDuck (48 valores) más un bloque de comando de 13D. Dentro de ese bloque, el hueco de comando corporal de 6D transporta la posición y la velocidad del balón en el sistema de guiñada del tronco (término `keeper_ball_obs`); los huecos de twist y de cabeza se fijan a cero. La salida son 14 desplazamientos articulares respecto a la pose de pie, uno por servo, a 50 Hz y sin filtro de acción. El normalizador de observaciones va incorporado en el propio grafo ONNX.

El entrenamiento se realizó sobre la tarea `Mjlab-Keeper-NottyDuck` (fichero `nottyduck_keeper_env_cfg.py` del repositorio reachjalil/nottyduck, commit `6f55745`), con mjlab 1.3.0 (MuJoCo Warp), el modelo de actuador BAM XL330, aleatorización de dominio y ruido y retardos en las observaciones. El algoritmo fue PPO (rsl_rl) con 4096 entornos durante 900 iteraciones, lo que supone unos 88 millones de pasos de entorno, con semilla 1, en una NVIDIA RTX 4090 y en aproximadamente 35 minutos. La receta de entrenamiento (`recipe.json`) especifica disparos firmes (0,9–1,8 m/s), reparto hacia las esquinas (hasta ±24 cm sobre una boca de 52 cm), lanzamientos permitidos, bloqueo, permanencia en el suelo y suavidad media. La política final se seleccionó entre 8 ejecuciones paralelas (2 recetas × 4 semillas). No se documenta en la información proporcionada el uso de RLHF, DPO ni innovaciones de atención; se trata de una política de control, no de un modelo generativo de secuencias.

## Capacidades

- Control de portero: a partir de la posición y la velocidad del balón, decide desplazarse o lanzarse para interceptar dentro de su línea de meta.
- Seguimiento del balón en el sistema de referencia del tronco (hueco de comando de 6D con `body_command_term=keeper_ball_obs`).
- Salida de consignas articulares directas para 14 servos a 50 Hz, lista para ser consumida por el lazo de control.
- Normalización de observaciones integrada, de modo que el ONNX acepta la observación en crudo.
- Ejecución en navegador dentro de la propia cámara (MuJoCo en el cliente), sin subida de datos.
- Reutilizable como punto de partida para fine-tuning mediante reanudación del checkpoint (por ejemplo, para añadir la conducta de levantarse tras el lanzamiento).
- No dispone de tool calling, function calling, capacidades de agente multi-paso, multilingualidad ni modos de razonamiento tipo thinking: es una política de control de tiempo real.
- No se han declarado capacidades de visión ni de audio: el modelo solo consume el vector de observación descrito.

## Casos de uso

- Línea base de portero en simulación: sirve como referencia contra la que comparar nuevas políticas de portero en la Test Chamber 02 · Keeper, dado que ya supera a la postura de pie por defecto (36/36 paradas frente a 0/48).
- Investigación sobre conductas de lanzamiento y recuperación: partiendo del checkpoint `model_900.pt` se puede reanudar el entrenamiento con una receta distinta (por ejemplo, `"recover":"rise"`) para estudiar cómo se aprende a levantarse tras caer al suelo.
- Estudio de aleatorización de dominio y robustez: al haberse entrenado con ruido y retardos en las observaciones, es un candidato para medir cómo afectan estas perturbaciones a la tasa de paradas.
- Evaluación de transferencia sim-a-sim: permite comprobar la degradación de una política entrenada con el modelo de actuador BAM cuando se ejecuta con los servos de posición del juego en el navegador.
- Plantilla de despliegue de políticas RL en ONNX: demuestra el flujo completo de exportación con normalizador incorporado y carga en `onnxruntime` (incluido el navegador), útil para equipos que necesiten un ejemplo reproducible a 50 Hz.
- Pruebas de canal de percepción para hardware real: como el propio modelo solo consume la posición y velocidad del balón, sirve para validar la integración con un rastreador de balón antes de pasar a un robot físico.
- Formación y demostraciones docentes: el flujo de receta, entrenamiento, exportación y comparación en la cámara es un caso didáctico cerrado de RL aplicado a robótica bípeda.

## Benchmarks y rendimiento

Se dispone de la evaluación publicada por el autor en la cámara del navegador (fecha indicada 2026-10-16). Cada ronda dispara 12 tiros estándar: ±7 cm y ±20 cm a 0,9, 1,4 y 1,9 m/s, con un desplazamiento aleatorio del lanzador de ±3 cm, ±5 cm y ±4 % entre rondas. Ambas políticas se enfrentan a rondas idénticas.

| Cerebro | Paradas | Goles encajados | Cayó al suelo |
|---|---|---|---|
| Postura de pie (walker suministrado, de pie) | 0 / 48 | 48 | 0 / 48 |
| NottyDuck keeper v1 | 36 / 36 | 0 | 33 / 36 |

Advertencias sobre estos resultados: la medición se hizo en MuJoCo dentro del navegador, que utiliza los servos de posición del juego y no el modelo de motor BAM del entrenamiento. Son mediciones de la cámara, no evidencia sobre hardware. El portero suele irse al suelo para hacer la parada, porque la receta permitía lanzamientos y no recompensaba levantarse. No se han publicado más resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia: la política es una red de 61 entradas y 14 salidas de tamaño muy reducido (el repositorio reporta 0,0 GB), por lo que no plantea requisitos significativos de VRAM; cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas para ejecución: cualquiera, dado el tamaño; no se especifican requisitos mínimos en la información disponible.
- Cabe en GPU consumer: sí, sin restricción práctica (RTX 4090, e incluso GPUs integradas para inferencia puntual).
- CPU: es viable; la propia documentación recomienda comprobar el setup de entrenamiento en CPU con `--env.scene.num-envs 64 --gpu-ids None --agent.max-iterations 5`.
- Opciones de despliegue: `onnxruntime` (escritorio) y MuJoCo en navegador (la cámara carga el ONNX en el dispositivo del usuario). Para el reentrenamiento se usa `uv run train` sobre el stack mjlab + rsl_rl.
- Entrenamiento: la ejecución original se hizo con 4096 entornos en una única NVIDIA RTX 4090, 900 iteraciones de PPO, unos 88 millones de pasos de entorno y aproximadamente 35 minutos.
- Latencia y throughput de inferencia: no se han publicado cifras; el contrato fija una frecuencia de control de 50 Hz.

## Comparativa con modelos similares

No se conocen en la información proporcionada modelos comparables de terceros de la misma categoría (políticas de portero para robots bípedos de 14 servos). La única comparación disponible es interna a la propia cámara:

| Cerebro | Naturaleza | Origen | Paradas (48 tiros) | Licencia |
|---|---|---|---|---|
| Postura de pie (walker suministrado) | Política de marcha en posición estática | Pollen Robotics | 0 / 48 | Apache-2.0 (según avisos de terceros del repositorio) |
| NottyDuck keeper v1 | Política de portero entrenada con PPO | reachjalil / NottyDuck Labs | 36 / 36 | Apache-2.0 |

Modelos alternativos de la misma categoría: no disponible.

## Limitaciones y advertencias

- Política entrenada y evaluada exclusivamente en simulación; no está validada sobre hardware.
- Para funcionar en un robot real necesitaría un rastreador de balón que alimentara su entrada de posición y velocidad del balón.
- La evaluación en el navegador usa los servos de posición del juego, no el modelo de motor BAM con el que se entrenó; existe una discrepancia entre simulación de entrenamiento y simulación de evaluación.
- El portero cae al suelo para hacer la mayoría de las paradas (33 de 36) y la receta no recompensaba levantarse, por lo que no recupera la postura de pie de forma aprendida.
- El hueco de comando de twist y de cabeza está fijado a cero, lo que limita los grados de libertad de control disponibles.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de generalización fuera de la distribución entrenada (recetas de tiro distintas a las de la receta original).
- No hay idiomas soportados ni capacidades multilingües (no es un modelo de lenguaje).
- Sesgos conocidos: no se han declarado sesgos específicos en la información disponible.
- Licencia Apache-2.0, que permite uso comercial; sin embargo, el modelo del robot MicroDuck y la política de marcha suministrada son obra de Pollen Robotics y se acreditan en `THIRD_PARTY_NOTICES.md`, por lo que conviene revisar esas condiciones antes de reutilizarlos.
- Repositorio sin descargas ni likes y con tamaño declarado de 0,0 GB, lo que sugiere una publicación reciente y sin adopción todavía.
- Las cifras de rendimiento (36/36 paradas) proceden de la propia cámara del autor y no de una evaluación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reachjalil/nottyduck-keeper
- Cámara de la Test Chamber 02 · Keeper: https://nottyduck.com/labs/keeper
- Comparación en la cámara: https://nottyduck.com/labs/keeper#compare
- Repositorio del proyecto: https://github.com/reachjalil/nottyduck
- Tarea de entrenamiento: `src/mjlab_microduck/tasks/nottyduck_keeper_env_cfg.py` (commit `6f55745`) dentro del repositorio anterior
- Descarga directa mediante CLI: `hf download reachjalil/nottyduck-keeper --local-dir nottyduck-keeper`
- Otros enlaces (paper, blog, demo independiente): no disponible
