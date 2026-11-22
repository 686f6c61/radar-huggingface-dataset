# devops-thiago/classone-gemma4-e2b

## Resumen

`devops-thiago/classone-gemma4-e2b` es un modelo de clasificación de texto derivado de `google/gemma-4-e2b-it`, publicado por el autor independiente devops-thiago bajo licencia Apache 2.0. No es un modelo generativo al uso: se trata de un "decision model" de estilo system-1 que reutiliza el backbone de texto y las tablas Per-Layer Embedding (PLE) del Gemma 4 base, eliminando las torres de visión y audio, y le acopla cabezas de decisión entrenadas (`noul_head`, `choice_head`, `score_head`) más un mecanismo de lectura de letras a nivel de token único (LM-letter readout). El resultado es un clasificador de opciones categóricas con 4.628.569.344 parámetros totales.

La relevancia de esta versión `v1.1` es fundamentalmente de corrección: la `v1.0` publicada en el Hub contenía un error de empaquetado que omitía las filas de embedding `262144..262155` correspondientes a tokens delimitadores personalizados, lo que impedía reproducir las métricas declaradas. La `v1.1` no introduce entrenamiento nuevo ni ajuste fino: reempaqueta el backbone base sin modificar junto con las cabezas `v1.0` intactas y añade preservación numérica en FP32 para las buffers RoPE y las cabezas.

