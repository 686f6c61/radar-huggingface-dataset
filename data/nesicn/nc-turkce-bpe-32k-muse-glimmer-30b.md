# nesicn/nc-turkce-bpe-32k-muse-glimmer-30b

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un **tokenizer** publicado por el usuario `nesicn`: una extensión del tokenizer de Muse-Glimmer-30B con el vocabulario turco de NC-32k (un BPE byte-level entrenado desde cero en turco). El objetivo es reducir el coste de tokenización del turco sin alterar el tamaño del vocabulario (202.048) ni los IDs de los tokens especiales del modelo original. Según la model card, mantiene el 96,2% de las segmentaciones inglesas originales y reduce un 21,7% el número de tokens en turco sobre el mismo texto.

La relevancia técnica está en el método: en lugar de ampliar el vocabulario (lo habitual al añadir idiomas), sustituye los 20.869 tokens de mayor ID del tokenizer original por 20.869 tokens turcos de NC-32k, de modo que los IDs existentes conservan su posición y solo cambian los de la cola del vocabulario. Esto simplifica la integración con el modelo, pero introduce una advertencia crítica: los embeddings de esos IDs en el modelo original corresponden a los tokens descartados, por lo que los pesos deben reinicializarse y reentrenarse antes de usar el tokenizer con Muse-Glimmer-30B.

