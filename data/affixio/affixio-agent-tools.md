# AffixIO/affixio-agent-tools

## Resumen

AffixIO Agent Tools es un repositorio publicado en HuggingFace por AffixIO que no contiene pesos de un modelo neuronal, sino una capa de herramientas local en Python disenada para agentes de IA. Su funcion es actuar como capa de seguridad "fail-closed": verifica identidad y permisos, valida intenciones de transaccion, permite buscar y organizar correo, redactar y enviar mensajes con aprobacion humana, y ejecutar acciones de webhook o API solo bajo listas de permitidos, dejando un registro de auditoria de cada decision.

El paquete expone funciones como `run_tool` y `approve`, y un conjunto de herramientas nombradas: `identity.check`, `permissions.check`, `payments.validate`, `email.search`, `email.organise`, `email.draft`, `email.send`, `webhook.trigger`, `api.call` y `audit.show`. El diseno declara explicitamente que no realiza llamadas de red y que no utiliza claves de produccion, de modo que sirve como entorno de simulacion y pruebas para flujos agenticos con acciones sensibles.

Su relevancia actual esta en el nicho de infraestructura para agentes: cubre el control de acciones con efecto real (pagos, correo, webhooks) mediante aprobacion humana y auditabilidad, en lugar de aportar capacidad de generacion. La version publicada es la v1.0.0, con licencia Apache 2.0 y soporte declarado unicamente para ingles. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica; capa de herramientas determinista en Python (no es un modelo neuronal, no contiene pesos) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el contexto lo aporta el agente que invoca las herramientas) |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica; se distribuye como codigo Python (`tools.py`, `test_tools.py`) |
| Autor | AffixIO |
| Version | v1.0.0 (release inicial) |
| Fecha de creacion en HuggingFace | 2026-09-19 |
| Ultima actualizacion en HuggingFace | 2026-09-19 |
| Herramientas incluidas | `identity.check`, `permissions.check`, `payments.validate`, `email.search`, `email.organise`, `email.draft`, `email.send`, `webhook.trigger`, `api.call`, `audit.show` |
| API publica | `run_tool(nombre, argumentos)`, `approve(appr_id, decision)` |
| Pruebas | `python test_tools.py` |
| Etiquetas | ai-agents, agentic-workflows, tool-calling, agent-verification, agentic-payments, mcp, email-agents |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento: el repositorio es una implementacion de herramientas en Python que se ejecuta en local. El patron de diseno declarado es "fail-closed", es decir, las operaciones con efecto (envio de correo, disparo de webhooks, llamadas a API) requieren aprobacion explicita mediante `approve()` y, en el caso de webhooks y API, estan restringidas por listas de permitidos. Ademas, cada decision queda registrada y es consultable mediante `audit.show`.

Las herramientas se agrupan en cuatro bloques funcionales: control de acceso (`identity.check`, `permissions.check`), validacion financiera (`payments.validate`), gestion de correo (`email.search`, `email.organise`, `email.draft`, `email.send`) y acciones externas sujetas a aprobacion (`webhook.trigger`, `api.call`). No se publican datos sobre volumen de pruebas, cobertura de tests, dependencias externas ni integracion con frameworks de agentes mas alla de la etiqueta `mcp`. El autor indica que los recibos generados son simulados y que no constituyen atestaciones criptograficas; las atestaciones con ML-DSA, la verificacion alojada y la auditoria empresarial se reservan a la oferta comercial.

## Capacidades

- Control de identidad y permisos antes de ejecutar cualquier herramienta (`identity.check`, `permissions.check`).
- Validacion de intenciones de pago o transaccion (`payments.validate`).
- Busqueda y organizacion de correo electronico (`email.search`, `email.organise`).
- Redaccion de borradores de correo (`email.draft`).
- Envio de correo sujeto a aprobacion humana explicita (`email.send` + `approve`).
- Disparo de webhooks con aprobacion y lista de permitidos (`webhook.trigger`).
- Llamadas a API con aprobacion y lista de permitidos (`api.call`).
- Registro y consulta de auditoria de todas las decisiones (`audit.show`).
- Ejecucion sin red y sin claves de produccion, apta para entornos de prueba.
- Integracion declarada con agentes mediante el enfoque de tool calling y la etiqueta `mcp`; no se detalla el grado de compatibilidad ni el protocolo concreto.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni multilinguesimo: el unico idioma soportado es el ingles.

## Casos de uso

