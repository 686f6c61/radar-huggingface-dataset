# dddddsds31341/Franka-Q-RECAP-20261111

## Resumen

Franka-Q-RECAP-20261111 es un repositorio de archivo publicado en Hugging Face por el usuario `dddddsds31341` que recopila los artefactos de entrenamiento de seis experimentos de robótica realizados el 11 de noviembre de 2026 sobre un entorno de manipulacion Franka. No se trata de un modelo generativo al uso, sino de un conjunto de checkpoints de planificacion Q (Q-Planning) y de entrenamiento RECAP (DCP) acompanados de configuraciones, metricas, logs y el codigo exacto de entrenamiento y archivado.

El contenido se organiza en dos familias: cuatro tareas de Q-Planning (`bread`, `stick`, `test-tube`, `wipe-whiteboard`) con checkpoints finales de 5.000 pasos, y dos tareas RECAP (`stick`, `test-tube`) con checkpoints DCP finales de 2.000 pasos. El repositorio pesa 51,6 GB e incluye estados completos de entrenamiento (modelo, optimizador, scheduler, estado RNG) en formato nativo de PyTorch/RLinf, no pesos safetensors independientes listos para inferencia.

La relevancia es acotada: es material de reproducibilidad para un pipeline concreto de aprendizaje por refuerzo/planificacion en robotica, no un modelo de proposito general. La model card advierte explicitamente de que los checkpoints son modelos de valor entrenados offline y que la finalizacion del entrenamiento no establece tasas de exito en tareas roboticas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo unico; Q-Planning usa DINOv2-large y T5-v1_1-base como inicializacion; RECAP referencia SigLIP2 y Gemma3 |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoints en formato nativo de entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `checkpoint.pt` (Q) y DCP nativo de RLinf/PyTorch (RECAP); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta una arquitectura unica, sino dos pipelines diferenciados. El pipeline Q-Planning entrena un modelo de valor Q con la "complete official Q-Planning architecture", tamano de batch 48 y 5.000 pasos por tarea, inicializando desde DINOv2-large (vision) y T5-v1_1-base (texto). El checkpoint final incluye Q online, target EMA, encoder de texto congelado, optimizador, contador de pasos y estado RNG. El pipeline RECAP usa DCP (Distributed Checkpoint) nativo de RLinf con micro batch 2, batch global 32 y 2.000 pasos, referenciando SigLIP2 y Gemma3 como activos de modelo/tokenizer compartidos.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO. El autor indica que los datasets y los modelos preentrenados no se duplican en el archivo: permanecen en el sistema SIP y se identifican por la configuracion de cada run. La verificacion de integridad se realiza por igualdad byte a byte tras la subida, sin checksum SHA-256 separado; el autor declara que se permite el protocolo interno de identificacion de objetos de Hugging Face.

## Capacidades

- Planificacion Q offline para tareas de manipulacion Franka (bread, stick, test-tube, wipe-whiteboard).
- Entrenamiento RECAP para las tareas stick y test-tube con estado completo reanudable.
- Reanudacion de entrenamiento: los checkpoints Q contienen optimizador, paso y estado RNG; los DCP incluyen modelo, optimizador y scheduler.
- Reproducibilidad: se incluye el codigo exacto (scripts de cola, entrenamiento y archivado), versiones de entorno y fuente de terceros fijada.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingues.
- No se documenta un modo de inferencia ni un formato de policy safetensors independiente.

## Casos de uso

- Reproduccion de experimentos de Q-Planning: restaurar el directorio de tarea en un directorio de salida de Q, conservar `checkpoint.pt`, `data.json` y configuraciones, y usar `train_q.sh` con `--resume` para continuar el entrenamiento desde el paso 5.000.
- Reanudacion de RECAP: apuntar `runner.resume_dir` de RLinf al directorio `checkpoints/global_step_2000` restaurado y usar la configuracion resuelta archivada para continuar el entrenamiento.
- Auditoria de integridad de artefactos: el repositorio sirve como referencia de verificacion byte a byte de checkpoints frente al sistema SIP original.
- Reconstruccion de entorno: extraer la release de codigo y recrear el entorno Python registrado y los datasets originales para continuar la investigacion.
- Estudio de configuraciones de entrenamiento RL: comparar hiperparametros (batch 48 en Q; micro batch 2 / global 32 en RECAP) y curvas de TensorBoard entre tareas.
- Base para investigacion en planificacion robotica offline: utilizar los modelos de valor como punto de partida para evaluar politicas en el entorno Franka, teniendo en cuenta la advertencia del autor sobre tasas de exito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la finalizacion del entrenamiento y la igualdad byte a byte no establecen tasas de exito en tareas roboticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los checkpoints son estados de entrenamiento completos (modelo + optimizador + scheduler), no pesos de inferencia optimizados.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamano del repositorio (51,6 GB) sugiere que la restauracion completa requiere almacenamiento y memoria considerables, pero no se especifica.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; la restauracion se hace con el cliente de Hugging Face y los scripts incluidos (`train_q.sh`, RLinf).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (planificacion Q o RECAP para robotica Franka) ni datos de rendimiento que permitan una comparacion.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: los checkpoints son estados de entrenamiento nativos (PyTorch/RLinf), no policy safetensors independientes.
- El autor advierte explicitamente de que el entrenamiento completado no garantiza tasas de exito en tareas roboticas reales.
- Las rutas absolutas locales registradas en las configuraciones describen el run en SIP y deben adaptarse en otra maquina.
- Los datasets y modelos preentrenados (DINOv2-large, T5-v1_1-base, SigLIP2, Gemma3) no se incluyen; deben obtenerse por separado.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles; no se documentan sesgos, alucinacion ni limitaciones de contexto porque no es un modelo de lenguaje de proposito general.
- Cero descargas y cero likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/Franka-Q-RECAP-20261111
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
