# mulligan/sim-square-narrow-r01-auto-iql-n32-idql

## Resumen

`mulligan/sim-square-narrow-r01-auto-iql-n32-idql` es un agente de aprendizaje por refuerzo offline (offline RL) para control robótico, no un modelo de lenguaje. Lo publica la organizacion Mulligan dentro de su campana de investigacion sobre la tarea simulada `sim-square-narrow` (variante estrecha del ensamblaje de tuerca y cuadrado de robosuite). El artefacto es un agente IDQL: un actor de difusion condicionado por estado junto con un critico escalar entrenado con Implicit Q-Learning (IQL), empaquetado como checkpoint PyTorch (`policy.pt`) mas un fichero `stats.json` con los normalizadores de observaciones y acciones.

El modelo corresponde a la ronda R1 de la campana, brazo `auto-iql-n32`, celda `sq_d0_r1_auto_iql_n32`, y se distribuye con cinco semillas independientes (una carpeta por semilla), todas entrenadas hasta el paso 150001. Se entreno sobre el dataset de teleoperacion `sim-square-narrow-c00-teleop-baseline` y sobre los rollouts de politica `sim-square-narrow-c01-auto-iql-n32-policy-rollouts`, y sus propios rollouts quedan referenciados por la metadata de `sim-square-narrow-c02-auto-iql-n32-policy-rollouts` y del conjunto de evaluacion `sim-square-narrow-r00-r03-eval`.

