# islee94/n16-franka-stack3cup-dsu-30k-s42

## Resumen

n16-franka-stack3cup-dsu-30k-s42 es un checkpoint de ajuste fino del modelo fundacional de robotica GR00T N1.6, desarrollado por NVIDIA, publicado por el usuario islee94 en Hugging Face. El modelo se ha entrenado sobre datos reales de un brazo robotico Franka para la tarea concreta de apilar tres vasos (stack_3_cup), partiendo de un checkpoint base identificado como `gr00tn16 179b98b`. No se trata de un modelo de lenguaje generalista, sino de una politica viso-lenguaje-accion (VLA) orientada a control robotico.

El checkpoint contiene unicamente los archivos necesarios para inferencia (pesos en safetensors, sin estado del optimizador) y suma 3.286.608.832 parametros distribuidos en dos ficheros de pesos, con un tamano total de repositorio de 6,6 GB. El entrenamiento se realizo durante 30.000 actualizaciones con 4 GPU A100 y semilla 42, empleando una tecnica de retiming de datos denominada DemoSpeedup con una politica original de 30k como proxy de entropia.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un ajuste fino de GR00T N1.6 sobre hardware real Franka con una receta documentada (manifest de destilacion, contexto de ejecucion y estadisticas de dataset incluidas en el repo). La evaluacion en robot estaba pendiente en el momento de la publicacion, por lo que no existen resultados de rendimiento en tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (politica viso-lenguaje-accion, VLA); detalles internos no disponibles |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (2 shards: model-00001-of-00002, model-00002-of-00002) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint GR00T N1.6 (referencia interna `gr00tn16 179b98b`), un modelo fundacional de robotica de NVIDIA que combina entrada visual, instrucciones en lenguaje y salida de acciones motoras. La model card no detalla la arquitectura interna (tipo de transformer, mecanismo de atencion, encoder visual ni tokenizador de acciones), por lo que esa informacion debe consultarse en la documentacion oficial de GR00T N1.6.

El entrenamiento se realizo sobre datos reales del robot Franka para la tarea stack_3_cup, con retiming mediante DemoSpeedup y usando la politica original de 30k como proxy de entropia (fichero `stack3cup_dsu_l1_h2_proxy30k`). Se ejecutaron 30.000 actualizaciones en 4 GPU A100 (4 x 16, presumiblemente 4 procesos con 16 workers o similar), con semilla 42 y un presupuesto de ajuste fino de 32.064.750 (unidades no especificadas en la model card). El repositorio incluye artefactos de reproducibilidad: `raven/raven_context.txt`, `raven/pacedistill_manifest.json`, `raven/dsu_l1_h2_proxy30k.json`, estadisticas de dataset (`statistics.json`, `experiment_cfg/dataset_statistics.json`) y `trainer_state.json`. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Control robotico viso-lenguaje-accion: genera acciones motoras para un brazo Franka a partir de observaciones visuales e instrucciones, especializado en la tarea de apilar tres vasos.
- Ejecucion de una politica entrenada con datos reales de robot (no simulacion), segun la model card.
- Ajuste fino reproducible: incluye configuracion de experimento, estadisticas de normalizacion y manifest de destilacion para replicar el entrenamiento.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes multi-paso ni multilingueismo; al ser una politica VLA, estas capacidades no aplican en el sentido habitual.
- No se documenta modo thinking, audio ni otras modalidades adicionales.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el checkpoint sirve como punto de partida reproducible para estudiar el efecto del retiming de datos (DemoSpeedup) en politicas VLA sobre robot real, gracias a los artefactos de manifest y contexto incluidos.
- Benchmark interno de apilado de objetos: utilizar la politica como linea base para la tarea stack_3_cup en un Franka y comparar con variantes entrenadas con otras recetas o semillas.
- Ajuste fino posterior (fine-tuning continuado): al incluir configuracion completa de experimento y estadisticas del dataset, puede reutilizarse como inicializacion para tareas de manipulacion similares.
- Reproduccion de experimentos: los ficheros `raven_context.txt`, `pacedistill_manifest.json` y `dsu_l1_h2_proxy30k.json` permiten auditar y replicar el pipeline de entrenamiento en un cluster con A100.
- Evaluacion de robustez de politicas VLA: comparar el comportamiento del checkpoint con la politica original de 30k usada como proxy de entropia para medir el impacto de la destilacion.
- Docencia y demos de robotica: desplegar la politica en un Franka de laboratorio para ilustrar el ciclo completo observacion-accion en un modelo fundacional de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion en robot estaba pendiente ("robot evaluation pending") en el momento de la publicacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.286.608.832 parametros, en FP16 los pesos ocupan aproximadamente 6,6 GB, a los que hay que sumar activaciones y buffers del encoder visual y del procesador de acciones.
- GPU recomendadas: el entrenamiento se realizo en 4 x A100; para inferencia se recomienda al menos una GPU con 16-24 GB de VRAM (A100, L40S, RTX 4090) como estimacion conservadora, aunque no hay cifras oficiales.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y posiblemente en RTX 4080/4070 Ti en FP16, segun la estimacion de pesos; no confirmado por el autor.
- Opciones de despliegue: no se documentan en la model card; al ser un checkpoint GR00T N1.6, el despliegue requeriria el stack de inferencia de NVIDIA GR00T/Isaac, no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n16-franka-stack3cup-dsu-30k-s42 | 3.286.608.832 | no disponible | VLA Franka stack_3_cup | no disponible | Hugging Face (0 descargas) |
| GR00T N1.6 base (gr00tn16 179b98b) | no disponible | no disponible | VLA fundacional robotica | no disponible | Referencia interna citada, no enlazada |
| Otras politicas VLA open source (p. ej. OpenVLA, pi0) | no disponible | no disponible | Manipulacion robotica | no disponible | No comparado en la informacion disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Especializacion extrema: el checkpoint esta entrenado para una unica tarea (stack_3_cup) sobre un unico embodiment (Franka); no es un modelo generalista.
- Sin evaluacion en robot: el autor indica que la evaluacion fisica estaba pendiente, por lo que no hay evidencia publicada de exito en tarea.
- Licencia no especificada: no se indica licencia en el repo, lo que impide confirmar si el uso comercial esta permitido; debe consultarse con el autor y con la licencia de GR00T N1.6.
- Idiomas no documentados: al ser una politica VLA, el soporte linguistico depende del modelo base y no se detalla.
- Riesgo de sobreajuste a la configuracion de laboratorio: los datos provienen de un montaje concreto de Franka y una receta de retiming especifica; la transferencia a otros robots, camaras o entornos no esta garantizada.
- Sin cuantizaciones publicadas: solo hay pesos safetensors; no se ofrecen versiones GGUF ni INT8/INT4, lo que limita el despliegue en hardware modesto.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.
- Artefactos de entrenamiento incluidos: los ficheros de `raven/` y `experiment_cfg/` contienen informacion del entorno de entrenamiento (rutas, hashes) que conviene revisar antes de reutilizar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/islee94/n16-franka-stack3cup-dsu-30k-s42
- Modelo base citado: GR00T N1.6, referencia interna `gr00tn16 179b98b` (no se proporciona enlace directo en la informacion disponible)
- Documentacion de NVIDIA GR00T: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
