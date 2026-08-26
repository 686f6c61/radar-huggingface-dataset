# dsergio-hf/boyscouts-handbook-1911

## Resumen

El repositorio `dsergio-hf/boyscouts-handbook-1911` no contiene un modelo de lenguaje ni un sistema de IA, sino un corpus de evaluación diseñado para experimentos de recuperación semántica (retrieval) y generación aumentada por recuperación (RAG). Fue creado por el usuario `dsergio-hf` a partir de la edición de 1911 del *Boy Scouts Handbook*, disponible en dominio público a través del Proyecto Gutenberg (eBook #29558).

El corpus estructura el texto original en nueve documentos a nivel de capítulo (Scoutcraft, Woodcraft, Campcraft, Tracks, Trailing and Signaling, Health and Endurance, Chivalry, First Aid and Life Saving, Games and Athletic Standards, y Patriotism and Citizenship), que pueden fragmentarse con tamaños y solapamientos configurables para experimentos de retrieval. Incluye consultas construidas manualmente y juicios de relevancia (qrels) asignados a nivel de documento, lo que permite evaluar distintas configuraciones de chunking contra los mismos criterios.

Su relevancia actual radica en que sirve como banco de pruebas para medir métricas de recuperación como Hit@K y Recall@K, y para experimentos de question answering fundamentado. Al ser un texto histórico de 1911, el autor advierte explícitamente de que no debe interpretarse como fuente de recomendaciones contemporáneas de seguridad, primeros auxilios o normativa legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un corpus de texto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (texto original de 1911) |
| Licencia | no disponible en el repositorio; el texto fuente es de dominio publico en Estados Unidos |
| Formato de pesos | no disponible (el corpus se distribuye en formato Parquet) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. El repositorio es un conjunto de datos estructurado a partir del texto plano del Proyecto Gutenberg (eBook #29558), que fue parseado en documentos a nivel de capítulo y posteriormente convertido a formato Parquet. No hay arquitectura neuronal, datos de entrenamiento ni procesos de RLHF, DPO o similar.

La unica "configuracion" relevante es la de fragmentacion (chunk size y chunk overlap), que es parametrizable por el usuario para sus experimentos de retrieval. Las consultas y los juicios de relevancia fueron creados especificamente para experimentacion de recuperacion y no forman parte de la publicacion original.

## Capacidades

- Corpus de evaluacion para experimentos de recuperacion semantica (retrieval).
- Soporte de experimentos de RAG (retrieval-augmented generation) al poder combinarse con un modelo generador externo.
- Permite experimentos de variacion de tamano de chunk y solapamiento.
- Incluye consultas y qrels manuales para evaluar metricas como Hit@K y Recall@K.
- Permite experimentos de question answering fundamentada (grounded QA).
- Texto historico en ingles de dominio publico (Estados Unidos).

## Casos de uso

- Evaluacion de sistemas de recuperacion semantica: se pueden indexar los documentos del corpus con distintos embeddings y medir Hit@K y Recall@K sobre las consultas proporcionadas.
- Experimentos de chunking: comparar como afecta el tamano de chunk y el solapamiento a la calidad de la recuperacion y a la respuesta final de un pipeline RAG.
- Desarrollo de pipelines RAG educativos: usar el corpus para construir un sistema que responda preguntas sobre el contenido del manual de 1911 con citas textuales.
- Comparativa de modelos de embedding: evaluar diferentes modelos de embeddings (p. ej., de codigos abiertos como `all-MiniLM-L6-v2` o `bge-base`) sobre un corpus de dominio historico.
- Experimentos de evaluacion de fidelidad en RAG: comprobar si el generador de respuestas se mantiene fiel al contenido recuperado o alucina informacion fuera del corpus.
- Practica de evaluacion de sistemas QA: construir un benchmark de question answering fundamentado con las consultas y qrels ya asignados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento de ningun modelo de retrieval o generacion; proporciona el corpus y los juicios de relevancia para que los usuarios los calculen.

## Requisitos de hardware

- El corpus en si no requiere hardware especifico: es un conjunto de datos en Parquet que se puede procesar en CPU con pandas o herramientas de datos.
- Los experimentos de retrieval requeriran los recursos de los modelos de embedding o de generacion que se decidan utilizar con el corpus, no del propio repositorio.
- Para experimentos de RAG con modelos locales, se recomienda una GPU consumer como una RTX 3060 o superior para embeddings, y una RTX 4090 o A100 si se usa un LLM generativo de mas de 7B de parametros.
- Para despliegue de un pipeline de retrieval se pueden usar herramientas como FAISS, Milvus, o el ecosistema de HuggingFace Datasets.

## Comparativa con modelos similares

No disponible. Al no ser un modelo de lenguaje, no existe una comparativa directa con otros modelos. Como corpus de evaluacion, podria compararse con otros benchmarks de retrieval como MS MARCO o BEIR, pero el repositorio no proporciona esa comparacion.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni responder preguntas por si mismo. Solo es un conjunto de datos.
- Es un texto historico de 1911: su terminologia, recomendaciones, normas sociales y consejos de seguridad reflejan la epoca y no deben interpretarse como guia contemporanea.
- No debe usarse como fuente de recomendaciones medicas, de primeros auxilios, legales o de seguridad actuales.
- Las consultas y qrels fueron creadas manualmente por el autor del repositorio y no forman parte de la publicacion original; su calidad no esta validada externamente.
- El repositorio no especifica licencia, aunque el texto fuente es de dominio publico en Estados Unidos.
- El corpus esta en ingles (ingles de 1911), lo que puede presentar vocabulario y estilo arcaico que afecten a los modelos de embedding o de generacion modernos.
- No se proporcionan datos sobre el numero de tokens totales, el numero de consultas o la estructura interna de los qrels, lo que limita la replicabilidad de experimentos sin inspeccionar el repositorio directamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dsergio-hf/boyscouts-handbook-1911
- Fuente original en Project Gutenberg (eBook #29558): https://www.gutenberg.org/ebooks/29558
- Texto HTML completo en Project Gutenberg: https://www.gutenberg.org/files/29558/29558-h/29558-h.htm
- Copia en Archive.org: https://archive.org/details/boyscoutshandboo29558gut
- PDF del manual original (manmrk.net): http://manmrk.net/tutorials/pda/b/PDF/Scouts/Boy_Scouts_Handbook-1911.pdf
- PDF alternativo en trueprepper.com: https://trueprepper.com/wp-content/uploads/Boy-Scout-Handbook-1911.pdf
