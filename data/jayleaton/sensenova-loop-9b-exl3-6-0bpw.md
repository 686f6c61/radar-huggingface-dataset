# jayleaton/SenseNova-Loop-9B-EXL3-6.0bpw

## Resumen

SenseNova-Loop-9B-EXL3-6.0bpw es una cuantizacion EXL3 a 6,0 bits por peso del modelo sensenova/SenseNova-Loop-9B, publicada por el usuario jayleaton. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos cuantizados pensado para ejecutar el modelo base en tarjetas NVIDIA RTX de 16 GB de VRAM. El modelo base es un transformer con bucles (looped transformer) en el que las capas fisicas 4 a 27 se ejecutan dos veces, produciendo 56 ejecuciones a partir de 32 conjuntos de pesos, envueltas en una arquitectura de dos flujos denominada mHC.

La relevancia de esta publicacion es fundamentalmente practica: permite servir un modelo de aproximadamente 9B parametros (4.127.869.952 parametros reales en safetensors) en hardware de consumo con 16 GB, manteniendo una fidelidad alta respecto al modelo en BF16. Segun las mediciones del autor, la cuantizacion alcanza una similitud coseno de 0,99937 y 244 aciertos top-1 sobre 249 posiciones frente al original, con un tamano de repositorio de 8,29 GB.

Se trata de un artefacto experimental: los ficheros no pueden servirse con transformers, vLLM, llama.cpp, mlx-lm ni exllamav3 estandar, y requieren TensorFold junto con la serie de parches del recetario del autor. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), capas fisicas 4-27 ejecutadas dos veces (56 ejecuciones, 32 conjuntos de pesos), dos flujos mHC |
| Parametros totales | 4.127.869.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 212.992 tokens configurados en el script de servido; ventana maxima medida con KV fp8 en RTX 5070 Ti de 245.760 tokens |
| Tipos de cuantizacion | EXL3 a 6,0 bpw (cuerpo), cabeza de salida a 8 bits, embeddings en BF16; routers mHC y puertas de bucle en fp32 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con codigo personalizado (exllamav3 / EXL3) |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: en lugar de apilar capas distintas, reutiliza un subconjunto de capas fisicas (de la 4 a la 27) ejecutandolas dos veces, de modo que se obtienen 56 ejecuciones a partir de 32 conjuntos de pesos. Esta estructura se envuelve en mHC, una arquitectura de dos flujos que gestiona el estado entre pasadas. El forward declarado en el modelo base es de tipo qwen3_5, pero sin soporte nativo de bucles ni de mHC, lo que explica que las herramientas estandar no puedan trazar ni servir el modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. Respecto a la cuantizacion, el autor detalla el proceso: se capturaron matrices de Hessian del modelo con bucles real usando transformers, una por cada peso unico sumada sobre ambas visitas (250 filas por 2.048 tokens del conjunto de calibracion por defecto de exllamav3), y despues se aplico el cuantizador propio de exllamav3 1.6.7 con codebook mul1, escalas de salida siempre activas, cuerpo a 6,0 bpw, cabeza a 8 bpw y embeddings en BF16. Los 97 tensores fp32 correspondientes a routers mHC y puertas de bucle se adjuntan sin cuantizar en un fichero aparte.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado text-generation.
- Llamada a herramientas (tool calling): el autor reporta 36 de 36 llamadas correctas en las pruebas; requiere libtfgrammar.so junto al servidor para tool_choice "required", funciones con nombre y response_format.
- Razonamiento multi-paso mediante la estructura de bucles del modelo base.
- Ventana de contexto muy amplia, con hasta 245.760 tokens medidos con KV en fp8 en una RTX 5070 Ti de 16 GB.
- Cache de prompt en RAM del host: restauracion de un prefijo de 109.313 tokens en 4,48 s frente a 133,6 s en frio (30x).
- Decodificacion especulativa (drafts) en la propia tarjeta, con aceleraciones medidas de 45,5 a 660,1 tok/s en tareas de re-cita y de 46,5 a 533,8 tok/s en edicion de codigo.
- Solo texto: los packs no incluyen la torre de vision del modelo base.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistencia conversacional de contexto largo: con ventanas de hasta 212.992 tokens configuradas y 245.760 medidos, el modelo puede mantener conversaciones con documentos o historiales extensos sin truncar, algo viable en una RTX de 16 GB gracias a la cuantizacion a 6,0 bpw y al KV en fp8.
- Edicion y generacion de codigo en local: la decodificacion especulativa eleva el throughput de 46,5 a 533,8 tok/s en tareas de edicion de codigo, lo que permite integrarlo en flujos de trabajo de desarrollo sobre una unica GPU de consumo.
- Agentes con tool calling: las 36 de 36 llamadas correctas y el soporte de response_format y funciones con nombre lo hacen apto para pipelines de agentes que necesiten invocar APIs o ejecutar acciones estructuradas.
- Procesamiento de documentos largos y resumen: la cache de prompt en RAM restaura prefijos de mas de 100.000 tokens en 4,48 s, lo que abarata iterar sobre el mismo documento en tareas de resumen o extraccion.
- Despliegue en estaciones de trabajo con una sola RTX: el consumo medido de 12,49 GiB en el motor y 15,76 de los 15,92 GiB de la tarjeta (incluyendo el escritorio de Windows) demuestra que cabe en hardware de consumo de 16 GB.
- Evaluacion e investigacion de arquitecturas con bucles: al ser una cuantizacion fiel (coseno 0,99937 frente a BF16), sirve para experimentar con modelos looped transformer sin necesidad de GPU de datacenter.
- Servicio de chat con multiples conversaciones: el recetario documenta configuraciones para varios chats, cache de prompt en host y KV en bf16, segun la pagina RTX del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica mediciones de fidelidad de la cuantizacion y de rendimiento de inferencia:

| Metrica | Resultado |
|---|---|
| Coseno de puertas / top-1 frente a BF16 (298 posiciones) | 0,99931 / 290 |
| Coseno / top-1 en DGX Spark (249 posiciones, pack sn-6.0) | 0,99937 / 244 |
| Decodificacion a 4k / 8k / 32k (RTX 5070 Ti, sin drafts) | 46,6 / 45,7 / 43,9 tok/s |
| Prefill a 4k / 8k / 32k | 2.232 / 2.203 / 2.055 tok/s |
| Llamadas a herramientas | 36/36 |
| Repeticiones greedy | 10/10 |
| Prueba de resistencia de 30 minutos | 241 peticiones, 0 fallos, sin crecimiento de memoria |
| Ventana maxima con KV fp8 (RTX 5070 Ti) | 245.760 tokens |
| Pico de memoria en el motor | 12,49 GiB |

Comparativa de packs del mismo autor en DGX Spark (249 posiciones):

| Pack | Tamano | Coseno / top-1 | Pico a 32k con KV bf16 | Ventana fp8 con tope de 15,0 / 14,5 GiB |
|---|---:|---|---:|---|
| sn-4.0 | 6,31 GB | 0,99393 / 236 | 8,51 GiB | 294.912 / 278.528 |
| sn-5.0 | 7,17 GB | 0,99807 / 244 | 9,31 GiB | 270.336 / 253.952 |
| sn-6.0 | 8,29 GB | 0,99937 / 244 | 10,35 GiB | 229.376 / 212.992 |
| MLX 8-bit | no disponible | 0,99975 / 246 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: 8,29 GB de pesos; pico medido de 12,49 GiB en el motor y 15,76 de los 15,92 GiB de la tarjeta con el escritorio de Windows activo, en una RTX 5070 Ti de 16 GB.
- GPU recomendadas: RTX 5070 Ti 16 GB (Blackwell, sm_120) es la unica tarjeta probada; tambien se valido en DGX Spark (GB10) bajo un tope de memoria de 16 GB. Otras tarjetas de 16 GB y Windows nativo no estan probados.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB; el autor dimensiona el pack para ese limite. La ventana de contexto maxima depende de la VRAM libre: 245.760 tokens con KV fp8 en la 5070 Ti, 229.376 con tope de 15,0 GiB y 212.992 con 14,5 GiB en el Spark.
- Opciones de despliegue: exclusivamente TensorFold con la serie de parches del recetario (patches/cuda 0001-0022 y patches/rtx 0001-0002). No funciona con transformers, vLLM, llama.cpp, mlx-lm ni exllamav3 estandar. Requiere CUDA 13 y Zig 0.17.0; en Windows, dentro de WSL2 con el pack en ext4, nunca en /mnt/c.
- Latencia y throughput: decodificacion de 43,9-46,6 tok/s y prefill de 2.055-2.232 tok/s sin drafts; con drafts, hasta 660,1 tok/s en re-cita, 533,8 en edicion de codigo, 119,4 en chat y 87,4 en resumen. Restauracion de prefijo de 109.313 tokens en 4,48 s con cache de prompt en RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-EXL3-6.0bpw | 4.127.869.952 (pack de 8,29 GB) | 212.992 configurados; 245.760 medidos con KV fp8 | Coseno 0,99937 frente a BF16; 43,9-46,6 tok/s sin drafts | Apache 2.0 | Hugging Face, requiere TensorFold y parches |
| SenseNova-Loop-9B-EXL3-5.0bpw | mismo modelo base | 270.336 / 253.952 con topes de 15,0 / 14,5 GiB | Coseno 0,99807 / top-1 244 | Apache 2.0 | Hugging Face, mismo stack |
| SenseNova-Loop-9B-EXL3-4.0bpw | mismo modelo base | 294.912 / 278.528 con topes de 15,0 / 14,5 GiB | Coseno 0,99393 / top-1 236 | Apache 2.0 | Hugging Face, mismo stack |
| SenseNova-Loop-9B en BF16 | no disponible | no disponible | Referencia de fidelidad | Apache 2.0 | Hugging Face (modelo base) |

