# juanmorc/xlmr-sarcasmo-bs64

## Resumen

xlmr-sarcasmo-bs64 es un modelo de clasificación de texto obtenido mediante ajuste fino (fine-tuning) de FacebookAI/xlm-roberta-large, publicado por el usuario juanmorc en Hugging Face. Su propósito declarado, a partir del nombre, es la detección de sarcasmo en texto, aunque la model card no documenta explícitamente ni el conjunto de datos de entrenamiento ni los idiomas cubiertos. Se trata de un checkpoint de tipo encoder-only con 559.892.482 parámetros, derivado de la arquitectura XLM-RoBERTa en su variante large.

El modelo se distribuye con licencia MIT y pesos en formato safetensors, con un repositorio de 2,3 GB. Su relevancia es limitada pero concreta: ofrece un punto de partida para tareas de clasificación binaria o multietiqueta relacionadas con sarcasmo, ironía o análisis de sentimiento, sobre una base multilingüe (XLM-RoBERTa) que cubre cien idiomas en su preentrenamiento original. No obstante, la ausencia de documentación sobre el dataset, los idiomas efectivos y las clases de salida reduce su utilidad en producción sin una validación previa por parte del usuario.

La model card indica que el modelo alcanza una accuracy de 0,9372 y un F1 macro de 0,9341 en el conjunto de evaluación, aunque no se especifica qué conjunto es ni cómo se construyó. El entrenamiento se realizó durante 8 épocas con un batch total de 64, learning rate de 1e-05 y precisión mixta nativa, según los hiperparámetros registrados por el Trainer de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa large) |
| Parametros totales | 559.892.482 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa soporta hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base XLM-RoBERTa es multilingüe, pero no se documenta el alcance efectivo tras el fine-tuning) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de FacebookAI/xlm-roberta-large, un transformer encoder-only con 24 capas, 16 cabezas de atención y una dimensión oculta de 1024 (arquitectura estándar de XLM-RoBERTa large). Sobre esta base se ha añadido una cabeza de clasificación de texto, típicamente una capa lineal sobre el token [CLS], aunque la model card no detalla la configuración exacta de la cabeza ni el número de clases de salida.

El entrenamiento se realizó con el Trainer de Hugging Face durante 8 épocas, con un batch total de 64 (batch de 8 y 8 pasos de acumulación de gradientes), learning rate de 1e-05, scheduler lineal con 10 % de warmup, optimizador AdamW fused y precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no se especifica ("unknown dataset" en la model card), lo que impide evaluar la composición, el idioma y el equilibrio de clases. No se documenta el uso de RLHF, DPO ni técnicas de aumentación de datos.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación, presumiblemente detección de sarcasmo, aunque no se documenta el número ni la etiqueta de las clases.
- Análisis de sentimiento e ironía: por su nombre y base, es plausible su uso en tareas afines, pero no está confirmado.
- Capacidades multilingües: heredadas del preentrenamiento de XLM-RoBERTa, aunque no se especifica qué idiomas se cubren tras el fine-tuning.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio: es un encoder de clasificación, no un modelo generativo.
- No se documenta modo thinking, decodificación especulativa ni otras capacidades avanzadas.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede clasificar mensajes como sarcásticos o no sarcásticos para priorizar revisiones humanas, siempre que se valide su comportamiento en el dominio concreto y el idioma de despliegue.
- Análisis de opiniones de clientes: integrado en un pipeline de NLP, puede etiquetar reseñas con carga irónica para separar el sentimiento literal del figurado antes de agregar métricas de satisfacción.
- Investigación en lingüística computacional: sirve como baseline fine-tuneado para experimentos sobre detección de sarcasmo en corpus multilingües, comparando con otros checkpoints derivados de XLM-R.
- Filtrado de datasets: puede usarse para anotar automáticamente grandes volúmenes de texto y construir subconjuntos etiquetados de sarcasmo para entrenar modelos posteriores.
- Análisis de discurso en medios: permite detectar tono irónico en titulares o tuits para estudios de opinión pública, con la cautela de validar el idioma y el dominio.
- Enriquecimiento de pipelines de atención al cliente: como clasificador auxiliar que marque conversaciones potencialmente irónicas para derivarlas a agentes humanos con contexto adicional.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card, correspondientes al conjunto de evaluación interno (no identificado). No se han publicado resultados en benchmarks estándar como MMLU, GLUE o similar.

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,2891 |
| Accuracy | 0,9372 |
| F1 Macro | 0,9341 |
| F1 Weighted | 0,9372 |

