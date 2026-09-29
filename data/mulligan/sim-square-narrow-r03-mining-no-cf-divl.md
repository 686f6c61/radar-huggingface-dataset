# mulligan/sim-square-narrow-r03-mining-no-cf-divl

## Resumen

sim-square-narrow-r03-mining-no-cf-divl es un checkpoint de política para control robótico en simulación, publicado por la organización mulligan dentro del proyecto Mulligan (mulligan.page). No es un modelo de lenguaje: se trata de un agente basado en estado (state-based) que combina el actor de difusión congelado del modelo padre con un crítico DIVL de tipo distribucional. El repositorio contiene los ficheros `policy.pt` y `stats.json` para cinco semillas independientes (seed-1 a seed-5), con un tamano total de repositorio de 1,4 GB, lo que supone aproximadamente 280 MB por semilla.

El modelo resuelve la tarea `sim-square-narrow`, una variante del ensamblaje de tuerca y cuadrado (nut assembly square) en entorno simulado, y corresponde a la ronda R3 del brazo experimental `mining-no-cf`. La celda de campaña asociada es `sq_d0_r3_ours_grid_cell_bonus_b1p0_nocf_human_only` y todos los checkpoints fueron entrenados hasta el paso 150001. El actor congelado procede del modelo hermano `sim-square-narrow-r03-mining-no-cf-idql`, de modo que esta publicación aísla el efecto del crítico DIVL sobre una política ya entrenada.

