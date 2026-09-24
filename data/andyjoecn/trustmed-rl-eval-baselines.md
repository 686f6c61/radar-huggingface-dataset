# andyjoecn/TrustMed-RL-eval-baselines

## Resumen

`andyjoecn/TrustMed-RL-eval-baselines` no es un modelo de lenguaje con pesos entrenados, sino un repositorio de artefactos de evaluacion. Concretamente, contiene las salidas de rollouts generadas por el script `Eval/code/baselines/run_arm.py` sobre un entorno de consulta medica congelado, con evidencia restringida a recortes de imagen ("crops-only evidence") y un paciente simulado implementado con `gpt-4.1-mini`.

El material se organiza en un directorio por brazo de evaluacion (`<arm_id>`) y pasada (`pass<N>`), con la estructura `clean/{trajectories.jsonl, summary.json, arm.json, run_manifest.json, driver.log, state/usage.jsonl}`. La evaluacion se ejecuto sobre un split de test congelado de 2.500 casos. Segun la propia model card, no se ha aplicado ningun juez sobre las trayectorias, de modo que el repositorio contiene trazas sin puntuar y el autor indica que deben puntuarse con `baselines/cluster/judge_and_score.sh`.

La relevancia de este repositorio es metodologica: sirve como linea base reproducible para comparar variantes de un agente clinico multimodal (el proyecto TrustMed-RL, asociado a checkpoints Qwen3-VL-8B) bajo un entorno y un conjunto de test fijados. El repositorio ocupa 0,1 GB, no declara licencia ni idiomas, y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (repositorio de resultados de evaluacion, sin pesos de modelo) |
| Parametros totales | No aplicable (no contiene pesos) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de los modelos evaluados, no declarada) |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No aplicable; artefactos en JSONL y JSON (`trajectories.jsonl`, `summary.json`, `arm.json`, `run_manifest.json`, `driver.log`, `state/usage.jsonl`) |
| Tamano del repositorio | 0,1 GB |
| Tag declarado | `region:us` |
| Pipeline declarado | No disponible |
| Fecha de creacion | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

Este repositorio no define ni entrena ninguna arquitectura neuronal. Su contenido es la traza de ejecucion de un arnés de evaluacion: por cada brazo (`arm_id`) y pasada (`pass<N>`) se guardan trayectorias completas, un resumen, la definicion del brazo, un manifiesto de ejecucion, el log del driver y el consumo registrado en `state/usage.jsonl`. El entorno de consulta esta congelado y la evidencia disponible para el agente se limita a recortes de imagen, lo que situa la tarea en el terreno de los agentes multimodales con recuperacion de evidencia visual.

Segun la model card, el paciente simulado se implementa con `gpt-4.1-mini` y el conjunto de evaluacion es un split de test congelado de 2.500 casos. Los modelos evaluados como brazos del experimento no se detallan en la informacion disponible. Los resultados de busqueda vinculan al mismo autor con checkpoints derivados de Qwen3-VL-8B (`TrustMed-RL-grpo-seed3-Qwen3VL-8B`, de 88,5 GB y formato safetensors, y `TrustMed-RL-grpo-seed1-v7-Qwen3VL-8B`), lo que sugiere que el proyecto TrustMed-RL entrena agentes multimodales de 8.000 millones de parametros mediante GRPO. No obstante, la model card del repositorio analizado no confirma que esos checkpoints sean los brazos aqui evaluados, por lo que no debe asumirse.

## Capacidades

- Almacenamiento de trayectorias de agente completas en formato JSONL, una por caso y pasada.
- Registro de metadatos de ejecucion reproducibles: `arm.json` y `run_manifest.json` permiten reconstruir la configuracion del brazo y del lanzamiento.
- Trazabilidad de coste y uso mediante `state/usage.jsonl`.
- Soporte de multiples brazos y multiples pasadas por brazo, lo que habilita analisis de varianza entre pasadas.
- Evaluacion sobre un entorno de consulta congelado con evidencia restringida a recortes de imagen.
- Integracion con un flujo de puntuacion externo (`baselines/cluster/judge_and_score.sh`), no incluido como resultado en el repositorio.
- Cobertura de un split de test de 2.500 casos.
- No incorpora capacidades de generacion, razonamiento, codigo, tool calling ni agentes por si mismo; estas dependen de los modelos evaluados.

## Casos de uso

