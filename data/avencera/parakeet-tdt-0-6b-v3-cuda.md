# avencera/parakeet-tdt-0.6b-v3-cuda

## Resumen

Parakeet TDT 0.6B v3 CUDA es una exportación a safetensors de los pesos originales de NVIDIA Parakeet TDT 0.6B v3, empaquetada específicamente para scriptrs, una biblioteca de reconocimiento de voz escrita en Rust que ejecuta el modelo de forma nativa sobre GPUs NVIDIA sin depender de PyTorch ni de ONNX Runtime. El modelo base, desarrollado por NVIDIA, es un sistema de reconocimiento automático del habla (ASR) basado en FastConformer con decodificación TDT (Token-and-Duration Transducer) y 627 millones de parámetros, entrenado para transcribir 25 idiomas europeos con selección automática de idioma.

La relevancia de esta ficha no reside en el modelo en sí, sino en el envoltorio: los pesos son exactamente los de NVIDIA, sin modificar y con los nombres de tensor originales, exportados desde el checkpoint de NeMo con nemo-toolkit 3.0.0. El autor declara paridad de precisión con NeMo (WER idéntico en LibriSpeech test-clean, 1,93 %) a una velocidad 3,2 veces superior en una RTX 5090, y una ventaja de 9,9 a 13,8 veces frente a Whisper large-v3 en audio inglés difícil, con un WER medio inferior en todos los conjuntos evaluados.

