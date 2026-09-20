# Mahesh111000/hanabi-training12-combined-skyrl-loras

## Resumen

`Mahesh111000/hanabi-training12-combined-skyrl-loras` es un repositorio de adaptadores LoRA publicado por el usuario Mahesh111000. No contiene un modelo completo, sino los 149 checkpoints (pasos `step_000001` a `step_000148` más `final`) de una ejecución de aprendizaje por refuerzo identificada como `training12-combined-20260918T075329414627Z`. Cada checkpoint es un adaptador PEFT de rango 32 (alpha 32) en formato fp32 de 284 MB, aplicado sobre las proyecciones q, k, v, o, gate, up, down y `lm_head`.

El modelo base es `Mahesh111000/Qwen_merged`, fijado a la revisión `cf390c83fb3214ee0d21f7fa0fd62d440942d666`. Por el nombre del repositorio y las etiquetas declaradas (`hanabi`, `reinforcement-learning`), el artefacto corresponde a una ejecución de RL sobre la tarea del juego cooperativo Hanabi, presumiblemente realizada con el marco SkyRL, aunque la model card no describe la tarea, el entorno ni el protocolo de evaluación.

Su relevancia es exclusivamente de investigación: se trata de material reproducible de un entrenamiento por refuerzo (incluye hashes SHA-256 de los tensores LoRA por paso), no de un modelo listo para producción. No tiene descargas ni valoraciones, no declara licencia ni idiomas, ocupa 42 GB y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un modelo base transformer causal de la familia Qwen (`Mahesh111000/Qwen_merged`); la arquitectura interna de la base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el modelo base. Del orden de 70 millones de parametros de adaptador por checkpoint (284 MB en fp32) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Los adaptadores se distribuyen unicamente en fp32; no se publican versiones cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card y los metadatos no especifican licencia) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), compatible con PEFT |
| Rango y alpha de LoRA | 32 / 32 |
| Modulos objetivo | q, k, v, o, gate, up, down y `lm_head` (ocho modulos) |
| Numero de tensores LoRA | 506 por checkpoint |
| Checkpoints incluidos | 149 (`step_000001` ... `step_000148` y `final`, identico tensor a tensor a `step_000148`) |
| Modelo base | `Mahesh111000/Qwen_merged` en la revision `cf390c83fb3214ee0d21f7fa0fd62d440942d666` |
| Tamano del repositorio | 42,0 GB |
| Fecha de publicacion | 19 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no contiene pesos completos, sino adaptadores de bajo rango inyectados en las siete proyecciones del bloque transformer mas la cabeza de lenguaje. Cada checkpoint ocupa 284 MB en fp32 y contiene 506 tensores LoRA. Dos correcciones se aplicaron respecto a los ficheros escritos por el entrenador: (1) `adapter_config.json` almacenaba `target_modules` como una lista de caracteres sueltos (el resultado de dividir la cadena de la expresion regular), lo que PEFT no puede emparejar; ahora lista los ocho nombres de modulo que esa expresion regular seleccionaba, y el fichero original se conserva como `training_run/adapter_config.as_saved_by_trainer.json`; (2) se elimino de cada checkpoint una copia fp32 de 1,56 GB del peso congelado de `lm_head`, previa comprobacion de igualdad exacta con la base fijada. Los 506 tensores LoRA no se modificaron y `tensor_sha256_by_step.json` guarda el hash de los tensores LoRA de cada paso.

Sobre el procedimiento de entrenamiento no hay informacion en la model card: no se documentan el numero de tokens, la composicion del dataset, el algoritmo de RL, ni si hubo RLHF o DPO. La unica referencia es la etiqueta de pipeline `reinforcement-learning` y el nombre de la ejecucion, que apunta al marco SkyRL. Tampoco se suben los estados de reanudacion del entrenador (optimizador, planificador y RNG), por lo que la ejecucion no es reanudable desde el repositorio.

Un detalle tecnico relevante es que el modelo base ata `lm_head` a `embed_tokens`. Por ese motivo la model card advierte explicitamente de que no se debe llamar a `merge_and_unload()`, ya que PEFT escribiaria el delta de `lm_head` dentro de la matriz de embeddings. Para uso desplegable hay que emplear el repositorio fusionado del mismo autor, donde `lm_head` esta desatado.

