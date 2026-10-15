# Parzisam/sarcasmo-xlmr-large

## Resumen

Parzisam/sarcasmo-xlmr-large es un modelo de clasificacion de texto (text-classification) publicado en HuggingFace Hub por el usuario Parzisam, orientado a la deteccion de sarcasmo. Se trata de un ajuste fino sobre el backbone multilingue XLM-RoBERTa large: el recuento real de parametros en safetensors (559.892.482) coincide exactamente con el de xlm-roberta-large, lo que confirma la arquitectura base. El repositorio ocupa 6,7 GB, un tamano coherente con un checkpoint en fp32 mas posibles copias adicionales de pesos.

La relevancia de este tipo de modelos es practica: la deteccion de sarcasmo e ironia es una tarea de clasificacion sensible al contexto, con aplicaciones directas en moderacion de contenido, analisis de opinion y monitorizacion de marca en redes sociales, donde los clasificadores de sentimiento convencionales fallan sistematicamente porque interpretan literalmente el enunciado.

La model card publicada es la plantilla autogenerada de transformers sin rellenar: no declara licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion. Cualquier uso en produccion requiere auditoria previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia XLM-RoBERTa large), 24 capas, 1024 dimensiones ocultas, 16 cabezas de atencion, vocabulario de 250.002 tokens |
| Parametros totales | 559.892.482 (dato real extraido de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (derivado de max_position_embeddings de la arquitectura base; no declarado en la model card) |
| Tipos de cuantizacion | no disponible en la model card; la arquitectura admite fp32, fp16, bf16 y cuantizacion dinamica INT8 via PyTorch/ONNX |
| Idiomas soportados | no disponible en la model card; el backbone XLM-R esta preentrenado en 100 idiomas y los modelos con nombre equivalente del Hub declaran espanol |
| Licencia | no disponible |
| Formato de pesos | safetensors (tambien compatible con checkpoints PyTorch estandar) |
| Pipeline declarado | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 6,7 GB |
| Fecha de creacion en el Hub | 2026-10-15 (fecha registrada en el Hub; puede ser un error de metadatos) |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa large: un transformer encoder-only con atencion completa, 24 capas, 1024 de dimension oculta y 16 cabezas. El backbone original se preentreno con el objetivo de language modeling enmascarado sobre corpus multilingues filtrados de Common Crawl (aproximadamente 2,5 TB de texto en 100 idiomas). Sobre esa base se ha anadido una cabeza de clasificacion de secuencia, presumiblemente con dos etiquetas (sarcastico / no sarcastico), aunque el numero de clases no se especifica en la informacion disponible.

No hay ningun dato disponible sobre el procedimiento de ajuste fino: se desconoce el dataset empleado, el numero de ejemplos, la composicion linguistica, el numero de epocas, la tasa de aprendizaje, si hubo balanceo de clases y si se aplico alguna tecnica de alineacion como RLHF o DPO (poco habitual en clasificadores de este tipo). Tampoco se documenta la estrategia de tokenizacion ni el preprocesado de texto.

La referencia bibliografica incluida en las etiquetas del repositorio (arxiv:1910.09700) corresponde al articulo de Lacoste et al. sobre cuantificacion de emisiones de carbono en machine learning, citado en la plantilla de model card, y no a un paper descriptivo de este modelo.

## Capacidades

- Clasificacion de texto binaria o multiclase orientada a deteccion de sarcasmo e ironia en enunciados cortos.
- Transferencia cross-lingue potencial gracias al backbone XLM-R, aunque no hay confirmacion de que el ajuste fino cubra mas de un idioma.
- Extraccion de logits y probabilidades por clase a traves de `pipeline("text-classification")` o `AutoModelForSequenceClassification`.
- Uso como extractor de caracteristicas congelado para tareas auxiliares, sustituyendo la cabeza de clasificacion.
- No se declara soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de razonamiento explicito.
- No es un modelo generativo: no produce texto libre ni explicaciones; unicamente asigna etiquetas y puntuaciones.

## Casos de uso

- Moderacion de comentarios en plataformas: clasificar comentarios con lenguaje aparentemente elogioso pero intencion agresiva, un patron que los filtros por palabras clave no capturan.
- Analisis de sentimiento en redes sociales: corregir la polaridad de publicaciones ironicas antes de agregar metricas de opinion sobre un producto o una campana.
- Monitorizacion de marca: detectar menciones sarcasticas que un analizador de sentimiento convencional etiquetaria como positivas y que requieren escalado al equipo de comunicacion.
- Analisis de resenas de producto: separar resenas genuinamente positivas de resenas ironicamente negativas que pueden distorsionar la valoracion media.
- Investigacion en linguistica computacional: generar etiquetas automaticas sobre corpus de gran volumen para estudios de pragmatica, con revision humana posterior.
- Preprocesado para sistemas de atencion al cliente: marcar mensajes saturados de ironia y enrutarlos a agentes humanos en lugar de a un bot automatico.
- Deteccion de abuso encubierto: identificar ataques velados expresados como falsos cumplidos en foros.
- Filtrado previo en pipelines de anotacion: priorizar que muestras requieren etiquetado manual, reduciendo el coste de anotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tabla de evaluacion, ni metricas de exactitud, F1, precision o recall, ni descripcion del conjunto de test utilizado. Tampoco se documenta ningun resultado sobre tareas estandar como MMLU, GLUE, XNLI o sobre datasets de sarcasmo de referencia (por ejemplo iSarcasm, SARC o el corpus de sarcasmo en espanol que se haya podido emplear).

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 2,24 GB en fp32, 1,12 GB en fp16 o bf16 y unos 0,56 GB con cuantizacion dinamica INT8 (calculado sobre 559,9 M de parametros; sin contar overhead del runtime, que puede anadir varios cientos de MB).
- Entrenamiento o ajuste fino: requiere bastante mas memoria; con AdamW completo en fp32 la huella de parametros, gradientes y estados del optimizador se situa en el entorno de 8,9 GB, por lo que se recomienda una GPU con 16 GB o superior y precision mixta.
- GPU recomendadas para produccion de alta concurrencia: NVIDIA A100, H100, L40S o T4. Para desarrollo y lotes moderados, cualquier GPU consumer con 8 GB o mas es suficiente.
- Compatibilidad con GPU consumer: si, cabe holgadamente en RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090, e incluso en GPU de 4 GB con cuantizacion INT8.
- Inferencia en CPU: viable para cargas de baja concurrencia, dado el tamano moderado del modelo, con latencias del orden de decenas de milisegundos por secuencia corta.
- Opciones de despliegue: pipeline de transformers, TorchServe, ONNX Runtime con Optimum, Triton Inference Server, FastAPI propio y servicios gestionados compatibles con el tag endpoints_compatible del repositorio. El repositorio tambien esta etiquetado como text-embeddings-inference, aunque conviene verificar la compatibilidad real, ya que se trata de un clasificador y no de un modelo de embeddings.
- Latencia y throughput: no se han publicado mediciones. Como referencia orientativa sin validar, un encoder de 559 M en una GPU moderna procesa lotes de secuencias cortas con un throughput del orden de cientos a pocos miles de secuencias por segundo, y del orden de milisegundos por secuencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Parzisam/sarcasmo-xlmr-large | 559,9 M | 512 tokens (derivado) | Clasificacion de sarcasmo | no disponible | no disponible | HuggingFace, 0 descargas |
| andresdfx/sarcasmo-xlmr-large | no disponible | no disponible | Clasificacion de sarcasmo | espanol (segun etiquetas) | no disponible | HuggingFace |
| paolavilla85/sarcasmo-xlmr-large-es | no disponible | no disponible | Clasificacion de sarcasmo | no disponible | no disponible | HuggingFace |
| cardiffnlp/twitter-roberta-base-irony | 125 M aprox. | 512 tokens | Deteccion de ironia | ingles | no disponible en esta busqueda | HuggingFace |

Los tres primeros comparten aparentemente el mismo backbone y el mismo dominio de aplicacion, por lo que la eleccion entre ellos deberia basarse en una evaluacion propia sobre el corpus objetivo. El cuarto es una alternativa mas ligera y mas rapida, pero limitada al ingles y a la deteccion de ironia en tuits.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada sin contenido: no hay informacion verificable sobre datos, metricas, sesgos ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no hay autorizacion clara y contactar con el autor antes de cualquier despliegue productivo.
- No hay datos de evaluacion: se desconoce la exactitud real, el equilibrio entre precision y recall y el comportamiento sobre dominios distintos del conjunto de entrenamiento.
- La deteccion de sarcasmo es una tarea con alta dependencia cultural y de registro; un modelo ajustado sobre un corpus concreto degradara su rendimiento en otros generos textuales (prensa formal, documentacion tecnica, conversaciones de soporte).
- Riesgo de falsos positivos en textos con humor literal, citas, lenguaje figurado no ironico o enfasis retorico.
- El limite de 512 tokens impide clasificar documentos largos sin truncado o segmentacion previa; el truncado puede eliminar precisamente el contexto que define la ironia.
- No se especifican los idiomas cubiertos por el ajuste fino; el backbone es multilingue, pero la cabeza de clasificacion puede estar ajustada solo en espanol.
- No hay informacion sobre sesgos demograficos, dialectales o de registro. Se recomienda auditar el modelo sobre subgrupos antes de usarlo en moderacion automatizada, donde los falsos positivos tienen consecuencias directas sobre usuarios.
- El modelo no genera explicaciones, por lo que su uso en flujos con requisitos de transparencia o apelacion necesita capas adicionales de interpretabilidad.
- El repositorio no registra descargas ni valoraciones, lo que sugiere que no ha sido validado por la comunidad.
- Las fechas de creacion y actualizacion registradas en el Hub (2026-10-15) son anomalas y conviene tratarlas con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Parzisam/sarcasmo-xlmr-large
- Modelo con nombre equivalente (andresdfx): https://huggingface.co/andresdfx/sarcasmo-xlmr-large
- Modelo con nombre equivalente (paolavilla85): https://huggingface.co/paolavilla85/sarcasmo-xlmr-large-es
- Repositorio GitHub de deteccion de sarcasmo SarkasamAI (proyecto independiente): https://github.com/thevedantt/SarkasamAI
- Paper del modelo base XLM-R (Conneau et al., Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Paper citado en las etiquetas del repositorio, sobre emisiones de carbono en ML (Lacoste et al.): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML referenciada en la plantilla: https://mlco2.github.io/impact
- Paper de XLM-RoBERTa large en HuggingFace: https://huggingface.co/FacebookAI/xlm-roberta-large
