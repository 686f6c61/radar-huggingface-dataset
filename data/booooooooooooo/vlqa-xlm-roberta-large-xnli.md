# Booooooooooooo/vlqa-xlm-roberta-large-xnli

## Resumen

`Booooooooooooo/vlqa-xlm-roberta-large-xnli` es un cross-encoder de verificación (NLI verifier) construido sobre `joeddav/xlm-roberta-large-xnli` y ajustado por el usuario Booooooooooooo en el marco de un trabajo de fin de grado sobre sistemas de recuperación de información jurídica (Legal IR). No es un modelo generativo: recibe un par (pregunta, evidencia) y devuelve una puntuación binaria de pertinencia, donde la clase `0` agrupa contradicción/no relevante y la clase `1` agrupa implicación/evidencia de soporte. Su función es la de reordenador y filtro de evidencia dentro de un pipeline RAG jurídico en vietnamita.

Arquitectónicamente es un transformer encoder XLM-RoBERTa large con cabeza de clasificación de secuencias de dos etiquetas, 559.892.482 parámetros y una longitud máxima de entrada de 512 tokens. El ajuste se realizó sobre el conjunto de datos VLQA, y la model card especifica una agregación tipo `max` sobre bolsas de pasajes, lo que indica que el modelo está pensado para puntuar múltiples candidatos y quedarse con la mejor evidencia.

Su relevancia práctica es acotada pero clara: los verificadores NLI son el componente que reduce alucinaciones en sistemas de preguntas y respuestas sobre normativa, y este modelo aporta una versión afinada al dominio legal vietnamita con licencia MIT. Ahora bien, el repositorio no incluye métricas, no documenta hiperparámetros de entrenamiento y acumula cero descargas, por lo que debe tratarse como un artefacto de investigación sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabeza de clasificación de secuencias, cross-encoder |
| Parametros totales | 559.892.482 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (`max_length` en tokenizador) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados; al ser un encoder de ~560 M es viable fp16/int8 mediante herramientas externas, pero el autor no publica artefactos) |
| Idiomas soportados | vietnamita (`vi`) declarado; el modelo base es multilingüe pero el ajuste se realizó solo sobre corpus jurídico vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 2,3 GB, pesos en fp32) |

## Arquitectura y entrenamiento

El modelo parte de `joeddav/xlm-roberta-large-xnli`, un XLM-RoBERTa large ya ajustado para inferencia de lenguaje natural sobre XNLI en 15 idiomas. Sobre esa base se aplicó un segundo ajuste supervisado con el corpus VLQA para convertir la clasificación ternaria original (entailment / neutral / contradiction) en una clasificación binaria: `0` = contradicción o no relevante, `1` = implicación o evidencia de soporte. La cabeza es, por tanto, `AutoModelForSequenceClassification` con `num_labels = 2`, y la puntuación final se obtiene como `sigmoid(logits[:,1] - logits[:,0])`, un diferencial de logits que no debe interpretarse como probabilidad calibrada.

La información pública no detalla el volumen de tokens de entrenamiento, la composición del dataset VLQA, el número de épocas, la tasa de aprendizaje ni si hubo búsqueda de hiperparámetros; tampoco hay constancia de fases de RLHF o DPO, algo esperable al tratarse de un encoder discriminativo y no de un modelo de lenguaje. El único detalle operativo documentado es la agregación `max` sobre bolsas de pasajes: para un conjunto de evidencias candidatas se puntúa cada par (consulta, pasaje) y se retiene la puntuación máxima como señal de relevancia del conjunto.

## Capacidades

- Clasificación de pares (consulta, evidencia) en dos clases: soporte/pertinente frente a contradicción/no pertinente.
- Puntuación de relevancia mediante diferencial de logits con sigmoide, útil como score continuo para reordenación.
- Reordenación (reranking) de pasajes recuperados por un sistema de búsqueda previo, con agregación `max` sobre el conjunto de candidatos.
- Verificación de evidencia en pipelines RAG: comprobar si un fragmento normativo respalda realmente la respuesta propuesta.
- Comprensión de texto jurídico vietnamita: preguntas sobre plazos, sanciones, thời hiệu y condiciones legales (el ejemplo de la model card trata sobre el plazo de prescripción de sanciones administrativas).
- Procesamiento por pares truncado a 512 tokens, adecuado para artículos y cláusulas de extensión corta o media.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso agéntico, visión ni audio.

## Casos de uso

