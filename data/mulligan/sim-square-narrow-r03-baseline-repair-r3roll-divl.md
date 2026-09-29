# mulligan/sim-square-narrow-r03-baseline-repair-r3roll-divl

## Resumen

sim-square-narrow-r03-baseline-repair-r3roll-divl es un agente de control robótico basado en estado publicado por el proyecto Mulligan (organización `mulligan` en Hugging Face). No es un modelo de lenguaje: es una política entrenada para la tarea de simulación `sim-square-narrow` (variante estrecha del ensamblaje de pieza cuadrada tipo NutAssemblySquare de robomimic). El artefacto contiene el actor de difusión congelado heredado del modelo padre y un crítico DIVL de tipo distribucional, distribuidos como `policy.pt` y `stats.json`.

El modelo pertenece a la ronda R3 del brazo `baseline-repair-r3roll` y se ha publicado con cinco semillas independientes (carpetas `seed-1` a `seed-5`), todas entrenadas hasta el paso 150001 y procedentes de artefactos de Weights & Biases del proyecto `self-improving/square-dagger-mining-01a` (commit `3053203fc3df`). La celda de campaña asociada es `sq_d0_r3_repair_baseline_uniform_nocf_human_only_r3roll`, lo que indica un régimen de entrenamiento con datos humanos únicamente, sin contrafactuales y con agregación uniforme.

