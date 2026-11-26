# ai3inc/opentoolsearch-rerank-0.6b

## Resumen

OpenToolSearch Rerank 0.6B es un reranker tipo cross-encoder desarrollado por AI3 Inc. que constituye la segunda etapa de un pipeline de búsqueda de herramientas (tool search) para agentes. Su función es puntuar la relevancia entre una petición en lenguaje natural y la definición de una herramienta (función, tool MCP), de modo que solo las definiciones más pertinentes se carguen en el prompt del modelo principal. Resuelve el problema de escalar bibliotecas de herramientas: cuando un agente maneja cientos o miles de definiciones, incluirlas todas en el contexto consume tokens y degrada la selección.

El modelo se construye sobre Qwen/Qwen3-Reranker-0.6B, un LM causal adaptado como cross-encoder con una cabeza de clasificación binaria (sí/no). Con 595.776.512 parámetros en bfloat16 (1,2 GB), está pensado para ejecutarse en hardware propio y mantener la biblioteca de herramientas fuera de servicios de terceros. Se combina con un embedder de primera etapa (ai3inc/opentoolsearch-embed-0.6b, también 0.6B) para formar un par de 1,2B parámetros con licencia Apache-2.0.

Su relevancia radica en ofrecer una alternativa abierta y autoalojada a las funciones de tool search hospedadas de OpenAI, Google y Anthropic, con latencias declaradas de 0,10 s por búsqueda y un coste estimado de 0,19 USD por 1.000 búsquedas en una sola GPU. Está entrenado y evaluado principalmente en inglés, con pruebas adicionales sobre peticiones en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre LM causal (Qwen3) con cabeza de clasificación sí/no |
| Parametros totales | 595.776.512 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (entrenamiento y evaluación principal); coreano probado con peticiones sobre herramientas en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-Reranker-0.6B, un transformer causal de la familia Qwen3 reconvertido en reranker mediante una cabeza de decisión binaria que emite una puntuación de idoneidad entre una petición y una definición de herramienta. La arquitectura es la de un cross-encoder: la petición y la definición de la herramienta se procesan conjuntamente, lo que permite capturar interacciones léxicas y semánticas que un bi-encoder no modela. El modelo se integra en un pipeline de dos etapas junto a un embedder de primera etapa que recupera candidatos de la biblioteca completa.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el ajuste se orienta a la tarea de tool retrieval y tool search, con etiquetas específicas para function calling y agentes. El modelo está diseñado para mantener un índice incremental de herramientas: en una biblioteca de 1.000 herramientas, añadir o modificar una herramienta cuesta 16-17 ms, eliminarla menos de 1 ms y una reexploración tras 35 ediciones, 5 adiciones y 5 eliminaciones tarda 143 ms, con reconstrucción completa en 0,9 s.

## Capacidades

- Puntuación de relevancia petición-herramienta: evalúa si una definición de herramienta encaja con una petición dada y devuelve una decisión binaria de idoneidad.
- Reranking de candidatos: reordena los resultados de una primera etapa de recuperación (embedder) para mejorar la precisión del top-k.
- Soporte de tool search y function calling: pensado para pipelines de selección de herramientas en agentes que usan function declarations o tools MCP.
- Integración con agentes: permite cargar solo las 5 mejores definiciones (unas 590 tokens frente a 118.000 de una biblioteca completa de 1.000 herramientas).
- Gestión de bibliotecas dinámicas: el índice asociado admite adiciones, modificaciones y eliminaciones con actualización incremental.
- Capacidades multilingües limitadas: entrenado principalmente en inglés; probado con peticiones en coreano sobre descripciones de herramientas en inglés, con una pérdida de 0,8 puntos.
- No se documentan capacidades de generación de texto libre, razonamiento general, código, matemáticas, visión, audio ni modo thinking; el modelo está especializado en ranking.

## Casos de uso

