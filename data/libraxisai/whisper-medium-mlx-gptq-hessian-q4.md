# LibraxisAI/whisper-medium-mlx-GPTQ-Hessian-q4

## Resumen

`whisper-medium-mlx-GPTQ-Hessian-q4` es un checkpoint de reconocimiento automático del habla (ASR) derivado de `openai/whisper-medium`, publicado por LibraxisAI y cuantizado a 4 bits en formato MLX affine (`bits: 4`, `group_size: 32`). Su objetivo es permitir transcripción local de alta precisión con un consumo de memoria unificado inferior a 500 MB en Apple Silicon con Metal, manteniendo el decodificador de texto de 24 capas del modelo original frente a alternativas con decodificadores más superficiales.

El modelo conserva la arquitectura Whisper completa: `d_model = 1024`, 24 bloques de encoder, 24 bloques de decoder y 80 bins mel. La cuantización se aplica a las 385 matrices de proyección (encoder, decoder y la proyección de vocabulario `51865 × 1024`), dejando en F16 las convoluciones de entrada, el embedding posicional, todas las LayerNorm y las `alignment_heads`.

Es relevante porque demuestra que un Whisper medium cuantizado con GPTQ ponderado por Hessiano puede ocupar menos de la mitad que su variante q8 (861,8 MB) y un tercio del FP16 (1,53 GB), con una fidelidad medible frente al profesor (MSE relativo de features de encoder de 0,01451 y KL de logits de vocabulario de 0,07829 nats a temperatura 2,0). Está pensado para dictado multilingüe local en Mac, no para despliegue en servidores GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), 24 bloques de encoder y 24 de decoder, `d_model = 1024`, 80 bins mel |
| Parametros totales | no disponible (modelo base `openai/whisper-medium`, 769 M según el modelo original; no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | MLX affine 4 bits, `group_size = 32` (códigos U32 empaquetados + escalas F16 + sesgos F16 por grupo); capas no cuantizadas en F16 |
| Idiomas soportados | en, pl, de, fr, es, it, pt, nl, ru, zh, ja, ko, ar, hi, multilingual |
| Licencia | MIT |
| Formato de pesos | `weights.safetensors` (MLX affine), más `config.json`, `tokenizer.json` y `mel_filters.npz` (`mel_80` + `mel_128`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium sin modificaciones estructurales: un encoder convolucional (`conv1`, `conv2`) seguido de 24 bloques transformer sobre espectrogramas mel de 80 bins, y un decoder autorregresivo de 24 bloques con vocabulario de 51.865 tokens y embedding atado a la proyección de salida. La cuantización no altera el grafo: se aplica post-entrenamiento sobre las 385 matrices de proyección, incluyendo la proyección de vocabulario `51865 × 1024`.

El proceso de cuantización emplea GPTQ con compensación de error por bloques de 32 pesos mediante inversa de Cholesky (`H⁻¹ = U Uᵀ`) de la matriz de Gram empírica por capa, con regularización ridge adaptativa `λ = 0,01 · media(diag(H))`. Antes de la propagación de error se realiza una búsqueda de rango asimétrico sobre una rejilla de 81 puntos `(α, β) ∈ [0,88, 1,00]²` ponderada por la diagonal del Hessiano. La señal de calibración son espectrogramas mel de habla limpia y aumentada con ruido en polaco e inglés (24.000 frames de encoder más trayectorias completas de tokens del decoder forzadas por el profesor), disjunta del conjunto de evaluación. No se indica entrenamiento adicional ni ajuste fino: es una compresión del checkpoint original.

## Capacidades

- Transcripción de voz a texto multilingüe en 14 idiomas declarados (en, pl, de, fr, es, it, pt, nl, ru, zh, ja, ko, ar, hi) más etiqueta `multilingual`.
- Detección y transcripción con puntuación y fraseo natural en dictado continuo, gracias al decoder de 24 capas.
- Reconocimiento de numerales aislados y morfología continua en polaco (evaluado con `5× "pięć"` y dictado largo).
- Manejo de cambios de código lingüístico (code-switching) con limitaciones: en la evaluación reproduce compuestos técnicos en inglés dentro de frases polacas de forma fonética (`"computer use"` → `"komputerius"`).
- Decodificación greedy con backend Metal nativo (`x9stt` / `x9bus`).
- Compatibilidad con `mlx_whisper` y `LibraxisAI/mlx-batch-server` como checkpoint drop-in.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo thinking, visión, audio generativo ni otras capacidades multimodales más allá de la entrada de audio.

## Casos de uso

- Dictado local en Mac para desarrolladores: transcripción en tiempo real o por lotes de notas de voz y reuniones con menos de 500 MB de memoria unificada, adecuado en equipos con 8-16 GB de RAM donde un Whisper FP16 no cabe con holgura.
- Subtitulado de vídeo multilingüe: generación de pistas SRT/VTT en 14 idiomas usando `mlx_whisper` sobre Apple Silicon, con la ventaja de que el decoder de 24 capas mantiene puntuación y fraseo frente a variantes de 4 capas que eliden palabras.
- Transcripción de entrevistas y podcasts en polaco, inglés y otros idiomas europeos: el modelo fue calibrado con habla limpia y con ruido en `pl` y `en`, por lo que es especialmente adecuado para audio de estudio o con ruido moderado.
- Procesamiento por lotes en servidor local Apple: integración con `LibraxisAI/mlx-batch-server` para colas de transcripción en un Mac Studio o Mac mini, con footprint de memoria que permite ejecutar varias instancias o combinarlo con otros modelos.
- Preprocesado de pipelines de NLP: conversión de audio a texto antes de resumen, extracción de entidades o indexación semántica, usando el modelo como etapa ASR barata y local sin depender de APIs externas.
- Aplicaciones de accesibilidad y notas de voz en dispositivo: transcripción offline en apps de escritorio macOS sin enviar audio a la nube, con licencia MIT que permite redistribución en productos comerciales.
- Filtrado previo con VAD: combinado con Silero VAD y gating por energía para suprimir alucinaciones en segmentos silenciosos, patrón recomendado explícitamente por el autor.

## Benchmarks y rendimiento

La model card no publica métricas estándar (WER, MMLU, etc.), pero sí una comparación cualitativa y de fidelidad frente al profesor y a otros checkpoints de la familia, evaluada con `x9stt` en Metal, decodificación greedy y `language="pl"`:

| Checkpoint | Tamano pesos | Capas decoder | Numerales aislados (`5× "pięć"`) | Morfologia continua | Code-switching tecnico EN | Logprob medio |
|---|---:|---:|---|---|---|---:|
| `whisper-large-v3-turbo-mlx-q8` | 913,7 MB | 4 | `Pięć pięć pięć pięć pięć` | Fuerte | Exacto (`"computer use"`) | -0,22 |
| `whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4` | 513,5 MB | 4 | `Pięć, pięć, pięć, pięć, pięć.` | Elisiones menores en tomas largas | Exacto (`"computer use"`) | -0,24 |
| **`whisper-medium-mlx-GPTQ-Hessian-q4`** | **482,9 MB** | **24** | **`Pięć, pięć, pięć, pięć, pięć.`** | **Fuerte (decoder de 24 capas)** | **Fonético (`"komputerius"`, prior mel-80)** | **-0,27** |
| `whisper-large-v3-mlx-GPTQ-Hessian-q4` | 973,6 MB | 32 | `Pięć, pięć, pięć, pięć, pięć.` | Máxima (decoder de 32 capas) | Exacto (`"computer use"`) | -0,15 |

Métricas de fidelidad frente al profesor FP16 declaradas por el autor: MSE relativo de features de encoder `0,01451`; divergencia KL de logits de vocabulario a `T = 2,0` de `0,07829` nats. No se han publicado resultados de benchmarks estándar (WER por idioma, Common Voice, LibriSpeech) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 483 MB para los pesos en 4 bits (482,9 MB, 460,54 MiB); el consumo real de inferencia añade buffers de activación y el runtime MLX, por lo que conviene reservar 1-2 GB en total.
- Hardware objetivo: Apple Silicon con Metal (series M1, M2, M3, M4 y superiores). El formato MLX affine no está pensado para GPUs NVIDIA o AMD convencionales.
- Cabe holgadamente en cualquier Mac con 8 GB de memoria unificada, incluidos MacBook Air base; es una de las variantes más ligeras de la familia.
- Opciones de despliegue: `mlx_whisper`, `LibraxisAI/mlx-batch-server` y el backend Metal nativo de `vetcoders/x9bus` (`x9stt`). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato MLX affine.
- Latencia y throughput: no disponibles en la información proporcionada.
- Comparación de footprint: 482,9 MB frente a 861,8 MB (`whisper-medium-mlx-q8`), 1,53 GB (FP16) y 3,06 GB (FP32) del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros / capas decoder | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| **`whisper-medium-mlx-GPTQ-Hessian-q4`** | Whisper medium, 24 capas decoder | no disponible (ventana Whisper de 30 s) | MIT | MLX affine 4 bits | Hugging Face, 0 descargas |
| `LibraxisAI/whisper-medium-mlx-q8` | Whisper medium, 24 capas decoder | no disponible | MIT (presumible, no confirmado) | MLX 8 bits | Hugging Face |
| `LibraxisAI/whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4` | Whisper large-v3-turbo, 4 capas decoder | no disponible | MIT (presumible, no confirmado) | MLX affine 4 bits | Hugging Face |
| `LibraxisAI/whisper-large-v3-mlx-GPTQ-Hessian-q4` | Whisper large-v3, 32 capas decoder | no disponible | MIT (presumible, no confirmado) | MLX affine 4 bits | Hugging Face |
| `openai/whisper-medium` (original) | Whisper medium, 24 capas decoder | no disponible | MIT | safetensors FP16/FP32 | Hugging Face, ampliamente usado |

Frente a las variantes large, este checkpoint sacrifica precisión en code-switching técnico y morfología compleja a cambio de un footprint menor y un decoder más profundo que el de large-v3-turbo. Frente a `whisper-medium-mlx-q8` reduce el tamaño de pesos un 44% a costa de una fidelidad ligeramente inferior.

## Limitaciones y advertencias

- El prior mel-80 de `whisper-medium` provoca errores fonéticos en compuestos técnicos ingleses dentro de frases en otros idiomas (ejemplo documentado: `"computer use"` → `"komputerius"`); para dictado mixto polaco/inglés el autor recomienda las variantes large-v3 o large-v3-turbo.
- Riesgo de alucinación en segmentos silenciosos o con ruido; el autor recomienda explícitamente emparejar con Silero VAD y gating por energía.
- Elidiomas no cubiertos por la calibración (solo `pl` y `en`) pueden presentar mayor degradación que el profesor FP16, aunque la evaluación publicada se limita a polaco.
- No se han publicado métricas WER estándar por idioma; la evaluación es cualitativa y sobre un conjunto reducido.
- El formato MLX affine limita el despliegue a Apple Silicon; no es portable a GPUs NVIDIA/AMD ni a runtimes como vLLM, llama.cpp u Ollama.
- Licencia MIT: permite uso comercial y redistribución, pero se heredan las limitaciones y sesgos del checkpoint original `openai/whisper-medium`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado; conviene validar en el dominio propio antes de producción.
- La model card está marcada con `inference: false` en los metadatos, aunque el autor documenta uso con `mlx_whisper` y `x9bus`; verificar compatibilidad con la versión concreta del runtime.

## Enlaces

- Hugging Face: https://huggingface.co/LibraxisAI/whisper-medium-mlx-GPTQ-Hessian-q4
- Modelo base: https://huggingface.co/openai/whisper-medium
- Variante de referencia de la receta: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4
- Variante q8 del mismo modelo: https://huggingface.co/LibraxisAI/whisper-medium-mlx-q8
- Variante large-v3-turbo q8: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- Variante large-v3 q4: https://huggingface.co/LibraxisAI/whisper-large-v3-mlx-GPTQ-Hessian-q4
- Backend Metal nativo: https://github.com/vetcoders/x9bus
- Servidor por lotes del autor: `LibraxisAI/mlx-batch-server` (referenciado en la model card; no se proporciona URL directa)
