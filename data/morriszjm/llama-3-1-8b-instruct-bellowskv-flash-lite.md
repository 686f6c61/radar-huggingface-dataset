# morriszjm/Llama-3.1-8B-Instruct-BellowsKV-Flash-Lite

## Resumen

Llama-3.1-8B-Instruct-BellowsKV-Flash-Lite es un conjunto de parametros auxiliares (un "delta") para meta-llama/Llama-3.1-8B-Instruct que implementa una tecnica de compresion de la cache KV llamada BellowsKV-Flash. No modifica los pesos del modelo base: aporta unicamente los mapas de registros que permiten sustituir la cache KV densa por una representacion latente compartida entre pares de capas, en el formato que FlashMLA lee de forma nativa (512 dimensiones latentes mas 64 de RoPE, en fp8). El resultado declarado es una cache KV 13,4 veces mas pequena y un decode hasta 4,6 veces mas rapido que el modelo denso en una H100.

Lo desarrolla morriszjm (autoria del paper: Jiamu Zhang y Hanjie Chen) y se apoya en el repositorio BellowsKV y el paper arXiv:2610.35023. La variante Lite se obtiene mediante inicializacion en forma cerrada mas destilacion por bloques sobre texto de calibracion (WikiText-2 train y codigo Python), con un coste de 1,8 horas de GPU H100. Comparte configuracion de despliegue con la variante Turbo, por lo que ambas tienen la misma velocidad, pero Turbo es la mas precisa.

Su relevancia esta en que ataca el cuello de botella de memoria de la cache KV en inferencia de contexto largo sin reentrenar el modelo base, manteniendo el 93,5 % de la puntuacion densa en LongBench a 32K. Es una pieza de infraestructura orientada a servir Llama-3.1-8B-Instruct con mayor throughput y menor huella de memoria en GPUs Hopper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con compresion de cache KV BellowsKV-Flash; registro latente compartido por pares de capas |
| Parametros totales | 8 mil millones (modelo base Llama-3.1-8B-Instruct; el delta pesa 1,5 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion evaluada; el base soporta hasta 128K) |
| Tipos de cuantizacion | Registros KV en fp8; pesos del modelo base en bfloat16 (no se documentan otras cuantizaciones) |
| Idiomas soportados | en (segun la model card; el base Llama 3.1 soporta 8 idiomas) |
| Licencia | Llama 3.1 Community License (codigo BellowsKV bajo Apache-2.0) |
| Formato de pesos | safetensors (params.safetensors, 1,5 GB); requiere pesos base en bfloat16 |

## Arquitectura y entrenamiento

BellowsKV-Flash agrupa las capas por pares y cada par comparte un unico registro por token, almacenado en el layout nativo de FlashMLA: 512 dimensiones latentes mas 64 dimensiones de RoPE en fp8. En la fase de decode, la atencion lee el registro fp8 a traves de FlashMLA y lo combina con una ventana exacta pequena (los primeros 4 tokens y los 123 mas recientes) fusionando ambas contribuciones en un unico softmax. No se reconstruye la cache KV original en ningun momento, lo que evita el coste computacional de descompresion.

El entrenamiento del delta consiste en una inicializacion en forma cerrada seguida de destilacion por bloques sobre texto de calibracion compuesto por WikiText-2 train y codigo Python, con un total de 1,8 horas de GPU H100. No hay reentrenamiento de los pesos de Llama. La innovacion tecnica principal es el uso de FlashMLA como backend de lectura del registro comprimido, junto con la ventana exacta local que preserva la precision en los tokens mas recientes y en el prefijo, donde la atencion suele ser mas sensible.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Llama-3.1-8B-Instruct.
- Generacion de codigo (el modelo base esta ajustado para instrucciones y codigo).
- Contexto largo efectivo de hasta 32.768 tokens con cache comprimida.
- Atencion eficiente en memoria: cache KV de 9,6 KiB por token frente a 128 KiB del denso.
- Inferencia acelerada en decodificacion: hasta 2.983 tok/s en batch 128 (4,6x el denso).
- Compatibilidad con vLLM 0.29 mediante plugin y con Transformers via `bellowskv.flash.enable`.
- Soporte de tool calling y agentes: heredado del base, aunque no se documenta de forma especifica en esta variante.
- Capacidades multilingues: limitadas al idioma en segun la model card (el base soporta mas idiomas, pero no se garantiza el rendimiento con la compresion).

## Casos de uso

- Servicio de chat de contexto largo en produccion: desplegar Llama-3.1-8B-Instruct con vLLM y el plugin BellowsKV para atender conversaciones multi-turno de hasta 32K tokens con una cache KV 13,4 veces menor, lo que permite mantener mas secuencias concurrentes en la misma GPU.
- Procesamiento de documentos extensos: resumen y question answering sobre contratos, informes o articulos de decenas de miles de tokens, donde la ventana exacta local preserva la fidelidad en los pasajes citados y la cache comprimida reduce la VRAM necesaria.
- Analisis de repositorios de codigo: tareas de comprension y generacion sobre ficheros largos o varios ficheros concatenados (LongBench LCC y RepoP), aprovechando el entrenamiento de calibracion sobre codigo Python.
- RAG de alta concurrencia: pipelines de recuperacion aumentada con muchos prompts largos simultaneos; el throughput de serving de vLLM mejora entre 1,22x y 2,51x segun la mezcla de prompts y salidas.
- Evaluacion de agentes multi-paso: ejecucion de cadenas de razonamiento con contexto acumulado largo, donde el coste de memoria de la cache KV suele ser el limitante para mantener muchas trayectorias en paralelo.
- Investigacion en compresion de cache KV: banco de pruebas reproducible (comandos `bellowskv-flash eval` y `bench decode`) para comparar tecnicas de compresion sobre un modelo de referencia bien conocido.
- Despliegue en H100/H200 con presupuesto de memoria ajustado: servir 32K de contexto con una sola GPU y tensor parallel size 1, liberando memoria para pesos, activaciones y batching.

