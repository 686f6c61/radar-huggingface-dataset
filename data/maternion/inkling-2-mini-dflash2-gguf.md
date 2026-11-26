# maternion/Inkling-2-Mini-DFlash2-GGUF

## Resumen

Inkling-2-Mini-DFlash2-GGUF es un paquete de cuantizaciones GGUF del borrador (*draft*) DFlash2 para el modelo objetivo Inkling-2-Mini de Thinking Machines. No es un modelo autónomo: se trata de un modelo borrador de decodificación especulativa que carece de cabeza de vocabulario utilizable por sí misma y solo funciona emparejado con el modelo objetivo Inkling-2-Mini. Los pesos y la arquitectura provienen de `incoai/Inkling-2-Mini-DFlash2`; este repositorio no reentrena ni ajusta nada, solo convierte y cuantiza.

El borrador emplea una arquitectura `dflash` de difusión por bloques (*block-diffusion draft*) con 5 bloques, tamaño de bloque 8, dimensión de embedding 2304 y feed-forward 6912, leyendo los estados ocultos de las capas 6, 24, 42 y 48 del modelo objetivo. Con 494.983.424 parámetros totales (aproximadamente 495 M), su función es acelerar la generación del modelo objetivo mediante decodificación especulativa, proponiendo tokens candidatos que el modelo grande verifica en paralelo.

