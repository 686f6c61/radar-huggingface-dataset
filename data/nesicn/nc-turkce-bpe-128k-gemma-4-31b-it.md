# nesicn/nc-turkce-bpe-128k-gemma-4-31b-it

## Resumen

`nesicn/nc-turkce-bpe-128k-gemma-4-31b-it` no es un modelo de lenguaje, sino un **tokenizer** publicado como repositorio independiente en Hugging Face. Se trata del tokenizer original de `google/gemma-4-31B-it` extendido con el vocabulario turco de NC-128k, un BPE de nivel de byte entrenado desde cero sobre turco por el mismo autor (`nesicn`). El objetivo es reducir el coste en tokens del turco sin alterar el tamano del vocabulario ni los IDs de los tokens especiales del modelo base.

El resultado es un vocabulario de 262.144 entradas en el que 99.613 tokens de NC-128k sustituyen a los 99.613 tokens de mayor ID de gemma-4-31B-it, mientras que el resto de IDs se mantiene intacto. Segun las mediciones del autor, el tokenizer reduce un 37,8 % el numero de tokens en turco (de 296,9 a 183,3 tokens por 1.000 caracteres) y eleva el F1 de frontera morfologica de 33,31 a 57,37, con un coste de solo +0,1 % en ingles y una mejora del 7,4 % en codigo.

