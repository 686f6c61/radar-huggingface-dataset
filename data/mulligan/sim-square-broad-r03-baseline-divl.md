# mulligan/sim-square-broad-r03-baseline-divl

## Resumen

sim-square-broad-r03-baseline-divl es un agente de control para robótica basado en estado, publicado por el usuario mulligan dentro del proyecto Mulligan, una infraestructura de entrenamiento y evaluacion de politicas de robotica. Se trata de la ronda R3 del brazo "baseline" de la tarea simulada sim-square-broad, e implementa un actor de difusion congelado (heredado del modelo padre sim-square-broad-r03-baseline-idql) combinado con un critico DIVL de tipo distribuicional. El artefacto publicado no es un modelo de lenguaje: es un checkpoint de politica (`policy.pt` y `stats.json`) destinado a ser cargado por el codigo de entrenamiento y evaluacion de Mulligan.

El modelo resuelve una tarea concreta de manipulacion o navegacion en simulacion (sim-square-broad) a partir de observaciones de estado, no de texto ni imagenes documentadas. Se publican cinco checkpoints independientes, uno por semilla (semillas 1 a 5), todos ellos en el paso de entrenamiento 250001. El repositorio ocupa 1,4 GB y esta liberado bajo licencia MIT.

Su relevancia es metodologica: forma parte de una campana comparativa ("sq_d1_r3_baseline_uniform_nocf_human_only") en la que se evalua el efecto de distintas tecnicas de aprendizaje por refuerzo offline sobre una misma politica base, con resultados de exito publicados por semilla en un grid de estados iniciales retenidos. No se documentan parametros, contexto ni idiomas, porque no aplican al tipo de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion congelado (heredado de sim-square-broad-r03-baseline-idql) mas critico DIVL distribuicional; agente basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (agente basado en estado; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) y JSON (`stats.json`); `release.json` con hashes SHA-256 |
| Pipeline declarado | robotics |
| Tarea | sim-square-broad |
| Ronda / brazo | R3 / baseline |
| Celda de campana | `sq_d1_r3_baseline_uniform_nocf_human_only` |
| Semillas publicadas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Modelo padre (actor congelado) | mulligan/sim-square-broad-r03-baseline-idql |

## Arquitectura y entrenamiento

El agente es un sistema actor-critico. El actor es una politica de difusion congelada que se hereda del checkpoint sim-square-broad-r03-baseline-idql, de modo que este release no reentrena el generador de acciones: solo aporta el critico. El critico es de tipo DIVL distribuicional, es decir, modela una distribucion sobre el valor en lugar de una estimacion puntual, lo que en la familia de metodos de aprendizaje por refuerzo offline sirve para penalizar acciones fuera de distribucion con mas matices que un critico escalar. La observacion es de estado (state-based), sin entrada de imagen ni de texto documentada.

El entrenamiento se ejecuta hasta el paso 250001 en cinco semillas independientes, cada una con su propio fichero de configuracion en `release/run-configs/`. Los datos proceden del conjunto de demostraciones de teleoperacion sim-square-broad-c00-teleop-baseline y de las rondas sucesivas de la campaña: rollouts de la politica base (c01, c02, c03), datos de DAgger sobre esa misma politica (c01, c02, c03) y los correspondientes rollouts de politica. La celda de campana indica que el entrenamiento usa datos uniformes, sin contrafactuales ("nocf") y solo de origen humano. No se documentan el numero de tokens, la composicion detallada del dataset ni si hubo RLHF o DPO, terminos que ademas no aplican a este tipo de politica.

## Capacidades

- Generacion de acciones de control para la tarea simulada sim-square-broad a partir de observaciones de estado.
- Aprendizaje por refuerzo offline con actor de difusion y critico distribuicional, orientado a mejorar la politica base sin interaccion online adicional documentada.
- Reentreno reproducible: las configuraciones de ejecucion permiten reentrenar cada checkpoint desde el codigo de Mulligan.
- Evaluacion por semilla: cada checkpoint se evalua de forma independiente sobre un grid de estados iniciales retenidos.
- Soporte de entrenamiento con datos de DAgger y con rollouts de la propia politica, segun los datasets enlazados.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso simbolico, vision, audio, multilingue ni modo de pensamiento.

## Casos de uso

- Investigacion en aprendizaje por refuerzo offline: el modelo sirve como referencia reproducible para medir el efecto de un critico distribuicional (DIVL) sobre una politica de difusion congelada, comparando contra el checkpoint padre y contra la ronda r00.
- Replicacion de experimentos: con las configuraciones de `release/run-configs/` y las cinco semillas publicadas es posible reproducir el entrenamiento y verificar la varianza entre semillas (de 72,52 % a 83,04 % de exito en el grid evaluado).
- Benchmarking de agentes en simulacion: sirve como linea base ("baseline") contra la que comparar brazos alternativos dentro de la misma campana `sq_d1_r3_baseline_uniform_nocf_human_only`.
- Generacion de datos sinteticos de politica: los rollouts del agente pueden emplearse como datos de entrenamiento para rondas posteriores, tal como se hizo con c01, c02 y c03.
- Estudios de robustez ante estados iniciales: al publicarse el resultado por semilla sobre un grid de estados iniciales retenidos, permite analizar la sensibilidad del agente a la condicion de arranque.
- Integracion en pipelines de evaluacion tipo Policy Arena: el modelo esta pensado para ser consumido por la infraestructura de evaluacion de Mulligan y comparado de forma sistematica con otros brazos.
- Docencia y prototipado en robotica simulada: al ocupar 1,4 GB en total y ser cargable en PyTorch, permite experimentar con politicas de difusion en equipos modestos.

