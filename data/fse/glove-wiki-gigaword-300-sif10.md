# fse/glove-wiki-gigaword-300-sif10

## Resumen

`fse/glove-wiki-gigaword-300-sif10` es un modelo de embeddings estaticos de frases derivado del clasico GloVe entrenado sobre Wikipedia y Gigaword, con 300 dimensiones por palabra y un vocabulario de 400.000 filas. Lo publica el proyecto fse (Fast Sentence Embeddings) como una conversion del modelo gensim `fse/glove-wiki-gigaword-300`, incorporando la ponderacion SIF (Smooth Inverse Frequency) con `a=0.001` y la eliminacion de diez componentes principales frecuentes, tecnicas descritas originalmente por Arora et al.

El modelo no es un transformer: es una tabla de embeddings estaticos de 123.356.475 parametros almacenada en float32 (unos 486 MB). La representacion de una frase se obtiene como la media ponderada de las filas de sus tokens, normalizada a longitud unitaria. Resuelve el problema de generar embeddings de frases rapidos y deterministas sin coste de inferencia neuronal, util para busqueda semantica, deduplicacion o clasificacion ligera en entornos con recursos limitados.

Su relevancia es practica: frente a los modelos de embeddings neuronales, ofrece latencia de microsegundos por frase, huella de memoria fija y reproducibilidad total. En la comparacion controlada sobre 1.379 pares de test de STS-B, la variante SIF-10 obtiene 69,22434 de Pearson x100 frente a 44,46410 del promedio simple en float32, una mejora de casi 25 puntos que justifica el preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (tabla de palabras con pooling SIF), no neuronal |
| Parametros totales | 123.356.475 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sin ventana de contexto; agrega los tokens de la frase) |
| Tipos de cuantizacion | float32 (referencia), float16, int8 |
| Idiomas soportados | en (ingles) |
| Licencia | pddl (Public Domain Dedication and License) |
| Formato de pesos | safetensors (libreria `fse`) |
| Dimension de embedding | 300 |
| Vocabulario | 400.000 filas |
| Tokenizador | `fse_words@1` |
| Tamano del repo | 0,5 GB |
| Version minima de libreria | fse >= 2.0 |

## Arquitectura y entrenamiento

No hay una red neuronal implicada. El artefacto es una matriz de 400.000 x 300 en float32 que proviene de los vectores GloVe preentrenados sobre Wikipedia y Gigaword. Sobre esa tabla se aplica un preprocesado offline: primero se ponderan las filas por `a/(a+p(w))` con `a=0.001`, usando frecuencias de la lista `best` de wordfreq 3.1.1 convertidas a recuentos enteros sobre 2^31-1 con valor por defecto 1e-8 y normalizadas en float32; despues se ajustan diez componentes no centrados sobre un corpus de entrenamiento y se pliegan en la tabla ponderada. La cuantizacion se aplica despues del plegado.

El corpus de ajuste de componentes es `HuggingFaceFW/fineweb-edu-llama3-annotations` en la revision `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`, con 859.346 parrafos de entrenamiento y semilla 0. Los checksums registrados son `xxh3-128:88146a7f61a2c157c4710cfaf3e0cb4b` para el corpus tokenizado y `xxh3-128:f39211ff056a80af376a9afb7e50064a` para los pesos y componentes ajustados. No hay RLHF, DPO ni fine-tuning supervisado: el unico ajuste es estadistico (frecuencias y componentes). El corpus se selecciono maximizando la media de Pearson y Spearman en STS-B y nDCG@10 macro en NanoBEIR, escalados a 0-100, por lo que esas metricas no son estimaciones limpias de holdout.

## Capacidades

- Generacion de embeddings de frases y parrafos mediante media ponderada SIF de las filas de tokens, normalizada a norma unitaria.
- Extraccion de caracteristicas para similitud semantica, recuperacion densa y clustering de textos en ingles.
- Representacion determinista y reproducible: misma entrada, mismo vector, sin muestreo.
- Inferencia extremadamente rapida: una busqueda de tabla y un pooling, sin pasadas por capas.
- Soporte de cuantizacion a float16 e int8 con cambios de vecinos medidos (Recall@10 = 1,000000 frente a float32 en la misma variante).
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Multilingue: solo ingles; no cubre otros idiomas.

## Casos de uso

