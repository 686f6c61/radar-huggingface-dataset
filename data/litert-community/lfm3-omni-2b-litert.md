# litert-community/LFM3-Omni-2B-LiteRT

## Resumen

LFM3-Omni-2B-LiteRT es la conversión a formato LiteRT del modelo omnilmodal LFM3-Omni-2B de Liquid AI, publicada por la organización litert-community de Google. Se trata de un modelo multimodal "any-to-any" de 2,17 mil millones de parámetros capaz de leer texto, imágenes y audio, y responder en texto o voz. Esta versión empaqueta el modelo en un único archivo `.litertlm` para ejecutarse con el runtime LiteRT-LM de Google en dispositivos edge (móviles y ordenadores de escritorio), sin depender de la nube.

Su relevancia reside en resolver el problema de desplegar modelos omnilmodales completos en hardware de consumo: la conversión mantiene la fidelidad del modelo original (coincidencia de siguiente token del 99 % respecto al modelo fuente en float32) y ofrece mediciones reales de rendimiento en dispositivos como el Galaxy S26 y el Pixel 8a, con decodificación de 27 tokens por segundo en GPU móvil. Es una de las pocas opciones open source que combinan entrada de imagen, audio y texto con salida de voz en un paquete on-device tan ligero.

La arquitectura subyacente es la familia LFM (Liquid Foundation Models) de Liquid AI, con 2,17 mil millones de parámetros en BF16 en el modelo fuente y una ventana de contexto de 4.096 tokens en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models) omnilmodal, any-to-any, con encoders de visión y audio integrados |
| Parametros totales | 2,17 B (BF16, modelo fuente) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | int8 (decodificador en el archivo `.litertlm`), f32 (grafos de voz), fp16/fp32 (activaciones en GPU) |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0, "other") |
| Formato de pesos | `.litertlm` (LiteRT-LM), `.tflite` (grafos de voz), safetensors en el modelo fuente; GGUF publicado por LiquidAI |

## Arquitectura y entrenamiento

El modelo base es LFM3-Omni-2B de Liquid AI, un modelo any-to-any que procesa texto, imágenes, vídeo y audio, y genera texto o voz. Esta conversión de litert-community incluye el decodificador principal cuantizado a int8 dentro de un archivo `.litertlm`, con los encoders de visión y audio integrados en el mismo paquete. La salida de voz se implementa mediante grafos LiteRT independientes: un decodificador de profundidad (depth decoder) que revela los 12 códigos de cada fotograma de 80 ms en tres llamadas, un módulo de embedding de fotograma y un decodificador de códec de audio que reconstruye la señal (12 fotogramas por llamada = 0,96 s de audio).

