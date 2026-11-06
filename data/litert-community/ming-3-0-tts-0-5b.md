# litert-community/Ming-3.0-tts-0.5B

## Resumen

Ming-3.0-tts-0.5B es un modelo de texto a voz (TTS) desarrollado por inclusionAI, del cual litert-community publica esta versión convertida y empaquetada para ejecutarse completamente en el dispositivo (on-device) mediante LiteRT (TensorFlow Lite). El modelo genera voz de forma autónoma en el teléfono, sin conexión de red, produciendo audio a 44.1 kHz directamente desde texto introducido por el usuario. Su relevancia radica en demostrar que un sistema TTS neuronal de calidad puede funcionar en tiempo casi real sobre hardware móvil de consumo, repartiendo la carga entre GPU y NPU del SoC.

La arquitectura se compone de varios grafos LiteRT: un modelo de lenguaje basado en Qwen2.5-0.5B (24 capas) que procesa el texto, un flow head que genera latentes de audio mediante un solver de 10 pasos con classifier-free guidance, un agregador y un decodificador de 24 capas que convierte los latentes en espectros ISTFT para producir la señal final. El paquete ocupa 3.6 GB y los pesos se almacenan en float16.

En pruebas documentadas sobre un Galaxy S26 (Snapdragon SM8850), el sistema alcanza un factor de tiempo real de 0.93 (genera 8.9 segundos de audio en 9.6 segundos), con el primer audio disponible 1.87 segundos después de introducir el texto. Con la configuración alternativa que ejecuta todos los grafos en la NPU, mejora a 1.35× tiempo real, aunque a menor precisión. Soporta siete idiomas: inglés, chino, japonés, coreano, alemán, francés y español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal: LM Qwen2.5-0.5B (24 capas) + flow head (solver de 10 pasos con CFG) + agregador + decodificador transformer causal de 24 capas (ISTFT) |
| Parametros totales | no disponible (el paquete completo ocupa 3.6 GB en float16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (pesos), entradas y salidas en float32; FP32 en GPU para LM y agregador |
| Idiomas soportados | en, zh, ja, ko, de, fr, es |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (.tflite), pesos float16; modelo base en inclusionAI/Ming-3.0-tts-0.5B |

## Arquitectura y entrenamiento

El pipeline funciona generando la voz un latente de 64 números cada vez, donde cada latente representa 80 ms de audio. Para cada latente, el modelo de lenguaje (Qwen2.5-0.5B, 24 capas) recibe una fila de entrada y devuelve un estado oculto. El flow head transforma ese estado, el latente previo y ruido gaussiano en el siguiente latente mediante 10 pasos de solver con classifier-free guidance. El agregador convierte el latente en la siguiente fila de entrada. Un stop head sobre el estado oculto decide el fin de la frase. El decodificador, un transformer causal de 24 capas, convierte 16 latentes por llamada en un espectro ISTFT, y el host lo transforma en audio a 44.1 kHz.

Sobre el entrenamiento del modelo base (datos, número de tokens, RLHF/DPO), la información disponible no incluye detalles; solo se indica que es un fine-tune de inclusionAI/Ming-3.0-tts-0.5B. Como innovación técnica destacable, esta conversión a LiteRT mantiene las tablas RoPE, máscaras de atención, ambos cachés KV y la búsqueda de embeddings en el host (fuera de los grafos), y el flow head se compila en el propio teléfono para la NPU de Qualcomm, con caché del grafo compilado (213 MB) que reduce las cargas posteriores a 0.35 s.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) a 44.1 kHz, completamente on-device y sin red
- Síntesis multiidioma: inglés, chino, japonés, coreano, alemán, francés y español
- Generación en streaming por chunks: el primer audio está disponible 1.87 s (configuración GPU+NPU) o 1.10 s (todo en NPU) tras introducir el texto
- Ejecución acelerada por hardware móvil: reparto de grafos entre GPU y NPU (Qualcomm Hexagon) mediante la CompiledModel API de LiteRT
- Cabezas auxiliares integradas: stop head para terminar la frase y flow head con classifier-free guidance para calidad de síntesis
- Verificación numérica frente a la referencia PyTorch: desviación máxima de estado oculto de 1.46e-03 en el prefill del LM, muy por debajo del límite de 0.357

## Casos de uso

- Lectores de pantalla y accesibilidad offline: al funcionar sin red y con primer audio en menos de 2 segundos, es adecuado para apps de accesibilidad que lean texto de la interfaz en cualquier momento, incluso en modo avión.
- Asistentes de voz en Android: la generación por chunks de 80 ms permite integrar el modelo en asistentes conversacionales con latencia de respuesta baja, sin enviar datos del usuario a la nube.
- Narración de contenido en aplicaciones de lectura: apps de libros, noticias o historias pueden leer textos largos en voz alta; la demo oficial lee una historia de 57 palabras generando 17 segundos de voz en 14.7 segundos.
- Privacidad en apps médicas o financieras: dado que todo el procesamiento ocurre en el dispositivo, es apropiado para escenarios donde el texto no puede salir del terminal por cumplimiento normativo.
- Aprendizaje de idiomas: el soporte de siete idiomas (es, en, zh, ja, ko, de, fr) permite pronunciar frases de ejemplo en apps educativas sin descargar voces por idioma.
- Prototipado de voz en dispositivos edge: los desarrolladores pueden usar el contract.json y la app de ejemplo como plantilla para integrar TTS en productos con LiteRT sobre GPU/NPU móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MOS, MMLU, etc.) en la informacion disponible. Sí se han publicado mediciones de rendimiento en dispositivos:

| Phone | Colocación de grafos | Factor tiempo real | Primer audio | Un frame de 80 ms | Llamada al decodificador (16 latentes) | Underruns de reproduccion |
|---|---|---|---|---|---|---|
| Galaxy S26 (Snapdragon SM8850, 12 GB) | LM y agregador: GPU FP32 · flow: NPU · decodificador: GPU | **0.93** | 1.87 s | 78 ms (LM 31 + flow 37 + agregador 10) | 111 ms | 6/6/6 |
| Pixel 8a (Tensor G3, Mali-G715, 8 GB) | flow en GPU (sin NPU de Qualcomm) | 0.31 | 5.2 s | 244 ms (94 + 127 + 23) | 264 ms | 7/7/7 |

Con todos los grafos en la NPU (Galaxy S26): 1.35× tiempo real y primer audio a 1.10 s, a menor precision. En la demo en modo avion: primer chunk a 1.31 s y 17.0 s de voz generados en 14.7 s. El prefill del prompt tardo 386–396 ms dentro del tiempo del primer audio. La primera compilacion del grafo flow para NPU tardo 49–63 s (caché posterior de 0.35 s). Memoria pico de la app: 4.6 GB (VmHWM).

## Requisitos de hardware

- Diseñado para ejecutarse en smartphones Android; no hay cifras de VRAM de escritorio publicadas (no disponible)
- Dispositivos verificados: Galaxy S26 (Snapdragon SM8850, 12 GB RAM) con 0.93× tiempo real; Pixel 8a (Tensor G3, Mali-G715, 8 GB RAM) con 0.31× tiempo real
- Memoria en el teléfono: pico de 4.6 GiB (VmHWM) en el S26; la compilacion NPU del grafo flow alcanza 1.6 GiB pico y genera una caché de 213 MB
- Almacenamiento: 3.6 GB de pesos del paquete
- Carga de grafos GPU en el S26: 5.3 s (LM), 1.5 s (agregador), 4.4 s (decodificador)
- Despliegue: LiteRT 2.2.0 con la CompiledModel API (grafos convertidos con litert-torch); no se mencionan vLLM, llama.cpp, Ollama ni TGI
- La NPU de Qualcomm acelera el flow head; en dispositivos sin ella (como el Pixel 8a con Tensor G3) el grafo pasa a GPU con una penalizacion de ~3× en tiempo de generacion

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Ejecucion | Notas |
|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B (LiteRT) | ~0.5B (LM Qwen2.5-0.5B; total no disponible) | 7 (en, zh, ja, ko, de, fr, es) | MIT | On-device Android (GPU+NPU) | 0.93×–1.35× tiempo real en flagship, 44.1 kHz |
| inclusionAI/Ming-3.0-tts-0.5B (base) | no disponible | 7 | MIT | PyTorch (referencia, Mac CPU) | Modelo original del que deriva este paquete |
| Alternativas TTS on-device comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible alternativas comparables con datos suficientes para una comparativa numerica.

## Limitaciones y advertencias

- Rendimiento muy dependiente del hardware: en un Pixel 8a el sistema genera a 0.31× tiempo real, muy por debajo del tiempo real, lo que provoca esperas y underruns de reproduccion; el factor 0.93 del Galaxy S26 tampoco alcanza el tiempo real pleno en la configuracion por defecto.
- La configuracion rapida (todo en NPU) funciona a menor precision que la configuracion por defecto.
- La primera compilacion del grafo flow para NPU tarda 49–63 s y consume hasta 1.6 GiB; hay que planificar este coste en la primera ejecucion.
- Consumo de memoria alto para movil: 4.6 GiB de pico (VmHWM) y 3.6 GB de pesos, inviable en gama baja.
- Se registran underruns de reproduccion (6–7 por frase) porque la generacion es ligeramente mas lenta que la reproduccion.
- Las mediciones se realizaron con throttling termico leve (estado 1) y GPU limitada a 902 MHz; el rendimiento en otros terminales o condiciones termicas puede variar.
- No hay datos publicados sobre calidad perceptual (MOS), sesgos de voz, ni comportamiento con textos de entrada atipicos.
- Licencia MIT: sin restricciones de uso comercial, pero conviene verificar la licencia del modelo base inclusionAI/Ming-3.0-tts-0.5B para usos derivados.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/litert-community/Ming-3.0-tts-0.5B
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Contrato de entradas/salidas del paquete: https://huggingface.co/litert-community/Ming-3.0-tts-0.5B/blob/main/contract.json
- Demo en video: https://huggingface.co/litert-community/Ming-3.0-tts-0.5B/resolve/main/assets/demo.mp4
- Audio de referencia PyTorch: https://huggingface.co/litert-community/Ming-3.0-tts-0.5B/resolve/main/assets/pytorch_E5.wav
- Audio generado en Galaxy S26: https://huggingface.co/litert-community/Ming-3.0-tts-0.5B/resolve/main/assets/s26_E5.wav
