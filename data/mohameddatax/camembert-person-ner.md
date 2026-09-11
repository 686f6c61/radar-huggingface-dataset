# MohamedDataX/camembert-person-ner

## Resumen

`MohamedDataX/camembert-person-ner` es un modelo de clasificación de tokens (token classification) publicado en HuggingFace Hub por el usuario MohamedDataX. Por su identificador y sus etiquetas, se trata de un ajuste fino (fine-tuning) de CamemBERT orientado al reconocimiento de entidades nombradas (NER), presumiblemente limitado a la clase "persona". El repositorio contiene pesos en formato safetensors con 110.032.898 parámetros, un tamaño que coincide exactamente con el de la arquitectura CamemBERT-base (RoBERTa-base adaptada al francés), lo que confirma que no se ha modificado la topología del modelo base, solo su cabeza de clasificación.

El interés de este tipo de modelos es práctico: la detección automática de nombres de persona en texto en francés es un componente habitual en pipelines de anonimización (cumplimiento del RGPD), enriquecimiento de CRM, procesamiento de currículos y revisión documental. Al ser un modelo de 110 millones de parámetros, puede ejecutarse en CPU o en cualquier GPU de consumo con un coste de memoria muy bajo, lo que lo hace apto para despliegues masivos por lote donde no es viable pagar por un modelo generativo grande.

Ahora bien, la ficha publicada por el autor es la plantilla automática de HuggingFace sin rellenar: no documenta datos de entrenamiento, hiperparámetros, conjunto de evaluación, licencia, idiomas ni métricas. El modelo registra 0 descargas y 1 like en el momento de la consulta, y la búsqueda web no ha devuelto ninguna referencia técnica, paper ni entrada de blog asociada. Por tanto, esta ficha describe lo que puede verificarse objetivamente (arquitectura derivada, tamaño, formato, tarea declarada) y marca explícitamente como "no disponible" todo lo que el autor no ha especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT/RoBERTa (familia CamemBERT), con cabeza de clasificación de tokens. No confirmado explícitamente por el autor; derivado del identificador y de la etiqueta `camembert` |
| Parametros totales | 110.032.898 (dato real de los safetensors del repositorio) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la ficha. La arquitectura base CamemBERT admite 512 tokens (514 posiciones con los tokens especiales); no confirmado para este ajuste |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas. Al ser un modelo de 110 M de parametros, la cuantizacion a int8 o fp16 es viable con PyTorch u Optimum |
| Idiomas soportados | No disponible. La arquitectura base esta entrenada sobre corpus en frances, por lo que cabe esperar que el ajuste sea monolingue en frances, sin confirmacion del autor |
| Licencia | No disponible. La ficha no declara licencia; el modelo base CamemBERT se distribuye bajo licencia MIT, pero eso no implica que este ajuste herede los mismos terminos |
| Formato de pesos | safetensors (etiqueta `safetensors` del repositorio). Tamano del repo: 0,4 GB |
| Pipeline en HuggingFace | token-classification |
| Biblioteca | transformers |
| Tarea declarada | Reconocimiento de entidades de tipo persona (`person-ner` en el identificador) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el procedimiento de entrenamiento. La model card es la plantilla por defecto generada automaticamente por HuggingFace, con todos los campos marcados como "[More Information Needed]": no se especifican datos de entrenamiento, numero de tokens, composicion del dataset, regimen de precision (fp32, fp16, bf16), hiperparametros, epocas ni infraestructura de computo.

Lo unico inferible con rigor es la arquitectura, a partir del identificador y de las etiquetas del repositorio: CamemBERT es un transformer encoder con arquitectura identica a RoBERTa-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, 3072 dimensiones en la capa feed-forward y vocabulario de 32.005 piezas de SentencePiece), preentrenado sobre el corpus frances OSCAR. El modelo original fue descrito en el paper de Martin et al. (2019, arXiv:1911.03894). Sobre esa base, el autor ha anadido una cabeza de clasificacion token a token y la ha ajustado para etiquetado BIO de entidades de tipo persona.

Conviene senalar una particularidad de la ficha: la etiqueta `arxiv:1910.09700` que aparece en los metadatos no corresponde al paper de CamemBERT, sino a Lacoste et al. (2019), el articulo sobre estimacion de emisiones de carbono que la propia plantilla de HuggingFace enlaza en su seccion "Environmental Impact". Es, por tanto, un artefacto de la plantilla y no una referencia al trabajo de entrenamiento del modelo.

## Capacidades