Su relevancia es de tipo metodologico y de reproducibilidad: proporciona checkpoints byte a byte identicos a los artefactos de Weights & Biases (verificados por MD5 contra el manifiesto y con SHA-256 en `release.json`), con resultados de evaluacion por semilla publicados en un dataset aparte. La tasa de exito agregada en la rejilla de estados iniciales reservada es de 29613 aciertos sobre 40000 rollouts (74,03 %), con una variabilidad entre semillas notable (del 68,76 % al 76,69 %), lo que lo convierte en una referencia util para estudiar la varianza de semilla en pipelines de RL offline con actor de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion condicionado por estado + critico escalar IQL (entrenamiento con componente de behavior cloning tipo DDPG+BC) |
| Parametros totales | no disponible (no se publica el recuento; el repositorio completo con 5 semillas ocupa 1,4 GB) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (politica de control basada en estado, no un modelo de lenguaje; no se publica ventana de historial) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch en la precision de entrenamiento; no hay versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle: `policy.pt` por semilla mas `stats.json` con normalizadores |
| Tarea | `sim-square-narrow` |
| Ronda del modelo | R1 |
| Brazo | `auto-iql-n32` |
| Celda de campana | `sq_d0_r1_auto_iql_n32` |
| Semillas incluidas | 1, 2, 3, 4, 5 (un directorio por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Tipo de observacion | estado (state-based); no se declaran entradas de imagen |
| Datasets de entrenamiento | `mulligan/sim-square-narrow-c00-teleop-baseline`, `mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts` |
| Pipeline declarado en HuggingFace | robotics |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: la politica es un actor de difusion que genera acciones por muestreo iterativo condicionado por el estado, mientras que la funcion de valor se aprende con IQL, es decir, con un critico escalar que evita consultar acciones fuera de la distribucion del dataset mediante expectile regression sobre la funcion Q y un critico de valor V. El pipeline de entrenamiento corresponde a la implementacion `iql_ddpg_bc_idql_nutassemblysquare` del codigo de investigacion de Mulligan, con un componente de behavior cloning que ancla el actor a las acciones del dataset. No se publican en la informacion disponible el numero de tokens o transiciones exactas, la composicion detallada del dataset, ni si hubo etapas adicionales de ajuste mas alla del bucle de entrenamiento hasta el paso 150001.

El artefacto forma parte de un bucle de auto-mejora: los checkpoints se entrenaron sobre datos de teleoperacion mas rollouts de politica generados en una ronda anterior (dataset `c01`), y a su vez generan nuevos datos (`c02`) que quedan referenciados por la metadata de este modelo. La variante `n32` hace referencia a la configuracion del brazo dentro de la campana, si bien el significado exacto de ese parametro no se detalla en la informacion proporcionada. Cada semilla procede de un artefacto de W&B distinto, con los commits de codigo `6f21c002a881` (semillas 1 a 4) y `f7149fd16945` (semilla 5), lo que permite trazar la reproducibilidad exacta del entrenamiento.

## Capacidades

- Generacion de acciones de control continuo para manipulacion robotica a partir de observaciones de estado, mediante muestreo de un actor de difusion.
- Estimacion de valor fuera de politica con un critico IQL escalar, util para filtrar o ponderar trayectorias en pipelines de RL offline.
- Ejecucion de la tarea de ensamblaje `sim-square-narrow` en simulacion, con una tasa de exito agregada del 74,03 % en la rejilla de estados iniciales reservada.
- Generacion de rollouts de politica reutilizables como datos de entrenamiento en rondas posteriores del bucle de auto-mejora (el dataset `c02` referencia este modelo).
- Evaluacion reproducible con cinco semillas independientes, lo que permite medir varianza de semilla y no solo el rendimiento de una unica ejecucion.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en el sentido de los LLM: no aplica; opera como politica dentro de un bucle de control paso a paso.
- Capacidades multilingues: no aplica.
- Capacidades especiales: ninguna declarada mas alla del muestreo por difusion y del critico IQL.

## Casos de uso

- Investigacion en RL offline con actores de difusion: usar los cinco checkpoints como linea base reproducible para comparar variantes de actor (difusion frente a gaussiano o determinista) manteniendo fijo el critico IQL.
- Estudio de varianza de semilla: los resultados por semilla (del 68,76 % al 76,69 % de exito) permiten cuantificar cuanto de la mejora atribuida a un cambio de metodo es en realidad ruido de inicializacion.
- Ablacion del componente de behavior cloning: al disponer del codigo en un commit concreto y de los datasets de entrenamiento, se puede reentrenar el brazo `auto-iql-n32` variando el peso del termino BC y comparar contra estos checkpoints.
- Generacion de datos sinteticos de manipulacion: ejecutar el agente en el simulador para producir nuevos rollouts etiquetados por exito, que alimentan rondas posteriores de entrenamiento (patron ya usado por el dataset `c02`).
- Desarrollo de un arnes de evaluacion para manipulacion: la rejilla de estados iniciales reservada y el formato de log por rollout del dataset `sim-square-narrow-r00-r03-eval` sirven como plantilla de evaluacion para otros agentes de la misma tarea.
- Analisis de sensibilidad del critico: comparar el critico IQL escalar de este brazo con criticos basados en ensemble para estudiar su efecto sobre el filtrado de acciones en el actor de difusion.
- Docencia y practicas de RL offline: tarea de estado relativamente contenido y checkpoints pequenos que permiten reproducir un ciclo completo de entrenamiento y evaluacion en un entorno simulado.
- Comparacion entre rondas de auto-mejora: al existir rondas R0 a R3 en la misma campana, este modelo sirve como punto intermedio para medir la ganancia marginal de cada ronda de mineria de datos.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados corresponden a la propia campana, sobre una rejilla de estados iniciales reservada con N=32 y 8000 rollouts evaluados por semilla. No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos de lenguaje, ya que no es un modelo de lenguaje.

| Semilla | Rollouts evaluados | Exitos | Tasa de exito |
|---|---|---|---|
| 1 | 8000 | 6086 | 76,08 % |
| 2 | 8000 | 5794 | 72,43 % |
| 3 | 8000 | 5501 | 68,76 % |
| 4 | 8000 | 6097 | 76,21 % |
| 5 | 8000 | 6135 | 76,69 % |
| Agregado | 40000 | 29613 | 74,03 % |

No se han publicado en la informacion disponible comparaciones numericas con otros agentes (por ejemplo, otros brazos de la misma campana) mas alla de la referencia al conjunto de evaluacion conjunto `sim-square-narrow-r00-r03-eval`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del tamano del repositorio (1,4 GB para cinco semillas, es decir, del orden de 250-300 MB por semilla incluyendo actor y critico), el espacio necesario para cargar una unica politica es reducido y compatible con GPU de gama de entrada; se trata de una estimacion a partir del tamano del repositorio, no de un dato publicado.
- GPU recomendadas: no se especifican. Para inferencia de una unica politica de control basada en estado, cualquier GPU con unos pocos GB de VRAM es suficiente en la practica; para reentrenar con el codigo de Mulligan conviene una GPU de gama media o superior, aunque no se publican requisitos concretos.
- Cabe en GPU de consumo: si, con alta probabilidad, dado el tamano del checkpoint; no se confirma con datos oficiales.
- Ejecucion en CPU: plausible para inferencia puntual, dado que la red es un actor de difusion de tipo MLP sobre estados; no confirmado por el autor.
- Opciones de despliegue: no aplican los servidores de inferencia de LLM (vLLM, TGI, Ollama, llama.cpp). El uso previsto es cargar `policy.pt` y `stats.json` con PyTorch dentro del codigo de investigacion de Mulligan, en los commits `6f21c002a881` o `f7149fd16945`, y ejecutar el entorno `sim-square-narrow`.
- Latencia y throughput: no disponibles. Al ser un actor de difusion, la inferencia implica varios pasos de denoising por accion, por lo que la latencia depende del numero de pasos configurado, dato no publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `mulligan/sim-square-narrow-r01-auto-iql-n32-idql` (este modelo) | IDQL (actor de difusion + critico IQL) | `sim-square-narrow` | no disponible | no aplica | 74,03 % de exito agregado (5 semillas, 40000 rollouts) | MIT | HuggingFace, 1,4 GB, 5 semillas |
| Otros brazos y rondas de la misma campana Mulligan (por ejemplo R0 y R3 de `sim-square-narrow`) | agentes de RL offline de la misma familia | `sim-square-narrow` | no disponible | no aplica | no disponible en la informacion proporcionada | MIT (segun los repositorios de la organizacion) | HuggingFace, organizacion `mulligan` |
| Algoritmos de RL offline de referencia (IQL, CQL, TD3+BC, Diffusion Policy) | implementaciones de investigacion | tareas de manipulacion simulada | no disponible | no aplica | no disponible en la informacion proporcionada | depende de cada repositorio | repositorios publicos de investigacion |

No se dispone de resultados comparativos publicados en la informacion proporcionada que permitan situar este checkpoint frente a alternativas externas con cifras verificables.

## Limitaciones y advertencias

- Ambito restringido: es un agente especifico de la tarea simulada `sim-square-narrow`; no es reutilizable directamente en otras tareas sin reentrenamiento.
- Entrada basada en estado: no procesa imagenes ni lenguaje, por lo que no sirve para escenarios de vision-lenguaje-accion sin cambios arquitectonicos.
- Varianza de semilla elevada: la tasa de exito oscila entre el 68,76 % y el 76,69 % segun la semilla, una diferencia de casi 8 puntos porcentuales, relevante al comparar metodos.
- Riesgo de sobreajuste a la rejilla de estados iniciales de evaluacion: los resultados corresponden a una rejilla reservada concreta y no garantizan generalizacion a otras distribuciones de estados iniciales.
- Fallos residuales: incluso la mejor semilla falla en aproximadamente el 23 % de los rollouts, por lo que no es adecuado como componente unico en un sistema que requiera alta fiabilidad.
- Sin validacion en robot real: no se publican resultados de transferencia sim-a-real ni evaluaciones en hardware fisico.
- Restricciones de licencia: MIT permite uso comercial y modificacion, pero no se documentan en la informacion disponible las condiciones de los datasets asociados ni de posibles dependencias del entorno de simulacion.
- Seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch, por lo que deben cargarse unicamente en entornos de confianza, tal como advierte la propia model card.
- Trazabilidad del entrenamiento: los checkpoints son copias identicas de artefactos de W&B; reproducir el entrenamiento exige el codigo en los commits indicados y los datasets enlazados, que pueden cambiar de disponibilidad.
- Proyeccion temporal de las fechas: el repositorio aparece creado y actualizado con fechas de septiembre de 2026, posteriores a la fecha habitual de consulta, dato que conviene verificar en la plataforma.
- Advertencia sobre la busqueda web: las consultas realizadas no devolvieron resultados tecnicos relevantes sobre este modelo; los enlaces devueltos no guardan relacion con el artefacto y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-auto-iql-n32-idql
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de teleoperacion base: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de politica (entrenamiento): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset de rollouts de politica (ronda posterior): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-iql-n32-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- No se han encontrado papers, blogs ni repositorios adicionales sobre este modelo en la busqueda web realizada.
