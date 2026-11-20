# ai3inc/opentoolsearch-rerank-0.6b

## Resumen

OpenToolSearch Rerank 0.6B es un reranker de tipo cross-encoder desarrollado por AI3 Inc. que actúa como segunda etapa de un pipeline de búsqueda de herramientas (tool search) para agentes. El problema que aborda es concreto: los agentes modernos manejan cientos o miles de definiciones de herramientas (declaraciones de funciones, herramientas MCP), y cargarlas todas en el prompt consume tokens y degrada la calidad de selección del modelo. La búsqueda de herramientas mantiene la biblioteca fuera del prompt, localiza las pocas herramientas relevantes para cada petición y carga solo esas.

El modelo se construye sobre Qwen/Qwen3-Reranker-0.6B, un transformer causal de 0.6B parámetros (595.776.512 según los pesos en safetensors) al que se le añade una cabeza de decisión binaria sí/no para puntuar la adecuación entre una petición y una definición de herramienta. Se recomienda combinarlo con nvidia/Nemotron-3-Embed-1B-BF16 como primera etapa de recuperación, formando un pipeline de 1.14B + 0.6B parámetros.

Es relevante porque ofrece una alternativa abierta y autoalojable a las APIs de tool search que algunos proveedores ya ofrecen del lado del servidor, con licencia Apache-2.0 y sin necesidad de llamadas a un LLM en tiempo de consulta. El modelo está pensado exclusivamente para inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder (cabeza sí/no sobre un transformer causal Qwen3) |
| Parametros totales | 595.776.512 (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre Qwen3-Reranker-0.6B. En lugar de generar texto libre, evalúa un par (petición, definición de herramienta) y emite una puntuación calculada como la diferencia de logits entre los tokens "yes" y "no" en la última posición. La entrada sigue una plantilla con secciones `<Instruct>`, `<Query>` y `<Document>`, con un bloque de sistema que instruye al modelo a juzgar si el documento cumple los requisitos de la consulta.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí documenta que las decisiones sobre modelos base y metodología de entrenamiento se tomaron observando puntuaciones de test, y que el repositorio incluye un registro de evaluación (`LEDGER.md`) con todas las ejecuciones realizadas, incluidas las que perdieron. La innovación principal no es arquitectónica sino de sistema: el uso del modelo como segunda etapa de un pipeline de recuperación en dos fases con fusión de puntuaciones z-normalizadas.

## Capacidades

- Puntuación de adecuación entre una petición de usuario y una definición de herramienta (formato JSON con nombre y descripción).
- Funciona como reranker de segunda etapa sobre candidatos recuperados por un embedder.
- Soporta dos modos de consulta: solo petición (más cercano al tráfico real) y petición más instrucción (escenario más fácil).
- Integración con definiciones de herramientas estilo OpenAI, Anthropic, Gemini y MCP según el ecosistema de la librería OpenToolSearch.
- Diseñado para carga diferida de herramientas (deferred tool loading) en agentes con bibliotecas grandes.
- Capacidad de fusionar su puntuación con la de la primera etapa mediante ponderación z-normalizada.
- No soporta generación de texto libre, visión, audio ni tool calling propio: es exclusivamente un componente de ranking.

## Casos de uso

- Selección de herramientas en agentes con bibliotecas grandes: con miles de definiciones MCP o de funciones, el modelo puntúa cada candidata recuperada por el embedder y permite cargar solo las 5-10 más relevantes, reduciendo el consumo de tokens del prompt.
- Carga diferida en producción: integrado en una función `tool_search` que el agente invoca bajo demanda, evitando incluir la biblioteca completa en cada turno de conversación.
- Enrutamiento de peticiones a APIs internas: dado un catálogo de endpoints o funciones de negocio, el modelo identifica cuáles corresponden a la solicitud del usuario antes de ejecutar llamadas.
- Filtrado de candidatos en pipelines RAG de herramientas: combinado con Nemotron-3-Embed-1B como primera etapa, reduce el ruido de recuperación antes de la selección final.
- Evaluación y auditoría de catálogos de herramientas: puntuar pares petición-herramienta permite detectar definiciones ambiguas o mal descritas que el agente no sabría seleccionar.
- Sistemas multiagente con especialización: cada agente puede disponer de un subconjunto de herramientas recuperado dinámicamente según la tarea, en lugar de un catálogo estático compartido.
- Despliegue autoalojado de tool search: organizaciones que no quieren depender de APIs de proveedor pueden ejecutar el pipeline completo (1.14B + 0.6B) en infraestructura propia con licencia Apache-2.0.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre ToolRet (ACL 2025 Findings): 7.961 preguntas y 44.453 herramientas de 35 datasets fuente, con búsqueda sobre el pool completo. Métrica nDCG@10, media de las tres categorías (web, code, customized). Configuración pregunta + instrucción, top 100 rerankeados salvo indicación.

| Sistema | Tamano | nDCG@10 |
|---|---|---|
| MagicSelector (arXiv 2607.17751) | LLM + embedder 4B + reranker 4B | 59.90 |
| OpenToolSearch (Nemotron-3-Embed-1B + este modelo) | 1.14B + 0.6B | 58.37 |
| Tool-DE (Tool-Embed-4B + Tool-Rank-4B) | 4B + 4B | 57.01 |
| Pipeline open-weights sin entrenamiento (Savirinc/toolret-open-weights) | 1.5B + BM25 + 1B | 55.33 |
| callbus-emb-8b (solo embedding) | 8B | 54.36 |
| Nemotron-3-Embed-1B solo (ejecución propia) | 1.14B | 52.42 |

Vistas adicionales del mismo sistema:

| Vista | OpenToolSearch | Mejor cifra de otro sistema |
|---|---|---|
| Solo pregunta (sin instrucción), top 50 rerankeados | 42.42 | 41.96 |
| Pregunta + instrucción, todas las preguntas agrupadas | 62.47 | 59.36 |

Detalle con pregunta + instrucción:

| Configuracion | nDCG@10 | Recall@10 | Completeness@10 |
|---|---|---|---|
| Top 100 rerankeados | 58.37 | 68.00 | 56.26 |
| Top 50 rerankeados | 58.15 | 67.60 | 55.82 |
| Puntuación del modelo sola, top 50 (sin fusión) | 55.98 | no disponible | no disponible |

Por categoría en top 100: web 52.01, code 61.09, customized 62.01. El autor advierte que muchas subcategorías tienen entre 11 y 50 preguntas y que diferencias inferiores a medio punto son ruido, y que las cifras de otros sistemas son las de sus autores, sin re-ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bfloat16 para los pesos; en la práctica, 2-3 GB con overhead de activaciones y tokenizador.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) compartidas con otros servicios.
- También puede ejecutarse en CPU para volúmenes bajos, aunque con mayor latencia por par evaluado.
- Despliegue: transformers de forma nativa (el snippet de la model card usa `AutoModelForCausalLM`); la librería OpenToolSearch está anunciada para publicación pública. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Al evaluar un par por llamada, el coste escala linealmente con el número de candidatos a rerankear (típicamente 50-100 por petición).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | nDCG@10 ToolRet | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenToolSearch Rerank 0.6B | 0.6B (pipeline 1.14B + 0.6B) | Cross-encoder reranker | no disponible | 58.37 | Apache-2.0 | Hugging Face |
| Tool-DE (Tool-Embed-4B + Tool-Rank-4B) | 4B + 4B | Embedder + reranker | no disponible | 57.01 | no disponible | no disponible |
| MagicSelector | LLM + 4B + 4B | Descomposición de consulta + embedder + reranker | no disponible | 59.90 | no disponible | no disponible |
| callbus-emb-8b | 8B | Solo embedding | no disponible | 54.36 | no disponible | no disponible |

