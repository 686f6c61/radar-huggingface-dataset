# batteryphil/ACE-Step-1.5-XL-Turbo-PRIME-Quant

## Resumen

ACE-Step v1.5 XL Turbo PRIME-Quant es una cuantizacion a 4 bits del modelo de generacion de musica texto-a-audio ACE-Step v1.5 XL Turbo, publicada por el desarrollador independiente batteryphil (Philip Bartsch) bajo su propia tecnica de cuantizacion denominada PRIME-Quant. El modelo base, desarrollado por el equipo ACE-Step, es un stack de difusion compuesto por un Music DiT de 4,17 mil millones de parametros, un ConditionEncoder y el modelo de embeddings Qwen3-Embedding-0.6B, capaz de generar canciones estereo a 48 kHz con voces y letras a partir de una descripcion textual. La version cuantizada reduce el peso en BF16 de aproximadamente 11,11 GB a 3,03 GB de pesos comprimidos (3,31 GB residentes en GPU incluyendo el VAE).

La relevancia de esta ficha radica en que demuestra que es posible ejecutar un stack completo de generacion musical de alta fidelidad en GPUs de consumo de 8 a 16 GB sin necesidad de descarga de CPU (CPU offload), algo que el modelo original en BF16 no consigue en tarjetas de 16 GB de escritorio. Segun las mediciones del autor en una AMD RX 9060 XT de 16 GB con ROCm 7.2, la version cuantizada genera una cancion estereo de 30 segundos en 19,04 segundos en caliente, frente a 24,77 segundos del BF16, manteniendo una paridad de audio alta (Mel SSIM de 0,9331 de media).

El modelo emplea una arquitectura de difusion transformer (DiT) con atencion cruzada y auto-atencion en 32 bloques, combinada con un VAE convolucional 1D (AutoencoderOobleck) que decodifica el audio a 48 kHz estereo. La cuantizacion PRIME-Quant aplica rotaciones Walsh-Hadamard con cabezas GQA (H_128) y un esquema de condicionamiento dual-timestep, manteniendo cobertura del 100% de las matrices lineales y de embedding (643 de 643).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion transformer (DiT) 1D para audio musical + ConditionEncoder + Qwen3-Embedding-0.6B + VAE AutoencoderOobleck (1D conv) |
| Parametros totales | 4,17B (Music DiT) + ConditionEncoder + 0,6B (Qwen3-Embedding) — total no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits PRIME-Quant (esquema V3_P4_0), 100% de matrices lineales y de embedding cuantizadas (643/643) |
| Idiomas soportados | no disponible (el prompt y las letras se procesan via Qwen3-Embedding, multilingue por herencia, pero no se documenta lista de idiomas) |
| Licencia | Bartsch Personal-Free & 5% Commercial Profit-Share License v1.0 (modelo base upstream: MIT) |
| Formato de pesos | diffusers (safetensors), runtime Python propio (`prime_infer_runtime.py`, `run_acestep_prime.py`) |

## Arquitectura y entrenamiento

El modelo base ACE-Step v1.5 XL Turbo es un sistema de difusion para generacion musical compuesto por cuatro modulos: un transformer de difusion 1D (AceStepTransformer1DModel) de 4,17B parametros con 32 bloques que combinan auto-atencion (32 cabezas de query / 8 de key-value) y atencion cruzada; un AceStepConditionEncoder de 8 capas de letra y 4 de timbre (16Q/8KV); el modelo Qwen3-Embedding-0.6B (16Q/8KV) para codificar el prompt de texto; y un VAE convolucional 1D (AutoencoderOobleck) que decodifica la representacion latente a audio estereo de 48 kHz. El modo "turbo" implica una destilacion para reducir el numero de pasos de muestreo (8 pasos en los benchmarks del autor).

