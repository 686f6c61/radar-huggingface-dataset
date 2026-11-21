# AXERA-TECH/Qwen3-TTS-0.6B-AX8860-llama.cpp

## Resumen

Qwen3-TTS-0.6B-AX8860-llama.cpp es una distribución adaptada del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-Base de Alibaba Qwen, empaquetada por AXERA-TECH para ejecutarse sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante una bifurcación de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo, sino de una conversión de los pesos originales a GGUF BF16 junto con kernels NPU precompilados y un binario estático (`llama-tts`) que permite hacer clonación de voz en el propio dispositivo, sin GPU dedicada.

El modelo base resuelve el problema de la síntesis de voz zero-shot con clonación: a partir de unos segundos de audio de referencia genera habla en la voz del hablante. La versión publicada aquí incluye dos modos de clonación (solo x-vector o modo ICL con transcripción de referencia) y soporta diez idiomas de entrada (`zh en de it pt es ja ko fr ru`). El repositorio ocupa 2,8 GB e incluye los pesos GGUF, los kernels NPU y el programa de inferencia.

Su relevancia actual está en el despliegue en edge: demuestra que un TTS de 602 millones de parámetros con clonación puede correr en tiempo real (RTF 0,35-0,46) en hardware embebido con NPU de 4 núcleos, abriendo la puerta a asistentes de voz locales sin dependencia de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS basado en transformer (talker + code predictor + vocoder + speaker encoder + speech tokenizer encoder), pesos en GGUF BF16 |
| Parámetros totales | 602.341.376 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | BF16 en GGUF; conversión en carga a MXFP8 (talker y code predictor) y BF16 (vocoder) para los kernels NPU |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16): `qwen3-tts-0.6b-bf16.gguf` (1,1 GB) y `mmproj-qwen3-tts-0.6b-bf16.gguf` (773 MB) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-0.6B-Base es un sistema de síntesis de voz con tokenización de audio a 12 Hz. La inferencia se descompone en varios componentes: un *talker* (transformer autorregresivo que genera tokens de código), un *code predictor* que produce el resto de tokens de cada frame, un *vocoder* o codec decoder que convierte tokens en audio (72 frames por llamada), un *speaker encoder* (x-vector) para clonación solo con audio y un *speech tokenizer encoder* para el modo ICL. En esta distribución, los kernels NPU no contienen pesos: se convierten desde el GGUF al cargar (talker y code predictor a MXFP8, vocoder a BF16).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si el modelo base usó RLHF o DPO; esos detalles corresponden a la model card original de Qwen y no se incluyen en esta ficha. La innovación destacable aquí es el *port* a NPU: kernels específicos para prefill del talker, decode del talker (con cabecera de codec), code predictor (un frame por llamada con top-k en tiempo de ejecución) y vocoder, integrados en la bifurcación `axera-dev` de llama.cpp (`ggml/src/ggml-axera/models/qwen3` y `qwen3_tts`).

## Capacidades

- Síntesis de voz (text-to-speech) con salida de audio WAV a partir de texto en diez idiomas.
- Clonación de voz zero-shot a partir de una grabación de referencia de pocos segundos (wav o mp3).
- Dos modos de clonación: solo x-vector (más rápido) y modo ICL con transcripción de la referencia (mayor fidelidad de timbre y estilo).
- Generación de hasta 2000 frames por invocación (aproximadamente 160 segundos de audio).
- Muestreo configurable con temperatura 0,9 y top-k 50 por defecto (top-k máximo 50).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Asistentes de voz en dispositivo: el modelo corre íntegramente en la NPU del AX8860 con RTF 0,35-0,46, lo que permite respuestas habladas en tiempo real sin enviar audio a la nube.
- Clonación de voz personalizada en productos embebidos: con una grabación de referencia de pocos segundos y su transcripción, se genera habla con el timbre del usuario para interfaces de accesibilidad o domótica.
- Lectura de textos largos (audiolibros, notificaciones): la ventana de contexto de 4096 tokens y el límite de 2000 frames (~160 s) permiten sintetizar párrafos completos por invocación.
- Localización de contenido a diez idiomas: el mismo modelo sintetiza en `zh en de it pt es ja ko fr ru`, útil para doblaje ligero o avisos multilingües.
- Sistemas de megafonía o anuncios en kioscos y transporte: despliegue en hardware de bajo consumo con NPU dedicada, sin GPU.
- Prototipado de pipelines TTS en edge: el binario estático `llama-tts` y los kernels con `manifest.json` facilitan integrar el modelo en firmware propio sobre SDK V0.5.0 o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible. Sí hay métricas de rendimiento en el AX8860 (SDK V0.5.1, NPU de 4 núcleos) para un párrafo en chino que genera 28,2 s de voz:

