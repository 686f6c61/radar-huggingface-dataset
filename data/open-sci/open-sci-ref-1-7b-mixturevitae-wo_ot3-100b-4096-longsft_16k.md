# open-sci/open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096-longsft_16k

## Resumen

El modelo `open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096-longsft_16k` es un checkpoint de investigación publicado por el colectivo open-sci (vinculado al ecosistema LAION) como parte de un estudio de ablación para una submission a NeurIPS 2026. Se trata de un transformer denso de 1.714 millones de parámetros (1,7B) entrenado desde cero sobre 100.000 millones de tokens del corpus MixtureVitae v1, con una extensión posterior de contexto de 4096 a 16.384 tokens mediante YaRN. Su propósito no es el uso comercial general, sino aislar el efecto de la exposición previa a trazas de razonamiento de OpenThoughts3 (OT3) durante el preentrenamiento.

El modelo responde a una crítica concreta de revisión: la ablación publicada `MV-noinstruct` eliminaba todo el subconjunto de instrucciones/razonamiento (175,1B tokens, 42% del corpus), lo que impedía separar el solapamiento OT3 preentrenamiento/postentrenamiento. Este checkpoint elimina únicamente los shards `open_thoughts-0/1/2` (18,69B tokens, 4,53% de MV) y conserva el resto, incluidos los shards multilingües, manteniendo la proporción natural de cada shard restante.

