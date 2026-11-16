# rare-disease-atlas/orphan-disease-opportunity-mcp

## Resumen

`orphan-disease-opportunity-mcp` no es un modelo de lenguaje, sino un servidor del Model Context Protocol (MCP) publicado por el proyecto rare-disease-atlas. Expone, mediante herramientas MCP, un atlas de oportunidades de emprendimiento y traslación clínica en enfermedades raras, con dos casos de estudio principales: la mielofibrosis clonal JAK2 V617F+ y la mielofibrosis autoinmune reversible con eje hierro/hepcidina. Su función es servir de interfaz estructurada para que agentes de IA y desarrolladores consulten datos sobre dianas farmacológicas, vías regulatorias, conjuntos de datos abiertos y hitos de validación clínica.

El artefacto se distribuye como paquete Python con dependencias exclusivamente de la biblioteca estándar (Python 3.10 o superior), y puede ejecutarse en local por STDIO mediante `uvx` o conectarse a un endpoint remoto Streamable HTTP sin autenticación. También se ofrece un bundle `.mcpb` y una tarjeta de agente A2A, lo que lo hace desplegable en clientes como Claude Code, Claude Desktop, Cursor, Windsurf o Cline.

Su relevancia es de nicho: no compite con modelos generativos, sino que aporta una capa de datos y herramientas específicas del dominio de enfermedades raras para flujos de razonamiento de agentes. La información pública disponible no incluye parámetros, contexto ni benchmarks, porque no es un modelo neuronal; la ficha documenta sus especificaciones como servidor MCP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servidor MCP (STDIO y Streamable HTTP remoto) con herramientas y OpenAPI 3.1; Python >= 3.10 sin dependencias de terceros |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el contexto lo aporta el modelo cliente que invoca las herramientas) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | MIT para el codigo; CC BY 4.0 para los datos |
| Formato de pesos | no disponible (no hay pesos; se distribuye como paquete Python, bundle `.mcpb` y endpoint HTTP) |

## Arquitectura y entrenamiento

No se trata de un transformer ni de un modelo entrenado. Es un servidor MCP que implementa un conjunto de herramientas (`tools/list` y `tools/call`) sobre un catálogo de oportunidades en enfermedades raras. La implementación es Python puro, sin dependencias externas, y puede ejecutarse por STDIO en local o exponerse como endpoint remoto Streamable HTTP (`https://api.rare-disease-atlas.workers.dev/mcp`). Incluye una especificación OpenAPI 3.1 y una tarjeta de agente A2A en `/.well-known/agent.json`.

La herramienta documentada en la información disponible es `match_founder_opportunities`, que acepta los parámetros `background` (`computational-ai-bio`, `public-health`, `venture-novel-financing`, `all`), `capital_tier` (`bootstrapped-grant`, `seed`, `series-a-platform`, `all`), `wet_lab_required` (booleano) y `disease_id`. Devuelve planes de negocio y traslación con economía unitaria, vías regulatorias, conjuntos de datos abiertos e hitos a 90 días. Los datos se sincronizan desde `https://atlas.rare-disease-atlas.workers.dev/opportunities.json` con respaldo en un `opportunities.json` empaquetado. No se documenta entrenamiento, RLHF ni DPO porque no aplica.

## Capacidades

- Consulta filtrada de oportunidades de emprendimiento y traslación en enfermedades raras por perfil de fundador, nivel de capital, necesidad de laboratorio húmedo e identificador de enfermedad.
- Recuperación de economía unitaria, vías regulatorias, conjuntos de datos abiertos e hitos a 90 días para cada oportunidad.
- Sincronización en vivo desde un catálogo remoto con mecanismo de respaldo local.
- Integración con agentes mediante MCP por STDIO o Streamable HTTP, y descubrimiento vía tarjeta de agente A2A.
- Soporte de tool calling en clientes compatibles con MCP (Claude Code, Claude Desktop, Cursor, Windsurf, Cline, Antigravity).
- Casos de estudio de dominio: mielofibrosis JAK2 V617F+ (dianas JH2 frente a JH1, PDB 4FVR/6E2Q/8BAK/8EX2 frente a 4FVP) y mielofibrosis autoinmune reversible con eje hierro/hepcidina.
- No incluye generación de texto, visión, audio ni razonamiento propio; esas capacidades dependen del modelo cliente.

## Casos de uso

