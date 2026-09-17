# smlflg/HAI-Relay

## Resumen

HAI-Relay no es un modelo de lenguaje ni una red neuronal: es un paquete de software de comunicacion local-first para agentes de codigo. Lo publica el usuario smlflg en HuggingFace como repositorio de infraestructura, no como pesos de modelo. Su funcion es actuar como columna vertebral de mensajeria entre seis clientes de agente (Codex, Claude, Cursor, Gemini, OpenCode y Hermes): cada cliente recibe una identidad fija en el momento de lanzar su comando MCP y habla con un unico daemon central a traves de un socket Unix.

El relay ofrece mensajeria agente-a-agente pasiva y durable, hilos con forma A2A (tareas, referencias a artefactos, acuses de recibo y eventos de auditoria), despacho de tareas condicionado por mision y lease a traves de un puerto de autoridad HAI-MCP que falla en cerrado (fail-closed), y despacho ACP mediante el SDK oficial de cliente ACP de Python. Persiste en SQLite, soporta recuperacion tras reinicio, idempotencia, cargas utiles de 64 KiB, retencion de 14 dias y un maximo de tres saltos por mensaje.

Es relevante ahora porque la orquestacion de varios agentes de codigo sobre una misma maquina exige un mecanismo de coordinacion con identidades no suplantables, trazabilidad y control de permisos. El proyecto se declara explicitamente incompleto: no incluye registros MCP globales de cliente, no incluye pruebas de humo ACP en vivo y su autoridad HAI-MCP no tiene implementacion de produccion invocable, por lo que toda tarea falla en cerrado salvo que se configure un adaptador de autoridad externo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable: no es un modelo neuronal; es un daemon en Python (socket Unix + facade MCP por identidad + almacen SQLite) |
| Parametros totales | no aplicable |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable; limites operativos: carga util maxima de 64 KiB por mensaje, retencion de 14 dias, maximo de 3 saltos |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible (la documentacion y los mensajes del sistema estan en ingles) |
| Licencia | no disponible (la model card no indica licencia y la ficha de HuggingFace no la expone) |
| Formato de pesos | no aplicable (paquete Python; instalacion con `uv sync`; no se distribuyen pesos) |
| Tipo de artefacto | repositorio de software / herramienta de infraestructura |
| Lenguaje de implementacion | Python (gestionado con `uv`) |
| Transporte | socket Unix local |
| Persistencia | SQLite, con recuperacion tras reinicio |
| Interfaz expuesta | 7 herramientas MCP |
| Identidad | fija en el lanzamiento del proceso MCP; ninguna herramienta acepta `from_agent` |
| Estado del proyecto | parcial: nucleo implementado, registros MCP globales y pruebas ACP en vivo no incluidos |
| Descargas / likes | 0 descargas, 1 like |
| Fecha de creacion en HuggingFace | 2026-09-16 (segun metadatos de la ficha) |

## Arquitectura y entrenamiento

No existe entrenamiento: no hay corpus, ni tokens de entrenamiento, ni fases de RLHF, DPO o ajuste por instrucciones, porque HAI-Relay no es un modelo generativo. La arquitectura es la de un daemon central que escucha en un socket Unix (`hai-relay serve --state-dir ... --socket ...`) y de una o varias fachadas MCP ligadas a identidad (`hai-relay-mcp --agent codex --socket ...`), que se lanzan por separado para cada agente registrado. La identidad del emisor queda fijada en el arranque del proceso MCP, de modo que ninguna de las siete herramientas acepta un campo `from_agent`; esto elimina la suplantacion de identidad a nivel de API.

El control de permisos se apoya en un puerto de autoridad (`--authority-command`) que recibe un documento JSON por la entrada estandar y devuelve un veredicto con los campos `allowed`, `assurance` y `reason`. Sin ese adaptador, los mensajes pasivos funcionan pero toda tarea falla en cerrado. El despacho se organiza en modo advisory (solo lectura o consultivo) por defecto; las tareas que cambian estado exigen ademas que el destino sea `claude` y que la garantia sea `guarded`. Las solicitudes de permiso ACP las deniega el propio cliente del relay, y la ejecucion con acceso a sistema de ficheros o herramientas queda delegada al adaptador anfitrion HAI-MCP.

