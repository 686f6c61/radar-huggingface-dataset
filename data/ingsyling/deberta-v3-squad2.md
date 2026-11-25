# Ingsyling/deberta-v3-squad2

## Resumen

DeBERTa-v3-squad2 es un modelo de respuesta extractiva a preguntas (extractive question answering) obtenido mediante fine-tuning de `microsoft/deberta-v3-base` sobre el conjunto de datos SQuAD 2.0. Lo desarrolla David Faleye bajo el identificador `Ingsyling`, como continuación de un proyecto de curso (CSCI 390) y con el objetivo explícito de superar a `deepset/roberta-base-squad2` entrenando en una GPU gratuita (Tesla T4 de Google Colab). Dado un pasaje y una pregunta, el modelo marca el fragmento contiguo del pasaje que responde a la pregunta o indica que el pasaje no contiene respuesta.

Arquitectura DeBERTa-v3 (transformer encoder con atención desenredada y embedding de posiciones relativas), 183.833.090 parámetros totales, ventana de 384 tokens por lectura y licencia MIT. El modelo es relevante para quienes necesitan un extractor de respuestas ligero, desplegable en CPU y con un rendimiento en SQuAD 2.0 claramente superior al de alternativas base más pequeñas como RoBERTa-base o DistilBERT, a costa de mayor tamaño y latencia.

