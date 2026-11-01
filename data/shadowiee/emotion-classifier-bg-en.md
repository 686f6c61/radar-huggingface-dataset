# Shadowiee/emotion-classifier-bg-en

## Resumen

`emotion-classifier-bg-en` es un clasificador de emociones en ingles desarrollado por el usuario Shadowiee en el marco de un proyecto academico de segundo curso del grado en Applied Data Science and Artificial Intelligence de la Breda University of Applied Sciences (BUas), realizado para un cliente denominado Content Intelligence Agency (CIA). El modelo parte de `FacebookAI/roberta-large` y se ha ajustado de forma completa (full fine-tuning) para asignar una de siete emociones a lineas de dialogo procedentes de programas de telerrealidad bulgaros traducidas al ingles.

La tarea concreta es la clasificacion de emociones a nivel de linea con contexto conversacional: el modelo recibe la linea a clasificar junto con hasta cinco lineas anteriores del mismo episodio, con un limite de 256 tokens y truncado por la izquierda, de modo que se descarta primero el contexto mas antiguo. Las etiquetas de salida son siete: anger, disgust, fear, happiness, neutral, sadness y surprise.

Es relevante como ejemplo de adaptacion de un encoder tipo RoBERTa a un dominio muy especifico (dialogo de telerrealidad traducido) con etiquetado generado por un pipeline de LLM, y por documentar de forma transparente sus metricas reales: macro-F1 de 0,572 sobre el conjunto de validacion del cliente y de 0,504 sobre un episodio de test en bulgaro. No es un modelo de proposito general ni un modelo generativo, sino un clasificador de texto de tamano medio con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (transformer encoder) con cabeza de clasificacion de secuencias |
| Parametros totales | 355.366.919 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado por la izquierda) |
| Tipos de cuantizacion | no disponible (el autor recomienda cargar en `float32`) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `roberta-large` completamente ajustado para clasificacion de secuencias (`AutoModelForSequenceClassification`). RoBERTa-large es un transformer encoder de 24 capas y 355 millones de parametros, con embeddings posicionales absolutos y atencion bidireccional completa; la cabeza de clasificacion proyecta la representacion del token especial `<s>` a siete logits, uno por emocion.

El ajuste se realizo sobre 19.308 lineas procedentes de episodios de television de otros grupos del proyecto, etiquetadas por el pipeline de LLM de la agencia cliente, no por anotacion humana directa. El formato de entrada combina contexto y linea objetivo (`Earlier lines:\n<lineas anteriores>\nLine: <linea>`), con hasta cinco lineas previas y un maximo de 256 tokens. La model card no detalla hiperparametros de entrenamiento, numero de epocas, tasa de aprendizaje ni si hubo balanceo de clases; esa informacion solo podria estar en la model card extendida del repositorio de GitHub del proyecto. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador discriminativo.

## Capacidades

- Clasificacion de texto en siete emociones: anger, disgust, fear, happiness, neutral, sadness y surprise.
- Clasificacion contextual a nivel de linea: incorpora hasta cinco lineas anteriores del dialogo para desambiguar la emocion de la linea objetivo.
- Procesamiento de entradas de hasta 256 tokens con truncado por la izquierda, priorizando la linea objetivo y el contexto mas reciente.
- Devuelve logits y probabilidades por clase (via softmax), lo que permite umbrales y analisis de confianza.
- No soporta tool calling ni function calling.
- No es un modelo generativo: no produce texto libre ni razonamiento multi-paso.
- No tiene modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles; el propio nombre del modelo sugiere uso sobre traducciones al ingles de material en bulgaro, pero el idioma declarado es unicamente `en`.

## Casos de uso

- Analisis de audiencia en telerrealidad: clasificar las lineas de un episodio para medir la distribucion de emociones por escena, personaje o segmento, aprovechando el contexto de hasta cinco lineas previas para reducir ambiguedad.
- Etiquetado asistido de corpus de dialogo: preanotar grandes volumenes de subtitulos o transcripciones traducidas al ingles y reservar la revision humana para los casos de baja confianza, dado que el modelo expone probabilidades por clase.
- Investigacion en analisis de sentimiento y emociones: servir como linea base reproducible (licencia MIT, pesos safetensors) para comparar con clasificadores multilingues o con LLM generativos en la misma tarea.
- Monitorizacion de contenido: detectar segmentos con alta concentracion de emociones negativas (anger, disgust, fear) en material audiovisual para revision editorial o moderacion.
- Segmentacion y resumen de episodios: usar la secuencia de emociones por linea como senal para dividir un episodio en arcos narrativos o generar resumenes estructurados.
- Docencia y proyectos academicos: ejemplo completo de fine-tuning de RoBERTa-large con evaluacion honesta y model card detallada, reutilizable como plantilla en asignaturas de NLP aplicado.
- Integracion en pipelines de contenido: clasificacion por lotes en CPU o GPU pequena dentro de un ETL de medios, dado el reducido coste de inferencia de un encoder de 355 millones de parametros.

