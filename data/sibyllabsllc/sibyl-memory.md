# SibylLabsLLC/Sibyl-Memory

## Resumen

Sibyl-Memory es una infraestructura de memoria agéntica de código abierto, desarrollada por Sibyl Labs LLC, diseñada para dotar a agentes de IA de memoria a largo plazo persistente y local. A diferencia de los sistemas convencionales de memoria basados en bases vectoriales y modelos de embeddings, Sibyl-Memory utiliza un esquema jerárquico de cinco niveles sobre SQLite con búsqueda de texto completo FTS5, sin necesidad de infraestructura externa de recuperación. El proyecto se distribuye como un conjunto de cinco paquetes Python en PyPI, con licencia MIT, y está pensado para integrarse con frameworks de agentes como LangGraph, MCP, o el agente Hermes.

Su relevancia actual radica en que aborda uno de los problemas más acuciantes en el desarrollo de agentes: la persistencia de memoria a través de conversaciones y tareas sin depender de servicios en la nube ni incurrir en costes de embeddings. Según los datos publicados, el sistema obtuvo un 95,6 % de precisión en el benchmark LongMemEval (ICLR 2025, Universidad de Míchigan), quedando en segunda posición global, empatado con Chronos (PwC) y superando a sistemas como Mem0, Zep o Supermemory. Es la única solución basada en archivos dentro del nivel superior, ejecutándose en una máquina modesta de 4 vCPU y 16 GB de RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (sistema de software, no un modelo de pesos) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del agente que lo integre) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (independiente del idioma, funciona con cualquier texto) |
| Licencia | MIT |
| Formato de pesos | No aplica (codigo Python, paquetes PyPI) |

## Arquitectura y entrenamiento

Sibyl-Memory no es un modelo de lenguaje entrenado, sino una biblioteca de software que implementa un motor de memoria local. Su arquitectura se basa en una base de datos SQLite con un esquema jerárquico de cinco niveles, que organiza la información en distintos grados de granularidad y persistencia. La búsqueda se realiza mediante FTS5, el motor de texto completo integrado en SQLite, lo que permite recuperación eficiente sin necesidad de vectores ni modelos de embeddings. El sistema es multi-tenant por diseño, lo que permite aislar memorias de distintos agentes o usuarios en la misma base de datos.

El desarrollo del proyecto no implica entrenamiento de redes neuronales; se trata de ingeniería de software. La lógica de detección de habilidades y el "memory linter" (una herramienta de análisis de calidad de la memoria) son componentes programáticos que operan sobre los datos almacenados. La integración con agentes se realiza mediante adaptadores: un servidor MCP para clientes compatibles (Claude Code, Codex, Cursor, Continue), un adaptador para LangGraph `BaseStore`, y un paquete específico para Hermes Agent. No se han publicado detalles sobre el proceso de desarrollo ni sobre la composición de datos de entrenamiento, ya que no existe tal fase.

## Capacidades

- Memoria a largo plazo persistente para agentes de IA, almacenada localmente en un único archivo SQLite.
- Búsqueda de texto completo (FTS5) sin necesidad de modelos de embeddings ni bases vectoriales.
- Esquema jerárquico de cinco niveles que permite organizar la información por relevancia y antigüedad.
- Multi-tenant: soporta múltiples agentes o usuarios con aislamiento de datos.
- Autodetección de habilidades (self-learning skill detection) y un "memory linter" local para mantener la calidad de la memoria.
- Integración con el protocolo MCP (Model Context Protocol), lo que lo hace compatible con herramientas como Claude Code, Codex, Cursor y Continue.
- Adaptador para LangGraph `BaseStore`, permitiendo memoria duradera entre hilos de conversación.
- Integración directa con Hermes Agent v0.13+ mediante el paquete `sibyl-memory-hermes`.
- Sin llamadas de red en uso gratuito no activado; la activación solo envía metadatos de cuenta, nunca el contenido de la memoria.
- Funciona en cualquier idioma, ya que la búsqueda se basa en texto plano.

## Casos de uso

- **Asistentes personales con memoria persistente**: un agente que recuerda preferencias, historial de conversaciones y datos personales del usuario a lo largo del tiempo, sin depender de servicios en la nube. Se integraría mediante el paquete `sibyl-memory-client` en una aplicación Python o a través del servidor MCP en un cliente compatible.
- **Automatización de tareas empresariales con contexto histórico**: un agente que gestiona correos, tickets o documentos puede almacenar el historial de interacciones y recuperar información relevante de meses anteriores usando FTS5, sin costes de embeddings.
- **Agentes de desarrollo de software**: un asistente de codificación que recuerda decisiones de arquitectura, convenciones de estilo y errores pasados. Se puede conectar a Claude Code o Cursor mediante el servidor MCP, permitiendo que el agente acceda a memoria persistente local.
- **Sistemas de atención al cliente**: un agente que atiende consultas recurrentes puede almacenar resoluciones previas y recuperarlas rápidamente, mejorando la consistencia y reduciendo el tiempo de respuesta.
- **Investigación y análisis de documentos**: un agente que procesa grandes volúmenes de texto (artículos, informes) puede indexar y buscar fragmentos relevantes usando FTS5, sin necesidad de infraestructura vectorial.
- **Orquestación multi-agente**: con el adaptador LangGraph, se puede dotar de memoria compartida a múltiples agentes que colaboran en un flujo de trabajo, manteniendo el estado entre ejecuciones.

