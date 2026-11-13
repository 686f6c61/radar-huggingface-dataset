# CUMTHenry/compdiffuser_checkpoints

## Resumen

CompDiffuser checkpoints es un repositorio de pesos de investigacion para planificacion y control en aprendizaje por refuerzo offline, publicado por el usuario CUMTHenry (autor del repositorio de codigo Henry0132/comp_flow_map). No es un modelo de lenguaje: contiene checkpoints de planificadores basados en modelos de difusion y de estudiantes de consistencia por chunks, entrenados sobre los entornos de OGBench (antmaze, antsoccer, cube, humanoidmaze y pointmaze). El repositorio esta pensado como almacen de pesos y configuraciones, sin resultados de rollout ni videos de evaluacion.

El contenido principal son planificadores/denoisers de tipo CompDiffuser (arquitecturas DiT y variantes con atencion y padding de buffer) junto con modelos de dinamica inversa y, en un solo caso (`antmaze-giant-stitch-v0`), un estudiante de consistencia por chunks destilado del profesor. Ademas incluye controladores de bajo nivel entrenados con DQL para las cuatro tareas Cube (single, double, triple y quadruple). El tamano del repositorio es de 24 GB y la licencia es MIT.

Su relevancia es acotada y muy especifica: sirve para reproducir experimentos de planificacion con modelos de difusion y de consistencia en OGBench, y para reutilizar controladores de bajo nivel ya entrenados en tareas Cube. No ofrece inferencia de texto, vision ni capacidades generativas de proposito general, y no se han publicado idiomas soportados ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusion (planificador/denoiser, mayoritariamente DiT y variantes con atencion) y modelos de consistencia por chunks; modelos de dinamica inversa; controladores DQL para Cube |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la nomenclatura de experimentos incluye `T512` y `T1000`, pero no se documenta su significado exacto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoints de PyTorch) y `.pkl` (configuraciones); `.pth` para los controladores DQL |

## Arquitectura y entrenamiento

El repositorio agrupa checkpoints de tres componentes por tarea: un planificador/denoiser de difusion (CompDiffuser), un modelo de dinamica inversa que traduce transiciones en acciones y, cuando existe, un estudiante de consistencia por chunks destilado del profesor de difusion. Los nombres de los experimentos codifican dimensiones de observacion y objetivo (por ejemplo, `o2d`, `o17d`, `o69d`), la arquitectura (`DiTd768`, `DiTd1024dp12`, `MditD384`, `MditD512`), el padding de buffer (`PadBuf`), el tamano de fragmento (`Ft64`), el stride (`fs4`), la dimension oculta (`h160`, `h336`) y el solapamiento (`ovlp56`, `ovlp128`). Los pasos guardados oscilan entre 200k y 1800k segun el experimento.

El entrenamiento se realizo sobre entornos de OGBench con datasets de tipo `stitch` y `play`. La model card indica que los checkpoints de consistencia por chunks incluyen ademas `optimizer`, `consistency`, `teacher` y `checkpoint_schema_version`, lo que refleja un proceso de destilacion con profesor. No se especifica el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO, ya que no aplica a este dominio. La model card advierte de que los nombres de fichero por paso pueden diferir del campo interno `step`, porque la publicacion original nombraba los ficheros por epoca.

## Capacidades

- Planificacion de trayectorias en entornos de control continuo de OGBench mediante modelos de difusion.
- Modelado de dinamica inversa para inferir acciones a partir de transiciones.
- Destilacion de un estudiante de consistencia por chunks a partir de un profesor de difusion (solo `antmaze-giant-stitch-v0`).
- Control de bajo nivel en tareas Cube (single, double, triple y quadruple) mediante controladores DQL preentrenados.
- Reutilizacion de configuraciones completas por experimento: `model_config.pkl`, `dfu_model.pkl`, `dataset_config.pkl`, `small_trainer_config.pkl`, `inv_trainer_config.pkl` y `render_config.pkl`.
- Trazabilidad de metricas de entrenamiento mediante `train_metrics.jsonl` (append-only).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, vision, audio ni capacidades multilingues.

## Casos de uso

