# AXERA-TECH/Qwen3-TTS-1.7B-VoiceDesign-AX8860-llama.cpp

## Resumen

Qwen3-TTS-1.7B-VoiceDesign-AX8860-llama.cpp es una distribucion optimizada para hardware del modelo de sintesis de voz Qwen3-TTS-12Hz-1.7B-VoiceDesign, desarrollado originalmente por el equipo Qwen de Alibaba y portado por AXERA-TECH para ejecutarse sobre la NPU de cuatro nucleos del SoC Axera AX8860 mediante llama.cpp con el backend ggml-axera. El modelo resuelve la generacion de voz a partir de una descripcion en lenguaje natural del timbre deseado (voice design), sin necesidad de audio de referencia ni de un hablante predefinido.

El repositorio no contiene pesos nuevos: empaqueta los pesos originales en formato GGUF BF16 (un GGUF para el talker de 3,2 GB y otro para el code predictor y el decodificador del codec de 645 MB), junto con kernels NPU precompilados y un binario estatico `llama-tts` para el dispotivo. La relevancia practica esta en que demuestra la inferencia de un modelo TTS de 1.733 millones de parametros completamente en el borde (edge), sin GPU dedicada, con un rendimiento medido de unas 32 tramas por segundo en estado estacionario.

La arquitectura subyacente es la de Qwen3-TTS con tokenizador de audio a 12 Hz, compuesta por un modulo talker (generacion de tokens semanticos), un code predictor y un decodificador de codec que produce la forma de onda. El contexto de inferencia esta limitado a 4096 tokens y el modelo acepta instrucciones de estilo de voz en diez idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS con tokenizador de audio a 12 Hz: talker + code predictor + decodificador de codec (voz), ejecutada con llama.cpp sobre NPU Axera |
| Parametros totales | 1.733.157.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos distribuidos en GGUF BF16; conversion en carga a MXFP8 para talker y code predictor y BF16 para el decodificador de codec |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru y auto (sintesis); instrucciones de voz en lenguaje natural |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16) + kernels NPU precompilados + binario estatico `llama-tts` |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-1.7B-VoiceDesign es un sistema de sintesis de voz de Qwen que opera sobre un tokenizador de audio con tasa de 12 Hz. La pila de inferencia se divide en tres etapas: un modulo talker que genera los tokens semanticos de audio condicionados por el texto y por la instruccion de diseno de voz, un code predictor que expande esos tokens y un decodificador de codec que reconstruye la senal de audio. La variante VoiceDesign anade la capacidad de condicionar el timbre mediante una descripcion textual en lenguaje natural, en lugar de un hablante predefinido o un audio de referencia.

