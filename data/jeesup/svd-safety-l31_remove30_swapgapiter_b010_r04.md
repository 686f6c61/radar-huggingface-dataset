# Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r04

## Resumen

`svd-safety-l31_remove30_swapgapiter_b010_r04` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de un derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM que elimina el 30,01% de los parámetros (fracción de parámetros resultante declarada: 0,6999), seguida de un proceso de reparación mediante intercambio iterativo de parámetros neutro, seleccionado por la regla `gap_iter`.

El modelo no es un asistente de propósito general. Forma parte de un grid experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. En concreto, este checkpoint corresponde al cuarto de diez rondas iterativas previstas, con un presupuesto de restauración de 1,000% de los parámetros densos, 4.625 componentes restaurados y 4.625 componentes sustituidos, sobre una semilla fija (42). El checkpoint es, por tanto, una ronda intermedia de una ejecución más larga.

Su relevancia es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión, un eje poco explorado y con implicaciones directas para el despliegue de modelos comprimidos en producción. El autor advierte explícitamente de que varias celdas del grid están degradadas deliberadamente en seguridad respecto al modelo base, por lo que cualquier uso debe ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1); pesos derivados mediante compresión SVD-LLM sobre capas de proyección |
| Parametros totales | 8.030.261.248 (recuento de safetensors, idéntico en la práctica al del modelo denso original) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada. El modelo base `meta-llama/Llama-3.1-8B-Instruct` declara 128.000 tokens, pero este derivado no documenta cambios ni verificación de esa ventana |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors sin cuantizar; no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible (no se declara lista de idiomas en la model card ni en los metadatos de HuggingFace) |
| Licencia | Llama 3.1 Community License (`llama3.1`); el repositorio incluye `LICENSE` y `USE_POLICY.md` |
| Formato de pesos | safetensors (librería `transformers`); tamaño del repositorio: 16,1 GB |

Datos de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Compresión | SVD-LLM, 30,01% de parámetros eliminados |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000% de los parámetros densos |
| Componentes restaurados | 4.625 |
| Componentes sustituidos | 4.625 |
| Fracción de parámetros resultante | 0,6999 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 4 de 10 |
| Tamaño de bloque por ronda | 0,100% de los parámetros densos |
| Parámetros insertados | 27.894.784 (0,40% de los parámetros densos de proyección) |
| Valor de intercambio | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Checkpoint | ronda intermedia de una ejecución más larga |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE y atención agrupada (GQA). No hay mezcla de expertos ni componentes de espacio de estados. La modificación consiste en una compresión SVD-LLM aplicada a las matrices de proyección, que aproxima cada matriz por una descomposición de rango reducido, eliminando el 30,01% de los parámetros según la model card. Sobre ese modelo comprimido se aplica un procedimiento de reparación que el autor denomina «swap» iterativo y neutro en parámetros: en cada ronda se seleccionan componentes según la regla `gap_iter` y se restauran desde el modelo original, desalojando componentes previos en orden de valor singular. El presupuesto total de la ejecución completa es del 1,0% de los parámetros densos, repartido en diez rondas de 0,1%; esta celda aplica únicamente cuatro rondas y restaura 4.625 componentes, con 27.894.784 parámetros insertados (0,40% de los parámetros densos de proyección).

La model card no documenta ninguna fase de preentrenamiento, ajuste fino, RLHF, DPO ni destilación adicional: el proceso es exclusivamente de compresión y edición de pesos sobre un modelo ya instruido. Tampoco se describen los datos de calibración utilizados por SVD-LLM, el número de tokens empleados ni la composición del conjunto de evaluación más allá de las métricas reportadas. Un extremo que conviene comprobar antes de asumir ahorros: el recuento de parámetros de los safetensors (8.030.261.248) coincide prácticamente con el del modelo denso original, pese a que la model card declara una fracción de parámetros resultante de 0,6999. La información disponible no explica esa discrepancia, por lo que no debe darse por hecho que el checkpoint ocupe menos memoria que el modelo sin comprimir.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de chat del modelo base Llama-3.1-8B-Instruct, aunque el autor advierte que no debe tratarse como asistente desplegable.
- Razonamiento e instrucciones: conserva el comportamiento de instrucciones del modelo base, presumiblemente degradado por la compresión en una magnitud no cuantificada en la información disponible.
- Seguridad medible: es la capacidad central del artefacto; permite medir tasas de éxito de ataque (ASR) y de sobrerrechazo bajo diferentes configuraciones de compresión y reparación.
- Trazabilidad experimental: cada celda del grid es reproducible (semilla 42, regla de selección y presupuesto documentados), lo que permite comparaciones controladas.
- Compatibilidad de despliegue: los tags incluyen `text-generation-inference` y `endpoints_compatible`, de modo que el checkpoint puede cargarse con la pila estándar de transformers y TGI.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas.
- Modo «thinking», visión o audio: no disponibles.

## Casos de uso

