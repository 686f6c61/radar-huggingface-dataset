# fse/paranmt-300-sif10

## Resumen

`fse/paranmt-300-sif10` es un modelo de embeddings estaticos de frases derivado del modelo de embeddings de palabras ParaNMT-300. Lo publica el usuario `fse` dentro del ecosistema de la libreria Fast Sentence Embeddings (fse), una herramienta pensada para calcular representaciones vectoriales de frases de forma rapida y sin necesidad de una GPU. El modelo no es un transformer generativo: es una tabla de 77.224 filas por 300 dimensiones en float32 que se consulta mediante un tokenizador de palabras propio (`fse_words@1`), y el vector de una frase se obtiene como la media de las filas de sus tokens, normalizada a longitud unitaria.

La variante `sif10` incorpora la ponderacion SIF (Smooth Inverse Frequency) con `a=0.001` y la eliminacion de diez componentes principales ajustados sobre un corpus de entrenamiento, una tecnica clasica para mejorar la calidad de los embeddings de frases. Segun la model card, en el conjunto de test STS-B (1.379 pares) alcanza un Pearson x100 de 78,11 con float32, frente a 79,82 de la variante de media simple sobre la misma tabla. Su relevancia actual es acotada: sirve como baseline ligero y reproducible para similitud semantica y busqueda vectorial en ingles, y como ejemplo de empaquetado de embeddings estaticos en formato safetensors.

El modelo es exclusivamente para ingles, tiene licencia `unknown` (sin permiso explicito de uso) y su corpus de origen, ParaNMT, se entreno con CzEng 1.6, disponible solo para investigacion no comercial. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de preservacion mas que un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (tabla de consulta) con pooling por media y SIF-10 |
| Parametros totales | 23.815.132 (77.224 filas x 300 dimensiones, float32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; pooling sobre todos los tokens del texto) |
| Tipos de cuantizacion | float32, float16, int8 |
| Idiomas soportados | ingles (en) |
| Licencia | unknown (sin permiso explicito; ver limitaciones) |
| Formato de pesos | safetensors (fichero de 93.858.331 bytes) |

## Arquitectura y entrenamiento

No hay una red neuronal: el modelo es una tabla de embeddings de palabras de 77.224 entradas y 300 dimensiones, convertida desde el modelo gensim `fse/paranmt-300` en la revision `a08e15771891207a22f840a3091a00a1657d888b`. La codificacion de una frase consiste en tokenizar con `fse_words@1`, ponderar cada token con el peso SIF `a/(a+p(w))` con `a=0.001`, promediar las filas ponderadas, restar la proyeccion sobre diez componentes principales no centrados y normalizar el resultado a longitud unitaria.

Las frecuencias de palabra provienen de wordfreq 3.1.1 (listas best de ingles), convertidas a conteos enteros sobre 2^31-1 y normalizadas en float32. Los diez componentes SIF se ajustaron sobre 859.346 parrafos del dataset `HuggingFaceFW/fineweb-edu-llama3-annotations` (revision `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`, semilla 0), nunca sobre los textos de evaluacion, y se plegaron en la tabla antes de cualquier cuantizacion. Los vectores de origen proceden de ParaNMT, cuyo paper es Wieting y Kiela (ACL 2018) y cuyo corpus de entrenamiento es CzEng 1.6. La model card advierte que la seleccion del corpus se guio por STS-B, STS-B Spearman y NanoBEIR, por lo que esas metricas no son estimaciones limpias sobre holdout.

## Capacidades

- Extraccion de features: genera un vector denso de 300 dimensiones por texto, normalizado a norma unitaria.
- Similitud semantica de frases: pensado para calcular similitud coseno entre pares de oraciones en ingles.
- Busqueda vectorial: adecuado como encoder de documentos y consultas en indices de recuperacion densa en ingles.
- Clasificacion y clustering de texto: los vectores sirven como entrada a clasificadores lineales o algoritmos de agrupamiento.
- Multilingue: no, solo ingles.
- Tool calling / function calling: no soportado.
- Razonamiento multi-paso o modo thinking: no soportado (no es un modelo generativo).
- Vision o audio: no soportado.
- Cuantizacion en inferencia: soporta float32, float16 e int8, calculando siempre en float32.

## Casos de uso

