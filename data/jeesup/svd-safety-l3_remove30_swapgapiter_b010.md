# Jeesup/svd-safety-l3_remove30_swapgapiter_b010

## Resumen

`svd-safety-l3_remove30_swapgapiter_b010` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace, derivado de `meta-llama/Meta-Llama-3-8B-Instruct`. No es un modelo conversacional de propósito general, sino un artefacto experimental: se ha comprimido el modelo base mediante SVD-LLM hasta conservar el 70,0 % de los parámetros densos (30,01 % eliminado) y, a continuación, se han aplicado 10 de 10 rondas de una técnica de edición denominada "swap paramétricamente neutro", seleccionando los componentes a restaurar con la regla `gap_iter`.

El objetivo del estudio del que forma parte es cuantificar cómo la compresión SVD degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes repara mejor ese daño con el menor coste posible. El presupuesto total de restauración es del 1,000 % de los parámetros densos (69.741.568 parámetros intercambiados, 9.903 componentes restaurados y otros tantos expulsados, con semilla 42), lo que deja la fracción de parámetros final en 0,6999.

La relevancia de esta ficha es doble: por un lado, ilustra una línea de trabajo poco habitual en compresión de LLM, la de medir el impacto en seguridad (tasa de éxito de ataques, sobrerrechazo) además de la perplejidad; por otro, el propio autor advierte explícitamente de que varias celdas de su grid están deliberadamente degradadas en seguridad y de que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de Llama 3 (hereda la del modelo base `Meta-Llama-3-8B-Instruct`) |
| Parametros totales | 8.030.261.248 (fraccion densa resultante: 0,6999) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-3-8B-Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en `safetensors` sin cuantizaciones GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible en la model card; hereda los del modelo base |
| Licencia | Meta Llama 3 Community License (`license: llama3`), con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors (libreria `transformers`, `text-generation-inference`, `endpoints_compatible`) |
| Tamano del repositorio | 16,1 GB |
| Modelo base | `meta-llama/Meta-Llama-3-8B-Instruct` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda, 10 rondas) |
| Componentes restaurados / expulsados | 9.903 / 9.903 |
| Regla de seleccion | `gap_iter` |
| Valor de swap | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |

## Arquitectura y entrenamiento

El checkpoint parte de `Meta-Llama-3-8B-Instruct`, un transformer decoder-only de 8.000 millones de parámetros con atención agrupada por consultas (GQA), RoPE, activaciones SwiGLU y normalización RMSNorm, ajustado por instrucciones por Meta. Sobre ese modelo se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone en valores singulares las matrices de proyección y trunca componentes de forma selectiva; en este caso se elimina el 30,01 % de los parámetros densos, dejando la fracción en 0,6999.

Sobre el modelo comprimido se aplica después un procedimiento de edición denominado swap paramétricamente neutro: en cada ronda se restauran componentes del modelo original y se expulsan otros tantos, de modo que el número de parámetros permanece constante. La selección de qué componentes restaurar la determina la regla `gap_iter`, y el presupuesto se reparte en 10 rondas de 0,100 % cada una, hasta un total de 69.741.568 parámetros intercambiados (1,00 % de los parámetros de proyección densos). El valor de swap es `insert`, y el desalojo de los componentes sustituidos sigue un orden basado en los valores sigma.

No se documenta en la información disponible ningún reentrenamiento adicional, ajuste por RLHF o DPO posterior a la compresión: la intervención es exclusivamente de edición de parámetros sobre pesos ya existentes. Tampoco se detallan la composición del dataset de compresión ni el número de tokens utilizados.

## Capacidades

- Generación de texto conversacional: al derivar de Llama-3-8B-Instruct, conserva la capacidad de mantener diálogo multiturno con formato de chat, aunque degradada por la compresión.
- Razonamiento e instrucciones: mantiene, en grado no cuantificado en la model card, las capacidades de seguimiento de instrucciones del modelo base.
- Capacidades multilingües: no documentadas en la model card; dependen de lo que conserve el modelo base tras la compresión.
- Tool calling / function calling: no documentado específicamente; el modelo base Llama-3-8B-Instruct sí incorpora plantillas de llamada a herramientas, pero no hay evidencia publicada de que sobrevivan intactas a la compresión.
- Comportamiento de seguridad medible: es la capacidad central del artefacto, con métricas publicadas de tasa de éxito de ataques (AdvBench, StrongREJECT) y de sobrerrechazo sobre WildGuard.
- Modo "thinking": no disponible.
- Visión o audio: no disponible (modelo puramente de texto).

## Casos de uso

