# Hebrish/Sabich-Qwen3-ASR-1.7B

## Resumen

Sabich-Qwen3-ASR-1.7B es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3-ASR-1.7B, un sistema de reconocimiento automatico del habla (ASR) desarrollado originalmente por Alibaba Qwen. Este ajuste, publicado por el usuario Hebrish, esta orientado a la adaptacion de hablante y a la transcripcion de audio en ingles y hebreo, con enfasis en cambios de codigo (code-switching) y vocabulario tecnico. El modelo cuenta con 2.038.052.480 parametros y se distribuye en formato safetensors dentro de la libreria transformers.

La relevancia de este modelo reside en su especializacion: frente a un ASR generico, incorpora adaptacion a voces concretas (speaker adaptation) y esta entrenado con datasets como Read-Aloud-Voice-Sentences y LibriSpeech, lo que lo hace util para dictado y transcripcion de contenido tecnico en entornos bilingues ingles-hebreo. El modelo esta publicado bajo licencia Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar las condiciones en Hugging Face.

Se trata de un modelo de nicho con muy poca traccion en la plataforma (13 descargas y 0 likes en el momento de la consulta), por lo que debe evaluarse con cautela antes de usarlo en produccion. La informacion publica disponible sobre su entrenamiento y rendimiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer para reconocimiento automatico del habla; detalles internos no disponibles) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles), he (hebreo); se menciona tambien irish-english como tag |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3-ASR-1.7B, un sistema ASR basado en la familia Qwen3. La informacion publicada no detalla la arquitectura interna (si es encoder-decoder, si usa atencion completa o alguna variante eficiente) ni el numero de tokens de entrenamiento. Los tags indican que el ajuste se centra en adaptacion de hablante (speaker-adaptation), cambios de codigo ingles-hebreo (code-switching) y vocabulario tecnico (tech-vocabulary), lo que sugiere un entrenamiento supervisado sobre pares audio-transcripcion especificos.

Los datasets referenciados en la model card son danielrosehill/Read-Aloud-Voice-Sentences y openslr/librispeech_asr. No se especifica si se aplicaron tecnicas de RLHF, DPO ni ninguna innovacion de decodificacion. Tampoco se dispone de informacion sobre la composicion exacta del dataset de ajuste ni sobre el proceso de alineacion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles y hebreo.
- Adaptacion a hablantes concretos (speaker adaptation) y a voces de dictado.
- Manejo de cambios de codigo (code-switching) entre ingles y hebreo.
- Transcripcion de vocabulario tecnico especializado.
- Orientado a tareas de dictado (dictation) y lectura en voz alta.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio mas alla del ASR: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Dictado bilingue ingles-hebreo: el modelo puede transcribir sesiones de dictado donde el hablante alterna entre ambos idiomas, gracias a su entrenamiento en code-switching y adaptacion de hablante.
- Transcripcion de reuniones tecnicas: adecuado para contenido con vocabulario especializado, ya que el ajuste incorpora vocabulario tecnico y puede reducir errores en terminos de dominio.
- Accesibilidad y subtitulado: permite generar subtitulos en ingles y hebreo para contenido de audio, aprovechando su especializacion en lectura en voz alta.
- Documentacion por voz para desarrolladores: un desarrollador puede dictar notas o especificaciones tecnicas en ingles con terminos de codigo, y el modelo las transcribe con mayor fidelidad que un ASR generico.
- Prototipos de asistentes de voz personales: la adaptacion de hablante permite calibrar el modelo con la voz del usuario para mejorar la precision en un asistente domestico o de productividad.
- Investigacion en ASR multilingue: sirve como punto de partida para estudiar el rendimiento de Qwen3-ASR en escenarios bilingues ingles-hebreo y para experimentos de adaptacion de hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.038 millones de parametros, en precision FP16 se requieren aproximadamente 4 GB solo para los pesos; en FP32, unos 8 GB. La VRAM total depende del runtime y del tamano de los buffers de audio.
- GPU recomendadas: tarjetas con al menos 8-12 GB de VRAM para FP16 con margen (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4). Para FP32 se recomienda 16 GB o mas (RTX 4080/4090, A100).
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en FP16, y en 16 GB con comodidad.
- Opciones de despliegue: transformers (libreria indicada en la model card); vLLM, llama.cpp, Ollama y TGI no estan confirmados para esta arquitectura ASR en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Sabich-Qwen3-ASR-1.7B | 2.038 M | no disponible | en, he | apache-2.0 | gated |
| Qwen/Qwen3-ASR-1.7B (base) | ~1.7 B (nominal) | no disponible | no disponible | no disponible | no disponible |
| Whisper large-v3 (referencia ASR) | ~1.55 B | 30 s por ventana | multilingue | MIT | abierto |

La comparacion con Whisper se ofrece como referencia de categoria ASR, pero no se dispone de datos de rendimiento del modelo Sabich que permitan una comparacion cuantitativa. El modelo base Qwen3-ASR-1.7B aparece en los metadatos, pero sus especificaciones completas no estan en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Traccion muy baja: 13 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad.
- Idiomas limitados a ingles y hebreo; no se garantiza un buen rendimiento en otros idiomas.
- No hay datos publicados de benchmarks, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion y errores de transcripcion, especialmente en audio ruidoso o con acentos no representados en el entrenamiento.
- Sesgos potenciales derivados de los datasets de entrenamiento (Read-Aloud-Voice-Sentences y LibriSpeech), que pueden no representar toda la diversidad de hablantes.
- No se dispone de informacion sobre el contexto maximo de audio ni sobre la robustez en audio de larga duracion.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-ASR-1.7B antes de un uso comercial.
- Falta de documentacion sobre cuantizacion y opciones de despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Sabich-Qwen3-ASR-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Dataset Read-Aloud-Voice-Sentences: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- DOI: https://doi.org/10.57967/hf/11173
