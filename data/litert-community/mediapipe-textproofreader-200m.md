# litert-community/MediaPipe-TextProofreader-200M

## Resumen

MediaPipe Text Proofreader 200M es un modelo compacto de corrección de texto desarrollado por la comunidad litert-community sobre la base de un modelo Gemma de 200 millones de parámetros. Su propósito es identificar y corregir errores ortográficos, gramaticales y de estilo directamente en el dispositivo, sin enviar el texto del usuario a la nube. Se distribuye empaquetado en formato `.litertlm` (117,6 MB) con cuantización mixta int4 + int8, e integrado con la tarea MediaPipe Text Proofreader y el runtime LiteRT-LM de Google.

El modelo está pensado para ejecutarse en Android, iOS, Flutter (Android e iOS) y Python de escritorio mediante el paquete `mediapipe`. Su ventana de contexto por defecto es de 8.192 tokens, aunque el ejemplo de inicio rápido limita la entrada a `max_num_tokens=4096`. El consumo pico de RAM en dispositivo se sitúa entre 200 MB y 350 MB según la longitud de la entrada (de 100 a 2.000 palabras).

Es relevante ahora porque cubre un caso de uso muy concreto —la corrección de texto privada y de baja latencia en el propio dispositivo— con un tamaño reducido y una licencia Gemma que permite uso comercial bajo sus términos. No es un modelo de propósito general, sino una herramienta especializada con una interfaz de tarea bien definida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma (no se detalla la variante exacta) |
| Parametros totales | 200M (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por defecto (`max_num_tokens=4096` en el quickstart) |
| Tipos de cuantizacion | Mixta int4 + int8 |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | `.litertlm` (paquete LiteRT-LM con subgrafos prefill/decode, tokenizer SentencePiece y metadatos de plantilla de prompt) |
| Tamano del artefacto | 117,59 MB (117.587.968 bytes) |
| SHA-256 | `2caa317d5a6f951af6e437edce3bb3a9fdedc85a7a8c2a8fcaec96318d7708cc` |
| Plataformas | Android, iOS, Flutter (Android/iOS), Python de escritorio; no disponible en Web ni Flutter web |
| Runtime | LiteRT-LM / MediaPipe Tasks |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de la familia Gemma, con 200 millones de parámetros y cuantización mixta int4 + int8. El paquete `.litertlm` es autocontenido: incluye los subgrafos LiteRT de prefill y decode, el tokenizer SentencePiece y los metadatos de la plantilla de prompt en un único fichero mapeado en memoria. Esta estructura está optimizada para inferencia en dispositivo mediante el runtime LiteRT-LM, no para entrenamiento ni ajuste fino.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. La model card solo indica que el binario es byte-idéntico al artefacto oficial servido por Google, lo que sugiere que se trata de una redistribución comunitaria del modelo original de Google para la tarea MediaPipe Text Proofreader. Tampoco se detallan innovaciones técnicas específicas más allá de la cuantización mixta y el empaquetado LiteRT-LM.

## Capacidades

- Corrección ortográfica: identifica y corrige faltas de ortografía en el texto de entrada.
- Corrección gramatical: detecta y corrige errores de concordancia, tiempos verbales y estructura oracional.
- Corrección de estilo: ajusta aspectos estilísticos preservando el significado y el tono original del usuario.
- Procesamiento en dispositivo: toda la inferencia ocurre localmente, sin envío de texto a la nube.
- Soporte multilingüe: no disponible (no se especifican idiomas en la información proporcionada).
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible; el modelo está especializado en una única tarea de proofreading.
- Modo thinking, visión o audio: no disponible.
- Interfaz de tarea: se invoca mediante `TextProofreader.proofread(texto)` y devuelve `proofread_text` con el texto corregido.

## Casos de uso

- Corrección de textos en apps de mensajería y correo: el modelo puede integrarse en el cliente para corregir borradores antes de enviarlos, con latencia de 980 ms para 100 palabras en Pixel 10 Pro CPU y sin salir del dispositivo.
- Procesamiento de documentos confidenciales: contratos, informes médicos o comunicaciones legales pueden revisarse ortográfica y gramaticalmente sin que el texto abandone el terminal, gracias al procesamiento local y al consumo de 200–350 MB de RAM.
- Edición en aplicaciones móviles de escritura: integración en editores de texto Android/iOS mediante MediaPipe Tasks para ofrecer sugerencias de corrección en tiempo real sobre fragmentos de hasta 2.000 palabras (28 s de latencia end-to-end en CPU de Pixel 10 Pro).
- Revisión por lotes en escritorio: scripts Python que procesan ficheros de texto o exportaciones de bases de datos con `mediapipe` y LiteRT-LM, corrigiendo gramática y estilo antes de publicar contenido.
- Accesibilidad y educación: asistencia a usuarios con dificultades de escritura o aprendizaje de idiomas, ofreciendo correcciones inmediatas y privadas en aplicaciones Flutter multiplataforma.
- Preprocesado en pipelines de NLP: normalización ortográfica y gramatical de corpus antes de tareas posteriores (análisis, traducción o indexación), ejecutándose en el mismo dispositivo para reducir costes de infraestructura.
- Moderación de contenido generado por usuarios: limpieza de reseñas, comentarios y formularios antes de almacenarlos, manteniendo la privacidad del texto original.

## Benchmarks y rendimiento

La model card incluye benchmarks de latencia end-to-end en CPU de Pixel 10 Pro, no benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.), que no se han publicado en la información disponible.

