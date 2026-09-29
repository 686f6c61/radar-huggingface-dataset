# mulligan/sim-square-narrow-r01-auto-plain-il-n1-idql

## Resumen

`sim-square-narrow-r01-auto-plain-il-n1-idql` es un agente de control robótico basado en IDQL (Implicit Diffusion Q-Learning) publicado por el proyecto Mulligan, distribuido a través del repositorio de HuggingFace del usuario `mulligan`. Se trata de una política state-based compuesta por un actor de difusión y un crítico IQL escalar, junto con ficheros de normalización (`stats.json`), empaquetada como checkpoint de PyTorch (`policy.pt`). No es un modelo de lenguaje: no procesa texto ni imágenes, sino observaciones de estado del entorno de simulación.

La tarea objetivo es `sim-square-narrow`, dentro de la campaña de experimentos de Mulligan, y esta ficha corresponde a la ronda R1, brazo `auto-plain-il-n1`, con la etiqueta de celda `iterative-IL comparator`. El modelo se entrenó durante 150.001 pasos y se publican cinco checkpoints independientes, uno por semilla (1 a 5), lo que permite analizar la varianza entre ejecuciones del mismo algoritmo y configuración.

Su relevancia actual es metodológica más que de producto: sirve como comparador reproducible frente a otras variantes de la misma campaña (por ejemplo, políticas de comportamiento compartidas o variantes IQL con más muestras), y alimenta el ecosistema de datasets de rollouts y evaluaciones del proyecto, incluyendo `sim-square-narrow-c02-auto-plain-il-n1-policy-rollouts` y `sim-square-narrow-r00-r03-eval`. El repositorio ocupa 1,4 GB en total y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion (diffusion policy) con critico IQL escalar; politica de control state-based |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control basada en estado; no procesa texto ni secuencias linguisticas) |
| Tipos de cuantizacion | no disponible (se distribuye un unico checkpoint PyTorch; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`policy.pt`) + normalizadores en `stats.json` |
| Tarea | sim-square-narrow |
| Ronda de modelo | R1 |
| Brazo / celda de campana | auto-plain-il-n1 / iterative-IL comparator |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Datasets de entrenamiento | `mulligan/sim-square-narrow-c00-teleop-baseline`, `mulligan/sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts` |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicacion | 2026-09-29 |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: un actor generativo de tipo difusión que modela la distribucion de acciones, combinado con un critico escalar entrenado con Implicit Q-Learning (IQL). En el ecosistema de aprendizaje por imitacion y offline RL, este diseno permite extraer politicas de un conjunto de datos mixto sin necesidad de consultar el entorno durante el ajuste del critico, y la componente de difusion aporta expresividad a la hora de representar distribuciones de acciones multimodales. Los artefactos de Weights & Biases referenciados en la model card llevan el nombre `iql_ddpg_bc_idql_nutassemblysquare`, lo que sugiere que la tarea deriva del entorno NutAssemblySquare de robosuite, aunque la model card no lo confirma de forma explicita.

El entrenamiento combina dos fuentes de datos: `sim-square-narrow-c00-teleop-baseline`, que corresponde a demostraciones de teleoperacion, y `sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts`, que contiene rollouts generados por una politica de comportamiento compartida. Esta mezcla es caracteristica de los pipelines iterativos de aprendizaje por imitacion tipo DAgger, donde el conjunto de datos se enriquece con trayectorias generadas por la propia politica. La campana se etiqueta como `iterative-IL comparator`, lo que indica que este modelo actua como referencia frente a otras variantes de la misma ronda. No se detalla en la informacion disponible el numero total de transiciones, la composicion exacta del dataset ni si se aplicaron fases adicionales de RLHF, DPO u optimizacion preferencial, algo que en cualquier caso no aplica a un agente de control.

Los cinco checkpoints son copias byte a byte de los artefactos de Weights & Biases correspondientes (verificacion MD5 contra el manifiesto del artefacto y SHA-256 registrado en `release.json`), entrenados y evaluados con el codigo de investigacion de Mulligan en los commits `6f21c002a881`, `f7149fd16945` y `bdc2472f1138`.

## Capacidades

- Control robótico de manipulacion en simulacion para la tarea `sim-square-narrow`, consumiendo observaciones de estado y emitiendo acciones continuas.
- Aprendizaje por imitacion iterativo: la politica se entrena sobre demostraciones de teleoperacion mas rollouts generados por politicas previas.
- Modelado multimodal de acciones mediante el actor de difusion, lo que permite representar distribuciones de acciones con multiples modos validos.
- Evaluacion reproducible: se publican cinco semillas independientes que permiten estimar la varianza del algoritmo.
- Generacion de datos de rollout: el modelo esta referenciado por el dataset `sim-square-narrow-c02-auto-plain-il-n1-policy-rollouts`, lo que implica que sus ejecuciones se utilizan como material de entrenamiento para rondas posteriores.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues: es exclusivamente una politica de control de bajo nivel.

## Casos de uso

- Comparador de referencia en investigacion de aprendizaje por imitacion: el brazo `auto-plain-il-n1` esta etiquetado explicitamente como `iterative-IL comparator`, de modo que se puede usar como linea base contra la que medir variantes con mas datos, mas rondas o politicas de comportamiento distintas.
- Analisis de varianza entre semillas: al publicar cinco checkpoints del mismo paso de entrenamiento (150.001), permite estudiar la estabilidad del algoritmo IDQL en la tarea `sim-square-narrow` y distinguir mejoras reales de ruido estadistico.
- Generacion de datasets de rollout: integrar el modelo en un bucle de simulacion para producir trayectorias etiquetadas, del mismo modo que el dataset `sim-square-narrow-c02-auto-plain-il-n1-policy-rollouts` se construye a partir de esta politica.
- Desarrollo de algoritmos offline RL: el par actor de difusion mas critico IQL sirve como banco de pruebas para estudiar estabilidad del critico, sobresstimation y calibracion de acciones en entornos de manipulacion.
- Investigacion en sim-to-real: los resultados de exito en simulacion permiten seleccionar politicas candidatas antes de intentar transferencia a un robot fisico, reduciendo el coste de pruebas en hardware.
- Evaluacion estandarizada de tareas de ensamblaje: si la tarea deriva de NutAssemblySquare de robosuite, el modelo encaja en protocolos habituales de comparacion de manipulacion con espacio de acciones continuo.
- Docencia y reproduccion de resultados: el repositorio de 1,4 GB con checkpoints y normalizadores facilita reproducir experimentos en un solo equipo sin infraestructura de gran escala.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son las evaluaciones de la campana sobre una rejilla de estados iniciales reservada, con 8000 rollouts por semilla. Se presentan a continuacion:

| Semilla | Rollouts (N) | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 8000 | 5322 | 66,5 % |
| seed-2 | 8000 | 5403 | 67,5 % |
| seed-3 | 8000 | 5703 | 71,3 % |
| seed-4 | 8000 | 5397 | 67,5 % |
| seed-5 | 8000 | 5431 | 67,9 % |
| Total | 40000 | 27256 | 68,1 % |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, algo esperable dado que se trata de una politica de control robótico y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo ocupa 1,4 GB para cinco semillas, es decir, aproximadamente 280 MB por semilla incluyendo el checkpoint `policy.pt` y sus normalizadores; la huella en memoria de una politica de este tipo suele ser muy inferior a la de un modelo de lenguaje de gran tamano, aunque no se confirma en la model card.
- GPU recomendadas: no disponible. Por el tamano del artefacto, cualquier GPU con al menos unos pocos gigabytes de VRAM deberia ser suficiente en la practica, pero esta afirmacion no esta respaldada por datos publicados por el autor.
- Cabe en GPU de consumo: probablemente si en cualquier GPU de consumo moderna, dado el tamano del checkpoint; no confirmado por el autor.
- Opciones de despliegue: carga directa del checkpoint PyTorch en el codigo de investigacion de Mulligan (commits `6f21c002a881`, `f7149fd16945`, `bdc2472f1138`). Herramientas de servido de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no aplican a este artefacto.
- Latencia y throughput estimados: no disponible.
- Advertencia de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch y, segun la propia model card, deben cargarse unicamente en un entorno de confianza.

## Comparativa con modelos similares

| Modelo / variante | Proyecto | Algoritmo | Semillas | Tasa de exito | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sim-square-narrow-r01-auto-plain-il-n1-idql` | Mulligan | IDQL (actor de difusion + critico IQL escalar) | 5 | 68,1 % (27256/40000) | MIT | HuggingFace |
| `sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts` | Mulligan | Politica de comportamiento compartida (BC) usada como fuente de datos | no disponible | no disponible | no disponible | HuggingFace (dataset) |
| Variante `auto-iql-n32` de `sim-square-narrow` | Mulligan | IQL con 32 muestras | no disponible | no disponible | no disponible | HuggingFace (dataset de rollouts) |

No se dispone de datos de rendimiento publicados para las variantes comparables dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no puede completarse. Fuera del proyecto Mulligan no se identifican en la busqueda modelos directamente equivalentes con metricas comparables para la tarea `sim-square-narrow`.

## Limitaciones y advertencias

- Es una politica especifica de una unica tarea (`sim-square-narrow`) y de un unico pipeline de simulacion: no es un modelo general y no se puede reutilizar en otros entornos sin reentrenamiento.
- Requiere observaciones de estado, no imagenes ni texto. Si el entorno de destino solo ofrece observaciones visuales, el modelo no es aplicable directamente.
- El rendimiento depende del entorno de simulacion de origen. No se documentan pruebas de transferencia a hardware real, por lo que cualquier uso en robot fisico exige validacion adicional y asuncion de riesgo.
- Riesgo de sobreajuste a la rejilla de estados iniciales de entrenamiento: la evaluacion se realiza sobre una rejilla reservada, pero no se detalla su diversidad ni su cobertura respecto a la distribucion real de estados.
- Ausencia de resultados en benchmarks estandarizados de aprendizaje por imitacion fuera de la propia campana de Mulligan, lo que dificulta la comparacion con literatura externa.
- Los ficheros `.pt` son pickles de PyTorch; cargarlos implica ejecucion de codigo arbitrario si el fichero ha sido manipulado. La model card recomienda cargarlos solo en entornos de confianza.
- La licencia MIT permite uso comercial, pero no se ofrece ninguna garantia de idoneidad ni de soporte por parte del autor.
- No se documentan sesgos, comportamiento fuera de distribucion ni modos de fallo especificos de la tarea.
- El autor no documenta parametros totales, requisitos de hardware ni tiempos de entrenamiento, lo que limita la planificacion de recursos para reproducir el experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-auto-plain-il-n1-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de entrenamiento (demostraciones de teleoperacion): https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de entrenamiento (rollouts de politica de comportamiento): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts
- Dataset de rollouts derivado de esta politica: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-plain-il-n1-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de rollouts de la variante `auto-iql-n32` (referencia externa recopilada en la busqueda): https://claru.ai/datasets/mulligan-sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Listado de datasets con la etiqueta `sim-square-narrow`: https://huggingface.co/datasets?other=sim-square-narrow
- Dataset `sim-square-narrow-c03-mulligan-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
