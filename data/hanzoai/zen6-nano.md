# hanzoai/zen6-nano

## Resumen

Zen 6 Nano (2B) es un modelo de lenguaje multimodal y orientado a agentes publicado por Hanzo AI y Zen LM en colaboración con Zoo Labs Foundation bajo licencia Apache 2.0. Su rasgo diferencial es que se distribuye directamente en pesos ternarios de 1,58 bits (espacio de pesos Hadamard ternario), tras un post-entrenamiento con Quantization-Aware Training (QAT) mediante Straight-Through Estimator y optimizadores híbridos Muon + AdamW. Con 1.881.825.088 parámetros totales, se posiciona como un modelo pequeño pensado para ejecución local y en CI/CD sin coste por token.

La arquitectura combina bloques de atención lineal Gated-DeltaNet (GDN) intercalados con bloques de atención completa Grouped-Query en proporción 3:1, MLPs SwiGLU y un proyector visual multimodal (mmproj), lo que le permite procesar entradas imagen-texto. Los pesos se almacenan en una base ortonormal Sylvester-Walsh-Hadamard que elimina los valores atípicos de activación, permitiendo que los pesos ternarios por grupo de 128 mantengan precisión densa.

Su relevancia actual radica en dos factores: por un lado, ofrece tool calling multi-paso con MCP (Hanzo MCP) y recuperación de errores en un paquete de menos de 500 MB en su cuantización más pequeña; por otro, se integra con runtimes de llama.cpp (fork PrismML) y con un servidor compatible con la API de OpenAI, lo que facilita su uso en pipelines de agentes y pruebas de integración sin claves de API.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated-DeltaNet (atención lineal) + Grouped-Query Full Attention (3:1), SwiGLU MLP, proyector visual multimodal |
| Parámetros totales | 1.881.825.088 (~2B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria 1,58-bit: PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw), Q2_0 (2,250 bpw); proyector visual en Q8_0 y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42) |

## Arquitectura y entrenamiento

El backbone es híbrido: intercala tres bloques de atención lineal Gated-DeltaNet (GDN) por cada bloque de atención completa Grouped-Query, con MLPs SwiGLU y un proyector visual multimodal independiente. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de bloques Sylvester-Walsh-Hadamard, con vectores de signo ±1 por canal embebidos en los metadatos KV del GGUF (`prism.hadamard.*`). Esta rotación elimina los valores atípicos de activación, de modo que los pesos ternarios `{-d, 0, +d}` agrupados de 128 en 128 conservan la precisión del modelo denso.

El post-entrenamiento se realizó directamente en el espacio de pesos ternario mediante QAT con Straight-Through Estimator, usando un optimizador híbrido Muon + AdamW. El modelo conserva la atribución upstream a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash / ProCreations, según el fichero NOTICE. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

Los formatos de producción son tres: PQ2_0 (tipo GGML 142, 34 bytes por cada 128 pesos, 2,125 bpw), orientado a ejecución rápida con SIMD, `dp4a` en CUDA, ROCm y Metal; PTQ1_0 (tipo GGML 143, 28 bytes por cada 128 pesos, 1,750 bpw), el pack denso de trits más pequeño con empaquetado base-3 de 5 trits por byte; y Q2_0 (tipo GGML 42, 18 bytes por cada 64 pesos, 2,250 bpw), compatible con llama.cpp upstream b11556 o superior.

## Capacidades

