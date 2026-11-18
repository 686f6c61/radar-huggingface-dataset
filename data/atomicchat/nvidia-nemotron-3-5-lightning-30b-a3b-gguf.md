# AtomicChat/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por NVIDIA, distribuido originalmente en BF16 bajo la licencia NVIDIA Open Model License. Esta ficha cubre la versión cuantizada en GGUF publicada por AtomicChat, pensada para inferencia local con llama.cpp y compatible con endpoints conversacionales. El modelo combina arquitectura MoE con componentes Mamba2, según las etiquetas del repositorio, y cuenta con 32.913.266.240 parámetros totales con aproximadamente 3.000 millones activos por token, lo que permite un equilibrio entre capacidad y coste computacional por paso de decodificación.

La relevancia de esta publicación reside en el trabajo de cuantización medido y reproducible: AtomicChat documenta divergencia KL frente a la referencia Q8_0 para cada variante, junto con throughput en una RTX 5090 con offload completo. Destaca el diseño "Atomic Dynamic" (AD), que asigna tipos de cuantización distintos a los tensores de expertos (`ffn_down_exps` y `ffn_up_exps`) en lugar de dejarlos a un preset genérico, consiguiendo que una cuantización de 19,7 GB iguale en calidad a una de 26,6 GB.

El modelo está orientado a generación de texto y conversación, con soporte de decodificación especulativa mediante un drafter separado incluido en el repositorio. La información disponible no detalla la composición del dataset de entrenamiento ni los resultados de benchmarks del modelo base, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con componentes Mamba2 (según etiquetas del repositorio); transformer híbrido no confirmado en detalle |
| Parámetros totales | 32.913.266.240 (32,9 B) |
| Parámetros activos | ~3 B por token (denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, Q5_K_M, Q4_K_M, AD-Q5_0_XL, AD-IQ4_NL_L, AD-IQ4_NL, AD-Q2_0_L y AD-Q2_0 (experimentales) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | GGUF (llama.cpp, build `ba360ef`); modelo base en BF16 safetensors |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos con aproximadamente 32,9 B de parámetros totales y unos 3 B activos por token. Las etiquetas del repositorio indican presencia de Mamba2 junto a MoE, lo que sugiere una arquitectura híbrida con capas de estado recurrente combinadas con capas de expertos; la model card disponible no detalla la proporción de capas ni la configuración exacta. Los tensores de expertos tienen formas `ffn_down_exps` con `ne0 = 1856` (64 × 29) y `ffn_up_exps` con `ne0 = 2688` (128 × 21), que en conjunto representan el 93% del modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica documentada en esta publicación es de naturaleza de cuantización, no de entrenamiento: el layout Atomic Dynamic asigna explícitamente tipos distintos a los dos tensores de expertos, manteniendo todo lo demás en Q8_0 (un 7% del modelo). Además, el repositorio incluye un drafter de decodificación especulativa (`dflash-…-BF16.gguf`, 1,2 GB) y una matriz de importancia (`imatrix.gguf`, 55 MB) para calibración. Se documenta también que un segundo drafter (`dspark-…-BF16.gguf`, 0,7 GB) no carga correctamente.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Razonamiento y generación de código: no se documentan evaluaciones específicas en la información disponible.
- Decodificación especulativa mediante drafter separado incluido en el repositorio, orientada a reducir latencia en decodificación.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración tras APIs compatibles con OpenAI.
- Ejecución local vía llama.cpp, con soporte de calibración mediante importance matrix.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y comportamiento agéntico: no documentados en la información disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno en hardware de consumo gracias a sus ~3 B de parámetros activos, que reducen el coste por token frente a un modelo denso de tamaño equivalente. La variante AD-IQ4_NL (19,7 GB) es la recomendada por el autor para este escenario.
- Despliegue en estaciones de trabajo con una sola GPU: con 19,7 GB de pesos en AD-IQ4_NL y offload completo, cabe en GPUs de 24 GB o más, permitiendo servir un asistente interno sin depender de la nube.
- Generación asistida de código en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, el código no sale de la infraestructura del equipo; el rendimiento en tareas de código no está documentado y debe validarse empíricamente antes de adoptarlo.
- Prototipado rápido de aplicaciones conversacionales: la compatibilidad con endpoints permite sustituir un backend remoto por una instancia local sin reescribir el cliente, útil para desarrollo y pruebas de integración.
- Evaluación de cuantizaciones en pipelines de investigación: el repositorio publica logs crudos de divergencia KL y throughput, lo que lo convierte en un caso de estudio reproducible para medir el impacto de la cuantización en modelos MoE con tensores de formas no divisibles por 256.
- Servicio de prellenado intensivo: si la carga de trabajo está dominada por el procesamiento de prompts largos, la build NVFP4 de ggml-org alcanza 14.460 t/s en pp512 frente a 11.809 t/s de las variantes AD, por lo que resulta preferible en ese perfil concreto.
- Inferencia de baja latencia con decodificación especulativa: el drafter `dflash` incluido permite activar speculative decoding en llama.cpp para reducir el tiempo por token en aplicaciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos publicados son métricas de fidelidad de cuantización y throughput, medidos sobre el conjunto held-out `eval_neutral` con divergencia KL frente a la referencia Q8_0, y generación en una única RTX 5090 con offload completo:

| Fichero | down / up | Tamaño | KLD media | KLD q99 | Top-1 | tok/s |
|---|---|---:|---:|---:|---:|---:|
| BF16 (split) | bf16 | 65,9 GB | — | — | — | — |
| Q8_0 | q8_0 / q8_0 | 35,0 GB | referencia | — | — | 290,6 |
| AD-Q5_0_XL | q8_0 / q5_0 | 28,8 GB | 0,00749 | 0,075 | 95,73% | 304,1 |
| Q5_K_M | q5_1 / q5_0 | 26,6 GB | 0,01781 | 0,159 | 93,22% | 338,7 |
| Q4_K_M | q8_0 / q5_0 | 25,0 GB | 0,02542 | 0,219 | 91,88% | 348,5 |
| AD-IQ4_NL_L | q5_1 / iq4_nl | 22,4 GB | 0,01345 | 0,123 | 94,16% | 318,1 |
| AD-IQ4_NL | iq4_nl / iq4_nl | 19,7 GB | 0,01728 | 0,157 | 93,49% | 326,5 |
| AD-Q2_0_L (experimental) | — | 15,5 GB | 1,097 | — | 53,0% | — |
| AD-Q2_0 (experimental) | — | 11,4 GB | 2,403 | — | 33,5% | — |

Comparación directa con la build NVFP4 de ggml-org a tamaño equivalente:

| Variante | Tamaño | KLD media | Top-1 |
|---|---:|---:|---:|
| AD-IQ4_NL_L | 22,4 GB | 0,01345 | 94,16% |
| NVFP4 (ggml-org) | 22,5 GB | 0,06233 | 86,75% |

En prellenado, NVFP4 alcanza 14.460 t/s en pp512 frente a 11.809 t/s de las variantes AD, gracias a los kernels nativos FP4 de Blackwell.

## Requisitos de hardware

- VRAM estimada para inferencia: 35,0 GB con Q8_0; 28,8 GB con AD-Q5_0_XL; 26,6 GB con Q5_K_M; 25,0 GB con Q4_K_M; 22,4 GB con AD-IQ4_NL_L; 19,7 GB con AD-IQ4_NL. Hay que añadir el espacio de contexto KV y el margen del runtime.
- GPU recomendadas: RTX 5090 (mediciones oficiales con offload completo), A100 y H100 por capacidad de VRAM; cualquier GPU con 24 GB o más para las variantes de 19,7-22,4 GB.
- Cabe en GPU de consumo: sí, con AD-IQ4_NL (19,7 GB) en tarjetas de 24 GB como RTX 4090 o RTX 5090. No existe una opción fiable de 16 GB: las variantes AD-Q2_0 y AD-Q2_0_L se publican solo como experimentales y su top-1 de 33,5% y 53,0% las invalida para uso real.
- Opciones de despliegue: llama.cpp (build `ba360ef` o posterior), con soporte de importance matrix; integración en Atomic Chat; endpoints compatibles con OpenAI. Compatibilidad con vLLM, TGI u Ollama no está documentada en la información disponible.
- Latencia y throughput: 290,6 tok/s (Q8_0), 304,1 tok/s (AD-Q5_0_XL), 338,7 tok/s (Q5_K_M), 348,5 tok/s (Q4_K_M), 318,1 tok/s (AD-IQ4_NL_L) y 326,5 tok/s (AD-IQ4_NL) en una RTX 5090 con offload completo. En prellenado, 11.809 t/s (pp512) para las variantes AD y 14.460 t/s para NVFP4.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B (este) | 32,9 B | ~3 B | no disponible | NVIDIA Open Model License | GGUF, BF16 | MoE con Mamba2; cuantizaciones calibradas con imatrix |
| Build NVFP4 de ggml-org (mismo modelo base) | 32,9 B | ~3 B | no disponible | NVIDIA Open Model License | GGUF NVFP4 | 22,5 GB, KLD 0,06233, top-1 86,75%, 14.460 t/s en pp512; no admite calibración |
| Alternativas de otros fabricantes con ~30 B MoE | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación relevante y documentada es interna al propio modelo: frente a la cuantización NVFP4 de ggml-org, las variantes AD ofrecen 4,6 veces menor divergencia KL a tamaño prácticamente idéntico, a costa de un rendimiento inferior en prellenado. No se han proporcionado datos de modelos comparables de otros desarrolladores.

## Limitaciones y advertencias

- No existe una cuantización fiable de 16 GB para este modelo. Las variantes AD-Q2_0 y AD-Q2_0_L están publicadas únicamente por reproducibilidad y no deben usarse en producción: un top-1 del 33,5% implica que el modelo elige un token distinto en dos de cada tres casos.
- La cuantización Q2_0 es "calibration-blind": `quantize_q2_0` no propaga la importance matrix, por lo que la calibración no mejora su calidad. Se requeriría una variante de superbloque de 64 para la familia K-quant en llama.cpp, que aún no existe.
- La build NVFP4 no puede calibrarse porque `quantize_nvfp4` descarta la importance matrix (`GGML_UNUSED(quant_weights)` en `ggml-quants.c`); es adecuada solo si el cuello de botella es el prellenado y no la calidad.
- El drafter `dspark-…-BF16.gguf` no carga según la documentación del autor; solo `dflash` es utilizable para decodificación especulativa.
- La model card no documenta sesgos conocidos, tasas de alucinación, cobertura idiomática ni evaluación de seguridad. Estos aspectos deben evaluarse internamente antes de un despliegue en producción.
- La licencia NVIDIA Open Model License no es de código abierto ni equivalente a Apache 2.0 o MIT; impone condiciones específicas de uso, redistribución y atribución que deben revisarse antes de un uso comercial.
- Los datos de throughput proceden de una única RTX 5090 con offload completo y no son extrapolables a otras GPU, configuraciones de contexto o backends.
- El tamaño del repositorio (252,2 GB) incluye todas las variantes; descargar solo el fichero GGUF necesario.
- El modelo se distribuye como cuantización de un modelo base de NVIDIA; la calidad final depende del proceso de cuantización y no es idéntica al BF16 original.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio de métricas y logs crudos: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF-metrics
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Atomic Chat (aplicación): https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de Atomic Chat: https://x.com/atomic_chat_hq
