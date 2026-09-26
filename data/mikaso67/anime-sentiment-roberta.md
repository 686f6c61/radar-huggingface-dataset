# mikaso67/anime-sentiment-roberta

## Resumen

`mikaso67/anime-sentiment-roberta` es un modelo de clasificacion de texto publicado por el usuario mikaso67 en Hugging Face. Consiste en un ajuste fino (fine-tuning) de `roberta-base` para clasificacion binaria de sentimiento sobre resenas de anime y manga escritas en ingles, tomadas del MyAnimeList Comment Dataset V2 disponible en Kaggle. El modelo resuelve un problema acotado: dado un texto de resena, decidir si la opinion es positiva o negativa.

Arquitectonicamente es un transformer encoder estandar con 124.647.170 parametros (aproximadamente 125 millones), la configuracion tipica de RoBERTa-base. La longitud de contexto utilizada en el entrenamiento es de 512 tokens. El modelo se distribuye unicamente en formato safetensors bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es practica mas que arquitectonica: es un clasificador ligero, entrenado en una T4 con solo 2 epochs sobre un subconjunto estratificado de 10.000 resenas, que reporta una accuracy de 0,966 y un F1 de 0,978 sobre 2.000 resenas de test. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no cuenta con validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.647.170 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud usada en entrenamiento; limite posicional de roberta-base) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; el autor no distribuye variantes GGUF, ONNX ni cuantizadas |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | FacebookAI/roberta-base |
| Tarea (pipeline) | text-classification |
| Numero de clases | 2 (positivo / negativo) |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base`, un transformer encoder con atencion completa y embeddings posicionales, y se ajusta como clasificador de secuencia con dos etiquetas de salida. No se introduce ninguna innovacion arquitectonica: es un fine-tuning estandar para clasificacion de sentimiento.

Los datos de entrenamiento proceden del MyAnimeList Comment Dataset V2 (Kaggle). El etiquetado es por umbral de puntuacion: las resenas con valoracion 1-4 se marcan como negativas, las de 8-10 como positivas y las de 5-7 se descartan. Se usa un subconjunto estratificado de 10.000 resenas con particion 80/20. La configuracion de entrenamiento documentada es: 512 tokens de longitud, 2 epochs, learning rate 2e-5, batch efectivo de 16 y precision fp16 sobre una GPU T4. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificacion binaria de sentimiento (positivo / negativo) sobre texto en ingles.
- Especializacion en el dominio de resenas de anime y manga de MyAnimeList.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para resenas de longitud media.
- Integracion directa con la pipeline `text-classification` de la libreria `transformers`.
- Inferencia por lotes (batch inference) para clasificar grandes volumenes de resenas.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No tiene capacidades de generacion de texto, codigo, matematicas ni vision.
- No dispone de modo de razonamiento explicito (thinking mode), audio ni multimodalidad.

## Casos de uso

- Moderacion y clasificacion de resenas en plataformas tipo MyAnimeList: el modelo permite etiquetar automaticamente el tono de cada resena al publicarse, alimentando paneles de reputacion o sistemas de ordenacion por sentimiento.
- Analisis de opinion en comunidades de anime: foros, subreddits y grupos de Discord donde se discuten series pueden procesarse por lotes para medir la recepcion de un estreno o de un episodio concreto.
- Enrutamiento de tickets de soporte en plataformas de streaming: un comentario clasificado como negativo puede dirigirse a colas de atencion prioritaria, mientras que los positivos van a encuestas de satisfaccion.
- Monitorizacion de marca para editoriales de manga y distribuidoras: seguimiento de la percepcion publica de un titulo o de un lanzamiento a lo largo del tiempo mediante clasificacion continua de menciones en ingles.
- Investigacion en PLN de dominio especifico: sirve como linea base reproducible para estudiar el rendimiento de clasificadores de sentimiento en texto informal de comunidades de nicho, comparandolo con el baseline TF-IDF + regresion logistica que el autor reporta (F1 = 0,952).
- Preprocesado para sistemas de recomendacion: la senal positiva o negativa extraida de resenas puede usarse como caracteristica adicional en un recomendador de titulos.
- Etiquetado asistido en pipelines de anotacion: el modelo puede preanotar grandes corpus de resenas en ingles para que anotadores humanos revisen solo los casos de baja confianza, reduciendo el coste de construccion de datasets.
- Filtrado previo de corpus para entrenamiento: descartar o separar resenas claramente negativas o positivas antes de usar el texto en otras tareas de PLN.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, evaluados sobre 2.000 resenas de test:

| Metrica | Resultado |
|---|---|
| Accuracy | 0,966 |
| F1 | 0,978 |
| Baseline TF-IDF + regresion logistica (F1) | 0,952 |

No se han publicado resultados en la informacion disponible para benchmarks estandar como MMLU, GLUE, SST-2, HumanEval o GSM8K. La evaluacion se limita al conjunto de test propio derivado del MyAnimeList Comment Dataset V2.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 y 0,25 GB en fp16, sin contar el overhead del runtime (activaciones y memoria del framework). Cifras calculadas a partir de los 124,6 millones de parametros, no publicadas por el autor.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, e incluso en CPU para lotes pequenos o moderados.
- El autor documento el uso de una GPU T4 para el entrenamiento (2 epochs, fp16), lo que confirma que el ajuste fino es viable en hardware de gama media o en cuadernos gratuitos de Colab.
- Opciones de despliegue: pipeline `text-classification` de `transformers`, inferencia por lotes con `datasets`, exportacion a ONNX Runtime mediante Optimum, TorchScript, y servicio mediante FastAPI o Hugging Face Inference Endpoints.
- No hay soporte documentado para vLLM ni para llama.cpp / Ollama, al tratarse de un modelo encoder de clasificacion y no de un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de benchmarks de los modelos alternativos, por lo que la comparacion se limita a caracteristicas estructurales y de licencia.

| Modelo | Parametros | Contexto | Clases | Licencia | Dominio |
|---|---|---|---|---|---|
| mikaso67/anime-sentiment-roberta | 124,6 M | 512 tokens | 2 | MIT | Resenas de anime y manga (MyAnimeList) |
| distilbert-base-uncased-finetuned-sst-2-english | no disponible | no disponible | 2 | no disponible | Resenas de cine (SST-2) |
| cardiffnlp/twitter-roberta-base-sentiment-latest | no disponible | no disponible | 3 | no disponible | Publicaciones de Twitter |
| siebert/sentiment-roberta-large-english | no disponible | no disponible | 2 | no disponible | Resenas generales en ingles |

El elemento diferenciador de este modelo es su especializacion de dominio: frente a clasificadores de sentimiento genericos, esta ajustado exclusivamente sobre resenas de anime y manga, lo que puede traducirse en mejor rendimiento en ese nicho y peor transferencia fuera de el. Los datos de rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Clasificacion forzada a dos clases: no existe una clase "mixta" o "neutra". Las resenas matizadas reciben obligatoriamente un veredicto positivo o negativo, lo que sesga la salida en opiniones ambiguas.
- Sensibilidad a la formulacion indirecta: el propio autor advierte que resenas que parecen positivas pero terminan con expresiones como "i'll pass" pueden clasificarse incorrectamente.
- Dominio muy restringido: entrenado sobre resenas de anime y manga en ingles. El rendimiento fuera de ese dominio (productos, servicios, redes sociales generales) no esta validado.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas, por lo que su uso en textos en espanol no es fiable.
- Limite de 512 tokens: las resenas mas largas se truncan, con perdida de informacion en la parte final del texto (precisamente donde el autor situa algunos de los fallos de clasificacion).
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no genera texto; el riesgo equivalente es la clasificacion erronea con alta confianza.
- Sesgos heredados del dataset: el MyAnimeList Comment Dataset V2 refleja los sesgos de la comunidad de MyAnimeList, incluyendo posibles desequilibrios de genero, genero narrativo o popularidad de las obras. La particion 80/20 sobre un subconjunto de 10.000 resenas es pequena y puede no representar la distribucion real de la plataforma.
- Evaluacion limitada: solo 2.000 resenas de test y un unico conjunto de validacion. No hay evaluacion cruzada ni pruebas en otros corpus.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, por lo que no existe verificacion independiente de los resultados reportados.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones adicionales, siempre que se conserve el aviso de copyright. No se identifican clausulas de uso responsable asociadas.
- Inconsistencia de metadatos: las fechas de creacion y ultima actualizacion del repositorio figuran como 2026-09-25, una fecha posterior a la de la mayoria de las publicaciones de referencia, lo que conviene verificar antes de citar el modelo.
- Caveat de produccion: al ser un clasificador binario de una unica etiqueta, no debe usarse como unico criterio en decisiones que afecten a usuarios sin revision humana ni umbral de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikaso67/anime-sentiment-roberta
- Repositorio de codigo y cuadernos: https://github.com/mikaso67/anime-sentiment-analysis
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Dataset de entrenamiento: MyAnimeList Comment Dataset V2 (Kaggle). El autor menciona el nombre pero no proporciona la URL directa en la informacion disponible.
- Paper de RoBERTa (referencia del modelo base): https://arxiv.org/abs/1907.11692
