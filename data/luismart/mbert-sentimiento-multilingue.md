# luismart/mbert-sentimiento-multilingue

## Resumen

`luismart/mbert-sentimiento-multilingue` es un ajuste fino del modelo `google-bert/bert-base-multilingual-cased` para clasificación de sentimiento en tres clases (negativo, neutro, positivo) sobre resenas de producto. Lo desarrolla el usuario de HuggingFace luismart y esta pensado para analisis de opinion multilingue en espanol, ingles y frances. Se trata de un modelo BERT base (encoder-only) de 177,9 millones de parametros, con licencia Apache 2.0.

El modelo resuelve una tarea concreta y acotada: clasificar texto corto en una de tres polaridades. Al partir de un checkpoint multilingue ya preentrenado, hereda representaciones para 104 idiomas, aunque el ajuste fino solo se ha realizado sobre los tres idiomas declarados. Es relevante como pieza ligera para pipelines de analisis de resenas, moderacion de opiniones o enriquecimiento de datos, donde un encoder de 178M de parametros ofrece un coste de inferencia muy inferior al de un LLM generativo.

La model card reporta un accuracy de 0,6358 y un F1 macro de 0,6307 en el conjunto de test, cifras modestas que reflejan la dificultad de la clasificacion en tres clases (especialmente la clase neutra) y el uso de un subconjunto reducido de datos. El repositorio ocupa 0,7 GB y las descargas son muy bajas (24 en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 177.855.747 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el checkpoint base admite hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica de PyTorch y ONNX) |
| Idiomas soportados | es, en, fr (ajuste fino); el checkpoint base cubre 104 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un BERT base multilingue con vocabulario case-sensitive (bert-base-multilingual-cased), es decir, un transformer encoder-only de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion. Sobre el checkpoint preentrenado se ha anadido una cabeza de clasificacion lineal para tres clases, entrenada mediante ajuste fino supervisado.

Los datos de entrenamiento provienen de `mteb/amazon_reviews_multi`, un corpus de resenas de productos de Amazon en varios idiomas. El autor indica que uso un subconjunto balanceado por idioma y clase correspondiente al 10 % del dataset, con etiquetas derivadas de la puntuacion en estrellas: 1-2 estrellas como negativo, 3 como neutro y 4-5 como positivo. No se documentan en la model card detalles sobre hiperparametros, numero de epocas, tasa de aprendizaje, ni sobre el uso de RLHF/DPO (no aplicable en un encoder de clasificacion). Tampoco se especifica la tecnica de balanceo exacta ni el tamano final del conjunto de entrenamiento.

## Capacidades

- Clasificacion de sentimiento en tres clases (negativo, neutro, positivo) para textos en espanol, ingles y frances.
- Procesamiento de resenas de producto y, por extension, de opiniones cortas de dominio similar.
- Inferencia rapida y de bajo coste gracias a su tamano de 178M de parametros.
- Ejecucion en CPU viable para lotes de tamano moderado, sin necesidad de GPU.
- Integracion directa con `transformers.pipeline("text-classification")`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ajuste fino realizado; el backbone cubre mas idiomas, pero sin garantias de calibracion fuera de es, en y fr.

## Casos de uso

