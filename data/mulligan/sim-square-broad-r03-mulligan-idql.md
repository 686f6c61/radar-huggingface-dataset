# mulligan/sim-square-broad-r03-mulligan-idql

## Resumen

`mulligan/sim-square-broad-r03-mulligan-idql` es un checkpoint de politica para manipulacion robotica entrenado con IDQL (Implicit Diffusion Q-Learning), un metodo de aprendizaje por refuerzo offline en el que el actor es un modelo de difusion que genera acciones y el critico es un critico escalar derivado de IQL (Implicit Q-Learning). El artefacto no es un modelo de lenguaje ni de vision: consume observaciones de estado (state-based) y produce acciones continuas para la tarea simulada `sim-square-broad`. Lo publica la organizacion `mulligan` como parte del proyecto Mulligan, que agrupa campanas de evaluacion de agentes roboticos entrenados a partir de datos de teleoperacion, DAgger y rollouts de politicas previas.

El repositorio corresponde a la ronda R3, brazo `mulligan`, celda de campana `sq_d1_r3_ours_mining_freecf_human_only`, con cinco semillas independientes (seed-1 a seed-5) entrenadas hasta el paso 250001. Cada semilla incluye un `policy.pt` (checkpoint de PyTorch) y un `stats.json` con los normalizadores de estado y accion. El tamano total del repositorio es de 1,4 GB, lo que situa cada semilla en el orden de unos 280 MB.

Su relevancia es doble: por un lado sirve como referencia reproducible de IDQL sobre datos heterogeneos (teleoperacion humana, DAgger y rollouts de politicas), y por otro ofrece una evaluacion cuantitativa poco habitual, con 30.000 rollouts por semilla sobre una rejilla de estados iniciales reservada (held-out), con tasas de exito entre el 84,56 % y el 89,09 % segun semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion (politica generativa de acciones) con critico escalar IQL; entrada basada en estado, sin vision |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica robotica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publica `policy.pt` en formato PyTorch; no hay variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no aplica (no procesa texto ni lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, serializado como pickle) y `stats.json` con normalizadores |
| Tarea | `sim-square-broad` |
| Ronda / brazo | R3 / `mulligan` |
| Celda de campana | `sq_d1_r3_ours_mining_freecf_human_only` |
| Semillas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Fecha de creacion / actualizacion | 2026-09-29 / 2026-10-02 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes. El actor es un modelo generativo de difusion que produce acciones continuas mediante un proceso de denoising iterativo, lo que permite representar distribuciones de accion multimodales (utiles cuando varios comportamientos son validos en un mismo estado). El critico es un critico escalar basado en IQL, que estima el valor con regresion de expectil y evita consultar acciones fuera de la distribucion del dataset, un requisito clasico del aprendizaje por refuerzo offline. La politica es exclusivamente state-based: no hay codificador de imagen ni de lenguaje en la informacion disponible, y los normalizadores de estado y accion se distribuyen aparte en `stats.json`.

El entrenamiento se realizo sobre datos agregados de siete datasets del proyecto: teleoperacion humana (`sim-square-broad-c00-teleop-sobol`), tres rondas de DAgger (`c01`, `c02`, `c03`, todas con el brazo `mulligan`) y tres conjuntos de rollouts de politicas (`c01-sobol-policy-rollouts`, `c02-mulligan-policy-rollouts`, `c03-mulligan-policy-rollouts`), ademas de `c01-sobol-policy-rollouts`. El numero total de transiciones, la composicion exacta del dataset, el numero de tokens (no aplica) y si se aplicaron etapas de RLHF o DPO no se detallan en la model card: los agentes de RL offline no usan ese tipo de ajuste. Los run-configs de cada semilla estan referenciados en el repositorio de codigo de Mulligan (`release/run-configs/sim-square-broad-r03-mulligan-idql__seed-N.json`), y la model card indica que las recetas alli publicadas permiten reentrenar cada checkpoint. La procedencia se documenta con el SHA-256 de cada fichero en `release.json`.

## Capacidades

