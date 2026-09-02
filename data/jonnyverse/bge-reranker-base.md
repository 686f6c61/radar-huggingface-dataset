# JONNYVERSE/bge-reranker-base

## Resumen

El modelo `JONNYVERSE/bge-reranker-base` es una conversión a formato ONNX del modelo original `BAAI/bge-reranker-base`, un cross-encoder de reranking desarrollado por el Beijing Academy of Artificial Intelligence (BAAI). Su propósito es puntuar la relevancia entre una consulta y un documento, reordenando los resultados devueltos por un sistema de recuperación (por ejemplo, un buscador basado en embeddings) para mejorar la precisión final en aplicaciones de búsqueda semántica y generación aumentada por recuperación (RAG).

La principal ventaja de esta versión es su compatibilidad con la librería Transformers.js, lo que permite ejecutar el modelo directamente en el navegador o en entornos Node.js sin necesidad de un servidor dedicado. El modelo base tiene una arquitectura de tipo XLM-RoBERTa (transformer encoder) con aproximadamente 278 millones de parámetros, aunque esta conversión no modifica el rendimiento original. Está pensado para funcionar con contextos de hasta 512 tokens y soporta inglés y chino, los idiomas originales del modelo BAAI.

Esta ficha es relevante para desarrolladores que buscan integrar reranking en aplicaciones JavaScript o que desean una alternativa ligera y fácil de desplegar para mejorar la calidad de sus pipelines de recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (transformer encoder) |
| Parametros totales | Aproximadamente 278 millones (no confirmado en la informacion disponible) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (tipico del modelo base, no confirmado en esta version) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles y chino (segun el modelo base) |
| Licencia | No disponible (el modelo base usa licencia MIT, pero esta version no la especifica) |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder, lo que significa que procesa simultáneamente la consulta y el documento como una única secuencia de entrada, en lugar de generar embeddings por separado como hacen los bi-encoders. La arquitectura subyacente es un transformer encoder similar a XLM-RoBERTa, que produce una puntuación de relevancia (logit) para cada par consulta-documento. El modelo original fue entrenado por BAAI con pares de documentos relevantes e irrelevantes, utilizando una pérdida de clasificación binaria (cross-entropy). No se dispone de detalles sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO. La conversión a ONNX no altera los pesos ni el comportamiento del modelo, solo cambia el formato para permitir su ejecución en entornos JavaScript mediante Transformers.js.

## Capacidades

- Reranking de documentos: puntúa la relevancia entre una consulta y un documento, permitiendo reordenar los resultados de una búsqueda inicial.
- Clasificación de pares: puede utilizarse como clasificador de texto para tareas de relevancia o similitud.
- Soporte multilingüe: funciona en inglés y chino, los idiomas originales del modelo base.
- Compatibilidad con Transformers.js: se puede ejecutar en navegador (WebGPU, WASM) o en Node.js sin infraestructura adicional.
- Integración sencilla: al ser un modelo ONNX, se puede cargar con la API de pipeline de Transformers.js para tareas de clasificación de texto.

## Casos de uso

- Mejora de pipelines RAG: tras recuperar los primeros 100 documentos con un modelo de embeddings, se usa este reranker para seleccionar los 3-5 más relevantes, aumentando la calidad de las respuestas generadas.
- Búsqueda semántica en aplicaciones web: al ejecutarse en el navegador, permite reordenar resultados de búsqueda en tiempo real sin enviar datos a un servidor, lo que reduce latencia y costes.
- Filtrado de documentos en sistemas de recomendación: puntúa candidatos para descartar irrelevantes antes de mostrarlos al usuario final.
- Chatbots con conocimiento interno: integrado en un asistente, mejora la selección de fragmentos de documentación para responder consultas de usuarios.
- Clasificación de pares pregunta-respuesta: se puede usar para validar si una respuesta es adecuada para una pregunta dada, útil en sistemas de QA.
- Automatización de procesos de moderación de contenido: clasifica si un texto es relevante para una categoría determinada, aunque requiere adaptación con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base (BAAI/bge-reranker-base) cuenta con métricas publicadas en la documentación oficial de BGE, pero esta conversión ONNX no incluye esos datos. Se recomienda consultar el repositorio original para obtener referencias de rendimiento.

## Requisitos de hardware

- Inferencia en CPU: viable para uso puntual o en lotes pequeños gracias a su tamaño moderado (aprox. 1 GB en pesos safetensors, aunque la versión ONNX puede ser mayor según la precisión).
- GPU: puede ejecutarse en GPUs con al menos 4 GB de VRAM si se usa una cuantización ligera, aunque no se especifican cuantizaciones disponibles.
- Navegador: requiere WebGPU o WASM para ejecución con Transformers.js; funciona en navegadores modernos (Chrome, Edge, Firefox).
- Opciones de despliegue: Transformers.js (navegador/Node.js), ONNX Runtime, y potencialmente vLLM o TGI si se convierte a otro formato, aunque no está documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| JONNYVERSE/bge-reranker-base (este) | ~278M | 512 | Ingles, chino | No disponible | ONNX |
| BAAI/bge-reranker-base (original) | ~278M | 512 | Ingles, chino | MIT | Safetensors |
| BAAI/bge-reranker-large | ~560M | 512 | Ingles, chino | MIT | Safetensors |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22M | 512 | Ingles | Apache 2.0 | Safetensors |

La comparativa se basa en datos públicos del modelo original y de alternativas conocidas. Este modelo destaca por su formato ONNX, que facilita su uso en entornos JavaScript, pero no ofrece diferencias de rendimiento respecto al original.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos en inglés y chino, puede presentar sesgos culturales o lingüísticos en otros idiomas.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar puntuaciones incorrectas si los datos de entrenamiento contienen ruido.
- Limitaciones de contexto: la longitud máxima de 512 tokens puede ser insuficiente para documentos largos; se recomienda truncar o dividir el texto.
- Restricciones de licencia: la licencia de esta versión no está especificada; antes de usar en producción, se debe verificar con el autor.
- Compatibilidad: aunque es compatible con Transformers.js, no se garantiza su funcionamiento en todos los navegadores o versiones de Node.js; se recomienda probar en el entorno objetivo.
- Dependencia del modelo base: cualquier limitación del modelo BAAI original se hereda en esta conversión.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/JONNYVERSE/bge-reranker-base
- Modelo base (BAAI/bge-reranker-base): https://huggingface.co/BAAI/bge-reranker-base
- Documentación oficial de BGE: https://bge-model.com/bge/bge_reranker.html
- Sitio de BAAI BGE: https://bge.baai.ac.cn/
- Página de PaddleNLP con detalles del modelo: https://paddlenlp.readthedocs.io/en/latest/_static/website/BAAI/bge-reranker-base/index.html
