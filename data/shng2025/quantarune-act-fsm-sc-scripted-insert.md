# shng2025/quantarune-act-fsm-sc-scripted-insert

## Resumen

Quantarune ACT-FSM SC scripted insert (v1) es una política robótica para inserción de conectores de cable de tipo SC, desarrollada por el usuario shng2025 (Proyecto Automaton) en el marco del Intrinsic AI for Industry Challenge 2026, simulado en Gazebo. No es un modelo de lenguaje: es un sistema de control compuesto por cuatro checkpoints de Action Chunking Transformer (ACT) orquestados mediante una máquina de estados finitos (FSM) con cuatro etapas (APPROACH, ALIGN, GUARDED_INSERT y RETRY_OR_FINISH), complementado por una rutina de inserción scriptada que ejecuta el empuje final del conector en el puerto.

La relevancia del artefacto es metodológica: documenta que el mejor resultado de inserción SC del proyecto se obtuvo combinando aprendizaje por imitación (ACT) para la aproximación y alineación inicial con una inserción scriptada de descenso oscilante a 4 mm/s y 400 N/m, sin lectura de la pose del puerto. El repositorio incluye código de política, scripts de entrenamiento, resultados de 37 ensayos y una memoria técnica de 20 KB, lo que lo convierte en un caso reproducible de integración de políticas ACT en un pipeline de robótica de precisión.

El modelo se distribuye en formato safetensors bajo la librería LeRobot, con un tamaño de repositorio de 2,8 GB (de los cuales 790 MB corresponden a los cuatro checkpoints ACT en el paso 10000 y 1,9 GB a resultados de ensayos). La licencia no está declarada en la información disponible y los datasets de entrenamiento aún no se han publicado en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) en máquina de estados finitos de 4 etapas, con rutina de inserción scriptada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | no disponible (el archivo `RunACT.py` conserva la cabecera Apache 2.0 de Intrinsic Innovation LLC del toolkit de ejemplo) |
| Formato de pesos | safetensors (4 checkpoints ACT, paso 10000) |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 2,8 GB (790 MB checkpoints, 1,9 GB resultados, 252 KB codigo de politica, 252 KB scripts de entrenamiento, 20 KB documentacion) |

## Arquitectura y entrenamiento

La política se implementa como `RunACTStagedScriptedInsert`, que hereda de `RunACTStaged` y envuelve cuatro checkpoints ACT en una FSM con los estados APPROACH, ALIGN, GUARDED_INSERT y RETRY_OR_FINISH. Cada checkpoint corresponde a una etapa del proceso de inserción y fue entrenado hasta el paso 10000. Cuando la etapa de inserción con guarda desiste, la rutina scriptada toma el control desde la pose actual: desciende a 4 mm/s con rigidez de 400 N/m y aplica una pequeña oscilación circular, sin consultar la pose del puerto en ningún momento. La FSM conceptual permite transiciones entre Align, Retry (recentrado y elevación) y guarded insert.

No se dispone de información sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO, dado que no es un modelo de lenguaje. El repositorio incluye los scripts de construcción del dataset por etapas y de entrenamiento en `training/quantarune_training/` y `training/quantarune_teleop/`, pero los datasets en sí no están incluidos y el autor indica que se publicarán más adelante. La memoria técnica completa del pipeline y el análisis de fallos está en `docs/technique.md`.

## Capacidades

- Control robótico de inserción de conectores SC mediante una FSM de cuatro etapas con checkpoints ACT independientes.
- Aproximación y alineación inicial del conector al puerto aprendidas por imitación.
- Inserción con guarda (guarded insert) que cede el control a una rutina scriptada cuando no progresa.
- Rutina de terminación scriptada con descenso a 4 mm/s, rigidez de 400 N/m y oscilación circular para asentar el conector.
- Reintento con recentrado y elevación ante fallos de alineación.
- Operación sin lectura de la pose del puerto en la fase de inserción final.
- Integración con el scorer del challenge mediante la señal `/scoring/insertion_event`.
- Ejecución en el simulador Gazebo dentro del toolkit AIC (Intrinsic AI for Industry Challenge).

