# blueqat/Tachyon-V100-Loop

## Resumen

Tachyon-V100-Loop es un repositorio de tarjeta de modelo (sin pesos) publicado por blueqat que documenta el soporte de modelos de transformer con bucles (recurrent-depth) en Tachyon-v100, un motor de inferencia LLM escrito desde cero en Rust con kernels CUDA propios para NVIDIA V100 (sm_70). El repositorio no redistribuye pesos: enlaza a los GGUF oficiales de SenseNova-Loop-9B y Inkling-2-Mini, que el motor lee sin modificar.

El interés técnico reside en la arquitectura de los modelos soportados. SenseNova-Loop-9B tiene 32 capas físicas que se ejecutan 56 veces por token (capas 4-27 compartidas en dos pasadas, con dos flujos residuales mezclados por mHC y una matriz Sinkhorn por token). Inkling-2-Mini tiene 24 capas físicas, 48 ejecuciones y es un MoE con 128 expertos top-8, sin RoPE y con sesgo de posición aprendido.

El motor reutiliza maquinaria existente (prefill troceado, CUDA Graph decode, decodificación especulativa MTP, KV paginada con cache de prefijo y batching continuo) indexando el estado por ejecución. Está pensado para exprimir V100 de 32 GB, hardware ampliamente disponible en clústeres y segunda mano, con modelos que caben en una sola tarjeta incluso con contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (recurrent-depth); SenseNova-Loop-9B con mHC y Gated DeltaNet; Inkling-2-Mini MoE con depth attention |
| Parametros totales | 9B (SenseNova-Loop-9B); no disponible para Inkling-2-Mini |
| Parametros activos | 128 expertos top-8 en Inkling-2-Mini; no disponible el recuento exacto |
| Longitud de contexto | no disponible (soportado contexto largo tipo 8K en benchmarks; límite máximo no especificado) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (SenseNova-Loop-9B); IQ4_NL (Inkling-2-Mini); KV cache fp16 e int8 |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 (SenseNova-Loop-9B); Apache-2.0 + Model AUP (Inkling-2-Mini) |
| Formato de pesos | GGUF (Q4_K_M, Q8_0, IQ4_NL); mmproj F16 para vision; tokenizer AWQ para SenseNova |

## Arquitectura y entrenamiento

SenseNova-Loop-9B ejecuta 32 capas físicas como 56 ejecuciones por token: capas 0-3, después las capas 4-27 en dos pasadas con pesos compartidos, y finalmente capas 28-31. Dos flujos residuales se mezclan mediante mHC (una matriz Sinkhorn por token en f32). Emplea Gated DeltaNet como estado recurrente, con 88 MB por secuencia de estado GDN y 56 KB/token de KV cache en fp16. Incluye cabeza MTP para decodificación especulativa.

Inkling-2-Mini ejecuta 24 capas físicas como 48 ejecuciones (capas 6-17 en tres pasadas), es un MoE con 128 expertos top-8 con enrutado sigmoide, y cada pasada reinicia desde la entrada del bucle, con las pasadas anteriores entrando por una depth attention con puerta ("carry"). No usa RoPE: emplea sesgo de posición aprendido, atención por bloques con residuales, convoluciones cortas y attention sinks. Su KV cache es de 32 KB/token en fp16 más estado de ventana/convolución fijo. No se dispone de información sobre el volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO. El autor advierte que el bucle solo ayuda en modelos entrenados para ello: repetir capas de un modelo ordinario (Qwen3.8-27B) empeoró los resultados en las 16 configuraciones probadas.

## Capacidades

- Generación de texto en inglés y japonés.
- Entrada de imagen en SenseNova-Loop-9B mediante data URI (mmproj F16).
- Decodificación especulativa MTP en SenseNova-Loop-9B (k=3, aceptación 49%, salida idéntica a temperatura 0).
- Tool calling / function calling en Inkling-2-Mini, con razonamiento y llamadas a herramientas separadas en la API.
- API compatible con OpenAI `/v1/chat/completions` en ambos modelos.
- Batching continuo y cache de prefijo (paged KV) para servir múltiples usuarios.
- No soportado aún en Inkling-2-Mini: visión y la cabeza block-draft (MTP).
- No se documentan capacidades de audio ni de agentes multi-paso más allá del tool calling.

## Casos de uso

- Servicio de inferencia en hardware V100 existente: el motor está optimizado para sm_70 y permite reutilizar tarjetas V100-32GB en lugar de migrar a GPUs más nuevas, con 55-64 tok/s por usuario y hasta 391 tok/s agregados con 16 flujos concurrentes.
- Chat multiusuario con contexto largo: el prefill de 1.901-2.039 tok/s y el TTFT de 4,1 s con 8K tokens permiten atender conversaciones multi-turno con prompts extensos en una sola tarjeta.
- Asistentes en japonés e inglés: ambos modelos cubren en/ja, útil para productos dirigidos al mercado japonés sin depender de modelos multilingües grandes.
- Análisis de documentos con imagen (SenseNova-Loop-9B): entrada de imagen vía data URI para tareas de descripción o extracción sobre capturas y páginas escaneadas.
- Automatización con herramientas (Inkling-2-Mini): el soporte de tool calling y la separación de razonamiento permite integrarlo en pipelines que consultan APIs externas o bases de datos.
- Investigación en arquitecturas recurrentes: el repositorio documenta cómo indexar estado por ejecución y sirve de referencia para experimentar con transformers con bucles en producción.
- Despliegue con cuantización agresiva: Q4_K_M e IQ4_NL reducen la huella para caber con contexto largo en 32 GB, con pérdida de precisión medida (101/107 y 104/107 de coincidencia top-1 frente a la referencia en fp32).

