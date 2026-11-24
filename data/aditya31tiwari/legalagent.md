# aditya31tiwari/LegalAgent

## Resumen

LegalAgent es un sistema agéntico de revisión de contratos orientado a la detección de riesgos entre cláusulas (cross-clause risk detection), publicado por el usuario aditya31tiwari en Hugging Face. A diferencia de las herramientas convencionales de revisión contractual, que analizan cada cláusula de forma aislada, LegalAgent plantea el par de cláusulas como unidad de análisis: busca combinaciones que entran en conflicto, dependen entre sí, se solapan o dejan lagunas explotables (por ejemplo, un límite de responsabilidad en la cláusula 5 anulado por una indemnización en la cláusula 12).

El repositorio no contiene pesos de un modelo de lenguaje en sentido estricto: los tags indican el formato `joblib`, lo que sugiere artefactos serializados de Python (probablemente componentes del pipeline). El sistema se apoya en un pipeline de seis etapas que combina extracción y clasificación de cláusulas con un LegalBERT ajustado, recuperación de cláusulas relacionadas mediante BM25, embeddings densos o híbrido, análisis cruzado, detección de riesgo con severidad y explicación final mediante RAG con un LLM externo vía API.

Su relevancia actual reside en el enfoque metodológico: la comparación sistemática de tres estrategias de recuperación (BM25, densa e híbrida) evaluadas con precisión y recall a distintos valores de *k* sobre pares de cláusulas derivados de referencias cruzadas del propio contrato, además de una matriz de tipos de riesgo que codifica combinaciones peligrosas conocidas. No se dispone de información sobre arquitectura base, tamaño de parámetros ni longitud de contexto del componente generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline modular de seis etapas: extracción de cláusulas, clasificación con LegalBERT ajustado, recuperación (BM25/densa/híbrida), análisis cruzado, detección de riesgo y explicación RAG con LLM vía API |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | joblib (artefactos serializados de Python); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

LegalAgent no es un modelo monolítico sino un sistema compuesto. La etapa de clasificación de cláusulas emplea un LegalBERT ajustado (fine-tuned) para etiquetar cada cláusula extraída. La extracción se realiza por patrones de numeración y sección (1.1, (a), Section 5). La recuperación de cláusulas relacionadas se implementa con tres métodos comparados: BM25 mediante `rank-bm25` (solapamiento de términos legales y referencias explícitas), recuperación densa con Sentence-Transformers (similitud semántica con distinto fraseo) e híbrida (combinación de puntuaciones). El almacenamiento vectorial se apoya en FAISS o ChromaDB.

El análisis cruzado clasifica cada par en cuatro tipos de relación: conflicto, dependencia, solapamiento y ambigüedad. La detección de riesgo asigna severidad (Low, Medium, High) mediante una rúbrica ajustable y auditable que combina el tipo de relación, el emparejamiento de tipos de cláusula y la confianza del análisis. La explicación final se genera con un LLM externo vía API en un esquema RAG, fundamentada en referencias recuperadas.

El sistema se entrena y evalúa con CUAD (500+ contratos, más de 13.000 cláusulas anotadas por expertos) y un conjunto de retención (held-out) reducido de contratos con lagunas documentadas públicamente, tratado como caso ilustrativo y no como benchmark estadístico. La orquestación con LangGraph, una interfaz MCP y un GNN sobre grafo de cláusulas se mencionan como extensiones futuras, no implementadas. No se especifican número de tokens de entrenamiento, composición detallada del dataset ni uso de RLHF/DPO.

## Capacidades

