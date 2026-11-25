# selliinn/chat-moderation-tr-models

## Resumen

`chat-moderation-tr-models` es una coleccion de cinco clasificadores binarios para moderacion de chat en turco, publicada por el usuario selliinn como parte de un trabajo academico (SWE015). Cada modelo recibe un mensaje en turco y devuelve una etiqueta: `clean (0)` u `offensive (1)`. La coleccion incluye un BERTurk afinado, su version cuantizada a INT8, un clasificador tf-idf con regresion logistica, un modelo word2vec skip-gram y una red feedforward sobre embeddings agregados.

El modelo principal es un fine-tuning de `dbmdz/bert-base-turkish-cased`, un transformer encoder BERT base (12 capas, 768 de hidden, aproximadamente 110 millones de parametros) con tokenizador WordPiece adaptado al turco. El entrenamiento se realizo sobre OffensEval-TR 2020 (Çöltekin, 2020), el corpus de referencia para deteccion de lenguaje ofensivo en turco.

Su relevancia es practica: ofrece una linea base completa y ligera para moderacion en tiempo real en un idioma con poca cobertura de herramientas de moderacion, con variantes que van desde un transformer completo hasta un modelo lineal de milisegundos, lo que permite elegir el compromiso entre coste y precision. La licencia MIT facilita su reutilizacion, aunque el autor la restringe explicitamente a fines educativos y de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder) para `berturk/` y `berturk_int8.pt`; tf-idf + regresion logistica; word2vec skip-gram + red feedforward; word2vec skip-gram (100 dim) |
| Parametros totales | Aproximadamente 110 M en el modelo BERTurk; no disponible para el resto de variantes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT base admite 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | INT8 dinamica en PyTorch sobre capas Linear (`berturk_int8.pt`); FP32 en `berturk/` |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors y joblib (segun tags); `berturk_int8.pt` y `ffnn.pt` en PyTorch `.pt`; `word2vec.model*` en formato nativo de gensim |

## Arquitectura y entrenamiento

El componente principal es un BERT base preentrenado en turco (`dbmdz/bert-base-turkish-cased`) y afinado como clasificador binario de secuencia sobre OffensEval-TR 2020. Sobre ese checkpoint se genera una variante con cuantizacion dinamica INT8 de PyTorch aplicada a las capas lineales, pensada para reducir el coste de inferencia sin reentrenar. Las otras tres variantes son clasicos de procesamiento de lenguaje natural: un pipeline tf-idf con n-gramas de palabra (1-2) y de caracter (2-5) alimentando una regresion logistica; un word2vec skip-gram de 100 dimensiones entrenado con los tuits de entrenamiento; y una red feedforward que consume la concatenacion de la media y el max-pooling de esos vectores.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo ajuste fino adicional con RLHF o DPO (no procede en un clasificador). Tampoco se documentan hiperparametros, epochs ni estrategia de validacion. La innovacion tecnica destacable es la propia coleccion: un mismo problema resuelto con cinco niveles de complejidad, incluida una ruta de cuantizacion INT8 lista para produccion ligera.

## Capacidades

- Clasificacion binaria de texto en turco: `clean (0)` frente a `offensive (1)`.
- Deteccion de lenguaje ofensivo en mensajes cortos, tipico de chats y redes sociales.
- Inferencia de baja latencia con el modelo lineal tf-idf + regresion logistica.
- Inferencia con menor huella de memoria mediante cuantizacion dinamica INT8.
- Procesamiento de texto sin dependencia de GPU en las variantes tf-idf y feedforward.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- Capacidad multilingue limitada al turco; no se documenta transferencia a otros idiomas.

## Casos de uso

