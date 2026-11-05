# Infinix-io/higgs-tts-2-3b-base

## Resumen

Higgs TTS 2 es un modelo fundacional de generacion de audio desarrollado por Boson AI (publicado en HuggingFace bajo la organizacion Infinix-io) que se presenta como una alternativa de codigo abierto a sistemas propietarios de sintesis de voz. El modelo parte de Llama-3.2-3B como nucleo linguistico y anade un adaptador de audio especifico denominado DualFFN, alcanzando un total de 5.771.283.456 parametros segun los pesos en safetensors. Su propuesta central es la expresividad: no se limita a leer texto con una voz clonada, sino que adapta la prosodia al contenido, genera dialogos multi-hablante y puede producir voz y musica de fondo de forma simultanea.

El modelo se preentrena sobre mas de 10 millones de horas de audio (dataset AudioVerse) sin post-entrenamiento ni fine-tuning posterior, y utiliza un tokenizador de audio discreto propio que opera a 25 frames por segundo sobre datos a 24 kHz, cubriendo habla, musica y eventos sonoros en un unico sistema. Esta disenado para tareas de text-to-speech zero-shot, clonacion de voz y generacion de audio expresivo, y es relevante ahora porque demuestra capacidades emergentes poco habituales en TTS open source, como la adaptacion automatica de prosodia durante la narracion o el humming melodico con la voz clonada.

La licencia es "other", lo que obliga a revisar los terminos concretos antes de cualquier uso comercial. El modelo soporta oficialmente ingles, chino, aleman y coreano, y se distribuye en formato safetensors compatible con la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM (Llama-3.2-3B) con adaptador de audio DualFFN y tokenizador de audio discreto |
| Parametros totales | 5.771.283.456 (3.6B LLM + 2.2B DualFFN de audio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, de, ko |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Higgs TTS 2 se construye sobre Llama-3.2-3B y le incorpora un adaptador denominado DualFFN que actua como experto especifico de audio. Segun la model card, este adaptador anade 2.2B de parametros pero mantiene los mismos FLOPs de entrenamiento e inferencia que Llama-3.2-3B, y conserva el 91% de la velocidad de entrenamiento original del LLM. Los estudios de ablacion citados por el autor muestran mejoras consistentes en word error rate (WER) y similitud de hablante frente a una variante sin DualFFN.

El entrenamiento se realizo sobre AudioVerse, un corpus de mas de 10 millones de horas de audio limpiado y anotado mediante un pipeline automatico que combina varios modelos ASR, clasificadores de eventos sonoros y un modelo interno de comprension de audio basado en Higgs Audio v1 Understanding. El tokenizador de audio es un modelo discreto entrenado desde cero que captura caracteristicas semanticas y acusticas de forma unificada, funciona a 25 fps sobre audio de 24 kHz y emplea un encoder/decoder no difusivo para permitir inferencia rapida por lotes. No se menciona en la informacion disponible el uso de RLHF o DPO; de hecho, el autor indica explicitamente que el modelo no tiene post-entrenamiento ni fine-tuning.

## Capacidades

- Generacion de voz expresiva a partir de texto, con adaptacion automatica de prosodia durante la narracion.
- Clonacion de voz zero-shot a partir de audio de referencia.
- Generacion de dialogos multi-hablante naturales en varios idiomas.
- Humming melodico utilizando la voz clonada.
- Generacion simultanea de voz y musica de fondo.
- Soporte multilingue en ingles, chino, aleman y coreano.
- Tokenizacion unificada de habla, musica y eventos sonoros.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, dado que es un modelo de generacion de audio y no un LLM conversacional.

## Casos de uso

- Audiolibros y narracion automatica: el modelo ajusta la prosodia al contenido del texto, lo que permite generar narraciones largas con entonacion variable sin intervencion manual.
- Doblaje y localizacion de contenido: con clonacion de voz zero-shot y soporte de cuatro idiomas, se puede reutilizar la voz de un actor para versiones en ingles, chino, aleman o coreano.
- Asistentes de voz y atencion al cliente: la generacion de habla expresiva y multi-turno permite construir interfaces conversacionales con voces personalizadas por marca.
- Produccion de podcasts sinteticos: la capacidad de generar dialogos multi-hablante y musica de fondo simultanea facilita la creacion de episodios completos a partir de guiones.
- Accesibilidad y lectura de textos: sintesis de voz de alta calidad para lectores de pantalla y conversion de documentos a audio con voces naturales.
- Creacion musical y prototipado: el humming con voz clonada y la generacion de eventos sonoros permiten bocetos rapidos de ideas musicales.
- Investigacion en TTS: al ser un modelo fundacional abierto con tokenizador propio, sirve como base para experimentacion en sintesis de voz y audio.

## Benchmarks y rendimiento

Los datos disponibles en la model card incluyen resultados parciales. En EmergentTTS-Eval, el modelo alcanza una tasa de victoria del 75,7% frente a "gpt-4o-mini-tts" en la categoria "Emotions" y del 55,7% en la categoria "Questions". El autor afirma obtener rendimiento state-of-the-art en Seed-TTS Eval y en el Emotional Speech Dataset (ESD), pero la tabla de resultados de Seed-TTS Eval y ESD aparece truncada en la informacion proporcionada, por lo que no se pueden reproducir las cifras concretas.

| Benchmark | Metrica | Resultado |
|---|---|---|
| EmergentTTS-Eval (Emotions) | Tasa de victoria vs gpt-4o-mini-tts | 75,7% |
| EmergentTTS-Eval (Questions) | Tasa de victoria vs gpt-4o-mini-tts | 55,7% |
| Seed-TTS Eval | no disponible (tabla truncada) | no disponible |
| ESD | no disponible (tabla truncada) | no disponible |
| Multi-speaker Eval | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 5,77B de parametros en safetensors (11,6 GB de repo), la inferencia en precision completa requiere del orden de 12-24 GB de VRAM segun el esquema de pesos; las cifras exactas no estan publicadas.
- GPU recomendadas: no disponible. Por tamano, cabria esperar funcionamiento en GPUs de 24 GB o superiores (RTX 4090, A100 40 GB, H100), pero el autor no publica requisitos oficiales.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) en funcion de la cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: la model card referencia transformers y un HF Space Playground; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Higgs TTS 2 (este modelo) | 5,77B | no disponible | en, zh, de, ko | other | TTS expresivo zero-shot, dialogos multi-hablante, musica de fondo |
| gpt-4o-mini-tts | no disponible | no disponible | no disponible | propietaria | Referencia de comparacion en EmergentTTS-Eval; Higgs TTS 2 le supera en tasas de victoria en Emotions y Questions |
| Higgs Audio v1 Understanding | no disponible | no disponible | no disponible | no disponible | Modelo previo de Boson AI usado como base del pipeline de anotacion |

