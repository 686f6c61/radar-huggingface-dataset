# mulligan/sim-square-narrow-r02-mulligan-divl

## Resumen

`mulligan/sim-square-narrow-r02-mulligan-divl` es un agente de aprendizaje por refuerzo para robotica, publicado por la organizacion Mulligan, que forma parte de una campana de recogida de datos guiada por rendimiento. No es un modelo de lenguaje: se trata de una politica basada en estado (no procesa texto ni lenguaje natural) entrenada para la tarea de simulacion identificada como `sim-square-narrow`. El artefacto combina un actor de difusion congelado, heredado del modelo padre `sim-square-narrow-r02-mulligan-idql`, y un critico DIVL de tipo distribucional, empaquetado en `policy.pt` junto con `stats.json`.

El modelo se publica en la ronda R2 de la campana, en la celda `sq_d0_r2_ours_mining_shape_beta05_freecf_human_only`, con cinco semillas independientes (1 a 5) y checkpoints capturados en el paso de entrenamiento 150001. El repositorio ocupa 1,4 GB e incluye una carpeta por semilla, ademas de ficheros de configuracion de ejecucion referenciados desde el repositorio de codigo de Mulligan. Los datos de entrenamiento proceden de cinco conjuntos de la propia organizacion: teleoperacion SoBol, correcciones DAgger de Mulligan, rollouts de politica SoBol y rollouts de politica Mulligan.

Su relevancia actual es metodologica: el proyecto Mulligan investiga recogida de datos guiada por rendimiento mediante correcciones dirigidas, demostraciones contrafactuales, ablaciones de componentes y estadisticas pareadas con evaluaciones ciegas en robot. Este checkpoint en concreto sirve como referencia reproducible del brazo "mulligan" con critico DIVL, evaluado sobre una rejilla de estados iniciales reservados con 8000 rollouts por semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL basado en estado; actor de difusion congelado (heredado del modelo padre) y critico DIVL distribucional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones de estado paso a paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, pickle de PyTorch) mas `stats.json` |
| Tarea | `sim-square-narrow` |
| Ronda del modelo | R2 |
| Brazo | `mulligan` |
| Celda de campana | `sq_d0_r2_ours_mining_shape_beta05_freecf_human_only` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Actor congelado de origen | `mulligan/sim-square-narrow-r02-mulligan-idql` |
| Tamano del repositorio | 1,4 GB |
| Pipeline (HuggingFace) | robotics |
| Tipo de entrada | estado (state-based); no hay evidencia de entrada visual en la informacion disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el artefacto como un agente basado en estado que conserva el actor de difusion del modelo padre en modo congelado y anade un critico DIVL distribucional; el aprendizaje de esta ronda se aplica, por tanto, sobre el componente de critica y no sobre el actor generador de acciones. No se detallan en la informacion disponible el numero de parametros, la profundidad de las redes, el tipo de representacion de estado ni el algoritmo exacto de optimizacion. El identificador de la celda de campana (`beta05`, `freecf`, `human_only`) sugiere un ajuste con coeficiente beta 0,5, uso de contrafactuales libres y datos exclusivamente humanos, pero la model card no desarrolla estas convenciones.

El entrenamiento se apoya en cinco conjuntos de datos del ecosistema Mulligan: teleoperacion SoBol (`c00-teleop-sobol`), correcciones DAgger de Mulligan en las fases c01 y c02, rollouts de politica SoBol (c01) y rollouts de politica Mulligan (c02). Esto configura un ciclo iterativo de tipo DAgger con mezcla de demostraciones humanas y datos generados por politicas previas. La campana se enmarca en la linea de investigacion del proyecto, descrita como recogida de datos guiada por rendimiento con correcciones dirigidas, demostraciones contrafactuales, ablaciones de componentes, productividad de recogida, estadisticas pareadas y evaluaciones ciegas en robot. No se especifica el numero total de transiciones, la composicion exacta del dataset ni si hubo etapas de ajuste adicionales fuera del paso 150001.

