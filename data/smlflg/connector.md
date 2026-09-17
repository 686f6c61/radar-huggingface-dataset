# smlflg/Connector

## Resumen

smlflg/Connector no es un modelo de inteligencia artificial: es un repositorio publicado en HuggingFace que recopila conectores de ejecucion local pensados para actuar como backends MCP (Model Context Protocol) de varios agent hosts. El primer conector incluido, y unico descrito en la documentacion, es una integracion de Google Workspace para el agente Hermes, basada en OAuth personal y limitada a las herramientas de Gmail y Calendar en modo de solo lectura.

El repositorio se creo el 16 de septiembre de 2026 y se actualizo el mismo dia. Ocupa 0,1 GB, acumula 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y su model card esta redactada en aleman. No contiene pesos, tokenizadores, configuraciones de transformers ni artefactos de inferencia: su contenido son arboles de trabajo, ficheros de configuracion y fragmentos YAML de integracion.

Su relevancia es, por tanto, de naturaleza infraestructural y no de modelado. El interes esta en el patron que propone: mantener un unico servidor MCP local con un nombre estable (`google_workspace`) para que un agente principal y sus agentes hijos compartan el mismo backend, con el objetivo declarado de migrar mas adelante a un MCP HTTP centralizado. Para un desarrollador que evalua modelos, este repositorio no aporta datos de capacidad, entrenamiento ni rendimiento, y debe tratarse como una utilidad de integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene una red neuronal, sino conectores MCP sobre transporte stdio |
| Parametros totales | No aplica / no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: el contexto lo determina el agente host, no el conector |
| Tipos de cuantizacion | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | No disponible; la documentacion incluida esta en aleman |
| Licencia | No disponible |
| Formato de pesos | No aplica: no se publican pesos (safetensors, GGUF ni otros) |
| Tipo de artefacto | Repositorio de conectores MCP y ficheros de configuracion |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

No existe entrenamiento. El repositorio no documenta dataset, numero de tokens, composicion de corpus, RLHF, DPO ni ninguna fase de ajuste, porque no contiene un modelo de lenguaje. La "arquitectura" real es una estructura de directorios: `google-workspace/`, que actua como arbol de trabajo local del conector, y `examples/hermes-google-workspace.yaml`, un fragmento minimo de configuracion MCP para Hermes. La documentacion describe tambien la inclusion de ese fragmento en `~/.hermes/config.yaml` y el reinicio del host o la recarga de servidores MCP.

El conector se apoya en un proyecto upstream, `taylorwilsdon/google_workspace_mcp`, fijado al commit `3e9011f3e4d104385a303ef56be83ca3d194d90e`. El modo de operacion declarado es `stdio`, con los modificadores `--single-user`, `--read-only` y `--tools gmail calendar`. Es decir, un unico usuario, sin operaciones de escritura, y exponiendo solo las herramientas de Gmail y Calendar. La documentacion menciona que la migracion futura a un MCP HTTP centralizado esta "preparada" pero deliberadamente desactivada, sin especificar el mecanismo tecnico de esa migracion. No se describen innovaciones de inferencia como decodificacion especulativa, atencion lineal ni arquitecturas hibridas, ya que no aplican.

## Capacidades

- Exposicion de herramientas de Gmail en modo lectura a traves de MCP (listado y consulta de mensajes, segun el alcance del upstream referenciado).
- Exposicion de herramientas de Calendar en modo lectura (consulta de calendarios y eventos).
- Transporte local por stdio, sin necesidad de abrir puertos de red.
- Autenticacion OAuth personal de un unico usuario (`--single-user`).
- Nombre de servidor estable (`google_workspace`) compartido entre un agente principal y sus agentes hijos.
- Integracion declarativa con Hermes mediante un fragmento YAML minimo.
- Preparacion para una futura migracion a MCP HTTP centralizado, no activada.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling generativo ni modo de pensamiento, porque el repositorio no incluye ningun modelo.

## Casos de uso

- Consulta de bandeja de entrada desde un agente local: un host Hermes conectado a este conector puede listar y leer correos de Gmail sin salir del entorno local, ya que el transporte stdio no expone puertos de red y el modo `--read-only` impide modificaciones.
- Preparacion de la agenda diaria: el agente puede leer los eventos de Calendar y resumirlos o cruzarlos con correos relevantes, siempre en modo consulta, lo que evita escrituras accidentales sobre el calendario personal.
- Backend compartido entre agente principal y agentes hijos: al fijar un unico nombre de servidor MCP (`google_workspace`), varios agentes de un mismo host reutilizan la misma sesion OAuth en lugar de duplicar credenciales y configuracion.
- Triage de correo con intervencion humana: el agente clasifica y resume mensajes para que el usuario decida las acciones; el conector no puede enviar ni borrar, de modo que el riesgo de una accion destructiva automatizada queda acotado por diseno.
- Laboratorio de desarrollo de conectores MCP: `google-workspace/config/local.env.example` sirve como plantilla para reproducir el entorno en otra maquina, util para probar el patron single-user y read-only antes de generalizarlo a otros servicios.
- Auditoria de accesos de solo lectura: en entornos donde se necesita que un agente consulte informacion corporativa sin capacidad de escritura, el modo restringido a `gmail calendar` reduce la superficie de permisos que hay que justificar.
- Base para la migracion a MCP HTTP: equipos que hoy operan por stdio pueden usar esta estructura como punto de partida y sustituir el transporte cuando activen el MCP centralizado que la documentacion deja preparado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable, por lo que metricas como MMLU, HumanEval o GSM8K no aplican. Tampoco se documentan medidas de latencia, throughput ni consumo de memoria del conector.

