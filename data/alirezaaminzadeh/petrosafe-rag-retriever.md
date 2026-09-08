# alirezaaminzadeh/petrosafe-rag-retriever

## Resumen

PetroSafe RAG Retriever es un índice de recuperación léxica híbrido desarrollado por Alireza Aminzadeh para el corpus bilingüe (persa/inglés) de seguridad de procesos PetroSafe. No se trata de un modelo de lenguaje neuronal, sino de un sistema de recuperación basado en scikit-learn que combina BM25, TF-IDF a nivel de palabra y TF-IDF a nivel de carácter. Su objetivo es servir como componente de recuperación en pipelines RAG (Retrieval-Augmented Generation) para dominios de salud, seguridad y medio ambiente (HSE) en la industria del petróleo y el gas.

El modelo resuelve el problema de recuperar fragmentos relevantes de documentación técnica de seguridad de procesos, con especial atención a la morfología del persa y a errores tipográficos. Es una evolución del índice hse-multimodal-rag-retriever, reentrenado sobre contenido nuevo de seguridad de procesos. Al ser un índice puramente léxico, no requiere GPU ni para construirlo ni para servirlo, lo que lo hace ligero y fácil de desplegar en entornos de CPU.

La relevancia actual radica en que muchos sistemas RAG dependen de recuperadores eficientes y robustos para evitar alucinaciones. Este modelo incorpora además un mecanismo de abstinencia automática: si una pregunta menciona un token con forma de etiqueta de equipo (por ejemplo, `V-101`) que no existe en el corpus, el filtro de metadatos descarta todos los candidatos y el generador se abstiene de responder, en lugar de inventar información.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Índice híbrido de recuperación léxica (BM25 + TF-IDF word + TF-IDF char) basado en scikit-learn |
| Parametros totales | no disponible (no es un modelo neuronal; es un índice con vocabularios) |
| Longitud de contexto | no disponible (no aplica a un índice de recuperación) |
| Tipos de cuantizacion | no disponible (no requiere cuantizacion) |
| Idiomas soportados | persa (fa), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (hybrid_index.joblib) |

## Arquitectura y entrenamiento

El índice se compone de tres submodelos de recuperación: un TF-IDF a nivel de palabra con n-gramas de 1 a 2, un TF-IDF a nivel de carácter con `char_wb` de 3 a 5 gramos (diseñado para ser robusto a la morfología persa y a errores tipográficos) y un índice Okapi BM25. La puntuación final combina los tres con pesos fijos: 0.42 para word TF-IDF, 0.28 para char TF-IDF y 0.30 para BM25. Además, el solapamiento de palabras clave entre la consulta y los fragmentos añade un pequeño boost adicional.

El entrenamiento no sigue el paradigma de ajuste fino de un transformer ni incluye RLHF o DPO. Se trata de un ajuste de pesos sobre un corpus nuevo: el índice se construye con 56 fragmentos de texto, un vocabulario de 4341 palabras y un vocabulario de 14403 caracteres. La arquitectura es idéntica a la del índice hse-multimodal-rag-retriever, pero con pesos ajustados sobre el corpus PetroSafe de seguridad de procesos en petróleo y gas. Los archivos incluyen `hybrid_index.joblib`, `config.json` con estadísticas del índice y `eval_results.json` con métricas de evaluación.

## Capacidades

- Recuperación híbrida léxica: combina BM25, TF-IDF de palabra y TF-IDF de carácter para obtener resultados relevantes en consultas bilingües.
- Robustez a errores tipográficos y morfología persa: el TF-IDF a nivel de carácter (char_wb 3-5 gramos) permite tolerar variaciones ortográficas y errores de transcripción.
- Abstinencia automática: si una pregunta contiene un token con forma de etiqueta de equipo (por ejemplo, `V-999`) que no tiene coincidencias en el corpus, el retriever devuelve cero resultados y el generador puede abstenerse de responder.
- Soporte multilingüe: indexa y recupera contenido en persa e inglés de forma simultánea.
- Evaluación incorporada: incluye métricas de recuperación y abstinencia en `eval_results.json`, con una tasa de acierto de documentos del 96.15% y una tasa de abstinencia correcta del 100%.
- Despliegue en CPU: al ser un índice léxico, no requiere GPU y puede servirse con scikit-learn y joblib.

## Casos de uso

