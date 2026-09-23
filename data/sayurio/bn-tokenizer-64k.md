# sayurio/bn-tokenizer-64k

## Resumen

`sayurio/bn-tokenizer-64k` es un tokenizer de tipo Byte-Pair Encoding (BPE) con un vocabulario de 65.536 entradas, disenado especificamente para texto en bengali (bangla). No es un modelo de lenguaje con parametros entrenados, sino el componente de tokenizacion que se acopla a un LLM o a un sistema de OCR de documentos para transformar texto bengali en secuencias de IDs. Lo desarrolla el usuario `sayurio` y se publica bajo licencia Apache 2.0.

El problema que aborda es concreto: los tokenizers multilingues genericos (LLaMA, Mistral o Qwen, segun la propia model card) fragmentan las palabras y las ligaduras compuestas del bengali en multiples subtokens, lo que alarga las secuencias y encarece tanto el entrenamiento como la inferencia. Este tokenizer trata los grupos de grafemas compuestos y las raices frecuentes como tokens unificados, alcanzando una ratio media de compresion de aproximadamente 8,00 caracteres por token en texto bengali formal, con una reduccion declarada del 60-70% en longitud de secuencia frente a tokenizers multilingues estandar.

Es relevante porque el bengali es uno de los idiomas con mayor numero de hablantes del mundo y, sin embargo, esta infrarepresentado en los vocabularios de los modelos abiertos mayoritarios. Un tokenizer especializado reduce el coste por token y mejora la fidelidad de la reconstruccion del texto (normalizacion NFC, preservacion de zwnj/zwj), dos factores criticos cuando se construyen pipelines de OCR, generacion aumentada por recuperacion o entrenamiento de LLM en dominios bengalies.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Pair Encoding (BPE); no es una red neuronal |
| Parametros totales | No aplica (tokenizer sin parametros entrenados); vocabulario de 65.536 tokens |
| Longitud de contexto | No aplica (tokenizer). Vocabulario de 65.536 entradas |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Bengali (bn); corpus restringido al bloque Unicode bengali `\u0980`-`\u09FF`, numeros bengalies `০-৯` y puntuacion estandar |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en la informacion proporcionada; se carga con `AutoTokenizer.from_pretrained` (transformers) o `Tokenizer.from_pretrained` (tokenizers, backend Rust) |

Parametros adicionales declarados por el autor:

| Parametro | Valor |
|---|---|
| Tipo de modelo | Byte-Pair Encoding (BPE) |
| Tamano de vocabulario | 65.536 |
| Pre-tokenizer | Metaspace (reemplazo ` `, prepend `always`) |
| Decoder | Metaspace (reemplazo ` `, prepend `always`) |
| Normalizador | Unicode NFC + Strip |
| Corpus de entrenamiento | ~1,11 GB de texto limpio (mas de 500.000 frases deduplicadas) |
| Dominios del corpus | Wikipedia en bengali, AI4Bharat Sangraha, periodismo nacional |
| Frecuencia minima de token | 3 |

Tokens especiales:

| Token | ID | Funcion |
|---|---|---|
| `<pad>` | 0 | Relleno |
| `<s>` | 1 | Inicio de secuencia (BOS) |
| `</s>` | 2 | Fin de secuencia (EOS) |
| `<unk>` | 3 | Token desconocido |

## Arquitectura y entrenamiento

Se trata de un tokenizer BPE puro, sin componente neuronal. El pipeline declarado aplica una normalizacion Unicode NFC mas un strip previo, despues un pre-tokenizer Metaspace con reemplazo de espacio y prefijo forzado, y finalmente la segmentacion BPE con un vocabulario de 65.536 entradas. El decoder usa el mismo esquema Metaspace, lo que permite una reconstruccion sin perdida del texto original preservando los espacios exactos. Se conservan los caracteres invisibles Zero-Width Non-Joiner (`\u200c`) y Zero-Width Joiner (`\u200d`), necesarios para las reglas ortograficas del bengali.

El entrenamiento se realizo sobre un corpus multidominio de aproximadamente 1,11 GB de texto limpio y mas de 500.000 frases deduplicadas, procedente de tres fuentes: prosa academica y enciclopedica de Wikipedia en bengali, registros formales y legales de los recursos bengalies de AI4Bharat, y prensa regional contemporanea (politica, economia y cultura). El pre-filtrado elimino escrituras extranjeras, etiquetas HTML/Markdown sueltas y marcadores de bytes corruptos, y se aplico composicion canonica NFC antes del ranking de pares. La frecuencia minima de token se fijo en 3.

