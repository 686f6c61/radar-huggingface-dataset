# abacusai/Smaug-Decisions-LiteRT

## Resumen

Smaug-Decisions-LiteRT es la versión empaquetada para dispositivos móviles de Smaug-Decisions, un modelo de decisión de 4B parámetros desarrollado por Abacus.AI que responde a preguntas de opción múltiple sobre audio, imagen o texto devolviendo una probabilidad por opción en un único prefill, sin generar texto. Esta variante está exportada al runtime on-device LiteRT-LM de Google y comprime el modelo completo (decoder, encoder de audio y encoder de visión) en un único fichero de 3,45 GB que se ejecuta en la GPU del teléfono, completamente offline.

El modelo base es un fine-tune de Gemma 4 E4B con una cabeza de lectura sobre los logits de las letras de las opciones, lo que permite obtener una distribución de probabilidad sobre las alternativas en lugar de una secuencia generada. La cuantización es agresiva: decoder en int4, tablas de embedding en int2, encoder de audio en int8 y una cabeza de salida que solo contiene las 20 letras posibles de opción.

Es relevante ahora porque demuestra que un modelo multimodal de decisión con calidad cercana a la versión full-precision (59,4 frente a 60,1 en Earshot audio; 53,9 frente a 56,6 en Decision Index texto; 55,1 frente a 57,2 en imágenes) cabe en un teléfono de gama media-alta y funciona sin conexión, abriendo la puerta a aplicaciones de clasificación y decisión multimodal en el borde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 E4B (modelo de lenguaje + encoders de audio y visión), fine-tune Smaug-Decisions con lectura de logits de letras |
| Parámetros totales | 4B (según model card del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (decoder), int2 (tablas de embedding), int8 (encoder de audio); empaquetado LiteRT-LM |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero `manifest.json` con tamaños, sha256, entradas y URLs |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, que integra un modelo de lenguaje con encoders de audio y visión, y se ha fine-tuneado como Smaug-Decisions. La innovación clave es la cabeza de lectura: en lugar de generar texto autoregresivamente, el modelo produce una probabilidad por cada opción de una pregunta con entre 2 y 20 alternativas, leyendo los logits correspondientes a las letras de las opciones en un solo paso de prefill. Esto reduce drásticamente la latencia y el coste computacional frente a la generación libre.

La exportación a LiteRT-LM incluye los encoders de audio y visión dentro del mismo fichero y aplica cuantización mixta: int4 para el decoder, int2 para las tablas de embedding y int8 para el encoder de audio. La entrada de audio es mono a 16 kHz; las imágenes se procesan a 280 o 560 tokens visuales según la variante, lo que ajusta el consumo de memoria de trabajo (aproximadamente 1 GB para vis280 y 2 GB para vis560). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Decisión multimodal: responde preguntas tipadas con 2 a 20 opciones sobre audio, imagen o texto, devolviendo una probabilidad por opción.
- Comprensión de audio: clasificación y decisión sobre clips de audio a 16 kHz mono.
- Comprensión de imágenes: análisis visual con 280 o 560 tokens de imagen según la variante.
- Procesamiento de texto: decisiones sobre preguntas de opción múltiple en formato textual.
- Ejecución on-device: inferencia completamente offline en la GPU del teléfono mediante LiteRT-LM.
- Sin generación de texto: el resultado es una distribución de probabilidad, no una respuesta redactada.
- Cascada con modelo pequeño: integración con Smaug-Audio-Decisions-0.7B para responder primero las preguntas de audio fáciles y escalar al modelo grande por debajo de 0,9 de confianza.
- Variantes modulares: ficheros con o sin encoder de audio/visión para adaptarse al RAM del dispositivo.

## Casos de uso

- Clasificación de audio en el dispositivo: una app móvil puede etiquetar sonidos, comandos de voz o eventos acústicos sin enviar audio a la nube, usando el encoder de audio int8 y la lectura de probabilidades por opción.
- Decisión visual offline: aplicaciones de campo (inspección, accesibilidad, catalogación) que necesitan elegir entre categorías a partir de una foto en teléfonos de 6-8 GB de RAM, con vis280 o vis560 según el dispositivo.
- Enrutamiento y triaje en asistentes móviles: dado un texto o audio del usuario, decidir entre un conjunto acotado de intenciones (2-20 opciones) en un solo prefill, con latencia mínima y sin generación.
- Cascada de bajo consumo: usar Smaug-Audio-Decisions-0.7B para las decisiones de audio fáciles y escalar a Smaug-Decisions-LiteRT solo cuando la confianza cae por debajo de 0,9, reduciendo el consumo energético.
- Moderación y filtrado on-device: clasificar contenido de texto o imagen en categorías predefinidas antes de cualquier procesamiento en servidor, preservando la privacidad.
- Investigación en modelos de decisión: evaluar la técnica de lectura de logits de letras frente a la generación autoregresiva en entornos con recursos limitados, usando los ficheros textonly (2,97 GB) como base mínima.
- Aplicaciones de accesibilidad: responder preguntas de opción múltiple sobre el entorno visual o sonoro de un usuario en tiempo real y sin conexión.

## Benchmarks y rendimiento

| Benchmark | Smaug-Decisions-LiteRT | Smaug-Decisions (full precision) |
|---|---|---|
| Earshot audio decisions | 59,4 | 60,1 |
| Decision Index (texto) | 53,9 | 56,6 |
| Decisiones sobre imágenes | 55,1 | 57,2 |

La model card indica que el resultado en Earshot audio (59,4) está a la par de Gemini 4 Argon (59,4) y a 0,7 puntos de la versión full-precision. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: fichero completo de 3,45 GB; requiere teléfonos con 8 GB de RAM o más para vis560 y 6 GB para vis280. Memoria de trabajo adicional de aproximadamente 1 GB (vis280) o 2 GB (vis560) para imágenes.
- Variantes ligeras: noaudio 3,15 GB, novision 3,28 GB, textonly 2,97 GB.
- GPU recomendadas: GPU integrada del teléfono (Metal en iOS, GPU móvil en Android mediante LiteRT-LM). No se especifican GPUs de escritorio.
- Dispositivos no soportados: teléfonos con menos de 6 GB de RAM, que solo ejecutan Smaug-Audio-Decisions-0.7B.
- Despliegue: LiteRT-LM (Google AI Edge) en iOS y Android; la app Cascade (602 MB en iOS, ~582 MB en Android arm64) integra los modelos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smaug-Decisions-LiteRT | 4B | no disponible | Audio, visión, texto | Apache 2.0 | HuggingFace, LiteRT-LM |
| Smaug-Decisions (full precision) | 4B | no disponible | Audio, visión, texto | Apache 2.0 | HuggingFace |
| Smaug-Audio-Decisions-0.7B | 0,7B | no disponible | Audio | Apache 2.0 | HuggingFace, Core ML / ONNX Runtime |

No se dispone de información sobre otros modelos comparables de decisión multimodal on-device en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre un conjunto cerrado de 2 a 20 opciones; no sirve para respuestas abiertas.
- Cuantización agresiva (int4 decoder, int2 embeddings): la pérdida de precisión frente al modelo completo es de 0,7 puntos en audio, 2,7 en texto y 2,1 en imágenes.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no disponible; no apto para entradas largas sin validación previa.
- Requiere LiteRT-LM y hardware móvil específico; no es desplegable directamente en vLLM, llama.cpp u otros runtimes estándar sin conversión.
- Riesgo de calibración: las probabilidades por opción pueden no estar bien calibradas fuera de los dominios de evaluación (Earshot, Decision Index).
- Sesgos: no documentados en la información disponible; al derivar de Gemma 4 E4B, puede heredar sesgos del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4 E4B.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; madurez de ecosistema limitada.

## Enlaces

- HuggingFace: https://huggingface.co/abacusai/Smaug-Decisions-LiteRT
- Modelo base: https://huggingface.co/abacusai/Smaug-Decisions
- Modelo de audio ligero: https://huggingface.co/abacusai/Smaug-Audio-Decisions-0.7B
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Abacus.AI: https://abacus.ai
- Organización en HuggingFace: https://huggingface.co/abacusai
