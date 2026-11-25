# Ingsyling/distilbert-squad2-distilled

## Resumen

`distilbert-squad2-distilled` es un modelo de respuesta extractiva de preguntas (extractive question answering) desarrollado por David Faleye bajo el identificador `Ingsyling`. Se trata de un fine-tuning de `distilbert-base-uncased` sobre el conjunto de datos SQuAD 2.0, en el que el estudiante aprende simultaneamente de las etiquetas correctas y de las puntuaciones de un modelo docente de mayor capacidad, `Ingsyling/deberta-v3-squad2` (184 M de parametros, 87,69 F1). El objetivo declarado es obtener un modelo mas preciso manteniendo el mismo tamano y velocidad del DistilBERT original.

El modelo resuelve una tarea acotada: dado un pasaje de texto y una pregunta, devuelve el fragmento continuo del pasaje que responde a la pregunta, o indica que no hay respuesta. No genera texto libre ni razona: extrae. Con 66,36 M de parametros y una ventana de 384 tokens por fragmento, esta pensado para entornos con recursos limitados donde el coste de inferencia y la latencia importan mas que la precision maxima.

Su relevancia actual es la de un caso de destilacion de conocimiento bien documentado y reproducible: el autor publica el codigo, la configuracion y el cuaderno de entrenamiento, y cuantifica con rigor la ganancia de la destilacion (+2,5 Exact Match y +2,4 F1 frente al mismo modelo entrenado solo con etiquetas). Es un experimento personal de curso (CSCI 390), no un modelo de produccion de un laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.364.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens por ventana, con 128 tokens de solapamiento entre ventanas |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un modelo de 66 M en safetensors fp32/fp16 es convertible a int8 y a GGUF con herramientas estandar, pero no se ha publicado ni verificado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer tipo DistilBERT: 6 capas, 12 cabezas de atencion, dimension oculta de 768 y 66 M de parametros, inicializado desde `distilbert-base-uncased`. Sobre la salida del encoder se aplica una cabeza de question answering que produce dos logits por token (inicio y fin del span), mas la posicion `[CLS]` como puntuacion de "sin respuesta". No hay decoder ni generacion autoregresiva.

El entrenamiento usa el conjunto de entrenamiento de SQuAD 2.0 (130.319 preguntas, 131.754 ventanas), con ventanas de 384 tokens y 128 de solapamiento, 2 epocas (16.470 pasos), batch de 16, learning rate 3e-5 con warm-up lineal en el 10% inicial y decaimiento lineal, weight decay 0,01, precision mixta fp16 y semilla 42. La innovacion tecnica es la destilacion: la perdida combina 0,5 x divergencia KL (temperatura 2) contra las distribuciones del docente y 0,5 x entropia cruzada contra la etiqueta correcta. Como DeBERTa-v3 y DistilBERT tokenizan distinto, las puntuaciones del docente se alinean por posicion de caracter: el docente lee exactamente el tramo de pasaje que cubre cada ventana del estudiante y cada wordpiece del estudiante hereda la puntuacion de inicio/fin del wordpiece docente que empieza o termina en el mismo caracter; los wordpieces sin correspondencia reciben una puntuacion muy baja. El docente se ejecuta una sola vez antes del entrenamiento y sus puntuaciones se reutilizan en las dos epocas. El acuerdo entre la eleccion top del docente tras el alineamiento y la etiqueta fue del 78,5% en 2.000 ventanas verificadas. Entrenamiento completo en una Tesla T4: 17 minutos para las puntuaciones del docente y 38 minutos de entrenamiento, con un maximo de 2,4 GB de VRAM.

## Capacidades

- Respuesta extractiva de preguntas en ingles: devuelve el span continuo del pasaje que responde a la pregunta.
- Deteccion de preguntas sin respuesta: mediante la puntuacion de la posicion `[CLS]`, con soporte de `handle_impossible_answer=True` en el pipeline de transformers.
- Manejo de pasajes largos mediante ventanas deslizantes de 384 tokens con solapamiento de 128.
- Integracion directa con el pipeline `question-answering` de transformers 4.x (la version 5 elimino dicho pipeline).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision ni audio.
- Multilingue: no; solo ingles.
- No dispone de modo thinking ni de generacion de texto libre.

## Casos de uso

- Extraccion de respuestas en buscadores documentales internos: indexar manuales o bases de conocimiento y, dado un pasaje recuperado por un sistema de retrieval, extraer el fragmento exacto que responde a la consulta del usuario. El modelo es adecuado por su bajo coste (66 M) y su capacidad de devolver "sin respuesta" cuando el pasaje no contiene la informacion.
- Enriquecimiento de pipelines RAG: como etapa final de extraccion tras un retriever, para convertir un chunk de documento en una respuesta corta y citables. Su ventana de 384 tokens encaja con chunks pequenos y su latencia es minima en CPU.
- Atencion al cliente sobre FAQ estaticas: dado un articulo de ayuda y la pregunta del cliente, devolver la frase concreta que la responde, con umbral de "sin respuesta" para derivar a un agente humano cuando el articulo no cubre el caso.
- Procesamiento por lotes en entornos sin GPU: al ocupar menos de 1 GB en fp32 y poder ejecutarse en CPU, sirve para extraer respuestas de grandes volumenes de pares pregunta-pasaje en pipelines offline.
- Etiquetado y validacion de datos de QA: usar el modelo como preanotador en la construccion de conjuntos de entrenamiento extractivos, revisando despues las extracciones de baja confianza.
- Evaluacion comparativa de tecnicas de destilacion: como referencia reproducible (codigo y configuracion publicados) para medir el efecto de un docente sobre un estudiante pequeno en tareas de span extraction.
- Filtrado de "sin respuesta" en moderacion de contenidos basada en documentos: detectar si un texto de politica cubre o no una consulta concreta antes de escalar el caso.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de validacion de SQuAD 2.0 (11.873 preguntas), con el umbral de "sin respuesta" por defecto. No verificados de forma independiente.

