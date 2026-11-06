# fse/word2vec-google-news-300-sif10-int8

## Resumen

`fse/word2vec-google-news-300-sif10-int8` es una version cuantizada a int8 de los embeddings estaticos de word2vec entrenados sobre Google News (300 dimensiones), empaquetada en el formato propio de la libreria `fse` (Fast Sentence Embeddings) y transformada con la ponderacion SIF-10 (Smooth Inverse Frequency con 10 componentes principales eliminados). Lo publica el usuario `fse` como modelo derivado de `fse/word2vec-google-news-300`, y su proposito es servir como extractor de caracteristicas de frases mediante la media ponderada de los vectores de sus tokens, normalizada a longitud unitaria.

No es un modelo generativo ni un transformer: es una tabla de embeddings estatica de 3.000.000 de filas por 300 dimensiones almacenadas en int8, con 947.258.511 parametros totales y un repositorio de aproximadamente 1 GB. Su relevancia es practica: ofrece una linea base de recuperacion y similitud semantica muy barata computacionalmente, con una calidad medida en STS-B de 70,88874 de Pearson x100, a apenas 0,00232 puntos de la misma variante en float32.

El modelo esta pensado exclusivamente para ingles y su licencia es de solo investigacion, heredada del proyecto original de word2vec. Requiere la libreria `fse` version 2.0 o superior para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (word2vec, media ponderada SIF de filas de tokens, normalizada a longitud unitaria) |
| Parametros totales | 947.258.511 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de bolsa de palabras; sin ventana de atencion) |
| Tipos de cuantizacion | int8 (tabla principal); el autor referencia float32 y float16 como alternativas de la misma familia |
| Idiomas soportados | Ingles (en) |
| Licencia | `other` / `word2vec-google-news-research-only` (solo investigacion) |
| Formato de pesos | safetensors, con tabla almacenada mediante `quantize_rows@1` |

## Arquitectura y entrenamiento

La arquitectura no es un transformer sino una tabla de embeddings estatica de 3.000.000 de filas (vocabulario) por 300 dimensiones, almacenada en int8 y derivada de la tabla float32 con huella `xxh3-128:d978a501f78756a2f85d6e72fb7835d8`. El pipeline de inferencia es: tokenizacion con `fse_words@1`, lookup de filas, ponderacion SIF con pesos `a/(a+p(w))` donde `a=0.001`, eliminacion de 10 componentes no centrados previamente ajustados, media de las filas y normalizacion a longitud unitaria (`normalize@1`). La huella del modelo es `xxh3-128:06ce76785b6c401587536055650438bd`.

Los pesos SIF se calculan a partir de frecuencias de `wordfreq` 3.1.1 (frecuencias best-list del ingles, convertidas a conteos enteros sobre 2^31-1 con defecto 1e-8 y normalizadas en float32). Los 10 componentes se ajustaron sobre 859.346 parrafos de entrenamiento del dataset `HuggingFaceFW/fineweb-edu-llama3-annotations` (revision `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`, semilla 0), nunca sobre textos de evaluacion, y se plegaron en la tabla ponderada antes de la cuantizacion. El corpus se selecciono maximizando la media de Pearson y Spearman en STS-B y nDCG@10 macro en NanoBEIR, por lo que esas metricas no son estimaciones de holdout limpias. El fichero `preparation.json` registra el recibo completo del ajuste.

## Capacidades

- Extraccion de caracteristicas de frases y documentos: genera un vector de 300 dimensiones por texto mediante media ponderada SIF de los vectores de sus tokens.
- Similitud semantica y recuperacion densa: adecuado para busqueda por similitud coseno, deduplicacion y clustering de textos en ingles.
- Clasificacion de texto como entrada a modelos supervisados ligeros (regresion logistica, SVM) sobre las representaciones generadas.
- Representacion de palabras individuales mediante lookup directo en la tabla de 3.000.000 de filas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene modo thinking, vision ni audio.
- Multilingue: no; solo ingles.
- Cuantizacion int8 con perdida medida: Recall@10 de 0,997027 frente a la misma variante en float32.

## Casos de uso