La innovacion tecnica destacable es la preservacion de ligaduras compuestas (যুক্তবর্ণ) como `ক্ষ`, `জ্ঞ`, `ঞ্চ`, `ণ্ড`, `ক্ত`, `ত্র`, `ঙ্গ`, y de raices multisilabicas como `শিক্ষাক্রম`, `পাঠ্যপুস্তক` o `বুদ্ধিমত্তা`, que pasan a representarse como un unico token. Esto reduce el numero de subtokens por palabra y, con ello, la longitud efectiva de las secuencias que consume el modelo que use este tokenizer.

## Capacidades

- Tokenizacion y detokenizacion de texto bengali con reconstruccion sin perdida (lossless) y preservacion exacta de espacios.
- Compresion de aproximadamente 8,00 caracteres por token en texto bengali formal, con una reduccion declarada del 60-70% de longitud de secuencia frente a tokenizers multilingues.
- Unificacion de ligaduras compuestas bengalies y raices frecuentes en tokens unicos.
- Normalizacion canonica NFC para evitar diacriticos vocales divididos (por ejemplo, descomposicion de `ো` en `ে` + `া`).
- Gestion de caracteres invisibles (ZWNJ y ZWJ) para respetar las reglas de escritura del bengali.
- Uso previsto en pipelines de LLM de texto, OCR de documentos y arquitecturas vision-lenguaje (los tags del repositorio incluyen `ocr`, `vlm` y `text-generation`).
- Soporte de backend rapido en Rust mediante la libreria `tokenizers`.
- No dispone de capacidades propias de generacion, razonamiento, codigo, matematicas, tool calling, agentes ni vision: esas capacidades dependen del modelo al que se acople el tokenizer.

## Casos de uso

- Preentrenamiento de LLM en bengali: al comprimir el texto a ~8,00 caracteres por token, un corpus de 1,11 GB ocupa muchas menos posiciones de secuencia, lo que reduce el coste de computo y el numero de pasos de entrenamiento necesarios para cubrir el mismo volumen de texto.
- Ajuste fino (fine-tuning) de modelos bengalies: sustituir el tokenizer multilingue por este reduce la longitud de las muestras y permite usar ventanas de contexto mas largas de forma efectiva sin ampliar el presupuesto de memoria.
- OCR de documentos bengalies: los tags `ocr` y `vlm` del repositorio apuntan a su uso dentro de modelos vision-lenguaje que transcriben documentos; la preservacion de ligaduras y ZWNJ/ZWJ mejora la fidelidad de la transcripcion frente a tokenizers que fragmentan los conjuntos de grafemas.
- Generacion aumentada por recuperacion (RAG) sobre corpus bengalies: menos tokens por documento implica mas pasajes en el mismo contexto y una recuperacion mas densa, con menor coste de indexacion.
- Analisis de prensa y corpus periodisticos: el corpus de entrenamiento incluye prensa regional contemporanea, por lo que el vocabulario cubre vocabulario politico, economico y cultural actual.
- Normalizacion y limpieza de texto bengali: el normalizador NFC mas strip puede emplearse como paso previo de estandarizacion en pipelines de datos antes de indexar o almacenar texto.
- Traduccion automatica bengali a otros idiomas: al reducir la longitud de la secuencia fuente, disminuye la presion sobre el encoder y el coste de atencion en modelos seq2seq.
- Aplicaciones academicas y comerciales: la licencia Apache 2.0 permite uso, modificacion y redistribucion tanto en investigacion como en producto, sin obligacion de liberar el codigo derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo cual es coherente con que se trata de un tokenizer y no de un modelo generativo. El autor si publica dos ejemplos de tokenizacion que actuan como medida de eficiencia:

| Ejemplo | Texto (caracteres) | Tokens de contenido | Ratio |
|---|---|---|---|
| Texto formal y academico: `স্বাধীন বাংলাদেশের জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড` | 56 | 7 | 8,00 caracteres/token |
| Texto cientifico y tecnico: `বিজ্ঞান ও প্রযুক্তির উৎকর্ষে কম্পিউটার প্রোগ্রামিং এবং কৃত্রিম বুদ্ধিমত্তা অত্যন্ত গুরুত্বপূর্ণ।` | 96 | 12 | 8,00 caracteres/token |

