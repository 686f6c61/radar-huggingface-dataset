# ai3inc/opentoolsearch-embed-0.6b

## Resumen

OpenToolSearch Embed 0.6B es un modelo de embeddings de texto especializado en la recuperación de herramientas (tool retrieval) para agentes basados en modelos de lenguaje. Lo desarrolla AI3 Inc. y se construye mediante fine-tuning del modelo base Qwen/Qwen3-Embedding-0.6B. Su función es resolver un problema concreto: cuando un agente dispone de cientos o miles de definiciones de herramientas (declaraciones de funciones, herramientas MCP), incluirlas todas en el prompt consume tokens y degrada la calidad de selección. Este embedder actúa como primera etapa de un pipeline de búsqueda de herramientas: indexa cada herramienta una sola vez, embebe cada petición del usuario y entrega las 25 herramientas más cercanas a un reranker.

El modelo tiene 595.776.512 parámetros (aproximadamente 0,6B) en bfloat16, ocupa 1,2 GB en el repositorio y produce vectores de 1.024 dimensiones. Utiliza pooling de último token con normalización L2, propio de la familia sentence-transformers. Admite hasta 512 tokens por definición de herramienta en los benchmarks publicados. Forma pareja con el reranker ai3inc/opentoolsearch-rerank-0.6b; ambos componen el sistema OpenToolSearch y ambos se distribuyen con licencia Apache-2.0.

Su relevancia actual radica en que ofrece, con pesos abiertos y ejecución local, una alternativa a las funciones de búsqueda de herramientas que los proveedores de API ofrecen del lado del servidor. Según la model card, el par completo responde con una latencia mediana de 66 ms y un coste estimado de 0,19 dólares por cada 1.000 búsquedas sobre una GPU B300, manteniendo la biblioteca de herramientas dentro de la infraestructura del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen/Qwen3-Embedding-0.6B); pooling de ultimo token con normalizacion L2 |
| Parametros totales | 595.776.512 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 tokens por definicion de herramienta en los benchmarks publicados; longitud maxima de contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (entrenamiento principal); probado con peticiones en coreano sobre descripciones de herramientas en ingles; otros idiomas no evaluados |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder derivado de Qwen3-Embedding-0.6B, ajustado específicamente para la tarea de recuperación de herramientas. La salida es un vector de 1.024 dimensiones obtenido mediante pooling del último token y normalización L2, el esquema estándar de la familia sentence-transformers. El pipeline declarado es feature-extraction y la longitud de entrada considerada en la evaluación es de hasta 512 tokens por definición de herramienta.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que el entrenamiento se realizó principalmente en inglés y que el modelo se evaluó con peticiones en coreano sobre descripciones de herramientas en inglés, con una pérdida de 0,8 puntos en el conjunto propio. La innovación principal no reside en la arquitectura, sino en el diseño del pipeline en dos etapas: este embedder recupera las 25 herramientas más próximas y el reranker ai3inc/opentoolsearch-rerank-0.6b refina la selección. El ajuste mejora al modelo base en la primera etapa (66,0 / 85,9 / 80,4 frente a 63,6 / 83,6 / 79,0 en nDCG@10 sobre ToolRet público, conjunto propio y conjunto propio en coreano).

## Capacidades

- Generación de embeddings de texto para recuperación semántica, con vectores de 1.024 dimensiones normalizados en L2.
- Búsqueda de herramientas (tool search) sobre bibliotecas grandes de definiciones de funciones y herramientas MCP.
- Recuperación de candidatos para una segunda etapa de reranking: entrega las 25 herramientas más cercanas a cada petición.
- Soporte de function calling y agentes como caso de uso indirecto: habilita la selección dinámica de herramientas en pipelines de agentes.
- Capacidad multilingüe limitada: entrenado principalmente en inglés y probado con peticiones en coreano; otros idiomas no evaluados.
- Integración con sentence-transformers y con text-embeddings-inference (según los tags del repositorio).
- No es un modelo generativo: no produce texto, razonamiento, código ni matemáticas; su única salida es un vector de embedding.

## Casos de uso