## Benchmarks y rendimiento

Evaluacion en el grid de estados iniciales retenidos, con los resultados reportados por el autor en la model card (exitos sobre 30000 por semilla, N = 32 estados iniciales):

| Dataset de evaluacion | Carpeta | Semilla | Exitos / total | Tasa de exito |
|---|---|---|---|---|
| sim-square-broad-r00-r03-eval | seed-1 | 1 | 24912 / 30000 | 83,04 % |
| sim-square-broad-r00-r03-eval | seed-2 | 2 | 23884 / 30000 | 79,61 % |
| sim-square-broad-r00-r03-eval | seed-3 | 3 | 23610 / 30000 | 78,70 % |
| sim-square-broad-r00-r03-eval | seed-4 | 4 | 21757 / 30000 | 72,52 % |
| sim-square-broad-r00-r03-eval | seed-5 | 5 | 23664 / 30000 | 78,88 % |
| Media de las cinco semillas | - | 1-5 | 117827 / 150000 | 78,55 % |

No se han publicado resultados de benchmarks estandar de aprendizaje por refuerzo (por ejemplo, retornos normalizados o comparaciones contra algoritmos de referencia) en la informacion disponible. Las metricas anteriores son las unicas reportadas y corresponden a un grid concreto de estados iniciales, por lo que no son directamente extrapolables a otras condiciones de evaluacion.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM, GPU ni CPU.
- Estimacion a partir del repositorio: 1,4 GB repartidos entre cinco semillas, es decir, aproximadamente 280 MB por semilla incluyendo `policy.pt` y `stats.json`. No se confirma esta distribucion en la informacion disponible.
- Con ese orden de magnitud, el checkpoint de una sola semilla es previsiblemente ejecutable en GPU de consumo e incluso en CPU, aunque no hay datos publicados que lo confirmen.
- En caso de cargar las cinco semillas simultaneamente para comparacion, el espacio necesario en disco seria de 1,4 GB, no asi en memoria si se cargan de forma secuencial.
- Opciones de despliegue: PyTorch como marco de carga; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a una politica de control.
- Latencia y throughput: no disponibles.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch; deben cargarse unicamente en entornos de confianza. Los hashes SHA-256 de cada fichero estan registrados en `release.json`.

## Comparativa con modelos similares

| Modelo | Tarea | Ronda | Actor | Critico | Licencia | Tasa de exito publicada |
|---|---|---|---|---|---|---|
| mulligan/sim-square-broad-r03-baseline-divl | sim-square-broad | R3 | Difusion congelado (heredado de idql) | DIVL distribuicional | MIT | 72,52 % - 83,04 % por semilla |
| mulligan/sim-square-broad-r03-baseline-idql | sim-square-broad | R3 | Difusion (modelo padre) | IDQL | no disponible en la informacion | no disponible |
| mulligan/sim-square-broad-r00-baseline-divl | sim-square-broad | R0 | Difusion (ronda anterior) | DIVL distribuicional | no disponible en la informacion | no disponible |

La comparacion se limita a variantes del mismo autor y la misma familia de tareas, porque no se dispone de datos de modelos equivalentes de terceros en la informacion proporcionada. Las diferencias tecnicas entre brazos (por ejemplo, el tipo de critico) no vienen acompanadas de cifras comparativas publicadas en este release.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo ni de cobertura del espacio de estados.
- Riesgo de alucinacion: no aplica en el sentido de generacion de lenguaje, pero si existe el riesgo equivalente de generalizacion incorrecta ante estados fuera de la distribucion de entrenamiento.
- El agente esta entrenado exclusivamente sobre datos de origen humano, sin contrafactuales ("nocf"), y con muestreo uniforme, lo que puede limitar su rendimiento en regiones poco representadas del espacio de estados.
- La varianza entre semillas es elevada: la tasa de exito en el grid evaluado va del 72,52 % (semilla 4) al 83,04 % (semilla 1), una diferencia de mas de 10 puntos porcentuales. Cualquier uso en produccion deberia fijar una semilla concreta y validarla.
- Los resultados de evaluacion corresponden a un unico grid de estados iniciales retenidos (N = 32), por lo que no garantizan el comportamiento en otras condiciones ni en el mundo real.
- El actor esta congelado y se hereda del modelo idql: este release no mejora la politica de generacion de acciones, solo aporta el critico, de modo que su rendimiento esta acotado por el del checkpoint padre.
- Ambito de aplicacion limitado a la tarea sim-square-broad; no se documenta transferencia a otras tareas ni a hardware fisico.
- Licencia MIT: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia. No se documentan restricciones adicionales.
- Los ficheros `.pt` son pickles de PyTorch y su carga ejecuta codigo arbitrario; conviene verificar los hashes de `release.json` antes de cargarlos.
- No se documenta soporte, mantenimiento ni actualizaciones posteriores al 2 de octubre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r03-baseline-divl
- Modelo padre (actor congelado, IDQL): https://huggingface.co/mulligan/sim-square-broad-r03-baseline-idql
- Variante de la ronda anterior: https://huggingface.co/mulligan/sim-square-broad-r00-baseline-divl
- Organizacion del autor en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de teleoperacion base: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Rollouts de la politica base, ronda c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-baseline-policy-rollouts
- Datos DAgger, ronda c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-baseline
- Rollouts de la politica base, ronda c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-baseline-policy-rollouts
- Datos DAgger, ronda c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-baseline
- Rollouts de la politica base, ronda c03: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-baseline-policy-rollouts
- Datos DAgger, ronda c03: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-dagger-baseline
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Listado de datasets con la etiqueta sim-square-broad: https://huggingface.co/datasets?other=sim-square-broad
