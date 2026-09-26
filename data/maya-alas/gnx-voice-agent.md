# Maya-alas/gnx-voice-agent

## Resumen

GNX Voice Agent (v0.0.1) es un repositorio publicado en Hugging Face bajo el identificador `Maya-alas/gnx-voice-agent` que **no contiene un modelo de IA**, sino una aplicacion de composicion escrita en Node.js. Segun su propia model card, GNX "compone servicios existentes; no los reconstruye": el texto es el protocolo canonico, MCP (Model Context Protocol) aporta capacidades y control, `HF_TOKEN` actua como credencial principal de nube publica, OmniRoute como pasarela de IA privada, Oryx como runtime de voz y media, y una PWA como interfaz. GNX se limita a la configuracion, la composicion y la correlacion entre esos componentes.

El artefacto se presenta como "first-pass source code", entregado sin instalar dependencias, sin ejecutar la aplicacion y sin ejecutar pruebas. El autor indica explicitamente que no esta endurecido para produccion y que no se utilizaron subagentes en su desarrollo. No hay pesos, no hay ficha de entrenamiento y no hay licencia declarada en la informacion disponible.

Su relevancia potencial es arquitectonica, no de rendimiento: ejemplifica un patron en el que una interfaz de voz ligera delega la inferencia en un proveedor externo seleccionable (Hugging Face o una pasarela compatible con OpenAI) y la sintesis de voz en un runtime separado, manteniendo las credenciales en el servidor y usando MCP como capa de capacidades intercambiables. Con 0 descargas y 0 likes en el momento del analisis, se trata de un baseline inicial, no de un componente validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de IA. Aplicacion Node.js: API Express delgada + cliente y servidor MCP (stdio y Streamable HTTP) que orquesta servicios externos |
| Parametros totales | No disponible (depende del modelo externo configurado en `HF_MODEL` o `OMNIROUTE_MODEL`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la determina el proveedor externo; la ruta por defecto no envia mensajes previos) |
| Tipos de cuantizacion | No disponible (no distribuye pesos) |
| Idiomas soportados | No disponible; el campo `locale` es configurable por peticion (ejemplo de la model card: `en-US`) |
| Licencia | No disponible |
| Formato de pesos | No aplica; no incluye pesos. Solo codigo fuente y archivos de configuracion |
| Runtime requerido | Node.js 22 o superior y npm |
| Transportes MCP soportados | stdio (servidor integrado `npm run mcp`) y Streamable HTTP (servicios remotos) |
| Capacidades integradas | `model_complete` (chat completions en HF u OmniRoute) y `voice_speak` (puente a un despliegue Oryx) |
| Persistencia | Ninguna: referencias de correlacion en memoria, con caducidad. Sin base de datos ni historial de mensajes |
| Autenticacion | Token de despliegue compartido opcional. Sin OIDC |
| Instalacion | `npm install` y `npm start`; sin lockfile incluido en el repositorio |

## Arquitectura y entrenamiento

No existe entrenamiento: GNX no entrena ni ajusta ningun modelo. La arquitectura descrita es un flujo de ejecucion en dos caminos. El camino de datos es `PWA → texto → API delgada → MCP model.complete → Hugging Face | OmniRoute → texto final` y, de forma opcional, `MCP voice.speak → Oryx → URL de audio → PWA`. El camino de control se resuelve con variables de entorno y `config/mcp.json`, que define que servidor MCP y que herramienta respaldan cada capacidad. GNX nunca actua como proxy ni almacena audio, nunca envia credenciales de Hugging Face al navegador y no restaura Oryx AI-Talk.

Entre las piezas implementadas figuran: API Express con servicio de estaticos, cliente y servidor MCP reales (stdio y Streamable HTTP), capacidad `model_complete` contra chat completions de HF u OmniRoute, capacidad `voice_speak` contra un puente configurable de Oryx, sustitucion de cualquiera de las dos capacidades por un servicio MCP existente, referencias de correlacion en memoria acotadas y con caducidad, token de despliegue compartido opcional, limites de entrada y de turnos concurrentes, renderizado seguro de texto, UI de texto con STT de navegador opcional, transcripcion editable y reproduccion explicita de audio, ademas de un service worker de PWA.

La model card declara limites deliberados: la capacidad de modelo incluida es **una completion sin estado**, no un agente autonomo; no selecciona ni ejecuta otras herramientas. Para razonamiento con herramientas hay que enlazar `model.complete` a una capacidad MCP externa que implemente ese comportamiento y respete el contrato. Los identificadores de correlacion no crean memoria conversacional en endpoints sin estado. No hay streaming, ni barge-in, ni proteccion de replay duradera, ni ciclo de vida transaccional.

## Capacidades

