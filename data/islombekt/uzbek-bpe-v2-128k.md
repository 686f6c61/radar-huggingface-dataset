# IslombekT/uzbek-bpe-v2-128k

## Resumen

`uzbek-bpe-v2-128k` es un tokenizador byte-level BPE entrenado especificamente para el uzbek, con un vocabulario de 128.000 tokens aprendidos mas 40 tokens de relleno (128.040 en total). Lo desarrolla IslombekT y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje, sino el componente de tokenizacion que se acoplaria a un LLM de gran tamano (la model card lo situa como la variante para modelos de 7B parametros o superiores), dentro de una familia de tres tamanos cortados del mismo entrenamiento: 32k, 64k y 128k.

Su relevancia esta en el tratamiento del uzbek como idioma de bajos recursos: cubre alfabeto latino actual, cirilico, el alfabeto latino reformado (ö ğ ş ç, vigente desde el 22 de abril de 2027) y texto de escritura mixta. Frente a tokenizadores multilingues genericos, reduce de forma sustancial el numero de tokens por palabra, lo que se traduce en menos coste de inferencia y mas texto efectivo dentro de una ventana de contexto fija.

La model card aporta cifras concretas de eficiencia (tokens por palabra) y de calidad de modelo derivada (bits por byte y tareas downstream con dos GPT de 25,3M parametros), lo que permite evaluar el tokenizador sin depender de benchmarks de LLM a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (normalizador NFC + pre-tokenizador con patron de split de GPT-4o, luego byte-level) |
| Parametros totales | No aplica (tokenizador); 128.040 tokens de vocabulario (128.000 aprendidos + 40 de relleno) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo que use el tokenizador) |
| Tipos de cuantizacion | No aplica (tokenizador) |
| Idiomas soportados | Uzbeko (latino actual, latino reformado, cirilico y mixto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` (formato Hugging Face Transformers); repositorio de 0,0 GB |

## Arquitectura y entrenamiento

El tokenizador combina un normalizador Unicode NFC que unifica las marcas de oʻ/gʻ (‘ ’ ' ` ´) en ʻ U+02BB y convierte una marca entre otras letras en el tutuq ʼ U+02BC; el cirilico nunca se translitera a latino. El pre-tokenizador usa el patron de division de GPT-4o, en el que ʻ y ʼ cuentan como letras Unicode (de modo que «oʻzbek» permanece entero), seguido de tokenizacion byte-level.

Los datos de entrenamiento son 192.024.300 palabras muestreadas de `Digitaluz/uzbek-language-corpus` (Ministerio de Tecnologias Digitales de la Republica de Uzbekistán, licencia ODC-By v1.0), con la composicion 45% latino actual, 30% cirilico, 20% latino actual convertido al alfabeto reformado y 5% mixto, con ponderacion de raiz cuadrada entre fuentes. Se excluyeron documentos que compartian cualquier fragmento de 24 palabras con un documento de evaluacion y 106 documentos con restos de OCR en chino/japones/coreano. El token especial es `<|endoftext|>`, y los 20 marcadores de datos personales del corpus (`[NAME]`, `[PHONE]`, etc.) son tokens unicos, con y sin espacio inicial.

Como innovacion destacable, el entrenamiento incluye texto sintetico en el alfabeto reformado (convertido por regla) ante la ausencia de texto real, y el split numerico agrupa cifras en bloques de hasta 3 digitos.

## Capacidades

- Tokenizacion de texto uzbeko en latino actual, latino reformado (ö ğ ş ç), cirilico y escritura mixta en un unico vocabulario.
- Normalizacion interna de variantes de apostrofo para oʻ/gʻ y del tutuq ʼ.
- Tratamiento de 20 marcadores de datos personales del corpus como tokens unicos (con y sin espacio inicial).
- Segmentacion numerica en grupos de hasta 3 digitos.
- Integracion directa con `transformers.AutoTokenizer` y con cualquier pipeline que consuma `tokenizer.json`.
- No incluye capacidades generativas, tool calling, vision ni audio: es exclusivamente un componente de tokenizacion.

## Casos de uso

