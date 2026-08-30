# rafmacalaba/lfm2.5-350M-datause-multitask-tiered

## Resumen

El modelo `rafmacalaba/lfm2.5-350M-datause-multitask-tiered` es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base `LiquidAI/LFM2.5-350M`, desarrollado por el autor `rafmacalaba`. Su propósito es automatizar el análisis de menciones de datos en textos científicos, extrayendo atributos de procedencia (productor, año, geografía, acrónimo, bibtex) y clasificando el uso e impacto de dichos datos mediante etiquetas estructuradas. El modelo resuelve el problema de la anotación manual de metadatos en publicaciones, un paso crítico para la trazabilidad y reutilización de conjuntos de datos.

El adaptador se entrenó exclusivamente sobre las filas ancladas en los niveles T1∪T2 del dataset `rafmacalaba/data-use-sft-tiered`, con una política de partición por niveles documentada en la ficha del dataset. La arquitectura subyacente es la LFM2 de Liquid AI, un modelo de 350 millones de parámetros diseñado para entornos con restricciones de memoria y cómputo, que combina capas de atención con mecanismos de espacio de estado (SSM) para lograr inferencia rápida. El modelo base ha sido pre-entrenado con 28 billones de tokens y refinado con aprendizaje por refuerzo a gran escala, lo que le confiere buenas capacidades de seguimiento de instrucciones y llamada a herramientas.

