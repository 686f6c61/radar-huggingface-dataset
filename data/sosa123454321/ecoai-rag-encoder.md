# sosa123454321/ecoai-rag-encoder

## Resumen

`ecoai-rag-encoder` es un retriever basado en TF-IDF desarrollado por el usuario `sosa123454321` para el proyecto FindExpert.ir ecoAI, un sistema de recuperación de información orientado a becas y documentación académica en Irán. No se trata de un modelo de lenguaje de gran tamaño ni de un transformer de embeddings densos, sino de un vectorizador `TfidfVectorizer` de scikit-learn ajustado sobre el dataset `sosa123454321/ecoai-knowledge`, que contiene documentos en persa (fa) e inglés (en).

El modelo resuelve el problema de recuperación de documentos relevantes dentro de un pipeline RAG (Retrieval-Augmented Generation) en un entorno con recursos muy limitados (2 GB de RAM y sin GPU). Su relevancia radica en que demuestra una aproximación pragmática y ligera al retrieval, donde la generación posterior se delega en un LLM externo (Gemini o un futuro adaptador Qwen2.5-0.5B). El repositorio incluye dos artefactos: `encoder.joblib` (el vectorizador entrenado con la matriz de documentos) y `encoder.json` (vocabulario, IDF y documentos dispersos para el Space estático).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (TfidfVectorizer de scikit-learn) con similitud coseno |
| Parametros totales | no disponible (no es un modelo neuronal; el vocabulario y los pesos IDF dependen del corpus) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (no procesa secuencias; vectoriza texto completo) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | fa (persa), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (encoder.joblib) y JSON (encoder.json) |

## Arquitectura y entrenamiento

El modelo emplea la representación clásica de bolsa de palabras con ponderación TF-IDF. El `TfidfVectorizer` se ajusta sobre el corpus `sosa123454321/ecoai-knowledge`, generando una matriz documento-término dispersa. La recuperación se realiza calculando la similitud coseno entre el vector TF-IDF de la consulta del usuario y los vectores de los documentos almacenados. No hay entrenamiento neuronal, ni capas ocultas, ni retropropagación; el ajuste consiste únicamente en el cálculo de frecuencias y pesos IDF sobre el corpus.

El autor indica explícitamente que esta versión v1 es un "fine-tune" entre comillas, dado que el entorno de desarrollo no permite entrenar modelos densos como Qwen o E5. Se plantea una actualización futura hacia embeddings densos con `intfloat/multilingual-e5-small`, pero sin sustituir este repositorio por pesos de MiniLM u otros forks. El pipeline completo se integra en el Space `sosa123454321/ecoai-space`, que recupera documentos y muestra las fuentes, dejando la generación de texto a un LLM externo.

## Capacidades

- Recuperación de documentos por similitud coseno basada en TF-IDF, adecuada para búsqueda por coincidencia de términos.
- Soporte bilingüe persa e inglés, con tokenización estándar de scikit-learn (no hay tokenizadores específicos por idioma).
- Integración en un pipeline RAG: vectoriza la consulta, recupera los documentos más relevantes y los pasa a un generador externo.
- Funciona en entornos con recursos mínimos (CPU, ~2 GB RAM), sin necesidad de GPU.
- Exportación en dos formatos: joblib para uso programático y JSON para el Space estático de Hugging Face.

## Casos de uso

- Búsqueda de convocatorias de becas en Irán: el sistema recupera documentos académicos y de financiación relevantes a partir de consultas en persa o inglés, mostrando las fuentes originales.
- Asistente de investigación para estudiantes: dado un tema de interés, el retriever devuelve los documentos del corpus ecoAI que contienen los términos clave, facilitando la revisión manual.
- Componente de retrieval en un chatbot RAG: el vectorizador se usa como primera etapa para seleccionar pasajes, que luego son resumidos o reformulados por un LLM (Gemini o un futuro Qwen2.5-0.5B).
- Indexación de documentación institucional: permite buscar en un corpus cerrado de documentos académicos o administrativos sin depender de servicios externos de embeddings.
- Prototipado rápido de RAG en entornos con restricciones de hardware: al ser un modelo de sklearn, se puede desplegar en instancias pequeñas o en el edge sin coste de inferencia neuronal.
- Evaluación de la calidad del corpus: al inspeccionar los términos con mayor IDF, se puede analizar la cobertura temática del dataset `ecoai-knowledge`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de precisión, recall, NDCG u otras típicas de retrieval. El autor no proporciona comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero; un `TfidfVectorizer` con una matriz dispersa ocupa pocos MB, dependiendo del tamaño del corpus.
- RAM estimada: menos de 500 MB para el vectorizador y la matriz de documentos, incluso con miles de documentos.
- GPU: no necesaria. Puede ejecutarse en cualquier máquina con Python y scikit-learn.
- Despliegue: se puede integrar en servicios como FastAPI, o en Spaces de Hugging Face con recursos gratuitos (el propio autor lo usa en un Space estático).
- Latencia: del orden de milisegundos para vectorizar una consulta y calcular similitudes, incluso con un corpus de tamaño moderado.
- Throughput: limitado por la CPU y el número de documentos; para corpus muy grandes, la búsqueda lineal puede ser un cuello de botella, pero es viable para miles de documentos.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Uso en RAG |
|---|---|---|---|---|---|
| ecoai-rag-encoder | TF-IDF (sklearn) | fa, en | no aplica | Apache 2.0 | Retrieval por coincidencia de términos |
| intfloat/multilingual-e5-small | Transformer denso (embeddings) | multilingüe (incluye fa, en) | 512 tokens | MIT | Retrieval semántico denso |
| sentence-transformers/paraphrase-multilingual-MiniLM | Transformer denso | multilingüe | 512 tokens | Apache 2.0 | Retrieval semántico denso |

La comparativa es orientativa: el modelo TF-IDF no captura semántica, solo solapamiento léxico, mientras que los transformers densos ofrecen mejor comprensión del significado, pero requieren más recursos. El autor menciona que no debe sustituirse este repositorio por un fork de MiniLM, lo que sugiere que la elección de TF-IDF es deliberada por restricciones de entorno.

## Limitaciones y advertencias

- No captura relaciones semánticas: TF-IDF solo mide coincidencia de términos; sinónimos o paráfrasis no se recuperarán correctamente.
- Dependencia del corpus: el vocabulario y los pesos IDF están fijados al dataset `ecoai-knowledge`; documentos fuera de ese dominio pueden no representarse bien.
- Sin soporte de contexto largo: al no ser un modelo secuencial, no hay límite de tokens, pero la vectorización de textos muy largos puede diluir la relevancia de términos específicos.
- Riesgo de alucinación en la generación: el retriever solo recupera; la generación la hace un LLM externo, que puede inventar información si los documentos recuperados son insuficientes.
- Licencia Apache 2.0: permite uso comercial, pero el corpus subyacente (`ecoai-knowledge`) puede tener sus propias restricciones; conviene revisarlas.
- Sin mantenimiento activo: el repositorio tiene 0 descargas y 0 likes, y el autor lo presenta como una solución provisional ("v1") con planes de migrar a embeddings densos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sosa123454321/ecoai-rag-encoder
- Dataset de conocimiento: https://huggingface.co/datasets/sosa123454321/ecoai-knowledge
- Space de demostración: https://huggingface.co/spaces/sosa123454321/ecoai-space
- Dataset de SFT (futuro): https://huggingface.co/datasets/sosa123454321/ecoai-sft
- Sitio del proyecto: https://findexpert.ir
