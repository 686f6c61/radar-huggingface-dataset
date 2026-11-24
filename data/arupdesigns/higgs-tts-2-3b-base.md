# arupDesigns/higgs-tts-2-3b-base

## Resumen

Higgs TTS 2 es un modelo fundacional de generacion de audio desarrollado por Boson AI (distribuido en este repositorio por el usuario arupDesigns). Se trata de un modelo de texto-a-habla (text-to-speech) construido sobre Llama-3.2-3B al que se le incorpora un adaptador de audio denominado DualFFN, lo que eleva el total de parametros a aproximadamente 5.770 millones (3.6B del LLM mas 2.2B del DualFFN). El modelo fue preentrenado sobre mas de 10 millones de horas de audio (el corpus AudioVerse) sin post-entrenamiento ni fine-tuning, y destaca por su expresividad en la generacion de voz.

La relevancia del modelo radica en sus capacidades emergentes: adaptacion automatica de prosodia durante la narracion, generacion zero-shot de dialogos multi-hablante naturales en varios idiomas, tarareo melodico con voz clonada y generacion simultanea de habla y musica de fondo. En la evaluacion EmergentTTS-Eval obtiene tasas de victoria del 75,7 % y 55,7 % frente a gpt-4o-mini-tts en las categorias de "Emociones" y "Preguntas", respectivamente.

El modelo soporta cuatro idiomas (ingles, chino, aleman y coreano) y se distribuye con licencia "other", lo que obliga a revisar los terminos especificos antes de cualquier uso comercial. Su tokenizador de audio unificado, entrenado desde cero a 24 kHz y 25 frames por segundo, captura caracteristicas tanto semanticas como acusticas en un unico sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.2-3B) con adaptador de audio DualFFN |
| Parametros totales | 5.771.283.456 (3.6B LLM + 2.2B DualFFN) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, de, ko |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Higgs TTS 2 se construye sobre Llama-3.2-3B e incorpora la arquitectura DualFFN como adaptador de audio. DualFFN actua como un experto especifico de audio que mejora la capacidad del LLM para modelar tokens acusticos con una sobrecarga computacional minima: segun la model card, preserva el 91 % de la velocidad de entrenamiento original del LLM pese a anadir 2.2B de parametros, y mantiene los mismos FLOPs de entrenamiento e inferencia que Llama-3.2-3B. Los estudios de ablacion citados indican que el modelo con DualFFN supera de forma consistente a su equivalente sin el en terminos de word error rate (WER) y similitud de hablante.

