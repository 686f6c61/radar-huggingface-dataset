# aashishsinhaa/notion-agent-gguf

## Resumen

`notion-agent-gguf` es un modelo local de propósito específico diseñado para actuar como agente de planificación y enrutamiento para el protocolo Model Context Protocol (MCP) de Notion. Desarrollado por el usuario `aashishsinhaa`, el modelo se basa en Qwen 2.5 (variante 1.5B o 0.5B) y ha sido fine-tuneado con LoRA sobre un dataset sintético de pares prompt-herramienta de Notion. Su objetivo principal es ejecutar tareas rutinarias de Notion (crear tareas, consultar datos de bases de datos) de forma local y determinista, sin depender de la nube, y escalar consultas complejas a Gemini Cloud.

El modelo se distribuye en formato GGUF cuantizado a 4 bits (Q4_K_M), con un peso aproximado de 980 MB en RAM, lo que permite ejecutarlo en portátiles con 16 GB de RAM y CPU Intel sin necesidad de GPU. La relevancia actual radica en la tendencia de ejecutar agentes de IA en el edge, reduciendo latencia y costes de API, y en la creciente adopción de MCP como estándar de integración con herramientas de productividad.

Aunque el modelo está orientado a un caso de uso muy específico (Notion), su arquitectura base (Qwen 2.5) le confiere capacidades generales de generación de texto, aunque el fine-tune prioriza el comportamiento de agente y enrutamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen 2.5, no se especifica variante exacta) |
| Parámetros totales | 1.5B (según nombre del archivo GGUF; podría ser 0.5B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (probablemente 32K estándar de Qwen 2.5) |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (Qwen 2.5 es multilingüe, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | GGUF (Ollama Modelfile) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo Qwen 2.5, que es un transformer de solo decodificador con atención causal. El fine-tune se realiza mediante LoRA (PEFT) sobre un dataset sintético generado por el script `dataset_generator.py`, que produce miles de pares de prompts en lenguaje natural y llamadas a herramientas de Notion MCP (como `API-post-page` y `API-query-data-source`). El entrenamiento se lleva a cabo con las librerías Unsloth o TRL. Posteriormente, los pesos LoRA se fusionan con los pesos base y se cuantizan a GGUF Q4_K_M usando llama.cpp. No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado sobre datos sintéticos.

El modelo no incorpora innovaciones arquitectónicas destacables, sino que es un fine-tune de un modelo ya existente. Su particularidad es el diseño de enrutamiento determinista: en lugar de depender de la generación libre, el modelo decide entre tres acciones: `CALL_NOTION_TOOL` (ejecutar herramienta local), `ESCALATE_TO_GEMINI` (delegar a Gemini Cloud para tareas complejas) o `DIRECT_ANSWER` (responder directamente). Este enfoque híbrido combina un modelo local pequeño con un LLM en la nube.

## Capacidades

- Generación de texto: como base Qwen 2.5, puede generar texto coherente, aunque el fine-tune limita su uso a tareas relacionadas con Notion.
- Enrutamiento determinista: el modelo clasifica la intención del usuario en tres categorías (llamada a herramienta, escalado a Gemini o respuesta directa) y devuelve una acción estructurada.
- Llamada a herramientas (tool calling): puede invocar herramientas MCP de Notion, como crear páginas (tareas/notas) o consultar datos de bases de datos.
- Integración con Ollama: el modelo se distribuye como un Modelfile de Ollama, permitiendo su uso en entornos de escritorio con una instalación sencilla.
- Bajo consumo de recursos: funciona en CPU, con ~980 MB de RAM, sin necesidad de GPU.
- Capacidades multilingües: no documentadas, pero Qwen 2.5 soporta varios idiomas.
- No tiene capacidades de visión ni audio.

## Casos de uso

- **Gestión de tareas en Notion**: el modelo puede crear tareas o notas mediante la herramienta `API-post-page` a partir de una solicitud en lenguaje natural, por ejemplo "Añade la tarea 'Revisar métricas del Q3' con prioridad alta". Esto elimina la dependencia de la API de Gemini y reduce la latencia.
- **Consultas de estado de bases de datos**: puede ejecutar `API-query-data-source` para obtener el estado de proyectos, tickets o cualquier dato almacenado en una base de datos de Notion, respondiendo de forma local.
- **Enrutador de tareas complejas**: para consultas que requieren síntesis de múltiples documentos o creatividad, el modelo decide escalar a Gemini 3.7 Flash, actuando como un router inteligente que optimiza costes (no usa cuota de Gemini para tareas simples).
- **Asistente personal de productividad**: integrado en un asistente de escritorio, puede gestionar la agenda, recordatorios o notas de forma local, sin conexión a internet.
- **Automatización de procesos de negocio**: en un entorno corporativo, el modelo puede actuar como backend de un bot que actualiza bases de datos de Notion (por ejemplo, CRM, seguimiento de proyectos) a partir de comandos de usuario.
- **Prototipado rápido de agentes MCP**: sirve como ejemplo de implementación de un agente local con enrutamiento híbrido, útil para desarrolladores que quieran aprender a construir agentes con MCP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El único dato de rendimiento es el consumo de memoria (~980 MB) y la latencia cero para tareas locales, pero sin cifras concretas de velocidad.

## Requisitos de hardware

- **CPU**: funciona en procesadores Intel de gama media (por ejemplo, i5 o superior), según la model card se dirige a portátiles con 16 GB de RAM.
- **RAM**: aproximadamente 980 MB en memoria para el modelo cuantizado, pero se recomienda al menos 8 GB para el sistema operativo y otras aplicaciones.
- **GPU**: no es necesaria, funciona en CPU.
- **VRAM**: no aplicable (inferencia en CPU).
- **Despliegue**: se distribuye como un Modelfile de Ollama, por lo que se ejecuta con Ollama en Windows, macOS o Linux. También se puede usar con llama.cpp para cargar el GGUF directamente.
- **Latencia**: no se especifica, pero al ser un modelo de 1.5B cuantizado en CPU, se espera una latencia de unos pocos segundos por respuesta en tareas simples.
- **Throughput**: no disponible.

## Comparativa con modelos similares

No existen muchos modelos especializados en MCP de Notion. La comparación se puede hacer con el modelo base Qwen 2.5 1.5B y con otros modelos pequeños de propósito general.

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| notion-agent-gguf | 1.5B (fine-tune) | no disponible | no disponible | GGUF | Agente MCP Notion |
| Qwen 2.5 1.5B | 1.5B | 32K | Apache 2.0 | Safetensors, GGUF | Generalista |
| Llama 3.2 1B | 1B | 128K | Llama 3.2 | Safetensors, GGUF | Generalista |
| Phi-3.5-mini | 3.8B | 128K | MIT | Safetensors, GGUF | Generalista |

La comparación directa no es posible sin benchmarks. El modelo no tiene una licencia especificada, lo que limita su uso comercial sin confirmación. Los otros modelos tienen licencias claras (Apache, MIT, Llama).

## Limitaciones y advertencias

- **Propósito específico**: el modelo está fuertemente sobre-ajustado para tareas de Notion MCP; no es un modelo de propósito general y puede dar respuestas incoherentes o no deseadas si se le piden tareas fuera de su dominio.
- **Datos de entrenamiento sintéticos**: el dataset se genera automáticamente, lo que puede introducir sesgos o patrones artificiales no presentes en el mundo real. No se han realizado evaluaciones de robustez.
- **Alucinación**: como cualquier modelo de lenguaje, puede generar contenido falso o inventar respuestas cuando no tiene suficiente información, especialmente si se le pide síntesis compleja.
- **Enrutamiento determinista**: la decisión de escalar a Gemini depende de la clasificación del modelo, que puede fallar en casos ambiguos, lo que podría enviar a Gemini consultas que deberían resolverse localmente o viceversa.
- **Licencia no especificada**: no se indica licencia en la model card, lo que genera incertidumbre legal para uso comercial o redistribución. Se recomienda contactar con el autor antes de usarlo en producción.
- **Contexto limitado**: aunque Qwen 2.5 soporta 32K de contexto, no se ha confirmado que el fine-tune conserve esta capacidad; el modelo podría estar limitado a contextos cortos.
- **Sin soporte de visión o audio**: solo texto.
- **Fecha de creación**: el modelo fue creado en 2026 (fecha futura), lo que sugiere que puede ser experimental y no estar actualizado.

## Enlaces

- [Hugging Face - aashishsinhaa/notion-agent-gguf](https://huggingface.co/aashishsinhaa/notion-agent-gguf)
- [Notion AI Guides](https://www.notion.com/help/guides/category/ai)
- [100 Notion AI Agent Use Cases](https://notion.notion.site/100-Notion-AI-Agent-Use-Cases-26cefdeead0580d583eacfa1265221a9)
- [Meet your 24/7 AI team - Notion](https://www.notion.com/product/agents)
- [The AI Transformation Model - Notion](https://notion.notion.site/Official-The-AI-Transformation-Model-2d1efdeead05802e867edea1e3a470b8)
- [Building a Disposable Notion Agent on Cheap Models - dev.to](https://dev.to/ashish_mishra_8491c3b9912/building-a-disposable-notion-agent-on-cheap-models-m5b)
