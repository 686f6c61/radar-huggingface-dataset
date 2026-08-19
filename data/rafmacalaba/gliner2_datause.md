# rafmacalaba/gliner2_datause

## Resumen

Este modelo es un fine-tune de `fastino/gliner2-large-v1` (GLiNER2) para la extracción de menciones de fuentes de datos (datasets, encuestas, censos, registros) en artículos de investigación económica. Lo desarrolla rafmacalaba y se publica bajo licencia Apache 2.0. Resuelve el problema de identificar y clasificar automáticamente las referencias a fuentes de datos en la literatura académica, lo que resulta relevante para análisis bibliométricos, meta-análisis y estudios de reutilización de datos.

Con 486 millones de parámetros y arquitectura transformer bidireccional, el modelo clasifica cada mención en tres categorías: `NAMED_DATA` (nombre propio, título o acrónimo de una fuente concreta), `DESCRIPTIVE_DATA` (fuente descrita con palabras pero sin nombre) y `VAGUE_DATA` (mención genérica sin fuente identificable). Se trata de un modelo de clasificación de tokens (NER) especializado, no de un LLM generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder-only), basado en GLiNER2-large |
| Parámetros totales | 486.444.053 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `fastino/gliner2-large-v1`, un checkpoint de GLiNER2 de tamaño large. GLiNER2 emplea un encoder transformer bidireccional con una capa lineal de clasificación sobre los tokens, lo que permite reconocimiento de entidades nombradas de forma eficiente sin decodificación autoregresiva. El fine-tune se realizó sobre el dataset `rafmacalaba/data-use-mentions` con configuración gliner2, durante 5 épocas, con learning rate de 1e-05 para el encoder y 0,0005 para la tarea, batch size de 8 y precisión bf16. No se indica el uso de RLHF, DPO ni otras técnicas de alineación; al tratarse de un fine-tune supervisado de NER, no se espera que se hayan aplicado.

## Capacidades

- Extracción de menciones de fuentes de datos en textos académicos de economía.
- Clasificación de menciones en tres etiquetas: `NAMED_DATA`, `DESCRIPTIVE_DATA` y `VAGUE_DATA`.
- Reconocimiento de entidades nombradas (NER) especializado en un dominio concreto.
- Fine-tune de un modelo generalista (GLiNER2) adaptado a un corpus específico.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es un modelo de clasificación de tokens puro.

## Casos de uso

- Análisis bibliométrico de literatura económica: identificar automáticamente qué fuentes de datos citan los papers, facilitando estudios de impacto y reutilización.
- Meta-análisis de investigación: extraer menciones de datasets para construir corpus comparables entre estudios.
- Construcción de bases de datos de fuentes de datos: alimentar catálogos estructurados de datasets, encuestas y registros mencionados en la literatura.
- Revisión sistemática de literatura: acelerar la fase de cribado identificando papers que usan determinadas fuentes de datos.
- Pipeline de extracción de información académica: integrar el modelo en flujos de procesamiento de PDFs o textos completos para enriquecer metadatos.
- Estudios de reutilización de datos en investigación: cuantificar qué fuentes se reutilizan y con qué frecuencia en un campo de estudio.

## Benchmarks y rendimiento

La evaluación se realizó sobre un holdout con métricas agnósticas de etiqueta. Los resultados según el umbral de decisión son:

| Umbral | TP | FP | FN | precisión | recall | f0.5 | f1 |
|---|---|---|---|---|---|---|---|
| 0.10 | 7037 | 3193 | 310 | 0.6879 | 0.9578 | 0.7290 | 0.8007 |
| 0.20 | 6915 | 2509 | 432 | 0.7338 | 0.9412 | 0.7676 | 0.8246 |
| 0.30 | 6789 | 2047 | 558 | 0.7683 | 0.9241 | 0.7951 | 0.8390 |
| 0.40 | 6576 | 1700 | 771 | 0.7946 | 0.8951 | 0.8128 | 0.8418 |
| 0.50 | 6300 | 1339 | 1047 | 0.8247 | 0.8575 | 0.8311 | 0.8408 |
| 0.60 | 5855 | 1001 | 1492 | 0.8540 | 0.7969 | 0.8419 | 0.8245 |
| 0.70 | 5072 | 630 | 2275 | 0.8895 | 0.6903 | 0.8410 | 0.7774 |

Mejor F0.5: 0,8419 (umbral 0,6). Mejor F1: 0,8418 (umbral 0,4). No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo no está orientado a tareas de razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 486 millones de parámetros en bf16, los pesos ocupan aproximadamente 972 MB; con activaciones y overhead, se necesitan entre 2 y 4 GB de VRAM según el tamaño del lote y la longitud del texto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A10, A100).
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o una RTX 4060 de 8 GB son suficientes.
- Opciones de despliegue: al usar la librería `gliner2`, se puede integrar en pipelines de Python. También es posible exportar a ONNX o convertir a GGUF para su uso con llama.cpp u Ollama, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| rafmacalaba/gliner2_datause | 486.444.053 | No disponible | Apache 2.0 | NER especializado en data-use mentions |
| fastino/gliner2-large-v1 (base) | No disponible | No disponible | Apache 2.0 | NER generalista zero-shot |

La principal diferencia con el modelo base es la especialización: mientras que `fastino/gliner2-large-v1` reconoce cualquier tipo de entidad definida por el usuario, este fine-tune está limitado a las tres etiquetas de data-use, lo que mejora la precisión en ese dominio concreto a costa de perder generalidad. No se dispone de datos suficientes para comparar con otros modelos de NER especializados en literatura académica.

## Limitaciones y advertencias

- Especialización limitada: solo reconoce menciones de fuentes de datos; no sirve para NER general ni para otras tareas.
- Dependencia del umbral de decisión: la precisión y el recall varían significativamente según el umbral elegido; hay que calibrarlo según el caso de uso (por ejemplo, umbral 0,6 maximiza F0.5, umbral 0,4 maximiza F1).
- Idiomas: no se especifica qué idiomas soporta; dado el contexto de papers de economía, es probable que esté entrenado principalmente en inglés, pero no está documentado.
- Sin datos de sesgos: no se han publicado análisis de sesgos ni de comportamiento en dominios fuera de la economía
