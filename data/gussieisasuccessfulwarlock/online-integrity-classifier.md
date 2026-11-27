# gussieIsASuccessfulWarlock/online-integrity-classifier

## Resumen

El Online Integrity Classifier es un modelo de clasificación de texto desarrollado por el usuario de Hugging Face gussieIsASuccessfulWarlock. Se trata de un destilado (student) del modelo jhu-clsp/ettin-encoder-400m, un encoder de arquitectura ModernBERT de 400 millones de parámetros, al que se le añaden cinco cabezas de clasificación independientes con softmax para etiquetar respuestas de foros en cinco dimensiones: intención, estilo, daño, calidad y tono. El modelo está pensado para moderación de comunidades online y priorización de respuestas susceptibles de revisión humana.

El problema que aborda es la necesidad de señales automáticas de integridad en foros: detección de spam, identificación de escritura con estilo de IA, evaluación del tono y la calidad de una respuesta, y estimación de daño potencial. El modelo recibe como entrada un contexto (comunidad, título del hilo y comentario al que se responde) junto con la respuesta a evaluar, y devuelve una etiqueta primaria por cada una de las cinco dimensiones.

Es relevante por su enfoque multi-cabeza sobre un encoder eficiente, su proceso de destilación desde un modelo profesor y su rendimiento medido en throughput (217,2 filas/s en BF16 con batch de 64). Está entrenado y evaluado exclusivamente en inglés sobre datos de Reddit, con 394.839.096 parámetros y una ventana de truncado de 384 tokens para el par contexto-respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (Ettin 400M) con masked mean pooling y cinco cabezas softmax independientes |
| Parametros totales | 394.839.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens para el par contexto-respuesta (truncado por el tokenizador) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible (el encoder base es MIT, pero la licencia del modelo derivado no se especifica) |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El modelo parte del encoder jhu-clsp/ettin-encoder-400m, un transformer tipo ModernBERT de 400 millones de parametros, y le añade masked mean pooling sobre las representaciones del encoder. Sobre esa representacion pooled se aplican cinco cabezas de clasificacion independientes con activacion softmax, una por cada dimension: intent, style, harm, quality y tone. El modelo se distribuye con un loader propio (`inference.py`) que restaura el encoder y las cinco cabezas.

El entrenamiento es una destilacion desde un modelo profesor: el student se entreno sobre las distribuciones de etiquetas suaves del profesor para 61.097 ejemplos. La validacion uso 3.088 ejemplos sin solapamiento de hilos con el conjunto de entrenamiento. El criterio de publicacion exigia al menos un 70 % de acuerdo top-1 con el profesor en las cinco cabezas, umbral que se supero en todas ellas. El corpus de entrenamiento y evaluacion son respuestas de Reddit, y el formato de entrada reproduce la estructura de un hilo (comunidad o subreddit, titulo del post, comentario padre y respuesta).

## Capacidades

- Clasificacion multi-dimension de respuestas de foro en cinco cabezas: intencion, estilo, dano, calidad y tono.
- Deteccion de spam mediante la cabeza de estilo e intencion.
- Identificacion de escritura con estilo de IA (`ai_like`) como categoria estilistica, no como prueba de autoria.
- Evaluacion de dano potencial en una respuesta para priorizar revision.
- Estimacion de calidad y tono de una respuesta en contexto.
- Procesamiento de contexto conversacional: comunidad, titulo del hilo y comentario padre junto con la respuesta.
- Salida de etiqueta primaria por cabeza y, presumiblemente, distribucion completa (el vocabulario de etiquetas esta en `info.json`).
- Inferencia en CPU y GPU mediante el loader incluido.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es un clasificador puro.

## Casos de uso

