# egeboy35/Qwen3.8-27B-mret-32k-merged

## Resumen

`egeboy35/Qwen3.8-27B-mret-32k-merged` es un tokenizer extendido para el modelo base `Qwen/Qwen3.8-27B`, desarrollado por el usuario egeboy35. No se trata de un modelo con pesos completos, sino de un artefacto de tokenizacion: anade 22.775 tokens turcos aprendidos mediante el algoritmo MRET 32K al vocabulario original de Qwen3.8-27B, manteniendo intactos los identificadores de los tokens base y especiales. El objetivo es mejorar la compresion y la segmentacion morfologica del turco sin reentrenar el vocabulario desde cero.

La relevancia de este artefacto radica en que el turco es una lengua aglutinante con alta productividad morfologica, lo que provoca que los tokenizers entrenados predominantemente en ingles fragmenten las palabras turcas en muchos subtokens. El autor reporta reducciones de hasta un 34% en tokens por cada 1.000 caracteres en textos oficiales de 2026, ademas de mejoras sustanciales en F1 de fronteras morfologicas (de 32,55 a 58,84) y precision de raiz (de 39,52 a 68,10) frente al tokenizer base.

El repositorio se publica bajo licencia Apache 2.0, esta etiquetado como `image-text-to-text` en el pipeline de Hugging Face (heredado del modelo base multimodal) y solo contiene el tokenizer, no los pesos. Cualquier uso productivo requiere partir de Qwen3.8-27B, redimensionar las embeddings y continuar el preentrenamiento para aprender las nuevas filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE extendido (artefacto de tokenizacion, sin pesos de modelo) |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | no aplica (tokenizer, no pesos) |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica; se distribuye como ficheros de tokenizer (tokenizer.json, tokenizer_config.json, etc.) para `transformers` |
| Tamano de vocabulario | 262.144 tokens |
| Tokens nuevos | 22.775 tokens turcos |
| Modelo base | Qwen/Qwen3.8-27B |
| Libreria | transformers (probado con transformers 5.x y tokenizers 0.23.3) |

## Arquitectura y entrenamiento

El artefacto es un tokenizer BPE (Byte Pair Encoding) construido sobre el vocabulario de Qwen3.8-27B. Los nuevos merges se aprenden a partir de caracteres internos de los tokens MRET, sobre un corpus de 300 millones de palabras en turco con la mezcla de dominios original (texto web ponderado 4x). El corpus se divide con el pre-tokenizer base, de modo que un token nuevo nunca contiene una frontera MRET en el punto donde fue aprendido.

La innovacion principal es la funcion de puntuacion de merges: `score = inside count − crossing count − 5 × root crossing count`. Se penaliza cada merge que uniria dos tokens MRET distintos y, con mas fuerza, los que cruzan la primera frontera MRET de una palabra (proxy de la frontera de raiz). Los nuevos merges se colocan antes de los merges base, lo que hace que el texto turco siga mas de cerca la segmentacion MRET, a costa de tokenizar de forma distinta el ingles y el codigo.

Los identificadores de tokens base y especiales no cambian; los tokens base eliminados (principalmente de otras escrituras) son aquellos que nunca aparecen en la muestra de 300 millones de palabras ni en ingles, codigo o documentos de desarrollo, y sus IDs se reutilizan. No hay datos sobre RLHF, DPO ni fases de alineacion, ya que no se entrena ningun modelo.

## Capacidades

- Tokenizacion mejorada de turco con mayor compresion y mejor alineacion morfologica (raiz y sufijos).
- Reduccion de tokens por caracter en turco: 216,0 frente a 329,0 del tokenizer base en documentos oficiales de 2026.
- Mejora de F1 de fronteras morfologicas: 58,84 frente a 32,55 del base.
- Mejora de precision de raiz: 68,10 frente a 39,52 del base.
- Preservacion de todos los tokens especiales y del chat template del modelo base.
- Compatibilidad con `transformers` mediante `AutoTokenizer`.
- Soporte de turco e ingles; el codigo (Python, C++) y el ingles se tokenizan de forma distinta al base (ratio 1,345 / 1,310 / 1,193 tokens frente al base).
- No incluye capacidades de generacion, vision, tool calling ni agentes por si mismo; estas dependen del modelo base Qwen3.8-27B una vez adaptado.

## Casos de uso

- Adaptacion de Qwen3.8-27B al turco: usar este tokenizer como punto de partida para continuar el preentrenamiento del modelo base con vocabulario extendido, reduciendo el coste por token en turco hasta un 34% en documentos oficiales.
- Procesamiento de documentos oficiales turcos: el tokenizer reduce de 329,0 a 216,0 tokens por 1.000 caracteres en el Boletin Oficial, lo que abarata el indexado y la inferencia sobre corpus administrativos.
- Analisis morfologico y lematizacion: la mejora en F1 de fronteras (58,84) y precision de raiz (68,10) lo hace util como componente de pipelines de NLP turco que necesiten separar raiz y sufijos.
- Busqueda y recuperacion de informacion en turco: la mayor compresion reduce el tamano de los indices invertidos y el coste de embeddings en sistemas RAG sobre Wikipedia turca o prensa.
- Entrenamiento de modelos turcos desde un checkpoint multimodal: al conservar los IDs especiales y el chat template, se puede reutilizar la infraestructura del modelo base y solo reentrenar las filas nuevas de embeddings.
- Investigacion en tokenizacion morfologica: sirve como referencia reproducible para comparar estrategias de extension de vocabulario (MRET frente a BPE sobre FineWeb) en lenguas aglutinantes.
- Evaluacion comparativa de tokenizers: util para medir el impacto de la tokenizacion en la calidad downstream de modelos turcos, dado que el autor publica resultados frente al base y frente a un tokenizer alternativo de canbingol.

