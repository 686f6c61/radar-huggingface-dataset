# mulligan/sim-square-broad-r00-sobol-first100-divl

## Resumen

sim-square-broad-r00-sobol-first100-divl es un checkpoint de agente de aprendizaje por refuerzo para robotica desarrollado por el autor mulligan dentro del proyecto Mulligan. No es un modelo de lenguaje: se trata de un agente basado en estado (observaciones sin vision) compuesto por un actor de difusion congelado, heredado del checkpoint padre sim-square-broad-r00-sobol-first100-idql, y un critico DIVL de tipo distribucional que es la unica parte entrenada en esta publicacion. El artefacto resuelve la tarea simulada denominada sim-square-broad y se distribuye como cinco carpetas independientes (seed-1 a seed-5), cada una con los ficheros `policy.pt` y `stats.json`.

La relevancia de esta publicacion es de caracter metodologico y de reproducibilidad: forma parte de la campana `sq_d1_r0_first100_ours_sobol`, en la ronda R0, brazo `sobol-first100`, y expone tanto los artefactos de Weights & Biases de origen como los resultados de evaluacion sobre una rejilla de estados iniciales reservada. Los cinco checkpoints se entrenaron hasta el paso 250001 y se evaluaron con 30000 rollouts por semilla sobre 32 estados iniciales, con tasas de exito que van del 21,73 % al 25,00 %.

El repositorio ocupa 1,4 GB en total y contiene exclusivamente pesos en formato PyTorch pickle, sin pesos en safetensors ni versiones cuantizadas. La licencia es Apache 2.0 y el material esta pensado para investigacion en RL offline y aprendizaje por imitacion sobre entornos de manipulacion simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion congelado (heredado del checkpoint padre) mas critico DIVL distribucional; no es un transformer ni un modelo de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente basado en estado, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (solo se publican ficheros `.pt` en precision original) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch pickle (`policy.pt`) acompanado de `stats.json`; no se publican safetensors ni GGUF |
| Tipo de modelo | Agente de RL para robotica (pipeline: robotics) |
| Tarea | sim-square-broad |
| Ronda y brazo | R0, sobol-first100 (celda de campana `sq_d1_r0_first100_ours_sobol`) |
| Semillas publicadas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB (repartido entre las cinco carpetas de semilla) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

El agente combina dos componentes. El primero es un actor de difusion que no se reentrena en esta publicacion: se importa congelado desde el checkpoint sim-square-broad-r00-sobol-first100-idql. El segundo es un critico DIVL de tipo distribucional, que es el componente efectivamente aprendido en esta ronda y el que da nombre al artefacto. La model card no detalla el numero de parametros, la dimension de las capas ni el numero de pasos de difusion del actor, por lo que esos datos no estan disponibles.

El entrenamiento se ejecuto con el codigo de investigacion de Mulligan en los commits `3053203fc3df` y `551416bff972`, durante 250001 pasos, y los pesos proceden de artefactos de Weights & Biases identificados con el prefijo `iql_ddpg_bc_idql_divl_square_d1`. Esa nomenclatura indica que la pipeline de entrenamiento integra componentes de IQL, DDPG+BC, IDQL y DIVL, si bien la model card no especifica la composicion exacta del objetivo de perdida ni los hiperparametros. Los datos de entrenamiento provienen del dataset sim-square-broad-c00-teleop-sobol-first100, que contiene teleoperacion con muestreo Sobol de estados iniciales; no se indica el numero de transiciones ni la composicion detallada del dataset.

