# morriszjm/Qwen3.5-9B-SPECTRA-Flash

## Resumen

Qwen3.5-9B-SPECTRA-Flash es un conjunto de parametros auxiliares (record maps) para el modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario morriszjm sobre la tecnica SPECTRA del equipo de investigacion aplicada de Nokia. No se trata de un modelo nuevo ni de un fine-tune de pesos: el repositorio contiene unicamente los mapas de compresion del KV cache (0,11 GB en `params.safetensors`) y su configuracion, mientras que los pesos del transformer se cargan intactos desde el modelo original de Qwen.

El problema que resuelve es el coste de memoria y de ancho de banda del KV cache en contextos largos. Segun la model card, el cache resultante es 6,9 veces mas pequeno que el denso manteniendo el 99,6 % de la puntuacion densa en LongBench a 32K, y permite entre 4,4 veces (32K) y 6,2 veces (128K) mas throughput de decodificacion en vLLM sobre una H100. Esto lo hace relevante para despliegues de inferencia de contexto largo donde el cuello de botella es la memoria de la GPU y no la capacidad de computo.

El modelo base Qwen3.5-9B es un hibrido: solo 8 de sus 32 capas conservan atencion completa (keys y values), mientras que las otras 24 son capas Gated DeltaNet con estado de tamano fijo. SPECTRA-Flash actua exclusivamente sobre esas 8 capas de atencion, comprimiendo el registro por token a 4,6 KiB (frente a 32 KiB en denso a 32K) en el layout nativo de FlashMLA. La licencia es Apache 2.0, igual que el modelo base, y el codigo de SPECTRA es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida sobre Qwen3.5-9B: 8 capas de atencion completa + 24 capas Gated DeltaNet; SPECTRA-Flash comprime el KV cache de las capas de atencion |
| Parametros totales | no disponible (heredados de Qwen3.5-9B; el delta SPECTRA ocupa 0,11 GB) |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | 131.072 tokens (128K) en la configuracion de servicio vLLM documentada |
| Tipos de cuantizacion | Registros KV en fp8 (512 dims latentes + 64 dims RoPE); pesos en bfloat16 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (parametros y modelo base); codigo SPECTRA bajo MIT |
| Formato de pesos | safetensors (`params.safetensors`, 0,11 GB) como delta sobre el modelo base |

## Arquitectura y entrenamiento

SPECTRA-Flash no entrena el transformer: ajusta mapas de registros que comprimen el KV cache de cada una de las 8 capas de atencion completa. Cada token se almacena en un registro de 512 dimensiones latentes mas 64 dimensiones RoPE en fp8 (4,6 KiB por token a 32K frente a 32 KiB denso), en el layout que FlashMLA lee de forma nativa. Los mapas parten de un ajuste en forma cerrada de SPECTRA y se refinan mediante destilacion por bloques sobre texto de calibracion (WikiText-2 train y codigo Python), con un coste declarado de 0,3 horas de GPU H100.

En decodificacion, la atencion lee el registro fp8 a traves de FlashMLA junto con una ventana exacta pequena (los primeros 4 tokens y los 123 mas recientes), fusiona ambas ramas en un unico softmax y aplica la puerta de salida del modelo. No hay reconstruccion del cache denso. La query del registro se lee con la query normalizada exacta de la capa (tras QK-norm); en el plugin de vLLM esa query se redondea a fp8, mientras que la evaluacion de referencia en Transformers la mantiene en fp32.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-9B, sin modificacion de pesos.
- Procesamiento de contexto largo: hasta 128K tokens con un KV cache 6,9 veces menor que el denso.
- Mayor capacidad de batching: la cache resultante alberga 290 peticiones de 32K tokens frente a 58 en denso sobre una H100 NVL (5,0 veces mas).
- Decodificacion acelerada: 5.730 tok/s a 32K (batch 256) y 1.915 tok/s a 128K (batch 48) en vLLM 0.29.
- Solo texto: la model card indica explicitamente "text only".
- Idioma: unicamente ingles segun la etiqueta de idioma del repositorio.
- No se documentan tool calling, function calling ni capacidades de agente especificas en la informacion disponible.

## Casos de uso

- Servicio de QA sobre documentos largos: con 128K tokens de contexto y un cache 6,9 veces menor, un unico nodo H100 puede mantener cientos de conversaciones con documentos extensos en memoria, reduciendo el coste por peticion frente al despliegue denso.
- Analisis de repositorios de codigo: la evaluacion incluye las tareas LCC y RepoP de LongBench con puntuaciones del 99,5 % respecto al denso, lo que permite indexar y consultar codebases completas en una sola ventana.
- Resumen de actas y transcripciones extensas: la tarea QMSum alcanza el 98,8 % del denso, adecuado para pipelines de resumen sobre documentos de decenas de miles de tokens.
- Busqueda multi-hop sobre corpus: HotpotQA (100,1 %) y MuSiQue (103,0 %) mantienen o superan ligeramente al denso, util para sistemas RAG con muchos fragmentos recuperados en contexto.
- Serving de alto throughput en produccion: la model card reporta 1,65 veces mas throughput de salida en escenarios de 512 peticiones de 8K+2K y 96 de 128K+2K, y 2,75 veces en 256 peticiones de 32K+8K, lo que justifica su uso en plataformas de inferencia con alta concurrencia.
- Evaluacion comparativa de tecnicas de compresion de KV cache: al ser un delta reproducible con comandos de benchmark incluidos, sirve como referencia para medir el impacto de SPECTRA frente a otras tecnicas en el mismo harness.

