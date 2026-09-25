# KosmoCHE/worldmodel-audit-release

## Resumen

El repositorio KosmoCHE/worldmodel-audit-release no es un modelo de propósito general, sino un conjunto de artefactos de auditoría asociados al artículo *Does Learning to Predict the World Help Agents Act? Auditing World-Model Post-Training*. Contiene checkpoints finales ajustados para tres entornos de agente (ALFWorld, ScienceWorld y VisualWebArena), junto con los datos de entrenamiento depurados empleados en el estudio.

El objetivo declarado es la reproducibilidad y la auditabilidad de experimentos de post-entrenamiento con modelos del mundo: se publican ficheros parquet de 20.000 muestras con objetivos correctos (GT) y con objetivos desalineados (mismatched-target) para ALFWorld y ScienceWorld, además de muestras COIN de VisualWebArena y la lista de los 201 identificadores de tarea usados en evaluación. Los resultados de evaluación se omiten deliberadamente.

Su relevancia es metodológica más que de producto: permite reproducir ablaciones sobre el efecto de aprender a predecir el mundo en el comportamiento de agentes, y auditar la señal de entrenamiento. El repositorio ocupa 110,3 GB y almacena los pesos en formato safetensors; no se especifican en la información disponible la arquitectura, el número de parámetros ni los modelos base empleados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los pesos heredan los terminos de sus modelos base) |
| Formato de pesos | safetensors |
| Autor | KosmoCHE |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |
| Tamano del repositorio | 110,3 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |
| Entornos cubiertos | ALFWorld, ScienceWorld, VisualWebArena |
| Volumen de datos de entrenamiento | 20.000 muestras por entorno (ALFWorld y ScienceWorld), en variantes GT y mismatched-target |
| Conjunto de evaluacion | 201 tareas de VisualWebArena (solo site y task_id) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura de los checkpoints: no se indica si son transformers densos, MoE o modelos hibridos, ni el numero de parametros, la longitud de contexto o el modelo base sobre el que se hizo el ajuste. Lo unico verificable es que el repositorio publica pesos finales en safetensors para tres entornos de agente, lo que implica al menos un checkpoint por entorno y, por tanto, pesos derivados de uno o varios modelos base no identificados en la documentacion.

En cuanto al entrenamiento, la model card describe un esquema de post-entrenamiento con dos variantes de datos por tarea: objetivos correctos (GT) y objetivos desalineados (mismatched-target). Se conservan los campos `teacher_prompt_ids` para permitir entrenamiento compatible con OPSD y el campo `true_next_state` en los ficheros de objetivos desalineados con fines de auditoria. Para VisualWebArena se publican muestras COIN y se preservan los campos de procedencia en `extra_info` (sitio, URL, accion, identificadores de ejecucion y episodio, indice de paso e indice de snapshot). No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones de decodificacion o atencion.

## Capacidades

- Ejecucion de tareas de agente en entornos textuales interactivos: ALFWorld (manipulacion y navegacion en mundos domesticos simulados) y ScienceWorld (experimentos de ciencias guiados por objetivos).
- Ejecucion de tareas de agente web multimodal en VisualWebArena, que combina observaciones visuales de paginas web con acciones.
- Prediccion del siguiente estado del entorno como senal de entrenamiento, dado que los datos incluyen `true_next_state` en las variantes de objetivos desalineados.
- Entrenamiento compatible con OPSD mediante la preservacion de `teacher_prompt_ids`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta modo de razonamiento explicito (thinking mode), capacidades de audio ni generacion general de texto.
- Capacidades multilingues: no disponible.
- Capacidad conversacional de proposito general: no disponible; los artefactos estan orientados a agentes en los tres benchmarks citados.

## Casos de uso

