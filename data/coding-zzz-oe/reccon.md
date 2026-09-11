# coding-zzz-oe/RECCON

## Resumen

RECCON (Recognizing Emotion Cause in CONversations) es un modelo de extraccion de causas emocionales en conversaciones, publicado en HuggingFace por el usuario `coding-zzz-oe`. Su tarea es de question answering extractivo: dado un enunciado y una emocion etiquetada, devuelve el fragmento exacto de texto (el "trigger") que provoca esa emocion. Se apoya en un encoder tipo BERT, concretamente en SpanBERT, y se ha entrenado sobre el corpus RECCON derivado de DailyDialog.

El modelo resuelve un problema especifico dentro del analisis conversacional: no se limita a clasificar la emocion de un turno, sino que localiza la evidencia textual que la justifica. Esto es util para sistemas de analisis psicologico, moderacion de contenido, evaluacion de agentes conversacionales y anotacion semiautomatica de corpus. El repositorio incluye ademas un `handler.py` pensado para desplegar el modelo como endpoint de inferencia con una API propia.

Con 107.721.218 parametros (en torno a 0,4 GB de repositorio) es un modelo compacto, desplegable en hardware modesto. La informacion disponible no incluye licencia declarada, resultados de benchmarks ni detalles de la composicion exacta del dataset de entrenamiento, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT (SpanBERT, segun la model card; el handler menciona RoBERTa de forma contradictoria) |
| Parametros totales | 107.721.218 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos en precision completa en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo base es SpanBERT "without context", un encoder transformer de tipo BERT con atencion bidireccional completa, adaptado a tareas de extraccion de spans. La cabecera es de question answering extractivo: el modelo predice logits de inicio y fin sobre la secuencia de entrada. El `handler.py` describe el pipeline en tres pasos: preprocesado (formateo del par utterance/emotion como pregunta-respuesta), inferencia sobre los logits de start y end, y postprocesado (extraccion del mejor span, filtrado de stopwords, verificacion de que el trigger es subcadena valida del texto original y deduplicacion de spans solapados). Hay una inconsistencia no resuelta en la documentacion: la model card cita SpanBERT mientras que la descripcion del handler cita RoBERTa.

El entrenamiento se realizo sobre el dataset RECCON, derivado de DailyDialog, descrito en el articulo "Recognizing Emotion Cause in Conversations" (Poria et al., 2021). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplicaron tecnicas de ajuste adicionales como RLHF o DPO. Tampoco se detallan innovaciones tecnicas mas alla del enfoque extractivo y del postprocesado heuristico descrito en el handler.

## Capacidades