## Requisitos de hardware

- No hay pesos que cargar, por lo que no existe requisito de VRAM para el modelo en si.
- El coste de computo corresponde al servidor MCP upstream y al agente host, cuyas necesidades no especifica la documentacion: no disponible.
- No se requiere GPU; el conector es un proceso local de integracion y no realiza inferencia.
- Cabe en cualquier equipo de consumo capaz de ejecutar el agente host y el servidor MCP referenciado, dado que el repositorio ocupa 0,1 GB en disco.
- Almacenamiento: 0,1 GB para el repositorio, mas el espacio del proyecto upstream y del entorno del agente.
- Opciones de despliegue: transporte stdio gestionado por el host MCP (el ejemplo incluido es para Hermes); no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: dependen de las llamadas a las API de Google Workspace y de la implementacion upstream; no disponible.
- Gestion de credenciales: la documentacion indica derivar un `local.env` a partir de `local.env.example` y rellenar las variables necesarias; no se detalla el mecanismo de almacenamiento seguro.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje ni comparte categoria con modelos de parametros comparables, por lo que no procede contrastar parametros, contexto, rendimiento o licencia frente a alternativas tipo LLM. Como referencia de categoria, la unica implementacion citada en la documentacion es el proyecto upstream `taylorwilsdon/google_workspace_mcp` en su commit `3e9011f3e4d104385a303ef56be83ca3d194d90e`, respecto al cual este repositorio actua como envoltorio de configuracion y no como alternativa.

## Limitaciones y advertencias

- No es un modelo de IA. Evaluarlo con criterios de benchmarks, contexto o cuantizacion carece de sentido y puede inducir a error en un catalogo de modelos.
- La licencia no esta declarada, ni para este repositorio ni de forma explicita en la informacion disponible. Antes de cualquier uso comercial debe aclararse la licencia del repositorio y la del proyecto upstream referenciado.
- Sin licencia declarada y con 0 descargas y 0 likes, no existe validacion de la comunidad ni garantia de mantenimiento; el repositorio podria modificarse o retirarse sin aviso.
- Alcance funcional muy reducido: solo Gmail y Calendar, solo lectura, solo un usuario. No sirve para escenarios multiusuario, ni para enviar correo, crear eventos o modificar recursos.
- El modo `--read-only` no elimina el riesgo de exposicion de datos: el agente puede leer contenido sensible del correo y del calendario, y trasladarlo al contexto del modelo o a registros del host.
- Las credenciales OAuth se gestionan mediante un fichero `local.env` en el arbol de trabajo. Un manejo descuidado de ese fichero (permisos, control de versiones, copias) puede filtrar el token de acceso personal.
- El conector esta fijado a un commit concreto del upstream y no se documenta politica de actualizacion, versionado semantico ni pruebas automatizadas.
- La documentacion esta en aleman y no se ofrecen versiones en castellano ni en ingles, lo que limita su adopcion fuera de ese idioma.
- El README emplea rutas absolutas locales (por ejemplo `/home/smlflg/Projekte/Connector/...`) que no son validas en otras maquinas y deben reinterpretarse de forma relativa.
- La migracion a MCP HTTP centralizado se describe como preparada pero no activada; quien la necesite tendra que implementarla por su cuenta.
- Los resultados de busqueda web disponibles no aportan informacion sobre este repositorio: son paginas de soporte de Microsoft (inicio de sesion en Hotmail, cierre de cuentas de Outlook, actualizaciones de Exchange Server, frecuencia de refresco en Windows) sin relacion con el artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smlflg/Connector
- Proyecto upstream citado en la model card: `taylorwilsdon/google_workspace_mcp` (commit fijado `3e9011f3e4d104385a303ef56be83ca3d194d90e`); la model card no proporciona URL.
- Fichero de configuracion de ejemplo citado: `google-workspace/config/local.env.example`.
- Fragmento de integracion citado: `examples/hermes-google-workspace.yaml`.
- No se han encontrado papers, blogs, demos ni repositorios adicionales en los resultados de busqueda proporcionados.
