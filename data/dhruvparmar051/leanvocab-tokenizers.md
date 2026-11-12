# DhruvParmar051/leanvocab-tokenizers

## Resumen

`leanvocab-tokenizers` no es un modelo de lenguaje, sino una colección de 12 tokenizadores en inglés entrenados como parte del estudio controlado `leanvocab`. El estudio investiga si un tokenizador con vocabulario reducido (8k-16k tokens) puede alcanzar una calidad de sentence-embedding dentro de 0,5 puntos MTEB-avg de un encoder tipo MiniLM con el vocabulario de BERT (30.522 tokens), liberando a la vez entre un 25 y un 38% de los parámetros y sin penalizar la latencia de inferencia extremo a extremo.

Los 12 tokenizadores se entrenan sobre el mismo prefijo de 5,0 GB del corpus deduplicado FineWeb-Edu, con la misma normalización uncased al estilo `bert-base-uncased` y los mismos cinco tokens especiales. De este modo, las diferencias observadas se atribuyen únicamente al algoritmo de tokenización (WordPiece, BPE byte-level o Unigram con byte fallback) y al tamaño del vocabulario (8k, 16k o 32k). El repositorio incluye también el tokenizador original de `bert-base-uncased` como control y dos variantes de vocabulario BERT recortado por frecuencia.

El interés del artefacto es metodológico y de reproducibilidad: cada carpeta incorpora un `meta.json` con el SHA-256 de `tokenizer.json`, la versión de `tokenizers` y comprobaciones de ida y vuelta, y el autor documenta cómo forzar determinismo byte a byte en una librería que por defecto no lo garantiza. Es material de referencia para quien diseñe vocabularios de encoders compactos o evalúe el compromiso entre tamaño de vocabulario y calidad de representación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (tokenizadores; algoritmos WordPiece, BPE byte-level y Unigram con byte fallback) |
| Parametros totales | No disponible (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del encoder que los use; el estudio reporta tasas de truncamiento a 128, 256 y 512 tokens) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (`en`), uncased |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` (libreria `tokenizers`) mas `meta.json` por carpeta |

## Arquitectura y entrenamiento

Cada tokenizador se entrena sobre el mismo prefijo de 5,0 GB (por presupuesto de bytes) del corpus FineWeb-Edu `sample-10BT` en una revisión fijada, normalizado en NFC y deduplicado exactamente con BLAKE2b-128. El split de evaluación se elimina antes del entrenamiento del tokenizador. Los detalles por algoritmo: BPE byte-level con frecuencia mínima 2; Unigram con byte fallback de 256 piezas de byte dentro del presupuesto de vocabulario, longitud máxima de pieza 16 y factor de reducción 0,75, restringido a un alfabeto compartido de 1.000 caracteres (99,996% de cobertura del corpus); WordPiece reentrenado con frecuencia mínima 2 y el mismo alfabeto inicial. Las variantes `bert-trim-*` recortan el vocabulario original de BERT a las piezas más frecuentes del corpus como línea base.

La innovación destacable es la determinización del proceso: la librería `tokenizers` no es determinista por defecto (los desempates de `limit_alphabet` en WordPiece y la inserción de `##` siguen el orden del hash map, y el EM paralelo de Unigram deja ruido de coma flotante del orden de 1e-4). El autor precalcula un alfabeto de caracteres compartido, asigna ids por clave canónica y redondea las puntuaciones de Unigram a 4 decimales, de modo que ejecuciones repetidas producen resultados idénticos byte a byte; el `tokenizer_sha256` de cada `meta.json` es lo que reproduce una nueva ejecución.

## Capacidades

- Segmentación de texto en inglés para entrenamiento e inferencia de encoders tipo BERT.
- Tres familias de algoritmos: WordPiece (con emisión de `[UNK]` en caracteres raros), BPE byte-level y Unigram con byte fallback (sin `[UNK]` en ningún caso).
- Vocabularios de 8.000, 16.000 y 32.000 tokens, más el control de 30.522 tokens de `bert-base-uncased`.
- Normalización uncased con eliminación de acentos, equivalente a `bert-base-uncased`.
- Cinco tokens especiales comunes a todos los tokenizadores, lo que permite intercambiarlos en un mismo pipeline.
- Reproducibilidad byte a byte verificada mediante SHA-256.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un componente de preprocesado.

