# salmanhadli/ModernBERT-sentiment-model

## Resumen

ModernBERT-sentiment-model es un clasificador de sentimiento en ingles de tres clases (`negative`, `neutral`, `positive`) obtenido por ajuste fino completo de `answerdotai/ModernBERT-base`. Lo publica el usuario salmanhadli en Hugging Face y esta pensado como linea base funcional para analisis de sentimiento sobre texto informal de Twitter, no como modelo de produccion. Cuenta con 149.607.171 parametros y una licencia Apache 2.0.

El modelo resuelve una tarea acotada: asignar una de tres etiquetas a un fragmento corto de texto en ingles. Su interes practico esta en que demuestra el flujo de ajuste fino de ModernBERT, una arquitectura encoder-only presentada en diciembre de 2024 que moderniza BERT con atencion lineal alternativa, RoPE y contexto de hasta 8192 tokens, y que sirve como alternativa eficiente en coste frente a los modelos decoder-only para clasificacion y recuperacion.

La relevancia del checkpoint es limitada pero clara: fue entrenado en unos seis minutos (365 s) sobre 1.839 tweets y alcanza un 65,86 % de exactitud y 0,6485 de F1 macro en el conjunto de test, con un rendimiento notablemente bajo en la clase `neutral` (F1 0,47). La model card lo declara explicitamente como linea base y no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only bidireccional (ModernBERT) |
| Parametros totales | 149.607.171 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en el modelo base; en este ajuste fino se entreno con entradas truncadas a 128 tokens |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (`en`) unicamente |
| Licencia | apache-2.0 (el dataset de origen no declara licencia) |
| Formato de pesos | safetensors |
| Tarea | text-classification (analisis de sentimiento, 3 clases) |
| Etiquetas | 0 = negative, 1 = neutral, 2 = positive |
| Tamano del repositorio | 0,6 GB |
| Libreria | transformers (requiere transformers >= 4.48) |
| Modelo base | answerdotai/ModernBERT-base |
| Dataset de ajuste | cardiffnlp/tweet_sentiment_multilingual, configuracion `english` |

## Arquitectura y entrenamiento

La base es ModernBERT, un transformer encoder-only bidireccional que introduce mejoras de eficiencia sobre BERT clasico: atencion con mecanismos alternativos (atencion local y global alternada) para reducir el coste cuadratico, codificacion posicional rotatoria (RoPE), mayor profundidad y soporte nativo de secuencias largas. Sobre esa base, este checkpoint aplica un ajuste fino completo de todas las capas para una cabeza de clasificacion de tres clases, con una secuencia maxima de 128 tokens.

El entrenamiento se realizo con el `Trainer` de Hugging Face en bf16 sobre GPU, con estos hiperparametros: tasa de aprendizaje 2e-5 con decaimiento lineal, tamano de lote 32 en entrenamiento y evaluacion, 3 epochs (174 pasos), weight decay 0,01, optimizador AdamW fusionado, semilla 42 y seleccion del checkpoint por mejor F1 ponderado en validacion. Se uso el conjunto de datos Tweet Sentiment Multilingual (configuracion inglesa) con sus splits oficiales, todos perfectamente balanceados: 1.839 ejemplos de entrenamiento (613 por clase), 324 de validacion (108 por clase) y 870 de test (290 por clase). Los pesos publicados corresponden al checkpoint de la epoch 2. El autor informa de un tiempo de entrenamiento de 365 segundos. La model card indica que el padding no altera las predicciones: el padding dinamico y el padding a 128 coincidieron en los 300 ejemplos de test comprobados, algo relevante en modelos encoder con atencion bidireccional.

## Capacidades

- Clasificacion de sentimiento en ingles en tres clases: `negative`, `neutral`, `positive`, con puntuaciones por etiqueta si se solicita `top_k=None`.
- Procesamiento de texto corto e informal (tweets): maneja menciones, hashtags, abreviaturas y jerga de la plataforma.
- Inferencia determinista respecto al padding: las predicciones no cambian entre padding dinamico y padding fijo a 128 tokens.
- Integracion directa con el pipeline `text-classification` de transformers, incluido text-embeddings-inference y endpoints compatibles.
- Entradas truncadas a 128 tokens; el comportamiento con textos notablemente mas largos no fue evaluado, aunque el modelo base soporte contextos mayores.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto libre. Es exclusivamente un clasificador.

