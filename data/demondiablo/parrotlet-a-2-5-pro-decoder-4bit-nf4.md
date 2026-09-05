# Demondiablo/parrotlet-a-2.5-pro-decoder-4bit-nf4

# Ficha de modelo: parrotlet-a-2.5-pro-decoder-4bit-nf4

## Resumen
`parrotlet-a-2.5-pro-decoder-4bit-nf4` es una derivación cuantizada del modelo de reconocimiento automático de voz (ASR) `ekacare/parrotlet-a-2.5-pro`, publicada por el usuario Demondiablo. Su objetivo es permitir la inferencia con baja VRAM, manteniendo la arquitectura original del modelo base. El modelo original es un speech-LLM diseñado para el dominio médico, con cobertura general de voz leída y espontánea en varios idiomas de la India. La versión cuantizada aplica cuantización 4-bit NF4 de doble cuantización (bitsandbytes) exclusivamente al decoder, mientras que el encoder y el proyector se mantienen en fp16 para preservar la alineación.

La arquitectura combina un encoder Whisper de 32 capas con un decoder `Gemma3ForConditionalGeneration` de 34 capas, unidos mediante un proyector `EncoderProjectorConcat`. El repositorio tiene un tamaño de 4.6 GB y utiliza el formato `safetensors` con código personalizado. El modelo está diseñado para transcribir audio en cinco idiomas: inglés, hindi, marathi, kannada y telugu. Su relevancia radica en la posibilidad de ejecutar un speech-LLM médico en GPUs de gama media, como las T4 o L4, sin necesidad de infraestructura de alto coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech-LLM híbrido: encoder Whisper (32 capas) + proyector `EncoderProjectorConcat` + decoder `Gemma3ForConditionalGeneration` (34 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 double-quant (bitsandbytes) en el decoder; encoder y proyector en fp16 |
| Idiomas soportados | en, hi, mr, kn, te |
| Licencia | Health AI Developer Foundations (licencia `other`) |
| Formato de pesos | safetensors; código personalizado `modelling_speech-llm.py` |

## Arquitectura y entrenamiento
La arquitectura del modelo base es un speech-LLM que combina un encoder de Whisper de 32 capas con un decoder `Gemma3ForConditionalGeneration` de 34 capas. Ambos componentes se conectan mediante un proyector `EncoderProjectorConcat`, compuesto por capas lineales que transforman la representación de 2560 a 4096 y de vuelta a 2560. Según la model card, este proyector tiene aproximadamente 30 millones de parámetros y no se cuantiza porque el ahorro de memoria sería marginal y podría romper la alineación entre encoder y decoder.

La versión cuantizada mantiene la estructura original (`encoder/`, `decoder/`, `projector/`, `config.json` y `modelling_speech-llm.py`), lo que permite reutilizar el patrón de carga existente `SpeechLLM.from_pretrained`. La cuantización 4-bit NF4 se aplicó únicamente al decoder en un entorno Kaggle con dos T4, utilizando compute dtype fp16 (las T4 no admiten bf16 rápido). Los mismos pesos almacenados pueden ejecutarse con bf16 en GPUs L4 o Ada. No se han proporcionado detalles sobre el proceso de entrenamiento del modelo base, el número de tokens o técnicas como RLHF o DPO. El README del modelo base indica que está afinado para el dominio médico, pero mantiene cobertura general de voz leída y espontánea.

## Capacidades
- Reconocimiento automático de voz (ASR) y transcripción de audio a texto en cinco idiomas: inglés, hindi, marathi, kannada y telugu.
- Generación de texto a partir de audio mediante la función `transcribe()`, que acepta señales de audio en formato numpy a 16 kHz y el parámetro `max_new_tokens`.
- Especialización en dominio médico heredada del modelo base, con capacidad para procesar voz general fuera del ámbito médico sin pérdida significativa de cobertura.
- Según el README del modelo base, `parrotlet-a-2.5-pro` lidera en kannada y se sitúa a uno o dos puntos de los mejores modelos en telugu y marathi.
- Inferencia con baja VRAM gracias a la cuantización 4-bit NF4 del decoder, manteniendo el encoder y el proyector en fp16 para preservar la alineación.
- Compatibilidad con el patrón de carga existente del modelo base, incluido el soporte para despliegue con Modal y `transformers` + `bitsandbytes`.

## Casos de uso
- Transcripción de consultas médicas en idiomas de la India: el modelo puede convertir audio de consultas en hindi, marathi, kannada o telugu a texto, facilitando la integración en sistemas de historia clínica electrónica y reduciendo la carga administrativa del personal sanitario.
- Dictado clínico en entornos con recursos de GPU limitados: gracias a la cuantización 4-bit del decoder, el modelo puede ejecutarse en GPUs como T4 o L4, lo que permite su despliegue en hospitales o clínicas sin grandes infraestructuras de cómputo.
- Telemedicina y llamadas de emergencia: el modelo transcribe conversaciones entre médico y paciente en tiempo real, permitiendo el análisis posterior de los casos y la generación automática de informes.
- Accesibilidad en aplicaciones de salud para pacientes: los pacientes pueden dictar síntomas o instrucciones en su idioma nativo, mejorando la inclusión y la comunicación con el personal médico.
- Investigación lingüística y análisis de corpus de voz médica en lenguas indias: la cobertura general del modelo base facilita la transcripción de datos fuera del dominio médico, lo que resulta útil para estudios sobre variación dialectal o fonética.
- Integración en pipelines de automatización de informes médicos: el modelo puede generar texto estructurado a partir de audio, lo que permite automatizar tareas de documentación clínica y reducir errores humanos en el registro de información.
- Despliegue en plataformas serverless con el patrón Modal: el README indica que la estructura del repositorio es idéntica a la del modelo base, por lo que el patrón de carga `SpeechLLM.from_pretrained` y el loader de Modal funcionan sin modificaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card de la derivación cuantizada menciona que el benchmark completo (semWER/kwWER, IndicVoices OOD) se ejecuta en una GPU L4, pero no aporta cifras concretas. El repositorio solo ha superado una prueba de humo de la función `transcribe()`, por lo que no hay datos validados de rendimiento para esta versión cuantizada.

## Requisitos de hardware
- Tamaño del repositorio: 4.6 GB, correspondiente a los pesos cuantizados 4-bit del decoder y los pesos fp16 del encoder y proyector.
- VRAM estimada: no disponible con exactitud; el objetivo es baja VRAM, y el modelo se probó en un entorno Kaggle con 2xT4 (16 GB cada una), por lo que una T4 o L4 debería ser suficiente.
- GPU recomendadas: NVIDIA T4, L4, RTX 4090 o modelos superiores con soporte para fp16 o bf16.
- Opciones de despliegue: mediante `transformers` con `bitsandbytes` y `accelerate`, siguiendo el patrón de carga `SpeechLLM.from_pretrained` con el código personalizado `modelling_speech-llm.py`. También es compatible con el patrón de despliegue con Modal.
- Latencia y throughput: no disponibles; solo se ha validado una prueba de humo de la función `transcribe()`, sin mediciones de rendimiento publicadas.

## Comparativa con modelos similares
No se ha proporcionado información sobre modelos comparables en los datos disponibles. El README del modelo base indica que `parrotlet-a-2.5-pro` lidera en kannada y se acerca a los mejores modelos en telugu y marathi, pero no se incluyen tablas comparativas con alternativas concretas ni datos de rendimiento para la versión cuantizada.

## Limitaciones y advertencias
- La derivación cuantizada solo ha pasado una prueba de humo de `transcribe()`; no se han publicado resultados de benchmarks completos, por lo que el rendimiento real no está validado.
- El encoder Whisper y el proyector no están cuantizados, lo que limita la reducción total de VRAM y puede resultar en un uso de memoria superior al esperado en comparación con una cuantización completa.
- La licencia Health AI Developer Foundations es una licencia `other` con términos específicos; debe revisarse detenidamente antes de cualquier uso comercial o despliegue en producción.
- Riesgo de alucinación inherente a los modelos generativos: en contextos médicos, una transcripción incorrecta puede tener consecuencias graves, por lo que se recomienda supervisión humana.
- El modelo está afinado para el dominio médico y puede presentar sesgos en contextos fuera de ese dominio, aunque el README del modelo base afirma mantener cobertura general.
- Solo soporta cinco idiomas: inglés, hindi, marathi, kannada y telugu, lo que limita su uso en otras regiones.
- Requiere versiones específicas de `transformers` (>=4.52,<5) y `bitsandbytes` (>=0.43), lo que puede limitar la compatibilidad con entornos existentes.
- El acceso al modelo base está restringido y requiere aceptar condiciones; esta derivación hereda la licencia, por lo que los usuarios deben verificar los términos antes de descargar.

## Enlaces
- Modelo cuantizado: https://huggingface.co/Demondiablo/parrotlet-a-2.5-pro-decoder-4bit-nf4
- Modelo base: https://huggingface.co/ekacare/parrotlet-a-2.5-pro
- README del modelo base: https://huggingface.co/ekacare/parrotlet-a-2.5-pro/blob/main/README.md
- Licencia Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
