# alirezaaminzadeh/hse-multimodal-rag-retriever

## Resumen

El modelo `alirezaaminzadeh/hse-multimodal-rag-retriever` es un índice léxico híbrido diseñado para recuperación de documentos en pipelines de Retrieval-Augmented Generation (RAG). Desarrollado por Alireza Aminzadeh, combina tres técnicas clásicas de recuperación: BM25, TF-IDF a nivel de palabra y TF-IDF a nivel de caracteres. No se trata de un transformer fine-tuneado, sino de un índice estadístico que funciona exclusivamente en CPU, lo que lo hace extremadamente ligero y rápido para entornos sin GPU.

El modelo está pensado para ser utilizado junto con el dataset complementario `alirezaaminzadeh/hse-multimodal-rag-corpus`, y su nombre sugiere una orientación a dominios de salud, seguridad y medio ambiente (HSE), aunque la model card no especifica el contenido exacto del corpus. Su relevancia actual radica en la tendencia hacia sistemas RAG híbridos que combinan recuperación léxica y semántica para mejorar la precisión de las respuestas generadas por LLMs, especialmente en entornos empresariales donde los recursos de cómputo son limitados.

Al ser un índice precomputado, no requiere entrenamiento ni ajuste de hiperparámetros en el momento de uso, y su licencia Apache 2.0 permite integración comercial sin restricciones. Sin embargo, su alcance se limita a la recuperación de texto en inglés y no ofrece capacidades generativas ni de razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Índice híbrido léxico (BM25 + TF-IDF de palabras + TF-IDF de caracteres) |
| Parametros totales | No aplicable (no es una red neuronal) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (no procesa secuencias) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Joblib (scikit-learn) |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura de transformer ni de red neuronal. Es un índice estadístico construido sobre un corpus de documentos, que combina tres métodos de recuperación léxica: BM25 (Okapi BM25), TF-IDF a nivel de palabra y TF-IDF a nivel de caracteres. Esta combinación permite capturar tanto coincidencias exactas de términos como variaciones morfológicas y ortográficas parciales, mejorando la robustez frente a errores tipográficos o formas flexivas.

No se dispone de información sobre el proceso de construcción del índice, el tamaño del corpus ni los hiperparámetros utilizados (por ejemplo, parámetros k1 y b de BM25). Al ser un índice precomputado, no existe una fase de entrenamiento en el sentido tradicional; simplemente se calculan las estadísticas de frecuencia sobre el corpus de referencia. La model card indica que es "CPU-only" y que no es un transformer fine-tuneado, lo que confirma su naturaleza puramente léxica.

## Capacidades

- Recuperación de documentos basada en similitud léxica: devuelve los pasajes más relevantes según puntuaciones combinadas de BM25 y TF-IDF.
- Búsqueda híbrida: integra tres señales de puntuación (BM25, TF-IDF de palabras, TF-IDF de caracteres) para mejorar la precisión en consultas con variaciones léxicas.
- Ejecución en CPU: no requiere GPU, lo que facilita su despliegue en entornos de bajo coste.
- Integración con pipelines RAG: puede usarse como componente de recuperación previo a un LLM generativo.
- Soporte multilingüe: limitado al inglés, según la etiqueta `language: en`.
- No incluye capacidades de generación de texto, razonamiento, tool calling, visión ni audio.

## Casos de uso