Evolución por época (extracto de la model card):

| Epoca | Validation loss | Accuracy | F1 macro |
|---|---|---|---|
| 1 | 0,3743 | 0,8534 | 0,8504 |
| 2 | 0,2174 | 0,9186 | 0,9128 |
| 3 | 0,2090 | 0,9325 | 0,9285 |
| 4 | 0,2247 | 0,9332 | 0,9291 |
| 5 | 0,2482 | 0,9322 | 0,9285 |
| 6 | 0,2891 | 0,9372 | 0,9341 |
| 7 | 0,3458 | 0,9359 | 0,9324 |
| 8 | 0,3937 | 0,9353 | 0,9315 |

Se observa sobreajuste a partir de la época 6: la validation loss repunta mientras la accuracy se estabiliza, lo que sugiere que el checkpoint final no es necesariamente el óptimo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (559,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: alrededor de 1,1 GB para pesos, más memoria de activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en batches pequeños; A100, H100, RTX 4090, RTX 3090 o RTX 4080 son suficientes y holgadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070 o superiores, e incluso en GPUs con 4-6 GB en fp16 con batches reducidos.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (el tag está presente), endpoints compatibles de Hugging Face, ONNX Runtime y potencialmente llama.cpp no aplica (no es un modelo GGUF). vLLM y TGI no están orientados a clasificación de forma nativa, aunque TGI soporta algunos modelos de clasificación.
- Latencia y throughput: no disponibles; para un encoder de 559 M de parámetros en una GPU moderna se espera un throughput alto (cientos o miles de secuencias por segundo en batch), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juanmorc/xlmr-sarcasmo-bs64 | 559,9 M | no disponible (base: 512) | Clasificación (sarcasmo) | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 tokens | Modelo base multilingüe | MIT | Hugging Face |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | ~278 M | 512 tokens | Análisis de sentimiento multilingüe | MIT | Hugging Face |
| roberta-large (English) | 355 M | 512 tokens | Modelo base en inglés | MIT | Hugging Face |

La comparación directa con otros detectores de sarcasmo públicos no está disponible en la información proporcionada. Frente a XLM-RoBERTa large, este checkpoint añade una cabeza de clasificación entrenada, pero carece de la documentación y validación externa del modelo base. Frente a alternativas de sentimiento como las de CardiffNLP, la cobertura idiomática y la calidad en dominios distintos al de entrenamiento no están verificadas.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica "unknown dataset", por lo que no se puede evaluar el sesgo, la composición ni la representatividad de las clases.
- Idiomas no documentados: aunque el modelo base es multilingüe, no se especifica en qué idiomas se ha entrenado ni su rendimiento fuera de ellos; el uso en castellano requiere validación empírica.
- Riesgo de sobreajuste: la validation loss aumenta a partir de la época 6, lo que sugiere que el checkpoint final puede generalizar peor que checkpoints intermedios.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas en dominios distintos al de entrenamiento.
- Sesgos: no documentados; los modelos de sarcasmo suelen mostrar sesgos culturales y de dominio (por ejemplo, mejor rendimiento en tuits que en texto formal).
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base (MIT) y de los datos de entrenamiento, que se desconocen.
- Caveat para producción: sin una evaluación independiente en el dominio objetivo, no se recomienda desplegarlo como clasificador único en sistemas críticos.

## Enlaces

- [Hugging Face: juanmorc/xlmr-sarcasmo-bs64](https://huggingface.co/juanmorc/xlmr-sarcasmo-bs64)
- [Modelo base: FacebookAI/xlm-roberta-large](https://huggingface.co/FacebookAI/xlm-roberta-large)
- [Paper de XLM-RoBERTa (Conneau et al., 2019)](https://arxiv.org/abs/1911.02116)
- [Documentación de Transformers para clasificación de texto](https://huggingface.co/docs/transformers/tasks/sequence_classification)
