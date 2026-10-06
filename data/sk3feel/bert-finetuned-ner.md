# sk3feel/bert-finetuned-ner

## Resumen

sk3feel/bert-finetuned-ner es un modelo de clasificacion de tokens (token classification) obtenido mediante fine-tuning supervisado de BAAI/bge-small-en-v1.5, un encoder de la familia BERT de aproximadamente 33 millones de parametros. El modelo resultante conserva el cuerpo del encoder original y anade una cabeza de clasificacion por token, por lo que su tarea directa es el reconocimiento de entidades nombradas (NER) y, en general, cualquier etiquetado secuencial sobre texto. Lo publica el usuario sk3feel bajo licencia MIT.

Se trata de un modelo de nicho: acumula 0 descargas y 1 like en el momento de la consulta, con una model card generada automaticamente por el Trainer de Hugging Face en la que no se documenta el dataset de entrenamiento, el esquema de etiquetas ni los idiomas soportados. Su relevancia practica es la de un ejemplo reproducible de fine-tuning de un encoder pequeno para NER, no la de un modelo de proposito general.

El valor diferencial frente a alternativas mas grandes esta en su tamano: 33,2 millones de parametros permiten ejecutar la inferencia en CPU o en cualquier GPU de gama baja con latencias de milisegundos. Como contrapartida, hereda la limitacion de ventana del encoder subyacente y no hay evidencia publicada sobre su comportamiento fuera del conjunto de evaluacion del propio entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (fine-tuning de clasificacion de tokens sobre BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 |
| Longitud de contexto | no disponible en la model card (el modelo base BAAI/bge-small-en-v1.5 trabaja con ventanas de 512 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin cuantizaciones alternativas) |
| Idiomas soportados | no disponible (el modelo base, BAAI/bge-small-en-v1.5, esta orientado a ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (biblioteca transformers) |
| Pipeline | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tamano del repositorio | 9,1 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer de tipo BERT con cabeza de clasificacion por token. El autor parte de BAAI/bge-small-en-v1.5, un modelo de embeddings de frases derivado de la familia BERT, y lo ajusta sobre un dataset no identificado en la model card ("an unknown dataset"). No se documenta el numero de tokens de entrenamiento, la composicion del corpus, el inventario de etiquetas ni si hubo etapas de alineacion tipo RLHF o DPO; en un modelo de clasificacion de tokens esas etapas no aplican y no se mencionan.

Los hiperparametros si estan publicados: learning rate 2e-05, batch de entrenamiento y de evaluacion de 8, semilla 42, optimizador adamw_torch_fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 3 epochs, lo que corresponde a 3.750 pasos de entrenamiento. Las versiones de framework declaradas son Transformers 5.18.0, PyTorch 2.14.1+cu126, Datasets 5.0.1 y Tokenizers 0.23.2. No se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.): es un fine-tuning estandar con el Trainer.

## Capacidades

- Etiquetado de secuencias a nivel de token: asignacion de una clase a cada token de entrada, el caso de uso tipico del reconocimiento de entidades nombradas.
- Extraccion de entidades: siempre que la cabeza de clasificacion se haya entrenado con un esquema BIO o BILUO, el modelo puede delimitar entidades contiguas en el texto.
- Integracion directa con el pipeline `token-classification` de transformers y con `AutoModelForTokenClassification`.
- Exportacion a otros runtimes mediante Optimum (ONNX) por tratarse de un transformer estandar.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo ni conversacional.
- No hay evidencia de capacidades multimodales (vision, audio) ni de modo de razonamiento explicito.
- Capacidades multilingues: no disponibles. La model card no declara idiomas y el modelo base esta orientado a ingles.
- No se documenta el inventario de etiquetas ni el dominio del dataset, por lo que no es posible afirmar que tipos de entidad reconoce.

## Casos de uso

- Anonimizacion de textos antes de almacenarlos: si el esquema de etiquetas incluye personas, organizaciones o ubicaciones, el modelo puede marcar esos tramos en un pipeline de preprocesado y permitir su enmascarado posterior en logs o bases de datos.
- Preprocesado de documentos para motores de busqueda: extraer entidades de contratos, correos o incidencias y usarlas como campos indexables, con coste de inferencia muy bajo al ser un modelo de 33 millones de parametros.
- Enriquecimiento de tickets de soporte: detectar productos, empresas o localizaciones mencionadas en el texto libre de un ticket y enrutarlo automaticamente al equipo correspondiente.
- Prototipado y docencia: sirve como punto de partida reproducible (hiperparametros y curvas de entrenamiento publicados) para experimentar con fine-tuning de NER en un encoder pequeno antes de escalar a modelos mayores.
- Servicio de extraccion de entidades en CPU: al caber en memoria sin GPU dedicada, es viable desplegarlo en contenedores pequenos o en el borde para tareas de etiquetado por lotes.
- Etiquetado asistido para construir datasets: usar el modelo como preanotador sobre grandes volumenes de texto y revisar despues las predicciones con anotadores humanos.
- Base para clasificacion de tokens distinta de NER: cambiando la cabeza y reentrenando, la misma arquitectura sirve para POS tagging, chunking o deteccion de spans especificos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los del conjunto de evaluacion del propio entrenamiento, declarados por el autor y con dataset no identificado. No se han publicado resultados sobre benchmarks estandar como CoNLL-2003, MMLU, HumanEval o GSM8K, y el model-index del repositorio esta vacio (`results: []`), por lo que no es posible comparar con terceros.

Resultado final declarado en la model card:

| Metrica | Valor |
|---|---|
| Loss | 0,0926 |
| Precision | 0,8660 |
| Recall | 0,9079 |
| F1 | 0,8865 |
| Accuracy | 0,9783 |

Evolucion durante el entrenamiento:

| Training loss | Epoch | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,2204 | 1,0 | 1250 | 0,1359 | 0,8144 | 0,8714 | 0,8420 | 0,9707 |
| 0,1103 | 2,0 | 2500 | 0,1011 | 0,8511 | 0,9007 | 0,8752 | 0,9766 |
| 0,0818 | 3,0 | 3750 | 0,0926 | 0,8660 | 0,9079 | 0,8865 | 0,9783 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 130 MB en fp32 y 66 MB en fp16 para los pesos, mas el consumo de activaciones, que depende de la longitud de secuencia y del batch.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente (GTX 1050 Ti, RTX 3060, T4, L4). No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier tarjeta dedicada de los ultimos ocho anos, e incluso en iGPU con suficiente memoria compartida.
- Despliegue en CPU: totalmente viable; es un encoder de 12 capas y 33 millones de parametros.
- Opciones de despliegue: pipeline de transformers, `AutoModelForTokenClassification`, exportacion a ONNX con Optimum y ejecucion con ONNX Runtime, TorchServe o un servicio FastAPI propio. vLLM y llama.cpp no estan orientados a clasificacion de tokens sobre encoders BERT; para servir este modelo conviene Optimum/ONNX Runtime o un contenedor propio.
- Latencia y throughput: no disponibles. No se publican mediciones y dependeran del hardware, la longitud de secuencia y el tamano de lote.
- Advertencia de almacenamiento: el repositorio ocupa 9,1 GB pese a que los pesos del modelo son de decenas de megabytes, lo que sugiere la presencia de checkpoints intermedios u otros artefactos en el historial de Git. Conviene revisar el contenido antes de clonarlo.

## Comparativa con modelos similares

No hay datos de rendimiento comparables porque el conjunto de evaluacion de este modelo no se identifica. La comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Tarea | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| sk3feel/bert-finetuned-ner | 33,2 M | Token classification (NER) | no disponible (base de 512 tokens) | MIT | 0 descargas, dataset y etiquetas no documentados |
| dslim/bert-base-NER | 108 M | Token classification (NER) | 512 tokens | MIT | Entrenado sobre CoNLL-2003, esquema de 4 tipos de entidad documentado |
| Jean-Baptiste/roberta-large-ner-english | ~355 M | Token classification (NER) | 514 tokens | MIT | Modelo grande en ingles, etiquetas documentadas |
| BAAI/bge-small-en-v1.5 | 33 M | Embeddings de frases | 512 tokens | MIT | Modelo base del que deriva este fine-tuning; no hace NER |

La ventaja del modelo evaluado es el tamano (un tercio de bert-base-NER) y la desventaja principal es la ausencia de documentacion sobre su dataset y sus etiquetas, frente a alternativas con procedencia y esquema publicados.

## Limitaciones y advertencias

- Dataset de entrenamiento no identificado: la model card indica explicitamente "an unknown dataset", por lo que no se puede saber a que dominio ni a que tipos de entidad responde el modelo.
- Esquema de etiquetas no documentado: no se publica el listado de etiquetas (persona, organizacion, lugar, etc.) ni si usa formato BIO o BILUO. Sin esa informacion la salida del modelo no es interpretable de forma fiable en produccion.
- Metricas no comparables: precision, recall, F1 y accuracy corresponden a un conjunto de evaluacion propio sin denominacion ni tamano publicados. No deben presentarse como resultados sobre CoNLL-2003 ni sobre ningun benchmark estandar.
- Idiomas no declarados: la model card no especifica idiomas y el modelo base esta orientado a ingles. No hay evidencia de comportamiento en castellano.
- Riesgo de alucinacion en sentido estricto: no aplica, porque no es un modelo generativo; el riesgo equivalente es de falsos positivos y falsos negativos en la deteccion de entidades, con una precision de 0,8660 y un recall de 0,9079 sobre datos no identificados.
- Sesgos: no evaluados ni documentados. Al derivar de un corpus de entrenamiento desconocido, pueden existir sesgos en la deteccion de nombres propios segun origen o genero.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Conviene conservar el aviso de copyright y verificar que el modelo base BAAI/bge-small-en-v1.5 es tambien MIT, lo cual es el caso.
- Madurez: 0 descargas y 1 like, sin comunidad que haya validado el modelo. No es recomendable como componente critico en produccion sin una evaluacion propia sobre datos representativos del caso de uso.
- Tamano del repositorio desproporcionado (9,1 GB) frente al tamano real de los pesos, lo que puede complicar la descarga y el almacenamiento.
- Idiomas y contexto: cualquier uso con secuencias superiores a los 512 tokens del encoder base requiere truncado o segmentacion con solapamiento, lo que puede partir entidades en los limites.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sk3feel/bert-finetuned-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Perfil del autor: https://huggingface.co/sk3feel
- Documentacion del pipeline de token classification en transformers: https://huggingface.co/docs/transformers/tasks/token_classification
- Documentacion de AutoModelForTokenClassification: https://huggingface.co/docs/transformers/model_doc/auto#transformers.AutoModelForTokenClassification
- Optimum para exportacion a ONNX: https://huggingface.co/docs/optimum/index
