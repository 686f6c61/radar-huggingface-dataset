# apabiekun/ohun-stt-v1

## Resumen

Ohùn v1 (ohun-stt-v1) es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario apabiekun dentro del proyecto Ohùn, orientado a dos lenguas de Nigeria: el yoruba y el pidgin nigeriano. Se trata de un fine-tuning de openai/whisper-small, un transformer encoder-decoder de tipo Whisper con 241.734.912 parámetros, publicado en Hugging Face con licencia CC BY-SA 4.0 y pensado para su uso con la librería transformers.

El modelo aborda un problema concreto: la escasa cobertura de las lenguas nigerianas en los sistemas ASR comerciales y de propósito general. Según la model card, el modelo mejora de forma sustancial el WER de Whisper-turbo en pidgin nigeriano (21,1 % frente a 48,4 % en el test de nigerian-pidgin-1.0) y ofrece un rendimiento competitivo en yoruba (45,8 % en FLEURS yo_ng). El autor lo describe explícitamente como un lanzamiento temprano: el pidgin está en estado utilizable y el yoruba es todavía una preview.

La relevancia actual radica en que cubre dos lenguas con millones de hablantes y muy poca representación en herramientas ASR, con un modelo pequeño (whisper-small) que puede ejecutarse en hardware modesto. El entrenamiento se realizó en dos GPU Kaggle T4 durante 5,7 horas, lo que indica que el modelo está al alcance de equipos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, fine-tuning de openai/whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por chunk en el pipeline) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas en la informacion disponible) |
| Idiomas soportados | yoruba (yo) y pidgin nigeriano (pcm; se invoca con el token de ingles de Whisper) |
| Licencia | CC BY-SA 4.0 (pesos); modelo base Whisper-small bajo Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de openai/whisper-small, es decir, un transformer encoder-decoder con atención estándar y entrada de audio de 16 kHz mono. No introduce cambios arquitectónicos propios: la innovación está en los datos y en el ajuste fino sobre dos lenguas nigerianas. El pipeline recomendado usa `chunk_length_s=30`, procesando el audio en ventanas de 30 segundos.

El entrenamiento consistió en 4.000 pasos con lotes de 16 clips (mitad yoruba, mitad pidgin), tasa de aprendizaje 1e-5, sobre dos GPU Kaggle T4 durante 5,7 horas. Los datos provienen de cuatro conjuntos: WaZoBiaSpeech (split de train en pidgin), Nigerian Pidgin ASR 1.0 (split de train), FLEURS yo_ng (solo clips con marcas de tono) y BibleTTS (split de train en yoruba). Se descartaron los clips de yoruba sin marcas de tono para evitar que el modelo aprendiera a omitirlos, y se normalizó el texto a Unicode NFC conservando tonos y puntos inferiores. Las etiquetas de anotación de WaZoBiaSpeech como `[um]` se mantuvieron en esta v1 (la v2 las elimina). No se menciona en la información disponible el uso de RLHF ni DPO.

## Capacidades

- Transcripción de voz a texto en yoruba y en pidgin nigeriano.
- Manejo de marcas de tono y puntos inferiores en yoruba (aunque con errores frecuentes, según el autor).
- Procesamiento de audio en fragmentos de 30 segundos mediante el pipeline de transformers, con remuestreo automático a 16 kHz.
- Selección de idioma mediante `generate_kwargs` (`language: "yo"` para yoruba; `language: "en"` para pidgin, ya que Whisper no tiene token propio de pidgin).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de salida ni modo de razonamiento extendido.
- No se documenta soporte multilingüe más allá de las dos lenguas objetivo.

## Casos de uso

- Transcripción de contenido audiovisual en pidgin nigeriano: el modelo reduce el WER a 21,1 % en el test de nigerian-pidgin-1.0, lo que lo hace adecuado para subtitular vídeos, pódcast o programas de radio dirigidos a audiencias nigerianas.
- Documentación de entrevistas y testimonios en yoruba: útil para investigación de campo y periodismo, siempre que se revise manualmente la transcripción por los errores en tonos y nombres propios.
- Subtitulado automático de reuniones y llamadas en entornos con habla mayoritariamente leída o clara: el modelo funciona mejor con habla leída que con conversación espontánea, según las limitaciones declaradas.
- Preprocesamiento de corpus para proyectos de lingüística computacional: generar transcripciones preliminares de audio en yoruba y pidgin que luego se corrigen y se usan para ampliar datasets.
- Accesibilidad para hablantes de pidgin nigeriano: transcripción de notas de voz y mensajes de audio en aplicaciones de mensajería, con la ventaja de que el modelo es pequeño y puede desplegarse en infraestructura modesta.
- Investigación y evaluación comparativa de ASR de bajos recursos: el modelo sirve como línea base reproducible (whisper-small fine-tuneado) para comparar con MMS-1B o N-ATLaS en yoruba y pidgin.
- Prototipado rápido en demo Spaces: el autor publica una demo en Hugging Face Spaces, lo que facilita probar el modelo sin infraestructura propia.

