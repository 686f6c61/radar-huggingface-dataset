# konko/bengali-bpe-tokenizer

## Resumen

`konko/bengali-bpe-tokenizer` (también denominado bn-bpe-64k) es un tokenizador BPE de vocabulario 64k diseñado específicamente para bengalí, con la particularidad de que respeta los grupos de grafemas del estándar Unicode UAX #29: ningún conjunct bengalí se fragmenta nunca. Lo desarrolla el usuario `konko` en el marco de Project Bornomala, un esfuerzo de investigación no comercial originado en Bengala Occidental cuyo objetivo es construir un modelo de lenguaje bengalí-first y consciente de los dialectos. Es la primera pieza de ese proyecto y se publica como modelo independiente para que otros equipos puedan utilizarlo o medirse contra él.

El problema que resuelve es concreto y medible: los tokenizadores generalistas (GPT-4o o200k, DeepSeek-V3, mBERT, XLM-RoBERTa, Sarvam-1) fragmentan entre el 0,9 % y el 15,5 % de los conjunctos bengalíes de forma destructiva, lo que degrada la calidad de la tokenización, encarece el preprocesado y reduce el contexto útil. Este tokenizador baja esa tasa al 0,04 % y consigue una fertilidad de 1,524 tokens por palabra en Wikipedia bengalí reservada, la más baja de la comparativa publicada.

