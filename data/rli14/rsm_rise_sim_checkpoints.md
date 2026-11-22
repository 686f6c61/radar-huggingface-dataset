# rli14/rsm_rise_sim_checkpoints

## Resumen

RSM x RISE simulation checkpoints es un repositorio de pesos entrenados para robotica y aprendizaje por refuerzo offline, publicado por el usuario rli14 en Hugging Face. No se trata de un modelo de lenguaje, sino de una coleccion de 912 ficheros (557,6 GiB) que contienen todos los checkpoints necesarios para reproducir las tablas del articulo RISE (arXiv 2510.19495). Los checkpoints cubren siete tareas de simulacion de MimicGen y robosuite: Square, Two-piece assembly, Mug cleanup y Threading, ademas de las mezclas beta de two-piece.

El repositorio agrupa varias familias de politicas y criticos: actores RISE (difusion con advantage-weighted BC, normalizacion espectral y aumento kNN), politicas IDQL, IFQL, BC-unificado y BC-experto, ablaciones de RISE, modelos sucesores RSM entrenados con flow condicional sobre caracteristicas DINOv2, cabezas hop gaussianas y baselines de world models (diffusion forcing, DINO-WM, LeWM). Incluye un manifiesto `manifest.tsv` que mapea cada fichero con su ruta de origen, hash SHA-256 y las celdas de tabla que lo cargan.

Su relevancia es de reproducibilidad: permite a investigadores de RL offline en robotica descargar exactamente los pesos que generan cada resultado publicado, con el codigo asociado en el repositorio hermano rli14/rsm_rise_code. No hay informacion sobre arquitectura de lenguaje, contexto ni idiomas porque no aplica a este tipo de artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politicas de difusion/flow para RL offline (RISE, IDQL, IFQL, BC) y modelos sucesores RSM sobre caracteristicas DINOv2; baselines de world models |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch `.pth`/`.pt` sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | PyTorch (`.pth`, `.pt`), `.npz` y `.json` para metadatos de cache |
| Tamano del repositorio | 597,2 GB (912 ficheros, 557,6 GiB segun la model card) |
| Tareas cubiertas | Square, Two-piece assembly, Mug cleanup, Threading (MimicGen/robosuite) y mezclas beta de two-piece |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura unica, sino un conjunto de familias de modelos entrenados con recetas distintas sobre las mismas tareas de manipulacion. La familia principal, RISE, combina un actor de difusion entrenado con behavior cloning ponderado por ventaja (advantage-weighted diffusion BC), normalizacion espectral, un critico IQL y aumento kNN mediante intercambio de muestras. Las variantes IDQL e IFQL emplean la misma pila con actores IDQL (sin normalizacion espectral, bottleneck ni aumento) y con un critico de flow, respectivamente. Las familias BC-unificado y BC-experto usan behavior cloning simple sobre todos los datos o solo sobre episodios exitosos.

Los modelos sucesores RSM se entrenan como un modelo de sucesor con flow condicional sobre caracteristicas DINOv2, con una variante entrenada mediante TD-flow (`TDF_*`). El repositorio incluye tambien cabezas hop gaussianas que alimentan la lectura en cadena del planificador, baselines de world models (diffusion forcing, DINO-WM, LeWM) y un bucle de iteracion de politica RSM por rondas. No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO, ya que el paradigma es RL offline sobre demostraciones y datos de simulacion.

## Capacidades

- Generacion de acciones de manipulacion robotica en las tareas Square, Two-piece assembly, Mug cleanup y Threading.
- Planificacion basada en modelos sucesores RSM sobre caracteristicas visuales DINOv2.
- Evaluacion de politicas de RL offline con criticos IQL y de flow.
- Reproduccion exacta de las celdas de las tablas del articulo RISE mediante el manifiesto `manifest.tsv`.
- Carga directa con `robomimic.utils.file_utils.policy_from_checkpoint` desde el fork de robomimic incluido en el repositorio de codigo.
- Soporte de ablaciones controladas: AWR beta, bottleneck, kNN, mezcla expert:play, ausencia de normalizacion espectral, tasa de aprendizaje, correccion del critico y critico DINO.
- Integracion con el planificador RSM mediante la variable de entorno `RSM_LIBERO_DIR` apuntando al freeze `rsm_libero_freeze_20261002`.

## Casos de uso