- Extraccion de triggers emocionales: identifica el fragmento exacto de texto que provoca una emocion etiquetada, con un limite orientativo de 8 palabras por trigger.
- Question answering extractivo: formula la tarea como una pregunta ("extrae la frase corta exacta que mas fuertemente senala la emocion {emotion}...") y devuelve un span del texto de entrada.
- Procesamiento por lotes: la API del endpoint admite entrada individual o listas de objetos utterance/emotion.
- Filtrado y depuracion de resultados: elimina stopwords, comprueba que el span es subcadena del original y deduplica triggers solapados.
- Integracion con Hugging Face Inference Endpoints mediante un handler personalizado y fichero de dependencias incluido.
- Idioma: unicamente ingles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Analisis psicologico y terapeutico asistido: dado un turno de conversacion etiquetado con una emocion negativa, el modelo localiza la frase concreta que la desencadena, lo que permite a un profesional o a un sistema de triaje identificar el foco del malestar sin leer el historial completo.
- Anotacion semiautomatica de corpus conversacionales: el modelo genera propuestas de spans causales que un anotador humano revisa, reduciendo el coste de construir datasets de causa emocional en ingles.
- Evaluacion de agentes conversacionales: en un pipeline de QA de chatbots, se comprueba si las respuestas del agente reconocen correctamente la causa de la emocion del usuario comparando el trigger detectado con la justificacion esperada.
- Moderacion y salud comunitaria: en foros o plataformas de soporte, la deteccion del desencadenante textual concreto ayuda a enrutar casos hacia recursos de ayuda y a priorizar revisiones humanas.
- Analisis de voz del cliente en atencion al cliente: a partir de transcripciones de llamadas o chats en ingles, se extraen los fragmentos que explican la frustracion o satisfaccion, alimentando informes agregados de calidad.
- Investigacion en linguistica computacional: el modelo sirve como linea base reproducible para experimentos de causa emocional, ya que se apoya en un dataset publico (RECCON) y un backbone estandar.
- Enriquecimiento de sistemas de recomendacion o CRM: los triggers extraidos pueden etiquetarse y agregarse para segmentar clientes segun los motivos recurrentes de insatisfaccion.
- Preprocesado para generacion empatica: la salida del modelo se puede inyectar como contexto en un generador de respuestas, de modo que la respuesta del sistema cite el motivo real de la emocion detectada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (F1 de span, exact match ni comparaciones con otras arquitecturas) y los resultados de busqueda web recuperados no aportan datos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 107,7 millones de parametros, los pesos ocupan aproximadamente 0,43 GB en fp32 y en torno a 0,22 GB en fp16, por lo que la huella total con tokenizer y activaciones se mantiene en el orden de 1 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria es suficiente por tamano; una NVIDIA T4, L4 o A10 bastan para servicio concurrente. A100 o H100 solo se justifican por volumen de peticiones, no por requisitos del modelo.
- GPU de consumo: cabe con holgura en GPU de consumo (RTX 3060, RTX 4060, RTX 4090 y similares). La inferencia en CPU es viable para cargas moderadas.
- Opciones de despliegue: Hugging Face Inference Endpoints con el `handler.py` y `requirements.txt` incluidos en el repositorio; tambien es desplegable con la libreria Transformers de forma local mediante la clase de question answering, dado que los pesos estan en safetensors. No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI, ni versiones GGUF.
- Latencia y throughput: no disponibles. El repositorio no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RECCON (coding-zzz-oe) | 107.721.218 | No disponible | Sin benchmarks publicados en la informacion disponible | No disponible | HuggingFace, 0 descargas y 0 likes registrados |
| SpanBERT-base (backbone declarado) | Del orden de 110 M en su variante base, dato no confirmado por la model card | No disponible | No disponible en esta busqueda | No disponible | Publico en HuggingFace y en la literatura original |
| RoBERTa-base (backbone citado en el handler) | No disponible | No disponible | No disponible | No disponible | Publico en HuggingFace |
| Modelos RECCON originales del equipo declare-lab | No disponible | No disponible | Resultados reportados en el articulo de 2021, no reproducidos aqui | No disponible | Repositorio GitHub de RECCON |

No se dispone de datos verificados de rendimiento ni de licencia de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Idioma restringido: solo ingles, segun los metadatos del repositorio.
- Ambito de analisis limitado: la model card indica que el backbone se usa "without context", por lo que el modelo trabaja sobre el enunciado objetivo y no sobre el historial conversacional completo; esto reduce su capacidad para resolver causas que dependen de turnos previos.
- Inconsistencia documental: la model card cita SpanBERT y el handler cita RoBERTa; conviene verificar en `config.json` que backbone se cargo realmente antes de usarlo en produccion.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; es un bloqueo relevante para cualquier despliegue productivo.
- Sin validacion de la comunidad: el repositorio muestra 0 descargas y 0 likes, y no incluye metricas ni evaluacion independiente.
- Riesgo de extraccion incorrecta: al ser un modelo extractivo con postprocesado heuristico (filtro de stopwords, limite de 8 palabras, deduplicacion), puede devolver spans gramaticalmente incompletos o fragmentos poco informativos cuando la causa es difusa o esta repartida en varias frases.
- Dependencia de la etiqueta de emocion: la calidad del trigger depende de que la emocion de entrada sea correcta; el modelo no la verifica ni la predice.
- Sesgos: no se documenta analisis de sesgos, y el entrenamiento sobre DailyDialog puede arrastrar los sesgos de dominio, registro y demografia de ese corpus.
- Fecha de creacion atipica: los metadatos indican creacion y actualizacion en septiembre de 2026, lo que dificulta interpretar el estado real de mantenimiento del repositorio.
- Sin soporte de cuantizaciones publicadas: no hay versiones GGUF ni cuantizadas, lo que obliga a generar el proceso de conversion si se necesita reducir precision.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo; los enlaces recuperados corresponden a plataformas genericas de aprendizaje de programacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coding-zzz-oe/RECCON
- Articulo de referencia (Poria et al., 2021), arXiv: https://arxiv.org/abs/2012.11820
- Repositorio y dataset RECCON: https://github.com/declare-lab/RECCON
- Panel de Hugging Face Inference Endpoints: https://ui.endpoints.huggingface.co/
- Dataset DailyDialog (origen del corpus): no disponible como enlace directo en la informacion proporcionada