La innovacion de esta version es la cuantizacion PRIME-Quant, que incorpora rotaciones Walsh-Hadamard exactas sin sobrecoste computacional en las tres redes con atencion GQA, alcanzando invariancia verificada frente a BF16 de 52,6 dB (Qwen3), 46,0 dB (ConditionEncoder) y 48,4 dB (DiT). Ademas aplica un condicionamiento dual-timestep (time_embed con SNR de 43,86 dB y time_embed_r con 32,14 dB) y un esquema PRIMAL de co-adaptacion del condition_embedder que eleva el condicionamiento end-to-end de texto, letra y timbre de 10,57 dB a 11,88 dB. No se dispone de informacion sobre el dataset de entrenamiento original (numero de tokens, composicion, uso de RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de musica texto-a-audio: produce pistas estereo completas a 48 kHz con voces y letras a partir de un prompt descriptivo y una letra estructurada por secciones ([verse], [chorus]).
- Control de atributos musicales: permite especificar duracion, BPM, tonalidad (keyscale), numero de pasos de difusion y semilla.
- Generacion con letras y voz: soporta canciones con voz masculina o femenina segun la descripcion y la letra.
- Generacion instrumental: produce piezas orquestales o cinematograficas sin voz.
- Ejecucion totalmente en GPU: todo el stack (Qwen3, ConditionEncoder, DiT y VAE) reside en GPU sin CPU offload.
- Compatibilidad con ROCm y CUDA: probado en AMD ROCm 7.2 y declarado compatible con NVIDIA CUDA.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de generacion de audio).

## Casos de uso

- Produccion musical asistida en estacion de trabajo de consumo: un musico con una GPU de 8-16 GB puede generar maquetas estereo de 30 segundos en aproximadamente 19 segundos, iterando rapidamente sobre ideas de synthwave, baladas acusticas u orquestales sin depender de servicios en la nube.
- Creacion de bandas sonoras para videojuegos indie: el modelo permite generar temas con BPM y tonalidad controlados (por ejemplo, 120 BPM en La menor) y exportar WAV a 48 kHz, adecuado para integrarse directamente en motores como Unity o Unreal.
- Prototipado rapido de jingles y cortinillas publicitarias: la baja latencia (1,56 s para los 8 pasos del DiT) permite generar multiples variaciones en una sola sesion y seleccionar la mejor por similitud mel-espectral.
- Investigacion en cuantizacion de modelos generativos de audio: el repositorio incluye pares WAV BF16 vs cuantizado y espectrogramas comparativos, lo que permite reproducir y auditar la fidelidad de la cuantizacion a 4 bits.
- Despliegue en estaciones de trabajo con GPU AMD: al estar validado en ROCm 7.2 sobre una RX 9060 XT, cubre un nicho de hardware habitualmente desatendido por los stacks de difusion convencionales.
- Generacion de audio para podcast o contenido hablado con musica de fondo: aunque no se documenta explicitamente la sintesis de voz hablada, la generacion de voces cantadas y letras sugiere utilidad para demos musicales de contenido editorial.
- Educacion y talleres sobre difusion aplicada a audio: el runtime independiente (`run_acestep_prime.py`) y los requisitos minimos permiten montar talleres practicos en equipos de gama media.

## Benchmarks y rendimiento

Resultados verificados por el autor en AMD RX 9060 XT 16 GB con ROCm 7.2, sobre 3 pistas estereo de 30 segundos a 48 kHz y 8 pasos turbo:

| Metrica | BF16 (CPU offload) | PRIME-Quant (sin CPU offload) |
|---|---|---|
| Pesos comprimidos en disco | ~10,75 GB (11,11 GB con VAE) | 3,03 GB (3,55x menor) |
| Cobertura de lineales cuantizadas | 0/643 | 643/643 (100%) |
| Huella total en GPU | requiere CPU offload en 16 GB | 3.305,7 MB (3,31 GB) |
| VRAM pico PyTorch (30 s a 48 kHz) | 8.322,3 MB | 7.161,5 MB (carga en 3,33 s) |
| Tiempo en caliente por cancion de 30 s | 24,77 s (454,9 s en frio) | 19,04 s (1,30x mas rapido) |
| Tiempo de los 8 pasos del DiT | no disponible | 1,56 s (2,2x mas rapido que BF16) |

Paridad de audio frente a BF16 (media de 3 pistas): Mel SSIM 0,9331, Mel PSNR 20,97 dB, STFT Cosine 0,8775, Pitch Chroma 0,8682.

