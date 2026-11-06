# qvac/TranscribePsy-250M-EU-sub

## Resumen

TranscribePsy-250M-EU-sub es un modelo de reconocimiento automático del habla (ASR) de 254 millones de parámetros desarrollado por qvac (tether-ai-research), destilado a partir de nvidia/parakeet-tdt-0.6b-v3 y orientado a despliegue en dispositivo y en el borde. Cubre las ocho lenguas europeas seleccionadas por Multilingual LibriSpeech (neerlandés, inglés, francés, alemán, italiano, polaco, portugués y español) y concentra su presupuesto de parámetros en ese subconjunto para reducir el error respecto a la variante de 25 idiomas de la misma familia.

El modelo emplea una arquitectura FastConformer con decodificador transducer TDT, heredada del modelo base de NVIDIA, y se distribuye en formato NeMo/safetensors (2,0 GB de repositorio), además de builds GGUF (Q8_0) para el motor `qvac-fabric-speech.cpp` y Core ML para el Neural Engine de Apple. Su relevancia actual radica en que alcanza un WER de 5,87 en Multilingual LibriSpeech y 7,50 en Open ASR Leaderboard con solo 254M de parámetros, por delante de modelos de 764M a 976M de parámetros en el conjunto multilingüe, y con un factor de tiempo real de 0,052 en móviles con cuantización de 8 bits.

