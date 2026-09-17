# devendradhakad/autodroid-litert-community-Matcha-TTS

## Resumen

Matcha-TTS — LiteRT es un paquete de inferencia de texto a voz (TTS) en dispositivo, publicado por el usuario devendradhakad en Hugging Face bajo licencia MIT. No es un modelo entrenado desde cero: es una conversión a LiteRT/TFLite de los checkpoints oficiales `matcha_ljspeech` y `hifigan_T2_v1`, reautoria con la herramienta litert-torch para que funcione con aceleración GPU en Android mediante `CompiledModel`. La voz resultante es la de LJSpeech, en inglés, a 22,05 kHz.

La particularidad técnica es que se trata de una ruta de síntesis libre de FFT: el modelo acústico de flow matching condicional (CFM) de Matcha-TTS genera mel-espectrogramas y el vocoder HiFi-GAN los convierte a forma de onda en el dominio temporal, sin iSTFT en ningún punto del pipeline. El paquete se compone de cuatro grafos `.tflite` (encoder de texto, decoder CFM, vocoder y un modelo neuronal de G2P) más una tabla de embeddings de fonemas y un diccionario espeak-IPA de 275.000 entradas que se ejecutan en el host.

Es relevante para quien necesite TTS neuronal sin conexión, con latencia de tiempo real (RTF ~0,8 medido en un Pixel 8a) y sin dependencia de servicios en la nube. También sirve como referencia de conversión: el autor reporta correlación 1,000000 por grafo frente a PyTorch y ≥0,99 en la forma de onda extremo a extremo. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Matcha-TTS: encoder de texto tipo transformer + decoder de flow matching condicional (CFM) no autorregresivo, con regulador de longitud y muestreo Euler; vocoder HiFi-GAN en dominio temporal; G2P híbrido (diccionario espeak-IPA + modelo neuronal DP) |
| Parámetros totales | no disponible (no publicado por el autor; los cuatro grafos `.tflite` suman ~93 MB en fp16, lo que da un orden de magnitud estimado de ~46 M de parámetros, estimación no confirmada) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; formas fijas de 256 fonemas de entrada y 512 tramas mel de salida (~5,9 s de audio por pasada, ampliable por concatenación en el host) |
| Tipos de cuantización | fp16 en los cuatro grafos `.tflite`; tablas auxiliares en f32 (`emb.bin`) |
| Idiomas soportados | inglés (`en`), voz única LJSpeech |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (`.tflite`), más `emb.bin` (f32), `g2p_dict.txt.gz`, `config.json` y `g2p_meta.json` |
| Frecuencia de muestreo | 22.050 Hz |
| Tamaño del repositorio | 0,1 GB |
| Delegados de ejecución | GPU (encoder de texto y vocoder), CPU (decoder CFM y G2P neuronal) en Pixel 8a |
| Fecha de publicación | 17 de septiembre de 2026 (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El pipeline sigue el diseño de Matcha-TTS. El texto se normaliza y se convierte a fonemas IPA mediante un G2P híbrido: primero se consulta un diccionario espeak-IPA de 275.000 entradas (archivo `g2p_dict.txt.gz`) y, para palabras fuera de vocabulario, se usa un modelo neuronal de 26 MB (`dp_g2p_matcha_fp16.tflite`) que mapea identificadores de carácter `[1,96]` a logits IPA `[1,96,64]`. Los fonemas se convierten en embeddings de 192 dimensiones mediante una tabla de 178×192 (`emb.bin`), se intercalan posiciones en blanco (id 0) y se rellenan hasta 256 posiciones.

El encoder de texto (15 MB, GPU) produce `mu[1,80,256]` y `logw[1,1,256]`; el host calcula las duraciones con `ceil(exp(logw)) × 0,95`, aplica el regulador de longitud y obtiene `mu_y[1,80,512]`. El decoder CFM (23 MB, CPU) ejecuta 10 pasos Euler del ODE con una codificación sinusoidal del tiempo `t_sin[1,160]` y una máscara flotante de longitud de ejecución que anula las posiciones de relleno, de modo que un único grafo compilado sirve para cualquier longitud. La mel resultante se desnormaliza con `x·2,116101 − 5,536622` y el vocoder (29 MB, GPU) genera `wav[1,1,131072]`.

El autor no detalla el dataset de entrenamiento porque no ha reentrenado: usa los checkpoints oficiales, entrenados sobre LJSpeech (habla inglesa de una única locutora, dominio público) con el procedimiento original de Matcha-TTS, que combina alineamiento monotónico para las duraciones y flow matching condicional para la parte acústica. La innovación destacable de este artefacto es la ingeniería de conversión: pesos fp16, formas fijas con máscara dinámica, y una separación deliberada de delegados. El decoder CFM convierte correctamente y funciona en CPU, pero el delegado GPU Mali ML Drift fusiona mal sus bloques transformer cuando la magnitud de activación es alta: el mismo bloque aislado da correlación 0,984 y fusionado cae a 0,006. Se trata de un error de fusión de grafo, no de una operación defectuosa.

## Capacidades

- Síntesis de voz en inglés a partir de texto, a 22,05 kHz, con la voz de LJSpeech (locutora única).
- Fonemización G2P completa: diccionario espeak-IPA de 275.000 entradas más respaldo neuronal para palabras fuera de vocabulario.
- Inferencia totalmente local y sin conexión, sobre LiteRT `CompiledModel` con delegados GPU y CPU.
- Ejecución en navegador mediante LiteRT.js (text encoder y vocoder en WebGPU, decoder en WASM), sin instalación.
- Procesamiento por fragmentos de hasta 256 fonemas / 512 tramas mel (~5,9 s), ampliable concatenando pasadas en el host.
- Latencia de tiempo real: RTF ~0,8 en un Pixel 8a, con el vocoder en GPU dominando el tiempo de pared.
- Ruta de síntesis sin FFT ni iSTFT: decoder en dominio temporal con HiFi-GAN.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada multimodal: es exclusivamente un modelo de texto a voz.
- No soporta otros idiomas distintos del inglés, ni cambio de locutor ni clonación de voz.

## Casos de uso

- Lectores de pantalla y accesibilidad en Android: el paquete se integra con `CompiledModel.create` sobre archivos en `filesDir` y funciona sin red, lo que permite leer contenido en dispositivos sin conectividad con latencia de tiempo real.
- Asistentes de voz embebidos: RTF ~0,8 en hardware móvil de gama media-alta permite respuestas habladas encadenadas sin acumular retardo perceptible, siempre en inglés y con voz fija.
- Navegación y avisos en tiempo real: la ventana de ~5,9 s por pasada encaja con instrucciones cortas de navegación o notificaciones, donde el coste de red sería inaceptable.
- Aplicaciones de aprendizaje de inglés: la fonemización IPA explícita del pipeline permite exponer la transcripción fonética junto al audio generado, útil en ejercicios de pronunciación.
- Síntesis en kioscos, cajeros o dispositivos IoT: al no requerir GPU dedicada ni servicio externo, el modelo cabe en dispositivos con recursos limitados y presupuesto energético acotado.
- Prototipado en navegador sin instalación: la demo con LiteRT.js permite evaluar la calidad y la latencia del pipeline en WebGPU/WASM antes de comprometerse con una integración nativa.
- Verificación de conversiones LiteRT/TFLite: el artefacto documenta correlaciones por grafo (1,000000) y extremo a extremo (≥0,99), lo que lo convierte en caso de referencia para pipelines de conversión con litert-torch, incluido el diagnóstico del fallo de fusión del delegado Mali.
- Generación de audio para pruebas automatizadas: al ser determinista por pasos Euler y ejecutarse en CPU mediante el intérprete de `ai_edge_litert`, resulta adecuado para tests de regresión de audio en integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de validación de la conversión, que se recogen a continuación.

| Métrica | Valor | Contexto |
|---|---|---|
| Correlación tflite vs. torch por grafo | 1,000000 | Verificación de conversión con litert-torch |
| Correlación de forma de onda extremo a extremo | ≥0,99 | Pipeline completo text-to-mel-to-waveform |
| RTF (real-time factor) | ~0,8 | Pixel 8a, encoder y vocoder en GPU, decoder en CPU |
| Correlación del decoder aislado en GPU | 0,984 | Bloque individual como grafo GPU independiente |
| Correlación del decoder fusionado en GPU Mali | 0,006 | Fallo de fusión de bloques transformer del delegado ML Drift |
| MMLU, HumanEval, GSM8K u otros | no disponible | No aplicables a un modelo TTS |

## Requisitos de hardware

- VRAM/RAM para inferencia: los pesos suman ~93 MB en fp16 (15 MB encoder + 23 MB decoder + 29 MB vocoder + 26 MB G2P), más 1,8 MB de diccionario y 0,1 MB de tabla de embeddings. El mayor tensor de activación es `wav[1,1,131072]` en float32 (~0,5 MB), por lo que el consumo de memoria es bajo incluso en móvil. No hay cifras oficiales de consumo publicado.
- GPU recomendadas: no requiere GPU de escritorio. El caso de referencia es la GPU Mali de un Pixel 8a mediante el delegado GPU de LiteRT; en navegador se usa WebGPU. En equipos de sobremesa basta con CPU o cualquier GPU integrada compatible con WebGPU.
- Cabe en GPU de consumo: sí, y de hecho el objetivo es hardware móvil. No se necesita una RTX 4090, A100 ni H100; no hay soporte declarado para CUDA ni para aceleradores de centro de datos.
- Opciones de despliegue: LiteRT `CompiledModel` en Android (Kotlin), intérprete `ai_edge_litert` en Python para verificación en escritorio, LiteRT.js (`@litertjs/core`) en navegador con WebGPU + WASM. No aplica vLLM, TGI, llama.cpp ni Ollama, que son runtimes de modelos de lenguaje.
- Latencia y throughput: RTF ~0,8 en Pixel 8a (el vocoder en GPU domina el tiempo de pared), lo que equivale a poco más de 1,25 s de audio generado por segundo de cómputo. No se han publicado cifras de throughput para escritorio.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos en la información disponible, por lo que las celdas de rendimiento se marcan como no disponibles. La comparación se limita a características objetivas del artefacto y de alternativas conocidas de la misma categoría (TTS ligero para dispositivo).

| Modelo | Tipo | Tamaño | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Matcha-TTS — LiteRT (este) | CFM + HiFi-GAN, sin FFT | ~93 MB en fp16 (4 grafos) | inglés | MIT | LiteRT / TFLite | Delegados GPU+CPU, RTF ~0,8 en Pixel 8a, G2P híbrido diccionario+neuronal |
| Matcha-TTS original (shivammehta25) | CFM + HiFi-GAN | no disponible en esta información | inglés (checkpoints LJSpeech) | MIT | PyTorch | Implementación de referencia; requiere PyTorch y ejecución en servidor o escritorio |
| Piper | VITS | no disponible en esta información | multilingüe | MIT | ONNX / otros | Diseñado para dispositivo; número de idiomas y voces amplio |
| Kokoro-82M | no disponible en esta información | 82 M | inglés y otros | Apache-2.0 | ONNX / safetensors | Orientado a TTS ligero con calidad alta; rendimiento comparativo no disponible aquí |

## Limitaciones y advertencias

- Idioma único: solo inglés. El diccionario G2P y el modelo neuronal están entrenados para inglés; el texto en otros idiomas producirá una pronunciación incorrecta.
- Voz única: la única voz disponible es la de LJSpeech; no hay selección de locutor ni clonación.
- Límite de longitud por pasada: 256 fonemas de entrada y 512 tramas mel (unos 5,9 s). Los textos más largos exigen concatenar fragmentos en el host y gestionar las transiciones, con riesgo de artefactos en las uniones.
- Dependencia del host: el pipeline no está autocontenido dentro de los `.tflite`. Requiere orquestación externa (lookup de embeddings, intercalado de blancos, cálculo de duraciones, bucle ODE de 10 pasos Euler, desnormalización de mel) implementada en Kotlin, Python o JavaScript.
- Fallo conocido en GPU Mali: el delegado ML Drift fusiona incorrectamente los bloques transformer del decoder a magnitudes altas de activación (correlación 0,006). El decoder debe forzarse a CPU, lo que condiciona el reparto de cargas en Android.
- Riesgo de alucinación fonética: como todo modelo acústico, puede producir pronunciaciones erróneas o prosodia degradada en palabras raras, siglas, números o texto no normalizado; el respaldo G2P neuronal no garantiza corrección.
- Precisión fp16: no se distribuyen variantes cuantizadas a int8 ni en f32; el autor no documenta el impacto de la precisión reducida en la calidad percibida.
- Estado del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin proceso de revisión comunitario. La reproducibilidad depende del autor.
- Licencias aguas arriba: aunque el artefacto declara MIT, conviene verificar las condiciones de los checkpoints originales (`matcha_ljspeech`, `hifigan_T2_v1`) y del corpus LJSpeech antes de un uso comercial. LJSpeech es de dominio público según su publicación habitual.
- Sin soporte para tool calling, agentes ni multimodalidad: cualquier arquitectura que lo integre debe aportar esas capacidades por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devendradhakad/autodroid-litert-community-Matcha-TTS
- Repositorio original de Matcha-TTS: https://github.com/shivammehta25/Matcha-TTS
- LiteRT / litert-torch (Google AI Edge): https://github.com/google-ai-edge/litert
- Demo en navegador con LiteRT.js: https://john-rocky.github.io/litertjs-demos/matcha-tts/
- Paquete npm de LiteRT.js: https://www.npmjs.com/package/@litertjs/core
- Muestras oficiales de LiteRT, incluido el ejemplo `text_to_speech` (Matcha-TTS): repositorio google-ai-edge/litert-samples
- Resultados de búsqueda web: no se ha recuperado información relevante sobre este modelo; los resultados devueltos corresponden a páginas no relacionadas (visor de Autodesk). No se dispone de paper, blog ni anuncio adicional del autor.
