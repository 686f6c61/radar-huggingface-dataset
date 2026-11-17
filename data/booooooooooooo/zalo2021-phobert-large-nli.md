# Booooooooooooo/zalo2021-phobert-large-nli

## Resumen

`zalo2021-phobert-large-nli` es un cross-encoder de clasificación de pares (pregunta, evidencia) entrenado como verificador de NLI dentro de un sistema de recuperación de información jurídica (Legal IR). Lo desarrolla el usuario de Hugging Face `Booooooooooooo` en el marco de un trabajo de fin de grado sobre Legal Information Retrieval, y se apoya en el modelo base `vinai/phobert-large`, un encoder tipo RoBERTa adaptado al vietnamita. El modelo resuelve la fase de re-ranking del pipeline: dado un par formado por una consulta legal y un fragmento normativo candidato, estima la probabilidad de que el fragmento sea evidencia que sustenta la respuesta.

El modelo cuenta con 369.165.314 parámetros en formato safetensors (1,5 GB de repositorio) y una arquitectura de encoder transformer con cabeza de clasificación binaria. La etiqueta `0` corresponde a contradicción o no relevancia y la etiqueta `1` a implicación o evidencia de soporte. Está entrenado sobre el conjunto ZALO2021 y limita la longitud de entrada a 256 tokens, con agregación tipo `max` sobre pasajes.

Su relevancia es acotada pero específica: cubre un nicho poco poblado, el de los verificadores NLI en vietnamita para dominio legal, y sirve como componente de re-ranking en sistemas RAG jurídicos donde el recall del retriever inicial debe filtrarse con precisión antes de entregar contexto a un generador. No obstante, el repositorio no registra descargas ni interacciones, y la documentación disponible es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (RoBERTa) con cabeza de clasificación de secuencias; cross-encoder de pares |
| Parametros totales | 369.165.314 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento); el ejemplo del autor tokeniza a 512 pero el modelo se entrenó con 256 |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización dinámica estándar de PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en `vinai/phobert-large`, un transformer encoder de tipo RoBERTa preentrenado en vietnamita. Sobre el encoder se añade una cabeza de clasificación de secuencias con dos logits, entrenada como clasificador binario de NLI: `0` para contradicción o no relevancia y `1` para implicación o evidencia de soporte. La entrada se construye como par (pregunta, evidencia) y se trunca a 256 tokens. La agregación de pasajes se realiza con estrategia `max`, es decir, se toma la puntuación máxima entre los fragmentos candidatos de un mismo documento.

El entrenamiento se realizó sobre el conjunto ZALO2021, un corpus de recuperación de información jurídica en vietnamita. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste fino adicionales como RLHF o DPO (no procede en un encoder de clasificación). Tampoco se documentan innovaciones técnicas destacables más allá del uso de un cross-encoder para re-ranking legal en vietnamita.

## Capacidades

