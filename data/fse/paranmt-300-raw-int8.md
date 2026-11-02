# fse/paranmt-300-raw-int8

## Resumen

`fse/paranmt-300-raw-int8` es una version cuantizada a int8 de un modelo de embeddings estaticos derivado de ParaNMT, publicado por el autor `fse` en HuggingFace. No es un transformer generativo: es una tabla de embeddings de palabras de 77.224 filas por 300 dimensiones almacenada en enteros de 8 bits, sobre la que se calcula un vector de frase como la media de los vectores de sus tokens, normalizada a longitud unitaria. El modelo base es `fse/paranmt-300`, un modelo de gensim convertido desde el ParaNMT original de Wieting et al. (2018).

El modelo resuelve el problema de obtener representaciones de frases y palabras de forma extremadamente barata en computo: no requiere GPU ni inferencia neuronal, solo una tabla de lookup y una media. Esto lo hace relevante para sistemas de recuperacion, deduplicacion y busqueda semantica a gran escala donde el coste por documento es critico y la calidad de un embedding denso moderno no es imprescindible.

La cuantizacion a int8 reduce el fichero a unos 24,6 MB (23.892.356 parametros reales en safetensors) manteniendo, segun la model card, un Pearson x100 de 79,818 en STS-B, con una diferencia de +0,00153 puntos respecto al mismo metodo en float32 y un Recall@10 de 0,995722 frente a esa misma referencia. La licencia es desconocida y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (tabla de palabras, media de tokens de frase) |
| Parametros totales | 23.892.356 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; media de todos los tokens) |
| Tipos de cuantizacion | int8 (este repo); el modelo base dispone de float32 y float16 |
| Idiomas soportados | en (ingles) |
| Licencia | unknown (licencia del modelo fuente sin declarar; no otorga permiso) |
| Formato de pesos | safetensors (tabla int8; libreria fse, no transformers) |

## Arquitectura y entrenamiento

No hay arquitectura neuronal en el sentido habitual. El artefacto es una matriz de embeddings de vocabulario (77.224 filas) por 300 dimensiones, almacenada en int8 y generada mediante la operacion `quantize_rows@1` a partir de la tabla float32 con huella `xxh3-128:d0457b3eb8b4213d26d2056fa52cf0cf`. El tokenizador es `fse_words@1` y cada fila se normaliza (`normalize@1`). La huella del artefacto resultante es `xxh3-128:e49c0b0f0d05fcebcb96a99c443d375d`. El calculo del embedding de una frase es la media de las filas de sus tokens, normalizada a norma unitaria.

El origen de los vectores es el modelo ParaNMT de Wieting et al., entrenado con pares de parafrasis generados por traduccion automatica sobre el corpus CzEng 1.6. La model card no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o ajuste supervisado; esos datos corresponden al trabajo original y no se reproducen en esta ficha. La innovacion tecnica de esta publicacion concreta es la cuantizacion int8 con preservacion medida de vecinos: fse computa en float32 internamente y la model card reporta que en backend CPU los vectores son identicos bit a bit a los de su referencia.

## Capacidades

- Generacion de embeddings de frase mediante media de vectores de token y normalizacion L2.
- Embeddings de palabra individuales a partir de la tabla de 300 dimensiones.
- Similitud coseno y recuperacion por vecino mas cercano sobre corpus en ingles.
- Extraccion de caracteristicas (`feature-extraction`) para pipelines de NLP clasicos.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling, function calling ni uso como agente.
- Sin capacidades multimodales (ni vision ni audio).
- Sin modo de razonamiento explicito ni decodificacion especulativa.
- Multilingue: no; solo ingles declarado.

## Casos de uso

- Deduplicacion semantica de documentos a gran escala: al ser una tabla de lookup sin inferencia neuronal, se pueden procesar millones de documentos en CPU comparando medias de vectores con un umbral de coseno, sin coste de GPU.
- Busqueda semantica ligera en entornos embebidos: el fichero de 24,6 MB cabe en memoria de dispositivos con recursos limitados y permite indexar un corpus pequeno en ingles sin servicio externo.
- Clasificacion de texto por similitud a prototipos: calcular el vector medio de cada clase y asignar documentos por vecino mas cercano, util como baseline rapido o como filtro previo a un modelo mas caro.
- Agrupamiento (clustering) de titulares o resenas en ingles: los embeddings normalizados permiten k-means o HDBSCAN sobre representaciones baratas de calcular.
- Filtrado previo en pipelines de recuperacion (recall stage): usar este modelo para reducir candidatos y reservar un cross-encoder o un transformer grande para el reranking, reduciendo coste total.
- Deteccion de parafrasis y near-duplicates en datasets de entrenamiento: la ascendencia ParaNMT hace que los vectores esten orientados a capturar similitud parafrastica, adecuado para limpiar corpus antes de entrenar otros modelos.
- Analisis de similitud en investigacion reproducible: la model card documenta huellas y metricas controladas en STS-B, lo que facilita replicar experimentos y comparar metodos (raw frente a SIF-10).

