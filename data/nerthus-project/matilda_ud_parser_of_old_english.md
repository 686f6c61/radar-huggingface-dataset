# Nerthus-Project/MATILDA_UD_parser_of_Old_English

## Resumen

MATILDA_UD_parser_of_Old_English (nombre interno del pipeline: `en_matilda_oe_ud`) es un pipeline de spaCy desarrollado por Nerthus-Project para el análisis morfosintáctico del inglés antiguo o anglosajón (código ISO `ang`, c. 650–1150 d. C.). Cubre tokenización, etiquetado de categorías gramaticales (UPOS y XPOS), rasgos morfológicos, lematización y análisis de dependencias universales, tareas agrupadas en HuggingFace bajo la etiqueta `token-classification`.

No se trata de un modelo generativo ni de un transformer de gran escala: es un pipeline clásico de spaCy construido sobre vectores floret y un componente `tok2vec`, con componentes entrenados de forma supervisada sobre el treebank MATILDA de dependencias universales de inglés antiguo, complementado con treebanks plateados y datos sintéticos. Su relevancia radica en que mejora de forma notable el estado del arte publicado para esta lengua histórica: según el autor, +5,57 puntos de LAS y +3,42 de UAS frente a la mejor configuración de Martín Arista et al. (2025) en un conjunto de evaluación emparejado.

