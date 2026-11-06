# r2d2aparicio/ncm-code-doc

## Resumen

NCM Code Documentation es un checkpoint ajustado (fine-tuned) de la arquitectura Next-Concept Modeling (NCM) desarrollada por Hazy Research (Stanford University), adaptado por el usuario r2d2aparicio para la generación ultrarrápida de documentación de código y resúmenes técnicos de funciones. A diferencia de los LLM autorregresivos convencionales, el modelo opera en un espacio latente no autorregresivo mediante un VQ-VAE jerárquico de 9 niveles, lo que le permite decodificar representaciones conceptuales en paralelo en lugar de token a token.

El modelo está pensado como un asistente de escritura ligero y local que descarga tareas rutinarias de documentación (docstrings de una sola frase, firmas de funciones, resúmenes técnicos concisos) de los grandes modelos frontera como Claude 3.5 Sonnet, GPT-4 o Gemini. Su integración principal es un servidor MCP (Model Context Protocol) que se ejecuta vía stdio junto a agentes de IDE locales como Antigravity IDE, Claude Desktop o Cursor.

Por su naturaleza, no es un modelo de propósito general: la longitud de contexto objetivo está acotada a 48 tokens de salida, con una ventana de prefijo de hasta 512 tokens de código fuente. Su relevancia actual radica en la reducción de coste por token y latencia en pipelines de documentación automatizada, con inferencia en GPUs de consumo (RTX 2060 de 6 GB) a 50-100 ms por bloque.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Next-Concept Modeling (NCM), transformer no autorregresivo sobre VQ-VAE jerárquico de 9 niveles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Salida objetivo ≤ 48 tokens; ventana de prefijo de hasta 512 tokens de código |
| Tipos de cuantizacion | no disponible (pesos en FP16 para entrenamiento e inferencia) |
| Idiomas soportados | en, code |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (`generator.pt` ~354 MB, `tokenizer.pt` ~299 MB) |

## Arquitectura y entrenamiento

NCM opera en un espacio latente no autorregresivo (NAR) mediante un VQ-VAE jerárquico de 9 niveles. En lugar de decodificar un token cada vez, el modelo decodifica representaciones conceptuales en paralelo a través de los 9 niveles de profundidad de cuantización. El checkpoint se compone de dos artefactos: `generator.pt` (~354 MB), que contiene los pesos del NextConceptTransformer, y `tokenizer.pt` (~299 MB), con los pesos del tokenizador VQ-VAE jerárquico y un decodificador adaptado a código.

