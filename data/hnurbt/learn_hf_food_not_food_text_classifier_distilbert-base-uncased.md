# hnurbt/learn_hf_food_not_food_text_classifier_distilbert-base-uncased

## Resumen

El modelo `hnurbt/learn_hf_food_not_food_text_classifier_distilbert-base-uncased` es un clasificador de texto binario obtenido por ajuste fino (*fine-tuning*) de `distilbert/distilbert-base-uncased`. Lo publica el usuario de HuggingFace `hnurbt` como parte de un ejercicio de aprendizaje (los identificadores de los *tags* incluyen `generated_from_trainer` y la ruta `learn_hf_...`), y su tarea aparente es distinguir si un texto trata sobre comida o no. No se trata de un modelo generativo ni de propósito general: es un cabezal de clasificación sobre un encoder de 66.955.010 parámetros.

Técnicamente es la arquitectura DistilBERT, un transformer encoder destilado de BERT-base: 6 capas, 12 cabezas de atención y una dimensión oculta de 768, con la mitad de parámetros que BERT-base. Al tener 66,9 millones de parámetros, el modelo es muy ligero (el repositorio completo ocupa 0,3 GB), se ejecuta sin problemas en CPU y en cualquier GPU de consumo, y su ventana de contexto es de 512 tokens, heredada del modelo base.

Su relevancia es limitada y muy acotada: sirve como ejemplo reproducible de un pipeline de *fine-tuning* con la librería `transformers` y como clasificador de dominio para filtrar o etiquetar contenidos gastronómicos. La model card es auto-generada y declara explícitamente "More information needed" en descripción, usos previstos y datos de entrenamiento, por lo que cualquier uso en producción requiere una validación propia sobre datos del dominio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base); 6 capas, 12 cabezas, hidden size 768 |
| Parametros totales | 66.955.010 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de distilbert-base-uncased; no declarado en la model card) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; no hay versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible en la model card. El modelo base distilbert-base-uncased solo se entreno con corpus en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con la libreria transformers) |

Otros datos del repositorio: tamano del repo 0,3 GB, 0 descargas y 0 likes en el momento de la consulta, pipeline `text-classification`, etiquetas `text-embeddings-inference` y `endpoints_compatible`.

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder de tipo *encoder-only* entrenado mediante destilacion del conocimiento de BERT-base por Sanh et al. (2019). Conserva el mecanismo de auto-atencion multi-cabeza estandar, usa embeddings de posicion aprendidos y no emplea atencion lineal ni decodificacion especulativa. Sobre el encoder se anade un cabezal de clasificacion para una tarea de dos clases (`food` / `not food`), presumiblemente. La tokenizacion es la de `distilbert-base-uncased` (WordPiece, minusculas, vocabulario de 30.522 entradas).

El entrenamiento se realizo con la libreria `transformers` (version 5.18.0) sobre PyTorch 2.11.0+cu130, `datasets` 5.1.0 y `tokenizers` 0.23.2. Los hiperparametros declarados son: learning rate 1e-4, `train_batch_size` y `eval_batch_size` de 32, optimizador AdamW fusionado con betas (0,9 / 0,999) y epsilon 1e-08, scheduler lineal, 10 epocas, semilla 42 y un total de 70 pasos de entrenamiento. Ese recuento de 70 pasos (7 pasos por epoca con batch de 32) implica un conjunto de entrenamiento de aproximadamente 224 ejemplos, lo que situa al modelo en el terreno de las pruebas de concepto mas que en el de un clasificador robusto. No hay constancia de RLHF, DPO ni de ninguna innovacion tecnica adicional; la model card indica "unknown dataset" y "More information needed" para los datos de entrenamiento.

## Capacidades

