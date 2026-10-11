# arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1

## Resumen

gliner-ettin-68m-ptbr-pii-full-3x-v1 es un modelo de deteccion de entidades nombradas (NER) orientado especificamente a la identificacion de informacion personal identificable (PII) en portugues de Brasil. Lo desarrolla el usuario arthrod y se construye mediante fine-tuning del encoder jhu-clsp/ettin-encoder-68m (aproximadamente 68 millones de parametros) con la libreria GLiNER, que permite definir las etiquetas de entidades en lenguaje natural en tiempo de inferencia en lugar de fijarlas durante el entrenamiento.

El modelo resuelve un problema muy concreto: localizar y clasificar datos sensibles como CPF, RG, PIS, nombres, direcciones, telefonos, correos o tarjetas de credito dentro de texto en portugues, con el objetivo de facilitar el cumplimiento de la LGPD brasileira y la anonimizacion de documentos. La familia incluye etiquetas especificas para direcciones desglosadas (calle, numero, barrio, ciudad, estado, codigo postal) y para descripciones sensibles segun la normativa.

Es relevante porque demuestra que un encoder de solo 68 millones de parametros, entrenado sobre un conjunto de aproximadamente 984.000 muestras con 69.000 pasos previstos, alcanza 0,7076 de F1 estricto y 0,7979 de F1 parcial en la fuente de retencion PT-BR en el paso 41.400, su mejor checkpoint publicado. Se trata de una pieza de infraestructura para pipelines de redaccion de PII, no de un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional con cabecera GLiNER (span-based NER sobre jhu-clsp/ettin-encoder-68m) |
| Parametros totales | Aproximadamente 68 millones (encoder ettin-68m); el total del modelo GLiNER completo no esta desglosado en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, AWQ, GPTQ ni cuantizaciones del encoder) |
| Idiomas soportados | pt (portugues, con foco en portugues de Brasil) y en (evaluado en corpus PII en ingles y multilingues) |
| Licencia | Apache 2.0 |
| Formato de pesos | pytorch_model.bin (formato PyTorch; no se publican safetensors) |
| Libreria de inferencia | gliner, version 0.2.25 (la version con la que se entreno) |
| Pipeline | token-classification (deteccion de spans de entidad) |
| Tamano del repositorio | 15,1 GB (incluye 17 checkpoints completos con estados de optimizador y scheduler) |
| Checkpoint publicado | checkpoint-41400 (identico byte a byte al pytorch_model.bin de la raiz del repositorio) |
| DOI | 10.57967/hf/8520 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma GLiNER: un encoder transformer bidireccional que recibe el texto y un conjunto de etiquetas de entidad codificadas como embeddings, y produce predicciones de spans con una puntuacion de confianza. Al no ser generativo, no hay decodificacion autorregresiva ni fases de RLHF o DPO; el entrenamiento es una tarea de clasificacion de spans supervisada. El encoder de base es jhu-clsp/ettin-encoder-68m, un encoder de la familia Ettin del JHU CLSP.

El conjunto de entrenamiento principal (data/splits/train.jsonl) contiene aproximadamente 984.000 muestras y se construyo a partir de las mismas fuentes upstream de PII y spam que los conjuntos de retencion, cortando la particion de retencion antes de generar el split de entrenamiento para evitar filtraciones. La validacion de perdida usa 5.000 filas (val_5k.jsonl) y la seleccion de modelo se hizo sobre 5.000 filas proporcionales a 11 fuentes (holdout_5k_original). El entrenamiento se ejecuto en una GPU AMD MI300X con una receta de perdida comun a toda la familia de modelos GLiNER del autor, variando encoder, subconjunto de datos, tamano de lote y presupuesto de pasos. El run estaba planificado a 69.000 pasos, pero solo se publicaron checkpoints hasta el paso 58.650 (17 carpetas, una cada 3.450 pasos). El conjunto de entrenamiento no esta publicado.

## Capacidades

- Deteccion de PII en portugues de Brasil mediante etiquetas definidas en lenguaje natural: CPF, RG, PIS, nombre, apellido, segundo nombre, telefono, correo electronico y tarjeta de credito.
- Desglose de direcciones en componentes: calle, numero de edificio, barrio, ciudad, estado, abreviatura de estado, codigo postal y direccion completa.
- Deteccion de fecha de nacimiento (dob) y de descripciones sensibles segun la LGPD.
- NER de tipo zero-shot y few-shot: las etiquetas se pasan en tiempo de inferencia, no estan fijadas en los pesos, por lo que se pueden anadir categorias nuevas sin reentrenar.
- Puntuacion de confianza por span y umbral configurable (el ejemplo de la model card usa threshold=0.3), lo que permite ajustar el equilibrio entre precision y exhaustividad.
- Generalizacion entre fuentes: se evaluo en corpus de PII en ingles y multilingues y en texto de spam o phishing, no solo en la distribucion PT-BR.
- Capacidades multilingues limitadas a portugues e ingles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo discriminativo de clasificacion de tokens y spans, sin generacion de texto.

