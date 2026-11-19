# CobuildX-AI/cbx-indic-profanity-detector-58M

## Resumen

cbx-indic-profanity-detector-58M es un clasificador de contenido ofensivo desarrollado por CobuildX-AI, un detector de contenido ofensivo pensado para 12 lenguas de la India (hindi, bengalí, maratí, tamil, telugu, canarés, malabar, guyaratí, panyabí, oriya, asamés y urdu) además de inglés. El modelo recibe un comentario, mensaje o pasaje corto y devuelve cuatro etiquetas independientes (`profanity`, `insult`, `hate`, `sexual`) más una etiqueta global `offensive`. Resuelve un problema concreto de moderación en plataformas con audiencias del sur de Asia, donde el texto mezcla escritura nativa, transliteración latina (romanizada) y code-mixing entre lenguas.

Se construye sobre `jhu-clsp/mmBERT-small`, un encoder tipo ModernBERT, del que se ha podido el vocabulario hasta los 40.000 tokens relevantes para estas lenguas y se ha destilado a partir de un mmBERT-base afinado. Tiene 57.551.621 parámetros reales (según safetensors) y un tamaño de repositorio de 0,2 GB, lo que lo hace apto para inferencia en CPU. Existen variantes más pequeñas de la misma familia (36M y 17M).

