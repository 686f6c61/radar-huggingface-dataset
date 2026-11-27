# orucexe/ulduz-morph-128k

## Resumen

Ulduz Morph 128k (`orucexe/ulduz-morph-128k`) es un tokenizador morfológico de vocabulario 131.072 orientado a azerbaiyano y a tareas de embedding, recuperación (retrieval) y reranking multilingüe. Lo desarrolla el autor independiente `orucexe` y forma parte de la familia de tokenizadores Ulduz, que cubre 204 idiomas. No es un modelo generativo: es un componente de tokenización que se publica como repositorio de tipo `transformers` con `tokenizer` como etiqueta principal.

El componente diferencial es un autómata de estados finitos (FSM) de 29 estados en tiempo de ejecución junto con 88.516 raíces verificadas del azerbaiyano. Esto permite separar prefijos y raíces de las cadenas de sufijos aglutinantes con una precisión de corte morfológico declarada del 90,7% y un 90,4% de raíces intactas, manteniendo cadenas de sufijos compactas (fertilidad Belebele de 1,784). El tokenizador conserva además el 100% de la información (sin pérdidas, 0,00% de `<unk>`) en inglés, ruso, código, matemáticas y el resto de idiomas.

Es relevante ahora porque la tokenización morfológica específica para lenguas aglutinantes como el azerbaiyano mejora la calidad de los sistemas de búsqueda y recuperación documental en esos idiomas, un terreno donde los tokenizadores multilingües genéricos suelen fragmentar en exceso las palabras. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos o el `tokenizer.json` aún no están publicados en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador con FSM morfológico de 29 estados y 88.516 raíces verificadas de azerbaiyano |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | az, en, ru, tr y multilingüe (familia de 204 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repositorio de tokenizador; tamaño 0,0 GB) |

## Arquitectura y entrenamiento

El tokenizador combina un vocabulario de 131.072 entradas con un autómata de estados finitos que reconoce la morfología aglutinante del azerbaiyano. El FSM de 29 estados segmenta las palabras en prefijo, raíz y cadena de sufijos, apoyándose en un léxico de 88.516 raíces verificadas. Incluye además una guarda de escritura (script guard) sensible al contexto que deja intactos el inglés, el ruso, el código, las matemáticas y el resto de idiomas de la familia, de modo que la segmentación morfológica solo actúa donde corresponde.

La model card no detalla el corpus de entrenamiento del tokenizador ni el número de tokens utilizados, ni indica si se aplicaron técnicas de RLHF o DPO (no procede en un tokenizador). La innovación técnica destacable es la combinación de FSM morfológico con preservación sin pérdidas (100,0% lossless, 0,00% `<unk>`), que la model card contrasta con tokenizadores de referencia que descartan o normalizan espacios en blanco o emiten tokens desconocidos. El autor remite a `orucexe/ulduz-tokenizer-128k` para una variante en Rust puro con `tokenizer.json` y `trust_remote_code=False`.

## Capacidades

- Tokenización morfológica del azerbaiyano: separa prefijos, raíces y cadenas de sufijos aglutinantes con 90,7% de precisión de corte y 90,4% de raíces intactas.
- Vocabulario de 131.072 entradas con cobertura de 204 idiomas.
- Preservación sin pérdidas: reconstrucción exacta del texto original (100,0% lossless, 0,00% `<unk>`).
- Guarda de escritura sensible al contexto: no altera inglés, ruso, código, matemáticas ni los otros idiomas de la familia.
- Uso previsto en pipelines de embedding, recuperación (retrieval) y reranking.
- Compatibilidad con la librería `transformers` mediante `AutoTokenizer` y `trust_remote_code=True`.
- No incluye generación de texto, razonamiento, tool calling ni capacidades de agente: es un componente de tokenización, no un modelo de lenguaje.

## Casos de uso

- Búsqueda documental en azerbaiyano: el tokenizador segmenta las consultas y los documentos en raíces y sufijos, lo que permite emparejar variantes flexivas de una misma palabra y mejorar la recuperación en un motor de búsqueda léxico o híbrido.
- Sistemas de embedding para azerbaiyano: al producir subtokens más cercanos a la raíz, los modelos de embedding entrenados sobre este vocabulario reciben señales más limpias de la palabra base, lo que ayuda en tareas de similitud semántica.
- Reranking de resultados multilingües: la cobertura de 204 idiomas y la preservación sin pérdidas permiten usar el mismo tokenizador en pipelines donde conviven consultas en azerbaiyano, inglés, ruso y turco sin degradar los idiomas no aglutinantes.
- Preprocesado para análisis lingüístico: el FSM de 29 estados y las 88.516 raíces permiten extraer raíces y sufijos de forma programática para tareas de etiquetado morfológico, lematización aproximada o construcción de índices invertidos por raíz.
- Indexación de corpus multilingües: la tasa de compresión medida (fertilidad Belebele de 1,784 en azerbaiyano y 4,37 en el conjunto World-74) reduce el número de tokens por documento, lo que abarata el almacenamiento de índices y el coste de inferencia en modelos posteriores.
- Procesamiento de código y matemáticas en pipelines mixtos: la guarda de escritura evita que la segmentación morfológica toque fragmentos de código o expresiones matemáticas, lo que permite usar el tokenizador en repositorios y documentación técnica que mezclan texto en azerbaiyano con código.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card. Evaluado sobre `facebook/belebele` (`azj_Latn`, 900 elementos), `CohereForAI/include-base-44` (test de azerbaiyano, 548 elementos) y Wikipedia en inglés, ruso, turco y 74 idiomas adicionales. La fertilidad (B/Tok) se mide en tokens por palabra; menor es mejor en las columnas de fertilidad y mayor es mejor en precisión morfológica, raíces intactas y lossless.

| Tokenizer | Vocab | Belebele-AZ | INCLUDE-44 AZ | %Pure | Prec. morfol. | Raíz intacta | EN | RU | TR | World-74 B/Tok | Lossless |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `orucexe/ulduz-tokenizer-128k` | 131.072 | 1,534 | 3,737 | 75,6% | 64,6% | 78,7% | 1,51 | 2,06 | 1,81 | 4,34 | 100,0% |
| `orucexe/ulduz-morph-128k` | 131.072 | 1,784 | 3,776 | 46,5% | 90,7% | 90,4% | 1,52 | 2,05 | 2,07 | 4,37 | 100,0% |
| `allmalab/aLLMA-2-tokenizer` | 32.000 | 1,572 | 4,326 | 72,4% | 56,4% | 75,5% | 2,27 | 3,94 | 2,65 | 1,43 | 100,0% |
| `nijatzeynalov/gpt2-azerbaijani-small` | 50.257 | 1,489 | 4,228 | 78,4% | 58,1% | 80,2% | 2,08 | 3,16 | 2,53 | 1,55 | 100,0% |
| `LocalDoc/az-en-unigram-tokenizer-50k` | 50.001 | 1,507 | 2,891* | 75,2% | 68,9% | 79,6% | 1,48 | 2,14 | 2,66 | 5,44* | 24,2% |
| `LocalDoc/LocRet-small` | 250.002 | 1,867 | 2,978* | 49,6% | 62,5% | 61,8% | 1,54 | 1,95 | 1,87 | 5,93* | 25,1% |
| `hajili/roberta-base-azerbaijani` | 250.002 | 1,867 | 2,978* | 49,6% | 62,5% | 61,8% | 1,54 | 1,95 | 1,87 | 5,93* | 25,1% |
| `BAAI/bge-m3` | 250.002 | 1,867 | 2,978* | 49,6% | 62,5% | 61,8% | 1,54 | 1,95 | 1,87 | 5,93* | 25,1% |
| `Alibaba-NLP/gte-multilingual-base` | 250.002 | 1,867 | 2,978* | 49,6% | 62,5% | 61,8% | 1,54 | 1,95 | 1,87 | 5,93* | 25,1% |
| `Qwen/Qwen2.5-7B-Instruct` | 151.665 | 3,533 | 4,487 | 9,1% | 25,2% | 24,3% | 1,43 | 2,77 | 2,66 | 2,47 | 100,0% |