## Casos de uso

- Anonimizacion y redaccion de PII en cumplimiento de la LGPD: se ejecuta el modelo sobre documentos, correos o expedientes en portugues, se sustituyen los spans detectados por marcadores y se genera una version redactada apta para tratamiento posterior o publicacion.
- Auditoria de bases documentales: rastreo masivo de repositorios documentales para localizar CPF, RG, PIS o direcciones que no deberian estar almacenados en claro, generando informes de exposicion.
- Limpieza de datos para entrenamiento de modelos: preprocesado de corpus en portugues para eliminar informacion personal antes de usar los datos en fine-tuning de modelos generativos, reduciendo el riesgo de memorizacion de PII.
- Filtrado en tiempo real de canales de atencion al cliente: inspeccion de mensajes de chat o tickets antes de almacenarlos o enviarlos a sistemas de terceros, enmascarando datos sensibles de forma automatica.
- Deteccion de phishing y spam con datos personales: el modelo fue evaluado en texto de spam y phishing, por lo que puede usarse como componente de un clasificador que marque mensajes fraudulentos que incluyen PII de la victima.
- Anotacion asistida para equipos de etiquetado: preetiquetado de grandes volumenes de texto en portugues con las 18 categorias soportadas, dejando a los anotadores humanos solo la revision y correccion, con el consiguiente ahorro de tiempo.
- Enmascaramiento de PII en registros de aplicacion (logs): ejecucion del modelo en el pipeline de logging para sustituir datos personales antes de escribir los logs en disco o enviarlos a un sistema de observabilidad.
- Extraccion estructurada de direcciones: conversion de direcciones en texto libre a campos separados (calle, numero, barrio, ciudad, estado, codigo postal) para normalizacion de bases de datos de clientes.

## Benchmarks y rendimiento

Los unicos resultados numericos publicados en la informacion disponible corresponden al checkpoint-41400 sobre la fuente de retencion PT-BR:

| Metrica | Valor | Checkpoint | Fuente de evaluacion |
|---|---|---|---|
| F1 estricto | 0,7076 | checkpoint-41400 (paso 41.400) | fuente de retencion PT-BR |
| F1 parcial | 0,7979 | checkpoint-41400 (paso 41.400) | fuente de retencion PT-BR |

