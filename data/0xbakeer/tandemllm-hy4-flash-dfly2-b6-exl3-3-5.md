# 0xBakeer/TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.5

## Resumen

TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.5 es un drafter de decodificación especulativa cuantizado en EXL3, publicado por el usuario 0xBakeer. No es un modelo generativo autónomo: es un modelo auxiliar (draft model) de 731 millones de parámetros que propone tokens candidatos para acelerar la inferencia de tencent/Hy4-flash, un modelo objetivo de mayor tamaño. Concretamente, cuantiza el checkpoint AngelSlim/Hy4-flash-DFly2-B6, un drafter de tamaño de bloque 6, a 3,5 bits en sus proyecciones de expertos.

La relevancia de esta ficha es práctica: la decodificación especulativa permite reducir la latencia de generación cuando el modelo objetivo verifica cada token propuesto, de modo que la cuantización del drafter afecta a la longitud de aceptación y al throughput, no a la distribución de salida verificada. Este pack incluye además dos cabezas de salida (lm_head) independientes cuantizadas a 3 y 4 bits, extraídas del lm_head de tencent/Hy4-flash.

El modelo se sirve exclusivamente con TandemEngine (versión 0.17.2 o posterior), ya que la versión estándar de exllamav3 no carga la arquitectura HY4DFlyDraftModel. El autor reporta mediciones de velocidad en una única NVIDIA DGX Spark (GB10) con 128 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HY4DFlyDraftModel: 3 capas MoE de draft (128 expertos enrutados por capa, 3 activos por token más 1 experto compartido), con KV sharing y sparse-index sharing con las capas DSA 33, 37 y 41 del modelo objetivo |
| Parámetros totales | 731.054.112 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el servicio se ejecuta con --max-len 262144) |
| Tipos de cuantización | EXL3 (codebook mul1): expertos enrutados a 3,5 bits (56 palabras por tile 16×16); atención, experto compartido, mtp_fusion y correcciones hidden/attentive a 5 bits; normas, router gates y tensores auxiliares sin cuantizar. Cabezas de salida EXL3 a 3 bits y 4 bits |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | safetensors (model.safetensors 1,46 GB; cabezas de salida en safetensors separados de 139,4 MB y 185,8 MB) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa de tamaño de bloque 6: genera 1 token ancla más 5 tokens de draft por paso, sin caché KV propia. Consta de 3 capas MoE de draft con 128 expertos enrutados cada una, de los cuales 3 se activan por token, más un experto compartido. Se acopla al modelo objetivo mediante KV sharing y sparse-index sharing con las capas DSA 33, 37 y 41 de tencent/Hy4-flash.

La cuantización se realizó con calibración de Hessiano sobre el checkpoint BF16 AngelSlim/Hy4-flash-DFly2-B6 (revisión 0124b559) y se verificó contra dicho checkpoint sin cuantizar sobre 8 sondas y 40 posiciones de draft. En el pack de 3,5 bits, el error proxy medio de los expertos es 0,000897 (máximo 0,007064), la similitud coseno media de estados ocultos es 0,9942 (mínimo 0,9860) y la coincidencia top-1 es del 97,5 % (39/40) con la cabeza completa y del 82,5 % (33/40) con la cabeza K3. Las 38 proyecciones densas, de atención, experto compartido y corrección presentan un error proxy medio de 0,000168. No se dispone de información sobre datos de entrenamiento, número de tokens ni uso de RLHF/DPO.

## Capacidades

- Generación de tokens de draft para decodificación especulativa sobre tencent/Hy4-flash; no está pensado para generar texto de forma autónoma.
- Propuesta de 5 tokens por paso con tamaño de bloque 6 (1 token ancla más 5 de draft).
- Acoplamiento al modelo objetivo mediante KV sharing y sparse-index sharing con las capas 33, 37 y 41.
- Dos cabezas de salida alternativas: EXL3 3 bits (K3, por defecto en TandemEngine hy4-3.56) y EXL3 4 bits (K4).
- Verificación de cada token por parte del modelo objetivo, de modo que la cuantización del drafter no altera la distribución de salida verificada.
- Sin soporte documentado de tool calling, agentes, visión, audio ni modo thinking propio; estas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción con tencent/Hy4-flash: el drafter propone tokens que el modelo objetivo verifica, reduciendo la latencia de decodificación. El autor reporta 43,33 tok/s end-to-end en una DGX Spark con 3,37 tokens aceptados por ronda.
- Servicio de completaciones de texto de baja latencia: integrado en TandemEngine sobre /v1/completions, con TTFT de 3,76 s y prefill de 940,5 tok/s en una prompt de 3.538 tokens.
- Despliegue en hardware de un solo nodo: cabe junto al modelo objetivo cuantizado en una DGX Spark (GB10) de 128 GB, lo que permite servir el par sin clúster multi-GPU.
- Escalado por concurrencia: con 8 peticiones concurrentes de 256 tokens se alcanzan 76,72 tok/s agregados (85,1 tok/s en régimen estable), adecuado para cargas de varios usuarios sobre un único nodo.
- Evaluación de cuantizaciones alternativas: los informes quality/quant_report.json y quality/verify_report.json permiten comparar el pack de 3,5 bits con el de 3,0 bits antes de fijar una configuración en producción.
- Reproducibilidad y auditoría de despliegues: el repositorio incluye SHA256SUMS para los pesos y config.json, lo que facilita verificar la integridad de los artefactos en pipelines de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica métricas de verificación de cuantización y de velocidad:

| Métrica | EXL3 3.5 (este pack) | EXL3 3.0 |
|---|---|---|
| Bits de expertos | 3,5 | 3,0 |
| model.safetensors | 1,46 GB | 1,30 GB |
| Error proxy medio de expertos | 0,000897 | 0,001806 |
| Error proxy máximo de expertos | 0,007064 | 0,013907 |
| Coseno de estados ocultos, media (mín.) | 0,9942 (0,9860) | 0,9932 (0,9846) |
| Coincidencia top-1, cabeza completa | 97,5 % (39/40) | 70,0 % (28/40) |
| Coincidencia top-1, cabeza K3 | 82,5 % (33/40) | no disponible |

Rendimiento en una NVIDIA DGX Spark (GB10, 128 GB) con TandemEngine v0.17.2, modelo objetivo Hy4-flash EXL3 3.5 y cabeza K3:

| Carga | Decodificación end-to-end | Decodificación estable | Notas |
|---|---|---|---|
| c1, 3.538 → 600 greedy | 43,33 tok/s | no disponible | 3,37 aceptados/ronda, TTFT 3,76 s, prefill 940,5 tok/s |
| c2, 256 tok/petición | 47,75 tok/s | 51,6 tok/s | 2 peticiones concurrentes, throughput agregado |
| c4, 256 tok/petición | 60,86 tok/s | 65,9 tok/s | 4 peticiones concurrentes, throughput agregado |
| c8, 256 tok/petición | 76,72 tok/s | 85,1 tok/s | 8 peticiones concurrentes, throughput agregado |

## Requisitos de hardware

- VRAM estimada: 1,46 GB para model.safetensors más 139,4 MB (cabeza K3) o 185,8 MB (cabeza K4); 1,79 GB en total con la cabeza K3. Debe sumarse la memoria del modelo objetivo tencent/Hy4-flash cuantizado.
- GPU recomendadas: NVIDIA DGX Spark (GB10, 128 GB) es el hardware de referencia medido por el autor. No se han publicado mediciones en A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos publicados sobre su funcionamiento en GPU de consumo; el requisito de memoria del par drafter más objetivo no está documentado para esos casos.
- Opciones de despliegue: exclusivamente TandemEngine 0.17.2 o posterior. La versión estándar de exllamav3 no carga HY4DFlyDraftModel. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 43,33 tok/s end-to-end en decodificación greedy con una petición (3.538 tokens de entrada, 600 de salida); 85,1 tok/s agregados en régimen estable con 8 peticiones concurrentes de 256 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Tamaño en disco | Coincidencia top-1 (cabeza completa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.5 (este) | 731.054.112 | EXL3 3,5 bits expertos / 5 bits densas | 1,46 GB | 97,5 % | tencent-hy-license | Hugging Face |
| TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.0 | no disponible | EXL3 3,0 bits expertos / 5 bits densas | 1,30 GB | 70,0 % | tencent-hy-license | Hugging Face |
| AngelSlim/Hy4-flash-DFly2-B6 (BF16) | no disponible | BF16 | 6,24 GB | referencia | no disponible | Hugging Face |

No se dispone de información sobre otros drafters comparables de la misma categoría.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere tencent/Hy4-flash como modelo objetivo y no produce salidas válidas por sí solo.
- Solo se sirve con TandemEngine 0.17.2 o posterior; exllamav3 estándar no carga la arquitectura.
- Las mediciones de rendimiento proceden de un único hardware (DGX Spark GB10, 128 GB) y una única versión de motor; no deben extrapolarse sin validación.
- La cuantización a 3,5 bits reduce la coincidencia top-1 al 82,5 % con la cabeza K3, lo que afecta a la longitud de aceptación y al throughput, no a la salida verificada.
- La licencia tencent-hy-license impone restricciones que deben revisarse antes de cualquier uso comercial; el autor la marca como "other".
- No se han publicado datos sobre sesgos, riesgo de alucinación ni cobertura idiomática del drafter; estas propiedades dependen del modelo objetivo.
- No hay información sobre el proceso de entrenamiento del drafter base (datos, tokens, RLHF/DPO), lo que limita la evaluación independiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.5
- Modelo base cuantizado: https://huggingface.co/AngelSlim/Hy4-flash-DFly2-B6
- Modelo objetivo: https://huggingface.co/tencent/Hy4-flash
- Pack EXL3 3.0 alternativo: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.0
- Modelo objetivo cuantizado EXL3 3.5: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-EXL3-3.5
- Modelo objetivo cuantizado EXL3 3.0: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-EXL3-3.0
- Colección Hy4-flash: EXL3 for TandemLLM: https://huggingface.co/collections/0xBakeer/hy4-flash-exl3-for-tandemllm-6b033035038e355b04930cb5
- Motor de inferencia TandemEngine: https://github.com/TandemLLM/TandemEngine
