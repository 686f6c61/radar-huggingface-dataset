# altslate/indic-punctuation-base

## Resumen

Indic Punctuation Base es un modelo de restauración de puntuación desarrollado por altslate, diseñado para insertar signos de puntuación en texto sin puntuar en doce lenguas de la India y en inglés. Se trata de un modelo de clasificación de tokens construido sobre jhu-clsp/mmBERT-base (307 millones de parámetros), por lo que hereda una arquitectura ModernBERT multilingüe afinada específicamente para lenguas índicas. El modelo predice, para cada palabra, si va seguida de nada, de una coma, de un final de oración o de un signo de interrogación, sin modificar nunca las palabras originales.

Su relevancia práctica es inmediata en pipelines de reconocimiento automático del habla (ASR): modelos como IndicConformer o muchos fine-tunes de Whisper generan transcripciones sin puntuación, lo que dificulta su lectura y su procesamiento posterior. Este modelo actúa como post-procesador ligero que restaura la puntuación respetando las convenciones tipográficas propias de cada escritura (danda `।` para hindi, bengalí y panyabí; `۔ ، ؟` para urdu; `، ؟` con punto para sindhi). Con 307 millones de parámetros y pesos de 3,4 GB en el repositorio, es desplegable en hardware modesto, incluyendo variantes ONNX cuantizadas de 309 MB para inferencia en navegador.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y forma parte de un ecosistema más amplio del mismo autor que incluye herramientas de normalización inversa de texto (indic-itn-small) y detección de idioma por palabra (indic-chat-wordlid-small).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-base) |
| Parametros totales | 307.533.316 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncamiento en el uso de referencia; se recomienda alimentar unas 100 palabras por ventana) |
| Tipos de cuantizacion | fp32 (PyTorch y ONNX), fp16 (ONNX), int8 (ONNX cuantizado) |
| Idiomas soportados | hi, bn, ta, te, mr, gu, kn, ml, pa, ur, sd, si, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32, fp16, int8) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT multilingüe (jhu-clsp/mmBERT-base) adaptado a clasificación de tokens. La etiqueta se asigna a la primera sub-palabra de cada palabra, de modo que la predicción es una por palabra: `O` (sin puntuación), `COMMA`, `PERIOD` o `QUESTION`. Esta formulación garantiza que el texto léxico nunca se altera, solo se añaden marcas tras las palabras.

El entrenamiento se realizó durante 1,5 épocas sobre 358.000 filas, con tamaño de lote 32 y tasa de aprendizaje 4e-5, en aproximadamente una hora según la model card. El conjunto de datos combina texto de Wikipedia (procedente del split de test de Dakshina, con 3.600 filas de 1 a 4 oraciones en las doce lenguas) y mensajes de chat generados por Qwen3.8-27B (600 mensajes cortos en diez lenguas, además de 1.779 mensajes de chat retenidos del mismo generador que parte de los datos de entrenamiento). No se menciona el uso de RLHF ni DPO; se trata de un ajuste supervisado estándar de clasificación de tokens. El código de entrenamiento y evaluación está disponible en el repositorio github.com/AltSlate-Labs/indic-chat-toolkit (directorio `src/punct/`).

## Capacidades

