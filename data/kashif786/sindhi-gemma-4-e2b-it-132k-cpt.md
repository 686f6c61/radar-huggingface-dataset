# Kashif786/sindhi-gemma-4-E2B-it-132k-cpt

## Resumen

Sindhi-Gemma-4-E2B-it-132k-cpt es un checkpoint de preentrenamiento continuado (continual pretraining, CPT) de etapa 1 desarrollado por Kashif786 para adaptar el modelo multimodal `google/gemma-4-E2B-it` al sindhi. Parte de un modelo base de 5,10B parámetros multimodales con vocabulario de 262.144 tokens y lo transforma en un modelo de texto de 3,47B parámetros efectivos mediante una poda quirúrgica del 50% del vocabulario y de las modalidades no textuales (262.144 → 131.072), seguida de una extensión de 1.536 tokens BPE óptimos para la morfología del sindhi, alcanzando un vocabulario final de 132.608 tokens.

El modelo resuelve un problema concreto de eficiencia en lenguas de bajos recursos: el tokenizador original de Gemma 4 fragmenta el sindhi en exceso (fertilidad de 2,17 tokens por palabra en FLORES-200), lo que encarece la inferencia y reduce la ventana efectiva de contexto. Tras el CPT, la fertilidad baja a 1,60 tokens por palabra (+26,3% de compresión), lo que se traduce en un 37,3% más de palabras sindhis dentro de una ventana de 2.048 tokens para RAG.

Es relevante ahora porque demuestra una estrategia de "green AI" replicable para lenguas de bajos recursos: reducir el tamaño del modelo y adaptar el vocabulario antes de hacer fine-tuning, en lugar de escalar parámetros. El checkpoint está pensado como base para SFT (existe una etapa 2 publicada) y conserva capacidades en inglés, urdú y árabe. La arquitectura es un transformer decoder-only de 35 capas con `hidden_size=1536` y embeddings por capa (PLE), heredada de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), 35 capas, `hidden_size=1536`, con per-layer embeddings (PLE); texto únicamente tras la poda de modalidades |
| Parametros totales | 3.472.645.411 (3,47B) según safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card solo menciona ventanas de 2.048 tokens para RAG) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; compatible con cuantización estándar vía transformers/PEFT, sin formatos GGUF publicados) |
| Idiomas soportados | sindhi (sd), inglés (en), urdú (ur), árabe (ar) |
| Licencia | Gemma (términos de licencia de Google Gemma) |
| Formato de pesos | safetensors (BF16), `tie_word_embeddings=False` con `lm_head` explícito de 407 MB `[132608, 1536]` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 4 del checkpoint `google/gemma-4-E2B-it`: 35 capas, dimensión oculta de 1.536 y mecanismo de per-layer embeddings (PLE). La intervención principal es una poda quirúrgica del 50% del vocabulario y de las modalidades (visión y otras entradas multimodales eliminadas), pasando de 262.144 a 131.072 tokens base, más una extensión de 1.536 tokens BPE óptimos para el sindhi (tokenizador `Kashif786/gemma-4-132k-sindhi-optimal-tokenizer`). El resultado es un modelo de texto con vocabulario de 132.608 tokens.

El entrenamiento de etapa 1 consiste en un CPT con doble learning rate (Dual-LR) sobre el dataset `Kashif786/Sindhi-Wikipedia-Clean-CPT-2026`: 19.208 artículos de Wikipedia en sindhi, 17,51M tokens con el tokenizador de 132k, durante 2 épocas. El objetivo es alinear los 1.536 embeddings sindhis nuevos y los embeddings por capa con el espacio de representación multilingüe de Gemma 4, preservando la semántica de inglés, urdú y árabe. No se documenta uso de RLHF ni DPO en esta etapa; el checkpoint es una base para SFT, no un modelo conversacional final.

## Capacidades

