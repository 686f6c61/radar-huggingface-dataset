# kurdish-tech/kurdish-tokenizer-bpe-64k

## Resumen

El modelo `kurdish-tech/kurdish-tokenizer-bpe-64k` es un tokenizador byte-level BPE de 64.000 entradas, desarrollado por el colectivo Kurdish-Tech para cubrir las tres variedades principales del kurdo en un único vocabulario: kurmanji (escritura latina), sorani (escritura árabe) y zazaki (escritura latina). Su objetivo es resolver la fragmentación excesiva que sufren estos idiomas de bajos recursos cuando se utilizan tokenizadores multilingües generalistas, especialmente en el caso del sorani, cuya ortografía árabe difiere notablemente del árabe y el persa estándar.

El tokenizador se entrenó sobre 800.000 líneas del dataset `KurdishCorpus-clean`, con un sobremuestreo deliberado de sorani y zazaki para evitar que el vocabulario quede dominado por el kurmanji, que es la variedad con más presencia en el corpus. En las pruebas sobre texto reservado (held-out), consigue una fertilidad de 1,342 tokens por palabra en kurmanji, 1,793 en sorani y 2,408 en zazaki, superando a alternativas como NLLB-200, XLM-RoBERTa o los tokenizadores de GPT-4 y GPT-4o. Es un componente pensado para integrarse en pipelines de generación de texto, pero no incluye pesos de modelo de lenguaje: solo el tokenizador.

La relevancia actual de esta pieza radica en que los tokenizadores multilingües de propósito general fragmentan el kurdo de forma severa, lo que encarece el cómputo y reduce el contexto útil disponible. Al ofrecer un vocabulario específico para las tres variedades, este tokenizador permite que los modelos causales (estilo Llama, GPT o Mistral) procesen texto kurdo con menos tokens y, por tanto, con mayor eficiencia y mejor aprovechamiento de la ventana de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizador, no modelo de lenguaje) |
| Parámetros totales | no disponible (no aplica: solo vocabulario de 64.000 entradas) |
| Parámetros activos | no disponible |
| Longitud de contexto | `model_max_length` = 1024 |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | Kurmanji (kmr), Sorani (ckb), Zazaki (diq), kurdo genérico (ku) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | no disponible (tokenizador en formato HuggingFace Transformers, compatible con `AutoTokenizer`) |

## Arquitectura y entrenamiento

Se trata de un tokenizador byte-level BPE (Byte Pair Encoding) con un vocabulario de 64.000 entradas. El algoritmo byte-level garantiza que no existan tokens fuera de vocabulario (UNK rate = 0.0), ya que cualquier carácter desconocido se descompone en bytes. Los tokens especiales incluidos son `<bos>`, `<eos>`, `<unk>`, `<pad>` y `<mask>`, y el post-procesador añade automáticamente `<bos>` y `<eos>`, lo que facilita su uso directo en entrenamiento sin gestión manual de tokens especiales.

El entrenamiento se realizó sobre 800.000 líneas muestreadas de la partición de entrenamiento del dataset `KurdishCorpus-clean`. La distribución de la muestra fue deliberadamente sobremuestreada hacia sorani y zazaki en comparación con su proporción en el corpus: 520.000 líneas de kurmanji (68,3 %), 224.000 de sorani (29,4 %) y 17.309 de zazaki (2,3 %). Esta decisión evita que el vocabulario quede dominado por el kurmanji, que constituye la mayor parte del corpus. La elección de BPE frente a Unigram se justifica por ser el estándar para modelado de lenguaje causal (estilo Llama/GPT/Mistral). Se entrenaron cuatro variantes (BPE y Unigram, con 32k y 64k) y esta es la versión BPE 64k, que ofrece la menor fertilidad en kurmanji.

## Capacidades

- Tokenización de las tres variedades principales del kurdo en un único vocabulario: kurmanji (latino), sorani (árabe) y zazaki (latino).
- Soporte byte-level con cobertura total de caracteres: tasa de UNK de 0.0, sin caracteres fuera de vocabulario.
- Post-procesado automático que añade `<bos>` y `<eos>`, listo para entrenamiento causal.
- Compatible con la API `AutoTokenizer` de Transformers, integrable directamente en pipelines de HuggingFace.
- Diseñado para modelado de lenguaje causal (generación de texto), no para tareas de codificación o visión.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser exclusivamente un tokenizador.

## Casos de uso

- **Entrenamiento de modelos de lenguaje kurdo desde cero**: el tokenizador puede usarse como paso previo para entrenar un LLM causal específico para kurdo, reduciendo el número de tokens por palabra y mejorando la eficiencia del entrenamiento.
- **Fine-tuning de modelos multilingües existentes**: al sustituir el tokenizador original por este, se puede adaptar un modelo preentrenado (por ejemplo, un Llama o Mistral) al kurdo sin necesidad de ampliar el vocabulario con fragmentos arbitrarios.
- **Sistemas de traducción automática kurdo ↔ otros idiomas**: la baja fertilidad en sorani y kurmanji permite procesar más texto por ventana de contexto, lo que mejora la calidad de traducciones largas.
- **Procesamiento de corpus históricos o literarios en kurdo**: dado que cubre las tres variedades, es útil para normalizar y tokenizar textos de diferentes dialectos en un mismo pipeline.
- **Aplicaciones de generación de texto en kurdo (chatbots, asistentes)**: al ser un tokenizador eficiente, reduce la latencia y el coste de cómputo en sistemas de generación en producción.
- **Investigación en NLP de bajos recursos**: sirve como referencia para evaluar el impacto de tokenizadores específicos de dialecto frente a opciones multilingües generalistas.

