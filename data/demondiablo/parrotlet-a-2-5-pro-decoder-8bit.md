# Demondiablo/parrotlet-a-2.5-pro-decoder-8bit

## Resumen

El modelo `Demondiablo/parrotlet-a-2.5-pro-decoder-8bit` es una derivación cuantizada del modelo base `ekacare/parrotlet-a-2.5-pro`, desarrollada por Demondiablo para permitir inferencia de reconocimiento de voz en entornos con poca memoria de GPU. Se trata de un speech-LLM híbrido que combina un encoder Whisper de 32 capas con un decoder `Gemma3ForConditionalGeneration` de 34 capas, conectados mediante un proyector lineal `EncoderProjectorConcat` de 2560->4096->2560. El repositorio tiene un tamaño de 6.3 GB y está orientado a aplicaciones médicas, con soporte para cinco idiomas: inglés, hindi, maratí, kannada y telugu.

La relevancia de este modelo radica en que ofrece una versión optimizada para baja VRAM, cuantizando el decoder a 8-bit LLM.int8 mediante bitsandbytes, manteniendo el encoder y el proyector en fp16 para no degradar la alineación. Esto permite ejecutar un modelo de ASR de gran tamaño en GPUs modestas como T4 o L4, lo que resulta útil en despliegues de telemedicina o documentación clínica en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech-LLM híbrido: encoder Whisper (32 capas) + decoder Gemma3ForConditionalGeneration (34 capas) + proyector lineal EncoderProjectorConcat (2560->4096->2560) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Decoder en 8-bit LLM.int8 (bitsandbytes, outlier threshold 6.0); encoder y proyector en fp16 |
| Idiomas soportados | en, hi, mr, kn, te (inglés, hindi, maratí, kannada, telugu) |
| Licencia | health-ai-developer-foundations (Google Health AI Developer Foundations) |
| Formato de pesos | safetensors, con código personalizado (modelling_speech-llm.py) |

## Arquitectura y entrenamiento

El modelo es una cuantización del decoder del modelo base `ekacare/parrotlet-a-2.5-pro`, no un modelo entrenado desde cero. No se proporcionan datos sobre el proceso de entrenamiento del modelo base, como número de tokens, composición del dataset o técnicas de alineación (RLHF/DPO). Este repositorio se limita a la optimización para inferencia con baja VRAM.

La cuantización se realizó con bitsandbytes LLM.int8, usando un umbral de outliers de 6.0, lo que mantiene las dimensiones sensibles en fp16. El encoder Whisper y el proyector se conservan en fp16 porque el proyector, con unos 30 millones de parámetros, es demasiado pequeño para que la cuantización aporte beneficios y podría romper la alineación entre el audio y el texto. La estructura del repositorio es idéntica a la del modelo base (`encoder/`, `decoder/`, `projector/`, `config.json` y `modelling_speech-llm.py`), lo que permite reutilizar el patrón de carga existente con `SpeechLLM.from_pretrained` y el loader de Modal.

## Capacidades

- Reconocimiento automático de voz (ASR) y transcripción de audio a texto.
- Soporte multilingüe para inglés, hindi, maratí, kannada y telugu.
- Enfoque en dominio médico, lo que sugiere optimización para vocabulario clínico.
- Capacidad de transcripción con generación controlada de tokens (`max_new_tokens`).
- Integración con el patrón de carga `SpeechLLM.from_pretrained` y el loader de Modal.
- Al ser un speech-LLM, combina un encoder acústico con un modelo de lenguaje para generar transcripciones coherentes.

## Casos de uso

- Transcripción de consultas médicas en hospitales de India: el modelo puede transcribir conversaciones entre médico y paciente en hindi, maratí, kannada o telugu, facilitando la documentación clínica. Su cuantización 8-bit permite ejecutarlo en GPUs modestas.
- Dictado clínico para profesionales sanitarios: los médicos pueden dictar notas en inglés o en lenguas indias y el modelo las convierte en texto estructurado. El enfoque médico ayuda con la terminología especializada.
- Asistentes de voz para telemedicina: integrar el modelo en aplicaciones de teleconsulta para transcribir audio en tiempo real o diferido, con bajo consumo de VRAM en el servidor.
- Análisis de llamadas de emergencia médica: transcripción de llamadas en varios idiomas para su posterior análisis y triaje.
- Sistemas de documentación automatizada en entornos con GPU compartidas: gracias a la cuantización y al loader de Modal, se puede desplegar en infraestructura serverless.
- Accesibilidad para pacientes: transcripción de instrucciones médicas orales a texto para pacientes con discapacidad auditiva, en los idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica que el benchmark completo de precisión (semWER/kwWER, IndicVoices OOD) debe ejecutarse en una GPU L4, pero este repositorio solo ha pasado una prueba de humo (`smoke transcribe()`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 6.3 GB en pesos cuantizados).
- GPU recomendadas: T4 (usada para la cuantización), L4 y arquitecturas Ada. Los pesos almacenados funcionan con compute dtype fp16 en T4 y con bf16 en L4/Ada.
- No se indica explícitamente si cabe en GPUs de consumo, aunque el tamaño del repo sugiere que podría ejecutarse en tarjetas con 8-12 GB de VRAM.
- Despliegue: requiere `transformers>=4.52,<5`, `bitsandbytes>=0.43`, `accelerate`, `librosa` y `soundfile`. La carga se realiza con `SpeechLLM.from_pretrained` y un patrón de loader de Modal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Cuantización | Tamaño repo | Idiomas | Licencia |
|---|---|---|---|---|
| ekacare/parrotlet-a-2.5-pro (base) | no disponible | no disponible | en, hi, mr, kn, te | health-ai-developer-foundations |
| Demondiablo/parrotlet-a-2.5-pro-decoder-8bit | 8-bit LLM.int8 | 6.3 GB | en, hi, mr, kn, te | health-ai-developer-foundations |
| Demondiablo/parrotlet-a-2.5-pro-decoder-4bit-nf4 | 4-bit NF4 | no disponible | en, hi, mr, kn, te | health-ai-developer-foundations |

No se dispone de benchmarks comparativos entre estas variantes. La principal diferencia es el nivel de cuantización del decoder, que afecta al consumo de VRAM y potencialmente a la precisión.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks en este repositorio; solo se ha realizado una prueba de humo (`smoke transcribe()`).
- El benchmark completo (semWER/kwWER, IndicVoices OOD) debe ejecutarse en L4 y no está verificado en este repositorio.
- Requiere código personalizado (`custom_code`) y un fix en el loader para la variable `sampling_rate`; sin este fix, la carga puede fallar.
- Licencia Health AI Developer Foundations: puede imponer condiciones específicas para el uso comercial; es necesario revisar los términos en el enlace proporcionado.
- Limitado a cinco idiomas; no soporta otros.
- Al ser un modelo generativo, existe riesgo de alucinación en la transcripción, especialmente con audio ruidoso o vocabulario fuera del dominio médico.
- No se dispone de información sobre sesgos conocidos.

## Enlaces

- HuggingFace: https://huggingface.co/Demondiablo/parrotlet-a-2.5-pro-decoder-8bit
- Variante 4-bit NF4: https://huggingface.co/Demondiablo/parrotlet-a-2.5-pro-decoder-4bit-nf4
- Modelo base: https://huggingface.co/ekacare/parrotlet-a-2.5-pro
- Licencia: https://developers.google.com/health-ai-developer-foundations/terms