- Extracción automática de cláusulas a partir de patrones de numeración y sección.
- Clasificación de cláusulas por tipo mediante LegalBERT ajustado.
- Recuperación de cláusulas relacionadas con tres estrategias comparables (BM25, densa, híbrida).
- Análisis cruzado de pares de cláusulas con tipología de relación: conflicto, dependencia, solapamiento y ambigüedad.
- Detección de riesgos con severidad asignada por rúbrica transparente (Low/Medium/High).
- Explicación en lenguaje llano de cada hallazgo, con evidencia textual de ambas cláusulas y referencias de soporte.
- Uso de referencias cruzadas explícitas del texto ("subject to Section 8.2") y de una matriz de tipos de riesgo para priorizar pares.
- Capacidad de generación de explicaciones vía LLM externo en esquema RAG.
- Capa de producto: inicio de sesión, almacenamiento de documentos, panel de control, historial y borrado de cuenta y datos.
- No se documentan capacidades multilingües, de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Revisión de contratos mercantiles en despachos jurídicos: el sistema analiza un contrato completo y devuelve pares de cláusulas potencialmente conflictivas con evidencia textual, lo que permite al abogado centrar la revisión manual en los puntos de mayor riesgo en lugar de leer todas las cláusulas de forma lineal.
- Due diligence en fusiones y adquisiciones: sobre lotes de contratos, la detección de combinaciones peligrosas (límite de responsabilidad frente a indemnización, terminación frente a supervivencia) ayuda a identificar pasivos ocultos antes de la firma.
- Revisión de contratos de proveedores y SaaS: la matriz de tipos de riesgo y las referencias cruzadas permiten detectar cláusulas de exclusividad o no competencia que entren en conflicto con compromisos existentes.
- Asistencia a equipos internos de compras o legales sin especialización profunda: cada hallazgo incluye una explicación en lenguaje llano y referencias, lo que reduce la dependencia de interpretación experta para una primera criba.
- Investigación académica sobre recuperación de información jurídica: la comparación BM25/densa/híbrida con precisión y recall a distintos valores de *k* constituye un artefacto reproducible para estudiar recuperación de cláusulas relacionadas.
- Prototipado de productos de legal tech: la arquitectura modular (cada etapa lee y escribe la misma estructura de datos de cláusula) permite sustituir componentes —por ejemplo, cambiar el LLM de explicación o el almacén vectorial— sin reescribir el pipeline.
- Auditoría y cumplimiento interno: la rúbrica de severidad auditable y ajustable facilita justificar ante terceros por qué un par de cláusulas se marcó como riesgo alto o medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación de precisión y recall a distintos valores de *k* para las tres estrategias de recuperación frente a pares de cláusulas derivados de referencias cruzadas del propio contrato, pero no se aportan cifras numéricas. Tampoco se publican resultados sobre MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El componente generativo se ejecuta vía API externa, por lo que el consumo local se limita al LegalBERT ajustado y a los índices de recuperación, sin cifras publicadas.
- GPU recomendadas: no disponible. Un LegalBERT ajustado puede ejecutarse en CPU o en GPU de gama media, pero no se documenta ningún requisito oficial.
- Compatibilidad con GPU de consumo: no confirmada; no se especifican modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: el stack declarado incluye Python 3.10+, PyTorch, HuggingFace Transformers, rank-bm25, Sentence-Transformers y FAISS o ChromaDB. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card afirma que el sistema "se ejecuta en segundos, no en minutos" gracias a la priorización de pares candidatos, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Herramienta asistencial, no sustitutiva: la propia model card declara explícitamente que LegalAgent no reemplaza la revisión de un abogado.
- Riesgo de alucinación en las explicaciones generadas por el LLM externo vía API, aunque el esquema RAG busca fundamentarlas en referencias recuperadas.
- La evaluación se apoya en CUAD y en un conjunto de retención reducido y no estadísticamente representativo; los resultados de recuperación no se han publicado con cifras.
- La sugerencia de revisión (suggested revision) se describe como posible alcance futuro, no como funcionalidad consolidada.
- No se especifican licencia ni condiciones de uso comercial; la licencia figura como no disponible, lo que impide asumir permisos de explotación.
- No se documentan idiomas soportados; el pipeline y el dataset CUAD están orientados al inglés jurídico, por lo que el rendimiento en castellano es incierto.
- El repositorio registra cero descargas y cero likes, y no contiene pesos de un modelo de lenguaje: los artefactos son `joblib`, lo que limita su uso directo como modelo desplegable.
- Dependencia de un LLM externo vía API para la generación de explicaciones: introduce coste, latencia y dependencia de un proveedor no especificado.
- Componentes avanzados (LangGraph, MCP, GNN sobre grafo de cláusulas) se anuncian como trabajo futuro y no están implementados.

## Enlaces

- Hugging Face: https://huggingface.co/aditya31tiwari/LegalAgent
- CUAD (dataset de contratos): no se proporciona enlace en la información disponible
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
