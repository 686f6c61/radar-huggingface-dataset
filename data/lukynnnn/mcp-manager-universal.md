# Lukynnnn/mcp-manager-universal

## Resumen

MCP Manager Universal es un servidor MCP (Model Context Protocol) que actúa como gestor centralizado para todos los demás servidores MCP de un desarrollador. Lo desarrolla Lukynnnn y se distribuye como paquete Python con licencia MIT. Su propósito es unificar la administración de configuraciones, tokens, salud y despliegue de servidores MCP a través de múltiples entornos de desarrollo asistido por IA (harnesses), como OpenCode, Claude Desktop, Cursor, Windsurf, Cline, Zed y Continue.dev.

No se trata de un modelo de lenguaje ni de un sistema de aprendizaje automático, sino de una herramienta de software que implementa el protocolo MCP (JSON-RPC 2.0) para ofrecer 23 herramientas organizadas en 6 categorías: configuración, servidores, catálogo, tokens, salud, sincronización, búsqueda, Docker e información. Incluye un catálogo integrado de 20 servidores MCP populares, cifrado de tokens con Fernet AES-128-CBC y derivación de clave PBKDF2 con 480 000 iteraciones. Su relevancia actual radica en la creciente adopción de MCP como estándar para conectar modelos de IA con herramientas externas, lo que hace necesario un punto único de gestión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servidor MCP (protocolo JSON-RPC 2.0) sobre Python |
| Parametros totales | No aplica (no es un modelo de ML) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (interfaz y documentación) |
| Licencia | MIT |
| Formato de pesos | No aplica (paquete Python distribuido vía PyPI) |

## Arquitectura y entrenamiento

MCP Manager Universal es una aplicación Python que implementa el lado servidor del Model Context Protocol. Su arquitectura se basa en un proceso que escucha peticiones JSON-RPC 2.0 por STDIO o Docker, y expone 23 herramientas agrupadas en categorías funcionales. Internamente gestiona archivos de configuración de distintos harnesses, convierte formatos entre ellos, almacena tokens cifrados con Fernet (AES-128-CBC) y realiza comprobaciones de salud sobre servidores MCP mediante STDIO, Docker o HTTP.

No existe fase de entrenamiento, ya que no es un modelo neuronal. El desarrollo se centra en la lógica de gestión de configuraciones, la detección automática de harnesses instalados y la conversión de formatos. La seguridad de los tokens se resuelve con cifrado simétrico y una contraseña maestra definida por variable de entorno, sin secretos hardcodeados. El proyecto se distribuye como paquete instalable con `pip install mcp-manager-universal` y también ofrece una imagen Docker para despliegue aislado.

## Capacidades

- Gestión de configuración: listar, leer y escribir archivos de configuración MCP de los harnesses soportados.
- Administración de servidores: añadir, eliminar, consultar y listar servidores MCP configurados.
- Catálogo integrado: instalar servidores desde un catálogo de 20 opciones populares.
- Gestión de tokens: almacenar, recuperar, rotar y eliminar tokens cifrados con Fernet AES-128-CBC.
- Comprobaciones de salud: verificar la disponibilidad de servidores individuales o de todos a la vez mediante STDIO, Docker o HTTP.
- Sincronización entre harnesses: convertir y exportar configuraciones entre OpenCode, Claude Desktop, Cursor, Windsurf, Cline, Zed y Continue.dev.
- Búsqueda: localizar servidores en el catálogo o entre los instalados.
- Soporte Docker: construir imágenes, ejecutar contenedores y probar la comunicación STDIO con ellos.
- Detección automática de harnesses instalados en el sistema.
- Rotación de tokens con historial y sin pérdida de acceso.

## Casos de uso