## Casos de uso

- Prototipado rapido de analisis de sentimiento en redes sociales: sirve como linea base para medir si merece la pena invertir en un modelo mayor o en mas datos etiquetados, dado que se puede reentrenar en minutos.
- Etiquetado previo de grandes volumenes de tweets en ingles: al ser un encoder de 149,6 M de parametros, el coste por inferencia es muy bajo y permite procesar lotes grandes en CPU o en una GPU modesta.
- Filtrado de menciones en un panel de escucha social: usar la puntuacion como senal de ranking para priorizar mensajes, no como decision binaria, ya que la calibracion de las probabilidades no esta garantizada.
- Docencia y experimentacion con ModernBERT: el repositorio incluye tokenizer y una receta de ajuste fino reproducible (learning rate, epochs, semilla), lo que lo convierte en un ejemplo util para aprender el flujo completo en `transformers`.
- Analisis comparativo de tecnicas de ajuste fino: permite contrastar el efecto del numero de epochs o del checkpoint seleccionado, ya que la model card publica las metricas de validacion por epoch.
- Deteccion de polaridad en encuestas abiertas o formularios cortos en ingles, siempre que se asuma la confusion entre `neutral` y `negative` y se valide el resultado con anotacion humana.
- Preanotacion en un flujo de anotacion asistida: el modelo propone una etiqueta y el anotador la corrige, reduciendo el esfuerzo cuando el sentimiento es claramente positivo o negativo (F1 de 0,76 y 0,71 respectivamente).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el split de test de `cardiffnlp/tweet_sentiment_multilingual` (configuracion `english`, n = 870). No estan verificados de forma independiente por terceros.

| Metrica | Valor |
|---|---|
| Accuracy | 0,6586 |
| F1 (macro) | 0,6485 |
| Loss | 0,7422 |

Metricas por clase en el conjunto de test (n = 290 por clase):

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| negative | 0,63 | 0,82 | 0,71 | 290 |
| neutral | 0,55 | 0,41 | 0,47 | 290 |
| positive | 0,78 | 0,74 | 0,76 | 290 |

Matriz de confusion de la reevaluacion independiente en fp32 sobre CPU (filas = clase real):

| Real \ Predicho | negative | neutral | positive |
|---|---|---|---|
| negative | 238 | 43 | 9 |
| neutral | 118 | 118 | 54 |
| positive | 21 | 54 | 215 |

Evolucion por epoch en validacion (n = 324):

| Epoch | Train loss | Val loss | Accuracy | F1 (macro) |
|:-:|:-:|:-:|:-:|:-:|
| 1 | 0,9536 | 0,8058 | 0,6019 | 0,5980 |
| 2 | 0,6855 | 0,7537 | 0,6821 | 0,6790 |
| 3 | 0,5035 | 0,8067 | 0,6759 | 0,6778 |

