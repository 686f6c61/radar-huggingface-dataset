# morriszjm/Llama-3.1-8B-Instruct-BellowsKV-Flash-Turbo

## Resumen

Llama-3.1-8B-Instruct-BellowsKV-Flash-Turbo es un conjunto de parametros de compresion de la KV cache para meta-llama/Llama-3.1-8B-Instruct, desarrollado por el usuario morriszjm. No es un modelo nuevo: es un delta de 1,5 GB que contiene unicamente los mapas de registros de BellowsKV-Flash y su configuracion, mientras que los pesos del modelo base se mantienen intactos y se cargan desde el repositorio original de Meta. El objetivo es reducir drasticamente el coste de memoria y aumentar el rendimiento en decodificacion en contextos largos sin reentrenar el transformer subyacente.

La innovacion principal es que cada par de capas comparte un unico registro por token, almacenado en el layout que FlashMLA lee de forma nativa (512 dimensiones latentes mas 64 de RoPE, en fp8). En decodificacion, la atencion lee ese registro fp8 mediante FlashMLA junto con una ventana exacta pequena (los primeros 4 y los ultimos 123 tokens) y fusiona ambas en un unico softmax, sin reconstruir la KV cache completa. El resultado declarado es una KV cache 13,4 veces menor (9,6 KiB por token frente a 128 KiB) y hasta 4,6 veces mas throughput que el modelo denso en una H100.

Esta variante Turbo anade a la variante Lite una destilacion on-policy: la ruta de atencion desplegada se entrena para imitar al modelo original (KL inversa) sobre muestras propias generadas a partir de prompts largos de instrucciones construidos con WikiText-103 y codigo Python, sin datos de benchmarks, con un coste adicional de 1,2 horas de GPU H100. Turbo y Lite comparten configuracion de despliegue y, por tanto, la misma velocidad; Turbo es la mas precisa de las dos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con KV cache comprimida BellowsKV-Flash (comparticion de registro entre pares de capas, layout FlashMLA: 512 latentes + 64 RoPE, fp8) |
| Parametros totales | 8 mil millones (modelo base sin modificar); el delta del repositorio ocupa 1,5 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion evaluada; el modelo base soporta hasta 128K) |
| Tipos de cuantizacion | Pesos del base en bfloat16; registros KV en fp8; no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (segun la model card y los tags del repositorio) |
| Licencia | Llama 3.1 Community License (los parametros derivados); el codigo BellowsKV es Apache-2.0 |
| Formato de pesos | safetensors (params.safetensors, 1,5 GB) |

## Arquitectura y entrenamiento

El modelo base es el transformer decoder-only denso de Llama 3.1 con 8 mil millones de parametros. Sobre el se aplica BellowsKV-Flash, un mecanismo de compresion de KV cache en el que cada par de capas comparte un registro por token en formato fp8 con 512 dimensiones latentes y 64 de RoPE, dispuesto en el layout que FlashMLA lee de forma nativa. En decodificacion, la atencion combina la lectura del registro comprimido mediante FlashMLA con una ventana exacta de tokens (los primeros 4 y los ultimos 123) fusionada en un unico softmax; no hay reconstruccion de la cache original. Los pesos del transformer no se modifican.

La variante Turbo parte de la variante Lite y anade destilacion on-policy: la ruta de atencion tal como se despliega se entrena para igualar al modelo original mediante KL inversa sobre muestras generadas por el propio modelo a partir de prompts largos de instrucciones construidos con WikiText-103 y codigo Python, sin emplear datos de benchmarks. El coste adicional de este paso es de 1,2 horas de GPU H100. El repositorio solo distribuye los mapas de registros y su configuracion; el procedimiento de generacion esta disponible como comandos en la model card (`bellowskv-flash data` y `torchrun ... bellowskv.flash.turbo`).

## Capacidades

