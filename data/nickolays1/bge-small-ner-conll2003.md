# NickolayS1/bge-small-ner-conll2003

## Resumen

bge-small-ner-conll2003 es un modelo de reconocimiento de entidades nombradas (NER, *Named Entity Recognition*) obtenido por ajuste fino del encoder BAAI/bge-small-en-v1.5 sobre un dataset de etiquetado de secuencias que, por el nombre del repositorio, corresponde a CoNLL-2003. Lo publica el usuario NickolayS1 en Hugging Face y esta pensado exclusivamente para la tarea de token classification: asignar una etiqueta de entidad a cada token de un texto en ingles.

Arquitectonicamente es un transformer encoder-only de tipo BERT, con 33.215.625 parametros (aproximadamente 33,2 M) y salida de clasificacion por token. Al partir de bge-small-en-v1.5, hereda la arquitectura compacta y el tokenizador de la familia BGE, lo que lo hace muy ligero: cabe en CPU y en cualquier GPU de consumo, con un coste de inferencia minimo.

Su relevancia practica reside en la relacion tamano/rendimiento: con solo 33 M de parametros declara un F1 de 0,9129 y una precision de 0,9011 en el conjunto de evaluacion, cifras cercanas a las de encoders BERT-base tres veces mas grandes. Es, por tanto, un candidato util para tareas de extraccion de entidades de alto volumen y bajo presupuesto de computo. La model card, sin embargo, esta generada de forma automatica y no documenta el dataset de entrenamiento, el conjunto de etiquetas ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (token classification) |
| Parametros totales | 33.215.625 (segun safetensors) |
| Longitud de contexto | 512 tokens (heredada de la arquitectura del modelo base BAAI/bge-small-en-v1.5; no documentada en la model card) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni int8 en el repositorio) |
| Idiomas soportados | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 es monolingue en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos del repositorio: tamano del repo 0,1 GB, pipeline `token-classification`, compatible con endpoints de Hugging Face, creado el 27 de septiembre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de BAAI/bge-small-en-v1.5, un encoder BERT pequeno de la familia BGE orientado originalmente a *embeddings* de recuperacion. Sobre esa base se sustituye la cabeza de representacion por una cabeza de clasificacion por token, siguiendo el esquema estandar de NER sin capa CRF: se clasifica la representacion del primer subtoken de cada palabra (aproximacion descrita en la literatura de referencia sobre NER con BERT). El resultado es un modelo denso, sin mezcla de expertos ni atencion lineal, con decodificacion token a token.

La model card no detalla la composicion del dataset ("on an unknown dataset" y "Training and evaluation data: More information needed"), pero el nombre del repositorio apunta a CoNLL-2003, el corpus de referencia en ingles para NER con entidades de tipo persona, organizacion, localizacion y miscelanea. Los hiperparametros declarados son: learning rate 2e-05, `train_batch_size` 8, `eval_batch_size` 8, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08), scheduler lineal, 6 epocas y precision mixta (Native AMP). El entrenamiento duro 7.512 pasos (1.252 por epoca). No se documenta ninguna fase de RLHF, DPO ni instrucciones adicionales, algo coherente con un modelo puramente discriminativo de etiquetado. Se desconoce si se aplico early stopping: la mejor validacion en F1 se alcanza en la ultima epoca registrada (6,0), con un minimo de *validation loss* en la epoca 1 (0,0837).

## Capacidades

- Etiquetado de entidades nombradas a nivel de token en textos en ingles: deteccion y clasificacion de personas, organizaciones, localizaciones y miscelanea, segun la taxonomia habitual de CoNLL-2003 (categorias inferidas del nombre del repositorio; la model card no documenta explicitamente el conjunto de etiquetas).
- Clasificacion por token con precision agregada declarada de 0,9011, recall 0,9249, F1 0,9129 y accuracy 0,9818 sobre el conjunto de evaluacion.
- Inferencia de proposito unico: no genera texto, no razona, no responde preguntas y no produce *embeddings* de recuperacion (la cabeza original de BGE se ha reemplazado por la de clasificacion).
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el modelo base es monolingue en ingles.
- Sin capacidades de vision, audio, *thinking mode* ni modo de razonamiento explicito.
- Integrable en pipelines de Hugging Face mediante `pipeline("token-classification")` y exportable a otros *runtimes* (ONNX, TorchScript) por su arquitectura estandar BERT.

