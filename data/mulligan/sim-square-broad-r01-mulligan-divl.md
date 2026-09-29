# mulligan/sim-square-broad-r01-mulligan-divl

## Resumen

sim-square-broad-r01-mulligan-divl es un checkpoint de un agente de aprendizaje por refuerzo para robotica, publicado por la organizacion mulligan dentro del proyecto Mulligan. No es un modelo de lenguaje: es un agente basado en estado que resuelve la tarea simulada sim-square-broad y que combina un actor de difusion congelado, heredado de sim-square-broad-r01-mulligan-idql, con un critico DIVL de tipo distributional. El repositorio contiene policy.pt y stats.json para cinco semillas (1 a 5), entrenadas hasta el paso 250001.

Su relevancia es experimental y de reproducibilidad. Forma parte de la campana sq_d1_r1_ours_mining_freecf_human_only, correspondiente a la ronda R1 y al brazo mulligan, y esta pensado para comparar algoritmos de RL offline y de auto-mejora sobre una rejilla de estados iniciales reservados. Los resultados declarados en la model card van de 21085/30000 a 22553/30000 exitos por semilla, con una media de 71,74 %.

Se distribuye bajo licencia Apache 2.0, ocupa 1,4 GB en total y sus ficheros son copias identicas (verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en release.json) de los artefactos de Weights & Biases listados. Su ejecucion requiere el codigo de investigacion de Mulligan en el commit da3e816c1b0f.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL basado en estado: actor de difusion congelado (heredado de sim-square-broad-r01-mulligan-idql) mas critico DIVL de tipo distributional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de control; consume observaciones de estado, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; los pesos se distribuyen como pickle de PyTorch) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch pickle: policy.pt + stats.json por semilla |
| Tarea | sim-square-broad |
| Ronda / brazo | R1 / mulligan |
| Celda de campana | sq_d1_r1_ours_mining_freecf_human_only |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Commit del codigo de investigacion | da3e816c1b0f |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado en HuggingFace | robotics |

## Arquitectura y entrenamiento

La model card describe el sistema como un agente basado en estado compuesto por dos piezas: por un lado, el actor de difusion del modelo padre, que se mantiene congelado; por otro, un critico DIVL de tipo distributional que se entrena sobre ese actor fijo. El nombre del artefacto de Weights & Biases asociado a cada semilla (iql_ddpg_bc_idql_divl_square_d1) incluye las siglas IQL, DDPG+BC, IDQL y DIVL, lo que sugiere un pipeline que encadena varias familias de RL offline y de imitacion; la model card no detalla la composicion exacta ni el papel de cada componente, por lo que ese extremo queda como no disponible.

Respecto a los datos, el entrenamiento se realizo sobre tres conjuntos publicados por la misma organizacion: sim-square-broad-c00-teleop-sobol (teleoperacion con cobertura de estados iniciales generada por secuencia de Sobol), sim-square-broad-c01-dagger-mulligan (datos de agregacion tipo DAgger) y sim-square-broad-c01-sobol-policy-rollouts (rollouts de politica sobre la misma rejilla Sobol). El nombre de la celda de campana indica un regimen con mineria de datos y solo datos humanos (mining_freecf_human_only). El entrenamiento se detuvo en el paso 250001 en las cinco semillas, y la evaluacion se hizo sobre una rejilla de estados iniciales reservados. No se documentan en la informacion disponible el numero de tokens o transiciones, la composicion detallada del dataset, ni si hubo fases de RLHF o DPO (conceptos que, por otra parte, no aplican a un agente de control).

## Capacidades

- Control de robotica en simulacion: genera acciones a partir de observaciones de estado para la tarea sim-square-broad.
- Reutilizacion del actor de difusion del modelo padre sim-square-broad-r01-mulligan-idql, que se mantiene congelado durante el entrenamiento del critico.
- Estimacion de valor distributional mediante el critico DIVL, es decir, el critico modela una distribucion de retornos en lugar de un unico valor escalar esperado.
- Reproduccion multi-semilla: se incluyen cinco semillas independientes entrenadas hasta el mismo paso, lo que permite medir varianza entre ejecuciones.
- Generacion de rollouts de politica, utilizables como datos de entrenamiento para nuevas rondas de agregacion tipo DAgger.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible (no aplica).
- Capacidades multilingues: no disponibles (no aplica).
- Capacidades especiales (modo thinking, vision, audio, texto): no disponibles; el modelo es exclusivamente de control basado en estado.
- Uso como linea base en evaluaciones comparativas dentro de Policy Arena.

## Casos de uso

- Reproduccion de resultados de investigacion en RL offline: cargando cada carpeta de semilla con el codigo de Mulligan en el commit da3e816c1b0f se pueden replicar las tasas de exito declaradas sobre la rejilla de estados iniciales reservados, lo que permite auditar la varianza entre semillas.
- Comparacion de criticos en la misma politica: al compartir el actor congelado con sim-square-broad-r01-mulligan-idql, este checkpoint sirve para aislar el efecto del critico DIVL distributional frente a otras formulaciones de critico.
- Generacion de datos de rollout para nuevas rondas de auto-mejora: los episodios producidos por el agente alimentan conjuntos del tipo policy-rollouts y sirven de entrada para fases posteriores de agregacion tipo DAgger.
- Punto de partida para ajuste fino o destilacion: el checkpoint puede tomarse como inicializacion en campanas posteriores o destilarse en una politica mas ligera para despliegue en simulador.
- Analisis de robustez ante condiciones iniciales: la evaluacion sobre una rejilla de estados iniciales reservados permite estudiar en que regiones del espacio de estados falla el agente y con que frecuencia.
- Auditoria de procedencia de artefactos: dado que los ficheros son copias byte a byte con MD5 y SHA-256 registrados, el repositorio sirve para verificar la integridad de resultados en publicaciones y comparativas.
- Linea base en competiciones o leaderboards de robotica simulada: los cinco checkpoints pueden registrarse como entradas de referencia en Policy Arena para contrastar con otros brazos.