- Moderacion asistida de foros y comunidades: el modelo etiqueta cada respuesta en cinco dimensiones y permite priorizar para revision humana aquellas con senales de spam, dano o baja calidad, reduciendo la carga de los moderadores.
- Deteccion de spam en hilos de discusion: la cabeza de estilo e intencion permite filtrar respuestas promocionales o no solicitadas en comunidades tematicas como jardinería, tecnologia o salud.
- Priorizacion de contenido potencialmente danino: la cabeza de harm, con un 97,7 % de acuerdo con el profesor en validacion, sirve como primera pasada para escalar respuestas a revision humana en flujos de moderacion.
- Analisis de calidad de respuestas en comunidades de soporte: la cabeza de quality permite identificar respuestas utiles frente a respuestas vagas o incorrectas en foros de ayuda tecnica o de salud.
- Monitorizacion de estilo de escritura con IA: la etiqueta `ai_like` puede usarse para estudiar la prevalencia de texto generado en comunidades, siempre con la cautela de que mide estilo y no autoria.
- Investigacion sobre dinamicas de comunidades online: el modelo permite anotar grandes volumenes de respuestas (217,2 filas/s en BF16) para estudios cuantitativos sobre tono, calidad y spam en Reddit.
- Filtrado previo en pipelines de anotacion: como clasificador rapido y ligero, puede pre-etiquetar datos antes de una anotacion humana mas costosa, con el 70 %+ de acuerdo con el profesor como garantia de calidad relativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta unicamente el acuerdo top-1 con el modelo profesor en el conjunto de validacion:

| Cabeza | Acuerdo en validacion (top-1) |
|---|---:|
| Intent | 72,4 % |
| Style | 78,2 % |
| Harm | 97,7 % |
| Quality | 80,9 % |
| Tone | 94,7 % |

Ademas, se midio un throughput de 217,2 filas/s sobre 16.384 filas con batch de 64 en la GPU de entrenamiento usando autocast BF16.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 0,8 GB solo para pesos (394,8 M de parametros), mas overhead de activaciones; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en FP32: aproximadamente 1,6 GB para pesos, mas activaciones.
- GPU recomendadas: cualquier GPU moderna; el autor midio throughput en la GPU de entrenamiento (no especificada). Una RTX 4090, A100 o H100 ofreceran el maximo rendimiento en BF16.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 4 GB de VRAM; tambien funciona en CPU segun el ejemplo del autor (`device="cpu"`).
- Opciones de despliegue: el repositorio incluye un loader propio (`inference.py`) basado en `torch`, `transformers>=4.48` y `safetensors`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un encoder de clasificacion, el despliegue tipico seria con PyTorch nativo o con un servidor de inferencia tipo TorchServe/Triton.
- Latencia y throughput: 217,2 filas/s con batch de 64 en BF16 sobre la GPU de entrenamiento (16.384 filas medidas).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, el modelo se basa en jhu-clsp/ettin-encoder-400m (MIT), pero no se aportan datos de rendimiento de alternativas de clasificacion de integridad en foros.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Online Integrity Classifier | 394,8 M | 384 tokens | Clasificacion multi-cabeza de respuestas de foro | No disponible |
| jhu-clsp/ettin-encoder-400m (base) | ~400 M | No disponible | Encoder general | MIT |
| Alternativas de clasificacion de moderacion | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- Las metricas reportadas miden acuerdo top-1 con el modelo profesor, no precision real frente a etiquetas humanas; el student puede heredar los errores del profesor.
- Puede heredar los sesgos del corpus de entrenamiento (respuestas de Reddit), incluyendo sesgos demograficos, culturales y de estilo de escritura.
- La etiqueta `ai_like` mide una categoria estilistica y no puede establecer quien escribio una respuesta; usarla como prueba de autoria es un error.
- Para decisiones de moderacion con consecuencias reales se recomienda revision humana; el propio autor lo advierte.
- La licencia del modelo derivado no esta especificada, aunque el encoder base es MIT; conviene verificar los terminos antes de uso comercial.
- El contexto se trunca a 384 tokens para el par contexto-respuesta, lo que limita el analisis de hilos con comentarios largos.
- El modelo se entreno con el formato de entrada de Reddit (subreddit, titulo, comentario padre); usarlo con otros formatos de foro puede degradar el rendimiento.
- No se han publicado variantes cuantizadas (GGUF, etc.) ni benchmarks estandar, lo que dificulta comparaciones objetivas con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gussieIsASuccessfulWarlock/online-integrity-classifier
- Modelo base (Ettin 400M): https://huggingface.co/jhu-clsp/ettin-encoder-400m
