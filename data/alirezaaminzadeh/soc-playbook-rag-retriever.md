# alirezaaminzadeh/soc-playbook-rag-retriever

## Resumen

El modelo `alirezaaminzadeh/soc-playbook-rag-retriever` es un índice de recuperación híbrido diseñado para sistemas de generación aumentada por recuperación (RAG) en el dominio de los centros de operaciones de seguridad (SOC). A diferencia de los modelos basados en transformers, este retriever combina tres técnicas léxicas clásicas: BM25, TF-IDF sobre palabras y TF-IDF sobre caracteres, todo ello implementado con scikit-learn y serializado con joblib. Está pensado para ejecutarse exclusivamente en CPU, lo que lo hace ligero y adecuado para entornos con recursos limitados.

El modelo fue publicado por Alireza Aminzadeh en agosto de 2026 y se complementa con un corpus de playbooks de SOC (`alirezaaminzadeh/soc-playbook-rag-corpus`). Su relevancia radica en ofrecer una alternativa sencilla y transparente a los retrievers neuronales, especialmente útil en dominios especializados donde los datos son escasos o donde se requiere una explicabilidad total del proceso de recuperación. Al ser un índice léxico, no requiere entrenamiento con GPU ni grandes volúmenes de datos, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Índice híbrido BM25 + TF-IDF de palabras + TF-IDF de caracteres (no es un transformer) |
| Parametros totales | no disponible (no aplica, es un índice estadístico) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, no procesa secuencias) |
| Tipos de cuantizacion | no disponible (no aplica, no es un modelo de pesos) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (serialización de objetos scikit-learn) |

## Arquitectura y entrenamiento

El modelo no es una red neuronal, sino un índice de recuperación construido con scikit-learn. Combina tres representaciones léxicas: BM25 (Okapi), TF-IDF a nivel de palabra y TF-IDF a nivel de caracteres (n-gramas). Esta combinación híbrida permite capturar tanto coincidencias exactas de términos como variaciones morfológicas y ortográficas. El índice se construye sobre un corpus de playbooks de SOC, que son documentos operativos que describen procedimientos de respuesta a incidentes, guías de análisis y políticas de seguridad.

No se dispone de información detallada sobre el proceso de entrenamiento (número de documentos, tokenización, parámetros de los algoritmos). Dado que es un modelo clásico de recuperación, no hay fases de ajuste fino ni técnicas como RLHF o DPO. La innovación principal reside en la combinación de tres métodos de scoring y en su empaquetado como un artefacto reutilizable para pipelines de RAG.

## Capacidades

- Recuperación de documentos relevantes a partir de consultas en texto libre, utilizando un scoring híbrido BM25 + TF-IDF.
- Búsqueda por similitud léxica, con soporte para coincidencias parciales gracias al TF-IDF de caracteres.
- Integración sencilla en pipelines de RAG como componente de recuperación (retriever).
- Funcionamiento exclusivo en CPU, sin necesidad de GPU ni aceleradores.
- Compatible con el ecosistema scikit-learn y joblib, lo que facilita su carga y uso en entornos Python.
- No incluye capacidades de generación de texto, razonamiento, tool calling ni agentes; es un componente puramente de recuperación.

## Casos de uso

- Asistente de respuesta a incidentes de seguridad: un sistema RAG que, ante una consulta sobre un tipo de ataque, recupera el playbook de SOC más relevante y lo presenta al analista como guía de acción.
- Búsqueda interna de documentación operativa: integrar el retriever en un portal corporativo para que los equipos de seguridad encuentren procedimientos, políticas o runbooks mediante consultas en lenguaje natural.
- Automatización de triaje de alertas: combinar el retriever con un LLM para que, dada una alerta, recupere el playbook correspondiente y genere un resumen de los pasos a seguir.
- Generación de informes de incidentes: usar el retriever para localizar secciones de playbooks que describan técnicas de mitigación y luego alimentar a un modelo generativo que redacte el informe.
- Entrenamiento de nuevos analistas: un chatbot que, a partir de preguntas sobre procedimientos, recupere fragmentos de playbooks y los muestre como material de referencia.
- Evaluación comparativa de retrievers: al ser un modelo ligero y transparente, sirve como línea base para comparar el rendimiento de retrievers neuronales más complejos en el dominio de SOC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de recuperación como Recall@K o NDCG. El autor no ha documentado experimentos comparativos con otros retrievers.

