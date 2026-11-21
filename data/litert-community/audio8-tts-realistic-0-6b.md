# litert-community/Audio8-TTS-Realistic-0.6b

## Resumen

Audio8-TTS-Realistic-0.6b es una conversión a LiteRT del modelo de síntesis de voz `Edge0/Audio8-TTS-Realistic-Air`, publicada por la comunidad `litert-community`. El modelo original, desarrollado por Edge0, es un sistema de text-to-speech de 0,6 mil millones de parámetros que soporta 23 idiomas y clonación de voz zero-shot a partir de una grabación de referencia y su transcripción exacta. Esta versión LiteRT empaqueta el modelo en cinco grafos TFLite optimizados para ejecución en dispositivo (on-device), con cuantización int8 en los grafos autorregresivos, y se distribuye junto con una aplicación Android de ejemplo y un bucle de inferencia en Python para escritorio.

La relevancia de esta ficha radica en que traslada un TTS multilingüe con clonación de voz a hardware móvil de consumo: según la model card, un Pixel 11 Pro sintetiza una frase de 18 tokens en inglés (5,48 s de audio) con un factor de tiempo real de 0,853, y un Galaxy S26 con 0,797. Un factor inferior a 1 significa que el audio está listo antes de que termine de reproducirse, lo que habilita aplicaciones de voz interactivas sin conexión a servidores.

El modelo base emplea un diseño DualAR inspirado en Fish Audio S2 Pro: un transformer lento de 24 capas que predice un token semántico por trama de audio (2.048 muestras, 46 ms a 44,1 kHz), un transformer rápido de 4 capas que predice los 10 codebooks del códec trama a trama, y un códec neuronal que convierte las tramas en audio. La licencia es Apache 2.0 y el repositorio ocupa 2,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (transformer lento de 24 capas + transformer rápido de 4 capas + códec neuronal) |
| Parametros totales | 0,6 mil millones (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el prompt se prellena en trozos de 256 posiciones, con un último trozo de hasta 64) |
| Tipos de cuantizacion | int8 con activaciones float (dynamic-range quantization) en los dos grafos autorregresivos; códec en TFLite |
| Idiomas soportados | 23: zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue |
| Licencia | Apache 2.0 (la app Android de ejemplo tiene licencia MIT) |
| Formato de pesos | TFLite (LiteRT); cinco grafos: slow AR, fast AR, decodificador de códec en dos tamaños de ventana y codificador de códec |

## Arquitectura y entrenamiento

El modelo sigue un diseño DualAR. Un transformer lento de 24 capas predice un token semántico por cada trama de audio de 2.048 muestras (46 ms a 44,1 kHz). Un transformer rápido de 4 capas predice, para cada trama, los 10 codebooks del códec uno a uno. Finalmente, un códec neuronal transforma las tramas en audio. La conversión a LiteRT se realizó con litert-torch 0.9.4 y ai-edge-quantizer 0.9.0 para LiteRT 2.2.0, y cuantiza los dos grafos autorregresivos a pesos int8 con activaciones float.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La model card del modelo base indica que soporta clonación de voz zero-shot a partir de una grabación de referencia y su transcripción, o síntesis sin referencia. La transcripción debe coincidir exactamente con la grabación de referencia. En la app Android, los dos grafos autorregresivos corren en CPU con 4 hilos; el grafo lento actualiza su caché KV in situ y prellena el prompt en trozos de 256 posiciones, con un último trozo de hasta 64 posiciones mediante `prefill_64`. El decodificador de códec corre en GPU cuando la correlación con la salida de CPU es igual o superior a 0,99; en caso contrario, cae a CPU.

## Capacidades

- Síntesis de voz multilingüe en 23 idiomas, incluidos chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso, árabe, finlandés, hindi, indonesio, malayo, neerlandés, noruego, polaco, portugués, sueco, tailandés, turco, vietnamita y cantonés.
- Clonación de voz zero-shot a partir de una grabación de referencia de hasta 10 segundos y su transcripción exacta.
- Síntesis sin voz de referencia, usando una voz por defecto.
- Ejecución completamente on-device en Android (Pixel 11 Pro, Galaxy S26) y en escritorio mediante un bucle Python con ai-edge-litert.
- Control de muestreo configurable: temperatura (por defecto 0,7), top-p (0,9), top-k (50), máximo de 512 tramas y semilla.
- Redibujado consciente de repeticiones (repetition-aware re-draw) heredado del repositorio original.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada o modo de razonamiento; es un modelo exclusivamente de texto a voz.

## Casos de uso

- Asistentes de voz sin conexión en Android: la app de ejemplo sintetiza frases de hasta 49 tokens con un factor de tiempo real inferior a 1 en Pixel 11 Pro y Galaxy S26, lo que permite respuestas habladas interactivas sin enviar audio a un servidor.
- Lectura de notificaciones y accesibilidad: el modelo puede leer texto en 23 idiomas en el propio dispositivo, útil para usuarios con discapacidad visual o para interfaces manos libres.
- Clonación de voz personal: la app permite grabar 10 segundos de voz y usar esa voz para sintetizar texto nuevo, con la transcripción exacta de la grabación como referencia.
- Audiolibros y contenido narrado en escritorio: el bucle Python permite generar WAV por lotes con una voz clonada o por defecto, adecuado para preproducción de narraciones.
- Localización de contenidos de voz: al soportar 23 idiomas, se puede reutilizar una misma voz de referencia para generar locuciones en varios idiomas, aunque con las limitaciones de idioma cruzado indicadas más abajo.
- Prototipado de interfaces conversacionales: al ejecutarse en CPU con 4 hilos y con grafos TFLite, se integra en apps Kotlin mediante la API CompiledModel de LiteRT 2.2.0 sin depender de infraestructura cloud.
- Generación de avisos y mensajes dinámicos en dispositivos empotrados: el modelo cabe en un repositorio de 2,1 GB y usa una caché de pesos empaquetados de unos 365 MB en los teléfonos probados, lo que facilita su despliegue en móviles de gama alta.

## Benchmarks y rendimiento

| Prueba | Pixel 11 Pro | Galaxy S26 |
|---|---|---|
| Frase de 18 tokens en inglés (5,48 s de audio) | RTF 0,853 | — |
| Frase de 18 tokens en inglés (6,36 s de audio) | — | RTF 0,797 |
| Medición | mediana de 6 ejecuciones (2026-11-03) | mediana de 6 ejecuciones (2026-11-03) |
| Memoria residente pico (Apple M4 Max, ai-edge-litert 2.2.0, 4 frases) | 2.074,7 MiB con `prefill_64`; 1.670,6 MiB sin él | no disponible |
| Caché de pesos empaquetados (XNNPACK) | 365.205.496 bytes | 365.259.896 bytes |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para ejecución en CPU con pesos int8 y no se documentan requisitos de VRAM para GPU.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; en Android el decodificador de códec puede ejecutarse en GPU del teléfono.
- Cabe en GPU de consumo: no disponible como dato explícito; el despliegue documentado es CPU en móvil y CPU en escritorio.
- Memoria: en Apple M4 Max, la generación de cuatro frases de prueba alcanzó un pico de 2.074,7 MiB de memoria residente con la firma `prefill_64`.
- Opciones de despliegue: LiteRT (ai-edge-litert) en Python para escritorio; LiteRT 2.2.0 CompiledModel API en Android; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,853 en Pixel 11 Pro y 0,797 en Galaxy S26 para una frase de 18 tokens en inglés, con 4 hilos de CPU en los grafos autorregresivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Licencia | Despliegue |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b (LiteRT) | 0,6 mil millones (aprox.) | 23 | Zero-shot con referencia y transcripción | Apache 2.0 | LiteRT on-device (Android, escritorio) |
| Edge0/Audio8-TTS-Realistic-Air | 0,6 mil millones (aprox.) | 23 | Zero-shot con referencia y transcripción | no disponible en la información | Repositorio original, no LiteRT |
| Fish Audio S2 Pro | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base del que deriva esta conversión. No se dispone de datos de benchmarks ni de especificaciones de Fish Audio S2 Pro más allá de la inspiración arquitectónica citada en la model card.

## Limitaciones y advertencias

- La transcripción de la grabación de referencia debe coincidir exactamente con el audio; cualquier discrepancia puede degradar la clonación.
- La model card advierte sobre el caso de una voz clonada que habla en un idioma distinto al de su grabación de referencia; se remite a la sección de limitaciones del modelo base, no incluida en la información disponible.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de calidad subjetiva (MOS) en la información proporcionada.
- El contexto de prompt se prellena en trozos de 256 posiciones con un último trozo de hasta 64; no se especifica la longitud máxima de texto de entrada, aunque la app Android limita las frases a 49 tokens.
- El rendimiento medido se limita a dos teléfonos de gama alta (Pixel 11 Pro y Galaxy S26) con frases en inglés; no hay datos de latencia para otros idiomas ni para hardware de gama media.
- La licencia Apache 2.0 permite uso comercial, pero la app Android de ejemplo se distribuye bajo MIT; conviene revisar ambas licencias por separado.
- El modelo es exclusivamente de texto a voz: no soporta tool calling, agentes, visión ni audio de entrada.
- El repositorio ocupa 2,1 GB y la caché de pesos empaquetados ronda los 365 MB en los dispositivos probados, lo que requiere espacio de almacenamiento considerable en móvil.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Audio8-TTS-Realistic-0.6b
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- App Android y README: https://huggingface.co/litert-community/Audio8-TTS-Realistic-0.6b/tree/main/android
- README de Android: https://huggingface.co/litert-community/Audio8-TTS-Realistic-0.6b/blob/main/android/README.md
- Licencia de la app Android: https://huggingface.co/litert-community/Audio8-TTS-Realistic-0.6b/blob/main/android/LICENSE
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
