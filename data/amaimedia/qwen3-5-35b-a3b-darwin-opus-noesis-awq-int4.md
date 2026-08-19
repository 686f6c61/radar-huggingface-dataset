# AMAImedia/Qwen3.5-35B-A3B-Darwin-Opus-NOESIS-AWQ-INT4

## Resumen

El modelo **Qwen3.5-35B-A3B-Darwin-Opus-NOESIS-AWQ-INT4** es una cuantización INT4 personalizada del modelo **FINAL-Bench/Darwin-35B-A3B-Opus**, creada por AMAImedia como parte de la plataforma NOESIS de doblaje multilingüe. El modelo original deriva de **Qwen/Qwen3.5-35B-A3B**, un MoE de 35B parámetros totales con solo ~3B activos por forward pass, y de una destilación de razonamiento de Claude 4.6 Opus. La fusión se realizó con el motor evolutivo **Darwin V5** (DARE-TIES vía mergekit), que corrigió el problema de expertos muertos (50-65%) presentes en la madre.

Esta versión cuantizada destaca por su formato **AWQ-INT4 custom** (nibble uint8, group_size=128, sin AutoAWQ), que permite ejecutar el modelo en equipos con solo 64 GB de RAM y una GPU de 6 GB VRAM mediante offloading a CPU. La arquitectura es un MoE híbrido con **Gated DeltaNet** y atención completa en capas alternas, con una ventana de contexto nativa de **262 144 tokens**. Su licencia Apache 2.0 y su rendimiento en GPQA Diamond (90%) lo convierten en una opción interesante para razonamiento y tool calling en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` — MoE con Gated DeltaNet (GDN) y atención completa híbrida |
| Parametros totales | 35B (modelo original); 19 502 410 368 en pesos cuantizados (safetensors) |
| Parametros activos | ~3B por forward pass (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262 144 tokens (nativa) |
| Tipos de cuantizacion | AWQ-INT4 custom (nibble uint8, group_size=128, simétrico, sin AutoAWQ) |
| Idiomas soportados | 201 idiomas (según model card); lista explícita: en, zh, ja, ko, de, fr, ru, ar, hi, es, pt, it, nl, pl, tr, vi, th, id, cs, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con código custom (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base **Darwin-35B-A3B-Opus** se construyó con **Darwin V5**, un motor de fusión evolutiva basado en DARE-TIES (mergekit). El padre es **Qwen/Qwen3.5-35B-A3B** (arquitectura base + RLHF) y la madre es **Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled** (LoRA SFT). El diagnóstico previo reveló que la madre tenía entre 50 y 65% de expertos muertos (activación inferior al 5%) debido al SFT solo con texto; Darwin V5 compensó reduciendo la densidad de la madre y rellenando los slots inactivos con expertos vivos del padre. La capa 38 (núcleo de razonamiento) usa un 90% de pesos de la madre, según la distancia coseno de las sondas.

La arquitectura es un MoE con **40 capas híbridas**: 30 capas con Gated DeltaNet (atención lineal) y 10 capas de atención completa (cada cuarta capa). Cada capa tiene **256 expertos enrutados + 1 compartido**, con hidden size de 2048 y vocab de 248 320 tokens. La cuantización INT4 se realizó a partir del GGUF Q8_0 (~36.9 GB), procesando capa por capa para mantener el pico de RAM en ~22 GB. Los expertos enrutados se almacenan como tensores 3D fusionados `[256, out, in]` y se des-cuantizan en el forward.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras notables en tareas científicas (GPQA Diamond 90%).
- Soporte de **tool calling** y **function calling** (heredado de Qwen3.5).
- Capacidad de razonamiento multi-paso y modo *thinking* (derivado de la destilación de Claude 4.6 Opus).
- Multilingüismo amplio: 201 idiomas, con evaluación MMMLU en 29 lenguas (85.0%).
- Contexto largo nativo de 262 144 tokens, adecuado para documentos extensos y agentes con memoria prolongada.
- Cuantización INT4 eficiente que permite ejecución en hardware modesto (64 GB RAM + GPU 6 GB VRAM) con offloading.

## Casos de uso

- **Asistente de razonamiento científico**: el alto rendimiento en GPQA Diamond (90%) lo hace adecuado para responder preguntas de nivel graduado en física, química y biología, integrable en plataformas educativas o de investigación.
- **Doblaje y traducción multilingüe**: diseñado originalmente para la plataforma NOESIS de doblaje profesional, puede generar subtítulos, guiones y traducciones en más de 200 idiomas con contexto largo para mantener coherencia narrativa.
- **Agente autónomo con tool calling**: soporta function calling y razonamiento multi-paso, permitiendo construir agentes que consultan APIs, bases de datos o ejecutan código en entornos de producción.
- **Análisis de documentos extensos**: con 262k tokens de contexto, puede procesar libros completos, informes técnicos o expedientes legales en una sola pasada, resumiendo o extrayendo información clave.
- **Despliegue en hardware limitado**: su cuantización INT4 y offloading a CPU permiten ejecutar un modelo de 35B en estaciones de trabajo con 64 GB RAM y una GPU de gama media (p. ej., RTX 3060), ideal para entornos sin acceso a GPUs de datacenter.
- **Generación de código con razonamiento**: aunque no se reportan benchmarks específicos de código, su base Qwen3.5 y la destilación de razonamiento lo habilitan para tareas de programación asistida, revisión de código y refactorización con explicaciones detalladas.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al modelo original **BF16 (Q8_0 ≈ BF16)**, no a la versión cuantizada INT4:

| Benchmark | Darwin-35B-A3B-Opus | Padre (Qwen3.5-35B-A3B) | Madre (Claude 4.6 Opus Distilled) |
|---|---|---|---|
| **GPQA Diamond** | **90.0%** | 84.2% | 85.0% |
| **MMMLU (29 lenguas)** | **85.0%** | 85.2% | — |

No se han publicado benchmarks específicos para la versión AWQ-INT4. Se asume una degradación mínima típica de cuantización INT4, pero no hay datos oficiales.

## Requisitos de hardware

- **VRAM estimada**: ~5.4 GB VRAM con offloading a CPU (`device_map="auto"`, `max_memory={0: "5.4GiB", "cpu": "54GiB"}`).
- **RAM total**: ~20 GB RAM para inferencia con offloading; 64 GB RAM recomendados para el proceso completo.
- **GPU recomendadas**: RTX 3060 6 GB (mínimo), cualquier GPU con ≥6 GB VRAM; sin GPU dedicada también es viable con solo CPU (más lento).
- **Espacio en disco**: ~17.8 GB (repo de 20.9 GB).
- **Opciones de despliegue**: transformers con `trust_remote_code=True`; no compatible con AutoAWQ, vLLM, llama.cpp u Ollama sin adaptación (usa formato custom).
- **Latencia**: no disponible; depende del offloading y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Params totales | Activos | Contexto | GPQA Diamond | Licencia |
|---|---|---|---|---|---|
| **Qwen3.5-35B-A3B-Darwin-Opus-NOESIS (INT4)** | 35B | ~3B | 262 144 | 90.0% (BF16) | Apache 2.0 |
| **Qwen/Qwen3.5-35B-A3B** (padre) | 35B | ~3B | 262 144 | 84.2% | Apache 2.0 |
| **Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled** (madre) | 35B | ~3B | 262 144 | 85.0% | Apache 2.0 (derivado) |

La versión Darwin supera a ambos progenitores en GPQA Diamond, manteniendo el mismo tamaño y licencia. No se dispone de comparativas con otros MoE de 35B fuera de esta familia.

## Limitaciones y advertencias

- **Formato de pesos propietario**: la cuantización no es estándar AutoAWQ ni compatible con herramientas comunes (vLLM, llama.cpp). Requiere `trust_remote_code=True` y la clase custom `Darwin35BForCausalLMInt4`, lo que puede suponer un riesgo de seguridad y una barrera de integración.
- **Pérdida de precisión por INT4**: no se han publicado benchmarks de la versión cuantizada; es posible una degradación en tareas de razonamiento fino respecto al BF16.
- **Sesgos del modelo base**: al derivar de Qwen3.5, puede heredar sesgos culturales y lingüísticos de los datos de entrenamiento originales, especialmente en idiomas minoritarios.
- **Riesgo de alucinación**: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto largo.
- **Dependencia del código remoto**: el uso de `trust_remote_code` implica ejecutar código arbitrario del repositorio; se recomienda auditar el código antes de usarlo en producción.
- **Requisitos de RAM**: aunque cabe en 64 GB, el pico de RAM durante la carga puede superar los 20 GB; en máquinas con menos memoria puede fallar.
- **Soporte limitado de la comunidad**: al ser un modelo reciente con pocas descargas (15) y un formato custom, el soporte comunitario y la documentación son escasos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AMAImedia/Qwen3.5-35B-A3B-Darwin-Opus-NOESIS-AWQ-INT4)
- [Modelo base: FINAL-Bench/Darwin-35B-A3B-Opus](https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus)
- [Modelo padre: Qwen/Qwen3.5-35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
- [Modelo madre: Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled](https://huggingface.co/Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled)
- [Organización AMAImedia](https://www.amaimedia.com)
