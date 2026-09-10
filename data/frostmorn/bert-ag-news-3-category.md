# frostMorn/bert-ag-news-3-category

## Resumen

frostMorn/bert-ag-news-3-category es un clasificador de texto en ingles obtenido por ajuste fino (fine-tuning) de `bert-base-uncased` sobre una version reducida del corpus AG News. El modelo resuelve una tarea concreta de clasificacion monoetiqueta en tres categorias periodisticas: Sports, Business y Technology. Fue publicado por el usuario frostMorn en Hugging Face con licencia Apache 2.0 y esta pensado para integrarse mediante la libreria Transformers con la tarea `text-classification`.

Tecnicamente es un transformer encoder-only de tipo BERT con cabeza de clasificacion secuencial sobre el token `[CLS]`, con 109.484.547 parametros totales declarados en el archivo safetensors y un peso de repositorio de aproximadamente 0,4 GB. La ventana de contexto es la estandar de BERT-base, 512 tokens, suficiente para titulares y descripciones cortas de noticias, pero no para articulos completos. El ajuste se realizo durante 3 epocas con tasa de aprendizaje 2e-5 y tamano de lote 16 sobre una GPU Tesla T4 de Google Colab.

Su relevancia es practica mas que investigadora: es un ejemplo tipico de modelo pequeno y barato de desplegar para tareas de enrutado y etiquetado tematico de noticias. Como contrapartida, el repositorio no incluye resultados de evaluacion, no documenta cuantizaciones y apenas cuenta con traccion en la plataforma, por lo que debe tratarse como un artefacto de referencia y no como un componente validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only) para clasificacion de secuencias, basado en `bert-base-uncased` |
| Parametros totales | 109.484.547 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (limite estandar de BERT-base) |
| Tipos de cuantizacion | No disponible (el autor no documenta variantes cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos PyTorch; tamano del repositorio ~0,4 GB) |
| Numero de etiquetas | 3 (0 = Sports, 1 = Business, 2 = Technology) |
| Framework y libreria | PyTorch / Transformers |
| Pipeline declarado | text-classification |
| Tamano del repositorio | ~0,4 GB |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-uncased`: un transformer encoder-only de 12 capas, dimension oculta 768 y 12 cabezas de atencion, preentrenado con objetivos de modelado de lenguaje enmascarado (MLM) y prediccion de la siguiente frase (NSP) sobre BookCorpus y Wikipedia en ingles. Sobre ese backbone se anade una cabeza de clasificacion lineal que opera sobre la representacion del token `[CLS]` y produce tres logits, uno por categoria. No hay innovaciones arquitectonicas: el modelo card no menciona decodificacion especulativa, atencion lineal, SSM ni mecanismos hibridos.

El ajuste fino se realizo con el `Trainer` de Hugging Face durante 3 epocas, con tasa de aprendizaje 2e-5 y tamano de lote de entrenamiento 16, sobre una unica GPU Tesla T4 de Google Colab. Los datos proceden del dataset `frostMorn/ag-news-3-category-dataset`, derivado de `fancyzhx/ag_news` (Zhang et al., 2015): se elimino la clase World y se renombraron las restantes, quedando Sports, Business y Technology. El conjunto resultante contiene aproximadamente 90.000 ejemplos de entrenamiento y 5.700 de test. No se aplicaron tecnicas de RLHF ni DPO, algo esperable en un clasificador discriminativo.

## Capacidades

- Clasificacion de texto monoetiqueta en ingles para tres categorias: Sports, Business y Technology, con salida de puntuaciones de probabilidad por clase.
- Inferencia directa mediante `pipeline("text-classification", top_k=3)` de Transformers, con devolucion de etiqueta y score.
- Funcionamiento sobre entradas cortas: titulares, resumenes y descripciones de noticias, tipicas de AG News.
- Procesamiento por lotes (batching) gracias a la tokenizacion WordPiece estandar de BERT, apto para clasificar volumenes altos de documentos.
- Compatibilidad declarada con Text Embeddings Inference (etiquetas `text-embeddings-inference` y `endpoints_compatible` del repositorio), lo que permite exponerlo como endpoint HTTP.
- Exportabilidad a otros runtimes de inferencia (por ejemplo ONNX) por ser un modelo encoder estandar, aunque el autor no documenta ninguna exportacion.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, capacidades de agente, vision, audio ni modo de pensamiento.

## Casos de uso

- Enrutado tematico de noticias en un agregador o lector RSS: el modelo clasifica cada titular en Sports, Business o Technology para asignarlo a la seccion correspondiente; su ventana de 512 tokens cubre de sobra titulares y sumarios de AG News.
- Etiquetado automatico de corpus para aprendizaje debil (weak supervision): se puede usar para preetiquetar grandes volumenes de noticias y despues revisar solo una muestra, reduciendo el coste de anotacion manual.
- Triaje en tiempo real de comunicados de prensa en un departamento de comunicacion: el modelo separa comunicados de producto o tecnologia de los corporativos o financieros antes de asignarlos a un responsable.
- Filtrado previo en un pipeline RAG sobre hemeroteca: clasificar los documentos por tematica permite restringir la busqueda vectorial a un subconjunto relevante y reducir el ruido recuperado.
- Monitorizacion de prensa sectorial: un equipo de analisis puede procesar feeds de noticias y quedarse solo con los articulos etiquetados como Business o Technology para sus informes diarios.
- Enriquecimiento de datos en investigacion de medios: clasificar corpus historicos de noticias en ingles para estudios de agenda tematica, con la advertencia de que la categoria World fue eliminada en el ajuste.
- Prototipado rapido y pruebas de concepto: al ocupar menos de 0,5 GB en FP32, se puede ejecutar en un portatil o en una instancia CPU pequena para validar una idea antes de escalar a un modelo mayor.
- Deteccion de tematica en foros o comentarios: clasificar hilos o comentarios de tematica noticiosa en comunidades en ingles, con la salvedad de que el modelo fue entrenado con titulares y descripciones periodisticas, no con lenguaje coloquial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud, F1, matriz de confusion ni ninguna otra metrica de evaluacion sobre el split de test, y no se han encontrado evaluaciones independientes en la busqueda web realizada (los resultados devueltos correspondian a paginas genericas del buscador Yandex, sin relacion con el modelo).

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 438 MB en FP32 (109,5 M parametros x 4 bytes), unos 219 MB en FP16/BF16 y en torno a 110 MB en int8. Hay que sumar el consumo del runtime (PyTorch, CUDA) y el del lote de entrada.
- Cabe en cualquier GPU de consumo: GTX 1050/1650, RTX 2060, RTX 3060, RTX 4090, asi como en GPUs de datacenter (T4, A100, H100). Tambien es viable en CPU para lotes pequenos.
- GPU recomendada: una Tesla T4 (la empleada por el autor para el ajuste) es mas que suficiente; para alto throughput, cualquier GPU moderna con batching.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (compatible segun las etiquetas del repositorio), ONNX Runtime, TorchServe, Triton Inference Server o un servicio FastAPI envolviendo el pipeline.
- No es un caso de uso de vLLM, llama.cpp ni Ollama: esas herramientas estan orientadas a modelos generativos y no albergan esta cabeza de clasificacion de tres clases.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad | Rendimiento en AG News |
|---|---|---|---|---|---|---|
| frostMorn/bert-ag-news-3-category | 109,5 M | 512 tokens | Clasificacion 3 clases | Apache 2.0 | Hugging Face, 0 descargas, 1 like | No disponible |
| bert-base-uncased con cabeza de clasificacion | ~110 M | 512 tokens | Clasificacion configurable | Apache 2.0 | Hugging Face, muy extendido | No disponible |
| distilbert-base-uncased | 66 M | 512 tokens | Clasificacion configurable | Apache 2.0 | Hugging Face, muy extendido | No disponible |
| roberta-base | ~125 M | 514 tokens | Clasificacion configurable | MIT | Hugging Face, muy extendido | No disponible |

La comparacion se limita a parametros, contexto, licencia y disponibilidad porque ninguno de estos modelos publica resultados comparables en la configuracion exacta de tres clases de este repositorio. La ventaja diferencial de este modelo es su especializacion y su licencia permisiva; su desventaja es la ausencia total de validacion publicada.

## Limitaciones y advertencias

- Tarea cerrada de tres clases: cualquier texto sobre politica internacional, sucesos o cultura sera forzado a una de las tres etiquetas. Al haber eliminado la clase World, la precision esperable en ese tipo de contenido es baja.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas, por lo que su uso en castellano u otras lenguas no es fiable.
- Dominio muy acotado: el entrenamiento proviene de AG News, con textos breves (titulares y descripciones). Su comportamiento en articulos largos, informes o lenguaje coloquial no esta caracterizado.
- Limite de 512 tokens: los articulos que lo superen se truncaran, lo que puede eliminar informacion relevante si la categoria se deduce del cuerpo y no del titular.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de sobreconfianza: el modelo siempre devuelve una de las tres clases con una probabilidad, incluso ante entradas sin relacion con noticias.
- Sesgos heredados: el backbone BERT se preentrenó sobre BookCorpus y Wikipedia en ingles, corpus con sesgos demograficos y de representacion que pueden trasladarse a las predicciones. El autor no documenta ninguna auditoria de sesgo.
- Sin metricas publicadas: no hay exactitud, F1 ni analisis por clase, ni informacion sobre el equilibrio de clases del dataset derivado. No se puede estimar su calidad real sin evaluarlo.
- Reproducibilidad limitada: los hiperparametros estan descritos en la model card, pero no se publican semillas, curvas de entrenamiento ni el codigo del ajuste; el entrenamiento se hizo en un unico entorno de Colab.
- Traccion nula: 0 descargas y 1 like en el momento de la consulta, sin issues ni validacion por parte de terceros. No se ha encontrado documentacion adicional en la busqueda web.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al derivar de `bert-base-uncased` conviene conservar el aviso de licencia y citar el modelo base. No hay restricciones adicionales declaradas por el autor.
- Caveat de produccion: al no existir una cuarta clase ni umbral de rechazo, se recomienda anadir una capa de decision basada en el score (por ejemplo, derivar a revision humana por debajo de un umbral) antes de usar el modelo en un flujo automatizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frostMorn/bert-ag-news-3-category
- Dataset de ajuste: https://huggingface.co/datasets/frostMorn/ag-news-3-category-dataset
- Dataset original AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Articulo de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Articulo de AG News / Character-level CNNs (Zhang et al., 2015): https://arxiv.org/abs/1509.01626
- Documentacion de pipelines de clasificacion de Transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.TextClassificationPipeline
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la busqueda web realizada; los resultados devueltos correspondian a paginas genericas del buscador Yandex sin relacion con el modelo.