Esta distribucion concreta no reentrena el modelo: AXERA-TECH ha implementado los kernels NPU (talker prefill, talker decode con cabeza de codec, code predictor y decodificador de codec) y los integra en un fork de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`) con backend ggml-axera y un codificador de voz en `tools/mtmd/models/qwen3tts-encode.cpp`. Los pesos se cargan exclusivamente desde los GGUF y se convierten en el momento de la carga. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto con control del timbre mediante una descripcion en lenguaje natural obligatoria (`--tts-instruct`).
- Diseno de voz: el usuario describe el estilo ("A calm female voice, warm and measured") y el modelo genera una voz coherente con esa descripcion, sin audio de referencia ni identificador de hablante.
- Soporte multilingue en sintesis: chino, ingles, aleman, italiano, portugues, espanol, japones, coreano, frances, ruso y modo automatico de deteccion.
- Generacion de audio de duracion variable: en la prueba publicada sintetiza un parrafo chino de 22,2 segundos de voz.
- Salida a fichero WAV mediante el binario `llama-tts` (`-o out.wav`).
- Ejecucion completamente en el dispositivo sobre la NPU de cuatro nucleos del AX8860, sin GPU.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada en esta distribucion.

## Casos de uso

- Sintesis de voz en dispositivos empotrados: el modelo se ejecuta integramente en la NPU de un SoC AX8860, por lo que es adecuado para altavoces inteligentes, terminales de informacion o electrodomesticos que necesiten TTS local sin conexion a la nube.
- Generacion de locuciones con estilo personalizado: gracias a `--tts-instruct`, un sistema puede pedir una voz concreta ("voz masculina grave y pausada") para cada contenido sin mantener un catalogo de hablantes predefinidos.
- Accesibilidad y lectura de textos: conversion de articulos, avisos o notificaciones a voz en diez idiomas, con el modelo residiendo en el propio dispositivo y sin enviar texto a terceros.
- Prototipado de asistentes conversacionales en el borde: combinado con un ASR como Qwen3-ASR-1.7B (usado por el autor para validar la salida), permite construir un bucle de voz completo en hardware de bajo consumo.
- Generacion de audio para contenido multilingue: un mismo pipeline puede producir locuciones en espanol, ingles, aleman o japones cambiando solo `--tts-lang`, util para catalogos o formacion interna.
- Demostraciones y validacion de acceleradores NPU: el repositorio sirve como referencia tecnica para medir el rendimiento de llama.cpp con backend ggml-axera sobre modelos TTS, con cifras publicadas de latencia y throughput.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son mediciones de rendimiento en el dispositivo AX8860 (SDK V0.5.1, NPU de 4 nucleos), no benchmarks academicos:

| Metrica | Resultado |
|---|---|
| Parrafo chino, 22,2 s de voz, tiempo total de proceso (incluye carga y primera conversion del vocoder) | 36 s |
| Estado estacionario talker + codec | ~32 tramas/s (31 ms por trama de 80 ms) |
| Carga de pesos y conversion, una vez por proceso | ~25 s |
| Verificacion de correctitud | La salida en chino, transcrita con Qwen3-ASR-1.7B, coincide literalmente con el texto original |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni metricas TTS como WER o MOS) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 nucleos y SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- VRAM: no aplica; el modelo se ejecuta en la NPU del SoC. Los pesos ocupan 3,2 GB (talker) + 645 MB (code predictor y codec) en GGUF BF16, con conversion en carga a MXFP8/BF16.
- GPU: no se requiere ni se documenta soporte para A100, H100 o RTX 4090 en esta distribucion.
- Ejecucion en GPU de consumo: no disponible para esta distribucion; el binario es estatico y depende solo de `/opt/lib` y libc del dispositivo.
- Despliegue: binario `llama-tts` incluido, con `LD_LIBRARY_PATH=/opt/lib`, `GGML_AXERA_KERNEL_DIR=<repo>/kernels`, `-ngl 99 -c 4096` y top-k maximo de 50. El codigo fuente esta en el fork `ZHEQIUSHUI/llama.cpp` (rama `axera-dev`).
- Latencia y throughput: ~32 tramas/s en estado estacionario y ~25 s de carga por proceso; el proceso ocupa los 4 nucleos NPU en exclusiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-VoiceDesign-AX8860 (esta ficha) | 1.733 M | 4096 | TTS con diseno de voz, optimizado para NPU AX8860 | no disponible | GGUF + binario + kernels en Hugging Face |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign (modelo base) | 1.733 M | no disponible | TTS con diseno de voz, pesos originales | no disponible | Hugging Face (Qwen) |
| Otras variantes Qwen3-TTS | no disponible | no disponible | TTS | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- La NPU de 4 nucleos queda ocupada en exclusiva: no deben ejecutarse otros programas NPU en paralelo.
- Contexto limitado a 4096 tokens y top-k maximo de 50, lo que restringe la longitud de los textos de entrada y las opciones de muestreo.
- La decodificacion greedy (`--temp 0`) produce voz demasiado larga y con pausas excesivas; se recomienda mantener el muestreo por defecto.
- `--tts-instruct` es obligatorio y el modelo rechaza `--tts-speaker` y audio de referencia; no admite clonacion de voz clasica.
- El tiempo de carga y conversion de pesos (~25 s por proceso) penaliza escenarios de peticiones aisladas; conviene mantener el proceso vivo.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial; debe consultarse el modelo base Qwen3-TTS-12Hz-1.7B-VoiceDesign.
- Riesgo de alucinacion y de prosodia incorrecta inherente a los modelos TTS; la validacion publicada se limita a un unico parrafo en chino.
- Dependencia de un fork especifico de llama.cpp y de kernels propietarios del SDK de Axera, lo que limita la portabilidad a otras plataformas.
- No se documentan sesgos de voz por idioma, genero o acento en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-1.7B-VoiceDesign-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
- Modelo ASR usado para la verificacion: Qwen3-ASR-1.7B (referenciado en la model card; enlace no disponible)
