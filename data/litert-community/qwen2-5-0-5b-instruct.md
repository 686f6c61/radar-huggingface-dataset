# litert-community/Qwen2.5-0.5B-Instruct

## Resumen

litert-community/Qwen2.5-0.5B-Instruct es una conversión del modelo Qwen/Qwen2.5-0.5B-Instruct de Alibaba para su despliegue en dispositivos Android mediante la pila LiteRT (anteriormente TFLite) y la API MediaPipe LLM Inference. Lo publica la organización litert-community, que agrupa conversiones de modelos populares al formato LiteRT orientadas a inferencia en el borde (edge). El modelo base es un transformer denso de 0,5 mil millones de parámetros, ajustado con instrucciones y optimizado para chat, con una ventana de contexto de 32.768 tokens según la documentación de Qwen2.5.

El problema que resuelve es la brecha entre un modelo instructivo de pesos abiertos y su ejecución real en móviles: el repositorio ofrece variantes ya serializadas en formato `.tflite` (fp32 y dynamic_int8) listas para la API de MediaPipe, con métricas de rendimiento medidas en un Samsung S24 Ultra. Es relevante para desarrolladores que necesitan un asistente conversacional pequeño, con licencia Apache 2.0, que quepa en la memoria de un teléfono de gama alta y funcione sin conexión.