## Benchmarks y rendimiento

Resultados reportados por el autor (tokens por 1.000 caracteres, menor es mejor; morph F1 y root accuracy, mayor es mejor):

| Tokenizer | Vocab | Nuevos | Official 2026 | Wikipedia 2026 | News 2026 | Media indep. | Test split | Morph F1 | Root acc. | en / py / C++ vs base | Cambios IDs especiales |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 248.077 | 0 | 329,0 | 326,9 | 306,3 | 320,7 | 323,9 | 32,55 | 39,52 | 1,000 / 1,000 / 1,000 | 0 |
| Qwen3.8-27B-tr-bpe-fineweb-alan30-32k-merged | 262.144 | 22.775 | 236,1 | 245,6 | 207,4 | 229,7 | 241,7 | 49,33 | 54,44 | 1,249 / 1,272 / 1,220 | 33 |
| Qwen3.8-27B-mret-32k-merged | 262.144 | 22.775 | 216,0 | 243,4 | 209,9 | 223,1 | 233,6 | 58,84 | 68,10 | 1,345 / 1,310 / 1,193 | 0 |

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el repositorio no contiene pesos.

## Requisitos de hardware

- No aplica VRAM para el tokenizer en si: es un artefacto ligero (ficheros JSON de vocabulario y merges).
- Para usar el tokenizer con el modelo base Qwen3.8-27B se requiere hardware compatible con un modelo de 27.000 millones de parametros: aproximadamente 54 GB en bf16/fp16, ~27 GB en int8 y ~14-16 GB en cuantizaciones de 4 bits.
- GPU recomendadas para el modelo base: A100 80 GB, H100 80 GB, H200; en consumer, RTX 4090 (24 GB) solo con cuantizacion de 4 bits, o RTX A6000 48 GB en int8.
- Opciones de despliegue: `transformers` (referencia del autor), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF tras la adaptacion.
- Latencia y throughput: no disponibles para este artefacto; dependen del modelo base y del hardware.
- Nota: tras redimensionar embeddings con `resize_token_embeddings`, el modelo base necesita preentrenamiento adicional de las nuevas filas antes de un uso productivo.

## Comparativa con modelos similares

| Criterio | egeboy35/Qwen3.8-27B-mret-32k-merged | canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-32k-merged | Qwen/Qwen3.8-27B (base) |
|---|---|---|---|
| Tipo | Tokenizer extendido | Tokenizer extendido | Tokenizer original |
| Vocabulario | 262.144 | 262.144 | 248.077 |
| Tokens nuevos | 22.775 | 22.775 | 0 |
| Official 2026 (↓) | 216,0 | 236,1 | 329,0 |
| Wikipedia 2026 (↓) | 243,4 | 245,6 | 326,9 |
| News 2026 (↓) | 209,9 | 207,4 | 306,3 |
| Morph F1 (↑) | 58,84 | 49,33 | 32,55 |
| Root accuracy (↑) | 68,10 | 54,44 | 39,52 |
| Cambios en IDs especiales | 0 | 33 | 0 |
| Licencia | Apache 2.0 | no disponible | Apache 2.0 |

## Limitaciones y advertencias

- Solo tokenizer: las nuevas filas de embedding deben aprenderse mediante preentrenamiento continuado; sin ese paso, el modelo no aprovecha los tokens nuevos.
- El ingles y el codigo se tokenizan de forma distinta al base (ratio 1,345 / 1,310 / 1,193), por lo que el modelo debe adaptarse tambien a esa nueva segmentacion.
- Los tokens base eliminados (principalmente de otras escrituras) dejan de estar disponibles para el modelo.
- El autor reconoce que el conjunto de test morfologico se uso en versiones anteriores de MRET, por lo que no es completamente virgen.
- En noticias de 2026 el tokenizer de canbingol obtiene ligeramente mejor compresion (207,4 frente a 209,9), aunque la media independiente favorece a este modelo (223,1 frente a 229,7).
- Posible riesgo de alucinacion y sesgos heredados del modelo base Qwen3.8-27B; el tokenizer no los corrige.
- La licencia Apache 2.0 permite uso comercial, pero la adaptacion requiere verificar las condiciones del modelo base.
- Mediciones realizadas con tokenizers 0.23.3 y transformers 5.x; versiones anteriores pueden dar resultados distintos.
- El pipeline etiquetado como `image-text-to-text` puede inducir a confusion: el artefacto no procesa imagenes por si mismo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/egeboy35/Qwen3.8-27B-mret-32k-merged
- Tokenizer MRET 32K: https://huggingface.co/egeboy35/mret-32k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Tokenizer alternativo de canbingol: https://huggingface.co/canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-32k-merged
- Dataset de analisis morfologico turco: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
