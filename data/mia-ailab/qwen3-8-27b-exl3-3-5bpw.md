# Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw

## Resumen

Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw es una cuantizacion EXL3 (formato v1.4.2) del modelo Qwen3.8-27B de Qwen, un transformer denso de 27.000 millones de parametros con arquitectura hibrida que combina 48 capas de atencion lineal (gated-deltanet) con 16 capas de atencion completa. El checkpoint cuantizado ocupa 14,2 GB de pesos y esta disenado para ejecutarse en GPUs de 24 GB dejando espacio para la cache KV completa del contexto nativo de 262.144 tokens, ampliable a 1.048.576 mediante extension YaRN incluida.

La relevancia de este modelo reside en tres aspectos: la calibracion de la cuantizacion se realizo sobre un trace generado por el propio modelo (622.515 tokens de codigo y razonamiento matematico) en lugar de corpus genericos, lo que mejora el comportamiento en tareas de programacion y razonamiento; incorpora un head de prediccion multi-token (MTP) cuantizado a 4 bits integrado en el checkpoint para decodificacion especulativa sin pesos adicionales; y solo las 16 capas de atencion completa mantienen cache KV, lo que reduce drasticamente el coste de memoria en contextos largos. El resultado es un modelo de 27B con contexto completo de 262k en una GPU de consumo de 24 GB, algo poco habitual en esta categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 48 capas gated-deltanet (atencion lineal) + 16 capas full-attention (Qwen3.8) |
| Parametros totales | 7.669.052.656 (checkpoint cuantizado EXL3 3.5bpw; el modelo base tiene 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; 1.048.576 con YaRN (config.yarn-1m.json incluido) |
| Tipos de cuantizacion | EXL3 3.5bpw module-adaptive, head 6 bits, codebook mul1, modo high-quality; embeddings bf16 y lm_head fp16 sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida innovadora: 48 de sus 64 capas usan gated-deltanet, un mecanismo de atencion lineal con estado recurrente de tamano fijo, mientras que las 16 restantes usan atencion completa. Esta combinacion reduce el coste de la cache KV a solo las capas full-attention, lo que hace que el contexto largo sea mucho mas economico en memoria que en un transformer convencional. La cuantizacion EXL3 se aplico con 3,5 bits promedio por peso (module-adaptive), con la cabeza del modelo a 6 bits y el codebook `mul1`, manteniendo embeddings y lm_head sin cuantizar para preservar la calidad de salida.

El proceso de cuantizacion se calibro sobre un trace de 622.515 tokens generado por el propio modelo (muestreo de tareas de codigo y razonamiento matematico), en lugar de usar corpus genericos de texto. Segun el autor, esta calibracion "workload-matched" produce mejores resultados en tareas de programacion y razonamiento que una calibracion generica al mismo bpw. El checkpoint incluye ademas un head MTP (multi-token-prediction) cuantizado a 4 bits (~50 MB) que permite decodificacion especulativa sin descargar pesos adicionales. No se dispone de informacion sobre el entrenamiento del modelo base (datos, tokens, RLHF/DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base Qwen3.8-27B.
- Modo thinking (razonamiento explicito) activable por defecto y desactivable por peticion mediante el chat template (`enable_thinking = False`).
- Tool calling y function calling, verificado con tool-eval-bench 2.5.1 en modo hardmode (87-88/100).
- Decodificacion especulativa integrada mediante head MTP (sin pesos extra) o mediante modelo draft externo DFlash2 (EXL3 5.0bpw, ~15% mas rapido).
- Soporte de contexto largo nativo de 262.144 tokens, con extension YaRN a 1.048.576 tokens incluida como configuracion alternativa.
- Cache KV en multiples formatos: fp16, int8, int4 (Hadamard), fp8 E4M3 y NVFP4 (estos ultimos requieren fork de exllamav3).
- No incluye torre de vision: esta cuantizacion es solo texto, aunque el modelo base Qwen3.8-27B es multimodal.

## Casos de uso

- Asistente de programacion local en GPU de 24 GB: con los 14,2 GB de pesos y la cache NVFP4, el contexto completo de 262k cabe en una RTX 3090/4090, permitiendo trabajar con repositorios enteros o archivos de codigo muy extensos sin truncamiento.
- Razonamiento matematico y cientifico con modo thinking: la calibracion sobre trazas de razonamiento matematico mejora la precision en problemas de varios pasos; el modo thinking puede activarse o desactivarse por peticion segun la tarea.
- Agentes autonomos con tool calling: el modelo puntua 87-88/100 en tool-eval-bench hardmode, lo que lo hace util para pipelines de agentes que necesitan invocar funciones y encadenar multiples pasos de razonamiento.
- Procesamiento de documentos largos: con 262k de contexto nativo, puede resumir o extraer informacion de libros tecnicos, expedientes o transcripciones extensas en una sola pasada, sin necesidad de chunking.
- Servicio de inferencia con decodificacion especulativa: el head MTP integrado acelera la generacion (~30 tok/s en DGX Spark) sin coste adicional de VRAM, ideal para entornos de produccion con restricciones de memoria.
- Investigacion en eficiencia de cuantizacion: la comparacion entre calibracion generica y workload-matched, asi como el uso de NVFP4 KV, ofrece un caso de estudio practico para equipos que optimizan modelos grandes en hardware de consumo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| tool-eval-bench 2.5.1 (hardmode, T=1.0, seed 42) | 87-88 / 100 |
| Decodificacion especulativa MTP (DGX Spark, HumanEval-class, T=0.6) | ~2,2 tokens aceptados/paso, ~30 tok/s |
| Decodificacion especulativa DFlash2 (DGX Spark, HumanEval-style code, T=0.6) | 4,43 tokens aceptados/paso, 47,5 tok/s |
| Decodificacion especulativa DFlash2 (DGX Spark, code prose, greedy) | 2,7-2,8 tokens aceptados/paso, 40-43 tok/s |
| Decodificacion especulativa DFlash2 (DGX Spark, code prose, T=0.6) | 2,4-2,5 tokens aceptados/paso, 38-40 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de rendimiento corresponden a mediciones del autor en DGX Spark (GB10, memoria LPDDR5x de 273 GB/s).

## Requisitos de hardware

- VRAM estimada: 14,2 GB de pesos + cache KV. Con cache fp16 a 128k ocupa 8,4 GB adicionales; con NVFP4 a 128k, 2,4 GB. El contexto completo de 262k con NVFP4 cabe en 24 GB.
- GPU recomendada: cualquier GPU x86 CUDA con 24 GB (RTX 3090, RTX 4090, A5000, etc.) para contexto completo. En GPUs de 16 GB se puede usar contexto reducido o cuantizacion de cache int4.
- DGX Spark / GB10 (aarch64): requiere el port aarch64 de exllamav3 (el upstream es x86-only en el momento de escribir esto).
- Opciones de despliegue: exllamav3 (upstream para inferencia basica y MTP), o el kit de serving del repositorio GitHub de Mia-AiLab para DFlash2 y NVFP4 KV (requiere fork de exllamav3).
- Latencia y throughput: ~30 tok/s con MTP y ~47,5 tok/s con DFlash2 en DGX Spark; en GPUs x86 de gama alta se esperan cifras superiores, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 27B | 262k nativo, 1M YaRN | Sin cuantizar | Apache-2.0 | Modelo base; requiere ~54 GB en bf16 |
| Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw | 7,67B (cuantizado) | 262k nativo, 1M YaRN | EXL3 3.5bpw | Apache-2.0 | Este modelo; 14,2 GB de pesos, MTP integrado |
| Mia-AiLab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw | ~1,4 GB (draft) | No aplica | EXL3 5.0bpw | Apache-2.0 | Modelo draft para decodificacion especulativa; +15% tok/s vs MTP |

No se dispone de datos de otros modelos comparables de la misma categoria (27B cuantizados para 24 GB) en la informacion proporcionada. La comparativa con el modelo base en bf16 muestra la reduccion de memoria (14,2 GB vs ~54 GB) a costa de una posible degradacion de calidad no cuantificada en benchmarks estandar.

## Limitaciones y advertencias

- La cuantizacion a 3,5 bpw puede degradar la calidad respecto al modelo bf16, especialmente en tareas de razonamiento complejo; no se han publicado comparativas directas de calidad frente al modelo base.
- El contexto de 1M con YaRN es best-effort: las agujas en los ultimos ~30k tokens (mas alla del contexto nativo de 262k) fallan en pruebas needle-in-haystack. Se recomienda tratar 262k como limite de calidad fiel.
- Esta cuantizacion no incluye la torre de vision del modelo base Qwen3.8-27B; solo es texto.
- Requiere exllamav3 para su ejecucion; no es compatible con otros runtimes (llama.cpp, vLLM, TGI) sin conversion previa.
- Las funciones avanzadas (NVFP4 KV, DFlash2) requieren un fork de exllamav3 que no es el upstream oficial.
- No se especifican los idiomas soportados; aunque Qwen3.8 suele ser multilingue, no hay confirmacion en la documentacion de esta cuantizacion.
- Riesgo de alucinacion no medido especificamente para este checkpoint; se recomienda validacion en entornos de produccion.
- El modelo base es multimodal, pero esta cuantizacion no lo es; si se necesita vision, hay que usar otra variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo draft DFlash2: https://huggingface.co/Mia-AiLab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw
- Repositorio GitHub con kit de despliegue: https://github.com/MiaAI-Lab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw
- Documentacion de Qwen3.8-27B en Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Repositorio de exllamav3: https://github.com/turboderp-org/exllamav3
