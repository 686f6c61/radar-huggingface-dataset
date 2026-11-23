# kiwi-farm/kiwi-coco-lm-base

## Resumen

Kiwi COCO-LM es un modelo encoder de tipo transformer basado en ModernBERT-base, desarrollado por el autor kiwi-farm. Se trata de un modelo de representaciones (feature-extraction) y masked language modeling adaptado al coreano y al inglés, con una ventana de contexto de hasta 8192 tokens. El modelo parte de los pesos de answerdotai/ModernBERT-base y aplica un reajuste del vocabulario: elimina tokens multilingües de baja frecuencia y los sustituye por tokens coreanos, para después continuar el preentrenamiento sobre corpus coreano e inglés.

La innovación principal es la aplicación de la metodología COCO-LM (arXiv:2102.08473) al preentrenamiento de ModernBERT. Frente al Replaced Token Detection (RTD) de ELECTRA, que solo discrimina si un token fue sustituido, COCO-LM añade Corrective Language Modeling (CLM), que obliga a reconstruir el token original, y Sequence Contrastive Learning (SCL), que aprende representaciones a nivel de secuencia. El repositorio publica el Discriminator (22 capas, 161 millones de parámetros); el Generator (6 capas, 80 millones) se distribuye en un repositorio aparte.

Con 161.418.496 parámetros reales según safetensors y un tamaño de repositorio de 0,3 GB, el modelo resulta relevante para tareas de comprensión del lenguaje, clasificación, NER, QA extractiva y recuperación de información en contextos bilingües coreano-inglés, donde los encoders angloparlantes estándar rinden muy por debajo. Su licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), atención bidireccional con RoPE y Flash Attention 2 |
| Parametros totales | 161.418.496 (incluye embeddings de 64k × 768, unos 49M, y cabezas RTD/SCL de preentrenamiento de unos 1,3M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones específicas; al ser un encoder de 161M es viable en fp16/bf16 e int8) |
| Idiomas soportados | coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 22 capas con dimensión oculta 768 y vocabulario de 64.000 tokens mediante Byte-level BPE, heredado de ModernBERT-base. ModernBERT sustituye las positional embeddings absolutas por RoPE, usa atención alternada local/global y está diseñado para aprovechar Flash Attention 2. El vocabulario se modificó respecto al original: se retiraron tokens multilingües poco frecuentes y se añadieron 26.858 tokens que contienen hangul (41,97 % del vocabulario), lo que reduce el número de tokens por palabra en coreano a 2,37 y elimina los tokens UNK en las 16 sílabas raras evaluadas.

El preentrenamiento adicional sigue el esquema COCO-LM sobre corpus coreano e inglés. Un Generator de 6 capas y 80M parámetros genera sustituciones verosímiles; el Discriminator (este repositorio) se entrena con tres objetivos: RTD (detectar tokens sustituidos), CLM (reconstruir el token original) y SCL (contraste a nivel de secuencia). El autor no detalla el número exacto de tokens de entrenamiento ni la composición del dataset más allá de indicar que es bilingüe coreano-inglés. No se documenta RLHF ni DPO, algo esperable en un encoder.

## Capacidades

- Extracción de embeddings de frase y de token (pipeline `feature-extraction`), con embedding `[CLS]` disponible para representaciones de secuencia.
- Clasificación de secuencias, etiquetado de tokens (NER), QA extractiva y recuperación de información tras fine-tuning, igual que cualquier modelo BERT.
- Comprensión de contexto largo: hasta 8192 tokens en una sola pasada, útil para documentos extensos.
- Bilingüe coreano-inglés, con tokenizador optimizado para hangul.
- Masked language modeling solo en el sentido de corrección de ruido (CLM); no es adecuado para `fill-mask` clásico con `[MASK]`.
- No soporta tool calling, function calling, agentes ni generación autoregresiva: es un encoder, no un modelo causal.
- No tiene visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Clasificación de textos coreanos en producción: fine-tuning con `AutoModelForSequenceClassification` sobre reseñas, tickets o noticias; el vocabulario ampliado en hangul reduce la longitud de secuencia y el coste de inferencia frente a encoders multilingües genéricos.
- Reconocimiento de entidades nombradas (NER) en coreano: el modelo obtiene 84,44 de MacroF1 de entidad y 93,02 de MacroF1 de carácter en KLUE-NER, por encima de KLUE RoBERTa y KoELECTRA, lo que lo hace apto para extracción de entidades en pipelines de datos.
- Búsqueda semántica y recuperación bilingüe coreano-inglés: usar los embeddings `[CLS]` o mean-pooling para indexar documentos y consultas; el contexto de 8192 tokens permite indexar pasajes largos sin truncar.
- Question answering extractiva sobre documentación técnica: fine-tuning en KLUE-MRC alcanza 71,38 EM y 77,00 RougeW, adecuado para asistentes de soporte sobre manuales.
- Moderación y filtrado de contenido: clasificación multietiqueta de comentarios en coreano e inglés con un encoder de 161M que cabe en una sola GPU consumer.
- Deduplicación y clustering de documentos: SCL entrena representaciones de secuencia discriminativas, útiles para agrupar documentos similares en corpus bilingües.
- Reranking en sistemas RAG: puntuar pares consulta-pasaje con la cabeza de clasificación para reordenar candidatos recuperados por un retriever vectorial.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (tamaño Base). KLUE, media de tareas: 82,34 para Kiwi COCO-LM.

