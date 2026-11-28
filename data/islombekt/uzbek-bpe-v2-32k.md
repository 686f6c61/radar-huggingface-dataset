# IslombekT/uzbek-bpe-v2-32k

## Resumen

uzbek-bpe-v2-32k es un tokenizer BPE (Byte Pair Encoding) a nivel de byte disenado especificamente para el idioma uzbeko. Lo desarrolla IslombekT y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje generativo, sino el componente de tokenizacion que se situa entre el texto crudo y cualquier modelo que se entrene o ejecute con texto uzbeko. Resuelve un problema concreto: los tokenizers multilingues genericos (Llama 3.2, Qwen3, GPT-4o, Gemma 3) fragmentan el uzbeko en exceso, especialmente en escritura cirilica y en el alfabeto latino reformado, lo que encarece el entrenamiento y degrada la calidad efectiva del modelo.

El vocabulario es de 32.000 tokens aprendidos mas 40 tokens de relleno, hasta un total de 32.040. Forma parte de una familia de tres tamanos cortados del mismo entrenamiento: 32k para modelos pequenos, 64k para modelos de aproximadamente 1B de parametros y 128k para modelos de 7B o superiores. El contexto de aplicacion es el uzbeko en alfabeto latino actual, cirilico, el alfabeto latino reformado (con las letras o, g, s y c con diacriticos, en vigor desde el 22 de abril de 2027) y texto de escritura mixta.

Su relevancia ahora es doble: por un lado, el uzbeko esta infrarrepresentado en los tokenizers de los grandes modelos abiertos; por otro, la transicion oficial al alfabeto latino reformado obliga a que las herramientas de procesamiento de lengua cubran esa variante antes de que entre en vigor. El tokenizer incorpora un normalizador que unifica las variantes del apostrofo modificador de o y g, y nunca convierte cirilico a latino de forma automatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE (Byte Pair Encoding) a nivel de byte con normalizador NFC y pre-tokenizador basado en el patron de GPT-4o |
| Parametros totales | No aplica (no es un modelo neuronal); el modelo de validacion asociado tiene 42M de parametros, 25,3M sin embeddings |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (el tokenizer no impone contexto; depende del modelo que lo use) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Uzbeko (uz): latin actual, cirilico, latin reformado y texto mixto |
| Licencia | Apache 2.0 |
| Formato de pesos | tokenizer.json (formato Hugging Face / transformers) |

## Arquitectura y entrenamiento

