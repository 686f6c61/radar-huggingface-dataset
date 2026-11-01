# acquayefrank/leke-bpe-32k

## Resumen

Leke BPE-32k es un tokenizador Byte-Level BPE de vocabulario 32.768, desarrollado por Frank Acquaye, disenado especificamente para las lenguas kwa Akan/Twi, Ewe, Ga y Fante, habladas en Ghana y Togo. No es un modelo de lenguaje generativo: es el componente de tokenizacion que se situa antes de cualquier modelo de texto y determina como se fragmenta el texto de entrada en subpalabras. Su relevancia radica en que los tokenizadores multilingues genericos (por ejemplo, el de NLLB-200 con 256k tokens) fragmentan estas lenguas de forma ineficiente, lo que alarga las secuencias y encarece el entrenamiento y la inferencia.

El tokenizador comparte una unica tabla de vocabulario entre las cuatro lenguas, aplica normalizacion Unicode NFC con mapeo de caracteres visualmente similares (por ejemplo, la letra griega `ͻ` al caracter africano `ɔ`, o la hebrea `ט` a `ʋ`) y conserva los diacriticos tonales por defecto. Garantiza una tasa de tokens desconocidos del 0,0 % gracias al fallback a nivel de byte, de modo que cualquier texto, emoji o caracter raro se codifica sin producir `<unk>`.

