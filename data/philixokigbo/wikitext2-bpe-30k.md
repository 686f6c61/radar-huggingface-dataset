# PhilixOkigbo/wikitext2-bpe-30k

## Resumen

`wikitext2-bpe-30k` es un tokenizador de tipo *byte-level Byte-Pair Encoding* (BPE) entrenado desde cero sobre el corpus WikiText-2 (`wikitext-2-v1`), desarrollado por Chinedu Okigbo y publicado bajo licencia MIT. No se trata de un modelo de lenguaje completo, sino de un componente de preprocesamiento que convierte texto en secuencias de subpalabras, con un vocabulario objetivo de 30.000 tokens. Su relevancia radica en ofrecer una alternativa ligera, determinista y sin tokens desconocidos para tareas de tokenización en inglés, especialmente en entornos donde se requiere un control fino sobre el vocabulario y la decodificación sin pérdidas.

El tokenizador está implementado con la librería `transformers` y se carga mediante `AutoTokenizer`. Su configuración incluye un normalizador NFKC (sin conversión a minúsculas), un pre-tokenizador ByteLevel y un post-procesador que añade los tokens especiales `[CLS]`, `$A` y `[SEP]`. Al estar basado en el alfabeto completo de 256 bytes, nunca emite `[UNK]` y la decodificación es lossless, lo que lo hace adecuado para pipelines de NLP que requieren fidelidad en la reconstrucción del texto original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizador) |
| Parametros totales | No aplica (vocabulario de 30.000 tokens) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Archivos de configuración y vocabulario (cargables con `AutoTokenizer`) |

## Arquitectura y entrenamiento

El tokenizador emplea el algoritmo *byte-level BPE*, que opera directamente sobre bytes en lugar de caracteres Unicode, lo que garantiza cobertura total del alfabeto y evita tokens desconocidos. El entrenamiento se realizó sobre el corpus WikiText-2 (`wikitext-2-v1`), un subconjunto a nivel de palabra de WikiText. Antes del entrenamiento, el texto se sometió a un proceso de limpieza: se eliminaron los marcadores `<unk>`, se revirtieron los artefactos `@-@`, `@.@` y `@,@`, se re-adjuntaron puntuaciones y posesivos separados, y se colapsaron los espacios en blanco. Además, se aplicó una deduplicación exacta sobre el split de entrenamiento, reduciendo las filas a 21.329.

La configuración del entrenamiento incluye un vocabulario objetivo de 30.000 tokens (realizado exactamente), una frecuencia mínima de par de 2, un normalizador NFKC sin minúsculas, un pre-tokenizador ByteLevel con `add_prefix_space=False` y un post-procesador que añade `[CLS] $A [SEP]`. Los tokens especiales definidos son `[PAD]`, `[UNK]`, `[CLS]`, `[SEP]` y `[MASK]`. No se emplearon técnicas de aprendizaje por refuerzo ni ajuste fino; el entrenamiento es puramente estadístico sobre el corpus.

## Capacidades

- Tokenización de texto en inglés mediante subpalabras BPE a nivel de byte.
- Decodificación lossless: al cubrir los 256 bytes, cualquier secuencia de bytes puede representarse sin pérdida de información.
- Tasa de `[UNK]` nula en los conjuntos de validación y prueba.
- Determinismo total: la tokenización es reproducible y no depende de estado aleatorio.
- Soporte de tokens especiales (`[PAD]`, `[UNK]`, `[CLS]`, `[SEP]`, `[MASK]`) para integración con modelos de lenguaje tipo BERT.
- Post-procesador que estructura la salida con `[CLS]` y `[SEP]`, facilitando el uso en tareas de clasificación o pares de secuencias.
- Eficiencia en términos de tokens por palabra: aproximadamente 1,197 tokens por palabra en validación y prueba.

## Casos de uso

- Preprocesamiento para entrenamiento de modelos de lenguaje: el tokenizador puede integrarse en pipelines de entrenamiento de modelos transformer, proporcionando una representación subword compacta y sin pérdidas para corpus en inglés.
- Tokenización para tareas de clasificación de texto: gracias al post-procesador con `[CLS]` y `[SEP]`, es adecuado para alimentar modelos tipo BERT en tareas como análisis de sentimiento o detección de spam.
- Construcción de vocabularios personalizados: al estar entrenado sobre WikiText-2, ofrece un vocabulario de 30k tokens específico para dominios enciclopédicos y periodísticos, útil para adaptar modelos a estos dominios.
- Evaluación de tokenizadores: su comportamiento determinista y su round-trip casi perfecto lo convierten en una referencia para comparar otros algoritmos de tokenización.
- Entornos con restricciones de memoria: al ser un tokenizador ligero (sin pesos de red neuronal), puede ejecutarse en dispositivos con recursos mínimos, como microcontroladores o navegadores.
- Investigación en subword tokenization: su configuración clara (byte-level, NFKC, sin minúsculas) permite estudiar el impacto de estas decisiones en la eficiencia de tokenización.