- Clasificación binaria de pares (pregunta, evidencia) para determinar si un fragmento normativo sustenta una consulta legal.
- Puntuación de relevancia mediante `sigmoid(logit[1] - logit[0])`, utilizable como score de re-ranking.
- Re-ranking de candidatos recuperados por un retriever previo (BM25, dense retrieval, etc.) en pipelines de Legal IR.
- Agregación de múltiples pasajes por documento mediante `max`, lo que permite puntuar documentos completos a partir de sus fragmentos.
- Procesamiento de texto en vietnamita en dominio jurídico.
- Integración directa con `transformers` (`AutoTokenizer` y `AutoModelForSequenceClassification`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo agentes: es un clasificador, no un generador.
- No soporta visión ni audio.
- Capacidad multilingüe limitada al vietnamita; no se documenta transferencia a otros idiomas.

## Casos de uso

- Re-ranking en sistemas RAG jurídicos: tras recuperar los N fragmentos candidatos con un retriever (por ejemplo, BM25 o embeddings densos), el cross-encoder puntúa cada par (consulta, fragmento) y se seleccionan los que superan un umbral de implicación antes de pasarlos al generador. Su naturaleza de cross-encoder le permite modelar la interacción entre consulta y evidencia, algo que un bi-encoder no captura.
- Verificación de evidencia en asistentes legales: dado un borrador de respuesta y los artículos citados, el modelo comprueba si cada artículo sustenta realmente la afirmación, reduciendo citas incorrectas.
- Filtrado de falsos positivos en búsqueda normativa: en un buscador de legislación vietnamita, el modelo descarta documentos que coinciden léxicamente con la consulta pero no responden a la pregunta.
- Construcción de datasets de entrenamiento: las puntuaciones del modelo pueden usarse para etiquetar pares (pregunta, pasaje) como positivos o negativos y alimentar el entrenamiento de retrievers densos.
- Agregación a nivel de documento: con la estrategia `max` sobre pasajes, se puede puntuar un decreto o artículo completo a partir de sus fragmentos y ordenar los resultados por relevancia jurídica.
- Moderación de contenido en respuestas legales automatizadas: detectar cuándo la evidencia recuperada no implica la afirmación generada y activar una respuesta de abstención.
- Evaluación de pipelines de recuperación: usar el clasificador como juez automático de relevancia para medir precisión y recall de distintos retrievers sobre corpus legales vietnamitas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,5 GB de pesos más activaciones; en la práctica, unos 2-3 GB con batch pequeño.
- VRAM estimada en FP16: aproximadamente 0,75 GB de pesos; en torno a 1,5-2 GB con activaciones.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) y cualquier GPU con 4 GB o más.
- También es viable en CPU para volúmenes moderados, dado el tamaño del modelo (369 M de parámetros) y la longitud máxima de 256 tokens.
- Opciones de despliegue: `transformers` con PyTorch (documentado por el autor), exportación a ONNX Runtime, TorchScript, o servidores de inferencia compatibles con modelos de clasificación como Text Embeddings Inference o un endpoint personalizado con FastAPI. No se documenta soporte específico de vLLM ni llama.cpp para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia |
|---|---|---|---|---|---|
| `Booooooooooooo/zalo2021-phobert-large-nli` | 369 M | 256 | Vietnamita | NLI / re-ranking legal | MIT |
| `vinai/phobert-large` (modelo base) | ~370 M | 256 | Vietnamita | Encoder genérico (MLM) | MIT |
| `cross-encoder/nli-deberta-v3-base` | ~184 M | 512 | Inglés | NLI genérico | MIT |
| `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` | ~278 M | 512 | Multilingüe | NLI zero-shot | MIT |

La comparación con alternativas directas es limitada: no se dispone de resultados de benchmarks del modelo frente a otros verificadores NLI en vietnamita, y la información pública sobre modelos comparables en ese idioma y dominio es escasa. El modelo base `vinai/phobert-large` comparte arquitectura y tamaño, pero no está especializado en NLI ni en dominio legal.

## Limitaciones y advertencias

- Entrenado exclusivamente en vietnamita; no se ha validado su comportamiento en otros idiomas.
- Longitud máxima de 256 tokens: las consultas o evidencias legales largas se truncan, lo que puede eliminar información relevante del artículo normativo.
- Modelo de nicho con cero descargas y cero interacciones en Hugging Face; no hay validación comunitaria ni报告 de uso en producción.
- No se documentan métricas de evaluación, curvas de calibración ni umbrales recomendados; el umbral de decisión debe calibrarse sobre datos propios.
- Riesgo de falsos negativos en pares donde la evidencia es implícita o requiere inferencia jurídica multi-paso, ya que el modelo es un clasificador de implicación textual y no razona sobre normativa.
- Posibles sesgos derivados del corpus ZALO2021 y del preentrenamiento de PhoBERT; no se documenta ningún análisis de sesgo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo sobre el dominio concreto antes de desplegarlo.
- El ejemplo de la model card tokeniza a 512 tokens aunque el entrenamiento se hizo a 256; usar 512 puede degradar la calidad de las puntuaciones.
- No apto para generación de texto: es un clasificador y no produce respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Booooooooooooo/zalo2021-phobert-large-nli
- Modelo base PhoBERT: https://huggingface.co/vinai/phobert-large
- Paper de PhoBERT (Nguyen y Nguyen, 2020): https://arxiv.org/abs/2003.00744
- Documentación de `AutoModelForSequenceClassification`: https://huggingface.co/docs/transformers/model_doc/auto#transformers.AutoModelForSequenceClassification
