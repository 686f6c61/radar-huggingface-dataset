# brishen/gemma-4-E2B-it-enja

## Resumen

`brishen/gemma-4-E2B-it-enja` es una variante de `google/gemma-4-E2B-it` en la que se ha podado el vocabulario del tokenizador para conservar únicamente inglés y japonés, reduciéndolo de 262.144 a 164.224 tokens (−37%). Los pesos del modelo no se han reentrenado: la poda elimina filas de la tabla de embeddings (tanto la de entrada/salida de 262.144 × 1.536 como la tabla por capa de 262.144 × 8.960) y remapea los identificadores de token. El resultado es un checkpoint un 22% más pequeño en parámetros de texto (4,65B → 3,62B) y un 20% más ligero en disco (10,25 GB → 8,19 GB).

La relevancia de esta variante es de ingeniería: demuestra que se puede recortar casi la mitad de un vocabulario multilingüe sin degradar la calidad en los idiomas conservados, manteniendo logits bit a bit idénticos sobre los tokens que se conservan. Es un caso práctico de optimización de memoria y coste de entrenamiento (el estado de AdamW en un fine-tune completo baja de 74,4 GB a 57,9 GB) sin tocar la arquitectura ni el comportamiento del modelo base.

El modelo conserva las torres de visión y audio del original, así que sigue siendo un modelo any-to-any, aunque el autor advierte que solo se ha evaluado el texto. La licencia es Apache 2.0, heredada de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, visión, audio) con torres separadas; vocabulario podado a en/ja |
| Parametros totales | 4.095.409.731 (safetensors, incluye torres de visión/audio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en bfloat16; no se listan GGUF ni otras) |
| Idiomas soportados | inglés, japonés |
| Licencia | Apache 2.0 (heredada de Gemma 4) |
| Formato de pesos | safetensors (transformers) |

Datos adicionales del vocabulario y tamaño:

| Metrica | Original | Este modelo |
|---|---|---|
| Vocabulario | 262.144 | 164.224 |
| Parametros del modelo de texto | 4,65B | 3,62B (−22%) |
| Checkpoint (con torres visión/audio) | 10,25 GB | 8,19 GB |
| Estado AdamW de fine-tune completo (16 B/param) | 74,4 GB | 57,9 GB |
| Logits fp32 por lote de 16k tokens | 17,2 GB | 10,8 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google DeepMind con torres de visión y audio además del modelo de lenguaje. La innovación de esta variante no está en el entrenamiento —no hubo reentrenamiento— sino en la poda del vocabulario: se eliminan tokens de escrituras distintas a latino, kana y kanji japonés (cirílico, hangul, árabe, tailandés, devanagari, han simplificado), los placeholders `<unusedN>`, y palabras han multi-carácter y palabras latinas acentuadas que no aparecen en corpus de inglés/japonés (Wikipedia japonesa, KFTT, ParallelFiction, wikitext-103, FineWeb-Edu). En esta variante conservadora se mantienen todos los tokens ASCII, de modo que código, URLs y nombres tokenizan exactamente igual que en el original.

Se conservan siempre los tokens especiales y de control (chat, tool, image, audio), los 256 tokens de byte-fallback `<0xNN>`, kana, kanji individuales del repertorio cp932, puntuación, símbolos y emoji. El conjunto conservado es cerrado bajo fusiones BPE, por lo que el texto que originalmente usaba solo tokens conservados tokeniza de forma idéntica (con ids remapeados) y los logits sobre esos tokens son bit a bit idénticos a los del modelo original. El archivo `prune_manifest.json` contiene `keep_ids`, donde la entrada *i* es el id original del nuevo token *i*.

## Capacidades

- Generación de texto en inglés y japonés con calidad equivalente al modelo base (ver benchmarks).
- Razonamiento y matemáticas multilingües (evaluado con MGSM-en y MGSM-ja).
- Traducción en→ja y ja→en (evaluado con WMT24++).
- Entrada imagen-texto y audio: las torres están incluidas y los ids de placeholder remapeados, pero no se han probado.
- Tool calling y tokens de control de chat/tool conservados.
- Tokenización idéntica al original para código, URLs y nombres (todos los tokens ASCII se mantienen).
- Byte-fallback funcional para texto en escrituras eliminadas (aunque con calidad muy degradada).

## Casos de uso