- Recuperación de políticas corporativas en dominios HSE: el corpus asociado (`hse-multimodal-rag-corpus`) sugiere que el índice está optimizado para documentos de salud, seguridad y medio ambiente. Un sistema RAG puede usarlo para responder consultas de empleados sobre normativas internas, devolviendo los pasajes relevantes antes de que un LLM genere la respuesta final.
- Chatbots de atención al cliente en empresas con documentación extensa: al ser ligero y rápido, puede integrarse en servicios de mensajería para buscar respuestas en manuales de producto o FAQ, reduciendo la carga sobre el LLM generativo.
- Búsqueda en bases de conocimiento técnico: útil para equipos de soporte que necesitan localizar rápidamente procedimientos o especificaciones en grandes volúmenes de documentación técnica en inglés.
- Pre-filtrado de documentos para pipelines de RAG multimodal: aunque el nombre sugiere multimodalidad, el índice es puramente textual; puede usarse como primer filtro para reducir el espacio de búsqueda antes de aplicar modelos de reranking más costosos.
- Sistemas de recuperación en entornos sin GPU: ideal para despliegues en servidores CPU-only o en edge devices donde no se dispone de aceleración por hardware.
- Evaluación de técnicas de recuperación híbrida: al combinar BM25 y TF-IDF, sirve como baseline para comparar con métodos densos (embeddings) o híbridos más avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, recall, latencia o throughput. El repositorio no incluye métricas comparativas con otros retrievers.

## Requisitos de hardware

- VRAM estimada: 0 GB (no requiere GPU).
- GPU recomendadas: ninguna; funciona exclusivamente en CPU.
- Compatibilidad con hardware de consumo: sí, cualquier CPU moderna es suficiente.
- Opciones de despliegue: al ser un índice joblib, puede cargarse en cualquier proceso Python con scikit-learn. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles, pero al ser un índice léxico, se espera una latencia de milisegundos en consultas sobre corpus de tamaño moderado.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Uso en RAG |
|---|---|---|---|---|
| `alirezaaminzadeh/hse-multimodal-rag-retriever` | Índice híbrido (BM25 + TF-IDF) | Inglés | Apache 2.0 | Recuperación léxica |
| BM25 puro (implementación estándar) | Índice léxico | Multilingüe | Variable | Recuperación léxica |
| Sentence-transformers (p.ej. `all-MiniLM-L6-v2`) | Transformer denso | Multilingüe | Apache 2.0 | Recuperación semántica |

La comparativa se limita a aspectos generales, ya que no hay datos de rendimiento del modelo evaluado. Frente a BM25 puro, este modelo añade TF-IDF de caracteres, lo que puede mejorar la robustez ante errores tipográficos. Frente a modelos densos, es mucho más ligero y rápido, pero no captura relaciones semánticas profundas.

## Limitaciones y advertencias

- No es un modelo generativo: solo realiza recuperación de documentos, no genera texto ni respuestas.
- Alcance lingüístico limitado al inglés; no soporta otros idiomas.
- Depende del corpus asociado: su utilidad está condicionada a la calidad y cobertura del dataset `alirezaaminzadeh/hse-multimodal-rag-corpus`, del que no se proporcionan detalles.
- Sin información sobre sesgos: al ser un índice estadístico, los sesgos provienen del corpus subyacente, pero no se documentan.
- Riesgo de alucinación: no aplica directamente, pero si se usa en un pipeline RAG, las respuestas finales del LLM pueden alucinar si el recuperador devuelve pasajes irrelevantes.
- Tamaño del repositorio: 0.0 GB, lo que sugiere que el índice no está almacenado en el repositorio de HuggingFace o que es un placeholder; es posible que el índice real deba construirse a partir del corpus.
- Sin soporte para tool calling, agentes ni razonamiento multi-paso.
- No hay documentación sobre mantenimiento, versionado ni soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alirezaaminzadeh/hse-multimodal-rag-retriever
- Perfil del autor: https://huggingface.co/alirezaaminzadeh/models
- Espacio demo "Enterprise RAG Studio": https://huggingface.co/spaces/alirezaaminzadeh/enterprise-rag-studio/blob/main/README.md
- Repositorio GitHub "Advanced Multimodal RAG": https://github.com/alirazaaihub/advanced-multimodal-rag
- Paper "Multi-RAG" (arXiv): https://arxiv.org/pdf/2505.23990
- Documentación de Azure AI Search sobre RAG: https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview
