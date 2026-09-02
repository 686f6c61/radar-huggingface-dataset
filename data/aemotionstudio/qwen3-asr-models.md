# AEmotionStudio/qwen3-asr-models

## Resumen

`AEmotionStudio/qwen3-asr-models` es un repositorio espejo (mirror) no oficial que replica dos modelos de reconocimiento de voz de Alibaba Qwen, ambos bajo licencia Apache-2.0: `Qwen3-ASR-1.7B` y `Qwen3-ForcedAligner-0.6B`. El primero es un modelo de transcripción automática de voz (ASR) multilingüe diseñado para manejar habla, canto y canciones con música de fondo, mientras que el segundo proporciona alineación forzada para obtener marcas de tiempo a nivel de palabra o carácter. El repositorio está organizado para ser consumido por el gestor de descargas de MAESTRO, una herramienta de transcripción de letras, aunque los archivos son idénticos a los originales de Qwen (safetensors en bf16, con hashes sha256 verificados).

La relevancia actual de este modelo radica en que Qwen3-ASR-1.7B se posiciona como uno de los mejores modelos de ASR open-source disponibles, gracias a su base en la arquitectura de audio de Qwen3-Omni y a su capacidad para reconocer 52 lenguas y dialectos, incluyendo 22 dialectos chinos. Además, su resistencia a audio difícil (voz cantada, música de fondo) lo hace especialmente útil para aplicaciones de transcripción musical y de contenido audiovisual. El mirror facilita la descarga directa de ambos componentes sin depender de la infraestructura de HuggingFace de Qwen, aunque no añade ninguna modificación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3-Omni (modelo de audio, transformer) |
| Parametros totales | 1.7B (Qwen3-ASR-1.7B) y 0.6B (Qwen3-ForcedAligner-0.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (safetensors, sin cuantizar) |
| Idiomas soportados | 52 lenguas y dialectos (30 lenguas + 22 dialectos chinos) segun la documentacion tecnica de Qwen; la model card del mirror menciona 30 lenguas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-ASR-1.7B y Qwen3-ForcedAligner-0.6B son modelos end-to-end de reconocimiento de voz derivados del modelo fundacional Qwen3-Omni. La arquitectura es un transformer con componentes de audio diseñados para procesar señales de voz directamente, sin necesidad de un módulo acústico separado. El entrenamiento se realizó con datos de voz a gran escala, aunque no se han publicado detalles específicos sobre el número de tokens o la composición exacta del dataset en la información disponible. No se mencionan técnicas de RLHF o DPO; el enfoque principal es la supervisión directa sobre pares audio-texto.

Una innovación destacable es la capacidad de identificación de idioma integrada: el modelo no solo transcribe, sino que detecta automáticamente la lengua hablada, lo que facilita su uso en entornos multilingües sin configuración previa. Además, el modelo está específicamente entrenado para manejar voz cantada y canciones con acompañamiento musical, un área donde los ASR tradicionales suelen fallar. El componente de alineador forzado complementa al ASR generando marcas de tiempo precisas a nivel de palabra o carácter, útil para subtitulado sincronizado.

## Capacidades

- Transcripción automática de voz (ASR) en 52 lenguas y dialectos, incluyendo 30 lenguas principales y 22 dialectos chinos.
- Identificación automática del idioma hablado, sin necesidad de especificar la lengua de entrada.
- Reconocimiento robusto de voz cantada, incluyendo canciones con música de fondo y voces superpuestas.
- Generación de marcas de tiempo a nivel de palabra o carácter mediante el alineador forzado (Qwen3-ForcedAligner-0.6B).
- Procesamiento de audio en formato de onda continua, sin necesidad de segmentación previa.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de reconocimiento de voz.
- Capacidades multilingües amplias, con énfasis en lenguas asiáticas y dialectos chinos, además de inglés y otros idiomas europeos.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede convertir grabaciones de audio en texto con alta precisión, identificando automáticamente el idioma de cada interlocutor en entornos multilingües. Su robustez frente a ruido de fondo lo hace adecuado para salas con múltiples participantes.
- Subtitulado automático de vídeo: combinando Qwen3-ASR-1.7B con el alineador forzado, se pueden generar subtítulos sincronizados a nivel de palabra, lo que reduce drásticamente el tiempo de postproducción en contenidos de vídeo.
- Transcripción de letras de canciones: gracias a su entrenamiento específico en voz cantada, el modelo puede transcribir letras incluso cuando hay música de acompañamiento, algo que falla en la mayoría de ASR convencionales. Es ideal para servicios de karaoke o plataformas de música.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir llamadas telefónicas para su posterior análisis de sentimiento o cumplimiento normativo, con soporte multilingüe para operaciones internacionales.
- Generación de actas médicas o legales: en entornos donde se requiere documentación precisa de dictados o entrevistas, el modelo ofrece transcripciones fiables que pueden integrarse en flujos de trabajo de documentación automática.
- Archivado y búsqueda de contenido de audio: al transcribir archivos de audio históricos (podcasts, entrevistas, programas de radio), se habilita la búsqueda por texto dentro de colecciones grandes de audio, mejorando la accesibilidad de los archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La documentacion tecnica de Qwen indica que Qwen3-ASR-1.7B alcanza un rendimiento de ultima generacion entre los modelos ASR de codigo abierto, pero no se proporcionan cifras concretas de WER (Word Error Rate) u otras metricas. Se recomienda consultar las model cards originales de Qwen para obtener datos comparativos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.5 GB para Qwen3-ASR-1.7B en bf16 (1.7B parametros × 2 bytes), y alrededor de 1.2 GB para el alineador de 0.6B. En la practica, se recomienda al menos 8 GB de VRAM para margen y procesamiento de audio.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM, como NVIDIA RTX 3060/4060, RTX 3090, A10, A100, H100. Para despliegues en produccion con alta concurrencia, se recomienda A100 o H100.
- Cabe en GPUs de consumo: si, en tarjetas como RTX 3060 12GB, RTX 4070, etc., siempre que se utilice bf16 o cuantizacion adicional si se requiere.
- Opciones de despliegue: vLLM (segun la documentacion de AI-Guru, soporta endpoints compatibles con OpenAI), HuggingFace Transformers, y potencialmente otros frameworks como Faster-Whisper o CTranslate2 si se convierten los pesos. No se ha confirmado soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada. Se estima que en una GPU moderna la transcripcion en tiempo real es factible, pero los valores exactos dependen del hardware y la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (este) | 1.7B | 52 lenguas y dialectos | No disponible | Apache-2.0 | safetensors |
| Qwen3-ASR-0.6B | 0.6B | 52 lenguas y dialectos | No disponible | Apache-2.0 | safetensors |
| Whisper large-v3 | 1.55B | 99 idiomas | 30 segundos de audio | MIT | safetensors, GGUF |
| Parakeet (NVIDIA) | 1.1B | 40+ idiomas | No disponible | CC-BY-4.0 | ONNX, TensorRT |

La comparativa se basa en parametros publicos. Whisper large-v3 tiene un soporte de idiomas mas amplio (99) y una licencia MIT mas permisiva, pero no esta especificamente entrenado para voz cantada. Parakeet ofrece un rendimiento competitivo en ingles y es optimizado para NVIDIA, pero su soporte multilingue es menor. Qwen3-ASR-1.7B destaca por su robustez en audio musical y su cobertura de dialectos chinos, algo unico en el ecosistema open-source.

## Limitaciones y advertencias

- El repositorio es un mirror no oficial de AEmotionStudio; aunque los archivos son identicos a los de Qwen (verificados por sha256), no hay garantia de mantenimiento ni soporte por parte del equipo original.
- No se incluye la variante Qwen3-ASR-0.6B en este mirror; solo estan disponibles el modelo de 1.7B y el alineador de 0.6B.
- La informacion sobre benchmarks y rendimiento cuantitativo es limitada; se recomienda evaluar el modelo en el dominio especifico de uso antes de desplegarlo en produccion.
- El modelo puede presentar errores en acentos regionales poco comunes o en audio con ruido extremo, aunque su entrenamiento en canto y musica reduce este riesgo en comparacion con otros ASR.
- No se conocen sesgos especificos documentados, pero como modelo de ASR, puede tener un rendimiento desigual entre idiomas; los dialectos chinos tienen una cobertura mas amplia que otras lenguas minoritarias.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente el trabajo original de Alibaba Qwen.
- Para produccion, se recomienda utilizar vLLM u otros servidores de inferencia optimizados; el despliegue manual con Transformers puede requerir ajustes de memoria y gestion de batch.

## Enlaces

- Repositorio mirror: https://huggingface.co/AEmotionStudio/qwen3-asr-models
- Modelo original Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo original Qwen3-ForcedAligner-0.6B: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio GitHub de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Documentacion de integracion con vLLM (AI-Guru): https://github.com/AI-Guru/ai_services/blob/main/models/qwen3-asr/README.md
- Ficha en OpenASR: https://openasr.org/models/qwen3-asr-1.7b/
- Referencia de API en Alibaba Cloud: https://www.alibabacloud.com/help/en/model-studio/qwen-asr-api-reference