El entrenamiento se realizo sobre AudioVerse, un corpus de 10 millones de horas de audio limpiado y anotado mediante un pipeline automatizado que combina multiples modelos ASR, clasificadores de eventos sonoros y un modelo interno de comprension de audio (fine-tune de Higgs Audio v1 Understanding). El modelo emplea un tokenizador de audio unificado entrenado desde cero que captura caracteristicas semanticas y acusticas, opera a 25 frames por segundo y es el primero entrenado sobre datos a 24 kHz cubriendo habla, musica y eventos sonoros en un unico sistema. El encoder/decoder es no difusivo, lo que permite inferencia rapida por lotes. No se menciona en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de voz expresiva a partir de texto, con adaptacion automatica de prosodia durante la narracion.
- Clonacion de voz zero-shot a partir de audio de referencia.
- Generacion zero-shot de dialogos multi-hablante naturales.
- Tarareo melodico (humming) con la voz clonada.
- Generacion simultanea de habla y musica de fondo.
- Capacidades multilingues en ingles, chino, aleman y coreano.
- Modelado de eventos sonoros y musica gracias al tokenizador unificado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Audiolibros y narracion: el modelo adapta la prosodia automaticamente durante pasajes largos, lo que permite generar narraciones con entonacion natural sin ajuste manual por frase.
- Doblaje y localizacion: con soporte de en, zh, de y ko y clonacion de voz zero-shot, se puede reutilizar la voz del actor original en distintas lenguas a partir de una muestra de referencia.
- Generacion de dialogos para videojuegos y medios: la capacidad de producir dialogos multi-hablante zero-shot facilita crear conversaciones entre varios personajes sin entrenar voces por separado.
- Produccion musical y contenido creativo: la generacion simultanea de habla y musica de fondo, junto con el tarareo melodico con voz clonada, sirve para prototipar jingles, canciones o piezas con voz y acompanamiento.
- Asistentes de voz y agentes conversacionales: la expresividad emocional (75,7 % de victorias frente a gpt-4o-mini-tts en la categoria de Emociones) lo hace adecuado para interfaces de voz que requieren transmitir estados de animo.
- Accesibilidad y sintesis personalizada: la clonacion de voz permite crear voces personalizadas para usuarios con dificultades del habla a partir de muestras de referencia.
- Contenido educativo y podcasts: la generacion de dialogos multi-hablante y la musica de fondo integrada permiten producir episodios completos de forma automatizada.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Benchmark | Metrica | Resultado |
|---|---|---|
| EmergentTTS-Eval (Emotions) | Tasa de victoria vs. gpt-4o-mini-tts | 75,7 % |
| EmergentTTS-Eval (Questions) | Tasa de victoria vs. gpt-4o-mini-tts | 55,7 % |
| Seed-TTS Eval | no disponible (tabla truncada en la informacion) | no disponible |
| ESD (Emotional Speech Dataset) | no disponible (tabla truncada en la informacion) | no disponible |
| Multi-speaker Eval | no disponible (tabla truncada en la informacion) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5.771 millones de parametros, en FP16 se requieren aproximadamente 11,5 GB solo para los pesos; en cuantizaciones de 8 bits rondaria los 6 GB y en 4 bits unos 3 GB, sin contar el tokenizador de audio ni las activaciones.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si en modelos con 12 GB o mas de VRAM en FP16, y en GPU de 8 GB con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: la libreria indicada es transformers; el repositorio incluye la etiqueta endpoints_compatible. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Higgs TTS 2 (este modelo) | 5.771 M (3.6B LLM + 2.2B DualFFN) | no disponible | en, zh, de, ko | other | Preentrenado sobre 10M horas de audio; expresividad y dialogos multi-hablante |
| gpt-4o-mini-tts | no disponible | no disponible | no disponible | propietaria | Referencia en EmergentTTS-Eval; Higgs TTS 2 lo supera en Emotions y Questions |
| Higgs Audio v1 Understanding | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que se fine-tuneo el modelo de comprension usado en el pipeline de anotacion |

No se dispone de datos suficientes para comparar parametros, contexto y rendimiento con otras alternativas open source de la misma categoria.

## Limitaciones y advertencias

- La licencia es "other": es imprescindible revisar los terminos exactos antes de cualquier uso comercial, ya que no se especifican en la informacion disponible.
- El modelo es una version "base" preentrenada sin post-entrenamiento ni fine-tuning, por lo que su comportamiento puede ser menos controlable que el de variantes ajustadas.
- Riesgo de alucinacion y de artefactos acusticos: no se documentan en la informacion disponible las tasas de error en condiciones adversas.
- Cobertura linguistica limitada a ingles, chino, aleman y coreano; no se garantiza un rendimiento adecuado en castellano.
- La clonacion de voz y el tarareo con voz clonada plantean riesgos de suplantacion y uso indebido; se requiere consentimiento explicito y cumplimiento normativo.
- No se especifican la longitud de contexto, los tipos de cuantizacion soportados ni los requisitos oficiales de hardware, lo que dificulta planificar un despliegue en produccion.
- El repositorio pertenece a un usuario tercero (arupDesigns) y no al desarrollador original (Boson AI); conviene verificar la integridad de los pesos frente al repositorio oficial.

## Enlaces

- Hugging Face: https://huggingface.co/arupDesigns/higgs-tts-2-3b-base
- Blog de lanzamiento: https://boson.ai/blog/higgs-audio-v2
- Repositorio GitHub: https://github.com/boson-ai/higgs-audio
- Demo en HF Space: https://huggingface.co/spaces/smola/higgs_audio_v2
- Tokenizador de audio: https://huggingface.co/bosonai/higgs-audio-v2-tokenizer
- Blog de arquitectura: https://github.com/boson-ai/higgs-audio/blob/main/tech_blogs/ARCHITECTURE_BLOG.md
- EmergentTTS-Eval (paper): https://arxiv.org/abs/2505.23009
- EmergentTTS-Eval (repositorio): https://github.com/boson-ai/emergenttts-eval-public
- Seed-TTS Eval: https://github.com/BytedanceSpeech/seed-tts-eval
- ESD (Emotional Speech Dataset): https://paperswithcode.com/dataset/esd
- Llama-3.2-3B: https://huggingface.co/meta-llama/Llama-3.2-3B
