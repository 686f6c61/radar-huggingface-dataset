# hoahoang62729/punctuation-xlmr-47

## Resumen

Punctuation-xlmr-47 es una versión cuantizada del modelo `1-800-BAD-CODE/xlm-roberta_punctuation_fullstop_truecase`, un sistema de restauración de puntuación y mayúsculas (punctuation restoration y truecasing) basado en la arquitectura XLM-RoBERTa. El modelo lo publica el usuario hoahoang62729 como una copia reducida y optimizada para dispositivos móviles, manteniendo el tokenizador (`sp.model`) y la configuración (`config.yaml`) del modelo original. Resuelve el problema de reconstruir signos de puntuación y capitalización en transcripciones de voz o texto sin formato, una tarea habitual en pipelines de ASR y normalización de texto.

La relevancia técnica del modelo está en su estrategia de cuantización: los pesos de las multiplicaciones matriciales se almacenan en bloques de 32 en 8 bits (MatMulNBits de ONNX Runtime, simétrico), la tabla de embeddings en bloques de 32 en 4 bits (GatherBlockQuantized) y los productos se calculan en int8 con escalas de activación por bloques (nivel de precisión 4). El resultado es un artefacto ONNX de 217 MB que, según las mediciones del autor, mantiene prácticamente idéntica la calidad del modelo original (F1 de 86,8 en finales de frase frente a 86,7 del original) con una huella de memoria pico de unos 400 MB.

El modelo se distribuye bajo licencia Apache-2.0, igual que el original, y está pensado para inferencia en móvil mediante ONNX Runtime 1.28 o superior. No se han publicado datos sobre idiomas soportados más allá de la evaluación en ocho lenguas (vi, it, pl, pt, ja, ko, zh, en), ni sobre parámetros totales, longitud de contexto o formatos de pesos adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), heredada del modelo base |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MatMulNBits 8 bits (bloques de 32, simétrico) en pesos de multiplicaciones matriciales; GatherBlockQuantized 4 bits (bloques de 32) en embeddings; productos en int8 con escalas de activación por bloques (nivel de precisión 4) |
| Idiomas soportados | no disponible (evaluado en vi, it, pl, pt, ja, ko, zh, en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), más `sp.model` y `config.yaml` del modelo original |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `1-800-BAD-CODE/xlm-roberta_punctuation_fullstop_truecase`, un encoder XLM-RoBERTa adaptado a la tarea de restauración de puntuación y truecasing. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO; la model card del autor no detalla el proceso de entrenamiento del original, solo el de cuantización.

La innovación técnica de esta copia es exclusivamente la cuantización. Se generó a partir del `model.onnx` original con el `matmul_nbits_quantizer` de ONNX Runtime 1.32, aplicando cuantización por bloques en las matrices de pesos y en la tabla de embeddings, y manteniendo las activaciones en coma flotante. El autor declara que no hay otros cambios respecto al original: mismos inputs, outputs y etiquetas. El artefacto requiere ONNX Runtime 1.28 o posterior para ejecutarse.

## Capacidades