- Selección de herramientas en agentes con bibliotecas grandes: con cientos o miles de definiciones MCP, el reranker filtra los candidatos recuperados por el embedder y deja solo las herramientas relevantes para el prompt, reduciendo el consumo de contexto y mejorando la elección del modelo principal.
- Enrutamiento de peticiones a APIs internas: en una plataforma con decenas de endpoints documentados, el par embedder-reranker identifica la función adecuada para cada solicitud en lenguaje natural antes de invocar el modelo generativo.
- Asistentes de desarrollo con catálogos de plugins: permite que un agente de IDE localice la herramienta o skill correcta entre un catálogo extenso sin incluir todo el catálogo en el contexto.
- Automatización de soporte con herramientas corporativas: en un asistente que debe elegir entre herramientas de ticketing, CRM y facturación, el reranker puntúa la idoneidad de cada definición y reduce llamadas erróneas.
- Indexación incremental de catálogos cambiantes: equipos que añaden o modifican herramientas a diario pueden mantener el índice actualizado con costes de milisegundos por edición, sin reconstrucciones completas.
- Despliegue autoalojado con requisitos de privacidad: organizaciones que no pueden enviar sus definiciones de herramientas a servicios hospedados ejecutan el par de 1,2B en su propia GPU con licencia Apache-2.0.
- Evaluación y benchmarking de pipelines de retrieval: el modelo sirve como segunda etapa reproducible para comparar estrategias de recuperación de herramientas sobre corpus propios.

## Benchmarks y rendimiento

Resultados declarados en la model card (nDCG@10). ToolRet es un benchmark público de 769 preguntas; OTS-MCP-1k es un conjunto propio de 1.000 herramientas MCP y 200 peticiones; la columna en coreano usa las mismas peticiones con herramientas en inglés.

| Sistema | Tipo | ToolRet (público) | OTS-MCP-1k (propio) | En coreano | Coste / 1.000 búsquedas | Latencia mediana |
|---|---|---|---|---|---|---|
| Gemini tool search · gemini-4-hydrogen | hospedado | 73,5 | 88,3 | 83,8 | 30 USD (lista 51) | 10,0 s |
| Tool-DE (4B + 4B) | pesos abiertos | 72,0 | 91,4 | 89,5 | 0,29 USD | 0,15 s |
| OpenToolSearch (callbus-emb-8b + Rerank-0.6B) | pesos abiertos | 71,8 | 89,4 | 89,0 | 0,20 USD | 0,10 s |
| OpenToolSearch (Embed-0.6B + Tool-Rank-4B) | pesos abiertos | 71,8 | 90,8 | 90,8 | 0,49 USD | 0,25 s |
| OpenToolSearch (Embed-0.6B + Rerank-0.6B) | pesos abiertos, este repo | 70,8 | 89,0 | 88,2 | 0,19 USD | 0,10 s |
| Gemini tool search · gemini-3.8-flash | hospedado | 70,6 | 85,6 | 79,0 | 17 USD (lista 28) | 9,95 s |
| callbus-emb-8b (8B, solo embedding) | pesos abiertos | 68,6 | 86,6 | 84,2 | 0,04 USD | 0,02 s |
| OpenAI tool search · gpt-6.2-sol | hospedado | 66,6 | 82,4 | 81,1 | 34 USD | 3,43 s |
| OpenAI tool search · gpt-6-luna | hospedado | 65,5 | 88,2 | 85,5 | 0,35 USD (lista 1,74) | 3,15 s |
| Claude tool search · Opus 5.5 max effort | hospedado | 60,1 | 61,8 | 58,9 | 62 USD | 11,8 s |
| Claude tool search · Haiku 5.5 | hospedado | 53,3 | 57,1 | 56,5 | 0,52 USD | 2,53 s |

