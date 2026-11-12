# kuramot6f/classical-ja-tokenizer

## Resumen

`classical-ja-tokenizer` es un tokenizador SentencePiece de tipo unigram con un vocabulario de 32.000 piezas, entrenado exclusivamente con textos anteriores a 1868: japones clasico, japones premoderno temprano y chino literario (漢文, kanbun). Lo desarrolla el usuario kuramot6f y se publica bajo licencia Apache-2.0. No es un modelo generativo, sino el componente de tokenizacion de la familia `classical-smollm2-trunk` y `classical-smollm2-sft`.

El problema que aborda es concreto: los tokenizadores disenados para japones moderno segmentan mal el texto historico, porque no cubren el uso de kana historico, el kanbun ni los caracteres raros frecuentes en libros premodernos. Este tokenizador se ajusta a esa distribucion y anade byte fallback, de modo que nunca emite el token `<unk>`.

Su relevancia actual es de nicho pero clara para proyectos de humanidades digitales, OCR de material Edo, corpus budistas y pipelines de investigacion sobre literatura clasica japonesa y china, donde la fidelidad de la tokenizacion afecta directamente a la calidad del preentrenamiento y de las metricas de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece unigram (tokenizador, no modelo neuronal) |
| Parametros totales | no disponible (no es un modelo parametrico; vocabulario de 32.000 piezas) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no aplica (tokenizador) |
| Idiomas soportados | ja (japones clasico y premoderno temprano), lzh (chino literario) |
| Licencia | Apache-2.0 (con matices por las fuentes de entrenamiento, ver limitaciones) |
| Formato de pesos | `tokenizer.model` y `tokenizer.vocab` (SentencePiece); `classical_tokenizer.py` + `tokenizer_config.json` (wrapper de Transformers) |

## Arquitectura y entrenamiento

El tokenizador emplea un modelo unigram de SentencePiece 0.2.1 con normalizacion identidad (sin NFKC), `character_coverage=0.9995` y `byte_fallback=true`. El vocabulario reserva los IDs 0 a 3 para `<unk>`, `<s>`, `</s>` y `<pad>`, e incluye 256 piezas de byte fallback que garantizan la cobertura de cualquier secuencia UTF-8. El wrapper propio para Transformers mantiene el mapeo exacto de IDs y difiere de SentencePiece puro en un detalle: un caracter `▁` (U+2581) literal en la entrada se codifica como bytes UTF-8, de modo que la decodificacion devuelve siempre el texto original de forma exacta.

El entrenamiento se realizo sobre 2 millones de fragmentos de linea (70 millones de caracteres) muestreados de 121.000 documentos y 1.330 millones de caracteres del corpus pre-1868. Segun la model card, se trata de una version ligeramente mayor y prefiltrada de `classical-ja-pretrain`. No se documentan fases de RLHF ni DPO, algo esperable en un tokenizador.

## Capacidades

- Tokenizacion y detokenizacion de japones clasico, japones premoderno temprano y chino literario.
- Cobertura total de bytes mediante byte fallback: no genera `<unk>` en ningun caso.
- Round-trip exacto verificado en las muestras diagnosticas (128/128 en cada fuente).
- Manejo de kana historico, kanbun y caracteres raros de libros premodernos.
- Integracion con Transformers mediante `AutoTokenizer` con `trust_remote_code=True`.
- Uso directo con SentencePiece descargando `tokenizer.model`.
- No dispone de generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es exclusivamente un tokenizador.

## Casos de uso

- Preprocesamiento de corpus para preentrenamiento de modelos de japones clasico: se usa como tokenizador base de `classical-smollm2-trunk` y `classical-smollm2-sft`, midiendo caracteres por token para estimar el coste computacional del entrenamiento.
- Digitalizacion de libros impresos de la era Edo: aplicado a salidas OCR de la NDL, donde la model card reporta 1,37 caracteres por token y solo un 0,4% de tokens de byte, lo que indica buena cobertura de los caracteres reconocidos.
- Investigacion en humanidades digitales sobre kanbun: permite indexar y analizar textos chinos clasicos con anotacion japonesa (kanbun) sin perder caracteres por falta de vocabulario.
- Procesamiento de corpus budistas CBETA: tokeniza textos budistas chinos clasicos con round-trip exacto, util para tareas de busqueda y alineamiento.
- Construccion de pipelines de evaluacion de modelos historicos: al no producir `<unk>`, sirve para calcular perplejidad y metricas de compresion de forma comparable entre fuentes.
- Analisis cuantitativo de manuscritos de Minna de Honkoku: la tasa de tokens de byte (11,2%) permite detectar secciones con caracteres fuera de la distribucion de entrenamiento y priorizar revision manual.
- Normalizacion previa a tareas de etiquetado morfologico o NER historico: la normalizacion identidad (sin NFKC) preserva variantes ortograficas relevantes para la investigacion.

