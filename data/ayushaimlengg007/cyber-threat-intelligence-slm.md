# AyushAIMLEngg007/cyber-threat-intelligence-slm

## Resumen

Cyber Threat Intelligence SLM es un modelo de lenguaje pequeno (SLM) orientado a generacion de texto en el dominio de la ciberseguridad, publicado en Hugging Face por el usuario AyushAIMLEngg007. Forma parte de un proyecto academico mas amplio titulado "Threat Intelligence AI Platform", desarrollado para la asignatura de bases de datos NoSQL con MongoDB en la JAIN (Deemed-to-be University) de Bengaluru. El modelo se presenta como el componente generativo de un sistema RAG que recupera registros CVE y ofrece recomendaciones de mitigacion.

El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos no estan alojados o que el contenido publicado se limita a la model card y material auxiliar. No se especifican en la informacion disponible la arquitectura, el numero de parametros, la longitud de contexto ni los datos de entrenamiento. La model card describe principalmente el sistema que lo rodea (backend FastAPI, frontend Streamlit, MongoDB 7.0 con busqueda vectorial y un bot escaner autonomo) mas que las caracteristicas intrinsecas del modelo.

Su relevancia actual es limitada pero ilustrativa: ejemplifica el patron de construir asistentes de ciberseguridad con recuperacion aumentada sobre una base de datos vectorial para reducir alucinaciones en la respuesta sobre vulnerabilidades. La licencia MIT facilita su reutilizacion, aunque la ausencia de pesos, benchmarks y documentacion tecnica del modelo obliga a tratar cualquier uso en produccion con extrema cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0.0 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM u otra), el numero de parametros, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card no incluye ninguna seccion dedicada al entrenamiento del SLM.

La documentacion disponible describe la arquitectura del sistema que lo envuelve: un pipeline RAG con embeddings densos de 384 dimensiones almacenados en MongoDB, busqueda hibrida mediante Reciprocal Rank Fusion (RRF) para recuperar registros CVE, un bot escaner en segundo plano que audita puertos a la escucha y configuraciones del sistema operativo, y transacciones ACID multi-documento para aplicar mitigaciones de forma atomica. Tambien se menciona un entorno Docker Compose que orquesta MongoDB 7.0, un backend FastAPI y un frontend Streamlit. Ninguno de estos elementos describe la innovacion tecnica del modelo en si.

## Capacidades

- Generacion de texto en ingles orientada a consultas sobre amenazas y vulnerabilidades.
- Respuesta aumentada por recuperacion (RAG) sobre registros CVE almacenados en MongoDB con busqueda vectorial de 384 dimensiones y fusion RRF.
- Soporte de conversaciones multi-turno para autorizacion de mitigaciones mediante confirmacion en lenguaje natural.
- Cobertura tematica de vulnerabilidades en Linux, Windows, macOS, Android e iOS, clasificadas en ciclos de vida "Anticipated", "Active", "Evolving" y "Resolved".
- Integracion con un bot escaner autonomo que detecta puertos abiertos (por ejemplo SMB 445 o HTTP 80 en claro) y fallos de configuracion.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el sistema orquesta acciones pero no se documenta capacidad agentica del modelo.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Asistente de triaje de CVE: el modelo responde a preguntas sobre vulnerabilidades activas recuperando registros desde MongoDB mediante busqueda vectorial, lo que reduce el riesgo de alucinacion al fundamentar la respuesta en documentos indexados.
- Autorizacion conversacional de mitigaciones: un operador confirma en lenguaje natural la aplicacion de un parche y el sistema ejecuta la transicion de estado de forma atomica mediante transacciones ACID multi-documento.
- Auditoria de configuracion de hosts: integrado con el bot escaner, el modelo explica en lenguaje natural los hallazgos sobre puertos expuestos y sugiere remediaciones priorizadas.
- Generacion de informes de postura de seguridad: a partir de los datos agregados en MongoDB, el modelo redacta resumenes de amenazas activas, anticipadas y resueltas para equipos de operaciones.
- Soporte a analistas SOC de nivel junior: como capa de consulta sobre una base de conocimiento CVE, permite resolver dudas rutinarias sin salir del panel Streamlit.
- Prototipo docente de sistemas RAG: sirve como ejemplo funcional de integracion entre un SLM, una base de datos NoSQL con busqueda vectorial y una API REST para asignaturas de bases de datos o inteligencia artificial.
- Base para un chatbot de concienciacion en ciberseguridad: desplegado tras una interfaz web, puede responder consultas de empleados sobre amenazas vigentes apoyandose en el corpus indexado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el numero de parametros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano del modelo.
- Opciones de despliegue del modelo: no documentadas; el sistema descrito usa FastAPI y Streamlit, pero no se especifica el runtime de inferencia (vLLM, llama.cpp, Ollama, TGI u otro).
- Latencia y throughput: no disponible.
- Requisitos del sistema completo: MongoDB 7.0, backend FastAPI con Uvicorn, frontend Streamlit y Docker Compose; las dependencias Python listadas son `fastapi`, `uvicorn`, `streamlit`, `pymongo`, `mongomock`, `pydantic`, `requests` y `psutil`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto ni rendimiento que permitan una comparacion fundamentada con otros SLM de ciberseguridad o de proposito general.

## Limitaciones y advertencias

- El repositorio ocupa 0.0 GB y no se confirma la presencia de pesos; es posible que el modelo no sea descargable o que solo se publique documentacion.
- Ausencia total de especificaciones tecnicas: sin parametros, contexto ni arquitectura no es posible evaluar su calidad ni planificar su despliegue.
- Sin benchmarks publicados, no hay evidencia cuantitativa de su rendimiento en tareas de ciberseguridad ni en tareas generales.
- Riesgo de alucinacion no cuantificado: aunque el sistema RAG mitiga parcialmente el problema, el modelo podria generar recomendaciones de mitigacion incorrectas o peligrosas si la recuperacion falla.
- Idioma limitado al ingles, lo que restringe su uso en entornos hispanohablantes sin traduccion o ajuste adicional.
- Proyecto de caracter academico (4.o semestre, asignatura de MongoDB): no hay indicios de validacion en produccion, mantenimiento continuo ni soporte.
- La licencia MIT permite uso comercial, pero la falta de documentacion sobre procedencia de datos de entrenamiento impide descartar riesgos de sesgo o de contaminacion del corpus.
- Cero descargas y cero likes en el momento de la consulta: no existe comunidad ni validacion externa.
- No debe confiarse en el modelo para decisiones automatizadas de mitigacion sin supervision humana, dado que el propio sistema exige confirmacion conversacional como salvaguarda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AyushAIMLEngg007/cyber-threat-intelligence-slm
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