- Generación de texto en sindhi, inglés, urdú y árabe.
- Modelado de lenguaje y continuación de texto (checkpoint CPT, no ajustado para instrucciones).
- Base para SFT: la model card indica que el fine-tuning sobre `Sindhi-Assistant-IFT-1500` produce el modelo conversacional `sindhi-gemma-4-E2B-it-132k-sft`.
- Tokenización eficiente del sindhi: fertilidad de 1,60 tokens/palabra en FLORES-200 frente a 2,17 del base.
- Capacidad de recuperación aumentada (RAG) en sindhi: 1.286 palabras por ventana de 2.048 tokens.
- Preservación multilingüe verificada mediante auditoría de olvido en FLORES-200, FLORES L24 MRR@10 y Belebele-900.
- Plantilla de chat disponible vía `apply_chat_template` (heredada del modelo instruct base).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: eliminadas en la poda de modalidades.

## Casos de uso

- Base para fine-tuning supervisado en sindhi: el checkpoint sirve como punto de partida para SFT sobre conversaciones, como demuestra la publicación de la etapa 2 sobre `Sindhi-Assistant-IFT-1500` (2.482 conversaciones).
- RAG sobre Wikipedia en sindhi: con 1.286 palabras por ventana de 2.048 tokens, permite incluir más pasajes recuperados por consulta, lo que se refleja en el resultado de `SD-WIKI-RAG-100` (57,21% F1) del modelo SFT derivado.
- Etiquetado morfológico y POS en sindhi: el modelo SFT derivado alcanza 57,80% en `UD_Sindhi-Isra` POS, por lo que el CPT es adecuado como base para tareas lingüísticas estructuradas.
- Traducción inglés → sindhi: el modelo derivado obtiene 33,81 ChrF++ sin fugas de la letra urdú Kaaf, lo que indica que el CPT preserva la separación entre sistemas de escritura.
- Despliegue en GPU de 8 GB: el modelo SFT derivado ocupa 6,49 GB en BF16 (frente a 9,54 GB del base), por lo que este checkpoint CPT es apto para entornos de borde con esa VRAM.
- Investigación en adaptación de vocabulario para lenguas de bajos recursos: el pipeline de poda + extensión BPE + CPT con doble LR es un caso de estudio reproducible para otras lenguas con tokenizadores ineficientes.
- Evaluación de olvido multilingüe: la auditoría de 5 pilares (BPB, MRR, Belebele) del modelo derivado permite usar este checkpoint como referencia para estudiar la retención de inglés, urdú y árabe tras la adaptación.

## Benchmarks y rendimiento

| Métrica | `google/gemma-4-E2B-it` (262k) | `sindhi-gemma-4-E2B-it-132k-cpt` (este modelo) | `sindhi-gemma-4-E4B-it-132k-cpt` (referencia E4B) |
|---|---|---|---|
| Fertilidad sindhi FLORES-200 (tokens/palabra) | 2,17 (54.916 tokens) | 1,60 (40.479 tokens, +26,3% compresión) | 1,60 |
| Palabras sindhis en ventana de 2.048 tokens | 936 | 1.286 (+37,3%) | 1.286 |
| Perplejidad a nivel de palabra en sindhi tras CPT | — | 8,339 | 5,536 |
| Tamaño safetensors BF16 | ~10,2 GB | 6,95 GB (6.945.353.686 bytes) | 11,48 GB (`lm_head` atado) |

Resultados del modelo SFT derivado (`sindhi-gemma-4-E2B-it-132k-sft`) frente al base de Google de 5,10B, según la model card:

| Tarea | Modelo SFT derivado | Base Google 5,10B | Diferencia |
|---|---|---|---|
| Lite-QA-80 (F1) | 67,97% | 55,96% | +12,01% |
| SD-WIKI-RAG-100 (F1) | 57,21% | 53,98% | no indicada |
| UD_Sindhi-Isra POS | 57,80% | 45,00% | +12,80% |
| EN → SD ChrF++ | 33,81 | 31,98 | +1,83 (0 fugas de Kaaf urdú) |

