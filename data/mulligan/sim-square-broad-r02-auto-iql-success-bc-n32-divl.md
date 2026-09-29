# mulligan/sim-square-broad-r02-auto-iql-success-bc-n32-divl

## Resumen

`mulligan/sim-square-broad-r02-auto-iql-success-bc-n32-divl` es un agente de aprendizaje por refuerzo para robótica, publicado por el proyecto Mulligan, que resuelve la tarea simulada `sim-square-broad`. No es un modelo de lenguaje: se trata de una política basada en estado (no en píxeles ni en texto) que combina un actor de difusión congelado, heredado del modelo padre `sim-square-broad-r02-auto-iql-success-bc-n32-idql`, con un crítico DIVL de tipo distribucional. El artefacto publicado contiene exclusivamente los pesos de la política (`policy.pt`) y sus estadísticas de normalización (`stats.json`), repartidos en cinco carpetas, una por semilla.

El modelo pertenece a la ronda R2 de la campaña `sq_d1_r2_auto_iql_success_bc_n32`, dentro de la familia de experimentos `auto-iql-success-bc-n32`, y se entrenó hasta el paso 250001. La combinación de técnicas que da nombre al brazo (IQL, DDPG, BC, IDQL y DIVL) lo sitúa en la línea de trabajo de RL offline con regularización por imitación y minería de datos tipo DAgger, un área relevante porque permite reutilizar rollouts de políticas previas en lugar de exigir demostraciones humanas nuevas.

Su interés práctico es acotado pero claro: sirve como punto de comparación reproducible frente a otros brazos de la misma campaña y frente a la variante IDQL, con cinco semillas independientes y una evaluación sobre una rejilla de estados iniciales reservada. La licencia MIT y la verificación por MD5/SHA-256 de los artefactos facilitan su uso en investigación, aunque el formato de pesos (pickles de PyTorch) obliga a extremar las precauciones de seguridad al cargarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion congelado (heredado del modelo IDQL padre) mas critico DIVL distribucional; agente de RL basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente basado en estado, no secuencial en texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`), acompanado de `stats.json` |
| Tarea | `sim-square-broad` |
| Ronda de modelo | R2 |
| Brazo / celda de campana | `auto-iql-success-bc-n32` / `sq_d1_r2_auto_iql_success_bc_n32` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Commit de codigo | `3053203fc3df` |
| Modelo padre (actor congelado) | `mulligan/sim-square-broad-r02-auto-iql-success-bc-n32-idql` |
| Tamano del repositorio | 1,4 GB (5 semillas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente es un sistema actor-critico de RL offline. El actor es un modelo de difusión congelado que se importa del modelo padre `sim-square-broad-r02-auto-iql-success-bc-n32-idql`; sobre esa política congelada se anade un critico DIVL distribucional, que estima la distribución de retornos en lugar de un valor escalar. La etiqueta del checkpoint (`iql_ddpg_bc_idql_divl_square_d1_...`) indica que el pipeline de entrenamiento combina IQL (Implicit Q-Learning) para el aprendizaje de valores, DDPG como esquema de actor-critico, behavior cloning (BC) como regularizador de la política, IDQL para el paso de extracción de política por difusión y DIVL para el componente distribucional del critico.

Los datos de entrenamiento proceden de tres conjuntos publicados por el mismo proyecto: `sim-square-broad-c00-teleop-baseline` (demostraciones de teleoperación), `sim-square-broad-c01-auto-iql-n32-policy-rollouts` (rollouts de una política IQL automática) y `sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts` (rollouts filtrados por éxito). No se especifica en la información disponible el número total de transiciones, la composición exacta del dataset ni si hubo fases de RLHF o DPO, algo que en cualquier caso no aplica a un agente robótico basado en estado.

La innovación reseñable es la sustitución del critico estándar por un critico DIVL distribucional manteniendo el actor congelado, lo que permite evaluar el efecto aislado del critico sin reentrenar la política de difusión. El entrenamiento se ejecutó con el código de investigación de Mulligan en el commit `3053203fc3df`, y los ficheros publicados son copias byte a byte de los artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`.

## Capacidades

- Control robótico basado en estado para la tarea simulada `sim-square-broad`, con observaciones de estado (no visión, no lenguaje).
- Generación de acciones mediante política de difusión (actor IDQL congelado).
- Estimación distribucional de retornos mediante el crítico DIVL.
- Evaluación reproducible sobre una rejilla de estados iniciales reservada (held-out initial-state grid).
- Reproducibilidad multi-semilla: cinco checkpoints independientes (semillas 1 a 5) en el mismo paso de entrenamiento.
- Trazabilidad completa de procedencia: artefactos de W&B, ejecuciones, commit de código y sumas de verificación.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingües, de visión, de audio ni de modo "thinking".
- No genera texto, código ni matemáticas.

## Casos de uso

- Investigación en RL offline: sirve como brazo experimental para medir el efecto de un crítico DIVL distribucional sobre un actor de difusión congelado, comparándolo con la variante IDQL del mismo proyecto. La existencia de cinco semillas permite estimar la varianza del método.
- Línea base reproducible en robótica simulada: al fijar el paso 250001 y publicar los tres datasets de entrenamiento, cualquier grupo puede replicar el pipeline y contrastar resultados sobre la misma rejilla de evaluación.
- Minería de datos tipo DAgger: el modelo se apoya en rollouts generados automáticamente y filtrados por éxito, de modo que resulta útil para estudiar cuánto rendimiento se gana al anadir datos de política frente a demostraciones de teleoperación.
- Comparación de brazo dentro de una campana: la celda `sq_d1_r2_auto_iql_success_bc_n32` forma parte de una familia mayor de experimentos; este checkpoint sirve para aislar la contribución del crítico DIVL frente a otras variantes del mismo brazo.
- Evaluación estandarizada en Policy Arena: los resultados por rollout del dataset de evaluación permiten puntuar el agente con las mismas métricas que el resto de políticas del ecosistema Mulligan.
- Estudio de inicialización amplia: la variante "broad" del entorno está pensada para distribuciones de estados iniciales más anchas, por lo que el modelo es adecuado para analizar degradación de éxito cuando aumenta la diversidad de arranques.
- Referencia para pipelines de sim-to-real: en una fase previa a validar hardware real, este agente permite comprobar si una política entrenada solo en simulación produce trayectorias estables antes de asumir el coste de un despliegue físico.
- Docencia y ejemplos de RL offline: el par `policy.pt` + `stats.json` con licencia MIT y verificación de integridad es un material manejable para prácticas de carga de políticas y reproducción de evaluaciones.

## Benchmarks y rendimiento

La model card publica una evaluación sobre rejilla de estados iniciales reservada (held-out initial-state grid), con N = 32 estados por semilla y resultados por rollout en el dataset `sim-square-broad-r00-r03-eval`. Los éxitos por semilla y su porcentaje derivado son:

