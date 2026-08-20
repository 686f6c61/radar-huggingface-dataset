# davaa33/mns-spm-32k

## Resumen

`davaa33/mns-spm-32k` es un tokenizer SentencePiece de tipo unigram, específicamente entrenado para el mongol tradicional (Mongol bichig). Lo desarrolla el usuario davaa33 y está publicado en HuggingFace con el objetivo de resolver un problema crítico en el procesamiento de esta escritura: los tokenizers estándar, como los basados en SentencePiece con normalización por defecto, destruyen caracteres invisibles pero semánticamente esenciales, como el espacio fino no separable (NNBSP), el separador de vocal final (MVS), los selectores de variante (FVS) o el conector de ancho cero (ZWJ). Este tokenizer los preserva de forma exacta, lo que lo hace especialmente útil en flujos de OCR y en tareas de NLP para mongol tradicional.

El modelo cuenta con un vocabulario de 32.000 piezas y fue entrenado sobre 412.576 líneas únicas de texto, combinando etiquetas reales de OCR con un corpus sintético, todo ello normalizado previamente con un normalizador canónico. Los resultados reportados por el autor indican una tasa de tokens por carácter de 0,2716 sobre etiquetas OCR reales y un round-trip exacto sin fallos en 19.101 bloques, 7.836 compuestos y las 412.576 líneas del corpus. No se trata de un modelo de lenguaje completo, sino de un componente de preprocesamiento, por lo que su relevancia radica en ser la base para sistemas de OCR, traducción o generación de texto en mongol tradicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece unigram |
| Parametros totales | No aplica (vocabulario de 32.000 piezas) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | mn (mongol tradicional) |
| Licencia | No disponible |
| Formato de pesos | .model (SentencePiece) |

## Arquitectura y entrenamiento

El tokenizer emplea el algoritmo unigram de SentencePiece, que modela la segmentación como una distribución de probabilidad sobre subpalabras y selecciona la segmentación más probable mediante Viterbi. El entrenamiento se realizó sobre 412.576 líneas únicas de mongol tradicional, compuestas por etiquetas reales de OCR y un corpus sintético, todas ellas pasadas por un normalizador canónico antes de la tokenización. La elección de `normalization_rule_name="identity"` y `remove_extra_whitespaces=False` es deliberada: evita que la normalización por defecto (`nmt_nfkc`) convierta el NNBSP en un espacio normal, lo que borraría la unión entre sufijos de caso. Además, se definió `user_defined_symbols=["\n"]` para que los saltos de línea no se conviertan en tokens desconocidos (UNK) en textos multilínea.

El tokenizer preserva de forma exacta los siguientes caracteres: NNBSP (U+202F), MVS (U+180E), FVS (U+180B–U+180D), ZWJ (U+200D) y los dígitos mongoles (U+1810–U+1819). Esta preservación es fundamental para el mongol tradicional, donde estos caracteres codifican distinciones gramaticales y léxicas que no son visibles en la forma impresa pero que afectan al significado.

## Capacidades

- Tokenización de mongol tradicional (Mongol bichig) con preservación exacta de caracteres especiales (NNBSP, MVS, FVS, ZWJ, dígitos mongoles).
- Round-trip exacto: la decodificación de cualquier secuencia tokenizada reproduce el texto original sin pérdidas, verificado en 19.101 bloques, 7.836 compuestos y 412.576 líneas del corpus.
- Eficiencia en tokenización: 0,2716 tokens por carácter en etiquetas OCR reales, lo que indica una segmentación compacta para esta escritura.
- Compatible con el ecosistema SentencePiece: se puede cargar con `SentencePieceProcessor` y también se incluye un wrapper de `XLMRobertaTokenizer` para integración con Transformers.
- Soporte para textos multilínea gracias a la definición de `\n` como símbolo definido por el usuario.
- Normalización canónica previa requerida: el tokenizer espera texto en la misma convención que el corpus de entrenamiento, con las conversiones específicas para teclados Bolorsoft Tungaamal (U+1888 → U+182C, U+1889 → U+182D) y la eliminación de FVS insertados en sufijos de caso.

## Casos de uso

