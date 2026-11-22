# CobuildX-AI/cbx-emotion-classifier-17M

## Resumen

cbx-emotion-classifier-17M es un clasificador de emociones en inglés desarrollado por CobuildX-AI. Se trata de un fine-tuning del encoder Ettin de 17M de parámetros (jhu-clsp/ettin-encoder-17m) sobre el conjunto de datos GoEmotions de Google Research, y devuelve un etiquetado multi-label restringido a las seis emociones básicas de Ekman más la clase `neutral`: `anger`, `disgust`, `fear`, `joy`, `sadness`, `surprise` y `neutral`. Un mismo texto puede recibir varias etiquetas simultáneamente (por ejemplo `joy` y `surprise`), ya que el modelo aplica una sigmoide independiente por etiqueta con umbrales ajustados por clase.

El modelo resuelve el problema del análisis de sentimiento fino a escala: clasificar emociones concretas en textos cortos (comentarios, publicaciones, mensajes, reseñas) con un coste computacional mínimo. Con 16,8M de parámetros y un contexto máximo de 128 tokens, está pensado para despliegues de alto throughput en CPU o GPU modesta, con latencias del orden de milisegundos.

Su relevancia actual radica en la relación entre rendimiento y tamaño: alcanza un macro F1 de 0,609 en el test de GoEmotions, frente a 0,571 de una línea base TF-IDF con regresión logística y 0,635 del modelo hermano de 68M de la misma familia. La licencia Apache 2.0 y el formato safetensors facilitan su integración en producción sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Ettin encoder 17m, familia ModernBERT) |
| Parametros totales | 16.799.239 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (el texto superior se trunca) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF/ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder Ettin de 17M de parámetros, una arquitectura de tipo transformer encoder de la familia ModernBERT, y se fine-tunea como clasificador multi-label con una cabeza de salida sigmoide por etiqueta (siete salidas independientes). El entrenamiento utiliza exclusivamente el split de train de GoEmotions (43.410 comentarios de Reddit con anotaciones humanas), mapeado de las 27 emociones originales a las 7 etiquetas mediante la agrupación de Google. No se emplean datos adicionales, etiquetas generadas por LLM ni texto sintético.

Tras el fine-tuning, los umbrales de decisión se ajustan por etiqueta sobre el split de validación (5.426 comentarios) para maximizar el macro F1. Los umbrales resultantes oscilan entre 0,24 (`disgust`) y 0,39 (`sadness`). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa, algo coherente con la naturaleza de un clasificador encoder-only.

## Capacidades

- Clasificación multi-label de emociones en textos cortos en inglés: `anger`, `disgust`, `fear`, `joy`, `sadness`, `surprise` y `neutral`.
- Asignación de una probabilidad independiente por etiqueta, con umbrales ajustados por clase para maximizar el macro F1.
- Procesamiento por lotes de listas de textos (la API devuelve una lista de resultados).
- Manejo de marcadores de anonimización tipo `[NAME]`, presentes en los comentarios de Reddit del corpus de entrenamiento; los nombres en claro también funcionan.
- Detección de texto truncado mediante el campo `"truncated": True` cuando la entrada supera los 128 tokens.
- Uso tanto en CPU como en GPU.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.

## Casos de uso

- Moderación de comunidades y foros: clasificar comentarios de Reddit u otras plataformas por emoción para priorizar revisiones de contenido con alta carga de `anger` o `disgust`, aprovechando la latencia de ~3 ms en CPU por texto corto.
- Análisis de sentimiento a escala en encuestas y feedback: procesar miles de respuestas abiertas por segundo en CPU para agregar la distribución emocional por segmento de cliente, con umbrales ajustables según la tolerancia a falsos positivos del equipo.
- Enrutamiento de tickets de soporte: detectar `fear` o `sadness` en el primer mensaje del usuario y escalar automáticamente a agentes humanos o a flujos de atención prioritaria.
- Monitorización de reputación de marca: clasificar menciones en redes y reseñas para detectar picos de `anger` o `surprise` asociados a lanzamientos, incidencias o crisis, con procesamiento por lotes en pipelines de ingesta.
- Investigación en ciencias sociales y psicolingüística: anotación automática de corpus con las seis emociones de Ekman más `neutral`, usando las probabilidades por etiqueta como variables continuas en lugar de decisiones discretas.
- Filtrado previo en pipelines de generación: descartar o marcar comentarios tóxicos por carga emocional antes de pasarlos a un modelo generativo mayor, reduciendo coste y superficie de riesgo.
- Detección de satisfacción en encuestas NPS: combinar la etiqueta `joy` con la puntuación numérica para enriquecer el análisis de verbatims sin coste de anotación manual.

