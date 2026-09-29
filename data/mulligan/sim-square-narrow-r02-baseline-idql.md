# mulligan/sim-square-narrow-r02-baseline-idql

## Resumen

sim-square-narrow-r02-baseline-idql es un agente de aprendizaje por refuerzo offline (offline RL) publicado por el proyecto Mulligan en HuggingFace. Se trata de un agente IDQL (Implicit Q-Learning as an Actor-Critic) basado en estado: combina un actor de difusion con un critico IQL escalar, y se distribuye como checkpoint de PyTorch (`policy.pt`) junto con los normalizadores en `stats.json`. No es un modelo de lenguaje ni un modelo fundacional multimodal: es una politica de control entrenada para una unica tarea de manipulacion simulada, `sim-square-narrow`.

El modelo forma parte de la campana `sq_d0_r2_baseline_uniform_nocf_human_only`, en la ronda R2 y en la rama (arm) `baseline`. Se publican cinco semillas independientes (seed-1 a seed-5), cada una en su propia carpeta, todas correspondientes al paso de entrenamiento 150001. El repositorio ocupa 1,4 GB en total. La relevancia de esta ficha es acotada y experimental: sirve como referencia base (baseline) dentro de una campana de investigacion sobre recogida de datos guiada por rendimiento, y como punto de comparacion reproducible para otras variantes de la misma campana.

La evaluacion publicada se realizo sobre una rejilla de estados iniciales retenidos (held-out), con 8000 episodios por semilla. Las tasas de exito por semilla van del 90,64 % al 92,46 %, con un 91,79 % agregado sobre 40 000 episodios. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico de RL offline: actor de difusion (diffusion policy) con critico IQL escalar (IDQL) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (agente de control basado en estado, no procesa texto) |
| Tipos de cuantizacion | no disponible (se distribuye en punto flotante de PyTorch; no hay versiones cuantizadas publicadas) |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, pickle) + `stats.json` con normalizadores |
| Tarea | sim-square-narrow |
| Ronda de modelo | R2 |
| Rama (arm) | baseline |
| Celda de campana | `sq_d0_r2_baseline_uniform_nocf_human_only` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Commit de codigo | `ec52959c99f0` |
| Tamano del repositorio | 1,4 GB |
| Tipo de observacion | basada en estado (state-based) |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL descrito en el articulo *IDQL: Implicit Q-Learning as an Actor-Critic Method with Diffusion Policies* (arXiv:2304.10573). La componente critica es una Q-funcion IQL escalar entrenada con un backup de Bellman modificado que solo emplea acciones presentes en el dataset, lo que evita evaluar acciones fuera de distribucion (out-of-distribution). La componente de actor es una politica de difusion que modela la distribucion de acciones y selecciona acciones por muestreo; en el pipeline de Mulligan, la seleccion de acciones puede combinarse con el critico para filtrar candidatas (variante HiL-IDQL). El checkpoint se distribuye como `policy.pt` mas `stats.json`, que contiene los normalizadores de observaciones y acciones.

El entrenamiento se realizo con el codigo de investigacion de Mulligan en el commit `ec52959c99f0`, hasta el paso 150001 en las cinco semillas. Los datos de entrenamiento son cinco datasets publicados por el propio proyecto: `sim-square-narrow-c00-teleop-baseline` (teleoperacion base), `sim-square-narrow-c01-baseline-policy-rollouts` y `sim-square-narrow-c02-baseline-policy-rollouts` (rollouts de la politica base) y `sim-square-narrow-c01-dagger-baseline` y `sim-square-narrow-c02-dagger-baseline` (datos de tipo DAgger sobre la politica base). La campana usa muestreo uniforme de estados iniciales y datos de origen humano (`human_only`), sin curriculo ni filtrado por valor. El numero exacto de transiciones, la composicion porcentual del dataset y el uso de RLHF/DPO no estan disponibles en la informacion proporcionada.

