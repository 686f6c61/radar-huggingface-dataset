# DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_50_1e-05

## Resumen

El modelo `roberta-large_MBTI_N_MBTI_agg_balanced_50_1e-05` es un fine-tuning de RoBERTa-large orientado a la clasificación de texto según el indicador de personalidad MBTI, concretamente diseñado para distinguir entre perfiles de tipo N (intuición) y no N. Ha sido desarrollado por el usuario DrinkIcedT y publicado en Hugging Face bajo el pipeline de `text-classification`. Con 355 millones de parámetros y una arquitectura transformer encoder, el modelo está pensado para tareas de análisis de personalidad a partir de texto libre.

La relevancia de este modelo radica en su especialización en un dominio concreto: la inferencia de rasgos psicológicos a partir de lenguaje natural. Aunque la información pública es limitada (sin licencia declarada, sin idiomas especificados y con un dataset de entrenamiento desconocido), los resultados de evaluación reportados por el autor muestran una F1 de 0,6343, lo que sugiere un rendimiento moderado en la tarea objetivo. Su tamaño (355 M de parámetros) lo sitúa en el rango de modelos que pueden desplegarse en hardware de consumo con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (transformer encoder) |
| Parametros totales | 355.361.794 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (estándar de RoBERTa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (RoBERTa preentrenado en inglés, pero el fine-tuning podría usar otro idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-large, un transformer encoder con 24 capas, 16 cabezas de atención y una dimensión oculta de 1024. RoBERTa mejora BERT mediante técnicas como enmascaramiento dinámico, entrenamiento con lotes más grandes y un tokenizador BPE a nivel de bytes, lo que permite una representación más robusta del lenguaje. En este caso, el modelo ha sido ajustado (fine-tuning) sobre un checkpoint preentrenado de RoBERTa-large, aunque la model card generada automáticamente indica "trained from scratch" — una imprecisión probablemente debida a la plantilla del Trainer. El dataset de entrenamiento no se especifica.

Los hiperparámetros de entrenamiento declarados incluyen una tasa de aprendizaje de 1e-05, tamaño de lote de 16 por dispositivo (64 en total con 4 GPUs), optimizador AdamW con betas (0.9, 0.999), scheduler lineal con 400 pasos de warm-up y 5 épocas. La pérdida de evaluación final es 4,5747 con una F1 de 0,6343 y un umbral óptimo de 0,74. La evolución del entrenamiento muestra una pérdida de entrenamiento descendente de 2,08 a 0,52, mientras que la pérdida de validación fluctúa y aumenta en las últimas épocas, indicando posible sobreajuste.

## Capacidades

- Clasificación de texto binaria (o multiclase) para inferir el tipo MBTI, concretamente la dicotomía N (intuición) frente a no N.
- Procesamiento de texto en inglés (si se mantiene el preentrenamiento original de RoBERTa), aunque no se confirma el idioma del fine-tuning.
- Generación de puntuaciones de probabilidad para cada clase, con umbral ajustable (el autor reporta un umbral óptimo de 0,74).
- No soporta tool calling, ni razonamiento multi-paso, ni generación de texto libre: es exclusivamente un modelo de clasificación.
- No incluye capacidades multimodales ni de visión.

## Casos de uso

- Analisis de personalidad en redes sociales: dado un texto de un perfil de Twitter o Reddit, el modelo puede clasificar si el autor muestra preferencia por la intuicion (N) frente a la sensacion (S), util para estudios sociologicos o de marketing.
- Filtrado de candidatos en procesos de seleccion: analizando respuestas abiertas de cuestionarios, se puede obtener una senal sobre el perfil MBTI del candidato, aunque con cautela por la validez psicometrica.
- Recomendacion de contenido personalizado: plataformas de aprendizaje o entretenimiento pueden usar la clasificacion para adaptar sugerencias segun el estilo cognitivo del usuario.
- Investigacion academica en psicologia computacional: el modelo sirve como herramienta para anotar grandes volumenes de texto con etiquetas MBTI, acelerando estudios correlacionales.
- Chatbots de coaching o desarrollo personal: integrado en un sistema conversacional, puede inferir el perfil del usuario y adaptar el tono o los consejos.
- Moderacion de comunidades online: detectar si los mensajes de un usuario tienden a un estilo intuitivo o sensorial, ayudando a segmentar foros o grupos de discusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible. Los unicos datos de rendimiento provienen de la evaluacion interna del autor durante el entrenamiento. La siguiente tabla resume los resultados finales declarados en la model card:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 4,5747 |
| F1 | 0,6343 |
| Threshold optimo | 0,74 |
| F1 con threshold 0,5 | 0,6262 |

Estos valores indican un rendimiento moderado, pero sin contexto comparativo ni descripcion del conjunto de evaluacion, no es posible valorar su calidad relativa.

## Requisitos de hardware

- VRAM estimada: en precision fp32, el modelo ocupa aproximadamente 1,4 GB (355 M parametros × 4 bytes). En fp16, unos 0,7 GB; en int8, unos 0,35 GB. Para inferencia con batch pequeno, una GPU con 4-6 GB de VRAM es suficiente.
- GPUs recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM, como RTX 2060, RTX 3060, RTX 4060, o superiores. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 16 GB o mas (RTX 4090, A100, etc.).
- Despliegue: compatible con la libreria Transformers de Hugging Face, y puede servirse mediante TGI (Text Generation Inference) o como endpoint de clasificacion con FastAPI. No es adecuado para llama.cpp o vLLM, que estan orientados a modelos generativos.
- Latencia: en una GPU moderna, la inferencia de un texto de 512 tokens tarda del orden de 10-50 ms, dependiendo del hardware y del batch. El throughput tipico en una RTX 3090 es de cientos de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de clasificacion MBTI. No hay datos publicos de modelos equivalentes en cuanto a rendimiento o arquitectura especifica. Como referencia general, RoBERTa-large supera a RoBERTa-base y a BERT-large en tareas de clasificacion de texto en ingles, pero no se conocen cifras concretas para esta tarea concreta. Por tanto, la comparativa se limita a:

| Modelo | Parametros | Contexto | Licencia | Rendimiento en MBTI |
|---|---|---|---|---|
| roberta-large_MBTI_N (este) | 355 M | 512 | no disponible | F1 0,6343 (declarado) |
| RoBERTa-large original | 355 M | 512 | MIT | no evaluado en MBTI |
| RoBERTa-base | 125 M | 512 | MIT | no evaluado en MBTI |

## Limitaciones y advertencias

- Sesgos y validez psicometrica: la clasificacion de personalidad a partir de texto es inherentemente aproximada y puede estar sesgada por el estilo de escritura, el tema tratado o el idioma. No debe utilizarse como herramienta diagnostica profesional.
- Dataset de entrenamiento desconocido: no se especifica la procedencia ni el tamano del corpus, lo que impide evaluar su representatividad y posibles sesgos de seleccion.
- Sobreajuste evidente: la perdida de validacion aumenta en las ultimas epocas (de 2,84 en el paso 1400 a 4,57 al final), mientras que la perdida de entrenamiento sigue bajando, indicando que el modelo memoriza los datos de entrenamiento.
- Licencia no declarada: no se indica la licencia del modelo, lo que genera incertidumbre legal para uso comercial o redistribucion.
- Idiomas no especificados: aunque RoBERTa preentrenado es ingles, el fine-tuning podria haberse realizado en otro idioma; sin confirmacion, el uso en otros idiomas es arriesgado.
- Sin benchmarks estandar: la ausencia de evaluaciones en conjuntos de referencia impide comparar su calidad con otros modelos de clasificacion.
- Umbral optimo alto (0,74): sugiere que el modelo es conservador en sus predicciones, lo que puede provocar muchos falsos negativos si se usa con el umbral por defecto de 0,5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_N_MBTI_agg_balanced_50_1e-05
- Documentacion de RoBERTa en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/roberta.md
- Referencia de RoBERTa-large en CodeSOTA: https://www.codesota.com/model/roberta-large
- Pagina de RoBERTa-large en Microsoft Foundry Models: https://ai.azure.com/catalog/models/roberta-large
