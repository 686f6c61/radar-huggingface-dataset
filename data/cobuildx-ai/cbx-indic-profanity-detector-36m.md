# CobuildX-AI/cbx-indic-profanity-detector-36M

## Resumen

cbx-indic-profanity-detector-36M es un clasificador de contenido ofensivo desarrollado por CobuildX-AI, orientado a la moderación de texto en 12 lenguas de la India (hindi, bengalí, maratí, tamil, telugu, canarés, malabar, guyaratí, panyabí, odia, asamés y urdu) además de inglés. El modelo recibe un comentario, mensaje o pasaje corto y devuelve cuatro etiquetas independientes (`profanity`, `insult`, `hate`, `sexual`) más una bandera global `offensive`. Está pensado para revisión humana asistida, no como juez automático de contenido.

Técnicamente es un fine-tune de `jhu-clsp/mmBERT-small` (58M parámetros) al que se han eliminado 11 de sus 22 capas, resultando en 36.456.965 parámetros. La destilación se realizó a partir de un mmBERT-base afinado, y el autor publica también variantes de 58M y 17M. La arquitectura es ModernBERT, con soporte nativo para texto en escritura nativa, romanizado y code-mixed (hindi-inglés, por ejemplo), lo que cubre el uso real en redes sociales del subcontinente.

