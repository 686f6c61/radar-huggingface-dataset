# aashishsinhaa/notion-operator

## Resumen

El modelo `aashishsinhaa/notion-operator` es un fine-tuning del modelo base `Qwen/Qwen2.5-3B-Instruct`, desarrollado por el autor aashishsinhaa. Está diseñado específicamente como un operador de herramientas de nivel 2 (Tier 2 Tool Operator) para extraer parámetros JSON-RPC de las herramientas MCP (Model Context Protocol) de Notion. El objetivo es permitir que un agente LLM genere llamadas estructuradas a la API de Notion de forma fiable, mapeando propiedades, filtros y búsquedas semánticas.

Es relevante porque simplifica la integración de agentes de IA con Notion, un software de productividad ampliamente adoptado, y lo hace mediante un modelo compacto de 3 mil millones de parámetros que puede ejecutarse en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el modelo está limitado al idioma inglés y a un conjunto concreto de herramientas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Qwen/Qwen2.5-3B-Instruct, Transformer decoder-only) |
| Parametros totales | No disponible (el modelo base Qwen2.5-3B-Instruct tiene 3 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | No disponible (no se especifica en la model card) |

## Arquitectura y entrenamiento

La arquitectura no se detalla en la informacion proporcionada, pero al tratarse de un fine-tuning de `Qwen/Qwen2.5-3B-Instruct`, se hereda la arquitectura Transformer decoder-only de Qwen2.5. No se han publicado datos sobre el proceso de entrenamiento, el dataset utilizado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. El modelo se presenta como especializado en extraccion de parametros JSON-RPC para las herramientas MCP de Notion, lo que sugiere un ajuste supervisado sobre ejemplos de llamadas de herramienta, pero no hay informacion publica que lo confirme.

## Capacidades

- Especializado en extraccion de parametros JSON-RPC para herramientas MCP de Notion.
- Soporte de function calling / tool calling en ingles.
- Herramientas soportadas:
  - `API-post-page`: creacion de tareas y notas con mapeo de propiedades.
  - `API-patch-page`: actualizacion de estados, prioridades y fechas de vencimiento.
  - `API-query-data-source`: consulta de colecciones de bases de datos con filtros.
  - `API-post-search`: busqueda semantica en todo el workspace.
- Generacion de texto en ingles.
- No se indica soporte para razonamiento multi-paso, vision, audio ni otros dominios.

## Casos de uso

- Automatizacion de gestion de proyectos: el modelo puede generar llamadas `API-patch-page` para actualizar estados de tareas, prioridades o fechas de vencimiento, integrado en un agente que recibe instrucciones en lenguaje natural.
- Creacion de tareas y notas programaticas: mediante `API-post-page`, se pueden crear entradas en Notion desde un asistente conversacional, con mapeo automatico de propiedades como titulo, etiquetas o responsables.
- Consultas filtradas sobre bases de datos: con `API-query-data-source`, el modelo permite a un agente obtener registros de una base de datos Notion aplicando filtros (por estado, fecha, etc.) sin escribir consultas manuales.
- Busqueda semantica en el workspace: `API-post-search` habilita que un agente encuentre paginas, tareas o documentos relevantes en un espacio de trabajo Notion a partir de una consulta en lenguaje natural.
- Asistentes personales de productividad: combinando varias herramientas, el modelo puede actuar como un operador de Notion en asistentes personales, ejecutando acciones sobre el espacio de trabajo del usuario.
- Integracion en pipelines de agentes MCP: al ser un modelo de tamano reducido, puede desplegarse como modulo de extraccion de parametros en arquitecturas de agentes que ya utilizan el protocolo MCP, reduciendo la latencia y el coste computacional frente a modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se especifican requisitos de hardware en la informacion proporcionada. Al estar basado en un modelo de 3 mil millones de parametros, es probable que pueda ejecutarse en GPU de consumo con al menos 8 GB de VRAM en cuantizacion de 4 bits, pero no hay datos confirmados. Las opciones de despliegue tipicas para modelos de este tamano incluyen vLLM, llama.cpp, Ollama o TGI, aunque no se confirma la compatibilidad especifica.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos sobre modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; no soporta otros idiomas.
- No se han publicado datos sobre sesgos, riesgos de alucinacion o evaluacion de seguridad.
- Las capacidades se limitan a las cuatro herramientas MCP de Notion listadas; no se ha demostrado generalizacion a otras herramientas o dominios.
- No se dispone de informacion sobre el rendimiento en extraccion de parametros en casos complejos o con entradas ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantia de soporte ni mantenimiento por parte del autor.
- Al no haber benchmarks publicos, el rendimiento esperado no es verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aashishsinhaa/notion-operator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
