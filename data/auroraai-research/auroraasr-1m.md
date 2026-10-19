# AuroraAI-Research/AuroraASR-1M

## Resumen

AuroraASR-1M es un reconocedor de voz (ASR) en inglés desarrollado por AuroraAI-Research, publicado en HuggingFace con licencia Apache 2.0. Se trata de un modelo deliberadamente minúsculo: 949.073 parámetros en total (menos de 1 M), construido sobre una arquitectura Conformer-CTC con compartición de pesos. Cuatro bloques Conformer-lite únicos se aplican dos veces cada uno, seguidos de una cabeza CTC sobre un vocabulario BPE de 256 piezas. La entrada es audio mono a 16 kHz y la decodificación es CTC voraz, sin modelo de lenguaje externo.

El problema que aborda es el de la transcripción de voz en entornos con recursos muy limitados: el modelo pesa 3,81 MB en FP32, 1,91 MB en FP16 y 1,06 MB en INT8, y funciona sin runtime especializado. Está entrenado exclusivamente con LibriSpeech (960 h) durante 379 épocas, unas 10 horas en una RTX PRO 6000, y solo soporta inglés. No es un modelo de propósito general ni compite en calidad con Whisper: su interés reside en la relación entre tamaño, velocidad (RTF de 0,0007 en GPU y 0,0023 en un único núcleo de CPU) y un WER de 11,43 % en test-clean y 26,50 % en test-other.

Es relevante ahora como referencia reproducible de hasta dónde se puede llevar la compresión de un sistema CTC (weight sharing, vocabulario reducido, entrenamiento con Muon + AdamW y EMA) y como componente práctico para despliegues en dispositivos embebidos, preprocesado de audio o experimentación académica con presupuestos de cómputo mínimos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer-CTC "lite" con compartición de pesos: stem convolucional con subsampling temporal 4x + 4 bloques Conformer únicos aplicados dos veces cada uno (LayerNorm separada por pasada), anchura 128, 4 cabezas de atención con RoPE, feed-forward de 384, convolución depthwise de kernel 15 |
| Parámetros totales | 949.073 (≈ 0,95 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como ventana de texto; el modelo se entrenó con utterances de entre 1 y 16 s de audio |
| Tipos de cuantización | FP32 (raíz del repo, 3,81 MB), FP16 (`subfolder="fp16"`, 1,91 MB), INT8 weight-only con escalas por canal de salida (`subfolder="int8"`, 1,06 MB) |
| Idiomas soportados | Inglés (`en`) exclusivamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, requiere `trust_remote_code=True`); el tamaño reportado del repo es 0.0 GB |

Otros datos técnicos: vocabulario SentencePiece BPE de 256 piezas más token blank (257 clases de salida); características de entrada consistentes en espectrograma log-mel de 80 bins (16 kHz, ventana de 25 ms, hop de 10 ms, FFT de 512 puntos, 20 Hz–8 kHz) con normalización media/varianza por utterance y por bin.

## Arquitectura y entrenamiento

La arquitectura es un Conformer-CTC compacto. Un stem convolucional aplica un subsampling temporal de factor 4; a continuación se apilan cuatro bloques Conformer-lite únicos que se reutilizan dos veces cada uno, con LayerNorm distintas por pasada (el mecanismo de compartición de pesos que permite mantener el recuento por debajo del millón de parámetros). Cada bloque usa anchura 128, 4 cabezas de atención con embeddings posicionales rotatorios, feed-forward de dimensión 384 y convolución depthwise de kernel 15. La cabeza de salida es CTC sobre 257 clases.

El entrenamiento usó únicamente LibriSpeech 960 h (`train-clean-100`, `train-clean-360`, `train-other-500`), sin datos adicionales de audio ni de texto. Se descartaron utterances de menos de 1 s o más de 16 s, así como aquellas cuyo recuento de tokens superase un cuarto de sus frames de características. La selección de checkpoint se hizo con `dev-clean`; `test-clean` y `test-other` se reservaron para la evaluación final. La función de pérdida combina CTC en la capa final (peso 0,7) con una CTC auxiliar intermedia tras el segundo bloque único (peso 0,3); la cabeza auxiliar reutiliza la LayerNorm final y la capa de salida, por lo que no añade parámetros y se descarta en inferencia. La pérdida se normaliza por el número de tokens objetivo.

La optimización es destacable por el uso de Muon para las matrices de pesos 2-D de los bloques del encoder y la proyección del stem (lr 0,03, momentum 0,95 Nesterov, 5 pasos de Newton-Schulz, weight decay 0,01), con AdamW para el resto (lr 5e-3, betas 0,9/0,98, weight decay 0,01 solo en matrices). El schedule es warmup lineal de 100 pasos y decaimiento coseno hasta el 5 % del pico, con clipping de norma global 5,0, batches dinámicos de 2.400 s de audio con bucketing por longitud y padding a múltiplos de 64 frames, currículum SortaGrad en la primera época, autocast en bfloat16, matmuls TF32, `torch.compile`, EMA de pesos (decay 0,9995) y SpecAugment desde la época 3 (2 máscaras de frecuencia de hasta 8 bins y 3 máscaras temporales de hasta el 4 % del utterance cada una), sin dropout. El número total de pasos se fijó a partir de una calibración de 200 pasos para que el decaimiento coseno terminase dentro del presupuesto; el resultado fueron 379 épocas en unas 10 horas sobre una RTX PRO 6000.

