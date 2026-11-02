# fse/paragram-300-sl999-sif10-int8

## Resumen

`fse/paragram-300-sl999-sif10-int8` es un modelo de embeddings estaticos de frases publicado por el usuario `fse` en HuggingFace. No es un transformer generativo, sino una tabla de vectores de palabras de 300 dimensiones cuantizada a int8, sobre la que se aplica una agregacion tipo mean con pesos SIF (Smooth Inverse Frequency) y normalizacion a longitud unitaria para producir un vector por texto. Deriva del modelo gensim `fse/paragram-300-sl999` (Paragram, 300 dimensiones) mediante cuantizacion de filas (`quantize_rows@1`) y un paso de preparacion SIF-10 ajustado sobre un corpus de parrafos de FineWeb-Edu.

El modelo resuelve el problema de obtener representaciones de frases rapidas y de bajo coste sin necesidad de una GPU ni de un transformer. Con 528.551.792 parametros en safetensors (principalmente la tabla de 1.703.756 filas por 300 dimensiones en int8) y un repositorio de 0,5 GB, esta pensado para `feature-extraction` en ingles, con un tokenizador propio (`fse_words@1`) y una libreria especifica (`fse>=2.0`).

Es relevante ahora como ejemplo de la linea de embeddings estaticos modernos: recupera la idea de Sentence Embeddings de tipo media ponderada, pero anade un ajuste SIF medido sobre STS-B (74,43709 de Pearson x100 frente a 51,45857 del mean crudo en float32) y una cuantizacion int8 con perdida medida de solo 0,00085 puntos y Recall@10 de 0,996483 respecto a float32. La licencia es desconocida, lo que limita su uso comercial sin aclaracion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (tabla Paragram) con agregacion mean ponderada SIF y normalizacion |
| Parametros totales | 528.551.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de embeddings estaticos, sin ventana de atencion) |
| Tipos de cuantizacion | int8 (tabla principal); el modelo base admite float32 y float16 segun la model card |
| Idiomas soportados | en (ingles) |
| Licencia | unknown (desconocida; no otorga permiso) |
| Formato de pesos | safetensors, tabla int8 con tokenizador `fse_words@1` |

## Arquitectura y entrenamiento

La arquitectura no es un transformer. Se trata de una tabla de embeddings de palabras de 300 dimensiones con 1.703.756 filas (vocabulario), derivada del modelo Paragram `fse/paragram-300-sl999`. La representacion de una frase se obtiene como la media de las filas de sus tokens, ponderada con pesos SIF `a/(a+p(w))` con `a=0.001`, seguida de la eliminacion de diez componentes no centrados y normalizacion a longitud unitaria. La tabla se almacena cuantizada a int8 mediante `quantize_rows@1` a partir de la tabla float32 con huella `xxh3-128:03b92a656496cada609ac05d18d4c722`.

El ajuste SIF se realizo offline sobre el corpus `HuggingFaceFW/fineweb-edu-llama3-annotations` (revision `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`), con 859.346 parrafos de entrenamiento y semilla 0. Las frecuencias de palabra provienen de `wordfreq` 3.1.1 con la lista `best` del ingles, convertidas a conteos enteros sobre 2^31-1 y normalizadas en float32. Los diez componentes se ajustaron sobre ese corpus de entrenamiento, nunca sobre los textos de evaluacion, y se plegaron en la tabla ponderada; la cuantizacion se aplica despues del plegado. El corpus se selecciono maximizando la media de STS-B Pearson, STS-B Spearman y NanoBEIR macro nDCG@10, por lo que esas metricas no constituyen una estimacion holdout limpia. El recibo completo del ajuste esta en `preparation.json`.

## Capacidades

- Generacion de embeddings de frases y textos cortos en ingles mediante media ponderada SIF de vectores de palabra.
- Extraccion de caracteristicas (`feature-extraction`) para similitud semantica, recuperacion y clustering.
- Busqueda por similitud y vecinos mas cercanos sobre representaciones normalizadas a longitud unitaria.
- Tokenizacion propia con `fse_words@1`, aplicable directamente sobre texto en bruto.
- Soporte de cuantizacion int8 con perdida medida minima frente a float32 (Recall@10 de 0,996483).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo puramente de representacion.
- Capacidad multilingue limitada al ingles.
- No dispone de modo thinking ni de generacion de texto.

## Casos de uso

