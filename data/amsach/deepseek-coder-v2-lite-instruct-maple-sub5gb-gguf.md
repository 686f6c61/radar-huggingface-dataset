# AmSach/DeepSeek-Coder-V2-Lite-Instruct-MAPLE-Sub5GB-GGUF

## Resumen
DeepSeek-Coder-V2-Lite-Instruct-MAPLE-Sub5GB-GGUF es una cuantización agresiva del modelo DeepSeek-Coder-V2-Lite-Instruct (15.7B parámetros totales, 2.4B activos), desarrollada por Aman Sachan (AmSach) mediante una técnica propia denominada MAPLE (Manifold-Activated Pruning of Latent Experts). El objetivo es comprimir el modelo MoE original hasta un contenedor GGUF de 4.50 GB que quepa íntegramente en la VRAM de GPUs de consumo con 6 GB, como la RTX 4050 Laptop, evitando el offload a CPU que degrada la velocidad de generación.

La técnica MAPLE perfila la activación empírica de tokens sobre los 26 bloques MoE y retiene los 54 expertos enrutados principales por capa (84.4% del total), preservando los 2 expertos compartidos invariantes al 100%. El resultado es un modelo de 13.5B parámetros totales que mantiene los 2.4B activos por token y la arquitectura de atención MLA (Multi-Head Latent Attention) con rango 512. En la RTX 4050 alcanza 65.6-76.3 tokens/s de generación frente a los 4.5-10 TPS del modelo original con offload híbrido.

Es relevante para desarrolladores que necesitan ejecutar un modelo de código de calidad en hardware portátil limitado, aunque su licencia Apache 2.0 y su naturaleza de cuantización experimental exigen validar el comportamiento en producción antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Multi-Head Latent Attention (MLA, rango 512) |
| Parametros totales | 13.456.756.224 (13.5B) |
| Parametros activos | 2.4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con poda de expertos (MAPLE); no se especifican niveles Q/IQ concretos |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento
El modelo base es DeepSeek-Coder-V2-Lite-Instruct, un transformer MoE con 64 expertos enrutados por capa (top-6 activos) más 2 expertos compartidos invariantes, dimensión intermedia de 1408 y atención MLA de rango 512 que reduce el KV cache. MAPLE reduce los expertos enrutados de 64 a 54 por capa (84.4% de retención) mediante perfilado de la manifold de activación de tokens, manteniendo intactos los expertos compartidos y la dimensión intermedia. El contenedor resultante ocupa 4.50 GB y reduce el total de parámetros un 14.0% (de 15.7B a 13.5B) sin alterar los 2.4B activos por token.

No se dispone de información sobre el corpus de entrenamiento original, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo base. La model card del autor no documenta el proceso de calibración de MAPLE más allá del perfilado de activaciones, ni especifica el dataset técnico citado (`technical-code-corpus`) en detalle. La innovación técnica principal es la poda selectiva de expertos guiada por activación empírica, que permite mantener la capacidad de razonamiento del MoE con una huella de memoria muy reducida.

## Capacidades
- Generación de texto y código en inglés, con especialización en lenguajes de programación (C++20, Python, Lua, entre otros).
- Razonamiento multi-paso y resolución de problemas algorítmicos (grafos, programación dinámica, estructuras de datos concurrentes).
- Generación de código de producción con sincronización atómica, scripts y fallbacks.
- Soporte de conversación multi-turno mediante plantilla de tokens específica (`<｜User｜>`, `<｜Assistant｜>`, `<｜begin of sentence｜>`, `<｜end of sentence｜>`).
- Compatibilidad con llama.cpp y Ollama para despliegue local.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso
- Desarrollo en portátiles con GPU de 6 GB: ejecución 100% en VRAM de un modelo de código de 13.5B sin offload, con 65-76 TPS de generación, adecuado para asistentes de código en entornos con recursos limitados.
- Generación de código de sistemas en C++: el modelo produce implementaciones de buffers lock-free y sincronización atómica (verificado en benchmarks con resultados bit-exactos).
- Resolución de problemas algorítmicos: resolución de programación dinámica sobre grafos dirigidos con colas de prioridad (Dijkstra con min-heap), útil para entornos educativos o de prototipado.
- Scripts de infraestructura: generación de rate limiters distribuidos con Redis y Lua, con fallbacks de producción.
- Asistencia de código offline: al ser GGUF y compatible con llama.cpp/Ollama, puede desplegarse en entornos sin conectividad o con requisitos de privacidad.
- Prototipado rápido en CI/CD: integración en pipelines locales para generación y revisión de código en inglés, aprovechando la baja latencia en GPUs de consumo.