| Pista (30 s, 48 kHz estereo) | Mel PSNR | Mel SSIM | STFT Mag Cos | Pitch Chroma Cos | Loudness RMS delta |
|---|---|---|---|---|---|
| 01_synthwave_rock_vocal | 24,59 dB | 0,9765 | 0,8985 | 0,9157 | -0,15 dB |
| 02_acoustic_ballad_vocal | 19,29 dB | 0,9031 | 0,8732 | 0,8243 | -0,08 dB |
| 03_orchestral_cinematic | 19,04 dB | 0,9196 | 0,8609 | 0,8646 | +0,65 dB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de generacion de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,31 GB de pesos residentes; pico medido de 7.161,5 MB de VRAM de PyTorch para una cancion de 30 segundos a 48 kHz estereo.
- GPUs validadas: AMD RX 9060 XT 16 GB con ROCm 7.2 (unica configuracion medida por el autor).
- GPUs declaradas como objetivo: AMD ROCm y NVIDIA CUDA con 8-16 GB de VRAM.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas; el autor indica que el BF16 no cabe sin CPU offload en 16 GB de escritorio, mientras que la version cuantizada si.
- Opciones de despliegue: runtime propio del autor (`run_acestep_prime.py` y `prime_infer_runtime.py`) sobre la libreria diffusers; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion de audio).
- Latencia y throughput: 19,04 s por cancion de 30 s en caliente (1,30x mas rapido que BF16); los 8 pasos del DiT se completan en 1,56 s; carga del modelo en 3,33 s; primera generacion en frio de 454,9 s en BF16 (dato del baseline).
- Variable de entorno recomendada en ROCm: `TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step v1.5 XL Turbo PRIME-Quant (este) | 4,17B DiT + 0,6B Qwen3 + CondEnc + VAE | no disponible | Bartsch Personal-Free & 5% Commercial Profit-Share v1.0 | diffusers + runtime propio | Hugging Face |
| ACE-Step v1.5 XL Turbo (BF16, base) | 4,17B DiT + 0,6B Qwen3 + CondEnc + VAE | no disponible | MIT | diffusers | Hugging Face (ACE-Step) |
| Otros modelos texto-a-audio open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que en la informacion proporcionada no se identifican otras alternativas de generacion musical con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar el modelo base y el encoder Qwen3, puede reproducir sesgos de estilo musical o de representacion presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: en generacion musical se traduce en letras mal pronunciadas, estructuras de cancion incoherentes o artefactos de audio; la paridad medida frente a BF16 no es perfecta (Mel PSNR medio de 20,97 dB, con minimo de 19,04 dB en la pista orquestal).
- Limitaciones de fidelidad de la cuantizacion: la pista orquestal cinematografica muestra la mayor desviacion de sonoridad (+0,65 dB RMS) y el menor STFT Cosine (0,8609); el condicionamiento end-to-end a 4 bits se situa en 11,88 dB de SNR, un margen limitado.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto ni la lista de idiomas soportados; el rendimiento multilingue de letras y prompts no esta verificado.
- Restricciones de licencia: los checkpoints PRIME-Quant y el runtime propio estan bajo la Bartsch Personal-Free & 5% Commercial Profit-Share License v1.0, gratuita para uso personal, investigacion, academico y sin animo de lucro, pero con un 5% de participacion en beneficios para uso comercial; el modelo base upstream es MIT, lo que conviene revisar antes de un despliegue comercial.
- Caveat de produccion: validado en una unica GPU (RX 9060 XT 16 GB, ROCm 7.2); el comportamiento en otras GPUs, en CUDA o en entornos multi-GPU no esta verificado. El repositorio tiene 0 descargas y 0 likes, por lo que carece de validacion independiente de la comunidad.
- Dependencia de un runtime propio: requiere los scripts del autor y `requirements.txt`; no es un checkpoint diffusers estandar cargable con `from_pretrained` sin el runtime PRIME-Quant.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batteryphil/ACE-Step-1.5-XL-Turbo-PRIME-Quant
- Modelo base en Hugging Face: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo-diffusers
- Licencia del modelo cuantizado (LICENSE): https://huggingface.co/batteryphil/ACE-Step-1.5-XL-Turbo-PRIME-Quant/blob/main/LICENSE
- Aviso de atribucion del modelo base (NOTICE): https://huggingface.co/batteryphil/ACE-Step-1.5-XL-Turbo-PRIME-Quant/blob/main/NOTICE
- Benchmarks y pares de audio: https://huggingface.co/batteryphil/ACE-Step-1.5-XL-Turbo-PRIME-Quant/tree/main/benchmarks
- Paper, blog o repositorio adicionales de PRIME-Quant: no disponible en la informacion proporcionada.