| Modelo | Exact Match | F1 | F1 respondibles | F1 no respondibles | Parametros |
|---|---|---|---|---|---|
| `distilbert-squad2-distilled` (este modelo) | 66,64 | 69,76 | 73,12 | 66,41 | 66 M |
| `Ingsyling/distilbert-squad2` (mismo modelo sin docente) | 64,14 | 67,38 | 72,17 | 62,59 | 66 M |
| `deepset/roberta-base-squad2` | 79,90 | 82,91 | 84,01 | 81,82 | 124 M |
| `Ingsyling/deberta-v3-squad2` (docente) | 84,86 | 87,69 | 89,02 | 86,36 | 184 M |

Desglose del modelo por subconjunto: respondibles (5.928 preguntas) 66,87 Exact Match y 73,12 F1; no respondibles (5.945 preguntas) 66,41 Exact Match y 66,41 F1. La destilacion aporta +2,5 Exact Match y +2,4 F1 frente al mismo modelo entrenado solo con etiquetas, concentrado en las preguntas sin respuesta (+3,8 F1) frente a las respondibles (+1,0 F1). Cierra el 15% de la brecha con RoBERTa (de 15,5 a 13,2 puntos de F1). Con un umbral de "sin respuesta" de -1,95, el F1 sube de 69,76 a 70,43 (umbral elegido y evaluado en mitades distintas del conjunto de validacion).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (66 M de parametros); el autor reporta un maximo de 2,4 GB de VRAM durante el entrenamiento en fp16 con batch 16.
- GPU recomendadas: cualquier GPU con al menos 2 GB, incluida una Tesla T4. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, GTX 1650) e incluso en CPU sin problemas.
- Opciones de despliegue: pipeline `question-answering` de transformers 4.x, inferencia directa con PyTorch, ONNX Runtime; vLLM, llama.cpp, Ollama y TGI no estan documentados para este modelo por parte del autor.
- Latencia y throughput: no disponible de forma medida; el autor solo reporta tiempos de entrenamiento (38 minutos en T4), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 SQuAD 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `distilbert-squad2-distilled` | 66 M | 384 tokens por ventana | 69,76 | apache-2.0 | Hugging Face |
| `Ingsyling/distilbert-squad2` | 66 M | 384 tokens por ventana | 67,38 | no disponible en la informacion proporcionada | Hugging Face |
| `deepset/roberta-base-squad2` | 124 M | 512 tokens | 82,91 | no disponible en la informacion proporcionada | Hugging Face |
| `Ingsyling/deberta-v3-squad2` (docente) | 184 M | no disponible en la informacion proporcionada | 87,69 | no disponible en la informacion proporcionada | Hugging Face |

La comparativa se limita a los modelos medidos por el autor con el mismo codigo de evaluacion. Frente a RoBERTa-base queda 13,2 puntos de F1 por debajo con la mitad de parametros; frente a su docente, 17,9 puntos por debajo.

## Limitaciones y advertencias

- Copia, no razona: la respuesta es siempre un fragmento continuo del pasaje; no puede sintetizar, parafrasear ni combinar informacion de varias partes.
- Precision muy inferior a su docente (17,9 F1 menos) y a RoBERTa (13,2 F1 menos); la destilacion reduce la brecha pero no iguala a modelos de mayor tamano.
- El umbral de "sin respuesta" por defecto es demasiado permisivo: exige superar la puntuacion de `[CLS]` en aproximadamente 1,95 para mejorar el F1 de 69,76 a 70,43, y el pipeline de ejemplo no aplica umbral alguno.
- El docente se entreno sobre las mismas preguntas, lo que puede inflar la senal de destilacion y no garantiza la misma ganancia en dominios distintos de SQuAD.
- Solo ingles: no soporta consultas ni pasajes en castellano ni en otros idiomas.
- Ventana efectiva de 384 tokens por fragmento: pasajes mas largos requieren fragmentacion con solapamiento, con el riesgo de partir la respuesta entre ventanas.
- Riesgo de alucinacion estructural bajo (no genera texto), pero riesgo de extraer un span incorrecto con alta confianza cuando el pasaje es ambiguo o la pregunta es de tipo inferencial.
- Sesgos: no documentados por el autor; al entrenarse solo con SQuAD 2.0 (Wikipedia en ingles) hereda la distribucion y los sesgos de esa fuente.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; es un experimento personal sin validacion independiente.
- Dependencia de transformers 4.x: la version 5 elimina el pipeline `question-answering`, lo que rompe el ejemplo de uso documentado.
- Sin resultados de benchmarks verificados de forma independiente (`verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ingsyling/distilbert-squad2-distilled
- Modelo sin destilacion (linea base): https://huggingface.co/Ingsyling/distilbert-squad2
- Modelo docente DeBERTa-v3: https://huggingface.co/Ingsyling/deberta-v3-squad2
- Codigo, configuracion y cuaderno de entrenamiento: https://github.com/Davidfaleye360/qa-experiments
- Dataset SQuAD 2.0: https://huggingface.co/datasets/rajpurkar/squad_v2
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Modelo de referencia RoBERTa: https://huggingface.co/deepset/roberta-base-squad2
