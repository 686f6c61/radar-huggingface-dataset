# Kushtrim/Qwen3-ASR-1.7B-Norwegian-2306

## Resumen

El modelo Kushtrim/Qwen3-ASR-1.7B-Norwegian-2306 es un fine-tune del sistema de reconocimiento automático de voz (ASR) Qwen3-ASR-1.7B, desarrollado por el usuario Kushtrim, especializado en la transcripción de audio en noruego. Se basa en la arquitectura Qwen3-ASR de Alibaba, que a su vez aprovecha la comprensión de audio del modelo fundacional Qwen3-Omni y soporta originalmente 52 idiomas. Este ajuste fino reduce el alcance al noruego, con el objetivo de mejorar la precisión y robustez en ese idioma específico, probablemente mediante datos de habla noruega.

El modelo mantiene la licencia Apache-2.0 del original, aunque su acceso en Hugging Face es restringido (gated) y requiere aceptar condiciones adicionales. Con aproximadamente 2 000 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en hardware de consumo con cuantización, y está pensado para desarrolladores que necesiten transcripción fiable en noruego sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (modelo de audio-lenguaje basado en Qwen3-Omni) |
| Parametros totales | 2 038 052 480 (aprox. 2 000 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado; el repositorio contiene safetensors en precisión completa (probablemente FP32) |
| Idiomas soportados | noruego (fine-tune específico; el modelo base soporta 52 idiomas y dialectos) |
| Licencia | Apache-2.0 (con acceso restringido en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3-ASR-1.7B, que forma parte de la familia Qwen3-ASR lanzada por Alibaba. Esta familia emplea una arquitectura de modelo de lenguaje de audio multimodal, derivada de Qwen3-Omni, que combina un encoder de audio con un decoder de texto autoregresivo. El modelo base fue entrenado con grandes volúmenes de datos de habla y logra un rendimiento de vanguardia entre los sistemas ASR de código abierto, según el repositorio oficial. También incluye capacidades de identificación de idioma (LID) para 52 idiomas y dialectos.

No se dispone de información pública sobre los datos de entrenamiento específicos del fine-tune noruego (número de horas, composición del dataset, técnicas de alineación como RLHF o DPO). Se asume que el ajuste se realizó con datos de habla noruega, pero no hay detalles verificables en la documentación disponible.

## Capacidades

- Transcripción de audio a texto en noruego (bokmål y posiblemente nynorsk, aunque no se especifica).
- Identificación de idioma heredada del modelo base, aunque el fine-tune está orientado a noruego.
- Reconocimiento de voz en tiempo real o por lotes, dependiendo del backend de inferencia.
- Soporte de audio multilingüe en teoría (el base soporta 52 idiomas), pero el fine-tune puede degradar el rendimiento en otros idiomas.
- Sin soporte de tool calling, agentes o razonamiento multi-paso al ser un modelo puramente ASR.

## Casos de uso

- Subtitulado automático de vídeos en noruego: el modelo puede transcribir pistas de audio de vídeos para generar subtítulos, útil en plataformas de streaming o contenido educativo.
- Transcripción de reuniones y entrevistas: procesar grabaciones de reuniones o entrevistas en noruego para generar actas o resúmenes textuales.
- Asistencia por voz en aplicaciones locales: integrar el modelo en asistentes de voz o aplicaciones de dictado que requieran procesamiento offline en noruego.
- Análisis de llamadas de atención al cliente: transcribir llamadas telefónicas en noruego para extraer información, detectar sentimiento o generar informes.
- Archivado y búsqueda de contenido audiovisual: convertir archivos de audio o vídeo en texto para indexar y permitir búsquedas por contenido en bibliotecas noruegas.
- Herramientas de accesibilidad: generar transcripciones en tiempo real para personas con discapacidad auditiva en entornos donde se hable noruego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas como WER (Word Error Rate) o comparativas con otros modelos ASR noruegos en la documentación del repositorio ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 12,2 GB, lo que sugiere pesos en FP32 (aproximadamente 8 GB para 2 000 millones de parámetros). Para inferencia en FP16 se necesitarían unos 4 GB de VRAM, y con cuantización INT8 unos 2 GB.
- GPU recomendadas: para FP16, una GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, etc.) es suficiente. Para FP32, se recomienda al menos 12 GB (RTX 3060 12GB, RTX 4070 Ti, etc.).
- Sí cabe en GPUs de consumo, especialmente con cuantización.
- Opciones de despliegue: compatible con librerías transformers (Hugging Face), vLLM, TGI, y posiblemente llama.cpp si se convierte a GGUF, aunque no hay versiones GGUF oficiales.
- Latencia y throughput: no se han publicado datos específicos. Al ser un modelo de 2B, la latencia es moderada, apta para inferencia en tiempo real en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|
| Qwen3-ASR-1.7B (base) | 2 000 M | 52 | Apache-2.0 | Rendimiento SOTA entre ASR open-source, multilingüe |
| Kushtrim/Qwen3-ASR-1.7B-Norwegian-2306 | 2 000 M | noruego (fine-tune) | Apache-2.0 | Especializado en noruego, acceso restringido |
| Whisper large-v3 | 1 500 M | 99 | MIT | Muy popular, multilingüe, pero sin fine-tune específico para noruego |

No hay datos de rendimiento comparativo (WER) disponibles, por lo que la comparación se limita a características generales.

## Limitaciones y advertencias

- El acceso al modelo está restringido en Hugging Face; es necesario aceptar condiciones adicionales, lo que puede limitar su uso en entornos corporativos o automatizados.
- Al ser un fine-tune específico para noruego, el rendimiento en otros idiomas puede degradarse significativamente respecto al modelo base.
- No se dispone de información sobre sesgos específicos o riesgos de alucinación en la transcripción; como todo ASR, puede cometer errores en acentos, ruido o habla superpuesta.
- La longitud de contexto no está documentada, lo que puede limitar la duración máxima de audio que puede procesarse en una sola pasada.
- El modelo no incluye capacidades de tool calling ni razonamiento, por lo que no es adecuado para tareas de agente o conversacionales más allá de la transcripción.
- La licencia Apache-2.0 permite uso comercial, pero el acceso gated puede implicar términos adicionales no especificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kushtrim/Qwen3-ASR-1.7B-Norwegian-2306
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Página del modelo en FriendliAI: https://friendli.ai/models/Kushtrim/Qwen3-ASR-1.7B-Norwegian
