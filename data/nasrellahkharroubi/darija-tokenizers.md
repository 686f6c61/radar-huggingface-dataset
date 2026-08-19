# nasrellahkharroubi/darija-tokenizers

## Resumen

Darija Tokenizers es un repositorio que publica tres familias de tokenizadores subword entrenados sobre el mismo corpus de comentarios de YouTube en darija argelina, el dialecto árabe hablado en Argelia. Lo desarrolla nasrellahkharroubi, autor también del dataset DarijaDZ, y está pensado para facilitar el preprocesamiento de texto en tareas de NLP y entrenamiento de modelos de lenguaje para esta variedad lingüística, que combina escritura árabe, arabizi (árabe transliterado al alfabeto latino) y préstamos del francés.

El repositorio incluye tres algoritmos distintos —SentencePiece Unigram, WordPiece y byte-level BPE— cada uno con cinco tamaños de vocabulario (1.000, 5.000, 10.000, 20.000 y 30.000), más una variante de Unigram con subword regularization que permite muestreo estocástico en tiempo de codificación. Todos los artefactos son compatibles con `AutoTokenizer` de HuggingFace, lo que los hace fáciles de integrar en pipelines existentes. La licencia MIT permite uso comercial sin restricciones, y el tamaño del repositorio es de 0,0 GB, indicando que solo contiene archivos de tokenización, no pesos de modelos.

La relevancia de esta publicación radica en la escasez de recursos lingüísticos para el darija argelino, un dialecto con diferencias notables respecto al árabe estándar y con una presencia digital creciente. Disponer de tokenizadores específicos, evaluados y comparables entre sí, es un paso previo necesario para entrenar modelos de lenguaje de calidad en esta lengua.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizadores subword: SentencePiece Unigram, WordPiece (estilo BERT) y byte-level BPE (estilo GPT-2/RoBERTa) |
| Parámetros totales | No aplica (no es un modelo de lenguaje); tamaños de vocabulario: 1.000, 5.000, 10.000, 20.000 y 30.000 para cada familia |
| Parámetros activos | No aplica |
| Longitud de contexto | No disponible (no es un modelo generativo) |
| Tipos de cuantización | No aplica |
| Idiomas soportados | Árabe (darija argelina), con soporte para arabizi (transliteración latina) y fragmentos en francés gracias al byte-fallback |
| Licencia | MIT |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`, `.model` y `.vocab` (SentencePiece), `vocab.json` y `merges.txt` (BPE) |

## Arquitectura y entrenamiento

Los tokenizadores se entrenaron sobre el corpus DarijaDZ, compuesto por comentarios de YouTube en darija argelino. El autor no especifica el número total de tokens ni la composición exacta del dataset en la model card, pero sí indica que los comentarios mezclan escritura árabe, arabizi y francés dentro de un mismo documento, lo que condiciona el diseño de los tokenizadores.

Se implementan tres arquitecturas de tokenización subword:

- **SentencePiece Unigram**: basado en un modelo de lenguaje unigram, con byte-fallback activado y sin asumir pre-tokenización por espacios. Esto es clave para manejar secuencias mixtas de árabe, arabizi y francés.
- **Unigram + Subword Regularization**: la misma arquitectura Unigram, pero en lugar de usar decodificación determinista (Viterbi), se muestrea entre múltiples segmentaciones en tiempo de codificación, siguiendo la técnica de Kudo (2018). Esta variante solo está disponible a través de la API de `sentencepiece`, no en `AutoTokenizer`.
- **WordPiece**: estilo BERT, con piezas de continuación marcadas por `##`, implementado con la librería `tokenizers` de HuggingFace (no la versión de SentencePiece).
- **Byte-level BPE**: estilo GPT-2/RoBERTa, que opera sobre bytes y garantiza cero tokens desconocidos (OOV) por construcción.

La conversión de los modelos SentencePiece a `tokenizer.json` requirió una corrección específica para el byte-fallback en la decodificación, ya que el `SpmConverter` por defecto de `transformers` no generaba un decodificador consciente de bytes fuera del vocabulario. El autor implementó un `DarijaUnigramConverter` para resolverlo.

## Capacidades

- Tokenización determinista y reproducible para darija argelino, con soporte de byte-fallback para caracteres fuera del vocabulario.
- Manejo de escritura mixta: árabe, arabizi (transliteración latina) y fragmentos en francés dentro del mismo texto.
- Tres algoritmos diferentes para comparar y elegir según el caso de uso (Unigram, WordPiece, BPE).
- Cinco tamaños de vocabulario por algoritmo, lo que permite ajustar el equilibrio entre compresión y granularidad.
- Variante Unigram con subword regularization (muestreo estocástico) para aumentar la robustez en entrenamiento de modelos.
- Compatibilidad total con `AutoTokenizer.from_pretrained()` para todas las variantes deterministas.
- Los modelos WordPiece incluyen un token especial `[NEWLINE]` registrado para preservar saltos de línea, aunque con una limitación conocida (ver sección de limitaciones).
- Los modelos BPE y Unigram no presentan pérdida de información en el round-trip encode-decode (0 errores en la evaluación del autor).

## Casos de uso

