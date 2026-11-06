# felipermtrindade/FoodReviewAI-Sentiment

## Resumen

FoodReviewAI-Sentiment es un clasificador binario de sentimiento para resenas de restaurantes en portugues, desarrollado por el usuario de Hugging Face felipermtrindade. No se trata de un modelo de lenguaje neuronal, sino de un pipeline clasico de aprendizaje automatico supervisado construido con scikit-learn: representacion TF-IDF de hasta 10.000 caracteristicas (unigramas y bigramas) alimentando una regresion logistica con ponderacion de clases balanceada. El repositorio ocupa 0,0 GB y contiene los artefactos serializados en formato joblib (`.pkl`), no pesos en safetensors ni GGUF.

El modelo resuelve un problema acotado: dado un texto de resena en portugues, asignar una etiqueta positiva o negativa. Se entreno sobre el dataset StarRest, compuesto por resenas de restaurantes brasilenos, seleccionando 16.293 resenas tras el preprocesado (15.207 positivas y 1.086 negativas). Las etiquetas se derivaron de las puntuaciones de los usuarios (1-2 estrellas como negativo, 4-5 como positivo, excluyendo las de 3 estrellas), lo que condiciona fuertemente su comportamiento.

Su relevancia es limitada en el panorama actual de modelos generativos, pero resulta util como referencia didactica de un flujo completo de machine learning (preprocesado, entrenamiento, evaluacion e integracion via API) y como linea base ligera para analisis de sentimiento en portugues sin requisitos de GPU. La licencia no esta declarada en la model card ni en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (max. 10.000 features, unigramas y bigramas) + regresion logistica |
| Parametros totales | no disponible (modelo lineal; el numero depende del vocabulario efectivo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; TF-IDF vectoriza el documento completo) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales; serializacion joblib) |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (joblib, pickle de Python) |
| Framework | scikit-learn |
| Balanceo de clases | `class_weight="balanced"` |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura transformer ni redes neuronales. La representacion del texto se realiza mediante TF-IDF con un maximo de 10.000 caracteristicas y extraccion de unigramas y bigramas, sobre la que se ajusta una regresion logistica de scikit-learn con `class_weight="balanced"` para compensar el fuerte desequilibrio entre clases. No hay fases de preentrenamiento, RLHF ni DPO; el ajuste es puramente supervisado sobre etiquetas derivadas de puntuaciones.

Los datos de entrenamiento proceden del dataset StarRest (resenas de restaurantes brasilenos), restringido a las plataformas 1, 2 y 3. Tras el preprocesado se conservaron 16.293 resenas: 15.207 positivas y 1.086 negativas (aproximadamente un 93% de la clase positiva). Las resenas con 1 o 2 estrellas se etiquetaron como negativas, las de 4 o 5 como positivas, y las de 3 estrellas se descartaron. La particion fue 80/20 con muestreo estratificado. No se documenta tecnica de calibracion de probabilidades ni validacion cruzada adicional.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) de textos en portugues.
- Procesamiento de resenas de restaurantes del dominio gastronomico brasileno.
- Inferencia sobre CPU sin GPU, con latencia muy baja gracias al modelo lineal.
- Integracion sencilla en APIs y servicios Python mediante joblib y scikit-learn.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision, audio ni generacion de texto libre.
- Capacidad multilingue limitada al portugues; no se documenta soporte de otros idiomas.
- Devuelve etiquetas discretas mediante `predict`; las probabilidades no estan calibradas de forma independiente.

## Casos de uso

