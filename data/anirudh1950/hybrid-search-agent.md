# Anirudh1950/Hybrid-Search-Agent

## Resumen

`Anirudh1950/Hybrid-Search-Agent` no es un modelo de lenguaje entrenado, sino un repositorio publicado en Hugging Face que empaqueta una aplicación de demostración de recuperación aumentada por generación (RAG). El autor, Anirudh1950, lo etiqueta como `sentence-transformers` y `question-answering`, pero el contenido real es un agente conversacional ligero que combina recuperación por similitud coseno sobre fragmentos de un PDF con memoria simulada de interacciones previas y generación de lenguaje delegada en la API de OpenAI (GPT-3.5-turbo).

El componente de embeddings es el modelo preentrenado `all-MiniLM-L6-v2` de Sentence Transformers, que el script carga por defecto y que constituye el único artefacto de pesos implicado. No se publican pesos propios en el repositorio: el tamaño reportado es de 0.0 GB, lo que confirma que no contiene ficheros de modelo, sino únicamente código de aplicación (un `app.py` con interfaz Gradio, scripts auxiliares y un `requirements.txt`).

Su relevancia es, por tanto, la de un ejemplo didáctico de arquitectura RAG híbrida (búsqueda léxica BM25 y recuperación semántica por embeddings) con memoria de conversación, útil para desarrolladores que quieran replicar un patrón de asistente contextual sobre documentos, pero no la de un modelo evaluable en términos de benchmarks, licencia o rendimiento de inferencia propia. La fecha de creación indicada (2026-11-14) y el contador de descargas (0) sugieren un repositorio recién publicado y sin validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo propio; pipeline RAG con embeddings de Sentence Transformers (`all-MiniLM-L6-v2`) y generación vía API de OpenAI (GPT-3.5-turbo) |
| Parametros totales | No disponible (el repositorio no contiene pesos; `all-MiniLM-L6-v2` tiene ~22,7 M de parámetros, dato externo al repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como modelo; la ventana efectiva la determina GPT-3.5-turbo y el tamaño de los fragmentos recuperados (top-k configurable, por defecto 5) |
| Tipos de cuantizacion | No disponible (no se publican pesos) |
| Idiomas soportados | No disponible (el modelo de embeddings subyacente es mayoritariamente inglés; la generación depende de GPT-3.5-turbo) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio de código; tamaño 0.0 GB) |

## Arquitectura y entrenamiento

El repositorio implementa un patrón RAG clásico en tres etapas. Primero, extrae el texto de un PDF (`movie_script.pdf` por defecto) y lo divide en fragmentos, que embebe con `all-MiniLM-L6-v2`. Segundo, ante cada consulta, calcula la similitud coseno entre el embedding de la pregunta y los de los fragmentos, recupera los top-k más relevantes (5 por defecto) y los fusiona con el historial de conversación cargado desde `memory.json`. Tercero, construye un prompt que combina consulta, contexto documental y memoria, y lo envía a GPT-3.5-turbo para la generación; si la API falla o no hay clave, aplica una respuesta heurística basada en reglas como respaldo.

No hay entrenamiento propio, ajuste fino ni datos de entrenamiento publicados. Las innovaciones técnicas del proyecto son de ingeniería de aplicación: caché de embeddings en `.cache/` indexada por ruta y fecha de modificación del PDF (con invalidación automática al reemplazar el fichero), opciones de línea de comandos (`--pdf`, `--memory`, `--top-k`, `--model`, `--no-openai`, `--once`) y una interfaz Gradio. La etiqueta `bm25` en los metadatos sugiere búsqueda léxica híbrida, aunque la model card solo describe explícitamente la recuperación por similitud coseno.

## Capacidades

- Respuesta a preguntas sobre el contenido de un documento PDF o de texto aportado por el usuario.
- Recuperación semántica de fragmentos mediante embeddings y similitud coseno (top-k configurable).
- Memoria de conversación simulada a partir de un fichero JSON con pares pregunta-respuesta.
- Fusión de contexto documental, historial y consulta actual en un único prompt para el LLM.
- Generación de respuestas en lenguaje natural delegada en GPT-3.5-turbo vía API de OpenAI.
- Modo de respaldo sin API (`--no-openai`) con respuestas heurísticas basadas en reglas.
- Interfaz web Gradio y modo de una sola pregunta (`--once`) para pruebas automatizadas.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente de consulta sobre documentación interna: el pipeline indexa un PDF corporativo y responde preguntas concretas recuperando los fragmentos relevantes, lo que resulta adecuado para prototipos de atención interna sobre manuales o políticas.
- Demo educativa de RAG híbrido: sirve para ilustrar en cursos o talleres cómo combinar embeddings, similitud coseno y memoria de conversación con un LLM externo sin entrenar nada.
- Chatbot sobre guiones o transcripciones: el caso por defecto (`movie_script.pdf`) permite construir un asistente que responde sobre personajes y tramas citando fragmentos del guion.
- Base para asistentes personales con memoria ligera: el fichero `memory.json` permite simular continuidad conversacional en prototipos de bajo coste antes de migrar a una solución con base de datos vectorial.
- Prototipado rápido de búsqueda semántica sobre notas propias: con `--pdf my_notes.pdf` se obtiene un buscador conversacional sobre apuntes sin escribir código adicional.
- Evaluación comparativa de modelos de embeddings: el parámetro `--model` permite sustituir `all-MiniLM-L6-v2` por otro SentenceTransformer y medir el impacto en la calidad de recuperación.
- Referencia de integración con Gradio: el `app.py` sirve como plantilla para desplegar una interfaz de chat sobre un pipeline RAG en entornos de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio no incluye pesos de un LLM; la generación ocurre en los servidores de OpenAI, por lo que no requiere VRAM para el modelo generativo.
- El único componente local es `all-MiniLM-L6-v2` (~22,7 M de parámetros), que se ejecuta en CPU sin problema y ocupa del orden de decenas de megabytes en memoria en precisión FP32.
- Cabe en cualquier GPU de consumo (por ejemplo, GTX 1650, RTX 3060 o superiores) e incluso en entornos sin GPU; el README menciona que puede instalarse una build de PyTorch con CUDA si se desea aceleración.
- Despliegue local mediante `python app.py` con Gradio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no hay pesos que servir.
- Latencia y throughput: no disponibles; el tiempo de respuesta vendrá dominado por la llamada a la API de OpenAI y por la extracción de texto del PDF, no por cómputo local significativo.

## Comparativa con modelos similares

| Proyecto | Tipo | Pesos publicados | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anirudh1950/Hybrid-Search-Agent | Aplicación RAG (código) | No (0.0 GB) | No disponible | No disponible | Hugging Face y GitHub |
| LangChain + `all-MiniLM-L6-v2` | Framework RAG genérico | No (depende del modelo de embeddings) | Configurable | MIT (LangChain) | PyPI |
| LlamaIndex con `all-MiniLM-L6-v2` | Framework RAG genérico | No (depende del modelo de embeddings) | Configurable | MIT (LlamaIndex) | PyPI |
| `sentence-transformers/all-MiniLM-L6-v2` | Modelo de embeddings | Sí | 256 tokens (dato externo) | Apache 2.0 (dato externo) | Hugging Face |

La comparación es aproximada: los tres primeros son proyectos de orquestación RAG, no modelos, y los datos de licencia y contexto de los frameworks y del modelo de embeddings no provienen de la información proporcionada en este repositorio.

## Limitaciones y advertencias

- No es un modelo entrenado ni publica pesos: no puede evaluarse con benchmarks estándar ni desplegarse como servicio de inferencia autónomo.
- La calidad de las respuestas depende por completo de la API de OpenAI (GPT-3.5-turbo); sin clave, el modo de respaldo heurístico ofrece respuestas genéricas y de baja calidad.
- La licencia no está especificada, lo que impide determinar si el uso comercial del código es admisible; debe contactarse con el autor antes de cualquier uso en producción.
- No se declaran idiomas soportados; el modelo de embeddings subyacente está orientado al inglés y la generación depende del LLM externo.
- Riesgo de alucinación: el LLM puede generar contenido no presente en el PDF, ya que no se documenta ningún mecanismo de verificación o citación de fuentes.
- La memoria es un fichero JSON plano sin gestión de concurrencia ni persistencia robusta; no es apta para múltiples usuarios simultáneos.
- La recuperación se limita a similitud coseno sobre fragmentos de un único documento; no hay indexación incremental ni soporte de corpus grandes.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; el código debe auditarse antes de reutilizarlo.
- La fecha de creación indicada (2026-11-14) es posterior a la actual, lo que sugiere posibles inconsistencias en los metadatos del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anirudh1950/Hybrid-Search-Agent
- Project page (Space de Gradio): https://huggingface.co/spaces/Anirudh1950/Hybrid-Search-Agent
- Código fuente en GitHub: https://github.com/rudzz1950/Hybrid-Search-Agent
- Modelo de embeddings por defecto (externo): https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentación de Sentence Transformers (externo): https://www.sbert.net/
