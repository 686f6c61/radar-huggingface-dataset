# Booooooooooooo/zalo2021-xlm-roberta-large-xnli

## Resumen

El modelo `Booooooooooooo/zalo2021-xlm-roberta-large-xnli` es un verificador de inferencia en lenguaje natural (NLI) especializado en el dominio jurídico vietnamita. Lo desarrolla el usuario de Hugging Face `Booooooooooooo` en el marco de un trabajo de fin de grado sobre sistemas de recuperación de información legal (Legal Information Retrieval). Toma como base `joeddav/xlm-roberta-large-xnli` y se reentrena como cross-encoder para decidir si un fragmento de evidencia legal respalda o no una pregunta o consulta jurídica.

La arquitectura es un transformer encoder XLM-RoBERTa en configuración *large*, con 559.892.482 parámetros, adaptado a una tarea de clasificación binaria: la etiqueta `1` indica implicación (evidencia relevante o de soporte) y la `0` indica contradicción o no relevancia. Se utiliza en una etapa de *reranking* o verificación dentro de un pipeline de recuperación legal sobre el conjunto de datos ZALO2021, con una longitud máxima de entrada de 512 tokens y agregación por máximo (*bag aggregation: max*) cuando se evalúan múltiples pasajes.

Su relevancia es acotada pero específica: cubre el hueco de verificación de evidencia en vietnamita para dominios legales, un idioma con poca cobertura en modelos NLI de propósito general y un dominio donde la precisión de la cita importa más que la fluidez generativa. Está publicado con licencia MIT y pesos en safetensors, si bien el repositorio no incluye datos de benchmarks públicos en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) como cross-encoder |
| Parámetros totales | 559.892.482 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | `joeddav/xlm-roberta-large-xnli` |
| Tarea | Clasificación binaria NLI (entailment / contradiction) |
| Etiquetas | `0`: contradicción / no relevante; `1`: implicación / evidencia de soporte |
| Agregación de pasajes | max |
| Dataset de entrenamiento | ZALO2021 |
| Tamaño del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `joeddav/xlm-roberta-large-xnli`, un XLM-RoBERTa large ya ajustado para NLI multilingüe (XNLI). Sobre esa base se realiza un ajuste adicional como *cross-encoder*: la pregunta y la evidencia se concatenan en una única secuencia de hasta 512 tokens y el encoder produce una representación conjunta que se clasifica en dos logits. La decisión final se obtiene comparando la probabilidad sigmoide de la diferencia entre logits (`sigmoid(logit_1 - logit_0)`), tal como muestra el ejemplo de la model card.

El entrenamiento se realiza sobre el conjunto de datos ZALO2021, enmarcado en un trabajo de fin de grado sobre recuperación de información legal. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un encoder de clasificación). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; se trata de un ajuste supervisado convencional de clasificación. La agregación por máximo sugiere que el modelo se usa para puntuar varios pasajes candidatos y quedarse con la mejor evidencia.

## Capacidades

- Verificación de evidencia jurídica: dado un par (pregunta, pasaje legal), estima la probabilidad de que el pasaje respalde la pregunta.
- Clasificación binaria NLI: distingue entre implicación (evidencia de soporte) y contradicción o no relevancia.
- Reranking en pipelines de recuperación: puede reordenar candidatos devueltos por un retriever previo (BM25, embeddings, etc.) usando la puntuación de entailment.
- Procesamiento de pares pregunta-evidencia en vietnamita, con truncamiento a 512 tokens.
- Agregación por máximo sobre múltiples pasajes para obtener una puntuación global de relevancia.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es un encoder de clasificación.
- Capacidad multilingüe limitada: aunque el modelo base es multilingüe, el ajuste se ha realizado y declara únicamente vietnamita.

## Casos de uso

