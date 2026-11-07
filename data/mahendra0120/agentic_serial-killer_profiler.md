# mahendra0120/Agentic_Serial-killer_Profiler

## Resumen

ASP (Agentic Serial-crime Profiler) es un sistema agéntico publicado en Hugging Face bajo el identificador `mahendra0120/Agentic_Serial-killer_Profiler`. No se trata de un modelo base entrenado desde cero, sino de un pipeline de dos agentes construidos sobre Qwen3-VL que se comunican mediante el protocolo A2A (Agent-to-Agent). El primer agente, denominado Forensic, analiza imágenes de un caso y genera un informe forense; el segundo, el Profiler, recibe ese informe y produce un perfil conductual apoyándose en un servidor MCP de visualización de imágenes y en una búsqueda RAG sobre una base de conocimiento forense local.

El repositorio ocupa 19,2 GB y contiene pesos en formato safetensors, lo que sugiere que incluye los pesos de los modelos Qwen3-VL utilizados por los agentes, aunque la model card no detalla qué variantes concretas se emplean ni sus parámetros. La aplicación se distribuye como un proyecto Python con interfaz Gradio, orquestación de servidores A2A, persistencia en PostgreSQL y scripts de despliegue pensados para RunPod con volumen de red montado en `/workspace`.

La relevancia del proyecto es principalmente demostrativa: ilustra un patrón de orquestación multiagente con modelos visión-lenguaje, tool calling vía MCP, checkpointing en base de datos y recuperación aumentada, más que un modelo con benchmarks publicados. La información disponible no permite evaluar su calidad predictiva ni su rendimiento comparado con alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos agentes (Forensic y Profiler) sobre Qwen3-VL, comunicados por A2A; servidor MCP de visión y RAG local |
| Parametros totales | no disponible (depende de las variantes de Qwen3-VL empleadas, no especificadas) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema no entrena un modelo propio: compone dos agentes sobre Qwen3-VL. El agente Forensic procesa las imágenes del caso y emite un informe forense; el agente Profiler consume ese informe y genera un perfil conductual, consultando opcionalmente 23 páginas de referencia avanzadas a través de un servidor MCP de tipo stdio (`image_viewer_mcp.py`) que expone las herramientas `list_sections`, `view_section` y `view_image`. La comunicación entre agentes se realiza mediante A2A, con un cliente de streaming mínimo (`a2a_client.py`) y dos servidores independientes en los puertos 8011 (Profiler) y 8002 (Forensic).

El pipeline incorpora una búsqueda RAG sobre el directorio `forensic_knowledge/` (`octen_rag.py`), que combina recuperación por embeddings con selección de tipo de trauma. El estado se persiste en PostgreSQL mediante `CaseStore` y `CheckpointDB`, lo que permite reanudar ejecuciones interrumpidas y reutilizar resultados parciales: al relanzar un caso con otra versión de referencia solo se vuelve a ejecutar el Profiler, reutilizando el informe forense, la consulta RAG y los resúmenes de referencia. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, ya que el autor no entrena los modelos subyacentes.

## Capacidades

- Análisis de imágenes de casos mediante un modelo visión-lenguaje (Qwen3-VL) para producir un informe forense estructurado.
- Generación de perfiles conductuales a partir del informe forense previo.
- Orquestación multiagente con protocolo A2A entre dos servidores independientes.
- Tool calling a través de un servidor MCP que permite al agente Profiler listar secciones, ver secciones y visualizar imágenes de referencia bajo demanda.
- Recuperación aumentada (RAG) sobre una base de conocimiento forense local con selección de tipo de trauma.
- Tres modos de uso de material de referencia: Auto (el modelo decide si consultar las páginas avanzadas), Basic (solo 5 páginas básicas, sin herramientas MCP) y Advanced (instrucción de consultar las secciones avanzadas antes de redactar).
- Persistencia y reanudación de casos mediante checkpointing en PostgreSQL, con copias de seguridad automáticas cada 5 minutos.
- Interfaz Gradio con galería de miniaturas de imágenes subidas previamente y control de arranque, parada y reinicio de servidores.
- Capacidades multilingües: no disponibles explícitamente; dependen de las variantes de Qwen3-VL, no documentadas en la model card.

## Casos de uso