El audio de entrada se lee en ventanas de 30 segundos, y las grabaciones se procesan como WAV mono de 16 kHz y 16 bits. No se dispone de información sobre el proceso de entrenamiento del modelo fuente (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada. La conversión se realizó desde la revisión `ce2458cb` del modelo fuente.

## Capacidades

- Respuestas en texto a partir de texto, imágenes o audio (reconocimiento de voz, preguntas sobre grabaciones).
- Salida de voz: síntesis de texto a voz (TTS) y respuestas habladas intercaladas con el texto.
- Procesamiento de audio largo: grabaciones de más de 30 s se leen en ventanas de 30 s mientras quepan en el contexto de 4.096 tokens (una grabación de 251 s cabe; una de 502 s no).
- ASR (transcripción de audio a texto) mediante instrucciones de sistema.
- Entrada de imagen: descripción y preguntas sobre fotografías.
- Ejecución completamente on-device en CPU y GPU móvil mediante LiteRT-LM 0.18.1.
- No soportado en esta versión: entrada de vídeo y aceleración por NPU.

## Casos de uso

- Asistentes de voz en móvil: el modelo transcribe la pregunta hablada y genera una respuesta hablada on-device, sin enviar audio a la nube, con latencia media de 3,1 s desde el fin de la pregunta hasta el primer sonido en un Galaxy S26.
- Transcripción de audio (ASR): mediante una instrucción de sistema "Perform ASR in English" se puede transcribir grabaciones largas (hasta ~250 s) en ventanas de 30 s, útil para notas de voz y dictado.
- Analisis de imágenes en la periferia: preguntas sobre fotografías locales (por ejemplo, identificar animales u objetos) sin subir las imágenes, adecuado para apps de accesibilidad o inventario fotográfico.
- Chat multimodal privado: conversaciones que combinan texto, imagen y audio con garantía de privacidad, ya que todo el procesamiento ocurre en el dispositivo.
- Texto a voz embebido: generación de locuciones a partir de texto (0,48-0,50 s de cómputo por segundo de audio en un Mac M4 Max) para narración, avisos o interfaces manos libres.
- Prototipado de agentes edge: el paquete incluye un runner de Python, fixtures con comprobaciones y un ejemplo de línea de comandos, lo que facilita integrar el modelo en pipelines de prueba automatizadas.
- Chat de voz sobre fotos: el ejemplo Android `photo_voice_chat` demuestra el flujo completo: foto + pregunta hablada + respuesta hablada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican mediciones de rendimiento y fidelidad de la conversión:

Galaxy S26 (SM-S942Q), LiteRT-LM 0.18.1, 1.024 tokens de prompt, 256 tokens generados, mediana de 2 procesos:

| Backend | Prefill (tok/s) | Decode (tok/s) | Time to first token | Memoria pico (VmHWM) |
|---|---:|---:|---:|---:|
| GPU (fp16 activations) | 1.139 | 27,0 | 0,93-0,94 s | 1,05 GB (+ 3,08 GB GPU) |
| CPU, 4 hilos | 557 | 25,9 | 1,8-1,9 s | 3,42 GB |

Con activaciones fp32 en GPU: 270 tok/s de prefill y 23,5 tok/s de decode.

Fidelidad respecto al modelo fuente en float32 (PyTorch, CPU):
- 14 de 14 comprobaciones de texto pasan con texto idéntico al modelo fuente en Mac (CPU y GPU), Galaxy S26 (GPU) y Pixel 8a (GPU).
- Coincidencia de siguiente token teacher-forced: 230 de 233 posiciones.
- Salida de voz: 12 de 12 ejecuciones pasan las comprobaciones de transcripción Whisper, longitud y sonoridad.

Rendimiento de voz: 0,48-0,50 s de cómputo por segundo de audio (Mac M4 Max, CPU, decodificador + depth decoder + embedding); el códec añade unos 6 ms por 0,96 s de audio. En Galaxy S26 CPU: 1,15 s por segundo de voz generado.

## Requisitos de hardware

- Archivo principal de 3,23 GB (decodificador int8 con encoders de visión y audio); los grafos de voz añaden unos 937 MB adicionales.
- Memoria pico medida: 1,05 GB de proceso + 3,08 GB de asignaciones GPU en Galaxy S26 (GPU); 3,42 GB en CPU con 4 hilos.
- Dispositivos verificados: Galaxy S26 (SM-S942Q, GPU y CPU), Pixel 8a (GPU), Mac (runner de voz en CPU, M4 Max).
- Ejecutable en móviles Android de gama alta y en ordenadores de escritorio (macOS) vía LiteRT-LM; no requiere GPU de servidor.
- NPU no soportada en esta versión.
- Despliegue mediante LiteRT-LM 0.18.1 (runtime oficial de Google), LiteRT 2.3.0 en el ejemplo Android, y el runner de Python incluido en el repositorio (`examples/run_omni.py`).
- Latencia: primer token en 0,93-0,94 s (GPU móvil); primer sonido de voz en 3,1 s de media tras la pregunta hablada (Galaxy S26 CPU).
- No se dispone de datos de requisitos de VRAM para GPU de servidor (A100, H100, RTX 4090), ya que el modelo está orientado a edge.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada/Salida | Formato on-device | Licencia |
|---|---|---|---|---|---|
| LFM3-Omni-2B-LiteRT | 2,17 B | 4.096 tokens | texto+imagen+audio / texto+voz | `.litertlm` + `.tflite` | LFM Open License v1.0 |
| LiquidAI/LFM3-Omni-2B (fuente) | 2,17 B (BF16) | no disponible en esta ficha | texto+imagen+video+audio / texto+voz | PyTorch, GGUF | LFM Open License v1.0 |
| Gemma 3n (Google) | ~2-4 B | no disponible en esta ficha | texto+imagen+audio / texto | litert/tflite | Gemma Terms of Use |

La alternativa directa es el propio modelo fuente de LiquidAI (mismas capacidades, mayor cobertura de entrada al incluir vídeo, pero sin el empaquetado LiteRT optimizado para móvil) y los modelos Gemma 3n de Google, que también apuntan a inferencia multimodal on-device, aunque la comparativa detallada de rendimiento no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; no hay soporte documentado para castellano ni otros idiomas.
- Entrada de vídeo y aceleración por NPU no soportadas en esta versión.
- Contexto limitado a 4.096 tokens: grabaciones de audio muy largas (más de ~250 s) no caben en el contexto.
- La salida de voz solo admite texto o una grabación de 30 s o menos como entrada.
- El ejemplo crea un nuevo Engine para cada pregunta, y en pruebas de resistencia el teléfono caliente provocó pausas en la generación de voz (4 de 9 respuestas en un dispositivo caliente; ninguna en teléfono frío).
- Licencia "other" (LFM Open License v1.0): conviene revisar las condiciones de uso comercial en el enlace de la licencia antes de desplegar en producción.
- Riesgo de alucinación: no documentado específicamente para este modelo; al tratarse de un modelo pequeño (2,17 B) multimodal, es esperable en tareas de razonamiento complejo.
- Cuantización int8: la fidelidad es muy alta (230/233 posiciones de siguiente token), pero la descripción libre de imágenes solo coincidió con el modelo fuente en los primeros 8 de 32 tokens, lo que indica pequeñas divergencias en generación larga.
- El bucle de voz se ejecuta en CPU, lo que limita el throughput de síntesis en dispositivos de gama baja.

## Enlaces

- Modelo LiteRT: https://huggingface.co/litert-community/LFM3-Omni-2B-LiteRT
- Modelo fuente: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Versión GGUF del modelo fuente: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Licencia: https://huggingface.co/litert-community/LFM3-Omni-2B-LiteRT/blob/main/LICENSE
- Ejemplo Android photo_voice_chat: https://github.com/google-ai-edge/litert-samples/pull/507
