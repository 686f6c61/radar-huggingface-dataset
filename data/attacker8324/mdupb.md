# attacker8324/mdupB

## Resumen

El repositorio `attacker8324/mdupB` contiene una copia de los pesos de BERT base uncased, el modelo de lenguaje encoder-only publicado originalmente por Google Research en 2018 y descrito en el artículo "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding" (arXiv:1810.04805). Se trata de un transformer bidireccional de 110.106.428 parámetros (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) preentrenado sobre BookCorpus y Wikipedia en inglés mediante enmascaramiento de tokens (MLM) y predicción de la siguiente frase (NSP).

El modelo no genera texto de forma autorregresiva: produce representaciones contextuales bidireccionales que se aprovechan mediante fine-tuning para clasificación de secuencias, etiquetado de tokens, extracción de características y question answering extractivo. Su relevancia actual es la de un estándar de referencia histórico y una línea base ligera para tareas de NLP en inglés, con un coste de inferencia muy bajo comparado con los LLM generativos.

La ficha se elabora a partir de la información disponible en el repositorio y en la model card, que reproduce la de `bert-base-uncased`. No hay datos propios del autor sobre entrenamiento adicional, benchmarks ni ajustes específicos, y el repositorio presenta metadatos y tags que no coinciden con un uso convencional (tags de `tf`, `jax`, `rust`, `coreml`, `onnx`, `safetensors` junto a `pytorch`, sin pipeline declarado).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only bidireccional (BERT base) |
| Parámetros totales | 110.106.428 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT base; no confirmado explícitamente en la información disponible) |
| Tipos de cuantización | No disponible (no se listan cuantizaciones publicadas en el repo) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según metadatos del repo); la model card menciona uso en PyTorch y TensorFlow |

## Arquitectura y entrenamiento

BERT base uncased es un transformer encoder-only con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y 110M de parámetros. El preentrenamiento es autosupervisado y combina dos objetivos: masked language modeling (MLM), en el que se enmascara el 15% de los tokens y el modelo debe predecirlos usando contexto bidireccional, y next sentence prediction (NSP), en el que se clasifica si dos segmentos son consecutivos en el corpus original. El vocabulario es WordPiece con 30.522 tokens y el texto se normaliza a minúsculas y sin acentos (uncased).

Los datos de preentrenamiento declarados son BookCorpus y Wikipedia en inglés. No se especifica en la información disponible el número exacto de tokens, la composición detallada del dataset ni si hubo fases de RLHF o DPO (no aplicables al paradigma original de BERT). Tampoco se documentan innovaciones adicionales del autor del repositorio, como decodificación especulativa o atención lineal; el modelo sigue la arquitectura y el esquema de entrenamiento originales descritos en arXiv:1810.04805.

## Capacidades

- Generación de representaciones contextuales bidireccionales para texto en inglés.
- Masked language modeling: relleno de tokens enmascarados mediante `pipeline('fill-mask')`.
- Clasificación de secuencias tras fine-tuning (análisis de sentimiento, detección de spam, clasificación de temas).
- Etiquetado de tokens tras fine-tuning (NER, POS tagging, chunking).
- Question answering extractivo tras fine-tuning (SQuAD y similares).
- Extracción de embeddings de frase o documento para búsqueda semántica y clustering.
- Next sentence prediction como tarea auxiliar.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe limitada: solo inglés (existen variantes multilingües separadas, no incluidas en este repo).

## Casos de uso

- Clasificación de textos en inglés en producción: fine-tuning de una cabeza de clasificación sobre las representaciones del encoder para moderación de comentarios, detección de spam o categorización de tickets; el modelo es ligero (110M parámetros) y permite inferencia por CPU con latencias bajas.
- Extracción de entidades nombradas (NER): ajuste sobre datasets etiquetados tipo CoNLL-2003 para identificar personas, organizaciones y localizaciones en documentos en inglés.
- Question answering extractivo sobre documentos: fine-tuning sobre SQuAD para localizar la respuesta dentro de un pasaje de hasta 512 tokens, útil en asistentes de documentación técnica.
- Búsqueda semántica y deduplicación: uso de los embeddings del token `[CLS]` o de la media de estados ocultos para indexar y recuperar documentos por similitud coseno.
- Relleno de huecos y corrección asistida: uso directo del pipeline `fill-mask` para sugerir palabras en plantillas, tests de completado o herramientas de escritura en inglés.
- Feature extraction para modelos downstream: congelar BERT como extractor de características y entrenar clasificadores ligeros encima, reduciendo coste de entrenamiento frente a fine-tuning completo.
- Análisis de sentimiento en reseñas: fine-tuning sobre SST-2 o datasets propios para clasificación binaria o multiclase en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas propias del repositorio ni comparativas numéricas; los resultados de referencia de BERT base uncased en GLUE, SQuAD y MNLI corresponden a la publicación original de Google y no se reproducen aquí por no estar incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (110M parámetros × 4 bytes), más activaciones y memoria del tokenizador; en la práctica, menos de 2 GB para batches pequeños.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para alto throughput, una NVIDIA T4, L4, RTX 3060 o superior es suficiente. A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: Hugging Face Transformers (PyTorch y TensorFlow), ONNX Runtime, TorchScript, posible conversión a Core ML y a otros runtimes según los tags del repo; no se documenta soporte nativo de vLLM, llama.cpp u Ollama (orientados a modelos generativos).
- Latencia y throughput: no disponibles de forma oficial en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por secuencia corta en GPU moderna y decenas de milisegundos en CPU, sin cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `attacker8324/mdupB` (BERT base uncased) | 110M | 512 tokens (estándar BERT) | Inglés | Apache 2.0 | Hugging Face |
| `bert-base-cased` | 110M | 512 tokens | Inglés | Apache 2.0 | Hugging Face |
| `bert-large-uncased` | 340M | 512 tokens | Inglés | Apache 2.0 | Hugging Face |
| `roberta-base` | 125M | 512 tokens | Inglés | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, contexto, idioma y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: la model card advierte que, pese a que los datos de entrenamiento pueden considerarse relativamente neutros, el modelo puede producir predicciones sesgadas; se recomienda evaluar sesgos antes de usos sensibles.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir predicciones de tokens enmascarados plausibles y erróneas en `fill-mask`, y clasificaciones poco calibradas fuera de dominio.
- Limitación de contexto: 512 tokens; textos más largos requieren truncado o segmentación, lo que puede perder información.
- Limitación de idioma: solo inglés; no es adecuado para castellano ni otras lenguas sin fine-tuning o sin usar una variante multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales del autor del repo.
- Caveats de producción: el repositorio no declara pipeline ni tarea, los tags mezclan runtimes (PyTorch, TF, JAX, Rust, Core ML, ONNX) sin artefactos verificables, y el número de descargas es bajo (25); conviene validar la integridad de los pesos antes de desplegarlos y preferir el repositorio canónico `bert-base-uncased` para uso en producción.
- No es un modelo generativo: no debe usarse para generación de texto libre, chat ni agentes; para esas tareas se requieren modelos autorregresivos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/attacker8324/mdupB
- Modelo canónico de referencia: https://huggingface.co/bert-base-uncased
- Artículo original de BERT: https://arxiv.org/abs/1810.04805
- Repositorio de Google Research: https://github.com/google-research/bert
- README de versiones de BERT: https://github.com/google-research/bert/blob/master/README.md