Procedencia: los ficheros son copias byte a byte de los artefactos de Weights & Biases indicados en la model card (seed-1: `iql_ddpg_bc_idql_nutassemblysquare_20260528_002017_026832_task1-final-step-150001:v0`, y equivalentes para el resto de semillas), con verificacion MD5 contra el manifiesto del artefacto y SHA-256 registrado en `release.json`. Los nombres de los artefactos hacen referencia a `nutassemblysquare`, lo que sugiere una tarea de ensamblaje de tuerca cuadrada en un entorno simulado, aunque la model card no lo confirma de forma explicita.

## Capacidades

- Control continuo basado en estado: genera acciones para la tarea `sim-square-narrow` a partir de observaciones de estado de baja dimension.
- Politica de difusion: representa distribuciones multimodales de acciones, util en tareas de manipulacion con multiples soluciones validas.
- Critica Q escalar consistente en distribucion: permite puntuar acciones candidatas del actor (seleccion por valor, variante HiL-IDQL) sin usar acciones fuera del dataset.
- Reproducibilidad multi-semilla: cinco politicas independientes (seed-1 a seed-5) entrenadas con la misma configuracion, utiles para estimar varianza de entrenamiento.
- Compatibilidad con pipelines de recogida de datos: los datasets asociados incluyen rollouts de politica y datos DAgger, por lo que la politica encaja en bucles de mejora iterativa.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio: no disponible (el modelo no cubre estas capacidades).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no aplicable.
- Capacidades multilingues: no aplicable.

## Casos de uso

- Baseline de referencia en investigacion de RL offline: el checkpoint permite reproducir la linea base de la campana `sq_d0_r2_baseline_uniform_nocf_human_only` y comparar contra variantes con muestreo guiado por rendimiento, con la misma tarea, el mismo paso de entrenamiento y cinco semillas.
- Estudio de varianza entre semillas: las cinco carpetas permiten medir la dispersion de la tasa de exito (del 90,64 % al 92,46 % sobre 8000 episodios por semilla) y decidir cuantas semillas hacen falta para detectar mejoras pequeñas.
- Evaluacion en rejilla de estados iniciales retenidos: el dataset `sim-square-narrow-r00-r03-eval` esta referenciado por los metadatos de este modelo, de modo que el agente puede usarse como sujeto de evaluacion ciego sobre estados iniciales no vistos.
- Generacion de datos para DAgger: el agente puede desplegarse en simulacion para producir nuevos rollouts sobre los que pedir correcciones (los datasets `c01-dagger-baseline` y `c02-dagger-baseline` son ejemplos de ese flujo).
- Componente de un pipeline HiL-IDQL en robot real: el proyecto Mulligan reporta que HiL-IDQL combinado con su metodo de recogida de datos mejora el exito final en tareas reales entre 14 y 34 puntos porcentuales frente a la linea base; este checkpoint es la referencia simulada para ese tipo de transferencia.
- Ablacion de actor de difusion frente a actor determinista: al distribuirse por separado `policy.pt` y `stats.json`, es sencillo sustituir el actor manteniendo el mismo critico IQL y medir el efecto sobre la tasa de exito.
- Pruebas de estres en condiciones de distribucion estrecha: la variante `narrow` permite medir la degradacion del agente cuando los estados iniciales se restringen, un escenario tipico en evaluaciones de robustez.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K u otros), ya que no es un modelo de lenguaje. El unico resultado publicado es la tasa de exito sobre una rejilla de estados iniciales retenidos, con 8000 episodios por semilla:

| Semilla | Dataset de evaluacion | Episodios | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-narrow-r00-r03-eval | 8000 | 7296 | 91,20 % |
| seed-2 | sim-square-narrow-r00-r03-eval | 8000 | 7375 | 92,19 % |
| seed-3 | sim-square-narrow-r00-r03-eval | 8000 | 7397 | 92,46 % |
| seed-4 | sim-square-narrow-r00-r03-eval | 8000 | 7395 | 92,44 % |
| seed-5 | sim-square-narrow-r00-r03-eval | 8000 | 7251 | 90,64 % |
| Agregado | sim-square-narrow-r00-r03-eval | 40000 | 36714 | 91,79 % |

