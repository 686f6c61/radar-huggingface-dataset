# RedHatAI/Muse-Spark-Open-816B-A42B-speculator.dflash2

## Resumen

Muse-Spark-Open-816B-A42B-speculator.dflash2 es un modelo borrador (*draft model*) de decodificación especulativa en BF16, desarrollado conjuntamente por el equipo Speculators de RedHatAI e Inferact. No es un modelo generativo autónomo: su función es acelerar la inferencia del modelo verificador `meta-models/Muse-Spark-Open-816B-A42B-NVFP4`, un modelo de mezcla de expertos (MoE) de 816.000 millones de parámetros totales y 42.000 millones activos, proponiendo varios tokens candidatos por paso que el verificador acepta o rechaza en bloque.

El modelo emplea cinco capas transformer y consume los estados ocultos del verificador en las capas 42, 46, 50, 54 y 58, proponiendo hasta siete tokens borrador por paso de verificación. Con 3.377 millones de parámetros (aproximadamente 3,4 B) y un repositorio de 6,8 GB en safetensors, se trata de una pieza de infraestructura más que de un modelo de propósito general: su relevancia radica en reducir la latencia de un modelo de 816 B en producción sin alterar la distribución de salida del verificador.

La licencia es la Muse Model License (identificador `other`), heredada del modelo base, y el despliegue está pensado para vLLM con soporte de `custom_code`. La información pública disponible no detalla idiomas soportados ni datos de entrenamiento del borrador más allá de su configuración de capas y del proceso de destilación implícito en la decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificación especulativa (DFlash2), 5 capas, con estados ocultos del verificador en capas 42, 46, 50, 54 y 58 |
| Parámetros totales | 3.377.529.472 (aproximadamente 3,4 B) |
| Parámetros activos | no aplica (no es MoE; el verificador asociado es MoE con 42 B activos) |
| Longitud de contexto | 1.048.576 tokens (configuración de evaluación del verificador) |
| Tipos de cuantización | BF16 para el borrador; el verificador opera en NVFP4 con caché KV FP8 E4M3 |
| Idiomas soportados | no disponible |
| Licencia | muse-model-license (identificador `other`) |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El borrador sigue el esquema DFlash2: cinco capas transformer que toman como entrada los estados ocultos intermedios del verificador en las capas 42, 46, 50, 54 y 58, además de los tokens ya generados, y emiten hasta siete propuestas de token por paso. La verificación se realiza con muestreo de rechazo por bloques (*block rejection sampling*) y muestreo probabilístico del borrador, con verificación adaptativa opcional (`enable_adaptive_verification`). El verificador es un MoE de 816 B totales y 42 B activos, servido con paralelismo de tensores 4 y paralelismo de expertos, en NVFP4, con cómputo en BF16 y caché KV en FP8 E4M3.

No se dispone de información pública sobre el volumen de tokens de entrenamiento del borrador, la composición del dataset ni si se empleó RLHF o DPO. La innovación técnica principal es el acoplamiento a estados ocultos de capas intermedias del verificador, que permite al borrador anticipar la distribución del modelo grande con solo 3,4 B de parámetros y siete tokens propuestos por paso, lo que en la práctica multiplica la longitud de aceptación por encima de 4 tokens por paso en benchmarks de código y matemáticas.

## Capacidades

- Generación de tokens borrador para decodificación especulativa sobre el verificador Muse-Spark-Open-816B-A42B-NVFP4; no genera texto de forma autónoma.
- Propuesta de hasta siete tokens por paso de verificación con muestreo probabilístico y rechazo por bloques.
- Soporte de verificación adaptativa (`enable_adaptive_verification`) para ajustar el número de tokens propuestos según la carga.
- Integración nativa con vLLM mediante `--speculative-config` y el método `dflash`.
- Compatible con el parser de razonamiento (`muse`) y el parser de tool calling (`muse`) del verificador, por lo que hereda las capacidades de agentes y function calling del modelo base.
- Métricas por petición de decodificación especulativa (`--per-request-spec-decode-metrics summary`) para monitorizar aceptación en producción.
- No se documentan capacidades multilingües, de visión ni de audio propias del borrador.

