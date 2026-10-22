# RESMP-DEV/LFM2.5-2.6B-MLX-GPTQ-MXFP4

` boundary mentioned), tool calling (BFCL evaluation), multilingual limited to English, code (LiveCodeBench), math (AIME25), instruction following (IFBench, Multi-IF).

Hardware: repo 1.8 GB; MLX requires Apple Silicon. VRAM ~1.8-2 GB for weights + overhead; consumer feasible. Deployment: mlx-lm, MLX; CUDA requires dequantization to BF16 → ~5.4 GB in BF16; vLLM 0.26.0. Throughput 1,410.6 tok/s aggregate on RTX PRO 6000 Blackwell.

Comparativa: compare with base LiquidAI/LFM2.5-2.6B BF16, and maybe other small models like Qwen2.5-3B, Llama-3.2-3B — but I don't have data on those in the provided info. I could compare with base model and with "native MXFP4 RTN" variant. For other models, mark "no disponible" for benchmarks. I'll make a table with base BF16 and RTN MXFP4 (both from card) plus maybe generic. Better: table with this checkpoint vs BF16 base vs MXFP4 RTN — all data available.

Benchmarks table: include perplexity table and benchmark table with reference.

Limitations: significant degradation vs Liquid reference on AIME25 (26.67 vs 51.87 — a huge drop, ~25 points), IFBench -11.8, BFCL -13.8 (note the reference includes web_search categories excluded locally so not exact), LiveCodeBench -7.9. English only. License lfm1.0 — need to check commercial restrictions; not available in provided info, but LFM Open License v1.0 permits commercial use under conditions (revenue threshold). I should not invent — say "consultar el texto de la licencia; no se detalla en la información disponible". Hallucination risk inherent. 4-bit quantization risks. MLX-only native format; CUDA path requires dequantization (not bit-identical, no native MXFP4 throughput). Repository has 0 downloads, created recently — low community validation. Quantization done by third party RESMP-DEV, not LiquidAI — not officially supported.

Also note: the README command uses `RESMP-DEV/LFM2.5-2.6B-GPTQ-MXFP4-calibrated` which differs from the repo ID — a caveat worth mentioning.

Now write in Spanish (Spain), no emojis, only first word of headings capitalized. Headings are given as "## Resumen" etc. — follow the required structure. Note "Especificaciones tecnicas" — the required structure has no accents ("Especificaciones tecnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces"). I'll follow exactly as given (without accents as in the template). Body text with proper accents.

Let me write.

For parameter row: "Parametros activos" — not MoE, so "no aplica (modelo denso)". Total params 2.697.198.592 ≈ 2,6B (los safetensors del checkpoint cuantizado... actually 2.697B counted).

Context length: no disponible.

Let me write the sheet.

Benchmarks table:

| Benchmark | Ambito | GPTQ MXFP4 | Referencia Liquid (BF16) | Delta |
AIME25 30 problemas × 4 muestras 26.67% 51.87% -25.20 pp
IFBench 300 ejemplos 47.33% 59.17% -11.84
BFCL v4 20 categorías ejecutables, 4.906 ejemplos 43.06% 56.88% -13.82
LiveCodeBench v6 1.055 problemas 51.47% 59.41% -7.94

Deltas are computed arithmetic — fine.

Perplexity table.

Casos de uso: at least 6, concrete.

1. Asistente conversacional local en macOS (Apple Silicon) — 1,8 GB.
2. Prototipado y evaluación de cuantización: banco de pruebas para GPTQ MXFP4 vs RTN.
3. Generación de código asistida en local (LiveCodeBench 51,47%).
4. Razonamiento matemático de nivel medio — AIME25 26,67% (1 de cada 4 aprox... careful: 26.67% pass@1 style with 4 samples).
5. Pipelines de function calling / agentes con BFCL 43,06% — prototipos, no producción crítica.
6. Investigación en eficiencia de memoria: servir en Apple Silicon con MLX.
7. Filtrado/clasificación de texto en inglés con baja latencia (throughput).
8. Docencia/reproducibilidad de recetas de cuantización.

Requisitos de hardware:
- Pesos ~1,8 GB en MXFP4 (repo 1.8 GB).
- MLX: Apple Silicon (M1/M2/M3/M4), memoria unificada; cabe en 8 GB de RAM.
- CUDA: dequantizado a BF16 → ~5,4 GB (2.697B × 2 bytes ≈ 5,39 GB) + KV cache; RTX 3060 12 GB, 4090, A100, H100, RTX PRO 6000 Blackwell.
- Throughput: 1.410,6 tok/s agregados con 8 peticiones concurrentes de 64 tokens en RTX PRO 6000 Blackwell (BF16 dequantizado, vLLM 0.26.0). Latencia por petición no disponible.
- Despliegue: mlx-lm (nativo), vLLM 0.26.0 (solo tras dequantizar a BF16), llama.cpp/Ollama/TGI: no disponible (no se menciona soporte de MXFP4 MLX en esas herramientas).
- KV cache depends on context — not available.

Enlaces: HF model URL, base model URL, license link, GPTQ_RECEIPT.md (referenced file within repo). Note web search yielded no relevant results.

Now write it. Keep it rigorous.## Resumen

LFM2.5-2.6B-MLX-GPTQ-MXFP4 es una conversión cuantizada a 4 bits del modelo LiquidAI/LFM2.5-2.6B, publicada por el usuario RESMP-DEV. No se trata de un repack round-to-nearest: las 166 capas lineales cuantizadas se resolvieron de forma secuencial con GPTQ usando Hessianos de activación y búsqueda nativa de escalas E8M0, manteniendo en BF16 la cabeza de salida y el embedding atado. El checkpoint resultante ocupa 1,8 GB y emplea tensores nativos block-scaled de MLX, por lo que está pensado para ejecutarse en Apple Silicon con `mlx-lm`.

El problema que resuelve es la pérdida de calidad típica de las cuantizaciones agresivas en modelos pequeños: según la model card, el control MXFP4 RTN sube la perplejidad en WikiText-2 un 14,50% respecto a BF16, mientras que esta receta GPTQ se queda en un +0,157% (48,4551 frente a 48,3791). Sin embargo, esa equivalencia en perplejidad no se traslada a todas las tareas de razonamiento: en AIME25 el checkpoint obtiene 26,67% frente al 51,87% de referencia de LiquidAI.

Es relevante ahora porque documenta con recibos de integridad (hashes de tokens de calibración, conjunto de capas y `model.safetensors`) una receta reproducible de cuantización calibrada en formato MXFP4, un caso poco habitual en el ecosistema MLX, donde la mayoría de publicaciones son conversiones RTN sin verificación. El modelo base es denso, de 2.697.198.592 parámetros, y solo declara inglés como idioma soportado. La longitud de contexto no se indica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2 (base LiquidAI/LFM2.5-2.6B); la model card menciona el "LFM2 convolution layout", sin detallar la composición exacta de capas |
| Parametros totales | 2.697.198.592 (2,6B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (valores E2M1, escalas E8M0, una escala por cada 32 pesos) en 166 capas lineales; embedding y cabeza de salida atados conservados en BF16; sin sesgos empaquetados |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `lfm1.0` (identificador `other` en HuggingFace), heredada del modelo base |
| Formato de pesos | Safetensors con tensores block-scaled nativos de MLX; 1,8 GB de repositorio |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: cuantiza el transformer LFM2 de LiquidAI mediante GPTQ secuencial capa a capa. Cada una de las 166 capas lineales se resolvió con Hessianos de activación, búsqueda de escala nativa E8M0 y un mecanismo de reserva con no-regresión (`non-regression fallback`). La calibración empleó 128 ventanas disjuntas de 1.024 tokens (131.072 tokens en total), con amortiguamiento (damping) de 0,01 y semilla 17; el hash SHA-256 del conjunto de calibración y el del conjunto de capas se publican en la model card. La cabeza de salida y el embedding atado permanecen en BF16 para no degradar la distribución de logits.

La innovación principal es la reproducibilidad y la verificación de integridad: se fija la revisión del modelo base (`403f92a2c4d78f2505f874b8b1b713cc0c9b9ae8`), se comparan byte a byte los pesos y escalas empaquetados con el recibo de calibración en CUDA y se documenta el SHA-256 de `model.safetensors`. En la ruta CUDA, los tensores calibrados se dequantizaron exactamente, se restauraron al layout de convolución de LFM2, se almacenaron en BF16 y se sirvieron con vLLM 0.26.0; esto evalúa los valores calibrados con acumulación BF16, no el throughput nativo de MXFP4 empaquetado ni una acumulación idéntica a la de MLX. No se especifican en la información disponible el volumen total de tokens de preentrenamiento del modelo base, la composición del dataset ni las etapas de RLHF/DPO.

## Capacidades

- Generación de texto y conversación multi-turno en inglés (`text-generation`, `conversational`).
- Modo de razonamiento con separación explícita de la respuesta tras el límite `</think>`.
- Razonamiento matemático: evaluado en AIME25 (30 problemas, 4 muestras, temperatura 0,6, hasta 32.768 tokens de salida).
- Generación de código: evaluado en LiveCodeBench v6 sobre 1.055 problemas.
- Seguimiento de instrucciones: evaluado en IFBench (300 ejemplos) y en curso en Multi-IF.
- Tool calling / function calling: cubierto por BFCL v4 en 20 categorías ejecutables localmente (4.906 ejemplos puntuados).
- Inferencia local en Apple Silicon mediante MLX con tensores block-scaled nativos.
- No se declaran capacidades de visión, audio ni otros idiomas distintos del inglés.

## Casos de uso

- Asistente conversacional local en macOS: con 1,8 GB de pesos, el modelo cabe en equipos Apple Silicon de 8 GB de memoria unificada y se sirve con `mlx-lm` sin conexión, lo que lo hace adecuado para asistentes de escritorio con requisitos de privacidad.
- Evaluación comparativa de recetas de cuantización: sirve como referencia reproducible (semilla, hashes, recibo GPTQ) para medir la brecha entre GPTQ calibrado y RTN en modelos de 2-3B, replicando el experimento de WikiText-2 con 32 predicciones de 512 tokens.
- Generación de código asistida en local: con 51,47% en LiveCodeBench v6, es viable para autocompletado y explicación de fragmentos en entornos de desarrollo sin GPU dedicada, aceptando revisión humana del resultado.
- Prototipado de agentes con tool calling: el 43,06% en BFCL v4 permite validar flujos de llamada a funciones y pipelines multi-paso en fase de diseño, no en producción crítica.
- Procesamiento por lotes de texto en inglés: el ensayo de throughput reporta 1.410,6 tokens de salida por segundo agregados con ocho peticiones concurrentes de 64 tokens en una RTX PRO 6000 Blackwell, útil para clasificación, resumen o extracción por lotes.
- Investigación en eficiencia de memoria: permite estudiar el impacto de escalas E8M0 compartidas por bloque de 32 pesos en la calidad final, comparando perplejidad y benchmarks frente al BF16 de origen.
- Docencia y auditoría de cuantización: la publicación incluye recibos verificables, lo que facilita reproducir el procedimiento en un curso o en una revisión interna de proveedores de modelos.

## Benchmarks y rendimiento

Verificación de calidad en WikiText-2 (test, huella `a46124b21ac53738`, 32 predicciones de 512 tokens):

| Checkpoint | Perplejidad | Relativo a BF16 |
|---|---:|---:|
| BF16 de origen | 48,3791 | línea base |
| MXFP4 RTN nativo | 55,3957 | +14,50% |
| GPTQ MXFP4 (este) | 48,4551 | +0,157% |

Resultados completados frente a la referencia publicada por LiquidAI:

| Benchmark | Ámbito | GPTQ MXFP4 | Referencia Liquid | Diferencia |
|---|---:|---:|---:|---:|
| AIME25 | 30 problemas × 4 muestras | 26,67% | 51,87% | -25,20 pp |
| IFBench | 300 ejemplos | 47,33% | 59,17% | -11,84 pp |
| BFCL v4 | 20 categorías ejecutables; 4.906 ejemplos | 43,06% | 56,88% | -13,82 pp |
| LiveCodeBench v6 | 1.055 problemas | 51,47% | 59,41% | -7,94 pp |

Notas de metodología declaradas por el autor: AIME25 e IFBench usan el arnés Liquid OpenBench con temperatura 0,6, 32.768 tokens de salida máxima y semilla local 42 (Liquid no publicó su semilla). IFBench evalúa la respuesta visible tras `</think>`. La puntuación de BFCL es el parcial oficial del arnés fijado y excluye `web_search_base` y `web_search_no_snippet` por falta de credenciales de SerpAPI, de modo que la referencia de Liquid no es un control exacto. Multi-IF está en reevaluación y no se reporta como resultado final; IFStruct y el resto de filas del release de Liquid no están completas.

## Requisitos de hardware

- VRAM/espacio de pesos: aproximadamente 1,8 GB en MXFP4; en la ruta CUDA con dequantización a BF16, unos 5,4 GB solo de pesos (2.697.198.592 × 2 bytes), más caché KV no cuantificada.
- Apple Silicon: requisito para la ruta nativa (MLX + `mlx-lm`); cabe en equipos con 8 GB de memoria unificada y trabaja con holgura a partir de 16 GB.
- GPU consumer: la versión BF16 dequantizada cabe en tarjetas de 8-12 GB (por ejemplo, RTX 3060 12 GB o RTX 4070); no se han publicado mediciones en estas GPU.
- GPU profesionales: el ensayo de rendimiento se hizo en una RTX PRO 6000 Blackwell. A100/H100 son compatibles a través de vLLM 0.26.0 con los pesos dequantizados, sin datos de rendimiento publicados.
- Despliegue: `mlx-lm` (nativo, comando `mlx_lm.generate`) y vLLM 0.26.0 (solo tras dequantizar a BF16 y restaurar el layout de convolución LFM2). No se documenta soporte en llama.cpp, Ollama ni TGI.
- Throughput: 1.410,6 tokens de salida por segundo agregados con ocho peticiones concurrentes de 64 tokens en RTX PRO 6000 Blackwell (BF16 dequantizado). Latencia por petición y rendimiento en MLX no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| RESMP-DEV/LFM2.5-2.6B-MLX-GPTQ-MXFP4 (este) | 2,6B denso | No disponible | WikiText-2 PPL 48,4551; AIME25 26,67%; LCB v6 51,47% | `lfm1.0` | MLX nativo; CUDA vía dequantización |
| LiquidAI/LFM2.5-2.6B (BF16) | 2,6B denso | No disponible | WikiText-2 PPL 48,3791 (medido por el autor); referencias AIME25 51,87%, IFBench 59,17%, BFCL 56,88%, LCB v6 59,41% | `lfm1.0` | Pesos BF16 originales |
| Conversión MXFP4 RTN del mismo base | 2,6B denso | No disponible | WikiText-2 PPL 55,3957 (+14,50%) | `lfm1.0` | Control de referencia del autor |

No se dispone en la información proporcionada de datos verificables de otros modelos de 2-3B (por ejemplo, familias Qwen o Llama) para establecer una comparación cuantitativa; se indica "no disponible" en lugar de estimar cifras.

## Limitaciones y advertencias

- Degradación acusada frente a la referencia en tareas de razonamiento: -25,20 puntos en AIME25 y -11,84 en IFBench, pese a la práctica equivalencia en perplejidad. La perplejidad no es un predictor fiable del rendimiento en razonamiento.
- La comparación de BFCL no es un control exacto: la referencia de Liquid incluye categorías de búsqueda web que aquí se excluyeron por falta de credenciales.
- Modelo exclusivamente en inglés; no se declara soporte multilingüe.
- Longitud de contexto no documentada en la información disponible; no debe asumirse una ventana concreta sin verificarla en la configuración del modelo base.
- Cuantización de terceros: no está publicada ni respaldada por LiquidAI; la revisión del modelo base sí está fijada, pero el checkpoint cuantizado es responsabilidad de RESMP-DEV.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.
- El comando de ejemplo de la model card referencia `RESMP-DEV/LFM2.5-2.6B-GPTQ-MXFP4-calibrated`, un identificador distinto del ID del repositorio analizado; conviene verificar la ruta antes de ejecutarlo.
- La ruta CUDA no es equivalente a la nativa: implica dequantizar a BF16, con mayor huella de memoria y sin throughput MXFP4 empaquetado ni acumulación bit a bit idéntica a MLX.
- Riesgo de alucinación inherente a un modelo de 2,6B, agravado por la cuantización a 4 bits; no recomendado para respuestas factuales sin verificación.
- Licencia `lfm1.0`: las condiciones exactas de uso comercial no se detallan en la información disponible; es obligatorio revisar el texto enlazado en el repositorio del modelo base antes de un despliegue en producción.
- Sesgos: no se publica ninguna evaluación de sesgo, toxicidad o seguridad en la información disponible.

## Enlaces

- HuggingFace (checkpoint cuantizado): https://huggingface.co/RESMP-DEV/LFM2.5-2.6B-MLX-GPTQ-MXFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Texto de la licencia LFM1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Recibo de calibración (`GPTQ_RECEIPT.md`, dentro del repositorio del checkpoint): https://huggingface.co/RESMP-DEV/LFM2.5-2.6B-MLX-GPTQ-MXFP4/blob/main/GPTQ_RECEIPT.md
- Resultados de benchmarks (`assets/benchmark-results.png`, dentro del repositorio): https://huggingface.co/RESMP-DEV/LFM2.5-2.6B-MLX-GPTQ-MXFP4/blob/main/assets/benchmark-results.png
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados correspondían a foros de televisión y educación ajenos al tema); no se dispone de papers, blogs ni demos adicionales.
