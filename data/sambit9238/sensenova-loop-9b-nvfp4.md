# sambit9238/SenseNova-Loop-9B-NVFP4

## Resumen

SenseNova-Loop-9B-NVFP4 es una cuantización de precisión mixta NVFP4/FP8 del modelo sensenova/SenseNova-Loop-9B, publicada por el usuario sambit9238. El modelo base es un transformer con arquitectura "looped" (las capas 4 a 27 se ejecutan dos veces) que hereda del linaje Qwen3.5, con 9.412.963.952 parámetros totales y soporte de contexto largo de hasta 131.072 tokens según la configuración de servicio incluida.

El problema que resuelve esta versión es el coste de memoria y la velocidad de decodificación: reduce el peso en disco de 19 GB (BF16) a 8,3 GB, y los pesos en memoria de GPU de 16,75 GiB a 7,05 GiB, multiplicando por 2,9 la velocidad de decodificación (de 7,5 a 21,9 tok/s en una DGX Spark con GB10). La cuantización se realizó con TensorRT Model Optimizer 0.48.0 de NVIDIA mediante post-training quantization (PTQ) con receta específica para la arquitectura Qwen3.5.

Es relevante ahora porque combina dos tendencias: por un lado, la cuantización NVFP4 (W4A16) que aprovecha el ancho de banda de memoria en GPUs Blackwell; por otro, la necesidad de motores de inferencia adaptados a arquitecturas no estándar, ya que este checkpoint requiere una compilación parcheada de vLLM (PR #64832) y no funciona con `transformers` estándar. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas "looped" (capas 4-27 ejecutadas dos veces), basada en Qwen3.5; incluye atención completa y Gated DeltaNet |
| Parametros totales | 9.412.963.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (configuración de servicio recomendada con `--max-model-len 131072`) |
| Tipos de cuantizacion | NVFP4 (W4A16, bloques de 16 elementos, escalas de bloque FP8, calibración MSE) para MLP y lm_head; FP8 E4M3 per-tensor para atención y Gated DeltaNet; KV cache en FP8; resto en BF16/FP32 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado `sensenova_loop`); requiere vLLM parcheado |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con "looping": las capas 4 a 27 se ejecutan dos veces, de modo que cada peso de esas capas se almacena una sola vez y se reutiliza en ambas pasadas. Combina atención completa con Gated DeltaNet, e incluye componentes auxiliares como routers mHC, `loop_gate`, normas y embeddings que permanecen en BF16/FP32. También dispone de una torre de visión y una cabeza MTP (`mtp.safetensors`) en BF16, aunque no se usan en la ruta de vLLM.