No se han publicado en la informacion disponible resultados de benchmarks comparativos frente a otros agentes para esta misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, el repositorio completo ocupa 1,4 GB para cinco semillas, es decir, aproximadamente 0,28 GB por semilla incluyendo el actor, el critico y los normalizadores; el peso efectivo de inferencia es por tanto de cientos de MB como maximo, no de GB.
- GPU recomendadas: no disponibles en la model card. Por el tipo de politica (basada en estado, con redes de tipo MLP), la inferencia es viable en CPU o en cualquier GPU de consumo con varios GB de VRAM.
- Cabe en GPU de consumo: si, en principio cualquier GPU de consumo moderna es suficiente dado el tamano del checkpoint; no se especifican modelos concretos ni cifras de VRAM.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una politica de RL). El despliegue previsto es mediante el codigo de investigacion de Mulligan en el commit `ec52959c99f0`, cargando `policy.pt` y `stats.json` con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos numericos de modelos comparables en la informacion proporcionada. Como contexto cualitativo:

| Aspecto | Este modelo | Alternativas |
|---|---|---|
| Familia de algoritmo | IDQL (actor de difusion + critico IQL escalar) | No disponible (otras ramas de la campana Mulligan no se detallan con cifras) |
| Tarea | sim-square-narrow | No disponible |
| Parametros | No disponible | No disponible |
| Contexto | No aplicable | No aplicable |
| Rendimiento | 91,79 % de exito agregado sobre 40 000 episodios | No disponible |
| Licencia | MIT | No disponible |
| Disponibilidad | Publico en HuggingFace, cinco semillas | No disponible |

La comparacion natural seria contra las otras ramas (arms) de la misma campana dentro de la ronda R2, pero la informacion proporcionada no incluye sus resultados.

## Limitaciones y advertencias

- Especificidad de tarea: la politica esta entrenada exclusivamente para `sim-square-narrow`. No se puede reutilizar fuera de esa tarea sin reentrenamiento.
- Observaciones basadas en estado: no procesa imagenes ni texto, lo que limita su aplicacion directa en entornos donde solo hay percepcion visual.
- Tasa de fallo no despreciable: incluso la mejor semilla falla en aproximadamente el 7,5 % de los episodios de evaluacion, y la peor supera el 9 % de fallos. En un despliegue fisico esto implica necesidad de supervision o de mecanismos de recuperacion.
- Brecha simulacion-realidad: los datos de evaluacion son de simulacion; el propio proyecto reporta mejoras en tareas reales solo al combinar su metodo de recogida de datos con seleccion de acciones por valor, no con este checkpoint aislado.
- Riesgo de acciones fuera de distribucion: aunque el critico IQL se entrena solo con acciones del dataset, el actor de difusion puede generar acciones poco probables en estados raros; no se publican analisis de seguridad especificos.
- Formato de pesos inseguro: los ficheros `.pt` son pickles de PyTorch. La propia model card advierte de cargarlos unicamente en un entorno de confianza, ya que la deserializacion de un pickle puede ejecutar codigo arbitrario.
- Sin cuantizaciones ni optimizaciones de inferencia publicadas: no hay versiones GGUF, ONNX ni similares.
- Procedencia dependiente de W&B: los artefactos de origen viven en Weights & Biases; la verificacion de integridad depende de los MD5 del manifiesto y del SHA-256 de `release.json`.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo de la politica ni de los datos de teleoperacion empleados.
- Licencia: MIT, permisiva para uso comercial, pero el modelo se distribuye como artefacto de investigacion sin garantias de idoneidad para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-baseline-idql
- Proyecto Mulligan: https://mulligan.page/
- Policy Arena (evaluaciones): https://arena.mulligan.page/
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperacion base: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de politica base (c01): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- Dataset DAgger sobre politica base (c01): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Dataset de rollouts de politica base (c02): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-baseline-policy-rollouts
- Dataset DAgger sobre politica base (c02): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-baseline
- Articulo de IDQL: https://arxiv.org/abs/2304.10573
- Busqueda de datasets de la familia: https://huggingface.co/datasets?other=sim-square-narrow
