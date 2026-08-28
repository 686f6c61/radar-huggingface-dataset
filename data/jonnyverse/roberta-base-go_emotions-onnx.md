# JONNYVERSE/roberta-base-go_emotions-onnx

## Resumen

El modelo `JONNYVERSE/roberta-base-go_emotions-onnx` es una conversión al formato ONNX del clasificador de emociones `SamLowe/roberta-base-go_emotions`, desarrollado originalmente a partir de la arquitectura RoBERTa base y entrenado sobre el dataset GoEmotions, que contiene comentarios en inglés de Reddit etiquetados con 27 emociones más la clase neutral. Esta versión ONNX está pensada para acelerar la inferencia en entornos de producción, especialmente en CPU, mediante el uso de ONNXRuntime y la opción de cuantización INT8 que reduce el tamaño del modelo a una cuarta parte sin pérdida significativa de precisión.

El modelo resuelve el problema de clasificación de emociones en texto, una tarea de procesamiento del lenguaje natural útil para análisis de sentimiento, moderación de contenido y estudio de reacciones de usuarios. Su relevancia actual radica en que ofrece una alternativa optimizada y ligera para desplegar este tipo de clasificadores en aplicaciones reales, con un formato estándar (ONNX) compatible con múltiples frameworks y runtime.

La arquitectura subyacente es RoBERTa base, un transformer encoder con 12 capas y aproximadamente 125 millones de parámetros, aunque esta cifra no se detalla en la ficha del autor. El modelo admite una longitud de contexto estándar de 512 tokens, pero este dato tampoco se especifica en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (encoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (estandar RoBERTa: 512 tokens, no confirmado) |
| Tipos de cuantizacion | FP32 (full precision) e INT8 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (onnx/model.onnx y onnx/model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint original `SamLowe/roberta-base-go_emotions` al formato ONNX, realizada con la libreria Optimum. La arquitectura es la de RoBERTa base, un transformer encoder con 12 capas, 12 cabezales de atencion y una dimension de embedding de 768. El modelo original fue entrenado sobre el dataset GoEmotions, que contiene comentarios de Reddit etiquetados con 27 emociones y una clase neutral, en un esquema de clasificacion multi-etiqueta (una misma frase puede expresar varias emociones simultaneamente).

No se proporcionan detalles sobre el proceso de entrenamiento (numero de tokens, uso de RLHF o DPO, etc.) en la informacion disponible. La conversion a ONNX no modifica los pesos, por lo que las metricas de la version full precision son identicas a las del modelo Transformers original. La version cuantizada INT8 se obtiene mediante cuantizacion post-entrenamiento, reduciendo el tamaño de 499 MB a 125 MB con una perdida minima de rendimiento.

## Capacidades

- Clasificacion de emociones en texto en ingles, con 28 etiquetas posibles (27 emociones + neutral).
- Soporte multi-etiqueta: una misma frase puede activar varias emociones simultaneamente.
- Inferencia rapida en CPU gracias a ONNXRuntime, especialmente con lotes pequenos (batch size 1).
- Version cuantizada INT8 que mantiene casi la misma precision que la version full precision.
- Compatible con la libreria Optimum de Hugging Face, permitiendo usar las clases ORTModelForSequenceClassification y el pipeline de transformers.
- Integrable directamente con ONNXRuntime mediante tokenizacion previa con la libreria tokenizers.

## Casos de uso

- Analisis de sentimiento en redes sociales: el modelo puede clasificar comentarios de Twitter, Reddit o foros en multiples emociones, permitiendo medir la reaccion del publico ante un producto, evento o noticia. Su rapida inferencia en CPU lo hace adecuado para procesar grandes volumenes de texto en tiempo real.
- Moderacion de contenido: detectar automaticamente mensajes que expresan ira, disgusto o miedo para priorizar su revision humana, reduciendo la carga de los moderadores en plataformas de contenido generado por usuarios.
- Atencion al cliente automatizada: clasificar las emociones de los mensajes de soporte para derivarlos al equipo adecuado o adaptar la respuesta automatica, mejorando la experiencia del usuario. La multi-etiqueta permite capturar matices como "frustracion" junto con "confusion".
- Investigacion en psicologia y ciencias sociales: analizar corpus de textos (entrevistas, diarios, foros) para estudiar la distribucion de emociones en diferentes poblaciones o contextos, gracias a la granularidad de las 28 etiquetas.
- Analisis de feedback de productos: procesar resenas de clientes para identificar emociones como "decepcion", "gratitud" o "alegria", ayudando a priorizar mejoras o detectar problemas de calidad.
- Sistemas de recomendacion de contenido: clasificar las reacciones emocionales de los usuarios ante articulos o videos para personalizar la experiencia, mostrando contenido que genere emociones positivas o evitando el que cause rechazo.

## Benchmarks y rendimiento

La model card proporciona metricas para ambas versiones del modelo, calculadas con un umbral fijo de 0.5 para convertir las puntuaciones en predicciones binarias por etiqueta:

| Version | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| Full precision (FP32) | 0.474 | 0.575 | 0.396 | 0.450 |
| Cuantizada INT8 | 0.475 | 0.582 | 0.398 | 0.447 |

Estas metricas son practicamente identicas entre ambas versiones, lo que demuestra que la cuantizacion INT8 apenas degrada el rendimiento. No se han publicado comparaciones con otros modelos de clasificacion de emociones en la informacion disponible.

## Requisitos de hardware

- El modelo full precision pesa 499 MB y la version INT8 125 MB, por lo que puede ejecutarse en CPU sin necesidad de GPU.
- En pruebas del autor, la inferencia con ONNXRuntime en una CPU de 8 nucleos (Intel i7 de 11ª generacion) es de 2 a 3 veces mas rapida que el modelo Transformers original para batch size 1, y la version INT8 es aproximadamente 5 veces mas rapida que el Transformers original.
- No requiere VRAM especifica al ejecutarse en CPU, pero si se desea usar GPU, el modelo es lo suficientemente pequeno para caber en cualquier GPU moderna (incluso con 4 GB de VRAM).
- Opciones de despliegue: ONNXRuntime, libreria Optimum, pipeline de transformers, o integracion en servidores de inferencia como Triton o FastAPI.
- La latencia estimada en CPU para una sola frase es de unos pocos milisegundos, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo original `SamLowe/roberta-base-go_emotions` es la referencia directa, y esta version ONNX es su equivalente optimizado. Otros clasificadores de emociones como `bhadresh-savani/roberta-base-go_emotions` o `cardiffnlp/twitter-roberta-base-sentiment-latest` existen, pero no se han incluido datos comparativos en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con comentarios de Reddit en ingles, por lo que puede no generalizar bien a otros registros, idiomas o culturas.
- Las metricas reportadas son modestas (F1 de 0.45), lo que indica que la clasificacion de emociones es inherentemente dificil y que el modelo puede cometer errores, especialmente con textos ambiguos o ironicos.
- Al ser un modelo multi-etiqueta, se recomienda ajustar el umbral de decision por etiqueta para maximizar F1 u otras metricas, como se menciona en la model card del modelo original.
- La version cuantizada INT8 puede presentar ligeras variaciones en las puntuaciones, aunque las metricas globales son casi identicas.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo hereda los sesgos del dataset GoEmotions, que puede contener lenguaje ofensivo o sesgos de genero, raza o edad.
- No se ha verificado el comportamiento del modelo en produccion a gran escala; se recomienda realizar pruebas adicionales con datos propios antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JONNYVERSE/roberta-base-go_emotions-onnx
- Modelo original de SamLowe: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Repositorio de referencia con la misma conversion: https://github.com/berat639/roberta-base-go_emotions-onnx
- Documentacion de Optimum ONNX Runtime: https://huggingface.co/docs/optimum/onnxruntime/overview
