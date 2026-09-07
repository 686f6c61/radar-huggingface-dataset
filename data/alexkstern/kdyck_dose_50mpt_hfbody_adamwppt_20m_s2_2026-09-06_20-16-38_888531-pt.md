# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_20M_s2_2026-09-06_20-16-38_888531-pt

## Resumen

Este modelo es un checkpoint experimental de investigación generado con el framework nanochat. Forma parte de una serie de experimentos sobre la «dosis de tokens» (token dose) en los que se estudia el efecto de la cantidad de tokens de pre-entrenamiento y post-entrenamiento en la capacidad de un modelo para aprender un lenguaje formal (Dyck-k). La arquitectura es un Transformer de 16 capas con 8 cabezas de atención y una dimensión de embedding de 1024, con una ventana de contexto de 2048 tokens. El modelo se entrenó en dos fases: primero con 50 millones de tokens de FineWeb (vocabulario BPE de 65536) y después con 20 millones de tokens del lenguaje Dyck-k (vocabulario de 256). No se han publicado benchmarks ni hay información sobre sus capacidades generales; es un modelo de investigación, no un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nanochat GPT) con atención multi-cabeza |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (state_dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar implementada en nanochat, con 16 capas, 8 cabezas de atención (sin GQA, ya que n_kv_head es 8) y embeddings de 1024 dimensiones. La configuración incluye dos definiciones de modelo: `model_pt` con vocab_size 65536 y `model_ppt` con vocab_size 256, lo que indica un cambio de vocabulario en la transición de fase. El entrenamiento se realizó en dos etapas: una primera fase de pre-entrenamiento (PT) con 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`, y una segunda fase de post-entrenamiento (PPT) con 20 millones de tokens del dataset `dyck-k128-seq_len_2048-1B`. En la transición, se re-inicializan los embeddings (`reinit_embed_at_transition: true`) y se reinicia el optimizador (`reset_optimizer_at_transition: true`). No se aplicó RLHF ni DPO. La tasa de aprendizaje sigue un esquema trapezoidal con warmup y warmdown distintos para cada fase.

## Capacidades

- Generación de texto: el modelo puede generar tokens en el vocabulario BPE de 65536 (fase PT) y en el vocabulario de 256 (fase PPT), aunque no se han publicado muestras de salida.
- Razonamiento: no evaluado. El dataset Dyck-k sugiere que se ha entrenado para procesar paréntesis balanceados, pero no hay resultados publicados.
- Tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Investigación en scaling laws: el modelo permite estudiar cómo varía la pérdida de entrenamiento en función de la cantidad de tokens (50M PT + 20M PPT) y comparar con otros checkpoints de la misma serie.
- Evaluación de lenguajes formales: sirve como referencia para medir la capacidad de un Transformer pequeño de aprender estructuras Dyck-k con contexto 2048.
- Análisis de transferencia entre vocabularios: al cambiar de un vocabulario BPE de 65536 a uno de 256, el modelo es útil para estudiar el impacto de la re-inicialización de embeddings.
- Currículum de aprendizaje: el experimento combina texto general (FineWeb) con un lenguaje formal (Dyck), lo que permite investigar estrategias de ordenación de datos.
- Interpretabilidad: los pesos del checkpoint pueden analizarse para entender cómo se representan las estructuras sintácticas en un modelo pequeño.
- Comparación de optimizadores: el diseño usa lr trapezoid y tasas de aprendizaje separadas para embeddings y unembedding, lo que facilita estudios sobre el efecto del optimizador en el aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El checkpoint de 2.9 GB incluye el estado del optimizador; los pesos del modelo en fp32 ocuparían aproximadamente 1 GB, pero no se especifica.
- GPU recomendadas: no disponible. La configuración de entrenamiento indica un pico de 2250 TFLOPS, lo que sugiere aceleradores de alto rendimiento (por ejemplo, H100), pero no se confirma.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño pequeño del modelo (16 capas, 1024 de embedding), pero no se ha verificado.
- Opciones de despliegue: el formato .pt (state_dict de PyTorch) requiere conversión para vLLM, llama.cpp u Ollama. Se puede cargar directamente con PyTorch para investigación.

## Comparativa con modelos similares

En HuggingFace se han encontrado otros dos checkpoints de la misma serie de experimentos:

- `kdyck_dose_50Mpt_hfinit_20M_s2_2026-08-14_15-32-20_705847-pt`: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_20M_s2_2026-08-14_15-32-20_705847-pt
- `kdyck_dose_50Mpt_20M_s2_2026-08-14_22-59-48_639587-pt`: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_20M_s2_2026-08-14_22-59-48_639587-pt

No se dispone de especificaciones ni benchmarks comparables publicados para estos modelos, por lo que no se puede realizar una comparativa técnica.

## Limitaciones y advertencias

- Sesgos: no evaluados. El dataset FineWeb puede contener sesgos, pero no se ha auditado.
- Riesgo de alucinación: alto, al ser un modelo pequeño y experimental sin entrenamiento con alineación.
- Limitaciones de contexto: ventana de 2048 tokens, insuficiente para tareas de contexto largo.
- Idiomas: no se especifica, aunque FineWeb es predominantemente inglés; no se garantiza soporte multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no está diseñado para producción y no hay garantías de calidad.
- Caveat: el checkpoint está en formato .pt y no incluye tokenizador ni configuración para inferencia directa en frameworks estándar.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_20M_s2_2026-09-06_20-16-38_888531-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/5xw7f147
- Repo nanochat: https://github.com/karpathy/nanochat