Nota del autor: los tokenizadores no lossless descartan o normalizan espacios en blanco o emiten `<unk>` (`LocalDoc-50k` presenta 29,3% de `<unk>` en World-74; los modelos XLM-R de 250k presentan 2,4% de `<unk>`). Las filas marcadas con asterisco corresponden a mediciones con esas limitaciones.

## Requisitos de hardware

- No aplica VRAM para inferencia: es un tokenizador, no un modelo neuronal; el coste es de CPU y memoria del proceso de tokenización.
- El FSM de 29 estados y el léxico de 88.516 raíces implican un uso de memoria ligero, pero la model card no publica cifras concretas de RAM ni de latencia.
- No requiere GPU; puede ejecutarse en cualquier máquina que soporte Python y `transformers`.
- Despliegue mediante `transformers` con `AutoTokenizer.from_pretrained(..., trust_remote_code=True)`; la variante `orucexe/ulduz-tokenizer-128k` ofrece una implementación en Rust puro con `tokenizer.json` y `trust_remote_code=False`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- El repositorio tiene un tamaño de 0,0 GB, por lo que conviene verificar la disponibilidad efectiva de los ficheros del tokenizador antes de integrarlo en producción.

## Comparativa con modelos similares

| Tokenizador | Vocab | Belebele-AZ | Prec. morfol. | Raíz intacta | Lossless | Licencia |
|---|---:|---:|---:|---:|---:|---|
| `orucexe/ulduz-morph-128k` | 131.072 | 1,784 | 90,7% | 90,4% | 100,0% | Apache-2.0 |
| `orucexe/ulduz-tokenizer-128k` | 131.072 | 1,534 | 64,6% | 78,7% | 100,0% | Apache-2.0 |
| `nijatzeynalov/gpt2-azerbaijani-small` | 50.257 | 1,489 | 58,1% | 80,2% | 100,0% | No disponible |
| `allmalab/aLLMA-2-tokenizer` | 32.000 | 1,572 | 56,4% | 75,5% | 100,0% | No disponible |
| `BAAI/bge-m3` | 250.002 | 1,867 | 62,5% | 61,8% | 25,1% | No disponible |

La comparativa se limita a tokenizadores porque el objeto publicado no es un modelo generativo. Frente a `ulduz-tokenizer-128k`, la variante morph sacrifica fertilidad en azerbaiyano (1,784 frente a 1,534) a cambio de una precisión morfológica muy superior (90,7% frente a 64,6%). Frente a `bge-m3` y otros tokenizadores de 250k, la ventaja declarada está en la preservación sin pérdidas y en la segmentación morfológica.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es incorrecta.
- El repositorio muestra 0 descargas, 0 likes y un tamaño de 0,0 GB; verificar que los ficheros del tokenizador estén realmente disponibles antes de depender de él.
- Los benchmarks son autodeclarados por el autor y no se han contrastado de forma independiente en la información proporcionada.
- La precisión morfológica del 90,7% implica que aproximadamente 1 de cada 10 cortes no es correcto; en aplicaciones sensibles a la lematización conviene validar con un conjunto propio.
- El vocabulario de 131.072 entradas y la cobertura de 204 idiomas no garantizan un rendimiento uniforme en todos ellos; los datos publicados se centran en azerbaiyano, inglés, ruso y turco.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de los corpus de evaluación citados (Belebele, INCLUDE-44, Wikipedia) si se redistribuyen datos derivados.
- El uso de `trust_remote_code=True` ejecuta código del autor del repositorio; en entornos de producción es preferible la variante en Rust puro con `tokenizer.json` y `trust_remote_code=False`.
- No se publican datos sobre sesgos, robustez ante texto ruidoso ni comportamiento con dominios especializados (legal, médico, técnico).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orucexe/ulduz-morph-128k
- Variante en Rust puro con `tokenizer.json`: https://huggingface.co/orucexe/ulduz-tokenizer-128k
- Benchmark Belebele (Meta AI): https://huggingface.co/datasets/facebook/belebele
- Benchmark INCLUDE-44 (CohereForAI): https://huggingface.co/datasets/CohereForAI/include-base-44
- Tokenizador de referencia `BAAI/bge-m3`: https://huggingface.co/BAAI/bge-m3
- Tokenizador de referencia `Alibaba-NLP/gte-multilingual-base`: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
