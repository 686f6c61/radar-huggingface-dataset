# mulligan/sim-square-broad-r00-sobol-divl

## Resumen

sim-square-broad-r00-sobol-divl es un checkpoint de política (policy) para robótica, no un modelo de lenguaje. Lo publica el autor mulligan dentro del proyecto Mulligan y corresponde a la tarea de simulación `sim-square-broad`, ronda R0, brazo de experimento `sobol` y celda de campaña `sq_d1_r0_ours_sobol`. Es un agente basado en estado (state-based), es decir, consume observaciones de estado del simulador y no imágenes ni texto, que combina el actor de difusión congelado de su modelo padre `sim-square-broad-r00-sobol-idql` con un crítico DIVL de tipo distributional.

El repositorio entrega cinco checkpoints, uno por semilla (`seed-1` a `seed-5`), todos en el paso de entrenamiento 250001 y provenientes de artefactos de Weights & Biases del proyecto `self-improving/square-d1-dagger-mining-01a`. Los ficheros publicados son `policy.pt` (pickle de PyTorch) y `stats.json`, con un tamaño total de repositorio de 1,4 GB, lo que sitúa cada semilla en torno a 280 MB.

Su interés es metodológico y reproducible: documenta un pipeline de self-improving con minería tipo DAgger, actor de difusión congelado y crítico distributional, y acompaña las evaluaciones held-out con 30.000 rollouts por semilla (tasas de éxito entre el 50,95 % y el 55,45 %). No incluye datos de arquitectura de red, número de parámetros ni paper asociado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Actor de difusión congelado (heredado del padre) más crítico DIVL distributional; agente basado en estado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (política de control, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible (solo se publican `policy.pt` y `stats.json`; la model card no indica precisión ni variantes cuantizadas) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`policy.pt`, pickle) más `stats.json` |
| Tarea | sim-square-broad |
| Ronda de modelo | R0 |
| Brazo (arm) | sobol |
| Celda de campaña | `sq_d1_r0_ours_sobol` |
| Semillas incluidas | 5 (seed-1, seed-2, seed-3, seed-4, seed-5) |
| Paso de entrenamiento | 250001 |
| Tamaño del repositorio | 1,4 GB |
| Dataset de entrenamiento | `mulligan/sim-square-broad-c00-teleop-sobol` |
| Modelo padre del actor | `mulligan/sim-square-broad-r00-sobol-idql` |

## Arquitectura y entrenamiento

El agente combina dos componentes: un actor de difusión que se mantiene congelado y procede del modelo hermano `sim-square-broad-r00-sobol-idql`, y un crítico DIVL de tipo distributional que se entrena en esta ronda. Los identificadores de los runs de Weights & Biases (`iql_ddpg_bc_idql_divl_square_d1_...`) sugieren una combinación de técnicas de aprendizaje por imitación y offline RL —IQL, DDPG+BC e IDQL junto con DIVL—, aunque la model card no detalla la composición exacta de la pérdida ni los hiperparámetros. El pipeline de datos corresponde a la campaña `square-d1-dagger-mining-01a`, lo que apunta a un esquema de minería iterativa tipo DAgger sobre el dataset de teleoperación con exploración Sobol `sim-square-broad-c00-teleop-sobol`.

