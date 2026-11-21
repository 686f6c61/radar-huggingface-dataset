# Noor-Khan/chat-with-pdf-rag

## Resumen

`Noor-Khan/chat-with-pdf-rag` es un repositorio publicado en Hugging Face que no contiene un modelo entrenado, sino una canalización de generación aumentada por recuperación (RAG) para conversar con documentos PDF. El autor, Noorullah Zamindar, lo describe explícitamente como "una canalización de recuperación más una capa fina de LLM, no un modelo entrenado por él": no hay pesos propios ni datos de entrenamiento. El componente de embeddings es el modelo preentrenado `sentence-transformers/all-MiniLM-L6-v2`, de 384 dimensiones, y el resto es código de orquestación: extracción de texto con PyMuPDF, troceado con LangChain, almacenamiento vectorial en ChromaDB y una capa de generación que puede apuntar a Groq (en la nube) o a Ollama (local).

El objetivo del proyecto es responder preguntas sobre un PDF concreto con respuestas ancladas únicamente al contenido recuperado de ese documento, citando la página de origen. Para ello impone un prompt restrictivo que obliga al LLM a responder solo con el contexto recuperado o, en su defecto, a devolver la frase exacta "I could not find this information in the uploaded PDF.". La recuperación está acotada por `document_id`, de modo que los fragmentos de otros PDF subidos no pueden filtrarse en la respuesta.

Es relevante ahora porque ejemplifica el patrón habitual de RAG documental de bajo coste: un modelo de embeddings pequeño y ligero, una base vectorial embebida y un LLM externo de 8B parámetros, todo desplegable en local o con una API económica. La ficha evalúa el artefacto como lo que es, una referencia de implementación, y no como un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canalización RAG: embeddings `all-MiniLM-L6-v2` (transformer, 384 dim.) + recuperación en ChromaDB + LLM externo (Groq `llama-3.1-8b-instant` u Ollama `llama3.1`) |
| Parametros totales | No disponible (no es un modelo propio; el embedding tiene ~22,7 M de parámetros y el LLM por defecto 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como modelo; el troceado usa 900 caracteres con 180 de solape y recupera top-8 fragmentos |
| Tipos de cuantizacion | No disponible (depende del runtime del LLM: Groq en la nube u Ollama en local) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio contiene código y configuración, no pesos propios; el embedding se descarga desde Hugging Face) |

## Arquitectura y entrenamiento

No hay entrenamiento propio. El sistema se compone de una fase de indexación y otra de consulta. En la indexación, el PDF se valida (magic bytes reales, límite de tamaño de 25 MB, rechazo de PDF protegidos por contraseña y de PDF escaneados sin texto extraíble), se extrae el texto página a página con PyMuPDF, se limpia (ligaduras, guiones de corte, espacios) y se trocea con `RecursiveCharacterTextSplitter` de LangChain en fragmentos de 900 caracteres con 180 de solape. Cada fragmento se embebe con `all-MiniLM-L6-v2` y se almacena en ChromaDB junto con metadatos: identificador de documento, nombre de fichero, número de página e índice de fragmento.

En la consulta, la pregunta se embebe con el mismo modelo, se recuperan los 8 fragmentos más similares filtrados por el `document_id` activo y se envían al LLM junto con la pregunta a temperatura 0, con instrucciones de responder solo desde el contexto y citar la página de origen. El LLM por defecto es `llama-3.1-8b-instant` vía Groq o `llama3.1` vía Ollama; el proveedor de embeddings también puede cambiarse a `nomic-embed-text` en Ollama. La aplicación se sirve con Streamlit y la configuración se controla por variables de entorno (`CHUNK_SIZE`, `CHUNK_OVERLAP`, `TOP_K`, `MAX_PDF_MB`). No se documenta RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Extracción y limpieza de texto de PDF digitales página a página, con rechazo explícito de PDF escaneados que requieran OCR.
- Troceado con solape y generación de embeddings de 384 dimensiones mediante `all-MiniLM-L6-v2`.
- Almacenamiento vectorial persistente en ChromaDB con metadatos de documento, fichero, página e índice de fragmento.
- Recuperación semántica top-8 acotada por documento, sin fuga de fragmentos entre PDF distintos.
- Generación de respuestas ancladas al contexto recuperado con citas de página.
- Abstención controlada: si la respuesta no está en el contexto, devuelve la frase exacta "I could not find this information in the uploaded PDF.".
- Interfaz de chat en Streamlit con pastillas de página de origen y visor de fragmentos recuperados.
- Doble backend de generación: Groq en la nube o Ollama en local; el proveedor de embeddings también es configurable.
- Validación de entrada: rechazo de preguntas en blanco, de ficheros que no son PDF reales y de PDF sin texto extraíble.
- Suite de pruebas de 124 casos (`pytest`) que cubre validación, recuperación y fontanería de respuesta.

