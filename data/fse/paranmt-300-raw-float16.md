# fse/paranmt-300-raw-float16

## Resumen

`fse/paranmt-300-raw-float16` es un modelo de embeddings estaticos de palabras y frases en ingles, publicado por el usuario `fse` como conversion del modelo gensim `fse/paranmt-300`. No es un transformer generativo: se trata de una tabla de 77.224 filas por 300 dimensiones (float16) que se usa para producir representaciones vectoriales de texto mediante la media de las filas de sus tokens, normalizada a longitud unitaria. El modelo deriva de los vectores ParaNMT-300, entrenados originalmente por Wieting y Kiela sobre el corpus de parafrasis ParaNMT-50M.

La relevancia de esta publicacion es doble. Por un lado, ofrece una version cuantizada a float16 de un espacio de embeddings clasico, con metricas medidas sobre el conjunto de test de STS-B (Pearson x100 de 79,81645), lo que permite reproducir resultados antiguos con un consumo de almacenamiento reducido (unos 47,5 MB de fichero). Por otro, es un ejemplo de la libreria `fse` (Fast Sentence Embeddings), que estandariza el almacenamiento, la tokenizacion y el calculo de embeddings estaticos sin depender de frameworks de inferencia neuronal.

El modelo no genera texto, no razona y no soporta tool calling. Su unico proposito es la extraccion de caracteristicas (`feature-extraction`) y la similitud semantica en ingles. El tamano reportado en safetensors (23.815.132 parametros) corresponde a la tabla empaquetada, no a un modelo neuronal con capas de atencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (tabla de palabras); no es un transformer |
| Parametros totales | 23.815.132 (segun safetensors); tabla de 77.224 filas x 300 dimensiones en float16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el pooling es la media de los tokens del texto) |
| Tipos de cuantizacion | float16 en esta version; el autor menciona float32, float16 e int8 como opciones del pipeline `fse` |
| Idiomas soportados | en (ingles) |
| Licencia | unknown (el autor declara que la licencia del modelo fuente aplica; no se concede permiso explicito) |
| Formato de pesos | safetensors (tabla empaquetada con `quantize_rows@1`) |
| Libreria requerida | fse >= 2.0 |
| Tokenizador | `fse_words@1` |
| Dimension del vector | 300 |
| Tamano del vocabulario | 77.224 filas |
| Tamano del fichero | 47.523.995 bytes (~47,5 MB) |
| Fingerprint de la tabla | `xxh3-128:26b7176aacbdf42b64c8e90791847319` |
| Modelo base | fse/paranmt-300 (gensim, revision `a08e15771891207a22f840a3091a00a1657d888b`) |

## Arquitectura y entrenamiento

No hay una arquitectura neuronal en esta publicacion. El artefacto es una tabla de embeddings estaticos: cada token del vocabulario tiene un vector de 300 dimensiones, y la representacion de una frase se obtiene promediando los vectores de sus tokens y normalizando el resultado a norma unitaria. La tabla se ha almacenado mediante el paso `normalize@1` por fila y el operador `quantize_rows@1` a partir de la tabla float32 original identificada por `xxh3-128:d0457b3eb8b4213d26d2056fa52cf0cf`. La tokenizacion se realiza con `fse_words@1` sobre texto crudo.

Los vectores originales provienen de ParaNMT-300, descrito en el paper de Wieting y Kiela (ACL 2018) sobre generacion de parafrasis con 50 millones de pares. El autor indica que el corpus de entrenamiento subyacente es CzEng 1.6, disponible solo para investigacion no comercial. Esta version no ha sido reentrenada: es una conversion de formato y cuantizacion, y el autor advierte explicitamente que las metricas miden la cercania al modelo pre-cuantizacion, no la prometen.

La model card documenta dos metodos de inferencia sobre la misma tabla: media simple (`raw`) y ponderacion SIF-10 con eliminacion del componente principal. Sobre los 1.379 pares de test de STS-B, la version raw float32 obtiene 79,81644 de Pearson x100 y SIF-10 float32 obtiene 78,11215. La version float16 de este repositorio alcanza 79,81645, con una diferencia de +0,00001 puntos respecto a float32 del mismo metodo y un Recall@10 de 0,999891 frente a float32.

## Capacidades