No se dispone de datos suficientes en la informacion proporcionada para comparar parametros, contexto y rendimiento con alternativas open source de la misma categoria.

## Limitaciones y advertencias

- La licencia es "other": es imprescindible revisar los terminos concretos del repositorio antes de cualquier uso comercial o redistribucion.
- El modelo no ha pasado por post-entrenamiento ni fine-tuning, lo que puede traducirse en un control menos preciso del estilo o del formato de salida en comparacion con modelos ajustados.
- Riesgo de alucinacion y artefactos acusticos: al ser un modelo generativo de audio, puede producir pronunciaciones incorrectas, ruidos o inconsistencias en textos largos o dominios especializados.
- Cobertura idiomatica limitada a ingles, chino, aleman y coreano; no se documenta soporte de castellano.
- No se publican datos sobre sesgos demograficos o acusticos en las voces generadas.
- La clonacion de voz plantea riesgos de suplantacion y uso indebido; no se documentan mecanismos de mitigacion o marcas de agua.
- No se especifican requisitos de hardware ni latencias oficiales, lo que dificulta la planificacion de despliegues en produccion.
- El contexto maximo no esta documentado, lo que limita el diseno de pipelines con entradas de texto muy largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Infinix-io/higgs-tts-2-3b-base
- Blog de lanzamiento: https://boson.ai/blog/higgs-audio-v2
- Repositorio GitHub: https://github.com/boson-ai/higgs-audio
- HF Space Playground: https://huggingface.co/spaces/smola/higgs_audio_v2
- Tokenizador de audio: https://huggingface.co/bosonai/higgs-audio-v2-tokenizer
- Blog de arquitectura: https://github.com/boson-ai/higgs-audio/blob/main/tech_blogs/ARCHITECTURE_BLOG.md
- Repositorio EmergentTTS-Eval: https://github.com/boson-ai/emergenttts-eval-public
- Paper EmergentTTS-Eval: https://arxiv.org/abs/2505.23009
- Seed-TTS Eval: https://github.com/BytedanceSpeech/seed-tts-eval
- Emotional Speech Dataset (ESD): https://paperswithcode.com/dataset/esd
- Llama-3.2-3B: https://huggingface.co/meta-llama/Llama-3.2-3B
