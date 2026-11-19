# nesicn/nc-turkce-bpe-32k-qwen3.8-27b

## Resumen

`nesicn/nc-turkce-bpe-32k-qwen3.8-27b` es un tokenizer para el modelo Qwen3.8-27B, publicado por el usuario nesicn, que sustituye parte del vocabulario original por uno entrenado específicamente para turco (NC-32k). No es un modelo de lenguaje: es un componente de tokenización que se distribuye con la librería `transformers` y licencia Apache-2.0. Su relevancia radica en que el turco es una lengua aglutinante y morfológicamente compleja, para la que los tokenizers multilingües genéricos producen una fragmentación muy alta.

El tokenizer mantiene el tamaño de vocabulario original (248.077) y los IDs de tokens especiales, pero reemplaza los 21.991 tokens de ID más alto de Qwen3.8-27B por 21.991 tokens del vocabulario turco NC-32k. Según la model card, esto reduce el número de tokens en turco un 27,9 % sobre el mismo texto (de 312,5 a 223,9 tokens por cada 1.000 caracteres) y eleva la F1 de frontera morfológica de 32,55 a 57,92. El coste es un aumento del 6,3 % en inglés y una reducción del 1,8 % en código.

La advertencia principal es explícita: los nuevos tokens ocupan IDs cuyos embeddings en el modelo original corresponden a tokens descartados, por lo que el tokenizer no puede usarse directamente con los pesos de Qwen3.8-27B sin inicializar y entrenar los embeddings de los nuevos tokens. El repositorio incluye un mapa (`merged-to-original-token-ids.json`) para facilitar esa inicialización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizer); fusión de vocabulario NC-32k sobre el tokenizer de Qwen3.8-27B |
| Parametros totales | no disponible (es un tokenizer, no un modelo de lenguaje) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (heredada del modelo Qwen3.8-27B, no especificada en la información) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json` (librería `transformers`) |

## Arquitectura y entrenamiento

El componente es un tokenizer byte-level BPE construido en dos fases. Primero se tomó el vocabulario turco NC-32k, entrenado desde cero sobre texto turco, y se convirtió su `tokenizer.json` al formato textual que espera la herramienta de fusión (token de byte a texto, espacio a `▁`, byte único a `<0xXX>`); 43 tokens de NC que representaban fragmentos UTF-8 incompletos se descartaron por no poder convertirse. Después se aplicó `bpe-tokenizer-editor` 0.2.0 con `merge_from(nc, max_vocab_size=248077)`, de modo que las reglas de fusión de NC se anteponen a las del tokenizer original y los 21.991 tokens de mayor ID de Qwen3.8-27B se descartan para dejar sitio.

La innovación técnica destacable es la reparación de accesibilidad aplicada a la lista de fusiones. Al anteponer las reglas turcas, 63.914 tokens de Qwen3.8-27B dejaban de poder construirse desde sus propios caracteres, lo que inflaba el inglés (+28,2 %) y el código (+11,8 %). Para corregirlo se añadieron 40.616 reglas de fusión al final de la lista (de 250.437 a 291.053 reglas), con la prioridad más baja posible, de forma que solo actúan cuando las reglas principales no producen el token. Para 9.241 tokens no existía camino en el vocabulario (por ejemplo, `ackage` queda en `ac · ka · ge`) y no se añadieron tokens nuevos. La alternativa de `ignore_merges=true` se descartó porque `transformers` la ignora al cargar el modelo con su clase `Qwen3_5Tokenizer`, lo que habría producido segmentaciones distintas según el cargador.

## Capacidades

- Tokenización byte-level BPE sin pérdida: `decode(encode(x)) == x` en todos los textos de prueba, sin generar `<unk>`.
- Reducción del 27,9 % en el número de tokens para texto turco respecto al tokenizer original.
- Mejora de la F1 de frontera morfológica de 32,55 a 57,92, lo que preserva mejor los límites de sufijos y flexiones del turco.
- Segmentación de palabras completas en casos que el original fragmentaba: `Cumhurbaşkanlığı` y `gerçekleştirilmiştir` pasan de tres tokens a uno.
- Mantiene el vocabulario de 248.077 tokens y los IDs de tokens especiales del original, lo que simplifica la integración en pipelines existentes.
- Compatibilidad con el normalizador, pre-división, decoder, plantilla y plantilla de chat del tokenizer de destino.
- Conserva tokens de código e inglés con una penalización medida de +6,3 % en inglés y −1,8 % en código.
- No incluye capacidades de generación, razonamiento, tool calling ni agentes: es exclusivamente un tokenizer.

## Casos de uso

- Adaptación de Qwen3.8-27B al turco en producción: sustituir el tokenizer original por este antes de un fine-tuning o de un continued pretraining, reduciendo casi un 28 % los tokens procesados por documento y, por tanto, el coste de inferencia y la longitud efectiva consumida del contexto en textos turcos.
- Preentrenamiento de embeddings para nuevos tokens: usar `merged-to-original-token-ids.json` para inicializar los embeddings de los 21.991 tokens NC a partir de los tokens originales que reemplazan, y entrenar después esos embeddings sobre corpus turco antes de desplegar el modelo.
- Sistemas de búsqueda y recuperación (RAG) sobre documentación en turco: al reducir el número de tokens por 1.000 caracteres, caben más pasajes en la ventana de contexto del modelo y se abarata el cálculo de embeddings y el reranking.
- Procesamiento de lenguaje natural turco con dependencia morfológica: análisis morfológico, etiquetado y lematización se benefician de la F1 de frontera de 57,92 frente a 32,55, porque los sufijos quedan aislados de forma más consistente.
- Evaluación comparativa de tokenizers para lenguas aglutinantes: sirve como referencia reproducible para medir fertility, tokens por 1.000 caracteres y F1 morfológica frente a tokenizers multilingües genéricos.
- Investigación en vocabularios híbridos turco-inglés: el par de métricas (+6,3 % en inglés, −1,8 % en código) permite estudiar el compromiso entre cobertura de lengua minoritaria y degradación de código en modelos bilingües.
- Integración en pipelines de `transformers` ya existentes: al conservar tamaño de vocabulario y IDs especiales, el cambio de tokenizer no obliga a redimensionar la capa de embeddings del modelo.

## Benchmarks y rendimiento

| Metrica | NC-32k + Qwen3.8-27B | Qwen3.8-27B (original) | NC-32k |
|---|---|---|---|
| Tokens turco / 1.000 caracteres | 223,9 | 312,5 | no disponible |
| Variación de tokens en turco | −27,9 % | referencia | no disponible |
| F1 de frontera morfológica | 57,92 | 32,55 | no disponible |
| Variación de tokens en inglés | +6,3 % | referencia | no disponible |
| Variación de tokens en código | −1,8 % | referencia | no disponible |
| Pérdida en decodificación | ninguna (`decode(encode(x)) == x`) | referencia | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el artefacto es un tokenizer y no un modelo de lenguaje.

## Requisitos de hardware

- No requiere GPU: la tokenización se ejecuta en CPU y el repositorio ocupa 0,0 GB.
- Memoria RAM necesaria: del orden de decenas de megabytes para cargar el vocabulario y las reglas de fusión en memoria.
- Latencia y throughput: no disponibles en la información proporcionada.
- Despliegue: cualquier entorno con `transformers` (versión 5.22.2 citada en la model card); puede cargarse como `TokenizersBackend` de forma autónoma o como `Qwen3_5Tokenizer` junto con el `config.json` del modelo, con resultados de tokenización idénticos.
- El coste real de hardware lo determina el modelo Qwen3.8-27B al que se acople, no este repositorio.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|
| nc-turkce-bpe-32k-qwen3.8-27b | 248.077 | tr, en | Apache-2.0 | Fusión de vocabulario turco sobre Qwen3.8-27B |
| Qwen3.8-27B (tokenizer original) | 248.077 | multilingüe | Apache-2.0 | BPE multilingüe de propósito general |
| NC-32k | no disponible | tr | no disponible | BPE byte-level entrenado desde cero en turco |

La comparación con otros tokenizers especializados en turco no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No debe usarse directamente con los pesos de Qwen3.8-27B: los 21.991 tokens nuevos ocupan IDs cuyos embeddings en el modelo original pertenecen a tokens descartados. Sin inicializar y entrenar esos embeddings, el modelo no funcionará correctamente con este tokenizer.
- Degradación medida en inglés (+6,3 % de tokens) y en código (−1,8 %), con casos concretos de fragmentación como `struct` → `st · ru · ct` o `probably` → `pro · bab · ly`.
- 9.241 tokens de Qwen3.8-27B no tienen camino de reconstrucción en el vocabulario fusionado (por ejemplo, `ackage` queda en `ac · ka · ge`); no se añadieron tokens para resolverlo.
- 43 tokens de NC-32k quedaron fuera por representar fragmentos UTF-8 incompletos.
- El nombre de clase en `tokenizer_config.json` se cambió de `Qwen2Tokenizer` a `PreTrainedTokenizerFast`, lo que puede afectar a código que dependa de la clase concreta.
- El repositorio no incluye pesos ni datos de entrenamiento; la licencia Apache-2.0 cubre el tokenizer, pero el uso comercial del modelo base queda sujeto a la licencia de Qwen3.8-27B.
- Sin datos publicados sobre sesgos, alucinación o comportamiento en dominios especializados, al no tratarse de un modelo generativo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de las métricas declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-32k-qwen3.8-27b
- Vocabulario NC-32k: https://huggingface.co/nesicn/nc-turkce-bpe-32k
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de fusión `bpe-tokenizer-editor`: https://github.com/malibayram/bpe-tokenizer-editor
