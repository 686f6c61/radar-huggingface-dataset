# fateemah26/reviewradar-sentiment

## Resumen

ReviewRadar-sentiment es un modelo de clasificación de sentimiento en tres clases (negativo, neutro, positivo) desarrollado por fateemah26 y publicado en Hugging Face. Se trata de un fine-tuning de `cardiffnlp/twitter-xlm-roberta-base-sentiment`, un checkpoint XLM-RoBERTa-base ya preentrenado para sentimiento multilingüe en tuits, que aquí se especializa en reseñas de producto y comentarios de clientes en inglés y roman urdu (urdu escrito con caracteres latinos, por ejemplo "product bohat acha hai").

El modelo aborda un problema concreto y poco cubierto: el análisis de opiniones en texto code-mixed y transliterado, frecuente en plataformas de comercio electrónico del sur de Asia como Daraz, donde los usuarios mezclan inglés y roman urdu en la misma frase. La arquitectura es un transformer encoder XLM-RoBERTa-base con 278.045.955 parámetros totales (aproximadamente 86 millones entrenados, ya que la capa de embeddings de 250.000 tokens se congeló durante el ajuste fino).

Su relevancia actual es limitada pero específica: es un modelo pequeño, entrenado en CPU, con métricas modestas (accuracy 0.679 y macro F1 0.677 en test) y escasa tracción en la comunidad (0 descargas, 1 like en el momento de la consulta). Resulta útil como referencia para pipelines de moderación o análisis de feedback en contextos bilingües inglés–roman urdu, pero no como solución de producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base), fine-tuning de `cardiffnlp/twitter-xlm-roberta-base-sentiment` |
| Parametros totales | 278.045.955 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_length usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | Inglés (en) y roman urdu (ur); urdu en escritura nativa no soportado |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-base, un encoder transformer multilingüe de 12 capas y 278 millones de parámetros, ya ajustado por CardiffNLP para sentimiento en tuits multilingües. Sobre esa base se realizó un fine-tuning supervisado con la clase `Trainer` de Hugging Face, ejecutado en CPU: 2 épocas, learning rate 2e-5, batch size 32, warmup del 10 %, weight decay 0.01 y longitud máxima de 128 tokens. Para que el entrenamiento cupiera en 7 GB de RAM se congeló la capa de embeddings de 250.000 tokens, de modo que solo se actualizaron 86 de los 278 millones de parámetros. La mejor época se seleccionó por macro F1 en validación.

Los datos de entrenamiento combinan dos fuentes: el UCI Roman Urdu Data Set (19.435 filas tras limpieza, con etiquetas positivo/negativo/neutro tal como vienen) y una muestra balanceada de 5.998 reseñas de Amazon en inglés (SetFit/amazon_reviews_multi_en), mapeadas de estrellas a sentimiento (1–2 negativo, 3 neutro, 4–5 positivo). El preprocesado incluye minúsculas, eliminación de URLs y menciones, normalización de variantes ortográficas del roman urdu (por ejemplo *nhi/nai → nahi*, *bht → bohat*) y eliminación de duplicados, textos con etiquetas conflictivas y cadenas de menos de 3 caracteres. El split es 80/10/10 estratificado por idioma y etiqueta. No se documenta RLHF, DPO ni ninguna innovación arquitectónica adicional.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) para reseñas y comentarios de cliente.
- Manejo de texto code-mixed inglés–roman urdu en la misma frase.
- Normalización de variantes ortográficas del roman urdu si se aplica el preprocesado del autor.
- Etiquetado de frases cortas y comentarios de redes sociales (hasta 128 tokens).
- Integración directa con el pipeline `text-classification` de Transformers.
- Compatibilidad declarada con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No soporta urdu en escritura nativa ni otros idiomas fuera de inglés y roman urdu.

## Casos de uso

- Análisis de opiniones en comercio electrónico del sur de Asia: clasificar reseñas de productos escritas en roman urdu o inglés para agregar métricas de satisfacción por producto y vendedor, aprovechando que el modelo está entrenado específicamente en ese registro.
- Moderación y triaje de feedback masivo: etiquetar automáticamente grandes volúmenes de comentarios de clientes para priorizar los negativos hacia un equipo humano, dado el bajo coste de inferencia de un modelo de 278 millones de parámetros.
- Enrutamiento de tickets de soporte: usar la etiqueta de sentimiento como señal adicional para dirigir quejas negativas a atención prioritaria y comentarios neutros o positivos a encuestas de satisfacción.
- Investigación sobre PLN code-mixed: servir como baseline reproducible para experimentos con roman urdu, ya que el autor publica el split, el preprocesado y las métricas de comparación frente a TF-IDF + regresión logística y DistilBERT multilingüe.
- Monitorización de reputación de marca en redes sociales: procesar comentarios en inglés y roman urdu para detectar picos de sentimiento negativo en tiempo casi real, con la cautela de que el entrenamiento en roman urdu proviene de comentarios sociales y no de reseñas de producto.
- Análisis de encuestas abiertas bilingües: clasificar respuestas de texto libre en inglés y roman urdu para resumir la percepción de un servicio, aplicando el preprocesado del autor antes de la inferencia.
- Prototipado rápido en entornos con pocos recursos: al caber en CPU y requerir solo 7 GB de RAM para el ajuste, es viable para experimentación en portátiles sin GPU, aunque para producción se recomienda GPU o inferencia por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y la model card (no verificados de forma independiente). Test set de 2.544 reseñas, el mismo para todos los modelos.