Su relevancia es metodológica más que de producto: sirve como baseline reproducible y auditado para comparar variantes de crítico (DIVL frente al actor IDQL del modelo padre) sobre un mismo actor congelado, con un protocolo de evaluación de rejilla de estados iniciales retenidos y entre 7.526 y 7.655 éxitos sobre 8.000 rollouts por semilla. El repositorio ocupa 1,4 GB y se publica bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente actor-critico basado en estado: actor de difusion congelado (heredado del modelo padre) mas critico DIVL distribucional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el estado de entrada es la observacion de la tarea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`, ficheros `policy.pt`) mas `stats.json`; no se publican safetensors ni GGUF |
| Tarea | `sim-square-narrow` |
| Ronda del modelo | R3 |
| Brazo | `baseline-repair-r3roll` |
| Celda de campana | `sq_d0_r3_repair_baseline_uniform_nocf_human_only_r3roll` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Commit de entrenamiento | `3053203fc3df` |
| Actor congelado | procedente de `mulligan/sim-square-narrow-r03-baseline-repair-r3roll-idql` |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes. Por un lado, un actor de difusión congelado que se hereda del modelo `sim-square-narrow-r03-baseline-repair-r3roll-idql`; por otro, un crítico DIVL de tipo distribucional entrenado en esta ronda. La nomenclatura de los artefactos de origen (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) sugiere una cadena de entrenamiento que parte de IQL y DDPG+BC, pasa por IDQL (actor de difusión con selección de acciones por crítico) y añade la variante DIVL sobre el mismo actor. La model card no detalla la topología interna del actor ni del crítico, el número de parámetros ni la dimensionalidad de las capas, por lo que esos datos no están disponibles.

El entrenamiento se realizó hasta el paso 150001 sobre siete conjuntos de datos: teleoperación base (`sim-square-narrow-c00-teleop-baseline`), rollouts de política base de las campañas c01, c02 y c03, y conjuntos DAgger de las campañas c01, c02 y c03. El régimen declarado por la celda de campaña es `uniform_nocf_human_only`: agregación uniforme de datos, sin contrafactuales y con datos humanos únicamente como fuente de demostración. No se documentan en la información disponible el número total de transiciones, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Control robótico basado en estado para la tarea de ensamblaje `sim-square-narrow` en simulación.
- Generación de acciones mediante un actor de difusión, con selección de acción guiada por el crítico DIVL.
- Estimación de valor distribucional a través del crítico DIVL, que modela la distribución del retorno en lugar de solo su media.
- Reproducibilidad multi-semilla: se publican cinco semillas entrenadas de forma independiente bajo la misma configuración.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes multi-paso: es una política de control, no un modelo fundacional.
- No se declara soporte multilingüe ni ninguna capacidad lingüística.

## Casos de uso

- Baseline de referencia en investigación sobre aprendizaje por imitación: sirve para medir la ganancia de un crítico distribucional DIVL frente al crítico del modelo padre IDQL manteniendo el actor congelado, lo que aísla el efecto de la variante de crítico.
- Evaluación comparativa de algoritmos offline-to-online: los rollouts de política y los conjuntos DAgger de las campañas c01, c02 y c03 permiten reconstruir el efecto de cada ronda de agregación de datos sobre el rendimiento final.
- Estudio de robustez entre semillas: al publicarse cinco semillas con el mismo presupuesto de entrenamiento (paso 150001), se puede cuantificar la varianza de éxito (de 7.526 a 7.655 éxitos sobre 8.000) atribuible únicamente a la inicialización.
- Reproducción de experimentos: los artefactos son copias byte a byte de los artefactos de W&B, con MD5 verificado contra el manifiesto y SHA-256 registrado en `release.json`, lo que permite replicar exactamente una evaluación publicada.
- Punto de partida para ajuste fino en la misma tarea: al estar el actor congelado y ser el crítico el componente entrenado, el repositorio es un candidato natural para experimentos de recambio de crítico o de reparación de política (`baseline-repair`).
- Docencia y divulgación sobre políticas de difusión: el tamaño contenido del repositorio (1,4 GB para cinco semillas) y la licencia MIT facilitan su uso en cursos y prácticas de robótica simulada.
- Integración en bucles de evaluación automatizada de simulación: el agente puede ejecutarse sobre rejillas de estados iniciales retenidos para obtener tasas de éxito comparables entre variantes.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son los de la evaluación en rejilla de estados iniciales retenidos (`sim-square-narrow-r00-r03-eval`), con resultados por rollout en el conjunto de datos enlazado. Cada carpeta de semilla evalúa 32 estados iniciales con 8.000 rollouts.

| Semilla | Estados iniciales (N) | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 7566/8000 | 94,58 % |
| seed-2 | 32 | 7655/8000 | 95,69 % |
| seed-3 | 32 | 7526/8000 | 94,08 % |
| seed-4 | 32 | 7579/8000 | 94,74 % |
| seed-5 | 32 | 7632/8000 | 95,40 % |
| Agregado (5 semillas) | 160 | 37958/40000 | 94,90 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ni comparaciones numéricas con otros brazos o rondas en la propia model card.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia derivada del tamaño del repositorio (1,4 GB para cinco semillas, es decir, del orden de cientos de MB por semilla incluyendo actor y crítico), cabe esperar que el checkpoint individual sea pequeño y que la inferencia sea viable en GPU de gama de consumo e incluso en CPU, pero se trata de una estimación y no de un dato publicado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño del artefacto, es plausible en tarjetas con 8 GB o menos de VRAM, siempre que el framework de inferencia lo permita.
- Opciones de despliegue: no se documenta ninguna integración con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a este tipo de política. La única ruta de carga documentada es PyTorch, mediante la lectura de `policy.pt` junto con `stats.json`, y en un entorno de confianza (los ficheros `.pt` son pickles de PyTorch).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Actor | Critico | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-narrow-r03-baseline-repair-r3roll-divl (este) | `sim-square-narrow` | Difusion congelado (heredado) | DIVL distribucional | no aplica | MIT | Hugging Face, 5 semillas |
| sim-square-narrow-r03-baseline-repair-r3roll-idql | `sim-square-narrow` | Difusion (origen del actor congelado) | IDQL | no aplica | no disponible en la informacion proporcionada | Hugging Face |
| Otras variantes de la campana R3 (`sim-square-narrow-c01/c02/c03`) | `sim-square-narrow` | no disponible | no disponible | no aplica | MIT (dataset c03-mulligan-policy-rollouts declarado apache-2.0) | Hugging Face (conjuntos de datos) |

No se dispone de parámetros, contexto ni métricas comparables de terceros para establecer una comparativa con modelos externos al proyecto Mulligan.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor en la información disponible.
- Riesgo de fallo: la tasa de éxito agregada es del 94,90 %, lo que implica aproximadamente un 5,1 % de rollouts fallidos; en tareas de ensamblaje esto puede traducirse en colisiones o en estados irrecuperables.
- Especialización estrecha: el agente está entrenado exclusivamente para la tarea `sim-square-narrow` en simulación; no se ha validado su transferencia a otros objetos, otras variantes de la tarea ni a un robot real (no se documenta ninguna evaluación sim-to-real).
- Sin capacidades lingüísticas ni multimodales: no procesa texto, imágenes ni audio; la observación es el estado de la simulación.
- Dependencia de `stats.json`: la normalización del estado y de las acciones está definida en ese fichero, por lo que su omisión o sustitución invalida la política.
- Riesgo de seguridad al cargar: la model card advierte explícitamente de que los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en un entorno de confianza.
- Licencia: MIT, permisiva y compatible con uso comercial; el autor no impone restricciones adicionales en la información disponible.
- Reproducibilidad dependiente de terceros: los artefactos provienen de W&B y los datos de entrenamiento de conjuntos alojados en Hugging Face; la disponibilidad futura de esos recursos condiciona la reproducción.
- Advertencia de procedencia: se indica que los ficheros son copias byte a byte verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 en `release.json`; cualquier edición posterior rompería esa garantía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulligan/sim-square-narrow-r03-baseline-repair-r3roll-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-narrow-r03-baseline-repair-r3roll-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organización en Hugging Face: https://huggingface.co/mulligan
- Conjunto de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperación base: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Rollouts de política c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Rollouts de política c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-baseline-policy-rollouts
- DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-baseline
- Rollouts de política c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-baseline-policy-rollouts
- DAgger c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-baseline
- Rollouts de política Mulligan c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- DAgger mixto c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mixed
- Ficha externa del dataset de rollouts c03 (Claru): https://claru.ai/datasets/mulligan-sim-square-narrow-c03-baseline-policy-rollouts
