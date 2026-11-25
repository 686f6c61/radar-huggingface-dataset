# Kashif786/sindhi-gemma-4-E4B-it-132k-sft

## Resumen

Sindhi-Gemma-4-E4B-it-132k-sft es un modelo de lenguaje causal de 5.738.630.186 parámetros (5,74B) especializado en sindhi, desarrollado por el usuario Kashif786 sobre `google/gemma-4-E4B-it`. El modelo aplica un pipeline propio denominado Prune → Extend → De-Collide → Ground: poda quirúrgica de vocabulario y de la torre multimodal del Gemma original (de 262.144 a 132.608 tokens, eliminando 2,20B parámetros, un 27,7%), extensión con 1.536 tokens BPE específicos de sindhi inicializados mediante Position-Weighted Subword Pooling, y un entrenamiento en dos fases (continual pretraining sobre Wikipedia en sindhi y SFT sobre un dataset de asistente de 2.482 conversaciones).

El objetivo declarado es cubrir tareas de RAG fundamentado en sindhi, QA extractiva y multi-hop, etiquetado POS con dependencias universales, clasificación temática y traducción bidireccional inglés-sindhi, con un foco explícito en eficiencia (green AI): el autor reporta una reducción del 27,8% de VRAM en BF16 y un 37,3% menos de energía por palabra frente al Gemma-4-E4B-it de referencia.

