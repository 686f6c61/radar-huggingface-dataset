# PengxiaoYu-ai/travel-agent-source

## Resumen

Travel Agent es un proyecto de agente conversacional especializado en tareas de viaje, desarrollado por PengxiaoYu-ai y publicado en Hugging Face como un espacio Docker. No se trata de un modelo de lenguaje preentrenado, sino de una aplicación completa que combina un frontend Gradio, un backend FastAPI y un orquestador basado en LangGraph para gestionar conversaciones multi-turno con herramientas externas. El agente permite planificar rutas, consultar el tiempo, buscar billetes de tren, realizar búsquedas web, leer archivos, ejecutar comandos Shell en un sandbox y delegar tareas complejas a subagentes.

El proyecto resuelve el problema de integrar múltiples servicios de viaje y utilidades en una única interfaz conversacional, manteniendo un estado de sesión persistente y una memoria a largo plazo por usuario. Su relevancia radica en que demuestra un patrón de implementación industrial de agentes con LangGraph, MCP (Model Context Protocol), colas de mensajería y almacenamiento en bases de datos relacionales y NoSQL. Está pensado para desarrolladores que quieran construir asistentes de viaje o sistemas multiagente con capacidades de tool calling y ejecución segura de código.

Al ser un proyecto de software, no se dispone de datos sobre arquitectura de red neuronal, parámetros, contexto o licencia del modelo subyacente. El agente utiliza un LLM externo (por defecto DeepSeek, configurable mediante API key) y se apoya en herramientas MCP para acceder a servicios como AMAP (mapas), 12306 (trenes) y búsqueda web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (proyecto de agente, no modelo de lenguaje) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (principal), otros no especificados |
| Licencia | No disponible |
| Formato de pesos | No aplicable (código fuente Python, Docker) |

Datos adicionales del proyecto:

| Parametro | Valor |
|---|---|
| Tipo de proyecto | Aplicación de agente conversacional con frontend Gradio y backend FastAPI |
| Lenguaje principal | Python |
| Orquestador | LangGraph (flujo ReAct: START -> llm -> tool -> llm -> ... -> END) |
| LLM subyacente | DeepSeek (configurable vía API key) |
| Herramientas MCP | AMAP (rutas), 12306 (trenes), búsqueda web, herramientas locales |
| Almacenamiento | JSONL local, MySQL (opcional), Redis (opcional), RabbitMQ (opcional) |
| Sandbox | Anthropic sandbox-runtime para aislamiento de Shell y archivos |
| Despliegue | Docker, compatible con Hugging Face Spaces, Render, Railway |

## Arquitectura y entrenamiento

Travel Agent no es un modelo entrenado, sino un sistema de agente que orquesta un LLM externo mediante LangGraph. El flujo principal sigue un patrón ReAct: el nodo `llm` decide si necesita herramientas, el nodo `tool` ejecuta las llamadas (locales o MCP) y el resultado se devuelve al LLM hasta que se genera la respuesta final. El proyecto incluye un `tool_guard.py` que valida esquemas de parámetros, detecta llamadas duplicadas, cuenta fallos y clasifica reintentos de MCP.

La arquitectura se divide en varios componentes: `main.py` arranca el servidor, `backend.py` expone la API FastAPI con endpoints de chat (síncrono y streaming), `gradio_manager.py` proporciona la interfaz web, y `session_manager.py` mantiene instancias de agente por usuario y sesión. La memoria se gestiona con un historial corto en JSONL, una memoria larga en `MEMORY.md` y `HISTORY.md`, y un mecanismo de consolidación que comprime conversaciones antiguas cuando se supera un umbral de tokens. Si se habilita RabbitMQ, la consolidación se procesa en una cola asíncrona.

No se proporcionan datos de entrenamiento, ya que el proyecto no incluye pesos ni proceso de aprendizaje. El LLM subyacente (DeepSeek) es el que aporta las capacidades de razonamiento y generación de lenguaje.

## Capacidades

- Planificación de rutas: utiliza la herramienta MCP de AMAP para calcular itinerarios entre puntos (ej. "天安门到颐和园怎么走").
- Consulta de billetes de tren: integra la API de 12306 para verificar disponibilidad en fechas concretas.
- Búsqueda web: permite buscar noticias o información y resumir el primer resultado.
- Cálculo aritmético: herramienta local para operaciones matemáticas simples.
- Resumen de historial de conversación: consolida el contexto previo para reducir la carga de tokens.
- Lectura de archivos y ejecución de Shell: disponible en local, con sandboxing para aislar operaciones.
- Skill personalizados: el agente puede invocar skills predefinidos (por ejemplo, obtener el tiempo o crear un plan de viaje) y también crear nuevos skills.
- Subagentes: delega tareas complejas (investigación de destinos, recopilación de datos) a agentes hijos.
- Memoria a largo plazo: mantiene información persistente por usuario en archivos Markdown.
- Soporte de tool calling y multi-step reasoning: el flujo ReAct permite encadenar varias llamadas a herramientas antes de responder.
- Multilingüe: la interfaz y las respuestas están orientadas al chino, aunque el LLM subyacente puede manejar otros idiomas (no confirmado).