## Casos de uso

- Investigación en manipulación de precisión: el repositorio sirve como referencia reproducible para estudiar la combinación de políticas ACT con rutinas scriptadas en tareas de inserción con tolerancias submilimétricas, gracias a los 37 ensayos documentados en `results/trials.csv`.
- Benchmark de políticas robóticas en el Intrinsic AI for Industry Challenge: permite comparar el rendimiento de una FSM de cuatro etapas ACT frente a enfoques de política única en la tarea de inserción SC en Gazebo.
- Desarrollo de arquitecturas híbridas aprendizaje-control: el patrón de delegar la aproximación al ACT y el empuje final a un script determinista es directamente reutilizable en otras tareas de ensamblaje con contacto físico.
- Formación y docencia en robótica industrial: el código de política (252 KB), los scripts de entrenamiento y la memoria técnica de 20 KB permiten reproducir el pipeline completo en un entorno simulado.
- Estudio de análisis de fallos: `docs/technique.md` incluye el análisis de fallos del pipeline, útil para investigar modos de error en inserción con guarda y estrategias de reintento.
- Prototipado de control de fuerza: la rutina scriptada con rigidez de 400 N/m y descenso a 4 mm/s sirve como base para experimentar con parámetros de control de impedancia en tareas de contacto.
- Integración en pipelines LeRobot: al publicarse como política LeRobot con pesos safetensors, puede cargarse en flujos de evaluación existentes del ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de una política robótica y no de un modelo de lenguaje. El repositorio incluye `results/trials.csv` con 37 ensayos que registran lote, configuración y puntuación, pero los valores concretos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los cuatro checkpoints ACT suman 790 MB en disco, pero no se especifica el consumo en memoria durante la ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución mediante el toolkit AIC con `PYTHONPATH` apuntando a `policy/aic_example_policies` y carga de la política como `aic_example_policies.ros.RunACTStagedScriptedInsert`; requiere el simulador Gazebo y las variables de entorno definidas en `policy_env.txt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de inserción de conectores SC ni políticas ACT comparables con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La política se detiene al recibir la señal `/scoring/insertion_event` del scorer, pero el autor no ha confirmado que dicha señal sea legal en la evaluación oficial del challenge.
- Bug conocido de rigidez en la versión v1: la rutina de terminación fija la rigidez a 400 N/m y nunca la restablece. Como el motor reutiliza un mismo objeto de política entre ensayos, el segundo ensayo de una ejecución multi-ensayo abordaría el puerto a 400 N/m. Todos los ensayos del repositorio se ejecutaron en ejecuciones de un solo ensayo; el autor indica que la siguiente versión corrige el fallo.
- Los datasets de entrenamiento no están incluidos en el repositorio y se publicarán más adelante, lo que limita la reproducibilidad completa del entrenamiento.
- La licencia no está declarada de forma explícita; solo el archivo `RunACT.py` conserva la cabecera Apache 2.0 de Intrinsic Innovation LLC. No se puede confirmar el uso comercial del resto del código y los pesos.
- El sistema está diseñado específicamente para la tarea de inserción de conectores SC en el simulador Gazebo; no es generalizable a otras tareas de manipulación sin reentrenamiento.
- La rutina de inserción final no lee la pose del puerto, lo que la hace dependiente de que la alineación previa del ACT sea correcta; un error de alineación no se corrige en la fase scriptada.
- No se dispone de información sobre sesgos, tasas de alucinación (no aplica) ni comportamiento fuera del dominio simulado.

## Enlaces

- Hugging Face: https://huggingface.co/shng2025/quantarune-act-fsm-sc-scripted-insert
- Memoria técnica del pipeline y análisis de fallos: `docs/technique.md` dentro del repositorio
- Resultados de ensayos: `results/trials.csv` dentro del repositorio
- Scripts de entrenamiento: `training/quantarune_training/` y `training/quantarune_teleop/` dentro del repositorio
- Código de política: `policy/aic_example_policies/ros/` dentro del repositorio
- Intrinsic AI for Industry Challenge: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
