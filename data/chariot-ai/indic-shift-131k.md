# chariot-ai/indic-shift-131k

## Resumen

Indic Shift 131K es un tokenizador byte-level BPE disenado especificamente para las lenguas programadas de la India, el ingles y codigo fuente. Lo desarrolla Chariot AI y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje completo, sino el componente de tokenizacion que se situa en la base de cualquier modelo generativo destinado al mercado indic: su funcion es transformar texto en secuencias de ids y reconstruir el texto original de forma exacta.

Su innovacion principal es el "script sharing" reversible: antes de aplicar BPE se ejecuta una transformacion reversible sobre el texto en la que todas las escrituras brahmicas comparten un mismo conjunto de simbolos de letra, y una marca registra la escritura activa. Asi, caracteres como क, ক, ਕ, ક, କ, க, క, ಕ y ക se mapean al mismo simbolo, de modo que BPE aprende piezas de palabra una sola vez para varias escrituras y el vocabulario se aprovecha de forma mucho mas eficiente. Al decodificar, la transformacion inversa restaura el texto Unicode exacto y no existen tokens desconocidos.

El repositorio contiene la variante de 131.072 ids, pensada para modelos pequenos o con restricciones de latencia. La version de 262.144 ids (indic-shift-262k) comparte exactamente los mismos primeros 131.072 tokens y las mismas merges iniciales, por lo que cualquier secuencia de ids del tokenizador 131K se decodifica al mismo texto con cualquiera de los dos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE con transformacion de escritura reversible previa y posterior |
| Parametros totales | no disponible (no es un modelo de parametros; vocabulario de 131.072 ids) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, ur, ne, or, pa, as, sa, mai, gom, sd, sat, mni, brx, doi, ks |
| Licencia | Apache 2.0 (tablas de transformacion tambien bajo Unicode License V3) |
| Formato de pesos | ficheros de tokenizador para transformers (configuracion + loader); paquete Python indic-shift con ficheros verificados por sha256 |

## Arquitectura y entrenamiento

El tokenizador combina un paso de normalizacion reversible con BPE a nivel de byte. La transformacion asigna a las escrituras brahmicas un unico alfabeto de simbolos compartido y anade un marcador que identifica la escritura activa; los digitos decimales de todas las escrituras comparten tambien diez simbolos. Sobre ese texto transformado se entrena BPE, de forma que las merges aprendidas sirven simultaneamente para varias lenguas con escrituras distintas. La decodificacion aplica la transformacion inversa y recupera el texto Unicode original de forma exacta para cualquier cadena.

El vocabulario resultante tiene 131.072 ids. La version de 262.144 ids es una extension directa: los primeros 131.072 ids, las primeras merges y la transformacion son identicas. No se han publicado en la informacion disponible datos sobre el corpus de entrenamiento, el numero de tokens utilizados ni la composicion del dataset.

Una regla operativa destacable es la "leading-space rule": cada llamada a encode constituye un unico tramo de texto y el tokenizador anade un espacio delante de un tramo que empieza por espacio o por una letra de una escritura que separa palabras con espacios. Por ello debe codificarse el documento entero, o cada fragmento entre tokens de control del modelo por separado. La decodificacion es con estado: la escritura activa y el espacio inicial se arrastran desde el inicio del tramo, de modo que trozos de ids decodificados por separado no reconstruyen el texto correcto; para salida token a token debe usarse `StreamDecoder`.

## Capacidades

- Tokenizacion byte-level BPE con cobertura de 23 idiomas: ingles, hindi, bengali, tamil, telugu, marathi, gujarati, kannada, malayalam, urdu, nepali, oriya, punyabi, asames, sanscrito, maithili, konkani, sindhi, santali, manipuri, bodo, dogri y cachemiro.
- Script sharing reversible entre escrituras brahmicas, con restauracion exacta del texto original en la decodificacion.
- Ausencia de tokens desconocidos: cualquier cadena Unicode se codifica y se recupera sin perdida.
- Soporte de codigo fuente y de texto en ingles junto a las lenguas indic.
- Gestion de digitos decimales de todas las escrituras mediante diez simbolos compartidos.
- Decodificacion en streaming mediante `StreamDecoder` (`tok.stream_decoder()`).
- Sin tokens especiales por defecto: no anade BOS ni EOS; los tokens anadidos con `add_special_tokens` reciben ids posteriores al vocabulario.
- Compatibilidad con `transformers` mediante `AutoTokenizer` con `trust_remote_code=True`, o mediante la clase `indic_shift.hf.IndicShiftTokenizer` sin ejecutar codigo del repositorio.
- No soporta offsets (`return_offsets_mapping` no esta implementado).

## Casos de uso

- Entrenamiento de modelos de lenguaje para lenguas indic: al compartir simbolos entre escrituras, el vocabulario rinde mas por token y reduce el coste de embedding en modelos pequenos o con presupuesto de latencia ajustado, que es el publico objetivo de la variante de 131K.
- Traduccion automatica entre lenguas indic e ingles: la tokenizacion consistente de escrituras brahmicas facilita que un mismo modelo comparta representaciones entre pares como hindi-bengali o tamil-telugu sin duplicar piezas de palabra.
- Procesamiento de documentos administrativos multilingues de la India: el tokenizador cubre las 22 lenguas programadas, lo que permite indexar y procesar formularios, notificaciones y expedientes en una unica pipeline.
- Busqueda y recuperacion de informacion (RAG) sobre corpus indic: la ausencia de tokens desconocidos y la decodificacion exacta garantizan que los fragmentos recuperados se devuelvan sin corrupcion de caracteres.
- Generacion de codigo con comentarios en lenguas indic: al soportar codigo fuente e ingles junto a las lenguas indic, un mismo tokenizador sirve para asistentes de programacion que atienden a desarrolladores de la region.
- Sustitucion de tokenizadores genericos en modelos existentes de baja latencia: la variante de 131K encaja en modelos pequenos o en despliegues con requisitos estrictos de tiempo de respuesta, y su compatibilidad de ids con la variante de 262K permite migrar sin recodificar.
- Investigacion sobre tokenizacion multilingue: la transformacion reversible y el script sharing constituyen un caso de estudio reproducible para medir el ahorro de vocabulario frente a tokenizadores BPE convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM para inferencia: es un tokenizador, no un modelo de parametros. El coste en memoria es el de la tabla de vocabulario (131.072 ids) y las tablas de transformacion, del orden de megabytes.
- No requiere GPU: la codificacion y decodificacion se ejecutan en CPU.
- El coste de CPU por token es el de un BPE byte-level estandar mas el paso de transformacion reversible; no se han publicado cifras de throughput ni de latencia.
- Despliegue mediante la libreria `transformers` (`AutoTokenizer` con `trust_remote_code=True`) o mediante el paquete `indic-shift` de PyPI, cuyo uso se recomienda en produccion para fijar la version del loader con `revision="v1.0.0"`.
- Para servir con decodificacion token a token es necesario usar `StreamDecoder` o un detokenizador con ventana que respete su semantica de estado.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Idiomas indic | Script sharing | Licencia |
|---|---|---|---|---|
| chariot-ai/indic-shift-131k | 131.072 ids | 22 lenguas programadas + ingles | Si, reversible | Apache 2.0 |
| chariot-ai/indic-shift-262k | 262.144 ids | 22 lenguas programadas + ingles | Si, reversible | Apache 2.0 |
| Tokenizadores BPE genericos de modelos multilingues | variable | cobertura parcial | no disponible | segun modelo |

No se dispone en la informacion proporcionada de datos de rendimiento comparado frente a tokenizadores alternativos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a instrucciones; solo tokeniza y detokeniza.
- Requiere `trust_remote_code=True` en `transformers`; sin ello la carga falla deliberadamente en lugar de devolver ids incorrectos. Para evitarlo, usar la clase del paquete `indic_shift`.
- La decodificacion es con estado: decodificar por separado trozos de ids de una misma secuencia no reconstruye el texto correcto. Es un riesgo real en stacks de serving con detokenizadores de ventana propios.
- No soporta offsets (`return_offsets_mapping`), lo que limita su uso en tareas de etiquetado a nivel de caracter o span.
- No anade tokens especiales por defecto; los tokens anadidos reciben ids posteriores al vocabulario y el texto entre ellos se codifica y decodifica por tramos independientes.
- La regla del espacio inicial exige codificar el documento entero o cada fragmento entre tokens de control por separado; ignorarla produce texto con espacios incorrectos.
- La cobertura linguistica se limita a las lenguas indic listadas, ingles y codigo; no se documenta soporte para otras familias linguisticas.
- La licencia Apache 2.0 permite uso comercial, pero las tablas de transformacion derivadas de la Unicode Character Database quedan tambien cubiertas por la Unicode License V3, cuyos terminos deben respetarse.
- No se han publicado datos sobre sesgos, tasas de alucinacion ni evaluaciones de calidad, ya que estos dependen del modelo que use el tokenizador.

## Enlaces

- Hugging Face: https://huggingface.co/chariot-ai/indic-shift-131k
- Variante de 262K: https://huggingface.co/chariot-ai/indic-shift-262k
- GitHub: https://github.com/Chariot-AI/indic-shift
- Especificacion: https://github.com/Chariot-AI/indic-shift/blob/main/SPEC.md
- Paquete PyPI: https://pypi.org/project/indic-shift/