- Reproduccion de resultados academicos: descargar los checkpoints exactos que carga cada celda de tabla del articulo RISE y reejecutar la evaluacion con el codigo de rsm_rise_code, garantizando comparaciones justas entre metodos.
- Investigacion en RL offline: usar las familias RISE, IDQL e IFQL como lineas base para probar nuevas recetas de actor o critico sobre las mismas tareas de robosuite.
- Estudio de modelos sucesores: entrenar o evaluar planificadores RSM sobre caracteristicas DINOv2 usando los checkpoints `rsm/<M,L40>/ckpt_best.pt` y las estadisticas de caracteristicas en `cache/feat_stats.npz`.
- Ablaciones controladas: comparar variantes `awrb*`, `bn*`, `dt*`, `mix*`, `nsn`, `lr05`, `cfixT30` y `dinodq` para aislar el efecto de cada componente del recipe RISE.
- Benchmarking de world models: emplear los baselines `wm/df_*`, `wm/dinowm` y `wm/lewm` como referencia de lectura de valor frente a los modelos sucesores.
- Iteracion de politica: aprovechar los directorios `rsmpi/<task>/round<k>/` con proposer, `rsm/final.pt` y `hop/policy.pt` por ronda para estudiar el bucle de mejora de politica descrito en la rebuttal R2.
- Transferencia a robot real: usar estos checkpoints de simulacion como punto de partida junto con los repositorios de checkpoints reales enlazados en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas del articulo (`docs/MASTER_TABLE.md`, `docs/DELIVERABLE_SUMMARY.md` y las tablas LaTeX en `docs/tex` del repositorio de codigo) para consultar las metricas por tarea y celda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la familia de checkpoint cargada y del tamano del actor o critico, no especificado en la informacion.
- GPU recomendadas: no disponible en la model card; al tratarse de politicas de difusion y modelos sucesores sobre DINOv2, se requiere una GPU con soporte CUDA, pero no se indican modelos concretos.
- Capacidad en GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante el fork de robomimic incluido en `rsm_rise_code/code_src/rise_robomimic` y el planificador `rsm_scorer.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 597,2 GB, por lo que se recomienda descarga selectiva por tarea o por familia con `hf download --include`.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rli14/rsm_rise_sim_checkpoints | Checkpoints de RL offline para robotica | 597,2 GB (repo) | no aplica | other | Hugging Face |
| rli14/rsm_rise_code | Codigo asociado (fork de robomimic, planificador RSM) | no disponible | no aplica | no disponible | Hugging Face |
| rli14/rsm_cooking_v5_checkpoints | Checkpoints de robot real | no disponible | no aplica | no disponible | Hugging Face |
| rli14/rsm_real_checkpoints | Checkpoints de robot real | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de informacion sobre modelos de terceros comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni generacion de codigo; cualquier uso fuera de RL offline en robotica requiere adaptacion.
- La licencia es "other" y no se detallan sus terminos en la informacion disponible; es necesario revisar el texto completo antes de un uso comercial.
- El repositorio es muy grande (597,2 GB) y la descarga completa puede ser inviable; conviene usar descargas selectivas por tarea o familia.
- Los checkpoints dependen de un fork especifico de robomimic y de un freeze concreto (`rsm_libero_freeze_20261002`); cargarlos con otras versiones puede fallar o alterar resultados.
- Las rutas de origen (`source_path`) corresponden a un cluster concreto y no son portables; hay que remapearlas localmente.
- El rendimiento esta acotado a las siete tareas de simulacion cubiertas; no hay evidencia en la informacion disponible sobre generalizacion a otras tareas o entornos.
- Riesgo de sobreajuste a las condiciones de simulacion de MimicGen/robosuite; la transferencia a robot real requiere los checkpoints reales enlazados y validacion adicional.
- No se documentan sesgos, tasas de alucinacion ni limitaciones idiomaticas porque el artefacto no procesa lenguaje natural.

## Enlaces

- Repositorio de checkpoints: https://huggingface.co/rli14/rsm_rise_sim_checkpoints
- Codigo asociado: https://huggingface.co/rli14/rsm_rise_code
- Checkpoints de robot real (cooking v5): https://huggingface.co/rli14/rsm_cooking_v5_checkpoints
- Checkpoints de robot real: https://huggingface.co/rli14/rsm_real_checkpoints
- Articulo RISE: arXiv 2510.19495 (referenciado en la model card como https://arxiv.org/abs/2510.19495)
