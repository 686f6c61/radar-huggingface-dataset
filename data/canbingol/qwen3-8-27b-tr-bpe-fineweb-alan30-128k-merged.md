# canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-128k-merged

## Resumen

`canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-128k-merged` es un tokenizer BPE fusionado (merged) publicado por el usuario canbingol en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un artefacto de tokenizacion que combina el vocabulario del tokenizer original de `Qwen/Qwen3.8-27B` con un tokenizer BPE entrenado especificamente para turco (`canbingol/tr-bpe-fineweb-alan30-128k`). El objetivo es reducir el numero de tokens necesarios para representar texto en turco, un idioma tradicionalmente penalizado por los tokenizers entrenados con predominio de ingles y chino.

El resultado es un vocabulario final de 262.144 entradas y 268.468 reglas de merge, generado con la herramienta `bpe-tokenizer-editor` de malibayram, que soporta conversion de formato ByteLevel entre tokenizer fuente y destino. El repositorio tiene un tamano de 0,0 GB, lo que es coherente con un artefacto que solo contiene ficheros de tokenizer (`tokenizer.json`, `vocab`, `merges`, `tokenizer_config.json`) y no pesos del modelo.

La relevancia de esta publicacion es acotada pero concreta: sirve como pieza para quien quiera hacer fine-tuning o continuar el preentrenamiento de Qwen3.8-27B sobre corpus turcos con una tokenizacion mas eficiente. No es un modelo desplegable por si mismo ni incluye pesos, benchmarks ni pipeline asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de tokenizer, no modelo) |
| Parametros totales | no disponible (el modelo base Qwen3.8-27B tiene 27B, segun su nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el sufijo "128k" del tokenizer turco sugiere entrenamiento sobre ventanas de 128k, no contexto del modelo) |
| Tipos de cuantizacion | no disponible (no aplica a tokenizers) |
| Idiomas soportados | tr, en |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto de tokenizer; previsiblemente `tokenizer.json`, `vocab.json`, `merges.txt`, `tokenizer_config.json`) |
| Vocabulario final | 262.144 tokens |
| Reglas de merge | 268.468 |
| Modelo base asociado | Qwen/Qwen3.8-27B |
| Tokenizer fuente turco | canbingol/tr-bpe-fineweb-alan30-128k |
| Herramienta de fusion | bpe-tokenizer-editor (malibayram) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo neuronal, sino un tokenizer de tipo Byte Pair Encoding (BPE) con pre-tokenizacion ByteLevel, resultante de fusionar dos vocabularios: el del tokenizer oficial de Qwen3.8-27B y el del tokenizer turco `tr-bpe-fineweb-alan30-128k`. La fusion se realizo con `bpe-tokenizer-editor`, que permite convertir entre formatos ByteLevel de origen y destino y combinar reglas de merge preservando la coherencia del vocabulario.

No se dispone de informacion sobre la composicion exacta del corpus turco usado para entrenar el tokenizer de origen (el nombre "fineweb" sugiere FineWeb, y "alan30" podria referirse a un subconjunto o filtro de 30 dominios, pero no se confirma en la model card). Tampoco se documenta el numero de tokens de entrenamiento, el proceso de validacion de fertilidad (tokens por palabra) ni comparaciones con el tokenizer original de Qwen en corpus turcos. La innovacion tecnica declarada es la fusion de vocabularios con conversion ByteLevel, que permite anadir cobertura turca sin descartar el vocabulario original del modelo base.

## Capacidades

- Tokenizacion y detokenizacion de texto en turco e ingles con un vocabulario de 262.144 entradas.
- Reduccion esperada del numero de tokens por palabra en turco respecto al tokenizer original de Qwen3.8-27B (no se aportan metricas de fertilidad en la model card).
- Compatibilidad con la API `AutoTokenizer` de Transformers.
- Preservacion del vocabulario original de Qwen3.8-27B, lo que permite reutilizar el tokenizer fusionado en flujos que ya usaban el modelo base.
- No incluye pesos, por lo que no genera texto, no razona, no hace tool calling ni soporta agentes por si mismo.
- No se documentan capacidades multilingues mas alla de tr y en.

