# Laboratoire-De-Chemoinformatique/SynPlanner-data

## Resumen

SynPlanner-data es el repositorio de datos oficial del proyecto SynPlanner, una herramienta de codigo abierto para planificacion retrosintetica desarrollada por el Laboratoire de Chemoinformatique de la Universidad de Estrasburgo. No se trata de un modelo de lenguaje generativo, sino de un conjunto empaquetado de artefactos necesarios para ejecutar el planificador: reglas de reaccion en formato SMARTS, pesos de redes neuronales de politica (ranking y filtering), pesos de la red de valor, conjuntos de building blocks comerciales y datos de reacciones procesados a partir de USPTO.

El repositorio resuelve un problema practico de reproducibilidad y despliegue: en lugar de que cada usuario tenga que extraer reglas, entrenar redes y curar building blocks por su cuenta, SynPlanner-data ofrece presets versionados que mapean nombres logicos a rutas de ficheros concretas. El preset principal, `synplanner-article`, reproduce la configuracion descrita en la publicacion de 2025 en el Journal of Chemical Information and Modeling.

La relevancia actual radica en que combina aprendizaje supervisado (GCN sobre USPTO filtrado) con busqueda MCTS guiada por redes de politica y valor, un paradigma establecido en retrosintesis computacional. El repositorio ocupa 3,7 GB e incluye 24.000 reglas de reaccion, redes GCN de hasta 298 MB y un conjunto de 186.000 building blocks con precios, lo que lo convierte en una base completa para experimentacion y produccion en quimica computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GCN (graph convolutional network) para politica y valor; busqueda MCTS para planificacion |
| Parametros totales | no disponible (pesos: ranking policy 157 MB, filtering policy 298 MB, value network 15 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato `.ckpt`; existen exportaciones ONNX segun tags) |
| Idiomas soportados | no disponible (dominio quimico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | `.ckpt` (checkpoints), `.tsv` (reglas y building blocks), `.yaml` (configuracion de pipeline), `.smi`/`.zip` (datos de reacciones) |

## Arquitectura y entrenamiento

El sistema combina tres redes neuronales de tipo GCN. La red de politica se desdobla en dos cabezas: una red de ranking (157 MB) que puntua la aplicabilidad de reglas de reaccion, y una red de filtering (298 MB) que descarta candidatos poco probables. La red de valor (15 MB) estima la distancia al producto objetivo durante la busqueda. Sobre estas redes opera una busqueda MCTS que expande el arbol retrosintetico aplicando reglas SMARTS extraidas de reacciones.

Los datos de entrenamiento proceden de USPTO: 1,48 millones de reacciones en bruto (`raw/uspto_full_mapped.smi.zip`, 165 MB), estandarizadas y filtradas con fecha 2024-12-31. El conjunto filtrado alimenta la extraccion de las 24.000 reglas de reaccion. La red de filtering se entrena con 600.000 moleculas de ChEMBL y COCONUT; la red de valor, mediante self-learning sobre 28.000 objetivos de ChEMBL y COCONUT. Los building blocks (186.000 moleculas con columnas de precio) provienen de eMolecules, Sigma Aldrich y Lancaster, estandarizados con la convencion `salt-ln`.

## Capacidades

- Planificacion retrosintetica multi-paso mediante busqueda MCTS guiada por politica y valor.
- Extraccion y aplicacion de reglas de reaccion en formato SMARTS (24.000 reglas en la version v1).
- Ranking y filtering de candidatos de reaccion con redes GCN supervisadas.
- Estimacion de coste sintetico via red de valor entrenada por self-learning.
- Uso de building blocks comerciales con informacion de precio para priorizar rutas economicamente viables.
- Benchmark integrado de 700 moleculas objetivo divididas en 7 bins de SAScore (1,5 a 8,5).
- Versionado por nombre (arquitectura/reglas/pesos) y por fecha (pipelines de datos).
- Descarga programatica de presets mediante `synplan.utils.loading.download_preset`.
- Exportacion a ONNX segun los tags del repositorio.

## Casos de uso

- Planificacion de rutas sinteticas en descubrimiento de farmacos: el planificador expande el arbol retrosintetico desde una molecula objetivo usando las 24.000 reglas y la busqueda MCTS, adecuado para equipos de quimica medicinal que necesitan rutas alternativas rapidamente.
- Priorizacion por coste de materiales: al integrar los 186.000 building blocks con precios de eMolecules, Sigma Aldrich y Lancaster, el sistema puede descartar rutas que requieran reactivos caros o no disponibles comercialmente.
- Reproduccion de resultados de investigacion: el preset `synplanner-article` permite replicar exactamente la configuracion del paper de 2025, util para revision por pares y comparativas justas.
- Benchmarking de nuevos planificadores: el conjunto `benchmarks/sascore` con 700 objetivos en 7 bins de dificultad sirve como suite estandar para evaluar variantes del algoritmo.
- Entrenamiento de modelos propios de retrosintesis: los datos de `reaction_data/` y `training_data/` permiten reentrenar las redes de politica y valor con protocolos documentados y versionados por fecha.
- Integracion en pipelines de quimica computacional: la API Python de SynPlanner y la descarga de presets facilitan incorporar la planificacion retrosintetica en flujos automatizados de diseño molecular.
- Docencia en quimica computacional: el repositorio ofrece un caso completo y reproducible de extraccion de reglas, entrenamiento de GCN y busqueda MCTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un conjunto de evaluacion (`benchmarks/sascore`, 700 objetivos en 7 bins de SAScore entre 1,5 y 8,5), pero la model card no reporta metricas de exito, tiempo de planificacion ni comparativas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 470 MB en total (ranking 157 MB + filtering 298 MB + valor 15 MB), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el cuello de botella es la busqueda MCTS, mas dependiente de CPU y memoria RAM que de VRAM.
- Cabe en GPU consumer: si, sin restricciones practicas por memoria de video.
- Almacenamiento: 3,7 GB para el repositorio completo; los presets descargan solo los ficheros referenciados.
- Opciones de despliegue: paquete Python `SynPlanner` (PyPI), descarga de presets via `download_preset`, y exportacion ONNX para integracion en otros runtimes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Herramienta | Tipo | Licencia | Datos incluidos | Contexto de uso |
|---|---|---|---|---|
| SynPlanner-data | Repositorio de datos + pesos GCN/MCTS | MIT | Reglas SMARTS, redes, building blocks, USPTO | Planificacion retrosintetica completa |
| AiZynthFinder | Planificador retrosintetico open source | MIT | Modelos de politica y filtros preentrenados | Alternativa directa en retrosintesis |
| Retro* | Planificador con busqueda guiada por red neuronal | Codigo abierto (verificar) | Pesos publicados por separado | Enfoque de busqueda con red de valor |
| Chemformer | Modelo transformer quimico | MIT (verificar) | Pesos en Hugging Face | Prediccion de reacciones y retrosintesis end-to-end |

La comparacion detallada de rendimiento entre estas herramientas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto libre ni mantiene conversaciones; su dominio es exclusivamente quimico.
- La calidad de las rutas depende de la cobertura de las 24.000 reglas extraidas de USPTO; reacciones poco representadas en el dataset pueden quedar sin ruta.
- Los building blocks con precio (186.000 moleculas) reflejan un snapshot comercial; la disponibilidad y precios reales pueden haber cambiado.
- Los directorios `standardized/2024-12-31/` y `filtered/2024-12-31/` aparecen como "to be added" en la model card, por lo que el pipeline completo de datos puede no estar aun publicado.
- El rendimiento en objetivos fuera de la distribucion de USPTO (quimica organometalica, polímeros, materiales) no esta documentado.
- La busqueda MCTS puede tener tiempos de planificacion elevados en objetivos complejos; no se reportan metricas de latencia.
- Licencia MIT permite uso comercial, pero se recomienda verificar las licencias de las fuentes de datos subyacentes (USPTO, ChEMBL, COCONUT, eMolecules) para produccion.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere adopcion temprana y poca validacion externa independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Laboratoire-De-Chemoinformatique/SynPlanner-data
- GitHub de SynPlanner: https://github.com/Laboratoire-de-Chemoinformatique/SynPlanner
- Documentacion: https://synplanner.readthedocs.io/
- Paquete PyPI: https://pypi.org/project/SynPlanner/
- Paper de referencia: Akhmetshin, T. et al. SynPlanner: An End-to-End Tool for Synthesis Planning. J. Chem. Inf. Model. 2025, 65(1), 15-21. DOI: https://doi.org/10.1021/acs.jcim.4c02004
