# AXERA-TECH/Qwen3-TTS-0.6B-AX8860-llama.cpp

## Resumen

Qwen3-TTS-0.6B-AX8860-llama.cpp es una distribución de inferencia del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-Base (602.341.376 parámetros) adaptada para ejecutarse sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante una bifurcación de llama.cpp con backend ggml-axera. No es un modelo nuevo: es un empaquetado de pesos en formato GGUF junto con kernels NPU precompilados, un binario estático `llama-tts` y un script de ejecución que permite hacer clonación de voz en el propio dispositivo, sin GPU dedicada.

El problema que resuelve es el despliegue de TTS de alta calidad en hardware de borde con recursos limitados. El repositorio incluye los pesos del "talker" en BF16 (1,1 GB) y un segundo GGUF con el code predictor, el decodificador de códec, el codificador de hablante y el codificador de voz para el modo de clonación con texto de referencia (773 MB). Los kernels NPU no contienen pesos: se convierten en tiempo de carga a MXFP8 (talker y code predictor) y BF16 (decodificador de códec).

Es relevante ahora porque demuestra una ruta completa de cuantización y compilación de kernels para un modelo TTS de la familia Qwen3 en una NPU comercial de bajo consumo, con métricas publicadas de RTF y latencia por frame. La licencia del paquete no se indica en la información disponible, y el modelo base es Qwen/Qwen3-TTS-12Hz-0.6B-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autoregresivo por frames (talker + code predictor + decodificador de códec), derivado de Qwen3-TTS-12Hz-0.6B-Base |
| Parametros totales | 602.341.376 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (`-c 4096`) |
| Tipos de cuantizacion | Pesos GGUF en BF16; conversión en carga a MXFP8 (talker y code predictor) y BF16 (decodificador de códec) |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru (parámetro de idioma del script) |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16): `qwen3-tts-0.6b-bf16.gguf` y `mmproj-qwen3-tts-0.6b-bf16.gguf` |

## Arquitectura y entrenamiento

El paquete no documenta el entrenamiento; hereda la arquitectura del modelo base Qwen3-TTS-12Hz-0.6B-Base, un sistema de síntesis de voz autoregresivo que opera a 12 Hz de tasa de frames. La inferencia se descompone en cuatro kernels NPU: prefill del talker, decode del talker (incluida la cabeza de salida del códec), code predictor (una llamada por frame con top-k en tiempo de ejecución) y decodificador de códec (72 frames por llamada). El codificador de voz y el codificador de hablante se usan para el modo de clonación, y la codificación de la referencia se ejecuta en CPU.

En el plano del despliegue, la innovación principal es la integración con ggml-axera: los pesos se leen únicamente de los GGUF y se convierten al formato de la NPU en el momento de la carga, de modo que los kernels son independientes de los pesos. La decodificación usa muestreo con temperature 0.9 y top-k 50 (valores por defecto del modelo original) y un máximo de 2000 frames, equivalentes a unos 160 segundos de audio. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz (texto a audio) en 10 idiomas: zh, en, de, it, pt, es, ja, ko, fr y ru.
- Clonación de voz en dos modos: solo con la grabación de referencia (vector de hablante, x-vector) o con grabación más su transcripción (modo ICL oficial, que codifica la referencia como tokens de voz en el prompt).
- Generación de audio de hasta 2000 frames (aproximadamente 160 segundos) por invocación.
- Muestreo configurable con temperature y top-k (top-k máximo de 50).
- Ejecución completamente local en la NPU del AX8860, sin dependencia de servicios en la nube.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Clonación de voz en dispositivos de borde: el binario estático y los kernels NPU permiten generar audio con una voz concreta en el propio AX8860, útil para asistentes empotrados o terminales sin conectividad.
- Lectura de textos largos en varios idiomas: con hasta 160 segundos por invocación y soporte de diez idiomas, se puede trocear un documento y sintetizar cada fragmento en el idioma correspondiente.
- Accesibilidad en hardware de bajo consumo: convertir contenido textual en audio para personas con discapacidad visual en equipos empotrados que no pueden asumir una GPU.
- Prototipado de interfaces de voz: el modo de clonación con transcripción (ICL) permite evaluar la fidelidad de timbre y entonación antes de invertir en infraestructura mayor.
- Verificación de pipelines TTS: el autor valida la salida transcribiendo el audio con Qwen3-ASR y comparando con el texto original, un patrón reutilizable como test automático de calidad.
- Demostraciones de inferencia NPU: sirve como referencia técnica para portar otros modelos de la familia Qwen3 a ggml-axera, dado que los kernels están separados de los pesos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Sintesis de un parrafo chino (28,2 s de audio) | 12,96 s (RTF 0,46) |
| Sin la primera conversion de pesos del codec | RTF 0,35; 27 ms por frame de 80 ms |
| NPU: code predictor por frame | 7,3 ms |
| NPU: talker decode por frame | 3,7 ms |
| Carga y conversion de pesos (una vez por proceso) | ~14 s (0,6B); ~25 s (1,7B) |
| Codificacion de referencia en CPU | ~10 s para una referencia de 22 s |
| Primera sintesis (conversion de pesos del codec) | ~3 s adicionales |

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible. La validación de correctitud reportada consiste en que las frases de prueba en chino e inglés, con decodificación greedy y con muestreo y en ambos modos de clonación, transcritas con Qwen3-ASR, coinciden literalmente con el texto original.

