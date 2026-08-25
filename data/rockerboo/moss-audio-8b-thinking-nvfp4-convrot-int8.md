# rockerBOO/moss-audio-8b-thinking-nvfp4-convrot-int8

## Resumen

MOSS-Audio-8B-Thinking es un modelo de comprensión de audio de código abierto desarrollado por el equipo OpenMOSS (MOSI.AI, OpenMOSS y el Instituto de Innovación de Shanghái). El modelo realiza modelado unificado sobre audio del mundo real, incluyendo comprensión de voz, sonidos ambientales, música, captioning de audio, QA con marcadores temporales y razonamiento complejo. Su arquitectura combina un encoder de audio entrenado desde cero, un decoder basado en Qwen3 de 8B parámetros y la técnica DeepStack de inyección de características entre capas.

Esta ficha se centra en la versión cuantizada `rockerBOO/moss-audio-8b-thinking-nvfp4-convrot-int8`, un checkpoint de un solo archivo (8.8 GB) derivado del original bf16 (~17 GB) y optimizado para la ruta de carga nativa de kernels cuantizados de ComfyUI. La cuantización aplica NVFP4 a los MLP del decoder Qwen3 e INT8 con ConvRot a las proyecciones de atención, manteniendo el encoder de audio y las capas de salida en bf16. Requiere hardware NVIDIA Blackwell (Compute Capability ≥ 10.0) y es de interés para desarrolladores que buscan desplegar modelos de audio en entornos con memoria reducida sin renunciar a la calidad de transcripción y análisis de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder basado en Qwen3 (36 capas) + encoder de audio propio + DeepStack merger |
| Parametros totales | 8B (según la nomenclatura del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (MLP del decoder), INT8 con ConvRot (proyecciones de atención, grupo 256), bf16 (encoder, adaptador, merger, lm_head, embeddings, norm) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un solo archivo de 8.8 GB) |

## Arquitectura y entrenamiento

El modelo base MOSS-Audio-8B-Thinking emplea un decoder de lenguaje basado en Qwen3 con 36 capas, sobre el que se conecta un encoder de audio entrenado desde cero y un módulo DeepStack que inyecta características de audio entre capas del decoder. El entrenamiento original incluye estrategias de inserción de marcadores temporales para tareas sensibles al tiempo y un pipeline de razonamiento que mejora la comprensión de audio complejo. La versión cuantizada conserva esta arquitectura completa, pero reduce el peso de las capas del decoder: los MLP (gate, up, down_proj) se cuantizan a NVFP4, mientras que las proyecciones de atención (q, k, v, o) se cuantizan a INT8 con rotación de canales (ConvRot) en grupos de 256. El encoder de audio, el adaptador, el merger DeepStack, el `lm_head`, `embed_tokens` y las capas de normalización se mantienen en bf16 para preservar la calidad de la representación acústica y de salida.

El proceso de cuantización se realizó con la herramienta `ctq` del proyecto `quant-tooling` de rockerboo, siguiendo heurísticas de sensibilidad que excluyen componentes críticos del modelo. La verificación se hizo end-to-end en ComfyUI con audio real, obteniendo transcripciones coherentes y salidas de estilo/estado de ánimo, aunque no se ha realizado una comparación formal de calidad contra el checkpoint original bf16.

## Capacidades

- Comprensión de audio general: transcripción de voz, descripción de sonidos ambientales, análisis de música y captioning de audio.
- Razonamiento complejo sobre audio: responde preguntas que requieren inferencia, comparación y deducción a partir de múltiples señales acústicas.
- Conciencia temporal: soporta tareas de QA con marcadores temporales (time-aware QA), permitiendo localizar eventos en el audio.
- Comprensión de voz con timestamps: produce transcripciones con marcas de tiempo, útil para subtitulado y diarización.
- Análisis de estilo y emoción: el modelo puede extraer información sobre el tono, estado de ánimo o estilo del hablante.
- Entrada multimodal: acepta audio directo o vídeo MP4 (extracción de pista de audio), según la demo del espacio HuggingFace.
- Capacidad de tool calling y agentes: no documentada en la información disponible.

## Casos de uso

