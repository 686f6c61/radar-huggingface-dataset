# AXERA-TECH/Qwen3-TTS-1.7B-VoiceDesign-AX8860-llama.cpp

## Resumen

Qwen3-TTS-1.7B-VoiceDesign-AX8860-llama.cpp es una distribución empaquetada del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-VoiceDesign de Qwen (Alibaba), preparada por AXERA-TECH para ejecutarse sobre la NPU del SoC Axera AX8860 mediante llama.cpp y el backend ggml-axera. No se trata de un modelo nuevo ni de un fine-tune: es una conversión de pesos a GGUF BF16 junto con kernels NPU precompilados y un binario de placa `llama-tts`, orientada a despliegue embebido.

La tarea del modelo es text-to-speech con control de timbre mediante lenguaje natural: el usuario describe la voz deseada en una instrucción (`--tts-instruct`) y el modelo sintetiza el audio sin necesidad de hablante predefinido ni audio de referencia. Es relevante para quienes necesitan TTS local en hardware de borde sin GPU dedicada, con un pipeline completo (talker, code predictor y vocoder) ejecutándose en la NPU.

El repositorio ocupa 4,3 GB y contiene los pesos en dos GGUF (talker de 3,2 GB y code predictor más vocoder de 645 MB), los kernels NPU y el binario estático. La licencia no está declarada en la información disponible, por lo que debe verificarse en el modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de síntesis de voz (TTS) basado en Qwen3, con componentes talker, code predictor y vocoder; ejecución vía llama.cpp + ggml-axera sobre NPU |
| Parametros totales | 1.733.157.888 (1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | GGUF BF16 publicado; conversión interna en carga a MXFP8 (talker y code predictor) y BF16 (vocoder) |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru y auto (según `--tts-lang`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16) + kernels NPU precompilados + binario estático |

## Arquitectura y entrenamiento

El modelo base es Qwen3-TTS-12Hz-1.7B-VoiceDesign, un sistema de síntesis de voz de Qwen con representación de audio a 12 Hz. La distribución de AXERA-TECH divide la inferencia en cuatro kernels NPU: talker prefill, talker decode (incluye la cabeza del codec), code predictor y decodificador del codec (vocoder). Los pesos no están embebidos en los kernels: se cargan desde los GGUF y se convierten en tiempo de carga a MXFP8 (talker y code predictor) y BF16 (vocoder), proceso que consume aproximadamente 25 segundos por proceso.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si se aplicaron técnicas de RLHF o DPO. La innovación destacable de esta distribución es de despliegue, no de entrenamiento: portar el pipeline completo de TTS a la NPU de cuatro núcleos del AX8860 con llama.cpp, incluyendo la decodificación del codec de audio en el mismo backend.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto con salida WAV.
- Diseño de timbre por descripción en lenguaje natural mediante `--tts-instruct` (obligatorio); no acepta `--tts-speaker` ni audio de referencia.
- Multilingüe en síntesis: chino, inglés, alemán, italiano, portugués, español, japonés, coreano, francés y ruso, más modo `auto`.
- Control de idioma de salida mediante `--tts-lang`.
- Ejecución local en NPU embebida, sin GPU dedicada.
- No se documentan capacidades de tool calling, agentes, visión ni modo thinking; el modelo está especializado en TTS.

## Casos de uso

- Síntesis de voz en dispositivos de borde: el pipeline completo corre en la NPU del AX8860, adecuado para equipos sin GPU donde se requiere generación de audio local y sin conexión.
- Locución con timbre personalizado sin datos de referencia: `--tts-instruct` permite describir la voz (por ejemplo, "voz femenina calmada, cálida y pausada") y obtenerla sin muestras de hablante.
- Anuncios y avisos multilingües en sistemas embebidos: con soporte para diez idiomas y `auto`, se puede generar el mismo mensaje en distintos idiomas según configuración regional.
- Accesibilidad en terminales dedicadas: lectura en voz alta de texto en dispositivos de asistencia con hardware de bajo consumo.
- Generación por lotes de audio para contenidos pregrabados: el modo estable rinde unas 32 tramas por segundo (31 ms por trama de 80 ms), lo que permite procesar párrafos largos de forma secuencial.
- Prototipado de interfaces de voz en kioscos o paneles: síntesis bajo demanda con latencia conocida y sin dependencia de servicios en la nube.
- Validación de pipelines ASR-TTS: el propio autor verifica la salida transcribiéndola con Qwen3-ASR-1.7B, patrón reutilizable para control de calidad automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MOS, WER, MMLU u otros) en la información disponible. Los únicos datos medidos son de rendimiento en placa:

| Metrica | Resultado |
|---|---|
| Audio generado en prueba | 22,2 s de voz en chino |
| Tiempo total del proceso (incluye carga y primera conversión del vocoder) | 36 s |
| Estado estable talker + codec | ~32 tramas/s (31 ms por trama de 80 ms) |
| Carga y conversión de pesos (una vez por proceso) | ~25 s |
| Verificación de correctitud | Transcripción con Qwen3-ASR-1.7B idéntica al texto original en frase larga en chino |

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 núcleos; SDK V0.5.0 o superior (probado con V0.5.1).
- La NPU queda ocupada en exclusiva durante la inferencia; no deben ejecutarse otros programas NPU en paralelo.
- Almacenamiento: repositorio de 4,3 GB (GGUF de 3,2 GB + 645 MB, kernels y binario).
- Memoria: no se especifica el consumo de RAM del sistema; no disponible.
- Despliegue: binario `llama-tts` estático incluido, con dependencia de `/opt/lib` y libc; requiere `LD_LIBRARY_PATH=/opt/lib`, `GGML_AXERA_KERNEL_DIR=<repo>/kernels`, `-ngl 99 -c 4096` y top-k máximo 50.
- No está pensado para GPU de consumo (RTX 4090) ni para servidores A100/H100: la distribución está ligada al backend ggml-axera. El GGUF podría en teoría cargarse en llama.cpp estándar, pero no se documenta ni se garantiza.
- Throughput estimado: ~32 tramas/s en estado estable; latencia de arranque de ~25 s por proceso debido a la conversión de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-VoiceDesign-AX8860 (esta ficha) | 1,7B | 4096 | TTS con diseño de voz, NPU AX8860 | no disponible | GGUF + kernels AX8860 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign (base) | 1,7B | no disponible | TTS con diseño de voz | no disponible | Hugging Face (Qwen) |
| Alternativas de TTS open source de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens y top-k máximo de 50.
- La decodificación greedy (`--temp 0`) produce voz excesivamente larga y con pausas; se recomienda la muestreo por defecto.
- `--tts-instruct` es obligatorio; el modelo rechaza hablantes predefinidos y audio de referencia, lo que limita la clonación de voz.
- Ocupa los 4 núcleos NPU en exclusiva; no puede convivir con otras cargas NPU en el mismo dispositivo.
- El arranque de cada proceso incurre en ~25 s de carga y conversión de pesos, inadecuado para invocaciones cortas y frecuentes.
- Licencia no declarada en esta distribución: debe consultarse la del modelo base Qwen3-TTS antes de uso comercial.
- No hay datos publicados sobre sesgos, tasas de alucinación en la síntesis ni evaluación de calidad perceptual (MOS); no disponible.
- La verificación de correctitud documentada se limita a una frase larga en chino; el rendimiento en el resto de idiomas no está validado en la model card.
- Dependencia de una versión concreta de SDK (V0.5.0+) y de un fork específico de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`), lo que reduce la portabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-1.7B-VoiceDesign-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
- Axera (fabricante del SoC): no disponible en la información proporcionada
