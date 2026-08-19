# quanfire-ai/rerank-statute-en

## Resumen

`quanfire-ai/rerank-statute-en` es un modelo de re-ranking (cross-encoder) especializado en texto legal estatutario central en inglés, desarrollado por Quanfire AI. Se trata de un fine-tune de `intfloat/multilingual-e5-small` con una cabeza de regresión escalar (`num_labels=1`) que puntúa la relevancia de un par (consulta, pasaje) de forma conjunta. Su propósito es actuar como segunda etapa en un pipeline de retrieve-then-rerank: un bi-encoder recupera un candidato inicial y este modelo reordena ese shortlist para elevar la sección correcta al primer puesto.

Con 117,6 millones de parámetros y una longitud máxima de contexto de 256 tokens, es un modelo compacto y eficiente para su dominio. Su relevancia actual radica en que aborda un problema específico del sector legal: la recuperación precisa de secciones de leyes (bare-Act) en inglés, donde los bi-encoders tradicionales a menudo fallan por la similitud superficial entre secciones. La licencia Apache-2.0 permite uso comercial sin restricciones, y su tamaño lo hace desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en `multilingual-e5-small` (transformer encoder, ~12 capas, 384 hidden) con cabeza de regresión escalar |
| Parametros totales | 117.654.145 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens (max_length fijado en entrenamiento e inferencia) |
| Tipos de cuantizacion | No documentado; al ser safetensors, compatible con cuantizacion estandar (GPTQ, AWQ, GGUF) si se convierte |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe simultáneamente la consulta y un pasaje candidato, y produce una puntuación escalar de relevancia. A diferencia de un bi-encoder, que codifica cada texto por separado y usa similitud coseno, el cross-encoder permite atención cruzada entre ambos, capturando relaciones semánticas que un bi-encoder pasa por alto. La arquitectura base es `multilingual-e5-small` (MIT), un transformer encoder de ~118M parámetros, al que se añade una cabeza de clasificación con una sola salida.

El entrenamiento se realizó sobre un corpus de texto estatutario central en inglés (bare-Act), con una estrategia listwise cross-entropy: para cada consulta, un positivo y seis negativos "form-matched" (es decir, pasajes que comparten formato con el positivo pero no son relevantes). Se usó una tasa de aprendizaje de 2e-5, 2 épocas, `max_length` 256, seed 0, en bf16 con CUDA. Un detalle relevante del proceso: el primer intento de entrenamiento colapsó a rendimiento aleatorio porque usó negativos minados (fragmentos con formato diferente), lo que llevó al modelo a aprender un atajo basado en la forma del texto. La corrección con negativos form-matched fue clave para obtener un modelo con capacidad discriminativa real.

## Capacidades

- Re-ranking de pasajes legales: puntúa pares (consulta, pasaje) y reordena un shortlist de un retriever de primera etapa.
- Integración con bi-encoders: diseñado para funcionar sobre los top-50 o top-100 de un retriever como `quanfire-ai/embed-statute-en` o cualquier bi-encoder compatible.
- API flexible: cargable tanto con `transformers` (`AutoModelForSequenceClassification`) como con `sentence_transformers.CrossEncoder`.
- Dominio específico: optimizado para texto estatutario central en inglés (secciones de leyes, actas), no para jurisprudencia ni legislación estatal.
- No es un retriever: no puede indexar ni recuperar sobre un corpus completo; requiere un candidato previo.
- Inferencia eficiente: con 118M parámetros y contexto de 256 tokens, es rápido incluso en CPU.

## Casos de uso

- Búsqueda legal asistida: un abogado introduce una consulta sobre un impuesto o procedimiento; el sistema recupera las secciones más probables de una ley y el reranker las ordena, mostrando primero la sección más relevante. El cross-encoder mejora la precisión frente a la búsqueda por similitud coseno.
- Asistente de revisión de normativa: en un despacho, se procesan miles de páginas de legislación; el modelo reordena los fragmentos candidatos para que el profesional revise primero los que tienen mayor probabilidad de ser aplicables.
- Pipeline de retrieval aumentado (RAG) para documentos legales: en un sistema de preguntas-respuestas sobre leyes, el reranker se usa como segunda etapa para filtrar los pasajes que alimentan al generador, reduciendo alucinaciones al seleccionar el contexto correcto.
- Cumplimiento normativo automatizado: una empresa necesita verificar si sus operaciones cumplen con ciertas secciones de una ley; el modelo prioriza las secciones relevantes para cada cláusula de la política interna.
- Investigación académica en derecho: investigadores que analizan corpus legislativos pueden usar el reranker para localizar rápidamente secciones específicas sobre temas como tributación, propiedad o contratos.
- Integración en motores de búsqueda jurídica comerciales: como componente de re-ranking en plataformas tipo Westlaw o LexisNexis, mejorando la relevancia de los resultados sin necesidad de reentrenar el retriever.

