# slyusarev/Qwen3-ASR-1.7B-GGUF

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático del habla (ASR) de la familia Qwen3-ASR, desarrollado por el equipo Qwen de Alibaba. Este modelo integra identificación de idioma y transcripción de voz en un único sistema, soportando 52 idiomas y dialectos. Se basa en el modelo fundacional Qwen3-Omni, lo que le proporciona una fuerte capacidad de comprensión auditiva, y ha sido entrenado con datos de habla a gran escala.

La versión GGUF, publicada por distintos repositorios (ggml-org, Renesas, slyusarev), convierte los pesos originales al formato GGUF mediante `convert_hf_to_gguf.py`, lo que permite su ejecución en CPU y en GPUs de consumo mediante llama.cpp, Ollama u otros motores compatibles. Con 1,7 mil millones de parámetros, la versión 1.7B alcanza resultados de última generación entre los modelos ASR de código abierto, según los experimentos publicados por el equipo de Qwen.

La relevancia actual de este modelo radica en que combina ASR multilingüe, identificación de idioma y un tamaño compacto, lo que lo hace viable para despliegue en edge computing y plataformas embebidas como el SoC Renesas X5H, además de entornos de servidor convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3-Omni (audio + texto) |
| Parametros totales | 1,7 mil millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M, Q5_K_M, Q8_0 y otras variantes estándar de llama.cpp) |
| Idiomas soportados | 52 idiomas y dialectos (incluye 30 idiomas y 22 dialectos chinos segun la variante de Renesas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwen3-ASR-1.7B se construye sobre el modelo fundacional Qwen3-Omni, que integra capacidades de comprensión auditiva multimodal. El modelo procesa audio de entrada mediante un encoder de audio y lo proyecta a un espacio de representación compartido con el texto, permitiendo generar transcripciones y etiquetas de idioma de forma unificada. La arquitectura es de tipo transformer, aunque los detalles exactos de capas, cabezas de atención y dimensiones ocultas no se especifican en la información disponible.

El entrenamiento utiliza datos de habla a gran escala, aunque no se detalla el número exacto de horas de audio ni la composición del dataset. El informe técnico en arXiv (2601.21337) describe la familia completa, que incluye también un modelo de alineación forzada de habla no autorregresivo. No se menciona explícitamente el uso de RLHF o DPO en el entrenamiento de este modelo.

La conversión a GGUF se realiza con la herramienta `convert_hf_to_gguf.py` del ecosistema llama.cpp, lo que permite cuantizar los pesos a diferentes precisiones para reducir requisitos de memoria.

## Capacidades

- Reconocimiento automático del habla (ASR) en 52 idiomas y dialectos.
- Identificación de idioma (language identification) integrada en el mismo modelo.
- Transcripción de audio en tiempo real o por lotes.
- Soporte de 22 dialectos chinos además de idiomas internacionales.
- Capacidad de comprensión auditiva heredada de Qwen3-Omni, que permite manejar entradas de audio complejas.
- Formato GGUF compatible con inferencia en CPU y GPU mediante llama.cpp, Ollama y motores similares.
- Optimización para plataformas embebidas como el SoC Renesas X5H (en la variante publicada por Renesas).

## Casos de uso

- Transcripción de reuniones y videoconferencias: el modelo puede transcribir audio en múltiples idiomas de forma simultánea, identificando automáticamente el idioma de cada segmento, lo que facilita la generación de actas y subtítulos en entornos corporativos multilingües.
- Subtitulado automático de vídeo: su soporte para 52 idiomas y dialectos permite generar subtítulos para contenido audiovisual sin necesidad de configurar el idioma de origen manualmente, gracias a la identificación automática de idioma.
- Asistentes de voz en dispositivos embebidos: el tamaño de 1.7B y el formato GGUF cuantizado permiten su despliegue en dispositivos edge como el SoC Renesas X5H, habilitando asistentes de voz locales sin conexión a la nube.
- Atención al cliente con transcripción en vivo: integrado en sistemas de call center, puede transcribir conversaciones en tiempo real y detectar el idioma del interlocutor, alimentando sistemas de análisis de sentimiento o resúmenes automáticos.
- Archivado y búsqueda de audio: permite indexar grabaciones de audio (entrevistas, podcasts, material de investigación) convirtiéndolas a texto buscable, con detección automática del idioma para organizar el archivo.
- Investigación lingüística y documentación de lenguas minoritarias: su cobertura de dialectos y lenguas menos representadas facilita la transcripción de material de campo para estudios sociolingüísticos y preservación de lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (WER, CER, MMLU, etc.) en la información disponible. El informe técnico en arXiv (2601.21337) indica que la versión 1.7B alcanza resultados de última generación entre los modelos ASR de código abierto, pero no se proporcionan cifras concretas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, un modelo de 1.7B requiere aproximadamente 1-2 GB de VRAM; con Q8_0, alrededor de 2-3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, etc.). También puede ejecutarse en CPU con llama.cpp.
- Compatible con GPUs de consumo: sí, es un modelo compacto que cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, y motores compatibles con GGUF. La variante de Renesas está optimizada para el SoC X5H.
- Latencia y throughput: no disponible en la información consultada; dependerá del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B | 1.7B | 52 idiomas y dialectos | GGUF / safetensors | Apache 2.0 | no disponible |
| Qwen3-ASR-0.6B | 0.6B | 52 idiomas y dialectos | safetensors | Apache 2.0 | no disponible |
| Whisper large-v3 | 1.55B | 99 idiomas | safetensors / GGUF | MIT | 30 segundos de audio |

La comparativa con Whisper large-v3 es la más relevante por tamaño similar, aunque Qwen3-ASR añade identificación de idioma integrada y una arquitectura basada en Qwen3-Omni. No se dispone de datos de rendimiento comparativo (WER) entre ambos en la información consultada.

## Limitaciones y advertencias

- La model card original del repositorio slyusarev está vacía, por lo que no se dispone de información oficial sobre sesgos, limitaciones o advertencias específicas del autor.
- No se han publicado métricas detalladas de error (WER/CER) en la información disponible, lo que dificulta la evaluación objetiva del rendimiento.
- El soporte de 52 idiomas y dialectos puede implicar un rendimiento desigual entre idiomas, especialmente en lenguas con menos datos de entrenamiento.
- Riesgo de alucinación en transcripciones: como todo modelo generativo, puede producir texto que no corresponde fielmente al audio en condiciones de ruido o audio degradado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3-Omni del que deriva.
- El formato GGUF está orientado a inferencia; para fine-tuning será necesario utilizar los pesos originales en safetensors del repositorio QwenLM/Qwen3-ASR.

## Enlaces

- Repositorio HuggingFace (slyusarev): https://huggingface.co/slyusarev/Qwen3-ASR-1.7B-GGUF
- Repositorio HuggingFace (ggml-org): https://huggingface.co/ggml-org/Qwen3-ASR-1.7B-GGUF
- Repositorio HuggingFace (Renesas): https://huggingface.co/Renesas/Qwen3-ASR-1.7B-GGUF
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen3-ASR
- Informe técnico en arXiv: https://arxiv.org/html/2601.21337
- Página del modelo en Inferix: https://inferix.co/models/ggml-org/Qwen3-ASR-1.7B-GGUF
