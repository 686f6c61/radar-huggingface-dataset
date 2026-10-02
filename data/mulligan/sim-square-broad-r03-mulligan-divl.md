# mulligan/sim-square-broad-r03-mulligan-divl

## Resumen

`mulligan/sim-square-broad-r03-mulligan-divl` es un checkpoint de politica de control robótico, no un modelo de lenguaje. Se trata de un agente basado en estado (state-based) entrenado para la tarea simulada `sim-square-broad`, dentro de la ronda R3 del proyecto Mulligan. El artefacto combina el actor de difusión congelado heredado del modelo padre `sim-square-broad-r03-mulligan-idql` con un critico DIVL de tipo distributional, y se distribuye en cinco carpetas independientes, una por semilla (seed 1 a 5).

El modelo se publica junto a los conjuntos de datos que se usaron en su entrenamiento: teleoperación con cobertura Sobol, rondas sucesivas de DAgger sobre el propio agente y rollouts de politicas previas, cubriendo las campañas c00 a c03. La evaluacion se realizo sobre una rejilla de estados iniciales reservada (held-out), con resultados de exito por encima del 85 por ciento en todas las semillas.

Su relevancia es doble: por un lado, forma parte del banco de evaluacion comparativa Policy Arena, orientado a medir de forma reproducible politicas de aprendizaje por imitacion y por refuerzo en tareas de manipulacion simulada; por otro, su licencia MIT y la publicacion de los hashes SHA-256 de todos los ficheros lo hacen util para reproducir experimentos y comparar variantes de critico (IDQL frente a DIVL) sobre el mismo actor congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente basado en estado: actor de difusion congelado (heredado del modelo padre) mas critico DIVL distributional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control; consume observaciones de estado, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se documentan formatos cuantizados; los pesos se distribuyen en punto flotante nativo de PyTorch) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; la interfaz es numerica) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) mas fichero de estadisticas `stats.json` |
| Tarea | `sim-square-broad` (manipulacion robotica simulada) |
| Ronda | R3 |
| Brazo o variante | `mulligan` |
| Celda de campana | `sq_d1_r3_ours_mining_freecf_human_only` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Ficheros de trazabilidad | `release.json` con SHA-256 de cada fichero |

## Arquitectura y entrenamiento

El modelo es un agente de decision secuencial basado en estado. La componente de actuacion es un actor de difusion que se mantiene congelado y que procede del checkpoint `sim-square-broad-r03-mulligan-idql`, mientras que la componente entrenada en esta variante es un critico DIVL de naturaleza distributional, es decir, que modela una distribucion sobre el valor en lugar de un unico valor escalar. Esta separacion permite reutilizar el comportamiento del actor original y aislar el efecto del critico sobre el rendimiento final. Los pesos se serializan como `policy.pt` acompanado de `stats.json`, presumiblemente con las estadisticas de normalizacion de observaciones.

Los datos de entrenamiento proceden de siete conjuntos publicados por el propio proyecto: una recogida inicial de teleoperacion con cobertura Sobol (`sim-square-broad-c00-teleop-sobol`), tres rondas de agregacion de datos tipo DAgger (c01, c02 y c03) generadas por el agente `mulligan`, y los rollouts de politica correspondientes a las campanas c01, c02 y c03. Este esquema de recogida iterativa es caracteristico del aprendizaje por imitacion interactivo, en el que el experto corrige las trayectorias que la politica visita realmente. El entrenamiento reportado alcanza el paso 250001, y se repitio de forma independiente con cinco semillas.

La evaluacion se realizo sobre una rejilla de estados iniciales reservada, con resultados por rollout publicados en el conjunto `sim-square-broad-r00-r03-eval`. No se documentan en la informacion disponible innovaciones adicionales como decodificacion especulativa, atencion lineal o mecanismos de planificacion explicita, ni detalles sobre la composicion exacta del dataset, el numero de transiciones o la funcion de perdida empleada.