Para un desarrollador que necesite ASR multilingüe de alta velocidad en producción sobre hardware NVIDIA, este repositorio ofrece una vía de despliegue ligera (sin stack Python), con licencia CC BY 4.0 y pesos en safetensors de 2,51 GB. Conviene tener en cuenta que la librería anfitriona, scriptrs, es un proyecto de un solo autor y que el modelo no incluye puntuación ni diarización en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parámetros totales | 627.090.582 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio; se recomienda `LongFormTranscriptionPipeline` para audio de más de 40 s) |
| Tipos de cuantización | FP32 (pesos originales); FP16 en capas del encoder seleccionadas en tiempo de carga en GPU; modos `Precision::Tf32` y `Precision::Fp32` disponibles en scriptrs |
| Idiomas soportados | 25: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk (selección automática de idioma) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`, 2,51 GB) + `parakeet_vocab.json` (tokenizer de NVIDIA) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer, una variante de Conformer con atención por bloques que reduce el coste computacional en secuencias de audio largas, acoplado a un decodificador TDT. TDT predice conjuntamente tokens y duraciones, lo que evita el problema de los tokens repetidos de los transductores clásicos y permite emitir varios tokens por fotograma sin necesidad de un modelo de lenguaje externo. El resultado es un sistema no autorregresivo en la práctica, con latencia baja y sin dependencia de beam search sobre un LM.

Sobre el entrenamiento, la información disponible no detalla el número de horas de audio, la composición del dataset ni si hubo etapas de ajuste fino supervisado o preferencias. Lo que sí se documenta es el proceso de exportación: los pesos FP32 de NVIDIA se extrajeron del checkpoint de NeMo (SHA-256 del origen `3cbdc85877e668ca7b82d0d56770eb1fac76691f55d6b97545e8d61ca588d10d`) con nemo-toolkit 3.0.0, conservando nombres de tensor y configuración en los metadatos del safetensors. scriptrs convierte capas seleccionadas del encoder a FP16 en la GPU al cargar, manteniendo el resto en FP32; el autor declara que el modo FP32 reproduce capa por capa la salida de NeMo y genera el texto exacto.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con detección automática del idioma.
- Decodificación TDT sin modelo de lenguaje externo, lo que simplifica el despliegue y reduce la latencia.
- Procesamiento por lotes (batches) con velocidad declarada de 4767x tiempo real en lotes de 16 sobre LibriSpeech test-clean.
- Transcripción de audio largo mediante `LongFormTranscriptionPipeline`, con integración opcional de VAD (Silero VAD v5 en safetensors) para segmentar grabaciones.
- Ejecución nativa en GPU NVIDIA sin PyTorch ni ONNX Runtime, a través de la librería Rust scriptrs.
- Modos de precisión configurables (FP16 por defecto, TF32 y FP32) para ajustar velocidad y fidelidad numérica.
- No se documentan capacidades de puntuación, diarización, marcas de tiempo a nivel de palabra ni traducción.

## Casos de uso

- Transcripción masiva de reuniones y llamadas: con 3633x tiempo real en formato largo sobre Earnings-21 (39 h en 44 llamadas) y un WER del 8,24 %, un solo servidor con RTX 5090 puede procesar cientos de horas de audio al día para actas, resúmenes posteriores y búsqueda sobre el contenido.
- Subtitulado y accesibilidad en vídeo: la velocidad de 2400x tiempo real en audio inglés difícil permite generar subtítulos de catálogos completos en minutos, y la selección automática de idioma cubre contenido multilingüe europeo sin configuración por fichero.
- Atención al cliente y analítica de contact center: el WER del 11,2 % en llamadas con 14 acentos (AppTek) y del 8,2 % en earnings calls lo hacen adecuado para transcribir conversaciones telefónicas y alimentar análisis de calidad, cumplimiento y detección de temas.
- Dictado y notas de voz en aplicaciones: la API de Rust con `TranscriptionPipeline::run` sobre muestras mono a 16 kHz permite integrar dictado en herramientas de escritorio o servicios backend con latencia baja y sin stack Python.
- Investigación lingüística y corpus multilingües: la cobertura de 25 idiomas europeos con un único modelo simplifica la transcripción de corpus comparables (FLEURS, MLS) y estudios cross-lingües.
- Pipeline de datos para entrenamiento de modelos: la velocidad de 4767x en lotes permite transcribir grandes volúmenes de audio sin GPU dedicada exclusiva, generando datos etiquetados para modelos de lenguaje o de voz.
- Despliegue en entornos con requisitos de empaquetado estricto: al no requerir PyTorch ni ONNX Runtime, encaja en contenedores ligeros y sistemas embebidos con GPU NVIDIA donde el stack de Python es un lastre operativo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), sobre una RTX 5090:

| Conjunto | Métrica | Valor |
|---|---|---|
| LibriSpeech test-clean (en) | WER | 1,93 % |
| FLEURS (de, es, fr, it, nl, pt) | WER | 4,57 % |
| Multilingual LibriSpeech (es, fr, it, pt) | WER | 6,25 % |

Comparativa de velocidad y precisión en LibriSpeech test-clean:

| Implementación | Velocidad (x tiempo real) | WER |
|---|---:|---:|
| scriptrs CUDA | 1534x | 1,93 % |
| NVIDIA NeMo (PyTorch) | 477x | 1,93 % |
| parakeet-rs 0.4.3 (ONNX Runtime) | 253x | 1,93 % |

Multilingüe (31,6 h, diez conjuntos, seis idiomas, selección automática):

| Conjunto | Velocidad FP16 | WER FP16 | WER FP32 |
|---|---:|---:|---:|
| FLEURS de, es, fr, it, nl, pt (15,8 h) | 1839x | 4,57 % | 4,57 % |
| MLS es, fr, it, pt (15,8 h) | 1921x | 6,25 % | 6,26 % |

Lotes y audio largo:

| Carga de trabajo | Velocidad | WER |
|---|---:|---:|
| LibriSpeech test-clean, lotes de 16 | 4767x | 1,93 % |
| Earnings-21, 44 llamadas (39 h), formato largo | 3633x | 8,24 % |

Comparación con Whisper large-v3 (vía WhisperX 3.8.6, float16), audio inglés difícil en formato largo:

| Conjunto | Horas | WER scriptrs | WER Whisper | Velocidad scriptrs | Velocidad Whisper |
|---|---:|---:|---:|---:|---:|
| Earnings-21 | 39,3 | 8,2 % | 9,7 % | 2458x | 186x |
| AMI meetings, headset | 18,7 | 21,5 % | 23,8 % | 2420x | 182x |
| AMI meetings, micrófono lejano | 18,7 | 23,2 % | 28,3 % | 2414x | 199x |
| EdAcc conversaciones con acento | 18,2 | 16,0 % | 19,2 % | 2433x | 201x |
| CHiME-6 cenas | 9,7 | 44,0 % | 44,7 % | 2438x | 176x |
| AppTek call-center, 14 acentos | 9,4 | 11,2 % | 12,6 % | 2220x | 224x |
| Media sobre conjuntos | 114 | 20,7 % | 23,1 % | 2417x | 191x |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,5 GB en disco; en FP16 la huella en GPU es aproximadamente la mitad de los pesos (del orden de 1,3-1,5 GB), más buffers de activaciones. No se publica una cifra exacta de VRAM.
- GPU recomendadas: RTX 5090 (hardware de referencia de todos los benchmarks). Al ser un modelo de 0,6 B, cabe con holgura en GPUs consumer modernas (RTX 3090, 4090, 5080/5090 y previsiblemente en gamas medias con suficiente VRAM); no se documentan pruebas en A100, H100 ni en GPUs de menos de 8 GB.
- Cabe en GPU consumer: sí, según el tamaño de pesos y el hardware de referencia; no se especifica el mínimo verificado.
- Opciones de despliegue: scriptrs 0.3.1 o superior con la feature `cuda` (Rust); descarga automática del repositorio fijado por revisión o carga desde disco con `ModelBundle::from_native_dir`. Para audio de más de 40 s, `LongFormTranscriptionPipeline`; con la feature `vad`, `from_pretrained_native_long_form` descarga además `avencera/silero-vad-v5-safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a ASR).
- Latencia y throughput: 1534x tiempo real en una sola utterance (LibriSpeech test-clean), 4767x en lotes de 16, 3633x en formato largo sobre Earnings-21, 1839-1921x en multilingüe y 2220-2458x en los conjuntos de audio difícil, todo sobre una RTX 5090.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 CUDA (este) | 627 M | 25 europeos | 1,93 % | CC BY 4.0 | safetensors, scriptrs (Rust + CUDA) |
| NVIDIA Parakeet TDT 0.6B v3 (original) | 627 M | 25 europeos | 1,93 % | CC BY 4.0 | NeMo (PyTorch) |
| Whisper large-v3 | no disponible en la información | 99 (declarados por OpenAI) | no disponible en la información; en los conjuntos difíciles de esta ficha, WER medio 23,1 % frente a 20,7 % | MIT (según información pública; no verificada aquí) | PyTorch, WhisperX, whisper.cpp |
| parakeet-rs 0.4.3 (ONNX Runtime) | 627 M (mismo modelo base) | 25 europeos | 1,93 % | CC BY 4.0 | ONNX Runtime |