La ficha describe la conversión LiteRT; los detalles arquitectónicos y de entrenamiento corresponden al modelo base de Qwen y se indican como tales cuando no están documentados en la model card de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-0.5B-Instruct); conversión a LiteRT/TFLite |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5; la model card de la conversión no lo especifica |
| Tipos de cuantizacion | fp32 (baseline) y dynamic_int8 (pesos int8, activaciones float) |
| Idiomas soportados | no disponible en la model card de la conversión; el modelo base Qwen2.5 es multilingüe (29 idiomas según su documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tflite` (flatbuffer LiteRT); el repositorio no incluye `.litertlm` para LiteRT-LM |

## Arquitectura y entrenamiento

La conversión mantiene la arquitectura del modelo base: un transformer decoder-only denso de 0,5 mil millones de parámetros, ajustado con instrucciones por Alibaba (Qwen2.5-0.5B-Instruct). La model card de litert-community no documenta el proceso de entrenamiento, el número de tokens ni la composición del dataset; esa información pertenece a la model card original de Qwen. Tampoco se detalla si hubo RLHF o DPO en esta conversión.

La innovación técnica de este repositorio es la cadena de despliegue: los pesos se serializan en flatbuffers `.tflite` y la inferencia en CPU se acelera mediante el delegado XNNPACK de LiteRT con 4 hilos y caché habilitada. Se ofrecen dos variantes, fp32 y dynamic_int8, y la model card menciona firmas de prefill múltiples y una caché KV de 1.280 tokens en las pruebas de rendimiento. El soporte de MediaPipe LLM Inference API está en modo de solo mantenimiento, y el repositorio no incluye un archivo `.litertlm` para LiteRT-LM.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat (pipeline `text-generation`, tag `chat`).
- Seguimiento de instrucciones, heredado del ajuste instructivo del modelo base Qwen2.5-0.5B-Instruct.
- Generación de código y razonamiento básico, limitado por el tamaño de 0,5 mil millones de parámetros.
- Capacidades multilingües del modelo base (29 idiomas según Qwen), aunque la model card de la conversión no las enumera.
- Ejecución en dispositivo (Android) sin conexión mediante LiteRT y MediaPipe LLM Inference API.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la model card de esta conversión.

## Casos de uso

- Asistente conversacional offline en Android: el modelo se integra con la API MediaPipe LLM Inference y responde sin conexión; con dynamic_int8 ocupa 521 MB de almacenamiento y 1.363 MB de RAM pico en un S24 Ultra, lo que lo hace viable en un teléfono de gama alta.
- Autocompletado y respuestas sugeridas en aplicaciones de mensajería: la variante dynamic_int8 decodifica a 29,97 tokens/s en CPU, suficiente para sugerencias cortas en tiempo real.
- Clasificación y resumen de texto local: textos cortos (correos, notas, mensajes) procesados en el dispositivo sin enviar datos a la nube, lo que reduce el riesgo de privacidad.
- Prototipado de funciones de IA en apps móviles: el APK de demostración de MediaPipe permite validar la experiencia de usuario antes de invertir en infraestructura.
- Chatbot de soporte de primer nivel en kioscos o terminales Android: respuestas a preguntas frecuentes con contexto de conversación, sin dependencia de red.
- Filtrado y etiquetado previo en el borde: preprocesar o clasificar entradas localmente antes de enviarlas a un modelo mayor en servidor, reduciendo coste y latencia de red.

## Benchmarks y rendimiento

La model card solo publica métricas de inferencia en Android (Samsung S24 Ultra, caché KV de 1.280 tokens, XNNPACK con 4 hilos, caché habilitada). No hay resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

| Variante | Backend | Prefill (tk/s) | Decode (tk/s) | TTFT (s) | Memoria pico (MB) | Tamaño del modelo (MB) |
|---|---|---|---|---|---|---|
| fp32 (baseline) | CPU | 90,30 | 16,71 | 5,24 | 4.503 | 1.898 |
| dynamic_int8 | CPU | 250,73 | 29,97 | 2,31 | 1.363 | 521 |

## Requisitos de hardware

- Almacenamiento: 1.898 MB para fp32 y 521 MB para dynamic_int8 (tamaño del flatbuffer `.tflite`).
- RAM pico: 4.503 MB en fp32 y 1.363 MB en dynamic_int8, medidos como RSS en un Samsung S24 Ultra.
- GPU: no se documenta aceleración por GPU en la model card; las métricas son de CPU con el delegado XNNPACK.
- Cabe en móviles Android de gama alta (S24 Ultra como referencia); no se documentan requisitos mínimos para gama media o dispositivos iOS.
- Despliegue: LiteRT (TFLite) y MediaPipe LLM Inference API (en modo de solo mantenimiento); el repositorio no incluye `.litertlm` para LiteRT-LM.
- Latencia y throughput: TTFT de 5,24 s (fp32) y 2,31 s (dynamic_int8); decodificación de 16,71 y 29,97 tokens/s respectivamente.
- En Colab el rendimiento puede ser mucho peor que en un dispositivo local, según advierte la propia model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 (modelo base) | `.tflite` para Android | Apache 2.0 | Conversión LiteRT con métricas en S24 Ultra |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 | safetensors (Transformers) | Apache 2.0 | Modelo base original; requiere pila de servidor o llama.cpp |
| Otros modelos de 0,5 B en LiteRT | no disponible | no disponible | `.tflite` | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento frente a alternativas de tamaño similar.

## Limitaciones y advertencias

- Tamaño reducido: con 0,5 mil millones de parámetros, el razonamiento complejo, las matemáticas y el código extenso son limitados frente a modelos de 7 B o más.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en preguntas factuales y contexto largo.
- La model card no documenta sesgos conocidos; el modelo base Qwen2.5 puede reflejar sesgos de sus datos de entrenamiento.
- Contexto: aunque el modelo base soporta 32.768 tokens, la conversión se probó con una caché KV de 1.280 tokens; el contexto efectivo en dispositivo puede ser menor.
- Idiomas: la model card de la conversión no especifica idiomas; la cobertura multilingüe depende del modelo base y no está validada para esta conversión.
- API MediaPipe LLM Inference en modo de solo mantenimiento; el repositorio no incluye `.litertlm` para LiteRT-LM, lo que limita la hoja de ruta de despliegue.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-0.5B-Instruct.
- El rendimiento medido corresponde a un Samsung S24 Ultra; en dispositivos con menos RAM o CPU más lenta la latencia y el consumo de memoria pueden degradarse notablemente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- LiteRT (antes TFLite): https://ai.google.dev/edge/litert
- MediaPipe LLM Inference API: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Ejemplos LiteRT: https://github.com/google-ai-edge/litert-samples
- APK de demostración: https://github.com/google-ai-edge/mediapipe-samples/releases/latest/download/llm_inference-debug.apk
- Delegado XNNPACK: https://github.com/google/XNNPACK
- Cuaderno Colab: https://colab.research.google.com/#fileId=https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct/blob/main/notebook.ipynb