## Capacidades

- Control de manipulacion robotica en simulacion para la tarea `sim-square-broad`, a partir de observaciones de estado (sin imagen ni texto).
- Generacion de acciones mediante actor de difusion congelado, lo que permite muestreo multimodal de trayectorias.
- Estimacion de valor distributional mediante el critico DIVL, util para filtrar o puntuar acciones candidatas.
- Evaluacion reproducible multi-semilla: cinco checkpoints independientes listos para comparar varianza entre semillas.
- Integracion en pipelines de investigacion en aprendizaje por imitacion (IL) y aprendizaje por refuerzo offline (RL offline).
- Trazabilidad de integridad mediante `release.json` con SHA-256 por fichero.
- No dispone de tool calling, function calling, agentes multi-paso sobre herramientas, capacidades multilingues, vision, audio ni modo de razonamiento explicito; no es un modelo de lenguaje.

## Casos de uso

- Comparativa de criticos en RL offline: usar este checkpoint junto al modelo padre `sim-square-broad-r03-mulligan-idql` para medir, con el actor congelado como constante, el efecto de sustituir un critico IDQL por un critico DIVL distributional.
- Reproduccion de resultados de un benchmark: el conjunto de evaluacion `sim-square-broad-r00-r03-eval` incluye los resultados por rollout de las cinco semillas, lo que permite replicar las tasas de exito reportadas y validar entornos de ejecucion.
- Analisis de varianza entre semillas: las cinco carpetas permiten estudiar la estabilidad del entrenamiento midiendo la dispersion de la tasa de exito, que en los datos publicados va del 85,26 al 89,42 por ciento.
- Investigacion en aprendizaje por imitacion interactivo: las rondas DAgger c01, c02 y c03 asociadas a este agente permiten estudiar como la agregacion iterativa de datos afecta a la politica final.
- Punto de partida para ajuste fino o reentrenamiento: dado que el actor esta congelado y la licencia es MIT, el critico puede reentrenarse sobre otras campanas de datos manteniendo el mismo modulo de actuacion.
- Docencia y divulgacion en robotica: el repositorio de 1,4 GB, con pesos en formato PyTorch y estadisticas en JSON, es manejable para practicas de laboratorio sobre agentes de control en simulacion.
- Auditoria de artefactos de aprendizaje automatico: el uso de hashes SHA-256 en `release.json` permite verificar la integridad de los ficheros en entornos de investigacion con requisitos de trazabilidad.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la evaluacion sobre la rejilla de estados iniciales reservada (`sim-square-broad-r00-r03-eval`), con 32 estados iniciales por semilla y 30000 rollouts por semilla. La tabla siguiente reproduce los exitos y la tasa derivada.

| Semilla | Estados iniciales (N) | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 30000 | 25578 | 85,26 % |
| seed-2 | 32 | 30000 | 25604 | 85,35 % |
| seed-3 | 32 | 30000 | 26827 | 89,42 % |
| seed-4 | 32 | 30000 | 25920 | 86,40 % |
| seed-5 | 32 | 30000 | 25599 | 85,33 % |
| Media (calculada) | 32 | 150000 | 129528 | 86,35 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible; estos no aplican a un agente de control roboticos. No se proporcionan metricas de retorno, suavidad de trayectoria ni coste computacional de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican requisitos de memoria ni tamanos de parametros.
- Estimacion indirecta: el repositorio ocupa 1,4 GB y contiene cinco semillas, lo que situa cada conjunto `policy.pt` mas `stats.json` en el orden de unos 280 MB como maximo; se trata de un calculo derivado, no de un dato oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. Dado que se trata de un agente basado en estado sin componente de vision ni de lenguaje, es plausible su ejecucion en CPU, pero no hay confirmacion en la documentacion publicada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de artefacto. La carga se realiza con PyTorch, leyendo `policy.pt` y `stats.json` desde el entorno de investigacion del proyecto.
- Latencia y throughput estimados: no disponible.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch y la propia model card recomienda cargarlos unicamente en entornos de confianza.

