# Nocti-Dev/nb-whisper-large-mlx

## Resumen

nb-whisper-large-mlx es una conversión al formato MLX del modelo de reconocimiento automático del habla (ASR) NbAiLab/nb-whisper-large, desarrollado originalmente por el National Library of Norway (NbAiLab) como un fine-tuning de Whisper large de OpenAI orientado a lenguas escandinavas, con especial énfasis en noruego. Esta versión ha sido producida por Nocti-Dev mediante la herramienta Prism (receta `whisper-hf` v1) y publicada como repositorio autocontenido: incluye pesos, configuración y tokenizer en el mismo paquete, de modo que puede cargarse sin conexión.

El modelo conserva la arquitectura encoder-decoder transformer de Whisper large, con 1.543.490.560 parámetros totales y pesos en `float16` sin cuantización. La conversión a MLX permite ejecutar la inferencia de forma nativa en hardware Apple Silicon (familia M), lo que resulta relevante para desarrolladores que necesitan transcripción local de audio sin depender de CUDA ni de servicios en la nube.

La relevancia actual de este modelo es acotada pero concreta: cubre el nicho de ASR escandinavo de alta calidad sobre MLX, un ecosistema con oferta todavía limitada de modelos de voz convertidos y verificados. El autor documenta una prueba de humo (smoke test) comparando la transcripción del modelo convertido frente al original, con una tasa de error de palabras (WER) de 0,00 entre ambos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper large admite ventanas de audio de 30 s) |
| Tipos de cuantizacion | ninguna en el repo publicado (`float16`) |
| Idiomas soportados | no disponible en la informacion proporcionada (modelo base orientado a noruego y lenguas escandinavas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), `float16` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large: un encoder que procesa espectrogramas mel de audio en ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto, con atención multi-cabeza estándar. El modelo original NbAiLab/nb-whisper-large es un fine-tuning del checkpoint Whisper large de OpenAI sobre datos de habla noruega y escandinava; los detalles exactos del dataset, el número de tokens de audio y si hubo etapas de RLHF o DPO no están disponibles en la información proporcionada.

La contribución de esta ficha no es el entrenamiento sino la conversión de formato: Nocti-Dev ha transformado los pesos de PyTorch/Transformers al formato MLX mediante la receta `whisper-hf` v1 de Prism, con `dtype` `float16` y sin cuantización. El proceso se ejecutó con prism-worker 0.1.0 sobre Python 3.14.10, mlx 0.32.4, torch 2.14.1 y transformers 5.21.0, y el repositorio incluye un `prism.json` con la procedencia completa. La validación consiste en una prueba de humo sobre un clip corto en noruego: la transcripción del modelo convertido coincide con la del original (WER 0,00) y ambos difieren del guion de referencia en 0,46, diferencia atribuible al propio modelo base.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante la pipeline `automatic-speech-recognition`.
- Transcripción de audio en noruego y, por herencia del modelo base, previsiblemente en otras lenguas escandinavas; la lista exacta de idiomas no está disponible.
- Ejecución nativa en Apple Silicon a través de MLX, con pesos en `float16`.
- Carga totalmente offline: pesos, configuración y tokenizer incluidos en el repositorio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio más allá de la transcripción ASR.
- No se documenta modo de razonamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Transcripción local en macOS: el modelo se ejecuta sobre MLX en equipos Apple Silicon, lo que permite transcribir audio sin enviar datos a servicios externos y sin GPU NVIDIA.
- Subtitulado de contenido en noruego: dado que el modelo base está especializado en habla noruega, es adecuado para generar subtítulos de vídeos, podcasts o reuniones en esa lengua.
- Investigación en ASR escandinavo: sirve como referencia reproducible para comparar el comportamiento del modelo original frente a la conversión MLX en experimentos controlados.
- Prototipado rápido en el ecosistema MLX: al ser autocontenido y cargar offline, reduce la fricción para integrar ASR en aplicaciones Swift/Python sobre Apple Silicon (el autor cita mlx-audio-swift en la validación).
- Archivística y preservación digital: el origen del modelo base (National Library of Norway) encaja con la transcripción de material audiovisual en noruego para su catalogación.
- Evaluación de pipelines de conversión: el repositorio documenta hashes, versiones de dependencias y un smoke test, por lo que es útil como caso de estudio de conversiones Prism verificadas.
- Transcripción de reuniones y notas de voz en entornos con requisitos de privacidad, siempre que el audio esté en noruego o lenguas cubiertas por el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación es la prueba de humo del autor sobre un clip corto en noruego:

