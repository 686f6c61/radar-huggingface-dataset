# dchubcloud/dchub

## Resumen

DC Hub (dchubcloud/dchub) no es un modelo de lenguaje, sino una capa de datos de infraestructura en vivo pensada para ser consultada por agentes de IA a través del protocolo MCP (Model Context Protocol). Lo publica dchub.cloud y ofrece información actualizada sobre más de 20.400 centros de datos en más de 170 países, incluyendo capacidad disponible en la red eléctrica (grid headroom), rutas de fibra óptica, gasoductos, inquilinos por instalación, el índice propio DC Hub Power Index (DCPI) y más de 2.100 operaciones de M&A rastreadas.

El problema que resuelve es bien conocido por quien desarrolla agentes: los LLM responden preguntas sobre infraestructura (dónde hay capacidad eléctrica, qué mercados son viables para un nuevo centro de datos) con datos congelados en su fecha de corte de entrenamiento, a menudo desfasados años. DC Hub sustituye esas respuestas alucinadas por consultas a datos en vivo y citables, con una licencia CC-BY-4.0 que permite su uso con atribución.

Su relevancia actual viene del auge tanto de los agentes con tool calling como de la fiebre constructora de centros de datos para IA. Se integra en Claude Code, Cursor, Claude Desktop, VS Code o cualquier cliente MCP mediante una URL (`https://dchub.cloud/mcp`), con un nivel gratuito sin clave de API. En Hugging Face se aloja además un Space de demostración con un scorer de DCPI y un dataset de veredictos de mercado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (servicio de datos vía MCP, no es un modelo) |
| Parametros totales | No aplicable |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No aplicable (API MCP y datasets; no distribuye pesos) |

| Componente | Detalle |
|---|---|
| Herramientas MCP | 83 herramientas (grid, fibra, instalaciones, mercados, deals) |
| Instalaciones cubiertas | 20.400+ centros de datos (cifras redondeadas a la baja, "citation-safe floors") |
| Países | 170+ |
| Mercados analizados | 300+ con veredictos BUILD/CAUTION/AVOID |
| Operaciones M&A rastreadas | 2.100+ |
| Endpoint MCP | `https://dchub.cloud/mcp` |
| Nivel gratuito | Sí, sin clave de API |

## Arquitectura y entrenamiento

Al no tratarse de un modelo neuronal, no hay arquitectura de transformer, datos de entrenamiento ni fases de RLHF/DPO que describir. La "arquitectura" del sistema es una API de datos expuesta como servidor MCP con transporte HTTP (compatible también con clientes solo-stdio mediante `mcp-remote`). Expone 83 herramientas como `rank_markets`, `get_grid_intelligence`, `get_interconnection_queue`, `get_facility`, `get_fiber_intel`, `get_market_intel`, `hyperscaler_deals` y `analyze_site`.

Los datos se mantienen en vivo: la propia model card aclara que las cifras publicadas son "floors" (mínimos citables, redondeados siempre a la baja respecto a la medición en vivo) y que la fuente de verdad es el endpoint `https://dchub.cloud/api/v1/canon/phrases`, ya que la model card es estática. Los datos derivados publicados en Hugging Face (como el dataset de veredictos de mercado) se distribuyen bajo CC-BY-4.0 con atribución a DC Hub (dchub.cloud).

## Capacidades

No es un modelo generativo, por lo que sus capacidades son de acceso a datos para agentes:

- Consulta en tiempo real de más de 20.400 instalaciones de centros de datos en 170+ países (herramienta `get_facility`).
- Inteligencia de red eléctrica: headroom de red, colas de interconexión (`get_grid_intelligence`, `get_interconnection_queue`).
- Análisis de rutas de fibra óptica y gasoductos (`get_fiber_intel`).
- Evaluación de mercados: 300+ mercados con veredictos BUILD/CAUTION/AVOID y ranking (`rank_markets`, `get_market_intel`).
- Índice propio DC Hub Power Index (DCPI), con scorer disponible en el Space de Hugging Face.
- Seguimiento de operaciones de M&A del sector (`hyperscaler_deals`).
- Análisis de emplazamientos (`analyze_site`), por ejemplo para valorar dónde ubicar un centro de datos de 100 MW.
- Integración estándar con cualquier cliente MCP (Claude Code, Cursor, Claude Desktop, VS Code) y playground web sin registro.
- Datos citables: las cifras publicadas están diseñadas para ser usadas en citas con atribución.

## Casos de uso

