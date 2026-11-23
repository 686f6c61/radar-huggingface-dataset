# cuecaps/caption-tagger

## Resumen

Cuecaps caption tagger es un modelo de clasificación de tokens (token classification) desarrollado por cuecaps, pensado para asistir en la edición automática de subtítulos y rótulos de vídeo. Se trata de un fine-tuning de `prajjwal1/bert-mini` (4 capas, 256 dimensiones ocultas) que, para cada palabra de una transcripción, predice cuatro decisiones editoriales: si la palabra lleva énfasis, si debe terminar un rótulo, qué signo de puntuación la sigue y si empieza con mayúscula. El modelo pesa 11,7 MB y está exportado a ONNX para ejecutarse en el navegador mediante transformers.js.

El problema que resuelve es concreto: los editores de subtítulos para vídeo corto (Shorts, Reels, TikTok) deben decidir manualmente qué palabra resaltar, dónde cortar la línea y cómo puntuar un texto transcrito sin puntuación. Las heurísticas escritas a mano rendían mal en estas tareas (F1 de 0,381 en énfasis y 0,519 en cortes sobre datos reales), y este modelo mejora ambas métricas sobre el mismo conjunto de evaluación.

Es relevante por su enfoque *on-device*: toda la inferencia ocurre en el dispositivo del usuario, sin subir transcripciones a un servidor. La versión publicada es la v2 del modelo que alimenta el estudio de subtítulos de cuecaps.com, que según la model card ejecuta versiones más recientes. La licencia es Apache 2.0 y el único idioma soportado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (bert-mini: 4 capas, 256 dimensiones ocultas) con cabeza de clasificación de tokens |
| Parámetros totales | no disponible (base bert-mini; el repo pesa 11,7 MB en ONNX) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 palabras por pasada; ventanas solapadas de 96 con stride 64 para transcripciones más largas |
| Tipos de cuantización | q8 (int8) en la demo; el repo incluye pesos ONNX |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js); repo de 0,0 GB según Hugging Face |

## Arquitectura y entrenamiento

El modelo parte de `prajjwal1/bert-mini`, una miniatura de BERT de Google (Turc et al., 2019) con 4 capas y 256 dimensiones ocultas, y se fine-tunea como clasificador de tokens con 8 logits por palabra. La entrada se construye codificando cada palabra por separado, concatenando las piezas entre `[CLS]` y `[SEP]` y conservando la posición del primer sub-token de cada palabra; las predicciones se leen en esa posición. De los 8 logits, el índice 0 (énfasis) se activa con sigmoide, el 1 (corte de rótulo) con sigmoide, el 2 (mayúscula inicial) con sigmoide y los índices 3 a 7 (ninguna puntuación, coma, punto, interrogación, exclamación) con softmax.

El entrenamiento duró tres épocas sobre una RTX 4070 Ti SUPER, en unos 15 minutos. Los datos combinan dos fuentes: 6.420 guiones de vídeo corto redactados y segmentados en líneas de rótulo por un modelo profesor de 2B (LFM3-Omni-2B), que enseñan cortes, puntuación y mayúsculas; y el Helsinki Prosody Corpus (Talman et al., 2019, CC BY 4.0), con 139.000 frases de habla leída de LibriTTS con prominencia medida desde el audio, que enseña énfasis. Se considera enfatizada la palabra más prominente de cada ocho, para igualar la rareza del énfasis en subtítulos reales. La model card no menciona RLHF ni DPO.

## Capacidades

- Predicción de énfasis por palabra (qué término resaltar en un rótulo palabra a palabra).
- Predicción de cortes de rótulo (dónde termina un subtítulo y empieza el siguiente).
- Restauración de puntuación en transcripciones sin puntuar: coma, punto, interrogación, exclamación o ninguna.
- Predicción de mayúscula inicial por palabra.
- Inferencia en navegador mediante transformers.js con pesos ONNX cuantizados a int8 y backend WASM.
- Procesamiento por ventanas solapadas para transcripciones de más de 96 palabras.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento; es un etiquetador de tokens puro.
- Multilingüe: no; solo inglés.

## Casos de uso

- Edición automática de subtítulos para vídeo corto: integrado en un editor web, el modelo decide qué palabra resaltar y dónde cortar la línea, sustituyendo heurísticas manuales que rinden peor en datos reales (F1 de 0,435 frente a 0,381 en énfasis sobre Shorts reales).
- Restauración de puntuación en transcripciones ASR: para pipelines que reciben texto sin puntuar de un reconocedor de voz, el modelo añade comas, puntos, interrogaciones y exclamaciones por palabra, con F1 de 0,828 sobre Shorts reales.
- Corrección de mayúsculas en transcripciones en minúsculas: el logit de mayúscula inicial permite reconstruir la capitalización sin un modelo de lenguaje grande.
- Herramienta on-device con privacidad: al ejecutarse en el navegador con transformers.js, las transcripciones no salen del dispositivo del usuario, lo que encaja en productos con requisitos de privacidad o con coste cero de servidor.
- Preprocesado para TTS o doblaje: las marcas de énfasis y puntuación pueden alimentar un sintetizador para mejorar la prosodia de la salida.
- Anotación asistida de corpus de subtítulos: el modelo puede proponer etiquetas iniciales que un humano revisa, reduciendo el coste de etiquetado manual en proyectos de datos de vídeo corto.
- Filtro de calidad en plataformas de contenido: detectar transcripciones mal segmentadas o sin puntuar antes de publicarlas.