- Analisis de resenas de e-commerce: clasificar en lote resenas de Amazon o de tiendas propias en espanol, ingles y frances para agregar la polaridad por producto y detectar caidas de satisfaccion. El modelo esta entrenado exactamente sobre ese dominio, lo que reduce el desajuste de distribucion.
- Monitorizacion de reputacion en redes sociales: procesar menciones y comentarios cortos para generar un indice de sentimiento por marca o campana, con un coste de inferencia minimo al ser un encoder de 178M.
- Enriquecimiento de datasets para entrenamiento: etiquetar automaticamente grandes volumenes de texto no anotado y usarlos como preetiquetado en un flujo de anotacion humana (active learning), dado el bajo coste por ejemplo.
- Filtrado previo en pipelines de moderacion: descartar o priorizar mensajes negativos antes de pasarlos a un modelo generativo o a revision humana, actuando como primera etapa barata.
- Analisis de encuestas con preguntas abiertas: clasificar respuestas de NPS o satisfaction surveys en los tres idiomas soportados y cruzar con la puntuacion numerica.
- Clasificacion en entornos sin GPU: desplegar el modelo en CPU (contenedores ligeros, funciones serverless) para tareas de etiquetado en tiempo casi real, ya que 178M de parametros caben en memoria RAM sin dificultad.
- Extraccion de senales para sistemas de recomendacion: incorporar la polaridad de las resenas como feature adicional en un ranking de productos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (test) | 0.6358 |
| F1 macro (test) | 0.6307 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K no aplican a esta tarea; no hay datos de F1 por clase ni por idioma).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB de pesos mas activaciones; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- En fp16: en torno a 0,35 GB de pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente (RTX 3060, RTX 4090, T4, L4, A10). Para lotes grandes, A100 o H100 aportan throughput adicional pero no son necesarias.
- Cabe en GPU consumer: si, en practicamente todas (incluidas GTX 1650 o inferiores) y tambien en CPU.
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, ONNX Runtime, FastAPI con Uvicorn, o exportacion a GGUF/llama.cpp (aunque el soporte de BERT en llama.cpp es limitado). Tambien es viable la cuantizacion dinamica de PyTorch para reducir memoria.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU (miles de ejemplos por segundo con batching) y decenas o cientos de ejemplos por segundo en CPU, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luismart/mbert-sentimiento-multilingue | 177,9M | no disponible (base: 512) | Clasificacion de sentimiento 3 clases (es, en, fr) | Apache 2.0 | HuggingFace |
| google-bert/bert-base-multilingual-cased | 177,9M | 512 | Modelo base (sin cabeza de clasificacion) | Apache 2.0 | HuggingFace |
| nlptown/bert-base-multilingual-uncased-sentiment | 167,4M | 512 | Clasificacion de sentimiento en 5 estrellas (multilingue) | MIT | HuggingFace |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | 278,0M | 512 | Clasificacion de sentimiento en redes sociales (multilingue) | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo publicados en la informacion proporcionada; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Accuracy de 0,6358 y F1 macro de 0,6307: rendimiento modesto que sugiere confusion frecuente entre clases, especialmente la neutra. No es adecuado para decisiones automatizadas de alto riesgo sin validacion adicional.
- Entrenado sobre un subconjunto del 10 % de `mteb/amazon_reviews_multi`, lo que limita la cobertura de dominios y estilos; el rendimiento puede degradarse fuera de resenas de producto.
- El corpus original de `mteb/amazon_reviews_multi` restringe su uso a investigacion academica segun la model card. Aunque la licencia del modelo es Apache 2.0, existe una advertencia explicita sobre la procedencia de los datos que conviene revisar antes de un uso comercial.
- Ajuste fino limitado a es, en y fr; el backbone es multilingue, pero la cabeza de clasificacion no ha sido calibrada para otros idiomas.
- Riesgo de sesgo: las etiquetas derivan de puntuaciones en estrellas de Amazon, con posibles sesgos de dominio, de producto y culturales segun el idioma.
- Riesgo de alucinacion no aplicable (modelo discriminativo), pero si de clasificaciones erroneas con alta confianza.
- No soporta textos largos mas alla del limite del backbone (512 tokens); textos mas largos requeriran truncamiento o segmentacion.
- Descargas y adopcion muy bajas (24 descargas, 0 likes): no hay validacion independiente de la comunidad ni reportes de terceros.
- No se documentan hiperparametros de entrenamiento ni tamanos exactos del conjunto, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luismart/mbert-sentimiento-multilingue
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/mteb/amazon_reviews_multi
- Paper de BERT (referencia del backbone): https://arxiv.org/abs/1810.04805
- Paper de Amazon Reviews Multi (referencia del dataset): https://arxiv.org/abs/2010.02573
