# mulligan/sim-square-narrow-r01-auto-iql-success-bc-n32-idql

## Resumen

`mulligan/sim-square-narrow-r01-auto-iql-success-bc-n32-idql` es un agente de aprendizaje por refuerzo offline para control robótico, publicado por el proyecto Mulligan dentro de su colección de artefactos de investigación. No es un modelo de lenguaje: es una política de control entrenada para la tarea de simulación `sim-square-narrow` (ensamblaje de una pieza cuadrada en un entorno estrecho, según la nomenclatura del repositorio y los nombres de los artefactos de Weights & Biases, que referencian `nutassemblysquare`). El modelo se distribuye como un checkpoint de PyTorch (`policy.pt`) junto con los normalizadores de observaciones en `stats.json`.

Técnicamente se trata de un agente IDQL (*Implicit Diffusion Q-Learning*): un actor de difusión para generar acciones emparejado con un crítico IQL escalar, según la propia model card. El identificador del brazo experimental, `auto-iql-success-bc-n32`, sugiere un ciclo de recogida de datos automática guiado por el crítico IQL, filtrado por éxito y con un componente de *behavior cloning* sobre `n32` (presumiblemente 32 estados iniciales o 32 políticas de rollout); esta interpretación es una inferencia a partir de la nomenclatura, no un dato confirmado por el autor.

Su relevancia actual es fundamentalmente metodológica: forma parte de la ronda R1 de una campaña de comparación de métodos de recogida de datos para aprendizaje en robot (*Performance-Guided Data Collection for Efficient On-Robot Learning*, según el sitio del proyecto), con 5 semillas independientes entrenadas hasta el paso 150001 y evaluadas sobre una rejilla de estados iniciales retenida. Con 0 descargas y 0 likes en el momento de la consulta, su valor es el de un artefacto de reproducibilidad más que el de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión con crítico IQL escalar, sobre observaciones de estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones de estado por paso) |
| Tipos de cuantizacion | no disponible (se distribuye un checkpoint PyTorch; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, serializado como pickle) + `stats.json` con los normalizadores |
| Tarea | sim-square-narrow |
| Ronda de modelo | R1 |
| Brazo experimental | auto-iql-success-bc-n32 |
| Celda de campana | `sq_d0_r1_auto_iql_success_bc_n32` |
| Semillas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1.4 GB (5 semillas; ~280 MB por semilla derivado del total) |
| Commit de entrenamiento | `0247c00f6c52` |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: un actor de difusión que modela la distribución de acciones y un crítico IQL escalar que estima valores con regresión por expectil, lo que permite aprender políticas expresivas a partir de datos offline sin necesidad de consultar el entorno durante el ajuste del crítico. La model card lo describe explícitamente como "state-based IDQL agent: diffusion actor with scalar IQL critic", es decir, la entrada son observaciones de estado (no imágenes). El sufijo `bc` del brazo apunta a un término de *behavior cloning* en el objetivo de entrenamiento, y `success` a un filtrado por éxito en la recogida de datos.

El entrenamiento se realizó con el código de investigación de Mulligan en el commit `0247c00f6c52`, durante 150001 pasos, sobre dos conjuntos de datos: `sim-square-narrow-c00-teleop-baseline` (demostraciones de teleoperación) y `sim-square-narrow-c01-auto-iql-n32-policy-rollouts` (rollouts de una política IQL previa). El pipeline es, por tanto, iterativo: se entrena una política, se despliega para generar nuevos rollouts, se filtran por éxito y se reentrena. No se documentan en la información disponible el número de tokens (no aplica), la composición exacta del dataset (`n32` no se desglosa), ni si se empleó RLHF o DPO (no aplica a este dominio).