| Semilla | Dataset de evaluacion | N | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-broad-r00-r03-eval | 32 | 15804/30000 | 52,68 % |
| seed-2 | sim-square-broad-r00-r03-eval | 32 | 15953/30000 | 53,18 % |
| seed-3 | sim-square-broad-r00-r03-eval | 32 | 15611/30000 | 52,04 % |
| seed-4 | sim-square-broad-r00-r03-eval | 32 | 16060/30000 | 53,53 % |
| seed-5 | sim-square-broad-r00-r03-eval | 32 | 15123/30000 | 50,41 % |
| Media | sim-square-broad-r00-r03-eval | 32 | 78551/150000 | 52,37 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes, que además no aplican a un agente robótico) en la información disponible. Tampoco se proporcionan cifras del modelo padre IDQL para comparar directamente en esta ficha.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM, GPU ni latencia en la información disponible.
- El repositorio completo pesa 1,4 GB, lo que repartido entre las cinco semillas supone del orden de 280 MB por checkpoint; como estimación a partir de ese tamaño, la política debería ser lo bastante pequena para cargarse en memoria de una GPU de consumo, pero es una inferencia del tamaño del fichero, no un dato declarado por el autor.
- GPU recomendadas: no disponible. Al ser una política basada en estado de tamano reducido, no requiere aceleradores de datacenter; una GPU de gama media o incluso CPU deberían bastar para la inferencia, aunque no hay confirmación oficial.
- Opciones de despliegue: los pesos son pickles de PyTorch (`.pt`), por lo que el despliegue se realiza cargando el checkpoint con PyTorch en un entorno de confianza. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no aplicables aquí.
- Latencia y throughput estimados: no disponible.
- Seguridad: al tratarse de pickles de PyTorch, deben cargarse únicamente en entornos de confianza, tal como advierte el propio autor.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Critico | Semillas | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|---|
| sim-square-broad-r02-auto-iql-success-bc-n32-divl (este) | sim-square-broad | Actor de difusion congelado + critico DIVL | DIVL distribucional | 5 | 52,37 % de exito medio (78551/150000) | MIT |
| sim-square-broad-r02-auto-iql-success-bc-n32-idql | sim-square-broad | Actor de difusion (IDQL) | No disponible | No disponible | No disponible | No disponible |
| sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts (variante narrow) | sim-square-narrow | Política auto-iql-success-bc-n32 | No disponible | No disponible | No disponible | No disponible |

El parentesco directo con el modelo IDQL permite atribuir cualquier diferencia de rendimiento al crítico DIVL, pero no se dispone de las cifras del padre en la información proporcionada. La variante `sim-square-narrow` corresponde a un entorno distinto (ventana de estados iniciales más estrecha), por lo que no es una comparación limpia de método.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, pero al ser un agente entrenado en simulación hereda las limitaciones del simulador y de la distribución de estados cubierta por los datasets.
- Riesgo de alucinación no aplica en el sentido de los modelos de lenguaje; el riesgo equivalente es la ejecución de acciones no válidas fuera de la distribución de entrenamiento, especialmente con la variante "broad" de estados iniciales.
- La tasa de éxito media es del 52,37 %, lo que implica que cerca de la mitad de los rollouts de evaluación no alcanzan el objetivo; no es un agente listo para producción sin trabajo adicional.
- Solo se publican cinco semillas y una única rejilla de evaluación (N = 32); la varianza entre semillas (50,41 % a 53,53 %) es apreciable y conviene tenerla en cuenta antes de extraer conclusiones de una sola ejecución.
- El modelo está limitado a la tarea `sim-square-broad` y a observaciones de estado; no generaliza a otras tareas ni a entradas visuales o textuales.
- No hay soporte de tool calling, agentes multi-paso, multilingüismo ni generación de texto.
- Los ficheros `.pt` son pickles de PyTorch: cargarlos en un entorno no confiable supone un riesgo de ejecución de código arbitrario.
- La licencia MIT permite uso comercial y modificación, pero no se ofrece ninguna garantía sobre el rendimiento ni sobre la idoneidad para un entorno físico real.
- El repositorio registra 0 descargas y 0 likes, por lo que aún no existe validación independiente por parte de la comunidad.
- No se documenta ningún proceso de validación en hardware real; cualquier uso sim-to-real requeriría una fase de ajuste y verificación de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-auto-iql-success-bc-n32-divl
- Modelo padre (actor congelado, IDQL): https://huggingface.co/mulligan/sim-square-broad-r02-auto-iql-success-bc-n32-idql
- Dataset de demostraciones de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts de política IQL automática: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
- Dataset de rollouts filtrados por éxito: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Listado de datasets con la etiqueta sim-square-broad: https://huggingface.co/datasets?other=sim-square-broad
- Página del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Variante narrow (referencia externa): https://claru.ai/datasets/mulligan-sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts
