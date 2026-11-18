# FluidVoice-Labs/fluid-speech-pro

## Resumen

Fluid Speech Pro es un modelo de reconocimiento automático del habla (ASR) de 627 millones de parámetros desarrollado por FluidVoice-Labs, el equipo detrás del producto FluidVoice. Se construye sobre el checkpoint NVIDIA Parakeet TDT 0.6B v3 y conserva su cobertura de 25 lenguas europeas, con detección automática de idioma sin necesidad de indicar el idioma en el prompt. Su propósito es ofrecer transcripción precisa y muy rápida para dictado, subtitulado, notas de reunión y análisis de llamadas.

La arquitectura es un FastConformer-TDT (encoder FastConformer con decoder token-and-duration transducer), con un bloque adicional pequeño insertado entre el subsampling del encoder y su primera capa Conformer. El modelo se distribuye en cinco formatos (NeMo + Transformers, ONNX, MLX, GGUF y Core ML) para cubrir servidores con GPU NVIDIA, CPUs, Apple Silicon y aplicaciones Swift nativas.

El modelo se posiciona como el segundo mejor modelo abierto en el Open ASR Leaderboard con un WER medio de 6,06, y como el más preciso por debajo de 1B de parámetros. Incluye puntuación y capitalización, timestamps a nivel de palabra y de segmento (vía NeMo) y un modo "clean" opcional que elimina repeticiones y muletillas. La licencia CC BY 4.0 permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (encoder FastConformer + decoder token-and-duration transducer) |
| Parámetros totales | 627.057.286 (0,63B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio de entrada, no texto) |
| Tipos de cuantización | no disponible en la información proporcionada (existen variantes GGUF, ONNX, MLX y Core ML) |
| Idiomas soportados | 25 lenguas europeas: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (NeMo + Transformers); variantes ONNX, MLX, GGUF y Core ML en repos separados |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Parakeet TDT de NVIDIA: un encoder FastConformer (variante de Conformer con subsampling agresivo para reducir la secuencia de entrada) acoplado a un decoder TDT (token-and-duration transducer), que predice conjuntamente tokens y duraciones, lo que permite decodificación no autoregresiva por bloques y un throughput muy alto. Respecto al checkpoint base, FluidVoice-Labs añade un bloque pequeño entre el subsampling del encoder y la primera capa Conformer; es la única modificación estructural declarada.

El modelo se presenta como un fine-tune sobre `nvidia/parakeet-tdt-0.6b-v3` y `moondream/parakeet-ultra`. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La entrada es audio mono a 16 kHz en formatos como `.wav` o `.flac`; la salida es texto con puntuación y capitalización, con timestamps opcionales a nivel de palabra y segmento en la versión NeMo. La decodificación en Transformers es greedy y omite el bloque adicional, con resultados descritos como "casi idénticos" a los de NeMo.

## Capacidades

- Transcripción de voz a texto con puntuación y capitalización automáticas.
- Detección automática de idioma entre 25 lenguas europeas, sin prompt de idioma.
- Timestamps a nivel de palabra y de segmento (solo en la versión NeMo).
- Modo "clean" opcional: elimina repeticiones ("I I think") y muletillas ("um", "uh"); disponible en NeMo, ONNX y MLX.
- Robustez ante ruido: segundo mejor modelo abierto en el conjunto URGENT 2024 del leaderboard.
- Throughput muy alto: aproximadamente 3.700× tiempo real en una GPU (una hora de audio en torno a un segundo).
- Despliegue multiplataforma: GPU NVIDIA y servidores (NeMo/Transformers), CPU (ONNX con onnx-asr o sherpa-onnx), Apple Silicon (MLX con parakeet-mlx), C++ sin Python (GGUF con parakeet.cpp) y Neural Engine en apps Swift (Core ML con FluidAudio).
- No se documentan capacidades de tool calling, agentes, visión ni audio generativo; es un modelo exclusivamente ASR.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio y móvil: el modelo transcribe audio de 16 kHz con puntuación y capitalización, y el modo clean elimina muletillas para producir texto listo para publicar.
- Generación de subtítulos y captions: los timestamps a nivel de palabra y segmento de la versión NeMo permiten alinear subtítulos con precisión en pipelines de vídeo.
- Notas de reunión automáticas: con ~3.700× tiempo real, una reunión de una hora se transcribe en aproximadamente un segundo en una sola GPU, lo que hace viable el procesamiento por lotes de archivos largos.
- Análisis de llamadas y atención al cliente: la detección automática de idioma entre 25 lenguas europeas permite enrutar y analizar conversaciones multilingües sin preprocesar el idioma.
- Servicios de transcripción en CPU: la variante ONNX con onnx-asr o sherpa-onnx permite desplegar transcripción en servidores sin GPU, útil para volúmenes moderados o entornos con restricciones de hardware.
- Aplicaciones nativas en Apple: la variante Core ML con FluidAudio ejecuta la inferencia en el Neural Engine para dictado y transcripción local en apps Swift, sin depender de la nube.
- Investigación en ASR: al ser el modelo abierto más preciso por debajo de 1B de parámetros según el leaderboard, sirve como baseline reproducible y como punto de partida para fine-tuning en dominios específicos bajo CC BY 4.0.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Open ASR Leaderboard (WER medio) | 6,06 | Segundo mejor modelo abierto del leaderboard |
| URGENT 2024 (WER, habla con ruido) | 9,83 | Segundo mejor modelo abierto en el conjunto ruidoso |
| Throughput | ~3.700× tiempo real en una GPU | Una hora de audio en torno a un segundo |
| Comparación bajo 1B | 10% menos errores que el siguiente modelo abierto <1B | Datos declarados por el autor |

