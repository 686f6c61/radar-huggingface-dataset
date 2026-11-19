# nesicn/nc-turkce-bpe-64k-muse-glimmer-30b

## Resumen

`nc-turkce-bpe-64k-muse-glimmer-30b` no es un modelo de lenguaje, sino un **tokenizer** publicado por el usuario `nesicn` en Hugging Face. Concretamente, es el tokenizer del modelo Muse-Glimmer-30B (202.048 tokens de vocabulario) al que se le ha injertado el vocabulario turco de NC-64k, un BPE byte-level entrenado desde cero sobre corpus turco. El objetivo es mejorar la eficiencia de tokenización del turco sin cambiar el tamano del vocabulario ni los IDs de los tokens especiales.

La relevancia practica esta en la reduccion de coste computacional y de longitud de secuencia para texto turco: segun la model card, el mismo texto consume un 27,5 % menos de tokens (de 275,4 a 198,4 tokens por cada 1.000 caracteres) y el F1 de frontera morfologica sube de 36,20 a 57,20. El precio es un ligero empeoramiento en ingles (+3,1 % de tokens) y en codigo (+1,0 %), ademas de que el 5,2 % de las segmentaciones inglesas originales dejan de reproducirse.

Es importante subrayar que el paquete **no incluye pesos de modelo** (el repositorio ocupa 0.0 GB y solo contiene artefactos de tokenizer). La propia model card advierte de que no debe usarse directamente con los pesos originales de Muse-Glimmer-30B: los 47.863 tokens NC nuevos ocupan los IDs de los 47.863 tokens de mayor ID del tokenizer original, cuyos embeddings no han sido entrenados para esos nuevos tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer byte-level BPE (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica; el repo no contiene pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo con el que se empareje) |
| Tipos de cuantizacion | no aplica (tokenizer) |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json`, artefactos de tokenizer para `transformers`; no hay safetensors ni GGUF |

Datos adicionales del tokenizer:

| Parametro | Valor |
|---|---|
| Tamano de vocabulario | 202.048 (identico al original) |
| Tokens NC inyectados | 47.863 |
| Tokens del original reemplazados | 47.863 (los de mayor ID) |
| IDs de tokens especiales | sin cambios respecto al original |
| Fichero auxiliar de mapeo | `merged-to-original-token-ids.json` |
| Version de `transformers` citada | 5.22.2 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-19 |

## Arquitectura y entrenamiento

El componente base es un BPE byte-level: el texto se normaliza, se pre-segmenta y se codifica a nivel de byte, de modo que cualquier cadena UTF-8 es representable y no se genera `<unk>`. Sobre esa base, el vocabulario turco de NC-64k (un BPE entrenado desde cero sobre turco) se fusiona en el vocabulario del tokenizer de Muse-Glimmer-30B mediante la herramienta `bpe-tokenizer-editor` 0.2.0, con la llamada `BPETokenizerEditor(hedef).merge_from(nc, max_vocab_size=202048)`.

El proceso de construccion tiene dos pasos tecnicos relevantes. Primero, el `tokenizer.json` de NC se convierte al formato textual que espera la herramienta (token de byte a texto, espacio a `▁`, byte suelto a `<0xXX>`); se descartan 73 tokens NC que son fragmentos UTF-8 incompletos y no se pueden representar como texto. Segundo, las reglas de merge de NC se anteponen a las del tokenizer destino. No se descartan los tokens de un solo caracter, los de forma `<…>` o `[…]`, los especiales del vocabulario, los ya presentes en NC ni los fragmentos UTF-8 incompletos de los caracteres base de NC (los "puentes" de la herramienta). El resto se rellena por orden de ID y se eliminan los de ID mas alto hasta encajar en 202.048.

No hay entrenamiento de pesos ni RLHF/DPO: es un artefacto puramente lexico. El normalizador, la pre-segmentacion, el decoder, la plantilla y la plantilla de chat son identicos a los del tokenizer destino, lo que preserva la compatibilidad con el pipeline original.

## Capacidades

- Tokenizacion y detokenizacion lossless: `decode(encode(x)) == x` en todos los textos de prueba (turco, ingles y codigo), con cero `<unk>`.
- Mejora de eficiencia en turco: 198,4 tokens por 1.000 caracteres frente a 275,4 del original (−27,5 %); fertilidad 1,535 frente a 2,131.
- Mejora de segmentacion morfologica: F1 de frontera morfologica de 57,20 frente a 36,20.
- Preservacion mayoritaria del ingles: el 94,8 % de las pre-segmentaciones inglesas se reproducen igual que en el tokenizer original, con un coste de +3,1 % de tokens.
- Coste minimo en codigo: +1,0 % de tokens (296,1 frente a 293,3 por 1.000 caracteres).
- Compatibilidad con `transformers`: se carga como `TokenizersBackend`, tanto con los ficheros de tokenizer solos como junto al `config.json` del modelo, produciendo los mismos IDs que `tokenizer.json`.
- No incluye tool calling, razonamiento, vision ni agentes: esas capacidades pertenecen al modelo con el que se empareje, no al tokenizer.

## Casos de uso

- **Preentrenamiento y fine-tuning de modelos turcos**: usar este tokenizer como base para entrenar un modelo desde cero o continuar el preentrenamiento de Muse-Glimmer-30B, reduciendo un 27,5 % la longitud de secuencia en turco y, con ello, el coste de atencion y el numero de pasos por documento.
- **Adaptacion de un modelo existente al turco**: inicializar los embeddings de los 47.863 tokens nuevos a partir de `merged-to-original-token-ids.json` (que mapea cada ID nuevo a los IDs de los fragmentos originales) y entrenar solo esos embeddings o hacer un fine-tuning ligero, en lugar de reentrenar el vocabulario completo.
- **Reduccion de coste en inferencia sobre corpus turcos**: en pipelines de clasificacion, extraccion de entidades o resumen sobre texto turco, la menor longitud de token implica menos tokens de entrada y salida facturados por API y menor latencia por peticion.
- **Sistemas de busqueda y recuperacion (RAG) en turco**: con un tokenizer mas eficiente, cada fragmento de documento cabe en menos tokens, lo que permite indexar mas contexto util dentro de la misma ventana y mejorar la densidad de informacion recuperada.
- **Procesamiento de lenguaje juridico y administrativo turco**: el corpus de evaluacion incluye el Resmii Gazete, con palabras largas y aglutinadas como `Cumhurbaşkanlığı` o `gerçekleştirilmiştir`, que este tokenizer codifica como token unico frente a la fragmentacion en 4-5 piezas del original.
- **Analisis morfologico y herramientas linguisticas**: con un F1 de frontera morfologica de 57,20, es una base mejor para etiquetado morfologico, lematizacion y analisis de sufijos en turco que el tokenizer original.
- **Sistemas bilingues turco-ingles**: al mantener el 94,8 % de las segmentaciones inglesas y un coste de solo +3,1 % en tokens, sirve para productos con contenido mixto sin necesidad de dos tokenizers separados.

## Benchmarks y rendimiento

Los datos disponibles son metricas de tokenizacion, no benchmarks de modelo. Se reproducen a continuacion tal como figuran en la model card.

| Tokenizer | Vocabulario | TR tok/1.000 ↓ | TR fertilidad ↓ | F1 morfologia ↑ | EN tok/1.000 ↓ | Codigo tok/1.000 ↓ | EN segmentado como el original ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Muse-Glimmer-30B (original) | 202.048 | 275,4 | 2,131 | 36,20 | 224,3 | 293,3 | 100 % |
| **Este tokenizer** | 202.048 | 198,4 | 1,535 | 57,20 | 231,2 | 296,1 | 94,8 % |
| NC-64k | 64.000 | 196,9 | 1,522 | 57,10 | 308,6 | 377,3 | no disponible |
| Arcus (Magibu) | 245.353 | 204,7 | 1,583 | 46,08 | 225,1 | 293,8 | 97,6 % |

Metodologia declarada: turco sobre 2.128 documentos y 2,37 M de caracteres, con cuatro dominios de igual peso (Resmii Gazete, Wikipedia, noticias y Eksi Sozluk), todos de 2026; ingles sobre `Salesforce/wikitext` (`wikitext-103-raw-v1`, test, commit `b08601e0`); codigo sobre `openai/openai_humaneval` (test, prompt + `canonical_solution`, commit `7dce6050`); morfologia sobre `turkish-nlp-suite/turkish-morph-analysis`, split `cekimli` (163.112 palabras, commit `ebfe5f56`), codificando cada palabra con espacio inicial y sin contar el limite final como frontera.

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el repositorio no contiene pesos.

## Requisitos de hardware

- El repositorio no contiene pesos: no requiere VRAM ni GPU para cargarse. El tamano del repo es de 0.0 GB y solo incluye artefactos de tokenizer.
- El coste de CPU y memoria es despreciable; la tokenizacion se ejecuta en el proceso del cliente de `transformers`.
- Los requisitos de hardware dependen exclusivamente del modelo con el que se empareje (Muse-Glimmer-30B u otro). Para un modelo de 30B en BF16 se necesitarian del orden de 60 GB de VRAM, cifra estimada por el tamano, no publicada en la informacion disponible.
- Opciones de despliegue del tokenizer: `transformers` (`AutoTokenizer.from_pretrained`), y por extension cualquier servidor que consuma `tokenizer.json` (vLLM, TGI, llama.cpp), siempre que el vocabulario y los IDs sean coherentes con los pesos cargados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion natural es con otros tokenizers, no con modelos. Los datos de la tabla de medicion permiten el siguiente contraste:

| Tokenizer | Vocabulario | TR tok/1.000 | F1 morfologia | EN tok/1.000 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Este tokenizer | 202.048 | 198,4 | 57,20 | 231,2 | Apache 2.0 | Hugging Face, 0 descargas |
| Muse-Glimmer-30B (original) | 202.048 | 275,4 | 36,20 | 224,3 | no disponible | referenciado en la model card |
| NC-64k | 64.000 | 196,9 | 57,10 | 308,6 | no disponible | Hugging Face (`nesicn/nc-turkce-bpe-64k`) |
| Arcus (Magibu) | 245.353 | 204,7 | 46,08 | 225,1 | no disponible | Hugging Face (`magibu/Arcus`) |

Frente a NC-64k, este tokenizer iguala la eficiencia en turco (198,4 frente a 196,9) y mejora claramente en ingles (231,2 frente a 308,6) y en codigo, a cambio de un vocabulario 3,2 veces mayor. Frente a Arcus, gana en turco y en morfologia, pero pierde en preservacion del ingles (94,8 % frente a 97,6 %) y usa un vocabulario menor (202.048 frente a 245.353). No se dispone de datos de licencia ni de rendimiento de modelo para las alternativas.

## Limitaciones y advertencias

- **No es un modelo**: no genera texto, no razona y no tiene pesos. Cualquier expectativa de rendimiento tipo LLM es inaplicable.
- **Incompatible con los pesos originales sin reentrenamiento**: los 47.863 tokens nuevos ocupan los IDs de los tokens de mayor ID del original, cuyos embeddings corresponden a otros tokens. Usarlo directamente con Muse-Glimmer-30B produce salidas incorrectas.
- **Necesita inicializacion y entrenamiento de embeddings**: hay que inicializar los embeddings nuevos (por ejemplo, con `merged-to-original-token-ids.json`) y entrenarlos antes de usar el modelo.
- **Regresion en ingles y codigo**: +3,1 % de tokens en ingles y +1,0 % en codigo, con solo el 94,8 % de las segmentaciones inglesas originales preservadas.
- **Cobertura limitada a dos idiomas**: solo turco e ingles; no hay evaluacion en otros idiomas.
- **Tokens descartados**: 73 tokens NC que son fragmentos UTF-8 incompletos no se incorporaron, por lo que la cobertura lexica turca no es identica a la de NC-64k.
- **Licencia**: Apache 2.0 para el artefacto, pero el uso comercial del modelo resultante depende tambien de la licencia de Muse-Glimmer-30B, que no figura en la informacion disponible.
- **Madurez**: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-19); sin validacion externa ni resultados de benchmarks de modelo.
- **Riesgo de alucinacion y sesgos**: no evaluables a nivel de tokenizer; dependen del modelo con el que se combine y de los corpus de entrenamiento de este.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-64k-muse-glimmer-30b
- Tokenizer NC-64k: https://huggingface.co/nesicn/nc-turkce-bpe-64k
- Tokenizer Arcus (Magibu): https://huggingface.co/magibu/Arcus
- Modelo Muse-Glimmer-30B (referenciado en la model card): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Herramienta `bpe-tokenizer-editor`: https://github.com/malibayram/bpe-tokenizer-editor
- Dataset de evaluacion en ingles: `Salesforce/wikitext`, `wikitext-103-raw-v1` (commit `b08601e0`)
- Dataset de evaluacion en codigo: `openai/openai_humaneval` (commit `7dce6050`)
- Dataset de morfologia: `turkish-nlp-suite/turkish-morph-analysis`, split `cekimli` (commit `ebfe5f56`)