Frente a su version hermana de 16k, reduce entre un 6 % y un 8 % el numero de tokens por palabra a cambio de una tabla de embeddings de 32.768 filas. El autor recomienda la variante de 16k para modelos pequenos con pocos datos y la de 32k cuando la longitud de secuencia pesa mas que el tamano del modelo. La licencia es Apache 2.0 y el artefacto se distribuye en formato `tokenizer.json` compatible con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Level BPE (tokenizador, no modelo neuronal) |
| Parametros totales | no disponible (no es un modelo con parametros; vocabulario de 32.768 tokens) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que use el tokenizador) |
| Tipos de cuantizacion | no aplica (artefacto de tokenizacion) |
| Idiomas soportados | tw (Twi/Akan), ee (Ewe), gaa (Ga), fat (Fante), aka (Akan) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` (compatible con `transformers` y con el paquete Python `leke`) |

## Arquitectura y entrenamiento

El tokenizador emplea Byte-Level BPE con un vocabulario de 32.768 tokens y semilla 42. El corpus de entrenamiento combina aproximadamente 9.000 frases de texto curricular ghanes y entradas introductorias de Wikipedia en Twi para las cuatro lenguas, texto web `clean` de MADLAD-400 para Akan (~94.000 lineas, usado para Twi) y Ewe (~125.000 lineas), y volcados de Wikipedia de 20231101 para Twi (~21.000 lineas), Ewe (~4.000) y Fante (~5.600). Se eliminaron las lineas de MADLAD solapadas con cualquier frase de desarrollo, test o FLORES+, asi como los articulos de Wikipedia que contenian alguna de esas frases.

El muestreo aplica un sobremuestreo por temperatura con alpha = 0,2 (elegido sobre el split de desarrollo de FLORES+ y el de curriculo) hasta reunir 500.000 lineas agrupadas. La innovacion principal no esta en el algoritmo, sino en el preprocesado: normalizacion Unicode NFC, mapeo de caracteres homoglifos de otros alfabetos a sus equivalentes kwa, eliminacion de caracteres de ancho cero y preservacion de los tonos. El archivo `training_receipt.json` registra el SHA-256 del fichero de entrenamiento agrupado, lo que permite verificar la procedencia del corpus.

## Capacidades

- Tokenizacion de texto en Twi/Akan, Ewe, Ga y Fante con una unica tabla de vocabulario compartida.
- Tasa de tokens desconocidos del 0,0 % mediante fallback a nivel de byte: ningun caracter produce `<unk>`.
- Normalizacion de homoglifos: convierte caracteres griegos, hebreos y de otros alfabetos visualmente similares a los caracteres kwa correctos.
- Preservacion de diacriticos tonales, esenciales en estas lenguas.
- Eliminacion de caracteres de ancho cero que podrian alterar la segmentacion.
- Integracion directa con `transformers` mediante `AutoTokenizer` y con el paquete Python `leke` (`LekeTokenizer`).
- No realiza generacion de texto, razonamiento, codigo, vision ni tool calling: es exclusivamente un componente de preprocesado.

## Casos de uso

- Entrenamiento de modelos de lenguaje para lenguas kwa: usar Leke BPE-32k como tokenizador base reduce la longitud de las secuencias entre un 6 % y un 8 % frente a la variante de 16k, lo que se traduce en menos tokens procesados por paso y menor coste computacional en modelos con contexto limitado.
- Ajuste fino de modelos multilingues existentes: sustituir el tokenizador generico por Leke BPE-32k antes de un fine-tuning sobre corpus ghaneses mejora la eficiencia por palabra y evita la fragmentacion excesiva que producen vocabularios de 256k como el de NLLB-200.
- Traduccion automatica Twi-Ewe-Ga-Fante: al compartir vocabulario entre las cuatro lenguas, un modelo seq2seq entrenado con este tokenizador maneja pares de traduccion entre ellas sin necesidad de vocabularios separados.
- Procesamiento de texto web ruidoso: la normalizacion de homoglifos y la eliminacion de caracteres de ancho cero permiten ingerir contenido de redes sociales o foros donde los caracteres kwa se escriben a menudo con sustitutos de otros alfabetos.
- Sistemas de busqueda y recuperacion sobre corpus kwa: la fertility baja (1,25-1,40 tokens por palabra) reduce el coste de indexacion y de comparacion de embeddings en buscadores especializados.
- Analisis de sentimiento y clasificacion de texto en lenguas ghanesas: el tokenizador sirve de base para modelos de clasificacion que necesitan representar texto tonal con fidelidad, algo que los tokenizadores genericos no garantizan.
- Construccion de corpus paralelos y pipelines de datos: la garantia de 0,0 % de tokens desconocidos evita perdidas de informacion al preprocesar grandes volumenes de texto de baja资源, donde los caracteres raros son frecuentes.

## Benchmarks y rendimiento

Fertility medida en tokens por palabra (menor es mejor). Todas las cifras proceden de la model card del autor; FLORES+ devtest es texto fuera de dominio y no incluye Ga ni Fante, por lo que esas filas usan splits de test de curriculo reservados.

| Modelo | Twi Asante (FLORES+) | Twi Akuapem (FLORES+) | Ewe (FLORES+) | Ga (curriculo) | Fante (curriculo) | Tasa de desconocidos |
|---|---|---|---|---|---|---|
| **Leke BPE (32k)** | **1,40** | 1,36 | **1,33** | **1,29** | **1,25** | **0,0 %** |
| Leke BPE (16k) | 1,49 | 1,44 | 1,43 | 1,39 | 1,34 | 0,0 % |
| NLLB-200 (256k) | 1,59 | 1,47 | 1,54 | 1,93 | 1,70 | 0,02 % - 1,52 % |
| Wikilangs, una lengua (16k) | 1,45 | 1,37 | 1,44 | no aplica | 1,30 | 0,02 % - 2,57 % |
| Mejor tokenizador monolingue (32k-50k) | **1,40** | **1,31** | **1,33** | no aplica | 1,26 | 0,0 % - 2,74 % |

Con un unico vocabulario para cuatro lenguas, iguala o supera a todos los tokenizadores monolingues en FLORES+ Twi Asante y Ewe y en Fante. Queda por detras en Twi Akuapem (un 4 %) y en el split de test de Twi con mucho peso de Wikipedia. Los resultados completos estan en `specs/eval_results.md` del repositorio de GitHub.

## Requisitos de hardware

- No requiere GPU: es un tokenizador y se ejecuta en CPU con latencia de microsegundos por frase.
- Memoria: la tabla de embeddings de 32.768 filas ocupa unos pocos megabytes en disco y RAM; es despreciable frente a cualquier modelo neuronal.
- GPU recomendadas: no aplica. El coste real de hardware lo determina el modelo de lenguaje que consuma la salida del tokenizador.
- Cabe en cualquier maquina, incluidos entornos de CI/CD y contenedores minimos.
- Opciones de despliegue: `transformers` (`AutoTokenizer.from_pretrained`), paquete Python `leke` (`LekeTokenizer.from_file`) y cualquier runtime que lea `tokenizer.json` (por ejemplo, servidores de inferencia basados en Hugging Face Tokenizers).
- Latencia y throughput: no se han publicado mediciones en la informacion disponible; por la naturaleza del componente, el cuello de botella estara en el modelo que lo utilice.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Lenguas kwa cubiertas | Fertility Twi Asante (FLORES+) | Tasa de desconocidos | Licencia |
|---|---|---|---|---|---|
| **Leke BPE-32k** | 32.768 | Twi, Ewe, Ga, Fante | 1,40 | 0,0 % | Apache 2.0 |
| Leke BPE-16k | 16.384 | Twi, Ewe, Ga, Fante | 1,49 | 0,0 % | Apache 2.0 |
| NLLB-200 | 256.000 | multilingue generico | 1,59 | 0,02 % - 1,52 % | CC-BY-NC 4.0 (uso no comercial) |
| Wikilangs monolingue | 16.000 | una sola lengua | 1,45 | 0,02 % - 2,57 % | no disponible |

Leke BPE-32k ofrece la mejor fertility de la comparativa en Twi Asante, Ewe, Ga y Fante, con la unica excepcion de Twi Akuapem y el split de Twi sesgado a Wikipedia, donde el mejor tokenizador monolingue de 32k-50k lo supera ligeramente. Frente a NLLB-200, la ventaja es doble: mejor segmentacion y una licencia Apache 2.0 plenamente permisiva para uso comercial, frente a la CC-BY-NC del tokenizador de NLLB.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a instrucciones. Solo tokeniza; cualquier capacidad generativa depende del modelo que lo use.
- Fertility ligeramente peor que el mejor tokenizador monolingue en Twi Akuapem (1,36 frente a 1,31) y en el split de Twi con mucho peso de Wikipedia.
- El corpus de entrenamiento es modesto (~9.000 frases de curriculo mas texto web y Wikipedia); el dominio legal, medico o tecnico puede estar infrarrepresentado.
- La normalizacion de homoglifos puede alterar texto deliberadamente escrito con caracteres de otros alfabetos, lo que conviene revisar en aplicaciones de investigacion linguistica.
- La preservacion de tonos por defecto puede no ser deseable en pipelines que normalizan el texto a formas sin diacriticos.
- Riesgo de sesgo derivado del corpus: el texto web de MADLAD-400 y Wikipedia no representa por igual todos los registros ni variantes dialectales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad en dominios no evaluados.
- No se han publicado mediciones de latencia ni de throughput en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/acquayefrank/leke-bpe-32k
- Version hermana de 16k: https://huggingface.co/acquayefrank/leke-bpe-16k
- Repositorio GitHub: https://github.com/acquayefrank/leke
- Resultados de evaluacion completos: https://github.com/acquayefrank/leke/blob/main/specs/eval_results.md