## Benchmarks y rendimiento

Resultados sobre el test original de GoEmotions (5.427 comentarios de Reddit, 33% neutral, 8% con más de una etiqueta), nunca usado en entrenamiento ni en selección de umbrales:

| Modelo | Macro F1 (umbrales ajustados) | Macro F1 a 0,3 | Macro F1 (6 emociones) | Micro F1 |
|---|---:|---:|---:|---:|
| 68M (misma familia) | 0,635 | 0,637 | 0,627 | 0,698 |
| **cbx-emotion-classifier-17M** | **0,609** | **0,599** | **0,599** | **0,677** |
| TF-IDF + regresión logística | 0,571 | 0,499 | 0,559 | 0,645 |

Rendimiento por etiqueta en el test de GoEmotions:

| Etiqueta | F1 | Precision | Recall | Umbral |
|---|---:|---:|---:|---:|
| `anger` | 0,54 | 0,49 | 0,60 | 0,28 |
| `disgust` | 0,48 | 0,50 | 0,46 | 0,24 |
| `fear` | 0,62 | 0,61 | 0,62 | 0,30 |
| `joy` | 0,80 | 0,77 | 0,83 | 0,32 |
| `sadness` | 0,56 | 0,58 | 0,53 | 0,39 |
| `surprise` | 0,61 | 0,55 | 0,67 | 0,27 |
| `neutral` | 0,66 | 0,60 | 0,75 | 0,33 |

Como referencia, el paper de GoEmotions (Demszky et al., 2020, Tabla 6) reporta un macro F1 de 0,64 para BERT-base (110M parámetros) con umbral fijo de 0,3; este modelo obtiene 0,599 en las mismas condiciones con 6,5 veces menos parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (16,8M de parámetros, ~67 MB de pesos), sin necesidad de cuantización.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo es viable en RTX 4090, A100, H100 y también en GPUs integradas o de gama baja.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna.
- Opciones de despliegue: transformers con el wrapper `cbx_emotion.EmotionClassifier` incluido en el repo; compatible con Text Embeddings Inference (tag `text-embeddings-inference`); al ser un encoder estándar de transformers, es desplegable con TGI y con ONNX Runtime si se exporta.
- Latencia medida por el autor en CPU (8 hilos, fp32): ~3 ms para un texto de 13 tokens y ~8 ms para un texto completo de 128 tokens. El throughput en GPU no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro F1 (GoEmotions) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| cbx-emotion-classifier-17M | 16,8M | 128 | 0,609 | Apache 2.0 | Hugging Face |
| cbx-emotion-classifier-68M (misma familia) | 68M | no disponible | 0,635 | no disponible en la información | Hugging Face |
| BERT-base (Demszky et al., 2020) | 110M | 512 | 0,64 (umbral 0,3) | Apache 2.0 | Hugging Face |
| TF-IDF + regresión logística | n/a | n/a | 0,571 | n/a | línea base propia |

El modelo de 17M sacrifica 0,026 puntos de macro F1 respecto a su hermano de 68M a cambio de una reducción de 4 veces en parámetros, y supera en 0,038 puntos a la línea base TF-IDF. Frente a BERT-base, la diferencia de 0,031 puntos a umbral 0,3 se compensa con un tamaño 6,5 veces menor y una latencia muy inferior.

## Limitaciones y advertencias

- Las etiquetas de GoEmotions son ruidosas: los anotadores discreparon con frecuencia y muchos textos admiten juicio. La mayoría de errores se producen entre una emoción y `neutral`.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y negativos en la clasificación, especialmente en textos ambiguos o irónicos.
- Solo admite inglés; no se ha entrenado ni evaluado en otros idiomas.
- Contexto limitado a 128 tokens: los textos más largos se truncan y pueden perder la carga emocional relevante.
- Con los umbrales ajustados, el 1,5% de los textos del test no recibe ninguna etiqueta (el campo `labels` queda vacío); los pipelines deben manejar este caso.
- El modelo se entrenó sobre comentarios de Reddit, lo que puede introducir sesgos de dominio y de registro ausentes en otros tipos de texto (documentación técnica, prensa formal).
- La etiqueta `neutral` puede coexistir con una emoción (aproximadamente el 3% de los textos de entrenamiento), lo que complica la interpretación si se asume exclusividad.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor remite a la sección "Intended use and disclaimer" de la model card, que no se ha incluido íntegramente en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-emotion-classifier-17M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Paper de GoEmotions (Demszky et al., ACL 2020): https://arxiv.org/abs/2005.00547
