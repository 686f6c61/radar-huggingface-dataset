# henryhale/bpe-en-sw-af-de-fr-es-zh-152k

## Resumen

bpe-en-sw-af-de-fr-es-zh-152k es un tokenizador de tipo byte-level BPE con un vocabulario de 151.665 tokens, publicado por el usuario henryhale bajo licencia Apache 2.0. No es un modelo de lenguaje: es un artefacto de preprocesado que convierte texto en secuencias de identificadores para siete idiomas (inglés, suahili, afrikáans, alemán, francés, español y chino). Su funcionamiento se apoya en la librería `tokenizers` de Hugging Face y se distribuye como `tokenizer.json`, `tokenizer_config.json` y un fichero auxiliar `groups.json`.

El elemento que lo distingue es su relación con grouptok-en-sw-af-de-fr-es-zh-152k: este tokenizador es la línea base "sin agrupar" de aquel. Ambos comparten exactamente el mismo vocabulario y segmentan cualquier texto de forma idéntica; la única diferencia es que la versión grouptok organiza los tokens en grupos definidos por traducción. Esto lo convierte en la referencia de control necesaria para medir el efecto de la agrupación semántica sobre el comportamiento de un tokenizador.

Su relevancia actual es doble. Por un lado, incorpora suahili y afrikáans con un millón de pares de frases cada uno, una cobertura poco habitual en vocabularios multilingües degran tamaño, que suelen priorizar lenguas europeas y chino. Por otro, reserva los identificadores 0 a 3 para `<|im_start|>`, `<|im_end|>`, `<think>` y `</think>`, lo que indica que está pensado para modelos conversacionales con modo de razonamiento. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (sin red neuronal; alfabeto de 256 bytes, sin prefix space) |
| Parametros totales | No aplica (no es un modelo de lenguaje) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo que use el tokenizador) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | en, sw, af, de, fr, es, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json` (libreria `tokenizers`); incluye `groups.json` |
| Tamano de vocabulario | 151.665 tokens |
| Tokens reservados | `<|im_start|>`, `<|im_end|>`, `<think>`, `</think>` (ids 0-3) |
| Tokens especiales declarados | Ninguno: no declara pad, bos ni eos |
| Metodo de entrenamiento | `grouptok.tokenizer.train_bpe` (Hugging Face `tokenizers`) |
| Datos de entrenamiento | 1.000.000 de pares de frases ingles-X por idioma, ambos lados |
| Tamano del repositorio | 0,0 GB declarados |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

El tokenizador implementa byte-level BPE con un alfabeto base de 256 bytes y sin marca de espacio prefijo, una variante que garantiza cobertura completa de cualquier cadena Unicode sin tokens de desconocido. El vocabulario final es de 151.665 entradas, de las cuales las cuatro primeras están reservadas para tokens de control conversacional y de razonamiento. El entrenamiento se realizó con la función `train_bpe` de la librería grouptok sobre la implementación oficial de Hugging Face `tokenizers`.

El corpus de entrenamiento consiste en un millón de pares de frases inglés-X por cada idioma, tomando ambos lados del par. Para alemán se usaron 776.847 pares de Europarl (WMT14) más los 223.153 de News Commentary; para francés, 790.521 de Europarl más 209.479 de News Commentary; para español, 761.128 de Europarl (Helsinki-NLP) más 238.872 de News Commentary; para chino, 311.500 de News Commentary (WMT19) y 688.500 del UN Parallel Corpus; para suahili y afrikáans se emplearon los mejores pares minados de NLLB, un millón en cada caso. La composición textual es, por tanto, parlamentaria, periodística, de Naciones Unidas y de minería web.

La innovación técnica asociada no reside en el tokenizador en sí, sino en su papel como control experimental: `groups.json` asigna un grupo por token (es decir, ninguno), de modo que herramientas y modelos que lean el formato de grouptok puedan consumir indistintamente esta versión y la agrupada y comparar resultados sobre una segmentación idéntica. No se documenta ningún proceso de ajuste posterior, RLHF, DPO ni destilación, algo que no tendría sentido en un componente de tokenización.

## Capacidades

- Segmentacion byte-level de texto en siete idiomas: inglés, suahili, afrikáans, alemán, francés, español y chino.
- Cobertura total de bytes: al partir del alfabeto de 256 bytes, no genera tokens de desconocido para texto no visto.
- Plantilla de chat incluida en `tokenizer_config.json`, compatible con el esquema de turnos `<|im_start|>` / `<|im_end|>`.
- Marcas de razonamiento `<think>` y `</think>` reservadas en los identificadores 0 a 3, orientadas a modelos con modo de pensamiento explícito.
- Compatibilidad con el ecosistema Hugging Face mediante `AutoTokenizer` y con la librería `tokenizers` de forma aislada.
- Fichero `groups.json` en formato grouptok, que permite lectura homogénea junto a la versión agrupada del vocabulario.
- Segmentacion idéntica a la de grouptok-en-sw-af-de-fr-es-zh-152k, lo que habilita comparaciones controladas.
- No incorpora capacidades de generación, razonamiento, código, matemáticas, visión ni tool calling: esas funciones corresponden al modelo que utilice el tokenizador.

## Casos de uso

- Preentrenamiento de modelos de lenguaje multilingües con foco en África oriental y austral: un vocabulario de 151.665 tokens que dedica un millón de pares de frases a suahili y otro tanto a afrikáans reduce la fragmentación de esas lenguas respecto a tokenizadores centrados en inglés, lo que abarata el coste por token en entrenamiento e inferencia.
- Adaptación de vocabulario de modelos existentes: al ser un BPE byte-level estándar, puede adoptarse como tokenizador de partida y ampliarse o recortarse sin rehacer la infraestructura, ya que el formato `tokenizer.json` es el nativo de Hugging Face.
- Experimentación controlada en investigación sobre tokenización: su condición de línea base sin agrupar frente a grouptok permite aislar el efecto de la agrupación semántica del vocabulario en métricas de fertilidad, convergencia y calidad final, manteniendo la segmentación constante.
- Traducción automática y procesamiento de corpus institucionales: el vocabulario se entrenó sobre Europarl, News Commentary y el UN Parallel Corpus, de modo que se ajusta bien a textos parlamentarios, periodísticos y de organismos internacionales en los pares en-de, en-fr, en-es y en-zh.
- Sistemas conversacionales con modo de razonamiento: la plantilla de chat y los tokens `<|im_start|>`, `<|im_end|>`, `<think>` y `</think>` permiten integrarlo directamente en pipelines de diálogo multi-turno que distingan entre respuesta final y traza de razonamiento.
- Normalización y filtrado de corpus web multilingües: al no producir tokens de desconocido, sirve para medir cobertura léxica y detectar texto anómalo o fuera de dominio antes de un entrenamiento de mayor coste.
- Procesamiento de documentos mixtos chino-latino: la combinación de un vocabulario compartido para chino y cinco lenguas europeas más suahili y afrikáans simplifica arquitecturas que deban manejar contenido multilingüe en un único modelo.
- Evaluación comparativa de tokenizadores en entornos académicos: el par formado por este tokenizador y su versión agrupada constituye un banco de pruebas reproducible para estudiar cómo la organización del vocabulario afecta al comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de fertilidad (tokens por palabra), comparaciones de compresión, evaluaciones de cobertura léxica ni resultados de modelos entrenados con este tokenizador. Tampoco se documentan experimentos de velocidad de tokenización. La única comparación implícita disponible es la equivalencia funcional con grouptok-en-sw-af-de-fr-es-zh-152k, cuya segmentación es idéntica por construcción, sin que ello constituya una medida de rendimiento.

## Requisitos de hardware

- No requiere GPU: es un componente de preprocesado que se ejecuta en CPU.
- Huella de memoria: el repositorio declara 0,0 GB. El consumo real depende del tamano exacto de `tokenizer.json`, que no se especifica en la informacion disponible; para vocabularios de este orden suele ser de unos pocos megabytes, pero no se confirma ningun valor concreto.
- GPU recomendadas: no aplica. La tokenización puede ejecutarse en paralelo sobre CPU con multiples procesos si el volumen de datos lo exige.
- Compatibilidad con GPU de consumo: no aplica, ya que no hay inferencia de red neuronal implicada.
- Opciones de despliegue: libreria `tokenizers` de Hugging Face de forma nativa, `transformers` mediante `AutoTokenizer`, y como componente de tokenización dentro de servidores de inferencia como vLLM, TGI o llama.cpp cuando el modelo asociado los utilice.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia de codificación.
- Almacenamiento: despreciable en comparacion con los pesos de cualquier modelo de lenguaje; el cuello de botella real sera el modelo que consuma este tokenizador.

## Comparativa con modelos similares

| Tokenizador | Tamano de vocabulario | Idiomas | Metodo | Licencia | Notas |
|---|---|---|---|---|---|
| bpe-en-sw-af-de-fr-es-zh-152k | 151.665 | en, sw, af, de, fr, es, zh | byte-level BPE, sin prefix space | Apache 2.0 | Linea base sin agrupar; incluye tokens `<think>` |
| grouptok-en-sw-af-de-fr-es-zh-152k | 151.665 | en, sw, af, de, fr, es, zh | byte-level BPE con agrupacion por traduccion | Apache 2.0 | Mismo vocabulario y segmentacion; difiere solo en `groups.json` |
| XLM-RoBERTa (SentencePiece) | 250.000 | alrededor de 100 idiomas | SentencePiece unigram | MIT | Referencia multilingue ampliamente usada; no incluye suahili y afrikáans con corpus dedicado |
| mT5 (SentencePiece) | 250.000 | alrededor de 100 idiomas | SentencePiece unigram | Apache 2.0 | Cobertura linguistica muy amplia, sin agrupacion semantica |

Los datos de XLM-RoBERTa y mT5 proceden de su documentacion publica y se incluyen como referencia de categoria; no se dispone de comparaciones de fertilidad, cobertura ni calidad entre ellos y el tokenizador descrito. Para cualquier metrica cuantitativa, el valor es "no disponible".

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite tool calling. Cualquier expectativa de ese tipo es un error de categoría.
- No declara tokens de pad, bos ni eos. El desarrollador indica explicitamente que hay que definirlos si el modelo los necesita, lo que puede provocar errores silenciosos en pipelines que los asuman.
- El vocabulario no esta equilibrado por volumen de texto, solo por numero de pares de frases. Como los pares de suahili y afrikáans son mas cortos que los de las demas lenguas, su cuota efectiva de vocabulario es menor de lo que sugiere el millon de pares.
- El dominio de entrenamiento es acotado: texto parlamentario, periodistico, de Naciones Unidas y minado de la web. El rendimiento puede degradarse en registros coloquiales, tecnicos, legales especializados o conversacionales.
- Sesgo de fuente: la sobrerrepresentacion de textos institucionales europeos y de agencias de noticias puede introducir un sesgo tematico y estilistico en la segmentacion.
- Riesgo de alucinacion: no aplica al tokenizador en si, pero un modelo entrenado con el heredara los sesgos de cobertura anteriores.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No se documentan restricciones adicionales.
- Ausencia de validacion publica: cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks ni modelos entrenados que respalden su comportamiento en produccion.
- No se especifica versionado del vocabulario ni politica de mantenimiento, lo que dificulta garantizar reproducibilidad a largo plazo.
- La busqueda web realizada no devolvio ningun resultado relacionado con el proyecto; los enlaces externos adicionales son "no disponible".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/henryhale/bpe-en-sw-af-de-fr-es-zh-152k
- Tokenizador agrupado de referencia: https://huggingface.co/henryhale/grouptok-en-sw-af-de-fr-es-zh-152k
- Europarl (WMT14), corpus de aleman, frances y espanol: https://huggingface.co/datasets/wmt/wmt14
- Europarl (Helsinki-NLP), corpus de espanol: https://huggingface.co/datasets/Helsinki-NLP/europarl
- News Commentary (Helsinki-NLP): https://huggingface.co/datasets/Helsinki-NLP/news_commentary
- News Commentary (WMT19), corpus de chino: https://huggingface.co/datasets/wmt/wmt19
- UN Parallel Corpus (Helsinki-NLP), corpus de chino: https://huggingface.co/datasets/Helsinki-NLP/un_pc
- Pares de frases ingles-suahili (NLLB): https://huggingface.co/datasets/michsethowusu/english-swahili_sentence-pairs
- Pares de frases afrikaans-ingles (NLLB): https://huggingface.co/datasets/michsethowusu/afrikaans-english_sentence-pairs
- Paper, blog o repositorio de grouptok: no disponible
- Demo o espacio asociado: no disponible
