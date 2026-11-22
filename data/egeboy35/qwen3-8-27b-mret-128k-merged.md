# egeboy35/Qwen3.8-27B-mret-128k-merged

## Resumen

Qwen3.8-27B-mret-128k-merged es un tokenizer publicado por el usuario egeboy35 en Hugging Face, derivado del tokenizer del modelo base Qwen/Qwen3.8-27B. No se trata de un modelo de pesos completos: el repositorio contiene exclusivamente el tokenizer, ampliado con 105.214 tokens turcos aprendidos mediante el procedimiento MRET 128K (tambien publicado por el mismo autor). El objetivo es mejorar la eficiencia de tokenizacion del turco sin alterar los identificadores de los tokens base ni de los tokens especiales.

El vocabulario resultante es de 262.144 entradas, el mismo tamano que el del tokenizer combinado de referencia de canbingol (Qwen3.8-27B-tr-bpe-fineweb-alan30-128k-merged), lo que facilita la comparacion directa. Los nuevos merges se aprenden a partir de caracteres internos a los tokens MRET, sobre un corpus de 300 millones de palabras turcas con ponderacion 4x para texto de foros, redes sociales y comentarios, y se colocan antes de los merges base.

La relevancia actual del artefacto es acotada pero concreta: para cualquiera que quiera adaptar Qwen3.8-27B al turco con preentrenamiento continuado, este tokenizer ofrece una segmentacion mas cercana a la morfologia turca (mejor F1 de fronteras y mayor precision de raiz que la alternativa de canbingol) y una compresion superior en textos de 2026 no vistos durante el desarrollo. El coste es que el ingles y el codigo se tokenizan de forma distinta al modelo base, por lo que el modelo debe adaptarse tambien a ese cambio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE (byte-pair encoding) con merges MRET; no incluye pesos de modelo |
| Parametros totales | no disponible (el repositorio solo contiene tokenizer) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B, no especificada en la informacion) |
| Tipos de cuantizacion | no aplica (tokenizer) |
| Idiomas soportados | Turco (tr) e ingles (en); el modelo base soporta mas idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica; artefactos de tokenizer (tokenizer.json, tokenizer_config.json, special_tokens_map.json, vocab) para transformers |
| Vocabulario | 262.144 tokens |
| Tokens nuevos | 105.214 tokens turcos |
| Modelo base asociado | Qwen/Qwen3.8-27B |
| Libreria | transformers (probado con tokenizers 0.23.3 y transformers 5.x) |

## Arquitectura y entrenamiento

El artefacto es un tokenizer BPE construido en dos capas. Primero se parte del vocabulario del tokenizer de Qwen3.8-27B (248.077 entradas) y se aprende un conjunto de 105.214 tokens turcos mediante MRET 128K, un procedimiento de tokenizacion morfologica orientado al turco. Los merges nuevos se aprenden a partir de los caracteres internos a los tokens MRET, de modo que un token nuevo nunca contiene una frontera de token MRET en el punto donde fue aprendido. Los merges nuevos se insertan antes de los merges base, lo que hace que el texto turco siga mas de cerca la segmentacion MRET.

El corpus de aprendizaje son recuentos de palabras turcas de 300 millones de palabras, con texto de foros, redes sociales y comentarios ponderado 4x. Para hacer sitio a los nuevos tokens se eliminan tokens base que no aparecen en esa muestra, ni en texto ingles y de codigo, ni en los documentos de desarrollo (mayoritariamente otras escrituras); sus identificadores se reutilizan. Todos los demas tokens base y todos los tokens especiales conservan su id, de modo que `bos`, `eos`, la plantilla de chat y los ids de configuracion son los del modelo base. No hay datos de entrenamiento del modelo en si: el tokenizer no incluye pesos y las nuevas filas de embedding deben aprenderse mediante preentrenamiento continuado.

## Capacidades

- Tokenizacion de texto turco con mejor compresion que el tokenizer base y que la alternativa de canbingol en documentos oficiales, enciclopedicos e informales de 2026 no vistos.
- Segmentacion mas proxima a la morfologia turca: F1 de fronteras de 49,99 frente a 49,17 de canbingol y 32,55 del base; precision de raiz de 51,69 frente a 49,50 y 39,52 respectivamente.
- Preservacion completa de identificadores de tokens especiales (0 desplazamientos, frente a 33 en la alternativa de canbingol) y de todos los tokens base no eliminados.
- Generacion garantizada de cada token nuevo: codificar su texto de forma aislada produce ese token.
- Tokenizacion de ingles y codigo funcional, aunque distinta a la del modelo base (ratios de 1,153 en ingles, 1,133 en Python y 1,077 en C++ respecto al base).
- Compatibilidad con la plantilla de chat y la configuracion del modelo base Qwen3.8-27B.
- No incluye capacidades de generacion, vision ni tool calling por si mismo: estas dependen del modelo base al que se aplique.

## Casos de uso

