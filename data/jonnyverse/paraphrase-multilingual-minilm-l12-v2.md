# JONNYVERSE/paraphrase-multilingual-MiniLM-L12-v2

## Resumen

El repositorio `JONNYVERSE/paraphrase-multilingual-MiniLM-L12-v2` contiene los pesos en formato ONNX del modelo de embeddings de frases `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, convertidos para su uso con la librería Transformers.js en entornos JavaScript y navegador. Este modelo, desarrollado originalmente por la comunidad Sentence-Transformers, genera representaciones vectoriales densas de 384 dimensiones para frases y párrafos, permitiendo tareas como búsqueda semántica, similitud textual y clustering en más de 50 idiomas.

La relevancia de esta conversión radica en que habilita la ejecución del modelo directamente en el navegador o en Node.js sin necesidad de infraestructura de servidor, lo que facilita el desarrollo de aplicaciones de procesamiento de lenguaje natural en el lado del cliente. El modelo base utiliza una arquitectura BERT con 12 capas y una ventana de contexto de 128 tokens, lo que lo hace ligero y adecuado para dispositivos con recursos limitados.

Aunque el repositorio no aporta documentación adicional más allá de la instrucción de uso, se trata de una adaptación técnica de un modelo ya consolidado en el ecosistema de embeddings multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) con 12 capas y salida de 384 dimensiones |
| Parametros totales | no disponible (el modelo base MiniLM-L12 tiene aproximadamente 118 millones, pero no se confirma en este repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos ONNX, posiblemente en FP32, pero no se especifica) |
| Idiomas soportados | Multilingüe (el modelo base declara más de 50 idiomas, pero este repositorio no detalla la lista) |
| Licencia | no disponible (el modelo base se distribuye bajo Apache 2.0, pero este repositorio no indica licencia) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base `paraphrase-multilingual-MiniLM-L12-v2` es un modelo de tipo encoder basado en la arquitectura MiniLM, que a su vez es una variante optimizada de BERT. Emplea 12 capas transformer con una dimensión oculta de 384 y una salida de embeddings de 384 dimensiones mediante una operación de pooling media sobre los tokens. El entrenamiento se realizó con pares de frases parafraseadas en múltiples idiomas, utilizando un enfoque de aprendizaje siamés para que frases semánticamente equivalentes produzcan representaciones vectoriales cercanas en el espacio de embeddings.

Este repositorio concreto no aporta información sobre datos de entrenamiento ni técnicas de optimización adicionales; se limita a proporcionar los pesos convertidos a ONNX mediante la herramienta Optimum de Hugging Face. La conversión no modifica la arquitectura ni los pesos, solo el formato de serialización para hacerlos compatibles con Transformers.js.

## Capacidades

- Extracción de características: genera un vector denso de 384 dimensiones para cualquier frase o texto de hasta 128 tokens.
- Similitud semántica: permite calcular la similitud coseno entre dos textos para determinar su proximidad semántica.
- Búsqueda semántica: al indexar documentos con embeddings, se pueden recuperar los más relevantes por consulta en lenguaje natural.
- Clustering: los embeddings pueden agruparse para detectar temas o duplicados en colecciones de texto.
- Multilingüe: el modelo base soporta más de 50 idiomas, aunque este repositorio no especifica la lista exacta.
- Inferencia en navegador: gracias a la conversión ONNX, el modelo puede ejecutarse en el cliente con Transformers.js, sin servidor.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales o artículos y permitir consultas en varios idiomas, devolviendo los pasajes más relevantes según la similitud de embeddings.
- Sistemas de recomendación de contenido: representar artículos o productos mediante embeddings y sugerir elementos similares por proximidad vectorial.
- Deduplicación de textos: en bases de datos de soporte o foros, agrupar mensajes duplicados o parafraseados comparando sus embeddings.
- Clasificación de texto con pocos datos: usar los embeddings como características de entrada para un clasificador ligero (por ejemplo, regresión logística) sin necesidad de fine-tuning.
- Análisis de sentimiento multilingüe: generar embeddings de reseñas o comentarios y alimentar un modelo de clasificación entrenado sobre representaciones fijas.
- Chatbots y asistentes con conocimiento interno: recuperar respuestas de una base de conocimiento mediante búsqueda semántica antes de generar una respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. El modelo base original reporta métricas en tareas de parafraseo y búsqueda semántica, pero estos datos no se incluyen aquí. Se recomienda consultar la ficha del modelo `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` para obtener cifras de rendimiento en tareas específicas.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 118 millones de parámetros (estimación basada en MiniLM-L12), puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- En GPU, requiere menos de 1 GB de VRAM en FP32, y menos aún con cuantización (por ejemplo, FP16 o INT8).
- Es adecuado para dispositivos con recursos limitados, como portátiles o incluso navegadores móviles, gracias al formato ONNX y la optimización de Transformers.js.
- Opciones de despliegue: Transformers.js para JavaScript/Node.js, así como los entornos habituales de Python (transformers, sentence-transformers) si se cargan los pesos originales.
- La latencia en CPU para una frase típica (menos de 50 tokens) suele ser de decenas de milisegundos, aunque no se dispone de mediciones oficiales para esta versión ONNX.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks para comparar directamente este modelo con alternativas. Sin embargo, a nivel de características generales, se puede contextualizar con otros modelos de embeddings multilingües de tamaño similar:

| Modelo | Dimensiones | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| paraphrase-multilingual-MiniLM-L12-v2 (este) | 384 | 128 | 50+ | no disponible | ONNX |
| multilingual-e5-small | 384 | 512 | 100+ | MIT | safetensors |
| distiluse-base-multilingual-cased | 768 | 512 | 50+ | Apache 2.0 | safetensors |
| paraphrase-multilingual-mpnet-base-v2 | 768 | 128 | 50+ | Apache 2.0 | safetensors |

Nota: los datos de las alternativas provienen de conocimiento general y pueden no estar actualizados. La comparativa es orientativa, no se basa en mediciones propias.

## Limitaciones y advertencias

- Ventana de contexto limitada a 128 tokens: no es adecuado para procesar documentos largos o párrafos extensos sin truncar.
- El modelo está diseñado para generar embeddings, no para generar texto ni responder preguntas de forma autónoma.
- Posibles sesgos en idiomas de bajos recursos: aunque es multilingüe, el rendimiento puede degradarse en lenguas con menos representación en los datos de entrenamiento.
- La licencia no está especificada en este repositorio; antes de usar el modelo en producción, es necesario verificar la licencia del modelo base (Apache 2.0 según su ficha) y cumplir con sus términos.
- La conversión ONNX no incluye cuantizaciones predefinidas; si se requiere optimización de memoria, habrá que convertir o cuantizar los pesos manualmente.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/JONNYVERSE/paraphrase-multilingual-MiniLM-L12-v2
- Modelo base original: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Repositorio ONNX alternativo: https://huggingface.co/onnx-models/paraphrase-multilingual-MiniLM-L12-v2-onnx
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Guía de Optimum para conversión a ONNX: https://huggingface.co/docs/optimum/index
