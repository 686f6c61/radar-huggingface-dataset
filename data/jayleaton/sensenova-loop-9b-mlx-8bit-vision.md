# jayleaton/SenseNova-Loop-9B-MLX-8bit-vision

## Resumen

SenseNova-Loop-9B-MLX-8bit-vision es una cuantizacion experimental del modelo multimodal SenseNova-Loop-9B, publicado por el usuario jayleaton y derivado del checkpoint original de SenseNova. Se trata de una version empaquetada para el motor TensorFold, con los pesos de texto en formato MLX affine de 8 bits (grupo 64) y la torre de vision conservada en BF16 como un shard adicional. El repositorio incluye una configuracion con YaRN extendido a factor 4, lo que estira la ventana de contexto desde los 262.144 tokens entrenados hasta 1.048.576 posiciones.

El modelo base es un transformer con bucles (looped transformer): las capas fisicas 4 a 27 se ejecutan dos veces, produciendo 56 ejecuciones a partir de 32 conjuntos de pesos, envueltas en una arquitectura de dos flujos mHC (multi-head compression o similar, no detallado en la informacion disponible). Esta estructura poco convencional implica que los motores de inferencia habituales (transformers, vLLM, llama.cpp, mlx-lm, exllamav3) no pueden servir estos ficheros: requieren TensorFold con la serie de parches del recetario del autor.

La relevancia de esta publicacion es doble. Por un lado, demuestra un flujo de cuantizacion y despliegue de un modelo looped multimodal en un unico NVIDIA DGX Spark (GB10, 128 GB), con metricas medidas de latencia, prefill y fidelidad frente al BF16. Por otro, sirve como referencia tecnica para quien quiera evaluar la viabilidad de servir modelos con arquitecturas no estandar en hardware de escritorio de gama alta. Es un artefacto marcado explicitamente como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), dos flujos mHC, multimodal image-text-to-text; etiquetado qwen3_5 |
| Parametros totales | 9.412.959.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 posiciones con YaRN factor 4 (entrenado a 262.144) |
| Tipos de cuantizacion | Texto en 8-bit MLX affine (grupo 64); torre de vision en BF16; KV cache fp8 en servicio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 ficheros, 10.459.302.765 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles fisicos: las capas 4 a 27 se ejecutan dos veces, de modo que 32 conjuntos de pesos producen 56 ejecuciones efectivas. Este patron incrementa la profundidad computacional sin aumentar proporcionalmente el numero de parametros, y se envuelve en una estructura de dos flujos mHC. El modelo es multimodal, con una torre de vision que procesa imagenes y las proyecta al espacio de texto para tareas image-text-to-text. El tag qwen3_5 sugiere que la base deriva de la familia Qwen3.5, aunque la informacion disponible no detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizados.

No se dispone de informacion sobre el proceso de entrenamiento (RLHF, DPO, datos de preentrenamiento) en los materiales proporcionados. La innovacion tecnica destacable en esta publicacion no es el entrenamiento, sino el pipeline de cuantizacion y servicio: conversion a MLX affine 8-bit con grupo 64, conservacion de la torre de vision en BF16, extension YaRN a factor 4, KV cache en fp8 y decodificacion con borradores de copia (copy drafts) que acelera la generacion especulativa. El autor reporta fidelidad top-1 frente a BF16 de 246/249 posiciones con los codigos de 8 bits y coincidencia top-1 exacta con HF en BF16.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto (desactivable con `enable_thinking: false`).
- Generacion de codigo: HumanEval+ 130/164 y MBPP+ 253/378 con los pesos de 8 bits.
- Razonamiento matematico: GSM8K 284-285/300 y MATH 175-183/200 segun thinking off/on.
- Capacidades multimodales image-text-to-text mediante la torre de vision en BF16.
- Tool calling y function calling: acepta `tool_choice: "required"`, funcion nombrada y `response_format` con gramatica restringida (xgrammar v0.2.8).
- Soporte de agentes y razonamiento multi-paso, con presupuesto de thinking configurable (`--thinking-budget 4096`).
- Contexto largo: recuperacion de aguja (needle recall) 4/4 entre 231K y 362K tokens y a 1M tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Cache de prefijo y reutilizacion de contexto para conversaciones multi-turno.

