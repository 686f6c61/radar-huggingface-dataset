# Snapkitty/myapplication

## Resumen

SnapKitty Bot es una aplicación de servidor Express escrita en TypeScript que actúa como interfaz de Discord para el sistema operativo soberano SnapKitty. No se trata de un modelo de inteligencia artificial, sino de un bot que enruta consultas de usuarios hacia un motor de razonamiento basado en Ollama alojado en collectivekitty.com. El repositorio en HuggingFace (Snapkitty/myapplication) contiene el código fuente de este bot, no pesos de un modelo.

El bot gestiona 11 agentes especializados (finanzas, tesorería, CRM, compras, riesgo, auditoría, etc.) y ofrece comandos slash para interactuar con ellos, así como para gestionar pools de dinero, consultar el estado del sistema y leer el registro de auditoría Bifrost. Se conecta a una base de datos Neon PostgreSQL mediante Prisma y valida todas las peticiones de Discord con firmas Ed25519.

La relevancia de este proyecto radica en su enfoque de "sistema operativo soberano" con agentes autónomos, pero no aporta ningún modelo de lenguaje propio. Toda la capacidad de razonamiento proviene de un LLM local vía Ollama, del cual no se especifican detalles en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (aplicacion Node.js/Express, no un modelo de IA) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (la interfaz esta en ingles) |
| Licencia | BUSL-1.1 (segun badge en la model card) |
| Formato de pesos | No aplicable (codigo fuente TypeScript) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. Es una aplicacion de servidor que implementa un bot de Discord. La arquitectura consiste en un servidor Express que recibe interacciones via webhook, valida la firma Ed25519 de cada peticion, y enruta los comandos a traves de Prisma hacia una base de datos Neon PostgreSQL. Las consultas `/ask` se envian a un motor de razonamiento Ollama alojado en collectivekitty.com, del cual no se proporcionan detalles sobre el modelo subyacente, datos de entrenamiento ni tecnicas de optimizacion.

El sistema completo (DEVFLOW-FINANCE) incluye un nucleo en Rust con un ledger WORM basado en SHA-256, una maquina de estados de 5 niveles, un panel Next.js y un pipeline de eventos Bifrost. No hay informacion sobre entrenamiento, dataset o RLHF.

## Capacidades

- Gestion de conversaciones multi-turno en Discord mediante comandos slash.
- Enrutamiento de preguntas a 11 agentes especializados (RELAY, AXIOM, VAULT, NEXUS, FORGE, HERALD, TENSOR, SENTINEL, LEDGE, ATLAS, QUILL).
- Creacion, listado, financiacion y cierre de pools de dinero.
- Consulta del nivel de fundabilidad (tier) y sus bloqueadores.
- Lectura del registro de auditoria Bifrost (ultimos 5 eventos con puntuaciones de riesgo).
- Consulta del ultimo hash de sello de decision y raiz de Merkle.
- Verificacion de estado del sistema (salud de Bifrost, base de datos e infraestructura).
- Validacion de firmas Ed25519 para todas las peticiones entrantes.
- Integracion con base de datos PostgreSQL mediante Prisma.
- Razonamiento delegado a un LLM local via Ollama (sin dependencia de OpenAI).

## Casos de uso

- Gestion financiera en Discord: el bot permite a un equipo crear pools de capital, consultar saldos y cerrar pools mediante comandos `/pool`, facilitando la administracion de fondos sin salir de la plataforma de chat.
- Consulta de estado de cartera de clientes: el agente NEXUS (dominio CRM) responde preguntas sobre pipeline, deals y previsiones a traves de `/ask nexus [mensaje]`, permitiendo a comerciales obtener informacion actualizada al instante.
- Supervision de riesgos y cumplimiento: el agente SENTINEL (dominio riesgo) proporciona puntuaciones de amenaza y alertas de compliance, consultables via `/ask sentinel`, util para equipos de auditoria interna.
- Auditoria y trazabilidad: los comandos `/audit`, `/seal` y `/merkle` permiten revisar el registro WORM de eventos, el ultimo sello de decision y la raiz de Merkle, garantizando la integridad de las operaciones.
- Automatizacion de reportes: el agente QUILL (scriptwriter) genera informes, presentaciones y copy a partir de datos del sistema, accesible mediante `/ask quill`, reduciendo el trabajo manual de documentacion.
- Operaciones de tesoreria: el agente VAULT (tesoreria) gestiona reservas y pagos, con autoridad de veto, consultable via `/ask vault`, permitiendo decisiones de tesoreria en tiempo real desde Discord.
- Monitorizacion de infraestructura: el comando `/status` muestra la salud de Bifrost, la base de datos y la infraestructura, util para equipos de DevOps que necesitan alertas tempranas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen metricas de MMLU, HumanEval, GSM8K u otras. El rendimiento del bot depende del servidor Node.js y del motor Ollama subyacente, del cual no se especifican datos.

## Requisitos de hardware

- Aplicacion Node.js ligera: requiere un servidor con Node.js 18+ y acceso a una base de datos PostgreSQL (Neon).
- El motor de razonamiento Ollama se ejecuta en collectivekitty.com, por lo que el bot no necesita GPU local.
- Para desarrollo local, basta con un equipo con Node.js y npm; se recomienda usar ngrok o Cloudflare Tunnel para exponer el puerto 3001.
- En produccion, un VPS de gama baja (1 vCPU, 1 GB RAM) es suficiente para el servidor Express, siempre que el motor Ollama este alojado externamente.
- No se requieren GPUs ni aceleradores para el bot en si.

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo de lenguaje comparable con alternativas como Llama, Mistral o Qwen. Se trata de una aplicacion de bot que utiliza un LLM externo via Ollama, sin especificar que modelo concreto emplea.

## Limitaciones y advertencias

- No es un modelo de IA: el repositorio contiene codigo de una aplicacion, no pesos de un modelo. Cualquier uso como modelo de lenguaje es incorrecto.
- Dependencia de un servicio externo: el razonamiento depende de la disponibilidad de Ollama en collectivekitty.com; si ese servicio cae, el bot pierde su capacidad de respuesta.
- Licencia BUSL-1.1: es una licencia de codigo fuente con restricciones de uso comercial hasta que se convierta a una licencia de codigo abierto (tipicamente tras 4 años). Verificar los terminos exactos en el archivo LICENSE.
- Sin informacion sobre el modelo subyacente: no se especifica que LLM usa Ollama, por lo que no se pueden evaluar sesgos, alucinaciones o limitaciones de contexto.
- Idioma: la interfaz y la documentacion estan en ingles; no se garantiza soporte multilingue.
- Seguridad: aunque valida firmas Ed25519, la gestion de pools de dinero y datos financieros requiere una auditoria de seguridad adicional antes de usarse en produccion.
- Fecha de creacion futura: el repositorio esta fechado el 2026-09-03, lo que sugiere que podria ser un proyecto experimental o con datos incorrectos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/myapplication
- Sitio web del proyecto: https://collectivekitty.com
- Repositorio DEVFLOW-FINANCE: https://github.com/SNAPKITTYWEST/DEVFLOW-FINANCE
- Invitacion al servidor de Discord: https://discord.gg/dugymT3rj