El modelo está pensado para tareas de decisión y clasificación con opciones discretas, no para generación abierta de texto. Su pipeline declarado es `text-classification` y su arquitectura subyacente es la de Gemma 4 en su variante de texto (`Gemma4TextModel`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Gemma4TextModel`) con cabezas de decisión acopladas |
| Parámetros totales | 4.628.569.344 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16; cabezas y buffers RoPE en FP32 en runtime) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, más `classone_heads.pt` (PyTorch) y `gemma4_e2b_codebook_v1.json` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e2b-it` (commit `@3e22461f65e89153144f8adb70e3b8c2cc9845a7`) y conserva únicamente el backbone de texto y las tablas PLE, descartando `vision_tower`, `audio_tower`, `embed_vision` y `embed_audio`. Sobre ese backbone se montan tres cabezas de decisión (`noul_head`, `choice_head`, `score_head`) procedentes de la `v1.0`, sin cambios. La inferencia mantiene en `torch.float32` las buffers `rotary_emb.*_inv_freq` de RoPE y las cabezas, para evitar la deriva por truncamiento en BF16.

El mecanismo de decisión combina una etapa de lectura de letras a nivel de token único (Stage 2 LM-letter readout) con un codebook determinista de 180 entradas (`gemma4_e2b_codebook_v1.json`), `final_logit_softcapping = 30.0` y un rerouting de segunda pasada `M2` con top-16 cuando el número de opciones `K >= 64`. La `v1.1` no realizó entrenamiento nuevo, LoRA ni ajuste de hiperparámetros: es exclusivamente una reparación de empaquetado y numérica. No se dispone de información sobre el volumen de tokens, la composición del dataset de entrenamiento original de las cabezas ni sobre el uso de RLHF/DPO.

## Capacidades

- Clasificación de texto con opciones categóricas discretas mediante cabezas de decisión dedicadas.
- Puntuación de opciones (`score_head`) y selección de elección (`choice_head`) en tareas de decisión tipo multiple-choice.
- Lectura determinista de opciones mediante codebook de token único, con rerouting top-16 para conjuntos grandes de candidatos (`K >= 64`).
- Razonamiento de tipo system-1: decisión rápida en un solo paso, sin cadena de pensamiento explícita.
- Evaluación sobre benchmarks de decisión (JevBench, RLCDAlignBench, Decision Index 0.3) y de clasificación out-of-scoring (AG News, BoolQ, Emotion, SciQ, ARC, OpenBookQA).
- No incluye torres de visión ni audio (fueron eliminadas del modelo base).
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-step: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Clasificación de tickets de soporte en categorías predefinidas: el modelo puntúa cada categoría candidata mediante `score_head` y selecciona la de mayor puntuación, adecuado por su naturaleza de decisión de un solo paso y bajo coste por inferencia.
- Enrutamiento de consultas en un pipeline RAG: dado un conjunto de intenciones (`K` pequeño), el modelo elige la ruta correcta sin generación intermedia, lo que reduce latencia frente a un LLM generativo.
- Moderación de contenido con etiquetas discretas: clasificación de textos en categorías de riesgo usando el codebook determinista, con resultados reproducibles entre ejecuciones.
- Evaluación automática de respuestas en benchmarks tipo multiple-choice: el modelo puede usarse como scorer de opciones en conjuntos como ARC-Challenge u OpenBookQA, tareas sobre las que se reportan métricas.
- Filtrado de candidatos en pipelines de anotación: puntuación de opciones para preetiquetar datos antes de revisión humana, aprovechando la salida determinista de la lectura de letras.
- Clasificación de sentimiento o tema en datasets de investigación (Emotion, AG News): el modelo reporta métricas macro en estos conjuntos y puede integrarse como baseline reproducible en experimentos de clasificación.
- Selección de acciones en entornos de decisión acotados: con `K >= 64` opciones, el rerouting `M2` top-16 permite manejar espacios de acción grandes sin degradar el coste de forma lineal.

## Benchmarks y rendimiento

Resultados autoevaluados localmente en `2x NVIDIA GeForce RTX 5060 Ti 16 GB` (fecha 2026-11-21, commit `d615e28`), con intervalos de confianza al 95% por bootstrap estratificado (`B = 2.000`, `seed = 20261120`).

| Benchmark | `v1.1` (IC 95%) | `v1.0` re-evaluado (IC 95%) | Diferencia pareada (IC 95%) |
|---|---|---|---|
| JevBench v1.6.1 Public (231 tareas) | 57,58% [51,52; 63,20] | 57,58% [52,38; 63,20] | +0,01% [-5,19; +5,21] |
| RLCDAlignBench Balanced Accuracy (100 instancias) | 60,68% [51,54; 69,75] | 47,90% [37,94; 57,94] | +12,80% [-1,06; +25,85] |
| OOS-320 Macro (AG News / BoolQ / Emotion / SciQ) | 77,19% [72,50; 81,25] | 69,38% [64,69; 74,06] | +7,71% [+3,12; +12,20] |
| OOS-1000 Macro (AG News / BoolQ / Emotion / SciQ) | 77,00% [74,50; 79,40] | 69,70% [67,20; 72,20] | +7,29% [+4,80; +9,80] |
| ARC+OBQA Macro (1.667 tareas) | 72,13% [69,79; 74,56] | 50,49% [47,97; 53,14] | +21,67% [+18,87; +24,41] |

Desglose de JevBench v1.6.1 Public (231 tareas): Easy 87,50% (42/48), Original 63,89% (46/72), Hard 40,54% (45/111). Para `v1.0` re-evaluado: Easy 91,67%, Original 72,22%, Hard 33,33%.

Decision Index 0.3 (medición local con scorer propio, no envío oficial a terceros):

| Suite / métrica | `v1.1` (IC 95%) | `v1.0` re-evaluado (IC 95%) | Diferencia pareada (IC 95%) |
|---|---|---|---|
| Official (`sample-0.3-unseen-v2`) | 28,38 [25,68; 31,44] | 11,87 [10,31; 15,18] | +15,86 [+12,64; +18,91] |
| Disjoint-36 (`sample-0.3-unseen-v2`) | 26,48 [23,71; 30,30] | 10,50 [8,95; 15,21] | +15,21 [+11,43; +18,68] |
| Official (`sample-0.3-unseen`) | 27,22 [25,45; 30,92] | 13,56 [11,80; 16,47] | +14,09 [+11,20; +17,00] |
| Disjoint-36 (`sample-0.3-unseen`) | 25,79 [23,93; 30,43] | 13,76 [datos truncados en la información disponible] | no disponible |

## Requisitos de hardware

- VRAM de inferencia: 8,644 GiB cargados en GPU según el autor (backbone de texto y PLE en BF16, cabezas y buffers RoPE en FP32). El footprint en disco es de 8,663 GiB (9,302 GB) para el backbone empaquetado; el repositorio completo ocupa 59,1 GB.
- GPU validadas por el autor: 2x NVIDIA GeForce RTX 5060 Ti de 16 GB, ejecutando la evaluación local.
- Cabe en GPU de consumo: sí, con al menos 9 GB de VRAM efectiva; una RTX 4090 (24 GB) o RTX 3090 (24 GB) dejan margen amplio, y una RTX 5060 Ti de 16 GB es suficiente para una instancia.
- GPU de datacenter recomendadas: A100, H100 o L40S para despliegues con concurrencia, aunque no se han publicado mediciones en estas.
- Opciones de despliegue: `transformers` con el código de modelado incluido (`modeling_classone.py`, `stage2_readout.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `devops-thiago/classone-gemma4-e2b` (este) | 4.628.569.344 | no disponible | Clasificación / decisión con opciones | Apache 2.0 | Hugging Face |
| `google/gemma-4-e2b-it` (base) | no disponible en la información | no disponible | Generación de texto, visión, audio | Términos de Gemma | Hugging Face |
| Alternativas de clasificación de tamaño similar | no disponible | no disponible | Clasificación de texto | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La `v1.0` del Hub no reproducía sus propias métricas por un error de empaquetado (filas de embedding `262144..262155` ausentes); cualquier resultado citado de la `v1.0` debe tratarse con cautela.
- Todas las métricas de la `v1.1` son autoevaluadas localmente por el autor; las cifras del Decision Index 0.3 provienen de un scorer local, no de una evaluación oficial de terceros.
- El modelo no es generativo: no debe usarse para generación abierta de texto, resumen, traducción ni diálogo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la puntuación de opciones puede ser incorrecta en dominios alejados de los benchmarks evaluados; no se documenta calibración fuera de ellos.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar su uso en documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a términos adicionales de Google que conviene verificar antes de un despliegue en producción.
- Dependencia de código personalizado (`modeling_classone.py`, `stage2_readout.py`) y de un codebook con hash fijo; cambios en esos artefactos alteran los resultados de forma no trivial.
- No se documenta soporte para tool calling, agentes ni modos de razonamiento extendido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devops-thiago/classone-gemma4-e2b
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Repositorio del proyecto: https://github.com/devops-thiago/class-one
- Rama de la release: https://github.com/devops-thiago/class-one/tree/feat/stage2-lm-letter-readout
