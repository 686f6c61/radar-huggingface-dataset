# LibraxisAI/distil-whisper-large-v3-pl-mlx-q8

## Resumen

`LibraxisAI/distil-whisper-large-v3-pl-mlx-q8` es un checkpoint de reconocimiento automatico del habla (ASR) para polaco, derivado de `Aspik101/distil-whisper-large-v3-pl`, que a su vez procede de `openai/whisper-large-v3` mediante destilacion de conocimiento. El modelo conserva el encoder completo de Whisper large-v3 (32 capas, `d_model` de 1280, 128 bins mel) pero reduce el decoder a 2 capas, lo que abarata drasticamente la decodificacion manteniendo la representacion acustica del modelo grande.

La contribucion de LibraxisAI es el empaquetado en formato MLX con cuantizacion afina de 8 bits (`bits: 8`, `group_size: 32`) sobre 213 matrices lineales y de embedding, dejando convoluciones, `positional_embedding` y capas `LayerNorm` en FP16. El bundle ocupa 854,6 MB (815,01 MiB) frente a los 3,03 GB del checkpoint PyTorch FP32 original, lo que permite mantenerlo residente en memoria unificada de Apple Silicon para dictado local y transcripcion por lotes.

Es relevante ahora por dos motivos: la cuantizacion MLX nativa para Metal en chips M1-M4 esta desplazando los flujos de ASR local fuera de la nube, y la destilacion de Whisper large-v3 permite latencias de dictado interactivas con calidad acustica de modelo grande. La model card documenta explicitamente fallos de robustez en numerales y en mezcla PL/EN, lo que conviene tener en cuenta antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder), `d_model: 1280`, `n_audio_layer: 32`, `n_text_layer: 2`, `n_mels: 128`, `n_vocab: 51866` |
| Parametros totales | no disponible (el repo pesa 0,9 GB tras cuantizacion; el upstream FP32 PyTorch pesa 3,03 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio tipica de Whisper large-v3: 30 s por segmento; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | MLX affine Q8 (`bits: 8`, `group_size: 32`, 213 matrices); variante companera GPTQ-Hessian Q4 de 480,6 MB; tensores no cuantizados en FP16 |
| Idiomas soportados | polaco (`pl`); fuera de alcance la transcripcion multilingue no adaptada |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (`weights.safetensors`, 854.605.127 bytes); `tokenizer.json`, `mel_filters.npz` (`mel_80` + `mel_128`), `config.json` |

## Arquitectura y entrenamiento

La arquitectura es Whisper estandar con destilacion de conocimiento: encoder de 32 capas identico en profundidad al de `large-v3`, decoder reducido a 2 capas (frente a 32 en `large-v3` y 4 en `turbo`), 128 bins mel y vocabulario de 51.866 tokens. El upstream `Aspik101/distil-whisper-large-v3-pl` fue destilado en polaco a partir de `openai/whisper-large-v3`; la model card no detalla volumen de tokens de audio, composicion del corpus ni si hubo etapas de RLHF o DPO en el proceso de destilacion, por lo que esos datos deben considerarse no disponibles.

La innovacion tecnica de este repositorio es exclusivamente de empaquetado e inferencia: conversion directa del checkpoint PyTorch a formato MLX afina de grupo Q8, con `encoder.conv1`, `encoder.conv2`, `decoder.positional_embedding`, pesos y sesgos de `LayerNorm` y `alignment_heads` mantenidos en precision completa (FP16, salvo `alignment_heads` en I64). El decoder de 2 capas reduce el coste de decodificacion autoregresiva, y la cuantizacion de 8 bits sobre memoria unificada permite residencia compacta en Apple Silicon Metal. No se documenta decodificacion especulativa ni atencion lineal.

## Capacidades

- Transcripcion de audio a texto en polaco (`automatic-speech-recognition`, `language="pl"`).
- Dictado local de baja latencia sobre Apple Silicon (M1/M2/M3/M4) con backend Metal.
- Transcripcion por lotes de audio con `LibraxisAI/mlx-batch-server`.
- Integracion con `x9stt` / `codescribe-whisper-validate` del proyecto `vetcoders/x9bus`, con VAD de Silero para control de silencios.
- Manejo de habla polaca continua y frases mixtas PL/EN, con adaptacion fonetica de terminos extranjeros a la ortografia polaca (limitacion documentada, no capacidad fiable).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo ASR puro.
- No soporta vision, audio generation ni modo thinking.
- Capacidad multilingue limitada: solo polaco adaptado; el ingles y otros idiomas no estan contemplados en el alcance previsto.

## Casos de uso

- Dictado de escritorio en macOS: el checkpoint de 854,6 MB cabe holgadamente en memoria unificada de un M1 de 8 GB y permite transcripcion en streaming con `mlx_whisper`, sin envio de audio a la nube.
- Transcripcion por lotes de reuniones y entrevistas en polaco: con `mlx-batch-server` y VAD de Silero se pueden procesar horas de audio en local, segmentando por silencios para evitar alucinaciones en tramos vacios.
- Voice-to-agent para asistentes locales: la latencia del decoder de 2 capas hace viable encadenar STT y un LLM local en el mismo equipo, manteniendo el audio dentro del dispositivo.
- Subtitulado de contenido audiovisual polaco: generacion de transcripciones con marcas temporales mediante `mlx_whisper`, revisables por un editor humano antes de publicacion.
- Evaluacion comparativa de ASR polaco: sirve como referencia cuantizada frente a `whisper-large-v3-turbo` y variantes Q4 en pruebas de calidad por logprob y transcripcion literal.
- Prototipado de pipelines de accesibilidad: dictado para personas con movilidad reducida en entornos macOS, con requisito de funcionamiento offline.
- Investigacion sobre cuantizacion MLX: permite medir el impacto de Q8 frente a Q4 en un mismo modelo destilado, con pesos y metadatos publicados.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K no aplican a ASR), pero si una evaluacion cualitativa propia medida con `x9stt` en Metal, decodificacion greedy, `language="pl"` y VAD de Silero activo, sin solapamiento con el audio de calibracion GPTQ:

