# LeenAlsahli/saudi-marbert-intent

## Resumen

saudi-marbert-intent es un modelo de clasificacion de intenciones (intent detection) obtenido por ajuste fino de MARBERT, el encoder bidireccional de UBC-NLP especializado en arabe. Lo publica la usuaria LeenAlsahli en HuggingFace bajo licencia Apache 2.0, con un repo de 0,7 GB y pesos en safetensors. El identificador del modelo sugiere un enfoque sobre arabe saudí (dialecto del Golfo), aunque la model card publicada es practicamente vacia: solo contiene la linea de licencia, sin descripcion de tarea, etiquetas de salida, datos de entrenamiento ni metricas.

El modelo tiene 162.846.727 parametros, un orden de magnitud coherente con la familia BERT-base/MARBERT (encoder denso de 12 capas). No es un modelo generativo: esta pensado para producir una etiqueta de clase a partir de un texto de entrada, tipicamente en tareas de enrutado de peticiones, deteccion de intencion en asistentes conversacionales o clasificacion de tickets. El repo acumula 0 descargas y 0 likes, y no se ha publicado informacion adicional sobre su entrenamiento.

Su relevancia es limitada y muy contextual: cubre un nicho concreto (comprension de lenguaje natural en arabe dialectal, con foco declarado en Arabia Saudi) donde la oferta de modelos abiertos ajustados es escasa. Al no haber model card, benchmarks ni ejemplos de uso, cualquier evaluacion seria exige validar el modelo contra un conjunto de test propio antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT (base de MARBERT) |
| Parametros totales | 162.846.727 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la arquitectura BERT base suele limitarse a 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos safetensors permiten cuantizacion posterior a fp16/int8, pero el autor no publica variantes) |
| Idiomas soportados | no disponible en la informacion proporcionada; por el nombre del modelo y su base MARBERT, el foco es arabe (dialectal y estandar moderno), con enfasis declarado en arabe saudí |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Tarea declarada | no disponible (el nombre indica clasificacion de intenciones) |
| Etiquetas de salida | no disponible |
| Fecha de creacion | 2026-09-29 |
| Fecha de ultima actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura heredada es la de MARBERT: un encoder Transformer bidireccional con atencion completa, preentrenado por UBC-NLP sobre aproximadamente mil millones de tuits en arabe, con un vocabulario de unos 128.000 tokens disenado para cubrir variantes dialectales. MARBERT se preentrena con objetivos de masked language modeling sobre texto dialectal y estandar moderno, lo que le da una ventaja frente a mBERT o XLM-R en variedades no estandar del arabe. Sobre esa base, este repositorio anade una cabeza de clasificacion para la tarea de deteccion de intenciones.

Fuera de eso, no hay informacion publica: la model card no documenta el conjunto de datos de ajuste fino, el numero de ejemplos, el esquema de etiquetas, la division train/validacion/test, hiperparametros, epocas ni si se aplico algun tipo de regularizacion o busqueda de learning rate. Tampoco se indica si hubo alguna innovacion tecnica (destilacion, decodificacion especulativa, atencion lineal) — en un encoder BERT de clasificacion no serian esperables. En la practica, el modelo debe tratarse como un checkpoint opaco cuya idoneidad hay que verificar empiricamente.

## Capacidades

- Clasificacion de texto: el nombre del repositorio indica deteccion de intenciones, es decir, asignar una etiqueta de clase a una frase corta.
- Procesamiento de arabe dialectal: al derivar de MARBERT, se espera mejor comportamiento en dialectos arabes (incluido el del Golfo/saudí) que en encoders multilingues genericos.
- Encoder de representaciones: puede utilizarse para extraer embeddings contextuales de frases en arabe, aunque el autor no publica una version especifica de sentence-transformers ni metricas de similitud.
- Clasificacion de secuencias cortas: el formato habitual de uso seria texto de entrada -> logits por clase.
- Tool calling / function calling: no soportado de forma nativa; un encoder de clasificacion puede usarse como enrutador de intenciones dentro de un sistema de agentes, pero no genera llamadas a herramientas por si mismo.
- Generacion de texto: no soportada (no es un modelo causal).
- Razonamiento multi-paso, matematicas, codigo, vision, audio: no soportados.
- Capacidades multilingues: no documentadas; la unica evidencia es la base MARBERT, centrada en arabe.
- Modo thinking o variantes de razonamiento explicito: no disponibles.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales en arabe: el modelo clasificaria la frase del usuario en una de las intenciones predefinidas (consulta de saldo, cambio de direccion, reclamacion) y enviaria la peticion al flujo correspondiente. Es el uso mas directo dado el nombre del checkpoint, pero exige conocer de antemano el esquema de etiquetas, que no esta publicado.
- Triaje de tickets de soporte en arabe saudí: clasificar cada ticket entrante por categoria para asignarlo al equipo adecuado, aprovechando la especializacion dialectal de MARBERT frente a modelos multilingues.
- Moderacion de contenido en redes sociales: deteccion de mensajes ofensivos o spam en arabe dialectal, una tarea habitual en la literatura sobre MARBERT (hay trabajos publicados que reportan F1, precision y recall en clasificacion de tuits arabes).
- Analisis de encuestas y formularios abiertos: agrupar respuestas de texto libre en arabe en categorias tematicas para su posterior analisis cuantitativo.
- Clasificacion de resenas de producto o servicio: separar opiniones por tematica (entrega, precio, atencion) en comercio electronico orientado al mercado del Golfo.
- Preprocesado para pipelines RAG: usar el modelo como clasificador de intencion previo a la recuperacion, decidiendo que indice documental consultar antes de invocar a un modelo generativo.
- Deteccion de urgencia o criticidad: etiquetar mensajes que requieren atencion inmediata en canales de atencion al cliente.
- Filtro previo en sistemas de voz: clasificar la transcripcion ASR de una llamada para dirigirla al menu o agente correcto.