- Subtitulación automatizada de vídeo: el modelo genera transcripciones con timestamps, lo que permite producir subtítulos sincronizados para plataformas de vídeo de forma automática.
- Análisis de llamadas de atención al cliente: procesa grabaciones de voz para extraer el estado de ánimo, detectar problemas recurrentes y generar resúmenes con marcas temporales.
- Moderación de contenido audiovisual: analiza audio de vídeos subidos por usuarios para detectar lenguaje inapropiado, ruido ambiental o música con copyright, con capacidad de razonar sobre el contexto.
- Asistentes de accesibilidad: transcribe conferencias, reuniones o clases en tiempo real, incluyendo descripciones de sonidos ambientales que son relevantes para personas con discapacidad auditiva.
- Análisis musical automatizado: describe instrumentos, estructura, tempo y emociones de una pieza musical, útil para bibliotecas de música o sistemas de recomendación.
- Evaluación de calidad de audio en producción: el modelo puede describir artefactos, ruido de fondo o problemas de grabación en material de estudio, ayudando a control de calidad en postproducción.
- Investigación en audio forense: con su soporte de time-aware QA, permite interrogar grabaciones con preguntas como "¿qué se dijo justo antes de la alarma?" o "¿cuándo se produjo el golpe?".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta versión cuantizada en la información disponible. Los datos del modelo base (MOSS-Audio-8B-Thinking) según la búsqueda web son:

| Modelo | Comprensión de audio general (media) | AAS en AISHELL-1 (timestamp ASR) |
|---|---|---|
| MOSS-Audio-8B-Thinking | 70.80 | 35.77 |
| Qwen3-Omni-30B | 67.91 | 833.66 |

Nota: AAS (Average Alignment Score) mide la precisión de los timestamps en reconocimiento de voz; un valor menor indica mejor alineación temporal. No se dispone de benchmarks públicos para la versión cuantizada NVFP4/INT8.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 8.8 GB en disco; la VRAM necesaria en inferencia depende del contexto y de la gestión de activaciones, estimándose entre 10 y 12 GB para inferencia estándar.
- GPU recomendadas: NVIDIA Blackwell (Compute Capability ≥ 10.0), por ejemplo B200, RTX 5090 o A100 Blackwell. No es compatible con GPUs Ampere o Turing por la cuantización NVFP4.
- No cabe en GPUs consumer de generación anterior (RTX 30/40) porque no soportan NVFP4.
- Opciones de despliegue: ComfyUI con kernels cuantizados nativos y ConvRot-aware; también puede cargarse en frameworks que soporten safetensors cuantizados, aunque el soporte NVFP4 es limitado fuera de Blackwell.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en audio general |
|---|---|---|---|---|---|
| MOSS-Audio-8B-Thinking (cuantizado NVFP4/INT8) | 8B | No disponible | Apache 2.0 | HuggingFace (1 archivo) | No publicado |
| MOSS-Audio-8B-Thinking (original bf16) | 8B | No disponible | Apache 2.0 | HuggingFace | 70.80 media |
| Qwen3-Omni-30B | 30B | No disponible | Apache 2.0 | HuggingFace | 67.91 media |

La versión cuantizada ofrece una reducción de peso del 48% (de 17 GB a 8.8 GB) con el mismo rendimiento esperado (aunque no verificado). Qwen3-Omni-30B es un modelo más grande con peor rendimiento en audio general según los datos disponibles, lo que hace a MOSS-Audio-8B-Thinking una opción más eficiente.

## Limitaciones y advertencias

- Requiere hardware Blackwell (Compute Capability ≥ 10.0); no es ejecutable en GPU consumer estándar ni en centros de datos con GPU Ampere o Hopper.
- La cuantización NVFP4 e INT8 con ConvRot puede degradar ligeramente la calidad de salida respecto al original bf16, aunque no se ha publicado una evaluación formal.
- La verificación se realizó solo en ComfyUI con audio real; no hay pruebas de rendimiento en otros frameworks ni comparaciones de calidad lado a lado.
- No se han publicado benchmarks de esta versión cuantizada, por lo que los resultados del modelo original no son directamente extrapolables.
- Los idiomas soportados no están documentados; la información disponible no especifica cobertura multilingüe.
- No se ha confirmado soporte para tool calling, agentes o modos de razonamiento explícito en esta versión.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base depende de Qwen3 (Apache 2.0) y del encoder de audio propio; se recomienda revisar las licencias de los componentes individuales.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/rockerBOO/moss-audio-8b-thinking-nvfp4-convrot-int8
- Modelo base original: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-8B-Thinking
- Repositorio GitHub del proyecto MOSS-Audio: https://github.com/OpenMOSS/MOSS-Audio
- Página oficial del proyecto: https://openmoss.ai/MOSS-Audio/
- Space de demostración (earlangue/MOSS-Audio-8B-Thinking): https://huggingface.co/spaces/earlangue/MOSS-Audio-8B-Thinking
- Herramienta de cuantización (quant-tooling): https://github.com/rockerboo/quant-tooling
- Artículo de análisis de aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/moss-audio-8b-thinking-openmoss-team