El modelo se publica bajo licencia CC-BY-4.0 y está pensado para investigadores en lingüística histórica, humanidades digitales y edición de textos anglosajones. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", por lo que se trata de una publicación reciente y todavía sin validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de spaCy: `tok2vec` con vectores floret (subword) más componentes de tagger, morphologizer, lematizador y parser de dependencias |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica: spaCy procesa documentos completos por lotes, sin ventana de contexto fija; el análisis sintáctico es intraoracional |
| Tipos de cuantizacion | no disponible: no se publican variantes cuantizadas (GGUF, ONNX, int8, etc.) |
| Idiomas soportados | inglés antiguo / anglosajón (código `ang`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | paquete wheel de spaCy (`en_matilda_oe_ud-1.0.0-py3-none-any.whl`) y directorio de modelo spaCy; no se distribuye en safetensors ni GGUF |
| Tarea principal | token-classification: POS tagging, rasgos morfológicos, lematización y dependency parsing |
| Libreria | spaCy |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 13 de septiembre de 2026 (alta en HuggingFace); actualizacion el mismo dia |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo, sino un pipeline de spaCy cuyo componente compartido es un `tok2vec` alimentado por vectores floret de subpalabra. Sobre esa representación se entrenan por separado los componentes de etiquetado gramatical (UPOS/XPOS), análisis morfológico (FEATS), lematización y análisis de dependencias universales. La elección de floret responde a un requisito concreto del dominio: el treebank de entrenamiento está normalizado a eth ⟨ð⟩ mientras que muchas ediciones de entrada usan thorn ⟨þ⟩; los vectores de subpalabra absorben esa variación ortográfica sin necesidad de normalizar el texto de entrada.

Los datos de entrenamiento combinan tres fuentes: el treebank dorado MATILDA de dependencias universales (87.993 tokens) y los treebanks plateados (212.471 tokens, filtrados) para supervisión, y el Dictionary of Old English Corpus (~3,4 millones de tokens) más 1,73 millones de palabras de inglés antiguo sintético para preentrenar los vectores floret y el `tok2vec`. El treebank dorado procede de ParCorOEv3 y de trabajo doctoral del mismo proyecto, con textos como los *Catholic Homilies* de Ælfric, la *Crónica anglosajona*, leyes anglosajonas, el Evangelio de San Marcos, el *Orosio* en inglés antiguo, Beda, cartas, martirologios y Boecio. La parte plateada fue filtrada: se excluyeron cuatro treebanks completados por reglas y uno muy infradotado, se descartaron frases con el marcador `dep` y se eliminaron 338 frases solapadas con los conjuntos de evaluación mediante coincidencia de 4-gramas.

Una innovación destacable es la normalización previa del treebank: el 31,7 % de las celdas de lema incluían glosas o marcadores de clase de palabra (por ejemplo, `and 'and' (CONJ)` en lugar de `and`), y la columna de etiquetas llegaba a 71 cadenas para unas 25 categorías. Esa inconsistencia fijaba un techo artificial: un modelo que siempre acertara el lema más frecuente por par (forma, UPOS) no podría superar el 79,83 % de precisión. Tras la normalización el techo sube al 97,81 %, y la misma normalización se ha aplicado al propio treebank publicado. No se menciona uso de RLHF ni DPO, algo esperable en un pipeline discriminativo de este tipo.

## Capacidades

- Tokenizacion y segmentacion de oraciones sobre texto en inglés antiguo, con métrica TOK declarada de 99,80 y F de oración de 87,44 en el conjunto de prueba.
- Etiquetado de categoría gramatical en dos inventarios: UPOS (95,10 % de exactitud) y XPOS (94,73 %).
- Análisis morfológico de rasgos (FEATS) con 85,42 % de exactitud.
- Lematizacion con 86,94 % de exactitud, incluyendo normalización de variantes ortográficas heredadas de las fuentes originales.
- Analisis de dependencias universales con 86,35 UAS y 79,43 LAS.
- Tolerancia a variación ortográfica thorn/eth (⟨þ⟩ frente a ⟨ð⟩) gracias a los vectores floret de subpalabra.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No está diseñado para flujos de agentes ni razonamiento multi-paso.
- No es multilingüe: está entrenado específicamente para inglés antiguo.
- No incorpora visión, audio ni modo de pensamiento.

## Casos de uso

- Anotacion de corpus historicos: el modelo permite etiquetar automáticamente grandes volúmenes de texto anglosajón con dependencias universales, lo que acelera la creación de nuevos treebanks dorados que después se corrigen manualmente.
- Busqueda linguistica con lematizacion: al normalizar formas flexionadas a su lema, habilita motores de búsqueda sobre corpus históricos en los que el usuario escribe el lema moderno y recupera todas las variantes atestiguadas (`geardeg` para `geardagum`, por ejemplo).
- Edicion digital de textos anglosajones: editoriales y proyectos de humanidades digitales pueden preanotar testimonios manuscritos con categoría, lema y función sintáctica antes de la revisión filológica.
- Analisis sintactico cuantitativo: la salida de dependencias permite estudiar fenómenos como el orden de constituyentes, la posición del verbo o la modificación genitiva en un corpus amplio con métricas objetivas.
- Docencia de filologia germanica: el pipeline sirve como herramienta interactiva que muestra a estudiantes la estructura morfosintáctica de pasajes reales, con lema y función de cada token.
- Preprocesamiento para pipelines de PLN historico: las dependencias y los lemas pueden alimentar tareas posteriores como extracción de relaciones, resolución de correferencia o alineamiento de testimonios paralelos.
- Digitalizacion de fondos bibliotecarios: bibliotecas con colecciones anglosajonas pueden enriquecer sus catálogos con análisis morfosintáctico indexable y anotaciones exportables.
- Analisis diacronico y comparado: al cubrir autores y géneros distintos (homilías, crónica, leyes, evangelios), permite comparar usos sintácticos entre tradiciones textuales dentro del período 650–1150.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de prueba reservado de MATILDA (561 frases, decontaminadas frente a los datos plateados de entrenamiento). Cifras en porcentaje. Ninguno de los valores está verificado de forma independiente (`verified: false`).

| Metrica | Resultado |
|---|---|
| TOK (tokenización) | 99,80 |
| XPOS (TAG) | 94,73 |
| UPOS (POS) | 95,10 |
| FEATS (MORPH) | 85,42 |
| LEMMA | 86,94 |
| UAS | 86,35 |
| LAS | 79,43 |
| F de oración | 87,44 |

Comparación con la línea base publicada por Martín Arista et al. (2025), medida sobre un conjunto emparejado de 285 frases con la misma tokenización:

| Metrica | BDCC 2025 | Este modelo | Delta |
|---|---|---|---|
| XPOS | 93,20 | 94,91 | +1,71 |
| UPOS | 92,96 | 95,02 | +2,06 |
| FEATS | 84,21 | 87,77 | +3,56 |
| UAS | 83,24 | 86,66 | +3,42 |
| LAS | 74,23 | 79,80 | +5,57 |
| F de oración | 71,38 | 84,18 | +12,80 |

El autor excluye la exactitud de lematización de esta comparación: la cifra de 79,83 publicada en 2025 se midió contra celdas de lema que aún contenían glosas y marcadores de clase, por lo que ambas referencias no son comparables. Como contexto adicional, el mejor resultado multilingüe reportado para inglés antiguo (Brigada Villa y Giarda, 2023, inglés antiguo emparejado con islandés) alcanzó 68,44 UAS y 58,70 LAS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Por tamaño del repositorio (0,2 GB) y por ser un pipeline de spaCy, la inferencia es viable íntegramente en CPU; en GPU bastaría una tarjeta con 1 GB de VRAM o más (estimación basada en el tamaño del artefacto).
- GPU recomendadas: no se especifican. Cualquier GPU consumer (por ejemplo, gama RTX 3060 o superior) es más que suficiente; también funcionaría en A100 o H100, aunque no aportarían ventaja significativa frente a CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: `spacy.load("en_matilda_oe_ud")` tras instalar el wheel publicado; el pipeline también puede servirse mediante envoltorios HTTP (FastAPI, Flask) o integrarse en procesos batch de anotación.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de tamaño reducido con `tok2vec` en lugar de un transformer, el coste por token es bajo comparado con modelos neuronales grandes, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Enfoque | UAS | LAS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MATILDA UD parser of Old English (este modelo) | Pipeline spaCy + floret, supervisado sobre MATILDA | 86,35 | 79,43 | CC-BY-4.0 | HuggingFace (pesos spaCy) |
| Martín Arista et al. (2025), BDCC | Mejor configuración publicada para inglés antiguo UD | 83,24 | 74,23 | no disponible | publicación científica |
| Brigada Villa y Giarda (2023), enfoque multilingüe (ang + isl) | Modelo multilingüe con transferencia entre lenguas | 68,44 | 58,70 | no disponible | publicación científica |
| Stanza / UDPipe para inglés antiguo | Modelos genéricos de dependencias | no disponible | no disponible | no disponible | no disponible |

Los datos de la comparación proceden de la model card del autor. Las cifras de la línea base de 2025 corresponden a un conjunto emparejado de 285 frases, mientras que las de este modelo en la tabla de rendimiento general se miden sobre 561 frases; el autor ofrece ambas mediciones para permitir la comparación directa. No se dispone de datos de parámetros ni de contexto de los modelos alternativos, ya que no se publican en la información disponible.

## Limitaciones y advertencias

- Dominio restringido a prosa: el treebank de entrenamiento es prosístico (homilías, crónica, leyes, evangelios, cartas), por lo que la poesía queda fuera de dominio. El propio autor documenta un error visible al analizar el inicio del *Beowulf*, donde `Gardena` (genitivo plural) se etiqueta como `ADJ` y se adjunta como segundo sujeto.
- Variacion ortografica: aunque los vectores floret absorben la diferencia entre thorn ⟨þ⟩ y eth ⟨ð⟩, no hay garantía de comportamiento equivalente ante otras convenciones editoriales (normalización de vocales largas, puntuación moderna, etc.).
- Metricas no verificadas: todos los resultados declarados en el `model-index` llevan `verified: false`, es decir, son cifras aportadas por el autor y no replicadas por terceros.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de retroalimentación independiente sobre su comportamiento en producción.
- Ausencia de capacidades generativas: no produce texto, no razona, no ejecuta código ni admite tool calling. Cualquier caso de uso que requiera generación necesita otro modelo complementario.
- Idioma unico: solo inglés antiguo. Su uso sobre inglés medio, inglés moderno temprano u otras lenguas germánicas no está respaldado por los datos de entrenamiento.
- Dependencia de spaCy: el artefacto se distribuye como wheel y directorio de modelo de spaCy, por lo que su integración queda ligada a esa librería y a sus versiones compatibles.
- Advertencia de licencia: CC-BY-4.0 exige atribución al autor. Es apta para uso comercial siempre que se cumpla la atribución, pero conviene revisar la licencia de los datos subyacentes (D dictionary of Old English Corpus, ParCorOEv3 y treebanks plateados) antes de redistribuir derivados.
- Ruido en los datos de entrenamiento: la porción plateada presenta morfología revisada manualmente pero árboles generados por un parser anterior más débil, lo que puede introducir etiquetas de dependencia de menor calidad que las doradas.
- Conjunto de evaluacion pequeno: las cifras principales provienen de 561 frases y las comparativas de 285, tamaños reducidos que aumentan la varianza de las métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nerthus-Project/MATILDA_UD_parser_of_Old_English
- Referencia citada en la model card: Martín Arista et al. (2025), configuración de referencia para dependencias universales en inglés antiguo (publicación BDCC; no se proporciona URL en la información disponible).
- Referencia citada en la model card: Brigada Villa y Giarda (2023), resultado multilingüe inglés antiguo–islandés (no se proporciona URL en la información disponible).
- Treebank MATILDA de dependencias universales para inglés antiguo y ParCorOEv3: mencionados como fuentes de datos, sin URL en la información disponible.
- Dictionary of Old English Corpus: mencionado como fuente de preentrenamiento, sin URL en la información disponible.
- No se han encontrado enlaces adicionales relevantes en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