## Capacidades

- Generacion de acciones de control para la tarea de simulacion `sim-square-narrow` a partir de observaciones de estado.
- Ejecucion como politica congelada reutilizable en nuevas rondas de entrenamiento (actor heredado por otros agentes DIVL).
- Entrenamiento y evaluacion de un critico DIVL distribucional sobre un actor fijo.
- Integracion en bucles de recogida de datos tipo DAgger: los rollouts generados alimentan los conjuntos `c01`/`c02`/`c03` de la organizacion.
- Evaluacion reproducible multi-semilla: cinco checkpoints independientes para estimar varianza entre inicializaciones.
- Evaluacion por lotes sobre rejillas de estados iniciales reservados, con registro de resultados por rollout en los datasets de evaluacion.
- Trazabilidad de artefactos: hashes SHA-256 de cada fichero en `release.json` y configuraciones de ejecucion por semilla.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modo de razonamiento extendido. No es un modelo de lenguaje y no tiene ninguna de estas capacidades.

## Casos de uso

- Comparativa de algoritmos de RL robotico: el checkpoint sirve como brazo de referencia del metodo Mulligan con critico DIVL frente a variantes IDQL o baseline en la misma tarea, con la misma rejilla de estados iniciales y 8000 rollouts por semilla.
- Generacion de datos de rollout para DAgger: la politica puede desplegarse en simulacion para producir episodios que despues se corrigen y se incorporan a los conjuntos `mulligan-policy-rollouts`, cerrando el ciclo de mejora iterativa.
- Inicializacion de nuevas rondas de entrenamiento: el actor congelado se reutiliza como punto de partida en modelos derivados, lo que permite aislar el efecto del cambio de critico o de la composicion del dataset.
- Ablacion de componentes: al mantener el actor fijo y modificar solo el critico DIVL, el modelo permite medir de forma controlada la contribucion del componente de critica al rendimiento final.
- Analisis de robustez entre semillas: con cinco semillas y sus recuentos de exito individuales, se pueden calcular intervalos de confianza y detectar sensibilidad a la inicializacion antes de comprometer recursos en evaluaciones con robot real.
- Evaluacion previa a la transferencia a hardware: la politica puede filtrar configuraciones de tarea y variantes de entrenamiento en simulacion antes de pasar a una evaluacion ciega en robot, reduciendo el coste de las pruebas fisicas.
- Reproduccion de resultados de investigacion: la combinacion de `release.json`, las configuraciones de ejecucion por semilla y los datasets enlazados permite reconstruir el entrenamiento y verificar los recuentos de exito publicados.
- Docencia y prototipado en robotica: al ser un agente basado en estado con licencia MIT, es util como caso de estudio de un pipeline completo de teleoperacion, DAgger y evaluacion por lotes en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplican benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K). La unica evaluacion documentada es la rejilla de estados iniciales reservados del dataset `sim-square-narrow-r00-r03-eval`:

| Semilla | N (estados iniciales) | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 8000 | 7656 | 95,70 % |
| seed-2 | 32 | 8000 | 7690 | 96,13 % |
| seed-3 | 32 | 8000 | 7555 | 94,44 % |
| seed-4 | 32 | 8000 | 7661 | 95,76 % |
| seed-5 | 32 | 8000 | 7550 | 94,38 % |
| Total | 32 | 40000 | 38112 | 95,28 % |

Las tasas de exito y el total agregado se han calculado a partir de los recuentos de la model card. La model card no indica el numero de rollouts por estado inicial que justifica la relacion entre N = 32 y los 8000 rollouts por semilla, ni el intervalo de confianza asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el numero de parametros ni el consumo de memoria.
- GPU recomendadas: no disponible. No se documenta ninguna GPU de referencia para entrenamiento o inferencia.
- Encaje en GPU de consumo: no disponible. Sin datos de tamano de parametros no puede determinarse.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; estos motores no aplican a un agente de RL. El artefacto se carga como pickle de PyTorch (`.pt`) en un entorno de confianza, presumiblemente junto con el entorno de simulacion de la tarea.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por paso, frecuencia de control ni rollouts por segundo.
- Volumen de artefactos: 1,4 GB en total en el repositorio, distribuidos en cinco carpetas de semilla mas los ficheros auxiliares; no se detalla el desglose por fichero.
- Coste de evaluacion observado: 40000 rollouts repartidos en cinco semillas sobre 32 estados iniciales, segun la tabla de evaluaciones.

