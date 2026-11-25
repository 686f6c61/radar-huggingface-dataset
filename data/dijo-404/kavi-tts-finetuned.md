# Dijo-404/kavi-tts-finetuned

## Resumen

Kavi es un ajuste fino (fine-tune) del modelo Qwen3-TTS 0.6B Base de Alibaba Qwen, especializado en síntesis de voz (text-to-speech) con clonación de voz. Lo desarrolla el usuario Dijo-404 dentro del pipeline Kural 4000, un proceso de entrenamiento que ha adaptado el modelo base sobre un conjunto reducido de 530 clips de audio cribados y 58 clips de validación. El checkpoint completo en safetensors incluye la configuración de Qwen, el tokenizer y el tokenizer de voz.

El modelo resuelve el problema de generar habla natural en inglés a partir de texto manteniendo una identidad de voz concreta mediante condicionamiento de referencia. Su relevancia radica en que parte de un modelo base compacto (0,6B nominales, 914,6 millones de parámetros reales en el checkpoint) y lo especializa con muy pocos datos, lo que lo hace interesante como caso de estudio de ajuste eficiente en TTS y como opción de inferencia offline en hardware de consumo.

El entrenamiento se completó en una RTX 4080 con 160 actualizaciones de fine-tuning y 20 actualizaciones de recuperación con reconocimiento INT4, guardando los pesos finales en FP32. La model card indica que el checkpoint está disponible para evaluación e inferencia offline, con las comprobaciones de publicación en navegador pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (modelo de síntesis de voz basado en transformer; detalles internos no disponibles) |
| Parametros totales | 914.643.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en FP32; el entrenamiento incluyó recuperación con reconocimiento INT4) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye configuración, tokenizer y speech tokenizer) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen3-TTS-12Hz-0.6B-Base, un modelo de text-to-speech de la familia Qwen3-TTS. La arquitectura concreta (número de capas, dimensiones, mecanismo de atención) no se detalla en la información disponible; la librería asociada es `qwen3-tts` y el pipeline declarado es `text-to-speech`. El checkpoint incluye el tokenizer de texto y el tokenizer de voz necesarios para la generación.

El entrenamiento se realizó con el pipeline Kural 4000 sobre 530 clips de audio cribados, con 58 clips reservados para validación. Se completaron 160 actualizaciones de fine-tuning y 20 actualizaciones adicionales de recuperación con reconocimiento INT4 en una RTX 4080. Los pesos finales se guardaron en FP32. La model card documenta un SHA-256 del checkpoint (`c66d7c43479e09a8af47c64336128dcb71f73a134c998119677e13b129385fe9`) y fija una revisión concreta del código fuente de Qwen3-TTS para reproducir la inferencia. No se especifican el número de tokens de entrenamiento ni la composición completa del dataset más allá del recuento de clips.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- Clonación de voz mediante condicionamiento con audio de referencia y su transcripción (`create_voice_clone_prompt`).
- Generación en modo no streaming (`non_streaming_mode=True`) con control de `max_new_tokens`, `temperature` y `repetition_penalty`.
- Generación de muestras cortas, medias y largas (la model card incluye ejemplos de las tres categorías).
- Inferencia offline en PyTorch con CUDA y atención SDPA.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Clonación de voz para locuciones: el modelo permite generar habla con una identidad de voz concreta a partir de un perfil de referencia (audio más transcripción), útil para producir locuciones consistentes de un mismo hablante en varios textos.
- Generación de audiolibros y contenido narrado: con muestras de referencia cortas, medias y largas ya validadas, puede emplearse para narrar pasajes de distinta longitud manteniendo el timbre.
- Prototipado de asistentes de voz en inglés: al ser un modelo compacto (914,6 M de parámetros) y con licencia Apache 2.0, sirve para experimentar con interfaces de voz en entornos de desarrollo sin depender de servicios en la nube.
- Evaluación de pipelines de fine-tuning TTS: el repositorio documenta el proceso Kural 4000, los recuentos de clips y las actualizaciones INT4, por lo que es útil como referencia reproducible para ajustar modelos Qwen3-TTS con pocos datos.
- Doblaje y previsualización de contenido: generar pistas de voz de prueba para vídeos o demos antes de una locución definitiva, con la ventaja de la inferencia offline.
- Investigación en clonación de voz: permite estudiar el comportamiento de un modelo base de 0,6B ajustado con 530 clips y medir la calidad con métricas de error de palabra (WER) y similitud de hablante.