## Benchmarks y rendimiento

Mediciones del motor en una Tesla V100-SXM3-32GB (driver 570.86, CUDA 12.5), temperatura 0, preliminares según el autor. Comparación con llama.cpp en la misma GPU y mismo GGUF.

| Métrica | SenseNova-Loop-9B Q4_K_M | Inkling-2-Mini IQ4_NL | Inkling-2-Mini (llama.cpp) |
|---|---|---|---|
| Decode, 1 usuario, sin draft | 55 tok/s (Q8_0: 45) | 62-64 tok/s | 36,9 tok/s |
| Decode con MTP, 1 usuario | 98 tok/s (k=3, aceptación 49%) | no portado | no disponible |
| Prefill (512 / 2K / 8K) | 1.901 / 2.039 / 1.985 tok/s | 1.219 tok/s a 8K | 625 tok/s a 8K |
| TTFT con prompt de 8K | 4,1 s | 6,7 s | 13,1 s |
| Flujos concurrentes (total) | 197 / 296 / 391 tok/s (4 / 8 / 16) | 154 / 196 / 238 / 270 tok/s (4 / 8 / 16 / 32) | 95 / 134 tok/s (4 / 8) |
| KV cache | 56 KB/token fp16 + 88 MB/secuencia GDN | 32 KB/token fp16 + estado fijo | no disponible |

Precisión frente a la implementación oficial en PyTorch (CPU, float32), 5 prompts, greedy, hasta 32 tokens, 107 posiciones:

| Modelo | Coincidencia top-1 | Diferencia media de logprob |
|---|---|---|
| SenseNova-Loop-9B Q8_0 | 107/107 | 0,004 |
| SenseNova-Loop-9B Q4_K_M | 101/107 (cuantización) | 0,042 |
| Inkling-2-Mini IQ4_NL | 104/107 (97,2%) | 0,022 |

No se publican resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU objetivo: NVIDIA V100 (sm_70), preferiblemente 32 GB; el motor usa kernels CUDA escritos a mano para esta arquitectura.
- VRAM: un V100-32GB aloja pesos, KV y estado con margen para contexto largo en ambos modelos; no se detalla el desglose exacto por cuantización.
- No se documenta compatibilidad con A100, H100 ni RTX 4090; el foco declarado es V100.
- Despliegue: motor propio Tachyon-v100 (Rust + CUDA), API compatible con OpenAI; no se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de ejecución para estos modelos en este repositorio (llama.cpp se usa solo como referencia comparativa).
- Latencia: TTFT de 4,1-6,7 s con 8K tokens; decode de 55-64 tok/s por usuario y hasta 391 tok/s agregados con 16 flujos.
- Coste por token crece con el número de ejecuciones (SenseNova lee sus capas en bucle dos veces).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B (vía Tachyon) | 9B | no disponible | 55 tok/s decode, 1.985 tok/s prefill 8K en V100 | Apache-2.0 | GGUF en HF |
| Inkling-2-Mini (vía Tachyon) | MoE 128 expertos top-8, total no disponible | no disponible | 62-64 tok/s decode, 1.219 tok/s prefill 8K en V100 | Apache-2.0 + Model AUP | GGUF en HF |
| Inkling-2-Mini (llama.cpp) | ídem | no disponible | 36,9 tok/s decode, 625 tok/s prefill 8K en V100 | Apache-2.0 + Model AUP | GGUF en HF |
| Qwen3.8-27B (en Tachyon) | 27B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad que permitan comparar estos modelos con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio es solo tarjeta de modelo: no contiene pesos; hay que descargarlos de los repositorios oficiales.
- Mediciones preliminares del autor; recomienda re-medir en hardware propio antes de citarlas.
- Idiomas limitados a inglés y japonés; el rendimiento en castellano no está documentado.
- El bucle solo funciona en modelos entrenados para ello; aplicarlo a modelos ordinarios degrada la calidad.
- Inkling-2-Mini no tiene portadas aún la visión ni la cabeza block-draft (MTP); su licencia incluye una Política de Uso Aceptable adicional que puede restringir usos comerciales.
- La cuantización Q4_K_M reduce la coincidencia top-1 a 101/107 frente a la referencia fp32; IQ4_NL a 104/107.
- Riesgo de alucinación y sesgos: no documentados por el autor.
- Dependencia de hardware V100 (sm_70); no se garantiza funcionamiento en otras arquitecturas.
- El coste por token crece con el número de ejecuciones del bucle, lo que afecta al throughput en comparación con modelos densos de tamaño similar.

## Enlaces

- Tarjeta del modelo: https://huggingface.co/blueqat/Tachyon-V100-Loop
- Repositorio del motor: https://github.com/blueqat/tachyon-v100
- Documentación de bucles: https://github.com/blueqat/tachyon-v100/blob/main/docs/LOOP.md
- Pesos SenseNova-Loop-9B (GGUF): https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Tokenizer SenseNova-Loop-9B (AWQ): https://huggingface.co/sensenova/SenseNova-Loop-9B-AWQ
- Modelo base SenseNova-Loop-9B: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Pesos Inkling-2-Mini (GGUF): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Modelo base Inkling-2-Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Política de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
