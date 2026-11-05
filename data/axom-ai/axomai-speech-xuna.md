# axom-ai/axomai-speech-xuna

## Resumen

AxomAI Speech Xuna es un modelo de reconocimiento automático del habla (ASR) especializado en assamés (código ISO `as`), desarrollado por axom-ai. Se distribuye en formato ONNX con arquitectura Conformer y está diseñado explícitamente para inferencia en streaming, lo que lo orienta a transcripción en tiempo real más que a procesamiento por lotes de audio completo. El repositorio ocupa 2,6 GB y el acceso está restringido: es necesario aceptar las condiciones en HuggingFace antes de descargarlo.

El modelo se presenta como una solución de "zero-hallucination" para speech-to-text en assamés, un idioma de bajos recursos donde la mayoría de los ASR multilingües tienen un rendimiento pobre y tienden a producir texto inventado cuando la señal acústica es ambigua o ruidosa. La propuesta de valor es, por tanto, doble: cobertura de un idioma poco atendido y control de alucinaciones en producción.

La información pública disponible es muy limitada: no se han publicado especificaciones de parámetros, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. La licencia es propietaria (`axom-ai-proprietary`), lo que condiciona fuertemente cualquier uso comercial. Esta ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder ASR), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (orientado a streaming por chunks) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | assamés (`as`) |
| Licencia | axom-ai-proprietary (propietaria, acceso restringido) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 2,6 GB |
| Pipeline | automatic-speech-recognition |
| Acceso | gated (requiere aceptar condiciones) |
| Requiere código custom | sí (`custom_code`) |

## Arquitectura y entrenamiento

La arquitectura declarada es Conformer, un transformer convolucional que combina bloques de auto-atención con convoluciones depthwise para capturar dependencias locales y globales en la señal de audio. Es una elección habitual en ASR moderno porque equilibra precisión acústica y coste computacional, y su naturaleza causal o por chunks permite inferencia en streaming. El modelo se distribuye como grafo ONNX, lo que sugiere un objetivo de despliegue en entornos de producción sin dependencia de frameworks de deep learning completos (ONNX Runtime, por ejemplo).

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia `custom-assamese-speech`), el uso de técnicas de aumento de datos, ni si hubo etapas de ajuste fino con RLHF o DPO (poco habituales en ASR). La etiqueta `zero-hallucination` indica que el entrenamiento o la decodificación incorporan algún mecanismo para suprimir salidas inventadas, pero no se detalla cuál: podría ser un umbral de confianza en la decodificación, un modelo de rechazo o una estrategia de entrenamiento con datos negativos. Tampoco se especifica el tokenizer ni el tipo de decodificación (CTC, attention-based o híbrida).

## Capacidades

- Reconocimiento automático del habla en assamés, con salida de texto plano.
- Inferencia en streaming: procesa audio por fragmentos, adecuado para transcripción en vivo.
- Diseño orientado a la supresión de alucinaciones ("zero-hallucination"), es decir, a evitar texto inventado en segmentos con ruido o silencio.
- Exportación ONNX con código custom, lo que permite integración en runtimes ligeros.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado capacidad multilingüe más allá del assamés.
- No se ha documentado diarización de hablantes, puntuación automática ni marcas de tiempo a nivel de palabra.

## Casos de uso

- Transcripción en tiempo real de reuniones y entrevistas en assamés: el modo streaming y el formato ONNX permiten desplegar el modelo en un servidor ligero que recibe audio por WebSocket y devuelve texto parcial, sin necesidad de esperar al final de la grabación.
- Subtitulado de contenido audiovisual en assamés: integrado en un pipeline de extracción de audio y segmentación por VAD, el modelo puede generar subtítulos para vídeo educativo o divulgativo dirigido a hablantes de assamés.
- Atención al ciudadano en administraciones de Assam: transcripción de llamadas o mensajes de voz en un servicio de atención telefónica, donde la supresión de alucinaciones reduce el riesgo de registrar texto falso en actas o tickets.
- Documentación clínica dictada: médicos que dictan notas en assamés pueden usar el modelo para convertir voz a texto editable, con revisión humana posterior; el control de alucinaciones es crítico en este dominio.
- Archivado y búsqueda de audio histórico: transcripción de grabaciones de radio, entrevistas o archivos orales en assamés para indexación y búsqueda textual, aprovechando que el modelo está especializado en un único idioma y evita la confusión entre lenguas típica de los modelos multilingües.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en vivo de clases o eventos en assamés, desplegando el modelo ONNX en el dispositivo o en un servidor local para minimizar la latencia.
- Investigación lingüística de bajos recursos: obtención de transcripciones preliminares de corpus orales en assamés para análisis fonético o morfológico, con la ventaja de disponer de un modelo específico del idioma frente a alternativas multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio pesa 2,6 GB, lo que sugiere que el modelo en FP32 o FP16 ocupa del orden de esa cifra; en la práctica, un modelo Conformer de ASR de ese tamaño puede ejecutarse con bastante menos memoria si se cuantiza, pero no se han publicado variantes cuantizadas.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, una GPU consumer con 8 GB de VRAM debería ser suficiente para inferencia en FP16, pero es una estimación, no un dato publicado.
- Cabe en GPU consumer: probablemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no está confirmado por el autor.
- Opciones de despliegue: ONNX Runtime es la vía natural dado el formato de pesos; también cabría integración en servidores propios con código custom. No se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Acceso |
|---|---|---|---|---|---|
| AxomAI Speech Xuna | Assamés | Conformer | ONNX | Propietaria | Gated |
| Whisper (OpenAI) | Multilingüe (incluye assamés con rendimiento limitado) | Transformer encoder-decoder | Safetensors, GGUF, etc. | MIT | Abierto |
| MMS (Meta) | Multilingüe (más de 1000 idiomas) | Wav2Vec2 / CTC | PyTorch | CC-BY-NC | Abierto |
| IndicWav2Vec / modelos Indic | Lenguas índicas | Wav2Vec2 / Conformer | PyTorch | Variables | Abierto |

No se dispone de datos de rendimiento comparativo (WER) para AxomAI Speech Xuna, por lo que la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Licencia propietaria (`axom-ai-proprietary`): el uso comercial requiere revisar y aceptar las condiciones del autor; no es una licencia de código abierto.
- Acceso restringido (gated): es necesario solicitar acceso en HuggingFace, lo que añade fricción a la evaluación y al despliegue automatizado.
- Cobertura monolingüe: solo assamés; no sirve para otros idiomas ni para code-switching sin degradación no documentada.
- Sin datos públicos de WER ni de rendimiento por dominio: no es posible estimar la precisión esperada en audio telefónico, ruidoso o con acento no representado en el corpus de entrenamiento.
- La afirmación "zero-hallucination" no está respaldada por una evaluación publicada; conviene validarla con un conjunto de prueba propio antes de confiar en ella en producción.
- Riesgo de sesgo hacia el dominio y los hablantes representados en el dataset `custom-assamese-speech`, cuya composición se desconoce.
- Requiere código custom para cargar el modelo; no es un pipeline estándar de Transformers, lo que complica la integración con herramientas existentes.
- Sin información sobre el tamaño de parámetros ni sobre variantes cuantizadas, la planificación de recursos es incierta.
- Fecha de creación del repositorio (noviembre de 2026) y ausencia de descargas o likes: modelo muy reciente y sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/axom-ai/axomai-speech-xuna
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