- Generacion de texto y razonamiento en instrucciones, heredados del modelo base Llama-3.1-8B-Instruct.
- Procesamiento de contextos largos de hasta 32K tokens en la configuracion evaluada, con una KV cache muy reducida.
- Generacion de codigo (el conjunto de destilacion incluye codigo Python).
- Respuesta a preguntas sobre documentos largos, resumen y recuperacion de pasajes (tareas de LongBench evaluadas).
- Capacidades multilingues limitadas al ingles segun la model card y los tags.
- No se documentan tool calling, function calling, modo thinking, vision ni audio en la informacion disponible; estas capacidades dependerian exclusivamente del modelo base.

## Casos de uso

- Servicio de inferencia de contexto largo con vLLM en H100/H200: el modelo permite atender prompts de 32K tokens con una cache por token de 9,6 KiB, lo que multiplica el numero de peticiones concurrentes que caben en la misma VRAM.
- Procesamiento de documentos largos en lote: tareas de sumarizacion y QA sobre articulos, informes o contratos extensos, donde la reduccion de memoria permite mantener mas secuencias en vuelo.
- Analisis de repositorios de codigo: la evaluacion incluye tareas de comprension de codigo (LCC, RepoP) y el modelo conserva un 98,8 y un 98,3 por ciento del rendimiento denso respectivamente, por lo que es adecuado para revision de codigo en contextos amplios.
- Recuperacion aumentada con pasajes extensos: con PsgRet al 99,5 por ciento del denso, el modelo es util para responder preguntas con muchos pasajes recuperados sin disparar el consumo de memoria.
- Asistentes conversacionales multi-turno en produccion: el throughput de servicio de vLLM es entre 1,22 y 2,51 veces el denso segun la mezcla de prompts y salidas, lo que reduce el coste por peticion en cargas interactivas.
- Prototipado e investigacion sobre compresion de KV cache: al ser un delta que se activa sobre el modelo base con `bellowskv.flash.enable`, sirve como banco de pruebas reproducible para estudiar el equilibrio entre precision y memoria.
- Despliegue en entornos con presupuesto de memoria ajustado: la cache 13,4 veces menor permite servir contextos de 32K donde el modelo denso no cabria con la misma concurrencia en una sola GPU.

## Benchmarks y rendimiento

LongBench Protocol-B a 32K (11 tareas, 2.028 prompts, greedy), puntuacion por tarea como porcentaje del modelo denso en el mismo backend:

| | Qasper | MFQA | HotpotQA | MuSiQue | NrtvQA | GovRep | QMSum | PsgRet | LCC | RepoP | 2Wiki | Media |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Turbo (engine) | 90,4 | 98,2 | 97,2 | 99,8 | 97,6 | 82,2 | 96,3 | 99,5 | 98,8 | 98,3 | 90,1 | **95,3** |
| Turbo (plugin vLLM, prefill exacto) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | **95,1** |
| Lite (engine) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 93,5 |

Con prefill troceado (chunks de 8K) la precision de Turbo baja al 87,6 por ciento, por lo que se recomienda prefill exacto.

Rendimiento en H100 NVL, contexto de 32K, frente a denso bf16 con FlashAttention-3 y CUDA graphs:

| | KV cache por token | Paso de decodificacion, batch 1 | Paso de decodificacion, batch 16 | Throughput maximo de decodificacion | Throughput de servicio vLLM |
|---|---|---|---|---|---|
| Denso | 128 KiB | 7,23 ms | 24,83 ms | 644 tok/s (batch 16) | 1,00x |
| BellowsKV-Flash | 9,6 KiB | 7,18 ms | 10,57 ms | 2.983 tok/s (batch 128), 4,6x | 1,22-2,51x |

El throughput de servicio de vLLM se mide con un unico presupuesto de memoria y todas las peticiones enviadas a la vez: 1,22x con prompts de 32K y 256 tokens de salida, y 2,51x con prompts de 8K y 2K tokens de salida.

## Requisitos de hardware

