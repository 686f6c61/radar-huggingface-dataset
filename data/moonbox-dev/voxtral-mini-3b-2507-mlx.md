# moonbox-dev/Voxtral-Mini-3B-2507-MLX

## Resumen

Voxtral Mini 3B MLX es una conversión al formato MLX del modelo Voxtral Mini 3B de Mistral AI, publicada por moonbox-dev para su ejecución nativa en Macs con Apple Silicon. Voxtral Mini 3B es un modelo multimodal de audio y texto diseñado para reconocimiento automático del habla (ASR) y comprensión de audio, que combina un codificador de audio con un modelo de lenguaje de 3 mil millones de parámetros. Esta conversión no introduce cambios en los pesos ni en el comportamiento: reproduce fielmente el modelo original en precisiones bf16, fp16 y 8 bits.

El interés de esta ficha radica en que permite desplegar Voxtral en hardware Apple sin depender de CUDA ni de PyTorch, usando la librería mlx-audio. El autor verifica que la transcripción resultante es idéntica a la del modelo original y que la tasa de error de palabra (WER) se mantiene en 1,15 %, exactamente el mismo valor que el modelo de referencia.

La relevancia actual es doble: por un lado, Voxtral Mini 3B es una de las apuestas recientes de Mistral por el audio como modalidad de primera clase; por otro, esta conversión demuestra que es viable ejecutar ASR de calidad en portátiles Apple Silicon con un consumo de memoria moderado y sin infraestructura dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal audio-texto; codificador de audio + LLM de 3B, según el modelo base) |
| Parámetros totales | 3B (según el nombre y el modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, fp16, 8 bits (carpetas separadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con config.json, params.json, tekken.json y preprocessor_config.json |

## Arquitectura y entrenamiento

El modelo base Voxtral Mini 3B combina un encoder de audio con un modelo de lenguaje de 3B parámetros, siguiendo el patrón de los modelos audio-LLM contemporáneos. El tokenizador es Tekken (tekken.json, 14,9 MB), el tokenizador propietario de Mistral. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens de audio o texto, ni si hubo fases de RLHF o DPO; estos datos corresponden a la model card del modelo original, que no se ha incluido en la información proporcionada.

Esta conversión concreta no modifica la arquitectura: el autor solo convierte los pesos a MLX y conserva el resto del pipeline (preprocesador de audio, tokenizador y configuración de generación) desde el repositorio original de Mistral. Se ofrecen tres precisiones con huellas sha256 verificables y se documenta que las transcripciones producidas son idénticas a las del modelo PyTorch original en las pruebas realizadas.

## Capacidades

- Reconocimiento automático del habla (ASR) con salida de transcripciones, validado con un WER de 1,15 % en el conjunto de prueba del autor.
- Comprensión de audio: el modelo base está etiquetado como audio-understanding, por lo que puede responder preguntas sobre contenido hablado.
- Procesamiento de audio y texto de forma conjunta (multimodal), heredado del modelo base.
- Ejecución nativa en Apple Silicon mediante MLX y la librería mlx-audio.
- Compatibilidad con el pipeline `automatic-speech-recognition` de Hugging Face.
- No se dispone de información sobre tool calling, agentes, modo thinking, visión, audio en streaming ni capacidades multilingües específicas en la documentación proporcionada.

## Casos de uso

- Transcripción de reuniones en local: el modelo puede procesar audio de reuniones y generar actas en un Mac con Apple Silicon, sin enviar datos a servicios en la nube, lo que resulta adecuado por su licencia Apache 2.0 y su ejecución offline.
- Subtitulado de vídeo: integrado en un pipeline de edición, permite generar subtítulos automáticos para contenido audiovisual usando la precisión 8 bits para reducir el uso de memoria.
- Dictado por voz en herramientas de productividad: al ejecutarse en MLX sobre un portátil, puede alimentar funciones de dictado en editores de texto o IDEs con latencia local y sin dependencia de red.
- Análisis de llamadas de atención al cliente: el modelo puede transcribir grabaciones y, gracias a su componente de comprensión de audio, responder preguntas sobre lo dicho en la llamada para su clasificación o resumen.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos donde no se permite usar servicios cloud por motivos de privacidad.
- Investigación en ASR: al ofrecer pesos en bf16, fp16 y 8 bits con verificación de equivalencia respecto al original, sirve como base reproducible para experimentos de evaluación y comparación de precisiones en hardware Apple.
- Procesamiento por lotes de archivos de audio: con la versión 8 bits (5,57 GB en total) se pueden transcribir lotes de grabaciones en un Mac Studio o MacBook Pro de gama alta sin GPU dedicada.

## Benchmarks y rendimiento

| Métrica | Voxtral Mini 3B MLX (bf16/fp16/8bit) | Voxtral Mini 3B original (PyTorch) |
|---|---|---|
| WER | 1,15 % | 1,15 % |
| Transcripciones | Idénticas al original | Referencia |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este modelo. Los únicos datos verificables son los de equivalencia funcional con el modelo original en la tarea de ASR.

## Requisitos de hardware

- VRAM/memoria unificada estimada: bf16 y fp16 requieren aproximadamente 9,35 GB de pesos (5,36 GB + 3,99 GB) más el overhead del runtime; la versión 8 bits ocupa unos 5,57 GB.
- Hardware objetivo: Macs con Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPU NVIDIA ni para CPU x86.
- Cabe en GPUs de consumo Apple: un MacBook Air o Pro con 16 GB de memoria unificada puede ejecutar la versión 8 bits; para bf16/fp16 se recomienda 24 GB o más para evitar swapping.
- Despliegue: librería mlx-audio (MLX). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Voxtral Mini 3B MLX (esta ficha) | 3B | no disponible | Apache 2.0 | Hugging Face, MLX | Conversión comunitaria para Apple Silicon |
| Voxtral Mini 3B (mistralai) | 3B | no disponible | Apache 2.0 | Hugging Face, PyTorch | Modelo original de referencia |
| Whisper large-v3 | 1,55B | 30 s de audio por ventana | MIT | Hugging Face, múltiples runtimes | ASR puro, sin comprensión de audio |
| Qwen2-Audio | 7B | no disponible | Apache 2.0 (según versión) | Hugging Face | Audio-LLM de mayor tamaño |

La comparación con Whisper y Qwen2-Audio se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que no se afirma superioridad en ninguna métrica.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon mediante MLX; no es portable a CUDA, ROCm ni CPU sin reconversión.
- El repositorio ocupa 32,4 GB porque incluye tres precisiones; es necesario descargar solo la carpeta de la precisión deseada y mantener juntos todos los archivos de esa carpeta.
- La verificación de equivalencia se limita a un conjunto de prueba propio del autor (WER 1,15 %); no sustituye una evaluación independiente.
- No se documentan sesgos, idiomas soportados ni tasas de alucinación específicas en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia y las condiciones del modelo base original de Mistral.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia.
- No se dispone de información sobre robustez ante ruido, acentos o audio de baja calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Voxtral-Mini-3B-2507-MLX
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Paper de referencia (arXiv:2507.13264): https://arxiv.org/abs/2507.13264
- Librería mlx-audio: no disponible en la información proporcionada
- Blog o demo oficial de Mistral: no disponible en la información proporcionada
