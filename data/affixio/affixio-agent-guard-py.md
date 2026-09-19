# AffixIO/affixio-agent-guard-py

## Resumen

AffixIO Agent Guard (Python mirror) es un repositorio publicado en HuggingFace por AffixIO que no contiene un modelo de lenguaje, sino un espejo en Python de la politica de validacion del paquete npm `affixio-agent-guard`. Su funcion es comprobar de forma determinista y fail-closed una unica llamada a herramienta (tool call) contra un conjunto de reglas, y emitir un recibo JSON local con el resultado. No hay pesos, no hay red neuronal y no hay entrenamiento: es codigo de validacion.

El problema que aborda es la verificacion de acciones de agentes antes de que se ejecuten: allowlist de herramientas y hosts, limite de importe (`maxAmount`), bloqueo de secretos (`blockedSecrets`) y requisitos de aprobacion (`requireApprovalFor`). El diseno es deliberadamente local y sin red (`zero network, zero keys`), lo que lo hace adecuado como capa de control en entornos donde no se quiere enviar trafico ni credenciales a servicios externos.

Es relevante ahora por el auge de agentes con tool calling y de servidores MCP, donde la pregunta operativa no es solo que decide el modelo, sino que se le permite ejecutar. La propia model card advierte de que los recibos son simulaciones locales y no atestaciones criptograficas, un contrato de honestidad que conviene tener presente antes de integrarlo en produccion. Se distribuye bajo licencia MIT, con documentacion en ingles, version v1.0.0 y, en el momento de la consulta, 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: politica de validacion determinista en Python; no es una red neuronal |
| Parametros totales | No disponible (el repositorio no contiene pesos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (evalua una llamada a herramienta por invocacion, no texto libre) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | No aplica (codigo Python y fichero de politica; no hay safetensors ni GGUF) |
| Version | v1.0.0 (espejo Python de la logica de guard v0.1.0 del paquete npm) |
| Lenguaje de implementacion | Python |
| Dependencias de red | Ninguna (zero network, zero keys) |
| Claves de politica | `allowedTools`, `allowedHosts`, `maxAmount`, `blockedSecrets`, `requireApprovalFor` |
| Salida | Diccionario con `allowed` y `reason`; recibo JSON local |

## Arquitectura y entrenamiento

No existe entrenamiento. El repositorio no incluye dataset, numero de tokens, fases de RLHF o DPO, ni innovaciones de atencion, decodificacion especulativa o arquitecturas hibridas. La "arquitectura" es una funcion de validacion, `check_tool_call`, que recibe un diccionario con campos como `tool`, `host`, `amount` y `args`, y lo contrasta contra las claves de politica declaradas. El ejemplo de la model card ilustra el flujo: una llamada a `payments.create` contra `api.example.com` por importe 120, con argumentos de cliente, devuelve `allowed` y `reason` en funcion de la politica configurada.

El comportamiento es fail-closed, en particular para `requireApprovalFor`: la llamada se deniega salvo que el integrador construya su propio paso de aprobacion. El recibo generado es una simulacion local, no una atestacion criptografica, por lo que no aporta no repudio ni prueba verificable de ejecucion ante terceros. El repositorio se presenta como espejo de la logica del paquete npm, de modo que la paridad de comportamiento entre Node y Python es el eje del diseno.

## Capacidades

- Validacion determinista de una unica llamada a herramienta contra una politica declarativa.
- Aplicacion de allowlist de herramientas (`allowedTools`) y de hosts (`allowedHosts`).
- Control de importes maximos (`maxAmount`), util para operaciones de pago.
- Bloqueo de secretos (`blockedSecrets`) antes de cualquier salida de datos.
- Puerta de aprobacion humana (`requireApprovalFor`), con denegacion por defecto hasta que se implemente el paso de aprobacion.
- Emision de un recibo JSON local con el resultado de la comprobacion.
- Funcionamiento sin red y sin claves de API.
- No genera texto, no razona, no escribe codigo, no ejecuta tool calling por si mismo, no orquesta agentes y no tiene capacidades de vision ni audio.
- Documentacion y mensajes en ingles unicamente.

## Casos de uso

- Validacion previa de tool calls en agentes: interceptar cada llamada propuesta por el LLM antes de su ejecucion y consultar `check_tool_call` para decidir si se autoriza, deniega o escala a revision humana.
- Limite de gasto en operaciones de pago: fijar `maxAmount` para que un agente no pueda autorizar cargos por encima de un umbral definido, con denegacion automatica y motivo registrado.
- Prevencion de exfiltracion de datos: usar `allowedHosts` para restringir los destinos de red y `blockedSecrets` para impedir que credenciales o tokens viajen en los argumentos de una llamada.
- Puertas de aprobacion humana en flujos sensibles: configurar `requireApprovalFor` en herramientas como borrado de recursos o transferencias, de forma que la denegacion sea el comportamiento por defecto hasta que un operador apruebe.
- Auditoria y trazabilidad interna: persistir los recibos JSON locales como registro de cada decision de politica, integrables en el pipeline de logs de la organizacion.
- Proteccion de servidores MCP: envolver las herramientas expuestas por un servidor MCP para validar host y herramienta antes de que el agente alcance el sistema subyacente.
- Pruebas de politica en CI/CD: ejecutar `python test_guard.py` como parte de la suite de integracion para verificar que los cambios en la politica no abren permisos no deseados.
- Endurecimiento de despliegues locales o air-gapped: al no requerir red ni claves, puede desplegarse en entornos sin conectividad externa donde otras capas de guardrails basadas en servicios no son viables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni metricas equivalentes, algo coherente con el hecho de que no es un modelo de lenguaje. Tampoco se documentan mediciones de latencia o throughput del validador; por su naturaleza determinista y sin red, la latencia esperada depende del coste de comparacion de cadenas y de la lectura del fichero de politica, no de computo en GPU.

Las busquedas web realizadas para esta ficha no devolvieron ningun resultado relevante sobre el repositorio: los enlaces obtenidos correspondian a calculadoras de fechas y no guardan relacion con el proyecto.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay pesos ni computo en GPU.
- GPU recomendadas: ninguna. Se ejecuta en CPU.
- Compatibilidad con GPU de consumo: no procede, ya que no requiere aceleracion grafica.
- Memoria y CPU: los requisitos no estan documentados; funcionalmente basta con un interprete de Python y memoria suficiente para el fichero de politica y el diccionario de la llamada.
- Opciones de despliegue: cualquier runtime de Python; integrable como modulo importado (`from guard import check_tool_call`), como dependencia embebida en un servicio propio o dentro de un contenedor. No aplica despliegue mediante vLLM, llama.cpp, Ollama o TGI, porque no hay modelo que servir.
- Latencia y throughput: no disponibles en la informacion proporcionada. Determinismo y ausencia de llamadas de red son las unicas caracteristicas de rendimiento declaradas.

## Comparativa con modelos similares

La comparacion con "modelos similares" no es estrictamente aplicable, porque este repositorio no es un modelo de IA sino una libreria de validacion de politicas para agentes. La informacion proporcionada no incluye datos verificables de proyectos alternativos, por lo que las siguientes filas se dejan como no disponibles para evitar afirmaciones sin respaldo.

| Proyecto | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AffixIO Agent Guard (Python mirror) | Validacion determinista de tool calls | No aplica | No aplica | No disponible (sin benchmarks publicados) | MIT | Repositorio en HuggingFace; paquete npm equivalente |
| Frameworks de guardrails para LLM (categoria general) | Validacion y moderacion de entradas/salidas | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Librerias de validacion de esquemas y permisos para agentes | Politicas declarativas de herramientas y hosts | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generacion, razonamiento, codigo ni comprension de lenguaje natural.
- Los recibos son simulaciones locales, no atestaciones criptograficas; no ofrecen no repudio ni prueba verificable ante terceros.
- Fail-closed en `requireApprovalFor`: la llamada se deniega a menos que el integrador implemente su propio flujo de aprobacion, lo que exige trabajo adicional en produccion.
- Evalua una sola llamada por invocacion y no mantiene estado; no cubre politicas multi-paso ni correlacion entre acciones de un mismo agente.
- La model card no documenta defensas frente a tecnicas de evasion como codificacion alternativa de cadenas, redirecciones, subdominios o caracteres homoglifos; conviene tratarlo como una capa adicional y no como un control unico.
- La ausencia total de red implica que no hay actualizacion centralizada de politicas ni inteligencia de amenazas compartida; cada despliegue es autonomo.
- Solo hay soporte de idioma ingles en la documentacion y los mensajes.
- La licencia MIT permite uso comercial y modificacion, pero se distribuye sin garantias; no se menciona auditoria de seguridad externa.
- Madurez temprana: version v1.0.0, 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks ni evaluaciones publicadas.
- La via de instalacion documentada para el ecosistema Node es `npm install affixio-agent-guard`; para el espejo Python el README solo muestra `python test_guard.py`, sin instrucciones de empaquetado (por ejemplo, publicacion en PyPI) en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AffixIO/affixio-agent-guard-py
- Paquete npm del guard: https://www.npmjs.com/package/affixio-agent-guard
- Producto: https://www.affix-io.com
- SDK en npm: https://www.npmjs.com/package/affixio
- Documentacion de la API: https://www.affix-io.com/docs/
- Agentic Pay Kit: https://www.affix-io.com/agent-trust/
- Nota sobre la busqueda web: los resultados obtenidos fueron calculadoras de fechas (timeanddate.com, timedatecalc.com, calculator.net, calculat.io, thecalculatorsite.com) y no guardan relacion con este repositorio; no se han encontrado papers, blogs ni demos adicionales.
