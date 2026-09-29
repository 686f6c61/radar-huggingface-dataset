# mulligan/sim-square-broad-r01-auto-iql-success-bc-n32-idql

# mulligan/sim-square-broad-r01-auto-iql-success-bc-n32-idql

## Resumen
Se trata de un agente de control para robotica entrenado con aprendizaje por refuerzo offline, publicado por la organizacion `mulligan` dentro del proyecto Mulligan. No es un modelo de lenguaje: es una politica de actuacion para la tarea simulada `sim-square-broad`, empaquetada como checkpoint de PyTorch (`policy.pt`) acompanado de ficheros de normalizacion (`stats.json`). El agente sigue el esquema IDQL (Implicit Diffusion Q-Learning): un actor de difusion que genera acciones y un critico escalar basado en IQL (Implicit Q-Learning).

El modelo corresponde a la ronda R1 y al brazo `auto-iql-success-bc-n32` de la campana `sq_d1_r1_auto_iql_success_bc_n32`. Se publican cinco semillas independientes (seed-1 a seed-5), todas entrenadas hasta el paso 250001, lo que permite medir la varianza entre inicializaciones y usar el conjunto como ensemble. El repositorio ocupa 1,4 GB en total.

Su relevancia es metodologica: forma parte de un bucle de entrenamiento auto-mejorado estilo DAgger en el que las politicas generan rollouts etiquetados por exito, se filtran y se reinyectan como datos de comportamiento para la siguiente ronda. En la evaluacion sobre una rejilla de estados iniciales reservada, el agente alcanza una tasa media de exito del 52,14 % (78.206 exitos sobre 150.000 rollouts agregados de las cinco semillas). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion (diffusion policy) con critico escalar IQL; el nombre del run de entrenamiento indica la combinacion `iql_ddpg_bc_idql` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje; el agente es state-based, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; el unico artefacto de pesos es `policy.pt`) |
| Idiomas soportados | no disponible / no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch pickle (`policy.pt`) por semilla, mas `stats.json` con los normalizadores; `release.json` con hashes SHA-256 |
| Tarea | `sim-square-broad` (entorno simulado de manipulacion) |
| Ronda / brazo | R1 / `auto-iql-success-bc-n32` |
| Celda de campana | `sq_d1_r1_auto_iql_success_bc_n32` |
| Semillas publicadas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB (conjunto de las cinco semillas) |
| Tipo de observacion | basada en estado (state-based); no se menciona entrada de vision ni de lenguaje |
| Pipeline declarado en HuggingFace | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La arquitectura es IDQL, un algoritmo de aprendizaje por refuerzo offline que separa la politica del critico. El actor es un modelo generativo de difusion que produce acciones por desruido iterativo, lo que permite representar distribuciones de acciones multimodales sin la restriccion de una politica gaussiana unimodal. El critico es un valor escalar entrenado con IQL, que emplea regresion por expectiles para estimar el valor de la politica sin necesidad de consultar acciones fuera de la distribucion de los datos. El identificador del run (`iql_ddpg_bc_idql_square_d1_20260824_*`) sugiere que el entrenamiento combina IQL con una componente de behavior cloning tipo DDPG+BC, aunque la ficha del autor no detalla la composicion exacta de la perdida ni el numero de parametros de cada red.

Los datos de entrenamiento declarados son dos conjuntos publicos de la organizacion: `sim-square-broad-c00-teleop-baseline` (demostraciones de teleoperacion, que actuan como linea base de comportamiento) y `sim-square-broad-c01-auto-iql-n32-policy-rollouts` (rollouts generados por una politica IQL previa). El nombre del artefacto de W&B (`square-d1-dagger-mining-01a`) indica un proceso de minado de datos tipo DAgger: se recogen trayectorias de la politica actual, se etiquetan por exito y se incorporan al conjunto de entrenamiento de la ronda siguiente. El propio modelo es referenciado por el conjunto `sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts`, es decir, sus propias trayectorias alimentan la ronda posterior, lo que confirma el caracter iterativo del pipeline.

No se documenta el numero de tokens ni de transiciones usadas, ni si hubo fases de RLHF o DPO (conceptos no aplicables a este dominio). Tampoco se describe ninguna innovacion adicional mas alla de la combinacion de actor de difusion con critico IQL y el filtrado de rollouts por exito.