## Casos de uso

- Analisis de documentos extensos con imagenes: el modelo puede procesar prompts de cientos de miles de tokens y recuperar informacion concreta en rangos de 231K a 1M tokens, lo que lo hace adecuado para auditoria de contratos, informes o expedientes que combinen texto e imagenes.
- Atencion al cliente multimodal: con 1M de contexto y cache de prefijo (TTFT de 0,66 s en el segundo turno de un prompt de 74K frente a 52,4 s en frio), puede mantener conversaciones largas con historial e imagenes adjuntas sin recompilar el contexto.
- Generacion de codigo en produccion: con HumanEval+ del 79,3% y soporte de tool calling forzado, se integra en pipelines de CI/CD o asistentes de IDE que requieren llamadas deterministas a funciones.
- Automatizacion de razonamiento matematico y verificacion: GSM8K y MATH con thinking activado permiten usarlo en tareas de resolucion de problemas paso a paso con trazas auditables.
- Agentes con herramientas y formato estructurado: la gramatica xgrammar y `response_format` permiten forzar salidas JSON o llamadas a funciones nombradas en flujos de agentes multi-paso.
- Servicio de inferencia en hardware unico: el perfil medido en un DGX Spark (14,4-18,0 tok/s en una conversacion, 13,2-14,6 tok/s con cuatro) permite desplegar un endpoint interno con cuatro chats paralelos y vision sin cluster.
- Procesamiento por lotes de imagenes y texto: el prefill medido (63.716 tokens en 42,5 s, 492.251 en 785,3 s) sirve para trabajos batch de indexacion o resumen de corpus multimodales.

## Benchmarks y rendimiento

Resultados de tareas medidos por el autor sobre el motor v5 servido, con `--parallel 4 --context 33024` y copy drafts activos. La columna de 4 bits corresponde a SenseNova-Loop-9B-MLX-4bit y el control es Qwen3.5-9B en 4 bits a traves del mismo convertidor.

| Benchmark | Este modelo (8-bit) | 4-bit | Qwen3.5-9B 4-bit |
|---|---|---|---|
| HumanEval+ | 130/164 (79,3%) | 126/164 (76,8%) | 129/164 |
| MBPP+ | 253/378 (66,9%) | 239/378 (63,2%) | 233/378 |
| GSM8K (thinking off / on) | 284/300 / 285/300 | 282/300 / 283/300 | 274/300 / 281/300 |
| MATH (thinking off / on) | 175/200 / 183/200 | 171/200 / 182/200 | 166/200 / 160/200 |
| BFCL | 127/200 (63,5%) | 116/200 (58,0%) | 183/200 |

Metricas de servicio en un DGX Spark (GB10, 128 GB), motor v5:

| Metrica | Valor |
|---|---|
| Decodificacion, 1 chat | 14,4-18,0 tok/s |
| Decodificacion, 4 chats | 13,2-14,6 tok/s por chat |
| Copy drafts (1 / 2 / 4 chats) | 15,3 / 33,3 / 54,5 tok/s frente a 14,5 / 28,0 / 54,0 sin |
| Prefill en frio | 63.716 / 223.827 / 492.251 tokens en 42,5 / 227,0 / 785,3 s |
| Reutilizacion de prefijo | TTFT 0,66 s frente a 52,4 s en frio (prompt de 74K) |
| Long context | needle recall 4/4 a 231K-362K y a 1M |
| Fidelidad 8-bit vs BF16 | top-1 246/249 posiciones; token check 6/6 |
| Soak test | 45 peticiones, 12 conversaciones, 0 errores |