## Benchmarks y rendimiento

Resultados de WER (menor es mejor) publicados en la model card del autor:

| Test set | Ohùn v1 | Whisper-turbo | MMS-1B (Meta) | N-ATLaS Yoruba (NCAIR) |
|---|---|---|---|---|
| Pidgin, nigerian-pidgin-1.0 test (892 clips) | 21,1 % | 48,4 % | 47,3 % | no disponible |
| Pidgin, WaZoBiaSpeech dev_test deduplicado (70 clips) | 36,2 % | 50,8 % | 39,8 % | no disponible |
| Yoruba, FLEURS yo_ng test (831 clips) | 45,8 % (38,9 % sin tonos) | 102,8 % | 45,4 % (33,5 % sin tonos) | 58,4 % |

Notas del autor: MMS-1B tiene licencia solo para uso no comercial. El conjunto WaZoBiaSpeech dev_test shard 0 contiene un 81 % de frases repetidas del split de train, por lo que solo se puntúan los 70 clips cuyas frases no aparecen en train. El test de nigerian-pidgin-1.0 no comparte frases con train, pero probablemente sí hablantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 241,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 1 GB (tamaño del repo: 1,0 GB), por lo que la inferencia cabe holgadamente en GPU consumer.
- GPU recomendadas: el modelo se entrenó en dos Kaggle T4, lo que indica que una T4 es suficiente para inferencia; también cabe en RTX 3060, RTX 4060, RTX 4090 y superiores.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos GB de VRAM; incluso es viable en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline de transformers (recomendado por el autor), con posibilidad de usar vLLM, TGI o llama.cpp si se generan conversiones compatibles (no publicadas en la información disponible); Ollama no está documentado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | WER yoruba (FLEURS) | WER pidgin (nigerian-pidgin-1.0) |
|---|---|---|---|---|---|---|
| Ohùn v1 | 241,7 M | chunks de 30 s | yo, pcm | CC BY-SA 4.0 | 45,8 % | 21,1 % |
| Whisper-turbo (OpenAI) | no disponible en la informacion | chunks de 30 s | multilingue | no disponible en la informacion | 102,8 % | 48,4 % |
| MMS-1B (Meta) | 1.000 M (aprox., segun nombre) | no disponible | multilingue | solo uso no comercial | 45,4 % | 47,3 % |
| N-ATLaS Yoruba (NCAIR) | no disponible | no disponible | yoruba | no disponible | 58,4 % | no disponible |

Ohùn v1 destaca en pidgin nigeriano con una diferencia amplia frente a Whisper-turbo y MMS-1B, y en yoruba queda en un rango comparable a MMS-1B (algo peor con tonos, algo peor también sin tonos) y mejor que N-ATLaS. Su principal ventaja competitiva es el tamaño reducido y una licencia que permite uso comercial con atribución y share-alike.

## Limitaciones y advertencias

- Las marcas de tono del yoruba suelen ser incorrectas o estar ausentes, y los nombres propios salen deformados.
- Los números en pidgin se transcriben como palabras homófonas ("4 goals" se convierte en "for goals").
- Los datos de entrenamiento en yoruba son mayoritariamente habla leída, con una parte importante de un solo hablante leyendo la Biblia, por lo que el habla conversacional cotidiana es más difícil.
- No se ha evaluado en llamadas telefónicas con ruido, voces infantiles ni code-switching intenso con inglés.
- Las etiquetas de anotación de WaZoBiaSpeech como `[um]` permanecen en las transcripciones de esta v1.
- Riesgo de alucinación y de errores en segmentos con audio degradado, habitual en modelos Whisper; no cuantificado en la información disponible.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir a Ohùn y a los datasets, y a compartir las adaptaciones bajo la misma licencia. El modelo base Whisper-small es Apache-2.0.
- Los términos de WaZoBiaSpeech prohíben su uso para text-to-speech o clonación de voz; este modelo es únicamente de voz a texto.
- Sesgos conocidos: no documentados explícitamente en la información disponible, más allá del desequilibrio de hablantes en el corpus yoruba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apabiekun/ohun-stt-v1
- Demo Space: https://huggingface.co/spaces/apabiekun/ohun
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset WaZoBiaSpeech: https://huggingface.co/datasets/Africanvoice/naija_african_voices
- Dataset Nigerian Pidgin ASR 1.0: https://huggingface.co/datasets/asr-nigerian-pidgin/nigerian-pidgin-1.0
- Paper asociado a Nigerian Pidgin ASR 1.0: https://arxiv.org/abs/2010.11123
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- BibleTTS (OpenSLR 129): https://www.openslr.org/129/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
