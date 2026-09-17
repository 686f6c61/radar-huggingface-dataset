# smlflg/hai-mcp-public

## Resumen

HAI-MCP (Human Agent Interface - Model Context Protocol) no es un modelo de lenguaje, sino un servidor MCP de codigo abierto publicado por Samuel Fleig bajo el identificador `smlflg/hai-mcp-public`. Implementa el denominado control-plane de HAI, un enfoque para mantener el trabajo de agentes de IA observable, acotado, autorizado por el propietario y basado en evidencias, de forma que una persona siga siendo la responsable final de la tarea. El propio servidor nunca llama a un LLM: es agnostico al modelo y expone las mismas herramientas a cualquier cliente compatible con MCP (Claude Code, Codex, Cursor, Grok, OpenCode, Hermes, entre otros).

Tecnicamente es un servidor Python que se ejecuta sobre transporte stdio y que, en su version v0.1, expone 23 herramientas organizadas en tres superficies: control plane heredado, ciclo de vida de misiones (motor canonico) y bucle diario (envoltorios finos sobre el motor). Su innovacion principal es la "owner gate": las acciones criticas (aceptar el siguiente paso, recontratar, abandonar una mision) requieren un codigo de un solo uso que el servidor entrega al propietario, no al cliente del agente, ya sea mediante un fichero en `HAI_OWNER_HOME` o por notificacion push via ntfy.

La relevancia actual del proyecto es que aborda el problema de gobernanza de agentes autonomos desde una pieza de infraestructura concreta y desplegable, en lugar de desde el prompt o desde la configuracion del cliente. No hay en la informacion disponible datos de arquitectura de red neuronal, parametros, contexto ni pesos, porque no se trata de un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: servidor MCP en Python, no es una red neuronal |
| Parametros totales | No aplicable (no es un modelo de lenguaje) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible; la persistencia se gestiona como estado en disco, no como ventana de contexto |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponibles (interfaz de herramientas en ingles) |
| Licencia | No disponible |
| Formato de pesos | No aplicable (no distribuye pesos) |
| Version | v0.1; 23 herramientas |
| Transporte | stdio MCP |
| Lenguaje de implementacion | Python, gestionado con `uv` |
| Modelo subyacente | Ninguno; el servidor nunca llama a un LLM |
| Estado global | `$HAI_HOME` (por defecto `~/.hai`) |
| Estado por proyecto | `<project>/Projek-Managment/` |
| Descargas en HuggingFace | 0 |
| Likes en HuggingFace | 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

No existe entrenamiento ni ajuste de pesos: HAI-MCP es un servidor de herramientas que implementa un motor de estado unico ("one state engine"). Las 23 herramientas se reparten en tres capas. La capa de control plane incluye `hai_health`, `hai_status`, `hai_get_next_step`, `hai_read_artifacts`, `hai_park`, `hai_set_focus`, `hai_propose_next_step`, `hai_accept_next_step`, `hai_checkpoint` y `hai_recover`. La capa de ciclo de vida de misiones, descrita como motor canonico, incluye `hai_open_mission`, `hai_bind_project`, `hai_authorize_session`, `hai_get_contract`, `hai_check_activity`, `hai_park_item`, `hai_recontract` y `hai_close_mission`. La capa de bucle diario son envoltorios finos: `hai_intake`, `hai_distill`, `hai_mission_start`, `hai_drift_check`, `hai_proof` y `hai_stop`.

La innovacion tecnica destacable es el mecanismo de autorizacion. El propietario es un principal separado del agente; las acciones con owner gate solo se aprueban con un codigo de un solo uso que se entrega al propietario por fichero (por defecto en `HAI_OWNER_HOME`) o por ntfy (`HAI_OWNER_CHANNEL=ntfy` mas `HAI_OWNER_NTFY_TOPIC`). Ese codigo esta vinculado al cambio exacto, caduca y solo se almacena su hash en `HAI_HOME`. El modo `HAI_OWNER_GATE=ack_legacy` restaura el antiguo `owner_ack` autoafirmado, que el propio proyecto describe como un sistema de honor y que queda reflejado como tal en `hai_health`. La especificacion de las herramientas esta en `docs/TOOL_CONTRACT.md` y el detalle de la puerta de propietario en `docs/OWNER_GATE.md`.