| Modelo | KLUE Avg | GLUE Avg | KLUE-NLI (Acc) | KLUE-STS (PearsonR) | GLUE CoLA (MCC) | GLUE RTE (Acc) |
|---|---|---|---|---|---|---|
| Kiwi COCO-LM | 82,34 | 83,02 | 87,87 | 92,23 | 61,16 | 83,03 |
| KLUE RoBERTa | 80,44 | 70,75 | 85,63 | 92,68 | 4,45 | 63,54 |
| KoELECTRA | 77,79 | 69,49 | 87,23 | 93,13 | 11,84 | 62,09 |
| A.X-Encoder | 82,91 | 74,99 | 87,37 | 92,58 | 24,23 | 66,07 |
| KF-DeBERTa | 82,89 | 71,34 | 87,73 | 92,63 | 9,25 | 63,18 |
| ModernBERT (base original) | 62,36 | 80,30 | 67,40 | 76,63 | 61,92 | 66,43 |
| mmBERT | 79,33 | 81,01 | 83,30 | 90,51 | 60,79 | 80,14 |

En GLUE, Kiwi COCO-LM lidera la media (83,02) y supera a ModernBERT original en MRPC (90,93 / 93,47), STS-B (91,00 / 90,79) y RTE (83,03), aunque queda por debajo en SST2 (93,01 frente a 95,30), CoLA (61,16 frente a 61,92), QQP y MNLI. En KLUE, el modelo mejora a KLUE RoBERTa y KoELECTRA en la media, pero A.X-Encoder y KF-DeBERTa quedan ligeramente por encima en algunas tareas (KLUE-NER y KLUE-MRC respectivamente).

## Requisitos de hardware

- VRAM estimada: unos 0,65 GB en fp16/bf16 para los pesos (161M parámetros), más activaciones; en la práctica, 2-4 GB permiten inferencia con batch moderado y contexto largo.
- GPU recomendadas: cualquier GPU con al menos 8 GB para contexto completo; RTX 3060/4060, RTX 4090, A100 y H100 funcionan sin problema. Para batches grandes o 8192 tokens, se recomienda 16 GB o más.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 6-8 GB o más, incluidas portátiles.
- Despliegue: transformers (v5 o superior), Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference` y `endpoints_compatible`), y exportación a ONNX o cuantización int8 para CPU. No se documenta soporte GGUF ni llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada. Se recomienda instalar `flash-attn` para aprovechar Flash Attention 2, según indica el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLUE Avg | GLUE Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kiwi COCO-LM | 161M | 8192 | 82,34 | 83,02 | Apache 2.0 | Hugging Face |
| KLUE RoBERTa | ~110M (base) | 512 | 80,44 | 70,75 | Apache 2.0 | Hugging Face |
| KoELECTRA | ~110M (base) | 512 | 77,79 | 69,49 | Apache 2.0 | Hugging Face |
| A.X-Encoder | ~110M (base) | 512 | 82,91 | 74,99 | no disponible | Hugging Face |
| KF-DeBERTa | ~110M (base) | 512 | 82,89 | 71,34 | no disponible | Hugging Face |
| ModernBERT-base | 149M | 8192 | 62,36 | 80,30 | Apache 2.0 | Hugging Face |

La ventaja diferencial frente a los encoders coreanos clásicos es el contexto de 8192 tokens y el mejor rendimiento en inglés; frente a ModernBERT original, la mejora en coreano es sustancial (de 62,36 a 82,34 en KLUE).

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chat, tool calling ni agentes; solo produce representaciones y logits de clasificación.
- El pipeline `fill-mask` no es adecuado: el modelo fue entrenado con CLM sobre tokens sustituidos por el Generator, no con `[MASK]`; se recomienda fine-tuning.
- Requiere `transformers` v5 o superior por el formato del tokenizador; en v4.x `AutoTokenizer` puede fallar al cargar.
- Solo cubre coreano e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente tras el recorte de vocabulario multilingüe.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de errores de clasificación en dominios fuera de distribución (jurídico, médico, jerga).
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre corpus web coreano e inglés, puede heredar sesgos de género, geográficos y de registro.
- El autor no detalla el volumen ni la composición exacta del corpus de preentrenamiento, lo que dificulta auditar la cobertura y los sesgos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base ModernBERT y de los datasets de fine-tuning empleados.
- En producción, verificar el mensaje de pesos inesperados (`rtd_head`, `scl_head`) al cargar; es esperado y no afecta al uso downstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi-farm/kiwi-coco-lm-base
- Generator: https://huggingface.co/kiwi-farm/kiwi-coco-lm-base-generator
- Modelo base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
- Paper COCO-LM: https://arxiv.org/abs/2102.08473
- Análisis de tokenizadores coreanos: https://github.com/bab2min/korean-tokenizer-analysis
- Flash Attention: https://github.com/Dao-AILab/flash-attention
