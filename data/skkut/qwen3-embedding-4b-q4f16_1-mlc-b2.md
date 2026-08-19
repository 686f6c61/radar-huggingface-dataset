# skkut/qwen3-embedding-4b-q4f16_1-MLC-b2

## Resumen

El modelo `skkut/qwen3-embedding-4b-q4f16_1-MLC-b2` es una compilación del modelo de embeddings Qwen3-Embedding-4B realizada con el compilador MLC (Machine Learning Compilation) para su ejecución en navegadores mediante WebGPU. Lo desarrolla el usuario skkut y lo publica bajo licencia Apache-2.0. Su propósito es ofrecer generación de embeddings de alta calidad directamente en el cliente web, sin necesidad de servidores dedicados, aprovechando la aceleración por GPU del navegador.

El modelo base, Qwen3-Embedding-4B, es un transformer de 4 mil millones de parámetros diseñado para tareas de recuperación semántica y representación de texto. Esta versión MLC aplica cuantización q4f16_1, reduce el contexto a 2048 tokens y limita el batch a 2, lo que permite su ejecución en GPUs compatibles con WebGPU con unos 4,4 GB de VRAM. Incluye pooling de último token y normalización L2 integrados en el modelo compilado.

Su relevancia radica en que habilita aplicaciones de búsqueda semántica, clasificación y clustering de texto completamente en el navegador, con privacidad total de los datos y sin latencia de red. Es una opción práctica para desarrolladores que quieren integrar embeddings en aplicaciones web progresivas o extensiones de navegador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parametros totales | 4 mil millones (aprox., según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (configurado en la compilación) |
| Tipos de cuantizacion | q4f16_1 (4 bits de peso, 16 bits de activación) |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingüe, pero no se especifica en esta versión) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC (archivos `params_shard_*.bin` + manifiestos `tensor-cache.json` y `ndarray-cache.json`) + biblioteca WebAssembly (`.wasm`) |

## Arquitectura y entrenamiento

El modelo es una compilación MLC del Qwen3-Embedding-4B original, un transformer con atención causal y arquitectura similar a la familia Qwen3. La compilación se realizó con `mlc-llm` (tvmjs 0.24.0-dev3 / mlc-ai 0.26.dev246) y emsdk 3.1.56, generando una biblioteca WebAssembly específica para WebGPU. El proceso de cuantización q4f16_1 reduce el tamaño de los pesos a aproximadamente 2,1 GB, manteniendo las activaciones en precisión float16.

El modelo compilado incluye internamente el pooling de último token y la normalización L2, de modo que el embedding final ya está listo para su uso. La configuración fija un contexto de 2048 tokens, un prefill chunk de 2048 y un batch máximo de 2, adaptado a los límites de buffers de las GPUs WebGPU actuales.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación) en la documentación proporcionada.

## Capacidades

- Generación de embeddings de texto de alta calidad (dimensión 2560) mediante pooling de último token y normalización L2.
- Ejecución completamente en el navegador a través de WebGPU, sin necesidad de backend.
- Soporte de prefijo instructivo para consultas: `Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery: …`, optimizado para tareas de retrieval.
- Compatible con la API de web-llm 0.2.84, que permite cargar el modelo y obtener embeddings de forma programática en TypeScript/JavaScript.
- Procesamiento por lotes limitado a 2 secuencias simultáneas, suficiente para aplicaciones interactivas de baja carga.

## Casos de uso

- Búsqueda semántica en aplicaciones web: se puede indexar un corpus de documentos en el navegador y consultar mediante embeddings generados localmente, permitiendo búsquedas por similitud sin enviar datos a un servidor.
- Clasificación de textos en extensiones de navegador: por ejemplo, categorizar correos electrónicos o artículos en el cliente, con privacidad total.
- Sistemas de recomendación de contenido: generar embeddings de artículos o productos y compararlos con el perfil del usuario en tiempo real.
- Detección de duplicados o plagio en documentos: comparar embeddings de fragmentos de texto para identificar similitudes, todo en local.
- Chatbots o asistentes con memoria semántica: almacenar embeddings de conversaciones anteriores y recuperar contexto relevante para responder consultas.
- Aplicaciones educativas interactivas: búsqueda de respuestas en un repositorio de material de estudio directamente en el navegador del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad del embedding (como MTEB, MIRACL, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: 4400 MB (según el registro de web-llm incluido en la model card).
- GPU compatible con WebGPU: se ha probado en NVIDIA con Dawn, pero debería funcionar en cualquier GPU que soporte WebGPU (AMD, Intel, Apple Silicon).
- No requiere GPU dedicada de servidor; funciona en GPUs de consumo (por ejemplo, RTX 3060 o superiores) y en integradas modernas que soporten WebGPU.
- Opciones de despliegue: exclusivamente en navegador mediante web-llm 0.2.84. No se proporcionan formatos para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependen de la GPU del cliente y del tamaño del lote (máximo 2).

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de embeddings en la documentación proporcionada. Esta versión MLC es una adaptación específica para WebGPU, por lo que su comparación directa con modelos como BGE-M3, E5-large-v2 o el propio Qwen3-Embedding-4B en su formato original no está documentada. Se recomienda consultar los benchmarks oficiales del modelo base Qwen3-Embedding-4B en su página de HuggingFace.

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens en esta compilación, muy inferior a los 32K del modelo base Qwen3-Embedding-4B. No apto para documentos largos.
- Batch máximo de 2, lo que restringe el procesamiento simultáneo de secuencias.
- Requiere un navegador con soporte WebGPU (Chrome, Edge, Firefox nightly, Safari Technology Preview) y una GPU compatible; en dispositivos sin GPU o con drivers incompletos, la inferencia puede fallar.
- La cuantización q4f16_1 puede degradar ligeramente la calidad de los embeddings respecto a la precisión completa, aunque no se cuantifica en la documentación.
- No se especifican los idiomas soportados; aunque el modelo base Qwen3 es multilingüe, esta versión no lo confirma.
- Al ser una compilación local, no se garantiza el mismo rendimiento en todos los navegadores y sistemas operativos.
- El uso comercial está permitido por la licencia Apache-2.0, pero se recomienda verificar los términos del modelo base Qwen3-Embedding-4B.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/skkut/qwen3-embedding-4b-q4f16_1-MLC-b2
- Documentación de web-llm (referencia para integración): https://github.com/mlc-ai/web-llm
- Página del modelo base Qwen3-Embedding-4B (para más detalles): https://huggingface.co/Qwen/Qwen3-Embedding-4B
