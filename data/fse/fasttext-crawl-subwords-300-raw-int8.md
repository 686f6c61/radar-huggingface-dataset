# fse/fasttext-crawl-subwords-300-raw-int8

## Resumen

`fse/fasttext-crawl-subwords-300-raw-int8` es una versión cuantizada a int8 de un modelo de embeddings estáticos de palabras y frases, derivado de los vectores FastText English word vectors publicados por Facebook. Lo distribuye el proyecto fse (Fast Sentence Embeddings) bajo licencia CC BY-SA 3.0 y está pensado para la extracción de características: convierte un texto en un vector de 300 dimensiones calculando la media de las filas de tokens (incluyendo subpalabras FastText) y normalizando el resultado a longitud unitaria.

No es un transformer ni un modelo generativo: es una tabla de búsqueda de 2.000.000 de filas por 300 dimensiones almacenada en int8, con tokenizador `fse_words@1` y n-gramas de caracteres FastText de 4 a 4 caracteres con 2.000.000 de buckets. Su relevancia actual es práctica: ofrece embeddings de frases extremadamente ligeros (fichero de 1,2 GB, 1.221.845.063 parámetros almacenados) que pueden ejecutarse en CPU sin GPU, con una pérdida de calidad medida y documentada frente a la versión float32.

El modelo está orientado exclusivamente al inglés y su uso requiere la librería fse 2.0 o superior. Es un componente de infraestructura para pipelines de recuperación, clustering o clasificación ligera, no un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (tabla de búsqueda FastText con subpalabras), media de filas de tokens y normalización |
| Parametros totales | 1.221.845.063 (2.000.000 filas x 300 dimensiones en int8, más metadatos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo con ventana de contexto; procesa el texto completo como bolsa de tokens) |
| Tipos de cuantizacion | int8 (este repositorio); float32 y float16 disponibles en repositorios derivados del mismo modelo base |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY-SA 3.0 (incluye ShareAlike) |
| Formato de pesos | safetensors (librería fse, tabla almacenada con `quantize_rows@1`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de embeddings estáticos sin parámetros contextuales: una tabla de 2.000.000 de filas y 300 dimensiones en int8, derivada de la tabla float32 identificada por el fingerprint `xxh3-128:a7775dd2c0333965666defe0d670ea8e`. La tokenización usa `fse_words@1` y n-gramas de caracteres FastText con `min_n=4`, `max_n=4` y `bucket=2000000`. La representación de una frase se obtiene como la media de las filas de sus tokens, con el paso `normalize@1` aplicado por fila, de modo que el vector resultante tiene longitud unitaria.

No hay entrenamiento propio en este repositorio: es una conversión del modelo gensim `fse/fasttext-crawl-subwords-300` (revisión `552b66a16850576275f894ed738f9e953b45a594`), que a su vez procede de los FastText English word vectors de Facebook entrenados sobre Crawl. Los cambios declarados por el autor son: conversión a safetensors de fse, media y normalización de frase, ponderación SIF y plegado de componentes para la variante `sif10`, y redondeo de almacenamiento a int8. No se documentan datos de RLHF, DPO ni ajuste supervisado, porque el modelo no es generativo. La innovación técnica destacable es la cuantización de filas con `quantize_rows@1` y la verificación de que los vectores calculados en el backend CPU coinciden bit a bit con la referencia de la tabla cuantizada.

## Capacidades

- Extracción de características: genera un vector denso de 300 dimensiones por texto de entrada.
- Embeddings de palabras y de frases: media de filas de tokens con subpalabras FastText, lo que permite representar palabras fuera de vocabulario mediante n-gramas de caracteres.
- Similitud semántica y recuperación: los vectores normalizados son aptos para búsqueda por similitud coseno, clustering y deduplicación.
- Modo sin normalización: se puede cargar con `normalize=False` para obtener la media ponderada en bruto, por ejemplo para plegar una cabeza lineal en la tabla.
- Variantes de ponderación: el sufijo `-raw` indica ausencia de ponderación SIF, no ausencia de normalización; existen variantes `-sif10` con ponderación por frecuencia y eliminación del componente del corpus de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Búsqueda semántica ligera en CPU: indexar un corpus en inglés con vectores de 300 dimensiones y resolver consultas por similitud coseno sin GPU, adecuado cuando el coste de un transformer de embeddings no está justificado.
- Deduplicación y clustering de documentos: agrupar titulares, reseñas o tickets por cercanía de sus vectores medios; el modelo es lo bastante pequeño para procesar grandes volúmenes en paralelo en CPU.
- Clasificación de texto con cabeza lineal: cargar el encoder con `normalize=False` y plegar un clasificador lineal entrenado sobre las medias en bruto dentro de la propia tabla, reduciendo la inferencia a una operación de búsqueda.
- Filtrado previo en pipelines RAG: usar estos embeddings como primera etapa de recuperación barata antes de un reranker o de un modelo de embeddings de mayor calidad, reduciendo el número de candidatos que llegan a la etapa costosa.
- Análisis de similitud en investigación: reproducir experimentos de STS-B con la configuración documentada (Pearson x100 de 48,53995 con el tokenizador por defecto) y comparar contra las variantes float32, float16 y SIF-10.
- Detección de near-duplicates en moderación de contenido: comparar la similitud entre mensajes entrantes y una base de mensajes ya etiquetados, con la ventaja de que el modelo cabe en 1,2 GB y no requiere acelerador.
- Procesamiento por lotes en entornos con memoria limitada: al ser una tabla int8 de 1,2 GB, puede desplegarse en instancias pequeñas o en el mismo proceso que otras tareas sin competir por VRAM.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| STS-B Pearson x100 (tokenizador por defecto, este modelo int8) | 48,53995 |
| Diferencia frente a float32 del mismo método (puntos) | +0,01150 |
| Recall@10 frente a float32 del mismo método | 0,994670 |
| STS-B Pearson x100 (raw float32, referencia) | 48,52845 |
| STS-B Pearson x100 (SIF-10 float32, referencia) | 72,40582 |
| Tamano del fichero del modelo | 1.247.846.930 bytes |

La comparación controlada de STS-B usa el preprocesado NLTK del notebook 1.x mediante una vista de tokenizador externo sobre esta misma tabla; la fila del tokenizador por defecto usa el tokenizador `fse_words@1` guardado sobre texto en bruto. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra todas las demás, excluye la propia fila y resuelve empates por índice de fila. El autor no publica afirmaciones de latencia ni de velocidad de carga.

## Requisitos de hardware

- VRAM: no requiere GPU; el fichero de pesos ocupa aproximadamente 1,2 GB y la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica. Cualquier GPU con suficiente memoria podría alojar la tabla, pero no aporta ventaja frente a CPU para esta carga de trabajo.
- GPU de consumo: irrelevante; el modelo cabe en RAM de cualquier equipo moderno.
- Opciones de despliegue: librería fse 2.0 o superior (`pip install "fse>=2.0"`), con backend CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles; el autor declara explícitamente que no emite afirmaciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `fse/fasttext-crawl-subwords-300-raw-int8` (este) | 1.221.845.063 | 300 | No aplica | CC BY-SA 3.0 | safetensors (fse) | Cuantizado int8, inglés, STS-B 48,53995 |
| `fse/fasttext-crawl-subwords-300-raw` | No disponible en la información proporcionada | 300 | No aplica | CC BY-SA 3.0 | safetensors (fse) | float32, mismo método, STS-B 48,52845 |
| `fse/fasttext-crawl-subwords-300` (gensim) | No disponible en la información proporcionada | 300 | No aplica | CC BY-SA 3.0 | gensim | Modelo fuente sin conversión a fse |
| Variante SIF-10 float32 | No disponible en la información proporcionada | 300 | No aplica | CC BY-SA 3.0 | safetensors (fse) | Ponderación SIF, STS-B 72,40582 |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no soporta otros idiomas.
- No es un modelo generativo: no produce texto, no razona, no ejecuta herramientas y no mantiene conversaciones.
- La representación es una bolsa de tokens: se pierde el orden de las palabras y las relaciones sintácticas, lo que limita tareas que dependan de estructura gramatical.
- Calidad moderada en similitud semántica: el Pearson x100 de 48,53995 en STS-B está muy por debajo de la variante SIF-10 (72,40582) y de los transformers de embeddings modernos.
- La cuantización int8 introduce un cambio medido de +0,01150 puntos en STS-B y un Recall@10 de 0,994670 frente a float32; no es una pérdida nula.
- La licencia CC BY-SA 3.0 incluye ShareAlike: las obras derivadas deben distribuirse bajo la misma licencia, lo que condiciona el uso comercial y la integración en productos propietarios.
- Los vectores de origen son de Facebook y el autor declara que Facebook no respalda esta conversión; la atribución a fastText es obligatoria.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la similitud coseno puede producir falsos positivos en recuperación cuando los textos comparten vocabulario sin compartir significado.
- El modelo requiere la librería fse 2.0 o superior; no es cargable con transformers ni con otras librerías estándar de embeddings.
- No se publican datos de latencia, throughput ni consumo de memoria en tiempo de ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/fasttext-crawl-subwords-300-raw-int8
- Variante float32 del mismo método: https://huggingface.co/fse/fasttext-crawl-subwords-300-raw
- Modelo base gensim: https://huggingface.co/fse/fasttext-crawl-subwords-300
- Repositorio de fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Vectores FastText English: https://fasttext.cc/docs/en/english-vectors.html
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
