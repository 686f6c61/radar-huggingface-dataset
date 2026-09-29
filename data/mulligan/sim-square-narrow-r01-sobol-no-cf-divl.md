# mulligan/sim-square-narrow-r01-sobol-no-cf-divl

## Resumen

sim-square-narrow-r01-sobol-no-cf-divl es un agente de aprendizaje por refuerzo (RL) basado en estado, desarrollado por el proyecto Mulligan dentro de su campana de evaluacion de politicas roboticas. Se trata de un agente que reutiliza el actor de difusion congelado de su modelo padre (sim-square-narrow-r01-sobol-no-cf-idql) y sustituye el critico por un critico DIVL de tipo distribucional. El resultado se distribuye como cinco checkpoints PyTorch (uno por semilla) mas un fichero de estadisticas de normalizacion.

El modelo resuelve una tarea de manipulacion simulada denominada sim-square-narrow, y su publicacion forma parte de la ronda R1 del brazo sobol-no-cf de la celda de campana sq_d0_r1_ours_sobol_nocf_human_only. No es un modelo de lenguaje: no procesa texto ni imagenes, sino observaciones de estado, y su metrica de exito se mide en rollouts dentro del simulador. Por tanto, conceptos como contexto, cuantizacion o idiomas no aplican.

Su relevancia es metodologica: permite comparar de forma controlada el efecto del critico DIVL frente al critico IDQL del modelo padre, manteniendo el actor congelado y variando unicamente el componente de evaluacion de valor. Cada checkpoint procede de un artefacto de Weights & Biases verificado por MD5 y SHA-256, con cinco semillas independientes, lo que facilita analisis de varianza entre semillas en un mismo entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente RL basado en estado; actor de difusion (congelado, heredado del modelo padre) mas critico DIVL distribucional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones de estado por paso) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch de precision completa, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | PyTorch (`policy.pt`) mas `stats.json`; ficheros `.pt` son pickles de PyTorch |
| Tarea | sim-square-narrow |
| Ronda de modelo | R1 |
| Brazo experimental | sobol-no-cf |
| Celda de campana | `sq_d0_r1_ours_sobol_nocf_human_only` |
| Paso de entrenamiento | 150001 |
| Semillas publicadas | 1, 2, 3, 4, 5 |
| Modelo padre (actor congelado) | mulligan/sim-square-narrow-r01-sobol-no-cf-idql |
| Tamano del repositorio | 1,4 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-29 |
| Fecha de actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

El agente combina dos componentes: un actor de difusion congelado, heredado del modelo sim-square-narrow-r01-sobol-no-cf-idql, y un critico DIVL de tipo distribucional entrenado especificamente para este modelo. La nomenclatura de los artefactos de origen (`iql_ddpg_bc_idql_divl_nutassemblysquare`) indica que la canalizacion de entrenamiento integra varias tecnicas de RL offline y aprendizaje por imitacion: IQL, DDPG+BC, IDQL y DIVL. Los registros de entrenamiento se detuvieron en el paso 150001 en las cinco semillas.

Los datos de entrenamiento proceden de tres conjuntos publicados por el propio proyecto: sim-square-narrow-c00-teleop-sobol (demostraciones de teleoperacion), sim-square-narrow-c01-dagger-sobol-no-cf (datos agregados mediante DAgger sin contrafactuales) y sim-square-narrow-c01-sobol-policy-rollouts (rollouts de politica). La celda de campana incluye el sufijo `human_only`, lo que sugiere que el entrenamiento se realizo solo con datos de origen humano. Los checkpoints son copias identicas byte a byte de los artefactos de W&B, con MD5 verificado contra el manifiesto del artefacto y SHA-256 registrado en `release.json`.

No se documenta en la informacion disponible el numero de tokens o transiciones, la composicion exacta del dataset, ni detalles de la innovacion tecnica del critico DIVL mas alla de su caracter distribucional.

## Capacidades

- Control de manipulacion en simulacion para la tarea sim-square-narrow, a partir de observaciones de estado (sin percepcion visual).
- Generacion de acciones mediante un actor de difusion, lo que permite muestreo multimodal de acciones.
- Evaluacion de valor mediante critico DIVL distribucional, orientada a estimar la distribucion del retorno en lugar de solo su media.
- Capacidad de servir como referencia multi-semilla (5 semillas) para analisis de varianza en experimentos de RL offline.
- Generacion de rollouts de politica reutilizables como datos de entrenamiento (documentados en sim-square-narrow-c01-sobol-policy-rollouts).
- No soporta tool calling, function calling ni agentes multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues, de vision, de audio ni de modo de razonamiento explicito.

## Casos de uso

