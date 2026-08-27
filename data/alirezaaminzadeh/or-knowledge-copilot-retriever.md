# alirezaaminzadeh/or-knowledge-copilot-retriever

## Resumen

OR Knowledge Copilot Retriever es un índice de recuperación híbrido (BM25 + TF-IDF a nivel de palabra y de carácter) desarrollado por Alireza Aminzadeh para el dominio de investigación operativa. No se trata de un modelo de lenguaje neuronal, sino de un artefacto léxico ajustado sobre un corpus especializado en formulación de problemas, código y trazas de solvers, diseñado para integrarse en un pipeline RAG (Retrieval-Augmented Generation) de dos etapas.

El modelo resuelve el problema de recuperación de conocimiento estructurado en dominios técnicos donde los modelos densos por similitud semántica pueden fallar por falta de vocabulario especializado. Su relevancia actual radica en que permite desplegar recuperación de conocimiento en entornos CPU y on-premise sin necesidad de GPU, lo que reduce costes y requisitos de infraestructura. El repositorio incluye dos ficheros: `hybrid_index.joblib` con los vectorizadores, matrices TF-IDF y estadísticas BM25, y `config.json` con los tamaños de vocabulario y el número de fragmentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Índice híbrido BM25 + TF-IDF de palabra + TF-IDF de carácter |
| Parametros totales | No aplicable (no es un modelo neuronal) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | joblib (índice serializado con scikit-learn) |

## Arquitectura y entrenamiento

El artefacto combina tres vías de recuperación léxica: BM25, que pondera la frecuencia de términos con normalización por longitud de documento; TF-IDF a nivel de palabra, que captura términos completos relevantes; y TF-IDF a nivel de carácter, que permite recuperar fragmentos con variaciones morfológicas o errores tipográficos. Estas tres representaciones se combinan en un índice único serializado con joblib.

El entrenamiento consiste en el ajuste de los vectorizadores y el cálculo de estadísticas BM25 sobre un corpus de investigación operativa que cubre formulación de problemas, código y trazas de ejecución de solvers. No se ha aplicado RLHF, DPO ni ningún método de alineación, al no tratarse de un modelo generativo. El autor indica que los resultados de evaluación están disponibles en el dataset complementario `alirezaaminzadeh/or-knowledge-copilot-corpus`, aunque no se han publicado los valores concretos en la model card.

## Capacidades

- Recuperación de fragmentos de conocimiento en dominio de investigación operativa mediante consultas en lenguaje natural.
- Integración en pipelines RAG como componente de primera etapa (retriever) antes de un reranker o generador.
- Funcionamiento completo en CPU sin necesidad de GPU, apto para Spaces de Hugging Face y despliegues on-premise.
- Soporte de sinónimos de dominio y enrutado de consultas mediante configuración externa (`SYNONYMS`, `router`, `PRODUCT`).
- Recuperación multinivel: formulación de problemas, código de solvers y trazas de ejecución.
- Fusión de resultados de tres métodos de recuperación (BM25, TF-IDF de palabra, TF-IDF de carácter) para mejorar la robustez.

## Casos de uso