Su relevancia actual radica en la escasez de clasificadores de toxicidad multilingües para lenguas índicas con licencia permisiva (Apache-2.0) y tamaño reducido para despliegue en CPU. Con un contexto de 256 tokens y latencias de 8-27 ms por fragmento en CPU de 8 hilos, es viable en pipelines de moderación de alto volumen. La model card advierte que las etiquetas de oro fueron anotadas por LLMs sin revisión humana, por lo que las métricas deben interpretarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder, 11 de 22 capas) |
| Parámetros totales | 36.456.965 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible (pesos safetensors; cuantización no especificada por el autor) |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-small`, un encoder ModernBERT multilingüe de 58M parámetros y 22 capas. El autor elimina una de cada dos capas (11 de 22) para obtener la variante de 36M, destilada desde un mmBERT-base previamente afinado para la tarea. Es un clasificador multi-etiqueta con cinco cabezas (cuatro etiquetas más la bandera `offensive`), con umbrales fijados en validación: profanity 0.85, insult 0.51, hate 0.44, sexual 0.94, offensive 0.41.

El conjunto de datos de entrenamiento no se detalla en la información disponible. La evaluación se realizó sobre un gold test de 3.980 textos nunca vistos en entrenamiento: unos 300 comentarios de redes sociales por lengua (procedentes de los splits de test de los datasets fuente; sin datos para guyaratí, panyabí, odia y asamés) y unos 107 pasajes web por lengua índica (documentos FineWeb-2 reservados). El etiquetado de oro lo realizaron dos LLMs de forma independiente (Gemma 4 31B y Claude Haiku 5.5) siguiendo una guía escrita, con Claude Sonnet 5.5 resolviendo desacuerdos. **Ninguna persona revisó las etiquetas de oro**, lo que introduce ruido en las métricas publicadas.

## Capacidades

- Clasificación multi-etiqueta de contenido ofensivo: devuelve de forma independiente `profanity`, `insult`, `hate` y `sexual`, más la bandera agregada `offensive`.
- Soporte de texto en escritura nativa (devanagari, bengalí, tamil, telugu, canarés, malabar, guyaratí, panyabí, odia, asamés, urdu árabe) y en transliteración latina (romanizado).
- Manejo de texto code-mixed, típico de redes sociales en la India (por ejemplo, hindi-inglés mezclado).
- Procesamiento por lotes: `classify()` acepta una lista de textos y devuelve una lista de resultados.
- Procesamiento de documentos largos: `classify_document()` divide en fragmentos de 256 tokens y devuelve la puntuación máxima por etiqueta y el número de fragmentos marcados.
- Umbrales configurables por etiqueta para ajustar el compromiso precisión/recall.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un encoder de clasificación puro.

## Casos de uso

- Moderación de comentarios en redes sociales: el modelo clasifica cada comentario y la bandera `offensive` (recall 0.91) decide si requiere revisión humana, mientras las cuatro etiquetas indican el motivo. Adecuado por su latencia de 8 ms por comentario corto en CPU.
- Filtrado previo en foros y comunidades de lenguas índicas: con 12 lenguas cubiertas y soporte de romanizado, permite una única pasarela de moderación para comunidades multilingües sin desplegar un modelo por idioma.
- Detección de anuncios sexuales y spam de escort: la etiqueta `sexual` alcanza precisión 0.96 y PR-AUC 0.94, lo que la hace útil para filtrar este tipo de contenido en plataformas de clasificados.
- Análisis de toxicidad en investigación social: procesamiento por lotes de corpus de redes sociales en hindi, bengalí, tamil, etc., con `classify_document()` para pasajes largos, generando etiquetas para estudios de discurso de odio.
- Enrutado en sistemas de atención al cliente: marcar mensajes abusivos antes de que lleguen a un agente humano, con umbrales ajustables para priorizar recall en `insult` en entornos donde se prefiere escalar de más.
- Pre-filtro en pipelines de anotación: usar `offensive` como criba para seleccionar candidatos a anotación humana, reduciendo el volumen de revisión manual en corpus multilingües.
- Moderación en aplicaciones de mensajería con presupuesto de cómputo limitado: el tamaño de 36M y la inferencia en CPU (27 ms por fragmento de 256 tokens) permiten despliegue en edge o en servidores sin GPU.

## Benchmarks y rendimiento

Datos de la model card sobre el gold test (3.980 textos, etiquetas generadas por LLMs sin revisión humana). F1 por etiqueta con los umbrales publicados, porcentaje de textos limpios marcados por error y recall de `hate` en Hindi HateCheck (2.488 casos de test):

| Modelo | profanity | insult | hate | sexual | offensive | Textos limpios marcados | HateCheck-hi recall de hate |
|---|---:|---:|---:|---:|---:|---:|---:|
| 58M (misma familia) | 0.80 | 0.69 | 0.49 | 0.85 | 0.89 | 3.5% | 0.23 |
| **este modelo (36M)** | 0.70 | 0.70 | 0.51 | 0.83 | 0.89 | 3.6% | 0.17 |
| 17M (misma familia) | 0.76 | 0.66 | 0.49 | 0.85 | 0.88 | 4.0% | 0.24 |
| Regla de léxico | 0.78 | — | 0.36 | 0.27 | 0.70 | 2.9% | 0.00 |
| TF-IDF + regresión logística | 0.64 | — | — | — | — | — | — |

Métricas por etiqueta del modelo (precisión, recall, F1, PR-AUC):

| Etiqueta | Precisión | Recall | F1 | PR-AUC |
|---|---:|---:|---:|---:|
| `profanity` | 0.96 | 0.55 | 0.70 | 0.90 |
| `insult` | 0.87 | 0.58 | 0.70 | 0.83 |
| `hate` | 0.54 | 0.48 | 0.51 | 0.48 |
| `sexual` | 0.96 | 0.74 | 0.83 | 0.94 |
| `offensive` | 0.87 | 0.91 | 0.89 | 0.96 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 36,5M parámetros en fp32 ocupa unos 146 MB de pesos, por lo que la inferencia cabe en cualquier GPU consumer con holgura.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para alto throughput, A100 o H100 no son necesarias pero permiten mayor paralelismo por lote.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series antiguas) y en iGPU con suficiente memoria compartida.
- Despliegue: transformers (librería indicada), text-embeddings-inference y endpoints compatibles (según tags). No se mencionan vLLM, llama.cpp ni Ollama; al ser un encoder de clasificación, no aplican los formatos GGUF estándar de generación.
- Latencia: 8 ms por comentario corto en CPU de 8 hilos en fp32; 27 ms por fragmento completo de 256 tokens. Throughput no publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 offensive | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| cbx-indic-profanity-detector-36M | 36,5M | 256 | 0.89 | Apache-2.0 | Hugging Face |
| cbx-indic-profanity-detector-58M (misma familia) | 58M | 256 | 0.89 | Apache-2.0 | Hugging Face |
| cbx-indic-profanity-detector-17M (misma familia) | 17M | 256 | 0.88 | Apache-2.0 | Hugging Face |
| Regla de léxico | — | — | 0.70 | — | — |
| TF-IDF + regresión logística | — | — | no disponible | — | — |

No se dispone de datos de otros clasificadores de toxicidad índicos comparables en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de oro del test fueron generadas por LLMs sin revisión humana; las métricas contienen errores y no deben tomarse como evaluación definitiva.
- Recall bajo en `hate` (0.48) y `insult` (0.58): el modelo pierde aproximadamente la mitad de los casos de odio e insulto reales. No es adecuado como único filtro de seguridad.
- Recall de `hate` en Hindi HateCheck de solo 0.17, muy inferior al de la variante de 58M (0.23) y al de la de 17M (0.24).
- La bandera `offensive` es la más fiable (F1 0.89, recall 0.91), pero las etiquetas individuales son precisas y con recall bajo; el autor recomienda usar `offensive` para decidir y las cuatro etiquetas para explicar.
- Contexto limitado a 256 tokens; textos más largos se truncan salvo que se use `classify_document()`.
- No hay datos etiquetados de comentarios para guyaratí, panyabí, odia y asamés; la cobertura de estas lenguas es más débil.
- El modelo juzga solo el texto: no ve la conversación, la imagen ni el vídeo a los que se refiere el comentario, lo que puede generar falsos positivos en contextos irónicos o citas.
- Ajustar umbrales a la baja para ganar recall multiplica por tres la proporción de textos limpios marcados (según pruebas del autor).
- Riesgo de sesgo: al entrenarse sobre datos de redes sociales, puede reproducir sesgos presentes en los corpus fuente; no se documentan análisis de sesgo por casta, religión o género.
- Licencia Apache-2.0 permite uso comercial, pero el autor insiste en que es una ayuda para revisores humanos, no un juez automático; el uso en producción debe acompañarse de revisión y apelación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-indic-profanity-detector-36M
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Hindi HateCheck (Röttger et al. 2022): no disponible en la información proporcionada
- FineWeb-2: no disponible en la información proporcionada
