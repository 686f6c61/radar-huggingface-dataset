# chorcat/rukh-tokenizer

## Resumen

Rukh tokenizer es un conjunto de tokenizadores para partidas de ajedrez, publicado en Hugging Face por el usuario `chorcat` (0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion el 19 de septiembre de 2026). No es un modelo de lenguaje: es el componente de tokenizacion del proyecto Rukh, un modelo de lenguaje de ajedrez construido desde cero cuyo codigo vive en `github.com/borja-glez/rukh`. Su relevancia esta en que documenta y fija un vocabulario especifico de dominio para ajedrez, en lugar de reutilizar un tokenizador BPE generalista, y lo hace con dos implementaciones independientes (Python en `rukh` y TypeScript en `rukh-web` / `rukh-lab`) que deben producir exactamente los mismos ids.

El repositorio define tres esquemas que codifican la misma partida. El esquema por defecto es un vocabulario UCI fijo de 2030 entradas (version 1), construido por enumeracion determinista y no aprendido de datos: 62 tokens especiales, 1968 movimientos y ninguna pieza aprendida. Los otros dos son un alfabeto de 32 caracteres para movetext SAN y un BPE entrenado con la libreria `tokenizers` de Hugging Face sobre jugadas UCI concatenadas sin espacios.

El interes practico para un desarrollador es doble. Por un lado, el vocabulario fijo elimina la fragmentacion de jugadas (cada movimiento es un unico id) y reduce el espacio de embedding a 2030 entradas. Por otro, al estar implementado dos veces y acompanado de un fixture con 20 partidas codificadas en los tres esquemas, sirve como prueba de paridad entre implementaciones. Los metadatos Elo se codifican en bins de 100 puntos, lo que permite condicionar el modelo por nivel de juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es una red neuronal. Tokenizador con tres esquemas: vocabulario UCI fijo por enumeracion, alfabeto de caracteres SAN y BPE entrenado con la libreria `tokenizers` de Hugging Face |
| Parametros totales | No aplica (0 parametros aprendidos; el BPE aprende fusiones, no pesos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. El esquema UCI trunca la partida a `max_len = 200` ids por defecto; no es una ventana de atencion |
| Tipos de cuantizacion | No aplica (los artefactos son JSON en texto plano) |
| Idiomas soportados | `en` (etiqueta declarada en la model card). El contenido es notacion de ajedrez UCI y SAN, no lenguaje natural |
| Licencia | CC0-1.0 (dominio publico, sin restricciones declaradas para uso comercial) |
| Formato de pesos | No aplica: no hay pesos. Artefactos en JSON: `vocab.json`, `bpe.json` y `fixtures/games.json` |
| Tamano del vocabulario UCI fijo | 2030 entradas (version 1) |
| Desglose del vocabulario UCI | 62 tokens especiales + 1968 movimientos (1792 movimientos de dama o caballo `from`+`to` + 176 promociones `from`+`to`+pieza) |
| Tokens especiales (ids 0-7) | `<pad>`=0, `<bos>`=1, `<eos>`=2, `<mask>`=3, `<unk>`=4, `<1-0>`=5, `<0-1>`=6, `<1/2>`=7 |
| Bins de Elo (ids 8-61) | 27 bins por color, de 600 a 3200 en pasos de 100: `<w0600>`...`<w3200>` (ids 8-34) y `<b0600>`...`<b3200>` (ids 35-61) |
| Mapeo de Elo a bin | `min(max(elo, 600), 3299) // 100 * 100`, formateado con cuatro digitos |
| Formato de partida (UCI) | `[<bos>, <wXXXX>, <bXXXX>, movimientos..., <resultado>, <eos>]` |
| Tamano del vocabulario SAN char-level | 35 entradas: 3 especiales (`<pad>`, `<bos>`, `<eos>`) + 32 caracteres del alfabeto `" #+-.0123456789=BKNOQRabcdefghx/"` |
| Tamano del vocabulario BPE | No disponible (el `vocab_size` usado en el entrenamiento no se especifica en la informacion proporcionada) |
| Implementaciones | Python en `rukh` y TypeScript en `rukh-web` / `rukh-lab`; el fixture actua como prueba de paridad |

## Arquitectura y entrenamiento

El esquema principal no tiene entrenamiento: `vocab.json` es una enumeracion determinista. Los cuadrados se ordenan por columna (`a1, a2, ..., a8, b1, ..., h8`, con indice `file * 8 + rank`). A continuacion se anaden los movimientos: para cada casilla de origen en ese orden y cada destino distinto alcanzable por una dama (misma columna, fila o diagonal) o por un caballo, se genera la cadena `from`+`to`, lo que produce 1792 entradas. Despues se anaden las promociones: para cada origen en la fila 7 (blancas) y luego en la fila 2 (negras), cada destino en la fila 8 (o 1 segun el color) con `|Δfile| <= 1` y cada pieza en `q, r, b, n` se genera `from`+`to`+pieza, 176 cadenas. El total de movimientos es 1968 y, sumado a los 62 tokens especiales (resultados, Elo y tokens de control), el vocabulario alcanza las 2030 entradas.

Los otros dos esquemas si implican procesamiento o entrenamiento. El SAN char-level usa un alfabeto fijo de 32 caracteres sobre el movetext numerado sin comentarios, seguido de un espacio y el resultado, y envuelve la secuencia entre `<bos>` y `<eos>`; cualquier caracter fuera del alfabeto es un error. El BPE se entrena con `models.BPE(unk_token="<unk>")`, `pre_tokenizers.WhitespaceSplit()`, `trainers.BpeTrainer(vocab_size, special_tokens=<los 8 especiales>)`, sin normalizador, sin decodificador, sin prefijo de subpalabra continuada y sin sufijo de fin de palabra. El texto de una partida son sus jugadas UCI concatenadas sin espacios (`e2e4e7e5g1f3...`), de modo que la partida entera es una sola "palabra" y el BPE puede fusionar aperturas completas en un unico token; el espacio en blanco solo separa partidas cuando se pasan varias en un mismo texto. Los ids se obtienen con `Tokenizer.encode(text).ids`, sin anadir `<bos>` ni `<eos>`.

La decodificacion del esquema UCI concatena los tokens y vuelve a trocear la cadena en movimientos de cuatro caracteres mas una letra de promocion opcional. Como `b` es simultaneamente nombre de columna y de pieza, el `decode` de Python reproduce la partida con `python-chess` para distinguir `e7e8b` (promocion) de `e7e8 b8c6`. El fixture `fixtures/games.json` contiene 20 partidas con `id`, `white_elo`, `black_elo`, `result`, `uci`, `san` y los tres vectores de ids (`uci_ids`, `san_ids`, `bpe_ids`), procedentes de `tests/fixtures/games.pgn` del repositorio `rukh`, y cubre enroques por ambos flancos, promociones (incluida una subpromocion a caballo), capturas al paso, capturas con jaque, una partida de 4 plies, una partida de mas de 200 plies (que fuerza el recorte por `max_len`) y los tres resultados posibles.

## Capacidades

- Codificacion de jugadas en notacion UCI con un vocabulario fijo de 1968 movimientos, donde cada movimiento legal estandar ocupa un unico id.
- Codificacion de metadatos por color mediante bins de Elo de 100 puntos entre 600 y 3200, con 27 bins para blancas y 27 para negras.
- Codificacion del resultado de la partida mediante los tokens `<1-0>`, `<0-1>` y `<1/2>`.
- Truncado determinista a `max_len` ids (200 por defecto): si la partida completa cabe, la secuencia termina en `<eos>`; si no, se recorta a los primeros `max_len` ids.
- Mapeo de movimientos ausentes en el vocabulario al token `<unk>` (id 4).
- Codificacion a nivel de caracter del movetext SAN numerado, con alfabeto cerrado de 32 simbolos y validacion estricta (un caracter fuera del alfabeto provoca error).
- Codificacion BPE sobre texto UCI sin espacios, capaz de agrupar aperturas frecuentes en un solo token; las fusiones aprendidas mas largas se listan en `tokenizer-stats.json`.
- Decodificacion de secuencias UCI a jugadas, con desambiguacion de promociones apoyada en `python-chess` en la implementacion de Python.
- Reproduccion manual de la codificacion BPE sin la libreria: dividir por espacios, partir cada palabra en caracteres y aplicar repetidamente la fusion adyacente con el rango mas bajo en `model.merges`, consultando los ids en `model.vocab`; un caracter ausente se convierte en `<unk>`.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, vision, audio, thinking mode ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Preentrenamiento de un modelo de lenguaje de ajedrez desde cero: `vocab.json` define la capa de embedding y de salida con 2030 entradas, lo que reduce el espacio de embedding frente a un vocabulario BPE generalista de decenas de miles de tokens y evita fragmentar cada jugada en varios subtokens.
- Modelado condicionado por nivel de juego: los tokens `<wXXXX>` y `<bXXXX>` permiten entrenar o evaluar un modelo que reciba el Elo de ambos jugadores, util para estudiar como varia el estilo de juego entre 600 y 3200 puntos y para generar partidas a un nivel objetivo.
- Conversion de bases de datos PGN a tensores de entrenamiento: el esquema UCI produce secuencias de longitud acotada (200 ids) y de alfabeto reducido, lo que simplifica el empaquetado en lotes y el calculo de la perdida por jugada.
- Pruebas de paridad entre implementaciones Python y TypeScript: `fixtures/games.json` incluye los ids esperados de los tres esquemas para 20 partidas con casos limite (enroques, promociones, al paso, jaques, partida de 4 plies y partida de mas de 200 plies), de modo que cualquier discrepancia entre `rukh` y `rukh-web`/`rukh-lab` se detecta de inmediato.
- Analisis de aperturas y deteccion de lineas frecuentes: el BPE entrenado sobre UCI sin espacios puede aprender aperturas completas como un unico token, lo que permite medir frecuencias de apertura o alimentar modelos con presupuesto de contexto muy reducido.
- Investigacion sobre eficiencia de tokenizacion en dominios cerrados: al disponer de tres esquemas sobre el mismo corpus (2030 entradas fijas, 35 caracteres y BPE de tamano no especificado), se puede comparar perplejidad por jugada, longitud media de secuencia y coste de embedding entre enfoques.
- Herramientas didacticas y visores web: el alfabeto SAN de 32 caracteres es trivial de renderizar y de depurar en el navegador, y la codificacion conserva el texto algebraico legible, lo que facilita interfaces de analisis de partidas.
- Gestion de partidas largas en produccion: el parametro `max_len` documenta explicitamente el comportamiento de truncado, lo que permite decidir si se recorta la partida o se segmenta en fragmentos antes de alimentar un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Al no ser un modelo de lenguaje, metricas como MMLU, HumanEval o GSM8K no son aplicables. Los unicos datos cuantitativos publicados son de construccion del tokenizador:

| Metrica de construccion | Valor |
|---|---|
| Entradas del vocabulario UCI fijo (version 1) | 2030 |
| Tokens especiales de control | 8 (ids 0-7) |
| Bins de Elo | 54 (27 por color, ids 8-61) |
| Movimientos de dama o caballo | 1792 |
| Promociones | 176 |
| Movimientos totales | 1968 |
| Primer id de movimiento | 62 |
| Tamano del alfabeto SAN char-level | 32 caracteres (ids 3-34), 35 entradas con los 3 especiales |
| Partidas del fixture de paridad | 20 |
| Tokens maximos por partida en el esquema UCI | 200 (por defecto) |

## Requisitos de hardware

- El tokenizador en si no requiere GPU ni VRAM: son ficheros JSON procesados en CPU y la logica de codificacion es manipulacion de cadenas y busquedas en diccionarios.
- No se dispone del tamano exacto de `vocab.json` ni de `bpe.json` en la informacion proporcionada; por el numero de entradas (2030 y el tamano BPE no especificado) se trata de artefactos de pocos cientos de kilobytes.
- Los requisitos reales de memoria los impone el modelo que consuma los ids. Estimacion de la capa de embedding para un vocabulario de 2030 entradas (calculada a partir de la formula `vocab * d_model * 2 bytes` en fp16; el modelo Rukh no publica su `d_model`):

| `d_model` del modelo consumidor | Parametros de embedding (vocab 2030) | Memoria en fp16 |
|---|---|---|
| 256 | 519.680 | ~1,0 MB |
| 512 | 1.039.360 | ~2,1 MB |
| 1024 | 2.078.720 | ~4,2 MB |
| 2048 | 4.156.160 | ~8,3 MB |

- Para comparar: un vocabulario BPE de 50 000 entradas con `d_model = 512` ocupa 25,6 millones de parametros (~51 MB en fp16) solo en la capa de embedding, frente a los ~2,1 MB del vocabulario UCI fijo.
- Si el modelo consumidor no ata (tie) la capa de salida a la de entrada, la memoria se duplica.
- GPU recomendadas: no aplica al tokenizador. Para el modelo que lo use, la eleccion depende de su numero de parametros, dato no disponible.
- Despliegue: cualquier entorno con Python 3 y la libreria `tokenizers` de Hugging Face, o una reimplementacion propia. vLLM, llama.cpp, Ollama o TGI no son aplicables al tokenizador, aunque podrian usarse para servir el modelo que lo emplee.
- Latencia y throughput: no se han publicado mediciones. Al no haber inferencia neuronal, la codificacion es una operacion en CPU dependiente de la implementacion.

## Comparativa con modelos similares

No se han identificado en la informacion disponible tokenizadores externos comparables con nombre y datos verificables, por lo que la comparativa se limita a los tres esquemas que incluye este mismo repositorio.

| Criterio | Esquema 1: UCI fijo (`vocab.json`) | Esquema 2: SAN char-level | Esquema 3: BPE (`bpe.json`) |
|---|---|---|---|
| Tamano de vocabulario | 2030 | 35 | No disponible |
| Origen del vocabulario | Enumeracion determinista, no aprendida | Alfabeto fijo | Aprendido con `tokenizers` sobre UCI sin espacios |
| Granularidad | Un id por movimiento | Un id por caracter | Un id por fusion BPE |
| Metadatos Elo | Si (`<wXXXX>`, `<bXXXX>`, 27 bins por color) | No | No |
| Token de resultado | Si (`<1-0>`, `<0-1>`, `<1/2>`) | Si, como caracteres del texto | No |
| `<bos>` / `<eos>` | Si | Si | No (los ids se devuelven sin envolver) |
| Truncado | Si, `max_len` (200 por defecto) | No documentado | No documentado |
| Legibilidad humana | Baja | Alta | Media |
| Uso principal declarado | Esquema por defecto del modelo Rukh | Analisis y variante alternativa | Fusion de aperturas frecuentes en un token |
| Implementacion | Python y TypeScript (paridad via fixture) | No especificada | Depende de la libreria `tokenizers` |

Frente a alternativas genericas de la industria (tokenizadores BPE multilingues tipo GPT o Llama), la diferencia estructural es el tamano del vocabulario (2030 frente a decenas o cientos de miles) y la ausencia de fragmentacion de movimientos, a costa de perder generalidad fuera del dominio de ajedrez.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a instrucciones y no soporta tool calling ni agentes.
- El vocabulario UCI cubre movimientos legales del ajedrez estandar (incluidos enroques codificados como movimiento de rey, promociones y subpromociones), pero variantes como Chess960 o Crazyhouse no tienen representacion y caerian en `<unk>`.
- El truncado por defecto a 200 ids descarta informacion en partidas largas; en el fixture se incluye deliberadamente una partida de mas de 200 plies para ejercitar ese recorte.
- El mapeo de Elo a bins pierde precision por diseno (pasos de 100 puntos) y satura fuera del rango [600, 3200): cualquier valor inferior o igual a 600 cae en el bin 0600 y cualquier valor superior a 3299 en el bin 3200.
- El BPE no anade `<bos>` ni `<eos>` y la model card no declara normalizador ni decodificador, por lo que requiere post-procesado explicito antes de alimentar un modelo.
- La decodificacion del esquema UCI no es ambigua en teoria, pero resolver la letra `b` (columna frente a pieza) exige reproducir la partida con `python-chess`; la implementacion en TypeScript debe replicar esa logica o producira decodificaciones incorrectas.
- La etiqueta de idioma es `en` y el contenido es notacion de ajedrez; no hay capacidades multilingues ni de lenguaje natural.
- Versionado: `vocab.json` declara `version: 1`. Si el vocabulario cambia en el futuro, los ids dejaran de ser compatibles y un modelo entrenado con una version no podra intercambiar secuencias con otra sin remapear.
- Estado del repositorio: 0 descargas, 0 likes y fechas de creacion y actualizacion identicas (19 de septiembre de 2026), es decir, sin validacion comunitaria ni historial de mantenimiento observable.
- Licencia CC0-1.0: no impone restricciones conocidas para uso comercial, pero tampoco ofrece garantias de ningun tipo sobre el contenido.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este tokenizador (solo articulos de soporte de Windows), por lo que no hay verificacion externa, publicaciones ni demos adicionales.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/chorcat/rukh-tokenizer
- Repositorio del proyecto Rukh (modelo de lenguaje de ajedrez desde cero): https://github.com/borja-glez/rukh
- Implementaciones en TypeScript mencionadas: `rukh-web` y `rukh-lab` (sin URL disponible en la informacion proporcionada)
- Fixture de paridad: `fixtures/games.json` dentro del repositorio de Hugging Face
- Estadisticas de tokenizacion: `tokenizer-stats.json` (mencionado en la model card, sin URL directa disponible)
- Papers, blogs, demos y modelos comparables: no disponible
