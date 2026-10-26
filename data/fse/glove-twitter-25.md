# fse/glove-twitter-25

## Resumen

`fse/glove-twitter-25` es un conjunto de vectores de palabras GloVe de 25 dimensiones distribuido en formato gensim `KeyedVectors` y empaquetado para la librería fse (Fast Sentence Embeddings). No es un modelo generativo ni un transformer: se trata de embeddings estáticos obtenidos con el algoritmo GloVe (Pennington, Socher y Manning, 2014) sobre 2.000 millones de tuits (27.000 millones de tokens), con un vocabulario de 1.193.514 palabras y tokens en minúsculas y en inglés. El repositorio lo publica el usuario `fse` como redistribución del material original del Stanford NLP Group.

Su relevancia práctica es la de un componente ligero y determinista para convertir texto en vectores: fse aplica promediado CBOW, SIF y uSIF sobre los vectores de palabras para producir representaciones de frases y documentos enteros. Con 119 MB de pesos en float32, es adecuado para prototipado rápido, clasificación de texto en entornos con poca memoria y como baseline en investigación, no para tareas de razonamiento o generación.

La licencia PDDL (Public Domain Dedication and License) permite uso comercial sin restricciones de atribución, lo que junto a su reducido tamaño lo convierte en una opción atractiva cuando el presupuesto de cómputo o de almacenamiento es muy limitado. La contrapartida es clara: al no ser contextual, no desambigua palabras polisémicas ni captura dependencias sintácticas de largo alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos de palabras (GloVe, modelo de regresion log-bilineal sobre matriz de coocurrencia global); sin transformer ni atencion |
| Parametros totales | 29.837.850 valores float32 (1.193.514 tokens x 25 dimensiones); equivalente a ~29,8 M de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica: cada token se representa de forma independiente, sin ventana de contexto. La agregacion a nivel de frase la realiza fse (CBOW, SIF, uSIF) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen unicamente en float32 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | PDDL (Public Domain Dedication and License) |
| Formato de pesos | gensim `KeyedVectors` (`glove-twitter-25.model`) + matriz NumPy `glove-twitter-25.model.vectors.npy` (float32) |

## Arquitectura y entrenamiento

GloVe no es una red neuronal profunda: construye una matriz global de coocurrencia palabra-palabra y factoriza su logaritmo mediante un modelo de regresion log-bilineal, entrenado con descenso de gradiente sobre las entradas no nulas. En esta variante concreta, la ventana de coocurrencia se aplica sobre 2.000 millones de tuits (27.000 millones de tokens) y el vocabulario resultante se normaliza a minusculas (uncased), con 1.193.514 entradas y 25 dimensiones por vector. El autor original de los vectores es el Stanford NLP Group; el repositorio los redistribuye en formato gensim.

El empaquetado para fse anade la capa de agregacion: fse convierte secuencias de vectores de palabras en vectores de frase mediante promediado CBOW, SIF (smooth inverse frequency, con estimacion de frecuencias) y uSIF (variante no supervisada). Esto implica que el "entrenamiento" a nivel de frase se reduce a ajustar pesos de palabras sobre un corpus de frases de ejemplo (`model.train(sentences)`), sin reentrenar los embeddings. No hay RLHF, DPO ni ajuste por instrucciones, ni decodificacion especulativa: el modelo no genera tokens. La innovacion tecnica relevante es la eficiencia: `Vectors.from_pretrained(..., mmap="r")` permite mapear los vectores en memoria en lugar de cargarlos en RAM, y el repositorio completo ocupa 0,2 GB.

## Capacidades

- Representacion distribuida de palabras en ingles: similitud coseno, analogias lineales y vecinos mas cercanos sobre un vocabulario de 1,19 M de entradas.
- Generacion de embeddings de frases y documentos completos mediante CBOW, SIF y uSIF a traves de la libreria fse.
- Extraccion de caracteristicas para modelos downstream (clasificacion, regresion, clustering) sobre texto informal de redes sociales.
- Manejo de registros propios de Twitter: jerga, abreviaturas, errores ortograficos frecuentes y ausencia de mayusculas (todo el vocabulario esta normalizado a minusculas).
- Capacidades de generacion de texto, razonamiento, codigo, matematicas, vision o audio: no disponibles; el modelo no las soporta.
- Tool calling, function calling, uso como agente y razonamiento multi-paso: no disponibles; no aplica a un modelo de embeddings.
- Capacidades multilingues: no disponibles; el vocabulario es exclusivamente ingles.
- Modo "thinking", atencion contextual o desambiguacion de polisemia: no disponibles por diseno.
- Mapeo de memoria opcional (`mmap="r"`) para reducir el consumo de RAM en despliegues con recursos limitados.

## Casos de uso

- Clasificacion de sentimiento en tuits: se vectorizan los mensajes con fse + SIF y se entrena un clasificador lineal (regresion logistica o SVM) encima; el vocabulario de 1,19 M de entradas cubre jerga y erratas tipicas de Twitter, y el coste de inferencia es de microsegundos por frase en CPU.
- Clustering y descubrimiento de topicos en corpus de redes sociales: los 25 dimensiones y la agregacion SIF permiten agrupar cientos de miles de mensajes con k-means o HDBSCAN en una sola maquina, sin GPU.
- Deduplicacion y near-duplicate detection: comparar embeddings de frase con similitud coseno para eliminar retuits, copias y variantes de un mismo mensaje en pipelines de ingesta de datos.
- Busqueda semantica ligera o recuperacion de FAQ: indexar un conjunto pequeno de preguntas y respuestas como vectores de 25 dimensiones y resolver consultas por vecino mas cercano; util como baseline antes de adoptar un modelo neuronal de recuperacion.
- Filtrado de spam y abuso en plataformas sociales: usar los vectores como features de un clasificador supervisado junto a senales de metadata, con un coste de almacenamiento de 119 MB para todo el vocabulario.
- Prototipado y educacion: demostrar tecnicas de embeddings estaticos, SIF y evaluacion en tareas semantica sin necesidad de GPU, con un repositorio de 0,2 GB descargable en segundos.
- Baseline en investigacion de NLP: punto de comparacion reproducible frente a sentence transformers modernos para medir la mejora atribuible a la contextualizacion.
- Sistemas embebidos o entornos con RAM restringida: carga con `mmap="r"` para mantener el uso de memoria por debajo de los 200 MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de evaluacion; unicamente referencia el repositorio de fse, que publica un benchmark de similitud semantica (STS) para el conjunto de sus vectores, sin que se hayan proporcionado los valores numericos correspondientes a este modelo en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,12 GB en float32 (119 MB de vectores); con `mmap="r"` el uso de memoria es practicamente el del mapeo, no una copia completa en RAM.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer sirve si se desea procesar lotes grandes, pero el cuello de botella real es la CPU y el ancho de banda de memoria.
- Compatibilidad con GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3050, RTX 4090, etc.); tambien funciona integramente en CPU.
- Opciones de despliegue: libreria `fse` (con `pip install fse`) sobre gensim, y gensim directamente para cargar los `KeyedVectors`. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por la naturaleza de la operacion (busqueda en tabla y promedio ponderado de 25 dimensiones por token), se espera una latencia muy inferior a la de cualquier modelo neuronal, pero no se aporta cifra verificada.
- Almacenamiento: repositorio de 0,2 GB; matriz de vectores de 119 MB.
- Requisitos de RAM para construccion del vocabulario y entrenamiento SIF: el vocabulario completo en memoria ronda los cientos de MB en funcion de la implementacion; no disponible con precision.

## Comparativa con modelos similares

| Modelo | Dimensiones | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fse/glove-twitter-25 | 25 | 1.193.514 | No aplica (estatico) | PDDL | HuggingFace (este repo) |
| GloVe Twitter 50d (Stanford NLP) | 50 | no disponible en la informacion | No aplica (estatico) | PDDL | Sitio de Stanford NLP / gensim-data |
| GloVe Twitter 100d (Stanford NLP) | 100 | no disponible en la informacion | No aplica (estatico) | PDDL | Sitio de Stanford NLP / gensim-data |
| GloVe Wikipedia 100d (Stanford NLP) | 100 | no disponible en la informacion | No aplica (estatico) | PDDL | Sitio de Stanford NLP / gensim-data |

Las alternativas de la misma familia (GloVe Twitter 50d, 100d y 200d) ofrecen mayor capacidad de representacion a cambio de multiplicar el almacenamiento y el coste de calculo; las variantes entrenadas sobre Wikipedia capturan un registro mas formal y resultan mas adecuadas para texto normativo. Los modelos de embeddings contextuales tipo sentence transformers superan a GloVe en tareas de similitud semantica y desambiguacion, pero requieren GPU y ordenes de magnitud mas de memoria; no se dispone de cifras comparativas verificadas en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de contextualizacion: cada palabra tiene un unico vector, por lo que no se resuelve la polisemia ni se modelan dependencias sintacticas; "banco" o "raton" reciben la misma representacion en cualquier contexto.
- Dominio restringido: el corpus son tuits, con ruido, jerga y errores ortograficos; el rendimiento puede degradarse notablemente en texto formal, tecnico o literario.
- Solo ingles y todo en minusculas: no hay soporte multilingue ni distincion de mayusculas, lo que impide distinguir nombres propios, siglas o enfasis.
- Vocabulario cerrado sin subpalabras: las palabras fuera del vocabulario (OOV) no tienen representacion; no existe mecanismo de fastText para derivar vectores de formas no vistas. No se dispone del detalle de preprocesado aplicado al tokenizar los tuits.
- Baja dimensionalidad: 25 dimensiones limitan la capacidad de representacion frente a 100, 200 o 300 dimensiones; es esperable una menor calidad en tareas semanticas finas, aunque no se aportan cifras que lo cuantifiquen.
- Riesgo de sesgos: los vectores heredan los sesgos presentes en 2.000 millones de tuits (genero, raza, nacionalidad, religion). El repositorio no documenta ningun proceso de mitigacion ni evaluacion de sesgo.
- Riesgo de alucinacion: no aplica en sentido estricto, ya que el modelo no genera texto; el riesgo equivalente es el de asociaciones espurias en el espacio vectorial.
- Licencia: PDDL es una dedicacion al dominio publico que permite uso comercial y modificacion; conviene verificar los terminos exactos de Open Data Commons PDDL si se redistribuye el material.
- Mantenimiento limitado: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y la libreria fse tiene un mantenimiento dependiente de un unico autor; conviene evaluar el riesgo de abandono antes de integrarlo en produccion.
- Sin garantias de calidad: la model card no incluye evaluacion cuantitativa, ficha de datos ni limitaciones declaradas por el autor de la redistribucion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fse/glove-twitter-25
- Proyecto GloVe (Stanford NLP Group): https://nlp.stanford.edu/projects/glove/
- Paper original: Pennington, Socher y Manning (2014), "GloVe: Global Vectors for Word Representation": https://nlp.stanford.edu/pubs/glove.pdf
- Libreria fse (Fast Sentence Embeddings), codigo y benchmark STS: https://github.com/oborchers/Fast_Sentence_Embeddings
- Documentacion de gensim (KeyedVectors): https://radimrehurek.com/gensim/
- Licencia PDDL (Open Data Commons): https://opendatacommons.org/licenses/pddl/
- Perfil del mantenedor de fse, Dr. Oliver Borchers: https://www.drborchers.com/

Nota: la busqueda web realizada devuelve exclusivamente resultados sobre el Fonds social europeen (FSE) frances, entidad sin relacion con este modelo; no se han encontrado enlaces adicionales relevantes para la ficha.
