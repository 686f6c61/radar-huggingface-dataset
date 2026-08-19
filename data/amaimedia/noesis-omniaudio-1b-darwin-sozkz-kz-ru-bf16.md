# AMAImedia/NOESIS-OmniAudio-1B-Darwin-Sozkz-KZ-RU-BF16

## Resumen

NOESIS-OmniAudio-1B-Darwin-Sozkz-KZ-RU-BF16 es un modelo de reconocimiento automático de voz (ASR) especializado en kazajo y ruso, publicado por AMAImedia como parte de la plataforma NOESIS Professional Multilingual Dubbing Automation Platform. Se trata de una fusión ponderada (weighted average) de dos modelos base de la familia OmniAudio-1B: un especialista en kazajo (con peso 0.65) y un generalista kazajo-ruso (con peso 0.35). El resultado es un modelo de aproximadamente 358,6 millones de parámetros con arquitectura OmniAudio (encoder de 1024 dimensiones ocultas), diseñado para reforzar el dominio del kazajo en tareas de transcripción y doblaje automatizado.

El modelo se enmarca en el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators) y su función declarada es servir como "teacher" para destilación de conocimiento hacia un futuro modelo ASR-10B. Su relevancia radica en la cobertura de una lengua de bajos recursos como el kazajo, combinada con el ruso, en un formato compacto que facilita su despliegue. Publicado bajo licencia Apache 2.0, está disponible en formato safetensors (aunque la model card menciona PyTorch) y su repositorio ocupa 0.7 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniAudio (encoder hidden=1024) |
| Parametros totales | 358.618.193 (~358,6M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (modelo ASR, sin ventana de contexto textual especificada) |
| Tipos de cuantizacion | no disponible (repo en BF16, sin cuantizaciones publicadas) |
| Idiomas soportados | Kazajo (kk), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tags de HuggingFace); la model card indica PyTorch (model.pt) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión por promedio ponderado de dos checkpoints de la familia OmniAudio-1B: `sozkz-omniaudio-1b-kk-asr` (checkpoint 125000, peso 0.65) y `sozkz-omniaudio-asr-1b-kkru` (checkpoint 150000, peso 0.35). La arquitectura OmniAudio emplea un encoder con 1024 unidades ocultas, orientado a tareas de reconocimiento de voz. No se proporcionan detalles sobre el dataset de entrenamiento de los modelos base ni sobre el proceso de fusión más allá del método de promedio ponderado. El mayor peso asignado al especialista en kazajo responde a la política de refuerzo de dominio KK×10 de la plataforma NOESIS. El modelo no ha sido entrenado desde cero, sino que combina pesos ya entrenados, por lo que sus capacidades dependen enteramente de los modelos fuente.

## Capacidades

- Reconocimiento automático de voz (ASR) en kazajo y ruso, con énfasis en kazajo.
- Transcripción de audio a texto en los dos idiomas soportados.
- Especialización en kazajo gracias al mayor peso del modelo especialista (0.65).
- Forma parte de un pipeline de doblaje automatizado, lo que implica integración con sistemas de síntesis de voz y traducción.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-paso; es un modelo ASR puro.

## Casos de uso

- Transcripción de reuniones y conferencias en kazajo y ruso: el modelo puede procesar audio en tiempo real o diferido, generando texto transcrito en ambos idiomas, útil para actas y documentación.
- Subtitulado automático de vídeos: adecuado para plataformas de contenido en kazajo y ruso, donde la transcripción precisa es necesaria para generar subtítulos sincronizados.
- Doblaje automatizado de contenido audiovisual: integrado en la plataforma NOESIS, el modelo actúa como paso de reconocimiento de voz para posterior traducción y síntesis de voz en otros idiomas.
- Asistentes de voz para aplicaciones móviles y domésticas en kazajo: su tamaño compacto (~358M parámetros) permite ejecutarlo en dispositivos con recursos limitados.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos históricos en kazajo y ruso para indexación y recuperación de información.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en entornos donde se hablan estos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, WER (Word Error Rate) u otras métricas de ASR para este modelo ni para sus modelos base en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: con ~358,6M parámetros en BF16, el modelo ocupa aproximadamente 0.7 GB en memoria (coincide con el tamaño del repositorio). Para inferencia, se estima un consumo de entre 1 y 2 GB de VRAM, dependiendo de la longitud del audio procesado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sería suficiente, como NVIDIA GTX 1650, RTX 3060 o superiores. También es viable en GPUs integradas modernas con soporte para inferencia FP16/BF16.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de gama media y baja.
- Opciones de despliegue: no se especifican herramientas concretas en la documentación, pero al ser un modelo ASR basado en PyTorch/safetensors, podría desplegarse con frameworks como Hugging Face Transformers, TorchServe, o exportarse a ONNX para inferencia optimizada. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo de ~358M parámetros, se espera una latencia baja en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos ASR para kazajo y ruso. Modelos como Whisper (OpenAI) soportan kazajo y ruso, pero no se han publicado comparaciones de rendimiento con este modelo. Tampoco hay datos de otros modelos de la familia OmniAudio-1B más allá de los dos utilizados como base. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo de fusión, no entrenado desde cero; sus capacidades están limitadas por los modelos base y podrían heredar sesgos o errores de estos.
- Solo cubre kazajo y ruso; no soporta otros idiomas.
- No se proporcionan métricas de rendimiento (WER, etc.), por lo que su precisión en producción es incierta.
- La documentación menciona que actúa como "teacher" para destilación, lo que sugiere que su uso principal es interno, no necesariamente como producto final.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías implícitas de soporte o mantenimiento.
- El repositorio tiene 0 descargas y 2 likes, lo que indica que es un modelo reciente y poco probado por la comunidad.
- No hay información sobre sesgos específicos, alucinaciones en transcripción o comportamiento ante ruido o acentos, por lo que se recomienda validar en datos propios antes de usar en producción.

## Enlaces

- HuggingFace: https://huggingface.co/AMAImedia/NOESIS-OmniAudio-1B-Darwin-Sozkz-KZ-RU-BF16
- Organización AMAImedia: https://www.amaimedia.com
- X (Twitter): https://x.com/AMAImediacom
- LinkedIn (Ilia Bolotnikov): https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/djbionicl
- Modelo base 1: https://huggingface.co/sozkz/sozkz-omniaudio-1b-kk-asr
- Modelo base 2: https://huggingface.co/sozkz/sozkz-omniaudio-asr-1b-kkru
