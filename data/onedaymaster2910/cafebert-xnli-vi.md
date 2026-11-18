# OneDayMaster2910/cafebert-xnli-vi

## Resumen

cafebert-xnli-vi es un modelo de inferencia de lenguaje natural (NLI) para vietnamita, desarrollado por el usuario OneDayMaster2910. Se trata de un fine-tuning completo (full fine-tuning) del modelo base uitnlp/CafeBERT, un encoder de la familia XLM-RoBERTa adaptado al vietnamita, sobre la configuración `vi` del dataset facebook/xnli. El modelo resuelve la tarea de clasificación de pares de frases en tres categorías: implicación (entailment), neutral y contradicción.

El modelo cuenta con 559.893.507 parámetros y una ventana de contexto de 256 tokens, suficiente para la tarea NLI pero no para documentos largos. Su relevancia radica en que cubre una laguna concreta: los recursos NLI para vietnamita son escasos y este checkpoint ofrece pesos abiertos bajo licencia Apache 2.0, lo que permite su uso comercial sin fricciones.

La ficha se basa exclusivamente en la información publicada en la model card y en los metadatos de Hugging Face. No se dispone de información sobre la composición exacta del corpus de preentrenamiento del modelo base ni de detalles sobre innovaciones arquitectónicas más allá de la arquitectura transformer encoder estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia XLM-RoBERTa, base uitnlp/CafeBERT) |
| Parámetros totales | 559.893.507 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | clasificación de texto (NLI, 3 etiquetas) |
| Dataset de entrenamiento | facebook/xnli, configuración `vi` |
| Tamaño del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia XLM-RoBERTa con una cabeza de clasificación de secuencias de tres clases (entailment, neutral, contradiction). El backbone es uitnlp/CafeBERT, un checkpoint adaptado al vietnamita. El fine-tuning es completo: todos los pesos del backbone y de la cabeza de clasificación se actualizan, sin LoRA, PEFT ni congelación de capas.

El entrenamiento se realizó sobre la configuración `vi` de facebook/xnli durante 8 epochs, con learning rate 2e-05, optimizador adamw_torch, longitud máxima de secuencia 256 y semilla 42. El conjunto de entrenamiento original de XNLI-vi contiene 392.702 muestras, pero el autor aplicó muestreo estratificado para reducir el train a 21.000 muestras exactamente balanceadas (7.000 por etiqueta, ratio 1:1:1). El conjunto de validación se mantuvo íntegro (2.490 muestras) y el de test también (5.010 muestras). No se documenta el uso de RLHF, DPO ni decodificación especulativa, algo esperable en un modelo encoder para clasificación.

## Capacidades

- Clasificación de pares de frases (premisa, hipótesis) en tres etiquetas: entailment (0), neutral (1) y contradiction (2).
- Inferencia de lenguaje natural en vietnamita, incluyendo relaciones de implicación y contradicción entre frases.
- Detección de contradicciones semánticas entre dos textos, útil para verificación factual básica.
- Clasificación de texto con salida de logits y etiqueta predicha mediante `AutoModelForSequenceClassification`.
- Integración con el pipeline `text-classification` de Transformers, aceptando entradas `{"text": ..., "text_pair": ...}`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador encoder puro.
- Capacidad multilingüe: limitada al vietnamita según los metadatos; no se documenta transferencia a otros idiomas.

## Casos de uso

- Verificación de coherencia en resúmenes automáticos: dado un documento y una frase del resumen, el modelo clasifica si la frase está implicada, es neutral o contradice el original, lo que permite filtrar alucinaciones en pipelines de summarization en vietnamita.
- Detección de contradicciones en bases de conocimiento: comparar pares de afirmaciones extraídas de artículos o fichas para marcar inconsistencias antes de indexarlas.
- Moderación de contenido basada en implicación: comprobar si una afirmación de un usuario implica una política prohibida, usando el par (afirmación, política) como entrada al clasificador.
- Enriquecimiento de datasets NLI: generar etiquetas entailment/neutral/contradiction sobre pares de frases en vietnamita para ampliar corpus de entrenamiento de otros modelos.
- Búsqueda semántica con re-ranking NLI: reordenar candidatos recuperados por un retriever comprobando la relación lógica entre la consulta y cada pasaje.
- Evaluación de sistemas de QA: verificar si la respuesta generada está implicada por el contexto recuperado, como métrica auxiliar de fidelidad.
- Filtrado de pares de preguntas duplicadas: clasificar pares de preguntas de un foro como entailment (misma pregunta) o contradiction/neutral (distintas), con umbral sobre los logits.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card sobre el split de test de XNLI-vi (5.010 muestras):

