# benzeng/tritfold-1.7b-feature-ptq1_0

## Resumen

Tritfold 1.7B es un modelo de generación de texto derivado de Qwen/Qwen3-1.7B cuyos pesos han sido cuantizados a ternario mediante entrenamiento consciente de cuantización (QAT) y destilación a nivel de características. Lo desarrolla el autor independiente benzeng como reproducción de investigación del método de cuantización ternaria, sin vinculación con PrismML ni Caltech. Su interés radica en que demuestra que un modelo de ~2.030 millones de parámetros (2.031.739.904) puede almacenarse en 424 MB (1,75 bits por peso) conservando tanto la capacidad de discriminación como la de generación de texto coherente.

La innovación principal de la versión v0.6 es la combinación de destilación a nivel de salida (KL) con coincidencia de coseno a nivel de características (hidden-state cosine matching), lo que según el autor separa dos dimensiones independientes: la forma de la distribución (cómo habla el modelo) y la internalización de conocimiento (qué sabe). Esto permite al modelo seleccionar la respuesta correcta entre opciones con bastante más fiabilidad de la que muestra al generar esa misma respuesta en texto libre.

El modelo es relevante como caso de estudio de cuantización extrema a 1,58 bits y como pieza para despliegues en hardware muy limitado. No es un modelo de propósito general: su generación factual está restringida por la capacidad de almacenamiento de pesos ternarios, por lo que encaja mejor como componente dentro de pipelines con recuperación aumentada (RAG) o como modelo auxiliar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (heredada de Qwen/Qwen3-1.7B) con pesos ternarios; no es MoE ni SSM |
| Parametros totales | 2.031.739.904 (~2,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; un índice de terceros (Free2AITools) indica 4.096 tokens |
| Tipos de cuantizacion | Ternaria PTQ1_0, 1,75 bpw efectivos (1,58 bits por peso); tamaño del fichero 424 MB |
| Idiomas soportados | No disponible (el autor no especifica idiomas; el modelo base Qwen3-1.7B es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (librería gguf) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3-1.7B, un transformer decoder denso, sobre el que se ha aplicado una cuantización ternaria (valores de peso en {-1, 0, +1}) con escalado, alcanzando 1,58 bits por peso y 1,75 bpw efectivos. La cuantización se realizó mediante entrenamiento consciente de cuantización (quantization-aware training) combinado con destilación, y no es una simple PTQ post-hoc. El autor reconstruyó el método a partir de literatura publicada, citando en los agradecimientos trabajos como QuaRot, SpinQuant, QuIP#, PV-Tuning, BitDistiller, TernaryLLM, LLM-QAT y OneBit.

La innovación del pipeline de v0.6 es la destilación en dos niveles: KL a nivel de salida, que transfiere la forma de la distribución del profesor, y coincidencia de coseno sobre los estados ocultos (feature-level distillation), que según el autor transfiere la capacidad de discriminación y no está acotada por la calidad del profesor. A esto se añade una fase de recuperación con datos de instrucciones (ultrachat) para restaurar la fluidez de generación. El entrenamiento se describe como aproximadamente tres sesiones en A100 (v0.3, luego feature-distill, luego recuperación con ultrachat). El modelo no publica el número total de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto coherente: la v0.6 restaura la generación fluida respecto a versiones anteriores (v0.1-v0.3), que entraban en bucles y confabulaban.
- Discriminación y selección de respuestas: capacidad destacada para elegir la opción correcta entre alternativas (por ejemplo, sciq).
- Razonamiento de opción múltiple limitado: resultados funcionales pero modestos en ARC-Challenge.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Tamaño muy reducido (424 MB), apto para entornos con memoria muy restringida.

## Casos de uso

- Clasificación y ranking de respuestas: el modelo está optimizado para seleccionar la opción correcta entre varias (por encima del 72% del rendimiento del modelo en precisión completa en sciq), por lo que encaja en tareas de reranking o filtrado de candidatos generados por otro sistema.
- Componente de un pipeline RAG: dado que la generación factual en texto libre está limitada por la capacidad ternaria, su uso natural es generar respuestas apoyándose en contexto recuperado, no como fuente de conocimiento propia.
- Despliegue en edge y dispositivos con poca memoria: con 424 MB de pesos, puede ejecutarse en GPUs integradas, CPU e incluso hardware embebido sin acelerador dedicado.
- Modelo borrador para decodificación especulativa: su bajo coste de inferencia lo hace candidato a generar borradores que un modelo mayor verifica, si el formato ternario se integra en el runtime correspondiente.
- Prototipado e investigación en cuantización: sirve como referencia reproducible para estudiar el efecto de la destilación a nivel de características frente a la destilación solo con KL.
- Filtrado previo en pipelines de datos: descartar candidatos irrelevantes en la construcción de datasets antes de pasarlos a un modelo de mayor tamaño.
- Aplicaciones educativas o de evaluación: por sus resultados en conjuntos tipo sciq/ARC, puede integrarse en herramientas de preguntas de opción múltiple.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Las columnas marcadas como "FP" expresan el porcentaje del rendimiento respecto al modelo de 1.7B en precisión completa.

| Benchmark | Valor | Relación con FP |
|---|---|---|
| sciq val (decontaminado, n=845) | acc 0,536 / acc_norm 0,485 | 72% del FP en acc_norm |
| ARC-Challenge | acc 0,246 / acc_norm 0,279 | 74% del FP en acc_norm |
| Wiki ppl (protocolo bf16) | 26,52 | 1,03× del FP de 1.7B |
| Tamaño | 424 MB | 9,1× más pequeño (1,75 bpw) |

Comparativa interna entre versiones del propio modelo:

| Versión | sciq acc_norm (FP) | ARC acc_norm (FP) | Generación | Wiki ppl |
|---|---|---|---|---|
| v0.1-v0.3 (solo KL) | ~0,40 (57%) | ~0,26 (69%) | Bucles / confabulación | 1,24-1,41× FP |
| v0.6 (KL + coseno) | 0,485 (72%) | 0,279 (74%) | Texto coherente | 1,03× FP |

No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 0,42 GB (fichero de 424 MB); debe sumarse la caché KV, que depende del contexto configurado.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas con memoria compartida.
- Puede ejecutarse en CPU sin acelerador dedicado, dado el tamaño del modelo.
- Despliegue: requiere el fork de llama.cpp de PrismML (rama `prism`), enlazado en la model card. La rama principal de llama.cpp no puede cargar el formato PTQ1_0, por lo que no es directamente usable en vLLM, Ollama o TGI con los binarios estándar (no confirmado en la información disponible).
- Receta de muestreo obligatoria según el autor: `--temp 0.5 --top-p 0.85 --top-k 20 --repeat-penalty 1.1`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| Tritfold 1.7B feature (este) | ~2,03 mil M | Ternaria PTQ1_0, 1,75 bpw | No disponible (terceros: 4.096) | Apache-2.0 | Generación coherente + discriminación; pipeline especial |
| benzeng/tritfold-1.7b-instruct-ptq1_0 | ~2,03 mil M | Ternaria PTQ1_0 | No disponible | Apache-2.0 | Variante ajustada con ultrachat (60%) + wiki (40%) |
| Qwen/Qwen3-1.7B | ~2,03 mil M | bf16 / FP | No disponible en esta ficha | Apache-2.0 | Modelo base; sirve como referencia de máxima precisión (ppl 26,52 = 1,03× de este) |

No se dispone de cifras comparables de otros modelos ternarios de tamano similar (por ejemplo, BitNet b1.58) en la información proporcionada, por lo que no se incluyen datos numéricos de terceros.

## Limitaciones y advertencias

- Capacidad factual limitada: el autor reconoce que 1,58 bits por peso no puede almacenar todos los hechos; el modelo puede seleccionar la respuesta correcta entre opciones pero falla al generarla en texto libre. La propia model card recomienda complementarlo con RAG.
- Riesgo de confabulación en generación libre no asistida por contexto, aunque la v0.6 lo reduce frente a versiones anteriores.
- Dependencia de un fork concreto de llama.cpp: sin la rama `prism` de PrismML el modelo no carga, lo que limita su portabilidad y su integración en stacks estándar.
- Dependencia de una configuración de muestreo concreta; fuera de esa receta el comportamiento puede degradarse.
- Idiomas soportados no especificados; el rendimiento multilingüe no está documentado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0, lo que permite uso comercial, pero al ser derivado de Qwen3-1.7B conviene conservar la atribución correspondiente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte muy limitados, sin garantías de mantenimiento.
- Adecuado solo para tareas en las que el tamaño y el coste sean críticos; no recomendado como modelo principal de conocimiento o generación de alta calidad.
- La longitud de contexto no está confirmada por el autor; el dato de 4.096 tokens procede de un índice de terceros y debe verificarse antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/benzeng/tritfold-1.7b-feature-ptq1_0
- Variante base del mismo autor: https://huggingface.co/benzeng/tritfold-1.7b-ptq1_0
- Variante instruct: https://huggingface.co/benzeng/tritfold-1.7b-instruct-ptq1_0
- Repositorio GitHub del proyecto: https://github.com/benzeng/tritfold
- Fork de llama.cpp requerido (PrismML, rama `prism`): https://github.com/PrismML-Eng/llama.cpp
- Ficha en índice de terceros (Free2AITools): https://free2aitools.com/model/benzeng/tritfold-1.7b-ptq1_0
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
