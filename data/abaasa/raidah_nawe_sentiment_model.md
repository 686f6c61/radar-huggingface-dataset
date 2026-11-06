# Abaasa/Raidah_Nawe_sentiment_model

## Resumen

Raidah_Nawe_sentiment_model es un clasificador binario de sentimiento (positivo/negativo) obtenido mediante fine-tuning de `distilbert-base-uncased`, un transformer encoder destilado de BERT. Lo publica el usuario Abaasa en Hugging Face y esta pensado especificamente para analisis de sentimiento sobre resenas cinematograficas en ingles, ya que se entrena sobre el dataset `stanfordnlp/imdb`.

El modelo resuelve una tarea acotada y bien definida: asignar una etiqueta de polaridad a un texto corto o medio en ingles. Con 66.955.010 parametros y un tamano de repositorio de 0,3 GB en formato safetensors, es lo bastante ligero para ejecutarse en CPU o en GPUs de consumo con latencia baja, lo que lo hace util como componente de clasificacion dentro de pipelines mayores.

Su relevancia es practica mas que innovadora: no introduce arquitecturas nuevas ni modos de razonamiento, pero ofrece un punto de partida rapido y economico para tareas de moderacion, triaje de opiniones o enrutamiento de resenas. La model card reporta una accuracy de 0,9890 y un F1 de 0,9886 en el conjunto de test, si bien no se detalla la metodologia de evaluacion ni el preprocesado aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica via PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT, con 6 capas y 66 millones de parametros, destilado del `bert-base-uncased` original. El modelo base emplea atencion bidireccional completa y se preentrena con objetivos de modelado de lenguaje enmascarado y destilacion de las distribuciones del profesor. Sobre esa base, el autor aplica un fine-tuning supervisado para clasificacion binaria de sentimiento anadiendo una cabeza de clasificacion sobre el token `[CLS]`.

El dataset de entrenamiento es `stanfordnlp/imdb`, compuesto por 50.000 resenas cinematograficas etiquetadas como positivas o negativas, con un equilibrio aproximado de 25.000 por clase y una longitud media de varios cientos de tokens. La model card no especifica hiperparametros (learning rate, batch size, numero de epocas), ni si se aplico aumento de datos o validacion cruzada. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un clasificador de este tipo. No se declaran innovaciones tecnicas destacables mas alla del fine-tuning estandar.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en textos en ingles.
- Analisis de resenas y opiniones de longitud corta a media (hasta el limite de contexto del encoder).
- Etiquetado de polaridad a nivel de documento, no a nivel de aspecto ni de entidad.
- Integracion sencilla en pipelines de `transformers` mediante `pipeline("text-classification")`.
- Ejecucion en CPU con latencia aceptable gracias al reducido numero de parametros.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Capacidad multilingue limitada al ingles; el vocabulario `uncased` de BERT no cubre de forma robusta otros idiomas.

## Casos de uso

- Moderacion de resenas de cine y plataformas de streaming: el modelo clasifica rapidamente cada resena como positiva o negativa para priorizar la revision humana de las negativas o detectar campanas de desprestigio.
- Triaje de opiniones de producto en comercio electronico: se puede aplicar a resenas en ingles para enrutar las negativas a equipos de atencion al cliente y las positivas a marketing.
- Analisis de sentimiento en encuestas abiertas: procesar respuestas textuales de usuarios angloparlantes y agregar la polaridad por segmento o cohorte.
- Clasificacion de comentarios en foros y redes: filtrar toxicidad indirecta o malestar en hilos de discusion sobre estrenos y series.
- Etiquetado de datasets para entrenamiento: usar el modelo como anotador debil o preetiquetador en corpus de resenas, reduciendo el coste de anotacion manual antes de una revision humana.
- Enrutamiento en pipelines RAG o de atencion al cliente: clasificar la polaridad de un mensaje entrante para decidir si se deriva a un agente humano o a una respuesta automatica.
- Analisis de opinion sobre peliculas en investigacion academica: replicar experimentos de sentiment analysis sobre IMDB con un modelo ligero y reproducible.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Accuracy (test) | 0,9890 |
| F1 (test) | 0,9886 |

Los datos proceden de la model card del autor. No se especifica el tamano exacto del split de test, el preprocesado aplicado ni si hubo limpieza de duplicados. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos, con overhead adicional de activaciones y tokenizador; en la practica cabe en cualquier GPU con 1 GB o mas.
- VRAM estimada en FP16: en torno a 0,14 GB para pesos.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de estas ultimas por su tamano reducido.
- Cabe holgadamente en GPUs de consumo e incluso en CPU; es viable en entornos sin GPU.
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, ONNX Runtime, FastAPI con `transformers`, o exportacion a GGUF/llama.cpp si se convierte manualmente (no documentado por el autor).
- Throughput estimado: no disponible en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y moderado en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| Raidah_Nawe_sentiment_model | 66.955.010 | 512 (heredado) | no disponible | en | safetensors |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 | Apache 2.0 | en | safetensors |
| roberta-base (fine-tuned para sentimiento, variantes) | ~125 M | 512 | MIT / Apache 2.0 segun variante | en | safetensors |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 | MIT | en (multilingue en variantes) | safetensors |

La comparativa se limita a parametros, contexto, licencia e idioma porque no se han publicado resultados de benchmarks comparables en la informacion disponible. La principal diferencia frente a alternativas consolidadas es la ausencia de licencia declarada, lo que complica su adopcion en produccion.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso para uso comercial ni redistribucion; es un riesgo legal relevante para produccion.
- Entrenado exclusivamente sobre resenas de IMDB, por lo que puede generalizar mal a otros dominios (redes sociales, soporte tecnico, opiniones de producto).
- Solo soporta ingles; el vocabulario `uncased` no maneja bien otros idiomas ni jerga muy informal.
- Riesgo de sesgo hacia el dominio cinematografico y hacia el estilo de escritura de IMDB (resenas largas y argumentadas).
- Riesgo de alucinacion bajo en clasificacion, pero el modelo puede asignar polaridad erronea en textos ironicos, sarcasticos o con sentimiento mixto.
- La model card incluye ejemplos de predicciones sin etiquetas asociadas y una seccion de limitaciones con una frase ambigua, lo que dificulta evaluar su comportamiento real.
- No se documentan hiperparametros, split de validacion ni metodologia de evaluacion; la accuracy de 0,9890 debe tomarse con cautela hasta replicarse.
- No apto para tareas generativas, de razonamiento, tool calling ni agentes.
- Longitud de contexto de 512 tokens: textos mas largos se truncan y pueden perder informacion relevante para la polaridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abaasa/Raidah_Nawe_sentiment_model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/stanfordnlp/imdb