## Capacidades
- Control continuo de un brazo robotico en simulacion para la tarea `sim-square-broad`, a partir de observaciones de estado de baja dimension.
- Generacion de acciones multimodales mediante actor de difusion, lo que permite representar estrategias alternativas en estados ambiguos.
- Aprendizaje puramente offline: no requiere interaccion en linea con el entorno durante el entrenamiento ni un simulador conectado en tiempo de inferencia.
- Ejecucion como politica autonoma (rollouts completos) y, por el esquema de entrenamiento, como generador de datos para la siguiente ronda del bucle auto-mejorado.
- Replicabilidad por semillas: cinco checkpoints independientes entrenados con el mismo protocolo, utiles para ensemble o para analisis de varianza.
- Capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, codigo, matematicas, vision, audio y multilingue: no aplica; este modelo no es un modelo de lenguaje ni un modelo multimodal.
- No se declara soporte de thinking mode ni de ninguna capacidad cognitiva simbolica.

## Casos de uso
- Evaluacion comparativa de algoritmos de RL offline: las cinco semillas y sus tasas de exito registradas permiten comparar IDQL frente a otros algoritmos (por ejemplo, IQL puro o TD3+BC) sobre la misma tarea y el mismo protocolo de evaluacion, aislando el efecto del algoritmo del efecto de la inicializacion.
- Generacion de datos para aprendizaje auto-mejorado: el agente se despliega en el simulador para producir el conjunto `sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts`; esos rollouts, filtrados por exito, se incorporan al entrenamiento de la ronda siguiente. Es el uso principal documentado por el propio autor.
- Punto de partida para ajuste fino o destilacion: al ser un checkpoint PyTorch con licencia Apache 2.0 y normalizadores incluidos, se puede cargar, congelar y usar como inicializacion de un entrenamiento posterior, o destilar el actor de difusion (costoso en pasos de desruido) hacia una politica mas rapida para despliegue.
- Investigacion en politicas de difusion para robotica: sirve como referencia reproducible para estudiar el coste computacional del muestreo por difusion frente a politicas deterministas en control continuo, con un presupuesto de entrenamiento fijo y conocido (250.001 pasos).
- Analisis de robustez ante estados iniciales: la evaluacion se realiza sobre una rejilla de estados iniciales reservada de 32 elementos con 30.000 rollouts por semilla, lo que permite estudiar la sensibilidad de la politica a la condicion inicial y detectar modos de fallo concretos.
- Reproduccion de experimentos academicos: los checkpoints son copias byte a byte de los artefactos de W&B, verificadas por MD5 y con SHA-256 registrado en `release.json`, lo que permite reproducir exactamente los resultados publicados sin reentrenar.
- Ensemble de politicas en simulacion: combinar las cinco semillas (por ejemplo, mediante votacion de acciones o seleccion del critico) es un escenario natural para medir si la diversidad entre semillas se traduce en mejor robustez que una sola politica.
- Transferencia sim-a-real como linea de investigacion: la tarea simulada y el agente state-based son candidatos para probar tecnicas de adaptacion de dominio hacia un manipulador fisico, siempre que exista una correspondencia razonable entre el espacio de estados simulado y el real.

## Benchmarks y rendimiento
El autor publica una unica evaluacion: una rejilla de estados iniciales reservada, con 30.000 rollouts por semilla y el numero de exitos registrados en el conjunto `sim-square-broad-r00-r03-eval`. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y esos benchmarks no son aplicables a este tipo de modelo.

| Semilla | N (rejilla inicial) | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 30.000 | 15.261 | 50,87 % |
| seed-2 | 32 | 30.000 | 15.455 | 51,52 % |
| seed-3 | 32 | 30.000 | 16.198 | 53,99 % |
| seed-4 | 32 | 30.000 | 15.423 | 51,41 % |
| seed-5 | 32 | 30.000 | 15.869 | 52,90 % |
| Agregado | 32 | 150.000 | 78.206 | 52,14 % |