- Búsqueda de herramientas en agentes con bibliotecas grandes: el modelo indexa una vez cada definición de herramienta y, en cada petición, recupera las 25 más relevantes para pasarlas al reranker, evitando incluir cientos de definiciones en el prompt y reduciendo el consumo de tokens.
- Enrutamiento de peticiones en asistentes con MCP: en un servidor MCP con miles de herramientas registradas, el embedder selecciona el subconjunto candidato antes de invocar al modelo de lenguaje, lo que permite mantener el contexto del prompt acotado.
- Construcción de pipelines de agentes multi-paso: en cada paso del razonamiento, el agente puede consultar la biblioteca de herramientas sin cargarla completa, gracias a la latencia de milisegundos del embedding de la petición.
- Despliegue local con requisitos de privacidad: al ser pesos abiertos y ejecutarse en la propia infraestructura, la biblioteca de herramientas y las peticiones no salen de las máquinas del usuario, algo relevante en entornos con datos sensibles.
- Indexación y búsqueda semántica de catálogos de funciones en plataformas internas: equipos que mantienen un registro central de funciones pueden ofrecer búsqueda semántica sobre él con un modelo de 0,6B y 1,2 GB de pesos.
- Evaluación y comparación de estrategias de tool search: sirve como primera etapa intercambiable en experimentos con distintos rerankers, ya que la model card documenta su comportamiento detrás de varios first stages (callbus-emb-8b, Nemotron-3-Embed-8B, Qwen3-Embedding-8B, Tool-Embed-4B).
- Procesamiento por lotes a gran escala: con un throughput declarado de 37.000 búsquedas por hora en una B300, es adecuado para indexar bibliotecas extensas o para servir búsquedas masivas.

## Benchmarks y rendimiento

Resultados en nDCG@10 según la model card. ToolRet (público): 769 preguntas, cada una buscada dentro de su propio conjunto de origen. OTS-MCP-1k: 1.000 herramientas MCP y 200 peticiones, conjunto propio del autor.

| Sistema | Tipo | ToolRet (publico) | OTS-MCP-1k (propio) | En coreano | Coste / 1.000 busquedas | Latencia mediana |
|---|---|---|---|---|---|---|
| Gemini tool search · gemini-4-hydrogen | hosted | 73,5 | 88,3 | 83,8 | 30 $ (lista 51 $) | 10,0 s |
| Tool-DE (4B + 4B) | open weights | 72,0 | 91,4 | 89,5 | 0,29 $ | 0,15 s |
| OpenToolSearch reranker tras callbus-emb-8b (7,6B + 0,6B) | open weights | 71,8 | 89,4 | 89,0 | 0,20 $ | 0,10 s |
| OpenToolSearch (0,6B + 0,6B) | open weights | 70,8 | 89,0 | 88,2 | 0,19 $ | 0,10 s |
| Gemini tool search · gemini-3.8-flash | hosted | 70,6 | 85,6 | 79,0 | 17 $ (lista 28 $) | 9,95 s |
| callbus-emb-8b (8B, solo embedding) | open weights | 68,6 | 86,6 | 84,2 | 0,04 $ | 0,02 s |
| OpenAI tool search · gpt-6.2-sol | hosted | 66,6 | 82,4 | 81,1 | 34 $ | 3,43 s |
| OpenAI tool search · gpt-6-luna | hosted | 65,5 | 88,2 | 85,5 | 0,35 $ (lista 1,74 $) | 3,15 s |
| Claude tool search · Opus 5.5 max effort | hosted | 60,1 | 61,8 | 58,9 | 62 $ | 11,8 s |
| Claude tool search · Haiku 5.5 | hosted | 53,3 | 57,1 | 56,5 | 0,52 $ | 2,53 s |

Rendimiento como primera etapa, con el reranker de OpenToolSearch leyendo las 25 primeras herramientas:

