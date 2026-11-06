# luokelabs/Qwen3-ASR-1.7B-8bit

## Resumen

Qwen3-ASR-1.7B-8bit es una conversión al formato MLX del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión concreta la publica el usuario luokelabs (la model card referencia el repositorio de mlx-community) y está pensada para ejecutarse en hardware Apple Silicon mediante la librería mlx-audio, que actúa como motor de inferencia especializado en tareas de speech-to-text.

El modelo resuelve el problema de la transcripción de audio a texto con un transformer de aproximadamente 2.038 millones de parámetros (unos 1.700 millones en el modelo base, según nomenclatura) cuantizado a 8 bits, lo que reduce el peso del repositorio a 2,5 GB. Al estar empaquetado en MLX, permite ejecutar ASR localmente en Macs con chip M-series sin depender de servicios en la nube ni de CUDA.

Su relevancia actual radica en la combinación de un modelo ASR de la familia Qwen3 con un runtime optimizado para Apple Silicon y una licencia Apache 2.0 permisiva. No obstante, la información publicada es muy escasa: no se detallan idiomas soportados, benchmarks ni datos de entrenamiento, por lo que muchas especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para reconocimiento automático de voz (ASR), conversión MLX del modelo Qwen/Qwen3-ASR-1.7B |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta versión); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible indica únicamente que se trata de una conversión a MLX del modelo Qwen/Qwen3-ASR-1.7B, realizada con mlx-audio versión 0.3.1. No se especifican detalles sobre la arquitectura interna (número de capas, dimensión del encoder de audio, mecanismo de atención, tipo de tokenizador acústico) ni sobre el proceso de entrenamiento (número de horas de audio, composición del dataset, uso de RLHF o DPO).

Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa, atención lineal o estrategias de streaming. La única característica técnica confirmada es la cuantización a 8 bits y el empaquetado en formato MLX para inferencia en Apple Silicon. Para cualquier detalle adicional sobre arquitectura y entrenamiento, la model card remite a la model card del modelo original de Qwen.

## Capacidades

- Transcripción de audio a texto (speech-to-text) mediante la librería mlx-audio.
- Ejecución local en Apple Silicon (MLX), sin necesidad de GPU NVIDIA.
- Interfaz de línea de comandos (`python -m mlx_audio.stt.generate`) y API de Python (`load_model`, `generate_transcription`).
- Salida en formato de texto plano (`format="txt"`).
- Cuantización a 8 bits para reducir huella de memoria.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo puede procesar archivos de audio en un Mac con chip M-series mediante mlx-audio, evitando enviar grabaciones confidenciales a servicios en la nube.
- Subtitulado de vídeos y podcasts: se puede invocar la CLI de mlx-audio sobre cada pista de audio para generar un archivo de texto que luego se sincronice con el vídeo.
- Prototipado rápido de aplicaciones de dictado: la API de Python permite integrar la transcripción en scripts o notebooks en pocas líneas, útil para validar ideas de producto sin infraestructura adicional.
- Investigación en ASR sobre hardware Apple: sirve como baseline cuantizado para comparar calidad de transcripción frente a otras alternativas en MLX.
- Automatización de actas en entornos macOS: pipelines que recogen audio de reuniones y generan borradores de texto que luego se revisan manualmente.
- Accesibilidad: generación de transcripciones de contenido hablado para personas con discapacidad auditiva en flujos de trabajo locales.
- Procesamiento por lotes de archivos de audio en un equipo de desarrollo: la CLI permite iterar sobre directorios de audios sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 2,5 GB en cuantización de 8 bits, por lo que se recomienda al menos 4 GB de memoria unificada libre para cargar el modelo y procesar audio.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No es compatible de forma nativa con CUDA.
- Cabe en consumer hardware: sí, en cualquier Mac con chip M-series con memoria suficiente (8 GB o más recomendable).
- Opciones de despliegue: mlx-audio (CLI y Python). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Runtime | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-8bit (este) | 2.038.052.480 | no disponible | Apache 2.0 | MLX (mlx-audio) | HuggingFace |
| Qwen/Qwen3-ASR-1.7B (base) | ~1.700 millones (según nomenclatura) | no disponible | Apache 2.0 | PyTorch / otros | HuggingFace |
| Whisper large-v3 | no disponible en la información | no disponible | MIT (según modelo original, no verificado aquí) | múltiples | HuggingFace |
| Alternativas ASR en MLX | no disponible | no disponible | variable | MLX | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La información publicada es mínima: no hay idiomas declarados, ni benchmarks, ni detalles de entrenamiento, lo que dificulta evaluar su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.
- Al ser una conversión de terceros (luokelabs / mlx-community) y no el modelo oficial de Qwen, pueden existir diferencias de comportamiento respecto al original.
- La cuantización a 8 bits puede degradar ligeramente la precisión de transcripción frente al modelo en precisión completa; no se han publicado métricas al respecto.
- Solo funciona en hardware Apple Silicon con MLX; no es desplegable en GPUs NVIDIA ni en entornos CPU convencionales sin conversión adicional.
- Riesgo de alucinación en audio con ruido, acentos no representados en el entrenamiento o idiomas no cubiertos; no se documenta la cobertura lingüística.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo Qwen conviene verificar los términos del modelo original.
- No se documentan limitaciones de contexto ni de duración máxima de audio; se desconoce el comportamiento con grabaciones largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luokelabs/Qwen3-ASR-1.7B-8bit
- Modelo original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Librería mlx-audio: no disponible enlace directo en la información proporcionada
- Repositorio mlx-community referenciado: https://huggingface.co/mlx-community/Qwen3-ASR-1.7B-8bit