## Casos de uso

- Fine-tuning de Qwen3.8-27B sobre corpus turcos: sustituir el tokenizer original por este fusionado para reducir la longitud de las secuencias y, con ello, el coste computacional por ejemplo durante el entrenamiento.
- Continuacion de preentrenamiento (continued pretraining) en turco: usar el tokenizer fusionado para adaptar el modelo base a dominios turcos (legal, medico, prensa) con mejor compresion de texto.
- Evaluacion de fertilidad de tokenizers: comparar `len(tokenizer.encode(texto))` entre este tokenizer y el original de Qwen en un corpus turco de validacion para medir la ganancia real.
- Pipelines de procesamiento de lenguaje natural en turco: usar el tokenizer como componente de preprocesado en sistemas de clasificacion, NER o resumen que operen sobre el modelo base reentrenado.
- Investigacion sobre tokenizers multilingues: estudiar el efecto de fusionar vocabularios especializados con vocabularios generalistas en terminos de cobertura, merges y equilibrio entre idiomas.
- Reproducibilidad de experimentos: servir como artefacto versionado para replicar experimentos de adaptacion al turco de la familia Qwen3.8 sin reentrenar el tokenizer desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de fertilidad (tokens por palabra), comparaciones con el tokenizer original de Qwen3.8-27B ni evaluaciones downstream del modelo base con el tokenizer fusionado.

## Requisitos de hardware

- Inferencia: no aplica, el repositorio no contiene pesos. El coste de cargar el tokenizer es despreciable (ficheros de unos pocos MB en memoria).
- GPU: no aplica para el tokenizer. Para el modelo base Qwen3.8-27B, la VRAM necesaria depende de la cuantizacion y no se documenta en esta ficha.
- Consumer GPU: el tokenizer cabe en cualquier equipo; el modelo base de 27B requeriria cuantizacion agresiva para caber en GPUs de consumo, dato no confirmado en la informacion disponible.
- Despliegue: el tokenizer es compatible con `transformers.AutoTokenizer`. Para el modelo base se usarian las herramientas habituales (vLLM, llama.cpp, TGI, Ollama), pero no se aportan datos especificos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-128k-merged | Tokenizer fusionado | 262.144 | tr, en | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (tokenizer original) | Tokenizer del modelo base | no disponible en esta ficha | multilingue (segun Qwen) | no disponible | Hugging Face |
| canbingol/tr-bpe-fineweb-alan30-128k | Tokenizer turco de origen | no disponible en esta ficha | tr | no disponible | Hugging Face |

No se dispone de informacion suficiente para comparar con otros tokenizers turcos de referencia (por ejemplo, variantes de Turkcell o de la comunidad) ni con modelos completos de tamano similar.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse para inferencia sin un modelo base entrenado con este tokenizer.
- La licencia no esta declarada en la model card, lo que impide confirmar si se permite uso comercial. Es un riesgo relevante para produccion.
- No se documentan metricas de fertilidad ni de cobertura, por lo que la mejora real sobre el tokenizer original de Qwen3.8-27B en turco no esta cuantificada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El tokenizer solo declara soporte para tr y en; otros idiomas presentes en el vocabulario original de Qwen pueden comportarse de forma distinta tras la fusion.
- Cualquier modelo reentrenado con este tokenizer debe reentrenar tambien la capa de embeddings y la cabeza de salida, ya que el vocabulario ha cambiado respecto al original.
- Riesgo de alucinacion y sesgos: no aplica al tokenizer, pero si al modelo base que se entrene con el; no se documentan evaluaciones de sesgo.
- No se especifica la version exacta de Qwen3.8-27B utilizada como base, lo que puede complicar la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-128k-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Tokenizer turco de origen: https://huggingface.co/canbingol/tr-bpe-fineweb-alan30-128k
- Herramienta de fusion: https://github.com/malibayram/bpe-tokenizer-editor