- Interfaz de texto sobre PWA con servicio de estaticos y service worker de shell estatica.
- STT opcional en el navegador, con transcripcion editable antes del envio.
- Sintesis de voz delegada: `voice.speak` invoca un despliegue Oryx externo y devuelve una URL de audio para reproduccion explicita.
- Completion de texto sin estado mediante `model.complete`, enrutable a Hugging Face (ruta publica) o a OmniRoute (ruta privada, pasarela compatible con OpenAI).
- Cliente y servidor MCP: conexiones stdio y Streamable HTTP, con `npm run mcp` para arrancar el servidor stdio integrado ante un host MCP externo.
- Reemplazo de capacidades por servicios MCP preexistentes sin modificar el nucleo de la aplicacion.
- Contrato de peticion comun a ambas capacidades: `session_id`, `turn_id`, `text`, `locale` y `refs`.
- Referencias de correlacion acotadas y con caducidad, mantenidas en memoria.
- Controles operativos basicos: token de despliegue compartido opcional, limites de entrada, limites de turnos concurrentes, renderizado seguro de texto y errores genericos hacia el cliente.
- Conservacion del texto cuando falla la sintesis de voz, sin fallback silencioso de proveedor ni reenvio automatico de peticiones.
- **No incluye**: seleccion o ejecucion autonoma de herramientas, memoria conversacional en la ruta por defecto, streaming, barge-in, OIDC, SQLite, colas, registro de artefactos, replicacion de estado ni servicio multi-tenant.

## Casos de uso

- Prototipo de asistente de voz con MCP: sirve como base para montar una interfaz PWA de texto y voz que delega la inferencia en un proveedor configurable, sin escribir el pegamento entre UI, modelo y TTS.
- Enrutado dual publico/privado de inferencia: con `CLOUD_ROUTE=public` y `HF_TOKEN` se usa Hugging Face; con `CLOUD_ROUTE=private` y `OMNIROUTE_BASE_URL`/`OMNIROUTE_MODEL` se dirige el trafico a una pasarela propia. Util para separar entornos de desarrollo y de datos sensibles manteniendo una sola interfaz.
- Integracion de un motor TTS corporativo: si la organizacion ya dispone de un despliegue Oryx que expone el contrato de puente, basta con configurar `ORYX_BASE_URL`, `ORYX_TOKEN` y `ORYX_VOICE_PATH` y activar `VOICE_ENABLED` para anadir sintesis de voz sin reescribir el cliente.
- Validacion de contratos MCP de terceros: la aplicacion permite apuntar `model.complete` a un servicio remoto mediante transporte HTTP con `url` y `token_env`, lo que la convierte en una herramienta practica para comprobar que un servicio MCP acepta los argumentos de GNX y devuelve JSON en un bloque de contenido de texto.
- Demostracion de modelos alojados en Hugging Face: seleccionando `HF_MODEL` se puede evaluar cualitativamente el comportamiento conversacional de un modelo en una interfaz de voz, teniendo en cuenta que la model card advierte que una suscripcion PRO no garantiza disponibilidad ni gratuidad de todos los modelos y proveedores.
- Base para una arquitectura MCP-first en un equipo: el codigo ejemplifica como separar capacidades (`model.complete`, `voice.speak`) de implementaciones, de modo que sustituir un proveedor de inferencia o de voz sea un cambio de configuracion en `config/mcp.json`.
- Entorno de despliegue unico con control de acceso minimo: para demos internas o pruebas de integracion donde basta con un token de despliegue compartido, limites de turnos concurrentes y errores genericos, sin necesidad de desplegar un servicio multi-tenant.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad, latencia ni throughput, y el repositorio no contiene pesos ni evaluaciones. El rendimiento dependera enteramente del modelo externo seleccionado en `HF_MODEL` o `OMNIROUTE_MODEL` y del despliegue de Oryx para la parte de voz.

## Requisitos de hardware

- Para ejecutar GNX: Node.js 22 o superior y npm. El consumo local de recursos es el de un proceso Node con una API Express delgada y sin base de datos; no requiere GPU si la inferencia se delega en servicios remotos.
- VRAM para inferencia: no aplica a GNX en la ruta publica o privada, porque la generacion de texto y la sintesis de voz ocurren en servicios externos. Si se autoaloja el modelo apuntado por `HF_MODEL`, la VRAM necesaria dependera de ese modelo concreto, que no esta especificado en la informacion disponible.
- GPU recomendadas: no disponible. La eleccion depende del modelo y del runtime de voz externos, no del repositorio analizado.
- Compatibilidad con GPU de consumo: no disponible por la misma razon; GNX en si mismo no consume VRAM.
- Opciones de despliegue: `npm install` + `npm start` para el backend con servicio de estaticos; `npm run dev` para el watcher de ficheros de Node; `npm run mcp` para levantar el servidor MCP stdio integrado ante un host MCP externo. La model card menciona el uso de un proxy inverso del servidor para servir en `https://voice.gnx`, y `http://127.0.0.1:8080` para desarrollo local. No se documentan imagenes de contenedor ni manifiestos de despliegue.
- Latencia y throughput: no disponibles. El flujo es sincrono (el texto se devuelve tras el intento opcional y acotado de voz) y sin streaming, por lo que la latencia percibida dependera de los servicios externos.
- Restricciones operativas relevantes: aplicacion de instancia unica y un unico principal de despliegue, estado en memoria que se pierde al reiniciar, sin lockfile incluido y sin persistencia de historial.

