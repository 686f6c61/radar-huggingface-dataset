# mlboydaisuke/Matcha-TTS-LiteRT

## Resumen

Matcha-TTS-LiteRT es una conversión a LiteRT (el formato de ejecución on-device de Google AI Edge, antes TensorFlow Lite) del sistema de síntesis de voz Matcha-TTS, orientada a inferencia local en dispositivos Android. El autor del artefacto es mlboydaisuke, y el modelo original procede del proyecto académico Matcha-TTS de Shivam Mehta, que combina un modelo acústico de flow matching condicional (CFM) con un vocoder HiFi-GAN en dominio temporal. El resultado es un pipeline de texto a voz en inglés a 22,05 kHz con la voz de LJSpeech, empaquetado en cinco grafos TFLite con pesos fp16 que suman unos 93 MB.

La relevancia de esta conversión está en su diseño para ejecución móvil: elimina por completo las transformadas de Fourier (FFT/iSTFT) de la ruta de síntesis, usa formas fijas con máscaras de longitud en tiempo de ejecución y distribuye las etapas entre los delegados GPU y CPU del dispositivo. En una Pixel 8a alcanza un factor de tiempo real (RTF) de aproximadamente 0,8, lo que lo sitúa por debajo del tiempo real de reproducción.

El paquete incluye además un módulo G2P (grafema a fonema) libre de espeak, basado en un diccionario de 275.000 entradas IPA y una red DeepPhonemizer para palabras fuera de diccionario, lo que evita la dependencia de la licencia GPL de espeak en aplicaciones comerciales. La licencia del modelo es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS: modelo acústico de flow matching condicional (CFM) con encoder de texto transformer + decoder ODE; vocoder HiFi-GAN en dominio temporal; G2P con diccionario + DeepPhonemizer neuronal |
| Parametros totales | no disponible (los grafos suman ~93 MB en fp16: text encoder 15 MB, decoder 23 MB, vocoder 29 MB, G2P 26 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; formas fijas de 256 fonemas y 512 tramas mel (~5,9 s de audio por pasada) |
| Tipos de cuantizacion | fp16 (pesos de todos los grafos); no se documentan otras variantes |
| Idiomas soportados | inglés (en), voz LJSpeech |
| Licencia | MIT (modelo); diccionario G2P Clear BSD (OpenPhonemizer); DeepPhonemizer MIT |
| Formato de pesos | TFLite / LiteRT (`CompiledModel`), más `emb.bin` (tabla de embeddings 178×192 f32), `g2p_dict.txt.gz`, `config.json` y `g2p_meta.json` |

## Arquitectura y entrenamiento

El pipeline reproduce la arquitectura Matcha-TTS: un encoder de texto transforma la secuencia de fonemas en parámetros de una distribución (mu y logw), un decoder de flow matching condicional genera la secuencia mel mediante integración de una ODE de Euler con N pasos, y un vocoder HiFi-GAN convierte el mel en forma de onda. La innovación respecto a pipelines TTS clásicos es la ausencia total de FFT/iSTFT: el vocoder trabaja en dominio temporal, lo que simplifica la conversión y la ejecución en delegados móviles. La conversión se realizó con litert-torch desde los checkpoints oficiales `matcha_ljspeech` y `hifigan_T2_v1`, con correlación por grafo tflite-vs-torch de 1,000000 y correlación de forma de onda extremo a extremo ≥0,99.

El reparto de cómputo es explícito: el encoder de texto y el vocoder se ejecutan en el delegado GPU; el decoder CFM corre en el delegado CPU porque el delegado GPU Mali ML Drift fusiona incorrectamente sus bloques transformer con activaciones de gran magnitud (correlación 0,984 como grafo aislado en GPU frente a 0,006 fusionado). El vocoder en GPU domina el tiempo de pared, de ahí el RTF de ~0,8. Las formas son fijas (256 fonemas, 512 tramas mel) y una máscara float en tiempo de ejecución anula las posiciones de relleno, de modo que un único grafo compilado sirve para cualquier longitud. No se documentan en la información disponible los detalles del entrenamiento original (número de tokens, composición del dataset, RLHF/DPO); el modelo original se entrenó sobre LJSpeech.

## Capacidades

- Síntesis de voz en inglés a 22,05 kHz con la voz de LJSpeech, a partir de texto plano.
- Conversión grafema-fonema sin espeak: diccionario IPA de 275.000 entradas como vía primaria y DeepPhonemizer neuronal para palabras fuera de diccionario.
- Ejecución on-device en Android mediante LiteRT `CompiledModel`, con reparto entre delegados GPU y CPU.
- Manejo de longitudes variables mediante máscara de relleno sobre grafos de forma fija (hasta ~5,9 s por pasada).
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es exclusivamente un modelo TTS.
- No se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- Lectura de notificaciones y accesibilidad en Android: integración en un servicio de texto a voz del sistema para leer pantallas y mensajes sin conexión, con RTF ~0,8 en Pixel 8a y sin enviar texto a servidores externos.
- Asistentes de voz offline en aplicaciones móviles: respuesta hablada a consultas en escenarios sin conectividad (zonas rurales, aviones, entornos con requisitos de privacidad), usando los grafos TFLite empaquetados en el APK.
- Audiolibros y lectura de artículos por fragmentos: el pipeline procesa hasta ~5,9 s de audio por pasada con formas fijas, adecuado para sintetizar párrafos por trozos con una latencia predecible.
- Aprendizaje de idiomas: pronunciación de palabras y frases en inglés con transcripción IPA intermedia, aprovechando el G2P con diccionario de 275.000 entradas para vocabulario amplio.
- Prototipado de interfaces de voz en investigación: pipeline reproducible con scripts de conversión publicados en litert-samples, útil para experimentar con reparto GPU/CPU y cuantización en dispositivos móviles.
- Sistemas de navegación y avisos en vehículo: locuciones cortas generadas localmente con latencia acotada y sin dependencia de red.
- Evaluación de TTS en entornos con restricciones de licencia: el conjunto modelo MIT + diccionario Clear BSD + DeepPhonemizer MIT permite uso comercial sin la cláusula GPL de espeak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento aportados por el autor son métricas de conversión y ejecución:

| Metrica | Valor |
|---|---|
| Correlacion tflite-vs-torch por grafo | 1,000000 |
| Correlacion de forma de onda extremo a extremo | >=0,99 |
| RTF en Pixel 8a | ~0,8 |
| Correlacion del decoder en GPU fusionado (fallo) | 0,006 |
| Correlacion del decoder en GPU como grafo aislado | 0,984 |

## Requisitos de hardware

- Tamaño total de los artefactos: ~93 MB en fp16 más 1,8 MB del diccionario comprimido y 0,1 MB de la tabla de embeddings; el repositorio ocupa 0,1 GB.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los grafos, el modelo cabe holgadamente en la memoria de un móvil de gama media-alta.
- GPU recomendadas: delegado GPU de LiteRT en SoC Android; el autor valida en Pixel 8a (Mali). No se documentan requisitos para A100, H100 ni RTX 4090, ya que el objetivo es on-device.
- Cabe en GPU de consumo y en móviles; no se especifican modelos concretos de escritorio.
- Opciones de despliegue: LiteRT `CompiledModel` en Android (muestra `compiled_model_api/text_to_speech` de litert-samples). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: RTF ~0,8 en Pixel 8a; el vocoder en GPU domina el tiempo de pared. No se aportan cifras de latencia absoluta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Matcha-TTS-LiteRT (este) | ~93 MB en fp16 | 256 fonemas / 512 tramas mel (~5,9 s) | MIT | Hugging Face, TFLite | On-device Android, sin FFT, G2P sin espeak |
| Matcha-TTS original | no disponible | no disponible | MIT | GitHub (shivammehta25) | Checkpoints PyTorch, requiere espeak (GPL) |
| DeepPhonemizer | no disponible | no disponible | MIT | GitHub (as-ideas) | Solo G2P, no sintetiza voz |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés y una única voz (LJSpeech); no hay soporte multilingüe ni cambio de hablante.
- Duración máxima de ~5,9 s por pasada (512 tramas mel); textos más largos requieren troceado en el host.
- El decoder CFM debe ejecutarse en CPU: el delegado GPU Mali ML Drift produce resultados incorrectos por una fusión defectuosa de bloques transformer (correlación 0,006). No se garantiza el comportamiento en otras GPU.
- El G2P depende de un diccionario de 275.000 entradas más una red neuronal; palabras muy infrecuentes o nombres propios pueden pronunciarse mal.
- Riesgo de artefactos y prosodia monótona inherente a un modelo entrenado sobre un corpus único (LJSpeech); no se documentan evaluaciones MOS.
- No se documentan sesgos específicos, pero al derivar de LJSpeech (habla de una única locutora estadounidense) hereda sus características acentuales.
- Licencia MIT para el modelo; el diccionario G2P es Clear BSD y DeepPhonemizer MIT, por lo que el conjunto es apto para uso comercial. Verificar la licencia de cualquier componente adicional que se añada.
- El repositorio tiene 55 descargas y 1 like: es un artefacto de nicho con validación limitada por la comunidad; conviene probarlo en el dispositivo objetivo antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/Matcha-TTS-LiteRT
- Matcha-TTS (original): https://github.com/shivammehta25/Matcha-TTS
- litert-torch (conversión): https://github.com/google-ai-edge/litert
- Muestra Android text_to_speech: https://github.com/google-ai-edge/litert-samples
- OpenPhonemizer (diccionario IPA, Clear BSD): https://github.com/NeuralVox/OpenPhonemizer
- DeepPhonemizer (MIT): https://github.com/as-ideas/DeepPhonemizer
- Solicitudes de modelos on-device: https://github.com/john-rocky/on-device-requests