- Restauración de puntuación en texto sin puntuar para doce lenguas índicas y inglés, prediciendo coma, final de oración y signo de interrogación por palabra.
- Respeta las convenciones tipográficas nativas de cada escritura: danda `।` en hindi, bengalí y panyabí; `۔` para final de oración en urdu; `،` y `؟` para coma e interrogación en urdu y sindhi.
- No modifica el texto léxico: solo inserta marcas, lo que lo hace seguro para pipelines donde la fidelidad de las palabras es crítica.
- Funciona como post-procesador de ASR (IndicConformer, fine-tunes de Whisper) y como pre-procesador antes de la normalización inversa de números hablados (indic-itn-small).
- Soporte de inferencia en Python con transformers (PyTorch) y en ONNX Runtime, incluyendo transformers.js para ejecución en navegador.
- Capacidad multilingüe integrada en un único modelo, sin necesidad de cabeceras o modelos separados por idioma.
- No soporta tool calling, function calling, agentes ni modos de razonamiento extendido: es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Post-procesado de transcripciones ASR: tras un modelo de reconocimiento del habla que no genera puntuación (IndicConformer, fine-tunes de Whisper), se aplica este modelo para insertar comas, puntos y signos de interrogación, mejorando la legibilidad de las transcripciones y su aptitud para análisis posteriores.
- Subtitulado y transcripción de reuniones en lenguas índicas: el modelo restaura la puntuación en ventanas de aproximadamente 100 palabras, lo que encaja con la segmentación típica de subtítulos y facilita la sincronización y la lectura.
- Pre-procesado antes de la normalización de números: la model card indica explícitamente su uso antes de altslate/indic-itn-small, que convierte números hablados en dígitos; la puntuación correcta ayuda a delimitar unidades y a evitar errores de normalización.
- Procesamiento de mensajes de chat y atención al cliente: el modelo fue entrenado con mensajes de chat y obtiene un F1 de 0,750 en el conjunto retenido de chat, por lo que es adecuado para puntuar conversaciones multi-turno en hindi, bengalí, urdu y otras lenguas índicas.
- Limpieza y publicación de corpus textuales: para textos extraídos de fuentes sin puntuación (OCR, foros, transcripciones), el modelo añade puntuación sin alterar las palabras, preservando la integridad del corpus original.
- Ejecución en navegador o en el borde: la variante ONNX int8 (309 MB) permite integrar la restauración de puntuación en aplicaciones web con transformers.js, útil para editores de texto o herramientas de accesibilidad que funcionan sin servidor.
- Normalización de datos para entrenamiento de modelos generativos: la puntuación restaurada mejora la calidad de corpus índicos usados para pre-entrenamiento o fine-tuning de modelos de lenguaje.

## Benchmarks y rendimiento

La model card reporta F1 por clase (coma, final de oración, interrogación) promediado macro sobre las clases presentes, comparando con 1-800-BAD-CODE/xlm-roberta_punctuation_fullstop_truecase (XLM-R, Apache 2.0). La comparación se realiza solo en las filas donde el modelo rival no alteró el texto (el 12 % de las filas de Wikipedia volvieron con un número distinto de palabras).

| Conjunto | 1-800-BAD-CODE xlm-roberta | Indic Punctuation Base |
|---|---|---|
| Wikipedia (3.151 filas) | 0.610 | **0.667** |
| Mensajes (578) | **0.809** | 0.783 |
| Chat en dominio (1.597) | 0.562 | **0.750** |

Por lengua en Wikipedia (este modelo / 1-800-BAD-CODE): bn 0.75/0.72, gu 0.72/0.71, hi 0.70/0.72, kn 0.47/0.50, ml 0.77/0.77, mr 0.74/0.67, pa 0.73/0.69, ta 0.73/0.80, te 0.73/0.77, ur 0.52/0.45, sd 0.53/0.43, si 0.66/0.63. En las diez lenguas que ambos cubren, las medias son prácticamente iguales (0.704 frente a 0.705).

Por clase en Wikipedia (3.600 filas): final de oración 0.94, coma 0.58, interrogación 0.44 (hay pocas preguntas en Wikipedia).