- Restauración de puntuación: inserta signos de final de frase y comas en texto que carece de ellos.
- Truecasing: reconstruye mayúsculas y minúsculas a partir de texto en minúsculas.
- Procesamiento multilingüe: evaluado en vietnamita, italiano, polaco, portugués, japonés, coreano, chino e inglés.
- Inferencia en dispositivo: optimizado para ejecución en móvil mediante ONNX Runtime con cuantización de 8 y 4 bits.
- Integración en pipelines de ASR: pensado para normalizar transcripciones de voz sin puntuación.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Postprocesado de transcripciones ASR: el modelo recibe texto sin puntuación ni mayúsculas y devuelve el texto con signos y capitalización restaurados, lo que mejora la legibilidad de subtítulos y actas generadas automáticamente.
- Normalización de texto en aplicaciones móviles: con 217 MB y unos 400 MB de memoria pico, puede ejecutarse en un teléfono (el autor cita 0,34 s por cada diez frases en un Pixel 9a) para puntuar dictados o notas de voz sin enviar datos a la nube.
- Preprocesado para traducción automática: restaurar puntuación antes de traducir reduce errores de segmentación y mejora la calidad de los sistemas de traducción que dependen de límites de frase.
- Limpieza de corpus y datasets: aplicar truecasing y puntuación a textos extraídos de fuentes que han perdido el formato original (OCR, scraping, subtítulos).
- Sistemas de accesibilidad: generar subtítulos en directo con puntuación y mayúsculas correctas para personas con discapacidad auditiva, ejecutando el modelo en el propio dispositivo.
- Indexación y búsqueda de texto: normalizar documentos sin formato antes de indexarlos, de modo que las búsquedas por frases completas funcionen correctamente.
- Asistentes de voz embebidos: integrar el modelo en el pipeline local de un asistente para que las respuestas transcritas se muestren con formato legible sin depender de servicios externos.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 2.370 frases de FLEURS en ocho idiomas (vi, it, pl, pt, ja, ko, zh, en), eliminando los signos y pasando las letras a minúsculas, y comparando la puntuación restaurada con la de FLEURS mediante F1 agrupado:

| Copia | Tamaño | Finales de frase (F1) | Comas (F1) | Mayúsculas correctas |
|---|---|---|---|---|
| Original | 1.112 MB | 86,7 | 75,3 | 96,9 % |
| Esta copia | 217 MB | 86,8 | 75,2 | 96,9 % |
| Cuantización dinámica int8 | 279 MB | 84,3 | 73,5 | 96,5 % |

El autor reporta además una memoria pico de aproximadamente 400 MB y un tiempo de 0,34 s por cada diez frases en un Pixel 9a. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 400 MB de memoria pico según el autor.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y a aceleradores móviles mediante ONNX Runtime.
- Cabe en GPU de consumo: sí, por su tamaño (217 MB en disco y 400 MB de pico), aunque no se han publicado pruebas en GPU concretas.
- Opciones de despliegue: ONNX Runtime 1.28 o superior (requisito declarado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y arquitectura.
- Latencia y throughput: 0,34 s por cada diez frases en un Pixel 9a; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Tamaño | Formato | Licencia | Calidad (F1 finales de frase) | Disponibilidad |
|---|---|---|---|---|---|
| hoahoang62729/punctuation-xlmr-47 | 217 MB | ONNX cuantizado | Apache-2.0 | 86,8 | Hugging Face |
| 1-800-BAD-CODE/xlm-roberta_punctuation_fullstop_truecase | 1.112 MB | ONNX | Apache-2.0 | 86,7 | Hugging Face |
| Versión int8 dinámica del original | 279 MB | ONNX | Apache-2.0 | 84,3 | No disponible como artefacto independiente en la información consultada |

No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos del modelo original ni de esta copia cuantizada.
- Riesgo de alucinación: como todo modelo generativo de etiquetado, puede insertar puntuación o mayúsculas incorrectas en textos ambiguos o con estructuras atípicas; el autor no reporta análisis de errores por tipo.
- Limitaciones de idioma: la evaluación cubre ocho lenguas, pero no se declara la lista oficial de idiomas soportados ni su rendimiento fuera de ese conjunto.
- Limitaciones de contexto: no se ha publicado la longitud máxima de contexto del modelo base ni de esta copia.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el de cambios realizados (la cuantización).
- Caveat para producción: requiere ONNX Runtime 1.28 o superior; la cuantización de embeddings a 4 bits y de pesos a 8 bits puede degradar ligeramente la precisión en dominios distintos al evaluado, aunque en la evaluación publicada la diferencia es mínima.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoahoang62729/punctuation-xlmr-47
- Modelo base: https://huggingface.co/1-800-BAD-CODE/xlm-roberta_punctuation_fullstop_truecase
- ONNX Runtime (documentación de cuantización MatMulNBits): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