En todos los casos, la ausencia de model card obliga a validar previamente: no se conocen las etiquetas exactas ni el dominio de entrenamiento, por lo que el modelo podria no corresponder a la intencion que se le atribuye por el nombre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas (accuracy, F1, precision, recall), ni conjuntos de evaluacion, ni comparaciones con otros modelos. Los articulos encontrados en la busqueda web tratan sobre MARBERT como modelo base en tareas de spam y analisis de sentimiento en tuits arabes, pero no evaluan este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,65 GB solo para pesos, mas activaciones; en la practica menos de 2 GB para lotes pequenos.
- VRAM estimada en fp16: aproximadamente 0,33 GB de pesos; inferior a 1,5 GB con overhead de runtime.
- VRAM estimada en int8: aproximadamente 0,16 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas. Funciona en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10G, A100 y H100 sin problema.
- Cabe en GPU de consumo: si, con holgura, incluso en GPUs de gama de entrada y en portatiles con GPU dedicada de 4-6 GB.
- CPU: viable para inferencia en tiempo real con secuencias cortas; el modelo es pequeno (163 M de parametros) y no requiere acelerador.
- Opciones de despliegue: HuggingFace Transformers (AutoModelForSequenceClassification), ONNX Runtime mediante Optimum para reducir latencia, TorchServe o FastAPI como servicio HTTP, y exportacion a TensorRT para maximo throughput. vLLM y TGI estan orientados a modelos generativos; en encoders de clasificacion aportan poco. llama.cpp/GGUF solo tendria sentido con conversion manual y soporte limitado para clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de orden de magnitud para un BERT-base en GPU moderna, la inferencia de una secuencia corta suele resolverse en unidades de milisegundos, pero el autor no publica ninguna medicion.
- Batching: recomienda lotes de 16 a 64 en GPU para clasificacion por lotes de grandes volumenes de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeenAlsahli/saudi-marbert-intent | 162.846.727 | no disponible | clasificacion de intenciones (segun nombre) | apache-2.0 | HuggingFace, 0 descargas, sin model card |
| UBC-NLP/MARBERT | no disponible en la informacion proporcionada (orden de 163 M segun la documentacion publica del modelo base) | no disponible | encoder de proposito general para arabe | no disponible en la informacion proporcionada | publico en HuggingFace |
| UBC-NLP/ARBERT | no disponible en la informacion proporcionada | no disponible | encoder de proposito general para arabe estandar moderno | no disponible en la informacion proporcionada | publico en HuggingFace |
| mBERT (bert-base-multilingual-cased) | no disponible en la informacion proporcionada | no disponible | encoder multilingue de proposito general | no disponible en la informacion proporcionada | ampliamente disponible |
| XLM-R base | no disponible en la informacion proporcionada | no disponible | encoder multilingue de proposito general | no disponible en la informacion proporcionada | ampliamente disponible |

La comparacion cuantitativa no es posible con los datos disponibles: no hay benchmarks de este checkpoint ni cifras de parametros verificadas en la informacion proporcionada para las alternativas. Cualitativamente, la ventaja diferencial de este modelo seria el ajuste especifico a intenciones en arabe saudí, frente a encoders genericos que requeririan un ajuste propio.

## Limitaciones y advertencias

- Model card practicamente vacia: solo contiene la licencia. No se documentan etiquetas, dataset, proceso de entrenamiento ni evaluacion.
- Riesgo elevado de uso incorrecto: al desconocer el esquema de clases, es facil interpretar la salida de forma erronea.
- Sin benchmarks: no hay ninguna evidencia publicada de calidad, lo que impide comparar con alternativas.
- Riesgo de alucinacion no aplicable en sentido generativo (no genera texto), pero si de clasificaciones erroneas con alta confianza en entradas fuera del dominio de entrenamiento.
- Sesgos: no documentados. Los modelos entrenados sobre tuits arabes heredan sesgos dialectales, geograficos y de registro (lenguaje informal, ruido, posibles contenidos ofensivos).
- Cobertura idiomatica: si el modelo esta ajustado solo a arabe saudí, su rendimiento caera en otros dialectos o en arabe estandar moderno formal.
- Longitud de entrada: al derivar de BERT base, lo previsible es un limite de 512 tokens, con truncado de textos largos. No confirmado por el autor.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de cumplir las condiciones de la licencia del modelo base ni de atribuir correctamente.
- Reputacion del repositorio: 0 descargas y 0 likes, sin historial de mantenimiento. No hay garantia de soporte ni de actualizaciones.
- Para produccion: se recomienda tratar el checkpoint como experimental y validarlo con un conjunto de test propio etiquetado antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeenAlsahli/saudi-marbert-intent
- MARBERT (modelo base) en HuggingFace: https://huggingface.co/UBC-NLP/MARBERT
- Repositorio GitHub de MARBERT y ARBERT: https://github.com/UBC-NLP/marbert
- Articulo sobre deteccion de spam y sentimiento en tuits arabes con MARBERT: https://arxiv.org/abs/2606.25495
- Version PDF del articulo anterior: https://arxiv.org/pdf/2606.25495
- Temas de GitHub relacionados con marbert: https://github.com/topics/marbert
