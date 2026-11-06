# Nocti-Dev/parakeet-tdt-0.6b-v3-mlx

## Resumen

`Nocti-Dev/parakeet-tdt-0.6b-v3-mlx` es una conversión a formato MLX del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA. El modelo original emplea una arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer), un esquema que predice de forma conjunta el token de salida y su duración, lo que reduce el número de pasos de decodificación frente a los transductores convencionales. La conversión la ha realizado el usuario Nocti-Dev mediante la herramienta Prism (receta `parakeet-nemo` v1) y está pensada para ejecutarse sobre el framework MLX de Apple, es decir, sobre silicio Apple (M1/M2/M3/M4) en lugar de CUDA.

El repositorio es autocontenido: incluye pesos en `safetensors`, configuración y tokenizador, de modo que puede cargarse sin conexión. Los pesos están en `float16` y sin cuantización, con un total de 627.052.166 parámetros (aproximadamente 1,25 GB en disco). La licencia es CC-BY-4.0, heredada del modelo original de NVIDIA.

Su relevancia es acotada pero concreta: cubre el hueco de quienes quieren ejecutar un ASR de calidad media (0,6B) en Mac sin depender de CUDA ni de servicios en la nube. No obstante, el repositorio no documenta idiomas soportados, benchmarks propios ni detalles de entrenamiento más allá de la procedencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer), según el modelo base `nvidia/parakeet-tdt-0.6b-v3` |
| Parámetros totales | 627.052.166 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ninguna en este repo (`float16`); el modelo base podría admitir otras, no documentado aquí |
| Idiomas soportados | no disponibles en la información proporcionada |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `safetensors` (MLX), más `config.json`, `tokenizer.model`, `tokenizer.vocab`, `vocab.txt` |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint `nvidia/parakeet-tdt-0.6b-v3` en el commit `541d1f99c6b0c3cd0b11a95167540bb8edefd82b`. La arquitectura subyacente es la de Parakeet: un encoder FastConformer (variante de Conformer con downsampling agresivo en las primeras capas) acoplado a un decodificador TDT. El decodificador TDT predice simultáneamente el token y una duración discreta, lo que permite avanzar varios frames por paso y reduce la latencia de decodificación en comparación con un RNN-T clásico.

La conversión se ha realizado con Prism (receta `parakeet-nemo` v1, worker 0.1.0, Python 3.14.10, MLX 0.32.4, NumPy 2.5.4, PyTorch 2.14.1, Transformers 5.21.0) y los pesos resultantes están en `float16` sin cuantización. No se documenta en la información disponible el volumen de datos de entrenamiento, la composición del corpus, ni si el modelo original pasó por etapas de RLHF o ajuste fino supervisado más allá de lo que indique la model card de NVIDIA.

La validación incluida es una prueba de humo (*smoke test*) sobre un clip corto en inglés: la transcripción del modelo convertido coincide con la del modelo original y con el guion, con una tasa de error de palabras (WER) de 0,00 en los tres pares comparados. Es una comprobación de equivalencia funcional, no una evaluación de calidad ASR en condiciones reales.

## Capacidades

- Reconocimiento automático del habla (*automatic-speech-recognition*) sobre audio en inglés, según la única prueba documentada.
- Decodificación TDT, que combina predicción de token y de duración en un solo paso.
- Modelo autocontenido: pesos, configuración y tokenizador en el mismo repositorio, lo que permite carga offline.
- Ejecución sobre MLX (Apple Silicon), sin dependencia de CUDA.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del ASR ni modo *thinking*. Es un modelo puramente ASR.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción local en Mac: ejecutar el modelo con MLX sobre un Mac con Apple Silicon para transcribir reuniones o notas de voz sin enviar audio a servicios externos, aprovechando que el repositorio es autocontenido y funciona offline.
- Subtitulado de vídeo en flujos de edición en macOS: integrar el modelo en un script Python con MLX para generar transcripciones con marcas de tiempo y alimentar herramientas de subtitulado, evitando la latencia de red.
- Prototipado de asistentes de voz en el escritorio: usar el modelo como componente ASR en una aplicación macOS nativa o en Swift (la prueba de humo se hizo con `mlx-audio-swift`), combinándolo con un LLM local para diálogo por voz.
- Investigación en ASR comparativo: emplear esta conversión como referencia para medir el impacto de MLX frente a PyTorch/CUDA en términos de WER y latencia sobre el mismo checkpoint de NVIDIA.
- Pipeline de accesibilidad: transcribir audio a texto en tiempo casi real en un portátil Apple para generar subtítulos en directo en aplicaciones de videollamada, con la ventaja de no requerir GPU dedicada.
- Evaluación de despliegue en edge: probar el modelo en un Mac Mini o MacBook como sustituto de un servidor con GPU para cargas de transcripción por lotes de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica aportada es la prueba de humo de equivalencia:

| Métrica | Valor |
|---|---:|
| WER convertido vs. no convertido (veredicto) | 0,00 |
| WER convertido vs. guion | 0,00 |
| WER no convertido vs. guion | 0,00 |

No hay datos de MMLU, HumanEval, GSM8K ni de WER sobre conjuntos estándar (LibriSpeech, Common Voice, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al estar en `float16` y con 627 M de parámetros, los pesos ocupan aproximadamente 1,25 GB; la memoria unificada necesaria para inferencia con buffers intermedios se sitúa típicamente en el rango de 2 a 4 GB, aunque no se documenta una cifra oficial.
- GPU recomendadas: al ser una conversión MLX, el objetivo es Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensada para A100, H100 ni RTX 4090, que requieren CUDA y el checkpoint original de NVIDIA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; el requisito es memoria unificada suficiente (un Mac con 8 GB debería poder cargarlo, aunque no hay cifra oficial).
- Opciones de despliegue: MLX (librería `mlx`), `mlx-audio-swift` (usado en la prueba de humo) y scripts Python propios. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Nocti-Dev/parakeet-tdt-0.6b-v3-mlx` (este) | 627 M | no disponible | MLX, `safetensors` fp16 | CC-BY-4.0 | Hugging Face, 0 descargas |
| `nvidia/parakeet-tdt-0.6b-v3` (base) | ~0,6 B | no disponible | NeMo / PyTorch | CC-BY-4.0 | Hugging Face (NVIDIA) |
| Whisper large-v3 (referencia ASR) | ~1,55 B | 30 s de audio por ventana | PyTorch, GGUF, MLX, etc. | MIT (según variante) | Amplia |
| Whisper small (referencia ASR ligera) | ~244 M | 30 s de audio por ventana | PyTorch, GGUF, MLX, etc. | MIT (según variante) | Amplia |

La comparación con Whisper es orientativa por categoría (ASR); no se dispone de métricas comparativas de WER en la información proporcionada. La ventaja principal de este repositorio frente al checkpoint de NVIDIA es la ejecución nativa en Apple Silicon; su desventaja es la falta de ecosistema de despliegue (no hay Ollama, llama.cpp ni vLLM documentados) y la ausencia de benchmarks públicos.

## Limitaciones y advertencias

- Solo se ha validado con un clip corto en inglés; no hay evidencia de comportamiento en otros idiomas ni en audio con ruido, acentos o solapamientos.
- No se documentan sesgos conocidos, pero al ser una conversión de un modelo entrenado por NVIDIA, hereda los sesgos del corpus original, que no se detalla.
- Riesgo de alucinación: en ASR, esto se traduce en transcripciones plausibles pero incorrectas en segmentos de audio ambiguo o silencioso; no se han publicado tasas de error en condiciones reales.
- Limitaciones de contexto: no se especifica la ventana máxima de audio ni el comportamiento con grabaciones largas; habrá que trocear el audio manualmente.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar tanto al autor de la conversión como a NVIDIA como origen del modelo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-03), por lo que no hay validación comunitaria ni reportes de fallos.
- Depende del ecosistema MLX: no es portable a CUDA sin volver al checkpoint original de NVIDIA.
- El `config.json` es inusualmente grande (244 KB) para un modelo de 0,6 B; conviene revisarlo antes de integrarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nocti-Dev/parakeet-tdt-0.6b-v3-mlx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Commit del modelo base usado en la conversión: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/tree/541d1f99c6b0c3cd0b11a95167540bb8edefd82b
- Framework MLX: https://github.com/ml-explore/mlx
- `mlx-audio-swift` (usado en la prueba de humo): https://github.com/Nocti-Dev/mlx-audio-swift (referencia citada en la model card como `mlx-audio-swift@dbe5eaa`)
