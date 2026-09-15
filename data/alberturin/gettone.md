# AlBERTurin/gettone

## Resumen

gettone es un tokenizador de Byte-Pair Encoding (BPE) disenado especificamente para el italiano y compartido por todos los modelos de la familia de encoders AlBERTurin. Lo publica el usuario AlBERTurin en Hugging Face bajo la libreria transformers, y sus autores academicos son Matteo Rinaldi, Marco Madeddu, Calogero Jerik Scozzaro, Matteo Delsanto, Daniele Paolo Radicioni y Viviana Patti, en el marco del articulo "AlBERTurin: A Fully Open Family of Italian Encoder Models with Modern Architectures" (CLiC-it 2026).

Su vocabulario es de 32.768 tokens, un tamano contenido que busca equilibrar la compacidad de la segmentacion con un coste moderado de matriz de embeddings. En la evaluacion de fertilidad —numero medio de subtokens generados por palabra— sobre el corpus del paper alcanza 1,429, el valor mas bajo entre los tokenizadores italianos y multilingues comparados, por delante de Velvet-2B (1,471), UmBERTo (1,493), dbmdz (1,497) y XLM-R (1,663).

Es relevante porque la fertilidad determina directamente cuantos tokens consume cada frase: un valor mas bajo reduce la longitud efectiva de las secuencias, el coste de computo por documento y el consumo de memoria en tareas de clasificacion, NER o recuperacion sobre texto italiano. La model card no especifica licencia, corpus de entrenamiento ni configuracion de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (Byte-Pair Encoding); no es un modelo neuronal |
| Parametros totales | No aplica (tokenizador con vocabulario de 32.768 tokens) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (la ventana la fija el modelo que use el tokenizador; no se especifica) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | Italiano (it) |
| Licencia | No disponible |
| Formato de pesos | No disponible (se distribuye como tokenizador de la libreria transformers; la model card no detalla los ficheros) |
| Tamano de vocabulario | 32.768 tokens |
| Fertilidad en italiano | 1,429 subtokens por palabra |
| Descargas / likes en Hugging Face | 0 / 0 |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

gettone es un tokenizador subword de tipo Byte-Pair Encoding, la familia de algoritmos que parte de unidades minimas y fusiona iterativamente los pares de simbolos mas frecuentes hasta alcanzar el tamano de vocabulario objetivo. En este caso el vocabulario resultante es de 32.768 tokens, una cifra identica a la de Minerva-350M y muy inferior a la de alternativas multilingues como XLM-R (250.002) o mBERT (119.547), lo que reduce el numero de parametros de embedding en los modelos que lo emplean.

La model card no indica el corpus de entrenamiento del tokenizador, el numero de documentos procesados ni si se aplicaron normalizaciones previas (por ejemplo, plegado de acentos o tratamiento de mayusculas). Tampoco menciona tecnicas de ajuste posteriores como RLHF o DPO, que no aplican a un tokenizador. La unica innovacion documentada es el resultado de compacidad: 1,429 de fertilidad, medido sobre el corpus de evaluacion del paper de AlBERTurin.

El tokenizador se comparte con tres encoders de la misma familia: AlBERTmini (95M de parametros, 7B tokens de entrenamiento), AlBERTina (140M, 14B) y AlBERTone101 (450M, aproximadamente 101B). Esto implica que los tres modelos comparten el mismo espacio de tokens, y por tanto los mismos identificadores y las mismas estadisticas de frecuencia.

## Capacidades

- Segmentacion de texto italiano en subtokens BPE con 32.768 unidades de vocabulario.
- Codificacion y decodificacion de texto mediante AutoTokenizer de la libreria transformers.
- Tokenizacion compacta del italiano: 1,429 subtokens por palabra de media, el mejor valor de la comparativa publicada.
- Compatibilidad con todos los modelos de la familia AlBERTurin (AlBERTmini, AlBERTina, AlBERTone101), al compartir vocabulario.
- Capacidad de generar identificadores de token y mascaras de atencion listas para alimentar modelos encoder.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente: es un componente de preprocesamiento, no un modelo de lenguaje.
- El unico idioma soportado es el italiano.

## Casos de uso

- Clasificacion de documentos en italiano: usar gettone como preprocesador de un encoder AlBERTurin o de cualquier modelo compatible reduce el numero de tokens por documento, lo que baja el coste de atencion cuadratica y permite procesar textos mas largos dentro de la misma ventana.
- Reconocimiento de entidades nombradas (NER): una segmentacion mas compacta mantiene mas palabras dentro de cada secuencia, lo que ayuda a no partir entidades compuestas italianas entre fragmentos de ventana.
- Busqueda semantica y recuperacion (RAG) sobre corpus italianos: al reducir el numero de tokens por pasaje, se indexan mas documentos por unidad de memoria y se acelera la codificacion de embeddings.
- Fine-tuning de clasificadores de sentimiento o moderacion en italiano: reutilizar el vocabulario ya entrenado en la familia AlBERTurin evita tener que reentrenar la matriz de embeddings desde cero.
- Analisis de fertilidad y comparativa de vocabularios: el tokenizador sirve como referencia para medir cuantos subtokens consume un corpus propio, antes de decidir que vocabulario adoptar en un proyecto.
- Pretokenizacion de grandes corpus italianos en pipelines de preentrenamiento: con 32.768 entradas, la tabla de embeddings y las estadisticas asociadas ocupan mucho menos que las de vocabularios de 100.000 o 250.000 tokens.
- Integracion en servicios de inferencia de baja latencia: al ser un componente puramente algoritmico, su coste se ejecuta en CPU y no compite por VRAM con el modelo neuronal.

