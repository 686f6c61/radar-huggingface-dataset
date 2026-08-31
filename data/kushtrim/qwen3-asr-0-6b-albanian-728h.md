# Kushtrim/Qwen3-ASR-0.6B-Albanian-728h

## Resumen

Kushtrim/Qwen3-ASR-0.6B-Albanian-728h es un modelo de reconocimiento automático del habla (ASR) especializado en albanés (sq / Shqip), desarrollado por el usuario Kushtrim a partir del modelo base Qwen/Qwen3-ASR-0.6B de Alibaba. Se trata de un ajuste fino (fine-tuning) entrenado sobre aproximadamente 728 horas de audio albanés curado con sus transcripciones correspondientes, con el objetivo de ofrecer transcripción de voz de propósito general para esta lengua de bajos recursos en el ecosistema ASR.

El modelo hereda la arquitectura del Qwen3-ASR-0.6B, que forma parte de la familia Qwen3-ASR lanzada por QwenLM. Esta familia, compuesta por las variantes de 0.6B y 1.7B parámetros, se basa en el modelo multimodal Qwen3-Omni y soporta originalmente identificación de idioma y ASR para 52 lenguas y dialectos. El ajuste fino aquí presentado restringe el foco al albanés, mejorando presumiblemente la precisión en este idioma específico a costa de perder generalidad multilingüe.

