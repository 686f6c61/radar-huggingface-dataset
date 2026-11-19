# egeboy35/mret-128k

## Resumen

MRET 128K es un tokenizador para turco desarrollado por el usuario egeboy35 y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje: el repositorio contiene únicamente los ficheros del tokenizador (vocabulario y configuración), sin pesos de red neuronal. Su vocabulario es de 131.072 tokens y emplea un modelo de tipo unigram con pre-tokenización a nivel de byte. Forma parte de una familia de tres tamanos (MRET 32K, MRET 64K y MRET 128K) descritos por el autor con la misma metodologia.

El problema que aborda es la fragmentacion excesiva del turco en tokenizadores multilingues genericos, un idioma aglutinante donde las palabras se forman por concatenacion de morfemas. La propuesta del autor es un tokenizador sin perdida (lossless): cualquier texto de entrada se decodifica byte a byte y nunca se emite el token `<unk>`. Ademas, el tokenizador no normaliza el texto, de modo que la representacion de entrada se preserva integra.

La relevancia es practica para quien entrene o adapte modelos de lenguaje en turco: un tokenizador mas eficiente reduce el numero de tokens por documento, lo que se traduce en menor coste computacional y mayor longitud efectiva de contexto para un mismo presupuesto de tokens. El autor reporta ventajas medibles en compresion, F1 morfologico y precision de raiz frente a otros tokenizadores de la clase 128K, si bien algunas metricas de compresion estan lideradas por tokenizadores con perdida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador unigram con pre-tokenizador a nivel de byte |
| Parametros totales | no disponible (no es un modelo neuronal; solo tokenizador) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ficheros de tokenizador de Hugging Face (tokenizer.json, tokenizer_config.json, config.json); sin pesos de modelo |
| Tamano de vocabulario | 131.072 tokens |
| Tokens especiales | ids 0-3: `<pad>`, `<unk>`, `<s>`, `</s>`; ids 4-7: roles de chat; ids 8-10: herramientas; ids 11-14: FIM; ids 15-71: reservados |
| Plantilla de chat | incluida (requiere `jinja2`) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El tokenizador combina una pre-tokenizacion a nivel de byte con un modelo unigram de segmentacion flexible. La pre-tokenizacion trata como piezas independientes los sufijos tras apostrofo (por ejemplo, "Türkiye" + "'nin"), mantiene enteros los numeros de cuatro digitos (anos), divide los numeros mas largos en grupos de tres y agrupa las secuencias de puntuacion en una sola pieza. Los numeros con separadores se tratan como una unica pieza ("12.03.2024", "14:30", "%45,5", "1.250,75", "1923-1938"). El vocabulario garantiza la presencia de los anos 1900-2050, los numeros 0-999 y las piezas `.d`, `.dd`, `,d`, `,dd`, `:00`-`:59` y `%0`-`%100`.

La segmentacion unigram es flexible: una palabra recibe el minimo numero de tokens salvo que un token adicional coloque una frontera en un limite de morfema cuyo valor supere el coste de ese token extra (1,5 para este tamano). Los pesos de los tokens se entrenaron sobre analisis morfologicos de Zeyrek mapeados a las convenciones de TrMorph. Las palabras que aparecen 50 o mas veces en una muestra de conteo de 300 millones de palabras y que constituyen un unico token se mantienen como token unico. El autor no detalla en la informacion disponible la composicion exacta del corpus de entrenamiento ni el numero total de tokens procesados.

## Capacidades

- Tokenizacion sin perdida: toda entrada se decodifica de vuelta byte a byte y nunca se produce `<unk>`.
- Sin normalizacion de texto: la representacion de entrada se conserva integra.
- Pre-tokenizacion a nivel de byte con tratamiento especifico de apostrofos, numeros, fechas, horas, porcentajes, telefonos y rangos de anos.
- Plantilla de chat integrada con roles `system`, `user`, `assistant` y `tool`.
- Soporte de definiciones de herramientas mediante bloque `<|tools|>` y de llamadas a herramientas con `<|tool_call|>`.
- Soporte de entrenamiento fill-in-the-middle mediante los tokens `<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>` y `<|fim_pad|>`.
- Segmentacion sensible a la morfologia del turco, con pesos entrenados sobre analisis de Zeyrek y TrMorph.
- Capacidad de proteccion frente a inyeccion de roles: codificando con `add_special_tokens=False` y `split_special_tokens=True` los textos no confiables se tratan como texto plano.

## Casos de uso

- Preentrenamiento de modelos de lenguaje en turco: al reducir el numero de tokens por documento (187,6 tokens por 1.000 caracteres en el promedio de cuatro dominios segun el autor), permite procesar mas texto con el mismo presupuesto de computo y amplia la longitud efectiva de contexto.
- Ajuste fino de modelos instruct en turco: la plantilla de chat incluida con roles y tokens de fin de turno (`<|end|>`, id 7) simplifica la construccion de datasets conversacionales sin definir un formato propio.
- Construccion de pipelines de agentes y tool calling: los tokens `<|tools|>`, `<|tool_call|>` y el rol `tool` permiten serializar definiciones de herramientas, llamadas y resultados de forma consistente dentro de la secuencia.
- Entrenamiento de modelos de autocompletado de codigo o texto: los tokens FIM permiten plantear tareas de relleno en medio de secuencia sin disenar marcadores ad hoc.
- Procesamiento de documentos administrativos y legales turcos: el tratamiento de fechas, horas, importes, porcentajes y numeros con separadores como piezas unicas reduce la fragmentacion en dominios con alta densidad numerica.
- Analisis morfologico y linguistico computacional: la segmentacion alineada con fronteras de morfema y la cobertura de raices facilitan tareas de analisis y etiquetado morfologico en turco.
- Normalizacion de datos antes de entrenamiento: la advertencia del autor sobre el coste de la forma NFD (dos a tres veces mas tokens) permite detectar y corregir datos mal normalizados convirtiendolos a NFC.

