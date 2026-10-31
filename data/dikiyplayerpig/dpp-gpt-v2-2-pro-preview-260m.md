# dikiyplayerpig/dpp-gpt-V2.2-Pro-preview-260m

## Resumen

dpp-gpt V2.2 Pro preview es un modelo lingüístico de 260 millones de parámetros entrenado íntegramente desde cero por una única persona (dikiyplayerpig) sobre una GPU de consumo (RTX 4060). Se trata de una versión preview del SFT de la generación 2.2, construida sobre el modelo base dikiyplayerpig/dpp-gpt-V2.2-base-260m, y cuyo interés principal es demostrar que un pipeline completo de pre-entrenamiento, fine-tuning y evaluación puede ejecutarse con recursos mínimos. El modelo habla ruso, inglés y francés, razona paso a paso mediante un mecanismo de thinking con etiquetas `<think>`, llama a herramientas, genera JSON a partir de descripciones y resuelve aritmética de números largos dígito a dígito.

Arquitecturalmente es un transformer estilo Llama (RMSNorm, RoPE, SwiGLU, GQA) con 20 capas y contexto de 8192 tokens, con embeddings de entrada y salida atados (259M totales, 242M únicos). Fue pre-entrenado con unos 31B de tokens acumulados y ajustado con unos 60M de tokens de datos SFT sintéticos, mayoritariamente diálogos, generados con DeepSeek V4 Flash y verificados con Python cuando contenían números. La versión preview es un promedio de pesos de los dos mejores checkpoints SFT. El autor anuncia una versión final 2.2 Pro con RL/GRPO, por lo que este modelo es relevante como referencia de un proyecto open source de pequeño escala y como base experimental, no como competidor de modelos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (RMSNorm, RoPE, SwiGLU, GQA) |
| Parámetros totales | 259M (242.263.040 únicos según safetensors, embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | Ruso, inglés, francés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors (LlamaForCausalLM), PyTorch .pth |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer estilo Llama con 20 capas, dimensión oculta de 1024, 16 cabezas de atención y 4 cabezas KV (GQA, que reduce el coste de la caché KV), vocabulario BPE propio de 16.384 tokens y RoPE para codificación posicional. Los embeddings de entrada y salida están atados, lo que explica la diferencia entre los 259M nominales y los 242M únicos.

El pre-entrenamiento continuó desde la generación 2.1 Base añadiendo unos 19B de tokens (31B acumulados en total, 59.090 pasos de 524k tokens, LR pico 0,0001 con decaimiento lineal). La mezcla de datos incluye Wikipedia y CulturaX en ru/en/fr, código Python y web, Cosmopedia, Zyda-2, poesía, traducciones y un 15 % de matemáticas sintéticas (aritmética, ecuaciones, fracciones, números de hasta 40 dígitos). El SFT usó unos 60M de tokens: 68 % diálogos (chat general multi-turno, seguimiento de instrucciones, matemáticas con soluciones, Python, ensayos, needle in a haystack hasta 6000 tokens, tool calling con casos negativos, JSON, identidad) y 32 % replay del pre-entrenamiento. Aproximadamente la mitad de las respuestas incluyen razonamiento en `<think>…</think>`; los datos fueron generados con DeepSeek V4 Flash vía OpenRouter (coste aproximado de 20 dólares) y todas las respuestas con números fueron recomputadas y verificadas con Python. La versión preview es un promedio de pesos (0,7/0,3) de los dos mejores checkpoints SFT finales.

## Capacidades

- Generación de texto conversacional multilingüe (ruso, inglés, francés) en diálogos multi-turno de hasta 12 mensajes con distintos estilos y tonos.
- Razonamiento paso a paso activable mediante el mecanismo de thinking con etiquetas `<think>…</think>` (chain-of-thought).
- Tool calling: tres formatos de llamada, entrenado también para no llamar a una herramienta cuando no es necesaria.
- Generación de JSON válido a partir de descripciones en lenguaje natural.
- Aritmética con números largos (hasta 40 dígitos) resuelta dígito a dígito, ecuaciones, fracciones y decimales.
- Seguimiento de instrucciones con restricciones de formato (idioma, límite de palabras, listas, palabras inicial/final).
- Búsqueda de información en contextos largos (needle in a haystack hasta 6000 tokens).
- Generación de código Python (funciones pequeñas con tests unitarios ocultos y programas abiertos).
- Escritura de poesía y ensayos cortos con estructura.

## Casos de uso

- Chatbots multilingües ligeros: su tamaño de 260M y contexto de 8192 tokens permiten desplegar asistentes conversacionales en ruso, inglés o francés en hardware muy modesto, incluso en portátiles sin GPU dedicada.
- Extracción estructurada de datos: puede generar JSON válido a partir de descripciones, útil para pipelines de ETL o relleno de formularios donde se necesite salida estructurada sin un modelo grande.
- Orquestación de herramientas en agentes pequeños: su entrenamiento específico en tool calling (incluyendo abstención cuando la herramienta no aplica) lo hace adecuado para agentes simples de una o pocas herramientas con bajo presupuesto de cómputo.
- Cálculo aritmético de precisión arbitraria: el entrenamiento con números de hasta 40 dígitos dígito a dígito lo hace útil como verificador aritmético en flujos donde no se quiere llamar a una API externa.
- Seguimiento de instrucciones con restricciones estrictas de formato: útil para generar contenido con límites de palabras, listas o palabras obligatorias en generación automatizada de textos.
- Búsqueda de información en documentos: la capacidad needle in a haystack hasta 6000 tokens permite localizar datos concretos en textos cortos con distractores, útil en RAG de bajo coste.
- Generación de código Python sencillo: puede escribir funciones pequeñas verificables con tests, adecuado para asistentes de código embebidos en IDEs ligeros.
- Proyecto educativo y de investigación: al ser un modelo entrenado desde cero por una persona con documentación detallada del pipeline, es un recurso valioso para estudiar cómo se construye un LLM completo con recursos limitados.

## Benchmarks y rendimiento

El autor publica resultados de su propia suite (12 áreas, 2450 preguntas en ru/en/fr, cada pregunta evaluada con y sin thinking, temperatura 0,1), no de benchmarks públicos estándar, por lo que no son comparables con otros modelos. La media general pasó del 8,3 % (2.15 Pro) al 17,8 % en esta versión. Destaca que el SFT redujo la puntuación en matemáticas: el base obtiene 47,6 %, el primer SFT 26,0 % y el preview 36,8 %.

| Área | Preguntas | Evaluación | Puntuación |
|---|---|---|---|
| Media general (suite propia) | 2450 | mixta (código y Gemma 4 26B) | 17,8 % |
| Math (aritmética generada) | 2200 | código | 36,8 % (base: 47,6 %) |
| Instr, reading, wordmath, json, tools, knowledge, mcq, pysmall, pyopen, poem, essay, chat | Desglose no publicado en la información disponible | mixta | no disponible |

No se han publicado resultados de benchmarks estándar públicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 242M de parámetros, la versión F16 ocupa unos 0,5 GB; Q8_0 unos 0,26 GB; Q4_K_M unos 0,15 GB. Con contexto de 8192 tokens y GQA, cabe cómodamente en cualquier GPU moderna con 2 GB de VRAM o más, e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; ejecutable en CPU. Cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090) es más que suficiente. El entrenamiento completo se realizó en una RTX 4060.
- Consumer GPU: cabe sobradamente en cualquier GPU de consumo, incluidas integradas, en cualquiera de sus cuantizaciones.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) gracias a los GGUF; transformers de Hugging Face con `LlamaForCausalLM` mediante safetensors; endpoints compatibles de Hugging Face.
- Latencia y throughput estimados: no disponible en la información publicada; dado el tamaño, se espera inferencia muy rápida incluso en CPU, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| dpp-gpt V2.2 Pro preview | 259M (242M únicos) | 8192 | Apache 2.0 | Entrenado desde cero, ru/en/fr, thinking y tool calling propios |
| Qwen2.5-0.5B-Instruct | 494M | 32768 (128k con YaRN) | Apache 2.0 (algunas variantes Qwen) | Multilingüe amplio, benchmarks públicos mucho superiores, ecosistema maduro |
| SmolLM2-360M-Instruct | 360M | 8192 | Apache 2.0 | Inglés principalmente, entrenado por Hugging Face con datos públicos documentados |
| Llama 3.2 1B Instruct | 1235M | 131072 | Llama 3.2 Community License | Muy superior en capacidad, pero licencia restrictiva y mayor requerimiento de hardware |

