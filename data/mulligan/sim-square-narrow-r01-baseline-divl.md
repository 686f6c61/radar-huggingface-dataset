# mulligan/sim-square-narrow-r01-baseline-divl

## Resumen

`mulligan/sim-square-narrow-r01-baseline-divl` es un agente de aprendizaje por refuerzo (RL) para robótica, publicado por el proyecto Mulligan en HuggingFace. No es un modelo de lenguaje: se trata de una política de control entrenada sobre observaciones de estado (no visión) para la tarea de manipulación simulada `sim-square-narrow`, y se distribuye como cinco checkpoints independientes (uno por semilla) más un fichero de estadísticas de normalización. El modelo pertenece a la ronda R1, brazo `baseline`, celda de campaña `sq_d0_r1_baseline_uniform_nocf_human_only`, y corresponde al paso de entrenamiento 150001.

La arquitectura combina un actor de difusión congelado, heredado del modelo padre `sim-square-narrow-r01-baseline-idql`, con un crítico distributional DIVL entrenado sobre ese actor fijo. Es decir, la parte generativa de la política no se reentrena: lo que se aprende en esta ronda es el componente de valor/crítica, lo que lo convierte en un artefacto de investigación para comparar variantes de crítica dentro de un mismo pipeline de datos.

Su relevancia es acotada y muy específica: sirve como punto de referencia reproducible (5 semillas, seed-1 a seed-5, commit `3053203fc3df`) para investigar métodos de RL offline/off-policy combinados con políticas de difusión en tareas de ensamblaje estrecho, y está pensado para ser evaluado dentro de la infraestructura de Mulligan (Policy Arena) más que para despliegue directo en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL basado en estado con actor de difusion congelado y critico distributional DIVL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observaciones de estado por paso) |
| Tipos de cuantizacion | no aplica (no se distribuyen variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`), acompanado de `stats.json` y `release.json`; safetensors no disponible |
| Tamano del repo | 1,4 GB (5 semillas, aproximadamente 280 MB por semilla) |
| Tarea | `sim-square-narrow` |
| Ronda / brazo | R1 / baseline |
| Celda de campana | `sq_d0_r1_baseline_uniform_nocf_human_only` |
| Semillas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 150001 |
| Modelo padre (actor congelado) | `mulligan/sim-square-narrow-r01-baseline-idql` |

## Arquitectura y entrenamiento

El modelo es un agente de RL basado en estado. La política (actor) es una política de difusión que no se modifica en esta ronda: se importa congelada desde `sim-square-narrow-r01-baseline-idql`. Sobre esa política fija se entrena un crítico *distributional* DIVL, cuyo cometido es estimar la distribución de retornos en lugar de un valor puntual. El artefacto publicado contiene por tanto los pesos del crítico entrenado (`policy.pt`) y las estadísticas asociadas (`stats.json`). La model card no detalla el número de parámetros, la dimensión de las observaciones ni la configuración de la red de difusión, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó con el código de investigación de Mulligan en el commit `3053203fc3df`, a partir de cinco artefactos de Weights & Biases correspondientes a la ejecución `self-improving/square-dagger-mining-01a` (prefijo `iql_ddpg_bc_idql_divl_nutassemblysquare_...`). Los datos de entrenamiento son tres conjuntos de la organización `mulligan`: `sim-square-narrow-c00-teleop-baseline` (teleoperación humana), `sim-square-narrow-c01-baseline-policy-rollouts` (100 episodios de rollouts de la política base) y `sim-square-narrow-c01-dagger-baseline` (agregación de datos tipo DAgger). El prefijo de los artefactos sugiere que el pipeline integra componentes IQL, DDPG, BC e IDQL; la model card no desglosa la contribución exacta de cada uno. Los ficheros publicados son copias byte a byte de los artefactos de W&B, verificadas por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`.

No se documenta en la información disponible si hubo RLHF, DPO ni ninguna fase de ajuste con preferencias humanas, algo que en cualquier caso no aplica a un agente de control.

## Capacidades

- Control robótico basado en estado para la tarea simulada `sim-square-narrow` (manipulación de precisión, presumiblemente ensamblaje en espacio estrecho; los nombres de artefacto de W&B incluyen la referencia `nutassemblysquare`).
- Ejecución de políticas de difusión para generación de acciones multimodal, dado que el actor subyacente es una política de difusión.
- Estimación de valor distributional mediante el crítico DIVL entrenado, útil para investigación sobre funciones de valor y no solo para actuar.
- Reproducibilidad multi-semilla: cinco checkpoints independientes permiten medir varianza entre semillas en la misma celda experimental.
- No soporta tool calling ni function calling.
- No soporta uso como agente conversacional ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües, de visión ni de audio: la entrada es estado, no imágenes ni texto.
- No dispone de modo de razonamiento explícito (*thinking*) ni de decodificación especulativa.

## Casos de uso

- Investigación en RL offline y off-policy: el modelo sirve como punto de comparación fijo (brazo `baseline`, paso 150001, 5 semillas) frente a otras variantes de crítica o de ronda dentro de la misma campaña experimental.
- Estudio de críticos distributional: al mantener el actor congelado, cualquier diferencia de rendimiento observada entre variantes puede atribuirse al componente de valor, lo que aísla la variable experimental.
- Generación de datos sintéticos de manipulación: los rollouts de la política pueden registrarse como nuevos datasets de entrenamiento, siguiendo el patrón de `sim-square-narrow-c01-baseline-policy-rollouts`, que contiene 100 episodios.
- Canal de agregación tipo DAgger: el agente puede desplegarse en simulación para recoger estados visitados por la política y alimentar el conjunto `sim-square-narrow-c01-dagger-baseline`.
- Evaluación comparativa en Policy Arena: los checkpoints están pensados para publicarse y medirse en la arena de evaluaciones de Mulligan, con rejilla de estados iniciales retenidos.
- Reproducción de experimentos: el commit, los identificadores de ejecución de W&B y los hashes permiten replicar exactamente el entrenamiento y la evaluación.
- Docencia y prototipado en robótica: al ser un agente basado en estado, es más ligero de ejecutar que una política visual, lo que facilita experimentos en máquinas sin GPU dedicada (sujeto a verificación empírica, ya que no se publican requisitos).

## Benchmarks y rendimiento

Los únicos resultados publicados son los de la evaluación interna sobre una rejilla de estados iniciales retenidos, con 32 estados por semilla y 8000 rollouts por semilla. El conjunto de evaluación es `mulligan/sim-square-narrow-r00-r03-eval`.

| Semilla | Estados iniciales (N) | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | 32 | 8000 | 6512 | 81,40 % |
| seed-2 | 32 | 8000 | 6961 | 87,01 % |
| seed-3 | 32 | 8000 | 6828 | 85,35 % |
| seed-4 | 32 | 8000 | 6953 | 86,91 % |
| seed-5 | 32 | 8000 | 7038 | 87,98 % |
| Media (5 semillas) | 32 | 40000 | 34292 | 85,73 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO o RoboMimic de referencia) en la información disponible. Tampoco se ofrece comparación numérica contra el modelo padre `sim-square-narrow-r01-baseline-idql` en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el tamaño del actor ni del crítico.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El repo completo ocupa 1,4 GB repartidos en 5 semillas (aproximadamente 280 MB por semilla), y al ser un agente basado en estado es plausible que quepa en GPU de gama media o incluso en CPU, pero esto no está confirmado por el autor y debe verificarse antes de asumirlo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia. Los checkpoints se cargan con PyTorch, y la evaluación se realizó con el código de investigación de Mulligan.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control ni de pasos por segundo.
- Advertencia de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch; deben cargarse únicamente en entornos de confianza, tal como indica el propio autor.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Semillas | Exitos publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mulligan/sim-square-narrow-r01-baseline-divl` | sim-square-narrow | Actor de difusion congelado + critico DIVL | 5 | 34292/40000 (85,73 %) | MIT | HuggingFace (este repo) |
| `mulligan/sim-square-narrow-r01-baseline-idql` | sim-square-narrow | Actor de difusion + critico IDQL (modelo padre) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma campaña (otras celdas, brazos o rondas) ni de sus métricas, por lo que la comparativa numérica queda limitada al par padre-hijo descrito. La comparación con alternativas externas de robótica (por ejemplo, políticas de difusión publicadas para robosuite o RoboMimic) no puede hacerse con rigor porque no se publican parámetros ni métricas homogéneas en la documentación disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un agente entrenado en simulación, cabe esperar un sesgo hacia la distribución de estados de los datos de teleoperación y de los rollouts de la política base, pero el autor no documenta análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos de lenguaje; el riesgo equivalente es la generación de acciones fuera de distribución, no cuantificado en la información disponible.
- Generalización: el modelo está entrenado para una única tarea (`sim-square-narrow`) en simulación. No hay evidencia publicada de transferencia a otras tareas ni de sim-to-real.
- Idiomas y contexto: no aplica, el modelo no procesa lenguaje ni tiene ventana de contexto en el sentido de los LLM.
- Licencia: MIT, lo que permite uso comercial y modificación, pero no se ofrece ninguna garantía ni soporte por parte del autor.
- Estado de publicación: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se referencia ningún paper asociado. Es un artefacto de investigación, no un modelo validado para producción.
- Carga segura: los ficheros `.pt` son pickles; cargarlos implica ejecución de código arbitrario si el fichero fuese manipulado.
- Fechas de los artefactos: los checkpoints llevan marca temporal de septiembre de 2026 en las ejecuciones de W&B y el repositorio se creó el 29 de septiembre de 2026; conviene verificar la vigencia del pipeline y del código en el commit indicado.
- Metodología de evaluación: la tasa de éxito se mide sobre una rejilla fija de 32 estados iniciales retenidos. No es directamente extrapolable al rendimiento en una distribución amplia de condiciones iniciales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-baseline-divl
- Modelo padre (actor congelado, IDQL): https://huggingface.co/mulligan/sim-square-narrow-r01-baseline-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de la politica base: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- Dataset de agregacion DAgger: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset relacionado (rondas posteriores): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Ficha externa del dataset de rollouts en Claru: https://claru.ai/datasets/mulligan-sim-square-narrow-c01-baseline-policy-rollouts
- Listado de datasets con la etiqueta `sim-square-narrow`: https://huggingface.co/datasets?other=sim-square-narrow
- Paper citado en la busqueda sobre politicas estrechas en VLA (referencia externa, no asociada directamente a este modelo): https://arxiv.org/abs/2603.06049
