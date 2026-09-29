# mulligan/sim-square-narrow-r03-auto-plain-il-n1-idql

## Resumen

`mulligan/sim-square-narrow-r03-auto-plain-il-n1-idql` es un agente de control robótico basado en IDQL (Implicit Q-Learning con actor de difusión), entrenado para la tarea simulada `sim-square-narrow`. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo offline que consume observaciones de estado (no imágenes) y produce acciones de control. Lo publica el usuario `mulligan` dentro del proyecto Mulligan, que mantiene un banco de evaluaciones comparables en Policy Arena y un conjunto de datasets asociados en HuggingFace.

El checkpoint corresponde a la ronda R3, brazo `auto-plain-il-n1`, celda de campaña `iterative-IL comparator`. Se distribuyen cinco semillas independientes (seed-1 a seed-5), todas ellas en el paso de entrenamiento 150001, lo que permite estudiar la varianza entre inicializaciones aleatorias de un mismo protocolo de entrenamiento. La evaluación se realizó sobre una rejilla de estados iniciales reservada, con 8000 rollouts por semilla.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para investigaciones de aprendizaje por imitación iterativo (iterative IL) y de minería de rollouts tipo DAgger en manipulación robótica simulada, y como línea base cuantitativa frente a otros brazos de la misma campaña. El repositorio ocupa 1,4 GB en total (aproximadamente 280 MB por semilla) y se publica bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusión (diffusion policy) con crítico IQL escalar (IDQL) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; entrada = vector de estado por paso) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (pickle) + `stats.json` con normalizadores |
| Tarea | `sim-square-narrow` |
| Tipo de agente | IDQL, estado (no visión) |
| Ronda / brazo | R3 / `auto-plain-il-n1` |
| Celda de campana | `iterative-IL comparator` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicacion | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura es IDQL: un actor generativo de tipo difusión que modela la distribución de acciones, combinado con un crítico escalar entrenado mediante Implicit Q-Learning (IQL). Este esquema pertenece a la familia de métodos de RL offline con regularización implícita, diseñados para aprender políticas a partir de datos fijos sin requerir interacción con el entorno durante el entrenamiento del crítico. La entrypoint publicada es `policy.pt`, acompañada de `stats.json` con los normalizadores de observaciones y acciones, lo que indica que el agente opera sobre observaciones de estado normalizadas en lugar de píxeles.

El entrenamiento se realizó con el código de investigación de Mulligan en los commits `efb49c686083`, `1edf2e7a2851` y `4e50ff42420f`, según se detalla en la tabla de checkpoints de la model card. Los datos provienen de cuatro datasets encadenados que reflejan un protocolo de imitación iterativa: un baseline de teleoperación (`c00-teleop-baseline`), rollouts de una política compartida entrenada por behavior cloning (`c01-auto-bc-n1-shared-policy-rollouts`) y dos rondas de rollouts de políticas de imitación `plain-il` (`c02` y `c03`). Los nombres de los artefactos de W&B hacen referencia a `iql_ddpg_bc_idql_nutassemblysquare`, lo que sugiere que el código base cubre también variantes DDPG+BC e IQL sobre la tarea de ensamblaje NutAssemblySquare de robosuite, si bien la model card no confirma explícitamente el simulador empleado. No se documentan en la información disponible ni el número de transiciones de entrenamiento, ni la composición exacta del dataset, ni si se aplicaron fases de RLHF/DPO (categorías que, por otra parte, no son de aplicación directa a un agente de control).

## Capacidades

