# DT4H/CardioBERTa.nl_P_only_snomed

## Resumen

CardioBERTa.nl_P_only_snomed es un codificador de terminología biomédica en neerlandés, desarrollado por el proyecto DataTools4Heart (DT4H) para tareas de normalización de conceptos clínicos y entity linking. Se inicializa desde el modelo base UMCU/CardioBERTa.nl, perteneciente a la familia CardioBERTa, una suite de modelos encoder pequeños adaptados al dominio de la cardiología mediante pre-entrenamiento continuado con enmascaramiento de lenguaje (MLM) sobre corpus monolingües biomédicos y cardiológicos.

El modelo se especializa mediante aprendizaje métrico supervisado por conceptos UMLS (CUI), usando triplets generados a partir de relaciones de parentesco ontológico. Con 125,98 millones de parámetros y una arquitectura RoBERTa, está diseñado para generar embeddings de términos clínicos que permiten recuperar candidatos y normalizar entidades en pipelines de procesamiento de lenguaje natural clínico. Su relevancia actual radica en la estandarización de informes de cardiología a nivel europeo, dentro del proyecto DT4H que busca interoperabilidad entre regiones.

La licencia no está disponible, y el modelo solo soporta neerlandés. El entrenamiento utiliza 815.240 triplets que cubren 290.745 CUIs y 288.527 términos únicos, con una longitud máxima de secuencia de 25 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con max_length=25) |
| Tipos de cuantizacion | no disponible (safetensors; cuantizable a GGUF, ONNX, etc.) |
| Idiomas soportados | neerlandes (nl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa, un transformer encoder con atención bidireccional. El backbone CardioBERTa.nl fue pre-entrenado con MLM sobre corpus biomédicos y cardiológicos en neerlandés, dentro de la familia CardioLM que cubre siete idiomas europeos. Sobre esta base, el modelo se fine-tunea con un objetivo de aprendizaje métrico: se construyen triplets (ancla, positivo, negativo) donde los positivos son términos asociados al mismo CUI y los negativos provienen de otros conceptos. Se emplea Multi-Similarity Loss con minería de todos los triplets y margen 0.2, pooling CLS, una época, batch size 256 y learning rate 2e-5.

La estrategia de triplets se denomina `parents`, lo que significa que se enriquecen los pares de términos con relaciones ontológicas de nivel padre en la jerarquía UMLS. Esto permite que el modelo aprenda representaciones que agrupan términos relacionados semánticamente, incluso si no comparten exactamente el mismo CUI. La terminología de entrenamiento no se distribuye con el repositorio debido a las restricciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de términos clínicos en neerlandés, especialmente en el dominio de la cardiología.
- Recuperación de candidatos para entity linking: dado un término, produce un vector normalizado que puede compararse con embeddings de conceptos UMLS.
- Normalización de conceptos clínicos: asigna términos textuales a conceptos UMLS estandarizados.
- Soporte de búsqueda por similitud coseno en espacios de alta dimensión.
- Compatible con bibliotecas de embeddings de frases como sentence-transformers.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Normalización de diagnósticos en informes de cardiología: el modelo convierte expresiones clínicas libres en códigos UMLS estandarizados, facilitando la interoperabilidad entre sistemas hospitalarios europeos.
- Entity linking en registros electrónicos de salud (EHR): integrado en un pipeline de NLP, extrae menciones de enfermedades, medicamentos y procedimientos, y las enlaza a conceptos UMLS para análisis agregados.
- Búsqueda semántica de términos clínicos: permite a investigadores encontrar sinónimos o términos relacionados en neerlandés a partir de una consulta, usando similitud coseno sobre los embeddings.
- Deduplicación de conceptos en bases de datos clínicas: agrupa variantes ortográficas o terminológicas del mismo concepto, reduciendo errores en consolidación de datos.
- Soporte a la traducción de terminología cardiológica: al generar embeddings alineados con UMLS, facilita el mapeo entre términos neerlandeses y conceptos multilingües del mismo CUI.
- Enriquecimiento de ontologías: ayuda a detectar términos faltantes o relaciones entre conceptos en el subconjunto neerlandés de UMLS, mediante análisis de proximidad vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en FP32: ~500 MB de VRAM (pesos del modelo).
- Inferencia en FP16: ~250 MB de VRAM.
- Inferencia en int8 (cuantización): ~125 MB de VRAM.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y también se puede ejecutar en CPU con memoria suficiente.
- Despliegue recomendado: transformers (Python), sentence-transformers, o servidores de embeddings como Text Embeddings Inference (TEI) de Hugging Face, compatible con los tags del repositorio.
- Latencia esperada: al ser un modelo de ~126M parámetros, la inferencia es muy rápida; en GPU se procesan miles de secuencias por segundo, aunque no se proporcionan cifras oficiales.
- No requiere hardware especializado; un solo GPU de gama media es suficiente para producción a pequeña escala.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de normalización de conceptos en neerlandés. Existen alternativas como MedRoBERTa.nl o RobBERT, pero no se han encontrado datos de rendimiento comparables en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para neerlandés; no soporta otros idiomas.
- La longitud máxima de secuencia durante el entrenamiento es de 25 tokens, lo que limita su uso con términos o frases largas; se recomienda truncar o segmentar.
- No está destinado a la toma de decisiones clínicas directas; es una herramienta de procesamiento de lenguaje, no un sistema de diagnóstico.
- La terminología de entrenamiento no se distribuye, lo que impide reproducir exactamente el fine-tuning.
- Puede presentar sesgos derivados del dominio cardiológico y de los corpus utilizados; su comportamiento en otras especialidades médicas no está validado.
- Al ser un encoder, no genera texto; el riesgo de alucinación se limita a posibles embeddings incorrectos para términos fuera de distribución.
- La licencia no está especificada, por lo que se recomienda contactar con los autores antes de usar comercialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.nl_P_only_snomed
- Colección CardioBERTa Family: https://huggingface.co/collections/DT4H/cardioberta-family
- Colección Dutch de DT4H: https://huggingface.co/collections/DT4H/dutch
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Organización GitHub de DT4H: https://github.com/DataTools4Heart/
- Referencia del paper (Danu et al., CardioLM): citado en la model card, sin URL directa.
- Artículo relacionado en SMM4H-HeaRD 2026: https://aclanthology.org/2026.smm4h-1.14/