El ajuste fino se realizó sobre 5.000 pares de código-docstring muestreados de `code_search_net` en repositorios de Python, JavaScript y Web. El entrenamiento se llevó a cabo en una única NVIDIA GeForce RTX 2060 (6 GB VRAM GDDR6) con precisión mixta FP16, acumulación de gradientes y tamaño de lote 2, consumiendo aproximadamente 2,9 GB de VRAM. No se documenta en la información disponible el uso de RLHF, DPO ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de docstrings de una sola frase y resúmenes técnicos concisos de funciones.
- Documentación de firmas de funciones y resúmenes de código fuente en Python, JavaScript y repositorios Web.
- Generación no autorregresiva en paralelo, con latencia de ~50-100 ms por bloque en GPU de consumo.
- Integración como herramienta vía Model Context Protocol (MCP) sobre stdio para agentes de IDE.
- Soporte de idiomas: inglés y código (no se declara soporte multilingüe natural).
- No se documenta soporte de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Documentación automática en IDE: el modelo se invoca desde un servidor MCP local para generar docstrings de una frase al escribir o guardar funciones, con latencia de 50-100 ms por bloque que evita interrumpir el flujo de trabajo del desarrollador.
- Reducción de coste en pipelines con LLM frontera: se delega la generación de descripciones rutinarias de funciones a este modelo local, reservando los tokens de Claude 3.5 Sonnet, GPT-4 o Gemini para tareas de razonamiento más complejas.
- Generación de resúmenes para revisión de código: dado un prefijo de hasta 512 tokens de código fuente, el modelo produce un resumen técnico conciso que puede adjuntarse a pull requests o informes de cambios.
- Indexación y búsqueda semántica de código: los resúmenes generados pueden alimentar índices de documentación interna o bases de conocimiento para búsqueda sobre repositorios Python, JavaScript y Web.
- Documentación en CI/CD: integración como paso de pre-commit o job de CI que añade docstrings faltantes a funciones nuevas, aprovechando el bajo consumo de VRAM (~2,5 GB) para ejecutarse en runners con GPU modesta.
- Asistencia local sin conexión: despliegue en estaciones de trabajo con RTX 2060 de 6 GB para equipos que requieren que el código no salga de la máquina, al ejecutarse íntegramente en local vía MCP.
- Prototipado de investigación en generación no autorregresiva: uso del checkpoint como base para experimentar con decodificación NAR en dominios de código, dado que la arquitectura y los pesos son abiertos bajo Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM de inferencia: ~2,5 GB según la model card.
- VRAM de entrenamiento: ~2,9 GB en FP16 con acumulación de gradientes y batch size 2.
- GPU recomendada por el autor: NVIDIA RTX 2060 (6 GB GDDR6); cabe en GPUs de consumo con al menos 3 GB de VRAM libre.
- GPUs de gama alta (A100, H100, RTX 4090): no se documenta su uso, pero el modelo es lo suficientemente pequeño para ejecutarse en ellas sin problema.
- Despliegue: servidor MCP propio (`ncm_doc_server.py`) sobre stdio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que los pesos son `.pt` de PyTorch y la arquitectura es NAR personalizada.
- Latencia: ~50-100 ms por bloque en RTX 2060 6 GB. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| NCM Code Documentation | NCM no autorregresivo sobre VQ-VAE jerárquico | Salida ≤48 tokens; prefijo 512 tokens | Apache 2.0 | Documentación de código ultrarrápida en local |
| CodeT5 / CodeT5+ | Transformer encoder-decoder autorregresivo | Típicamente 512 tokens | BSD-3 / Apache 2.0 | Generación y documentación de código |
| StarCoder2 (3B) | Transformer decoder autorregresivo | 16.384 tokens | BigCode OpenRAIL-M | Generación de código y docstrings de propósito general |
| Qwen2.5-Coder (1.5B-7B) | Transformer decoder autorregresivo | 32.768 tokens | Apache 2.0 | Generación de código y documentación |

La comparación con modelos autorregresivos de propósito general no es directa: NCM sacrifica longitud de contexto y generalidad a cambio de latencia muy baja y consumo mínimo de VRAM en una tarea acotada. No se dispone de datos de rendimiento comparativo publicados en la información disponible.

## Limitaciones y advertencias

- Longitud de salida muy limitada: el contexto objetivo está acotado a ≤48 tokens, por lo que no puede generar documentación extensa ni explicaciones multi-párrafo.
- Ventana de prefijo de 512 tokens: no cubre funciones o ficheros de gran tamaño.
- Entrenado únicamente con 5.000 pares de `code_search_net` en Python, JavaScript y Web; el rendimiento fuera de esos lenguajes o dominios no está caracterizado.
- Idiomas: solo inglés y código; no soporta documentación en castellano ni otros idiomas naturales.
- Riesgo de alucinación en descripciones técnicas: al ser un modelo pequeño y ajustado sobre un dataset limitado, puede generar descripciones imprecisas o incorrectas del comportamiento real del código.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset `code_search_net` puede reflejar sesgos de los repositorios de origen.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones de la arquitectura base de Hazy Research y del dataset `code_search_net`.
- Despliegue no estándar: requiere el servidor MCP propietario y pesos `.pt`; no es compatible con runtimes de inferencia convencionales (vLLM, llama.cpp, Ollama, TGI).
- Sin datos publicados de benchmarks, por lo que la calidad frente a alternativas autorregresivas no está cuantificada.

## Enlaces

- Hugging Face: https://huggingface.co/r2d2aparicio/ncm-code-doc
- Repositorio GitHub del proyecto: https://github.com/artapaher-max/ncm-code-doc
- Arquitectura base (Hazy Research, Stanford): https://github.com/HazyResearch/ncm
- Dataset: https://huggingface.co/datasets/code_search_net
- Cita de la arquitectura base: Hazy Research, "Next-Concept Modeling: Scalable Non-Autoregressive Generation via Hierarchical Latent Space", arXiv preprint, 2024 (referencia bibliográfica incluida en la model card; enlace no disponible).
