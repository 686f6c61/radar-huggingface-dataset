# ru1ch3n/PDE-OBS-excluded-checkpoints

## Resumen

PDE-OBS-excluded-checkpoints es un repositorio de pesos publicado por el usuario ru1ch3n en HuggingFace que no contiene un modelo entrenado para inferencia, sino el archivo de los checkpoints descartados de la campana de octubre de 2026 del proyecto PDE-OBS, un benchmark de evaluacion controlada de operadores neuronales para ecuaciones en derivadas parciales (PDE) con observaciones parciales. El repositorio acompana al articulo arXiv:2609.36521, firmado por Ruichen Xu, Siyao Wang, Fang Wan, Jiacheng Qiu, Wenhan Gao, Jiaxing Zhang, Linsey Pang, Ravid Shwartz-Ziv, Yann LeCun y Yuefan Deng, y su funcion es documental: preservar el registro completo de los entrenamientos que no contribuyen a las tablas de resultados publicadas.

El contenido son ficheros `weights.pt` con el `model_state` de cada ejecucion, junto con `model.json` (clase de exclusion, estado en la cola de entrenamiento, registro de fallo de-identificado y hashes SHA-256) y, cuando existe, `history.json` con el historial de entrenamiento por epoca. No hay tokenizador, no hay configuracion de inferencia resuelta y no hay pipeline declarado, por lo que no es un modelo utilizable directamente con `transformers` ni con APIs de generacion de texto.

Su relevancia es metodologica: expone de forma explicita las recetas descartadas, los planes superados, los entrenamientos que colapsaron a salida constante o sufrieron gradientes descontrolados y los intentos anulados por fallos de infraestructura. Es material de auditoria y reproducibilidad para investigadores en scientific machine learning, no un artefacto de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (operadores neuronales para PDE; variantes DeepONet mencionadas en la campana) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, diccionario con clave `model_state`, formato `pdeobs-october2026-weights/1`) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura unica: agrupa los pesos de multiples ejecuciones de entrenamiento de operadores neuronales para PDE bajo recetas congeladas del benchmark PDE-OBS. La model card menciona explicitamente ejecuciones DeepONet (`e2`, del 1 y 2 de octubre de 2026) como experimento previo a la campana, y organiza el resto por cohortes y `run_id`. No se detallan el numero de capas, dimensiones ocultas ni el volumen de tokens o muestras de entrenamiento en la informacion disponible.

Las ejecuciones se clasifican en seis clases de exclusion: `development_screen` (barridos de receta y learning rate: `V2dev`, `V4dev`, `H0dev`, `H3dev`, `H0prof`), `superseded_plan_block` (etapas antiguas del plan `H2`, `H3`, `H5`, `H7`, `P2`, sustituidas por el plan V2 del 5 de octubre de 2026), `failed_training` (patologias de entrenamiento: colapso a salida constante o gradiente grande sostenido), `voided_attempt` (repeticiones tras fallo de infraestructura, con cuatro directorios que contienen ficheros truncados), `pipeline_check` (ejecuciones `PIPECHECK` que comparan el bucle de entrenamiento congelado con el optimizado) y `pre_campaign_experiment` (las ejecuciones DeepONet `e2`). No se indica si hubo RLHF, DPO ni ninguna fase de alineacion, lo que es coherente con un benchmark cientifico.

Como innovacion tecnica destacable, el repositorio aplica de-identificacion de registros de fallo sustituyendo rutas, cuentas, nodos, jobs y sitios por los marcadores `<PATH>`, `<USER>`, `<NODE>`, `<JOB>` y `<SITE>`, y en los ocho `run_id` de `PIPECHECK` sustituye el nombre de cuenta por una letra. Se excluyen deliberadamente los estados de optimizador, scheduler y RNG, asi como la configuracion resuelta de cada ejecucion.

## Capacidades

