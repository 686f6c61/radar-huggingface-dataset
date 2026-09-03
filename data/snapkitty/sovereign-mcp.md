# Snapkitty/sovereign-mcp

## Resumen

Sovereign MCP es un servidor de infraestructura para IA, no un modelo de lenguaje. Publicado por Snapkitty en HuggingFace, se presenta como una capa de orquestacion que enruta peticiones entre proveedores de IA (Amazon Bedrock, Groq y Ollama) con conmutacion automatica por error, verificacion determinista de salidas, firma criptografica Ed25519 y registro de auditoria inmutable tipo WORM. El problema que resuelve es la dependencia de un unico proveedor, la falta de verificabilidad de las respuestas de IA y la ausencia de trazabilidad en entornos empresariales.

Distribuido como un unico archivo JavaScript (sovereign-mcp.mjs) sin paso de compilacion, el servidor implementa el protocolo MCP (Model Context Protocol) y puede ejecutarse en modo stdio o HTTP. No se trata de un modelo entrenado: no tiene pesos, parametros ni contexto propio, sino que actua como pasarela inteligente que delega la generacion de texto en los proveedores configurados. Su relevancia actual radica en la creciente demanda de herramientas de gobernanza y auditoria para sistemas de IA en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (no es un modelo de lenguaje; es un servidor MCP en Node.js) |
| Parametros totales | No aplicable |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (depende del proveedor subyacente) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el README indica "[Your license here]") |
| Formato de pesos | No aplicable (codigo fuente JavaScript, sin pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado con datos, por lo que no hay proceso de entrenamiento, dataset ni tecnica de alineacion (RLHF, DPO, etc.). Es un servidor de software escrito en JavaScript/Node.js que implementa el protocolo MCP. Su arquitectura interna incluye un enrutador con cascada de proveedores (Bedrock primero, Groq segundo, Ollama tercero, error duro si todos fallan), un sistema de verificacion determinista llamado ERE con cinco compuertas (P1 a P5) que bloquea salidas que contengan respuestas vacias, stubs "TODO", operaciones criptograficas en el limite incorrecto, secretos hardcodeados o problemas de integridad estructural. Ademas, firma cada respuesta con Ed25519 y mantiene un registro de auditoria append-only estilo WORM.

Incluye un lenguaje de instrucciones propio llamado Magma (sintaxis §VERB:AGENT:ACTION{payload}) que permite componer pipelines de operaciones, y un sistema de enrutamiento de agentes con prompts de sistema especializados (forge, oracle, sentinel, vault). La unica dependencia opcional es @aws-sdk/client-bedrock-runtime para el proveedor de AWS.

## Capacidades

- Enrutamiento de peticiones entre multiples proveedores (Bedrock, Groq, Ollama) con conmutacion automatica por error y sin degradacion silenciosa.
- Verificacion determinista de salidas mediante cinco compuertas ERE que bloquean respuestas invalidas antes de que salgan del sistema.
- Firma criptografica Ed25519 de cada respuesta, con exportacion de clave publica para verificacion externa.
- Registro de auditoria inmutable tipo WORM con recibos a prueba de manipulacion.
- Soporte de tool calling a traves del protocolo MCP, con herramientas como compute_route, ere_verify, magma_seal, agent_dispatch, magma_exec, proxy_register, proxy_list y governor_pubkey.
- Composicion de pipelines de instrucciones mediante el lenguaje Magma con encadenamiento de operaciones (operador >>).
- Registro de servicios proxy externos como herramientas invocables.
- Ejecucion self-hosted sin dependencia de nube, con modo stdio (Claude Code, VSCode) y modo HTTP (cualquier cliente).
- Definicion de agentes especializados con prompts de sistema personalizados.

## Casos de uso

- Auditoria de IA en entornos regulados: la firma Ed25519 y el registro WORM permiten demostrar que una respuesta concreta fue generada en un momento determinado por el sistema, lo que facilita el cumplimiento normativo en sectores como finanzas o salud.

- Conmutacion por error entre proveedores: si Amazon Bedrock falla o cambia sus precios, el enrutador pasa automaticamente a Groq o a Ollama local sin cambios en el codigo de la aplicacion, garantizando disponibilidad en produccion.

- Despliegue de IA en infraestructura propia: empresas que no pueden enviar datos a terceros pueden ejecutar el servidor en su propia red y conectar exclusivamente Ollama, manteniendo la verificacion y el registro de auditoria sin salir de su entorno.

- Integracion con asistentes de desarrollo: mediante el modo stdio, el servidor se conecta a Claude Code o VSCode a traves de .mcp.json, permitiendo que el asistente enrute sus peticiones a traves de la cascada de proveedores con verificacion previa.

- Orquestacion de agentes especializados: el sistema permite definir agentes con prompts de sistema especificos (forge para construir codigo, oracle para consultas con citas, sentinel para seguridad, vault para finanzas) y enrutar tareas al agente adecuado, con verificacion de salida en todos los casos.

- Registro de servicios externos como herramientas: proxy_register permite exponer servicios propios como herramientas invocables por el modelo, ampliando las capacidades del sistema sin modificar el servidor.

- Generacion de codigo con verificacion de calidad: el agente forge con la compuerta P2 bloquea salidas con stubs o "TODO", lo que lo hace util para pipelines de CI/CD donde se requiere codigo completo y funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de lenguaje, no existen metricas de MMLU, HumanEval o GSM8K asociadas a este proyecto. El rendimiento real depende del proveedor subyacente al que se enruten las peticiones.

## Requisitos de hardware

- No requiere GPU ni hardware especializado: es un servidor Node.js que se ejecuta en cualquier maquina con Node.js instalado (version moderna, sin requisito especificado).
- Requisitos minimos de memoria: el servidor en si es ligero; la memoria real consumida depende del proveedor local (Ollama) si se usa.
- Si se usa Ollama como proveedor local, los requisitos de hardware dependen del modelo de lenguaje que se cargue en Ollama.
- Para Bedrock y Groq no se necesita hardware local mas alla del servidor, ya que la inferencia ocurre en la nube.
- Opciones de despliegue: ejecucion directa con node, integracion con Claude Code, VSCode, BobIDE, o cualquier cliente MCP via HTTP.

## Comparativa con modelos similares

No disponible. Este proyecto no es un modelo de lenguaje, sino un servidor de infraestructura MCP. No existen modelos comparables en el sentido tradicional (parametros, contexto, benchmarks). Como pasarela de IA, podria compararse con soluciones como LiteLLM o OpenRouter, pero no se dispone de datos de rendimiento o adopcion para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por si mismo y no puede responder peticiones sin un proveedor configurado.
- La licencia no esta especificada en el repositorio (el README contiene el placeholder "[Your license here]"), lo que genera incertidumbre legal para uso comercial.
- El proyecto tiene cero descargas y cero likes en HuggingFace, lo que indica que no ha sido probado en produccion ni validado por la comunidad.
- La verificacion ERE es determinista y basada en reglas; puede generar falsos positivos (bloquear respuestas validas) o no detectar problemas semanticos mas alla de los patrones definidos.
- Depende de la disponibilidad de los proveedores externos; si ninguno esta configurado o disponible, el sistema devuelve un error duro sin respuesta.
- El registro WORM es append-only, pero la implementacion concreta del almacenamiento persistente no esta documentada en la informacion disponible.
- Los agentes definidos (forge, oracle, sentinel, vault) son ejemplos de configuracion y no garantizan el comportamiento descrito en sus prompts de sistema.
- No hay informacion sobre los idiomas soportados, ya que el servidor no procesa lenguaje directamente.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/sovereign-mcp
- GitHub (SNAPKITTYWEST/sovereign-mcp): https://github.com/SNAPKITTYWEST/sovereign-mcp
- GitHub (SNAPKITTYWEST/snapkitty-mcp): https://github.com/SNAPKITTYWEST/snapkitty-mcp
- HuggingFace (Snapkitty/sovereign-router): https://huggingface.co/Snapkitty/sovereign-router
- Glama (Sovereign MCP): https://glama.ai/mcp/servers/SNAPKITTYWEST/sovereign-mcp
- Perfil HuggingFace de Snapkitty Collective: https://huggingface.co/Snapkitty
