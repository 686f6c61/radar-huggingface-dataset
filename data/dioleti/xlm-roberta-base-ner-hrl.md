# Dioleti/xlm-roberta-base-ner-hrl

## Resumen

Dioleti/xlm-roberta-base-ner-hrl es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning del encoder multilingue XLM-RoBERTa base. El repositorio lo publica el usuario Dioleti y, por el nombre, la configuracion y la model card, se corresponde con una re-publicacion del conocido Davlan/xlm-roberta-base-ner-hrl. El modelo resuelve una tarea concreta de etiquetado a nivel de token: identificar personas (PER), organizaciones (ORG) y localizaciones (LOC) en texto.

Se trata de un transformer tipo encoder de aproximadamente 277,46 millones de parametros (safetensors), sin componente generativo ni decoder. Su valor principal es la cobertura multilingue: fue entrenado sobre corpus anotados de diez idiomas de altos recursos (arabe, aleman, ingles, espanol, frances, italiano, leton, neerlandes, portugues y chino), lo que permite desplegar un unico modelo de extraccion de entidades en pipelines multilingues en lugar de mantener diez modelos monolingues.

Es relevante ahora porque, en arquitecturas de recuperacion aumentada (RAG), normalizacion de datos y deteccion de informacion personal, los modelos NER ligeros y deterministas siguen siendo la pieza de preprocesado mas economica: caben en GPU de consumo, se ejecutan en CPU y no dependen de un LLM generativo. Sus limitaciones son claras: solo reconoce tres tipos de entidad, esta sesgado hacia texto periodistico y su ventana de contexto es la del encoder base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multilingue XLM-RoBERTa base, con cabeza de clasificacion de tokens (token classification) |
| Parametros totales | 277.460.491 (277,46 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite estandar del encoder XLM-RoBERTa base; no explicitado en la model card) |
| Tipos de cuantizacion | no disponible (no se listan variantes oficiales; al ser un encoder estandar admite cuantizacion dinamica en PyTorch y conversion a ONNX, pero no esta documentado por el autor) |
| Idiomas soportados | 10 idiomas de altos recursos: arabe (ar), aleman (de), ingles (en), espanol (es), frances (fr), italiano (it), leton (lv), neerlandes (nl), portugues (pt) y chino (zh) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors y PyTorch (tags: pytorch, safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un encoder XLM-RoBERTa base (transformer bidireccional preentrenado de forma multilingue) al que se le anade una cabeza lineal de clasificacion de tokens. El vocabulario y las representaciones compartidas entre idiomas proceden del preentrenamiento de XLM-RoBERTa; el fine-tuning solo ajusta el modelo para la tarea NER. El esquema de etiquetado es BIO con siete clases: O, B-PER, I-PER, B-ORG, I-ORG, B-LOC e I-LOC. La distincion entre comienzo y continuacion de entidad permite separar entidades consecutivas del mismo tipo.

El entrenamiento se realizo sobre una agregacion de diez corpus anotados, uno por idioma: ANERcorp (arabe), CoNLL-2003 (aleman e ingles), CoNLL-2002 (espanol y neerlandes), Europeana Newspapers (frances), Italian I-CAB (italiano), Latvian NER (leton), Paramopama + Second HAREM (portugues) y MSRA (chino). Segun la model card, el fine-tuning se llevo a cabo en una GPU NVIDIA V100 con los hiperparametros recomendados por HuggingFace. No se documenta el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni el uso de RLHF o DPO, algo coherente con que no es un modelo generativo.

## Capacidades

- Reconocimiento de entidades nombradas a nivel de token en tres categorias: persona (PER), organizacion (ORG) y localizacion (LOC).
- Etiquetado BIO con separacion explicita entre inicio y continuacion de entidad.
- Inferencia multilingue con un unico checkpoint para diez idiomas, sin necesidad de cambiar de modelo por idioma.
- Integracion directa con el pipeline `ner` de la libreria Transformers (`AutoTokenizer` + `AutoModelForTokenClassification`).
- Uso como componente de preprocesado en cadenas mas largas (extraccion de entidades, normalizacion, indexacion).
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni flujos de agentes multi-paso.
- No dispone de modo de razonamiento explicito (thinking mode) ni de salidas estructuradas mas alla del etiquetado de tokens.

## Casos de uso

- Extraccion de entidades en agregadores de noticias: el modelo clasifica personas, organizaciones y lugares en titulares y cuerpos de articulo, lo que permite etiquetar automaticamente piezas por entidades mencionadas y construir indices tematicos sin proceso manual.
- Deteccion de informacion personal (PII) parcial: al identificar nombres de persona y organizacion, sirve como primer filtro en tuberias de anonimizacion previas a almacenar o compartir texto, siempre combinado con otros detectores para cubrir categorias que el modelo no reconoce.
- Construccion de grafos de conocimiento: los pares entidad-texto permiten poblar nodos de tipo persona, organizacion y lugar y enlazarlos con relaciones extraidas por otros sistemas, aprovechando el etiquetado BIO para delimitar los limites de cada mencion.
- Enriquecimiento de CRM y bases de contactos: al procesar correos, notas o transcripciones en varios idiomas, el modelo extrae empresas y personas mencionadas para completar campos vacios o sugerir vinculaciones.
- Preprocesado para RAG: antes de generar embeddings, el modelo marca entidades en los fragmentos de documento, de modo que el recuperador puede priorizar fragmentos que contienen la entidad consultada en lugar de depender solo de similitud vectorial.
- Analisis documental multilingue en entornos legales o financieros: un unico modelo cubre documentos en espanol, ingles, frances, aleman, portugues e italiano, lo que reduce el coste de mantenimiento frente a diez modelos monolingues.
- Moderacion y monitorizacion de contenido: la deteccion de organizaciones y personas mencionadas permite agrupar o marcar volumenes grandes de texto por entidad, util para paneles de seguimiento de menciones.
- Etiquetado asistido en anotacion: el modelo puede pre-anotar corpus para que un anotador humano solo revise y corrija, acelerando la creacion de datasets en cualquiera de los diez idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye metricas de F1, precision o recall por idioma, ni comparaciones con otros sistemas NER. El unico dato de rendimiento declarado es el entorno de entrenamiento (NVIDIA V100 con hiperparametros recomendados por HuggingFace).

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 1,11 GB en FP32, 0,55 GB en FP16/BF16 y 0,28 GB en INT8.
- VRAM estimada con activaciones y lote pequeno: del orden de 1,5 a 2,5 GB en FP32, y por debajo de 1,5 GB en FP16.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU para lotes pequenos.
- GPU de centro de datos (A100, H100) solo tienen sentido para procesar volumenes muy elevados en paralelo; el modelo no las necesita.
- Ejecucion en CPU viable para inferencia por lotes moderados, dado el tamano reducido del encoder.
- Opciones de despliegue: HuggingFace Transformers (pipeline `ner`), ONNX Runtime, TorchScript, y servidores de inferencia genericos para modelos encoder como TorchServe o FastAPI con Transformers. vLLM y llama.cpp no aplican, ya que estan orientados a modelos generativos y no a clasificacion de tokens.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipos de entidad | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dioleti/xlm-roberta-base-ner-hrl (este modelo) | 277,46 M | 512 tokens (encoder base) | PER, ORG, LOC | 10 | AFL-3.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Davlan/xlm-roberta-base-ner-hrl (modelo original) | no disponible en la informacion proporcionada | no disponible | PER, ORG, LOC | 10 | no disponible en la informacion proporcionada | HuggingFace |
| FacebookAI/xlm-roberta-base (backbone sin fine-tuning) | no disponible en la informacion proporcionada | no disponible | no aplica (no es NER) | mas de 100 | no disponible en la informacion proporcionada | HuggingFace |
| Modelos NER monolingues tipo BERT-base (por ejemplo, variantes entrenadas sobre CoNLL) | del orden de 110 M, segun variante | no disponible | PER, ORG, LOC, MISC en algunas variantes | 1 | variable por repositorio | HuggingFace |

Nota: el modelo analizado es, por nombre, configuracion y model card, una re-publicacion del checkpoint de Davlan; se recomienda verificar la equivalencia de pesos antes de usar esta copia en produccion, dado que el repositorio no incluye ninguna validacion propia ni metricas.

## Limitaciones y advertencias

- Solo reconoce tres tipos de entidad: cualquier mencion de fecha, cantidad, producto, evento o miscelanea queda sin etiquetar (la clase MISC de otros corpus no esta contemplada).
- Sesgo de dominio: el entrenamiento procede de articulos periodisticos anotados y de un intervalo temporal concreto, por lo que la generalizacion a textos clinicos, tecnicos, legales o de redes sociales puede degradarse.
- No es un modelo generativo, por lo que el riesgo de alucinacion de texto no aplica; el modo de fallo es el error de clasificacion (falsos positivos y entidades no detectadas), que puede propagarse a sistemas posteriores.
- Ventana de contexto de 512 tokens: los documentos largos deben segmentarse, lo que puede partir entidades que cruzan el limite de fragmento.
- Cobertura linguistica limitada a diez idiomas; no hay soporte declarado para catalan, gallego, euskera ni para idiomas de bajos recursos.
- No se publican metricas de evaluacion en el repositorio, por lo que no es posible cuantificar la calidad por idioma antes de desplegarlo.
- Licencia AFL-3.0: es una licencia permisiva que admite uso comercial, pero conviene revisar las obligaciones de atribucion y el aviso de patentes antes de integrarla en un producto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni issues; no hay garantia de soporte.
- Al ser una re-publicacion, no queda claro en la informacion disponible si se ha modificado el entrenamiento o los datos respecto al checkpoint original.
- Adecuado para preprocesado, no para tareas que requieran comprension profunda, generacion o razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dioleti/xlm-roberta-base-ner-hrl
- Modelo original del que deriva: https://huggingface.co/Davlan/xlm-roberta-base-ner-hrl
- Backbone XLM-RoBERTa base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset ANERcorp (arabe): https://camel.abudhabi.nyu.edu/anercorp/
- Dataset CoNLL-2003 (aleman e ingles): https://www.clips.uantwerpen.be/conll2003/ner/
- Dataset CoNLL-2002 (espanol y neerlandes): https://www.clips.uantwerpen.be/conll2002/ner/
- Corpus Europeana Newspapers (frances): https://github.com/EuropeanaNewspapers/ner-corpora/tree/master/enp_FR.bnf.bio
- Dataset Italian I-CAB (italiano): https://ontotext.fbk.eu/icab.html
- Dataset Latvian NER (leton): https://github.com/LUMII-AILab/FullStack/tree/master/NamedEntities
- Dataset Paramopama + Second HAREM (portugues): https://github.com/davidsbatista/NER-datasets/tree/master/Portuguese
- Dataset MSRA (chino): https://huggingface.co/datasets/msra_ner

Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de Facebook en frances y no guardan relacion con el modelo; no se ha localizado informacion adicional relevante (papers, blogs o demos) a partir de esa busqueda.
