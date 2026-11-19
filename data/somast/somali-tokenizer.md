# somast/somali-tokenizer

## Resumen

El Somali Tokenizer (Somali ByteLevel BPE v2) es un tokenizador byte-level BPE de 48.000 tipos desarrollado por Somast para el procesamiento del idioma somalí. No es un modelo de lenguaje generativo, sino el componente de tokenización que se sitúa en la base de cualquier pipeline de NLP para somalí: convierte texto en identificadores y viceversa con una eficiencia muy superior a la de los tokenizadores multilingües de propósito general. Se publica bajo licencia Apache 2.0 y se distribuye a través de la librería `tokenizers` de Hugging Face, además de un paquete propio en Rust con bindings de Python.

El problema que resuelve es concreto y medible: los tokenizadores de los grandes modelos multilingües fragmentan el somalí de forma ineficiente, lo que encarece el entrenamiento y la inferencia y degrada la calidad alargando las secuencias. Frente a GPT-4o (`o200k_base`), XLM-RoBERTa o Llama 3, este tokenizador reduce el número de tokens por palabra hasta en un factor de 1,84×, con un 75,2 % de palabras codificadas en un único token.

Es relevante ahora porque acompaña al Somali NLP Corpus 1.0.0 (7,9 millones de documentos, 827 millones de palabras) y porque el somalí es una lengua de bajos recursos donde la elección del tokenizador tiene un impacto directo en el coste computacional y en la viabilidad de entrenar modelos desde cero o adaptar modelos existentes con presupuestos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (ByteLevel BPE v2) |
| Parametros totales | no disponible (no es un modelo neuronal; 48.000 tipos de vocabulario) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | 8.192 (definida en `tokenizer_config.json`) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | somalí (`so`); otros idiomas funcionan por ser byte-level, pero con segmentación ineficiente |
| Licencia | Apache 2.0 |
| Formato de pesos | artefacto de tokenizador (vocabulario y merges de la librería `tokenizers`; sin pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

El tokenizador emplea un esquema byte-level BPE, lo que garantiza que cualquier secuencia de bytes de entrada pueda codificarse y decodificarse de forma exacta, sin token de desconocido y con round-trip perfecto. El vocabulario consta de 48.000 tipos e incluye los tokens especiales `<|endoftext|>`, `<|pad|>`, `<|im_start|>`, `<|im_end|>` y 12 ranuras reservadas para un conjunto de control de un modelo decoder-LM. La longitud de contexto configurada es de 8.192 tokens.

El vocabulario se entrenó sobre una compilación anterior de once fuentes del Somali NLP Corpus (con fecha 2026-09-01). Posteriormente se añadieron seis fuentes al corpus (Glot500, Somali Web Corpus, FinePDFs, FineWeb-2, Somali Alpaca y Somali TinyStories) que no se incorporaron al entrenamiento del vocabulario. El autor documenta que FinePDFs tokeniza por encima de la media del holdout (1,4905 tokens por palabra), por lo que un vocabulario reentrenado mejoraría el rendimiento sobre texto tipo PDF.

## Capacidades

- Tokenización y detokenización byte-level con round-trip exacto sobre cualquier entrada, sin token de desconocido.
- Segmentación eficiente del somalí: 1,374 tokens por palabra en FLORES-200 y 1,505 en párrafos de Wikipedia somalí.
- Alta tasa de palabras en un único token: 75,2 % en FLORES-200.
- Conjunto de tokens especiales para modelos decoder-LM (`<|endoftext|>`, `<|pad|>`, `<|im_start|>`, `<|im_end|>` y 12 ranuras reservadas).
- Integración con `transformers` mediante `AutoTokenizer` y con el paquete `somali-tokenizer` (implementación en Rust con bindings de Python) que valida el artefacto al cargarlo.
- Herramienta de línea de comandos incluida en el paquete: `encode`, `train`, `benchmark` y `stats`.
- Crate de Rust con el mismo nombre para integración nativa.
- Fijación de versión exacta del artefacto mediante `revision="v1.0.0"`.

## Casos de uso

- Entrenamiento de modelos de lenguaje en somalí desde cero o por adaptación: al reducir los tokens por palabra a 1,3440 en el holdout del corpus, disminuye proporcionalmente el coste de entrenamiento y permite secuencias más largas dentro de la misma ventana de contexto.
- Preprocesamiento de corpus para investigación lingüística: el round-trip exacto permite reconstruir el texto original sin pérdidas, algo imprescindible en anotación, alineamiento y auditoría de datasets.
- Construcción de pipelines de NLP para somalí (clasificación, NER, análisis de sentimiento): sirve como capa de tokenización para modelos encoder como XLM-RoBERTa o BERT, sustituyendo su tokenizador original por uno más eficiente en somalí.
- Fine-tuning de modelos multilingües existentes: al reemplazar el tokenizador por defecto se acorta la longitud de las secuencias en somalí, lo que reduce el consumo de memoria y acelera el entrenamiento.
- Sistemas de búsqueda y recuperación de información en somalí: una tokenización más compacta mejora la eficiencia de índices invertidos y de los sistemas de BM25 sobre texto somalí.
- Generación aumentada por recuperación (RAG) sobre documentación en somalí: la ventana de 8.192 tokens y la segmentación eficiente permiten incluir más contexto documental en cada consulta.
- Integración en herramientas de desarrollo: la CLI y el crate de Rust permiten incorporar la tokenización en servicios backend sin depender de Python.

## Benchmarks y rendimiento

FLORES-200 somalí (dev + devtest, 2.009 frases, 45.375 palabras). Tokens por palabra, menor es mejor; sin contar tokens especiales.

| Tokenizador | Vocabulario | Tokens por palabra | Palabras en un token | Tokens relativos a este |
|---|---:|---:|---:|---:|
| **somast/somali-tokenizer (este)** | **48.000** | **1,374** | **75,2 %** | **1,00×** |
| NLLB-200 | 256.204 | 1,818 | 50,8 % | 1,32× |
| XLM-RoBERTa | 250.002 | 1,827 | 50,9 % | 1,33× |
| GPT-4o (`o200k_base`) | 200.019 | 1,975 | 45,3 % | 1,44× |
| Gemma 2 | 256.000 | 2,241 | 35,2 % | 1,63× |
| Llama 3 | 128.256 | 2,527 | 23,4 % | 1,84× |
| GPT-4 (`cl100k_base`) | 100.277 | 2,552 | 22,9 % | 1,86× |
| Qwen 2.5 | 151.665 | 2,568 | 22,9 % | 1,87× |

Sobre 2.000 párrafos de Wikipedia somalí el orden se mantiene: 1,505 tokens por palabra para este tokenizador, 2,060 para GPT-4o y 2,632 para GPT-4.

Resultados en el holdout del corpus (63.542 documentos, aproximadamente el 0,8 % del Somali NLP Corpus 1.0.0, excluidos mediante hash determinista del identificador de documento):

| Tokenizador | Tokens por palabra | Round-trip |
|---|---:|---|
| **Somali ByteLevel BPE v2 (este)** | **1,3440** | exacto en los 63.542 documentos |
| Somali BPE v1 (32k, whitespace) | 1,3830 | falla en todos los documentos |
| XLM-RoBERTa-base | 1,8100 | no aplica |
| BERT-base-uncased | 2,6344 | no aplica |

Sobre el corpus completo 1.0.0 (7.913.008 documentos, 826.973.689 palabras), este tokenizador produce 1.129.084.663 tokens, es decir, 1,3653 tokens por palabra.

## Requisitos de hardware

- Al ser un tokenizador, no requiere GPU: la carga del vocabulario y los merges ocupa del orden de megabytes en memoria RAM y la tokenización se ejecuta en CPU.
- No aplican estimaciones de VRAM, GPU recomendadas ni latencia de inferencia propiamente dicha; el coste relevante es el tiempo de tokenización por documento, que el paquete `somali-tokenizer` permite medir con su subcomando `benchmark`.
- Despliegue mediante la librería `tokenizers` de Hugging Face (carga con `AutoTokenizer`), el paquete `somali-tokenizer` (Rust con bindings de Python) o el crate de Rust directamente.
- Puede integrarse como capa de preprocesamiento delante de cualquier servidor de inferencia (vLLM, TGI, llama.cpp), pero no se ejecuta en ellos como modelo.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Tokens por palabra (FLORES-200 so) | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| **somast/somali-tokenizer** | 48.000 | 1,374 | Apache 2.0 | Hugging Face, PyPI, crate de Rust |
| XLM-RoBERTa | 250.002 | 1,827 | MIT (modelo); tokenizador incluido | Hugging Face |
| NLLB-200 | 256.204 | 1,818 | CC-BY-NC 4.0 (uso no comercial) | Hugging Face |
| GPT-4o (`o200k_base`) | 200.019 | 1,975 | propietaria, vía API | Solo API de OpenAI |
| Llama 3 | 128.256 | 2,527 | licencia comunitaria de Meta | Hugging Face |

## Limitaciones y advertencias

- El vocabulario se entrenó sobre una compilación de once fuentes del corpus (2026-09-01) y no se reentrenó con las seis fuentes añadidas después; FinePDFs tokeniza por encima de la media del holdout (1,4905 tokens por palabra), por lo que el rendimiento en texto tipo PDF es peor.
- Está ajustado para somalí; otros idiomas funcionan por el esquema byte-level, pero se segmentan de forma ineficiente.
- Solo se licencia el tokenizador bajo Apache 2.0; el corpus de entrenamiento se distribuye por separado bajo las licencias por registro descritas en su propia model card.
- Los benchmarks sobre Wikipedia y posiblemente FLORES pueden solaparse con el corpus de entrenamiento, según advierte el propio autor.
- Al ser byte-level, no existe token de desconocido, pero esto no implica calidad lingüística: la tokenización correcta no garantiza que un modelo posterior produzca texto coherente.
- No es un modelo generativo: no produce texto, no razona y no admite tool calling ni capacidades de agente. Cualquier expectativa de ese tipo requiere un modelo de lenguaje adicional.

## Enlaces

- Hugging Face: https://huggingface.co/somast/somali-tokenizer
- Sitio del autor: https://www.somast.so
- Corpus de entrenamiento: https://huggingface.co/datasets/somast/somali-nlp-corpus
- Repositorio del tokenizador: https://github.com/somastllc/Somali-Tokenizer
- Informe de benchmarks (PDF): https://github.com/somastllc/Somali-Tokenizer/blob/main/docs/benchmarks/somast-somali-tokenizer-benchmark.pdf
- Metodología de benchmarking: https://github.com/somastllc/Somali-Tokenizer/blob/main/docs/BENCHMARKING.md
- Nota técnica: `python-reference/PAPER.md` dentro del repositorio
