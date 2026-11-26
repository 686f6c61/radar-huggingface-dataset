# FastFlowLM/LFM2-2.6B-Transcript-NPU2

## Resumen

LFM2-2.6B-Transcript-NPU2 es una variante del modelo LFM2-2.6B-Transcript de Liquid AI, publicada por FastFlowLM y orientada a la ejecución en unidades de procesamiento neuronal (NPU), en concreto en el ecosistema AMD Ryzen. El modelo base, LFM2-2.6B, es un transformer de tipo "liquid" de 2.600 millones de parámetros diseñado para inferencia en el borde (edge), y esta versión concreta ha sido ajustada para la tarea de resumir transcripciones de reuniones largas (30-60 minutos) generando salidas estructuradas con puntos clave, decisiones y tareas asignadas.

La propuesta de valor es la privacidad y el rendimiento local: según la model card, el modelo produce resúmenes de calidad cercana a la nube consumiendo menos de 3 GB de RAM en reuniones largas, con generación en segundos y ejecución íntegra en CPU, GPU y NPU sin que los datos abandonen el dispositivo. Está pensado para conversaciones de un solo turno con un formato de entrada muy específico, y solo soporta inglés.

Esta variante NPU2 se distribuye como un repositorio de 1,9 GB con pesos en formato nativo para transformers, licencia lfm1.0 (marcada como "other" en Hugging Face) y un uso previsto muy acotado: resumen de transcripciones en entornos regulados, offline o sensibles. No es un modelo de propósito general, sino un especialista de tarea única.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo "liquid" (LFM2), optimizado para edge |
| Parametros totales | 2.600 millones (2.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta variante; el modelo base dispone de GGUF, ONNX y MLX (4-bit) |
| Idiomas soportados | Ingles (en) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors / formato nativo transformers (repo de 1,9 GB) |

## Arquitectura y entrenamiento

El modelo se basa en LFM2-2.6B de Liquid AI, una familia de transformers "liquid" concebida para inferencia eficiente en dispositivos de borde. Esta variante concreta es un ajuste fino (finetune) del checkpoint LFM2-2.6B-Transcript, que a su vez deriva del LFM2-2.6B base. El ajuste está especializado en la tarea de resumir transcripciones de reuniones, con salidas estructuradas y un tono y formato consistentes.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí especifica el formato exacto de entrada (título, fecha, hora, duración, participantes y turnos etiquetados por hablante) y recomienda una temperatura de 0,3 para la generación. El modelo está diseñado para conversaciones de un solo turno con ese formato concreto, no para diálogo multi-turno abierto. La variante NPU2 está empaquetada por FastFlowLM para su ejecución sobre NPU, presumiblemente dentro del stack de inferencia de FastFlowLM para hardware AMD Ryzen.

## Capacidades

- Resumen de transcripciones largas de reuniones (30-60 minutos) en inglés.
- Generación de resúmenes ejecutivos breves (2-3 frases) de resultados y decisiones.
- Resúmenes detallados en formato de párrafo que cubren temas, discusiones y resultados.
- Extracción de tareas asignadas (action items) con identificación del responsable cuando se menciona.
- Listado de decisiones clave tomadas durante la reunión.
- Listado de participantes con sus roles o cargos cuando están disponibles.
- Listado de temas tratados en la reunión.
- Combinación de varios de estos prompts en una sola petición (formato libre).
- Ejecución local en CPU, GPU y NPU, con menos de 3 GB de RAM en reuniones largas según el autor.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma declarada.
- No soporta visión, audio ni modo "thinking".

## Casos de uso

- Resumen de reuniones internas de equipo: se introduce la transcripción con el formato prescrito y el modelo devuelve puntos clave, decisiones y tareas, ejecutándose en local para evitar enviar conversaciones internas a servicios en la nube.
- Llamadas de ventas y conversaciones con clientes: el modelo genera un resumen ejecutivo y una lista de action items que el comercial puede revisar inmediatamente tras la llamada, con latencia de segundos.
- Reuniones de consejo y briefings ejecutivos: la extracción de decisiones clave y participantes con roles encaja con la necesidad de actas concisas en entornos donde la confidencialidad es crítica.
- Entornos regulados o sensibles: al ejecutarse íntegramente en el dispositivo con menos de 3 GB de RAM, permite procesar transcripciones médicas, legales o financieras sin que los datos salgan del equipo, cumpliendo requisitos de residencia de datos.
- Flujos de trabajo offline o con conectividad limitada: en portátiles con NPU AMD Ryzen se puede resumir una reunión sin conexión a internet, útil en desplazamientos, instalaciones aisladas o auditorías in situ.
- Procesamiento por lotes de transcripciones en estaciones de trabajo: al caber en memoria de un portátil, se pueden encadenar resúmenes de varias reuniones en una sola sesión sin depender de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: menos de 3 GB de RAM para reuniones largas según el autor; el repositorio de pesos ocupa 1,9 GB.
- Ejecución declarada en CPU, GPU y NPU, con especial orientación a NPU AMD Ryzen (de ahí el sufijo NPU2 y la colaboración con AMD).
- Cabe en GPU de consumo: sí, por tamaño (2,6B) cabría en tarjetas con 4-8 GB de VRAM, aunque el autor no publica requisitos específicos por GPU.
- Despliegue: formato nativo transformers; el modelo base ofrece variantes GGUF (llama.cpp), ONNX Runtime y MLX (Apple Silicon), no confirmadas para esta variante NPU2.
- Latencia y throughput: no disponibles de forma numérica; el autor afirma "resúmenes en segundos, no minutos" para reuniones de 30-60 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM2-2.6B-Transcript-NPU2 | 2,6B | no disponible | Ingles | lfm1.0 | Resumen de reuniones en NPU |
| LFM2-2.6B-Transcript (Liquid AI) | 2,6B | no disponible | Ingles | lfm1.0 | Resumen de reuniones, formato nativo/GGUF/ONNX/MLX |
| LFM2-2.6B (base) | 2,6B | no disponible | no disponible | lfm1.0 | Modelo general edge de Liquid AI |
| Alternativas de resumen de reuniones | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se declara soporte de castellano ni de otros idiomas.
- Diseñado exclusivamente para conversaciones de un solo turno con un formato de entrada específico; usarlo fuera de ese formato degrada la calidad.
- No es un modelo de propósito general: no se declara soporte de tool calling, agentes, código, matemáticas ni razonamiento multi-paso.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar responsables, decisiones o participantes no presentes en la transcripción, especialmente con transcripciones ruidosas o mal diarizadas.
- La licencia lfm1.0 ("other") impone condiciones que deben revisarse antes de uso comercial; no es una licencia permisiva tipo Apache 2.0 o MIT.
- La longitud de contexto no está publicada, lo que dificulta planificar reuniones muy largas o transcripciones que excedan la ventana real del modelo.
- El autor recomienda temperatura 0,3; valores más altos pueden producir salidas menos consistentes.
- Esta variante NPU2 está empaquetada por un tercero (FastFlowLM) sobre el modelo de Liquid AI; la calidad y el soporte dependen del empaquetado y del stack de inferencia subyacente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FastFlowLM/LFM2-2.6B-Transcript-NPU2
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Modelo original LFM2-2.6B-Transcript: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript-ONNX
- Variante MLX (4-bit): https://huggingface.co/mlx-community/LFM2-2.6B-Transcript-4bit
- Blog de AMD: https://www.amd.com/en/blogs/2026/liquid-ai-amd-ryzen-on-device-meeting-summaries.html
- Blog de Liquid AI: https://www.liquid.ai/blog/the-future-of-meeting-summarization-local-fast-private-and-fully-secure
- Playground de Liquid: https://playground.liquid.ai/
- Documentación LFM: https://docs.liquid.ai/lfm
- LEAP: https://leap.liquid.ai/
