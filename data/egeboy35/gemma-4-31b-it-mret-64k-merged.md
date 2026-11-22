# egeboy35/gemma-4-31B-it-mret-64k-merged

## Resumen

`egeboy35/gemma-4-31B-it-mret-64k-merged` es un tokenizer extendido para el modelo multimodal `google/gemma-4-31B-it`. Lo desarrolla el usuario de Hugging Face egeboy35 y no contiene pesos de modelo: es un artefacto de tokenizacion que anade 48.235 tokens turcos aprendidos con el tokenizer MRET 64K, manteniendo el vocabulario en 262.144 entradas (el mismo tamano que el modelo base) mediante la reutilizacion de identificadores de tokens base que no aparecen en su corpus turco de 300 millones de palabras.

El problema que aborda es la ineficiencia del tokenizer original de Gemma 4 con el turco, un idioma aglutinante cuya morfologia genera secuencias de tokens muy fragmentadas. Segun las mediciones del autor, el tokenizer base consume 304,3 tokens por cada 1.000 caracteres en una media de textos independientes de 2026, mientras que esta variante baja a 190,5, una reduccion de aproximadamente el 37 %. Ademas, mejora la alineacion con fronteras morfologicas (F1 de 33,31 a 52,63 y precision de raiz de 41,48 % a 58,62 %).

Es relevante para quien quiera adaptar Gemma 4 al turco con un tokenizer mas eficiente sin cambiar los identificadores de tokens especiales ni la plantilla de chat del modelo base, lo que simplifica la integracion con `transformers`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB, coherente con que solo incluye el tokenizer y no los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE (Byte Pair Encoding) extendido sobre el de google/gemma-4-31B-it; no incluye pesos de modelo |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base google/gemma-4-31B-it, no especificada en la informacion) |
| Tipos de cuantizacion | no aplica (tokenizer) |
| Idiomas soportados | tr, en (turco e ingles); el tokenizer base cubre mas idiomas, pero la extension se centra en turco |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica; el repositorio contiene ficheros de tokenizer (vocabulario y merges) para `transformers` |
| Tamano de vocabulario | 262.144 tokens |
| Tokens nuevos | 48.235 tokens turcos |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | google/gemma-4-31B-it |

## Arquitectura y entrenamiento

El artefacto es un tokenizer BPE construido en dos fases. Primero se aprende el tokenizer MRET 64K a partir de recuentos de palabras turcas de un corpus de 300 millones de palabras, con un peso 4x para texto de foros, redes sociales y comentarios. Despues, los nuevos merges se aprenden a partir de caracteres dentro de tokens MRET, aplicando el pre-tokenizer del modelo base, de modo que un token nuevo nunca contiene una frontera de token MRET en el punto donde se aprendio. Cada merge se penaliza por cada posicion en los recuentos donde uniria dos tokens MRET distintos, con una puntuacion igual al recuento interno menos el recuento de cruce.

Los nuevos merges se colocan antes que los merges base, lo que hace que el texto turco siga mas de cerca la segmentacion de MRET. Como efecto secundario, el ingles y el codigo tambien se tokenizan de forma distinta al modelo base (ratios de 0,973 en ingles, 0,965 en Python y 0,928 en C++ respecto al base). Los identificadores de todos los tokens base no eliminados y de todos los tokens especiales se conservan, por lo que `bos`, `eos`, la plantilla de chat y los identificadores de la configuracion son los del modelo base. Los tokens base eliminados (principalmente de otros sistemas de escritura) son aquellos que no aparecen en la muestra turca, en texto ingles y de codigo, ni en los documentos de desarrollo del autor; sus identificadores se reutilizan para los tokens nuevos.

No se realizo entrenamiento de pesos: el autor indica explicitamente que las nuevas filas de embedding deben aprenderse mediante preentrenamiento continuado. La model card proporciona un fragmento de codigo para inicializar esas filas como la media de los embeddings de los tokens base que corresponden al texto del token nuevo.

## Capacidades

