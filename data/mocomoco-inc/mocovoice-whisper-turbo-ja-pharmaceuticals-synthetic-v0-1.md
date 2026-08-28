# mocomoco-inc/mocovoice-whisper-turbo-ja-pharmaceuticals-synthetic-v0.1

## Resumen

mocovoice-whisper-turbo-ja-pharmaceuticals-synthetic-v0.1 es un prototipo de adaptación léxica para reconocimiento de voz en japonés, desarrollado por mocomoco inc. sobre el modelo base OpenAI Whisper large-v3-turbo. El objetivo es mejorar la transcripción de terminología farmacéutica japonesa mediante un ajuste fino con LoRA, cuyos pesos se fusionan y convierten a formato CTranslate2 en float16. El repositorio se distribuye exclusivamente en este formato, sin incluir los adaptadores LoRA ni un checkpoint Transformers fusionado, y se presenta como un artefacto de demostración o marketing, no como un modelo listo para producción.

El modelo se enmarca en la línea de productos mocoVoice de mocomoco inc., que ofrece soluciones de transcripción y gestión de conocimiento con reconocimiento de voz especializado en dominios como el médico y farmacéutico. La evaluación publicada se basa en un holdout sintético de voz japonesa generada por TTS, con métricas de tasa de error de caracteres (CER) y presencia de términos controlados. No se distribuye audio real ni se reclama precisión en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (encoder-decoder transformer) con adaptación LoRA fusionada |
| Parametros totales | no disponible (el modelo base tiene aproximadamente 1,5 mil millones, pero el adaptador no se distribuye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos, pero no se especifica) |
| Tipos de cuantizacion | float16 (directorio `ct2-float16/`) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (CT2) |

## Arquitectura y entrenamiento

El modelo parte de OpenAI Whisper large-v3-turbo, un transformer encoder-decoder entrenado para reconocimiento de voz multilingue. Sobre este base se aplica un ajuste fino con LoRA (Low-Rank Adaptation) orientado a la adaptacion lexica en el dominio farmaceutico japones. Los datos de entrenamiento son sinteticos: prompts de texto y voz generada por TTS japones, sin grabaciones reales de clientes, hospitales o entornos operativos. El repositorio incluye el contrato de datos (`data_contract/`) y los scripts de entrenamiento (`training_code/`), pero no los pesos del adaptador ni el checkpoint Transformers fusionado; solo se distribuye el modelo CT2 en float16, que es el artefacto desplegable.

No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO. La evaluacion se realizo sobre un holdout sintetico con plantillas de prompts no vistas, aunque los terminos controlados se solapan entre entrenamiento y evaluacion, lo que limita la generalizacion a entornos reales.

## Capacidades

- Reconocimiento de voz automatico (ASR) en japones, especializado en terminologia farmaceutica.
- Adaptacion lexica: mejora la transcripcion de terminos controlados del dominio farmaceutico frente al modelo base, segun las metricas del holdout sintetico.
- Compatible con el ecosistema CTranslate2 y con el wrapper `WhisperModel` de MocoVoice para inferencia.
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio multilingue mas alla del japones.

## Casos de uso

- Transcripcion de consultas medicas y farmaceuticas: el modelo puede transcribir conversaciones entre profesionales sanitarios y pacientes, capturando nombres de medicamentos y dosis con mayor fidelidad que el Whisper generico, siempre que se valide en entornos reales.
- Generacion de actas de reuniones clinicas: integrado en el servicio mocoVoice Web, permite convertir audio de reuniones en texto estructurado para su posterior busqueda y comparticion.
- Asistencia a la documentacion farmaceutica: ayuda a transcribir dictados de informes, etiquetas de productos o instrucciones de uso, reduciendo errores en terminos tecnicos.
- Prototipado de pipelines ASR especializados: sirve como referencia para desarrolladores que quieran adaptar Whisper a dominios verticales mediante LoRA y desplegar en CTranslate2.
- Evaluacion de adaptacion lexica: el repositorio incluye scripts y datos de evaluacion que permiten reproducir las metricas publicadas y auditar el comportamiento del modelo en un entorno controlado.
- Integracion en flujos de trabajo de mocoVoice: el modelo puede usarse como motor de transcripcion dentro de la plataforma de mocomoco, que ofrece control de acceso y comparticion en equipos.

## Benchmarks y rendimiento

La model card publica resultados sobre un holdout sintetico japones. Se presentan dos comparativas: una entre el modelo base Transformers y una referencia de dominio (no distribuida), y otra entre el CT2 generico y el CT2 de dominio entregado. Los datos son diagnosticos controlados, no mediciones en campo.

