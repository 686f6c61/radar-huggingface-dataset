# Deepak1206/kec-rag-assistant

## Resumen

El repositorio `Deepak1206/kec-rag-assistant` no contiene un modelo de lenguaje entrenado, sino una aplicación completa de Retrieval-Augmented Generation (RAG) diseñada para responder preguntas sobre el Kongu Engineering College (KEC). El sistema combina un modelo de embeddings `all-MiniLM-L6-v2` para la búsqueda semántica sobre una base de conocimiento local, un índice vectorial FAISS para la recuperación de fragmentos relevantes y el modelo de generación `google/gemma-2-2b-it` para producir respuestas contextualizadas. La interfaz se implementa con Gradio.

No se proporcionan datos técnicos del modelo generador (arquitectura, parámetros, licencia) en la model card; solo se indica que se usa Gemma 2 2B IT, un modelo de 2 mil millones de parámetros con ventana de contexto de 8.192 tokens. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que no se han subido pesos del modelo, solo el código de la aplicación. La relevancia actual radica en su enfoque didáctico: muestra un patrón típico de RAG aplicado a un dominio específico (información universitaria), aunque no ofrece innovaciones técnicas nuevas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio es una aplicación RAG, no un modelo de pesos) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo generador, Gemma 2 2B IT soporta 8.192 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card está en inglés, no se indica idioma de los datos) |
| Licencia | No disponible |
| Formato de pesos | No disponible (no se publican pesos; el código usa librerías de HuggingFace) |

## Arquitectura y entrenamiento

El repositorio no describe un modelo propio entrenado. Se trata de un sistema RAG compuesto por tres componentes:

1. Un modelo de embeddings `all-MiniLM-L6-v2` (de Sentence Transformers) para convertir consultas y documentos en vectores de 384 dimensiones.
2. Un índice FAISS para búsqueda de similitud vectorial y recuperación de los `top-k` fragmentos más relevantes de la base de conocimiento de KEC.
3. El modelo de lenguaje `google/gemma-2-2b-it` (instrucción) para generar la respuesta final a partir de un prompt que incorpora el contexto recuperado.

No se proporcionan detalles sobre el entrenamiento de estos componentes ni sobre la construcción de la base de conocimiento. El flujo de datos es el típico de RAG: consulta del usuario → embedding → búsqueda FAISS → construcción de contexto → generación con Gemma 2 2B IT → respuesta mostrada en Gradio.

## Capacidades

- Respuesta a preguntas sobre información específica de una universidad (cursos, admisiones, colocaciones, hostales, campus) mediante recuperación semántica.
- Generación de respuestas contextualizadas y fundamentadas en los fragmentos recuperados, reduciendo la alucinación.
- Interfaz conversacional multi-turno a través de Gradio.
- Búsqueda semántica sobre documentos con `all-MiniLM-L6-v2` y FAISS.
- Soporte de contexto dinámico: el prompt se construye con los fragmentos recuperados, pero no hay indicación de gestión de historial de conversación.

## Casos de uso

- Asistente virtual para estudiantes y futuros estudiantes del KEC: permite consultar información sobre planes de estudio, requisitos de admisión, fechas de inscripción y procedimientos de solicitud.
- Soporte para la oficina de colocaciones: responde sobre empresas visitantes, salarios medios, procesos de entrevistas y estadísticas de colocación.
- Información de alojamiento: detalla opciones de hostales, tarifas, instalaciones y normas de residencia.
- Preguntas frecuentes sobre el campus: localización de departamentos, laboratorios, bibliotecas y servicios de transporte.
- Asistente para el personal administrativo: consulta rápida de normativas internas, calendario académico y contactos de departamentos.
- Demostración educativa de arquitectura RAG: el proyecto sirve como ejemplo de implementación con FAISS, embeddings y un LLM de código abierto, útil para estudiantes de ingeniería del software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de evaluación comparativa sobre MMLU, HumanEval, GSM8K o métricas específicas de RAG (fidelidad, relevancia). El repositorio no incluye conjuntos de validación ni métricas de rendimiento.

## Requisitos de hardware

- El modelo generador Gemma 2 2B IT tiene 2 mil millones de parámetros. En cuantización de 4 bits (por ejemplo, con `bitsandbytes`), puede ejecutarse en una GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050 o RTX 3060). En precisión completa (FP16), requiere alrededor de 4-5 GB de VRAM adicionales para los pesos.
- El modelo de embeddings `all-MiniLM-L6-v2` es ligero (unos 90 MB) y puede ejecutarse en CPU sin problemas.
- FAISS funciona eficientemente en CPU para bases de conocimiento de tamaño moderado (miles de documentos).
- Para despliegue en producción se podría usar vLLM o TGI para el LLM, pero el repositorio no indica ninguna configuración específica. La interfaz Gradio puede ejecutarse en una máquina con 8 GB de RAM y una GPU de gama media.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. El repositorio no presenta comparaciones con otros sistemas RAG ni con modelos de lenguaje. Dado que es una aplicación específica para una universidad, no hay alternativas públicas directas. Se podría comparar con otros asistentes RAG genéricos (por ejemplo, los construidos con LlamaIndex o LangChain), pero no hay datos cuantitativos en la fuente.

## Limitaciones y advertencias

- No se publica el modelo de lenguaje ni sus pesos; solo el código de la aplicación. Por tanto, el rendimiento depende del modelo Gemma 2 2B IT y de la calidad de la base de conocimiento de KEC, que no está incluida en el repositorio.
- La licencia es desconocida; no se indica si el código es de uso libre o restringido. No se puede asumir permisos de uso comercial.
- El repositorio no incluye datos de entrenamiento ni validación, por lo que no se puede evaluar la precisión de las respuestas.
- El sistema puede generar respuestas incorrectas si los fragmentos recuperados son irrelevantes o si la base de conocimiento está incompleta.
- No se especifica el idioma de la base de conocimiento; la model card está en inglés, pero el sistema podría funcionar solo con documentos en inglés.
- No hay control de versiones ni mantenimiento aparente (última actualización en 2026-08-25, con 0 descargas y 0 likes).
- No se implementa gestión de sesiones ni memoria persistente; cada pregunta se procesa de forma independiente, lo que puede dar respuestas incoherentes en conversaciones largas.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/Deepak1206/kec-rag-assistant)
- No se han encontrado otros enlaces oficiales (papers, blogs o repositorios asociados) en la búsqueda web. El repositorio no tiene una página de GitHub vinculada.
