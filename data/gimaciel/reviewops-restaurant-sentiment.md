# gimaciel/reviewops-restaurant-sentiment

## Resumen

ReviewOps Restaurant Sentiment es un clasificador binario de sentimiento en ingles obtenido mediante fine-tuning de `distilbert/distilbert-base-uncased` sobre frases etiquetadas de resenas de restaurantes. Lo publica el usuario gimaciel como componente de aprendizaje supervisado de su proyecto de portfolio ReviewOps AI, que lo empareja con un pipeline de recuperacion de informacion para operaciones de restaurante. Predice dos clases: negativa (0) y positiva (1).

El modelo es deliberadamente pequeno y acotado: DistilBERT con 66.955.010 parametros, entrenado sobre un subconjunto de solo 1.000 frases (996 utiles tras limpieza) del dataset UCI Sentiment Labelled Sentences, en su particion de resenas de Yelp. No es un modelo de proposito general ni un sistema listo para produccion: es un artefacto de experimentacion educativa con metricas reproducibles y un baseline clasico comparado.

Su relevancia es metodologica mas que de capacidad: documenta de forma explicita la procedencia de los datos, la semilla de particion, el hash SHA-256 del archivo fuente, el criterio de seleccion de checkpoint y las metricas de calibracion (Brier, ECE), ademas de declarar sin ambages que los resultados no se extrapolan a portugues, a pedidos de iFood ni a mensajes reales de atencion al cliente. Para un desarrollador que evalua rapidamente, sirve como ejemplo de ficha honesta y como pieza de bajo coste para prototipar clasificacion de sentimiento en dominio anglosajon de restauracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de posicion maxima del modelo base; el fine-tuning uso truncamiento a 192 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un encoder de ~67 M de parametros, es viable en fp32, fp16 e int8 con herramientas estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es DistilBERT, un transformer encoder de 6 capas y 66,9 M de parametros obtenido por destilacion de BERT-base, con vocabulario uncased. Sobre esa base se anadio una cabeza de clasificacion binaria y se ajusto con objetivo de entropia cruzada. La configuracion reportada es de 3 epocas, batch size 8, learning rate 2e-5, longitud maxima de 192 tokens y semilla 42, seleccionando el checkpoint con mejor macro-F1 de validacion (registrado localmente como `checkpoint-176`). La perdida de entrenamiento registrada fue 0.268429.

Los datos provienen del UCI Sentiment Labelled Sentences (dataset 331), subconjunto Yelp, con licencia CC BY 4.0 y atribucion a Kotzias et al., *From Group to Individual Labels using Deep Features* (KDD 2015). El subconjunto original tiene 1.000 frases balanceadas (500 por clase); tras eliminar textos inutilizables, duplicados exactos normalizados y grupos con etiquetas contradictorias quedaron 996 registros, divididos de forma estratificada en 697 de entrenamiento, 149 de validacion y 150 de test, con semilla 42. El hash SHA-256 del archivo fuente es `afc26626d710899948693e1a61405dce197f57ffa719fa1130d346b4cc095343`. No se usaron datos privados de clientes ni de plataformas. No se reporta RLHF, DPO ni aumentacion de datos; tampoco innovaciones de decodificacion, al tratarse de una tarea discriminativa.

## Capacidades

- Clasificacion binaria de sentimiento (negativo/positivo) sobre texto en ingles, orientada a frases de resenas de restaurantes.
- Salida de probabilidad por clase, apta para umbralizacion y para analisis de calibracion (el autor reporta Brier y ECE de 10 bins).
- Procesamiento de entradas de hasta 192 tokens efectivos en el regimen de entrenamiento (el encoder admite hasta 512 posiciones).
- Inferencia de baja latencia en CPU y GPU modesta por el tamano reducido del modelo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, vision ni audio.
- Multilingue: no; solo ingles, y el autor advierte explicitamente de la falta de validez en portugues.

## Casos de uso

- Prototipado rapido de analitica de opiniones: ingerir resenas de restaurantes en ingles desde un export de Yelp o Google Places y agregar el porcentaje de sentimiento negativo por local, usando el modelo como clasificador por frase con umbral ajustable.
- Baseline en un pipeline de NLP: servir como referencia de comparacion antes de invertir en un modelo mayor o en un LLM, ya que el autor documenta una mejora de 9,37 puntos de macro-F1 frente a TF-IDF con regresion logistica sobre la misma particion de 150 ejemplos.
- Filtrado previo en sistemas de alertas: marcar resenas negativas para revision humana en un panel de operaciones, aprovechando la calibracion reportada (ECE de 0,0499 en test) para ordenar por confianza en lugar de tratar la probabilidad como certeza de negocio.
- Enriquecimiento de datasets docentes: usar el modelo y su script de entrenamiento como ejemplo reproducible de fine-tuning de DistilBERT con particion estratificada, semilla fija y hash de dataset en cursos de machine learning aplicado.
- Etiquetado asistido en anotacion: preanotar frases de resenas en ingles para que un anotador humano corrija, reduciendo el coste inicial de construir un corpus mayor.
- Pruebas de regresion de infraestructura de inferencia: por su tamano (repo de 0,3 GB) y formato safetensors, sirve para validar despliegues de `transformers`, endpoints de Hugging Face Inference o contenedores de servicio antes de migrar a modelos de mayor coste.