| Metrica | Valor |
|---|---:|
| WER convertido vs original (veredicto) | 0,00 |
| WER convertido vs guion | 0,46 |
| WER original vs guion | 0,46 |

## Requisitos de hardware

- VRAM/unified memory estimada: los pesos en `float16` ocupan aproximadamente 3,1 GB; se recomienda reservar al menos 4-6 GB de memoria unificada para margen de activaciones y buffers de audio.
- Hardware objetivo: Apple Silicon (familia M) con MLX; no está pensado para GPU NVIDIA ni para CPU x86 en su formato actual.
- Cabe en equipos consumer Apple: previsiblemente en cualquier Mac con 8 GB o más de memoria unificada, aunque no se han publicado mediciones oficiales.
- Opciones de despliegue: MLX (librería `mlx`), con integración citada en `mlx-audio-swift`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo ASR y no un LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nocti-Dev/nb-whisper-large-mlx | 1.543.490.560 | ventanas de audio de 30 s (Whisper large); MLX `float16` | Apache 2.0 | HuggingFace, 0 descargas |
| NbAiLab/nb-whisper-large | no disponible en la informacion proporcionada | Whisper large; PyTorch/Transformers | Apache 2.0 | HuggingFace (modelo base) |
| OpenAI Whisper large | no disponible en la informacion proporcionada | Whisper large; PyTorch | MIT (según el original) | HuggingFace / OpenAI |

La comparación relevante es contra el propio modelo base: esta conversión no altera la calidad (WER 0,00 en la prueba de humo) y añade compatibilidad con MLX a costa de quedar restringida al ecosistema Apple. Frente a Whisper large de OpenAI, el modelo base de NbAiLab está especializado en noruego, por lo que se espera mejor rendimiento en esa lengua y peor cobertura multilingüe general, aunque no se aportan cifras comparativas.

## Limitaciones y advertencias

- Modelo especializado en ASR: no es un LLM y no debe emplearse para generación de texto, código, razonamiento ni agentes.
- Cobertura lingüística limitada: el modelo base está orientado a noruego y lenguas escandinavas; la lista exacta de idiomas no está documentada en esta ficha.
- Restricción de plataforma: los pesos MLX no se ejecutan de forma nativa en GPU NVIDIA ni en CPU x86 sin conversión adicional.
- Sin cuantización publicada: solo se ofrece `float16`, lo que limita las opciones de optimización de memoria.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar repeticiones o texto inventado en audio con ruido, silencios largos o habla no cubierta; el propio smoke test muestra repeticiones en el guion de referencia.
- Sesgos: no documentados en la información proporcionada; heredados previsiblemente del corpus de entrenamiento del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base NbAiLab/nb-whisper-large y del Whisper original de OpenAI.
- Madurez: repositorio con 0 descargas y 0 likes, publicado en noviembre de 2026; sin validación comunitaria ni benchmarks independientes.
- Sin garantías de producción: la única validación es un smoke test de un clip corto, no una evaluación sistemática.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nocti-Dev/nb-whisper-large-mlx
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-large
- Commit del modelo base: https://huggingface.co/NbAiLab/nb-whisper-large/tree/8c6249fdeeb4dcd05e5735a4c39640607eb6e4ac
- Librería MLX: https://github.com/ml-explore/mlx
- Integración citada en la validación: mlx-audio-swift (repositorio no enlazado en la información proporcionada)
- Herramienta Prism: no disponible enlace en la información proporcionada
