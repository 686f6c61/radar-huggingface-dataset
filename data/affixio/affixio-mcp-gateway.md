# AffixIO/affixio-mcp-gateway

## Resumen

AffixIO MCP Gateway no es un modelo de lenguaje, sino un componente de infraestructura para agentes: un servidor MCP (Model Context Protocol) que actua como puerta de politica (policy gate) delante de las llamadas a herramientas privilegiadas. Lo publica AffixIO bajo licencia Apache-2.0 y su funcion es decidir, antes de que un agente ejecute una herramienta, si la accion se permite o se deniega, ademas de emitir y verificar atestaciones firmadas de acciones locales. El repositorio de HuggingFace es un "model repo" en el sentido de que aloja configuraciones de cliente y un espejo de la logica de politica, no pesos de red neuronal.

El paquete real se distribuye por npm como `@affixio/mcp` y requiere Node 20 o superior. El servidor expone tres herramientas sobre transporte stdio local: `attest_action` (registra una accion y devuelve una atestacion firmada si/no), `verify_action` (comprueba una atestacion y devuelve valido verdadero/falso con motivo) y `gate_tool_call` (comprobacion previa allow/deny antes de una llamada privilegiada). Segun la model card, la PII no sale del host: solo se conservan digests SHA-256 de los argumentos.

Su relevancia actual es la de cualquier capa de control en despliegues agenticos: se integra con clientes MCP como Claude Desktop o Cursor copiando un fichero de configuracion (`claude-desktop-mcp.json` o `cursor-mcp.json`) que incluye una politica de demostracion con 5 herramientas en lista blanca, un tope de 500 GBP, patrones de secretos bloqueados y la clave offline `local_operator`. La version publicada es la v1.0.0 y el repositorio no registra descargas ni likes en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica / no disponible: no es un modelo de red neuronal; es un servidor MCP (Node.js) con logica de politica fail-closed y un espejo en Python (`gateway.py`) |
| Parametros totales | No aplica (no es un modelo de lenguaje) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica; el estado depende de la politica configurada y del cliente MCP) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | Ingles (en) en documentacion y cadena de politica |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (no hay pesos): configuracion JSON de cliente MCP, scripts Node.js y Python |

Datos adicionales de distribucion:

| Parametro | Valor |
|---|---|
| Paquete | `@affixio/mcp` (npm), SDK `affixio` en npm |
| Runtime | Node 20 o superior; Python para `test_gateway.py` sin dependencias |
| Transporte | stdio local |
| Herramientas expuestas | 3 (`attest_action`, `verify_action`, `gate_tool_call`) |
| Variables de entorno | `AFFIX_API_KEY` (por defecto `local_operator`, modo offline), `AFFIX_MCP_HOME`, `AFFIX_MCP_AGENT_ID`, `AFFIX_MCP_ALLOWED_TOOLS`, `AFFIX_MCP_MAX_AMOUNT`, `AFFIX_MCP_CURRENCY`, `AFFIX_MCP_BLOCKED_PATTERNS` |
| Politica de demo | 5 herramientas permitidas, tope de 500 GBP, patrones de secretos bloqueados, clave offline `local_operator` |
| Version | v1.0.0 (con `CHANGELOG.md`) |
| Privacidad declarada | Solo digests SHA-256 de argumentos; la PII no sale del host (afirmacion del autor) |

## Arquitectura y entrenamiento

No hay arquitectura de red ni proceso de entrenamiento que describir: el componente es un servidor MCP que intermedia llamadas a herramientas. La logica relevante es una politica de decision fail-closed, es decir, que ante ambiguedad o error la respuesta por defecto es denegar. Esa misma logica se replica en `gateway.py` sin dependencias, de modo que puede auditarse y probarse con `python test_gateway.py` sin instalar Node, y compararse con el comportamiento del servidor real.

No se documenta en la informacion proporcionada ningun mecanismo de aprendizaje, ajuste fino, RLHF, DPO ni dataset de entrenamiento. El elemento criptografico declarado es el uso de digests SHA-256 sobre los argumentos de las herramientas y la emision de atestaciones firmadas mediante `attest_action`, verificables despues con `verify_action`. Los ficheros `claude-desktop-mcp.json` y `cursor-mcp.json` actuan como punto de integracion con clientes MCP y contienen la politica de ejemplo que el operador debe adaptar.

## Capacidades

- Registro y atestacion de acciones locales: `attest_action` devuelve una atestacion firmada con respuesta si/no.
- Verificacion de atestaciones: `verify_action` devuelve validez verdadero/falso junto con el motivo.
- Control previo de llamadas a herramientas: `gate_tool_call` intercepta una llamada privilegiada y responde allow o deny antes de su ejecucion.
- Aplicacion de listas blancas de herramientas mediante `AFFIX_MCP_ALLOWED_TOOLS`.
- Aplicacion de topes economicos por operacion mediante `AFFIX_MCP_MAX_AMOUNT` y `AFFIX_MCP_CURRENCY`.
- Bloqueo por patrones de secretos mediante `AFFIX_MCP_BLOCKED_PATTERNS`.
- Minimizacion de datos: solo se conservan digests SHA-256 de los argumentos, no su contenido.
- Funcionamiento offline con `AFFIX_API_KEY=local_operator`.
- Integracion con clientes MCP: Claude Desktop y Cursor mediante ficheros de configuracion proporcionados.
- Ejecucion local por stdio, sin exposicion de red documentada.
- Espejo de politica en Python sin dependencias para pruebas y verificacion de la logica fail-closed.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio: no es un modelo generativo.

## Casos de uso