## Benchmarks y rendimiento

| Metrica | Conjunto | Resultado |
|---|---|---|
| Macro-F1 | Validacion CIA (4.541 lineas) | 0,572 |
| Macro-F1 | Episodio de test en bulgaro (917 lineas) | 0,504 |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, GLUE, GoEmotions u otros) ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada en `float32`: aproximadamente 1,4 GB de pesos, mas activaciones y overhead; en la practica cabe en cualquier GPU con 4 GB o mas.
- VRAM estimada en `float16`/`bfloat16`: en torno a 0,7 GB de pesos; el autor advierte que Transformers 5 conserva el dtype del checkpoint, por lo que recomienda forzar `dtype=torch.float32` si se busca el comportamiento original.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia por lotes de tamano moderado. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (metodo documentado por el autor), exportacion a ONNX Runtime, TorchScript o integracion en servicios tipo FastAPI. vLLM y TGI estan orientados a modelos generativos y no son la via natural para este clasificador; llama.cpp y Ollama tampoco ofrecen soporte directo para esta arquitectura de clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en milisegundos por lote en GPU y decenas de milisegundos por lote en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emotion-classifier-bg-en | 355 M | 256 tokens | 7 emociones, dominio telerrealidad EN | MIT | HuggingFace |
| `FacebookAI/roberta-large` | 355 M | 512 tokens | Encoder base, sin cabeza de emociones | MIT | HuggingFace |
| `j-hartmann/emotion-english-distilroberta-base` | ~82 M | 512 tokens | 7 emociones, texto general EN | MIT | HuggingFace |
| `SamLowe/roberta-base-go_emotions` | ~125 M | 512 tokens | 28 emociones (GoEmotions) | MIT | HuggingFace |

No se dispone de resultados comparativos directos entre estos modelos y `emotion-classifier-bg-en` en el mismo conjunto de evaluacion, por lo que la comparacion se limita a parametros, contexto, taxonomia y licencia.

## Limitaciones y advertencias

- Rendimiento moderado: macro-F1 de 0,572 en validacion y 0,504 en test indica una capacidad discriminativa limitada, especialmente en clases minoritarias o emociones sutiles.
- Dominio muy restringido: entrenado exclusivamente con lineas de telerrealidad bulgara traducida al ingles; el rendimiento fuera de ese registro (texto tecnico, legal, conversacional general) no esta caracterizado.
- Etiquetas generadas por LLM: el corpus de entrenamiento fue anotado por el pipeline de la agencia cliente, no por anotadores humanos, lo que puede propagar sesgos y errores sistematicos del etiquetador automatico.
- Idioma: solo se declara soporte para ingles; el uso sobre texto en bulgaro original no esta validado, pese a que el conjunto de test sea un episodio en bulgaro (probablemente traducido).
- Ventana de contexto corta: 256 tokens con truncado por la izquierda implican perdida de contexto en dialogos largos o lineas extensas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede asignar con alta confianza una emocion incorrecta en entradas fuera de distribucion; conviene usar umbrales sobre la probabilidad maxima.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos derivados del genero televisivo y de la traduccion automatica del material original.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; el uso en produccion critica requiere evaluacion propia.
- Dependencia de version: el autor advierte sobre el cambio de comportamiento de dtype en Transformers 5, lo que puede alterar resultados si no se fija `float32`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shadowiee/emotion-classifier-bg-en
- Model card extendida (datos, evaluacion, limitaciones, etica): https://github.com/BredaUniversityADSAI/2026-27a-fai2-adsai-Group-1/blob/main/task11/model_card.md
- Repositorio del proyecto academico: https://github.com/BredaUniversityADSAI/2026-27a-fai2-adsai-Group-1
- Modelo base: https://huggingface.co/FacebookAI/roberta-large
