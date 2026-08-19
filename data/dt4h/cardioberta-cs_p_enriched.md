# DT4H/CardioBERTa.cs_P_enriched

## Resumen

`DT4H/CardioBERTa.cs_P_enriched` es un codificador de terminología biomédica en checo diseñado para la normalización de conceptos clínicos y el enlazado de entidades (entity linking). Forma parte de la familia CardioBERTa, desarrollada en el marco del proyecto europeo DataTools4Heart (DT4H), un conjunto de modelos de lenguaje pequeños y específicos para el dominio de la cardiología. El modelo se inicializa desde `DT4H/CardioBERTa.cs`, un encoder RoBERTa adaptado al checo mediante preentrenamiento continuado con MLM sobre corpus biomédicos y cardiológicos monolingües.

La especialización se realiza mediante aprendizaje métrico supervisado por CUIs (Concept Unique Identifiers de la ontología UMLS). En concreto, esta variante usa la estrategia de entrenamiento `parents`, que enriquece los pares de sinónimos con relaciones ontológicas de nivel padre, generando 1,592,861 tripletes que cubren 476,184 CUIs y 526,263 términos normalizados únicos. El resultado es un modelo de embeddings de terminología capaz de representar conceptos clínicos en un espacio vectorial donde los sinónimos y términos relacionados quedan próximos, lo que permite recuperar candidatos en pipelines de normalización de entidades clínicas.