## Benchmarks y rendimiento

El autor evaluó el modelo de forma realista: un bi-encoder (`multilingual-e5-small`) recupera los top-100 para cada consulta, y el cross-encoder reordena esos 100. Sobre 1.200 consultas held-out y un pool de 1.182 pasajes estatutarios únicos, los resultados son:

| Etapa | Recall@1 | 95% CI |
|---|---|---|
| Bi-encoder (e5-small) solo | 0.2050 | [0.1817, 0.2292] |
| + Cross-encoder rerank | 0.3358 | [0.3100, 0.3625] |

- Delta: +0.1308 (+63.8%), con intervalo de confianza pareado [0.1058, 0.1567] que excluye el cero, indicando mejora estadísticamente significativa.
- Recall@100 techo (la sección correcta está en el shortlist del retriever): 0.7183, lo que marca el límite superior del reranker.
- De las consultas "recuperables" (donde el gold está en el top-100), el reranker lo coloca en el puesto #1 en el 46.8% de los casos.

No se han publicado resultados en benchmarks estándar como MMLU o HumanEval porque este modelo no es de propósito general; su evaluación se centra en la tarea de re-ranking legal.

## Requisitos de hardware

- VRAM estimada: en bf16, los pesos ocupan ~236 MB; con overhead de activaciones y tokenización, se estima ~1 GB de VRAM para inferencia. En fp32, ~472 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente. También funciona en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en prácticamente cualquier GPU moderna.
- Opciones de despliegue: `transformers` (Python), `sentence-transformers` (CrossEncoder API), y es compatible con Text Embeddings Inference (TEI) según los tags del repositorio (endpoints_compatible). También se puede servir con vLLM o TGI si se convierte el formato.
- Latencia estimada: no se proporcionan datos exactos, pero con 256 tokens de contexto y 118M parámetros, la inferencia en GPU es del orden de milisegundos por par; en CPU, decenas de milisegundos.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros rerankers en la información disponible. El propio autor compara el modelo con su bi-encoder base (`multilingual-e5-small`), que es el punto de partida. Como referencia cualitativa, se puede mencionar que existen alternativas genéricas como `BAAI/bge-reranker-base` (también cross-encoder, ~278M parámetros) o `cross-encoder/ms-marco-MiniLM-L-6-v2` (~22M parámetros), pero no hay datos de rendimiento sobre el dominio legal para estas. La ventaja de `rerank-statute-en` es su especialización en texto estatutario y su tamaño reducido, que permite despliegue en entornos con recursos limitados.

## Limitaciones y advertencias

- Dominio restringido: solo validado para re-ranking de texto estatutario central en inglés (bare-Act). No es adecuado para jurisprudencia, legislación estatal, reglamentos, notificaciones ni otros idiomas; el autor indica explícitamente que no está entrenado para esos casos.
- No es un retriever: usarlo directamente sobre un corpus completo es incorrecto y poco eficiente; requiere un candidato previo (típicamente de un bi-encoder).
- Rendimiento absoluto limitado: aunque la mejora relativa es significativa (+63.8%), el Recall@1 absoluto es 0.336 frente a un techo de 0.718, lo que indica que aún hay margen de mejora; el autor lo describe como "un primer reranker fuerte con margen real".
- Sensibilidad a la calidad de los negativos: el entrenamiento inicial falló por negativos mal formados; esto sugiere que el modelo puede ser sensible a la distribución de los candidatos en producción.
- Alucinación: al ser un modelo de puntuación (no generativo), no produce texto, por lo que el riesgo de alucinación no aplica directamente. Sin embargo, puede asignar puntuaciones altas a pasajes irrelevantes si el formato es similar al de los positivos.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse solo con texto legal en inglés, puede reflejar sesgos presentes en ese corpus (por ejemplo, predominio de jurisdicciones anglosajonas).
- Licencia: Apache-2.0 permite uso comercial sin restricciones, pero el corpus de entrenamiento no se redistribuye; el autor argumenta que el uso es legal bajo la ley de derechos de autor (sección 52(1)(q)(ii)), aunque esto puede variar según la jurisdicción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quanfire-ai/rerank-statute-en
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio de código: https://github.com/quanfire-ai/quanfire-multilingual-embedding
- Modelo compañero (bi-encoder): https://huggingface.co/quanfire-ai/embed-statute-en
