# AhmedTaOu/whisper-large-v3-darija-lora

## Resumen

`whisper-large-v3-darija-lora` es un adaptador LoRA para el modelo de reconocimiento automático de voz `openai/whisper-large-v3`, desarrollado por AhmedTaOu y entrenado sobre el corpus DODa de habla marroquí (darija). El adaptador especializa el modelo base en la transcripción de árabe marroquí, un dialecto con escasa representación en los corpus de entrenamiento de Whisper y con una ortografía muy variable. El repositorio contiene únicamente los pesos del adaptador (PEFT) y el procesador, no el modelo completo.

El problema que aborda es la baja precisión de Whisper large-v3 en darija: según la evaluación del autor, el modelo base obtiene un WER normalizado del 74,4% en el conjunto de test de DODa, mientras que el adaptador lo reduce al 47,1% y el CER del 34,0% al 16,1%. Se trata de un proyecto de investigación sobre ASR para habla code-switched marroquí, y el adaptador es uno de varios modelos entrenados en ese contexto.

La relevancia es acotada pero clara: el darija es una variedad de bajo recurso con millones de hablantes y muy poca cobertura en modelos ASR comerciales. Este adaptador demuestra que un ajuste LoRA ligero (r=8, solo atención del decoder, encoder congelado) sobre Whisper large-v3 puede recortar el error a la mitad con un coste de entrenamiento mínimo (400 pasos en una Tesla T4), aunque la evaluación tiene sesgos metodológicos importantes que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) + adaptador LoRA sobre el decoder |
| Parámetros totales | No disponible (el adaptador LoRA es de rango 8; el modelo base Whisper large-v3 tiene 1550 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s (heredada de Whisper large-v3); clips de entrenamiento de 0,2 a 30 s |
| Tipos de cuantización | No disponible (los pesos se distribuyen en safetensors; el adaptador se aplica sobre el modelo base en fp16) |
| Idiomas soportados | `ar` (árabe), `ary` (árabe marroquí / darija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/whisper-large-v3`, un transformer encoder-decoder con 1550 M de parámetros diseñado para ASR multilingüe y traducción de voz. El ajuste es un LoRA de rango 8, alpha 16 y dropout 0,05 aplicado únicamente a la atención del decoder (`q_proj` y `v_proj`, tanto self-attention como cross-attention); el encoder permanece congelado. Esto implica que el adaptador no modifica la representación acústica del audio, sino solo el mecanismo de decodificación hacia texto darija.

Los datos provienen del corpus DODa audio (AtlasIA), usando la columna de texto `darija_Arab_new`. Tras filtrar, el conjunto queda en 10 178 utterances de entrenamiento, 1271 de validación y 1272 de test, con un split aleatorio 80/10/10 por utterance. El entrenamiento consistió en 400 pasos (unas 2,5 épocas), batch efectivo de 64, learning rate 1e-4 con schedule coseno, 50 pasos de warmup, weight decay 0,01 y precisión fp16, ejecutado en una Tesla T4 con transformers 5.23.0, peft 0.21.3, datasets 3.6.0 y torch 2.14.1. No se documenta RLHF ni DPO, al tratarse de un ajuste supervisado de ASR.

## Capacidades

- Transcripción de voz a texto en árabe marroquí (darija) escrita en grafía árabe.
- Reconocimiento de habla code-switched marroquí, según el contexto declarado del proyecto de investigación.
- Transcripción de clips de audio de 0,2 a 30 s (límite de ventana de Whisper large-v3).
- Decodificación con control de idioma (`language="arabic"`) y tarea (`task="transcribe"`).
- Uso como adaptador PEFT cargable sobre el modelo base con `PeftModel.from_pretrained`.
- No soporta tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento explícito; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en darija: el adaptador puede procesar clips cortos de hasta 30 s y convertir audio coloquial marroquí en texto árabe, algo que Whisper large-v3 sin ajuste hace con un WER cercano al 74%.
- Subtitulado de contenido audiovisual marroquí: para vídeos con habla en darija, el adaptador reduce el error de carácter al 16,1%, lo que facilita la generación de subtítulos revisables por un humano.
- Digitalización de entrevistas o encuestas orales: investigadores que recopilan testimonios en darija pueden usar el adaptador para pretranscribir y acelerar la anotación manual, aunque requerirá corrección posterior.
- Prototipado de asistentes de voz para el mercado marroquí: al ser un adaptador ligero sobre Whisper large-v3, se puede integrar en un pipeline existente de ASR sin reentrenar el modelo base.
- Análisis de llamadas de atención al cliente en darija: para entornos controlados y con audio limpio, el adaptador permite extraer transcripciones aproximadas que alimenten búsqueda o clasificación de motivos de llamada.
- Investigación en ASR de bajo recurso: sirve como punto de partida y referencia para experimentos de adaptación LoRA en dialectos árabes, dado que el autor documenta la configuración completa de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el split de test de DODa audio, 1272 utterances, decodificación greedy con `language="arabic"`. La métrica "normalized" elimina puntuación, diacríticos y tatweel; la "raw" solo aplica normalización Unicode NFC y espacios.

| Modelo | WER raw | CER raw | WER normalized | CER normalized |
|---|---|---|---|---|
| Whisper large-v3 (zero-shot) | 76,2% | 34,8% | 74,4% | 34,0% |
| + este adaptador LoRA | 47,6% | 16,3% | 47,1% | 16,1% |

No se han publicado en la información disponible resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con otros adaptadores de darija.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (el repo indica 0,0 GB, es decir, pesos de adaptador de pocos MB), pero requiere cargar el modelo base Whisper large-v3 completo.
- Whisper large-v3 en fp16 necesita aproximadamente 3,1 GB de VRAM solo para pesos; con activaciones y audio de 30 s, se recomienda al menos 6-8 GB de VRAM para inferencia cómoda.
- GPU recomendadas: Tesla T4 (la usada en el entrenamiento), RTX 3090, RTX 4090, A100, H100. Cabe en GPUs de consumo con 8 GB o más en fp16; en cuantización de 8 bits o 4 bits del modelo base cabría en GPUs de 4-6 GB, aunque no se documenta esa configuración.
- Opciones de despliegue: transformers + peft (documentado en la model card), y potencialmente vLLM o TGI si soportan adaptadores PEFT sobre Whisper; llama.cpp y Ollama no están documentados para este adaptador.
- Latencia y throughput: no disponibles. El entrenamiento se completó en 400 pasos sobre una T4, lo que da una idea del bajo coste de ajuste, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-large-v3-darija-lora (este) | 1550 M base + LoRA r=8 | 30 s | ar, ary | Apache 2.0 | Hugging Face (adaptador) |
| openai/whisper-large-v3 (base) | 1550 M | 30 s | Multilingüe (~99 idiomas) | Apache 2.0 | Hugging Face |
| Whisper large-v3-turbo | 809 M | 30 s | Multilingüe | Apache 2.0 | Hugging Face |
| Otros adaptadores darija | No disponible | No disponible | ary | No disponible | No disponible en la información proporcionada |

La comparación directa con otros adaptadores de darija no está disponible en la información proporcionada. Frente a Whisper large-v3, la única diferencia medible documentada es el WER en DODa (74,4% frente a 47,1% normalizado), a costa de perder la cobertura multilingüe general del modelo base si se usa el adaptador de forma exclusiva.

## Limitaciones y advertencias

- El corpus DODa fue grabado por solo 7 hablantes y consiste en frases cortas leídas; el rendimiento en otras voces, habla espontánea, audio con ruido o telefónico no está medido.
- El split es aleatorio por utterance, por lo que los mismos hablantes aparecen en train y test; los resultados reportados son probablemente optimistas y no reflejan generalización a hablantes nuevos.
- El WER normalizado del 47,1% sigue siendo alto para uso en producción sin revisión humana; el modelo comete errores frecuentes en la transcripción.
- La salida está en grafía árabe y el modelo no normaliza variantes ortográficas de palabras darija, lo que complica la comparación y el postprocesado.
- Riesgo de alucinación inherente a Whisper en segmentos de silencio o audio de baja calidad.
- No se documentan sesgos específicos, pero al entrenar sobre 7 hablantes es esperable un sesgo hacia sus características acústicas y de estilo de habla.
- Licencia Apache 2.0 permite uso comercial, pero debe tenerse en cuenta la licencia del modelo base (Apache 2.0) y del dataset DODa (MIT).
- El adaptador no incluye el modelo base: hay que descargar `openai/whisper-large-v3` por separado.
- No se han publicado métricas de latencia, throughput ni consumo de memoria en inferencia.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AhmedTaOu/whisper-large-v3-darija-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Dataset DODa audio: https://huggingface.co/datasets/atlasia/DODa-audio-dataset
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Librería PEFT: https://github.com/huggingface/peft
