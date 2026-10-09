# KWST/novapay-sentiment

## Resumen

KWST/novapay-sentiment es un modelo de clasificacion de texto (analisis de sentimiento) obtenido mediante fine-tuning de distilbert-base-uncased. Lo publica el usuario KWST en Hugging Face y esta pensado, por el nombre y por los repositorios relacionados encontrados, para clasificar mensajes de soporte al cliente de NovaPay, una entidad de servicios de pago. Se distribuye con licencia Apache 2.0 y un unico fichero de pesos en safetensors de aproximadamente 0,3 GB.

Tecnicamente es un transformer encoder-only con 66.955.010 parametros, seis capas, 768 dimensiones ocultas y una ventana maxima de 512 tokens heredada del modelo base. Es, por tanto, un modelo pequeno y barato de ejecutar: cabe en cualquier GPU de consumo, en CPU y en entornos de inferencia de embeddings de texto (text-embeddings-inference).

Su relevancia es practica y limitada: no aporta innovaciones de arquitectura ni un entrenamiento a gran escala, pero sirve como ejemplo de clasificador de sentimiento de dominio especifico (pagos y soporte) con metricas declaradas de accuracy 0,888 y F1 0,8869 en un conjunto de evaluacion no especificado. La model card esta generada automaticamente por el Trainer y no documenta ni el dataset ni los usos previstos, lo que limita su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT), 6 capas, 12 cabezas de atencion, hidden size 768 |
| Parametros totales | 66.955.010 (incluye la cabeza de clasificacion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (max position embeddings de distilbert-base-uncased) |
| Tipos de cuantizacion | No disponible en el repositorio; al ser un encoder pequeno es compatible con cuantizacion dinamica int8 en PyTorch y con exportacion a ONNX |
| Idiomas soportados | No disponible (no declarados por el autor; el modelo base es en ingles, uncased) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB), compatible con transformers |

Otros datos tecnicos: pipeline text-classification; etiquetas de libreria transformers, safetensors, generated_from_trainer, text-embeddings-inference y endpoints_compatible; identificador del modelo base distilbert/distilbert-base-uncased; creado el 2026-10-08 y actualizado el mismo dia; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de DistilBERT, la variante destilada de BERT-base. DistilBERT conserva la mitad de las capas del profesor (6 frente a 12), mantiene el hidden size de 768 y el vocabulario WordPiece uncased de 30.522 tokens, y se entrena con una combinacion de perdida de destilacion, masked language modeling y similitud coseno de estados ocultos. La consecuencia practica es un encoder de unos 67 millones de parametros, aproximadamente un 40 por ciento mas pequeno que BERT-base y sensiblemente mas rapido en inferencia, con una degradacion acotada en tareas de comprension. Aqui se le anade una cabeza de clasificacion para sentimiento.

Los hiperparametros documentados en la model card son: learning rate 2e-05, train_batch_size 16, eval_batch_size 16, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal y 2 epocas. El entrenamiento registro 313 pasos por epoca y 626 en total, lo que sugiere del orden de 5.000 ejemplos por epoca si no se aplico acumulacion de gradiente; el dataset en si no se especifica ("unknown dataset") y no hay informacion sobre composicion, idioma, etiquetas ni posible balanceo de clases. No se documenta uso de RLHF, DPO ni ninguna tecnica de alineacion, algo esperable en un clasificador.

## Capacidades

- Clasificacion de sentimiento de texto corto: devuelve una etiqueta de clase para una entrada dada; la model card no detalla el conjunto de etiquetas ni su orden.
- Clasificacion de mensajes de soporte al cliente en el dominio de pagos (presunto, por el nombre del modelo y por los repositorios homonimos encontrados en la busqueda web).
- Procesamiento por lotes de alta concurrencia: al ser un encoder de 67 millones de parametros, admite batching agresivo en GPU o CPU.
- Integracion como backend de endpoints de inferencia: soporta text-embeddings-inference y endpoints compatibles dentro del ecosistema Hugging Face.
- Extraccion de representaciones ocultas (768 dimensiones) para tareas auxiliares como clustering o deteccion de temas, si se usa el cuerpo del modelo sin la cabeza de clasificacion.
- Limitaciones de capacidad: no genera texto, no razona de forma multi-paso, no soporta tool calling ni function calling, no es multimodal y no se ha documentado capacidad multilingue.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada mensaje entrante como positivo o negativo permite enrutar automaticamente las quejas hacia agentes humanos y dejar las consultas neutras en colas de menor prioridad, reduciendo el tiempo de primera respuesta.
- Monitorizacion de la voz del cliente: procesar en lote resenas de la app, comentarios en tiendas de aplicaciones o encuestas post-transaccion para construir series temporales de sentimiento por version de producto o por pasarela de pago.
- Alertas de incidentes en tiempo real: si la proporcion de mensajes negativos supera un umbral movil, disparar una alerta al equipo de operaciones; la latencia por lote es baja porque el modelo es un encoder de 67 millones de parametros.
- Filtrado previo en pipelines de moderacion: descartar o priorizar contenido segun su polaridad antes de pasarlo a un modelo mayor y mas caro, usando este clasificador como primera etapa barata.
- Analisis de conversaciones multi-turno a posteriori: al tener una ventana de 512 tokens, cada turno o cada conversacion corta puede evaluarse de forma independiente y agregarse despues por cliente o por caso.
- Etiquetado asistido para anotacion humana: usar las predicciones como preanotacion en una herramienta de etiquetado, con revision posterior, para acelerar la creacion de un corpus interno de mayor calidad.
- Investigacion sobre destilacion y classificacion en dominios financieros: sirve como punto de partida reproducible para comparar estrategias de fine-tuning sobre DistilBERT en texto de pagos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, sobre un conjunto de evaluacion no especificado. El model-index oficial no contiene ningun resultado adicional, por lo que no se pueden presentar comparaciones con MMLU, HumanEval, GSM8K ni similares (no aplicables a un clasificador encoder-only).

