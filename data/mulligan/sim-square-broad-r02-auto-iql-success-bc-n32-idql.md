# mulligan/sim-square-broad-r02-auto-iql-success-bc-n32-idql

## Resumen

`sim-square-broad-r02-auto-iql-success-bc-n32-idql` es un agente de aprendizaje por refuerzo offline para robótica, publicado por el usuario `mulligan` dentro del proyecto Mulligan. No es un modelo de lenguaje: es una política de control entrenada con el algoritmo IDQL (Implicit Diffusion Q-Learning), compuesta por un actor de difusión y un crítico IQL escalar. El checkpoint se distribuye como `policy.pt` (PyTorch) junto con `stats.json`, que contiene los normalizadores de observaciones y acciones.

El agente resuelve la tarea `sim-square-broad`, una variante amplia de manipulación de un cuadrado en simulación, en su segunda ronda de iteración (R2) y con el brazo de entrenamiento `auto-iql-success-bc-n32`. Los pesos son copias byte a byte de artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`, lo que aporta trazabilidad completa del entrenamiento.

Su relevancia es metodológica: forma parte de un pipeline de auto-mejora (DAgger + minería de datos + behavior cloning sobre rollouts exitosos) cuyos resultados de evaluación se publican de forma abierta, semilla a semilla, permitiendo reproducibilidad y comparación entre rondas de un mismo benchmark.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión con crítico IQL escalar (política basada en estado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje, la política consume observaciones de estado del entorno |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a un agente de control robótico) |
| Licencia | MIT |
| Formato de pesos | `policy.pt` (checkpoint PyTorch, serializado con pickle) y `stats.json` (normalizadores) |
| Tarea | `sim-square-broad` (manipulación de cuadrado en simulación) |
| Ronda del modelo | R2 |
| Brazo / celda de campaña | `auto-iql-success-bc-n32` / `sq_d1_r2_auto_iql_success_bc_n32` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamaño del repositorio | 1,4 GB (cinco semillas) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La arquitectura es IDQL: un actor generativo de tipo difusión que modela la distribución de acciones y un crítico escalar entrenado con Implicit Q-Learning. Al ser una política basada en estado (`state-based`), las entradas son observaciones del entorno simulado, no píxeles ni texto. Cada una de las cinco carpetas del repositorio corresponde a una semilla distinta y contiene el checkpoint del paso 250001, además de los normalizadores en `stats.json`.

El entrenamiento sigue un esquema de auto-mejora por rondas. La campaña parte de datos de teleoperación (`sim-square-broad-c00-teleop-baseline`), sobre los que se generan rollouts con una política auto-IQL (`sim-square-broad-c01-auto-iql-n32-policy-rollouts`) y, después, rollouts filtrados por éxito sobre los que se aplica behavior cloning (`sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts`). Los `tags` del modelo citan `dagger-mining` en los nombres de los runs de origen, lo que indica minería de datos tipo DAgger. Cada checkpoint está vinculado a un artefacto de W&B y a un commit de Git concretos, con hashes MD5 y SHA-256 verificados. No se especifican en la información disponible el número de tokens ni la composición detallada de los datos.

## Capacidades

- Control robótico en simulación: genera acciones motrices para la tarea `sim-square-broad` a partir de observaciones de estado.
- Aprendizaje por refuerzo offline: la política se ha entrenado a partir de datasets de transiciones, sin interacción adicional con el entorno durante el entrenamiento.
- Política multimodal: al usar un actor de difusión, puede representar distribuciones de acción multimodales en lugar de una única acción media.
- Auto-mejora iterativa: el artefacto forma parte de un ciclo DAgger con minería de rollouts exitosos y behavior cloning posterior.
- Reproducibilidad por semillas: se publican cinco semillas independientes (1 a 5) con el mismo paso de entrenamiento, lo que permite medir varianza entre inicializaciones.
- Trazabilidad de procedencia: cada checkpoint está ligado a un artefacto de W&B, un run y un commit de Git.
- No soporta tool calling, function calling, agentes basados en texto, ni capacidades multilingües, de visión o de audio: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Investigación en RL offline: reproducir el experimento con las cinco semillas publicadas para estudiar la varianza entre inicializaciones en la tarea `sim-square-broad`.
- Comparación de rondas de auto-mejora: usar este agente de R2 como referencia frente a los artefactos de otras rondas evaluados en `sim-square-broad-r00-r03-eval`.
- Generación de datos de entrenamiento: desplegar la política para producir nuevos rollouts y alimentar la siguiente ronda del ciclo DAgger, tal como se hizo con los datasets c01 y c02.
- Estudio de behavior cloning filtrado por éxito: analizar cómo el filtrado por éxito aguas arriba (datasets con sufijo `success-bc`) afecta al rendimiento del agente final.
- Evaluación estandarizada en robótica: emplear el grid de estados iniciales held-out y el protocolo de 30000 rollouts por semilla para medir tasas de éxito comparables.
- Auditoría de reproducibilidad: verificar los hashes MD5 y SHA-256 de `policy.pt` frente a los manifiestos de W&B y los commits listados, como caso de estudio de procedencia de artefactos de ML.
- Integración en simuladores de manipulación: cargar `policy.pt` junto con `stats.json` para ejecutar la política en el entorno `sim-square-broad` dentro de un bucle de control por pasos.

## Benchmarks y rendimiento

La model card publica los resultados de evaluación sobre el grid de estados iniciales held-out del dataset `sim-square-broad-r00-r03-eval`. Cada semilla reporta el número de éxitos sobre 30000 evaluaciones y un valor `N` de 32.

| Semilla | N | Éxitos | Tasa de éxito |
|---|---|---|---|
| seed-1 | 32 | 15771 / 30000 | 52,57 % |
| seed-2 | 32 | 15896 / 30000 | 52,99 % |
| seed-3 | 32 | 15446 / 30000 | 51,49 % |
| seed-4 | 32 | 16059 / 30000 | 53,53 % |
| seed-5 | 32 | 15096 / 30000 | 50,32 % |
| Media (5 semillas) | 32 | 78268 / 150000 | 52,18 % |

El rango entre semillas va del 50,32 % al 53,53 %, una dispersión aproximada de 3,2 puntos porcentuales. No se han publicado en la información disponible resultados de benchmarks estándar de RL (por ejemplo, D4RL) ni comparaciones numéricas con otros brazos o rondas de la misma campaña.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM ni GPU recomendadas en la información disponible.
- Naturaleza del artefacto: al tratarse de una política basada en estado (no de un modelo de lenguaje), el checkpoint es un conjunto de pesos de redes neuronales de tamaño moderado; el repositorio completo de cinco semillas ocupa 1,4 GB.
- Despliegue: carga mediante PyTorch con el código de investigación de Mulligan, en los commits indicados (`e0e8738b039c`, `0142f6e95e9f`, `cd30bd0748c7`, `46c9f8c65b3e`, `9d3edb4aca91`).
- No aplican servidores de inferencia para LLM como vLLM, TGI, llama.cpp u Ollama, ni formatos GGUF o cuantizaciones de tipo Q4_K_M.
- Latencia y throughput: no disponibles.
- Advertencia de seguridad: los archivos `.pt` son pickles de PyTorch y la propia model card recomienda cargarlos únicamente en un entorno de confianza.

## Comparativa con modelos similares

| Modelo o artefacto | Tarea | Ronda | Brazo | Semillas | Tasa de éxito | Licencia |
|---|---|---|---|---|---|---|
| `sim-square-broad-r02-auto-iql-success-bc-n32-idql` | sim-square-broad | R2 | auto-iql-success-bc-n32 | 5 | 50,32 % - 53,53 % | MIT |
| Otras rondas de sim-square-broad (r00, r01, r03) | sim-square-broad | r00-r03 | no disponible | no disponible | no disponible en la información proporcionada | no disponible |
| Campaign cell `sq_d1_r2_auto_iql_success_bc_n32` | sim-square-broad | R2 | auto-iql-success-bc-n32 | 5 | misma celda que este modelo | MIT (según este release) |

El dataset de evaluación `sim-square-broad-r00-r03-eval` cubre las rondas r00 a r03, lo que indica la existencia de artefactos comparables en el mismo benchmark, pero la información disponible no incluye sus métricas, parámetros ni licencias. Tampoco se proporcionan comparaciones con políticas de referencia externas al proyecto Mulligan.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente para la tarea `sim-square-broad`; no es transferible a otras tareas sin reentrenamiento.
- Entorno simulado: el entrenamiento y la evaluación se realizan en simulación, por lo que no hay evidencia de transferencia a un robot físico (sim-to-real).
- Rendimiento moderado: la tasa de éxito media ronda el 52 %, es decir, aproximadamente la mitad de los rollouts fallan.
- Varianza entre semillas: la dispersión observada (50,32 % - 53,53 %) implica que el rendimiento depende de la inicialización; conviene reportar intervalos, no un único valor.
- Formato pickle: los archivos `.pt` pueden ejecutar código arbitrario al deserializarse; cárguelos solo en entornos de confianza, tal como advierte la model card.
- Naturaleza de la evaluación: los resultados de la tabla de evaluación son 30000 rollouts por semilla con `N` = 32, sin que la información disponible detalle la métrica exacta de éxito ni el protocolo estadístico.
- Ausencia de datos de sesgo, alucinación o idioma: no aplican, dado que no es un modelo generativo de lenguaje.
- Licencia MIT: permite uso comercial y modificación, pero el código de investigación asociado y los datasets enlazados pueden tener condiciones propias que no se detallan en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-auto-iql-success-bc-n32-idql
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organización en HuggingFace: https://huggingface.co/mulligan
- Dataset de entrenamiento (teleoperación base): https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de entrenamiento (rollouts auto-IQL n32): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
- Dataset de entrenamiento (rollouts auto-IQL success-bc n32): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Dataset referenciado en metadatos (rollouts auto-IQL success-bc n32, c03): https://huggingface.co/datasets/mulligan/sim-square-broad-c03-auto-iql-success-bc-n32-policy-rollouts
- Dataset de evaluación r00-r03: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Vista de datos del dataset c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts/viewer
- Ficha del dataset c02 en Claru: https://claru.ai/datasets/mulligan-sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
