# Sedha/word2vec_vectors_text8_300d_w10_n10_s1e-4_mc10_e15

## Resumen

El modelo `Sedha/word2vec_vectors_text8_300d_w10_n10_s1e-4_mc10_e15` es un conjunto de vectores de embeddings de palabras entrenado con el algoritmo Word2Vec sobre el corpus text8. Lo publica el usuario Sedha en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo generativo ni de un transformer: es una representación vectorial estática de palabras, donde cada término del vocabulario queda mapeado a un vector denso de 300 dimensiones.

El nombre del repositorio codifica los hiperparámetros del entrenamiento: `300d` indica dimensionalidad de 300, `w10` ventana de contexto de 10, `n10` probablemente `negative=10` (muestras negativas), `s1e-4` tasa de aprendizaje de 1e-4, `mc10` `min_count=10` y `e15` 15 épocas. El corpus text8 es un conjunto de aproximadamente 100 millones de caracteres de texto limpio de Wikipedia en inglés, ampliamente utilizado como benchmark de embeddings.

Su relevancia es fundamentalmente didáctica y de referencia: sirve para tareas de similitud semántica, analogías vectoriales y como baseline clásico frente a embeddings contextuales modernos. No resuelve generación de texto ni razonamiento; su utilidad es la representación léxica estática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Word2Vec (embeddings estáticos, no neuronal generativa) |
| Parametros totales | no disponible (depende del tamaño del vocabulario; vectores de 300 dimensiones por palabra) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de palabras, no de secuencias) |
| Tipos de cuantizacion | no disponible (vectores en coma flotante; el formato de texto permite reducción de precisión manual) |
| Idiomas soportados | inglés (derivado del corpus text8) |
| Licencia | Apache 2.0 |
| Formato de pesos | fichero de texto `vectors_gpu_300d.txt` (formato word2vec de texto, cargable con gensim) |

## Arquitectura y entrenamiento

Word2Vec es un modelo de embeddings léxicos basado en una red neuronal superficial de una sola capa oculta (o incluso sin capa oculta en la variante skip-gram con muestreo negativo). El objetivo es aprender representaciones vectoriales densas que capturen relaciones semánticas y sintácticas a partir de coocurrencias en el corpus. Los hiperparámetros declarados en el nombre del repositorio son: dimensionalidad 300, ventana de contexto 10, 10 muestras negativas, tasa de aprendizaje 1e-4, `min_count=10` y 15 épocas de entrenamiento.

El corpus text8 contiene aproximadamente 100 millones de caracteres (unos 17 millones de tokens) de texto de Wikipedia en inglés, preprocesado (minúsculas, eliminación de puntuación y etiquetas). No se documenta en la model card si se usó la variante CBOW o skip-gram, ni si hubo submuestreo de palabras frecuentes. No hay información sobre RLHF, DPO ni ajuste fino posterior: es un entrenamiento puramente no supervisado.

## Capacidades