## Benchmarks y rendimiento

| Metrica | Validacion (149) | Test (150) |
|---|---|---|
| Accuracy | 0,92617 | 0,91333 |
| Macro-F1 | 0,92612 | 0,91330 |
| Brier score (menor es mejor) | 0,07027 | 0,07132 |
| ECE de 10 bins (menor es mejor) | 0,05765 | 0,04994 |

Metricas por clase en el conjunto de test:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| Negativa | 0,8974 | 0,9333 | 0,9150 | 75 |
| Positiva | 0,9306 | 0,8933 | 0,9116 | 75 |

Matriz de confusion en test (filas = real, columnas = predicho; orden negativo, positivo): `[[70, 5], [8, 67]]`.

Comparacion con baseline clasico en la misma particion de test:

| Metrica de test | TF-IDF + regresion logistica | Este modelo |
|---|---|---|
| Accuracy | 0,8200 | 0,9133 |
| Macro-F1 | 0,8196 | 0,9133 |
| Errores de clasificacion | 27 | 13 |

El autor advierte de que se trata de una unica ejecucion con semilla fija y de que la diferencia no constituye un resultado estadisticamente contrastado entre dominios. No se publican resultados en MMLU, HumanEval ni GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 (67 M de parametros, ~268 MB de pesos) y del orden de 150 MB en fp16; el cuello de botella es el batch y la longitud de secuencia, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo no requiere A100 ni H100. Una RTX 4090 o una T4 lo ejecutan muy por debajo de su capacidad.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: pipeline `text-classification` de `transformers`, Hugging Face Inference Endpoints, TorchServe o un contenedor FastAPI propio. Al ser un encoder BERT, es compatible con `optimum` y con exportacion a ONNX; no se documenta soporte especifico para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en el orden de milisegundos por frase en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReviewOps Restaurant Sentiment (este) | 66,96 M | 512 posiciones (192 en entrenamiento) | Clasificacion binaria de sentimiento en resenas de restaurante en ingles | no disponible | Hugging Face, 0 descargas |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 | Clasificacion binaria de sentimiento en ingles, entrenado sobre SST-2 (resenas de cine) | Apache 2.0 | Hugging Face, ampliamente usado |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 | Clasificacion de sentimiento en tres clases sobre texto social en ingles | no disponible en la informacion consultada | Hugging Face |
| TF-IDF + regresion logistica (baseline del propio autor) | no aplica | no aplica | Bolsa de palabras con clasificador lineal | no aplica | Codigo del proyecto |

La comparacion de rendimiento entre estos modelos no esta disponible: el autor solo contrasta contra su baseline clasico en la misma particion de test. Cualquier comparacion con SST-2 o con modelos de sentimiento social exigiria evaluacion cruzada que no se ha publicado.

## Limitaciones y advertencias

- Dominio y idioma: entrenado sobre un subconjunto de Yelp en ingles; el autor declara explicitamente que no es valido para portugues de Brasil ni para feedback de pedidos de iFood.
- Cobertura de etiquetas: solo positivo y negativo; el sentimiento neutro, el sarcasmo y las opiniones mixtas pueden clasificarse mal.
- Tamano de la evidencia: 150 ejemplos de test y una unica ejecucion con semilla fija; no hay intervalos de confianza entre semillas ni validacion temporal independiente.
- Calibracion fragil: el ECE de 0,0499 se calcula sobre 150 observaciones y el propio autor advierte de su ruido; la confianza del modelo no debe tratarse como certeza de negocio.
- Sesgos: no se reporta analisis de subgrupos demograficos ni de sesgos conocidos; al derivar de DistilBERT, hereda los sesgos del corpus original de BERT y de Yelp.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si en forma de falsos positivos y falsos negativos con alta confianza; la matriz de confusion muestra 13 errores en 150 casos.
- Uso previsto restringido: el autor prohibe explicitamente su uso para decisiones autonomas de reembolso, triaje de seguridad, consejo medico o legal, o clasificacion de clientes sensibles sin politica validada y revision humana.
- Licencia: no disponible; la ausencia de licencia explicita impide asumir permisos de uso comercial. La licencia del dataset subyacente es CC BY 4.0 y las dependencias conservan las suyas.
- Reproducibilidad: el README remite a un repositorio GitHub de ReviewOps AI cuya URL publica aun no consta; el codigo de entrenamiento no esta enlazado en la informacion disponible.
- Adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gimaciel/reviewops-restaurant-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset UCI Sentiment Labelled Sentences (dataset 331): https://archive.ics.uci.edu/dataset/331/sentiment+labelled+sentences
- Paper de atribucion del dataset, Kotzias et al., KDD 2015: no disponible como enlace en la informacion proporcionada
- Repositorio GitHub de ReviewOps AI: no disponible (el autor indica que la URL publica se anadira tras la publicacion)
