# jayleaton/SenseNova-Loop-9B-EXL3-4.0bpw

## Resumen

SenseNova-Loop-9B-EXL3-4.0bpw es una cuantización EXL3 a 4,0 bits por peso del modelo SenseNova-Loop-9B, publicada por el usuario jayleaton. El modelo base, desarrollado por SenseNova (OpenSenseNova), es un transformer con decodificador en bucle ("looped transformer"): las capas físicas 4 a 27 se ejecutan dos veces, produciendo 56 ejecuciones a partir de 32 conjuntos de pesos, todo ello envuelto en un mHC (multi-head communication) de dos flujos. Esta versión cuantizada ocupa 6,31 GB y está dimensionada para caber en una tarjeta NVIDIA RTX de 16 GB.

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica de cuantización específica (TensorFold con la receta `sn-4.0`) para arquitecturas que las herramientas estándar no pueden servir: transformers, vLLM, llama.cpp, mlx-lm y exllamav3 de serie no cargan estos ficheros, y se requiere TensorFold con la serie de parches de la receta. Por otro, ofrece un compromiso medido entre tamaño, fidelidad respecto a BF16 y ventana de contexto efectiva en hardware de consumo.

El autor marca el paquete como experimental y solo lo ha probado en una RTX 5070 Ti de 16 GB (Blackwell, sm_120) bajo WSL2, además de pruebas de dimensionado y calidad en una DGX Spark (GB10) con un límite de memoria de 16 GB. Es un modelo solo de texto: los paquetes no incluyen la torre de visión del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificador en bucle (looped transformer), capas físicas 4-27 ejecutadas dos veces (56 ejecuciones desde 32 conjuntos de pesos), mHC de dos flujos; base `sensenova_loop` con forward `qwen3_5` |
| Parametros totales | 3.136.703.488 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 319.488 tokens con KV en fp8 en RTX 5070 Ti de 16 GB; el comando de servicio usa `--context 278528` |
| Tipos de cuantizacion | EXL3 4,0 bpw (cuerpo 4,0 bpw, cabeza de salida 6 bpw, embedding BF16, codebook `mul1`, escalas de salida siempre); routers mHC y compuertas de bucle en fp32 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, librería `exllamav3` / TensorFold), 11 ficheros de modelo, 6.306.582.666 bytes |

## Arquitectura y entrenamiento

El modelo base es un transformer con decodificador en bucle: en lugar de apilar 56 capas distintas, reutiliza 32 conjuntos de pesos y ejecuta las capas físicas 4 a 27 dos veces, logrando 56 ejecuciones efectivas. Sobre esta estructura se añade un mHC de dos flujos. Según la model card, el forward corresponde a `qwen3_5`, pero sin bucle ni mHC en la implementación estándar, lo que explica que exllamav3 no pueda trazar el modelo sin parches.

La cuantización se realizó con exllamav3 1.6.7 (`turboderp-org/exllamav3@8c593e4e5`) a partir de matrices de Hessian capturadas del modelo real con transformers: una por cada peso único, sumada sobre ambas visitas del bucle, con 250 filas y 2.048 tokens del conjunto de calibración por defecto de exllamav3. Los routers mHC y las compuertas de bucle (97 tensores fp32) se adjuntan sin cuantizar en `model-sensenova-extras.safetensors`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Ventana de contexto muy larga: hasta 319.488 tokens con KV en fp8 en una RTX 5070 Ti de 16 GB, y 294.912 tokens en una DGX Spark con límite de 15,0 GiB.
- Soporte de tool calling / function calling a través del servidor TensorFold, con `tool_choice: "required"`, función con nombre y `response_format` (requiere `libtfgrammar.so` junto al servidor). El autor indica que las llamadas a herramientas no se probaron ("tool calls: not run").
- Capacidades multilingües: no disponible.
- Sin visión: los paquetes no incluyen la torre de visión del modelo base; es solo texto.
- Compatibilidad limitada de motores: requiere TensorFold con la serie de parches de la receta; no funciona con transformers, vLLM, llama.cpp, mlx-lm ni exllamav3 de serie.

## Casos de uso