- Tokenizacion eficiente de turco: reduce el consumo de tokens por caracter en textos oficiales, enciclopedicos, informales y de noticias frente al tokenizer base y frente a la variante de canbingol.
- Mejor alineacion morfologica: mayor F1 de fronteras y mayor precision de raiz en palabras flexionadas turcas.
- Compatibilidad con el modelo base: conserva los identificadores de tokens especiales, la plantilla de chat y los identificadores de la configuracion de google/gemma-4-31B-it.
- Generacion de tokens garantizada: cada token nuevo puede producirse codificando su texto de forma aislada.
- Soporte de ingles y codigo: mantiene la cobertura, aunque con una tokenizacion distinta a la del base.
- Integracion con `transformers`: se carga con `AutoTokenizer.from_pretrained` y requiere `resize_token_embeddings` en el modelo para anadir las filas nuevas.
- No incluye capacidades de inferencia por si mismo: al ser solo tokenizer, las capacidades de generacion, vision, tool calling o razonamiento dependen del modelo base una vez adaptado.

## Casos de uso

- Adaptacion de Gemma 4 al turco: usar este tokenizer como punto de partida para un preentrenamiento continuado o un fine-tuning del modelo base, inicializando las filas nuevas de embedding con la media de los embeddings base correspondientes y entrenandolas despues.
- Reduccion de costes de inferencia en turco: al consumir aproximadamente un 37 % menos de tokens por caracter en la media de textos independientes de 2026, se reduce el coste por peticion y se aprovecha mejor la ventana de contexto en aplicaciones de produccion con texto turco.
- Procesamiento de documentos oficiales turcos: el tokenizer baja de 310,3 a 192,2 tokens por 1.000 caracteres en documentos del Boletin Oficial de agosto a noviembre de 2026, lo que resulta adecuado para pipelines de ingestion y resumen de legislacion.
- Analisis de redes sociales y foros turcos: el corpus de entrenamiento pondera 4x este tipo de texto, por lo que encaja en tareas de moderacion, clasificacion de comentarios y analisis de sentimiento sobre lenguaje informal.
- Busqueda y recuperacion aumentada (RAG) en turco: una tokenizacion mas compacta permite indexar mas fragmentos de documento dentro de la misma ventana de contexto, lo que mejora la cobertura de recuperacion en corpus turcos.
- Investigacion en tokenizacion morfologica: sirve como referencia reproducible para comparar estrategias de extension de vocabulario (merges antes o despues de los base) y su impacto en compresion y morfologia, con el codigo y las metricas publicadas en la model card.
- Sistemas bilingues turco-ingles: al conservar los identificadores base y cubrir ambos idiomas, puede emplearse en pipelines que alternan contenido turco e ingles, asumiendo que el ingles se tokeniza de forma distinta al base y requerira adaptacion del modelo.

## Benchmarks y rendimiento

Los datos publicados en la model card miden el tokenizer, no el modelo. Tokens por cada 1.000 caracteres (menos es mejor) y metricas morfologicas (mas es mejor):

| Tokenizer | Vocab | Tokens nuevos | Oficial 2026 | Wikipedia 2026 | Noticias 2026 | Media independiente | Test propio | F1 morfologia | Precision raiz | Tokens vs base en / py / C++ | Cambios de id en tokens especiales |
|---|---|---|---|---|---|---|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 262.144 | 0 | 310,3 | 310,4 | 292,2 | 304,3 | 309,4 | 33,31 | 41,48 | 1,000 / 1,000 / 1,000 | 0 |
| gemma-4-31B-it-tr-bpe-fineweb-alan30-64k-merged (canbingol) | 262.144 | 48.235 | 209,0 | 204,5 | 178,6 | 197,4 | 205,8 | 49,62 | 52,16 | 0,999 / 0,952 / 0,934 | 0 |
| gemma-4-31B-it-mret-64k-merged (este) | 262.144 | 48.235 | 192,2 | 199,9 | 179,5 | 190,5 | 196,9 | 52,63 | 58,62 | 0,973 / 0,965 / 0,928 | 0 |

