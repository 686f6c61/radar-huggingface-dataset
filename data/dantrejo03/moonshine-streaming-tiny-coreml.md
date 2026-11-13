# dantrejo03/moonshine-streaming-tiny-coreml

## Resumen

Moonshine Streaming Tiny for Core ML es una conversión del modelo de reconocimiento automático del habla (ASR) Moonshine Streaming Tiny de UsefulSensors al formato Core ML de Apple, publicada por el usuario dantrejo03. El objetivo es ejecutar transcripción de voz en streaming directamente en un Apple Watch, transcribiendo mientras el usuario todavía habla, sin depender de la nube. El repositorio incluye cinco submodelos en float16 que cubren el pipeline completo: frontend de audio, encoder, adapter, cálculo de claves/valores de atención cruzada y un paso de decodificador con caché de autoatención gestionada mediante `MLState`.

La relevancia de esta conversión es práctica: demuestra que un modelo ASR de tipo streaming puede fragmentarse en piezas compatibles con el Neural Engine de un reloj inteligente y mantener latencia interactiva. El modelo base es un transformer encoder-decoder ligero, entrenado únicamente en inglés, con licencia MIT. El repositorio pesa aproximadamente 0,1 GB y los pesos se distribuyen como paquetes `.mlpackage` (no como safetensors ni GGUF).

