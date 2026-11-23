# illuin/camembert-base

## Resumen

CamemBERT es un modelo de lenguaje enmascarado (masked language model) para frances basado en la arquitectura RoBERTa. Fue desarrollado por el equipo del proyecto CamemBERT (Louis Martin, Benjamin Muller, Pedro Javier Ortiz Suarez y colaboradores del INRIA, la Universidad de Paris y otras instituciones francesas) y presentado en el articulo "CamemBERT: a Tasty French Language Model" (ACL 2020). La version `illuin/camembert-base` es una replica del checkpoint base original (110M de parametros) alojada por el usuario `illuin`, con los mismos pesos y tokenizador que el modelo de referencia `camembert/camembert-base`.

El modelo resuelve tareas de comprension del lenguaje en frances: clasificacion de texto, reconocimiento de entidades nombradas, analisis de sentimiento, respuesta a preguntas extractiva, similitud semantica y extraccion de embeddings contextuales. No es un modelo generativo: es un encoder bidireccional pensado para fine-tuning supervisado o para usar como extractor de caracteristicas. Su relevancia actual radica en ser el estandar de facto para NLP en frances y en servir como base para la mayoria de los modelos derivados en ese idioma.

La arquitectura es un transformer encoder de 12 capas y 768 dimensiones ocultas, con 111.246.085 parametros totales (dato verificado en los safetensors del repositorio). El contexto maximo es de 512 tokens y se entreno sobre 138 GB de texto de OSCAR. La licencia es MIT, lo que permite uso comercial sin restricciones practicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, 12 capas, 768 dim. ocultas, 12 cabezas) |
| Parametros totales | 111.246.085 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio no publica variantes cuantizadas; admite cuantizacion dinamica via PyTorch) |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (pytorch_model.bin), TensorFlow (tf_model.h5) |

## Arquitectura y entrenamiento

CamemBERT sigue la receta de RoBERTa aplicada al frances: un transformer encoder con 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y 3072 dimensiones en la capa feed-forward, con normalizacion LayerNorm post-atencion (configuracion RoBERTa, no BERT). El tokenizador es SentencePiece con vocabulario de 32.000 subpalabras, entrenado sobre el corpus frances. La mascara de atencion es bidireccional completa, sin causalidad, lo que lo hace apto para comprension pero no para generacion autoregresiva.

El preentrenamiento usa el objetivo de masked language modeling (MLM) con la dinamica de enmascaramiento de RoBERTa: mascaras generadas en cada epoca sobre secuencias de hasta 512 tokens, sin la tarea de prediccion de frase siguiente (NSP). Los datos provienen de OSCAR, un corpus filtrado por idioma a partir de Common Crawl, con 138 GB de texto frances en esta version base. No se aplicaron fases de RLHF ni DPO, ya que es un modelo encoder preentrenado y no un modelo de instrucciones. La innovacion principal del trabajo original fue demostrar que la receta RoBERTa trasladada a un corpus monolingue grande supera a los modelos multilingues (mBERT, XLM) en tareas francesas.

## Capacidades

- Relleno de mascaras (masked language modeling): predice tokens enmascarados en un contexto dado, util para completar frases y como senal de fluidez.
- Extraccion de embeddings contextuales: genera representaciones de 768 dimensiones por token, con acceso a las 13 salidas (capa de embedding mas 12 capas de atencion) para feature extraction.
- Clasificacion de secuencias: base para fine-tuning en analisis de sentimiento, deteccion de temas y clasificacion de documentos.
- Reconocimiento de entidades nombradas (NER): fine-tuning sobre esquemas como CoNLL o WikiNER en frances.
- Respuesta a preguntas extractiva: fine-tuning sobre SQuAD-fr y variantes.
- Similitud semantica y sentence embeddings: mediante pooling o fine-tuning con objetivos tipo Sentence-BERT.
- Etiquetado de dependencias y POS: base para analisis sintactico tras fine-tuning.
- No soporta tool calling, function calling, agentes, multi-step reasoning ni modo thinking (no es un modelo de instrucciones ni generativo).
- Capacidad multilingue limitada: entrenado solo en frances; su rendimiento en otros idiomas es residual.

## Casos de uso

- Clasificacion de documentos en produccion: fine-tuning de una cabeza de clasificacion sobre `CamembertModel` para categorizar tickets de soporte, correos o articulos en frances, aprovechando los 512 tokens de contexto y los embeddings de 768 dimensiones.
- Reconocimiento de entidades en contratos y facturas: fine-tuning sobre un corpus anotado en frances para extraer personas, organizaciones, importes y fechas en pipelines de digitalizacion documental.
- Analisis de sentimiento en resenas y redes sociales: clasificacion binaria o multiclase con un clasificador ligero sobre el embedding del token `[CLS]`, con coste de inferencia bajo (110M de parametros).
- Busqueda semantica y deduplicacion: generacion de embeddings de frases para indexar y recuperar documentos en frances mediante similitud coseno, tras fine-tuning con Sentence-BERT.
- Respuesta a preguntas extractiva sobre bases documentales: fine-tuning sobre SQuAD-fr para localizar el span de respuesta en un parrafo de contexto, util en asistentes de documentacion interna.
- Filtrado y moderacion de contenido en frances: clasificador de toxicidad o spam fine-tuneado sobre el encoder, desplegable en CPU por su tamano reducido.
- Base para destilacion o modelos derivados: punto de partida para entrenar modelos mas pequenos o especializados en dominios concretos (legal, medico, financiero) en frances.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval ni GSM8K (tareas no aplicables a un encoder MLM). El articulo original (arXiv:1911.03894) reporta resultados en tareas francesas como POS, dependencias, NER y XNLI, pero esos numeros no se reproducen aqui al no estar incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 450 MB de pesos (111M parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica, entre 0,6 y 1,2 GB.
- VRAM estimada en fp16: aproximadamente 225 MB de pesos; inferencia viable en GPUs con 2 GB o mas.
- VRAM estimada con cuantizacion dinamica int8: aproximadamente 110 MB de pesos, ejecutable en CPU sin GPU.
- GPU recomendadas: cualquier GPU moderna sirve; RTX 3060, RTX 4090, A100 o H100 estan sobredimensionadas para un solo modelo, pero permiten lotes grandes. Para produccion de alto throughput, A100 o H100 con procesamiento por lotes.
- Cabe en GPU consumer: si, en cualquier GPU con 2 GB o mas (GTX 1050 Ti, RTX 2060, RTX 3060, etc.); tambien en CPU para inferencia por lotes no criticos en latencia.
- Opciones de despliegue: Hugging Face Transformers (PyTorch y TensorFlow), Text Embeddings Inference (TEI) para embeddings, ONNX Runtime, TorchScript, y servidores de inferencia ligera como FastAPI con Transformers. No es compatible de forma nativa con vLLM ni llama.cpp por ser un encoder no generativo y no estar en formato GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por su tamano, se espera latencia de milisegundos por secuencia en GPU y decenas de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| illuin/camembert-base | 111M | 512 | fr | MIT | Hugging Face |
| camembert/camembert-large | 335M | 512 | fr | MIT | Hugging Face |
| camembert/camembert-base-ccnet | 110M | 512 | fr | MIT | Hugging Face |
| camembert/camembert-base-wikipedia-4gb | 110M | 512 | fr | MIT | Hugging Face |
| bert-base-multilingual-cased (referencia) | 178M | 512 | 104 idiomas | Apache 2.0 | Hugging Face |

El checkpoint `illuin/camembert-base` es funcionalmente equivalente a `camembert/camembert-base` (mismos pesos y tokenizador, mismo autor de origen). La diferencia practica esta en el mantenimiento y la visibilidad del repositorio: el oficial `camembert/*` es el que se cita en la literatura y el que recomienda la model card. Frente a `camembert-large`, la version base ofrece menor capacidad pero menor coste de inferencia y fine-tuning. Frente a mBERT, CamemBERT supera en tareas francesas segun el articulo original, a costa de perder cobertura multilingue.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre OSCAR (Common Crawl filtrado), hereda sesgos de genero, origen, religion y clase presentes en la web francesa; no se documenta una fase de mitigacion.
- Alucinacion: no aplica en el sentido generativo, pero el modelo puede producir predicciones de mascara plausibles y factualmente incorrectas; no debe usarse como fuente de verdad.
- Contexto limitado a 512 tokens: documentos mas largos requieren truncado, chunking o modelos de contexto extendido (Longformer, etc.).
- Monolingue: no debe esperarse un rendimiento aceptable fuera del frances; para otros idiomas hay que recurrir a modelos especificos.
- No es un modelo de instrucciones ni conversacional: no responde a prompts en lenguaje natural sin fine-tuning; no soporta tool calling ni agentes.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; no impone restricciones de campo de uso, pero conviene revisar la licencia de los datos de preentrenamiento (OSCAR) para usos sensibles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay senal de adopcion ni de mantenimiento por parte del autor `illuin`; para produccion se recomienda usar el checkpoint oficial `camembert/camembert-base`.
- Fecha de creacion y actualizacion del repositorio (2026-11-22) no coincide con la del modelo original (2020); conviene verificar la integridad de los pesos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/illuin/camembert-base
- Modelo oficial de referencia: https://huggingface.co/camembert/camembert-base
- Articulo original (arXiv): https://arxiv.org/abs/1911.03894
- Repositorio de codigo del proyecto: https://github.com/facebookresearch/fairseq/tree/main/examples/camembert (referenciado en la literatura del proyecto)
- Documentacion de Transformers para CamemBERT: https://huggingface.co/docs/transformers/model_doc/camembert
- Corpus OSCAR: https://oscar-corpus.com/
