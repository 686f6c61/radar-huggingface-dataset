# mulligan/sim-square-broad-r00-baseline-first100-divl

## Resumen

`mulligan/sim-square-broad-r00-baseline-first100-divl` es un agente de control para robótica (pipeline `robotics`) publicado por la organizacion Mulligan dentro de su campana de experimentos `sim-square-broad`. No es un modelo de lenguaje: se trata de un artefacto de aprendizaje por refuerzo compuesto por un actor de difusion congelado, heredado del checkpoint padre `sim-square-broad-r00-baseline-first100-idql`, y un critico DIVL de tipo distribuido. El repositorio contiene los ficheros `policy.pt` y `stats.json` para cinco semillas independientes (carpetas `seed-1` a `seed-5`), con un paso de entrenamiento comun de 250001.

El objetivo declarado es la tarea `sim-square-broad`, correspondiente a la ronda R0 y al brazo `baseline-first100` (celda de campana `sq_d1_r0_first100_baseline_uniform`). El agente trabaja sobre observaciones de estado, no sobre texto ni imagen, y fue entrenado a partir del dataset de teleoperacion `mulligan/sim-square-broad-c00-teleop-baseline-first100`. La nomenclatura de los artefactos de W&B (`iql_ddpg_bc_idql_divl_square_d1_...`) sugiere una linea de trabajo sobre RL offline con IQL, DDPG+BC e IDQL, sobre la que se anade el critico DIVL.

Su relevancia es fundamentalmente metodologica: sirve como referencia reproducible (los ficheros son copias byte a byte de los artefactos de W&B, con MD5 verificado contra el manifiesto y SHA-256 registrado en `release.json`) para comparar criticos alternativos manteniendo el actor fijo. Las evaluaciones publicadas arrojan una tasa de exito agregada de 29989/150000 rollouts (19,99 %), con una horquilla por semilla de 18,35 % a 22,11 %, lo que lo situa como punto de partida, no como politica lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL basado en estado: actor de difusion congelado (heredado del padre IDQL) mas critico DIVL distribuido |
| Parametros totales | No disponible; el repositorio completo ocupa 1,4 GB para 5 semillas (aproximadamente 280 MB por semilla, incluyendo actor, critico y estadisticas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la entrada es un vector de estado, no una secuencia de texto |
| Tipos de cuantizacion | No disponible; solo se publican pesos en precision original de PyTorch |
| Idiomas soportados | No aplica; el modelo no procesa lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch pickle (`.pt`) mas `stats.json`, organizado una carpeta por semilla |
| Tarea | sim-square-broad |
| Ronda de modelo | R0 |
| Brazo / celda de campana | baseline-first100 / `sq_d1_r0_first100_baseline_uniform` |
| Semillas incluidas | 1, 2, 3, 4 y 5 |
| Paso de entrenamiento | 250001 |
| Dataset de entrenamiento | `mulligan/sim-square-broad-c00-teleop-baseline-first100` |
| Dataset de evaluacion | `mulligan/sim-square-broad-r00-r03-eval` |
| Modelo padre (actor congelado) | `mulligan/sim-square-broad-r00-baseline-first100-idql` |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente es un actor-critico en el que el actor es un modelo de difusion congelado procedente del checkpoint `sim-square-broad-r00-baseline-first100-idql`, y el critico es un critico DIVL distribuido entrenado en esta ronda. Esta separacion es el nucleo del experimento: al mantener el actor inmutable, cualquier variacion de rendimiento respecto al padre es atribuible al critico. Los artefactos de W&B asociados (`iql_ddpg_bc_idql_divl_square_d1_2026...-final-step-250001`) indican un entrenamiento de 250001 pasos por semilla y una linea de trabajo con IQL, DDPG+BC e IDQL respecto a la cual DIVL actua como variante.

Los datos proceden del dataset de teleoperacion `sim-square-broad-c00-teleop-baseline-first100`, que corresponde a las primeras 100 demostraciones de un brazo baseline de teleoperacion. El nombre del proyecto de W&B (`square-d1-dagger-mining-01a`) apunta a un ciclo de DAgger con mineria de datos, es decir, a una iteracion en la que se recogen nuevos rollouts de la politica para ampliar el conjunto de entrenamiento. No se detalla en la informacion disponible el numero total de transiciones, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio). La trazabilidad es alta: cada semilla esta vinculada a un artefacto de W&B, una run y un commit de Git (`551416bff972` para la semilla 1 y `3053203fc3df` para las semillas 2 a 5), y los ficheros son copias byte a byte verificadas por MD5.

