# nikh360pro/capsbro-hinglish-ct2

## Resumen

CapsBro Hinglish es una conversión a CTranslate2 (float16) del modelo de reconocimiento automático de voz Trelis/whisper-hinglish-preview, un Whisper large-v3 afinado por Trelis Research para Hinglish, es decir, el habla que mezcla hindi e inglés de forma natural, algo muy habitual en la India urbana. El autor de la conversión, nikh360pro, publica el resultado para que pueda ejecutarse directamente con faster-whisper, una implementación optimizada en C++/Python sobre CTranslate2 que reduce el consumo de memoria y acelera la inferencia respecto a la implementación original de OpenAI.

El modelo resuelve un problema concreto: los Whisper estándar tienden a degradarse cuando el audio alterna entre hindi e inglés dentro de la misma frase, transcribiendo fragmentos en el idioma equivocado o generando traducciones no deseadas. Este ajuste específico sobre large-v3 busca mantener la transcripción literal en el idioma hablado, preservando los cambios de código (code-switching) tal como se producen.

La relevancia actual es práctica: es uno de los pocos modelos ASR públicos orientados a Hinglish con licencia Apache 2.0 y empaquetado listo para producción en formato CTranslate2, lo que permite desplegarlo en CPU o GPU con faster-whisper sin necesidad de convertir pesos ni de depender de frameworks de inferencia más pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), convertido a CTranslate2 |
| Parametros totales | no disponible (Whisper large-v3 tiene aproximadamente 1550 millones; el autor no lo indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos por segmento, propia de Whisper) |
| Tipos de cuantizacion | float16 (única incluida en el repo) |
| Idiomas soportados | hi, en (y su mezcla, Hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (model.bin y ficheros auxiliares), tokenizer Whisper large-v3 |

## Arquitectura y entrenamiento

La base es Whisper large-v3, un transformer encoder-decoder con atención completa entrenado originalmente por OpenAI sobre cientos de miles de horas de audio débilmente supervisado y multilingüe. Trelis Research partió de esos pesos y los afinó para Hinglish, presumiblemente con datos de audio que alternan hindi e inglés; la model card no detalla el volumen de datos, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (en ASR no es habitual). El autor de esta conversión no aporta información adicional sobre el proceso de entrenamiento.

La innovación técnica de esta publicación no está en el entrenamiento sino en el empaquetado: la conversión con `ct2-transformers-converter --quantization float16` reescribe los pesos en el formato binario de CTranslate2, lo que habilita la inferencia con faster-whisper. Esto aporta ventajas medibles frente a la implementación de referencia: decodificación por lotes más eficiente, menor uso de memoria (float16 reduce a la mitad el peso respecto a float32) y soporte de paralelismo en CPU mediante hilos. No se documentan mecanismos adicionales como decodificación especulativa ni atención lineal.

## Capacidades

- Transcripción de voz a texto en hindi, inglés y, sobre todo, habla Hinglish con cambios de código dentro de una misma frase.
- Generación de subtítulos (el caso de uso declarado por el autor: "CapsBro uses it for Hindi and Hinglish captions").
- Detección y preservación del idioma hablado en lugar de traducción automática, gracias al ajuste específico sobre large-v3.
- Procesamiento por segmentos de audio de hasta 30 segundos, con concatenación de segmentos para audios más largos.
- Inferencia optimizada mediante faster-whisper sobre CTranslate2, con soporte de ejecución en CPU y GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Subtitulado de vídeo y streaming en hindi/Hinglish: el modelo transcribe segmentos de 30 segundos y permite generar ficheros SRT/VTT para plataformas de contenido indio, manteniendo las mezclas de idioma tal cual se hablan.
- Transcripción de reuniones y llamadas de equipos indios: con faster-whisper se puede procesar audio de forma incremental y obtener actas o búsquedas sobre el texto, algo útil en empresas con plantillas bilingües hindi-inglés.
- Atención al cliente y centros de llamadas: transcripción de conversaciones telefónicas para control de calidad, análisis de sentimiento posterior o cumplimiento normativo, aprovechando la licencia Apache 2.0 para uso comercial.
- Generación de contenido accesible: subtítulos automáticos para vídeos de YouTube, cursos online o redes sociales dirigidos a audiencias del norte de la India, donde el Hinglish es la norma oral.
- Investigación en code-switching: corpus etiquetados y evaluación de sistemas ASR sobre habla mezclada, usando este modelo como línea base pública y reproducible.
- Despliegue en entornos con recursos limitados: al estar en CTranslate2 float16 y soportar CPU, puede ejecutarse en servidores sin GPU o en dispositivos edge para transcripción local sin enviar audio a la nube.
- Archivado y búsqueda de material audiovisual: indexación de podcasts o grabaciones largas mediante transcripción por lotes con faster-whisper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER (word error rate), comparativas con Whisper large-v3 original ni evaluaciones sobre conjuntos de test Hinglish.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en float16 para los pesos (el repo ocupa 4,6 GB incluyendo tokenizer y ficheros auxiliares); con overhead de runtime, entre 4 y 6 GB según el tamaño de lote y la longitud del audio.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A10, A100 o H100. En GPUs profesionales el throughput escala con el tamaño de lote.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB con lotes pequeños.
- Ejecución en CPU: viable gracias a CTranslate2, con mayor latencia; se recomienda un mínimo de 8 GB de RAM y uso de hilos (`cpu_threads`) para paralelizar.
- Opciones de despliegue: faster-whisper (recomendado, es el runtime nativo del formato), CTranslate2 directamente, y servidores compatibles con faster-whisper como wyoming-faster-whisper o integraciones en contenedores. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan modelos ASR de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, del tamaño de lote y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| CapsBro Hinglish (este) | ~1550 M (large-v3) | 30 s por segmento | hi, en, Hinglish | Apache 2.0 | CTranslate2 float16 |
| Trelis/whisper-hinglish-preview | ~1550 M (large-v3) | 30 s por segmento | hi, en, Hinglish | Apache 2.0 | safetensors (transformers) |
| OpenAI Whisper large-v3 | ~1550 M | 30 s por segmento | multilingüe (99 idiomas) | MIT | safetensors, CTranslate2, GGML |
| Whisper large-v3-turbo | ~809 M | 30 s por segmento | multilingüe | MIT | safetensors, CTranslate2 |

La ventaja de este modelo frente a Whisper large-v3 original es la especialización en Hinglish y el empaquetado listo para faster-whisper; su desventaja es que solo cubre hindi e inglés y no ofrece variantes cuantizadas a int8 ni int8_float16, que sí suelen publicarse para los Whisper estándar y reducirían aún más el consumo de memoria.

## Limitaciones y advertencias

- Solo cubre hindi, inglés y su mezcla; no es un modelo multilingüe general y puede degradarse con otros idiomas o acentos no vistos en el ajuste.
- Al derivar de Whisper, hereda sus sesgos conocidos: alucinaciones en silencios o ruido, repeticiones en bucles y tendencia a "traducir" en lugar de transcribir en algunos contextos, aunque el ajuste Hinglish mitiga este último punto.
- Riesgo de alucinación en audio de baja calidad, con música de fondo o con hablantes no nativos; se recomienda validación humana en producción.
- El autor no documenta el dataset de ajuste ni métricas de calidad, por lo que no hay garantías cuantificadas de rendimiento frente a Whisper large-v3 en Hinglish.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y atribuir a Trelis Research y a OpenAI (Whisper) según corresponda.
- Solo se distribuye en float16; no hay versiones int8 ni GGML, lo que limita el despliegue en hardware muy restringido.
- La fecha de creación del repo (2026-11-02) es posterior a la de esta ficha; conviene verificar si el autor publica actualizaciones o variantes cuantizadas.
- No apto para tareas distintas de ASR: no genera texto libre, no razona y no soporta agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikh360pro/capsbro-hinglish-ct2
- Modelo base: https://huggingface.co/Trelis/whisper-hinglish-preview
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Whisper (OpenAI): https://github.com/openai/whisper
- Trelis Research: https://trelis.com
