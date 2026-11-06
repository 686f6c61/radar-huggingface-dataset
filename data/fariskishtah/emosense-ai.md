# fariskishtah/emosense-ai

## Resumen

EmoSense AI es un modelo de clasificación de texto en inglés desarrollado por Faris Mohamed Kishtah en el marco del programa INSTANT AI & Data Science Training. Resuelve una tarea concreta: asignar un texto a una de seis familias emocionales (alegría, tristeza, ira, miedo, sorpresa y asco). El checkpoint de producción es un ajuste fino de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66,96 millones de parámetros, con una ventana de contexto heredada de BERT de 512 tokens.

El modelo se distribuye junto a otras dos variantes: un checkpoint recurrente BiLSTM con atención aditiva y un modelo ONNX cuantizado a int8 orientado a inferencia en navegador. La relevancia práctica está en su tamaño reducido (repo de 0,3 GB) y en que el autor documenta un protocolo de evaluación con auditoría de fugas de datos (duplicados exactos y near-duplicates vía MinHash con Jaccard de trigramas >= 0,90), algo poco habitual en modelos de este perfil.

No obstante, conviene contextualizar su alcance: se trata de un modelo de clasificación de 6 clases entrenado sobre GoEmotions (Reddit), no de un modelo generativo. No soporta tool calling, agentes ni razonamiento multi-paso, y su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, ajuste fino de `distilbert-base-uncased`) |
| Parametros totales | 66.958.086 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT; no confirmada explícitamente en la model card) |
| Tipos de cuantizacion | int8 (ONNX cuantizado, `onnx/model_quantized.onnx`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX, PyTorch (checkpoint de transformers) |

## Arquitectura y entrenamiento

El checkpoint principal es un DistilBERT (`distilbert-base-uncased`) ajustado para clasificación de 6 clases. DistilBERT es una destilación de BERT-base con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, que conserva aproximadamente el 97 % del rendimiento de BERT con un 40 % menos de parámetros. El modelo se inicializa desde pesos preentrenados y se ajusta sobre un subconjunto de GoEmotions.

Los datos de entrenamiento provienen de `google-research-datasets/go_emotions`, con un mapeo conservador de las etiquetas originales a seis familias: una muestra se retiene solo si todas sus etiquetas originales mapean a la misma clase objetivo, excluyendo ejemplos neutros, no mapeados y multilabel de clases cruzadas. Los duplicados exactos se conservan únicamente en el split oficial más temprano y la fuga por near-duplicates se audita con candidatos MinHash y Jaccard de trigramas de tokens >= 0,90. El conjunto de test congelado y auditado contiene 2.771 ejemplos. El modelo de producción se seleccionó por macro F1 de validación (0,6627) antes de leer las etiquetas de test; la configuración int8 se seleccionó por separado sobre una muestra de validación y se evaluó de forma independiente. No se documenta en la información disponible el uso de RLHF, DPO ni un recuento explícito de tokens de entrenamiento.

El repositorio incluye además un checkpoint recurrente (BiLSTM + atención aditiva) inicializado con vectores GloVe (PDDL 1.0), cuyos vectores se ajustaron durante el entrenamiento. El fichero original de GloVe de 331 MB no se redistribuye.

## Capacidades

- Clasificación de texto en inglés en seis clases emocionales: Joy, Sadness, Anger, Fear, Surprise y Disgust.
- Salida de probabilidades por clase mediante softmax (no calibradas, según advierte el autor).
- Inferencia en navegador mediante el modelo ONNX cuantizado a int8.
- Despliegue compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Moderación de comunidades y foros: clasificar mensajes de plataformas tipo Reddit en familias emocionales para priorizar revisiones humanas de contenido con carga de ira o asco, aprovechando que el modelo se entrenó sobre ese dominio.
- Enrutado de tickets de soporte: asignar cada mensaje entrante a un flujo según la emoción dominante (por ejemplo, escalar a atención prioritaria los mensajes clasificados como ira) con un coste de inferencia muy bajo por su tamaño de 67 M de parámetros.
- Analítica de opinión a escala: procesar lotes de reseñas o comentarios en inglés y agregar la distribución de emociones por producto o periodo, usando el checkpoint int8 ONNX para reducir coste de cómputo.
- Filtrado previo en pipelines de anotación: usar el modelo como primera pasada para preseleccionar ejemplos candidatos que luego revisan anotadores humanos, reduciendo el volumen a etiquetar manualmente.
- Clasificación en el navegador o en el borde: integrar `onnx/model_quantized.onnx` en una aplicación web para etiquetar texto del usuario sin enviar datos a un servidor, útil por privacidad.
- Investigación en NLP emocional: servir como línea base reproducible (con protocolo de auditoría de fugas documentado) para comparar arquitecturas recurrentes frente a transformers en la tarea de clasificación emocional sobre GoEmotions.
- Enriquecimiento de datasets: etiquetar corpus en inglés con seis categorías emocionales para entrenar o evaluar modelos posteriores.

## Benchmarks y rendimiento

Resultados sobre el split de test congelado y auditado (2.771 ejemplos), según la model card:

| Modelo | Accuracy | Macro F1 | Weighted F1 |
|---|---:|---:|---:|
| LSTM | 0,7117 | 0,6177 | 0,7313 |
| GRU | 0,7481 | 0,6294 | 0,7584 |
| BiLSTM + Attention | 0,7582 | 0,6369 | 0,7672 |
| DistilBERT | 0,7824 | 0,6645 | 0,7946 |
| DistilBERT int8 ONNX | 0,7806 | 0,6696 | 0,7936 |

El autor aclara que el mayor macro F1 del modelo int8 en test es un efecto observado de la cuantización y no la puntuación reclamada para el modelo PyTorch de producción. No se han publicado comparaciones con otros modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint DistilBERT (67 M de parámetros, aproximadamente 268 MB de pesos) y alrededor de 67 MB para el modelo int8 ONNX.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Funciona en GPUs de consumo como GTX 1650, RTX 3060 o superiores, y también en CPU con latencias aceptables para lotes pequeños.
- Cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos de borde y navegador (variante ONNX int8).
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles; también es viable con llama.cpp u Ollama solo si se convierte a GGUF, extremo no documentado en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmoSense AI (DistilBERT) | 66,96 M | 512 tokens | 6 clases emocionales | Apache-2.0 | Hugging Face, ONNX int8 |
| DistilBERT base sin ajustar | 66,96 M | 512 tokens | Modelo base (requiere ajuste) | Apache-2.0 | Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | Modelo base (requiere ajuste) | Apache-2.0 | Hugging Face |
| Modelos de clasificación emocional sobre GoEmotions (varios autores) | variable | 512 tokens | Multilabel (28 etiquetas) | variable | Hugging Face |

La comparación con alternativas de la misma tarea es limitada: la mayoría de modelos publicados sobre GoEmotions abordan la clasificación multilabel de 27-28 etiquetas, mientras que EmoSense AI reduce el problema a 6 clases mediante un mapeo conservador, lo que hace que las métricas no sean directamente comparables. No se dispone de datos de benchmarks frente a esos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo predice etiquetas basadas en patrones de texto, no la emoción interna real de una persona; el autor lo desaconseja explícitamente como herramienta de evaluación de salud mental, detector de mentiras o detector de intenciones.
- Los datos de entrenamiento provienen de Reddit, en inglés, y arrastran sesgos de plataforma y de anotación.
- El sarcasmo, la emoción mixta y el cambio de dominio siguen siendo difíciles para el modelo.
- Las puntuaciones softmax no están calibradas y no deben interpretarse como probabilidades fiables.
- Solo admite inglés; el rendimiento en otros idiomas no está evaluado.
- El mapeo conservador a 6 clases descarta ejemplos neutros, no mapeados y multilabel de clases cruzadas, por lo que el modelo no cubre la emoción neutra ni combinaciones de emociones.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero se debe conservar la atribución a GoEmotions (Apache-2.0), `distilbert-base-uncased` (Apache-2.0) y GloVe (PDDL 1.0) según corresponda.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación externa independiente.
- La longitud de contexto de 512 tokens no se afirma explícitamente en la model card; se infiere de la arquitectura DistilBERT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fariskishtah/emosense-ai
- Repositorio de código y metodología: https://github.com/fariskishtah/emosense-ai
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