La reevaluacion independiente de los pesos publicados en fp32 sobre CPU da 0,6563 de accuracy y 0,7420 de loss, dentro de dos ejemplos de las cifras anteriores. No hay benchmarks adicionales (GLUE, MMLU, HumanEval ni similares) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 149,6 M de parametros, no medida): aproximadamente 0,6 GB en fp32, 0,3 GB en fp16/bf16 y 0,15 GB en int8. Con activaciones y overhead del runtime, un presupuesto de 1 a 2 GB es suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona holgadamente en RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 y H100. No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos diez anos, e incluso en graficas integradas con soporte de inferencia.
- Inferencia en CPU: perfectamente viable para esta tarea; con 128 tokens de entrada, un solo nucleo moderno procesa lotes pequenos con latencia de decenas de milisegundos por ejemplo. No hay cifras de latencia o throughput publicadas por el autor.
- Opciones de despliegue: pipeline de transformers, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (el repositorio esta marcado como compatible con endpoints), ONNX Runtime o TorchScript para optimizacion en CPU. vLLM y llama.cpp estan orientados a modelos generativos y no son la via natural para este encoder, aunque llama.cpp no ofrece soporte estandar para ModernBERT.
- El repositorio, de 0,6 GB, se descarga y carga en memoria sin dificultad en entornos con recursos limitados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Datos publicados |
|---|---|---|---|---|---|
| salmanhadli/ModernBERT-sentiment-model | 149,6 M | 8192 tokens en la base; ajustado a 128 | ingles | apache-2.0 | Accuracy 0,6586 y F1 macro 0,6485 en el test de Tweet Sentiment Multilingual (ingles) |
| answerdotai/ModernBERT-base (modelo base, sin ajustar) | 149 M aprox. | 8192 tokens | ingles | apache-2.0 | No aplica a esta tarea de clasificacion de sentimiento; no disponible |
| clapAI/modernBERT-large-multilingual-sentiment | no disponible | no disponible | 16 o mas idiomas, entre ellos ingles, espanol, frances, aleman, portugues, italiano, ruso, arabe, japones, coreano, chino y vietnamita | no disponible en la informacion proporcionada | no disponible |
| cardiffnlp/twitter-roberta-base-sentiment-latest | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas no puede completarse porque la informacion disponible no incluye metricas de los otros modelos sobre el mismo conjunto de evaluacion. La diferencia mas clara es de cobertura linguistica: este checkpoint es solo en ingles, mientras que alternativas como la de clapAI cubren mas de 16 idiomas.

## Limitaciones y advertencias

- Precision limitada: aproximadamente un 66 % de exactitud, es decir, cerca de una prediccion de cada tres es incorrecta. No debe usarse para tomar decisiones sobre personas ni como unica senal en moderacion o monitorizacion.
- Confusion sistematica en la clase `neutral`: en la reevaluacion, 118 de 290 tweets neutros (41 %) se predijeron como negativos. El modelo sobrepredice `negative` (precision 0,63 frente a recall 0,82). Si los datos contienen muchos mensajes neutros, una gran parte se etiquetara como negativa.
- Conjunto de entrenamiento muy pequeno (1.839 tweets): cabe esperar fragilidad ante sarcasmo, negacion, sentimiento mixto y textos distintos de tweets en ingles, como resenas, noticias o contenido tecnico.
- Confianza no calibrada: en la reevaluacion, la puntuacion media de la etiqueta superior fue 0,76 en aciertos y 0,64 en errores, y el 6 % de las predicciones erroneas supero 0,9. Las puntuaciones deben usarse como criterio de ordenacion, no como probabilidad de acierto.
- Idioma: solo ingles, pese a que el dataset de origen sea multilingue. Hereda sesgos de los tweets de entrenamiento y de los datos de preentrenamiento del modelo base.
- Longitud: entrenado con entradas truncadas a 128 tokens. Aunque ModernBERT soporte contextos mucho mayores, ese comportamiento no se ha probado en este ajuste.
- Licencia del modelo Apache 2.0, pero el dataset `cardiffnlp/tweet_sentiment_multilingual` no declara licencia y los tweets estan sujetos a los terminos de la plataforma. Conviene revisar ambos aspectos antes de cualquier uso comercial.
- Sin verificacion externa: las metricas del `model-index` figuran como no verificadas (`verified: false`), aunque el autor publica una reevaluacion propia en CPU que reproduce las cifras.
- Sin datos de rendimiento en produccion: no se documentan latencia, throughput, consumo de memoria ni comportamiento bajo carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salmanhadli/ModernBERT-sentiment-model
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de ajuste: https://huggingface.co/datasets/cardiffnlp/tweet_sentiment_multilingual
- Documentacion de ModernBERT en transformers: https://huggingface.co/docs/transformers/model_doc/modernbert
- Repositorio de ModernBERT de AnswerDotAI: https://github.com/AnswerDotAI/ModernBERT
- Articulo de ModernBERT: https://arxiv.org/abs/2412.13663
- Documentacion de ModernBERT en el repositorio de transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/modernbert.md
- Alternativa multilingue de sentimiento basada en ModernBERT: https://huggingface.co/clapAI/modernBERT-large-multilingual-sentiment
- Articulo del dataset XLM-T (Barbieri et al., 2022): https://aclanthology.org/2022.lrec-1.252/
