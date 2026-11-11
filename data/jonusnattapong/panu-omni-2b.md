# JonusNattapong/Panu-Omni-2B

## Resumen

Panu-Omni-2B (ภาณุ) es un modelo omnimodal de aproximadamente 2.166 millones de parámetros desarrollado por JonusNattapong sobre la arquitectura LFM3-Omni de Liquid AI, que combina convoluciones híbridas con atención multi-cabeza. El modelo está ajustado específicamente para inteligencia multidiálecto tailandesa (tailandés central, isan, norteño y sureño), razonamiento profundo con modo `<think>` y conversación multilingüe, además de soportar entradas de texto, imagen y audio con salida de voz nativa (speech-to-speech).

Su relevancia radica en dos factores: por un lado, cubre una laguna poco atendida en el ecosistema open source, como es el procesamiento de dialectos regionales tailandeses con calidad conversacional; por otro, incorpora una ventana de contexto de 128.000 tokens en un modelo de solo 2B parámetros, lo que lo hace desplegable en hardware modesto. La versión publicada ha sido sometida a abliteration de los vectores de rechazo, de modo que el autor la describe como "100% uncensored".

La ficha se basa exclusivamente en la model card y los metadatos de Hugging Face; no se han publicado resultados de benchmarks ni detalles sobre la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-Omni (Liquid AI): convolución híbrida + self-attention multi-cabeza |
| Parametros totales | 2.166.928.384 (~2,17B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF de 1-bit a 8-bit (suite completa en repo separado) |
| Idiomas soportados | th, en, zh, ja, fr, de, es; dialectos tailandeses: central, isan, norteño (kham muang), sureño |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (model.safetensors, 4,33 GB) y GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre LFM3-Omni, la arquitectura de Liquid AI que intercala capas de convolución con capas de atención multi-cabeza (híbrido conv + attention) en lugar de un transformer puro. Según la model card, esta base se ha ajustado para tres objetivos: inteligencia multidiálecto tailandesa, razonamiento explícito mediante etiquetas `<think>` y conversación multilingüe. El modelo es omnimodal: procesa texto, imagen y audio, y genera voz de forma nativa (speech-to-speech). El repositorio incluye los módulos Python `modeling_lfm3*.py` autocontenidos y un `chat_template.jinja` que implementa el modo de pensamiento y las llamadas a herramientas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. El autor tampoco detalla el procedimiento de abliteration más allá de indicar que se eliminaron los vectores de rechazo. La tokenización emplea un BPE byte-level extendido en formato fast.

## Capacidades

- Generación de texto y razonamiento profundo con modo de pensamiento explícito (`<think>`).
- Procesamiento de imagen (pipeline image-text-to-text) y comprensión visual.
- Audio nativo: entrada de voz y salida speech-to-speech.
- Conversación multidiálecto en tailandés: central, isan, norteño y sureño.
- Multilingüismo en siete idiomas: tailandés, inglés, chino, japonés, francés, alemán y español.
- Plantilla de chat con soporte de tool calling / function calling.
- Ejecución "obediente" sin rechazos tras la abliteration (según el autor).
- Contexto largo de 128k tokens para conversaciones multi-turno y documentos extensos.

## Casos de uso

- Atención al cliente en Tailandia: el modelo puede gestionar conversaciones multi-turno en tailandés central y dialectos regionales, lo que permite atender a usuarios de Isan o del norte en su propia variedad lingüística sin derivar a un humano por barrera dialectal.
- Asistentes de voz locales: gracias al soporte speech-to-speech y a su tamaño de 2B, puede desplegarse en dispositivos o servidores modestos para interfaces conversacionales por voz en tailandés.
- Transcripción y análisis de documentos largos: con 128k tokens de contexto puede resumir contratos, informes o expedientes completos en una sola pasada, incluyendo documentos con imágenes escaneadas.
- Accesibilidad para hablantes de dialectos: traducción y adaptación de contenido entre tailandés central y dialectos regionales (isan, kham muang, sureño) para administraciones públicas o medios locales.
- Automatización de agentes con tool calling: integración en pipelines que requieran llamadas a APIs o funciones externas mediante la plantilla de chat nativa, por ejemplo para reservas o consultas a bases de datos.
- Investigación sobre abliteration y alineación: al publicarse con los vectores de rechazo eliminados, sirve como caso de estudio para comparar comportamientos de modelos alineados frente a no alineados en el mismo tamaño.
- Procesamiento multimodal de contenido: descripción de imágenes y análisis de audio combinados con texto para moderación o catalogación de contenido en tailandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 4,4 GB solo para los pesos; con overhead de activaciones y caché KV para 128k tokens, se recomienda al menos 8-12 GB para uso práctico.
- Cuantizaciones GGUF de 1 a 8 bits disponibles, lo que reduce el requisito a rangos de 1-2 GB en configuraciones de baja precisión.
- GPU recomendadas: RTX 4090, A100 o H100 para contexto completo de 128k en bf16; RTX 3060/4060 Ti o superiores para cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, especialmente en formatos GGUF de 4-8 bits.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp, Ollama y LM Studio mediante los GGUF; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Panu-Omni-2B | ~2,17B | 128k | Texto, imagen, audio (S2S) | lfm1.0 | Hugging Face (safetensors + GGUF) |
| LFM3-Omni base (Liquid AI) | ~2B (no confirmado) | no disponible | Texto, imagen, audio | lfm1.0 | Hugging Face |
| Qwen2-Audio (7B) | ~7B | no disponible | Texto, audio | Apache 2.0 (según versión) | Hugging Face |
| Gemma 3n (2B aprox.) | ~2B | no disponible | Texto, imagen, audio | Gemma license | Hugging Face |

La comparación con alternativas omnimodales de tamaño similar es limitada porque no se han publicado métricas del modelo; la principal diferencia de Panu-Omni-2B frente a sus pares es la especialización en dialectos tailandeses y la abliteration.

## Limitaciones y advertencias

- No hay benchmarks publicados, por lo que el rendimiento real frente a modelos comparables no está verificado.
- La abliteration elimina los rechazos, lo que implica riesgo elevado de generar contenido dañino, ofensivo o ilegal sin filtro; no es apto para producción orientada al público sin capas de moderación externas.
- Riesgo de alucinación inherente a un modelo de 2B parámetros, especialmente en razonamiento complejo y contexto muy largo.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de desplegar.
- La especialización dialectal se declara en la model card pero no se cuantifica; la calidad en isan, kham muang o sureño no está validada de forma independiente.
- El soporte de contexto de 128k en la práctica puede degradarse en las posiciones finales de la ventana.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar los módulos `modeling_lfm3*.py` antes de usarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JonusNattapong/Panu-Omni-2B
- GGUF: https://huggingface.co/JonusNattapong/Panu-Omni-2B-GGUF
- Liquid AI (arquitectura LFM3): https://www.liquid.ai/