## Casos de uso

- Consulta de políticas internas: subir un manual de recursos humanos o un reglamento de compras y responder preguntas concretas citando la página exacta, gracias a la recuperación acotada por documento y al prompt de abstención.
- Atención al cliente sobre documentación contractual: cargar términos y condiciones o pólizas y resolver dudas de usuarios finales con respuestas trazables a la cláusula de origen, reduciendo el riesgo de respuestas inventadas.
- Revisión de literatura científica acotada: indexar un artículo o informe y extraer afirmaciones concretas con su página, útil para verificación manual posterior.
- Soporte a equipos legales y de compliance: localizar condiciones, plazos y excepciones en un contrato sin salir del documento y con cita de página para auditoría.
- Despliegue privado en local: con Ollama y `nomic-embed-text` el sistema funciona sin claves de API ni salida de datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Prototipado rápido de asistentes documentales: el código sirve como plantilla para añadir ingesta, indexación y consulta sobre un único PDF antes de escalar a corpus mayores.
- Evaluación de pipelines RAG: el `evaluate.py` y el conjunto `samples/sample_qa.jsonl` permiten medir hit rate, ranking top-1 y puntuaciones de similitud sobre un PDF de ejemplo reproducible.

## Benchmarks y rendimiento

Los datos publicados corresponden a la evaluación del pipeline, no a benchmarks de modelos fundacionales. Medición del 21 de noviembre de 2026 con `evaluate.py`, Python 3.12.3, PyMuPDF 2.1, sentence-transformers 6.3.0, ChromaDB 1.5.9 y torch 2.15.0, sobre un PDF ficticio de 3 páginas y 3.211 caracteres con 6 preguntas.

| Medida | Valor |
|---|---|
| Fragmentos generados (900/180) | 5 (2 en pág. 1, 2 en pág. 2, 1 en pág. 3); 446–866 caracteres, media 707,8 |
| Modelo de embeddings | `all-MiniLM-L6-v2`, 384 dimensiones |
| Carga del modelo de embeddings (en caché) | 32,3 s (51,7 s en la primera ejecución, incluida la descarga de ~90 MB) |
| Embedding y almacenamiento de 5 fragmentos | 3,9 s |
| Hit rate de recuperación, 5 preguntas respondibles (top-k = 8) | 5/5 = 1,000 |
| Fragmento top-1 procedente de una página esperada | 3/5 |
| Similitud top-1 en preguntas respondibles | 0,37–0,60 |
| Similitud top-1 en pregunta deliberadamente no respondible | 0,0835 |
| Tiempo de recuperación por pregunta | ~1,5 s |
| Suite de pruebas del repositorio | 124 pasadas, 0 fallidas, 0 omitidas (0,76 s) |
| Pregunta en blanco | Rechazada con `ValueError: question must not be blank.` |
| Fichero no PDF renombrado a `.pdf` | Rechazado con `ValueError: The file does not look like a PDF.` |
| PDF en blanco sin texto extraíble | Rechazado con `ValueError: No extractable text found. The PDF may be scanned and OCR is needed.` |
| Recuperación con otro `document_id` | 0 fragmentos, sin fuga entre documentos |
| Sin documentos cargados | Devuelve exactamente la frase de no encontrado |

El propio autor advierte de que el hit rate de 1,000 no demuestra capacidad discriminativa: con solo 5 fragmentos y top-k = 8, toda pregunta recupera todos los fragmentos. La señal útil es el top-1 (3/5). Los dos fallos de ranking son explicables: la pregunta sobre condiciones de devolución prioriza un fragmento de la página 2, que también trata el tema, y la pregunta sobre el responsable de devoluciones prioriza la página 1 porque repite el nombre de la empresa, quedando el fragmento correcto de la página 3 en segunda posición.

## Requisitos de hardware

