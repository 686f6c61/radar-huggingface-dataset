# mixbits/Qwen3.8-27B-NVFP4-MTP-VL-GGUF

## Resumen

El modelo `mixbits/Qwen3.8-27B-NVFP4-MTP-VL-GGUF` es un pack comunitario en formato GGUF del modelo oficial `Qwen/Qwen3.8-27B`, un VLM (vision-language model) denso de 27.320 millones de parámetros desarrollado por Alibaba Qwen. Este pack está diseñado para ejecutarse localmente con llama.cpp, Ollama y LM Studio, combinando una cuantización NVFP4 de los pesos del lenguaje (con embeddings y output en Q5_K), un proyector CLIP en F16 para visión, y el módulo MTP (Multi-Token Prediction) para decodificación especulativa.

La relevancia de este pack radica en que permite ejecutar un modelo de 27B con capacidades de visión, razonamiento y contexto largo en hardware de consumo (~16 GB de VRAM), frente a los ~55 GB del checkpoint BF16 original. Además, incluye metadatos YaRN parcheados para aceptar una ventana de contexto de 1.048.576 tokens (1M), aunque el contexto nativo es de 262.144 tokens. El modelo base es Apache 2.0, por lo que su uso comercial es libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención multi-head, visión CLIP, MTP (Multi-Token Prediction) |
| Parametros totales | 27.320.697.856 (~27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 nativa; 1.048.576 con YaRN estático (factor 4.0) |
| Tipos de cuantizacion | NVFP4 (lenguaje y MTP), Q5_K (embeddings/output), F16 (proyector CLIP) |
| Idiomas soportados | Inglés, chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (arquitectura `qwen35`) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso de 27B parámetros con visión integrada (proyector CLIP) y un módulo MTP entrenado para predecir múltiples tokens por paso, lo que permite decodificación especulativa. El razonamiento está activado por defecto (thinking mode). El contexto nativo es de 262.144 tokens, ampliable a 1M mediante YaRN estático (factor 4.0, `original_max_position_embeddings: 262144`). El dataset de entrenamiento y el proceso de alineación (RLHF/DPO) no se detallan en la información disponible, pero el modelo oficial de Qwen sigue la línea de sus predecesores con datos multilingües y multimodales.

Este pack concreto no retrena el modelo; simplemente cuantiza los pesos del lenguaje a NVFP4 (manteniendo atención en BF16 según la variante ORIG de `esatapedico`, aunque la versión de `mixbits` usa NVFP4 en todas las matmuls del lenguaje), conserva el MTP y el proyector CLIP en F16, y reescribe los metadatos del GGUF para que el runner acepte 1M de contexto. No se ha modificado ningún tensor.

## Capacidades

- Generación de texto y razonamiento multimodal (imágenes y vídeo) con thinking mode activado por defecto.
- Comprensión de imágenes mediante proyector CLIP F16 separado (archivo `mmproj`).
- Decodificación especulativa gracias al módulo MTP entrenado (draft-mtp), que acelera la generación.
- Contexto largo nativo de 262K tokens, ampliable a 1M con YaRN (aunque con penalización en prompts cortos).
- Soporte de agentes y coding agentic (según documentación de Unsloth para el modelo base).
- Capacidades multilingües en inglés y chino (los idiomas declarados oficialmente).
- Compatible con tool calling / function calling (capacidad del modelo base, no verificada en esta cuantización específica).

## Casos de uso

- **Asistente de programación con visión**: dado un screenshot de un error o un diagrama, el modelo puede generar código o explicar el problema. Su ventana de 262K permite incluir repositorios completos en el prompt.
- **Análisis de documentos largos con imágenes**: procesar informes técnicos de cientos de páginas con figuras, tablas y gráficos, extrayendo conclusiones. El contexto 1M (con YaRN) es adecuado para libros o legislación extensa.
- **Agente autónomo de razonamiento multi-paso**: con thinking mode activado, puede planificar y ejecutar tareas complejas como investigación web o automatización de procesos, usando tool calling para interactuar con APIs.
- **Chat conversacional multilingüe**: atención al cliente en inglés y chino con memoria de conversación larga (hasta 262K tokens), ideal para hilos extensos.
- **Generación de código en producción**: integrable en pipelines CI/CD mediante llama.cpp server o Ollama, con decodificación especulativa MTP para reducir latencia en generación de código repetitivo.
- **Análisis de vídeo**: al ser un VLM con soporte de vídeo, puede resumir contenido audiovisual o extraer metadatos de secuencias de frames, aunque el proyector CLIP está optimizado para imágenes estáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización NVFP4 en la información disponible. El modelo base `Qwen3.8-27B` tiene resultados en su card oficial (MMLU, HumanEval, etc.), pero no se han reproducido aquí. La cuantización NVFP4 puede introducir una degradación mínima en tareas de razonamiento, pero no hay datos cuantitativos en este repo.

## Requisitos de hardware

- **VRAM estimada**: los pesos NVFP4 ocupan ~14.6 GiB (lenguaje + MTP) más ~888 MiB del proyector CLIP. Para contexto 262K, la caché KV en FP16 puede superar los 60 GiB, por lo que se recomienda usar cuantización KV o contexto menor para GPUs de consumo.
- **GPU recomendadas**: RTX 4090 (24 GB) para contexto moderado (8K-32K); para 1M de contexto se necesitan ~61-64 GiB adicionales de KV, lo que requiere GPUs profesionales (A100 80GB, H100) o múltiples GPUs.
- **Consumer GPU**: sí, cabe en RTX 4090 y similares con contexto reducido (hasta ~32K con KV cuantizada).
- **Opciones de despliegue**: llama.cpp (llama-server), Ollama (con Modelfile de doble `FROM`), LM Studio, y soporte Day-0 en AMD Ryzen AI Max y Radeon.
- **Latencia/throughput**: no disponible; la decodificación especulativa MTP puede acelerar la generación entre 1.5x y 2x respecto a decodificación autoregresiva estándar, pero no hay mediciones publicadas para esta cuantización.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (oficial) | 27B | 262K (1M YaRN) | BF16 | Apache 2.0 | Safetensors |
| mixbits/Qwen3.8-27B-NVFP4-MTP-VL-GGUF | 27B | 262K (1M YaRN) | NVFP4 + Q5_K + F16 | Apache 2.0 | GGUF |
| Qwen3.8-2.4T-A95B (MoE) | 2.4T total, 95B activos | 256K | no disponible | Apache 2.0 | Safetensors |

La comparativa se limita a la familia Qwen3.8. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El razonamiento (thinking mode) está activado por defecto, lo que aumenta la latencia y el consumo de tokens; se puede desactivar mediante configuración del runner.
- La ampliación a 1M de contexto mediante YaRN degrada el rendimiento en prompts cortos; se recomienda usar 8K-262K para chat normal.
- La caché KV para 1M de contexto requiere 61-64 GiB adicionales en FP16, inviable en GPUs de consumo sin cuantización KV.
- El proyector CLIP está en F16 y separado del archivo principal; es necesario cargarlo explícitamente con `--mmproj` o `FROM` adicional en Ollama.
- La cuantización NVFP4 puede introducir pérdida de precisión en tareas de razonamiento matemático o lógico, aunque no hay benchmarks que lo confirmen.
- Solo se declaran soporte oficial de inglés y chino; otros idiomas pueden funcionar pero con menor calidad.
- El modelo base tiene sesgos potenciales derivados de sus datos de entrenamiento (no detallados en esta ficha); se recomienda validar en dominios sensibles.
- La licencia Apache 2.0 permite uso comercial, pero el aviso de Alibaba Cloud de 2026 incluido en el LICENSE debe respetarse.

## Enlaces

- Repo de HuggingFace: https://huggingface.co/mixbits/Qwen3.8-27B-NVFP4-MTP-VL-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante NVFP4 sin VL: https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Blog de AMD sobre soporte Day-0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de LM Studio: https://lmstudio.ai/models/qwen3.8
- Cuantización NVFP4 de referencia: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