## Capacidades

- Reconocimiento de voz en inglés a partir de audio mono de 16 kHz, con salida de texto en minúsculas y sin puntuación.
- Decodificación CTC voraz integrada en el método `transcribe()`, sin necesidad de modelo de lenguaje externo ni de beam search.
- Tokenización BPE de 256 piezas que cubre el alfabeto a–z, el apóstrofo y el espacio.
- Inferencia en FP32, FP16 e INT8 con WER descrito como prácticamente sin pérdida, incluida la cuantización INT8 weight-only.
- Ejecución en CPU sin runtimes especializados: RTF de 0,0023 (436x tiempo real) con un solo hilo fijado a un núcleo.
- Ejecución en GPU con RTF de 0,0007 (1362x tiempo real) en una NVIDIA RTX PRO 6000 Blackwell Server Edition, en ambos casos con pipeline extremo a extremo (extracción de log-mel y decodificación CTC incluidas).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio generation ni modo "thinking"; es un modelo puramente acústico-to-texto.
- No se documenta salida de timestamps a nivel de palabra, diarización de hablantes ni detección de idioma.

## Casos de uso

- Transcripción offline en dispositivos embebidos: con 1,06 MB en INT8 y 0,0023 de RTF en un solo núcleo de CPU, el modelo cabe en Raspberry Pi, routers o móviles y permite dictado local sin conexión ni GPU.
- Preprocesado y filtrado de audio a gran escala: al procesar 436x tiempo real por núcleo, un único servidor puede transcribir horas de audio en inglés para indexación, búsqueda o clasificación previa antes de pasar un modelo mayor.
- Subtitulado en tiempo real de bajo coste: el RTF en CPU deja margen sobrado para streaming por fragmentos en un servicio con muchos flujos concurrentes y sin acelerador.
- Baseline de investigación en ASR eficiente: sirve como referencia reproducible (semilla 0, receta completa publicada) para estudiar compartición de pesos, Muon frente a AdamW o pérdidas CTC intermedias.
- Comandos de voz y keyword spotting en inglés: con un vocabulario restringido y audio limpio de estudio, el modelo puede cerrar el bucle de control en aplicaciones de domótica o interfaces manos libres.
- Evaluación y testing de pipelines CTC: su tamaño mínimo permite ejecutar tests de integración completos en CI sin GPU, verificando tokenizador, feature extractor y decodificación.
- Adaptación a dominio con recursos mínimos: al ser Apache 2.0 y tener menos de 1 M de parámetros, el fine-tuning sobre un corpus pequeño específico (por ejemplo, lectura de informes) es viable en una sola GPU consumer.

## Benchmarks y rendimiento

WER (%) en los conjuntos de test estándar de LibriSpeech, con decodificación CTC voraz y sin modelo de lenguaje externo. Las cifras de los competidores proceden de sus propias model cards o papers, según indica el autor.

| Modelo | Parámetros | test-clean | test-other |
|---|---|---|---|
| AuroraASR-1M | 950K | 11,43 | 26,50 |
| Femto-ASR | 2,39M | 10,95 | 25,36 |
| Citrinet-256 CTC (NVIDIA) | 10M | 3,8 | 9,8 |
| Moonshine Tiny | 27M | 4,58 | no disponible |
| Whisper Tiny (solo inglés) | 39M | 5,6 | 14,6 |
| Whisper Tiny (multilingüe) | 39M | 7,6 | 16,9 |

Velocidad (FP32, pipeline extremo a extremo, batch size 1, 100 utterances de test-clean, 13,3 minutos de audio):

