# Nocti-Dev/nb-whisper-medium-mlx

## Resumen

`Nocti-Dev/nb-whisper-medium-mlx` es una conversión al formato MLX del modelo `NbAiLab/nb-whisper-medium`, un Whisper medium afinado por el National Library of Norway (NB AI Lab) para reconocimiento automático del habla en noruego. La conversión la firma el usuario Nocti-Dev mediante la herramienta Prism, que aplica la receta `whisper-hf` v1 y produce un repositorio autocontenido: pesos, configuración y tokenizer están incluidos, de modo que el modelo carga sin conexión.

El modelo resuelve la transcripción de audio a texto (ASR) con un foco claro en noruego, heredado del fine-tuning del modelo base. Se trata de una conversión de formato, no de un reentrenamiento: la arquitectura, los pesos y el comportamiento son los de `NbAiLab/nb-whisper-medium`, empaquetados para ejecutarse con la librería MLX de Apple (Apple Silicon). El repositorio ocupa 1,5 GB y los pesos están en `float16` sin cuantización.

Su relevancia actual es acotada pero específica: permite ejecutar un Whisper medium especializado en noruego de forma nativa en hardware Apple Silicon mediante MLX, con verificación de equivalencia frente al modelo original (word error rate de 0,00 entre la conversión y el original en una prueba corta). Es una pieza útil para desarrolladores que despliegan ASR en macOS o en equipos con chip M-series y necesitan noruego de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR) |
| Parámetros totales | 763.857.920 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper: 30 s por segmento; dato no confirmado en la información proporcionada) |
| Tipos de cuantización | ninguna (pesos en `float16`) |
| Idiomas soportados | no disponible formalmente; el modelo base está orientado al noruego |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), formato MLX |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium: un transformer encoder-decoder con atención estándar, diseñado para transcribir audio en segmentos de 30 segundos. Esta ficha describe una conversión de formato, no un modelo nuevo: los pesos provienen de `NbAiLab/nb-whisper-medium` en el commit `0ed074d5985bd56ca4140159a9dbffbc3fb5117e`, y la conversión se realizó con la receta `whisper-hf` v1 de Prism, en `float16` y sin cuantización.

No se dispone de información sobre el dataset de entrenamiento del modelo base en la información proporcionada (número de tokens de audio, composición, ni si hubo RLHF/DPO). La conversión incluye un smoke test que compara la transcripción del modelo convertido con la del original sobre un clip corto en noruego: ambos obtienen el mismo texto (WER 0,00 entre ellos) y un WER de 0,49 frente al guion de referencia. El repositorio incluye `prism.json` con la procedencia completa y el entorno del worker (prism-worker 0.1.0, mlx 0.32.4, transformers 5.21.0, entre otras versiones).

## Capacidades

- Reconocimiento automático del habla (audio a texto) para noruego, heredado del fine-tuning de NB AI Lab.
- Transcripción de audio en segmentos de 30 segundos, propio de la arquitectura Whisper.
- Carga offline: pesos, configuración y tokenizer incluidos en el repositorio.
- Ejecución nativa en Apple Silicon mediante MLX (`library_name: mlx`).
- Equivalencia verificada con el modelo original en la prueba de humo incluida.
- No se documentan capacidades de traducción, diarización, timestamps por palabra ni tool calling en la información proporcionada.

## Casos de uso

- Transcripción de audio en noruego en aplicaciones macOS o iOS: el modelo se ejecuta con MLX de forma nativa en Apple Silicon, lo que permite integrar ASR local sin depender de servicios en la nube.
- Subtitulado de reuniones y entrevistas en noruego: la arquitectura Whisper procesa segmentos de 30 segundos, adecuada para transcripciones de audio conversacional de duración media.
- Procesamiento por lotes de archivos de audio en pipelines locales: al ser un repositorio autocontenido, se puede desplegar en entornos sin conexión y ejecutar sobre lotes de ficheros.
- Prototipado de asistentes de voz en noruego sobre hardware Apple: el tamaño de 763 M parámetros y los pesos en `float16` facilitan pruebas en equipos de desarrollo con chip M-series.
- Investigación en ASR para lenguas nórdicas: sirve como referencia de conversión MLX de un modelo especializado, con procedencia y hashes documentados.
- Validación de conversiones de formato: el smoke test incluido y la comparación de WER frente al original permiten usar el repositorio como ejemplo de verificación de equivalencia en pipelines de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento es el smoke test de la model card:

| Métrica | Valor |
|---|---:|
| WER convertido vs. no convertido (veredicto) | 0,00 |
| WER convertido vs. guion | 0,49 |
| WER no convertido vs. guion | 0,49 |

## Requisitos de hardware

- Pesos en `float16` de aproximadamente 1,5 GB, por lo que la VRAM/unified memory necesaria para inferencia es moderada (del orden de 2-4 GB incluyendo buffers, estimación no confirmada en la información proporcionada).
- Diseñado para Apple Silicon (MLX); no se documenta soporte para GPU NVIDIA en esta conversión.
- Cabe en equipos con chip M-series con memoria unificada de 8 GB o superior (estimación; no confirmado).
- Opciones de despliegue: MLX (librería nativa) y `mlx-audio-swift` (usado en el smoke test). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nocti-Dev/nb-whisper-medium-mlx | 763,8 M | no disponible | apache-2.0 | safetensors (MLX) | Conversión MLX de nb-whisper-medium, enfocada a noruego |
| NbAiLab/nb-whisper-medium | no disponible | no disponible | apache-2.0 | safetensors (transformers) | Modelo original del que deriva esta conversión |
| Whisper medium (OpenAI) | no disponible | no disponible | no disponible | no disponible | Modelo base de la familia; orientación multilingüe general |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: hereda los sesgos y limitaciones del modelo base `NbAiLab/nb-whisper-medium`.
- El foco idiomático es el noruego; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior al de un Whisper multilingüe general.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla solapada, comportamiento típico de la familia Whisper.
- El WER de 0,49 frente al guion en la prueba de humo indica que la transcripción difiere notablemente del texto de referencia en ese clip concreto; conviene validar con audio propio antes de producción.
- No se documenta cuantización; los pesos en `float16` requieren más memoria que una versión cuantizada.
- Compatibilidad limitada a MLX/Apple Silicon en esta conversión; para otros entornos conviene usar el modelo original.
- Licencia apache-2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nocti-Dev/nb-whisper-medium-mlx
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-medium
- Commit del modelo base: https://huggingface.co/NbAiLab/nb-whisper-medium/tree/0ed074d5985bd56ca4140159a9dbffbc3fb5117e
- Librería MLX: no disponible en la información proporcionada
- Herramienta Prism: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
