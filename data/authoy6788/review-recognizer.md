# authoy6788/review-recognizer

## Resumen

Review Recognizer es un modelo de clasificacion binaria de sentimiento (positivo/negativo) obtenido mediante fine-tuning de `distilbert-base-uncased` sobre resenas de peliculas en ingles. Lo desarrolla el usuario `authoy6788` y se publica en HuggingFace con licencia Apache-2.0. El problema que resuelve es acotado y clasico: dado un texto en ingles con tono valorativo, devolver una etiqueta de polaridad, algo util como componente de triaje en pipelines de analisis de opinion.

Tecnicamente es un encoder transformer destilado de 6 capas y 66.955.010 parametros (aproximadamente 67 M), con una ventana de contexto de 512 tokens heredada de su modelo base. El entrenamiento fue deliberadamente ligero: 2.000 ejemplos de entrenamiento y 500 de evaluacion del dataset `stanfordnlp/imdb`, durante 2 epocas. El autor reporta una accuracy de 0,888 y un F1 de 0,8898 sobre ese subconjunto de evaluacion.

Su relevancia es limitada y muy especifica: no compite con los modelos generativos actuales ni con clasificadores BERT entrenados sobre el corpus completo de IMDb. Es interesante como ejemplo de fine-tuning minimalista, como baseline rapido y barato para prototipos de analisis de sentimiento, o como caso de estudio de overfitting y de evaluacion sobre subconjuntos pequenos. Con 0 descargas y 0 likes en el momento de la consulta, no cuenta con validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base), 6 capas, hidden size 768, 12 cabezas de atencion |
| Parametros totales | 66.955.010 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de `distilbert-base-uncased`; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un encoder de 67 M es compatible con cuantizacion dinamica INT8 via PyTorch/ONNX y con conversion a GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun tags del repositorio); tamano del repo 0,3 GB |
| Tarea | clasificacion de sentimiento binaria (positive / negative) |
| Modelo base | distilbert-base-uncased |
| Dataset de entrenamiento | stanfordnlp/imdb (2.000 ejemplos de train, 500 de evaluacion) |
| Epocas | 2 |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, una version destilada de BERT-base que reduce el numero de capas de 12 a 6 manteniendo el tamano de representacion (hidden size 768) y 12 cabezas de atencion. Sobre ese encoder se anade una cabeza de clasificacion con dos etiquetas. El resultado son aproximadamente 67 M de parametros, un tercio menos que BERT-base, con una latencia inferior y una huella de memoria muy reducida, a costa de una capacidad de representacion menor.

El entrenamiento consistio en un fine-tuning sobre un subconjunto de 2.000 ejemplos del dataset IMDb, con 500 ejemplos reservados para evaluacion y 2 epocas de entrenamiento. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de este tipo. Tampoco se detallan hiperparametros como learning rate, batch size, optimizer, warmup ni estrategia de tokenizacion, ni si se aplico truncado a 512 tokens o a una longitud menor. No se menciona ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.), ya que se trata de un fine-tuning estandar de un encoder preentrenado.

## Capacidades

- Clasificacion de sentimiento binaria en ingles: devuelve una etiqueta de polaridad (positiva o negativa) y una puntuacion de confianza a traves de la tarea `sentiment-analysis` del pipeline de Transformers.
- Procesamiento de textos de hasta 512 tokens, suficiente para resenas de varias frases o parrafos.
- Inferencia muy rapida y economica en CPU, al tratarse de un encoder de 67 M de parametros.
- Integrable como componente dentro de pipelines mayores de NLP (preprocesado, enrutado, filtrado o etiquetado previo).
- No soporta generacion de texto: es un modelo discriminativo, no autoregresivo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo de razonamiento explicito (thinking mode), ni capacidades de vision, audio o multimodalidad.
- Multilingue: no. El modelo esta entrenado y evaluado unicamente en ingles.

## Casos de uso

- Analisis de opinion a escala sobre resenas de producto en ingles: el modelo permite etiquetar lotes grandes de resenas cortas con muy poco coste computacional, sirviendo como primera capa de un sistema de monitorizacion de reputacion.
- Triaje previo a un modelo mayor: usar Review Recognizer para preclasificar comentarios y reservar un LLM mas caro solo para los casos ambiguos o de baja confianza, reduciendo el coste total de inferencia.
- Prototipado rapido de funcionalidades de sentimiento: al cargarse con una sola linea de `pipeline`, es util para validar una idea o un flujo de producto antes de invertir en un modelo propio.
- Filtrado de resenas para curacion de contenido: descartar o priorizar opiniones negativas en un panel de moderacion de una plataforma de contenidos.
- Analisis de resenas de peliculas en experimentos academicos: dado que el dominio de entrenamiento es exactamente IMDb, sirve como baseline en trabajos de comparacion de clasificadores ligeros.
- Etiquetado asistido para construir datasets: usar las predicciones como preetiquetas que despues se revisan manualmente, acelerando el proceso de anotacion.
- Analisis de encuestas con respuestas abiertas en ingles: clasificar comentarios libres de clientes o empleados en dos polaridades para agregar resultados rapidamente.
- Inferencia en el borde o en entornos sin GPU: su tamano reducido permite ejecutarlo en dispositivos con recursos muy limitados o en contenedores con CPU exclusivamente.

## Benchmarks y rendimiento

