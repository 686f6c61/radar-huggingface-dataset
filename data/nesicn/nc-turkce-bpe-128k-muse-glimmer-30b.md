# nesicn/nc-turkce-bpe-128k-muse-glimmer-30b

## Resumen

`nc-turkce-bpe-128k-muse-glimmer-30b` es un tokenizer, no un modelo de lenguaje. Lo publica el usuario `nesicn` en Hugging Face y consiste en el tokenizer de Muse-Glimmer-30B extendido con el vocabulario turco de NC-128k, un BPE byte-level entrenado desde cero sobre corpus turco. El objetivo es reducir el coste de tokenizacion del turco sin cambiar el tamano del vocabulario ni los identificadores de tokens especiales del modelo original.

La relevancia es practica: el tokenizer original de Muse-Glimmer-30B fragmenta agresivamente las palabras turcas (por ejemplo, `gerçekleştir · il · miştir` o `Cumhur · baş · kan · lığı`), lo que infla el numero de tokens y degrada la coherencia morfologica. Esta variante reduce un 30,8 % los tokens en turco sobre el mismo texto (de 275,4 a 189,4 tokens por 1.000 caracteres) y sube el F1 de frontera morfologica de 36,20 a 57,32, manteniendo un vocabulario de 202.048 entradas.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 0,0 GB, coherente con un artefacto de tokenizer (ficheros `tokenizer.json`, `tokenizer_config.json`, etc.) y no con pesos de modelo. La licencia es Apache 2.0 y los idiomas declarados son turco e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE byte-level (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica: artefacto de tokenizer) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (la hereda del modelo destino Muse-Glimmer-30B; no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible para pesos; artefactos de tokenizer en JSON (`tokenizer.json`, compatible con `transformers`) |
| Vocabulario | 202.048 tokens (identico al original) |
| Tokens especiales | IDs identicos al tokenizer original de Muse-Glimmer-30B |
| Libreria | transformers |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

No se trata de un modelo con pesos entrenados, sino de un tokenizer byte-level BPE construido por fusion. El procedimiento descrito en la model card es el siguiente: se convierte el `tokenizer.json` de NC-128k al formato textual que espera la herramienta de fusion (token byte a texto, espacio a `▁`, byte unico a `<0xXX>`); se descartan 163 tokens de NC que son fragmentos UTF-8 incompletos y no se pueden convertir a texto; y se aplica `BPETokenizerEditor(objetivo).merge_from(nc, max_vocab_size=202048)` con la version 0.2.0 de `bpe-tokenizer-editor`.

La fusion inserta 100.567 tokens de NC en los IDs de los 100.567 tokens de mayor ID de Muse-Glimmer-30B, que se descartan. Las reglas de merge de NC se anteponen a las del tokenizer destino. Se preservan los tokens de un solo caracter, los de forma `<…>` o `[…]`, los tokens especiales del vocabulario, los que ya existen en ambos vocabularios y los fragmentos UTF-8 incompletos de los caracteres base de NC (puentes). El resto se rellena por orden de ID y se eliminan los de ID mas alto. El normalizador, el pre-split, el decoder y la plantilla de chat son los del tokenizer destino.

No hay entrenamiento de embeddings ni ajuste fino asociado: el autor advierte explicitamente de que los nuevos tokens no tienen embeddings entrenados y de que el tokenizer no debe usarse directamente con los pesos originales de Muse-Glimmer-30B sin inicializar y entrenar esos embeddings. Para ello se publica `merged-to-original-token-ids.json`, que mapea cada ID al token o tokens originales correspondientes.

## Capacidades

- Tokenizacion lossless: en todas las pruebas (turco, ingles y codigo) se cumple `decode(encode(x)) == x` y no se genera `<unk>`.
- Reduccion de tokens en turco: 189,4 tokens por 1.000 caracteres frente a 275,4 del tokenizer original (−30,8 %).
- Mejora de segmentacion morfologica: F1 de frontera morfologica de 57,32 frente a 36,20 del original.
- Preservacion razonable del ingles: 235,4 tokens por 1.000 caracteres frente a 224,3 (+4,9 %), con un 92,5 % de los pre-splits de ingles segmentados igual que en el tokenizer original.
- Preservacion del codigo: 300,9 tokens por 1.000 caracteres frente a 293,3 (+2,6 %).
- Compatibilidad con `transformers`: se carga con `AutoTokenizer.from_pretrained` y produce los mismos IDs que `tokenizer.json`, tanto en carga aislada como junto al `config.json` del modelo.
- Tokens especiales y plantilla de chat heredados sin cambios del tokenizer destino.
- No incluye capacidades de generacion, razonamiento, vision, tool calling ni agentes: es un componente de preprocesado.

## Casos de uso

- Preprocesado de corpus turcos para entrenamiento o ajuste fino: el tokenizer reduce un 30,8 % el numero de tokens en turco, lo que se traduce directamente en menos secuencias por documento y menor coste computacional en el preentrenamiento y en el ajuste supervisado sobre Muse-Glimmer-30B.
- Ampliacion de vocabulario de Muse-Glimmer-30B para turco: sirve como base para inicializar los embeddings de los 100.567 tokens nuevos a partir de `merged-to-original-token-ids.json` y entrenarlos despues, evitando reentrenar el tokenizer desde cero.
- Sistemas de recuperacion de informacion (RAG) sobre documentacion turca: al reducir tokens por caracter, caben mas documentos en la ventana de contexto del modelo y baja el coste por consulta en APIs facturadas por token.
- Analisis morfologico y procesamiento de lenguaje natural turco: el F1 de frontera morfologica de 57,32 lo hace util como tokenizer en pipelines de etiquetado morfologico, lematizacion o analisis de sufijos.
- Indexacion y busqueda en motores de texto turcos: la segmentacion mas limpia de palabras como `Cumhurbaşkanlığı` o `gerçekleştirilmiştir` en un solo token mejora la coherencia de las representaciones en tareas de clasificacion y clustering de documentos.
- Entornos bilingues turco-ingles: mantiene el 92,5 % de los pre-splits de ingles del original, por lo que es viable en productos con contenido mixto en ambos idiomas sin degradar en exceso la tokenizacion inglesa.
- Evaluacion comparativa de tokenizers: los datos de la model card (fertility, tokens por 1.000 caracteres, F1 morfologico) permiten usarlo como referencia en estudios de vocabulario para lenguas aglutinantes.

## Benchmarks y rendimiento

Los datos publicados en la model card son metricas de tokenizacion, no benchmarks de modelos de lenguaje. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Tokenizer | Vocabulario | TR tok/1.000 ↓ | TR fertility ↓ | F1 morfologia ↑ | EN tok/1.000 ↓ | Codigo tok/1.000 ↓ | EN segmentado como el original ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Muse-Glimmer-30B (original) | 202.048 | 275,4 | 2,131 | 36,20 | 224,3 | 293,3 | 100 % |
| nc-turkce-bpe-128k-muse-glimmer-30b | 202.048 | 189,4 | 1,464 | 57,32 | 235,4 | 300,9 | 92,5 % |
| NC-128k | 128.000 | 184,8 | 1,429 | 57,28 | 268,1 | 349,0 | no disponible |
| Arcus (Magibu) | 245.353 | 204,7 | 1,583 | 46,08 | 225,1 | 293,8 | 97,6 % |

Metodologia declarada: turco sobre 2.128 documentos y 2,37 M de caracteres, cuatro dominios con peso equitativo (Resmî Gazete, Vikipedi, noticias y Ekşi Sözlük), todos de 2026; ingles sobre `Salesforce/wikitext` (`wikitext-103-raw-v1`, test, commit `b08601e0`); codigo sobre `openai/openai_humaneval` (test, prompt + `canonical_solution`, commit `7dce6050`); morfologia sobre `turkish-nlp-suite/turkish-morph-analysis` (`cekimli`, 163.112 palabras, commit `ebfe5f56`). `tok/1.000` es el numero de tokens por 1.000 caracteres y `fertility` es tokens dividido entre palabras separadas por espacio, promediado sobre los cuatro dominios.

## Requisitos de hardware

- VRAM para inferencia: no aplica al tokenizer; el consumo depende del modelo Muse-Glimmer-30B con el que se combine. No disponible en la informacion proporcionada.
- GPU recomendadas: no aplica al tokenizer. Para el modelo destino, no disponible en la informacion.
- Ajuste en GPU de consumo: el tokenizer en si se ejecuta en CPU con requisitos minimos; el modelo destino no se especifica.
- Opciones de despliegue: `transformers` (carga mediante `AutoTokenizer`); compatible con el backend `TokenizersBackend` de `transformers` 5.22.2. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La reduccion del 30,8 % de tokens en turco implica menos tokens por documento, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | TR tok/1.000 | TR fertility | F1 morfologia | EN tok/1.000 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---:|---|---|
| nc-turkce-bpe-128k-muse-glimmer-30b | 202.048 | 189,4 | 1,464 | 57,32 | 235,4 | Apache 2.0 | Hugging Face, 0 descargas |
| Muse-Glimmer-30B (original) | 202.048 | 275,4 | 2,131 | 36,20 | 224,3 | no disponible en la informacion | Hugging Face (`meta-models/Muse-Glimmer-30B`) |
| NC-128k | 128.000 | 184,8 | 1,429 | 57,28 | 268,1 | no disponible en la informacion | Hugging Face (`nesicn/nc-turkce-bpe-128k`) |
| Arcus (Magibu) | 245.353 | 204,7 | 1,583 | 46,08 | 225,1 | no disponible en la informacion | Hugging Face (`magibu/Arcus`) |

La comparacion es exclusivamente de tokenizacion. La ventaja frente al original es clara en turco (menos tokens y mejor F1 morfologico) a costa de un 4,9 % mas de tokens en ingles y un 2,6 % mas en codigo. Frente a NC-128k, el rendimiento en turco es practicamente identico, pero el vocabulario es mayor y conserva la compatibilidad con los IDs especiales del modelo destino. Frente a Arcus, mejora en turco y en F1 morfologico, con un vocabulario menor.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni tiene pesos; es un tokenizer y debe combinarse con un modelo.
- Advertencia critica del autor: no usar directamente con los pesos originales de Muse-Glimmer-30B. Los 100.567 tokens nuevos ocupan IDs que en el modelo original corresponden a otros tokens, por lo que sus embeddings no estan entrenados. Es necesario inicializarlos y entrenarlos antes de usar el tokenizer con el modelo.
- Regresion en ingles (+4,9 % de tokens) y en codigo (+2,6 %), y solo el 92,5 % de los pre-splits ingleses se segmentan igual que en el original.
- Cobertura limitada a turco e ingles; no se declaran otros idiomas.
- 163 tokens de NC no se pudieron incorporar por ser fragmentos UTF-8 incompletos.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-19), sin validacion externa conocida.
- No se publican mediciones sobre el modelo completo (perplejidad, rendimiento en tareas) tras inicializar los embeddings; solo metricas intrinsecas de tokenizacion.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las licencias del modelo destino y de las fuentes de datos usadas en NC-128k.
- Riesgo de alucinacion y sesgos: no aplica al tokenizer; dependera del modelo con el que se combine.

## Enlaces

- Hugging Face del tokenizer: https://huggingface.co/nesicn/nc-turkce-bpe-128k-muse-glimmer-30b
- Tokenizer NC-128k: https://huggingface.co/nesicn/nc-turkce-bpe-128k
- Modelo destino Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Tokenizer Arcus (Magibu): https://huggingface.co/magibu/Arcus
- Herramienta de fusion: https://github.com/malibayram/bpe-tokenizer-editor
- Dataset de morfologia: `turkish-nlp-suite/turkish-morph-analysis` (commit `ebfe5f56`)
- Dataset de ingles: `Salesforce/wikitext`, `wikitext-103-raw-v1` (commit `b08601e0`)
- Dataset de codigo: `openai/openai_humaneval` (commit `7dce6050`)
