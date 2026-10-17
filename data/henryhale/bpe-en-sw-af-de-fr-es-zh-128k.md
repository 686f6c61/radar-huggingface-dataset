# henryhale/bpe-en-sw-af-de-fr-es-zh-128k

.

Note created date 2026 — weird future date, just report it.

Let me write.

Requirements de hardware: tokenization is CPU-bound, runs on CPU, memory footprint of the tokenizer (vocab 131,072 tokens, merges file size maybe tens of MB — I shouldn't invent exact MB). I can say the tokenizer.json size is not available; the vocabulary of 131,072 tokens is small enough to fit in RAM on any machine.

Let me structure carefully.

For "Parametros totales" — no aplicable (no es un modelo neuronal). I'll put "no aplicable (tokenizer, sin parametros)".

Let me draft.

Resumen: 2-3 paragraphs, 6-10 lines total.

I'll write the ficha now.

For "Casos de uso" - minimum 6 concrete cases. For a tokenizer: pretraining a multilingual LLM, fine-tuning, tokenizer for translation models, low-resource African language NLP, vocabulary analysis, chat template integration, research on tokenization fairness across languages, distillation of grouped vocab.

Let me write.## Resumen

`bpe-en-sw-af-de-fr-es-zh-128k` es un tokenizer byte-level BPE de 131.072 tokens desarrollado por el usuario henryhale y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje: es exclusivamente un vocabulario y un conjunto de reglas de segmentación, distribuido en formato `tokenizers` de Hugging Face. Cubre siete idiomas: inglés, suajili, afrikáans, alemán, francés, español y chino.

Su relevancia es la cobertura multilingüe con un vocabulario compartido de tamano medio (128k), que incluye dos lenguas africanas de recursos limitados (suajili y afrikáans) junto a cuatro lenguas europeas de gran volumen y el chino. Además se publica como el baseline no agrupado de `grouptok-en-sw-af-de-fr-es-zh-128k`, un tokenizer que agrupa exactamente este mismo vocabulario por traducción; ambos segmentan cualquier texto de forma idéntica y solo difieren en la metainformación de grupos, lo que permite usarlos de forma intercambiable en experimentos comparativos.

La arquitectura de tokenización es byte-level BPE sin prefijo de espacio y con un alfabeto de 256 bytes, entrenada con la función `grouptok.tokenizer.train_bpe` sobre un millón de pares de frases inglés-X por idioma. No se ha publicado ninguna evaluación de fertilidad, cobertura o rendimiento downstream en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | byte-level BPE (byte pair encoding), sin prefijo de espacio, alfabeto de 256 bytes |
| Parametros totales | no aplicable (tokenizer, sin parametros neuronales) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana la fija el modelo que lo use) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | en, sw, af, de, fr, es, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json` (con chat template) y `groups.json` (formato grouptok) |

Datos adicionales: tamano de vocabulario 131.072 tokens; tokens reservados en los ids 0-3: `<|im_start|>`, `<|im_end|>`, `<think>`, `</think>`; no se declaran tokens de pad, bos ni eos.

## Arquitectura y entrenamiento

El tokenizer es un BPE a nivel de byte, implementado con la librería `tokenizers` de Hugging Face y entrenado mediante la función `grouptok.tokenizer.train_bpe`. Al operar sobre bytes, no puede producir tokens fuera de vocabulario (OOV): cualquier cadena UTF-8 es representable. El vocabulario resultante tiene 131.072 entradas y no utiliza el prefijo de espacio que emplean otros tokenizers BPE, decisión que afecta a cómo se codifican los límites de palabra.

El corpus de entrenamiento consiste en 1.000.000 de pares de frases inglés-X por cada idioma, usando ambos lados del par. Para alemán, francés y español se emplean Europarl (WMT14) y News Commentary, tomando el corpus menor completo y las primeras filas del mayor hasta completar el millón de pares. Para chino se usan News Commentary (WMT19) y UN Parallel Corpus. Para suajili y afrikáans se usan pares minados de NLLB (`michsethowusu/english-swahili_sentence-pairs` y `michsethowusu/afrikaans-english_sentence-pairs`), seleccionando los mejor puntuados. El autor advierte que igualar el número de pares no iguala el volumen de texto, de modo que las cuotas de vocabulario por idioma no están balanceadas: los pares de suajili y afrikáans son más cortos que los del resto.

## Capacidades

- Segmentación de texto en subpalabras para siete idiomas con un vocabulario compartido.
- Codificación y decodificación sin OOV gracias al nivel de byte.
- Manejo de los tokens reservados de plantilla de chat `<|im_start|>` y `<|im_end|>` en los ids 0 y 1.
- Manejo de los tokens de razonamiento `<think>` y `</think>` en los ids 2 y 3.
- Integración directa con `transformers.AutoTokenizer` y con la librería `tokenizers`.
- Compatibilidad con la metainformación de grupos del ecosistema grouptok mediante `groups.json`.
- Soporte de script latino y chino (han) en un único vocabulario.
- No soporta tool calling, agentes, visión, audio ni ninguna capacidad propia de un modelo de lenguaje: esas capacidades dependen del modelo que se entrene con este tokenizer.

## Casos de uso

- Preentrenamiento de un LLM multilingüe de siete idiomas: el vocabulario de 131.072 tokens ofrece un compromiso habitual entre tamano de embedding y cobertura, y la ausencia de OOV evita pérdidas de información en texto ruidoso o con code-switching.
- Modelos de traducción automática inglés-X: el tokenizer se entrenó específicamente sobre pares paralelos de Europarl, News Commentary, UN Parallel Corpus y pares minados de NLLB, por lo que el vocabulario está alineado con el dominio de traducción.
- NLP para lenguas africanas de recursos limitados: suajili y afrikáans comparten espacio de vocabulario con lenguas de gran volumen, lo que permite aprovechar transferencia entre idiomas en modelos multilingües.
- Fine-tuning de modelos pequeños en contextos con presupuesto de tokens ajustado: al no declarar tokens de pad, bos ni eos, el integrador debe definirlos explícitamente, lo que da control total sobre la estructura de secuencia.
- Plantillas de chat y modelos instruct: los tokens reservados `<|im_start|>`, `<|im_end|>`, `<think>` y `</think>` permiten construir plantillas de conversación y modos de razonamiento sin ambigüedad de segmentación.
- Análisis de fertilidad y equidad de tokenización: al existir una versión agrupada idéntica en segmentación, se puede comparar el efecto del agrupamiento sin confundirlo con cambios de vocabulario.
- Investigación en tokenización (ablaciones, vocabularios agrupados frente a planos): el baseline plano y su gemelo agrupado forman un par de control con segmentación idéntica.
- Prototipado local sin GPU: la tokenización es una operación de CPU, por lo que puede ejecutarse en portátiles y contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de fertilidad (tokens por palabra o por carácter), cobertura de vocabulario, tasa de compresión ni evaluaciones downstream (MMLU, HumanEval, GSM8K u otras), que por otra parte no aplican directamente a un tokenizer.

## Requisitos de hardware

- VRAM para inferencia: no aplicable. La tokenización es una operación de CPU y no requiere GPU.
- GPU recomendadas: no aplicable; funciona en cualquier CPU. El archivo `tokenizer.json` debe cargarse completo en memoria, y con 131.072 tokens su huella es reducida, aunque el tamano exacto del archivo no está disponible en la información proporcionada.
- Encaje en GPU de consumo: irrelevante, ya que no se ejecuta en GPU.
- Opciones de despliegue: librería `tokenizers` (carga de `tokenizer.json`), `transformers.AutoTokenizer`, y cualquier runtime que consuma el formato de `tokenizers` (por ejemplo vLLM, TGI o llama.cpp) como componente de tokenización del modelo que se construya con él.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad de codificación.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Idiomas | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| bpe-en-sw-af-de-fr-es-zh-128k | 131.072 | 7 | byte-level BPE | apache-2.0 | baseline plano; sin datos de evaluación publicados |
| grouptok-en-sw-af-de-fr-es-zh-128k | 131.072 | 7 | byte-level BPE agrupado | no disponible en la información | segmenta de forma idéntica al anterior; solo cambian los grupos |
| cl100k_base (OpenAI) | 100.256 (cifra pública habitual) | principalmente inglés y código | byte-level BPE | propietaria | sin publicación de detalles de entrenamiento ni licencia abierta |
| Tokenizer de Llama 3 | 128.256 (cifra pública habitual) | multilingüe | byte-level BPE | licencia de Llama | requiere aceptar los términos de Meta |
| SentencePiece de XLM-R | 250.002 (cifra pública habitual) | 100 | unigram/SentencePiece | MIT | vocabulario mucho mayor; no incluye los tokens de chat de este tokenizer |

Las cifras de vocabulario de los comparadores son valores ampliamente citados y pueden variar según la revisión; no se dispone de comparaciones de fertilidad entre ellos y este tokenizer en la información proporcionada.

## Limitaciones y advertencias

- El corpus de entrenamiento es mayoritariamente parlamentario, de noticias, de Naciones Unidas y de texto minado de la web; puede no representar bien dominios técnicos, coloquiales o de redes sociales.
- Los idiomas no están balanceados por volumen de texto, solo por número de pares de frases, por lo que las cuotas de vocabulario favorecen a las lenguas con frases más largas.
- Solo cubre siete idiomas; no hay evidencia de comportamiento en lenguas fuera de esa lista más allá de la robustez propia del nivel de byte.
- No se declaran tokens de pad, bos ni eos: hay que definirlos manualmente antes de entrenar o desplegar un modelo, lo que puede provocar errores si se asume un valor por defecto.
- No hay métricas publicadas de fertilidad, cobertura ni calidad de segmentación, ni evaluaciones downstream, por lo que su idoneidad para un caso concreto no está respaldada por datos del autor.
- El repositorio registra 0 descargas y 0 likes en la información disponible, lo que indica ausencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de los corpus de entrenamiento subyacentes (Europarl, News Commentary, UN Parallel Corpus, WMT19 y pares minados de NLLB) si redistribuye el vocabulario derivado.
- Al ser un tokenizer y no un modelo, no genera texto, no razona y no puede evaluarse con benchmarks de tareas; cualquier afirmación de rendimiento depende del modelo que lo utilice.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/henryhale/bpe-en-sw-af-de-fr-es-zh-128k
- Tokenizer agrupado relacionado: https://huggingface.co/henryhale/grouptok-en-sw-af-de-fr-es-zh-128k
- Documentación de BPE en huggingface/tokenizers: https://deepwiki.com/huggingface/tokenizers/4.1-bpe-(byte-pair-encoding)
- Corpus Europarl (WMT14): https://huggingface.co/datasets/wmt/wmt14
- Corpus News Commentary: https://huggingface.co/datasets/Helsinki-NLP/news_commentary
- Corpus Europarl (Helsinki-NLP): https://huggingface.co/datasets/Helsinki-NLP/europarl
- Corpus News Commentary (WMT19): https://huggingface.co/datasets/wmt/wmt19
- Corpus UN Parallel Corpus: https://huggingface.co/datasets/Helsinki-NLP/un_pc
- Pares inglés-suajili: https://huggingface.co/datasets/michsethowusu/english-swahili_sentence-pairs
- Pares afrikáans-inglés: https://huggingface.co/datasets/michsethowusu/afrikaans-english_sentence-pairs
- Referencia de embeddings subword multilingües BPEmb: https://github.com/bheinzerling/bpemb
- Proyecto BPEmb (HITS): https://bpemb.h-its.org/