- Estudio de compresión y seguridad en LLM: el checkpoint sirve como una celda concreta de un grid experimental para comparar cómo distintas reglas de selección y presupuestos de restauración afectan a la tasa de éxito de ataques. Se usaría cargándolo con `transformers` y ejecutando el mismo protocolo de evaluación (AdvBench, StrongREJECT, WildGuard) que reporta el autor.
- Investigación en interpretabilidad de componentes: los 9.903 componentes restaurados y otros tantos expulsados, identificados por la regla `gap_iter`, permiten analizar qué subconjuntos de parámetros son responsables de comportamientos de seguridad frente a los de utilidad.
- Benchmark de perplejidad en compresión: con una perplejidad de 25,7717 en WikiText-2, es un punto de referencia útil para comparar distintas configuraciones de SVD-LLM y de restauración sobre la misma base.
- Reproducibilidad de experimentos: al fijar semilla 42, presupuesto por ronda, valor de swap y regla de selección, permite replicar exactamente la condición experimental y auditar la metodología del estudio.
- Evaluación de robustez de jueces automáticos: las métricas se obtuvieron con el juez de HarmBench y con WildGuard, por lo que el checkpoint puede emplearse para contrastar la sensibilidad de estos evaluadores ante modelos comprimidos.
- Docencia sobre trade-offs seguridad-utilidad: como caso documentado de un modelo que reduce drásticamente la tasa de ataque a costa de un sobrerrechazo del 0,4433, es material didáctico para explicar que la seguridad no es una propiedad binaria.
- Despliegue en producción: desaconsejado explícitamente por el autor; solo tendría sentido tras una evaluación propia exhaustiva y nunca como asistente de usuario final.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez de HarmBench) | 0,0019 |
| StrongREJECT ASR (juez de HarmBench) | 0,0319 |
| Macro over-refusal (WildGuard) | 0,4433 |
| Perplejidad en WikiText-2 | 25,7717 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras baterías de capacidad general para este checkpoint.

## Requisitos de hardware

- VRAM para inferencia en precisión completa (bf16/fp16): aproximadamente 16 GB solo para pesos, más memoria para caché KV y activaciones; en la práctica, 20-24 GB para contextos cortos.
- VRAM en cuantización de 8 bits: en torno a 8-9 GB de pesos. En 4 bits: en torno a 4,5-5 GB. Estas cuantizaciones no están publicadas en el repositorio y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio en fp16; una RTX 4090 (24 GB) es suficiente para fp16 con contexto moderado, y una RTX 3090 o 4080 también resulta viable.
- GPU de consumo: sí cabe en GPU de consumo de gama alta (RTX 4090, 3090, 4080) en fp16; en GPUs con 8-12 GB solo sería viable tras cuantización a 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (TGI) y `endpoints_compatible` según los tags del repositorio; también vLLM para servicio con batching continuo. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Al conservar el 70 % de los parámetros densos, el coste por token en cómputo debería ser inferior al del modelo base, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_remove30_swapgapiter_b010 | 8,03 B (fraccion densa 0,6999) | no disponible en la model card (base: 8.192) | Meta Llama 3 Community License | HuggingFace, 0 descargas, 0 likes | Artefacto de investigación; AdvBench ASR 0,0019, StrongREJECT ASR 0,0319, over-refusal 0,4433, ppl WikiText-2 25,7717 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Meta Llama 3 Community License | HuggingFace, ampliamente distribuido | Modelo base sin comprimir; la model card del derivado no publica sus métricas comparables |
| Otras celdas del grid del mismo autor (`svd-safety-l3_*`) | 8,03 B (fracciones variables) | no disponible | Meta Llama 3 Community License | HuggingFace | No se dispone de sus métricas en la información proporcionada |
| Modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | No se han encontrado modelos comparables en la búsqueda web realizada |

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor indica explícitamente que se trata de un sujeto experimental y que debe evaluarse por cuenta propia antes de extraer conclusiones.
- Degradación deliberada de seguridad en varias celdas del grid: la compresión por sí sola eleva la tasa de éxito de ataques, y algunos brazos del estudio están degradados a propósito. Aunque esta celda concreta reporta un ASR muy bajo (0,0019 en AdvBench), no debe asumirse ese comportamiento en otras celdas ni extrapolarse.
- Sobrerrechazo elevado: el macro over-refusal medido con WildGuard es 0,4433, lo que implica que el modelo rechaza una fracción considerable de peticiones legítimas. Es un coste directo del ajuste de seguridad.
- Perplejidad degradada: 25,7717 en WikiText-2, muy superior a la de un modelo de 8B sin comprimir, lo que indica pérdida de calidad de modelado del lenguaje.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base, potencialmente amplificados por la compresión y la edición selectiva de componentes.
- Riesgo de alucinación: no cuantificado en la model card; en modelos comprimidos con pérdida de perplejidad elevada, el riesgo tiende a aumentar.
- Idiomas: no se documenta qué idiomas sobreviven a la compresión; el comportamiento multilingüe puede estar degradado de forma desigual.
- Licencia: uso sujeto a la Meta Llama 3 Community License y a `USE_POLICY.md`. Las restricciones de la licencia de Meta (incluidas cláusulas de uso aceptable y obligaciones de atribución "Built with Meta Llama 3") se aplican a este derivado, y conviene revisarlas antes de cualquier uso comercial.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de terceros.
- Reproducibilidad: el resultado depende de la semilla 42, de la regla `gap_iter` y de la versión de SVD-LLM empleada; no se documentan versiones de librerías.
- Sin fecha de publicación fiable: los metadatos indican creación el 18 de septiembre de 2026, lo que puede ser un error de registro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia de Meta Llama 3 (incluida en el repositorio como `LICENSE`) y política de uso (`USE_POLICY.md`): disponibles en el propio repositorio de HuggingFace
- Paper de SVD-LLM, repositorios del autor, demos o blogs asociados: no disponibles en la información proporcionada
- Resultados de la búsqueda web: no se ha recuperado ningún enlace relevante al modelo; los resultados obtenidos corresponden a páginas de una cadena de supermercados y no guardan relación con el objeto de esta ficha