La innovacion tecnica declarada es la combinacion del actor de difusion congelado con un critico distribucional: al mantener fijo el actor, la ronda aísla el efecto del critico DIVL sobre el rendimiento final. Los ficheros publicados son copias byte a byte de los artefactos de W&B (verificadas con MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`), lo que refuerza la trazabilidad del experimento.

## Capacidades

- Control robotico basado en estado: genera acciones para la tarea simulada sim-square-broad a partir de observaciones de estado, sin entrada visual ni de lenguaje.
- Generalizacion sobre una distribucion amplia de estados iniciales: el brazo `sobol-first100` emplea una rejilla de estados iniciales muestreada con secuencias Sobol, y la evaluacion se realiza sobre una rejilla de estados iniciales reservada (held-out).
- Aprendizaje por refuerzo offline: el agente se entrena a partir de datos de teleoperacion preexistentes mas procesos de self-improvement y DAgger mining, sin requerir interaccion online durante el entrenamiento.
- Estimacion de valor distribucional: el critico DIVL modela la distribucion del retorno en lugar de unicamente su esperanza, lo que permite analizar la incertidumbre del valor aprendido.
- Reutilizacion del actor: al ser el actor congelado, el checkpoint puede emplearse para estudiar el efecto de distintos criticos sobre una misma politica base.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de LLM; el agente ejecuta politicas de control multi-paso en el simulador.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; la model card describe el agente como `state-based`, es decir, sin vision.

## Casos de uso

- Baseline de referencia en investigacion en RL offline: el checkpoint sirve como punto de comparacion reproducible para nuevos algoritmos evaluados sobre la misma rejilla de estados iniciales de sim-square-broad, gracias a que se publican los commits y los artefactos de W&B de origen.
- Estudio de la varianza entre semillas: al incluirse cinco semillas entrenadas hasta el mismo paso (250001), permite cuantificar la dispersion del rendimiento de un mismo metodo bajo distintas inicializaciones, con tasas de exito que oscilan entre el 21,73 % y el 25,00 %.
- Warm-start de rondas posteriores de self-improvement: el critico DIVL entrenado puede reutilizarse como punto de partida para futuras rondas (R1, R2, ...) de la misma campana, reduciendo el coste de entrenamiento desde cero.
- Analisis del efecto del critico sobre un actor fijo: dado que el actor se hereda congelado del checkpoint IDQL padre, este artefacto permite aislar experimentalmente la contribucion del critico distribucional al rendimiento final.
- Generacion de datos de evaluacion y comparacion: el agente puede desplegarse en el simulador para producir rollouts sobre una rejilla de estados iniciales, que despues se agregan en el dataset de evaluacion sim-square-broad-r00-r03-eval.
- Investigacion en aprendizaje por imitacion y DAgger: la pipeline de origen (`dagger-mining`) permite usar este checkpoint para estudiar como el reetiquetado de datos y la mineria de fallos mejoran una politica de difusion.
- Reproduccion de resultados publicados: los ficheros son copias verificadas de los artefactos de W&B, por lo que sirven para replicar exactamente las cifras de exito reportadas en la model card.
- Pruebas de robustez frente a la distribucion inicial: la evaluacion sobre 32 estados iniciales reservados y 30000 rollouts por semilla permite medir la sensibilidad del agente a variaciones en la condicion inicial.

## Benchmarks y rendimiento

Los unicos resultados publicados son las evaluaciones sobre la rejilla de estados iniciales reservada del dataset sim-square-broad-r00-r03-eval. Cada semilla se evaluo con 32 estados iniciales y 30000 rollouts.

| Dataset de evaluacion | Carpeta | Estados iniciales | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|---|
| sim-square-broad-r00-r03-eval | seed-1 | 32 | 30000 | 7229 | 24,10 % |
| sim-square-broad-r00-r03-eval | seed-2 | 32 | 30000 | 7499 | 25,00 % |
| sim-square-broad-r00-r03-eval | seed-3 | 32 | 30000 | 7049 | 23,50 % |
| sim-square-broad-r00-r03-eval | seed-4 | 32 | 30000 | 7245 | 24,15 % |
| sim-square-broad-r00-r03-eval | seed-5 | 32 | 30000 | 6520 | 21,73 % |
| Total agregado | cinco semillas | 32 | 150000 | 35542 | 23,69 % |

El valor agregado y los porcentajes son calculos derivados de las cifras de exitos sobre rollouts publicadas en la model card; el autor no los reporta de forma explicita. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, y esos benchmarks no son aplicables a un agente de control robotico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no especifica el tamano del actor, del critico ni la memoria necesaria para ejecutar el agente.
- GPU recomendadas: no disponible. No se indica ninguna GPU concreta para entrenamiento ni para inferencia.
- Compatibilidad con GPU de consumo: no disponible. El repositorio completo ocupa 1,4 GB repartidos entre cinco semillas (del orden de 280 MB por semilla si la distribucion es uniforme, valor estimado y no confirmado por el autor), lo que sugiere que un unico checkpoint es manejable en memoria, pero no se aportan datos de consumo en ejecucion.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un agente de RL. La carga se realiza con PyTorch a partir de `policy.pt` y `stats.json`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de cifras de rendimiento de otros agentes de la misma campana en la informacion proporcionada, por lo que la comparacion se limita a la relacion entre artefactos documentada en la model card.

| Modelo / artefacto | Tarea | Semillas | Paso de entrenamiento | Actor | Critico | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|---|
| sim-square-broad-r00-sobol-first100-divl (este) | sim-square-broad | 5 | 250001 | Difusion congelado (heredado) | DIVL distribucional | apache-2.0 | 21,73 %-25,00 % de exito por semilla |
| sim-square-broad-r00-sobol-first100-idql | sim-square-broad | no disponible | no disponible | Difusion (origen del actor congelado) | no disponible | no disponible en esta busqueda | no disponible |
| Otros brazos de la campana `sq_d1_r0_first100_ours_sobol` | sim-square-broad | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento limitado: la tasa de exito agregada es del 23,69 %, es decir, aproximadamente tres de cada cuatro rollouts no alcanzan el exito en la tarea simulada durante la evaluacion reportada.
- Dominio restringido: el agente esta entrenado exclusivamente para la tarea sim-square-broad y no se documenta transferencia a otras tareas, entornos o robots reales.
- Observaciones basadas en estado: el modelo no procesa imagenes ni lenguaje, lo que limita su aplicacion a entornos donde el estado completo este disponible.
- Alto riesgo de sobreajuste a la distribucion inicial: el entrenamiento y la evaluacion emplean rejillas de estados iniciales generadas con muestreo Sobol; no se documenta comportamiento fuera de esa distribucion.
- Varianza entre semillas no despreciable: el rango de exito entre semillas (21,73 % a 25,00 %) implica que los resultados de una unica semilla no son representativos del metodo.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero la model card no ofrece ninguna garantia sobre el comportamiento del agente ni sobre su idoneidad para sistemas fisicos.
- Riesgo de seguridad en la carga de pesos: los ficheros `.pt` son pickles de PyTorch y la propia model card advierte de que solo deben cargarse en entornos de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- Ausencia de datos de entrenamiento: no se publican el numero de transiciones, la composicion del dataset ni los hiperparametros, lo que dificulta la reproduccion independiente del entrenamiento.
- Sesgos conocidos: no disponibles. La model card no incluye analisis de sesgos, y ese concepto no se traslada directamente a un agente de control en simulacion.
- Riesgo de alucinacion: no aplica; el agente no genera texto. El fallo equivalente es la ejecucion de acciones que no completan la tarea, reflejado en las tasas de exito anteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r00-sobol-first100-divl
- Pagina del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion mulligan en HuggingFace: https://huggingface.co/mulligan
- Checkpoint padre (actor de difusion congelado): https://huggingface.co/mulligan/sim-square-broad-r00-sobol-first100-idql
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol-first100
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