- Busqueda semantica en ingles sobre corpus medianos: indexar documentos con el encoder y consultar por similitud coseno; la tabla cabe en memoria y la codificacion es de microsegundos por frase, lo que permite reindexar sin coste apreciable.
- Deduplicacion de textos a gran escala: comparar embeddings normalizados de parrafos para detectar near-duplicates en pipelines de limpieza de datos, donde un modelo neuronal resultaria prohibitivo por coste.
- Clasificacion de texto ligera: usar los vectores de 300 dimensiones como entrada de un clasificador lineal (regresion logistica, SVM) para moderacion o etiquetado tematico en entornos con CPU.
- Recuperacion aumentada de bajo coste: como primera etapa de un sistema RAG para filtrar candidatos antes de un reranker neuronal, reduciendo el numero de documentos que pasan al modelo caro.
- Clustering y exploracion de corpus: agrupar articulos o resenas por similitud con k-means sobre los embeddings, util para analisis exploratorio sin GPU.
- Sistemas embebidos y edge: desplegar en dispositivos con poca memoria (menos de 1 GB en float32, menos aun en int8) donde no cabe un transformer de embeddings.
- Baseline reproducible en investigacion: referencia fija y determinista para comparar metodos de embedding de frases, dado que el resultado no depende de hardware ni de versiones de CUDA.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (SIF-10, float32) | 69,22434 |
| STS-B Pearson x100 (media simple, float32) | 44,46410 |
| Diferencia frente a float32 del mismo metodo | +0,00000 puntos |
| Recall@10 frente a float32 del mismo metodo | 1,000000 |
| STS-B Pearson x100 (tokenizador por defecto) | 69,22434 |
| Bytes del archivo del modelo | 486.157.506 |

La comparacion controlada usa el preprocesado NLTK del notebook 1.x mediante una vista de tokenizador externo sobre la misma tabla; la fila de tokenizador por defecto usa `fse_words@1` sobre texto crudo. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra el resto, excluye la propia y resuelve empates por indice de fila. El autor no hace afirmaciones de velocidad ni de tiempo de carga. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de generacion, ya que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada: unos 486 MB en float32; aproximadamente la mitad en float16 y una cuarta parte en int8 (mediciones de tamano del autor, sin cifra exacta de VRAM publicada).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo cabe en GTX 1650, RTX 3060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU consumer y tambien en CPU; no requiere GPU para funcionar.
- Despliegue: libreria `fse` >= 2.0 (`fse.Encoder.from_pretrained`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles; el autor declina explicitamente hacer afirmaciones de velocidad. Por la naturaleza del modelo (busqueda de tabla y pooling) la latencia por frase es del orden de microsegundos, pero no hay cifra medida publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Tipo |
|---|---|---|---|---|---|
| fse/glove-wiki-gigaword-300-sif10 | 123.356.475 | 300 | no aplica | pddl | Embeddings estaticos con SIF |
| fse/glove-wiki-gigaword-300 (base) | no disponible | 300 | no aplica | pddl | Embeddings GloVe sin SIF |
| Sentence-BERT (familia all-MiniLM) | no disponible en la informacion | no disponible | no disponible | no disponible | Transformer de embeddings |
| word2vec / fastText (promedio) | no disponible en la informacion | variable | no aplica | no disponible | Embeddings estaticos |

La comparacion cuantitativa disponible es interna: la variante SIF-10 supera al promedio simple del mismo modelo base en 24,76 puntos de Pearson x100 sobre STS-B. No se dispone de comparaciones publicadas frente a modelos neuronales de embeddings en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no cubre otros idiomas ni textos multilingues.
- Sin contexto: cada token se representa de forma aislada; no captura orden, negacion ni dependencia sintactica mas alla del pooling ponderado.
- Riesgo de alucinacion no aplica (no genera texto), pero la similitud coseno puede producir falsos positivos en pares con vocabulario compartido y significado opuesto.
- Sesgos heredados de GloVe sobre Wikipedia y Gigaword, incluyendo sesgos de genero, raza y geografia presentes en el corpus original.
- Las metricas de seleccion de corpus (STS-B, NanoBEIR) guiaron la eleccion del corpus de ajuste, por lo que no son estimaciones limpias de holdout; el rendimiento en dominios distintos puede ser inferior.
- La licencia pddl cubre los vectores, pero los datos de frecuencia de wordfreq incluyen material CC BY-SA 4.0 y creditos por fuente en `NOTICE.md`; el campo de licencia del modelo fuente no renuncia a esos terminos.
- Requiere la libreria `fse` >= 2.0; no es compatible con `sentence-transformers`, `transformers` ni APIs estandar de Hugging Face.
- Sin garantias de velocidad publicadas; el autor no reclama mejoras de carga o inferencia frente a otras variantes.
- Uso comercial permitido por la licencia pddl, pero conviene revisar las obligaciones de atribucion de wordfreq antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/glove-wiki-gigaword-300-sif10
- Modelo base: https://huggingface.co/fse/glove-wiki-gigaword-300
- Repositorio fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
- Licencia pddl: https://opendatacommons.org/licenses/pddl/1-0/
- GloVe (autores): https://github.com/stanfordnlp/GloVe
- wordfreq: https://github.com/rspeer/wordfreq
- Aviso legal de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
