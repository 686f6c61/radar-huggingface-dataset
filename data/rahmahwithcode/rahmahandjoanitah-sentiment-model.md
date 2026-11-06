# RahmahwithCode/rahmahandjoanitah-sentiment-model

## Resumen

`rahmahandjoanitah-sentiment-model` es un clasificador binario de sentimiento (positivo / negativo) obtenido mediante fine-tuning de `distilbert-base-uncased`. Lo desarrollan Namugwanya Rahmah y Nattabi Joanitah, y se publica bajo el identificador `RahmahwithCode` en Hugging Face. El modelo resuelve una tarea acotada y bien definida: asignar una etiqueta de polaridad a un texto en ingles, con una puntuacion de confianza asociada.

Arquitectura y tamano son los de DistilBERT: un transformer encoder destilado de BERT-base, con 66.955.010 parametros totales segun los pesos en safetensors, lo que lo situa en la franja de modelos ligeros aptos para inferencia en CPU y en GPU de consumo. El repositorio ocupa aproximadamente 0,5 GB y los pesos se distribuyen en formato safetensors.

Su relevancia es practica mas que innovadora: sirve como componente de clasificacion rapida en pipelines de analisis de opiniones, moderacion o enrutado, siempre que el dominio de entrada se parezca al corpus de entrenamiento (resenas de cine en ingles). No se dispone de informacion sobre la longitud de contexto soportada, los tipos de cuantizacion probados ni la licencia de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas obtenido por destilacion de conocimiento a partir de BERT-base, y anade una cabeza de clasificacion sobre la representacion del token `[CLS]` para producir dos clases (positivo y negativo). El tokenizador es el WordPiece sin distincion de mayusculas propio de la familia BERT.

El ajuste fino se realizo sobre un dataset que la model card identifica como `rahmahandjoanitah-sentiment-model`, descrito como resenas de peliculas en ingles. No se especifica el numero de ejemplos, la composicion exacta del corpus, la presencia de validacion cruzada ni si se aplicaron tecnicas de regularizacion o balanceo de clases. Tampoco se documenta el uso de RLHF, DPO ni ningun otro ajuste por preferencias, algo esperable en un clasificador de este tipo. No se han publicado detalles sobre hiperparametros, semillas ni proceso de seleccion del mejor checkpoint.

## Capacidades

- Clasificacion binaria de sentimiento (POSITIVE / NEGATIVE) con puntuacion de probabilidad asociada.
- Analisis de opinion sobre texto corto en ingles, especialmente resenas y opiniones de productos o contenido audiovisual.
- Inferencia ligera: 66,9 millones de parametros permiten ejecucion en CPU con latencia baja.
- Integracion directa con el pipeline `text-classification` de Transformers.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo de razonamiento explicito (thinking mode).
- No procesa vision ni audio.
- Capacidad multilingue limitada: solo ingles declarado; la propia model card senala dificultades con texto mezclado Luganda/ingles.

## Casos de uso

- Analisis de resenas de cine y series: el modelo se entrena sobre ese dominio, por lo que clasificar criticas o comentarios de usuarios en plataformas de contenido es su uso mas directo y fiable.
- Monitorizacion de reputacion en redes sociales: procesar menciones en ingles y agregar la polaridad para detectar picos de sentimiento negativo, con la cautela de que el dominio de entrenamiento es cinematografico.
- Enrutado en atencion al cliente: clasificar rapidamente un mensaje entrante como positivo o negativo para dirigirlo a un flujo de escalado o a una respuesta automatica, usando el score como umbral de confianza.
- Preetiquetado para anotacion humana: generar etiquetas iniciales sobre grandes volumenes de texto en ingles y reservar la revision manual para los casos con score bajo, reduciendo coste de anotacion.
- Filtrado de contenido en pipelines de datos: descartar o separar opiniones negativas en un corpus antes de un analisis posterior, como un modulo previo a un modelo generativo mayor.
- Analisis de encuestas abiertas: clasificar respuestas de texto libre en ingles y calcular la proporcion de opiniones negativas por segmento, con agregacion estadistica posterior.
- Componente de bajo coste en entornos sin GPU: al tener 66,9 millones de parametros, puede desplegarse en CPU dentro de un servicio web o una funcion serverless para clasificacion en tiempo real de bajo volumen.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| Accuracy | 0,91 |
| F1 | 0,91 |

No se especifica el tamano del conjunto de test, el metodo de calculo del F1 (binario, macro o weighted) ni la distribucion de clases. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (66,9 M de parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica cabe holgadamente en cualquier GPU con 1 GB o mas.
- En fp16 los pesos ocupan aproximadamente 0,13 GB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, RTX 3060, T4, L4 y GPUs integradas con soporte CUDA o ROCm.
- Cabe en GPU de consumo y tambien en CPU: es viable la inferencia en un portatil sin acelerador dedicado.
- Opciones de despliegue: pipeline de Transformers, TorchServe, FastAPI con `transformers`, ONNX Runtime, o conversion a llama.cpp no aplica (no es un modelo generativo). TGI y vLLM estan orientados a modelos generativos y no son la via natural para este clasificador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| rahmahandjoanitah-sentiment-model | 66.955.010 | no disponible | no disponible | Fine-tuning de DistilBERT sobre resenas de cine; accuracy 0,91 declarada |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens (heredado de BERT) | Apache 2.0 (modelo base) | Clasificador de sentimiento de referencia en el ecosistema Transformers, entrenado sobre SST-2 |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | no disponible en esta ficha | Clasificador de sentimiento orientado a redes sociales, con tres clases |
| ProsusAI/finbert | ~110 M | 512 tokens | no disponible en esta ficha | Clasificador de sentimiento especializado en dominio financiero |

La comparacion con estos modelos es orientativa: no se dispone de resultados de benchmarks comunes que permitan situar este modelo frente a ellos con rigor. La ventaja principal frente a alternativas mas grandes es el menor coste computacional; la desventaja es la ausencia de licencia declarada y de documentacion sobre el corpus de entrenamiento.

## Limitaciones y advertencias

- Dominio restringido: entrenado unicamente con resenas de peliculas en ingles, por lo que el rendimiento puede degradarse fuera de ese genero textual.
- Idioma: solo se declara ingles; la model card reconoce problemas con texto mezclado Luganda/ingles.
- Sarcasmo e ironia: el autor indica explicitamente que el modelo tiene dificultades con el sarcasmo, lo que puede producir clasificaciones erroneas con alta confianza.
- Ejemplo problematico documentado: la resena "The movie was okay, but the story was predictable" se clasifica como NEGATIVE con score 0,9989, lo que sugiere una calibracion agresiva hacia la clase negativa en textos mixtos o neutros.
- Riesgo de alucinacion: no aplica en sentido estricto al ser un clasificador, pero si existe riesgo de sobreconfianza en las probabilidades emitidas.
- Sesgos: no se documenta el proceso de construccion del dataset ni si se analizaron sesgos demograficos, de genero o culturales; al ser un corpus de resenas de cine, puede heredar sesgos de ese dominio.
- Licencia no declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial; es necesario contactar con los autores antes de integrarlo en un producto.
- Documentacion insuficiente para produccion: no se detalla el tamano del test set, la distribucion de clases ni el proceso de validacion, lo que limita la confianza en las metricas reportadas.
- Madurez: el repositorio tiene 46 descargas y 0 likes, lo que indica escasa validacion por parte de la comunidad.
- Sin informacion sobre contexto maximo: no se puede confirmar el limite de tokens de entrada, aunque por herencia de DistilBERT se espera 512, dato no verificado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RahmahwithCode/rahmahandjoanitah-sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
