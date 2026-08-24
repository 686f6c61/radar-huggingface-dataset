# nsagatov1/youtube-video-relevance-classifier

## Resumen

El modelo `nsagatov1/youtube-video-relevance-classifier` es un clasificador de texto diseñado para evaluar la relevancia de vídeos de YouTube en relación con una consulta o contexto dado. Desarrollado por el usuario nsagatov1, se basa en el cross-encoder multilingüe `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, un modelo compacto de la familia MiniLMv2 con 12 capas y 384 dimensiones de embedding, optimizado para tareas de retrieval y clasificación. El modelo se distribuye con la librería `transformers.js`, lo que indica que está preparado para ejecutarse directamente en el navegador o en entornos JavaScript, facilitando su integración en aplicaciones web.

La relevancia de este modelo radica en su capacidad para filtrar y priorizar contenido de vídeo en inglés y ruso, dos idiomas con gran volumen de contenido en YouTube. Aunque no se han publicado detalles sobre el proceso de fine-tuning ni métricas de rendimiento, su arquitectura ligera y su licencia Apache 2.0 lo convierten en una opción accesible para desarrolladores que necesiten una solución de clasificación de relevancia sin depender de servicios externos. El modelo está pensado para tareas de productividad y análisis web, como la organización de listas de reproducción, la moderación de comentarios o la mejora de sistemas de recomendación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en MiniLMv2 (L12-H384) |
| Parametros totales | no disponible (el modelo base tiene aproximadamente 118M, pero no se confirma) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (librería: transformers.js) |

## Arquitectura y entrenamiento

El modelo se construye sobre `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, un cross-encoder multilingüe entrenado originalmente para tareas de retrieval sobre el dataset mMARCO. A diferencia de los bi-encoders, un cross-encoder procesa conjuntamente el par (consulta, documento) a través de la red, lo que permite capturar interacciones finas entre ambos textos y produce puntuaciones de relevancia más precisas, aunque con mayor coste computacional por par. La arquitectura MiniLMv2 emplea atención profunda y comparte parámetros entre capas, lo que reduce el tamaño del modelo sin sacrificar demasiado rendimiento.

El fine-tuning específico para clasificación de relevancia de vídeos de YouTube no está documentado en la model card. No se especifican los datos de entrenamiento, el número de épocas, ni si se utilizaron técnicas como RLHF o DPO. Dado que el pipeline es `text-classification`, se asume que el modelo produce una puntuación o etiqueta de relevancia (por ejemplo, relevante/no relevante) para un par consulta-vídeo. La elección de `transformers.js` sugiere que el modelo fue convertido a un formato optimizado para ejecución en navegador, probablemente ONNX o WebAssembly, aunque no se confirma.

## Capacidades

- Clasificación de relevancia entre una consulta textual y un vídeo de YouTube (título, descripción o transcripción).
- Soporte multilingüe para inglés y ruso, gracias al modelo base entrenado en mMARCO.
- Ejecución en navegador o entornos Node.js mediante `transformers.js`, sin necesidad de servidor dedicado.
- Inferencia de baja latencia al ser un modelo compacto (12 capas, 384 dimensiones).
- Integración sencilla con pipelines de Hugging Face para clasificación de texto.
- Posibilidad de uso como filtro en sistemas de recomendación o búsqueda de vídeos.

## Casos de uso

- Filtrado de recomendaciones de YouTube: el modelo puede evaluar si un vídeo sugerido es relevante para el historial o intereses del usuario, permitiendo descartar contenido irrelevante antes de mostrarlo.
- Moderación de comentarios: clasificar si un comentario es relevante para el tema del vídeo, ayudando a priorizar respuestas o detectar spam.
- Organización automática de listas de reproducción: dado un tema o consulta, el modelo puntúa la relevancia de cada vídeo de una lista y los reordena según su pertinencia.
- Búsqueda interna de vídeos en plataformas educativas: permite filtrar resultados de búsqueda por relevancia semántica en inglés y ruso, mejorando la precisión frente a búsquedas por palabras clave.
- Análisis de competencia en marketing: clasificar vídeos de la competencia según su relevancia para un nicho concreto, ayudando a identificar contenido que debe replicarse o superarse.
- Asistente personal de productividad: en una extensión de navegador, el modelo puede resumir o etiquetar vídeos abiertos según su relevancia para la tarea actual del usuario, reduciendo distracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, recall, F1 ni comparaciones con otros modelos en tareas de clasificación de relevancia de vídeos.

## Requisitos de hardware

- Al ser un modelo pequeño (MiniLMv2 L12-H384), puede ejecutarse en CPU sin necesidad de GPU.
- VRAM estimada: inferior a 1 GB en cuantización FP32; con cuantización INT8 podría reducirse a ~200 MB, aunque no se confirman los formatos disponibles.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, aunque no es necesaria para inferencia básica.
- Es apto para ejecución en navegador mediante `transformers.js`, lo que elimina requisitos de hardware específicos en el cliente.
- Opciones de despliegue: `transformers.js` (navegador/Node.js), Hugging Face Inference Endpoints, o servidores con `onnxruntime` si se convierte el modelo.
- Latencia estimada: en CPU moderna, inferencia de un par consulta-vídeo en el orden de milisegundos (típico para modelos de este tamaño), aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para clasificación de relevancia de vídeos de YouTube. El modelo base `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` es un cross-encoder multilingüe de propósito general, y otros cross-encoders como `cross-encoder/ms-marco-MiniLM-L-6-v2` (solo inglés) o `cross-encoder/mmarco-mMiniLMv2-L6-H384-v1` (versión más pequeña) podrían servir como alternativas, pero no se han publicado comparativas con este fine-tuning concreto.

## Limitaciones y advertencias

- No se documentan los datos de entrenamiento ni el proceso de fine-tuning, por lo que se desconoce la calidad del ajuste para dominios específicos.
- El modelo solo cubre inglés y ruso; no soporta otros idiomas.
- Al ser un clasificador de relevancia, puede presentar sesgos derivados de los datos de entrenamiento del modelo base (mMARCO), que provienen de búsquedas web y pueden reflejar sesgos culturales o de contenido.
- Riesgo de alucinación en la puntuación de relevancia: el modelo puede asignar puntuaciones altas a vídeos que no son realmente relevantes si la consulta es ambigua o el vídeo tiene metadatos engañosos.
- No se especifica la longitud máxima de contexto; los cross-encoders suelen limitarse a 512 tokens, por lo que descripciones o transcripciones largas podrían truncarse.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de un modelo base con su propia licencia (mMARCO, también Apache-2.0), no hay restricciones adicionales conocidas.
- Para producción, se recomienda validar el rendimiento con datos propios antes de desplegarlo, dado que no hay benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nsagatov1/youtube-video-relevance-classifier
- Modelo base: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
