# henryhale/bpe-en-sw-af-de-fr-es-zh-64k

## Resumen

`bpe-en-sw-af-de-fr-es-zh-64k` es un tokenizador byte-level BPE con un vocabulario de 65.536 tokens desarrollado por el usuario henryhale y publicado en Hugging Face bajo licencia Apache-2.0. Cubre siete idiomas: ingles, swahili, afrikaans, aleman, frances, espanol y chino. No es un modelo de lenguaje: no genera texto ni tiene parametros entrenados, sino que define la segmentacion entre texto y tokens que un modelo posterior consumiria. Su funcion es servir como baseline sin agrupar del tokenizador `grouptok-en-sw-af-de-fr-es-zh-64k`, que agrupa exactamente este mismo vocabulario por traduccion; ambos segmentan cualquier texto de forma identica y solo difieren en la estructura de grupos.

La relevancia del artefacto esta en su vocabulario equilibrado por numero de pares de frases en lugar de por volumen de texto, con 1.000.000 de pares ingles-X por idioma y ambos lados de cada par incluidos en el entrenamiento. Esto lo convierte en una pieza util para investigacion en tokenizacion multilingue, especialmente en idiomas africanos (swahili y afrikaans) habitualmente infrarrepresentados en los vocabularios de los modelos abiertos. El tokenizador reserva ademas los identificadores 0-3 para `<|im_start|>`, `<|im_end|>`, `<think>` y `</think>`, lo que anticipa su uso en plantillas de chat y modos de razonamiento.

