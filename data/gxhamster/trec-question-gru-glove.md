# GXHamster/trec-question-gru-glove

## Resumen

El modelo `GXHamster/trec-question-gru-glove` es un clasificador de texto de tipo pregunta-respuesta entrenado sobre las seis clases gruesas del corpus TREC. Lo desarrolla el usuario GXHamster y se publica en Hugging Face bajo licencia MIT. No es un modelo de lenguaje generativo: es un clasificador discriminativo de 3.159.342 parámetros que asigna una de seis categorías a una pregunta corta en inglés.

Arquitecturalmente es una red recurrente clásica: una matriz de embeddings GloVe `glove-wiki-gigaword-100` afinada durante el entrenamiento, seguida de una GRU de dos capas con estados ocultos de 64 y 128 unidades, un pooling de media sobre la dimensión temporal y una capa lineal de salida sobre seis clases. El checkpoint se distribuye como `best_model.pt` (12,1 MB) y reporta una precisión de test de 0,9751 (196 de 201 aciertos) en la partición de evaluación empleada por el autor.

Su relevancia es limitada y muy específica: sirve como referencia ligera y reproducible para clasificación de intenciones en dominios de preguntas, con un coste computacional mínimo. No compite con modelos generativos actuales ni cubre tareas de razonamiento, generación o tool calling; su interés práctico reside en ser un baseline pequeño, entrenable en CPU y fácil de integrar en pipelines de clasificación de intenciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente GRU de 2 capas (estados ocultos 64 y 128) sobre embeddings GloVe `glove-wiki-gigaword-100` afinados, pooling de media y capa lineal de 6 clases |
| Parametros totales | 3.159.342 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el pooling de media opera sobre la secuencia de entrada; no se documenta longitud máxima) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión original; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (los embeddings GloVe wiki-gigaword-100 son de corpus inglés; el autor no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`, dict con `model_class`, `model_kwargs`, `train_config`, `val_acc` y `state_dict`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal recurrente de tipo GRU con dos capas apiladas (64 y 128 unidades de estado oculto respectivamente). La entrada se construye con la matriz de embeddings preentrenada `glove-wiki-gigaword-100`, que se afina durante el entrenamiento. Tras la recurrencia, se aplica un pooling de media sobre la dimensión temporal y una capa lineal final que proyecta a las seis clases gruesas de TREC (ABBR, DESC, ENTY, HUM, LOC, NUM, en la convención habitual del corpus).

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de regularización específicas, aumento de datos o ajuste fino por etapas. Tampoco se especifica el optimizador, la tasa de aprendizaje ni el número de épocas. La model card únicamente reporta la arquitectura, el tamaño del checkpoint, el número de parámetros y la precisión de test (0,9751 sobre 201 ejemplos), además del SHA-256 del archivo de pesos.

Como innovación técnica destacable, no hay ninguna: se trata de una arquitectura recurrente convencional con embeddings estáticos afinados, sin atención, sin mecanismos de decodificación especulativa ni componentes híbridos. El checkpoint se serializa con `torch.load(path, map_location="cpu", weights_only=True)`, lo que permite cargarlo en CPU sin necesidad de definir previamente la clase del modelo, aunque la definición de dicha clase no se incluye en el repositorio.

## Capacidades

- Clasificación de texto en seis clases gruesas de TREC: abreviatura, descripción, entidad, humano, ubicación y numérica.
- Asignación de una única etiqueta por pregunta de entrada (clasificación multiclase, no multietiqueta).
- Procesamiento de preguntas cortas en inglés, condicionado por el vocabulario de GloVe wiki-gigaword-100.
- Inferencia en CPU con un coste computacional muy bajo, adecuada para entornos sin GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni generación de texto.
- Capacidades multilingües: no documentadas; los embeddings subyacentes son de corpus inglés.

## Casos de uso

- Clasificación de intenciones en asistentes de preguntas frecuentes: el modelo etiqueta cada consulta entrante en una de las seis categorías TREC, lo que permite enrutarla al módulo de respuesta adecuado (por ejemplo, consultas numéricas frente a consultas de entidad) con una latencia muy baja en CPU.
- Enrutamiento previo en pipelines de búsqueda: dado un volumen alto de consultas cortas, el clasificador actúa como primer filtro para decidir qué índice o base de datos consultar, reduciendo el coste frente a un modelo generativo.
- Etiquetado automático de datasets de preguntas: útil para preanotar corpus de preguntas con categorías gruesas antes de una revisión humana, aprovechando su precisión reportada de 0,9751 en la partición evaluada.
- Baseline de referencia en experimentos de NLP: sirve como punto de comparación reproducible (3,16 M de parámetros, checkpoint de 12,1 MB) frente a modelos transformer en tareas de clasificación de preguntas.
- Filtrado de consultas en sistemas de atención al cliente: permite separar consultas de tipo entidad, ubicación o cantidad para dirigirlas a formularios o flujos específicos sin desplegar infraestructura GPU.
- Docencia y prototipado rápido: al cargarse con `torch.load` en CPU y tener un tamaño reducido, es adecuado para demostraciones de clasificación de texto en cursos y entornos con recursos limitados.
- Moderación o triaje de bajo coste: clasificación rápida de mensajes cortos en categorías predefinidas antes de pasarlos a un modelo mayor, siempre que las categorías coincidan con las seis clases TREC.

## Benchmarks y rendimiento

| Benchmark | Resultado | Conjunto de evaluacion |
|---|---|---|
| Precisión (accuracy) | 0,9751 (196/201) | Partición de test empleada por el autor (no especificada) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible. El único dato reportado es la precisión sobre 201 ejemplos de una partición de validación/test no descrita en detalle, por lo que no es posible compararlo de forma rigurosa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precisión original; el checkpoint pesa 12,1 MB y el modelo tiene 3,16 M de parámetros.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de memoria es suficiente, e incluso tarjetas integradas pueden ejecutarlo.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) y también en CPU.
- Opciones de despliegue: PyTorch nativo mediante `torch.load`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos generativos y no aplican a este clasificador). Sería necesario reimplementar la clase del modelo, ya que no se incluye en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de milisegundos por muestra en CPU, aunque no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GXHamster/trec-question-gru-glove | 3,16 M | no disponible | Clasificación TREC (6 clases) | MIT | Hugging Face |
| Modelos transformer pequeños para clasificación (p. ej. DistilBERT) | ~66 M | 512 tokens | Clasificación de texto general | Apache 2.0 / MIT según variante | Hugging Face |
| Clasificadores lineales sobre TF-IDF | variable (según vocabulario) | no aplica | Clasificación de texto | variable | Diversas fuentes |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto y licencia. La ventaja principal de este modelo frente a alternativas transformer es su tamaño (unas 20 veces menor que DistilBERT) y su coste de inferencia en CPU; la desventaja es la falta de contexto documentado y la ausencia de la definición de la clase del modelo en el repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al usar embeddings GloVe wiki-gigaword-100, puede heredar sesgos de género, geográficos y culturales presentes en el corpus de Wikipedia.
- Riesgo de alucinación: no aplica en sentido estricto (no genera texto), pero puede producir clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Limitaciones de contexto e idioma: no se documenta la longitud máxima de entrada ni los idiomas soportados; los embeddings subyacentes son de corpus inglés, por lo que el rendimiento en otros idiomas es incierto.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; no se especifican restricciones adicionales.
- Caveat importante para producción: la definición de la clase del modelo no se incluye en el repositorio, solo el `state_dict` y los metadatos; es necesario reimplementar la clase a partir de la descripción de la model card para poder cargar el checkpoint.
- La partición de evaluación no está descrita (201 ejemplos), por lo que la precisión de 0,9751 no es verificable de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es de 0,0 GB, lo que sugiere que el archivo puede no estar disponible o que el repositorio está vacío en el momento de la consulta.
- No se han publicado datos sobre robustez ante ruido, dominio fuera de TREC ni comportamiento con entradas largas.

## Enlaces

- Hugging Face: https://huggingface.co/GXHamster/trec-question-gru-glove
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo, papers, blogs, repositorios o demos en la información proporcionada.
