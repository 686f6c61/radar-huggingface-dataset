# brishen/gemma-4-E2B-it-enja-aggr

## Resumen

gemma-4-E2B-it-enja-aggr es una variante del modelo multimodal google/gemma-4-E2B-it de Google DeepMind, publicada por el usuario brishen en HuggingFace. No se trata de un reentrenamiento ni de un fine-tune: es una poda de vocabulario (vocabulary pruning) aplicada sobre los pesos originales, que reduce la tabla de tokens de 262.144 a 131.648 (−50%) conservando únicamente los tokens relevantes para inglés y japonés, además de tokens especiales, de control y de fallback de bytes.

El modelo base Gemma 4 E2B es un modelo any-to-any (texto, imagen y audio) con una tabla de embeddings por capa de 262.144 × 8.960, lo que convierte el vocabulario en aproximadamente la mitad de los parámetros del modelo de texto. Al eliminar los tokens no usados, el checkpoint pasa de 10,25 GB a 7,51 GB y los parámetros del modelo de texto bajan de 4,65B a 3,28B (−30%), mientras que el total real registrado en safetensors es de 3.753.492.035 parámetros.

La relevancia de esta ficha radica en que demuestra una técnica de compresión poco habitual: reducir el tamaño del modelo sin tocar los pesos ni reentrenar, manteniendo una equivalencia funcional casi exacta en los idiomas objetivo. Los benchmarks publicados por el autor muestran diferencias no significativas estadísticamente en MMLU, JCommonsenseQA, MGSM y WMT24++ para inglés y japonés. Es una opción interesante para despliegues en producción orientados a esos dos idiomas con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) del linaje Gemma 4; incluye torres de visión y audio |
| Parametros totales | 3.753.492.035 (checkpoint completo con torres de visión y audio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, dtype bfloat16 en el ejemplo de uso) |
| Idiomas soportados | en, ja (el resto degrada drasticamente) |
| Licencia | apache-2.0 (heredada de Gemma 4; ver enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es una poda de vocabulario sobre google/gemma-4-E2B-it, sin reentrenamiento. La model card indica que los pesos son idénticos a los del original salvo por la eliminación de filas en las tablas de embeddings: la tabla de embeddings por capa (262.144 × 8.960) y la tabla de entrada/salida (262.144 × 1.536). Cada token eliminado ahorra 10.496 parámetros, lo que explica la reducción del 30% en parámetros del modelo de texto.

El conjunto de tokens conservados se construyó a partir de corpus en inglés y japonés (Japanese Wikipedia, KFTT, ParallelFiction, wikitext-103, FineWeb-Edu), y en esta variante agresiva también se conservan tokens ASCII multiletra solo si aparecen en corpus de inglés, japonés o código (The Stack smol-xl, 24 lenguajes). Se eliminan tokens de escrituras distintas al latín, kana y kanji japonés (cirílico, hangul, árabe, tailandés, devanagari, han simplificado), los placeholders `<unusedN>` y palabras latinas acentuadas o han multichar que no aparecen en los corpus. Se conservan siempre tokens especiales y de control (chat, tool, imagen, audio), los 256 tokens de fallback de bytes `<0xNN>`, kana, kanji individuales del repertorio cp932, puntuación, símbolos y emoji. El conjunto conservado es cerrado bajo merges BPE, de modo que el texto que originalmente usaba solo tokens conservados se tokeniza de forma idéntica con ids remapeados, y los logits sobre tokens conservados son bit-idénticos a los del modelo original. El manifiesto `prune_manifest.json` incluye `keep_ids`, donde la entrada *i* es el id original del nuevo token *i*.

## Capacidades

- Generación de texto y razonamiento en inglés y japonés, con paridad funcional casi exacta respecto al modelo base en esos idiomas.
- Capacidades multimodales heredadas del modelo base: entrada de imagen y audio (torres incluidas sin cambios y placeholders remapeados en `config.json`), aunque no han sido probadas por el autor.
- Soporte de tool calling y tokens de control de chat, herramientas, imagen y audio (conservados explícitamente en el vocabulario podado).
- Razonamiento multilingüe limitado a en/ja; otros idiomas degradan drásticamente.
- Traducción en→ja y ja→en con calidad prácticamente idéntica al original según WMT24++.
- Razonamiento matemático (MGSM) en inglés y japonés.
- Tokenización idéntica al original para texto que solo usa tokens conservados (70,8% de documentos en inglés, 100% en japonés).
- Round-trip mediante byte fallback para texto en escrituras eliminadas, con calidad muy inferior.

## Casos de uso

- Asistente conversacional en inglés y japonés: el modelo mantiene la plantilla de chat y el procesador del original, por lo que puede desplegarse como sustituto directo en aplicaciones de atención al cliente bilingües en/ja con menor huella de memoria.
- Traducción automática en/ja en producción: los resultados de WMT24++ (chrF 35,27 en→ja y 50,39 ja→en) son indistinguibles del original, lo que permite usar el modelo podado en pipelines de traducción sin pérdida medible de calidad.
- Generación de código asistida en entornos en/ja: al conservar tokens ASCII vistos en corpus de código (The Stack smol-xl), el modelo mantiene la capacidad de generar identificadores y sintaxis de programación, aunque palabras raras en inglés pueden fragmentarse en tokens más pequeños.
- Despliegue en hardware con VRAM limitada: la reducción del checkpoint de 10,25 GB a 7,51 GB y del estado AdamW completo de 74,4 GB a 52,4 GB facilita el fine-tune y la inferencia en GPUs de gama alta de consumo o en nodos con menos memoria.
- Procesamiento por lotes con contexto largo: los logits en fp32 para un lote de 16k tokens pasan de 17,2 GB a 8,6 GB, lo que reduce el coste de memoria en inferencia de lotes grandes.
- Fine-tune específico para en/ja: el menor estado del optimizador (52,4 GB frente a 74,4 GB) abarata el ajuste completo del modelo en tareas verticales (legal, médico, atención al cliente) en esos dos idiomas.
- Sustitución directa en pipelines existentes de Gemma 4 E2B: al conservar chat template y processor config, se puede integrar sin cambios en aplicaciones que ya usan el modelo base y solo operan en en/ja.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (zero-shot, decodificación greedy; entre paréntesis, porcentaje de predicciones idénticas al original):

| Tarea | Original | Este modelo |
|---|---|---|
| MMLU (EN, 2.000 muestras) | 56,95% | 56,85% (99,0% idénticas) |
| JCommonsenseQA (JA, 1.119) | 87,94% | 87,94% (100%) |
| MGSM-en (250) | 87,2% | 88,0% (83,6% idénticas) |
| MGSM-ja (250) | 63,6% | 63,2% (99,6%) |
| WMT24++ en→ja chrF (500) | 35,29 | 35,27 (86,4%) |
| WMT24++ ja→en chrF (500) | 50,42 | 50,39 (95,0%) |
| bits/byte EN (wikitext-103 test) | 1,7645 | 1,7675 |
| bits/byte JA (BSD test) | 1,2890 | 1,2882 |
| Documentos tokenizados idénticamente EN / JA | — | 70,8% / 100% |

El autor indica que ninguna de las diferencias es estadísticamente significativa (los intervalos de confianza del 95% por bootstrap pareado incluyen 0). Fuera del alcance previsto: zh/ko/ru empeoran ×2–4 en bits-per-byte (por el byte fallback) y de/fr/es +35–39%.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en bfloat16 ocupa 7,51 GB, por lo que la inferencia en precisión nativa requiere aproximadamente 8 GB de VRAM más el espacio para el contexto y los estados de activación.
- GPU recomendadas: para el checkpoint completo, una RTX 4090 (24 GB) o superior; para despliegues con mayor contexto o lotes, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8–12 GB de VRAM para el checkpoint en bfloat16, dependiendo de la longitud de contexto.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM` y `AutoTokenizer`, `dtype="bfloat16"`, `device_map="auto"`). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.
- Fine-tune completo: el estado AdamW con 16 bytes por parámetro requiere 52,4 GB, frente a 74,4 GB del original.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brishen/gemma-4-E2B-it-enja-aggr | 3.753.492.035 | no disponible | en, ja | apache-2.0 | HuggingFace (30 descargas) |
| brishen/gemma-4-E2B-it-enja | no disponible (variante conservadora, 164.224 tokens) | no disponible | en, ja | apache-2.0 | HuggingFace |
| google/gemma-4-E2B-it | 4,65B (modelo de texto, según model card) | no disponible | multilingüe | apache-2.0 / Gemma 4 license | HuggingFace |

La variante conservadora `brishen/gemma-4-E2B-it-enja` mantiene 164.224 tokens, conserva todos los tokens ASCII y es, según el autor, la opción por defecto más segura. El modelo original `google/gemma-4-E2B-it` conserva el vocabulario completo de 262.144 tokens y soporta más idiomas, a costa de un checkpoint de 10,25 GB y 4,65B parámetros de texto.

## Limitaciones y advertencias

- Solo se evaluó texto: las torres de visión y audio están incluidas sin cambios y sus placeholders remapeados en `config.json`, pero las entradas de imagen y audio no han sido probadas.
- Idiomas distintos del inglés y el japonés degradan drásticamente; zh/ko/ru empeoran ×2–4 en bits-per-byte y de/fr/es +35–39%.
- Los tokens `<unusedN>` originales han sido eliminados; para añadir nuevos tokens especiales hay que podar con `--keep-unused` o redimensionar los embeddings.
- Las palabras raras en inglés y los identificadores poco frecuentes ahora se fragmentan en tokens más pequeños, lo que puede afectar a tareas de código con vocabulario inusual.
- El texto en escrituras eliminadas sigue funcionando mediante byte fallback, pero con calidad muy inferior.
- Riesgo de alucinación: no se documenta específicamente en la información disponible; se hereda el comportamiento del modelo base.
- Sesgos conocidos: no se documentan en la información disponible.
- Restricciones de licencia: apache-2.0 heredada de Gemma 4, con enlace a la licencia específica de Gemma 4; conviene revisar los términos de esa licencia para uso comercial.
- Modelo con muy poca adopción (30 descargas, 0 likes) y publicado en 2026-10-30; no hay evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/brishen/gemma-4-E2B-it-enja-aggr
- Variante conservadora: https://huggingface.co/brishen/gemma-4-E2B-it-enja
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de poda y evaluación: `gemma-4-pruned` (referenciado en la model card, sin URL directa en la información disponible)