- Entrenamiento de LLM en uzbek desde cero: usar el tokenizador como capa de entrada para un modelo de ~7B o superior, aprovechando que 128k tokens cubren latino, cirilico y reformado sin penalizacion por cambio de escritura (Cyr/Lat de 1,017).
- Ajuste fino de modelos existentes para uzbek: sustituir el tokenizador original por este y reentrenar los embeddings, reduciendo tokens por palabra frente a Llama 3.2 (3,110 en web latino) o Qwen3 (3,199).
- Procesamiento de corpus administrativos y legales bilingues: el tokenizador maneja documentos en cirilico y latino sin transliteracion, util para archivos historicos y registros oficiales.
- Sistemas de busqueda y recuperacion (RAG) sobre prensa uzbeka: menor numero de tokens por documento permite indexar mas texto en el mismo presupuesto de contexto del modelo asociado.
- Preparacion de datos para el alfabeto reformado: permite entrenar ya con la ortografia que entrara en vigor el 22 de abril de 2027, con texto sintetico convertido por regla.
- Clasificacion y etiquetado de noticias: la model card reporta 0,864 de exactitud en clasificacion de 15 clases tras ajuste fino con 40.000 articulos (frente a 0,882 con el tokenizador v1 de 16k), lo que sirve de referencia para pipelines de moderacion o categorizacion.
- Tokenizacion de conversaciones con datos personales: los placeholders `[NAME]`, `[PHONE]`, etc. se codifican como un solo token, lo que simplifica el enmascaramiento en pipelines de anonimizacion.

## Benchmarks y rendimiento

Tokens por palabra (menor es mejor), sobre conjuntos de evaluacion congelados antes del entrenamiento:

| Tokenizador | Vocab | Web latino (a) | Latino (e) | Reformado (c) | Cirilico (b) | Mixto (d) | Cyr/Lat |
|---|---|---|---|---|---|---|---|
| v2-128k | 128.040 | 1,430 | 1,440 | 1,454 | 1,479 | 1,568 | 1,017 |
| v1 uzbek-bpe-16k | 16.384 | 1,749 | 1,819 | 2,353 | 4,578 | 3,458 | 2,479 |
| tahrirchi-bert (uz) | 30.528 | 1,878 | 1,907 | 2,296 | 3,952 | 3,161 | 2,060 |
| XLM-RoBERTa | 250.002 | 2,218 | 2,313 | 2,268 | 3,304 | 2,840 | 1,432 |
| GPT-4o o200k | 200.019 | 2,578 | 2,836 | 2,605 | 3,078 | 2,846 | 1,066 |
| NeuronAI-Uzbek (uz) | 180.000 | 2,659 | 2,822 | 2,689 | 4,678 | 3,771 | 1,646 |
| Gemma 3 | 262.145 | 2,817 | 3,068 | 2,775 | 3,351 | 3,063 | 1,076 |
| Llama 3.2 | 128.256 | 3,110 | 3,537 | 3,016 | 4,333 | 3,760 | 1,204 |
| mGPT | 100.000 | 3,159 | 3,442 | 3,072 | 4,410 | 3,752 | 1,258 |
| Qwen3 | 151.669 | 3,199 | 3,518 | 3,103 | 4,509 | 3,838 | 1,259 |

Calidad de modelo (dos GPT identicos de 8 capas y 25,3M parametros sin embeddings, entrenados sobre 1 GB del mismo texto uzbeko):

| Conjunto de evaluacion | v1-16k (bits/byte) | v2-32k (bits/byte) | Cambio |
|---|---|---|---|
| Web latino (a) | 1,3005 | 1,2471 | -4,1% |
| Latino (e) | 0,9560 | 0,9322 | -2,5% |
| Reformado (c) | 1,2929 | 1,2645 | -2,2% |
| Cirilico (b) | 0,5609 | 0,5327 | -5,0% |
| Mixto (d) | 0,8902 | 0,8577 | -3,6% |

Tiempo de entrenamiento sobre el mismo texto: 116 min (v1) frente a 87 min (v2), por la reduccion del 38% en tokens.

| Tarea | v1-16k | v2-32k |
|---|---|---|
| UzLiB, 1.861 preguntas, opcion mas probable (aleatorio = 0,250) | 0,585 | 0,630 |
| UzLiB, ortografia correcta (1.501 preguntas) | 0,640 | 0,692 |
| Clasificacion de tematica de noticias, 15 clases, exactitud tras ajuste fino con 40.000 articulos | 0,882 | 0,864 |

Nota: UzLiB se puntua por verosimilitud, no por generacion, por lo que no es comparable con la tabla de clasificacion publica de UzLiB.

## Requisitos de hardware

- El tokenizador en si no requiere GPU: se ejecuta en CPU con `tokenizers` o `transformers`.
- El coste de computo relevante es el del modelo que lo use. Para un LLM de ~7B con contexto largo, la VRAM dependera del modelo y de la cuantizacion (no disponible en la informacion proporcionada).
- GPU recomendadas: no aplica al tokenizador; para el modelo asociado, no disponible.
- Despliegue: compatible con cualquier runtime que cargue `tokenizer.json` (Transformers, vLLM, TGI, llama.cpp/Ollama mediante conversion del tokenizador). No se han publicado datos de latencia o throughput del tokenizador.
- Tamano del repositorio: 0,0 GB, por lo que el artefacto es trivial de almacenar y distribuir.

## Comparativa con modelos similares

| Tokenizador | Vocab | Web latino (a) | Cirilico (b) | Cyr/Lat | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| uzbek-bpe-v2-128k | 128.040 | 1,430 | 1,479 | 1,017 | Apache 2.0 | Uzbeko (latino, cirilico, reformado, mixto) |
| tahrirchi-bert (uz) | 30.528 | 1,878 | 3,952 | 2,060 | No disponible en la informacion | Uzbeko |
| NeuronAI-Uzbek (uz) | 180.000 | 2,659 | 4,678 | 1,646 | No disponible en la informacion | Uzbeko |
| XLM-RoBERTa | 250.002 | 2,218 | 3,304 | 1,432 | No disponible en la informacion | Multilingue |
| GPT-4o o200k | 200.019 | 2,578 | 3,078 | 1,066 | No disponible en la informacion | Multilingue general |
| Llama 3.2 | 128.256 | 3,110 | 4,333 | 1,204 | No disponible en la informacion | Multilingue general |
| Qwen3 | 151.669 | 3,199 | 4,509 | 1,259 | No disponible en la informacion | Multilingue general |

Frente a tokenizadores especificos de uzbeko, v2-128k obtiene el menor numero de tokens por palabra en todos los conjuntos y la menor penalizacion cirilico/latino; frente a los multilingues de gran vocabulario, gana en eficiencia sobre uzbek a costa de un vocabulario mucho mas pequeno y sin cobertura de otros idiomas.

## Limitaciones y advertencias

- El texto de entrenamiento en alfabeto reformado es sintetico (convertido por regla), porque casi no existe texto real; los nombres extranjeros escritos con sh/ch (por ejemplo, Chrome) tambien se convierten.
- Los numeros se dividen en grupos de hasta 3 digitos, por lo que el texto con muchas cifras (noticias, listas) consume mas tokens por palabra.
- Cobertura limitada al uzbeko: no es un tokenizador multilingue y no debe usarse para otros idiomas sin evaluacion previa.
- Es un tokenizador, no un modelo: no genera texto ni ofrece razonamiento, tool calling o capacidades multimodales.
- Las cifras de calidad de modelo proceden de GPT pequenos (25,3M parametros, 1 GB de texto) y no garantizan el mismo comportamiento en modelos de 7B o superiores.
- Los resultados de UzLiB se puntuan por verosimilitud y no son comparables con la tabla publica de UzLiB.
- El tokenizador no translitera cirilico a latino; los pipelines que esperen texto normalizado a un unico alfabeto deben hacer esa conversion aparte.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento (Digitaluz/uzbek-language-corpus) estan bajo ODC-By v1.0, que exige atribucion.
- Riesgo de sesgo derivado de la composicion del corpus (45% latino actual, 30% cirilico, 20% reformado sintetico, 5% mixto) y de las fuentes muestreadas.

## Enlaces

- Hugging Face: https://huggingface.co/IslombekT/uzbek-bpe-v2-128k
- Dataset de entrenamiento: https://huggingface.co/datasets/Digitaluz/uzbek-language-corpus
- Dataset UzLiB: https://huggingface.co/datasets/tahrirchi/uzlib
- Dataset de clasificacion de noticias: https://huggingface.co/datasets/murodbek/uz-text-classification
- Variantes de la familia: `IslombekT/uzbek-bpe-v2-32k` y `IslombekT/uzbek-bpe-v2-64k` (referenciadas en la model card; no se dispone de URL verificada en la informacion proporcionada)
- Paper, blog o demo adicionales: no disponible