- Representación vectorial estática de palabras en inglés (300 dimensiones por término).
- Cálculo de similitud coseno entre palabras (`wv.similarity`).
- Búsqueda de palabras similares (`wv.most_similar`).
- Resolución de analogías vectoriales del tipo `king - man + woman = ?`.
- Detección de la palabra que no encaja en un grupo (`wv.doesnt_match`).
- Consulta directa del vector de una palabra (`wv["computer"]`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible (entrenado sobre corpus en inglés).

## Casos de uso

- Similitud semántica léxica: comparar pares de palabras para tareas de expansión de consultas o deduplicación de términos, usando la similitud coseno entre vectores de 300 dimensiones.
- Analogías vectoriales en investigación educativa: demostrar propiedades aritméticas del espacio de embeddings (`king - man + woman`) en cursos y tutoriales de procesamiento de lenguaje natural.
- Baseline en experimentos de NLP: servir como referencia clásica frente a embeddings contextuales (BERT, GPT) en tareas de clasificación de texto o clustering de documentos.
- Clustering y agrupamiento de vocabulario: agrupar términos por proximidad vectorial para construir taxonomías o análisis de temas en corpus en inglés.
- Búsqueda por similitud de términos: implementar un buscador léxico que recupere palabras relacionadas a partir de una consulta, útil en sistemas de recomendación de contenido textual.
- Feature engineering para modelos clásicos: usar los vectores como características de entrada en clasificadores tradicionales (SVM, regresión logística) sobre texto en inglés.
- Análisis exploratorio de vocabulario: identificar términos raros o ausentes (por `min_count=10`) y estudiar la cobertura léxica del corpus text8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; los vectores se cargan en memoria RAM. Con un vocabulario típico de text8 (decenas de miles de palabras) y 300 dimensiones en float32, el consumo es de decenas a pocos cientos de MB de RAM.
- GPU recomendadas: no es necesario GPU para inferencia; el nombre del fichero (`vectors_gpu_...`) sugiere que el entrenamiento pudo usar GPU, pero la consulta de vectores es CPU-only.
- Cabe en cualquier equipo consumer: portátil básico, Raspberry Pi o contenedor con poca memoria.
- Opciones de despliegue: gensim (`KeyedVectors.load_word2vec_format`), numpy para manipulación directa, o cualquier librería que lea el formato word2vec de texto.
- Latencia y throughput: consultas de similitud en microsegundos a milisegundos en CPU; no se dispone de cifras oficiales.

## Comparativa con modelos similares

| Modelo | Dimensiones | Corpus | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sedha/word2vec_vectors_text8_300d_w10_n10_s1e-4_mc10_e15 | 300 | text8 (~100M caracteres) | no aplica | Apache 2.0 | Hugging Face |
| GoogleNews-vectors-negative300 | 300 | Google News (~100B palabras) | no aplica | Propietaria (uso limitado) | Descarga directa |
| GloVe 6B.300d | 300 | Wikipedia + Gigaword (6B tokens) | no aplica | Pública (dominio público) | Stanford NLP |
| fastText wiki-news-300d | 300 | Wikipedia + noticias | no aplica | MIT | fastText |

La comparativa se limita a embeddings estáticos de 300 dimensiones. Frente a GoogleNews o GloVe, este modelo usa un corpus mucho menor (text8), por lo que su cobertura léxica y calidad semántica serán inferiores; su ventaja es la licencia Apache 2.0 permisiva y la reproducibilidad de los hiperparámetros declarados.

## Limitaciones y advertencias

- Corpus limitado: text8 (~100M caracteres) es mucho menor que los corpus de GloVe o GoogleNews, lo que reduce la calidad y cobertura de los vectores.
- Vocabulario restringido: `min_count=10` excluye palabras raras; es necesario comprobar `if word in wv` antes de consultar.
- Solo inglés: no hay soporte multilingüe documentado.
- Sin contexto: cada palabra tiene un único vector, por lo que no distingue acepciones (polisemia) ni dependencias sintácticas.
- Sesgos: al derivar de Wikipedia en inglés, puede reflejar sesgos de género, culturales y geográficos presentes en el corpus.
- No es un modelo generativo: no puede producir texto, responder preguntas ni razonar.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia del corpus text8 y las condiciones de los datos originales de Wikipedia.
- La model card no especifica la variante (CBOW vs skip-gram) ni detalles de preprocesado, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Hugging Face: https://huggingface.co/Sedha/word2vec_vectors_text8_300d_w10_n10_s1e-4_mc10_e15
- Corpus text8: http://mattmahoney.net/dc/text8.zip
- Documentación de gensim KeyedVectors: https://radimrehurek.com/gensim/models/keyedvectors.html
- Paper original de Word2Vec (Mikolov et al., 2013): https://arxiv.org/abs/1301.3781
- Paper de muestreo negativo (Mikolov et al., 2013): https://arxiv.org/abs/1310.4546
