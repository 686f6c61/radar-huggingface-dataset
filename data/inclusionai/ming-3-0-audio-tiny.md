# inclusionAI/Ming-3.0-audio-tiny

## Resumen
Ming-3.0-audio-tiny es un modelo nativo de audio-lenguaje desarrollado por inclusionAI, presentado como la variante compacta de la familia Ming-3.0-audio (junto a Ming-3.0-audio-flash). Acepta audio junto con instrucciones de texto y devuelve texto, con la opción de sintetizar una respuesta hablada mediante un módulo Talker opcional. Cubre reconocimiento de voz, respuesta a preguntas habladas, comprensión y razonamiento sobre audio, y conversación audio-a-audio.

La arquitectura combina un codificador de audio con un proyector y un backbone de lenguaje Mixture-of-Experts compacto, con 9.300 millones de parámetros totales y 2.700 millones activados por paso de inferencia. El repositorio de pesos en safetensors declara 8.871.306.016 parámetros, ligeramente por debajo de la cifra redondeada de la model card. Está orientado a cargas de trabajo de audio en producción donde el coste por inferencia importa.

Su relevancia actual radica en que ofrece comprensión de audio de formato largo, dialectos y entornos ruidosos en un tamaño que cabe en hardware de gama alta de consumo con cuantización, bajo licencia MIT, lo que facilita su adopción comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de audio + proyector + backbone de lenguaje Mixture-of-Experts (tipo `bailing_moe_v3_audio`); Talker opcional para salida de voz |
| Parámetros totales | 9,3B según model card; 8.871.306.016 según safetensors |
| Parámetros activos | 2,7B por paso de inferencia |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo incluye safetensors en bfloat16 y ONNX; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Chino e inglés, incluidos acentos y dialectos variados |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento
El modelo sigue un diseño de tres etapas: un codificador de audio que convierte la señal en representaciones, un proyector que las alinea con el espacio del modelo de lenguaje, y un backbone de lenguaje Mixture-of-Experts compacto que procesa la secuencia multimodal y genera texto. Sobre esa salida se acopla opcionalmente un módulo Talker que sintetiza voz, con voces integradas o condicionamiento por audio de referencia (voice prompting).

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se declara explícitamente el soporte de audio largo, sonidos no verbales, escenas acústicas y música, además de reconocimiento robusto en entornos ruidosos y grabaciones multihablante. El prompt de ASR validado pide al modelo identificar el idioma hablado y separar la etiqueta de idioma de la transcripción con un tabulador, lo que sugiere un formato de salida estructurado entrenado de forma específica. El código requiere `trust_remote_code=True` por el uso de implementaciones personalizadas en Transformers.

## Capacidades
- Reconocimiento automático de voz (ASR) en chino e inglés, con acentos, dialectos, ruido y múltiples hablantes.
- Comprensión de audio de formato largo: análisis y resumen de grabaciones extensas.
- Respuesta a preguntas habladas (spoken QA) sobre el contenido del audio.
- Razonamiento sobre audio: preguntas que exigen inferencia sobre lo escuchado, no solo transcripción.
- Percepción multidimensional: habla, sonidos no verbales, escenas acústicas y música.
- Salida de voz opcional mediante Talker, con voces integradas o condicionamiento por voz de referencia.
- Conversación audio-a-audio (pipeline declarado `audio-to-audio`).
- Procesamiento multimodal de entrada: audio más instrucciones de texto en un mismo turno.
- No se documenta soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso
- Transcripción de reuniones y actas: el modelo procesa grabaciones multihablante y devuelve transcripción con etiqueta de idioma, adecuado para generar actas automáticas en entornos corporativos bilingües chino-inglés.
- Subtitulado y localización de vídeo: ASR sobre audio con acentos y ruido de fondo, con salida de texto lista para alinear con pistas de subtítulos.
- Atención al cliente por voz: combinación de ASR, razonamiento sobre la consulta y respuesta hablada vía Talker, lo que permite construir un agente telefónico completo con un solo modelo.
- Análisis de centros de llamadas: transcripción y razonamiento sobre audio largo para extraer motivos de contacto, sentimiento y cumplimiento de guiones.
- Accesibilidad: conversión de contenido hablado en respuestas de texto y viceversa para usuarios con discapacidad auditiva o visual.
- Moderación y auditoría de audio: detección de contenido sensible en grabaciones mediante preguntas dirigidas sobre el audio, apoyándose en la comprensión de sonidos no verbales y escenas acústicas.
- Investigación en audio musical: consultas sobre música y escenas sonoras para etiquetado y catalogación de archivos.
- Asistentes de voz embebidos: al activar solo 2,7B parámetros por paso, el coste de inferencia es contenido frente a modelos densos de tamaño equivalente, lo que lo hace apto para despliegues con muchas peticiones concurrentes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada en bfloat16: en torno a 18 GB solo para pesos (9B parámetros a 2 bytes), más overhead de activaciones y del codificador de audio; se recomienda un mínimo de 24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB de pesos, viable en GPUs de 16 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB de pesos, aunque no se documentan pesos pre-cuantizados en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para producción con lotes grandes y audio largo; RTX 4090 (24 GB) para bfloat16 en una sola tarjeta; RTX 4080/3090 (16-24 GB) con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 sin cuantizar y en tarjetas de 16 GB con cuantización de 8 bits.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (ruta validada por el autor); el repositorio incluye artefactos ONNX, lo que abre la puerta a ONNX Runtime. No se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El diseño MoE con 2,7B activos reduce el coste computacional por token frente a un denso de 9B, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Salida de voz | Disponibilidad |
|---|---|---|---|---|---|---|
| Ming-3.0-audio-tiny | 9,3B totales / 2,7B activos (MoE) | no disponible | en, zh | MIT | Sí (Talker opcional) | Hugging Face, ModelScope |
| Ming-3.0-audio-flash | no disponible en la información proporcionada | no disponible | en, zh | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face |
| Alternativas de audio-lenguaje de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar contra la variante flash de la misma familia, de la que únicamente se conoce su existencia y su repositorio; no se dispone de sus especificaciones para una comparación cuantitativa.

## Limitaciones y advertencias
- Cobertura lingüística limitada a chino e inglés; el rendimiento en otras lenguas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de lenguaje: en tareas de razonamiento sobre audio puede generar inferencias no sustentadas por la señal.
- Sesgos no documentados: la model card no describe evaluación de sesgos por acento, dialecto, género o edad, un aspecto crítico en ASR.
- La longitud de contexto no se publica, por lo que el límite real para audio largo debe determinarse empíricamente antes de producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo.
- El repositorio pesa 58,1 GB, muy superior a los pesos en bfloat16, debido a los artefactos ONNX y material adicional; hay que prever espacio en disco y tiempo de descarga.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero no exime de cumplir la normativa de protección de datos al procesar grabaciones de voz.
- No se documenta soporte de tool calling ni de flujos de agentes, lo que limita su integración en pipelines que requieran invocación de funciones.
- La calidad del módulo Talker y la latencia de la ruta audio-a-audio no están cuantificadas en la información disponible.

## Enlaces
- Hugging Face: https://huggingface.co/inclusionAI/Ming-3.0-audio-tiny
- Variante flash en Hugging Face: https://huggingface.co/inclusionAI/Ming-3.0-audio-flash
- GitHub (código y ejemplos): https://github.com/inclusionAI/Ming-3.0-audio-flash
- Ejemplos de código: https://github.com/inclusionAI/Ming-3.0-audio-flash/tree/main/examples
- ModelScope: https://modelscope.cn/models/inclusionAI/Ming-3.0-audio-tiny
