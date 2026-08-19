# kurdish-tech/kurdish-tokenizer-bpe-32k

## Resumen

El modelo `kurdish-tech/kurdish-tokenizer-bpe-32k` es un tokenizador de tipo byte-level BPE con un vocabulario de 32.000 entradas, diseñado específicamente para las tres variedades principales del kurdo: Kurmancî (escritura latina), Soranî (escritura árabe) y Zazakî (escritura latina). Lo desarrolla la organización open-source Kurdish-Tech, dedicada a construir infraestructura digital para la lengua kurda, y se entrena sobre el corpus limpio `KurdishCorpus-clean`. Su objetivo es proporcionar una tokenización eficiente y unificada para un idioma de bajos recursos, facilitando el desarrollo de modelos de lenguaje y aplicaciones de PLN.

Este tokenizador es una de las cuatro variantes publicadas por Kurdish-Tech, y se posiciona como la opción con menor huella de memoria (32k frente a 64k de vocabulario), aunque también es la que presenta peor fertilidad (más tokens por palabra) en comparación con sus hermanas. A pesar de ello, supera claramente a tokenizadores multilingües como `cl100k_base` (GPT-4) en todas las variedades kurdas, con hasta 3,5 veces menos tokens en Soranî. Su relevancia radica en ser un recurso específico para una lengua minoritaria, con licencia CC BY-SA 4.0 y compatible con el ecosistema `transformers`.

