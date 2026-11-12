# nesicn/nc-turkce-bpe-128k

## Resumen

`nesicn/nc-turkce-bpe-128k` es un tokenizer de tipo byte-level BPE entrenado desde cero para turco por el autor independiente nesicn. No es un modelo generativo: es el componente de tokenizacion que se situa delante de un transformer y que determina como se fragmenta el texto turco en unidades discretas. Su vocabulario es de 128.000 entradas y se distribuye como un `tokenizer.json` estandar compatible con la libreria `transformers`, sin codigo adicional.

El problema que aborda es concreto: el turco es una lengua aglutinante con morfologia muy productiva, y los tokenizers multilingues genericos fragmentan las palabras en unidades que rara vez respetan la frontera entre raiz y sufijo, lo que alarga las secuencias y degrada la eficiencia del modelo. Este tokenizer aplica una receta de entrenamiento en dos fases en la que los primeros 80.000 merges se aprenden sobre palabras pre-segmentadas morfologicamente con Zemberek, de modo que esas fusiones nunca cruzan una frontera raiz-sufijo. El resto del vocabulario se completa con BPE estandar sobre el corpus completo.

Forma parte de una familia de tres tamanos (32k, 64k y 128k) entrenados con la misma receta y el mismo corpus de 1.416 MB de texto turco. Es relevante para cualquiera que entrene o adapte un modelo de lenguaje en turco y quiera controlar el coste por token, la fidelidad de la reconstruccion y el tratamiento de la apostrofe turca en palabras como `Ankara'da`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (`tokenizers` 0.23.3), entrenamiento en dos fases, `min_frequency=2` |
| Parametros totales | no disponible (es un tokenizer, no un modelo neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | `tokenizer.json` (SHA-256 `9eda551623ff58899a28aed5c8535336c9fda985450dce60c2393dc51efecd23`), cargable con `AutoTokenizer` |

Datos adicionales de construccion: vocabulario de 128.000 entradas compuesto por 64 tokens especiales, 256 tokens de byte y 127.680 merges. Normalizador limitado a NFC, sin conversion a minusculas (preserva `I`/`ı` e `İ`/`i`) y sin NFKC por ser una normalizacion con perdida.

## Arquitectura y entrenamiento

El tokenizer es un BPE de nivel de byte con pre-tokenizacion basada en una expresion regular `Split` seguida de `ByteLevel(add_prefix_space=False, use_regex=False)`. El decoder es `ByteLevel`. La pre-tokenizacion trata de forma especifica la apostrofe turca (`'` y `’`) cuando va seguida de letras, agrupa digitos en bloques de como maximo tres cifras (`2026` → `202` · `6`), adhiere el espacio previo a un numero al propio numero y arrastra los saltos de linea posteriores a la puntuacion. El normalizador es unicamente NFC, lo que garantiza reconstruccion sin perdida: el texto tokenizado y vuelto a unir es identico al original y no se genera nunca el token `<unk>`.

El entrenamiento se hizo en dos fases sobre 768.761 documentos y 1.416 MB de texto turco. En la primera, las 1.000.000 de palabras mas frecuentes del corpus se analizaron con Zemberek y se partieron por los limites raiz-sufijo comunes a todos sus analisis; el BPE se entreno sobre esos fragmentos hasta los 80.000 tokens, de forma que esas fusiones no atraviesan una frontera morfologica. En la segunda, se uso el corpus completo sin pre-segmentar y el vocabulario se completo hasta 128.000. El umbral de 80.000 se eligio entre 36.000, 64.000, 80.000 y 96.000 con una regla fijada de antemano y evaluada solo sobre el conjunto de desarrollo, la misma regla usada en las variantes de 32k y 64k.

La composicion del corpus es: foros (29,5 %), web via fineweb-2 tur_Latn (15,6 %), noticias (10,5 %), Wikipedia (10,5 %), web via Cosmos-Turkish-Corpus (10,4 %), texto academico (8,3 %), Ekşi Sözlük (5,3 %), corpus literario y blogs (5,3 %) y texto juridico procedente de legal_nli_TR_V1 (porcentaje restante). Tambien figura `stefan-it/offenseval2020_tr` entre los datasets declarados.

Los 64 tokens especiales incluyen `<|endoftext|>` (EOS, id 0), `<|startoftext|>` (BOS, id 1), `<|pad|>` (id 2), `<|unk|>` (id 3, presente por compatibilidad con herramientas pero no producido por el BPE), `<|mask|>` (id 4), `<|im_start|>` y `<|im_end|>` para plantillas ChatML (ids 5 y 6) y 57 tokens reservados (ids 7 a 63).

## Capacidades

- Segmentacion de texto turco en tokens con reconstruccion exacta (lossless) bajo normalizacion NFC.
- Pre-tokenizacion consciente de la apostrofe turca: `Ankara'da` se divide en `Ankara` · `'da` en lugar de fragmentar el sufijo de forma arbitraria.
- Prioridad morfologica en los primeros 80.000 merges, lo que favorece que las palabras se dividan por raiz y sufijo de forma consistente.
- Cobertura de vocabulario suficiente para mantener palabras completas en muchos casos: `üniversitesinde`, `Cumhurbaşkanlığı` y `gerçekleştirilmiştir` se codifican como un unico token en la variante de 128k.
- Tratamiento determinista de digitos (grupos de hasta tres cifras) y de espacios y saltos de linea.
- Compatibilidad con `AutoTokenizer` de `transformers` en Python y con `@huggingface/transformers` en JavaScript.
- Soporte de plantilla de chat tipo ChatML mediante los tokens `<|im_start|>` y `<|im_end|>`.
- No inserta BOS ni EOS automaticamente; la gestion de tokens especiales queda en manos del modelo que lo consuma.

## Casos de uso

- Entrenamiento de modelos de lenguaje en turco desde cero: el tokenizer reduce el numero de tokens necesarios para representar texto turco frente a vocabularios multilingues genericos, lo que se traduce directamente en menos pasos de entrenamiento y menor coste por documento procesado.
- Adaptacion de un modelo base multilingue al turco: sustituir el tokenizer original por este exige reentrenar los embeddings de entrada y salida, pero permite aprovechar la segmentacion morfologica para mejorar la eficiencia en contextos largos.
- Analisis morfologico y preprocesamiento linguistico: al respetar las fronteras raiz-sufijo en los primeros 80.000 merges, las divisiones resultantes sirven como senal auxiliar para tareas de etiquetado morfologico o lematizacion.
- Procesamiento de texto juridico y academico: el corpus incluye un 8,3 % de texto academico y una porcion de legal_nli_TR_V1, por lo que el vocabulario cubre terminologia especializada de esos dominios.
- Indexacion y busqueda sobre corpus turcos: la tokenizacion determinista y sin `<unk>` facilita construir indices invertidos y calcular solapamiento de tokens sin casos perdidos.
- Procesamiento de conversaciones de foro y redes: con un 29,5 % de foros y un 5,3 % de Ekşi Sözlük en el corpus, el vocabulario esta ajustado al registro coloquial turco, util para moderacion y clasificacion de contenido generado por usuarios.
- Normalizacion de pipelines de datos: la garantia de reconstruccion exacta bajo NFC permite tokenizar, almacenar y reconstruir documentos sin perdida de caracteres, algo critico en pipelines de deduplicacion y filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una tabla cualitativa de segmentaciones de ejemplo comparando NC-128k, NC-64k y NC-32k sobre diez palabras turcas:

| Palabra | NC-128k | NC-64k | NC-32k |
|---|---|---|---|
| Albümün | `Albümün` | `Albümün` | `Albüm` · `ün` |
| hücresel | `hücresel` | `hücresel` | `hücre` · `sel` |
| üniversitesinde | `üniversitesinde` | `üniversite` · `sinde` | `üniversite` · `sinde` |
| Türkiyeye | `Türkiyeye` | `Türkiyeye` | `Türkiye` · `ye` |
| evlerimizden | `ev` · `lerimizden` | `ev` · `lerimizden` | `ev` · `lerimizden` |
| Ankara'da | `Ankara` · `'da` | `Ankara` · `'da` | `Ankara` · `'da` |
| 1923'te | `192` · `3` · `'te` | `192` · `3` · `'te` | `192` · `3` · `'te` |
| Cumhurbaşkanlığı | `Cumhurbaşkanlığı` | `Cumhurbaşkanlığı` | `Cumhurbaşkanlığı` |
| gerçekleştirilmiştir | `gerçekleştirilmiştir` | `gerçekleştirilmiştir` | `gerçekleştirilmiştir` |
| öğretmenlerimize | `öğretmen` · `lerimize` | `öğretmen` · `lerimize` | `öğretmen` · `lerimize` |

No se aportan cifras de fertibilidad (tokens por palabra), compresion sobre corpus de test ni comparaciones cuantitativas con tokenizers como los de XLM-R o Llama.

## Requisitos de hardware

- No aplica VRAM para inferencia: el tokenizer es una estructura de datos (vocabulario de 128.000 entradas y tabla de merges) que se carga en CPU.
- Memoria en RAM estimada: unos pocos cientos de MB al cargar el `tokenizer.json` completo con la libreria `tokenizers`; el fichero en disco es de tamano reducido y no requiere GPU.
- GPU: no requiere ninguna. Funciona en cualquier maquina capaz de ejecutar Python o Node.js.
- Despliegue: `transformers` (`AutoTokenizer.from_pretrained`), `tokenizers` de forma nativa, `@huggingface/transformers` en JavaScript, y cualquier servidor de inferencia (vLLM, TGI, llama.cpp, Ollama) que acepte un `tokenizer.json` compatible con Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un BPE de nivel de byte con pre-tokenizacion por regex, el coste por token es el habitual de esta familia de tokenizers y escala de forma aproximadamente lineal con la longitud del texto.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Enfoque morfologico | Idiomas | Licencia |
|---|---|---|---|---|
| nc-turkce-bpe-128k | 128.000 | Si, primeros 80.000 merges sobre fronteras raiz-sufijo (Zemberek) | Turco | Apache-2.0 |
| nc-turkce-bpe-64k | 64.000 | Si, misma receta y corpus | Turco | Apache-2.0 |
| nc-turkce-bpe-32k | 32.000 | Si, misma receta y corpus | Turco | Apache-2.0 |

No se dispone en la informacion proporcionada de datos sobre tokenizers multilingues de referencia (por ejemplo, los de XLM-R o Llama) que permitan una comparacion cuantitativa de fertibilidad o de compresion sobre corpus turco. Cualquier comparacion de ese tipo requeriria una evaluacion propia.

## Limitaciones y advertencias

- Es un tokenizer, no un modelo de lenguaje: no genera texto, no razona y no tiene capacidades de tool calling ni de agentes. Cualquier uso en ese sentido requiere emparejarlo con un transformer entrenado.
- El vocabulario esta disenado exclusivamente para turco. Su uso sobre otros idiomas producira una fragmentacion muy ineficiente.
- La prioridad morfologica solo cubre los primeros 80.000 merges; los 47.680 restantes son BPE estandar y pueden cruzar fronteras raiz-sufijo en funcion de la frecuencia del corpus.
- La normalizacion se limita a NFC y no convierte a minusculas ni aplica NFKC. Quien necesite un pipeline case-insensitive o compatibilidad de formas Unicode debe normalizar antes de tokenizar.
- El tokenizer no inserta BOS ni EOS automaticamente; olvidar anadirlos en el modelo consumidor puede degradar el entrenamiento o la inferencia.
- El corpus de entrenamiento incluye foros y Ekşi Sözlük (34,8 % combinado), lo que puede introducir sesgos de registro coloquial y de vocabulario informal en el reparto de merges.
- Riesgo de infrarrepresentacion de dominios ausentes del corpus (por ejemplo, turco tecnico muy especializado o variantes dialectales), lo que se traducira en mayor fragmentacion en esos textos.
- La licencia Apache-2.0 permite uso comercial, pero los datasets subyacentes tienen licencias propias (CC-BY-SA-4.0, ODC-By, CC-BY-4.0, Apache-2.0) cuyas condiciones pueden afectar a la redistribucion del vocabulario derivado; conviene revisarlas antes de un despliegue comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-11-12, por lo que no existe validacion independiente de su calidad.
- El `tokenizer.json` debe verificarse contra el SHA-256 publicado antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-128k
- Variante 32k: https://huggingface.co/nesicn/nc-turkce-bpe-32k
- Variante 64k: https://huggingface.co/nesicn/nc-turkce-bpe-64k
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
