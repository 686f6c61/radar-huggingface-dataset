# MajidFQ/taxoSplitter-biz-router-e5-v2

## Resumen

taxoSplitter-biz-router-e5-v2 es un modelo de embeddings de frases (sentence-transformers) publicado por el usuario MajidFQ en Hugging Face. Se trata de un fine-tune de intfloat/e5-base-v2, un encoder transformer de 109.482.240 parámetros (~109,5 M), entrenado con la librería SentenceTransformers y la función de pérdida CosineSimilarityLoss sobre 48.425 pares de frases. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors.

Su función es actuar como router semántico dentro de una taxonomía de actividades empresariales: recibe una consulta corta con el prefijo `query:` (por ejemplo, "query: pallet supplier" o "query: tool wholesaler") y la compara contra descripciones largas de categorías prefijadas con `passage:`, que incluyen definición, conceptos clave, palabras clave representativas y desambiguación de límites. El modelo devuelve el embedding de cada texto para que un índice vectorial determine la categoría más próxima.

Es relevante porque cubre una tarea muy concreta (enrutado y clasificación de negocios por similitud semántica) con un coste de inferencia muy bajo, ejecutable incluso en CPU. Como contrapartida, la ficha no declara licencia ni idiomas, no publica benchmarks, no documenta el dataset de evaluación y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (etiqueta `bert` en el repositorio), heredada del modelo base intfloat/e5-base-v2 |
| Parámetros totales | 109.482.240 (~109,5 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base intfloat/e5-base-v2 trabaja con 512 tokens |
| Tipos de cuantización | No disponible. Los pesos se publican en safetensors (FP32); el encoder admite cuantización FP16/INT8 con herramientas genéricas, pero el autor no la documenta |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Dimensión de embedding | No disponible en la ficha (el modelo base e5-base-v2 produce vectores de 768 dimensiones) |
| Función de pérdida | CosineSimilarityLoss |
| Tamaño del dataset de entrenamiento | 48.425 pares |
| Pipeline declarado | sentence-similarity, feature-extraction |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |
| Tamaño del repositorio | 0,4 GB |
| Fecha de creación / actualización | 2026-09-19 (según los metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de tipo BERT, heredado de intfloat/e5-base-v2, con el que comparte el recuento de parámetros (109.482.240). Se ha afinado con la librería SentenceTransformers, como indica la etiqueta `generated_from_trainer`, y la pérdida declarada es CosineSimilarityLoss sobre pares de frases. La convención de prefijos `query:` y `passage:` que aparece en los ejemplos del widget es la que emplea la familia e5 para separar consultas de documentos indexados, de modo que el uso correcto del modelo exige respetar esa asimetría en las entradas.

El conjunto de entrenamiento consta de 48.425 pares, un volumen moderado para una tarea de similitud. Los `passage:` que aparecen en los ejemplos no son etiquetas cortas, sino descripciones estructuradas de categorías empresariales con tres campos (definición, conceptos clave y palabras clave, y desambiguación de límites frente a categorías vecinas). El autor no documenta la composición exacta del corpus, si hubo minería de negativos duros, ni si se aplicó algún tipo de validación cruzada; tampoco se especifica si el entrenamiento partió de los pesos completos de e5-base-v2 o de una revisión previa del propio autor (existe una variante `-v2`, lo que sugiere al menos una iteración anterior).

## Capacidades

- Generación de embeddings densos de frases para similitud semántica y recuperación de textos.
- Clasificación y enrutado de consultas hacia categorías de una taxonomía empresarial mediante búsqueda por similitud coseno.
- Extracción de características (`feature-extraction`) para uso como encoder en pipelines propios.
- Manejo de descripciones de categoría largas y estructuradas, incluidas reglas de desambiguación de límites entre categorías próximas.
- Comportamiento asimétrico consulta-documento gracias a los prefijos `query:` y `passage:` heredados de e5.
- Integración directa con SentenceTransformers, con Text Embeddings Inference (TEI) y con endpoints compatibles con la API de Hugging Face.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni comportamiento agente: es exclusivamente un modelo de representación vectorial.
- No se documentan capacidades multilingües ni se declaran idiomas soportados en la ficha.

## Casos de uso

- Enrutado de formularios y altas de negocio: al registrar una empresa, el texto libre que describe su actividad se convierte en embedding y se compara contra las descripciones de la taxonomía para asignar la categoría correcta sin intervención humana.
- Clasificación de leads y CRM: los campos de descripción de clientes potenciales se enrutan a la vertical de negocio adecuada (construcción, comercio minorista, sanidad, educación) para asignarlos al equipo comercial correspondiente.
- Normalización y deduplicación de categorías: al fusionar taxonomías de distintas fuentes, el modelo detecta categorías semánticamente equivalentes calculando la similitud entre sus descripciones completas.
- Búsqueda semántica en catálogos de empresas y proveedores: indexar las descripciones del catálogo como `passage:` permite recuperar proveedores por intención ("pallet supplier") aunque la consulta no coincida literalmente con las palabras clave registradas.
- Filtro previo en sistemas RAG: usar el modelo como recuperador barato de primer nivel para restringir el conjunto de documentos o fichas de negocio antes de pasar el contexto a un modelo generativo.
- Anotación asistida de datos: generar propuestas de etiqueta de taxonomía sobre grandes volúmenes de textos (reseñas, fichas de empresa, tickets) y reservar la revisión humana para los casos de baja confianza.
- Auditoría de cobertura taxonómica: detectar consultas que quedan lejos de todas las categorías existentes, señalando huecos en la taxonomía que conviene crear.
- Enrutado multietapa (taxoSplitter): usar el modelo en cada nivel de una jerarquía de categorías, eligiendo primero el sector general y después la subcategoría, con el texto de la categoría padre incorporado al contexto del `passage:`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo no incluye métricas de recuperación (Recall@k, nDCG), matrices de confusión, comparaciones con el modelo base ni resultados sobre conjuntos como MTEB, MMLU o similares. Tampoco hay evaluaciones de la comunidad ni descargas registradas que permitan inferir un uso validado.

## Requisitos de hardware

- VRAM estimada en FP32: ~438 MB solo para los pesos (109.482.240 parámetros × 4 bytes).
- VRAM estimada en FP16/BF16: ~219 MB; en INT8 dinámico: ~110 MB. A estas cifras hay que sumar el coste de las activaciones y de los tensores de entrada, que crece con el tamaño de lote y con la longitud de secuencia.
- Inferencia en CPU perfectamente viable para lotes pequeños, dado el tamaño del modelo y su naturaleza de encoder.
- GPU: cabe en cualquier GPU de consumo con 2 GB o más de VRAM (GTX 1650, RTX 3060, RTX 4090); en entornos de servidor funciona en T4, L4, A10, A100 y H100, donde el límite será el ancho de banda de memoria y no la capacidad.
- Sin cuantización, un lote de varias decenas de textos de 512 tokens puede requerir más memoria de la estimada para los pesos; conviene ajustar `batch_size` al hardware disponible.
- Opciones de despliegue: SentenceTransformers, Hugging Face Text Embeddings Inference (etiqueta `text-embeddings-inference`), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportación a ONNX mediante Optimum y librerías de embeddings ligeras compatibles con safetensors.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y el repositorio no registra descargas en el momento de la consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MajidFQ/taxoSplitter-biz-router-e5-v2 | 109,5 M | No disponible (768 en el base) | No disponible (512 en el base) | No disponible | Hugging Face, 0 descargas |
| intfloat/e5-base-v2 (modelo base) | 109 M | 768 | 512 tokens | MIT, según su model card | Hugging Face, ampliamente utilizado |
| BAAI/bge-base-en-v1.5 | ~109 M | 768 | 512 tokens | MIT, según su model card | Hugging Face, muy extendido en MTEB |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 384 | 256 tokens | Apache-2.0, según su model card | Hugging Face, referencia en inferencia ligera |

Los datos de los modelos comparativos proceden de sus respectivas model cards públicas y no han sido verificados en esta ficha. La ventaja diferencial de taxoSplitter-biz-router-e5-v2 no es el rendimiento general, sino el ajuste específico a una taxonomía de negocios concreta y a la asimetría consulta corta / descripción larga; frente al modelo base, aporta especialización de dominio a cambio de perder generalidad. Frente a all-MiniLM-L6-v2, ofrece más parámetros y vectores de mayor dimensión a costa de un consumo mayor.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial libre. El modelo base intfloat/e5-base-v2 se publica bajo MIT según su propia model card, pero esa licencia no se ha hecho extensiva explícitamente al fine-tune.
- Idiomas no declarados: los ejemplos del widget y las etiquetas de taxonomía están íntegramente en inglés, por lo que el comportamiento en castellano u otros idiomas no está verificado y previsiblemente será peor.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de calidad, ni comparación con el modelo base, lo que impide estimar la ganancia real del ajuste.
- Ausencia de validación comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta; el modelo no ha sido auditado por terceros.
- Riesgo de falsos positivos en el enrutado: un índice de similitud siempre devuelve el vecino más cercano, aunque ninguna categoría sea adecuada. Es imprescindible calibrar un umbral de confianza y definir una clase "desconocido".
- Sensibilidad a los prefijos: omitir `query:` o `passage:`, o intercambiarlos, degrada la calidad de los embeddings, ya que el modelo se ha afinado con la convención de e5.
- Dependencia del formato de las descripciones: el modelo se entrenó con descripciones estructuradas en tres campos más desambiguación de límites. Categorías descritas de forma distinta pueden obtener representaciones peores.
- Posible truncado: la ventana heredada del encoder BERT es de 512 tokens; las descripciones de taxonomía largas (con múltiples palabras clave y reglas de exclusión) pueden superar ese límite y perder información, algo especialmente crítico porque la desambiguación suele aparecer al final del texto.
- Tamaño de dataset moderado (48.425 pares): existe riesgo de sobreajuste a la taxonomía concreta usada en el entrenamiento y de mal comportamiento en taxonomías distintas.
- Clasificación por umbral único no fiable: al ser un modelo de similitud y no un clasificador con softmax, las puntuaciones no están calibradas como probabilidades.
- Confusión de categorías vecinas: los propios ejemplos muestran solapamientos delicados (minorista frente a mayorista, sanidad clínica frente a estética, construcción frente a mantenimiento del hogar) que son precisamente los puntos de fallo esperables en producción.
- Metadatos con fechas inusuales (creación y actualización el 2026-09-19): conviene verificar la procedencia del repositorio antes de integrarlo en un sistema real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MajidFQ/taxoSplitter-biz-router-e5-v2
- Modelo base intfloat/e5-base-v2: https://huggingface.co/intfloat/e5-base-v2
- Paper de referencia citado en las etiquetas (Sentence-BERT, arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Repositorio de SentenceTransformers: https://github.com/UKPLab/sentence-transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

Nota: los resultados de la búsqueda web realizada no contienen ningún enlace relacionado con este modelo ni con la tarea de enrutado de taxonomías de negocio, por lo que no se han incluido.