## Casos de uso

- Servicio de inferencia de un MoE de 816 B con latencia reducida: el borrador se despliega junto al verificador en vLLM y eleva la longitud de aceptación agrupada a 4,215 tokens por paso, lo que reduce el número de pasos de verificación necesarios para generar la misma salida.
- Generación de código en producción: en HumanEval y MBPP la longitud de aceptación alcanza 4,477 y 4,474 respectivamente, por lo que pipelines de autocompletado y generación de tests sobre el verificador se benefician de un mayor throughput efectivo.
- Razonamiento matemático por lotes: en GSM8K y MATH-500 la aceptación llega a 4,558 y 4,613, adecuado para procesos batch de resolución de problemas donde el coste por token generado es crítico.
- Recuperación aumentada con contexto largo: en MRCR con 8 agujas la longitud de aceptación es 5,476 y la posición 1 acepta el 91,10 %, lo que hace viable servir ventanas de hasta 1.048.576 tokens con decodificación especulativa.
- Asistentes conversacionales multi-turno: en MT-Bench la aceptación es 3,744, suficiente para reducir la latencia percibida en diálogos con hasta 64 secuencias concurrentes y 16.384 tokens por lote.
- Evaluación comparativa de configuraciones de serving: las métricas por posición (1 a 7) permiten calibrar el número óptimo de tokens especulativos y decidir si activar la verificación adaptativa según el perfil de carga (concurrencias de 1 a 32).
- Investigación en decodificación especulativa: el modelo sirve como referencia reproducible para estudiar el efecto de los estados ocultos de capas intermedias en la tasa de aceptación por categoría (código, matemáticas, humanidades, escritura, multilingüe).

## Benchmarks y rendimiento

Los datos publicados miden aceptación de decodificación especulativa, no precisión del modelo. Configuración: 4 GPU NVIDIA B200 (4 GPU B300 para MRCR extendido), verificación adaptativa desactivada, 7 tokens propuestos, temperatura 1,0, top-p 0,95, top-k 64, esfuerzo de razonamiento `xhigh`, 4.096 tokens de salida máximo.

| Benchmark | Prompts | Longitud de aceptación | Posición 1 | Posición 4 | Posición 7 |
|---|---:|---:|---:|---:|---:|
| GSM8K | 1.319 | 4,558 | 83,51 % | 47,58 % | 26,30 % |
| HumanEval | 164 | 4,477 | 82,78 % | 45,91 % | 26,08 % |
| MBPP | 500 | 4,474 | 82,84 % | 45,97 % | 25,70 % |
| MATH-500 | 500 | 4,613 | 83,78 % | 48,55 % | 27,17 % |
| MT-Bench | 80 | 3,744 | 77,72 % | 33,48 % | 15,01 % |
| SPEED-Bench qualitative | 880 | 3,762 | 77,68 % | 34,01 % | 14,93 % |
| MRCR, 8 needles | 100 | 5,476 | 91,10 % | 61,94 % | 41,39 % |
| Agrupado | 3.543 | 4,215 | 81,02 % | 41,65 % | 21,63 % |

Desglose de SPEED-Bench qualitative por categoría (80 prompts por categoría, 4.096 tokens máximos):

| Categoría | Longitud de aceptación | Posición 1 | Posición 7 |
|---|---:|---:|---:|
| Coding | 4,273 | 81,62 % | 22,69 % |
| RAG | 4,272 | 81,43 % | 22,83 % |
| Multilingual | 4,342 | 80,99 % | 24,22 % |
| Summarization | 4,199 | 82,36 % | 19,06 % |
| Math | 4,051 | 80,56 % | 18,04 % |
| Reasoning | 3,974 | 80,03 % | 17,14 % |
| STEM | 3,711 | 77,55 % | 13,71 % |
| QA | 3,584 | 75,97 % | 12,49 % |
| Humanities | 3,422 | 74,40 % | 10,55 % |
| Writing | 3,265 | 73,53 % | 9,24 % |

