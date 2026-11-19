# LibraxisAI/whisper-medium-pl-v2-mlx-q8

## Resumen

`whisper-medium-pl-v2-mlx-q8` es un checkpoint de reconocimiento automático de voz (ASR) en polaco, derivado por LibraxisAI a partir de `bardsai/whisper-medium-pl-v2`, que a su vez es un fine-tune de `openai/whisper-medium` sobre Common Voice 11 y FLEURS en polaco. El modelo conserva la arquitectura Whisper original (24 capas de encoder, 24 de decoder, `d_model` de 1024, 80 bins mel y vocabulario de 51.865 tokens) pero redistribuye los pesos en formato MLX con cuantización afín de 8 bits, reduciendo el bundle de 3,06 GB en FP32 PyTorch a 861,8 MB.

La relevancia de esta ficha es acotada y muy específica: no introduce mejoras de calidad sobre el modelo base, sino un empaquetado optimizado para inferencia local en Apple Silicon (M1/M2/M3/M4) mediante Metal, pensado para dictado y transcripción por lotes en máquinas de sobremesa o portátiles con memoria unificada limitada. Está validado con `mlx_whisper`, `LibraxisAI/mlx-batch-server` y `vetcoders/x9bus`.

No es un modelo multilingüe ni un ASR de propósito general: el fine-tune upstream está especializado en polaco y adapta fonéticamente palabras extranjeras a la ortografía polaca, lo que lo hace inadecuado para transcripción de inglés sin adaptación. La licencia es Apache 2.0 y la inferencia alojada en Hugging Face está desactivada (`inference: false`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer), `d_model: 1024`, `n_audio_layer: 24`, `n_text_layer: 24`, `n_mels: 80`, `n_vocab: 51865` |
| Parametros totales | no disponible (arquitectura Whisper medium; recuento exacto no publicado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s; no se indica explícitamente en la model card) |
| Tipos de cuantizacion | MLX afín de 8 bits (`bits: 8`, `group_size: 32`) sobre 385 matrices lineales y de embedding; `encoder.conv1`, `encoder.conv2`, `decoder.positional_embedding` y todos los `LayerNorm` en FP16; `alignment_heads` en I64 |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (`weights.safetensors`, 861.792.281 bytes); incluye `tokenizer.json`, `mel_filters.npz` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium estándar: un encoder transformer de 24 capas que procesa espectrogramas mel de 80 bins y un decoder autorregresivo de 24 capas con vocabulario de 51.865 tokens. El modelo upstream `bardsai/whisper-medium-pl-v2` fue afinado sobre Common Voice 11 y FLEURS en polaco partiendo de `openai/whisper-medium`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; se trata de un fine-tune supervisado clásico de ASR.

La contribución técnica de este repositorio es exclusivamente la conversión a MLX: cuantización afín por grupos (`bits = 8`, `group_size = 32`) aplicada a las 385 proyecciones lineales y de embedding del vocabulario, manteniendo en FP16 las convoluciones de entrada del encoder, el embedding posicional del decoder y todas las capas `LayerNorm` para preservar estabilidad numérica. El resultado es un bundle autocontenido de 861,8 MB listo para `mlx_whisper`, `mlx-batch-server` y `x9bus`. Existe un checkpoint compañero de 4 bits (`LibraxisAI/whisper-medium-pl-v2-mlx-GPTQ-Hessian-q4`, 482,9 MB) para presupuestos de memoria unificada más ajustados.

## Capacidades

- Transcripción de voz a texto en polaco (`automatic-speech-recognition`, `language="pl"`).
- Dictado local de baja latencia en Apple Silicon con residencia compacta en memoria unificada (861,8 MB de pesos).
- Transcripción por lotes de audio mediante `mlx-batch-server` y la CLI `x9stt` de `x9bus`.
- Manejo de habla polaca continua y de numerales aislados con buena estabilidad (véase la sección de evaluación).
- Adaptación fonética de palabras extranjeras a la ortografía polaca (comportamiento del fine-tune, no una capacidad multilingüe real).
- No soporta tool calling, function calling, agentes, visión, audio generation ni modo de razonamiento; es un modelo ASR puro.
- No soporta otros idiomas distintos del polaco de forma fiable.

