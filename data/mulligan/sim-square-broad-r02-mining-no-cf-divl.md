# mulligan/sim-square-broad-r02-mining-no-cf-divl

## Resumen

`mulligan/sim-square-broad-r02-mining-no-cf-divl` es un agente de control para robotica publicado por la organizacion Mulligan dentro de su campana de evaluacion de politicas (Policy Arena). Corresponde a la tarea simulada `sim-square-broad`, ronda R2, brazo `mining-no-cf`, celda de campana `sq_d1_r2_ours_mining_nocf_human_only`, y se distribuye en cinco carpetas, una por semilla (seeds 1 a 5), todas correspondientes al paso de entrenamiento 250001. No es un modelo de lenguaje ni un transformer generativo: es un agente basado en estado (state-based) compuesto por un actor de difusion congelado, heredado del modelo padre `sim-square-broad-r02-mining-no-cf-idql`, y un critico DIVL de tipo distributional.

Los artefactos publicados son `policy.pt` (pesos en formato pickle de PyTorch), `stats.json` y `release.json`. El interes de la publicacion esta en la reproducibilidad: cinco semillas independientes del mismo paso de entrenamiento, con procedencia verificada (copias byte a byte de artefactos de Weights & Biases, con MD5 comprobado contra el manifiesto del artefacto y SHA-256 registrado en `release.json`), algo poco frecuente en RL aplicado a robotica.