- Clasificacion de texto binaria (etiqueta y puntuacion de confianza) sobre secuencias de hasta 512 tokens.
- Etiquetado tematico de contenidos gastronomicos frente a contenidos de otra indole, segun el nombre del checkpoint.
- Procesamiento por lotes (*batching*) eficiente gracias a su tamano reducido, apto para filtrar volumenes grandes de texto.
- Ejecucion en CPU y en GPU de gama baja con latencia baja.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con despliegue en HuggingFace Inference Endpoints (tag `endpoints_compatible`).
- No dispone de generacion de texto, razonamiento multi-paso, codigo, matematicas, vision ni audio.
- No hay evidencia de soporte de *tool calling*, *function calling* ni comportamiento agentico; es un clasificador puro.
- Capacidades multilingues: no disponibles; hereda el sesgo monolingue en ingles del modelo base.

## Casos de uso

- Filtrado de resenas y foros gastronomicos: el modelo puede clasificar resenas de restaurantes o publicaciones de foros como relacionadas con comida o no, con un coste de computo minimo (66,9 M de parametros) que permite procesar lotes de miles de documentos en CPU.
- Etiquetado previo de corpus para entrenamiento: usar el clasificador para pre-anotar un corpus no etiquetado de tematica culinaria y revisar despues solo las muestras de baja confianza, reduciendo el esfuerzo de anotacion manual.
- Enrutado de consultas en un chatbot: integrarlo como primer filtro para decidir si una consulta de usuario debe dirigirse a un modulo especializado en recetas o a un modulo general, gracias a su latencia de milisegundos.
- Moderacion de contenido tematico: separar articulos o comentarios de tematica alimentaria del resto en plataformas de publicacion, como etapa de un pipeline mayor de moderacion.
- Investigacion academica y docencia: sirve como referencia reproducible de un ajuste fino de DistilBERT con hiperparametros concretos documentados, util en cursos y tutoriales de PLN.
- Analitica de mercado: clasificar grandes volumenes de menciones en redes o prensa para medir la presencia de tematica alimentaria en una campana o estudio de tendencias.
- Prueba de concepto de un servicio de clasificacion personalizado: sustituir el cabezal por un numero mayor de clases (por ejemplo, tipos de cocina) reutilizando el encoder ya ajustado como punto de partida.

En todos los casos hay que validar antes el rendimiento real sobre datos del dominio, dado que el conjunto de evaluacion es muy pequeno y de composicion desconocida.

## Benchmarks y rendimiento

El `model-index` de la model card esta vacio (`"results": []`), por lo que no hay resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar. Los unicos datos disponibles son las metricas de validacion declaradas por el autor durante el entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Precision (accuracy) |
|---|---|---|---|---|
| 1 | 7 | 0,4607 | 0,1374 | 0,98 |
| 2 | 14 | 0,0587 | 0,0126 | 1,00 |
| 3 | 21 | 0,0059 | 0,0917 | 0,98 |
| 4 | 28 | 0,0020 | 0,1096 | 0,98 |
| 5 | 35 | 0,0011 | 0,1154 | 0,98 |
| 6 | 42 | 0,0008 | 0,1158 | 0,98 |
| 7 | 49 | 0,0007 | 0,1152 | 0,98 |
| 8 | 56 | 0,0006 | 0,1146 | 0,98 |
| 9 | 63 | 0,0006 | 0,1142 | 0,98 |
| 10 | 70 | 0,0006 | 0,1140 | 0,98 |