- Generacion de acciones continuas de baja dimension a partir de observaciones de estado, mediante muestreo por difusion.
- Modelado multimodal de la distribucion de acciones, gracias al actor de difusion.
- Ejecucion de una politica entrenada de forma puramente offline, sin interaccion en linea durante el aprendizaje.
- Cinco politicas independientes (una por semilla) para analisis de varianza entre semillas.
- Evaluacion reproducible sobre una rejilla de estados iniciales reservada, con resultados por rollout publicados en un dataset aparte.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingues, de vision, de audio ni de generacion de texto.
- No implementa modo de razonamiento explicito (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Evaluacion comparativa de algoritmos de RL offline: el checkpoint sirve como referencia IDQL medida sobre 30.000 rollouts en una rejilla held-out, util para contrastar contra otras variantes de la misma campana.
- Generacion de datos sinteticos para reentrenamiento: los rollouts de la politica se pueden almacenar y reutilizar como parte del dataset de una ronda posterior, tal y como ya ocurre con los datasets `c02-mulligan-policy-rollouts` y `c03-mulligan-policy-rollouts`.
- Estudio de la variabilidad entre semillas: disponer de cinco checkpoints del mismo paso de entrenamiento (250001) permite analizar la dispersion de rendimiento (84,56 %–89,09 %) antes de fijar una unica politica de produccion.
- Destilacion a controladores mas ligeros: al ser una politica state-based, se puede destilar a una red feed-forward de una sola pasada para reducir el coste del muestreo por difusion en bucles de control.
- Aprendizaje por imitacion e investigacion en DAgger: los checkpoints y sus configuraciones permiten reproducir experimentos sobre mezclas de teleoperacion humana y correcciones automaticas.
- Transferencia sim-a-real en laboratorio: la politica se puede desplegar primero en el simulador de la tarea y usar sus fallos para decidir que zonas del espacio de estados necesitan mas datos reales.
- Docencia y formacion en robotica: el par `policy.pt` + `stats.json` ilustra de forma completa el ciclo de normalizacion, carga y ejecucion de una politica de RL offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible, ya que no es un modelo de lenguaje. La model card si publica resultados de evaluacion de la tarea sobre una rejilla de estados iniciales reservada, con 30.000 rollouts por semilla:

| Semilla | Rollouts evaluados | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 30000 | 25547 | 85,16 % |
| seed-2 | 30000 | 25555 | 85,18 % |
| seed-3 | 30000 | 26727 | 89,09 % |
| seed-4 | 30000 | 25849 | 86,16 % |
| seed-5 | 30000 | 25368 | 84,56 % |
| Media (calculo propio) | 150000 | 129046 | 86,03 % |

Los resultados por rollout se encuentran en el dataset de evaluacion `mulligan/sim-square-broad-r00-r03-eval`. No se proporcionan resultados de otros brazos o algoritmos de la misma ronda que permitan una comparacion directa.

## Requisitos de hardware

- El repositorio completo ocupa 1,4 GB; cada semilla ronda los 280 MB entre `policy.pt` y `stats.json`, por lo que el checkpoint individual de inferencia es pequeno en terminos de memoria.
- La VRAM necesaria para inferencia es muy inferior a 1 GB si se carga una unica semilla en fp32; no se especifica el numero de parametros, por lo que la cifra exacta es no disponible.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) y previsiblemente en CPU, dado el tamano del checkpoint.
- No se requiere A100 ni H100 para inferencia; para reentrenar las cinco semillas no se especifica hardware en la informacion disponible.
- Despliegue mediante PyTorch: carga de `policy.pt` con `torch.load` y aplicacion de los normalizadores de `stats.json`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Advertencia de seguridad: la model card indica que los ficheros `.pt` son pickles de PyTorch y deben cargarse solo en entornos de confianza.
- Latencia y throughput: no disponibles. En el caso de politicas de difusion, el coste por accion depende del numero de pasos de denoising, dato que no se especifica en la informacion proporcionada.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mulligan/sim-square-broad-r03-mulligan-idql` (este modelo) | no disponible | no aplica | 86,03 % de exito medio en 30.000 rollouts por semilla | MIT | HuggingFace, 1,4 GB, 5 semillas |
| Otros brazos de la ronda R3 del mismo proyecto (p. ej. `sobol`) | no disponible | no aplica | no disponible | no disponible | referenciados en los datasets, sin checkpoints equivalentes en la informacion consultada |
| Otros agentes de la campana `sim-square-broad` (DAOgger, teleoperacion) | no disponible | no aplica | no disponible | no disponible | datasets publicos en la organizacion `mulligan` |
| IDQL de referencia (metodo base) | no disponible | no aplica | no disponible | no disponible | publicacion cientifica, sin checkpoint publicado de esta tarea |

No se dispone de cifras de rendimiento de las alternativas dentro de la informacion proporcionada, por lo que la comparacion numerica se limita al propio modelo.

## Limitaciones y advertencias

- Modelo especifico de una unica tarea (`sim-square-broad`); no es un modelo de proposito general ni transferible sin reentrenamiento.
- Entrada exclusivamente de estado: no procesa imagenes, texto ni audio, lo que limita su aplicacion a entornos donde la observacion de estado sea fiable y completa.
- Riesgo de alucinacion en el sentido linguistico: no aplica. El riesgo equivalente es generar acciones no validas o fuera de distribucion en estados poco representados en el dataset de entrenamiento.
- Sesgos de datos: el comportamiento aprendido hereda las estrategias y los sesgos de los operadores humanos de teleoperacion y de las politicas usadas para generar los rollouts.
- Dispersion entre semillas de casi 4,5 puntos porcentuales (84,56 %–89,09 %): elegir una sola semilla sin justificar el criterio puede sobreestimar o subestimar el rendimiento real.
- Limitaciones de contexto: no aplica en el sentido de ventana de tokens, pero la politica no mantiene memoria explicita a largo plazo mas alla del estado observado.
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje.
- Licencia MIT: permite uso comercial y modificacion, pero la model card no ofrece garantias sobre el rendimiento en entornos reales ni sobre la idoneidad para aplicaciones criticas.
- Los ficheros `.pt` son pickles de PyTorch: cargarlos solo desde fuentes de confianza por riesgo de ejecucion de codigo arbitrario.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, con una unica fuente de evaluacion (el propio autor), lo que reduce la validacion independiente.
- No se documentan parametros, numero de pasos de difusion, composicion exacta del dataset ni numero total de transiciones, lo que dificulta reproducir el presupuesto de computo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r03-mulligan-idql
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mulligan
- Dataset de rollouts c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mulligan
- Dataset de rollouts c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-mulligan-policy-rollouts
- Dataset DAgger c03: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-dagger-mulligan
- Dataset de rollouts c03: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-mulligan-policy-rollouts
- Explorador de datasets de la familia `sim-square-broad`: https://huggingface.co/datasets?other=sim-square-broad
- Ficha externa del dataset de rollouts c03: https://claru.ai/datasets/mulligan-sim-square-broad-c03-mulligan-policy-rollouts
- Ficha externa del dataset DAgger c03: https://claru.ai/datasets/mulligan-sim-square-broad-c03-dagger-mulligan
- Indice de modelos consultado: https://modelindex.ai/
- Referencia del metodo base IDQL (no enlazada en la model card, aportada como contexto): https://arxiv.org/abs/2304.10573
- Referencia del metodo base IQL (no enlazada en la model card, aportada como contexto): https://arxiv.org/abs/2110.06169