## Benchmarks y rendimiento

Datos reportados en la model card sobre el conjunto de test STS-B (1.379 pares):

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (tokenizador por defecto, raw) | 79,81797 |
| Diferencia frente a float32 del mismo metodo (puntos) | +0,00153 |
| Recall@10 frente a float32 del mismo metodo | 0,995722 |
| Bytes del fichero del modelo | 24.665.819 |
| STS-B Pearson x100, raw float32 (referencia) | 79,81644 |
| STS-B Pearson x100, SIF-10 float32 (referencia) | 78,11215 |

La comparacion controlada usa el preprocesado NLTK del notebook 1.x mediante una vista con tokenizador externo de la misma tabla. Recall@10 compara cada una de las 2.758 filas de frases STS-B contra el resto, excluyendo la propia fila y resolviendo empates por indice de fila. No se aportan datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es CPU pura sobre una tabla de 24,6 MB.
- Memoria RAM: del orden de decenas de MB para el modelo, mas el corpus indexado.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer y en dispositivos de bajos recursos; la GPU no aporta ventaja significativa.
- Despliegue: mediante la libreria `fse>=2.0` (`pip install "fse>=2.0"`), no a traves de transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card indica explicitamente que no se hace ninguna afirmacion de velocidad o tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| fse/paranmt-300-raw-int8 | 23,9 M (tabla) | 300 | no aplica | unknown | safetensors int8 (fse) |
| fse/paranmt-300 (base) | no disponible | 300 | no aplica | unknown | gensim |
| Sentence-transformers tipo MiniLM (p. ej. all-MiniLM-L6-v2) | ~22 M | 384 | 256-512 tokens | Apache-2.0 (segun variante) | transformers / ONNX |
| fastText / GloVe estaticos | variable | 100-300 | no aplica | variable | texto / binario |

La comparacion directa con modelos tipo MiniLM no es equivalente: aquellos son transformers con atencion y contexto limitado, mientras que este es una media de embeddings de palabra sin modelado de orden. Los datos de rendimiento de los alternativos no se incluyen aqui porque no se han proporcionado; no se inventan cifras.

## Limitaciones y advertencias

- Licencia `unknown`: no otorga permiso de uso. El modelo fuente no declara licencia en los materiales inspeccionados, y los datos de entrenamiento originales (CzEng 1.6) solo son libres para investigacion no comercial; esto no establece una licencia para los vectores derivados.
- Solo ingles declarado; el rendimiento en otros idiomas no esta medido ni garantizado.
- Al ser una media de vectores de palabra, ignora el orden de las palabras y la estructura sintactica; frases con las mismas palabras en distinto orden producen el mismo vector.
- Sin modelado de negacion ni de composicionalidad; la similitud puede ser alta entre frases con significado opuesto.
- Riesgo de sesgos inheridos del corpus CzEng y de los pares de parafrasis generados por traduccion automatica; no se documenta ninguna mitigacion.
- Riesgo de alucinacion no aplica en sentido generativo (no genera texto), pero si de falsos positivos en recuperacion por similitud coseno.
- La cuantizacion int8 introduce cambios de vecinos medidos (Recall@10 de 0,995722 frente a float32); para aplicaciones sensibles a ranking exacto conviene usar la variante float32.
- La model card advierte de que la cercania a los vectores pre-cuantizacion se mide, no se promete por el fichero; verificar en el corpus propio.
- Dependencia de la libreria `fse>=2.0`; no es compatible con el ecosistema transformers estandar.
- Sin datos publicados de latencia, throughput ni consumo de memoria en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/paranmt-300-raw-int8
- Modelo base: https://huggingface.co/fse/paranmt-300
- Repositorio fse (Fast Sentence Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- Issues del repositorio (solicitudes de retirada): https://github.com/oborchers/Fast_Sentence_Embeddings/issues
- ParaNMT (codigo original): https://github.com/jwieting/para-nmt-50m
- Paper de ParaNMT (ACL Anthology): https://aclanthology.org/P18-1042/
- Corpus CzEng 1.6: https://ufal.mff.cuni.cz/czeng/czeng16
