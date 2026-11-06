# j-llm/jtok-eucalyptus-v3

## Resumen

jtok-eucalyptus-v3 es un tokenizador BPE (Byte Pair Encoding) especializado en japones, desarrollado por el usuario j-llm y publicado en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje completo, sino de un componente de tokenizacion distribuido en formato `tokenizers` de Hugging Face, pensado para ser usado como pieza de preprocesamiento en pipelines de entrenamiento e inferencia de modelos de lenguaje en japones. Su vocabulario es de 49.152 tokens y su corpus de entrenamiento ronda los 3.000 millones de caracteres.

La relevancia de esta version (v3) radica en que rompe con las dos generaciones anteriores de la familia (v1 y v2), que empleaban SentencePiece Unigram. La v3 cambia de algoritmo (BPE con byte fallback), de corpus y de vocabulario, por lo que no existe compatibilidad de IDs ni de segmentacion con los tokenizadores previos del mismo autor. Esto implica que cualquier modelo entrenado con v1 o v2 debe reentrenarse o adaptarse si se migra a v3.

El tokenizador esta disenado explicitamente para preservar la reversibilidad exacta (`decode(encode(text)) == text`), para no fusionar espacios con palabras adyacentes y para incluir tokens especiales orientados a chat y a generacion de ficcion (cabeceras de reparto, escena, argumento). Es, por tanto, una pieza tecnica de infraestructura mas que un modelo generativo, y su evaluacion debe centrarse en compresion, fidelidad de reconstruccion e integracion con `transformers` y `llama.cpp`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE con byte fallback (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica: no es un modelo de lenguaje) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (tokenizador sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (artefacto de tokenizacion, no pesos) |
| Idiomas soportados | Japones (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`, `tokenizer.sha256` |

Datos adicionales del tokenizador:

| Parametro | Valor |
|---|---|
| Vocabulario total | 49.152 tokens |
| Tokens aprendidos | 48.863 |
| Merges | 39.176 |
| Longitud maxima de token | 15 caracteres |
| Normalizacion | ninguna |
| Pre-tokenizer | separacion por rachas de espacios (`\n`, `\t`, espacio, `U+3000`); digitos separados uno a uno |
| Decoder | ByteFallback + Fuse (sin sustitucion por `▁`) |
| Post-processor | ninguno (no anade BOS/EOS) |
| Compresion media | 1,96 caracteres/token en datos de evaluacion |
| SHA-256 de `tokenizer.json` | `8bee9b74eed12955041e29670e046edde9b7ee68ed8ca3be8227501a691d7f52` |

## Arquitectura y entrenamiento

El artefacto es un tokenizador BPE clasico con byte fallback, implementado sobre la libreria `tokenizers` de Hugging Face. No emplea normalizacion Unicode, lo que garantiza que la cadena de entrada se preserve tal cual. El pre-tokenizer divide por rachas de caracteres de espacio (incluido el ideografico `U+3000`) y aisla cada digito, de modo que los espacios nunca se fusionan con la palabra contigua y los numeros se tokenizan digito a digito. El decoder combina ByteFallback y Fuse, sin el caracter `▁` tipico de SentencePiece, lo que simplifica la reconstruccion exacta del texto original.

El corpus de entrenamiento suma aproximadamente 3.000.051.617 caracteres tras deduplicacion y eliminacion de fugas con los conjuntos de evaluacion. La composicion por caracteres es: novela web 46,5 %, novela R18 10,1 %, texto general 13,5 % (FineWeb-2 Edu en japones y otros), no ficcion 8,4 % (Wikipedia en japones), texto de dificultad alta 7,5 % (estilo literario clasico, libros academicos, japones clasico, kanbun), documentacion tecnica 6,9 % (PDF de WARP, llm-jp-corpus v4), clasicos 4,4 % (material de dominio publico de la Biblioteca Nacional de Japon y de Pleias) y conversacion 2,7 % (actas parlamentarias). En los dominios con poca oferta (novela R18 y texto de dificultad alta) se admitio hasta dos pasadas del mismo documento, sumando 50,03 millones de caracteres.

La innovacion tecnica principal no esta en el algoritmo, sino en el diseno de los tokens especiales y en las garantias de fidelidad. El vocabulario reserva los IDs 0-3 para `<unk>`, `<s>`, `</s>` y `<pad>`; los IDs 4-7 para marcadores de chat (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|turn_end|>`); los IDs 8-11 para cabeceras de ficcion (`<|cast|>`, `<|outline|>`, `<|scene|>`, `<|story|>`); los IDs 12-27 para `<character0>` a `<character15>`; los IDs 28-32 para secuencias de espacio; y los IDs 33-288 para byte fallback. Los IDs 8-27 son tokens anadidos con `special=False`, por lo que una aparicion literal de esas cadenas en el texto se mapea a su ID correspondiente.

## Capacidades

- Tokenizacion y detokenizacion reversible exacta: `decode(encode(text)) == text` tanto con `skip_special_tokens` activado como desactivado.
- Segmentacion BPE con byte fallback, lo que permite representar cualquier cadena Unicode sin perdida, incluidos caracteres fuera del vocabulario aprendido.
- Pre-tokenizacion que aisla espacios y digitos: evita que numeros o espacios se fusionen con palabras adyacentes, algo relevante para el conteo y la aritmetica sobre IDs.
- Soporte de tokens de chat (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|turn_end|>`) listos para plantillas conversacionales.
- Tokens especificos para generacion de ficcion: reparto de personajes, argumento, escena y cuerpo de texto, ademas de 16 ranuras de personaje.
- Proteccion frente a inyeccion de tokens especiales: las cadenas como `</s>` o `<|user|>` presentes en el texto se tokenizan como texto normal y no como IDs 0-7, siempre que se use la configuracion incluida (`split_special_tokens: true`) o `encode_special_tokens = True`.
- Compatibilidad verificada con `transformers` (`PreTrainedTokenizerFast`) y con `llama.cpp` tras conversion a GGUF: la secuencia de IDs coincide en ambos entornos.
- No incluye capacidades de generacion, razonamiento, vision, audio ni tool calling: es exclusivamente un componente de tokenizacion.

## Casos de uso

- Entrenamiento de modelos de lenguaje en japones desde cero: el tokenizador ofrece un vocabulario de 49.152 tokens con compresion de 1,96 caracteres/token en japones, adecuado para fijar el tamano de embedding y la longitud efectiva de secuencia de un LLM nuevo.
- Fine-tuning de modelos japoneses con corpus literario: la presencia de tokens de reparto, escena y personajes (IDs 8-27) permite estructurar prompts de generacion de ficcion sin recurrir a cadenas ad hoc, lo que reduce ambiguedad en el formateo.
- Construccion de pipelines de chat multi-turno: los marcadores `<|system|>`, `<|user|>`, `<|assistant|>` y `<|turn_end|>` permiten delimitar roles de forma estable y compatible con `transformers` y `llama.cpp`.
- Preprocesamiento de corpus mixtos japones-ingles: el byte fallback garantiza que texto en otros idiomas o simbolos raros se representen sin `<unk>`, lo que evita perdida de informacion en datasets multilingues aunque el tokenizador este optimizado para japones.
- Evaluacion de calidad de tokenizadores: sirve como referencia para comparar compresion y fidelidad de reconstruccion frente a SentencePiece Unigram (v1/v2 del mismo autor) o frente a tokenizadores de modelos japoneses comerciales.
- Integracion en herramientas de analisis de texto japones: el aislamiento de digitos y espacios facilita tareas de conteo de tokens, calculo de longitudes y post-procesado de salidas numericas.
- Despliegue en entornos con `llama.cpp`: la verificacion de coincidencia de IDs tras conversion a GGUF permite usar el mismo tokenizador en inferencia local en CPU y en entrenamiento con GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica cuantitativa reportada por el autor es la compresion media de 1,96 caracteres por token sobre el conjunto de evaluacion de 11.196 documentos y 32 textos de estres. No se proporcionan comparaciones con otros tokenizadores en terminos de compresion, fertilidad ni velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el tokenizador no requiere GPU y se ejecuta en CPU con un consumo de memoria del orden de decenas de megabytes (vocabulario de 49.152 entradas y 39.176 merges).
- GPU recomendadas: ninguna; no hay requisito de aceleracion por hardware.
- Compatibilidad con GPU de consumo: irrelevante, ya que el artefacto es un fichero JSON procesado por la libreria `tokenizers` en CPU.
- Opciones de despliegue: `transformers` mediante `AutoTokenizer`, libreria `tokenizers` directamente, y `llama.cpp` tras conversion a GGUF (el autor verifica coincidencia de IDs).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la implementacion, y no se han publicado cifras.

## Comparativa con modelos similares

| Tokenizador | Autor | Algoritmo | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| jtok-eucalyptus-v3 | j-llm | BPE con byte fallback | 49.152 | Japones | Apache 2.0 | Reversible exacto, tokens de chat y ficcion, sin normalizacion |
| j72-tokenizer (v1) | j-llm | SentencePiece Unigram | no disponible | Japones | no disponible | Incompatible en IDs y segmentacion con v3 |
| j48-tokenizer-v2 (v2) | j-llm | SentencePiece Unigram | no disponible | Japones | no disponible | Incompatible en IDs y segmentacion con v3 |
| Tokenizadores de LLM japoneses comerciales | varios | BPE / Unigram | variable | Japones y multilingue | variable | No comparados en la informacion disponible |

La comparacion cuantitativa de compresion y fertilidad frente a otros tokenizadores japoneses no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; solo convierte cadenas en secuencias de IDs y viceversa.
- Incompatibilidad total con las familias v1 y v2 del mismo autor: los IDs y la segmentacion no coinciden, por lo que migrar un modelo entrenado con v1/v2 a v3 exige reentrenamiento o adaptacion del embedding.
- Mayor numero de tokens en ingles y codigo fuente que los tokenizadores con Metaspace, porque los espacios no se fusionan con la palabra anterior; esto penaliza la eficiencia en corpus no japoneses.
- Los IDs 8-27 son tokens anadidos con `special=False`: si el texto de entrada contiene literalmente cadenas como `<|cast|>` o `<character0>`, se mapearan a esos IDs, lo que puede introducir ambiguedad si el corpus no esta controlado.
- Dependencia de version de la libreria: en `tokenizers` 0.23.3 se ha observado que `encode_special_tokens` se ignora; el autor recomienda eliminar los IDs 0-7 de `added_tokens` al cargar el fichero en esos casos. La verificacion se realizo con `tokenizers` 0.22.2 y `transformers` 4.57.6.
- `encode` no anade BOS ni EOS: el codigo cliente debe insertar manualmente los IDs 1 y 2 cuando la arquitectura del modelo lo requiera.
- Riesgo de fuga de sesgos del corpus: la composicion incluye un 10,1 % de novela R18 y un 7,5 % de texto de dificultad alta, lo que puede reflejar sesgos de genero, violencia o registro literario en los modelos entrenados con este tokenizador.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez adversarial especificas para este tokenizador.
- Uso comercial permitido por Apache 2.0, con la obligacion habitual de conservar el aviso de licencia y las atribuciones correspondientes.

## Enlaces

- Hugging Face: https://huggingface.co/j-llm/jtok-eucalyptus-v3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Tokenizador v1 de referencia (`j72-tokenizer`): https://huggingface.co/j-llm/j72-tokenizer
- Tokenizador v2 de referencia (`j48-tokenizer-v2`): https://huggingface.co/j-llm/j48-tokenizer-v2
- Libreria `tokenizers` de Hugging Face: https://github.com/huggingface/tokenizers
- Libreria `transformers` de Hugging Face: https://github.com/huggingface/transformers
- `llama.cpp`: https://github.com/ggerganov/llama.cpp