| Dispositivo | RTF (extremo a extremo) | Veces tiempo real |
|---|---|---|
| GPU (NVIDIA RTX PRO 6000 Blackwell Server Edition) | 0,0007 | 1362x |
| CPU (1 vCPU, un solo hilo fijado a un núcleo) | 0,0023 | 436x |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada oficialmente. Los pesos ocupan 3,81 MB en FP32, 1,91 MB en FP16 y 1,06 MB en INT8, por lo que el consumo está dominado por el runtime de PyTorch y las activaciones, no por el modelo.
- GPU recomendadas: cualquier GPU con soporte de PyTorch sirve; el autor solo reporta mediciones en una NVIDIA RTX PRO 6000 Blackwell Server Edition. No hay datos publicados para A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU consumer: sí, en cualquier tarjeta con suficiente memoria para el proceso de PyTorch (muy por debajo de 1 GB de pesos en todas las precisiones). También funciona en CPU pura.
- Opciones de despliegue: únicamente `transformers` con `AutoModelForCTC` y `trust_remote_code=True`, más `AutoFeatureExtractor`, con dependencias de `torch`, `transformers` y `sentencepiece`. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, ni conversión a GGUF.
- Latencia y throughput: RTF de 0,0007 en GPU (1362x tiempo real) y 0,0023 en CPU de un solo hilo (436x tiempo real), con batch size 1 y pipeline completo. No se publican cifras de throughput agregado con batches mayores.
- Nota sobre INT8: reduce tamaño de descarga y memoria, pero según el autor no acelera la aritmética.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | WER test-clean | WER test-other | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AuroraASR-1M | 950K | utterances de 1–16 s, 16 kHz | 11,43 | 26,50 | Apache 2.0 | HuggingFace, requiere `trust_remote_code` |
| Femto-ASR | 2,39M | no disponible en la información proporcionada | 10,95 | 25,36 | no disponible | HuggingFace |
| Citrinet-256 CTC | 10M | no disponible en la información proporcionada | 3,8 | 9,8 | no disponible | HuggingFace (NVIDIA) |
| Whisper Tiny (en) | 39M | ventana de 30 s, multilingüe en la variante base | 5,6 | 14,6 | no disponible en la información proporcionada | HuggingFace (OpenAI) |

Lectura de la comparativa: AuroraASR-1M es el más pequeño de la tabla por un factor de 2,5 frente a Femto-ASR, 10 frente a Citrinet-256 y 41 frente a Whisper Tiny, pero paga ese tamaño con un WER entre 2 y 3 veces peor que Citrinet-256 y Whisper Tiny en test-other. Frente a Femto-ASR, que es su competidor directo en la categoría sub-3M, pierde en ambas métricas de WER (0,48 y 1,14 puntos) a cambio de ser un 60 % más pequeño.

## Limitaciones y advertencias

- Solo inglés. No se ha entrenado ni evaluado en otros idiomas; el rendimiento en habla no inglesa será degradado.
- Sin puntuación ni mayúsculas: las transcripciones se limitan a a–z, apóstrofo y espacio, lo que exige un post-proceso de restaurción de formato si se necesita texto legible.
- WER elevado en la práctica: 11,43 % en test-clean y 26,50 % en test-other, muy por encima de modelos de 10–40 M de parámetros. Un 26,5 % de error implica aproximadamente una palabra mal por cada cuatro en audio difícil.
- Dominio de entrenamiento estrecho: LibriSpeech son audiolibros de dominio público leídos en condiciones acústicas controladas. Es esperable un deterioro notable con ruido de fondo, micrófonos lejanos, acentos no representados, habla espontánea o solapamiento de hablantes.
- Duración de audio: el modelo se entrenó con utterances de 1 a 16 s; no hay garantía de comportamiento correcto fuera de ese rango sin segmentación previa.
- Decodificación voraz sin modelo de lenguaje: no se documenta soporte de beam search, shallow fusion ni corrección con LM, lo que deja parte del WER sobre la mesa.
- Riesgo de alucinación y de salidas plausibles pero incorrectas: como todo CTC sobre vocabulario subword, puede producir secuencias gramaticales en inglés que no corresponden al audio, especialmente en tramos ruidosos o en silencio.
- `trust_remote_code=True` es obligatorio: implica ejecutar código Python arbitrario del repositorio. Es un riesgo de seguridad que debe evaluarse (y auditarse o fijarse a un commit concreto) antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia, sin garantías. Al ser un modelo entrenado sobre LibriSpeech, conviene revisar los términos del dataset original si se redistribuye.
- Validación comunitaria escasa: 42 descargas y 24 likes en el momento de la ficha, con el repositorio creado y actualizado el mismo día (18 de octubre de 2026). No hay evidencia independiente de reproducibilidad.
- No se documentan evaluaciones de sesgo por género, acento o edad; el vocabulario restringido y el corpus de audiolibros pueden introducir sesgos de dominio y de estilo de habla.
- No se publican cifras de VRAM ni de latencia para hardware habitual de producción (A100, H100, RTX 4090), solo para una RTX PRO 6000 Blackwell y una CPU monohilo.

## Enlaces

- [Modelo en HuggingFace: AuroraAI-Research/AuroraASR-1M](https://huggingface.co/AuroraAI-Research/AuroraASR-1M)
- [Femto-ASR (comparativa)](https://huggingface.co/igorktech/femto-asr)
- [NVIDIA Citrinet-256 CTC LibriSpeech (comparativa)](https://huggingface.co/nvidia/stt_en_citrinet_256_ls)
- [Moonshine Tiny (comparativa)](https://huggingface.co/UsefulSensors/moonshine-tiny)
- [Whisper Tiny, solo inglés (comparativa)](https://huggingface.co/openai/whisper-tiny.en)
- [Whisper Tiny, multilingüe (comparativa)](https://huggingface.co/openai/whisper-tiny)
- [Dataset LibriSpeech ASR en HuggingFace](https://huggingface.co/datasets/librispeech_asr)