No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue orientado a watchOS 11, iOS 18 y macOS 15. La ficha describe tanto el modelo base subyacente como los detalles específicos de esta conversión Core ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine Streaming Tiny) convertido a Core ML en cinco submodelos float16 |
| Parametros totales | no disponible (el repositorio ocupa ~0,1 GB; el decoder_step pesa 41 MB, el encoder 14 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de hasta 15,36 s por segmento (768 frames de memoria); encoder con ventana de 116 frames de features |
| Tipos de cuantizacion | float16 en todos los submodelos Core ML; no se publican variantes int8/int4 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` (Core ML), tokenizer en `tokenizer.bin` |

## Arquitectura y entrenamiento

El modelo base Moonshine Streaming Tiny es un transformer encoder-decoder diseñado para ASR en streaming. La conversión Core ML lo divide en cinco piezas: un frontend convolucional que transforma 1280 muestras de audio (80 ms a 16 kHz) en 4 frames de features; un encoder que procesa ventanas de 116 frames con máscara de validez; un adapter que añade información posicional a los frames codificados; un módulo `cross_kv` que calcula claves y valores de atención cruzada; y un paso de decodificador que recibe un token y devuelve logits sobre un vocabulario de 32.768 tokens. El decodificador mantiene su caché de autoatención como estado Core ML (`MLState`), con formas `k_self`/`v_self` de `[6, 1, 8, 128, 64]` en float16 (6 capas, 8 cabezas).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión en sí no reentrena pesos: replica el comportamiento del pipeline Python de referencia, y el autor indica que los tokens finales coinciden con dicho pipeline en las grabaciones de prueba. La innovación técnica destacable es la fragmentación del grafo para que cada submodelo quepa y se ejecute en el Neural Engine de un Apple Watch, incluyendo un diseño de formas de 64 dimensiones por cabeza para evitar reubicaciones de memoria en cada llamada.

## Capacidades

- Reconocimiento automático del habla en inglés con salida de texto token a token.
- Transcripción en streaming: permite transcribir mientras se graba, reutilizando el estado del decodificador del segmento.
- Procesamiento por segmentos de hasta 15,36 s de audio (768 frames de memoria en la atención cruzada).
- Decodificación autorregresiva con realimentación del token de mayor puntuación y parada en token de fin o límite de 6,5 tokens por segundo de audio (máximo 128 tokens).
- Tokenizador propio incluido (`tokenizer.bin`) con 32.768 entradas y decodificación UTF-8 tras sustituir `▁` por espacio.
- Ejecución en dispositivo con Neural Engine en Apple Watch Series 9 o posterior; el frontend debe ejecutarse solo en CPU.
- No soporta tool calling, function calling, agentes, visión, audio de entrada distinto de voz ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Transcripción en directo en Apple Watch: la app captura audio en fragmentos de 80 ms, ejecuta el frontend en CPU y el resto del pipeline en CPU + Neural Engine, mostrando texto mientras el usuario habla. Es adecuado porque el modelo está fragmentado para caber en un reloj y el estado del decodificador persiste durante el segmento.
- Notas de voz dictadas sin conexión: el usuario graba hasta 15,36 s por segmento y obtiene la transcripción en el propio dispositivo, sin enviar audio a la nube. La licencia MIT y el tamaño reducido (~0,1 GB) facilitan su integración en apps watchOS.
- Subtitulado de conversaciones cortas en entornos sin red: al ejecutarse localmente en watchOS/iOS/macOS, sirve para escenarios de privacidad estricta donde no se permite salida de datos.
- Asistentes de accesibilidad: transcripción en tiempo real de voz a texto para personas con dificultades auditivas, con latencia de paso de decodificador de 12,4 ms de mediana en Series 9.
- Prototipado de ASR en el borde: investigadores pueden usar la conversión como referencia para medir latencia y consumo en Neural Engine sin depender de infraestructura servidor.
- Integración en apps de macOS/iOS: el mismo pipeline puede compilarse y ejecutarse en Mac o iPhone (watchOS 11, iOS 18, macOS 15), útil para pruebas y para despliegues en dispositivos Apple más potentes.
- Dictado por voz en aplicaciones de campo: registro de observaciones breves en entornos con conectividad intermitente, aprovechando la ejecución totalmente local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de esta conversión en la información disponible. El autor indica explícitamente que no midió la tasa de error de palabras (WER) para esta conversión y remite a la model card del modelo original, que reporta un 12,01 % de media en el Open ASR Leaderboard.

Datos de rendimiento en dispositivo publicados por el autor (Apple Watch Series 9):

| Metrica | Valor |
|---|---|
| Paso de decodificador (mediana) | 12,4 ms |
| Fin de grabación a texto final (4,8 s de voz) | 424 ms |
| Fin de grabación a texto final (8,4 s de voz) | 629 ms |
| Fin de grabación a texto final (14-15 s de voz) | ~1,26 s |
| WER de esta conversión | no medida |
| WER del modelo original (Open ASR Leaderboard) | 12,01 % de media |

## Requisitos de hardware

- VRAM/RAM: no aplica VRAM de GPU; el pipeline se ejecuta en el Neural Engine y CPU del dispositivo. El repositorio completo ocupa ~0,1 GB; el submodelo mayor es `decoder_step.mlpackage` con 41 MB.
- Dispositivos compatibles: Apple Watch Series 9 o posterior (un Series 8 con Neural Engine de 2 núcleos rechaza los modelos); también Mac y iPhone con watchOS 11, iOS 18 o macOS 15.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, al ser un artefacto Core ML para Apple Silicon y Neural Engine.
- Cabe en hardware de consumo Apple: sí, en Apple Watch Series 9+, iPhone y Mac compatibles con las versiones de sistema indicadas.
- Opciones de despliegue: Core ML (`MLModel`, `MLModelConfiguration`, `MLState`); el autor proporciona el paquete Swift `MoonshineTranscription` en el repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: paso de decodificador de 12,4 ms de mediana; tiempo de finalización de 424 ms a ~1,26 s según duración del audio (Series 9).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Moonshine Streaming Tiny (Core ML, esta ficha) | no disponible (~0,1 GB repo) | 15,36 s por segmento | en | MIT | `.mlpackage` | Optimizado para Apple Watch Series 9+ |
| Moonshine Streaming Tiny (original, UsefulSensors) | no disponible | no disponible en la informacion | en | MIT (según modelo base) | safetensors (presumible, no confirmado) | WER 12,01 % medio en Open ASR Leaderboard |
| Whisper (variantes pequeñas) | no disponible en la informacion | no disponible en la informacion | multilingue | MIT/Apache según variante | varios | No se dispone de datos comparativos en la informacion proporcionada |
| Otros ASR ligeros para el borde | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas más allá del modelo base original.

## Limitaciones y advertencias

- Solo inglés, igual que el modelo original; no soporta otros idiomas.
- El autor advierte que el modelo puede alucinar o repetir texto.
- No se ha medido el WER de esta conversión; el 12,01 % corresponde al modelo original y puede no reflejar el rendimiento exacto del pipeline Core ML.
- Requiere Apple Watch Series 9 o posterior; un Series 8 con Neural Engine de 2 núcleos rechaza los modelos.
- El frontend debe ejecutarse con `computeUnits = .cpuOnly`; en el Neural Engine de un Series 9 calcula features incorrectas.
- Requiere watchOS 11, iOS 18 o macOS 15 por el uso de `MLState` en la caché del decodificador.
- Los modelos no pueden compilarse en el reloj: deben compilarse en Xcode o en Mac/iPhone y distribuirse como `.mlmodelc`.
- Segmentos limitados a 15,36 s de audio; el estado se reinicia entre segmentos.
- Límite de decodificación de 6,5 tokens por segundo de audio (máximo 128 tokens), lo que puede truncar transcripciones densas.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base original y de sus dependencias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.
- Diseñado para inferencia en dispositivo Apple; no es adecuado para despliegue en servidores con GPU convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dantrejo03/moonshine-streaming-tiny-coreml
- Modelo base (UsefulSensors): https://huggingface.co/UsefulSensors/moonshine-streaming-tiny
- Repositorio de la app y código de conversión: https://github.com/dantrejo03/moonshine-watchos
- Open ASR Leaderboard (referencia de WER del modelo original): no disponible en la información proporcionada