## Requisitos de hardware

- SoC Axera AX8860 con NPU de 4 núcleos y SDK V0.5.0 o superior (las métricas se tomaron con V0.5.1).
- El runtime ocupa los 4 núcleos NPU en exclusiva; no deben ejecutarse otros programas NPU en paralelo.
- Almacenamiento: repositorio de 2,7 GB; pesos de 1,1 GB (talker) y 773 MB (componentes auxiliares).
- Memoria: no disponible en la información proporcionada.
- Despliegue: binario `llama-tts` estático con dependencia de `/opt/lib` y libc; variables `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; flags `-ngl 99 -c 4096`.
- No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp estándar; la ruta soportada es la bifurcación ZHEQIUSHUI/llama.cpp con backend ggml-axera.
- Latencia: 27 ms por frame de 80 ms de audio en régimen estable; RTF 0,35 sin la conversión inicial de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3-TTS-0.6B-AX8860-llama.cpp | 602 M | 4096 tokens | NPU Axera AX8860 | GGUF + kernels NPU | no disponible |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 602 M | no disponible | GPU/CPU genérica | safetensors (original) | no disponible |
| Alternativas TTS de ~0,5-1 B en llama.cpp | no disponible | no disponible | CPU/GPU | GGUF | no disponible |

La comparación cuantitativa con otras alternativas TTS no está disponible en la información proporcionada. Respecto al modelo base, este paquete fija el contexto en 4096 tokens, limita top-k a 50 y restringe la ejecución a la NPU del AX8860.

## Limitaciones y advertencias

- El runtime monopoliza los 4 núcleos NPU del AX8860; no es apto para ejecución concurrente con otras cargas NPU.
- Contexto limitado a 4096 tokens y top-k máximo de 50, lo que restringe la longitud y diversidad de la generación.
- La decodificación greedy (`--temp 0`) produce voz demasiado larga y con pausas excesivas; se recomienda el muestreo por defecto.
- El modo de clonación con transcripción exige que el texto de referencia coincida exactamente con lo que dice la grabación.
- La codificación de la referencia se hace en CPU y su coste crece con la duración (unos 10 s para 22 s de audio), lo que afecta a la latencia del primer uso.
- La conversión inicial de pesos añade ~14 s por proceso y ~3 s en la primera síntesis.
- No se incluye audio de referencia en el repositorio; el usuario debe aportar una grabación de pocos segundos.
- No se dispone de información sobre sesgos, tasas de alucinación ni licencia de uso comercial; debe verificarse la licencia del modelo base antes de un despliegue en producción.
- La calidad se ha validado únicamente con frases de prueba en chino e inglés; no hay evidencia publicada para el resto de idiomas listados.

## Enlaces

- Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-0.6B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- llama.cpp (bifurcación): https://github.com/ZHEQIUSHUI/llama.cpp (rama `feat/qwen3-whole`, commit `b536fe5`)
- Kernels NPU: https://github.com/ZHEQIUSHUI/ax-dsl-kernels (rama `main`, commit `60dd25b`)
