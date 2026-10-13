# KhanyiTapiwa00/afriberta-siswati

## Resumen

AfriBERTa-siSwati es un modelo de lenguaje de tipo encoder Transformer, desarrollado por AI Eswatini (autor de HuggingFace: KhanyiTapiwa00), que adapta el modelo AfriBERTa (Ogueji et al., 2021) al idioma siSwati del Reino de Eswatini. El modelo parte del checkpoint base castorini/afriberta_large y se somete a un preentrenamiento continuado mediante Masked Language Modelling (MLM) sobre el corpus paralelo SADILAR EN-SS v1.0.3, compuesto por 114.839 pares de frases ingles-siSwati.

Con 125.702.518 parametros, se trata de un modelo de tamano base (aproximadamente 126 millones de parametros) orientado exclusivamente a tareas de comprension y representacion del lenguaje, no a generacion autoregresiva. Su relevancia reside en cubrir una lengua de bajos recursos poco representada en los grandes corpus multilingues: el modelo reporta una perplejidad de 7,27 frente a 47,83 de mBERT y 35,59 del AfriBERTa sin ajuste, lo que supone una reduccion de perplejidad del 84,8 % respecto a la linea base de mBERT.

Es un modelo pensado como base para tareas posteriores (clasificacion, extraccion de entidades, embeddings, rellenado de mascaras) en siSwati y en contextos bilingues ingles-siSwati, no como un asistente conversacional ni como un generador de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa / RoBERTa (etiqueta HuggingFace: xlm-roberta); preentrenamiento con Masked Language Modelling |
| Parametros totales | 125.702.518 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos en safetensors) |
| Idiomas soportados | siSwati (objetivo); entrenamiento sobre corpus bilingue ingles-siSwati. El campo de idiomas en HuggingFace figura como no disponible |
| Licencia | no disponible (la licencia del corpus de entrenamiento SADILAR EN-SS es CC BY 4.0, pero la licencia del modelo no se especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer basado en la familia RoBERTa/XLM-RoBERTa, con 125.702.518 parametros, es decir, un tamano comparable a una configuracion base (no "large" en el sentido habitual de 300M+ a pesar del nombre del checkpoint base). Sobre el checkpoint castorini/afriberta_large se aplico un preentrenamiento continuado con objetivo MLM, es decir, enmascarado aleatorio de tokens y prediccion de los mismos, lo que ajusta la representacion del modelo a la morfologia y el vocabulario del siSwati.

Los datos de entrenamiento proceden del SADILAR EN-SS Bilingual Corpus v1.0.3: 114.839 pares de frases paralelas ingles-siSwati y 1.423.414 palabras en siSwati. La configuracion reportada es de 10 epocas, tamano de lote 32 y tasa de aprendizaje 2e-5, ejecutada en una GPU Kaggle Tesla T4 de 15,6 GB durante aproximadamente 5 horas. El autor indica que no se detecto sobreajuste (brecha maxima entrenamiento-validacion de 0,365). No se informa de tecnicas de RLHF, DPO ni de innovaciones de atencion adicionales; se trata de un ajuste clasico de preentrenamiento enmascarado.

## Capacidades

- Rellenado de mascaras (fill-mask): prediccion del token enmascarado en una frase en siSwati.
- Representaciones contextuales del lenguaje: generacion de embeddings de frases y tokens utiles para tareas posteriores.
- Base para ajuste fino supervisado en tareas de comprension del lenguaje (clasificacion de texto, analisis de sentimiento, etiquetado de secuencias, NER, respuesta a preguntas extractiva) en siSwati.
- Modelado bilingue ingles-siSwati, al haberse entrenado sobre un corpus paralelo.
- No dispone de generacion de texto autoregresiva, ya que es un encoder MLM.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multimodales (vision, audio) ni modo de razonamiento explicito.

## Casos de uso

- Etiquetado morfologico y analisis linguistico del siSwati: al estar preentrenado especificamente sobre esta lengua, sirve como base para anotar categorias gramaticales y morfemas, una tarea relevante en una lengua con morfologia aglutinante y pocos recursos.
- Clasificacion de textos en siSwati: por ejemplo, moderacion de comentarios, categorizacion de noticias o filtrado de contenido, partiendo de un ajuste fino con un pequeno conjunto etiquetado.
- Reconocimiento de entidades nombradas (NER) en documentos bilingues ingles-siSwati: util para extraer nombres de personas, lugares y organizaciones de textos administrativos o periodisticos de Eswatini.
- Analisis de sentimiento en redes sociales y prensa local: el modelo proporciona representaciones contextuales que pueden ajustarse para clasificar opinion en siSwati.
- Traduccion asistida y alineacion de corpus: al haberse entrenado sobre pares paralelos, sus embeddings pueden emplearse para similitud semantica y recuperacion entre frases en ingles y siSwati.
- Busqueda semantica y recuperacion de informacion en siSwati: generando embeddings de documentos y consultas para un motor de busqueda o un sistema RAG orientado a contenidos en esta lengua.
- Investigacion linguistica y construccion de recursos: como modelo de referencia de perplejidad baja para estudiar el siSwati y como punto de partida para otros desarrollos de PLN en lenguas africanas de bajos recursos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de perplejidad sobre el corpus de validacion empleado por el autor:

| Modelo | Perplejidad |
|---|---|
| mBERT (linea base) | 47,83 |
| AfriBERTa (sin ajuste) | 35,59 |
| AfriBERTa-siSwati (este modelo) | 7,27 |

El autor reporta ademas una reduccion de perplejidad del 84,8 % frente a mBERT y una reduccion de perdida del 42,9 %. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, XNLI u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision fp32: en torno a 0,5-0,6 GB de pesos (125,7 M de parametros a 4 bytes), mas el consumo de activaciones y tokenizador; con lotes pequenos cabe comodamente en menos de 2 GB.
- En fp16/bf16 el modelo ocupa aproximadamente 0,25 GB de pesos, por lo que la inferencia es viable incluso en GPU integradas o CPU.
- GPU recomendadas: practicamente cualquier GPU moderna es suficiente, incluidas RTX 3060, RTX 4090, T4, A100 o H100; el modelo no requiere aceleradores de gama alta.
- Cabe sin problemas en GPUs de consumo: se puede ejecutar y ajustar en una unica GPU de 8 GB o incluso menos (el autor lo entreno en una Tesla T4 de 15,6 GB).
- Opciones de despliegue: HuggingFace Transformers (AutoTokenizer y AutoModelForMaskedLM), y servidores de inferencia compatibles como TGI (Text Generation Inference no aplica por ser encoder), ademas de exportacion a ONNX o TorchScript para produccion. Ollama y llama.cpp no son el formato habitual para este tipo de encoder.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo y el hardware empleado (5 horas para 10 epocas sobre ~114.000 pares en una T4), se espera un rendimiento alto en inferencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Perplejidad (siSwati, validacion del autor) | Licencia |
|---|---|---|---|---|---|
| AfriBERTa-siSwati (este) | 125,7 M | Encoder MLM | no disponible | 7,27 | no disponible |
| AfriBERTa (castorini/afriberta_large) | ~126 M | Encoder MLM | no disponible | 35,59 | no disponible |
| mBERT | ~178 M | Encoder MLM | no disponible | 47,83 | no disponible |
| XLM-RoBERTa base | ~278 M | Encoder MLM | no disponible | no disponible | no disponible |

La comparacion se limita a los datos de perplejidad aportados por el propio autor; no hay resultados de benchmarks comunes que permitan contrastar el rendimiento en tareas especificas entre estos modelos. Para AfriBERTa y XLM-RoBERTa no se dispone de cifras de perplejidad sobre este mismo corpus en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo exclusivamente de comprension (encoder MLM); no genera texto de forma autoregresiva y no debe usarse como chatbot ni como modelo instructivo.
- Riesgo de alucinacion en tareas de rellenado de mascaras: las predicciones son probabilisticas y pueden producir tokens plausibles pero incorrectos, especialmente fuera del dominio del corpus de entrenamiento.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos; al derivar de AfriBERTa y entrenarse sobre un corpus concreto, puede heredar sesgos presentes en los datos (SADILAR EN-SS).
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; el modelo esta especializado en siSwati y en pares ingles-siSwati, por lo que su rendimiento en otras lenguas sera limitado.
- Licencia no disponible: no se indica la licencia del modelo, lo que supone un riesgo para su uso comercial o en produccion hasta que el autor lo aclare. La licencia CC BY 4.0 del corpus no implica necesariamente la del modelo derivado.
- El repositorio presenta 0 descargas y 0 "likes", y la fecha de creacion indicada (2026-10-13) resulta posterior a la actual, por lo que conviene verificar la vigencia y el estado real del modelo antes de integrarlo.
- No se documentan evaluaciones independientes ni resultados en benchmarks estandar; las cifras de perplejidad son autodeclaradas por el autor.
- La busqueda web asociada a este modelo no devolvio resultados tecnicos relevantes: los enlaces recuperados correspondian a sitios de videojuegos para adultos, sin relacion alguna con el modelo, por lo que no se han incluido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KhanyiTapiwa00/afriberta-siswati
- Modelo base: castorini/afriberta_large (referenciado en la model card; URL exacta no proporcionada)
- Referencia del articulo original de AfriBERTa: Ogueji et al., 2021 (URL del paper no disponible en la informacion suministrada)
- Corpus de entrenamiento: SADILAR EN-SS Bilingual Corpus v1.0.3, licencia CC BY 4.0 (URL no disponible en la informacion suministrada)
- Repositorios, demos o blogs adicionales: no disponibles

Aviso: la busqueda web realizada para este modelo no devolvio ningun enlace tecnico relevante. Los unicos resultados obtenidos fueron sitios de videojuegos para adultos sin relacion con AfriBERTa-siSwati, por lo que se han descartado.
