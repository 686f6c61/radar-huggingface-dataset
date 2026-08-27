# Lukynnnn/mcp-database-universal

## Resumen

MCP Database Universal es un servidor MCP (Model Context Protocol) desarrollado por Lukynnnn que actúa como interfaz de razonamiento para bases de datos, diseñado para que agentes de IA comprendan el significado de los datos y no solo cómo consultarlos. No es un modelo de lenguaje, sino una herramienta que expone siete herramientas específicas para que modelos de IA (como GPT, Claude, etc.) puedan interactuar con bases de datos SQLite, PostgreSQL, MySQL y MSSQL de forma segura y controlada.

El proyecto resuelve el problema de conectar agentes de IA a bases de datos de manera segura y estructurada, incorporando capas de seguridad como detección de inyección SQL, clasificación de operaciones de solo lectura, límites de filas y tiempos de espera. Su relevancia actual radica en el ecosistema MCP, que está estandarizando la integración de modelos de IA con herramientas externas, y este servidor ofrece una solución universal para el acceso a bases de datos con soporte para múltiples motores.

Incluye un formateador basado en LLM que traduce tipos de datos (por ejemplo, `VARCHAR(255)` a "texto, máx. 255 caracteres"), genera diagramas ER en Mermaid y permite consultas en lenguaje natural mediante `natural_query` cuando se configura con claves de API de OpenAI o Anthropic. La licencia es MIT y el código está disponible en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servidor MCP (Model Context Protocol) |
| Parametros totales | no disponible (no es un modelo de lenguaje) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (interfaz y documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (código Python, paquete pip) |

## Arquitectura y entrenamiento

MCP Database Universal no es un modelo entrenado, sino un servidor MCP implementado en Python que se instala mediante pip. Su arquitectura se basa en el protocolo MCP, que permite a agentes de IA descubrir y ejecutar herramientas de forma estandarizada. El servidor expone siete herramientas: `test_connection`, `list_tables`, `inspect_table`, `query`, `natural_query`, `profile_database` y `schema_graph`. Internamente, utiliza controladores específicos para cada motor de base de datos (SQLite integrado, PostgreSQL, MySQL y MSSQL como extras opcionales) y una capa de seguridad que incluye detección de inyección SQL, clasificación de operaciones de solo lectura, límite de filas (por defecto 1000), tiempo máximo de consulta (30 segundos) y límite de tamaño de respuesta (50 KB).

El modo `natural_query` depende de un LLM externo (OpenAI o Anthropic) para traducir preguntas en lenguaje natural a SQL, lo que requiere configurar las claves de API correspondientes. No hay datos de entrenamiento porque no es un modelo; es una herramienta de software.

## Capacidades

- Acceso a bases de datos SQLite, PostgreSQL, MySQL y MSSQL mediante MCP.
- Siete herramientas específicas para exploración de esquemas, consultas, perfiles de datos y generación de diagramas ER.
- Modo de solo lectura por defecto, con opción de habilitar escritura mediante `DATABASE_WRITE_ENABLED=true`.
- Capa de seguridad integrada: detección de inyección SQL, clasificación de consultas de solo lectura, límite de filas, timeout y límite de tamaño de respuesta.
- Formateador de tipos de datos que traduce tipos SQL a descripciones legibles (por ejemplo, `VARCHAR(255)` → "texto, máx. 255 caracteres").
- Generación de diagramas ER en formato Mermaid.
- Consultas en lenguaje natural mediante `natural_query` (requiere API de OpenAI o Anthropic).
- Configuración cero para SQLite mediante `DATABASE_URL=sqlite:///ruta/al/archivo.db`.
- Despliegue local o mediante Docker.

## Casos de uso

- Exploración de bases de datos para agentes de IA: un agente puede usar `list_tables` e `inspect_table` para comprender la estructura de una base de datos antes de formular consultas, lo que reduce errores y mejora la precisión de las respuestas.
- Generación de informes de datos: mediante `profile_database`, un agente puede obtener distribuciones de valores, tasas de NULL y relaciones entre tablas, útil para análisis exploratorios automatizados.
- Asistente de consultas en lenguaje natural: con `natural_query`, un usuario puede preguntar "¿cuántos clientes hay en Madrid?" y el servidor genera el SQL, lo ejecuta y devuelve el resultado con una explicación, ideal para paneles de BI conversacionales.
- Documentación de esquemas: `schema_graph` genera diagramas ER en Mermaid que pueden integrarse en documentación técnica o wikis internas.
- Auditoría de seguridad de bases de datos: al ser de solo lectura por defecto y con detección de inyección SQL, puede usarse para probar consultas de forma segura sin riesgo de modificar datos.
- Integración en pipelines de datos: el servidor puede desplegarse como contenedor Docker y conectarse a herramientas de orquestación (por ejemplo, Airflow) para que agentes de IA realicen consultas programadas sobre bases de datos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un servidor MCP y no un modelo de lenguaje, no aplican métricas como MMLU o HumanEval. El rendimiento depende del motor de base de datos subyacente y de la latencia de red.

## Requisitos de hardware

- No requiere GPU ni hardware especializado; es un proceso Python que se ejecuta en CPU.
- Memoria RAM mínima: depende del tamaño de las bases de datos consultadas; para SQLite local, 512 MB son suficientes para casos pequeños.
- Almacenamiento: el paquete pip ocupa unos pocos MB; las bases de datos se gestionan externamente.
- Despliegue: puede ejecutarse localmente con `python -m mcp_database_universal` o en Docker con la imagen `mcp-database-universal:latest`.
- Compatible con cualquier sistema que soporte Python 3.8+ y los controladores de base de datos correspondientes.
- Para `natural_query` se requiere acceso a las APIs de OpenAI o Anthropic, lo que implica conexión a internet y claves válidas.

## Comparativa con modelos similares

No disponible. No existen "modelos" comparables en el sentido de LLMs; sin embargo, hay otros servidores MCP para bases de datos, como `universal-db-mcp` de Fashad-Ahmed o el de Anarkh-Lee, que ofrecen funcionalidades similares. La comparativa se centraría en características como motores soportados, seguridad, herramientas disponibles y licencia, pero no se dispone de datos detallados de esos proyectos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje; requiere un LLM externo para la funcionalidad de `natural_query`, lo que añade dependencia de APIs de pago.
- La seguridad de solo lectura es configurable; si se habilita la escritura (`DATABASE_WRITE_ENABLED=true`), existe riesgo de modificaciones accidentales o malintencionadas en los datos.
- La detección de inyección SQL no es infalible; consultas complejas o generadas por LLM podrían evadirla en algunos casos.
- El límite de filas por defecto (1000) puede truncar resultados de consultas grandes, lo que podría dar respuestas incompletas.
- El formateador de tipos de datos está en inglés; no hay soporte para otros idiomas en la salida.
- La documentación y la interfaz están solo en inglés, lo que puede ser una barrera para equipos hispanohablantes.
- No se proporcionan garantías de soporte o mantenimiento; es un proyecto de un solo autor con 0 descargas y 0 likes en HuggingFace, lo que sugiere poca adopción y posible falta de pruebas en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Lukynnnn/mcp-database-universal
- Repositorio relacionado (universal-db-mcp de Fashad-Ahmed): https://github.com/Fashad-Ahmed/universal-db-mcp
- Repositorio relacionado (universal-db-mcp de Anarkh-Lee): https://github.com/Anarkh-Lee/universal-db-mcp/
- Registro oficial de MCP: https://registry.modelcontextprotocol.io/
- MCP-Universe (benchmarking de servidores MCP): https://mcp-universe.github.io/