- No es un modelo de inferencia: no genera texto, no responde a prompts y no tiene pipeline declarado.
- Alberga pesos de operadores neuronales entrenados para aproximar soluciones de PDE bajo patrones de observacion parcial.
- Preserva el historial de entrenamiento por epoca (`history.json`) con campos exclusivamente numericos, util para analisis de curvas de perdida y deteccion de patologias.
- Documenta fallos de entrenamiento de forma estructurada y de-identificada, lo que permite estudiar modos de colapso y desestabilizacion.
- Incluye un `manifest.json` con la relacion completa de ejecuciones, clases, ficheros, hashes SHA-256 y tamanos, ademas de recuentos por clase y cohorte.
- Permite cargar cada checkpoint con `torch.load(path, map_location="cpu", weights_only=True)["model_state"]`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Auditoria de resultados cientificos: reconstruir que ejecuciones quedaron fuera de las tablas del articulo arXiv:2609.36521 y con que clase de exclusion, verificando la integridad de cada fichero mediante los SHA-256 del `manifest.json`.
- Analisis de patologias de entrenamiento: cargar los checkpoints de `failed_training` y comparar sus curvas en `history.json` con las de las recetas congeladas para identificar umbrales de colapso a salida constante o de gradiente descontrolado.
- Reproduccion de barridos de hiperparametros: los `development_screen` (`V2dev`, `V4dev`, `H0dev`, `H3dev`, `H0prof`) permiten contrastar las recetas descartadas con las recetas congeladas en `configs/paper/october/recipes.yaml` del repositorio de codigo.
- Verificacion de pipelines de entrenamiento: las ocho ejecuciones `PIPECHECK` sirven para validar que el bucle optimizado reproduce el comportamiento del bucle congelado antes de lanzar campanas costosas.
- Estudio de operadores neuronales para PDE: los pesos DeepONet de la fase `pre_campaign_experiment` (`e2`) permiten analizar el comportamiento de esta familia de operadores en regimen de observacion parcial.
- Docencia y formacion: usar los registros de fallo de-identificados como material didactico sobre buenas practicas de registro experimental y gestion de campanas de entrenamiento a gran escala.
- Gestion de trazabilidad en clusters: el esquema de cohortes, `run_id` y estados de cola documenta como archivar intentos anulados por fallos de infraestructura sin romper la cadena de custodia de los artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que ningun checkpoint de este repositorio contribuye a las tablas de resultados del articulo; las ejecuciones fallidas aparecen alli unicamente como filas de fallo.

## Requisitos de hardware

- El repositorio ocupa 3.5 GB en total, repartidos entre multiples checkpoints; el requisito de VRAM depende del checkpoint concreto, que no se especifica en la informacion disponible.
- La carga documentada es en CPU (`map_location="cpu"`), suficiente para inspeccion, calculo de hashes y analisis de tensores.
- Para reanudar o evaluar un checkpoint en GPU se requiere conocer su arquitectura y numero de parametros, datos no publicados en esta ficha; no es posible estimar VRAM de forma fiable.
- No se recomienda su despliegue con vLLM, TGI, llama.cpp ni Ollama: no hay tokenizador, no hay formato GGUF y no existe interfaz de generacion.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Repositorio | Contenido | Proposito | Licencia | Uso directo |
|---|---|---|---|---|
| `ru1ch3n/PDE-OBS-excluded-checkpoints` | Pesos de ejecuciones excluidas de la campana de octubre de 2026 | Archivo y auditoria | MIT | No (solo inspeccion) |
| `ru1ch3n/PDE-OBS` (modelos) | Modelos publicados del benchmark | Evaluacion e inferencia cientifica | MIT | Si, segun model card |
| `ru1ch3n/PDE-OBS` (dataset) | Datos y resultados del benchmark | Reproduccion experimental | MIT | Si, como datos |

No se dispone de informacion sobre otros benchmarks de operadores neuronales comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: carece de tokenizador, configuracion de inferencia y pipeline; no puede usarse para generacion de texto ni para tareas de NLP.
- Por diseno, ningun checkpoint de este repositorio respalda un resultado publicado; usarlos para afirmar el rendimiento del benchmark seria incorrecto.
- Cuatro directorios de `voided_attempt` contienen ficheros de checkpoint truncados y no pudieron archivarse; aparecen en `manifest.json` bajo `not_included`.
- Se han eliminado los estados de optimizador, scheduler y RNG, por lo que no es posible reanudar el entrenamiento exactamente desde estos ficheros.
- La configuracion resuelta de cada ejecucion no se incluye porque contenia rutas de maquina; parte del contexto experimental solo es recuperable desde el codigo del benchmark.
- Los registros de fallo estan de-identificados, lo que limita la trazabilidad a nivel de nodo, cuenta o sitio.
- No se especifican sesgos, riesgos de alucinacion ni limitaciones idiomaticas porque el artefacto no es un modelo de lenguaje.
- La licencia MIT permite uso comercial de los ficheros, pero su valor comercial es practicamente nulo al tratarse de pesos descartados; conviene citar el articulo original en cualquier reutilizacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion externa por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ru1ch3n/PDE-OBS-excluded-checkpoints
- Repositorio de modelos publicados: https://huggingface.co/ru1ch3n/PDE-OBS
- Repositorio de datos y resultados: https://huggingface.co/datasets/ru1ch3n/PDE-OBS
- Codigo del benchmark: https://github.com/ru1ch3n/PDE-OBS
- Articulo: arXiv:2609.36521, *PDE-OBS: Controlled Evaluation Across Observation Patterns* (Ruichen Xu et al., 2026)