- **Reordenación en un motor de recuperación jurídica (Legal IR)**: se recuperan los N pasajes más similares con BM25 o embeddings y se repuntúan con este cross-encoder; la agregación `max` permite seleccionar la evidencia más fuerte antes de pasarla al generador.
- **Filtro anti-alucinación en RAG normativo**: antes de devolver una respuesta sobre legislación vietnamita, cada cita propuesta se contrasta contra el texto original; si la puntuación de implicación cae por debajo de un umbral, la respuesta se descarta o se marca como no verificada.
- **Verificación de citas legales en asistentes de cumplimiento**: dado un fragmento de contrato o una afirmación de un usuario y un artículo de ley, el modelo indica si el artículo respalda la afirmación, lo que permite auditar respuestas automáticas en entornos regulados.
- **Detección de contradicciones entre fuentes**: comparar una cláusula contractual con la normativa aplicable o dos versiones de un mismo texto legal para señalar incompatibilidades, usando la clase `0` como señal de contradicción.
- **Anotación asistida de datasets jurídicos**: preetiquetar pares pregunta-pasaje con la puntuación del modelo y reservar la revisión humana para los casos con score cercano al umbral, reduciendo el coste de construir corpus de entrenamiento.
- **Enrutado de consultas en atención al ciudadano**: clasificar si la documentación recuperada es suficiente para responder una consulta administrativa; si ningún pasaje supera el umbral, se deriva a un asesor humano en lugar de improvisar una respuesta.
- **Evaluación de sistemas de recuperación**: usar el score como métrica automática de pertinencia para comparar variantes de indexación o de chunking sin anotación manual completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1, accuracy ni comparaciones con otros verificadores, y el repositorio no enlaza ningún informe de evaluación del ajuste sobre VLQA.

## Requisitos de hardware

- Huella de pesos: 559,9 M de parámetros, aproximadamente 2,24 GB en fp32 (el repo ocupa 2,3 GB) y unos 1,12 GB en fp16.
- Inferencia en fp16: cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM (RTX 3050, RTX 4060, RTX 3060); en int8 rondaría los 0,56 GB de pesos.
- GPU recomendadas para producción con concurrencia: A10G, L4, L40S, A100 o H100; para lotes grandes de reordenación, una A100 40 GB permite procesar muchos pares en paralelo.
- Despliegue: al ser un encoder de clasificación, la vía natural es `transformers` con `AutoModelForSequenceClassification` y batching, o su exportación a ONNX Runtime / TGI. vLLM no es la herramienta idónea al no haber generación autorregresiva; llama.cpp y Ollama no aplican porque no se publican pesos GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas; cualquier cifra sería una estimación teórica dependiente del hardware y del lote, no un dato verificado del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma de ajuste | Licencia | Estado |
|---|---|---|---|---|---|
| `Booooooooooooo/vlqa-xlm-roberta-large-xnli` | 559,9 M | 512 | Vietnamita (jurídico) | MIT | Repositorio sin métricas ni descargas |
| `joeddav/xlm-roberta-large-xnli` (modelo base) | ~560 M | 512 | Multilingüe (15 idiomas, XNLI) | MIT | Modelo de referencia con uso extendido; clasificación ternaria |
| `BAAI/bge-reranker-large` | ~560 M | 512 | Multilingüe (inglés/zh principalmente) | MIT | Reranker genérico con evaluación publicada |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | ~22 M | 512 | Inglés | Apache 2.0 | Reranker ligero, mucho más rápido y económico |

La comparación relevante es frente al modelo base: este ajuste especializa la salida a dos clases y al dominio legal vietnamita, pero pierde la granularidad de la clase `neutral` y no aporta métricas que demuestren mejora sobre el original. Frente a `bge-reranker-large`, la diferencia principal es el dominio y el idioma, no el tamaño. Datos de rendimiento comparado: no disponibles.

## Limitaciones y advertencias

- **Idioma restringido**: aunque XLM-RoBERTa es multilingüe, el ajuste se realizó únicamente sobre corpus jurídico vietnamita; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será inferior.
- **Truncación a 512 tokens**: los artículos legales largos, los contratos extensos y los considerandos se cortan, con pérdida de contexto que puede producir falsos negativos.
- **Ausencia total de evaluación publicada**: no hay métricas, curvas, matrices de confusión ni comparación con el modelo base; no es posible afirmar que el ajuste mejore al original.
- **Probabilidad no calibrada**: la puntuación es `sigmoid(logit1 - logit0)`, no una probabilidad calibrada; los umbrales deben ajustarse empíricamente sobre el dominio de destino.
- **Colapso de la clase neutral**: la clasificación ternaria original se reduce a binaria, de modo que la evidencia parcialmente relacionada se fuerza a `0` o `1`, lo que puede infravalorar pasajes útiles.
- **Repositorio no auditado**: cero descargas y cero likes, sin historial de uso, sin model card extendida en inglés y sin información sobre sesgos del corpus VLQA ni sobre su proceso de anotación.
- **No es un modelo generativo**: no puede emplearse para responder preguntas directamente; solo puntúa pares. Cualquier sistema que lo use necesita un generador separado.
- **Riesgo de alucinación delegado**: el modelo no genera texto, pero un umbral demasiado permisivo en el verificador traslada el riesgo al generador; se recomienda combinarlo con revisión humana en contextos legales.
- **Licencia**: MIT permite uso comercial y modificaciones con atribución; conviene conservar el aviso de copyright y verificar las condiciones del modelo base y del corpus VLQA por si impusieran restricciones adicionales, extremo no documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Booooooooooooo/vlqa-xlm-roberta-large-xnli
- Modelo base: https://huggingface.co/joeddav/xlm-roberta-large-xnli
- Artículo de XLM-RoBERTa (arXiv 1911.02116): https://arxiv.org/abs/1911.02116
- Artículo de XNLI (arXiv 1809.05053): https://arxiv.org/abs/1809.05053
- Conjunto de datos VLQA: no disponible (no se enlaza en la model card)
- Informe o paper del trabajo de fin de grado: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces técnicos relevantes; las entradas devueltas no guardan relación con el modelo y se descartan.
