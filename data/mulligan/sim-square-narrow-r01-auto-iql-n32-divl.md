# mulligan/sim-square-narrow-r01-auto-iql-n32-divl

## Resumen

sim-square-narrow-r01-auto-iql-n32-divl es un agente de control para robótica basado en estado, publicado por el usuario mulligan dentro del proyecto Mulligan. No es un modelo de lenguaje: su entrada son observaciones de estado y su salida son acciones de control para la tarea simulada sim-square-narrow, que la nomenclatura del proyecto asocia a una tarea de ensamblaje/inserción cuadrada. El artefacto se enmarca en la ronda R1 del brazo auto-iql-n32, celda de campaña `sq_d0_r1_auto_iql_n32`.

Técnicamente, el modelo reutiliza el actor de difusión congelado de su variante padre (sim-square-narrow-r01-auto-iql-n32-idql) y añade un crítico DIVL de tipo distribuido. Se distribuye con cinco semillas (seed-1 a seed-5) en carpetas separadas, todas en el paso de entrenamiento 150001, como ficheros `policy.pt` más `stats.json`, con un tamaño de repositorio de 1,4 GB.

Su relevancia es acotada y de investigación: sirve como referencia reproducible para estudiar críticos distribuidos en aprendizaje por refuerzo offline y por imitación. La evaluación publicada sobre un grid de estados iniciales retenidos suma 29652 éxitos sobre 40000 rollouts (74,13 %) entre las cinco semillas, con una dispersión apreciable entre ellas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente basado en estado; actor de difusión congelado (heredado del modelo padre) y crítico DIVL distribuido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje; la entrada es un vector de estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control, no de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`: `policy.pt`) acompañado de `stats.json` |
| Tarea | sim-square-narrow |
| Ronda del modelo | R1 |
| Brazo / celda de campana | auto-iql-n32 / `sq_d0_r1_auto_iql_n32` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Commit de entrenamiento | `3053203fc3df` |

## Arquitectura y entrenamiento

El modelo es un agente de aprendizaje por refuerzo offline con arquitectura híbrida de dos componentes: un actor de difusión que permanece congelado y se hereda del checkpoint padre, y un crítico DIVL distribuido que es la parte entrenada en esta ronda. Los nombres de los artefactos de W&B asociados (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) apuntan a una línea de trabajo que combina IQL, DDPG, comportamiento condicionado (BC) e IDQL con un crítico DIVL, dentro del proyecto `self-improving/square-dagger-mining-01a`. La model card no detalla el número de parámetros, la dimensionalidad de la observación ni la formulación exacta de la pérdida.

Los datos de entrenamiento declarados son dos conjuntos del propio proyecto: `sim-square-narrow-c00-teleop-baseline` (demostraciones de teleoperación) y `sim-square-narrow-c01-auto-iql-n32-policy-rollouts` (rollouts de política; una fuente externa indica 100 episodios de manipulación simulada). El patrón de nombres del proyecto de W&B sugiere un bucle de agregación de datos tipo DAgger, pero la model card no documenta el número total de transiciones, la composición proporcional del dataset ni si hubo etapas de RLHF o DPO, que en cualquier caso no aplicarían a un agente de control. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones de control para la tarea sim-square-narrow a partir de observaciones de estado (no de imágenes).
- Política de actor de difusión: la acción se obtiene por muestreo difusivo; la model card no especifica el número de pasos de difusión ni la dimensionalidad de la acción.
- Crítico DIVL distribuido para estimación de valor, orientado a entrenamiento y análisis más que a despliegue.
- Cinco checkpoints independientes por semilla, lo que permite analizar varianza de rendimiento entre ejecuciones de entrenamiento.
- Evaluación asociada a un grid de estados iniciales retenidos, con resultados por rollout disponibles en un dataset enlazado.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües (no procesa texto).
- No tiene capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Reproducción de experimentos en RL offline: cargar los cinco checkpoints con el código de investigación de Mulligan en el commit indicado y replicar las tasas de éxito publicadas sobre el grid retenido.
- Baseline para críticos distribuidos: comparar el rendimiento de DIVL frente al crítico del modelo padre IDQL manteniendo el mismo actor congelado, aislando así el efecto del crítico.
- Generación de datos de rollout para agregación tipo DAgger: usar la política para producir nuevas trayectorias que alimenten la siguiente ronda de entrenamiento, como sugiere el dataset c01 del propio proyecto.
- Evaluación comparativa en Policy Arena: someter el checkpoint a evaluaciones estandarizadas del proyecto y contrastarlo con otros brazos y rondas.
- Estudio de varianza entre semillas: aprovechar las cinco carpetas para cuantificar la sensibilidad del entrenamiento a la inicialización aleatoria en una misma celda de campaña.
- Destilación o aceleración de política: emplear el actor de difusión como profesor para entrenar una política más rápida de un solo paso, útil si se busca control en tiempo real en simulación.
- Investigación de transferencia sim-a-real: la tarea encaja con dominios de manipulación del ecosistema robomimic, por lo que el checkpoint puede servir como punto de partida para estudiar la brecha de simulación a robot real.
- Auditoría de artefactos de investigación: verificar la procedencia declarada (copias idénticas a los artefactos de W&B, MD5 comprobado contra el manifiesto y SHA-256 en `release.json`).

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los de la evaluación sobre el grid de estados iniciales retenidos, con el recuento de éxitos por semilla. La columna N figura con valor 32 en la model card; el denominador de éxitos indicado por el autor es 8000 por semilla.

| Semilla | N | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 5940/8000 | 74,25 % |
| seed-2 | 32 | 5821/8000 | 72,76 % |
| seed-3 | 32 | 5591/8000 | 69,89 % |
| seed-4 | 32 | 6138/8000 | 76,73 % |
| seed-5 | 32 | 6162/8000 | 77,03 % |
| Total | 32 | 29652/40000 | 74,13 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos sería aplicable a un agente de control robótico. Tampoco se ofrecen métricas de rendimiento de inferencia (latencia o frecuencia de control).

## Requisitos de hardware

- VRAM para inferencia: no disponible. La model card no documenta el tamaño del actor ni del crítico.
- Estimación orientativa (no confirmada por el autor): con 1,4 GB de repositorio repartidos en cinco semillas, cada checkpoint ronda unas pocas centenas de megabytes, un orden de magnitud habitual en políticas con actor de difusión, lo que en principio permitiría inferencia en CPU o en GPU de gama consumer. Esta cifra es una inferencia a partir del tamaño del repositorio, no un dato publicado.
- GPU recomendadas: no disponibles. El proyecto no publica hardware de entrenamiento ni de evaluación.
- ¿Cabe en GPU consumer? No confirmado, pero por tamaño de checkpoint es plausible; requeriría validación con el código de investigación en el commit `3053203fc3df`.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF/ONNX. El único formato disponible es PyTorch pickle (`.pt`), cargable con PyTorch en un entorno de confianza y con el código de investigación de Mulligan.
- Latencia y throughput: no disponibles. Al tratarse de un actor de difusión, el coste por acción depende del número de pasos de muestreo, dato que no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-narrow-r01-auto-iql-n32-divl (este) | no disponible | no aplica | 74,13 % de exito agregado en 40000 rollouts | MIT | HuggingFace, 5 semillas |
| sim-square-narrow-r01-auto-iql-n32-idql (modelo padre) | no disponible | no aplica | no disponible en la informacion proporcionada | no disponible | HuggingFace |
| Otros brazos del proyecto (por ejemplo, variantes broad o c02/c03) | no disponible | no aplica | no disponible en la informacion proporcionada | no disponible | HuggingFace (organizacion mulligan) |

No se dispone de cifras comparables publicadas para alternativas de la misma categoría dentro de la información proporcionada, por lo que la comparación cuantitativa queda pendiente de los datos de Policy Arena.

## Limitaciones y advertencias

- Formato pickle: los ficheros `.pt` son pickles de PyTorch, que pueden ejecutar código arbitrario al deserializarse. La propia model card advierte de cargarlos únicamente en un entorno de confianza.
- Rendimiento no perfecto: la tasa agregada es del 74,13 %, es decir, aproximadamente uno de cada cuatro rollouts falla en el grid de evaluación retenido.
- Varianza entre semillas: el rango observado va del 69,89 % (seed-3) al 77,03 % (seed-5), una diferencia de más de siete puntos porcentuales atribuible solo a la semilla.
- Especificidad de tarea: el modelo está entrenado para sim-square-narrow y no se documenta capacidad de generalización a otras tareas, variaciones de la escena ni al mundo real.
- Entrada solo de estado: al no usar visión, no puede operar sobre observaciones de cámara sin cambios en la política.
- Dependencia de `stats.json`: la normalización de observaciones y acciones depende de este fichero; usarlo con estadísticas distintas a las del entrenamiento invalida los resultados.
- Licencia MIT para los pesos, que permite uso comercial, pero el código de investigación de Mulligan referenciado no tiene licencia documentada en la información disponible.
- Reproducibilidad ligada a un commit concreto (`3053203fc3df`); otros commits pueden cambiar el comportamiento de carga o evaluación.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta.
- No aplican sesgos lingüísticos ni riesgo de alucinación en el sentido de los modelos de lenguaje, pero sí existe el riesgo habitual de sobreajuste al conjunto de evaluación y de fallo silencioso en estados fuera de distribución.
- Los resultados de la búsqueda web sobre el término "Mulligan" devuelven mayoritariamente un producto de automatización para seguros sin relación con este proyecto, por lo que no aportan datos adicionales verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-auto-iql-n32-divl
- Modelo padre (IDQL): https://huggingface.co/mulligan/sim-square-narrow-r01-auto-iql-n32-idql
- Dataset de teleoperación base: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Organizacion mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Listado de datasets con la etiqueta sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
- Ficha externa del dataset c01 (claru.ai): https://claru.ai/datasets/mulligan-sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Framework robomimic (referencia del ecosistema de tareas de manipulacion): https://robomimic.github.io/
- Paper de robomimic: no disponible en la informacion proporcionada
