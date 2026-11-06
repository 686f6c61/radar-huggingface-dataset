# Ganesh-Nadkarni/hastika-task-b-xlmr-base

## Resumen

`hastika-task-b-xlmr-base` es un modelo de clasificación de texto obtenido por ajuste fino de `FacebookAI/xlm-roberta-base` (278 millones de parámetros) sobre la tarea B del shared task HASTIKA @ ICON-2026. Su función concreta es identificar la categoría objetivo de un comentario de odio (Gender, Political, Religion, Geo-political, Violence, Others) en comentarios de YouTube escritos en código mixto kannada-inglés (kanglish). Lo desarrolla Ganesh-Nadkarni y se publica bajo licencia MIT.

El modelo resuelve un problema muy específico dentro de la moderación de contenido multilingüe: la clasificación de texto code-mixed, donde la transliteración, los préstamos léxicos y la mezcla de escrituras rompen los tokenizadores y los modelos entrenados solo en inglés o solo en kannada. Al partir de un encoder multilingüe como XLM-R base, el ajuste fino aprovecha representaciones subword compartidas para manejar variantes de transliteración.

Es relevante ahora por su carácter de componente de investigación dentro de un sistema mayor (el autor indica que forma parte de un blend), no como clasificador de producción autónomo. Con un macro-F1 de 0,409 en su partición de validación y un conjunto de entrenamiento pequeño, debe entenderse como una pieza de un pipeline de moderación asistida, no como un sustituto de moderadores humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), clasificación de secuencia |
| Parametros totales | 278.048.262 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó max_length 160 |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; admite cuantización estándar vía transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | kn, en (kannada-inglés code-mixed) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un XLM-RoBERTa base (transformer encoder de 12 capas, atención bidireccional completa, vocabulario SentencePiece multilingüe de 250.002 tokens) con una cabeza de clasificación de 6 etiquetas superpuesta al pooler. No hay innovaciones arquitectónicas: es un ajuste fino estándar de clasificación de secuencias.

El entrenamiento usó la partición de entrenamiento del dataset HASTIKA con un split estratificado 88/12 (train/held-out). Hiperparámetros declarados: max_length 160, batch size 16, precisión mixta, learning rate 1e-5, early stopping sobre macro-F1 de validación y pérdida ponderada por clase para compensar el desbalance (sin oversampling). No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo aumentación de datos por transliteración. El macro-F1 reportado en la partición held-out es 0,409.

## Capacidades

- Clasificación de texto multietiqueta única en 6 categorías objetivo de discurso de odio: Gender, Political, Religion, Geo-political, Violence, Others.
- Procesamiento de texto code-mixed kannada-inglés (kanglish), incluyendo escritura latina transliterada.
- Inferencia vía `transformers` pipeline `text-classification` y compatible con Text Embeddings Inference (endpoints_compatible).
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas del ajuste fino; el backbone XLM-R tiene cobertura más amplia, pero el ajuste la restringe a kn/en.
- Salida de logits por clase, utilizable como señal blanda dentro de un ensemble o blend.

## Casos de uso

- Moderación asistida en plataformas de vídeo con audiencia kannada: el modelo preclasifica comentarios y enruta los positivos a revisión humana, priorizando las categorías Violence y Gender por su mayor coste social.
- Componente de un ensemble de detección de odio: el autor lo diseñó como una pieza de un blend mayor; se usaría aportando sus logits a un meta-clasificador junto con modelos de otras arquitecturas o idiomas.
- Investigación en NLP code-mixed: sirve como baseline reproducible para comparar técnicas de normalización de transliteración, tokenización o aumentación sobre el dataset HASTIKA.
- Filtrado previo en pipelines de anotación: reduce el volumen de comentarios que llegan a anotadores humanos en proyectos de etiquetado de discurso de odio en kanglish.
- Análisis de sesgos por categoría objetivo: al separar Gender, Religion y Political, permite medir disparidades de error entre ejes temáticos en corpus de YouTube.
- Prototipado rápido de moderación en comunidades pequeñas: con 278 millones de parámetros cabe en una GPU consumer y se despliega con el pipeline de transformers en pocas líneas.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Macro-F1 (held-out 12 %) | 0,409 | Partición propia del autor, dataset HASTIKA |
| MMLU, HumanEval, GSM8K | no disponible | No aplicables a un clasificador |

No se han publicado resultados de benchmarks comparativos con otros sistemas del shared task en la información disponible. El único dato de rendimiento es el macro-F1 de 0,409 sobre la partición held-out, que el propio autor califica de débil en aislamiento.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 1,1 GB de pesos más activaciones; en fp16 unos 0,6 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: ninguna en particular; una RTX 3060, RTX 4090, T4, A10 o A100 son sobredimensionadas para este modelo. También funciona en CPU con latencia aceptable para lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` pipeline, Text Embeddings Inference (el repo está marcado como endpoints_compatible), ONNX Runtime y TorchScript tras exportación. No se documenta soporte nativo de vLLM ni llama.cpp (este último no aplica a un encoder).
- Latencia y throughput: no disponibles en la información proporcionada. Para un encoder de 278 M parámetros con secuencias de 160 tokens, el throughput típico en GPU moderna es del orden de miles de secuencias por segundo por lote, pero no hay medición publicada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hastika-task-b-xlmr-base | 278 M | 160 (entrenamiento) | Clasificación de odio kanglish, 6 clases | MIT | Hugging Face |
| xlm-roberta-base (base) | 278 M | 512 | Representaciones multilingües; sin cabeza de clasificación | MIT | Hugging Face |
| MuRIL (google/muril-base-cased) | 236 M | 512 | Comprensión multilingüe india (incluye code-mixed) | Apache 2.0 | Hugging Face |
| IndicBERT (ai4bharat/indic-bert) | 33 M | 512 | Clasificación en lenguas indias | MIT | Hugging Face |

No se dispone de comparaciones de rendimiento publicadas entre estos modelos y el presente checkpoint sobre el dataset HASTIKA. La comparación es estructural: XLM-R base y MuRIL son los backbones habituales para code-mixed indio, e IndicBERT es una alternativa mucho más ligera pero sin cobertura nativa de escritura latina transliterada.

## Limitaciones y advertencias

- Macro-F1 de 0,409 en validación: rendimiento bajo en términos absolutos; el autor advierte que en aislamiento es más débil que el blend del que forma parte.
- Entrenado sobre un dataset pequeño; se esperan errores en dialectos, sarcasmo, lenguaje reclamado y variantes de transliteración no vistas.
- Sesgos potenciales derivados del corpus de YouTube: sobrerrepresentación de ciertos registros, edades y comunidades, y posible sesgo de anotación en las categorías Religion y Political.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos con confianza alta; no debe usarse para sanciones automáticas sin revisión humana.
- Licencia MIT permite uso comercial, pero los términos del dataset HASTIKA son independientes y deben consultarse antes de cualquier uso distinto de la investigación.
- Cobertura lingüística restringida a kannada-inglés; no se ha validado en otras parejas code-mixed ni en kannada monolingüe formal.
- No hay información sobre calibración de probabilidades ni sobre umbrales operativos recomendados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ganesh-Nadkarni/hastika-task-b-xlmr-base
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Referencia del dataset y tarea: Kavatagi, S. and Rachh, R. (2025). HASTIKA: hate speech and target identification in Kannada-English code-mixed text. Language Resources and Evaluation, 59(3):2811-2856.
- Shared task: HASTIKA @ ICON-2026 (no se proporciona URL en la información disponible).