| Metrica | Epoca 1 (paso 313) | Epoca 2 (paso 626) |
|---|---|---|
| Training loss | 0,1445 | 0,1269 |
| Validation loss | 0,4299 | 0,4476 |
| Accuracy | 0,869 | 0,888 |
| F1 | 0,8761 | 0,8869 |

La mejor configuracion reportada es la de la segunda epoca (accuracy 0,888, F1 0,8869), con un ligero aumento de la perdida de validacion respecto a la primera, lo que apunta a un inicio de sobreajuste entre las epocas 1 y 2.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32 ronda los 0,27 GB solo de pesos; en float16 aproximadamente 0,13 GB; en int8 dinamico unos 0,07 GB. Con activaciones y batching realista, una instancia de 1-2 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna vale; no necesita A100 ni H100. Una RTX 3060, RTX 4090, T4, L4 o incluso una iGPU con soporte de PyTorch son suficientes. En un A100 o H100 el cuello de botella sera el preprocesado de texto, no el modelo.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo con 4 GB o mas, y tambien se puede ejecutar en CPU con latencias aceptables en lote.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference, Hugging Face Inference Endpoints (etiqueta endpoints_compatible), exportacion a ONNX Runtime para CPU, y FastAPI/TorchServe envolviendo el pipeline. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion manual previa.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens o documentos por segundo. Como referencia cualitativa, un encoder de 67 millones de parametros clasifica lotes de cientos de textos cortos por segundo en GPU moderna, pero no se aporta ninguna cifra verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Metricas declaradas |
|---|---|---|---|---|---|
| KWST/novapay-sentiment | 66.955.010 | 512 tokens | Clasificacion de sentimiento (dominio NovaPay) | apache-2.0 | Accuracy 0,888; F1 0,8869 (dataset no especificado) |
| distilbert/distilbert-base-uncased | No disponible en la informacion proporcionada | 512 tokens | Modelo base preentrenado, sin cabeza de clasificacion | apache-2.0 | No aplica (modelo base) |
| abhishes/novapay-sentiment | No disponible | No disponible | Clasificacion de sentimiento de mensajes de soporte NovaPay, entrenado sobre IMDB como prueba de concepto | No disponible | No disponible |
| dumbbutt0/novapay-sentiment-imdb-distilbert | No disponible | No disponible | Clasificacion de sentimiento sobre IMDB con DistilBERT | No disponible | No disponible |

No se ha encontrado en la busqueda web ningun benchmark comparable que permita situar este modelo frente a alternativas consolidadas de analisis de sentimiento; los datos de los repositorios homonimos son incompletos y no comparables.

## Limitaciones y advertencias

- Model card incompleta: esta generada automaticamente por el Trainer y no documenta dataset, etiquetas, idioma ni usos previstos. El autor no ha publicado informacion adicional.
- Dataset de entrenamiento desconocido: la model card indica explicitamente "unknown dataset", por lo que no se puede evaluar la cobertura de dominios, el balance de clases ni el riesgo de fuga de datos.
- Riesgo de sobreajuste: la perdida de validacion sube de 0,4299 a 0,4476 entre la primera y la segunda epoca mientras la de entrenamiento baja, senal tipica de sobreajuste con solo dos epocas.
- Sesgos: no evaluados ni documentados. Al derivar de distilbert-base-uncased, hereda los sesgos de su corpus de preentrenamiento (mayoritariamente ingles y de fuentes web).
- Idioma: el modelo base es uncased y de vocabulario ingles; no hay ninguna declaracion de soporte para castellano ni para otros idiomas, por lo que su uso en espanol no esta validado.
- Alucinacion: al ser un clasificador no genera texto libre, de modo que el riesgo de alucinacion no aplica; el riesgo equivalente es la clasificacion erronea con alta confianza, especialmente en mensajes ironicos, mixtos o con negaciones complejas.
- Ambito de contexto: 512 tokens. Los mensajes o hilos mas largos deben truncarse o dividirse, lo que puede perder informacion relevante.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero el usuario debe cumplir las obligaciones de atribucion y no puede reclamar endoso del autor.
- Adopcion y soporte: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento; no es un modelo apto para produccion critica sin una evaluacion propia sobre datos reales del dominio.
- Sin cuantizaciones publicadas ni pesos alternativos (GGUF, ONNX) en el repositorio, lo que obliga a convertir si se quiere desplegar fuera del ecosistema transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KWST/novapay-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Repositorio homonimo con enfoque IMDB: https://huggingface.co/dumbbutt0/novapay-sentiment-imdb-distilbert
- Repositorio homonimo de clasificacion de soporte NovaPay: https://huggingface.co/abhishes/novapay-sentiment
- NovaPay, resultados de su transformacion con IA: https://novapay.ua/en/ai-transformatsiya/
- NovaPay, actualizacion tecnologica de 2025: https://novapay.ua/en/tekhnologichnii-apgreid-2025/
- Documentacion de analisis de sentimiento de Google Cloud Natural Language (referencia de tarea): https://docs.cloud.google.com/natural-language/docs/analyzing-sentiment