## Comparativa con modelos similares

No se dispone de metricas comparables para las alternativas del mismo proyecto, ya que los resultados de evaluacion publicados para esos modelos no aparecen en la informacion disponible. La tabla recoge lo que si se conoce de cada variante.

| Modelo | Tarea | Ronda | Composicion | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| `sim-square-broad-r03-mulligan-divl` (este) | `sim-square-broad` | R3 | Actor de difusion congelado + critico DIVL distributional | MIT | 85,26-89,42 % de exito por semilla |
| `sim-square-broad-r03-mulligan-idql` | `sim-square-broad` | R3 | Modelo padre del actor congelado; critico IDQL | no disponible | no disponible |
| `sim-square-broad-r00-sobol-divl` | `sim-square-broad` | R00 | Actor de difusion congelado + critico DIVL, variante `sobol` | MIT segun la model card enlazada | no disponible |

La comparacion con modelos de otras familias o tamanos no es significativa, dado que se trata de un agente de control especifico para una tarea de manipulacion simulada y no de un modelo de proposito general.

## Limitaciones y advertencias

- Especificidad de tarea: el agente esta entrenado exclusivamente para `sim-square-broad` en simulacion; no se documenta transferencia a otros entornos ni al mundo real.
- Ausencia de datos sobre sesgos: no se publica ningun analisis de sesgo, y en este dominio el concepto se traduce en posibles sesgos de distribucion de estados iniciales derivados de la rejilla de evaluacion y de los datos de teleoperacion.
- Riesgo de sobreajuste a la rejilla de evaluacion: los 32 estados iniciales por semilla son una muestra reducida; las tasas de exito no deben extrapolarse sin validacion adicional.
- Varieidad entre semillas: existe una diferencia de mas de cuatro puntos porcentuales entre la mejor semilla (89,42 %) y la peor (85,26 %), lo que desaconseja reportar un unico resultado sin intervalo.
- Dependencia del actor padre: el comportamiento esta limitado por el actor congelado de `sim-square-broad-r03-mulligan-idql`; el entrenamiento de esta variante solo afecta al critico.
- Limitaciones de idioma y contexto: no aplican en el sentido habitual, pero el modelo no procesa texto ni instrucciones en lenguaje natural.
- Restricciones de licencia: la licencia es MIT, que permite uso comercial, modificacion y redistribucion con atribucion; conviene conservar el aviso de licencia y los hashes de `release.json` en cualquier redistribucion.
- Caveat de seguridad en produccion: los ficheros `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarse; deben cargarse solo desde origenes verificados y en entornos aislados.
- Falta de documentacion operativa: no se publican requisitos de hardware, latencias, ni detalles de la funcion de perdida o del preprocesado, lo que dificulta un despliegue en produccion sin trabajo adicional de ingenieria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r03-mulligan-divl
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-broad-r03-mulligan-idql
- Variante de referencia r00 con critico DIVL: https://huggingface.co/mulligan/sim-square-broad-r00-sobol-divl
- Conjunto de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Datos de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Datos DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mulligan
- Rollouts de politica c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Datos DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mulligan
- Rollouts de politica c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-mulligan-policy-rollouts
- Datos DAgger c03: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-dagger-mulligan
- Rollouts de politica c03: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-mulligan-policy-rollouts
- Busqueda de conjuntos de datos con la etiqueta `sim-square-broad`: https://huggingface.co/datasets?other=sim-square-broad
- Pagina del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones comparativas): https://arena.mulligan.page
- Ficha del conjunto DAgger c03 en Claru: https://claru.ai/datasets/mulligan-sim-square-broad-c03-dagger-mulligan
- Ficha de rollouts de politica c03 en Claru: https://claru.ai/datasets/mulligan-sim-square-broad-c03-auto-plain-il-n1-policy-rollouts
