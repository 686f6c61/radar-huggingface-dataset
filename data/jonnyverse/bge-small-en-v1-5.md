# JONNYVERSE/bge-small-en-v1.5

## Resumen

El modelo `JONNYVERSE/bge-small-en-v1.5` es una conversión a formato ONNX del modelo de embeddings `BAAI/bge-small-en-v1.5`, desarrollado por la Beijing Academy of Artificial Intelligence (BAAI). Esta versión está específicamente preparada para ser utilizada con la librería Transformers.js, lo que permite ejecutar extracción de características y búsqueda semántica directamente en el navegador o en entornos Node.js, sin necesidad de un servidor dedicado. El modelo original pertenece a la familia BGE (BAAI General Embedding) y está basado en una arquitectura BERT encoder-only, diseñada para convertir texto en vectores densos que capturan significado semántico. Aunque su tamaño es compacto, ofrece un rendimiento competitivo en tareas de recuperación de información y similitud textual, siendo una opción ligera y eficiente para aplicaciones de búsqueda y clasificación.

La relevancia de esta conversión radica en que democratiza el uso de embeddings de calidad en el lado del cliente, reduciendo la latencia y los costes de infraestructura. Al estar disponible en ONNX, el modelo puede ser cargado directamente con Transformers.js, que utiliza ONNX Runtime Web para la inferencia. Esto facilita la creación de aplicaciones web de búsqueda semántica, sistemas de recomendación, chatbots con memoria semántica y otras herramientas que requieren entender el significado del texto en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder-only (basado en BAAI/bge-small-en-v1.5) |
| Parametros totales | no disponible (modelo original: ~24M, no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo original: 512 tokens, no confirmado) |
| Tipos de cuantizacion | ONNX (formato estandar, sin cuantizacion especifica indicada) |
| Idiomas soportados | ingles (por nombre y documentacion del modelo original) |
| Licencia | no disponible (modelo original bajo MIT, no confirmado en esta conversion) |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint `BAAI/bge-small-en-v1.5` a formato ONNX, manteniendo la arquitectura BERT encoder-only original. Esta arquitectura utiliza capas de atención bidireccional para generar representaciones contextuales de cada token, que posteriormente se agregan mediante pooling (en el ejemplo de uso se emplea `mean` pooling) para obtener un vector de 384 dimensiones por frase. El modelo original fue entrenado mediante aprendizaje contrastivo con una temperatura de 0.01, lo que produce distribuciones de similitud concentradas en el intervalo [0.6, 1], una característica que alivia problemas de calibración en tareas de retrieval. Además, se utilizó un ajuste fino con instrucciones (instruction tuning) para mejorar el rendimiento en búsqueda de pasajes relevantes, recomendando un prefijo específico para consultas ("Represent this sentence for searching relevant passages: ").

No se dispone de información detallada sobre el volumen de datos de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en esta conversión. La conversión a ONNX no altera los pesos del modelo original; simplemente los serializa en un formato interoperable que puede ser ejecutado por ONNX Runtime, la base de Transformers.js.

## Capacidades

- Generacion de embeddings de texto: produce vectores densos de 384 dimensiones para frases o documentos, listos para calcular similitud coseno.
- Busqueda semantica: permite recuperar pasajes relevantes a partir de una consulta, utilizando el prefijo de instruccion recomendado.
- Similitud textual: calcula la similitud entre pares de frases, util para deduplicacion, clustering o clasificacion.
- Ejecucion en el navegador: gracias a Transformers.js y ONNX Runtime Web, funciona sin servidor, en clientes web y aplicaciones Node.js.
- Soporte de pooling y normalizacion: el pipeline permite configurar pooling (mean, cls, etc.) y normalizacion L2 para embeddings listos para busqueda.
- Multilingue limitado: aunque el modelo esta disenado principalmente para ingles, puede generalizar parcialmente a otros idiomas, pero sin garantias.

## Casos de uso

