# CobuildX-AI/cbx-indic-profanity-detector-17M

## Resumen

cbx-indic-profanity-detector-17M es un clasificador de contenido ofensivo desarrollado por CobuildX-AI, orientado a la moderación de texto en 12 idiomas de la India (hindi, bengalí, maratí, tamil, telugu, kannada, malayalam, gujarati, punyabí, odia, asamés y urdu) más inglés. El modelo acepta texto en escritura nativa, romanizado y mezclado entre idiomas (code-mixed), y devuelve cuatro etiquetas independientes (`profanity`, `insult`, `hate`, `sexual`) más una etiqueta global `offensive`. Con 16,7 millones de parámetros y un repositorio de 0,1 GB, está pensado para ejecutarse en CPU con latencias de milisegundos.

Técnicamente es un fine-tuning del modelo base jhu-clsp/mmBERT-small, una arquitectura ModernBERT multilingüe. La variante de 17M se obtiene mediante destilación desde un mmBERT-base afinado, combinando una tabla de palabras factorizada de rango 128 y 6 de las 22 capas del modelo original. El resultado es un clasificador de extracción de características (`feature-extraction` / `text-classification`) con licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en la escasez de clasificadores de toxicidad específicos para lenguas indias, especialmente cuando el texto aparece romanizado o mezclado con inglés, un patrón muy habitual en redes sociales. El modelo prioriza la precisión sobre la cobertura en las cuatro etiquetas específicas, mientras que la etiqueta `offensive` actúa como filtro de alta recall (0,89) para decidir qué textos requieren revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), destilado de mmBERT-base; 6 de 22 capas, tabla de palabras factorizada de rango 128 |
| Parametros totales | 16.677.637 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens por fragmento (texto más largo se trunca; `classify_document` procesa por chunks de 256 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; el autor reporta inferencia en fp32 sobre CPU) |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en (escritura nativa, romanizada y code-mixed) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-small y se obtiene por destilación desde un mmBERT-base previamente afinado para la tarea. La arquitectura es un encoder transformer tipo ModernBERT reducido a 6 capas (de las 22 del base) con una tabla de embeddings de palabras factorizada de rango 128, lo que explica el tamaño final de 16,7M de parámetros frente a los 58M de la variante superior de la misma familia. El modelo base tiene 58M de parámetros; la familia incluye además una variante de 36M.

La información disponible no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de que se emplearon conjuntos de comentarios de redes sociales y pasajes web (documentos FineWeb-2 retenidos para evaluación). El conjunto de test gold contiene 3.980 textos etiquetados por dos LLM de forma independiente (Gemma 4 31B y Claude Haiku 5.5) con arbitraje de Claude Sonnet 5.5 en los desacuerdos, sin revisión humana. No se especifica si hubo RLHF o DPO; al tratarse de un clasificador multi-etiqueta, el entrenamiento se basa en supervisión con etiquetas.

La innovación técnica principal es la combinación de destilación con una tabla de embeddings factorizada, que reduce drásticamente el coste computacional manteniendo un rendimiento cercano al de la variante de 58M en varias etiquetas. El modelo incorpora además una cabeza separada para la etiqueta global `offensive`, que resulta ser la más fiable (F1 0,88, PR-AUC 0,96).

## Capacidades

- Clasificación multi-etiqueta de contenido ofensivo con cuatro categorías independientes: `profanity`, `insult`, `hate` y `sexual`.
- Etiqueta global `offensive` como indicador agregado de alta recall (0,89) para priorizar revisión.
- Procesamiento de texto en escritura nativa, romanizada y code-mixed (por ejemplo, hindi escrito en caracteres latinos mezclado con inglés).
- Soporte de 12 lenguas indias más inglés en un único modelo.
- Clasificación por lotes (listas de textos) y procesamiento de documentos largos mediante chunks de 256 tokens con agregación por máxima puntuación.
- Umbrales configurables por etiqueta para ajustar el equilibrio precisión/recall.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador de extracción, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de comentarios en redes sociales: el modelo puede filtrar en tiempo real comentarios en hindi romanizado o code-mixed con inglés, usando la etiqueta `offensive` como primer filtro y las cuatro etiquetas específicas para categorizar el motivo, con latencias de ~4 ms por comentario en CPU.
- Pre-moderación en foros y comunidades de la diáspora india: permite detectar insultos y discurso de odio en texto romanizado que los filtros basados en léxico en escritura nativa no capturan.
- Triaje de colas de revisión humana: al tener alta precisión en `profanity` (0,93) y `sexual` (0,96), el modelo puede etiquetar automáticamente los casos claros y derivar solo los ambiguos a moderadores.
- Filtrado de comentarios en plataformas de vídeo y streaming: integrado como paso previo al análisis de sentimiento o a la publicación, con `classify_document` para descripciones largas y chunks de 256 tokens.
- Investigación sociolingüística: permite medir la prevalencia de distintas categorías de toxicidad por lengua y por variedad (nativa frente a romanizada) en corpus de redes sociales.
- Protección de comunidades en apps de mensajería: el reducido tamaño (0,1 GB) y la inferencia en CPU permiten desplegarlo en el dispositivo o en servidores modestos para filtrar mensajes entrantes antes de mostrarlos.
- Enriquecimiento de datasets para entrenamiento: usar las etiquetas como señal débil para pre-anotar grandes volúmenes de texto en lenguas indias antes de una revisión humana.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test gold (3.980 textos, etiquetados por LLM sin revisión humana). F1 por etiqueta con los umbrales publicados, porcentaje de textos limpios en los que alguna etiqueta se activa, y recall de `hate` en Hindi HateCheck:

