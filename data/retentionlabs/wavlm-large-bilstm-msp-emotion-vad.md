# RetentionLabs/wavlm-large-bilstm-msp-emotion-vad

## Resumen

wavlm-large-bilstm-msp-emotion-vad es un modelo de reconocimiento de emociones en habla (SER) desarrollado por RetentionLabs que predice valencia, activación y dominancia (VAD) de forma continua en el tiempo a 10 Hz. Se construye mediante fine-tuning del modelo base 3loi/SER-Odyssey-Baseline-WavLM-Multi-Attributes, sustituyendo o adaptando la cabeza de clasificación por una BiLSTM que produce trazas temporales en lugar de una única etiqueta por utterance.

El modelo resuelve el problema de la estimación dimensional y dinámica de la emoción: en lugar de clasificar una grabación completa en una categoría discreta, emite valores continuos de valencia, activación y dominancia cada 100 ms, lo que permite seguir la evolución emocional dentro de una conversación. Está entrenado sobre las medias de las trazas de anotación del corpus MSP-Conversation, un conjunto de habla espontánea conversacional.

Es relevante para investigadores y desarrolladores que necesitan señales emocionales temporales para análisis de interacción, moderación de contenido o agentes conversacionales empáticos. El repositorio ocupa 1,3 GB, contiene 328.068.809 parámetros en safetensors y se distribuye con licencia MIT, aunque la model card completa (uso, espacio VAD estándar, tablas comparativas) está todavía en redacción según el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder WavLM-large con cabeza BiLSTM (predicción VAD continua a 10 Hz) |
| Parametros totales | 328.068.809 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones publicadas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | audio-classification |
| Libreria | transformers (custom_code) |
| Modelo base | 3loi/SER-Odyssey-Baseline-WavLM-Multi-Attributes (finetune) |
| Frecuencia de prediccion | 10 Hz (time-continuous) |
| Dimensiones predichas | valencia, activacion, dominancia (VAD) |
| Tamano del repo | 1,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un encoder WavLM-large, que procesa la forma de onda de audio en bruto y extrae representaciones auto-supervisadas del habla, con una cabeza BiLSTM que modela la dependencia temporal bidireccional de las representaciones y emite predicciones continuas de valencia, activación y dominancia a una tasa de 10 Hz. El modelo se deriva por fine-tuning del checkpoint 3loi/SER-Odyssey-Baseline-WavLM-Multi-Attributes, que a su vez es un baseline multi-atributo sobre WavLM-large.

El entrenamiento se realiza sobre las medias de las trazas de anotación del corpus MSP-Conversation, un conjunto de habla conversacional espontánea con anotaciones dinámicas de emoción. La información disponible no detalla el número de tokens de audio, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (poco habituales en SER). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal; el rasgo técnico diferencial es la salida temporal continua frente a la clasificación por utterance.

## Capacidades

- Predicción dimensional de emoción en habla: valencia, activación y dominancia como valores continuos.
- Salida time-continuous a 10 Hz, lo que permite seguir la evolución emocional dentro de una grabación.
- Extracción de features de audio (tag feature-extraction) además de la clasificación.
- Procesamiento de habla espontánea conversacional, gracias al entrenamiento sobre MSP-Conversation.
- Integración con la librería transformers mediante código personalizado (custom_code).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio-texto ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de interacción en call centers: el modelo permite trazar la evolución de la valencia y la activación del cliente a lo largo de una llamada a 10 Hz, lo que facilita detectar picos de frustración o desescalada y generar informes por segmento temporal.
- Investigación en psicolingüística y ciencias sociales: al producir trazas VAD continuas sobre habla conversacional espontánea, sirve para estudiar la dinámica emocional en diálogos reales y correlacionarla con variables conductuales.
- Moderación de contenido en audio: la señal de activación y valencia puede alimentar un clasificador de segundo nivel que marque segmentos con carga emocional extrema en podcasts, retransmisiones o grabaciones de usuario.
- Agentes conversacionales empáticos: integrado en un pipeline de voz, el modelo aporta al agente una estimación del estado emocional del interlocutor cada 100 ms, lo que permite adaptar el tono y el ritmo de respuesta.
- Evaluación de calidad de locución y doblaje: comparar las trazas VAD generadas por distintas interpretaciones de un mismo guion para medir la coherencia emocional respecto a una referencia.
- Investigación clínica y bienestar: seguimiento de marcadores afectivos en entrevistas o sesiones grabadas, siempre como señal auxiliar y no como herramienta diagnóstica.
- Análisis de contenido multimedia a gran escala: procesar archivos de audio por lotes para indexar momentos emocionalmente relevantes y habilitar búsqueda o resumen por tramos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos, más activaciones y memoria del encoder WavLM-large durante el procesamiento de audio; en la práctica se recomienda reservar entre 3 y 6 GB según la longitud del audio y el tamaño de lote.
- En FP16/BF16 los pesos ocupan unos 0,66 GB; la memoria total depende de la ventana de audio procesada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en precisión reducida; A100, H100, L40S o RTX 4090 para procesamiento por lotes de alto throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, siempre que se ajuste el tamaño de lote.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía natural; el soporte en vLLM, llama.cpp, Ollama o TGI no está documentado y es improbable para un modelo de audio con cabeza BiLSTM personalizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetentionLabs/wavlm-large-bilstm-msp-emotion-vad | 328 M | no disponible | VAD continua a 10 Hz | MIT | Hugging Face |
| 3loi/SER-Odyssey-Baseline-WavLM-Multi-Attributes | no disponible | no disponible | atributos emocionales (modelo base) | no disponible | Hugging Face |
| WavLM-large original (microsoft/wavlm-large) | 317 M aprox. | no disponible | representaciones auto-supervisadas | MIT | Hugging Face |

La comparación con alternativas de la misma categoría (por ejemplo, modelos SER dimensionales basados en wav2vec2 o HuBERT) no está disponible en la información proporcionada, ni se han publicado métricas que permitan un contraste cuantitativo.

## Limitaciones y advertencias

- La model card completa está pendiente de publicación; faltan detalles sobre el espacio VAD estándar, el preprocesado y las condiciones de uso recomendadas.
- No se documentan los idiomas cubiertos; el entrenamiento sobre MSP-Conversation (habla conversacional en inglés estadounidense) sugiere un sesgo hacia ese dominio, pero no se confirma en la información disponible.
- Al ser un modelo dimensional entrenado sobre medias de trazas, puede suavizar picos emocionales breves y presentar menor fiabilidad en emociones de baja intensidad.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de predicciones espurias en audio con ruido, música o habla no conversacional.
- Sesgos demográficos y culturales potenciales derivados del corpus de entrenamiento; no se documentan análisis de equidad.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base y del corpus MSP-Conversation, cuyas licencias pueden imponer restricciones adicionales.
- El uso en contextos clínicos o de evaluación de personas requiere supervisión humana; el modelo no es una herramienta diagnóstica.
- Requiere `trust_remote_code=True` por el uso de código personalizado, lo que implica revisar el código antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RetentionLabs/wavlm-large-bilstm-msp-emotion-vad
- Modelo base: https://huggingface.co/3loi/SER-Odyssey-Baseline-WavLM-Multi-Attributes
- WavLM-large original: https://huggingface.co/microsoft/wavlm-large
- Repositorio WavLM (Microsoft): https://github.com/microsoft/unilm/tree/master/wavlm
- Corpus MSP-Conversation: https://ecs.utdallas.edu/research/researchlabs/msp-lab/MSP-Conv.html
