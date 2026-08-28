# Dhruv-jain/Mannmitra_Speech-model

## Resumen

MannMitra Speech-model es un modelo de clasificación de emociones en el habla desarrollado por Dhruv Jain, un ingeniero de investigación en Ola Krutrim especializado en entrenamiento y evaluación de modelos de lenguaje y voz. El modelo se basa en la arquitectura Wav2Vec2 de Hugging Face, concretamente en la variante `Wav2Vec2ForSequenceClassification`, y ha sido ajustado (fine-tuning) sobre el conjunto de datos RAVDESS para reconocer siete emociones distintas: enfado, calma, asco, miedo, alegría, tristeza y sorpresa.

Con aproximadamente 94,57 millones de parámetros, se trata de un modelo compacto, comparable al tamaño de Wav2Vec2 base, lo que lo hace adecuado para entornos con recursos limitados. El repositorio en Hugging Face está etiquetado con `safetensors` y `wav2vec2`, y aunque la model card indica que el paquete estaba preparado para subirse al Hub, no se ha publicado oficialmente (descargas y likes en cero). A pesar de su estado preliminar, el modelo representa un ejemplo práctico de fine-tuning de Wav2Vec2 para tareas de reconocimiento de emociones, un área con aplicaciones crecientes en análisis de interacciones humanas.