La comparación directa con Whisper large-v3 solo está documentada para audio inglés difícil en formato largo: scriptrs obtiene menor WER en los seis conjuntos y una velocidad 9,9-13,8 veces superior. No se dispone de comparación con otros modelos ASR multilingües (por ejemplo, MMS, SeamlessM4T o Canary) en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor del repositorio y no están verificados de forma independiente (campo `verified: false` en el model-index).
- El WER en audio difícil sigue siendo alto en términos absolutos: 44,0 % en CHiME-6 (cenas con ruido y solapamiento) y 21,5-23,2 % en reuniones AMI, lo que limita su uso sin revisión humana en esos escenarios.
- No se documentan capacidades de puntuación, mayúsculas, diarización ni marcas de tiempo; si se necesitan, habrá que añadirlas externamente.
- El modelo está pensado para audio mono a 16 kHz; no se documenta robustez frente a otras frecuencias de muestreo o canales.
- La licencia CC BY 4.0 permite uso comercial con atribución a NVIDIA y al autor de la exportación; hay que conservar el crédito y señalar los cambios.
- El ecosistema de despliegue depende de scriptrs, una biblioteca de un único autor; la disponibilidad a largo plazo, el soporte y la compatibilidad de versiones son riesgos operativos a evaluar.
- No se publican datos sobre sesgos por acento, dialecto, edad o género; los conjuntos de evaluación incluyen acentos (EdAcc, AppTek) pero sin análisis desagregado.
- Riesgo de alucinación inherente a los sistemas ASR: en audio con ruido o silencios largos puede generar texto no presente en la señal.
- No se especifica el mínimo de VRAM verificado ni el rendimiento en GPUs distintas de la RTX 5090.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/avencera/parakeet-tdt-0.6b-v3-cuda
- Modelo base en HuggingFace: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Librería scriptrs (GitHub): https://github.com/avencera/scriptrs
- Resultados adicionales de scriptrs en CUDA: https://github.com/avencera/scriptrs#cuda
- VAD Silero v5 en safetensors: https://huggingface.co/avencera/silero-vad-v5-safetensors
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
