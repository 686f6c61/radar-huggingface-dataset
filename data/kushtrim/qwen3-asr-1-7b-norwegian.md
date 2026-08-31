# Kushtrim/Qwen3-ASR-1.7B-Norwegian

## Resumen

Kushtrim/Qwen3-ASR-1.7B-Norwegian es un modelo de reconocimiento automático del habla (ASR) fine-tuneado sobre Qwen/Qwen3-ASR-1.7B, desarrollado por el usuario Kushtrim para transcribir audio en noruego. El modelo base, Qwen3-ASR, es una serie de sistemas ASR open-source creados por QwenLM que soportan identificación de idioma y transcripción para 52 idiomas y dialectos, basándose en la capacidad de comprensión auditiva del modelo fundacional Qwen3-Omni.

Este fine-tuning específico adapta el modelo base a las particularidades del noruego, tanto bokmål como nynorsk, con el objetivo de mejorar la precisión en transcripciones de este idioma. El modelo tiene aproximadamente 2.040 millones de parámetros (2.038.052.480), un tamaño compacto que permite su ejecución en GPUs de consumo medio. Está disponible bajo licencia Apache-2.0, aunque su acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace.

La relevancia de este modelo reside en que cubre una necesidad concreta: ASR de alta calidad para un idioma de baja representación como el noruego, aprovechando un modelo base robusto y multilingüe. Es adecuado para desarrolladores que buscan transcribir audio en noruego sin depender de servicios propietarios, con la flexibilidad de un modelo open-source y la posibilidad de cuantización para despliegues ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3-Omni (encoder de audio + decoder de lenguaje), no se especifican más detalles en la información disponible |
| Parametros totales | 2.038.052.480 (~2,04B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados; compatible con cuantización estándar (FP16, INT8, etc.) |
| Idiomas soportados | Noruego (fine-tuning); el modelo base soporta 52 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3-ASR-1.7B, que pertenece a la familia Qwen3-ASR desarrollada por QwenLM. Esta familia se basa en el modelo fundacional Qwen3-Omni, que integra un encoder de audio capaz de procesar señales de habla y un decoder de lenguaje que genera transcripciones. Qwen3-ASR-1.7B fue preentrenado con grandes volúmenes de datos de habla multilingüe y soporta identificación de idioma y ASR para 52 lenguas. El fine-tuning realizado por Kushtrim adapta este modelo al noruego, presumiblemente con un dataset de transcripciones noruegas, aunque no se han publicado detalles sobre el volumen de datos, el proceso de entrenamiento ni si se emplearon técnicas como RLHF o DPO. No hay información pública sobre innovaciones técnicas específicas en este fine-tuning.

## Capacidades

- Transcripción de voz a texto en noruego (bokmål y nynorsk) a partir de audio limpio.
- Identificación de idioma (heredada del modelo base, que soporta 52 idiomas).
- Procesamiento de audio en formato mono a 16 kHz, según las convenciones del modelo base.
- Generación de texto transcrito con puntuación básica (depende del dataset de fine-tuning).
- No se han documentado capacidades de tool calling, razonamiento multi-paso ni soporte para agentes.
- La salida es texto plano, sin etiquetas de tiempo ni diarización de hablantes.

## Casos de uso

- Subtitulado automático de vídeos en noruego: el modelo puede transcribir pistas de audio de vídeos o podcasts, generando subtítulos en texto que luego se pueden sincronizar manualmente. Su tamaño compacto permite procesarlo en lote en GPUs de gama media.
- Transcripción de reuniones y entrevistas: ideal para generar actas o resúmenes de conversaciones en noruego, siempre que el audio sea de buena calidad y con pocos solapamientos de hablantes.
- Asistentes de voz para aplicaciones noruegas: integrable como backend de reconocimiento de voz en asistentes domésticos o aplicaciones móviles, aunque requiere un pipeline adicional para manejo de intenciones.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos históricos en noruego para permitir búsqueda por texto dentro de colecciones de audio o vídeo.
- Accesibilidad: generación de transcripciones en tiempo real o diferido para personas con discapacidad auditiva en entornos educativos o corporativos noruegos.
- Investigación lingüística: análisis de corpus orales noruegos, permitiendo extraer datos textuales de grabaciones para estudios fonéticos o sociolingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas como WER (Word Error Rate) ni comparaciones con otros modelos ASR para noruego. Se recomienda evaluar el modelo en el dominio objetivo antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16 (según estimaciones de free2aitools para la versión "old"); con cuantización INT8 podría reducirse a ~2 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 2060, RTX 3060, o GPUs de datacenter como T4 o A10.
- Es compatible con GPUs de consumo (consumer) como la serie RTX 30/40.
- Opciones de despliegue: transformers (pipeline de ASR), vLLM, llama.cpp (si se convierte a GGUF), TGI, o plataformas como FriendliAI que ofrecen inferencia optimizada con cuantización FP4/FP8/INT4/INT8.
- Latencia y throughput: no se han publicado valores exactos; para un modelo de ~2B parámetros en una GPU moderna se espera una latencia de decenas de milisegundos por segmento de audio, dependiendo de la longitud y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Kushtrim/Qwen3-ASR-1.7B-Norwegian | ~2,04B | No disponible | Noruego (fine-tuning) | Apache-2.0 | Acceso restringido (gated) |
| Qwen/Qwen3-ASR-1.7B (base) | ~1,7B | No disponible (probablemente 4K) | 52 idiomas | Apache-2.0 | Modelo base multilingüe, sin fine-tuning específico |
| Whisper small (openai) | 244M | 448 tokens de audio | 96 idiomas | MIT | Más pequeño, pero con menor precisión en noruego que un fine-tuning dedicado |

No se dispone de datos de benchmark que permitan una comparación cuantitativa. La comparativa es cualitativa: el modelo de Kushtrim está especializado en noruego, mientras que Whisper small es más ligero pero menos preciso en idiomas de bajos recursos. El modelo base Qwen3-ASR-1.7B es multilingüe, pero no está optimizado específicamente para noruego.

## Limitaciones y advertencias

- El rendimiento depende fuertemente del dominio, acento y condiciones de ruido del audio; funciona mejor con grabaciones limpias (mono, 16 kHz) y puede degradarse con audio de baja calidad o acentos regionales marcados.
- El acceso al modelo está restringido (gated) en HuggingFace, lo que requiere que el usuario acepte las condiciones de uso antes de descargarlo.
- No se han publicado métricas de error (WER) ni evaluaciones exhaustivas, por lo que su precisión real es desconocida hasta que se pruebe en un corpus de validación.
- Al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales, aunque no se han documentado casos específicos.
- Riesgo de alucinación en transcripciones: en segmentos ambiguos o con ruido, el modelo podría generar texto plausible pero incorrecto.
- No soporta diarización de hablantes ni marcas de tiempo; para esos casos se requiere un postprocesado adicional.
- La licencia Apache-2.0 permite uso comercial, pero el acceso gated puede implicar restricciones adicionales impuestas por el autor.

## Enlaces

- [HuggingFace - Kushtrim/Qwen3-ASR-1.7B-Norwegian](https://huggingface.co/Kushtrim/Qwen3-ASR-1.7B-Norwegian)
- [HuggingFace - Versión anterior (old)](https://huggingface.co/Kushtrim/Qwen3-ASR-1.7B-Norwegian-old)
- [GitHub - QwenLM/Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR)
- [FriendliAI - Página del modelo](https://friendli.ai/models/Kushtrim/Qwen3-ASR-1.7B-Norwegian)
- [Free2AITools - Análisis del modelo old](https://free2aitools.com/model/kushtrim/qwen3-asr-1.7b-norwegian-old)