- Preprocesamiento para entrenar modelos de lenguaje desde cero en darija argelino: los tokenizadores permiten segmentar el texto en piezas subword de forma consistente, reduciendo el vocabulario necesario y mejorando la cobertura de formas flexivas y préstamos.
- Normalización de texto en sistemas de análisis de sentimiento sobre redes sociales: al manejar arabizi y mezcla de escrituras, se puede tokenizar directamente el contenido de Twitter, Facebook o YouTube sin necesidad de transliteración previa.
- Construcción de corpus para traducción automática entre darija y árabe estándar o francés: la tokenización subword es un paso estándar en pipelines de traducción neuronal.
- Sistemas de diálogo y asistentes conversacionales en dialecto argelino: la compatibilidad con `AutoTokenizer` facilita la integración en frameworks como HuggingFace Transformers para tareas de generación o clasificación.
- Evaluación comparativa de algoritmos de tokenización: el repositorio ofrece métricas de compresión, fertilidad y round-trip para los tres métodos, útil para investigar qué tokenizador se adapta mejor a un dominio concreto.
- Aumento de datos y regularización en entrenamiento de modelos: la variante Unigram con subword regularization permite generar múltiples segmentaciones del mismo texto, lo que puede actuar como técnica de regularización durante el entrenamiento.
- Procesamiento de texto en aplicaciones de transcripción o subtitulado: el manejo de saltos de línea (con el wrapper `[NEWLINE]` para WordPiece) puede ser relevante para preservar la estructura de diálogos.

## Benchmarks y rendimiento

El autor evaluó los tokenizadores sobre un conjunto de validación de 1.926 documentos, excluidos del entrenamiento. Las métricas reportadas son:

- **CF (Compression Factor)**: menor es mejor (menos tokens generados por carácter).
- **Fertility**: tokens por palabra separada por espacios, menor es mejor.
- **Round-trip mismatches**: número de documentos donde `decode(encode(text)) != text` sobre 1.926.

| Tokenizer | Vocab | CF | Fertility | Round-trip mismatches |
|---|---:|---:|---:|---:|
| Unigram | 1.000 | 0.5546 | 2.7974 | 0 |
| Unigram + SR | 1.000 | 0.7349 | 3.7816 | 0 |
| WordPiece | 1.000 | 0.8105 | 4.2118 | 78 |
| BPE | 1.000 | 0.5258 | 2.6723 | 0 |
| Unigram | 5.000 | 0.3448 | 1.8159 | 0 |
| Unigram + SR | 5.000 | 0.5966 | 3.1201 | 0 |
| WordPiece | 5.000 | 0.8105 | 4. | (dato incompleto en la model card) |

La tabla se corta en la fila de WordPiece con vocabulario 5.000; no se dispone de los valores completos para el resto de tamaños. No se han publicado comparaciones con otros tokenizadores externos.

## Requisitos de hardware

- Al ser tokenizadores, no requieren GPU ni VRAM. La inferencia se realiza en CPU con uso de memoria insignificante (los archivos `.model` o `tokenizer.json` ocupan unos pocos megabytes).
- Cualquier máquina con Python y las librerías `transformers` o `sentencepiece` puede ejecutarlos sin problemas.
- No se han reportado requisitos de latencia o throughput; la tokenización de un documento es del orden de milisegundos.
- Para entrenar un modelo de lenguaje sobre darija con estos tokenizadores, el hardware dependerá del modelo en sí, no del tokenizador.

## Comparativa con modelos similares

Existe otro proyecto de tokenizadores para darija: `ImadSaddik/DarijaTokenizers` (GitHub), entrenado sobre el dataset AtlaSet con 10 millones de caracteres. Sin embargo, no se dispone de información pública sobre sus métricas de evaluación ni sobre su arquitectura exacta, más allá de que también es de código abierto. La comparación directa no es posible con los datos disponibles.

| Modelo | Algoritmos | Vocabularios | Corpus | Licencia |
|---|---|---|---|---|
| nasrellahkharroubi/darija-tokenizers | Unigram, WordPiece, BPE | 1K, 5K, 10K, 20K, 30K | DarijaDZ (YouTube) | MIT |
| ImadSaddik/DarijaTokenizers | No especificado | No especificado | AtlaSet (10M caracteres) | No especificada |

Se recomienda evaluar ambos en el corpus objetivo antes de elegir uno.

## Limitaciones y advertencias

- El tokenizador WordPiece colapsa los saltos de línea literales a un espacio en el round-trip `encode`-`decode`. El autor proporciona un wrapper con el token `[NEWLINE]` para mitigarlo, pero incluso con ese wrapper, un espacio adyacente a un salto de línea puede perderse.
- La variante Unigram + Subword Regularization no está disponible a través de `AutoTokenizer`; solo se puede usar con la API de `sentencepiece` (`enable_sampling=True`). Esto limita su integración en pipelines estándar de HuggingFace.
- El corpus de entrenamiento proviene de comentarios de YouTube, lo que puede introducir sesgos hacia el lenguaje informal, jerga y temáticas propias de esa plataforma. No es representativo de todos los registros del darija argelino.
- Los tokenizadores están optimizados para darija argelino; su rendimiento en otros dialectos magrebíes (marroquí, tunecino) puede ser subóptimo, aunque el byte-fallback evita errores graves.
- No se han publicado resultados de benchmarks externos (como MMLU u otros) porque no es un modelo de lenguaje, sino un componente de preprocesamiento.
- La evaluación del autor solo cubre métricas de compresión y round-trip; no hay datos sobre impacto en tareas posteriores (clasificación, generación, etc.).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nasrellahkharroubi/darija-tokenizers
- Dataset DarijaDZ (corpus de entrenamiento): https://huggingface.co/datasets/nasrellahkharroubi/DarijaDz
- Perfil del autor: https://huggingface.co/nasrellahkharroubi
- Proyecto alternativo de tokenizadores para darija (GitHub): https://github.com/ImadSaddik/DarijaTokenizers
