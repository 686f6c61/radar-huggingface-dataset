# egeboy35/Muse-Glimmer-30B-mret-64k-merged

## Resumen

Muse-Glimmer-30B-mret-64k-merged es un tokenizer extendido para el modelo multimodal meta-models/Muse-Glimmer-30B, publicado por el usuario egeboy35. No se trata de un modelo de pesos: el repositorio contiene unicamente el tokenizer ampliado con 48.432 tokens turcos aprendidos mediante el metodo MRET 64K, que eleva el vocabulario de 202.048 a 250.480 entradas. El objetivo es mejorar la eficiencia de tokenizacion del turco (menos tokens por caracter) y la coherencia morfologica, manteniendo intactos los identificadores de los tokens base y especiales.

La relevancia de esta ficha es acotada: el artefacto publicado es un componente de preprocesamiento, no un modelo entrenado. Para aprovecharlo hay que cargar los pesos del modelo base, redimensionar la matriz de embeddings y continuar el preentrenamiento para que las nuevas filas aprendan representaciones utiles. El autor documenta resultados comparativos frente al tokenizer base y frente a una alternativa de la comunidad (canbingol), con mejoras medibles en compresion del turco y en morfologia, a costa de alterar la tokenizacion de ingles y codigo.

El modelo base referenciado, Muse-Glimmer-30B, es un modelo de 30.000 millones de parametros con pipeline image-text-to-text, es decir, multimodal. La licencia declarada es Apache 2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE por encima de un modelo base multimodal (image-text-to-text) de 30B; el repositorio no contiene pesos |
| Parametros totales | No disponible (el modelo base se denomina 30B; no se detalla en la informacion proporcionada) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (la etiqueta "64k" del nombre hace referencia al vocabulario MRET de 64K, no a la ventana de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr) e ingles (en); el tokenizer incorpora tokens turcos nuevos |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible; el repositorio contiene solo ficheros de tokenizer (tamano del repo: 0.0 GB) |

Datos adicionales del tokenizer:

| Parametro | Valor |
|---|---|
| Vocabulario base | 202.048 tokens |
| Vocabulario extendido | 250.480 tokens |
| Tokens nuevos | 48.432 (turcos) |
| Tokens base eliminados | Si; se reutilizan sus ids. Son tokens que no aparecen en la muestra turca de 300 millones de palabras, en texto ingles y codigo, ni en documentos de desarrollo (mayoritariamente otros alfabetos) |
| Desplazamiento de ids de tokens especiales | 0 |
| Libreria | transformers (medido con tokenizers 0.23.3 y transformers 5.x) |

## Arquitectura y entrenamiento

El artefacto es un tokenizer BPE construido en dos capas. Primero se parte del tokenizer del modelo base Muse-Glimmer-30B. Sobre el se anaden 48.432 tokens turcos cuyos merges se aprenden a partir de caracteres internos a los tokens MRET, usando recuentos de palabras turcas de 300 millones de palabras (foro, redes sociales y comentarios ponderados x4). El texto se divide con el pre-tokenizer base, de modo que un token nuevo nunca contiene una frontera de token MRET en el punto donde se aprendio.

El criterio de seleccion de merges penaliza explicitamente los cruces de frontera: la puntuacion de cada merge es el numero de apariciones internas menos el numero de apariciones que unirian dos tokens MRET distintos (score = inside count − crossing count). Los merges nuevos se colocan antes de los merges base, lo que hace que el turco siga mas de cerca la segmentacion MRET, pero tambien altera la tokenizacion de ingles y codigo respecto al modelo base. Todos los tokens nuevos son producibles: codificar su texto aislado devuelve ese mismo token.

No hay informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada. El tokenizer en si no se entrena con descenso de gradiente; las nuevas filas de embeddings deben aprenderse mediante preentrenamiento continuado segun indica el autor.

## Capacidades

