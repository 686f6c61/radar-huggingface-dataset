# coderian/scribe-tok-50k

## Resumen

scribe-tok-50k es un tokenizer de codificacion por pares de bytes (BPE) con un vocabulario de 50.004 tokens, entrenado desde cero sobre 2.000.000 de lineas de texto limpio en ingles procedente de libros. Lo publica el usuario coderian en HuggingFace bajo licencia MIT y se distribuye con la libreria `tokenizers`, por lo que no es un modelo de lenguaje sino el componente de tokenizacion que estos necesitan para convertir texto en secuencias de identificadores.

El objetivo declarado por el autor es servir a experimentacion, aprendizaje y modelos de lenguaje pequenos o medianos que necesiten un vocabulario compacto entrenado desde cero, en lugar de reutilizar un tokenizer de produccion de gran tamano. El vocabulario se construye con 49.928 fusiones BPE, frecuencia minima de 2, pre-tokenizador de espacios en blanco, sin normalizador y sin decoder configurado.

Su relevancia actual es acotada pero clara: los tokenizers determinan el coste computacional, la longitud efectiva de contexto y el comportamiento multilingue o de codigo de cualquier modelo. Disponer de un tokenizer BPE reproducible, con pipeline de entrenamiento publicado en GitHub y corpus identificado, lo hace util para estudios de ablacion sobre vocabulario, prototipos de modelos pequenos y docencia sobre pipelines de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE (byte-pair encoding) sobre texto plano, sin capa neuronal |
| Parametros totales | no aplica (es un tokenizer, no un modelo con pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (determina la longitud en tokens, no la ventana del modelo) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (solo ingles; el autor advierte rendimiento pobre en otros idiomas, codigo y texto social/web) |
| Licencia | MIT |
| Formato de pesos | `tokenizer.json` (serializacion de la libreria `tokenizers`) |
| Tamano de vocabulario | 50.004 tokens |
| Numero de fusiones (merges) | 49.928 |
| Pre-tokenizador | Whitespace |
| Normalizador | ninguno |
| Decoder | ninguno |
| Frecuencia minima | 2 |
| Tokens especiales | `[PAD]`=0, `[UNK]`=1, `[BOS]`=2, `[EOS]`=3 |
| Corpus de entrenamiento | `kd13/bookcorpus-clean` (2.000.000 de lineas, ~151 MB) |
| Libreria de entrenamiento | `tokenizers` 0.23.2 / `transformers` 5.17.0 |

## Arquitectura y entrenamiento

Tecnicamente no hay arquitectura neuronal: se trata de un algoritmo BPE clasico implementado con la libreria `tokenizers`. El pipeline parte de un `Tokenizer(BPE(unk_token="[UNK]"))` con pre-tokenizador `Whitespace`, sin normalizacion ni lowercasing, y un `BpeTrainer` configurado con `vocab_size=50_004`, `min_frequency=2` y la lista de tokens especiales `[PAD]`, `[UNK]`, `[BOS]`, `[EOS]`. El entrenamiento produce 49.928 fusiones, coherentes con el vocabulario final una vez descontados los tokens especiales y los caracteres base.

Los datos de entrenamiento son 2.000.000 de lineas (~151 MB) del dataset `kd13/bookcorpus-clean`, un corpus de libros en ingles ya limpiado. No hay fases de RLHF, DPO ni ajuste por instrucciones, ni innovaciones como decodificacion especulativa o atencion lineal, porque el artefacto no genera texto. Las decisiones de diseno destacables son la ausencia total de normalizacion (las variantes de mayusculas y minusculas son tokens distintos), el pre-tokenizado exclusivo por espacios (los tokens nunca incluyen espacios iniciales y la puntuacion se trata como token independiente) y la inexistencia de decoder, de modo que `decode` refleja el formato separado por espacios del corpus. El pipeline completo (streaming del corpus, entrenamiento y volcado a `tokenizer.json`) esta publicado en el repositorio de GitHub del autor.

## Capacidades

- Segmentacion de texto en ingles en subpalabras mediante BPE, con un vocabulario cerrado de 50.004 entradas.
- Codificacion y decodificacion a traves de la API estandar: `AutoTokenizer.from_pretrained("coderian/scribe-tok-50k")` en `transformers` o `Tokenizer.from_file("tokenizer.json")` en `tokenizers`.
- Gestion de tokens especiales de control para secuenciacion: `[PAD]`, `[UNK]`, `[BOS]` y `[EOS]`.
- Reutilizacion directa en pipelines de entrenamiento de modelos pequenos o medianos que acepten un vocabulario de ~50k entradas.
- Reproducibilidad: el script de entrenamiento y la configuracion estan publicados, de modo que el vocabulario puede regenerarse o modificarse (por ejemplo, cambiando `vocab_size` o `min_frequency`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: esas capacidades pertenecen al modelo que use el tokenizer, no al tokenizer.
- No dispone de capacidades de vision, audio, thinking mode ni multimodalidad.
- Cobertura multilingue: solo ingles; el autor advierte explicitamente de mal rendimiento en otros idiomas y en codigo.

## Casos de uso

- Entrenamiento de modelos de lenguaje pequenos desde cero: al tener un vocabulario de 50k entradas y un `tokenizer.json` ligero, encaja en prototipos de 10M a 500M de parametros donde un tokenizer de produccion de 128k o 150k entradas inflaria innecesariamente la matriz de embeddings.
- Docencia y aprendizaje de tokenizacion: el pipeline de tres scripts (`config.py`, `train.py`, `test.py`) permite explicar paso a paso como se construye un vocabulario BPE, desde el streaming del corpus hasta la comprobacion de tokens e identificadores.
- Experimentos de ablacion sobre vocabulario: investigadores pueden reentrenar el tokenizer cambiando `vocab_size` o `min_frequency` y medir el efecto en la longitud media de secuencia, la perplejidad y el coste de entrenamiento de un mismo modelo.
- Analisis de compresion y coste de contexto: permite medir cuantos tokens consume un texto ingles de libros respecto a tokenizers alternativos (GPT-2, cl100k_base) y estimar el impacto en la factura de inferencia o en la ventana util.
- Generacion de texto creativo de dominio especifico: si se ajusta un modelo sobre el mismo tipo de corpus (literatura en ingles), la distribucion de subpalabras del tokenizer esta alineada con ese registro, lo que reduce la fragmentacion de palabras poco frecuentes.
- Construccion de datasets tokenizados para preentrenamiento: puede usarse como paso previo para convertir un corpus de libros en un fichero de identificadores de tamano fijo, con `[BOS]` y `[EOS]` para delimitar documentos.
- Sistemas de recuperacion o clasificacion de texto en ingles: como componente de un pipeline clasico (TF-IDF sobre subpalabras, modelos lineales sobre bolsas de tokens) donde no se requiere un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de compresion (tokens por palabra o por caracter), comparaciones con otros tokenizers ni evaluaciones de fertilidad de vocabulario. El repositorio de HuggingFace registra 0 descargas y 0 likes en el momento de la consulta, y la busqueda web realizada no devolvio documentacion tecnica adicional: los resultados obtenidos eran irrelevantes (sitios de preguntas y respuestas en chino y paginas institucionales sin relacion con el artefacto).

## Requisitos de hardware

- Inferencia: no requiere GPU. Un tokenizer BPE se ejecuta en CPU y su coste es de microsegundos a milisegundos por frase, dominado por el pre-tokenizado y las fusiones.
- VRAM: no aplica (0 GB). El artefacto no contiene pesos.
- Memoria RAM: no se especifica el tamano del fichero `tokenizer.json` en la documentacion; un vocabulario BPE de 50.004 entradas suele ocupar unos pocos MB en disco y una decena de MB en memoria al cargarse, aunque este dato no esta confirmado por el autor.
- GPU recomendadas: no aplica. Cualquier maquina capaz de ejecutar Python 3 y la libreria `tokenizers` es suficiente; no se necesita A100, H100 ni RTX 4090 para el tokenizer en si.
- Despliegue: compatible con `transformers` (`AutoTokenizer`), con la libreria `tokenizers` de forma directa y con cualquier runtime que consuma `tokenizer.json` (incluidas las integraciones de `tokenizers` en Rust y Node). Es integrable como paso previo en `vLLM`, `TGI` o `llama.cpp` solo si el modelo asociado declara compatibilidad con este vocabulario, cosa que no ocurre por defecto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de codificacion.

## Comparativa con modelos similares

La comparacion natural es con otros tokenizers, no con modelos de lenguaje. Los valores de la columna de vocabulario para las alternativas corresponden a documentacion publica ampliamente conocida y se incluyen como referencia general, no como resultado de una evaluacion realizada aqui.

| Tokenizer | Vocabulario | Pre-tokenizado / normalizacion | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| coderian/scribe-tok-50k | 50.004 | Whitespace, sin normalizador ni decoder | en | MIT | Entrenado desde cero en 2M lineas de libros; pensado para experimentacion |
| GPT-2 BPE | 50.257 | Byte-level, con manejo de espacios | en (multilingue limitado) | MIT | Referencia clasica de tamano similar; byte-level evita el token `[UNK]` |
| cl100k_base (tiktoken, familia GPT-3.5/4) | 100.256 | Byte-level, con regex de pre-tokenizado | multilingue y codigo | propietaria, uso via libreria `tiktoken` | Vocabulario mucho mayor y mejor cobertura de codigo y otros idiomas |
| Tokenizer de Llama 3 | 128.256 | Byte-level BPE | multilingue y codigo | licencia comunitaria de Meta | Estandar de facto en ecosistemas abiertos; vocabulario mas del doble de grande |
| Tokenizer de Mistral v0.3 | 32.000 | SentencePiece BPE, byte fallback | multilingue y codigo | Apache 2.0 | Vocabulario mas compacto y con fallback de bytes |

Diferencias clave frente a estas alternativas: scribe-tok-50k no usa pre-tokenizado byte-level, por lo que los caracteres fuera del corpus de entrenamiento pueden acabar en `[UNK]`; no tiene normalizacion, asi que el casing genera tokens distintos; y carece de decoder explicito. A cambio, es totalmente reproducible, esta bajo MIT sin restricciones adicionales y esta pensado para modelos pequenos donde 50k entradas son suficientes.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre texto de libros en ingles: el propio autor advierte de rendimiento pobre en otros idiomas, codigo fuente y texto social o web.
- Sin normalizacion ni lowercasing: "The" y "the" son tokens diferentes, lo que fragmenta el vocabulario y penaliza la compresion efectiva en textos con casing inconsistente.
- Pre-tokenizado solo por espacios: los tokens nunca incluyen espacios iniciales y la puntuacion se trata como token independiente. Esto difiere del esquema byte-level de GPT-2 y compania y puede degradar la calidad si el tokenizer se combina con un modelo entrenado con otro esquema.
- Sin decoder configurado: la operacion `decode` refleja el formato separado por espacios del corpus, no una reconstruccion fiel del texto original; la reconstruccion exacta de espacios y saltos de linea no esta garantizada.
- Ausencia de fallback de bytes: los caracteres no vistos durante el entrenamiento se mapean a `[UNK]` (ID 1), lo que provoca perdida de informacion en entradas con simbolos, emojis o alfabetos no latinos.
- Frecuencia minima de 2 sobre un corpus limitado: pueden existir fusiones poco robustas que no generalicen fuera del dominio de libros en ingles.
- Riesgo de alucinacion: no aplica al tokenizer en si, pero si al modelo que lo utilice; este artefacto no genera contenido.
- Uso comercial: la licencia MIT lo permite sin restriccion practica, pero la ausencia de mantenimiento, de tests exhaustivos y de adopcion (0 descargas, 0 likes) implica que cualquier despliegue en produccion exige una validacion propia previa.
- Caveat de compatibilidad: los modelos preentrenados publicados no usan este vocabulario, de modo que no puede sustituir al tokenizer de un modelo existente sin reentrenar los embeddings de entrada y salida.

## Enlaces

- HuggingFace: https://huggingface.co/coderian/scribe-tok-50k
- Repositorio GitHub: https://github.com/coderianx/scribe-tok-50k
- Dataset de entrenamiento: https://huggingface.co/datasets/kd13/bookcorpus-clean
- Licencia MIT: https://opensource.org/licenses/MIT
- Documentacion de la libreria `tokenizers`: https://huggingface.co/docs/tokenizers
- La busqueda web realizada no devolvio papers, blogs ni demos relevantes sobre este tokenizer; los resultados obtenidos no guardaban relacion con el artefacto.