- Monitorizacion de resenas en plataformas de delivery: clasificar automaticamente resenas nuevas de restaurantes brasilenos en positivas o negativas para priorizar la atencion al cliente y detectar incidencias recurrentes.
- Triaje en soporte al cliente: enrutar las resenas negativas a un equipo de gestion de reputacion y agregar las positivas en informes de satisfaccion, usando el modelo como filtro de bajo coste en CPU.
- Analisis de reputacion por restaurante: procesar lotes de resenas historicas y calcular la proporcion de sentimiento negativo por local, plataforma o periodo temporal.
- Linea base en proyectos de NLP en portugues: servir como referencia de rendimiento antes de adoptar modelos neuronales como BERT portugues, tal y como propone el propio autor en las mejoras futuras.
- Prototipado rapido de APIs de analisis de sentimiento: el artefacto joblib se carga con pocas lineas y permite exponer un endpoint HTTP sin infraestructura de GPU.
- Filtrado previo en pipelines de datos: descartar o marcar resenas negativas antes de un analisis mas costoso (topic modeling, extraccion de entidades) para reducir el volumen a procesar.
- Docencia y demostracion de flujos de ML: ilustra un ciclo completo de preprocesado, entrenamiento, evaluacion con matriz de confusion e integracion en API.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test (20% estratificado):

| Metrica | Resultado |
|---|---|
| Accuracy | 95,6% |
| Precision (negativo) | 0,61 |
| Recall (negativo) | 0,91 |
| F1 (negativo) | 0,73 |
| F1 (positivo) | 0,98 |

Matriz de confusion reportada:

| | Predicho negativo | Predicho positivo |
|---|---|---|
| Real negativo | 198 | 19 |
| Real positivo | 125 | 2917 |

No se han publicado comparaciones con otros modelos en la informacion disponible. La accuracy elevada debe interpretarse con cautela dado el desequilibrio de clases (93% positivas); las metricas de la clase negativa son mas informativas del rendimiento real.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el modelo lineal es de tamano reducido.
- Memoria RAM: suficiente con unos cientos de MB para cargar scikit-learn, joblib y el vocabulario TF-IDF.
- Opciones de despliegue: scripts Python con scikit-learn y joblib, APIs propias (FastAPI, Flask), contenedores Docker ligeros. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos neuronales.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (TF-IDF + regresion logistica) se espera latencia de milisegundos por peticion en CPU, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FoodReviewAI-Sentiment | TF-IDF + regresion logistica | no disponible | no aplica | pt | no disponible | Hugging Face (.pkl) |
| BERTimbau (Neuralmind) | Transformer encoder | ~110M (base) | 512 tokens | pt | no disponible en esta ficha | Hugging Face |
| Albertina PT-BR | Transformer encoder | ~900M (large) | 512 tokens | pt | no disponible en esta ficha | Hugging Face |
| Otros clasificadores scikit-learn de sentimiento en pt | TF-IDF + lineal | no disponible | no aplica | pt | variable | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales; el autor propone explicitamente comparar con modelos BERT portugueses como trabajo futuro.

## Limitaciones y advertencias

- Dataset fuertemente desequilibrado: aproximadamente el 93% de las resenas son positivas, lo que infla la accuracy y penaliza la deteccion de la clase negativa (precision de 0,61).
- Etiquetas derivadas de puntuaciones de usuarios, no anotadas manualmente; pueden reflejar sesgos de los clientes y no el sentimiento real del texto.
- Clasificacion binaria estricta: no maneja sentimiento neutro ni mixto; las resenas de 3 estrellas se excluyeron del entrenamiento.
- Dominio restringido a resenas de restaurantes brasilenos; no se garantiza generalizacion a otros dominios ni a otras variantes del portugues.
- Probabilidades no calibradas de forma independiente; no deben interpretarse como confianza fiable sin recalibracion.
- Licencia no declarada: no hay autorizacion explicita para uso comercial, por lo que debe consultarse al autor antes de emplearlo en produccion.
- Riesgo de seguridad al cargar el artefacto: los ficheros joblib/pickle pueden ejecutar codigo al deserializarse; solo debe cargarse desde un publicador de confianza, como advierte la propia model card.
- Sin soporte de contexto largo, tool calling ni capacidades generativas; no es adecuado como sustituto de un LLM.
- Sin descargas ni likes registrados en Hugging Face en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felipermtrindade/FoodReviewAI-Sentiment
- Codigo fuente en GitHub: https://github.com/felipemtrindade/FoodReviewAI
- Dataset StarRest (Mendeley Data): https://data.mendeley.com/datasets/r5th4s7vpv/2