| Dispositivo | Palabras (tokens) | Prefill (tok/s) | Decode (tok/s) | Latencia E2E (ms) |
|---|---|---:|---:|---:|
| Pixel 10 Pro CPU | 100 (≈200 tokens) | 1.280 | 170 | 980 |
| Pixel 10 Pro CPU | 500 (≈900 tokens) | 1.095 | 163 | 4.900 |
| Pixel 10 Pro CPU | 1.000 (≈1.900 tokens) | 1.025 | 150 | 16.000 |
| Pixel 10 Pro CPU | 2.000 (≈3.600 tokens) | 980 | 140 | 28.000 |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 200–350 MB de RAM pico en dispositivo según longitud de entrada (100–2.000 palabras).
- GPU recomendadas: no aplica; el modelo está optimizado para CPU en dispositivos móviles y de escritorio.
- Cabe en cualquier dispositivo móvil moderno (Android/iOS) y en equipos de escritorio con Python; no requiere GPU dedicada.
- Opciones de despliegue: MediaPipe Tasks (`TextProofreader`) con runtime LiteRT-LM en Python, Android (Kotlin/Java), iOS (Swift) y Flutter (Dart). No disponible en Web ni Flutter web.
- Latencia y throughput: ver tabla de benchmarks; en Pixel 10 Pro CPU, 980 ms para 100 palabras y 28 s para 2.000 palabras, con throughput de decode entre 140 y 170 tokens/s.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MediaPipe Text Proofreader 200M | 200M | 8.192 tokens | gemma | Hugging Face, MediaPipe |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada.
- Riesgo de alucinación: no se cuantifica; al ser un modelo de corrección, puede introducir cambios no deseados en el texto, por lo que la model card recomienda revisar siempre las ediciones generadas antes de acciones irreversibles.
- Limitaciones de contexto e idioma: la ventana por defecto es de 8.192 tokens, pero el quickstart limita a 4.096; no se especifican idiomas soportados, lo que impide garantizar cobertura multilingüe.
- Restricciones de licencia: sujeto a los Gemma Terms of Use; es necesario revisar sus condiciones para uso comercial y redistribución.
- Plataformas no soportadas: no disponible en Web ni Flutter web.
- Especialización: el modelo está diseñado exclusivamente para proofreading; no debe emplearse como modelo de propósito general, agentes o tool calling.
- Trazabilidad: el binario es byte-idéntico al artefacto oficial de Google, pero la model card no detalla el proceso de entrenamiento ni la evaluación de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-TextProofreader-200M
- Documentación de MediaPipe Text Proofreader: https://developers.google.com/edge/mediapipe/solutions/text/text_proofreader
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_proofreader/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_proofreader/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_proofreader/python/text_proofreader.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/text/text_proofreader
- Guía de instalación Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demos web de MediaPipe: https://google-ai-edge.github.io/mediapipe-samples-web/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