No se han publicado resultados de precisión (MMLU, HumanEval pass@1, GSM8K exact match) del verificador en la información disponible, ni curvas de speedup numéricas más allá de la descripción de la metodología (concurrencias 1, 4, 8, 16 y 32; verificación adaptativa on/off frente a base no especulativa).

## Requisitos de hardware

- El borrador en sí ocupa 6,8 GB en BF16, pero no es utilizable de forma aislada: requiere el verificador Muse-Spark-Open-816B-A42B-NVFP4 en NVFP4.
- Configuración de referencia de la evaluación: 4 GPU NVIDIA B200 con paralelismo de tensores 4 y paralelismo de expertos; 4 GPU NVIDIA B300 para el conjunto extendido de MRCR.
- No se documenta el uso de VRAM total del verificador; por el tamaño del modelo (816 B en NVFP4) se requiere un nodo multi-GPU de clase数据中心; no cabe en GPU de consumo.
- Caché KV en FP8 E4M3, `--gpu-memory-utilization 1.0`, `--max-model-len 1048576`, `--max-num-seqs 64` y `--max-num-batched-tokens 16384` en la configuración medida.
- Despliegue mediante vLLM con `--trust-remote-code`, `--enable-auto-tool-choice`, `--tool-call-parser muse` y `--reasoning-parser muse`; se requiere `VLLM_ENABLE_CUDA_COMPATIBILITY=0` y `GLOO_SOCKET_IFNAME=lo` en el entorno de evaluación.
- No se publican cifras de latencia ni throughput absolutos (tokens/s); solo métricas de aceptación de la especulación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| RedHatAI/Muse-Spark-Open-816B-A42B-speculator.dflash2 | 3,4 B (borrador) | 1.048.576 (verificador) | Borrador DFlash2 para verificador MoE de 816 B | muse-model-license | Hugging Face, vLLM |
| meta-models/Muse-Spark-Open-816B-A42B-NVFP4 | 816 B totales / 42 B activos | 1.048.576 | Verificador MoE objetivo | muse-model-license | Hugging Face |
| Otros borradores de decodificación especulativa para modelos de clase 800 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre borradores alternativos comparables (por ejemplo, de otros equipos o con métodos distintos de DFlash2) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el verificador Muse-Spark-Open-816B-A42B-NVFP4 no produce salidas útiles.
- Las métricas publicadas miden aceptación de la especulación, no precisión ni calidad de las respuestas; no deben interpretarse como rendimiento del modelo base.
- La tasa de aceptación cae con la posición: en el conjunto agrupado, la posición 7 solo se acepta el 21,63 % de las veces, por lo que proponer siete tokens no siempre compensa el coste de verificación.
- El rendimiento depende fuertemente de la carga: concurrencias altas y verificación adaptativa alteran la longitud de aceptación; los datos de referencia usan concurrencia 64 (4 en MRCR).
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática del borrador; estos riesgos son los del verificador y deben evaluarse por separado.
- La licencia muse-model-license incluye una política de uso (`usage policy`) que puede restringir el uso comercial; es necesario revisar `LICENSE.md` antes de desplegar en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.
- Requiere `custom_code` y `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio y revisar su procedencia en entornos sensibles.
- La configuración de evaluación desactiva el prefix caching y fija `--gpu-memory-utilization 1.0`, lo que deja poco margen para otros procesos en las GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Muse-Spark-Open-816B-A42B-speculator.dflash2
- Modelo base (verificador): https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B-NVFP4
- Organización Inferact: https://huggingface.co/Inferact
- Repositorio Speculators: https://github.com/vllm-project/speculators
- Licencia Muse Model License: https://huggingface.co/RedHatAI/Muse-Spark-Open-816B-A42B-speculator.dflash2/blob/main/LICENSE.md
