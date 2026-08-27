# sajalregmi4/arkios-tokenizer

## Resumen

Arkios es un tokenizer byte-level BPE diseñado específicamente para modelado de lenguaje bilingüe nepalí–inglés, desarrollado por Sajal Regmi. Su objetivo principal es resolver el problema de la alta fertilidad de tokens en idiomas con escritura devanagari, donde el pre-tokenizador estándar basado en `\p{L}+` corta cada palabra en múltiples fragmentos al no reconocer las marcas vocálicas combinantes (`\p{Mn}`, `\p{Mc}`). Este tokenizer utiliza una clase de palabra consciente de marcas (`[\p{L}\p{M}]+`, similar al patrón de GPT-4o) que reduce la fertilidad del nepalí de 4.78 a 1.58 tokens por palabra en condiciones idénticas.

El tokenizer alcanza 1.69 tokens por palabra en nepalí con un vocabulario de 65.536 tokens, el más bajo de cualquier tokenizer generativo probado con un cuarto del vocabulario de las alternativas más cercanas. Incluye características como byte fallback (nunca hay tokens fuera de vocabulario), normalización NFC, pre-segmentación de dígitos (ASCII y devanagari) y tokens especiales colocados en la parte superior del rango de IDs. El autor publica código, harness y resultados completos en un repositorio de GitHub y un paper titulado "Vowel Signs Are Not Letters: A Pre-tokenization Ceiling on Multilingual Tokenizer Fertility".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE con pre-tokenización consciente de marcas |
| Parametros totales | No aplicable (no es un modelo de lenguaje) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (tokenizer, no modelo) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | tokenizer.json (formato HuggingFace), arkios_tokenizer.bin (formato C/CUDA), byte_lengths.npy |

## Arquitectura y entrenamiento

El tokenizer implementa un algoritmo byte-level BPE con `byte_fallback=true`, lo que garantiza que ningún carácter quede fuera de vocabulario. El vocabulario tiene 65.536 tokens: 256 bytes + 65.254 merges + 26 tokens especiales. Los tokens especiales se colocan en los IDs 65.510–65.535 (en la parte superior) para que el vocabulario aprendido sea un bloque contiguo desde el ID 0. La normalización usa NFC. La pre-tokenización incluye una división de dígitos en grupos de máximo 3 (tanto ASCII 0-9 como devanagari ०-९) y una división de palabras consciente de marcas Unicode (`[\p{L}\p{M}]+`), que evita cortar las palabras en las vocales combinantes. Se usó un dataset de entrenamiento compuesto por texto web público: inglés (FineWeb-Edu), nepalí (FineWeb-2 `npi_Deva`, AI4Bharat Sangraha, IndicCorpV2, Wikipedia nepalí), código (GitHub con licencias permisivas) y matemáticas (OpenWebMath), además de un corpus privado que no se redistribuye. El autor audita los tokens devanagari para evitar que se codifique texto no público.

## Capacidades

- Tokenización de texto nepalí e inglés con alta eficiencia (1.69 tokens/palabra en nepalí, 1.30 en inglés).
- Soportado por la librería `tokenizers` de HuggingFace y compatible con `transformers` y `llama.cpp`.
- Byte-fallback: cualquier secuencia de bytes se puede codificar sin tokens OOV, round-trip exacto tras normalización NFC.
- Pre-segmentación de dígitos para representación uniforme de números (no hay tokens con 4+ dígitos consecutivos).
- Compatible con el ecosistema de HuggingFace: se puede cargar con `Tokenizer.from_file` o `from_pretrained`.
- Incluye un fichero `byte_lengths.npy` con la longitud en bytes de cada token, útil para comparar bits-per-byte entre tokenizers.

## Casos de uso

- Entrenamiento de modelos de lenguaje generativos en nepalí: al reducir la fertilidad de tokens, se reduce el coste de entrenamiento y se mejora la compresión (menos bits por token).
- Modelos multilingües nepalí-inglés: permite un vocabulario compacto que cubre ambos idiomas sin inflar el tamaño del modelo.
- Traducción automática nepalí-inglés: al mantener una representación eficiente de ambos idiomas, se reduce la longitud de las secuencias y se mejora el rendimiento.
- Aplicaciones de procesamiento de texto en nepalí (OCR, análisis de sentimiento, chatbots): el tokenizer se puede integrar en pipelines de NLP.
- Evaluación de tokenizadores: el fichero `byte_lengths.npy` facilita la comparación de bits-per-byte entre tokenizadores, útil para investigación.
- Despliegue en producción con llama.cpp: al ser compatible con este formato, se puede usar en motores de inferencia locales.