En el segundo ejemplo se observa una unica fragmentacion reseñable: `উৎকর্ষ` + `ে` (dos tokens), frente al resto de palabras y raices, que se resuelven en un solo token.

## Requisitos de hardware

- VRAM: no requiere GPU. Un tokenizer BPE es una estructura de datos de busqueda de pares; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica. No hay ninguna GPU necesaria para ejecutar el tokenizer.
- GPU de consumo: no aplica; el tokenizer no ocupa memoria de video. El modelo al que se acople si tendra sus propios requisitos de VRAM, que dependen de su tamano y cuantizacion.
- Memoria principal: no especificada en la informacion proporcionada. El artefacto pesa lo propio de un vocabulario de 65.536 entradas mas las reglas de merge, un orden de magnitud muy inferior al de un modelo de lenguaje.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), `tokenizers` con backend Rust (`Tokenizer.from_pretrained`). Al ser un componente, puede integrarse en cualquier stack de inferencia (vLLM, TGI, llama.cpp, Ollama) siempre que dichos stacks permitan sustituir el tokenizer por defecto del modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card menciona explicitamente tokenizers multilingues genericos como referencia de comparacion, pero no aporta cifras concretas de estos. La comparacion se limita, por tanto, a lo declarado:

| Tokenizer | Ambito | Vocabulario | Comportamiento con bengali | Licencia |
|---|---|---|---|---|
| `sayurio/bn-tokenizer-64k` | Bengalí especifico | 65.536 | Ligaduras y raices unificadas; ~8,00 caracteres/token declarados | Apache 2.0 |
| Tokenizers multilingues tipo LLaMA, Mistral o Qwen | Multilingue general | No disponible | Fragmentan palabras y ligaduras bengalies en multiples subtokens (segun el autor) | No disponible |
| Otros tokenizers especificos de bengali | Bengalí | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo verificables mas alla de la afirmacion cualitativa del autor sobre la reduccion del 60-70% en longitud de secuencia.

## Limitaciones y advertencias

- Es un tokenizer, no un modelo: no genera texto, no razona y no puede usarse por si solo para ninguna tarea de NLP final.
- El corpus de entrenamiento esta restringido al bloque Unicode bengali, numeros bengalies y puntuacion estandar. El texto mixto bengali-ingles (muy habitual en contextos tecnicos) puede tokenizarse de forma ineficiente, ya que los caracteres latinos no forman parte del foco del vocabulario.
- La ratio de compresion de ~8,00 caracteres por token esta medida sobre dos ejemplos de texto formal. En texto coloquial, con abreviaturas o transliteraciones, es probable que la compresion sea peor; no hay datos publicados al respecto.
- El repositorio muestra 0 descargas y 0 likes en el momento del analisis, y fue creado y actualizado el mismo dia. No hay validacion externa, ni adopcion por terceros, ni historial de mantenimiento.
- Riesgo de sesgo de dominio: el vocabulario se deriva de Wikipedia, AI4Bharat y prensa, lo que puede infrarrepresentar registros dialectales, sociolectos o vocabulario especializado muy especifico.
- El repositorio declara como dataset de entrenamiento `sayurio/bangla-nsfw-stories-scrape`, ademas de `wikimedia/wikipedia`, `likhonsheikh/BanglaNLP` y `sayurio/bangla-wikipedia`. Conviene revisar la composicion efectiva del corpus y las implicaciones de contenido antes de reutilizarlo en produccion.
- Al sustituir el tokenizer de un modelo preentrenado se invalida su embedding inicial: este tokenizer solo es util si se entrena un modelo desde cero o se reentrena el embedding con el vocabulario nuevo. No es un reemplazo directo en un modelo ya entrenado.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece ninguna garantia sobre el artefacto ni sobre los corpus de origen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sayurio/bn-tokenizer-64k
- Datasets citados en la model card:
  - https://huggingface.co/datasets/wikimedia/wikipedia
  - https://huggingface.co/datasets/likhonsheikh/BanglaNLP
  - https://huggingface.co/datasets/sayurio/bangla-nsfw-stories-scrape
  - https://huggingface.co/datasets/sayurio/bangla-wikipedia
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