Se distribuye con la libreria `tokenizers` y consta de tres ficheros (`tokenizer.json`, `tokenizer_config.json` con plantilla de chat y `groups.json` en el formato de grouptok). En el momento de la consulta registra 0 descargas y 0 likes, por lo que no existe validacion comunitaria publica de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (Byte Pair Encoding) sin prefijo de espacio, alfabeto de 256 bytes |
| Parametros totales | no aplica (no es un modelo neuronal; no tiene parametros entrenados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (la ventana de contexto la define el modelo que use el tokenizador) |
| Tipos de cuantizacion | no aplica (el vocabulario no se cuantiza; no se distribuyen pesos) |
| Idiomas soportados | en, sw, af, de, fr, es, zh (ingles, swahili, afrikaans, aleman, frances, espanol, chino) |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica; se distribuyen `tokenizer.json`, `tokenizer_config.json` y `groups.json` |
| Tamano del vocabulario | 65.536 tokens |
| Tokens reservados | `<\|im_start\|>`, `<\|im_end\|>`, `<think>`, `</think>` (ids 0-3) |
| Tokens especiales de secuencia | no disponible (no se declaran pad, bos ni eos) |
| Libreria | `tokenizers` (compatible con `transformers.AutoTokenizer`) |
| Datos de entrenamiento | 1.000.000 de pares de frases ingles-X por idioma, ambos lados |
| Tamano del fichero `tokenizer.json` | no disponible |

## Arquitectura y entrenamiento

El tokenizador sigue un esquema byte-level BPE clasico: parte de un alfabeto de 256 bytes, lo que garantiza cobertura de cualquier cadena Unicode sin tokens de desconocido, y aplica fusiones iterativas de los pares mas frecuentes hasta alcanzar 65.536 entradas. Se configura sin prefijo de espacio, un detalle relevante porque implica que la frontera entre palabras y espacios se representa mediante el propio byte de espacio y no mediante un caracter centinela tipo `▁` (SentencePiece) o `Ġ` (GPT-2). El entrenamiento se realizo con la funcion `grouptok.tokenizer.train_bpe` de la libreria Hugging Face `tokenizers`.

El corpus combina 1.000.000 de pares de frases ingles-X por idioma, sumando ambos lados de cada par. Para aleman, frances y espanol se usan Europarl (WMT14) y News Commentary, priorizando el corpus menor completo y las primeras filas del mayor: aleman con 776.847 pares de Europarl `de-en` y 223.153 de News Commentary `de-en`; frances con 790.521 pares de Europarl `fr-en` y 209.479 de News Commentary `en-fr`; espanol con 761.128 pares de Europarl `en-es` y 238.872 de News Commentary `en-es`. Para chino se emplean News Commentary (WMT19) `zh-en` con 311.500 pares y UN Parallel Corpus `en-zh` con 688.500 pares. Para swahili y afrikaans se recurre a pares minados de NLLB, tomando los 1.000.000 mejor puntuados de cada conjunto.

La innovacion tecnica no esta en el algoritmo, que es estandar, sino en la doble publicacion: este tokenizador actua como baseline sin agrupar de `grouptok-en-sw-af-de-fr-es-zh-64k`. El fichero `groups.json` contiene un grupo por token en el formato de grouptok, de modo que las herramientas que consumen cualquiera de los dos artefactos leen la misma estructura de grupos. No se documenta en la informacion disponible ningun ajuste posterior (RLHF, DPO) ni proceso de destilacion, algo esperable al tratarse de un componente de preprocesado.

## Capacidades

- Segmentacion de texto a tokens en los siete idiomas declarados (en, sw, af, de, fr, es, zh) mediante un unico vocabulario compartido de 65.536 entradas.
- Cobertura byte-level completa: cualquier cadena Unicode es representable sin tokens de desconocido, incluidos idiomas fuera de la lista.
- Plantilla de conversacion incluida en `tokenizer_config.json` y tokens reservados de chat (`<|im_start|>`, `<|im_end|>`) para modelos conversacionales multi-turno.
- Tokens de razonamiento reservados (`<think>`, `</think>`) para modelos con modo de pensamiento explicito.
- Compatibilidad directa con `transformers.AutoTokenizer` y con la libreria `tokenizers` en solitario.
- Ecosistema grouptok: lectura de `groups.json` para trabajar con el vocabulario agrupado o sin agrupar bajo la misma interfaz.
- No dispone de capacidades de generacion, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes: esas funciones corresponden al modelo que se entrene sobre este vocabulario.

## Casos de uso

- Preentrenamiento de modelos de lenguaje multilingues para los siete idiomas: un vocabulario unico de 65.536 tokens evita duplicar embeddings por idioma y permite compartir representaciones entre lenguas latinas, germanicas y el chino.
- Baseline en investigacion sobre tokenizacion: al segmentar de forma identica que `grouptok-en-sw-af-de-fr-es-zh-64k`, permite aislar el efecto del agrupamiento frente al del vocabulario en experimentos controlados.
- Modelos de traduccion automatica en pares ingles-X: el entrenamiento se realizo sobre corpus paralelos (Europarl, News Commentary, UN Parallel Corpus, NLLB), por lo que la distribucion de subpalabras esta alineada con ese dominio.
- Atencion al cliente en mercados de Africa Oriental y Australia del Sur: cubre swahili y afrikaans con un vocabulario entrenado sobre pares reales, no derivado de un tokenizador centrado en ingles.
- Modelos conversacionales con modo de razonamiento: los tokens reservados `<|im_start|>`, `<|im_end|>`, `<think>` y `</think>` permiten plantillas de chat y trazas de pensamiento sin anadir tokens fuera de vocabulario.
- Analisis y alineacion de corpus paralelos: la tokenizacion consistente en ambos lados de un par facilita metricas de solapamiento de subpalabras y estudios de fertilidad por idioma.
- Investigacion sobre equidad linguistica: el criterio de 1.000.000 de pares por idioma (y no de volumen de texto) hace visible el sesgo de asignacion de vocabulario entre lenguas con longitudes de frase distintas.
- Empaquetado de pipelines de preprocesado: al ser un artefacto ligero y sin dependencias de GPU, se integra en contenedores de entrenamiento y en servicios de tokenizacion de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un tokenizador y no de un modelo de lenguaje, las metricas aplicables no serian MMLU, HumanEval o GSM8K, sino medidas de compresion y fertilidad por idioma (tokens por palabra, tokens por caracter, porcentaje del vocabulario asignado a cada lengua). La model card no incluye ninguna de estas cifras, ni tampoco comparaciones cuantitativas con otros tokenizadores multilingues.

## Requisitos de hardware

- VRAM para inferencia: 0 GB propios. El tokenizador se ejecuta en CPU; el consumo de memoria lo determina el modelo que lo utilice.
- GPU recomendadas: no aplica. No requiere A100, H100 ni RTX 4090 para funcionar; esas GPU solo serian necesarias para el modelo entrenado sobre el vocabulario.
- GPU de consumo: irrelevante para el tokenizador. Cualquier equipo capaz de ejecutar Python y la libreria `tokenizers` es suficiente.
- CPU: la implementacion de `tokenizers` esta escrita en Rust y soporta paralelismo, por lo que el rendimiento de tokenizacion es alto en CPU sin aceleracion dedicada; no se publican cifras de throughput.
- Espacio en disco: no disponible. Se desconoce el tamano de `tokenizer.json` para un vocabulario de 65.536 entradas.
- Opciones de despliegue: carga directa con `transformers.AutoTokenizer.from_pretrained` o con `tokenizers.Tokenizer.from_file`; se integra como fichero de preprocesado en vLLM, TGI u otros servidores de inferencia, aunque no se despliega por si mismo como servicio de generacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa se limita al ambito de tokenizadores multilingues. Los valores de los artefactos ajenos a la informacion proporcionada son referencias generales y no se han verificado en la busqueda realizada.

| Tokenizador | Vocabulario | Algoritmo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `bpe-en-sw-af-de-fr-es-zh-64k` | 65.536 | byte-level BPE, sin prefijo de espacio | en, sw, af, de, fr, es, zh | apache-2.0 | `tokenizer.json`, `tokenizer_config.json`, `groups.json` | Baseline sin agrupar; 1.000.000 de pares ingles-X por idioma |
| `grouptok-en-sw-af-de-fr-es-zh-64k` | 65.536 | byte-level BPE con agrupacion por traduccion | en, sw, af, de, fr, es, zh | no disponible | `groups.json` en formato grouptok | Segmenta de forma identica al anterior; solo cambian los grupos |
| Tokenizador de XLM-R | 250.002 (referencia general, no verificada) | SentencePiece unigram | 100 idiomas | MIT (referencia general, no verificada) | SentencePiece | Vocabulario mucho mayor; no incluye tokens reservados de chat ni de razonamiento |
| Tokenizador de Llama 3 | 128.256 (referencia general, no verificada) | BPE basado en tiktoken | predominantemente ingles y lenguas europeas | licencia de comunidad de Llama (referencia general, no verificada) | `tokenizer.json` | Cobertura de idiomas africanos limitada; no es Apache-2.0 |

No se dispone de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Desbalance de vocabulario entre idiomas: los idiomas se equilibran por numero de pares de frases (1.000.000 cada uno), no por volumen de texto. Como los pares de swahili y afrikaans son mas cortos, esas lenguas reciben una cuota menor de vocabulario que el aleman, el frances, el espanol o el chino.
- Sesgo de dominio: el entrenamiento se apoya en texto parlamentario (Europarl), noticias (News Commentary), documentos de Naciones Unidas (UN Parallel Corpus) y pares minados de la web (NLLB). El registro coloquial, tecnico o dialectal esta infrarrepresentado.
- Cobertura linguistica cerrada a siete idiomas: aunque el esquema byte-level permite tokenizar cualquier idioma, las fusiones aprendidas estan optimizadas para esos siete, por lo que la fertilidad en otras lenguas sera peor.
- Variedades dialectales: no se documenta el tratamiento de variantes del swahili ni del afrikaans; un vocabulario entrenado sobre corpus escritos puede segmentar mal registros orales o regionales.
- Sin tokens especiales de secuencia declarados: no se definen pad, bos ni eos, por lo que cualquier modelo que lo use debe configurarlos explicitamente y versionarlos junto al tokenizador.
- Sin benchmarks publicados: no hay datos de compresion ni de fertilidad por idioma que permitan anticipar su comportamiento en produccion frente a alternativas.
- Riesgo de alucinacion y sesgos: no aplica al tokenizador en si, que es determinista y no genera contenido. Los sesgos relevantes son los heredados del corpus y se manifestaran en el modelo entrenado sobre el.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y el fichero de atribucion. No se declaran restricciones adicionales.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni resultados de terceros que confirmen su comportamiento.
- Advertencia de despliegue: la eleccion de tokenizador condiciona de forma irreversible el vocabulario del modelo. Cambiarlo despues implica reentrenar los embeddings de entrada y salida.

## Enlaces

- Hugging Face: https://huggingface.co/henryhale/bpe-en-sw-af-de-fr-es-zh-64k
- Tokenizador agrupado de referencia: https://huggingface.co/henryhale/grouptok-en-sw-af-de-fr-es-zh-64k
- Documentacion de BPE en la libreria `tokenizers`: https://deepwiki.com/huggingface/tokenizers/4.1-bpe-(byte-pair-encoding)
- Dataset WMT14 (Europarl, de-en y fr-en): https://huggingface.co/datasets/wmt/wmt14
- Dataset News Commentary: https://huggingface.co/datasets/Helsinki-NLP/news_commentary
- Dataset Europarl (en-es): https://huggingface.co/datasets/Helsinki-NLP/europarl
- Dataset WMT19 (News Commentary zh-en): https://huggingface.co/datasets/wmt/wmt19
- Dataset UN Parallel Corpus (en-zh): https://huggingface.co/datasets/Helsinki-NLP/un_pc
- Pares ingles-swahili de NLLB: https://huggingface.co/datasets/michsethowusu/english-swahili_sentence-pairs
- Pares afrikaans-ingles de NLLB: https://huggingface.co/datasets/michsethowusu/afrikaans-english_sentence-pairs
- Repositorio de la libreria `tokenizers`: https://github.com/huggingface/tokenizers
- Proyecto BPEmb, referencia de embeddings BPE multilingues: https://bpemb.h-its.org/ y https://github.com/bheinzerling/bpemb