## Benchmarks y rendimiento

La model card proporciona métricas de evaluación sobre los conjuntos de validación y prueba de WikiText-2:

| Metrica | Validacion | Test |
|---|---|---|
| Lineas evaluadas | 2.461 | 2.858 |
| Total de tokens | 209.667 | 233.147 |
| Round-trip exacto (%) | 98,618 | 99,895 |
| Determinismo (%) | 100 | 100 |
| Tasa de [UNK] (%) | 0 | 0 |
| Tokens promedio por linea | 85,2 | 81,58 |
| Tokens mediana por linea | 72 | 66 |
| Tokens p95 por linea | 227 | 229 |
| Caracteres por token | 4,807 | 4,782 |
| Tokens por palabra | 1,197 | 1,197 |

Estos datos indican una alta fidelidad en la reconstrucción del texto original, con una tasa de error de round-trip inferior al 1,4% en validación y al 0,2% en test. No se han publicado comparaciones con otros tokenizadores en la información disponible.

## Requisitos de hardware

- Al ser un tokenizador, no requiere GPU ni VRAM. Funciona exclusivamente en CPU.
- Puede ejecutarse en cualquier entorno con Python y la librería `transformers` instalada, incluyendo máquinas con menos de 1 GB de RAM.
- El tamaño del vocabulario (30.000 tokens) implica un archivo de vocabulario de aproximadamente 300-500 KB, dependiendo del formato.
- Para integración en pipelines de producción, se recomienda usar `transformers` con `AutoTokenizer`, que gestiona la carga y el caché de forma eficiente.
- No se requieren opciones de despliegue especializadas como vLLM u Ollama, ya que no es un modelo generativo.

## Comparativa con modelos similares

| Caracteristica | wikitext2-bpe-30k | GPT-2 tokenizer | Llama tokenizer |
|---|---|---|---|
| Algoritmo | Byte-level BPE | Byte-level BPE | BPE (SentencePiece) |
| Vocabulario | 30.000 | 50.257 | 32.000 |
| Cobertura de bytes | Completa (256 bytes) | Completa | Completa |
| Tokens especiales | 5 (PAD, UNK, CLS, SEP, MASK) | 4 (PAD, UNK, BOS, EOS) | 3 (BOS, EOS, UNK) |
| Normalizacion | NFKC sin minúsculas | Sin normalizacion | NFKC con minúsculas |
| Pre-tokenizador | ByteLevel | ByteLevel | ByteLevel |
| Post-procesador | [CLS] $A [SEP] | Ninguno | Ninguno |
| Licencia | MIT | MIT | MIT |
| Corpus de entrenamiento | WikiText-2 | WebText | Varios (multilingue) |

La comparativa muestra que `wikitext2-bpe-30k` se distingue por su vocabulario más reducido y su post-procesador orientado a tareas de clasificación, mientras que GPT-2 y Llama ofrecen vocabularios más amplios y están diseñados para modelos generativos. No se dispone de datos de rendimiento comparativo en tareas de tokenización.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no tiene capacidades de razonamiento ni de comprensión semántica. Solo realiza tokenización.
- Entrenado exclusivamente en inglés: su vocabulario y estadísticas están sesgados hacia el inglés, por lo que no es adecuado para otros idiomas sin reentrenamiento.
- El corpus WikiText-2 es relativamente pequeño (unas 21.000 filas tras limpieza), lo que puede limitar la cobertura de vocabulario en dominios muy especializados o jerga técnica.
- El round-trip exacto no es del 100% en validación (98,6%), lo que implica que algunos textos pueden no reconstruirse idénticamente tras tokenizar y decodificar, aunque la tasa de error es baja.
- No se han documentado sesgos específicos, pero al derivar de Wikipedia, puede reflejar los sesgos presentes en ese corpus.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PhilixOkigbo/wikitext2-bpe-30k
- Dataset WikiText (Salesforce): https://huggingface.co/datasets/Salesforce/wikitext
- Ejemplo de tokenizador GPT-2 en HuggingFace: https://huggingface.co/huggingface/gpt2-wikitext2
- Documentación de WikiText-2 en PyTorch: https://github.com/pytorch/examples/blob/main/word_language_model/data/wikitext-2/README
