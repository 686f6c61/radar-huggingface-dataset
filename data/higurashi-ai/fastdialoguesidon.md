# higurashi-ai/FastDialogueSidon

## Resumen

FastDialogueSidon es un modelo de separación y restauración de diálogo full-duplex desarrollado por higurashi-ai, publicado como pesos en Hugging Face en octubre de 2026. Es la versión acelerada de DialogueSidon (presentado en SIGDIAL 2026): toma hasta 120 segundos de audio de diálogo mono a 16 kHz con dos hablantes solapados y devuelve dos pistas separadas de 24 kHz por hablante, resolviendo el problema de recuperar conversaciones naturales de "in the wild" donde los interlocutores se interrumpen y solapan constantemente.

Su relevancia radica en la velocidad: sustituye los 30 pasos de difusión del modelo original por un único paso de un cabezal DiT (Diffusion Transformer) y reemplaza el decodificador DAC por un decodificador latente ligero de 30 M de parámetros (SAN-WaveNeXt2). El resultado es una aceleración de entre 86x y 107x respecto a DialogueSidon en una H100, manteniendo una calidad de separación prácticamente equivalente (WER incluso inferior en OpenDialog). Con un tamaño total de unos 1,73 GB en pesos fp32 y backends Triton y TensorRT listos para producción, es una herramienta muy práctica para pipelines de procesamiento de audio conversacional multilingüe (inglés, japonés, alemán, español, francés y chino).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder w2v-BERT 2.0 (13 capas) + cabezal DiT de un paso + decodificador latente SAN-WaveNeXt2 (WaveFitNeXt) |
| Parametros totales | ≈ 433,4 M (314,6 M encoder + 88,7 M DiT + 30,1 M vocoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 120 s de audio de entrada por ventana (16 kHz mono) |
| Tipos de cuantizacion | fp32 (pesos publicados); inferencia verificada en fp16 (Triton) |
| Idiomas soportados | en, ja, de, es, fr, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (≈ 1,73 GB en total) |

## Arquitectura y entrenamiento

El modelo consta de tres módulos entrenados conjuntamente para FastDialogueSidon. El encoder es un w2v-BERT de 13 capas con atención `relative_key` (314,6 M de parámetros) al que se añaden dos cabezas latentes de hablante. El cabezal de difusión es un DiT de 8 capas con dimensión oculta 768 (88,7 M de parámetros) que realiza un único paso de actualización por ventana en lugar de los 30 pasos de muestreo con DPM-Solver++ del modelo original. Finalmente, el vocoder es un decodificador latente SAN-WaveNeXt2 (WaveFitNeXt) de 30,1 M de parámetros, con bloques ConvNeXt a nivel de frame y solo 2 iteraciones, que sustituye al decodificador DAC de DialogueSidon. El paquete incluye además un fichero `stats.safetensors` con la media y desviación típica de normalización latente por canal.

No se ha publicado información sobre el número de tokens o muestras de entrenamiento ni sobre la composición exacta del dataset; la model card indica únicamente que ni CallFriend ni OpenDialog se usaron en entrenamiento, sirviendo solo como conjuntos de test. La innovación técnica central es la destilación del proceso de difusión a un solo paso combinada con un decodificador de baja latencia, lo que reduce el RTF (real-time factor) a 2,07e-4.

## Capacidades

- Separación de diálogo full-duplex: recupera dos pistas de hablante a partir de audio mono con solapamiento masivo de voz, incluyendo interrupciones y habla simultánea.
- Restauración conjunta: la separación incluye restauración de calidad de la señal (evaluada con DNSMOS y NISQA), no solo separación de fuentes.
- Salida a 24 kHz: las dos pistas separadas se generan a mayor resolución que la entrada de 16 kHz.
- Entrada de hasta 120 s por ventana de audio mono a 16 kHz.
- Multilingüe: verificado sobre 5 idiomas (alemán, español, francés, japonés y chino) además del inglés.
- Despliegue optimizado: backends Triton (sin compilación de motor) y TensorRT (construcción de motores desde ONNX).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de pipeline audio-to-audio.

## Casos de uso

- Preprocesamiento de datos para ASR en conversaciones reales: al reducir el WER del audio solapado de forma significativa (13,21 % a 10,80 % en OpenDialog), puede alimentar transcripciones más precisas de llamadas o podcasts con habla solapada.
- Análisis de call centers: separación de las dos voces de grabaciones telefónicas de hasta 120 s por ventana, con RTF de 2,07e-4 que permite procesar grandes volúmenes de grabaciones en tiempo casi instantáneo.
- Restauración de archivos de radio y podcasts: recuperación de las pistas individuales de entrevistas históricas o grabaciones de campo donde los interlocutores se solapan.
- Generación de datasets de investigación en diarización y separación de habla: las pistas separadas a 24 kHz con alta similitud de hablante (0,943) sirven como pseudo-ground-truth para entrenar otros sistemas.
- Subtitulado y localización multilingüe: soporte de de, es, fr, ja y zh con p-CER global de 16,52 %, útil para preparar diálogos doblados o subtitulados a partir de material original.
- Vigilancia y forense de audio: separación de interlocutores en grabaciones de una sola canal donde se necesita aislar cada voz para análisis posterior.
- Preparación de datos para TTS y modelos de diálogo: extracción de turnos de habla individuales para construir corpora conversacionales full-duplex.

## Benchmarks y rendimiento

Velocidad por ventana en H100 (batch 1), frente a DialogueSidon oficial (fp32 PyTorch, DPM-Solver++ 30 pasos + DAC):

| | DialogueSidon | FastDialogueSidon (Triton fp16) | Aceleración |
|---|---|---|---|
| OpenDialog, ventanas de 30 s | 0,53 s (RTF 0,0178) | 6,2 ms (RTF 2,07e-4) | 86x |
| CallFriend, ventanas de 120 s | 2,67 s (RTF 0,0222) | 24,8 ms (RTF 2,07e-4) | 107x |

OpenDialog (inglés, 100 sesiones de 30 s):

| | WER (%) ↓ | DNSMOS ↑ | NISQA ↑ |
|---|---|---|---|
| DialogueSidon | 13,21 | 3,327 | 3,757 |
| FastDialogueSidon (Triton fp16) | 10,80 | 3,303 | 3,491 |

CallFriend (5 idiomas × 20 sesiones × 120 s), p-CER (%):

| | de | es | fr | ja | zh | global |
|---|---|---|---|---|---|---|
| DialogueSidon | 11,56 | 15,39 | 21,02 | 16,36 | 20,93 | 16,54 |
| FastDialogueSidon (Triton fp16) | 11,47 | 16,89 | 21,25 | 14,49 | 19,46 | 16,52 |

CallFriend, métricas de calidad:

| | DNSMOS ↑ | NISQA ↑ | Similitud de hablante ↑ | Precisión VAD ↑ |
|---|---|---|---|---|
| DialogueSidon | 3,293 | 3,626 | 0,941 | 0,931 |
| FastDialogueSidon (Triton fp16) | 3,294 | 3,395 | 0,943 | 0,929 |

Nota: el protocolo evalúa la inteligibilidad con Qwen3-ASR-1.7B en lugar de Whisper large-v3, y las sesiones de CallFriend se recortan a 120 s (el artículo original usa 20 s).

## Requisitos de hardware

- Los benchmarks publicados se han medido en NVIDIA H100; no se han publicado cifras de VRAM mínimas ni resultados en otras GPUs.
- Dado que los pesos suman ≈ 1,73 GB en fp32 y la inferencia Triton funciona en fp16, es plausible que quepa en GPUs de consumo con 8-16 GB de VRAM, pero no hay datos oficiales que lo confirmen.
- Backends de despliegue: Triton (recomendado, sin necesidad de construir motor, instalación vía `pip install -e .` en el directorio `triton/`) y TensorRT (construcción de motores desde ONNX mediante `scripts/build_engines.py`).
- Latencia medida: 6,2 ms por ventana de 30 s y 24,8 ms por ventana de 120 s en H100 con Triton fp16 (RTF 2,07e-4); latencias por longitud para ambos backends disponibles en el repositorio de código.
- No se ha publicado soporte para llama.cpp, Ollama, vLLM o TGI; el despliegue se centra en Triton Inference Server y TensorRT.

## Comparativa con modelos similares

| | FastDialogueSidon | DialogueSidon | Modelos genéricos de separación (p. ej. Conv-TasNet, SepFormer) |
|---|---|---|---|
| Parametros | ≈ 433,4 M | no disponible | típicamente 5-100 M |
| Tarea | Separación full-duplex 2 hablantes + restauración | Separación full-duplex 2 hablantes + restauración | Separación de fuentes genérica |
| Latencia (120 s, H100) | 24,8 ms | 2,67 s | no disponible |
| Salida | 2 pistas a 24 kHz | 2 pistas a 24 kHz | típicamente misma tasa que la entrada |
| Idiomas verificados | en, ja, de, es, fr, zh | en, ja, de, es, fr, zh | no disponible |
| Licencia | Apache-2.0 | no disponible | varía |
| Disponibilidad | Pesos públicos + código Triton/TensorRT | Artículo SIGDIAL 2026 | múltiples implementaciones públicas |

FastDialogueSidon se posiciona como sustituto directo de DialogueSidon con calidad prácticamente equivalente (WER inferior en OpenDialog, p-CER global igual) y dos órdenes de magnitud menos de latencia, a cambio de una ligera pérdida en NISQA (3,395 frente a 3,626 en CallFriend).

## Limitaciones y advertencias

- Diseñado específicamente para diálogos de dos hablantes full-duplex; no es un sistema general de separación de N fuentes ni de eliminación de ruido arbitraria.
- Ventana máxima de 120 s por pasada; audios más largos requieren segmentación por parte del usuario.
- Ligera degradación en métricas de calidad perceptual (NISQA) respecto al modelo original, y en español y francés el p-CER es ligeramente peor (16,89 % y 21,25 % frente a 15,39 % y 21,02 %).
- La inteligibilidad se evaluó con Qwen3-ASR-1.7B en lugar de Whisper large-v3, por lo que los números no son directamente comparables con otros artículos que usan Whisper.
- El informe técnico específico de FastDialogueSidon aún no está publicado ("coming soon"), por lo que faltan detalles de entrenamiento.
- Sin datos sobre sesgos demográficos (género, acento, edad) de los hablantes.
- Riesgo de alucinación de contenido no presente en el audio, inherente a los modelos generativos de restauración de voz; no se han publicado evaluaciones específicas sobre este punto.
- La licencia Apache-2.0 no impone restricciones al uso comercial.
- Proyecto muy reciente (octubre de 2026) con 0 descargas registradas, por lo que tiene poca trazabilidad comunitaria y puede contener errores sin detectar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/higurashi-ai/FastDialogueSidon
- Repositorio de código (backends Triton y TensorRT): https://github.com/higurashi-ai/FastDialogueSidon
- Artículo de DialogueSidon (arXiv): https://arxiv.org/abs/2604.09344
- Informe técnico de FastDialogueSidon (Rikuto Kotoge): aún no publicado
