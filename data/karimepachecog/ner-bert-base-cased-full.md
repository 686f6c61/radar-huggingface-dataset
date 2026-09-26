# karimepachecog/ner-bert-base-cased-full

## Resumen

`karimepachecog/ner-bert-base-cased-full` es un modelo de reconocimiento de entidades nombradas (NER) en ingles obtenido mediante ajuste fino completo (*full fine-tuning*) de `google-bert/bert-base-cased` sobre el corpus CoNLL-2003. Lo publica el usuario karimepachecog en HuggingFace y esta pensado exclusivamente para la tarea de *token classification* con las cuatro categorias del estandar CoNLL: persona (PER), organizacion (ORG), localizacion (LOC) y miscelanea (MISC).

Tecnicamente es un transformer encoder de arquitectura BERT base, con 107.726.601 parametros en safetensors y un tamano de repositorio de 0,4 GB. No incorpora mecanismos de mezcla de expertos ni decodificacion autoregresiva: se trata de un encoder bidireccional que asigna una etiqueta BIO a cada token de entrada. La longitud de contexto del checkpoint base es de 512 tokens, aunque el entrenamiento se realizo con `max_length=128`.

Su relevancia practica es acotada pero clara: sirve como componente de extraccion de entidades en canalizaciones de NLP en ingles, con una F1 de entidad de 0,9114 en el conjunto de test de CoNLL-2003. El modelo no ha recibido descargas ni *likes* en el momento de redactar esta ficha, por lo que no cuenta con validacion independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base: 12 capas, 768 de dimension oculta, 12 cabezas de atencion) |
| Parametros totales | 107.726.601 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens en el checkpoint base; entrenamiento realizado con `max_length=128` |
| Tipos de cuantizacion | no publicados por el autor; el repositorio solo distribuye safetensors en precision completa. Es convertible a int8/fp16 con herramientas externas (PyTorch, Optimum/ONNX Runtime) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-cased |
| Tarea (*pipeline*) | token-classification |
| Etiquetas | O, B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC, B-MISC, I-MISC |
| Dataset de entrenamiento | lhoestq/conll2003 (CoNLL-2003) |
| Tamano del repositorio | 0,4 GB |
| Metricas declaradas | f1, precision, recall (seqeval) |

## Arquitectura y entrenamiento

El modelo es un BERT base *cased* completo (encoder de 12 capas) al que se le anade una cabeza de clasificacion de tokens y se ajusta de extremo a extremo, sin congelar el cuerpo. No hay innovaciones arquitectonicas: se trata del enfoque estandar de *full fine-tuning* frente al ajuste basado en caracteristicas (*feature-based*, con el encoder congelado y solo una cabeza lineal entrenable), que el propio autor entreno como referencia y descarto.

Los hiperparametros declarados son: ratio de aprendizaje de 2e-5 para el encoder y de 1e-3 para la cabeza de clasificacion, 3 epocas, tamano de lote 16, longitud maxima 128 y semilla 42. La etiqueta de la palabra se coloca unicamente en el primer subtoken; los subtokens de continuacion, `[CLS]`, `[SEP]` y el relleno se marcan con `-100` y se ignoran en la perdida. La seleccion del checkpoint se hizo por F1 de entidad en validacion (0,926 / 0,944 / 0,946 por epoca), y se guardo el de la tercera epoca, que coincidio con el mejor. La evaluacion en test se realizo una sola vez.

## Capacidades

- Reconocimiento de entidades nombradas en ingles con esquema BIO y cuatro tipos: PER, ORG, LOC y MISC.
- Clasificacion a nivel de token sobre frases completas, con contexto bidireccional (cada etiqueta se decide viendo la frase entera).
- Ejecucion en lote sobre grandes volumenes de texto mediante `AutoModelForTokenClassification` y `AutoTokenizer`.
- Integracion directa con la libreria `transformers` y con `seqeval` para evaluacion a nivel de entidad.
- No soporta *tool calling* ni *function calling*: no es un modelo generativo ni instruccional.
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento (*thinking*).
- No dispone de capacidades multilingues: esta entrenado y evaluado unicamente en ingles.
- No tiene vision, audio ni modalidades adicionales.
- No permite etiquetado de tipos de entidad fuera de los cuatro de CoNLL: cualquier otra categoria se marca como `O`.