## Capacidades

- Optimizacion de politica mediante RL sobre un modelo base de la familia Qwen, orientada a la tarea Hanabi segun las etiquetas `hanabi` y `reinforcement-learning` y el nombre del run. La model card no describe la tarea ni el formato de observacion/accion.
- Distribucion como adaptadores PEFT intercambiables: se puede cargar cualquier paso concreto (`step_000001` ... `step_000148`, `final`) sobre la base fijada, lo que permite evaluar la evolucion de la politica paso a paso.
- Trazabilidad de los pesos: hashes SHA-256 de los tensores LoRA por paso, y verificacion de que `final` es identico a `step_000148`.
- Capacidades generales de generacion de texto, razonamiento o codigo: no documentadas para este artefacto. Dependerian exclusivamente del modelo base `Mahesh111000/Qwen_merged`, sobre el que no hay ficha tecnica en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion en RL multiagente sobre Hanabi: Hanabi es un entorno cooperativo de informacion imperfecta con recompensa compartida; este repositorio permite reproducir y analizar la politica aprendida sin reentrenar, cargando el checkpoint deseado con PEFT sobre la base fijada.
- Analisis de curvas de aprendizaje: al incluir los 149 pasos intermedios, se puede medir la evolucion de metricas de juego, de la entropia de la politica o de la tasa de acciones ilegales a lo largo del entrenamiento y detectar colapsos o mesetas.
- Auditoria y verificacion de reproducibilidad: `tensor_sha256_by_step.json` permite comprobar que un checkpoint descargado es el que se genero en cada paso, util en entornos de investigacion con requisitos de trazabilidad.
- Estudio de comunicacion emergente: en Hanabi la coordinacion exige intercambiar pistas; los adaptadores permiten inspeccionar si el modelo desarrolla convenciones estables y como varian entre pasos.
- Ablaciones controladas de hiperparametros de RL: comparar dos pasos concretos sobre una base identica y una configuracion LoRA identica (rango 32, alpha 32) aislа el efecto del entrenamiento del efecto del modelo base.
- Punto de partida para entrenamiento posterior: cargar `final` como inicializacion de un nuevo ciclo de RL o de un ajuste supervisado, siempre evitando `merge_and_unload()` y usando el repositorio fusionado si se necesita un modelo con pesos unificados.
- Evaluacion de infraestructura de RL para LLM: el conjunto de checkpoints sirve como carga de trabajo realista para medir almacenamiento, tiempo de carga de adaptadores y coste de evaluacion en pipelines PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de Hanabi (puntuacion media, tasa de exito, numero de turnos), ni resultados de evaluaciones generales tipo MMLU, HumanEval o GSM8K, ni comparaciones con otros agentes.

## Requisitos de hardware

Ninguna cifra de esta seccion procede de la model card: el autor no declara el tamano del modelo base. Las estimaciones siguientes asumen una base de la familia Qwen de aproximadamente 7-8 mil millones de parametros, lo cual no esta confirmado en la informacion disponible.

- Almacenamiento: 42 GB solo para los adaptadores (149 checkpoints de 284 MB). Cada checkpoint individual requiere 284 MB adicionales, mas el espacio de la base.
- VRAM de inferencia con la base sin cuantizar en fp16/bf16: del orden de 15-16 GB para una base de 7-8B, mas el coste de cargar el adaptador (despreciable, 284 MB).
- VRAM con la base en cuantizacion de 4 bits: del orden de 5-6 GB, mas overhead de contexto.
- GPU profesionales: A100 (40/80 GB), H100, L40S y A6000 cubren la carga con holgura incluso en fp16 y con contextos largos.
- GPU de consumo: una RTX 4090 o 3090 (24 GB) puede ejecutar una base de 7-8B en fp16; una RTX 3060 de 12 GB o una RTX 4070 quedan limitadas a cuantizacion de 4 bits.
- Despliegue: la via documentada en la model card es `transformers` + `peft`, cargando base y adaptador por separado. vLLM y TGI admiten adaptadores LoRA, pero no hay configuracion publicada para este repositorio. Para llama.cpp u Ollama, que requieren pesos fusionados y cuantizados, hay que usar el repositorio `Mahesh111000/hanabi-training12-combined-skyrl`, no este.
- Restriccion critica de despliegue: no invocar `merge_and_unload()` sobre estos adaptadores, porque la base ata `lm_head` a `embed_tokens` y el delta se escribiria en la matriz de embeddings.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicados que permitan comparar este artefacto con alternativas de la misma categoria. La unica comparacion verificable es interna al propio autor:

