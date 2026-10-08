# Donghyun1228/pi05-libero-demo-replay-task-wrist-kd-20261008-yaw10

## Resumen

Este repositorio contiene un checkpoint de investigacion para robotica denominado "Demo replay task-conditioned IDM + base/wrist/prompt KD: yaw10", publicado por el usuario Donghyun1228. Se trata de un modelo de politica visio-lenguaje-accion (VLA) de la familia pi05 (pi0.5) entrenado sobre el simulador de manipulacion LIBERO, dentro del ecosistema openpi. El artefacto no es un modelo de lenguaje de proposito general, sino un peso de politica entrenado para ejecutar tareas de manipulacion a partir de observaciones visuales (camara base y camara de muneca) y condicionamiento por tarea.

La model card describe un esquema de entrenamiento poco habitual: inicializacion independiente a partir de un checkpoint "original-demo cumulative-average pre-adapt v1/4999", con un modelo de dinamica inversa (IDM) condicionado por tarea con horizonte H10, sin aprendizaje por imitacion (IL=0) y con destilacion de conocimiento (KD) segun ratios 1/1/0.25. El entrenamiento se realizo con 5000 actualizaciones, lotes globales IDM/KD de 32/32, FSDP sobre 4 dispositivos, tasa de aprendizaje 1e-5, EMA 0.999 y semilla 42. La rama "view" congela el experto de accion y la rama "yaw" entrena la politica completa.

El checkpoint se publica como pesos Orbax junto con los activos de normalizacion y un archivo de configuracion de entrenamiento. El repositorio ocupa 12,4 GB. No se declara licencia, idiomas soportados ni resultados de benchmarks, por lo que su uso queda restringido, en la practica, a la reproduccion y evaluacion interna dentro del entorno MuJoCo 3.2.3 indicado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visio-lenguaje-acción (VLA) de la familia pi05, con backbone tipo VLM y experto de accion; decodificador compartido y modulo de dinamica inversa (IDM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica / no disponible (modelo de robotica condicionado por observacion visual y tarea, no por contexto textual medido en tokens) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato Orbax, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (parametros Orbax), junto con activos de normalizacion y `training_configuration.json` |

Datos adicionales del repositorio: tamano de 12,4 GB, pipeline declarado `robotics`, etiquetas `robotics`, `libero`, `openpi`, `pi05`, `inverse-dynamics`, `region:us`. Fecha de creacion y ultima actualizacion: 2026-10-08. Descargas y "likes": 0.

## Arquitectura y entrenamiento

El modelo pertenece a la familia pi05, una arquitectura de politica visio-lenguaje-accion en la que un backbone de vision-lenguaje se combina con un "experto de accion" encargado de generar las trayectorias de control. La model card menciona explicitamente un decodificador compartido ("shared decoder"), un modulo de dinamica inversa condicionado por tarea (IDM, horizonte H10) y un esquema de destilacion de conocimiento con tres componentes ponderados (base/wrist/prompt con ratios KD = 1/1/0.25). La configuracion de politica asociada es `pi05_libero_action_frame_shared_decoder_idm_demo_replay_cumulative_average_paired_vlm_kd`.

El entrenamiento parte de una inicializacion independiente desde el checkpoint "original-demo cumulative-average pre-adapt v1/4999" y ejecuta 5000 actualizaciones con IL=0 e IDM=1, es decir, sin perdida directa de imitacion y apoyandose en la senal del modelo de dinamica inversa. Los lotes globales de IDM y KD son de 32 y 32 respectivamente, distribuidos en 4 dispositivos con FSDP, con tasa de aprendizaje 1e-5, EMA 0.999 y semilla 42. La variante "view" congela el experto de accion mientras que la variante "yaw" entrena la politica completa. Los experimentos se realizan sobre MuJoCo 3.2.3. Las identidades exactas de codigo, datos y comandos se declaran en `training_configuration.json`.

## Capacidades

- Ejecucion de tareas de manipulacion robotica en el banco de pruebas LIBERO dentro de MuJoCo.
- Control condicionado por tarea: la politica recibe una descripcion de tarea y genera acciones motoras coherentes.
- Percepcion multimodal con dos vistas: camara base y camara de muneca (wrist), integradas en el entrenamiento.
- Dinamica inversa condicionada por tarea (IDM) con horizonte H10, usada como senal de aprendizaje.
- Destilacion de conocimiento desde una politica o modelo maestro hacia la politica objetivo.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje interactivo).
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo "thinking", vision, audio: no disponible mas alla de la percepcion visual propia del control robotico.

## Casos de uso