- Control robótico de manipulación en simulación: genera acciones continuas para la tarea `sim-square-narrow` a partir de observaciones de estado.
- Aprendizaje por imitación offline: la política se ha entrenado sobre datasets de demostraciones y rollouts, sin interacción online durante el ajuste del crítico.
- Política multimodal: al emplear un actor de difusión, puede representar distribuciones de acción multimodales, relevantes en tareas de ensamblaje con múltiples estrategias válidas.
- Reproducibilidad entre semillas: se publican cinco semillas del mismo protocolo, lo que permite evaluar la estabilidad del entrenamiento.
- Trazabilidad de procedencia: los ficheros son copias byte a byte de artefactos de W&B, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`.
- No soporta generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No se declaran capacidades multilingües (no aplica).

## Casos de uso

- Línea base en investigación de imitación iterativa: la celda de campaña `iterative-IL comparator` indica que este checkpoint está pensado como comparador frente a otros brazos de la misma ronda. Un grupo de investigación puede reproducir la evaluación sobre la rejilla reservada y contrastar su método contra estos cinco seeds.
- Análisis de varianza entre semillas: con cinco semillas al mismo paso de entrenamiento (150001) y 8000 rollouts cada una, es posible estimar la dispersión del éxito (entre el 63,2 % y el 65,8 % según semilla) y decidir si una mejora observada es significativa o ruido.
- Generación de rollouts para pipelines DAgger: la política puede desplegarse en el simulador para producir trayectorias etiquetadas por resultado, que alimenten rondas posteriores de agregación de datos, tal como reflejan los datasets `c02` y `c03` del propio proyecto.
- Destilación e inicialización para transferencia sim-to-real: `policy.pt` puede servir de punto de partida para destilar una política más ligera o para fine-tuning con datos reales, aunque no hay evidencia publicada de transferencia en la información disponible.
- Verificación de reproducibilidad de publicaciones: el `release.json` con SHA-256 y la correspondencia con artefactos de W&B permiten auditar que un resultado publicado se obtuvo con exactamente estos pesos.
- Docencia en aprendizaje por refuerzo offline: el par `policy.pt` + `stats.json` es un ejemplo autocontenido de los artefactos necesarios para desplegar una política entrenada (pesos y normalizadores) en un curso o tutorial.
- Integración en un banco de evaluaciones automatizado: el formato por carpeta de semilla y la referencia a un dataset de evaluación con resultados por rollout facilitan el parseo y la agregación de métricas en un harness de CI.

## Benchmarks y rendimiento

Los únicos resultados cuantitativos publicados son los de la evaluación sobre rejilla de estados iniciales reservada, con 8000 rollouts por semilla.

| Semilla | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 8000 | 5056 | 63,20 % |
| seed-2 | 8000 | 5089 | 63,61 % |
| seed-3 | 8000 | 5261 | 65,76 % |
| seed-4 | 8000 | 5196 | 64,95 % |
| seed-5 | 8000 | 5253 | 65,66 % |
| Media (5 semillas) | 40000 | 25855 | 64,64 % |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K, ni son de aplicación a este modelo. Tampoco se han publicado comparaciones numéricas contra otros brazos de la campaña en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia derivada del tamaño del repositorio (1,4 GB para cinco semillas, unos 280 MB por semilla incluyendo `policy.pt` y `stats.json`), una única semilla en fp32 ocuparía del orden de unas décimas de GB, lo que situaría el modelo en el rango de decenas de millones de parámetros; esta cifra es una estimación indirecta, no un dato confirmado por el autor.
- GPU recomendadas: no disponibles. Por el tamaño estimado, cualquier GPU con al menos unos pocos GB de VRAM sería suficiente; también es plausible la inferencia en CPU.
- Cabe en GPU de consumo: previsiblemente sí en cualquier RTX con 8 GB o más, e incluso en GPUs integradas, dado que se trata de una política de estado y no de un modelo de lenguaje. No confirmado por el autor.
- Opciones de despliegue: carga directa del checkpoint PyTorch (`policy.pt`) junto con los normalizadores de `stats.json`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. Conviene revisar el código de investigación de Mulligan en los commits indicados para replicar el preprocesado de observaciones.
- Latencia y throughput: no disponibles. Un actor de difusión requiere varios pasos de denoising por acción, por lo que la latencia de control dependerá del número de pasos de difusión configurado y del hardware.

## Comparativa con modelos similares

No se dispone de cifras publicadas de los brazos alternativos de la misma campaña, por lo que la comparación cuantitativa no es posible. La siguiente tabla recoge lo que puede afirmarse a partir de la información disponible.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-narrow-r03-auto-plain-il-n1-idql | IDQL (actor de difusion + critico IQL) | no disponible | no aplica | 64,64 % de exito medio (5 semillas, 40000 rollouts) | MIT | HuggingFace, 5 semillas |
| Brazo `auto-bc-n1` de la misma campana | Behavior cloning sobre politica compartida | no disponible | no aplica | no disponible | no disponible | referenciado en los datasets `c01` de Mulligan |
| Variantes DDPG+BC / IQL mencionadas en los nombres de los artefactos | RL offline con actor deterministico o critico IQL | no disponible | no aplica | no disponible | no disponible | no disponibles como checkpoints publicados |

Tampoco se han identificado en la búsqueda web modelos comparables de terceros para esta tarea concreta.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada exclusivamente para la tarea `sim-square-narrow`; no generaliza a otras tareas ni a otros entornos sin reentrenamiento.
- Sin capacidades de lenguaje ni multimodales: cualquier caso de uso de generación de texto, visión o tool calling queda fuera de su alcance.
- Rendimiento moderado: la tasa de éxito media es del 64,64 %, lo que implica que aproximadamente uno de cada tres rollouts falla en la rejilla de evaluación reservada.
- Varianza entre semillas no despreciable: el rango observado va del 63,20 % al 65,76 %, unos 2,6 puntos porcentuales de diferencia; conviene no interpretar mejoras menores como señal fiable.
- Riesgo de sobreajuste a la distribución de estados iniciales de evaluación: no se documenta la variabilidad de los estados iniciales ni evaluaciones con perturbaciones, por lo que la robustez fuera de esa rejilla es desconocida.
- Riesgo de seguridad al cargar los pesos: la propia model card advierte de que los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en un entorno de confianza.
- Ausencia de datos de entrenamiento detallados: no se especifican el número de transiciones, la composición del dataset ni el simulador concreto, lo que dificulta auditar posibles sesgos de datos.
- Sin evidencia de transferencia a hardware real: no se han publicado resultados sim-to-real en la información disponible.
- Licencia MIT: permisiva y apta para uso comercial, pero no exime de la responsabilidad sobre el comportamiento del modelo ni de los riesgos de seguridad asociados al entorno de despliegue (simulador o robot).
- Idiomas y sesgos sociales: no aplica ni está documentado, dado que el modelo no procesa lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-auto-plain-il-n1-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperación baseline: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts BC compartidos: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts
- Dataset de rollouts IL (ronda 02): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-plain-il-n1-policy-rollouts
- Dataset de rollouts IL (ronda 03): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-plain-il-n1-policy-rollouts
- Dataset de rollouts de política (c03 alternativo): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Dataset DAgger mixto (c03): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mixed
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones comparadas): https://arena.mulligan.page
- Nota sobre la búsqueda web: los resultados obtenidos (BenchLM, calendario de lanzamientos de modelos) tratan sobre modelos de lenguaje y no contienen información relevante sobre este checkpoint de robótica, por lo que no se han utilizado como fuente de datos.