- Tokenizacion mejorada de turco: reduce los tokens necesarios por cada 1.000 caracteres frente al tokenizer base en documentos oficiales, enciclopedicos, noticias y texto informal.
- Mejor ajuste morfologico: mayor F1 de fronteras y mayor precision de raiz en palabras flexionadas turcas.
- Preservacion de la interfaz del modelo base: `bos`, `eos`, la plantilla de chat y los ids de configuracion son los del modelo base, sin desplazamientos.
- Compatibilidad con transformers: se carga con `AutoTokenizer.from_pretrained` y se integra redimensionando embeddings con `resize_token_embeddings`.
- Soporte de ingles y codigo: funcional, aunque la tokenizacion difiere de la base (factores de 1.011, 1.010 y 1.009 tokens respecto a la base en ingles, Python y C++).
- Capacidades del modelo base (generacion de texto, vision, tool calling, agentes): no disponibles en la informacion proporcionada; dependen de Muse-Glimmer-30B, cuyas caracteristicas no se detallan.

## Casos de uso

- Adaptacion de un modelo multimodal a turco: cargar Muse-Glimmer-30B, redimensionar embeddings al nuevo vocabulario, inicializar las filas nuevas con la media de los embeddings de los subtokens base e iniciar preentrenamiento continuado con corpus turco. Apropiado porque el tokenizer ya esta alineado con la segmentacion morfologica del turco.
- Reduccion de coste de inferencia en turco: al bajar de 280,7 a 198,8 tokens por 1.000 caracteres de media en textos independientes de 2026, se reduce aproximadamente un 29% el numero de tokens procesados en cargas turcas, lo que abarata atencion y generacion.
- Procesamiento de documentos oficiales turcos: el tokenizer pasa de 290,4 a 196,8 tokens por 1.000 caracteres en el Boletin Oficial de agosto a noviembre de 2026, util para pipelines de ingestion de normativa y boletines.
- Analisis de redes sociales y foros en turco: el entrenamiento pondera x4 este tipo de texto, por lo que es adecuado para moderacion, clasificacion y analisis de sentimiento sobre lenguaje informal turco.
- Sistemas de recuperacion aumentada (RAG) en turco: menor numero de tokens por documento permite indexar mas fragmentos en la misma ventana y abaratar el coste por consulta.
- Investigacion en tokenizacion morfologica: el repositorio documenta metodologia y metricas reproducibles (F1 de fronteras, precision de raiz, compresion por fuente), util como referencia para experimentos con tokenizers aglutinantes.
- Evaluacion comparativa de tokenizers: sirve como variante de control frente al tokenizer base y frente a la alternativa de canbingol en estudios de compresion y morfologia.

## Benchmarks y rendimiento

Resultados declarados por el autor. Tokens por cada 1.000 caracteres (menor es mejor). Textos independientes de 2026 no usados para construir MRET ni el tokenizer.

| Tokenizer | Vocab | Tokens nuevos | Official 2026 | Wikipedia 2026 | News 2026 | Media indep. | Test propio | Morph F1 | Precision raiz | Tokens vs base en/py/C++ | Desplaz. ids especiales |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | 202.048 | 0 | 290,4 | 283,7 | 268,0 | 280,7 | 288,0 | 36,20 | 43,43 | 1,000 / 1,000 / 1,000 | 0 |
| canbingol/...-tr-bpe-fineweb-alan30-64k-merged | 250.480 | 48.432 | 206,4 | 211,3 | 185,7 | 201,1 | 209,6 | 49,56 | 52,08 | 1,008 / 1,008 / 1,008 | 2048 |
| egeboy35/Muse-Glimmer-30B-mret-64k-merged | 250.480 | 48.432 | 196,8 | 211,8 | 187,8 | 198,8 | 205,2 | 52,66 | 58,62 | 1,011 / 1,010 / 1,009 | 0 |

