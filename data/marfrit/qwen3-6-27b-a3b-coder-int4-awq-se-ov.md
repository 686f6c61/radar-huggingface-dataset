# marfrit/Qwen3.6-27B-A3B-Coder-int4-awq-se-ov

## Resumen

Este repositorio contiene una conversión a OpenVINO IR del modelo ManniX-ITA/Qwen3.6-27B-A3B-Coder, un derivado del Qwen3.6-35B-A3B con poda de expertos (de 256 a 184 por capa) orientado a código. La cuantización es INT4 asimétrica con grupo de 64, aplicando AWQ y Scale Estimation calibrados sobre un corpus de código real (C/C++, Python, Lua). El resultado es un modelo de 13,8 GB que alcanza ~43 tokens/s en una Arc A770 16 GB, frente a los 14,4 tokens/s del mismo modelo en GGUF Q4_K_M bajo llama.cpp SYCL. La relevancia radica en que no existía un IR OpenVINO público para esta arquitectura híbrida Gated-DeltaNet + atención completa, y el backend OpenVINO de llama.cpp no soporta modelos MoE con GDN. El autor construyó esta conversión para demostrar que el cuello de botella no era el hardware sino la sobrecarga de lanzamiento de kernels por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated-DeltaNet + atención completa, MoE con 184 expertos por capa (poda de 256) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | 256 000 tokens (declarado); ~100 000+ verificable en Arc A770 16 GB (no verificado) |
| Tipos de cuantizacion | INT4_ASYM, grupo 64, AWQ + Scale Estimation |
| Idiomas soportados | Inglés (calibrado para código e inglés; otros idiomas degradados) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (formato propio de Intel, archivos .bin/.xml) |

## Arquitectura y entrenamiento

El modelo base ManniX-ITA/Qwen3.6-27B-A3B-Coder es una poda de expertos del Qwen3.6-35B-A3B, reduciendo de 256 a 184 expertos por capa. La arquitectura combina capas de atención completa (aproximadamente 10 de 40 bloques) con capas Gated-DeltaNet, que mantienen un estado constante y reducen el crecimiento de la caché KV a ~10 KB/token en int8. La cuantización de este repositorio se realizó con AWQ y Scale Estimation sobre un corpus de código (C/C++, Python, Lua) con 32 muestras, usando la API de optimum-cli con OpenVINO 2026.3.0. El proceso requirió exportar con la tarea `image-text-to-text` porque la arquitectura no tiene ruta de exportación solo texto. No se proporcionan detalles del entrenamiento del modelo base (datos, tokens, RLHF/DPO).

## Capacidades

- Generación de código en C/C++, Python y Lua, con corrección sintáctica y lógica mejorada gracias a la calibración específica.
- Razonamiento y resolución de problemas de programación (harness interno de 10 puntos: 10/10 en greedy, 10/8/8 en muestreo).
- Soporte de prompts de texto plano a pesar de la forma multimodal de la exportación (carga con VLMPipeline).
- No se ha verificado soporte de tool calling, agentes o razonamiento multi-paso en esta cuantización; el modelo base Qwen3.6 sí lo ofrece, pero la poda y cuantización pueden afectar.
- Capacidades multilingües limitadas: el inglés funciona bien, pero otros idiomas (p. ej., alemán) muestran corrupción de tokens y morfología rota.
- No se ha probado entrada de imágenes; la forma multimodal es un artefacto de exportación, no una capacidad funcional verificada.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede autocompletar funciones, generar fragmentos de código y explicar algoritmos en C/C++, Python o Lua, con baja latencia en hardware Intel Arc.
- Generación de código en pipelines de CI/CD: su velocidad de decodificación (~43 tok/s en A770) permite integrarlo en herramientas de revisión de código automatizada o generación de tests unitarios.
- Chat técnico en inglés: para documentación, respuestas a preguntas de Stack Overflow o tutoría de programación, siempre que el idioma sea inglés.
- Prototipado rápido de aplicaciones de código: al ser un modelo MoE con 3B activos, puede ejecutarse en GPUs de consumo con 16 GB de VRAM, ideal para desarrollo local.
- Evaluación de calidad de código: su calibración específica lo hace útil para tareas de análisis estático o detección de errores sintácticos en código fuente.
- Despliegue en servidores de inferencia con OpenVINO GenAI: gracias a su formato IR, puede integrarse en stacks que usan el runtime de Intel, aprovechando la aceleración por hardware en CPUs y GPUs Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona un harness interno de 10 puntos para generación de código, con los siguientes resultados:

