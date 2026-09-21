# cxai-models/flux-3.0-flash-krn

## Resumen

`cxai-models/flux-3.0-flash-krn` es un repositorio publicado en Hugging Face por el usuario `cxai-models` que no contiene pesos de un modelo de lenguaje, sino un conjunto de nucleos de ejecucion (kernels) en Python para trading autonomo. Segun su propia model card, el paquete implementa cinco sistemas coordinados: un motor de acciones (Phase 1) con ejecucion en Alpaca y corroboracion de regresion por minuto via Massive API, un agente de trading en C++20 para Robinhood con arquitectura dual-MCP (FLX-HOOD), un motor autonomo de criptomonedas con feeds de Coinbase y Alpaca (FLX-Crypto), un simulador multi-horizonte sobre Webull con limite estricto de 10.000 dolares de equity (FLX-Sim) y un pipeline de telemetria sobre PostgreSQL/Supabase.

El componente de IA que da nombre al repositorio, CXAI-FLUX-3.0, no se distribuye: se accede a el como servicio remoto a traves de una pasarela alojada en Salad Cloud (`https://ns3192699.ip-152-228-227.eu/flux-gateway/v1`). El repositorio no publica informacion sobre arquitectura, numero de parametros, longitud de contexto, tokenizador, dataset de entrenamiento ni proceso de alineamiento, por lo que no es posible evaluarlo como modelo generativo con los criterios habituales. La licencia declarada es Apache 2.0 y el unico idioma etiquetado es el ingles.

La relevancia del repositorio es, por tanto, documental y de integracion: describe un patron de orquestacion de agentes autonomos aplicado a mercados financieros, con una politica de seguridad explicita (`execution_authority: false`) segun la cual el modelo no puede emitir ordenes por si mismo y toda operacion requiere validacion por puertas deterministicas del coordinador o confirmacion explicita del operador. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no describe la arquitectura de CXAI-FLUX-3.0; solo indica que se invoca como servicio remoto via pasarela) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara una arquitectura de tipo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene scripts Python, no ficheros de pesos; no se declaran safetensors, GGUF ni otros formatos) |

Otros metadatos del repositorio: pipeline no declarado, 0 descargas, 0 likes, fecha de creacion 2026-09-20 y ultima actualizacion 2026-09-20.

## Arquitectura y entrenamiento

No hay informacion publica sobre la arquitectura del modelo CXAI-FLUX-3.0: la model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura de espacio de estados o un sistema hibrido, ni detalla el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO u otras tecnicas de alineamiento. El unico dato operativo es que se consume a traves de una pasarela HTTP compatible con el estilo de API de OpenAI en el endpoint indicado, con el modelo fijado ("pinned native") en dicha pasarela.

Lo que si describe el repositorio es la arquitectura de software que rodea al modelo. Se trata de un diseno multi-agente con separacion estricta entre el plano de datos y el plano de ejecucion: los feeds de Coinbase Exchange, Alpaca SIP y Massive API permanecen aislados de los venues de ejecucion. Los kernels cubren estrategias por minuto con corroboracion de regresion, evaluacion de microestructura de libro de ordenes, simulacion multi-horizonte y sincronizacion de telemetria entre tres sistemas con seguimiento de recibos. La gobernanza impone que el modelo no tenga autoridad de ejecucion y que se prohiba explicitamente el uso de modelos de terceros (Claude, Cursor, ChatGPT o Grok) en el flujo del proyecto.

## Capacidades

- Orquestacion de agentes autonomos de trading sobre multiples brokers y venues: Alpaca (paper y live), Robinhood, Coinbase, Webull, Saxo Bank y moomoo/Futu.
- Ejecucion de estrategias de acciones con corroboracion por regresion sobre datos minuto a minuto y salidas de recuperacion exacta (kernel `phase1`).
- Agente de trading en C++20 con arquitectura dual-MCP para Robinhood (kernel `flx-hood`).
- Motor de criptomonedas autonomo con evaluacion de microestructura de libro de ordenes y momentum (kernel `flx-crypto`).
- Simulacion multi-horizonte en papel sobre Webull con limite estricto de 10.000 dolares de equity (kernel `flx-sim`).
- Sincronizacion de telemetria entre tres sistemas sobre PostgreSQL/Supabase con seguimiento de recibos (kernel `pipeline`).
- Monitorizacion y asesoramiento de acciones internacionales en Saxo Bank y de acciones asiaticas en moomoo/Futu, ambos con puerta de dry-run (kernels `saxo` y `futu`).
- Modo demonio de ejecucion continua con intervalo configurable (`daemon --interval 60`).
- Utilidades de benchmark de latencias de ejecucion, auditoria de cumplimiento y barreras de seguridad, y verificacion de integridad del sistema.
- Publicacion del bundle de kernels en Hugging Face Hub mediante el subcomando `upload`.
- Soporte de tool calling / function calling: no disponible como dato explicito, aunque la arquitectura dual-MCP de FLX-HOOD implica integracion con servidores MCP.
- Capacidades multilingues: limitadas al ingles segun las etiquetas del repositorio.
- Capacidades especiales declaradas: ninguna adicional (no se mencionan modos de razonamiento explicito, vision ni audio).

## Casos de uso

