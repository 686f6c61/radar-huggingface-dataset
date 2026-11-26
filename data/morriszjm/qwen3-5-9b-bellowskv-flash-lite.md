# morriszjm/Qwen3.5-9B-BellowsKV-Flash-Lite

## Resumen

Qwen3.5-9B-BellowsKV-Flash-Lite es un conjunto de parametros complementarios (un delta, no un modelo completo) para Qwen/Qwen3.5-9B que implementa BellowsKV-Flash, una tecnica de compresion de la cache KV orientada a contextos largos. Lo publica el usuario morriszjm (autoria del paper: Jiamu Zhang y Hanjie Chen) bajo licencia Apache 2.0. El repositorio pesa 0,1 GB y contiene unicamente los mapas de registros (`params.safetensors`, 0,11 GB) y su configuracion; los pesos del modelo base no se modifican.

El problema que resuelve es el coste de memoria y la latencia de decodificacion con ventanas de contexto de 32K a 128K tokens. Aprovechando que Qwen3.5-9B solo mantiene claves y valores en 8 de sus 32 capas (las otras 24 son capas Gated DeltaNet con estado de tamano fijo), BellowsKV comparte un unico registro latente por token entre cada par de capas de atencion completa (3+7, 11+15, 19+23, 27+31), en formato fp8 compatible con FlashMLA: 2,4 KiB por token frente a 32 KiB a 32K. Segun el autor, esto reduce la cache KV 13,5 veces manteniendo el 99,0 % del rendimiento denso en LongBench a 32K, y multiplica por 4,3 (32K) y 6,2 (128K) el throughput de decodificacion en vLLM sobre una H100.

