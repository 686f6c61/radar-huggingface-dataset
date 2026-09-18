# onnx-community/t5-cnn-25k-ONNX

## Resumen

t5-cnn-25k-ONNX es la version en formato ONNX del modelo vaibhavvanshu/t5-cnn-25k, un T5-small afinado para resumen abstractivo de texto. Lo publica la organizacion onnx-community, que se dedica a convertir automaticamente modelos de Hugging Face a ONNX mediante un Space de conversion, con el objetivo de que puedan ejecutarse con transformers.js en navegador, Node.js y otros entornos ligeros. El pipeline declarado es summarization y el modelo base original es google-t5/t5-small.

El modelo resuelve una tarea concreta: generar resumenes cortos, medios y largos a partir de articulos y documentos, con un maximo de 512 tokens de entrada. Se entreno sobre 25.000 ejemplos del dataset CNN/DailyMail, por lo que esta especializado en texto periodistico en ingles. Con unos 60 millones de parametros, es un modelo pequeno orientado a inferencia barata y despliegue en dispositivos sin GPU dedicada.

Su relevancia actual es practica: permite anadir resumen automatico a una aplicacion web o a un backend ligero sin depender de APIs externas ni de hardware de gama alta. Forma parte de una aplicacion denominada Text Summarizer, que combina un frontend en React, un backend en FastAPI, extraccion de texto de PDF, OCR y una estrategia de resumen jerarquico para documentos que exceden la ventana de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5) |
| Parametros totales | Aproximadamente 60 millones (T5-small) |
| Longitud de contexto | 512 tokens de entrada |
| Tipos de cuantizacion | no disponible (el repositorio ocupa 2,1 GB, lo que sugiere varias variantes de precision, pero la model card no las detalla) |
| Idiomas soportados | no disponible (el entrenamiento es en ingles, dataset CNN/DailyMail) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Autor del repositorio | onnx-community (conversion automatica) |
| Modelo base | vaibhavvanshu/t5-cnn-25k, a su vez derivado de google-t5/t5-small |
| Tarea | summarization (text2text-generation) |
| Libreria declarada | transformers.js |
| Tamano del repositorio | 2,1 GB |
| Fecha de publicacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder estandar de la familia T5, en su variante small, con alrededor de 60 millones de parametros. T5 emplea atencion completa, normalizacion pre-LayerNorm, embeddings de posicion relativos y un enfoque text-to-text en el que todas las tareas se formulan como generacion de secuencias. En este caso la entrada se prefija con la instruccion "summarize:" y la salida es el resumen. El modelo base se preentreno sobre C4 y despues se afino sobre CNN/DailyMail.

El afinamiento concreto de este repositorio se realizo sobre 25.000 ejemplos de CNN/DailyMail, un corpus de articulos de noticias en ingles emparejados con resumenes de referencia escritos por humanos. La model card indica que el proyecto contiene varios experimentos con distintos tamanos de dataset de entrenamiento y que se selecciono la version de 25K para la aplicacion final. No se documentan en la informacion disponible detalles sobre RLHF, DPO, composicion exacta del dataset, hiperparametros de entrenamiento ni numero total de tokens vistos. Tampoco se documenta ninguna innovacion arquitectonica adicional: la conversion a ONNX no altera la arquitectura, solo el formato de serializacion. La capacidad de resumir documentos largos no proviene del modelo, sino de la capa de aplicacion, que trocea el documento, resume cada fragmento y combina los resultados en pasadas sucesivas (resumen jerarquico).

## Capacidades

- Generacion de resumenes abstractivos de texto en ingles, con longitudes objetivo de 150 tokens (corto), 250 (medio) y 400 (largo); estos limites los impone la aplicacion, no el modelo.
- Generacion text-to-text generica en el formato de instruccion de T5, aunque el afinamiento esta orientado casi en exclusiva al resumen.
- Procesamiento de entradas de hasta 512 tokens, con truncado por encima de ese limite.
- Integracion con la pipeline `summarization` de transformers.js, lo que permite ejecucion en navegador mediante WebGPU o WASM.
- Soporte de decodificacion con beam search (el ejemplo de la model card usa `num_beams=4` y `early_stopping=True`).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue: no disponible; el entrenamiento es en ingles y no se declara soporte de otros idiomas.

## Casos de uso

