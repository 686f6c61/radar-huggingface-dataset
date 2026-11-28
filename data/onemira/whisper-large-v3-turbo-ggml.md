# onemira/whisper-large-v3-turbo-ggml

## Resumen

`onemira/whisper-large-v3-turbo-ggml` es un espejo byte a byte de los pesos cuantizados en formato GGML del modelo Whisper Large v3 Turbo de OpenAI, publicados originalmente por el proyecto `whisper.cpp` de Georgi Gerganov. El repositorio no contiene el checkpoint PyTorch completo, sino únicamente dos artefactos `.bin` listos para el runtime `whisper.cpp`: una cuantización `Q8_0` (874 MB) orientada a escritorio y una `Q5_0` (574 MB) orientada a dispositivos móviles. La autoría del modelo subyacente es de OpenAI y la conversión a GGML de los autores de `whisper.cpp`; OneMira actúa solo como redistribuidor.

El modelo base, Whisper Large v3 Turbo, es un sistema de reconocimiento automático del habla (ASR) multilingüe que soporta 99 idiomas con detección automática de lengua. La variante Turbo reduce el número de capas del decodificador respecto a Large v3, lo que rebaja considerablemente el coste de inferencia manteniendo una calidad cercana, y la convierte en una opción práctica para transcripción local en tiempo casi real.

La relevancia de este repositorio concreto es de empaquetado y distribución: ofrece artefactos verificables mediante SHA-256 y con procedencia documentada (`SOURCE.json`), pensados para ejecutarse en local dentro de las aplicaciones de OneMira (escritorio y el grabador C1) sin subir audio a servidores en la nube. No aporta mejoras de modelado ni fine-tuning; es un mirror de conveniencia con licencia MIT heredada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo) |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base Whisper Large v3 Turbo tiene 809 M parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | GGML `Q8_0` (escritorio) y `Q5_0` (movil) |
| Idiomas soportados | 99 idiomas con deteccion automatica (segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGML `.bin` (`ggml-large-v3-turbo-q8_0.bin`, `ggml-large-v3-turbo-q5_0.bin`) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper Large v3 Turbo, un transformer encoder-decoder de tipo seq2seq para ASR entrenado por OpenAI sobre audio y texto emparejados a gran escala y con supervisión multitarea (transcripción, traducción al inglés y detección de idioma). La variante Turbo reduce el decodificador a 4 capas (frente a las 32 de Large v3), lo que disminuye la latencia de decodificación a costa de una pérdida pequeña de precisión. El encoder procesa ventanas de audio de 30 segundos representadas como espectrogramas log-Mel.

Este repositorio no incluye información sobre el dataset de entrenamiento, el número de tokens, ni sobre etapas de RLHF o DPO. Tampoco documenta innovaciones de inferencia más allá del uso del runtime `whisper.cpp`, que implementa la inferencia en C/C++ con soporte de cuantización GGML y aceleración por CPU, Metal, CUDA y otros backends. Los pesos son idénticos a los publicados por `whisper.cpp` en la revisión `5359861c739e955e79d9a303bcbc70fb988958b1`, sin modificación alguna.

## Capacidades

- Reconocimiento automático del habla (ASR) en 99 idiomas con detección automática del idioma.
- Transcripción de audio a texto con marcas de tiempo a nivel de segmento y de palabra (según el runtime `whisper.cpp`).
- Traducción de audio a inglés (capacidad heredada de Whisper).
- Ejecución completamente local y offline tras la descarga inicial del modelo.
- Inferencia en CPU, con soporte de aceleración por GPU/Neural Engine según el backend de `whisper.cpp`.
- Dos perfiles de cuantización para equilibrar calidad y huella de memoria (escritorio vs. móvil).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo "thinking", visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones en local: el modelo procesa el audio de una reunión sin enviarlo a la nube, generando texto con marcas de tiempo que después puede resumirse con un LLM local; encaja por su soporte multilingüe y su ejecución offline.
- Grabadoras de voz dedicadas: integración en dispositivos como el OneMira C1 con la cuantización `Q5_0`, que ocupa 574 MB y permite transcripción en el propio dispositivo con almacenamiento limitado.
- Subtitulado automático de vídeo: generación de subtítulos con timestamps a partir de pistas de audio, ejecutable en un portátil con `whisper.cpp` y la variante `Q8_0`.
- Actas y notas de entrevistas: transcripción de entrevistas y llamadas multilingües para su posterior conversión a Markdown editable, aprovechando la detección automática de idioma.
- Dictado por voz en aplicaciones de escritorio: entrada de texto por voz en herramientas ofimáticas o editores, con latencia baja gracias a la variante Turbo y a la cuantización `Q8_0`.
- Procesamiento por lotes en servidores sin GPU: transcripción de archivos de audio en pipelines de CPU usando `whisper.cpp`, sin dependencia de servicios de transcripción de pago ni límites de minutos.
- Privacidad y cumplimiento: transcripción de audio sensible (sanitario, legal) en entornos donde no se permite la subida a la nube, al ejecutarse íntegramente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de WER, latencia ni throughput, y no se proporcionan comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: la cuantización `Q8_0` ocupa 874.188.075 bytes (~834 MiB) y la `Q5_0` 574.041.195 bytes (~547 MiB); el consumo en ejecución es del orden de 1-2 GB de RAM según backend y buffers del runtime.
- GPU recomendadas: no se especifican en la información disponible; `whisper.cpp` soporta aceleración por CUDA, Metal, Vulkan y otros backends, por lo que puede aprovechar desde una RTX 4090 o A100/H100 hasta GPUs integradas.
- Cabe en GPU de consumo: sí, ambas cuantizaciones caben holgadamente en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 en adelante) e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: `whisper.cpp` (runtime previsto por el autor); no se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, ya que estos no ejecutan el formato GGML específico de Whisper.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| onemira/whisper-large-v3-turbo-ggml | ~809 M (base Turbo) | ventanas de 30 s | 99 | MIT | GGML `Q8_0` / `Q5_0` |
| openai/whisper-large-v3-turbo (original) | ~809 M | ventanas de 30 s | 99 | MIT | PyTorch (safetensors/bin) |
| ggerganov/whisper.cpp (upstream GGML) | ~809 M | ventanas de 30 s | 99 | MIT | GGML (múltiples cuantizaciones) |
| openai/whisper-large-v3 | ~1.55 B | ventanas de 30 s | 99 | MIT | PyTorch |