Su relevancia es fundamentalmente metodológica: permite reproducir y auditar una comparativa entre variantes de aprendizaje por refuerzo offline/offline-to-online (los nombres de los artefactos de W&B hacen referencia a IQL, DDPG+BC, IDQL y DIVL) sobre una misma tarea, con cinco semillas y una evaluación en rejilla de estados iniciales reservados. La licencia es MIT, lo que facilita su reutilización en investigación y en desarrollos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de control con actor de difusión congelado y critico DIVL distribucional (no es un transformer de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable / no disponible (agente basado en estado, no en texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`), acompanado de `stats.json`; un directorio por semilla |
| Tarea | sim-square-narrow (ensamblaje de tuerca y cuadrado en simulacion) |
| Ronda del modelo | R3 |
| Brazo experimental | mining-no-cf |
| Celda de campana | `sq_d0_r3_ours_grid_cell_bonus_b1p0_nocf_human_only` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Commit de entrenamiento | `3053203fc3df` |
| Tamano del repositorio | 1,4 GB (aproximadamente 280 MB por semilla) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

El artefacto es un agente de control compuesto por dos piezas: el actor de difusión heredado del modelo padre `sim-square-narrow-r03-mining-no-cf-idql`, que se mantiene congelado, y un crítico DIVL distribucional entrenado específicamente en esta ronda. Los nombres de los artefactos de W&B empleados como origen (`iql_ddpg_bc_idql_divl_nutassemblysquare_..._final-step-150001`) indican que la familia de entrenamiento combina componentes de IQL, DDPG+BC, IDQL y DIVL sobre la tarea NutAssemblySquare. La model card no detalla la arquitectura interna de la red, el número de parámetros ni la dimensionalidad de las observaciones o acciones, por lo que esos datos figuran como no disponibles.

La receta de datos es iterativa y de tipo DAgger con minería de fallos: el corpus combina teleoperación inicial (`sim-square-narrow-c00-teleop-sobol`), datos minados en tres ciclos sucesivos (`c01`, `c02`, `c03` con etiqueta `dagger-mining-no-cf`) y rollouts de políticas previas (`c01-sobol-policy-rollouts`, `c02-mulligan-policy-rollouts`, `c03-mulligan-policy-rollouts`). El sufijo `no-cf` del brazo sugiere la ausencia de alguna componente de coste o de curriculum que sí estaría presente en otras celdas, aunque la model card no lo especifica. No se documentan detalles sobre el número de transiciones, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no aplicables aquí).

La procedencia está verificada: los ficheros son copias byte a byte de los artefactos de W&B, con MD5 comprobado contra el manifiesto del artefacto y SHA-256 registrado en `release.json`. Los ficheros `.pt` son pickles de PyTorch, por lo que solo deben cargarse en entornos de confianza.

## Capacidades

- Control robótico basado en estado para la tarea sim-square-narrow, con política de difusión para la generación de acciones.
- Ejecución de la política en cinco semillas independientes, lo que permite estudiar la varianza entre inicializaciones.
- Aprendizaje por refuerzo offline y offline-to-online con componente de imitación, según la nomenclatura de los artefactos de entrenamiento (IQL, DDPG+BC, IDQL, DIVL).
- Estimación de valor mediante un crítico DIVL distribucional, que modela la distribución de retornos en lugar de únicamente su media.
- Minería de datos de tipo DAgger: el modelo está pensado para generar rollouts que alimentan ciclos posteriores de entrenamiento.
- Evaluación reproducible sobre una rejilla de estados iniciales reservados (32 estados iniciales por semilla, 8000 rollouts por semilla).
- No dispone de capacidades de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling ni uso como agente conversacional.
- No se documentan capacidades multilingües ni de interacción mediante lenguaje natural.

## Casos de uso

- Investigación en RL offline y offline-to-online: el checkpoint sirve como referencia reproducible para comparar el efecto de un crítico DIVL distribucional frente a otras variantes (por ejemplo, la variante IDQL del mismo brazo) manteniendo el actor congelado, lo que aísla la contribución del crítico.
- Generación de datos de entrenamiento mediante DAgger: la política puede ejecutarse en el simulador para producir rollouts etiquetados que alimenten las siguientes rondas de minería (`c04` y posteriores), tal y como se hizo con los conjuntos `c01`, `c02` y `c03`.
- Evaluación comparativa de algoritmos en un banco de pruebas homogéneo: al publicarse junto al conjunto de evaluación `sim-square-narrow-r00-r03-eval`, permite contrastar brazos experimentales sobre la misma rejilla de estados iniciales y las mismas condiciones.
- Análisis de robustez entre semillas: con cinco semillas y 8000 rollouts por semilla, es posible estudiar la dispersión de la tasa de éxito (del 93,33 % al 96,05 % observados) y decidir qué checkpoint desplegar o analizar.
- Punto de partida para ajuste fino: el actor congelado y el crítico entrenado pueden servir como inicialización para fine-tuning con nuevos datos de teleoperación o con variaciones de la tarea.
- Validación de infraestructura de simulación: los checkpoints permiten verificar que un pipeline de simulación, recolección de rollouts y evaluación reproduce las métricas publicadas, útil antes de escalar campañas más costosas.
- Destilación o compresión de políticas: dado el reducido tamano por semilla (aproximadamente 280 MB), es un candidato razonable para experimentos de destilación hacia políticas más ligeras para despliegue.
- Estudio de sim-to-real con reservas: la tarea de ensamblaje de precisión es un caso de interés en manipulación, pero la model card no documenta ni mide transferencia al mundo real, por lo que cualquier uso en hardware requeriría validación adicional completa.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son las evaluaciones sobre la rejilla de estados iniciales reservados del conjunto `sim-square-narrow-r00-r03-eval`. Cada carpeta de semilla evalúa 32 estados iniciales con un total de 8000 rollouts (250 rollouts por estado inicial).

| Semilla | Estados iniciales (N) | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 8000 | 7466 | 93,33 % |
| seed-2 | 32 | 8000 | 7560 | 94,50 % |
| seed-3 | 32 | 8000 | 7569 | 94,61 % |
| seed-4 | 32 | 8000 | 7620 | 95,25 % |
| seed-5 | 32 | 8000 | 7684 | 96,05 % |
| Media | 32 | 8000 | 7579,8 | 94,75 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje en la informacion disponible, dado que el modelo no pertenece a esa categoria. Tampoco se proporcionan resultados comparativos frente a la variante IDQL del mismo brazo ni frente a otras celdas de la campana.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el numero de parametros ni la huella de memoria del actor o del critico.
- Tamano en disco de referencia: 1,4 GB para el repositorio completo con cinco semillas, aproximadamente 280 MB por semilla entre `policy.pt` y `stats.json`.
- GPU recomendadas: no disponible. No se especifica si la inferencia requiere GPU, ni que modelos se usaron.
- Compatibilidad con GPU de consumo: no disponible. No hay datos que permitan confirmar ni descartar su ejecucion en tarjetas como la RTX 4090.
- Opciones de despliegue: los pesos se distribuyen como pickles de PyTorch, por lo que la carga se realiza con las herramientas habituales de PyTorch. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Entorno de ejecucion: requiere el simulador correspondiente a la tarea sim-square-narrow y el codigo de investigacion de Mulligan en el commit `3053203fc3df` para reproducir el entrenamiento y la evaluacion declarados.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de inferencia ni de velocidad de simulacion.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Semillas | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| sim-square-narrow-r03-mining-no-cf-divl | sim-square-narrow | Actor de difusion congelado + critico DIVL | 5 | MIT | 93,33 % - 96,05 % de exito (8000 rollouts por semilla) |
| sim-square-narrow-r03-mining-no-cf-idql | sim-square-narrow | Variante IDQL (proporciona el actor congelado) | no disponible | no disponible | no disponible |
| Otras celdas de la campana R3 (brazo `mining-no-cf`) | sim-square-narrow | Variantes de la familia IQL / DDPG+BC / IDQL / DIVL | no disponible | no disponible | no disponible |

No se dispone de tablas comparativas con modelos de otras organizaciones para esta tarea en la informacion proporcionada. La unica comparacion posible es interna al proyecto Mulligan, y los resultados numericos publicados solo cubren el presente modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser una politica entrenada con datos de teleoperacion y rollouts propios, heredara las distribuciones de estados y acciones presentes en esos conjuntos, que no se describen en la model card.
- Riesgo de alucinacion: no aplicable en el sentido de los modelos de lenguaje, pero existe el riesgo equivalente de generalizacion incorrecta ante estados iniciales o variaciones de la tarea no cubiertos por la rejilla de evaluacion.
- Ambito restringido: el modelo esta especializado en la tarea `sim-square-narrow`; no se declara transferencia a otras tareas, otras variantes del entorno ni al mundo real.
- Limitaciones de contexto o idioma: no aplicables; el modelo no procesa texto ni lenguaje natural.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion y conservacion del aviso de copyright. No se declaran restricciones adicionales.
- Riesgo de seguridad en la carga de pesos: los ficheros `.pt` son pickles de PyTorch y, tal como advierte la model card, deben cargarse unicamente en entornos de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- Ausencia de datos de despliegue: no se documentan requisitos de hardware, latencia, throughput ni procedimientos de inferencia, lo que dificulta estimar costes de produccion.
- Reproducibilidad parcial: los checkpoints son copias verificadas por MD5 y SHA-256, pero dependen del codigo de investigacion en un commit concreto y del simulador, que no se distribuyen en este repositorio.
- Rendimiento variable entre semillas: la diferencia observada entre la mejor y la peor semilla es de 2,72 puntos porcentuales (96,05 % frente a 93,33 %), por lo que conviene fijar la semilla en cualquier comparacion.
- Descargas y likes nulos: el repositorio no muestra adopcion externa en el momento de la consulta, lo que limita la validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-mining-no-cf-divl
- Modelo padre (actor congelado, variante IDQL): https://huggingface.co/mulligan/sim-square-narrow-r03-mining-no-cf-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de teleoperacion inicial: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset de mineria DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mining-no-cf
- Rollouts de politica c01 (sobol): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset de mineria DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mining-no-cf
- Rollouts de politica c02 (mulligan): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset de mineria DAgger c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mining-no-cf
- Rollouts de politica c03 (mulligan): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Dataset de evaluacion R00-R03: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo, al proyecto Mulligan ni a la tarea sim-square-narrow; los resultados devueltos corresponden a un canal de reacciones de cine y television y no guardan relacion con este modelo.
