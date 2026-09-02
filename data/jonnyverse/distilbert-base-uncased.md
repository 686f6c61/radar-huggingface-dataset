# JONNYVERSE/distilbert-base-uncased

## Resumen

JONNYVERSE/distilbert-base-uncased es una conversión a formato ONNX del modelo DistilBERT base sin normalizar mayúsculas (uncased), preparada específicamente para su uso con la librería Transformers.js en entornos JavaScript y navegador. El autor, JONNYVERSE, ha exportado los pesos del modelo original de Hugging Face (distilbert/distilbert-base-uncased) a ONNX para que pueda ejecutarse de forma eficiente en el cliente, sin necesidad de servidor. El pipeline principal es fill-mask, es decir, completar palabras enmascaradas en una frase.

Este modelo resuelve el problema de desplegar modelos de lenguaje en aplicaciones web y Node.js, donde el formato ONNX permite la inferencia con WebML o runtime de ONNX en JavaScript. Es una adaptación técnica, no un modelo reentrenado: las capacidades lingüísticas son idénticas a las del DistilBERT original, un transformer destilado de BERT con 66 millones de parámetros y una ventana de contexto de 512 tokens. La relevancia actual radica en la creciente demanda de modelos ligeros que funcionen directamente en el navegador, con latencia baja y sin dependencias de backend.

El repositorio tiene un tamaño de 0.9 GB y fue creado en septiembre de 2026. No se especifican licencia ni idiomas en la model card, aunque el modelo base del que deriva está bajo Apache-2.0 y está entrenado principalmente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder-only) destilado, 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 66 millones (modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos ONNX estandar, sin cuantizacion especificada) |
| Idiomas soportados | no disponible (el modelo base esta entrenado en ingles) |
| Licencia | no disponible (el modelo base usa Apache-2.0) |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT, un transformer encoder-only destilado de BERT base mediante destilacion de conocimiento. El modelo original fue entrenado con el mismo corpus que BERT (Wikipedia y BookCorpus) utilizando una funcion de perdida combinada de destilacion, perdida de representaciones ocultas y perdida de modelado de lenguaje enmascarado. El resultado es un modelo con un 40% menos de parametros que BERT base (66M frente a 110M) pero que retiene aproximadamente el 97% de su rendimiento en tareas de comprension del lenguaje. Esta conversion concreta no introduce cambios en la arquitectura ni en los pesos; solo transforma los pesos de PyTorch a formato ONNX para permitir la inferencia en JavaScript mediante Transformers.js. No se ha realizado ningun ajuste fino adicional, por lo que las capacidades son las del modelo original.

## Capacidades

- Completar palabras enmascaradas (fill-mask) en frases en ingles, por ejemplo: `The goal of life is [MASK]`.
- Extraccion de representaciones contextuales de tokens para tareas posteriores como clasificacion de texto, reconocimiento de entidades o respuesta a preguntas.
- Generacion de embeddings de frases utiles para busqueda semantica o sistemas de recomendacion.
- Inferencia en el navegador o en Node.js gracias al formato ONNX y la integracion con Transformers.js.
- No soporta tool calling, agentes, ni razonamiento multi-paso, al ser un modelo encoder-only sin capacidad generativa autoregresiva.
- Multilingue limitado: el modelo base fue entrenado principalmente en ingles y no distingue mayusculas de minusculas (uncased).

## Casos de uso