Es relevante porque aborda un problema estructural: los tokenizers multilingues genericos fragmentan agresivamente el turco, una lengua aglutinante con alta productividad morfologica, lo que encarece la inferencia y degrada la calidad en contextos largos. La advertencia principal es que **no debe usarse directamente con los pesos originales de gemma-4-31B-it**: los nuevos tokens ocupan IDs cuyas embeddings pertenecen a los tokens descartados y deben inicializarse y entrenarse antes de cualquier uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE de nivel de byte (byte-level BPE) derivado de gemma-4-31B-it |
| Parametros totales | no disponible (es un tokenizer, no un modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la ficha) |
| Tipos de cuantizacion | no disponible (no aplica a tokenizer) |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`; mapa auxiliar `merged-to-original-token-ids.json` |
| Tamano de vocabulario | 262.144 |
| Tokens NC incorporados | 99.613 |
| Tokens reemplazados | 99.613 de mayor ID de gemma-4-31B-it |
| Libreria | transformers (compatible con `GemmaTokenizer`) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El componente es un tokenizer BPE de nivel de byte. La construccion se realizo con la herramienta `bpe-tokenizer-editor` 0.2.0 mediante `BPETokenizerEditor(hedef).merge_from(nc, max_vocab_size=262144)`, siguiendo el mismo procedimiento que el script `examples/merge_magibu_into_tokenizers.py` del propio repositorio de la herramienta. Las reglas de merge de NC-128k se anteponen a las del tokenizer objetivo. Quedan excluidos de la sustitucion los tokens de un solo caracter, los de formato `<…>` / `[…]`, los tokens especiales del vocabulario y los ya presentes en NC-128k; el resto se rellena por orden de ID y se descartan los de ID mas alto.

Un detalle tecnico relevante: el `tokenizer.json` de NC se convirtio previamente a la representacion textual que espera la herramienta (token byte-level a texto, espacio a `▁`, byte unico a `<0xXX>`), porque introducirlo directamente provocaba una doble codificacion de los tokens byte-level. Se excluyeron 163 tokens de NC que eran fragmentos UTF-8 incompletos y no podian convertirse a texto. El normalizador, la pre-tokenizacion, el decoder, la plantilla y la plantilla de chat son identicos a los del tokenizer de destino. En `transformers` 5.22.2 el repositorio se carga como `GemmaTokenizer` tanto de forma aislada como junto al `config.json` del modelo, produciendo los mismos IDs que `tokenizer.json`.

No hay entrenamiento de pesos ni RLHF/DPO: el artefacto es puramente lexico. La validacion reportada por el autor incluye round-trip del 100 % (`decode(encode(x)) == x`) en todos los textos de prueba (turco, ingles y codigo), cero `<unk>`, cero diferencias de IDs entre `transformers` y `tokenizer.json`, IDs consecutivos en el rango 0–262.143 y verificacion byte a byte de las 262.144 entradas de `merged-to-original-token-ids.json`.

## Capacidades

- Tokenizacion y detokenizacion sin perdida (round-trip exacto) en turco, ingles y codigo.
- Reduccion del 37,8 % en tokens para turco: de 296,9 a 183,3 tokens por 1.000 caracteres.
- Mejora del F1 de frontera morfologica de 33,31 a 57,37 sobre `turkish-nlp-suite/turkish-morph-analysis` (conjunto `cekimli`, 163.112 palabras).
- Segmentacion mas natural de sufijos turcos: `Ankara · 'da` frente a `Ankara · ' · da`, o `ev · lerimizden` frente a `ev · lerimiz · den`.
- Preservacion del rendimiento en ingles (+0,1 % de tokens) y mejora en codigo (-7,4 % de tokens).
- Compatibilidad con la plantilla de chat y los tokens especiales de gemma-4-31B-it, sin cambios en sus IDs.
- Mapa `merged-to-original-token-ids.json` para inicializar las embeddings de los nuevos tokens a partir de los fragmentos originales.
- No incorpora capacidades generativas por si mismo: hereda las del modelo base una vez que las embeddings se entrenan.

## Casos de uso

- **Adaptacion de gemma-4-31B-it al turco con presupuesto de contexto limitado**: al reducir un 37,8 % los tokens necesarios para el mismo texto, se amplia de facto el texto turco que cabe en la ventana de contexto del modelo y se reduce el coste por token de inferencia.
- **Ajuste fino (fine-tuning) de un modelo turco sobre gemma-4-31B-it**: el flujo tipico es cargar este tokenizer, inicializar las embeddings de los 99.613 tokens nuevos con `merged-to-original-token-ids.json` y entrenar en turco; el ahorro de tokens se traduce directamente en menos pasos y menos memoria de activaciones.
- **Pipeline de preprocesado para corpus turcos**: integrable en etapas de tokenizacion de datasets (Resmi Gazete, Wikipedia, prensa, foros) donde la fertility de 1,417 frente a 2,298 del original reduce el almacenamiento y el tiempo de entrenamiento.
- **Analisis morfologico y linguistico computacional**: el F1 de 57,37 en fronteras morfologicas permite usar las segmentaciones del tokenizer como aproximacion a la morfologia del turco en tareas de etiquetado o extraccion de lemas.
- **Sistemas de recuperacion (RAG) sobre documentacion turca**: menos tokens por documento implica indices mas compactos y mayor cantidad de pasajes recuperables dentro de la ventana del modelo generador.
- **Evaluacion comparativa de tokenizers**: sirve como referencia reproducible para medir el impacto de la extension de vocabulario en turco frente a alternativas como Altus (Magibu) o el NC-128k sin fusionar.
- **Investigacion sobre equidad multilingue**: permite cuantificar como un vocabulario especifico de una lengua aglutinante corrige el sesgo de fragmentacion de los tokenizers multilingues genericos.

## Benchmarks y rendimiento

Datos de tokenizacion publicados por el autor (no son benchmarks de calidad del modelo):

| Tokenizer | Vocabulario | TR tok/1.000 ↓ | TR fertility ↓ | F1 morfologia ↑ | EN tok/1.000 ↓ | Codigo tok/1.000 ↓ |
|---|---:|---:|---:|---:|---:|---:|
| gemma-4-31B-it (original) | 262.144 | 296,9 | 2,298 | 33,31 | 227,3 | 334,0 |
| **nc-turkce-bpe-128k-gemma-4-31b-it** | 262.144 | 183,3 | 1,417 | 57,37 | 227,6 | 309,3 |
| NC-128k | 128.000 | 184,8 | 1,429 | 57,28 | 268,1 | 349,0 |
| Altus (Magibu) | 262.144 | 217,8 | 1,685 | 46,17 | 233,7 | 336,4 |

Metodologia declarada: turco sobre 2.128 documentos y 2,37 M de caracteres, con cuatro dominios equiponderados (Resmi Gazete, Wikipedia, prensa, Eksi Sozluk), todos de 2026; ingles sobre `Salesforce/wikitext` (`wikitext-103-raw-v1`, test, commit `b08601e0`); codigo sobre `openai/openai_humaneval` (test, prompt + canonical_solution, commit `7dce6050`); morfologia sobre `turkish-nlp-suite/turkish-morph-analysis` (`cekimli`, commit `ebfe5f56`). No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el artefacto no es un modelo entrenado.

## Requisitos de hardware

- VRAM para el tokenizer: despreciable; el repositorio ocupa 0,0 GB y la tokenizacion se ejecuta en CPU.
- VRAM para el modelo asociado: no disponible en la informacion proporcionada; depende de gemma-4-31B-it y de la cuantizacion empleada, no de este repositorio.
- GPU recomendadas: no aplica al tokenizer. Para el modelo base, la informacion disponible no especifica requisitos.
- Cabe en GPU de consumo: el tokenizer si, en cualquier maquina con Python; el modelo base no se evalua en esta ficha.
- Opciones de despliegue: `transformers` (verificado con la version 5.22.2, clase `GemmaTokenizer`). Cualquier runtime que consuma `tokenizer.json` (por ejemplo, servidores compatibles con el formato de Hugging Face) puede cargarlo, pero la informacion disponible no confirma pruebas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor solo reporta metricas de compresion de tokens, no de velocidad.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | TR tok/1.000 | F1 morfologia | EN tok/1.000 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| nc-turkce-bpe-128k-gemma-4-31b-it | 262.144 | 183,3 | 57,37 | 227,6 | Apache 2.0 | Hugging Face |
| gemma-4-31B-it (original) | 262.144 | 296,9 | 33,31 | 227,3 | la del modelo base (no indicada) | Hugging Face |
| NC-128k | 128.000 | 184,8 | 57,28 | 268,1 | no disponible | Hugging Face |
| Altus (Magibu) | 262.144 | 217,8 | 46,17 | 233,7 | no disponible | Hugging Face |

La comparativa se limita a tokenizers porque el artefacto no es un modelo. Frente a NC-128k, la version fusionada iguala la compresion en turco (183,3 frente a 184,8 tok/1.000) y mejora claramente el ingles (227,6 frente a 268,1), a costa de heredar el vocabulario del modelo base. Frente a Altus, la mejora en turco es de 34,5 tokens por 1.000 caracteres y de 11,2 puntos de F1 morfologico.

## Limitaciones y advertencias

- **No usable directamente con los pesos originales de gemma-4-31B-it**: los nuevos tokens ocupan IDs de tokens descartados, cuyas embeddings no corresponden. Es obligatorio inicializar y entrenar esas embeddings antes de la inferencia.
- El mapa `merged-to-original-token-ids.json` es un auxiliar de inicializacion, no sustituye al entrenamiento; el autor no publica pesos adaptados.
- El equilibrio de dominios del corpus turco de evaluacion (Resmi Gazete, Wikipedia, prensa, Eksi Sozluk) puede no representar jerga tecnica, dialectos o turco informal fuera de esos registros.
- El rendimiento en ingles es practicamente identico (+0,1 %), pero el vocabulario sigue siendo el de gemma-4-31B-it para lenguas distintas del turco; no hay mejora declarada para otros idiomas.
- Riesgo de sesgo linguistico: el vocabulario se optimiza para turco estandar escrito; el turco hablado, el otomano o las variantes con caracteres no turcos pueden segmentarse peor.
- La licencia Apache 2.0 cubre el tokenizer, pero el uso comercial del modelo base gemma-4-31B-it queda sujeto a la licencia de Google, no indicada en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-11-19; no hay evidencia de uso en produccion ni validacion independiente.
- No se han publicado evaluaciones de calidad generativa (perplejidad, MMLU, HumanEval) con este tokenizer, por lo que el impacto real en la calidad del modelo tras el reentrenamiento de embeddings es desconocido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-128k-gemma-4-31b-it
- Tokenizer NC-128k: https://huggingface.co/nesicn/nc-turkce-bpe-128k
- Modelo base gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it
- Herramienta de fusion bpe-tokenizer-editor: https://github.com/malibayram/bpe-tokenizer-editor
- Tokenizer Altus (Magibu): https://huggingface.co/magibu/Altus
- Dataset de morfologia turca: `turkish-nlp-suite/turkish-morph-analysis` (commit `ebfe5f56`)
- Dataset de evaluacion en ingles: `Salesforce/wikitext`, `wikitext-103-raw-v1` (commit `b08601e0`)
- Dataset de evaluacion en codigo: `openai/openai_humaneval` (commit `7dce6050`)
