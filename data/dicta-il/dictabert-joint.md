# dicta-il/dictabert-joint

## Resumen

DictaBERT-joint es un modelo BERT afinado para el procesamiento conjunto de múltiples tareas de analisis linguistico del hebreo moderno. Lo desarrolla el equipo de Dicta (dicta-il), un grupo israeli centrado en herramientas de procesamiento del lenguaje natural para hebreo. El modelo resuelve un problema clasico de la morfologia semitica: la segmentacion de prefijos, la desambiguacion morfologica, la lematizacion, el analisis sintactico de dependencias y el reconocimiento de entidades nombradas de forma simultanea sobre una misma representacion.

Se trata de un transformer encoder de tipo BERT con 186 millones de parametros (aproximadamente 186.012.926 segun los pesos safetensors), lo que lo situa en la categoria de modelos base. No es un modelo generativo ni de chat: su pipeline declarado es `feature-extraction` y su interfaz expone un metodo `predict` que devuelve estructuras JSON o formato Universal Dependencies (UD). Es relevante porque el hebreo carece historicamente de herramientas de parsing de alta calidad y este modelo unifica en una sola pasada tareas que normalmente requieren pipelines encadenados, reduciendo la propagacion de errores entre etapas.

La ficha corresponde a la variante "joint" del ecosistema DictaBERT, publicado con el paper arXiv:2403.06970. Existe una version tiny (bert-tiny) para inferencia mas rapida y otras variantes bert-base para tareas individuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (con cabezas de tarea personalizadas mediante `trust_remote_code`) |
| Parametros totales | 186.012.926 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (repo de 3.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de un encoder BERT base (12 capas, atencion bidireccional completa) sobre el que se anaden cabezas especificas para cada tarea: segmentacion de prefijos, desambiguacion morfologica, analisis lexicografico (lematizacion), parsing sintactico de dependencias y reconocimiento de entidades nombradas. La innovacion principal es el entrenamiento conjunto (multi-task) de todas las cabezas sobre una representacion compartida, de modo que la informacion morfologica alimenta al parser y viceversa. La model card indica que se puede desactivar selectivamente la inicializacion de cabezas mediante los flags `do_lex`, `do_syntax`, `do_ner`, `do_prefix` y `do_morph`, lo que permite usar solo las tareas necesarias y reducir coste.

No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (poco probables en un encoder discriminativo). El paper asociado (arXiv:2403.06970) es la referencia para esos detalles. La salida se alinea con el esquema Universal Dependencies y ofrece una variante de estilo IAHLT con diferencias de granularidad en relaciones de dependencia, segmentacion de sufijos y articulos definidos implicitos.

## Capacidades

- Segmentacion de prefijos (prefijos preposicionales, conjunciones, articulo definido) en tokens hebreos.
- Desambiguacion morfologica con etiquetas POS, genero, numero, persona y tiempo.
- Lematizacion (analisis lexicografico) por token.
- Parsing sintactico de dependencias con `dep_head_idx`, `dep_func` y `dep_head`.
- Reconocimiento de entidades nombradas (NER) a nivel de oracion.
- Salida en tres formatos: JSON estructurado, UD estandar y UD estilo IAHLT.
- Desactivacion selectiva de cabezas para inferencia mas ligera.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de extraccion de caracteristicas y etiquetado.
- Capacidad multilingue limitada al hebreo.

## Casos de uso

- Analisis morfologico y sintactico de corpus hebreos: el modelo procesa oraciones y devuelve arboles de dependencias y etiquetas morfologicas listos para anotar corpus linguisticos o entrenar otros modelos.
- Construccion de treebanks y datasets anotados: la salida UD permite generar anotaciones compatibles con el esquema Universal Dependencies para investigacion en linguistica computacional.
- Enriquecimiento de motores de busqueda en hebreo: la lematizacion y segmentacion de prefijos permiten normalizar consultas y documentos para mejorar la recuperacion (por ejemplo, indexar por lema en lugar de por forma superficial).
- Preprocesado para pipelines de NLP en hebreo: servir como etapa de tokenizacion linguistica y POS tagging antes de tareas posteriores como traduccion, resumen o clasificacion.
- Extraccion de entidades nombradas en documentos: identificar personas, organizaciones y lugares en textos hebreos para sistemas de informacion, monitorizacion de medios o cumplimiento normativo.
- Analisis de texto para humanidades digitales: estudiar estructuras sintacticas y morfologia en corpus historicos o literarios en hebreo.
- Herramientas educativas de ensenanza del hebreo: visualizacion de arboles sintacticos y descomposicion morfologica para estudiantes, como demuestra la demo publica en Hugging Face Spaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 186 M de parametros, los pesos en fp32 ocupan aproximadamente 0,75 GB; en fp16 unos 0,37 GB. El repo completo pesa 3,0 GB, por lo que conviene descargar solo los pesos necesarios.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (T4, RTX 3060, RTX 4090, A100, H100). Tambien puede ejecutarse en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por las cabezas personalizadas), y el tag `text-embeddings-inference` sugiere compatibilidad con TEI. No se documenta soporte nativo en vLLM, llama.cpp u Ollama (modelos encoder con codigo remoto no encajan en esos runners).
- Latencia y throughput: no disponibles en la informacion proporcionada; para mayor velocidad existe la variante `dictabert-tiny-joint`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dicta-il/dictabert-joint | 186 M | no disponible | Segmentacion, morfologia, lematizacion, dependencias, NER (conjuntas) | cc-by-4.0 | Hugging Face |
| dicta-il/dictabert-tiny-joint | no disponible (bert-tiny) | no disponible | Mismas tareas, version mas rapida | cc-by-4.0 | Hugging Face |
| Otras variantes DictaBERT bert-base | no disponible | no disponible | Tareas individuales | cc-by-4.0 | Hugging Face (coleccion dictabert) |
| Modelos BERT multilingues genericos | ~178 M (bert-base-multilingual) | 512 tokens tipico | Principalmente clasificacion/embeddings, sin cabezas de parsing hebreo | Apache 2.0 / MIT segun variante | Hugging Face |

La comparativa con alternativas de parsing hebreo especificas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en hebreo; no es util para otros idiomas.
- Es un modelo discriminativo, no generativo: no produce texto libre ni responde a instrucciones.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de usarlo en produccion.
- Riesgo de errores en texto ruidoso, informal, con abreviaturas o con ortografia no estandar; la calidad del parsing depende de la calidad de la tokenizacion.
- Posibles sesgos derivados de los corpus de entrenamiento (probablemente prensa y textos formales israelies), no documentados en la informacion disponible.
- La licencia cc-by-4.0 permite uso comercial con atribucion, pero exige citar al autor y el paper; verificar los terminos exactos antes de redistribuir.
- No se documentan limites de longitud de contexto; para oraciones muy largas puede requerir segmentacion previa.
- La salida UD estilo IAHLT difiere del UD estandar en granularidad; elegir el formato adecuado segun el consumidor downstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dicta-il/dictabert-joint
- Paper: https://arxiv.org/abs/2403.06970
- Demo interactiva (Hugging Face Spaces): https://huggingface.co/spaces/dicta-il/joint-demo
- Variante tiny: https://huggingface.co/dicta-il/dictabert-tiny-joint
- Coleccion DictaBERT: https://huggingface.co/collections/dicta-il/dictabert-6588e7cc08f83845fc42a18b
