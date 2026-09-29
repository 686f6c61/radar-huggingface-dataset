# mulligan/sim-square-broad-r01-mulligan-idql

## Resumen

El modelo `mulligan/sim-square-broad-r01-mulligan-idql` es un agente de control robótico basado en IDQL (Implicit Diffusion Q-Learning), publicado por la organizacion Mulligan dentro de su proyecto de investigacion en aprendizaje por refuerzo offline y auto-mejora de politicas. No es un modelo de lenguaje: se trata de una politica estado-a-accion entrenada para la tarea de manipulacion simulada `sim-square-broad`, que combina un actor de difusion (que modela la distribucion de acciones) con un critico escalar de IQL (Implicit Q-Learning) para el aprendizaje de valor. La relevancia actual del artefacto es metodologica: forma parte de una campaña de iteraciones (ronda R1, brazo "mulligan") en la que se comparan estrategias de recoleccion de datos y auto-mejora con DAgger sobre un mismo entorno, con checkpoints y evaluaciones trazables.

El repositorio ocupa 1,4 GB y contiene cinco carpetas (`seed-1` a `seed-5`), una por semilla de entrenamiento, cada una con un checkpoint `policy.pt` (pickle de PyTorch) y un fichero `stats.json` con los normalizadores de observaciones y acciones. Todos los checkpoints corresponden al paso de entrenamiento 250001. El autor no publica numero de parametros, arquitectura de red detallada ni tipo de simulador en la informacion disponible.

