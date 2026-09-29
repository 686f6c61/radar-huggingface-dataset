# mulligan/sim-square-broad-r02-auto-iql-n32-divl

## Resumen

`mulligan/sim-square-broad-r02-auto-iql-n32-divl` es un agente de control para robotica basado en estados (no procesa lenguaje natural ni imagenes) publicado por la organizacion Mulligan. Se trata de un checkpoint de la ronda R2 de la campana `sq_d1_r2_auto_iql_n32`, entrenado hasta el paso 250001, que combina un actor de difusion congelado heredado del modelo padre `sim-square-broad-r02-auto-iql-n32-idql` con un critico DIVL de tipo distribucional. El repositorio incluye cinco semillas independientes (seed-1 a seed-5), cada una en su propia carpeta, con los ficheros `policy.pt` y `stats.json`.

El modelo resuelve la tarea `sim-square-broad`, una tarea de manipulacion cuadrada en simulacion, dentro del ecosistema de evaluacion Mulligan (Policy Arena). Su relevancia es acotada y de nicho: sirve como punto de comparacion reproducible para estudiar si un critico distribucional (DIVL) mejora el comportamiento de un actor de difusion ya entrenado, manteniendo el actor congelado para aislar el efecto del critico. No es un modelo de proposito general ni un modelo de lenguaje.

El checkpoint tiene un peso de repositorio de 1,4 GB en total (las cinco semillas mas metadatos). Los ficheros son copias byte a byte de artefactos de Weights & Biases, con MD5 verificado contra el manifiesto del artefacto y SHA-256 registrado en `release.json`. La licencia es Apache 2.0. No hay datos de benchmarks publicos comparativos en la informacion disponible mas alla de la evaluacion propia incluida en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion congelado (heredado del modelo padre) mas critico DIVL distribucional; agente basado en estados |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplicable: agente de control basado en estados, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (no aplicable: no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplicable: el modelo no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, pickle de PyTorch) mas `stats.json` y `release.json` |
| Tamano del repositorio | 1,4 GB (cinco semillas) |
| Tarea | sim-square-broad (manipulacion en simulacion) |
| Ronda / celda de campana | R2 / `sq_d1_r2_auto_iql_n32` |
| Semillas incluidas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 250001 |
| Commit de entrenamiento | `3053203fc3df` |
| Modelo padre (actor congelado) | `mulligan/sim-square-broad-r02-auto-iql-n32-idql` |
| Pipeline declarado en HuggingFace | robotics |
| Fecha de creacion | 2026-09-28 |
| Fecha de actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

El agente se compone de dos piezas: un actor de difusion congelado, importado del checkpoint padre `sim-square-broad-r02-auto-iql-n32-idql`, y un critico DIVL distribucional entrenado en esta ronda. Segun la model card, se trata de un "state-based agent with the parent's frozen diffusion actor and a distributional DIVL critic". El nombre de los artefactos de W&B asociados (`iql_ddpg_bc_idql_divl_square_d1_...`) referencia componentes IQL, DDPG, BC, IDQL y DIVL, lo que sugiere una linea de entrenamiento de aprendizaje por refuerzo offline con regularizacion por comportamiento clonado, pero la informacion proporcionada no detalla la composicion exacta de la perdida ni los hiperparametros.

Los datos de entrenamiento declarados son tres conjuntos: `sim-square-broad-c00-teleop-baseline` (demostraciones de teleoperacion), `sim-square-broad-c01-auto-iql-n32-policy-rollouts` y `sim-square-broad-c02-auto-iql-n32-policy-rollouts` (rollouts de politicas auto-IQL). No se especifica el numero de transiciones, la composicion proporcional de cada dataset ni si hubo fases de RLHF o DPO (categorias que, por otra parte, no aplican a un agente de control). Tampoco se documenta el algoritmo de difusion concreto del actor ni el numero de pasos de denoising.

La innovacion tecnica declarada es el uso de un critico distribucional DIVL sobre un actor congelado: al no reentrenar el actor, la comparacion con la ronda padre aísla el efecto del critico. Los checkpoints se generaron con el codigo de investigacion de Mulligan en el commit `3053203fc3df` y son copias identicas (verificadas por MD5 y SHA-256) de los artefactos finales de W&B.

## Capacidades

- Control robotico basado en estados para la tarea de manipulacion `sim-square-broad` en simulacion.
- Generacion de acciones mediante un actor de difusion preentrenado y congelado.
- Estimacion de valor mediante un critico DIVL distribucional (modela la distribucion del retorno, no solo su media).
- Ejecucion multi-semilla: cinco politicas independientes (seed-1 a seed-5) para analisis de varianza entre semillas.
- Evaluacion reproducible sobre una rejilla de estados iniciales reservada (held-out initial-state grid).
- Integracion con el ecosistema de evaluacion Mulligan / Policy Arena.
- No dispone de tool calling, function calling, soporte de agentes basados en lenguaje, capacidades multilingues, vision, audio ni modo de razonamiento explicito.
- No se declara soporte de sim-to-real ni de entrada multimodal.

## Casos de uso

- Investigacion en aprendizaje por refuerzo offline: usar los cinco checkpoints como linea base reproducible para medir el efecto de un critico distribucional (DIVL) sobre un actor de difusion congelado, comparando con el modelo padre `sim-square-broad-r02-auto-iql-n32-idql`.
- Analisis de varianza entre semillas: las cinco carpetas (`seed-1` a `seed-5`) permiten cuantificar la estabilidad del entrenamiento sin reentrenar, ya que todas parten del mismo commit y del mismo paso 250001.
- Evaluacion comparativa en simulacion: replicar la rejilla de estados iniciales reservada y contrastar los recuentos de exito declarados (entre 16757 y 18585 sobre 30000 registros segun la semilla).
- Generacion de datos de rollout para entrenamiento posterior: la politica puede desplegarse en simulacion para producir trayectorias que alimenten fases posteriores de imitacion o de mineria tipo DAgger, tal como sugiere la celda de campana `square-d1-dagger-mining-01a`.
- Destilacion o comportamiento clonado: al ser un actor de difusion, sirve como profesor para destilar una politica mas ligera que pueda ejecutarse con menor coste computacional.
- Reproducibilidad de artefactos: los ficheros son copias verificadas (MD5 y SHA-256) de artefactos de W&B, por lo que son utiles para auditar resultados publicados o para reconstruir una evaluacion pasada.
- Estudio de criticos distribucionales: comparar el critico DIVL de esta ronda con la variante IDQL del modelo padre para aislar que aporta cada formulacion del critico en una tarea de manipulacion cuadrada.
- Docencia y prototipado en robotica: el tamano del repositorio (1,4 GB para cinco semillas) permite experimentar en un solo equipo sin infraestructura de gran escala.

## Benchmarks y rendimiento

La model card incluye una evaluacion propia sobre una rejilla de estados iniciales reservada. Los resultados se expresan como numero de exitos sobre el total declarado por semilla, con la columna `N` fijada en 32. La model card no detalla la definicion exacta de la metrica ni el numero de rollouts por estado inicial, por lo que los porcentajes de la ultima columna son la ratio aritmetica entre exitos y registros declarados.

| Dataset de evaluacion | Semilla | N | Exitos / total | Ratio |
|---|---|---|---|---|
| sim-square-broad-r00-r03-eval | seed-1 | 32 | 16964 / 30000 | 56,5 % |
| sim-square-broad-r00-r03-eval | seed-2 | 32 | 16757 / 30000 | 55,9 % |
| sim-square-broad-r00-r03-eval | seed-3 | 32 | 17025 / 30000 | 56,8 % |
| sim-square-broad-r00-r03-eval | seed-4 | 32 | 18585 / 30000 | 62,0 % |
| sim-square-broad-r00-r03-eval | seed-5 | 32 | 17551 / 30000 | 58,5 % |

Media agregada de las cinco semillas: 86882 exitos sobre 150000 registros (57,9 %). La dispersion entre semillas (55,9 %–62,0 %) es de aproximadamente 6,1 puntos porcentuales, con seed-4 como mejor resultado y seed-2 como peor.