La cuantización se aplicó con TensorRT Model Optimizer 0.48.0 (`hf_ptq.py`) usando la receta `model_type/qwen3_5/ptq/w4a16_nvfp4_mse-fp8_attn-kv_fp8_cast`. Se cuantizaron 97 capas lineales (MLP `gate/up/down_proj` y `lm_head`) a NVFP4 con calibración MSE, y 104 capas lineales (atención `q/k/v/o_proj` y Gated DeltaNet `in_proj_qkv`, `in_proj_z`, `out_proj`) a FP8 E4M3 con activaciones también en FP8. La calibración usó el conjunto por defecto `cnn_nemotron_v2_mix` (cnn_dailymail + nvidia/Nemotron-Post-Training-Dataset-v2), con 1.024 muestras de 512 tokens. Un paso adicional con `restore_fp32_modelopt.py` restaura los 48 tensores FP32 `A_log`/`dt_bias` de Gated DeltaNet que el export de ModelOpt había degradado a BF16. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto conversacional con modo de razonamiento ("thinking"): la respuesta razonada aparece en el campo `reasoning_content`.
- Razonamiento matemático: 96,0% en GSM8K 8-shot CoT en la versión BF16 y 93,3% en la cuantizada.
- Seguimiento de instrucciones: 71,0%/74,7% (strict/loose a nivel de prompt) en IFEval.
- Conocimiento general y multidisciplinar: 56,6% en MMLU-Pro (BF16) y 54,6% (NVFP4).
- Tool calling / function calling: soportado mediante el parser `qwen3_coder` de vLLM; 100% de parseo correcto y selección de herramienta correcta en las pruebas realizadas.
- Agentes y razonamiento multi-paso: compatible con `--enable-auto-tool-choice` y `--reasoning-parser qwen3` en vLLM.
- Contexto largo: recuperación de aguja en pajar verificada hasta ~120k tokens.
- Multilingüe limitado: inglés y chino.
- Capacidad de visión presente en los pesos del modelo base (torre de visión en BF16), pero no utilizable en la ruta de vLLM de este checkpoint.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto de hasta 131.072 tokens, lo que permite incluir historial extenso, documentación de producto y políticas internas en el mismo prompt sin truncar.
- Generación de código en producción: soporta tool calling con el parser `qwen3_coder` y puede integrarse en pipelines de CI/CD a través de la API compatible con OpenAI que expone vLLM, invocando herramientas de compilación, tests o despliegue.
- Agentes autónomos de múltiples pasos: el modo de razonamiento (`reasoning_content`) y el soporte de `--enable-auto-tool-choice` permiten construir agentes que planifican, invocan herramientas y verifican resultados de forma iterativa.
- Análisis de documentos largos: con contexto de 128k tokens y recuperación de aguja verificada hasta ~120k, es adecuado para resumir informes, contratos o expedientes completos en una sola pasada.
- Asistente de razonamiento matemático y resolución de problemas: el rendimiento en GSM8K (93,3% en la versión cuantizada) lo hace viable para tutoría automatizada o verificación de cálculos en flujos educativos.
- Despliegue en hardware de gama alta con memoria unificada: gracias a su huella de 7,05 GiB en memoria y 21,9 tok/s de decodificación en una DGX Spark, es apto para servir inferencia local en estaciones de trabajo con GB10 o GPUs Blackwell de un solo nodo.
- Clasificación y extracción de información estructurada: el tool calling con argumentos validados (100% en las pruebas) permite usarlo como extractor de entidades o generador de JSON validado contra esquemas.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando BF16 frente a NVFP4 en la misma compilación parcheada de vLLM sobre una NVIDIA DGX Spark (GB10), con modo thinking activado, decodificación greedy y salida limitada a 8.192 tokens:

| Prueba | BF16 | NVFP4 | Notas |
|---|---|---|---|
| GSM8K (8-shot CoT, flexible-extract) | 96,0% (±1,1) | 93,3% (±1,4) | 300 preguntas; strict-match 76,7% vs 69,0% |
| IFEval (prompt-level strict / loose) | 71,0% / 74,7% | 71,7% / 75,7% | 300 prompts |
| MMLU-Pro (14 asignaturas × 25) | 56,6% (±2,4) | 54,6% (±2,4) | 350 preguntas; diferencia dentro del ruido |
| Tool call parse / herramienta correcta / argumentos válidos (T=0) | 100% / 100% / 100% | 100% / 100% / 100% | 105 casos |
| Tool call coincidencia exacta de argumentos (T=0) | 97,1% | 85,7% | NVFP4 reformula valores de texto libre |
| Tool call parse / herramienta correcta / argumentos válidos (T=0,7, 3 ejecuciones) | 99,4% / 99,4% / 99,4% | 100% / 100% / 100% | 315 llamadas por modelo |
| Tool call coincidencia exacta de argumentos (T=0,7, 3 ejecuciones) | 93,3% | 89,8% | 315 llamadas por modelo |
| No invocar herramienta correctamente (T=0 / T=0,7) | 100% / 99,3% | 100% / 99,3% | 45 casos sin herramienta (135 a T=0,7) |
| Needle retrieval @8k / @32k | 5/5, 5/5 | 5/5, 4/5 | |
| Needle retrieval @64k | 5/5 | 4/5 | |
| Needle retrieval @~120k | 4/5 | 5/5 | |
| KL media frente a BF16, chat (238.971 posiciones) | — | 0,047 | p99 KL 0,51; 200 conversaciones UltraChat |
| KL media frente a BF16, wikitext (50.618 posiciones) | — | 0,110 | p99 KL 1,18; 200 pasajes |
| Acuerdo top-1, chat / wikitext | — | 92,6% / 85,6% | |
| Perplejidad en wikitext | 22,57 | no disponible | dato truncado en la model card |

