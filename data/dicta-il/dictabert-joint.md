# dicta-il/dictabert-joint

## Resumen

DictaBERT-joint es un modelo de lenguaje encoder basado en BERT, desarrollado por el equipo de Dicta (dicta-il), especializado en el analisis morfosintactico del hebreo moderno. Se trata de un modelo multi-tarea que realiza de forma conjunta cinco tareas de procesamiento: segmentacion de prefijos, desambiguacion morfologica, lematizacion (analisis lexicografico), analisis sintactico de dependencias (arbol UD) y reconocimiento de entidades nombradas (NER). El modelo fue publicado junto al articulo "DictaBERT: A State-of-the-Art BERT Suite for Modern Hebrew" (arXiv:2403.06970) y su peso en safetensors es de 186.012.926 parametros.

Su relevancia radica en que resuelve la mayoria del pipeline clasico de NLP para hebreo en una sola pasada, devolviendo la anotacion completa por token en formatos JSON o CoNLL-U (estilo UD y estilo IAHLT). Esto simplifica enormemente la construccion de pipelines de analisis linguistico, ya que evita encadenar herramientas separadas para morfologia, sintaxis y NER. Cuenta con 16.129 descargas y una demo publica con visualizacion instantanea del arbol sintactico.

Es un modelo de extraccion de caracteristicas (pipeline `feature-extraction`), no un modelo generativo ni conversacional, y esta orientado exclusivamente al hebreo moderno. Se distribuye bajo licencia CC-BY-4.0 y requiere cargar codigo personalizado (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT con cabezas multiples de tareas (codigo personalizado) |
| Parametros totales | 186.012.926 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | hebreo moderno (codigo `he`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors y pytorch (bin); repositorio de 3,0 GB |
| Pipeline | feature-extraction |
| Tareas integradas | segmentacion de prefijos, desambiguacion morfologica, lematizacion, analisis de dependencias, NER |
| Formatos de salida | JSON, UD (Hebrew UD Treebank), UD estilo IAHLT |
| Fecha de creacion | 2024-01-10 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo BERT (etiquetado como `bert` en HuggingFace) con un conjunto de cabezas de prediccion acopladas que resuelven simultaneamente cinco tareas linguisticas. El modelo se carga mediante `AutoModel` con `trust_remote_code=True` y expone un metodo `predict()` que devuelve la anotacion por token. Los parametros totales (186 M) superan ligeramente a los de un BERT-base estandar, lo que es coherente con la presencia de multiples cabezas de tarea sobre el tronco comun. El modelo card no detalla la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de ajuste como RLHF o DPO; esa informacion no esta disponible en los datos proporcionados.

Una innovacion practica destacable es la posibilidad de desactivar cabezas concretas en el momento de la carga para ahorrar computo cuando solo se necesita una tarea: los modificadores `do_lex`, `do_syntax`, `do_ner`, `do_prefix` y `do_morph`. Ademas, el modelo admite tres estilos de salida que controlan el nivel de detalle y la convencion de anotacion: JSON estructurado, CoNLL-U segun el Hebrew UD Treebank y CoNLL-U con las convenciones de IAHLT (diferencias de granularidad en relaciones de dependencia, separacion de sufijos y articulos definidos implicitos). El comportamiento de etiquetado en si no cambia entre los dos ultimos formatos.

## Capacidades

- Analisis morfologico completo: desambiguacion de categoria gramatical (POS), rasgos de genero, numero, persona y tiempo.
- Segmentacion de prefijos: separa prefijos como preposiciones o articulos definidos del lexema principal.
- Lematizacion: devuelve la forma lematizada de cada token, incluyendo tratamiento de sufijos pronominales.
- Analisis sintactico de dependencias: genera el arbol de dependencias completo con indice de cabeza, funcion de dependencia y palabra cabeza (por ejemplo `root`, `nsubj`, `obj`, `obl`, `case`, `flat`, `compound`).
- Reconocimiento de entidades nombradas (NER) a nivel de oracion.
- Salida multi-formato: JSON por token y CoNLL-U en estilo UD o estilo IAHLT.
- Ejecucion selectiva de tareas mediante los indicadores `do_lex`, `do_syntax`, `do_ner`, `do_prefix` y `do_morph`.
- No dispone de tool calling, function calling, modo de razonamiento explicito, capacidades de agente, vision ni audio: es un modelo de extraccion de caracteristicas, no generativo.
- Cobertura multilingue limitada al hebreo moderno; no se documenta soporte para otros idiomas.

## Casos de uso

- Analisis morfosintactico de corpus en hebreo: procesar grandes volumenes de texto hebreo (prensa, literatura, transcripciones) para obtener anotacion morfologica, lemas y arboles de dependencias en una sola pasada, lo que simplifica la creacion de corpus anotados.
- Anotacion de treebanks con convenciones UD o IAHLT: el modelo produce directamente CoNLL-U en el estilo del Hebrew UD Treebank o de IAHLT, por lo que sirve como preanotador en proyectos de anotacion manual, reduciendo el trabajo humano a revision y correccion.
- Extraccion de entidades para inteligencia de negocio: aplicar la cabeza de NER sobre noticias y documentos hebreos para detectar personas, organizaciones y lugares, alimentando indices de busqueda o sistemas de monitorizacion de medios.
- Enriquecimiento de motores de busqueda y recuperacion: la lematizacion y la desambiguacion morfologica permiten normalizar consultas y documentos hebreos, mejorando la coincidencia entre terminos con prefijos o sufijos flexivos.
- Preprocesamiento para traduccion automatica o sintesis de voz: la segmentacion de prefijos y el analisis de dependencias proporcionan estructuras linguisticas que pueden alimentar sistemas de MT o de TTS que necesiten informacion morfosintactica explicita en hebreo.
- Analisis de opiniones y clasificacion de intenciones en hebreo: el modelo es una capa de representacion (`feature-extraction`) que puede alimentar clasificadores posteriores entrenados sobre sus embeddings contextuales para tareas de sentimiento o enrutado en atencion al cliente.
- Herramientas educativas de ensenanza del hebreo: la salida JSON con rasgos gramaticales y funciones sintacticas por token permite construir interfaces que expliquen la estructura de una oracion a estudiantes.
- Enriquecimiento de pipelines de PLN existentes: al poder desactivar cabezas concretas, se puede integrar unicamente la tarea necesaria (por ejemplo solo NER o solo lematizacion) dentro de un sistema ya existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del numero de parametros, sin incluir el overhead del runtime):
  - FP32: aproximadamente 0,75 GB de pesos.
  - FP16/BF16: aproximadamente 0,37 GB de pesos.
  - INT8: aproximadamente 0,19 GB de pesos.
- En la practica, el repositorio ocupa 3,0 GB, ya que incluye varios ficheros de pesos y cabezas, por lo que conviene reservar espacio en disco acorde.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP16, incluidas RTX 3060, RTX 4060, RTX 4090, A100, H100 o T4. El modelo es perfectamente ejecutable en CPU para cargas por lotes moderadas.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria compartida suficiente.
- Opciones de despliegue: la libreria `transformers` es la via documentada, con `AutoTokenizer` y `AutoModel` y `trust_remote_code=True`. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI; la etiqueta `text-embeddings-inference` aparece en los tags de HuggingFace, pero la model card no ofrece instrucciones al respecto. El parametro `inference: false` de la model card indica que la inferencia alojada de HuggingFace esta deshabilitada, probablemente por el codigo personalizado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dicta-il/dictabert-joint | 186.012.926 | no disponible | Segmentacion de prefijos, morfologia, lematizacion, dependencias y NER de forma conjunta | cc-by-4.0 | HuggingFace, demo publica |
| dicta-il/dictabert-tiny-joint | no disponible | no disponible | Equivalente a dictabert-joint, version mas rapida | no disponible en la informacion proporcionada | HuggingFace |
| Modelos bert-base del resto de la coleccion DictaBERT | no disponible | no disponible | Tareas individuales (no conjuntas) | no disponible en la informacion proporcionada | HuggingFace (coleccion dicta-il/dictabert) |

No se dispone de datos de otros modelos comparables de analisis morfosintactico del hebreo en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Cobertura linguistica restringida al hebreo moderno; el modelo no procesa otros idiomas.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones, por lo que no debe evaluarse con criterios de chat o de generacion.
- Riesgo de alucinacion: en un modelo de etiquetado, el equivalente seria la asignacion de etiquetas morfologicas o sintacticas incorrectas en oraciones ambiguas, con errores que pueden propagarse a las tareas posteriores del pipeline.
- Sesgos conocidos: no se documentan en la informacion disponible; al tratarse de un modelo entrenado sobre corpus en hebreo, es previsible que herede los sesgos de dominio y registro de dichos corpus (por ejemplo, predominio de registro periodistico o formal), aunque no hay datos publicados que lo confirmen.
- Limitaciones de contexto: la longitud maxima de secuencia no se especifica en la model card, un dato critico para decidir si el modelo admite documentos largos o solo oraciones.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo incluido en el repositorio del modelo; conviene auditar dicho codigo antes de usarlo en produccion.
- La model card declara `inference: false`, por lo que la inferencia alojada de HuggingFace no esta disponible y el despliegue debe ser propio.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir la autoria del modelo de forma adecuada y a indicar si se han realizado modificaciones.
- El propio autor recomienda `dictabert-tiny-joint` cuando se necesita mayor velocidad, lo que sugiere que este modelo no esta optimizado para latencia baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dicta-il/dictabert-joint
- Articulo (arXiv): https://arxiv.org/abs/2403.06970
- Demo interactiva con visualizacion del arbol sintactico: https://huggingface.co/spaces/dicta-il/joint-demo
- Modelo equivalente mas rapido (bert-tiny): https://huggingface.co/dicta-il/dictabert-tiny-joint
- Coleccion completa DictaBERT: https://huggingface.co/collections/dicta-il/dictabert-6588e7cc08f83845fc42a18b