La ventaja principal frente a las alternativas es el tamaño: logra resultados cercanos a sistemas de 8B o pipelines con LLM en consulta usando una fracción de los parámetros y sin llamada a LLM en tiempo de consulta. La desventaja es que no lidera la tabla: queda 1,5 puntos por debajo de MagicSelector.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas, lo que limita su uso en agentes multilingües.
- No es generativo: no puede usarse para responder, razonar ni invocar herramientas; únicamente puntúa pares petición-herramienta.
- Riesgo de falsos positivos y negativos en la selección: una herramienta mal descrita o una petición ambigua puede puntuarse incorrectamente, y el pipeline cargará herramientas equivocadas.
- Dependencia de la primera etapa: el rendimiento final (58.37) asume Nemotron-3-Embed-1B como recuperador; con otro embedder los resultados pueden degradarse.
- El peso de fusión `w` se ajustó contra preguntas de test con validación cruzada, lo que introduce cierto riesgo de sobreajuste al benchmark; el autor lo reconoce explícitamente.
- Las instrucciones de ToolRet fueron generadas por un modelo que veía las herramientas respuesta, por lo que el escenario con instrucción es más fácil que el tráfico real; la fila sin instrucción (42.42) es más representativa.
- Contexto máximo no documentado: no se especifica la longitud máxima de petición más herramienta que el modelo maneja de forma fiable.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el modelo base Qwen3-Reranker-0.6B debe verificarse por si impone condiciones adicionales.
- La librería OpenToolSearch aún no está publicada; hasta entonces la integración requiere implementar el pipeline manualmente con el snippet de la model card.
- Sin descargas ni likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai3inc/opentoolsearch-rerank-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Primera etapa recomendada: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Benchmark ToolRet: https://github.com/mangopy/tool-retrieval-benchmark
- Pipeline open-weights de referencia: https://huggingface.co/Savirinc/toolret-open-weights
- Registro de evaluación (LEDGER.md): incluido en el repositorio del modelo