| Calibración | Greedy | Sampled (3 seeds) |
|---|---|---|
| Sin calibración (int4 data-free) | 0/10 (errores de sintaxis) | 8, 8, 8 |
| AWQ+SE sobre `textvqa` (dataset de imágenes) | 7/10 | 10, 7, 0 |
| **AWQ+SE sobre corpus de código (este repo)** | **10/10** | 10, 8, 8 |

Rendimiento de inferencia medido en Arc A770 16 GB (mismo modelo, misma máquina):

| Stack | Pesos | Decodificación | Notas |
|---|---|---|---|
| llama.cpp SYCL (GPU) | Q4_K_M GGUF (~4.85 bpw, 16.1 GB) | 14.4 tok/s | Limitado por ~2 500 lanzamientos de kernel por token |
| llama.cpp CPU (8 núcleos) | Mismo GGUF | 15.5 tok/s | La GPU pierde contra la CPU en este modelo |
| **OpenVINO GenAI (este IR)** | int4 g64 (~4.3 bpw, 13.8 GB) | **~43 tok/s** | Gráfico de kernels fusionados/paginados |

## Requisitos de hardware

- VRAM estimada: 13,8 GB para los pesos, más overhead de runtime; cabe en GPUs con 16 GB de VRAM.
- GPU recomendadas: Intel Arc A770 (probada), cualquier GPU Intel con soporte OpenVINO; también funciona en CPU (Ryzen-class, 8 núcleos) con ~15 tok/s.
- No cabe en GPUs de 8 GB; requiere al menos 16 GB para la carga completa.
- Opciones de despliegue: OpenVINO GenAI (recomendado, con VLMPipeline), llama.cpp (solo CPU, ya que el backend OpenVINO no soporta GDN/MoE).
- Latencia: ~43 tok/s en A770; el primer arranque tarda ~2 minutos en compilar el grafo (no usar caché de blobs compilados).
- Throughput estimado: no disponible para cargas concurrentes; el autor no proporciona datos de batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Rendimiento en A770 | Licencia |
|---|---|---|---|---|---|
| **Este IR (OpenVINO int4)** | 27B totales, 3B activos | 256k | INT4 g64 AWQ+SE | ~43 tok/s | Apache-2.0 |
| Mismo modelo en GGUF Q4_K_M | 27B totales, 3B activos | 256k | Q4_K_M (~4.85 bpw) | 14.4 tok/s (SYCL) / 15.5 tok/s (CPU) | Apache-2.0 |
| Qwen3.6-27B dense (sin podar) | 27B densos | 256k | No disponible | No disponible | Apache-2.0 |

La comparativa se limita a variantes del mismo modelo base porque no hay datos de benchmarks estándar frente a otros modelos de código. El IR OpenVINO ofrece una ventaja de ~3× en velocidad de decodificación frente al GGUF en el mismo hardware, a costa de una degradación multilingüe más acusada.

## Limitaciones y advertencias

- Prosa no inglesa degradada: la calibración en código e inglés provoca corrupción de tokens en otros idiomas (p. ej., alemán), más allá de la degradación ya presente por la poda de expertos. Tratar como modelo solo código/inglés.
- No usar `ov::cache_dir` (caché de blobs compilados): el primer arranque funciona, pero los arranques posteriores fallan con `expert weight provider not initialized` en los kernels MoE fusionados. Compilar fresco en cada carga (~2 min en A770).
- `enable_prefix_caching` (scheduler ContinuousBatching) cambia los resultados numéricos: el modo greedy produce salidas diferentes y pierde 2/10 puntos en el harness interno. Desactivarlo si se busca paridad greedy.
- Temperatura 0 lanza una excepción en OpenVINO GenAI (`Check 'temperature > 0'`); mapear "temp 0" a `do_sample = False`.
- Compatibilidad de runtime: exportado con OpenVINO 2026.3.0 estable; runtimes más nuevos (incl. 2026.4 nightlies) lo leen bien, pero el IR exportado con nightlies en runtime estable provoca segfault.
- La caché KV int8 es el valor predeterminado en GPU y funciona correctamente; el contexto práctico se limita a ~100k tokens en A770 16 GB por la memoria de pesos, no verificado más allá de contextos cortos.
- Riesgo de alucinación: no se han evaluado formalmente; la calibración específica puede aumentar la confianza en código incorrecto fuera del dominio de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marfrit/Qwen3.6-27B-A3B-Coder-int4-awq-se-ov
- Modelo base: https://huggingface.co/ManniX-ITA/Qwen3.6-27B-A3B-Coder
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía de Qwen 3.6-27B (aimadetools): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Blog oficial de Qwen 3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Página de Ollama para Qwen3.6:27b: https://ollama.com/library/qwen3.6:27b
- Guía de ejecución local (dev.to): https://dev.to/purpledoubled/how-to-run-qwen-36-locally-27b-dense-35b-moe-and-coding-variants-setup-guide-4di