Lectura de los datos: el tokenizer de egeboy35 mejora al base en todas las metricas de turco y supera a la alternativa de canbingol en documentos oficiales (196,8 frente a 206,4), test propio (205,2 frente a 209,6), morfologia (52,66 frente a 49,56 de F1) y precision de raiz (58,62 frente a 52,08). En noticias de 2026 canbingol queda ligeramente por delante (185,7 frente a 187,8) y en Wikipedia 2026 practicamente empatan (211,3 frente a 211,8). El coste es una mayor desviacion en la tokenizacion de ingles y codigo (1,011 / 1,010 / 1,009 frente a 1,008 en canbingol) y la perdida de tokens base de otros alfabetos. Nota del autor: los ajustes se eligieron con reglas definidas antes de puntuar los candidatos, y el conjunto de test morfologico se habia usado en versiones anteriores de MRET, por lo que no esta intacto.

No se han publicado resultados de benchmarks de capacidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para el tokenizer: despreciable; el repositorio pesa 0.0 GB y solo contiene ficheros de tokenizer.
- VRAM para usar el modelo: depende de Muse-Glimmer-30B, cuyos requisitos no se detallan en la informacion proporcionada. Como referencia generica para un modelo denso de 30B en bfloat16, el orden de magnitud es de decenas de GB, pero no se confirma en la informacion disponible.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible para el modelo base; el tokenizer por si solo se ejecuta en CPU.
- Opciones de despliegue: el tokenizer es compatible con la libreria transformers (`AutoTokenizer`). El despliegue del modelo base con vLLM, llama.cpp, Ollama o TGI no se documenta en la informacion proporcionada, y requeriria verificar el soporte del vocabulario extendido en cada runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa de tokenizers para el mismo modelo base:

| Tokenizer | Vocabulario | Tokens nuevos | Media indep. (tokens/1k car.) | Morph F1 | Precision raiz | Desplaz. ids especiales | Licencia |
|---|---|---|---|---|---|---|---|
| meta-models/Muse-Glimmer-30B (base) | 202.048 | 0 | 280,7 | 36,20 | 43,43 | 0 | Apache 2.0 |
| canbingol/Muse-Glimmer-30B-tr-bpe-fineweb-alan30-64k-merged | 250.480 | 48.432 | 201,1 | 49,56 | 52,08 | 2048 | No disponible |
| egeboy35/Muse-Glimmer-30B-mret-64k-merged | 250.480 | 48.432 | 198,8 | 52,66 | 58,62 | 0 | Apache 2.0 |

No se dispone de comparativas con modelos completos alternativos (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo tokenizer: no incluye pesos. Las nuevas filas de embeddings deben aprenderse con preentrenamiento continuado; sin ese paso el modelo no aprovecha los tokens nuevos.
- La tokenizacion de ingles y codigo cambia respecto al base, por lo que el modelo debe adaptarse tambien a esa nueva segmentacion. El autor indica que las variantes que preservan la tokenizacion base de ingles y codigo obtuvieron peor morfologia turca, y una de ellas perdio casi toda la ganancia de compresion.
- Los tokens base eliminados (mayoritariamente de otros alfabetos) dejan de estar disponibles para el modelo, con posible impacto en idiomas distintos del turco e ingles.
- Riesgo de alucinacion, sesgos conocidos y comportamiento en produccion: no disponibles para este artefacto; dependen del modelo base y de su entrenamiento posterior.
- El conjunto de evaluacion morfologica se habia usado en versiones previas de MRET, por lo que las cifras de morfologia no proceden de un test completamente limpio.
- Las metricas se midieron con tokenizers 0.23.3 y transformers 5.x; otras versiones pueden dar resultados distintos.
- Uso comercial: permitido bajo Apache 2.0, con las obligaciones habituales de la licencia (atribucion y conservacion del aviso). Verificar la licencia del modelo base antes de desplegar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egeboy35/Muse-Glimmer-30B-mret-64k-merged
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Tokenizer MRET 64K: https://huggingface.co/egeboy35/mret-64k
- Tokenizer alternativo de canbingol: https://huggingface.co/canbingol/Muse-Glimmer-30B-tr-bpe-fineweb-alan30-64k-merged
- Dataset de analisis morfologico: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