No se dispone de datos de benchmarks estandar que permitan comparar con modelos de otras familias del mismo tamano.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal; los ficheros no se sirven con las herramientas habituales y exigen TensorFold con una serie concreta de parches.
- Compatibilidad muy restringida: solo probado en RTX 5070 Ti 16 GB bajo WSL2 Ubuntu 24.04 y en DGX Spark con tope de 16 GB; otras tarjetas de 16 GB y Windows nativo no estan verificados.
- Solo texto: los packs no incluyen la torre de vision, por lo que no hay capacidades multimodales.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de sesgos en la informacion disponible.
- Dependencias fragiles: requiere CUDA 13, Zig 0.17.0 y commits concretos del motor (038e4a278, arbol 0f61f4723db8); las actualizaciones del motor pueden romper la receta.
- Tool calling condicionado: tool_choice "required", funciones con nombre y response_format necesitan libtfgrammar.so junto al servidor.
- Rendimiento variable: el propio autor advierte que la decodificacion varia con la carga del escritorio y el reloj sostenido de la tarjeta; las cifras citadas corresponden a una tarjeta fria y en reposo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los parches deben revisarse por separado; el autor remite a la pagina de problemas conocidos del recetario antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jayleaton/SenseNova-Loop-9B-EXL3-6.0bpw
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Pack 4.0 bpw: https://huggingface.co/jayleaton/SenseNova-Loop-9B-EXL3-4.0bpw
- Pack 5.0 bpw: https://huggingface.co/jayleaton/SenseNova-Loop-9B-EXL3-5.0bpw
- Recetario TensorFold: https://github.com/jayleaton/sensenova-loop9b-tensorfold
- Problemas conocidos: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/KNOWN-ISSUES.md
- Pagina RTX del recetario: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/RTX.md
- Pasos para WSL2: https://github.com/jayleaton/sensenova-loop9b-tensorfold/blob/main/docs/RTX.md#windows-wsl2-steps
- Parches CUDA: https://github.com/jayleaton/sensenova-loop9b-tensorfold/tree/main/patches/cuda
- Parches RTX: https://github.com/jayleaton/sensenova-loop9b-tensorfold/tree/main/patches/rtx
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Commit del motor probado: https://github.com/ashhart/TensorFold/commit/038e4a27872eaa018adc67b1b5ddffd16820c498
- Documentacion de cuantizacion EXL3: docs/exl3-sensenova-quantize.md y docs/exl3-rec (dentro del recetario)
