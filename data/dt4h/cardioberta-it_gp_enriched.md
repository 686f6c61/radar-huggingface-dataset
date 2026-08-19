# DT4H/CardioBERTa.it_GP_enriched

## Resumen

`DT4H/CardioBERTa.it_GP_enriched` es un codificador de terminología biomédica en italiano, especializado en normalización de conceptos clínicos y entity linking. Desarrollado por el proyecto europeo DataTools4Heart (DT4H), se inicializa desde el modelo base `DT4H/CardioBERTa.it` y se entrena mediante metric learning con tripletas supervisadas por Concept Unique Identifiers (CUIs) de UMLS, enriqueciendo las relaciones de sinonimia con relaciones ontológicas de nivel "grandparent". El modelo produce embeddings de frases (pooling CLS) normalizados L2, pensados para recuperación de candidatos y vinculación de entidades en dominios de cardiología y texto clínico.

Con 109,9 millones de parámetros, es un modelo compacto tipo BERT (encoder) que se puede ejecutar en hardware modesto. Su ventana de contexto es corta (25 tokens), suficiente para términos y conceptos individuales, pero no para documentos largos. Está entrenado exclusivamente en italiano, lo que lo hace específico para ese idioma. Su relevancia radica en que aborda la normalización de conceptos clínicos en un dominio de alta especialización (cardiología) con un enfoque de aprendizaje métrico supervisado por ontologías, algo poco común en modelos públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 109.927.680 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 25 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Italiano (`it`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia CardioBERTa, que son encoders BERT adaptados al dominio de cardiología mediante pretraining continuado con Masked Language Modeling (MLM) sobre corpus monolingües biomédicos y cardiológicos. En este caso, el backbone es la versión italiana `DT4H/CardioBERTa.it`. Sobre ese backbone, se realizó un entrenamiento de especialización con tripletas de terminología supervisada por CUIs de UMLS, utilizando la estrategia "grandparents" que enriquece las relaciones de sinonimia con relaciones ontológicas de nivel abuelo (padre del padre). El objetivo de entrenamiento es Multi-Similarity Loss, con minería de todas las tripletas y margen 0.2. El pooling se hace con el token CLS y se normaliza la salida con L2. Se entrenó durante 1 época con batch size de 256 y learning rate 2e-5.

El dataset de entrenamiento consta de 4.714.271 tripletas, que cubren 476.970 CUIs y 529.487 términos únicos normalizados. No se distribuye la terminología por restricciones de licencia de UMLS; solo se publican estadísticas agregadas. El modelo está diseñado para generar embeddings de términos o conceptos, no para generación de texto.

## Capacidades

- Generación de embeddings de terminología biomédica y clínica en italiano, específicamente en cardiología.
- Normalización de conceptos clínicos: dado un término libre, produce un vector que puede compararse con vectores de conceptos UMLS para encontrar el CUI correspondiente.
- Entity linking: permite vincular menciones en texto a entidades ontológicas (CUIs) mediante similitud coseno.
- Recuperación de candidatos: puede usarse como primer paso en pipelines de entity linking para reducir el espacio de búsqueda.
- Soporte de búsqueda semántica de términos clínicos, sin necesidad de reglas lingüísticas manuales.
- No es un modelo generativo: no genera texto ni respuestas, solo produce representaciones vectoriales.
- No soporta tool calling ni agentes, al ser un encoder puro.

## Casos de uso

- Normalización de términos en historias clínicas electrónicas: el modelo puede convertir menciones libres de enfermedades, medicamentos o procedimientos cardiológicos en CUIs estandarizados, facilitando la integración de datos heterogéneos.
- Entity linking en artículos científicos de cardiología: permite anotar automáticamente textos biomédicos con conceptos UMLS, útil para construir bases de conocimiento o sistemas de búsqueda semántica.
- Búsqueda semántica de conceptos clínicos: dado un término en italiano, se puede recuperar el concepto más cercano en una ontología, mejorando la precisión frente a búsquedas por coincidencia exacta.
- Preprocesamiento para pipelines de NLP clínico: los embeddings generados pueden alimentar modelos de clasificación o agrupamiento de documentos médicos, mejorando la representación de entidades.
- Soporte a sistemas de codificación automática de diagnósticos (p. ej., ICD-10) en cardiología: al vincular menciones a CUIs, se puede mapear posteriormente a códigos de clasificación.
- Investigación en fenotipado clínico: los embeddings permiten agrupar términos que refieren al mismo concepto, facilitando la construcción de cohortes de pacientes a partir de texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o similares, dado que es un modelo de embeddings y no de generación. No hay comparaciones cuantitativas con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene ~110M parámetros, por lo que puede ejecutarse en CPU con memoria RAM suficiente (aprox. 0.5 GB en fp32). Para lotes grandes, se recomienda GPU.
- VRAM estimada: en fp32, el modelo ocupa ~440 MB. Con cuantización a fp16 o int8, se reduce a ~220 MB o ~110 MB respectivamente. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPUs recomendadas: NVIDIA T4, V100, RTX 2080, RTX 3090, A10, etc. Cualquier GPU moderna con soporte CUDA es suficiente.
- Despliegue: se puede usar con la librería `transformers` de Hugging Face, `sentence-transformers` (para generar embeddings de frases), o `text-embeddings-inference` (TEI) para servir endpoints de embeddings. También compatible con `vLLM` para embeddings (aunque es más habitual para modelos generativos).
- Latencia: al ser un encoder pequeño, la inferencia es rápida. En GPU, un lote de 32 términos (longitud 25) puede procesarse en menos de 10 ms. En CPU, puede tardar unos 50-100 ms por lote similar.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. Sin embargo, se puede contextualizar:

- **SapBERT** (inglés): modelo BERT grande entrenado con metric learning sobre UMLS, pero solo para inglés. No hay datos de comparación con este modelo italiano.
- **BioBERT** (inglés): BERT preentrenado en literatura biomédica, pero no específico para entity linking ni para italiano.
- **Otros modelos CardioBERTa** (para otros idiomas): la familia CardioBERTa incluye versiones para checo, neerlandés, inglés, rumano, español y sueco, pero no se han publicado comparativas entre ellas.

Dado que este modelo es específico para italiano y cardiología, no hay alternativas públicas con las mismas características en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en italiano; no soporta otros idiomas.
- La longitud de contexto está limitada a 25 tokens, lo que impide procesar frases largas o documentos completos. Está diseñado para términos y conceptos individuales.
- No es apto para decisiones clínicas directas; la model card indica que no está destinado a la toma de decisiones clínicas.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o redistribución.
- La terminología de entrenamiento no se distribuye debido a restricciones de licencia de UMLS; esto limita la reproducibilidad del entrenamiento.
- No hay benchmarks publicados, por lo que se desconoce su rendimiento cuantitativo frente a otros modelos.
- Al ser un encoder de embeddings, no genera texto ni respuestas; su uso se limita a tareas de recuperación y normalización.
- Puede heredar sesgos de los corpus de entrenamiento (textos biomédicos en italiano), aunque no se han documentado sesgos específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.it_GP_enriched
- Organización DT4H en Hugging Face: https://huggingface.co/DT4H/
- Colección CardioNER (incluye familia CardioBERTa): https://huggingface.co/collections/DT4H/cardioner
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- GitHub del proyecto: https://github.com/DataTools4Heart/
- Referencia: Danu et al., "CardioLM - a multilingual suite of small language models for the cardiology domain" (citado en la model card, sin enlace directo).