La relevancia actual de este modelo radica en la demanda de sistemas ligeros de análisis de sentimiento en audio, especialmente en entornos de atención al cliente, salud mental y asistentes conversacionales. Su tamaño reducido permite desplegarlo en CPUs o GPUs de gama baja, aunque su entrenamiento exclusivo en RAVDESS limita su generalización a otros dominios y acentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForSequenceClassification (Transformer encoder) |
| Parametros totales | 94.570.375 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, procesa secuencias de hasta 30 segundos típicamente) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (RAVDESS usa actores angloparlantes, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Wav2Vec2, un encoder Transformer preentrenado de forma autosupervisada sobre audio en bruto. La variante `Wav2Vec2ForSequenceClassification` añade una cabeza de clasificación sobre la representación contextual generada por el encoder. El fine-tuning se realizó sobre el dataset RAVDESS (Ryerson Audio-Visual Database of Emotional Speech and Song), que contiene grabaciones de actores interpretando emociones. El modelo clasifica cada entrada de audio en una de siete emociones: enfado, calma, asco, miedo, alegría, tristeza y sorpresa.

No se dispone de información detallada sobre el proceso de entrenamiento: número de épocas, tasa de aprendizaje, estrategia de aumento de datos o si se aplicaron técnicas como regularización o early stopping. La model card indica que los pesos y la configuración se copiaron sin cambios del mejor checkpoint activo, lo que sugiere que se siguió un flujo estándar de fine-tuning con Hugging Face. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de una tarea de clasificación supervisada.

## Capacidades

- Clasificación de emociones en audio: identifica siete emociones (enfado, calma, asco, miedo, alegría, tristeza, sorpresa) a partir de grabaciones de voz.
- Entrada de audio mono a 16 kHz, procesada mediante el `Wav2Vec2Processor` incluido en el paquete.
- Salida de probabilidades por clase, permitiendo umbrales personalizados o análisis de confianza.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente discriminativo.
- Capacidades multilingües: no disponibles; el entrenamiento se realizó sobre RAVDESS, que utiliza actores de habla inglesa, por lo que el modelo probablemente funciona mejor en inglés, aunque no se ha verificado.

## Casos de uso

- Análisis de sentimiento en llamadas de atención al cliente: el modelo puede procesar grabaciones de llamadas para detectar emociones como enfado o frustración, permitiendo a las empresas priorizar interacciones problemáticas o medir la satisfacción del cliente. Su tamaño compacto facilita la integración en pipelines de procesamiento por lotes.
- Monitoreo de salud mental: en aplicaciones de terapia o seguimiento de pacientes, el modelo puede analizar el tono de voz durante sesiones para ayudar a los terapeutas a identificar estados emocionales, aunque requiere validación clínica adicional.
- Asistentes de voz empáticos: integrado en un asistente conversacional, el modelo puede ajustar el tono de respuesta según la emoción detectada en el usuario, mejorando la experiencia de usuario en aplicaciones de bienestar o soporte.
- Investigación en interacción humano-computadora: los investigadores pueden usar el modelo para etiquetar automáticamente corpus de audio con emociones, acelerando el análisis de datos en estudios de psicología o lingüística.
- Moderación de contenido en plataformas de audio: en foros de voz o redes sociales, el modelo puede detectar emociones agresivas o negativas para alertar a moderadores, aunque su limitada generalización puede requerir reentrenamiento con datos específicos.
- Pruebas de usabilidad de productos: al analizar grabaciones de usuarios probando una aplicación, el modelo puede identificar momentos de confusión o frustración, ayudando a los equipos de diseño a mejorar la experiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de precisión, F1, ni comparaciones con otros modelos de clasificación de emociones. El autor no ha incluido métricas de evaluación en la model card ni en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 94,57 millones de parámetros, el modelo requiere aproximadamente 0,4 GB de memoria en FP32 (94,57 M × 4 bytes ≈ 378 MB). Con cuantización a int8, podría reducirse a unos 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050, RTX 2060, o incluso GPUs integradas. También puede ejecutarse en CPU con razonable latencia para audio corto.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: al ser un modelo de Hugging Face, puede servirse con bibliotecas como `transformers` y `torch`, o mediante servidores de inferencia como TGI (Text Generation Inference) aunque no es su caso típico, o simplemente con un script Python. También es posible exportarlo a ONNX para optimización.
- Latencia y throughput: no se dispone de mediciones oficiales. Para un audio de 5 segundos, la inferencia en CPU podría tardar entre 0,5 y 2 segundos, y en GPU menos de 0,1 segundos, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo compite con otros clasificadores de emociones basados en Wav2Vec2, como los disponibles en Hugging Face Hub (por ejemplo, `ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition` o `superb/wav2vec2-base-superb-er`), pero no hay datos de rendimiento de MannMitra para contrastar. Se recomienda consultar benchmarks públicos de reconocimiento de emociones en habla (por ejemplo, en la tarea SUPERB) para evaluar alternativas.

## Limitaciones y advertencias

- Entrenamiento exclusivo en RAVDESS: el dataset contiene grabaciones de actores en un entorno controlado, con acentos y emociones actuadas. El modelo puede no generalizar bien a habla espontánea, acentos no representados o condiciones de ruido reales.
- Sesgos potenciales: al estar entrenado con actores de habla inglesa, puede tener un rendimiento inferior con hablantes de otros idiomas o variedades dialectales. No se ha evaluado la equidad entre géneros, edades o grupos étnicos.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir etiquetas incorrectas con alta confianza, especialmente en entradas fuera de distribución.
- Licencia no especificada: el repositorio no indica licencia, lo que impide su uso comercial sin autorización explícita del autor. Se debe contactar con el autor antes de cualquier uso productivo.
- Estado preliminar: el modelo no ha sido subido oficialmente al Hub (descargas y likes en cero), y la model card indica que "no ha sido subido". Esto sugiere que puede contener errores o no estar listo para producción.
- Sin soporte de contexto largo: aunque Wav2Vec2 puede procesar secuencias de hasta 30 segundos, no se ha especificado la longitud máxima de entrada, y el modelo no está diseñado para audio de larga duración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dhruv-jain/Mannmitra_Speech-model
- Repositorio GitHub (compare): https://github.com/Dhruv-jain-dev/Mannmitra_Speech-model/compare
- Página personal del autor (Ola Krutrim): https://maximus-21.github.io/
- Proyectos del autor: https://maximus-21.github.io/projects/
