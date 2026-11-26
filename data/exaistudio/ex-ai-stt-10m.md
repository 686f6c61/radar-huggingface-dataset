# EXAiStudio/EX-AI-STT-10M

## Resumen

EX-AI-STT-10M es un modelo de reconocimiento automático del habla (ASR) para persa (farsi) desarrollado por EXAiStudio. Se trata de un Wav2Vec2 con cabecera CTC entrenado desde cero, sin partir de pesos preentrenados de ningún otro modelo de voz, lo que lo convierte en un ejercicio de entrenamiento end-to-end sobre datos limitados más que en un sistema de producción. Cuenta con aproximadamente 9,6 millones de parámetros (el nombre "10M" es un redondeo) y un fichero de pesos de unos 36 MB en formato safetensors.

El modelo trabaja exclusivamente con audio mono a 16 kHz y produce texto persa mediante decodificación CTC. Su relevancia es acotada: sirve como referencia reproducible de cómo entrenar un ASR de un solo idioma con recursos mínimos (una Tesla T4 y unas 7 horas en total) y como punto de partida para experimentos de reconocimiento de voz en persa. No está pensado para uso en producción.

La versión publicada es la V6, descrita por el autor como final. El entrenamiento se repartió en seis etapas incrementales sobre los mismos 8000 ejemplos del dataset Common Voice Persian Clean, sumando 26 épocas. La licencia es MIT, lo que facilita su reutilización y estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 con decodificador CTC (Wav2Vec2ForCTC), entrenado desde cero |
| Parametros totales | 9.606.309 (~9,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de audio, no ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Persa (fa) únicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (~36 MB), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura es un Wav2Vec2 estándar con extractor de características convolucional y codificador transformer, rematado por una cabeza CTC para la transcripción directa de secuencias de audio a caracteres persas. El modelo se entrenó íntegramente desde cero, sin inicialización a partir de pesos de modelos de voz preexistentes, lo que es poco habitual en ASR y explica en parte sus limitaciones.

Los datos de entrenamiento son los primeros 8000 ejemplos del split de entrenamiento del dataset `pymmdrza/Common-Voice-Speech-26.0-Persian-Clean` (el dataset completo tiene 33 452 ejemplos), con audio a 16 kHz y transcripciones en persa. El entrenamiento se realizó en seis fases (V1 a V6): V1 con 1 época y V2 a V6 con 5 épocas cada una, continuando siempre desde el modelo final de la fase anterior, para un total de 26 épocas sobre el mismo subconjunto. Todo el proceso se ejecutó en una NVIDIA Tesla T4 de 16 GB en aproximadamente 7 horas. No se documenta uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Transcripción de voz a texto en persa (farsi) a partir de audio mono a 16 kHz.
- Decodificación CTC directa, sin modelo de lenguaje externo ni corrección posterior.
- Funciona mejor con habla clara, corta y limpia.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-secuencial.
- No tiene capacidades multilingües: solo persa.
- No incorpora visión, audio generativo, modo "thinking" ni capacidades de agente.

## Casos de uso

- Prototipado de ASR en persa: sirve para validar pipelines de transcripción (preprocesado de audio, decodificación CTC, postprocesado de texto) antes de invertir en modelos mayores.
- Docencia y experimentación: permite reproducir un entrenamiento completo de ASR desde cero en una sola GPU de consumo o en una T4, útil para cursos y talleres.
- Transcripción de notas de voz cortas y claras: grabaciones de una sola persona en entorno silencioso, donde el modelo puede dar salidas correctas (el autor documenta coincidencias exactas en frases sencillas).
- Generación de datasets etiquetados de forma asistida: transcripción preliminar de audio persa limpio que después se revisa manualmente para construir corpus.
- Integración en aplicaciones de dictado ligero: por su tamaño (36 MB) puede desplegarse en entornos con recursos muy limitados para dictado de frases cortas.
- Base para fine-tuning: punto de partida para ajustar un ASR persa con más datos o dominios específicos, dado que la licencia MIT lo permite.
- Investigación sobre eficiencia: estudio del impacto de entrenar desde cero frente a partir de pesos preentrenados en tareas de voz de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye tres ejemplos cualitativos de transcripciones correctas ("خب تو چیکار می کنی", "دو روز قبل از کریسمس", "تقریباهمه خبر را شنیدند") sin métricas agregadas como WER o CER.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo pesa ~36 MB y cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU moderna; el propio autor entrenó en una NVIDIA Tesla T4 de 16 GB. Para inferencia basta una GPU integrada o incluso CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX o equivalente, e incluso en CPU para audio corto.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition` o carga directa de `Wav2Vec2ForCTC` con su processor). No se documenta soporte específico para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EX-AI-STT-10M | ~9,6 M | audio 16 kHz | Persa | MIT | Hugging Face |
| Wav2Vec2 base multilingüe (referencia de la familia) | ~95 M | audio 16 kHz | Multilingüe | Apache 2.0 / MIT según variante | Hugging Face |
| Whisper small | ~244 M | audio 16 kHz, ventanas de 30 s | Multilingüe | MIT | Hugging Face / OpenAI |
| Modelos ASR persa basados en Whisper o Wav2Vec2 preentrenado | variable | audio 16 kHz | Persa o multilingüe | variable | Hugging Face |

Nota: los datos de los modelos alternativos son valores de referencia de la familia y no se han contrastado con benchmarks en esta ficha. No hay datos de rendimiento comparativo disponibles para EX-AI-STT-10M.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: el propio autor lo declara así y desaconseja su uso en decisiones médicas, legales o de seguridad.
- Entrenado solo con 8000 ejemplos de un único dataset, lo que limita la cobertura de vocabulario, acentos y dominios.
- Solo persa: cualquier audio en otro idioma produce salidas no fiables.
- Sensible a ruido, habla rápida, acentos marcados, solapamiento de hablantes, música, números, nombres propios y palabras poco frecuentes.
- Puede omitir o repetir caracteres (errores típicos de decodificación CTC sin modelo de lenguaje).
- Sin métricas publicadas de WER/CER, por lo que no se puede estimar su calidad objetiva frente a alternativas.
- No incluye puntuación ni normalización de texto más allá de lo aprendido del dataset.
- Aunque la licencia MIT permite uso comercial, la calidad del modelo hace desaconsejable su uso en producción sin validación exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/EXAiStudio/EX-AI-STT-10M
- Dataset de entrenamiento: https://huggingface.co/datasets/pymmdrza/Common-Voice-Speech-26.0-Persian-Clean