## Requisitos de hardware

- Inferencia en CPU únicamente; no requiere GPU.
- Memoria RAM estimada: no disponible, pero al ser un índice de tamaño reducido (repo de 0.0 GB) se espera que quepa en sistemas con poca memoria (menos de 1 GB probablemente).
- No aplica a GPUs específicas (A100, H100, RTX 4090, etc.).
- Puede ejecutarse en cualquier máquina con Python y scikit-learn instalados, incluyendo instancias cloud de bajo coste o incluso dispositivos edge.
- Opciones de despliegue: integración directa en scripts Python, uso en frameworks de RAG como LangChain o LlamaIndex (si se adapta como retriever personalizado), o exposición como servicio REST mediante Flask/FastAPI.
- Latencia y throughput: no disponibles, pero al ser un modelo léxico se espera una latencia de milisegundos en consultas sobre corpus pequeños o medianos.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto | Uso típico |
|---|---|---|---|---|---|
| soc-playbook-rag-retriever (este) | Híbrido BM25 + TF-IDF | inglés | Apache 2.0 | no aplica | Recuperación léxica en dominios especializados |
| BM25 clásico (p.ej. Elasticsearch) | Léxico | multilingüe | Apache 2.0 (Elasticsearch) | no aplica | Búsqueda de texto general |
| TF-IDF con scikit-learn | Léxico | multilingüe | BSD | no aplica | Recuperación simple en prototipos |
| Modelos densos (p.ej. sentence-transformers) | Neuronal | multilingüe | varios | 512 tokens | Recuperación semántica |

La comparativa se limita a retrievers clásicos porque no hay datos de rendimiento para comparar con modelos neuronales. La ventaja de este modelo es su simplicidad y su enfoque específico en playbooks de SOC, mientras que los modelos densos ofrecen comprensión semántica pero requieren GPU y más datos.

## Limitaciones y advertencias

- Es un modelo puramente léxico: no comprende sinónimos, paráfrasis ni relaciones semánticas. Consultas con vocabulario distinto al del corpus pueden fallar.
- Solo soporta inglés; no hay soporte multilingüe.
- No es un modelo generativo: no produce texto, solo recupera documentos.
- El corpus de playbooks de SOC no está disponible públicamente en el repositorio (se menciona como dataset complementario, pero no se ha verificado su acceso).
- Al ser un índice estadístico, su rendimiento depende de la calidad y cobertura del corpus de entrenamiento. Si el corpus es pequeño, la recuperación puede ser limitada.
- No se han documentado sesgos específicos, pero al estar entrenado sobre documentación de seguridad, puede reflejar sesgos propios de ese dominio (por ejemplo, terminología anglocéntrica).
- Riesgo de alucinación no aplica directamente, pero en un pipeline RAG, si el retriever devuelve documentos irrelevantes, el LLM podría generar respuestas incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del corpus asociado si se utiliza en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alirezaaminzadeh/soc-playbook-rag-retriever
- Dataset complementario (mencionado en la model card): https://huggingface.co/alirezaaminzadeh/soc-playbook-rag-corpus
- Repositorio GitHub relacionado (rag-playbook): https://github.com/Aamirofficiall/rag-playbook
- Portfolio del autor: https://huggingface.co/spaces/alirezaaminzadeh/alireza-aminzadeh-resume
- Guía de RAG (contexto general): https://www.mrlatte.net/en/research/2026/04/27/rag-complete-guide/
- Página de DeepWiki sobre Playbook RAG: https://deepwiki.com/ladislav-lettovsky/ai-delivery-exception-system/5.2-playbook-rag-and-vector-store
