# chariot-ai/indic-shift-262k

## Resumen

Indic Shift 262K es un tokenizador byte-level BPE disenado especificamente para las lenguas programadas de la India, el ingles y codigo fuente. Lo desarrolla chariot-ai y se distribuye bajo licencia Apache 2.0. No se trata de un modelo de lenguaje completo, sino de un componente de tokenizacion que puede integrarse en pipelines de `transformers` mediante `AutoTokenizer`, o utilizarse de forma independiente a traves del paquete Python `indic-shift`.

Su innovacion central es una transformacion reversible del texto que se aplica antes del BPE y despues de la decodificacion: las escrituras brahmicas comparten un unico conjunto de simbolos de letras y un marcador registra la escritura activa. De este modo, caracteres como `क`, `ক`, `ਕ`, `ક`, `କ`, `க`, `క`, `ಕ` y `ക` se mapean al mismo simbolo y el BPE aprende piezas de palabra una sola vez para varias escrituras. Los digitos decimales de cada escritura tambien comparten diez simbolos. La decodificacion restaura el texto original exacto para cualquier cadena Unicode y no existen tokens desconocidos.

El repositorio contiene la variante de 262.144 identificadores, pensada para modelos de mayor tamano. Existe una variante de 131.072 identificadores (indic-shift-131k) orientada a modelos pequenos o con restricciones de latencia, cuyos identificadores son un prefijo exacto de los del 262K. El tokenizador esta disenado para lenguas programadas de India, con cobertura de 23 idiomas, e incorpora una regla de espacio inicial y un decodificador con estado para generacion en streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE con transformacion reversible de escrituras brahmicas |
| Parametros totales | no disponible (no es un modelo de lenguaje) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no aplica (tokenizador, sin pesos numericos) |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, ur, ne, or, pa, as, sa, mai, gom, sd, sat, mni, brx, doi, ks (23 idiomas) |
| Licencia | Apache 2.0 (tablas de transformacion tambien bajo Unicode License V3) |
| Formato de pesos | no aplica; ficheros de tokenizer de `transformers` y paquete `indic-shift` en PyPI |

## Arquitectura y entrenamiento

El tokenizador emplea BPE a nivel de byte con un paso previo de transformacion de texto reversible. Las escrituras brahmicas (devanagari, bengali, gurmukhi, gujarati, oriya, tamil, telugu, kannada, malayalam y otras) comparten un conjunto comun de simbolos de letras, y un marcador codifica la escritura activa. Esto permite que el BPE aprenda piezas de palabra una sola vez para multiples escrituras, reduciendo la fragmentacion y el numero de merges necesarios para cubrir el mismo vocabulario linguistico. Los digitos decimales de cada escritura comparten igualmente diez simbolos.

El vocabulario resultante es de 262.144 identificadores. La transformacion es reversible para cualquier cadena Unicode: la decodificacion restaura exactamente el texto original y no hay tokens desconocidos. No se han publicado en la informacion disponible detalles sobre el corpus de entrenamiento, el numero de tokens utilizados ni la composicion del dataset. La transformacion se deriva de la Unicode Character Database y esta cubierta tambien por la Unicode License V3.

## Capacidades

- Tokenizacion byte-level BPE con cobertura de 23 idiomas (lenguas programadas de India e ingles).
- Uso compartido reversible de escrituras brahmicas: un mismo simbolo representa caracteres equivalentes en distintas escrituras, con marcador de escritura activa.
- Decodificacion exacta y reversible para cualquier cadena Unicode, sin tokens desconocidos.
- Soporte de digitos decimales de todas las escrituras con diez simbolos compartidos.
- Integracion con `transformers` mediante `AutoTokenizer` (requiere `trust_remote_code=True`) y uso directo con el paquete `indic-shift`.
- Sin tokens especiales BOS/EOS por defecto; los tokens anadidos con `add_special_tokens` reciben identificadores posteriores al vocabulario.
- Decodificacion con estado para generacion en streaming mediante `StreamDecoder` (`tok.stream_decoder()`).
- Regla de espacio inicial: cada llamada a `encode` es un unico run de texto y el tokenizador anade un espacio delante de un run que empieza por espacio o por una letra de una escritura que separa palabras con espacios.
- Compatibilidad de prefijo con la variante 131K: cualquier secuencia de identificadores 131K decodifica al mismo texto con cualquiera de los dos tokenizadores.

## Casos de uso