- Reproduccion de experimentos de investigacion en LIBERO: el checkpoint permite replicar la configuracion `pi05_libero_action_frame_shared_decoder_idm_demo_replay_cumulative_average_paired_vlm_kd` y comparar el efecto de la destilacion frente a variantes sin KD.
- Estudio de aprendizaje por dinamica inversa: al usar IL=0 e IDM=1, el modelo es util para analizar hasta que punto la senal de IDM basta para entrenar una politica de manipulacion sin perdida de imitacion directa.
- Evaluacion de destilacion de conocimiento en VLA: los ratios KD 1/1/0.25 y la congelacion del experto de accion en la rama "view" permiten medir el impacto de cada componente de la destilacion.
- Investigacion sobre fusion de vistas base y muneca: el par "base/wrist" hace que el modelo sea adecuado para estudiar como contribuye cada camara al exito de tarea.
- Base para "fine-tuning" en otras tareas de manipulacion: al ser un checkpoint de openpi con pesos Orbax y activos de normalizacion, puede servir como punto de partida para reentrenar sobre nuevos conjuntos de demostraciones.
- Comparacion de inicializaciones: la inicializacion desde "original-demo cumulative-average pre-adapt v1/4999" permite medir el efecto del preajuste acumulado frente a inicializaciones desde cero.
- Referencia para pipelines de entrenamiento distribuido: la configuracion con FSDP en 4 dispositivos, EMA 0.999 y semilla 42 sirve como plantilla reproducible de entrenamiento a escala media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en LIBERO, ni metricas de exito por tarea, ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. El repositorio ocupa 12,4 GB, lo que da una cota inferior orientativa del espacio necesario para cargar los parametros Orbax; el consumo real depende de la precision de carga y de los activos de normalizacion.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor menciona entrenamiento con FSDP sobre 4 dispositivos, lo que implica GPUs de clase centro de datos; no se especifica el modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano del repositorio, es probable que requiera GPUs con 24 GB de VRAM o mas, pero este dato no esta verificado en la informacion disponible.
- Opciones de despliegue: el ecosistema openpi emplea pesos Orbax y JAX/Flax, con un servidor de politica propio; herramientas como vLLM, llama.cpp, Ollama o TGI no estan pensadas para este tipo de modelo y no se documentan en la model card.
- Latencia y throughput estimados: no disponibles. El modelo se evalua en MuJoCo 3.2.3, pero no se publican cifras de frecuencia de control ni de tiempo por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| Donghyun1228/pi05-libero-demo-replay-task-wrist-kd-20261008-yaw10 | no disponible | Manipulacion en LIBERO (MuJoCo) | no disponible | Pesos Orbax en HuggingFace | no disponible |
| Otros checkpoints pi05 / pi0 de openpi | no disponible | Manipulacion robotica | no disponible | Repositorio openpi | no disponible |
| Alternativas VLA del mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de parametros, contexto ni rendimiento de los modelos comparables dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no puede realizarse.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un modelo de robotica entrenado en simulacion, hereda las limitaciones del conjunto de demostraciones de LIBERO, que no se detalla.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; en robotica el equivalente es la generacion de acciones no validas o el fallo en la tarea, cuyo riesgo no se cuantifica en la model card.
- Limitaciones de contexto o idioma: no disponible. El condicionamiento por lenguaje depende de las instrucciones de tarea del banco LIBERO y no se documentan idiomas soportados.
- Licencia para uso comercial: no declarada. La ausencia de licencia impide asumir permisos de uso comercial o de redistribucion.
- Caveat de reproducibilidad: el autor indica que los comandos exactos, las identidades de codigo y de datos estan en `training_configuration.json`; sin ese archivo y sin el codigo asociado, la reproduccion completa no es posible.
- Dependencia del entorno: el entrenamiento esta ligado a MuJoCo 3.2.3 y al pipeline openpi, lo que limita la portabilidad a otros simuladores o robots sin trabajo adicional.
- Madurez: checkpoint de investigacion con 0 descargas y 0 "likes" en el momento de la consulta, sin validacion externa ni resultados publicados.
- La busqueda web realizada no devolvio informacion relacionada con este modelo; los resultados obtenidos correspondian a documentacion sobre analisis por elementos finitos (FEA) de Ansys y no son aplicables.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-demo-replay-task-wrist-kd-20261008-yaw10
- Archivo de configuracion de entrenamiento: `training_configuration.json` (incluido en el repositorio)
- Repositorio openpi (referenciado por las etiquetas del modelo): no disponible en la informacion proporcionada
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada
