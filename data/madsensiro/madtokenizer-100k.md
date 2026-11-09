# MadSensiro/MadTokenizer-100K

## Resumen

MadTokenizer-100K es un tokenizador de tipo byte-level BPE para ingles desarrollado por el usuario MadSensiro y publicado en Hugging Face bajo licencia MIT. No es un modelo de lenguaje: se trata exclusivamente de un tokenizador entrenado desde cero, sin pesos de red neuronal asociados, por lo que su funcion es convertir texto en secuencias de identificadores y viceversa. Su relevancia practica es limitada fuera de experimentos de preentrenamiento propios, pero resulta util como componente reutilizable para quien quiera construir un modelo con un vocabulario grande y receta GPT-2.

El tokenizador emplea la misma receta que GPT-2 (BPE byte-level con pre-tokenizador ByteLevel y marcador de espacio inicial `Ġ`), con un vocabulario de 100.000 tokens. Se entreno a partir de wikitext-103 en crudo (aproximadamente 538 millones de caracteres) y se ajusto despues sobre multi_news. Al ser byte-level, cualquier secuencia de bytes es decodificable y no se generan tokens `<unk>` en texto arbitrario, incluyendo Unicode y emojis.

La ficha se centra en sus caracteristicas como tokenizador, ya que la model card no documenta ningun modelo de lenguaje asociado ni resultados de evaluacion. El repositorio incluye unicamente los ficheros propios de un tokenizador rapido de Hugging Face (`tokenizer.json`, `vocab.json`, `merges.txt`, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica: no hay pesos de modelo) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | Ingles (entrenado en corpus en ingles; byte-level permite codificar cualquier texto) |
| Licencia | MIT |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`, `vocab.json`, `merges.txt` |

Datos adicionales del tokenizador:

| Parametro | Valor |
|---|---|
| Tamano de vocabulario | 100.000 tokens |
| Tokens especiales | `<s>`, `<pad>`, `</s>`, `<unk>`, `<mask>` |
| Corpus de entrenamiento | wikitext-103 (raw, ~538M caracteres) + multi_news |
| Libreria de entrenamiento | `tokenizers` de Hugging Face (`BpeTrainer`, `ByteLevel`, `min_frequency=2`) |
| Pre-tokenizador | ByteLevel |
| Marcador de inicio de palabra | `Ġ` (comportamiento estandar de GPT-2) |
| Pipeline declarado | token-classification |

## Arquitectura y entrenamiento

El tokenizador sigue la receta de GPT-2: BPE a nivel de byte con pre-tokenizacion ByteLevel. La tokenizacion byte-level garantiza cobertura total del rango de bytes UTF-8, de modo que cualquier cadena de entrada es representable y decodificable sin tokens desconocidos. El vocabulario resultante tiene 100.000 entradas, un tamano considerablemente mayor que el de GPT-2 (50.257) o Llama 2 (32.000), lo que reduce la longitud media de las secuencias a costa de una matriz de embeddings mas grande si se usa en un LM.

El entrenamiento se realizo con la libreria `tokenizers` de Hugging Face usando `BpeTrainer` con `min_frequency=2`, sobre wikitext-103 en crudo (aproximadamente 538 millones de caracteres) y posteriormente ajustado sobre el dataset multi_news. No se documenta el numero exacto de tokens de entrenamiento ni la mezcla final de ambos corpus. No hay informacion sobre innovaciones tecnicas adicionales, decodificacion especulativa ni tecnicas de atencion, ya que no existe modelo neuronal asociado.

## Capacidades

- Tokenizacion y detokenizacion de texto en ingles con vocabulario de 100.000 tokens.
- Codificacion byte-level: maneja Unicode, espacios multiples y emojis sin producir `<unk>`.
- Compatibilidad con `AutoTokenizer` de Transformers mediante carga de tokenizer rapido.
- Definicion de tokens especiales (`<s>`, `<pad>`, `</s>`, `<unk>`, `<mask>`) lista para usar en tareas de clasificacion de tokens o secuencia.
- No incluye generacion de texto, razonamiento, codigo, matematicas ni vision: no hay pesos de modelo.
- No soporta tool calling, function calling ni razonamiento multi-paso por si mismo.
- Capacidad multilingue limitada en la practica: el vocabulario se entreno solo con corpus en ingles, por lo que la eficiencia de compresion en otros idiomas sera peor, aunque la codificacion byte-level siga siendo valida.

## Casos de uso

- Preentrenamiento de un modelo de lenguaje propio: usar este tokenizador como base para entrenar un transformer desde cero con un vocabulario grande, aprovechando que ya esta serializado en formato compatible con Hugging Face.
- Clasificacion de tokens (NER, POS, chunking): el pipeline declarado es `token-classification` y los tokens especiales estan definidos, por lo que puede integrarse en un `TokenClassificationPipeline` junto con un cabezal entrenado aparte.
- Analisis de compresion y longitud de secuencias: comparar la longitud media de tokenizacion frente a otros vocabularios (GPT-2, Llama) sobre corpus en ingles para decidir el vocabulario de un modelo futuro.
- Investigacion sobre vocabularios grandes: estudiar el efecto de un vocabulario de 100.000 tokens en el equilibrio entre tamano de embeddings y longitud de contexto efectiva.
- Procesamiento de texto con caracteres especiales: al ser byte-level, es adecuado para pipelines que reciben texto sucio, con emojis o mezcla de alfabetos, donde otros tokenizadores generarian `<unk>`.
- Tokenizacion de resumenes de noticias: el ajuste sobre multi_news lo hace razonablemente adecuado para corpus de noticias y resumenes en ingles, aunque no se han publicado metricas de compresion.
- Base para tokenizadores multilingues: punto de partida para anadir vocabulario de otros idiomas mediante entrenamiento adicional sobre corpus multilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un tokenizador sin modelo de lenguaje asociado, no aplican metricas como MMLU, HumanEval o GSM8K. Tampoco se documentan metricas propias de tokenizadores (tokens por palabra, tasa de compresion, fertilidad) sobre wikitext-103 o multi_news.

## Requisitos de hardware

- VRAM: no requiere GPU. El tokenizador es un componente de CPU con huella de memoria de unos pocos megabytes (vocabulario de 100.000 entradas y reglas de merge).
- GPU recomendadas: no aplica; cualquier CPU es suficiente.
- Cabe en cualquier maquina, incluidos entornos sin GPU y contenedores ligeros.
- Despliegue: mediante `transformers.AutoTokenizer`, la libreria `tokenizers` o cualquier runtime compatible con tokenizadores de Hugging Face. No requiere vLLM, llama.cpp ni TGI, que estan pensados para modelos con pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un tokenizador rapido (Rust), la latencia por cadena es del orden de microsegundos a milisegundos segun longitud, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Tipo | Idiomas de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MadTokenizer-100K | 100.000 | Byte-level BPE | Ingles | MIT | Hugging Face |
| GPT-2 tokenizer | 50.257 | Byte-level BPE | Ingles (mayoritariamente) | MIT | Hugging Face |
| Llama 2 tokenizer | 32.000 | BPE (SentencePiece) | Multilingue | Llama 2 Community License | Hugging Face |
| T5 tokenizer | 32.000 | SentencePiece Unigram | Multilingue (C4) | Apache 2.0 | Hugging Face |

La comparativa se limita a otros tokenizadores, ya que no existen modelos de lenguaje comparables asociados a este repositorio. No se dispone de datos de rendimiento (compresion, fertilidad) para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni resuelve tareas de razonamiento, codigo o matematicas. Cualquier uso como modelo conversacional es invalido.
- Vocabulario entrenado exclusivamente con corpus en ingles (wikitext-103 y multi_news); la eficiencia de tokenizacion en otros idiomas sera inferior y no esta medida.
- No se han publicado metricas de calidad del tokenizador (tokens por palabra, tasa de compresion, cobertura), por lo que no se puede validar su rendimiento frente a alternativas establecidas.
- El ajuste sobre multi_news puede introducir sesgos hacia el estilo periodistico y de resumenes, en detrimento de otros dominios.
- El pipeline declarado (`token-classification`) no implica que exista un cabezal de clasificacion entrenado; el usuario debe aportar el modelo de clasificacion.
- El marcador `Ġ` provoca que la decodificacion de cadenas sueltas pueda anteponer un espacio, comportamiento estandar de GPT-2 pero que puede sorprender en comparaciones exactas de cadenas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero al no haber modelo asociado no hay garantias de calidad ni soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por la comunidad.
- Riesgo de alucinacion: no aplica al no generar texto, pero si se usa como base de un LM futuro, los sesgos del corpus de entrenamiento del LM (no de este tokenizador) serian los relevantes.

## Enlaces

- Hugging Face: https://huggingface.co/MadSensiro/MadTokenizer-100K
- Dataset wikitext (Salesforce): https://huggingface.co/datasets/Salesforce/wikitext
- Dataset multi_news: https://huggingface.co/datasets/multi_news
- Libreria `tokenizers` de Hugging Face: https://github.com/huggingface/tokenizers