- Pruebas de agentes con acciones sensibles: un equipo puede conectar un agente a `email.send`, `webhook.trigger` y `api.call` en un entorno sin red ni claves reales, y validar que el agente pide aprobacion antes de ejecutar, gracias al patron fail-closed.
- Automatizacion de bandeja de entrada: `email.search` y `email.organise` permiten clasificar y localizar mensajes por consulta (por ejemplo, `{"query": "invoice"}`), mientras `email.draft` prepara respuestas que un humano revisa antes del envio.
- Verificacion previa de pagos en flujos agenticos: `payments.validate` actua como puerta de validacion de la intencion de transaccion antes de que un agente inicie cualquier operacion economica, reduciendo el riesgo de acciones no autorizadas.
- Auditoria y cumplimiento interno: `audit.show` ofrece un registro de decisiones que puede revisarse para reconstruir que accion solicito el agente, que herramienta se invoco y si hubo aprobacion, util en revisiones de procesos.
- Integracion en pipelines de agentes como capa de guardarrail: el par `run_tool`/`approve` se puede envolver en un paso de validacion intermedio que aplique listas de permitidos a webhooks y endpoints de API antes de tocar sistemas corporativos.
- Demostraciones y formacion: al no requerir red ni credenciales, el repositorio sirve para ensenar patrones de aprobacion humana y verificacion en talleres o pruebas de concepto internas sin exponer sistemas reales.
- Evaluacion de la futura ruta comercial: el propio autor enlaza el producto de pago con recibos no simulados, atestaciones ML-DSA, agentes de equipo, buzones compartidos y auditoria empresarial, de modo que la version libre puede utilizarse como banco de pruebas antes de migrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no es un modelo de lenguaje y no declara metricas de calidad, latencia ni throughput. La busqueda web realizada no devolvio resultados relacionados con el proyecto: los unicos resultados obtenidos corresponden a paginas de programacion de television de TF1, sin relacion alguna con el modelo.

## Requisitos de hardware

- VRAM: no aplica. No hay pesos ni inferencia neuronal; el consumo es el de un proceso Python convencional.
- GPU: no requiere GPU. Funciona en CPU.
- GPU de consumo: no aplica, al no existir componente de inferencia acelerada.
- Despliegue: ejecucion local como modulo Python (`from tools import run_tool, approve`); no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI, ni tendria sentido al no haber pesos.
- Latencia y throughput: no disponibles. Las herramientas son llamadas locales; no se publican mediciones.
- Almacenamiento: no disponible el tamano exacto del repositorio; al tratarse de codigo Python y un fichero de tests, previsiblemente minimo.
- Dependencias: no disponibles. La model card solo menciona el interprete de Python y la ejecucion de `test_tools.py`.

## Comparativa con modelos similares

Este repositorio no compite con modelos de lenguaje, sino con frameworks de herramientas y guardarrailes para agentes. La busqueda web realizada no aporto informacion verificable sobre alternativas de esta misma categoria, por lo que los datos comparativos concretos se marcan como no disponibles.

| Criterio | AffixIO Agent Tools | Alternativas de la misma categoria |
|---|---|---|
| Tipo | Capa de herramientas local en Python con aprobacion humana y auditoria | no disponible (frameworks de herramientas o guardarrailes; sin datos verificados en esta busqueda) |
| Parametros | no aplica | no aplica |
| Contexto | no aplica | no aplica |
| Rendimiento medido | no publicado | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Disponibilidad | Repositorio en HuggingFace y SDK en npm enlazado por el autor | no disponible |
| Soporte comercial | Ruta de pago declarada por el autor (producto, SDK, API, Agentic Pay Kit) | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona por si mismo. Necesita un agente o modelo externo que invoque sus herramientas.
- Los recibos de la version publica son simulados y no constituyen atestaciones criptograficas; la verificacion con ML-DSA queda reservada a la oferta de pago.
- Sin red y sin claves de produccion: por diseno no puede ejecutar acciones reales contra servicios externos en esta version.
- La aprobacion humana se realiza mediante `approve(appr_id, decision)`; si ese paso se automatiza o se omite en la capa superior, el control fail-closed pierde su efecto.
- Idioma unico declarado: ingles. No hay soporte multilingue documentado.
- Estado de validacion de la comunidad: 0 descargas y 0 "likes" en HuggingFace en el momento de la consulta; no hay evidencia publica de uso en produccion.
- Sin benchmarks ni metricas de rendimiento publicadas: no es posible comparar su eficacia frente a otros guardarrailes.
- La model card no detalla dependencias, cobertura de tests ni limites conocidos; la unica verificacion ofrecida es la ejecucion de `test_tools.py`.
- La superficie de seguridad depende de la correcta configuracion de las listas de permitidos de `webhook.trigger` y `api.call`; no se documenta el formato ni la granularidad de esas listas.
- Licencia Apache 2.0: permite uso comercial del codigo publicado, pero las funciones empresariales y de verificacion alojada se comercializan aparte, por lo que conviene revisar los terminos del producto de pago antes de integrarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AffixIO/affixio-agent-tools
- Producto (ruta de pago): https://www.affix-io.com
- SDK en npm: https://www.npmjs.com/package/affixio
- Documentacion de la API: https://www.affix-io.com/docs/
- Agentic Pay Kit: https://www.affix-io.com/agent-trust/