Es relevante porque aborda un idioma de bajos recursos con un modelo compacto que cabe en una sola GPU de 48 GB en BF16 (10,73 GB de pico) y que, según la model card, supera al modelo base de Google en todas las suites evaluadas (Belebele, SIB-200, SdQuAD, POS UD, traducción EN→SD y SD→EN). La información disponible procede íntegramente de la model card del autor; no se han verificado de forma independiente los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 (gemma4_text); 42 capas, hidden_size=2560; torre multimodal podada |
| Parametros totales | 5.738.630.186 (5,74B) |
| Parametros activos | no disponible (no se indica que sea MoE; el nombre E4B no se documenta como mezcla de expertos en la informacion disponible) |
| Longitud de contexto | no disponible (la model card no declara la ventana de contexto del modelo final; el modelo base se describe con vocabulario de 262.144 y 42 capas, sin cifra de contexto) |
| Tipos de cuantizacion | no disponible (solo se documenta inferencia nativa en bfloat16; no se listan GGUF, AWQ, GPTQ ni otras) |
| Idiomas soportados | sd (sindhi), en (ingles), ur (urdu), ar (arabe) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` (7,94B multimodales / 7,46B solo texto, vocabulario de 262.144, 42 capas, hidden_size=2560). La primera fase del pipeline reduce el vocabulario de 262.144 a 131.072 tokens y añade 1.536 tokens BPE de sindhi (total 132.608), con inicialización mediante Position-Weighted Subword Pooling para evitar colisiones de anagramas invariantes al orden. Además se neutraliza el glitch token ID 131440 ('ڻڻ') con norma 0,20x y `suppress_tokens=[131440]`. El resultado son 5,74B parámetros, un 27,7% menos que el baseline.

El entrenamiento consta de dos etapas. La etapa 1 es un continual pretraining con doble learning rate sobre el corpus `Kashif786/Sindhi-Wikipedia-Clean-CPT-2026`, que según el autor reduce la perplejidad a nivel de palabra en sindhi de 2.467,305 a 5,536 (frente a 8,339 del E2B-132k). La etapa 2 es el SFT v2 que produce este modelo, sobre `Kashif786/Sindhi-Assistant-IFT-1500` (2.482 conversaciones), ejecutado en una NVIDIA L40S de 48 GB en 88,1 minutos, con 26,52 GB de VRAM de pico en entrenamiento, `train_loss=1.6630` y `best_eval_loss=1.3870`. Durante el SFT se descongelan selectivamente solo los embeddings de los tokens nuevos (`base_vocab_max_diff = 0.000000` sobre los 131.072 tokens base EN/UR/AR) y se re-atan explícitamente `lm_head` y `embed_tokens` (`tie_word_embeddings=True`). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en sindhi, con soporte secundario de inglés, urdu y árabe.
- RAG fundamentado: respuesta con citas (`[حوالو]`) y abstención explícita ante preguntas no respondibles a partir del contexto.
- QA extractiva y multi-hop sobre pasajes en sindhi.
- Etiquetado POS con el esquema Universal Dependencies (15 etiquetas estrictas y variante fusionada).
- Clasificación temática de documentos (7 clases, suite SIB-200).
- Traducción automática bidireccional EN ↔ SD.
- Comprensión lectora de opción múltiple (formato Belebele).
- Tokenizador optimizado para sindhi: fertilidad de 1,60 tokens/palabra en FLORES-200 frente a 2,17 del base.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible; la torre multimodal del modelo base fue podada.

## Casos de uso

- RAG documental en sindhi: indexación de artículos de Wikipedia y corpus locales con el tokenizador de 132.608 tokens, que ofrece un 37,3% más de capacidad efectiva por ventana de 2.048 tokens; el modelo responde con citas y se abstiene cuando el contexto no contiene la respuesta (10/10 en abstención verdadera según el autor).
- Asistente conversacional en sindhi: atención multi-turno sobre el dataset de SFT de 2.482 conversaciones, adecuado para interfaces de chat de baja latencia (18,19 palabras/s en L40S BF16).
- Anotación lingüística automatizada: preetiquetado POS con Universal Dependencies para corpus de sindhi, con 69,80% de precisión estricta en 15 etiquetas reportada en UD_Sindhi-Isra POS-500, útil como paso previo a revisión humana.
- Traducción EN→SD y SD→EN en pipelines editoriales: ChrF++ de 42,84 y BLEU de 15,18 en EN→SD, y ChrF++ de 55,15 en SD→EN sobre 110 frases de evaluación, con 99,35% de pureza de escritura (sin caracteres urdu-kaaf).
- Clasificación y enrutado de contenido: categorización temática de noticias o documentos sindhi en 7 clases con 86,76% de accuracy en SIB-200, integrable como clasificador previo a un sistema de recuperación.
- Evaluación educativa: resolución de preguntas de comprensión lectora de opción múltiple en sindhi (67,44% en Belebele-900), aplicable a plataformas de autoaprendizaje.
- Despliegue en hardware limitado: con 10,73 GB de pico en BF16 cabe en GPU de 24-48 GB, lo que permite servir el modelo en una única L40S o A100 40GB sin sharding.

## Benchmarks y rendimiento

Resultados reportados por el autor, ejecutados en NVIDIA L40S (48 GB) en bfloat16 con decodificación greedy, comparados con `google/gemma-4-E4B-it`:

| Suite | Metrica | Gemma-4-E4B-it (7,94B) | Sindhi-Gemma-4-E4B-it-132k-sft (5,74B) |
|---|---|---|---|
| Hardware / Green AI | VRAM pico BF16 | 14,849 GB | 10,726 GB |
| Hardware / Green AI | Throughput / energia | 11,83 w/s / 14,46 J/word | 18,19 w/s / 9,06 J/word |
| Tokenizer FLORES-200 | Fertilidad sindhi | 2,17 T/W | 1,60 T/W |
| Lite-QA-80 (8 tareas) | Token F1 / ChrF++ / Recall | 61,19% / 56,15 / 73,75% | 74,02% / 69,33 / 93,75% |
| SD-WIKI-RAG-100 | F1 / ChrF++ | 53,80% / 45,37 | 62,79% / 54,77 |
| SdQuAD-100 | F1 / ChrF++ | 44,88% / 44,15 | 48,63% / 48,39 |
| SdQuAD oficial (N=1.860) | F1 global / F1 sindhi limpio | 22,71% / 22,76% | 26,09% / 26,94% |
| Belebele-900 (sindhi) | Accuracy 4 opciones | 65,56% | 67,44% |
| SIB-200 (sindhi) | Accuracy / Macro-F1 | 84,31% / 82,84% | 86,76% / 85,73% |
| UD_Sindhi-Isra POS-500 | Estricto 15 tags / Macro-F1 | 59,60% / 55,57% | 69,80% / 63,53% |
| Traduccion EN→SD (110) | ChrF++ / BLEU | 38,86 / 12,86 | 42,84 / 15,18 |
| Traduccion SD→EN (110) | ChrF++ | 54,36 | 55,15 |
| Juicio ciego 100 preguntas | Victorias / nota media (1-5) | 29 / 3,41 | 55 / 3,81 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible. Los datos anteriores proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM de inferencia en BF16: 10,73 GB de pico (10,689 GB estáticos), según medición del autor en L40S.
- VRAM de entrenamiento: 26,52 GB de pico en el SFT v2 sobre L40S de 48 GB.
- GPU recomendadas: NVIDIA L40S (48 GB), A100 40GB/80GB, H100; cualquier GPU con al menos 16-24 GB para BF16 con margen.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16; en GPUs de 16 GB requeriría cuantización, para la cual no se documentan pesos disponibles.
- Opciones de despliegue: transformers (librería declarada); la model card recomienda aplicar `sys.modules["torchao"] = None` en entornos con transformers 5.24+ sin torchao compatible. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 18,19 palabras/s en sindhi sobre L40S BF16 (1,54x frente al base) y 2,69x de velocidad en la suite SdQuAD oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Sindhi-Gemma-4-E4B-it-132k-sft | 5,74B | no disponible | gemma | Especializado en sindhi; VRAM BF16 10,73 GB |
| google/gemma-4-E4B-it | 7,94B (multimodal) / 7,46B texto | no disponible | gemma | Modelo base; VRAM BF16 14,849 GB; peor rendimiento en sindhi segun el autor |
| Kashif786/sindhi-gemma-4-E4B-it-132k-cpt | no disponible (mismo linaje, etapa CPT) | no disponible | gemma | Checkpoint intermedio de continual pretraining, sin SFT |
| Kashif786/sindhi-gemma-4-E2B-it-132k (mencionado como E2B-132k) | no disponible | no disponible | gemma | Variante menor citada con perplejidad de 8,339 en held-out |

No se dispone de datos de otros modelos especializados en sindhi en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- Todos los benchmarks proceden de la model card del autor, sin verificación independiente; deben tratarse como indicativos.
- El modelo está especializado en sindhi y podría degradar su rendimiento en inglés, urdu o árabe respecto al Gemma base, aunque el autor reporta cero fugas de idioma extranjero en el juicio ciego.
- Riesgo de alucinación inherente a modelos de 5,74B; el autor mitiga con abstención entrenada, pero no hay garantía fuera de los dominios evaluados.
- El glitch token ID 131440 ('ڻڻ') se neutraliza parcialmente; la model card recomienda `suppress_tokens=[131440]` en producción.
- La longitud de contexto del modelo final no se declara; no debe asumirse la del Gemma base sin verificación.
- No se documentan pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en GPUs de menos de 16 GB.
- La licencia es Gemma Terms of Use, con las restricciones de uso comercial y de redistribución que impone Google; revisar antes de uso en producción.
- El pipeline de poda elimina la torre multimodal: no hay capacidades de visión pese al origen en un modelo multimodal.
- El modelo tiene 38 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni auditorías externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kashif786/sindhi-gemma-4-E4B-it-132k-sft
- Checkpoint de continual pretraining: https://huggingface.co/Kashif786/sindhi-gemma-4-E4B-it-132k-cpt
- Dataset de pretraining: https://huggingface.co/datasets/Kashif786/Sindhi-Wikipedia-Clean-CPT-2026
- Dataset de SFT: https://huggingface.co/datasets/Kashif786/Sindhi-Assistant-IFT-1500
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
