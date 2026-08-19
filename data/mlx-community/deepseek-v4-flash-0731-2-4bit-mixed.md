# mlx-community/DeepSeek-V4-Flash-0731-2.4bit-mixed

## Resumen

DeepSeek-V4-Flash-0731-2.4bit-mixed es una cuantización de precisión mixta en formato MLX del modelo DeepSeek-V4-Flash-0731, publicada por mlx-community y diseñada específicamente para Apple Silicon. El modelo original es un MoE de 284B parámetros totales (~304B con los bloques MTP), con unos 13,8B activos por token, que aquí se comprime de 155 GB (FP8 nativo) a 92,8 GB en disco a una media efectiva de 2,44 bits por peso. El objetivo declarado es ejecutar un modelo de este tamaño en un Mac con 128 GB de memoria unificada, con un pico de 84,4 GB en la prueba de humo.

La cuantización fue producida con oMLX en su nivel oQ 2 mejorado y ajustada manualmente: la atención y los expertos MTP se requantizaron fuera del asignador de oQ para bajar de 2,5 bpw sin degradar los componentes críticos. El resultado conserva los tres bloques MTP de DSpark, la atención MLA con proyecciones de salida agrupadas, el indexador de atención dispersa (`index_topk 512`), las hiperconexiones con Sinkhorn y la extensión YaRN hasta 1M de contexto. Es relevante porque demuestra que un modelo de 304B puede operar en hardware de consumo (un MacBook Pro M5 Max de 128 GB) con velocidades de generación de 31-36 tokens por segundo, aunque el prefill a contexto largo sigue siendo costoso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con MLA, atencion dispersa indexada, hiperconexiones Sinkhorn, 3 bloques MTP |
| Parametros totales | 284B (modelo base, ~304B con MTP); 25.683.322.814 en el checkpoint cuantizado (safetensors) |
| Parametros activos | ~13,8B por token |
| Longitud de contexto | 1M (YaRN); probado hasta 32k en benchmarks |
| Tipos de cuantizacion | Mixta: 2-bit affine (grupo 128) expertos enrutados, 6-bit (grupo 128) atencion, 8-bit (grupo 64) shared experts/embeddings/lm_head, 3-bit (grupo 128) expertos MTP |
| Idiomas soportados | No disponibles en la informacion; el test de humo se realizo en ingles |
| Licencia | MIT |
| Formato de pesos | MLX affine quantization (safetensors) |

## Arquitectura y entrenamiento

Este repositorio no es un entrenamiento original sino una cuantización del checkpoint oficial `deepseek-ai/DeepSeek-V4-Flash-0731`. El modelo base es un transformer MoE con 43 capas, 256 expertos enrutados más 1 compartido, top-6, y atención MLA (Multi-head Latent Attention) con proyecciones de salida agrupadas. Incorpora un indexador de atención dispersa que limita a 512 tokens (`index_topk 512`) los que entran en el cálculo de atención, lo que explica que la velocidad de generación apenas degrade al crecer el contexto. Las hiperconexiones con Sinkhorn y la extensión YaRN a 1M completan el diseño. Incluye además tres bloques MTP (Multi-Token Prediction) de DSpark, que suman 19,8B parámetros y se conservan íntegros en esta cuantización.

La cuantización se realizó con oMLX 0.5.7 o superior, en nivel oQ 2 mejorado, y luego se ajustó manualmente: la atención se promocionó a 6 bits (grupo 128), los shared experts, embeddings y `lm_head` a 8 bits (grupo 64), y los expertos de los bloques MTP a 3 bits (grupo 128). El resultado es una media efectiva de 2,44 bits por peso, con el 84% del archivo ocupado por los expertos enrutados a 2 bits. No se aplicó ningún ajuste fino posterior; el checkpoint no incluye chat template y se recomienda usar `apply_chat_template` de oMLX.

## Capacidades

