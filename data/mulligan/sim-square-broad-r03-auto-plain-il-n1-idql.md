# mulligan/sim-square-broad-r03-auto-plain-il-n1-idql

## Resumen

`mulligan/sim-square-broad-r03-auto-plain-il-n1-idql` es un agente de control para robótica entrenado con IDQL (Implicit Q-Learning as an Actor-Critic method with Diffusion policy), publicado por la organización Mulligan dentro de su campaña de experimentos sobre la tarea `sim-square-broad`. No es un modelo de lenguaje: es una política estado-a-acción compuesta por un actor de difusión y un crítico IQL escalar, distribuida como checkpoint de PyTorch (`policy.pt`) junto con ficheros de normalización (`stats.json`). El repositorio ocupa 1,4 GB e incluye cinco carpetas de semilla (seed-1 a seed-5), cada una con su configuración de ejecución asociada.

El modelo pertenece a la ronda R3 y al brazo `auto-plain-il-n1`, dentro de la celda de campaña `iterative-IL comparator`. Su función es servir de comparador de aprendizaje por imitación iterativo: se entrena sobre un dataset de teleoperación de referencia más tres conjuntos de rollouts generados automáticamente, y se evalúa sobre una rejilla de estados iniciales reservada con 30.000 rollouts por semilla (150.000 en total). El checkpoint publicado corresponde al paso de entrenamiento 250.001.

Su relevancia es metodológica más que de producto: ofrece cinco semillas independientes del mismo método con evaluación homogénea, lo que permite medir varianza entre semillas (éxitos entre el 43,4 % y el 49,4 %) y comparar IDQL frente a otras alternativas de la misma campaña. La licencia es MIT y los checkpoints son pickles de PyTorch, por lo que deben cargarse únicamente en entornos de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico: actor de difusión para la política + crítico IQL escalar (IDQL) |
| Parametros totales | no disponible (la model card no publica recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el horizonte efectivo depende del entorno de simulación, no especificado) |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint PyTorch en coma flotante; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; es una política de control sobre estado) |
| Licencia | MIT |
| Formato de pesos | `policy.pt` (pickle de PyTorch) y `stats.json` (normalizadores), una carpeta por semilla |
| Tarea | `sim-square-broad` |
| Ronda de modelo | R3 |
| Brazo / celda de campana | `auto-plain-il-n1` / `iterative-IL comparator` |
| Semillas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Entradas | estado (state-based; sin visión ni lenguaje) |

## Arquitectura y entrenamiento

El método es IDQL, una reformulación de Implicit Q-Learning como esquema actor-crítico. El crítico es una Q-función escalar entrenada con el backup modificado de IQL, que solo utiliza acciones presentes en el dataset y evita así la evaluación de acciones fuera de distribución. Sobre ese crítico, el actor se parametriza como un modelo de difusión que genera acciones; el muestreo del actor se guía implícitamente por los valores aprendidos, de modo que no necesita consultar la Q-función durante la inferencia del mismo modo que un actor determinista clásico. El agente es state-based: consume el vector de estado del simulador, no píxeles.

Los datos de entrenamiento combinan cuatro conjuntos del ecosistema Mulligan para esta tarea: `sim-square-broad-c00-teleop-baseline` (demostraciones de teleoperación), `sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts` (rollouts de una política compartida de behavior cloning) y dos rondas posteriores de rollouts etiquetados como `auto-plain-il-n1` (`c02` y `c03`). El número total de transiciones, la composición exacta y la existencia de fases de RLHF/DPO no están documentados en la información disponible. Se publican cinco semillas del mismo pipeline, con configuración por semilla en `release/run-configs/...json` dentro del repositorio de código de Mulligan, que además incluye recetas para reentrenar cada checkpoint.

## Capacidades

- Control robótico a partir de estado: produce acciones continuas para la tarea `sim-square-broad` en simulación.
- Aprendizaje por imitación iterativo: se entrena con demostraciones humanas más rollouts generados por políticas previas del propio pipeline.
- Aprendizaje offline: el crítico IQL está diseñado para operar sin interacción con el entorno durante el entrenamiento del valor.
- Generación de rollouts: los datasets `c02` y `c03` del ecosistema se producen con políticas de este brazo, por lo que el agente puede emplearse como recolector de datos.
- Variabilidad reproducible: cinco semillas independientes permiten estudiar dispersión de resultados.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes basados en texto, razonamiento multi-paso simbólico ni diálogo.
- No dispone de capacidades multilingües, de visión, de audio ni de modo de razonamiento explícito.
- No se documenta soporte para transferencia a robot real ni para tareas distintas de `sim-square-broad`.

## Casos de uso

- Comparador de aprendizaje por imitación iterativo: el brazo `auto-plain-il-n1` existe precisamente como celda de comparación dentro de la campaña R3, de modo que sirve para medir si las rondas sucesivas de rollouts automáticos mejoran respecto al baseline de teleoperación.
- Evaluación de algoritmos de RL offline: permite contrastar IDQL frente a otros métodos de la misma campaña bajo una rejilla de estados iniciales común de 30.000 rollouts por semilla, con protocolo idéntico.
- Recolector de datos para entrenamiento posterior: el agente puede desplegarse en el simulador para generar nuevos conjuntos de rollouts, siguiendo el mismo esquema que produjo `c02` y `c03`.
- Estudio de varianza entre semillas: las cinco semillas publicadas cubren un rango de éxito del 43,4 % al 49,4 %, suficiente para cuantificar la sensibilidad del método a la inicialización.
- Reproducción de experimentos: las configuraciones por semilla del repositorio de Mulligan permiten reentrenar cada checkpoint y verificar los resultados publicados.
- Investigación sobre actores de difusión: al separar actor de difusión y crítico IQL, el checkpoint es útil para ablar el efecto del muestreo difusivo frente a políticas deterministas.
- Inicialización para ajuste fino: partir de `policy.pt` para adaptar la política a una variante del entorno o a una distribución de estados distinta, en lugar de entrenar desde cero.
- Prueba de infraestructura de simulación: la carga de 150.000 rollouts de evaluación sirve como caso de prueba para pipelines de simulación distribuida.