Los unicos resultados publicados por el autor corresponden al subconjunto de evaluacion de 500 ejemplos seleccionado por el propio autor, no al test oficial completo de IMDb. Los valores proceden de la model card.

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 0,888 | 500 ejemplos reservados de `stanfordnlp/imdb` |
| F1 | 0,8898 | 500 ejemplos reservados de `stanfordnlp/imdb` |

No se han publicado resultados de benchmarks adicionales (MMLU, GLUE, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se detalla la matriz de confusion ni el rendimiento desagregado por clase, por lo que no es posible evaluar si existe un desequilibrio entre falsos positivos y falsos negativos.

## Requisitos de hardware

- Peso de los pesos en FP32: aproximadamente 268 MB (66.955.010 parametros x 4 bytes). En FP16, unos 134 MB; en INT8, unos 67 MB. El repositorio completo ocupa 0,3 GB.
- VRAM estimada para inferencia: del orden de 1 GB o menos con batch pequeno en FP32, incluyendo pesos y activaciones; menos de 0,5 GB en FP16 e inferior en INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4060, T4, L4 o incluso una GTX 1650 son mas que suficientes. Aceleradores como A100 o H100 no aportan ventaja practica para este tamano de modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU sin dificultad.
- Opciones de despliegue: `transformers` con `pipeline` (la via documentada por el autor), PyTorch directo, ONNX Runtime para acelerar en CPU, Text Generation Inference (TGI) si se sirve como modelo de clasificacion, y FastAPI o similares como envoltorio HTTP. La conversion a GGUF permitiria su uso en llama.cpp u Ollama, aunque el autor no publica pesos en ese formato. vLLM soporta arquitecturas tipo BERT, pero esta poco optimizado para encoders de clasificacion frente a decoders.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| authoy6788/review-recognizer | 66.955.010 | 512 tokens | Accuracy 0,888 y F1 0,8898 sobre 500 ejemplos propios de IMDb | Apache-2.0 | HuggingFace, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | 66.955.010 (misma arquitectura) | 512 tokens | No disponible en esta ficha; ampliamente usado como referencia de sentimiento en ingles | Apache-2.0 | HuggingFace, muy extendido |
| bert-base-uncased afinado sobre IMDb (por ejemplo, la version de TextAttack) | ~110 M | 512 tokens | No disponible en esta ficha; el autor indica solo resultados sobre un subconjunto de 2.000 ejemplos | Apache-2.0 | HuggingFace |
| RoBERTa-base | ~125 M | 512 tokens | No disponible en esta ficha | MIT | HuggingFace |

La diferencia principal frente a las alternativas es el regimen de entrenamiento: Review Recognizer se ha afinado con 2.000 ejemplos y 2 epocas, muy por debajo de lo habitual en clasificadores de sentimiento publicados, que suelen usar el corpus completo o decenas de miles de ejemplos. Los modelos comparables tienen arquitecturas y tamanos similares o mayores, pero no se dispone de cifras verificadas en la informacion proporcionada para establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado solo con resenas de peliculas en ingles. El propio autor advierte que el rendimiento puede degradarse en texto fuera de dominio, en otros idiomas, en texto no valorativo o en estilos de escritura muy distintos.
- Entrenamiento con muy pocos datos: 2.000 ejemplos y 2 epocas es un volumen bajo. Existe riesgo elevado de sobreajuste al subconjunto y de que la accuracy de 0,888 no se mantenga en el test oficial completo de IMDb.
- Evaluacion no comparable: los 500 ejemplos de evaluacion fueron seleccionados por el autor, no son el split oficial de test. Las cifras no son directamente comparables con las publicadas por otros clasificadores de IMDb.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre. El riesgo equivalente es la clasificacion erronea con alta confianza, especialmente en textos ironicos, mixtos o neutrales.
- Sesgos: no se documenta ningun analisis de sesgo. Al entrenar sobre resenas de peliculas, puede heredar sesgos de estilo, genero o vocabulario presentes en IMDb, y no distingue opiniones mixtas ni sentimiento neutro (solo dos clases).
- Idioma: solo ingles. No hay soporte multilingue ni evaluacion en otros idiomas.
- Contexto: limitado a 512 tokens. Los textos mas largos se truncan, lo que puede alterar la prediccion si la polaridad depende del final del texto.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, siempre que se conserve el aviso de licencia y se cumplan las condiciones de atribucion. No se indica ninguna restriccion adicional en la model card. Conviene verificar tambien las condiciones del dataset `stanfordnlp/imdb` si se redistribuye el modelo.
- Advertencia de produccion: con 0 descargas y 0 likes, es un modelo sin validacion externa. Para uso en produccion se recomienda reproducir la evaluacion sobre el split oficial de test de IMDb, medir la matriz de confusion y comparar contra un clasificador de referencia antes de adoptarlo.
- Fecha de publicacion: el repositorio figura como creado el 26 de septiembre de 2026 y actualizado el mismo dia, sin historial posterior de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/authoy6788/review-recognizer
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset: https://huggingface.co/datasets/stanfordnlp/imdb
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Paper del dataset IMDb (Maas et al., 2011): https://ai.stanford.edu/~amaas/papers/wvSent_acl2011.pdf
- Documentacion de pipelines de Transformers: https://huggingface.co/docs/transformers/main_classes/pipelines
- Repositorio de Transformers: https://github.com/huggingface/transformers
