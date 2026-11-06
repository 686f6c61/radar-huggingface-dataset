# Krissaito470/Qwen3.8-Flash-Next-DS4-Mixed-Q3

## Resumen

Qwen3.8-Flash-Next-DS4-Mixed-Q3 es una cuantización mixta no oficial del modelo Qwen3.8-Flash-Next de Qwen, creada por el usuario de Hugging Face Krissaito470. No se trata de un modelo nuevo, sino de dos ficheros GGUF (Mixed-Q3-64GB y Mixed-Q3-96GB) construidos combinando por capas las cuantizaciones Q2 y Q4 existentes, con el objetivo de ofrecer un punto intermedio en tamaño y precisión entre ambas versiones. El modelo base es un MoE de 181.564 millones de parámetros totales (según los metadatos de safetensors del repositorio original).

La particularidad de esta publicación es que los ficheros están destinados específicamente al runtime DwarfStar (ds4), de antirez. Emplean la arquitectura `qwen4exp` e incorporan dentro del propio GGUF una tabla n-gram en BF16 de 95,37 GiB que ds4 lee directamente de disco, lo que habilita decodificación especulativa por n-gramas y MTP (multi-token prediction). Esto los hace incompatibles, en principio, con otros runtimes como llama.cpp u Ollama.

Su relevancia práctica es clara: permite ejecutar un MoE de más de 180 mil millones de parámetros en Macs con Apple Silicon de 64 y 96 GB de memoria unificada, con velocidades de decodificación medidas de entre 69 y 103 tok/s según el modo, manteniendo una calidad notablemente superior a la versión Q2 pura. Es un proyecto comunitario sin afiliación con Qwen, Alibaba, antirez o Ivan Fioravanti.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (variante `qwen4exp` para DwarfStar, con bloque MTP embebido) |
| Parametros totales | 181.564.316.288 (181,56 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ds4 se ha probado con ctx de 8192, 32768 y 131072) |
| Tipos de cuantizacion | Mixta por capas: Q4_K, IQ2_XXS, MXFP4, Q2_K; Q8_0 en atencion/SSM/experto compartido; BF16 en token_embd y tabla n-gram; F16 en HC; F32 en router y normas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (licencia "other" heredada del modelo base) |
| Formato de pesos | GGUF (dos ficheros: Mixed-Q3-64GB de 143,3 GiB y Mixed-Q3-96GB de 153,2 GiB) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un modelo de mezcla de expertos (MoE) con 181,56 mil millones de parámetros totales, 49 bloques (el bloque 48 es un bloque MTP embebido para predicción multi-token) y, según los tags del repositorio, componentes de atención y SSM (attention / SSM / shared-expert projections), lo que sugiere una arquitectura híbrida. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO del modelo base en la información proporcionada.

En cuanto a la construcción de esta cuantización, no se ha re-quantizado nada: los ficheros se ensamblan copiando tensores desde el GGUF Q2 (base) y el GGUF Q4 (donante) mediante el script `splice_mixed_expert_layers_gguf.py` del repositorio ds4. Solo difieren los tensores de expertos enrutados (`ffn_*_exps`). En Mixed-Q3-64GB, las proyecciones gate/up usan Q4_K en los bloques 41, 42 y 44–46 e IQ2_XXS en los 43 restantes, mientras que las proyecciones down combinan MXFP4 (37 bloques) y Q2_K (12 bloques). En Mixed-Q3-96GB, gate/up usa IQ2_XXS en los bloques 0–24 y Q4_K en 25–48, con down en MXFP4 en los 49 bloques. Todas las demás tensores son idénticos en ambos ficheros: atenciones, SSM y experto compartido en Q8_0, `token_embd` y la tabla n-gram en BF16, tensores HC en F16 y router y normas en F32. Los metadatos `general.name` y `general.file_type` se editaron posteriormente sin modificar ningún dato de tensor.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Decodificación especulativa mediante tabla n-gram BF16 embebida en el fichero, leída directamente de disco por ds4.
- Aceleración por MTP (multi-token prediction) gracias al bloque MTP embebido (bloque 48); la ganancia depende del contenido generado.
- Entrada de imagen (visión): confirmada como funcional, aunque requiere el encoder de visión como GGUF separado (`qwen38-vision`, descargable desde el repositorio de ds4 y pasado con `--vision FILE`).
- Contextos largos probados hasta 131.072 tokens en ds4.
- Modo "thinking" desactivable (el benchmark CLI usa `--nothink`).
- No se menciona soporte de tool calling / function calling ni capacidades agénticas en la información disponible.

