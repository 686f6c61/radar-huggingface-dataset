# AXERA-TECH/Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp

## Resumen

Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que permite ejecutar el modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice de Qwen sobre la NPU de cuatro núcleos del SoC Axera AX8860, utilizando una bifurcación de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo, sino de una conversión y adaptación del modelo base de Qwen (602.341.376 parámetros) a formato GGUF junto con kernels NPU precompilados y un binario estático `llama-tts` para el dispositivo.

El modelo resuelve el problema de la síntesis de voz (text-to-speech) con voces predefinidas: incorpora nueve hablantes integrados y no admite instrucciones de estilo, a diferencia de las variantes mayores o de la familia VoiceDesign. La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar TTS de 0,6B en hardware de borde con aceleración NPU, con un factor de tiempo real (RTF) de 0,43 en la prueba publicada.

La arquitectura subyacente es la de Qwen3-TTS: un componente "talker" autorregresivo que genera tokens de audio a 12 Hz, un predictor de código y un decodificador de códec (vocoder) que produce la forma de onda. El contexto declarado es de 4096 tokens y la generación está limitada a 2000 tramas (aproximadamente 160 segundos de audio por petición).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (talker autorregresivo + code predictor + decodificador de códec/vocoder), adaptada a llama.cpp con backend ggml-axera |
| Parámetros totales | 602.341.376 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | Pesos GGUF en BF16; conversión en carga a MXFP8 (talker y code predictor) y BF16 (vocoder) para los kernels NPU |
| Idiomas soportados | auto, zh, en, de, it, pt, es, ja, ko, fr, ru |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16) + kernels NPU propietarios + binario estático |

## Arquitectura y entrenamiento

El paquete distribuye dos ficheros GGUF: `qwen3-tts-0.6b-customvoice-bf16.gguf` (1155 MB), que contiene los pesos del talker, y `mmproj-qwen3-tts-0.6b-customvoice-bf16.gguf` (576 MB), que contiene el code predictor y el decodificador de códec. Los kernels NPU (cuatro: prefill del talker, decode del talker con cabeza de salida de códec, code predictor con top-k en tiempo de ejecución y vocoder en bloques de 72 tramas) no almacenan pesos: se convierten desde los GGUF en el momento de la carga, con precisión MXFP8 para talker y code predictor y BF16 para el vocoder.

La generación de audio sigue un esquema autorregresivo a 12 Hz: el talker produce tokens de código de audio, el code predictor los refina y el vocoder sintetiza la forma de onda. La decodificación utiliza por defecto muestreo con temperatura 0,9 y top-k 50, que son los valores oficiales del modelo base; el top-k está limitado a 50 en esta implementación. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni sobre si hubo etapas de RLHF o DPO, ya que la model card se limita a describir el despliegue y no el entrenamiento del modelo original.

## Capacidades

- Síntesis de voz (text-to-speech) con nueve voces integradas: `aiden`, `dylan`, `eric`, `ono_anna`, `ryan`, `serena`, `sohee`, `uncle_fu` y `vivian`.
- Variantes dialectales en chino: `dylan` y `eric` producen mandarín con acento de Pekín y de Sichuan, respectivamente.
- Soporte multilingüe con selección de idioma explícita o automática: chino, inglés, alemán, italiano, portugués, español, japonés, coreano, francés y ruso.
- Generación de audio de hasta 2000 tramas por petición (aproximadamente 160 segundos), con tramas de 80 ms.
- Salida en fichero WAV mediante el binario `llama-tts`.
- No admite instrucciones de estilo ni control prosódico por prompt (la variante de 0,6B no lo soporta, en línea con el modelo oficial).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada; el modelo es exclusivamente de síntesis.

## Casos de uso

- Síntesis de voz en dispositivos de borde: el paquete está pensado para ejecutarse íntegramente en la NPU de un AX8860, sin GPU dedicada, lo que permite integrar TTS en cámaras, terminales industriales o electrónica de consumo con requisitos de privacidad y latencia local.
- Generación de avisos y anuncios en sistemas embebidos: con un RTF de 0,43 y tramas de 80 ms, es adecuado para mensajes cortos en paneles informativos, transporte público o domótica.
- Doblaje y locución automatizada de contenido breve: las nueve voces y los diez idiomas permiten generar pistas de audio para vídeos cortos, tutoriales o material de formación sin depender de servicios en la nube.
- Accesibilidad: lectura en voz alta de texto en aplicaciones para personas con discapacidad visual, ejecutándose localmente en el dispositivo y evitando el envío de contenido sensible a terceros.
- Pruebas de integración de TTS en pipelines llama.cpp: al reutilizar la interfaz de llama.cpp con `-ngl 99 -c 4096`, sirve como banco de pruebas para validar el backend ggml-axera antes de desplegar otros modelos.
- Investigación en aceleración NPU: los kernels y el manifiesto publicados permiten estudiar la conversión de pesos a MXFP8 y la partición talker/code predictor/vocoder en hardware Axera.
- Generación de voces para prototipos de asistentes conversacionales: la latencia por trama (29 ms sin contar la conversión inicial) hace viable la respuesta cuasi interactiva en turnos cortos.