## Casos de uso

- Extraccion de entidades en archivos periodisticos: procesar grandes volumenes de noticias en ingles para poblar bases de conocimiento con personas, organizaciones y lugares mencionados, gracias a su bajo coste por documento.
- Enriquecimiento de CRM y ERP: detectar nombres de empresas y localizaciones en campos de texto libre (notas de comerciales, descripciones de clientes) y normalizar registros automaticamente.
- Preprocesado para pipelines RAG: etiquetar los fragmentos de un corpus documental con las entidades que contienen, de modo que el recuperador pueda aplicar filtros por organizacion, persona o lugar antes de pasar el contexto al modelo generativo.
- Indexacion y busqueda empresarial: anotar documentos internos para permitir consultas del tipo "documentos que mencionan a esta organizacion en esta ciudad", usando las etiquetas como facetas de busqueda.
- Triaje de tickets de soporte: extraer productos, empresas y ubicaciones de los correos de entrada para enrutarlos al equipo correcto; el modelo es lo bastante pequeno para ejecutarse en CPU con latencia baja y sostener miles de peticiones por minuto.
- Preetiquetado para anotacion humana: generar propuestas de etiquetas sobre corpus nuevos y corregirlas manualmente, reduciendo el esfuerzo de anotacion en proyectos de NER en ingles.
- Analisis de documentos legales o financieros: localizar partes, jurisdicciones y entidades citadas en contratos, resoluciones o informes, siempre con revision humana posterior dado el caracter probabilistico de la salida.
- Servicio de NER de bajo coste en *edge* o en contenedores pequenos: con 33 M de parametros el modelo puede desplegarse en una instancia minima, una Raspberry Pi o incluso un portatil, sin GPU.

## Benchmarks y rendimiento

El `model-index` del repositorio no contiene resultados (`results: []`). Los unicos datos disponibles son las metricas declaradas por el autor sobre el conjunto de evaluacion final: *loss* 0,0856, precision 0,9011, recall 0,9249, F1 0,9129 y accuracy 0,9818.

Evolucion durante el entrenamiento (datos declarados por el autor en la model card):

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 1252 | 0,0837 | 0,8874 | 0,9138 | 0,9004 | 0,9802 |
| 2,0 | 2504 | 0,0860 | 0,8935 | 0,9180 | 0,9056 | 0,9811 |
| 3,0 | 3756 | 0,0848 | 0,9002 | 0,9187 | 0,9094 | 0,9818 |
| 4,0 | 5008 | 0,0843 | 0,8936 | 0,9217 | 0,9075 | 0,9815 |
| 5,0 | 6260 | 0,0840 | 0,8990 | 0,9238 | 0,9112 | 0,9818 |
| 6,0 | 7512 | 0,0856 | 0,9011 | 0,9249 | 0,9129 | 0,9818 |

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo discriminativo de etiquetado de tokens, ni se aportan metricas desagregadas por tipo de entidad (persona, organizacion, localizacion, miscelanea). Tampoco se especifica el conjunto de evaluacion exacto mas alla de "evaluation set".

## Requisitos de hardware

- Peso de los parametros: aproximadamente 133 MB en FP32, 66 MB en FP16 y 33 MB en int8. El repositorio completo ocupa 0,1 GB.
- VRAM estimada para inferencia: menos de 1 GB en cualquier precision habitual, incluyendo activaciones y *batch* pequeno.
- GPU recomendadas: cualquier GPU moderna sirve; para maximizar *throughput*, una NVIDIA T4, L4, A10, RTX 3060/4090 o superior con FP16. Una A100 o H100 esta sobredimensionada para un encoder de 33 M de parametros.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 2060 en adelante, e incluso en iGPU con suficiente memoria compartida.
- Ejecucion en CPU totalmente viable, incluidas Raspberry Pi 4/5 y contenedores con 1-2 GB de RAM, que es el escenario mas razonable para produccion con este tamano.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, ONNX Runtime o `optimum` para acelerar en CPU, TorchScript, y servidores de inferencia como TGI o vLLM (funcionan con arquitectura BERT, aunque estan pensados para modelos generativos y resultan sobredimensionados). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa a formato compatible.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Metricas declaradas |
|---|---|---|---|---|---|
| NickolayS1/bge-small-ner-conll2003 | 33.215.625 | 512 tokens (segun modelo base) | NER (token classification) | MIT | F1 0,9129; precision 0,9011; recall 0,9249; accuracy 0,9818 |
| MsvoZ/bge-small-en-v1.5-conll2003-ner | no disponible | no disponible | NER sobre el mismo modelo base | no disponible en la informacion disponible | no disponible |
| RahatLukuum/bge-small-ner-conll2003 | no disponible | no disponible | NER sobre el mismo modelo base | no disponible en la informacion disponible | no disponible |
| dslim/bert-base-NER (referencia habitual de la categoria) | no verificado en la informacion disponible | no disponible | NER en ingles | no disponible en la informacion disponible | no disponible |

