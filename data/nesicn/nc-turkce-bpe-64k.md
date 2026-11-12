# nesicn/nc-turkce-bpe-64k

## Resumen

NC-64k es un tokenizer byte-level BPE de 64.000 entradas entrenado desde cero específicamente para turco por el usuario nesicn. No es un modelo de lenguaje, sino el componente de tokenización que se usaría como pieza previa a un LLM o a cualquier pipeline de PLN en turco. Su rasgo diferencial es un entrenamiento en dos fases que reserva las primeras 36.000 unidades del vocabulario a merges que nunca cruzan una frontera raíz-sufijo, detectada mediante el analizador morfológico Zemberek.

El tokenizer se entrenó sobre 1,4 GB de texto turco (768.761 documentos) procedente de 11 corpus: foros, web, noticias, Wikipedia, académico, Ekşi Sözlük, legal, reseñas de películas y opiniones de clientes, entre otros. El objetivo es doble: por un lado, reducir el número de tokens necesarios para representar palabras turcas aglutinantes (donde un solo lexema puede acumular varios sufijos); por otro, alinear los límites de token con los límites morfológicos, lo que facilita tareas posteriores como etiquetado morfológico, análisis sintáctico o búsqueda léxica.

La relevancia actual radica en que la mayoría de tokenizers multilingües (BPE de SentencePiece o tiktoken) fragmentan el turco de forma ineficiente y opaca a la morfología. NC-64k ofrece una alternativa Apache-2.0, lossless (sin `<unk>`), con pre-tokenización consciente del apóstrofo turco y con un `tokenizer.json` estándar listo para `transformers`. Existe una variante hermana, NC-32k, con la misma receta y datos pero vocabulario de 32.000.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizer byte-level BPE (librería `tokenizers` 0.23.3), entrenamiento en dos fases |
| Parámetros totales | No aplica (no es un modelo neuronal) |
| Parámetros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo que lo use) |
| Tipos de cuantización | No aplica |
| Idiomas soportados | Turco (`tr`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `tokenizer.json` (SHA-256 `f1b6004d7a279fc11e1eb97b59ada580add684f1f62e629ae7b9938808b5c450`), compatible con `transformers` y `@huggingface/transformers` |

Detalles adicionales del vocabulario: 64.000 entradas = 64 tokens especiales + 256 bytes + 63.680 merges. Normalizador solo NFC (sin lowercasing, sin NFKC). Pre-tokenizador `Split` con expresión regular + `ByteLevel(add_prefix_space=False, use_regex=False)`. Decoder `ByteLevel`. `min_frequency=2`.

## Arquitectura y entrenamiento

El tokenizer sigue el algoritmo byte-level BPE, lo que garantiza cobertura total de cualquier secuencia UTF-8 sin producir `<unk>`. La innovación está en la fase 1 del entrenamiento: se tomaron las 1.000.000 de palabras más frecuentes del corpus, se analizaron con Zemberek y se partieron por los límites raíz-sufijo comunes a todos los análisis. Sobre esos fragmentos se entrenó BPE hasta 36.000 tokens, de modo que ningún merge de esa primera fase cruza una frontera morfológica. La fase 2 continúa el entrenamiento sobre el corpus completo sin partir, hasta llenar el vocabulario a 64.000. El resultado es una única lista ordenada de merges, sin código personalizado en tiempo de inferencia.

El valor 36.000 se eligió entre 24.000, 36.000 y 48.000 mediante una regla predefinida y solo sobre el conjunto de desarrollo (la misma regla que en NC-32k). La pre-tokenización aplica una regex que separa apóstrofos turcos (`Ankara'da` → `Ankara` · `'da`), agrupa dígitos en bloques de hasta 3 (`2026` → `202` · `6`), adhiere el espacio previo a los números y los saltos de línea posteriores a la puntuación, y trata los espacios finales de forma independiente. El normalizador se limita a NFC para preservar la distinción `I`/`ı` e `İ`/`i`.

Tokens especiales: `<|endoftext|>` (0, EOS), `<|startoftext|>` (1, BOS), `<|pad|>` (2), `<|unk|>` (3, reservado pero no generado por BPE), `<|mask|>` (4), `<|im_start|>`/`<|im_end|>` (5-6, ChatML) y 57 tokens reservados (7-63). El tokenizer no añade BOS/EOS automáticamente.

## Capacidades

- Tokenización lossless de texto turco en NFC: la secuencia de tokens reconstruye exactamente el texto original.
- Cobertura total de bytes UTF-8, sin generación de `<unk>` en ningún caso.
- Segmentación consciente del apóstrofo turco, separando el sufijo de caso o tiempo del lexema.
- Merges de la primera fase alineados con fronteras raíz-sufijo (primeras 36.000 entradas), lo que expone la morfología en la salida.
- Agrupación de dígitos en bloques de hasta 3 para representar números de forma más compacta.
- Compatibilidad con el ecosistema `transformers` (Python) y `@huggingface/transformers` (JavaScript).
- Tokens de chat estilo ChatML (`<|im_start|>`, `<|im_end|>`) para pipelines conversacionales.
- Token de máscara (`<|mask|>`) para modelos de lenguaje enmascarado.
- Preservación de mayúsculas y de la distinción de la `i` turca (sin lowercasing en el normalizador).

## Casos de uso

- **Entrenamiento de LLM en turco desde cero:** el tokenizer sirve como capa de tokenización para un modelo causal entrenado sobre corpus turcos; la reducción de tokens por palabra frente a tokenizers multilingües disminuye el coste de entrenamiento e inferencia para una misma cantidad de texto.
- **Adaptación de vocabulario de modelos multilingües:** se puede usar como referencia para extender o reemplazar el vocabulario turco de un modelo existente, comparando la fertilidad (tokens por palabra) frente al tokenizer original.
- **Etiquetado morfológico y análisis morfológico:** al respetar las fronteras raíz-sufijo en las primeras 36.000 entradas, los tokens resultantes son una señal útil para tareas de morfología, lematización o análisis de sufijos en pipelines de PLN turco.
- **Búsqueda léxica y sistemas de recuperación (IR):** la segmentación predecible de sufijos permite construir índices invertidos con normalización morfológica más sencilla, útil en motores de búsqueda sobre corpus turcos.
- **Procesamiento de documentos legales y administrativos:** el corpus incluye `legal_nli_TR_V1`; el tokenizer maneja terminología jurídica y palabras largas derivadas, adecuado para clasificación o extracción en dominios regulados.
- **Análisis de opiniones y redes sociales:** entrenado con foros, Ekşi Sözlük y reseñas de películas, es apropiado para tokenizar texto coloquial, abreviaturas y jerga de internet en tareas de análisis de sentimiento.
- **Preprocesado de corpus para investigación lingüística:** la preservación de mayúsculas, la distinción `I`/`ı` y la separación del apóstrofo facilitan estudios de frecuencia léxica, morfología derivativa y variación ortográfica.
- **Integración en pipelines de despliegue ligeros:** al ser un `tokenizer.json` estándar, se puede cargar en servicios de inferencia (TGI, vLLM, endpoints de Hugging Face) sin dependencias adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una tabla cualitativa de segmentación comparada con NC-32k:

| Palabra | NC-64k | NC-32k |
|---|---|---|
| Albümün | `Albümün` | `Albüm · ün` |
| hücresel | `hücresel` | `hücre · sel` |
| üniversitesinde | `üniversite · sinde` | `üniversite · sinde` |
| Türkiyeye | `Türkiyeye` | `Türkiye · ye` |
| evlerimizden | `ev · lerimizden` | `ev · lerimizden` |
| Ankara'da | `Ankara · 'da` | `Ankara · 'da` |
| 1923'te | `192 · 3 · 'te` | `192 · 3 · 'te` |
| Cumhurbaşkanlığı | `Cumhurbaşkanlığı` | `Cumhurbaşkanlığı` |
| gerçekleştirilmiştir | `gerçekleştirilmiştir` | `gerçekleştirilmiştir` |
| öğretmenlerimize | `öğretmen · lerimize` | `öğretmen · lerimize` |

No hay datos de fertilidad (tokens por palabra), compresión ni comparación cuantitativa con tokenizers como el de Llama 3 o Gemma.

## Requisitos de hardware

- No requiere GPU: es un tokenizer, se ejecuta en CPU.
- Huella en memoria: el `tokenizer.json` de 64.000 entradas ocupa del orden de unos pocos MB; el proceso de tokenización es de baja latencia y alto throughput en CPU.
- Despliegue: cualquier entorno con `tokenizers` o `transformers` (Python) o `@huggingface/transformers` (JavaScript); también se puede servir a través de endpoints de Hugging Face.
- No aplica VRAM, ni GPU recomendadas, ni cuantización.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Idiomas | Enfoque morfológico | Licencia |
|---|---|---|---|---|
| NC-64k (este) | 64.000 | Turco | Sí, dos fases con Zemberek (36.000 merges) | Apache-2.0 |
| NC-32k (hermano) | 32.000 | Turco | Sí, misma receta y datos | Apache-2.0 |
| Tokenizers multilingües de LLM (Llama 3, Gemma, Qwen) | 32.000-256.000 | Multilingüe | No específico para turco | Licencias variables |

No se dispone de datos cuantitativos de fertilidad ni de benchmarks que permitan una comparación numérica con alternativas. La comparación con tokenizers de LLM multilingües es cualitativa y se basa en que estos últimos no incorporan información morfológica del turco.

## Limitaciones y advertencias

- Solo cubre turco (`tr`); no está pensado para otros idiomas ni para código.
- No es un modelo de lenguaje: no genera texto, no razona y no tiene capacidades de tool calling ni de agentes.
- El normalizador solo aplica NFC; si el pipeline de destino espera NFKC o lowercasing, habrá que aplicarlo externamente.
- El tokenizer no añade BOS/EOS automáticamente; el modelo consumidor debe gestionarlo.
- La calidad de los merges morfológicos depende de los análisis de Zemberek sobre las 1.000.000 palabras más frecuentes; palabras raras o neologismos pueden segmentarse de forma menos alineada con la morfología.
- El corpus incluye datos de foros, Ekşi Sözlük y redes, con posible presencia de lenguaje ofensivo o sesgado; el tokenizer lo reproducirá tal cual.
- La licencia Apache-2.0 permite uso comercial, pero los corpus de entrenamiento tienen licencias diversas (CC-BY-SA-4.0, ODC-By, CC-BY-4.0, CC0, Apache-2.0); conviene revisar la compatibilidad si se redistribuye el tokenizer junto con datos derivados.
- El dataset de reseñas de películas de Kaggle figura con CC0 "no confirmado en la página de Kaggle" según la propia model card.
- No hay benchmarks publicados que permitan validar la mejora frente a tokenizers existentes en tareas downstream.

## Enlaces

- Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-64k
- Variante NC-32k: https://huggingface.co/nesicn/nc-turkce-bpe-32k
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Cosmos-Turkish-Corpus-v1.0: https://huggingface.co/datasets/ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0
- Dataset ForumSohbetleri: https://huggingface.co/datasets/turkish-nlp-suite/ForumSohbetleri
- Dataset Havadis: https://huggingface.co/datasets/turkish-nlp-suite/Havadis
- Dataset temiz-Wiki: https://huggingface.co/datasets/turkish-nlp-suite/temiz-Wiki
- Dataset AkademikDerlem: https://huggingface.co/datasets/turkish-nlp-suite/AkademikDerlem
- Dataset OzenliDerlem: https://huggingface.co/datasets/turkish-nlp-suite/OzenliDerlem
- Dataset MusteriYorumlari: https://huggingface.co/datasets/turkish-nlp-suite/MusteriYorumlari
- Dataset eksiSozlukScrapy: https://huggingface.co/datasets/ozertuu/eksiSozlukScrapy
- Dataset offenseval2020_tr: https://huggingface.co/datasets/stefan-it/offenseval2020_tr
- Dataset legal_nli_TR_V1: https://huggingface.co/datasets/Turkish-NLI/legal_nli_TR_V1
- Dataset de reseñas de películas (Kaggle): https://www.kaggle.com/datasets/mustfkeskin/turkish-movie-sentiment-analysis-dataset
