# islee94/n16-franka-pnp-middle-cup-to-basket-original-30k-s42

## Resumen

`n16-franka-pnp-middle-cup-to-basket-original-30k-s42` es un checkpoint de ajuste fino del modelo fundacional de robotica GR00T N1.6, desarrollado originalmente por NVIDIA, subido por el usuario islee94 desde el cluster Raven (MPCDF). No es un modelo de lenguaje: es una politica visuo-linguistica-accion (VLA) entrenada para una tarea concreta de manipulacion robotica con un brazo Franka, en la que el robot debe coger una taza situada en el centro y depositarla en una cesta ("pnp_middle_cup_to_basket").

El checkpoint contiene unicamente los pesos de inferencia (sin estado del optimizador) y se ha entrenado durante 30.000 actualizaciones sobre el dataset original de la tarea, con 4 GPU A100 y 4 procesos por GPU, semilla 42. El autor indica explicitamente que la evaluacion robotica esta pendiente, por lo que no existen metricas de exito publicadas.

Su relevancia es acotada: sirve como ejemplo reproducible de fine-tuning de GR00T N1.6 sobre un dataset real de Franka y como artefacto de inferencia para esa tarea especifica. No debe confundirse con el modelo base GR00T N1.6 publicado por NVIDIA, del que hereda arquitectura y capacidad de generalizacion antes del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (modelo fundacional VLA de NVIDIA; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 3.286.608.832 (3,29 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en precision original) |
| Idiomas soportados | no disponible (las instrucciones de tarea son de tipo linguistico, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (2 shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El checkpoint deriva de GR00T N1.6 (tag `Gr00tN1d6`), el modelo fundacional de robotica de NVIDIA orientado a control de robots mediante entradas visuales y consignas de tarea. La informacion proporcionada no detalla la arquitectura interna (tipo de transformer, mecanismo de atencion, tokenizador de acciones ni modulo de vision), por lo que esos extremos quedan como no disponibles. El repositorio incluye `embodiment_id.json`, `processor_config.json` y `experiment_cfg/` con configuraciones de preprocesado y estadisticas del dataset, lo que confirma que se trata de un artefacto de inferencia completo listo para cargarse con el pipeline de GR00T.

El entrenamiento se realizo sobre el dataset `pnp_middle_cup_to_basket_8fe28ff_train` (datos originales, sin aumento), con 30.000 actualizaciones, 4 GPU A100 y 4 procesos por GPU, semilla 42, sobre el commit `gr00tn16 179b98b`. No se indica el numero de tokens ni de episodios, ni si hubo RLHF, DPO o etapas de post-entrenamiento adicionales. El `trainer_state.json` y `statistics.json` incluidos contienen el detalle de la curva de entrenamiento y las estadisticas de normalizacion, respectivamente.

## Capacidades

- Control de manipulacion robotica: genera acciones para un brazo Franka en la tarea pick-and-place de una taza central a una cesta.
- Percepcion visual y seguimiento de la tarea: consume observaciones visuales y consignas de tarea segun el pipeline de GR00T N1.6.
- Ejecucion de politicas de imitacion entrenadas sobre demostraciones reales (dataset original de Franka).
- Integracion con el ecosistema GR00T: los ficheros de configuracion permiten cargar el checkpoint con el procesador y las estadisticas del dataset original.
- Capacidades linguisticas generales, tool calling, agentes, razonamiento multi-paso, vision general, audio o modo "thinking": no disponibles en la informacion proporcionada; este checkpoint esta especializado en una unica tarea de robotica.

## Casos de uso

- Reproduccion de experimentos de fine-tuning de GR00T N1.6: el checkpoint y su `trainer_state.json` permiten auditar la evolucion del entrenamiento (30.000 pasos, semilla 42) y comparar con otras semillas o configuraciones.
- Evaluacion de politicas de manipulacion en simulacion: cargar el checkpoint en el pipeline de GR00T y ejecutar la tarea pnp_middle_cup_to_basket en un entorno simulado antes de la validacion en robot real, que el autor deja pendiente.
- Punto de partida para ajuste adicional: al ser un checkpoint de una tarea concreta sobre Franka, puede servir como inicializacion para variantes de la misma tarea (distintas posiciones de taza o cesta).
- Benchmark interno de infraestructura: util para medir latencia y throughput de inferencia de GR00T N1.6 en hardware A100 con una politica de 3,29 mil millones de parametros.
- Docencia y divulgacion: ejemplo completo de artefacto VLA (pesos, configuraciones, estadisticas y contexto de entrenamiento) para explicar el flujo de trabajo de un modelo fundacional de robotica.
- Base para estudios de reproducibilidad: la semilla fija (42) y el commit del modelo base documentado facilitan replicar el entrenamiento en otro cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion robotica esta pendiente ("robot evaluation pending"), por lo que no hay tasas de exito ni metricas de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 6,57 GB en safetensors (4,99 GB + 1,58 GB), lo que implica unos 6,6 GB solo para pesos en precision de entrenamiento; el pico real depende de las activaciones del pipeline GR00T y no esta documentado.
- GPU recomendadas: el entrenamiento se realizo en 4 x A100; para inferencia, una A100 o H100 es el entorno natural del ecosistema GR00T. No se documenta soporte para GPUs de consumo.
- GPU de consumo: no hay informacion que confirme que quepa o funcione en RTX 4090 u otras consumer; el tamano de pesos es compatible en VRAM, pero la compatibilidad del pipeline no esta verificada.
- Opciones de despliegue: no disponibles en la informacion proporcionada; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a politicas VLA). El despliegue previsto es mediante el codigo de GR00T N1.6 con los ficheros `processor_config.json` y `experiment_cfg/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n16-franka-pnp-middle-cup-to-basket-original-30k-s42 | 3,29 mil millones | no disponible | Pick-and-place Franka (taza a cesta) | no disponible | Hugging Face, 0 descargas |
| GR00T N1.6 (modelo base, NVIDIA) | no disponible en la informacion proporcionada | no disponible | Modelo fundacional VLA generalista | no disponible | Publicado por NVIDIA (referencia en la model card) |
| Otros checkpoints de la misma serie (p. ej. variantes de semilla o dataset) | no disponible | no disponible | Tareas de manipulacion Franka | no disponible | No identificados en la informacion |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea (pnp_middle_cup_to_basket) y un unico embodiment (Franka); no generaliza a otras tareas sin nuevo ajuste.
- Sin evaluacion: el autor declara la evaluacion robotica como pendiente, por lo que se desconoce la tasa de exito real.
- Licencia no especificada: al no indicarse licencia, no se puede asumir uso comercial; debe consultarse la licencia del modelo base GR00T N1.6 de NVIDIA antes de cualquier despliegue.
- Sin estado del optimizador: solo contiene pesos de inferencia, por lo que no permite reanudar el entrenamiento exactamente donde se dejo.
- Riesgo de sobreajuste al dataset original: 30.000 actualizaciones sobre un unico dataset de una tarea pueden producir una politica poco robusta ante cambios de iluminacion, posicion de objetos o del robot.
- Idiomas y contexto: no documentados; no debe tratarse como un modelo de lenguaje de proposito general.
- Repositorio practicamente sin uso (0 descargas, 0 likes) y creado recientemente: no hay validacion externa de la comunidad.
- Dependencia del codigo de GR00T N1.6 en el commit `179b98b`: cambios en versiones posteriores del pipeline pueden romper la carga del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/islee94/n16-franka-pnp-middle-cup-to-basket-original-30k-s42
- Modelo base GR00T N1.6 de NVIDIA: no disponible en la informacion proporcionada (la model card solo cita el commit `gr00tn16 179b98b`)
- Paper o blog de GR00T: no disponible en la informacion proporcionada
- Repositorio de codigo de GR00T: no disponible en la informacion proporcionada
- Demos o evaluaciones: no disponibles en la informacion proporcionada