## Casos de uso

- Extraccion de entidades en noticias y contenido editorial: el modelo identifica personas, organizaciones y localizaciones en textos periodisticos en ingles, que es exactamente el dominio de CoNLL-2003 (newswire), por lo que el ajuste de dominio es maximo en este escenario.
- Preprocesado de canalizaciones RAG: extraer entidades de los documentos antes de indexarlos permite construir filtros de metadatos (por ejemplo, restringir la busqueda a documentos que mencionen una organizacion concreta) y mejorar la precision del recuperador.
- Construccion de grafos de conocimiento: las menciones de ORG, LOC y PER extraidas de un corpus se pueden normalizar y enlazar para generar relaciones empresa-sede, persona-cargo u organizacion-pais.
- Monitorizacion de menciones de marca: procesar flujos de noticias en ingles y contar menciones de una organizacion (B-ORG/I-ORG) para alimentar cuadros de mando de comunicacion o reputacion.
- Preetiquetado para anotacion humana: dado su nivel de F1 (0,9114), es util como anotador automatico de primera pasada en proyectos de etiquetado, reduciendo el trabajo del revisor humano a corregir en lugar de anotar desde cero.
- Analisis de documentos corporativos en ingles: informes, comunicados y transcripciones de habla inglesa pueden pasarse por el modelo para localizar actores y ubicaciones relevantes antes de un analisis posterior.
- Deteccion de nombres de persona como apoyo a tareas de anonimizacion: identificar etiquetas B-PER/I-PER sirve como paso previo a la redaccion de PII en textos ingleses, siempre con revision humana dada la limitacion a cuatro tipos de entidad.
- Ingenieria de caracteristicas para modelos posteriores: las etiquetas de entidad generadas se pueden incorporar como *features* en clasificadores de documentos, sistemas de recomendacion de contenido o analitica de opinion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test de CoNLL-2003, tras una unica evaluacion posterior al entrenamiento:

| Metrica | Valor |
|---|---|
| Precision (entidad) | 0,9047 |
| Recall (entidad) | 0,9181 |
| F1 (entidad) | 0,9114 |
| Perdida de entrenamiento | 0,08 |
| Perdida de test | 0,12 |

Evolucion de la F1 de entidad en validacion por epoca:

| Epoca | F1 de validacion |
|---|---|
| 1 | 0,926 |
| 2 | 0,944 |
| 3 (checkpoint guardado) | 0,946 |

Comparacion interna declarada por el autor frente a la variante descartada:

| Variante | F1 en test |
|---|---|
| Full fine-tuning (este modelo) | 0,9114 |
| Feature-based (BERT congelado + cabeza lineal) | 0,7973 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no son aplicables a un modelo discriminativo de clasificacion de tokens.

## Requisitos de hardware

