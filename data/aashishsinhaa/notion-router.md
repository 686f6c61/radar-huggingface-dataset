# aashishsinhaa/notion-router

## Resumen

`aashishsinhaa/notion-router` es un clasificador de intenciones de 0.5 mil millones de parámetros, desarrollado como componente del ecosistema de agentes Notion. El modelo se basa en `Qwen/Qwen2.5-0.5B-Instruct` y está diseñado para actuar como un **enrutador de alta velocidad** (Tier 1) dentro de una arquitectura multiagente: recibe un prompt en lenguaje natural y lo clasifica de forma determinista en una de seis intenciones predefinidas (crear tarea, consultar tareas, crear nota, buscar notas, síntesis profunda o respuesta directa), extrayendo además pistas de entidades de alta prioridad para las herramientas Notion MCP.

La relevancia de este modelo radica en su enfoque de **clasificación de intenciones de baja latencia** (sub-200ms), que permite enrutar peticiones a los agentes especializados correspondientes sin necesidad de invocar un LLM grande en cada paso. Al estar basado en un modelo pequeño y de código abierto, es viable para despliegues en entornos con recursos limitados, aunque su ámbito funcional se limita a tareas dentro del ecosistema Notion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basado en Qwen2.5-0.5B-Instruct |
| Parametros totales | 0.5B (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-0.5B-Instruct, un transformer decoder con atención causal estándar. El autor ha realizado un fine-tuning supervisado sobre el modelo base para la tarea de clasificación de intenciones, aunque no se han publicado detalles del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO. La innovación principal no está en la arquitectura base, sino en el diseño del sistema: el modelo actúa como un router determinista que en lugar de generar texto libre, emite una etiqueta de intención y pistas de entidades estructuradas para ser consumidas por herramientas MCP de Notion.

No se dispone de información sobre la composición del dataset, el proceso de fine-tuning ni los hiperparámetros utilizados.

## Capacidades

- Clasificación de intenciones en 6 categorías deterministas: `CREATE_TASK`, `QUERY_TASKS`, `CREATE_NOTE`, `SEARCH_NOTES`, `DEEP_SYNTHESIS` y `DIRECT_ANSWER`.
- Extracción de pistas de entidades de alta prioridad (ej. títulos, fechas, prioridades) para downstream en herramientas Notion MCP.
- Enrutamiento de baja latencia (sub-200 ms) pensado para integración en sistemas multiagente.
- Soporte monolingüe en inglés (según metadatos del modelo).
- No se mencionan capacidades de tool calling directo, visión ni audio; el modelo se limita a la clasificación de texto.

## Casos de uso

- **Asistente de gestión de tareas en Notion**: el modelo recibe un prompt del usuario y lo clasifica como `CREATE_TASK` o `QUERY_TASKS`, permitiendo que un agente posterior cree o consulte tareas en la base de datos de Notion sin invocar un LLM grande en cada petición.
- **Búsqueda y organización de notas**: al detectar `CREATE_NOTE` o `SEARCH_NOTES`, el router extrae entidades como título o palabras clave y las pasa a las herramientas MCP de búsqueda, reduciendo la carga computacional en escenarios de alto volumen.
- **Sistema de síntesis de información**: cuando el prompt requiere análisis profundo (clasificado como `DEEP_SYNTHESIS`), el router deriva la petición a un agente LLM más potente, mientras que las consultas simples se resuelven con `DIRECT_ANSWER` sin escalar.
- **Orquestación de agentes en producción**: en una arquitectura multiagente, el modelo actúa como puerta de entrada para enrutar cada solicitud al agente especializado, minimizando la latencia y el costo de cómputo en sistemas con alto volumen de peticiones.
- **Integración en pipelines de automatización**: puede usarse para clasificar mensajes entrantes de APIs o webhooks y dirigirlos a flujos de trabajo específicos en Notion (ej. creación automática de tareas desde formularios).
- **Filtrado y preprocesamiento de consultas**: antes de enviar un prompt a un LLM grande, el router descarta o clasifica consultas irrelevantes, reduciendo el uso de recursos en sistemas con limitaciones de presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se proporcionan métricas de precisión, recall o F1 para la clasificación de intenciones. La única métrica mencionada es la latencia objetivo (<200 ms), pero no se especifica el hardware ni las condiciones de medición.

## Requisitos de hardware

- Al ser un modelo de 0.5B parámetros, puede ejecutarse en **CPU** con baja latencia en la mayoría de los casos, aunque para un rendimiento óptimo se recomienda una GPU.
- **VRAM estimada**: para inferencia en FP16, se necesitan aproximadamente 1 GB de VRAM; con cuantización de 8 bits o 4 bits, el requisito baja a ~0.5 GB o menos.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (ej. GTX 1650, RTX 3060, RTX 4090) puede ejecutarlo sin problemas. También funciona en GPUs de servidor como A100 o H100, aunque no es necesario.
- **Despliegue**: compatible con frameworks estándar como vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo de clasificación (no generativo), la integración se haría vía API o mediante un wrapper que procese la salida del logits.
- **Latencia**: en una GPU moderna, la inferencia de una sola clasificación debería ser inferior a 10 ms, cumpliendo el objetivo de <200 ms incluso en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (routers de intenciones específicos para Notion). Como referencia genérica, se pueden considerar otros modelos de clasificación de intenciones pequeños, como `distilbert-base-uncased` o `MiniLM`, pero no hay datos públicos que permitan una comparación directa en términos de rendimiento o precisión. Se recomienda evaluar el modelo en el dominio específico de Notion antes de decidir su adopción.

## Limitaciones y advertencias

- **Alcance limitado**: el modelo solo está entrenado para clasificar intenciones dentro del dominio de Notion; no es un modelo de propósito general y no genera texto libre.
- **Dependencia del idioma**: solo soporta inglés; el rendimiento en otros idiomas no está garantizado.
- **Sesgos y alucinación**: al ser un modelo de 0.5B, puede presentar errores en la clasificación de prompts ambiguos o fuera del vocabulario de entrenamiento. No se han publicado evaluaciones de sesgo.
- **Riesgo de errores en entidades**: la extracción de entidades puede ser imprecisa, lo que podría provocar errores en las herramientas MCP aguas abajo.
- **Licencia**: aunque es Apache 2.0, el uso comercial está permitido, pero debe verificarse que los términos de la licencia del modelo base (Qwen2.5) no impongan restricciones adicionales.
- **Falta de documentación**: no se proporcionan detalles sobre el dataset de entrenamiento, métricas de rendimiento ni procedimientos de evaluación, lo que dificulta la validación del modelo en producción.

## Enlaces

- HuggingFace: [aashishsinhaa/notion-router](https://huggingface.co/aashishsinhaa/notion-router)
- Modelo base: [Qwen/Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- Documentación de Notion AI (contexto de uso): [Notion AI](https://www.notion.com/help/guides/category/ai)
