# fse/glove-wiki-gigaword-300-sif10-int8

## Resumen

`fse/glove-wiki-gigaword-300-sif10-int8` es un modelo de embeddings estaticos de palabras y frases derivado de GloVe (Wikipedia + Gigaword, 300 dimensiones) y empaquetado en formato int8 para su uso con la libreria `fse` (Fast Sentence Embeddings) a partir de la version 2.0. No es un modelo generativo ni un transformer: es una tabla de 400.000 filas por 300 dimensiones cuantizada a 8 bits, sobre la que se aplica una tokenizacion de palabras (`fse_words@1`), normalizacion por fila y una ponderacion SIF (Smooth Inverse Frequency) con 10 componentes principales eliminados.

El modelo resuelve el problema de obtener representaciones de frases rapidas y de baja huella de almacenamiento en escenarios donde no se justifica un transformer: busqueda semantica ligera, deduplicacion, clustering o recuperacion en CPU. Su relevancia practica reside en el tamano (un unico fichero de unos 128 MB), la ausencia de GPU y la reproducibilidad bit a bit declarada en el backend CPU de `fse`.

La variante concreta combina tres decisiones: la tabla base GloVe de 300 dimensiones, la preparacion SIF-10 (ponderacion por frecuencia de palabra y eliminacion de componentes ajustados sobre un corpus de 859.346 parrafos de `HuggingFaceFW/fineweb-edu-llama3-annotations`) y la cuantizacion int8 posterior al plegado de componentes. El autor reporta 69,22183 de Pearson x100 en STS-B, con una perdida de 0,00250 puntos respecto a la misma variante en float32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (tabla de palabras, media ponderada SIF-10 y normalizacion L2); no es un transformer |
| Parametros totales | 123.756.475 (400.000 filas x 300 dimensiones en int8, segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; al ser una media de las filas de tokens, no hay ventana de atencion, pero el coste crece linealmente con el numero de tokens del texto |
| Tipos de cuantizacion | int8 (este repositorio); el autor referencia variantes float32 y float16 de la misma tabla |
| Idiomas soportados | Ingles (`en`) |
| Licencia | PDDL (Public Domain Dedication and License) para los vectores; los datos de frecuencia de wordfreq incorporan material CC BY-SA 4.0 y creditos por fuente |
| Formato de pesos | safetensors (libreria `fse`) |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual: los vectores proceden de GloVe sobre Wikipedia y Gigaword, con 400.000 entradas de vocabulario y 300 dimensiones, almacenados como enteros de 8 bits mediante el paso `quantize_rows@1` aplicado sobre la tabla float32 con huella `xxh3-128:a528d399d7e9d11cf5ebec5f45e668d7`. La inferencia consiste en tokenizar con `fse_words@1`, promediar las filas de tokens con pesos SIF `a/(a+p(w))` (a = 0,001, frecuencias de wordfreq 3.1.1 con `lang_freq='en'`), restar la proyeccion sobre 10 componentes no centrados ajustados sobre el corpus de preparacion y normalizar el resultado a longitud unitaria (`normalize@1`).

La innovacion tecnica destacable es el orden del pipeline: los 10 componentes se ajustan exclusivamente sobre 859.346 parrafos de entrenamiento (nunca sobre los textos de evaluacion), se pliegan en la tabla ponderada y solo despues se cuantiza a int8. El autor documenta las huellas xxh3-128 del corpus tokenizado y de los pesos ajustados, y afirma que en el backend CPU de `fse` los vectores se calculan bit a bit igual que su referencia. La seleccion del corpus de componentes se guio por la media de STS-B Pearson, STS-B Spearman y NanoBEIR macro nDCG@10, por lo que esas cifras no son estimaciones de holdout limpias.

## Capacidades

- Extraccion de features a nivel de frase: `encoder.encode(["A sentence."])` devuelve un vector normalizado por texto.
- Similitud semantica y recuperacion densa mediante producto escalar o coseno (equivalente tras normalizacion).
- Agrupamiento y deduplicacion de textos por vecindad en el espacio de embeddings.
- Ponderacion SIF con eliminacion de componentes frecuentes, pensada para mitigar el peso de palabras ubicuas en la media.
- Ejecucion en CPU sin GPU, con un unico fichero de pesos de aproximadamente 128 MB.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes.
- Sin capacidades multilingues: solo ingles.
- Sin modo de razonamiento ni decodificacion especulativa (no aplica a un modelo no generativo).

## Casos de uso

- Busqueda semantica en catalogo de documentos: indexar titulos o parrafos con `encoder.encode` y recuperar por similitud coseno; adecuado cuando el corpus es grande y se prioriza coste de CPU y tamano de indice sobre la precision de un transformer.
- Deduplicacion de registros: calcular embeddings de descripciones o noticias y marcar pares por encima de un umbral de similitud; el modelo cabe en memoria y permite procesar lotes sin GPU.
- Clustering de tickets de soporte: agrupar mensajes de usuarios en ingles con k-means sobre los vectores normalizados para enrutar incidencias por tema.
- Filtrado previo en pipelines RAG: usar el modelo como primera etapa de recuperacion barata y reservar un cross-encoder o un modelo mayor para el reranking de los candidatos.
- Clasificacion ligera con modelos lineales: entrenar una regresion logistica o SVM sobre los embeddings como baseline rapido antes de invertir en un transformer ajustado.
- Deteccion de similitud entre pares de frases en evaluacion offline: comparar respuestas de un sistema con referencias mediante coseno, con la advertencia de que el propio autor midio el modelo en STS-B y ese benchmark guio la seleccion del corpus.
- Prototipado y tests de regresion: al ser determinista en CPU y bit a bit reproducible, sirve para fijar resultados esperados en tests de pipelines de embeddings.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (Pearson x100 sobre las 1.379 parejas de test de STS-B):

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (int8, este modelo) | 69,22183 |
| Diferencia frente a la misma variante en float32 | -0,00250 puntos |
| Recall@10 frente a la misma variante en float32 | 0,996701 |
| STS-B Pearson x100 con tokenizador por defecto (`fse_words@1`) | 69,22183 |
| Referencia: GloVe float32 crudo (media simple) | 44,46410 |
| Referencia: SIF-10 float32 | 69,22434 |
| Tamano del fichero de modelo | 127.757.762 bytes |

El autor advierte que la comparacion controlada de STS-B usa el preprocesado NLTK del notebook de la version 1.x a traves de una vista con tokenizador externo, y que el Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra el resto excluyendo la propia, resolviendo empates por indice de fila. No se aportan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM: no requiere GPU; el fichero de pesos ocupa unos 128 MB y el proceso completo cabe en RAM de CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. El autor no publica latencias.
- Consumer GPU: irrelevante para el caso de uso, aunque podria ejecutarse en cualquier GPU si el backend lo permite.
- Despliegue: exclusivamente mediante la libreria `fse` (version 2.0 o superior, `pip install "fse>=2.0"`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles; el coste es lineal en el numero de tokens del texto de entrada.

## Comparativa con modelos similares

| Modelo | Parametros / dimension | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `fse/glove-wiki-gigaword-300-sif10-int8` | 400.000 x 300 (int8) | No aplica | PDDL | safetensors (`fse`) | SIF-10 con 10 componentes eliminados y cuantizacion int8 |
| `fse/glove-wiki-gigaword-300` (modelo base) | 400.000 x 300 (float32) | No aplica | PDDL | gensim | Sin ponderacion SIF ni cuantizacion |
| Variantes float16/float32 de la misma tabla SIF-10 | 400.000 x 300 | No aplica | PDDL | safetensors (`fse`) | Mayor fidelidad de vecindad a costa de tamano; el autor reporta -0,00250 puntos de Pearson para int8 |

No se dispone en la informacion proporcionada de comparaciones con otros modelos de embeddings de frases (por ejemplo, familias tipo Sentence-BERT o E5); esos datos no estan disponibles.

## Limitaciones y advertencias

- Solo ingles: cualquier texto en otro idioma queda fuera del vocabulario o se representa de forma poco fiable.
- Es una bolsa de palabras ponderada: no captura orden, negacion ni dependencias sintacticas largas, a diferencia de un transformer.
- Riesgo de sesgos heredados de Wikipedia y Gigaword, sin filtrado ni mitigacion documentada.
- Alucinacion en sentido estricto no aplica, pero la similitud puede ser enganosa en textos con vocabulario fuera de dominio o palabras raras ausentes del vocabulario de 400.000 entradas.
- Las cifras de STS-B y NanoBEIR guiaron la seleccion del corpus de componentes; no deben interpretarse como estimaciones de holdout limpias.
- Licencia: los vectores son PDDL, pero los datos de frecuencia de wordfreq incluyen material CC BY-SA 4.0 y creditos por fuente (NOTICE.md); la licencia del modelo fuente no renuncia a esos terminos.
- Dependencia estricta de `fse` 2.0 o superior; no es compatible con `sentence-transformers`, `transformers` ni otros runners estandar.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.
- El autor no publica latencias ni throughput; cualquier estimacion de rendimiento en produccion debe medirse sobre el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/glove-wiki-gigaword-300-sif10-int8
- Modelo base: https://huggingface.co/fse/glove-wiki-gigaword-300
- Repositorio de fse (Fast Sentence Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- Dataset de preparacion: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
- Licencia PDDL: https://opendatacommons.org/licenses/pddl/1-0/
- GloVe (autores): https://github.com/stanfordnlp/GloVe
- wordfreq: https://github.com/rspeer/wordfreq
- Creditos de datos de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
