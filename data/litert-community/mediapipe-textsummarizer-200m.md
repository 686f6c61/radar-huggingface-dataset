# litert-community/MediaPipe-TextSummarizer-200M

## Resumen

MediaPipe TextSummarizer-200M es un modelo compacto de resumen de texto desarrollado por la comunidad litert-community (Google AI Edge) sobre una base Gemma de 200 millones de parametros, cuantizada con precision mixta (int4 + int8) y empaquetada en formato `.litertlm` de 117,6 MB. Su proposito es ejecutar resumen de texto en tiempo real directamente en el dispositivo (on-device), sin necesidad de conexion a la nube, dentro de la tarea `TextSummarizer` de MediaPipe.

El modelo esta afinado especificamente para dos modos de resumen: `TLDR` (parrafo conciso de una a dos frases) y `KEYPOINTS` (tres a cinco puntos clave en formato de vineta). Esto lo diferencia de un LLM generico de resumen: no es un modelo conversacional, sino un componente especializado con salida controlada y predecible, pensado para integrarse en aplicaciones moviles, de escritorio y Flutter.

Su relevancia actual radica en el creciente interes por la inferencia local en dispositivos con recursos limitados (privacidad, latencia, coste cero de API) y en el ecosistema LiteRT-LM de Google para desplegar modelos ligeros en Android, iOS y Python de escritorio. Con un consumo de RAM de entre 200 y 350 MB y una latencia de 0,9 a 17 segundos segun la longitud de entrada, cubre el nicho de resumen de notas, correos y transcripciones sin salir del dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma), empaquetado LiteRT-LM con subgrafos prefill/decode |
| Parametros totales | 200M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entradas de referencia de hasta 2.000 palabras / ~3.600 tokens) |
| Tipos de cuantizacion | int4 + int8 (precision mixta) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | `.litertlm` (paquete autocontenido con pesos, tokenizer SentencePiece y plantilla de prompt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Gemma, en su variante de 200 millones de parametros, y se distribuye como un paquete `.litertlm` autocontenido que incluye los subgrafos cuantizados de prefill y decode, el tokenizer SentencePiece y los metadatos de la plantilla de prompt en un unico fichero mapeado en memoria. La cuantizacion es de precision mixta (int4 e int8), lo que reduce el peso a 117,6 MB y permite la inferencia en CPU de dispositivos moviles con un consumo de RAM de entre 200 y 350 MB.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset de afinado ni si se emplearon tecnicas de RLHF o DPO. El modelo esta afinado para dos modos de salida fijos (`TLDR` y `KEYPOINTS`), lo que sugiere un entrenamiento supervisado orientado a tareas de resumen con formato controlado. La innovacion tecnica principal es el empaquetado LiteRT-LM con subgrafos separados de prefill y decode, optimizado para inferencia en CPU movil, y la integracion nativa con la API `TextSummarizer` de MediaPipe.

## Capacidades

- Resumen de texto en dos modos: `TLDR` (parrafo de una a dos frases) y `KEYPOINTS` (tres a cinco vinetas).
- Inferencia on-device en CPU, sin conexion a la nube, con RAM pico de 200 a 350 MB.
- Procesamiento de entradas de 100 a 2.000 palabras (aproximadamente 200 a 3.600 tokens).
- Soporte multiplataforma: Android (Kotlin/Java), iOS (Swift), Flutter (Android/iOS) y Python de escritorio mediante el backend LiteRT-LM.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles (no se especifican idiomas soportados).

## Casos de uso

- Resumen de notas privadas en aplicaciones de productividad: el modelo condensa notas locales en un parrafo `TLDR` o en vinetas `KEYPOINTS` sin enviar el contenido a la nube, lo que preserva la privacidad del usuario y elimina la latencia de red.
- Resumen de correos electronicos en clientes de correo moviles: con entradas de 100 a 500 palabras, la latencia de extremo a extremo es de 0,9 a 1,79 segundos en CPU de Pixel 10 Pro, adecuada para generar una vista previa del mensaje al abrirlo.
- Resumen de transcripciones de reuniones en apps de notas de voz: para transcripciones de hasta 2.000 palabras, el modelo genera puntos clave en 12 a 17 segundos, un tiempo aceptable para un procesamiento en segundo plano tras finalizar la grabacion.
- Resumen de articulos en lectores de noticias: el modo `TLDR` permite mostrar un resumen de una o dos frases en la vista de lista, con un coste de RAM de unos 200 MB que cabe en cualquier movil de gama media.
- Integracion en apps Flutter multiplataforma: al disponer de soporte para Flutter (Android/iOS), el modelo puede compartir logica de resumen entre plataformas con la misma API de MediaPipe.
- Procesamiento por lotes en Python de escritorio: mediante el backend LiteRT-LM, se puede usar para resumir lotes de documentos locales en un portatil sin GPU, con throughput de decodificacion de 55 a 133 tokens por segundo.
- Funcionalidad de accesibilidad: generacion de resumenes de articulos o documentos para lectores de pantalla, con salida estructurada en vinetas que facilita la navegacion.

## Benchmarks y rendimiento

Latencia media en CPU de Pixel 10 Pro para los modos `TLDR` y `KEYPOINTS` (RAM pico aproximada de 200 a 350 MB):

| Dispositivo | Palabras de entrada (tokens) | Prefill (tokens/s) | Decode (tokens/s) | Latencia E2E (ms) |
|---|---|---:|---:|---:|
| Pixel 10 Pro CPU | 100 (~200 tokens) | 980 | 133 | 900 |
| Pixel 10 Pro CPU | 500 (~900 tokens) | 950 | 130 | 1.790 |
| Pixel 10 Pro CPU | 1.000 (~1.900 tokens) | 690 | 100 | 5.000 |
| Pixel 10 Pro CPU | 2.000 (~3.600 tokens) | 470 | 55 | 12.000–17.000 |

No se han publicado resultados de benchmarks de calidad (ROUGE, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo esta disenado para inferencia en CPU; RAM pico de 200 a 350 MB.
- GPU recomendadas: no aplica (inferencia en CPU); no se especifican requisitos de GPU.
- Cabe en cualquier dispositivo movil moderno (Android/iOS) y en portatiles de gama baja; no requiere GPU dedicada.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, Flutter) con backend LiteRT-LM. No disponible en web ni en Flutter web.
- Latencia y throughput: 900 ms a 17 s de extremo a extremo segun longitud de entrada; decodificacion de 55 a 133 tokens/s y prefill de 470 a 980 tokens/s en CPU de Pixel 10 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Formato |
|---|---|---|---|---|---|
| MediaPipe TextSummarizer-200M | 200M | no disponible (~3.600 tokens en pruebas) | On-device CPU (MediaPipe) | Gemma Terms of Use | `.litertlm` |
| Gemma 2B (base) | 2.000M | 8.192 tokens | GPU/CPU | Gemma Terms of Use | safetensors, GGUF |
| Modelos de resumen tipo BART/T5 small | 60M–400M | 512–1.024 tokens | Servidor/CPU | Apache 2.0 / MIT (segun variante) | safetensors, ONNX |

La comparativa con modelos de resumen genericos no esta disponible con datos de rendimiento verificables en la informacion proporcionada. Frente a Gemma 2B, este modelo sacrifica capacidad generica y contexto a cambio de un tamano 10 veces menor y despliegue on-device especializado. Frente a modelos tipo BART/T5, ofrece salidas estructuradas en dos modos y un empaquetado movil listo para produccion, aunque con licencia mas restrictiva.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo.
- Riesgo de alucinacion y perdida de fidelidad factica: el autor recomienda verificar los resumenes en textos largos o tecnicos.
- Contexto limitado: las pruebas de referencia llegan a 2.000 palabras (~3.600 tokens); entradas mas largas pueden degradar la calidad o no estar soportadas.
- Idiomas soportados no especificados; no se garantiza un rendimiento multilingue.
- Licencia Gemma Terms of Use: restricciones para uso comercial que deben revisarse antes de produccion.
- No disponible en web ni en Flutter web; solo Android, iOS, Flutter (Android/iOS) y Python de escritorio.
- Modelo especializado: no es conversacional ni soporta tool calling, agentes o razonamiento multi-paso.
- Latencia elevada para entradas largas (hasta 17 s en CPU movil), no apta para interacciones sincronas con textos extensos.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-TextSummarizer-200M
- Documentacion de MediaPipe Text Summarizer: https://developers.google.com/edge/mediapipe/solutions/text/text_summarizer
- Benchmarks de Text Summarizer: https://developers.google.com/edge/mediapipe/solutions/text/text_summarizer#benchmarks
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_summarizer/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_summarizer/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_summarizer/python/text_summarizer.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/text/text_summarizer
- Guia de instalacion Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guia de instalacion Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guia de instalacion iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guia de instalacion Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demos web de MediaPipe: https://google-ai-edge.github.io/mediapipe-samples-web/
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
