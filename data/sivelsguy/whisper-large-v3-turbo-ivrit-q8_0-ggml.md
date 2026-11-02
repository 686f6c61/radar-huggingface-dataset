# sivelsguy/whisper-large-v3-turbo-ivrit-q8_0-ggml

## Resumen

Este repositorio contiene una cuantización de 8 bits (Q8_0) del modelo Whisper large-v3-turbo ajustado para hebreo por ivrit.ai, empaquetada en formato GGML para su uso con whisper.cpp. El autor del repositorio, sivelsguy, no entrena ningún modelo nuevo: se limita a cuantizar los pesos originales con la herramienta `whisper-quantize` de whisper.cpp v1.9.5 y a publicar el resultado, reduciendo el tamaño de 1,6 GB a 874 MB. El objetivo es doble: facilitar la inferencia en hardware de Apple mediante Metal y servir de motor de transcripción a la aplicación macOS LearnBySpeaking.

El modelo subyacente es Whisper large-v3-turbo, una variante destilada de Whisper large-v3 en la que el decodificador pasa de 32 a 4 capas, lo que reduce los parámetros y acelera la inferencia manteniendo la calidad del codificador. Sobre esa base, ivrit.ai realizó un ajuste fino específico para hebreo, un idioma con poca representación en el corpus original de Whisper. Esta ficha describe la variante cuantizada, no el modelo original.

La relevancia de este artefacto es práctica: permite ejecutar un ASR de calidad para hebreo en un portátil sin GPU dedicada, con un único fichero de menos de 1 GB y una API de servidor local (`whisper-server`). Al estar publicado bajo Apache-2.0, es apto para integración comercial sin restricciones adicionales más allá de las del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo, decodificador de 4 capas) |
| Parametros totales | no disponible (el modelo turbo original ronda los 809 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (fichero `ggml-ivrit-large-v3-turbo-q8_0.bin`, 874 MB) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI para transcripción y traducción de voz a texto sobre pares audio-texto multitarea. La variante large-v3-turbo reduce el decodificador a 4 capas, lo que rebaja el coste de decodificación a cambio de una pérdida mínima de calidad en la mayoría de idiomas. El ajuste fino para hebreo lo realizó ivrit.ai sobre el checkpoint turbo, presumiblemente con corpus de voz en hebreo, aunque la información proporcionada no detalla el volumen de datos, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación de este repositorio concreto es la cuantización: se aplicó `whisper-quantize` de whisper.cpp v1.9.5 sobre el fichero `ggml-model.bin` original para producir pesos Q8_0. El autor afirma que las transcripciones son idénticas en sus frases de prueba, lo que es plausible con cuantización de 8 bits en un modelo de este tamaño, pero no constituye una evaluación sistemática. El resultado es un binario autocontenido, pensado para ejecutarse con la ruta Metal de whisper.cpp.

## Capacidades

- Transcripción de voz a texto en hebreo, con detección de actividad de voz y segmentación automática por parte de whisper.cpp.
- Traducción de voz a texto (capacidad heredada de Whisper), aunque el ajuste fino está orientado a transcripción en hebreo y la calidad de traducción no está documentada.
- Generación de marcas de tiempo a nivel de segmento y, opcionalmente, de palabra, según los parámetros de whisper.cpp.
- Funcionamiento offline: no requiere conexión de red ni servicios externos.
- Integración como servidor HTTP local mediante `whisper-server`, con parámetros de idioma, beam size y best-of.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente de ASR.
- No soporta visión, audio de entrada más allá del audio, ni modo thinking.

## Casos de uso

- Transcripción de reuniones en hebreo en local: el fichero de 874 MB cabe en un portátil y permite procesar audio sin enviar datos a la nube, algo crítico para entornos con requisitos de privacidad.
- Subtitulado de vídeo: `whisper.cpp` genera marcas de tiempo por segmento que se pueden convertir directamente a SRT o VTT para plataformas de contenido en hebreo.
- Aplicaciones de accesibilidad: dictado por voz en hebreo en herramientas de escritorio, con latencia baja gracias al decodificador reducido del modelo turbo.
- Integración en apps macOS: es exactamente el caso de uso declarado por el autor, LearnBySpeaking, que consume el modelo vía `whisper-server` con Metal.
- Análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones en hebreo para su posterior indexación y búsqueda, ejecutable en CPU sin GPU dedicada.
- Investigación en ASR para hebreo: sirve como línea base cuantizada para comparar con modelos ajustados o para evaluar el impacto de Q8_0 frente a FP16 en un corpus propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona que las transcripciones son las mismas que con el modelo sin cuantizar en sus frases de prueba, sin cifras de WER, sin corpus de evaluación y sin comparación con otras variantes.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q8_0 ocupa 874 MB; la inferencia requiere aproximadamente 1-1,5 GB de memoria en total, dependiendo del tamaño del lote y de la longitud del audio.
- GPU recomendadas: cualquier GPU Apple Silicon con Metal (M1 o superior) es el objetivo declarado; en el ecosistema CUDA, whisper.cpp funciona con tarjetas de gama media, aunque no se han publicado cifras de rendimiento.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de memoria; también funciona en CPU sin GPU.
- Opciones de despliegue: whisper.cpp (CLI y `whisper-server`), con el binario GGML. No es compatible con vLLM, TGI ni Ollama, que no soportan este formato para ASR.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia ni comparativas frente a FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (ivrit Whisper turbo Q8_0) | no disponible | 30 s por segmento | he | Apache-2.0 | GGML Q8_0 |
| ivrit-ai/whisper-large-v3-turbo-ggml (base) | no disponible | 30 s por segmento | he | Apache-2.0 | GGML (sin cuantizar) |
| openai/whisper-large-v3-turbo | no disponible | 30 s por segmento | multilingüe | Apache-2.0 | safetensors, GGML |
| openai/whisper-large-v3 | no disponible | 30 s por segmento | multilingüe | Apache-2.0 | safetensors, GGML |

La comparación relevante es contra el modelo base de ivrit.ai sin cuantizar: misma calidad declarada, la mitad de tamaño en disco. Frente a Whisper large-v3-turbo original de OpenAI, la diferencia es el ajuste fino para hebreo, que debería mejorar el WER en ese idioma, aunque no hay cifras publicadas que lo cuantifiquen en esta información.

## Limitaciones y advertencias

- Sesgos: al estar ajustado exclusivamente para hebreo, el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente; no se debe usar como modelo multilingüe.
- Alucinación: Whisper es propenso a generar texto plausible en segmentos con silencio, ruido o música; conviene usar detección de actividad de voz y revisar las salidas en producción.
- Contexto: la ventana de audio es de 30 segundos por segmento; audios más largos requieren segmentación previa, que whisper.cpp realiza internamente pero puede perder coherencia entre segmentos.
- Licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base de ivrit.ai y, en última instancia, de OpenAI; conviene revisar la cadena completa de licencias antes de un despliegue comercial.
- Formato: al ser GGML, no es compatible con los stacks de inferencia habituales para LLM (vLLM, TGI); el ecosistema de herramientas es más reducido.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y una única confirmación subjetiva de calidad; no hay evaluación independiente.
- Fecha de creación: el repositorio figura creado el 2026-11-02, una fecha futura respecto a la redacción habitual de estas fichas; conviene verificar la integridad del artefacto con el SHA-256 publicado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sivelsguy/whisper-large-v3-turbo-ivrit-q8_0-ggml
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo-ggml
- ivrit.ai: https://www.ivrit.ai
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Whisper large-v3-turbo (OpenAI): https://huggingface.co/openai/whisper-large-v3-turbo