## Benchmarks y rendimiento

La model card reporta métricas de validación sobre 3 clips retenidos (short, medium y long), no benchmarks estándar de la literatura:

| Metrica | Resultado |
|---|---|
| Clips que pasan comprobaciones de forma de onda | 3 de 3 |
| WER medio con Nemotron | 1,0 % |
| WER medio con Whisper | 1,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo TTS. El informe de comparación (`evaluation/comparison.json`) incluye puntuaciones de línea base, coseno de hablante y velocidad de habla, pero sus valores no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 914,6 M de parámetros en FP32 el peso de los parámetros ronda los 3,7 GB, a lo que hay que sumar el tokenizer de voz y las activaciones.
- GPU recomendadas: la model card documenta entrenamiento en RTX 4080; la inferencia se describe con `device_map="cuda:0"`, por lo que una GPU consumer con suficiente VRAM es viable.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque el dato exacto no está publicado.
- Opciones de despliegue: PyTorch con CUDA, `attn_implementation="sdpa"` y la librería `qwen3-tts`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Kavi (este modelo) | 914.643.008 | no disponible | en | Apache 2.0 | Fine-tune de Qwen3-TTS 0.6B con 530 clips; WER 1,0 % en 3 clips de validación |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6B nominales | no disponible | no disponible | no disponible en la información | Modelo base del que deriva Kavi |
| Alternativas TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con otras alternativas TTS de la misma categoría más allá del modelo base.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se ha validado para otros idiomas.
- El ajuste fino se realizó con solo 530 clips, lo que puede limitar la generalización a voces, estilos o dominios distintos del conjunto de entrenamiento.
- Las métricas de calidad publicadas se basan en 3 clips de validación; la evidencia es muy limitada y no debe extrapolarse a producción sin una evaluación propia.
- Riesgo de alucinación en la transcripción o de artefactos en la forma de onda en textos largos o fuera de dominio; la model card solo valida tres longitudes concretas.
- Las comprobaciones de publicación en navegador están pendientes según la model card.
- Aunque la licencia es Apache 2.0, el uso comercial de clonación de voz puede estar sujeto a normativa sobre derechos de imagen y voz; conviene revisar el consentimiento de las voces de referencia.
- No se documentan sesgos específicos del modelo; al derivar de un modelo base no se puede descartar la herencia de sesgos de este.
- El checkpoint se guarda en FP32; no se ofrecen versiones cuantizadas listas para usar, aunque el entrenamiento incluyó recuperación con reconocimiento INT4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dijo-404/kavi-tts-finetuned
- Pesos: https://huggingface.co/Dijo-404/kavi-tts-finetuned/resolve/main/model.safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base/tree/5d83992436eae1d760afd27aff78a71d676296fc
- Código fuente de Qwen3-TTS (revisión fijada): https://github.com/QwenLM/Qwen3-TTS/tree/022e286b98fbec7e1e916cb940cdf532cd9f488e
- Pipeline Kural 4000: https://github.com/techytales/Voice_qwenSample/tree/246fa63830fa98612afab26af78944cfcb5c6399
- Demo en navegador y perfil de voz original: https://huggingface.co/Dijo-404/kavi-tts
- Muestra corta: https://huggingface.co/Dijo-404/kavi-tts-finetuned/resolve/main/samples/short.wav
- Muestra media: https://huggingface.co/Dijo-404/kavi-tts-finetuned/resolve/main/samples/medium.wav
- Muestra larga: https://huggingface.co/Dijo-404/kavi-tts-finetuned/resolve/main/samples/long.wav
