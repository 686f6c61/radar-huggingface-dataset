# dmis-lab/UltraBERT-380M

## Resumen

UltraBERT-380M es un codificador bidireccional (encoder) de tipo BERT para inglés, desarrollado por el laboratorio dmis-lab, con un contexto nativo de 32K tokens. Pertenece a la familia UltraBERT, que incluye variantes de 150M y 380M de parámetros, además de un modelo de embeddings (UltraBERT-Embed-150M) construido sobre la variante pequeña. El modelo resuelve el compromiso histórico de los encoders clásicos, que tendían a destacar o bien en tareas de clasificación (GLUE, NER) o bien en recuperación de información (BEIR, MLDR), pero rara vez en ambas simultáneamente.

La arquitectura es un transformer bidireccional con 1.024 dimensiones ocultas y 429.966.336 parámetros reales según los pesos en safetensors. Se entrena con masked language modeling (MLM) sobre un corpus multilingüe de fuentes educativas y de razonamiento, y se extiende desde 2K hasta 32K tokens de contexto. Su relevancia actual radica en que combina clasificación y recuperación de alto rendimiento en un único encoder de tamaño medio, con licencia Apache 2.0 y soporte nativo en transformers.

El modelo se distribuye como checkpoint de `AutoModelForMaskedLM` y está pensado como base para fine-tuning en tareas downstream (clasificación de secuencias, NER, retrieval denso, reranking), no como modelo generativo. Su contexto largo lo posiciona como alternativa a encoders de 8K como ModernBERT o Ettin en escenarios de documentos extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT-style) |
| Parametros totales | 429.966.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens (entrenado a 2K y extendido a 32K) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; soporta bfloat16 en carga) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UltraBERT-380M es un encoder transformer bidireccional con 1.024 dimensiones ocultas y aproximadamente 430M de parámetros. Se entrena con masked language modeling sobre un corpus compuesto por dclm-baseline-1.0, fineweb-edu, stack-edu, peS2o, MegaMath, finemath, smollm-corpus, dolma, FLAN y natural_reasoning. La longitud de entrenamiento base es de 2K tokens, extendida posteriormente hasta 32K.

La innovación técnica principal son las cabezas LM desacopladas (decoupled LM heads): cada lote de preentrenamiento mezcla secuencias enmascaradas al 5% y al 50%, y cada ratio de enmascaramiento tiene su propia cabeza de predicción. Los ratios bajos favorecen la clasificación y los altos favorecen el retrieval, de modo que cabezas separadas permiten aprender ambas sin la interferencia que provoca una cabeza compartida. El modelo de 380M se obtiene por poda de anchura (width pruning) desde un teacher de 1.3B, y se destila del teacher con pérdida KL aplicada solo a las secuencias enmascaradas al 5%, mientras que las secuencias al 50% usan la pérdida MLM estándar. El modelo de 150M se poda a su vez desde el de 380M.

## Capacidades

- Relleno de máscaras (fill-mask) y modelado de lenguaje enmascarado en inglés.
- Clasificación de secuencias mediante fine-tuning (`AutoModelForSequenceClassification`).
- Reconocimiento de entidades nombradas (NER) y tareas token-level.
- Recuperación densa de información (dense retrieval) con mean pooling y pérdida contrastiva.
- Reranking y evaluación de relevancia en pipelines de búsqueda.
- Razonamiento sobre recompensas (Reward-Bench) y tareas de código y matemáticas (RARb Code, RARb Math).
- Manejo de contexto largo hasta 32K tokens, con alta retención en pruebas de passkey (99% hasta 32K según la model card).
- Soporte de FlashAttention 2, SDPA y eager attention.
- No es un modelo generativo ni soporta tool calling ni razonamiento multi-step por sí mismo; su uso es como encoder base para fine-tuning.

## Casos de uso

- Clasificación de documentos largos: gracias a sus 32K tokens de contexto, puede clasificar contratos, informes o artículos completos sin truncar, superando a encoders de 8K que pierden información en documentos extensos.
- Búsqueda semántica en corpus técnicos: fine-tuneado con pérdida contrastiva y mean pooling, sirve como encoder de retrieval para índices vectoriales en dominios como código (stack-edu) o literatura científica (peS2o).
- Reconocimiento de entidades en textos legales o biomédicos: su rendimiento en MultiCoNER v2 y Few-NERD lo hace adecuado para extracción de entidades tras fine-tuning supervisado.
- Reranking en pipelines RAG: puede puntuar pares consulta-documento con contexto largo, mejorando la precisión de recuperación antes de pasar a un modelo generativo.
- Evaluación de calidad y recompensas: su resultado en Reward-Bench permite usarlo como modelo de recompensa o clasificador de preferencias en pipelines de RLHF.
- Análisis de razonamiento matemático y código: las tareas RARb Code y RARb Math indican utilidad para clasificar o puntuar soluciones de programación y problemas matemáticos.
- Moderación de contenido y detección de toxicidad: como encoder de clasificación, puede fine-tunearse para etiquetar textos largos con contexto completo.

