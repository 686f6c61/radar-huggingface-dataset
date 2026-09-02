# JONNYVERSE/ms-marco-TinyBERT-L-2-v2

## Resumen

El modelo `JONNYVERSE/ms-marco-TinyBERT-L-2-v2` es una conversión a formato ONNX del cross-encoder `cross-encoder/ms-marco-TinyBERT-L2-v2`, realizada para que sea compatible con la librería Transformers.js y pueda ejecutarse directamente en el navegador o en entornos JavaScript. Se trata de un modelo de clasificación de secuencias (text-classification) especializado en tareas de recuperación de información: dado un par (consulta, pasaje), produce una puntuación de relevancia que permite ordenar documentos.

El modelo original fue entrenado por el equipo de Cross-Encoder sobre el dataset MS Marco Passage Ranking, una de las referencias estándar en búsqueda semántica. Su arquitectura se basa en TinyBERT-L2, una versión compacta de BERT con solo dos capas de encoder, lo que lo convierte en una opción extremadamente ligera para escenarios donde la latencia y el consumo de recursos son críticos, como la ejecución en cliente web o en dispositivos con poca capacidad de cómputo.

Esta versión ONNX no añade capacidades nuevas al modelo original, pero elimina la barrera de despliegue al permitir su uso desde JavaScript sin necesidad de un servidor Python. Es relevante para desarrolladores que quieren integrar búsqueda semántica o re-ranking en aplicaciones web, extensiones de navegador o herramientas de escritorio basadas en Node.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (TinyBERT-L2, cross-encoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tipicamente 512 tokens para BERT, no confirmado) |
| Tipos de cuantizacion | ONNX quantized y unquantized (segun ejemplo de uso) |
| Idiomas soportados | no disponible (el modelo base fue entrenado con datos en ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (subcarpeta `onnx`) |

## Arquitectura y entrenamiento

El modelo base `cross-encoder/ms-marco-TinyBERT-L2-v2` es un cross-encoder basado en TinyBERT, una variante destilada de BERT con dos capas de encoder y dimensiones ocultas reducidas. A diferencia de los bi-encoders, que generan embeddings independientes para consulta y pasaje, un cross-encoder procesa el par concatenado como una única secuencia y emite un valor de relevancia mediante una cabeza de clasificación binaria. Esto proporciona mayor precisión que los bi-encoders, a costa de una latencia mayor al tener que evaluar cada par por separado.

El entrenamiento se realizó sobre la tarea MS Marco Passage Ranking, donde el modelo aprende a puntuar la relevancia de un pasaje respecto a una consulta. Los detalles exactos del proceso (número de tokens, uso de RLHF o DPO) no están disponibles en la información proporcionada. La conversión a ONNX se hizo con la herramienta Optimum de Hugging Face, dando lugar a pesos quantizados y no quantizados que permiten elegir entre tamaño y precisión.

## Capacidades

- Clasificación de pares (consulta, pasaje) para obtener una puntuación de relevancia.
- Re-ranking de documentos: dado un conjunto de pasajes candidatos, ordena según su similitud con la consulta.
- Recuperación de información en pipelines de búsqueda híbrida (BM25 + re-ranking).
- Ejecución en navegador o Node.js mediante Transformers.js, sin servidor dedicado.
- Soporte de cuantización para reducir el tamaño del modelo y acelerar la inferencia en CPU.
- No es generativo: no produce texto, solo scores numéricos.

## Casos de uso

- Re-ranking de resultados de búsqueda en una aplicación web: el modelo recibe los primeros 10-20 resultados de un motor de búsqueda clásico y los reordena según su relevancia semántica, mejorando la precisión sin necesidad de un backend pesado.
- Búsqueda semántica en documentación técnica: un sitio de documentación puede usar este modelo para puntuar pasajes relevantes a una consulta del usuario, mostrando las secciones más útiles primero.
- Chatbots de soporte con recuperación de conocimiento: antes de generar una respuesta, se recuperan pasajes de una base de conocimiento y se re-rankear con este cross-encoder para seleccionar el contexto más adecuado.
- Sistemas de preguntas y respuestas (QA): dada una pregunta y una lista de pasajes candidatos, el modelo identifica cuál contiene la respuesta, como etapa previa a un extractor de respuestas.
- Filtrado de documentos en motores de recomendación: puntuar la relevancia de artículos o noticias respecto a un perfil de interés expresado como consulta.
- Demostraciones educativas de recuperación de información: al ser ligero y ejecutable en el navegador, es ideal para prototipos y tutoriales interactivos de búsqueda semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original, `cross-encoder/ms-marco-TinyBERT-L2-v2`, reporta un MRR@10 de aproximadamente 0.33 en el test set de MS Marco, pero estos datos no están confirmados en la documentación proporcionada y no deben tomarse como oficiales.

## Requisitos de hardware

- Modelo muy ligero: el repositorio ocupa 0.1 GB, por lo que cabe en cualquier dispositivo con unos pocos cientos de MB de RAM.
- Puede ejecutarse en CPU sin GPU; la inferencia de un solo par es del orden de milisegundos en un procesador moderno.
- En navegador, funciona con WebAssembly mediante Transformers.js, sin necesidad de aceleración por hardware.
- En Node.js, se puede usar con ONNX Runtime para CPU o WebGPU si se desea aceleración.
- No requiere GPU dedicada; es adecuado para entornos serverless, dispositivos móviles y aplicaciones de escritorio.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas como `cross-encoder/ms-marco-MiniLM-L-6-v2` u otros cross-encoders de MS Marco. Los parámetros, contexto y rendimiento exactos de estos modelos no están incluidos en la documentación proporcionada. Se recomienda consultar las fichas oficiales de cada modelo para una comparación detallada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones; al ser un modelo de clasificación, no genera texto, por lo que el riesgo de alucinación es bajo, pero la puntuación puede ser incorrecta para consultas fuera de dominio.
- El modelo fue entrenado con datos en inglés (MS Marco), por lo que su rendimiento en otros idiomas puede ser deficiente.
- La longitud de contexto no está documentada en esta versión; se asume el límite típico de BERT (512 tokens), pero no está confirmado.
- La licencia no está especificada en el repositorio, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor o consultar la licencia del modelo base.
- Al ser un cross-encoder, no es eficiente para recuperar sobre colecciones grandes directamente; debe usarse en combinación con un recuperador inicial (bi-encoder o BM25).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/JONNYVERSE/ms-marco-TinyBERT-L-2-v2
- Modelo base original: https://huggingface.co/cross-encoder/ms-marco-TinyBERT-L2-v2
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Página del modelo en Microsoft Foundry: https://ai.azure.com/catalog/models/cross-encoder-ms-marco-tinybert-l-2-v2
