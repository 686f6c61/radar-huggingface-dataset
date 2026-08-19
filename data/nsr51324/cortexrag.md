# nsr51324/CortexRAG

## Resumen

CortexRAG es un sistema de generación aumentada por recuperación (RAG) especializado en responder preguntas médicas en inglés. Desarrollado por el usuario nsr51324, combina un pipeline de recuperación semántica con Sentence Transformers y FAISS, expansión de consultas médicas, reranking con Cross-Encoder, deduplicación de evidencia, una compuerta de confianza y generación de respuestas mediante un LLM alojado en Groq (openai/gpt-oss-20b). El sistema se apoya en una base de conocimiento curada de aproximadamente 16 384 pares de preguntas y respuestas médicas con categorías y documentación asociada.

Su relevancia radica en que aborda un problema crítico en RAG médico: la similitud semántica no siempre implica relevancia clínica. Por ello, incorpora una compuerta de confianza que rechaza responder cuando la evidencia recuperada no es suficiente o es inapropiada, evitando así alucinaciones peligrosas. El modelo está pensado para investigación y educación, no para uso diagnóstico, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline RAG hibrido: Sentence Transformer (all-MiniLM-L6-v2) + FAISS IndexFlatIP + Cross-Encoder (ms-marco-MiniLM-L6-v2) + LLM generador (gpt-oss-20b via Groq) |
| Parametros totales | No disponible (el sistema combina varios modelos; el embedding y el reranker tienen ~22M cada uno, el LLM generador tiene 20B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del LLM generador; gpt-oss-20b soporta 128k tokens, pero no se especifica en el sistema) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (para los modelos de embedding y reranker); el sistema completo es un pipeline, no un unico modelo |

## Arquitectura y entrenamiento

CortexRAG no es un modelo unico sino un sistema compuesto por varios componentes preentrenados. La recuperacion semantica usa `sentence-transformers/all-MiniLM-L6-v2` con embeddings normalizados para que FAISS `IndexFlatIP` funcione como similitud coseno. Antes de la busqueda, se aplica una expansion de consultas mediante un diccionario de terminos coloquiales a medicos (p. ej., "underactive thyroid" → "hypothyroidism"), sin reemplazar la consulta original. El reranking lo realiza `cross-encoder/ms-marco-MiniLM-L6-v2`, que puntua pares (consulta, respuesta) en lugar de (consulta, pregunta), ya que muchos registros comparten la misma pregunta con respuestas distintas. La deduplicacion de evidencia usa `difflib.SequenceMatcher` con umbral 0.92 para colapsar respuestas casi identicas.

La generacion de respuestas la realiza un LLM alojado en Groq (`openai/gpt-oss-20b`), instruido para responder solo con la evidencia recuperada, citar fuentes mediante `[doc_id]`, senalar discrepancias entre fuentes y evitar diagnosticos o prescripciones. No se menciona entrenamiento especifico del sistema; los componentes se usan tal cual, y la base de conocimiento es un dataset curado de ~16 384 registros. La compuerta de confianza se ajusto mediante validacion cruzada de 5 pliegues.

## Capacidades

- Respuesta a preguntas medicas en ingles con citas de evidencia (`[doc_id]`).
- Recuperacion semantica con expansion de consultas (terminos coloquiales a medicos).
- Reranking de evidencia con Cross-Encoder para priorizar respuestas utiles.
- Deduplicacion de evidencia casi duplicada.
- Compuerta de confianza que rechaza responder si la evidencia no supera los umbrales (p. ej., puntuacion de rerank minima, similitud minima, numero minimo de apoyos).
- Generacion de respuestas basadas exclusivamente en la evidencia recuperada, con descargo de responsabilidad medico.
- Capacidad de detectar evidencia inapropiada (p. ej., recuperar documentos sobre pie diabetico para una pregunta sobre fractura de pierna y rechazar la respuesta).

## Casos de uso

- Educacion sanitaria para pacientes: el sistema puede responder dudas comunes sobre sintomas, tratamientos y condiciones medicas con citas a fuentes, ayudando a los pacientes a comprender su situacion antes de consultar a un profesional.
- Apoyo a estudiantes de medicina: permite buscar rapidamente informacion sobre condiciones medicas especificas, con evidencia recuperada y citada, facilitando el estudio y la preparacion de examenes.
- Investigacion bibliografica preliminar: los investigadores pueden usar el sistema para explorar un tema medico concreto, obteniendo respuestas basadas en la base de conocimiento curada y con referencias a los documentos originales.
- Chatbots de salud con descargo de responsabilidad: integrable en aplicaciones de bienestar o portales de salud para responder preguntas frecuentes, siempre que se indique claramente que no sustituye el consejo medico profesional.
- Sistemas de triaje informativo: puede clasificar consultas medicas en categorias y proporcionar informacion general, ayudando a los usuarios a decidir si necesitan atencion medica urgente (sin reemplazar la evaluacion clinica).
- Evaluacion de pipelines RAG: el sistema incluye un flujo de trabajo para construir un conjunto de validacion semiautomatico (duplicados exactos + candidatos semanticos con similitud ≥0.90, revisados por humanos), util para investigar la calidad de recuperacion y reranking en dominios especializados.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de evaluacion:

| Metrica | Resultado |
|---|---|
| Tamano de la base de conocimiento | 16 384 registros |
| Self-Retrieval Top-1 | 100 % |
| Retrieval Recall@1 / @5 / @10 | 69,0 % / 89,9 % / 95,9 % |
| Retrieval MRR | 1,000 |
| Retrieval + Reranker Recall@1 / @5 / @10 | 8,3 % / 22,2 % / 38,8 % |
| Retrieval + Reranker MRR | 0,237 |
| Category Recall (retrieval / +reranker) | 97 % / 98 % |
| Confidence Gate Accuracy | 88 % (n=50) |
| Latencia end-to-end (ejemplo) | 0,99 seg |

El autor senala explicitamente que el reranker generalista puntua peor que la recuperacion simple en este benchmark de preguntas duplicadas, lo que indica que no esta alineado con los juicios de relevancia medica y requiere validacion contra un conjunto de referencia revisado por humanos antes de usarse en produccion.

## Requisitos de hardware

- Los modelos de embedding y reranker (MiniLM-L6-v2) tienen ~22M parametros cada uno, por lo que pueden ejecutarse en CPU o en cualquier GPU con al menos 2 GB de VRAM.
- El LLM generador (gpt-oss-20b) esta alojado en Groq, por lo que no requiere hardware local para esa parte; solo se necesita una conexion a internet y una clave API.
- El tamano del repositorio es de 0,2 GB, lo que permite cargarlo en memoria sin problemas.
- Opciones de despliegue: el sistema se distribuye como codigo Python (pip install sentence-transformers faiss-cpu numpy pandas openpyxl groq), por lo que puede ejecutarse en cualquier maquina con Python 3.8+.
- Para inferencia en produccion, se recomienda un servidor con al menos 4 GB de RAM y, si se desea acelerar la recuperacion, una GPU modesta (p. ej., RTX 3060 o superior). La latencia end-to-end medida es de ~1 segundo, dominada por la generacion del LLM en Groq.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CortexRAG (este) | Sistema RAG medico | No especificado | Apache 2.0 | HuggingFace |
| MedRAG (referencia general) | Sistema RAG medico | No disponible | No disponible | No disponible |
| BioRAG (referencia general) | Sistema RAG biomedico | No disponible | No disponible | No disponible |

Dado que no se han encontrado datos concretos de estos sistemas alternativos en la busqueda, la comparativa se limita a indicar que CortexRAG es un sistema RAG especifico para el dominio medico con una base de conocimiento curada y una compuerta de confianza, caracteristicas que lo diferencian de pipelines RAG genericos.

## Limitaciones y advertencias

- La base de conocimiento no cubre todas las condiciones o escenarios medicos; puede haber lagunas en areas especializadas.
- La similitud semantica no garantiza relevancia clinica: el propio autor documenta un caso donde se recuperaron documentos sobre pie diabetico para una pregunta sobre fractura de pierna, y solo la compuerta de confianza evito una respuesta incorrecta.
- El reranker (ms-marco-MiniLM-L6-v2) no esta ajustado al dominio medico y muestra un rendimiento inferior a la recuperacion simple en el benchmark de preguntas duplicadas; debe validarse contra un conjunto de referencia revisado por humanos antes de usarse en produccion.
- El conjunto de validacion manual es pequeno (n=50 para la compuerta de confianza), por lo que la evaluacion debe considerarse preliminar.
- El sistema no es una herramienta de diagnostico, no debe usarse para emergencias, prescripciones ni tratamiento personalizado. Incluye un descargo de responsabilidad medico en las respuestas.
- Solo soporta ingles; no hay soporte multilingue.
- La generacion depende de un servicio externo (Groq), lo que introduce dependencia de disponibilidad y costes de API.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nsr51324/CortexRAG
- Referencia de Sentence Transformers: https://www.sbert.net/
- Referencia de FAISS: https://github.com/facebookresearch/faiss
- Referencia de Cross-Encoder: https://www.sbert.net/examples/applications/cross-encoder/README.html
