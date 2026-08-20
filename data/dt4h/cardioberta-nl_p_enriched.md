# DT4H/CardioBERTa.nl_P_enriched

## Resumen

CardioBERTa.nl_P_enriched es un codificador de terminología biomédica en neerlandés desarrollado por el proyecto europeo DataTools4Heart (DT4H). El modelo está especializado en normalización de conceptos clínicos y entity linking, es decir, en asociar términos médicos libres con identificadores estandarizados del sistema UMLS (Concept Unique Identifiers, CUIs). Se inicializa desde el modelo base UMCU/CardioBERTa.nl, perteneciente a la familia CardioBERTa de CardioLM, una suite multilingüe de modelos encoder pequeños adaptados al dominio cardiológico mediante preentrenamiento continuado con enmascaramiento de lenguaje (MLM).

La especialización se realiza mediante aprendizaje métrico sobre tripletas de terminología supervisadas por CUIs, enriquecidas con relaciones ontológicas de nivel "parent". Con 125,9 millones de parámetros, el modelo es compacto y adecuado para integración en pipelines de NLP clínico sin requerir infraestructura pesada. Su relevancia radica en la necesidad de estandarizar informes cardiológicos en distintos sistemas sanitarios europeos, facilitando la interoperabilidad y el análisis de datos federados. La ventana de contexto no se especifica en la documentación disponible, aunque al tratarse de un modelo tipo RoBERTa se espera una longitud típica de 512 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (probablemente 512, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | neerlandés (nl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa, un transformer encoder con atención bidireccional. El backbone CardioBERTa.nl fue preentrenado con MLM sobre corpus biomédicos y cardiológicos monolingües en neerlandés. Posteriormente, DT4H realizó un fine-tuning específico para entity linking utilizando tripletas (ancla, positivo, negativo) construidas a partir de terminología UMLS supervisada por CUIs. La estrategia "parents" enriquece los pares sinónimos con relaciones ontológicas de nivel padre, ampliando el vocabulario cubierto a 543.012 términos únicos y 476.525 CUIs. El entrenamiento empleó Multi-Similarity Loss con minería de todas las tripletas (margen 0,2), pooling sobre el token CLS, una época, batch size de 256 y learning rate de 2e-5. La longitud máxima de secuencia se fijó en 25 tokens, lo que indica un uso orientado a términos y frases cortas, no a documentos completos.

La terminología de entrenamiento no se distribuye con el repositorio debido a restricciones de licencia de UMLS, pero se publican estadísticas agregadas. El modelo está diseñado para generar embeddings normalizados L2 de términos clínicos, que pueden compararse mediante similitud coseno para recuperar conceptos relevantes.

## Capacidades

- Generación de embeddings de términos y frases clínicas en neerlandés, normalizados para búsqueda por similitud.
- Normalización de conceptos: mapeo de términos libres a CUIs de UMLS.
- Entity linking: vinculación de menciones en texto clínico a conceptos estandarizados.
- Recuperación de candidatos biomédicos para pipelines de anotación.
- Integración con bibliotecas de embeddings de frases (sentence-transformers) y con Text Embeddings Inference (TEI) para despliegue en producción.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- Capacidad multilingüe limitada al neerlandés; no soporta otros idiomas.

## Casos de uso

- Normalización de terminología en informes de cardiología: el modelo puede convertir términos libres como "acuífero" o "estenosis aórtica" en CUIs estándar, facilitando la agregación de datos clínicos heterogéneos.
- Entity linking en historiales clínicos electrónicos: integrado en un pipeline de extracción de entidades, permite enlazar menciones a conceptos UMLS para enriquecer registros de pacientes.
- Búsqueda semántica en literatura médica: dado un término de consulta, se pueden recuperar artículos o pasajes que contengan conceptos relacionados mediante similitud de embeddings.
- Análisis de cohortes: los investigadores pueden agrupar pacientes por conceptos estandarizados, comparando poblaciones entre centros sin ambigüedad terminológica.
- Interoperabilidad de datos de salud: al mapear términos locales a CUIs, se facilita el intercambio de información entre hospitales y sistemas regionales dentro del proyecto DT4H.
- Soporte a sistemas de apoyo a la codificación clínica: ayuda a asignar códigos estandarizados a diagnósticos y procedimientos descritos en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o similares, ya que el modelo no está orientado a tareas generales de lenguaje. Para tareas de entity linking y normalización de conceptos, no se proporcionan evaluaciones cuantitativas en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 125 millones de parámetros, la inferencia en FP32 requiere aproximadamente 500 MB de VRAM; en cuantización de 8 bits se reduce a unos 130 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). También es viable en CPU con baja latencia para lotes pequeños.
- Compatibilidad con hardware de consumo: sí, el modelo es ligero y puede ejecutarse en portátiles y equipos de escritorio estándar.
- Opciones de despliegue: transformers (Python), sentence-transformers, Text Embeddings Inference (TEI) para endpoints compatibles, y ONNX Runtime para optimización.
- Latencia y throughput: no se han publicado mediciones oficiales; en una CPU moderna se espera una latencia de unos pocos milisegundos por término (secuencias de hasta 25 tokens).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para entity linking en neerlandés cardiológico. Como referencia general, se podría mencionar BioBERT o PubMedBERT para inglés, pero no son directamente comparables por idioma y dominio. La información disponible no permite una comparativa objetiva.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente para neerlandés; no funciona con otros idiomas.
- Especializado en cardiología y terminología clínica; su rendimiento en otras especialidades médicas no está garantizado.
- No debe utilizarse para decisiones clínicas directas; es una herramienta de procesamiento de lenguaje.
- La terminología de entrenamiento no se distribuye por licencias UMLS, lo que puede limitar la reproducibilidad y el uso comercial del modelo en ciertos contextos.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo encoder, no genera texto, pero los embeddings pueden reflejar sesgos presentes en los corpus de preentrenamiento.
- La longitud máxima de secuencia de 25 tokens limita su uso a términos o frases cortas; no es adecuado para procesar documentos completos.
- La licencia del modelo no está especificada, lo que introduce incertidumbre sobre los términos de uso y redistribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DT4H/CardioBERTa.nl_P_enriched
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Organización GitHub de DT4H: https://github.com/DataTools4Heart/
- Referencia del modelo base: UMCU/CardioBERTa.nl (https://huggingface.co/UMCU/CardioBERTa.nl)
- Paper de referencia: Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain* (no se proporciona enlace directo en la información disponible).
