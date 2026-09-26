# ankitanand9/sentiment-model

## Resumen

sentiment-model es un modelo de clasificacion de texto (analisis de sentimiento) publicado por el usuario ankitanand9 en HuggingFace. Se trata de un ajuste fino (fine-tuning) de distilbert-base-uncased, la version destilada de BERT-base desarrollada por Hugging Face, sobre un conjunto de datos que el autor no documenta en la model card ("an unknown dataset"). El modelo tiene 66.955.779 parametros reales segun los pesos en safetensors y el repositorio ocupa 0,3 GB.

Tecnicamente es un encoder transformer de 6 capas orientado exclusivamente a clasificacion de secuencias, no a generacion de texto. El autor reporta en el conjunto de evaluacion una perdida de 0,7470, una exactitud de 0,6598 y un F1 ponderado y macro de 0,6493, resultados modestos que apuntan a un entrenamiento corto (3 epocas, 174 pasos totales) sobre un corpus pequeno y sin documentar.

Su relevancia actual es limitada: el repositorio acumula 0 descargas y 0 "likes", la model card es la plantilla automatica generada por el Trainer de Hugging Face sin completar, y no se publican benchmarks estandar ni ejemplos de uso. Resulta util unicamente como referencia de un pipeline de fine-tuning de clasificacion con la libreria transformers, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT base: 6 capas, 12 cabezas de atencion, hidden size 768) con cabeza de clasificacion de secuencias |
| Parametros totales | 66.955.779 (pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite estandar de DistilBERT base; no declarado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el repositorio contiene pesos en precision completa) |
| Idiomas soportados | no disponible en la model card; el modelo base (distilbert-base-uncased) esta entrenado principalmente en ingles sin distincion de mayusculas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB) |
| Libreria | transformers |
| Pipeline declarado | text-classification |
| Modelo base | distilbert-base-uncased |
| Etiquetas del repositorio | transformers, safetensors, distilbert, text-classification, generated_from_trainer, endpoints_compatible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT: un encoder transformer de 6 capas con 12 cabezas de atencion y dimension oculta de 768, destilado por Hugging Face a partir de bert-base-uncased mediante destilacion de conocimiento (el modelo base se entreno sobre Wikipedia en ingles y Toronto Book Corpus). Sobre ese backbone, este ajuste fino anade una cabeza de clasificacion, lo que explica que el recuento de parametros (66.955.779) supere ligeramente el del checkpoint base. No se declara ninguna innovacion tecnica adicional: no hay decodificacion especulativa, atencion lineal ni mecanicas de razonamiento, ya que es un modelo puramente discriminativo.