## Capacidades

- Control de politica para la tarea simulada `sim-square-broad` a partir de observaciones de estado.
- Inferencia determinista mediante `policy.pt`, con estadisticas de normalizacion en `stats.json`.
- Cinco politicas independientes (una por semilla), lo que permite analisis de varianza y ensembles.
- Integracion con el ecosistema de evaluacion de Mulligan: los resultados por rollout se publican en `sim-square-broad-r00-r03-eval` y se consultan en Policy Arena.
- Reproduccion exacta de experimentos gracias a los identificadores de artefacto, run y commit, y a las comprobaciones MD5/SHA-256.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades de agente multi-paso basadas en lenguaje.
- No dispone de capacidades multilingues ni de modo de razonamiento explicito.

## Casos de uso

- Baseline de comparacion en investigacion de RL offline: el actor congelado y las cinco semillas permiten medir el efecto de un critico nuevo (DIVL) contra el padre IDQL sin reintroducir variabilidad en la politica; cualquier mejora es atribuible al critico.
- Inicializacion de ciclos de DAgger: el nombre del proyecto de W&B sugiere un flujo de mineria iterativa, de modo que estos checkpoints pueden usarse como punto de partida para recoger nuevos rollouts y ampliar el dataset de teleoperacion.
- Analisis de sensibilidad a la semilla: la horquilla observada de 18,35 % a 22,11 % en tasa de exito sirve para dimensionar el numero de semillas necesario en futuros experimentos antes de declarar una mejora como significativa.
- Ablacion de criticos distribuidos: comparar la variante DIVL con las variantes IQL, DDPG+BC e IDQL citadas en la nomenclatura de artefactos, manteniendo constante el resto del pipeline.
- Validacion de infraestructura de evaluacion: el grid de estados iniciales con 30000 rollouts por semilla es un banco de pruebas util para verificar que un nuevo entorno de simulacion, un cambio de version de dependencias o un nodo de computo reproduce los mismos resultados.
- Auditoria de reproducibilidad: los hashes MD5/SHA-256 y los commits permiten reconstruir el entorno exacto de entrenamiento, util en revisiones internas o publicaciones que exijan trazabilidad total.
- Generacion de datos de rollout para mineria: las politicas congeladas pueden desplegarse en el simulador para etiquetar estados con acciones y valores, alimentando tecnicas de filtrado o reetiquetado posteriores.
- Docencia y prototipado en RL offline: el repositorio es lo bastante pequeno (1,4 GB) para ejecutarse en una sola maquina con CPU, lo que facilita ejemplos practicos de carga de checkpoints, evaluacion por semilla y comparacion de politicas.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la evaluacion sobre un grid de estados iniciales reservado, con los resultados por rollout en el dataset `sim-square-broad-r00-r03-eval`.

| Semilla | Dataset de evaluacion | Estados iniciales (N) | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|---|
| seed-1 | sim-square-broad-r00-r03-eval | 32 | 30000 | 5788 | 19,29 % |
| seed-2 | sim-square-broad-r00-r03-eval | 32 | 30000 | 6214 | 20,71 % |
| seed-3 | sim-square-broad-r00-r03-eval | 32 | 30000 | 5506 | 18,35 % |
| seed-4 | sim-square-broad-r00-r03-eval | 32 | 30000 | 5849 | 19,50 % |
| seed-5 | sim-square-broad-r00-r03-eval | 32 | 30000 | 6632 | 22,11 % |
| Agregado | sim-square-broad-r00-r03-eval | 160 | 150000 | 29989 | 19,99 % |