## Benchmarks y rendimiento

El autor publica resultados sobre el split de test de su corpus, evaluados con las metricas del informe "Türkçe Tokenizer Karşılaştırma" (13 de noviembre de 2026). Las columnas de compresion son tokens por 1.000 caracteres (menor es mejor). La tabla siguiente recoge los datos disponibles en la informacion proporcionada; la fila de RK-128k aparece truncada en el material de origen.

| Tokenizador | 4 dominios ↓ | Informal ↓ | 46 dominios ↓ | Round trip % ↑ | Vocab usado % ↑ | F1 morf. ↑ | Precision raiz ↑ | Formatos ↓ |
|---|---|---|---|---|---|---|---|---|
| MRET 128K | 187,6 | 197,2 | 192,4 | 100,0 | 37,06 | 58,77 | 64,50 | 3,28 |
| NC-128k | 194,9 | 198,6 | 199,1 | 100,0 | 36,08 | 57,28 | 58,00 | 4,56 |
| TR-BPE-128k | 199,7 | 205,3 | 202,9 | 100,0 | 35,72 | 49,13 | 49,52 | 4,29 |
| RK-128k | 209,6 | 213 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Segun el autor, entre los tokenizadores sin perdida de la clase 128K, MRET 128K obtiene el menor numero de tokens en todas las columnas de compresion del texto de test, y lidera en F1 morfologico y precision de raiz. El autor senala ademas que en algunas columnas de compresion hay tokenizadores con perdida (que no reconstruyen el texto exactamente) por delante. No se han publicado resultados de benchmarks de modelos de lenguaje en la informacion disponible, dado que el repositorio no contiene pesos.

## Requisitos de hardware

- No requiere GPU: es un tokenizador y se ejecuta en CPU.
- Huella en disco y memoria reducida: unicamente ficheros de vocabulario y configuracion de 131.072 entradas; el peso exacto no se detalla en la informacion disponible.
- Dependencias: `transformers` para la carga con `AutoTokenizer`; `jinja2` para usar la plantilla de chat.
- Despliegue: puede integrarse en cualquier pipeline que use la libreria `transformers`, incluidos servidores de inferencia que apliquen plantillas de chat (TGI, vLLM) siempre que el modelo asociado se entrene con este vocabulario.
- Latencia y throughput: no disponibles; dependen del hardware y del volumen de texto, y no se publican mediciones.
- No cabe la comparacion con requisitos de VRAM de un modelo, ya que no hay pesos neuronales en el repositorio.

## Comparativa con modelos similares

Comparacion con otros tokenizadores turcos de la clase 128K citados por el autor:

| Tokenizador | Vocabulario | Tipo | Sin perdida | Licencia | Compresion 4 dominios ↓ | F1 morf. ↑ |
|---|---|---|---|---|---|---|
| MRET 128K | 131.072 | Unigram, byte-level | Si | Apache 2.0 | 187,6 | 58,77 |
| NC-128k | 128K | no disponible | Si | no disponible | 194,9 | 57,28 |
| TR-BPE-128k | 128K | BPE | Si | no disponible | 199,7 | 49,13 |
| RK-128k | 128K | no disponible | no disponible | no disponible | 209,6 | no disponible |

La familia MRET incluye ademas MRET 32K y MRET 64K, con vocabularios menores y la misma metodologia, utiles cuando se prioriza un vocabulario mas pequeno frente a la maxima compresion.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni tiene pesos; solo tokeniza. Cualquier uso generativo requiere entrenar o adaptar un modelo con este vocabulario.
- Solo cubre turco: no se reporta soporte para otros idiomas, por lo que su uso en contextos multilingues puede degradar la compresion.
- El texto en forma descompuesta (NFD) cuesta entre dos y tres veces mas tokens; es necesario convertir los datos a NFC antes de usarlo.
- La codificacion simple no anade `<s>` ni `</s>`; el autor indica que los limites de documento deben anadirse manualmente en el preentrenamiento.
- Riesgo de inyeccion de roles: por defecto, las cadenas `<|user|>` o `<s>` dentro de texto plano se convierten en tokens especiales. Para texto no confiable debe usarse `add_special_tokens=False` y `split_special_tokens=True`.
- El token de parada recomendado para generacion es `<|end|>` (id 7); `</s>` esta pensado para preentrenamiento, y confundirlos puede truncar o alargar las respuestas.
- Las metricas de compresion estan calculadas sobre el corpus del propio autor y con ejemplos sinteticos de formatos que tambien se usaron para elegir la configuracion, lo que puede favorecer al tokenizador en esas columnas.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no consta validacion independiente fuera de las metricas del autor.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos de modelo no se aplican restricciones adicionales de modelo; las condiciones del modelo que se entrene con este vocabulario dependeran de ese modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/egeboy35/mret-128k
- MRET 32K: https://huggingface.co/egeboy35/mret-32k
- MRET 64K: https://huggingface.co/egeboy35/mret-64k
- Tokenizador NC-128k: https://huggingface.co/nesicn/nc-turkce-bpe-128k
- Tokenizador TR-BPE-128k: https://huggingface.co/canbingol/tr-bpe-fineweb-alan30-128k
- Tokenizador RK-128k: https://huggingface.co/rabiskrl/rk-tr-tokenizer-128k
- Dataset de analisis morfologico turco: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