El repositorio incluye ademas el fichero eval_holdout_strict_f1.parquet, extraido del trainer_state.json de checkpoint-58650, con el F1 estricto por evaluacion sobre las 11 fuentes de retencion, pero los valores concretos no se detallan en la informacion proporcionada. No se publican resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generativos, puesto que el modelo no es generativo. La model card indica explicitamente que el modelo mmBERT-small full-3x de la misma familia es superior en todas las fuentes de retencion bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 272 MB en float32 y 136 MB en float16 para los 68 millones de parametros del encoder; el total con la cabecera GLiNER es ligeramente superior pero sigue siendo minimo.
- GPU recomendadas: cualquier GPU moderna es suficiente. En entrenamiento se uso una AMD MI300X, pero para inferencia basta una GPU de gama baja. Cabe holgadamente en RTX 4090, RTX 3090, RTX 3060, T4, L4, A10, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso puede ejecutarse en CPU con latencias aceptables dado el tamano del modelo.
- Opciones de despliegue: la libreria gliner (version 0.2.25) es la via documentada; tambien es integrable mediante el pipeline token-classification de transformers, exportacion a ONNX o TorchServe para servir en produccion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles.
- Nota de almacenamiento: el repositorio ocupa 15,1 GB por los 17 checkpoints con optimizer.pt, scheduler.pt y rng_state.pth. Para inferencia conviene descargar solo la raiz del repositorio o solo la carpeta checkpoint-41400, ignorando los ficheros de estado del optimizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (retencion PT-BR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gliner-ettin-68m-ptbr-pii-full-3x-v1 (este modelo) | ~68 M (encoder ettin-68m) | no disponible | 0,7076 estricto / 0,7979 parcial en el paso 41.400 | Apache 2.0 | Publico en HuggingFace |
| gliner-ettin-32m-ptbr-pii-full-3x-v1 | ~32 M (encoder ettin-32m) | no disponible | no disponible | no disponible en la informacion proporcionada | Publico; es el modelo mas pequeno de la familia, entrenado sobre el mismo conjunto completo con 69.000 pasos |
| gliner-ettin-68m-ptbr-pii-top50k-v1 | ~68 M (encoder ettin-68m) | no disponible | no disponible | no disponible en la informacion proporcionada | Publico; ablacion con subconjunto curado de 50.000 filas y 11.700 pasos, que segun el autor generaliza peor |
| gliner-mmbert-small-ptbr-pii-full-3x-v1 | encoder mmBERT-small | no disponible | superior a este modelo en todas las fuentes de retencion (valores no detallados) | no disponible en la informacion proporcionada | Publico; el modelo GLiNER mas fuerte de la familia, entrenado sobre el conjunto completo mas 2.000 filas de Ritápolis |
| gliner-opf-ptbr-pii-v1 | no disponible (fine-tune de OpenAI Privacy Filter) | no disponible | mejor F1 parcial en el conjunto de validacion en distribucion y muchos menos falsos positivos en texto sin PII | no disponible en la informacion proporcionada | Publico; no es un modelo GLiNER pese al nombre |

## Limitaciones y advertencias

- El modelo esta especializado en portugues de Brasil; su rendimiento fuera de ese idioma no esta garantizado, aunque se haya evaluado en corpus en ingles y multilingues.
- El checkpoint publicado corresponde al paso 41.400, no al final del entrenamiento planificado (69.000 pasos). Los checkpoints 62.100, 65.550 y 69.000 no se subieron, por lo que no se puede evaluar si el modelo final era mejor.
- El conjunto de entrenamiento no esta publicado, lo que dificulta auditar la composicion del dataset y reproducir el entrenamiento de forma exacta.
- La model card advierte que el modelo mmBERT-small de la misma familia supera a este en todas las fuentes de retencion bajo el mismo protocolo; si el objetivo es maximizar F1, ese modelo es preferible.
- La variante gliner-opf-ptbr-pii-v1 presenta muchos menos falsos positivos sobre texto sin PII, aspecto critico en produccion cuando se procesan grandes volumenes de texto mayoritariamente limpio.
- Existe riesgo de falsos positivos y de alucinacion de spans: el modelo puede marcar como PII fragmentos de texto que no lo son, especialmente con umbrales de confianza bajos. El umbral debe calibrarse por caso de uso.
- Requiere la version 0.2.25 de la libreria gliner, con la que fue entrenado; cambios de version pueden alterar el comportamiento de la tokenizacion de etiquetas o del decodificador de spans.
- No se documentan cuantizaciones oficiales ni versiones GGUF, lo que limita el despliegue en entornos de inferencia optimizados para formatos cuantizados.
- La licencia Apache 2.0 permite uso comercial, pero al procesar datos personales el responsable del tratamiento sigue sujeto a la LGPD, al RGPD u otras normativas aplicables; el modelo no sustituye una evaluacion de cumplimiento.
- La model card usa identificadores como "full-3x" que hacen referencia a la receta de la familia; no debe interpretarse como un multiplicador de parametros ni como capacidad de contexto ampliada.
- No se han publicado datos de sesgo demografico ni evaluaciones por subgrupos de poblacion; en un dominio como la deteccion de nombres y direcciones esto puede traducirse en un rendimiento desigual segun el origen del nombre o la region.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1)
- [Modelo base jhu-clsp/ettin-encoder-68m](https://huggingface.co/jhu-clsp/ettin-encoder-68m)
- [Variante gliner-ettin-32m-ptbr-pii-full-3x-v1](https://huggingface.co/arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1)
- [Variante gliner-ettin-68m-ptbr-pii-top50k-v1](https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1)
- [Variante gliner-mmbert-small-ptbr-pii-full-3x-v1](https://huggingface.co/arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1)
- [Variante gliner-opf-ptbr-pii-v1](https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1)
- [Dataset de benchmark gliner-opf-ptbr-pii-bench-v1](https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1)
- [Demo Gradio gliner-opf-ptbr-pii-demo](https://huggingface.co/spaces/arthrod/gliner-opf-ptbr-pii-demo)
- [Dataset gliner_eval_folder](https://huggingface.co/datasets/arthrod/gliner_eval_folder)
- [Dataset gliner_review_comparison](https://huggingface.co/datasets/arthrod/gliner_review_comparison)
- DOI: 10.57967/hf/8520
- No se han encontrado enlaces relevantes adicionales en la busqueda web realizada; los resultados devueltos correspondian a contenido medico sobre artrodesis, sin relacion con el modelo.
