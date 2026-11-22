# kabcnd/Kenzan-Gemma-4-31B-PinGrid-GGUF

## Resumen

Kenzan-Gemma-4-31B-PinGrid es una cuantizacion GGUF de precisión mixta del modelo denso `google/gemma-4-31B-it`, publicada por el usuario independiente kabcnd bajo la licencia Gemma. Su objetivo no es ofrecer una cuantizacion generica, sino una distribucion de bits por tensor ("PinGrid") disenada explicitamente para ejecutar un modelo de 31B parametros densos en un Apple Silicon con solo 16 GB de memoria unificada, manteniendo en precision alta las capas criticas de atencion global.

El paquete se compone de tres artefactos: el modelo objetivo de 9,96 GiB (2,78 bits por peso de media), un drafter de Multi-Token Prediction (MTP) derivado de `google/gemma-4-31B-it-assistant` reducido a 237 MiB mediante una cirugia de cabeza de salida a `Q3_K`, y una imatrix de calibracion de 26,3 MiB. La innovacion principal es un esquema de decodificacion especulativa que reutiliza la KV cache del modelo objetivo ("Shared-KV"), de modo que el drafter no anade ni un byte de KV cache ni requiere prefill propio.

Es relevante porque demuestra que la combinacion de cuantizacion asimetrica por capa y decodificacion especulativa sin coste de memoria puede duplicar el throughput en hardware de consumo: segun los datos del autor, pasa de 11,26 a 23,17 tok/s en un Mac mini M6 de 16 GB, con un pico de 26,69 tok/s en generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4) con atencion global y sliding-window; drafter MTP Shared-KV |
| Parametros totales | 31B (modelo base); el campo safetensors del repo indica 469.518.852, dato no coherente con el modelo descrito |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 24.576 tokens en la configuracion recomendada (`-c 24576`); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF mixta: `Q6_K`, `Q4_K`, `IQ4_XS`, `IQ3_S`, `IQ2_XS`, `IQ2_XXS`; KV cache `q4_0` |
| Idiomas soportados | en, ru (segun tags del repo) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | GGUF (`llama.cpp` / `llama-clover`, Metal) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 31B parametros con dos regimenes de atencion: 10 capas de atencion global completa (identificadas como `blk.{5,11,17,23,29,35,41,47,53,59}`) y 50 tensores de value en ventana deslizante. La cuantizacion PinGrid explota esta estructura: conserva `Q6_K` en las claves de atencion global (donde `K==V`), `Q4_K` en queries, proyecciones de salida y embeddings atados, `IQ4_XS` en las values de ventana deslizante, `IQ3_S` en los tensores FFN de frontera y baja a `IQ2_XS`/`IQ2_XXS` solo en las FFN interiores de ventana deslizante. La calibracion se realizo con una imatrix de 410 entradas y 28 chunks (`gemma4_31b_imatrix.gguf`).

El componente diferencial es el drafter MTP. En lugar de un modelo borrador independiente, emplea 4 capas (3 de ventana deslizante en `blk.0..2` y 1 global en `blk.3`) que comparten directamente la KV cache de las capas 58 y 59 del modelo objetivo. Esto elimina el coste de prefill y de memoria KV del borrador. La "cirugia de cabeza" re-cuantiza `token_embd.weight` (`[1024, 262144]`) de `Q6_K` a `Q3_K`, reduciendo el drafter de 337 a 237 MiB y conservando el 99,6% de la tasa de aceptacion (43,3% frente a 43,5%, longitud media aceptada 3,57 tokens). Se combina con un cascade `ngram-mod` ejecutado en CPU, sin coste de GPU. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y prosa tecnica en ingles y ruso, con calidad condicionada por la cuantizacion agresiva (2,78 BPW medios).
- Razonamiento y generacion de codigo Python, con picos medidos de 26,69 tok/s en este dominio.
- Decodificacion especulativa multi-token mediante drafter MTP Shared-KV y cascade `ngram-mod`.
- Soporte de plantilla de chat Jinja y formato de razonamiento (`--jinja --reasoning-format auto` en la configuracion recomendada).
- Modo de razonamiento heredado del modelo base `gemma-4-31B-it` (no se detallan capacidades adicionales como vision, audio o tool calling en la informacion disponible).
- Capacidades multilingues limitadas a los idiomas declarados (en, ru); el castellano no figura entre los soportados.

## Casos de uso

- Inferencia local en Apple Silicon de 16 GB: el caso de diseno principal. Permite ejecutar un modelo de 31B en un Mac mini M6 manteniendo el consumo de memoria Metal en torno a 12,1 GB, por debajo del limite `iogpu.wired_limit_mb` de 15,1 GB de macOS.
- Generacion de codigo en local para desarrolladores: el pico medido de 26,69 tok/s en Python lo hace viable para autocompletado y generacion de scripts en un portatil o mini de gama consumer, sin GPU dedicada.
- Redaccion tecnica y documentacion en ingles y ruso: 20,72 tok/s sostenidos en prosa tecnica con el drafter `Q3_K` y `ngram-mod`.
- Servicio de chat single-user con `llama-server`: la configuracion recomendada usa `-np 1`, adecuada para asistentes personales o entornos de desarrollo individuales mas que para concurrencia.
- Experimentacion con decodificacion especulativa: el repo sirve como referencia reproducible para estudiar el impacto de la cuantizacion de la cabeza del drafter en la tasa de aceptacion y el throughput.
- Prototipado de pipelines de razonamiento: el soporte de `--reasoning-format auto` y plantillas Jinja permite integrarlo en flujos con formato de pensamiento estructurado.