- GPU Hopper obligatoria: H100 o H200. Las kernels BellowsKV-Flash dependen de FlashMLA y no funcionan en arquitecturas anteriores.
- Una sola GPU: vLLM debe ejecutarse con tensor parallel size 1.
- VRAM: los pesos del base en bfloat16 ocupan aproximadamente 16 GB; a ello se suma la cache comprimida de 9,6 KiB por token (unos 315 MB para 32K tokens) y el delta de 1,5 GB. No se publica una cifra oficial de VRAM total.
- No cabe en GPU de consumo (RTX 4090, etc.) por la dependencia de FlashMLA y Hopper.
- Despliegue mediante vLLM 0.29.0 con el plugin BellowsKV (arquitectura `BellowsKVFlashLlamaForCausalLM`) o mediante Transformers con `bellowskv.flash.enable`; requiere instalar el paquete desde github.com/MorrisZJ/BellowsKV.
- En vLLM: desactivar prefix caching y chunked prefill, fijar `--max-model-len 32768` y `--max-num-batched-tokens 32768`; sin decodificacion especulativa ni conectores KV.
- En Transformers: solo lotes sin padding (tamano 1 o prompts de igual longitud).
- Latencia y throughput medidos: paso de decodificacion de 7,18 ms en batch 1 y 10,57 ms en batch 16 a 32K; hasta 2.983 tok/s en batch 128.
- En batch 1 y contextos muy por debajo de 32K, la decodificacion es algo mas lenta que la densa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KV cache por token | Rendimiento long-context | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-BellowsKV-Flash-Turbo | 8B | 32K (evaluado) | 9,6 KiB | 95,3 % del denso en LongBench 32K | Llama 3.1 Community | Hugging Face (delta) |
| Llama-3.1-8B-Instruct-BellowsKV-Flash-Lite | 8B | 32K (evaluado) | 9,6 KiB | 93,5 % del denso en LongBench 32K | Llama 3.1 Community | Hugging Face (delta) |
| meta-llama/Llama-3.1-8B-Instruct (denso) | 8B | 128K | 128 KiB | referencia (100 %) | Llama 3.1 Community | Hugging Face |

No se dispone en la informacion proporcionada de comparaciones con otras tecnicas de compresion de KV cache (por ejemplo, cuantizacion de cache o atencion dispersa).

## Limitaciones y advertencias

- Solo funciona con Llama-3.1-8B-Instruct en bfloat16, una unica GPU y arquitecturas Hopper; no es portable a otros modelos ni a GPUs Ampere o anteriores.
- En vLLM no admite prefix caching, decodificacion especulativa ni conectores KV.
- En Transformers solo procesa lotes sin padding (tamano 1 o prompts de igual longitud).
- El prefill troceado degrada la precision (87,6 por ciento con chunks de 8K frente a 95,1 con prefill exacto); en produccion debe usarse prefill exacto.
- En batch 1 y contextos muy inferiores a 32K, la decodificacion es algo mas lenta que la densa.
- La compresion de la KV cache implica perdida de informacion: la puntuacion media en LongBench es del 95,3 por ciento del denso, con tareas como GovRep (82,2), 2Wiki (90,1) y Qasper (90,4) claramente por debajo.
- Idiomas: solo ingles documentado; el comportamiento en castellano no esta evaluado.
- Riesgo de alucinacion y sesgos heredados del modelo base Llama-3.1-8B-Instruct, no caracterizados de forma especifica para este delta.
- Licencia Llama 3.1 Community: el uso comercial esta sujeto a la politica de uso aceptable de Meta y a los terminos de la licencia; los pesos derivados deben conservar el aviso de licencia.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y el modelo se publico en noviembre de 2026; no hay validacion independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/morriszjm/Llama-3.1-8B-Instruct-BellowsKV-Flash-Turbo
- Variante Lite: https://huggingface.co/morriszjm/Llama-3.1-8B-Instruct-BellowsKV-Flash-Lite
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Codigo: https://github.com/MorrisZJ/BellowsKV
- Resultados del repositorio: https://github.com/MorrisZJ/BellowsKV#results
- Paper: https://arxiv.org/abs/2610.35023
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