- Investigacion comparativa de criticos en RL offline: al compartir actor congelado con el modelo padre, permite aislar el efecto del critico DIVL frente al critico IDQL en la misma tarea y con las mismas semillas.
- Benchmark interno de manipulacion tipo ensamblaje: los identificadores de los runs de origen hacen referencia a `nutassemblysquare`, por lo que el modelo es adecuado para experimentos de ajuste de piezas cuadradas en simulador.
- Generacion de datos sinteticos para DAgger: los rollouts de politica derivados de este agente alimentan el conjunto sim-square-narrow-c01-sobol-policy-rollouts, util para ampliar la cobertura de estados de una politica base.
- Analisis de robustez ante condiciones iniciales: la evaluacion se realiza sobre una rejilla de estados iniciales reservados, lo que permite medir sensibilidad a la posicion de partida.
- Estudio de reproducibilidad: cada semilla procede de un artefacto W&B con run y commit Git identificados, lo que facilita replicar exactamente el experimento.
- Transferencia sim-to-real como hipotesis de trabajo: una politica de estado entrenada en simulacion puede servir de punto de partida para ajuste posterior en un entorno real, aunque no se aportan resultados de transferencia en la informacion disponible.
- Linea base en campanas de auto-mejora: el modelo forma parte de una campana (`self-improving`) con rondas sucesivas, por lo que puede usarse como referencia contra la que medir rondas posteriores.

## Benchmarks y rendimiento

La model card publica una unica evaluacion, realizada sobre una rejilla de estados iniciales reservados. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, y tales metricas no aplican a un agente de control.

| Semilla | Conjunto de evaluacion | N | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-narrow-r00-r03-eval | 32 | 7072/8000 | 88,40 % |
| seed-2 | sim-square-narrow-r00-r03-eval | 32 | 7183/8000 | 89,79 % |
| seed-3 | sim-square-narrow-r00-r03-eval | 32 | 7266/8000 | 90,83 % |
| seed-4 | sim-square-narrow-r00-r03-eval | 32 | 7100/8000 | 88,75 % |
| seed-5 | sim-square-narrow-r00-r03-eval | 32 | 7215/8000 | 90,19 % |

Media aritmetica de las cinco semillas: 7167,2/8000, equivalente a un 89,59 % de exito. Desviacion entre la mejor y la peor semilla: 2,43 puntos porcentuales (88,40 % frente a 90,83 %). No se proporcionan intervalos de confianza ni resultados de modelos de referencia en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica requisitos de hardware.
- El agente consume observaciones de estado, no imagenes, por lo que la carga de inferencia recae sobre el actor de difusion y el critico, de menor coste que una politica con codificador visual.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no confirmado; dado que no hay componente de vision y el actor es una red de difusion sobre estados, es plausible su ejecucion en GPU de gama media o incluso en CPU, pero la informacion disponible no lo verifica.
- Tamano del repositorio completo: 1,4 GB para cinco semillas, lo que supone aproximadamente 280 MB por semilla incluyendo `policy.pt` y `stats.json`.
- Opciones de despliegue: el modelo se entrena y evalua con el codigo de investigacion de Mulligan; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada. La unica comparacion documentada es interna a la propia campana:

| Modelo | Tarea | Actor | Critico | Licencia | Metricas publicadas |
|---|---|---|---|---|---|
| sim-square-narrow-r01-sobol-no-cf-divl | sim-square-narrow | Difusion congelado (heredado) | DIVL distribucional | MIT | 5 semillas, 88,40-90,83 % de exito |
| sim-square-narrow-r01-sobol-no-cf-idql | sim-square-narrow | Difusion congelado (origen del actor) | IDQL (inferido por el nombre) | no disponible | no disponible |

No se identifican en la busqueda web modelos comparables de terceros para la tarea sim-square-narrow.

## Limitaciones y advertencias

- Los ficheros `.pt` son pickles de PyTorch; el propio autor advierte que deben cargarse unicamente en un entorno de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion externa de la comunidad.
- Las metricas publicadas provienen de una rejilla de estados iniciales reservados del propio proyecto; no existe evaluacion independiente ni comparacion con lineas base externas.
- El margen entre la mejor y la peor semilla es de 2,43 puntos porcentuales, lo que indica sensibilidad no despreciable al azar de inicializacion.
- No hay informacion sobre sesgos, pero al ser un agente de control en simulacion el riesgo relevante no es el sesgo linguistico sino el sobreajuste a la distribucion del simulador y a la tarea concreta.
- Riesgo de alucinacion: no aplica en el sentido habitual; el riesgo analogo es la generacion de acciones no validas o fuera de distribucion ante estados no vistos.
- Limitaciones de contexto e idioma: no aplica; el modelo no procesa lenguaje natural.
- La licencia MIT del artefacto permite uso comercial, pero no se especifica la licencia del codigo de investigacion de Mulligan necesario para ejecutarlo.
- Los checkpoints estan vinculados a commits de Git concretos (`3053203fc3df`); reproducir el entrenamiento puede requerir ese estado exacto del codigo.
- Las fechas de creacion y actualizacion son del 29 de septiembre de 2026, con menos de un minuto entre ambas, lo que sugiere una publicacion automatizada sin curacion manual posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-sobol-no-cf-divl
- Modelo padre (actor congelado, IDQL): https://huggingface.co/mulligan/sim-square-narrow-r01-sobol-no-cf-idql
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset DAgger: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-sobol-no-cf
- Dataset de rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
