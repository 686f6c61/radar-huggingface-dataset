# mocomoco-inc/mocovoice-whisper-turbo-ja-finance-synthetic-v0.1

## Resumen

mocovoice-whisper-turbo-ja-finance-synthetic-v0.1 es un prototipo de reconocimiento automático de voz (ASR) desarrollado por mocomoco inc., una empresa japonesa especializada en transcripción y gestión de conocimiento. El modelo adapta el sistema Whisper large-v3-turbo de OpenAI al dominio financiero japonés mediante una adaptación LoRA, con el objetivo de mejorar el reconocimiento de terminología especializada, códigos y valores numéricos en transcripciones de audio financiero. Se distribuye exclusivamente en formato CTranslate2 cuantizado a int8, sin incluir los pesos del adaptador LoRA ni un checkpoint Transformers completo.

El modelo está pensado como un artefacto de demostración y validación, no como un sistema listo para producción. Su entrenamiento se realizó con datos sintéticos generados por TTS japonés, y la evaluación se limita a un holdout sintético controlado. La relevancia actual radica en su enfoque de adaptación léxica eficiente mediante LoRA sobre un modelo base robusto, aunque sus resultados no deben extrapolarse a entornos reales sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (encoder-decoder transformer) con adaptacion LoRA |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene aproximadamente 1.5B, pero no se especifica el recuento del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos, pero no se indica en la documentacion) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (directorio `ct2-int8/`) |

## Arquitectura y entrenamiento

El modelo parte de Whisper large-v3-turbo, un transformer encoder-decoder entrenado por OpenAI para ASR multilingue. Sobre este base se aplico una adaptacion LoRA (Low-Rank Adaptation) para ajustar el modelo a la terminologia financiera japonesa. El entrenamiento se realizo con datos sinteticos: prompts de texto generados artificialmente y audio sintetico producido por TTS japones. No se distribuyen los pesos del adaptador LoRA ni el checkpoint Transformers fusionado; el unico artefacto desplegable es el modelo CTranslate2 cuantizado a int8.

La innovacion principal es el flujo de adaptacion lexica controlada: se evaluo la capacidad del modelo para preservar terminos criticos, codigos, valores numericos y unidades en un holdout sintetico. El proceso incluye un "release receipt" con hashes SHA-256 para trazabilidad, y un "data contract" que documenta la procedencia de los datos. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Reconocimiento de voz automatico en japones, especializado en vocabulario financiero.
- Adaptacion a terminologia especifica del dominio (codigos, unidades, valores numericos) mediante la fusion LoRA.
- Manejo de transcripciones con puntuacion y normalizacion, segun los resultados del holdout sintetico.
- Compatibilidad con el entorno de ejecucion MocoVoice a traves de su wrapper `WhisperModel` y `compute_type="int8"`.
- No incluye capacidades de tool calling, agentes, vision, audio de entrada multimodal ni razonamiento multi-paso; es exclusivamente un modelo de transcripcion.

## Casos de uso

- Transcripcion de reuniones financieras: el modelo puede convertir grabaciones de juntas directivas o comites de inversion en texto, con mayor precision en terminos como "EBITDA", "ROE" o "derivados" gracias a la adaptacion LoRA. Su ventana de audio de 30 segundos (heredada de Whisper) permite procesar segmentos largos con segmentacion.
- Generacion de actas y minutas: integrado en un flujo de transcripcion, el modelo produce texto base que un sistema posterior puede resumir o estructurar en actas, reduciendo el trabajo manual de revision de terminologia financiera.
- Subtitulado de contenido financiero: para videos corporativos o webinars, el modelo transcribe el audio en japones con mejor cobertura de jerga del sector, aunque requiere revision humana por su caracter de prototipo.
- Archivado y busqueda de audio: al transcribir grabaciones de llamadas o presentaciones, se genera texto indexable que permite busquedas por terminos financieros especificos, facilitando la recuperacion de informacion.
- Validacion de modelos ASR en dominios especializados: sirve como referencia para evaluar si la adaptacion LoRA mejora la precision lexica frente al Whisper Turbo generico, usando el mismo decoder y protocolo de evaluacion.
- Demostracion tecnica para clientes: mocomoco puede presentar este modelo como prueba de concepto de su capacidad para adaptar ASR a dominios verticales, mostrando mejoras controladas en CER y preservacion de hechos criticos.

## Benchmarks y rendimiento

Los resultados publicados provienen de un holdout sintetico controlado, no de evaluaciones en campo. La model card incluye dos comparaciones: una entre el modelo base Turbo y una referencia de dominio (no distribuida), y otra entre el CT2 generico y el CT2 de dominio entregado. Se presentan los datos mas relevantes:

| Metrica | Base Turbo (referencia) | Referencia de dominio (no distribuida) | CT2 generico | CT2 de dominio entregado |
|---|---:|---:|---:|---:|
| Domain CER | 0.1826 | 0.1710 | 0.1620 | 0.1526 |
| Domain term present | 90/144 (62.5%) | 90/144 (62.5%) | 89/144 (61.8%) | 89/144 (61.8%) |
| Term present (punct.-insensitive) | 93/144 (64.6%) | 93/144 (64.6%) | 92/144 (63.9%) | 92/144 (63.9%) |
| Critical literal preserved | 86/144 (59.7%) | 86/144 (59.7%) | no disponible | no disponible |
| Controlled code fact | 44/48 (91.7%) | 44/48 (91.7%) | 44/48 (91.7%) | 44/48 (91.7%) |
| Controlled numeric value | 47/48 (97.9%) | 47/48 (97.9%) | 47/48 (97.9%) | 47/48 (97.9%) |
| Controlled value + unit fact | 47/48 (97.9%) | 47/48 (97.9%) | 47/48 (97.9%) | 47/48 (97.9%) |
| Neutral synthetic CER | 0.0343 | 0.0429 | no disponible | no disponible |

Ademas, el CT2 de dominio entregado mostro una CER de 0.1420 en el decoder int8, con 95/156 salidas exactamente coincidentes con la referencia Transformers sin cuantizar tras normalizacion. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo no esta disenado para tareas de texto generativo general.

## Requisitos de hardware

- Tamano del repositorio: 0.8 GB, lo que sugiere que el modelo cuantizado a int8 ocupa aproximadamente ese espacio en disco.
- VRAM estimada: no disponible en la documentacion. Dado el tamano del archivo, es plausible que quepa en GPUs consumer con al menos 2-4 GB de VRAM, pero no hay confirmacion oficial.
- GPU recomendadas: no especificadas. Para inferencia con CTranslate2, cualquier GPU moderna con soporte CUDA (p. ej., RTX 3060, RTX 4090, A100) deberia ser suficiente, aunque no se garantiza.
- Opciones de despliegue: el modelo esta disenado para usarse con el wrapper `WhisperModel` de MocoVoice, configurado con `compute_type="int8"`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo ASR, no un LLM generico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La unica comparacion directa disponible es contra el Whisper large-v3-turbo generico, tanto en su version Transformers como en su version CTranslate2. No se dispone de datos de otros modelos ASR japoneses especializados en finanzas (p. ej., ReazonSpeech, Kotoba-Whisper) en la informacion proporcionada.

| Modelo | Arquitectura | Contexto | Licencia | Formato | CER dominio (sintetico) |
|---|---|---|---|---|---|
| mocovoice-whisper-turbo-ja-finance-synthetic-v0.1 | Whisper large-v3-turbo + LoRA | 30 s (heredado) | MIT | CTranslate2 int8 | 0.1526 |
| Whisper large-v3-turbo (generico, CT2) | Whisper large-v3-turbo | 30 s | MIT (pesos) | CTranslate2 | 0.1620 |
| Whisper large-v3-turbo (generico, Transformers) | Whisper large-v3-turbo | 30 s | MIT (pesos) | safetensors | 0.1826 |

La mejora en CER es modesta (0.1620 a 0.1526) y se logra sin regresiones en hechos controlados, pero el alcance de la comparacion se limita al holdout sintetico.

## Limitaciones y advertencias

- Es un prototipo de demostracion, no un modelo de produccion ni certificado para seguridad. La propia model card lo califica como "marketing/demo artifact".
- Los datos de entrenamiento y evaluacion son sinteticos (TTS japones); no se utilizaron grabaciones reales de clientes, obras, fabricas ni entornos operativos. No se debe reclamar precision en condiciones reales.
- La evaluacion mide adaptacion lexica en un holdout controlado, no precision de campo. Los terminos controlados se solapan entre entrenamiento y holdout, lo que puede inflar los resultados.
- No se distribuyen los pesos LoRA ni el checkpoint Transformers fusionado; solo el modelo CTranslate2 int8. Esto limita la reproducibilidad y la inspeccion del adaptador.
- Existen perdidas diagnosticadas en la conversion de Transformers a CT2: se reportaron 1 perdida de termino semantico critico y 3 filas exactas de contenido que dejaron de ser exactas. Aunque la promocion bloquea regresiones frente al CT2 generico, no se garantiza la correccion absoluta de codigos, numeros o unidades.
- La licencia MIT permite uso comercial, pero el modelo no esta validado para entornos de alto riesgo (decisiones autonomas, datos de salud, etc.).
- Riesgo de alucinacion en terminos criticos: la tasa de "critical literal preserved" es del 59.7%, lo que indica que una parte significativa de terminos literales no se transcribe correctamente.
- No hay soporte para otros idiomas distintos del japones, y el dominio se limita a finanzas sinteticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mocomoco-inc/mocovoice-whisper-turbo-ja-finance-synthetic-v0.1
- Sitio de producto mocoVoice (ingles): https://products.mocomoco.ai/en/
- Sitio de producto mocoVoice (japones): https://products.mocomoco.ai/
- Noticia sobre mocoVoice Web: https://www.mocomoco.ai/en/news/mocoVoice-web/
- Pagina principal de mocomoco inc.: https://www.mocomoco.ai/en/
- GitHub de mocomoco-inc: https://github.com/mocomoco-inc
