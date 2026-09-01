# Natlis/opensmile-xgboost-emotion-classification-ru

## Resumen

El modelo `Natlis/opensmile-xgboost-emotion-classification-ru` es un clasificador de emociones en habla rusa basado en un enfoque clásico de extracción de características acústicas con openSMILE y un modelo de gradient boosting con XGBoost. Desarrollado por Natlis, resuelve el problema de reconocimiento de emociones en audio (speech emotion recognition, SER) clasificando cada grabación en una de cuatro categorías: `angry`, `sad`, `neutral` y `positive`. Su relevancia radica en que ofrece una alternativa ligera y reproducible a los modelos de deep learning, con un coste computacional mínimo y resultados aceptables para tareas de análisis de sentimiento en ruso.

El modelo fue entrenado sobre el corpus combinado `dusha_resd_train` (69 253 registros), que integra los conjuntos Dusha y RESD. Utiliza los 88 funcionales de la configuración eGeMAPSv02 de openSMILE como entrada, y el clasificador XGBoost se ajusta con 500 estimadores, una tasa de aprendizaje de 0.05 y una profundidad máxima de 6. No se trata de una red neuronal, por lo que no tiene parámetros en el sentido habitual, ni contexto de tokens; su entrada es un vector de características acústicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosting) con extraccion de features openSMILE eGeMAPSv02 |
| Parametros totales | No aplica (modelo de boosting, no red neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (entrada de audio, no texto) |
| Tipos de cuantizacion | No aplica (modelo clasico, no requiere cuantizacion) |
| Idiomas soportados | Ruso (ru) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Pickle (joblib) para modelo y scaler |

## Arquitectura y entrenamiento

El modelo combina dos componentes: un extractor de características acústicas basado en openSMILE, que calcula los 88 funcionales de la configuracion eGeMAPSv02 (estadisticos como media, desviacion, percentiles, etc. sobre senales de pitch, intensidad, jitter, shimmer, etc.), y un clasificador XGBoost que recibe ese vector estandarizado. El entrenamiento se realizo sobre el corpus `dusha_resd_train`, que mezcla las bases Dusha y RESD, con un total de 69 253 grabaciones. Los hiperparametros del modelo son: `n_estimators=500`, `learning_rate=0.05`, `max_depth=6` y `seed=42`. Antes de alimentar al clasificador, las caracteristicas se estandarizan con un `StandardScaler` (obligatorio). No se emplearon tecnicas de RLHF ni DPO; es un entrenamiento supervisado clasico con etiquetas de emocion obtenidas por crowdsourcing.

## Capacidades

- Clasificacion de emociones en audio en ruso: cuatro clases (`angry`, `sad`, `neutral`, `positive`).
- Salida de probabilidades por clase mediante `predict_proba`, util para umbrales personalizados o analisis de confianza.
- Requiere extraccion previa de caracteristicas con openSMILE (version compatible con eGeMAPSv02).
- No es un modelo generativo: no genera texto ni audio, solo clasifica.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: entrenado exclusivamente con habla rusa.

## Casos de uso

- Analisis de sentimiento en llamadas de centros de atencion al cliente: el modelo puede procesar grabaciones de voz y clasificar la emocion del interlocutor, permitiendo detectar frustracion o satisfaccion en tiempo real. Su bajo coste computacional permite ejecutarlo en servidores CPU convencionales.
- Monitorizacion de calidad en encuestas de voz: al integrarse en pipelines de procesado de audio, puede etiquetar respuestas de encuestas telefonicas segun el estado emocional del encuestado, ayudando a filtrar respuestas invalidas o a segmentar por emocion.
- Investigacion en psicologia y linguistica: los investigadores pueden usar el modelo para anotar corpus de habla espontanea rusa con etiquetas emocionales, facilitando estudios sobre expresion de emociones en distintos contextos.
- Sistemas de recomendacion de contenido multimedia: en plataformas de audio o video, el modelo puede clasificar la emocion predominante en fragmentos de voz y usarla como metadato para sugerir contenido segun el estado de animo del usuario.
- Asistentes de voz con adaptacion emocional: integrado en un asistente, permite detectar si el usuario esta enfadado o triste y ajustar el tono de las respuestas, mejorando la experiencia de interaccion.
- Deteccion de estres en entornos laborales: en aplicaciones de bienestar, el modelo puede analizar grabaciones de voz de empleados (con consentimiento) para identificar patrones de estres o emociones negativas recurrentes.

## Benchmarks y rendimiento

Los resultados sobre el conjunto de test `dusha_resd_test` (6616 grabaciones) son los siguientes:

| Clase | Precision | Recall | F1-score | Soporte |
|---|---|---|---|---|
| angry | 0.612 | 0.579 | 0.595 | 1378 |
| sad | 0.684 | 0.709 | 0.697 | 2213 |
| neutral | 0.502 | 0.514 | 0.508 | 1730 |
| positive | 0.569 | 0.547 | 0.558 | 1295 |
| **Accuracy** | | | **0.600** | 6616 |
| **F1-macro** | | | **0.590** | |

Ademas, se reportan ROC-AUC (one-vs-one, macro) de 0.838, MCC de 0.456 y log-loss de 0.933. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo XGBoost es extremadamente ligero (del orden de pocos MB) y no requiere GPU. Un nucleo moderno puede procesar cientos de clasificaciones por segundo.
- VRAM: no aplica, ya que no es un modelo de red neuronal.
- GPU recomendadas: ninguna; funciona en cualquier CPU, incluso en entornos embebidos o servidores sin aceleracion.
- Opciones de despliegue: se puede cargar con `joblib` en Python, exportar a ONNX para servir con frameworks como ONNX Runtime, o integrar en pipelines de audio con openSMILE. No hay soporte nativo para vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia: la extraccion de features con openSMILE domina el tiempo de procesamiento (tipicamente decenas de milisegundos por archivo de pocos segundos); la inferencia del clasificador es sub-milisegundo.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con otros modelos de clasificacion de emociones en ruso en la informacion proporcionada. Como referencia cualitativa, este enfoque (features acusticas + boosting) es computacionalmente mucho mas barato que modelos de deep learning como wav2vec2 o HuBERT fine-tuned para SER, pero suele ofrecer menor precision en condiciones de habla espontanea o ruido. No se incluyen cifras concretas por falta de datos publicados.

## Limitaciones y advertencias

- Sensibilidad a la version de openSMILE: el modelo depende de la extraccion exacta de los 88 funcionales eGeMAPSv02; cambios en la version de openSMILE o en la configuracion pueden alterar los resultados.
- Etiquetado por crowdsourcing: las etiquetas de emocion provienen de anotaciones humanas, lo que introduce subjetividad y posible ruido en el entrenamiento.
- Generalizacion limitada: el modelo fue entrenado con corpus especificos (Dusha y RESD) y no se garantiza su rendimiento en habla espontanea fuera de esa distribucion, ni en otros acentos o dialectos del ruso.
- Solo ruso: no soporta otros idiomas.
- Licencia CC BY-SA 4.0: cualquier uso o derivacion debe compartirse bajo la misma licencia, lo que puede ser restrictivo para aplicaciones comerciales propietarias.
- No es un modelo de lenguaje: no puede generar texto ni mantener conversaciones; su unica funcion es clasificar emociones en audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Natlis/opensmile-xgboost-emotion-classification-ru
- Documentacion de openSMILE: https://audeering.github.io/opensmile/
- Repositorio de openSMILE en GitHub: https://github.com/audeering/opensmile
- Pagina de openSMILE 3.0 en audEERING: https://www.audeering.com/research/opensmile/
- Paper de Dusha (arXiv:2212.12266): https://arxiv.org/abs/2212.12266
- RESD (Aniemore, DOI 10.57967/hf/1272): https://doi.org/10.57967/hf/1272