El entrenamiento se detiene en el paso 250001 para las cinco semillas, y cada checkpoint se corresponde con un artefacto final de W&B con su run y commit de Git asociados (commits `551416bff972`, `3053203fc3df`). Los ficheros publicados son copias byte a byte de esos artefactos, verificadas con MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`. No se especifica el número de transiciones del dataset, la composición de estados iniciales de entrenamiento, ni si hubo fases adicionales de RLHF o preferencias, datos que no aplican o no están disponibles.

## Capacidades

- Control de política para la tarea de manipulación simulada `sim-square-broad`, con entrada basada en estado del simulador.
- Ejecución de una política de difusión ya entrenada, aquí acompañada de un crítico distributional para selección o filtrado de acciones en la variante DIVL del agente.
- Evaluación held-out sobre una rejilla de estados iniciales, con resultados publicados por semilla.
- Reproducción de experimentos: cinco semillas independientes con artefactos y commits trazables.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas ni visión.
- No soporta tool calling, function calling ni flujos de agentes multi-paso.
- No tiene capacidades multilingües ni modo de pensamiento (thinking mode); no procesa lenguaje.

## Casos de uso

- Evaluación comparativa de algoritmos de RL offline: el checkpoint DIVL sirve como referencia frente a su padre IDQL sobre la misma tarea y el mismo actor congelado, permitiendo aislar el efecto del crítico distributional.
- Minería iterativa de datos tipo DAgger: el agente puede desplegarse en el simulador para recoger nuevas trayectorias que alimenten la siguiente ronda de entrenamiento de la campaña `square-d1-dagger-mining-01a`.
- Estudio de criticos distributionales: el par `policy.pt` + `stats.json` permite analizar la distribución de retornos estimada y su relación con la tasa de éxito observada.
- Investigación en transferencia sim2real: al ser una política basada en estado y un tamaño de repositorio contenido (unos 280 MB por semilla), es manejable para pruebas de destilación o adaptación a un robot real en laboratorio.
- Reproducibilidad de resultados publicados: las cinco semillas con artefactos W&B y commits concretos permiten replicar las tasas de éxito reportadas y medir varianza entre semillas.
- Docencia y cursos de robótica o RL: el formato PyTorch estándar facilita cargar la política en notebooks para ilustrar difusión aplicada a control y críticos distributionales.
- Pruebas de infraestructura de evaluación: dado que el dataset de evaluación `sim-square-broad-r00-r03-eval` referencia estos checkpoints, sirve para validar herramientas propias de análisis de rollouts y métricas de éxito.

## Benchmarks y rendimiento

Resultados de evaluación held-out publicados en la model card (rejilla de estados iniciales, un fichero por semilla). El campo `N` de la tabla original vale 32 en todas las filas y los éxitos se expresan sobre 30.000; la model card no aclara la relación exacta entre ambos valores, por lo que se reproducen tal cual.

| Semilla | N | Éxitos | Total | Tasa de éxito (calculada) |
|---|---|---|---|---|
| seed-1 | 32 | 15620 | 30000 | 52,07 % |
| seed-2 | 32 | 15284 | 30000 | 50,95 % |
| seed-3 | 32 | 15744 | 30000 | 52,48 % |
| seed-4 | 32 | 15551 | 30000 | 51,84 % |
| seed-5 | 32 | 16635 | 30000 | 55,45 % |
| Total | no aplicable | 78834 | 150000 | 52,56 % |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, ya que el modelo no es un modelo de lenguaje. Tampoco se ofrecen comparaciones numéricas con el modelo padre IDQL ni con otros brazos de la misma campaña.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no indica tamaño de red, precisión ni perfil de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El repositorio de 1,4 GB para cinco semillas implica del orden de 280 MB por semilla, un tamaño compatible con políticas compactas, pero este dato es derivado y no confirma que la inferencia quepa en una GPU concreta.
- Opciones de despliegue: los pesos se cargan como pickles de PyTorch (`policy.pt`) junto a `stats.json`; no se mencionan integraciones con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia equivalentes, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia ni pasos por segundo.
- Requisito adicional: al tratarse de pickles de PyTorch, la carga debe hacerse únicamente en un entorno de confianza.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| mulligan/sim-square-broad-r00-sobol-divl | sim-square-broad | Actor de difusión congelado + crítico DIVL distributional | no disponible | no aplicable | 50,95 %–55,45 % de éxito por semilla | Apache-2.0 | HuggingFace, 5 semillas |
| mulligan/sim-square-broad-r00-sobol-idql | sim-square-broad | Actor de difusión del que procede el padre congelado (IDQL) | no disponible | no aplicable | no disponible | no disponible en la información proporcionada | HuggingFace (referenciado) |
| Otros brazos de la campaña `square-d1-dagger-mining-01a` | sim-square-broad | no disponible | no disponible | no aplicable | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas queda limitada porque la información proporcionada solo describe este checkpoint y su modelo padre. No se dispone de parámetros, contexto ni resultados de modelos de otras familias para contrastar.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no admite tool calling ni flujos de agentes.
- Sesgos conocidos: no documentados en la model card. En robótica, la política refleja la distribución del dataset de teleoperación `sim-square-broad-c00-teleop-sobol`, por lo que puede degradarse fuera de esa distribución de estados.
- Riesgo de alucinación: no aplicable en el sentido de LLM, pero existe riesgo de acciones fuera de distribución ante estados no vistos.
- Limitación de contexto: no aplica una ventana de contexto; el rendimiento depende de la cobertura de la rejilla de estados iniciales evaluada.
- Limitación de idioma: no aplicable; el modelo no procesa texto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card advierte de que los ficheros `.pt` son pickles de PyTorch y deben cargarse solo en entornos de confianza.
- Varianza entre semillas: las tasas de éxito van del 50,95 % al 55,45 %, una horquilla de más de cuatro puntos porcentuales que conviene tener en cuenta al reportar resultados.
- Ambigüedad de la evaluación: la relación entre el campo `N` (32) y el total de 30.000 rollouts no se explica en la model card, lo que dificulta interpretar la métrica.
- Alcance limitado a simulación: no hay evidencia publicada de transferencia a hardware real.
- Sin benchmark externo ni paper: no se han publicado comparaciones con otros algoritmos dentro de la información disponible.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r00-sobol-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-broad-r00-sobol-idql
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Organización en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
