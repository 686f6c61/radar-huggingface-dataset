# acquayefrank/leke-bpe-16k

## Resumen

Leke BPE-16k es un tokenizador de subpalabras de tipo Byte-Level BPE desarrollado por Frank Acquaye, disenado especificamente para cuatro lenguas kwa habladas en Ghana y Togo: akan/twi, ewe, ga y fante. No es un modelo generativo en sentido estricto, sino el componente de tokenizacion que cualquier modelo de lenguaje necesita para procesar estas lenguas; su publicacion bajo la etiqueta `text-generation` se debe a que se integra en pipelines de generacion de texto a traves de `transformers`.

El problema que resuelve es concreto: los tokenizadores multilingues genericos, como el de NLLB-200 con 256 000 tokens, fragmentan en exceso el texto en kwa, lo que encarece el entrenamiento y degrada la calidad. Leke comparte un unico vocabulario de 16 384 tokens entre las cuatro lenguas, aplica normalizacion Unicode especifica para kwa y garantiza una tasa de tokens desconocidos del 0,0 % gracias al fallback a nivel de byte.

Su relevancia actual radica en la combinacion de compacidad y cobertura: alcanza una fertilidad de 1,43 a 1,49 tokens por palabra en FLORES+ para twi y ewe, y de 1,34 a 1,45 en texto de curriculum reservado para las cuatro lenguas, con un vocabulario lo bastante pequeno como para entrenar modelos modestos con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Level BPE (tokenizador, no modelo neuronal) |
| Parametros totales | no disponible (no aplica; vocabulario de 16 384 tokens) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no aplica (artefacto de tokenizacion) |
| Idiomas soportados | tw (twi/akan), ee (ewe), gaa (ga), fat (fante), aka (akan) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` (compatible con `transformers` y con el paquete Python `leke`) |

## Arquitectura y entrenamiento

El tokenizador emplea Byte-Level BPE con un vocabulario de 16 384 tokens y semilla 42. Incorpora una normalizacion Unicode NFC propia de las lenguas kwa que, ademas de la forma canonica, mapea caracteres visualmente similares de otros alfabetos a sus equivalentes kwa (por ejemplo, la letra griega `ͻ` a `ɔ`, `ε` a `ɛ` y la hebrea `ט` a `ʋ`) y elimina caracteres de ancho cero. Los diacriticos tonales se conservan por defecto, lo que es critico en lenguas tonales como el twi y el ewe.

El corpus de entrenamiento combina unas 9 000 frases de texto de curriculum ghanes y entradas de Wikipedia en twi para las cuatro lenguas, texto web `clean` de MADLAD-400 para akan (unas 94 000 lineas, usadas para twi) y ewe (unas 125 000 lineas), y volcados de Wikipedia de 20231101 para twi (unas 21 000 lineas), ewe (unas 4 000) y fante (unas 5 600). Se eliminaron las lineas de MADLAD solapadas con cualquier frase de desarrollo, test o FLORES+, asi como los articulos de Wikipedia que las contenian. El muestreo aplico un sobremuestreo por temperatura con alpha = 0,2, ajustado sobre los conjuntos de desarrollo de FLORES+ y del curriculum, hasta reunir 500 000 lineas agrupadas. El archivo `training_receipt.json` registra el SHA-256 del fichero de entrenamiento agrupado.

## Capacidades

- Tokenizacion de texto en twi, ewe, ga y fante con un unico vocabulario compartido.
- Tasa de tokens desconocidos del 0,0 %: el fallback a nivel de byte evita cualquier `<unk>`, incluso con emojis o caracteres raros.
- Preservacion de tonos mediante diacriticos, esencial para la correccion linguistica en lenguas tonales.
- Normalizacion de caracteres homoglifos y eliminacion de caracteres de ancho cero.
- Integracion directa con `AutoTokenizer` de Hugging Face `transformers`.
- API propia a traves del paquete Python `leke` (`LekeTokenizer.from_file`), con salida de IDs y tokens.
- No incluye capacidades de generacion, razonamiento, codigo, vision, tool calling ni agentes: es exclusivamente un componente de preprocesado.

## Casos de uso

- Entrenamiento de modelos de lenguaje para lenguas kwa con recursos limitados: el vocabulario de 16 384 tokens y la baja fertilidad reducen el numero de tokens por frase, lo que abarata el entrenamiento y permite secuencias mas largas con el mismo presupuesto de contexto.
- Preprocesado de corpus para traduccion automatica entre twi, ewe, ga, fante y lenguas de mayor recursos: la normalizacion de homoglifos y la preservacion de tonos evitan perdida de informacion antes de alimentar un modelo seq2seq.
- Construccion de sistemas de atencion al cliente en Ghana y Togo: al no producir tokens desconocidos, el tokenizador procesa de forma fiable nombres propios, toponimos y prestamos del ingles que aparecen en conversaciones reales.
- Analisis de sentimiento y clasificacion de texto en redes sociales: el fallback a byte permite manejar emojis, abreviaturas y ruido ortografico sin descartar contenido.
- Investigacion linguistica computacional sobre lenguas kwa: la conservacion de diacriticos tonales facilita estudios de tonologia y morfologia a nivel de subpalabra.
- Pipeline de aumento de datos y curriculo educativo: el tokenizador esta validado sobre texto de curriculum ghanes, por lo que es adecuado para sistemas de tutoria o generacion de material escolar en estas lenguas.
- Integracion en herramientas de OCR post-procesado o transcripcion: la normalizacion de caracteres visualmente similares corrige errores tipicos de digitalizacion de textos en kwa.

## Benchmarks y rendimiento

Fertilidad medida en tokens por palabra (menor es mejor). Todos los tokenizadores se evaluaron con el mismo codigo sobre el mismo texto. FLORES+ devtest es texto fuera de dominio; no contiene ga ni fante, por lo que esas filas usan particiones de test reservadas del curriculum.

| Modelo | Twi Asante (FLORES+) | Twi Akuapem (FLORES+) | Ewe (FLORES+) | Ga (curriculum) | Fante (curriculum) | Tasa de desconocidos |
|---|---|---|---|---|---|---|
| Leke BPE (16k) | 1,49 | 1,44 | 1,43 | 1,39 | 1,34 | 0,0 % |
| NLLB-200 (256k) | 1,59 | 1,47 | 1,54 | 1,93 | 1,70 | 0,02 % - 1,52 % |
| Wikilangs, una lengua (16k) | 1,45 | 1,37 | 1,44 | no disponible | 1,30 | 0,02 % - 2,57 % |

Segun el autor, los tokenizadores dedicados solo a twi siguen siendo entre un 3 % y un 5 % mas compactos en twi con el mismo tamano de vocabulario, y los tokenizadores monolingues mayores (32k-50k) alcanzan menor fertilidad en las lenguas que cubren. El hermano mayor Leke BPE-32k, entrenado con los mismos datos, usa entre un 6 % y un 8 % menos tokens por palabra.

## Requisitos de hardware

- Inferencia en CPU: el tokenizador es un artefacto ligero que se ejecuta en CPU sin requisitos de VRAM; el coste dominante es el del modelo que lo utilice.
- Memoria: el vocabulario de 16 384 tokens ocupa del orden de decenas de kilobytes en `tokenizer.json`, por lo que cabe en cualquier dispositivo.
- GPU: no requiere GPU para funcionar; la eleccion de GPU depende exclusivamente del modelo de lenguaje que se entrene o despliegue con este tokenizador.
- Despliegue: compatible con `transformers` (`AutoTokenizer`) y con el paquete `leke`; puede integrarse en servidores de inferencia como vLLM o TGI siempre que el modelo asociado lo soporte, ya que el tokenizador en si no impone restricciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Lenguas kwa cubiertas | Fertilidad twi (FLORES+) | Tasa de desconocidos | Licencia |
|---|---|---|---|---|---|
| Leke BPE-16k | 16 384 | tw, ee, gaa, fat, aka | 1,44 - 1,49 | 0,0 % | Apache 2.0 |
| Leke BPE-32k | 32 768 | tw, ee, gaa, fat, aka | no disponible (6-8 % menos tokens por palabra que 16k) | no disponible | Apache 2.0 |
| NLLB-200 | 256 000 | tw, ee (ga y fante no cubiertos en la evaluacion) | 1,47 - 1,59 | 0,02 % - 1,52 % | CC-BY-NC 4.0 (del modelo NLLB; verificar para el tokenizador) |
| Wikilangs (monolingue, 16k) | 16 384 | una lengua por tokenizador | 1,37 - 1,45 | 0,02 % - 2,57 % | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde a instrucciones. La etiqueta `text-generation` solo refleja su uso previsto dentro de pipelines de generacion.
- Sesgos de dominio: el corpus procede mayoritariamente de curriculum ghanes, Wikipedia y MADLAD-400, por lo que el vocabulario puede estar sesgado hacia registros formales y educativos en detrimento de jerga, dialectos o registros coloquiales.
- Cobertura desigual: ga y fante se evaluan solo sobre curriculum reservado, no sobre FLORES+, porque este ultimo no contiene esas lenguas; su rendimiento en texto fuera de dominio es, por tanto, menos contrastado.
- Los tokenizadores monolingues dedicados a twi siguen siendo entre un 3 % y un 5 % mas compactos en esa lengua con el mismo tamano de vocabulario, por lo que en aplicaciones exclusivamente en twi puede ser preferible una alternativa especializada.
- La preservacion de tonos es el comportamiento por defecto, pero no se documentan opciones para desactivarla; los flujos que requieran texto sin diacriticos deberan normalizar despues de la tokenizacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de las fuentes de datos subyacentes (MADLAD-400 y Wikipedia) para el modelo final que se entrene con este tokenizador.
- Riesgo de alucinacion: no aplica al tokenizador en si, pero un modelo entrenado con el heredara los sesgos y limitaciones de sus propios datos.

## Enlaces

- Hugging Face: https://huggingface.co/acquayefrank/leke-bpe-16k
- Tokenizador hermano Leke BPE-32k: https://huggingface.co/acquayefrank/leke-bpe-32k
- Repositorio GitHub del proyecto: https://github.com/acquayefrank/leke
- Resultados completos de evaluacion: https://github.com/acquayefrank/leke/blob/main/specs/eval_results.md
