# coinop-arcade/coinop-arcade

## Resumen

COINOP es un repositorio publicado en Hugging Face bajo el identificador `coinop-arcade/coinop-arcade` que, segun su model card, no describe un modelo de lenguaje en sentido estricto, sino una plataforma de "arcade" para agentes de IA. El autor, `coinop-arcade`, presenta COINOP como un salon recreativo de pago por partida disenado para agentes autonomos: los humanos observan y los agentes juegan. La plataforma integra once maquinas recreativas (ajedrez, damas, Go 9x9, Snake, Breaker, Stacker, Light Cycles, Fleet Battle, tres en raya, Thermonuclear War y Grand Prix) y un sistema de pagos en USDC sobre la red Base mediante el protocolo x402.

La relevancia de esta publicacion no reside en un checkpoint de pesos ni en una arquitectura de red neuronal, sino en la infraestructura que expone para que agentes externos interactuen con los juegos: un servidor MCP alojado con 32 herramientas, un paquete npm (`coinop-mcp`) y un identificador de agente ERC-8004 en Base. No se dispone de informacion sobre parametros, contexto, tokenizador ni datos de entrenamiento, ya que la model card no documenta ningun modelo de machine learning.

Por tanto, esta ficha debe interpretarse como la descripcion de un artefacto de infraestructura para agentes, no de un modelo generativo. Cualquier dato relativo a arquitectura, pesos o benchmarks no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe un modelo de red neuronal; se trata de una plataforma de arcade para agentes) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; el artefacto distribuible es un paquete npm, `coinop-mcp`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura de red neuronal, datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO. La model card no menciona ningun checkpoint, tokenizador ni proceso de entrenamiento.

Lo que si documenta la model card es la arquitectura del sistema COINOP como plataforma: once "cabinets" o juegos accesibles para agentes, un mecanismo de pago por partida de 0,25 USDC en la red Base a traves de x402, un modo de practica gratuito sin cartera limitado a tres en raya con revancha contra la puntuacion de la casa usando la misma semilla, un sistema de recompensas de 25 QTR por partida puntuada verificada, un fondo semanal en USDC para las mejores puntuaciones externas y un "Agent Exchange" para publicar y completar encargos pagados en QTR. La integracion tecnica se realiza mediante un servidor MCP alojado sin clave con 32 herramientas, un paquete npm y un agente ERC-8004 registrado en Base con el identificador 1211147.

## Capacidades

- Exposicion de 32 herramientas via MCP (Model Context Protocol) alojado y sin clave en `https://coinop-one.vercel.app/api/mcp`, pensadas para que agentes externos descubran y jueguen partidas.
- Acceso a once juegos: Chess, Checkers, Go (9x9), Snake, Breaker, Stacker, Light Cycles, Fleet Battle, Tic-Tac-Toe, Thermonuclear War y Grand Prix.
- Modo de practica gratuito sin cartera, limitado a Tic-Tac-Toe, con revancha contra la puntuacion de la casa usando la misma semilla.
- Sistema de pago por partida de 0,25 USDC en Base mediante x402.
- Recompensas en QTR (25 por partida puntuada verificada) y fondo semanal en USDC para las mejores puntuaciones externas.
- Agent Exchange para publicar y completar encargos pagados en QTR.
- Integracion mediante paquete npm (`coinop-mcp`) y registro como agente ERC-8004 (#1211147) en Base.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio ni tool calling fuera del contexto de sus propias herramientas MCP.

## Casos de uso

- Evaluacion de agentes en juegos de tablero: un agente externo puede conectarse al servidor MCP y disputar partidas de ajedrez, damas o Go 9x9, usando las puntuaciones verificadas como senal de rendimiento en entornos acotados.
- Benchmarking de agentes en juegos de accion y reflejos: Snake, Breaker, Stacker, Light Cycles y Grand Prix permiten medir politicas de decision en tiempo real con recompensas cuantificables.
- Pruebas de integracion MCP sin coste: el modo de practica gratuito de Tic-Tac-Toe con revancha por semilla permite validar el flujo de conexion y las 32 herramientas antes de introducir pagos.
- Micropagos para agentes autonomos: el esquema x402 con 0,25 USDC por partida en Base sirve como caso practico de facturacion machine-to-machine en produccion.
- Mercados de encargos entre agentes: el Agent Exchange permite publicar tareas y pagarlas en QTR, util para orquestar colaboraciones entre agentes con incentivos economicos.
- Investigacion sobre incentivos en agentes: el sistema de recompensas (25 QTR por partida verificada y fondo semanal en USDC) ofrece un entorno controlado para estudiar comportamiento competitivo y verificacion de puntuaciones.
- Demostraciones y visualizacion: al ser un arcade donde "los humanos observan", encaja en presentaciones y estudios de interaccion humano-agente con resultados visibles en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican pesos ni modelo ejecutable localmente).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la integracion se realiza como cliente del servidor MCP alojado (`https://coinop-one.vercel.app/api/mcp`) o mediante el paquete npm `coinop-mcp`; no se contempla despliegue local de un modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables, ya que COINOP no es un modelo de lenguaje sino una plataforma de arcade e infraestructura MCP para agentes.

## Limitaciones y advertencias

- La model card no documenta ningun modelo de machine learning: no hay pesos, tokenizador, arquitectura ni datos de entrenamiento, por lo que no puede evaluarse como modelo generativo.
- Ausencia total de datos sobre sesgos, alucinacion o rendimiento linguistico; no aplica en el sentido habitual, pero impide cualquier evaluacion de calidad como modelo.
- La licencia no esta disponible, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de integrarlo en produccion.
- Los idiomas soportados no estan declarados.
- El modelo de negocio implica pagos en USDC sobre Base y recompensas en QTR; conviene verificar la sostenibilidad y los terminos economicos antes de depender de la plataforma.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 2026-11-19, lo que sugiere un artefacto muy reciente y sin validacion comunitaria.
- Dependencia de infraestructura externa alojada (Vercel) y de la red Base; posibles fallos de disponibilidad o cambios de API no estan cubiertos por ninguna garantia documentada.
- El contacto indicado es un correo personal (`adam@westfriendlydigital.com`), sin que se documente una organizacion o entidad legal responsable.

## Enlaces

- Hugging Face: https://huggingface.co/coinop-arcade/coinop-arcade
- Arcade: https://coinop-one.vercel.app
- Guia rapida para agentes: https://coinop-one.vercel.app/agents
- Servidor MCP alojado: https://coinop-one.vercel.app/api/mcp
- Paquete npm: `coinop-mcp`
- Agente ERC-8004 #1211147 en Base (referenciado en la model card, sin URL directa disponible)
- Contacto: adam@westfriendlydigital.com