Su relevancia es doble: es el primer borrador DFlash2 para Inkling que funciona bajo llama.cpp, y requiere una compilación de `master` con el soporte específico (PR #33073), ya que las compilaciones estándar como `b12588` y `b12675` abortan en el primer token. El repositorio incluye cinco cuantizaciones (BF16 hasta Q4_K_M) para ajustar el equilibrio entre tamaño y tasa de aceptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `dflash` (block-diffusion draft para decodificación especulativa) |
| Parametros totales | 494.983.424 (~495 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (según `dflash.context_length`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Otras especificaciones de arquitectura relevantes:

| Clave | Valor |
|---|---|
| `dflash.block_count` | 5 |
| `dflash.block_size` | 8 |
| `dflash.embedding_length` / `feed_forward_length` | 2304 / 6912 |
| `dflash.target_layers` | [6, 24, 42, 48] (1-based) |
| `dflash.selector_rank` / `selector_top_k` | 256 / 16 |
| `dflash.conv_kernel_size` / `conv_group_size` | 2 / 16 |
| `dflash.attention.sliding_window` | 2048 (en las 5 capas) |
| `dflash.final_logit_softcapping` | 30.0 (ignorado en Inkling) |
| `dflash.rope.freq_base` | 10000.0 |
| `dflash.attention.layer_norm_rms_epsilon` | 1e-6 |
| Vocabulario (padded) | 201024 (real: 200058) |
| Tokenizer pre / model | `inkling2` / `gpt2` |
| EOS / EOT / PAD / MASK | 200006 / 200006 / 199999 / 200056 |

## Arquitectura y entrenamiento

El borrador usa una arquitectura de difusión por bloques (`dflash`) con 5 capas, tamaño de bloque 8, atención con ventana deslizante de 2048 tokens en todas las capas y un mecanismo de selección con rango 256 y top-k 16. Lee los estados ocultos de las capas 6, 24, 42 y 48 del modelo objetivo Inkling-2-Mini para condicionar sus propuestas de tokens. Cada bloque propone hasta 8 tokens candidatos que el modelo objetivo verifica en una sola pasada.

No se dispone de información sobre el proceso de entrenamiento del borrador (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada. El repositorio es una conversión y cuantización del checkpoint `incoai/Inkling-2-Mini-DFlash2`; la conversión a BF16 GGUF fue realizada por el usuario `ufrik` y este repositorio la replica y añade las cuantizaciones menores derivadas con presets de `llama-quantize`.

La innovación técnica principal es la corrección del camino de decodificación especulativa para Inkling en llama.cpp: el *LM head* del objetivo está rellenado (`output.weight` es `[2304, 201024]` con vocabulario real de 200058), y el camino de candidatos DFlash2 ejecutaba `ggml_top_k` sobre los logits rellenados, emitiendo identificadores en `[200058, 201024)` que el batch rechazaba. Las tres correcciones (clamp del vocabulario válido, aplicación de `tok_norm` del objetivo a los embeddings del borrador y omisión del soft-capping) están condicionadas a `LLM_ARCH_INKLING2_LOOP` y hacen que el borrador sea específico de Inkling.

## Capacidades

- Decodificación especulativa: propone tokens candidatos para que Inkling-2-Mini los verifique en paralelo, acelerando la generación.
- Difusión por bloques: genera propuestas en bloques de hasta 8 tokens.
- Condicionamiento por capas del objetivo: lee los estados ocultos de las capas 6, 24, 42 y 48 del modelo objetivo.
- No es un modelo autónomo: carece de cabeza de vocabulario utilizable y no puede generar texto por sí solo.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma independiente.
- Capacidades multilingües: no disponibles (heredadas del objetivo, no documentadas aquí).
- No soporta visión ni audio por sí mismo (la visión la aporta el proyector multimodal del objetivo).

## Casos de uso

- Aceleración de inferencia de Inkling-2-Mini en llama.cpp: emparejado con el objetivo mediante `--spec-draft-model` y `--spec-type draft-dflash2`, reduce el número de pasos de decodificación al verificar varios tokens por iteración.
- Despliegue en Apple Silicon: verificado en un M3 Ultra de 96 GB junto al objetivo y su proyector de visión, con `-c 368640 --parallel 3 -fa on -ngl 99`, lo que permite servir el modelo con contexto largo y tres peticiones concurrentes.
- Servicio con contexto largo: el borrador declara 1.048.576 tokens de contexto, adecuado para flujos de trabajo con documentos extensos siempre que el objetivo lo soporte.
- Cuantización ajustada a memoria: las variantes Q8_0 (538 MB), Q6_K (418 MB), Q5_K_M (358 MB) y Q4_K_M (300 MB) permiten reducir la huella del borrador en entornos con VRAM o memoria unificada limitada.
- Integración en `llama-server`: expone el endpoint `/completion` y es compatible con endpoints, lo que facilita su uso en servicios HTTP existentes.
- Evaluación de decodificación especulativa: útil para medir tasas de aceptación y latencia frente a la generación estándar del objetivo en distintos presets de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las cuantizaciones menores no se han evaluado por separado en tasa de aceptación; Q8_0 es la más próxima a BF16.

## Requisitos de hardware

- VRAM/memoria del borrador: entre 300 MB (Q4_K_M) y 1002 MB (BF16), más el modelo objetivo y, si se usa, el proyector de visión.
- Configuración verificada: M3 Ultra con 96 GB de memoria unificada, sirviendo el objetivo `Inkling-2-Mini-UD-Q8_K_XL.gguf`, el proyector `mmproj-BF16.gguf` y el borrador BF16.
- GPU recomendadas: no disponibles de forma explícita; la verificación documentada es en Apple Silicon. Para GPU dedicadas se requiere una compilación de llama.cpp con soporte CUDA/Metal y el parche de Inkling.
- ¿Cabe en GPU de consumo? El borrador por sí solo sí (300-1002 MB), pero el requisito real lo marca el modelo objetivo completo, que no se especifica en la información disponible.
- Opciones de despliegue: `llama-server` con `--spec-draft-model` y `--spec-type draft-dflash2`; requiere una compilación de `master` con PR #33073. Las compilaciones estándar `b12588` y `b12675` abortan.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptación del borrador y del objetivo.

## Comparativa con modelos similares

No se dispone de información sobre borradores de decodificación especulativa comparables para Inkling-2-Mini en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-DFlash2 (este) | ~495 M | 1.048.576 | Apache 2.0 | GGUF | Borrador DFlash2 específico de Inkling |
| Borradores DFlash2 para otros objetivos | no disponible | no disponible | no disponible | no disponible | No comparables por dependencia del objetivo |
| Borradores EAGLE/Medusa genéricos | no disponible | no disponible | no disponible | no disponible | No disponibles en la información |

## Limitaciones y advertencias

- No es un modelo autónomo: no tiene cabeza de vocabulario utilizable y solo funciona emparejado con Inkling-2-Mini.
- Específico de Inkling: por las correcciones de `tok_norm` y soft-capping, no debe apuntarse a otros modelos objetivo.
- Requiere compilación parcheada: las compilaciones estándar de llama.cpp abortan en el primer token con el error `get_sub_batch: failed to add token 200899`.
- Las cuantizaciones menores no se han evaluado en tasa de aceptación; pueden degradar la calidad del borrador.
- Riesgo de alucinación y sesgos: no evaluables de forma independiente; dependen del modelo objetivo.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse la licencia del modelo objetivo y del checkpoint base.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maternion/Inkling-2-Mini-DFlash2-GGUF
- Modelo base (borrador): https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Modelo objetivo: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conversión BF16 original: https://huggingface.co/ufrik/Inkling-2-Mini-Dflash2-GGUF
- PR de llama.cpp con el soporte DFlash2 para Inkling: https://github.com/ggml-org/llama.cpp/pull/33073
