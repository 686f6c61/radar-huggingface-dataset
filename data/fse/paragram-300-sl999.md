# fse/paragram-300-sl999

## Resumen

Paragram SL999 (300 dimensiones) es un conjunto de vectores estáticos de palabras para inglés, distribuido por el usuario `fse` en HuggingFace en formato gensim y empaquetado para la librería Fast Sentence Embeddings (fse). No es un modelo generativo ni un transformer: es una matriz de embeddings de 1.703.756 palabras por 300 dimensiones (511.126.800 valores float32, unos 2,0 GB), publicada originalmente por John Wieting (Carnegie Mellon University) y derivada del trabajo de Wieting et al. (2015) sobre modelos de paráfrasis composicionales. La variante «SL999» indica que el espacio vectorial fue ajustado sobre el conjunto de similitud léxica SimLex-999.

Su relevancia actual es la de un componente clásico, barato y reproducible: sirve como base para construir embeddings de frases mediante promediado CBOW, SIF o uSIF sin necesidad de GPU, y como línea base en evaluaciones de similitud semántica (STS) frente a modelos transformer. Para un equipo que necesite inferencia en CPU, huella mínima y comportamiento determinista, sigue siendo una alternativa útil; para cualquier tarea que requiera desambiguación por contexto, razonamiento o generación, no es la herramienta adecuada.

El paquete no incluye model card con resultados numéricos de benchmarks ni licencia declarada, lo que condiciona su adopción en producción. La información de búsqueda web disponible sobre «FSE» corresponde al Fondo Social Europeo y no guarda relación con este modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos de palabras (estilo word2vec/Paragram, ajustados sobre SimLex-999); no es un transformer ni un modelo neuronal profundo |
| Parametros totales | 511.126.800 valores float32 (1.703.756 palabras × 300 dimensiones); no hay parámetros de red en el sentido habitual |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no hay ventana de contexto; el alcance lo fija el pooling de frases que se aplique (CBOW, SIF, uSIF) |
| Tipos de cuantizacion | no disponible; se distribuye únicamente en float32. La model card solo documenta carga con `mmap="r"` |
| Idiomas soportados | inglés (`en`) |
| Licencia | unknown (el autor original no declara licencia y este repositorio tampoco la especifica) |
| Formato de pesos | gensim `KeyedVectors`: `paragram-300-sl999.model` (vocabulario y metadatos) y `paragram-300-sl999.model.vectors.npy` (matriz float32, 2,0 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Paragram, presentada en «From Paraphrase Database to Compositional Paraphrase Model and Back» (Wieting, Bansal, Gimpel, Livescu y Roth, 2015). Se trata de vectores de palabra densos de 300 dimensiones obtenidos con un objetivo tipo word2vec en el que el espacio se restringe con información de paráfrasis y se ajusta después sobre valoraciones de similitud humana del conjunto SimLex-999, de ahí el sufijo «SL999». El resultado es un espacio vectorial orientado a similitud léxica más que a analogías lineales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus, el vocabulario fuente ni si hubo etapas de ajuste adicionales; la model card no los documenta y la página original del autor, según el propio repositorio, no aporta licencia ni detalles de entrenamiento. Tampoco hay innovaciones de decoding ni mecanismos de atención: la«composición» de frases no está aprendida, sino que la aporta la librería fse al aplicar promediado CBOW, SIF (smooth inverse frequency) o uSIF sobre los vectores de palabra, con pesos calculados a partir de las frecuencias del corpus que se pase en `model.train(sentences)`.

## Capacidades

- Representación de palabras en inglés como vectores densos de 300 dimensiones, con vocabulario de 1.703.756 entradas.
- Cálculo de similitud y distancia entre palabras (coseno, euclídea) para tareas de similitud léxica y recuperación.
- Construcción de vectores de frase mediante promediado CBOW, SIF y uSIF a través de la librería fse (`Vectors`, `IndexedList`, `SIF`).
- Carga con mapeo de memoria (`mmap="r"`), lo que permite usar el modelo con una huella de RAM reducida.
- Uso como features congeladas en clasificadores clásicos (regresión logística, SVM) y en técnicas de clustering.
- No soporta generación de texto, razonamiento, matemáticas, código, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio) ni modo «thinking».
- Monolingüe: no cubre castellano ni ningún otro idioma distinto del inglés.

## Casos de uso

- Línea base en evaluación de similitud semántica: generar vectores de frase con SIF/uSIF y compararlos con las anotaciones de un conjunto STS para tener una referencia rápida y determinista antes de evaluar modelos transformer.
- Búsqueda semántica ligera en CPU: indexar títulos o descripciones cortas como vectores de 300 dimensiones y resolver consultas por similitud coseno sin GPU ni servicios externos.
- Deduplicación y near-duplicate detection de frases: agrupar titulares o preguntas frecuentes casi idénticas usando similitud entre vectores SIF, con umbral ajustable y coste de cómputo muy bajo.
- Clasificación de textos con features congelados: alimentar un clasificador lineal con la media ponderada de vectores de palabra para tareas de moderación, etiquetado temático o enrutado de tickets en inglés.
- Filtrado y deduplicación de corpus a gran escala: en pipelines de pre-entrenamiento, usar estos vectores para detectar documentos casi duplicados antes de gastar cómputo en modelos mayores.
- Sistemas con restricciones de recursos: despliegue en contenedores pequeños, dispositivos sin GPU o entornos air-gapped donde no se puede servir un transformer.
- Prototipado y tests de regresión: por su determinismo y su reducido tamaño, sirve como componente estable en tests automáticos de pipelines de NLP que después se migran a modelos neuronales.
- Análisis exploratorio de vocabulario: estudiar vecinos más cercanos, agrupaciones léxicas y sesgos del espacio vectorial en inglés.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card únicamente indica que los vectores están ajustados sobre SimLex-999 y que el repositorio de fse publica un benchmark de STS de todos sus conjuntos de vectores, pero no se incluyen valores en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| SimLex-999 | ajuste declarado; cifra no disponible |
| STS (benchmark de fse) | no disponible en la información proporcionada |
| MMLU / HumanEval / GSM8K | no aplica (no es un modelo generativo) |

## Requisitos de hardware

- VRAM: no requiere GPU; 0 GB de VRAM en cualquier despliegue razonable.
- RAM: aproximadamente 2,0 GB si se carga la matriz float32 completa; con `Vectors.from_pretrained(..., mmap="r")` la huella se reduce al mapear el `.npy` desde disco.
- Disco: repositorio de 2,2 GB (matriz de 2,0 GB más vocabulario y metadatos de gensim).
- GPU recomendadas: no aplica. Cualquier CPU x86-64 o ARM moderna es suficiente; el coste dominado es la búsqueda en el diccionario de vocabulario y las operaciones vectoriales de 300 dimensiones.
- Cabe en cualquier equipo consumer: portátiles, Raspberry Pi y contenedores con 2-4 GB de RAM.
- Opciones de despliegue: gensim (`KeyedVectors.load`) y fse (pooling SIF/uSIF/CBOW). No aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo autorregresivo.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de licencia y rendimiento de las alternativas deben verificarse en sus distribuciones originales; no proceden de la búsqueda realizada para esta ficha.

| Modelo | Tipo | Dimensiones | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| paragram-300-sl999 (este) | Embeddings estáticos ajustados en SimLex-999 | 300 | 1.703.756 | no aplica | unknown | HuggingFace (`fse/`) |
| GloVe 300d | Embeddings estáticos (co-ocurrencia global) | 300 | depende del corpus (no disponible aquí) | no aplica | consultar distribución original de Stanford | Descarga directa desde Stanford |
| fastText 300d | Embeddings estáticos con subpalabras | 300 | depende del corpus (no disponible aquí) | no aplica | consultar distribución original de Facebook | Web oficial y HuggingFace |
| word2vec GoogleNews | Embeddings estáticos | 300 | ~3 millones (según distribución original) | no aplica | consultar términos de Google | Descarga directa |
| Modelos de frase tipo sentence-transformers | Transformer con pooling entrenado | 384-1024 (según modelo) | subword | cientos de tokens (según modelo) | varía (a menudo Apache-2.0) | HuggingFace |

Frente a GloVe y word2vec, la diferencia principal de este paquete es el ajuste supervisado sobre SimLex-999 y el empaquetado listo para fse. Frente a los modelos de frase basados en transformer, la desventaja es la ausencia total de contexto: no resuelve polisemia y depende por completo de la calidad del pooling.

## Limitaciones y advertencias

- Licencia desconocida: el autor original no declara licencia y el repositorio redistribuye los vectores sin especificarla. El uso comercial y la redistribución conllevan riesgo legal y requieren contactar con el autor o con Carnegie Mellon University.
- Sin contexto: al ser vectores estáticos, una misma palabra tiene un único vector; no se distingue «bank» (entidad financiera) de «bank» (orilla del río).
- Solo inglés: no hay soporte de castellano ni de otros idiomas, ni multilingüismo parcial.
- Vocabulario cerrado de 1.703.756 entradas: las palabras fuera de vocabulario y las variantes morfológicas no cubiertas requieren estrategias propias de normalización.
- Sensibilidad a la tokenización y al preprocesado: los resultados varían según cómo se separe el texto y cómo se construyan los pesos SIF a partir del corpus de entrenamiento.
- Ausencia de métricas publicadas: no hay cifras de STS ni de SimLex-999 en la información disponible, por lo que no se puede estimar su calidad relativa sin evaluarlo uno mismo.
- Riesgo de sesgos: al ser un espacio vectorial entrenado sobre corpus inglés no documentado, puede reproducir sesgos de género, raza o nacionalidad; no se han publicado análisis al respecto.
- Validación comunitaria prácticamente nula: 0 descargas y 0 likes en el momento de la consulta, y etiqueta de librería `fse` que exige instalar una dependencia específica.
- No es un modelo generativo: no debe emplearse para completar texto, responder preguntas ni ejecutar herramientas; hacerlo produciría resultados sin sentido.
- Fecha de actualización del repositorio posterior a la de creación; el contenido de los pesos no está versionado ni documentado con checksums en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/fse/paragram-300-sl999
- Página original de los vectores (John Wieting, CMU): https://www.cs.cmu.edu/~jwieting/
- Paper: Wieting, Bansal, Gimpel, Livescu y Roth (2015), «From Paraphrase Database to Compositional Paraphrase Model and Back»: https://aclanthology.org/Q15-1025/
- Librería fse (Fast Sentence Embeddings), código, documentación y benchmark STS: https://github.com/oborchers/Fast_Sentence_Embeddings
- gensim (formato de pesos `KeyedVectors`): https://radimrehurek.com/gensim/
- Autor del empaquetado, Dr. Oliver Borchers: https://www.drborchers.com/
- Nota: las búsquedas web sobre «FSE» devuelven resultados del Fondo Social Europeo y de programas de subvenciones, sin relación con este modelo.