- Selección de emplazamiento para un nuevo centro de datos de IA: un agente puede combinar `rank_markets` y `analyze_site` para identificar mercados con headroom eléctrico suficiente para 100 MW, evitando depender de informes desfasados.
- Planificación de capacidad por parte de operadores cloud: consultar `get_grid_intelligence` y `get_interconnection_queue` para saber en qué regiones la red eléctrica puede absorber nuevas cargas y cuáles son los tiempos de cola de interconexión.
- Due diligence inmobiliaria y de infraestructura: usar `get_facility` para obtener inquilinos, capacidad y detalles por instalación antes de valorar adquisiciones o arrendamientos.
- Vigilancia competitiva de M&A: con `hyperscaler_deals` un agente puede monitorizar las 2.100+ operaciones rastreadas y alertar sobre movimientos de los hyperscalers.
- Estudios de conectividad: `get_fiber_intel` permite evaluar rutas de fibra disponibles cerca de un emplazamiento candidato, clave para decisiones de latencia y redundancia.
- Generación de informes citables: gracias a la licencia CC-BY-4.0 y a las cifras "citation-safe", los agentes pueden redactar informes de mercado con datos verificables y atribución directa.
- Enriquecimiento de agentes verticales: cualquier asistente de inversión, consultoría energética o planificación territorial puede añadir el servidor MCP como fuente de datos sin construir su propio pipeline de recopilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no aplica evaluación tipo MMLU, HumanEval o GSM8K. Como métricas de cobertura, la propia fuente declara 20.400+ instalaciones, 170+ países, 300+ mercados y 2.100+ deals, con un endpoint canónico (`/api/v1/canon/phrases`) como fuente de verdad de las cifras en vivo.

## Requisitos de hardware

No aplica: al ser un servicio remoto de datos vía MCP, no requiere hardware local para ejecutar nada del servicio.

- VRAM: no aplicable (no hay pesos que ejecutar).
- GPU recomendadas: ninguna; solo se necesita un cliente MCP y conexión a internet.
- Consumer GPU: irrelevante para el servicio; el modelo LLM que use el agente sí tendrá sus propios requisitos.
- Despliegue: sin despliegue local; se conecta por HTTP con `claude mcp add dchub --transport http https://dchub.cloud/mcp`, mediante JSON de configuración (`{"mcpServers": {"dchub": {"url": "https://dchub.cloud/mcp"}}}`) o vía `npx -y mcp-remote https://dchub.cloud/mcp` para clientes solo-stdio.
- Latencia y throughput: no disponible; se puede probar en el playground web sin registro.

## Comparativa con modelos similares

No es un modelo, por lo que la comparación se hace con otras fuentes de datos de infraestructura accesibles para agentes. No hay datos suficientes para una tabla cuantitativa; comparativa cualitativa:

| Alternativa | Tipo | Cobertura declarada | Acceso para agentes | Licencia |
|---|---|---|---|---|
| DC Hub (dchub.cloud) | Servidor MCP de datos en vivo | 20.400+ instalaciones, 170+ países, 83 herramientas | MCP HTTP nativo, tier gratuito sin clave | CC-BY-4.0 |
| Fuentes públicas (EIA, operadoras de red, registros locales) | Datos dispersos, sin API unificada | Variable por país | Requiere scraping o ETL propio | Variable |
| Bases comerciales (Synergy Research, Structure Research, etc.) | Informes de mercado de pago | Variable | Sin integración MCP típica | Propietaria, de pago |

No disponible una comparativa numérica de rendimiento con alternativas equivalentes.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni razona por sí mismo; necesita un LLM agente que invoque sus herramientas.
- Las cifras de la model card son estáticas y deliberadamente conservadoras ("floors" redondeados a la baja); la fuente de verdad es el endpoint `/api/v1/canon/phrases`, por lo que conviene verificar valores en vivo antes de citar.
- El idioma declarado es inglés; no hay información sobre soporte de datos o metadatos en otros idiomas, incluido el castellano.
- La licencia CC-BY-4.0 exige atribución a DC Hub (dchub.cloud) en cualquier uso o redistribución de los datos.
- Existe un tier gratuito sin clave, pero no se documentan límites de cuota, SLA ni condiciones del uso comercial del servicio (a diferencia de los datos, que sí son CC-BY-4.0).
- Al depender de un servicio remoto, la disponibilidad y continuidad del endpoint MCP es un riesgo para agentes en producción; conviene gestionar errores y timeouts.
- En Hugging Face registra 0 descargas y 0 likes, por lo que no hay todavía una comunidad de usuarios que valide la calidad de los datos.
- Riesgo de alucinación: no aplica al servicio, pero el LLM que lo consuma puede citar mal los datos; se recomienda forzar la atribución y verificar las respuestas del agente contra las herramientas.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/dchubcloud/dchub
- Space de demostración (DCPI scorer + market compare, MCP): https://huggingface.co/spaces/dchubcloud/dchub
- Dataset de veredictos de mercado: https://huggingface.co/datasets/dchubcloud/dcpi-market-verdicts
- Sitio web: https://dchub.cloud
- Endpoint MCP completo (83 herramientas): https://dchub.cloud/mcp
- Playground web sin registro: https://dchub.cloud/playground
- Endpoint canónico de cifras en vivo: https://dchub.cloud/api/v1/canon/phrases
