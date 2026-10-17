# henryhale/grouptok-en-sw-af-de-fr-es-zh-128k

## Resumen

grouptok-en-sw-af-de-fr-es-zh-128k es un tokenizador byte-level BPE de 131.072 tokens publicado por henryhale para inglés, suajili, afrikáans, alemán, francés, español y chino. No es un modelo de lenguaje: no contiene pesos neuronales, no genera texto y no razona. Su particularidad es que el vocabulario está agrupado por traducción mediante la herramienta grouptok, de forma que cada grupo reúne tokens que se traducen entre sí (por ejemplo ` water`, ` Wasser`, ` eau`, ` agua`, ` maji`).

El archivo `tokenizer.json` es exactamente el del baseline [bpe-en-sw-af-de-fr-es-zh-128k](https://huggingface.co/henryhale/bpe-en-sw-af-de-fr-es-zh-128k), por lo que ambos segmentan cualquier texto de forma idéntica; la única diferencia es `groups.json`, que asigna a cada token un identificador de grupo y una posición dentro de él. Esto permite trabajar con correspondencias explícitas entre lenguas sin alterar la tokenización ni romper comparaciones con el baseline.

Su relevancia es de investigación y de ingeniería de vocabulario: ofrece una estructura de equivalencias cross-lingual lista para usar en estudios de transferencia entre idiomas, en el diseño de vocabularios multilingües compartidos y en el análisis de la cobertura de lenguas africanas como el suajili y el afrikáans, habitualmente poco representadas en los tokenizadores de los LLM comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (no es una red neuronal: no hay transformer, MoE ni SSM) |
| Parametros totales | no aplica (tokenizador sin pesos neuronales) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (la ventana la define el modelo que consuma el tokenizador) |
| Tipos de cuantizacion | no aplica (`tokenizer.json` no se cuantiza) |
| Idiomas soportados | en, sw, af, de, fr, es, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` y `tokenizer_config.json` (tokenizador) mas `groups.json` (grupos de traduccion); libreria `tokenizers` |
| Tamano de vocabulario | 131.072 tokens |
| Tipo de BPE | byte-level, sin prefix space, alfabeto de 256 bytes |
| Tamano maximo de grupo | 14 miembros (el doble de los 7 idiomas) |
| Tokens reservados | `<\|im_start\|>`, `<\|im_end\|>`, `<think>`, `</think>` (ids 0-3), nunca agrupados |
| Tokens especiales de secuencia | no declara pad, bos ni eos; deben configurarse en el modelo que lo use |
| Version de grouptok | 0.5.0 (`GroupedTokenizer.train(..., tokenizer=<el BPE>)`) |
| Alineadores | awesome-align (capa 8) para aleman, frances, espanol y chino; XLM-R base (capa 8) para suajili y afrikaans |

## Arquitectura y entrenamiento

El tokenizador es un BPE a nivel de byte con un alfabeto de 256 bytes y sin prefijo de espacio, con un vocabulario de 131.072 entradas heredado sin cambios del baseline `bpe-en-sw-af-de-fr-es-zh-128k`. Sobre ese vocabulario, grouptok 0.5.0 realiza únicamente alineación y agrupación: no reentrena el BPE ni modifica las fusiones. Cada par de frases se segmenta con el BPE y el alineador del idioma correspondiente enlaza los subwords ingleses con los del otro lado; los enlaces de todos los pares y de todos los idiomas se agregan y se convierten en grupos, de modo que un grupo puede contener la palabra en varias lenguas aunque cada alineador solo haya visto inglés emparejado con una de ellas. El inglés es siempre el primer lado del par, así que el miembro 0 de cada grupo es su palabra inglesa. Los tokens sin vínculo de traducción quedan en grupos de un solo miembro.

Los datos de entrenamiento son los del BPE base: 1.000.000 de pares de frases inglés–X por idioma. Para alemán se usan los primeros 776.847 pares de Europarl (WMT14) `de-en` más los 223.153 de News Commentary `de-en`; para francés, 790.521 de Europarl (WMT14) `fr-en` más 209.479 de News Commentary `en-fr`; para español, 761.128 de Europarl `en-es` más 238.872 de News Commentary `en-es`; para chino, 311.500 de News Commentary (WMT19) `zh-en` más 688.500 de UN Parallel Corpus `en-zh`; para suajili y afrikáans, el primer millón de pares minados por NLLB ordenados por mejor puntuación. El corpus es mayoritariamente parlamentario, periodístico, de Naciones Unidas y de minería web, y el equilibrio entre lenguas se hace por número de pares de frases, no por volumen de texto.

## Capacidades

- Segmentación byte-level BPE multilingüe para inglés, suajili, afrikáans, alemán, francés, español y chino, con salida idéntica a la del baseline.
- Consulta de grupos de traducción: dado un token, obtener su grupo y su posición mediante `groups.json` o `GroupedTokenizer.readable_groups()`.
- Extracción de equivalencias léxicas a nivel de subword entre el inglés y las otras seis lenguas, útil para construir diccionarios inductivos o inicializar embeddings.
- Integración directa con `transformers.AutoTokenizer` y con la librería `tokenizers` de Hugging Face.
- Plantilla de chat incluida en `tokenizer_config.json`, con tokens reservados para turnos de conversación (`<|im_start|>`, `<|im_end|>`) y para modo de razonamiento (`<think>`, `</think>`).
- Compatibilidad de ficheros con el baseline: permite alternar entre ambos tokenizadores sin cambiar el pipeline de preprocesado.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni uso como agente: es exclusivamente un componente de tokenización.

## Casos de uso

- Diseño de vocabularios multilingües compartidos: los grupos permiten inicializar o atar embeddings de tokens que son traducción unos de otros, lo que sirve para estudiar transferencia cross-lingual en modelos pequeños entrenados desde cero con este vocabulario.
- Ablaciones controladas de tokenización: al compartir `tokenizer.json` con el baseline, cualquier diferencia medida en un experimento se puede atribuir a los grupos y no a la segmentación, algo poco habitual en este tipo de estudios.
- Construcción de léxicos bilingües inductivos: recorriendo `groups.json` se obtienen pares de subwords inglés–suajili, inglés–afrikáans o inglés–chino que pueden usarse como semilla de diccionarios o para evaluar alineadores.
- Evaluación comparativa de alineadores: como awesome-align y XLM-R base se aplican a subconjuntos de idiomas distintos, los grupos permiten medir de forma indirecta qué alineador produce correspondencias más coherentes por lengua.
- Preprocesado de pipelines de NLP para África oriental: un único tokenizador cubre suajili e inglés con 131.072 tokens, lo que simplifica el despliegue en sistemas de clasificación, búsqueda o etiquetado para esos mercados.
- Investigación sobre fertilidad y cobertura léxica: al disponer de un vocabulario multilingüe balanceado por pares de frases, se puede analizar cuántos tokens consume cada lengua y detectar infrarrepresentación del suajili o del afrikáans frente al alemán o el francés.
- Reproducibilidad de experimentos multilingües: los archivos son JSON versionados en el Hub, de modo que un pipeline de investigación puede fijar la revisión exacta del tokenizador y de los grupos sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de fertilidad (tokens por palabra), tasa de compresión, cobertura de vocabulario por idioma ni evaluaciones de calidad de los grupos; tampoco se comparan los grupos generados con los de otros tokenizadores multilingües.

## Requisitos de hardware

- VRAM: 0 GB. Es un tokenizador y se ejecuta en CPU; no requiere GPU ni aceleradores.
- GPU recomendadas: no aplica. Cualquier GPU es irrelevante para su funcionamiento.
- Cabe en cualquier equipo: el coste es de CPU y memoria RAM, no de acelerador. La huella en disco corresponde a ficheros JSON; no se ha publicado el tamaño exacto de los archivos.
- Memoria: un vocabulario de 131.072 tokens en JSON se maneja sin problema en cualquier entorno de desarrollo convencional; no se han publicado cifras oficiales de consumo.
- Opciones de despliegue: `transformers.AutoTokenizer`, la librería `tokenizers`, `grouptok` (`pip install grouptok`) para leer los grupos y `huggingface_hub` para descargar los archivos. No aplica vLLM, TGI, llama.cpp ni Ollama, ya que no hay pesos de modelo que servir.
- Latencia y throughput: no disponible. No se han publicado mediciones, y el rendimiento dependerá de la implementación (Rust de `tokenizers` frente a alternativas en Python) y del texto de entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Vocabulario | Grupos de traduccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grouptok-en-sw-af-de-fr-es-zh-128k | Tokenizador byte-level BPE + grupos | 131.072 | Si, maximo 14 miembros por grupo | Apache 2.0 | Hugging Face |
| bpe-en-sw-af-de-fr-es-zh-128k | Tokenizador byte-level BPE (baseline) | 131.072 | No | Apache 2.0 | Hugging Face |
| grouptok-en-sw-af-de-fr-es-zh-200k | Tokenizador byte-level BPE + grupos | 200.000 | Si | Apache 2.0 | Hugging Face |

Frente al baseline, la diferencia es exclusivamente la existencia de `groups.json`; la segmentación es idéntica token a token. Frente a la variante de 200.000 tokens, cambia el tamaño del vocabulario y, por tanto, la fertilidad y la longitud de las secuencias resultantes. No se dispone de información en la búsqueda realizada sobre otros tokenizadores multilingües comparables con grupos de traducción, ni de métricas que permitan ordenarlos por calidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no puede usarse para razonamiento, código, matemáticas ni tareas agénticas.
- Los grupos heredan los errores de los alineadores, y como los alineadores difieren por idioma (awesome-align para de/fr/es/zh, XLM-R base para sw/af), la calidad de los grupos también difiere entre lenguas.
- Los grupos enlazan subwords individuales uno a uno: las expresiones multipalabra y sus traducciones en una sola palabra nunca se agrupan, lo que deja fuera una parte relevante del léxico real.
- El corpus de entrenamiento es principalmente parlamentario, periodístico, de la ONU y minado de la web, con posibles sesgos de dominio y de registro; el equilibrio entre lenguas se hace por número de pares de frases y no por cantidad de texto, lo que puede infrarrepresentar lenguas con frases más largas o con más texto por par.
- No declara tokens de pad, bos ni eos: si se usa para entrenar un modelo, hay que definirlos explícitamente y comprobar que no colisionan con los ids reservados 0-3.
- No se han publicado métricas de calidad de los grupos, de fertilidad ni de cobertura, por lo que su idoneidad para una tarea concreta debe validarse empíricamente.
- El tokenizador solo cubre siete idiomas; cualquier lengua fuera de ese conjunto quedará fragmentada en bytes sin estructura de grupos útil.
- La licencia Apache 2.0 permite uso comercial y modificación con atribución y aviso de cambios; conviene revisar los términos de los corpus de origen (Europarl, UN Parallel Corpus, News Commentary) si se redistribuyen datos derivados.
- Al ser un artefacto sin descargas ni uso documentado, no hay evidencia de comunidad ni de mantenimiento a largo plazo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/henryhale/grouptok-en-sw-af-de-fr-es-zh-128k)
- [Baseline bpe-en-sw-af-de-fr-es-zh-128k](https://huggingface.co/henryhale/bpe-en-sw-af-de-fr-es-zh-128k)
- [Variante grouptok-en-sw-af-de-fr-es-zh-200k](https://huggingface.co/henryhale/grouptok-en-sw-af-de-fr-es-zh-200k)
- [Repositorio grouptok en GitHub](https://github.com/henryhale/grouptok)
- [Perfil de henryhale en GitHub](https://github.com/henryhale)
- [Sitio web de Henry Hale](https://www.henryhale.com/)
- [Alineador awesome-align-with-co](https://huggingface.co/aneuraz/awesome-align-with-co)
- [Alineador XLM-R base](https://huggingface.co/FacebookAI/xlm-roberta-base)
- [Dataset Europarl (WMT14)](https://huggingface.co/datasets/wmt/wmt14)
- [Dataset News Commentary](https://huggingface.co/datasets/Helsinki-NLP/news_commentary)
- [Dataset Europarl (Helsinki-NLP)](https://huggingface.co/datasets/Helsinki-NLP/europarl)
- [Dataset News Commentary WMT19](https://huggingface.co/datasets/wmt/wmt19)
- [Dataset UN Parallel Corpus](https://huggingface.co/datasets/Helsinki-NLP/un_pc)
- [Pares ingles–suajili minados por NLLB](https://huggingface.co/datasets/michsethowusu/english-swahili_sentence-pairs)
- [Pares afrikaans–ingles minados por NLLB](https://huggingface.co/datasets/michsethowusu/afrikaans-english_sentence-pairs)
