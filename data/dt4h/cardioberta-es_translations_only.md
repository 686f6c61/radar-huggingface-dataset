# DT4H/CardioBERTa.es_translations_only

## Resumen

`DT4H/CardioBERTa.es_translations_only` es un encoder de terminología biomédica en español desarrollado por el consorcio europeo DataTools4Heart (DT4H), especializado en normalización de conceptos clínicos y entity linking. Se inicializa desde `DT4H/CardioBERTa.es`, un modelo de la familia CardioBERTa de CardioLM, que adapta arquitecturas RoBERTa al dominio de la cardiología mediante entrenamiento continuado con masked language modeling sobre corpus biomédicos monolingües. Este modelo concreto se ajusta con pares de sinónimos supervisados por conceptos UMLS (CUI) y aprendizaje métrico, generando embeddings normalizados que permiten recuperar conceptos clínicos a partir de términos libres.

El modelo tiene 125,98 millones de parámetros, un tamaño compacto que lo hace adecuado para despliegue en entornos con recursos limitados, y está pensado para integrarse en pipelines de procesamiento de lenguaje natural clínico, especialmente en cardiología. Su relevancia radica en la necesidad de estandarizar la terminología médica en español dentro de proyectos federados de datos de salud, donde la interoperabilidad semántica es crítica. No se distribuye la terminología de entrenamiento por restricciones de licencia de UMLS, pero se publican estadísticas agregadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa base, un transformer encoder con atención bidireccional. El backbone pertenece a la familia CardioBERTa de CardioLM, que adapta modelos de lenguaje pequeños al dominio de la cardiología mediante entrenamiento continuado con MLM en corpus monolingües biomédicos y cardiológicos. La familia cubre siete idiomas: checo, neerlandés, inglés, italiano, rumano, español y sueco.

El ajuste fino se realiza con tripletas de sinónimos supervisadas por CUI (Concept Unique Identifier de UMLS). Se emplean 69.277 tripletas que cubren 69.277 CUIs y 136.233 términos normalizados únicos. La estrategia de entrenamiento usa Multi-Similarity Loss con minería de todas las tripletas y margen 0.2, pooling sobre el token CLS, una época, tamaño de batch 256, tasa de aprendizaje 2e-5 y longitud máxima de secuencia de 25 tokens. El objetivo es que los embeddings de términos sinónimos queden cerca en el espacio vectorial, mientras que los de términos no relacionados se separen. No se utilizan técnicas como RLHF o DPO; el aprendizaje es puramente métrico.

## Capacidades

- Genera embeddings de términos clínicos normalizados, adecuados para recuperación de candidatos y similitud semántica.
- Soporta entity linking y normalización de conceptos, mapeando términos libres a conceptos UMLS.
- Funciona como extractor de características (feature extraction) para pipelines de NLP clínico.
- Especializado en terminología cardiológica, aunque puede generalizar a otros dominios biomédicos.
- Capacidad multilingüe limitada: solo español, aunque el backbone base es multilingüe, este ajuste es monolingüe.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente encoder.

## Casos de uso

- Normalización de términos en historiales clínicos electrónicos: el modelo puede convertir expresiones coloquiales o variantes de términos médicos (p. ej. "infarto de miocardio" vs. "ataque al corazón") a un concepto UMLS canónico, facilitando la agregación de datos en estudios retrospectivos.
- Recuperación de candidatos en sistemas de entity linking: dado un término libre, el modelo genera un embedding que permite buscar en una base de conceptos pre-indexada, reduciendo el espacio de búsqueda antes de una resolución más fina.
- Indexación semántica de literatura biomédica en español: permite buscar artículos o resúmenes por concepto, no solo por palabras clave, mejorando la precisión en revisiones sistemáticas.
- Interoperabilidad entre sistemas hospitalarios: al normalizar la terminología, facilita el intercambio de datos entre instituciones con vocabularios distintos, como requiere el proyecto DT4H.
- Anonimización asistida de textos clínicos: los embeddings pueden usarse para identificar menciones de conceptos específicos y ayudar en la desidentificación de datos, aunque no es su función principal.
- Construcción de grafos de conocimiento clínico: el modelo puede enlazar menciones en texto a nodos de ontologías como UMLS o SNOMED CT, permitiendo construir grafos para análisis de relaciones entre enfermedades y tratamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas comparativas, dado que es un modelo de embeddings y no de generación. La model card solo reporta estadísticas de entrenamiento (tripletas, CUIs, términos), no métricas de evaluación como precisión en entity linking o recall@k.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación disponible.
- Por su tamaño (~126M parámetros), el modelo es ligero: en float32 ocupa aproximadamente 500 MB, y en cuantización de 8 bits podría reducirse a ~130 MB.
- Es viable en GPUs de consumo como NVIDIA GTX 1060 (6 GB) o superiores, y también en CPU con suficiente RAM (al menos 4 GB).
- Se puede desplegar con librerías estándar de Hugging Face (transformers, sentence-transformers) y con servidores de embeddings como text-embeddings-inference, como indica el tag `endpoints_compatible`.
- Para inferencia por lotes en producción, una sola GPU A100 o similar puede manejar cientos de peticiones por segundo, aunque no hay datos de throughput publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos alternativos de la misma categoría (embeddings biomédicos en español). Existen otros modelos como `DT4H/CardioBERTa.es` (el backbone) o modelos NER como `DT4H/cardio-ner-es-cardioberta-multilabel`, pero no hay datos públicos de rendimiento relativo. La comparativa queda pendiente de futuras publicaciones del proyecto CardioLM.

## Limitaciones y advertencias

- La licencia no está especificada, lo que puede dificultar su uso comercial sin aclaración legal.
- La terminología de entrenamiento no se distribuye por restricciones de UMLS, lo que limita la reproducibilidad completa del entrenamiento.
- Es un modelo monolingüe en español; no cubre otros idiomas de la familia CardioBERTa.
- La longitud de contexto no se especifica, pero al derivar de RoBERTa es probablemente 512 tokens; sin embargo, el entrenamiento usó secuencias de máximo 25 tokens, por lo que puede degradarse con términos muy largos.
- No está diseñado para decisiones clínicas directas; es una herramienta de soporte para NLP, no un sistema de diagnóstico.
- Puede presentar sesgos derivados de los corpus de entrenamiento, aunque no se han documentado explícitamente.
- Como modelo de embeddings, puede producir falsos positivos en recuperación de conceptos si los términos son ambiguos o poco frecuentes.
- No se han publicado evaluaciones externas que validen su rendimiento en entornos clínicos reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DT4H/CardioBERTa.es_translations_only)
- [Modelo base DT4H/CardioBERTa.es](https://huggingface.co/DT4H/CardioBERTa.es)
- [Organización DataTools4Heart en GitHub](https://github.com/DataTools4Heart/)
- [Sitio web del proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [Artículo de referencia: Danu et al., CardioLM - a multilingual suite of small language models for the cardiology domain](https://huggingface.co/DT4H/CardioBERTa.es) (enlace indirecto desde la model card)