- Asistente de seguridad de procesos en refinerías: el modelo recupera procedimientos operativos, hojas de datos de seguridad y normativas relevantes ante consultas en persa o inglés, permitiendo que un LLM generativo responda con fundamento documental.
- Soporte a operaciones con equipos etiquetados: cuando un operador pregunta sobre un equipo concreto (por ejemplo, `V-101`), el retriever localiza los fragmentos que mencionan esa etiqueta y, si no existen, activa la abstinencia para evitar respuestas falsas.
- Búsqueda documental en HSE: permite indexar manuales, informes de incidentes y listas de verificación de seguridad, facilitando consultas rápidas en auditorías e inspecciones.
- Integración en pipelines RAG con LLM: el índice actúa como recuperador de contexto; los fragmentos seleccionados se pasan a un modelo generativo para producir respuestas técnicas coherentes.
- Consultas multilingües en equipos internacionales: usuarios persas y angloparlantes pueden interrogar el mismo corpus sin necesidad de traducción previa, gracias al índice bilingüe.
- Detección de preguntas fuera de alcance: en sistemas de atención al cliente técnico, el retriever puede identificar consultas que no corresponden al corpus y evitar que el generador invente información.
- Auditoría y cumplimiento normativo: localización rápida de procedimientos y normativas relevantes para preparar inspecciones o responder a requerimientos regulatorios.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Retrieval doc-hit rate | 96.15% |
| Keyword hit rate | 96.15% |
| Correct-abstention rate | 100% (preguntas fuera de alcance y con etiquetas de equipo desconocidas) |

Estas métricas corresponden al conjunto de evaluación incluido en el repositorio, reproducible mediante `scripts/evaluate.py`. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB (el índice se ejecuta en CPU).
- GPU recomendada: ninguna; no se requiere aceleración gráfica para construir ni servir el índice.
- Compatibilidad con GPU de consumo: no aplica; funciona en cualquier máquina con Python y scikit-learn.
- Opciones de despliegue: integración directa en Python con joblib y scikit-learn, servicios web con Flask o FastAPI, o como componente de recuperación en pipelines RAG con frameworks como LlamaIndex o LangChain.
- Latencia y throughput: no disponible, aunque al ser un índice léxico sobre 56 fragmentos, la latencia de consulta es muy baja en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|
| petrosafe-rag-retriever | BM25 + TF-IDF word + char | PetroSafe bilingüe (fa/en) | Apache 2.0 | HuggingFace |
| hse-multimodal-rag-retriever | BM25 + TF-IDF word + char | HSE multimodal | no disponible | HuggingFace |

Ambos comparten la misma arquitectura de recuperación híbrida. La diferencia principal es que petrosafe-rag-retriever está ajustado sobre el corpus PetroSafe de seguridad de procesos, mientras que hse-multimodal-rag-retriever es la versión original sobre contenido multimodal de HSE. No se dispone de métricas comparativas directas entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Corpus de tamaño reducido: solo 56 fragmentos, lo que limita la cobertura temática del dominio de seguridad de procesos.
- Recuperación puramente léxica: no captura relaciones semánticas profundas; puede fallar ante sinónimos o paráfrasis que no compartan términos exactos con los fragmentos.
- Dependencia de la calidad del corpus: el rendimiento de la recuperación está intrínsecamente ligado a la exhaustividad y precisión de la documentación indexada.
- Idiomas limitados: solo persa e inglés; no soporta otros idiomas.
- No es un modelo generativo: requiere un generador externo para producir respuestas; por sí solo no genera texto.
- Abstinencia limitada: el mecanismo de abstinencia automática funciona específicamente para tokens con forma de etiqueta de equipo; para otros tipos de preguntas fuera de alcance, la tasa de abstinencia puede no ser perfecta.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se deben mantener los avisos de copyright y licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alirezaaminzadeh/petrosafe-rag-retriever
- Dataset companion: https://huggingface.co/datasets/alirezaaminzadeh/petrosafe-rag-corpus-fa
- Space demo: https://huggingface.co/spaces/alirezaaminzadeh/petrosafe-rag-fa
- Portfolio del autor: https://huggingface.co/spaces/alirezaaminzadeh/alireza-aminzadeh-resume
- Referencia de arquitectura: https://huggingface.co/alirezaaminzadeh/hse-multimodal-rag-retriever