## Casos de uso

- Asistente de viajes personal: un usuario puede preguntar "¿Cómo llego de Tiananmen al Palacio de Verano?" y el agente consulta AMAP, obtiene la ruta y la explica en lenguaje natural.
- Verificación de disponibilidad de trenes: "¿Hay billetes de Beijing a Shanghái para el 15 de abril de 2026?" – el agente consulta 12306 y responde con horarios y disponibilidad.
- Planificación de itinerarios con presupuesto: "Crea un plan de un día en Nanjing con 500 yuanes" – el agente invoca un skill de planificación y genera un itinerario detallado.
- Investigación automatizada: "Busca noticias sobre Codex y resume el primer artículo" – combina búsqueda web, extracción de contenido y resumen.
- Automatización de tareas de oficina: lectura de archivos y ejecución de comandos Shell en un entorno sandbox para procesar datos o generar informes.
- Sistema de atención al cliente con memoria: un negocio de viajes puede desplegar el agente para responder consultas recurrentes, manteniendo el contexto de cada cliente y ofreciendo recomendaciones basadas en historial previo.
- Desarrollo de prototipos multiagente: los desarrolladores pueden usar el proyecto como referencia para implementar subagentes, gestión de sesiones y colas de trabajo asíncronas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto no incluye métricas de evaluación del agente ni comparativas con otros sistemas. El rendimiento depende del LLM externo (DeepSeek) y de la latencia de las APIs de terceros (AMAP, 12306, búsqueda web).

## Requisitos de hardware

- No se requiere GPU local, ya que el LLM se consume a través de una API externa (DeepSeek).
- CPU y RAM moderadas para ejecutar el backend FastAPI, Gradio y los servicios auxiliares (MySQL, Redis, RabbitMQ si se habilitan).
- Se recomienda al menos 2 GB de RAM para el proceso principal; con MySQL y RabbitMQ activos, se necesitan 4-8 GB.
- Espacio en disco para almacenar logs, sesiones y dependencias (aprox. 1-2 GB).
- Opciones de despliegue: Docker local, Hugging Face Spaces (Docker), Render, Railway.
- Para alta concurrencia, se pueden lanzar múltiples workers con `BACKEND_WORKERS=4` y ajustar los límites de concurrencia de LLM y MCP.
- La latencia depende de la API del LLM y de las herramientas externas; el proyecto incluye un parámetro `AGENT_STREAM_CONTENT_DELAY` para controlar la velocidad de streaming en la interfaz.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de lenguaje, ya que Travel Agent es un proyecto de agente, no un modelo. Como sistema, se puede comparar con frameworks de agentes como AutoGen, CrewAI o LangChain, aunque no hay datos objetivos de rendimiento. La siguiente tabla resume las diferencias a nivel de diseño:

| Característica | Travel Agent | AutoGen | CrewAI |
|---|---|---|---|
| Tipo | Aplicación completa con UI | Framework de agentes | Framework de agentes |
| Orquestación | LangGraph (ReAct) | Conversación multi-agente | Roles y tareas |
| Herramientas | MCP, locales, subagentes | Funciones Python | Herramientas integrables |
| Almacenamiento | JSONL, MySQL, Redis | Estado en memoria | Estado en memoria |
| Interfaz | Gradio | No incluida | No incluida |
| Despliegue | Docker, Spaces | Biblioteca | Biblioteca |

## Limitaciones y advertencias

- El proyecto no incluye un modelo de lenguaje propio; depende de la API de DeepSeek, por lo que requiere una clave válida y tiene costes asociados.
- Las respuestas están orientadas al chino; no se garantiza un soporte multilingüe completo.
- La ejecución de Shell y la lectura de archivos están desactivadas o restringidas en despliegues públicos por seguridad; en local, el sandbox de Anthropic mitiga riesgos pero no los elimina.
- La disponibilidad y precisión de las herramientas externas (AMAP, 12306, búsqueda web) depende de terceros; pueden fallar o devolver datos desactualizados.
- No se especifica la licencia del proyecto, lo que puede limitar su uso comercial sin consultar al autor.
- La memoria a largo plazo se almacena en archivos Markdown y bases de datos; si se despliega en un entorno compartido, hay que proteger estos datos para evitar fugas de información.
- No hay benchmarks publicados, por lo que la calidad de las respuestas y la eficiencia del agente no están validadas objetivamente.
- El proyecto está en fase de desarrollo (creado en agosto de 2026) y puede contener errores o cambios sin documentar.

## Enlaces

- HuggingFace: https://huggingface.co/PengxiaoYu-ai/travel-agent-source
