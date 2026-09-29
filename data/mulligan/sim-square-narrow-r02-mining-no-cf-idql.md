# mulligan/sim-square-narrow-r02-mining-no-cf-idql

## Resumen

`mulligan/sim-square-narrow-r02-mining-no-cf-idql` es un agente de aprendizaje por refuerzo offline de tipo IDQL (Implicit Q-Learning with Diffusion Policies) publicado por el usuario `mulligan` dentro del proyecto Mulligan. No es un modelo de lenguaje: es una politica de control robótico basada en estado (state-based) que combina un actor de difusion con un critico IQL escalar. Se distribuye como checkpoint PyTorch (`policy.pt`) mas ficheros `stats.json` con los normalizadores de observaciones y acciones.

El modelo resuelve una tarea concreta de manipulacion en simulacion, `sim-square-narrow`, correspondiente a la ronda R2 y al brazo experimental `mining-no-cf` (celda de campana `sq_d0_r2_ours_mining_shape_beta05_nocf_human_only`). El repositorio ocupa 1,4 GB e incluye cinco semillas independientes (`seed-1` a `seed-5`), todas ellas entrenadas hasta el paso 150001, lo que permite analizar la varianza del algoritmo bajo un mismo commit de codigo (`ec52959c99f0`).

Su relevancia es fundamentalmente metodologica: forma parte de un pipeline de mejora iterativa con DAgger y minería de datos, y esta pensado para reproducir y auditar experimentos de RL offline en robótica. Los checkpoints son copias byte a byte de artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`. Las observaciones de estado apuntan a una tarea tipo `NutAssemblySquare` de robosuite, segun los nombres de los artefactos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico: actor de difusion (generacion de acciones por denoising) y critico IQL escalar; agente IDQL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume vectores de observacion de estado) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints PyTorch en su precision original, sin cuantizar |
| Idiomas soportados | no disponible (no aplica: no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`policy.pt`) mas normalizadores en JSON (`stats.json`) |
| Tarea | sim-square-narrow |
| Ronda del modelo | R2 |
| Brazo experimental | mining-no-cf |
| Celda de campana | `sq_d0_r2_ours_mining_shape_beta05_nocf_human_only` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB (aproximadamente 280 MB por semilla) |
| Commit de entrenamiento | `ec52959c99f0` |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

IDQL reformula IQL como un metodo actor-critico: el critico se entrena con un esquema de Bellman modificado que solo emplea acciones presentes en el dataset, evitando la extrapolacion sobre acciones fuera de distribucion, y el actor es una politica de difusion que modela la distribucion de acciones. En inferencia, la politica de difusion genera candidatos de accion y el critico selecciona el de mayor valor, lo que da lugar a la politica "implicita" que da nombre al metodo. En este repositorio el actor es de difusion y el critico es escalar, segun la propia model card. El nombre interno de los artefactos de origen (`iql_ddpg_bc_idql_nutassemblysquare`) indica que la misma base de codigo soporta variantes IQL, DDPG+BC e IDQL.

El entrenamiento se inscribe en una campana por rondas con recogida iterativa de datos: la ronda inicial (`c00`) usa teleoperacion con SOBOL, la ronda `c01` combina datos generados por DAgger y rollouts de la politica, y la ronda `c02` repite el esquema con DAgger y rollouts de la politica Mulligan. Los checkpoints liberados corresponden a cinco semillas entrenadas hasta el paso 150001 con el mismo commit de Git. No se especifican en la informacion disponible el numero total de transiciones, la composicion exacta del dataset, la existencia de RLHF/DPO (no aplicable en RL offline de control) ni los hiperparametros concretos del actor de difusion.

## Capacidades

- Control robótico de manipulacion a partir de observaciones de estado (no procesa imagenes ni texto).
- Generacion de acciones mediante muestreo por difusion con seleccion basada en el critico IQL.
- Ejecucion de una tarea especifica y acotada: `sim-square-narrow`.
- Reproduccion de resultados: cinco semillas independientes bajo un mismo commit, utiles para medir varianza.
- Generacion de rollouts de politica, reutilizables como datos de entrenamiento en rondas posteriores del pipeline (los datasets del ecosistema incluyen explicitamente rollouts de politica).
- Integracion con el ecosistema de evaluacion de Mulligan (Policy Arena) y con el dataset de evaluacion `sim-square-narrow-r00-r03-eval`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, vision ni audio: son capacidades no aplicables a este tipo de modelo.

## Casos de uso

- Baseline reproducible en investigacion de RL offline: al incluir cinco semillas con el mismo commit y el mismo paso de entrenamiento, sirve como referencia estable para comparar variantes de algoritmo sin confundir el efecto de la semilla con el del metodo.
- Estudios de ablacion del brazo `mining-no-cf`: permite aislar el efecto de esta configuracion frente a otras celdas de la misma campana (por ejemplo, variantes con `cf`), siempre que se disponga de los checkpoints equivalentes.
- Analisis de varianza entre semillas: con cinco checkpoints identicos en configuracion, se puede estimar la dispersion del rendimiento de IDQL en `sim-square-narrow` antes de invertir en nuevas rondas de recogida de datos.
- Generacion de datos sinteticos para DAgger: los rollouts de este agente pueden etiquetarse y agregarse al dataset de la siguiente ronda, tal como refleja la existencia de datasets de tipo `mulligan-policy-rollouts` en el ecosistema.
- Evaluacion estandarizada en arneses de terceros: el modelo se puede cargar en el bucle de evaluacion de Mulligan o en un arnes propio para medir tasa de exito en la tarea `square-narrow`.
- Docencia y reproduccion de pipelines de RL offline: el par `policy.pt` + `stats.json` es un ejemplo compacto de como se serializa un agente actor-critico con normalizadores, util en cursos y tutoriales de RL aplicado a robotica.
- Investigacion en simulacion a realidad (sim-to-real): aunque no hay evidencia publicada de transferencia, el checkpoint es un punto de partida habitual para estudiar robustez ante cambios de dinamica o de calibracion.
- Comparacion de familias de algoritmos: al ser una implementacion de IDQL, se puede contrastar con variantes IQL puras o DDPG+BC entrenadas con el mismo codigo y los mismos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tabla de metricas, tasa de exito ni curvas de aprendizaje. La model card unicamente referencia el dataset de evaluacion `mulligan/sim-square-narrow-r00-r03-eval`, que presumiblemente contiene los resultados de la comparativa entre rondas R0 y R3, pero los valores no se facilitan en la informacion proporcionada.

## Requisitos de hardware

- No hay requisitos oficiales publicados en la model card.
- Estimacion a partir del tamano del repositorio: el conjunto completo ocupa 1,4 GB, es decir, aproximadamente 280 MB por semilla contando checkpoint y normalizadores. Un unico checkpoint es, por tanto, de escala reducida y no requiere acelerador para caber en memoria.
- VRAM estimada para inferencia: holgadamente por debajo de 1 GB por semilla; cualquier GPU de consumo de las ultimas generaciones (por ejemplo, RTX 3060 en adelante) es mas que suficiente, y la ejecucion en CPU es viable para evaluacion puntual, aunque el muestreo por difusion sera mas lento.
- GPU recomendadas: no aplica ninguna GPU de gama alta. Para barridos de evaluacion con muchas semillas y entornos paralelos, una GPU de gama media acelera el muestreo de difusion, pero no es un requisito.
- Cabe en GPU de consumo: si, en practicamente cualquier modelo con al menos 1 GB de VRAM disponible.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`) mas JSON, no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje. El despliegue se realiza cargando el checkpoint con PyTorch en el codigo de investigacion de Mulligan o en un bucle de evaluacion propio (por ejemplo, robosuite).
- Latencia y throughput: no disponibles. Dependen del numero de pasos de denoising configurados en el actor de difusion y del dispositivo de ejecucion, y no se documentan en el repositorio.

