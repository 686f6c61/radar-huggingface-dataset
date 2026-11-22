# AjayDev9/bert-finetuned-imdb

## Resumen

`bert-finetuned-imdb` es un ajuste fino de `google-bert/bert-base-uncased` publicado por el usuario AjayDev9 en Hugging Face. Se trata de un modelo encoder de tipo BERT para clasificación de texto, con 109.483.778 parámetros totales y pesos en formato safetensors. El nombre sugiere un ajuste sobre el conjunto de datos IMDb (reseñas de cine con etiqueta de sentimiento positivo o negativo), aunque la model card no confirma explícitamente el dataset utilizado y lo describe como "unknown dataset".

El modelo se generó automáticamente con la librería `Trainer` de Transformers, sin documentación adicional sobre datos de entrenamiento, composición del corpus, tokenización específica ni proceso de evaluación. La model card indica una pérdida de evaluación de 0,0010, un valor que debe interpretarse con cautela porque no se especifica la métrica, el conjunto de validación ni el número de ejemplos evaluados.

Su relevancia es limitada: se publicó en noviembre de 2026, no acumula descargas ni interacciones, y no incluye benchmarks declarados (el `model-index` está vacío). Resulta útil únicamente como ejemplo de ajuste fino de BERT para clasificación binaria de sentimiento, o como punto de partida para experimentación, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional) |
| Parámetros totales | 109.483.778 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT base admite típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original; cuantización dinámica posible vía herramientas externas) |
| Idiomas soportados | no disponible (el modelo base es `bert-base-uncased`, entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `bert-base-uncased`, un transformer encoder bidireccional de 12 capas y 768 dimensiones ocultas con 109 millones de parámetros. La tarea de cabecera es clasificación de secuencias (`text-classification`), presumiblemente binaria de sentimiento, aunque la model card no detalla el número de etiquetas ni la función de pérdida empleada.

Los hiperparámetros documentados son: learning rate 2e-5, batch size de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW con `betas=(0.9, 0.999)` y `epsilon=1e-08` (variante `ADAMW_TORCH_FUSED`), scheduler lineal y una única época. El entrenamiento se ejecutó con Transformers 5.24.0, PyTorch 2.14.1+cpu, Datasets 5.2.0 y Tokenizers 0.23.3. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en modelos encoder de clasificación). Tampoco se describen innovaciones técnicas adicionales.

## Capacidades

- Clasificación de texto: genera una etiqueta por secuencia de entrada, presumiblemente sentimiento positivo/negativo en reseñas.
- Comprensión lectora limitada al encoder: no genera texto libre, solo representaciones y logits de clasificación.
- Soporte de tool calling / function calling: no.
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingües: no documentadas; el modelo base está orientado a inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Extracción de embeddings: posible usar la salida del pooler o del token `[CLS]` para tareas de similitud, aunque no es el uso previsto.

## Casos de uso

- Análisis de sentimiento en reseñas de productos o cine: el modelo puede clasificar reseñas individuales en una etiqueta binaria; adecuado para prototipos por su tamaño reducido y licencia permisiva.
- Moderación de comentarios en foros: filtrado preliminar de textos con tono negativo, siempre con validación humana y sin asumir que la etiqueta predicha sea fiable.
- Etiquetado semi-automático de corpus: generación de etiquetas iniciales para un dataset mayor que luego se revisa manualmente, aprovechando el bajo coste de inferencia de BERT base.
- Pipeline educativo de fine-tuning: ejemplo didáctico de cómo ajustar BERT con `Trainer` y exportar pesos safetensors.
- Clasificación de tickets de soporte: adaptación de la cabecera a categorías de incidencia tras reentrenamiento, ya que el modelo actual solo está ajustado a una tarea concreta no documentada.
- Baseline en experimentos de NLP: comparación contra modelos más grandes (RoBERTa, DeBERTa) para medir la mejora obtenida con arquitecturas superiores.

## Benchmarks y rendimiento

El autor declara en la model card una pérdida de evaluación de 0,0010, sin especificar la métrica, el conjunto de evaluación ni el número de ejemplos. El `model-index` no contiene resultados. No se han publicado resultados de benchmarks (MMLU, GLUE, SST-2, etc.) en la información disponible.

| Benchmark | Resultado |
|---|---|
| Pérdida de evaluación (según autor) | 0,0010 |
| Resto de benchmarks | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~0,44 GB (109 M parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en FP16: ~0,22 GB.
- VRAM estimada con cuantización de 8 bits: ~0,11 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en CPU: sí, con latencias de decenas de milisegundos por secuencia corta.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `text-embeddings-inference` (según tags), ONNX Runtime, TorchScript. No se documenta soporte explícito de vLLM, llama.cpp u Ollama (no aplicables a un encoder de clasificación).
- Latencia y throughput: no disponibles; en CPU se espera un throughput bajo (decenas a centenares de secuencias por segundo según longitud), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AjayDev9/bert-finetuned-imdb` | 109,5 M | no disponible | Clasificación de texto | Apache 2.0 | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | Clasificación de sentimiento | Apache 2.0 | Hugging Face, muy usado |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | 125 M | 512 tokens | Clasificación de sentimiento (3 clases) | MIT | Hugging Face, ampliamente usado |

La comparativa se basa en modelos públicos conocidos de la misma categoría; no se dispone de métricas del modelo evaluado para comparar rendimiento numérico.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset", por lo que no se puede verificar la calidad ni la representatividad de los datos.
- Pérdida de evaluación de 0,0010 sin contexto: no indica accuracy, F1 ni tamaño del conjunto de validación; podría reflejar sobreajuste o un conjunto trivial.
- Sin benchmarks publicados: imposible comparar objetivamente con alternativas.
- Sesgos: heredados del corpus de preentrenamiento de `bert-base-uncased` (texto web en inglés, predominantemente de EE. UU.); no evaluados.
- Riesgo de alucinación: bajo en sentido estricto (no genera texto), pero puede producir clasificaciones erróneas con alta confianza en dominios distintos al de entrenamiento.
- Limitaciones de idioma: el modelo base está orientado a inglés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Advertencia para producción: sin métricas, sin dataset documentado y con 0 descargas, no es recomendable desplegarlo sin una reevaluación exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AjayDev9/bert-finetuned-imdb
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Documentación de Transformers (clasificación de texto): https://huggingface.co/docs/transformers/tasks/sequence_classification
