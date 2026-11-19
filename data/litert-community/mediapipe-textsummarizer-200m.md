# litert-community/MediaPipe-TextSummarizer-200M

## Resumen

MediaPipe TextSummarizer-200M es un modelo compacto de 200 millones de parámetros derivado de Gemma y ajustado específicamente para resumir texto en dos modos predefinidos: `TLDR` (párrafo conciso de 1-2 frases) y `KEYPOINTS` (3-5 viñetas con las ideas clave). Lo publica la organización `litert-community` como artefacto byte a byte idéntico al que sirve Google desde `storage.googleapis.com/mediapipe-models`, empaquetado en formato `.litertlm` (117,6 MB) para su uso con la tarea `TextSummarizer` de MediaPipe Tasks.

El modelo está cuantizado con precisión mixta (int4 + int8) y empaqueta en un único fichero mapeado en memoria los subgrafos LiteRT de prefill y decode, el tokenizador SentencePiece y la plantilla de prompt. Su objetivo es la inferencia totalmente local en Android, iOS y Python de escritorio, sin ida y vuelta a la nube, con un pico de RAM de entre 200 MB y 350 MB para entradas de 100 a 2.000 palabras.

Es relevante ahora porque demuestra que tareas de resumen de utilidad real pueden ejecutarse en dispositivos móviles de gama alta con latencias de 0,9 a 17 segundos según la longitud de entrada, sin necesidad de GPU dedicada y con garantías de privacidad al no salir el texto del dispositivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma (subgrafos LiteRT de prefill y decode) |
| Parámetros totales | 200M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probado con entradas de hasta ~3.600 tokens / 2.000 palabras) |
| Tipos de cuantización | int4 + int8 (precisión mixta) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (gated) |
| Formato de pesos | `.litertlm` (paquete LiteRT con tokenizador SentencePiece y plantilla de prompt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 200M de parámetros derivado de Gemma y ajustado para dos modos concretos de resumen (`TLDR` y `KEYPOINTS`). El artefacto distribuido no contiene pesos en bruto, sino un paquete `.litertlm` que agrupa los subgrafos LiteRT cuantizados de prefill y decode, el tokenizador SentencePiece y los metadatos de la plantilla de prompt en un único fichero mapeado en memoria. La cuantización es de precisión mixta: int4 e int8 combinados para reducir el tamaño a 117,6 MB manteniendo calidad suficiente para la tarea.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovación técnica más allá del empaquetado LiteRT y la cuantización mixta orientada a despliegue en dispositivo.

## Capacidades

- Generación de resúmenes en dos modos: `TLDR` (1-2 frases) y `KEYPOINTS` (3-5 viñetas).
- Procesamiento local en Android, iOS y Python de escritorio mediante el backend LiteRT-LM.
- Manejo de entradas de 100 a 2.000 palabras con pico de RAM de 200-350 MB.
- Tokenización integrada mediante SentencePiece dentro del propio paquete.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No disponible en Web ni Flutter según la model card.

## Casos de uso

- Resumen de notas privadas en el móvil: la app captura texto del usuario y llama a `TextSummarizer.summarize()` en modo `TLDR` para devolver una síntesis de 1-2 frases sin enviar datos a la nube, aprovechando el pico de RAM de ~200 MB en entradas cortas.
- Síntesis de correos electrónicos en el cliente de email: con entradas de 100-500 palabras el modelo responde en 0,9-1,8 s en CPU de Pixel 10 Pro, lo bastante rápido para mostrarse en línea dentro de la interfaz.
- Extracción de puntos clave de transcripciones de reuniones: el modo `KEYPOINTS` genera 3-5 viñetas a partir de transcripciones de hasta 1.000 palabras en unos 5 s, adecuado para un procesamiento posterior a la reunión en el propio dispositivo.
- Resumen de artículos en lectores RSS o apps de lectura: entradas de 500-1.000 palabras se procesan en 1,8-5 s, permitiendo mostrar un TLDR junto al artículo sin coste de servidor.
- Preprocesado en pipelines de accesibilidad: condensar contenido largo en bullets para lectores de pantalla o interfaces de voz en Android e iOS, con la ventaja de que el modelo cabe en memoria de un móvil de gama alta.
- Filtrado y triaje local de documentos en apps de productividad: resumir borradores o páginas capturadas antes de decidir si requieren revisión humana, evitando subir contenido sensible a servicios externos.
- Prototipado rápido en Python de escritorio: gracias al paquete `mediapipe` y a `hf_hub_download`, se puede integrar en scripts de escritorio para resumir lotes de textos cortos sin infraestructura adicional.

## Benchmarks y rendimiento

Latencia media en CPU de Pixel 10 Pro promediando los modos `TLDR` y `KEYPOINTS`, según la documentación de Text Summarizer:

| Dispositivo | Palabras de entrada (tokens) | Prefill (tokens/s) | Decode (tokens/s) | Latencia E2E (ms) |
|---|---|---:|---:|---:|
| Pixel 10 Pro CPU | 100 (≈200 tokens) | 980 | 133 | 900 |
| Pixel 10 Pro CPU | 500 (≈900 tokens) | 950 | 130 | 1.790 |
| Pixel 10 Pro CPU | 1000 (≈1900 tokens) | 690 | 100 | 5.000 |
| Pixel 10 Pro CPU | 2000 (≈3600 tokens) | 470 | 55 | 12.000-17.000 |

No se han publicado resultados de benchmarks de calidad (ROUGE, MMLU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU en dispositivo. Pico de RAM de ≈200 MB a ≈350 MB según longitud de entrada.
- GPU recomendadas: no se documentan; el benchmark oficial es en CPU de Pixel 10 Pro.
- Cabe en cualquier móvil moderno (Android/iOS) con al menos ~350 MB de RAM disponible para el proceso; no requiere GPU dedicada.
- Opciones de despliegue: MediaPipe Tasks (`TextSummarizer`) en Android (Kotlin/Java), iOS (Swift) y Python de escritorio con backend LiteRT-LM. No disponible en Web ni Flutter.
- Latencia y throughput: ver tabla de benchmarks; prefill de 470-980 tokens/s y decode de 55-133 tokens/s en CPU de Pixel 10 Pro.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de resumen on-device.

## Limitaciones y advertencias

- Solo genera resúmenes en dos formatos fijos (`TLDR` y `KEYPOINTS`); no es un modelo de propósito general.
- Los resúmenes deben verificarse en textos largos o técnicos para asegurar la preservación factual, según advierte la propia model card.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Licencia Gemma Terms of Use con acceso gated en Hugging Face: es necesario aceptar los términos para descargar el modelo.
- Restricciones de uso comercial sujetas a los Gemma Terms of Use; conviene revisarlas antes de integrarlo en producto.
- No disponible en Web ni Flutter, lo que limita su uso en aplicaciones browser-first.
- Riesgo de alucinación y sesgos: no documentado explícitamente en la información disponible, pero aplicable por herencia de la base Gemma.
- El artefacto es byte a byte idéntico al oficial de Google; cualquier modificación invalida esa garantía de procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-TextSummarizer-200M
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-TextSummarizer-200M/blob/main/summarization_quant_200m_2modes.litertlm
- Documentación de Text Summarizer: https://developers.google.com/edge/mediapipe/solutions/text/text_summarizer
- Benchmarks de la tarea: https://developers.google.com/edge/mediapipe/solutions/text/text_summarizer#task_benchmarks
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Notebook Colab (Python): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_summarizer/python/text_summarizer.ipynb
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_summarizer/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_summarizer/ios
- Guía de setup Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de setup Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de setup iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Demos web de MediaPipe: https://google-ai-edge.github.io/mediapipe-samples-web/
- Artefacto upstream en GCS: https://storage.googleapis.com/mediapipe-models/text_summarizer/200m/latest/summarization_quant_200m_2modes.litertlm