Es relevante para equipos que sirven modelos de 9B con contextos muy largos y se ven limitados por la VRAM de la cache KV: permite multiplicar el numero de peticiones concurrentes (de 58 a 442 peticiones de 32K en una H100 NVL) sin reentrenar el modelo base. La contrapartida es una dependencia estricta de hardware Hopper y de vLLM 0.29.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida sobre Qwen3.5-9B: 8 capas de atencion completa con cache KV compartida (BellowsKV-Flash) + 24 capas Gated DeltaNet con estado fijo |
| Parametros totales | no disponible (modelo base Qwen3.5-9B; el delta ocupa 0,11 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 131.072 tokens en la configuracion de referencia (`--max-model-len 131072`) |
| Tipos de cuantizacion | registro KV en fp8 (512 dims latentes + 64 dims RoPE); pesos del modelo en bfloat16; no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (solo mapas de registros BellowsKV; los pesos base se cargan desde Qwen/Qwen3.5-9B) |

## Arquitectura y entrenamiento

BellowsKV-Flash no es un transformer denso al uso: opera sobre la arquitectura hibrida de Qwen3.5-9B, en la que solo 8 de las 32 capas mantienen cache KV explicita y las 24 restantes son capas Gated DeltaNet con un estado de tamano fijo que no crece con el contexto. Cada par de capas de atencion completa comparte un unico registro por token en el layout nativo de FlashMLA (512 dimensiones latentes mas 64 de RoPE, fp8). En decodificacion, la atencion lee ese registro fp8 a traves de FlashMLA junto con una ventana exacta pequena (los primeros 4 y los ultimos 123 tokens), fusiona ambas en un unico softmax y aplica la puerta de salida del modelo. No se reconstruye la cache original: se calcula la atencion directamente sobre el registro comprimido.

La variante Lite se obtiene con inicializacion en forma cerrada y destilacion por bloques sobre texto de calibracion (entrenamiento de WikiText-2 mas codigo Python), con un coste de 0,3 horas de GPU H100. No se documenta un entrenamiento adicional del modelo base, ni numero de tokens de preentrenamiento, ni etapas de RLHF/DPO en la informacion disponible. La innovacion tecnica principal es la comparticion de un latente entre multiples capas, leido con la query normalizada exacta de cada capa (tras QK-norm), lo que evita la perdida de calidad habitual en esquemas de compresion por cuantizacion o pooling de la cache.

## Capacidades

- Generacion de texto en ingles y razonamiento de contexto largo, heredados del modelo base Qwen3.5-9B.
- Procesamiento de entradas de hasta 128K tokens con una cache KV 13,5 veces menor que la densa.
- Decodificacion de alto throughput en vLLM con FlashMLA (hasta 5.617 tok/s a 32K y 1.895 tok/s a 128K en una H100 NVL, segun el autor).
- Soporte de tool calling y function calling: no documentado en la informacion disponible (depende de las capacidades del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: la model card declara unicamente ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio; el alcance es text only.

## Casos de uso

- Analisis de documentos extensos: resumen y extraccion de información sobre contratos, informes o expedientes de decenas de miles de tokens, aprovechando la ventana de 128K y la cache comprimida para mantener varias peticiones simultaneas en una sola GPU.
- Revision de codigo en repositorios grandes: las tareas RepoP y LCC de LongBench mantienen el 99,0 % y el 99,8 % del rendimiento denso, por lo que el modelo es adecuado para analizar ficheros y contextos de repositorio completos en pipelines de integracion continua.
- Preguntas y respuestas sobre bases documentales (RAG de contexto largo): con 442 peticiones de 32K en cache frente a 58 del modelo denso en una H100 NVL, permite servir mas usuarios concurrentes con el mismo presupuesto de VRAM.
- Procesamiento por lotes de articulos o transcripciones: el throughput de 5.617 tok/s a 32K (batch 256) y las ganancias de 2,81 veces en escenarios con 8K tokens de salida lo hacen adecuado para tareas offline de generacion masiva.
- Agentes de navegacion o interaccion con herramientas sobre historiales largos: la ventana exacta de los ultimos 123 tokens preserva el contexto inmediato de la conversacion, util para asistentes con historial extenso (siempre que el modelo base soporte tool calling, no verificado aqui).
- Servicio de chat con contexto muy largo en produccion: el escenario de 96 peticiones de 128K con 2K de salida ofrece 1,67 veces el throughput denso, lo que reduce el coste por token en despliegues de atencion al cliente con historiales extensos.
- Experimentacion en investigacion sobre compresion de cache KV: el repositorio incluye scripts de reproduccion (`tests/check_flash_qwen35.py`, `bellowskv-flash bench`) para validar y comparar el metodo frente a vLLM denso.

## Benchmarks y rendimiento

LongBench Protocol-B a 32K (11 tareas, 2.065 prompts, decodificacion greedy, puntuacion por tarea como porcentaje del modelo denso en el mismo harness):

| Tarea | Denso (puntuacion) | BellowsKV-Flash, 13,48x (% del denso) |
|---|---|---|
| Qasper | 48,37 | 96,4 |
| MFQA | 54,92 | 100,1 |
| HotpotQA | 62,79 | 99,0 |
| MuSiQue | 47,27 | 100,6 |
| NrtvQA | 28,97 | 97,5 |
| GovRep | 31,23 | 96,4 |
| QMSum | 21,93 | 100,1 |
| PsgRet | 100,0 | 100,0 |
| LCC | 67,86 | 99,8 |
| RepoP | 62,52 | 99,0 |
| 2Wiki | 59,28 | 100,5 |
| Media | - | 99,0 |

Rendimiento en vLLM 0.29 sobre una H100 NVL (`gpu_memory_utilization` 0,9):

| Metrica | Denso | BellowsKV-Flash | vs denso |
|---|---|---|---|
| Peticiones de 32K que caben en la cache KV | 58 | 442 | 7,6x |
| Paso de decodificacion, batch 1, 32K / 128K | 6,67 / 8,11 ms | 6,97 / 7,26 ms | 0,96x / 1,12x |
| Throughput de decodificacion, 32K | 1.315 tok/s (batch 48) | 5.617 tok/s (batch 256) | 4,3x |
| Throughput de decodificacion, 128K | 308 tok/s (batch 12) | 1.895 tok/s (batch 48) | 6,2x |
| Throughput de salida en serving (256 x 32K + 256 out) | - | - | 1,18x |
| Throughput de salida en serving (512 x 8K + 2K) | - | - | 1,65x |
| Throughput de salida en serving (96 x 128K + 2K) | - | - | 1,67x |
| Throughput de salida en serving (256 x 32K + 8K) | - | - | 2,81x |

Nota del autor: las puntuaciones LongBench se obtuvieron con la decodificacion de referencia en Transformers (prefill exacto, query en fp32); el plugin de vLLM redondea esa query a fp8 y solo se valido contra vLLM denso en un needle de 28K tokens y cuatro prompts de LongBench, no en el conjunto completo.

## Requisitos de hardware

- GPU Hopper obligatoria: H100 o H200 (los kernels BellowsKV-Flash usan FlashMLA). No hay soporte documentado para Ampere, Ada ni consumer.
- Una sola GPU (tensor parallel size 1) en la configuracion evaluada.
- VRAM: no se publica una cifra exacta; el modelo base es de 9B en bfloat16 y la cache KV comprimida ocupa 2,4 KiB por token a 32K (frente a 32 KiB del denso). En una H100 NVL con `gpu_memory_utilization` 0,9 caben 442 peticiones de 32K en cache.
- No cabe en GPU consumer: la dependencia de FlashMLA y de Hopper lo impide.
- Despliegue: vLLM 0.29.0 exclusivamente, con `--block-size 540`, `--max-model-len 131072`, `--no-enable-prefix-caching`, `--no-enable-chunked-prefill`, `--max-num-batched-tokens 131072` y `--hf-overrides '{"bellowskv_flash": "morriszjm/Qwen3.5-9B-BellowsKV-Flash-Lite"}'`. Requiere `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`.
- No hay ruta de despliegue en Transformers para Qwen3.5; llama.cpp, Ollama y TGI no estan soportados.
- Latencia y throughput: paso de decodificacion de 6,97 ms a 32K y 7,26 ms a 128K (batch 1); throughput de 5.617 tok/s a 32K (batch 256) y 1.895 tok/s a 128K (batch 48).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3.5-9B (denso) | 9B | 131.072 (config. de referencia) | 32 KiB/token a 32K | Apache 2.0 | vLLM estandar, amplio soporte de hardware |
| Qwen3.5-9B-BellowsKV-Flash-Lite | 9B (base) + delta de 0,11 GB | 131.072 | 2,4 KiB/token a 32K (13,48x menor) | Apache 2.0 | vLLM 0.29 + FlashMLA, solo Hopper |
| Alternativas de compresion de cache KV (p. ej. cuantizacion fp8/int4 de la cache) | no disponible | depende del modelo base | reduccion tipica de 2x a 4x | depende de la implementacion | no disponible |

No se dispone de datos de benchmarks de modelos comparables de la misma categoria en la informacion proporcionada; la unica comparacion cuantitativa publicada es contra el propio Qwen3.5-9B denso en el mismo harness.

## Limitaciones y advertencias

- Solo texto y solo en ingles segun la model card; no se documentan capacidades multilingues.
- Dependencia estricta de vLLM 0.29 y de GPU Hopper (H100/H200); no funciona en Transformers, llama.cpp, Ollama ni TGI.
- Limitaciones del plugin vLLM: sin prefix caching, sin decodificacion especulativa y sin conectores KV.
- La validacion del plugin de vLLM (query en fp8) es parcial: un needle de 28K y cuatro prompts de LongBench, no el conjunto completo; las cifras de calidad del 99,0 % corresponden a la decodificacion de referencia en Transformers con query en fp32.
- El repositorio no contiene pesos completos: es un delta que requiere descargar Qwen/Qwen3.5-9B y el codigo de BellowsKV; sin ese codigo los `params.safetensors` no son utilizables.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; heredados del modelo base, que no se detalla aqui.
- Sin datos publicados de benchmarks fuera de LongBench a 32K; no hay resultados a 128K ni en tareas fuera de contexto largo.
- Uso comercial permitido por la licencia Apache 2.0, tanto del delta como del modelo base, segun el autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el paper asociado (arXiv:2610.35023) no se ha verificado de forma independiente en esta ficha.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/morriszjm/Qwen3.5-9B-BellowsKV-Flash-Lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Codigo: https://github.com/MorrisZJ/BellowsKV
- Paper: https://arxiv.org/abs/2610.35023
