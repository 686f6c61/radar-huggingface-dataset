# mulligan/sim-square-broad-r01-auto-iql-n32-idql

## Resumen

sim-square-broad-r01-auto-iql-n32-idql es un agente de control basado en estados para la tarea de manipulacion simulada `sim-square-broad`, desarrollado por el proyecto Mulligan y publicado bajo licencia Apache 2.0. No es un modelo de lenguaje: se trata de una politica de aprendizaje por refuerzo offline (offline RL) del tipo IDQL (Implicit Diffusion Q-Learning), compuesta por un actor de difusion y un critico IQL escalar. El checkpoint se distribuye como `policy.pt` (PyTorch) junto con `stats.json`, que contiene los normalizadores de observaciones y acciones.

El modelo pertenece a la campana `sq_d1_r1_auto_iql_n32` y se publica con cinco semillas independientes (seed-1 a seed-5), todas entrenadas hasta el paso 250001. Los checkpoints son copias byte a byte de artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`. El repositorio ocupa 1,4 GB en total.

Su relevancia es de caracter metodologico: forma parte de una campana de auto-mejora tipo DAgger-mining, en la que la politica se entrena sobre datos de teleoperacion mas rollouts generados por politicas IQL previas. Los resultados de evaluacion sobre una rejilla de estados iniciales reservada (held-out) se publican con el recuento completo de exitos por semilla, lo que permite analizar la varianza entre semillas de un mismo algoritmo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion con critico IQL escalar (IDQL, Implicit Diffusion Q-Learning); politica estado-accion |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; opera sobre vectores de estado por paso de control) |
| Tipos de cuantizacion | no disponible (se distribuye en el formato original de entrenamiento) |
| Idiomas soportados | no aplicable (modelo de control robotic; sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoint (`policy.pt`, pickle) mas `stats.json` con normalizadores |

Datos adicionales de la publicacion:

| Parametro | Valor |
|---|---|
| Tarea | sim-square-broad |
| Ronda de modelo | R1 |
| Brazo / variante | auto-iql-n32 |
| Celda de campana | `sq_d1_r1_auto_iql_n32` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

La politica sigue el esquema IDQL: un actor generativo de difusion que modela la distribucion de acciones y un critico Q escalar entrenado con IQL (Implicit Q-Learning). En la inferencia, el actor genera muestras de accion por difusion y el critico se emplea para seleccionar la mejor candidata. La model card no especifica el numero de capas, dimensión oculta, numero de pasos de difusion ni el tamano del espacio de observacion o de accion, por lo que esos detalles figuran como no disponibles.

El entrenamiento combina dos fuentes de datos: `mulligan/sim-square-broad-c00-teleop-baseline` (demostraciones de teleoperacion) y `mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts` (rollouts generados por politicas automaticas IQL). El pipeline corresponde a un esquema de auto-mejora tipo DAgger-mining: se recogen rollouts de la politica actual, se anaden al conjunto de datos y se reentrena. Cada semilla se entreno en un run distinto de W&B, con commits de Git asociados (`71bb192943c9`, `d064eec2602f`, `334735876f82`). No se documenta en la informacion disponible si hubo ajuste por RLHF/DPO (no aplicable en este dominio), ni el numero total de transiciones, ni la composicion exacta del dataset.

## Capacidades

- Control continuo de un brazo robotico en la tarea simulada `sim-square-broad`, a partir de observaciones de estado (no de imagen).
- Generacion de acciones multimodales mediante el actor de difusion, lo que permite representar distribuciones de accion no unimodales.
- Seleccion de accion guiada por valor: el critico IQL puntua las muestras del actor.
- Politica entrenada con datos offline mas rollouts propios, apta para evaluacion en bucle cerrado en simulacion.
- Evaluacion reproducible: cinco semillas independientes con recuento de exitos publicado por semilla.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo "thinking" ni de generacion de texto.

## Casos de uso

- Investigacion en offline RL: sirve como referencia reproducible de IDQL sobre una tarea de manipulacion, con cinco semillas y recuento de exitos por semilla para medir varianza del algoritmo.
- Linea base en campanas de auto-mejora: el modelo es el resultado de una ronda de DAgger-mining, por lo que se usa como punto de partida para generar nuevos rollouts (`sim-square-broad-c02-auto-iql-n32-policy-rollouts`) y reentrenar.
- Replicacion de experimentos: al ser copias byte a byte de artefactos W&B con hashes registrados, permite reproducir exactamente las condiciones de la campana `sq_d1_r1_auto_iql_n32`.
- Analisis de sensibilidad a la semilla: con cinco checkpoints del mismo paso (250001) y la misma tarea, se puede estudiar la dispersion de rendimiento (de 52,41 % a 58,79 % de exito) sin cambiar hiperparametros.
- Pruebas de pipelines de evaluacion en robotica: la rejilla de estados iniciales reservada y el formato de resultados por rollout facilitan validar infraestructura de evaluacion comparativa.
- Seleccion de politica para destilacion o despliegue sim-to-real: una de las cinco semillas puede elegirse por su mayor tasa de exito y usarse como candidata para transferencia a un entorno real, previa validacion.
- Docencia y divulgacion tecnica: permite ilustrar el funcionamiento de IDQL (actor de difusion + critico IQL) sobre un caso con resultados publicos.

## Benchmarks y rendimiento

Unicos resultados disponibles: evaluacion sobre una rejilla de estados iniciales reservada, con 30.000 rollouts por semilla y N = 32, segun el dataset `mulligan/sim-square-broad-r00-r03-eval`.

| Semilla | N | Exitos / total | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 15.723 / 30.000 | 52,41 % |
| seed-2 | 32 | 15.863 / 30.000 | 52,88 % |
| seed-3 | 32 | 17.638 / 30.000 | 58,79 % |
| seed-4 | 32 | 16.705 / 30.000 | 55,68 % |
| seed-5 | 32 | 16.736 / 30.000 | 55,79 % |
| Media (calculada sobre las cinco semillas) | 32 | 82.665 / 150.000 | 55,11 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la model card ni en la informacion disponible.
- Inferencia: se trata de un actor de difusion de tipo MLP con un critico escalar. El repositorio completo ocupa 1,4 GB para cinco semillas, es decir, aproximadamente 280 MB por semilla (estimacion derivada del tamano del repo, no confirmada por el autor). Con ese orden de magnitud, la inferencia es viable en CPU.
- VRAM estimada para inferencia: no disponible. Por el tamano del checkpoint, la huella esperable es muy inferior a la de cualquier modelo de lenguaje; no obstante, no hay una cifra confirmada por el autor.
- GPU recomendadas: no disponibles. No se documenta ningun requisito de GPU para la evaluacion de la campana.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano del checkpoint, pero sin confirmacion oficial en la informacion disponible.
- Opciones de despliegue: el checkpoint `policy.pt` requiere el codigo de investigacion de Mulligan en los commits indicados. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros agentes IDQL comparables con parametros, contexto, licencia o rendimiento publicados, por lo que no es posible construir una comparativa con datos verificables. Como referencias del mismo proyecto (no modelos alternativos) existen las rondas y celdas hermanas de la campana `sq_d1`, asi como los datasets de rollouts `c01` y `c02` y la evaluacion comun `r00-r03-eval`.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplicable en el sentido de generacion de texto, pero si existe riesgo de acciones erroneas o fuera de distribucion en estados no cubiertos por los datos de entrenamiento.
- Varianza entre semillas: las cinco semillas, entrenadas en el mismo paso, difieren en 6,4 puntos porcentuales de tasa de exito (52,41 % a 58,79 %), lo que obliga a reportar siempre la semilla utilizada.
- Rendimiento absoluto moderado: la tasa de exito media ronda el 55 %, es decir, cerca de la mitad de los rollouts evaluados no alcanzan el exito en la rejilla reservada.
- Limitacion de dominio: el modelo esta especializado en `sim-square-broad` y no es transferible directamente a otras tareas o morfologias sin reentrenamiento.
- Dependencia de normalizadores: `stats.json` es imprescindible; usar el checkpoint sin los normalizadores correspondientes produce acciones invalidas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia ni soporte por parte del autor.
- Seguridad en la carga: los archivos `.pt` son pickles de PyTorch; la propia model card advierte de cargarlos unicamente en entornos de confianza.
- Ausencia de validacion en hardware real: los resultados corresponden a simulacion; no hay evidencia publicada de transferencia sim-to-real.
- Reproducibilidad dependiente del codigo: los checkpoints fueron entrenados y evaluados con el codigo de investigacion de Mulligan en commits concretos; sin ese codigo, la inferencia no esta estandarizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-auto-iql-n32-idql
- Proyecto Mulligan: https://mulligan.page
- Evaluaciones (Policy Arena): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de entrenamiento (teleoperacion): https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de entrenamiento (rollouts de politica IQL): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset que referencia a este modelo (rollouts posteriores): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-n32-policy-rollouts

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre el proyecto Mulligan; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace. No se dispone de paper, blog tecnico ni repositorio de codigo publico adicional en la informacion proporcionada.