- Busqueda semantica en documentacion tecnica: integrar el modelo en un sitio web para permitir a los usuarios buscar en manuales o guias usando lenguaje natural, sin depender de palabras clave exactas. Gracias a su ejecucion en el cliente, la busqueda es instantanea y privada.
- Sistemas de recomendacion de contenido: calcular embeddings de articulos o productos y compararlos con el embedding de la consulta del usuario para sugerir elementos similares, todo en el navegador para reducir la carga del servidor.
- Chatbots con memoria semantica: almacenar embeddings de mensajes previos y recuperar los mas relevantes para dar contexto a un modelo generativo, mejorando la coherencia de las respuestas sin enviar todo el historial.
- Clasificacion de tickets de soporte: precalcular embeddings de categorias conocidas y clasificar nuevos tickets por similitud coseno, automatizando la asignacion a equipos.
- Deduplicacion de textos en aplicaciones de gestion de contenido: detectar articulos o comentarios duplicados comparando sus embeddings, ahorrando espacio y mejorando la calidad de los datos.
- Herramientas de analisis de encuestas abiertas: agrupar respuestas similares mediante clustering basado en embeddings, facilitando la identificacion de temas recurrentes sin leer cada respuesta.
- Aplicaciones de busqueda offline en dispositivos moviles: al ser un modelo ligero, puede ejecutarse en dispositivos con recursos limitados para proporcionar busqueda semantica local en aplicaciones de notas o libros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. El modelo original `BAAI/bge-small-en-v1.5` fue evaluado en el benchmark MTEB (Massive Text Embedding Benchmark) y obtuvo un rendimiento destacado entre los modelos de su tamano, aunque no se proporcionan cifras concretas en los resultados de busqueda. Para datos cuantitativos, se recomienda consultar la documentacion oficial del modelo base.

## Requisitos de hardware

- Al ser un modelo de embeddings pequeno (aproximadamente 24M de parametros, no confirmado), puede ejecutarse en CPU sin necesidad de GPU.
- En el navegador, requiere un dispositivo con soporte para WebAssembly (todos los navegadores modernos) y aproximadamente 0.5 GB de espacio para los pesos ONNX.
- En Node.js, funciona en cualquier maquina con al menos 1 GB de RAM libre.
- No requiere GPU para inferencia; la latencia tipica en CPU moderna es del orden de milisegundos por frase (no se proporcionan mediciones exactas).
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime, o cualquier framework que soporte ONNX (por ejemplo, Hugging Face Inference Endpoints con ONNX).
- Para aplicaciones de produccion a gran escala, se puede servir el modelo con ONNX Runtime Server o convertirlo a otros formatos (por ejemplo, OpenVINO) para optimizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JONNYVERSE/bge-small-en-v1.5 (ONNX) | no disponible (~24M) | no disponible (512) | 384 | no disponible | Hugging Face |
| BAAI/bge-small-en-v1.5 | ~24M | 512 | 384 | MIT | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | ~22M | 256 | 384 | Apache-2.0 | Hugging Face |
| BAAI/bge-base-en-v1.5 | ~109M | 512 | 768 | MIT | Hugging Face |

La comparativa se basa en conocimiento general de modelos similares, ya que la informacion proporcionada no incluye datos completos de la conversion. El modelo original es conocido por superar a all-MiniLM-L6-v2 en tareas de retrieval en ingles, pero no se dispone de numeros exactos en esta ficha.

## Limitaciones y advertencias

- Sesgos: como modelo entrenado principalmente con datos en ingles, puede reflejar sesgos culturales o linguisticos presentes en esos datos.
- Alucinacion: al ser un modelo de embeddings, no genera texto, por lo que no sufre de alucinacion en el sentido generativo. Sin embargo, los embeddings pueden ser insensibles a matices semanticos en frases ambiguas.
- Limitaciones de contexto: la longitud maxima de entrada es de 512 tokens (no confirmado en la informacion, pero es el valor del modelo original). Textos mas largos deben truncarse, lo que puede perder informacion.
- Idioma: optimizado para ingles; su rendimiento en otros idiomas puede ser significativamente inferior.
- Restricciones de licencia: la licencia de esta conversion no esta especificada, aunque el modelo original es MIT. Para uso comercial, se recomienda verificar los terminos del autor.
- Produccion: al ser una conversion ONNX sin cuantizacion, el tamaño del repo es de 0.5 GB, lo que puede ser pesado para descargas en navegadores lentos. Se recomienda considerar cuantizacion (por ejemplo, int8) para reducir el tamaño si es necesario.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/JONNYVERSE/bge-small-en-v1.5
- Modelo original BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Documentacion de BGE v1 y v1.5: https://bge-model.com/bge/bge_v1_v1.5.html
- Transformers.js: https://huggingface.co/docs/transformers.js
- Optimum (herramienta de conversion ONNX): https://huggingface.co/docs/optimum/index
