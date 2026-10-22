# NeuroKurd/kurmanji_tokenizer

## Resumen

`NeuroKurd/kurmanji_tokenizer` es un tokenizador byte-level BPE para kurmanji (kurdo septentrional, `kmr`, escritura latina), publicado por el usuario NeuroKurd bajo licencia Apache-2.0. No es un modelo generativo: no contiene pesos neuronales ni parámetros entrenados, sino un vocabulario de 40.000 piezas y las reglas de normalización y pre-tokenización necesarias para convertir texto kurmanji en secuencias de identificadores. Su función es servir de base para entrenar o continuar el preentrenamiento de modelos de lenguaje en una lengua de bajos recursos donde los tokenizadores multilingües generalistas fragmentan el texto de forma muy ineficiente.

El problema que aborda es medible: según la model card, sobre FLORES-200 (`kmr_Latn`) el tokenizador produce 1,44 tokens por palabra, frente a 1,85 de XLM-R, 2,62 de Qwen2.5 y 2,91 de GPT-2. Eso equivale a un 22 % menos de tokens que XLM-R y un 45 % menos que Qwen2.5 para el mismo texto, lo que se traduce directamente en menos cómputo de entrenamiento e inferencia y en más contenido real dentro de cada ventana de contexto del modelo que lo use. La versión publicada es la v4, con normalización Unicode NFC, decoder ByteLevel, fallback a bytes (ningún `<unk>` en la práctica) y robustez deliberada frente a variantes ortográficas sin circunflejos (`e i u` por `ê î û`) y frente a texto en mayúsculas.

Es relevante ahora porque el ecosistema kurmanji carece de tokenizadores bien documentados y evaluados: las alternativas públicas disponibles no publican métricas de fertilidad ni comparaciones controladas, y este repositorio sí incluye evaluación sobre un conjunto externo (FLORES-200) no usado en entrenamiento, además de pruebas de ida y vuelta. Sus limitaciones son igualmente explícitas: muestra de entrenamiento desbalanceada, ausencia de tokens de chat reservados y cero adopción comunitaria hasta la fecha (0 descargas, 0 likes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (librería Hugging Face `tokenizers`) |
| Parámetros totales | no disponible (tokenizador, sin parámetros neuronales) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el tokenizador no impone ventana) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | `kmr` (kurmanji / kurdo septentrional, escritura latina) |
| Licencia | Apache-2.0 |
| Formato de pesos | formato Hugging Face `tokenizers`, cargable con `PreTrainedTokenizerFast.from_pretrained` (vocabulario en `tokenizer.json`) |

| Propiedad adicional | Valor |
|---|---|
| Tamaño de vocabulario | 40.000 |
| Normalización | Unicode NFC |
| Pre-tokenización | Regex: palabras con `'`, `’`, `-` internos; dígitos sueltos; secuencias de puntuación; espacios |
| Decoder | ByteLevel |
| Sensible a mayúsculas | Sí |
| Tokens especiales | `<s>` (bos), `</s>` (eos), `<unk>`, `<pad>`, `<mask>` |
| Tokens de chat reservados | Ninguno (declarado explícitamente en la model card) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-21 |

## Arquitectura y entrenamiento

La arquitectura es un BPE a nivel de byte con normalización NFC previa y una etapa de pre-tokenización por expresión regular que agrupa palabras (incluyendo apóstrofos rectos y tipográficos y guiones internos), aísla cada dígito individual, separa secuencias de puntuación y trata los espacios como parte del token siguiente (de ahí el prefijo `▁` / `Ġ` en la representación visual). Tras la pre-tokenización se aplica el mapeo a bytes, de modo que cualquier cadena de entrada —incluidos emojis, tabuladores y otras escrituras— es codificable sin emitir `<unk>`. El vocabulario resultante tiene 40.000 entradas y no incluye tokens reservados para roles de chat.

Los datos de entrenamiento provienen del corpus público `kurdish-tech/KurdishCorpus-clean`, filtrando únicamente documentos con `dialect == "Kurmanji"`, `lid_label == "kmr_Latn"` y `lid_prob >= 0.8` (se excluyeron sorani y zazaki). El pipeline descarta líneas de menos de 20 o más de 2.000 caracteres, exige más del 60 % de letras, elimina líneas con escritura árabe y deduplica líneas exactas sin distinguir mayúsculas. Se reservó aproximadamente un 1 % de documentos (elegidos por hash de la primera línea) como conjunto de evaluación nunca usado en entrenamiento. Para ganar robustez ortográfica se añadieron variantes: ~12 % de líneas con `ê î û` sustituidas por `e i u`, ~4 % adicionales con `ç ş` por `c s`, y ~1,5 % en mayúsculas. El resultado declarado son ~1,2 millones de líneas (~270 MB de texto) y ~10.000 líneas de held-out (la tabla de evaluación detalla 10.229, una discrepancia menor en la propia model card).