## Benchmarks y rendimiento

La model card publica la evaluación sobre rejilla de estados iniciales reservada (`sim-square-broad-r00-r03-eval`), con 30.000 rollouts por semilla:

| Semilla | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 30000 | 13024 | 43,41 % |
| seed-2 | 30000 | 13445 | 44,82 % |
| seed-3 | 30000 | 14742 | 49,14 % |
| seed-4 | 30000 | 14813 | 49,38 % |
| seed-5 | 30000 | 14334 | 47,78 % |
| Total (5 semillas) | 150000 | 70358 | 46,91 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publica el recuento de parámetros ni el tamaño por semilla; el repositorio completo ocupa 1,4 GB e incluye cinco checkpoints, sus normalizadores y metadatos, por lo que el tamaño por semilla es una fracción de esa cifra.
- GPU recomendadas: no disponibles en la información proporcionada. Al tratarse de una política estado-a-acción, es plausible ejecutarla en CPU o en GPUs de gama media, pero esto es una inferencia razonada a partir del tipo de modelo y no un dato publicado.
- Encaje en GPU de consumo: no confirmado por el autor. Sin el recuento de parámetros no puede afirmarse con rigor.
- Opciones de despliegue: carga directa del checkpoint con PyTorch. No aplican vLLM, TGI, llama.cpp ni Ollama, que son servidores para modelos de lenguaje.
- Latencia y throughput: no disponibles. La latencia de control vendrá determinada por el coste del muestreo del actor de difusión y por el paso de simulación, ninguno de los cuales se cuantifica en la model card.
- Requisito de entorno: hace falta un simulador que implemente la tarea `sim-square-broad` y el mismo espacio de estados y normalizadores (`stats.json`) con el que se entrenó.

## Comparativa con modelos similares

| Modelo | Tarea | Metodo | Semillas | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sim-square-broad-r03-auto-plain-il-n1-idql` (este) | sim-square-broad | IDQL (actor de difusión + crítico IQL) | 5 | 150.000 rollouts, éxito medio 46,91 % | MIT | HuggingFace |
| `mulligan/sim-square-broad-r02-auto-iql-n32-idql` | sim-square-broad | IDQL | no disponible | no disponible en la información recogida | no disponible | HuggingFace |
| Brazos `auto-bc-n1` (datasets `c01`) | sim-square-broad | Behavior cloning | no disponible | no disponible | no disponible | Solo como datasets de rollouts |

No se dispone de datos comparativos de parámetros, contexto ni rendimiento frente a políticas de terceros; la información encontrada se limita a otros artefactos de la propia campaña Mulligan.

## Limitaciones y advertencias

- Ámbito restringido: la política está entrenada exclusivamente para la tarea `sim-square-broad` en simulación; no hay evidencia de transferencia a un robot físico.
- Sin capacidades de lenguaje: no genera texto, no razona simbólicamente y no admite instrucciones en lenguaje natural.
- Entrada solo de estado: no procesa imágenes ni señales sensoriales crudas, lo que limita su uso en configuraciones con percepción real.
- Rendimiento moderado: la tasa de éxito media es del 46,91 %, es decir, más de la mitad de los rollouts de evaluación no alcanzan el objetivo.
- Alta varianza entre semillas: entre 43,41 % y 49,38 %, una horquilla de casi seis puntos porcentuales que debe tenerse en cuenta al comparar contra otros métodos.
- Riesgo de sobreajuste al protocolo: comparar resultados contra otros brazos de la campaña solo es válido si se usa la misma rejilla de estados iniciales y el mismo número de rollouts.
- Riesgo de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch; la propia model card advierte de que solo deben cargarse en entornos de confianza. `release.json` registra el SHA-256 de cada fichero, por lo que conviene verificar la integridad antes de usarlos.
- Trazabilidad incompleta: no se documentan el recuento de parámetros, la composición exacta del dataset, el número de transiciones ni los hiperparámetros dentro de la model card; hay que acudir al repositorio de código.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías y sin que el autor asuma responsabilidad por el comportamiento del agente.
- Descargas y adopción nulas en el momento de la consulta (0 descargas, 0 likes), lo que reduce la validación externa disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r03-auto-plain-il-n1-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de teleoperacion baseline: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts BC compartidos: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts
- Dataset de rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-plain-il-n1-policy-rollouts
- Dataset de rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-auto-plain-il-n1-policy-rollouts
- Modelo relacionado de la campana: https://huggingface.co/mulligan/sim-square-broad-r02-auto-iql-n32-idql
- Busqueda de datasets de la tarea: https://huggingface.co/datasets?other=sim-square-broad
- Paper de IDQL: https://arxiv.org/abs/2304.10573