- Extraccion de caracteristicas: genera un vector de 300 dimensiones por texto de entrada mediante media de embeddings de tokens y normalizacion L2.
- Similitud semantica en ingles: adecuado para comparar frases mediante coseno, busqueda semantica y deduplicacion.
- Clasificacion de texto por similitud: util como baseline ligero en tareas de matching y clustering.
- Procesamiento por lotes: la API `encoder.encode([...])` acepta listas de textos.
- Sin generacion de texto, sin razonamiento, sin codigo, sin matematicas.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Multilingue: no; solo ingles.
- Sin modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica ligera en ingles: indexar documentos como vectores de 300 dimensiones y recuperar por similitud coseno. El coste de almacenamiento es de aproximadamente 600 bytes por frase en float16, lo que permite indices de millones de entradas en memoria.
- Deduplicacion de textos: comparar pares de frases o titulares con un umbral de coseno para eliminar duplicados en pipelines de datos. La naturaleza estatica del modelo hace el proceso determinista y reproducible bit a bit en el backend CPU del autor.
- Baseline en evaluacion de NLP: usar el resultado de STS-B (79,81645 Pearson x100) como referencia para comparar sistemas de embeddings mas complejos en tareas de similitud semantica.
- Clasificacion de texto por prototipos: calcular el centroide de cada clase a partir de ejemplos etiquetados y asignar nuevas frases a la clase mas cercana, sin entrenamiento adicional.
- Filtrado previo en pipelines de recuperacion: usar estos embeddings como primera etapa de bajo coste antes de un reranker neuronal, reduciendo el numero de candidatos que llegan al modelo pesado.
- Reproduccion de experimentos historicos: replicar resultados de trabajos que usaron ParaNMT-300 como representacion de frases, con la ventaja de un fichero de 47,5 MB y la API `fse`.
- Sistemas con restricciones de memoria o sin GPU: el modelo se ejecuta en CPU y no requiere aceleradores, lo que lo hace apto para entornos embebidos o contenedores pequenos.

## Benchmarks y rendimiento

| Metrica | Valor medido |
|---|---|
| STS-B Pearson x100 (raw float32) | 79,81644 |
| STS-B Pearson x100 (SIF-10 float32) | 78,11215 |
| STS-B Pearson x100 (este modelo, float16, raw) | 79,81645 |
| Diferencia vs. mismo metodo float32 (puntos) | +0,00001 |
| Recall@10 vs. mismo metodo float32 | 0,999891 |
| STS-B Pearson x100 con tokenizador por defecto | 79,81645 |

El autor no publica comparaciones con otros modelos en la informacion disponible. La comparacion controlada de STS-B usa el preprocesado NLTK del notebook 1.x mediante una vista con tokenizador externo sobre la misma tabla; la fila de tokenizador por defecto usa `fse_words@1` sobre texto crudo. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra el resto, excluyendo la propia fila y resolviendo empates por indice de fila. No se hacen afirmaciones sobre latencia o velocidad de carga.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo se ejecuta en CPU; el autor indica que el backend CPU calcula los vectores bit a bit como su referencia.
- Memoria RAM: el fichero ocupa unos 47,5 MB; la tabla en memoria en float32 durante el calculo es de aproximadamente 92,7 MB (77.224 x 300 x 4 bytes), mas el vocabulario del tokenizador.
- GPU recomendadas: no aplica; cualquier GPU es innecesaria para este modelo.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: la libreria `fse` (>= 2.0) es la via oficial. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor declara explicitamente que no hace afirmaciones de velocidad ni de tiempo de carga.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fse/paranmt-300-raw-float16 | Embeddings estaticos (media de tokens) | 300 | 77.224 | no aplica | unknown | Hugging Face, libreria fse |
| fse/paranmt-300 (fuente) | Embeddings estaticos gensim | 300 | 77.224 | no aplica | unknown | Hugging Face, gensim |
| GloVe (variantes 300d) | Embeddings estaticos de palabras | 300 | variable | no aplica | variable por version | Ampliamente disponible |
| fastText (espanol/ingles) | Embeddings de subpalabras | 300 | variable | no aplica | MIT (codigo) / CC-BY-SA (vectores) | Disponible |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa. La diferencia principal frente a GloVe y fastText es el pipeline integrado de tokenizacion y pooling de `fse`, y frente a los embeddings de frases neuronales (Sentence-BERT y similares), el coste computacional muy inferior a cambio de una calidad menor en tareas semanticas complejas.

## Limitaciones y advertencias

- Licencia `unknown`: el autor advierte que no se concede permiso de uso y que la licencia del modelo fuente aplica. El uso comercial no esta autorizado de forma explicita.
- El corpus de entrenamiento subyacente, CzEng 1.6, es de uso libre solo para investigacion no comercial. El autor senala que esto no establece una licencia para los vectores derivados.
- Solo ingles: no hay soporte multilingue.
- Modelo estatico: no captura contexto, polisemia ni orden de palabras mas alla del promedio de sus tokens. La negacion y las frases con estructura sintactica compleja se representan deficientemente.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la similitud coseno puede producir falsos positivos en textos cortos o con vocabulario fuera del vocabulario del tokenizador.
- El vocabulario esta limitado a 77.224 filas; las palabras fuera de vocabulario se gestionan segun el tokenizador `fse_words@1`, cuyo comportamiento ante OOV no se detalla en la model card.
- Dependencia de la libreria `fse >= 2.0`: no es compatible con frameworks estandar como `transformers`, `sentence-transformers` o `spaCy` sin conversion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion externa.
- La model card advierte que las metricas miden la cercania al modelo pre-cuantizacion y que la calidad en datos propios debe evaluarse por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/paranmt-300-raw-float16
- Modelo base: https://huggingface.co/fse/paranmt-300
- Repositorio de la libreria fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Issues para solicitudes de retirada: https://github.com/oborchers/Fast_Sentence_Embeddings/issues
- Paper de ParaNMT: https://aclanthology.org/P18-1042/
- Repositorio ParaNMT-50M: https://github.com/jwieting/para-nmt-50m
- Corpus CzEng 1.6: https://ufal.mff.cuni.cz/czeng/czeng16
