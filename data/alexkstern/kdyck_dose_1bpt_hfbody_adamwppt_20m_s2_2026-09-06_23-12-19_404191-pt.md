# alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_20M_s2_2026-09-06_23-12-19_404191-pt

## Resumen

El modelo `kdyck_dose_1Bpt_hfbody_adamwppt_20M_s2` es un checkpoint de investigación creado por `alexkstern` dentro del proyecto `nanochat`, una implementación minimalista de GPT desarrollada por Karpathy. Se trata de un experimento sobre la "dosis de tokens" (token dose) que estudia el efecto de combinar un preentrenamiento en texto natural con un post-entrenamiento en un lenguaje formal sintético (Dyck-k). El modelo resuelve una pregunta de investigación sobre cómo la cantidad de tokens de preentrenamiento y la posterior adaptación a un dominio formal afectan al aprendizaje de representaciones.

La arquitectura es un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 cabezas KV y 1024 unidades de embedding. La longitud de contexto es de 2048 tokens. El preentrenamiento se realizó con 1.000 millones de tokens de FineWeb y el post-entrenamiento con 20 millones de tokens del dataset Dyck-k, con un vocabulario reducido de 256 tokens.

Este modelo es relevante para investigadores interesados en entender cómo el post-entrenamiento en tareas formales afecta a las representaciones lingüísticas, y como punto de comparación en la línea de experimentos sobre la cantidad óptima de tokens de preentrenamiento y las estrategias de optimización con AdamW y tasas de aprendizaje diferenciadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con 16 capas, 8 cabezas de atención y 8 cabezas KV |
| Parametros totales | no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pt (state_dict) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT de nanochat: un transformer causal con 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding 1024 y vocabulario de 65.536 tokens en la fase de preentrenamiento. Tras el preentrenamiento, se reinicializan los embeddings y se cambia el vocabulario a 256 tokens para el post-entrenamiento en el dataset Dyck-k. La configuración indica `reinit_embed_at_transition: true` y `reset_optimizer_at_transition: true`, lo que implica una ruptura total entre las dos fases.

El preentrenamiento se realizó con el dataset `fineweb-nanochatbpe-20B` (1.000 millones de tokens) y el post-entrenamiento con `dyck-k128-seq_len_2048-1B` (20 millones de tokens). Se usó el optimizador AdamW con tasas de aprendizaje diferenciadas para matrices, embeddings y unembedding (0.02, 0.3 y 0.004). El schedule de learning rate es trapezoidal con 40% de warmdown y final en 0. No se aplicó RLHF ni DPO. El entrenamiento alcanzó el paso 3.814 con una pérdida suavizada de 3.164 y un `min_objective` de 0.944.

## Capacidades

- Generación de texto: el modelo es capaz de generar secuencias de texto en el dominio en el que fue entrenado, aunque su utilidad práctica fuera de la investigación es limitada.
- Modelado de lenguajes formales: el post-entrenamiento en Dyck-k le permite capturar la estructura de paréntesis anidados con profundidad hasta 128 (k=128) y longitud 2048.
- Aprendizaje por fases: el experimento documenta la transición de un vocabulario de 65.536 a uno de 256, lo que sirve para estudiar la adaptación a vocabularios pequeños.
- No se documentan capacidades de tool calling, vision, audio, ni soporte de agentes.

## Casos de uso

- Investigación en lenguajes formales: el modelo puede usarse para analizar cómo un transformer pequeño aprende la gramática libre de contexto de Dyck-k tras el post-entrenamiento.
- Estudio de la dosis de tokens: al comparar este checkpoint con otros de la misma familia con distintos volúmenes de preentrenamiento, se puede cuantificar el impacto de la cantidad de tokens en la convergencia y la pérdida final.
- Evaluación de la reinicialización de embeddings: el `reinit_embed_at_transition` permite estudiar si reinicializar la capa de embedding en la transición de fase es beneficioso o perjudicial para el rendimiento.
- Análisis de la transferencia entre vocabularios: el cambio de vocab_size de 65.536 a 256 ofrece un caso de estudio sobre la adaptación a un espacio de tokens más pequeño.
- Benchmark de eficiencia de entrenamiento: los metadatos de `flops_used`, `flops_per_token` y `total_training_time` permiten comparar el coste computacional de este entrenamiento con otros modelos.
- Reproducción de experimentos: gracias al W&B run y a los archivos de configuración y metadatos, los investigadores pueden reproducir el entrenamiento con nanochat y verificar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo no especifica requisitos de memoria).
- GPU recomendadas: no disponible. El entrenamiento se ejecutó en una GPU con `peak_tflops` de 2250.0, pero no se indica el modelo concreto.
- ¿Cabe en GPU de consumo? no disponible. El tamaño del repositorio (3.0 GB) sugiere un modelo de alrededor de 1.000 millones de parámetros, pero no se confirma.
- Opciones de despliegue: no disponible. Los pesos se guardan en formato `.pt` de PyTorch (state_dict), no en safetensors ni GGUF, por lo que vLLM, llama.cpp u Ollama no son compatibles sin conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada. En la búsqueda web aparecen checkpoints hermanos del mismo autor: `kdyck_dose_1Bpt_hfinit_500M_s2_2026-08-14_16-04-10_901241-pt` y `kdyck_dose_1Bpt_hfbody_20M_s1_2026-08-14_08-12-42_071342-pt`, que comparten la misma arquitectura y entorno de entrenamiento, pero no se han publicado resultados de benchmarks que permitan comparar el rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni como modelo generalista.
- Sin evaluaciones de seguridad: no se han publicado pruebas de sesgos, alucinaciones ni comportamiento dañino.
- Riesgo de alucinación: al ser un modelo pequeño y no alineado, es probable que genere contenido falso o incoherente en tareas de lenguaje natural.
- Olvido catastrófico: el post-entrenamiento en Dyck-k puede haber degradado su capacidad para procesar texto natural del preentrenamiento.
- Idiomas: no se declaran idiomas soportados; el preentrenamiento en FineWeb es predominantemente inglés, por lo que el rendimiento en otros idiomas es incierto.
- Licencia: Apache 2.0 permite uso comercial, pero la falta de documentación y formato de pesos no estándar dificulta el despliegue práctico.
- Compatibilidad: el formato `.pt` no es interoperable con ecosistemas de despliegue estándar sin conversión manual.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_20M_s2_2026-09-06_23-12-19_404191-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/15gndrkt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Checkpoint relacionado 1: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfinit_500M_s2_2026-08-14_16-04-10_901241-pt
- Checkpoint relacionado 2: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_20M_s1_2026-08-14_08-12-42_071342-pt