Los cinco checkpoints son copias byte a byte de artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`.

| Carpeta | Artefacto W&B de origen | Run |
|---|---|---|
| `seed-1` | `iql_ddpg_bc_idql_nutassemblysquare_20260824_184456_655768-final-step-150001:v0` | `square-dagger-mining-01a/jw3x9d0s` |
| `seed-2` | `iql_ddpg_bc_idql_nutassemblysquare_20260824_184456_363076-final-step-150001:v0` | `square-dagger-mining-01a/bp9ytjqb` |
| `seed-3` | `iql_ddpg_bc_idql_nutassemblysquare_20260824_184456_469907-final-step-150001:v0` | `square-dagger-mining-01a/q4o40ew6` |
| `seed-4` | `iql_ddpg_bc_idql_nutassemblysquare_20260824_184505_098279-final-step-150001:v0` | `square-dagger-mining-01a/fzazh6lc` |
| `seed-5` | `iql_ddpg_bc_idql_nutassemblysquare_20260824_184506_345517-final-step-150001:v0` | `square-dagger-mining-01a/40a4g01l` |

## Capacidades

- Generación de acciones de control continuo para la tarea de simulación `sim-square-narrow`, a partir de observaciones de estado.
- Aprendizaje por refuerzo offline: la política se puede evaluar y ajustar sin interacción con el entorno durante el entrenamiento del crítico.
- Política de difusión: modela una distribución multimodal de acciones, en lugar de una única acción determinista.
- Cinco semillas independientes publicadas, lo que permite análisis de varianza entre semillas y ensembles de políticas.
- Compatibilidad con el pipeline de recogida de datos de Mulligan: la propia política puede generar rollouts que alimentan la siguiente ronda (`c02-auto-iql-success-bc-n32-policy-rollouts` referencia estos checkpoints).
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso simbólico, agentes basados en lenguaje ni planificación de tareas en lenguaje natural.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito: es un controlador de estado.
- No incluye tokenizador ni vocabulario.

## Casos de uso

- Reproducción de resultados de investigación en RL offline: cargar `policy.pt` de cada semilla con los normalizadores de `stats.json` permite replicar exactamente la evaluación sobre la rejilla de estados iniciales retenida y verificar la tasa de éxito publicada.
- Línea base en comparativas de recogida de datos guiada por rendimiento: el brazo `auto-iql-success-bc-n32` sirve como referencia frente a otras rondas (R0-R3) y otros brazos de la misma campaña en el entorno `sim-square-narrow`.
- Generación de datos para la siguiente iteración: la política puede desplegarse en simulación para producir rollouts etiquetados por éxito, que se filtran y se incorporan al dataset de entrenamiento (el propio repositorio referencia el dataset `c02` de la ronda siguiente).
- Análisis de robustez entre semillas: con cinco checkpoints entrenados con el mismo protocolo, se puede estudiar la dispersión de la tasa de éxito (de 5645/8000 a 5984/8000) y decidir si conviene un ensemble.
- Selección de políticas en un banco de evaluación: la colección Mulligan publica evaluaciones en Policy Arena, de modo que este checkpoint puede integrarse en ese circuito de comparación estandarizada.
- Estudio de métodos de aprendizaje offline para manipulación: al ser un agente IDQL sobre estados, es un punto de partida controlado para probar variantes de crítico, de actor de difusión o de filtrado por éxito.
- Investigación en sim-to-real: aunque no se documenta transferencia al robot real en esta ficha, el proyecto Mulligan declara evaluaciones con robot ciego (*blinded robot evaluations*), por lo que el checkpoint puede usarse como política preentrenada en simulación antes de un ajuste en hardware.

## Benchmarks y rendimiento

Los únicos resultados publicados son las evaluaciones sobre una rejilla de estados iniciales retenida, con los resultados por rollout en el dataset `sim-square-narrow-r00-r03-eval`. La columna de porcentaje es una media aritmética calculada a partir de los recuentos de la model card.

| Semilla | N | Éxitos | Total de rollouts | Tasa de éxito |
|---|---|---|---|---|
| seed-1 | 32 | 5984 | 8000 | 74,80 % |
| seed-2 | 32 | 5862 | 8000 | 73,28 % |
| seed-3 | 32 | 5645 | 8000 | 70,56 % |
| seed-4 | 32 | 5915 | 8000 | 73,94 % |
| seed-5 | 32 | 5872 | 8000 | 73,40 % |
| Media (calculada) | 32 | 29278 | 40000 | 73,20 % |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de control robótico). La model card no detalla el desglose de los 8000 rollouts por semilla; una lectura plausible es 32 estados iniciales por 250 rollouts, pero no está confirmada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica requisitos de hardware.
- GPU recomendadas: no disponible. Al tratarse de una política sobre observaciones de estado (sin visión ni lenguaje), es plausible que quepa en GPUs de gama consumer o incluso en CPU, pero esto es una inferencia general y no un dato confirmado para este checkpoint.
- Compatibilidad con GPU consumer: no confirmada. El tamaño del repositorio (1,4 GB para cinco semillas, unos 280 MB por semilla como valor derivado) incluye pesos y posiblemente estado del optimizador, por lo que no permite deducir directamente la huella de inferencia.
- Opciones de despliegue: no disponible. No se documenta integración con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de control. El artefacto es un checkpoint PyTorch que requiere el código de investigación de Mulligan en el commit `0247c00f6c52` para reconstruir la política.
- Latencia y throughput: no disponible. No se publican mediciones de frecuencia de control ni de tiempo de inferencia por paso.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada. Los artefactos comparables más cercanos son otras variantes de la misma campaña, para las que tampoco se publican métricas en esta ficha.

| Modelo | Tarea | Ronda | Semillas | Tasa de éxito publicada | Licencia |
|---|---|---|---|---|---|
| sim-square-narrow-r01-auto-iql-success-bc-n32-idql (este) | sim-square-narrow | R1 | 5 | 70,56 % - 74,80 % | MIT |
| Otras rondas de sim-square-narrow (R0-R3) | sim-square-narrow | R0-R3 | no disponible | no disponible | no disponible |
| sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts | sim-square-broad | — | — | no disponible (dataset de rollouts, no política) | no disponible |
| Cualquier otro agente IDQL comparable | — | — | — | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, y en este dominio el concepto aplica a sesgos de distribución de datos (por ejemplo, cobertura limitada de estados iniciales) más que a sesgos sociales.
- Riesgo de alucinación: no aplica en el sentido de los modelos generativos de texto, pero sí existe riesgo de generalización fuera de distribución: la política puede producir acciones no válidas en estados no cubiertos por los datasets de entrenamiento.
- Limitaciones de contexto o idioma: no aplica. El modelo consume observaciones de estado de un solo paso y no procesa lenguaje natural; no tiene ventana de contexto.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución y sin garantía. Conviene revisar igualmente las licencias de los datasets de origen (`sim-square-narrow-c00-teleop-baseline` y `sim-square-narrow-c01-auto-iql-n32-policy-rollouts`) y del simulador utilizado.
- Seguridad del artefacto: los ficheros `.pt` son *pickles* de PyTorch, tal como advierte la propia model card. Deben cargarse únicamente en entornos de confianza, ya que la deserialización de un pickle puede ejecutar código arbitrario.
- Entorno de validación: las evaluaciones son en simulación sobre una rejilla de estados iniciales retenida. No se documenta rendimiento en robot real para este checkpoint concreto.
- Reproducibilidad: requiere el código de investigación de Mulligan en el commit `0247c00f6c52`; no se distribuye un script de inferencia autónomo en la información disponible.
- Adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Variabilidad: la tasa de éxito oscila entre el 70,56 % y el 74,80 % según la semilla, una horquilla de más de cuatro puntos porcentuales que conviene tener en cuenta antes de fijar expectativas de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-auto-iql-success-bc-n32-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de entrenamiento (teleoperación): https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de entrenamiento (rollouts IQL): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset referenciado por metadatos (rollouts del brazo): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-iql-success-bc-n32-policy-rollouts
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Página del proyecto Mulligan: https://mulligan.page/
- Policy Arena (evaluaciones): https://arena.mulligan.page/
- Listado de datasets con la etiqueta sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
- Ficha de un dataset relacionado en Claru: https://claru.ai/datasets/mulligan-sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts
- Dataset sim-square-broad-c02 (variante amplia): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