No se han publicado en la informacion disponible resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks de modelos de lenguaje, ya que no son aplicables a este tipo de modelo. Tampoco se proporcionan comparaciones numericas frente a otras politicas de la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el repositorio completo ocupa 1,4 GB para cinco semillas (mas `release.json`, `stats.json` y metadatos), lo que situa cada checkpoint individual en un orden de magnitud de centenares de megabytes; esto es una estimacion derivada del tamano del repositorio, no un dato declarado por el autor.
- Parametros del modelo: no disponibles, por lo que no puede darse una cifra fiable de memoria de pesos.
- GPU recomendadas: no disponible. Por tamano de checkpoint, un agente de este tipo suele ser ejecutable en GPU de consumo, pero el autor no publica requisitos y no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; dado el tamano de los ficheros, es plausible en tarjetas con varios GB de VRAM, incluida CPU, pero se trata de una inferencia no verificada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de modelos de lenguaje (no aplicables). La carga se realiza con PyTorch estandar.
- Advertencia de despliegue: los ficheros `.pt` son pickles de PyTorch y la propia model card indica que deben cargarse unicamente en un entorno de confianza.
- Latencia y throughput estimados: no disponibles.
- Requisitos de entrenamiento: no disponibles mas alla del paso 250001, el commit `3053203fc3df` y los artefactos de W&B referenciados.

## Comparativa con modelos similares

Solo se dispone de informacion sobre modelos de la propia familia Mulligan. No se han proporcionado datos de otras alternativas comparables en la busqueda web realizada.

| Modelo | Tarea | Arquitectura declarada | Semillas | Licencia | Datos de rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r02-auto-iql-n32-divl (este) | sim-square-broad | Actor de difusion congelado + critico DIVL distribucional | 5 (1–5) | apache-2.0 | 16757–18585 exitos / 30000 por semilla | HuggingFace, 1,4 GB |
| sim-square-broad-r02-auto-iql-n32-idql | sim-square-broad | Actor de difusion (origen del actor congelado); critico IDQL segun el nombre del artefacto | no disponible | no disponible en la informacion proporcionada | no disponible | HuggingFace (referenciado como padre) |
| Otros brazos de la campana `sq_d1_r2_auto_iql_n32` | sim-square-broad | no disponible | no disponible | no disponible | no disponible | no disponible |
| Politicas de terceros comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa posible es contra el modelo padre, ya que comparten actor; sin embargo, la informacion proporcionada no incluye los resultados de evaluacion del padre, por lo que no puede establecerse una mejora o degradacion cuantificada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al ser una politica entrenada con demostraciones de teleoperacion y rollouts de politicas previas, puede heredar sesgos de esos conjuntos (por ejemplo, sobrerrepresentacion de trayectorias exitosas o de modos de actuacion concretos).
- Riesgo de alucinacion: no aplicable en el sentido habitual de modelos generativos de lenguaje. El riesgo equivalente es la ejecucion de acciones no validas o fuera de distribucion en estados no cubiertos por los datos de entrenamiento.
- Generalizacion limitada: el modelo esta entrenado para una unica tarea (`sim-square-broad`) y no se declara transferencia a otras tareas, entornos ni robots reales.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural, no soporta tool calling ni razonamiento multi-paso simbolico.
- Idiomas: no aplicable; el campo de idiomas no esta disponible en la ficha de HuggingFace.
- Ausencia de benchmarks externos: los unicos numeros disponibles son de la evaluacion propia de 32 estados iniciales (held-out), con una metrica no detallada en la model card.
- Dispersion entre semillas: la ratio de exito varia entre 55,9 % y 62,0 % segun la semilla, lo que implica que cualquier conclusion basada en una sola semilla es poco fiable.
- Seguridad en la carga de ficheros: los `.pt` son pickles de PyTorch; cargarlos implica ejecucion de codigo arbitrario si el fichero estuviese manipulado. La model card exige un entorno de confianza. Verificar los hashes MD5/SHA-256 antes de usarlos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el texto de atribucion. No se declaran restricciones adicionales.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.
- Fechas: el repositorio esta fechado en septiembre de 2026, posterior a la fecha habitual de consulta; conviene verificar la vigencia de los artefactos de W&B enlazados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-auto-iql-n32-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-broad-r02-auto-iql-n32-idql
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de teleoperacion base: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
- Dataset de rollouts c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-n32-policy-rollouts
- Dataset relacionado (success-bc): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Artefactos de W&B: `self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260901_002851_343598-final-step-250001:v0` (seed-1) y artefactos equivalentes para seed-2 a seed-5; los identificadores de run son `p29nnsbc`, `n11bo88l`, `o635wk20`, `v85hw5ng` y `9motketd`, todos bajo el commit `3053203fc3df`
- Enlaces de la busqueda web no relacionados con el modelo: https://claru.ai/datasets/mulligan-sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts (ficha de dataset), https://websim.com (plataforma ajena), https://github.com/RoyTynan/DSPGenerator (proyecto ajeno, sin relacion con este checkpoint)