| Métrica | Resultado |
|---|---|
| Tiempo de síntesis | 12,96 s (RTF 0,46) |
| Sin la primera conversión de pesos del vocoder | RTF 0,35 (27 ms por frame de 80 ms) |
| NPU: code predictor por frame | 7,3 ms |
| NPU: talker decode por frame | 3,7 ms |
| Carga y conversión de pesos (una vez por proceso) | ~14 s (0,6B) |
| Codificación de referencia en CPU | ~10 s para una referencia de 22 s |
| Conversión inicial de pesos del vocoder | ~3 s |

En cuanto a corrección, la model card indica que las frases de prueba en chino e inglés (decodificación greedy y por muestreo, ambos modos de clonación) transcritas con Qwen3-ASR coinciden literalmente con el texto original.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 núcleos; SDK V0.5.0 o superior (V0.5.1 en las pruebas).
- No requiere GPU: la inferencia se ejecuta en la NPU; la codificación de la referencia corre en CPU.
- Memoria: el repositorio pesa 2,8 GB; los pesos GGUF suman 1,1 GB + 773 MB. No se especifica la RAM exacta necesaria.
- Despliegue: binario estático `llama-tts` incluido en `bin/`, con `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; flags `-ngl 99 -c 4096`.
- La NPU queda ocupada en exclusiva durante la ejecución: no se pueden lanzar otros programas NPU en paralelo.
- Latencia: 27 ms por frame de 80 ms de audio (RTF 0,35) en estado estable; 12,96 s para 28,2 s de voz incluyendo la conversión inicial del vocoder.
- No se documenta soporte para vLLM, Ollama, TGI ni llama.cpp estándar en GPU/CPU; el backend es específico de Axera.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3-TTS-0.6B-AX8860 (esta ficha) | 602 M | 4096 | 10 | no disponible | NPU Axera AX8860 vía llama.cpp/ggml-axera |
| Qwen3-TTS-12Hz-0.6B-Base | 602 M | no disponible | no disponible | no disponible | Pesos originales (formato no indicado) |
| Qwen3-TTS-12Hz-1.7B (referenciado en la model card) | ~1,7 B (según nombre) | no disponible | no disponible | no disponible | Conversión a AX8860 mencionada (carga ~25 s) |

No se dispone de datos de benchmarks comparativos entre estas variantes ni con otros TTS de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está indicada en el repositorio; antes de uso comercial debe consultarse la licencia del modelo base Qwen3-TTS-12Hz-0.6B-Base.
- La NPU de 4 núcleos queda monopolizada durante la inferencia; no es apta para ejecución concurrente con otras cargas NPU.
- Contexto limitado a 4096 tokens y top-k máximo de 50.
- La decodificación greedy (`--temp 0`) produce habla demasiado larga y con pausas; se recomienda el muestreo por defecto.
- El modo ICL exige que la transcripción de la referencia coincida literalmente con el audio; si no, la calidad de clonación se degrada.
- El repositorio no incluye audio de referencia: el usuario debe aportar su propia grabación.
- No hay información sobre sesgos, tasas de alucinación (en TTS, errores de pronunciación o contenido no solicitado) ni evaluación de calidad perceptual (MOS).
- La carga inicial (~14 s) y la codificación de la referencia en CPU (~10 s para 22 s de audio) añaden latencia en el primer uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-0.6B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