## Benchmarks y rendimiento

Datos de la model card para la categoría de tamaño base (hasta 200M parámetros). No se han publicado en la información disponible resultados específicos para la variante de 380M; la tabla siguiente corresponde a UltraBERT-152M y modelos comparables.

| Modelo | Params | GLUE | SQuAD 2.0 | MultiCoNER v2 | Few-NERD | Reward-Bench | BEIR | RARb Code | RARb Math | MLDR | LongEmbed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BERT | 110M | 84.7 | 76.3 | 53.8 | 66.6 | 59.4 | 36.7 | 6.6 | 27.5 | 29.0 | 29.3 |
| RoBERTa | 125M | 86.4 | 83.7 | 56.5 | 67.1 | 63.2 | 39.6 | 11.7 | 33.4 | 28.7 | 33.8 |
| ModernBERT | 149M | 88.4 | 86.7 | 57.4 | 66.7 | 68.0 | 42.6 | 29.6 | 46.1 | 37.7 | 63.2 |
| Ettin Encoder | 149M | 88.9 | 87.4 | 57.4 | 66.5 | 70.3 | 42.4 | 31.8 | 47.1 | 35.9 | 60.1 |
| UltraBERT | 152M | 89.5 | 89.2 | 57.9 | 67.4 | 73.0 | 45.2 | 39.1 | 55.4 | 43.5 | 72.0 |

Los resultados de la variante de 380M no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bfloat16 (430M parámetros × 2 bytes) más overhead de activaciones; con contexto de 32K las activaciones aumentan de forma notable, por lo que se recomienda al menos 8-16 GB para secuencias largas.
- GPU recomendadas: A100, H100 o L40S para contextos de 32K con FlashAttention 2; RTX 4090 o RTX 3090 para fine-tuning y contextos medios.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB) o superiores para inferencia con contexto moderado; para 32K completos se recomienda 16 GB o más.
- Opciones de despliegue: transformers (>= 5.20 nativo, o 5.16.1 con `trust_remote_code=True`), FlashAttention 2, SDPA o eager attention. No se documentan integraciones con vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | GLUE | BEIR | LongEmbed | Licencia |
|---|---|---|---|---|---|---|
| UltraBERT-152M | 152M | 32K | 89.5 | 45.2 | 72.0 | Apache 2.0 |
| ModernBERT | 149M | 8K | 88.4 | 42.6 | 63.2 | Apache 2.0 |
| Ettin Encoder | 149M | 8K (no confirmado) | 88.9 | 42.4 | 60.1 | no disponible |
| GTE-en-MLM | 137M | no disponible | 85.6 | 42.4 | 58.5 | no disponible |

UltraBERT-380M no tiene comparativa directa publicada en la información disponible; se ofrece la de su variante de 150M como referencia de la familia.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No es un modelo generativo: no produce texto libre ni soporta tool calling o agentes de forma nativa.
- Riesgo de alucinación en tareas de clasificación y retrieval ante entradas fuera de distribución; requiere validación en dominio.
- Sesgos potenciales heredados de los corpus de preentrenamiento (dclm, fineweb-edu, stack-edu, etc.), no evaluados en la información disponible.
- Prefiere tasas de aprendizaje hasta 10 veces más bajas que otros encoders (1e-5 y 8e-6 en MNLI para 150M y 380M; 5e-5 y 3e-5 en retrieval denso), lo que exige ajustar los pipelines de fine-tuning.
- Los resultados de retrieval reflejan el potencial del encoder tras fine-tuning en subconjuntos de MS MARCO o MLDR, no un modelo de embeddings listo para producción; para ello existe UltraBERT-Embed-150M.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte.
- No se han publicado resultados de benchmarks para la variante de 380M en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dmis-lab/UltraBERT-380M
- Paper: https://arxiv.org/abs/2610.15028
- UltraBERT-150M: https://huggingface.co/dmis-lab/UltraBERT-150M
- UltraBERT-Embed-150M: https://huggingface.co/dmis-lab/UltraBERT-Embed-150M