- Asistente de formulación de problemas de optimización: un ingeniero consulta "what spinning reserve does GridWest unit commitment enforce?" y el retriever localiza los fragmentos del corpus que describen la restricción de reserva giratoria en el problema de unit commitment, que luego un LLM generativo convierte en una respuesta con citas.
- Recuperación de código de solvers MiniZinc: el índice permite localizar fragmentos de código de modelos de optimización previamente resueltos para reutilizarlos en nuevos problemas, evitando reescribir restricciones desde cero.
- Trazabilidad de trazas de ejecución: al indexar trazas de solvers, el sistema puede recuperar resultados históricos de ejecución (tiempos, gaps, soluciones) para comparar el rendimiento de distintas configuraciones.
- Sistema RAG corporativo sin GPU: organizaciones con restricciones de hardware pueden desplegar este retriever en servidores CPU para alimentar un asistente de conocimiento interno sobre investigación operativa.
- Benchmarking de recuperación: el índice puede servir como baseline léxico para comparar la calidad de recuperación frente a modelos densos (embeddings) en el dominio de OR.
- Chat de documentación técnica: integrado en un pipeline RAG con memoria de conversación, permite responder preguntas sobre manuales de solvers y documentación de modelado con respuestas fundamentadas en el corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `eval_results.json` en el dataset complementario `alirezaaminzadeh/or-knowledge-copilot-corpus`, pero los valores concretos no estan accesibles en la documentacion proporcionada.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU en ningun caso.
- Tamaño del repositorio de 0.0 GB, lo que indica un artefacto extremadamente ligero (el índice serializado ocupa menos de un gigabyte).
- Memoria RAM estimada: no disponible, pero por el tamaño del artefacto se estima que cabe en sistemas con 2-4 GB de RAM.
- Compatible con cualquier CPU moderna; no se requieren instrucciones vectoriales especiales más allá de las que usa scikit-learn.
- Despliegue recomendado en Hugging Face Spaces con runtime CPU o en servidores on-premise.
- Al ser un índice joblib, se carga con scikit-learn directamente; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: no disponible, pero al ser recuperación léxica sobre índices TF-IDF y BM25, se espera que sea de milisegundos en corpus de tamaño moderado.

## Comparativa con modelos similares

| Modelo | Tipo | Dominio | GPU requerida | Licencia |
|---|---|---|---|---|
| OR Knowledge Copilot Retriever | Índice léxico híbrido (BM25 + TF-IDF) | Investigación operativa | No | Apache-2.0 |
| Modelos de embeddings densos (p. ej. BGE, E5) | Transformer de recuperación densa | General | Sí (recomendada) | Variada |
| BM25 clásico (Elasticsearch, Lucene) | Índice léxico | General | No | Apache-2.0 |

La diferencia principal frente a los modelos de embeddings densos es que este artefacto no requiere GPU y está especializado en vocabulario de investigación operativa, mientras que los modelos densos generalistas pueden fallar en terminología de dominio. Frente al BM25 clásico, añade dos vías TF-IDF adicionales (palabra y carácter) y está preajustado sobre un corpus específico de OR, lo que mejora la recuperación en ese dominio sin necesidad de configurar un motor de búsqueda completo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo recupera fragmentos del corpus indexado. Necesita un LLM aguas abajo para generar respuestas.
- Alcance limitado al idioma inglés; no soporta consultas en otros idiomas.
- Depende de la calidad y cobertura del corpus de entrenamiento; si el corpus no cubre un tema de OR, la recuperación fallará.
- No hay métricas de evaluación publicadas en la documentación disponible; el rendimiento real no está verificado de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente o de uso personal sin validación comunitaria.
- Al ser un índice léxico, no captura relaciones semánticas: consultas con paráfrasis que no compartan términos con los fragmentos indexados pueden no recuperar resultados relevantes.
- La licencia Apache-2.0 permite uso comercial, pero el corpus subyacente puede tener restricciones adicionales no documentadas.
- El artefacto depende de la librería `ragkit` y de módulos de dominio (`domain.corpus`) que deben estar disponibles en el entorno de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alirezaaminzadeh/or-knowledge-copilot-retriever
- Dataset complementario: https://huggingface.co/alirezaaminzadeh/or-knowledge-copilot-corpus
- Pipeline MiniZinc Copilot: https://huggingface.co/alirezaaminzadeh/minizinc-copilot-pipeline
- Portafolio del autor: https://huggingface.co/spaces/alirezaaminzadeh/alireza-aminzadeh-resume
- Proyecto AI Knowledge Copilot (referencia): https://github.com/kymbat1/ai-knowledge-copilot
- Proyecto Enterprise AI Knowledge Copilot (referencia): https://github.com/moarsh17/EnterpriseAI_Knowledge_Copilot
