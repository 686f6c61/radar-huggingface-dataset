# enver/rootformer-v17.12-muhaqqiq-musaddiq

## Resumen

Rootformer-27B Stage 17.12, publicado con el sobrenombre `Al-Muḥaqqiq al-Muṣaddiq` (المُحَقِّقُ المُصَدِّق), es un ajuste fino del modelo base Qwen/Qwen3.5-27B orientado a la traducción de árabe clásico (al-Turāth) y árabe estándar moderno (MSA) hacia inglés. Lo desarrolla el usuario `enver` y se distribuye bajo licencia Apache 2.0. El modelo parte de una arquitectura transformer densa de 26.896 millones de parámetros (26,9B) y se publica como un conjunto de 12 shards `bfloat16` fusionados permanentemente, listos para servir con vLLM en FP8.

La propuesta diferencial no es solo la traducción: el autor integra en el propio modelo un mecanismo de citación coránica con anclaje a la fuente (evita inventar referencias `[Q. Sura S:A]`) y una capa léxica contextual inspirada en Sībawayh y Khalīl con 143.110 formas clásicas. Además, el release incluye un runtime de pre-generación sin GPU para el texto coránico y para el aparato de vocalización (Lisān/Ḍabṭ).

Es relevante ahora porque cubre un nicho poco atendido por los modelos generalistas: la traducción fiable de corpus islámicos y turāth con control explícito de alucinación en citas, y porque ofrece cifras de rendimiento y evaluación reproducibles sobre FLORES-200, NTREX-128 y un conjunto propio de 200 capítulos clásicos no vistos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-27B) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 12.288 tokens en la configuración de servicio vLLM indicada (`--max-model-len 12288`); el contexto nativo del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | FP8 (soportado de forma nativa en vLLM); los pesos se publican en `bfloat16` |
| Idiomas soportados | Árabe (clásico y estándar moderno) e inglés (`ar`, `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`bfloat16`, 12 shards, 50,10 GB); repo total de 54,2 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso Qwen/Qwen3.5-27B. El release Stage 17.12 se construye mediante una fusión en el espacio de pesos (*weight-space basin souping*) al 50 % entre los checkpoints Stage 17.11 y Stage 17.10, lo que da lugar a un único conjunto de 12 shards `bfloat16` fusionados de forma permanente y sin conflictos de `quantization_config`. Sobre esa base se incorporan dos componentes propios: una capa léxica contextual de nivel 0 inspirada en Sībawayh-Khalīl (Lexicon V2, con 143.110 formas clásicas) y un mecanismo de citación coránica anclado a la fuente que se ejecuta durante la generación.

El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Sí documenta el pipeline de evaluación, con conjuntos congelados de capítulos clásicos no vistos, pruebas de integridad (bucles, truncamientos, cadenas espurias tipo "I say:") y un benchmark propio, TurāthBench, con seguimiento público en un leaderboard. La innovación técnica destacable es la combinación de decodificación con citación canónica en la primera pasada (Pass-1) y un runtime de pre-generación para el texto coránico y la vocalización, que evita reparaciones posteriores (*zero post-hoc repair*).

## Capacidades

- Traducción árabe → inglés, tanto de árabe estándar moderno como de árabe clásico (turāth) en seis géneros: kalām y falsafah, uṣūl al-fiqh y manṭiq, adab y balāghah, ḥadīth y rijāl, fiqh, y tafsīr y léxico.
- Citación coránica anclada a la fuente: emite referencias canónicas `[Q. Sura S:A]` en la primera pasada y se abstiene de inventar números de versículo cuando la fuente árabe no los contiene (modo *zero-hint*).
- Pre-generación de texto coránico (`Muṣḥaf`) y del aparato de vocalización (Lisān/Ḍabṭ) mediante un runtime incluido que no requiere GPU.
- Capa léxica contextual para formas clásicas poco frecuentes (Lexicon V2, 143.110 formas).
- Servicio compatible con la API de OpenAI a través de vLLM, con soporte de FP8 y `--language-model-only`.
- Traducción por lotes de alta concurrencia (`--max-num-seqs 128`).
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de corpus de turāth para investigación: digitalización y traducción de capítulos de fiqh, ḥadīth o kalām con un chrF++ medio de 62,590 sobre 200 capítulos no vistos, adecuado para pre-traducción revisable por especialistas.
- Edición académica con citas verificables: al emitir referencias `[Q. Sura S:A]` ancladas y abstenerse cuando no hay fuente, reduce el trabajo de verificación de citas coránicas en publicaciones y tesis.
- Servicio de traducción MSA a escala: con 1.605,3 tok/s en FLORES-200 sobre una H100 en FP8, encaja en pipelines de traducción masiva de documentos administrativos o periodísticos árabe → inglés.
- Atención al cliente o soporte bilingüe especializado: despliegue con vLLM y API compatible con OpenAI para consultas religiosas o académicas en árabe que requieran respuesta en inglés con referencias controladas.
- Enriquecimiento de bases de datos y motores de búsqueda: generación de traducciones inglesas alineadas para índices de bibliotecas islámicas, con la capa léxica contextual resolviendo terminología clásica.
- Evaluación comparativa de traducción: uso del benchmark público TurāthBench y del leaderboard del autor para medir sistemas alternativos en el mismo dominio.
- Preprocesamiento para modelos downstream: traducción y normalización de pasajes coránicos con el runtime de pre-generación antes de alimentar sistemas de análisis textual.

## Benchmarks y rendimiento

Datos publicados por el autor, servidos con vLLM 0.34.0 en FP8 sobre 1× NVIDIA H100 80GB.

| Benchmark | Modo | Frases | BLEU | chrF++ | Throughput |
|---|---|---:|---:|---:|---:|
| FLORES-200 devtest (arb → eng) | BPE simple | 1.012 | 39,562 | 63,453 | 1.605,3 tok/s |
| FLORES-200 devtest (arb → eng) | Capa 0 contextual sin BPE | 1.012 | 39,178 | 63,210 | 1.469,4 tok/s |
| NTREX-128 (arb → eng) | BPE simple | 1.997 | 33,803 | 59,594 | 1.527,4 tok/s |
| NTREX-128 (arb → eng) | Capa 0 contextual sin BPE | 1.997 | 33,328 | 59,265 | 1.517,6 tok/s |

| Suite de evaluación clásica | Stage 17.12 |
|---|---:|
| Track 1 v1.0 (36 zero-hint) | 34/36 (94,4 %) |
| Track 1 v1.1 (56 zero-hint) | 48/56 (85,7 %) |
| Producción con anclaje (Lisān/Ḍabṭ) | 55/56 (98,2 %) |
| Conjunto retenido 8 cap. / 6 géneros (chrF++ / BLEU) | 63,255 / 40,33 |
| 8 capítulos ciegos de Rāzī (vs Ref / vs Frontier) | 61,631 / 61,085 |
| 200 capítulos congelados no vistos (chrF++ / BLEU) | 62,590 / 39,276 |
| Integridad (bucles / truncamientos / "I say:" / tok/s) | 0 / 1 / 0 / 2.420,4 |
| 50 pasajes no vistos, citas zero-hint | 41/50 (82,0 %), 16 errores |
| 50 pasajes no vistos, pre-generación Muṣḥaf | 67/80 (83,8 %), 0 errores |

| Género clásico | Capítulos | chrF++ | BLEU |
|---|---:|---:|---:|
| Kalām y falsafah | 40 | 66,490 | 43,707 |
| Uṣūl al-fiqh y manṭiq | 30 | 65,559 | 41,675 |
| Adab y balāghah | 25 | 63,097 | 40,354 |
| Ḥadīth y rijāl | 40 | 62,357 | 39,849 |
| Fiqh | 40 | 61,931 | 38,115 |
| Tafsīr y léxico | 25 | 55,337 | 31,789 |

## Requisitos de hardware

- VRAM estimada: el repo pesa 54,2 GB en `bfloat16`; el servicio FP8 indicado por el autor requiere una GPU de 48 GB o más.
- GPU recomendadas: 1× NVIDIA H100 80GB para las cifras publicadas (2.420,4 tok/s en la suite de 200 capítulos); válido también en GPUs de 48 GB o superiores en FP8.
- GPU de consumo: no se documenta en la información disponible el comportamiento en GPUs consumer; los 26,9B parámetros en FP8 no caben en tarjetas de 24 GB sin cuantización adicional, que el autor no detalla.
- Despliegue: vLLM (`vllm serve` con `--quantization fp8`, `--dtype bfloat16`, `--language-model-only`, `--max-model-len 12288`, `--max-num-seqs 128`, `--gpu-memory-utilization 0.90`, `--trust-remote-code`); runtime Python propio `rootformer_runtime.serve_rootformer_vllm.RootformerVllmTranslator` para traducción con citas canónicas y anclaje Lisān/Ḍabṭ.
- Latencia y throughput: entre 1.469,4 y 1.605,3 tok/s en FLORES-200 y 2.420,4 tok/s en la suite clásica de 200 capítulos, sobre 1× H100 80GB en FP8.
- Variable de entorno recomendada: `VLLM_USE_FLASHINFER_SAMPLER=0`.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de modelos comparables sobre los mismos conjuntos (TurāthBench, capítulos clásicos congelados). La siguiente tabla recoge solo los datos verificables de cada modelo.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Rootformer-27B Stage 17.12 | 26,9B denso | 12.288 tokens en servicio vLLM | Apache 2.0 | Traducción ar → en clásico y MSA con citación coránica anclada |
| Qwen/Qwen3.5-27B (base) | 27B aprox. | No disponible | No disponible en la información proporcionada | Modelo generalista multilingüe |
| Modelos de traducción MSA genéricos | No disponible | No disponible | No disponible | Traducción estándar sin anclaje de citas ni capa léxica clásica |

## Limitaciones y advertencias

- Nicho restringido: solo traduce árabe → inglés; no se documentan otras direcciones ni otros pares de idiomas.
- Riesgo de alucinación en citas: en modo zero-hint puro, el 18 % de los pasajes (9/50) presentaron citas incorrectas; el modo de pre-generación Muṣḥaf reduce los errores a cero, pero solo cubre 67/80 versos embebidos.
- Rendimiento desigual por género: tafsīr y léxico obtienen chrF++ 55,337 frente a 66,490 en kalām y falsafah; la traducción de material lexicográfico exige revisión humana.
- Un truncamiento detectado en el conjunto de 200 capítulos (género adab y balāghah), lo que indica posibles salidas cortadas en pasajes largos.
- Sin datos publicados sobre sesgos demográficos, sociales o teológicos; el dominio religioso exige validación por especialistas antes de uso público.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no debe asumirse un uso generalista.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni se documenta un proceso de revisión editorial del contenido traducido.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente de los resultados.
- Los benchmarks son autoinformados por el autor; no se han replicado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enver/rootformer-v17.12-muhaqqiq-musaddiq
- Leaderboard TurāthBench: https://huggingface.co/spaces/enver/turath-bench-leaderboard
- Dataset de benchmark: https://huggingface.co/datasets/enver/turath-bench-classical-arabic-en
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
