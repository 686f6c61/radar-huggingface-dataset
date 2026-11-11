# Nimruz/Nava

## Resumen

Nava es un modelo de reconocimiento automático del habla (ASR) especializado en persa (farsi), desarrollado por Nimruz. Se trata de un ajuste fino de `openai/whisper-large-v3-turbo` (809M parámetros) sobre 579 horas de audio persa filtrado, con el objetivo de mejorar la transcripción en registros conversacionales y producir ortografía persa estándar, incluyendo los medios espacios (half-spaces) propios de la escritura culta como «می‌شود» o «سازمان‌ها».

El modelo resuelve un problema concreto: los Whisper genéricos tienen un rendimiento pobre en persa (el modelo base de OpenAI obtiene un 47,2 % de WER en Common Voice 22 fa), mientras que Nava baja esa cifra al 13,2 % y lidera en conjuntos conversacionales y ruidosos entre los cuatro modelos abiertos comparados por el autor. Mantiene la arquitectura encoder-decoder transformer de Whisper, por lo que es compatible con todo el ecosistema existente (transformers, faster-whisper, whisper.cpp).

Es relevante ahora porque cubre un hueco de calidad en un idioma con pocos recursos ASR de calidad y porque se distribuye con licencia MIT y exportaciones listas para CPU y dispositivos sin Python. El autor lo presenta explícitamente como una preview de una única ejecución de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 (809M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento; audio largo requiere troceado manual |
| Tipos de cuantizacion | float16, float32, int8 (CTranslate2); GGML 16-bit float, q8_0, q5_0 (whisper.cpp) |
| Idiomas soportados | Persa (fa) exclusivamente; entrenado solo con el prompt de persa |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers), CTranslate2 (Nava-ct2), GGML (Nava-ggml) |

## Arquitectura y entrenamiento

Nava parte de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con 809M parámetros y decodificador reducido respecto a large-v3. El ajuste fino se realizó sobre 579 horas de habla persa filtrada, compuesta por los conjuntos `PerSets/youtube-persian-asr`, `PerSets/filimo-persian-asr`, `Reza2kn/Common-Voice-25-Persian-Raw` y `MahtaFetrat/Mana-TTS`. No se detalla en la información disponible la composición exacta por horas de cada fuente ni si hubo etapas de RLHF o DPO.

La innovación técnica principal no está en la arquitectura sino en el proceso de datos y en el comportamiento del decodificador: el modelo fue ajustado sin tokens de timestamp, lo que invalida el modo long-form nativo de Whisper y obliga a trocear el audio en segmentos de 30 segundos o menos en puntos de silencio. Con ese troceado, el autor reporta 11,1 % de WER en 13 clips largos de FLEURS, frente al 31,9 % si se usa el modo long-form integrado. También se ha cuidado la normalización de salida para producir ortografía persa estándar con medios espacios.

## Capacidades

- Transcripción de voz a texto en persa con salida en ortografía estándar, incluyendo medios espacios.
- Reconocimiento robusto en habla conversacional (C1Tech) y en audio mixto con ruido (PSRB).
- Procesamiento de audio de cualquier duración mediante troceado en puntos de silencio (script `transcribe.py` incluido).
- Conversión opcional de números, horas y fechas a dígitos mediante el flag `--digits fa`.
- Compatibilidad con tres runtimes: transformers, faster-whisper (CTranslate2) y whisper.cpp.
- Ejecución en CPU, GPU y dispositivos ligeros gracias a las exportaciones cuantizadas.
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción; es un modelo ASR puro y monoidioma.

## Casos de uso

- Subtitulado de vídeo en persa: el modelo transcribe audio de hasta 30 segundos por segmento con buena calidad en habla natural, y el script incluido permite procesar archivos completos cortando en silencios. Adecuado para canales de YouTube y plataformas de contenido en farsi.
- Transcripción de entrevistas y podcasts: con 11,7 % de WER en el conjunto conversacional C1Tech, es la mejor opción entre los modelos abiertos comparados para diálogo espontáneo, el registro típico de entrevistas.
- Atención al cliente y análisis de llamadas: el rendimiento en PSRB (17,2 % de WER, audio mixto y ruidoso) lo hace viable para transcribir grabaciones telefónicas y alimentar sistemas de análisis de calidad o búsqueda sobre conversaciones.
- Archivado y búsqueda de contenido audiovisual en persa: al ejecutarse en CPU con faster-whisper o whisper.cpp q5_0 (0,53 GB), permite indexar grandes volúmenes de audio en servidores sin GPU.
- Aplicaciones móviles y de escritorio sin Python: la exportación GGML q5_0 o q8_0 se integra en whisper.cpp, lo que habilita dictado y notas de voz en local en portátiles y teléfonos.
- Generación de datos para entrenamiento de TTS y otros modelos: la salida con ortografía normalizada y medios espacios correctos sirve para construir corpus alineados de audio-texto en persa.
- Accesibilidad: transcripción en tiempo casi real de clases, reuniones o eventos en farsi para personas con discapacidad auditiva, usando faster-whisper con `compute_type="int8"` en hardware modesto.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %) con tasa de error de carácter ignorando espacios entre paréntesis. Menor es mejor. Todos los modelos fueron evaluados por el autor con el mismo scorer y los mismos clips.