El rango entre semillas va del 50,87 % al 53,99 %, una dispersion de unos 3,1 puntos porcentuales. No se proporcionan intervalos de confianza, baselines de otros algoritmos en la misma tabla ni metricas de retorno, solo el conteo de exitos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El autor no publica el recuento de parametros ni el tamano del checkpoint individual.
- Tamano del despliegue: el repositorio completo ocupa 1,4 GB para cinco semillas, lo que da del orden de 280 MB por semilla incluyendo `policy.pt` y `stats.json` (cifra derivada del tamano total, no declarada explicitamente por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada. Al tratarse de un agente state-based, sin codificador visual ni transformer de lenguaje, la carga de inferencia es previsiblemente muy inferior a la de un modelo de lenguaje de tamano comparable; no obstante, no hay cifras publicadas que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada por el autor. Dado el perfil state-based del agente, es razonable esperar que quepa en GPU de consumo e incluso que funcione en CPU, pero esto es una inferencia y no un dato publicado.
- Opciones de despliegue: no se documentan. vLLM, Ollama, llama.cpp o TGI no son aplicables (no es un modelo de lenguaje). El unico camino documentado es cargar `policy.pt` y `stats.json` con PyTorch en un entorno de confianza, aplicando los normalizadores antes y despues de la politica.
- Latencia y throughput: no disponibles. La latencia dependera del numero de pasos de desruido del actor de difusion, parametro que no se especifica en la ficha.
- Almacenamiento: 1,4 GB para el conjunto completo; aproximadamente 280 MB si se despliega una sola semilla.

## Comparativa con modelos similares
No se han publicado en la informacion disponible datos comparativos con otros agentes sobre la misma tarea. La model card no incluye baselines (por ejemplo, la politica de teleoperacion `c00-teleop-baseline`) en la tabla de evaluacion, por lo que no es posible establecer una comparacion cuantitativa con alternativas. Como referencia cualitativa, las categorias con las que este modelo comparte espacio son:

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IDQL, actor de difusion + critico IQL) | no disponible | no aplica | 50,87-53,99 % de exito por semilla | Apache 2.0 | publico en HuggingFace |
| Politica de teleoperacion `sim-square-broad-c00-teleop-baseline` | no disponible | no aplica | no disponible en esta informacion | no disponible | dataset publico en HuggingFace |
| Politica IQL de la ronda previa (`c01-auto-iql-n32-policy-rollouts`) | no disponible | no aplica | no disponible en esta informacion | no disponible | dataset publico en HuggingFace |
| Otros algoritmos de RL offline (IQL puro, TD3+BC, CQL) | no disponible | no aplica | no disponible | no aplica | no evaluados en esta informacion |

## Limitaciones y advertencias
- Dominio restringido: el agente solo ha sido entrenado para la tarea simulada `sim-square-broad`. No hay evidencia de generalizacion a otras tareas, objetos, morfologias de robot o entornos fisicos.
- Rendimiento moderado: una tasa de exito agregada del 52,14 % implica que aproximadamente uno de cada dos rollouts falla. No es un modelo listo para produccion sin una capa adicional de deteccion de fallo y reintento.
- Varianza entre semillas: la tasa de exito varia entre el 50,87 % y el 53,99 % segun la semilla, por lo que la eleccion de checkpoint afecta de forma medible al resultado y conviene reportar siempre la semilla.
- Naturaleza offline: el entrenamiento es puramente offline, por lo que el agente esta expuesto a los sesgos y a la cobertura limitada del conjunto de datos. Los estados poco representados en `c00` y `c01` probablemente concentran los fallos.
- Sesgos: no se documentan analisis de sesgo. En el caso de datos de teleoperacion humana, es esperable que la politica herede las preferencias y los sesgos del operador (trayectorias, velocidades, estrategias de agarre), aunque el autor no lo cuantifica.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe el equivalente funcional de acciones plausibles aunque incorrectas: el actor de difusion puede generar trayectorias coherentes con la distribucion entrenada que no completan la tarea.
- Evaluacion limitada: solo se publican conteos de exito sobre una rejilla de 32 estados iniciales y una unica tarea. No hay intervalos de confianza, curvas de aprendizaje ni evaluacion en hardware real.
- Riesgo de seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch. El propio autor advierte que deben cargarse unicamente en un entorno de confianza, ya que la deserializacion de un pickle puede ejecutar codigo arbitrario.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya. No se imponen restricciones adicionales segun la informacion disponible, pero conviene verificar el texto completo de la licencia antes de un despliegue comercial.
- Sin garantias de mantenimiento: el modelo tiene 0 descargas y 0 likes, y la ficha no indica soporte, versionado posterior ni plan de actualizacion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-auto-iql-success-bc-n32-idql
- Proyecto Mulligan: https://mulligan.page
- Evaluaciones en Policy Arena: https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de entrenamiento (teleoperacion baseline): https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de entrenamiento (rollouts de politica IQL): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
- Dataset que referencia este modelo (rollouts etiquetados por exito): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Paper o articulo tecnico: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada (la ficha menciona "Mulligan research code" en los commits `4331e35b2900` y `b2c8d6868dae`, sin enlace)
- Demo: no disponible en la informacion proporcionada
