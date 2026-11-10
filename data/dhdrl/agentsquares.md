# DHDRL/AgentSquares

## Resumen

AgentSquares (publicado como "Squares Progress Agent" en el repositorio DHDRL/AgentSquares) es un agente de software, no un modelo de lenguaje con pesos entrenados. Su proposito es monitorizar afirmaciones publicas sobre el problema de empaquetar n cuadrados unitarios en el cuadrado contenedor de menor lado posible, extrayendo el lado declarado de las paginas, validando la geometria cuando se aportan coordenadas y comparando la afirmacion con una tabla local de cotas conocidas. El repositorio contiene exclusivamente codigo: no hay pesos, checkpoints ni artefactos de modelo.

El interes del proyecto reside en la evaluacion del propio pipeline: identificar que componentes provocan o evitan falsos informes de "mejora". El agente encadena busqueda, descarga, extraccion, descarte de afirmaciones rechazadas o caducadas, validacion de coordenadas, comparacion con cotas y generacion de informe. Una mejora exige coordenadas que validen; un numero menor sin coordenadas queda solo como candidato.

Es relevante como caso de estudio de evaluacion rigurosa de agentes: el autor documenta explicitamente que los escenarios sinteticos fueron escritos por el mismo autor, que los resultados sobre paginas reales y con extractor LLM provienen de ejecuciones locales privadas no reproducibles, y que el agente no ha descubierto ni mejorado ningun record de empaquetamiento. La licencia es Apache-2.0 y el repositorio se creo en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de agente basado en reglas (search, fetch, extract, validate, compare, report); no es un transformer |
| Parametros totales | no disponible (no contiene pesos de modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del extractor LLM opcional, no publicado) |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio solo de codigo) |

## Arquitectura y entrenamiento

No hay entrenamiento de modelo. AgentSquares es un pipeline deterministico de procesamiento de texto y validacion geometrica: busqueda, descarga de paginas, extraccion del lado declarado, filtrado de afirmaciones rechazadas o caducadas, validacion de coordenadas, comparacion contra una tabla de cotas (`bounds.json`) y emision de informe con mejoras, candidatos, conflictos y errores. Dispone de un extractor por reglas como via principal y un extractor LLM opcional que solo propone pares (n, cita); el valor del lado se parsea de una cita verbatim y pasa por las mismas guardas que la via de reglas.

El diseño distingue entre prueba y candidato: los empaquetamientos racionales exactos se consideran prueba, mientras que la validacion en coma flotante no lo es, y las afirmaciones en coma flotante cercanas a la cota permanecen como candidatas. Las lineas con hedging o retractaciones se descartan, con coste en recall. La tabla de cotas cubre n = 1..29, 68, 102 y 299 a partir de un catalogo publicado. No se documenta ningun tipo de RLHF, DPO ni ajuste fino, al no existir modelo propio.

## Capacidades

- Extraccion de afirmaciones numericas sobre el lado del contenedor a partir de paginas web.
- Validacion geometrica de coordenadas cuando la afirmacion las incluye.
- Comparacion de afirmaciones contra una tabla local de cotas conocidas.
- Clasificacion de resultados en mejoras, candidatos, conflictos y errores.
- Descarte de afirmaciones rechazadas, caducadas, con hedging o retractadas.
- Uso opcional de un extractor LLM externo (modelo alojado en tier gratuito, brazo "flint") limitado a proponer pares (n, cita).
- Ejecucion offline-first para los escenarios sinteticos (`make test`, sin red ni clave de API).
- No soporta tool calling generico, agentes multi-paso arbitrarios, vision ni audio: su alcance es el dominio especifico del empaquetamiento de cuadrados.

## Casos de uso

- Monitorizacion de literatura y foros sobre empaquetamiento de cuadrados: el agente rastrea paginas publicas, extrae lados declarados y compara con `bounds.json` para detectar posibles mejoras sobre n = 1..29, 68, 102 y 299.
- Triaje de afirmaciones antes de revision humana: solo las afirmaciones con coordenadas validadas se marcan como mejora; el resto queda como candidato, reduciendo el ruido en la cola de revision.
- Auditoria de falsos positivos en pipelines de extraccion: el repositorio incluye escenarios sinteticos y comparativas entre agente, regex con guardas y regex simple, utiles para estudiar que componente genera falsos informes de mejora.
- Validacion de geometria en notas tecnicas o preprints: dado un conjunto de coordenadas, el agente comprueba si el empaquetamiento es consistente antes de aceptar el lado declarado.
- Deteccion de conflictos entre fuentes: al comparar varias afirmaciones sobre el mismo n contra la tabla de cotas, el agente reporta discrepancias y afirmaciones caducadas.
- Investigacion sobre evaluacion de agentes: sirve como banco de pruebas reproducible (`make test`) para medir sensibilidad al presupuesto de pasos (`max_steps`) y comportamiento ante cambios de distribucion, como el escenario de tabla LaTeX.
- Integracion como componente de un sistema mayor de seguimiento cientifico: el pipeline search-fetch-extract-validate-report puede adaptarse a otros dominios con cotas conocidas, aunque el codigo actual esta especializado en empaquetamiento de cuadrados.

