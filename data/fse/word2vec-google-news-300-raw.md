# fse/word2vec-google-news-300-raw

## Resumen

`fse/word2vec-google-news-300-raw` es una conversion al formato nativo de la libreria fse del clasico modelo de embeddings estaticos word2vec de Google News, publicado originalmente por el equipo de word2vec de Google. No es un transformer ni un modelo generativo: es una tabla de embeddings de palabras de 3.000.000 de filas por 300 dimensiones en float32, sobre la que se aplica una agregacion de tipo mean pooling seguida de normalizacion L2 para producir un vector de frase. El autor de la conversion es el usuario `fse`, creador de la libreria Fast Sentence Embeddings.

Su relevancia actual es acotada pero concreta: sirve como referencia historica y como baseline de muy bajo coste para tareas de similitud semantica y recuperacion densa, y permite reproducir el comportamiento de los embeddings estaticos clasicos dentro de un stack moderno de inferencia. El modelo esta pensado exclusivamente para ingles y su licencia es de solo investigacion, heredada del proyecto original de word2vec.

La model card reporta un resultado medido de 61,54132 en Pearson x100 sobre el conjunto de test de STS-B (1.379 pares) usando el pooling raw, y de 70,88642 con la variante SIF-10. Estos valores sitúan el modelo muy por debajo de los encoders de frase neuronales contemporaneos, lo que lo convierte en una opcion de interes para experimentacion y docencia mas que para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (word2vec) con mean pooling y normalizacion L2 |
| Parametros totales | 944.258.511 (3.000.000 filas x 300 dimensiones, float32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; pooling sobre todos los tokens del texto) |
| Tipos de cuantizacion | float32, float16, int8 |
| Idiomas soportados | en (ingles) |
| Licencia | other (`word2vec-google-news-research-only`, solo investigacion) |
| Formato de pesos | safetensors |
| Vocabulario | 3.000.000 filas |
| Dimension del embedding | 300 |
| Tokenizador | `fse_words@1` |
| Pasos por fila | normalize@1 |
| Fingerprint | `xxh3-128:64e4ef70aca1f497f7173a33764825dd` |
| Tamano del repo | 3,7 GB |
| Modelo base | `fse/word2vec-google-news-300` (revision `4274c2efa75c99a64e3f83eabfc5b34d1acabe70`) |

## Arquitectura y entrenamiento

