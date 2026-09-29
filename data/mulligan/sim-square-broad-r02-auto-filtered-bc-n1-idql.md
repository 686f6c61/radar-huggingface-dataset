# mulligan/sim-square-broad-r02-auto-filtered-bc-n1-idql

## Resumen

`sim-square-broad-r02-auto-filtered-bc-n1-idql` es un agente de aprendizaje por refuerzo offline de tipo IDQL (Implicit Q-Learning as an Actor-Critic method) entrenado por el proyecto Mulligan para la tarea simulada `sim-square-broad`. No es un modelo de lenguaje: es una política de control robótico basada en estado, compuesta por un actor de difusión y un crítico IQL escalar. Se distribuye como checkpoints de PyTorch (`policy.pt`) acompañados de ficheros `stats.json` con los normalizadores de observaciones y acciones.

El modelo pertenece a la ronda R2 de la campaña y ocupa la celda `iterative-IL comparator`, es decir, sirve como comparador frente a métodos de imitación iterativa. Se publican cinco semillas independientes (1 a 5), todas detenidas en el paso de entrenamiento 250001, con el objetivo de caracterizar la varianza del algoritmo. Los checkpoints son copias byte a byte de artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`.

Su relevancia práctica es acotada pero clara: proporciona una referencia reproducible y multi-semilla para investigar RL offline aplicado a manipulación simulada, con tasas de éxito en la rejilla de estados iniciales de evaluación que van del 47,96 % al 53,61 % según la semilla. El repositorio completo ocupa 1,4 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion (diffusion policy) con critico IQL escalar; agente IDQL de actor-critico para RL offline |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: politica basada en estado, sin tokens ni ventana de contexto; la dimension del espacio de observacion no se especifica |
| Tipos de cuantizacion | No disponible; no se publican variantes cuantizadas ni versiones en menor precision |
| Idiomas soportados | No aplica (modelo de robotica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (pickle) para la politica y `stats.json` para los normalizadores |
| Tarea | sim-square-broad |
| Ronda del modelo | R2 |
| Brazo / variante | auto-filtered-bc-n1 |
| Celda de campana | iterative-IL comparator |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tipo de observacion | Basada en estado (sin vision) |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: un critico entrenado con Implicit Q-Learning, que aprende una funcion Q usando exclusivamente acciones presentes en el dataset mediante un backup de Bellman modificado, y un actor expresado como politica de difusion que se ajusta para muestrear acciones con alto valor segun ese critico, incorporando ademas un termino de comportamiento (las ejecuciones de W&B se denominan `iql_ddpg_bc_idql`, lo que sugiere la combinacion de IQL con un actor DDPG+BC). La innovacion central del enfoque, descrita en el paper de referencia, es reinterpretar IQL como metodo actor-critico y explicitar que politica alcanza los valores representados por la Q-function implicitamente entrenada.

Los datos de entrenamiento proceden de tres conjuntos: `sim-square-broad-c00-teleop-baseline` (linea base de teleoperacion), `sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts` (rollouts de una politica BC compartida) y `sim-square-broad-c02-auto-filtered-bc-n1-policy-rollouts` (rollouts de politica filtrados automaticamente). No se especifican el numero total de transiciones, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO (no aplicables en este dominio). El brazo `auto-filtered-bc-n1` indica que la componente de imitacion se nutre de datos de rollouts sometidos a un filtrado automatico previo. Los cinco checkpoints se entrenaron con el codigo de investigacion de Mulligan en los commits `17359115b544` (semillas 1 a 4) y `46829458bd07` (semilla 5).

## Capacidades

- Generacion de acciones de control continuo para la tarea simulada `sim-square-broad` a partir de observaciones de estado.
- Modelado multimodal de la distribucion de acciones gracias al actor de difusion, lo que permite representar politicas multi-modales en lugar de una media unimodal.
- Mejora sobre imitacion pura: el critico IQL permite seleccionar acciones por encima del comportamiento del dataset sin consultar acciones fuera de distribucion.
- Evaluacion reproducible multi-semilla, con cinco politicas independientes entrenadas bajo la misma configuracion.
- Generacion de rollouts de politica reutilizables como datos; el modelo esta referenciado por los metadatos de `sim-square-broad-c03-auto-filtered-bc-n1-policy-rollouts` y `sim-square-broad-r00-r03-eval`.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingues ni modos de pensamiento: no es un modelo de lenguaje.
- No dispone de capacidades de vision, audio ni procesamiento de texto (la observacion es exclusivamente de estado).

## Casos de uso

- Comparador de referencia en imitacion iterativa: la celda de campana `iterative-IL comparator` indica que este agente se usa como linea base contra la que medir variantes de aprendizaje por imitacion iterativa en `sim-square-broad`.
- Estudio de varianza entre semillas: con cinco semillas que abarcan del 47,96 % al 53,61 % de exito, el modelo permite cuantificar cuanto depende el resultado de la inicializacion y estimar intervalos de confianza realistas en publicaciones.
- Generacion de datos de rollout para entrenamiento posterior: la politica puede desplegarse en simulacion para producir trayectorias etiquetadas que alimenten la siguiente ronda de entrenamiento, como evidencia el dataset `c03` que la referencia.
- Punto de partida para ajuste fino con RL offline: al ser un agente actor-critico ya entrenado durante 250001 pasos, sirve como inicializacion para experimentos de mejora con otros criticos o funciones de recompensa.
- Destilacion a controladores mas ligeros: las acciones generadas en simulacion pueden usarse como objetivo de destilacion hacia redes mas pequenas o controladores clasicos para despliegue con latencia reducida.
- Analisis de robustez frente a estados iniciales: la evaluacion sobre una rejilla de estados iniciales retenida (30.000 rollouts por semilla) es directamente reutilizable como protocolo para medir sensibilidad a condiciones de partida.
- Reproduccion de experimentos: los checkpoints son copias byte a byte de artefactos de W&B con commit de codigo registrado, lo que permite verificar resultados de forma independiente.
- Investigacion en RL offline basado en estado: util para estudiar el comportamiento de la combinacion difusion + IQL en tareas de control continuo sin el coste de reentrenar desde cero.

## Benchmarks y rendimiento

Los unicos resultados publicados son las evaluaciones del autor sobre una rejilla de estados iniciales retenida, con 30.000 rollouts por semilla.

| Semilla | Dataset de evaluacion | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-broad-r00-r03-eval | 30000 | 14389 | 47,96 % |
| seed-2 | sim-square-broad-r00-r03-eval | 30000 | 15515 | 51,72 % |
| seed-3 | sim-square-broad-r00-r03-eval | 30000 | 15705 | 52,35 % |
| seed-4 | sim-square-broad-r00-r03-eval | 30000 | 15687 | 52,29 % |
| seed-5 | sim-square-broad-r00-r03-eval | 30000 | 16084 | 53,61 % |
| Agregado | sim-square-broad-r00-r03-eval | 150000 | 77380 | 51,59 % |

El rango entre semillas es de 5,65 puntos porcentuales (47,96 % a 53,61 %), con una media agregada del 51,59 %. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, ya que no aplican a este tipo de modelo. Tampoco se publican comparaciones numericas frente a otros agentes en la misma tarea dentro de la informacion disponible.

## Requisitos de hardware

- No se publican requisitos de VRAM ni de GPU por parte del autor; el dato no esta disponible.
- Como referencia de tamano: el repositorio completo, con cinco semillas, ocupa 1,4 GB, lo que situa cada checkpoint en el orden de cientos de megabytes (estimacion derivada del tamano del repo, no un dato oficial).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada. El tamano reducido de los checkpoints sugiere que la inferencia podria caber en GPUs de gama consumer, pero no hay especificacion oficial al respecto.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un checkpoint de politica). El formato es un `.pt` de PyTorch que debe cargarse con el codigo de investigacion de Mulligan en los commits `17359115b544` o `46829458bd07`, junto con `stats.json`.
- Latencia y throughput: no disponibles.
- Advertencia de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en un entorno de confianza.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r02-auto-filtered-bc-n1-idql | sim-square-broad | No disponible | No aplica | 51,59 % agregado (47,96-53,61 % por semilla) | Apache-2.0 | HuggingFace (mulligan) |
| IDQL (referencia algoritmica, arXiv 2304.10573) | Benchmarks de RL offline | No disponible | No aplica | No disponible en esta busqueda | No disponible | Paper |
| IQL + DDPG+BC (artefactos de W&B citados) | sim-square-d1 | No disponible | No aplica | No disponible | No disponible | Artefactos W&B |
| sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts | sim-square-narrow | No disponible | No aplica | No disponible | No disponible | Dataset en HuggingFace |

No se dispone de cifras comparativas publicadas para ninguno de los modelos alternativos en la tarea `sim-square-broad`, por lo que no es posible establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Ambito restringido: el modelo solo ha sido entrenado y evaluado para la tarea `sim-square-broad`; no hay evidencia de transferencia a otras tareas, robots ni entornos reales.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling y no debe emplearse en casos de uso de NLP.
- Entrada basada en estado: no incorpora vision, por lo que requiere exactamente la misma interfaz de observacion que la empleada en el entrenamiento.
- Varianza entre semillas notable: una diferencia de 5,65 puntos porcentuales entre la peor y la mejor semilla implica que la eleccion de semilla condiciona el resultado; cualquier comparacion deberia reportar multiples semillas.
- Dependencia del filtrado automatico: el brazo `auto-filtered-bc-n1` usa datos filtrados de forma automatica; un filtrado agresivo puede haber descartado comportamientos minoritarios pero utiles, sesgando la politica hacia los modos dominantes.
- Riesgo de sobreajuste al simulador: no se documenta ningun experimento de transferencia sim-to-real ni de domain randomization, por lo que el rendimiento en hardware fisico es desconocido.
- Tasa de exito agregada del 51,59 %: aproximadamente la mitad de los rollouts de evaluacion no alcanzan el exito, lo que limita su uso directo en aplicaciones que exijan alta fiabilidad.
- Fallos silenciosos: no se publican analisis de modos de fallo, tiempos de recuperacion ni seguridad de las trayectorias generadas.
- Riesgo de seguridad al cargar: los checkpoints son pickles de PyTorch (`policy.pt`); deben cargarse solo en entornos de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero la licencia cubre el artefacto publicado y no otorga ninguna garantia sobre su comportamiento.
- Validacion externa nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe verificacion independiente de los resultados por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-auto-filtered-bc-n1-idql
- Pagina del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de entrenamiento (teleoperacion base): https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de entrenamiento (rollouts de politica BC compartida): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts
- Dataset de entrenamiento (rollouts de politica BC filtrados): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-filtered-bc-n1-policy-rollouts
- Dataset que referencia al modelo: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-auto-filtered-bc-n1-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Busqueda de datasets de la familia sim-square-broad: https://huggingface.co/datasets?other=sim-square-broad
- Dataset relacionado de la variante narrow: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts
- Ficha externa de ese dataset: https://claru.ai/datasets/mulligan-sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts
- Paper de IDQL (referencia algoritmica): https://arxiv.org/abs/2304.10573