La variante v6 (parches 0023-0027, correccion del loop-seam) reduce la KL media frente a BF16 de 0,0244 a 0,0186 sobre 736 posiciones, mejora top-1 de 707 a 717/736 y acelera el prefill 1,04x / 1,09x / 1,13x a 64K / 224K / 492K, con decodificacion sin cambios.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 10,46 GB (9,74 GiB) en pesos; en servicio el autor configura `TENSORFOLD_MEMORY_RESERVE_GIB=36` y `TF_QWEN_KV_PAGES=256`, ademas de `--prompt-cache-gib 24` y `--spill-gib 256`, lo que implica un consumo de memoria muy superior al tamano de los pesos para soportar 1M de contexto y cuatro chats.
- GPU recomendadas: NVIDIA DGX Spark (GB10, 128 GB) es el unico dispositivo validado y servido segun el autor.
- Cabe en GPU consumer: no disponible como dato confirmado; el perfil medido requiere 128 GB de memoria unificada. No hay validacion reportada en RTX 4090 u otras consumer.
- Opciones de despliegue: exclusivamente TensorFold con los parches CUDA 0001-0022 (motor v5) o 0023-0027 (v6). Stock transformers, vLLM, llama.cpp, mlx-lm y exllamav3 no pueden servir estos ficheros. Requiere CUDA 13 y Zig 0.17.0 para compilar el motor; `libtfgrammar.so` (xgrammar v0.2.8) para gramaticas y tool calling forzado.
- Latencia y throughput: decodificacion 14,4-18,0 tok/s en un chat y 13,2-14,6 tok/s por chat con cuatro; agregado de 54,5 tok/s con cuatro chats usando copy drafts. Prefill en frio de 63.716 tokens en 42,5 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ | GSM8K (on) | BFCL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SenseNova-Loop-9B MLX 8-bit vision (este) | 9,41B | 1.048.576 (YaRN 4) | 130/164 | 285/300 | 127/200 | Apache 2.0 | TensorFold con parches |
| SenseNova-Loop-9B MLX 4-bit | no disponible | no disponible | 126/164 | 283/300 | 116/200 | Apache 2.0 | TensorFold con parches |
| Qwen3.5-9B (control, 4-bit) | ~9B (no confirmado) | no disponible | 129/164 | 281/300 | 183/200 | no disponible | motores estandar |

El modelo de 8 bits supera al de 4 bits en todas las tareas medidas y supera al control Qwen3.5-9B en codigo y matematicas, pero queda claramente por debajo en BFCL (63,5% frente a 91,5%), diferencia que el autor atribuye al propio modelo y no a la cuantizacion. La comparativa con otros modelos de la misma categoria (multimodales de ~9B con contexto largo) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Marcado explicitamente como experimental por el autor; no debe usarse en produccion sin revisar la pagina de problemas conocidos del recetario.
- No es servible con motores estandar: requiere TensorFold con una serie de parches concreta, CUDA 13 y Zig 0.17.0, lo que limita la portabilidad y crea dependencia de un motor poco extendido.
- El tool calling con `tool_choice: "auto"` falla a menudo: 62 de las 73 fallas en BFCL se deben a que el modelo responde en prosa en lugar de invocar la herramienta. Es un comportamiento del modelo, no de la cuantizacion, y obliga a usar `required` o funcion nombrada.
- La fidelidad frente a BF16 no es exacta: top-1 de 246/249 posiciones con los codigos de 8 bits, con divergencias puntuales en la generacion.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo no incluye mecanismos de verificacion propios.
- Idiomas soportados no declarados en la model card; no se puede confirmar cobertura multilingue.
- Sesgos conocidos no documentados en los materiales proporcionados.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue practico depende de TensorFold y sus parches, cuya licencia y condiciones no se detallan en la informacion disponible.
- El contexto de 1M depende de YaRN factor 4 aplicado sobre 262.144 entrenados; la calidad fuera del rango entrenado no esta garantizada mas alla de las pruebas de needle recall reportadas (4/4).
- El modelo base SenseNova-Loop-9B y sus pesos originales deben consultarse para condiciones adicionales no reflejadas en esta cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jayleaton/SenseNova-Loop-9B-MLX-8bit-vision
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Variante 4-bit: https://huggingface.co/jayleaton/SenseNova-Loop-9B-MLX-4bit
- Recetario TensorFold del autor: https://github.com/jayleaton/sensenova-loop9b-tensorfold
- Problemas conocidos: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/KNOWN-ISSUES.md
- Documentacion CUDA del recetario: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/CUDA.md
- Parches CUDA: https://github.com/jayleaton/sensenova-loop9b-tensorfold/tree/main/patches/cuda
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Commit del motor v5: https://github.com/ashhart/TensorFold/commit/038e4a27872eaa018adc67b1b5ddffd16820c498
