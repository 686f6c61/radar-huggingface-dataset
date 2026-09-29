# mulligan/sim-square-narrow-r02-auto-iql-success-bc-n32-divl

## Resumen

`mulligan/sim-square-narrow-r02-auto-iql-success-bc-n32-divl` es un agente de control robótico basado en estado (state-based), no un modelo de lenguaje. Lo publica la organización `mulligan` como parte del banco de pruebas Mulligan y corresponde a la ronda R2 (R2) de la campaña `sq_d0_r2_auto_iql_success_bc_n32` sobre la tarea de simulación `sim-square-narrow` (ensamblaje tipo inserción de pieza cuadrada, en la familia de tareas NutAssemblySquare). El artefacto contiene un actor de difusión congelado, heredado del checkpoint `sim-square-narrow-r02-auto-iql-success-bc-n32-idql`, junto con un crítico distributional DIVL entrenado en esta ronda.

El problema que resuelve es el de aprender una política de manipulación a partir de datos offline y de rollouts generados automáticamente, sin interacción humana adicional durante esta fase: el entrenamiento combina IQL, DDPG+BC, IDQL y DIVL, según la nomenclatura de los artefactos de W&B (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`). Se publican cinco semillas independientes (seed-1 a seed-5), cada una con su propio `policy.pt` y `stats.json`, todas entrenadas hasta el paso 150001.

Su relevancia es metodológica: permite reproducir y auditar la aportación de un crítico distributional (DIVL) sobre un actor de difusión congelado, con trazabilidad completa (artefactos de W&B, commit de Git y verificación MD5/SHA-256) y una rejilla de evaluación held-out de estados iniciales. El repositorio ocupa 1,4 GB para las cinco semillas y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Actor de difusión (diffusion policy) congelado + crítico distributional DIVL; familia de algoritmos IQL / DDPG+BC / IDQL / DIVL |
| Parámetros totales | no disponible (no se publica el recuento; repositorio de 1,4 GB con 5 semillas) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de control con observaciones de estado; no hay ventana de contexto) |
| Tipos de cuantización | no disponible (se publican checkpoints `.pt` en el formato de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (pickle), acompañados de `stats.json`; metadatos de release en `release.json` |
| Tarea | `sim-square-narrow` (ensamblaje en simulación) |
| Ronda del modelo | R2 |
| Brazo (arm) | `auto-iql-success-bc-n32` |
| Celda de campaña | `sq_d0_r2_auto_iql_success_bc_n32` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Checkpoint del actor | congelado, procedente de `sim-square-narrow-r02-auto-iql-success-bc-n32-idql` |
| Commit de entrenamiento | `3053203fc3df` |
| Tamaño del repositorio | 1,4 GB |
| Pipeline (HuggingFace) | robotics |
| Autor | mulligan |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-29 |

## Arquitectura y entrenamiento

El agente se compone de dos piezas. Por un lado, un actor de difusión congelado: la política genera acciones mediante un proceso de muestreo generativo (denoising iterativo), tal y como indica la model card al describirlo como «frozen diffusion actor». Por otro, un crítico DIVL de tipo distributional, que es la parte efectivamente aprendida en esta ronda R2. La model card no especifica el tamaño de red, el número de pasos de difusión ni la dimensión de las observaciones, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó con el código de investigación de Mulligan en el commit `3053203fc3df`, hasta el paso 150001, en cinco semillas. Los nombres de los artefactos de W&B (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) indican la combinación de aprendizaje Q implícito (IQL), aprendizaje actor-crítico determinista con regularización por comportamiento (DDPG+BC), política de difusión con IQL (IDQL) y el crítico DIVL. Los datos de entrenamiento declarados son tres conjuntos: `sim-square-narrow-c00-teleop-baseline` (teleoperación base), `sim-square-narrow-c01-auto-iql-n32-policy-rollouts` (rollouts de política automática) y `sim-square-narrow-c02-auto-iql-success-bc-n32-policy-rollouts` (rollouts filtrados por éxito). No se detalla en la información disponible el número de transiciones, la composición exacta del dataset ni si se aplicaron fases de RLHF/DPO (categorías que, por otra parte, no aplican a un agente de control).

Como elemento de reproducibilidad, la model card indica que los ficheros son copias byte a byte de los artefactos de W&B, con verificación MD5 contra el manifiesto del artefacto y SHA-256 registrado en `release.json`.

## Capacidades

- Control robótico de ensamblaje: ejecuta la tarea `sim-square-narrow` a partir de observaciones de estado (state-based), generando acciones continuas mediante el actor de difusión.
- Política generativa de acciones: el actor de difusión permite representar distribuciones multimodales de acción, en lugar de una única acción determinista por estado.
- Estimación de valor distributional: el crítico DIVL modela una distribución del retorno, no solo su media, lo que habilita evaluación y filtrado de trayectorias por valor.
- Ejecución multi-semilla: se publican cinco políticas independientes entrenadas con la misma receta, lo que permite medir varianza entre semillas y, opcionalmente, usarlas como conjunto.
- Compatibilidad con pipelines de auto-entrenamiento: el artefacto está pensado para generar nuevos rollouts de política que alimenten fases posteriores de la campaña (minería tipo DAgger).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni comportamiento de agente conversacional.
- No dispone de capacidades multilingües: no procesa ni genera texto.
- No dispone de visión, audio ni modalidad de pensamiento explícita: las observaciones son de estado, no píxeles.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación offline: cargar `policy.pt` y `stats.json` de cada semilla y reejecutar la rejilla de evaluación held-out para verificar las tasas de éxito publicadas (entre el 71,75 % y el 75,60 % según semilla).
- Ablación de críticos: comparar el crítico DIVL de esta ronda con el crítico IDQL de la ronda padre (`sim-square-narrow-r02-auto-iql-success-bc-n32-idql`) manteniendo el actor congelado, para aislar la contribución del componente distributional.
- Generación de datos de entrenamiento: usar la política para producir rollouts dirigidos a los conjuntos `sim-square-narrow-c0x-...-policy-rollouts`, que después se filtran por éxito y se reutilizan en fases posteriores de la campaña.
- Estudio de robustez ante condiciones iniciales: explotar la rejilla held-out de estados iniciales y los 8000 rollouts por semilla para caracterizar en qué configuraciones geométricas falla el ensamblaje.
- Análisis de varianza entre semillas: cuantificar la dispersión de rendimiento (29432 éxitos sobre 40000 rollouts en agregado, 73,58 %) para dimensionar cuántas semillas hacen falta antes de dar por buena una mejora en la campaña.
- Punto de partida para transferencia: inicializar o destilar políticas para variantes de la tarea (por ejemplo, `sim-square-narrow` en otras rondas o configuraciones de holgura distintas) reutilizando el actor de difusión congelado.
- Validación de infraestructura de evaluación: emplear estos checkpoints como referencia fija para probar arneses de simulación, registro en W&B y trazabilidad de artefactos antes de escalar a otras tareas de ensamblaje.
- Docencia y experimentación en offline RL: por su licencia MIT y su tamaño contenido, sirve como ejemplo ejecutable de un pipeline IQL/IDQL con crítico distributional.

## Benchmarks y rendimiento

La model card publica resultados de evaluación sobre una rejilla held-out de estados iniciales, con `N = 32` por semilla y 8000 rollouts evaluados por semilla (40000 en total), sobre el conjunto `sim-square-narrow-r00-r03-eval`.

| Semilla | N | Éxitos | Rollouts | Tasa de éxito |
|---|---|---|---|---|
| seed-1 | 32 | 5837 | 8000 | 72,96 % |
| seed-2 | 32 | 6048 | 8000 | 75,60 % |
| seed-3 | 32 | 5969 | 8000 | 74,61 % |
| seed-4 | 32 | 5838 | 8000 | 72,98 % |
| seed-5 | 32 | 5740 | 8000 | 71,75 % |
| Agregado | 160 | 29432 | 40000 | 73,58 % |

Las tasas de éxito y el agregado son cálculos aritméticos a partir de los recuentos publicados; no se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible (no hay cifras de MMLU, HumanEval o GSM8K, que además no aplican a este tipo de artefacto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican mediciones de memoria ni de cómputo.
- GPU recomendadas: no disponible. El repositorio ocupa 1,4 GB para cinco semillas (del orden de 280 MB por semilla si se reparte por igual; valor derivado del tamaño del repositorio, no confirmado por el autor).
- Encaje en GPU de consumo: no documentado. El tamaño del artefacto es reducido en comparación con un modelo de lenguaje, pero la viabilidad depende del tamaño de red y del número de pasos de difusión, que no se especifican.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a una política de control). La vía prevista es el código de investigación de Mulligan en el commit `3053203fc3df`, con PyTorch.
- Latencia y throughput: no disponibles. Cabe señalar que un actor de difusión implica un proceso de muestreo iterativo por acción, lo que típicamente incrementa el coste de inferencia frente a una política determinista de un solo paso, pero no se aportan cifras medidas.
- Seguridad en la carga: los ficheros `.pt` son pickles de PyTorch; la model card advierte explícitamente de cargarlos solo en entornos de confianza.

## Comparativa con modelos similares

No se han publicado métricas comparables para otras políticas de la misma categoría en la información disponible. La comparación más directa posible es interna a la propia campaña, y se limita a la procedencia del actor, ya que no se aportan tasas de éxito de los modelos alternativos.

| Artefacto | Relación | Arquitectura | Semillas | Paso | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| `sim-square-narrow-r02-auto-iql-success-bc-n32-divl` (este) | Ronda R2 con crítico DIVL | Actor de difusión congelado + crítico DIVL | 1-5 | 150001 | MIT | 71,75 %-75,60 % por semilla |
| `sim-square-narrow-r02-auto-iql-success-bc-n32-idql` | Padre del actor congelado | Actor de difusión + crítico IDQL | no disponible | no disponible | MIT (según repositorio público) | no disponible |
| `sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts` | Conjunto de rollouts de una variante equivalente | no aplica (dataset, 100 episodios de observaciones de estado) | no aplica | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito restringido: es una política específica para la tarea `sim-square-narrow` en simulación; no generaliza a otras tareas sin reentrenamiento o adaptación.
- Observaciones de estado: no procesa imágenes ni otra modalidad perceptiva, lo que limita su traslado directo a un robot real sin un pipeline de estimación de estado.
- Brecha sim-a-real: no se aportan evidencias de transferencia a hardware físico; los resultados son exclusivamente de simulación.
- Varianza entre semillas apreciable: el rendimiento oscila entre el 71,75 % y el 75,60 % (una diferencia de casi 4 puntos porcentuales), por lo que comparaciones entre rondas deberían hacerse con varias semillas y con intervalos de confianza.
- Riesgo de sobreajuste a la rejilla de evaluación: los resultados provienen de una rejilla held-out de estados iniciales concreta; no se documenta su cobertura respecto a la distribución completa de la tarea.
- Sin datos de sesgo: no se han publicado análisis de sesgo, y su naturaleza (control robótico) hace que las categorías habituales de sesgo lingüístico no sean aplicables.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; sí existe riesgo de fallo silencioso en la ejecución de la política (acciones plausibles que no completan el ensamblaje).
- Licencia: MIT, que permite uso comercial y modificación, siempre que se conserve el aviso de copyright y la licencia. Hay que verificar las licencias de los conjuntos de datos enlazados, que no se detallan en esta información.
- Seguridad de los pesos: los `.pt` son pickles de PyTorch; deben cargarse únicamente en entornos de confianza y, preferiblemente, tras verificar los hashes MD5/SHA-256 registrados en `release.json`.
- Reproducibilidad dependiente de infraestructura externa: la procedencia apunta a artefactos de Weights & Biases y a un commit concreto; sin acceso a W&B y a ese commit no es posible reentrenar de forma idéntica.
- Idiomas: no aplica; el artefacto no procesa lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-auto-iql-success-bc-n32-divl
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organización de datasets de Mulligan: https://huggingface.co/mulligan
- Checkpoint padre del actor congelado: https://huggingface.co/mulligan/sim-square-narrow-r02-auto-iql-success-bc-n32-idql
- Dataset de entrenamiento (teleoperación base): https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de entrenamiento (rollouts de política automática): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset de entrenamiento (rollouts filtrados por éxito): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-iql-success-bc-n32-policy-rollouts
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Búsqueda de datasets de la familia sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
- Ficha de un dataset relacionado en claru.ai: https://claru.ai/datasets/mulligan-sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts
