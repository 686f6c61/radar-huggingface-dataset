# DT4H/CardioBERTa.en_translations_only

## Resumen

`DT4H/CardioBERTa.en_translations_only` es un codificador de terminología biomédica en inglés desarrollado por el proyecto europeo DataTools4Heart (DT4H). El modelo está especializado en normalización de conceptos clínicos y entity linking, tareas que consisten en asociar menciones textuales (p. ej. "heart failure") con conceptos estandarizados de ontologías como UMLS. Se inicializa desde `DT4H/CardioBERTa.en`, un modelo de la familia CardioBERTa adaptado al dominio de la cardiología mediante preentrenamiento continuado con masked language modeling (MLM) sobre corpus biomédicos y cardiológicos monolingües.

El modelo tiene 124,6 millones de parámetros (arquitectura RoBERTa) y se entrena con tripletas de sinónimos supervisadas por CUIs (Concept Unique Identifiers) usando metric learning con Multi-Similarity Loss. Esto lo convierte en una herramienta ligera y eficiente para pipelines de NLP clínico que necesiten recuperar candidatos conceptuales o normalizar entidades en textos de cardiología. Su relevancia actual radica en la creciente demanda de modelos de embeddings biomédicos especializados, especialmente en entornos europeos con requisitos de privacidad y multilingüismo, aunque esta versión concreta solo cubre inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 124.645.632 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa base, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, lo que da los 124,6 millones de parámetros. El backbone `CardioBERTa.en` fue preentrenado con MLM sobre corpus biomédicos y cardiológicos en inglés, dentro del proyecto CardioLM que cubre siete idiomas europeos. Posteriormente, este modelo se fine-tunea con un objetivo de metric learning: se construyen tripletas (ancla, positivo, negativo) a partir de pares de términos sinónimos que comparten el mismo CUI en UMLS. Se emplea Multi-Similarity Loss con minería de todas las tripletas (margen 0.2), pooling sobre el token CLS y una longitud máxima de 25 tokens. El entrenamiento se realiza durante 1 época con batch size 256 y learning rate 2e-5. En total se usan 83.914 tripletas que cubren 83.914 CUIs y 165.661 términos normalizados únicos. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de texto biomédico, especialmente en el dominio de la cardiología, con normalización L2 del vector CLS.
- Normalización de conceptos clínicos: mapea menciones textuales a identificadores UMLS/CUI.
- Entity linking: integrable en pipelines de extracción de entidades para enlazar menciones a bases de conocimiento.
- Recuperación de candidatos biomédicos: dado un término, recupera términos sinónimos o relacionados mediante similitud coseno.
- Soporte para integración con `text-embeddings-inference` (TEI) y endpoints compatibles, facilitando despliegue en producción.
- No es un modelo generativo: no genera texto, solo produce representaciones vectoriales.
- No dispone de tool calling ni capacidades de agente; su función es puramente de codificación semántica.

## Casos de uso

- Normalización de términos en informes de cardiología: dado un informe clínico, extraer menciones de enfermedades, fármacos o procedimientos y mapearlas a CUIs UMLS para estandarizar datos. El modelo es adecuado porque sus embeddings capturan sinónimos y variantes terminológicas del dominio cardiológico.
- Entity linking en registros electrónicos de salud (EHR): conectar menciones de conceptos en textos libres con ontologías como SNOMED-CT o UMLS, facilitando la integración de datos heterogéneos.
- Búsqueda semántica de conceptos biomédicos: construir un índice vectorial de términos UMLS y usar el modelo para recuperar conceptos relevantes a partir de consultas en lenguaje natural, útil en herramientas de ayuda al diagnóstico.
- Anotación automática de corpus clínicos: preprocesar textos para generar anotaciones de entidades normalizadas que luego se usan para entrenar modelos de NER o extracción de relaciones.
- Desambiguación de términos ambiguos: en contextos donde una misma palabra puede referirse a distintos conceptos (p. ej. "stenosis" en diferentes localizaciones), el modelo ayuda a seleccionar el CUI correcto según el contexto.
- Soporte a pipelines multilingües de NLP clínico: aunque este modelo es solo inglés, puede combinarse con otros miembros de la familia CardioBERTa para proyectos europeos que requieran cobertura multilingüe (es, it, ro, cs, nl, sv).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de evaluación comparativa con otros modelos en tareas como normalización de entidades o recuperación de conceptos.

