# q-project/N-Q-26M-JEV

## Resumen

N-Q-26M-JEV es un modelo de decisión ultracompacto desarrollado por q-project, derivado de su modelo conversacional N-Q-26M-Chat. En lugar de generar texto, el modelo lee un estado (texto arbitrario), una pregunta y una lista de opciones, y devuelve una distribución de probabilidad calibrada sobre esas opciones en una sola pasada hacia delante. Ofrece tres primitivas: `choice` (elección entre opciones), `score` (nivel en una escala ordenada de 2 a 10 niveles) y `noul` (probabilidad de sí/no).

Su relevancia reside en la eficiencia extrema: con unos 29,7M de parámetros neuronales más 16,8M de parámetros n-gram (46,45M totales según safetensors), funciona como clasificador rápido y barato para familias de tareas concretas (relevancia de respuestas, clasificación de temas, toxicidad, sentimiento) en ruso e inglés. La model card es explícita en que se trata de una release de investigación: en tareas vistas durante el entrenamiento está bien calibrado, pero ante tipos de preguntas nuevos rinde cerca del azar, por lo que no debe tratarse como un razonador general.

La arquitectura combina Gated DeltaNet con atención con gating, heredada del modelo base, más una cabeza de decisión lineal. Se mantiene la cabeza del modelo de lenguaje, de modo que el checkpoint puede seguir generando texto. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors con código personalizado (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet + gated attention (híbrido SSM/attention), con cabeza de decisión lineal (nq4, custom code) |
| Parametros totales | 46.453.084 (29,7M neuronales + 16,8M n-gram según la model card) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de N-Q-26M-Chat (arquitectura híbrida Gated DeltaNet + gated attention, de estilo SSM lineal combinado con atención) al que se añade una cabeza de decisión lineal. La cabeza lee el estado oculto en el token `<R11>` que cierra cada opción, siguiendo el formato de entrada `<bos><USER>estado<EOT><R12>pregunta<R11>opcion_1<R11>...opcion_K<R11>`. Dado que el backbone es causal, en una sola pasada las opciones posteriores ven las anteriores; por ello el modo por defecto `symmetric=True` puntúa también las opciones en orden inverso y promedia, mientras que `symmetric=False` realiza una pasada estrictamente única.

El entrenamiento consiste en un fine-tune completo con log-loss sobre las opciones, una regla de puntuación propia que es lo que mantiene las probabilidades calibradas. Los datasets empleados cubren preferencias y calidad de respuestas (IlyaGusev/saiga_scored, IlyaGusev/saiga_preferences, HuggingFaceH4/ultrafeedback_binarized), inferencia lingüística (facebook/xnli), sentimiento (MonoHime/ru_sentiment_dataset, stanfordnlp/sst2), toxicidad en ruso (s-nlp/ru_paradetox_toxicity) y clasificación de noticias (fancyzhx/ag_news). No se detallan cifras de tokens totales ni uso de RLHF/DPO en la información disponible.

## Capacidades

- Clasificación de elección (`choice`): dada una pregunta y K opciones, devuelve la opción elegida, la distribución completa y la confianza, en una pasada.
- Puntuación ordinal (`score`): asigna un nivel en escalas ordenadas de 2 a 10 niveles (por ejemplo, dificultad fácil/medio/difícil), con distribución de probabilidad.
- Respuesta binaria (`noul`): devuelve P(sí) para preguntas de sí/no, útil para verificar si una respuesta responde a una pregunta.
- Procesamiento por lotes: todas las preguntas sobre un mismo estado se ejecutan como un único batch, y cada pregunta solo ve el estado y a sí misma.
- Salidas calibradas: ECE muy bajo (0,005–0,055) en las tareas de entrenamiento, lo que permite usar las probabilidades directamente como umbral de confianza.
- Generación de texto: se conserva la cabeza del modelo de lenguaje del checkpoint base, por lo que puede seguir usándose como LM pequeño.
- Clasificación de texto multilingüe limitada a ruso e inglés (temas, sentimiento, toxicidad, inferencia).
- No soporta (según la propia model card) razonamiento general, conocimiento del mundo ni tareas zero-shot fuera de sus familias de entrenamiento.

## Casos de uso

- Filtrado de calidad en pipelines RAG o de chat: con `noul` se puede verificar en una pasada (P(sí) de 0,988 frente a 0,014 en los ejemplos de la model card) si una respuesta candidata responde realmente a la pregunta del usuario, descartando respuestas irrelevantes antes de mostrarlas.
- Enrutado de peticiones en sistemas multiagente: la primitiva `choice` permite clasificar la intención de una petición entre hasta 6 temas ofrecidos (81,1% de precisión en 24 temas reales) y dirigirla al agente o modelo adecuado, con un coste computacional mínimo.
- Estimación de dificultad para orquestadores: con `score` se puede etiquetar una petición como fácil/medio/difícil y decidir si resolverla localmente con un modelo pequeño o escalarla a un modelo mayor (precisión del 69,4%, con cuidado al interpretar).
- Moderación de contenido en ruso: detección de toxicidad binaria con 80% de precisión y ECE de 0,052, adecuada como primer filtro barato antes de un moderador más pesado.
- Análisis de sentimiento multilingüe: clasificación en ruso (3 clases) e inglés (2 clases) con 78,1% de precisión, útil para monitorización de reseñas o feedback de usuarios, aunque con fallos documentados en quejas complejas.
- Clasificación de noticias: 88,8% de precisión en AG News (4 clases), aplicable a categorización automática de titulares o feeds.
- Selección de la mejor respuesta entre candidatas: identificar cuál de 4 respuestas responde a la pregunta (99,0% de precisión), útil en reranking ligero de candidatos generados por un modelo mayor.
- Evaluación automática de calidad de respuestas: etiquetado malo/aceptable/excelente (56,6% de precisión, cerca del azar), solo recomendable como señal auxiliar y no como veredicto final.

## Benchmarks y rendimiento

Resultados publicados por el autor en splits de test reservados, en modo simétrico. ECE = expected calibration error (0 = confianza idéntica a precisión).

| Tarea | Opciones | Precisión | ECE | Azar / mayoría |
|---|---|---|---|---|
| ¿Responde esta réplica a la pregunta? (sí/no) | 2 | 98,2% | 0,010 | 50% |
| ¿Cuál de 4 réplicas responde a la pregunta? | 4 | 99,0% | 0,005 | 25% |
| Tema de noticia (AG News) | 4 | 88,8% | 0,017 | 25% |
| Tema de la petición (24 temas, 6 ofrecidos) | 6 | 81,1% | 0,029 | 17% |
| Toxicidad, ruso (sí/no) | 2 | 80,0% | 0,052 | 50% |
| Sentimiento (RU 3 clases + EN 2 clases) | 2–3 | 78,1% | 0,033 | ~40% |
| Dificultad de la petición fácil/medio/difícil | 3 | 69,4% | 0,028 | 63% (siempre "medio") |
| ¿Cuál de dos respuestas es mejor? | 2 | 68,7% | 0,055 | 50% |
| Entailment / neutral / contradicción (XNLI RU+EN) | 3 | 64,5% | 0,026 | 33% |
| Calidad de respuesta malo/aceptable/excelente | 3 | 56,6% | 0,042 | 33% |

Tareas zero-shot nunca vistas en entrenamiento:

| Tarea | Opciones | Precisión | Azar |
|---|---|---|---|
| Emociones (EN, dair-ai/emotion) | 6 | 29,9% | 17% (clase mayoritaria 35%) |
| ruOpenBookQA (MERA) | 4 | 26,3% | 25% |
| PARus, causa/efecto (MERA) | 2 | 49,0% | 50% |

No hay comparativas publicadas frente a otros modelos (BERT, DeBERTa, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 46,45M de parámetros en fp32 el modelo ocupa del orden de 0,2 GB, y el repo completo pesa 0,3 GB, por lo que funciona con holgura en CPU y en cualquier GPU moderna.
- GPU recomendadas: ninguna en particular; cualquier GPU de consumo (incluso integradas o GTX 1050) es suficiente. No se requieren A100 ni H100.
- Consumer GPU: cabe sin problema en cualquier GPU de consumo; también es plenamente viable inferencia en CPU dado el tamaño.
- Opciones de despliegue: integración directa con `transformers` vía `AutoModel`/`AutoTokenizer` con `trust_remote_code=True` (no se mencionan soporte explícito de vLLM, llama.cpp, Ollama o TGI; el código personalizado y la arquitectura nq4 hacen probable que solo funcione con transformers).
- Latencia y throughput: no disponibles como cifras publicadas; el diseño de decisión en una sola pasada (o dos con modo simétrico) y el tamaño de 26M apuntan a latencias de milisegundos, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| N-Q-26M-JEV (este modelo) | 46,45M (29,7M + 16,8M n-gram) | Decisión/calificación calibrada (choice/score/sí-no) | no disponible | Apache 2.0 | RU+EN, salida probabilística en una pasada |
| N-Q-26M-Chat (modelo base) | ~26M-class | Generación de texto conversacional | no disponible | no disponible | Mismo backbone, sin cabeza de decisión |
| BERT-base | 110M | Clasificación de texto general | 512 tokens | Apache 2.0 | Requiere fine-tune por tarea y cabeza específica; sin calibración garantizada |
| DeBERTa-v3-xsmall | 22M (70M con embeddings) | Clasificación de texto general | 512 tokens | MIT | Tamaño comparable, pero orientado a clasificación estándar, no a decisiones con opciones dinámicas |

No hay datos de rendimiento comparativo directo publicados; la comparación es cualitativa por categoría de tamaño y tarea.

## Limitaciones y advertencias

- Falta de generalización: la propia model card advierte de que en tipos de preguntas nuevos el modelo rinde cerca del azar (29,9% en emociones, 26,3% en ruOpenBookQA, 49,0% en PARus). Es un clasificador para las familias de tareas entrenadas, no un razonador general.
- Riesgo de alucinación: aplicable solo en modo generación (conserva la cabeza LM); como clasificador no genera texto, pero sus probabilidades solo son fiables dentro de las tareas de entrenamiento.
- Datos de sentimiento ruidosos: fallo documentado en el que una queja claramente negativa ("Доставили не тот размер...") se clasifica como neutral (0,59) frente a negativa (0,36), por el ruido del dataset de sentimiento ruso.
- Tareas de conocimiento y razonamiento fuera de alcance: OpenBookQA y PARus quedan cerca del azar a este tamaño de modelo.
- Tarea de dificultad poco fiable: 69,4% de precisión frente a un 63% de la heurística "siempre medio", por lo que aporta poco valor real en ese uso.
- Sesgos: no documentados explícitamente, pero los datasets de entrenamiento (ultrafeedback, saiga, datasets de toxicidad y sentimiento) pueden arrastrar sus sesgos conocidos hacia contenido en inglés y patrones lingüísticos concretos.
- Idiomas: limitado a ruso e inglés; no hay soporte declarado para castellano u otras lenguas.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repo; conviene revisarlo antes de usar en producción.
- Licencia: Apache 2.0, sin restricciones para uso comercial.
- Es una release de investigación, no un producto, según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q-project/N-Q-26M-JEV
- Modelo base: https://huggingface.co/q-project/N-Q-26M-Chat
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/IlyaGusev/saiga_scored
  - https://huggingface.co/datasets/IlyaGusev/saiga_preferences
  - https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
  - https://huggingface.co/datasets/facebook/xnli
  - https://huggingface.co/datasets/MonoHime/ru_sentiment_dataset
  - https://huggingface.co/datasets/stanfordnlp/sst2
  - https://huggingface.co/datasets/s-nlp/ru_paradetox_toxicity
  - https://huggingface.co/datasets/fancyzhx/ag_news
- Paper, repositorio de código y demo: no disponibles en la información proporcionada.