Auditoría de olvido del modelo SFT derivado: BPB FLORES-200 EN 1,72 → 1,27; UR 1,55 → 1,49; AR 1,43 → 1,24; SD 2,05 → 1,32. FLORES L24 MRR@10 EN↔SD 27,11 → 54,45%; UR↔SD 68,17 → 87,94%. Belebele-900: EN +13,77%, UR +5,89%, AR +7,55%, SD +2,56%.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 6,95 GB de pesos (el checkpoint SFT derivado reporta 6,49 GB de pico en BF16).
- Cabe en GPU de consumo de 8 GB (por ejemplo, RTX 3070/4060 Ti de 8 GB) según los datos del modelo SFT derivado.
- GPU recomendadas: RTX 3090/4090, A100, H100 para entrenamiento o fine-tuning; GPU de 8 GB para inferencia.
- Despliegue: `transformers` con `attn_implementation="sdpa"` y `dtype=torch.bfloat16`; la model card no documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el modelo SFT derivado reporta 18,27 palabras/s frente a 12,50 del base (1,46× más rápido) y −27,7% de energía por palabra; no hay cifras de throughput para este checkpoint CPT.
- Precaución de entorno: en transformers 5.24+ sin torchao compatible, la model card recomienda `sys.modules["torchao"] = None`.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Kashif786/sindhi-gemma-4-E2B-it-132k-cpt` (este) | 3,47B | 132.608 | no disponible | Gemma | Hugging Face, 67 descargas |
| `google/gemma-4-E2B-it` (base) | 5,10B (multimodal) | 262.144 | no disponible | Gemma | Hugging Face |
| `Kashif786/sindhi-gemma-4-E4B-it-132k-cpt` | no disponible (42 capas, `h=2560`) | 132.608 | no disponible | Gemma | Hugging Face |
| `Kashif786/sindhi-gemma-4-E2B-it-132k-sft` (etapa 2) | 3,47B | 132.608 | no disponible | Gemma | Hugging Face |

Frente al base de Google, este checkpoint reduce el tamaño de pesos de ~10,2 GB a 6,95 GB, mejora la compresión del sindhi un 26,3% y multiplica por 1,37 la capacidad de palabras en ventana de 2.048 tokens. Frente a la variante E4B, la perplejidad en sindhi es peor (8,339 frente a 5,536), lo que refleja el compromiso entre tamaño y precisión. La comparación con modelos de otros desarrolladores para sindhi no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de CPT, no un modelo conversacional: no está ajustado para seguir instrucciones ni para uso directo en chat sin SFT previo.
- Token glitch conocido: se recomienda pasar `suppress_tokens=[131440]` para evitar la duplicación espuria `'ڻڻ'`; los verbos válidos `آڻڻ` y `کڻڻ` se representan con tokens de palabra completa (132062 y 132339).
- PEFT LoRA: no usar `target_modules="all-linear"` (incompatible con `Gemma4ClippableLinear`); especificar `["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]`.
- Pesos con `tie_word_embeddings=False`: el checkpoint almacena un `lm_head` explícito de 407 MB además de `embed_tokens`, lo que incrementa el tamaño en disco y puede requerir ajuste al cargar.
- Perplejidad en sindhi de 8,339, notablemente superior a la variante E4B (5,536): menor calidad de modelado en tareas exigentes.
- Riesgo de alucinación: no cuantificado en la información disponible; el corpus de CPT son 19.208 artículos de Wikipedia, lo que limita la cobertura de dominios.
- Sesgos: no documentados; el corpus de Wikipedia en sindhi puede introducir sesgos de cobertura y de registro enciclopédico.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google Gemma, que incluyen restricciones de uso aceptable; revisar antes de desplegar en producción.
- Idiomas: solo se documentan sd, en, ur y ar; no hay datos de rendimiento en otras lenguas tras la poda de vocabulario.
- Longitud de contexto nativa no especificada: la model card solo aporta cifras para ventanas de 2.048 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kashif786/sindhi-gemma-4-E2B-it-132k-cpt
- Modelo base de Google: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint base parchado: https://huggingface.co/Kashif786/sindhi-gemma-4-E2B-it-132k-patched
- Tokenizador sindhi óptimo: https://huggingface.co/Kashif786/gemma-4-132k-sindhi-optimal-tokenizer
- Dataset de CPT: https://huggingface.co/datasets/Kashif786/Sindhi-Wikipedia-Clean-CPT-2026
- Dataset de SFT: https://huggingface.co/datasets/Kashif786/Sindhi-Assistant-IFT-1500
- Modelo SFT etapa 2 (edge, 3,47B): https://huggingface.co/Kashif786/sindhi-gemma-4-E2B-it-132k-sft
- Modelo SFT etapa 2 (flagship, 5,74B): https://huggingface.co/Kashif786/sindhi-gemma-4-E4B-it-132k-sft