## Comparativa con modelos similares

Solo se dispone de datos de otros artefactos del mismo proyecto; no hay benchmarks comunes publicados que permitan una comparacion cuantitativa completa.

| Modelo | Relacion | Tarea | Parametros | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|---|---|
| `sim-square-narrow-r02-mulligan-divl` (este) | Agente DIVL con actor congelado | `sim-square-narrow` | no disponible | no aplica | MIT | Rejilla de evaluacion, 5 semillas, 95,28 % agregado |
| `mulligan/sim-square-narrow-r02-mulligan-idql` | Modelo padre; aporta el actor congelado | `sim-square-narrow` | no disponible | no aplica | no disponible en la informacion | no disponible en la informacion |
| `mulligan/sim-square-broad-r00-baseline-first100-divl` | Variante DIVL sobre tarea `sim-square-broad` y ronda R0 | `sim-square-broad` | no disponible | no aplica | no disponible en la informacion | no disponible en la informacion |

No se han identificado en la informacion disponible alternativas externas al proyecto con los mismos datos de evaluacion, por lo que la comparacion entre familias de modelos queda como no disponible.

## Limitaciones y advertencias

- Los ficheros `.pt` son pickles de PyTorch; la propia model card advierte de que solo deben cargarse en un entorno de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- Modelo especifico de una unica tarea (`sim-square-narrow`) y de un unico tipo de observacion (estado). No es generalizable a otras tareas ni a entradas de lenguaje o vision sin reentrenamiento.
- Naturaleza exclusivamente simulada: el identificador de tarea empieza por `sim-` y no se aporta evidencia de transferencia a robot real en la informacion disponible.
- Tasa de fallo no despreciable: entre el 3,87 % y el 5,62 % de rollouts fallidos segun la semilla. En un despliegue real habria que presupuestar recuperacion ante fallos.
- La evaluacion se apoya en 32 estados iniciales reservados; la cobertura del espacio de estados puede ser limitada y no se publican intervalos de confianza ni desglose por tipo de fallo.
- Ausencia de datos de arquitectura: no se publican parametros, capas, dimensiones de observacion ni hiperparametros en la model card; las configuraciones de ejecucion residen en el repositorio de codigo de Mulligan, cuyo enlace directo no se proporciona.
- Idioma: no aplica. El modelo no procesa lenguaje natural y no tiene capacidades multilingues.
- Sesgos: no se documentan analisis de sesgo. Al entrenarse con datos `human_only` de teleoperacion, puede heredar las estrategias y limitaciones de las personas que recogieron las demostraciones y de las condiciones concretas de simulacion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero se ofrece sin garantia. Los datasets enlazados se distribuyen bajo `apache-2.0` segun la informacion disponible, lo que conviene verificar de forma independiente antes de reutilizarlos.
- Validacion comunitaria practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de replicacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-mulligan-divl
- Proyecto Mulligan: https://mulligan.page/
- Policy Arena (evaluaciones): https://arena.mulligan.page/
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-narrow-r02-mulligan-idql
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset de correcciones DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan
- Dataset de rollouts SoBol c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset de correcciones DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mulligan
- Dataset de rollouts Mulligan c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset de rollouts Mulligan c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Listado de modelos con etiqueta `divl-agent`: https://huggingface.co/models?other=divl-agent
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Repositorio de codigo de Mulligan (configuraciones de ejecucion): referenciado en la model card, enlace directo no disponible
- Paper tecnico de Mulligan: referenciado a traves de https://mulligan.page/, enlace directo al preprint no disponible