La model card no detalla la semantica exacta del campo N ni el criterio de exito empleado, ni publica resultados de benchmarks estandarizados tipo MMLU, HumanEval o GSM8K, que no son aplicables a este tipo de artefacto. No se han publicado resultados comparativos adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por semilla. El repositorio completo ocupa 1,4 GB para cinco semillas, aproximadamente 280 MB por semilla entre actor, critico y estadisticas, de modo que una sola politica cabe holgadamente en memoria.
- GPU recomendadas: no son necesarias para la inferencia de la politica. Para el bucle de simulacion y evaluacion a gran escala (30000 rollouts por semilla) resulta util disponer de una GPU de gama media o superior, aunque la informacion disponible no especifica el simulador ni sus requisitos.
- Compatibilidad con GPU de consumo: si, la inferencia cabe en cualquier GPU de consumo e incluso en CPU; no se publican requisitos minimos.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`). Los servidores orientados a modelos de lenguaje (vLLM, TGI, Ollama, llama.cpp) no son aplicables a este artefacto. El ecosistema declarado es el codigo de investigacion de Mulligan en los commits indicados, con evaluacion a traves de Policy Arena.
- Latencia y throughput: no disponibles. Dependen por completo del simulador y del hardware, y no se documentan en la model card.
- Advertencia de seguridad en el despliegue: los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en entornos de confianza, tal como senala la propia model card.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Semillas publicadas | Tasa de exito publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r00-baseline-first100-divl (este) | Actor de difusion congelado mas critico DIVL distribuido | sim-square-broad | 5 | 19,99 % agregado (18,35 %-22,11 %) | Apache 2.0 | HuggingFace |
| sim-square-broad-r00-baseline-first100-idql | Actor de difusion (padre, congelado en este modelo) | sim-square-broad | No disponible | No disponible en esta informacion | No disponible | HuggingFace |
| Variantes IQL / DDPG+BC / IDQL citadas en la nomenclatura de artefactos | No disponible | sim-square-broad | No disponible | No disponible | No disponible | Solo referenciadas en la model card |

No se dispone de datos publicados de otros agentes comparables sobre la misma tarea en la informacion proporcionada, por lo que la comparacion cuantitativa entre criticos queda pendiente de consultar la arena de evaluacion de Mulligan.

## Limitaciones y advertencias

- Especificidad de dominio: el modelo solo resuelve la tarea `sim-square-broad` con observaciones de estado. No es transferible a texto, vision, dialogo ni a otras tareas roboticas sin reentrenamiento.
- Tasa de exito baja: alrededor del 20 % agregado, con un minimo de 18,35 % en la semilla 3. No es una politica apta para produccion ni para uso en robot real sin una mejora sustancial.
- Brecha simulacion-realidad: no se aporta evidencia de transferencia a hardware fisico ni de calibracion sim-to-real.
- Varianza entre semillas: la horquilla de 18,35 % a 22,11 % implica que diferencias de pocos puntos porcentuales entre variantes pueden no ser significativas.
- Ambiguedad en las metricas: la model card no define el criterio de exito ni el significado exacto de N (32 por semilla) frente a los 30000 rollouts, lo que dificulta la comparacion con otros trabajos.
- Sesgos: no se documentan sesgos del dataset de teleoperacion, pero al derivar de las primeras 100 demostraciones de un brazo baseline, la politica hereda sus sesgos de distribucion y de estrategia de recogida.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo de lenguaje. Si aplica el riesgo de sobreajuste a la distribucion del dataset de teleoperacion, que puede traducirse en fallos silenciosos fuera de la distribucion de estados.
- Seguridad de serializacion: los ficheros `.pt` son pickles de PyTorch; cargarlos en un entorno no confiable expone la maquina a ejecucion de codigo arbitrario.
- Licencia: Apache 2.0 permite uso comercial del artefacto con las condiciones habituales de atribucion y sin garantias, pero no se especifica la licencia del dataset de entrenamiento, lo que puede anadir restricciones adicionales.
- Validacion comunitaria nula: cero descargas y cero likes en el momento de la consulta; no hay revision independiente de los resultados.
- Anomalia en las fechas: los metadatos indican creacion y actualizacion el 2026-09-28 y las runs de W&B estan fechadas en septiembre de 2026, fechas que conviene verificar con la fuente original antes de citar el trabajo.
- Dependencia del entorno: la evaluacion se realizo con el codigo de investigacion de Mulligan en commits concretos; reproducirla fuera de ese entorno puede dar resultados distintos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r00-baseline-first100-divl
- Modelo padre (actor IDQL congelado): https://huggingface.co/mulligan/sim-square-broad-r00-baseline-first100-idql
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline-first100
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Arena de evaluacion de politicas: https://arena.mulligan.page