## Benchmarks y rendimiento

LongBench Protocol-B a 32K (11 tareas, 2.028 prompts, greedy), puntuacion por tarea como porcentaje del denso en el mismo backend:

| Tarea | Lite (engine) |
|---|---|
| Qasper | 92,4 |
| MFQA | 97,2 |
| HotpotQA | 95,1 |
| MuSiQue | 95,9 |
| NrtvQA | 94,3 |
| GovRep | 78,4 |
| QMSum | 94,3 |
| PsgRet | 99,5 |
| LCC | 95,9 |
| RepoP | 96,5 |
| 2Wiki | 89,4 |
| Media | 93,5 |

A traves del plugin de vLLM con prefill exacto la media es 93,2. Con chunked prefill la precision cae (Turbo con chunks de 8K: 87,6), por lo que se recomienda prefill exacto. La variante Turbo obtiene 95,3 en el engine.

Rendimiento (H100 NVL, contexto 32K, frente a denso bf16 con FlashAttention-3 y CUDA graphs):

| Metrica | Denso | BellowsKV-Flash |
|---|---|---|
| Cache KV por token | 128 KiB | 9,6 KiB |
| Decode step, batch 1 | 7,23 ms | 7,18 ms |
| Decode step, batch 16 | 24,83 ms | 10,57 ms |
| Throughput maximo de decode | 644 tok/s (batch 16) | 2.983 tok/s (batch 128), 4,6x |
| Throughput de serving vLLM | 1,00x | 1,22x-2,51x |

## Requisitos de hardware

- GPU Hopper obligatoria: H100 o H200 (los kernels BellowsKV-Flash usan FlashMLA). No compatible con Ampere ni consumer.
- VRAM: pesos base en bfloat16 (aproximadamente 16 GB) mas la cache KV comprimida (9,6 KiB por token); a 32K tokens la cache ocupa unos 300 MiB por secuencia, frente a unos 4 GiB con cache densa.
- Tensor parallel size 1 en vLLM: una sola GPU.
- No cabe en GPUs consumer (RTX 4090, etc.) por la dependencia de FlashMLA y Hopper.
- Despliegue: vLLM 0.29.0 con el plugin BellowsKV (flags `--no-enable-prefix-caching --no-enable-chunked-prefill --max-num-batched-tokens 32768`) o Transformers con `bellowskv.flash.enable` (solo batches sin padding, tamano 1 o prompts de igual longitud).
- Latencia: decode step de 7,18 ms en batch 1 y 10,57 ms en batch 16 a 32K; throughput maximo de 2.983 tok/s en batch 128.
- Limitaciones de despliegue: sin prefix caching, sin speculative decoding y sin KV connectors en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV por token | Throughput decode | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (denso) | 8B | 128K | 128 KiB | 644 tok/s (batch 16) | Llama 3.1 | Hugging Face (Meta) |
| BellowsKV-Flash-Lite (esta ficha) | 8B | 32K evaluado | 9,6 KiB | 2.983 tok/s (batch 128) | Llama 3.1 | Hugging Face (delta) |
| BellowsKV-Flash-Turbo | 8B | 32K evaluado | 9,6 KiB | 2.983 tok/s (batch 128) | Llama 3.1 | Hugging Face (delta) |

Frente al modelo denso, la variante Lite reduce la cache KV 13,4 veces y multiplica por 4,6 el throughput maximo de decode, a cambio de una perdida media del 6,5 % en LongBench a 32K. Frente a Turbo, comparte velocidad pero es menos precisa (93,5 frente a 95,3 en el engine). No se dispone de datos de otras tecnicas de compresion de cache KV comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona con Llama-3.1-8B-Instruct en bfloat16; no es un modelo autonomo y requiere descargar los pesos base de Meta y aceptar su licencia.
- Requiere GPU Hopper (H100/H200); no hay soporte para Ampere ni consumer.
- En vLLM no admite prefix caching, speculative decoding ni KV connectors.
- Con chunked prefill la precision cae de forma notable; se recomienda prefill exacto.
- En Transformers solo soporta batches sin padding (tamano 1 o prompts de igual longitud).
- En batch 1 y contextos muy por debajo de 32K, el decode es algo mas lento que el denso.
- Perdida de precision media del 6,5 % en LongBench a 32K; GovRep es la tarea mas afectada (78,4 % del denso).
- Idioma documentado: solo en; el rendimiento multilingue con la compresion no esta garantizado.
- Riesgo de alucinacion heredado del modelo base; la compresion de cache puede agravarlo en tareas de recuperacion de detalles lejanos.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y politica de uso aceptable de Meta; el codigo BellowsKV es Apache-2.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/morriszjm/Llama-3.1-8B-Instruct-BellowsKV-Flash-Lite
- Variante Turbo: https://huggingface.co/morriszjm/Llama-3.1-8B-Instruct-BellowsKV-Flash-Turbo
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de codigo: https://github.com/MorrisZJ/BellowsKV
- Resultados del repositorio: https://github.com/MorrisZJ/BellowsKV#results
- Paper: https://arxiv.org/abs/2610.35023
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