| Checkpoint | Pesos | Capas decoder | Numerales aislados (5x "piec", logprob medio) | Extracto de habla polaca continua | Frase mixta PL/EN |
|---|---:|---:|---|---|---|
| `whisper-large-v3-turbo-mlx-q8` | 913,7 MB | 4 | `Piec piec piec piec piec` (-0,22) | `Zastanawiamy, czy juz sie udalo temu modelowi wejsc w role...` (-0,31) | `...pracuje z computer use.` |
| `distil-whisper-large-v3-pl-mlx-q8` | 854,6 MB | 2 | vacio en repeticion 5x | `Zastaniemie czy juz sie udalo temu modelowi wejsc w role i jest tutaj z n...` (-0,54) | `...pierwsza apikacja. przy ktorej sie pracuje z punktu` |
| `distil-whisper-large-v3-pl-mlx-GPTQ-Hessian-q4` | 480,6 MB | 2 | vacio en repeticion 5x | `Zastanawiamie, czy juz sie udalo temu modelowi wejsc w role i jest tutaj ...` (-0,50) | `...nie jest to pierwsza apikacja. I am` |

Los datos muestran que el Q8 destilado produce transcripciones con errores ortograficos en polaco (`Zastaniemie`, `apikacja`) y pierde por completo la repeticion de numerales aislados, mientras que `turbo` Q8 los transcribe correctamente. Los logprobs medios son mas negativos en el destilado (-0,54 frente a -0,31). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 854,6 MB de pesos Q8; con overhead de runtime MLX conviene reservar entre 1,5 y 2 GB de memoria unificada.
- Hardware objetivo: Apple Silicon M1, M2, M3 y M4 con backend Metal; no esta pensado para GPU NVIDIA ni AMD.
- Cabe en cualquier Mac Apple Silicon; en un M1 de 8 GB queda amplio margen para el resto del sistema.
- Opciones de despliegue: `mlx_whisper` (PyPI), `LibraxisAI/mlx-batch-server`, `vetcoders/x9bus` (`x9stt`). No compatible con `faster-whisper`/CTranslate2 ni `whisper.cpp` GGML por diferencias de layout de tensores.
- Inferencia alojada en Hugging Face deshabilitada (`inference: false`); despliegue exclusivamente local o autogestionado.
- Latencia y throughput estimados: no disponibles; la model card no publica cifras de RTF ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros / formato | Contexto | Rendimiento observado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LibraxisAI/distil-whisper-large-v3-pl-mlx-q8` | 854,6 MB MLX Q8, decoder 2 capas | no disponible | Numerales 5x: vacio; logprob -0,54 | MIT | HF, MLX |
| `LibraxisAI/whisper-large-v3-turbo-mlx-q8` | 913,7 MB MLX Q8, decoder 4 capas | no disponible | Numerales 5x: correcto (-0,22); logprob -0,31 | no disponible | HF, MLX |
| `LibraxisAI/distil-whisper-large-v3-pl-mlx-GPTQ-Hessian-q4` | 480,6 MB MLX Q4, decoder 2 capas | no disponible | Numerales 5x: vacio; logprob -0,50 | no disponible | HF, MLX |
| `Aspik101/distil-whisper-large-v3-pl` | 3,03 GB FP32 PyTorch, decoder 2 capas | no disponible | no disponible | no disponible | HF, PyTorch |

## Limitaciones y advertencias

- El propio autor documenta fallos de robustez: numerales aislados repetidos devuelven cadena vacia, y el habla polaca continua presenta errores ortograficos (`Zastaniemie`, `apikacja`).
- La mezcla PL/EN degrada: los terminos ingleses se adaptan foneticamente a ortografia polaca, con perdida de fidelidad (`I am` aparece en la variante Q4).
- Fuera de alcance para decisiones medicas, legales o de seguridad sin revision de experto.
- No utilizable en runtimes no MLX (`faster-whisper`, CTranslate2, `whisper.cpp`), lo que limita portabilidad a ecosistemas Apple.
- Especializado solo en polaco; la transcripcion multilingue no adaptada produce resultados degradados.
- Licencia MIT permite uso comercial, pero el modelo base upstream no detalla su procedencia de datos ni posibles sesgos de corpus; no se documentan sesgos especificos.
- Riesgo de alucinacion en tramos de silencio o audio ruidoso, mitigable con VAD de Silero como en la configuracion de prueba.
- Sin cifras publicadas de latencia, throughput ni WER sobre corpus estandar; la validacion disponible es cualitativa y de un solo evaluador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibraxisAI/distil-whisper-large-v3-pl-mlx-q8
- Modelo base upstream: https://huggingface.co/Aspik101/distil-whisper-large-v3-pl
- Variante companera Q4: https://huggingface.co/LibraxisAI/distil-whisper-large-v3-pl-mlx-GPTQ-Hessian-q4
- Variante comparada turbo Q8: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- Servidor de inferencia por lotes: https://github.com/LibraxisAI/mlx-batch-server
- Toolkit `x9bus` (incluye `x9stt` y `codescribe-whisper-validate`): https://github.com/vetcoders/x9bus
- Paquete `mlx-whisper`: https://pypi.org/project/mlx-whisper/
- Modelo original Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