- Reproduccion del articulo de auditoria: cargar los checkpoints publicados y los parquet de entrenamiento para replicar las condiciones experimentales descritas en el paper y verificar sus conclusiones sobre el post-entrenamiento con modelos del mundo.
- Ablacion de objetivos desalineados: comparar el comportamiento de un agente entrenado con objetivos GT frente a uno entrenado con los ficheros mismatched-target, usando `true_next_state` para auditar en que punto diverge la prediccion del modelo respecto al estado real.
- Auditoria de pipelines de post-entrenamiento: inspeccionar la estructura de los datos (prompts, `teacher_prompt_ids`, procedencia en `extra_info`) para evaluar riesgos de fuga de informacion o de senal espuria antes de reutilizarlos en un entrenamiento propio.
- Evaluacion estandarizada en VisualWebArena: emplear la lista de 201 tareas (`tasks_eval.jsonl`) como conjunto fijo de evaluacion para comparar checkpoints propios contra los publicados en este repositorio.
- Investigacion en agentes textuales: partir de los checkpoints de ALFWorld o ScienceWorld como linea base en estudios sobre planificacion multi-paso, exploracion y uso de memoria en entornos parcialmente observables.
- Docencia y formacion: usar los ficheros de 20.000 muestras como material de practicas sobre como se construyen objetivos de entrenamiento para agentes y que efecto tiene la calidad de esos objetivos.
- Construccion de pipelines de datos para agentes: reutilizar el esquema de los parquet (prompt, objetivo, procedencia, estado siguiente) como plantilla para generar datasets propios en entornos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion se han omitido de forma intencionada del repositorio, por lo que no existen cifras verificables de exito en tareas de ALFWorld, ScienceWorld o VisualWebArena asociadas a estos checkpoints.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio ocupa 110,3 GB en total, pero esa cifra incluye pesos y datos parquet, y la informacion no indica cuantos checkpoints se publican ni con que precision estan almacenados, por lo que no puede derivarse el tamano de un checkpoint individual.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende del numero de parametros y de la precision de los checkpoints, dato no publicado.
- Opciones de despliegue: no disponible. El unico formato confirmado es safetensors; no se mencionan GGUF, cuantizaciones de 4 u 8 bits, ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Como referencia generica (no especifica de este repositorio), los pesos en fp16 ocupan aproximadamente 2 GB por cada 1.000 millones de parametros, y en cuantizacion de 4 bits en torno a 0,5 GB por cada 1.000 millones. Cualquier estimacion de VRAM para este repositorio exige conocer previamente el tamano de los checkpoints.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica los modelos base sobre los que se hicieron los ajustes ni otros repositorios de artefactos de auditoria comparables, y los resultados de busqueda web obtenidos no guardan relacion con el modelo (corresponden a pruebas de velocidad de conexion a internet). Sin datos de parametros, contexto, licencia o rendimiento de los checkpoints, no es posible establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que los pesos heredan los terminos de sus modelos base, que no se identifican en la informacion disponible. Es obligatorio verificar las condiciones de cada modelo base antes de cualquier uso, en particular comercial.
- Los datos de benchmark y los artefactos derivados quedan sujetos a las licencias y terminos de los proyectos upstream correspondientes; hay que consultarlos antes de redistribuir.
- Ausencia total de resultados de evaluacion: no hay evidencia publicada de que los checkpoints funcionen correctamente en las tareas objetivo, y la omision de resultados es intencionada.
- Riesgo de alucinacion y de comportamiento erroneo: no cuantificado ni documentado.
- Alcance restringido: los checkpoints estan ajustados para tres entornos concretos (ALFWorld, ScienceWorld, VisualWebArena) y no deben tratarse como modelos de proposito general.
- Idiomas soportados no especificados: se desconoce el comportamiento fuera del ingles, que es el idioma habitual de estos benchmarks.
- Limitaciones de contexto: no disponible la longitud de contexto, un factor critico en tareas de agente con historiales largos.
- Trazabilidad incompleta: al no identificarse los modelos base, no puede auditarse la procedencia completa de los pesos.
- Depuracion parcial de los datos: se elimino la ruta absoluta de `gamefile` en ALFWorld, pero se conservan campos de procedencia de VisualWebArena (sitio, URL, accion, identificadores de ejecucion y episodio, indices). Conviene revisar si esos campos introducen informacion no deseada si los datos se reutilizan para entrenar.
- Anomalia de metadatos: la fecha de creacion registrada (25-09-2026) es posterior a la de publicacion habitual de repositorios consultados, por lo que conviene verificar la coherencia de los metadatos del repositorio.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senal de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/KosmoCHE/worldmodel-audit-release
- No se han encontrado en la busqueda web enlaces relevantes al paper, al repositorio de codigo, a demos ni a modelos base asociados. Los resultados obtenidos corresponden a paginas de pruebas de velocidad de conexion sin relacion con el modelo, por lo que no se incluyen.