## Benchmarks y rendimiento

El unico dato de evaluacion publicado en la model card es la fertilidad media (subtokens por palabra) sobre el corpus del paper de AlBERTurin. Un valor menor indica una tokenizacion mas compacta.

| Tokenizador | Tipo | Tamano de vocabulario | Fertilidad (menor es mejor) |
|---|---:|---:|---:|
| gettone | BPE | 32.768 | 1,429 |
| Velvet-2B | BPE | 126.976 | 1,471 |
| UmBERTo | BPE | 32.005 | 1,493 |
| dbmdz | WordPiece | 31.102 | 1,497 |
| Minerva-7B | BPE | 51.200 | 1,560 |
| Minerva-350M | BPE | 32.768 | 1,644 |
| XLM-R | Unigram | 250.002 | 1,663 |
| mBERT | WordPiece | 119.547 | 1,719 |
| EuroBERT | BPE | 128.000 | 1,934 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de evaluacion de modelos en la informacion disponible, dado que gettone no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM para inferencia: 0 GB de VRAM dedicada; el tokenizador se ejecuta en CPU. La model card no especifica el tamano exacto de los ficheros distribuidos.
- GPU recomendadas: ninguna en particular. Cualquier CPU es suficiente para la tokenizacion.
- Cabe en cualquier GPU consumer y en entornos sin GPU; tambien en contenedores de pocos cientos de megabytes.
- Opciones de despliegue: libreria transformers (AutoTokenizer) y la libreria tokenizers de Hugging Face, que es la dependencia subyacente. No aplican vLLM, llama.cpp, Ollama ni TGI para el tokenizador en si, aunque el vocabulario puede cargarse desde el modelo que lo use.
- Latencia y throughput: no se publican mediciones. Al ser un algoritmo BPE sin operaciones matriciales, el coste de codificacion es despreciable frente al de cualquier modelo neuronal y se puede paralelizar por procesos en CPU.

## Comparativa con modelos similares

Comparativa de tokenizadores para italiano y multilingues, segun los datos de la model card:

| Tokenizador | Tipo | Vocabulario | Fertilidad | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| gettone | BPE | 32.768 | 1,429 | No disponible | Hugging Face (AlBERTurin/gettone) |
| Velvet-2B | BPE | 126.976 | 1,471 | No disponible | No disponible en la informacion proporcionada |
| UmBERTo | BPE | 32.005 | 1,493 | No disponible | No disponible en la informacion proporcionada |
| dbmdz | WordPiece | 31.102 | 1,497 | No disponible | No disponible en la informacion proporcionada |
| Minerva-350M | BPE | 32.768 | 1,644 | No disponible | No disponible en la informacion proporcionada |
| XLM-R | Unigram | 250.002 | 1,663 | No disponible | No disponible en la informacion proporcionada |
| mBERT | WordPiece | 119.547 | 1,719 | No disponible | No disponible en la informacion proporcionada |
| EuroBERT | BPE | 128.000 | 1,934 | No disponible | No disponible en la informacion proporcionada |

A igualdad de tamano de vocabulario (32.768 tokens), gettone supera a Minerva-350M en fertilidad (1,429 frente a 1,644) y, con un vocabulario muy inferior, tambien supera a XLM-R (250.002 tokens) y a EuroBERT (128.000 tokens). Frente a UmBERTo y dbmdz, el vocabulario es practicamente identico y la ventaja se mantiene, aunque mas ajustada.

## Limitaciones y advertencias

- Idiomas: solo italiano. Se desconoce su comportamiento en castellano, catalan, gallego u otras lenguas romanicas, y no se ha publicado una evaluacion de fertilidad cruzada.
- Fertilidad medida en un unico corpus: el valor de 1,429 corresponde al corpus de evaluacion del paper de AlBERTurin; en dominios muy especializados (juridico, medico, codigo) el rendimiento puede degradarse.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es un riesgo relevante antes de integrarlo en produccion.
- Sin datos de entrenamiento: no se detalla el corpus usado para construir el vocabulario, por lo que no se puede auditar la cobertura dialectal ni el sesgo de representacion de variedades regionales italianas.
- Sin historial de uso: la pagina registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.
- No es un modelo: no genera texto, no razona y no puede evaluarse con benchmarks de tareas; cualquier expectativa de funcionalidad de LLM aplicada a este repositorio es un error de interpretacion.
- Compatibilidad: el vocabulario esta ligado a la familia AlBERTurin; usarlo con otros modelos exige ajustar la matriz de embeddings y reentrenar.
- Fechas: la model card esta fechada en septiembre de 2026, un dato a tener en cuenta al verificar la vigencia de los enlaces y del articulo asociado.

## Enlaces

- Repositorio del tokenizador en Hugging Face: https://huggingface.co/AlBERTurin/gettone
- Modelo AlBERTmini (95M de parametros, 7B tokens): https://huggingface.co/AlBERTurin/AlBERTmini
- Modelo AlBERTina (140M de parametros, 14B tokens): https://huggingface.co/AlBERTurin/AlBERTina
- Modelo AlBERTone101 (450M de parametros, aproximadamente 101B tokens): https://huggingface.co/AlBERTurin/AlBERTone101
- Articulo de referencia: Rinaldi, Madeddu, Scozzaro, Delsanto, Radicioni y Patti, "AlBERTurin: A Fully Open Family of Italian Encoder Models with Modern Architectures", CLiC-it 2026 (no se proporciona URL en la informacion disponible).
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; el unico resultado recuperado no guarda relacion con el tokenizador.
