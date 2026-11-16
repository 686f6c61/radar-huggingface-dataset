# litert-community/Matcha-TTS

## Resumen

Matcha-TTS en formato LiteRT es una implementación lista para dispositivos de síntesis de voz (TTS) en inglés, publicada por la comunidad `litert-community`. Se trata de la conversión a LiteRT (el runtime on-device de Google, antes conocido como TensorFlow Lite) del modelo Matcha-TTS original, que combina un modelo acústico de flow-matching condicional (CFM) con un vocoder HiFi-GAN en dominio temporal. El resultado es un pipeline de síntesis sin FFT ni iSTFT en ninguna etapa, lo que simplifica el despliegue en hardware móvil y embebido.

El modelo se distribuye como un conjunto de cuatro ficheros `.tflite` en fp16 (encoder de texto, decoder CFM, vocoder y un modelo G2P neuronal), junto con tablas de embeddings y un diccionario de pronunciación espeak-IPA. Está pensado para ejecutarse mediante `CompiledModel` en Android, con delegados GPU y CPU seleccionables por grafo, y también en navegador mediante LiteRT.js y WebGPU. La voz sintetizada es la de LJSpeech a 22,05 kHz, en inglés.

Su relevancia actual radica en que demuestra un pipeline TTS completo ejecutándose en tiempo real en hardware de gama baja (Raspberry Pi 5, Pixel 8a) y en navegador, con latencias medidas y publicadas por componente. El repositorio ocupa solo 0,1 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS: encoder de texto transformer + decoder de flow-matching condicional (CFM) con ODE Euler + vocoder HiFi-GAN en dominio temporal (sin FFT/iSTFT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 fonemas de entrada; 512 frames mel de salida (aprox. 5,9 s por pasada) |
| Tipos de cuantizacion | fp16 (pesos de los cuatro grafos `.tflite`) |
| Idiomas soportados | ingles (voz LJSpeech) |
| Licencia | MIT |
| Formato de pesos | `.tflite` (LiteRT), mas `emb.bin` (tabla de embeddings 178x192 f32) y `g2p_dict.txt.gz` |
| Frecuencia de muestreo | 22.05 kHz |
| Tamano del repositorio | 0,1 GB |
| Runtime | LiteRT 2.2.0 (Android `com.google.ai.edge.litert:litert`), LiteRT.js 2.5.3 |
| Conversion | litert-torch (antes ai-edge-torch) desde `matcha_ljspeech` + `hifigan_T2_v1` |

## Arquitectura y entrenamiento

El pipeline consta de cuatro grafos independientes orquestados desde el host. Primero, un G2P híbrido: un diccionario espeak-IPA de 275.000 entradas como vía principal y un modelo neuronal `dp_g2p_matcha_fp16.tflite` (texto de 96 caracteres a logits de 64 símbolos IPA) como respaldo. Después, el encoder de texto recibe embeddings de fonemas con blanks intercalados y una máscara, y produce `mu[1,80,256]` y `logw[1,1,256]`. El host calcula duraciones y aplica un regulador de longitud para obtener `mu_y[1,80,T]`. El decoder CFM ejecuta un bucle ODE de Euler con N pasos sobre `x, mu[1,80,512]`, `t_sin[1,160]` y máscara, devolviendo `v[1,80,512]`. Finalmente, el vocoder HiFi-GAN convierte el mel `[1,80,512]` en onda `[1,1,131072]`.

Las formas son fijas (256 fonemas, 512 frames mel), pero una máscara float en tiempo de ejecución convierte las posiciones de relleno en no-ops, de modo que un único grafo compilado sirve para cualquier longitud. La conversión desde PyTorch se hizo sin modificar el modelo, con correlación tflite-vs-torch de 1.000000 por grafo y correlación end-to-end de onda ≥0,99. Los pesos están en fp16. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el modelo original se entrenó sobre LJSpeech.

Una particularidad técnica destacable es que el decoder CFM debe ejecutarse en el delegado CPU: el delegado GPU Mali ML Drift fusiona incorrectamente sus bloques transformer con activaciones de gran magnitud (correlación 0,006 fusionado frente a 0,984 como grafo GPU aislado). El encoder de texto y el vocoder sí corren en GPU, y como el vocoder domina el tiempo de pared, el pipeline global se mantiene en tiempo real (RTF ~0,8).

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida a 22,05 kHz.
- Conversión grafema-fonema híbrida: diccionario espeak-IPA de 275.000 entradas más modelo neuronal de respaldo para palabras fuera del diccionario.
- Generación de duraciones y regulación de longitud para control del ritmo.
- Muestreo por flow-matching con bucle ODE de Euler configurable en número de pasos.
- Ejecución on-device en Android mediante `CompiledModel` con delegados GPU y CPU por grafo.
- Ejecución en navegador mediante LiteRT.js con WebGPU (encoder de texto y vocoder en GPU, decoder en WASM).
- Soporte de longitudes variables en un único grafo compilado gracias a la máscara float de relleno.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de notificaciones y accesibilidad en Android: el pipeline completo cabe en cuatro `.tflite` de 15, 23, 29 y 26 MB y se ejecuta con `CompiledModel` en el dispositivo, sin conexión ni servidor, lo que permite leer en voz alta contenido dinámico con latencia de milisegundos por componente.
- Asistentes de voz embebidos en Raspberry Pi 5: con 22,0 ms p50 para el G2P, 38,7 ms para el encoder de texto y 69,7 ms para el decoder en CPU/XNNPACK a 4 hilos, más el vocoder en GPU, el sistema puede responder en tiempo real en hardware de bajo coste.
- Síntesis en navegador sin instalación: la demo pública ejecuta los mismos ficheros con LiteRT.js, con el encoder de texto en 5,99 ms p50 y el vocoder en 104 ms p50 sobre WebGPU en un M4 Max, útil para aplicaciones web de lectura o previsualización de voces.
- Audiolibros y contenido largo por fragmentos: dado que cada pasada cubre unos 5,9 s de audio (512 frames mel), se puede segmentar texto en trozos y encadenar síntesis manteniendo la coherencia de la voz LJSpeech.
- Prototipado de interfaces conversacionales: al ser MIT y ocupar 0,1 GB, se integra en prototipos de IVR, kioscos o juguetes conectados sin coste de licencia ni dependencia de la nube.
- Evaluación comparativa de runtimes on-device: los registros publicados por componente (LiteRT CPU/XNNPACK frente a WebGPU) permiten usar el modelo como referencia para medir rendimiento de delegados en nuevos dispositivos.
- Generación de datos de voz sintética para pruebas de pipelines de ASR: la salida determinista por configuración y la licencia permisiva facilitan crear corpus de prueba en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MOS, WER, MCD) en la información disponible. Sí se publican latencias medidas por componente:

| Componente | Raspberry Pi 5, LiteRT 2.2.0.dev20260804, CPU/XNNPACK 4 hilos | Navegador, Chromium 151 en M4 Max, LiteRT.js 2.5.3, WebGPU |
|---|---|---|
| `dp_g2p_matcha_fp16` | 22,0 ms p50 (2026-08-31) | 136 ms p50 (2026-08-11) |
| `matcha_decoder_fp16` | 69,7 ms p50 (2026-08-31) | 9,55 ms p50; salida distinta de CPU (max rel diff 6e+03) |
| `matcha_textenc_fp16` | 38,7 ms p50 (2026-08-31) | 5,99 ms p50; salida coincide con CPU |
| `matcha_vocoder_fp16` | 5825 ms p50 (2026-08-31) | 104 ms p50; salida distinta de CPU (max rel diff 0,22) |

Datos adicionales: la conversión con litert-torch igualó al modelo PyTorch original con diferencia de 4e-7 en un Galaxy S26 (LiteRT 2.2.0, Android 16, 2026-09-05). El pipeline completo se mantiene en RTF ~0,8 en el dispositivo de referencia con el vocoder en GPU.

## Requisitos de hardware

- VRAM/RAM estimada: los cuatro grafos suman unos 93 MB en fp16 (15 + 23 + 29 + 26 MB), más 0,1 MB de embeddings y 1,8 MB del diccionario comprimido. Cabe holgadamente en cualquier dispositivo móvil actual.
- GPU recomendadas: delegado GPU en Pixel 8a para encoder de texto y vocoder; el decoder debe ir en CPU por el fallo de fusión del delegado Mali ML Drift.
- Consumer GPU: no aplica en el sentido habitual; el modelo está orientado a móvil y embebido. En navegador funciona con WebGPU (probado en M4 Max).
- Opciones de despliegue: LiteRT `CompiledModel` en Android (Kotlin), LiteRT.js en navegador, y CPU/XNNPACK en Linux embebido (Raspberry Pi 5). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: en Raspberry Pi 5 el vocoder en CPU es el cuello de botella (5825 ms p50), por lo que sin aceleración GPU el pipeline no es interactivo; con GPU el pipeline se mantiene en RTF ~0,8. En navegador con WebGPU el vocoder baja a 104 ms p50.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Idiomas | Licencia | Despliegue on-device |
|---|---|---|---|---|---|---|
| Matcha-TTS LiteRT (este) | CFM + HiFi-GAN, sin FFT | no disponible | 256 fonemas / 512 frames mel | ingles | MIT | LiteRT Android, LiteRT.js, CPU/XNNPACK |
| Matcha-TTS original (shivammehta25) | CFM + HiFi-GAN | no disponible | no disponible en la informacion | ingles (LJSpeech) | no disponible en la informacion | PyTorch, requiere conversion |
| VITS / Piper | VAE + flow + HiFi-GAN | no disponible | no disponible en la informacion | multilingue en Piper | no disponible en la informacion | ONNX Runtime, orientado a embebido |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de VITS/Piper se incluyen solo como referencia de categoría y no deben tomarse como cifras verificadas en esta ficha.