Es relevante ahora porque forma parte de una familia de modelos de referencia (`open-sci-ref`) con hiperparámetros idénticos entre sí (mismos 100B tokens, batch global 1024, secuencia 4096), lo que permite comparaciones controladas sobre receta de preentrenamiento, datos y extensión de contexto. La licencia Apache 2.0 y los pesos en safetensors facilitan su reproducción y auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`open-sci-ref`), decoder-only, RoPE |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (extendido desde 4096 con YaRN, factor 4.0) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); corpus de preentrenamiento incluye 8 shards multilingües |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `modeling_opensci.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de la familia `open-sci-ref`, con tokenizador GPT-NeoX (vocabulario 50304, tokens uint16). El preentrenamiento consumió 100.000 millones de tokens en 23.842 iteraciones con longitud de secuencia 4096, RoPE theta 100k, schedule WSD, learning rate 4e-3, cooldown lineal del 20%, batch global 1024 y warmup de 1000 pasos, ejecutado en 64 nodos con 4 GH200 cada uno. Los hiperparámetros son idénticos a los de los modelos compañeros `nemotron-hq[-mv_reasoning]-100B-4096` y `MV-100BT`, lo que hace comparables todos los resultados. El autor advierte explícitamente que no sigue la receta `v0.02` publicada (batch 1008, warmup 25000, solo disponible a 300B/1T), sino la convención de 100B del proyecto.

Los datos provienen de MixtureVitae v1 decontaminado, usando 93 de 96 shards: se eliminan `open_thoughts-0/1/2` y se mantienen 37 shards de razonamiento/instrucción (de 40), 48 no-razonamiento y 8 multilingües, con pesos proporcionales al tamaño de cada shard (393,92B tokens disponibles, 100B consumidos). La extensión de contexto aplica YaRN con factor 4.0 (4096 a 16384) y una época de `long_sft` con mezcla SeaLong + LongAlign al 30% y SmolTalk al 70%, learning rate 2e-4 cosine, 2 nodos con 4 GH200, 1623 pasos y pérdida final de entrenamiento de 0,883 (frente a 0,825 de `nemotron-hq-mv_reasoning` y 0,978 de `nemotron-hq`). No se documenta RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto autoregresiva en inglés, con contexto de hasta 16.384 tokens.
- Razonamiento de cadena de pensamiento heredado del subconjunto de razonamiento del corpus de preentrenamiento (37 shards), aunque el modelo no ha sido sometido a un postentrenamiento de instrucciones específico documentado.
- Capacidad multilingüe limitada y no evaluada: el corpus incluye 8 shards multilingües, pero la model card declara únicamente `en` como idioma.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada explícita.
- Capacidades de visión o audio: no disponibles.
- Modo thinking: no disponible.
- Fine-tuning sobre secuencias largas (hasta 16k) mediante el adaptador YaRN incluido en la configuración.

## Casos de uso

- Investigación en ablación de datos de preentrenamiento: sirve como punto de control para medir si la ganancia de un postentrenamiento con OT3 se debe a reexposición de datos vistos o a receptividad general al razonamiento. Se compara directamente con `MV (full)` y con `MV-noinstruct`.
- Reproducción de estudios de receta de entrenamiento: al compartir hiperparámetros con `nemotron-hq`, `nemotron-hq-mv_reasoning` y `MV-100BT`, permite aislar la variable de datos manteniendo constante la receta (100B tokens, batch 1024, secuencia 4096).
- Evaluación de extensiones de contexto largo: el checkpoint de 16k con YaRN permite estudiar degradación de perplejidad y rendimiento en tareas de recuperación en contexto entre 4k y 16k tokens.
- Base para fine-tuning académico de bajo presupuesto: con 1,7B parámetros y licencia Apache 2.0, es viable ajustarlo en un solo nodo de 4 GPUs para tareas de clasificación, extracción o generación controlada en inglés.
- Análisis de composición de corpus: al conservar la proporción natural de shards (sin reweighting), permite estudiar el efecto de eliminar un 4,53% del corpus frente a eliminar el 42% completo.
- Docencia y experimentación en preentrenamiento a escala media: su tamaño y su receta documentada paso a paso lo hacen adecuado como caso de estudio reproducible en cursos de entrenamiento de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de entrenamiento (`long_sft`: 0,883; `nemotron-hq-mv_reasoning`: 0,825; `nemotron-hq`: 0,978) y no incluye MMLU, HumanEval, GSM8K ni evaluaciones de contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8-2,5 GB; en 4 bits: alrededor de 1-1,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: GH200 (usadas en el entrenamiento), A100 40/80 GB, H100; para inferencia basta una RTX 4090, RTX 3090 o incluso GPUs consumer con 8 GB o más.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares; la ventana de 16k incrementa el coste de la caché KV de forma proporcional.
- Opciones de despliegue: requiere `custom_code` (`modeling_opensci.py`) y `trust_remote_code=True` en `transformers`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La conversión a GGUF no está publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (`MV-wo_ot3-100B-16k`) | 1,7B | 16.384 | Apache 2.0 | Ablación de OT3 sobre MV v1, extensión YaRN |
| `open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096` | 1,7B | 4096 | Apache 2.0 | Checkpoint base sin extensión de contexto |
| `nemotron-hq-mv_reasoning-100B-4096` | 1,7B (aprox., misma familia) | 4096 | no disponible | Misma receta; pérdida `long_sft` 0,825 |
| `nemotron-hq-100B-4096` | 1,7B (aprox., misma familia) | 4096 | no disponible | Misma receta; pérdida `long_sft` 0,978 |

No se dispone de comparaciones con modelos de propósito general de tamaño similar (por ejemplo, Qwen, Llama o Gemma en el rango 1-2B) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no ha pasado por un postentrenamiento de instrucciones ni por alineamiento (RLHF/DPO) documentado, por lo que no debe usarse como asistente conversacional sin fine-tuning adicional.
- Idioma: declarado únicamente en inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente pese a los shards multilingües del corpus.
- Riesgo de alucinación: inherente a un modelo de 1,7B entrenado solo con objetivo de modelado de lenguaje; no se han publicado evaluaciones de fidelidad.
- Sesgos: no se documenta ninguna auditoría de sesgos; el corpus MixtureVitae es de origen web y puede arrastrar sesgos de sus fuentes.
- Contexto: la ventana de 16k depende de YaRN y de un `long_sft` de una sola época; el rendimiento más allá de 4k no está validado con benchmarks públicos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True` y código personalizado (`modeling_opensci.py`), lo que implica auditar el código remoto antes de desplegarlo en producción.
- Compatibilidad: la model card documenta dos correcciones necesarias (`**kwargs` en `forward` para `num_items_in_batch` y `max_position_embeddings` casteado a entero); versiones recientes de `transformers` pueden fallar sin ellas.
- No apto para producción sin evaluación previa: sin benchmarks publicados, no hay evidencia de rendimiento en tareas downstream.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096-longsft_16k
- Checkpoint base de 4096: https://huggingface.co/laion/open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096 (referenciado en la model card)
- Paper de referencia: *Strong Post-Training from Permissive, Reasoning-Dominant, Web-Scale Pretraining* (submission a NeurIPS 2026, sin URL en la información disponible)
- Repositorio de código `modeling_opensci.py`: incluido en el repositorio de HuggingFace del modelo
- Organización open-sci en HuggingFace: https://huggingface.co/open-sci
