# nesicn/nc-turkce-bpe-128k-qwen3.8-27b

## Resumen

`nesicn/nc-turkce-bpe-128k-qwen3.8-27b` es un tokenizer para transformers, no un modelo de lenguaje completo. Se trata del tokenizer de Qwen3.8-27B extendido con el vocabulario turco de NC-128k, un byte-level BPE entrenado desde cero sobre texto turco. El autor es `nesicn` y el artefacto se publica bajo licencia Apache 2.0 con soporte declarado para turco e inglés.

El problema que aborda es la ineficiencia del tokenizer original de Qwen sobre turco: el vocabulario de Qwen3.8-27B fragmenta agresivamente las palabras turcas por su morfología aglutinante. Según la model card, el tokenizer extendido reduce el consumo en turco un 36,4 % (de 312,5 a 197,6 tokens por 1.000 caracteres) y eleva el F1 de frontera morfológica de 32,55 a 57,31, a costa de un aumento del 4,3 % en inglés y una reducción del 3,0 % en código.

La relevancia es práctica: permite abaratar y acelerar la inferencia en turco sin cambiar el tamano del vocabulario (248.077 tokens) ni los IDs de tokens especiales. Sin embargo, el propio autor advierte de que no debe usarse directamente con los pesos originales de Qwen3.8-27B, porque los 103.136 tokens nuevos ocupan los IDs de los tokens de mayor ID que fueron desplazados y carecen de embeddings entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizer), basado en el tokenizer de Qwen3.8-27B |
| Parametros totales | no disponible (es un tokenizer, no un modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (heredada del modelo Qwen3.8-27B, no especificada) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json`, `merged-to-original-token-ids.json` |

## Arquitectura y entrenamiento

El artefacto es un tokenizer byte-level BPE construido combinando dos vocabularios. El vocabulario base es el de Qwen3.8-27B (248.077 entradas) y se le injerta el vocabulario turco de NC-128k, un BPE entrenado desde cero sobre corpus turco. La fusion se realizo con la herramienta `bpe-tokenizer-editor` 0.2.0 mediante `BPETokenizerEditor(hedef).merge_from(nc, max_vocab_size=248077)`, colocando las reglas de merge de NC por delante de las del tokenizer original. Los 103.136 tokens de NC se instalaron en los IDs de los 103.136 tokens de Qwen de mayor ID, que fueron descartados; el resto de IDs permanece inalterado.

Se aplico una reparacion de alcanzabilidad sobre la lista de merges: 37.816 tokens de Qwen habian quedado inconstruibles a partir de sus caracteres porque las reglas de NC se ejecutaban antes. Para cada uno se anadieron reglas de merge al final de la lista (27.234 reglas, de 256.186 a 283.420) que reconstruyen el token desde sus piezas ya presentes en el vocabulario, con la prioridad mas baja posible. El autor documenta que estas reglas no incrementan el numero de tokens en ningun texto y no rompen ningun token construible, verificado sobre el vocabulario completo. Se descarto `ignore_merges=true` porque `transformers`, al cargar con `Qwen3_5Tokenizer`, ignora ese ajuste y produciria segmentaciones distintas segun el cargador.

## Capacidades

- Tokenizacion byte-level BPE sin produccion de `<unk>`: `decode(encode(x)) == x` en todos los textos de prueba.
- Reduccion del 36,4 % en tokens para turco (312,5 a 197,6 tokens por 1.000 caracteres).
- Mejora del F1 de frontera morfologica de 32,55 a 57,31 en turco.
- Segmentacion mas limpia de palabras turcas aglutinantes: `evlerimizden` pasa de `ev · lerimiz · den` a `ev · lerimizden`; `Cumhurbaşkanlığı` deja de fragmentarse en tres piezas.
- Mantiene el rendimiento en ingles con un coste del 4,3 % en tokens y mejora del 3,0 % en codigo.
- Compatibilidad con `transformers` 5.22.2, tanto cargado como `TokenizersBackend` como con el `config.json` del modelo (`Qwen3_5Tokenizer`), produciendo los mismos IDs que `tokenizer.json`.
- Normalizador, pre-tokenizador, decoder, plantilla y plantilla de chat identicos a los del tokenizer de destino.
- Mapa `merged-to-original-token-ids.json` que traduce cada ID nuevo a los IDs del tokenizer original, util para inicializar embeddings.
- No incluye capacidades de generacion, razonamiento, vision ni tool calling: es exclusivamente un tokenizer.

## Casos de uso

- Adaptacion de Qwen3.8-27B al turco: inicializar los embeddings de los 103.136 tokens nuevos a partir de `merged-to-original-token-ids.json` y continuar el preentrenamiento o hacer fine-tuning, reduciendo el coste por token en turco un 36,4 %.
- Fine-tuning supervisado en turco con presupuesto de contexto limitado: al consumir menos tokens por caracter, cabe mas texto real en la misma ventana del modelo.
- Reduccion de coste de inferencia en produccion para aplicaciones turcas: menos tokens de entrada y salida implican menos operaciones y menor latencia, con el mismo tamano de vocabulario y sin tocar los IDs especiales.
- Pipeline de NLP turco (clasificacion, NER, analisis morfologico): el F1 de frontera morfologica de 57,31 frente a 32,55 facilita tareas que dependen de prefijos y sufijos.
- Evaluacion comparativa de tokenizers: sirve como referencia reproducible para medir fertility y F1 morfologico en turco frente al tokenizer original de Qwen.
- Sistemas bilingues turco-ingles: el artefacto mantiene ambos idiomas con un coste controlado en ingles (+4,3 %) y una mejora en codigo (-3,0 %), adecuado para asistentes tecnicos en turco que citan codigo.
- Investigacion sobre extension de vocabularios: la reparacion de alcanzabilidad documentada (27.234 reglas anadidas) es un caso de estudio replicable para quien injerte vocabularios en tokenizers existentes.

## Benchmarks y rendimiento

| Metrica | Qwen3.8-27B (original) | NC-128k | Este tokenizer |
|---|---|---|---|
| Tokens turco por 1.000 caracteres (↓) | 312,5 | no disponible en el extracto | 197,6 (-36,4 %) |
| F1 frontera morfologica turco (↑) | 32,55 | no disponible en el extracto | 57,31 |
| Tokens ingles (variacion) | referencia | no disponible | +4,3 % |
| Tokens codigo (variacion) | referencia | no disponible | -3,0 % |
| Perdida (round-trip) | sin datos | sin datos | `decode(encode(x)) == x` en todos los textos de prueba |

La model card incluye una tabla de medicion adicional (tokens/1.000, fertility y F1 por tokenizer) que aparece truncada en la informacion disponible; no se reproducen las celdas no visibles.

## Requisitos de hardware

- No aplica VRAM para el tokenizer en si: el repositorio ocupa 0,0 GB y solo contiene ficheros JSON.
- El coste de hardware relevante es el del modelo Qwen3.8-27B con el que se combine, no el del tokenizer.
- El ahorro del 36,4 % en tokens turcos reduce proporcionalmente el coste de computo y memoria de activaciones durante la inferencia en turco, pero no altera los requisitos de pesos del modelo.
- Despliegue: compatible con `transformers` (version 5.22.2 citada por el autor). No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Turco (tokens/1.000) | F1 morfologico | Licencia | Idiomas |
|---|---|---|---|---|---|
| Este artefacto (NC + Qwen3.8-27B) | 248.077 | 197,6 | 57,31 | Apache 2.0 | tr, en |
| Tokenizer original Qwen3.8-27B | 248.077 | 312,5 | 32,55 | Apache 2.0 (segun el modelo base) | multilingue |
| NC-128k (tokenizer turco puro) | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible | tr |

No se dispone de datos de otros tokenizers comparables (por ejemplo, adaptaciones turcas de Llama o Mistral) en la informacion proporcionada.

## Limitaciones y advertencias

- No usar directamente con los pesos originales de Qwen3.8-27B: los 103.136 tokens nuevos ocupan IDs cuyos embeddings en el modelo original corresponden a tokens descartados. Sin inicializar y entrenar esos embeddings, el modelo no funciona correctamente con este tokenizer.
- El mapa `merged-to-original-token-ids.json` es imprescindible para inicializar embeddings; para tokens nuevos devuelve los IDs de las piezas originales, no un embedding ya entrenado.
- 5.420 tokens de Qwen no tienen ruta de reconstruccion con tokens del vocabulario (por ejemplo `␣struct`); el autor no anadio tokens nuevos para resolverlo, por lo que esos casos siguen fragmentandose.
- 163 tokens de NC no se incorporaron por ser fragmentos UTF-8 incompletos.
- Coste en ingles: +4,3 % de tokens; en codigo mejora un 3,0 %, pero el equilibrio no es neutro para todos los dominios.
- La clase del tokenizer en `tokenizer_config.json` se cambio de `Qwen2Tokenizer` a `PreTrainedTokenizerFast`; el autor remite a la seccion de limitaciones de la model card (truncada en la informacion disponible) para el motivo.
- Solo se declaran turco e ingles; el comportamiento en otros idiomas del vocabulario original de Qwen no esta documentado.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de embeddings entrenados limita su utilidad inmediata sin trabajo adicional de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-128k-qwen3.8-27b
- Tokenizer turco NC-128k: https://huggingface.co/nesicn/nc-turkce-bpe-128k
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de fusion `bpe-tokenizer-editor`: https://github.com/malibayram/bpe-tokenizer-editor
