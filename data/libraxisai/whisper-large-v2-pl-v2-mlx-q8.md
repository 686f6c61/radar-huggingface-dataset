# LibraxisAI/whisper-large-v2-pl-v2-mlx-q8

## Resumen

`whisper-large-v2-pl-v2-mlx-q8` es una conversión cuantizada a 8 bits en formato MLX del checkpoint polaco `bardsai/whisper-large-v2-pl-v2`, que a su vez deriva de `openai/whisper-large-v2`. Lo publica LibraxisAI y resuelve un problema muy concreto: ejecutar reconocimiento automático de voz (ASR) especializado en polaco sobre Apple Silicon (Metal), con un peso en memoria unificado notablemente menor que el checkpoint original en PyTorch FP32 (6,17 GB).

La arquitectura es la de Whisper large-v2 sin cambios estructurales: encoder de 32 capas, decoder de 32 capas, `d_model` de 1280, 80 bins mel y vocabulario de 51.865 tokens. La cuantización es MLX affine de 8 bits con `group_size` 32 aplicada a 513 proyecciones lineales y de embedding del vocabulario, manteniendo en FP16 las convoluciones del encoder, el embedding posicional del decoder y todas las LayerNorm. El bundle resultante pesa 1740,4 MB.

Es relevante para quien necesite transcripción local de polaco en Mac con baja latencia y sin dependencia de servicios en la nube, o como referencia de evaluación frente a variantes multilingües de Whisper. El modelo está pensado exclusivamente para runtimes MLX; no es compatible con `faster-whisper`, CTranslate2 ni `whisper.cpp`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder), `d_model: 1280`, `n_audio_layer: 32`, `n_text_layer: 32`, `n_mels: 80`, `n_vocab: 51865` |
| Parametros totales | no disponible (checkpoint large-v2; pesos cuantizados de 1.740.420.709 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | MLX affine Q8 (`bits: 8`, `group_size: 32`); tensores no cuantizados en FP16 |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (`weights.safetensors`, 1740,4 MB) + `tokenizer.json`, `mel_filters.npz`, `config.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura estándar de Whisper large-v2: un encoder convolucional más transformer de 32 capas que procesa espectrogramas mel de 80 bins, y un decoder autorregresivo de 32 capas con atención cruzada sobre la salida del encoder. El fine-tune polaco de origen (`bardsai/whisper-large-v2-pl-v2`) se entrenó sobre Common Voice 11 y FLEURS en polaco, según indica la model card.

La conversión a MLX aplica cuantización group-affine de 8 bits con `group_size: 32` sobre 513 matrices (proyecciones lineales y embedding del vocabulario), dejando en FP16 `encoder.conv1`, `encoder.conv2`, `decoder.positional_embedding` y los parámetros de LayerNorm, y en I64 `alignment_heads`. No se documenta en la información disponible ningún proceso adicional de RLHF, DPO ni decodificación especulativa. El autor declara que la conversión se hizo directamente desde el checkpoint upstream y que la ruta de inferencia está validada con `mlx_whisper`, `LibraxisAI/mlx-batch-server` y `vetcoders/x9bus`.

## Capacidades

- Transcripción de voz a texto en polaco (`automatic-speech-recognition`, `language="pl"`).
- Dictado local y transcripción por lotes de audio en Apple Silicon (M1, M2, M3, M4).
- Procesamiento de audio con VAD (Silero) en la ruta probada por el autor mediante `x9stt`, con decodificación greedy.
- Manejo de habla mixta polaco/inglés, aunque el autor advierte que el fine-tune adapta palabras extranjeras fonéticamente a la ortografía polaca.
- Integración en pipelines de voz a agente y dictado de escritorio con baja latencia y residencia compacta en memoria unificada.
- No soporta tool calling, function calling, agentes multi-step, visión ni audio generation; es un modelo puramente ASR.

## Casos de uso

- Dictado de escritorio en macOS: el modelo se carga en memoria unificada (1740,4 MB) y transcribe en local con `mlx_whisper`, sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Transcripción por lotes de reuniones o entrevistas en polaco: `LibraxisAI/mlx-batch-server` permite procesar colas de audio con VAD para segmentar silencios y reducir cómputo en pasajes vacíos.
- Voice-to-agent en aplicaciones de escritorio: la latencia baja en Metal y el tamaño compacto permiten mantener el modelo residente mientras se alimenta un pipeline de agente que consume el texto transcrito.
- Evaluación comparativa de ASR polaco: sirve como referencia cuantizada frente a checkpoints multilingües de Whisper o frente a la variante 4-bit del mismo autor, con la que se puede comparar WER y calidad de transcripción.
- Subtitulado y generación de actas en polaco: la salida de texto con marcas temporales de Whisper (según la API de `mlx_whisper`) permite construir subtítulos y resúmenes posteriores.
- Investigación en cuantización: al mantener FP16 en convoluciones y LayerNorm y cuantizar solo proyecciones, es un caso de estudio útil para medir el impacto de Q8 en ASR de un idioma específico.
- Herramientas de accesibilidad: transcripción en tiempo real de audio del sistema para personas con dificultades auditivas en entornos de habla polaca.

## Benchmarks y rendimiento

El autor reporta el WER y CER del checkpoint upstream en Mozilla Common Voice 11.0 (`pl`, test split), no de esta conversión cuantizada:

| Metrica | Valor | Conjunto |
|---|---|---|
| WER | 7,28 % | Common Voice 11.0 `pl` test |
| CER | 2,08 % | Common Voice 11.0 `pl` test |

Además, la model card incluye una evaluación cualitativa en Apple Silicon Metal con `x9stt` (greedy, `language="pl"`, VAD Silero):

| Checkpoint | Pesos | Capas decoder | Frase PL/EN mixta |
|---|---:|---:|---|
| `whisper-large-v3-turbo-mlx-q8` | 913,7 MB | 4 | `…pracuje z computer use.` |
| **`whisper-large-v2-pl-v2-mlx-q8`** | **1740,4 MB** | **32** | `…aplikacja, przy której się pracuje z punktu widzenia.` |
| `whisper-large-v2-pl-v2-mlx-GPTQ-Hessian-q4` | 973,2 MB | 32 | `…sza aplikacja, przy której się pracuje z komputerjust.` |

No se han publicado resultados de benchmarks cuantitativos (WER/CER) de esta conversión Q8 sobre audio de evaluación en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 1740,4 MB de pesos; el consumo total en inferencia es mayor por activaciones y buffers de audio, aunque no se detalla en la información disponible.
- Hardware objetivo: Apple Silicon M1, M2, M3 y M4 con backend Metal. No está pensado para GPU NVIDIA ni CPU x86.
- No cabe en GPUs de consumidor tipo RTX 4090 mediante este formato, porque MLX requiere Apple Silicon; para esas plataformas habría que usar el checkpoint PyTorch upstream.
- Despliegue: `mlx_whisper` (PyPI), `LibraxisAI/mlx-batch-server` y `vetcoders/x9bus` (`x9stt` y `codescribe-whisper-validate`). No compatible con `faster-whisper`, CTranslate2, `whisper.cpp` ni GGML.
- Latencia y throughput: no disponibles de forma numérica; el autor solo indica que la ruta está probada para inferencia local de baja latencia en Metal.

## Comparativa con modelos similares

| Modelo | Parametros / pesos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **`LibraxisAI/whisper-large-v2-pl-v2-mlx-q8`** | 1740,4 MB (Q8 MLX) | Audio 30 s por segmento | WER 7,28 % / CER 2,08 % (upstream, CV11 pl) | Apache 2.0 | Hugging Face, solo MLX |
| `LibraxisAI/whisper-large-v2-pl-v2-mlx-GPTQ-Hessian-q4` | 973,2 MB (Q4 MLX) | Audio 30 s por segmento | No disponible | Apache 2.0 | Hugging Face, solo MLX |
| `LibraxisAI/whisper-large-v3-turbo-mlx-q8` | 913,7 MB (Q8 MLX) | Audio 30 s por segmento | No disponible (multilingüe, 4 capas decoder) | Apache 2.0 | Hugging Face, solo MLX |
| `bardsai/whisper-large-v2-pl-v2` | 6,17 GB FP32 PyTorch | Audio 30 s por segmento | WER 7,28 % / CER 2,08 % (CV11 pl) | Apache 2.0 | Hugging Face, PyTorch |

## Limitaciones y advertencias

- Solo polaco: el fine-tune adapta palabras extranjeras fonéticamente a la ortografía polaca, por lo que la transcripción de inglés u otros idiomas no es fiable.
- Riesgo de alucinación y errores en pasajes con ruido, solapamiento de hablantes o audio de baja calidad, inherente a los modelos Whisper.
- La evaluación cualitativa del autor muestra fallos en frases mixtas PL/EN y en repeticiones de numerales aislados, donde el modelo devolvió salida vacía.
- No apto para decisiones críticas de seguridad, médicas o legales sin revisión de un experto de dominio, según el propio autor.
- Restricción de runtime: solo MLX; no funciona con `faster-whisper`, CTranslate2, `whisper.cpp` ni GGML, que usan layouts de tensores distintos.
- La inferencia alojada en Hugging Face está deshabilitada (`inference: false`); requiere ejecución local.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del checkpoint upstream y de los datos de entrenamiento originales (Common Voice, FLEURS).
- No se documentan sesgos específicos más allá de los conocidos de Whisper y de los corpus de entrenamiento; no hay datos de evaluación de sesgos en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/LibraxisAI/whisper-large-v2-pl-v2-mlx-q8
- Checkpoint upstream: https://huggingface.co/bardsai/whisper-large-v2-pl-v2
- Variante 4-bit: https://huggingface.co/LibraxisAI/whisper-large-v2-pl-v2-mlx-GPTQ-Hessian-q4
- Variante large-v3-turbo Q8: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- `mlx-batch-server`: https://github.com/LibraxisAI/mlx-batch-server
- `x9bus`: https://github.com/vetcoders/x9bus
- `mlx-whisper` (PyPI): https://pypi.org/project/mlx-whisper/