- Busqueda semantica de bajo coste en corpus ingleses: indexar documentos con vectores de 300 dimensiones int8 y recuperar por similitud coseno, con un coste de almacenamiento y computo muy inferior al de un transformer denso.
- Deduplicacion y near-duplicate detection: comparar pares de frases con la similitud coseno de sus embeddings SIF, que penaliza terminos frecuentes y mejora la discriminacion frente a la media simple.
- Clustering y topic modeling: agrupar articulos o tickets en ingles con k-means sobre los vectores normalizados, como paso previo a etiquetado manual o a un modelo generativo.
- Filtrado y triaje en pipelines de datos: prefiltrar un corpus grande por relevancia semantica antes de pasarlo a un LLM, reduciendo el volumen de tokens procesados por el modelo caro.
- Clasificacion supervisada ligera: entrenar un clasificador lineal sobre las representaciones para moderacion de contenido o enrutamiento de tickets, con requisitos de infraestructura minimos.
- Linea base en evaluacion de recuperacion: usar el modelo como referencia reproducible en experimentos de IR en ingles, dado que el autor documenta la receta exacta y las huellas de verificacion.
- Sistemas embebidos o edge: desplegar extraccion de features en CPU sin GPU, ya que la tabla int8 ocupa aproximadamente 977 MB en disco.

## Benchmarks y rendimiento

| Metrica | Valor medido |
|---|---|
| STS-B Pearson x100 (tokenizer por defecto) | 70,88874 |
| STS-B Pearson x100 (vista con tokenizer externo NLTK) | 70,88874 |
| Diferencia frente a misma variante float32 (puntos) | +0,00232 |
| Recall@10 frente a misma variante float32 | 0,997027 |
| Tamano del fichero del modelo (bytes) | 977.259.798 |
| Referencia float32 crudo (STS-B Pearson x100) | 61,54132 |
| Referencia SIF-10 float32 (STS-B Pearson x100) | 70,88642 |

La comparacion controlada en STS-B usa los 1.379 pares de test y el preprocesado NLTK del notebook de la version 1.x. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra todas las demas, excluyendo la propia y resolviendo empates por indice de fila. El autor no hace afirmaciones de velocidad ni de tiempo de carga.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en GPU de forma nativa; el backend de referencia es CPU. La tabla int8 ocupa aproximadamente 977 MB en disco y una cantidad similar en memoria al cargarse.
- GPU recomendadas: no se especifican; el modelo es viable en CPU. Cualquier GPU consumer con suficiente memoria para alojar la tabla (por encima de 1 GB) podria usarse si el backend lo permite, pero el autor no documenta soporte GPU.
- Cabe en GPU consumer: si, en la practica cualquier GPU con 2 GB o mas de memoria, aunque el caso de uso natural es CPU.
- Opciones de despliegue: exclusivamente la libreria `fse>=2.0` mediante `fse.Encoder.from_pretrained`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles; el autor declara explicitamente que no hace afirmaciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| fse/word2vec-google-news-300-sif10-int8 | 947.258.511 | 300 (int8) | No aplica | Solo investigacion | safetensors (fse) |
| fse/word2vec-google-news-300 (base) | No disponible | 300 (float32) | No aplica | Solo investigacion | gensim |
| Sentence-BERT (all-MiniLM-L6-v2) | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible |
| GloVe (variantes 300d) | No disponible en la informacion | 300 | No aplica | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la unica comparacion documentada es interna, frente a las variantes float32 y float16 de la misma familia.

## Limitaciones y advertencias

- Licencia de solo investigacion: el proyecto original de word2vec declara que se publica "released for research purposes only". Apache-2.0 cubre el codigo de word2vec, no estos vectores preentrenados. El uso comercial no esta autorizado por la model card.
- El campo `license: other` no exime de las condiciones de los datos de frecuencia de `wordfreq`, que incluyen material CC BY-SA 4.0 y creditos especificos por fuente recogidos en su NOTICE.md.
- Solo ingles: no hay soporte multilingue ni de otros idiomas.
- Modelo de bolsa de palabras: ignora el orden de los tokens y no captura negacion, sintaxis compleja ni dependencias de largo alcance. El contexto efectivo es la frase completa pero sin estructura.
- Riesgo de sesgo: los vectores de Google News heredan los sesgos del corpus periodistico original (genero, raza, nacionalidad, profesion), documentados historicamente en la literatura sobre word2vec.
- Sin capacidad generativa: no puede alucinar texto porque no genera, pero si puede producir similitudes espurias por polisemia y por la perdida de informacion de la cuantizacion int8 (Recall@10 de 0,997027 implica un 0,3 % de cambios en el vecindario).
- Las metricas de seleccion de corpus (STS-B y NanoBEIR) guiaron la eleccion del corpus de ajuste, por lo que no son estimaciones de holdout limpias.
- Dependencia de la libreria `fse>=2.0`: no es cargable con transformers, sentence-transformers ni herramientas estandar.
- El autor no garantiza la fidelidad de los vectores cuantizados respecto a los originales float32; solo la mide.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/word2vec-google-news-300-sif10-int8
- Modelo base: https://huggingface.co/fse/word2vec-google-news-300
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Proyecto original de word2vec: https://code.google.com/archive/p/word2vec/
- Libreria wordfreq: https://github.com/rspeer/wordfreq
- NOTICE de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