- Verificación de citas legales en asistentes jurídicos: tras recuperar varios artículos o cláusulas candidatas, el modelo puntúa cada una frente a la consulta del usuario y descarta las que no constituyen evidencia de soporte, reduciendo citas incorrectas antes de mostrarlas.
- Reranking en sistemas de recuperación legal: se coloca como segunda etapa sobre los resultados de un retriever (por ejemplo, BM25 sobre un corpus de normativa vietnamita) para reordenar los pasajes según la probabilidad de entailment.
- Respuesta a preguntas extractivas sobre normativa: en un pipeline RAG, el verificador filtra los fragmentos que realmente responden a la pregunta (por ejemplo, plazos de prescripción) antes de pasarlos a un generador o de presentarlos directamente.
- Control de calidad de bases de conocimiento jurídicas: se usa para validar pares pregunta-respuesta existentes, marcando como no relevantes aquellos donde la evidencia no implica la pregunta.
- Filtrado de ruido en búsqueda documental interna: despachos y departamentos legales pueden aplicarlo sobre resultados de búsqueda para priorizar los pasajes con soporte real frente a coincidencias léxicas superficiales.
- Evaluación automática de sistemas de QA legal: sirve como componente de métrica de relevancia de evidencia en la evaluación de pipelines de recuperación sobre ZALO2021 u otros corpus vietnamitas.
- Deduplicación y selección de evidencia en resúmenes legales: al agregar por máximo, permite elegir el pasaje más representativo entre varios candidatos para una misma consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1, accuracy ni comparaciones con otros modelos sobre ZALO2021 u otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (559,9 M de parámetros × 4 bytes), más activaciones y memoria del tokenizador; en la práctica, entre 3 y 4 GB con lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 1,1 GB para pesos, con un total práctico de 2 a 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 en lotes pequeños; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1660, RTX 2060, RTX 3060, RTX 4060 y superiores.
- Despliegue: `transformers` con `AutoModelForSequenceClassification`, servidores de inferencia tipo TGI o vLLM (aunque al ser un encoder de clasificación, TGI es más adecuado que vLLM), y exportación a ONNX para producción. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 559 M de parámetros con secuencias de hasta 512 tokens, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Booooooooooooo/zalo2021-xlm-roberta-large-xnli` | 559,9 M | 512 tokens | NLI binario legal en vietnamita | MIT | Hugging Face |
| `joeddav/xlm-roberta-large-xnli` | ~559 M | 512 tokens | NLI multilingüe (XNLI) | MIT | Hugging Face |
| `FacebookAI/xlm-roberta-large` | ~559 M | 512 tokens | Encoder multilingüe base | MIT | Hugging Face |
| `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` | ~278 M | 512 tokens | NLI multilingüe zero-shot | MIT | Hugging Face |

La comparación se basa en características públicas de los modelos base y alternativas de NLI multilingüe; no hay datos de rendimiento comparado disponibles para el modelo objeto de esta ficha. Frente a `joeddav/xlm-roberta-large-xnli`, este modelo está especializado en dominio legal vietnamita y en clasificación binaria, mientras que el base es NLI multilingüe de tres clases y propósito general. Frente a `mDeBERTa-v3-base-mnli-xnli`, el modelo aquí descrito es aproximadamente el doble de grande y está ajustado a un dominio concreto, pero carece de la validación zero-shot multilingüe del modelo de MoritzLaurer.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre ZALO2021, hereda los sesgos y la distribución de ese corpus legal vietnamita.
- Riesgo de alucinación: no aplica generación de texto, pero puede producir falsos positivos de entailment (marcar como evidencia un pasaje que no lo es) o falsos negativos, especialmente con paráfrasis o terminología jurídica fuera del dominio de entrenamiento.
- Limitación de contexto: 512 tokens; pasajes legales más largos se truncan, lo que puede eliminar la parte relevante de la evidencia.
- Limitación de idioma: declarado solo para vietnamita; aunque el modelo base es multilingüe, no hay garantía de rendimiento en otros idiomas.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución con atribución; no se documentan restricciones adicionales.
- Caveats para producción: no hay benchmarks publicados, por lo que la calidad debe validarse con un conjunto propio antes de desplegarlo; el repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria; no se documentan versiones cuantizadas ni soporte GGUF.
- El modelo requiere un pipeline de recuperación previo: no recupera documentos por sí mismo, solo verifica pares pregunta-evidencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Booooooooooooo/zalo2021-xlm-roberta-large-xnli
- Modelo base: https://huggingface.co/joeddav/xlm-roberta-large-xnli
- XLM-RoBERTa large: https://huggingface.co/FacebookAI/xlm-roberta-large
- Alternativa NLI multilingüe: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-mnli-xnli