| Modelo | Parametros | C1Tech (conversacional) | PSRB (mixto, ruidoso) | FLEURS fa (lectura) | Common Voice 22 fa (lectura) |
|---|---|---|---|---|---|
| **Nava** | 809M | **11,7 (3,8)** | **17,2 (5,8)** | 8,7 (2,3) | 13,2 (3,3) |
| Reza2kn/Shenava-Koochik-v1.5 | 114M | 13,4 (5,2) | 22,5 (9,0) | **8,1** (3,0) | **12,5** (3,2) |
| mehdi-hf/nemotron-asr-streaming-farsi | 600M | 12,4 (4,5) | 23,1 (9,3) | 9,4 (3,2) | 18,4 (5,4) |
| givia/whisper-large-v3-turbo-persian | 809M | 13,4 (5,1) | 22,8 (9,9) | 10,1 (5,2) | 18,3 (6,4) |
| openai/whisper-large-v3-turbo (base) | 809M | no ejecutado | no ejecutado | 19,7 (6,2) | 47,2 (26,8) |

Conjuntos de evaluación: C1Tech/Persian-ASR-Benchmark (2.101 clips), PartAI/PSRB (344 clips), FLEURS `fa_ir` test (871 clips) y Common Voice 22 persa (muestra fija aleatoria de 1.500 de 10.676 clips).

## Requisitos de hardware

- VRAM estimada en float16: en torno a 1,6-2 GB para los pesos más activaciones; el repo pesa 1,6 GB en safetensors.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo es pequeño y no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en todas las RTX modernas e incluso en GPUs integradas con suficiente memoria compartida.
- CPU: viable con faster-whisper (`compute_type="int8"` o `"float32"`) y con whisper.cpp usando `ggml-nava-q5_0.bin` (0,53 GB) o `ggml-nava-q8_0.bin` (0,81 GB).
- Opciones de despliegue: transformers, faster-whisper/CTranslate2, whisper.cpp v1.7.4. No se mencionan vLLM ni TGI, que no aplican a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de fidelidad de exportaciones: las weights de transformers dieron texto idéntico en 10 clips de FLEURS; CTranslate2 y los tres archivos whisper.cpp coincidieron en 9 de 10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER C1Tech | WER FLEURS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nava | 809M | 30 s por segmento | 11,7 | 8,7 | MIT | HF (transformers, ct2, ggml) |
| Reza2kn/Shenava-Koochik-v1.5 | 114M | 30 s por segmento | 13,4 | 8,1 | no disponible | HF |
| mehdi-hf/nemotron-asr-streaming-farsi | 600M | 30 s por segmento | 12,4 | 9,4 | no disponible | HF |
| givia/whisper-large-v3-turbo-persian | 809M | 30 s por segmento | 13,4 | 10,1 | no disponible | HF |

Nava lidera en los conjuntos conversacional y ruidoso, mientras que Shenava-Koochik-v1.5, con solo 114M parámetros, obtiene mejores cifras en lectura (FLEURS y Common Voice). La licencia MIT de Nava es una ventaja clara frente a alternativas cuya licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- Es una preview de una única ejecución de entrenamiento; el autor advierte explícitamente de que se lea la sección de limitaciones antes de confiar en él en producción.
- No usar el modo long-form nativo de Whisper: fue ajustado sin tokens de timestamp y rinde mucho peor (31,9 % de WER frente a 11,1 % con troceado manual en los 13 clips largos de FLEURS).
- Monoidioma: solo persa. Es obligatorio pasar `language="fa"`; no se ha entrenado con otros prompts de idioma.
- El audio de entrada debe ser 16 kHz mono; whisper.cpp exige WAV de 16 bits y el script usa ffmpeg o librosa para la conversión.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio o ruido extremo; no se documenta mitigación específica más allá del troceado en silencios.
- Sesgos: no se documentan sesgos demográficos o dialectales concretos en la información disponible; el entrenamiento se basa en YouTube, Filimo, Common Voice y Mana-TTS, lo que puede infrarepresentar variedades no presentes en esas fuentes.
- La ruta `vad_filter=True` de faster-whisper no ha sido probada con Nava según el autor.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, pero al derivar de Whisper conviene verificar las condiciones de la licencia original de OpenAI para los pesos base.
- Cifras de rendimiento reportadas por el autor del modelo en su propia evaluación; no hay validación independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nimruz/Nava
- Exportación CTranslate2 (faster-whisper): https://huggingface.co/Nimruz/Nava-ct2
- Exportación GGML (whisper.cpp): https://huggingface.co/Nimruz/Nava-ggml
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset PerSets/youtube-persian-asr: https://huggingface.co/datasets/PerSets/youtube-persian-asr
- Dataset PerSets/filimo-persian-asr: https://huggingface.co/datasets/PerSets/filimo-persian-asr
- Dataset Reza2kn/Common-Voice-25-Persian-Raw: https://huggingface.co/datasets/Reza2kn/Common-Voice-25-Persian-Raw
- Dataset MahtaFetrat/Mana-TTS: https://huggingface.co/datasets/MahtaFetrat/Mana-TTS
- Benchmark C1Tech/Persian-ASR-Benchmark: https://huggingface.co/datasets/C1Tech/Persian-ASR-Benchmark
- Benchmark PartAI/PSRB: https://huggingface.co/datasets/PartAI/PSRB
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