| Primera etapa | Solo (publico / propio / coreano) | + reranker OpenToolSearch | Ganancia | Todas las herramientas etiquetadas en el top 25 |
|---|---|---|---|---|
| callbus-emb-8b (7,6B) | 68,6 / 86,6 / 84,2 | 71,8 / 89,4 / 89,0 | +3,2 / +2,8 / +4,8 | 84% / 100% / 98% |
| Nemotron-3-Embed-8B (8B) | 66,1 / 81,6 / 77,7 | 71,2 / 87,1 / 86,3 | +5,2 / +5,5 / +8,6 | 83% / 95% / 93% |
| Qwen3-Embedding-8B (7,6B) | 65,5 / 84,4 / 82,9 | 71,0 / 88,5 / 88,4 | +5,6 / +4,1 / +5,5 | 84% / 98% / 98% |
| Tool-Embed-4B (4,0B) | 67,3 / 86,6 / 81,5 | 71,0 / 89,2 / 85,8 | +3,7 / +2,6 / +4,3 | 82% / 98% / 95% |
| OpenToolSearch-Embed-0.6B (0,6B) | 66,0 / 85,9 / 80,4 | 70,8 / 89,0 / 88,2 | +4,8 / +3,1 / +7,7 | 83% / 98% / 98% |
| Qwen3-Embedding-0.6B (0,6B) | 63,6 / 83,6 / 79,0 | 70,6 / 87,3 / 87,2 | +7,0 / +3,7 / +8,2 | 82% / 96% / 94% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bfloat16 para los pesos; con overhead de activaciones y batches pequeños, el consumo se mantiene en el rango de 2 a 4 GB.
- GPU recomendadas: B300 (usada en las mediciones de la model card); cualquier GPU con al menos 4 GB de VRAM resulta suficiente para inferencia en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (por ejemplo, RTX 3060 en adelante); al ser un modelo de 0,6B, también puede ejecutarse en CPU con latencias mayores.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (según los tags del repositorio); otras opciones no se detallan en la información disponible.
- Latencia y throughput: embedding de una petición en pocos milisegundos; el par completo (embedder + reranker) responde con una mediana de 66 ms por petición y 0,10 s por búsqueda a plena capacidad, lo que equivale a 37.000 búsquedas por hora en una B300.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | ToolRet (publico, nDCG@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenToolSearch-Embed-0.6B | 0,6B | 512 tokens por herramienta | 66,0 solo; 70,8 con reranker | Apache-2.0 | Pesos abiertos en Hugging Face |
| Qwen3-Embedding-0.6B (base) | 0,6B | no disponible | 63,6 solo; 70,6 con reranker | no disponible en la informacion proporcionada | Pesos abiertos en Hugging Face |
| Nemotron-3-Embed-1B | 1,14B | no disponible | 70,4 con reranker (segun highlights) | no disponible en la informacion proporcionada | Pesos abiertos |
| callbus-emb-8b | 7,6B | no disponible | 68,6 solo; 71,8 con reranker | no disponible en la informacion proporcionada | Pesos abiertos |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse principalmente en inglés, el rendimiento puede degradarse con peticiones en otros idiomas.
- Riesgo de alucinación: no aplica directamente, ya que el modelo no genera texto; el riesgo se traslada al modelo de lenguaje que consume las herramientas recuperadas.
- Limitaciones de idioma: entrenado principalmente en inglés; el coreano se probó con una pérdida de 0,8 puntos en el conjunto propio; el resto de idiomas no se evaluó.
- Limitaciones de contexto: la evaluación considera hasta 512 tokens por definición de herramienta; definiciones más largas pueden quedar truncadas y perder información.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-Embedding-0.6B y de los datos de entrenamiento, no detalladas en la información disponible.
- Caveats para producción: el conjunto OTS-MCP-1k es propio del autor y debe ponderarse menos que el benchmark público ToolRet; las diferencias de 1 a 2 puntos entre sistemas en conjuntos de 200 peticiones no son estadísticamente separables según la propia model card; el modelo requiere el reranker complementario para alcanzar los resultados de la tabla principal.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai3inc/opentoolsearch-embed-0.6b
- Reranker complementario: https://huggingface.co/ai3inc/opentoolsearch-rerank-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio del proyecto (imagen de benchmarks): https://raw.githubusercontent.com/ai3inc/opentoolsearch/main/assets/summary.png
- Repositorio GitHub del proyecto: https://github.com/ai3inc/opentoolsearch