- VRAM para embeddings: `all-MiniLM-L6-v2` ocupa aproximadamente 90 MB en disco y se ejecuta en CPU sin problema; en GPU el consumo es mínimo (menos de 1 GB).
- VRAM para generación: no aplica con Groq (inferencia en la nube). Con Ollama y `llama3.1` de 8B, se requiere una GPU con al menos 8 GB de VRAM en cuantización Q4, 16 GB en Q8 y alrededor de 24 GB en FP16; también puede ejecutarse en CPU con latencia mayor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para el LLM local en cuantización; para despliegues con concurrencia, A100 o H100 si se sirve el LLM con vLLM o TGI.
- Cabe en GPU consumer: sí, tanto el embedding como el LLM de 8B en cuantización de 4 u 8 bits.
- Opciones de despliegue: Streamlit para la interfaz; ChromaDB embebido; Ollama para LLM y embeddings locales; Groq como API gestionada; el LLM puede servirse alternativamente con vLLM o TGI si se sustituye la capa de Ollama.
- Latencia y throughput: recuperación de ~1,5 s por pregunta en la evaluación publicada; la latencia de generación depende del backend (Groq es sensiblemente más rápido que Ollama en local) y no se documenta throughput.

## Comparativa con modelos similares

| Sistema | Enfoque | Modelo de embeddings | LLM | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Noor-Khan/chat-with-pdf-rag` | RAG documental con Streamlit | `all-MiniLM-L6-v2` (384 dim.) | Groq `llama-3.1-8b-instant` u Ollama `llama3.1` | Por fragmento (900 caracteres, top-8) | No disponible | Hugging Face + GitHub |
| `langchain-ai/chat-langchain` | RAG sobre documentación con LangChain | Configurable | Configurable | Configurable | MIT (habitual en LangChain) | GitHub |
| `run-llama/llama_index` (ejemplos RAG) | Framework RAG con múltiples backends | Configurable | Configurable | Configurable | MIT | GitHub + PyPI |
| `chroma-core/chroma` (ejemplos) | Base vectorial con demos de RAG | Configurable | Configurable | No aplica | Apache 2.0 | GitHub + PyPI |

La comparación es aproximada: los tres alternativos son frameworks o ejemplos de referencia, no productos equivalentes, y sus parámetros concretos dependen de la configuración del usuario. No se dispone de benchmarks comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay pesos propios, datos de entrenamiento ni evaluación de capacidades lingüísticas del sistema como conjunto.
- Solo procesa PDF con texto extraíble; los PDF escaneados se rechazan explícitamente y requieren OCR previo.
- El hit rate de 1,000 en la evaluación no es representativo: el documento de prueba genera menos fragmentos que el top-k, por lo que la recuperación no es discriminativa. En corpus mayores el rendimiento de ranking no está medido.
- La calidad de las respuestas depende por completo del LLM externo y del prompt; el proyecto no incluye evaluación de fidelidad de las respuestas generadas.
- Riesgo de alucinación mitigado pero no eliminado: la instrucción de abstención y la temperatura 0 reducen el riesgo, pero no hay verificación automática de que la respuesta esté respaldada por el fragmento citado.
- Licencia no disponible: no se puede confirmar el uso comercial del código ni de los componentes; conviene verificar la licencia del repositorio de GitHub original y de `all-MiniLM-L6-v2` antes de producción.
- Idiomas no declarados: el prompt y la frase de abstención están en inglés; el comportamiento multilingüe no está evaluado.
- Dependencia de servicios externos: con Groq se requiere clave de API y conectividad; sin proveedor configurado la indexación funciona pero la generación falla con un error explícito.
- Sin cifras de throughput ni de concurrencia: no hay datos para dimensionar un despliegue multiusuario.
- Fecha de creación del repositorio (2026-11-21) y resultados de evaluación en la misma fecha; el proyecto parece reciente y con escasa tracción (0 descargas, 0 likes), por lo que la madurez y el mantenimiento no están contrastados.

## Enlaces

- Hugging Face: https://huggingface.co/Noor-Khan/chat-with-pdf-rag
- Repositorio original en GitHub: https://github.com/NoorullahZamindar-007/chat-with-pdf-rag
- Modelo de embeddings: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- ChromaDB: https://github.com/chroma-core/chroma
- LangChain: https://github.com/langchain-ai/langchain
- Groq: https://groq.com
- Ollama: https://ollama.com
- PyMuPDF: https://pymupdf.readthedocs.io
- Streamlit: https://streamlit.io
