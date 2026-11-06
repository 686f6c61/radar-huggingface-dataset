# bakon3/DeepSeek-V4.1-Flash-1017-uncensored-rad

## Resumen

DeepSeek-V4.1-Flash-1017-uncensored-rad es un contenedor de inferencia en formato `.rad` que empaqueta el modelo DeepSeek-V4.1-Flash-1017 de DeepSeek (763.000 millones de parámetros) cuantizado y modificado para ejecutarse en el motor de inferencia radiance sobre GPUs AMD RDNA4 con ROCm. Su autor es el usuario bakon3 de Hugging Face, y el repo no ha registrado descargas todavía, lo que indica que es un artefacto muy nicho, publicado recientemente (octubre de 2026).

El modelo base es un LLM de texto de gran escala con expertos enrutados (MoE), pesos oficiales en fp8 para las partes densas y fp4 para los expertos, licencia MIT. Esta variante añade dos transformaciones: una cuantización mixta muy agresiva (mezcla UD-IQ1_S de Unsloth, con expertos en iq1_s/iq2_xxs, ~2 bits por peso en los expertos) y una abliteración parcial que elimina la dirección de rechazo en las proyecciones de salida de atención de las capas 11–28 (18 de las 36 capas, al 75 % de la fuerza del método de huihui).

Su relevancia es doble: por un lado, demuestra que un modelo de 763B puede servirse en un contenedor de 251 GiB sobre cuatro GPUs de consumidor/profesional de 32 GB (R9700) con streaming de expertos desde host y disco; por otro, ofrece una versión sin filtros de rechazo, lo que exige extremar las precauciones de uso responsable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (DeepSeek-V4.1-Flash) con capas Engram y decodificación especulativa (drafter DSpark MTP) |
| Parametros totales | 763B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 409.600 tokens en la configuración de servicio probada |
| Tipos de cuantizacion | Mixta por tensor: iq1_s, iq2_xxs (expertos enrutados), q6_K, q5_K, q8_0 (atención, expertos compartidos, embeddings, salida), iq4_nl (tabla Engram), MXFP4 fp4_e2m1+e8m0 (expertos del drafter), f32/bf16 (normas, router) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Contenedor `.rad` (radiance), 251,07 GiB en seis partes; el base oficial usa fp8 (densas) y fp4 (expertos) en safetensors |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer con mezcla de expertos: 36 capas de atención con expertos enrutados (15.360 tensores de expertos gate_up y otros tantos down), 80 tensores de expertos compartidos y dos capas "Engram" con una tabla de embeddings por capa de 103 GiB que el release oficial no incluía y que este contenedor reconstruye a partir del tokenizador mediante el script `data/engram_tables.py`. Incluye además una cabeza de decodificación especulativa multi-token (DSpark, `mtp.*`) con sus expertos en MXFP4 tal como se publicaron, de 6,72 GiB.

No hay información sobre datos de entrenamiento, número de tokens ni alineación (RLHF/DPO) del modelo base en la información disponible. Sobre el modelo base, este contenedor aplica dos modificaciones: la cuantización mixta per-tensor siguiendo la receta `deepseek41-ud-iq1s` con la imatrix UD-IQ1_S de Unsloth (expertos enrutados a ~2,07–2,22 bits/weight, atención en q6_K/q5_K, normas en f32), y la abliteración, que reconstruye `attn_output_b` de las capas 11–28 como `W + alpha * (W_huihui - W)` con alpha 0,75 y re-cuantiza a q6_K, sin tocar q/k/v, el MLP ni las tablas Engram.

## Capacidades

- Generación de texto (pipeline text-generation), servida vía API compatible con OpenAI (`/v1/chat/completions`, `/v1/models`).
- Decodificación especulativa con el drafter DSpark MTP (hasta 5 tokens especulativos) y especulación por n-gramas (n=5), que según las mediciones del autor eleva el throughput a ~50 tok/s en ensayo y ~53 tok/s en código.
- Contexto muy largo: hasta 409.600 tokens configurados en la instalación de referencia.
- Versión abliterada: reduce significativamente los rechazos del modelo base en las capas modificadas.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Experimentación con MoE gigantes en hardware AMD: permite cargar un modelo de 763B en cuatro GPUs de 32 GB con RDNA4, algo inviable con pesos fp8 oficiales.
- Investigación en abliteración: el README documenta con precisión qué capas se modifican, con qué alpha y qué tensores quedan intactos, útil para estudios sobre direcciones de rechazo.
- Pruebas de decodificación especulativa: integra drafter MTP (DSpark) y especulación n-gram con colocación en disco, adecuado para medir el impacto de estas técnicas en throughput.
- Generación de texto largo offline: con 409.600 tokens de contexto y ~50 tok/s medidos, sirve para redacción de documentos extensos en entornos de laboratorio.
- Benchmarking de kernels ROCm/TP4: el contenedor está orientado a validación de kernels tensor-parallel de 4 rangos sobre gfx1201, con cero reinicios de GPU reportados en las pruebas.
- Servidor local con API OpenAI: el binario radiance expone `/v1/chat/completions`, lo que permite integrarlo con clientes y frameworks que hablen ese protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas mediciones son de rendimiento de inferencia del propio autor en su banco 4×R9700:

| Métrica | Valor |
|---|---|
| Throughput (ensayo, greedy, n-gram 5) | 50,1 tok/s |
| Throughput (código, greedy, n-gram 5) | 53,4 tok/s |
| Time to first token (prompt de 16k tokens) | 4,7 s |
| Reinicios de GPU | 0 |
| Longitud de contexto usada en la prueba | 409.600 tokens |

## Requisitos de hardware

- VRAM: cuatro GPUs de 32 GB (AMD R9700, gfx1201 / RDNA4) con paralelismo tensorial TP4; el contenedor pesa 251 GiB, por lo que los expertos se reparten entre VRAM, un pool de host fijado en memoria (~4 GiB por rango) y disco.
- Disco: se recomienda NVMe para la tabla Engram de 103 GiB (colocada en el tier de disco con `--ngram-placement disk`) y para el streaming de expertos fríos; descarga de 251,07 GiB en seis partes que deben reensamblarse con `cat`.
- GPU recomendadas: R9700 (gfx1201) según el autor; no hay datos para NVIDIA ni para otras tarjetas AMD.
- Cabe en GPU de consumidor: solo en configuraciones multi-GPU de 4×32 GB compatibles con ROCm RDNA4; no en una única GPU de consumo.
- Despliegue: exclusivamente mediante el motor radiance (rama `deepseek41-wip` de `bakon/radiance` hasta que el plugin `arch/deepseek41` se fusione en `main`); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 50,1 tok/s (ensayo) y 53,4 tok/s (código) con especulación n-gram 5; TTFT de 4,7 s con prompts de 16k tokens.

## Comparativa con modelos similares

| | DeepSeek-V4.1-Flash-1017-uncensored-rad | DeepSeek-V4.1-Flash-1017 (base oficial) | Variantes abliteradas habituales (p. ej. huihui) |
|---|---|---|---|
| Parametros | 763B | 763B | no disponible |
| Formato | `.rad` (radiance), cuantización mixta ~2–8 bits | fp8 densas / fp4 expertos (safetensors) | GGUF u otros, según variante |
| Tamaño en disco | 251,07 GiB | no disponible | no disponible |
| Motor de inferencia | radiance (ROCm, RDNA4, TP4) | motores estándar (vLLM, etc.) | llama.cpp y similares |
| Abliteración | Sí, capas 11–28, alpha 0,75 | No | Sí, según variante |
| Licencia | MIT | MIT | no disponible |
| Hardware objetivo | 4×R9700 (32 GB, AMD) | Aceleradores de datacenter | variable |

## Limitaciones y advertencias

- Al tratarse de una versión abliterada, el modelo no rechazará muchas peticiones que el modelo base sí rechazaría; su uso para generar contenido dañino, ilegal o no deseado es responsabilidad exclusiva del usuario, y desplegarlo en producción orientado a usuarios finales conlleva riesgos legales y reputacionales serios.
- La cuantización a ~2 bits en los expertos enrutados (iq1_s/iq2_xxs) implica una degradación de calidad respecto a los pesos fp8/fp4 oficiales; no hay evaluaciones que cuantifiquen esa pérdida.
- El abliteration solo cubre 18 de 36 capas y no toca MLP ni tablas Engram, por lo que pueden persistir comportamientos de rechazo residuales.
- Compatibilidad muy limitada: requiere radiance con el plugin de arquitectura DeepSeek-V4.1 (rama WIP) y GPUs AMD RDNA4 con ROCm; no funciona con el ecosistema estándar (llama.cpp, vLLM, Ollama).
- Los datos de rendimiento provienen únicamente del autor, en una configuración concreta (greedy, n-gram 5, contexto 409.600) y no son independientes ni verificables.
- No hay información sobre idiomas soportados, sesgos, tasa de alucinación ni capacidades de tool calling; cualquier uso debe validar estos aspectos por cuenta propia.
- La licencia MIT del modelo base y del contenedor permite uso comercial, pero el contenido generado por una versión sin filtros sigue sujeto a la legislación aplicable.
- Requiere gestión operativa delicada: reensamblado de seis partes con verificación sha256, tabla Engram en NVMe y perfilado de expertos (`expert-stats.json`) para un rendimiento óptimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-uncensored-rad
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- Instrucciones de ejecución (RUNNING.md): https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-uncensored-rad/blob/main/RUNNING.md