## Casos de uso

- Ejecución local de un MoE de 181 B en Apple Silicon: los ficheros están diseñados para Macs de 64 GB (Mixed-Q3-64GB, ≈49 GiB residentes) y 96 GB (Mixed-Q3-96GB, ≈58 GiB residentes), lo que permite usar un modelo de frontera sin GPU de datacenter.
- Asistencia de código local y privada: con ≈101–103 tok/s de decodificación en código con MTP activado, es adecuado para autocompletado y refactorización en un editor local sin enviar código a servicios externos.
- Procesamiento de prompts largos: el prefill medido ronda 1.900 tok/s y se han probado contextos de 32.768 y 131.072 tokens, útil para resumir documentos extensos o analizar repositorios completos.
- Servidor de inferencia local: ds4-server expone el modelo como servicio con `--mtp`, apto para integraciones en estaciones de trabajo Mac Studio.
- Análisis de imágenes localmente: combinando estos GGUF con el encoder de visión separado, se pueden describir o razonar sobre imágenes sin conexión.
- Comparación de precisión frente a coste de memoria: al existir versiones Q2, Mixed-Q3-64GB, Mixed-Q3-96GB y Q4 del mismo modelo, es útil para estudiar el compromiso entre cuantización y calidad (medido aquí por NLL frente a una referencia hospedada).
- Experimentación con decodificación especulativa: al incluir la tabla n-gram en el fichero, es un banco de pruebas práctico para el runtime DwarfStar y técnicas MTP.

## Benchmarks y rendimiento

Datos medidos por el autor en Mac Studio M5 Ultra de 96 GB, con ds4 commit 8db1d1d, CLI con 256 tokens generados, greedy (`--temp 0 --nothink`), ctx 8192 y `--prefill-chunk 1024`. Se incluyen las versiones Q2 y Q4 como referencia.

| Métrica | Q2 | Mixed-Q3-64GB | Mixed-Q3-96GB | Q4 |
|---|---:|---:|---:|---:|
| Decode, ds4-bench, 8K ctx (tok/s) | 69,5 | 69,2 | 69,9 | 69,4 |
| Prefill, ds4-bench, 8K ctx (tok/s) | 1.941 | 1.918 | 1.938 | 1.956 |
| Decode CLI sin MTP, prosa / código (tok/s) | 73,5 / 73,5 | 73,2 / 73,4 | 73,2 / 73,9 | 73,7 / 73,8 |
| Decode CLI con MTP, prosa / código (tok/s) | 85,2 / 101,9 | 84,9 / 101,1 | 83,0 / 103,5 | 83,8 / 101,3 |

Acuerdo con una referencia hospedada (NLL medio de continuaciones del `qwen3.8-flash` hospedado por Alibaba vía OpenRouter; menor es mejor; porcentajes relativos al GGUF Q4):

| Conjunto | Q2 | Mixed-Q3-64GB | Mixed-Q3-96GB | Q4 |
|---|---:|---:|---:|---:|
| 100 prompts cortos (ctx 4096) | 0,3527 (+21,4 %) | 0,3327 (+14,5 %) | 0,3069 (+5,6 %) | 0,2906 |
| 12 prompts largos (ctx 32768) | 0,1528 (+21,9 %) | 0,1409 | no disponible | no disponible |

La tabla del README se corta en ese punto, por lo que los valores completos de la fila de prompts largos no están disponibles. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

En un M4 Max de 64 GB, Mixed-Q3-64GB midió 49,44 GiB a `--ctx 8192`, ≈54 tok/s de decodificación con MTP y ≈604 tok/s de prefill (prompt de 6K).

## Requisitos de hardware

- VRAM/memoria unificada estimada (incluye KV cache y buffers, con `--prefill-chunk 1024`):
  - Mixed-Q3-64GB: ≈49 GiB a ctx 8192, ≈50 GiB a ctx 32768, ≈54 GiB a ctx 131072.
  - Mixed-Q3-96GB: ≈59 GiB a ctx 8192, ≈60 GiB a ctx 32768, ≈63 GiB a ctx 131072.
  - `--prefill-chunk 8192` añade unos 6 GiB adicionales.