## Benchmarks y rendimiento

LongBench Protocol-B a 32K (11 tareas, 2.065 prompts, greedy, puntuacion por tarea como porcentaje del denso en el mismo harness):

| Tarea | Denso (score) | SPECTRA-Flash (6,92x) |
|---|---|---|
| Qasper | 48,37 | 99,3 |
| MFQA | 54,92 | 99,3 |
| HotpotQA | 62,79 | 100,1 |
| MuSiQue | 47,27 | 103,0 |
| NrtvQA | 28,97 | 98,4 |
| GovRep | 31,23 | 98,7 |
| QMSum | 21,93 | 98,8 |
| PsgRet | 100,0 | 100,0 |
| LCC | 67,86 | 99,5 |
| RepoP | 62,52 | 99,5 |
| 2Wiki | 59,28 | 99,2 |
| Media | — | 99,6 |

Rendimiento en vLLM 0.29 sobre una H100 NVL (`gpu_memory_utilization` 0,9):

| Metrica | Denso | SPECTRA-Flash | Ratio |
|---|---|---|---|
| Peticiones de 32K que caben en cache | 58 | 290 | 5,0x |
| Paso de decodificacion, batch 1, 32K | 6,67 ms | 6,86 ms | 0,97x |
| Paso de decodificacion, batch 1, 128K | 8,11 ms | 7,17 ms | 1,13x |
| Throughput de decodificacion, 32K | 1.315 tok/s (batch 48) | 5.730 tok/s (batch 256) | 4,4x |
| Throughput de decodificacion, 128K | 308 tok/s (batch 12) | 1.915 tok/s (batch 48) | 6,2x |

Throughput de salida en serving (todas las peticiones enviadas a la vez): 1,13x (256 x 32K + 256 tokens), 1,65x (512 x 8K + 2K), 1,65x (96 x 128K + 2K) y 2,75x (256 x 32K + 8K).

## Requisitos de hardware

- GPU Hopper obligatoria: H100 o H200 (kernels FlashMLA). No hay soporte documentado para Ampere, Ada ni consumer.
- Un unico GPU (tensor parallel size 1) en la configuracion evaluada.
- Memoria: los benchmarks usan `gpu_memory_utilization` 0,9 en una H100 NVL; la cache resultante alberga 290 peticiones de 32K tokens frente a 58 en denso.
- No cabe en GPU consumer: la model card limita el despliegue a Hopper y no documenta cuantizaciones GGUF ni rutas de llama.cpp u Ollama.
- Despliegue: vLLM 0.29 exclusivamente; la model card indica que no existe ruta en Transformers para Qwen3.5. Requiere `--block-size 540`, `--no-enable-prefix-caching`, `--no-enable-chunked-prefill`, `--max-num-batched-tokens 131072` y el override `spectra_flash`.
- Latencia: paso de decodificacion de 6,86 ms a 32K y 7,17 ms a 128K con batch 1.
- Instalacion: `pip install -e 'SPECTRA[flash]'` desde el repositorio de Nokia Applied Research.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparacion relevante es contra el propio Qwen3.5-9B denso en el mismo harness, resumida a continuacion:

| Criterio | Qwen3.5-9B denso | Qwen3.5-9B-SPECTRA-Flash |
|---|---|---|
| KV cache por token a 32K | 32 KiB | 4,6 KiB (6,9x menor) |
| LongBench 32K (media) | referencia | 99,6 % |
| Throughput decodificacion 128K | 308 tok/s | 1.915 tok/s (6,2x) |
| Peticiones de 32K en H100 | 58 | 290 (5,0x) |
| Licencia | Apache 2.0 | Apache 2.0 |

## Limitaciones y advertencias

- Solo texto: no soporta vision ni audio.
- Solo ingles segun la etiqueta de idioma del repositorio; el rendimiento en otros idiomas no esta documentado.
- Dependencia estricta de vLLM 0.29 y de GPUs Hopper; no hay ruta en Transformers para Qwen3.5 ni soporte para otras versiones de vLLM.
- Sin prefix caching, sin decodificacion especulativa y sin conectores KV en vLLM.
- Solo bfloat16 y tensor parallel size 1: no se documenta soporte multi-GPU.
- La validacion del plugin de vLLM (que redondea la query a fp8) se hizo sobre una aguja de 28K tokens y cuatro prompts de LongBench, no sobre el conjunto completo; la cifra del 99,6 % corresponde a la decodificacion de referencia en Transformers con query en fp32.
- El repositorio no contiene pesos completos: requiere descargar Qwen3.5-9B por separado.
- Riesgo de alusionacion y sesgos: no documentados en la informacion disponible; son los heredados del modelo base.
- Uso comercial permitido por Apache 2.0 (parametros y modelo base) y MIT (codigo), sin restricciones adicionales indicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/morriszjm/Qwen3.5-9B-SPECTRA-Flash
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Codigo SPECTRA: https://github.com/nokia-applied-research/SPECTRA
- Paper: https://arxiv.org/abs/2608.07915