## Benchmarks y rendimiento

La tabla siguiente muestra los resultados medidos en FLORES-200 `devtest` (texto NFC idéntico) comparando la fertilidad de tokens y bits-per-byte en nepalí e inglés.

| Tokenizer | Vocab | Nepali tok/word | Nepali B/tok | English tok/word | Lossless |
|---|---|---:|---:|---:|:--:|
| IndicBERTv2 | 250,000 | 1.58 | 11.54 | 1.24 | yes¹ |
| **Arkios (this)** | **65,536** | **1.69** | **10.79** | **1.30** | **yes** |
| BLOOM | 250,680 | 1.72 | 10.56 | 1.25 | yes |
| NLLB-200 | 256,204 | 1.92 | 9.48 | 1.40 | **no** |
| o200k (GPT-4o) | 200,019 | 2.32 | 7.84 | 1.23 | yes |
| mT5 | 250,100 | 2.64 | 6.90 | 1.54 | **no** |
| Sarvam-1 | 68,096 | 2.66 | 6.85 | 1.50 | yes |
| Gemma-2 | 256,000 | 3.13 | 5.81 | 1.28 | yes |
| Mistral NeMo | 131,072 | 3.17 | 5.75 | 1.27 | yes |
| Llama-3 | 128,256 | 3.76 | 4.84 | 1.24 | yes |
| DeepSeek-V3 | 128,815 | 4.29 | 4.24 | 1.24 | yes |
| Qwen2.5 | 151,665 | 6.58 | 2.77 | 1.26 | yes |
| cl100k (GPT-4) | 100,277 | 6.98 | 2.61 | 1.24 | yes |
| GPT-2 | 50,257 | 10.97 | 1.66 | 1.28 | yes |

¹ IndicBERTv2 es lossless en este texto pero es un tokenizador WordPiece tipo encoder, no preserva espacios y no tiene byte fallback, por lo que no es utilizable directamente para modelado generativo.

Además, entrenaron tres modelos de 268M de parámetros que solo difieren en el tokenizador; el que usa Arkios alcanza un 4.43% menor bits-per-byte en nepalí a igual coste de cómputo.

## Requisitos de hardware

- No aplica: se trata de un tokenizador, no de un modelo de lenguaje. No requiere GPU para su uso.
- Puede ejecutarse en CPU en cualquier entorno Python con la librería `tokenizers` instalada.
- Para integración en entrenamiento de modelos, se puede usar como componente de un pipeline de entrenamiento en GPU.
- Despliegue: compatible con HuggingFace `transformers`, `tokenizers`, `llama.cpp` y `vLLM` (a través de su integración con tokenizadores).

## Comparativa con modelos similares

Se compara con tokenizadores de otros modelos multilingües que cubren nepalí. La tabla de la sección de benchmarks ya ofrece una comparativa exhaustiva. Destaca frente a opciones como IndicBERTv2 (mayor vocabulario pero no generativo), Sarvam-1 (más tokens/palabra), y GPT-2 (muy alta fertilidad). Arkios ofrece el mejor equilibrio entre tamaño de vocabulario y eficiencia en nepalí, siendo el único con vocabulario de 65K que logra menos de 2 tokens por palabra.

## Limitaciones y advertencias

- El tokenizador está optimizado para nepalí e inglés; otros idiomas pueden no tener la misma eficiencia.
- No incluye soporte para otros idiomas indios (hindi, bengalí, etc.) aunque comparte escritura devanagari, el entrenamiento no cubre esos idiomas.
- El corpus de entrenamiento incluye datos públicos y un corpus privado que no se redistribuye; el paper asegura que los resultados no dependen del corpus privado, pero los usuarios deben verificar el cumplimiento de licencias.
- La normalización NFC puede alterar la representación de algunos caracteres (por ejemplo, composición canónica). Es necesario tenerlo en cuenta en pipelines.
- No hay soporte para vision o audio; es solo texto.
- El autor no proporciona un modelo de lenguaje asociado; solo el tokenizador.

## Enlaces

- Repositorio del tokenizador en HuggingFace: https://huggingface.co/sajalregmi4/arkios-tokenizer
- Código, harness y resultados completos: https://github.com/sajalregmi/arkios-tokenizer
- Paper (arXiv, se añadirá al publicarse): *Vowel Signs Are Not Letters: A Pre-tokenization Ceiling on Multilingual Tokenizer Fertility* (enlace no disponible en la información proporcionada)
- Página del autor: https://sajalregmi.com/ (información personal)