## Casos de uso

- Dictado de escritorio en macOS: el modelo se integra vía `mlx_whisper` o `x9stt` para convertir voz en texto en local, con 861,8 MB de pesos que caben holgadamente en la memoria unificada de un M1 de 8 GB junto al resto del sistema.
- Transcripción por lotes de reuniones o entrevistas en polaco: `mlx-batch-server` permite procesar colas de ficheros de audio en un Mac Studio o MacBook Pro sin depender de servicios en la nube.
- Voice-to-agent en pipelines locales: la baja latencia del backend Metal y el tamaño reducido permiten encadenar ASR y un LLM local en la misma máquina sin swapping agresivo.
- Evaluación comparativa de ASR polaco: sirve como referencia cuantizada frente a checkpoints Whisper multilingües o al modelo base en FP32, con la ventaja de que el formato MLX reduce el coste de carga.
- Subtitulado offline de contenido en polaco: la transcripción con marcas temporales de Whisper (vía `mlx_whisper`) permite generar subtítulos sin conexión en equipos de desarrollo con Apple Silicon.
- Prototipado e investigación en ASR de bajo资源: investigadores que necesiten ejecutar experimentos de ASR polaco en portátiles sin GPU dedicada pueden usar este checkpoint como baseline cuantizado reproducible.
- Despliegue en entornos con restricciones de privacidad: al ser inferencia local y autoalojada, el audio no sale del dispositivo, lo que encaja en flujos con datos sensibles que no pueden enviarse a APIs externas.

## Benchmarks y rendimiento

Evaluación publicada por el autor en la model card, medida con `x9stt` (backend Metal nativo, decodificación greedy, `language="pl"`, VAD Silero activado, sin solapamiento con el audio de calibración de GPTQ):

| Checkpoint | Pesos | Capas decoder | Numerales aislados (5× "pięć", logprob medio) | Fragmento de habla polaca continua | Frase mixta PL/EN ("…z computer use") |
|---|---:|---:|---|---|---|
| `LibraxisAI/whisper-large-v3-turbo-mlx-q8` | 913,7 MB | 4 | `Pięć pięć pięć pięć pięć` (-0,22) | `Zastanawiamy, czy już się udało temu modelowi wejść w rolę…` (-0,31) | `…pracuje z computer use.` |
| **`LibraxisAI/whisper-medium-pl-v2-mlx-q8`** | **861,8 MB** | **24** | **`pięć, pięć, pięć, pięć, pięć, pięć.` (-0,13)** | **`Mamy zasadę, jakiejś, by już się udało temu modelu wejść w rolę i jest …` (-0,19)** | **`coś robić nie tak, bo przecież nie jest to pierwsza ap…`** |
| `LibraxisAI/whisper-medium-pl-v2-mlx-GPTQ-Hessian-q4` | 482,9 MB | 24 | `pięć, pięć, pięć, pięć, pięć, pięć.` (-0,13) | `Zasada ja nie czy już się udało temu modelowi wejść w rolę i jest tutaj z…` (-0,20) | `Coś robić nie tak, bo przecież nie jest to pierwsza ap…` |

Benchmark upstream del modelo base (`bardsai/whisper-medium-pl-v2`) en Mozilla Common Voice 11.0, split de test en polaco: WER = 8,71 %, CER = 2,41 %. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 861,8 MB solo para los pesos; con overhead de activaciones y buffers de audio, el consumo en inferencia se sitúa por encima de 1 GB, aunque no se publica una cifra exacta.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4) con backend Metal; no hay soporte probado en NVIDIA, AMD ni CPU x86.
- Cabe en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada; el checkpoint de 4 bits (482,9 MB) reduce aún más la huella.
- Opciones de despliegue: `mlx_whisper` (PyPI), `LibraxisAI/mlx-batch-server` y `vetcoders/x9bus` (`x9stt`, `codescribe-whisper-validate`). No es compatible con `faster-whisper`/CTranslate2 ni con `whisper.cpp`/GGML, que usan layouts de tensores distintos.
- Latencia y throughput: no disponibles en la información proporcionada; la model card solo indica que el backend Metal es nativo y la decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `LibraxisAI/whisper-medium-pl-v2-mlx-q8` | Whisper medium (no publicado) | Ventana de audio de 30 s (Whisper) | pl | Apache 2.0 | MLX safetensors Q8 | HF, inferencia local Apple Silicon |
| `LibraxisAI/whisper-medium-pl-v2-mlx-GPTQ-Hessian-q4` | Whisper medium (no publicado) | Ventana de audio de 30 s | pl | Apache 2.0 | MLX safetensors Q4 | HF, 482,9 MB |
| `bardsai/whisper-medium-pl-v2` (upstream) | Whisper medium (no publicado) | Ventana de audio de 30 s | pl | Apache 2.0 (según base) | PyTorch FP32 (3,06 GB) | HF |
| `LibraxisAI/whisper-large-v3-turbo-mlx-q8` | Whisper large-v3-turbo | Ventana de audio de 30 s | multilingüe | Apache 2.0 | MLX safetensors Q8 | HF, 913,7 MB |

En la evaluación del autor, el checkpoint Q8 de este repositorio obtiene mejores logprobs medios que `whisper-large-v3-turbo-mlx-q8` en numerales aislados (-0,13 frente a -0,22) y en el fragmento de habla polaca continua (-0,19 frente a -0,31), pese a tener menos capas de decoder (24 frente a 4 en turbo, que compensa con mayor anchura). El Q4 compañero iguala al Q8 en numerales y queda ligeramente por debajo en habla continua (-0,20 frente a -0,19).

## Limitaciones y advertencias

- Modelo especializado exclusivamente en polaco; no debe usarse para transcripción en inglés u otros idiomas sin adaptación, ya que el fine-tune adapta fonéticamente palabras extranjeras a la ortografía polaca.
- Solo funciona en runtimes MLX sobre Apple Silicon; no es compatible con `faster-whisper`, CTranslate2, `whisper.cpp` ni GGML.
- La inferencia alojada en Hugging Face está desactivada (`inference: false`); requiere despliegue local.
- Riesgo de alucinación inherente a Whisper en segmentos con silencio, ruido o audio musical; el autor recomienda VAD (Silero) para mitigarlo.
- No apto para decisiones críticas de seguridad, médicas o legales sin revisión de un experto de dominio.
- Sesgos: no se documentan sesgos específicos en la model card; al derivar de Common Voice 11 y FLEURS, hereda los sesgos de cobertura demográfica y acústica de esos corpus.
- El modelo base upstream no publica el recuento exacto de parámetros ni detalles del dataset de fine-tune, lo que limita la reproducibilidad del entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validación muy reducido (tres runtimes del propio autor y colaboradores).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibraxisAI/whisper-medium-pl-v2-mlx-q8
- Modelo base upstream: https://huggingface.co/bardsai/whisper-medium-pl-v2
- Checkpoint compañero de 4 bits: https://huggingface.co/LibraxisAI/whisper-medium-pl-v2-mlx-GPTQ-Hessian-q4
- Checkpoint comparativo large-v3-turbo Q8: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- `mlx-whisper` en PyPI: https://pypi.org/project/mlx-whisper/
- `LibraxisAI/mlx-batch-server`: https://github.com/LibraxisAI/mlx-batch-server
- `vetcoders/x9bus`: https://github.com/vetcoders/x9bus
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-medium