- Gestión centralizada de configuraciones MCP: un desarrollador que trabaja con Cursor y Claude Desktop puede usar `list_configs` y `write_config` para mantener un único punto de verdad de sus servidores MCP, evitando inconsistencias entre entornos.
- Sincronización entre harnesses: al cambiar de OpenCode a Windsurf, la herramienta `sync_configs` convierte automáticamente las configuraciones al formato del nuevo harness, ahorrando horas de edición manual.
- Almacenamiento seguro de credenciales: con `set_token` y `get_token`, un equipo puede guardar claves de API de servidores MCP cifradas, sin exponerlas en archivos de configuración en claro.
- Monitorización de salud de servidores: en un entorno de producción con varios servidores MCP desplegados en Docker, `health_check_all` permite detectar caídas o errores de conexión de forma proactiva.
- Despliegue reproducible con Docker: `docker_build` y `docker_run` facilitan empaquetar y lanzar servidores MCP en contenedores, garantizando entornos consistentes entre máquinas.
- Incorporación de nuevos servidores desde el catálogo: `install_server` permite añadir servidores populares (por ejemplo, de bases de datos o APIs) sin necesidad de buscar documentación externa, reduciendo el tiempo de integración.
- Auditoría de configuración: `read_config` y `server_info` permiten revisar qué servidores están activos, con qué parámetros y en qué harness, útil para tareas de mantenimiento y cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de una herramienta de gestión y no de un modelo de inferencia, no existen métricas estándar como MMLU o HumanEval. El rendimiento depende de la latencia de los servidores MCP gestionados y del número de configuraciones a procesar.

## Requisitos de hardware

- No requiere GPU ni hardware especializado; es una aplicación Python ligera.
- Mínimo: cualquier máquina con Python 3.8+ y 256 MB de RAM libre.
- Para uso con Docker, se necesita un motor Docker instalado (Docker Engine o equivalente).
- Despliegue local: ejecución directa con `python -m src` o instalación vía pip.
- Despliegue en contenedor: imagen Docker construida con `docker build -t mcp-manager .`.
- Integración con harnesses: cada harness debe poder ejecutar procesos locales (STDIO) o conectarse a contenedores Docker.
- No hay latencia ni throughput estimados publicados; el cuello de botella suele estar en los servidores MCP subyacentes.

## Comparativa con modelos similares

Existen otras soluciones de gestión de MCP en el mercado, pero no se dispone de datos técnicos detallados para una comparación exhaustiva. Se mencionan a continuación por contexto:

| Producto | Enfoque | Diferencias principales |
|---|---|---|
| MCP Manager (mcpmanager.ai) | Gateway de seguridad y observabilidad para agentes de IA | Orientado a organizaciones, con controles de seguridad y monitorización; no es de código abierto |
| McpManager (mcpmarket.com) | Proxy unificado de MCP | Agrega múltiples servidores en un único endpoint, gestiona API keys y convierte OpenAPI specs; self-hosted |
| MCP Universal Manager (skill para Claude Code) | Sistema de gestión de ciclo de vida de servidores MCP | Descubre instancias, hace health checks y repara configuraciones automáticamente; enfocado a Claude Code, Factory Droid y Gemini |

MCP Manager Universal se diferencia por ser un paquete Python de código abierto (MIT) con soporte explícito para 7 harnesses, catálogo integrado y cifrado de tokens. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- No es un modelo de IA generativa; no genera texto, código ni respuestas. Su función es exclusivamente de gestión de servidores MCP.
- El cifrado de tokens depende de una contraseña maestra almacenada en variable de entorno; si esta se pierde, los tokens no podrán recuperarse.
- El soporte de harnesses se limita a los 7 listados; otros entornos (p. ej., JetBrains, Visual Studio Code con extensiones propias) no están cubiertos.
- La conversión de formatos entre harnesses puede no ser perfecta si los esquemas de configuración cambian en versiones futuras de los propios harnesses.
- El catálogo integrado de 20 servidores es fijo; no se actualiza dinámicamente desde una fuente externa.
- Al ser un proyecto con 0 descargas y 0 likes en HuggingFace, su madurez y mantenimiento a largo plazo no están garantizados.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte oficial.
- No se han publicado pruebas de seguridad independientes; el cifrado Fernet es sólido, pero la implementación debe auditarse antes de usarla con credenciales críticas.

## Enlaces

- HuggingFace: https://huggingface.co/Lukynnnn/mcp-manager-universal
- GitHub: https://github.com/kobramantra-debug/mcp-manager-mcp-manage
- PyPI: https://pypi.org/project/mcp-manager-universal/