- Docencia y demostración de sistemas multiagente: el proyecto sirve como referencia ejecutable de orquestación A2A con dos agentes especializados y comunicación por streaming, útil en cursos o talleres sobre agentes.
- Prototipado de pipelines visión-lenguaje con MCP: el servidor `image_viewer_mcp.py` ejemplifica cómo exponer un corpus de imágenes de referencia a un agente mediante herramientas de listado y visualización por secciones.
- Investigación sobre RAG aplicado a dominios especializados: `octen_rag.py` muestra una recuperación por embeddings con selección de categoría (tipo de trauma) sobre un directorio de conocimiento local, reutilizable como plantilla en otros dominios.
- Evaluación de estrategias de uso de contexto: el selector Basic/Advanced/Auto permite comparar el comportamiento de un agente cuando se le fuerzan, se le retiran o se le dejan a su criterio las herramientas de consulta de material de referencia.
- Sistemas con tolerancia a interrupciones: el checkpointing en PostgreSQL y la reutilización de resultados parciales sirven de patrón para pipelines largos que deben reanudarse tras fallos o reinicios de pod.
- Despliegue reproducible en infraestructura cloud con GPU: los scripts idempotentes (`start.sh`, `setup_env.sh`, `setup_postgres.sh`, `backup_postgres.sh`) y el uso de un volumen de red en `/workspace` ofrecen un ejemplo de empaquetado para RunPod.
- Gestión de credenciales en entornos con modelos restringidos: el patrón de `HF_TOKEN` en `.env` con `HF_HUB_OFFLINE` tras la primera descarga ilustra un flujo de trabajo offline-first.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU con driver NVIDIA en un pod de RunPod; la model card no especifica modelo de GPU ni VRAM mínima.
- El repositorio ocupa 19,2 GB, por lo que se necesita espacio persistente suficiente en el volumen de red montado en `/workspace` para pesos, caché de uv y copias de PostgreSQL.
- Puerto HTTP 7860 expuesto para acceder a la interfaz Gradio a través del proxy de RunPod; puertos 8011 (Profiler) y 8002 (Forensic) para los servidores A2A.
- Imagen Ubuntu con driver NVIDIA; ejecución como root sin `sudo` soportada por los scripts.
- Variables de entorno gestionadas por `setup_env.sh`: `HF_HOME=/workspace/hf_cache`, `HF_HUB_OFFLINE=1` una vez cacheados los modelos, `PROFILER_AGENT_PORT=8011`, `FORENSIC_AGENT_PORT=8002`.
- Opciones de despliegue documentadas: ejecución nativa con `uv sync --frozen`, Gradio como interfaz y PostgreSQL local; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (pipelines agénticos de dos agentes sobre Qwen3-VL con MCP y A2A) ni datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- La model card no declara licencia, idiomas soportados ni pipeline; el uso comercial queda sin marco legal explícito y requiere contactar con el autor.
- No se especifican las variantes de Qwen3-VL utilizadas ni sus parámetros, contexto o cuantización, lo que impide estimar requisitos de VRAM y latencia con precisión.
- El dominio de aplicación (perfilado de crímenes seriales) es sensible: cualquier uso en contextos reales de investigación o judicial requiere validación pericial humana y no debe tratarse como evidencia.
- Riesgo de alucinación inherente a los modelos visión-lenguaje, agravado por la generación de perfiles conductuales a partir de imágenes; no se documentan evaluaciones de fiabilidad.
- El modo Advanced es una instrucción al modelo, no una restricción de código: si el agente omite consultar las secciones avanzadas, solo queda un aviso en `profiler_server.log`.
- El diseño asume RunPod con volumen de red en `/workspace`; otros entornos requieren adaptar los scripts.
- El sistema depende de PostgreSQL local y de un bucle de copias de seguridad cada 5 minutos; un fallo del pod sin backup manual previo puede perder hasta ese intervalo de datos.
- No hay descargas ni likes en Hugging Face en el momento de la consulta, ni benchmarks publicados, por lo que la madurez y validación del proyecto son limitadas.
- La fecha de creación del repositorio (2026-11-04) y la de actualización (2026-11-07) figuran en el futuro respecto a la información de referencia; conviene verificar su vigencia.

## Enlaces

- Hugging Face: https://huggingface.co/mahendra0120/Agentic_Serial-killer_Profiler
- Perfil del autor en Hugging Face: https://huggingface.co/mahendra0120
- Repositorio del proyecto (referenciado en la model card): https://github.com/mahendra0120/AgenticSP.git
- Guía sobre sistemas agénticos de Databricks (referencia general): https://www.databricks.com/blog/agentic-systems-guide