- Orquestacion de operativa en papel antes de produccion: el kernel `flx-sim` permite ejecutar estrategias multi-horizonte sobre Webull con un tope duro de 10.000 dolares de equity, de modo que un equipo puede validar logica de entrada y salida sin arriesgar capital real.
- Ejecucion automatizada de estrategias de acciones: el kernel `phase1` conecta con Alpaca en modo paper o live y corrobora las senales con regresion sobre datos de minuto via Massive API, lo que resulta util para estrategias intradia que necesitan confirmacion independiente antes de enviar una orden.
- Monitorizacion de arbitraje y microestructura en cripto: el kernel `flx-crypto` consume feeds de Coinbase y Alpaca y evalua el libro de ordenes, adecuado para detectar desequilibrios de profundidad o momentum a corta escala temporal.
- Investigacion de agentes con MCP en C++: el kernel `flx-hood` sirve como referencia de implementacion de un agente con doble servidor MCP y C++20, util para equipos que quieran estudiar como estructurar tool calling de baja latencia en un dominio financiero.
- Agregacion de telemetria multi-sistema: el kernel `pipeline` sincroniza el estado de tres sistemas sobre PostgreSQL/Supabase con seguimiento de recibos, lo que permite auditar que cada decision del agente quedo registrada y conciliada.
- Vigilancia de mercados internacionales en modo asesor: los kernels `saxo` y `futu` operan con puerta de dry-run para generar recomendaciones sobre acciones internacionales y asiaticas sin capacidad de ejecucion directa.
- Despliegue de un proceso continuo de investigacion: el modo `daemon` con intervalo de 60 segundos permite mantener el ciclo de analisis activo durante la sesion de mercado sin intervencion manual.
- Auditoria de seguridad y cumplimiento antes de un despliegue: los subcomandos `audit` y `verify` permiten comprobar las barreras de proteccion y la integridad del sistema, un paso previo razonable en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio incluye un subcomando `benchmark` descrito como medidor de latencias de ejecucion, pero no se proporcionan cifras, metodologia ni resultados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se distribuyen pesos; la inferencia ocurre en un servicio remoto).
- GPU recomendadas: no disponible para el modelo. Los kernels en si son scripts Python y un componente en C++20 que se ejecutan en CPU.
- Compatibilidad con GPU de consumo: no disponible; no aplica al tratarse de una pasarela remota.
- Opciones de despliegue: la model card solo documenta la ejecucion local de los kernels mediante `python3 flux-3.0-trade.py` y el acceso al modelo a traves de la pasarela indicada. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El flag `daemon --interval 60` sugiere un ciclo de ejecucion con granularidad de un minuto, pero no se aportan mediciones.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la informacion proporcionada, y la propia naturaleza del repositorio (bundle de kernels de trading con modelo remoto no distribuido) no encaja en las categorias habituales de comparacion por parametros, contexto o rendimiento en benchmarks publicos. Cualquier comparacion con modelos de lenguaje abiertos seria especulativa y no verificable con los datos disponibles.

## Limitaciones y advertencias

- El repositorio no distribuye pesos: pese a estar alojado en Hugging Face bajo un identificador con aspecto de modelo, es un conjunto de codigo de trading. No puede cargarse con `transformers`, `vLLM` ni similares.
- La ausencia total de datos de arquitectura, entrenamiento y evaluacion impide reproducir, auditar o validar el comportamiento del modelo CXAI-FLUX-3.0 subyacente.
- Riesgo de alucinacion: no disponible como dato declarado, pero cualquier agente de lenguaje aplicado a mercados financieros es susceptible de generar justificaciones plausibles y erroneas sobre movimientos de precio. La model card mitiga esto parcialmente con corroboracion determinista, pero no cuantifica la tasa de error.
- Dependencia de un endpoint externo: el modelo se consume a traves de una IP concreta sobre Salad Cloud, lo que introduce un punto unico de fallo, dependencia de red y opacidad sobre versionado y disponibilidad del modelo servido.
- Los fetches de datos de mercado dependen de APIs de terceros (Alpaca SIP, Coinbase, Massive API, Webull, Saxo, Futu), con sus propios limites de tasa, costes y condiciones de uso.
- Restricciones de licencia: el codigo se publica bajo Apache 2.0, que permite uso comercial, pero la licencia del modelo remoto no se declara en este repositorio y podria ser distinta.
- Riesgo financiero intrinseco: se trata de software que envia ordenes reales en modos live. La salvaguarda `execution_authority: false` es una decision de diseno del autor, no una garantia tecnica verificable de forma independiente.
- Idioma: solo se declara soporte de ingles, lo que limita su uso en flujos de trabajo en castellano.
- Actividad nula en el repositorio: 0 descargas y 0 likes, sin senales de mantenimiento comunitario ni de validacion externa.
- Fechas de creacion y actualizacion (2026-09-20) posteriores a la fecha habitual de publicacion de modelos comparables, lo que conviene verificar antes de tratarlas como referencia temporal fiable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cxai-models/flux-3.0-flash-krn
- Pasarela del modelo citada en la model card: https://ns3192699.ip-152-228-227.eu/flux-gateway/v1
- Paper, blog tecnico, repositorio de codigo y demo: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo o repositorio.