- Generación de texto conversacional con identidad de pesos nativa de `zen6-nano`, sin sobrecarga de envoltorio en el system prompt y respetando personas personalizadas definidas por el desarrollador (por ejemplo, NPCs de Godot o extractores JSON).
- Tool calling multi-paso con ejecución de `<tool_call>`, síntesis de `<tool_response>`, recuperación de errores y abstención calibrada de herramientas.
- Integración con Hanzo MCP y herramientas de sistema de ficheros (`fs`), ejecución (`exec`), código (`code`), control de versiones (`git`), pruebas (`test`), `hanzo` y herramientas de dirección de motores de juego.
- Procesamiento multimodal imagen-texto mediante el proyector visual `mmproj` en Q8_0 o BF16.
- Razonamiento agéntico multi-paso orientado a tareas de ingeniería y automatización.
- Compatibilidad con la API `/v1/chat/completions` de OpenAI a través del servidor local de Hanzo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con personas configurables por el desarrollador y ejecutar llamadas a herramientas para consultar estado de pedidos o abrir incidencias, con abstención calibrada cuando la herramienta no aplica.
- CI/CD sin coste por token: cargando `zen6-nano-2b-PTQ1_0.gguf` (~429 MB) en runners de CPU de GitHub Actions, se pueden ejecutar pruebas de integración de extremo a extremo de LLM y tool calling sin claves de API ni facturación por token.
- Agentes de desarrollo de software: con las herramientas `fs`, `exec`, `code`, `git` y `test`, el modelo puede leer ficheros de workspace, ejecutar pruebas unitarias y sintetizar respuestas de error, integrándose en flujos de asistencia a la programación.
- NPCs y dirección de juego: las herramientas de dirección de motores de juego y el respeto estricto de personas permiten generar diálogos y comportamiento de NPCs en Godot u otros motores con pesos ligeros.
- Extracción estructurada de datos: el modelo puede actuar como extractor JSON con formato impuesto por el desarrollador, útil en pipelines de ingestión documental.
- Procesamiento de documentos con imagen: gracias al proyector visual multimodal, puede recibir pares imagen-texto para tareas de descripción o extracción sobre capturas y documentos escaneados.
- Despliegue local en estaciones de trabajo: con los packs ternarios de menos de 500 MB, es viable servir el modelo en portátiles y equipos sin GPU dedicada mediante llama.cpp o el motor de Hanzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los packs (PTQ1_0 ~429 MB, repo total 2,5 GB incluyendo proyectores y variantes), la inferencia cabe holgadamente en GPUs consumer y en CPU.
- GPU recomendadas: no se especifican modelos concretos; los runtimes cubren CUDA, ROCm y Metal, por lo que son aplicables desde GPUs de gama de entrada hasta A100/H100.
- Cabe en GPU consumer: sí, por el tamaño de los artefactos ternarios; se puede ejecutar incluso en CPU pura (`-ngl 0`).
- Opciones de despliegue: fork PrismML de llama.cpp (rama `prism`, con CUDA, Metal y CPU) para PQ2_0, PTQ1_0 y Q2_0; llama.cpp upstream b11556+ para Q2_0; `mlx-lm` con packs MLX de 2 bits en Apple Silicon; servidor local de Hanzo (`hanzo engine serve`) con API compatible con OpenAI; los kernels nativos `hanzo-engine` (CUDA, ROCm, Metal, SIMD CPU) están en desarrollo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zen 6 Nano (2B) | ~1,88B | No disponible | Ternaria 1,58-bit (GGUF) | Apache 2.0 | Hugging Face, llama.cpp (fork PrismML), MLX |
| Qwen3 1.7B | ~1,7B | No disponible | BF16, GGUF estándar | Apache 2.0 | Hugging Face, llama.cpp, vLLM |
| Llama 3.2 1B | ~1,2B | No disponible | BF16, GGUF estándar | Llama 3.2 Community | Hugging Face, llama.cpp, Ollama |
| Gemma 3 1B | ~1B | No disponible | BF16, GGUF estándar | Gemma Terms | Hugging Face, llama.cpp, Ollama |

La comparación cuantitativa de rendimiento no está disponible; los modelos alternativos se incluyen por rango de parámetros y licencia, no por resultados medidos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen y otros upstream, puede heredar sesgos de esos corpus.
- Riesgo de alucinación: no cuantificado; como modelo de 2B, la fiabilidad en razonamiento complejo y hechos verificables es limitada y requiere validación en producción.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están especificados, lo que impide garantizar su idoneidad para tareas multilingües o de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribución upstream a Qwen, Bonsai-2 y DFlash / ProCreations recogida en el fichero NOTICE.
- Dependencia de runtimes no estándar: PQ2_0 y PTQ1_0 requieren el fork PrismML de llama.cpp; solo Q2_0 funciona en llama.cpp upstream b11556 o superior, lo que limita la portabilidad.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y los kernels nativos `hanzo-engine` están en desarrollo, por lo que la estabilidad en producción no está contrastada.
- Tool calling: aunque se documenta abstención calibrada, no se han publicado métricas de precisión en la selección de herramientas ni de recuperación de errores.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hanzoai/zen6-nano)
- [Hanzo AI](https://hanzo.ai)
- [Zen LM](https://zenlm.org)
- [Zoo Labs Foundation](https://zoolabs.io)
- [Fork PrismML de llama.cpp](https://github.com/PrismML-Eng/llama.cpp)