En la evaluacion held-out sobre un grid de estados iniciales, el agente alcanza una tasa de exito media del 81,25 %, con un rango entre el 79,28 % y el 83,30 % segun la semilla. No se han publicado datos de parametros, requisitos de hardware ni detalles de la arquitectura interna mas alla de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente actor-critico basado en estado: actor de difusion congelado (heredado del modelo padre) mas critico DIVL distributional |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: agente basado en estado, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`, fichero `policy.pt`) mas `stats.json` y `release.json` |
| Tarea | sim-square-broad |
| Ronda del modelo | R2 |
| Brazo | mining-no-cf |
| Celda de campana | sq_d1_r2_ours_mining_nocf_human_only |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Modelo padre (actor congelado) | mulligan/sim-square-broad-r02-mining-no-cf-idql |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | robotics |
| Fecha de creacion | 2026-09-28 |
| Fecha de actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

La model card describe el artefacto como un agente basado en estado que combina dos componentes: el actor de difusion del modelo padre, que se mantiene congelado, y un critico DIVL de tipo distributional. Los nombres de los artefactos de Weights & Biases de los que provienen los checkpoints (`iql_ddpg_bc_idql_divl_square_d1_...`) indican que el pipeline de entrenamiento integra componentes IQL, DDPG+BC, IDQL y DIVL; la model card no detalla la contribucion exacta de cada uno ni la funcion de perdida final. El entrenamiento se detiene en el paso 250001 y se replica con cinco semillas bajo el mismo commit de Git (`551416bff972`).

Los datos de entrenamiento proceden de cinco conjuntos publicados por la misma organizacion: `sim-square-broad-c00-teleop-sobol` (teleoperacion), dos rondas de datos tipo DAgger (`sim-square-broad-c01-dagger-mining-no-cf` y `sim-square-broad-c02-dagger-mining-no-cf`) y dos conjuntos de rollouts de politica (`sim-square-broad-c01-sobol-policy-rollouts` y `sim-square-broad-c02-mulligan-policy-rollouts`). La model card no especifica el numero de transiciones, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables a este tipo de modelo). Los ficheros publicados son copias identicas a los artefactos originales, verificadas por MD5 contra el manifiesto y con SHA-256 en `release.json`.

## Capacidades

- Generacion de acciones de control en el entorno simulado `sim-square-broad` a partir de observaciones de estado.
- Politica determinista o estocastica derivada del actor de difusion (el numero de pasos de denoising no se documenta).
- Estimacion de valor mediante un critico DIVL de tipo distributional, orientado a modelar la distribucion del retorno y no solo su media.
- Replicabilidad multi-semilla: cinco checkpoints independientes del mismo paso de entrenamiento permiten medir varianza entre semillas.
- Compatibilidad con pipelines de RL offline y off-policy (IQL, DDPG+BC, IDQL, DIVL) segun los nombres de los artefactos de entrenamiento.
- Generacion de rollouts de politica para recogida iterativa de datos tipo DAgger (los datasets c01 y c02 de rollouts proceden de este tipo de proceso).
- No dispone de tool calling, function calling, soporte de agentes basados en lenguaje, capacidades multilingues, vision, audio ni modo de razonamiento explicito. Estas capacidades no aplican a este artefacto.

## Casos de uso

- Linea base de referencia en `sim-square-broad`: sirve como punto de comparacion fijo (81,25 % de exito medio) para evaluar politicas nuevas dentro de Policy Arena, gracias a que las cinco semillas estan publicadas y la evaluacion usa el mismo grid de estados iniciales.
- Investigacion en RL off-policy: los checkpoints permiten reproducir y auditar la combinacion de IQL, DDPG+BC, IDQL y DIVL descrita en los nombres de los runs, comparando el efecto del critico distributional frente a criticos escalares.
- Estudio de varianza entre semillas: con cinco semillas del mismo paso de entrenamiento se puede cuantificar la dispersion del rendimiento (79,28 % a 83,30 %) y decidir cuantas semillas son necesarias en futuros experimentos.
- Generacion de datos sinteticos: el agente puede desplegarse en el simulador para producir rollouts de politica, tal y como se hizo en los conjuntos `c01-sobol-policy-rollouts` y `c02-mulligan-policy-rollouts`, alimentando nuevas rondas de DAgger.
- Destilacion o inicializacion: al estar el actor congelado y derivado del modelo `-idql`, este checkpoint puede emplearse como profesor o como inicializacion en variantes posteriores de la misma campana.
- Benchmarking de criticos: el componente DIVL permite estudiar si modelar la distribucion del retorno mejora la seleccion de acciones frente al uso de un critico puramente esperado.
- Docencia y formacion en robotica basada en simulacion: el conjunto de cinco semillas con procedencia verificada es util como ejemplo reproducible de un ciclo completo de teleoperacion, DAgger, entrenamiento off-policy y evaluacion held-out.
- Analisis de robustez ante estados iniciales: la evaluacion sobre un grid held-out de estados iniciales permite estudiar la sensibilidad del agente fuera de la distribucion de entrenamiento.

## Benchmarks y rendimiento

Resultados de la evaluacion held-out publicados en la model card (conjunto `mulligan/sim-square-broad-r00-r03-eval`, sobre un grid de estados iniciales). La model card indica N=32 por semilla y un recuento de exitos sobre 30000 rollouts; no se detalla la relacion exacta entre ambas cifras.

| Semilla | Exitos | Total | Tasa de exito |
|---|---|---|---|
| seed-1 | 24989 | 30000 | 83,30 % |
| seed-2 | 23785 | 30000 | 79,28 % |
| seed-3 | 24196 | 30000 | 80,65 % |
| seed-4 | 24399 | 30000 | 81,33 % |
| seed-5 | 24501 | 30000 | 81,67 % |
| Media (5 semillas) | 121870 | 150000 | 81,25 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de artefacto. Tampoco se proporcionan cifras de rendimiento del modelo padre `sim-square-broad-r02-mining-no-cf-idql` ni de otras variantes de la misma campana, por lo que no es posible establecer una comparacion cuantitativa directa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica requisitos de memoria ni GPU.
- GPU recomendadas: no disponible. No hay ninguna GPU indicada en la model card.
- Viabilidad en GPU consumer: no documentada. Como referencia indirecta, el repositorio completo ocupa 1,4 GB para cinco semillas, es decir, del orden de 280 MB por semilla incluyendo actor y critico; este orden de magnitud sugiere que un unico checkpoint podria cargarse en una GPU consumer, pero se trata de una estimacion a partir del tamano del repositorio, no de un dato publicado.
- Latencia y throughput: no disponibles. Al tratarse de un actor de difusion, la latencia de inferencia dependera del numero de pasos de denoising, que la model card no especifica.
- Opciones de despliegue: el formato publicado es un pickle de PyTorch (`policy.pt`), por lo que la carga requiere PyTorch en un entorno de confianza. Las herramientas orientadas a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este artefacto. No se documentan integraciones con ROS, MuJoCo u otros entornos concretos.
- Aviso de seguridad: la propia model card indica que los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en un entorno de confianza.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de los modelos comparables en la informacion proporcionada. La tabla recoge los artefactos relacionados identificados y los campos disponibles.

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mulligan/sim-square-broad-r02-mining-no-cf-divl | Este modelo (critico DIVL) | no disponible | no aplica | 81,25 % de exito medio (5 semillas) | MIT | Publicado en HuggingFace |
| mulligan/sim-square-broad-r02-mining-no-cf-idql | Modelo padre del que se hereda el actor congelado | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada | Publicado en HuggingFace |
| mulligan/sim-square-broad-c02-dagger-mulligan | Conjunto de datos de la misma campana (no es un modelo) | no aplica | no aplica | no aplica | no disponible en la informacion proporcionada | Publicado en HuggingFace |

No se han identificado en la busqueda web alternativas comparables de terceros para esta tarea concreta (tarea simulada `sim-square-broad` dentro de la campana Mulligan).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo, matematicas ni imagenes, y no soporta tool calling ni razonamiento multi-paso en el sentido de un LLM.
- Alcance limitado a la tarea simulada `sim-square-broad`. No hay evidencia publicada de transferencia a un robot real ni de validacion en hardware fisico.
- Dependencia del modelo padre: el actor esta congelado y procede de `sim-square-broad-r02-mining-no-cf-idql`, por lo que las limitaciones de la politica original se heredan intactas; esta publicacion solo aporta el critico DIVL.
- El rendimiento depende fuertemente de los datos: el entrenamiento usa teleoperacion (`c00-teleop-sobol`) y rollouts DAgger de las rondas c01 y c02, de modo que cualquier sesgo presente en esos conjuntos (por ejemplo, el estilo de teleoperacion o las politicas que generaron los rollouts) se refleja en el agente.
- Varianza entre semillas apreciable: 4,02 puntos porcentuales de diferencia entre la mejor (83,30 %) y la peor (79,28 %) semilla, con el mismo paso de entrenamiento y commit. No conviene reportar una unica semilla como resultado representativo.
- Riesgo de sobreajuste al grid de evaluacion: los resultados corresponden a un grid held-out de estados iniciales concreto; el comportamiento fuera de esa distribucion de estados no esta caracterizado.
- Ambiguedad en la metrica publicada: la tabla indica N=32 por semilla y a la vez recuentos sobre 30000, sin explicar la relacion; conviene consultar el dataset de evaluacion antes de citar las cifras.
- Riesgo de seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarse. Deben cargarse solo en entornos de confianza.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, pero sin garantias de ningun tipo. No se documentan restricciones adicionales de uso.
- Idiomas y sesgos linguisticos: no aplica, el modelo no procesa lenguaje natural.
- Limitaciones de contexto: no aplica en el sentido de ventana de tokens; la limitacion equivalente es la distribucion de observaciones de estado vista durante el entrenamiento.
- No hay informacion publicada sobre numero de parametros, cuantizacion, GPU soportadas ni latencia, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-mining-no-cf-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-broad-r02-mining-no-cf-idql
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Pagina del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset DAgger ronda c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mining-no-cf
- Dataset de rollouts de politica c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset DAgger ronda c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mining-no-cf
- Dataset de rollouts de politica c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-mulligan-policy-rollouts
- Dataset relacionado (variante dagger-mulligan): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mulligan
- Listado de conjuntos de datos con la etiqueta sim-square-broad: https://huggingface.co/datasets?other=sim-square-broad
- Nota sobre la busqueda web: el resto de resultados obtenidos (articulos sobre mineria de criptomonedas por parte de agentes de IA, paginas de asistentes de proposito general como Gemini o ChatGPT) no guardan relacion con este modelo y se han descartado. No se han encontrado papers, blogs ni repositorios de terceros especificos para este artefacto.