La arquitectura no es neuronal en el sentido moderno: se trata de una matriz de embeddings de palabras entrenada con el algoritmo word2vec (variante skip-gram o CBOW, no especificada en la informacion disponible) sobre un corpus de noticias de Google. Cada palabra del vocabulario tiene asociado un vector denso de 300 dimensiones en float32. Para obtener un embedding de frase, fse calcula la media de las filas correspondientes a los tokens del texto y normaliza el resultado a longitud unitaria (`normalize@1`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del corpus ni si hubo etapas de ajuste fino adicionales. La model card unicamente documenta el proceso de conversion: se parte del modelo gensim `fse/word2vec-google-news-300` y se transforma a una tabla safetensors compatible con fse 2.0 o posterior. La innovacion tecnica del artefacto no esta en el modelo en si, sino en el formato de almacenamiento y en la separacion explicita entre el metodo de pooling (raw frente a SIF-10) y el formato de almacenamiento (float32, float16, int8), con metricas medidas para cada combinacion.

## Capacidades

- Generacion de embeddings de frase en ingles mediante media de vectores de token y normalizacion L2.
- Similitud semantica entre textos (coseno) y recuperacion densa por vecino mas cercano.
- Representacion de vocabulario muy amplio: 3.000.000 de entradas, lo que cubre gran parte del lexico del ingles escrito, incluyendo nombres propios y terminos poco frecuentes.
- Soporte de tres formatos de almacenamiento (float32, float16, int8) con cambios de vecindad medidos y documentados.
- Variante de pooling alternativa SIF-10 (ponderacion por frecuencia y eliminacion del componente principal del corpus), con mejora medida en STS-B.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No tiene capacidades multimodales (vision, audio) ni generativas.
- Capacidades multilingues: solo ingles.

## Casos de uso

- Baseline en experimentos de similitud semantica: util para establecer un suelo de rendimiento antes de evaluar encoders neuronales como Sentence-BERT o E5, gracias a su resultado medido en STS-B (61,54 Pearson x100 raw, 70,89 con SIF-10).
- Recuperacion densa de bajo coste en prototipos: la tabla de 300 dimensiones permite indexar grandes volumenes de documentos en FAISS o hnswlib con un coste de memoria y computo muy inferior al de un transformer, adecuado para validar pipelines de busqueda antes de escalar a modelos mayores.
- Deduplicacion y agrupamiento de textos en ingles: el embedding de frase normalizado sirve para detectar near-duplicates en corpus de noticias o articulos, donde el vocabulario de 3M de entradas reduce los fallos por palabras fuera de vocabulario.
- Docencia y materiales sobre embeddings: permite ilustrar de forma reproducible la diferencia entre embeddings estaticos y contextuales, y el efecto del pooling (raw frente a SIF) sobre una metrica estandar.
- Clasificacion de texto ligera con modelos lineales: los vectores de frase pueden alimentar un clasificador logistico o una SVM en tareas de analisis de sentimiento o topicos cuando el presupuesto de inferencia es minimo y el idioma es ingles.
- Aumento de caracteristicas en pipelines tabulares de NLP: concatenar el embedding de 300 dimensiones como feature adicional junto a otras senales en modelos de ranking o scoring.
- Reproduccion de resultados historicos: permite replicar experimentos publicados con word2vec de Google News dentro de un stack moderno basado en safetensors y fse 2.0.

## Benchmarks y rendimiento

| Metrica | Valor medido |
|---|---|
| STS-B Pearson x100 (pooling raw, float32) | 61,54132 |
| STS-B Pearson x100 (SIF-10, float32) | 70,88642 |
| Diferencia frente a float32 mismo metodo | +0,00000 puntos |
| Recall@10 frente a float32 mismo metodo | 1,000000 |
| Pearson x100 con tokenizador por defecto | 61,54132 |
| Bytes del fichero del modelo | 3.665.259.542 |

La comparacion controlada de STS-B usa el preprocesado NLTK del notebook de la version 1.x a traves de una vista de tokenizador externo sobre la misma tabla. El Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra el resto, excluye la propia fila y resuelve empates por indice de fila. La model card no realiza ninguna afirmacion sobre velocidad de carga o de inferencia.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,7 GB en float32 para la tabla completa; en torno a 1,8 GB en float16 y 0,9 GB en int8, sin contar el overhead de la libreria y del indice de vecinos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para float32. Una RTX 3060, RTX 4060 o superior es suficiente; tambien funciona en CPU, dado que la operacion dominante es una lookup de filas y una media.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con 4 GB o mas, e incluso en iGPU o en CPU para lotes pequenos.
- Opciones de despliegue: la libreria fse (version 2.0 o posterior, con `fse.Encoder.from_pretrained`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponible. La model card declara explicitamente que no se realiza ninguna afirmacion de velocidad de carga o inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | STS-B Pearson x100 | Licencia | Formato |
|---|---|---|---|---|---|---|
| `fse/word2vec-google-news-300-raw` | 944.258.511 | 300 | no aplica | 61,54 (raw) / 70,89 (SIF-10) | Solo investigacion | safetensors |
| `fse/word2vec-google-news-300` (gensim, origen) | no disponible | 300 | no aplica | no disponible en la informacion | Solo investigacion | gensim/keyed vectors |
| GloVe 300d (referencia externa) | no disponible | 300 | no aplica | no disponible en la informacion | Dominio publico (segun su publicacion) | texto/binario |
| Encoders de frase neuronales (p. ej. familia Sentence-BERT) | 20-110 M tipico | 384-768 | 256-512 tokens | habitualmente por encima de 80 | Apache-2.0 / MIT en la mayoria | safetensors / PyTorch |

La comparativa se limita a lo verificable: el unico dato de rendimiento publicado en la informacion disponible es el de este modelo. Las cifras de alternativas no se incluyen porque no constan en la documentacion proporcionada. La diferencia cualitativa clave frente a los encoders neuronales es que este modelo no produce representaciones contextuales: la misma palabra recibe siempre el mismo vector, con independencia del contexto.

## Limitaciones y advertencias

- Licencia de solo investigacion: el proyecto original de word2vec declara que se publica "released for research purposes only". La licencia Apache-2.0 cubre el codigo de word2vec, no estos vectores preentrenados. No se afirma ningun permiso mas amplio, por lo que el uso comercial no esta autorizado por la model card.
- Ausencia de contextualidad: al ser embeddings estaticos, las palabras polisemicas reciben un unico vector, lo que degrada tareas de desambiguacion y similitud fina.
- Solo ingles: cualquier uso en otro idioma producira representaciones de baja calidad o directamente vacias para tokens fuera del vocabulario.
- Riesgo de sesgo: el corpus de noticias de Google de la epoca de entrenamiento incorpora los sesgos de genero, raza y nacionalidad presentes en la cobertura periodistica; no se documenta ningun proceso de mitigacion.
- Sensibilidad al tokenizador: la model card advierte que el resultado depende del tokenizador usado; el valor por defecto (`fse_words@1`) y el preprocesado NLTK del notebook 1.x producen metricas que deben interpretarse en su contexto.
- Rendimiento muy inferior al estado del arte: un 61,54 en Pearson x100 en STS-B esta lejos de los encoders neuronales actuales, por lo que no es adecuado como componente principal en sistemas de busqueda semantica en produccion.
- Dependencia de la libreria fse 2.0 o posterior: el artefacto no es cargable con transformers ni con gensim directamente en el formato publicado.
- Sin garantias de velocidad: no se han publicado mediciones de latencia ni throughput, por lo que cualquier estimacion de rendimiento en produccion debe hacerse con pruebas propias.
- Fecha de creacion futura en los metadatos (2026-11-01): conviene verificar la integridad y procedencia del repositorio antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/word2vec-google-news-300-raw
- Modelo base en HuggingFace: https://huggingface.co/fse/word2vec-google-news-300
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Proyecto original de word2vec (Google Code Archive): https://code.google.com/archive/p/word2vec/