| Modelo | profanity | insult | hate | sexual | offensive | Textos limpios marcados | HateCheck-hi hate recall |
|---|---:|---:|---:|---:|---:|---:|---:|
| 58M (misma familia) | 0,80 | 0,69 | 0,49 | 0,85 | 0,89 | 3,5% | 0,23 |
| 36M (misma familia) | 0,70 | 0,70 | 0,51 | 0,83 | 0,89 | 3,6% | 0,17 |
| **este modelo (17M)** | 0,76 | 0,66 | 0,49 | 0,85 | 0,88 | 4,0% | 0,24 |
| Regla de léxico | 0,78 | — | 0,36 | 0,27 | 0,70 | 2,9% | 0,00 |
| TF-IDF + regresión logística | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Métricas por etiqueta del modelo (precisión, recall, F1, PR-AUC) sobre el test gold:

| Etiqueta | Precisión | Recall | F1 | PR-AUC |
|---|---:|---:|---:|---:|
| `profanity` | 0,93 | 0,64 | 0,76 | 0,91 |
| `insult` | 0,89 | 0,52 | 0,66 | 0,83 |
| `hate` | 0,45 | 0,53 | 0,49 | 0,45 |
| `sexual` | 0,96 | 0,76 | 0,85 | 0,94 |
| `offensive` | 0,87 | 0,89 | 0,88 | 0,96 |

Umbrales publicados (ajustados en validación para F1): profanity 0,60, insult 0,60, hate 0,28, sexual 0,82, offensive 0,45. No se han publicado resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (16,7M de parámetros); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo está pensado para CPU y no requiere GPU dedicada.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en dispositivos de borde.
- Latencia reportada por el autor en CPU (8 hilos, fp32): ~4 ms por comentario corto y ~17 ms por chunk completo de 256 tokens.
- Opciones de despliegue: transformers (librería nativa), text-embeddings-inference (tag `text-embeddings-inference`), endpoints compatibles (tag `endpoints_compatible`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, y al no ser un modelo generativo no aplican.
- Throughput estimado: no disponible de forma agregada; a partir de la latencia por comentario se pueden estimar varios cientos de clasificaciones por segundo en CPU multihilo, pero el autor no publica la cifra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | F1 `offensive` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cbx-indic-profanity-detector-17M | 16,7M | 256 tokens | 12 indias + en | 0,88 | Apache-2.0 | Hugging Face |
| cbx-indic-profanity-detector 58M (misma familia) | 58M | no disponible | 12 indias + en | 0,89 | Apache-2.0 | Hugging Face |
| cbx-indic-profanity-detector 36M (misma familia) | 36M | no disponible | 12 indias + en | 0,89 | Apache-2.0 | Hugging Face |
| Regla de léxico (baseline del autor) | — | — | depende del léxico | 0,70 | — | — |

No se dispone de información sobre otros clasificadores de toxicidad multilingües comparables (por ejemplo, variantes de HateBERT o XLM-R afinadas) en la documentación proporcionada, por lo que la comparativa se limita a las variantes de la misma familia y al baseline de léxico reportado por el autor.

## Limitaciones y advertencias

- Las etiquetas gold del conjunto de test fueron asignadas por LLM sin revisión humana, por lo que contienen errores y las métricas reportadas deben interpretarse con cautela.
- La etiqueta `hate` tiene un rendimiento bajo (precisión 0,45, F1 0,49, PR-AUC 0,45) y un recall de solo 0,24 en Hindi HateCheck; no es fiable como detector autónomo de discurso de odio.
- Las cuatro etiquetas específicas son precisas pero con recall limitado (profanity 0,64, insult 0,52); se pierden muchos casos ofensivos. La etiqueta `offensive` es la más fiable para decidir si un texto requiere atención.
- El modelo solo ve el texto aislado: no tiene acceso a la conversación, la imagen o el vídeo al que se refiere un comentario, lo que puede generar falsos positivos o negativos en contextos irónicos o referenciales.
- El contexto máximo es de 256 tokens; textos más largos se truncan, y `classify_document` agrega por máxima puntuación, lo que puede sobrerrepresentar fragmentos aislados.
- No hay datos etiquetados de comentarios para gujarati, punyabí, odia y asamés; la cobertura en esas lenguas se apoya en pasajes web y es probablemente inferior.
- El autor advierte que el modelo es una ayuda para revisores humanos, no un juez del contenido ni de las personas; no debe usarse para sanciones automáticas sin supervisión.
- Textos sobre crímenes, educación sexual, medicina o crítica política están pensados para clasificarse como limpios, pero el modelo puede fallar en esos dominios.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero no exime de cumplir la normativa aplicable sobre moderación de contenido y protección de datos.
- El modelo se publicó en noviembre de 2026 con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/CobuildX-AI/cbx-indic-profanity-detector-17M)
- [Modelo base jhu-clsp/mmBERT-small](https://huggingface.co/jhu-clsp/mmBERT-small)
- [HateCheck (Röttger et al. 2022)](https://arxiv.org/abs/2112.14168) — benchmark citado por el autor para el recall de `hate` en hindi
- [FineWeb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2) — fuente de los pasajes web usados en evaluación