No se han publicado resultados de benchmarks de generacion (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el repositorio no contiene pesos de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este repositorio, ya que no incluye pesos. La inferencia requiere cargar google/gemma-4-31B-it con `transformers` y redimensionar los embeddings al nuevo vocabulario (262.144 entradas, el mismo tamano que el base, por lo que no aumenta la huella de embedding).
- GPU recomendadas: no disponible en la informacion proporcionada; depende del modelo base de 31B y de la precision utilizada (el ejemplo de la model card usa `torch_dtype=torch.bfloat16`).
- Cabe en GPU de consumo: no disponible; depende del modelo base y de la cuantizacion aplicada, que no se documenta en este repositorio.
- Opciones de despliegue: la model card solo documenta carga con `transformers` (`AutoTokenizer` y `AutoModelForCausalLM`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este tokenizer.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, la reduccion de tokens por caracter en turco (de 304,3 a 190,5 en la media independiente) implica menos tokens procesados por el mismo texto, lo que puede traducirse en menor coste computacional, pero no se publican cifras de latencia.
- Requisito adicional: es necesario llamar a `model.resize_token_embeddings(len(tok))` e inicializar las filas nuevas antes de usar el modelo adaptado; las filas nuevas deben entrenarse.

## Comparativa con modelos similares

Comparativa de tokenizers para el mismo modelo base:

| Tokenizer | Vocab | Tokens nuevos | Media independiente (tokens/1.000 car.) | F1 morfologia | Precision raiz | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 262.144 | 0 | 304,3 | 33,31 | 41,48 | Apache 2.0 | Hugging Face (Google) |
| canbingol/gemma-4-31B-it-tr-bpe-fineweb-alan30-64k-merged | 262.144 | 48.235 | 197,4 | 49,62 | 52,16 | no disponible en la informacion | Hugging Face |
| egeboy35/gemma-4-31B-it-mret-64k-merged | 262.144 | 48.235 | 190,5 | 52,63 | 58,62 | Apache 2.0 | Hugging Face (0 descargas) |

Frente a la variante de canbingol, este tokenizer obtiene mejor compresion en textos oficiales (192,2 frente a 209,0), en Wikipedia (199,9 frente a 204,5) y en la media independiente (190,5 frente a 197,4), y mejor morfologia (F1 de 52,63 frente a 49,62; precision de raiz de 58,62 % frente a 52,16 %). En noticias de 2026 la variante de canbingol queda ligeramente por delante (178,6 frente a 179,5). En ingles y codigo, este tokenizer se aleja mas del base que el de canbingol (0,973 frente a 0,999 en ingles; 0,965 frente a 0,952 en Python; 0,928 frente a 0,934 en C++).

## Limitaciones y advertencias

- Solo tokenizer: no contiene pesos; las nuevas filas de embedding deben aprenderse mediante preentrenamiento continuado y el modelo no funciona correctamente en turco sin ese paso.
- El ingles y el codigo se tokenizan de forma distinta al modelo base, por lo que el modelo tambien debe adaptarse a esa tokenizacion. El autor indica que las variantes que preservan la tokenizacion base de ingles y codigo obtuvieron peor morfologia turca, y que una de ellas perdio la mayor parte de la ganancia de compresion.
- Los tokens base eliminados (principalmente de otros sistemas de escritura) dejan de estar disponibles para el modelo, lo que puede degradar el rendimiento en idiomas distintos del turco y el ingles.
- Los resultados de morfologia se midieron en un conjunto que ya se habia usado en versiones anteriores de MRET, por lo que no es un conjunto intacto, segun reconoce el autor.
- Las mediciones se realizaron con `tokenizers` 0.23.3 y `transformers` 5.x; pueden variar con otras versiones.
- No se publican benchmarks de generacion ni evaluaciones de sesgo o alucinacion para este artefacto.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el 2026-11-22 con 12 segundos de diferencia; no hay evidencia de validacion por terceros.
- Licencia Apache 2.0, igual que el modelo base, lo que permite uso comercial del tokenizer; el uso comercial del modelo adaptado queda sujeto a la licencia de google/gemma-4-31B-it.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/egeboy35/gemma-4-31B-it-mret-64k-merged
- Tokenizer MRET 64K: https://huggingface.co/egeboy35/mret-64k
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Tokenizer comparable de canbingol: https://huggingface.co/canbingol/gemma-4-31B-it-tr-bpe-fineweb-alan30-64k-merged
- Dataset de analisis morfologico turco: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales sobre este tokenizer.
