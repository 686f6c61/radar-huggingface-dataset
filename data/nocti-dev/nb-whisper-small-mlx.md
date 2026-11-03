# Nocti-Dev/nb-whisper-small-mlx

## Resumen

nb-whisper-small-mlx es una conversion al formato MLX del modelo de reconocimiento automatico del habla NbAiLab/nb-whisper-small, desarrollado originalmente por el National Library of Norway (NbAiLab) como un fine-tuning de Whisper small de OpenAI para noruego. Esta version la publica el usuario Nocti-Dev mediante Prism, una herramienta de conversion de pesos de HuggingFace a MLX, y esta pensada para ejecutarse de forma nativa en hardware Apple Silicon (chips M-series) a traves del framework MLX.

El modelo resuelve la transcripcion de audio a texto en noruego con un tamano compacto: 241.734.912 parametros (aproximadamente 242 millones) en precision float16, lo que se traduce en un fichero de pesos de unos 483 MB. Al ser una conversion 1:1 del modelo original, conserva la arquitectura encoder-decoder transformer de Whisper small, con 12 capas de encoder y 12 de decoder, y una ventana de contexto de audio de 30 segundos por segmento.

Su relevancia es practica: permite desplegar un ASR especializado en noruego en Macs sin depender de CUDA ni de servidores remotos, con la promesa de inferencia offline (el repositorio es autocontenido: pesos, config y tokenizer incluidos). La licencia Apache 2.0 facilita su uso comercial. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y el pipeline de conversion es reciente, por lo que su madurez en produccion esta por validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (encoder-decoder transformer) convertido a MLX |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s; el contexto textual no aplica) |
| Tipos de cuantizacion | ninguna en este repo (dtype float16); no se listan variantes cuantizadas |
| Idiomas soportados | no disponible en la model card; el modelo base esta especializado en noruego |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 483.525.080 bytes), formato MLX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder con atencion por multiples cabezas, disenado para recibir espectrogramas Mel de audio y generar tokens de texto. El modelo original de NbAiLab se obtiene mediante fine-tuning de Whisper small sobre datos de habla noruega, aunque la model card de esta conversion no detalla el volumen de datos, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO (no disponible).

La innovacion de este repositorio no esta en el entrenamiento, sino en la conversion: se ha generado con Prism (receta `whisper-hf` v1) usando prism-worker 0.1.0, Python 3.14.10, mlx 0.32.4, numpy 2.5.4, huggingface_hub 2.3.0, hf-xet 1.7.0, torch 2.14.1 y transformers 5.21.0, con un lockfile de worker identificado por el sha256 `6f31327071399b5c`. El commit de origen es `e9bb5cb83cb74c96239fd506163aa97cff2fce4c` de NbAiLab/nb-whisper-small. El autor documenta un smoke test comparativo entre el modelo sin convertir y la conversion MLX sobre un clip corto en noruego, con una tasa de error de palabras (WER) de 0,00 entre ambos (umbral maximo aceptado 0,10), lo que indica una fidelidad practicamente exacta de la conversion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en noruego, con salida de transcripcion de texto.
- Conversion de audio a texto por ventanas de 30 segundos, segun el diseno estandar de Whisper.
- Inferencia offline: el repositorio incluye pesos, configuracion y tokenizer, por lo que no requiere descargas adicionales.
- Ejecucion nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Capacidad multilingue: no disponible; el modelo base esta especializado en noruego y la model card no declara lista de idiomas.
- Tool calling / function calling: no disponible (no es una capacidad propia de un modelo ASR).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio mas alla de la transcripcion: no disponible.

## Casos de uso

- Transcripcion de reuniones y entrevistas en noruego: el modelo puede procesar audio en segmentos de 30 segundos y generar actas o transcripciones en local sobre un Mac, sin enviar datos sensibles a la nube.
- Subtitulado de contenido audiovisual noruego: integrable en un pipeline que extraiga audio, lo segmente y genere subtitulos con marcas temporales a partir de la salida del decoder.
- Prototipado rapido en desarrollo de aplicaciones de voz: al ser un modelo de 242 millones de parametros en float16, cabe en memoria unificada de un Mac moderno y permite iterar sin infraestructura GPU dedicada.
- Investigacion en ASR de bajo recurso: sirve como punto de partida para experimentos de fine-tuning o evaluacion de tecnicas de adaptacion al noruego, con la ventaja de la licencia Apache 2.0.
- Archivado y busqueda de audio en bibliotecas digitales: transcripcion masiva de fondos sonoros noruegos para indexacion y busqueda textual, un caso alineado con el origen del modelo (National Library of Norway).
- Asistentes de voz locales para entornos con requisitos de privacidad: al ejecutarse offline en hardware Apple, puede integrarse en aplicaciones de escritorio que transcriban dictado o notas de voz sin conexion.
- Evaluacion comparativa de conversiones MLX: util para equipos que quieran medir la fidelidad de Prism frente a la inferencia con transformers/torch, dado que el autor publica el smoke test y los hashes de los ficheros.