No se han publicado en la información disponible resultados desglosados por dataset (por ejemplo, LibriSpeech, Common Voice o FLEURS) ni comparativas numéricas directas con modelos concretos más allá de las afirmaciones agregadas del leaderboard.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,63B de parámetros, los pesos en precisión completa ocupan del orden de 1,2-2,5 GB, y las variantes cuantizadas reducen esa cifra, pero la model card no publica cifras de VRAM.
- GPU recomendadas: NVIDIA GPUs para la versión NeMo/Transformers (la referencia); el autor cita ejecución a ~3.700× tiempo real "en una GPU" sin especificar modelo.
- GPU de consumo: no se confirma qué GPUs consumer son suficientes; por tamaño de parámetros es plausible en RTX 4090 y similares, pero no hay dato oficial en la información proporcionada.
- Apple Silicon: soporte vía MLX (parakeet-mlx) y Core ML (Neural Engine, FluidAudio).
- CPU: soporte vía ONNX (onnx-asr, sherpa-onnx) y GGUF (parakeet.cpp, CPU o GPU, sin Python).
- Opciones de despliegue: NeMo (`nemo_toolkit[asr]`), Transformers 5.22 o superior, ONNX Runtime, MLX, parakeet.cpp y Core ML.
- Latencia y throughput: ~3.700× tiempo real en una GPU según el autor; no se detallan latencias por fragmento ni throughput en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Fluid Speech Pro | 0,63B | 25 europeas | CC BY 4.0 | #2 abierto en Open ASR Leaderboard (WER 6,06); 5 formatos de despliegue |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6B | 25 europeas | no disponible en la información | Modelo base; Fluid Speech Pro declara mejoras sobre él |
| moondream/parakeet-ultra | no disponible | no disponible | no disponible | Modelo base declarado; sin datos de rendimiento en la información |
| Resto de modelos abiertos del Open ASR Leaderboard | variable | variable | variable | El autor afirma que Fluid Speech Pro es el más preciso por debajo de 1B y el segundo global |

No se dispone de cifras comparativas detalladas (WER por modelo) en la información proporcionada más allá de las posiciones en el leaderboard.

## Limitaciones y advertencias

- Cobertura limitada a 25 lenguas europeas; no se documenta soporte de otras lenguas (asiáticas, africanas, etc.).
- No hay información publicada sobre sesgos por acento, dialecto, edad o género; el rendimiento puede degradarse en variedades no representadas en el entrenamiento.
- Riesgo de alucinación y errores de transcripción, especialmente en audio ruidoso, solapamiento de hablantes o dominio muy específico; el WER de 9,83 en URGENT 2024 indica margen de error en condiciones ruidosas.
- El modo clean altera el texto eliminando repeticiones y muletillas: no debe usarse cuando se requiere un registro literal (por ejemplo, transcripciones forenses o legales).
- La versión Transformers omite el bloque adicional del modelo y decodifica de forma greedy, por lo que los resultados pueden diferir ligeramente de la referencia NeMo.
- Los timestamps solo están disponibles en la versión NeMo; GGUF no soporta modo clean y Core ML aún no lo implementa.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar al autor y conservar el aviso de licencia.
- No se documentan requisitos de VRAM ni rendimiento en CPU, lo que dificulta el dimensionamiento previo de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- Variante ONNX: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-onnx
- Variante MLX: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-mlx
- Variante GGUF: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-gguf
- Variante Core ML: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-coreml
- Modelo base NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- FluidVoice (producto del equipo): https://fluidvoice.com
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
