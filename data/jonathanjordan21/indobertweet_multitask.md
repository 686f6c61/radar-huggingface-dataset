# jonathanjordan21/indobertweet_multitask

## Resumen

IndoBERTweet Multitask Sentiment & Sarcasm es un checkpoint ajustado (fine-tuned) del modelo base IndoBERTweet, un encoder BERT preentrenado especificamente sobre texto informal en indonesio. Lo desarrolla el usuario jonathanjordan21 y su proposito es resolver dos tareas de clasificacion de forma conjunta mediante aprendizaje multitarea: analisis de sentimiento (negative, neutral, positive, mixed) y deteccion de sarcasmo (non_sarcastic, sarcastic) en publicaciones de Reddit en indonesio.

El modelo parte de IndoBERTweet, que es un BERT base adaptado al dominio de redes sociales en indonesio, y se ajusta sobre el dataset `jwnt4/reddit-id-sarcasm-cleaned`. La innovacion principal no esta en la arquitectura del encoder (que es un transformer BERT estandar) sino en el diseno de cabeceras multitarea que comparten representaciones para ambas tareas, algo relevante porque el sarcasmo y el sentimiento estan fuertemente correlacionados en texto informal.

Es relevante para quienes trabajan con PLN en indonesio y necesitan un unico modelo ligero que resuelva ambas tareas a la vez, con licencia MIT y un tamano de repositorio reducido (0,4 GB). No obstante, la informacion publicada es muy escasa: no hay benchmarks, no hay detalle del dataset de entrenamiento mas alla del enlace, y el modelo requiere cargar un modulo `model.py` personalizado en lugar de usar `transformers` de forma estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (IndoBERTweet base) con cabeceras multitarea para sentimiento y sarcasmo |
| Parametros totales | no disponible (el modelo base IndoBERTweet es de ~110M, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del BERT base, tipicamente 512 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (id) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`best_model.pt`), cargado via modulo `model.py` personalizado |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en BERT (IndoBERTweet base, `indolem/indobertweet-base-uncased`) con dos cabeceras de clasificacion superpuestas: una para sentimiento con cuatro clases (negative, neutral, positive, mixed) y otra para sarcasmo con dos clases (non_sarcastic, sarcastic). El aprendizaje es multitarea, de modo que ambas cabeceras se entrenan simultaneamente compartiendo el encoder. La configuracion se define en una clase `SarcasmAwareSentimentConfig` y la arquitectura en `SarcasmAwareSentimentModel`, ambas incluidas en el repositorio.

El ajuste se realiza sobre el dataset `jwnt4/reddit-id-sarcasm-cleaned`, un corpus de sarcasmo extraido de Reddit en indonesio. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF/DPO ni hiperparametros (learning rate, epochs, batch size). Tampoco se documenta si se congelo el encoder o se ajusto completo, ni si se aplicaron tecnicas de balanceo de clases pese a que el sentimiento "mixed" suele ser una clase minoritaria.

## Capacidades

- Clasificacion de sentimiento en cuatro clases: negative, neutral, positive, mixed.
- Deteccion de sarcasmo en dos clases: non_sarcastic, sarcastic.
- Procesamiento de texto informal en indonesio, incluyendo jerga de redes sociales (heredado de IndoBERTweet).
- Prediccion conjunta de ambas tareas en una sola pasada (multitarea), lo que permite usar la senal de sarcasmo como contexto para el sentimiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo indonesio.
- No se documenta modo "thinking", vision ni audio.

## Casos de uso