La relevancia de este adaptador radica en su especialización: convierte un modelo generalista de generación de texto en un extractor de metadatos de datos con salida JSON estructurada, útil para pipelines de minería de literatura, curaduría de repositorios y análisis de impacto. Al ser un LoRA, el coste de inferencia es bajo y puede desplegarse en hardware modesto, incluidas CPUs.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model 2), híbrida SSM + atención |
| Parametros totales | 350M (modelo base) + parámetros LoRA (r=16, no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LiquidAI/LFM2.5-350M`, un modelo de 350M de parámetros de la familia LFM2 de Liquid AI. La arquitectura LFM2 combina capas de atención con bloques de espacio de estado (SSM), lo que permite una inferencia eficiente en secuencias largas y un menor coste computacional frente a transformers puros. El modelo base fue pre-entrenado con 28 billones de tokens y posteriormente refinado con aprendizaje por refuerzo, mejorando sus capacidades de chat, seguimiento de instrucciones y tool calling.

El entrenamiento del LoRA se realizó con el dataset `rafmacalaba/data-use-sft-tiered`, en sus configuraciones de procedencia y uso/impacto. Se emplearon 3 épocas, una tasa de aprendizaje de 0.0002, y una configuración LoRA de r=16, alpha=32 y dropout=0.05. El entrenamiento utilizó enmascaramiento de solo-completado, de modo que la pérdida se calcula únicamente sobre el turno de respuesta JSON del asistente. Esta técnica permite que el modelo aprenda a generar la estructura JSON completa sin penalizar el prompt de entrada.

## Capacidades

- Extracción de atributos de procedencia de menciones de datos: productor (producer), año (year), geografía (geography), acrónimo (acronym) y entrada bibtex.
- Clasificación del tipo de dato (data_type) con macro-F1 de 0.5026 en el holdout.
- Clasificación de especificidad (specificity) con macro-F1 de 0.9423 en el holdout.
- Clasificación de la acción de uso (usage_action) con macro-F1 de 0.6573 en el holdout.
- Clasificación de la etiqueta de impacto (impact_label) con macro-F1 de 0.6352 en el holdout.
- Generación de un resumen de uso (usage_summary) con similitud media de 0.5604 y tasa de fundamentación (grounded_rate) de 0.6720.
- Generación de salidas JSON estructuradas, adecuadas para integración en pipelines de procesamiento de texto.
- Capacidad de seguir instrucciones y generar texto conversacional, heredada del modelo base.

## Casos de uso

- Anotación automática de datasets en publicaciones científicas: el modelo puede procesar párrafos de artículos que mencionan conjuntos de datos y extraer automáticamente el productor, año, geografía y acrónimo, generando una entrada bibtex canónica. Esto reduce el trabajo manual en la creación de catálogos de datos.
- Construcción de catálogos de datos con metadatos estructurados: integrado en un pipeline de minería de literatura, el modelo convierte menciones libres en registros JSON listos para ser indexados en bases de datos de repositorios científicos.
- Análisis de impacto de datos en políticas: la clasificación de impacto_label (p. ej., policy, evidence-base) permite identificar qué datasets son citados en contextos de formulación de políticas, facilitando estudios de influencia de datos en la toma de decisiones.
- Curación de repositorios de datos: el modelo puede clasificar la acción de uso (usage_action) de un dataset (analizar, informar, curar, etc.), ayudando a los curadores a entender cómo se reutilizan los datos y a priorizar esfuerzos de mantenimiento.
- Extracción de información para bases de datos bibliográficas: la generación de bibtex a partir de menciones de datos permite enriquecer referencias bibliográficas con metadatos de datasets, mejorando la interoperabilidad entre sistemas de citación.
- Clasificación de especificidad de datos: el modelo distingue entre menciones genéricas y específicas de datasets, lo que es útil para filtrar ruido en búsquedas de literatura y para estudios de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador, ya que se trata de un modelo especializado en una tarea concreta. Los datos de rendimiento disponibles provienen del holdout interno del propio modelo (n=8804), calculados con extracción JSON corregida. A continuación se presentan las métricas reportadas en la model card.

**Procedencia — atributos verbatim (coincidencia exacta)**

| Atributo | TP | FP | FN | Precisión | Recall | F1 |
|---|---|---|---|---|---|---|
| producer | 1050 | 368 | 168 | 0.7405 | 0.8621 | 0.7967 |
| year | 980 | 241 | 259 | 0.8026 | 0.7910 | 0.7967 |
| geography | 1531 | 436 | 205 | 0.7783 | 0.8819 | 0.8269 |
| acronym | 1175 | 204 | 149 | 0.8521 | 0.8875 | 0.8694 |
| **overall** | 4736 | 1249 | 781 | 0.7913 | 0.8584 | 0.8235 |

**Bibtex** (filas doradas con productor y año): exacto 33.6%, semántico (autor+título+año, ignorando clave) 58.2%, formato canónico 99.7% de las 362 emisiones, omitido en 167 casos (entradas sin productor/año), alucinado en 180 filas sin valor dorado.

**Clasificaciones adicionales**

| Tarea | Métrica | Valor |
|---|---|---|
| data_type | macro-F1 | 0.5026 (n=1198) |
| specificity | macro-F1 | 0.9423 (n=3325) |
| usage_action | macro-F1 | 0.6573 (n=5479) |
| impact_label | macro-F1 | 0.6352 (n=5479) |
| usage_summary | mean_sim | 0.5604 |
| usage_summary | grounded_rate | 0.6720 |

## Requisitos de hardware

- El modelo base tiene 350M de parámetros, por lo que el adaptador LoRA añade una cantidad mínima de parámetros adicionales. La inferencia puede ejecutarse en CPU sin problemas, con una latencia de unos pocos cientos de milisegundos por ejemplo en hardware moderno.
- VRAM estimada: menos de 2 GB en precisión fp16, lo que permite ejecutarlo en GPUs de consumo como la NVIDIA GTX 1060, RTX 2060 o superiores.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; para despliegues concurrentes se recomienda una RTX 3090 o A10.
- Opciones de despliegue: al ser un modelo de Hugging Face con pesos safetensors, puede cargarse con la librería `transformers` de Python, o servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- Throughput estimado: en una GPU moderna, se pueden procesar cientos de ejemplos por segundo dada la pequeña escala del modelo; en CPU, el rendimiento depende del número de núcleos, pero es viable para procesamiento por lotes.

## Comparativa con modelos similares

Existen dos variantes adicionales del mismo autor con nombres similares: `rafmacalaba/lfm2.5-350M-datause-multitask` y `rafmacalaba/lfm2.5-350M-multitask-datause`. No se dispone de métricas comparativas publicadas para estas variantes, por lo que la comparación se limita a la configuración declarada.

| Modelo | Base | Dataset | Configuración LoRA | Métricas holdout |
|---|---|---|---|---|
| lfm2.5-350M-datause-multitask-tiered | LFM2.5-350M | data-use-sft-tiered (T1∪T2) | r=16, alpha=32, dropout=0.05, 3 épocas | Reportadas en esta ficha |
| lfm2.5-350M-datause-multitask | LFM2.5-350M | data-use-sft (sin tier) | No especificada | No disponibles |
| lfm2.5-350M-multitask-datause | LFM2.5-350M | data-use-sft (sin tier) | No especificada | No disponibles |

Frente al modelo base `LiquidAI/LFM2.5-350M`, este adaptador sacrifica generalidad para especializarse en la tarea de extracción de metadatos de datos, ofreciendo una salida JSON estructurada que el base no produce de forma nativa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre un dataset específico (data-use-sft-tiered) con una política de niveles T1∪T2, por lo que su capacidad de generalización a otros dominios o formatos de texto no está garantizada.
- Se observan alucinaciones en la generación de bibtex: 180 casos en el holdout donde se emitió un bibtex sin valor dorado. Esto puede propagar referencias falsas si no se valida externamente.
- Las confusiones más frecuentes en la clasificación de uso/impacto (p. ej., analyze ↔ inform, policy ↔ evidence-base) indican solapamiento semántico entre categorías, lo que puede requerir ajuste fino adicional para aplicaciones críticas.
- La clasificación de data_type presenta un macro-F1 relativamente bajo (0.5026), lo que sugiere dificultad para distinguir tipos de datos en contextos ambiguos.
- No se especifican los idiomas soportados; el dataset de entrenamiento probablemente esté en inglés, por lo que el rendimiento en otros idiomas es incierto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base LFM2.5-350M tiene su propia licencia (probablemente también Apache-2.0, según la documentación de Liquid AI); se recomienda verificar los términos del modelo base antes de un despliegue comercial.
- El repositorio no incluye información sobre la longitud de contexto efectiva tras el ajuste LoRA, ni sobre la cuantización de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/lfm2.5-350M-datause-multitask-tiered
- Variante sin tier: https://huggingface.co/rafmacalaba/lfm2.5-350M-datause-multitask
- Variante multitask-datause: https://huggingface.co/rafmacalaba/lfm2.5-350M-multitask-datause
- Documentación del modelo base LFM2.5-350M: https://docs.liquid.ai/lfm/models/lfm25-350m
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