- Reproduccion de experimentos de planificacion con difusion en OGBench: cargar los checkpoints de `<dataset>/diffusion/<experiment>/` y las configuraciones correspondientes para replicar los resultados del codigo `comp_flow_map` sin reentrenar desde cero.
- Investigacion en destilacion de modelos de consistencia: usar el profesor de `antmaze-giant-stitch-v0` y sus estudiantes de consistencia por chunks en los pasos 200k, 400k y 600k para estudiar la degradacion o estabilidad de la destilacion a lo largo del entrenamiento.
- Control de bajo nivel en tareas Cube: reutilizar `actor_200.pth`, `critic_200.pth`, `critic_target_200.pth` y `variant.json` en `dql_results/` para las cuatro variantes de Cube, evitando entrenar controladores DQL desde cero.
- Comparacion de arquitecturas de denoiser: contrastar variantes `DiTd768`, `DiTd1024dp12` y `MditD384`/`MditD512` sobre las mismas tareas para analizar el efecto de la dimension del modelo y del padding de buffer.
- Estudio de dinamica inversa: usar los modelos `invdyn` con distintas dimensiones ocultas (`h12`, `h80`, `h100`, `h120`) para analizar el impacto de la capacidad del modelo inverso en tareas antmaze, antsoccer y humanoidmaze.
- Analisis de escalado de pasos de entrenamiento: comparar checkpoints a 800k, 1200k, 1600k y 1800k en las mismas tareas para estudiar la evolucion del rendimiento del planificador.
- Integracion en pipelines de evaluacion offline: combinar los checkpoints con el script `download_artifacts_from_hf.sh` para reconstruir la estructura `logs/` esperada por el codigo y ejecutar evaluaciones reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card excluye deliberadamente los resultados de rollout y los videos de evaluacion, y no incluye metricas numericas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 24 GB en disco, pero no se detalla el tamano de cada checkpoint ni su huella en memoria.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. Depende del tamano de cada checkpoint individual, que no se documenta.
- Opciones de despliegue: el codigo de referencia es `Henry0132/comp_flow_map` (PyTorch). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CompDiffuser checkpoints (este repositorio) | Difusion + consistencia para RL offline en OGBench | no disponible | no disponible | MIT | Pesos publicados en Hugging Face |
| CompDiffuser (repositorio original `devinluo27/comp_diffuser_release`) | Planificador de difusion para RL offline | no disponible | no disponible | no disponible en la informacion | Codigo en GitHub |
| CDGS (`UtkarshMishra04/CDGS_ogbench`) | Planificacion con difusion sobre OGBench | no disponible | no disponible | no disponible en la informacion | Codigo en GitHub |
| RCD (`refining-compositional-diffusion.github.io`) | Difusion composicional | no disponible | no disponible | no disponible en la informacion | Proyecto web |

No se dispone de datos de rendimiento ni de parametros de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni soporta tareas de NLP, vision o audio.
- Solo `antmaze-giant-stitch-v0` incluye estudiante de consistencia por chunks; el resto de tareas carece de este componente.
- El estudiante de consistencia de `antmaze-giant-stitch-v0` seguia entrenando cuando se subieron los pesos, por lo que pueden aparecer checkpoints posteriores en una revision futura.
- La planificacion requiere ademas los datasets y los assets por tarea de cada entorno, que no forman parte del repositorio.
- Los nombres de fichero por paso pueden no coincidir con el campo interno `step`, ya que la publicacion original nombraba los ficheros por epoca.
- `train_metrics.jsonl` es append-only y crece durante el entrenamiento, por lo que su tamano puede diferir de la copia local.
- Los significados de `ts` en los nombres de experimento no estan documentados; hay que leer `args.json` y `model_config.pkl` para obtener los valores exactos.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma, ya que no aplican al dominio del modelo.
- La licencia MIT permite uso comercial, pero deben conservarse los avisos de los proyectos upstream (RCD, CompDiffuser, CDGS y OGBench) y citarse los trabajos correspondientes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CUMTHenry/compdiffuser_checkpoints
- Codigo de referencia: https://github.com/Henry0132/comp_flow_map
- Licencia: https://github.com/Henry0132/comp_flow_map/blob/main/LICENSE
- RCD (Refining Compositional Diffusion): https://refining-compositional-diffusion.github.io/
- CompDiffuser (repositorio original): https://github.com/devinluo27/comp_diffuser_release
- CDGS: https://github.com/UtkarshMishra04/CDGS_ogbench
- OGBench: https://github.com/seohongpark/ogbench
