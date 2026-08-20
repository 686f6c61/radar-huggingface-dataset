# DT4H/CardioBERTa.it_P_translations_only

## Resumen

CardioBERTa.it_P_translations_only es un codificador de terminología biomédica en italiano desarrollado por el proyecto DataTools4Heart (DT4H), diseñado específicamente para la normalización de conceptos clínicos y el entity linking en el dominio de la cardiología. El modelo se inicializa desde CardioBERTa.it, perteneciente a la familia CardioLM, un conjunto de modelos de lenguaje pequeños adaptados al dominio cardiológico mediante continued pretraining con masked language modeling sobre corpus biomédicos monolingües.

El modelo se especializa mediante aprendizaje métrico (metric learning) supervisado por conceptos UMLS (CUI), utilizando pares de terminología enriquecidos con relaciones ontológicas de nivel padre. Con aproximadamente 110 millones de parámetros y arquitectura BERT, está optimizado para generar embeddings de terminología que permiten recuperar candidatos y normalizar conceptos clínicos en pipelines de NLP clínico.

Su relevancia radica en abordar la variabilidad terminológica en textos clínicos italianos del ámbito cardiológico, un problema crítico para la interoperabilidad de datos sanitarios en proyectos europeos federados. Al estar entrenado específicamente para italiano y cardiología, ofrece una solución adaptada a un dominio e idioma concretos que los modelos multilingües generalistas no cubren con la misma precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 109.927.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 25) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Italiano (it) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en CardioBERTa.it, un encoder BERT de la familia CardioLM adaptado al dominio de la cardiología mediante continued pretraining con masked language modeling sobre corpus biomédicos y cardiológicos en italiano. La familia CardioLM cubre siete idiomas: checo, neerlandés, inglés, italiano, rumano, español y sueco.

El entrenamiento de especialización utiliza tripletas CUI-supervisadas (1.597.673 tripletas) que cubren 476.349 conceptos UMLS y 529.199 términos normalizados únicos. La estrategia "parents" enriquece los pares de sinónimos con relaciones ontológicas de nivel padre, lo que añade 392.479 términos adicionales respecto a la estrategia de solo sinónimos. El objetivo de entrenamiento es Multi-Similarity Loss con margin 0.2, pooling CLS, una época, batch size 256 y learning rate 2e-5. La longitud máxima de secuencia durante el entrenamiento es de 25 tokens.

La terminología de entrenamiento no se distribuye con el repositorio porque contiene recursos sujetos a las condiciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de terminología biomédica en italiano para recuperación de candidatos (candidate retrieval)
- Normalización de conceptos clínicos mediante mapeo a conceptos UMLS (CUI)
- Entity linking en el dominio de cardiología y textos clínicos
- Recuperación semántica de términos biomédicos basada en similitud coseno de embeddings normalizados
- Integración como componente de normalización en pipelines de NLP clínico
- Compatibilidad con text-embeddings-inference para despliegue como servicio de embeddings

## Casos de uso

- Normalización de terminología en informes de cardiología: el modelo mapea términos clínicos variables en italiano a conceptos UMLS estandarizados (CUI), facilitando la integración de datos de diferentes centros hospitalarios europeos.

- Entity linking en registros electrónicos de salud (EHR): permite vincular menciones de entidades clínicas en texto libre a conceptos de ontologías biomédicas, habilitando búsquedas estructuradas y análisis agregados sobre datos clínicos no estructurados.

- Recuperación de candidatos en pipelines de entity linking: como primer paso, el modelo genera embeddings que permiten recuperar los conceptos UMLS más probables para una mención dada, reduciendo el espacio de búsqueda antes de un re-ranker más costoso.

- Armonización de datos clínicos multilingües: combinado con las variantes de otros idiomas de la familia CardioLM, permite normalizar terminología cardiológica en proyectos europeos que requieren comparar datos de distintos países.

- Deduplicación y limpieza de bases de conocimiento clínicas: el modelo puede utilizarse para detectar y normalizar términos duplicados o variantes en bases de datos biomédicas, mejorando la calidad de los datos.

- Investigación retrospectiva en cardiología: facilita el análisis de grandes volúmenes de informes clínicos en italiano al estandarizar la terminología, permitiendo estudios observacionales y ensayos que requieren cohortes comparables entre centros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,44 GB en FP32 y 0,22 GB en FP16, por lo que cabe en cualquier GPU de consumo actual, incluso con 4 GB de VRAM
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1660, RTX 2060, RTX 3060, etc.); también funciona correctamente en CPU para inferencia por lotes pequeños
- Opciones de despliegue: transformers (HuggingFace), sentence-transformers, text-embeddings-inference (compatible según los tags del repositorio)
- Latencia: al ser un modelo de ~110M parámetros, la inferencia es rápida; en GPU puede procesar cientos de secuencias por segundo, aunque no se han publicado cifras concretas

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Dominio | Licencia |
|---|---|---|---|---|
| CardioBERTa.it_P_translations_only | ~110M | Italiano | Cardiología | no disponible |
| CardioBERTa.it (base) | ~110M | Italiano | Cardiología | no disponible |
| CardioBERTa.en | ~110M | Inglés | Cardiología | no disponible |

La comparación con alternativas de la misma categoría es limitada porque la información disponible no incluye benchmarks ni detalles de otros modelos comparables. El modelo se distingue por su especialización en cardiología e italiano, mientras que la mayoría de los encoders biomédicos son multilingües o solo en inglés. Las variantes de la familia CardioLM comparten arquitectura y enfoque, diferenciándose únicamente en el idioma de entrenamiento.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para italiano; no es aplicable a otros idiomas sin adaptación
- No está destinado a la toma de decisiones clínicas directas; es una herramienta de procesamiento de lenguaje para pipelines de NLP
- La longitud máxima de secuencia durante el entrenamiento es de 25 tokens, lo que puede limitar su eficacia en menciones largas o contextos extensos
- La licencia no está disponible, lo que plantea incertidumbre sobre las condiciones de uso comercial
- La terminología de entrenamiento no se distribuye por restricciones de licencia UMLS, lo que limita la reproducibilidad del entrenamiento
- No se han publicado benchmarks, por lo que el rendimiento relativo frente a alternativas no está verificado
- Como todo modelo de embeddings, puede mapear términos a CUIs incorrectos si la terminología no está bien cubierta, con riesgo de asignaciones erróneas en conceptos poco frecuentes

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.it_P_translations_only
- Modelo base CardioBERTa.it: https://huggingface.co/DT4H/CardioBERTa.it
- CardioBERTa.en: https://huggingface.co/DT4H/CardioBERTa.en
- Organización DataTools4Heart en HuggingFace: https://huggingface.co/DT4H
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