## Benchmarks y rendimiento

El sistema fue evaluado en el benchmark LongMemEval (ICLR 2025, Universidad de Míchigan), que consta de 500 preguntas. Según la información publicada, obtuvo una precisión del 95,6 %, ocupando el segundo puesto global, empatado con Chronos (PwC) y superando a Mastra, MemMachine, Hindsight, Mem0, Supermemory, Zep y la línea base Oracle. No se han publicado resultados detallados por categoría ni comparaciones numéricas con otros sistemas en la información disponible.

| Sistema | Precisión en LongMemEval | Posición |
|---|---|---|
| Sibyl-Memory | 95,6 % | #2 (empatado con Chronos) |
| Chronos (PwC) | 95,6 % | #2 |
| Mastra | no disponible | inferior |
| Mem0 | no disponible | inferior |
| Zep | no disponible | inferior |
| Supermemory | no disponible | inferior |

Nota: los valores de los sistemas inferiores no se especifican en la información proporcionada; solo se indica que Sibyl-Memory los superó.

## Requisitos de hardware

- **VRAM**: no requiere GPU. Es un sistema basado en CPU.
- **RAM**: la referencia publicada indica que funciona en una máquina con 4 vCPU y 16 GB de RAM.
- **Almacenamiento**: un único archivo SQLite en disco; el tamaño depende del volumen de memoria almacenada.
- **GPU recomendadas**: ninguna.
- **Compatibilidad con hardware de consumo**: sí, cualquier ordenador con Python 3.10+ y SQLite.
- **Opciones de despliegue**: como biblioteca Python integrada en aplicaciones, como servidor MCP, o como adaptador LangGraph. No requiere servicios externos.
- **Latencia y throughput**: no se han publicado cifras concretas, pero al ser búsqueda FTS5 en SQLite local, la latencia es típicamente de milisegundos para bases de datos moderadas.

## Comparativa con modelos similares

Sibyl-Memory se compara con otros sistemas de memoria para agentes, no con modelos de lenguaje. La siguiente tabla resume las diferencias principales:

| Característica | Sibyl-Memory | Mem0 | Zep | Supermemory |
|---|---|---|---|---|
| Tipo de almacenamiento | SQLite + FTS5 (archivo local) | Base vectorial (embeddings) | Base vectorial (embeddings) | Base vectorial (embeddings) |
| Dependencia de embeddings | No | Sí | Sí | Sí |
| Coste de infraestructura | Ninguno (local) | Requiere servicio o API | Requiere servicio | Requiere servicio |
| Licencia | MIT | Apache 2.0 | Propietaria (con plan gratuito) | Propietaria |
| Rendimiento en LongMemEval | 95,6 % (#2) | Inferior (no especificado) | Inferior (no especificado) | Inferior (no especificado) |
| Integración MCP | Sí | No (solo API) | Sí (API) | Sí (API) |
| Multi-tenant | Sí | Sí | Sí | Sí |

## Limitaciones y advertencias

- No es un modelo de lenguaje; no genera texto ni razona. Solo proporciona almacenamiento y recuperación de memoria para agentes externos.
- La calidad de la recuperación depende de la calidad del texto almacenado y de la configuración del esquema jerárquico; no hay comprensión semántica más allá de la coincidencia de texto completo.
- El uso gratuito tiene un límite de almacenamiento local (no especificado); superarlo requiere activación de cuenta, que implica una llamada de red a `api.sibyllabs.org` con metadatos (no contenido).
- La activación y los niveles superiores (staker/suscripción) están vinculados a una cuenta y posiblemente a un monedero; esto puede ser una barrera para algunos usuarios.
- Al ser un proyecto relativamente nuevo (creado en 2026), la comunidad y el soporte pueden ser limitados.
- No hay garantía de que el sistema funcione correctamente con todos los frameworks de agentes; la integración con Hermes, LangGraph y MCP está documentada, pero otros entornos requieren adaptación manual.
- La privacidad es local por diseño, pero si se integra con servicios en la nube, la información puede quedar expuesta a través de esos servicios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SibylLabsLLC/Sibyl-Memory
- Repositorio GitHub (canónico): https://github.com/Sibyl-Labs/Sibyl-Memory
- Documentación: https://docs.sibyllabs.org/memory/
- Producto: https://sibyllabs.org/plugin
- Análisis de benchmarks: https://blog.sibylcap.com/beta-analysis
- Resultados LongMemEval: https://blog.sibylcap.com/longmemeval-v2
- Paquete PyPI `sibyl-memory-client`: https://pypi.org/project/sibyl-memory-client/
- Paquete PyPI `sibyl-memory-cli`: https://pypi.org/project/sibyl-memory-cli/
- Paquete PyPI `sibyl-memory-hermes`: https://pypi.org/project/sibyl-memory-hermes/
- Paquete PyPI `sibyl-memory-mcp`: https://pypi.org/project/sibyl-memory-mcp/
- Paquete PyPI `sibyl-memory-langgraph`: https://pypi.org/project/sibyl-memory-langgraph/