Resultado final declarado: perdida 0,1140 y precision 0,98. La granularidad de 0,02 en la precision es consistente con un conjunto de evaluacion de 50 ejemplos (una sola prediccion cambia la metrica en dos centesimas), de modo que la cifra tiene un margen de error muy amplio y no debe tomarse como una estimacion fiable del rendimiento en produccion. No se han publicado resultados de benchmarks comparativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB en fp32 (66,9 M de parametros x 4 bytes), unos 135 MB en fp16 y unos 70 MB en int8, mas el espacio de activaciones y del tokenizador (reserva practica de 0,5 a 1 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funcionan correctamente una NVIDIA T4, una RTX 3060, una RTX 4090 o una A100, aunque en todos los casos el modelo esta enormemente infrautilizado.
- Cabe sin problema en GPU de consumo y tambien en CPU: el repositorio completo ocupa 0,3 GB, por lo que puede cargarse en portatiles y en contenedores con poca memoria.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI, indicado en los tags), HuggingFace Inference Endpoints, ONNX Runtime o TorchScript para reducir latencia en CPU, y frameworks de servicio como FastAPI o BentoML. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente (Ollama esta orientado a modelos generativos).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano, en una GPU moderna el procesamiento por lotes deberia alcanzar cientos o miles de secuencias por segundo y en CPU del orden de decenas, pero se trata de una estimacion orientativa no medida, no de un dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hnurbt/learn_hf_food_not_food... (este modelo) | 66,9 M | 512 tokens | Clasificacion binaria comida / no comida | Apache 2.0 | HuggingFace, 0 descargas |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM, ajustable) | Apache 2.0 | HuggingFace, muy descargado |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM, ajustable) | Apache 2.0 | HuggingFace, muy descargado |
| FacebookAI/roberta-base | 125 M | 512 tokens | Modelo base (MLM, ajustable) | MIT | HuggingFace, muy descargado |
| huawei-noah/TinyBERT_General_4L_312D | 14,5 M | 512 tokens | Modelo base destilado, ajustable | Apache 2.0 | HuggingFace |

No existen modelos comparables publicados especificamente para la tarea "comida / no comida", por lo que la comparacion se establece con los encoders de la misma familia y tamano. Frente a BERT-base, este checkpoint tiene un 39 % menos de parametros y una latencia de inferencia aproximadamente la mitad, a costa de una perdida de precision en tareas generales de comprension. TinyBERT es mas pequeno y rapido, pero tambien menos preciso. Los datos de benchmarks de esta comparativa no estan disponibles para este checkpoint concreto.

## Limitaciones y advertencias

- Conjunto de entrenamiento desconocido y muy reducido (del orden de 224 ejemplos, segun los 70 pasos con batch de 32): el modelo puede haber memorizado los datos y generalizar mal.
- Sobreajuste evidente: la perdida de entrenamiento cae a 0,0006 mientras la de validacion se estanca en 0,1140 desde la epoca 3; el mejor punto de validacion es la epoca 2, no el checkpoint final.
- Precision de validacion calculada sobre un conjunto estimado de 50 ejemplos (pasos de 0,02): el 0,98 declarado tiene un intervalo de confianza muy amplio y no es extrapolable.
- La model card es auto-generada y no documenta sesgos, dominio de aplicacion, composicion de datos ni proceso de anotacion; no hay informacion sobre la definicion exacta de las etiquetas ni sobre el equilibrio entre clases.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero si hay riesgo de clasificaciones erroneas con puntuaciones de confianza altas, especialmente en textos ambiguos que mencionan comida de forma tangencial.
- Sesgos heredados del modelo base: entrenado con Wikipedia en ingles y BooksCorpus, sin filtrado de sesgos demograficos ni de toxicidad.
- Limitacion idiomatica: al derivar de `distilbert-base-uncased`, el rendimiento fuera del ingles no esta garantizado y no se ha evaluado.
- Limite duro de 512 tokens: los textos mas largos deben truncarse o dividirse, lo que puede perder la parte relevante del contenido.
- Licencia Apache 2.0: permite uso comercial con atribucion y sin garantias; no hay clausulas adicionales, pero tampoco una declaracion de conformidad de uso responsable.
- Las fechas del repositorio (creacion y actualizacion en 2026) son inconsistentes con un modelo derivado de un entorno con Transformers 5.18.0 y PyTorch 2.11.0; conviene verificar la procedencia antes de integrarlo.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad ni informes de terceros sobre su comportamiento.
- No hay pesos cuantizados publicados, de modo que las optimizaciones de latencia deben hacerse por cuenta propia (ONNX, TorchScript, int8).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hnurbt/learn_hf_food_not_food_text_classifier_distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos eran sitios de contenido para adultos sin relacion alguna con el modelo, por lo que se han descartado y no se incluyen.