| Metrica (holdout sintetico) | Base Turbo (Transformers) | Referencia de dominio (no distribuida) |
|---|---:|---:|
| CER de dominio | 0.2202 | 0.1928 |
| Termino de dominio presente | 118/150 (78.7%) | 118/150 (78.7%) |
| Termino presente (diagnostico sin puntuacion) | 119/150 (79.3%) | 119/150 (79.3%) |
| Literal critico preservado | 64/150 (42.7%) | 71/150 (47.3%) |
| Hecho de codigo controlado | 5/50 (10.0%) | 7/50 (14.0%) |
| Valor numerico controlado | 50/50 (100.0%) | 50/50 (100.0%) |
| Hecho de valor + unidad | 22/50 (44.0%) | 28/50 (56.0%) |
| CER sintetico neutro | 0.0472 | 0.0472 |

| Metrica (CT2 runtime) | CT2 generico | CT2 de dominio entregado |
|---|---:|---:|
| CER de dominio | 0.1615 | 0.1348 |
| Termino de dominio presente | 117/150 (78.0%) | 117/150 (78.0%) |
| Termino presente sin puntuacion | 117/150 (78.0%) | 117/150 (78.0%) |
| Hecho de codigo controlado | 5/50 (10.0%) | 6/50 (12.0%) |
| Valor numerico controlado | 50/50 (100.0%) | 50/50 (100.0%) |
| Hecho de valor + unidad | 48/50 (96.0%) | 49/50 (98.0%) |

Ademas, se indica que el CT2 float16 fusionado coincide exactamente con el checkpoint Transformers de referencia en 90 de 162 salidas tras normalizacion, con un CER de 0.0686 entre ambos. No se proporcionan resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada: al ser un modelo Whisper large-v3-turbo en float16, el checkpoint ocupa aproximadamente 3 GB en memoria. No se especifica el consumo real en inferencia, pero es plausible que quepa en GPUs de consumo con al menos 6 GB de VRAM.
- GPU recomendadas: no se indica oficialmente; por el tamano, una RTX 3060 o superior seria suficiente para inferencia en lotes pequenos. Para despliegues de mayor rendimiento se requieren GPUs de datacenter como A100 o H100.
- Compatibilidad con consumer GPU: probablemente si, dado el tamano del modelo en float16, aunque no hay confirmacion del fabricante.
- Opciones de despliegue: CTranslate2 es la libreria principal; tambien puede usarse con el wrapper `WhisperModel` de MocoVoice. No se mencionan vLLM, llama.cpp u Ollama, que no son tipicos para modelos Whisper.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|---|
| mocovoice-whisper-turbo-ja-pharmaceuticals-synthetic-v0.1 | Whisper large-v3-turbo | no disponible | no disponible | MIT | CT2 float16 | Farmaceutico japones |
| openai/whisper-large-v3-turbo | - | ~1.5B | 30 s audio | MIT | Transformers, CT2, GGUF | Multilingue generico |
| openai/whisper-large-v3 | - | ~1.5B | 30 s audio | MIT | Transformers, CT2, GGUF | Multilingue generico |

La comparativa se limita al modelo base y a Whisper large-v3, ya que no se dispone de otros modelos ASR japoneses especializados en farmacia con datos publicados. La ventaja del modelo de mocomoco es la adaptacion lexica al dominio, aunque su evaluacion es solo sintetica.

## Limitaciones y advertencias

- Es un prototipo de demostracion, no un modelo certificado para produccion ni para decisiones autonomas.
- Los datos de entrenamiento y evaluacion son sinteticos (TTS japones); no se ha validado con grabaciones reales de campo, ruido, acentos o entornos clinicos.
- Los terminos controlados se solapan entre entrenamiento y holdout, por lo que las metricas pueden sobreestimar la capacidad de generalizacion.
- No se distribuyen los pesos LoRA ni el checkpoint Transformers fusionado; solo el CT2 float16, lo que limita la reproducibilidad del ajuste fino.
- La licencia MIT permite uso comercial, pero el autor advierte explicitamente que no se debe reclamar precision, seguridad o correccion numerica/codigo en entornos reales.
- Riesgo de alucinacion y errores en cantidades, codigos, fechas e instrucciones de seguridad; se recomienda revision humana siempre.
- No se garantiza soporte para otros idiomas ni para vocabulario fuera del dominio farmaceutico japones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mocomoco-inc/mocovoice-whisper-turbo-ja-pharmaceuticals-synthetic-v0.1
- Producto mocoVoice (ingles): https://products.mocomoco.ai/en/
- Producto mocoVoice (japones): https://products.mocomoco.ai/
- Noticias de mocomoco inc.: https://www.mocomoco.ai/en/
- Guia de usuario de mocoVoice: https://guide.mocomoco.ai/en/
- Presentacion de mocoVoice Web: https://www.mocomoco.ai/en/news/mocoVoice-web/
