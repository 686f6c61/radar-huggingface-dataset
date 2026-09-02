# nobal/gdv-scout

## Resumen

GDV-Scout es un modelo de reconocimiento de entidades nombradas (NER) biomédico desarrollado por nobal, diseñado para extraer menciones de genes o productos génicos, enfermedades y variantes de secuencia en texto biomédico en inglés. Se basa en el encoder BioLinkBERT-base, con una arquitectura `BertForTokenClassification` y un esquema de etiquetas BIO. Con 107,6 millones de parámetros, el modelo está especializado en la detección de límites de entidades siguiendo la convención relativamente estricta del dataset BioRED, lo que lo hace adecuado para textos biomédicos a nivel de oración, como títulos y resúmenes de PubMed.

El modelo fue entrenado en dos etapas: primero, BioLinkBERT-base se ajustó como "estudiante" NER sobre etiquetas plateadas (silver) generadas por un ensamblaje de seis modelos de lenguaje grandes con votación mayoritaria reconciliada; después, ese estudiante se ajustó de forma continua sobre el conjunto de entrenamiento humano de BioRED. Esta estrategia busca combinar la cobertura de anotaciones automáticas con la precisión de las anotaciones manuales. El modelo está publicado bajo licencia Apache 2.0 y es compatible con la librería Transformers, lo que facilita su integración en pipelines de procesamiento de lenguaje natural biomédico.