Las siete herramientas MCP son: `relay_health`, `relay_list_agents`, `relay_send_message`, `relay_read_inbox`, `relay_get_thread`, `relay_ack_message` y `relay_cancel_task`. El informe de salud distingue tres estados independientes por agente: `configured`, `enabled` y `worked_live`.

## Capacidades

- Mensajeria agente-a-agente pasiva y durable, con persistencia en SQLite y recuperacion del estado tras un reinicio del daemon.
- Hilos con forma A2A: tareas, referencias a artefactos, acuses de recibo y eventos de auditoria.
- Despacho de tareas condicionado por mision y lease a traves de un puerto de autoridad HAI-MCP con comportamiento fail-closed.
- Despacho ACP mediante el SDK oficial de cliente ACP de Python, con importacion en tiempo de ejecucion aislada.
- Idempotencia de operaciones, lo que permite reintentos seguros de envio y de acuse.
- Limites operativos definidos: cargas utiles de hasta 64 KiB, retencion de 14 dias y un maximo de tres saltos por mensaje.
- Identidad fija por proceso MCP, sin parametro `from_agent` en ninguna herramienta.
- Politica de ejecucion en dos niveles: advisory por defecto y guarded para tareas que cambian estado, restringidas al destino `claude` con garantia `guarded`.
- Seis agentes registrables con sus comandos de adaptador: Codex (`codex-acp`, advisory), Claude (`claude-code-acp`, guarded), Cursor (`cursor-agent acp`, advisory), Gemini (`gemini --acp`, advisory), OpenCode (`opencode acp`, advisory) y Hermes (`hermes acp`, advisory).
- Las solicitudes de permiso ACP se deniegan por defecto en el cliente del relay.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio: esas capacidades pertenecen a los agentes conectados, no al relay.

## Casos de uso

- Orquestacion multi-agente en una sola maquina de desarrollo: un agente planificador (por ejemplo Codex en modo advisory) envia tareas al relay y otro agente ejecutor las recibe en su bandeja, con identidades fijas que impiden que un agente se haga pasar por otro.
- Coordinacion entre generacion y ejecucion con permisos asimetricos: el agente que propone cambios opera en advisory y solo Claude, con garantia guarded, puede ejecutar tareas que modifican estado, lo que reduce el radio de impacto de un agente comprometido o alucinado.
- Trazabilidad y auditoria de flujos agente-a-agente: los hilos A2A con eventos de auditoria, acuses de recibo y retencion de 14 dias permiten reconstruir que agente pidio que, cuando y con que autorizacion.
- Integracion de agentes heterogeneos en un mismo flujo: al exponer una fachada MCP por identidad y hablar ACP con los adaptadores oficiales, se pueden encadenar Codex, Cursor, Gemini, OpenCode y Hermes sin escribir conectores ad hoc entre cada par.
- Automatizacion de pipelines de desarrollo con reintentos seguros: la idempotencia y la persistencia en SQLite permiten que un paso de CI/CD reenvie una tarea tras un fallo del daemon sin duplicar el trabajo.
- Reproduccion de experimentos y desarrollo local sin servicios en la nube: al usar un socket Unix y almacenamiento en disco, el flujo completo de agentes puede ejecutarse en una estacion de trabajo aislada o sin salida a Internet.
- Base para sistemas de tareas con caducidad: el modelo de mision y lease encaja en escenarios donde una tarea debe ejecutarse dentro de una ventana de autorizacion concreta y quedar invalidada al expirar el lease.
- Prototipado de integraciones HAI-MCP: el puerto de autoridad con contrato JSON por entrada estandar sirve para probar adaptadores de politica antes de conectar una autoridad de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad, latencia ni throughput, y no aplica la comparacion con benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros) porque no es un modelo. Lo unico verificable que documenta el autor es el estado de las puertas de calidad del propio repositorio:

| Puerta | Estado declarado en el repositorio |
|---|---|
| Paquete central del relay (socket, almacen, siete herramientas MCP, politica) | Implementado |
| Registros MCP globales de cliente | No incluido; requiere aprobacion separada del propietario |
| Pruebas de humo ACP en vivo con los seis agentes | No incluidas; `worked_live` permanece en falso hasta que existan pruebas acotadas del adaptador |