La licencia Apache 2.0 y la disponibilidad de artefactos optimizados para teléfono lo sitúan como una opción práctica para transcripción local, subtitulado y asistentes de voz sin dependencia de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador transducer TDT |
| Parámetros totales | 253.954.838 (254M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (build GGUF Q8_0); pesos originales en safetensors sin cuantizar |
| Idiomas soportados | nl, en, fr, de, it, pl, pt, es (8 lenguas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NeMo); GGUF (Q8_0); Core ML |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por destilación del checkpoint nvidia/parakeet-tdt-0.6b-v3, que combina un codificador FastConformer con un decodificador transducer de token y duración (TDT). FastConformer es una variante de Conformer con atención submuestreada que reduce la longitud de la secuencia antes del bloque de atención, lo que rebaja el coste computacional en audio largo. El decodificador TDT predice de forma conjunta el token y su duración, lo que permite emitir varios tokens por paso y acelera la inferencia frente a un transducer RNN-T clásico.

No se detalla en la información disponible el volumen de horas de audio, la composición exacta del dataset de destilación ni si se aplicaron etapas de RLHF o ajuste con preferencias; en ASR estos modelos se entrenan habitualmente con supervisión CTC/transducer sobre corpus etiquetados. La innovación destacable es la compresión de un modelo de 0,6B a 254M manteniendo (y en MLS superando) la precisión del profesor en las ocho lenguas cubiertas, junto con la publicación de builds cuantizados a 8 bits para GGUF y Core ML que reducen el modelo a 305 MB y permiten ejecución en el Neural Engine.

## Capacidades

- Reconocimiento de voz multilingüe en ocho lenguas europeas: neerlandés, inglés, francés, alemán, italiano, polaco, portugués y español.
- Transcripción de audio corto y de formato largo (evaluado en test sets como AMI, Earnings-22, GigaSpeech, LibriSpeech, SPGISpeech, VoxPopuli y FLEURS).
- Inferencia en dispositivo y en el borde: build GGUF para `qvac-fabric-speech.cpp` y build Core ML para el Apple Neural Engine.
- Ejecución en tiempo real con factor de tiempo real de 0,052 y latencia de 1.021 ms en móviles de 8 bits.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del reconocimiento de habla.
- No se documenta un modo "thinking" ni funcionalidades de diarización o traducción.

## Casos de uso

- Transcripción local en aplicaciones móviles: con 305 MB en GGUF Q8_0 y 534 MiB de pico de memoria a 10 s de audio, el modelo cabe en un teléfono de gama media y permite dictado y notas de voz sin enviar audio a la nube.
- Subtitulado y actas de reuniones: el bajo factor de tiempo real (0,052) permite procesar audio de reuniones en segundo plano; según la fuente, 10 minutos de audio se transcriben en 1,65 s en un iPhone.
- Asistentes de voz integrados: la latencia de arranque en frío de 252 ms y la inferencia de 1.021 ms hacen viable la transcripción de comandos cortos en un bucle interactivo.
- Transcripción de contenido audiovisual multilingüe: cubre las ocho lenguas de MLS, útil para catalogar y buscar en archivos de vídeo y pódcast europeos.
- Cumplimiento y privacidad de datos: al ejecutarse íntegramente en dispositivo, evita el envío de audio a servicios externos, lo que encaja en entornos sanitarios, legales o corporativos con requisitos de residencia de datos.
- Investigación en ASR eficiente: sirve como referencia de destilación de un modelo de 0,6B a 254M y como base para fine-tuning en dominios específicos con licencia Apache 2.0.
- Integración en dispositivos empotrados y wearables: el tamaño reducido y el soporte Core ML permiten desplegar transcripción en relojes y auriculares con Neural Engine.

## Benchmarks y rendimiento

Resultados de WER (menor es mejor) según la model card. La media de Open ASR Leaderboard combina la media inglesa de formato corto con la media multilingüe (FLEURS y MLS).

| Suite | TranscribePsy-250M-EU-sub | TranscribePsy-250M-EU | Whisper-small (242M) | omniASR-CTC-300M-v2 (326M) | OWSM v4 small (370M) |
|---|---|---|---|---|---|
| Open ASR Leaderboard | 7,50 | 8,02 | 12,34 | 15,31 | 9,72 |
| Multilingual LibriSpeech | 5,87 | 6,58 | 11,51 | 11,89 | 11,84 |
| Common Voice v25 | n/a | 21,56 | 38,17 | 32,23 | 37,74 |

Comparación con modelos de mayor tamaño:

| Métrica | TranscribePsy-250M-EU-sub | Qwen3-ASR-0.6B (782M) | omniASR-CTC-1B-v2 (976M) | Whisper-Medium (764M) |
|---|---|---|---|---|
| Parámetros | 254M | 782M | 976M | 764M |
| Open ASR Leaderboard | 7,50 | 7,40 | 9,68 | 8,79 |
| Multilingual LibriSpeech | 5,87 | 12,60 | 7,71 | 7,76 |
| Tamaño del modelo (MB) | 305 | 854 | 1.056 | 823 |
| Factor de tiempo real | 0,052 | 0,462 | 0,998 | 0,931 |
| Latencia de inferencia (ms) | 1.021 | 7.616 | 15.372 | 14.636 |
| Latencia de arranque en frío (ms) | 252 | 677 | 898 | 870 |
| Pico de memoria a 10 s (MiB) | 534 | 1.169 | 1.275 | 1.569 |

Resultados por conjunto de test (WER) frente a modelos del mismo tamaño:

| Test set | TranscribePsy-250M-EU-sub | Whisper-small | omniASR-CTC-300M-v2 | OWSM v4 small |
|---|---|---|---|---|
| AMI | 12,37 | 53,35 | 32,51 | 15,47 |
| Earnings-22 | 14,77 | 13,21 | 26,33 | 14,48 |
| GigaSpeech | 11,23 | 10,56 | 22,84 | 11,17 |
| LibriSpeech clean | 2,14 | 2,59 | 4,71 | 2,56 |
| LibriSpeech other | 4,81 | 6,60 | 11,86 | 5,98 |
| SPGISpeech | 8,77 | 3,24 | 14,05 | 2,79 |
| VoxPopuli | 7,42 | 7,85 | 13,28 | 8,65 |
| FLEURS German | 6,58 | 7,61 | 14,53 | 10,08 |
| FLEURS Spanish | 4,76 | 4,67 | 9,56 | 8,21 |
| FLEURS French | 8,24 | 11,52 | no disponible | no disponible |

## Requisitos de hardware

- Inferencia en CPU/GPU: el modelo completo en safetensors ocupa aproximadamente 1 GB en FP32 (2,0 GB de repositorio) y el build GGUF Q8_0 pesa 305 MB.
- VRAM estimada: no disponible de forma explícita; el pico de memoria medido en móvil con 8 bits es de 534 MiB a 10 s de audio, por lo que en GPU el consumo será del orden de 1 GB o inferior según el backend.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer reciente (RTX 3060 o superior) es sobrada, y el modelo está pensado para CPU y Neural Engine.
- Cabe en GPU consumer: sí, con amplio margen, y también en teléfonos y dispositivos con Neural Engine.
- Opciones de despliegue: NeMo (PyTorch), `qvac-fabric-speech.cpp` con GGUF, Core ML para Apple Neural Engine. No se documenta soporte explícito de vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: factor de tiempo real de 0,052, latencia de inferencia de 1.021 ms y arranque en frío de 252 ms en móviles con 8 bits; según la fuente, 10 minutos de audio se transcriben en 1,65 s en un iPhone.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Open ASR LB (WER) | MLS (WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TranscribePsy-250M-EU-sub | 254M | 8 | 7,50 | 5,87 | Apache 2.0 | safetensors, GGUF, Core ML |
| TranscribePsy-250M-EU | 250M (familia) | 25 | 8,02 | 6,58 | Apache 2.0 | PyTorch |
| Whisper-small | 242M | multilingüe | 12,34 | 11,51 | MIT (según información pública) | múltiples formatos |
| omniASR-CTC-300M-v2 | 326M | multilingüe | 15,31 | 11,89 | no disponible | no disponible |
| OWSM v4 small | 370M | multilingüe | 9,72 | 11,84 | no disponible | no disponible |
| Qwen3-ASR-0.6B | 782M | multilingüe | 7,40 | 12,60 | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura limitada a ocho lenguas: no transcribe lenguas fuera de nl, en, fr, de, it, pl, pt y es; para cobertura europea amplia debe usarse TranscribePsy-250M-EU (25 idiomas).
- El resultado de Common Voice v25 no se reporta para este modelo porque el conjunto incluye lenguas fuera de su ámbito, de modo que no hay una métrica directa de robustez ante acentos y ruido fuera de MLS y FLEURS.
- Riesgo de alucinación y de errores en audio con ruido, solapamiento de hablantes o dominio muy alejado del corpus de entrenamiento; no se documentan métricas de diarización ni de segmentación de hablantes.
- No se detallan sesgos conocidos por acento, género o variedad dialectal en la información disponible; conviene evaluar por subgrupo antes de producción.
- El WER en SPGISpeech (8,77) es peor que el de Whisper-small (3,24) y OWSM v4 small (2,79), lo que sugiere menor robustez en audio de dominio financiero o con estilo de lectura concreto.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificar las condiciones del modelo base (nvidia/parakeet-tdt-0.6b-v3) en la distribución derivada.
- Los builds GGUF y Core ML están vinculados a motores concretos (`qvac-fabric-speech.cpp` y Neural Engine); fuera de esos entornos hay que usar NeMo/PyTorch.
- No se documentan requisitos de contexto ni límites de duración de audio más allá de las pruebas realizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub
- Build GGUF: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-gguf
- Build Core ML: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-coreml
- Variante de 25 idiomas: https://huggingface.co/qvac/TranscribePsy-250M-EU
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Motor de inferencia: https://github.com/tether-ai-research/qvac-transcribePsy
- Artículo de análisis: https://www.explainx.ai/blog/tether-transcribepsy-250m-on-device-speech-recognition-2026
- Multilingual LibriSpeech: https://www.openslr.org/94/
- Paper referenciado en los tags: arxiv:2610.19134 (no verificado en la información disponible)
