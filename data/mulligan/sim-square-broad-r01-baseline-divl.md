# mulligan/sim-square-broad-r01-baseline-divl

## Resumen

sim-square-broad-r01-baseline-divl es un agente de control para robótica basado en estado (no en imagen), publicado por la organizacion Mulligan dentro de su campana de investigacion sim-square-broad. Se trata de un checkpoint de politica entrenado para la tarea sim-square-broad, correspondiente a la ronda R1 y al brazo baseline de la celda de campana `sq_d1_r1_baseline_uniform_nocf_human_only`. Tecnicamente es un agente compuesto por un actor de difusion congelado, heredado del modelo padre sim-square-broad-r01-baseline-idql, y un critico DIVL distribucional entrenado sobre ese actor fijo.

El modelo no es un modelo de lenguaje: no genera texto, no procesa lenguaje natural y no acepta prompts. Es un artefacto de aprendizaje por refuerzo (offline RL con componente de imitacion y DAgger) que mapea observaciones de estado del simulador a acciones de control. Su relevancia es metodologica: sirve como linea base reproducible frente a la que comparar variantes de critico, esquemas de minado de datos y rondas posteriores de auto-mejora dentro del mismo entorno simulado.

El repositorio ocupa 1,4 GB e incluye cinco checkpoints independientes, uno por semilla (seed-1 a seed-5), todos ellos en el paso de entrenamiento 250001. Cada checkpoint esta acompanado de un fichero `stats.json` y de un `policy.pt`. La licencia es Apache 2.0 y los ficheros son copias byte a byte de artefactos de Weights & Biases, con MD5 verificado contra el manifiesto y SHA-256 registrado en `release.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion congelado (heredado del modelo padre) mas critico DIVL distribucional; agente basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; agente de control por paso) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch pickle (`.pt`), acompanado de `stats.json` |

## Arquitectura y entrenamiento

El agente sigue un esquema actor-critico con el actor congelado. El actor procede del modelo sim-square-broad-r01-baseline-idql y es un actor de difusion que no se actualiza durante esta ronda; lo que se entrena es un critico DIVL distribucional sobre las acciones de ese actor fijo. Los nombres de los artefactos de W&B (`iql_ddpg_bc_idql_divl_square_d1_...`) indican que la receta de entrenamiento combina IQL, DDPG+BC, IDQL y DIVL, es decir, aprendizaje por refuerzo offline con regularizacion por comportamiento e imitacion de datos humanos.

El entrenamiento alcanza el paso 250001 en las cinco semillas y se apoya en tres conjuntos de datos: `sim-square-broad-c00-teleop-baseline` (teleoperacion humana de referencia), `sim-square-broad-c01-baseline-policy-rollouts` (rollouts de la politica base) y `sim-square-broad-c01-dagger-baseline` (datos agregados mediante DAgger). Este ultimo es coherente con el nombre del run de W&B, `square-d1-dagger-mining-01a`, que sugiere un bucle de minado de datos tipo DAgger para ampliar la cobertura de estados. No se especifican en la informacion disponible el numero de tokens, el volumen total de transiciones ni los hiperparametros de optimizacion.

## Capacidades

- Control de politica en el entorno simulado sim-square-broad: mapea observaciones de estado a acciones.
- Aprendizaje por refuerzo offline con regularizacion por comportamiento sobre datos de teleoperacion y de rollouts.
- Soporte de datos agregados por DAgger, lo que permite iterar sobre estados visitados por la politica.
- Estimacion de valor mediante critico DIVL distribucional, entrenado sobre un actor de difusion congelado.
- Reproducibilidad multi-semilla: cinco checkpoints independientes en el mismo paso de entrenamiento.
- Trazabilidad de procedencia: cada carpeta de semilla se vincula a un artefacto de W&B, a un run y a un commit de git.
- No soporta tool calling, function calling, agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingues, de vision, de audio ni de modo de razonamiento explicito.

## Casos de uso

- Reproduccion de lineas base en investigacion de RL offline: los cinco checkpoints de semilla permiten replicar la linea base baseline de la ronda R1 con varianza controlada, algo imprescindible para publicar resultados comparables.
- Generacion de datos DAgger: al ser un agente basado en estado, puede desplegarse en el simulador para recoger rollouts adicionales que alimenten la siguiente ronda de minado de datos.
- Evaluacion comparativa entre criticos: al mantener el actor congelado, aislar el efecto del critico DIVL frente a otras variantes resulta metodologicamente limpio, ya que la unica diferencia observada proviene del critico.
- Ablacion de recetas de entrenamiento: el nombre de los artefactos sugiere combinaciones de IQL, DDPG+BC, IDQL y DIVL, de modo que este checkpoint sirve como punto de referencia para medir el efecto de cada componente.
- Semilla para bucles de auto-mejora: el modelo forma parte de una jerarquia de rondas (R1) y puede utilizarse como inicializacion en campanas posteriores de la misma tarea.
- Verificacion de pipelines de evaluacion en robotica: los recuentos de exito por semilla sobre la rejilla de estados iniciales reservada permiten validar que un pipeline de evaluacion reproduce los resultados esperados.
- Analisis de sensibilidad a la semilla: con cinco semillas y 30000 rollouts por semilla, es posible cuantificar la variabilidad del exito de la politica antes de comprometerse con un despliegue o una conclusion experimental.

## Benchmarks y rendimiento

Evaluacion sobre una rejilla de estados iniciales reservada (*held-out*), con 32 estados iniciales y 30000 rollouts por semilla. Los resultados son los declarados en la model card.

| Semilla | Estados iniciales (N) | Exitos / rollouts | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 19005 / 30000 | 63,35 % |
| seed-2 | 32 | 19144 / 30000 | 63,81 % |
| seed-3 | 32 | 19085 / 30000 | 63,62 % |
| seed-4 | 32 | 18687 / 30000 | 62,29 % |
| seed-5 | 32 | 18916 / 30000 | 63,05 % |
| Media (calculada) | 32 | 94837 / 150000 | 63,22 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no especifica el tamano de la red ni el consumo de memoria, y el tamano del repositorio (1,4 GB) corresponde al conjunto de los cinco checkpoints mas los ficheros de estadisticas, no a un unico modelo en memoria.
- GPU recomendadas: no disponibles. Al ser un agente basado en estado con actor de difusion y critico, es probable que la inferencia quepa en GPU de gama consumer, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: el artefacto se distribuye como pesos PyTorch (`.pt`) mas `stats.json`, pensado para cargarse con el codigo de investigacion de Mulligan en los commits indicados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Ronda | Actor | Critico | Licencia | Tasa de exito |
|---|---|---|---|---|---|---|
| sim-square-broad-r01-baseline-divl | sim-square-broad | R1 | Difusion congelado (heredado) | DIVL distribucional | apache-2.0 | 62,29 % - 63,81 % por semilla |
| sim-square-broad-r01-baseline-idql | sim-square-broad | R1 | Difusion (origen del actor congelado) | no disponible | no disponible en la informacion proporcionada | no disponible |

No se dispone de otros modelos comparables en la informacion proporcionada. La unica referencia directa es sim-square-broad-r01-baseline-idql, del que procede el actor congelado, pero no se han facilitado sus metricas de evaluacion, por lo que no es posible establecer una comparacion cuantitativa entre ambos.

## Limitaciones y advertencias

- Especificidad de tarea: el agente esta entrenado exclusivamente para sim-square-broad. No es transferible a otras tareas ni a entornos reales sin reentrenamiento.
- Ausencia de capacidades de lenguaje: no procesa texto, no responde a prompts y no admite instrucciones en lenguaje natural.
- Riesgo de seguridad en la carga de pesos: la propia model card advierte de que los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en un entorno de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- Dependencia del codigo de investigacion: los checkpoints se entrenaron y evaluaron con el codigo de Mulligan en commits concretos; reproducir los resultados exige disponer de ese codigo y de las versiones correspondientes.
- Varianza entre semillas: el rango de tasas de exito observado (62,29 % a 63,81 %) implica que cualquier conclusion experimental deberia apoyarse en varias semillas y no en una unica ejecucion.
- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgo, y en un agente de control en simulador el concepto de sesgo se refiere a la distribucion de estados cubierta por los datos, no a sesgos sociales.
- Riesgo de alucinacion: no aplica, ya que el modelo no genera texto.
- Limitaciones de contexto o idioma: no aplica; no hay ventana de contexto ni soporte idiomatico.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se declaran restricciones adicionales.
- Uso en produccion: se trata de un artefacto de investigacion con cero descargas y cero valoraciones en el momento de la consulta; no hay evidencia de validacion externa ni de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-baseline-divl
- Modelo padre del actor congelado: https://huggingface.co/mulligan/sim-square-broad-r01-baseline-idql
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Arena de evaluacion (Policy Arena): https://arena.mulligan.page
- Dataset de teleoperacion de referencia: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts de la politica base: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-baseline-policy-rollouts
- Dataset de DAgger baseline: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-baseline
- Dataset de evaluacion r00-r03: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Artefacto W&B de la semilla 1: `self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260901_181831_786816-final-step-250001:v0` (run `self-improving/square-d1-dagger-mining-01a/8web5prw`)
- Artefacto W&B de la semilla 2: `self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260901_210131_003590-final-step-250001:v0` (run `self-improving/square-d1-dagger-mining-01a/nvfh6idh`)
- Artefacto W&B de la semilla 3: `self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260901_205419_726107-final-step-250001:v0` (run `self-improving/square-d1-dagger-mining-01a/k0xziqqa`)
- Artefacto W&B de la semilla 4: `self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260901_210704_088671-final-step-250001:v0` (run `self-improving/square-d1-dagger-mining-01a/oyxmp9fe`)
- Artefacto W&B de la semilla 5: `self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260902_004040_358594-final-step-250001:v0` (run `self-improving/square-d1-dagger-mining-01a/tkidwpmn`)
- Commit de git comun a los cinco checkpoints: `551416bff972`