El autor advierte ademas que `hai-relay --version` solo informa de los metadatos del paquete y no constituye prueba de ACP en vivo. La validacion de desarrollo se realiza con `uv run pytest`, `uv run ruff check .` y `uv run mypy src`, sin cifras publicadas de cobertura ni de tiempo de ejecucion.

## Requisitos de hardware

- No requiere GPU: es un proceso Python con almacen SQLite y comunicacion por socket Unix; se ejecuta en CPU.
- No aplican estimaciones de VRAM ni de cuantizacion, porque no se cargan pesos de modelo.
- Entorno recomendado: Linux o macOS con soporte de sockets Unix. En Windows seria necesario un entorno compatible con sockets Unix (por ejemplo WSL) para el transporte del daemon.
- Requisitos reales: interprete de Python y gestor `uv` para la instalacion (`uv sync`), mas espacio en disco para el directorio de estado y la base de datos SQLite.
- Opciones de despliegue: ejecucion local del daemon (`uv run hai-relay serve`) y una o varias fachadas MCP por agente; no se documentan contenedores, orquestadores ni servicios gestionados.
- Latencia y throughput: no disponibles. Solo se conocen los limites de diseno (64 KiB por mensaje, 14 dias de retencion, 3 saltos maximos).
- Para el despliegue en produccion seria necesario configurar un adaptador de autoridad externo (`--authority-command`); sin el, las tareas fallan en cerrado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros proyectos comparables de relay MCP/ACP, ni datos de parametros, contexto, rendimiento o licencia de alternativas, por lo que no es posible establecer una comparativa rigurosa. Tampoco procede comparar con modelos de lenguaje: la categoria del artefacto es la de herramienta de infraestructura para agentes, no la de modelo generativo.

## Limitaciones y advertencias

- El proyecto se declara incompleto por su propio autor: HAI-MCP no tiene todavia una implementacion de autoridad de produccion invocable, y las tareas fallan en cerrado si no se configura un adaptador externo.
- El relay no afirma tener integracion HAI-MCP en vivo; la afirmacion contraria seria incorrecta.
- No incluye los registros MCP globales de cliente: requieren aprobacion separada del propietario.
- No incluye pruebas de humo ACP en vivo con los seis agentes; el indicador `worked_live` permanece en falso hasta que existan pruebas acotadas del adaptador.
- Las solicitudes de permiso ACP son denegadas por el cliente del relay; la ejecucion guarded con acceso a sistema de ficheros o herramientas queda fuera del alcance de este repositorio y pertenece al adaptador anfitrion HAI-MCP.
- Licencia no disponible: sin una licencia explicita no puede asumirse permiso para uso comercial, redistribucion o modificacion.
- Limites operativos que condicionan el diseno: 64 KiB por carga util, 14 dias de retencion y un maximo de tres saltos, lo que impide cadenas largas de reenvio entre agentes.
- Proyecto con senales de madurez muy bajas: 0 descargas y 1 like en el momento de la consulta, sin fecha de version estable ni historial publico de mantenimiento.
- Anomalia de metadatos: las fechas de creacion y actualizacion de la ficha en HuggingFace son del 16 de septiembre de 2026, posteriores a la fecha de consulta, lo que conviene verificar antes de citar el proyecto.
- Riesgos habituales de suplantacion, inyeccion de instrucciones o alucinacion de tareas por parte de los agentes conectados; el relay mitiga la suplantacion con identidades fijas, pero no valida semanticamente el contenido de los mensajes.
- Dependencia de un socket Unix local: no es un servicio de red distribuida y no se documentan mecanismos de autenticacion remota ni cifrado en transito.
- No hay benchmarks publicados de latencia, throughput ni tolerancia a fallos mas alla de la recuperacion tras reinicio.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/smlflg/HAI-Relay
- Documentacion del proyecto: incluida en la model card del repositorio anterior, sin sitio web propio ni DOI indicados.
- La busqueda web realizada no devolvio ningun resultado relevante sobre HAI-Relay, MCP o ACP: los resultados obtenidos correspondian a paginas de soporte de Dell y HP sin relacion con el proyecto. Por tanto, no hay papers, blogs, repositorios ni demos adicionales que enlazar.