## Benchmarks y rendimiento

Resultados reproducibles con `make test` (escenarios sinteticos, 23 casos):

| Sistema | Aciertos (23 escenarios) | Falsas mejoras |
|---|---|---|
| Agente (extractor por reglas) | 22/23 | 0 |
| Regex + mismas guardas | 12/23 | 0 |
| Regex simple (baseline) | 4/23 | 8 |
| Agente sin reintento | 20/23 | 0 |

El unico fallo del agente es un escenario con tabla LaTeX, descrito como caso deliberado de cambio de distribucion. Con `max_steps` forzado a 8, el agente obtiene 21/23 (91%), coherente con que `s09_budget_tight` espera agotamiento en su presupuesto nativo de 2.

Resultados locales no reproducibles desde el repositorio (paginas reales, ejecuciones privadas):

| Conjunto | Agente | Regex + guardas | Regex simple |
|---|---|---|---|
| Lote real 1 (15 paginas) | 15/15 | 14/15 | 9/15 (6 falsas mejoras) |
| Lote real 2 (12 paginas, un tipo de fuente) | 12/12 | 12/12 | 10/12 (2 falsas mejoras) |

En el lote 2 no se distingue el extractor por reglas del de regex con guardas. El extractor LLM opcional se probo en 7 escenarios y acerto 6, sin fallback a reglas; el extractor por reglas acerto los 7, por lo que no hay evidencia de que el LLM aporte mejora. Los conjuntos held-out son pequenos y los intervalos de confianza amplios.

## Requisitos de hardware

- No requiere GPU ni VRAM para inferencia: no hay pesos de modelo.
- Ejecucion de `make test` en CPU, sin red y sin clave de API.
- Para la evaluacion con paginas reales se necesitan fixtures privados (no incluidos); sin ellos la evaluacion se omite con un mensaje.
- Para el extractor LLM opcional se requieren las variables de entorno `SQ_LLM_API_KEY`, `SQ_LLM_BASE_URL` y `SQ_LLM_MODEL`, apuntando a un endpoint de modelo alojado; no se publican los ajustes del endpoint usado.
- Opciones de despliegue: ejecucion local del repositorio (Makefile); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no haber modelo que servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. AgentSquares no es un modelo de lenguaje y no se han identificado en la informacion proporcionada agentes comparables de monitorizacion de afirmaciones matematicas con validacion geometrica. Como referencia interna, el propio repositorio compara su extractor por reglas frente a regex con guardas y regex simple (ver seccion de benchmarks), pero no frente a otros proyectos.

## Limitaciones y advertencias

- Los escenarios sinteticos fueron escritos por el mismo autor del agente: no constituyen un test independiente.
- Los resultados sobre paginas reales y con extractor LLM provienen de ejecuciones locales privadas; las paginas, URLs y etiquetas con citas no se publican, por lo que esas tablas no son reproducibles desde el repositorio.
- Los numeros del extractor LLM no se generaron con `make test`, no se reejecutaron tras un cambio posterior de hash de codigo y requieren un endpoint de modelo activo.
- Los conjuntos held-out son pequenos, con intervalos de confianza amplios.
- El agente no ha descubierto ni mejorado ningun record de empaquetamiento.
- Listas como `5,6` son ambiguas frente a decimales con coma.
- No hay adaptador para CSV de Kaggle; las convenciones de columnas y angulos no estan confirmadas.
- `bounds.json` cubre solo n = 1..29, 68, 102 y 299; para n = 102 y 299 las afirmaciones de la comunidad podrian ser inferiores al catalogo.
- El descarte de lineas con hedging o retractacion reduce el recall.
- La validacion en coma flotante no constituye prueba; las afirmaciones cercanas a la cota permanecen como candidatas.
- Licencia Apache-2.0: permite uso comercial, pero el proyecto es codigo de investigacion sin garantias ni validacion independiente; no debe usarse como autoridad sobre records de empaquetamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DHDRL/AgentSquares
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo o demos.