En la evaluacion publicada sobre una rejilla de estados iniciales reservada (*held-out initial-state grid*) de 30000 rollouts por semilla, el agente alcanza entre 71,90 % y 75,77 % de exitos, con una media de 72,84 % (109262 exitos sobre 150000 rollouts). La licencia es Apache 2.0 y el artefacto esta pensado para investigacion en simulacion, no para despliegue directo en robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion (diffusion policy) con critico escalar de IQL; agente IDQL sobre entorno de estados (no vision) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada basada en el estado del entorno) |
| Tipos de cuantizacion | no disponible; solo se publican checkpoints en precision nativa de PyTorch |
| Idiomas soportados | no aplica (politica de control, sin salida en lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | `.pt` (checkpoint pickle de PyTorch) + `stats.json` (normalizadores) |
| Tarea | sim-square-broad |
| Ronda de modelo | R1 |
| Brazo / celda de campaña | mulligan / `sq_d1_r1_ours_mining_freecf_human_only` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamaño del repositorio | 1,4 GB |
| Entrada | estado del entorno (state-based) |
| Salida | accion continua |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: un actor generativo de tipo difusion que modela la distribucion de acciones y un critico escalar entrenado con IQL. Los nombres de los artefactos de W&B asociados (`iql_ddpg_bc_idql_square_d1_...`) indican que el pipeline combina IQL, DDPG+BC e IDQL, es decir, aprendizaje de valor fuera de politica con regularizacion por clonacion de comportamiento y un actor de difusion como extractor de politica. Al ser un agente *state-based*, la entrada es el vector de estado del simulador, no imagenes.

Los datos de entrenamiento proceden de tres conjuntos publicados por el mismo autor: `sim-square-broad-c00-teleop-sobol` (teleoperacion), `sim-square-broad-c01-dagger-mulligan` (datos generados mediante DAgger) y `sim-square-broad-c01-sobol-policy-rollouts` (rollouts de politica). La celda de campaña `sq_d1_r1_ours_mining_freecf_human_only` sugiere una iteracion de auto-mejora con minado de datos (DAgger) y participacion de datos humanos. No se especifica el numero total de transiciones, la composicion exacta del dataset, el simulador empleado ni el uso de RLHF/DPO (concepto que no aplica a este dominio). Cada semilla corresponde a un artefacto de W&B distinto con su propio commit de Git, y los ficheros publicados son copias byte a byte de dichos artefactos verificadas por MD5 contra el manifiesto y por SHA-256 en `release.json`.

## Capacidades

- Control continuo estado-a-accion en la tarea simulada `sim-square-broad`, con una politica determinista obtenida a partir de un actor de difusion.
- Modelado multimodal de la distribucion de acciones (proposito del actor de difusion en IDQL), lo que permite representar comportamientos diversos presentes en los datos de demostracion.
- Aprendizaje offline: la politica se entrena a partir de datasets preexistentes sin necesidad de interaccion en linea durante el entrenamiento.
- Generacion de rollouts de politica, utilizables como datos para nuevas iteraciones de entrenamiento (el dataset `sim-square-broad-c01-sobol-policy-rollouts` esta vinculado a este flujo).
- Reproducibilidad multi-semilla: se publican cinco semillas independientes del mismo paso de entrenamiento, lo que permite estudiar varianza del algoritmo.
- Trazabilidad de procedencia: cada checkpoint esta ligado a un artefacto de W&B, una ejecucion concreta y un commit de Git.
- No soporta tool calling, function calling, agentes conversacionales, razonamiento multi-paso en lenguaje natural, ni capacidades multilingues, de vision, audio o modo "thinking": no es un modelo de lenguaje ni un modelo vision-lenguaje.

## Casos de uso

- Investigacion en aprendizaje por refuerzo offline: el checkpoint sirve como referencia reproducible de IDQL en una tarea de manipulacion con distribucion amplia de estados iniciales, con semillas multiples para medir varianza del metodo.
- Reentrenamiento con DAgger: la politica puede desplegarse en el simulador para generar nuevos rollouts, etiquetarlos con teleoperacion y alimentar la siguiente iteracion de la campaña de auto-mejora (es exactamente el flujo reflejado en los datasets `c01-dagger-mulligan` y `c01-sobol-policy-rollouts`).
- Comparacion de algoritmos en un banco de pruebas: el artefacto permite situar IQL/DDPG+BC/IDQL frente a otras variantes evaluadas sobre la misma rejilla de estados iniciales reservada, dentro del ecosistema Policy Arena de Mulligan.
- Analisis de sensibilidad a la semilla: con cinco semillas al mismo paso (250001) se puede cuantificar la dispersion de rendimiento (rango observado de 3,87 puntos porcentuales) y decidir cuantas semillas son necesarias en experimentos futuros.
- Generacion de datos sinteticos para otras politicas: los rollouts del agente pueden emplearse como datos de arranque para metodos de imitacion o de refuerzo offline de otras variantes, reduciendo el coste de teleoperacion.
- Validacion de infraestructura de entrenamiento y evaluacion: la pareja `policy.pt` + `stats.json` y su vinculacion con artefactos de W&B y commits permite verificar pipelines de registro de experimentos, normalizadores y control de versiones de checkpoints.
- Estudio de transferencia simulacion-a-realidad: la politica podria emplearse como punto de partida para ajuste fino en un robot real, aunque no se ha publicado ninguna evidencia de transferencia ni resultados fuera del simulador para este checkpoint.

## Benchmarks y rendimiento

Evaluacion publicada sobre la rejilla de estados iniciales reservada (*held-out initial-state grid*), 30000 rollouts por semilla, en el dataset `sim-square-broad-r00-r03-eval`:

| Semilla | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 30000 | 21595 | 71,98 % |
| seed-2 | 30000 | 22732 | 75,77 % |
| seed-3 | 30000 | 21570 | 71,90 % |
| seed-4 | 30000 | 21580 | 71,93 % |
| seed-5 | 30000 | 21785 | 72,62 % |
| Total / media | 150000 | 109262 | 72,84 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, por no ser aplicables a este tipo de modelo, ni comparaciones numericas con lineas base en la propia model card mas alla de la referencia al dataset de evaluacion conjunto de las rondas R00 a R03.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El autor no publica numero de parametros ni tamaño de las redes del actor y del critico.
- Estimacion indirecta: el repositorio completo (cinco semillas con actor, critico y normalizadores) ocupa 1,4 GB, lo que situa cada checkpoint por semilla en el orden de unos 280 MB; el requisito real de memoria depende de si se carga solo `policy.pt` o tambien el critico.
- GPU recomendadas: no disponible. Al tratarse de un agente de control basado en estado (sin vision), el cuello de botella suele ser la simulacion y el numero de rollouts, no la inferencia de la red.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por el tamaño declarado del repositorio, un checkpoint individual es manejable en GPUs de consumo habituales, pero no hay especificacion oficial.
- Opciones de despliegue: no se documentan. Se requiere el codigo de investigacion de Mulligan (los commits de Git listados en la model card) para cargar `policy.pt` junto con los normalizadores de `stats.json`; no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto. Los `.pt` son pickles de PyTorch y deben cargarse solo en entornos de confianza.
- Latencia y throughput: no disponibles. La evaluacion reportada cubre 150000 rollouts en total (30000 por semilla), pero no se publican tiempos de ejecucion ni frecuencia de control.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye especificaciones ni resultados numericos de otros agentes comparables (por ejemplo, otras variantes de la misma campaña o lineas base del banco de pruebas). El propio ecosistema Mulligan ofrece puntos de comparacion potenciales: el dataset `sim-square-broad-r00-r03-eval` agrupa evaluaciones de las rondas R00 a R03, y el portal Policy Arena publica evaluaciones de politicas; sin embargo, sus cifras no forman parte de los datos disponibles para esta ficha.

## Limitaciones y advertencias

- Ambito restringido: es una politica especifica para la tarea `sim-square-broad`; no es reutilizable como modelo general ni transferible sin ajuste a otras tareas.
- Entrada basada en estado: requiere acceso al vector de estado del entorno (informacion privilegiada en simulacion). No acepta observaciones visuales, lo que limita su uso directo en robots reales con camaras.
- Rendimiento no saturado: la tasa de exito media es del 72,84 %, con un 27,16 % de fallos sobre 150000 rollouts; no es apto para escenarios que exijan alta fiabilidad sin un ajuste adicional.
- Varianza entre semillas: el rango observado va de 71,90 % a 75,77 % (desviacion tipica aproximada de 1,7 puntos porcentuales), por lo que conclusiones basadas en una sola semilla son fragiles.
- Dependencia de los normalizadores: `stats.json` debe corresponder a la misma distribucion de estados y acciones del entorno de evaluacion; un desajuste invalida el comportamiento de la politica.
- Riesgo de seguridad al cargar: los ficheros `.pt` son pickles de PyTorch y el propio autor advierte de cargarlos unicamente en entornos de confianza.
- Sin datos de entrenamiento completos: no se publican el numero de transiciones, la composicion del dataset, el simulador ni la arquitectura de red, lo que dificulta la auditoria y la reproduccion exacta.
- Licencia: Apache 2.0, permisiva para uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; no se declaran restricciones adicionales.
- Adopcion nula en el momento de la ficha: 0 descargas y 0 likes, sin evidencia externa de uso en produccion.
- Idiomas, tool calling, agentes conversacionales y capacidades multimodales: no aplicables, al no tratarse de un modelo de lenguaje.
- Sin validacion fuera de simulacion: no consta ninguna evaluacion en hardware real ni evidencia de transferencia sim-to-real para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-mulligan-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de entrenamiento (teleoperacion): https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset de entrenamiento (DAgger): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mulligan
- Dataset de entrenamiento (rollouts de politica): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