## Capacidades

- Exposicion de un conjunto coherente de 23 herramientas MCP sobre transporte stdio, consumibles por cualquier cliente compatible, sin acoplarse a un proveedor de modelo.
- Gestion de misiones acotadas con contrato versionado: apertura, vinculacion de proyecto, autorizacion de sesion con caducidad temporal sobre una version exacta del contrato, consulta del contrato y cierre con evidencia o abandono.
- Deteccion determinista de deriva mediante `hai_check_activity` / `hai_drift_check`, con clasificacion de la desviacion respecto al contrato.
- Control de concurrencia de foco: `hai_set_focus` limita a un maximo de 2 lanes activas, y `hai_park` / `hai_park_item` permiten aparcar ideas sin robar el foco.
- Flujo diario estructurado: captura inmutable de una idea (`hai_intake`), destilacion a exactamente una decision y un siguiente paso dejando el resto aparcado (`hai_distill`), prueba de cierre (`hai_proof`) y terminacion dura de la jornada sin plan para el dia siguiente (`hai_stop`).
- Recontratacion con diff visible a nivel de campo y revocacion automatica de leases (`hai_recontract`).
- Recuperacion y checkpoints: `hai_checkpoint` para instantaneas de contexto y `hai_recover` para la accion minima de recuperacion.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, audio ni ninguna capacidad cognitiva propia: esas capacidades dependen del cliente o del modelo que este use.

## Casos de uso

- Gobernanza de agentes de codigo en equipo: un agente que trabaja sobre un repositorio queda sujeto a una mision con contrato versionado y a una sesion con lease temporal; cualquier cambio de alcance exige `hai_recontract` con diff visible y aprobacion del propietario, lo que evita que el agente amplie su propio mandato.
- Auditoria y trazabilidad de trabajo agentico: `hai_read_artifacts`, `hai_get_contract` y `hai_check_activity` permiten reconstruir que contrato estaba vigente, que evidencias se produjeron y si hubo deriva, util en entornos regulados donde hace falta justificar cada paso.
- Aprobacion humana en operaciones sensibles: con la owner gate activada por ntfy, el responsable recibe en el movil el codigo de un solo uso para aceptar el siguiente paso o cerrar una mision, de modo que ninguna accion irreversible se ejecuta solo con la voluntad del agente.
- Gestion de foco y carga de trabajo en solitario: `hai_intake` y `hai_distill` convierten una lista desordenada de ideas en una unica decision y un unico siguiente paso por ciclo, con el resto aparcado, reduciendo el cambio de contexto constante.
- Orquestacion multi-cliente en una misma base de estado: al ser agnostico respecto al modelo y al cliente, un equipo puede usar Claude Code, Codex o Cursor indistintamente contra el mismo motor de estado y conservar continuidad en misiones y contracts.
- Integracion en pipelines de agentes existentes: al hablarse por stdio MCP, el servidor se puede declarar como `command`/`args` en la configuracion del cliente y convivir con el antiguo `~/.config/hai-agent-mcp` hasta que se decida migrar.
- Cierre disciplinado de jornadas y prevencion de "trabajo zombi": `hai_stop` revoca leases y termina el dia sin generar plan para el siguiente, lo que sirve como limite operativo explicito en equipos con agentes que podrian seguir ejecutando indefinidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de lenguaje, no aplican MMLU, HumanEval, GSM8K ni metricas equivalentes; tampoco se han facilitado medidas de latencia o throughput del servidor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de alternativas comparables en la informacion proporcionada. La unica referencia comparable mencionada por el propio proyecto es una implementacion previa acoplada a Hermes:

| Aspecto | HAI-MCP | `~/.config/hai-agent-mcp` (prior art) |
|---|---|---|
| Naturaleza | Servidor MCP de control plane | Implementacion previa acoplada a Hermes |
| Modelo subyacente | Agnóstico, no llama a ningun LLM | Acoplado a Hermes |
| Estado | `$HAI_HOME` y `<project>/Projek-Managment/` | No disponible |
| Coexistencia | Se declara compatible hasta migrar deliberadamente | No disponible |
| Owner gate | Codigo de un solo uso al propietario (fichero o ntfy), con modo legacy | No disponible |

## Requisitos de hardware

- VRAM para inferencia: no aplicable; es un servidor de herramientas en Python y no ejecuta calculo en GPU.
- GPU recomendadas: ninguna; funciona en CPU.
- Cabe en cualquier equipo de desarrollo que pueda ejecutar Python y `uv`, incluidos portatiles de gama baja y entornos sin GPU.
- Opciones de despliegue: ejecucion local mediante `uv sync --all-extras` y `uv run hai-mcp`; integracion como servidor MCP por stdio declarandolo en la configuracion del cliente con `command`, `args` y las variables `HAI_HOME` y `HAI_OWNER_HOME`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta pieza.
- Latencia y throughput estimados: no disponibles.
- Requisitos adicionales: permisos de escritura en `HAI_HOME` y `HAI_OWNER_HOME`; salida a red si se usa el canal `ntfy` para entregar codigos de propietario.

## Limitaciones y advertencias

- Licencia no disponible: no hay informacion que permita confirmar si el uso comercial esta autorizado, por lo que conviene aclararlo con el autor antes de adoptarlo en produccion.
- No es un modelo: no genera texto, no razona, no ejecuta codigo por si mismo y no ofrece ninguna capacidad cognitiva; toda la inteligencia reside en el cliente o en el LLM que este use.
- Madurez temprana: se declara explicitamente como v0.1, con 23 herramientas y una sola version de motor de estado; no se documentan garantias de estabilidad de API.
- El repositorio en HuggingFace acumula 0 descargas y 0 likes, sin pipeline declarado, lo que sugiere ausencia de validacion externa por terceros.
- El modo `HAI_OWNER_GATE=ack_legacy` degrada la garantia de aprobacion a un sistema de honor autoafirmado por el agente; usarlo elimina la separacion real entre agente y propietario.
- La owner gate depende de canales externos (fichero local o ntfy): un fallo de entrega del codigo puede bloquear acciones legitimas como aceptar el siguiente paso, recontratar o cerrar una mision.
- Persistencia basada en sistema de ficheros (`$HAI_HOME` y `<project>/Projek-Managment/`), lo que implica dependencia del disco local y de permisos correctos; no se documentan mecanismos de replicacion, backup o concurrencia distribuida.
- El estado y los contratos se almacenan en rutas del equipo del usuario, lo que exige politicas propias de copia de seguridad y de control de acceso si se maneja informacion sensible.
- Posible confusion de nomenclatura: el identificador del repositorio en HuggingFace es `smlflg/hai-mcp-public`, mientras que la model card se refiere al proyecto como `HAI-MCP`, sin que se detalle la relacion exacta entre ambos artefactos.
- Sesgos conocidos y riesgo de alucinacion: no aplicable al servidor; el riesgo de alucinacion corresponde al LLM cliente que consuma las herramientas.
- Idiomas soportados e internacionalizacion: no disponibles; las herramientas y la documentacion citada estan en ingles.

## Enlaces

- HuggingFace: https://huggingface.co/smlflg/hai-mcp-public
- Web canonica del proyecto: https://www.human-agent-interface.com/
- Pagina canonica de HAI-MCP: https://www.human-agent-interface.com/hai-mcp/
- Sobre Samuel Fleig: https://www.human-agent-interface.com/samuel/
- Documentacion de la owner gate: `docs/OWNER_GATE.md`
- Contrato de herramientas: `docs/TOOL_CONTRACT.md`
- Resultados de busqueda web: no se han encontrado enlaces relevantes al proyecto; los resultados devueltos corresponden a temas sin relacion (Pinterest en Zhihu).
