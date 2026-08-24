# alibaba-pai/SearchQwen2.5-3B

## Resumen

SearchQwen2.5-3B es un modelo de agente de búsqueda desarrollado por el equipo Alibaba PAI, post-entrenado sobre el modelo base Qwen2.5-3B-Instruct mediante trayectorias ReAct verificadas generadas con el pipeline EasyDistill2. Está diseñado para tareas de búsqueda multi-hop y síntesis de evidencia en horizontes largos, interactuando con herramientas estructuradas de tipo `search` y `browse`, lo que le permite ejecutar flujos de razonamiento iterativos en entornos reales de búsqueda web.

El modelo resuelve el problema de los agentes de búsqueda que necesitan integrar información de múltiples fuentes y pasos intermedios, algo que los modelos de instrucción generales no optimizan. Su relevancia radica en que ofrece una alternativa de 3.09B parámetros (arquitectura densa) con rendimiento notablemente superior al modelo base en tareas de búsqueda multi-hop y deep search, según los benchmarks publicados con evaluador LLM. Su licencia es `qwen-research`, con restricciones de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parametros totales | 3.397.103.616 (3.09B según el autor) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; el base Qwen2.5-3B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | No disponibles en la model card |
| Idiomas soportados | No disponibles |
| Licencia | qwen-research (términos específicos de Qwen, no Apache 2.0) |
| Formato de pesos | safetensors (shards) |

## Arquitectura y entrenamiento

SearchQwen2.5-3B parte del checkpoint Qwen2.5-3B-Instruct, un transformer causal denso de 3.09B parámetros. El post-entrenamiento consiste en un SFT sobre trayectorias de búsqueda multi-hop alineadas con el entorno, seguido de un post-entrenamiento orientado a procesos (process-aware post-training). Las trayectorias se generan mediante el pipeline EasyDistill2, que produce trayectorias ReAct verificadas contra un entorno de búsqueda real, garantizando que las acciones de herramienta (search/browse) y las respuestas finales sean coherentes con la evidencia recuperada.

El modelo está pensado para interacción estructurada mediante tool-calling (recomendado), aunque también se evalúa la interacción de texto estilo Search-R1. El dataset complementario `alibaba-pai/SynSearch-Data` se publica como recurso asociado para reproducir el entrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-hop: integra evidencia de múltiples pasos de búsqueda para responder preguntas complejas.
- Tool calling estructurado: emite llamadas a herramientas `search` y `browse` de forma nativa, siguiendo el formato de Qwen2.5.
- Razonamiento ReAct: ejecuta ciclos de acción-observación para navegar por resultados de búsqueda y refinar consultas.
- Deep search: capacidad de realizar búsquedas en profundidad, iterando sobre documentos y extrayendo información de largo alcance.
- Capacidades multilingües: no especificadas en la model card, pero heredadas del base Qwen2.5-3B-Instruct (que soporta más de 29 idiomas).
- Compatible con el pipeline de transformers y vLLM para despliegue en producción.

## Casos de uso

- Búsqueda documental multi-hop en entornos corporativos: el modelo puede iterar sobre resultados de búsqueda web o bases documentales internas, encadenando consultas para resolver preguntas que requieren cruzar varias fuentes, gracias a su soporte de tool calling y razonamiento ReAct.
- Asistentes de investigación automatizada: para generar informes sintetizados a partir de búsquedas profundas, el modelo navega por páginas, extrae datos y produce respuestas con citas implícitas, reduciendo el trabajo manual de un analista.
- Integración en pipelines de RAG avanzado: se puede combinar con un motor de búsqueda (p. ej. Elasticsearch, Bing Search API) para que el modelo decida qué consultas lanzar, en qué orden y cuándo detenerse, mejorando la precisión frente a un RAG estático.
- Agentes de atención al cliente con acceso a KB: conectado a una base de conocimiento y a herramientas de búsqueda interna, el modelo puede resolver consultas multi-turno que requieren consultar varios artículos o tickets previos.
- Automatización de due diligence y revisión de documentos legales: con tooling de búsqueda en repositorios de contratos o normativas, el modelo localiza cláusulas relevantes en múltiples documentos y sintetiza riesgos.
- Prototipado de agentes de deep search en investigación académica: permite construir demos de búsqueda profunda (tipo "Deep Research") con un modelo ligero que puede ejecutarse en GPU de consumo, ideal para validar flujos antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

Los resultados se obtienen con un evaluador LLM (LLM-judge accuracy) sobre tareas de multi-hop QA y deep search. No se publican los datasets específicos, pero se comparan con el modelo base y con la variante de 7B.