## Comparativa con modelos similares

GNX Voice Agent no es comparable con modelos de lenguaje: no tiene parametros, pesos ni benchmarks. La categoria comparable es la de frameworks de orquestacion de agentes de voz (por ejemplo, stacks que combinan STT, un LLM y TTS sobre una capa de herramientas). No se dispone de datos verificados sobre esos frameworks en la informacion proporcionada, por lo que cualquier cifra seria especulativa.

| Aspecto | GNX Voice Agent | Alternativas de orquestacion de voz |
|---|---|---|
| Parametros | No aplica (no es un modelo) | No disponible en la informacion proporcionada |
| Longitud de contexto | No disponible (la fija el proveedor externo) | No disponible en la informacion proporcionada |
| Rendimiento | No se han publicado benchmarks | No disponible en la informacion proporcionada |
| Licencia | No disponible | No disponible en la informacion proporcionada |
| Disponibilidad | Repositorio en Hugging Face con 0 descargas y 0 likes, sin lockfile y sin pruebas | No disponible en la informacion proporcionada |
| Modelo de composicion | MCP como capa de capacidades; proveedor de inferencia y runtime de voz intercambiables por configuracion | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo: no debe evaluarse como tal ni citarse con parametros, contexto o benchmarks inexistentes.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Es un bloqueante para produccion.
- Codigo de primera pasada: el autor indica que se entrego sin instalar dependencias, sin ejecutar la aplicacion y sin ejecutar pruebas. No esta endurecido para produccion.
- Sin lockfile: la model card senala que no se incluye porque las dependencias no se han instalado, y recomienda generar y confirmar uno al validar el baseline. Esto implica builds no reproducibles.
- Sin memoria conversacional en la ruta por defecto: las completion de HF y OmniRoute son sin estado y no reciben mensajes previos. Los identificadores de correlacion no crean contexto.
- Sin agente autonomo: la capacidad de modelo incluida no selecciona ni ejecuta herramientas. Cualquier comportamiento agentico depende de un servicio MCP externo.
- Sin streaming ni barge-in: las peticiones son sincronas y el texto se devuelve despues del intento acotado de voz. Los reintentos del navegador pueden repetir trabajo en el proveedor.
- Sin proteccion de replay duradera ni transaccionalidad: un reinicio pierde los mapeos de correlacion.
- No es multi-tenant: la model card lo describe como baseline de instancia unica y un unico principal de despliegue. Tampoco incluye OIDC, SQLite, colas ni registro de artefactos.
- Riesgo operativo en MCP local: los procesos hijo stdio heredan las variables de entorno del servidor, por lo que solo deben configurarse servidores de confianza. Los nombres de herramienta no se aceptan desde la entrada del navegador.
- Riesgo de fuga de credenciales si se modifica el diseno: el modelo de seguridad descrito depende de mantener los secretos en el servidor y el fichero `.env` fuera de Git.
- Privacidad dependiente del upstream: la model card advierte que, en la ruta privada, la privacidad depende de los proveedores aguas arriba de la pasarela.
- Disponibilidad del proveedor: una suscripcion PRO de Hugging Face no garantiza que todos los modelos o proveedores esten disponibles ni que sean gratuitos.
- Salud del servicio: `/health/live` informa de la vitalidad del proceso, no de la disponibilidad de los servicios externos.
- Metadatos a revisar: la ficha de Hugging Face registra fecha de creacion y actualizacion en 2026-09-25, con un segundo de diferencia entre ambas, lo que sugiere metadatos incompletos o incorrectos.
- La model card disponible esta truncada en el momento del analisis (el bloque citado termina a mitad del contrato de `voice_speak`), por lo que el contrato de voz no puede verificarse por completo.
- Ficha sin idiomas, sin pipeline y sin licencia declarados en Hugging Face; los resultados de la busqueda web realizada no guardan relacion con el repositorio (corresponden a la civilizacion maya, al software Autodesk Maya y a un servicio medico), por lo que no aportan informacion tecnica utilizable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Maya-alas/gnx-voice-agent
- No se han encontrado en la busqueda web enlaces relevantes al proyecto: los resultados obtenidos (Wikipedia sobre la civilizacion maya, Autodesk Maya y Maiia) son ajenos a este repositorio. No hay paper, blog, repositorio de codigo ni demo adicionales en la informacion disponible.