- Preprocesamiento para sistemas de OCR de mongol tradicional: el tokenizer puede segmentar las salidas de un motor de OCR (etiquetas reales) de forma fiable, preservando los caracteres especiales que los tokenizers genéricos eliminarían. Esto permite construir pipelines de post-procesado y corrección de errores con una base estable.
- Normalización y tokenización para modelos de lenguaje en mongol tradicional: antes de entrenar o ajustar un modelo de lenguaje (por ejemplo, un transformer), este tokenizer garantiza que los sufijos de caso y las variantes léxicas se representen correctamente, evitando pérdidas de información que degradarían el rendimiento en tareas de generación o traducción.
- Construcción de corpus de entrenamiento para NLP: al tokenizar grandes volúmenes de texto histórico o moderno en mongol tradicional, se obtienen secuencias de tokens que conservan la estructura morfológica, lo que facilita el entrenamiento de modelos de análisis morfológico o de etiquetado gramatical.
- Integración en pipelines de traducción automática: dado que el tokenizer maneja correctamente los caracteres de unión y variantes, puede servir como capa de entrada para sistemas de traducción entre mongol tradicional y otros idiomas, mejorando la fidelidad de las traducciones de términos con sufijos complejos.
- Desarrollo de herramientas de edición y revisión de textos en mongol tradicional: aplicaciones de corrección ortográfica o de conversión entre escrituras (por ejemplo, de cirílico a mongol bichig) pueden usar este tokenizer para validar la integridad de los caracteres especiales durante el proceso.
- Investigación en lingüística computacional: el tokenizer proporciona una representación estable para estudios de frecuencia de subpalabras, análisis de sufijos y variantes, y para la creación de recursos léxicos anotados.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en la model card:

| Metrica | Valor |
|---|---|
| Tokens por caracter (tok/char) en etiquetas OCR reales | 0,2716 |
| Fallos de round-trip exacto | 0 (sobre 19.101 bloques, 7.836 compuestos y 412.576 líneas del corpus) |

No se han publicado comparaciones con otros tokenizers para mongol tradicional en la información disponible.

## Requisitos de hardware

- Al ser un tokenizer, no requiere GPU ni hardware especializado. Funciona en cualquier CPU, incluso en entornos embebidos o servidores sin aceleración.
- Memoria mínima: el archivo `.model` de SentencePiece con 32.000 piezas ocupa típicamente menos de 1 MB, por lo que puede cargarse en cualquier sistema con unos pocos MB de RAM.
- Despliegue: se integra fácilmente en aplicaciones Python mediante `sentencepiece` o en pipelines de HuggingFace Transformers a través del wrapper `XLMRobertaTokenizer`. No requiere servicios de inferencia como vLLM u Ollama, ya que no es un modelo generativo.
- Latencia: la tokenización de una línea de texto es del orden de microsegundos, despreciable en cualquier flujo de procesamiento.

## Comparativa con modelos similares

No se dispone de información sobre tokenizers alternativos específicos para mongol tradicional con los que comparar directamente. Los tokenizers genéricos de SentencePiece (por ejemplo, los entrenados para modelos multilingües como XLM-R) no preservan los caracteres especiales del mongol bichig, pero no hay datos cuantitativos publicados para una comparación rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Requiere normalización previa del texto: el tokenizer solo funciona correctamente si el texto de entrada sigue la misma convención que el corpus de entrenamiento. Textos tecleados con teclados Bolorsoft Tungaamal necesitan conversiones específicas (U+1888 → U+182C, U+1889 → U+182D) y la eliminación de FVS insertados en sufijos de caso; de lo contrario, las piezas de sufijo no coincidirán.
- No es un modelo de lenguaje: no genera texto ni tiene capacidad de razonamiento. Es únicamente un componente de tokenización.
- El wrapper `XLMRobertaTokenizer` incluido termina `convert_tokens_to_string` con `.strip()`, lo que elimina silenciosamente los espacios iniciales y finales. Esto puede ser problemático en aplicaciones que requieran preservar el espaciado exacto.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que puede limitar su uso comercial o en proyectos con requisitos legales estrictos.
- Sin soporte para otros idiomas: está entrenado exclusivamente para mongol tradicional; no es adecuado para mongol cirílico ni para otras escrituras.
- Riesgo de alucinación no aplica, pero la dependencia de la normalización previa puede introducir errores si el usuario no sigue las instrucciones.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/davaa33/mns-spm-32k)
