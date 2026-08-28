# JONNYVERSE/distilbert-base-uncased-finetuned-sst-2-english

## Resumen

Este modelo es una conversión a formato ONNX del checkpoint `distilbert-base-uncased-finetuned-sst-2-english`, publicada por el usuario JONNYVERSE para su uso con la librería Transformers.js. Se trata de un clasificador de texto binario (positivo/negativo) basado en DistilBERT, un transformer encoder destilado de BERT, fine-tuneado sobre el dataset SST-2 (Stanford Sentiment Treebank). El objetivo de esta versión es permitir la ejecución del modelo directamente en el navegador o en entornos JavaScript, sin necesidad de un backend Python. La relevancia actual radica en la creciente demanda de modelos ligeros y desplegables en el edge, especialmente para análisis de sentimiento en tiempo real en aplicaciones web. El repositorio contiene los pesos ONNX (1.7 GB) y está diseñado para ser cargado mediante el pipeline de Transformers.js. No se proporcionan detalles sobre licencia, idiomas ni parámetros específicos en la ficha original, aunque el modelo base es de dominio público bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una conversión directa a ONNX del checkpoint original `distilbert-base-uncased-finetuned-sst-2-english`, que a su vez es un fine-tune de DistilBERT-base-uncased sobre el dataset SST-2. DistilBERT es una versión destilada de BERT con la misma arquitectura de transformer encoder pero con la mitad de capas (6 en lugar de 12) y un 40% menos de parámetros, manteniendo un rendimiento cercano al original. El fine-tune se realizó para clasificación de sentimientos binaria (positivo/negativo) sobre SST-2, alcanzando una accuracy de 91.3 en el conjunto de desarrollo, frente al 92.7 de BERT base. La conversión a ONNX se realizó con la herramienta Optimum de Hugging Face, siguiendo las recomendaciones para compatibilidad con Transformers.js. No se dispone de información adicional sobre el proceso de entrenamiento (número de épocas, batch size, etc.) en la documentación proporcionada.

## Capacidades

- Clasificación de sentimientos binaria: asigna una etiqueta `POSITIVE` o `NEGATIVE` a un texto, junto con una puntuación de confianza.
- Análisis de opiniones en textos cortos: adecuado para reseñas, comentarios, tweets, etc.
- Inferencia en el navegador: gracias al formato ONNX y la integración con Transformers.js, puede ejecutarse en clientes web sin servidor.
- Soporte para devolver todas las clases con `top_k: null`, lo que permite obtener probabilidades completas.
- No soporta tool calling, generación de texto libre, ni capacidades multimodales.

## Casos de uso

- Análisis de sentimiento en tiempo real en aplicaciones web: el modelo puede integrarse en un frontend con Transformers.js para clasificar comentarios de usuarios al instante, sin enviar datos a un servidor externo.
- Moderación de comentarios: permite detectar automáticamente mensajes negativos o tóxicos en foros, blogs o redes sociales, activando alertas o filtros.
- Análisis de reseñas de productos: en tiendas online, se puede clasificar la valoración implícita de una reseña (positiva o negativa) para generar métricas agregadas.
- Monitorización de redes sociales: procesar flujos de tweets o publicaciones para medir la opinión pública sobre una marca o evento.
- Asistentes de atención al cliente: clasificar la intención o el tono de los mensajes entrantes para priorizar respuestas o derivar a un agente humano.
- Prototipado rápido en JavaScript: al ser un modelo pequeño y compatible con Node.js, se puede usar en scripts de automatización o en pipelines de datos ligeros.

## Benchmarks y rendimiento

El modelo base (no la versión ONNX) reporta una accuracy de 91.3 en el conjunto de desarrollo de SST-2, según la documentación oficial. La versión ONNX debería mantener el mismo rendimiento, ya que la conversión no altera los pesos. No se han publicado otros benchmarks específicos para esta conversión.

| Modelo | Accuracy en SST-2 (dev) |
|---|---|
| DistilBERT fine-tuned SST-2 (este modelo) | 91.3 |
| BERT base uncased fine-tuned SST-2 | 92.7 |

## Requisitos de hardware

- Al ser un modelo transformer encoder pequeño (DistilBERT base), puede ejecutarse en CPU sin problemas, incluso en dispositivos de gama baja.
- En el navegador, Transformers.js utiliza WebAssembly o WebGPU para acelerar la inferencia; no se requiere GPU dedicada.
- El tamaño del repositorio es de 1.7 GB, pero los pesos ONNX pueden cargarse de forma diferida; el consumo de memoria en tiempo de ejecución es inferior a 1 GB en la mayoría de los casos (estimación razonable, no confirmada en la documentación).
- Para despliegue en servidores, puede usarse con ONNX Runtime o con el backend de Transformers.js en Node.js. No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| JONNYVERSE/distilbert-base-uncased-finetuned-sst-2-english (este) | DistilBERT | no disponible | no disponible | no disponible | ONNX |
| distilbert-base-uncased-finetuned-sst-2-english (original) | DistilBERT | 66M (conocido públicamente) | 512 (conocido públicamente) | Apache 2.0 | PyTorch |
| bert-base-uncased (fine-tuned SST-2) | BERT | 110M | 512 | Apache 2.0 | PyTorch |

La versión ONNX es funcionalmente idéntica al modelo original, pero optimizada para entornos JavaScript. BERT base es más grande y pesado, pero ofrece una accuracy ligeramente superior (92.7 vs 91.3).

## Limitaciones y advertencias

- El modelo fue entrenado únicamente en inglés (SST-2), por lo que su rendimiento en otros idiomas será deficiente o nulo.
- Al ser un clasificador binario, no distingue matices como sentimiento neutral o emociones complejas.
- Puede presentar sesgos derivados del dataset de entrenamiento, como sobre-representación de ciertos dominios (reseñas de películas) o lenguaje informal.
- Existe riesgo de alucinación en textos ambiguos o con sarcasmo, aunque al ser una tarea de clasificación el impacto es menor que en generación.
- La licencia no está especificada en el repositorio, aunque el modelo base es Apache 2.0; se recomienda verificar antes de uso comercial.
- No se proporcionan garantías de soporte o mantenimiento por parte del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JONNYVERSE/distilbert-base-uncased-finetuned-sst-2-english
- Modelo base original: https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Herramienta de conversión Optimum: https://huggingface.co/docs/optimum/index