| Métrica | Valor |
|---|---|
| Accuracy | 77,19 % |
| Macro F1 | 77,13 % |
| Macro Precision | 77,45 % |
| Macro Recall | 77,19 % |
| Mejor Validation Macro F1 | 78,99 % |

Progreso por epoch (validation):

| Epoch | Train loss | Val loss | Val accuracy | Val macro F1 |
|---|---|---|---|---|
| 1 | 2,479 | 1,2166 | 75,94 % | 75,56 % |
| 2 | 1,6417 | 1,0897 | 79,00 % | 78,99 % |
| 3 | 1,0779 | 1,1344 | 78,35 % | 78,46 % |
| 4 | 0,6527 | 1,4431 | 78,31 % | 78,30 % |
| 5 | 0,4698 | 1,6332 | 77,39 % | 77,54 % |
| 6 | 0,3757 | 1,8982 | 78,15 % | 78,25 % |
| 7 | 0,2273 | 2,3179 | 78,19 % | 78,28 % |
| 8 | 0,2384 | 2,5169 | 78,55 % | 78,61 % |

No se han publicado comparaciones con otros modelos NLI en vietnamita en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,2 GB solo para pesos (559,9 M parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 1,1 GB para pesos; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100, H100; el modelo es lo bastante pequeño para ejecutarse en CPU con latencias aceptables en lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM; incluso en iGPU y CPU para inferencia por lotes moderados.
- Opciones de despliegue: Transformers (`pipeline` o `AutoModelForSequenceClassification`), ONNX Runtime, TorchScript, Text Embeddings Inference (TEI) para clasificación, y servidores propios con FastAPI. No se documenta soporte nativo en vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cafebert-xnli-vi | 559,9 M | 256 tokens | NLI vi (3 clases) | Apache 2.0 | Hugging Face |
| uitnlp/CafeBERT (base) | no disponible | no disponible | encoder vi (preentrenamiento) | no disponible | Hugging Face |
| XLM-RoBERTa base | ~278 M | 512 tokens | encoder multilingüe | MIT | Hugging Face |

No se dispone de datos de rendimiento de CafeBERT base ni de XLM-RoBERTa en XNLI-vi en la información proporcionada, por lo que no es posible una comparación cuantitativa. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado y evaluado en vietnamita; su uso en otros idiomas no está validado y probablemente degrade el rendimiento.
- La ventana de contexto de 256 tokens limita la longitud de las premisas e hipótesis; textos más largos se truncan y pueden perder información relevante.
- El entrenamiento usó solo 21.000 muestras de las 392.702 disponibles en XNLI-vi, mediante muestreo estratificado; esto puede reducir la cobertura de fenómenos lingüísticos frente a un entrenamiento con el corpus completo.
- El sobreajuste es visible: la validation loss sube a partir del epoch 2 mientras el train loss cae hasta 0,2384, lo que indica que el checkpoint final no es el de mejor generalización.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir etiquetas erróneas con alta confianza en pares ambiguos o fuera de dominio.
- Sesgos: no se documenta ningún análisis de sesgos; el dataset XNLI hereda los sesgos de las fuentes originales (MultiNLI y traducciones).
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte que los datos de XNLI y ViANLI pertenecen a sus autores originales y deben consultarse sus términos por separado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- La fecha de creación indicada (2026-11-18) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneDayMaster2910/cafebert-xnli-vi
- Modelo base: https://huggingface.co/uitnlp/CafeBERT
- Dataset XNLI: https://huggingface.co/datasets/facebook/xnli
- Dataset ViANLI (mencionado en la model card): https://huggingface.co/datasets/uitnlp/ViANLI