## Comparativa con modelos similares

No se dispone de resultados numericos comparativos para este checkpoint concreto en la informacion proporcionada. La siguiente tabla compara las familias de algoritmos a nivel conceptual, no el rendimiento de este checkpoint en particular.

| Modelo / algoritmo | Tipo de actor | Tipo de critico | Metodo de seleccion de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (IDQL, `sim-square-narrow-r02-mining-no-cf`) | Difusion | IQL escalar | Muestreo de candidatos y seleccion por valor del critico | MIT | HuggingFace, 5 semillas |
| IQL (Implicit Q-Learning) | Tipo AWR / expectile, sin difusion | IQL escalar | Accion directa del actor | No aplica a este repositorio | Implementaciones publicas de referencia |
| Diffusion-QL | Difusion | Q-learning estandar | Muestreo de difusion | No aplica a este repositorio | Implementaciones publicas de referencia |
| DDPG+BC | Determinista | Q-learning con regularizacion de comportamiento | Accion directa | No aplica a este repositorio | Soportado por la misma base de codigo de Mulligan, segun el nombre de los artefactos |

Los parametros, la longitud de contexto y los benchmarks de los terminos de comparacion figuran como no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: es una politica especifica para `sim-square-narrow` y no es reutilizable sin reentrenamiento en otras tareas o entornos.
- Modelo basado en estado: no procesa imagenes ni texto, por lo que no sirve como componente de sistemas multimodales ni de generacion de lenguaje.
- Sin evidencia de transferencia a robot real: todas las referencias apuntan a entrenamiento y evaluacion en simulacion; no se documenta validacion sim-to-real.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de acciones fuera de distribucion si el modelo se despliega en entornos con dinamica o distribucion de estados distinta a la del entrenamiento.
- Seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch y la propia model card advierte de que deben cargarse unicamente en un entorno de confianza. Un pickle malicioso puede ejecutar codigo arbitrario.
- Dependencia de los normalizadores: la politica requiere los `stats.json` correspondientes a cada semilla; usar el checkpoint sin sus estadisticas de normalizacion produce acciones invalidas.
- Solo se libera el paso 150001: no hay checkpoints intermedios, por lo que no se pueden trazar curvas de aprendizaje a partir del repositorio.
- Cinco semillas pueden ser insuficientes para conclusiones robustas sobre la varianza del algoritmo, aunque mejoran claramente el escenario de una sola semilla.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento del analisis, sin informes independientes de reproducibilidad.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero al ser pesos derivados de simulacion y de una campana interna, conviene verificar la procedencia de los datasets asociados antes de un uso productivo.
- Falta de documentacion de hiperparametros, numero de pasos de difusion y presupuesto de entrenamiento, lo que dificulta la reproduccion exacta fuera del codigo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-mining-no-cf-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset `sim-square-narrow-c00-teleop-sobol`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset `sim-square-narrow-c01-dagger-mining-no-cf`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mining-no-cf
- Dataset `sim-square-narrow-c01-sobol-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset `sim-square-narrow-c02-dagger-mining-no-cf`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mining-no-cf
- Dataset `sim-square-narrow-c02-mulligan-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset `sim-square-narrow-c03-mulligan-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Dataset de evaluacion `sim-square-narrow-r00-r03-eval`: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Busqueda de datasets de la familia `sim-square-narrow`: https://huggingface.co/datasets?other=sim-square-narrow
- Articulo IDQL: Implicit Q-Learning as an Actor-Critic Method with Diffusion Policies: https://arxiv.org/html/2304.10573v2
- Implementacion de referencia IDQL (documentacion de modelos de difusion): https://deepwiki.com/philippe-eecs/IDQL/3.1-diffusion-models
- Implementacion de referencia IDQL (entrenamiento offline): https://deepwiki.com/philippe-eecs/IDQL/4.1-offline-training
