# mulligan/sim-square-narrow-r02-auto-filtered-bc-n1-idql

## Resumen

`sim-square-narrow-r02-auto-filtered-bc-n1-idql` es un agente de control robótico basado en estados, publicado por el proyecto Mulligan dentro de su campaña de *imitation learning* iterativo sobre la tarea simulada `sim-square-narrow` (ensamblaje de precisión, derivada del entorno tipo nut-assembly). No es un modelo de lenguaje ni un modelo multimodal: es una política entrenada con el algoritmo IDQL (actor de difusión con crítico IQL escalar), distribuida como checkpoint de PyTorch (`policy.pt`) más un fichero de normalizadores (`stats.json`). Corresponde a la ronda R2 y al brazo `auto-filtered-bc-n1`, y ocupa la celda de campaña etiquetada como comparador de *imitation learning* iterativo.

El modelo se entrena a partir de tres conjuntos de datos de la propia organización: un baseline de teleoperación, rollouts de una política compartida generada por BC automático y rollouts de una política BC automática filtrada. Se publican cinco semillas independientes (1 a 5), todas con el mismo paso de entrenamiento (150001), lo que permite estudiar la varianza del procedimiento de entrenamiento bajo una receta fija. El repositorio completo ocupa 1,4 GB.

Su relevancia es metodológica más que de producto: sirve como referencia reproducible para evaluar técnicas de aumento de datos automático y filtrado en aprendizaje por imitación, con evaluación sobre una rejilla de estados iniciales retenida de 8000 rollouts por semilla. La tasa de éxito media observada es del 71,42 %, con un rango entre el 69,1 % y el 74,1 % según la semilla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión con crítico IQL escalar (checkpoint `policy.pt` + `stats.json`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política basada en estados; no procesa texto ni secuencias de lenguaje) |
| Tipos de cuantización | no disponible; se distribuye en formato PyTorch nativo, sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplica; HuggingFace no declara idiomas para este repositorio |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`, serializado como pickle) y `stats.json` para normalizadores |
| Tarea | `sim-square-narrow` |
| Ronda del modelo | R2 |
| Brazo | `auto-filtered-bc-n1` |
| Celda de campaña | `iterative-IL comparator` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamaño del repositorio | 1,4 GB (aproximadamente 280 MB por semilla) |
| Pipeline declarado en HuggingFace | robotics |
| Tensor type / dtype | no disponible |
| Fecha de publicación en HuggingFace | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura es un agente IDQL (*Implicit Diffusion Q-Learning*), compuesto por un actor de difusión que modela la distribución de acciones y un crítico IQL con salida escalar. El actor de difusión genera acciones por muestreo iterativo y el crítico escalar pondera o selecciona las muestras del actor. El estado de entrada es proprioceptivo (agente basado en estados, sin percepción visual); el modelo no consume imágenes, texto ni audio. Los ficheros distribuidos son `policy.pt`, que contiene la política serializada mediante pickle de PyTorch, y `stats.json`, que contiene los normalizadores de observaciones y acciones.

El entrenamiento se realizó sobre tres conjuntos de datos: `sim-square-narrow-c00-teleop-baseline` (demostraciones de teleoperación), `sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts` (rollouts de una política compartida de *behavioral cloning* automático) y `sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts` (rollouts de política BC automática con filtrado). Según la model card, los checkpoints son copias byte a byte de artefactos de Weights & Biases, con MD5 verificado contra el manifiesto del artefacto y SHA-256 registrado en `release.json`; cada semilla procede de un run distinto de W&B (`square-dagger-mining-01a`) con su propio commit de Git. No se especifican en la información disponible el número total de tokens, el volumen de transiciones, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (categorías, por otra parte, no aplicables a un agente de control). El conjunto `sim-square-narrow-c03-auto-filtered-bc-n1-policy-rollouts` referencia este checkpoint en sus metadatos, lo que indica que la política se empleó para generar datos en la campaña posterior.

## Capacidades

- Control robótico basado en estados para la tarea única `sim-square-narrow`: genera acciones a partir de observaciones proprioceptivas.
- Ejecución de una política de difusión con selección de acciones guiada por un crítico IQL escalar.
- Reproducción de resultados bajo una receta de entrenamiento fija: cinco semillas con el mismo paso (150001).
- Generación de rollouts de política utilizables como datos de entrenamiento para campañas posteriores (así se referencia en los metadatos del conjunto `c03-auto-filtered-bc-n1-policy-rollouts`).
- Evaluación sobre una rejilla de estados iniciales retenida con 8000 rollouts por semilla.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso en lenguaje, agentes conversacionales ni capacidades multilingües.
- No tiene modo *thinking*, ni visión, ni audio, ni generación de texto, código o matemáticas.
- No hay evidencia disponible de transferencia a hardware real ni de generalización a otras tareas distintas de `sim-square-narrow`.

## Casos de uso

- Comparador de referencia en investigación sobre imitación iterativa: la celda de campaña declarada es `iterative-IL comparator`, de modo que el checkpoint sirve para medir si una técnica nueva (por ejemplo, otro esquema de filtrado de datos automáticos) supera o no a esta receta bajo la misma rejilla de evaluación.
- Evaluación reproducible en Policy Arena: el proyecto Mulligan publica las evaluaciones en `arena.mulligan.page`, y los resultados por rollout están en el conjunto `sim-square-narrow-r00-r03-eval`; este modelo puede reproducirse y contrastarse contra las rondas r00 y r03.
- Estudio de varianza entre semillas: con cinco semillas y 8000 rollouts cada una, permite cuantificar la dispersión del procedimiento de entrenamiento (69,1 %–74,1 % de éxito) antes de atribuir mejoras a un cambio de método.
- Generación de datos de entrenamiento para campañas posteriores: el checkpoint se usó para producir los rollouts referenciados por `sim-square-narrow-c03-auto-filtered-bc-n1-policy-rollouts`, por lo que es un ejemplo operativo de política de recogida (*rollout policy*) dentro de un bucle de imitación iterativa.
- Ablación del filtrado automático: al ser el brazo `auto-filtered-bc-n1`, compararlo con las variantes sin filtrado permite aislar el efecto del filtrado de datos en la tasa de éxito final.
- Punto de partida para *fine-tuning* o destilación en la misma tarea: al distribuirse `policy.pt` y `stats.json`, puede inicializarse desde él un entrenamiento posterior sobre `sim-square-narrow` sin partir de cero.
- Integración en pipelines de investigación con W&B: la model card documenta los artefactos y commits exactos de cada semilla, lo que facilita la trazabilidad en experimentos reproducibles y auditorías internas.
- Auditoría de riesgos de formato: sirve como caso concreto para probar políticas de carga segura de checkpoints pickle en infraestructura corporativa, dado que el propio autor advierte de que los `.pt` son pickles.

## Benchmarks y rendimiento

Resultados de evaluación publicados en la model card sobre una rejilla de estados iniciales retenida (conjunto `sim-square-narrow-r00-r03-eval`), expresados como éxitos sobre 8000 rollouts por semilla:

| Semilla | Rollouts | Éxitos | Tasa de éxito |
|---|---|---|---|
| seed-1 | 8000 | 5681 | 71,01 % |
| seed-2 | 8000 | 5528 | 69,10 % |
| seed-3 | 8000 | 5732 | 71,65 % |
| seed-4 | 8000 | 5928 | 74,10 % |
| seed-5 | 8000 | 5698 | 71,23 % |
| Media (5 semillas) | 40000 | 28567 | 71,42 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje en la información disponible; esas métricas no son aplicables a este modelo. Tampoco se proporcionan métricas adicionales de retorno, longitud de episodio o robustez más allá de la tasa de éxito indicada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica recuento de parámetros ni huella de memoria.
- El repositorio ocupa 1,4 GB para cinco semillas (aproximadamente 280 MB por semilla, incluyendo `policy.pt` y `stats.json`); este dato es de tamaño en disco, no de memoria en ejecución.
- GPU recomendadas: no disponible. Al tratarse de una política basada en estados, sin percepción visual ni modelo de lenguaje, es plausible que no requiera GPU de centro de datos, pero esta afirmación no está confirmada por el autor.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje. El checkpoint se carga con PyTorch dentro del código de investigación de Mulligan, en los commits indicados en la model card.
- Latencia y throughput: no disponibles. El único dato operativo es el volumen de evaluación (8000 rollouts por semilla), que no permite derivar latencia por paso.
- Nota de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch y el autor recomienda cargarlos únicamente en entornos de confianza.

## Comparativa con modelos similares

No se dispone de métricas comparativas de modelos alternativos en la información proporcionada. Los artefactos relacionados identificados por nombre, sin datos de rendimiento publicados en esta información, son:

| Modelo o artefacto | Relación | Tarea | Semillas | Tasa de éxito |
|---|---|---|---|---|
| `sim-square-narrow-r02-auto-filtered-bc-n1-idql` (este modelo) | Agente IDQL, brazo `auto-filtered-bc-n1`, ronda R2 | `sim-square-narrow` | 5 | 71,42 % de media |
| `sim-square-narrow-c03-auto-filtered-bc-n1-policy-rollouts` | Conjunto de datos que referencia este checkpoint | `sim-square-narrow` | no disponible | no disponible (es un dataset) |
| `sim-square-narrow-r00-r03-eval` | Conjunto de evaluación empleado | `sim-square-narrow` | no disponible | no disponible (es un dataset) |
| `sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts` | Variante de la tarea *broad* con otro brazo | `sim-square-broad` | no disponible | no disponible |
| Alternativas genéricas (IQL puro, Diffusion Policy, BC) | Familias de algoritmos comparables en la literatura | manipulación simulada | no disponible | no disponible |

No se han publicado en la información disponible comparaciones numéricas frente a otros agentes de la misma campaña ni frente a métodos externos.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para `sim-square-narrow`. No hay evidencia de que funcione en otras tareas, objetos o variantes del entorno.
- Basada en estados: requiere observaciones proprioceptivas del simulador. No procesa imágenes, por lo que no puede usarse con entradas visuales sin un cambio de arquitectura y reentrenamiento.
- Entorno simulado: los resultados (71,42 % medio) proceden de simulación. No se aportan datos de transferencia a robot real.
- Varianza entre semillas: un rango de 69,10 % a 74,10 % implica que diferencias de pocos puntos porcentuales entre métodos pueden deberse al azar de la semilla. Cualquier comparación debería usar varias semillas.
- Riesgo de fallo fuera de distribución: como toda política entrenada con datos limitados, puede degradarse ante estados iniciales, fricciones o dinámicas no representadas en los conjuntos `c00`, `c01` y `c02`. No es un problema de "alucinación" en el sentido de los modelos de lenguaje, pero sí de generalización.
- Sesgos: no se documentan sesgos de comportamiento más allá del propio sesgo de las demostraciones de teleoperación del dataset `c00-teleop-baseline`, que condiciona el estilo y las trayectorias aprendidas.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con conservación del aviso de copyright y de la licencia. No se indican restricciones adicionales.
- Riesgo de seguridad en el formato: los ficheros `.pt` son pickles de PyTorch. Cargar checkpoints de origen no verificado puede ejecutar código arbitrario; el autor recomienda hacerlo solo en entornos de confianza.
- Ausencia de idiomas y de capacidades de lenguaje: no es usable para generación de texto, asistentes, RAG ni tareas de NLP.
- Datos incompletos para producción: no se publican recuento de parámetros, requisitos de memoria, latencia ni instrucciones de despliegue fuera del código de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-auto-filtered-bc-n1-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Página del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Artículo "Data-Efficient Robot Learning in Deployment" (PDF): https://mulligan.page/assets/paper.pdf
- Conjunto de evaluación `sim-square-narrow-r00-r03-eval`: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset `sim-square-narrow-c00-teleop-baseline`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset `sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts
- Dataset `sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts
- Dataset `sim-square-narrow-c03-auto-filtered-bc-n1-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-filtered-bc-n1-policy-rollouts
- Dataset `sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Búsqueda de datasets con la etiqueta `sim-square-narrow`: https://huggingface.co/datasets?other=sim-square-narrow
- Ficha del dataset `sim-square-narrow-c01` en claru.ai: https://claru.ai/datasets/mulligan-sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts
