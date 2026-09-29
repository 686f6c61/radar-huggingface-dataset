# mulligan/sim-square-narrow-r01-mining-no-cf-divl

## Resumen

`mulligan/sim-square-narrow-r01-mining-no-cf-divl` es un checkpoint de un agente de aprendizaje por refuerzo (RL) para control robótico, publicado por la organizacion `mulligan` dentro de su suite de campanas de entrenamiento. No es un modelo de lenguaje: es un agente basado en estado (state-based) que ejecuta la tarea simulada `sim-square-narrow`, con un actor de difusion congelado —heredado del modelo padre `sim-square-narrow-r01-mining-no-cf-idql`— y un critico de tipo DIVL con formulacion distributional. El artefacto entregable son pesos de politica (`policy.pt`) mas un fichero de estadisticas de normalizacion (`stats.json`), con una semilla por carpeta.

El modelo pertenece a la ronda R1, brazo `mining-no-cf`, celda de campana `sq_d0_r1_ours_mining_beta05_nocf_human_only`, y se entreno durante 150.001 pasos con cinco semillas independientes (1 a 5). Los identificadores de los artefactos de W&B apuntan al pipeline `iql_ddpg_bc_idql_divl` sobre la tarea `nutassemblysquare`, es decir, un flujo de RL offline/por imitacion que combina IQL, DDPG+BC, IDQL y DIVL con datos recolectados mediante DAgger. El repositorio ocupa 1,4 GB y su relevancia es fundamentalmente metodologica: permite reproducir y comparar variantes de critico manteniendo el actor fijo.

El checkpoint incluye resultados de evaluacion sobre una rejilla de estados iniciales reservados, con una tasa de exito media del 92,69% (37.074 exitos sobre 40.000 rollouts agregados en las cinco semillas). La licencia es MIT y los ficheros son copias byte a byte de los artefactos de W&B originales, verificadas por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente RL state-based: actor de difusion congelado + critico distributional DIVL (pipeline IQL / DDPG+BC / IDQL / DIVL) |
| Parametros totales | no disponible (la model card no publica recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (agente de control; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en formato PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) + `stats.json`; un directorio por semilla (`seed-1` a `seed-5`) |
| Tarea | `sim-square-narrow` (identificadores de artefacto referencian `nutassemblysquare`) |
| Ronda / brazo | R1 / `mining-no-cf` |
| Celda de campana | `sq_d0_r1_ours_mining_beta05_nocf_human_only` |
| Semillas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Modelo padre (actor) | `mulligan/sim-square-narrow-r01-mining-no-cf-idql` |
| Commit de entrenamiento | `3053203fc3df` |

## Arquitectura y entrenamiento

El agente es un controlador de manipulacion basado en observaciones de estado (sin vision ni entrada de lenguaje). El actor es una politica de difusion que se mantiene congelada y se hereda del checkpoint `sim-square-narrow-r01-mining-no-cf-idql`; sobre esa base, este release entrena unicamente el critico, que en esta variante adopta una formulacion distributional (DIVL). La nomenclatura de los artefactos de W&B (`iql_ddpg_bc_idql_divl_nutassemblysquare_..._final-step-150001`) indica que el pipeline de entrenamiento integra aprendizaje Q implicito (IQL), DDPG con behavioural cloning (DDPG+BC) e IDQL (implicit diffusion Q-learning) junto con DIVL; la model card no desglosa la contribucion de cada componente ni los hiperparametros concretos.

Los datos de entrenamiento provienen de tres conjuntos: `sim-square-narrow-c00-teleop-sobol` (teleoperacion), `sim-square-narrow-c01-dagger-mining-no-cf` (rollouts agregados con DAgger, sin correccion humana —de ahi el sufijo `no-cf`, *no corrective feedback*) y `sim-square-narrow-c01-sobol-policy-rollouts` (rollouts de politica, presumiblemente generados por una politica previa tipo SOBOL/SoBol). No se documentan en la informacion disponible el numero de transiciones, la composicion proporcional del dataset, ni la presencia de RLHF/DPO (tecnicas que no aplican a este tipo de agente). El entrenamiento se replica con cinco semillas, lo que permite estimar varianza entre inicializaciones.

## Capacidades

- Generacion de acciones de control continuo a partir de observaciones de estado en la tarea simulada `sim-square-narrow`; no genera texto.
- Politica de difusion capaz de modelar distribuciones multimodales de acciones (caracteristica propia de los actores de difusion en RL).
- Estimacion de valor mediante un critico distributional (DIVL), lo que permite trabajar con la distribucion completa del retorno y no solo con su media.
- Ejecucion de rollouts de politica reutilizables para generacion de datos (los datasets de la organizacion incluyen conjuntos de `policy-rollouts`).
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes multi-paso en el sentido de LLM: no aplica (el agente opera sobre el bucle de control del entorno, no sobre herramientas externas).
- Capacidades multilingues: no aplica.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio; el modelo es estrictamente state-based.

## Casos de uso

- Reproduccion de experimentos de RL: el repositorio incluye cinco semillas del mismo paso de entrenamiento (150001), lo que permite cuantificar la varianza entre inicializaciones de una misma configuracion sin reentrenar.
- Ablacion de criticos con actor fijo: al compartir el actor congelado del modelo IDQL padre, este checkpoint sirve como rama experimental para aislar el efecto de un critico distributional DIVL frente a alternativas.
- Generacion de datos para iteraciones DAgger: la politica puede desplegarse en el simulador para producir rollouts que alimenten la siguiente ronda de agregacion de datos, tal y como sugiere el dataset `sim-square-narrow-c01-sobol-policy-rollouts`.
- Aprendizaje por imitacion y destilacion de politicas: un actor de difusion con decenas de pasos de muestreo es costoso en inferencia; sus rollouts pueden usarse para entrenar una politica mas rapida y determinista para control en tiempo real.
- Evaluacion comparativa en bancos de pruebas de robotica: los resultados del checkpoint se registran en `Policy Arena` de Mulligan, lo que lo hace util como referencia interna de rendimiento frente a otras celdas de campana.
- Analisis de robustez ante condiciones iniciales: los resultados por semilla se evaluan sobre una rejilla de estados iniciales reservados (N=32), lo que permite estudiar sensibilidad a la configuracion inicial de la tarea.
- Punto de partida para ajuste fino en tareas relacionadas: al ser pesos PyTorch, el actor y el critico pueden recargarse y afinarse sobre variantes de la familia de tareas de ensamblaje en simulacion.

## Benchmarks y rendimiento

Evaluacion sobre rejilla de estados iniciales reservados (`sim-square-narrow-r00-r03-eval`), 8.000 rollouts por semilla:

| Semilla | N (rejilla) | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 8.000 | 7.324 | 91,55% |
| seed-2 | 32 | 8.000 | 7.467 | 93,34% |
| seed-3 | 32 | 8.000 | 7.387 | 92,34% |
| seed-4 | 32 | 8.000 | 7.486 | 93,58% |
| seed-5 | 32 | 8.000 | 7.410 | 92,63% |
| Agregado | 32 | 40.000 | 37.074 | 92,69% |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), que ademas no aplican a un agente de control. Tampoco se proporcionan comparaciones con lineas base externas de robomimic, robosuite o Diffusion Policy.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 1,4 GB para cinco semillas, pero la model card no desglosa el tamano de `policy.pt` ni el recuento de parametros, por lo que no puede derivarse una cifra fiable de memoria.
- GPU recomendadas: no disponibles. Al tratarse de un agente state-based de simulacion, es plausible ejecutarlo en CPU, pero esta afirmacion no esta confirmada en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible (no se documenta).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y ninguna de ellas es aplicable a este tipo de artefacto. El unico procedimiento indicado es cargar los ficheros `.pt` con PyTorch desde el codigo de investigacion de Mulligan (`git commit 3053203fc3df`).
- Latencia y throughput: no disponibles. En un actor de difusion, la latencia depende del numero de pasos de muestreo, dato que no se especifica.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en un entorno de confianza.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables externos (mismo tamano o misma tarea) en la informacion proporcionada. La unica comparacion documentable es interna, contra el modelo padre del que se hereda el actor:

| Modelo | Actor | Critico | Semillas | Tasa de exito | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sim-square-narrow-r01-mining-no-cf-divl` (este) | Difusion congelada (heredada) | DIVL distributional | 5 | 92,69% agregada | MIT | HuggingFace, 1,4 GB |
| `sim-square-narrow-r01-mining-no-cf-idql` (padre) | Difusion congelada | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otras variantes de la campana `sim-square-narrow` | no disponible | no disponible | no disponible | no disponible | no disponible | organizacion `mulligan` en HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos en la model card. Al entrenarse sobre teleoperacion humana y rollouts de politica, el comportamiento hereda las distribuciones y limitaciones de esos datos, algo que no se cuantifica en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos de lenguaje; en su lugar existe riesgo de fallo de politica ante estados fuera de distribucion, no cuantificado en la model card.
- Especificidad de tarea: el agente esta entrenado exclusivamente para `sim-square-narrow`; no hay evidencia publicada de transferencia a otras tareas o a robot real.
- Limitacion de observacion: agente state-based, sin entrada de vision ni de lenguaje; no puede procesar imagenes ni instrucciones textuales.
- Contexto e idioma: no aplica. No hay ventana de contexto ni soporte multilingue.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion, pero no se documentan terminos adicionales ni la licencia de los datasets asociados, que deberia verificarse por separado.
- Seguridad de carga: los ficheros `.pt` son pickles de PyTorch; cargarlos en un entorno no confiable es un riesgo de ejecucion de codigo arbitrario.
- Trazabilidad de la evaluacion: los resultados agregados provienen de un unico conjunto de evaluacion (`sim-square-narrow-r00-r03-eval`) y de una rejilla de estados iniciales reservados; no se documentan intervalos de confianza ni significacion estadistica de las diferencias entre semillas (rango observado de 91,55% a 93,58%).
- Repositorio sin traccion publica: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente de los resultados.
- Cifras no verificables de forma externa: los resultados se declaran en la model card y proceden de artefactos de W&B internos del proyecto; la verificacion MD5/SHA-256 garantiza integridad de ficheros, no la validez de las metricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-mining-no-cf-divl
- Modelo padre (actor IDQL): https://huggingface.co/mulligan/sim-square-narrow-r01-mining-no-cf-idql
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset DAgger (mining, sin correccion humana): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mining-no-cf
- Dataset de rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de rollouts de politica de la campana c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Busqueda de datasets de la familia `sim-square-narrow`: https://huggingface.co/datasets?other=sim-square-narrow
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Pagina del proyecto Mulligan: https://mulligan.page
- Evaluaciones en Policy Arena: https://arena.mulligan.page

Nota: los resultados de la busqueda web proporcionados (una noticia sobre un agente que intento minar criptomonedas, un articulo financiero sobre Micron, una declaracion de Jensen Huang sobre destilacion de modelos) no guardan relacion con este modelo y no se han utilizado como fuente. El termino `mining` en el nombre del checkpoint hace referencia a la agregacion de datos tipo DAgger, no a mineria de criptomonedas.