- Busqueda semantica en ingles sobre corpus pequenos o medianos: indexar documentos con el encoder y recuperar por similitud coseno; el coste computacional es una media ponderada, sin GPU ni atencion cuadratica.
- Deduplicacion de textos: comparar pares de parrafos o titulares por similitud coseno para detectar duplicados o near-duplicates en pipelines de datos.
- Clasificacion de texto con modelos lineales: usar los vectores de 300 dimensiones como features de entrada a una regresion logistica o SVM, con entrenamiento rapido y sin dependencia de GPU.
- Clustering y topic modeling ligero: agrupar resenas, tickets o articulos por similitud de embeddings para exploracion no supervisada.
- Filtrado y enrutamiento de consultas: decidir a que cola o categoria va una consulta de usuario comparando su embedding con centroides precalculados de cada categoria.
- Baseline en evaluacion de embeddings: servir como referencia reproducible en experimentos de similitud semantica (STS-B) y recuperacion (NanoBEIR) frente a encoders neuronales.
- Sistemas con restricciones de latencia o memoria: al ser una tabla de 94 MB en float32 y no requerir GPU, encaja en entornos embebidos, edge o funciones serverless con poca memoria.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los de STS-B y las metricas de preservacion de vecinos tras cuantizar:

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (float32, tokenizador por defecto) | 78,11215 |
| STS-B Pearson x100 (media simple float32, referencia) | 79,81644 |
| Diferencia frente a mismo metodo float32 (puntos) | +0,00000 |
| Recall@10 frente a mismo metodo float32 | 1,000000 |
| Tamano del fichero del modelo (bytes) | 93.858.331 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; la tabla en float32 ocupa unos 94 MB y en float16 o int8 se reduce aproximadamente a la mitad o a un cuarto respectivamente.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. En GPU, cualquier tarjeta con al menos 1 GB de memoria puede alojar la tabla.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Opciones de despliegue: la libreria `fse>=2.0` (`fse.Encoder.from_pretrained`); el modelo original gensim `fse/paranmt-300` puede cargarse con gensim; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica explicitamente que no se hace ninguna afirmacion de velocidad ni de tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Tipo |
|---|---|---|---|---|---|
| fse/paranmt-300-sif10 | 23,8 M | 300 | no aplica | unknown | Embeddings estaticos |
| fse/paranmt-300 | no disponible | 300 | no aplica | unknown | Embeddings estaticos (gensim) |
| all-MiniLM-L6-v2 | no disponible | 384 | 256 tokens | Apache-2.0 | Transformer encoder |
| GloVe (media de palabras) | no disponible | 50-300 | no aplica | variable | Embeddings estaticos |

La comparacion con encoders transformer como all-MiniLM-L6-v2 es la relevante en calidad: los embeddings estaticos suelen quedar por debajo en tareas de similitud y recuperacion, pero ofrecen un coste de inferencia mucho menor. No se dispone de resultados comparativos directos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia `unknown`: la model card advierte que no otorga permiso de uso y que el modelo se conserva solo por preservacion. No hay autorizacion explicita para uso comercial.
- Origen de datos con restricciones: ParaNMT se entreno con CzEng 1.6, disponible solo para investigacion no comercial; la model card aclara que esto no establece una licencia para los vectores derivados.
- Solo ingles: no cubre otros idiomas.
- Sin capacidad generativa: no puede responder preguntas, razonar ni invocar herramientas; solo produce vectores.
- Sesgos: no documentados en la informacion disponible; al derivarse de un corpus de traduccion y de frecuencias de wordfreq, puede heredar sesgos de esos datos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los vectores pueden producir similitudes enganosas en dominios alejados del corpus de entrenamiento.
- Frecuencias con terminos de atribucion: los datos de wordfreq incluyen material CC BY-SA 4.0, cuyos terminos no quedan anulados por el campo de licencia del modelo.
- Seleccion de corpus guiada por benchmarks: las puntuaciones de STS-B y NanoBEIR no son estimaciones limpias sobre holdout.
- Modelo practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/paranmt-300-sif10
- Modelo base: https://huggingface.co/fse/paranmt-300
- Libreria fse (Fast Sentence Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- Paper de ParaNMT: https://aclanthology.org/P18-1042/
- Repositorio ParaNMT: https://github.com/jwieting/para-nmt-50m
- Corpus CzEng 1.6: https://ufal.mff.cuni.cz/czeng/czeng16
- wordfreq: https://github.com/rspeer/wordfreq
- Atribuciones de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
- Dataset de componentes: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
