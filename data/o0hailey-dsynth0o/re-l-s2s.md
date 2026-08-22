# o0Hailey-DSynth0o/Re-L-s2s

## Resumen

Re-L-s2s es un repositorio publicado por el usuario o0Hailey-DSynth0o (D'Synth) que contiene los pesos de un adaptador QLoRA de 101 MB, junto con el código de un sistema conversacional de voz a voz llamado **Hope**. Hope es una "persona compañera" con una personalidad definida como emocionalmente observadora, protectora y sarcásticamente competente, afinada sobre el corpus propio `hope_corpus_v1_300` (285 turnos de entrenamiento y 15 de validación). El sistema integra el modelo de lenguaje con múltiples motores de síntesis de voz (NeuTTS, Qwen3-TTS y Kokoro) y una voz clonada de Re-L Mayer (*Ergo Proxy*).

La relevancia de este proyecto no reside en el modelo base, sino en la arquitectura del sistema: combina un modelo de chat afinado con un pipeline de voz completo, incluyendo VAD (Silero), ASR (Parakeet) y un mecanismo de *barge-in* basado en un gate de nivel de audio para interrumpir la reproducción. El autor documenta en detalle por qué el cancelador de eco adaptativo falla en hardware real y propone una solución de nivel como alternativa robusta. El modelo base no se especifica explícitamente en la model card, aunque se menciona que Gemma 4 y Qwen3-TTS requieren versiones incompatibles de transformers, lo que sugiere que el modelo de chat podría ser Gemma 4 o un Qwen3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base no especificado; se menciona Gemma 4 y Qwen3 en el contexto del sistema) |
| Parametros totales | No disponible (solo se publica el adaptador QLoRA de 101 MB) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en 4-bit (QLoRA) |
| Idiomas soportados | Ingles (referencia de voz Re-L), japones (voz Lust con Qwen3-TTS) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (según tags) |

## Arquitectura y entrenamiento

El repositorio contiene el código de un sistema completo, no solo el modelo. El componente de chat se afinó con QLoRA de 4 bits sobre un modelo base no especificado, usando un corpus propio de 300 turnos conversacionales. El entrenamiento se realizó en una RTX 4070 Ti. La arquitectura del sistema incluye tres workers de TTS (NeuTTS como principal, Qwen3-TTS como fallback y Kokoro como opción rápida), cada uno en un virtualenv separado porque sus dependencias son mutuamente incompatibles (Qwen3-TTS fija `transformers` en 4.x, mientras que Gemma 4 requiere 5.x). El pipeline de voz a voz usa Silero VAD (2 MB ONNX) para la detección de voz y Parakeet TDT int8 para el ASR (RTF 0.067). El mecanismo de *barge-in* usa un gate de nivel de audio que mide el suelo de eco de la habitación con `calibrate_echo.py` y decide si la entrada es el altavoz o una interrupción real.

## Capacidades

- Conversación multi-turno con personalidad definida (Hope) mediante prompt de sistema y etiquetas de control de registro.
- Speech-to-speech completo: micrófono → VAD → ASR → modelo de chat → TTS, con reproducción ordenada y sin cortes.
- *Barge-in* (interrupción): permite que el usuario hable por encima de la voz de Hope, deteniendo la generación y la reproducción mediante un `StoppingCriteria`.
- Dos registros de voz (sharp y general) seleccionados por turno según las etiquetas de humor o modo.
- Clonación de voz a partir de una referencia de 11 segundos de Re-L Mayer.
- Soporte de varios motores TTS: NeuTTS (nano), Qwen3-TTS (con voz japonesa adicional) y Kokoro (rápido, pero con advertencia).
- Modo de texto puro (`--no-audio`) y modo de chat por CLI.
- Herramientas de calibración de eco y depuración (`HOPE_ECHO_DEBUG=1`).

## Casos de uso

