# eventdata-utd/ConfliBERT-2-large

## Resumen

ConfliBERT-2-large es un codificador (encoder) de tipo transformer especializado en el dominio del conflicto político, la violencia política y la diplomacia. Lo desarrolla el grupo de investigación en event data de la Universidad de Texas en Dallas (eventdata-utd) como sucesor del ConfliBERT original de 2021. El modelo parte de ModernBERT-large y aplica un preentrenamiento adicional con objetivo de masked language modeling (MLM) sobre 22.300 millones de tokens procedentes de 16 fuentes que abarcan desde registros diplomáticos de la Guerra Fría hasta texto web de 2026.

El problema que resuelve es concreto: la investigación en ciencia política y el monitoreo de conflictos requiere codificar eventos (clasificación de tipo de evento, etiquetado de actores y localizaciones, filtrado de relevancia) sobre corpus masivos de noticias e informes. Los codificadores genéricos rinden peor en este dominio y los LLM generativos de gran tamano resultan caros e inconsistentes para tareas de etiquetado. ConfliBERT-2 ofrece una ventana de contexto de 8.192 tokens (frente a los 512 del modelo de 2021), lo que permite procesar documentos completos en una sola pasada.

Con 395.881.664 parámetros (aproximadamente 395M), es la variante grande de una familia que también incluye una versión base de 150M. No es un modelo conversacional: lee texto y devuelve etiquetas o rellena máscaras; su uso previsto es el fine-tuning supervisado con unos cientos de ejemplos etiquetados para adaptarlo a un codebook concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, bidireccional) |
| Parametros totales | 395.881.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; pesos en safetensors) |
| Idiomas soportados | en (inglés únicamente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | answerdotai/ModernBERT-large |
| Tokenizer | ModernBERT (cased, 50.368 tokens) |
| Tarea de pipeline | fill-mask |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT, un encoder transformer bidireccional presentado en 2024 que moderniza el diseño BERT clásico con atención eficiente y soporte nativo de contexto largo. ConfliBERT-2-large hereda los pesos de ModernBERT-large y aplica un pase completo de preentrenamiento de dominio con objetivo de masked language modeling sobre 22.300 millones de tokens procedentes de 16 fuentes de texto sobre conflicto, diplomacia y política, con cobertura temporal hasta 2026. El modelo original de 2021 se había entrenado sobre 33 GB de texto de conflicto hasta 2020 y sobre una arquitectura BERT-base de 2019.

La innovación principal es la combinación de la ventana de 8.192 tokens de ModernBERT con el preentrenamiento de dominio, lo que permite codificar documentos completos (audiencias, informes de país, acuerdos de paz, actas del Consejo de Seguridad) sin truncamiento. El modelo está pensado para fine-tuning: clasificación de secuencias (`AutoModelForSequenceClassification`) y etiquetado de tokens (`AutoModelForTokenClassification`). El autor recomienda instalar `flash-attn` para inferencia rápida con entradas largas; sin él, el modelo funciona con PyTorch SDPA con las mismas salidas. Para NER con palabras pre-segmentadas debe pasarse `add_prefix_space=True` al tokenizer, ya que su ausencia penaliza la F1 en esta familia de tokenizers. No se documentan detalles sobre RLHF o DPO (no aplicables a un encoder MLM).

## Capacidades

- Relleno de máscaras (fill-mask) sobre texto en inglés, capacidad que refleja el objetivo de preentrenamiento.
- Clasificación de secuencias tras fine-tuning: relevancia, tipo de evento, categorías de codebook, etiquetas de juicio dependientes del documento completo.
- Etiquetado de tokens (NER) tras fine-tuning: extracción de actores, localizaciones y entidades en texto de conflicto.
- Procesamiento de documentos largos de hasta 8.192 tokens en una sola pasada.
- Codificación de documentos a escala: millones de documentos por GPU según el autor.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No soporta visión ni audio.
- Multilingüismo: no; únicamente inglés.

## Casos de uso

- Codificación de eventos a escala: filtrado de relevancia y clasificación de tipo de evento sobre archivos de noticias y informes de monitoreo. El modelo se afina con unos cientos de ejemplos del codebook y luego etiqueta millones de documentos en una GPU.
- Análisis de documentos largos: audiencias completas, informes de país, acuerdos de paz y actas del Consejo de Seguridad se procesan en una sola pasada de hasta 8.192 tokens (unas doce páginas), evitando el truncamiento que degrada la recuperación del modelo de 2021 (en IndiaPoliceEvents, la recall cae de .81 a .23 cuando la evidencia está más allá del token 512).
- Etiquetado de juicio dependiente del documento: categorías de codebook que requieren el documento completo, como tendencia mensual de crisis, propósito de una audiencia o grado de severidad. El autor reporta que codificadores afinados alcanzan .79 de recall en deterioros de CrisisWatch, frente a .12 de precisión de un LLM frontier en zero-shot.
- Extracción de entidades (NER) en textos de conflicto: identificación de actores armados, grupos, localizaciones y organizaciones en corpus de noticias y monitoreo, mediante fine-tuning con `AutoModelForTokenClassification`.
- Procesamiento local de fuentes sensibles: al ejecutarse en una sola GPU, las fuentes confidenciales no salen de la máquina, lo que encaja en flujos de investigación con material restringido.
- Investigación reproducible y de bajo coste: el autor estima aproximadamente [[TBD-GPUH-PER-M]] GPU-horas por millón de documentos a 512 tokens para la versión large, y unas 0,7 GPU-horas por millón para la versión base cuando prima el rendimiento sobre la precisión.

## Benchmarks y rendimiento

El autor publica una tabla de evaluación con fine-tuning bajo un protocolo común (learning rate elegido en validación con semilla 123, tres semillas, F1 de test como media). La columna de ConfliBERT-2-large aparece como pendiente ([[TBD]]) en todos los casos.

| Tarea | ConfliBERT (2021) | ModernBERT-base | ModernBERT-large | ConfliBERT-2 base | ConfliBERT-2 large |
|---|---|---|---|---|---|
| SATP relevance | 89.35 | 87.21 | 88.44 | 87.67 | no disponible |
| IndiaPoliceEvents, sentences | 66.06 | 66.59 | 67.19 | 65.56 | no disponible |
| IndiaPoliceEvents, documents | 70.79 | 63.11 | 63.61 | 64.72 | no disponible |
| InsightCrime | 68.22 | 69.56 | 69.32 | 68.54 | no disponible |
| CAMEO event class | 89.46 | 86.95 | 86.01 | 87.31 | no disponible |
| 20 Newsgroups | 79.90 | 80.49 | 80.68 | 81.02 | no disponible |
| BBC News | 98.12 | 97.81 | 98.13 | 96.87 | no disponible |
| re3d NER | 68.41 | 68.51 | 68.10 | 69.10 | no disponible |
| CAMEO NER | 73.98 | 73.02 | 75.32 | 75.50 | no disponible |
| Media | 78.25 | 77.03 | 77.42 | 77.37 | no disponible |

Pseudo-perplejidad sobre 2.000 bloques reservados del corpus de entrenamiento (máscara fija del 30%, 613.809 tokens enmascarados): ModernBERT-base 4.446, ModernBERT-large 3.368, ConfliBERT-2 base 3.419. El valor de ConfliBERT-2-large figura como pendiente ([[TBD-PPL]]). El autor deja pendientes también la comparación directa frente a ModernBERT-large y frente a ConfliBERT (2021) en las nueve tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 395M parámetros, los pesos en fp32 ocupan aproximadamente 1,6 GB (tamano del repo), y en fp16/bf16 alrededor de 0,8 GB, más memoria para activaciones según la longitud de secuencia.
- GPU recomendadas: no disponible en la información proporcionada. El modelo cabe con holgura en GPUs de consumo actuales por tamano de pesos; para secuencias largas de 8.192 tokens conviene VRAM adicional por activaciones.
- Cabe en GPU de consumo: sí por tamano de pesos; el autor indica que millones de documentos se codifican en una sola GPU, sin especificar modelo.
- Opciones de despliegue: transformers (pipeline `fill-mask`, `AutoModelForSequenceClassification`, `AutoModelForTokenClassification`); `flash-attn` opcional para inferencia rápida con entradas largas, con fallback a PyTorch SDPA.
- Latencia y throughput: el autor estima aproximadamente [[TBD-GPUH-PER-M]] GPU-horas por millón de documentos a 512 tokens para la versión large y unas 0,7 GPU-horas por millón para la base. No se publican cifras de latencia por petición.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Preentrenamiento de dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ConfliBERT-2 large | ModernBERT (2024) | 395M | 8.192 | 22,3B tokens, 16 fuentes, hasta 2026 | apache-2.0 | HuggingFace |
| ConfliBERT-2 base | ModernBERT (2024) | 150M | 8.192 | 22,3B tokens, 16 fuentes, hasta 2026 | apache-2.0 | HuggingFace |
| ModernBERT-large | ModernBERT (2024) | 395M | 8.192 | ninguno | no disponible en la información | HuggingFace |
| ConfliBERT (2021) | BERT-base (2019) | 110M | 512 | 33 GB de texto de conflicto, hasta 2020 | no disponible en la información | HuggingFace |

En las nueve tareas de conflicto evaluadas, ConfliBERT-2 base obtiene una media de F1 de 77,37, frente a 77,42 de ModernBERT-large, 77,03 de ModernBERT-base y 78,25 de ConfliBERT (2021). Los resultados de la variante large no están publicados. La fuente web de UTD Event Data afirma que ConfliBERT supera en precisión y recall a Gemma 2 (9B), Llama 3.1 (7B) y Qwen 2.5 (14B) en sus dominios relevantes, aunque esa afirmación corresponde al modelo de 2021 y no se aportan cifras en la información disponible.

## Limitaciones y advertencias

- Solo inglés: no procesa otros idiomas.
- No es un modelo generativo ni conversacional: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- No es un reemplazo directo del ConfliBERT de 2021: las cabezas afinadas y los datasets tokenizados deben reconstruirse por el cambio de tokenizer.
- Los resultados de la variante large no están publicados (marcados como [[TBD]] en la model card), por lo que no puede verificarse su superioridad frente a ModernBERT-large o ConfliBERT (2021).
- Riesgo de alucinación: no aplica en el sentido generativo, pero un clasificador afinado puede producir etiquetas erróneas o sobreconfiadas fuera de la distribución de entrenamiento.
- Sesgos: no documentados en la información proporcionada; el corpus de fuentes diplomáticas y noticias puede arrastrar sesgos de cobertura geográfica y editorial.
- Restricciones de licencia: apache-2.0 permite uso comercial; no se documentan restricciones adicionales.
- Para NER con palabras pre-segmentadas es necesario `add_prefix_space=True`; su omisión penaliza la F1.
- Los hiperparámetros de fine-tuning (learning rate para clasificación y NER) figuran como pendientes en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eventdata-utd/ConfliBERT-2-large
- Versión base: https://huggingface.co/eventdata-utd/ConfliBERT-2-base
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Página del proyecto ConfliBERT (UTD Event Data): https://eventdata.utdallas.edu/conflibert/
