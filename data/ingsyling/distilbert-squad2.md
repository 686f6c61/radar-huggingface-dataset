# Ingsyling/distilbert-squad2

## Resumen

DistilBERT fine-tuned on SQuAD 2.0 es un modelo de question answering extractivo (QA) desarrollado por Ingsyling como proyecto de curso para la asignatura CSCI 390 (Natural Language Processing and Applications) por David Falaye y Kosisochukwu Ogbuanya. Parte de `distilbert-base-uncased` y se ha ajustado sobre el conjunto de entrenamiento de SQuAD 2.0, de modo que dada una pregunta y un pasaje de texto devuelve el fragmento literal del pasaje que responde a la pregunta, o indica que no hay respuesta.

Arquitectura transformer encoder de tipo DistilBERT, con 66.364.418 parámetros totales (aproximadamente 66 M) y pesos en safetensors. El modelo está pensado exclusivamente para inglés y para texto tipo Wikipedia; no es un modelo generativo ni conversacional, sino un extractor de spans. Su relevancia práctica es la de un baseline ligero y rápido (31 ms por pregunta en CPU según el autor) frente a alternativas como `deepset/roberta-base-squad2`.

La ventana de entrenamiento es de 384 tokens con 128 de solapamiento, y el modelo incorpora la capacidad de abstención propia de SQuAD 2.0 mediante el token `[CLS]`. La licencia es Apache 2.0 y el repositorio ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.364.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens (ventana de entrenamiento, con 128 de solapamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de 6 capas obtenido por destilación de BERT-base, con vocabulario uncased. Sobre esta base se añade una cabeza de question answering que predice las posiciones de inicio y fin del span de respuesta, más la posición `[CLS]` para el caso de pregunta sin respuesta. El ajuste se realizó sobre el conjunto de entrenamiento de SQuAD 2.0: 130.319 preguntas que, tras el troceado en ventanas de 384 tokens con 128 de solapamiento, dieron 131.754 ventanas.

Hiperparámetros declarados por el autor: 2 épocas (16.470 pasos), batch size 16, learning rate 3e-5 con warm-up lineal sobre el 10% inicial y decaimiento lineal posterior, weight decay 0,01, precisión mixta fp16 y semilla 42. El entrenamiento se ejecutó en una única Tesla T4 (Google Colab) en 44 minutos, con la pérdida bajando de 5,81 a aproximadamente 0,9. Las preguntas sin respuesta y las ventanas que no contienen la respuesta completa se etiquetan con la posición `[CLS]`.

## Capacidades

- Question answering extractivo: devuelve el fragmento literal del pasaje que responde a la pregunta.
- Detección de pregunta sin respuesta: mediante la puntuación del token `[CLS]` y el parámetro `handle_impossible_answer` del pipeline, devuelve cadena vacía cuando el pasaje no contiene la respuesta.
- Recuperación de candidatos: el código del proyecto (`src/predict.py`) devuelve los mejores candidatos y la puntuación de no-respuesta, además de la respuesta final.
- Procesamiento por ventanas con solapamiento para pasajes más largos que la ventana de 384 tokens.
- Inferencia en CPU viable: 31 ms por pregunta (mediana sobre 200 preguntas del dev set en un Apple M2).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Multilingüe: no; solo inglés.

## Casos de uso

- Extracción de respuestas sobre bases documentales tipo FAQ o Wikipedia: dado un artículo y una pregunta, el modelo localiza el span exacto de respuesta con 31 ms por consulta en CPU, lo que permite desplegarlo sin GPU en servicios de bajo tráfico.
- Búsqueda de respuestas en documentación técnica interna en inglés: indexar fragmentos de manuales y usar el modelo para señalar la frase concreta que responde a la consulta del usuario, con abstención cuando el fragmento no contiene la respuesta.
- Preprocesado para pipelines RAG: usar el modelo como extractor de spans para condensar pasajes recuperados antes de pasarlos a un modelo generativo, reduciendo el coste de contexto en etapas posteriores.
- Anotación asistida de datasets de QA: el modelo propone spans de respuesta sobre pasajes etiquetados y un humano valida, aprovechando su velocidad en CPU para procesar lotes grandes sin GPU.
- Filtrado de preguntas sin respuesta en sistemas de soporte: la puntuación de `[CLS]` permite descartar consultas que el corpus no cubre antes de escalarlas a un agente humano, aunque con la advertencia de que el modelo tiende a responder de más.
- Evaluación comparativa de baselines: sirve como referencia ligera (66 M, 31 ms) frente a modelos base como RoBERTa (124 M, 57 ms) en experimentos de QA extractivo.
- Extracción de datos estructurados de texto en inglés: localizar valores concretos (fechas, cifras, nombres) en informes o artículos cuando la respuesta es un fragmento contiguo del texto.

## Benchmarks y rendimiento

Resultados declarados por el autor en el dev set de SQuAD 2.0 (11.873 preguntas), con la métrica oficial `squad_v2` y el umbral de no-respuesta por defecto. No verificados de forma independiente (`verified: false`).

| Subconjunto | Exact Match | F1 | Preguntas |
|---|---|---|---|
| Total | 64,14 | 67,38 | 11.873 |
| Con respuesta | 65,69 | 72,17 | 5.928 |
| Sin respuesta | 62,59 | 62,59 | 5.945 |

Comparativa medida con el mismo código por el autor:

| Modelo | Exact Match | F1 | Parámetros | Tiempo CPU por pregunta |
|---|---|---|---|---|
| Este modelo | 64,14 | 67,38 | 66 M | 31 ms |
| `deepset/roberta-base-squad2` | 79,90 | 82,91 | 124 M | 57 ms |
| `distilbert-base-uncased` sin ajuste (primeras 1.000 preguntas) | 1,2 | 4,6 | 66 M | no disponible |

El ajuste del umbral de no-respuesta eleva el F1 de este modelo a 68,08 (validación cruzada sobre los artículos del dev set). El tiempo de CPU es la mediana sobre 200 preguntas del dev set en un portátil Apple M2.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66 M de parámetros), por lo que cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU con 31 ms por pregunta según el autor. Para lotes grandes, cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en todas, incluidas las de gama baja y en sistemas embebidos con suficiente RAM.
- Opciones de despliegue: pipeline `question-answering` de `transformers` 4.x (la versión 5 eliminó ese pipeline), o carga directa del modelo con `AutoModelForQuestionAnswering`; el repositorio del proyecto incluye `src/predict.py` sin pipeline. No se documentan despliegues con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: 31 ms por pregunta en CPU (Apple M2, mediana sobre 200 preguntas del dev set).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SQuAD 2.0 EM / F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingsyling/distilbert-squad2 | 66 M | 384 tokens | 64,14 / 67,38 | Apache 2.0 | Hugging Face |
| deepset/roberta-base-squad2 | 124 M | no disponible en la información | 79,90 / 82,91 | no disponible en la información | Hugging Face |
| distilbert-base-uncased (sin ajuste) | 66 M | 512 tokens (BERT estándar) | 1,2 / 4,6 (primeras 1.000 preguntas) | Apache 2.0 | Hugging Face |