- Reconocimiento de entidades nombradas de tipo persona en texto: la tarea declarada por el pipeline (`token-classification`) y el identificador del modelo apuntan a la deteccion y delimitacion de nombres propios de persona.
- Clasificacion a nivel de token con esquema de etiquetado tipo BIO (B-PER / I-PER / O), la convencion estandar en modelos CamemBERT ajustados para NER.
- Procesamiento por lotes: al ser un encoder de 110 M de parametros, permite clasificar grandes volumenes de documentos con un coste de inferencia bajo.
- Integracion nativa en el ecosistema transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Compatibilidad con endpoints de HuggingFace (etiqueta `endpoints_compatible`), lo que permite desplegarlo como API gestionada sin infraestructura propia.

No hay evidencia en la informacion disponible de que el modelo soporte tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio, generacion de texto libre ni modo "thinking". Es un modelo discriminativo de clasificacion, no generativo.

## Casos de uso

- Anonimizacion y seudonimizacion de documentos para cumplimiento del RGPD: el modelo detecta nombres de persona en textos en frances para sustituirlos por marcadores antes de almacenar o compartir el documento. Es adecuado porque la tarea es exactamente la declarada y el coste por documento es minimo.
- Triaje de curriculos y solicitudes de empleo: extraer el nombre del candidato de CV en frances para indexarlos en un ATS, alimentando despues un pipeline de extraccion de entidades mas amplio.
- Monitorizacion de medios y analisis de reputacion: identificar menciones de personas concretas en articulos de prensa francesa, con agregacion posterior por frecuencia y medio.
- Enriquecimiento de CRM: detectar nombres de contacto en correos, notas de reunion y transcripciones en frances para vincular automaticamente la informacion a la ficha del cliente.
- Limpieza y curacion de corpus de entrenamiento: marcar nombres propios en datasets en frances antes de usarlos para entrenar otros modelos, reduciendo la memorizacion de datos personales (riesgo relevante de cara al RGPD y a la normativa de IA).
- Preprocesado para entity linking y grafos de conocimiento: generar candidatos de mencion de persona que despues se resuelven contra una base de conocimiento como Wikidata.
- Revision documental en el ambito juridico: localizar nombres de las partes en contratos y expedientes en frances para clasificarlos o extraerlos a un sistema de gestion documental.
- Indexacion y busqueda empresarial: enriquecer indices Elasticsearch u OpenSearch con el campo "persona mencionada" para permitir busquedas facetadas sobre documentacion interna.

En todos los casos, la adecuacion es plausible por tamano, tarea y coste, pero no esta validada por ninguna evaluacion publicada del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada y la busqueda web no ha devuelto ninguna referencia al modelo. La siguiente tabla recoge las metricas que serian relevantes para un modelo de esta categoria, todas ellas sin dato:

| Metrica | Conjunto de evaluacion | Resultado |
|---|---|---|
| F1 (entidades de persona) | no disponible | no disponible |
| Precision | no disponible | no disponible |
| Recall | no disponible | no disponible |
| F1 en CoNLL-2003 (frances) | no disponible | no disponible |
| F1 en WikiNER frances | no disponible | no disponible |
| F1 en FTB (French Treebank) | no disponible | no disponible |

Tampoco hay datos de latencia, throughput ni consumo de memoria medidos por el autor.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,44 GB en fp32, 0,22 GB en fp16 y 0,11 GB en int8. A eso hay que sumar el estado de activaciones y el lote, que en la practica elevan el consumo total a un entorno de 1-2 GB para lotes moderados.
- GPU: cualquier GPU con 4 GB o mas de memoria es suficiente, incluidas GTX 1650, RTX 3050, RTX 4090, T4, L4, A10, A100 y H100. No requiere aceleradores de gama alta; sobredimensionar la GPU solo aporta throughput por lotes.
- CPU: es perfectamente ejecutable en CPU. Un encoder de 110 M de parametros con contexto de 512 tokens se procesa sin problema en un nucleo moderno, lo que lo hace apto para despliegues sin GPU y para entornos de borde.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer de los ultimos ocho anos. Tambien cabe en dispositivos con poca memoria si se cuantiza a int8.
- Opciones de despliegue: transformers con PyTorch directamente; Text Generation Inference no aplica (no es un modelo generativo); vLLM no es la via natural para un encoder de clasificacion; las alternativas realistas son TorchServe, FastAPI con transformers, ONNX Runtime (exportando con Optimum), HuggingFace Inference Endpoints y, si se necesita, conversion a TensorRT. Ollama y llama.cpp estan orientados a modelos generativos en GGUF y no son el cauce habitual para este tipo de checkpoint, aunque existan conversiones experimentales de la familia BERT.
- Latencia y throughput: no hay mediciones publicadas para este checkpoint. Cualquier cifra concreta seria una estimacion no verificada.

## Comparativa con modelos similares