El entrenamiento se realizo con el Trainer de Hugging Face usando los siguientes hiperparametros: learning rate 2e-05, scheduler lineal sin warmup declarado, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, tamanos de lote de entrenamiento y evaluacion de 32, semilla 42 y 3 epocas. El numero de pasos registrado (58 por epoca, 174 en total) implica un conjunto de entrenamiento de aproximadamente 1.856 ejemplos, un corpus muy reducido. No se documenta la composicion del dataset, el numero de etiquetas, el mapeo id2label ni si hubo fases de RLHF o DPO (no aplicables en este tipo de tarea). Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de texto: el modelo devuelve una distribucion de probabilidad sobre las clases de sentimiento definidas en su cabeza de clasificacion (el numero y nombre de las clases no esta documentado).
- Analisis de sentimiento sobre textos cortos en ingles, incluidos textos en minusculas o con mezcla de mayusculas (tokenizador uncased).
- Inferencia por lotes mediante `pipeline("text-classification")` de la libreria transformers o mediante carga directa de `AutoModelForSequenceClassification`.
- Extraccion de embeddings contextuales de la capa encoder, reutilizables para tareas auxiliares (clustering, similitud), aunque no es el uso previsto por el autor.
- Compatibilidad con Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`).
- NO soporta generacion de texto: es un modelo exclusivamente encoder, sin cabeza de lenguaje.
- NO soporta tool calling ni function calling.
- NO soporta uso como agente ni razonamiento multi-paso.
- NO tiene capacidades de vision, audio ni modo "thinking".
- Capacidades multilingues: no acreditadas; el modelo base es monolingue en ingles.

## Casos de uso

- Clasificacion por lotes de resenas de producto en ingles: se puede ejecutar sobre ficheros CSV o tablas de un data warehouse para etiquetar sentimiento a escala; el modelo es lo bastante pequeno (67 M de parametros) para procesar millones de filas en CPU sin coste de GPU. Requiere validar antes la exactitud sobre el dominio concreto, dado el 0,6598 reportado.
- Monitorizacion de menciones de marca en redes sociales: un pipeline de ingestión puede puntuar cada publicacion en ingles y activar alertas cuando la probabilidad de sentimiento negativo supere un umbral calibrado con datos propios.
- Enrutado de tickets de soporte: clasificacion como paso previo (por ejemplo, separar quejas de consultas neutras) antes de asignar el ticket a un equipo humano, con coste de inferencia minimo al ser un modelo de 268 MB en fp32.
- Analisis de encuestas NPS y formularios abiertos: agregacion de respuestas de texto libre en ingles para obtener una serie temporal de sentimiento por producto o region, integrable en un job programado con Airflow o cron.
- Anonimizacion y filtrado previo en moderacion de contenido: uso como primer filtro de bajo coste que descarta el grueso del contenido neutro y deja para un modelo mayor (o revision humana) solo los casos de sentimiento fuertemente negativo.
- Investigacion academica sobre destilacion y ajuste fino: sirve como ejemplo reproducible de un pipeline completo de fine-tuning con `Trainer` (hiperparametros y curvas de entrenamiento documentados) para estudiar el efecto del tamano de dataset en tareas de clasificacion.
- Prototipado rapido en entornos sin GPU: al caber en memoria de cualquier portatil, permite validar una prueba de concepto de clasificacion de sentimiento antes de invertir en un modelo mayor.
- Analisis de A/B tests: comparacion del sentimiento agregado de comentarios de dos variantes de producto o campana, siempre que el sesgo del clasificador se mida sobre una muestra etiquetada manualmente.

## Benchmarks y rendimiento

El model-index de la model card no declara ningun resultado de benchmark estandar (el campo `results` esta vacio). No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos numericos disponibles son las metricas de evaluacion y las curvas de entrenamiento reportadas por el autor, sin especificar el conjunto de evaluacion:

| Metrica (conjunto de evaluacion no identificado) | Valor |
|---|---|
| Loss | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolucion durante el entrenamiento:

| Training loss | Epoca | Paso | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1,0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2,0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3,0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

La mejor metrica de validacion se obtiene en la epoca 2 (accuracy 0,6975); la epoca 3 mejora la perdida de entrenamiento pero empeora la validacion, lo que indica sobreajuste sobre un dataset muy pequeno.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 268 MB en disco y en memoria; en fp16/bf16, unos 134 MB; una cuantizacion int8 dinamica reduciria el peso a unos 67 MB (no se distribuye ninguna variante cuantizada, habria que generarla).
- VRAM estimada: menos de 1 GB en fp16 incluyendo activaciones y overhead del runtime para lotes pequenos; no es necesario un acelerador para servir el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Es funcional en NVIDIA T4, L4, A10G y en graficas de consumo como GTX 1650, RTX 3050, RTX 3060 o superiores. A100 y H100 solo tendrian sentido para lotes masivos, y serian un sobredimensionamiento claro.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos, y tambien en CPU.
- Opciones de despliegue: pipeline de transformers en Python, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportacion a ONNX con Optimum y ejecucion con ONNX Runtime, TorchServe, NVIDIA Triton, BentoML, Ray Serve o un servicio FastAPI propio. vLLM y TGI estan orientados a modelos generativos y no aportan ventaja aqui; llama.cpp u Ollama requieren conversion a GGUF y no son un camino estandar para clasificacion con DistilBERT.
- Latencia y throughput: no se publican mediciones. Como referencia orientativa (estimacion, no dato del autor), un encoder de 6 capas y 67 M de parametros procesa una secuencia de 128 tokens en el orden de milisegundos de un solo digito en GPU moderna y de decenas de milisegundos por nucleo en CPU, con throughput escalable por batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| ankitanand9/sentiment-model | 66,9 M | 512 tokens | apache-2.0 | Accuracy 0,6598 / F1 macro 0,6493 en un conjunto de evaluacion no identificado | HuggingFace, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 tokens | apache-2.0 | 0,913 de accuracy en SST-2 dev (referencia de la model card oficial de Hugging Face; no verificado en esta ficha y evaluado en otro conjunto) | HuggingFace, ampliamente utilizado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | 514 tokens | apache-2.0 | Optimizado para sentimiento en redes sociales en ingles; cifras concretas no verificadas en esta ficha | HuggingFace, muy utilizado |
| bert-base-uncased (ajustado para clasificacion) | 110 M | 512 tokens | apache-2.0 | Referencia de mayor capacidad que su version destilada; resultados dependen del ajuste | HuggingFace |

Nota metodologica: las cifras de rendimiento de los modelos alternativos proceden de sus respectivas model cards publicas y corresponden a conjuntos de evaluacion distintos (por ejemplo SST-2), por lo que no son directamente comparables con el 0,6598 reportado aqui, medido sobre un conjunto sin identificar.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al derivar de distilbert-base-uncased hereda los sesgos de Wikipedia y Toronto Book Corpus; no hay analisis de equidad ni evaluacion por subgrupos.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si puede asignar etiquetas de sentimiento con alta confianza a textos ambiguos o de dominio distinto al de entrenamiento.
- Etiquetas desconocidas: la model card no especifica cuantas clases tiene la cabeza de clasificacion ni su mapeo id2label, lo que impide interpretar la salida sin inspeccionar el fichero `config.json` del repositorio.
- Rendimiento bajo: una exactitud de 0,6598 y un F1 macro de 0,6493 estan muy por debajo de lo esperable en clasificacion de sentimiento binaria en ingles (los modelos publicos de referencia superan el 0,90 en SST-2), lo que sugiere un dataset pequeno, ruidoso o con un problema de etiquetado.
- Sobreajuste: la perdida de validacion deja de mejorar a partir de la epoca 2, con solo 174 pasos de entrenamiento sobre aproximadamente 1.856 ejemplos.
- Idioma: el modelo base es uncased y monolingue en ingles; no hay evidencia de funcionamiento correcto en castellano ni en otros idiomas.
- Longitud de entrada: limitado a 512 tokens del tokenizador; textos mas largos requeriran truncado o troceado, con perdida de contexto.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No hay restricciones adicionales declaradas.
- Caveat de produccion: con 0 descargas, 0 likes y una model card sin completar, el modelo no ha sido validado por terceros; no deberia desplegarse sin una evaluacion propia sobre datos del dominio objetivo y una comprobacion previa del fichero de configuracion.
- Trazabilidad: se desconoce la procedencia del dataset de entrenamiento, lo que impide auditar posibles problemas de derechos de uso de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ankitanand9/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