- Generación de texto con modo thinking (razonamiento explícito) y modo chat, verificados en la prueba de humo con decodificación greedy y con muestreo.
- Razonamiento matemático básico: resolvió `17 * 24 = 408` mediante la propiedad distributiva con apertura y cierre correctos del bloque `thinking`.
- Manejo de contexto largo: generación estable hasta 32k tokens probados, con degradación mínima de velocidad (36,1 a 31,5 tok/s de 1k a 32k) gracias a la atención dispersa indexada.
- Compresión de KV cache por MLA: el pico de memoria sube solo 1,03 GB al multiplicar el contexto por 8 (de 4k a 32k).
- Preservación de los tres bloques MTP, lo que permite predicción multi-token si el runtime lo soporta.
- Soporte de tool calling y agentes: no documentado explícitamente en esta ficha; el modelo base DeepSeek V4 Flash está orientado a ello, pero no hay confirmación en la información disponible.
- Idiomas: no confirmados; el test de humo se realizó íntegramente en inglés.

## Casos de uso

- Inferencia local de un modelo de 304B en Apple Silicon: con un Mac de 128 GB (probado en MacBook Pro M5 Max 128GB 40 GPU) se ejecuta con pico de 84,4 GB, dejando margen para el sistema. Adecuado para quienes necesitan un modelo de gran tamaño sin depender de la nube.
- Razonamiento con contexto largo en investigación: la ventana de 1M teórica y la generación estable hasta 32k probados permiten procesar documentos extensos, aunque el prefill a 32k tarda 97 segundos, por lo que conviene para consultas puntuales sobre corpus precargados.
- Desarrollo y prueba de técnicas de cuantización agresiva: al ser una cuantización mixta ajustada manualmente, sirve como caso de estudio para evaluar el impacto de 2,44 bpw en un MoE de gran escala, con un benchmark mmlu_pro de referencia frente al modelo en bf16.
- Despliegue de servicios de chat local con oMLX: `omlx serve` expone el modelo como endpoint compatible con OpenAI, con continuous batching que alcanza 83,2 tok/s agregados con batch 8, útil para entornos de desarrollo con varios usuarios simultáneos.
- Evaluación de robustez de cuantización: la prueba de humo incluye decodificación greedy, que es el caso más exigente; los intentos uniformes de 2-bit colapsaban en bucles o derivaban a chino, mientras que esta versión mixta se mantiene coherente, lo que la hace útil para validar metodologías de requantización selectiva.
- Generación de código y tareas agénticas: el autor menciona que el modelo base fue construido para ello, aunque no se aportan benchmarks en esta ficha; en un Mac de 128 GB puede servir como entorno de pruebas para flujos de agente sin coste de API.

## Benchmarks y rendimiento

El autor publica un único benchmark de precisión, medido con mmlu_pro sobre 600 muestras fijadas, con thinking desactivado y decodificación greedy. La fila bf16 corresponde a la API alojada medida con el mismo procedimiento. El error estándar en este tamaño muestral es de aproximadamente 2 puntos por fila.

| Variante | Tamano | bpw | mmlu_pro (n=600) |
|---|---|---|---|
| DeepSeek-V4-Flash-0731-2.4bit-mixed (este repo) | 92,8 GB | 2,44 | 0,573 |
| DeepSeek V4 Flash 0731 (API, bf16) | — | 16 | 0,647 |

La pérdida es de 7,3 puntos, unas 2,6 desviaciones estándar, lo que indica una degradación real pero de magnitud acotada. El autor advierte que es una estimación gruesa, no una certificación: no cubre contexto largo, bucles agénticos ni código real.

Rendimiento medido con el harness de oMLX en MacBook Pro M5 Max 128GB 40 GPU, petición única, 128 tokens generados, sin decodificación especulativa:

| prompt | gen tok/s | prefill tok/s | TTFT ms | pico GB |
|---|---|---|---|---|
| 1k | 36,1 | 498,3 | 2055 | 79,76 |
| 4k | 33,8 | 431,6 | 9490 | 79,77 |
| 8k | 33,1 | 371,1 | 22078 | 79,86 |
| 16k | 32,6 | 352,6 | 46470 | 80,17 |
| 32k | 31,5 | 336,6 | 97347 | 80,80 |

Continuous batching a 1k de prompt y 128 generados:

| batch | tg tok/s | speedup | TTFT ms | E2E s |
|---|---|---|---|---|
| 1 | 36,1 | 1,00x | 2055 | 5,61 |
| 2 | 43,9 | 1,22x | 4714 | 10,54 |
| 4 | 64,1 | 1,78x | 7488 | 16,92 |
| 8 | 83,2 | 2,30x | 15511 | 28,30 |

## Requisitos de hardware