El modelo cuenta con 782.426.112 parámetros totales (~0,78B), lo que lo sitúa en la gama de modelos ligeros, aptos para inferencia en hardware de consumo. Está publicado bajo licencia Apache 2.0, aunque su acceso es restringido (gated) en Hugging Face, requiriendo aceptación de condiciones previas. Es relevante ahora porque cubre una necesidad concreta: transcripción de albanés, un idioma con escasa representación en los modelos ASR comerciales y open source.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (basada en Qwen3-Omni, transformer multimodal audio-lenguaje) |
| Parametros totales | 782.426.112 (~0,78B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados por el autor; FriendliAI ofrece FP4, FP8, INT4 e INT8 para despliegue |
| Idiomas soportados | Albanés (sq) — el modelo base soporta 52 idiomas, pero este ajuste fino está especializado en albanés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-ASR-0.6B, que a su vez se fundamenta en Qwen3-Omni, una arquitectura multimodal que integra codificación de audio y decodificación de texto en un único transformer. El componente ASR del Qwen3-Omni fue entrenado con grandes volúmenes de datos de habla multilingüe y presenta capacidad de identificación de idioma, aunque el presente ajuste fino se centra exclusivamente en albanés.

El entrenamiento del modelo de Kushtrim se realizó sobre aproximadamente 728 horas de audio albanés cuidadosamente seleccionado, con transcripciones que siguen las convenciones del dataset empleado. No se especifican detalles sobre el proceso de ajuste (épocas, hiperparámetros, técnicas de regularización) ni si se aplicaron métodos de alineación como RLHF o DPO. El autor indica que el modelo funciona mejor con audio limpio, mono y muestreado a 16 kHz, con transcripciones que coincidan con las convenciones del conjunto de datos de entrenamiento.

## Capacidades

- Reconocimiento automático del habla (ASR) para albanés: transcribe audio hablado en albanés a texto.
- Identificación de idioma heredada del modelo base, aunque el ajuste fino puede degradar esta capacidad fuera del albanés.
- Generación de texto a partir de audio, utilizable con la API de Transformers (pipeline `automatic-speech-recognition`).
- Procesamiento de audio en formato mono a 16 kHz, como requisito recomendado para un rendimiento óptimo.
- Compatibilidad con el ecosistema Hugging Face Transformers y despliegue en plataformas de inferencia como FriendliAI.
- Posible capacidad de transcripción con marcas de tiempo o segmentación, no confirmada explícitamente.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en albanés: el modelo puede convertir grabaciones de audio (mono, 16 kHz) de reuniones de empresa o entrevistas periodísticas a texto, facilitando actas y búsquedas posteriores. Su tamaño reducido permite ejecutarlo en estaciones de trabajo con GPU de consumo.
- Subtitulado automático de vídeos en albanés: integrable en pipelines de postproducción para generar subtítulos de contenido audiovisual, ya sea en directo o en diferido, usando la API de Transformers con procesamiento por lotes.
- Asistencia a atención al cliente en albanés: transcripción de llamadas telefónicas grabadas para análisis de calidad, extracción de intenciones o generación de resúmenes, siempre que el audio cumpla las condiciones de calidad recomendadas.
- Archivado y digitalización de archivos de audio históricos en albanés: permite convertir grabaciones de radio, testimonios orales o documentos sonoros a texto, preservando y haciendo buscable el patrimonio lingüístico albanés.
- Entrenamiento de modelos NLP en albanés: el modelo puede servir como generador de datos de transcripción para crear corpus de texto a partir de audio, alimentando otros modelos de lenguaje o sistemas de búsqueda.
- Evaluación comparativa de sistemas ASR para albanés: al ser un modelo open source con licencia permisiva, puede utilizarse como referencia para comparar con soluciones comerciales o con otros modelos multilingües en la evaluación de precisión sobre datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se aportan métricas como WER (Word Error Rate) o CER (Character Error Rate) sobre conjuntos de prueba estándar para albanés, ni comparaciones con otros modelos ASR. Se recomienda evaluar el modelo sobre datos propios antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 782M parámetros, en FP16 el modelo ocupa aproximadamente 1,6 GB de memoria, y en FP32 unos 3,1 GB. Con cuantización INT8 (ofrecida por FriendliAI) se reduce a ~0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes. También puede ejecutarse en CPU con memoria RAM suficiente (se recomiendan al menos 8 GB para FP16).
- Sí cabe en GPU de consumo: es adecuado para tarjetas de gama media y baja.
- Opciones de despliegue: la librería Transformers de Hugging Face (pipeline `automatic-speech-recognition`), vLLM (si se adapta al modelo de audio), y servicios gestionados como FriendliAI que ofrecen cuantización y batching continuo.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la cuantización y el tamaño del lote. En una GPU como RTX 4090 se esperan latencias de decodificación en el orden de decenas de milisegundos por segmento de audio, pero sin datos publicados no se puede precisar.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (base) | ~0,78B | 52 | no disponible | Apache 2.0 | Multilingüe, sin ajuste específico para albanés |
| Qwen3-ASR-0.6B-Albanian (550h) | ~0,78B | albanés | no disponible | Apache 2.0 | Versión anterior con 550h de entrenamiento |
| Kushtrim/Qwen3-ASR-0.6B-Albanian-728h | ~0,78B | albanés | no disponible | Apache 2.0 | Este modelo, con 728h de entrenamiento |
| Whisper small (openai) | 244M | ~100 | no aplica | MIT | Modelo ASR multilingüe de referencia, pero con menor capacidad para albanés que un ajuste dedicado |

No se dispone de métricas comparativas (WER) entre estos modelos. La ventaja del modelo de Kushtrim radica en su especialización en albanés, mientras que Whisper small ofrece cobertura multilingüe pero probablemente peor rendimiento en albanés que un modelo ajustado específicamente.

## Limitaciones y advertencias

- Acceso restringido (gated): el modelo requiere aceptar condiciones en Hugging Face antes de su descarga, lo que puede dificultar su integración en entornos automatizados.
- Rendimiento óptimo solo con audio limpio, mono y muestreado a 16 kHz. Audio con ruido, múltiples hablantes o baja calidad puede degradar significativamente la transcripción.
- El modelo está especializado en albanés; su uso en otros idiomas probablemente producirá resultados deficientes o nulos.
- No se han publicado evaluaciones formales, por lo que se desconoce su precisión real (WER) y su comportamiento en escenarios adversos.
- Riesgo de alucinaciones en transcripción: como cualquier modelo ASR, puede generar texto plausible pero incorrecto en segmentos ambiguos o con ruido.
- El tamaño del repositorio (4,7 GB) sugiere que puede incluir pesos en FP32 o múltiples archivos, lo que aumenta los requisitos de almacenamiento frente a versiones cuantizadas.
- No hay información sobre el proceso de curado del dataset de entrenamiento, lo que podría implicar sesgos en voces, acentos o dominios específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kushtrim/Qwen3-ASR-0.6B-Albanian-728h
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio oficial de Qwen3-ASR en GitHub: https://github.com/QwenLM/Qwen3-ASR
- Página de despliegue en FriendliAI: https://friendli.ai/models/Kushtrim/Qwen3-ASR-0.6B-Albanian-728h
- Variante anterior con 550h: https://huggingface.co/Kushtrim/Qwen3-ASR-0.6B-Albanian
