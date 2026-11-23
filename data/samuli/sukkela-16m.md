# samuli/sukkela-16M

## Resumen

sukkela-16M es un modelo de embeddings estáticos para finlandés desarrollado por el usuario samuli, publicado en Hugging Face bajo licencia MIT. Forma parte de la familia Sukkela ("sukkela" es finlandés coloquial para rápido y ágil), que incluye variantes de 8M, 16M y 33M de parámetros. El modelo emplea el formato model2vec: una única tabla de tokens de 64k × 256 dimensiones con mean pooling, sin capas de transformer. Esto significa que codificar texto se reduce a una búsqueda en tabla y un promedio, lo que permite inferencia en CPU, en un teléfono o incluso en un navegador, sin necesidad de GPU.

El modelo está diseñado específicamente para búsqueda en finlandés, aunque también es utilizable en inglés y para emparejamiento cruzado inglés-finlandés. Con 16.384.000 parámetros reales y un tamaño de repositorio de 0,1 GB, es extremadamente ligero: 66 MB en float32 y 16 MB en int8. No tiene límite de longitud de contexto, ya que al no haber mecanismo de atención, los documentos largos se codifican enteros.

Su relevancia radica en que ofrece recuperación densa de alta calidad para finlandés con un coste computacional mínimo. En la mayoría de los conjuntos de evaluación supera a modelos estáticos multilingües mucho más grandes como blink-multilingual-64M y potion-multilingual-128M, y se acerca a transformadores de 568M como bge-m3 en algunas tareas, todo ello sin GPU y con una huella de memoria de dos órdenes de magnitud inferior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (model2vec): tabla de tokens con mean pooling, sin capas de transformer |
| Parámetros totales | 16.384.000 (tabla de 64k tokens × 256 dimensiones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Sin límite (no hay mecanismo de atención; los documentos se codifican enteros) |
| Tipos de cuantización | float32 (66 MB), int8 (16 MB) |
| Idiomas soportados | Finés (fi), inglés (en); emparejamiento cruzado en→fi y fi→en |
| Licencia | MIT |
| Formato de pesos | safetensors (formato model2vec) |
| Dimensión de embedding | 256 |
| Vocabulario | 64k tokens |
| Librerías compatibles | model2vec, sentence-transformers |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

sukkela-16M no es un transformer. Es un modelo de embeddings estáticos en formato model2vec, que consiste en una única tabla de embeddings de tokens de 64.000 entradas por 256 dimensiones, más un pooling de media para agregar los vectores de los tokens de un texto en un único vector de frase o documento. No hay capas de atención, ni capas feed-forward, ni mecanismo de contexto: la codificación es una búsqueda en tabla seguida de un promedio. Esto elimina por completo el coste cuadrático de la atención y permite que la inferencia sea prácticamente instantánea incluso en hardware muy limitado.

La información disponible no detalla el proceso de entrenamiento: no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de destilación desde un transformer teacher (procedimiento habitual en model2vec) o ajuste con objetivos de recuperación. Tampoco se documenta si hubo RLHF, DPO o ajuste supervisado. Lo que sí se indica es que el modelo está optimizado para búsqueda en finlandés, que no requiere prefijos ni instrucciones (consultas y documentos se codifican de la misma forma) y que la variante int8 mantiene la precisión de búsqueda con una diferencia máxima de 0,004 nDCG@10 respecto a float32.

## Capacidades

- Generación de embeddings de frases y documentos para búsqueda densa (dense retrieval) y similitud semántica.
- Recuperación de pasajes en finlandés con calidad alta: nDCG@10 de 0,869 en Belebele fi.
- Emparejamiento cruzado inglés-finlandés: 0,781 en Belebele en→fi y 0,791 en Belebele fi→en.
- Codificación de documentos de longitud arbitraria sin truncamiento, al carecer de ventana de contexto.
- Extracción de características (feature-extraction) y similitud entre frases (sentence-similarity).
- Inferencia en CPU, dispositivos móviles y navegador, sin GPU.
- Compatibilidad con las APIs de model2vec y sentence-transformers.
- Cuantización int8 con pérdida de precisión mínima (16 MB de peso).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica en finlandés en producción: el modelo puede indexar corpus finlandeses completos y servir consultas en CPU con latencia mínima, lo que lo hace adecuado para motores de búsqueda internos, intranets y catálogos documentales donde no hay GPU disponible.
- Búsqueda bilingüe inglés-finlandés: con nDCG@10 de 0,781 en en→fi y 0,791 en fi→en, permite que usuarios que formulan consultas en inglés recuperen documentos en finlandés y viceversa, útil en organizaciones bilingües y servicios públicos finlandeses.
- Deduplicación y agrupación de documentos: al codificar documentos enteros sin límite de longitud, se pueden calcular similitudes entre artículos, actas o registros para detectar duplicados y agrupar contenido temáticamente.
- Clasificación y etiquetado de textos por similitud: los embeddings sirven como características para clasificadores ligeros o para asignar etiquetas comparando con vectores prototipo, con un coste de inferencia despreciable.
- Búsqueda en el navegador o en aplicaciones móviles: con 16 MB en int8 y sin necesidad de GPU, el modelo puede empaquetarse en una aplicación web o móvil para búsqueda local offline sobre contenido finlandés.
- Filtrado previo en pipelines RAG: como primera etapa de recuperación de bajo coste antes de un reranker transformer más pesado, reduce el número de candidatos y el coste total del pipeline.
- Enriquecimiento de metadatos en bibliotecas y archivos: la evaluación sobre finna-keywords y finna-titles sugiere uso en búsqueda sobre catálogos bibliográficos y metadatos de archivo finlandeses.

## Benchmarks y rendimiento

Resultados declarados por el autor (nDCG@10, búsqueda densa, documentos completos, vecinos más cercanos exactos; mayor es mejor). Los conjuntos terminados en -int son internos del autor y no públicos.

| Modelo | Belebele | sukkela-questions-int | sukkela-questions-int (keywords) | WebFAQ | MIRACL* | FSLDR* | finna-keywords-int | finna-titles-int | Belebele en→fi | Belebele fi→en |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **sukkela-16M** | **0,869** | **0,808** | **0,736** | **0,623** | **0,494** | **0,389** | **0,274** | **0,654** | **0,781** | **0,791** |
| sukkela-33M | 0,884 | 0,827 | 0,749 | 0,632 | 0,503 | 0,412 | 0,283 | 0,672 | 0,798 | 0,810 |
| sukkela-8M | 0,853 | 0,798 | 0,733 | 0,614 | 0,474 | 0,393 | 0,255 | 0,648 | 0,759 | 0,749 |
| blink-multilingual-64M | 0,758 | 0,661 | 0,541 | 0,460 | 0,426 | 0,298 | 0,135 | 0,535 | 0,717 | 0,634 |
| potion-multilingual-128M | 0,594 | 0,523 | 0,374 | 0,358 | 0,231 | 0,253 | 0,101 | 0,380 | 0,533 | 0,464 |
| bge-m3 (transformer, 568M) | 0,932 | 0,905 | 0,863 | 0,798 | 0,774 | 0,452 | 0,259 | 0,749 | 0,915 | 0,905 |

Resultados públicos declarados en la model-index: Belebele fi 0,869; Belebele en→fi 0,781; Belebele fi→en 0,791; WebFAQ fi 0,623; MIRACL fi (corpus reducido) 0,494; FSLDR fi (consultas dev, 10k distractores) 0,389; sukkela-questions natural 0,775; sukkela-questions keywords 0,665; finna-keywords 0,196.

El autor reporta además diferencias pareadas frente a las líneas base con intervalo bootstrap del 95 % (2000 remuestreos), señalando en negrita los intervalos que excluyen el cero y con punto los que quedan dentro del ruido; la información disponible no incluye la tabla completa de esos intervalos.

## Requisitos de hardware

- VRAM: no requiere GPU. En float32 ocupa 66 MB; en int8, 16 MB.
- GPU recomendadas: innecesarias; cualquier CPU moderna es suficiente. Si se dispone de GPU, el modelo se ejecuta igualmente sin aprovechar paralelismo relevante.
- GPU de consumo: cabe en cualquier dispositivo, incluidos teléfonos y navegadores; no hay requisito de VRAM.
- Opciones de despliegue: model2vec (`StaticModel.from_pretrained`), sentence-transformers (`SentenceTransformer`), y cualquier entorno Python con CPU. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: la codificación es una búsqueda en tabla y un promedio, por lo que la latencia es muy baja y el throughput alto en CPU; la información disponible no proporciona cifras concretas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Belebele fi (nDCG@10) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| sukkela-16M | 16M | Estático (model2vec) | Sin límite | 0,869 | MIT | Hugging Face |
| sukkela-33M | 33M | Estático (model2vec) | Sin límite | 0,884 | MIT | Hugging Face |
| sukkela-8M | 8M | Estático (model2vec) | Sin límite | 0,853 | MIT | Hugging Face |
| blink-multilingual-64M | 64M | Estático | Sin límite | 0,758 | No disponible en la información | Hugging Face |
| potion-multilingual-128M | 128M | Estático | Sin límite | 0,594 | No disponible en la información | Hugging Face |
| bge-m3 | 568M | Transformer | 8.192 tokens | 0,932 | No disponible en la información | Hugging Face |

Dentro de la propia familia Sukkela, las diferencias entre tamaños son pequeñas pero consistentes: sukkela-33M supera ligeramente a sukkela-16M en todos los conjuntos, y sukkela-16M supera a sukkela-8M en la mayoría. Frente a los estáticos multilingües, sukkela-16M obtiene ventajas amplias en finlandés (0,869 frente a 0,758 de blink-multilingual-64M y 0,594 de potion-multilingual-128M) con una fracción de los parámetros. Frente a bge-m3, un transformer de 568M, queda por detrás en todos los conjuntos, pero la brecha es menor en FSLDR (0,389 frente a 0,452) y en finna-keywords (0,274 frente a 0,259, donde sukkela-16M supera a bge-m3).

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, no razona, no ejecuta código ni soporta tool calling o agentes.
- Cobertura lingüística limitada a finlandés e inglés; no se documenta rendimiento en otras lenguas.
- El rendimiento en finna-keywords es bajo (0,196 en el conjunto público, 0,274 en el interno), lo que sugiere dificultades con vocabulario de palabras clave o metadatos muy cortos.
- En MIRACL fi con corpus reducido obtiene 0,494 y en FSLDR 0,389, por debajo de transformadores grandes como bge-m3; para recuperación de alta exigencia puede requerir un reranker posterior.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (verified: false en la model-index).
- Algunos conjuntos de evaluación son internos del autor y no públicos, lo que limita la reproducibilidad de parte de las cifras.
- Riesgo de alucinación no aplica en el sentido generativo, pero la similitud semántica puede producir recuperaciones irrelevantes en dominios muy especializados o con vocabulario fuera de distribución.
- La licencia MIT permite uso comercial sin restricciones documentadas, pero conviene verificar las condiciones de los datos de entrenamiento, no detalladas en la información disponible.
- No se documenta el proceso de entrenamiento ni la composición del dataset, lo que dificulta evaluar sesgos y procedencia de los datos.
- Para documentos largos se recomienda dividirlos en ventanas solapadas, según las indicaciones del autor, aunque el modelo no tenga límite de longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samuli/sukkela-16M
- Modelo hermano sukkela-33M: https://huggingface.co/samuli/sukkela-33M
- Modelo hermano sukkela-8M: https://huggingface.co/samuli/sukkela-8M
- Repositorio model2vec: https://github.com/MinishLab/model2vec
- Documentación de Sentence Transformers: https://www.sbert.net
- Conjunto de evaluación Belebele: https://huggingface.co/datasets/facebook/belebele
- Conjunto de evaluación WebFAQ: https://huggingface.co/datasets/PaDaS-Lab/webfaq-retrieval
- Conjunto de evaluación MIRACL: https://huggingface.co/datasets/miracl/miracl
- Conjunto de evaluación FSLDR: https://huggingface.co/datasets/TurkuNLP/FSLDR
- Conjunto sukkela-questions: https://huggingface.co/datasets/samuli/sukkela-questions
- Conjunto finna-keywords: https://huggingface.co/datasets/samuli/finna-keywords