- Huella de pesos (estimacion a partir de 107,7 M de parametros): aproximadamente 431 MB en fp32, unos 215 MB en fp16 y unos 108 MB en int8.
- VRAM estimada para inferencia (estimacion, no publicada por el autor): por debajo de 1,5 GB en fp32 con `max_length` de 128 y lotes pequenos, y por debajo de 1 GB en fp16. Con `max_length=512` la memoria de activaciones crece de forma aproximadamente cuadratica respecto a la longitud, pero sigue siendo manejable.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM (GTX 1650, RTX 3060, RTX 4060, RTX 4090, etc.). Tambien se puede ejecutar en CPU con latencias mayores pero funcionales.
- GPU recomendadas para produccion: NVIDIA T4, L4, A10 o A100/H100 si se necesita alto *throughput* en lote; para inferencia puntual basta una GPU consumer.
- Opciones de despliegue: `transformers` (`AutoModelForTokenClassification`), exportacion a ONNX con Optimum y ejecucion con ONNX Runtime, TorchScript, TorchServe, NVIDIA Triton o un servicio FastAPI propio. No se ha publicado una conversion a GGUF ni una receta para Ollama o llama.cpp.
- Latencia y *throughput*: no disponibles. No hay mediciones publicadas por el autor; cualquier cifra dependeria del hardware, del tamano de lote y de la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 en CoNLL-2003 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karimepachecog/ner-bert-base-cased-full | 107.726.601 | 512 (entrenado a 128) | 0,9114 | apache-2.0 | HuggingFace |
| dslim/bert-base-NER | arquitectura BERT base (aprox. 110 M) | 512 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Jean-Baptiste/roberta-large-ner-english | arquitectura RoBERTa large (mayor que BERT base) | 512 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| spaCy en_core_web_trf (canalizacion NER en ingles) | canalizacion completa, no comparable directamente | limitado por el componente transformer | no disponible en la informacion proporcionada | licencia propia de spaCy | paquete spaCy |

Nota: las filas de alternativas solo recogen informacion general de arquitectura; no se han verificado sus metricas ni licencias en la informacion disponible, por lo que se marcan como no disponibles en lugar de estimarlas.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con texto periodistico en ingles (CoNLL-2003). El rendimiento caera fuera de ese registro (texto cientifico, jerga tecnica, redes sociales, dominios legales o medicos).
- Idioma unico: no es un sistema NER multilingue ni adaptado a otros dominios, tal y como advierte el propio autor.
- Ejecucion unica: solo se realizo un entrenamiento con una semilla. Segun el autor, diferencias de 1 a 3 puntos de F1 pueden atribuirse unicamente a la semilla aleatoria, por lo que la cifra de 0,9114 no debe tratarse como una medicion robusta.
- Esquema de etiquetado limitado: solo cuatro tipos de entidad. Cualquier categoria distinta se etiqueta como `O`, lo que produce falsos negativos sistematicos en taxonomias mas ricas (productos, eventos, fechas, cantidades monetarias, etc.).
- Etiqueta en el primer subtoken: los subtokens de continuacion no llevan etiqueta, de modo que un consumidor del modelo debe reconstruir las entidades a nivel de palabra; interpretar cada subtoken como una entidad independiente genera resultados incorrectos.
- Longitud de entrenamiento corta: aunque la arquitectura admite 512 tokens, el ajuste se hizo con `max_length=128`. Secuencias mucho mas largas pueden degradar la calidad de las etiquetas por desajuste entre entrenamiento e inferencia.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos: el modelo puede etiquetar como entidad términos ambiguos en contextos no vistos.
- Sesgos: no se documenta ningun analisis de sesgo. Al provenir de noticias en ingles de los anos noventa, es previsible que refleje los sesgos de cobertura y de representacion de ese corpus (por ejemplo, sobrerrepresentacion de determinadas organizaciones y paises).
- Licencia: apache-2.0, permisiva para uso comercial, siempre que se conserve el aviso de licencia. Debe verificarse tambien la licencia del modelo base y el uso permitido del dataset CoNLL-2003 para cualquier redistribucion de datos derivados.
- Madurez: 0 descargas y 0 *likes* en el momento de la consulta. No hay informes de terceros, pruebas de regresion ni mantenimiento demostrado; para produccion conviene validar en un conjunto propio antes de adoptarlo.
- No apto para generacion de texto, dialogo, codigo ni tareas de razonamiento: es un clasificador discriminativo, no un modelo de lenguaje generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/karimepachecog/ner-bert-base-cased-full
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Dataset CoNLL-2003 en HuggingFace: https://huggingface.co/datasets/lhoestq/conll2003
- Paper de BERT (Devlin et al., 2019): https://arxiv.org/abs/1810.04805
- Referencia del corpus: Erik F. Tjong Kim Sang y Fien De Meulder, "Introduction to the CoNLL-2003 shared task: Language-independent named entity recognition", 2003 (sin URL facilitada en la informacion disponible).