- Estudio de la degradación de seguridad por compresión: este checkpoint es una celda concreta del grid; se usa para medir cómo varía la tasa de éxito de ataque al eliminar el 30,01% de parámetros y restaurar solo el 0,4% de los parámetros de proyección, comparándola con el modelo base sin comprimir.
- Evaluación comparativa de reglas de selección de componentes: la regla `gap_iter` puede contrastarse con las demás reglas del grid manteniendo constantes el presupuesto (1,000%), la semilla (42) y el esquema de desalojo ordenado por sigma.
- Calibración de arneses de evaluación de seguridad: los valores medidos (AdvBench ASR 0,6250; StrongREJECT ASR 0,4600; sobrerrechazo macro con WildGuard 0,0228) sirven como punto de referencia para validar que los jueces HarmBench y WildGuard responden de forma estable ante modelos manipulados.
- Análisis de interpretabilidad de direcciones de rechazo: al conocer exactamente qué 4.625 componentes se han restaurado, es posible correlacionar subespacios de proyección concretos con el comportamiento de rechazo observado.
- Trazabilidad de trayectorias de reparación: al ser una ronda intermedia (4 de 10), permite estudiar la curva de recuperación de seguridad ronda a ronda y detectar saturación o retrocesos.
- Auditoría de pipelines de moderación: puede emplearse como caso adversario controlado para comprobar si un clasificador de contenido detecta respuestas inseguras generadas por modelos comprimidos, un escenario realista cuando se sirven variantes cuantizadas de modelos abiertos.
- Reproducibilidad de artefactos de investigación: con semilla y presupuesto documentados, sirve para replicar resultados de estudios sobre compresión y seguridad y para validar metodologías de terceros.
- Formación y divulgación: como ejemplo didáctico de que la compresión no es neutra desde el punto de vista de la seguridad, y de que el recuento de parámetros por sí solo no caracteriza el comportamiento de un modelo.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son las métricas de seguridad de la model card. En las métricas de tasa de éxito de ataque (ASR), un valor más alto indica peor seguridad.

| Metrica | Valor | Juez / arnes |
|---|---|---|
| AdvBench ASR | 0,6250 | HarmBench judge |
| StrongREJECT ASR | 0,4600 | HarmBench judge |
| Sobrerrechazo macro | 0,0228 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MATH u otros) en la información disponible. Tampoco se proporcionan los valores correspondientes a `meta-llama/Llama-3.1-8B-Instruct` sin comprimir medidos con el mismo arnés, por lo que no es posible calcular la degradación relativa a partir de los datos disponibles.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, coherente con el tamaño de repositorio de 16,1 GB. Hay que sumar caché KV y activaciones. La información proporcionada no indica que la compresión SVD reduzca el consumo de memoria, dado que el recuento de parámetros coincide con el del modelo denso.
- Caché KV: no disponible en la información proporcionada. Como referencia, en la arquitectura estándar de Llama 3.1 8B en fp16 el coste ronda 128 KiB por token; a 128.000 tokens de contexto supondría del orden de 16 GB adicionales. Es una estimación derivada del modelo base, no un dato publicado por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G) permite inferencia en bf16 con contexto moderado; una A100 40/80 GB o H100 dan margen para contextos largos y lotes mayores.
- GPU de consumo: sí cabe en tarjetas de 24 GB en bf16, y previsiblemente en 8-12 GB si se aplica una cuantización de 8 o 4 bits, aunque el autor no publica variantes cuantizadas ni verifica ese escenario.
- Opciones de despliegue: `transformers` y `text-generation-inference` están soportados explícitamente según los tags; también son razonables vLLM y Ollama, si bien no se documentan en la model card. No se publican ficheros GGUF, por lo que `llama.cpp` requeriría una conversión previa no proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se limita al modelo base, ya que la información disponible no incluye datos de otros modelos comprimidos de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Formato | Seguridad medida | Disponibilidad |
|---|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r04` | 8.030.261.248 (70% efectivo declarado) | No disponible | Llama 3.1 Community | safetensors | AdvBench ASR 0,6250; StrongREJECT ASR 0,4600; sobrerrechazo 0,0228 | Repositorio público, 0 descargas y 0 likes |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.030.261.248 | 128.000 tokens (según el modelo base) | Llama 3.1 Community | safetensors | No disponible en la información proporcionada | Ampliamente disponible |
| Otras celdas del grid `svd-safety-l31` | No disponible | No disponible | Llama 3.1 Community | safetensors | No disponible | No disponible |

## Limitaciones y advertencias

- Artefacto de investigación, no asistente desplegable: el propio autor indica que debe tratarse como sujeto experimental y no como un asistente listo para uso.
- Seguridad degradada de forma deliberada en varias celdas del grid: la compresión por sí sola eleva la tasa de éxito de ataque, y el objetivo del estudio es cuantificarlo. Los valores medidos aquí (ASR de 0,6250 en AdvBench y 0,4600 en StrongREJECT) son muy altos y desaconsejan cualquier exposición a usuarios finales.
- Riesgo elevado de contenido dañino: no debe conectarse a interfaces públicas, canales de atención al cliente ni sistemas con acceso a herramientas sin una capa de moderación externa validada.
- Alucinación: no se han publicado evaluaciones de veracidad ni de fidelidad factual; la compresión puede afectar a la calidad de las respuestas de formas no medidas en estos datos.
- Idiomas: no se declara ningún conjunto de idiomas soportados en la información proporcionada, por lo que no puede asumirse un comportamiento multilingüe fiable.
- Contexto: no se documenta la ventana efectiva tras la compresión ni si se mantiene la del modelo base.
- Discrepancia de parámetros: la model card declara una fracción de parámetros de 0,6999, mientras que el recuento de safetensors coincide con el del modelo denso. No se explica en la documentación disponible y afecta a cualquier estimación de memoria o coste.
- Licencia: se rige por la Llama 3.1 Community License, que impone condiciones adicionales a los modelos derivados (identificación como derivado, obligaciones de atribución y política de uso aceptable). Debe revisarse `USE_POLICY.md` antes de cualquier uso comercial.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Metadatos de fecha: la ficha figura creada y actualizada el 17 de septiembre de 2026, sin historial de versiones posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
- Paper de SVD-LLM: no disponible en la información proporcionada
- Otros recursos, papers, demos o repositorios: la búsqueda web realizada no devolvió resultados relevantes para este modelo ni para la técnica SVD-LLM