Los dos primeros son ajustes practicamente equivalentes del mismo modelo base (BAAI/bge-small-en-v1.5) sobre el mismo corpus, publicados por autores distintos; se incluyen como alternativas directas, aunque no se dispone de sus cifras para una comparacion cuantitativa. La busqueda web no ha proporcionado benchmarks verificables de terceros para ninguno de ellos.

## Limitaciones y advertencias

- La model card esta generada automaticamente por el `Trainer` y contiene secciones sin completar: descripcion, usos previstos, limitaciones y datos de entrenamiento figuran como "More information needed". El propio autor no ha validado el contenido.
- El dataset de entrenamiento se declara como "unknown dataset"; la identificacion con CoNLL-2003 es una inferencia a partir del nombre del repositorio y no una confirmacion documental.
- No se documenta el conjunto de etiquetas ni los esquemas de etiquetado (BIO, BIOES), lo que puede provocar errores de interpretacion de las etiquetas devueltas en produccion.
- Modelo monolingue de facto: no se declaran idiomas y el modelo base es la variante inglesa de BGE. No debe esperarse un rendimiento fiable en castellano ni en otros idiomas sin un ajuste fino adicional.
- Riesgo de alucinacion de entidades: como todo clasificador probabilistico, puede etiquetar como entidad cadenas que no lo son (falsos positivos) o dejar sin etiquetar entidades poco frecuentes, especialmente nombres propios desconocidos y siglas ambiguas.
- Sesgos potencialmente heredados del corpus de noticias anglosajon: sobrerrepresentacion de entidades estadounidenses y europeas, y menor cobertura de nombres y organizaciones de otras regiones.
- No incluye capa CRF, de modo que las secuencias de etiquetas pueden ser localmente inconsistentes (por ejemplo, transiciones invalidas entre etiquetas contiguas) si no se aplica una decodificacion posterior.
- El modelo no genera *embeddings* de recuperacion: no puede reutilizarse como modelo de *retrieval* pese a derivar de BGE, ya que la cabeza original se ha sustituido por una de clasificacion.
- Licencia MIT: permite uso comercial y modificacion con atribucion y sin garantia; conviene conservar el aviso de copyright. Hay que verificar ademas las condiciones de uso del dataset de entrenamiento empleado (no declarado), que puede imponer restricciones adicionales.
- Con 0 descargas y 0 *likes* en el momento de la consulta, y sin evaluacion externa, no existe evidencia de produccion mas alla de las metricas del propio autor sobre un unico conjunto de evaluacion (sin intervalo de confianza ni analisis por clase). Se recomienda validar sobre un corpus propio antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NickolayS1/bge-small-ner-conll2003
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Alternativa equivalente 1: https://huggingface.co/MsvoZ/bge-small-en-v1.5-conll2003-ner
- Alternativa equivalente 2: https://huggingface.co/RahatLukuum/bge-small-ner-conll2003
- Ficha de terceros sobre la alternativa de MsvoZ: https://free2aitools.com/model/msvoz/bge-small-en-v1.5-conll2003-ner
- Reproduccion experimental de NER con BERT sobre CoNLL-2003: https://github.com/bigjeager/bert_ner
- Proyecto de NER sobre CoNLL-2003 con clasificador clasico (referencia de tarea): https://github.com/nasa013/Named-Entity-Recognition-using-conll2003-dataset