### Interacción estilo texto Search-R1

| Modelo | Multi-hop QA Avg. | Deep Search Avg. | Overall Avg. |
|---|---:|---:|---:|
| Qwen2.5-7B-Instruct (base) | 45,28 | 18,65 | 31,96 |
| SearchQwen2.5-7B | 52,95 | 26,23 | 39,59 |
| Qwen2.5-3B-Instruct (base) | 30,12 | 14,95 | 22,54 |
| **SearchQwen2.5-3B** | **39,55** | **21,15** | **30,35** |

### Interacción con tool call estructurado

| Modelo | Multi-hop QA Avg. | Deep Search Avg. | Overall Avg. |
|---|---:|---:|---:|
| Qwen2.5-7B-Instruct (base) | 45,23 | 24,35 | 33,33 |
| SearchQwen2.5-7B | 55,90 | 33,33 | 44,61 |
| Qwen2.5-3B-Instruct (base) | 36,10 | 7,05 | 21,60 |
| **SearchQwen2.5-3B** | **48,58** | **21,40** | **35,00** |

### Generalización a otro backbone (tool call estructurado)

| Modelo | Deep Search Avg. | Overall Avg. |
|---|---:|---:|
| Qwen3-8B (base) | 24,50 | 40,31 |
| SearchQwen3-8B | 35,42 | 50,31 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: alrededor de 6,5 GB (el repo pesa 6,8 GB en safetensors), por lo que cabe en GPUs de consumo de 8 GB.
- Con cuantización INT8 o INT4 (no proporcionada por el autor, pero posible con herramientas como llama.cpp o vLLM), el consumo puede reducirse a 3-4 GB o 2 GB respectivamente, aunque no está verificado por el autor.
- GPU recomendadas: NVIDIA L20 (validada por el autor), RTX 4090, RTX 4080, A10, o cualquier GPU con 8 GB o más de VRAM.
- Despliegue verificado: vLLM con API compatible OpenAI. También es compatible con el pipeline de transformers para prototipado.
- Latencia y throughput: no disponibles en la documentación; se estima que un modelo de 3B en una GPU moderna puede generar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| **SearchQwen2.5-3B** | 3,09B | No especificado (base: 32K) | qwen-research | Agente de búsqueda multi-hop con tool calling |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32K | Apache 2.0 | Instrucción general, sin optimización para búsqueda |
| SearchQwen2.5-7B | 7,6B | No especificado | qwen-research | Agente de búsqueda multi-hop, mayor capacidad |
| Qwen3-8B (base) | 8,2B | 32K | Apache 2.0 | Instrucción general, con modo thinking |

La comparativa directa con el base muestra una mejora de +9,43 puntos en overall avg con tool call estructurado (35,00 vs 21,60), aunque sigue por debajo del 7B (44,61). La licencia qwen-research es más restrictiva que Apache 2.0 para uso comercial.

## Limitaciones y advertencias

- Licencia `qwen-research`: no permite uso comercial general; solo uso en investigación. Verificar los términos completos en el LICENSE del repo.
- Tamaño reducido: con 3,09B parámetros, el rendimiento en razonamiento complejo y deep search es inferior a modelos de 7B o mayores; puede fallar en consultas que requieren mucha lógica o conocimiento enciclopédico.
- Contexto no confirmado: la model card no especifica la longitud de contexto del modelo post-entrenado; aunque el base soporta 32K, el fine-tune podría reducirlo o no estar optimizado para secuencias muy largas.
- Evaluación con LLM-judge: los benchmarks reportados dependen de un evaluador automático y no de métricas estándar, por lo que los resultados pueden no ser comparables con otros modelos evaluados de forma diferente.
- Sesgos del base: el modelo hereda los sesgos del Qwen2.5-3B-Instruct, que pueden manifestarse en respuestas sobre temas sociales, políticos o culturales.
- Riesgo de alucinación en búsqueda: al integrar múltiples fuentes, el modelo puede generar respuestas que no estén fielmente respaldadas por la evidencia recuperada, especialmente en deep search con documentos ambiguos.
- No se proporcionan datos de cuantización oficiales ni benchmarks de latencia, por lo que el despliegue en entornos con recursos limitados debe validarse experimentalmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibaba-pai/SearchQwen2.5-3B
- Dataset complementario: https://huggingface.co/datasets/alibaba-pai/SynSearch-Data
- Modelo base (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Artículo de Fortune sobre descargas de Qwen: https://fortune.com/2026/08/15/alibaba-qwen-open-ai-models-3-billion-downloads-meta-google/