La busqueda no ha proporcionado ninguna evaluacion comparativa, y este modelo carece de metricas publicadas, por lo que no es posible establecer una comparacion de rendimiento. La tabla siguiente compara unicamente caracteristicas verificables de arquitectura y distribucion, marcando como "no disponible" todo lo que no puede confirmarse. Los datos de los modelos alternativos corresponden a sus arquitecturas base conocidas y no se han verificado en esta busqueda.

| Modelo | Arquitectura base | Parametros | Contexto | Licencia | Metricas publicadas |
|---|---|---|---|---|---|
| MohamedDataX/camembert-person-ner | CamemBERT (RoBERTa-base) | 110 M | no disponible (base: 512 tokens) | no disponible | no |
| Ajustes NER sobre CamemBERT-base (familia generica) | CamemBERT (RoBERTa-base) | ~110 M | 512 tokens | depende del autor | variable segun autor |
| Ajustes NER sobre BERT-base frances (por ejemplo, variantes sobre `dbmdz/bert-base-french-europeana-cased`) | BERT-base multilingue/cased | ~110 M | 512 tokens | depende del autor | variable segun autor |
| Modelos NER multilingues basados en XLM-R base | XLM-RoBERTa-base | ~278 M | 512 tokens | MIT (habitual) | variable segun autor |

En igualdad de arquitectura, la diferencia entre estos modelos reside casi por completo en el dataset de ajuste y en el esquema de etiquetas, aspectos que este repositorio no documenta. Un integrador deberia evaluar el modelo sobre su propio dominio antes de adoptarlo, especialmente si el texto objetivo no es frances estandar o incluye nombres no occidentales.

## Limitaciones y advertencias

- Model card vacia: el autor no ha documentado datos de entrenamiento, hiperparametros, metricas ni uso previsto. No es posible auditar el modelo ni reproducir su entrenamiento.
- Licencia no declarada: sin licencia explicita, el uso comercial queda en una zona juridica ambigua. La licencia MIT de CamemBERT no se hereda automaticamente por el mero hecho de derivar de el; hay que verificar los terminos con el autor antes de cualquier despliegue en produccion.
- Ausencia total de evaluacion: no hay F1, precision ni recall publicados. Cualquier afirmacion sobre su calidad es especulativa.
- Ambito restringido a la clase persona: por el identificador, el modelo parece detectar unicamente nombres de persona, no organizaciones, lugares, fechas ni cantidades. Un pipeline que necesite esas clases requiere otro modelo o un ajuste adicional.
- Riesgo de sesgo y de falsos positivos: los modelos NER sobre corpus web (OSCAR) tienden a sobrerrepresentar nombres de origen europeo y a fallar en nombres de otras regiones, ademas de confundir nombres propios con toponimos, apellidos usados como sustantivos comunes o marcas. Sin evaluacion desagregada no puede cuantificarse.
- Idioma: toda la evidencia apunta a un modelo solo para frances. Aplicarlo a castellano u otras lenguas dara resultados degradados, aunque el tokenizador SentencePiece pueda segmentar el texto.
- Limite de contexto: si se confirma la ventana de 512 tokens de CamemBERT, los documentos largos deben trocearse, lo que puede partir entidades a la mitad y degradar la deteccion en los bordes de cada fragmento.
- Riesgo de memorizacion: un ajuste fino sobre textos con nombres reales puede haber memorizado combinaciones nombre-apellido concretas. Para uso sobre datos personales, conviene tratarlo como tratamiento de datos de categoria sensible y aplicar las salvaguardas habituales.
- Reputacion y soporte: el repositorio tiene 0 descargas y 1 like, sin historial de mantenimiento. No hay garantia de que se corrijan errores ni de que el autor responda a incidencias.
- Metadata atipica: la fecha de creacion registrada en el Hub es 2026-09-11, posterior a la fecha de esta revision, lo que sugiere un artefacto de metadatos o una configuracion incorrecta de la zona horaria en el momento de la subida. No afecta al modelo, pero conviene tenerlo en cuenta al rastrear su procedencia.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/MohamedDataX/camembert-person-ner
- Paper de CamemBERT (arquitectura base, no citado en el repositorio pero relevante): https://arxiv.org/abs/1911.03894
- Referencia de la etiqueta `arxiv:1910.09700` incluida en los metadatos: Lacoste et al. (2019), "Quantifying the Carbon Emissions of Machine Learning": https://arxiv.org/abs/1910.09700. Nota: esta etiqueta proviene de la plantilla automatica de HuggingFace y no es el paper del modelo.
- Calculadora de impacto de machine learning enlazada en la plantilla: https://mlco2.github.io/impact

No se han encontrado en la busqueda web papers, blogs, repositorios ni demos asociados a este modelo. Los resultados devueltos por la busqueda corresponden a contenidos sin relacion con el modelo (cortinas roller), por lo que se han descartado.