## Benchmarks y rendimiento

Mediciones del autor en Mac mini M6 con 16 GB de memoria unificada y Metal (`llama-server`, `-fa on -ctk q4_0 -ctv q4_0 -kvu --no-host`, `--cache-ram 0`):

| Configuracion | Tamano drafter | RAM wired | Prosa tecnica (`tg`) | Pico (`tg_3s`) | Codigo Python (`tg` / pico) | Aceleracion |
|---|---:|---:|---:|---:|---:|---:|
| Baseline sin especulacion | — | 12,22 GB | 11,26 tok/s | 11,35 tok/s | ~11,3 tok/s | 1,00x |
| `draft-mtp` + cabeza `Q6_K` | 337 MiB | 12,83 GB | 20,17 tok/s | 23,23 tok/s | 22,97 tok/s | 2,04x |
| `draft-mtp` + cabeza `Q4_0` | 271 MiB | 12,14 GB | 19,87 tok/s | 22,63 tok/s | 23,11 tok/s (pico 26,69) | 2,05x |
| `ngram-mod,draft-mtp` + cabeza `Q3_K` | 237 MiB | ~12,1 GB | 20,72 tok/s | 23,97 tok/s | 23,17 tok/s | 2,06x |

Datos adicionales del drafter: tasa de aceptacion del 43,3% con `Q3_K` frente al 43,5% con `Q6_K`; longitud media aceptada de 3,57 tokens. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada: el modelo objetivo pesa 9,96 GiB y la configuracion recomendada consume aproximadamente 12,1 GB de memoria wired en Metal, incluyendo KV cache en `q4_0` y contexto de 24.576 tokens.
- Hardware objetivo: Apple Silicon con 16 GB de memoria unificada (validado en Mac mini M6). El autor menciona que busca un Mac mini de 24/32 GB para probar modelos de hasta 80B.
- GPU dedicadas: no se proporcionan mediciones para A100, H100 o RTX 4090. Por tamano, el GGUF de 9,96 GiB cabria en GPUs consumer con 12-16 GB de VRAM, pero no hay datos de rendimiento que lo confirmen.
- Despliegue: `llama.cpp` / `llama-clover` con backend Metal; el comando recomendado usa `llama-server` con `-ngl 99`, `--no-host`, `-fa on`, `--fit off` y `--cache-ram 0`.
- Contexto: se recomienda `-c 24576` o `16384` para no superar el limite de memoria wired de macOS.
- Throughput: 20,72 tok/s en prosa tecnica y 23,17 tok/s en codigo Python con la configuracion completa; 11,26 tok/s sin decodificacion especulativa.
- No se proporcionan datos de latencia de prefill ni de throughput con lotes concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kenzan-Gemma-4-31B-PinGrid | 31B densos | 24.576 (config. recomendada) | GGUF mixta 2,78 BPW | Gemma | Optimizado para 16 GB Apple Silicon con MTP Shared-KV |
| `google/gemma-4-31B-it` (original) | 31B densos | no disponible | safetensors BF16 | Gemma | Modelo base sin cuantizar; requiere mucha mas memoria |
| `google/gemma-4-31B-it-assistant` | drafter MTP | no disponible | safetensors | Gemma | Drafter oficial de decodificacion especulativa |
| Cuantizaciones GGUF genericas de Gemma 4 31B | 31B densos | segun config. | `Q4_K_M` y similares | Gemma | Sin preservacion selectiva por capa ni drafter Shared-KV |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion media de 2,78 BPW con tensores en `IQ2_XS`/`IQ2_XXS` implica una perdida de calidad no cuantificada: no hay evaluaciones de perplexity ni de benchmarks de calidad publicadas.
- El campo de parametros en safetensors del repo (469.518.852) es incoherente con un modelo de 31B y sugiere metadatos incorrectos o incompletos; conviene verificarlo antes de confiar en el inventario.
- Solo se declaran los idiomas ingles y ruso; el rendimiento en castellano no esta validado.
- El rendimiento medido corresponde exclusivamente a Apple Silicon con Metal; no hay datos para CUDA, ROCm ni CPU pura.
- La configuracion recomendada esta pensada para `-np 1` (un unico slot), por lo que no es adecuada para servir multiples usuarios concurrentes.
- El contexto efectivo esta limitado a 24.576 tokens en la configuracion segura para 16 GB, muy por debajo de lo que el modelo base podria soportar con mas memoria.
- El repo no declara `inference: false` por error de metadatos, pero el modelo esta pensado para inferencia local con `llama.cpp`.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos de Google antes de desplegarlo en produccion.
- Riesgo de alucinacion inherente al modelo base, agravado por la cuantizacion agresiva en las capas FFN interiores.
- El proyecto es de un autor individual (kabcnd) con 0 descargas y 0 likes en el momento de la ficha; no hay garantias de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kabcnd/Kenzan-Gemma-4-31B-PinGrid-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Drafter oficial: https://huggingface.co/google/gemma-4-31B-it-assistant
- Apoyo al autor (Ko-fi): https://ko-fi.com/kabcpc
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