- Control de acceso a herramientas privilegiadas en agentes de escritorio: colocar `@affixio/mcp` como gate delante de cada llamada sensible en Claude Desktop o Cursor, de forma que una llamada fuera de la lista blanca reciba deny desde `gate_tool_call` antes de ejecutarse.
- Auditoria trazable de acciones de agente: cada accion relevante se registra con `attest_action` y se puede comprobar a posteriori con `verify_action`, lo que permite reconstruir una cadena de decisiones verificable sin almacenar el contenido de los argumentos.
- Cumplimiento y minimizacion de datos: en dominios con datos personales, el hecho de conservar solo digests SHA-256 reduce la superficie de exposicion si el host o los logs se ven comprometidos.
- Limite de gasto en agentes con herramientas de pago: configurar `AFFIX_MCP_MAX_AMOUNT` y `AFFIX_MCP_CURRENCY` para que operaciones que superen el tope (por ejemplo, mas de 500 GBP en la politica de demo) se denieguen de forma automatica.
- Prevencion de fuga de credenciales: usar `AFFIX_MCP_BLOCKED_PATTERNS` para que los argumentos que contengan formas reconocibles de secretos queden bloqueados antes de alcanzar la herramienta.
- Despliegue en entornos air-gapped: con `AFFIX_API_KEY=local_operator` el gateway opera sin conexion saliente, lo que encaja en redes aisladas donde no se permite trafico a servicios externos.
- Validacion en integracion continua: ejecutar `python test_gateway.py` con el espejo `gateway.py` para verificar que la logica fail-closed se comporta como se espera en cada cambio de politica, sin necesidad de Node en el runner.
- Estandarizacion de politicas entre varios agentes: fijar `AFFIX_MCP_AGENT_ID` por agente y una politica comun permite comparar y homogeneizar el comportamiento de varios flujos agenticos multi-paso dentro de una misma organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los materiales proporcionados no incluyen metricas de latencia, throughput, tasa de falsos positivos, tasa de falsos negativos, cobertura de ataques ni comparaciones cuantitativas con otras implementaciones de control de agentes.

## Requisitos de hardware

- GPU: no requiere GPU. El componente no ejecuta inferencia.
- CPU y memoria: suficiente con un entorno Node 20 o superior; no se publican minimos de RAM ni de CPU. El paquete se describe como servidor local por stdio, por lo que su huella es la de un proceso Node ligero.
- Almacenamiento: minimo, limitado al paquete npm y a los ficheros de configuracion; los digests SHA-256 ocupan un espacio reducido en comparacion con guardar los argumentos completos.
- Cabe en cualquier equipo de desarrollo, incluidos portatiles sin GPU dedicada y contenedores pequenos.
- Despliegue: instalacion global con `npm i -g @affixio/mcp` y comprobacion con `affixio-mcp probe`; integracion mediante stdio en clientes MCP. No se documentan opciones de servidor HTTP ni despliegue con vLLM, llama.cpp, Ollama o TGI, porque no hay modelo que servir.
- Latencia y throughput estimados: no disponibles. Al no haber inferencia, el coste dominante seria el del propio proceso y el de las comprobaciones de politica, pero no se aportan cifras.
- Para pruebas sin Node: Python con `gateway.py` y `test_gateway.py`, descrito como libre de dependencias.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos ni componentes comparables con datos verificables (parametros, contexto, rendimiento o licencia) frente a los que situar este gateway. La comparacion mas directa seria contra otras capas de control previo a llamadas de herramientas en agentes MCP, pero no se aportan datos de esas alternativas en el material disponible.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AffixIO MCP Gateway | No aplica | No disponible | Sin benchmarks publicados | Apache-2.0 | npm (`@affixio/mcp`) y repo de configuracion en HuggingFace |
| Otras capas de gate para MCP | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni procesa imagenes. Cualquier expectativa de inferencia es incorrecta.
- Superficie funcional reducida: tres herramientas y transporte stdio local; no se documenta soporte HTTP o SSE para despliegues remotos ni ejecucion multi-tenant.
- La eficacia del control depende de que el cliente MCP respete la respuesta deny. No se describe un sandbox de proceso que impida ejecutar una herramienta por vias alternativas.
- La politica incluida es una demostracion (5 herramientas, tope de 500 GBP, clave offline `local_operator`). Usarla tal cual en produccion dejaria el control mal dimensionado; debe adaptarse a cada entorno mediante las variables `AFFIX_MCP_*`.
- No se publican tasas de falsos positivos o negativos, modelo de amenazas formal ni resultados de pruebas de evasion, por lo que no es posible cuantificar su robustez.
- Repositorio sin traccion observable en el momento de la consulta: 0 descargas y 0 likes, version unica v1.0.0 y fecha de creacion registrada como 2026-09-19, posterior a la de esta ficha; conviene verificar el estado real del proyecto antes de adoptarlo.
- Documentacion unicamente en ingles; no hay traducciones ni guias en castellano.
- El uso de SHA-256 sobre argumentos evita almacenar el contenido, pero hereda las limitaciones criptograficas habituales de las funciones de hash y no permite reconstruir el dato para depuracion.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia, y sin garantias explicitas. No se documentan condiciones adicionales ni compromisos de soporte.
- Los resultados de busqueda web obtenidos no contienen informacion tecnica relevante sobre este componente y no se han utilizado como fuente.

## Enlaces

- HuggingFace: https://huggingface.co/AffixIO/affixio-mcp-gateway
- Repositorio del paquete MCP: https://github.com/AffixIO/affixio-mcp
- SDK en npm: https://www.npmjs.com/package/affixio
- Documentacion de API: https://www.affix-io.com/docs/
- Producto: https://www.affix-io.com
- Agentic Pay Kit: https://www.affix-io.com/agent-trust/