- Moderacion de chat en tiempo real: el clasificador tf-idf + regresion logistica o el BERTurk INT8 pueden evaluar cada mensaje entrante en milisegundos y marcar los ofensivos antes de publicarlos, con un coste computacional minimo en CPU.
- Filtrado previo en comunidades turcoparlantes: integracion como primer filtro en foros, Discords o apps de mensajeria para derivar solo los mensajes sospechosos a revision humana, reduciendo la carga de moderadores.
- Enrutado a colas de revision: usar el score del modelo como señal de prioridad, de modo que los mensajes con alta probabilidad de ofensa se revisen antes que el resto.
- Investigacion en NLP turco: linea base reproducible para comparar tecnicas clasicas (tf-idf, word2vec) frente a transformers afinados sobre el mismo corpus OffensEval-TR 2020.
- Docencia y trabajos academicos: la coleccion ilustra el ciclo completo de un proyecto de clasificacion, desde features clasicas hasta fine-tuning y cuantizacion, con artefactos listos para inspeccionar.
- Despliegue en entornos con recursos limitados: la variante INT8 o el modelo lineal permiten ejecutar moderacion en servidores sin GPU o en el borde, donde un BERT en FP32 no cabria.
- Analisis de toxicidad a posteriori: procesar por lotes historicos de mensajes para medir la prevalencia de lenguaje ofensivo en una comunidad a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de GitHub del autor para consultar los resultados sobre el conjunto de test oficial, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en FP32 para el BERTurk base (unos 110 M de parametros a 4 bytes); en torno a 0,3 GB con la variante INT8. Las variantes tf-idf, word2vec y feedforward caben en RAM de CPU sin GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve para el BERTurk; una RTX 3060, RTX 4090, A100 o H100 ofrecen margen de sobra y mayor throughput en lote.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para las variantes ligeras.
- Opciones de despliegue: PyTorch nativo para `berturk/`, `berturk_int8.pt` y `ffnn.pt`; joblib/scikit-learn para `tfidf_logreg.joblib`; gensim para `word2vec.model*`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tipo.
- Latencia y throughput: no disponibles. Por la naturaleza del modelo (encoder de 110 M y clasificador lineal), se espera latencia de milisegundos por mensaje en GPU y de decenas de milisegundos en CPU para el transformer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `selliinn/chat-moderation-tr-models` (BERTurk) | ~110 M | no disponible | Clasificacion ofensivo/no ofensivo en turco | MIT | Hugging Face |
| `dbmdz/bert-base-turkish-cased` | ~110 M | 512 tokens (BERT base) | Modelo base preentrenado en turco, sin cabeza de clasificacion | MIT | Hugging Face |
| `selliinn/chat-moderation-tr-models` (tf-idf + logreg) | no disponible (lineal) | no aplica | Clasificacion ofensivo/no ofensivo en turco | MIT | Hugging Face |
| `selliinn/chat-moderation-tr-models` (word2vec + FFNN) | no disponible | no aplica | Clasificacion ofensivo/no ofensivo en turco | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de moderacion en turco en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que los modelos estan pensados solo para educacion e investigacion; conviene validar la licencia y el uso comercial con el autor antes de desplegarlos en produccion.
- Los modelos cometen errores y pueden reflejar los sesgos del corpus de entrenamiento (tuits de OffensEval-TR 2020), que no representa necesariamente el registro de un chat actual.
- Riesgo de falsos positivos y falsos negativos: la clasificacion binaria no distingue intensidad, ironia ni contexto conversacional, por lo que puede marcar como ofensivo un mensaje recuperado o malinterpretar sarcasmo.
- Cobertura limitada al turco; no se documenta rendimiento en otros idiomas ni en code-switching.
- No se documenta la longitud maxima de entrada ni el comportamiento con mensajes muy largos o con emojis y jerga reciente.
- `berturk_int8.pt` y `tfidf_logreg.joblib` son ficheros basados en pickle: el propio autor advierte que solo deben cargarse desde este repositorio, por el riesgo de ejecucion de codigo arbitrario al deserializar.
- Sin cifras publicadas de benchmarks, no es posible cuantificar la precision real frente a alternativas; el repositorio de GitHub es la unica fuente indicada para resultados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso ni validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selliinn/chat-moderation-tr-models
- Repositorio de la aplicacion de moderacion: https://github.com/sllln/chat-moderation
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/coltekin/offenseval2020_tr
- Referencia del corpus: Çöltekin (2020), OffensEval-TR 2020 (enlace directo no disponible en la informacion proporcionada)
