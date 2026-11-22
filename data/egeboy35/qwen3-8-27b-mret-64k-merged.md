# egeboy35/Qwen3.8-27B-mret-64k-merged

## Resumen

Qwen3.8-27B-mret-64k-merged es un tokenizer publicado por el usuario egeboy35 en Hugging Face, no un modelo con pesos. Extiende el vocabulario del tokenizer de Qwen/Qwen3.8-27B con 49.709 tokens turcos aprendidos mediante el metodo MRET 64K, elevando el vocabulario de 248.077 a 262.144 entradas. El objetivo es reducir el coste en tokens del turco (un idioma aglutinante con alta fragmentacion en tokenizers entrenados mayoritariamente en ingles) y mejorar la alineacion con fronteras morfologicas de raiz y sufijo.

La relevancia tecnica esta en el diseno del vocabulario: los nuevos merges se aprenden sobre recuentos de 300 millones de palabras turcas (foro, redes sociales y comentarios ponderados 4x), se insertan antes de los merges base y se penalizan cuando cruzarian una frontera de token MRET. Ademas, los identificadores de todos los tokens base y especiales se preservan, y los tokens base eliminados para hacer sitio son aquellos que no aparecen en la muestra turca, en texto ingles y codigo, ni en documentos de desarrollo (principalmente otras escrituras). El repositorio incluye solo el tokenizer; el modelo base debe adaptarse mediante preentrenamiento continuado.

La ficha se refiere, por tanto, al artefacto de tokenizacion y a su procedimiento de integracion con Qwen3.8-27B, no a un modelo entrenado de extremo a extremo. Los resultados publicados por el autor miden compresion en tokens y morfologia, no calidad generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE (byte-level) sobre el vocabulario de Qwen3.8-27B; el modelo base es un transformer (detalles no disponibles) |
| Parametros totales | No disponible (el repositorio no contiene pesos; el modelo base es Qwen3.8-27B, tamano exacto no disponible) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible para el tokenizer; el nombre del repositorio sugiere 64K, pero no se documenta en la model card |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr), ingles (en); tokenizacion de codigo (Python, C++) evaluada |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica: solo tokenizer (tokenizer.json, tokenizer_config.json, special_tokens_map.json y ficheros asociados de la libreria transformers) |

## Arquitectura y entrenamiento

El artefacto es un tokenizer BPE derivado del de Qwen3.8-27B. Se anaden 49.709 tokens turcos nuevos hasta un vocabulario de 262.144 entradas, el mismo tamano que el tokenizer Qwen3.8-27B-tr-bpe-fineweb-alan30-64k-merged de canbingol. Los merges nuevos se aprenden a partir de caracteres dentro de tokens MRET, sobre recuentos de 300 millones de palabras turcas, tras aplicar el pre-tokenizer base, de modo que un token nuevo nunca contiene una frontera de token MRET en el punto donde se aprendio. La puntuacion de cada merge es el recuento interno menos el recuento de cruces (score = inside count - crossing count), lo que penaliza los merges que unirian dos tokens MRET distintos.

Los merges nuevos se colocan antes de los merges base, igual que en los tokenizers fusionados de canbingol. Como consecuencia, el texto turco sigue mas de cerca la segmentacion de MRET, pero el ingles y el codigo tambien se tokenizan de forma distinta a la del modelo base. Los identificadores de tokens base y especiales no cambian (bos, eos, plantilla de chat y config), y los tokens base eliminados para liberar espacio son los que no aparecen en la muestra turca, en texto ingles y codigo, ni en los documentos de desarrollo. El autor indica que todos los tokens nuevos son producibles: codificar su texto aislado devuelve ese token. La medicion se realizo con tokenizers 0.23.3 y transformers 5.x.

## Capacidades

- Tokenizacion BPE de texto turco e ingles con un vocabulario de 262.144 entradas.
- Compresion de turco: 202,3 tokens por 1.000 caracteres en documentos de Boletin Oficial de 2026, frente a 329,0 del tokenizer base.
- Mejora de morfologia turca: F1 de fronteras de 52,86 y precision de raiz de 59,24, frente a 32,55 y 39,52 del base.
- Preservacion de identificadores de tokens base y especiales (0 desplazamientos de id de tokens especiales, frente a 33 en la alternativa de canbingol).
- Tokenizacion de codigo (Python, C++) y de documentacion de PyTorch, con ratios de 1,221 / 1,192 / 1,127 tokens respecto al base.
- Integracion con transformers mediante AutoTokenizer y ampliacion de la matriz de embeddings con resize_token_embeddings.
- No incluye capacidades generativas propias: no hay pesos, ni tool calling, ni agentes, ni vision, ni modo thinking en este repositorio.

## Casos de uso

