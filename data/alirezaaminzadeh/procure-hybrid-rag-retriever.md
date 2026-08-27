# alirezaaminzadeh/procure-hybrid-rag-retriever

## Resumen

Procure Hybrid RAG Retriever es un índice de recuperación léxica híbrido desarrollado por Alireza Aminzadeh, diseñado para sistemas de Retrieval-Augmented Generation (RAG) en entornos empresariales, especialmente en el dominio de procurement (compras). Combina tres señales de similitud textual —BM25, TF-IDF a nivel de palabra y TF-IDF a nivel de carácter— en un único índice que se ejecuta exclusivamente en CPU. No se trata de un modelo de deep learning ni de un transformer fine-tuned, sino de un componente estadístico clásico que puede integrarse como retriever en pipelines de RAG.

El modelo está publicado bajo licencia Apache-2.0, soporta únicamente el idioma inglés y se distribuye mediante la librería scikit-learn, con pesos serializados en formato joblib. Su relevancia actual radica en ofrecer una alternativa ligera, transparente y sin requisitos de GPU para tareas de recuperación en dominios específicos, donde los índices léxicos pueden complementar o sustituir a los embeddings densos. El repositorio incluye un dataset complementario (`alirezaaminzadeh/procure-hybrid-rag-corpus`) y se asocia a un Space de demostración llamado OrgMind RAG Studio, que muestra su uso en consultas sobre políticas de RRHH, HSE, Procurement e IT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Índice híbrido léxico: BM25 + TF-IDF de palabras + TF-IDF de caracteres |
| Parametros totales | No aplica (modelo no neuronal, basado en estadísticas) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (es un retriever, no un generador) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | joblib (scikit-learn) |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura de red neuronal. En su lugar, construye un índice híbrido que combina tres representaciones léxicas: BM25 (Okapi), TF-IDF a nivel de palabra y TF-IDF a nivel de carácter. Estas tres señales se fusionan para producir una puntuación de relevancia para cada documento del corpus. Al ser un método estadístico, no hay un proceso de entrenamiento con backpropagation; el índice se construye directamente a partir del corpus de documentos, calculando frecuencias y pesos. El dataset complementario (`procure-hybrid-rag-corpus`) proporciona el corpus sobre el que se construye el índice, presumiblemente compuesto por documentos de políticas empresariales. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que no es un modelo generativo.

## Capacidades

- Recuperación de documentos relevantes mediante búsqueda híbrida (BM25 + TF-IDF de palabras + TF-IDF de caracteres).
- Ejecución exclusiva en CPU, sin necesidad de GPU ni aceleradores.
- Integración sencilla con pipelines de scikit-learn y joblib.
- Soporte para consultas en inglés.
- Adecuado para dominios específicos como procurement, RRHH, HSE e IT, según la demostración asociada.
- No incluye generación de texto, tool calling, capacidades de agente ni razonamiento multi-paso.
- No es un modelo multimodal; solo procesa texto.

## Casos de uso

- Recuperación de políticas de procurement: el índice permite buscar en un corpus de documentos de compras y devolver los pasajes más relevantes para una consulta, que luego pueden pasarse a un LLM generador para respuestas con citas.
- Asistente de RRHH: en el Space OrgMind RAG Studio, el retriever se usa para responder preguntas sobre políticas de recursos humanos, proporcionando referencias a páginas concretas.
- Búsqueda de normativas HSE: consultas sobre seguridad y salud laboral pueden resolverse recuperando los documentos normativos pertinentes.
- Soporte a IT: búsqueda de procedimientos técnicos o políticas de TI dentro de una organización.
- Prototipado rápido de RAG: al ser CPU-only y ligero, es ideal para validar conceptos de RAG en entornos sin GPU.
- Complemento a retrievers densos: puede combinarse con embeddings vectoriales para mejorar la robustez en dominios con vocabulario especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como MMLU, HumanEval o GSM8K, ya que el modelo no es un LLM generativo. Tampoco se proporcionan métricas de recuperación (p. ej., nDCG, Recall@k) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- CPU-only: no requiere GPU.
- RAM: depende del tamaño del corpus indexado; al ser un índice estadístico, el consumo es proporcional al número de documentos y términos.
- Puede ejecutarse en cualquier máquina con Python y scikit-learn instalados, incluyendo portátiles y servidores sin aceleradores.
- Despliegue: se integra como componente de un pipeline RAG; no es un servicio autónomo. Puede usarse con frameworks como LangChain o LlamaIndex, aunque no se menciona explícitamente.
- Latencia y throughput: no se especifican, pero al ser un índice léxico, la inferencia es rápida en corpus de tamaño moderado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. Existen otros retrievers híbridos (p. ej., combinaciones de BM25 con embeddings densos), pero no se ofrecen datos de rendimiento ni especificaciones para establecer una comparación objetiva. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Solo recuperación léxica: no captura relaciones semánticas, sinónimos ni parafraseo, lo que puede limitar su eficacia en consultas con vocabulario variado.
- Dependencia del corpus: la calidad de la recuperación depende directamente de la cobertura y limpieza del corpus indexado.
- Idioma limitado: únicamente inglés; no soporta otros idiomas de forma nativa.
- No es un modelo generativo: no puede producir respuestas por sí mismo; requiere un componente generador aguas abajo.
- Sin métricas publicadas: no hay evidencia empírica de su rendimiento frente a alternativas.
- Licencia Apache-2.0: permite uso comercial, pero se debe verificar la procedencia del corpus complementario para evitar problemas de derechos de autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alirezaaminzadeh/procure-hybrid-rag-retriever
- Dataset complementario: https://huggingface.co/datasets/alirezaaminzadeh/procure-hybrid-rag-corpus
- Space de demostración OrgMind RAG Studio: https://huggingface.co/spaces/alirezaaminzadeh/enterprise-rag-studio
- Portafolio del autor: https://huggingface.co/spaces/alirezaaminzadeh/alireza-aminzadeh-resume