En términos absolutos, dpp-gpt V2.2 Pro preview rinde por debajo de los modelos comerciales de tamaño similar o superior; su valor diferencial está en la trazabilidad completa del entrenamiento, el soporte explícito de ruso junto a inglés y francés en tamaño mínimo, y la licencia Apache 2.0 sin restricciones.

## Limitaciones y advertencias

- Rendimiento general bajo: la media de su propia suite es del 17,8 %, y el propio autor advierte que los benchmarks están sesgados a favor del modelo, por lo que el rendimiento real en tareas generales puede ser incluso menor.
- El SFT degradó las capacidades matemáticas respecto al modelo base (36,8 % frente a 47,6 %); la recuperación de esta capacidad es objetivo pendiente de la fase RL/GRPO.
- Es una versión preview: los pesos son un promedio de checkpoints y la versión final 2.2 Pro aún no está disponible.
- Sesgos: los datos SFT fueron generados mayoritariamente por DeepSeek V4 Flash, por lo que hereda posibles sesgos de ese modelo y de los corpus web (CulturaX, Zyda-2) usados en el pre-entrenamiento. No se documentan auditorías de sesgo.
- Riesgo de alucinación elevado, esperable en un modelo de 260M con solo 31B de tokens de pre-entrenamiento; no es fiable para hechos sin verificación externa.
- Idiomas limitados a ruso, inglés y francés; el rendimiento fuera de estos idiomas no está soportado.
- Contexto de 8192 tokens, insuficiente para documentos largos o RAG con mucho material recuperado.
- Licencia Apache 2.0 sin restricciones de uso comercial, pero al ser un modelo con datos sintéticos de terceros conviene revisar los términos de los datasets origen antes de uso en producción.
- La suite de benchmarks propia aún no está publicada en su totalidad (el dataset de math se anuncia para más adelante), lo que dificulta la verificación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-Pro-preview-260m
- Modelo base (pre-entrenamiento): https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-base-260m
- Repositorio de la generación 2.1 Base: no disponible (no se proporciona enlace en la información)
- Dataset de benchmarks de matemáticas: anunciado por el autor, aún no publicado
- Paper, blog o demo: no disponible
