# dehanns/whisper-small-lora-sinhala

## Resumen

El modelo `dehanns/whisper-small-lora-sinhala` es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `openai/whisper-small`, diseñado para el reconocimiento automático del habla (ASR) en idioma sinhala. Fue desarrollado por el usuario `dehanns` y publicado en HuggingFace con la librería PEFT, lo que indica que se trata de un ajuste fino eficiente en parámetros, no de un modelo completo. El adaptador está pensado para ser cargado sobre Whisper-small, un modelo transformer encoder-decoder de 244 millones de parámetros entrenado por OpenAI para tareas de transcripción y traducción de audio.

La relevancia de este modelo radica en la adaptación de un sistema de ASR multilingüe a un idioma de bajos recursos como el sinhala, hablado principalmente en Sri Lanka. Al usar LoRA, se reduce drásticamente el número de parámetros entrenables y los requisitos de cómputo, lo que facilita el ajuste fino en hardware modesto. Sin embargo, la información pública disponible es muy limitada: no se especifican datos de entrenamiento, métricas de evaluación, licencia ni instrucciones de uso, lo que dificulta su adopción directa en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Whisper-small (transformer encoder-decoder) |
| Parametros totales | No disponible (adaptador LoRA; modelo base Whisper-small con 244M) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (característica de Whisper) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Sinhala (inferido por el nombre y el propósito; no se especifica oficialmente) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre los pesos de Whisper-small. Whisper-small es un transformer encoder-decoder con aproximadamente 244 millones de parámetros, entrenado por OpenAI sobre 680.000 horas de audio etiquetado en múltiples idiomas. El adaptador LoRA introduce matrices de bajo rango en las capas de atención y feed-forward, de modo que solo una pequeña fracción de los parámetros se actualiza durante el ajuste fino. Esto permite adaptar el modelo a un idioma específico con recursos computacionales limitados.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, el régimen de entrenamiento (épocas, tasa de aprendizaje, etc.) ni si se utilizaron técnicas como RLHF o DPO. El README de la model card está vacío y no se proporcionan hiperparámetros. La única referencia técnica es la versión de PEFT 0.14.0, lo que sugiere que el adaptador se generó con esa versión de la librería.

## Capacidades

- Reconocimiento automático del habla (ASR) en idioma sinhala, basado en el modelo Whisper-small.
- Transcripción de audio a texto en sinhala, aprovechando las capacidades multilingües del modelo base.
- Al ser un adaptador LoRA, se integra con el ecosistema PEFT de HuggingFace, permitiendo cargarlo sobre el modelo base con pocas líneas de código.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso o visión, ya que Whisper es un modelo puramente de audio.

## Casos de uso

- Transcripción de reuniones y conferencias en sinhala: el adaptador puede procesar grabaciones de audio y generar transcripciones textuales, útil para actas o subtitulado. Su ventana de 30 segundos permite manejar segmentos de audio de duración moderada.
- Subtitulado automático de vídeos en sinhala: integrado en un pipeline de procesamiento de vídeo, el modelo puede transcribir pistas de audio y generar subtítulos sincronizados para plataformas de streaming o contenido educativo.
- Asistencia a la accesibilidad: personas con discapacidad auditiva que hablan sinhala pueden beneficiarse de transcripciones en tiempo real de conversaciones o eventos, siempre que se implemente un sistema de streaming con el modelo.
- Análisis de llamadas de atención al cliente: empresas que operan en Sri Lanka pueden transcribir llamadas de soporte en sinhala para análisis de calidad, detección de intenciones o entrenamiento de agentes.
- Investigación lingüística: el adaptador puede servir como herramienta para estudiar la fonética y la morfología del sinhala, generando corpus transcritos a partir de audio existente.
- Desarrollo de asistentes de voz en sinhala: combinado con un motor de síntesis de voz y un modelo de lenguaje, el adaptador puede ser el componente de entrada de un asistente virtual que entienda comandos hablados en sinhala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas como WER (Word Error Rate), MMLU, HumanEval o GSM8K asociadas a este adaptador. Tampoco se comparan con otros modelos de ASR en sinhala. Se recomienda evaluar el modelo en un conjunto de validación propio antes de usarlo en producción.

## Requisitos de hardware

- El adaptador LoRA en sí es muy ligero (tamaño de archivo no especificado, pero típicamente de unos pocos MB), pero requiere cargar el modelo base Whisper-small, que ocupa aproximadamente 1 GB en FP32.
- Para inferencia en GPU, se recomienda al menos 4 GB de VRAM si se usa FP16, y 2 GB si se aplica cuantización a 8 bits. Una GPU como NVIDIA GTX 1650 o superior podría ser suficiente para inferencia por lotes pequeños.
- En CPU, la inferencia es posible pero lenta; se recomienda usar llama.cpp o whisper.cpp para optimizaciones, aunque el adaptador PEFT no es directamente compatible con esos formatos sin conversión.
- Opciones de despliegue: se puede usar la librería `transformers` de HuggingFace con PEFT para cargar el adaptador sobre Whisper-small. También es posible exportar a ONNX o TensorRT para aceleración, pero no se proporcionan scripts.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

| Modelo | Base | Idioma | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dehanns/whisper-small-lora-sinhala | Whisper-small | Sinhala | Adaptador LoRA (desconocido) | 30 s audio | No disponible | HuggingFace |
| hlasith/whisper-sinhala-small | Whisper-small | Sinhala | No disponible | 30 s audio | No disponible | HuggingFace |
| dehanns/whisper-small-sinhala | Whisper-small | Sinhala | 0.2B (modelo completo) | 30 s audio | No disponible | HuggingFace |

No se dispone de información detallada sobre los modelos comparables. Los tres parecen ser adaptaciones de Whisper-small al sinhala, pero no hay datos de rendimiento ni de licencia. La comparativa se limita a la existencia y el enfoque.

## Limitaciones y advertencias

- La información pública es extremadamente escasa: no hay licencia, no hay datos de entrenamiento, no hay métricas de evaluación. Esto impide verificar la calidad del adaptador y su idoneidad para uso comercial.
- El modelo base Whisper-small tiene sesgos conocidos, especialmente en idiomas de bajos recursos, donde el rendimiento puede ser inferior al de idiomas dominantes como inglés o español.
- Riesgo de alucinación: Whisper puede generar texto que no corresponde al audio, especialmente en entornos ruidosos o con acentos poco representados. El adaptador LoRA no corrige este comportamiento.
- Limitaciones de contexto: la ventana de 30 segundos de audio obliga a segmentar audios más largos, lo que puede perder contexto entre segmentos.
- No se especifica si el adaptador es compatible con versiones recientes de la librería `transformers` o si requiere una versión específica de PEFT.
- Al no tener licencia, no se puede determinar si su uso está permitido en aplicaciones comerciales o de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dehanns/whisper-small-lora-sinhala
- Modelo base Whisper-small: https://huggingface.co/openai/whisper-small
- Paper de Whisper (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Modelo relacionado (dehanns/whisper-small-sinhala): https://huggingface.co/dehanns/whisper-small-sinhala
- Modelo relacionado (hlasith/whisper-sinhala-small): https://huggingface.co/hlasith/whisper-sinhala-small