- Preentrenamiento continuado de Qwen3.8-27B para turco: el tokenizer reduce el numero de tokens por caracter en turco (192,0 en documentos oficiales de 2026 frente a 329,0 del base), lo que abarata cada paso de entrenamiento y permite cubrir mas texto con el mismo presupuesto de computo.
- Ajuste supervisado (SFT) de asistentes conversacionales en turco: al conservar los ids de los tokens especiales y de la plantilla de chat, el tokenizer se integra sin cambios en pipelines de instruccion y dialogo multi-turno sobre el modelo base.
- Analisis morfologico y procesamiento de lenguaje natural turco: la mayor precision de raiz (51,69) y de fronteras morfologicas lo hace util en tareas de stemming, lematizacion y etiquetado morfologico donde la segmentacion importa.
- Procesamiento de documentos oficiales turcos: la mejor compresion en el Boletin Oficial (192,0 tokens por 1.000 caracteres) reduce coste y latencia en ingesta y busqueda sobre corpus administrativos y legales.
- Indexacion y busqueda semantica en turco: un menor numero de tokens por documento permite almacenar mas texto en la misma ventana de contexto y abaratar los embeddings en sistemas RAG orientados a turco.
- Investigacion en tokenizacion multilingue: sirve como punto de comparacion controlado frente a canbingol y al tokenizer base para estudiar el efecto de la segmentacion morfologica en el rendimiento posterior del modelo.
- Desarrollo de variantes bilingues turco-ingles: util si el modelo va a adaptarse a ambos idiomas, asumiendo que el ingles se tokeniza de forma distinta al base (ratio 1,153) y requerira ajuste adicional.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre tokens por 1.000 caracteres (menor es mejor) y metricas morfologicas (mayor es mejor). Los conjuntos de 2026 son texto independiente no usado para construir MRET ni el tokenizer.

| Tokenizer | Vocab | Tokens nuevos | Official 2026 | Wikipedia 2026 | News 2026 | Media indep. | Test split propio | Morph F1 | Root acc. | Tokens vs base en/py/C++ | Desplaz. ids especiales |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 248.077 | 0 | 329,0 | 326,9 | 306,3 | 320,7 | 323,9 | 32,55 | 39,52 | 1,000 / 1,000 / 1,000 | 0 |
| canbingol tr-bpe-fineweb-alan30-128k-merged | 262.144 | 105.214 | 205,0 | 221,5 | 183,7 | 203,4 | 215,3 | 49,17 | 49,50 | 1,163 / 1,207 / 1,155 | 33 |
| egeboy35 mret-128k-merged | 262.144 | 105.214 | 192,0 | 216,7 | 184,2 | 197,6 | 208,5 | 49,99 | 51,69 | 1,153 / 1,133 / 1,077 | 0 |

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el repositorio no contiene pesos.

## Requisitos de hardware

- VRAM para inferencia: no aplica al tokenizer; depende del modelo base Qwen3.8-27B al que se aplique, cuyos requisitos no se detallan en la informacion disponible.
- GPU recomendadas: no disponible para el tokenizer; para el modelo base habria que consultar su model card.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: uso mediante la libreria transformers (`AutoTokenizer.from_pretrained`); compatible con cualquier runtime que consuma tokenizers de Hugging Face (vLLM, TGI, llama.cpp, Ollama) siempre que se cargue el tokenizer junto a los pesos del modelo base adaptado.
- Latencia y throughput: no disponible. La reduccion de tokens por caracter en turco (hasta un 41,6 % menos que el base en documentos oficiales de 2026) implica menos tokens procesados por el modelo y, por tanto, menor coste y latencia en esa lengua.

## Comparativa con modelos similares

Comparacion de tokenizers para Qwen3.8-27B en turco.

| Tokenizer | Vocab | Tokens nuevos | Compresion turca (media indep.) | Morph F1 | Root acc. | Desplaz. ids especiales | Licencia |
|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 248.077 | 0 | 320,7 | 32,55 | 39,52 | 0 | Apache 2.0 |
| canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-128k-merged | 262.144 | 105.214 | 203,4 | 49,17 | 49,50 | 33 | no disponible en la informacion |
| egeboy35/Qwen3.8-27B-mret-128k-merged | 262.144 | 105.214 | 197,6 | 49,99 | 51,69 | 0 | Apache 2.0 |

El tokenizer de egeboy35 supera al de canbingol en compresion media independiente (197,6 frente a 203,4), en documentos oficiales (192,0 frente a 205,0), en Wikipedia (216,7 frente a 221,5) y en el test split propio (208,5 frente a 215,3), y queda ligeramente por detras en noticias de 2026 (184,2 frente a 183,7). Tambien mejora en morfologia y no desplaza ningun id especial.

## Limitaciones y advertencias

- Solo tokenizer: no contiene pesos. Las nuevas filas de embedding deben aprenderse mediante preentrenamiento continuado; el autor indica explicitamente que las filas nuevas aun tienen que entrenarse.
- El ingles y el codigo se tokenizan de forma distinta al modelo base (ratios 1,153, 1,133 y 1,077), por lo que el modelo debe adaptarse tambien a ese cambio. Las variantes que conservan la tokenizacion base de ingles y codigo dieron peor morfologia turca en las pruebas del autor.
- Los tokens base eliminados (mayoritariamente de otras escrituras) dejan de estar disponibles para el modelo, lo que puede degradar el rendimiento en idiomas y sistemas de escritura no cubiertos.
- El conjunto de prueba de morfologia se habia usado en versiones anteriores de MRET, por lo que no es un conjunto virgen; el autor lo advierte.
- Las mediciones se hicieron con tokenizers 0.23.3 y transformers 5.x; versiones distintas pueden comportarse de forma diferente.
- No hay datos publicados sobre sesgos, alucinacion o rendimiento del modelo resultante tras el preentrenamiento continuado, ya que el artefacto es solo el tokenizer.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-22: no hay evidencia de uso en produccion ni validacion independiente.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial del tokenizer.

## Enlaces

- Hugging Face del tokenizer: https://huggingface.co/egeboy35/Qwen3.8-27B-mret-128k-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Tokenizer MRET 128K: https://huggingface.co/egeboy35/mret-128k
- Tokenizer alternativo de canbingol: https://huggingface.co/canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-128k-merged
- Dataset de analisis morfologico turco: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