- Fine-tune en japonés con presupuesto de memoria ajustado: el estado de AdamW baja de 74,4 GB a 57,9 GB, lo que permite hacer full fine-tune en GPUs de 80 GB donde el original no cabe con holgura.
- Despliegue en producción para atención al cliente bilingüe en/ja: el checkpoint de 8,19 GB cabe en una sola GPU consumer de 24 GB en bfloat16 y deja margen para KV cache.
- Traducción automática en→ja y ja→en: los resultados de WMT24++ son idénticos o casi idénticos al original, con un modelo un 20% más pequeño.
- Pipelines de código con comentarios en inglés: al conservarse todos los tokens ASCII, la tokenización de código no cambia, por lo que se puede usar como el base en tareas de generación de código sin recalibrar prompts.
- Reducción de coste de inferencia en lote: los logits fp32 por lote de 16k tokens pasan de 17,2 GB a 10,8 GB, lo que abarata el cálculo de métricas o el reranking sobre vocabulario completo.
- Investigación sobre poda de vocabularios: sirve como referencia reproducible (código en `gemma-4-pruned`) para estudiar el impacto de recortar vocabularios multilingües en modelos multimodales.
- Experimentos de destilación o adaptación a un tercer idioma: al haber liberado ~98k tokens de vocabulario, hay espacio para añadir tokens nuevos (previa repoda con `--keep-unused` o redimensionando embeddings).

## Benchmarks y rendimiento

Evaluación zero-shot con decodificación greedy. Entre paréntesis, la proporción de ejemplos en que la predicción u output es idéntico al original.

| Tarea | Original | Este modelo |
|---|---|---|
| MMLU (EN, 2.000 muestreados) | 56,95% | 56,95% (100% idénticas) |
| JCommonsenseQA (JA, 1.119) | 87,94% | 87,94% (100%) |
| MGSM-en (250) | 87,2% | 87,2% (100% idénticos) |
| MGSM-ja (250) | 63,6% | 63,2% (99,6%) |
| WMT24++ en→ja chrF (500) | 35,29 | 35,29 (99,2%) |
| WMT24++ ja→en chrF (500) | 50,42 | 50,42 (100%) |
| bits/byte EN (wikitext-103 test) | 1,7645 | 1,7648 |
| bits/byte JA (BSD test) | 1,2890 | 1,2882 |
| Documentos tokenizados idénticamente EN / JA | — | 94,4% / 100% |

Ninguna de las diferencias es estadísticamente significativa (los intervalos de confianza del 95% por bootstrap pareado incluyen 0). Fuera de alcance, como se pretendía: zh/ko/ru empeoran ×2–4 en bits-per-byte (byte fallback); de/fr/es empeoran un 10–14%.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~16,4 GB solo pesos (8,19 GB de checkpoint, más overhead de activaciones y KV cache).
- VRAM estimada en fp32: ~32,8 GB solo pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen para contexto moderado.
- Cabe en GPU consumer de 24 GB en bfloat16; en 16 GB requeriría cuantización, que el repo no publica.
- Opciones de despliegue: transformers (soporte nativo, `device_map="auto"`); no se han publicado pesos GGUF ni configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-enja (este) | 4,10B (3,62B texto) | no disponible | en, ja | Apache 2.0 | safetensors en HF |
| google/gemma-4-E2B-it (base) | 4,65B texto (10,25 GB) | no disponible | multilingüe (262k vocab) | Apache 2.0 | safetensors en HF |
| brishen/gemma-4-E2B-it-enja-aggr | no disponible (vocab 131.648) | no disponible | en, ja | Apache 2.0 | safetensors en HF |

La variante agresiva `-aggr` reduce el vocabulario a 131.648 tokens eliminando además palabras ASCII no vistas en corpus en/ja/código; a cambio, la tokenización de código y nombres deja de ser idéntica al original.

## Limitaciones y advertencias

- Solo se ha evaluado texto; las torres de visión y audio están incluidas y remapeadas pero no se han probado.
- Idiomas distintos de inglés y japonés se degradan bruscamente: zh/ko/ru empeoran ×2–4 en bits-per-byte, y de/fr/es un 10–14%.
- El texto en escrituras eliminadas sigue funcionando vía byte-fallback, pero con calidad muy inferior.
- Los tokens `<unusedN>` del original han desaparecido; para añadir tokens especiales nuevos hay que repodar con `--keep-unused` o redimensionar los embeddings.
- La tokenización idéntica solo se garantiza para documentos que originalmente usaban exclusivamente tokens conservados (94,4% en inglés, 100% en japonés en la evaluación).
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; se heredan los del modelo base.
- Licencia Apache 2.0 heredada de Gemma 4; conviene revisar el enlace de licencia de Google para condiciones adicionales de uso comercial.
- No se publican pesos cuantizados, por lo que el despliegue en GPUs de menos de 16 GB requiere cuantizar por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brishen/gemma-4-E2B-it-enja
- Variante agresiva: https://huggingface.co/brishen/gemma-4-E2B-it-enja-aggr
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Código de poda y evaluación: repositorio `gemma-4-pruned` (referenciado en la model card; no se proporciona URL directa)
