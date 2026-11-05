# ReBatch/Qwen3.8-27B-Weight-Space-Programming

## Resumen

Qwen3.8-27B-Weight-Space-Programming es un derivado experimental del modelo Qwen/Qwen3.8-27B publicado por el usuario ReBatch en HuggingFace. No se trata de un fine-tuning convencional ni de un adaptador LoRA, sino de una edición directa de pesos (*weight-space programming*) que modifica una única proyección de salida MLP del modelo base. El checkpoint resultante mantiene la arquitectura y el tamaño del original (27.781.427.952 parámetros en BF16) pero incorpora un cambio localizado en la capa 29 que altera el comportamiento del modelo en la evaluación CCPBench.

La relevancia de esta ficha es fundamentalmente metodológica: el autor documenta de forma explícita un compromiso medido entre la reducción de la puntuación en CCPBench (de 2.714 a 1.518 en escala 1-5) y el deterioro simultáneo en otras capacidades como IFBench, HumanEval, HumanEval+ y FinanceBench. El propio autor advierte que no se ha logrado preservar capacidades y que el resultado no demuestra mayor veracidad, neutralidad política ni mejora general del alineamiento. Es, por tanto, un artefacto de investigación sobre edición de parámetros, no un modelo listo para producción.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors, con pipeline image-text-to-text (heredado del base) y compatibilidad declarada con vLLM y endpoints. La edición afecta a 19.680.881 pesos escalares almacenados, aproximadamente el 0,071% del total del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, familia qwen3_5); edición en proyección MLP de la capa 29 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint almacenado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 18 shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B en la revisión exacta `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. Sobre esa base se aplica una edición dispersa en el tensor `model.language_model.layers.29.mlp.down_proj.weight`, seleccionando 4.096 columnas de entrada y modificando 19.680.881 pesos escalares almacenados (aproximadamente el 0,071% de los 27.781.427.952 parámetros del checkpoint). La fuerza de edición es 12 y se aplicaron ocho pasos de corrección de redondeo. El candidato liberado se identifica como `repair-joint-quantwide-l29-a12`, el número 12 de una búsqueda de reparación conjunta.

La edición se materializa en el checkpoint completo, no como adaptador. El shard modificado es `model-00009-of-00018.safetensors`; los otros 17 shards y los metadatos de modelo y tokenizador coinciden con la base fijada según la auditoría de integridad registrada. No se documentan datos de entrenamiento, composición del dataset, ni fases de RLHF/DPO específicas para esta edición, ya que no es un proceso de entrenamiento sino de programación directa en el espacio de pesos. La evaluación se realizó en modo solo texto y con *thinking* habilitado.

## Capacidades

- Generación de texto y razonamiento en modo *thinking*, heredados del modelo base Qwen3.8-27B.
- Generación de código: evaluado en HumanEval y HumanEval+ con tasas de pass@1 del 96,95% y 92,07% respectivamente tras la edición.
- Seguimiento de instrucciones: evaluado en IFBench con precisión laxa del 66,00% y estricta del 59,67%.
- Razonamiento sobre documentos financieros: evaluado en FinanceBench con contexto oráculo, 90,00% de precisión.
- Conocimiento factual: evaluado en AA-Omniscience Public v1.1 con 23,67% de precisión.
- Pipeline declarado image-text-to-text (heredado del base); no se documentan evaluaciones multimodales específicas de esta edición.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre edición de pesos en el espacio de parámetros: el modelo sirve como caso de estudio reproducible de cómo una modificación del 0,071% de los parámetros afecta a métricas de comportamiento, con protocolo de evaluación pareado documentado.
- Auditoría de metodologías de evaluación de alineamiento: permite examinar cómo se construyen y puntúan benchmarks como CCPBench, IFBench o AA-Omniscience, y comparar juicios locales con evaluaciones originales.
- Estudio de transferencia de efectos en modelos derivados: útil para analizar si una edición localizada en una capa MLP produce efectos colaterales medibles en tareas de código, instrucciones y conocimiento factual.
- Reproducción de experimentos de *weight-space programming*: el autor documenta hashes, shards y pasos de reconstrucción en MODIFICATIONS.md, lo que facilita replicar el pipeline de edición sobre la misma revisión base.
- Comparación de protocolos de jueceo automático: el uso de jueces locales ciegos (`gpt-6.1-terra`, `gpt-6-luna`) frente a evaluaciones humanas originales permite estudiar la sensibilidad de los resultados al juez empleado.
- Docencia y divulgación técnica: ejemplo didáctico de cómo reportar un resultado negativo con intervalos de confianza bootstrap pareados y análisis de sensibilidad por clustering de fuentes.

## Benchmarks y rendimiento

Evaluaciones locales pareadas sobre el modelo original y el checkpoint editado. Las diferencias son editado menos original. En CCPBench el objetivo es reducir la puntuación; en el resto, mayor es mejor.

| Métrica | Preguntas | Original | Editado | Diferencia | Intervalo 95% pareado |
|---|---:|---:|---:|---:|---:|
| CCPBench-A media (escala 1-5) | 500 | 2,714 | 1,518 | −1,196 | [−1,336, −1,060] |
| IFBench precisión laxa | 300 | 68,67% | 66,00% | −2,67 pp | [−7,00, +1,67] pp |
| IFBench precisión estricta | 300 | 61,67% | 59,67% | −2,00 pp | [−6,33, +2,33] pp |
| HumanEval pass@1 | 164 | 98,17% | 96,95% | −1,22 pp | [−3,66, +1,22] pp |
| HumanEval+ pass@1 | 164 | 93,90% | 92,07% | −1,83 pp | [−4,27, 0,00] pp |
| FinanceBench precisión oráculo | 150 | 91,33% | 90,00% | −1,33 pp | [−6,00, +3,33] pp |
| AA-Omniscience Public v1.1 precisión | 300 | 22,33% | 23,67% | +1,33 pp | [−2,33, +5,00] pp |
| AA-Omniscience Public v1.1 índice primario | 300 | −33,33 | −35,00 | −1,67 | [−9,67, +6,33] |

Éxitos exactos: IFBench laxa 206→198, estricta 185→179; HumanEval 161→159; HumanEval+ 154→151; FinanceBench 137→135; Omniscience respuestas correctas 67→71. HumanEval y HumanEval+ evalúan los mismos programas generados. El índice Omniscience se calcula como 100 × (correctas − incorrectas) / N; los recuentos primarios (correctas, incorrectas, parciales, no intentadas) son (67, 167, 10, 56) para el original y (71, 176, 5, 48) para la edición. Una corrección congelada antes del scoring final cambia un caso (pregunta 190) de parcial a incorrecta en ambos modelos, dejando los índices corregidos en −33,67 y −35,33. CCPBench incluye 375 preguntas sobre China y 125 controles, con medias que pasan de 3,1973→1,6560 y 1,2640→1,1040 respectivamente. El análisis de sensibilidad agrupando las 500 preguntas por sus 428 artículos fuente da un intervalo de [−1,343, −1,051]. Los intervalos usan 20.000 remuestreos bootstrap pareados con semilla 42.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: no disponible de forma explícita; con 27.781.427.952 parámetros en BF16, el peso de los parámetros ronda los 55,6 GB, por lo que se requiere al menos una GPU de 80 GB (A100, H100) o sharding multi-GPU.
- VRAM estimada en cuantizaciones de 8 bits o 4 bits: no disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? No en BF16 con una sola GPU de consumo estándar (24 GB o menos). No se documentan cuantizaciones que permitan reducir el requisito.
- Opciones de despliegue: vLLM (etiqueta declarada en el modelo), transformers (librería declarada). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CCPBench-A | IFBench laxa | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| Qwen3.8-27B-Weight-Space-Programming (este) | 27,78 B | no disponible | 1,518 | 66,00% | 96,95% | Apache 2.0 | HuggingFace (ReBatch) |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | 2,714 | 68,67% | 98,17% | Apache 2.0 | HuggingFace (Qwen) |
| Otras alternativas de 27B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con el modelo base, del que este checkpoint deriva. No se proporcionan datos de otros modelos de tamaño o categoría comparable en la información disponible.

## Limitaciones y advertencias

- El propio autor declara que no se ha logrado preservar capacidades y que la puntuación de 1,518 sigue por encima del objetivo exacto original de 1,50.
- Una puntuación más baja en CCPBench no demuestra mayor veracidad, neutralidad política, adopción de "valores occidentales" ni mejora general del alineamiento.
- Deterioro medido en IFBench, HumanEval, HumanEval+, FinanceBench y el índice primario de Omniscience; solo la precisión de Omniscience mejora ligeramente (+1,33 pp), con intervalo que incluye cero.
- Los intervalos de confianza contienen cero en varias métricas; el autor advierte explícitamente que un intervalo que contiene cero no establece equivalencia, no inferioridad ni preservación de capacidades.
- Los intervalos condicionan sobre las salidas y juicios guardados, omiten la incertidumbre del juez y los efectos de selección, y no están ajustados por comparaciones múltiples.
- Las evaluaciones son locales y pareadas, no envíos oficiales a leaderboards; los jueces son modelos locales ciegos (`gpt-6.1-terra`, `gpt-6-luna`) en lugar de las evaluaciones humanas originales.
- Evaluación realizada solo en modo texto y con *thinking* habilitado; no se documentan resultados multimodales pese al pipeline image-text-to-text.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe específica de esta edición.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación con capacidades degradadas, no se recomienda su despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReBatch/Qwen3.8-27B-Weight-Space-Programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio CCPBench: https://github.com/lesageethan/CCPBench
- Evaluador IFBench: https://github.com/allenai/IFBench
- EvalPlus (HumanEval+): https://github.com/evalplus/evalplus
- FinanceBench: https://github.com/patronus-ai/financebench
- Dataset AA-Omniscience Public v1.1: https://huggingface.co/datasets/ArtificialAnalysis/AA-Omniscience-Public-v1.1
- MODIFICATIONS.md: referenciado en la model card dentro del repositorio del modelo (https://huggingface.co/ReBatch/Qwen3.8-27B-Weight-Space-Programming/blob/main/MODIFICATIONS.md)