| Modelo | Accuracy | Macro F1 | Macro F1 (inglés) | Macro F1 (roman urdu) |
|---|---:|---:|---:|---:|
| TF-IDF + regresión logística (baseline) | 0.637 | 0.637 | 0.625 | 0.633 |
| DistilBERT multilingüe fine-tuned | 0.649 | 0.647 | 0.665 | 0.635 |
| XLM-RoBERTa (twitter-sentiment) fine-tuned (final) | 0.679 | 0.677 | 0.692 | 0.666 |

F1 por clase:

| Modelo | Negativo | Neutro | Positivo |
|---|---:|---:|---:|
| TF-IDF + regresión logística (baseline) | 0.608 | 0.629 | 0.676 |
| DistilBERT multilingüe fine-tuned | 0.609 | 0.660 | 0.673 |
| XLM-RoBERTa (twitter-sentiment) fine-tuned (final) | 0.644 | 0.681 | 0.707 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB para los pesos (278 M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica 1,5–2 GB en GPU.
- En fp16: alrededor de 0,6 GB de pesos; cuantizaciones de 8 bits o 4 bits no están publicadas oficialmente, pero reducirían el requisito a 0,3–0,15 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (RTX 3060, RTX 4090, T4, A10, A100, H100). El modelo es claramente sobredimensionado para estas GPUs en términos de capacidad.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 2060, RTX 3060, RTX 4060 y superiores.
- El autor entrenó el modelo en CPU con 7 GB de RAM, lo que confirma que la inferencia en CPU es viable para volúmenes moderados.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (declarado compatible), endpoints de Hugging Face, ONNX Runtime si se exporta manualmente. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de milisegundos por frase en GPU y de decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro F1 (test del autor) | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ReviewRadar-sentiment (este modelo) | 278 M | 128 tokens | 0.677 | en, roman urdu | no disponible | Hugging Face, repo de 0,6 GB |
| cardiffnlp/twitter-xlm-roberta-base-sentiment (base) | 278 M | 128 tokens (típico) | no evaluado en este test | multilingüe (incluye en, ur) | no disponible en la información | Hugging Face |
| DistilBERT multilingüe fine-tuned (comparativa del autor) | ~135 M | 512 tokens (típico) | 0.647 | multilingüe | no disponible en la información | No se especifica checkpoint concreto |
| TF-IDF + regresión logística (baseline del autor) | no aplica | no aplica | 0.637 | en, roman urdu (según vocabulario) | no disponible | Implementación propia |

## Limitaciones y advertencias

- Los datos de roman urdu provienen de comentarios de redes sociales (política, religión, deporte, entretenimiento), no de reseñas de producto; la precisión en reseñas tipo Daraz puede ser inferior al 0.666 de macro F1 reportado para roman urdu.
- La clase neutra es la más difícil: la mayoría de errores confunden neutro con positivo o negativo, en parte porque las etiquetas originales de neutro son inconsistentes.
- El sarcasmo y las reseñas mixtas (buena calidad pero entrega tardía) reciben una única etiqueta global; la demo del autor divide reseñas mixtas en cláusulas como mitigación parcial.
- El urdu en escritura nativa y otros idiomas no estaban en los datos de entrenamiento y no deben esperarse resultados fiables.
- Las reseñas inglesas de 3 estrellas suelen ser genuinamente mixtas, por lo que el mapeo a "neutro" introduce ruido.
- Las etiquetas de roman urdu provienen de un único dataset público con etiquetado tipo crowd, con ruido y sesgos temáticos (nombres, lugares, grupos políticos o religiosos) que pueden sesgar las predicciones.
- Diferencias de ortografía, dialecto y jerga entre regiones degradan las predicciones en usuarios cuyo registro difiere del de entrenamiento.
- No debe usarse de forma autónoma para decisiones sobre personas individuales (moderación, bloqueo de clientes); el autor recomienda emplearlo para resumir grandes volúmenes de feedback con revisión humana de los casos importantes.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- Métricas modestas (accuracy 0.679) y sin verificación independiente; el modelo solo supera ligeramente a un baseline TF-IDF y a DistilBERT multilingüe.
- Escasa adopción (0 descargas, 1 like) y ausencia de mantenimiento o versionado posteriores a la publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fateemah26/reviewradar-sentiment
- Modelo base: https://huggingface.co/cardiffnlp/twitter-xlm-roberta-base-sentiment
- Demo (Space): https://huggingface.co/spaces/fateemah26/ReviewRadar
- Código y preprocesado: https://github.com/khatabfatima26/Week-5-ReviewRadar
- Script de preprocesado: https://github.com/khatabfatima26/Week-5-ReviewRadar/blob/main/src/preprocess.py
- Dataset UCI Roman Urdu: https://archive.ics.uci.edu/dataset/458/roman+urdu+data+set
- Dataset Amazon reviews multi (en): https://huggingface.co/datasets/SetFit/amazon_reviews_multi_en
