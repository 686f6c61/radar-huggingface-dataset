# canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-64k-merged

## Resumen

`canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-64k-merged` es un artefacto de tokenizer, no un modelo de lenguaje completo. Se trata de la fusión del tokenizer original de `Qwen/Qwen3.8-27B` con un tokenizer BPE entrenado específicamente para turco (`canbingol/tr-bpe-fineweb-alan30-64k`), con el objetivo de mejorar la eficiencia de tokenización del turco sin perder la cobertura multilingüe del vocabulario original de Qwen.

El resultado es un vocabulario final de 262.144 tokens con 265.557 reglas de merge, generado mediante la herramienta `bpe-tokenizer-editor` de malibayram, que soporta conversión entre formatos ByteLevel de origen y destino. El repositorio no contiene pesos de modelo (tamaño reportado de 0.0 GB), sino únicamente los ficheros del tokenizer.

Es relevante para quien quiera adaptar un modelo Qwen 3.8 de 27.000 millones de parámetros al turco reduciendo el número de tokens por palabra, lo que se traduce directamente en menor coste de inferencia y mayor ventana efectiva de contexto para texto en turco. Sin embargo, la información publicada es muy escasa: no hay model card extendida, ni benchmarks, ni indicaciones sobre el proceso de entrenamiento del tokenizer turco de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene solo tokenizer; el modelo base es Qwen/Qwen3.8-27B) |
| Parametros totales | no disponible (modelo base Qwen3.8-27B: 27B segun nomenclatura) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el sufijo "64k" del tokenizer de origen sugiere vocabulario de 65.536 tokens, no ventana de contexto) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | tr, en |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de tokenizer; ficheros típicos: tokenizer.json, tokenizer_config.json, special_tokens_map.json) |
| Vocabulario final | 262.144 tokens |
| Reglas de merge | 265.557 |
| Herramienta de fusión | bpe-tokenizer-editor (malibayram) |
| Modelo base asociado | Qwen/Qwen3.8-27B |
| Tokenizer turco de origen | canbingol/tr-bpe-fineweb-alan30-64k |

## Arquitectura y entrenamiento

El artefacto es una fusión de vocabularios BPE (Byte-Pair Encoding) con formato ByteLevel. Se parte del tokenizer de `Qwen/Qwen3.8-27B` como vocabulario base y se le incorporan los tokens y reglas de merge del tokenizer turco `tr-bpe-fineweb-alan30-64k`, dando lugar a un vocabulario de 262.144 entradas y 265.557 reglas de merge. La conversión de formato ByteLevel entre origen y destino la realiza la herramienta `bpe-tokenizer-editor`.

No se documenta en la información disponible el corpus utilizado para entrenar el tokenizer turco (el nombre sugiere FineWeb y un subconjunto "alan30", pero no se detalla composición, número de tokens vistos ni criterios de filtrado), ni si hubo ajuste del embedding del modelo base tras la fusión del vocabulario. Tampoco se indica si el modelo base Qwen3.8-27B ha sido reentrenado o adaptado para alinear sus embeddings con el nuevo vocabulario; en caso contrario, los pesos del modelo base no serían directamente compatibles con este tokenizer sin un paso de remapeado de embeddings.

## Capacidades

- Tokenización de texto en turco e inglés con un vocabulario fusionado de 262.144 tokens.
- Mayor eficiencia esperada en turco gracias a la inclusión de tokens y merges específicos del idioma, reduciendo el número de tokens por palabra respecto al tokenizer original de Qwen.
- Compatibilidad de uso mediante `transformers.AutoTokenizer` (ejemplo incluido en la model card).
- Conservación del vocabulario original de Qwen 3.8-27B para mantener cobertura multilingüe general (aunque los idiomas declarados son solo tr y en).
- No incluye pesos de modelo, por lo que no ofrece por sí mismo generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.
- No se documentan modos especiales (thinking mode, visión, audio) en este artefacto.

## Casos de uso

- Adaptación de un pipeline Qwen 3.8-27B al turco: sustituir el tokenizer original por este tokenizer fusionado y, previo remapeado de embeddings, reducir el número de tokens por frase en turco, abaratando la inferencia y ampliando la ventana efectiva de contexto.
- Preprocesado de corpus turcos para fine-tuning: usar el tokenizer para tokenizar datasets en turco antes de entrenar o ajustar el modelo base, con una representación más compacta que la del tokenizer original.
- Evaluación de eficiencia de tokenización: comparar el número de tokens generados por este tokenizer frente al original de Qwen sobre un corpus turco de referencia (por ejemplo, noticias o textos de FineWeb) para cuantificar la ganancia en compresión.
- Investigación sobre vocabularios multilingües: estudiar el efecto de fusionar un vocabulario específico de un idioma de morfología aglutinante como el turco con un vocabulario multilingüe de gran tamaño.
- Despliegue de asistentes en turco con menor coste por token: en pipelines de atención al cliente o generación de documentos en turco, la reducción de tokens por palabra disminuye latencia y coste de API.
- Reproducibilidad de artefactos de tokenizer: servir como referencia para replicar la fusión con `bpe-tokenizer-editor` en otros pares de idioma/modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de compresión de tokens (tokens por palabra en turco), comparaciones con el tokenizer original de Qwen ni evaluaciones downstream del modelo base con el vocabulario fusionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este artefacto, ya que no contiene pesos. Para el modelo base Qwen3.8-27B, la VRAM dependería de la cuantización elegida (no se publican cifras en la información disponible).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible para el modelo base; el tokenizer en sí se ejecuta en CPU.
- Opciones de despliegue: el tokenizer es utilizable con `transformers` (AutoTokenizer); para el modelo base no se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) en esta ficha.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-64k-merged | Tokenizer fusionado | 262.144 | tr, en | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (tokenizer original) | Tokenizer base | no disponible en la información | multilingüe (no detallado) | no disponible | Hugging Face |
| canbingol/tr-bpe-fineweb-alan30-64k | Tokenizer turco | no disponible (sufijo "64k" sugiere 65.536) | tr | no disponible | Hugging Face |

No se dispone de información sobre otros tokenizers fusionados comparables ni sobre métricas que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: no es un modelo utilizable de forma autónoma para generación; requiere emparejarlo con pesos compatibles con el vocabulario fusionado.
- No se documenta si los embeddings del modelo base Qwen3.8-27B han sido remapeados o reentrenados para el nuevo vocabulario; usarlo directamente con pesos originales produciría incoherencias entre IDs de token y embeddings.
- El tokenizer turco de origen (`tr-bpe-fineweb-alan30-64k`) no detalla corpus, tamaño de muestra ni criterios de filtrado, lo que impide evaluar su calidad y posibles sesgos léxicos.
- Idiomas declarados limitados a tr y en; el comportamiento en otros idiomas no está documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse la licencia del modelo base Qwen y del tokenizer de origen antes de producción.
- Riesgo de alucinación y sesgos: no evaluable para este artefacto; dependerá del modelo base y del fine-tuning posterior.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (21-11-2026): artefacto muy reciente y sin validación comunitaria.
- El sufijo "64k" hace referencia al tamaño del vocabulario del tokenizer turco, no a la longitud de contexto; no debe confundirse con la ventana de contexto del modelo base.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-64k-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Tokenizer turco de origen: https://huggingface.co/canbingol/tr-bpe-fineweb-alan30-64k
- Herramienta de fusión: https://github.com/malibayram/bpe-tokenizer-editor