## Benchmarks y rendimiento

La métrica principal reportada es la **fertilidad** (tokens por palabra, menor es mejor), medida sobre documentos reservados que el tokenizador no vio durante el entrenamiento. Se utilizaron 300 documentos por dialecto (166 para zazaki, al ser el máximo que cumplía el umbral de calidad), cada uno con al menos 20 palabras y truncados a 2.000 caracteres. Todos los tokenizadores se midieron con el mismo script y los mismos documentos, sin tokens especiales.

| Tokenizador | Kurmanji | Sorani | Zazaki |
|---|---|---|---|
| **kurdish-bpe-64k (este modelo)** | **1.342** | 1.793 | 2.408 |
| kurdish-unigram-64k | 1.385 | **1.633** | **2.290** |
| kurdish-bpe-32k | 1.427 | 1.974 | 2.701 |
| kurdish-unigram-32k | 1.472 | 1.843 | 2.580 |
| NLLB-200 (`distilled-600M`) | 1.930 | 2.336 | 2.548 |
| XLM-RoBERTa (`base`) | 1.751 | 3.695 | 2.527 |
| `o200k_base` (GPT-4o) | 2.361 | 3.984 | 2.732 |
| `cl100k_base` (GPT-4) | 2.610 | 6.938 | 3.038 |

Frente a `cl100k_base`, este tokenizador necesita 1,9× menos tokens para el mismo texto en kurmanji y 3,9× menos en sorani. También supera a NLLB-200, un tokenizador diseñado específicamente para 200 idiomas, en las tres variedades.

## Requisitos de hardware

- Al ser un tokenizador, no requiere GPU ni VRAM para su uso. Se ejecuta completamente en CPU.
- El uso típico es como componente dentro de un pipeline de HuggingFace Transformers; el coste de memoria es mínimo (vocabulario de 64.000 entradas).
- No se han publicado datos de latencia o throughput específicos, pero al ser una operación de subword tokenization, el rendimiento es del orden de miles de documentos por segundo en CPU moderna.
- Para el entrenamiento de modelos que lo utilicen, los requisitos de hardware dependerán del modelo de lenguaje asociado, no del tokenizador.

## Comparativa con modelos similares

La comparativa se realiza frente a otros tokenizadores multilingües y específicos de kurdo. Los datos de fertilidad se recogen en la tabla de benchmarks. En cuanto a características:

| Tokenizador | Vocabulario | Algoritmo | Dialectos kurdo | Licencia |
|---|---|---|---|---|
| **kurdish-bpe-64k (este)** | 64k | Byte-level BPE | kmr, ckb, diq | CC BY-SA 4.0 |
| kurdish-unigram-64k | 64k | Unigram | kmr, ckb, diq | CC BY-SA 4.0 (no publicado, disponible bajo petición) |
| NLLB-200 (distilled-600M) | ~256k | SentencePiece (Unigram) | incluye kurdo (kmr, ckb) | CC BY-NC 4.0 (para el modelo completo) |
| XLM-RoBERTa (base) | 250k | SentencePiece (Unigram) | no específico | MIT (para el modelo) |
| o200k_base (GPT-4o) | 200k | Byte-level BPE | no específico | Propietario (OpenAI) |

La principal ventaja de este tokenizador es su especialización en las tres variedades del kurdo con un solo vocabulario, algo que ningún tokenizador generalista ofrece. La variante Unigram 64k obtiene mejores resultados en sorani y zazaki, pero el autor eligió publicar la BPE por su idoneidad para modelado causal.

## Limitaciones y advertencias

- Es un tokenizador, no un modelo de lenguaje: no genera texto ni realiza inferencias por sí mismo.
- La fertilidad es una métrica relativa sobre una muestra reservada, no una evaluación exhaustiva de calidad de tokenización.
- La cifra de zazaki se basa en solo 166 documentos, por lo que es la menos robusta de las tres.
- La cobertura de zazaki es la más débil, limitada por la escasez de texto disponible en ese dialecto.
- Una menor fertilidad no garantiza automáticamente una mejor calidad del modelo final; es un factor, no una garantía.
- La licencia CC BY-SA 4.0 es una licencia de atribución y compartir-igual: cualquier obra derivada debe distribuirse bajo la misma licencia. Esto puede afectar a proyectos comerciales que quieran integrar el tokenizador sin liberar su propio código bajo esa licencia.
- El tokenizador se entrenó con datos del dataset `KurdishCorpus-clean`, que también está bajo CC BY-SA 4.0; cualquier uso debe respetar esa atribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kurdish-tech/kurdish-tokenizer-bpe-64k
- Dataset de entrenamiento: https://huggingface.co/datasets/kurdish-tech/KurdishCorpus-clean
- Organización Kurdish-Tech en GitHub: https://github.com/Kurdish-Tech