## Benchmarks y rendimiento

| Tarea | Prompt TPS | Gen TPS | Tiempo total | Estado |
|---|---|---|---|---|
| Lock-Free SPSC Ring Buffer (C++20) | 236.07 | 65.64 - 73.06 | 19.59 s | Sincronización atómica bit-exacta |
| Directed Hypergraph DP Solver (Python) | 370.15 | 64.70 | 18.60 s | DP de grafo con min-heap Dijkstra completo |
| Distributed Redis Token Bucket Rate Limiter | 270.41 | 65.04 | 18.04 s | Script Lua de producción con fallbacks |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores son mediciones de rendimiento de inferencia en una RTX 4050 Laptop (6 GB), no evaluaciones de calidad.

## Requisitos de hardware
- VRAM estimada: 4.50 GB de contenedor; en la prueba verificada ocupa 4,850 MiB de 6,141 MiB en una RTX 4050 Laptop.
- GPU recomendadas: RTX 4050 Laptop 6 GB (verificada), RTX 3050, RTX 2060 mobile y cualquier GPU con al menos 5-6 GB de VRAM libre.
- Cabe en GPU de consumo: sí, en GPUs de 6 GB o más; el objetivo declarado es ejecución 100% en VRAM con 0 capas offloaded a CPU.
- Opciones de despliegue: llama.cpp y Ollama (tags del modelo); no se documenta soporte de vLLM ni TGI.
- Latencia y throughput: 65.6-76.3 TPS de generación y 236-370 TPS de procesamiento de prompt en RTX 4050 Laptop; frente al modelo original con offload híbrido (4.5-10 TPS) supone una mejora de 7.5x a 15x.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct-MAPLE (este) | 13.5B | 2.4B | no disponible | Apache 2.0 | GGUF 4.50 GB | Poda de expertos, 100% en VRAM de 6 GB |
| DeepSeek-Coder-V2-Lite-Instruct (original) | 15.7B | 2.4B | no disponible | Apache 2.0 | safetensors / GGUF Q4 8.57 GB, IQ2 5.64 GB | Requiere offload híbrido en GPUs de 6 GB (4.5-10 TPS) |
| Otras cuantizaciones GGUF del mismo base | 15.7B | 2.4B | no disponible | Apache 2.0 | GGUF Q4/Q8 | No caben en 6 GB sin offload |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento del modelo podado frente al original o frente a alternativas de otros fabricantes.

## Limitaciones y advertencias
- La poda de expertos (64 a 54 por capa) puede degradar la calidad en dominios poco representados en el perfilado de activaciones; no se han publicado evaluaciones de calidad que lo cuantifiquen.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación inherente a los modelos de código, sin datos específicos de mitigación en la model card.
- No se documenta la longitud de contexto soportada, lo que impide planificar tareas de contexto largo.
- Aunque la licencia es Apache 2.0, el uso comercial de una cuantización podada no verificada exige validación propia del comportamiento.
- El modelo es de noviembre de 2026 y la información disponible es limitada; los benchmarks publicados son de velocidad de inferencia, no de calidad.
- Requiere la plantilla de tokens específica de DeepSeek-Coder-V2; un uso incorrecto de la sintaxis de prompt degrada las respuestas.

## Enlaces
- Hugging Face: https://huggingface.co/AmSach/DeepSeek-Coder-V2-Lite-Instruct-MAPLE-Sub5GB-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- GitHub del proyecto MAPLE: https://github.com/AmSach/maple
- Sitio interactivo: https://amsach.github.io/maple/
- Discusión en Hacker News: https://news.ycombinator.com/item?id=50463281
- Showcase en llama.cpp: https://github.com/ggml-org/llama.cpp/discussions/31894
- DOI Kaggle: https://doi.org/10.34740/KAGGLE/M/786779
- DOI Zenodo: https://doi.org/10.5281/zenodo.24042480
- Google Scholar del autor: https://scholar.google.com/citations?user=dfgiWLYAAAAJ&hl=en
- LinkedIn del autor: https://linkedin.com/in/theamansachan
- Instagram del autor: https://instagram.com/i.amsach