Su relevancia actual radica en que cubre un hueco poco atendido: moderación multilingüe india con soporte explícito de texto romanizado y code-mixed, con licencia Apache-2.0 y latencias de milisegundos en CPU, lo que permite desplegarlo en sistemas de revisión de contenido a gran escala sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base `jhu-clsp/mmBERT-small` |
| Parametros totales | 57.551.621 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens por fragmento (textos más largos se truncan; `classify_document` procesa por chunks de 256 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT de tipo `mmBERT-small`, afinado para clasificación multi-etiqueta (`feature-extraction` / `text-classification`). El vocabulario se ha podado a 40.000 tokens, los que realmente usan las 12 lenguas objetivo más el inglés, lo que reduce el tamaño del embedding y acelera la inferencia. Sobre esta base se ha aplicado destilación desde un `mmBERT-base` ya afinado, lo que explica que una variante de 58M conserve buena parte del rendimiento del modelo mayor.

El entrenamiento se orienta a clasificación multi-etiqueta con cinco cabezas (cuatro etiquetas independientes más un flag `offensive` separado). La model card describe un conjunto de test gold de 3.980 textos nunca vistos en entrenamiento: unos 300 comentarios de redes sociales por lengua (procedentes de los splits de test de los datasets de origen; sin datos etiquetados de comentarios para guyaratí, panyabí, oriya y asamés) y unos 107 pasajes web por lengua india (documentos FineWeb-2 reservados). El etiquetado del gold se realizó con dos LLMs de forma independiente (Gemma 4 31B y Claude Haiku 5.5) siguiendo una guía de anotación escrita, con Claude Sonnet 5.5 resolviendo desacuerdos; ningún humano revisó las etiquetas gold. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Clasificación multi-etiqueta de contenido ofensivo: devuelve simultáneamente `profanity`, `insult`, `hate`, `sexual` y un flag global `offensive`.
- Soporte de texto en escritura nativa, romanizado (letras latinas) y code-mixed entre lenguas indias e inglés.
- Procesamiento por lotes: `classify` acepta una lista de textos y devuelve una lista de resultados.
- Procesamiento de documentos largos: `classify_document` divide en chunks de 256 tokens y devuelve la puntuación máxima por etiqueta y el número de chunks marcados.
- Umbrales configurables por etiqueta para ajustar el equilibrio precisión/recall (por ejemplo `thresholds={"insult": 0.3}`).
- Salida con puntuaciones por etiqueta (`scores`) además de las etiquetas activas, útil para priorizar colas de revisión.
- Detección de texto limpio: las cuatro etiquetas a "no" indican texto limpio.
- No soporta tool calling, function calling, agentes ni visión: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada a las 13 lenguas declaradas (12 indias más inglés); no cubre otras lenguas.

## Casos de uso

- Moderación de comentarios en redes sociales: el modelo clasifica cada comentario en milisegundos (unos 14 ms por comentario corto en CPU con 8 hilos) y permite filtrar automáticamente la cola de revisión humana usando el flag `offensive` como primera criba.
- Moderación de chats en vivo: con latencia de ~51 ms para un chunk completo de 256 tokens, puede integrarse en pipelines de mensajería en tiempo real para bloquear o marcar mensajes antes de su publicación.
- Filtrado de contenido generado por usuarios en plataformas de noticias y foros indios: el soporte de escritura nativa y romanizada cubre los comentarios reales de estas audiencias, que a menudo mezclan hindi romanizado con inglés.
- Detección de discurso de odio dirigido a grupos por religión, casta, etnia, nacionalidad, región, lengua, género, orientación sexual o discapacidad: la etiqueta `hate` permite enrutar estos casos a equipos especializados, aunque con recall limitado (0,45 en el gold y 0,23 en Hindi HateCheck).
- Detección de publicidad sexual o proposiciones explícitas: la etiqueta `sexual` tiene una precisión alta (0,96) y un F1 de 0,85, adecuada para bloquear anuncios de escort, pornografía o sex-chat en foros y apps de citas.
- Preprocesado de datasets para entrenamiento de otros modelos: usar el clasificador para etiquetar o limpiar grandes corpus multilingües indios antes de usarlos en el entrenamiento de LLMs, aprovechando su bajo coste computacional.
- Análisis de toxicidad en investigación sociolingüística: clasificar corpus de redes sociales en las 12 lenguas para estudiar prevalencia de insultos y discurso de odio, con la ventaja de soportar code-mixing que otros clasificadores no manejan.
- Moderación en comunidades de videojuegos y apps de mensajería con audiencia del sur de Asia: el modelo se ejecuta en CPU, por lo que puede desplegarse en el mismo servidor de la aplicación sin GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el gold test set (3.980 textos, etiquetado por LLMs, sin revisión humana). F1 por etiqueta con los umbrales de serie, porcentaje de textos limpios del gold (1.693) en los que se activa alguna etiqueta, y recall de `hate` en Hindi HateCheck (2.488 casos de test):

| Modelo | profanity | insult | hate | sexual | offensive | Textos limpios marcados | HateCheck-hi hate recall |
|---|---:|---:|---:|---:|---:|---:|---:|
| **este modelo (58M)** | 0,80 | 0,69 | 0,49 | 0,85 | 0,89 | 3,5% | 0,23 |
| 36M (misma familia) | 0,70 | 0,70 | 0,51 | 0,83 | 0,89 | 3,6% | 0,17 |
| 17M (misma familia) | 0,76 | 0,66 | 0,49 | 0,85 | 0,88 | 4,0% | 0,24 |
| Regla de léxico | 0,78 | — | 0,36 | 0,27 | 0,70 | 2,9% | 0,00 |
| TF-IDF + logístico | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Métricas por etiqueta del modelo 58M (precisión, recall, F1, PR-AUC) en el gold test set:

| Etiqueta | Precision | Recall | F1 | PR-AUC |
|---|---:|---:|---:|---:|
| `profanity` | 0,92 | 0,70 | 0,80 | 0,91 |
| `insult` | 0,89 | 0,56 | 0,69 | 0,84 |
| `hate` | 0,55 | 0,45 | 0,49 | 0,52 |
| `sexual` | 0,96 | 0,76 | 0,85 | 0,95 |
| `offensive` | 0,87 | 0,91 | 0,89 | 0,96 |

Umbrales de serie elegidos en validación para F1: profanity 0,50; insult 0,55; hate 0,46; sexual 0,81; offensive 0,42.

## Requisitos de hardware

- VRAM estimada para inferencia: con 57,6M de parámetros, en fp32 ocupa aproximadamente 230 MB de pesos; en fp16 unos 115 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (RTX 3060, RTX 4090, A100, H100); no es necesario hardware de datacenter.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU y CPU.
- Inferencia en CPU: aproximadamente 14 ms por comentario corto y 51 ms por chunk completo de 256 tokens en CPU de 8 hilos en fp32 (dato del autor).
- Opciones de despliegue: transformers (librería nativa), Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference` y `endpoints_compatible`), vLLM/llama.cpp/Ollama no están confirmados en la información disponible al ser un encoder de clasificación.
- Throughput estimado: no disponible de forma agregada; a partir de la latencia por chunk de 51 ms en CPU se puede estimar del orden de decenas de chunks por segundo por núcleo, pero el autor no publica una cifra de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 offensive | F1 hate | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| **cbx-indic-profanity-detector-58M** | 57,6M | 256 tokens | 0,89 | 0,49 | Apache-2.0 | Hugging Face |
| cbx-indic-profanity-detector-36M | 36M (no confirmado) | 256 tokens | 0,89 | 0,51 | Apache-2.0 (misma familia) | Hugging Face |
| cbx-indic-profanity-detector-17M | 17M (no confirmado) | 256 tokens | 0,88 | 0,49 | Apache-2.0 (misma familia) | Hugging Face |
| Regla de léxico | no aplica | no aplica | 0,70 | 0,36 | no disponible | no disponible |

No se dispone en la información proporcionada de comparaciones con otros clasificadores de toxicidad multilingües de terceros (por ejemplo, variantes de XLM-R o MuRIL afinadas para moderación); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- Las etiquetas gold del test set fueron generadas por LLMs sin revisión humana, por lo que contienen errores y los benchmarks deben interpretarse con cautela.
- El recall de `hate` es bajo (0,45 en el gold y 0,23 en Hindi HateCheck): el modelo deja pasar una parte importante del discurso de odio. No debe usarse como único mecanismo de moderación de odio.
- El recall de `insult` es 0,56: pierde más de un 40% de los insultos reales a los umbrales de serie.
- La etiqueta `offensive` es la más fiable (F1 0,89, recall 0,91) y debe usarse como criba principal; las cuatro etiquetas sirven para explicar el motivo, no como clasificadores independientes de alta recall.
- Bajar los umbrales para aumentar el recall dispara los falsos positivos: según el autor, ajustar en una muestra mitad ofensiva subió el F1 de profanity/insult unos 0,05 y triplicó la proporción de textos limpios marcados.
- El modelo solo ve el texto: no tiene acceso a la conversación, la imagen ni el vídeo a los que se refiere un comentario, lo que puede provocar errores en contextos irónicos o referenciales.
- El contexto máximo es de 256 tokens; textos más largos se truncan (`"truncated": True`) y deben procesarse con `classify_document`, que agrega por el máximo, no por contexto completo.
- Sin datos etiquetados de comentarios para guyaratí, panyabí, oriya y asamés: el rendimiento en estas lenguas es probablemente inferior y no está medido en el gold de comentarios.
- Riesgo de sesgo: al entrenarse sobre datos de redes sociales y pasajes web, puede sobrerrepresentar ciertos registros y fallar en variedades dialectales o en jerga emergente.
- El modelo es una ayuda para revisores humanos, no un juez del contenido ni de las personas, según indica el propio autor.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de origen (FineWeb-2 y los datasets de comentarios) por si imponen restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-indic-profanity-detector-58M
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- FineWeb-2 (dataset de pasajes web): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Hindi HateCheck (Röttger et al. 2022): https://arxiv.org/abs/2202.05690
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
