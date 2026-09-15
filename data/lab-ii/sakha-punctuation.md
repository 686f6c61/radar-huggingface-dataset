# lab-ii/sakha-punctuation

## Resumen

Sakha punctuation and capitalisation es un modelo de restauracion de puntuacion y mayusculas para el idioma sajá (yakut, codigo ISO `sah`), desarrollado por el usuario lab-ii y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo: es un clasificador de tokens (pipeline `token-classification`) pensado para posprocesar la salida de un sistema de reconocimiento automatico de voz (ASR) que devuelve texto en minusculas y sin signos de puntuacion. El modelo toma esa transcripcion cruda y le devuelve los signos y las mayusculas.

Tecnicamente se construye como un fine-tuning de `FacebookAI/xlm-roberta-base` con **dos cabezas lineales** sobre el estado oculto del encoder: una para puntuacion (8 etiquetas) y otra para registro o uso de mayusculas (3 etiquetas). El autor justifica explicitamente no separar ambas tareas porque sus decisiones estan correlacionadas: una mayuscula casi siempre sigue a un punto, y predecirlas por separado produce combinaciones inexistentes en el idioma.

Su relevancia es de nicho pero clara: el sajá es una lengua turquica de bajos recursos hablada en la republica de Saja (Yakutia), con muy pocos recursos de PLN publicados. Este modelo cubre una etapa concreta de la cadena de transcripcion (puntuacion y capitalizacion) sobre la que no existen muchas alternativas especificas. El repo ocupa 1,1 GB, lo que es coherente con un checkpoint en precision completa de un encoder de ~278 M de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) con dos cabezas lineales de clasificacion de tokens (puntuacion + registro) |
| Parametros totales | ~278 M (heredados de `FacebookAI/xlm-roberta-base`; no se indica un recuento propio en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de XLM-RoBERTa-base); el script `punctuate.py` aplica ventanas solapadas |
| Tipos de cuantizacion | No disponible (se distribuye como checkpoint PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | Saja / yakut (`sah`) para la tarea entrenada; el encoder base es multilingue (100 idiomas), pero solo `sah` esta ajustado |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (`.pt`) con `state_dict`, `base`, `punct_labels` y `case_labels`; tokenizer de XLM-RoBERTa en el repo. No se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un encoder XLM-RoBERTa-base con dos cabezas lineales independientes (768 dimensiones de entrada, dropout de 0,1 antes de cada cabeza) sobre el ultimo estado oculto. La cabeza de puntuacion emite 8 clases (`NONE`, `COMMA`, `PERIOD`, `QUESTION`, `EXCLAM`, `COLON`, `SEMICOLON`, `DASH`) y la de registro 3 (`LOWER`, `TITLE`, `UPPER`). Las etiquetas se asignan al **primer sub-token de cada palabra**; el resto de sub-tokens se excluye de la funcion de perdida durante el entrenamiento y debe ignorarse tambien en inferencia. No se menciona uso de RLHF ni DPO, lo cual es coherente con una tarea de etiquetado supervisado.

El detalle mas relevante del entrenamiento es la construccion del corpus. Las etiquetas se extraen del **texto de libros**, no de transcripciones de segmentos de audio: el razonamiento del autor es que el signo de fin de oracion no tiene realizacion sonora, el alineador no lo transfiere y en las transcripciones simplemente no existe, mientras que en el libro si. Ademas se filtraron los libros cuyo escaneo habia perdido las mayusculas: sin ese filtro la proporcion de mayusculas bajaba casi a cero en parte del corpus y el modelo aprendia a escribir todo en minusculas, inflando artificialmente la metrica (la primera version reportaba un 98,22 % de exactitud de registro prediciendo practicamente siempre `LOWER`). Tambien se excluyeron los libros presentes en los conjuntos dev y test del corpus de voz para evitar que la evaluacion midiera memorizacion.

## Capacidades

- Restauracion de puntuacion sobre texto sin signos: inserta comas, puntos, interrogaciones, exclamaciones, dos puntos, punto y coma y guiones.
- Restauracion de mayusculas: distingue tres clases (`LOWER`, `TITLE`, `UPPER`), es decir, minuscula, capitalizacion de titulo o nombre propio y todo en mayusculas.
- Posprocesado de ASR: entrada en minusculas y sin puntuacion, salida con signos y registro correctos.
- Prediccion conjunta y coherente de puntuacion y registro gracias a las dos cabezas compartiendo el mismo encoder.
- Procesamiento por ventanas solapadas mediante el script `punctuate.py`, de modo que una palabra en el borde de la ventana se decide con contexto por ambos lados.
- No dispone de generacion de texto, tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido: es exclusivamente un clasificador de tokens.
- No se documenta soporte multilingue mas alla del sajá, pese a que el encoder base sea multilingue.

## Casos de uso

- Posprocesado de transcripciones ASR en sajá: cualquier pipeline que use un reconocedor de voz para yakut obtiene texto plano; este modelo devuelve puntos y comas y permite publicar la transcripcion sin repaso manual de esa capa.
- Generacion de subtitulos para contenido audiovisual en yakut: el modelo segmenta el flujo continuo de palabras en oraciones mediante puntos, requisito para partir subtitulos en unidades legibles.
- Archivado y digitalizacion de corpus orales: entrevistas, grabaciones de campo o material etnografico en sajá pueden transcribirse y despues normalizarse tipograficamente antes de incorporarlos a un corpus anotado.
- Normalizacion de texto para entrenamiento de otros modelos: las mayusculas y los signos restaurados mejoran la calidad de corpus que alimentaran modelos de lengua sajá en etapas posteriores (traduccion, resumen, modelado de lenguaje).
- Herramientas de accesibilidad: transcripcion en vivo con puntuacion para personas con dificultades auditivas, donde el texto sin signos es mucho mas dificil de seguir.
- Asistencia a traductores y editores: preprocesado rapido de transcripciones de audio en sajá antes de la revision humana, dejando al revisor solo las decisiones estilisticas en lugar de la puntuacion basica.
- Busqueda y recuperacion de informacion sobre archivos de audio: la segmentacion en oraciones facilita indexar transcripciones y recuperar fragmentos coherentes en lugar de bloques de palabras sueltas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre una muestra de retencion compuesta por libros no vistos durante el entrenamiento.

Puntuacion (exactitud global: 92,37 %):

| Etiqueta | Precision | Recall | F1 | Ejemplos |
|---|---|---|---|---|
| NONE | 98,1 | 93,5 | 95,7 | 189 475 |
| PERIOD | 96,8 | 97,4 | 97,1 | 19 080 |
| COMMA | 68,1 | 82,7 | 74,7 | 23 760 |
| QUESTION | 60,9 | 80,6 | 69,4 | 191 |
| EXCLAM | 31,1 | 61,6 | 41,4 | 297 |
| COLON | 24,8 | 66,9 | 36,2 | 740 |
| DASH | 18,1 | 44,6 | 25,8 | 1 078 |
| SEMICOLON | 5,1 | 39,0 | 9,1 | 59 |

Registro (exactitud global: 97,16 %):

| Etiqueta | Precision | Recall | F1 | Ejemplos |
|---|---|---|---|---|
| LOWER | 98,2 | 98,6 | 98,4 | 189 601 |
| TITLE | 93,4 | 92,1 | 92,7 | 41 852 |
| UPPER | 82,6 | 76,7 | 79,5 | 3 227 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en fp32 el checkpoint ocupa aproximadamente 1,1 GB (coincide con el tamano del repo); en fp16 unos 550 MB y en int8 unos 280 MB, sin contar activaciones.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; por ejemplo RTX 3060, RTX 4090, T4, L4, A10, A100 o H100. El modelo no aprovecha el paralelismo de las GPU de gama alta porque es un encoder pequeno con lotes cortos.
- Inferencia en CPU: perfectamente viable dado el tamano (encoder de ~278 M de parametros); es la opcion natural si el volumen de texto no es alto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: PyTorch + `transformers` con el codigo de la model card; exportacion a ONNX o TorchScript y servicio con ONNX Runtime, HuggingFace Optimum o NVIDIA Triton. No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo de decodificacion autorregresiva.
- Latencia y throughput: no disponible. Como referencia de diseno, el procesamiento por ventanas solapadas de `punctuate.py` multiplica el coste por el factor de solapamiento, asi que conviene ajustar el tamano de ventana y el solape segun el requisito de latencia.

## Comparativa con modelos similares

La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con modelos de puntuacion para sajá (los resultados fueron paginas corporativas de empresas llamadas LAB, SYNLAB, BandLab y Cerba, sin relacion con el modelo). No se conocen alternativas especificas para sajá en la informacion disponible.

Como referencia de categoria, los modelos mas cercanos son otros sistemas de restauracion de puntuacion y capitalizacion construidos sobre encoders multilingues, que cubren muchos idiomas pero no estan ajustados para `sah`:

| Modelo | Modelo base | Parametros | Contexto | Soporte de `sah` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lab-ii/sakha-punctuation | XLM-RoBERTa-base | ~278 M | 512 | Si (entrenado para sajá) | Apache 2.0 | HuggingFace; 0 descargas, 0 likes en el momento de la consulta |
| oliverguhr/fullstop-punctuation-multilang-large | XLM-RoBERTa-large | ~560 M | 512 | No documentado | No disponible | HuggingFace |
| 1-800-BAD-CODE/xlm-roberta_punctuation_fullstop_truecase | XLM-RoBERTa-large | ~560 M | 512 | No documentado | No disponible | HuggingFace |

Los datos de parametros y contexto de las alternativas se derivan de sus respectivos modelos base y no se han verificado en la informacion proporcionada para esta ficha; los campos no comprobados figuran como "no disponible".

## Limitaciones y advertencias

- Entrenado sobre texto literario de libros. En habla espontanea la deteccion de final de oracion empeora notablemente: en una lectura, la oracion termina donde hay un punto en el libro, pero en el habla viva la frontera la marca una pausa que el modelo no puede observar porque solo trabaja con texto.
- Los signos poco frecuentes se predicen mal. Los F1 de punto y coma (9,1), guion (25,8), dos puntos (36,2) y exclamacion (41,4) son bajos. El propio autor recomienda usar unicamente punto y coma como salida predecible: punto y coma representan el 96 % de los signos del corpus.
- El punto y coma tiene una precision del 5,1 % y la interrogacion solo 191 ejemplos de evaluacion, por lo que sus metricas tienen alta varianza.
- La metrica global de puntuacion (92,37 %) esta dominada por la clase `NONE` (189 475 de 234 712 ejemplos); no debe interpretarse como un rendimiento uniforme entre clases.
- Riesgo de alucinacion de puntuacion y de mayusculas: puede insertar signos donde no corresponden o capitalizar palabras comunes, especialmente en generos textuales alejados del libro.
- Sesgo de dominio: el corpus son libros con escaneo de calidad suficiente, lo que puede introducir un sesgo hacia registro formal y tipografia estandar.
- Ambito idiomatico limitado: solo sajá. Aunque el encoder base sea multilingue, no hay garantia de comportamiento correcto en otros idiomas sin ajuste.
- Restriccion de integracion: el checkpoint se distribuye como `.pt` (pickle de PyTorch) y la carga se realiza con `torch.load`, lo que implica cargar codigo serializado; conviene auditar el fichero antes de usarlo en produccion. No hay versiones safetensors ni GGUF.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero exige conservar los avisos de copyright y licencia y no otorga garantias. Hay que verificar tambien las condiciones del modelo base XLM-RoBERTa y del corpus de libros utilizado, que no se detalla en la model card.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lab-ii/sakha-punctuation
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper, blog o repositorio adicional: no disponible
- Resultados relevantes de la busqueda web: no disponible (la busqueda no devolvio ninguna pagina relacionada con el modelo)
