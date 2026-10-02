# mulligan/sim-square-broad-r03-auto-iql-success-bc-n32-idql

## Resumen

`mulligan/sim-square-broad-r03-auto-iql-success-bc-n32-idql` es un agente de aprendizaje por refuerzo offline para robótica, publicado por la organización Mulligan dentro de su colección de referencia (benchmark) de políticas de manipulación. No es un modelo de lenguaje: se trata de un checkpoint de política entrenada para la tarea simulada `sim-square-broad`, que consiste en la manipulación de un cuadrado en un entorno de simulación con observaciones basadas únicamente en estado (state-based), sin entrada visual.

El agente sigue el esquema IDQL (Implicit Q-Learning as an Actor-Critic Method), es decir, un actor de difusión que genera acciones junto con un crítico IQL escalar. El repositorio incluye cinco semillas independientes (`seed-1` a `seed-5`), cada una con su fichero `policy.pt` y sus normalizadores `stats.json`, con un total de 1,4 GB. El entrenamiento alcanza el paso 250.001 y combina datos de teleoperación con rollouts de políticas automáticas ponderados por éxito (`auto-iql-success-bc-n32`).

Su relevancia es metodológica antes que práctica: forma parte de la ronda R3 de la campaña `sq_d1_r3_auto_iql_success_bc_n32` y sirve como punto de comparación reproducible frente a otras rondas y variantes de la misma tarea. La evaluación publicada sobre una rejilla de estados iniciales retenidos arroja una tasa de éxito media del 53,65 % (80.475 éxitos sobre 150.000 intentos agregados), con una variabilidad entre semillas de unos tres puntos porcentuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion (policy network) con critico IQL escalar; entrada basada en estado (state-based) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como checkpoint PyTorch, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (pickle) + `stats.json` con normalizadores; un directorio por semilla |

Otros datos del repositorio:

| Parametro | Valor |
|---|---|
| Autor / organizacion | mulligan |
| Pipeline declarado | robotics |
| Tarea | sim-square-broad |
| Ronda de modelo | R3 |
| Brazo (arm) | auto-iql-success-bc-n32 |
| Celda de campana | `sq_d1_r3_auto_iql_success_bc_n32` |
| Semillas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

El agente implementa IDQL, una reinterpretacion de Implicit Q-Learning como metodo actor-critico. El critico es escalar y se entrena mediante un backup de Bellman modificado que solo utiliza acciones presentes en el dataset, lo que evita consultar la Q-function sobre acciones fuera de distribucion. El actor es un modelo de difusion que genera acciones muestreando de forma iterativa, en lugar de una politica gaussiana o determinista convencional; esta formulacion permite representar distribuciones de acciones multimodales, habituales en datos de teleoperacion y de rollouts heterogeneos.

El entrenamiento es puramente offline y se apoya en cuatro conjuntos de datos: una linea base de teleoperacion (`sim-square-broad-c00-teleop-baseline`) y tres colecciones de rollouts generados por politicas automaticas (`c01-auto-iql-n32-policy-rollouts`, `c02-auto-iql-success-bc-n32-policy-rollouts` y `c03-auto-iql-success-bc-n32-policy-rollouts`). La variante `success-bc` indica que el comportamiento imitado se pondera o filtra por exito, de modo que el actor aprende preferentemente de trayectorias que completan la tarea. No se documenta en la informacion disponible el numero total de transiciones, la composicion exacta del dataset, ni si hubo etapas adicionales de RLHF o DPO (conceptos, por otra parte, no aplicables a este tipo de politica). Las configuraciones de ejecucion de cada semilla se referencian como `release/run-configs/sim-square-broad-r03-auto-iql-success-bc-n32-idql__seed-N.json` dentro del repositorio de codigo de Mulligan, que permite reproducir el entrenamiento.

## Capacidades

- Control de manipulacion en simulacion: genera acciones motoras para la tarea `sim-square-broad` a partir de observaciones de estado.
- Generacion de acciones multimodales: el actor de difusion puede representar multiples modos de accion validos para un mismo estado.
- Aprendizaje offline: funciona sin interaccion en linea durante el entrenamiento, a partir de datasets previamente recogidos.
- Reproducibilidad multi-semilla: se publican cinco semillas independientes, lo que permite estimar la varianza del metodo.
- Ponderacion por exito: la variante `success-bc` incorpora informacion de exito en el comportamiento imitado.
- Generacion de rollouts: puede emplearse para producir trayectorias sinteticas que alimenten datasets posteriores.
- No dispone de tool calling, function calling, capacidades de agente multi-paso en el sentido de los LLM, capacidades multilingues, vision, audio ni modo de razonamiento explicito. No aplica ninguna de ellas por la naturaleza del modelo.

## Casos de uso

- Investigacion en RL offline: sirve como referencia reproducible para comparar IDQL frente a otras variantes (IQL puro, behavior cloning, agentes con actor gaussiano) sobre una misma tarea y un mismo conjunto de datos.
- Generacion de datos sinteticos: sus rollouts pueden volcarse a un dataset etiquetado por exito, como ya se hace en las colecciones `c01` a `c03`, para alimentar rondas posteriores de entrenamiento.
- Punto de partida para fine-tuning: el checkpoint puede inicializar un entrenamiento posterior sobre tareas de manipulacion relacionadas o con mas datos, aprovechando que la licencia MIT permite modificarlo y redistribuirlo.
- Evaluacion comparativa estandarizada: integrado en la rejilla de estados iniciales retenidos de `sim-square-broad-r00-r03-eval`, permite medir de forma homogenea el efecto de cambios en el algoritmo o en los datos.
- Destilacion de politicas: el actor de difusion, costoso por su muestreo iterativo, puede actuar como profesor para destilar una politica mas rapida de una sola pasada, util en control a alta frecuencia.
- Analisis de robustez y varianza: con cinco semillas se puede estudiar la sensibilidad del metodo a la inicializacion y a la semilla de recogida de datos, algo poco frecuente en publicaciones de RL offline.
- Estudio de sim2real: como etapa previa a un despliegue fisico, el agente puede usarse para analizar la degradacion de rendimiento al transferir politicas entrenadas en simulacion, aunque no hay evidencia publicada de transferencia real en esta ficha.