- Evaluación de oportunidades de fármacos huérfanos: un agente invoca `match_founder_opportunities` con `background=computational-ai-bio` y `wet_lab_required=false` para obtener planes que no requieren laboratorio húmedo, como diseño alostérico guiado por estructura o reposicionamiento con datos de célula única.
- Priorización de financiación no dilutiva: con `capital_tier=bootstrapped-grant`, el servidor devuelve oportunidades compatibles con subvenciones SBIR y filantropía de riesgo, junto con hitos a 90 días para planificar la solicitud.
- Análisis regulatorio de enfermedades raras: consulta de ventajas estructurales de la Orphan Drug Act (exclusividad de mercado de 7 años, exención de la tasa PDUFA de 4.682.003 USD para el ejercicio 2026, crédito fiscal del 25 % en ensayos clínicos) para un `disease_id` concreto.
- Investigación asistida por agentes: un agente autónomo conectado por Streamable HTTP remoto puede cruzar oportunidades con conjuntos de datos abiertos citados (GSE144568, GSE156644) y con estructuras PDB para generar hipótesis de reposicionamiento.
- Integración en asistentes de desarrollo: añadir el servidor a Claude Code o Cursor mediante `uvx` para que el asistente consulte el atlas mientras se redacta código de análisis o pipelines de datos biomédicos.
- Prototipado de agentes A2A: usar la tarjeta de agente en `/.well-known/agent.json` para registrar el servidor como par en sistemas multiagente que evalúen oportunidades de biotecnología.
- Docencia y divulgación técnica: el atlas web y las herramientas MCP permiten explorar casos de tractabilidad estructural de mutaciones únicas sin infraestructura de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo neuronal, no aplican métricas como MMLU, HumanEval o GSM8K. La model card menciona una puntuación de Glama MCP, pero no se proporciona su valor en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el servidor no ejecuta inferencia neuronal.
- CPU y memoria: cualquier máquina capaz de ejecutar Python 3.10 o superior; el paquete no tiene dependencias de terceros.
- GPU: no requiere GPU. El endpoint remoto delega el cómputo en la infraestructura del proveedor (Cloudflare Workers).
- Despliegue local: `uvx --from git+https://huggingface.co/rare-disease-atlas/orphan-disease-opportunity-mcp orphan-disease-opportunity-mcp`, o instalación del bundle `.mcpb` v1.4.0.
- Despliegue remoto: conexión directa al endpoint Streamable HTTP sin claves de API, por ejemplo `claude mcp add --transport http orphan-disease-opportunities https://api.rare-disease-atlas.workers.dev/mcp`.
- Latencia y throughput: no disponibles; dependen de la red y del servicio remoto.

## Comparativa con modelos similares

| Servidor | Tipo | Transporte | Dependencias | Autenticacion | Licencia | Datos de dominio |
|---|---|---|---|---|---|---|
| orphan-disease-opportunity-mcp | MCP de dominio biomédico | STDIO y Streamable HTTP | Ninguna (stdlib) | Ninguna | MIT (código), CC BY 4.0 (datos) | Enfermedades raras, fármacos huérfanos, mielofibrosis |
| Servidores MCP de propósito general (p. ej., filesystem, fetch) | MCP de utilidades | STDIO | Variables | Según implementación | Variables | No disponible |
| Alternativas específicas de enfermedades raras | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros servidores MCP comparables en el mismo nicho.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona por sí mismo y no sustituye a un LLM; su utilidad depende del agente cliente.
- Los datos provienen de un catálogo mantenido por el autor y pueden estar incompletos, desactualizados o sesgados hacia las dos enfermedades destacadas (mielofibrosis JAK2 V617F+ y mielofibrosis autoinmune).
- Riesgo de alucinación indirecta: si el agente cliente interpreta mal la salida de las herramientas, puede generar conclusiones clínicas o financieras incorrectas.
- No se documentan idiomas soportados; la model card está en inglés y no se garantiza cobertura multilingüe de los datos.
- El endpoint remoto no requiere autenticación, lo que facilita el uso pero impide controlar el acceso y la trazabilidad de las consultas.
- La licencia del código es MIT, pero los datos están bajo CC BY 4.0, lo que exige atribución en usos derivados.
- No hay validación clínica ni regulatoria de las recomendaciones del atlas; no debe usarse como base única para decisiones médicas o de inversión.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni comunidad consolidada.

## Enlaces

- Hugging Face: https://huggingface.co/rare-disease-atlas/orphan-disease-opportunity-mcp
- Endpoint MCP remoto: https://api.rare-disease-atlas.workers.dev/mcp
- Atlas web: https://atlas.rare-disease-atlas.workers.dev
- Catálogo de oportunidades: https://atlas.rare-disease-atlas.workers.dev/opportunities.json
- Bundle `.mcpb` v1.4.0: https://atlas.rare-disease-atlas.workers.dev/releases/orphan-disease-opportunity-mcp.mcpb
- Tarjeta de agente A2A: https://atlas.rare-disease-atlas.workers.dev/.well-known/agent.json
- Puntuación Glama MCP: https://glama.ai/mcp/servers/rare-disease-atlas/orphan-disease-opportunity-mcp
- Licencia de datos CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Documentación de uv: https://docs.astral.sh/uv/