Rendimiento de las variantes ONNX en el conjunto de mensajes: fp32 0.775, fp16 0.765 (solo fiable en Python onnxruntime; en transformers.js 4.3.2 produce salida incorrecta), int8 0.623 (la coma sufre especialmente: F1 de coma 0.29 frente a 0.59 en mensajes; los finales de oración no se ven afectados).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2-1,5 GB (307 M de parámetros más activaciones); en fp16, unos 0,7 GB; en int8, unos 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; tarjetas consumer como RTX 3060, RTX 4060, RTX 4090 son más que suficientes. En A100 o H100 el modelo ocupa una fracción mínima de memoria y el cuello de botella es el lanzamiento de kernels, no el cómputo.
- Cabe en GPU consumer y también en CPU: la variante ONNX int8 (309 MB) está pensada para entornos con recursos limitados y para el navegador.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (Python), transformers.js (navegador y Node), y cualquier servidor compatible con modelos de token-classification (por ejemplo, Text Embeddings Inference o un endpoint de Hugging Face con pipeline token-classification). No se documenta soporte específico para vLLM o llama.cpp, que están orientados a modelos generativos.
- Latencia y throughput: no se han publicado mediciones de latencia ni throughput en la información disponible. El entrenamiento de 1,5 épocas sobre 358.000 filas en aproximadamente una hora sugiere un coste de cómputo bajo, pero no se traduce en cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | F1 Wikipedia (índico) |
|---|---|---|---|---|---|
| Indic Punctuation Base (altslate) | 307 M | 512 tokens | 12 índicas + en | Apache 2.0 | 0.667 |
| 1-800-BAD-CODE/xlm-roberta_punctuation_fullstop_truecase | no disponible (XLM-R base, ~278 M) | no disponible | 47 (incluye 10 índicas) | Apache 2.0 | 0.610 |
| Modelos de puntuación específicos por lengua | no disponible | no disponible | una lengua | variable | no disponible |

La comparativa directa disponible en la model card se limita al modelo de 1-800-BAD-CODE. Frente a él, Indic Punctuation Base es mejor en Wikipedia (0.667 frente a 0.610) y en chat en dominio (0.750 frente a 0.562), y ligeramente peor en mensajes (0.783 frente a 0.809). Además, cubre urdu, sindhi y sinhala, que el modelo rival no incluye, y respeta las convenciones tipográficas nativas (el rival escribe `,` y `?` latinos en urdu). No se dispone de comparaciones con otros modelos de puntuación índicos en la información proporcionada.

## Limitaciones y advertencias

- El F1 de coma en Wikipedia es bajo (0.58) y el de interrogación también (0.44), debido a la escasez de preguntas en ese corpus; en textos con muchas preguntas el rendimiento puede degradarse.
- El rendimiento por lengua es desigual: kannada (0.47) y urdu (0.52) en Wikipedia están claramente por debajo de las demás; en tamil y telugu el modelo rival es superior.
- La variante ONNX fp16 produce salida incorrecta en transformers.js 4.3.2 (comas y signos de interrogación por todas partes); solo debe usarse desde Python con onnxruntime.
- La variante ONNX int8 degrada notablemente la coma (F1 0.29 frente a 0.59 en mensajes); si la coma es crítica, conviene usar fp32.
- El modelo trunca a 512 tokens y la model card recomienda ventanas de unas 100 palabras; textos más largos deben dividirse, lo que puede introducir errores en los límites de ventana.
- Riesgo de alucinación no aplica en el sentido generativo (no inventa palabras), pero sí puede insertar puntuación incorrecta o omitirla en estructuras sintácticas complejas.
- No se han publicado análisis de sesgos; al ser un modelo discriminativo entrenado con Wikipedia y mensajes generados, puede reflejar los sesgos de esas fuentes en la segmentación de oraciones.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base jhu-clsp/mmBERT-base debe verificarse por separado si se redistribuye.
- El modelo fue creado en noviembre de 2026 y no tiene descargas ni likes registrados en Hugging Face en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/altslate/indic-punctuation-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo de normalización inversa relacionado: https://huggingface.co/altslate/indic-itn-small
- Modelo de detección de idioma por palabra relacionado: https://huggingface.co/altslate/indic-chat-wordlid-small
- Modelo de comparación: https://huggingface.co/1-800-BAD-CODE/xlm-roberta_punctuation_fullstop_truecase
- Código de entrenamiento y evaluación: https://github.com/AltSlate-Labs/indic-chat-toolkit
- Corpus Dakshina (usado en evaluación): no disponible como enlace en la información proporcionada
