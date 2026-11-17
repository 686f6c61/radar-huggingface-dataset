# Melk-cmd/my-sentiment-classifier

## Resumen

`Melk-cmd/my-sentiment-classifier` es un clasificador de sentimiento binario en inglés publicado por el usuario Melk-cmd en Hugging Face. El modelo responde `POSITIVE` o `NEGATIVE` acompañado de una puntuación de confianza entre 0 y 1. Según su model card, se trata de una republicación de `distilbert-base-uncased-finetuned-sst-2-english` realizada como ejercicio de despliegue en la plataforma Kora, no de un entrenamiento original.

Técnicamente es un DistilBERT, es decir, una versión destilada de BERT con 6 capas y 66.955.010 parámetros totales (según los pesos en safetensors), pensada para inferencia rápida y con requisitos de memoria reducidos. La longitud de contexto heredada de la familia BERT es de 512 tokens, aunque este dato no se explicita en la información disponible.

Su relevancia es limitada: se trata de un modelo derivado, sin benchmarks propios publicados, con cero descargas y cero likes en el momento de la consulta, y orientado exclusivamente a clasificación de sentimiento en inglés sobre textos de tipo crítica de películas. Resulta útil como pieza de demostración de pipelines de despliegue o como baseline de clasificación, pero no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la familia BERT admite 512 tokens, sin confirmación en la model card) |
| Tipos de cuantización | no disponible (compatible con cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT: 6 capas, sin mecanismo de atención bidireccional completa de BERT pero con la misma estructura de atención multi-cabeza y embeddings posicionales aprendidos. El modelo original del que deriva se destiló a partir de BERT-base y se ajustó fino sobre SST-2 (Stanford Sentiment Treebank), un corpus de críticas de películas en inglés con etiquetas binarias de sentimiento.

No se dispone de información sobre el proceso de entrenamiento específico de esta republicación: no se documentan número de tokens, composición del dataset, uso de RLHF/DPO ni técnicas de optimización adicionales. La model card indica explícitamente que el modelo se republica "para el ejercicio de despliegue Kora", lo que sugiere que no hubo reentrenamiento ni modificación de pesos respecto al checkpoint original.

## Capacidades

- Clasificación de sentimiento binaria (`POSITIVE` / `NEGATIVE`) con puntuación de confianza entre 0 y 1.
- Procesamiento de texto en inglés, orientado a frases y fragmentos cortos.
- Integración con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.

## Casos de uso

- Análisis de opiniones de productos en inglés: el modelo clasifica reseñas o comentarios de clientes como positivos o negativos, permitiendo agregar métricas de satisfacción en dashboards internos.
- Moderación de comentarios: filtrado previo de mensajes con tono negativo en foros o secciones de comentarios en inglés, como señal auxiliar para revisión humana.
- Enrutamiento de tickets de soporte: clasificación rápida de la tonalidad de un ticket para priorizar casos con sentimiento negativo y derivarlos a atención especializada.
- Monitorización de reputación de marca: procesamiento por lotes de menciones en redes sociales en inglés para calcular la proporción de sentimiento positivo frente a negativo por período.
- Baseline en experimentos de NLP: punto de partida para comparar clasificadores de sentimiento más grandes o específicos de dominio en tareas de evaluación interna.
- Demostración de pipelines de despliegue: por su tamaño reducido (0,3 GB de repositorio) y licencia Apache 2.0, sirve para probar integraciones con `transformers`, Text Embeddings Inference o endpoints compatibles en entornos de desarrollo.
- Etiquetado asistido de datasets: preetiquetado de grandes volúmenes de texto en inglés para su posterior revisión y corrección manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB para los pesos (66,9 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 135 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: GTX 1650, RTX 3060, RTX 4090, así como en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para uso individual, cualquier GPU con más de 2 GB de VRAM es suficiente.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Embeddings Inference (tag oficial), endpoints compatibles, y exportación a ONNX o cuantización dinámica de PyTorch para reducir latencia.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por frase en GPU moderna, sin cifras confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Melk-cmd/my-sentiment-classifier | 66,9 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Republicación de DistilBERT SST-2 |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Apache 2.0 | Hugging Face (modelo original de referencia) | Checkpoint original del que deriva este modelo |
| roberta-base (ajustado a SST-2) | 125 M | 512 tokens | MIT | Hugging Face | Mayor tamaño y coste, habitualmente con mejor rendimiento en clasificación |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | 512 tokens | MIT | Hugging Face | Especializado en texto de redes sociales, tres clases de sentimiento |

La comparación se basa en características públicas de los modelos citados; no se dispone de resultados de benchmarks de este checkpoint concreto para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- Entrenado sobre críticas de películas en inglés: la model card advierte de menor fiabilidad en otros idiomas y otros dominios (redes sociales, soporte técnico, texto jurídico, etc.).
- Solo admite inglés; no procesa correctamente texto en castellano ni en otras lenguas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, irónicos o con negaciones complejas.
- Sesgos potenciales heredados del corpus SST-2: dominio cinematográfico, registro culto y posible desequilibrio en la distribución de etiquetas.
- Es una republicación sin benchmarks propios ni documentación de validación; no hay evidencia publicada de su rendimiento real.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del checkpoint original antes de un despliegue en producción.
- Sin mantenimiento aparente: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de correcciones o actualizaciones futuras.
- No apto para tareas generativas, de razonamiento, de código ni multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Melk-cmd/my-sentiment-classifier
- Modelo original de referencia: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english
- Documentación de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Pipeline de clasificación de texto: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