## Limitaciones y advertencias

- Solo inglés: la voz es LJSpeech y el G2P está orientado a inglés; no hay soporte multilingüe declarado.
- Longitudes fijas por grafo: 256 fonemas y 512 frames mel (unos 5,9 s por pasada); textos más largos requieren segmentación en el host.
- El decoder CFM no es fiable en el delegado GPU Mali ML Drift por un fallo de fusión de grafos; debe ejecutarse en CPU, lo que limita el rendimiento en algunos dispositivos Android.
- El vocoder en CPU es muy lento (5825 ms p50 en Raspberry Pi 5); sin GPU el pipeline no es interactivo.
- En navegador con WebGPU, las salidas del decoder y del vocoder difieren de las de CPU (max rel diff 6e+03 y 0,22 respectivamente), lo que puede afectar a la reproducibilidad acústica entre plataformas.
- Riesgo de alucinación y errores de pronunciación en palabras fuera del diccionario, cubiertas solo por el G2P neuronal de respaldo.
- No se han publicado métricas de calidad subjetiva (MOS) ni de inteligibilidad (WER) en la información disponible; la idoneidad para producción debe validarse con escucha propia.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con una única voz (LJSpeech) la diversidad de habla es nula.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de los checkpoints originales `matcha_ljspeech` y `hifigan_T2_v1` y del diccionario espeak-IPA antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Matcha-TTS
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/litert-community/matcha-tts-text-to-speech
- Demo en GitHub Pages: https://google-ai-edge.github.io/litert-samples/samples/web_demos/dist/matcha-tts/
- Repositorio original de Matcha-TTS: https://github.com/shivammehta25/Matcha-TTS
- LiteRT / litert-torch: https://github.com/google-ai-edge/litert
- LiteRT.js en npm: https://www.npmjs.com/package/@litertjs/core
- Registro de rendimiento del G2P: https://github.com/john-rocky/edge-compat/blob/main/cards/matcha-tts__dp_g2p_matcha_fp16/CARD.md
- Registro de rendimiento del decoder: https://github.com/john-rocky/edge-compat/blob/main/cards/matcha-tts__matcha_decoder_fp16/CARD.md
- Registro de rendimiento del encoder de texto: https://github.com/john-rocky/edge-compat/blob/main/cards/matcha-tts__matcha_textenc_fp16/CARD.md
- Registro de rendimiento del vocoder: https://github.com/john-rocky/edge-compat/blob/main/cards/matcha-tts__matcha_vocoder_fp16/CARD.md
- Medición de fidelidad de conversion en Galaxy S26: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
