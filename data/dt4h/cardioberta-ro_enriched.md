# DT4H/CardioBERTa.ro_enriched

## Resumen

CardioBERTa.ro_enriched es un codificador de terminología biomédica en rumano desarrollado por el proyecto europeo DataTools4Heart (DT4H). El modelo se especializa en la normalización de conceptos clínicos y el entity linking, es decir, en mapear términos médicos libres a conceptos estandarizados del sistema UMLS. Parte del backbone CardioBERTa, una familia de modelos de lenguaje pequeños adaptados al dominio de la cardiología mediante preentrenamiento continuado con MLM sobre corpus biomédicos monolingües, y se ha afinado con tripletas de sinónimos supervisadas por CUI y aprendizaje métrico (Multi-Similarity Loss).

El modelo cuenta con 278 millones de parámetros, un tamaño contenido que permite su despliegue en GPUs de consumo, y está disponible en formato safetensors. Está pensado para integrarse en pipelines de NLP clínico en rumano, especialmente en tareas de recuperación de candidatos biomédicos, normalización de conceptos y enlazado de entidades. Su relevancia actual radica en la necesidad de herramientas lingüísticas específicas para dominios médicos en idiomas distintos del inglés, y en el contexto del proyecto DT4H que busca estandarizar informes de cardiología en varias lenguas europeas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) |
| Parámetros totales | 278.043.648 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 25 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | rumano (ro) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un transformer encoder de tipo BERT con atención bidireccional. El backbone CardioBERTa.ro se adaptó al dominio cardiológico mediante preentrenamiento continuado con masked language modeling (MLM) sobre corpus monolingües en rumano. Posteriormente, el modelo se afinó con tripletas de términos clínicos extraídos de UMLS, donde cada tripleta contiene un ancla, un positivo (sinónimo del mismo concepto) y un negativo (de otro concepto). El entrenamiento utilizó Multi-Similarity Loss con minería de tripletas completa (todas las combinaciones, margen 0.2), pooling CLS y una longitud máxima de 25 tokens. Se emplearon 70.817 tripletas que cubren 70.817 CUIs y 139.248 términos únicos normalizados. El dataset de entrenamiento no se distribuye por restricciones de licencia de UMLS, pero se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de terminología biomédica en rumano, normalizados con L2.
- Entity linking: mapea términos clínicos libres a conceptos UMLS/CUI.
- Recuperación de candidatos (candidate retrieval) en entornos de normalización de conceptos.
- Búsqueda semántica en documentos clínicos y terminología cardiológica.
- No soporta generación de texto ni razonamiento conversacional; es un modelo puramente de extracción de características (feature-extraction).
- No soporta tool calling ni agentes; su uso se limita a tareas de representación vectorial.
- Multilingüismo: solo rumano, aunque la familia CardioBERTa cubre checo, neerlandés, inglés, italiano, español y sueco (cada modelo es monolingüe).

## Casos de uso

- **Normalización de conceptos clínicos en informes de cardiología**: el modelo convierte términos libres (p. ej. «infarct miocardic») en vectores que pueden compararse con conceptos UMLS, facilitando el mapeo a códigos estandarizados.
- **Entity linking en historias clínicas electrónicas (EHR)**: integrado en un pipeline que extrae entidades de texto rumano y las enlaza a CUIs, permitiendo la agregación de datos a nivel de paciente.
- **Recuperación de información biomédica**: como componente de búsqueda semántica en bases de datos de literatura o registros clínicos, donde se consultan conceptos cardiológicos y se recuperan documentos relevantes.
- **Deduplicación de términos en ontologías**: para identificar sinónimos duplicados en vocabularios médicos rumanos mediante similitud coseno de embeddings.
- **Anotación semántica de textos de investigación**: ayuda a etiquetar automáticamente ensayos clínicos o publicaciones con conceptos UMLS para su indexación.
- **Preprocesado de datos para entrenamiento de modelos clínicos**: se utiliza para generar representaciones de conceptos que sirven como entrada en sistemas de clasificación o extracción de información más complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un paper de referencia (Danu et al., CardioLM) pero no se incluyen cifras concretas de MMLU, HumanEval u otras métricas.

## Requisitos de hardware

- **VRAM estimada**: el modelo en fp32 ocupa aproximadamente 1.1 GB (278M parámetros × 4 bytes ≈ 1.11 GB). En fp16/int8, la huella se reduce a unos 0.55 GB o 0.28 GB respectivamente.
- **GPU recomendadas**: cualquier GPU con 2 GB de VRAM o más es suficiente. Por ejemplo, una NVIDIA T4, RTX 2060, RTX 3060 o incluso una CPU puede ejecutar la inferencia sin problemas para un solo lote.
- **Compatibilidad con GPUs de consumo**: sí, es totalmente viable en hardware de gama media.
- **Opciones de despliegue**: puede servirse con la librería `transformers` estándar, con `text-embeddings-inference` (TEI) para servir embeddings de alta concurrencia, o mediante contenedores Docker en plataformas como Hugging Face Inference Endpoints.
- **Latencia y throughput**: no se proporcionan datos oficiales. Con un modelo de 278M de parámetros y secuencias cortas (25 tokens), se esperan latencias de pocos milisegundos por lote en GPU moderna y throughput alto con batching.

## Comparativa con modelos similares

No hay información de modelos comparables en la misma categoría (codificadores biomédicos rumanos). La familia CardioBERTa incluye variantes para otros idiomas (en, es, it, cs, sv, nl) que podrían servir de comparación, pero no se proporcionan métricas de rendimiento relativas. Se puede decir que no se dispone de una comparativa directa.

## Limitaciones y advertencias

- **Idioma**: el modelo está entrenado exclusivamente en rumano, no es útil para otros idiomas.
- **Dominio**: especializado en cardiología y terminología biomédica general; puede degradarse con textos fuera de ese ámbito.
- **Longitud de secuencia**: la longitud máxima de entrenamiento es de 25 tokens, por lo que el modelo no está diseñado para representar documentos largos. Para textos más largos, se necesita truncar o usar estrategias de pooling por fragmentos.
- **Licencia**: la licencia no está disponible en la ficha. El autor indica que la terminología de entrenamiento no se distribuye por condiciones de UMLS, lo que puede afectar a la redistribución del modelo o su uso en productos comerciales.
- **Uso clínico**: no está diseñado para decisiones clínicas directas; solo para procesamiento de información.
- **Riesgo de alucinación**: al ser un encoder de embeddings, no genera texto, por lo que el riesgo de alucinación es nulo; sin embargo, puede producir falsos positivos en la vinculación de entidades si las similitudes no son discriminativas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DT4H/CardioBERTa.ro_enriched)
- [Organización DT4H en Hugging Face](https://huggingface.co/datasets/DT4H/)
- [Repositorio GitHub de DataTools4Heart](https://github.com/DataTools4Heart/)
- [Sitio web del proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [Documentación del proyecto](https://datatools4heart.github.io/documentation-hub/)