- Procesamiento de documentos largos en una sola GPU de consumo: con hasta 319.488 tokens de contexto en fp8 KV sobre una RTX de 16 GB, permite analizar contratos, informes o bases de código extensas sin trocear el texto ni recurrir a recuperación externa.
- Asistente conversacional local con memoria larga: el modelo puede mantener conversaciones multi-turno con historial extenso dentro de la ventana de contexto, desplegado con `tensorfold-native serve --parallel 1` en una estación de trabajo con RTX 5070 Ti.
- Extracción estructurada de datos: mediante `response_format` y tool calling con gramática restringida (`libtfgrammar.so`), se puede forzar salida JSON o llamadas a funciones con nombre para integrar el modelo en pipelines de extracción.
- Prototipado e investigación sobre transformers en bucle: al ser una cuantización fiel del modelo base (coseno 0,99393 y top-1 236/249 frente a BF16 en DGX Spark), sirve para experimentar con arquitecturas looped sin necesitar BF16 completo.
- Evaluación de cuantizaciones en hardware de consumo: el paquete incluye métricas reproducibles (coseno, top-1, ventana máxima, throughput) que permiten comparar recetas de cuantización en tarjetas de 16 GB.
- Despliegue en entornos con restricciones de memoria: en una DGX Spark con límite de 15,0 GiB, el paquete `sn-4.0` deja 8,51 GiB de pico a 32k con KV BF16, lo que permite ejecutar el modelo junto a otros procesos en el mismo dispositivo.
- Generación de texto a velocidad interactiva en local: con 59,1 tok/s de decodificación a 4k y 54,4 tok/s a 32k en RTX 5070 Ti, es viable para asistentes de escritura o chat en tiempo real.

## Benchmarks y rendimiento

Datos medidos por el autor en RTX 5070 Ti 16 GB (WSL2), sin drafts:

| Metrica | Valor |
|---|---|
| Ventana máxima con KV fp8 en la tarjeta | 319.488 tokens |
| Coseno de compuerta / top-1 frente a BF16 (298 posiciones) | 0,99486 / 279 |
| Decodificación a 4k / 8k / 32k | 59,1 / 60,1 / 54,4 tok/s |
| Prefill a 4k / 8k / 32k | 2.364 / 2.279 / 2.126 tok/s |
| Tool calls | no ejecutado |
| Otros | drafts de copia: 16/16 pares de respuesta idénticos a nivel de token |

Comparativa de paquetes en DGX Spark frente a BF16 sobre 249 posiciones:

| Paquete | Tamano | Coseno / top-1 | Pico del dispositivo, 32k, KV bf16 | Ventana maxima fp8-KV, 15,0 / 14,5 GiB |
|---|---:|---|---:|---|
| `sn-4.0` | 6,31 GB | 0,99393 / 236 | 8,51 GiB | 294.912 / 278.528 |
| `sn-5.0` | 7,17 GB | 0,99807 / 244 | 9,31 GiB | 270.336 / 253.952 |
| `sn-6.0` | 8,29 GB | 0,99937 / 244 | 10,35 GiB | 229.376 / 212.992 |
| MLX 8-bit | no disponible | 0,99975 / 246 | no disponible | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 6,31 GB de pesos; pico de dispositivo de 8,51 GiB a 32k con KV BF16 en DGX Spark. Con KV fp8 cabe una ventana de hasta 319.488 tokens en una tarjeta de 16 GB.
- GPU recomendadas: RTX 5070 Ti 16 GB (Blackwell, sm_120) es la única probada; DGX Spark (GB10) con límite de 16 GB se usó para dimensionado y calidad. Otras tarjetas de 16 GB y Windows nativo no están probados.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB; el autor dimensiona el paquete para ese objetivo.
- Opciones de despliegue: exclusivamente TensorFold con los parches de la receta (`patches/cuda` 0001-0022 y `patches/rtx` 0001-0002), compilado con CUDA 13 y Zig 0.17.0. No funciona con vLLM, llama.cpp, Ollama, TGI, transformers ni exllamav3 de serie.
- Latencia y throughput: decodificación de 54,4-60,1 tok/s y prefill de 2.126-2.364 tok/s en RTX 5070 Ti según longitud de contexto; el autor advierte que la decodificación varía con la carga del escritorio y la frecuencia sostenida de la tarjeta.
- Notas de despliegue: en WSL2, mantener el paquete en ext4 bajo el directorio home, nunca en `/mnt/c`; el servidor se lanza con `--parallel 1 --kv-cache fp8 --context 278528 --prompt-cache-gib 0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-EXL3-4.0bpw | 3.136.703.488 | hasta 319.488 tokens (fp8 KV, 16 GB) | EXL3 4,0 bpw | Apache 2.0 | Hugging Face, requiere TensorFold parcheado |
| SenseNova-Loop-9B-EXL3-5.0bpw | no disponible | hasta 270.336 tokens (fp8 KV, 15,0 GiB) | EXL3 5,0 bpw | Apache 2.0 | Hugging Face, mismo motor |
| SenseNova-Loop-9B-EXL3-6.0bpw | no disponible | hasta 229.376 tokens (fp8 KV, 15,0 GiB) | EXL3 6,0 bpw | Apache 2.0 | Hugging Face, mismo motor |
| SenseNova-Loop-9B (BF16) | no disponible | no disponible | BF16 | Apache 2.0 | Hugging Face |

Frente a los paquetes de 5,0 y 6,0 bpw, el de 4,0 bpw es el más pequeño (6,31 GB frente a 7,17 y 8,29 GB), el de mayor ventana de contexto y el de menor fidelidad frente a BF16 (coseno 0,99393 frente a 0,99807 y 0,99937). No se dispone de datos de benchmarks de tareas para comparar con modelos de la misma categoría.

## Limitaciones y advertencias

- Marcado como experimental por el autor; recomienda leer `docs/KNOWN-ISSUES.md` antes de confiar en él.
- No es servible con transformers, vLLM, llama.cpp, mlx-lm ni exllamav3 de serie: requiere TensorFold con la serie de parches de la receta, CUDA 13 y Zig 0.17.0.
- Solo texto: los paquetes no incluyen la torre de visión del modelo base.
- Tool calling no probado ("tool calls: not run"); `tool_choice: "required"`, función con nombre y `response_format` dependen de `libtfgrammar.so` junto al servidor.
- Solo probado en RTX 5070 Ti 16 GB bajo WSL2 y en DGX Spark con límite de 16 GB; otras tarjetas de 16 GB y Windows nativo no están probados.
- Pérdida de fidelidad frente a BF16: coseno 0,99393 y top-1 236/249 en DGX Spark; 0,99486 y top-1 279/298 en RTX 5070 Ti.
- El rendimiento de decodificación depende de la carga del escritorio y de la frecuencia sostenida de la tarjeta.
- Sesgos conocidos y riesgo de alucinación: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.
- Licencia Apache 2.0, que permite uso comercial; el modelo base también es Apache 2.0 según los metadatos.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/jayleaton/SenseNova-Loop-9B-EXL3-4.0bpw
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Repositorio de la receta TensorFold para SenseNova-Loop-9B: https://github.com/jayleaton/sensenova-loop9b-tensorfold
- Problemas conocidos de la receta: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/KNOWN-ISSUES.md
- Página RTX de la receta: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/RTX.md
- Pasos para WSL2: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/RTX.md#windows-wsl2-steps
- Parches CUDA: https://github.com/jayleaton/sensenova-loop9b-tensorfold/tree/main/patches/cuda
- Parches RTX: https://github.com/jayleaton/sensenova-loop9b-tensorfold/tree/main/patches/rtx
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Commit del motor probado: https://github.com/ashhart/TensorFold/commit/038e4a27872eaa018adc67b1b5ddffd16820c498
- GitHub de SenseNova-Loop: https://github.com/OpenSenseNova/SenseNova-Loop
- Paquete 5.0 bpw: https://huggingface.co/jayleaton/SenseNova-Loop-9B-EXL3-5.0bpw
- Paquete 6.0 bpw: https://huggingface.co/jayleaton/SenseNova-Loop-9B-EXL3-6.0bpw