Con 67 descargas y sin likes en el momento de la consulta, se trata de un experimento personal reproducible (código y configuración publicados en GitHub) más que de un modelo mantenido por una organización. Su utilidad práctica está acotada a texto en inglés de estilo Wikipedia y a respuestas que aparecen literalmente en el pasaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (atención desenredada, posiciones relativas) |
| Parametros totales | 183.833.090 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens por ventana de lectura (ventanas solapadas con 128 tokens de solape) |
| Tipos de cuantizacion | no disponible (repo en safetensors fp32/fp16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-base`, un encoder transformer con atención desenredada en dos niveles y embeddings de posición relativa, adaptado a la cabeza de question answering (predicción de posiciones de inicio y fin del span de respuesta, más la posición `[CLS]` como "sin respuesta"). El fine-tuning se realizó sobre el split de entrenamiento de SQuAD 2.0: 130.319 preguntas que generan 131.467 ventanas, con ventanas de 384 tokens y 128 tokens de solape, 2 épocas (16.434 pasos), batch efectivo de 16 (8 por paso con acumulación de gradientes en 2 pasos), learning rate 3e-5 con warm-up lineal en el 10% inicial y decaimiento lineal posterior, weight decay 0.01, precisión mixta fp16 y semilla 42.

El entrenamiento completo se ejecutó en una única Tesla T4 (Google Colab) en 1 hora y 39 minutos, con un pico de 7,0 GB de memoria GPU. Las ventanas se agrupan por longitud similar y el padding se aplica solo hasta la ventana más larga del lote, de modo que la ventana media procesada es de unos 164 tokens. Las preguntas sin respuesta y las ventanas que no contienen el span completo se etiquetan con la posición `[CLS]`. La pérdida de entrenamiento descendió de 5,22 a aproximadamente 0,5. No se documenta RLHF, DPO ni ninguna innovación de decodificación (sin decodificación especulativa ni atención lineal).

## Capacidades

- Respuesta extractiva a preguntas en inglés: devuelve un span contiguo del pasaje proporcionado.
- Detección de preguntas sin respuesta: con `handle_impossible_answer=True` la respuesta es una cadena vacía.
- Integración directa con el pipeline `question-answering` de transformers 4.x (la versión 5 eliminó dicho pipeline).
- Tokenizador DeBERTa-v3 basado en SentencePiece, que requiere los paquetes `sentencepiece` y `protobuf`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto libre, código, matemáticas, visión ni audio.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Extracción de respuestas en bases de conocimiento documentales: dado un artículo de Wikipedia o una ficha técnica en inglés, el modelo localiza el fragmento exacto que responde a una consulta, lo que permite construir un extractor de evidencias para sistemas de búsqueda documental.
- Enriquecimiento de pipelines de RAG: tras recuperar pasajes con un retriever, el modelo puede señalar el span concreto que respalda la respuesta, con la ventaja de que la salida siempre es texto presente en la fuente y por tanto verificable.
- Anotación asistida de datasets de QA: al devolver spans literales, sirve como preetiquetador en flujos de anotación humana de preguntas y respuestas sobre corpus en inglés.
- Extracción de campos en documentos estructurados semiestructurados (contratos, informes, artículos): formulando la pregunta adecuada ("¿cuál es la fecha de entrada en vigor?") se obtiene el fragmento correspondiente del pasaje.
- Procesamiento por lotes en CPU: con 85 ms de mediana por pregunta en una CPU Apple M2, es viable para tareas offline de extracción masiva donde no hay GPU disponible.
- Filtrado de preguntas no respondibles: la señal de "sin respuesta" permite descartar consultas que el corpus no cubre antes de invocar un modelo generativo más costoso.
- Evaluación comparativa de pipelines de QA: al ser un experimento reproducible con código público, sirve como baseline documentado frente a `deepset/roberta-base-squad2` y `Ingsyling/distilbert-squad2`.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre SQuAD 2.0, split de validación, 11.873 preguntas, con el umbral de "sin respuesta" por defecto:

| Conjunto | Exact Match | F1 | Preguntas |
|---|---|---|---|
| Todas | 84,86 | 87,69 | 11.873 |
| Respondibles | 83,37 | 89,02 | 5.928 |
| No respondibles | 86,36 | 86,36 | 5.945 |

Comparativa medida con el mismo código por el autor:

| Modelo | Exact Match | F1 | F1 respondibles | F1 no respondibles | Parámetros |
|---|---|---|---|---|---|
| Este modelo | 84,86 | 87,69 | 89,02 | 86,36 | 184 M |
| `deepset/roberta-base-squad2` | 79,90 | 82,91 | 84,01 | 81,82 | 124 M |
| `Ingsyling/distilbert-squad2` | 64,14 | 67,38 | 72,17 | 62,59 | 66 M |

Con un umbral de "sin respuesta" de −1,9 (elegido y evaluado en mitades distintas del dev set), el F1 sube de 87,69 a 88,33. Los autores de DeBERTa-v3 reportan aproximadamente 88 F1 para el modelo base en SQuAD 2.0.

## Requisitos de hardware

- Inferencia en fp32: el repo ocupa 0,7 GB, por lo que cabe holgadamente en GPU consumer de 8 GB (RTX 3060, RTX 4060) e incluso en GPUs de 4 GB con margen.
- Entrenamiento de referencia: una Tesla T4 con 7,0 GB de pico de memoria, 1 h 39 min para 2 épocas.
- Cabe en CPU: mediana de 85 ms por pregunta en una CPU Apple M2 (frente a 53 ms de `deepset/roberta-base-squad2` y 27 ms del modelo DistilBERT del mismo autor).
- GPU recomendadas para servir con baja latencia: T4, L4, A10G, RTX 4090; para lotes grandes, A100/H100.
- Despliegue: pipeline `question-answering` de transformers 4.x, servidores de inferencia compatibles con transformers (por ejemplo TGI) y exportación a ONNX; no se documenta soporte GGUF ni Ollama.
- Throughput y latencia en GPU: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto por lectura | F1 SQuAD 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ingsyling/deberta-v3-squad2` | 184 M | 384 tokens | 87,69 (declarado por el autor) | MIT | Hugging Face, 67 descargas |
| `deepset/roberta-base-squad2` | 124 M | 512 tokens (RoBERTa-base) | 82,91 (medido por el autor de este modelo) | no disponible en la información | Hugging Face |
| `Ingsyling/distilbert-squad2` | 66 M | no disponible | 67,38 (medido por el autor) | no disponible en la información | Hugging Face |
| `microsoft/deberta-v3-base` (referencia de los autores) | 184 M | 512 tokens | ~88 (reportado por los autores de DeBERTa-v3) | MIT | Hugging Face |

## Limitaciones y advertencias

- Extractivo puro: la respuesta es siempre un fragmento continuo del pasaje; no puede sintetizar respuestas a partir de varias frases ni razonar.
- Debilidad principal en preguntas sin respuesta: el 45% de sus 1.797 errores en dev son respuestas a preguntas no respondibles (811 errores, frente a 1.081 de RoBERTa); las preguntas de tipo "why" son las más difíciles (F1 de 76 en "why" respondibles frente a 94 en "when").
- Umbral por defecto demasiado permisivo: exigir que la mejor respuesta supere a "sin respuesta" en unos 1,9 puntos (umbral −1,9) eleva el F1 de 87,69 a 88,33; el pipeline de ejemplo no aplica umbral.
- Documentos largos: solo lee 384 tokens a la vez y requiere ventanas solapadas; en tres artículos completos de dev (12 a 26 ventanas por pregunta) el F1 cayó de 91,6 / 85,8 / 80,9 con el párrafo correcto a 86,4 / 73,5 / 73,5 al seleccionar la ventana con mayor margen sobre "sin respuesta". El umbral necesita reajuste para textos largos.
- Dominio limitado: entrenado solo con párrafos de Wikipedia en inglés; no probado con otros tipos de texto ni otros idiomas.
- Artefactos del tokenizador: el pipeline puede devolver la respuesta con un espacio inicial y puntuación adyacente (" France."), porque el tokenizador de DeBERTa-v3 incluye el espacio previo en el token.
- Dependencias: requiere transformers 4.x (la versión 5 eliminó el pipeline `question-answering`), además de `sentencepiece` y `protobuf`.
- Más grande y lento que las alternativas: 735 MB y 85 ms de mediana por pregunta en CPU M2, frente a 53 ms de RoBERTa-base y 27 ms de DistilBERT.
- Riesgo de alucinación bajo por ser extractivo, pero riesgo de respuesta incorrecta por selección errónea del span; no debe usarse en contextos médicos, legales o financieros sin revisión humana.
- Licencia MIT para el modelo, pero la información proporcionada sobre la licencia del modelo base `microsoft/deberta-v3-base` está truncada; conviene verificar los términos del modelo base antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ingsyling/deberta-v3-squad2
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Modelo previo del mismo autor: https://huggingface.co/Ingsyling/distilbert-squad2
- Código, configuración y notebook de entrenamiento: https://github.com/Davidfaleye360/qa-experiments
- Dataset SQuAD 2.0: https://huggingface.co/datasets/rajpurkar/squad_v2
- Modelo de comparación: https://huggingface.co/deepset/roberta-base-squad2
