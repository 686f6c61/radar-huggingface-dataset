# DT4H/CardioBERTa.sv_enriched

## Resumen

`DT4H/CardioBERTa.sv_enriched` es un codificador de terminología biomédica en sueco, desarrollado por el consorcio DataTools4Heart (DT4H) dentro del proyecto europeo CardioLM. El modelo está especializado en normalización de conceptos clínicos y entity linking, es decir, en mapear términos biomédicos en lenguaje natural a conceptos normalizados del sistema UMLS. Se inicializa desde `DT4H/CardioBERTa.sv`, un modelo de la familia CardioBERTa, que a su vez fue adaptado al dominio cardiológico mediante preentrenamiento continuo con MLM sobre corpus biomédicos suecos. La especialización se realiza mediante tripletas de sinónimos supervisadas por CUI (Concept Unique Identifier) y aprendizaje métrico con Multi-Similarity Loss.

El modelo tiene 124,7 millones de parámetros, un tamaño típico de un BERT base, y está diseñado para tareas de recuperación de candidatos y enlazado de entidades en pipelines de procesamiento de lenguaje natural clínico. Se publica con pesos en formato safetensors, pero no se indica una licencia específica. Su relevancia radica en que ofrece un recurso lingüístico para el sueco, un idioma con escasos modelos biomédicos específicos, y en su integración en la plataforma federada y privada de DT4H para análisis de datos de cardiología.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parámetros totales | 124.690.944 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (se recomienda truncar a 25 tokens para entrenamiento, pero la ventana completa del backbone no se ha especificado) |
| Tipos de cuantización | no disponible (solo safetensors con precisión F32/I64) |
| Idiomas soportados | sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un modelo BERT de la familia CardioBERTa, que a su vez se basa en una arquitectura transformer encoder estándar con 12 capas y un tamaño de 768 unidades. El preentrenamiento de CardioBERTa.sv se realizó mediante MLM sobre corpora biomédicos y cardiológicos en sueco. Para la especialización, `sv_enriched` se entrena con triplets de sinónimos derivados de terminología UMLS, usando la estrategia `synonyms` (80.858 triplets, 80.858 CUIs y 155.374 términos únicos normalizados). El objetivo es Multi-Similarity Loss, con pooling de la representación de la token CLS y una longitud máxima de 25 tokens durante el entrenamiento. Se usa minería de todos los triplets con margen 0.2, una época y tamaño de lote 256. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, solo se publican estadísticas agregadas.

## Capacidades

- Genera embeddings densos y normalizados (L2) de términos y frases clínicas en sueco.
- Realiza normalización de conceptos clínicos, es decir, mapea términos libres a identificadores de conceptos UMLS (CUIs).
- Soporta entity linking y recuperación de candidatos en pipelines de NLP biomédico.
- Permite la búsqueda semántica de términos dentro de un vocabulario clínico controlado.
- Especializado en el dominio de la cardiología, aunque el entrenamiento con terminología UMLS general lo hace aplicable a otros ámbitos clínicos.
- No incluye capacidades de generación de texto, razonamiento ni tool calling; es un modelo puramente de embeddings.

## Casos de uso

- Normalización de términos en historiales clínicos suecos: el modelo puede transformar expresiones libres de síntomas, medicamentos o procedimientos en códigos UMLS estandarizados, lo que facilita la integración de datos heterogéneos en sistemas de información hospitalaria.
- Recuperación de conceptos para anotación de corpus: en proyectos de anotación de textos clínicos, se utiliza como generador de candidatos para desambiguación de entidades, reduciendo el espacio de búsqueda a los conceptos más similares.
- Indexación de documentos clínicos: al convertir cada documento en un embedding de sus conceptos principales, se puede construir un índice semántico para búsqueda por similitud en bases de datos de historiales clínicos.
- Enlace de entidades en notas de alta cardiológica: para conectar las menciones de enfermedades o tratamientos con su equivalente en el UMLS, el modelo se integra en un pipeline que combina reconocimiento de entidades con este enlazador.
- Construcción de grafos de conocimiento clínico: al normalizar los términos de múltiples fuentes a un mismo CUI, se pueden fusionar y enriquecer grafos de conocimiento para la investigación en cardiología.
- Análisis federado en la plataforma DT4H: el modelo se puede desplegar en nodos locales dentro de la infraestructura federada de DataTools4Heart para normalizar datos de múltiples centros sin compartir información bruta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: 124,7 millones de parámetros, aproximadamente 500 MB en precisión float32.
- VRAM estimada para inferencia: menos de 1 GB con precisión FP32; con cuantización a FP16 se reduce a unos 250 MB. Es compatible con cualquier GPU de consumo (RTX 2060, GTX 1660, etc.).
- También puede ejecutarse en CPU sin problemas, con latencia de unos pocos milisegundos por consulta (según la longitud del texto).
- Opciones de despliegue: se puede usar con la biblioteca `transformers` directamente, con `sentence-transformers` para integraciones de embeddings, o con `text-embeddings-inference` (el modelo es compatible con endpoints de Hugging Face).
- Para producción con alto rendimiento, se recomienda usar un servicio de inferencia dedicado como `text-embeddings-inference` o `sentence-transformers` en un contenedor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de embedding biomédicos para sueco. Se puede mencionar que existen alternativas como `KB-BERT` (sueco general) o `BioBERT` (inglés), pero no hay evaluaciones disponibles en la información proporcionada. La comparación directa no está disponible.

## Limitaciones y advertencias

- El modelo está diseñado únicamente para el idioma sueco; no soporta otros idiomas.
- No se ha publicado licencia, lo que puede limitar su uso comercial sin consultar al autor.
- La terminología de entrenamiento no se distribuye por restricciones de UMLS, lo que impide reproducir el entrenamiento exacto.
- El modelo no está destinado a la toma de decisiones clínicas directas; su uso es para investigación y procesamiento de datos.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos biomédicos, puede heredar sesgos de los textos originales (género, edad, etc.).
- No hay información sobre la longitud de contexto máxima, aunque se recomienda truncar a 25 tokens durante el entrenamiento; para inferencia, se debe respetar el límite del tokenizador BERT (512 tokens).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.sv_enriched
- Modelo base: https://huggingface.co/DT4H/CardioBERTa.sv
- Proyecto CardioLM (referencia): Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain*
- Organización en GitHub: https://github.com/DataTools4Heart/
- Documentación del proyecto: https://datatools4heart.github.io/documentation-hub/
- Sitio web del proyecto: https://www.datatools4heart.eu/
