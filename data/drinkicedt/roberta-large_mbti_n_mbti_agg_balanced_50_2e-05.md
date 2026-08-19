# DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_50_2e-05

## Resumen

El modelo `roberta-large_MBTI_N_MBTI_agg_balanced_50_2e-05` es un clasificador de texto basado en RoBERTa-large, desarrollado por el usuario DrinkIcedT, que tiene como objetivo predecir la dimensión N (Intuición) del indicador de personalidad MBTI a partir de texto libre. Se trata de un fine-tuning del modelo RoBERTa-large (355 millones de parámetros) para una tarea de clasificación binaria, probablemente distinguiendo entre perfiles con preferencia N (intuición) y su opuesta S (sensación). El nombre del repositorio sugiere que el entrenamiento se realizó sobre un conjunto de datos agregado y balanceado al 50 % entre clases, con una tasa de aprendizaje de 2e-05.

El modelo está publicado en Hugging Face con el pipeline `text-classification` y formato de pesos `safetensors`. Aunque la ficha técnica del autor es mínima y no especifica el dataset de entrenamiento, los resultados de evaluación reportan una F1 de 0,6187 sobre un conjunto de validación, con una pérdida de 7,006. Dado que el autor ha publicado varios modelos similares para otras dimensiones del MBTI (I, P, etc.), este modelo forma parte de una familia de clasificadores orientados al análisis automático de personalidad.

Actualmente no cuenta con descargas ni valoraciones, y su licencia no está declarada, lo que limita su uso en entornos comerciales sin una verificación previa de los términos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (Transformer encoder) |
| Parametros totales | 355.361.794 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, por el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-large, un transformer encoder de 24 capas, 16 cabezas de atencion y una dimension de embedding de 1024. RoBERTa mejora el entrenamiento de BERT mediante enmascaramiento dinamico, empaquetado de frases, lotes mas grandes y un tokenizador BPE a nivel de bytes. En este caso, se ha anadido una cabeza de clasificacion para producir una salida binaria (probablemente N vs. S).

El entrenamiento se realizo desde cero sobre un dataset desconocido, segun la model card. Se usaron los siguientes hiperparametros: learning rate de 2e-05, batch size de 16 por dispositivo (64 en total con 4 GPUs), optimizador AdamW con betas (0.9, 0.999), scheduler lineal con 400 pasos de warmup y 5 epocas. La perdida de entrenamiento descendio de 2,05 a 0,31, pero la perdida de validacion empeoro progresivamente hasta 7,006, lo que indica un claro sobreajuste. La F1 en validacion alcanzo un maximo de 0,6401 en el paso 1400 (epoca 2,22) y luego se estabilizo alrededor de 0,62.

No se menciona el uso de tecnicas como RLHF o DPO; se trata de un fine-tuning clasico supervisado.

## Capacidades

- Clasificacion binaria de texto para la dimension N del MBTI (Intuicion vs. Sensacion).
- Inferencia sobre secuencias de hasta 512 tokens.
- Salida de probabilidad para la clase positiva, con un umbral ajustable (el autor reporta un umbral optimo de 0,88 para F1).
- Compatible con el ecosistema Transformers y con `text-embeddings-inference` para despliegue en endpoints.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Analisis de personalidad en redes sociales: dado un texto de un perfil publico (biografia, publicaciones), el modelo puede estimar si el autor muestra preferencia por la intuicion (N) en el MBTI. Se usaria con la API de Transformers para clasificar cada texto y agregar resultados.
- Seleccion de personal en RRHH: en procesos de reclutamiento, se podrian analizar respuestas abiertas de candidatos para inferir rasgos de personalidad, aunque se requiere una validacion etica y legal previa.
- Investigacion psicologica: como herramienta de apoyo para estudios que correlacionan el lenguaje con rasgos de personalidad, permitiendo procesar grandes volumenes de texto de forma automatica.
- Recomendacion de contenido: en plataformas de desarrollo personal o formacion, se podria adaptar el contenido segun la preferencia N/S estimada del usuario a partir de sus escritos.
- Filtrado de textos en aplicaciones de coaching: para clasificar diarios o reflexiones personales y ofrecer retroalimentacion personalizada.
- Etiquetado de corpus: para anotar automaticamente conjuntos de datos con la dimension N, facilitando la creacion de datasets mas grandes para otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible. La model card incluye metricas de evaluacion propias del autor sobre un conjunto de validacion no especificado:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 7,0060 |
| F1 (con umbral optimo) | 0,6187 |
| Umbral optimo | 0,88 |
| F1 con umbral fijo en 0,05 | 0,6099 |

La tabla de entrenamiento muestra que la F1 maxima en validacion fue 0,6401 en el paso 1400, pero el modelo final (paso 3000) obtiene 0,6187. No se aportan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 355M de parametros en precision fp32 (1,4 GB). Con cuantizacion a fp16, la memoria necesaria es de unos 700 MB para los pesos, mas overhead de activaciones y batch. En la practica, se recomienda al menos 4 GB de VRAM para inferencia con batch pequeno.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 3070, RTX 4060, etc.) puede ejecutar el modelo sin problemas. En GPU de datacenter como A100 o H100 tambien funciona.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 8 GB o mas.
- Opciones de despliegue: se puede usar con la libreria Transformers de Hugging Face, con vLLM (aunque es un modelo de clasificacion, vLLM soporta tareas de sequence classification), con llama.cpp (si se convierte a GGUF), o con Ollama (aunque no es habitual para clasificadores). Tambien es compatible con `text-embeddings-inference` segun los tags.
- Latencia y throughput: no se han publicado datos. En una GPU RTX 3090, la inferencia para una secuencia de 512 tokens deberia tardar del orden de 10-20 ms, procesando varios cientos de ejemplos por segundo.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de clasificacion de MBTI comparables en el momento de la redaccion. El propio autor ha publicado variantes para otras dimensiones (por ejemplo, `roberta-large_MBTI_I_MBTI_agg_balanced_75` y `roberta-large_MBTI_P`), pero no se han encontrado benchmarks que permitan una comparacion cuantitativa. Como referencia general, los modelos fine-tuned de RoBERTa-large suelen superar a los de BERT-base en tareas de clasificacion de texto, pero el rendimiento depende en gran medida del dataset y de la calidad del etiquetado.

## Limitaciones y advertencias

- El dataset de entrenamiento no esta documentado, lo que impide evaluar la representatividad y los posibles sesgos.
- La perdida de validacion aumenta drasticamente en las ultimas epocas, indicando sobreajuste severo. El modelo final puede generalizar peor que en el punto de maxima F1.
- No se ha publicado la licencia, por lo que el uso comercial es incierto y requiere contactar con el autor.
- El modelo solo clasifica la dimension N; no proporciona informacion sobre las otras tres dimensiones del MBTI.
- La precision (F1 de 0,62) es moderada y puede no ser suficiente para aplicaciones criticas sin una validacion adicional.
- Al estar basado en RoBERTa, el modelo esta disenado principalmente para ingles; su rendimiento en otros idiomas no ha sido evaluado.
- No se han realizado pruebas de robustez frente a textos adversariales o fuera de distribucion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_50_2e-05
- Variante con 50 epocas (posiblemente): https://huggingface.co/DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_50
- Variante con 100 epocas: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_100
- Modelo para la dimension I: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_75
- Modelo para la dimension P: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_P
- Documentacion de RoBERTa en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/roberta.md