- Busqueda semantica en ingles sobre grandes volumenes de documentos: el modelo produce vectores normalizados que permiten indexar y consultar por similitud coseno con un coste de computo muy bajo, sin GPU.
- Deduplicacion y clustering de textos: al ser una media ponderada de vectores de palabra, permite agrupar parrafos o titulares similares en pipelines de limpieza de datos a gran escala.
- Clasificacion de textos por similitud a prototipos: util para enrutado de tickets o etiquetado zero-shot aproximado comparando el vector del texto con vectores de referencia.
- Filtrado previo en pipelines RAG: como primera etapa de recuperacion barata antes de un reranker neuronal, reduciendo el numero de candidatos que llegan al modelo caro.
- Analisis de similitud en investigacion linguistica: comparacion de pares de frases con una metrica reproducible y con la trazabilidad del ajuste SIF documentada en `preparation.json`.
- Deteccion de near-duplicates en corpus de entrenamiento: la combinacion de int8 y bajo coste permite recorrer millones de filas con Recall@10 cercano a 1 respecto a float32.
- Baseline reproducible para evaluar embeddings estaticos frente a transformers en tareas de STS o recuperacion.

## Benchmarks y rendimiento

Los datos publicados en la model card son mediciones internas del autor, no resultados de benchmarks estandar comparables con otros modelos.

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (SIF-10, int8) | 74,43709 |
| STS-B Pearson x100 (mean crudo, float32) | 51,45857 |
| STS-B Pearson x100 (SIF-10, float32) | 74,43794 |
| Diferencia frente a float32 mismo metodo (puntos) | -0,00085 |
| Recall@10 frente a float32 mismo metodo | 0,996483 |
| Tamano del archivo del modelo (bytes) | 545.590.639 |
| Tokenizador por defecto, Pearson x100 | 74,43709 |

La comparacion controlada de STS-B usa el preprocesado NLTK del notebook 1.x a traves de una vista con tokenizador externo de la misma tabla; la fila del tokenizador por defecto usa `fse_words@1` sobre texto en bruto. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra el resto, excluyendo la propia y resolviendo empates por indice de fila. No se declara ninguna afirmacion sobre latencia o velocidad de carga.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en GPU; el modelo esta disenado para ejecutarse en CPU. En GPU, la tabla int8 ocupa aproximadamente 0,5 GB.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede alojar la tabla si se desea acelerar, pero no es necesario.
- Cabe en cualquier consumer GPU y en CPU con unos pocos cientos de MB de RAM para la tabla int8.
- Opciones de despliegue: la libreria `fse>=2.0` (`pip install "fse>=2.0"`), con `fse.Encoder.from_pretrained(...)` y `encoder.encode([...])`. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no se hace ninguna afirmacion de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fse/paragram-300-sl999-sif10-int8 | 528.551.792 | no aplica | Embeddings estaticos int8 con SIF | unknown | HuggingFace |
| fse/paragram-300-sl999 (base) | no disponible | no aplica | Embeddings estaticos float32 | unknown | HuggingFace |
| Sentence-transformers tipo all-MiniLM | no disponible en la informacion proporcionada | no disponible | Transformer encoder | no disponible | no disponible |

La model card no incluye comparaciones con otros modelos de embeddings. Cualquier comparacion con alternativas transformer (por ejemplo, familia Sentence-BERT o E5) requeriria datos que no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- Licencia desconocida: `license: unknown` no otorga permiso de uso. El uso comercial queda bloqueado hasta que los titulares aclaren los terminos.
- El modelo solo soporta ingles; no hay capacidades multilingues.
- Al ser una media ponderada de vectores de palabra, no modela orden de palabras ni dependencias sintacticas de largo alcance; el rendimiento en tareas que requieren composicion semantica compleja es limitado.
- Los vectores calculados son los de la tabla cuantizada, no los del modelo original antes de la cuantizacion; la cercania esta medida (Recall@10 de 0,996483) pero no garantizada para todos los usos.
- Las metricas de seleccion del corpus (STS-B y NanoBEIR) guiaron la eleccion del corpus de entrenamiento, por lo que no son estimaciones holdout limpias y pueden estar sobreajustadas.
- Riesgo de sesgo heredado de los vectores Paragram originales y de las frecuencias de `wordfreq`; no se documenta ninguna mitigacion.
- No hay garantia de comportamiento en produccion ni datos de latencia o throughput.
- El modelo depende de la libreria `fse>=2.0`; no es compatible con frameworks estandar como transformers, vLLM o llama.cpp.
- La tabla de frecuencias de `wordfreq` incorpora material CC BY-SA 4.0 y creditos especificos por fuente; esos terminos no quedan anulados por el campo de licencia del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/paragram-300-sl999-sif10-int8
- Modelo base: https://huggingface.co/fse/paragram-300-sl999
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Paper de Paragram: https://aclanthology.org/Q15-1025/
- wordfreq: https://github.com/rspeer/wordfreq
- Aviso legal de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
- Dataset de preparacion: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