- Reproduccion de lineas base: un equipo que desarrolle un agente clinico puede descargar estas trayectorias y puntuarlas con el mismo juez para obtener cifras comparables con las suyas, siempre que respete el entorno congelado y el split de 2.500 casos.
- Analisis de varianza entre pasadas: al existir varios directorios `pass<N>` por brazo, es posible medir la estabilidad del agente entre ejecuciones y detectar comportamientos dependientes de la semilla o de la temperatura de muestreo.
- Auditoria de trayectorias: `trajectories.jsonl` permite inspeccionar paso a paso que evidencia visual consulto el agente y en que orden, util para diagnosticar fallos de razonamiento clinico o de recuperacion de recortes.
- Estimacion de coste por consulta: `state/usage.jsonl` y `summary.json` permiten calcular tokens y latencia por caso, informacion necesaria para decidir si un agente es viable en produccion hospitalaria.
- Desarrollo y calibracion de jueces automaticos: al no venir puntuadas las trayectorias, este repositorio es un banco de pruebas para validar un juez antes de aplicarlo a experimentos propios, comparando su salida con revision humana.
- Comparacion de estrategias de agente: dado que cada brazo se ejecuta sobre el mismo entorno y test, se pueden aislar mejoras atribuibles a cambios de prompt, de politica o de recuperacion de evidencia sin contaminacion por cambios en los datos.
- Docencia e investigacion en evaluacion de IA clinica: las trayectorias sirven como material de estudio sobre como se comporta un agente con evidencia visual limitada y paciente simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha aplicado ningun juez sobre las trayectorias (`No judge applied`), por lo que el repositorio contiene rollouts sin puntuar. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de metricas clinicas para este repositorio. Ademas, la model card senala que los segmentos de discrepancia (`mm_*`) estan pendientes del banco de donantes del filtro de integridad, lo que implica que la evaluacion puede estar incompleta.

## Requisitos de hardware

- VRAM para inferencia: no aplicable al repositorio en si, ya que no contiene pesos. Unos 0,1 GB de disco son suficientes para descargar y almacenar los artefactos.
- GPU recomendadas para el modelo: no disponible. No se especifica que modelos se evaluaron como brazos.
- Ejecucion en GPU de consumo: no aplicable a este repositorio. Si los brazos evaluados derivan de Qwen3-VL-8B, un checkpoint de 8.000 millones de parametros en precision de 16 bits requeriria del orden de 16 GB de VRAM solo para pesos, mas el coste de la cache KV y del procesamiento de imagen, lo que lo situaria al limite de una RTX 4090 de 24 GB en configuraciones de contexto reducido; esta estimacion es orientativa y no procede de la informacion proporcionada.
- Opciones de despliegue: no disponibles para este repositorio. La puntuacion se realiza mediante un script de shell (`baselines/cluster/judge_and_score.sh`) sobre un cluster, lo que sugiere un flujo de ejecucion distribuido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion directa no es posible porque este repositorio no es un modelo. Se incluyen, a modo de contexto, los artefactos relacionados del mismo autor detectados en la busqueda web, advirtiendo de que la relacion entre ellos y los brazos evaluados no esta confirmada.

| Artefacto | Tipo | Parametros | Formato | Tamano | Licencia |
|---|---|---|---|---|---|
| `andyjoecn/TrustMed-RL-eval-baselines` | Rollouts de evaluacion | No aplicable | JSONL / JSON | 0,1 GB | No disponible |
| `andyjoecn/TrustMed-RL-grpo-seed3-Qwen3VL-8B` | Checkpoint de modelo | 8.000 millones (inferido de la denominacion) | Safetensors | 88,5 GB | No disponible |
| `andyjoecn/TrustMed-RL-grpo-seed1-v7-Qwen3VL-8B` | Checkpoint de modelo | 8.000 millones (inferido de la denominacion) | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento, contexto ni licencia para ninguno de los tres, por lo que no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo utilizable para inferencia; no debe confundirse con un checkpoint.
- Las trayectorias no estan puntuadas: no existe ningun juez aplicado, de modo que cualquier metrica debera generarse externamente.
- Los segmentos de discrepancia (`mm_*`) estan pendientes del banco de donantes del filtro de integridad, lo que puede dejar la evaluacion incompleta o sesgada hacia los casos no discrepantes.
- El paciente simulado es `gpt-4.1-mini`, un modelo propietario; los resultados dependen de ese componente y no son reproducibles si la version del servicio cambia.
- El entorno de consulta y el split de test son congelados, lo que favorece la comparabilidad pero limita la generalizacion a otros dominios o flujos clinicos.
- La evidencia se restringe a recortes de imagen ("crops-only"), lo que no refleja un acceso documental completo y puede penalizar a agentes que dependan de texto integro.
- No se declara licencia ni idiomas, lo que impide determinar si el uso comercial es posible.
- El ambito es clinico: cualquier aplicacion derivada exige validacion por profesionales sanitarios y cumple la normativa aplicable de datos y dispositivos medicos.
- No hay informacion sobre sesgos demograficos, poblacion de los 2.500 casos ni procedencia de los datos.
- El repositorio no registra descargas ni interacciones, por lo que no existe evidencia de uso o validacion por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/andyjoecn/TrustMed-RL-eval-baselines
- Checkpoint relacionado: https://huggingface.co/andyjoecn/TrustMed-RL-grpo-seed3-Qwen3VL-8B
- Arbol de ficheros del checkpoint relacionado: https://huggingface.co/andyjoecn/TrustMed-RL-grpo-seed3-Qwen3VL-8B/tree/main
- Documentacion de evaluaciones del proyecto TrustMed AI: https://github.com/shitijkarsolia/trustmed-ai/blob/main/EVALUATIONS/README.md
- Ficha de terceros del checkpoint `TrustMed-RL-grpo-seed1-v7-Qwen3VL-8B`: https://savrn.com/models/trustmed-rl-grpo-seed1-v7-qwen3vl-8b