## Benchmarks y rendimiento

Los unicos resultados publicados son las evaluaciones sobre la rejilla de estados iniciales retenidos del dataset `sim-square-broad-r00-r03-eval`. Se reportan por semilla, con N = 32 y 30.000 intentos por semilla.

| Semilla | N | Exitos | Intentos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 16075 | 30000 | 53,58 % |
| seed-2 | 32 | 16300 | 30000 | 54,33 % |
| seed-3 | 32 | 16467 | 30000 | 54,89 % |
| seed-4 | 32 | 15595 | 30000 | 51,98 % |
| seed-5 | 32 | 16038 | 30000 | 53,46 % |
| Media agregada | 32 | 16095 | 30000 | 53,65 % |

No se han publicado resultados de benchmarks comparativos frente a otras politicas (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo). No se dispone de datos de latencia, throughput ni coste computacional de la evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion publicada. El repositorio completo ocupa 1,4 GB para cinco semillas, de modo que cada checkpoint individual es previsiblemente de decenas o cientos de megabytes, pero no se confirma el numero de parametros ni la precision de los pesos.
- GPU recomendadas: no especificadas por el autor. Al tratarse de una politica de estado de proposito general, la inferencia de una sola accion es viable en CPU; una GPU consumer tipo RTX 4090 resulta adecuada para lanzar evaluaciones con muchos entornos en paralelo dentro del simulador.
- Cabe en GPU consumer: muy probablemente si, dado el tamano del repositorio, aunque no hay confirmacion oficial.
- Opciones de despliegue: carga directa del checkpoint PyTorch (`policy.pt`) junto con `stats.json` para la normalizacion de observaciones y acciones. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El muestreo del actor de difusion implica varios pasos de denoising por accion, lo que condiciona la frecuencia de control alcanzable, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tarea | Ronda / brazo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| sim-square-broad-r03-auto-iql-success-bc-n32-idql | sim-square-broad | R3 / auto-iql-success-bc-n32 | no disponible | no aplica | 53,65 % de exito medio (5 semillas) | MIT | HuggingFace |
| sim-square-broad-r02-auto-iql-n32-idql | sim-square-broad | R2 / auto-iql-n32 | no disponible | no aplica | no disponible | MIT (presumible, no confirmado en la informacion disponible) | HuggingFace |
| Variantes de la misma campana (por ejemplo, brazos no ponderados por exito) | sim-square-broad | R3 / distintos brazos | no disponible | no aplica | no disponible | MIT | HuggingFace (organizacion mulligan) |

La unica comparacion documentada en la informacion disponible es con el checkpoint de la ronda anterior (`r02`), del que no se han recogido cifras de rendimiento. No se dispone de comparaciones frente a agentes externos al proyecto Mulligan.

## Limitaciones y advertencias

- Dominio restringido: la politica esta entrenada exclusivamente para la tarea simulada `sim-square-broad`; no es un modelo general y no se espera que funcione en otras tareas sin reentrenamiento o fine-tuning.
- Rendimiento modesto: la tasa de exito media del 53,65 % implica que aproximadamente una de cada dos ejecuciones no completa la tarea. No es un agente apto para despliegue directo en produccion.
- Entrada solo de estado: no procesa imagenes ni otros datos sensoriales de alta dimension, lo que limita su aplicacion a entornos donde el estado completo este disponible.
- Sin evidencia de transferencia al mundo real: no se documenta validacion sim2real ni resultados en hardware fisico.
- Riesgo de sobreajuste al simulador: al entrenar sobre rollouts generados por politicas automaticas, el agente puede explotar sesgos del simulador o de la distribucion de datos recogida.
- Seguridad del formato de pesos: los ficheros `.pt` son pickles de PyTorch; cargarlos ejecuta codigo de deserializacion. Deben cargarse unicamente en entornos de confianza. Los SHA-256 de cada fichero estan registrados en `release.json` y deberian verificarse antes de su uso.
- Licencia permisiva: MIT permite uso comercial, modificacion y redistribucion, pero no ofrece garantias. Conviene citar la procedencia original.
- Sesgos y limitaciones de idioma: no aplica, al no ser un modelo de lenguaje. No hay datos publicados sobre sesgos de comportamiento en la politica.
- Sin datos de mantenimiento: el repositorio registra 0 descargas y 0 likes, y no se documenta soporte posterior a la publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r03-auto-iql-success-bc-n32-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de teleoperacion base: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
- Dataset de rollouts c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Dataset de rollouts c03: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-auto-iql-success-bc-n32-policy-rollouts
- Checkpoint de la ronda anterior (R2): https://huggingface.co/mulligan/sim-square-broad-r02-auto-iql-n32-idql
- Articulo IDQL: Implicit Q-Learning as an Actor-Critic Method with Diffusion Policies: https://arxiv.org/abs/2304.10573
- Ficha externa del dataset c03 (claru.ai): https://claru.ai/datasets/mulligan-sim-square-broad-c03-auto-iql-success-bc-n32-policy-rollouts