## Benchmarks y rendimiento

La model card solo reporta el smoke test de fidelidad de la conversion, no benchmarks estandar de ASR:

| Metrica | Valor |
|---|---|
| WER conversion MLX vs modelo sin convertir | 0,00 (veredicto: pasado, maximo 0,10) |
| WER conversion MLX vs guion de referencia | 0,49 |
| WER modelo sin convertir vs guion de referencia | 0,49 |

No se han publicado resultados de benchmarks estandar (por ejemplo, FLEURS, Common Voice o MLS) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 242 millones de parametros en float16, los pesos ocupan aproximadamente 483 MB; con overhead de activaciones y cache, el consumo se situa en el orden de 1-2 GB de memoria unificada, aunque no se dispone de mediciones oficiales (no disponible).
- GPU recomendadas: el modelo esta disenado para MLX, por lo que el hardware objetivo son chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se documenta soporte para A100, H100 ni RTX 4090 en este repositorio.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon; en GPUs NVIDIA no aplica directamente al ser un formato MLX.
- Opciones de despliegue: MLX (libreria mlx), mlx-audio-swift (usada en el smoke test, version `dbe5eaa`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nb-whisper-small-mlx (este) | 241,7 M | ventanas de 30 s | noruego (base) | apache-2.0 | safetensors MLX |
| NbAiLab/nb-whisper-small (original) | no disponible en la informacion | ventanas de 30 s | noruego | apache-2.0 | safetensors (transformers) |
| Whisper small de OpenAI | no disponible en la informacion | ventanas de 30 s | multilingue | MIT (segun el modelo original de OpenAI; no confirmado en esta fuente) | safetensors, GGUF (comunidad) |

La comparativa se limita a estos tres porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones detalladas de alternativas. El modelo original y esta conversion comparten pesos y licencia; la diferencia es el formato y el runtime (MLX frente a transformers/torch). Frente a Whisper small de OpenAI, la ventaja de nb-whisper-small es la especializacion en noruego, aunque no se dispone de cifras comparativas de WER en la informacion disponible.

## Limitaciones y advertencias

- Modelo especializado en noruego: no se declara lista de idiomas y el rendimiento en otras lenguas no esta documentado; usarlo fuera del noruego puede degradar gravemente la transcripcion.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio de baja calidad; el smoke test muestra una WER de 0,49 frente al guion, lo que refleja errores en el clip de prueba.
- Ventana de audio limitada: Whisper procesa segmentos de 30 segundos; audios largos requieren segmentacion externa y pueden perder coherencia entre fragmentos.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia (2026-11-03), sin validacion comunitaria.
- Dependencia de MLX y Apple Silicon: el formato no es portable a GPUs NVIDIA ni a entornos CUDA; para otros hardwares habria que usar el modelo original.
- Sin cuantizacion: solo se ofrece float16; no hay variantes de 8 o 4 bits en este repositorio, lo que limita el ahorro de memoria en equipos con poca RAM unificada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base NbAiLab/nb-whisper-small y de los datos de entrenamiento originales, no detallados en esta ficha.
- Sin garantias de produccion: al ser una conversion reciente sin benchmarks estandar, se recomienda validar con un conjunto propio antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nocti-Dev/nb-whisper-small-mlx
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-small
- Commit de origen del modelo base: https://huggingface.co/NbAiLab/nb-whisper-small/tree/e9bb5cb83cb74c96239fd506163aa97cff2fce4c
- Framework MLX: https://github.com/ml-explore/mlx
- mlx-audio-swift (usado en el smoke test, referencia `dbe5eaa`): no disponible como enlace en la informacion proporcionada
- Prism (herramienta de conversion): no disponible como enlace en la informacion proporcionada