El paquete es pequeño (0,0 GB en el repo) y está pensado para `transformers`. No hay pesos, ni benchmarks de modelo, ni pipeline asociado: es un artefacto de tokenización con métricas de fertilidad y segmentación morfológica, no un modelo evaluado en MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE byte-level (artefacto de tokenización, no modelo neuronal) |
| Parametros totales | no disponible (no aplica: no contiene pesos de modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo Muse-Glimmer-30B, no especificada) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` y ficheros de tokenizer para `transformers`; incluye `merged-to-original-token-ids.json` |

## Arquitectura y entrenamiento

El artefacto es un tokenizer BPE byte-level derivado del de Muse-Glimmer-30B. El vocabulario resultante tiene 202.048 entradas, idéntico al original, y los IDs de tokens especiales no cambian. La construcción se hizo con `bpe-tokenizer-editor` 0.2.0 mediante `BPETokenizerEditor(hedef).merge_from(nc, max_vocab_size=202048)`: las reglas de merge de NC-32k se colocan antes que las del tokenizer destino, y los 20.869 tokens NC se insertan en los IDs de los 20.869 tokens de mayor ID del original, que se descartan. Se excluyen tokens de un solo carácter, tokens con formato `<…>` o `[…]`, tokens especiales, tokens ya presentes en el destino y 43 tokens NC que son fragmentos UTF-8 incompletos y no se pueden convertir a texto.

El normalizador, la pre-segmentación, el decoder y la plantilla de chat son los del tokenizer original. La model card indica que `transformers` 5.22.2 carga el repo como `TokenizersBackend`, tanto solo con los ficheros de tokenizer como junto al `config.json` del modelo, produciendo los mismos IDs que `tokenizer.json`. No hay información sobre datos de entrenamiento del modelo subyacente ni sobre RLHF/DPO, porque este repositorio no incluye el modelo.

## Capacidades

- Tokenización de texto turco e inglés con un vocabulario de 202.048 entradas.
- Reducción del número de tokens en turco: de 275,4 a 214,5 tokens por 1.000 caracteres (−21,7%) sobre el corpus de evaluación descrito.
- Mejora de la segmentación morfológica en turco: F1 de 36,20 a 57,93 sobre `turkish-nlp-suite/turkish-morph-analysis` (split `cekimli`, 163.112 palabras).
- Tokenización sin pérdida: `decode(encode(x)) == x` en todos los textos de prueba y cero tokens `<unk>`.
- Conservación parcial de la segmentación inglesa original: 96,2% de los fragmentos de pre-segmentación ingleses se dividen igual que en el tokenizer original; coste de +1,8% tokens en inglés y +0,7% en código.
- Compatibilidad con la plantilla de chat y los tokens especiales del tokenizer de Muse-Glimmer-30B.
- No incluye tool calling, agentes, visión, audio ni modo de razonamiento: esas capacidades dependerían del modelo, no del tokenizer.

## Casos de uso

- **Adaptación de Muse-Glimmer-30B al turco:** sustituir el tokenizer original por este y reinicializar los embeddings de los 20.869 IDs reemplazados usando `merged-to-original-token-ids.json` para mapear cada ID nuevo a sus tokens originales; después, continuar el preentrenamiento o hacer fine-tuning en turco.
- **Reducción de coste de inferencia en turco:** con un 21,7% menos de tokens por el mismo texto, se reduce proporcionalmente el coste de cómputo y el consumo de ventana de contexto en cargas de trabajo en turco, a cambio de un 1,8% más en inglés.
- **Evaluación de tokenizers para NLP turco:** usar la tabla de métricas (tokens/1.000 caracteres, fertilidad, F1 morfológico) como referencia para comparar vocabularios turcos en tareas de análisis morfológico o segmentación.
- **Pipelines de análisis morfológico:** la mejora de F1 de 36,20 a 57,93 en fronteras morfológicas lo hace útil como tokenizer en sistemas de etiquetado morfológico o lematización turca que dependan de la segmentación.
- **Migración controlada de vocabulario:** el fichero `merged-to-original-token-ids.json` permite construir una capa de compatibilidad que traduzca IDs nuevos a secuencias de IDs originales, útil para reutilizar checkpoints existentes durante la transición.
- **Investigación en extensión de vocabularios:** el método de sustitución de la cola del vocabulario (sin cambiar el tamaño total) sirve como caso de estudio reproducible para experimentos de adaptación lingüística de tokenizers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas publicadas son de tokenización:

| Tokenizer | Vocabulario | TR tok/1.000 ↓ | TR fertilidad ↓ | F1 morfología ↑ | EN tok/1.000 ↓ | Código tok/1.000 ↓ | EN segmentado como el original ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Muse-Glimmer-30B (original) | 202.048 | 275,4 | 2,131 | 36,20 | 224,3 | 293,3 | 100% |
| **Este tokenizer** | 202.048 | 214,5 | 1,659 | 57,93 | 228,2 | 295,2 | 96,2% |
| NC-32k | 32.000 | 216,4 | 1,674 | 57,75 | 336,3 | 410,0 | no disponible |
| Arcus (Magibu) | 245.353 | 204,7 | 1,583 | 46,08 | 225,1 | 293,8 | 97,6% |

Metodología declarada: turco sobre 2.128 documentos y 2,37 millones de caracteres, cuatro dominios con peso igual (Resmî Gazete, Vikipedi, noticias, Ekşi Sözlük), todos de 2026; inglés sobre `Salesforce/wikitext` (`wikitext-103-raw-v1`, test, commit `b08601e0`); código sobre `openai/openai_humaneval` (test, prompt + `canonical_solution`, commit `7dce6050`); morfología sobre `turkish-nlp-suite/turkish-morph-analysis` (`cekimli`, commit `ebfe5f56`). La columna de Arcus usa otro vocabulario turco (Magibu, 65.536) y se construyó ampliando hasta 262.144, por lo que los tamaños de vocabulario no son directamente comparables.

## Requisitos de hardware

- No requiere GPU: es un tokenizer y se ejecuta en CPU.
- Huella en disco mínima: el repositorio ocupa 0,0 GB según Hugging Face.
- Memoria RAM: el vocabulario de 202.048 entradas es pequeño; cualquier entorno con Python y `transformers` es suficiente.
- Despliegue: `transformers` (`AutoTokenizer.from_pretrained`); la model card menciona compatibilidad con `transformers` 5.22.2 y con `TokenizersBackend`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Para usar el tokenizer con Muse-Glimmer-30B hacen falta los requisitos de hardware del modelo, que no se detallan en este repositorio.

## Comparativa con modelos similares

| Artefacto | Tipo | Vocabulario | Idiomas | Licencia | Métrica TR tok/1.000 | Notas |
|---|---|---:|---|---|---:|---|
| **Este tokenizer** | Tokenizer BPE byte-level | 202.048 | tr, en | Apache 2.0 | 214,5 | Sustituye la cola del vocabulario de Muse-Glimmer-30B; requiere reentrenar embeddings |
| Muse-Glimmer-30B (tokenizer original) | Tokenizer del modelo | 202.048 | no disponible | no disponible | 275,4 | Referencia base; no optimizado para turco |
| NC-32k | Tokenizer BPE byte-level | 32.000 | tr | no disponible | 216,4 | Entrenado desde cero en turco; peor en inglés (336,3) y código (410,0) |
| Arcus (Magibu) | Tokenizer extendido | 245.353 | tr, en | no disponible | 204,7 | Construido con vocabulario Magibu de 65.536 y ampliado a 262.144; F1 morfológico inferior (46,08) |

## Limitaciones y advertencias

- **No usable directamente con los pesos originales:** los tokens nuevos ocupan los IDs de tokens descartados, cuyos embeddings en Muse-Glimmer-30B corresponden a otros tokens. Sin inicializar y entrenar esos embeddings, el modelo no funcionará correctamente con este tokenizer.
- **Pérdida de tokens originales:** se eliminan los 20.869 tokens de mayor ID del tokenizer original; cualquier texto que dependiera de ellos se segmentará de forma distinta.
- **Degradación en inglés y código:** +1,8% de tokens en inglés y +0,7% en código; solo el 96,2% de las segmentaciones inglesas se conservan idénticas.
- **Cobertura limitada a dos idiomas:** solo turco e inglés; no hay soporte declarado para otros idiomas.
- **43 tokens NC excluidos:** son fragmentos UTF-8 incompletos y no se incorporaron, lo que puede afectar a casos límite de tokenización.
- **Sin evaluación de modelo:** no hay benchmarks de calidad, razonamiento o generación; las métricas son exclusivamente de tokenización.
- **Riesgo de sesgo del corpus:** las métricas turcas se calcularon sobre cuatro dominios concretos (Resmî Gazete, Vikipedi, noticias, Ekşi Sözlük) de 2026; el comportamiento en otros registros no está medido.
- **Licencia:** Apache 2.0 para el tokenizer; la licencia del modelo Muse-Glimmer-30B y de los datos de entrenamiento no se especifica en este repositorio y debe verificarse por separado antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-32k-muse-glimmer-30b
- Tokenizer NC-32k: https://huggingface.co/nesicn/nc-turkce-bpe-32k
- Modelo Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Tokenizer Arcus (Magibu): https://huggingface.co/magibu/Arcus
- Herramienta `bpe-tokenizer-editor`: https://github.com/malibayram/bpe-tokenizer-editor
- Dataset `Salesforce/wikitext`: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset `openai/openai_humaneval`: https://huggingface.co/datasets/openai/openai_humaneval
- Dataset `turkish-nlp-suite/turkish-morph-analysis`: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