El tokenizer usa BPE a nivel de byte. El normalizador integrado en tokenizer.json aplica normalizacion Unicode NFC; cualquier marca de o y g (‘, ’, ', `, ´) se convierte al caracter ʻ U+02BB, y una marca situada entre otras letras se convierte en el tutuq ʼ U+02BC. El cirilico nunca se translitera a latin. El pre-tokenizador emplea el patron de division de GPT-4o, en el que ʻ y ʼ cuentan como letras Unicode, de modo que palabras como "oʻzbek" permanecen enteras, seguido de tokenizacion a nivel de byte.

Los datos de entrenamiento son 192.024.300 palabras muestreadas de Digitaluz/uzbek-language-corpus (corpus del Ministerio de Tecnologias Digitales de la Republica de Uzbekistán, licencia ODC-By v1.0), con la siguiente composicion: 45% latin actual, 30% cirilico, 20% latin actual convertido al alfabeto reformado y 5% texto mixto, con ponderacion por raiz cuadrada entre fuentes. Se excluyeron los documentos que compartian cualquier fragmento de 24 palabras con un documento de evaluacion, y se descartaron 106 documentos con restos de OCR en chino, japones o coreano. Los tokens especiales incluyen `<|endoftext|>` y los 20 marcadores de datos personales del corpus (`[NAME]`, `[PHONE]`, etc.) como tokens unicos, con y sin espacio inicial. Los conjuntos de evaluacion se congelaron antes del entrenamiento y quedaron excluidos de el.

## Capacidades

- Tokenizacion de texto uzbeko en alfabeto latino actual con 1,684 tokens por palabra en el conjunto web de evaluacion.
- Tokenizacion de texto en alfabeto latin reformado (ö, ğ, ş, ç) con 1,728 tokens por palabra.
- Tokenizacion de texto cirilico con 1,795 tokens por palabra, y una penalizacion cirilico/latin de solo 1,047 (frente a 2,479 del tokenizer v1 de 16k).
- Manejo de texto de escritura mixta latino-cirilico con 1,896 tokens por palabra.
- Normalizacion de las variantes del apostrofo en o y g a un unico caracter canonico (U+02BB) y del tutuq (U+02BC).
- Tratamiento de los 20 marcadores de datos personales del corpus como tokens atomicos.
- Uso directo mediante `transformers.AutoTokenizer` sin codigo adicional.
- No soporta tool calling, agentes, vision ni audio: es exclusivamente un componente de tokenizacion.

## Casos de uso

- Entrenamiento de modelos de lenguaje pequenos en uzbeko: con 32.040 tokens y 1,684 tokens por palabra en latin web, reduce el coste computacional del entrenamiento; en la validacion del autor, el mismo corpus de 1 GB se convirtio en un 38% menos de tokens y el entrenamiento paso de 116 a 87 minutos.
- Preprocesamiento de corpus mixtos latin-cirilico: la penalizacion cirilico/latin de 1,047 permite procesar documentos de ambas escrituras sin inflar artificialmente la longitud de secuencia, algo relevante en corpus heredados de la era sovietica.
- Adaptacion al alfabeto reformado antes de 2027: el tokenizer ya cubre la variante con diacriticos que entrara en vigor el 22 de abril de 2027, de modo que las pipelines pueden prepararse con antelacion.
- Clasificacion y analisis de texto uzbeko: el modelo de validacion de 42M de parametros alcanzo 0,864 de exactitud en clasificacion de 15 temas tras fine-tuning con 40.000 articulos, lo que demuestra la viabilidad de tareas downstream con este vocabulario.
- Anonimizacion de datos personales: los marcadores `[NAME]`, `[PHONE]` y similares son tokens unicos, lo que simplifica la deteccion y el enmascarado en pipelines de privacidad.
- Evaluacion de conocimiento linguistico en uzbeko: el modelo de validacion obtuvo 0,630 en UzLiB (1.861 preguntas, opcion mas probable) y 0,692 con ortografia correcta, util como referencia para comparar tokenizers.
- Integracion en herramientas de busqueda y recuperacion: la tokenizacion consistente de o y g con apostrofo evita discrepancias entre consultas y documentos indexados.

## Benchmarks y rendimiento

Tokens por palabra (menor es mejor), sobre conjuntos de evaluacion congelados antes del entrenamiento:

| Tokenizer | Vocab | Web latin (a) | Latin (e) | Reformado (c) | Cirilico (b) | Mixto (d) | Cir/Lat |
|---|---|---|---|---|---|---|---|
| v2-32k | 32.040 | 1,684 | 1,686 | 1,728 | 1,795 | 1,896 | 1,047 |
| v1 uzbek-bpe-16k | 16.384 | 1,749 | 1,819 | 2,353 | 4,578 | 3,458 | 2,479 |
| tahrirchi-bert (uz) | 30.528 | 1,878 | 1,907 | 2,296 | 3,952 | 3,161 | 2,060 |
| XLM-RoBERTa | 250.002 | 2,218 | 2,313 | 2,268 | 3,304 | 2,840 | 1,432 |
| GPT-4o o200k | 200.019 | 2,578 | 2,836 | 2,605 | 3,078 | 2,846 | 1,066 |
| NeuronAI-Uzbek (uz) | 180.000 | 2,659 | 2,822 | 2,689 | 4,678 | 3,771 | 1,646 |
| Gemma 3 | 262.145 | 2,817 | 3,068 | 2,775 | 3,351 | 3,063 | 1,076 |
| Llama 3.2 | 128.256 | 3,110 | 3,537 | 3,016 | 4,333 | 3,760 | 1,204 |
| mGPT | 100.000 | 3,159 | 3,442 | 3,072 | 4,410 | 3,752 | 1,258 |
| Qwen3 | 151.669 | 3,199 | 3,518 | 3,103 | 4,509 | 3,838 | 1,259 |

Bits por byte de texto crudo (menor es mejor), con dos GPT identicos de 8 capas y 25,3M de parametros sin embeddings entrenados sobre el mismo 1 GB de texto uzbeko:

| Conjunto de evaluacion | v1-16k | v2-32k | Cambio |
|---|---|---|---|
| Web latin (a) | 1,3005 | 1,2471 | -4,1% |
| Latin (e) | 0,9560 | 0,9322 | -2,5% |
| Reformado (c) | 1,2929 | 1,2645 | -2,2% |
| Cirilico (b) | 0,5609 | 0,5327 | -5,0% |
| Mixto (d) | 0,8902 | 0,8577 | -3,6% |

Tareas downstream (mismos dos modelos):

| Tarea | v1-16k | v2-32k |
|---|---|---|
| UzLiB, 1.861 preguntas, opcion mas probable (azar = 0,250) | 0,585 | 0,630 |
| UzLiB, ortografia correcta (1.501 preguntas) | 0,640 | 0,692 |
| Clasificacion de temas de noticias, 15 clases, exactitud tras fine-tuning con 40.000 articulos | 0,882 | 0,864 |

Tiempo de entrenamiento sobre el mismo texto: 116 minutos con v1 frente a 87 minutos con v2. Las puntuaciones de UzLiB se obtienen por verosimilitud y no son comparables con la tabla de lideres oficial de UzLiB.

## Requisitos de hardware

- El tokenizer en si no requiere GPU: se ejecuta en CPU y su huella en memoria es de unos pocos MB (vocabulario de 32.040 entradas en tokenizer.json).
- El coste de hardware depende exclusivamente del modelo que se entrene o ejecute con este tokenizer, no del tokenizer.
- Modelo de validacion del autor: GPT de 8 capas y 42M de parametros totales (25,3M sin embeddings), entrenable en una unica GPU consumer.
- Despliegue: compatible con `transformers.AutoTokenizer`; al ser un tokenizer.json estandar, puede cargarse en cualquier runtime que soporte el formato (transformers, y por extension en pipelines basados en el).
- Latencia y throughput: no disponibles como metricas independientes; el efecto medido es la reduccion del 38% en numero de tokens, que se traduce directamente en menos pasos de computo por el mismo texto.

## Comparativa con modelos similares

| Tokenizer | Vocab | Tokens/palabra latin web | Penalizacion cirilico | Licencia | Cobertura uzbeko |
|---|---|---|---|---|---|
| uzbek-bpe-v2-32k | 32.040 | 1,684 | 1,047 | Apache 2.0 | Uzbeko latin, cirilico, reformado y mixto |
| uzbek-bpe-16k (v1) | 16.384 | 1,749 | 2,479 | No disponible en la informacion | Uzbeko latin y cirilico |
| tahrirchi-bert | 30.528 | 1,878 | 2,060 | No disponible en la informacion | Uzbeko |
| NeuronAI-Uzbek | 180.000 | 2,659 | 1,646 | No disponible en la informacion | Uzbeko |
| Llama 3.2 | 128.256 | 3,110 | 1,204 | Licencia comunitaria Llama | Multilingue generico |
| Qwen3 | 151.669 | 3,199 | 1,259 | Apache 2.0 | Multilingue generico |

## Limitaciones y advertencias

- El texto de entrenamiento en alfabeto reformado es sintetico, generado por reglas de conversion, porque apenas existe texto real en esa variante; los nombres extranjeros escritos con sh/ch (por ejemplo, Chrome) tambien se convierten por regla.
- Los numeros se dividen en grupos de hasta 3 digitos, por lo que el texto con alta densidad numerica (noticias, listas) consume mas tokens por palabra.
- El tokenizer no convierte cirilico a latin automaticamente; si se necesita normalizacion de escritura, debe hacerse en una etapa previa de la pipeline.
- La comparacion de calidad se realizo con modelos muy pequenos (42M de parametros) entrenados sobre solo 1 GB de texto; las puntuaciones absolutas no son representativas de modelos mayores y la comparacion relativa es el objetivo declarado.
- Las puntuaciones de UzLiB se calculan por verosimilitud de la opcion, no por generacion, y no son comparables con el leaderboard oficial.
- No hay datos publicados sobre sesgos del vocabulario ni sobre comportamiento en dominios especializados (juridico, medico, tecnico).
- La licencia Apache 2.0 permite uso comercial del tokenizer, pero el corpus de entrenamiento Digitaluz/uzbek-language-corpus esta bajo ODC-By v1.0, que exige atribucion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/IslombekT/uzbek-bpe-v2-32k
- Corpus de entrenamiento: https://huggingface.co/datasets/Digitaluz/uzbek-language-corpus
- Conjunto de evaluacion UzLiB: https://huggingface.co/datasets/tahrirchi/uzlib
- Conjunto de clasificacion de texto: https://huggingface.co/datasets/murodbek/uz-text-classification