## Benchmarks y rendimiento

Los únicos datos publicados son medidas de rendimiento del despliegue en AX8860 (SDK V0.5.1, NPU de 4 núcleos), no benchmarks de calidad del modelo.

| Métrica | Resultado |
|---|---|
| Audio generado en la prueba | 32,4 s (párrafo en chino, voz `vivian`) |
| Tiempo de síntesis total | 14,06 s (RTF 0,43) |
| RTF sin la primera conversión del vocoder | 0,36 |
| Latencia por trama (80 ms de audio) | 29 ms |
| Code predictor por trama | 7,4 ms |
| Talker decode por trama | 3,7 ms |
| Carga y conversión de pesos por proceso | ~14 s |
| Conversión del vocoder en la primera síntesis | ~2,5 s |

En cuanto a calidad, la model card indica que las frases de prueba en chino e inglés, con varios hablantes y con y sin instrucción de estilo, transcritas de vuelta con Qwen3-ASR, coinciden literalmente con el texto original. No se han publicado resultados de benchmarks estándar (MOS, WER, MMLU u otros) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de cuatro núcleos; no es un paquete para GPU de escritorio.
- SDK: V0.5.0 o superior (comprobable con `cat /proc/ax_proc/version`).
- Memoria: el repositorio ocupa 1,9 GB; los GGUF suman 1155 MB (talker) y 576 MB (code predictor y vocoder).
- La NPU queda ocupada en exclusiva por el proceso; no deben ejecutarse otros programas NPU en paralelo.
- Despliegue: binario estático `llama-tts` incluido en `bin/`, con dependencia únicamente de `/opt/lib` y libc; requiere `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`.
- Parámetros de ejecución: `-ngl 99 -c 4096`, top-k máximo 50.
- No se documenta compatibilidad con vLLM, Ollama, TGI ni llama.cpp estándar; el código fuente es una bifurcación específica (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`).
- VRAM en GPU: no disponible (el paquete no está orientado a GPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp (esta ficha) | 602.341.376 | 4096 tokens | 10 + auto | no disponible | GGUF + kernels NPU para AX8860 |
| Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (modelo base) | 0,6B | no disponible en la información | no disponible en la información | no disponible | Pesos originales en HuggingFace |
| Qwen3-TTS-0.6B Base (referenciado en la model card) | 0,6B | no disponible | no disponible | no disponible | No detallado en la información |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- La NPU de cuatro núcleos queda monopolizada por el proceso; no puede convivir con otras cargas NPU.
- Contexto limitado a 4096 tokens y top-k máximo de 50.
- La decodificación voraz (`--temp 0`) produce voz demasiado larga y con pausas excesivas; se recomienda el muestreo por defecto (temperatura 0,9, top-k 50).
- La variante de 0,6B no acepta instrucciones de estilo, lo que limita el control de emoción, ritmo o prosodia.
- La licencia no está indicada en la información disponible, por lo que no puede confirmarse el uso comercial; debe verificarse en el modelo base de Qwen antes de cualquier despliegue en producción.
- El paquete depende de una bifurcación no oficial de llama.cpp y de kernels específicos de Axera; la portabilidad a otro hardware no está soportada.
- Existe un coste de arranque de aproximadamente 14 s por proceso (carga y conversión de pesos), más 2,5 s adicionales en la primera síntesis, relevante para cargas intermitentes.
- No se documentan sesgos lingüísticos ni tasas de alucinación; la validación publicada se limita a frases de prueba en chino e inglés con transcripción ASR.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/AXERA-TECH/Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Bifurcación de llama.cpp: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `cff4752`)
- Kernels NPU: https://github.com/ZHEQIUSHUI/ax-dsl-kernels (rama `main`, commit `60dd25b`)
