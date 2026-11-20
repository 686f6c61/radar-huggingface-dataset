# drofn/SenseNova-Loop-9B-GGUF

## Resumen

SenseNova-Loop-9B es un modelo multimodal de tipo image-text-to-text desarrollado por SenseNova, con 9.200.240.000 parametros totales y una arquitectura basada en un transformer con bucles (looped-transformer). El repositorio `drofn/SenseNova-Loop-9B-GGUF` es una cuantizacion comunitaria del modelo base `sensenova/SenseNova-Loop-9B`, publicada por el usuario drofn, que ofrece una escalera de 24 cuantizaciones GGUF en el formato del pull request upstream de llama.cpp #32588.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 9B multimodal en hardware de consumo mediante cuantizacion, con soporte de decodificacion especulativa mediante la cabeza MTP (multi-token prediction) incluida en el bloque 56. El modelo soporta los idiomas ingles, chino y turco, y se distribuye bajo licencia Apache 2.0.

No obstante, estos ficheros requieren una compilacion especifica del PR #32588, que en la fecha de publicacion (2026-11-20) estaba abierto y no fusionado; ni llama.cpp estandar, ni LM Studio, ni Ollama pueden cargarlos todavia. Ademas, el propio autor advierte de que el rendimiento es inferior al de sus ficheros anteriores con kernels CUDA especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped-transformer (transformer con bucles), multimodal image-text-to-text, con cabeza MTP |
| Parametros totales | 9.200.240.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 98.304 tokens probados con `IQ2_M` en 8 GB; 49.152 con `Q4_K_M`; el maximo nativo no se especifica |
| Tipos de cuantizacion | 24 variantes GGUF: `Q8_0`, `Q6_K`, `Q5_1`, `Q5_K_M`, `Q5_K_S`, `Q5_0`, `Q4_1`, `Q4_K_M`, `Q4_K_S`, `IQ4_NL`, `Q4_0`, `IQ4_XS`, `Q3_K_L`, `Q3_K_M`, `IQ3_XXS`, `IQ2_M`, `IQ2_XS`, entre otras |
| Idiomas soportados | en, zh, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base); proyectores de vision en GGUF F16 (918 MB) y Q8_0 (624 MB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles (looped-transformer), una variante en la que ciertos bloques se reutilizan varias veces, lo que incrementa la profundidad efectiva sin aumentar proporcionalmente el numero de parametros. Incluye una cabeza MTP (multi-token prediction) en el bloque 56, que habilita decodificacion especulativa mediante el flag `--spec-type draft-mtp` en llama.cpp. El pipeline es image-text-to-text, por lo que integra un proyector de vision separado (`mmproj`) que debe cargarse junto al modelo.

Esta publicacion concreta no aporta informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo RLHF o DPO; esos detalles corresponderian a la model card del modelo base `sensenova/SenseNova-Loop-9B`, que no se incluye en la informacion proporcionada. La innovacion tecnica destacable de esta distribucion es la escalera de cuantizaciones con imatrix y recetas de cuantizacion propias, con metricas de divergencia KL (KLD) frente a los logits BF16 para cada variante.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes y texto combinados (image-text-to-text) mediante el proyector `mmproj`.
- Razonamiento con modo thinking, controlable mediante `--reasoning-format deepseek` y desactivable.
- Decodificacion especulativa mediante la cabeza MTP incluida en el bloque 56.
- Soporte multilingue en ingles, chino y turco.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- Soporte de plantillas de chat mediante `--jinja`.

## Casos de uso

- Asistente conversacional local en hardware de consumo: con `Q4_K_M` (5,94 GB) cabe en una GPU de 8 GB y permite conversaciones multi-turno con hasta 49.152 tokens de contexto, adecuado para prototipos y uso personal sin depender de la nube.
- Analisis de documentos con imagenes en equipos modestos: la variante `IQ2_M` (3,89 GB) permite cargar el modelo y el proyector de vision en GPUs de 8 GB con contexto de hasta 98.304 tokens, util para extraer informacion de capturas, formularios o diagramas.
- Evaluacion de cuantizaciones en pipelines de investigacion: la tabla de KLD por conjunto de datos y el porcentaje de coincidencia del token top-1 permiten seleccionar la variante con el mejor compromiso calidad/tamano para un experimento concreto.
- Despliegue en entornos con llama.cpp personalizado: util para equipos que ya mantienen builds propios y quieren integrar un modelo multimodal de 9B con licencia Apache 2.0 sin restricciones de uso comercial.
- Procesamiento multilingue ingles-chino-turco: adecuado para tareas de traduccion o atencion al cliente en esas tres lenguas, con contexto largo gracias a los 49.152-98.304 tokens segun cuantizacion.
- Pruebas de decodificacion especulativa MTP: el repositorio incluye mediciones con y sin MTP, lo que lo convierte en un banco de pruebas para evaluar el impacto de la prediccion multi-token en distintas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona metricas de calidad de cuantizacion (KLD frente a BF16 y coincidencia del token top-1) y mediciones de velocidad:

| Build y fichero | MTP off | MTP on |
|---|---:|---:|
| Fork antiguo con kernels CUDA mHC, fichero `8GB-v3` | 25,3 tok/s | 48,1 tok/s |
| Build PR #32588, `Q4_K_M` | 16,4 tok/s | 17,7 tok/s |
| Build PR #32588, `IQ2_M` | 14,4 tok/s | 8,5 tok/s |

Medido en una RTX 4060 de 8 GB, contexto 8192, 400 tokens generados, una ejecucion por configuracion.

Calidad de cuantizacion (KLD set 1, menor es mejor; coincidencia top-1):

| Tipo | GB | KLD set 1 | Top-1 set 1 |
|---|---:|---:|---:|
| `Q8_0` | 9,80 | 0,005 | 97,1% |
| `Q6_K` | 7,68 | 0,013 | 95,1% |
| `Q5_K_M` | 6,81 | 0,030 | 92,9% |
| `Q4_K_M` | 5,94 | 0,062 | 89,5% |
| `IQ4_XS` | 5,40 | 0,095 | 87,2% |
| `Q3_K_M` | 4,92 | 0,196 | no disponible |
| `IQ2_M` | 3,89 | 0,557 | no disponible |

## Requisitos de hardware

- VRAM estimada: desde 3,54 GB (`IQ2_XS`) hasta 9,80 GB (`Q8_0`) solo para los pesos; el proyector de vision anade 624 MB (Q8_0) o 918 MB (F16).
- GPU recomendadas: RTX 4060 de 8 GB para `Q4_K_M` e `IQ4_XS`; se sugieren 12 GB para `Q5_K_M` y `Q6_K`, y 16 GB para `Q8_0` (no probado en esas tarjetas).
- Cabe en GPU de consumo: si, con `Q4_K_M` en 8 GB y contexto de 49.152 tokens con KV cache en q8_0 y MTP activado; `IQ2_M` alcanza 98.304 tokens en la misma tarjeta.
- Opciones de despliegue: exclusivamente llama.cpp con el PR #32588 (rama `sensenova-loop`, commit `0832449d627c`). No funciona en llama.cpp estandar, LM Studio ni Ollama.
- Latencia y throughput: 16,4 tok/s (`Q4_K_M`, MTP off) y 17,7 tok/s (MTP on) en RTX 4060; `IQ2_M` rinde 14,4 tok/s con MTP off y 8,5 tok/s con MTP on.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SenseNova-Loop-9B (este GGUF) | 9,2B | hasta 98.304 probados | Apache 2.0 | requiere PR #32588 |
| drofn/SenseNova-Loop-9B-8GB-v3-GGUF | 9,2B | no disponible | Apache 2.0 | fork propio con kernels CUDA mHC; mas rapido (25,3-48,1 tok/s) |
| Modelo base sensenova/SenseNova-Loop-9B | 9,2B | no disponible | Apache 2.0 | safetensors, formato original |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere una compilacion especifica del PR #32588, abierto y no fusionado en la fecha de publicacion; no carga en llama.cpp estandar, LM Studio ni Ollama.
- Los ficheros de repositorios anteriores del mismo autor (6GB, 8GB-v2, 8GB-v3) usan un layout distinto y no son compatibles entre si.
- Rendimiento inferior al de los ficheros anteriores con kernels CUDA especificos: 16,4 tok/s frente a 25,3 tok/s con MTP off.
- El MTP puede degradar el rendimiento en cuantizaciones bajas: en `IQ2_M` baja de 14,4 a 8,5 tok/s.
- La vision no fue evaluada en las pruebas de contexto; las cifras de contexto se midieron sin el proyector.
- No hay datos publicados sobre sesgos, tasa de alucinacion ni calidad en tareas estandar.
- Solo se declaran los idiomas en, zh y tr; el rendimiento en castellano no esta verificado.
- La licencia Apache 2.0 permite uso comercial, pero la inestabilidad del formato GGUF ligada al PR abierto supone un riesgo para produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Repositorio anterior con kernels CUDA: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32588
- Fork de llama.cpp con soporte: https://github.com/blueswhen/llama.cpp (rama `sensenova-loop`, commit `0832449d627c`)