## Casos de uso

- Diseño de encoders compactos: usar `bpe-8k` o `uni-8k` como vocabulario de un encoder tipo MiniLM para reducir el tamaño de la matriz de embeddings y liberar entre un 25 y un 38% de parámetros, evaluando la pérdida de calidad MTEB-avg con el protocolo del estudio.
- Investigación sobre tokenización: comparar WordPiece, BPE y Unigram con idéntico corpus y presupuesto de bytes para aislar el efecto del algoritmo en métricas intrínsecas como bytes/token, fertilidad y eficiencia de Rényi.
- Pipelines multilingües con fallback a bytes: los tokenizadores `bpe-*` y `uni-*` no emiten `[UNK]`, por lo que toleran caracteres fuera del alfabeto de entrenamiento sin romper la codificación, útil en crawls web ruidosos.
- Reducción de coste en inferencia: un vocabulario de 8k reduce el número de tokens por documento (fertilidad 1,481 en `bpe-8k` frente a 1,309 en `bert-orig`), lo que permite ajustar el compromiso entre longitud de secuencia y calidad en tareas de clasificación o retrieval.
- Reproducibilidad de experimentos: integrar los `tokenizer.json` con su SHA-256 en un pipeline de evaluación para garantizar que las comparaciones entre encoders usan exactamente el mismo vocabulario.
- Análisis de truncamiento: usar las tasas de truncamiento a 128, 256 y 512 tokens documentadas en `reports/intrinsic.md` para dimensionar la longitud máxima de contexto de un encoder según el vocabulario elegido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. El repositorio incluye métricas intrínsecas de tokenización medidas sobre el split held-out congelado (10.530 documentos, 50,0 MB, 8.082.824 palabras separadas por espacios, sha256 `917a57c8cad2`):

| Tokenizador | Algoritmo | Vocabulario | Bytes/token | Fertilidad | Eficiencia de Rényi (α=2,5) | Vocabulario usado | Tasa de [UNK] |
|---|---|---:|---:|---:|---:|---:|---:|
| `bert-orig` | WordPiece (BERT original) | 30.522 | 4,726 | 1,309 | 0,4158 | 92,2% | 2,49e-04 |
| `bert-trim-8k` | WordPiece (BERT recortado) | 8.000 | 4,091 | 1,512 | 0,5026 | 87,6% | 2,15e-04 |
| `bert-trim-16k` | WordPiece (BERT recortado) | 16.000 | 4,563 | 1,355 | 0,4493 | 93,8% | 2,40e-04 |
| `bpe-8k` | BPE byte-level | 8.000 | 4,177 | 1,481 | 0,5084 | 98,6% | 0,00e+00 |
| `bpe-16k` | BPE byte-level | 16.000 | 4,568 | 1,354 | 0,4575 | 99,0% | 0,00e+00 |
| `bpe-32k` | BPE byte-level | 32.000 | 4,838 | 1,278 | 0,4180 | 98,7% | 0,00e+00 |
| `uni-8k` | Unigram con byte fallback | 8.000 | 4,002 | 1,546 | 0,4830 | 95,4% | 0,00e+00 |
| `uni-16k` | Unigram con byte fallback | 16.000 | 4,494 | 1,376 | 0,4490 | 97,7% | 0,00e+00 |
| `uni-32k` | Unigram con byte fallback | 32.000 | 4,824 | 1,282 | 0,4148 | 98,5% | 0,00e+00 |
| `wp-8k` | WordPiece reentrenado | 8.000 | 4,103 | 1,508 | 0,5018 | 93,0% | 1,43e-04 |
| `wp-16k` | WordPiece reentrenado | 16.000 | 4,564 | 1,355 | 0,4494 | 95,4% | 1,59e-04 |
| `wp-32k` | WordPiece reentrenado | 32.000 | 4,841 | 1,278 | 0,4103 | 95,9% | 1,69e-04 |