- Completado de texto en aplicaciones web: un campo de busqueda o un editor puede sugerir palabras en tiempo real usando `pipeline('fill-mask')` desde el navegador, sin enviar datos a un servidor.
- Analisis de sentimiento en el cliente: aunque el modelo no esta ajustado para clasificacion, puede usarse como extractor de caracteristicas conectado a un clasificador ligero (por ejemplo, una capa lineal) para clasificar opiniones en una extension de navegador.
- Filtrado de contenido en tiempo real: detectar palabras ofensivas o temas sensibles en comentarios de usuarios mediante la representacion de tokens y un clasificador entrenado sobre los embeddings de DistilBERT.
- Busqueda semantica en documentos privados: generar embeddings de frases con Transformers.js para indexar y buscar en un corpus local sin subir datos a la nube, adecuado para aplicaciones de productividad.
- Educacion y prototipado: mostrar a estudiantes como funciona el enmascaramiento de lenguaje en una demo interactiva ejecutable en una pagina HTML estatica.
- Preprocesamiento para pipelines de NLP en Node.js: extraer embeddings de texto en un servidor backend con bajo consumo de recursos, antes de pasarlos a modelos de clasificacion o agrupamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. El modelo base distilbert/distilbert-base-uncased tiene resultados conocidos en GLUE (por ejemplo, 86.9 en MNLI, 92.7 en QQP, 90.7 en SST-2), pero esta conversion ONNX no aporta datos propios. Se recomienda consultar la ficha del modelo base para referencia.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 66M de parametros, el consumo de memoria es bajo. En ONNX con precision FP32, los pesos ocupan aproximadamente 264 MB; en FP16 se reduce a unos 132 MB. La inferencia en CPU es viable.
- GPU recomendadas: no es necesaria una GPU dedicada. Puede ejecutarse en cualquier CPU moderna, incluso en dispositivos moviles o navegadores con WebGL/WebGPU si se usa el runtime de ONNX adecuado.
- Compatibilidad con GPU de consumo: funciona en cualquier GPU con soporte WebGPU (por ejemplo, RTX 2060 o superior) cuando se usa desde el navegador.
- Opciones de despliegue: Transformers.js (npm `@huggingface/transformers`), ONNX Runtime Web, ONNX Runtime Node.js. No se recomienda vLLM o TGI para un modelo de este tamano.
- Latencia estimada: en un navegador moderno con CPU de gama media, una inferencia de fill-mask tarda entre 10 y 50 ms, dependiendo de la longitud del texto. En Node.js con ONNX Runtime, el throughput puede superar las 200 inferencias por segundo en un CPU de servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso en navegador |
|---|---|---|---|---|---|
| JONNYVERSE/distilbert-base-uncased (ONNX) | 66M | 512 | ONNX | no disponible (base Apache-2.0) | Si, via Transformers.js |
| BERT-base-uncased | 110M | 512 | PyTorch, ONNX | Apache-2.0 | Si, con conversion ONNX |
| DistilBERT-base (original) | 66M | 512 | PyTorch | Apache-2.0 | No directamente, requiere conversion |

La diferencia principal con el original es el formato de pesos y la integracion con Transformers.js. Frente a BERT, DistilBERT es un 40% mas ligero y aproximadamente un 60% mas rapido en inferencia, manteniendo el 97% del rendimiento en tareas de comprension. Esta conversion no anade ni elimina capacidades respecto al modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base fue entrenado con datos de Wikipedia y BookCorpus, que contienen sesgos de genero, raza y cultura presentes en esos corpus. No se realizo ninguna mitigacion especifica.
- Riesgo de alucinacion: al ser un modelo de enmascaramiento, no genera texto libre, por lo que no hay riesgo de alucinacion en ese sentido. Sin embargo, las predicciones de palabras enmascaradas pueden ser incorrectas o sesgadas.
- Limitaciones de contexto: la ventana de 512 tokens es corta para documentos extensos; textos mas largos deben truncarse o dividirse.
- Idioma: el modelo esta disenado para ingles. Su rendimiento en otros idiomas es muy limitado y no se recomienda su uso en produccion para textos en castellano u otros idiomas sin ajuste fino.
- Licencia: el repositorio no especifica licencia. Aunque el modelo base usa Apache-2.0, la ausencia de licencia explicita en este repositorio puede generar incertidumbre legal. Se recomienda contactar al autor o usar el modelo original con licencia clara.
- Restricciones de produccion: al ser una conversion ONNX sin cuantizacion, el tamano del archivo (0.9 GB) es elevado para descarga en navegador. Se recomienda cuantizar o usar una version mas ligera si la latencia de carga es critica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/distilbert-base-uncased
- Modelo base original: https://huggingface.co/distilbert/distilbert-base-uncased
- Pagina de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentacion de Optimum para conversion ONNX: https://huggingface.co/docs/optimum/index
- Modelo relacionado (ajustado a SST-2): https://huggingface.co/JONNYVERSE/distilbert-base-uncased-finetuned-sst-2-english
