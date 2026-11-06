# Second-Dawn-Lab/owll-dictionaries

## Resumen

Owl-L dictionaries es una colección de paquetes de datos léxicos offline publicada por Second Dawn Lab como complemento para su aplicación de traducción Owl-L. No se trata de un modelo de lenguaje neuronal, sino de un conjunto de índices de diccionario derivados de Wiktionary que la aplicación descarga una sola vez, verifica mediante SHA-256 y consulta localmente sin necesidad de red. Cada paquete cubre un par de idiomas en ambas direcciones y contiene entradas con lema, categoría gramatical, información morfológica, acepciones ordenadas, traducciones o glosas y ejemplos breves.

El recurso resulta relevante para desarrolladores que necesiten un diccionario bilingüe embebible, ligero y con licencia compatible con proyectos abiertos, sin depender de APIs de traducción en la nube. La colección cubre 13 pares de idiomas con el inglés (árabe, bengalí, alemán, español, francés, hindi, italiano, japonés, panyabí, ruso, turco, urdu y chino), con volúmenes que van desde los 8.046 pares de entradas del panyabí hasta los 194.926 del chino en dirección zh → en.

El tamaño total del repositorio es de 0,1 GB y los paquetes individuales oscilan entre 1,2 MB y 15,3 MB. La calidad y cobertura varían según la completitud de la edición inglesa de Wiktionary para cada idioma, siendo mayor para francés, español, italiano, ruso, alemán, japonés y chino, y menor para urdu, panyabí, bengalí, hindi, turco y árabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (conjunto de datos léxicos, no modelo neuronal) |
| Parametros totales | No disponible (no es un modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | ar, bn, de, en, es, fr, hi, it, ja, pa, ru, tr, ur, zh (pares con inglés) |
| Licencia | CC BY-SA 4.0 (los paquetes de datos); el código de la aplicación Owl-L es MIT |
| Formato de pesos | No aplica; los paquetes se distribuyen como archivos ZIP con índice compacto |
| Tamano del repositorio | 0,1 GB |
| Numero de paquetes | 13 |
| Tamano por paquete | Entre 1,2 MB y 15,3 MB |
| Verificacion de integridad | SHA-256 por paquete |
| Fuente de los datos | Wiktionary (edición inglesa) vía wiktextract / kaikki.org |
| Herramienta de construccion | `dawn-dict-build pair <lang> <Language>` (crates/dawn-dict) y `tools/build-dictionary-pack.py` |
| Fecha de creacion | 2026-10-30 |
| Ultima actualizacion | 2026-10-31 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. Los paquetes se generan mediante un pipeline determinista: la herramienta `dawn-dict-build` (dentro del crate `dawn-dict` del repositorio dawn-core) consume los extractos de kaikki.org de la edición inglesa de Wiktionary y genera un índice compacto; posteriormente, el script `tools/build-dictionary-pack.py` empaqueta los archivos resultantes en un ZIP. No se añade información externa a la fuente original.

Cada entrada del índice contiene el lema, la categoría gramatical, una línea de cabecera con información gramatical (género, plural, formas verbales cuando Wiktionary las recoge), acepciones ordenadas con traducciones o glosas y ejemplos cortos. Las formas flexionadas se incorporan como claves de búsqueda que remiten a su forma base (por ejemplo, "Häuser" a "Haus", "ging" a "gehen"), tomadas de las tablas de flexión de Wiktionary. Los pares sin inglés (por ejemplo, alemán a francés) se resuelven a través del inglés en la aplicación. La dirección inversa de cada par también lista las entradas cuyas glosas en inglés contienen el término.

## Capacidades

- Consulta de diccionario bilingüe offline en 13 pares de idiomas con el inglés, en ambas direcciones.
- Búsqueda por lema con información gramatical: género, plural, formas verbales.
- Resolución de formas flexionadas hacia su lema base mediante claves de búsqueda derivadas de las tablas de flexión de Wiktionary.
- Recuperación de acepciones ordenadas con traducciones o glosas y ejemplos breves.
- Traducción indirecta entre pares sin inglés (por ejemplo, de → fr) canalizada a través del inglés por la aplicación.
- Verificación de integridad de cada paquete mediante SHA-256 antes de su uso.
- Funcionamiento sin red tras la descarga inicial del paquete.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente: es exclusivamente un recurso léxico.

## Casos de uso

- Aplicaciones de traducción sin conexión: Owl-L descarga el paquete una vez, verifica su SHA-256 y realiza búsquedas locales, lo que permite traducir palabras en entornos sin red o con conectividad intermitente.
- Diccionarios integrados en aplicaciones móviles o de escritorio: los paquetes de entre 1,2 MB y 15,3 MB se pueden embeber o descargar bajo demanda sin inflar el binario de la aplicación.
- Herramientas de aprendizaje de idiomas: la información gramatical (género, plural, formas verbales) y las acepciones ordenadas con ejemplos permiten construir fichas de vocabulario y ejercicios de consulta.
- Lematización y normalización de texto: las claves de formas flexionadas ("Häuser" → "Haus") sirven para reducir tokens a su forma base en pipelines de procesamiento lingüístico ligero.
- Procesamiento de lenguaje natural de bajo recurso: para idiomas como urdu, panyabí, bengalí, hindi, turco o árabe, el paquete ofrece un léxico bilingüe mínimo pero utilizable como recurso de anotación o evaluación.
- Sistemas de traducción asistida por reglas o híbridos: el índice puede actuar como capa de consulta léxica previa a un modelo neuronal, reduciendo costes en términos frecuentes.
- Investigación y docencia sobre datos abiertos: al derivarse de Wiktionary con licencia CC BY-SA 4.0, es reutilizable en estudios de lexicografía computacional con la obligación de atribución y compartir igual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de lenguaje, no procede aplicar métricas como MMLU, HumanEval o GSM8K. El autor únicamente documenta el volumen de entradas por paquete y dirección:

| Paquete | Idioma con inglés | Entradas (→ en) | Entradas (en →) | Descarga |
|---|---|---|---|---|
| `ar-en.zip` | Árabe | 28.392 | 37.269 | 5,6 MB |
| `bn-en.zip` | Bengalí | 11.143 | 12.425 | 1,4 MB |
| `de-en.zip` | Alemán | 102.897 | 78.440 | 11,5 MB |
| `en-es.zip` | Español | 92.281 | 124.377 | 15,1 MB |
| `en-fr.zip` | Francés | 85.971 | 103.247 | 9,9 MB |
| `en-hi.zip` | Hindi | 26.538 | 26.251 | 3,5 MB |
| `en-it.zip` | Italiano | 99.082 | 171.821 | 15,2 MB |
| `en-ja.zip` | Japonés | 81.704 | 143.840 | 14,6 MB |
| `en-pa.zip` | Panyabí | 10.597 | 8.046 | 1,2 MB |
| `en-ru.zip` | Ruso | 57.661 | 62.442 | 10,9 MB |
| `en-tr.zip` | Turco | 27.780 | 29.210 | 13,4 MB |
| `en-ur.zip` | Urdu | 12.993 | 8.986 | 1,3 MB |
| `en-zh.zip` | Chino (Beta) | 118.466 | 194.926 | 15,3 MB |

## Requisitos de hardware

- No requiere GPU ni aceleración hardware: es un conjunto de datos léxicos consultado por la aplicación.
- Almacenamiento: entre 1,2 MB y 15,3 MB por paquete; el repositorio completo ocupa 0,1 GB.
- Memoria RAM: no especificada por el autor; al tratarse de índices compactos, el consumo depende de la implementación de consulta de Owl-L.
- CPU: cualquier procesador capaz de ejecutar la aplicación Owl-L; no se documentan requisitos mínimos.
- Despliegue: integración en la aplicación Owl-L (código MIT) o consumo directo de los ZIP y su índice por parte de herramientas propias.
- Latencia y throughput: no disponibles; al ser búsquedas locales sobre índice, la latencia vendrá determinada por la implementación del cliente y no por el recurso en sí.

## Comparativa con modelos similares

| Recurso | Tipo | Idiomas | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Owl-L dictionaries (Second Dawn Lab) | Diccionario bilingüe offline | 13 pares con inglés | CC BY-SA 4.0 | ZIP con índice compacto | Derivado de Wiktionary vía wiktextract/kaikki.org; verificación SHA-256 |
| Wiktextract / kaikki.org (Tatu Ylonen) | Extractos estructurados de Wiktionary | Cobertura amplia de Wiktionary | CC BY-SA 4.0 / GFDL | JSONL y derivados | Fuente original de la que se derivan estos paquetes; mayor volumen y menor compactación |
| Wiktionary en bruto | Diccionario colaborativo | Cientos de idiomas | CC BY-SA 4.0 / GFDL | Wikitexto | Requiere parseo; no es un índice listo para consulta |
| APIs de traducción en la nube | Servicio de traducción | Amplio | Propietaria | API | Requieren red y no ofrecen consulta léxica estructurada offline |

No se dispone de información sobre otros paquetes de diccionario offline comparables con las mismas características de licencia y formato en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no traduce oraciones completas ni mantiene conversaciones. Solo permite consultas léxicas.
- La calidad y cobertura dependen de la completitud de la edición inglesa de Wiktionary para cada idioma; el autor advierte que es pequeña para urdu, panyabí, bengalí, hindi, turco y árabe.
- El paquete de chino está marcado como Beta: los lemas son mayoritariamente en caracteres tradicionales, por lo que palabras solo en simplificado suelen faltar.
- Las traducciones entre pares sin inglés se realizan a través del inglés, lo que puede introducir pérdida de matices o ambigüedad.
- Los datos derivan de una fuente colaborativa y pueden contener errores, definiciones desactualizadas o sesgos propios de Wiktionary.
- Licencia CC BY-SA 4.0: cualquier reutilización o adaptación exige atribuir a Wiktionary y sus contribuidores, enlazar la licencia, indicar los cambios realizados y compartir la versión derivada bajo la misma licencia. Esto puede ser incompatible con productos que requieran licencias permisivas o cerradas.
- La aplicación Owl-L es MIT, pero los paquetes de datos son una obra separada bajo CC BY-SA 4.0; no se debe asumir que el código y los datos comparten licencia.
- No se documentan garantías de mantenimiento, actualización periódica ni soporte por parte del autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún nula y ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Second-Dawn-Lab/owll-dictionaries
- Repositorio dawn-core (crates/dawn-dict): https://github.com/Second-Dawn-Lab/dawn-core
- Organización Second Dawn Lab en GitHub: https://github.com/Second-Dawn-Lab
- Wiktionary: https://www.wiktionary.org
- kaikki.org / wiktextract: https://kaikki.org
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Referencia de wiktextract: Tatu Ylonen, "Wiktextract: Wiktionary as Machine-Readable Structured Data", LREC 2022