Las diferencias principales entre este repositorio y el checkpoint original de OpenAI son el formato (GGML frente a PyTorch) y el subconjunto de cuantizaciones ofrecido (solo `Q8_0` y `Q5_0`, frente a la gama más amplia disponible en el repositorio de `whisper.cpp`). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un mirror, no un modelo nuevo: no incluye mejoras, fine-tuning ni correcciones respecto al original de OpenAI y `whisper.cpp`.
- Solo contiene dos cuantizaciones; quien necesite otras (por ejemplo, `Q4_0`, `Q5_1` o `F16`) debe acudir al repositorio upstream de `whisper.cpp`.
- Requiere el runtime `whisper.cpp`; no es directamente cargable en frameworks como Transformers, vLLM o TGI.
- Riesgo de errores de transcripción en audio con ruido, acentos marcados, jerga o solapamiento de hablantes; Whisper es conocido por alucinaciones en segmentos silenciosos o de música.
- La separación de hablantes (speaker ID) mencionada en la model card es una funcionalidad del producto OneMira, no una capacidad nativa del modelo Whisper.
- Licencia MIT heredada: permite uso comercial, pero el mirror no implica respaldo de OpenAI ni de los autores de `whisper.cpp`.
- No se documentan sesgos específicos en la información proporcionada, aunque los sesgos del modelo base de OpenAI son aplicables.
- La fecha de creación del repositorio (2026-11-28) y el recuento de descargas (0) indican que es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onemira/whisper-large-v3-turbo-ggml
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-large-v3-turbo
- Pesos GGML upstream (`whisper.cpp`): https://huggingface.co/ggerganov/whisper.cpp/tree/5359861c739e955e79d9a303bcbc70fb988958b1
- Producto OneMira C1: https://onemira.com/products/c1
- Comparativas de grabadoras: https://onemira.com/compare
- Guía sin suscripción: https://onemira.com/ai-voice-recorder-without-subscription
- Dataset TCO: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
- Servidor MCP OKF Wiki: https://github.com/onemira-space/okf-wiki-mcp
- Validador OKF Markdown: https://www.npmjs.com/package/okf-markdown
- Plantillas de actas: https://onemira.com/meeting-minutes-templates