- Resumen de articulos de noticias: es el dominio exacto del entrenamiento (CNN/DailyMail), por lo que la calidad esperada es maxima aqui. Se enviaria el cuerpo del articulo prefijado con "summarize:" y se obtendria un resumen de 150 a 250 tokens.
- Resumen de documentos PDF largos: mediante la estrategia jerarquica descrita en la model card (trocear, resumir cada fragmento, combinar y volver a resumir), se pueden procesar informes de decenas de paginas con un modelo de solo 512 tokens de contexto.
- Resumen en el navegador con transformers.js: al estar en formato ONNX y publicarse para esa libreria, permite resumir texto localmente sin enviar los datos a un servidor, lo que resulta adecuado para documentos sensibles.
- Generacion de TL;DR en aplicaciones de lectura: integrable en lectores de RSS, agregadores o clientes de correo para producir un parrafo de sintesis por elemento antes de que el usuario lo abra.
- Preprocesado de corpus para busqueda semantica o RAG: generar resumenes por documento antes de indexarlos reduce el tamano del embedding y mejora la recuperacion en corpus periodisticos.
- Resumen de actas, correos e informes internos: viable siempre que el registro se parezca al periodistico; requiere revision humana por el riesgo de omision y alucinacion.
- Backend de aplicacion web o servicio interno: el modelo cabe en CPU y puede servirse desde un endpoint FastAPI o Node.js de bajo coste, sin GPU.
- Docencia e investigacion: sirve como caso de estudio reproducible de resumen abstractivo con un transformer pequeno y de un flujo completo de conversion a ONNX y despliegue en el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en cualquier precision. Los pesos en fp32 ocupan aproximadamente 240 MB; en fp16, unos 120 MB; en int8, alrededor de 60 MB. Las variantes de precision realmente incluidas en el repositorio no estan documentadas.
- GPU recomendadas: cualquier GPU moderna es suficiente y sobra. Funciona en RTX 3060, RTX 4090, A100, H100 y tambien en GPUs integradas, dado el tamano reducido del modelo.
- Cabe en GPU de consumo: si, en cualquier modelo, incluidos equipos con graficos integrados o iGPU.
- Ejecucion en CPU: totalmente viable; es el escenario mas habitual para este modelo.
- Opciones de despliegue: transformers.js (navegador con WebGPU o WASM), ONNX Runtime, ONNX Runtime Web, Optimum, Node.js y despliegue como servicio tras un backend FastAPI o similar.
- Latencia y throughput estimados: no disponibles. Para orientar, se trata de un modelo de 60 millones de parametros que genera hasta 400 tokens en decodificacion con beam search; en CPU moderna el orden de magnitud es de segundos por resumen, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| onnx-community/t5-cnn-25k-ONNX | ~60 M | 512 tokens | CNN/DailyMail, 25.000 ejemplos | Apache 2.0 | ONNX |
| google-t5/t5-small | ~60 M | 512 tokens | C4 (preentrenamiento, sin afinamiento de resumen) | Apache 2.0 | safetensors |
| facebook/bart-large-cnn | ~400 M | 1024 tokens | CNN/DailyMail | MIT | safetensors |
| google/pegasus-cnn_dailymail | ~568 M | 1024 tokens | CNN/DailyMail | Apache 2.0 | safetensors |

La comparativa se limita a parametros, contexto, licencia y formato, ya que no se han proporcionado resultados de benchmarks que permitan comparar calidad de resumen. Frente a t5-small sin afinar, este modelo anade la especializacion en resumen; frente a BART-large-cnn y PEGASUS, ofrece un tamano muy inferior y un formato ONNX listo para el navegador, a costa de menor capacidad y de un limite de contexto mas corto.

## Limitaciones y advertencias

- Riesgo de alucinacion: la propia model card advierte de que puede producir afirmaciones inexactas e inventar informacion.
- Omision de informacion relevante: como todo modelo abstractivo, puede descartar datos importantes del texto original.
- Sensibilidad al dominio y al estilo de escritura: el rendimiento varia fuera del registro periodistico; en textos legales, medicos, cientificos o tecnicos la calidad no esta garantizada.
- Limite de contexto de 512 tokens: cualquier documento mas largo exige troceado y resumen jerarquico, lo que acumula errores en cada pasada.
- Idioma: sin datos declarados de idiomas soportados y con entrenamiento en ingles, el uso en castellano no esta respaldado por el autor.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Capacidad limitada por tamano: 60 millones de parametros implican menor coherencia, menor fidelidad y menor manejo de instrucciones que modelos de cientos de millones de parametros.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la model card recomienda revisar tambien las licencias y terminos del modelo base y del dataset CNN/DailyMail.
- Ausencia de benchmarks: no hay metricas publicadas (ROUGE u otras), por lo que cualquier decision de produccion deberia basarse en una evaluacion propia sobre el dominio objetivo.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.
- Advertencia de gobernanza: la model card original esta redactada en ingles y no incluye guia de uso responsable ni filtros de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onnx-community/t5-cnn-25k-ONNX
- Modelo base: https://huggingface.co/vaibhavvanshu/t5-cnn-25k
- Modelo original de Google: https://huggingface.co/google-t5/t5-small
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion de la pipeline de summarization en transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.SummarizationPipeline
- Sitio oficial de ONNX: https://onnx.ai/
- Repositorio de ONNX en GitHub: https://github.com/onnx/onnx
- Documentacion de ONNX: https://onnx.ai/onnx/
- Entrada de Wikipedia sobre Open Neural Network Exchange: https://en.wikipedia.org/wiki/Open_Neural_Network_Exchange