- Memoria: pico de 84,4 GB en la prueba de humo a contexto corto; entre 79,76 y 80,80 GB en los benchmarks de 1k a 32k. Requiere un Mac con 128 GB de memoria unificada.
- GPU: probado en MacBook Pro M5 Max con 40 núcleos GPU. No cabe en ninguna GPU de consumo actual (RTX 4090, etc.) por límite de VRAM.
- Runtime: oMLX 0.5.7 o superior. mlx-lm no soporta la arquitectura `deepseek_v4` (hay PRs abiertos, como mlx-lm#1189, sin verificar).
- Despliegue: `omlx serve` para exponer como endpoint OpenAI-compatible; carga directa desde la caché de HuggingFace sin configuración adicional.
- Latencia: TTFT de 2 segundos a 1k de prompt, 97 segundos a 32k. Throughput de generación de 31,5 a 36,1 tok/s en petición única, hasta 83,2 tok/s agregados con batch 8.
- Almacenamiento: 92,8 GB en disco (86,5 GiB).

## Comparativa con modelos similares

| Modelo | Tamano | bpw | Contexto | VRAM/RAM | mmlu_pro | Licencia |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-2.4bit-mixed (este repo) | 92,8 GB en disco | 2,44 | 1M (YaRN) | ~80-84 GB (Mac 128 GB) | 0,573 (n=600) | MIT |
| mlx-community/DeepSeek-V4-Flash-4bit | 284,3B (base) | 4 | 1024K | 152,2 GB VRAM | no disponible | MIT |
| DeepSeek V4 Flash 0731 (API, bf16) | 284B | 16 | 1M | nube | 0,647 (n=600) | MIT |

La versión 2.4bit reduce a menos de dos tercios el requisito de memoria frente a la 4-bit (92,8 GB frente a 152,2 GB) a cambio de una pérdida estimada de 7,3 puntos en mmlu_pro frente al modelo en bf16. La versión 4-bit no tiene benchmarks publicados en la información disponible. No se dispone de datos de otras cuantizaciones (GGUF, Ollama) para comparar directamente.

## Limitaciones y advertencias

- Pérdida de precisión por cuantización: 7,3 puntos en mmlu_pro (n=600) frente a bf16, consistente con lo esperable a 2,44 bpw. El autor recomienda validar en la carga de trabajo propia antes de confiar en el modelo.
- Requisito de hardware elevado: necesita un Mac con 128 GB de memoria unificada; no ejecutable en GPUs de consumo ni en Macs de 64 GB.
- Runtime restringido: solo oMLX 0.5.7+; mlx-lm no soporta la arquitectura y los PRs pendientes no están verificados.
- Sin chat template incluido: hay que usar `apply_chat_template` de oMLX, lo que puede causar incompatibilidades con herramientas que esperan una plantilla embebida.
- Prefill lento a contexto largo: 97 segundos de TTFT a 32k, inaceptable para interacción en tiempo real con documentos extensos.
- Riesgo de colapso en decodificación greedy: los intentos previos de cuantización uniforme a 2-bit colapsaban en fragmentos repetidos o derivaban a chino; esta versión mixta lo evita, pero la robustez no está garantizada fuera de los tres escenarios probados.
- Cobertura de evaluación limitada: un solo benchmark (mmlu_pro) sin pruebas de código, agente ni contexto largo; no hay datos de sesgos, alucinación ni comportamiento multilingüe. El autor declara explícitamente que no certifica el modelo.
- Sin garantía de soporte de tool calling o funciones de agente: aunque el modelo base está orientado a ello, no se documenta en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/DeepSeek-V4-Flash-0731-2.4bit-mixed
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731/blob/main/LICENSE
- oMLX (herramienta de cuantización y runtime): https://github.com/jundot/omlx
- PR mlx-lm#1189 (soporte de arquitectura deepseek_v4): https://github.com/ml-explore/mlx-lm/pull/1189
- Colección mlx-community DeepSeek V4: https://huggingface.co/collections/mlx-community/deepseek-v4
- Versión 4-bit del mismo modelo: https://huggingface.co/mlx-community/DeepSeek-V4-Flash-4bit
- Guía de despliegue local de DeepSeek V4 Flash: https://codersera.com/blog/run-deepseek-v4-flash-locally-full-2026-setup-guide/
- Ficha en llm-explorer.com: https://llm-explorer.com/model/mlx-community%2FDeepSeek-V4-Flash-4bit,2PonA1JyUKnZGuqgVkk4RE