- **Asistente personal con voz en el escritorio**: el sistema puede funcionar como un asistente que escucha continuamente y responde con voz, ideal para manos libres. El *barge-in* permite interrumpir sin esperar a que termine.
- **Personaje conversacional para videojuegos**: la personalidad de Hope y la voz clonada de Re-L Mayer la hacen adecuada para dar vida a un personaje no jugable (NPC) con diálogo hablado y registro sarcástico.
- **Atención al cliente automatizada**: el sistema puede gestionar conversaciones de voz multi-turno, aunque requiere hardware de escritorio y calibración del entorno, por lo que es más viable en entornos fijos (quioscos, recepción).
- **Investigación en sistemas de voz duplex**: el proyecto documenta un problema real de cancelación de eco en hardware y una solución de nivel, útil para experimentos académicos en interacción hablada.
- **Síntesis de voz con personalidad para podcasts**: el sistema permite generar diálogos con la voz clonada de Re-L, con dos registros (sharp y general), para contenido de audio.
- **Prototipo de asistente con interrupción natural**: el *barge-in* por nivel es una alternativa simple al AEC y puede servir de base para otros proyectos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la información disponible. La model card incluye una tabla de mediciones del sistema de cancelación de eco, pero no es un benchmark del modelo de lenguaje:

| Método | Eco residual (sintético) | Eco residual (hardware real) | ERLE |
|---|---|---|---|
| Filtro FIR adaptativo (4096 taps) | 0.010 | 0.93 | 3.9 dB |
| Gate de nivel | 0.010 | 0.93 | — |
| Correctamente rechazado (gate) | 9/9 | 9/9 | — |

La tasa de error de ASR (Parakeet) es RTF 0.067, pero no se dan métricas de precisión.

## Requisitos de hardware

- **Entrenamiento**: se usó una RTX 4070 Ti con QLoRA de 4 bits.
- **Inferencia**: no se especifica VRAM mínima, pero el sistema arranca en unos 90 s con Gemma 4 y dos workers TTS, lo que sugiere que cabe en una GPU de consumo (16 GB) o incluso en CPU con cuantización.
- **TTS**: cada worker TTS se ejecuta en un virtualenv propio; NeuTTS nano y Kokoro son ligeros, mientras que Qwen3-TTS es más pesado.
- **ASR**: Parakeet int8 es eficiente (RTF 0.067) y puede ejecutarse en CPU.
- **Despliegue**: el sistema se ejecuta como CLI local, no se menciona compatibilidad con vLLM, llama.cpp ni Ollama. El modelo de chat se usa localmente, probablemente con `transformers`.
- **Latencia**: no especificada; el arranque es de ~90 s y la reproducción es en streaming con síntesis paralela.

## Comparativa con modelos similares

No disponible. No se ha identificado en la información modelos comparables con el mismo enfoque de sistema conversacional con voz y personalidad específica. El repositorio cita a Moshi como un sistema duplex similar, pero no se dan comparaciones de rendimiento.

## Limitaciones y advertencias

- **Licencia**: no se especifica ninguna licencia, lo que impide su uso comercial o redistribución sin permiso explícito del autor.
- **Dependencias incompatibles**: los workers TTS requieren entornos separados (virtualenvs) con versiones de `transformers` incompatibles, lo que complica el despliegue.
- **Cancelación de eco**: el *barge-in* por nivel no es una solución universal; falla si el usuario habla muy bajo o si el altavoz está muy alto. En coche o con ruido de fondo no es fiable y requiere el AEC del sistema operativo.
- **Idioma**: la voz clonada está entrenada para inglés; la voz japonesa (Lust) solo funciona con Qwen3-TTS.
- **Dependencia de servicios externos**: el sistema requiere calibración del entorno (suelo de eco) y puede no funcionar correctamente en entornos ruidosos o con múltiples altavoces.
- **Modelo base no especificado**: no se puede evaluar la calidad del lenguaje ni el comportamiento en tareas generales, ya que solo se publica el adaptador.
- **Alucinaciones**: no hay datos sobre sesgos o alucinaciones; al ser un modelo de chat no verificado, es probable que presente los sesgos típicos de los LLM base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/o0Hailey-DSynth0o/Re-L-s2s
- Perfil del autor: https://huggingface.co/o0Hailey-DSynth0o
- Otro repositorio del autor (Kestrel): https://huggingface.co/o0Hailey-DSynth0o/Kestrel
- Paper de RelayS2S (relacionado con el nombre, no confirmado): https://arxiv.org/pdf/2603.23346
- Repo de RelayS2S (GitHub): https://github.com/mailong25/relays2s
- Paper sobre duplex S2S (referencia académica): https://arxiv.org/html/2505.15670v1