## Benchmarks y rendimiento

Resultados de F1 publicados en la model card. "Rules" son las heurísticas manuales previas del estudio; v1 es la versión entrenada solo con guiones; v2 es este modelo.

| Conjunto | Métrica | Rules | v1 | v2 (este modelo) |
|---|---|---|---|---|
| Shorts reales | Énfasis | 0,381 | 0,273 | 0,435 |
| Habla marcada por oyentes (LibriTTS) | Énfasis | 0,272 | 0,246 | 0,307 |
| Helsinki test | Énfasis | 0,204 | 0,229 | 0,434 |
| Shorts reales | Cortes | 0,519 | 0,873 | 0,836 |
| Shorts reales | Puntuación | no disponible | 0,815 | 0,828 |

Notas de la model card: el conjunto de Shorts reales es pequeño (112 palabras en 28 rótulos), por lo que debe leerse junto a los otros dos; el conjunto de habla marcada por oyentes contiene 3.502 enunciados de LibriTTS (unas 70.000 palabras) con anotación de unos tres oyentes por palabra y no se usó en entrenamiento; el test de Helsinki toma como énfasis la palabra más prominente de cada ocho.

Rendimiento de inferencia declarado: 1.500 palabras etiquetadas en unos 260 ms en un escritorio, con el modelo de 11,7 MB.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo pesa 11,7 MB en ONNX y la demo usa cuantización q8 con backend WASM, por lo que cabe en memoria de navegador.
- GPU recomendadas: no requiere GPU; la model card solo documenta ejecución en navegador con WASM. El entrenamiento se hizo en una RTX 4070 Ti SUPER en unos 15 minutos.
- Cabe en cualquier GPU de consumo e incluso en CPU; no se publican requisitos mínimos de VRAM.
- Opciones de despliegue: transformers.js (documentado), con pesos ONNX; el uso con vLLM, llama.cpp, Ollama o TGI no está documentado y no es el formato esperado para este modelo.
- Latencia: unos 260 ms para 1.500 palabras en escritorio según la model card. Throughput no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de etiquetado de subtítulos en la información disponible. Como referencia de la misma familia de tamaño, se puede contrastar con el modelo base:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cuecaps/caption-tagger | no disponible (base bert-mini, 4 capas, 256 ocultas) | 96 palabras por pasada | Etiquetado de subtítulos (énfasis, cortes, puntuación, mayúsculas) | Apache 2.0 | Hugging Face, ONNX/transformers.js |
| prajjwal1/bert-mini | no disponible (4 capas, 256 ocultas) | 512 tokens (BERT estándar) | Modelo base de propósito general | Apache 2.0 | Hugging Face |
| prajjwal1/bert-tiny | no disponible (2 capas, 128 ocultas) | 512 tokens (BERT estándar) | Modelo base de propósito general | Apache 2.0 | Hugging Face |

La comparación con alternativas específicas de restauración de puntuación o predicción de énfasis no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés; el estudio de cuecaps recurre a sus reglas para otros idiomas.
- El énfasis aprendido proviene de habla leída y guiones de vídeo corto; el habla rápida e informal puede enfatizar palabras que el modelo no detecta.
- La puntuación está pensada para transcripciones sin puntuar; si el transcriptor ya puntúa, la model card recomienda conservar su puntuación.
- El conjunto de evaluación de Shorts reales es muy pequeño (112 palabras, 28 rótulos), por lo que las métricas de énfasis y cortes tienen alta incertidumbre.
- El modelo base es una miniatura de BERT (4 capas, 256 ocultas), con capacidad limitada frente a modelos mayores; no se documentan sesgos específicos.
- Riesgo de alucinación no aplicable en el sentido generativo (es un clasificador), pero sí puede producir etiquetas incorrectas en dominios alejados del entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datos de entrenamiento (Helsinki Prosody Corpus y anotaciones de LibriTTS, ambas CC BY 4.0) si se redistribuyen derivados.
- La versión publicada es la v2; el estudio de cuecaps ejecuta versiones más recientes, por lo que el rendimiento en producción puede diferir del reportado aquí.
- El repo aparece con 0 descargas y 0 likes en el momento de la consulta; es un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cuecaps/caption-tagger
- Demo Space: https://huggingface.co/spaces/cuecaps/caption-tagger-demo
- Estudio de subtítulos de cuecaps: https://cuecaps.com
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Modelo base bert-mini: https://huggingface.co/prajjwal1/bert-mini
- Helsinki Prosody Corpus: https://github.com/Helsinki-NLP/prosody
- Anotaciones de énfasis de LibriTTS (Morrison et al., 2024): https://zenodo.org/records/10402793