La relevancia de este modelo radica en su enfoque específico para el dominio de la cardiología en checo, un idioma con pocos recursos biomédicos disponibles. Su tamaño compacto (125,9 millones de parámetros) lo hace adecuado para despliegue en entornos con recursos limitados, y su formato `safetensors` y compatibilidad con `transformers` facilitan su integración en pipelines de procesamiento de lenguaje natural clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parámetros totales | 125,975,808 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (máximo de entrenamiento: 25 tokens; la arquitectura RoBERTa soporta hasta 512) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Checo (`cs`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de CardioBERTa, que es una adaptación de RoBERTa mediante preentrenamiento continuo con modelado de lenguaje enmascarado (MLM) sobre corpus biomédicos y cardiológicos en checo. La especialización posterior se realiza con una técnica de aprendizaje métrico: se construyen tripletes ancla-positivo-negativo a partir de pares de términos clínicos supervisados por CUIs de la UMLS, y se entrena con la función de pérdida Multi-Similarity Loss. El pooling se realiza sobre el token `[CLS]`, con una longitud máxima de 25 tokens, un tamaño de lote de 256, una tasa de aprendizaje de 2e-5 y una sola época.

La estrategia `parents` enriquece los pares de sinónimos con relaciones ontológicas de nivel padre, lo que amplía significativamente el número de términos y tripletes disponibles respecto a la estrategia de solo sinónimos. El conjunto de entrenamiento no se distribuye con el repositorio por restricciones de licencia de la UMLS; solo se publican estadísticas agregadas. El modelo está pensado para generar embeddings de términos clínicos que permitan recuperar candidatos y normalizar conceptos en textos cardiológicos checos.

## Capacidades

- Generación de embeddings de terminología clínica: produce representaciones vectoriales normalizadas (L2) de términos biomédicos y cardiológicos en checo.
- Normalización de conceptos clínicos: asigna términos textuales a conceptos UMLS mediante comparación de similitud de embeddings.
- Enlazado de entidades (entity linking): recupera candidatos de conceptos normalizados a partir de menciones textuales en textos clínicos.
- Recuperación de candidatos (candidate retrieval): permite buscar términos relacionados en un espacio vectorial, útil para pipelines de normalización.
- Capacidad multilingüe heredada: al ser parte de la familia CardioBERTa, la misma metodología se aplica a otros idiomas (holandés, inglés, italiano, rumano, español y sueco), aunque este modelo concreto solo soporta checo.
- No está diseñado para generación de texto ni para razonamiento conversacional: es un encoder puro para extracción de características.

## Casos de uso

- Normalización de terminología clínica en historiales checos: el modelo puede mapear menciones textuales de enfermedades, medicamentos y procedimientos cardiológicos a conceptos UMLS, facilitando la interoperabilidad entre sistemas de salud.
- Enriquecimiento de ontologías y vocabularios controlados: permite agrupar términos sinónimos y relaciones padre-hijo en la construcción de ontologías cardiológicas checas.
- Construcción de índices de búsqueda semántica en literatura médica checa: los embeddings permiten buscar documentos por concepto clínico en lugar de por palabra clave exacta.
- Preprocesamiento en pipelines de extracción de información clínica: puede usarse como paso previo para la normalización de conceptos en sistemas de minería de textos biomédicos.
- Soporte a sistemas de ayuda a la decisión clínica (no directa): como módulo de representación de conocimiento para enriquecer datos estructurados a partir de texto libre.
- Evaluación de la cobertura terminológica en recursos clínicos checos: permite medir qué conceptos de un corpus están representados en la UMLS y cómo de bien se agrupan los sinónimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos comparativos de rendimiento en tareas como MMLU, HumanEval o GSM8K, dado que es un modelo de extracción de características y no de generación. Tampoco se han reportado métricas de normalización de conceptos (por ejemplo, accuracy en entity linking) en la documentación proporcionada.

## Requisitos de hardware

- El modelo tiene 125,9 millones de parámetros, por lo que su huella de memoria es reducida.
- VRAM estimada para inferencia:
  - En FP32: aproximadamente 504 MB (125,9 M × 4 bytes).
  - En FP16: aproximadamente 252 MB (125,9 M × 2 bytes).
- Cabe sin problemas en GPUs de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060 (6 GB) o superiores.
- Para despliegue en producción con baja latencia, se recomienda una GPU con al menos 4 GB de VRAM si se usa FP16 y se procesan lotes grandes.
- Opciones de despliegue: se puede servir con Hugging Face `transformers` (pipeline de feature-extraction), y es compatible con `text-embeddings-inference` (TEI) según los tags del repositorio. También se puede integrar en `endpoints` de Hugging Face.
- Latencia y throughput: no se proporcionan datos medidos en la documentación. Al ser un encoder pequeño, se espera una latencia de pocos milisegundos por consulta en GPU moderna, pero no se dispone de valores exactos.

## Comparativa con modelos similares

La familia CardioBERTa incluye variantes para otros idiomas: `CardioBERTa.en`, `CardioBERTa.it`, `CardioBERTa.es`, `CardioBERTa.ro`, `CardioBERTa.nl` y `CardioBERTa.sv`. Todos comparten la misma arquitectura base y metodología, pero están adaptados a un idioma distinto. No se dispone de otros modelos comparables específicos para normalización de conceptos en checo en el momento de la consulta.

| Modelo | Parámetros | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioBERTa.cs_P_enriched | 125,9 M | checo | no disponible | no disponible | HF (safetensors) |
| CardioBERTa.cs (base) | 125,9 M | checo | no disponible | no disponible | HF (safetensors) |
| CardioBERTa.en (variante inglesa) | 125,9 M | inglés | no disponible | no disponible | HF (safetensors) |

## Limitaciones y advertencias

- El modelo no está diseñado para decisiones clínicas directas; su uso previsto es para investigación y pipelines de procesamiento de lenguaje natural.
- La longitud máxima de entrenamiento es de 25 tokens, lo que limita su uso con términos o frases largas; para secuencias mayores no se ha validado su comportamiento.
- Los datos de entrenamiento no se distribuyen por restricciones de la licencia de la UMLS, lo que dificulta la reproducción exacta del experimento.
- La licencia del modelo no está disponible, lo que implica precaución antes de un uso comercial sin consultar a los autores del proyecto DT4H.
- Al estar especializado en terminología cardiológica checa, su rendimiento en otros dominios clínicos o en otros idiomas será muy limitado.
- No se han publicado resultados de benchmarks, por lo que no se puede cuantificar su rendimiento en tareas estándar de entity linking o normalización.
- Como modelo basado en RoBERTa, puede heredar sesgos presentes en los corpus de preentrenamiento, especialmente en términos de género, edad o etnia en textos clínicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.cs_P_enriched
- Modelo base CardioBERTa.cs: https://huggingface.co/DT4H/CardioBERTa.cs
- Organización DT4H en HuggingFace: https://huggingface.co/datasets/DT4H/
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Organización GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Documentación de la plataforma: https://datatools4heart.github.io/documentation-hub/