- Entrenamiento de modelos de lenguaje multilingues para India: el tokenizador reduce la fragmentacion en escrituras brahmicas al compartir simbolos entre scripts, lo que se traduce en secuencias mas cortas y un uso mas eficiente del vocabulario en modelos que cubren varias lenguas programadas.
- Modelos pequenos o con restricciones de latencia: la variante 131K, prefijo exacto del 262K, permite reducir el tamano del vocabulario manteniendo la misma cobertura linguistica, adecuada para despliegues en dispositivos con memoria limitada.
- Pipelines de codigo y texto mixto: al cubrir ingles y codigo fuente junto con las lenguas indias, es adecuado para asistentes de programacion y herramientas de documentacion tecnica en contextos multilingues.
- Traduccion automatica entre lenguas indias: el uso compartido de simbolos entre escrituras facilita que el modelo aprenda representaciones comunes para caracteres equivalentes en distintos idiomas, lo que puede ayudar en tareas de traduccion entre pares de lenguas programadas.
- Procesamiento de documentos oficiales multilingues: la decodificacion exacta y la ausencia de tokens desconocidos garantizan la fidelidad del texto en tareas de extraccion, resumen o indexacion de documentos en multiples escrituras.
- Generacion en streaming en produccion: el `StreamDecoder` con estado permite emitir tokens de forma incremental manteniendo la coherencia de la escritura activa y el espacio inicial, adecuado para interfaces conversacionales en tiempo real.
- Normalizacion y tokenizacion en sistemas de busqueda o recuperacion: la cobertura de 23 idiomas y la reversibilidad permiten indexar y comparar texto en distintas escrituras sin perdida de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM para el tokenizador en si: es un componente de software sin pesos numericos; el consumo de memoria depende del modelo de lenguaje que lo utilice.
- El coste computacional del tokenizador es el de un BPE byte-level con transformacion previa, adecuado para CPU.
- No se han publicado datos de latencia o throughput en la informacion disponible.
- Despliegue: integrable en pipelines de `transformers`, en stacks de serving que soporten tokenizers de Hugging Face, o mediante el paquete `indic-shift` directamente.
- Las pilas de serving con detokenizador por ventanas deben implementar la semantica de decodificacion con estado del `StreamDecoder` para generar texto correctamente.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Idiomas | Uso compartido de escrituras | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indic-shift-262k | 262.144 | 23 (lenguas programadas de India e ingles) | Si, reversible con marcador de escritura | Apache 2.0 | Hugging Face, PyPI |
| indic-shift-131k | 131.072 | 23 (mismas) | Si, mismo transform | Apache 2.0 | Hugging Face, PyPI |
| Tokenizadores multilingues genericos | no disponible | variable | No especifico | variable | variable |

No se dispone en la informacion proporcionada de datos sobre otros tokenizadores comparables (por ejemplo, tokenizadores de modelos multilingues de proposito general) que permitan una comparacion cuantitativa de fertilidad o cobertura.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni realiza tareas de razonamiento; es exclusivamente un tokenizador.
- Requiere `trust_remote_code=True` en `transformers`; sin ello, la carga falla en lugar de devolver un tokenizador con identificadores incorrectos. En produccion se recomienda fijar la revision (`revision="v1.0.0"`).
- No soporta `return_offsets_mapping`: los offsets de caracteres no estan disponibles.
- La decodificacion es con estado: las rodajas de identificadores decodificadas por separado no se concatenan al texto correcto; es necesario usar `StreamDecoder` o decodificar el run completo.
- La regla de espacio inicial exige codificar cada documento entero o cada pieza de texto entre tokens de control del modelo por separado; un uso incorrecto puede alterar el texto decodificado.
- No se anaden tokens BOS/EOS ni otros tokens especiales por defecto.
- No se han publicado datos sobre sesgos, tasas de alucinacion (no aplica al tokenizador) ni evaluaciones de calidad en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial; las tablas de transformacion estan tambien sujetas a la Unicode License V3, que debe respetarse.
- El rendimiento real depende del modelo que integre el tokenizador; no hay datos publicados sobre su impacto en la calidad de modelos concretos.

## Enlaces

- Hugging Face: https://huggingface.co/chariot-ai/indic-shift-262k
- Variante 131K: https://huggingface.co/chariot-ai/indic-shift-131k
- GitHub: https://github.com/Chariot-AI/indic-shift
- PyPI: https://pypi.org/project/indic-shift/
- Especificacion: https://github.com/Chariot-AI/indic-shift/blob/main/SPEC.md
- Regla de espacio inicial: https://github.com/Chariot-AI/indic-shift#the-leading-space-rule
- Streaming decode: https://github.com/Chariot-AI/indic-shift#streaming-decode