| Repositorio | Contenido | Formato | `lm_head` | Uso previsto |
|---|---|---|---|---|
| `hanabi-training12-combined-skyrl-loras` (este) | 149 adaptadores LoRA de rango 32 (284 MB cada uno), 506 tensores | safetensors fp32, PEFT | Atado a `embed_tokens`; no se debe fusionar | Analisis paso a paso, investigacion de RL |
| `hanabi-training12-combined-skyrl` | Modelo final fusionado y detalles del run | No disponible | Desatado | Despliegue e inferencia |
| `Mahesh111000/Qwen_merged` | Modelo base, revision `cf390c83...` | No disponible | Atado a `embed_tokens` | Base de los adaptadores |

Como referencia historica externa, el trabajo de Meta CICERO es el antecedente mas conocido de agentes que juegan a Hanabi, pero en la informacion proporcionada no hay parametros, contexto, licencia ni metricas de ese sistema que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se declara licencia. Esto impide determinar si el uso comercial esta permitido; en la practica, el artefacto debe tratarse como no apto para produccion hasta que el autor aclare la licencia.
- El modelo base `Mahesh111000/Qwen_merged` es un repositorio sin ficha tecnica en la informacion disponible: se desconoce su tamano, contexto, datos de entrenamiento y licencia, lo que arrastra cualquier incertidumbre legal y tecnica al adaptador.
- Artefacto de investigacion sin validacion externa: 0 descargas y 0 valoraciones en el momento de la consulta.
- Especializacion estrecha: las etiquetas y el nombre indican entrenamiento sobre Hanabi, por lo que el adaptador puede degradar capacidades generales del modelo base fuera de esa tarea.
- Riesgo de sobreajuste al entorno de entrenamiento concreto: no se documentan la version del entorno, la configuracion de recompensa ni el protocolo de evaluacion, de modo que la transferencia a otras variantes del juego no esta garantizada.
- Riesgo de alucinacion: no evaluado. No hay ninguna metrica de fidelidad, correccion o robustez publicada.
- Limitaciones de contexto e idioma: no disponibles.
- Trampa de fusion: llamar a `merge_and_unload()` produce pesos incorrectos porque `lm_head` esta atado a `embed_tokens` en la base. Para pesos fusionados hay que usar el repositorio alternativo del autor.
- Repositorio pesado: 42 GB de adaptadores en fp32, sin versiones cuantizadas ni agregadas, lo que encarece el almacenamiento y la descarga.
- Reproducibilidad parcial: los estados de reanudacion del entrenador (optimizador, planificador, RNG) no estan subidos, por lo que el run no se puede reanudar. Los hashes SHA-256 permiten verificar integridad, no reproducir el entrenamiento.
- La ejecucion de busqueda web asociada no devolvio resultados relacionados con el modelo: los unicos resultados obtenidos fueron paginas en chino sobre pizza y sobre Uzbekistan, sin ninguna relacion con este repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Mahesh111000/hanabi-training12-combined-skyrl-loras
- Modelo base: https://huggingface.co/Mahesh111000/Qwen_merged
- Revision fijada del modelo base: `cf390c83fb3214ee0d21f7fa0fd62d440942d666`
- Modelo final fusionado y detalles del run: https://huggingface.co/Mahesh111000/hanabi-training12-combined-skyrl
- Hashes de los tensores LoRA por paso: `tensor_sha256_by_step.json` (dentro del repositorio)
- Configuracion original escrita por el entrenador: `training_run/adapter_config.as_saved_by_trainer.json` (dentro del repositorio)
- Busqueda web: sin resultados relevantes; no se han encontrado papers, blogs, repositorios ni demos asociados a este modelo.