- Hardware objetivo: Macs con Apple Silicon y memoria unificada. Mixed-Q3-64GB funciona en un Mac de 64 GB (verificado en M4 Max); Mixed-Q3-96GB está pensado para Macs de 96 GB (medido en Mac Studio M5 Ultra) y no se ha probado en máquinas de 64 GB.
- No cabe en GPUs de consumo típicas (una RTX 4090 con 24 GB es muy insuficiente); el diseño está claramente orientado a memoria unificada de Apple Silicon, no a GPUs NVIDIA.
- La tabla n-gram BF16 de 95,37 GiB se lee directamente de disco: se recomienda mantenerla en un SSD local rápido.
- Despliegue: exclusivamente mediante DwarfStar (ds4), compilado desde el repositorio (`git clone https://github.com/antirez/ds4.git && make`), con los binarios `ds4` y `ds4-server` (este último con `--mtp`). No es esperable que cargue en llama.cpp, Ollama, vLLM o TGI, ya que usa la arquitectura `qwen4exp` con la tabla n-gram embebida; se requiere una compilación de ds4 con lector nativo BF16 n-gram (las versiones antiguas con `--ple` no pueden cargar estos ficheros).
- Rendimiento: ≈69 tok/s de decodificación y ≈1.900 tok/s de prefill en Mac Studio M5 Ultra; ≈54 tok/s con MTP y ≈604 tok/s de prefill en M4 Max de 64 GB.

## Comparativa con modelos similares

Comparativa entre las variantes cuantizadas del mismo modelo publicadas para ds4 (datos del propio README):

| Variante | Tamaño de fichero | Pesos residentes | NLL (100 prompts cortos) | Decode 8K (tok/s) | Memoria a ctx 8192 |
|---|---:|---:|---:|---:|---:|
| Q2 (antirez) | no disponible | no disponible | 0,3527 (+21,4 %) | 69,5 | no disponible |
| Mixed-Q3-64GB (esta ficha) | 143,3 GiB | 47,96 GiB | 0,3327 (+14,5 %) | 69,2 | ≈49 GiB |
| Mixed-Q3-96GB (esta ficha) | 153,2 GiB | 57,83 GiB | 0,3069 (+5,6 %) | 69,9 | ≈59 GiB |
| Q4 (antirez) | no disponible | no disponible | 0,2906 (referencia) | 69,4 | no disponible |

Frente a otros MoE grandes cuantizados ejecutables en Apple Silicon, no hay datos comparativos publicados en la información disponible. La alternativa natural para otros runtimes sería el GGUF original de antirez/qwen3.8-flash-next-gguf (Q2/Q4) en runtimes compatibles, aunque estos ficheros Mixed-Q3 no cargan fuera de ds4.

## Limitaciones y advertencias

- Construcción no oficial y comunitaria: sin afiliación ni respaldo de Qwen, Alibaba, antirez o Ivan Fioravanti.
- Son pesos cuantizados, no copias sin pérdida del modelo original; la calidad es inferior a la referencia hospedada (NLL entre +5,6 % y +14,5 % respecto al Q4, según la variante).
- Compatibilidad de runtime muy limitada: usan la arquitectura `qwen4exp` con la tabla n-gram BF16 dentro del fichero y no se espera que funcionen en otros runtimes (no probado fuera de ds4). Requieren una compilación reciente de ds4 con lector BF16 n-gram nativo.
- La ganancia de MTP depende fuertemente del contenido generado, por lo que el speedup no es constante.
- La visión no está incluida: requiere descargar el encoder de visión como GGUF separado.
- Mixed-Q3-96GB no se ha probado en máquinas de 64 GB; no asumir que cabe.
- Idiomas soportados, parámetros activos y longitud de contexto oficial del modelo base: no disponibles en la información proporcionada.
- Restricciones de licencia: el modelo base se distribuye bajo qwen-community-license-1.0, que puede imponer condiciones al uso comercial; debe revisarse el fichero LICENSE del repositorio antes de desplegar en producción.
- Riesgo de alucinación, sesgos y comportamientos del modelo base: no se documenta nada específico en la información disponible, pero deben asumirse los riesgos habituales de un LLM de gran tamaño en producción.
- Los metadatos `general.file_type` fueron alterados a "unspecified" (1024) para describir la mezcla; algunas herramientas podrían mostrar el tipo de cuantización incorrectamente.

## Enlaces

- Ficha del modelo (esta cuantización): https://huggingface.co/Krissaito470/Qwen3.8-Flash-Next-DS4-Mixed-Q3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF originales Q2/Q4 de antirez: https://huggingface.co/antirez/qwen3.8-flash-next-gguf
- Repositorio DwarfStar (ds4): https://github.com/antirez/ds4
- Licencia: https://huggingface.co/Krissaito470/Qwen3.8-Flash-Next-DS4-Mixed-Q3/blob/main/LICENSE
