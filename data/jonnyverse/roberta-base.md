# JONNYVERSE/roberta-base

## Resumen

JONNYVERSE/roberta-base es una conversión del modelo RoBERTa-base original de Facebook AI a formato ONNX, diseñada específicamente para ser compatible con Transformers.js, la librería de Hugging Face que permite ejecutar modelos de transformers directamente en el navegador o en entornos JavaScript. Este repositorio no introduce un modelo nuevo, sino que proporciona los pesos de RoBERTa-base en un formato optimizado para inferencia web, facilitando el uso de este modelo de lenguaje enmascarado en aplicaciones client-side.

RoBERTa-base es un transformer bidireccional preentrenado sobre 160 GB de texto en inglés mediante masked language modeling dinámico. Con 125 millones de parámetros y una longitud de contexto de 512 tokens, es una alternativa robusta a BERT, ya que elimina el objetivo de predicción de siguiente oración y utiliza un entrenamiento más prolongado con lotes más grandes. La versión ONNX aquí presentada mantiene las mismas capacidades del modelo original, pero permite su ejecución sin servidor, lo que reduce latencia y costes de infraestructura.

La relevancia de este repositorio radica en su utilidad práctica para desarrolladores que necesitan desplegar modelos de NLP en el navegador, aplicaciones de escritorio basadas en Electron o entornos Node.js, sin depender de APIs externas ni de GPUs dedicadas. Al ser una conversión directa de un modelo ampliamente conocido, ofrece una ruta sencilla para integrar capacidades de comprensión del lenguaje en aplicaciones web con un esfuerzo mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (RoBERTa) |
| Parametros totales | 125 millones (modelo base) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX sin cuantizar) |
| Idiomas soportados | no disponible (el modelo base es ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo subyacente es RoBERTa-base, un transformer bidireccional basado en la arquitectura de BERT pero con varias modificaciones clave. Utiliza codificacion por pares de bytes (byte-pair encoding) con un vocabulario de 50.000 tokens y una arquitectura de 12 capas, 12 cabezas de atencion y una dimension oculta de 768. A diferencia de BERT, RoBERTa elimina el objetivo de prediccion de siguiente oracion (NSP) y emplea enmascaramiento dinamico, lo que significa que los tokens enmascarados se seleccionan de forma diferente en cada epoca de entrenamiento.

El preentrenamiento se realizo sobre una combinacion de cinco conjuntos de datos en ingles: BookCorpus (11.038 libros no publicados), Wikipedia en ingles (excluyendo listas, tablas y cabeceras), CC-News (63 millones de articulos de noticias en ingles recopilados entre septiembre de 2016 y febrero de 2019), OpenWebText y Stories. En total, el corpus suma aproximadamente 160 GB de texto. El entrenamiento se llevo a cabo con lotes grandes (8.000 secuencias) y una tasa de aprendizaje ajustada, durante 500.000 pasos. El modelo resultante mejora consistentemente a BERT en tareas de comprension del lenguaje.

La conversion a ONNX se realizo mediante la herramienta Optimum de Hugging Face, que exporta los pesos de PyTorch a formato ONNX. Este proceso no altera los parametros del modelo, solo cambia el formato de serializacion para permitir la ejecucion con el runtime de ONNX en JavaScript. El repositorio incluye los pesos en un subdirectorio `onnx`, siguiendo la estructura recomendada para su uso con Transformers.js.

## Capacidades

- Enmascaramiento de tokens (fill-mask): el modelo puede predecir tokens enmascarados en una secuencia, lo que permite tareas como completar frases o generar texto condicionado.
- Representaciones contextuales de texto: genera embeddings de alta calidad para palabras y frases, utiles para tareas de similitud semantica, busqueda o clasificacion.
- Clasificacion de texto: aunque no esta entrenado para una tarea especifica, puede fine-tuning para clasificacion de sentimiento, analisis de topicos o deteccion de spam.
- Extraccion de caracteristicas: sirve como backbone para modelos de extraccion de respuestas, reconocimiento de entidades o etiquetado de roles.
- Compatibilidad con Transformers.js: se ejecuta directamente en el navegador o en Node.js sin necesidad de servidor, lo que habilita aplicaciones de NLP en tiempo real con privacidad de datos.
- Soporte de pipeline de Hugging Face: integrable con la API de `pipeline` de Transformers.js para uso inmediato.

## Casos de uso

- Analisis de sentimiento en el navegador: una extension de navegador puede cargar este modelo para clasificar opiniones de usuarios en tiempo real sin enviar datos a un servidor, garantizando privacidad y reduciendo latencia.
- Autocompletado de formularios: en aplicaciones web, el modelo puede sugerir respuestas o completar campos de texto basandose en el contexto, mejorando la experiencia de usuario en entornos con conexiones limitadas.
- Busqueda semantica en documentacion tecnica: integrado en una aplicacion de documentacion, permite encontrar fragmentos relevantes a partir de consultas en lenguaje natural, utilizando los embeddings del modelo para calcular similitudes.
- Moderacion de contenido en foros: un plugin de WordPress o similar puede usar el modelo para detectar contenido ofensivo o inapropiado en comentarios antes de su publicacion, ejecutando la inferencia localmente.
- Asistente de escritura para correos electronicos: una herramienta de productividad puede sugerir frases o completar textos en un editor, aprovechando la capacidad de fill-mask del modelo.
- Clasificacion de tickets de soporte: en un panel de administracion, el modelo puede categorizar automaticamente los tickets entrantes (reclamaciones, consultas, errores) usando una capa de clasificacion anadida sobre los embeddings de RoBERTa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. El modelo base RoBERTa-base, sin embargo, ha sido evaluado ampliamente en tareas como GLUE (88.5), SQuAD v1.1 (91.3 F1) y SQuAD v2.0 (83.7 F1), pero estos resultados no estan vinculados directamente a esta version ONNX. Se recomienda consultar la documentacion del modelo original para obtener metricas de referencia.

## Requisitos de hardware

- Inferencia en navegador: al ser ONNX, puede ejecutarse con WebAssembly o WebGL en CPUs integradas de portatiles o incluso en moviles, sin necesidad de GPU dedicada.
- Memoria: el peso del modelo es de aproximadamente 0.9 GB en disco (formato ONNX), pero en memoria durante la inferencia puede requerir entre 500 MB y 1 GB dependiendo del runtime y del tamaño del lote.
- GPU recomendada: no necesaria para la mayoria de casos; si se despliega en servidor con Node.js, una GPU modesta (NVIDIA T4 o similar) puede acelerar la inferencia, pero no es imprescindible.
- Compatibilidad con consumer GPUs: si se usa en un entorno de escritorio con Electron, funciona en cualquier GPU moderna, aunque la aceleracion via WebGL puede variar.
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime Web, ONNX Runtime Node.js. No es compatible directamente con vLLM, llama.cpp o Ollama al ser un modelo tipo encoder y no generativo.
- Latencia estimada: en un portatil medio, la inferencia para una secuencia de 128 tokens suele tardar entre 50 y 200 ms en WebAssembly, y menos de 50 ms con aceleracion WebGL. El throughput en servidor con Node.js puede alcanzar cientos de secuencias por segundo en una CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| JONNYVERSE/roberta-base (ONNX) | 125M | 512 | Transformer bidireccional | no disponible | ONNX |
| bert-base-uncased (ONNX) | 110M | 512 | Transformer bidireccional | Apache 2.0 | ONNX |
| distilbert-base-uncased (ONNX) | 66M | 512 | Transformer bidireccional (destilado) | Apache 2.0 | ONNX |

RoBERTa-base ofrece un rendimiento superior a BERT-base en la mayoria de tareas de comprension del lenguaje, a costa de un mayor coste computacional. DistilBERT es mas ligero y rapido, pero con una perdida de precision de aproximadamente el 3% en GLUE. La ventaja de esta version ONNX es su compatibilidad directa con Transformers.js, mientras que las alternativas requieren conversion manual.

## Limitaciones y advertencias

- Sesgos del modelo base: RoBERTa-base fue entrenado con texto de internet y puede reflejar sesgos estereotipados o discriminatorios presentes en los datos de entrenamiento.
- Riesgo de alucinacion: aunque el modelo no genera texto libre, puede producir predicciones de tokens enmascarados que sean semanticamente plausibles pero incorrectas en contextos factuales.
- Limitacion de contexto: la ventana de 512 tokens restringe el analisis a fragmentos cortos; no es adecuado para documentos largos sin estrategias de troceado.
- Idioma: el modelo base solo soporta ingles; su uso con otros idiomas degrada significativamente el rendimiento.
- Licencia no especificada: aunque el modelo original roberta-base se distribuye bajo MIT, este repositorio no declara una licencia explicita, lo que puede generar incertidumbre legal para uso comercial.
- Formato ONNX no cuantizado: el tamaño de 0.9 GB puede ser elevado para aplicaciones web con restricciones de ancho de banda; se recomienda cuantizar a int8 o int4 si se necesita reducir el peso.
- Sin soporte de generacion de texto: al ser un modelo encoder, no puede utilizarse para tareas de generacion libre, solo para comprension y clasificacion.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/JONNYVERSE/roberta-base
- Modelo original: https://huggingface.co/roberta-base
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Guia de conversion a ONNX con Optimum: https://huggingface.co/docs/optimum/index
- Pagina del modelo en Microsoft Foundry: https://ai.azure.com/catalog/models/roberta-base
- Repositorio relacionado (clasificacion de emociones): https://huggingface.co/JONNYVERSE/roberta-base-go_emotions-onnx