Se trata de la versión 0.2, entrenada sobre un corpus con peso literario (Wikisource, AI4Bharat Sangraha, Wikipedia y XL-Sum). El 18 de septiembre de 2026 el repositorio se renombró: el nombre anterior `konko/bornomala-bengali-tokenizer` pasó a alojar BMBT, el tokenizador hermano con análisis gramatical de Project Bornomala, mientras que este modelo queda como la línea base estadística, más simple, contra la que ambos se miden. No es un modelo de lenguaje: no genera texto ni tiene pesos neuronales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (byte pair encoding) sobre grupos de grafemas UAX #29 remapeados a símbolos atómicos; normalización NFC previa |
| Parametros totales | no aplicable (no es un modelo neuronal; no tiene parámetros) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible (no se publica `model_max_length` en la información proporcionada) |
| Tipos de cuantizacion | no aplicable (un tokenizador no se cuantiza) |
| Idiomas soportados | bengalí (bn) e inglés (en), incluidos texto code-mixed y bengalí romanizado (Banglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefactos de la librería `tokenizers` de Hugging Face (no se detalla la lista exacta de ficheros en la información disponible) |
| Vocabulario | 64 000 tokens |
| Tamaño de unidad mínima | grupo de grafemas completo (nunca se parte un conjunct) |
| Tipo de pipeline declarado | token-classification (etiqueta de metadatos; el artefacto es un tokenizador) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-07-23 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

El pipeline de construcción tiene tres etapas descritas por el autor. Primero, el texto se normaliza a NFC. Segundo, se segmenta en grupos de grafemas según Unicode UAX #29 y cada grupo se remapea a un símbolo atómico antes de entrenar los subwords. Tercero, se aprende un BPE de 64k sobre esa secuencia de símbolos atómicos. La consecuencia formal es que todo token aprendido equivale a un número entero de grupos de grafemas, de modo que un conjunct bengalí no puede quedar dividido por construcción, no por casualidad de vocabulario. El vocabulario garantiza además la cobertura del bloque Unicode bengalí completo, la puntuación compartida del bengalí (danda y doble danda) y ASCII, lo que asegura que cualquier texto bengalí o code-mixed inglés haga round-trip exacto.

El corpus de entrenamiento de la versión 0.2 tiene ponderación literaria y combina `wikimedia/wikipedia`, `wikimedia/wikisource`, `ai4bharat/sangraha` y `csebuetnlp/xlsum` (noticias). No se especifican en la información disponible el número de tokens de entrenamiento, la proporción exacta de cada fuente ni si se aplicaron fases de ajuste posteriores. El entrenamiento y el uso son exclusivamente de CPU: el autor indica que no se necesita GPU ni para entrenar ni para utilizar el tokenizador.

## Capacidades

- Tokenización de texto bengalí con preservación garantizada de conjunctos y grupos de grafemas.
- Cobertura de todo el bloque Unicode bengalí (bornomala) y de la puntuación propia del idioma: danda y doble danda.
- Round-trip exacto sobre texto bengalí, texto code-mixed bengalí-inglés y segmentos ASCII puros.
- Tratamiento medido y documentado de bengalí romanizado (Banglish) en un registro de evaluación propio.
- Tokenización de precisión sobre vocabulario culturalmente relevante: los 13 términos de la lista de palabras difíciles (nombres de deidades, Rabindranath Tagore, topónimos de Bengala Occidental densos en conjunctos) se emiten como un único token cada uno, incluidos আকাঙ্ক্ষা (triple conjunct) y রবীন্দ্রনাথ (multi-akshara).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: es un componente de preprocesado, no un modelo generativo.
- Multilingüismo limitado a bengalí e inglés; no se documentan otros idiomas.

## Casos de uso

- Preentrenamiento de modelos de lenguaje en bengalí: con una fertilidad de 1,524 tokens por palabra frente a 2,608 de GPT-4o o200k o 2,994 de DeepSeek-V3, un mismo presupuesto de contexto cubre aproximadamente un 40-70 % más de texto bengalí, lo que reduce directamente el coste de cómputo por documento.
- Ajuste fino de modelos de clasificación y etiquetado de secuencias en bengalí (NER, POS, análisis de sentimiento): al no fragmentar conjunctos, las etiquetas a nivel de palabra se alinean de forma más limpia y se evita el ruido introducido por subtokens huérfanos de virama o nukta desprendidos.
- Indexación y búsqueda documental sobre corpus bengalíes: los 11,38 bytes por token (frente a 6,25 de mBERT o 6,65 de GPT-4o) implican índices invertidos más compactos y menos postings por documento.
- Traducción automática bengalí-inglés: la garantía de cobertura de ASCII y de puntuación danda permite concatenar texto bengalí con marcadores, identificadores y código sin romper la tokenización.
- Digitalización y procesado de patrimonio literario en Wikisource: la preservación ortográfica estricta y el soporte de danda evitan la corrupción de grafías históricas durante el preprocesado.
- Investigación en preservación lingüística y dialectal dentro de Project Bornomala: sirve como línea base estadística reproducible contra la que se mide el tokenizador hermano BMBT, útil para estudios comparativos de tokenización en lenguas índicas.
- Análisis de redes sociales y foros con texto bengalí-inglés mezclado: el registro Banglish está evaluado explícitamente en los benchmarks del proyecto.
- Reducción de coste en APIs de terceros que facturan por token: menos tokens por palabra en bengalí se traduce directamente en menor gasto por documento procesado, siempre que el proveedor acepte vocabulario propio.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 828 líneas de Wikipedia bengalí reservadas (no vistas en entrenamiento). Fertilidad y tasa destructiva: menor es mejor. STRR y bytes por token: mayor es mejor. La tasa destructiva solo cuenta divisiones que seccionan algo real (virama huérfana, nukta desprendida), no la frontera inocua entre grupo consonántico y signo vocálico.

| Tokenizador | Fertilidad | STRR | Bytes/token | Tasa destructiva |
|---|--:|--:|--:|--:|
| **bn-bpe-64k (este modelo)** | **1,524** | **0,722** | **11,38** | **0,0004** |
| BanglaBERT (csebuetnlp) | 1,625 | 0,649 | 10,67 | 0,0162 |
| IndicBERTv2 (AI4Bharat) | 1,652 | 0,612 | 10,50 | 0,0191 |
| BanglaT5 (csebuetnlp) | 1,669 | 0,628 | 10,39 | 0,0088 |
| XLM-RoBERTa (Meta) | 2,464 | 0,363 | 7,04 | 0,0627 |
| Sarvam-1 (Sarvam AI) | 2,593 | 0,415 | 6,69 | 0,0364 |
| GPT-4o (OpenAI o200k) | 2,608 | 0,111 | 6,65 | n/a |
| BrahmicTokenizer-131K (TSAI) | 2,620 | 0,154 | 6,62 | 0,0820 |
| mBERT (Google) | 2,777 | 0,385 | 6,25 | 0,1552 |
| DeepSeek-V3 | 2,994 | 0,089 | 5,79 | 0,1031 |

El autor indica además que la misma clasificación se confirma en otros tres registros disjuntos reservados (literario/formal, web general y noticias), así como en Banglish romanizado y en FLORES+ (el corpus exacto del que proceden los números de un artículo externo sobre fertilidad de tokenizadores), con resultados en `benchmarks/bengali-comparison.md`.

Subconjunto de la prueba de palabras difíciles (13 términos, todos densos en conjunctos); se muestran los seis primeros de la tabla publicada:

| Palabra | Significado | Este modelo | BanglaBERT / BanglaT5 | IndicBERTv2 | GPT-4o |
|---|---|--:|--:|--:|--:|
| স্ত্রী | esposa/mujer | **1** | 1 / 1 | 1 | 2 |
| আকাঙ্ক্ষা | aspiración | **1** | 1 / 1 | 1 | 6 |
| রবীন্দ্রনাথ | Rabindranath (Tagore) | **1** | 1 / 1 | 1 | 7 |
| পশ্চিমবঙ্গ | Bengala Occidental | **1** | 1 / 1 | 1 | 5 |
| বিষ্ণুপুর | Bishnupur | **1** | 1 / 1 | 2 | 5 |
| শান্তিনিকেতন | Santiniketan | **1** | 1 / 1 | 3 | 5 |

Media de tokens por palabra sobre los 13 términos: este modelo, BanglaBERT y BanglaT5 empatan en 1,00; IndicBERTv2 queda en 1,31 y fragmenta 3 de los 13; el resto de los 19 tokenizadores medidos se sitúa entre 3,31 y 11,08 (Gemma-2, 5,69). No se han publicado resultados de benchmarks de tareas downstream (clasificación, generación, traducción) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El autor declara explícitamente que no se necesita GPU, ni para entrenar ni para usar.
- GPU recomendadas: ninguna. Funciona en cualquier CPU convencional.
- Cabe en GPU de consumo: no aplica; el artefacto es un tokenizador, no un modelo que se cargue en memoria de vídeo.
- Huella en memoria: del orden de unos pocos megabytes para la tabla de vocabulario de 64k tokens y las reglas de merge (estimación a partir del tamaño del vocabulario; el autor no publica la cifra exacta).
- Opciones de despliegue: librería `tokenizers` de Hugging Face, integrable como componente de tokenización en pipelines de `transformers`, en servicios de preprocesado HTTP y en scripts de preparación de corpus.
- Latencia y throughput: no disponibles. Al ser exclusivamente CPU y con un vocabulario de 64k, el coste dominante en producción será el del resto del pipeline, no el del tokenizador.

## Comparativa con modelos similares

Comparativa con tokenizadores de la misma categoría (bengalí o multilingüe índico). Los datos de rendimiento proceden de la tabla de benchmarks del propio autor; el resto de campos no se detallan en la información disponible.

| Tokenizador | Desarrollador | Vocabulario | Fertilidad (bn) | Tasa destructiva | Licencia | Disponibilidad |
|---|---|--:|--:|--:|---|---|
| bn-bpe-64k (este modelo) | konko / Project Bornomala | 64k | 1,524 | 0,0004 | Apache 2.0 | Hugging Face |
| BanglaBERT | csebuetnlp | no disponible | 1,625 | 0,0162 | no disponible | Hugging Face |
| BanglaT5 | csebuetnlp | no disponible | 1,669 | 0,0088 | no disponible | Hugging Face |
| IndicBERTv2 | AI4Bharat | no disponible | 1,652 | 0,0191 | no disponible | Hugging Face |
| XLM-RoBERTa | Meta | no disponible | 2,464 | 0,0627 | no disponible | Hugging Face |
| GPT-4o (o200k) | OpenAI | no disponible | 2,608 | n/a | propietaria | solo API |
| mBERT | Google | no disponible | 2,777 | 0,1552 | no disponible | Hugging Face |

Frente a BanglaBERT y BanglaT5, el modelo no gana en la prueba de las 13 palabras difíciles (los tres empatan en 1,00 token por palabra); su ventaja declarada es que la integridad del grafema es una garantía estructural, no el resultado de que el vocabulario cubriese esos 13 casos concretos. La diferencia cuantitativa real frente a ellos aparece en la fertilidad agregada y, sobre todo, en la tasa destructiva (0,0004 frente a 0,0162 y 0,0088).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling ni dispone de modo de pensamiento. Cualquier evaluación de calidad generativa es inaplicable.
- Cobertura lingüística restringida a bengalí e inglés. No se documentan otras lenguas índicas ni el manejo de escrituras distintas del bloque bengalí (por ejemplo, assamés con caracteres compartidos) más allá de la garantía de round-trip.
- Los benchmarks publicados son de tokenización (fertilidad, STRR, bytes/token, fragmentación), no de tareas downstream. No hay evidencia en la información disponible de que la mejora en fertilidad se traduzca en mejoras medibles de precisión en clasificación, traducción o generación.
- La evaluación se ha hecho sobre corpus del propio proyecto y en parte sobre registros que el autor selecciona; no hay una validación independiente por terceros.
- Adopción prácticamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca superficie de pruebas en producción y poco soporte comunitario.
- El repositorio se renombró el 18 de septiembre de 2026. Código o documentación que apunte a `konko/bornomala-bengali-tokenizer` encontrará ahora BMBT, un tokenizador distinto con salida de descomposición de rasgos. Es un riesgo real de confusión en dependencias fijadas.
- La licencia es Apache 2.0, permisiva y apta para uso comercial, aunque el autor describe el proyecto como un esfuerzo de investigación no comercial. Conviene verificar que no existan restricciones adicionales en la documentación del repositorio de Project Bornomala antes de integrarlo en un producto.
- Riesgo de alucinación: no aplicable, al no generar texto. Los riesgos asociados son de otro tipo: pérdida de información si se aplica normalización NFC destructiva antes de la tokenización en textos que no estén ya normalizados.
- Los conjuntos de datos de entrenamiento incluyen Wikipedia y Wikisource, con los sesgos de cobertura y de registro propios de esas fuentes (sobrerrepresentación del registro enciclopédico y literario formal, menor presencia de registro coloquial o dialectal).
- No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del proceso de selección de vocabulario, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/konko/bengali-bpe-tokenizer
- Tokenizador hermano BMBT: https://huggingface.co/konko/bornomala-bengali-tokenizer
- Repositorio de Project Bornomala: https://github.com/konkomaji/bornomala
- Benchmarks comparativos de tokenizadores bengalíes: `benchmarks/bengali-comparison.md` dentro del repositorio de Project Bornomala
- Conjuntos de datos citados: `wikimedia/wikipedia`, `wikimedia/wikisource`, `ai4bharat/sangraha`, `csebuetnlp/xlsum`
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo (los resultados devueltos corresponden a foros y artículos sin relación con el artefacto).