- Preentrenamiento continuado de Qwen3.8-27B para turco: el tokenizer reduce el numero de tokens necesarios para representar texto turco (208,6 de media en el conjunto independiente frente a 320,7 del base), lo que abarata el entrenamiento y amplia el contexto efectivo por secuencia.
- Ajuste supervisado (SFT) y DPO en turco: al preservar los ids de tokens especiales y de la plantilla de chat, se puede reutilizar el pipeline de datos y la configuracion del modelo base sin remapear etiquetas.
- Analisis morfologico y procesamiento linguistico: la mayor F1 de fronteras (52,86) y precision de raiz (59,24) facilitan tareas de segmentacion raiz-sufijo, lematizacion y etiquetado morfologico sobre texto turco.
- Procesamiento de corpus turcos de gran volumen: la reduccion de tokens por caracter (hasta un 38,5% en Boletin Oficial) disminuye el coste de indexacion, busqueda y almacenamiento en pipelines de datos.
- Evaluacion comparativa de tokenizers: sirve como referencia reproducible para medir compresion y morfologia frente al base y frente a la variante de canbingol, con conjuntos de 2026 no usados en la construccion.
- Investigacion sobre vocabularios multilingues: permite estudiar el compromiso entre compresion del turco y degradacion de la tokenizacion de ingles y codigo, con datos cuantificados en la model card.

## Benchmarks y rendimiento

Datos publicados por el autor. Tokens por 1.000 caracteres (menor es mejor); morfologia con F1 de fronteras y precision de raiz (mayor es mejor).

| Tokenizer | Vocab | Nuevos | Official 2026 | Wikipedia 2026 | News 2026 | Media indep. | Test propio | Morph F1 | Root acc. | Tokens vs base en/py/C++ | Cambios de id especial |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 248.077 | 0 | 329,0 | 326,9 | 306,3 | 320,7 | 323,9 | 32,55 | 39,52 | 1,000 / 1,000 / 1,000 | 0 |
| Qwen3.8-27B-tr-bpe-fineweb-alan30-64k-merged | 262.144 | 49.709 | 217,8 | 231,4 | 192,8 | 214,0 | 226,2 | 49,57 | 52,42 | 1,205 / 1,239 / 1,188 | 33 |
| Qwen3.8-27B-mret-64k-merged | 262.144 | 49.709 | 202,3 | 229,0 | 194,5 | 208,6 | 218,6 | 52,86 | 59,24 | 1,221 / 1,192 / 1,127 | 0 |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los conjuntos independientes son documentos del Boletin Oficial de agosto a noviembre de 2026, articulos de Wikipedia turca creados en 2026 y titulares con resumen de fuentes RSS de 2026; la mitad de cada fuente se uso para elegir ajustes.

## Requisitos de hardware

- VRAM para inferencia: no aplica al tokenizer; depende del modelo base Qwen3.8-27B una vez adaptado (no disponible en la informacion proporcionada).
- GPU recomendadas: no disponible para el tokenizer; para el modelo base habria que consultar la model card de Qwen/Qwen3.8-27B.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: el tokenizer es compatible con la libreria transformers (AutoTokenizer); no se documentan opciones de vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput: no disponibles; la model card solo reporta metricas de compresion y morfologia.

## Comparativa con modelos similares

| Artefacto | Vocabulario | Nuevos tokens | Media indep. (tokens/1.000 car.) | Morph F1 | Root acc. | Cambios de id especial | Licencia |
|---|---|---|---|---|---|---|---|
| egeboy35/Qwen3.8-27B-mret-64k-merged | 262.144 | 49.709 | 208,6 | 52,86 | 59,24 | 0 | Apache 2.0 |
| canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-64k-merged | 262.144 | 49.709 | 214,0 | 49,57 | 52,42 | 33 | No disponible en la informacion proporcionada |
| Qwen/Qwen3.8-27B (tokenizer base) | 248.077 | 0 | 320,7 | 32,55 | 39,52 | 0 | Apache 2.0 |

## Limitaciones y advertencias

- Solo tokenizer: las nuevas filas de embedding deben aprenderse mediante preentrenamiento continuado; el repositorio no incluye pesos.
- El ingles y el codigo se tokenizan de forma distinta al modelo base, por lo que el modelo debe adaptarse tambien a esa tokenizacion. El autor indica que las variantes que conservan la tokenizacion base de ingles y codigo dieron peor morfologia turca; la variante que elimina merges que actuan sobre ingles y codigo perdio la mayor parte de la ganancia de compresion.
- Los tokens base eliminados (principalmente de otras escrituras) dejan de estar disponibles para el modelo.
- En titulares de noticias de 2026 el tokenizer de canbingol obtiene mejor compresion (192,8 frente a 194,5), segun reconoce el autor.
- El conjunto de prueba de morfologia se uso en versiones anteriores de MRET, por lo que no esta intacto.
- No se han publicado evaluaciones de calidad generativa, sesgos o alucinacion para este artefacto; cualquier uso en produccion debe validarse con el modelo base adaptado.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar las condiciones de Qwen/Qwen3.8-27B para uso comercial del modelo adaptado.
- Las mediciones se realizaron con tokenizers 0.23.3 y transformers 5.x; versiones distintas pueden alterar los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/egeboy35/Qwen3.8-27B-mret-64k-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Tokenizer MRET 64K: https://huggingface.co/egeboy35/mret-64k
- Tokenizer alternativo de canbingol: https://huggingface.co/canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-64k-merged
- Dataset de analisis morfologico turco: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