Las tablas completas con tasas de truncamiento a 128, 256 y 512 tokens, ratios de FLOPs en forward y throughput de tokenización están en `reports/intrinsic.md` del repositorio de GitHub.

## Requisitos de hardware

- Al ser tokenizadores, no requieren GPU ni VRAM para funcionar: la carga de `tokenizer.json` y la codificación se ejecutan en CPU con la librería `tokenizers` (Rust).
- El coste computacional relevante es el del encoder que los utilice; el estudio reporta ratios de FLOPs en forward y throughput de tokenización en `reports/intrinsic.md`, pero los valores concretos no están incluidos en la información disponible.
- Despliegue: cualquier entorno Python con `tokenizers` y `huggingface_hub`; también son consumibles desde `transformers` al sustituir el tokenizador de un checkpoint compatible.
- No aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos generativos.
- Latencia: no disponible.

## Comparativa con modelos similares

La comparación relevante es entre los propios tokenizadores del repositorio, ya que no existen alternativas públicas equivalentes con idéntico corpus y protocolo:

| Tokenizador | Algoritmo | Vocabulario | Bytes/token | Tasa de [UNK] | Licencia |
|---|---|---:|---:|---:|---|
| `bert-orig` (control) | WordPiece | 30.522 | 4,726 | 2,49e-04 | Apache 2.0 |
| `bpe-16k` | BPE byte-level | 16.000 | 4,568 | 0,00e+00 | Apache 2.0 |
| `uni-16k` | Unigram + byte fallback | 16.000 | 4,494 | 0,00e+00 | Apache 2.0 |
| `wp-16k` | WordPiece reentrenado | 16.000 | 4,564 | 1,59e-04 | Apache 2.0 |

Frente al control de 30.522 tokens, `bpe-16k` reduce el vocabulario un 47,6% con una pérdida de compresión de 0,158 bytes/token y sin emitir `[UNK]`. Los encoders entrenados con estos tokenizadores (`leanvocab-bert-orig`, `leanvocab-bpe-8k`, `leanvocab-bpe-16k`, `leanvocab-factorized-bert-orig`) son los artefactos que permiten la comparación de calidad MTEB, pero sus resultados no están incluidos en la información disponible.

## Limitaciones y advertencias

- Solo inglés y solo texto educativo web: el vocabulario está entrenado sobre FineWeb-Edu y no cubre otros dominios ni idiomas.
- Normalización uncased con eliminación de acentos: se pierde información de mayúsculas y diacríticos, igual que en `bert-base-uncased`.
- Los tokenizadores WordPiece (`wp-*` y `bert-trim-*`) emiten `[UNK]` en caracteres raros; solo BPE y Unigram hacen fallback a bytes.
- El alfabeto compartido de Unigram y WordPiece cubre el 99,996% del corpus; el 0,004% restante cae a bytes en inferencia.
- No son modelos: no generan texto, no razonan y no pueden evaluarse con benchmarks de LLM. Cualquier comparación de calidad debe hacerse a través de los encoders asociados.
- La licencia Apache 2.0 permite uso comercial, pero el corpus de entrenamiento (FineWeb-Edu) tiene sus propias condiciones que conviene revisar.
- El determinismo depende de la versión de `tokenizers` registrada en cada `meta.json`; versiones distintas pueden no reproducir el mismo SHA-256.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DhruvParmar051/leanvocab-tokenizers
- Repositorio del estudio en GitHub: https://github.com/DhruvParmar051/leanvocab
- Informe de métricas intrínsecas: https://github.com/DhruvParmar051/leanvocab/blob/main/reports/intrinsic.md
- Encoder de control (`bert-orig`): https://huggingface.co/DhruvParmar051/leanvocab-bert-orig
- Encoder con tokenizador `bpe-8k`: https://huggingface.co/DhruvParmar051/leanvocab-bpe-8k
- Encoder con tokenizador `bpe-16k`: https://huggingface.co/DhruvParmar051/leanvocab-bpe-16k
- Encoder con embeddings factorizados: https://huggingface.co/DhruvParmar051/leanvocab-factorized-bert-orig
- Tokenizador original de BERT: https://huggingface.co/google-bert/bert-base-uncased
- Corpus FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