La relevancia actual de GDV-Scout radica en su enfoque específico en tres tipos de entidades clave para la investigación biomédica, con un tamaño compacto que permite su despliegue en entornos con recursos limitados. Su rendimiento reportado en el conjunto de test de BioRED alcanza una micro-F1 de 0,8431, con resultados especialmente sólidos para genes y productos génicos, aunque más moderados para variantes. Es una herramienta útil para tareas de triaje de literatura, búsqueda biomédica y generación de candidatos para normalización de entidades, siempre que se tenga en cuenta que solo realiza detección de menciones y no normaliza ni establece relaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT token classifier (`BertForTokenClassification`) |
| Parametros totales | 107.647.495 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 192 subword tokens (según entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GDV-Scout utiliza la arquitectura BERT para clasificación de tokens, con un encoder basado en BioLinkBERT-base. BioLinkBERT es una variante de BERT preentrenada específicamente sobre literatura biomédica, que incorpora enlaces entre documentos como señal de entrenamiento adicional. La cabeza de clasificación de tokens se ajusta para predecir etiquetas BIO sobre tres tipos de entidades: `Disease`, `GeneOrGeneProduct` y `Variant`. El modelo opera a nivel de oración, con una longitud máxima de entrada de 192 subword tokens durante el entrenamiento y la evaluación.

El proceso de entrenamiento se realizó en dos etapas. En la primera, BioLinkBERT-base se ajustó como un modelo NER "estudiante" sobre etiquetas plateadas generadas por un ensamblaje de seis modelos de lenguaje grandes, reconciliadas mediante votación mayoritaria. En la segunda, el modelo resultante, incluyendo su cabeza de clasificación, se continuó ajustando sobre el conjunto de entrenamiento humano de BioRED (4.374 oraciones). Las anotaciones de `Gene` en BioRED se mapearon a `GeneOrGeneProduct`, mientras que las categorías `Chemical`, `Species` y `CellLine` se trataron como `O` (fuera de las entidades objetivo). No se aplicaron técnicas como RLHF o DPO; el ajuste es supervisado estándar.

## Capacidades

- Reconocimiento de entidades nombradas biomédicas para tres tipos: enfermedades (`Disease`), genes o productos génicos (`GeneOrGeneProduct`) y variantes de secuencia (`Variant`).
- Detección de menciones con límites precisos siguiendo la convención de BioRED, que tiende a ser estricta en cuanto a los límites de las entidades.
- Procesamiento de texto biomédico en inglés, especialmente títulos y resúmenes de artículos científicos.
- Integración sencilla con la librería Transformers mediante el pipeline de `token-classification`.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso; es un modelo puramente discriminativo para NER.
- No realiza normalización de entidades a identificadores de bases de datos, ni extracción de relaciones.

## Casos de uso

- Triaje de literatura biomédica: el modelo puede procesar títulos y resúmenes de PubMed para identificar rápidamente menciones de genes, enfermedades y variantes, facilitando la priorización de artículos relevantes para revisiones sistemáticas o actualizaciones de bases de datos.
- Búsqueda biomédica mejorada: al extraer entidades de los textos, se pueden indexar y buscar documentos por sus entidades mencionadas, mejorando la recuperación de información en corpus biomédicos.
- Generación de candidatos para normalización de entidades: las menciones detectadas por GDV-Scout pueden alimentar sistemas de normalización que vinculan genes, enfermedades o variantes a identificadores estándar como Entrez Gene, MeSH o dbSNP.
- Extracción de variantes en artículos de investigación: el modelo identifica menciones de variantes como "L858R" o "EGFR L858R", lo que permite construir corpus de variantes asociadas a enfermedades o fármacos.
- Soporte a extracción de relaciones: las entidades extraídas pueden servir como entrada para modelos de extracción de relaciones biomédicas, por ejemplo, para identificar asociaciones gen-enfermedad o variante-fármaco.
- Análisis de textos clínicos no estructurados: aunque está pensado para literatura, puede aplicarse a notas clínicas o informes de laboratorio en inglés para detectar menciones de interés, siempre que se respete la longitud de contexto y se divida el texto en oraciones.

## Benchmarks y rendimiento

Los resultados oficiales declarados en la model card se basan en el conjunto de test de BioRED, evaluados con `seqeval` a nivel de entidad (tipo y límite completo deben coincidir). El test contiene 1.108 oraciones y 2.054 entidades objetivo.

| Tipo de entidad | Precision | Recall | F1 | Support |
|---|---:|---:|---:|---:|
| Disease | 0.8049 | 0.8442 | 0.8241 | 860 |
| GeneOrGeneProduct | 0.8712 | 0.8876 | 0.8793 | 1.014 |
| Variant | 0.6840 | 0.8056 | 0.7398 | 180 |
| **Micro promedio** | **0.8249** | **0.8622** | **0.8431** | **2.054** |
| Macro promedio | 0.7867 | 0.8458 | 0.8144 | 2.054 |

Además, se reportan resultados en benchmarks externos con una evaluación "relajada" (coincidencia de subconjunto de tokens en cualquier dirección, insensible a mayúsculas y normalizada a nivel de documento). Estos valores no son directamente comparables con los de BioRED.

| Benchmark | Tipo objetivo | Precision | Recall | F1 relajado |
|---|---|---:|---:|---:|
| BC2GM test | GeneOrGeneProduct | 0.916 | 0.729 | 0.812 |
| NCBI-disease test | Disease | 0.909 | 0.771 | 0.834 |
| BC5CDR-disease test | Disease | 0.873 | 0.896 | 0.884 |

## Requisitos de hardware

- El modelo tiene 107,6 millones de parámetros, lo que lo hace ligero en comparación con modelos de lenguaje grandes.
- En precisión flotante de 32 bits, el tamaño del checkpoint es de aproximadamente 430 MB; en cuantización de 8 bits podría reducirse a unos 110 MB, aunque no se han publicado pesos cuantizados.
- VRAM estimada para inferencia: menos de 1 GB en fp32, por lo que cabe en cualquier GPU moderna, incluidas tarjetas de consumo como la RTX 3060 o superiores.
- Puede ejecutarse en CPU sin problemas, con latencias de milisegundos por oración típicas para un BERT base.
- Despliegue recomendado mediante la librería Transformers con el pipeline `token-classification`, o con servidores de inferencia como Hugging Face Inference Endpoints.
- No requiere hardware especializado; es adecuado para entornos edge o servidores de baja capacidad.

## Comparativa con modelos similares

No se dispone de datos comparativos numéricos en la información proporcionada. Como alternativas de la misma categoría (NER biomédico basado en BERT) se pueden mencionar BioBERT, PubMedBERT o modelos específicos de BioRED, pero no se dispone de sus métricas en este contexto. La información disponible no permite una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El modelo solo funciona en inglés y está limitado a oraciones de hasta 192 subword tokens; entradas más largas deben truncarse, lo que puede perder información.
- Solo detecta tres tipos de entidades (enfermedades, genes/productos génicos y variantes); otras categorías como productos químicos, especies o líneas celulares se ignoran deliberadamente.
- No normaliza menciones a identificadores de bases de datos ni establece relaciones entre entidades; es únicamente un detector de menciones.
- El rendimiento en variantes es notablemente inferior (F1 de 0,7398 en BioRED) en comparación con enfermedades y genes, lo que puede limitar su uso en tareas centradas en variantes.
- Los resultados en benchmarks externos usan una métrica relajada, por lo que no son directamente comparables con los de BioRED.
- El modelo no debe utilizarse para diagnóstico, decisiones de tratamiento u otros fines clínicos, según indica su propia documentación.
- Al estar entrenado con datos de BioRED, puede heredar sesgos de ese corpus, como la sobrerrepresentación de ciertos tipos de enfermedades o genes.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario es responsable de verificar la idoneidad del modelo para su caso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nobal/gdv-scout
- No se han encontrado otros enlaces relevantes en la búsqueda web (los resultados obtenidos se refieren a un producto de robótica militar no relacionado).
