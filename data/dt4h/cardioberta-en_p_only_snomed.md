# DT4H/CardioBERTa.en_P_only_snomed

## Resumen

CardioBERTa.en_P_only_snomed es un encoder de terminología biomédica en inglés, especializado en normalización de conceptos clínicos y entity linking, desarrollado por el proyecto europeo DataTools4Heart (DT4H). Se inicializa desde el modelo base CardioBERTa.en, perteneciente a la familia CardioLM, una suite de modelos de lenguaje pequeños adaptados al dominio de la cardiología mediante preentrenamiento continuado con masked language modeling (MLM) sobre corpus biomédicos y cardiológicos monolingües.

El modelo se entrena con tripletas CUI-supervisadas (concept unique identifiers de UMLS) y estrategia de minería de tripletas basada en relaciones ontológicas de nivel "parent". El objetivo es producir embeddings de términos clínicos que permitan recuperar candidatos y normalizar conceptos, especialmente en pipelines de procesamiento de lenguaje natural clínico. Con 124,6 millones de parámetros y una arquitectura RoBERTa, es un modelo compacto y eficiente para tareas de retrieval y entity linking en dominios especializados.

La relevancia de este modelo radica en su enfoque específico para cardiología y su entrenamiento con terminología UMLS, lo que lo hace adecuado para sistemas de soporte a la decisión clínica, extracción de información de historiales médicos y normalización de conceptos en entornos sanitarios. No está destinado a la toma de decisiones clínicas directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 124.645.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 25 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa, un transformer encoder con atención bidireccional. El backbone CardioBERTa.en fue preentrenado mediante MLM sobre corpus biomédicos y cardiológicos en inglés, como parte de la familia CardioLM que cubre siete idiomas europeos. Para esta variante específica, el modelo se fine-tunea con un objetivo de metric learning: se utilizan tripletas (ancla, positiva, negativa) construidas a partir de términos clínicos asociados a CUIs de UMLS, enriqueciendo las relaciones con parent-level ontology relations (relaciones jerárquicas de nivel padre en la ontología).

El entrenamiento emplea Multi-Similarity Loss, minería de todas las tripletas con margen 0.2, pooling CLS, una época, batch size de 256, learning rate 2e-5 y longitud máxima de 25 tokens. Se generaron 1.182.767 tripletas que cubren 477.285 CUIs y 470.264 términos normalizados únicos, con una media de 3.48 términos por CUI. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de terminología biomédica y clínica, especialmente en el dominio de la cardiología.
- Normalización de conceptos clínicos (entity linking) mediante recuperación de candidatos por similitud coseno entre embeddings.
- Soporte para pipelines de procesamiento de lenguaje natural clínico: extracción de entidades, mapeo a conceptos UMLS/SNOMED.
- Funciona como encoder de texto para tareas de retrieval semántico en corpus médicos.
- Capacidad multilingüe limitada: solo inglés (aunque la familia CardioLM cubre más idiomas, este modelo concreto es solo en).
- No soporta generación de texto, tool calling ni razonamiento multi-paso; es un modelo de embeddings puro.

## Casos de uso

- Normalización de entidades clínicas en historiales electrónicos: dado un término extraído por un NER, el modelo produce un embedding que se compara contra una base de conceptos UMLS para asignar el CUI correcto.
- Recuperación de información biomédica: búsqueda semántica de términos y conceptos en literatura cardiológica, indexando documentos y consultas con el mismo encoder.
- Soporte a codificación médica automática: asistencia en la asignación de códigos SNOMED-CT o ICD a partir de descripciones clínicas en texto libre.
- Enriquecimiento de ontologías: detección de términos sinónimos o variantes léxicas dentro de un corpus clínico, agrupando por similitud de embeddings.
- Pipeline de entity linking en cardiología: integración con sistemas de extracción de información para conectar menciones de enfermedades, fármacos o procedimientos con bases de conocimiento estandarizadas.
- Investigación en procesamiento de lenguaje clínico: como modelo de referencia para experimentos de normalización de conceptos en inglés, dado su tamaño reducido y especialización en cardiología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas como MMLU, HumanEval u otras. Se desconocen comparaciones cuantitativas con otros modelos de entity linking.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 124M parámetros en FP32, el peso ocupa aproximadamente 500 MB. La inferencia puede ejecutarse en CPU con memoria RAM suficiente (4-8 GB), o en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente para inferencia. Para fine-tuning se recomienda una GPU con 8-12 GB de VRAM (RTX 3080, A10, etc.).
- Cabe en GPUs de consumo: sí, sin problema.
- Opciones de despliegue: compatible con Hugging Face Transformers, puede servirse con Text Embeddings Inference (TEI) o cualquier framework que soporte modelos de embeddings (sentence-transformers, etc.). No se menciona soporte para vLLM u Ollama, pero al ser un encoder estándar, puede usarse con ellos si se convierte a formato adecuado.
- Latencia y throughput: no disponible, pero al ser un modelo pequeño, la latencia es baja (del orden de milisegundos por lote en GPU).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos alternativos de normalización de conceptos clínicos. Se podría mencionar que existen modelos como BioBERT, PubMedBERT o SapBERT, pero no se dispone de datos de rendimiento comparables en la información proporcionada. Por tanto, se indica no disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no cubre otros idiomas de la familia CardioLM.
- Longitud de contexto limitada a 25 tokens, lo que restringe su uso a términos o frases cortas; no es adecuado para documentos completos.
- La terminología de entrenamiento no se distribuye debido a licencias de UMLS, lo que limita la reproducibilidad completa.
- No está destinado a la toma de decisiones clínicas directas; su uso es exclusivamente para investigación y pipelines de NLP.
- No se han publicado evaluaciones de sesgos o riesgos de alucinación; al ser un modelo de embeddings, no genera texto, pero puede producir embeddings poco fiables para términos fuera de dominio.
- Licencia no disponible: debe contactarse con el autor para aclarar términos de uso comercial.
- El modelo no tiene capacidades de generación ni razonamiento; es solo un encoder de características.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.en_P_only_snomed
- Modelo base CardioBERTa.en: https://huggingface.co/DT4H/CardioBERTa.en
- Proyecto DataTools4Heart (DT4H): https://datatools4heart.eu/ (no confirmado, pero el grant agreement 101057849 corresponde a la UE)
- Referencia: Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain* (no se proporciona enlace directo).