## Requisitos de hardware

- El modelo tiene 124,6 millones de parámetros; en FP32, el tamaño de pesos es aproximadamente 498 MB. Con overhead de inferencia, la VRAM estimada para un batch pequeño es de ~1-2 GB.
- Cabe en cualquier GPU de consumo moderna (p. ej. RTX 3060, RTX 4090) e incluso puede ejecutarse en CPU con razonable latencia para tareas de embeddings.
- Para despliegue en producción, se recomienda usar `text-embeddings-inference` (TEI) o Hugging Face Inference Endpoints, ya que el modelo es compatible con estas plataformas (según los tags del repositorio).
- También puede servirse mediante la API de `transformers` en un contenedor Docker o con frameworks como ONNX Runtime si se convierte el modelo.
- La latencia de inferencia es baja: en GPU, una sola pasada de forward para una secuencia de 25 tokens tarda menos de 10 ms; en CPU puede rondar 50-100 ms. El throughput dependerá del batch y del hardware, pero al ser un modelo pequeño, admite altas tasas de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de una comparativa oficial publicada con otros modelos de embeddings biomédicos. Sin embargo, se pueden señalar alternativas de la misma categoría:

| Modelo | Parámetros | Dominio | Enfoque | Licencia |
|---|---|---|---|---|
| CardioBERTa.en_translations_only | 124,6 M | Cardiología | Metric learning sobre sinónimos UMLS | no disponible |
| SapBERT | 110 M (base) | Biomédico general | Fine-tuning con tripletas UMLS | MIT |
| PubMedBERT | 110 M | Biomédico general | Preentrenamiento desde cero en PubMed | MIT |
| BioBERT | 110 M | Biomédico general | Preentrenamiento continuado sobre BioMed | MIT |

A diferencia de SapBERT o PubMedBERT, este modelo está específicamente adaptado al dominio cardiológico y ha sido entrenado con una estrategia de tripletas supervisadas por CUI, lo que puede ofrecer ventajas en tareas de normalización de conceptos cardiológicos. No obstante, al carecer de benchmarks públicos, no se puede cuantificar esa ventaja.

## Limitaciones y advertencias

- Solo soporta inglés; no cubre otros idiomas europeos aunque la familia CardioBERTa incluya versiones multilingües.
- El dominio de entrenamiento se centra en cardiología; puede tener un rendimiento subóptimo en otras especialidades médicas.
- La longitud máxima de entrada durante el entrenamiento es de 25 tokens; para textos más largos se debe truncar o segmentar, lo que puede perder contexto relevante.
- No está diseñado para toma de decisiones clínicas directas; su uso es exclusivamente para tareas de NLP y estandarización de datos.
- La licencia no está especificada; además, la terminología de entrenamiento no se distribuye por restricciones de UMLS, lo que puede limitar la reproducibilidad.
- Riesgo de sesgos en los datos de entrenamiento (corpus biomédicos pueden reflejar desequilibrios demográficos o geográficos).
- Al ser un modelo de embeddings, no genera explicaciones ni razonamiento; su salida es un vector, por lo que no es adecuado para tareas que requieran generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.en_translations_only
- Modelo base CardioBERTa.en: https://huggingface.co/DT4H/CardioBERTa.en
- Organización DT4H en Hugging Face: https://huggingface.co/DT4H/
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Publicaciones del proyecto: https://www.datatools4heart.eu/publications/