Rendimiento de decodificación en DGX Spark (GB10): 7,5 tok/s en BF16 frente a 21,9 tok/s en NVFP4 (2,9x). No se han publicado resultados de benchmarks frente a modelos de la competencia en la información disponible.

## Requisitos de hardware

- VRAM estimada: 7,05 GiB de pesos en memoria de GPU con vLLM (frente a 16,75 GiB en BF16). Añadir la memoria del KV cache en FP8, que crece con la longitud de contexto configurada.
- GPU probada: NVIDIA DGX Spark (GB10, 128 GB de memoria unificada).
- GPUs compatibles según el autor: cualquier GPU soportada por vLLM para NVFP4 weight-only (kernel Marlin) y FP8 (Ada, Hopper, Blackwell).
- Cabe en GPU de consumo con suficiente VRAM para pesos más KV cache; el autor no especifica modelos concretos de consumo.
- Despliegue: exclusivamente vLLM con la imagen parcheada incluida en el repositorio (`vllm/`), basada en el PR #64832 más un parche para cargar checkpoints cuantizados. No es compatible con `transformers` estándar ni con llama.cpp, Ollama o TGI según la información disponible.
- Latencia y throughput: 21,9 tok/s de decodificación con una petición en DGX Spark. No se proporcionan datos de throughput con lotes mayores.
- Configuración de servicio recomendada: `--max-model-len 131072 --enable-prefix-caching --enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3 --trust-remote-code`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-NVFP4 (este) | 9,41B | 131.072 | Apache 2.0 | Hugging Face, requiere vLLM parcheado | Cuantización NVFP4/FP8; 7,05 GiB en GPU; 21,9 tok/s en DGX Spark |
| SenseNova-Loop-9B (BF16) | 9,41B | 131.072 | Apache 2.0 | Hugging Face | Modelo base sin cuantizar; 16,75 GiB en GPU; 7,5 tok/s en DGX Spark |
| Alternativas de ~9B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos en la información disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación facilitada.

## Limitaciones y advertencias

- Solo texto: la torre de visión del modelo base no se utiliza en la ruta de vLLM de este checkpoint.
- Solo vLLM parcheado: no hay ningún motor de inferencia publicado que soporte SenseNova-Loop, cuantizado o no; cargar el checkpoint con `transformers` estándar no está soportado.
- Idiomas limitados a inglés y chino; no se ha verificado el rendimiento en castellano.
- La cuantización degrada la coincidencia exacta de argumentos en tool calling a temperatura 0 (97,1% en BF16 frente a 85,7% en NVFP4), porque el modelo reformula valores de texto libre. En producción conviene validar los argumentos contra un esquema.
- Divergencia respecto a BF16 medible: KL media de 0,047 en chat y 0,110 en wikitext, con acuerdo top-1 del 92,6% y 85,6% respectivamente.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de sesgo o toxicidad en la información disponible.
- Los resultados de MMLU-Pro están infravalorados por el límite de 8.192 tokens de salida, según el propio autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero el requisito de compilar una imagen de vLLM parcheada añade complejidad operativa y de mantenimiento.
- El proceso de cuantización requiere el paso adicional `restore_fp32_modelopt.py` para restaurar los tensores FP32 de Gated DeltaNet; omitirlo puede afectar a la fidelidad numérica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sambit9238/SenseNova-Loop-9B-NVFP4
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- PR de vLLM que añade soporte para SenseNova-Loop: https://github.com/vllm-project/vllm/pull/64832
- TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