## Benchmarks y rendimiento

La model card no incluye benchmarks de lenguaje (MMLU, GSM8K, HumanEval ni similares), ya que no se trata de un modelo de lenguaje. El unico dato cuantitativo publicado es la evaluacion sobre la rejilla de estados iniciales reservados, con los resultados por rollout del conjunto sim-square-broad-r00-r03-eval:

| Semilla | Dataset de evaluacion | N | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-broad-r00-r03-eval | 32 | 21271/30000 | 70,90 % |
| seed-2 | sim-square-broad-r00-r03-eval | 32 | 22553/30000 | 75,18 % |
| seed-3 | sim-square-broad-r00-r03-eval | 32 | 21085/30000 | 70,28 % |
| seed-4 | sim-square-broad-r00-r03-eval | 32 | 21323/30000 | 71,08 % |
| seed-5 | sim-square-broad-r00-r03-eval | 32 | 21384/30000 | 71,28 % |
| Media (calculo propio sobre los datos anteriores) | sim-square-broad-r00-r03-eval | — | 107616/150000 | 71,74 % |

No se publican comparaciones con otros modelos en la informacion disponible, ni metricas de latencia, throughput o coste computacional.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el numero de parametros del actor ni del critico, por lo que no puede derivarse una cifra fiable.
- GPU recomendadas: no disponibles. No hay indicacion en la informacion proporcionada sobre el hardware usado en entrenamiento o evaluacion.
- Compatibilidad con GPU de consumo: no disponible.
- Tamano orientativo en disco: 1,4 GB para el repositorio completo; aproximadamente 280 MB por semilla si el peso se reparte de forma uniforme entre las cinco carpetas (estimacion aritmetica, no confirmada por el autor).
- Opciones de despliegue: no se soportan stacks de servido de modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama). La ejecucion requiere el codigo de investigacion de Mulligan en el commit da3e816c1b0f y el entorno de simulacion de la tarea sim-square-broad.
- Latencia y throughput: no disponibles.
- Nota de seguridad: los ficheros .pt son pickles de PyTorch; la propia model card advierte de que deben cargarse unicamente en entornos de confianza.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Actor | Critico | Semillas | Licencia |
|---|---|---|---|---|---|---|
| sim-square-broad-r01-mulligan-divl (este) | Agente RL basado en estado | sim-square-broad | Difusion congelado, heredado del padre | DIVL distributional | 1 a 5 | Apache 2.0 |
| sim-square-broad-r01-mulligan-idql | Agente RL basado en estado | sim-square-broad | Difusion (origen del actor congelado) | Segun el modelo padre; no detallado en la informacion disponible | no disponible | Apache 2.0 (segun el modelo padre) |

No se dispone de datos sobre otros brazos de la campana, sobre modelos de terceros comparables para la tarea sim-square-broad ni sobre resultados cruzados en Policy Arena. Por tanto, la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta analisis de sesgo, y el modelo no procesa lenguaje, por lo que los sesgos relevantes serian los del dataset de teleoperacion y de rollouts subyacente, no descritos.
- Riesgo de alucinacion: no aplica en el sentido habitual; el riesgo equivalente es producir acciones incorrectas o inseguras en estados poco representados, algo plausible dado que entre el 24,8 % y el 29,7 % de los rollouts de evaluacion no tuvieron exito.
- Limitaciones de contexto: no aplica el concepto de ventana de contexto; el agente depende de la observacion de estado del simulador y de la distribucion de estados vista en entrenamiento.
- Limitaciones de idioma: no aplica.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero la naturaleza de artefacto de investigacion implica que el autor no ofrece garantias ni soporte.
- Dependencia del codigo de investigacion: los checkpoints se entrenaron y evaluaron con el codigo de Mulligan en el commit da3e816c1b0f; sin ese codigo y el entorno sim-square-broad no es posible reproducir ni ejecutar el agente de forma fiable.
- Restriccion de seguridad: los ficheros .pt son pickles de PyTorch; cargarlos en entornos no confiables expone a ejecucion de codigo arbitrario.
- Idoneidad para produccion: no hay ninguna indicacion de despliegue en robot real en la informacion proporcionada; el modelo pertenece a simulacion y a evaluacion comparativa.
- Ausencia de catalogacion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara idiomas soportados.
- Reproducibilidad parcial: aunque se verifican MD5 y SHA-256 de los ficheros, no se publican hiperparametros de entrenamiento ni la receta completa en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-mulligan-divl
- Proyecto Mulligan: https://mulligan.page
- Evaluaciones en Policy Arena: https://arena.mulligan.page
- Organizacion mulligan en HuggingFace: https://huggingface.co/mulligan
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-broad-r01-mulligan-idql
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset de agregacion DAgger: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mulligan
- Dataset de rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Artefactos de Weights & Biases por semilla (identificadores tal como figuran en la model card, sin URL publica): self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260829_195856_616116-final-step-250001:v0 (seed-1); self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260829_195857_129759-final-step-250001:v0 (seed-2); self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260829_202428_427504-final-step-250001:v0 (seed-3); self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260829_202428_390893-final-step-250001:v0 (seed-4); self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260829_210907_956232-final-step-250001:v0 (seed-5)
- Commit del codigo de investigacion: da3e816c1b0f (repositorio no enlazado en la informacion disponible)
