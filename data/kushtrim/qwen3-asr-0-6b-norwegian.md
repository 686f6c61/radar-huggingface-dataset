# Kushtrim/Qwen3-ASR-0.6B-Norwegian

## Resumen

Kushtrim/Qwen3-ASR-0.6B-Norwegian es un modelo de reconocimiento automático del habla (ASR) especializado en noruego, obtenido mediante fine-tuning del modelo base Qwen/Qwen3-ASR-0.6B de Alibaba. El modelo original forma parte de la familia Qwen3-ASR, que soporta identificación de idioma y transcripción para 52 idiomas y dialectos, y se basa en el modelo multimodal Qwen3-Omni. Este fine-tuning concreto se ha entrenado específicamente para transcribir audio en noruego, con el objetivo de ofrecer una alternativa ligera (0,6B parámetros) para tareas de ASR en este idioma.

La relevancia del modelo radica en su tamaño reducido, que permite su despliegue en hardware modesto, y en su especialización lingüística, algo poco común en modelos ASR generalistas que suelen tener un rendimiento subóptimo en lenguas de baja representación como el noruego. Aunque el modelo está alojado en HuggingFace con licencia Apache 2.0, requiere aceptar condiciones de acceso (gated). El repositorio tiene solo 4 descargas y 0 likes, lo que indica una adopción muy temprana o nula, y no se han publicado evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (codificador de audio + LLM basado en Qwen3-Omni) |
| Parametros totales | 782.426.112 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | noruego (codigo ISO: no) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-ASR-0.6B, que combina un codificador de audio (basado en el módulo de audio de Qwen3-Omni) con un modelo de lenguaje ligero de 0,6B parámetros. El codificador convierte la señal de audio en representaciones que el LLM procesa para generar texto transcrito. No se dispone de detalles exactos sobre la arquitectura interna (número de capas, atención, etc.) en la información proporcionada.

El proceso de fine-tuning se ha realizado sobre el modelo base Qwen/Qwen3-ASR-0.6B, presumiblemente con datos de habla noruega, aunque no se especifican ni el volumen ni la composición del dataset de entrenamiento. Tampoco se indica si se emplearon técnicas como RLHF o DPO. La ficha del modelo en HuggingFace solo menciona que el fine-tuning está orientado a ASR general en noruego, y que el rendimiento óptimo se obtiene con audio limpio (mono, 16 kHz).

## Capacidades

- Transcripción de voz en noruego a texto.
- Reconocimiento automático del habla a partir de audio en formato mono de 16 kHz.
- Generación de transcripciones en texto plano, sin puntuación adicional ni capitalización automática (según convenciones del dataset de entrenamiento).
- No soporta tool calling, función de agente ni razonamiento multi-paso; es un modelo puramente de ASR.
- No se ha confirmado capacidad de identificación de idioma en este fine-tuning específico, aunque el modelo base sí la incluye para 52 idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio de reuniones de trabajo o entrevistas en noruego a texto, facilitando la generación de actas o resúmenes. Su tamaño reducido permite ejecutarlo en portátiles con GPU básica.
- Subtitulado de vídeos en noruego: integrado en un pipeline de procesamiento de vídeo, puede generar subtítulos automáticos para contenido audiovisual, útil para productoras o creadores de contenido.
- Dictado por voz para aplicaciones de productividad: se puede incorporar en editores de texto o herramientas de correo electrónico para transcribir dictados en noruego, con latencia aceptable en hardware consumer.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir grabaciones de llamadas en noruego para analizar sentimiento, detectar problemas recurrentes o extraer información estructurada.
- Accesibilidad: transcripción en tiempo real de conferencias o clases para personas con discapacidad auditiva, siempre que el audio sea limpio y la velocidad de habla moderada.
- Archivado y búsqueda de contenido audiovisual: transcribir archivos de audio históricos en noruego para hacerlos indexables y buscables en repositorios institucionales o bibliotecas digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de WER (Word Error Rate) ni comparaciones con otros modelos ASR para noruego en la ficha de HuggingFace ni en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en FP16, según una estimación de terceros (free2aitools). No hay datos oficiales.
- GPU recomendadas: tarjetas consumer con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050 o superiores. En CPU podría ejecutarse con lentitud, pero no se recomienda.
- Cabe en GPU consumer: sí, dado su tamaño de 0,6B parámetros.
- Opciones de despliegue: el modelo es compatible con la librería transformers de HuggingFace. También puede servirse mediante soluciones como vLLM o TGI si se adapta el pipeline de ASR, aunque estas herramientas están más orientadas a LLM. FriendliAI ofrece soporte de inferencia con cuantización (FP4, FP8, INT4, INT8) según la página del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo. A continuación se comparan características generales con modelos ASR de tamaño similar que soportan noruego:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kushtrim/Qwen3-ASR-0.6B-Norwegian | 782M | no disponible | noruego | Apache 2.0 | Gated en HF |
| Qwen/Qwen3-ASR-0.6B (base) | 782M | 4096 (según documentación de Qwen) | 52 idiomas | Apache 2.0 | Abierto en HF |
| Whisper small (OpenAI) | 244M | 448 (ventana de audio) | ~100 idiomas | MIT | Abierto en HF |
| Whisper medium (OpenAI) | 769M | 448 | ~100 idiomas | MIT | Abierto en HF |

El modelo se sitúa en la misma gama de parámetros que Whisper medium, pero está especializado en noruego, mientras que Whisper es multilingüe. No se puede afirmar que sea mejor o peor sin benchmarks.

## Limitaciones y advertencias

- El modelo está diseñado para audio limpio (mono, 16 kHz); el rendimiento degrada con ruido, acentos no representados en el dataset o grabaciones de baja calidad.
- No se ha evaluado en dominios específicos (médico, legal, técnico); puede fallar en vocabulario especializado.
- El acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos automatizados.
- Con solo 4 descargas y 0 likes, no hay evidencia de pruebas exhaustivas por parte de la comunidad; se recomienda validar el modelo en el caso de uso concreto antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-ASR-0.6B tiene sus propias condiciones que deben revisarse (Apache 2.0 también, según la documentación de Qwen).
- No se ha confirmado si el modelo conserva la capacidad de identificación de idioma del modelo base; es probable que esté limitado a noruego.
- Riesgo de alucinación en transcripciones ambiguas o con solapamiento de hablantes, similar a otros modelos ASR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kushtrim/Qwen3-ASR-0.6B-Norwegian
- Repositorio GitHub de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Página en FriendliAI (inferencia): https://friendli.ai/models/Kushtrim/Qwen3-ASR-0.6B-Norwegian
- Análisis en free2aitools: https://free2aitools.com/model/kushtrim/qwen3-asr-0.6b-norwegian
