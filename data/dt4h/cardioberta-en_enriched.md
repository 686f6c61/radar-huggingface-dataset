# DT4H/CardioBERTa.en_enriched

## Resumen

`DT4H/CardioBERTa.en_enriched` es un codificador de terminología biomédica en inglés desarrollado por el consorcio DataTools4Heart (DT4H) dentro del proyecto europeo CardioLM. Su propósito es la normalización de conceptos clínicos y el entity linking, es decir, mapear términos libres en textos médicos a conceptos estandarizados del sistema UMLS. Se inicializa desde el modelo base `DT4H/CardioBERTa.en`, un encoder tipo RoBERTa adaptado al dominio de la cardiología mediante preentrenamiento continuado con masked language modeling sobre corpus biomédicos monolingües.

El modelo se especializa mediante aprendizaje métrico (metric learning) sobre tripletas de sinónimos supervisadas por conceptos CUI, lo que permite generar embeddings de términos clínicos donde sinónimos quedan próximos y conceptos distintos quedan separados. Con 124,6 millones de parámetros, es un modelo compacto que puede integrarse en pipelines de procesamiento de lenguaje clínico sin requerir hardware de alta gama. Su relevancia actual radica en la necesidad de estandarizar la información de informes de cardiología en entornos europeos multilingües, facilitando la interoperabilidad de datos sanitarios.

La licencia no está especificada en la ficha de HuggingFace, y la terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, aunque sí se publican estadísticas agregadas. Está pensado para uso en investigación y desarrollo de sistemas de NLP clínico, no para decisiones clínicas directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 124.645.632 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (max_length de entrenamiento: 25 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (también compatible con transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder con atención bidireccional. El backbone `DT4H/CardioBERTa.en` fue adaptado al dominio de la cardiología mediante preentrenamiento continuado con masked language modeling sobre corpus biomédicos y cardiológicos en inglés, dentro de la familia CardioLM que cubre siete idiomas europeos.

La especialización para entity linking se realizó con aprendizaje métrico. Se construyeron tripletas (ancla, positivo, negativo) a partir de pares de sinónimos supervisados por conceptos UMLS (CUI). El entrenamiento usó Multi-Similarity Loss con minería de todas las tripletas y margen 0.2, pooling sobre el token CLS, una sola época, tamaño de lote 256, tasa de aprendizaje 2e-5 y longitud máxima de 25 tokens. En total se emplearon 83.914 tripletas que cubren 83.914 CUIs y 165.661 términos normalizados únicos. La terminología de entrenamiento no se distribuye por licencias de UMLS.

## Capacidades

- Generación de embeddings de términos clínicos y biomédicos en inglés, especialmente en el dominio de la cardiología.
- Normalización de conceptos: mapea términos libres a identificadores UMLS (CUI) mediante similitud coseno entre embeddings.
- Entity linking en textos clínicos: dado un término mencionado, recupera el concepto estandarizado más probable.
- Búsqueda semántica de conceptos: permite encontrar términos relacionados o sinónimos dentro de un vocabulario controlado.
- Compatible con pipelines de retrieval (candidatos) previos a una etapa de reranking.
- Soporte de pooling CLS y normalización L2 para obtener vectores listos para similitud coseno.

No dispone de capacidades de generación de texto, tool calling, agentes ni soporte multimodal.

## Casos de uso

- Normalización de diagnósticos en informes de cardiología: el modelo puede convertir expresiones como "estenosis aórtica severa" en el código CUI correspondiente, facilitando la codificación automática de historiales clínicos.
- Entity linking en publicaciones científicas: extracción de entidades biomédicas de artículos y su mapeo a UMLS para construir bases de conocimiento estructuradas.
- Búsqueda semántica en repositorios de ensayos clínicos: dado un término de búsqueda, recuperar ensayos relacionados mediante similitud de embeddings de conceptos.
- Enriquecimiento de ontologías: detectar sinónimos o términos equivalentes no contemplados en un vocabulario controlado, usando las representaciones aprendidas.
- Integración en pipelines de extracción de información clínica: como componente de candidate retrieval antes de un modelo de reranking para reducir el espacio de búsqueda.
- Soporte a la interoperabilidad de datos sanitarios: estandarización de términos locales de diferentes hospitales europeos a un mismo sistema de conceptos, alineado con los objetivos del proyecto DT4H.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta métricas como precisión en entity linking, recall@k o comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo de 125M de parámetros, la inferencia es ligera. En FP32, los pesos ocupan aproximadamente 500 MB; en FP16, unos 250 MB.
- Puede ejecutarse en GPUs de consumo como una NVIDIA RTX 3060 o superior con al menos 6 GB de VRAM, e incluso en CPU para lotes pequeños.
- Para despliegue en producción, se recomienda usar `text-embeddings-inference` (el modelo es compatible con endpoints de HuggingFace) o `sentence-transformers` para generar embeddings por lotes.
- No se dispone de datos de latencia o throughput específicos, pero por su tamaño es esperable que procese cientos de secuencias por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Como referencia, otros encoders biomédicos de tamaño similar son:

- `SapBERT` (base PubMedBERT): también entrenado con aprendizaje métrico sobre UMLS, pero con una estrategia de hard negatives distinta y mayor cobertura de conceptos.
- `BioBERT` (base BERT): preentrenado en textos biomédicos, pero sin especialización específica para entity linking.
- `PubMedBERT`: preentrenado desde cero en PubMed, con buen rendimiento en tareas biomédicas generales.

Sin benchmarks publicados para `CardioBERTa.en_enriched`, no es posible establecer comparaciones cuantitativas. La ventaja principal de este modelo es su enfoque específico en cardiología y su integración con la suite multilingüe CardioLM.

## Limitaciones y advertencias

- Solo soporta inglés; no cubre otros idiomas de la familia CardioLM en esta versión.
- La longitud máxima de entrenamiento es de 25 tokens, lo que limita su uso con términos o frases largas; para textos extensos se requeriría truncamiento o estrategias de ventana.
- La terminología de entrenamiento no se distribuye, lo que impide auditar o reproducir exactamente el conjunto de datos.
- La licencia no está especificada, por lo que se recomienda contactar con los autores antes de un uso comercial.
- No está diseñado para tomar decisiones clínicas; es una herramienta de procesamiento de lenguaje y no debe usarse como sistema de apoyo diagnóstico sin validación adicional.
- No se han publicado evaluaciones independientes, por lo que su rendimiento real en entornos clínicos diversos es desconocido.
- Puede presentar sesgos derivados de los corpus de preentrenamiento y de la terminología UMLS, que no siempre reflejan la diversidad de la práctica clínica real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.en_enriched
- Modelo base: https://huggingface.co/DT4H/CardioBERTa.en
- Organización DT4H en HuggingFace: https://huggingface.co/DT4H
- GitHub del proyecto DataTools4Heart: https://github.com/DataTools4Heart/
- Web del proyecto: https://www.datatools4heart.eu/
- Documentación de DT4H: https://datatools4heart.github.io/documentation-hub/
