# Rin247/Qwen3-ASR-1.7B-hf-FP8

## Resumen

Este repositorio contiene una cuantización FP8 *weight-only* del modelo `Qwen3-ASR-1.7B-hf`, publicada por el usuario Rin247. El modelo base pertenece a la familia Qwen3-ASR de Alibaba Qwen, una serie de sistemas de reconocimiento automático del habla (ASR) de código abierto que soporta identificación de idioma y transcripción para 52 idiomas y dialectos. La cuantización FP8 reduce el tamaño de los pesos a 8 bits en coma flotante, lo que permite una inferencia más rápida y un menor consumo de memoria en hardware compatible, manteniendo una calidad cercana a la versión original.

La relevancia de esta versión cuantizada radica en su aplicabilidad práctica: los modelos ASR de 1.7B parámetros suelen requerir recursos considerables, y la conversión a FP8 facilita su despliegue en entornos con GPUs de gama media o en producción con restricciones de VRAM. El método de cuantización empleado es RTN (round-to-nearest) ejecutado en CPU, con escalas almacenadas junto a los pesos en archivos `safetensors`. La arquitectura subyacente es un transformer con atención de consultas agrupadas (GQA), 28 capas, tamaño oculto de 2048 y 16 cabezas de consulta con 8 cabezas clave/valor, según la configuración del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) con GQA, 28 capas, hidden size 2048, 16 query heads, 8 KV heads |
| Parametros totales | 2.038.052.480 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (weight-only, RTN) |
| Idiomas soportados | 52 idiomas y dialectos (modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con escalas y shapes de cuantización) |

## Arquitectura y entrenamiento

El modelo base `Qwen3-ASR-1.7B-hf` es un sistema ASR desarrollado por QwenLM, construido sobre la capacidad de comprensión de audio de su modelo fundacional `Qwen3-Omni`. Utiliza una arquitectura transformer estándar con atención de consultas agrupadas (GQA) para reducir el coste de memoria durante la inferencia. El entrenamiento se realizó con datos de habla a gran escala, aunque no se proporcionan detalles específicos sobre el número de tokens o la composición del dataset en la información disponible.

La cuantización FP8 de este repositorio es *weight-only*: solo los pesos se convierten a FP8, mientras que las activaciones permanecen en precisión superior. El método empleado es RTN (redondeo al más cercano) ejecutado en CPU, y las escalas de cuantización se almacenan como buffers adicionales (`*.weight_scale`, `*.weight_shape`) junto a los pesos. Para utilizar el modelo, es necesario dequantizar los pesos con las escalas correspondientes antes de alimentar un motor de inferencia, según indica la model card del autor.

## Capacidades

- Transcripción automática del habla (ASR) en 52 idiomas y dialectos.
- Identificación de idioma a partir de audio.
- Generación de texto a partir de audio, con salida en el idioma detectado.
- Soporte de audio de entrada (no se especifica el formato, pero el modelo base acepta señales de audio).
- No se documentan capacidades de *tool calling*, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Transcripción multilingüe de reuniones y conferencias: el modelo puede transcribir audio en 52 idiomas, lo que facilita la generación de actas o subtítulos en entornos internacionales.
- Subtitulado automático de vídeos: al integrarse en un pipeline de procesamiento de vídeo, permite generar subtítulos en tiempo real o diferido para plataformas de contenido.
- Asistentes de voz para atención al cliente: la identificación de idioma y la transcripción permiten enrutar llamadas o chats de voz al agente o sistema adecuado según el idioma detectado.
- Análisis de llamadas de centros de contacto: transcribir conversaciones para su posterior análisis de sentimiento, cumplimiento normativo o extracción de información.
- Accesibilidad para personas con discapacidad auditiva: conversión de audio a texto en tiempo real para reuniones, clases o eventos.
- Archivado y búsqueda de contenido de audio: transcribir podcasts, entrevistas o grabaciones para indexar y permitir búsquedas por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye métricas de calidad (WER, CER, etc.) ni comparaciones con el modelo original o con alternativas como Whisper. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: con 2.038 millones de parámetros en FP8, los pesos ocupan aproximadamente 2 GB (2.038.052.480 × 1 byte ≈ 2,04 GB). Añadiendo activaciones y overhead, se estima un consumo total de 3-4 GB en inferencia, dependiendo de la longitud del audio y el tamaño de lote.
- GPU recomendadas: cualquier GPU con soporte FP8 nativo (NVIDIA RTX 40 series, A100, H100, etc.) aprovechará la cuantización. En GPUs sin soporte FP8, los pesos pueden dequantizarse a FP16 o BF16, aunque se pierde parte de la ventaja de memoria.
- Es viable en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- Opciones de despliegue: al ser un modelo ASR, requiere un pipeline de procesamiento de audio. El repositorio no incluye scripts de inferencia; se recomienda usar el código del modelo base de Qwen (disponible en GitHub) y adaptar la carga de pesos cuantizados. Motores como vLLM o TGI no soportan directamente este formato de cuantización personalizado; es necesario un preprocesamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (base) | 1.7B | no disponible | 52 | Apache 2.0 (según Qwen) | safetensors (BF16) |
| Rin247/Qwen3-ASR-1.7B-hf-FP8 | 2.038M (FP8) | no disponible | 52 | no disponible | safetensors (FP8) |
| Whisper large-v3 | 1.55B | 30 s de audio | 99 | MIT | safetensors, GGUF |

La comparativa se basa en datos públicos de los modelos base. No se dispone de resultados de rendimiento para la versión cuantizada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una ligera degradación en la precisión de la transcripción, especialmente en audio con ruido o acentos poco comunes. No se han publicado métricas que cuantifiquen esta pérdida.
- La licencia de esta cuantización no está especificada en la model card. Aunque el modelo base de Qwen se distribuye bajo Apache 2.0, esta versión cuantizada podría tener restricciones adicionales; se recomienda contactar con el autor antes de un uso comercial.
- El formato de pesos es personalizado (con escalas y shapes separados), lo que dificulta su uso directo con herramientas estándar como llama.cpp u Ollama. Requiere un código de dequantización específico.
- No se especifica la longitud máxima de audio que puede procesar el modelo, ni el formato de entrada (frecuencia de muestreo, canales, etc.).
- El modelo base puede presentar sesgos en el reconocimiento de ciertos dialectos o acentos, y puede alucinar palabras en contextos de baja calidad de audio.
- No se proporcionan instrucciones de uso ni ejemplos de inferencia en el repositorio, lo que aumenta la barrera de adopción.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/Rin247/Qwen3-ASR-1.7B-hf-FP8
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Repositorio GitHub de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Colección Qwen3-ASR en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-asr
- Modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-ASR-1.7B-hf