## Benchmarks y rendimiento

La model card no presenta benchmarks de modelos, sino diagnosticos de tokenizacion sobre muestras de la distribucion de entrenamiento (no un conjunto de evaluacion retenido):

| Fuente | Caracteres por token | Tasa de tokens de byte | Round-trip exacto |
|---|---:|---:|---:|
| Kanripo (clasicos chinos) | 1,24 | 6,8% | 128/128 |
| Minna de Honkoku (manuscritos Edo) | 1,44 | 11,2% | 128/128 |
| NDL (libros impresos Edo, OCR) | 1,37 | 0,4% | 128/128 |
| Wikisource (literatura clasica) | 1,41 | 2,5% | 128/128 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el tokenizador opera en CPU y el repositorio ocupa 0,2 GB.
- GPU recomendadas: no aplica; cualquier CPU es suficiente.
- Cabe en cualquier GPU consumer: si, aunque no es necesario usar GPU.
- Opciones de despliegue: SentencePiece nativo (`sentencepiece`), Transformers con `AutoTokenizer` y `trust_remote_code=True`, y cualquier pipeline que acepte un `tokenizer.model` de SentencePiece.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un unigram de 32.000 piezas, la tokenizacion es de coste bajo por caracter, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Tipo | Idiomas | Normalizacion | Licencia |
|---|---:|---|---|---|---|
| kuramot6f/classical-ja-tokenizer | 32.000 | SentencePiece unigram | ja clasico, lzh | identidad (sin NFKC) | Apache-2.0 |
| Tokenizadores de japones moderno (p. ej. los de modelos LLM japoneses actuales) | variable | BPE o unigram | ja moderno | habitualmente NFKC | variable |
| Tokenizadores multilingues genericos | variable | BPE | multilingue | habitualmente NFKC | variable |

No se dispone de datos comparativos publicados frente a alternativas concretas en la informacion proporcionada. La diferencia funcional declarada por el autor es que los tokenizadores de japones moderno segmentan mal el texto clasico, mientras que este se ajusta a kana historico, kanbun y caracteres raros premodernos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; solo tokeniza y detokeniza.
- Los diagnosticos de la model card proceden de la distribucion de entrenamiento y no de un conjunto retenido, por lo que no deben interpretarse como evaluacion independiente.
- La licencia del codigo y del modelo es Apache-2.0, pero el entrenamiento uso textos con varias licencias: dominio publico, CC BY-SA 4.0 y CC BY-NC-SA 3.0 TW para textos budistas CBETA. Esto puede condicionar el uso comercial derivado de esos datos; conviene revisar `classical-ja-pretrain/LICENSES`.
- Los extractos de `examples.json` y `evaluation.jsonl` conservan las licencias de sus fuentes.
- La cobertura esta limitada a textos anteriores a 1868 en japones clasico y chino literario; no esta pensado para japones moderno ni para otros idiomas.
- El wrapper de Transformers requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio.
- Riesgo de sesgo: la distribucion depende de las fuentes elegidas (Kanripo, Minna de Honkoku, NDL, Wikisource, CBETA) y puede infrarrepresentar generos o periodos no incluidos.
- No hay datos publicados de latencia ni de rendimiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/kuramot6f/classical-ja-tokenizer
- Modelo asociado `classical-smollm2-trunk`: https://huggingface.co/kuramot6f/classical-smollm2-trunk
- Modelo asociado `classical-smollm2-sft`: https://huggingface.co/kuramot6f/classical-smollm2-sft
- Dataset `classical-ja-pretrain`: https://huggingface.co/datasets/kuramot6f/classical-ja-pretrain
- Licencias del corpus: https://huggingface.co/datasets/kuramot6f/classical-ja-pretrain/blob/main/LICENSES/README.md
