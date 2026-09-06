# alexkstern/nca_dose_1Bpt_hfinit_adamwppt_500M_s2_2026-09-06_15-14-54_544717-pt

## Resumen

El modelo `nca_dose_1Bpt_hfinit_adamwppt_500M_s2` es un checkpoint de investigación desarrollado por alexkstern utilizando la librería `nanochat` de Karpathy. Se trata de un experimento de "token dose" que estudia el efecto de la cantidad de tokens de pre-entrenamiento (1.000 millones) y post-entrenamiento (500 millones) en un modelo GPT pequeño. El nombre del modelo no se refiere a sus parámetros, sino a los tokens de entrenamiento: `1Bpt` indica mil millones de tokens de pre-entrenamiento y `500M` indica quinientos millones de tokens de post-entrenamiento.

La arquitectura es un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 KV heads y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El checkpoint final se corresponde con la fase de post-entrenamiento, que utiliza un vocabulario reducido de 10.004 tokens, mientras que la fase de pre-entrenamiento usaba un vocabulario de 65.536. El modelo se entrenó sobre FineWeb (pre-entrenamiento) y un dataset de papers denominado `nca-paper-share200-2048` (post-entrenamiento). No se han publicado evaluaciones de rendimiento, por lo que es un modelo puramente experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat_gpt) |
| Parámetros totales | ~224M (estimado a partir de la config) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (pre-entrenado en FineWeb, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pt (state_dict) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar implementada en `nanochat`. Tiene 16 capas, 8 cabezas de atención con 8 KV heads, dimensión de embedding de 1024 y una ventana de contexto de 2048 tokens. La fase de pre-entrenamiento (`pt`) utilizó un vocabulario de 65.536 tokens (BPE de nanochat sobre FineWeb) y la de post-entrenamiento (`ppt`) redujo el vocabulario a 10.004 tokens, reinicializando el embedding y el unembedding en la transición. El optimizador es AdamW con tasas de aprendizaje diferenciadas: 0.02 para matrices, 0.3 para embeddings y 0.004 para unembedding. Se usó un scheduler trapezoidal con un 40% de warmdown y sin warmup. La fase de post-entrenamiento usó una tasa de aprendizaje de 3e-5 y acumulación de gradientes de 2 pasos. El checkpoint está en el paso 3.814, con una pérdida de entrenamiento suavizada de 3.167. El entrenamiento consumió aproximadamente 2.08e18 FLOPs en total.

## Capacidades

- Generación de texto: el modelo es un LM decoder-only y puede generar texto, aunque no se han publicado evaluaciones de calidad.
- Razonamiento, código, matemáticas o visión: no hay datos que confirmen capacidades específicas más allá de la generación de lenguaje.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles (el dataset de pre-entrenamiento es FineWeb, predominantemente inglés).
- Capacidades especiales: ninguna documentada. El modelo es un experimento de investigación sobre token dose.

## Casos de uso

- Investigación en escalado de datos: el modelo permite estudiar cómo la relación entre tokens de pre-entrenamiento y post-entrenamiento afecta a la pérdida y al comportamiento de un modelo pequeño.
- Ablaciones de arquitectura: sirve como base para comparar configuraciones de entrenamiento (por ejemplo, inicialización desde HuggingFace, reinicialización de embeddings, reset del optimizador).
- Reproducción de experimentos: el checkpoint y la configuración completa están disponibles, lo que permite reproducir el experimento y analizar las métricas en W&B.
- Fine-tuning experimental: al ser un modelo pequeño y con licencia Apache 2.0, puede usarse como punto de partida para fine-tuning en tareas específicas de investigación, aunque su vocabulario reducido limita su aplicabilidad.
- Benchmark de eficiencia: sirve como referencia para medir el coste de entrenamiento (FLOPs por token) en modelos pequeños.
- Docencia y aprendizaje: la disponibilidad del código de entrenamiento (nanochat) y la configuración detallada lo hacen útil para enseñar técnicas de entrenamiento de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~224M parámetros, en FP16 se necesitan aproximadamente 450 MB de VRAM; en FP32, ~900 MB; en 8 bits, ~225 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente para inferencia (por ejemplo, RTX 3060, RTX 4060, A10, T4).
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer.
- Opciones de despliegue: al ser un checkpoint en formato .pt, puede cargarse con PyTorch directamente. También podría convertirse a GGUF para su uso con llama.cpp, aunque no hay conversiones publicadas.
- Latencia y throughput: no disponibles (no hay mediciones publicadas).

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información disponible. Existen otros checkpoints de la misma serie con 20M de parámetros (por ejemplo, `nca_dose_1Bpt_hfinit_20M_s2`), pero no hay datos de rendimiento que permitan una comparación significativa.

## Limitaciones y advertencias

- Modelo experimental: no ha sido evaluado en tareas estándar, por lo que su calidad de generación es desconocida.
- Vocabulario reducido: el checkpoint final usa un vocabulario de 10.004 tokens, lo que limita su capacidad para manejar texto general.
- Dataset de post-entrenamiento no documentado: `nca-paper-share200-2048` no está descrito públicamente, lo que dificulta entender su dominio de especialización.
- Posibles sesgos: al estar pre-entrenado en FineWeb, puede heredar sesgos del corpus de internet.
- Riesgo de alucinación: no hay evaluaciones de fiabilidad; debe usarse con cautela.
- Contexto limitado: 2048 tokens, insuficiente para tareas que requieren contexto largo.
- No apto para producción: es un checkpoint de investigación, no un modelo listo para desplegar en servicios reales.
- Licencia: Apache 2.0 permite uso comercial, pero sin garantías de rendimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_adamwppt_500M_s2_2026-09-06_15-14-54_544717-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/wsch0fh3
- Repositorio nanochat: https://github.com/karpathy/nanochat