Datos adicionales de la model card: el reranker detrás del embedder callbus-emb-8b alcanza 71,8 / 89,4 / 89,0; detrás del embedder propio de 0,6B, 70,8 / 89,0 / 88,2. Tool-Rank-4B detrás del embedder propio obtiene 71,8 / 90,8 / 90,8 con 2,6 veces el tiempo. En el corpus completo de ToolRet (pregunta + instrucción, 44.453 herramientas) el sistema queda segundo entre los publicados con 58,4 nDCG@10, medido con NVIDIA Nemotron-3-Embed-1B como primera etapa (configuración por defecto antes de la versión 0.2).

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en bfloat16 para los pesos del reranker; el par completo con el embedder de 0,6B ocupa unos 2,4 GB en bfloat16.
- GPU recomendadas: la model card cita una GPU B300 para las mediciones de latencia y coste; por tamaño, cualquier GPU con al menos 4 GB de VRAM puede alojar el par en bfloat16.
- GPU de consumo: cabe en GPUs de consumo actuales (por ejemplo, RTX 4090, RTX 3090 y modelos con 8 GB o más), aunque no se publican mediciones específicas en estas tarjetas.
- Opciones de despliegue: la librería indicada es transformers; el pipeline de dos etapas se instala desde GitHub (`pip install`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 0,10 s por búsqueda con el par de 1,2B en una B300, con mediana de 66 ms por petición y 37.000 búsquedas por hora; coste estimado de 0,19 USD por 1.000 búsquedas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | ToolRet (nDCG@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenToolSearch Rerank 0.6B (con Embed-0.6B) | 1,2B (par) | Reranker cross-encoder + embedder | 70,8 | Apache-2.0 | Pesos abiertos en Hugging Face |
| Tool-DE (4B + 4B) | 8B (par) | Pipeline abierto de tool search | 72,0 | no disponible | Pesos abiertos |
| Tool-Rank-4B (con Embed-0.6B) | 4,6B (par) | Reranker de 4B + embedder | 71,8 | no disponible | Pesos abiertos |
| Gemini tool search (gemini-4-hydrogen) | no disponible | Servicio hospedado | 73,5 | propietaria | API de pago |
| OpenAI tool search (gpt-6.2-sol) | no disponible | Servicio hospedado | 66,6 | propietaria | API de pago |

El modelo destaca por su relación calidad-coste: con 1,2B en total iguala o supera a servicios hospedados de mayor latencia y coste, y queda por debajo de Tool-DE y Tool-Rank-4B en calidad, a cambio de un tiempo de ejecución menor (0,10 s frente a 0,15 s y 0,25 s) y un coste inferior.

## Limitaciones y advertencias

- Idioma: entrenado y evaluado principalmente en inglés; el resto de idiomas no se evaluó. Las peticiones en coreano sobre herramientas en inglés pierden 0,8 puntos, lo que sugiere degradación en otros idiomas no probados.
- Especialización estrecha: es un reranker de relevancia petición-herramienta, no un modelo generativo; no debe usarse para generación de texto, razonamiento general ni código.
- Dependencia de la primera etapa: la calidad final depende del embedder que recupere los candidatos; los resultados cambian según el embedder utilizado (por ejemplo, 70,8 con el embedder propio frente a 71,8 con callbus-emb-8b).
- Benchmark propio: OTS-MCP-1k fue construido por el propio autor, por lo que sus resultados deben ponderarse menos que los del benchmark público ToolRet.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgos ni tasas de error en la información disponible.
- Contexto: no se especifica la longitud máxima de contexto del modelo base, dato relevante para definir herramientas muy largas.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las licencias de los modelos base y del embedder asociado.
- Producción: no se documentan integraciones con servidores de inferencia estándar (vLLM, TGI) ni métricas de throughput en GPUs de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai3inc/opentoolsearch-rerank-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Embedder de primera etapa: https://huggingface.co/ai3inc/opentoolsearch-embed-0.6b
- Repositorio GitHub del proyecto: https://github.com/ai3inc/opentoolsearch
- Benchmarks detallados: https://github.com/ai3inc/opentoolsearch/blob/main/BENCHMARKS.md
- Registro de ejecuciones (ledger): https://github.com/ai3inc/opentoolsearch/blob/main/LEDGER.md
- Imagen resumen de benchmarks: https://raw.githubusercontent.com/ai3inc/opentoolsearch/main/assets/summary.png