La comparativa con `deepset/roberta-base-squad2` procede de la model card del autor, medida con el mismo código. Los datos de contexto y licencia de los modelos alternativos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo copia, no razona: la respuesta es siempre un fragmento continuo del pasaje. Preguntas cuya respuesta requiere combinar varias frases y la mayoría de preguntas de tipo "por qué" quedan fuera de su alcance.
- Es demasiado propenso a responder: el 52% de sus errores en el dev set son respuestas a preguntas sin respuesta, típicamente preguntas que reutilizan el enunciado del pasaje y cambian un detalle o invierten el significado.
- Rendimiento débil en preguntas "why" (F1 de 59) y en respuestas de diez o más palabras (F1 de 51), frente a un F1 de 85 en preguntas "how many".
- Documentos largos: leer un artículo completo en ventanas solapadas reduce el F1 entre 16 y 23 puntos con los ajustes por defecto, principalmente porque el modelo deja de abstenerse.
- Solo inglés y solo texto tipo Wikipedia: entrenado con párrafos de Wikipedia en minúsculas, sin pruebas en otros tipos de texto ni en otros idiomas.
- No debe usarse en dominios donde una respuesta errónea tenga consecuencias (médico, legal, financiero) sin revisión humana.
- Licencia Apache 2.0 para el modelo; el dataset SQuAD 2.0 se distribuye bajo CC BY-SA 4.0, lo que conviene revisar si se redistribuyen datos derivados.
- Requiere `transformers` 4.x: la versión 5 eliminó el pipeline `question-answering`.
- Repositorio con 24 descargas y 0 likes en el momento de la consulta; se trata de un proyecto académico sin validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ingsyling/distilbert-squad2
- Repositorio del proyecto (código, notebook de entrenamiento, evaluación y análisis de errores): https://github.com/Davidfaleye360/AI-Question-Answering-System
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset SQuAD 2.0: https://huggingface.co/datasets/rajpurkar/squad_v2
- Modelo de comparación citado: https://huggingface.co/deepset/roberta-base-squad2