El punto crítico del entrenamiento es que la lectura del corpus se hizo en streaming y se detuvo antes de tiempo: solo se procesaron aproximadamente los primeros 400.000 documentos del dataset, de los cuales ~125.000 pasaron los filtros, y la mezcla de fuentes de esa muestra **no está balanceada** de forma intencionada. El autor anuncia una muestra más equilibrada para una versión posterior. No hay RLHF, DPO ni ajuste alguno, al no tratarse de un modelo generativo.

## Capacidades

- Segmentación de texto kurmanji (latino) en subpalabras con una fertilidad de 1,44 tokens por palabra sobre FLORES-200 `kmr_Latn`.
- Codificación sin pérdida: `decode(encode(text)) == text` en el 100 % de las 10.229 líneas de held-out probadas y en los casos límite documentados (tabuladores, saltos de línea, espacios repetidos, emojis, otras escrituras).
- Cobertura total de entrada mediante fallback a bytes: no se emiten tokens `<unk>` en la práctica, aunque el token especial existe en el vocabulario.
- Robustez frente a variantes ortográficas: texto escrito sin circunflejos (`e i u` en lugar de `ê î û`) y texto en mayúsculas, gracias al augmentation del corpus.
- Manejo de apóstrofos y guiones internos dentro de una misma palabra antes de aplicar las fusiones BPE.
- Separación de dígitos uno a uno (por ejemplo, `2026` → `2` `0` `2` `6`), lo que da un tratamiento uniforme a números y fechas.
- Capacidad de servir como tokenizador base en pipelines de `transformers` (`PreTrainedTokenizerFast`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking": es un componente léxico, no un modelo.

## Casos de uso

- **Preentrenamiento de un LLM en kurmanji desde cero:** con 40.000 entradas y fertilidad 1,44 frente a 1,85 de XLM-R, un corpus fijo de 1.000 millones de palabras requiere aproximadamente un 22 % menos de tokens, lo que reduce proporcionalmente las horas de GPU y permite dedicar más presupuesto a épocas o a más datos.
- **Continuación de preentrenamiento con adaptación de vocabulario:** al sustituir el tokenizador de un modelo multilingüe por este, se recortan secuencias en kurmanji; el ahorro es del 45 % frente a Qwen2.5 en el mismo texto de FLORES-200, lo que abarata el ajuste de las matrices de embeddings al nuevo vocabulario.
- **Normalización previa de corpus para TTS y ASR en kurmanji:** la tokenización robusta a variantes sin circunflejos y a mayúsculas permite procesar transcripciones reales heterogéneas sin pérdida de información en la ida y vuelta, condición necesaria para alinear audio y texto.
- **Filtrado y control de calidad de datasets kurmanji:** calcular la fertilidad por documento y descartar los que se desvían de la media (1,318 en held-out con ortografía normal) sirve como heurística barata para detectar texto corrupto, en otro idioma o con codificación defectuosa.
- **Búsqueda y recuperación de información (IR) sobre texto kurdo:** la segmentación consistente de palabras con apóstrofos y guiones internos mejora la coincidencia de términos en índices invertidos y en motores de búsqueda léxicos, donde los tokenizadores multilingües parten esas palabras en piezas no coincidentes.
- **Evaluación comparativa de modelos en kurmanji:** usar un tokenizador especializado y de fertilidad conocida permite medir perplejidad y coste por token de forma comparable entre modelos candidatos, aislando el efecto del vocabulario del efecto del modelo.
- **Prototipado de asistentes conversacionales en kurmanji:** es utilizable como tokenizador de un modelo generativo que atienda consultas de usuarios, aunque requiere añadir tokens de chat propios antes de entrenar el modelo, ya que el vocabulario no los reserva.
- **Investigación lingüística computacional:** el vocabulario de 40.000 piezas y la regex de pre-tokenización publicada permiten analizar morfología y productividad de afijos en kurmanji (por ejemplo, la segmentación de `nexwestibûnên` en `ne` `xwest` `ibûn` `ên`).

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de fertilidad (tokens por palabra, contando palabras por separación en espacios y sin tokens especiales; menor es mejor) sobre FLORES-200 `kmr_Latn`, dev + devtest, 2.009 frases, conjunto no usado en entrenamiento:

| Tokenizador | Vocabulario | Fertilidad (FLORES-200 kmr_Latn) |
|---|---|---|
| Este tokenizador (v4) | 40.000 | 1,44 |
| XLM-R (`xlm-roberta-base`) | ~250.000 | 1,85 |
| Qwen2.5 (`Qwen/Qwen2.5-0.5B`) | ~151.000 | 2,62 |
| GPT-2 (`gpt2`) | 50.257 | 2,91 |

Evaluación sobre 10.229 líneas de held-out del propio corpus de entrenamiento:

| Prueba | Resultado |
|---|---|
| Fertilidad, ortografía normal | 1,318 |
| Fertilidad, mismas líneas sin circunflejos | 1,366 |
| Bytes por token | 4,75 |
| Round-trip idéntico | 100 % (10.229 / 10.229) |
| Tokens `<unk>` | 0 |

Ejemplos de segmentación publicados:

| Entrada | Tokens |
|---|---|
| `nexwendiyên` | `ne` `xwend` `iyên` |
| `nexwestibûnên` | `ne` `xwest` `ibûn` `ên` |
| `Ez li mala xwe dixebitim.` | `Ez` `▁li` `▁mala` `▁xwe` `▁dixebitim` `.` |
| `Ez ji hemu hevalen naskiri durtir im` (sin circunflejos) | 8 tokens para 7 palabras |
| `2026` | `2` `0` `2` `6` |
| `21.10.2026` | dígitos y puntos sueltos |

Advertencias del propio autor que conviene respetar: el tokenizador se entrenó solo en kurmanji mientras los rivales son multilingües, por lo que la tabla mide eficiencia de segmentación en kurmanji, no calidad global; los tokenizadores de Llama y Gemma no se midieron; y los números de held-out proceden de las mismas fuentes que el entrenamiento, por lo que son probablemente optimistas frente a FLORES-200, que es la cifra más fiable. No hay benchmarks de calidad downstream (perplejidad de un modelo entrenado con este vocabulario, MMLU, HumanEval ni similares).

## Requisitos de hardware

- Inferencia en CPU exclusivamente: el tokenizador no requiere GPU ni acelerador; se ejecuta en cualquier máquina capaz de correr Python y la librería `tokenizers`.
- VRAM estimada: 0 GB. El consumo es de RAM del orden de decenas o pocos cientos de MB al cargar el vocabulario de 40.000 entradas; el tamaño exacto del fichero `tokenizer.json` no se indica en la información disponible.
- GPU recomendadas: ninguna. Cualquier GPU (A100, H100, RTX 4090, integradas) es irrelevante para el tokenizador en sí; solo importa para el modelo que lo utilice.
- Cabe en cualquier GPU consumer y en entornos sin GPU, incluidos contenedores de CI y funciones serverless.
- Opciones de despliegue: `transformers` (`PreTrainedTokenizerFast`) y la librería `tokenizers` de forma nativa. Puede declararse como tokenizador de un modelo servido con vLLM o TGI, siempre que el checkpoint correspondiente se construya con este vocabulario. Para `llama.cpp` u Ollama haría falta convertir el vocabulario a formato GGUF; ese procedimiento no está documentado en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia de codificación.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Idiomas | Fertilidad publicada en kurmanji | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `NeuroKurd/kurmanji_tokenizer` (v4) | Byte-level BPE, Hugging Face `tokenizers` | 40.000 | kmr (solo kurmanji latino) | 1,44 (FLORES-200) | Apache-2.0 | Hugging Face, 0 descargas |
| `muzaffercky/kurdish-kurmanji-tokenizer` | BPE | 20.000 | kmr | no disponible | no disponible en la información | Hugging Face |
| `asosoft/KurmanjiTokenizer-Whisper` | Tokenizador orientado a Whisper, entrenado sobre un corpus de 50 millones de tokens | no disponible en la información | kmr | no disponible | no disponible en la información | Hugging Face |
| `cikay/kurdish-kurmanji-tokenizer-train` | Script de entrenamiento de tokenizador (no es un vocabulario publicado) | no disponible | kmr | no disponible | no disponible | GitHub |
| XLM-R (`xlm-roberta-base`) | SentencePiece unigram multilingüe | ~250.000 | 100 idiomas | 1,85 | MIT (según el repositorio original) | Amplia |
| Qwen2.5 (`Qwen/Qwen2.5-0.5B`) | BPE multilingüe | ~151.000 | multilingüe | 2,62 | Apache-2.0 (según el modelo base) | Amplia |

Diferencias destacables: frente a los otros tokenizadores específicos de kurmanji, este es el único de los encontrados que publica una evaluación de fertilidad sobre un conjunto externo (FLORES-200) y pruebas de round-trip; a cambio, su vocabulario de 40.000 es el doble que el de `muzaffercky` (20.000), lo que implica una matriz de embeddings mayor en cualquier modelo que lo use. Frente a los multilingües, gana en eficiencia sobre kurmanji pero pierde cobertura para texto mixto kurmanji-inglés o kurmanji-árabe. No se dispone de datos de fertilidad de los tokenizadores de Llama ni Gemma aplicados a kurmanji.

## Limitaciones y advertencias

- **Sin tokens de chat reservados:** la model card lo declara explícitamente ("None yet"). Cualquier uso conversacional exige añadir tokens de rol y remapear el vocabulario antes de entrenar el modelo.
- **Muestra de entrenamiento desbalanceada y truncada:** solo se leyeron ~400.000 documentos del corpus y ~125.000 pasaron los filtros; el autor reconoce que la mezcla de fuentes no está equilibrada a propósito y que una muestra más equilibrada queda para una versión futura.
- **Métricas internas posiblemente optimistas:** el held-out procede de las mismas fuentes que el entrenamiento; el propio autor señala que la cifra de FLORES-200 (1,44) es la más fiable.
- **Discrepancia menor en el conteo de held-out:** ~10.000 líneas en el texto frente a 10.229 en la tabla de evaluación.
- **Solo kurmanji latino:** se excluyeron sorani y zazaki y se descartaron líneas con escritura árabe, por lo que el rendimiento en sorani o en kurmanji escrito en árabe será deficiente.
- **Sensible a mayúsculas:** `Ez` al inicio del texto y `▁ez` en medio son tokens distintos; esto afecta a la consistencia de prompts y a la comparación de frecuencias si no se normaliza.
- **Dígitos separados uno a uno:** cualquier tarea con números, fechas o cantidades (facturación, extracción de importes, matemáticas) consumirá muchos más tokens de lo habitual y puede degradar el rendimiento del modelo en aritmética.
- **Posible `show` de tokens ilegibles:** al ser byte-level, `convert_ids_to_tokens` muestra `Ġ` y símbolos de byte para `ê`, `î`, `û`; hay que decodificar token a token para inspección legible. Es un problema de ergonomía, no de corrección.
- **Riesgo de licencias en el corpus de origen:** los textos de `kurdish-tech/KurdishCorpus-clean` tienen sus propias condiciones de uso; el autor recomienda revisar la dataset card y las licencias de las fuentes originales antes de reutilizar el trabajo más allá del tokenizador. El vocabulario contiene piezas de palabra, no los textos fuente.
- **Licencia Apache-2.0 permite uso comercial**, pero no se ofrece garantía alguna ni se documenta procedencia línea a línea del vocabulario.
- **Sin validación comunitaria:** 0 descargas y 0 likes en el momento de la consulta; no hay evidencia independiente de su comportamiento en producción ni de calidad downstream en modelos entrenados con él.
- **No inventariado en ecosistemas GGUF:** no se documenta la conversión a formatos de `llama.cpp`/Ollama, lo que limita su uso en despliegues locales estándar sin trabajo adicional.

## Enlaces

- Repositorio Hugging Face del tokenizador: https://huggingface.co/NeuroKurd/kurmanji_tokenizer
- Dataset de entrenamiento (`kurdish-tech/KurdishCorpus-clean`): https://huggingface.co/datasets/kurdish-tech/KurdishCorpus-clean
- Tokenizador alternativo `muzaffercky/kurdish-kurmanji-tokenizer`: https://huggingface.co/muzaffercky/kurdish-kurmanji-tokenizer
- Tokenizador alternativo `asosoft/KurmanjiTokenizer-Whisper`: https://huggingface.co/asosoft/KurmanjiTokenizer-Whisper
- Script de entrenamiento `cikay/kurdish-kurmanji-tokenizer-train`: https://github.com/cikay/kurdish-kurmanji-tokenizer-train
- Recursos de datos kurmanji (badini, ASR, anotación fonética) de dargex.agency: https://dargex.agency/
