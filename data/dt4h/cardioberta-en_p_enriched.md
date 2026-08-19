# DT4H/CardioBERTa.en_P_enriched

## Resumen

CardioBERTa.en_P_enriched es un encoder de terminología biomédica en inglés desarrollado por el proyecto DataTools4Heart (DT4H), especializado en normalización de conceptos clínicos y entity linking, con un enfoque particular en el dominio de la cardiología. Se inicializa desde el modelo base CardioBERTa.en y se entrena mediante metric learning sobre pares de términos clínicos supervisados por conceptos UMLS (CUI), enriquecidos con relaciones ontológicas de tipo "parent". El resultado es un modelo que produce embeddings normalizados de términos clínicos, útil para recuperación de candidatos, desambiguación de conceptos y mapeo a vocabularios estandarizados.

Con 124 millones de parámetros, este modelo pertenece a la familia CardioBERTa, parte de la suite multilingüe CardioLM. Su arquitectura es un transformer tipo RoBERTa, y su entrenamiento se realizó con Multi-Similarity Loss sobre 1,7 millones de tripletas que cubren 477.290 CUIs y más de 550.000 términos únicos. La relevancia actual radica en la necesidad de interoperabilidad semántica en datos clínicos, especialmente en cardiología, donde la normalización de conceptos es crítica para la integración de historiales electrónicos, investigación y ensayos clínicos.

El modelo está diseñado para tareas de extracción de características (feature extraction) y es compatible con herramientas de inferencia como text-embeddings-inference, lo que facilita su despliegue en pipelines de NLP clínica. No es un modelo generativo, sino un encoder puro orientado a representaciones densas de términos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 124.645.632 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenado con max_length 25) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, heredada de su backbone CardioBERTa.en, que a su vez fue adaptado al dominio cardiológico mediante continued pretraining con masked language modeling sobre corpus biomédicos y cardiológicos en inglés. La especialización para normalización de conceptos se realizó mediante metric learning: se construyeron tripletas (ancla, positivo, negativo) a partir de pares de términos clínicos supervisados por CUIs, enriquecidas con relaciones ontológicas de tipo "parent" (términos padre en la jerarquía UMLS). El entrenamiento usó Multi-Similarity Loss con mining de todas las tripletas (margen 0,2), pooling sobre el token CLS, una sola época, batch size de 256 y learning rate de 2e-5. La longitud máxima de secuencia se fijó en 25 tokens, lo que indica que el modelo está optimizado para términos cortos y frases clínicas breves.

El conjunto de entrenamiento incluyó 1.699.553 tripletas, cubriendo 477.290 CUIs y 550.651 términos únicos normalizados. Cabe destacar que la terminología de entrenamiento no se distribuye con el repositorio debido a restricciones de licencia de UMLS, por lo que solo se publican estadísticas agregadas. Esta limitación afecta a la reproducibilidad exacta del entrenamiento, aunque el modelo final sí está disponible.

## Capacidades

- Generación de embeddings semánticos para términos y conceptos clínicos, normalizados con norma L2.
- Normalización de conceptos clínicos (concept normalization) y entity linking, mapeando menciones a identificadores UMLS/CUI.
- Recuperación de candidatos (candidate retrieval) en dominios biomédicos, especialmente cardiología.
- Búsqueda semántica de sinónimos y términos relacionados mediante similitud coseno.
- Integración en pipelines de NLP clínica como módulo de representación de entidades.
- Soporte para despliegue con text-embeddings-inference y endpoints compatibles.
- No incluye capacidades generativas, tool calling, agentes, visión ni audio.

## Casos de uso

- Normalización de conceptos en historiales clínicos electrónicos: el modelo puede mapear menciones de enfermedades cardíacas, síntomas o medicamentos a códigos UMLS/CUI, facilitando la estandarización de datos para análisis posteriores.
- Entity linking en literatura biomédica: al procesar artículos científicos sobre cardiología, los embeddings permiten enlazar términos variables a conceptos canónicos, mejorando la búsqueda y la agregación de conocimiento.
- Recuperación de información clínica: dado un término de consulta, el modelo encuentra sinónimos y términos relacionados en una base de datos de conceptos, útil para motores de búsqueda especializados.
- Construcción de grafos de conocimiento clínico: los embeddings de conceptos permiten conectar entidades entre documentos y bases de datos, creando relaciones semánticas explícitas.
- Codificación automática de diagnósticos: integrado en un sistema de codificación ICD o SNOMED, el modelo puede sugerir códigos apropiados a partir de descripciones clínicas en lenguaje natural.
- Soporte a la interoperabilidad de datos de salud: al normalizar términos de diferentes fuentes (hospitales, ensayos, registros), se facilita el intercambio y la comparación de información clínica a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o similares, dado que se trata de un encoder de embeddings y no de un modelo generativo. Tampoco se proporcionan evaluaciones específicas de tareas de entity linking o normalización de conceptos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 124M parámetros, la inferencia en FP32 requiere aproximadamente 0,5 GB de VRAM, y en FP16 alrededor de 0,25 GB. Cabe en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso CPU para inferencia por lotes pequeños.
- Opciones de despliegue: compatible con transformers, text-embeddings-inference (mencionado en los tags), y puede servirse mediante endpoints de Hugging Face o soluciones como FastAPI.
- Latencia y throughput: no disponibles, pero dado el tamaño reducido, se espera una latencia de milisegundos por lote en GPU y un throughput alto en tareas de embedding por lotes.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Existen modelos alternativos en el ámbito de la normalización de conceptos clínicos, como SapBERT (también basado en metric learning sobre UMLS) o BioBERT, pero no se han encontrado resultados de rendimiento comparables en esta búsqueda. Por tanto, no es posible realizar una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; no soporta otros idiomas.
- Enfocado en el dominio cardiológico; su rendimiento puede degradarse en otras especialidades médicas.
- La terminología de entrenamiento no se distribuye debido a restricciones de licencia UMLS, lo que limita la reproducibilidad del proceso de entrenamiento.
- No está destinado a la toma de decisiones clínicas directas; su uso es exclusivamente para tareas de NLP e investigación.
- La longitud máxima de secuencia en entrenamiento fue de 25 tokens, por lo que su eficacia en contextos largos puede verse comprometida.
- No se han reportado evaluaciones de sesgos ni de alucinaciones; al ser un encoder, no genera texto, pero los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento.
- La licencia del modelo no está especificada, lo que genera incertidumbre sobre su uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.en_P_enriched
- Modelo base CardioBERTa.en: https://huggingface.co/DT4H/CardioBERTa.en
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio GitHub del proyecto: https://github.com/DataTools4Heart/
- Documentación de DataTools4Heart: https://datatools4heart.github.io/documentation-hub/