Se trata únicamente de un tokenizador, no incluye pesos de modelo de lenguaje. Está pensado para usarse como componente de preprocesamiento en tareas de generación de texto, entrenamiento desde cero o adaptación de modelos multilingües al kurdo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE |
| Parametros totales | No aplica (tokenizador, sin pesos de modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | 1024 (`model_max_length`) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Kurmancî (kmr), Soranî (ckb), Zazakî (diq), kurdo genérico (ku) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | No aplica (archivos de tokenizador compatibles con `transformers`) |

## Arquitectura y entrenamiento

El tokenizador emplea el algoritmo byte-level BPE (Byte Pair Encoding), que opera sobre bytes y permite manejar cualquier texto sin vocabulario desconocido. Se entrenó sobre el corpus `KurdishCorpus-clean` de Kurdish-Tech, un conjunto de documentos en las tres variedades kurdas mencionadas. El entrenamiento generó un vocabulario de 32.000 tokens, incluyendo los tokens especiales `<bos>`, `<eos>`, `<unk>`, `<pad>` y `<mask>`. La evaluación de la fertilidad (tokens por palabra) se realizó sobre documentos held-out que no participaron en el entrenamiento, con 300 documentos por dialecto (166 para Zazakî) de al menos 20 palabras, truncados a 2.000 caracteres. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición detallada del corpus.

## Capacidades

- Tokenización byte-level BPE para las tres variedades principales del kurdo en un solo vocabulario unificado.
- Soporte de escritura latina (Kurmancî, Zazakî) y escritura árabe (Soranî) sin necesidad de cambiar de tokenizador.
- Compatible con la librería `transformers` mediante `AutoTokenizer`.
- Incluye tokens especiales estándar (`<bos>`, `<eos>`, `<unk>`, `<pad>`, `<mask>`) para integración directa en pipelines de generación de texto.
- Longitud máxima de secuencia configurada a 1024 tokens, adecuada para tareas de generación y clasificación de textos cortos o medios.
- Al ser byte-level, maneja cualquier carácter Unicode, incluyendo signos diacríticos kurdos y caracteres árabes, sin tokens desconocidos.
- No incluye capacidades de razonamiento, código, visión ni tool calling, ya que es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de modelos de lenguaje desde cero en kurdo: el tokenizador permite construir un vocabulario compacto y eficiente para modelos tipo GPT o BERT orientados a esta lengua, reduciendo el coste de la capa de embeddings (32k filas frente a 64k).
- Adaptación de modelos multilingües preentrenados (por ejemplo, mT5 o XLM-R) al kurdo: sustituir el tokenizador original por este específico puede mejorar la eficiencia de tokenización y reducir el número de tokens necesarios para representar texto kurdo.
- Preprocesamiento para tareas de PLN en kurdo: análisis de sentimiento, clasificación de documentos, extracción de entidades, etc., donde una tokenización precisa y consistente es crítica.
- Generación de texto asistida en kurdo: como parte de un sistema de chatbot o asistente virtual que requiera manejar las tres variedades dialectales con un único tokenizador.
- Sistemas de traducción automática kurdo-español u otras lenguas: el tokenizador puede servir como componente de entrada/salida en modelos de traducción neuronal, especialmente en configuraciones de bajo recurso.
- Desarrollo de recursos educativos y lingüísticos digitales para el kurdo: tokenización de corpus para la creación de diccionarios, analizadores morfológicos o herramientas de corrección ortográfica.

## Benchmarks y rendimiento

La model card proporciona datos de fertilidad (tokens por palabra, menor es mejor) medidos sobre documentos held-out. La tabla siguiente compara este tokenizador con otras variantes kurdas y tokenizadores multilingües de referencia:

| Tokenizador | Kurmancî | Soranî | Zazakî |
|---|---:|---:|---:|
| kurdish-bpe-64k | **1.342** | **1.793** | **2.408** |
| kurdish-unigram-64k | 1.385 | 1.633 | 2.290 |
| **kurdish-bpe-32k** (este modelo) | 1.427 | 1.974 | 2.701 |
| kurdish-unigram-32k | 1.472 | 1.843 | 2.580 |
| NLLB-200 (`distilled-600M`) | 1.930 | 2.336 | 2.548 |
| XLM-RoBERTa (`base`) | 1.751 | 3.695 | 2.527 |
| `o200k_base` (GPT-4o) | 2.361 | 3.984 | 2.732 |
| `cl100k_base` (GPT-4) | 2.610 | 6.938 | 3.038 |

Este modelo es el que presenta peor fertilidad entre las cuatro variantes kurdas, pero supera a `cl100k_base` en todas las dialectos (1,8× menos tokens en Kurmancî, 3,5× menos en Soranî) y es comparable o mejor que `o200k_base` en Kurmancî y Soranî. No se han publicado resultados de benchmarks de tareas de PLN (MMLU, HumanEval, etc.) porque se trata de un tokenizador, no de un modelo de lenguaje completo.

## Requisitos de hardware

- Al ser un tokenizador, no requiere GPU ni VRAM para su funcionamiento; la tokenización se realiza en CPU de forma eficiente.
- El tamaño del vocabulario (32.000) implica una tabla de embeddings pequeña, adecuada para modelos con restricciones de memoria, como los destinados a dispositivos móviles o edge.
- No se requieren requisitos especiales de memoria RAM; el archivo de tokenizador ocupa unos pocos megabytes.
- Se puede integrar en cualquier pipeline de `transformers` (PyTorch, TensorFlow) y es compatible con frameworks de inferencia como vLLM o TGI, aunque al no ser un modelo generativo no aplica la inferencia tradicional.
- Para entrenar un modelo de lenguaje con este tokenizador, los requisitos de hardware dependerán del tamaño del modelo, no del tokenizador en sí.

## Comparativa con modelos similares

La siguiente tabla compara este tokenizador con otras alternativas para kurdo y tokenizadores multilingües de referencia:

| Tokenizador | Vocabulario | Algoritmo | Fert. Kurmancî | Fert. Soranî | Fert. Zazakî | Licencia |
|---|---|---|---:|---:|---:|---|
| kurdish-bpe-32k (este) | 32.000 | Byte-level BPE | 1.427 | 1.974 | 2.701 | CC BY-SA 4.0 |
| kurdish-bpe-64k | 64.000 | Byte-level BPE | 1.342 | 1.793 | 2.408 | CC BY-SA 4.0 |
| kurdish-unigram-64k | 64.000 | Unigram | 1.385 | 1.633 | 2.290 | CC BY-SA 4.0 |
| kurdish-unigram-32k | 32.000 | Unigram | 1.472 | 1.843 | 2.580 | CC BY-SA 4.0 |
| NLLB-200 (distilled-600M) | 256.000 | SentencePiece (Unigram) | 1.930 | 2.336 | 2.548 | MIT |
| XLM-RoBERTa (base) | 250.000 | SentencePiece (Unigram) | 1.751 | 3.695 | 2.527 | MIT |
| `cl100k_base` (GPT-4) | 100.000 | BPE (tiktoken) | 2.610 | 6.938 | 3.038 | MIT (uso con OpenAI) |

El tokenizador de 64k BPE es la recomendación general de los autores por su mejor fertilidad, mientras que la variante unigram de 64k ofrece el mejor equilibrio para Soranî y Zazakî. Este modelo de 32k BPE solo se justifica en escenarios con fuertes restricciones de tamaño de vocabulario.

## Limitaciones y advertencias

- Es la variante con peor fertilidad de las cuatro tokenizadores kurdos publicados por Kurdish-Tech; no es la recomendación general si no hay restricciones de tamaño de vocabulario.
- Es únicamente un tokenizador; no se incluyen pesos de modelo de lenguaje, por lo que no puede generar texto por sí mismo.
- La longitud de contexto está fijada a 1024 tokens, lo que puede ser limitante para tareas que requieran secuencias más largas.
- La fertilidad se midió sobre una muestra held-out relativamente pequeña (300 documentos por dialecto, 166 para Zazakî) y no constituye una evaluación exhaustiva del rendimiento en todas las tareas.
- No se dispone de información sobre la composición exacta del corpus de entrenamiento ni sobre posibles sesgos dialectales o de registro.
- La licencia CC BY-SA 4.0 es una licencia de atribución y compartir igual; cualquier obra derivada debe distribuirse bajo la misma licencia, lo que puede afectar a proyectos comerciales que no quieran compartir sus modificaciones.
- No se han documentado riesgos de alucinación ni sesgos de contenido, al ser un componente de preprocesamiento y no un modelo generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurdish-tech/kurdish-tokenizer-bpe-32k
- Variante recomendada (64k BPE): https://huggingface.co/kurdish-tech/kurdish-tokenizer-bpe-64k
- Otras variantes: [unigram-64k](https://huggingface.co/kurdish-tech/kurdish-tokenizer-unigram-64k), [unigram-32k](https://huggingface.co/kurdish-tech/kurdish-tokenizer-unigram-32k)
- Corpus de entrenamiento: https://huggingface.co/datasets/kurdish-tech/KurdishCorpus-clean
- Organización Kurdish-Tech en GitHub: https://github.com/Kurdish-Tech/
- Sitio web de KurdishTech: https://kurdishtech.com/
- Tokenizador kurdo similar de otro autor: https://huggingface.co/haryads/kurdish-bpe-32k