- Moderacion de comunidades en indonesio: el modelo puede clasificar comentarios de foros o redes como positivos, negativos, neutros o mixtos y marcar aquellos con sarcasmo, lo que ayuda a priorizar revisiones humanas en hilos conflictivos.
- Analisis de opinion en redes sociales: al procesar publicaciones de Reddit y plataformas similares, permite agregar sentimiento por tema o producto y separar el sarcasmo que de otro modo distorsionaria las metricas.
- Monitorizacion de reputacion de marca: integrado en un pipeline de ingesta de menciones en indonesio, el modelo etiqueta rapidamente el tono de cada mencion y detecta respuestas sarcasticas que un clasificador de sentimiento simple interpretaria como positivas.
- Investigacion en PLN sobre sarcasmo: sirve como baseline reproducible para estudiar la correlacion entre sarcasmo y sentimiento en indonesio, dado que expone ambas salidas y una licencia permisiva.
- Enrutamiento de tickets de soporte: en un sistema de atencion al cliente, el modelo puede clasificar el tono del mensaje entrante y derivar a un agente humano los casos sarcasticos o mixtos que requieren trato cuidadoso.
- Etiquetado asistido de datasets: al ser ligero (0,4 GB) y con licencia MIT, puede desplegarse en CPU para preetiquetar grandes volumenes de texto en indonesio antes de una revision humana, reduciendo el coste de anotacion.
- Filtrado de resenas en e-commerce: deteccion de resenas sarcasticas que contradicen la puntuacion por estrellas, utiles para detectar manipulacion o para enriquecer el analisis de satisfaccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repo (0,4 GB) y la base BERT, la inferencia en FP32 requiere aproximadamente 0,5-1 GB de memoria, aunque esta cifra es una estimacion y no esta confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para un modelo BERT base; una RTX 3060, RTX 4090, A100 o H100 funcionarian sin problema, aunque el modelo esta claramente sobredimensionado para estas GPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para lotes pequenos.
- Opciones de despliegue: al requerir un modulo `model.py` personalizado y pesos en `state_dict`, no es compatible directamente con `transformers`, `vLLM`, `TGI` ni `Ollama` sin conversion previa. El despliegue natural es PyTorch puro o TorchScript/ONNX tras exportacion manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonathanjordan21/indobertweet_multitask | no disponible (base ~110M) | no disponible | Sentimiento + sarcasmo (multitarea) | MIT | Hugging Face, requiere `model.py` |
| indolem/indobertweet-base-uncased | ~110M | 512 tokens (BERT base) | Representaciones generales en indonesio | no disponible en esta ficha | Hugging Face, compatible con `transformers` |
| indobert-base-p1 (IndoBERT de IndoLEM) | ~110M | 512 tokens | Representaciones generales en indonesio | no disponible en esta ficha | Hugging Face, compatible con `transformers` |
| mBERT (bert-base-multilingual-cased) | ~178M | 512 tokens | Multilingue, incluye indonesio | Apache 2.0 | Hugging Face, compatible con `transformers` |

La comparativa se limita a modelos base porque no se dispone de datos de rendimiento del checkpoint multitarea ni de alternativas especificas de deteccion de sarcasmo en indonesio en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado metricas de evaluacion (accuracy, F1, matriz de confusion) para ninguna de las dos tareas, por lo que no es posible validar su calidad antes de usarlo en produccion.
- El dataset de entrenamiento es Reddit en indonesio; el rendimiento puede degradarse en otros dominios (noticias, texto formal, tuits) por sesgo de dominio.
- La clase "mixed" de sentimiento suele estar infrarrepresentada; no se documenta si se aplico balanceo, lo que puede sesgar las predicciones hacia las clases mayoritarias.
- Riesgo de alucinacion no aplica en sentido generativo (es un clasificador), pero si de falsos positivos/negativos en la deteccion de sarcasmo, una tarea intrinsecamente ambigua.
- Solo soporta indonesio; no se documenta capacidad multilingue.
- El modelo no es compatible con el ecosistema `transformers` de forma estandar: requiere cargar `model.py` y los pesos via `state_dict`, lo que complica el despliegue en servidores de inferencia convencionales.
- La licencia MIT permite uso comercial, pero al derivar de IndoBERTweet conviene verificar la licencia del modelo base original antes de redistribuirlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- No se documentan sesgos conocidos especificos, pero al entrenarse sobre Reddit es probable que herede sesgos de la plataforma (tono, temas, demografia de usuarios).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonathanjordan21/indobertweet_multitask
- Modelo base IndoBERTweet: https://huggingface.co/indolem/indobertweet-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/jwnt4/reddit-id-sarcasm-cleaned
