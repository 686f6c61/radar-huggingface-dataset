# mddalwai/whisper-small-edacc

## Resumen

Whisper-small-edacc es un ajuste fino completo de `openai/whisper-small` (244M parametros) sobre EdAcc, un corpus de conversaciones coloquiales en ingles con hablantes de multiples acentos. Lo desarrolla mddalwai y resuelve un problema concreto: el Whisper original transcribe razonablemente bien ingles leido, pero pierde palabras cortas y entra en bucles cuando se enfrenta a habla conversacional con acentos marcados. El modelo se entrena con 15,9 horas de EdAcc mas un 15% de clips de LibriSpeech para limitar el olvido catastrofico del dominio de lectura.

La arquitectura es la de Whisper-small: un transformer encoder-decoder con 12 capas en cada mitad, atencion completa y 244M de parametros. El contexto de audio esta limitado a ventanas de 30 segundos, igual que el modelo base. La relevancia practica esta en que un modelo de 244M supera en WER al Whisper-large-v3-turbo (809M) en el split de test de EdAcc, aunque el propio autor matiza que buena parte de la mejora viene del estilo de transcripcion (palabra por palabra, sin puntuacion) y de la eliminacion de bucles, no solo del reconocimiento de acentos.

El modelo esta pensado exclusivamente para transcripcion de audio corto en ingles conversacional. No soporta otros idiomas, no hace diarizacion y no debe usarse en entornos de alto riesgo. Se distribuye en safetensors y existe una version CTranslate2 para inferencia rapida en CPU con faster-whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizacion via CTranslate2 en la version ct2 |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors; version CTranslate2 disponible en `mddalwai/whisper-small-edacc-ct2` |

## Arquitectura y entrenamiento

Whisper-small es un transformer encoder-decoder con 12 capas de encoder y 12 de decoder, atencion multi-cabeza completa y embeddings de audio tipo log-Mel. El ajuste es un fine-tune completo (no LoRA ni adaptadores): learning rate 1e-5 con decaimiento lineal, 200 pasos de warmup, batch efectivo de 32, 2000 pasos en bf16 y seleccion del mejor checkpoint de 8 segun WER de validacion (paso 1750). Los datos de entrenamiento son el split train de EdAcc (disjunto por hablante y conversacion respecto a validacion y test, con segmentos de mas de 30 s, sin transcripcion o en idioma extranjero eliminados) mas 2.077 clips de LibriSpeech train-clean-100 (7,4 h), lo que supone un 15% del total. Los textos objetivo se pasan a minusculas y se eliminan etiquetas como `<laugh>`.

No se menciona RLHF ni DPO. La innovacion tecnica no esta en la arquitectura, sino en la estrategia de datos: el replay de LibriSpeech para contener la degradacion en habla leida y la evaluacion por bootstrap emparejado sobre hablantes para dar intervalos de confianza al WER. El autor documenta un analisis palabra por palabra que atribuye +5,7 puntos de mejora a palabras que el modelo base omitia (mayoritariamente palabras cortas como "i", "like", "it", "yeah"; un 22% repetidas), +2,4 a palabras corregidas y -2,6 a palabras que el modelo base acertaba y este falla.

## Capacidades

- Transcripcion de voz a texto en ingles, orientada a habla conversacional y acentos diversos.
- Salida en minusculas, sin puntuacion, con muletillas y repeticiones escritas literalmente (estilo de las transcripciones de EdAcc).
- Procesamiento de clips de hasta 30 segundos por ventana.
- Inferencia via `transformers` pipeline y via CTranslate2/faster-whisper para CPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo ingles.
- No tiene vision ni audio mas alla de la transcripcion.
- No dispone de modo thinking ni capacidades generativas fuera de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y videollamadas en ingles: el modelo esta entrenado sobre conversaciones casuales de videollamada, por lo que encaja en la transcripcion de actas internas con hablantes de acentos variados, siempre troceando el audio en ventanas de 30 s.
- Subtitulado de contenido informal en ingles: util para podcasts o videos con habla espontanea donde el Whisper base omite palabras cortas; requiere un post-proceso para anadir puntuacion y mayusculas.
- Preprocesado de datasets de voz: generar transcripciones iniciales para corpus conversacionales antes de una revision humana, aprovechando la reduccion de bucles respecto al modelo base.
- Despliegue en CPU con faster-whisper: la version CTranslate2 permite servir transcripcion en entornos sin GPU, adecuado para prototipos o procesamiento por lotes de bajo coste.
- Investigacion en ASR con acentos: punto de partida reproducible (codigo, splits y resultados por utterance publicados) para estudiar adaptacion de dominio y olvido catastrofico con replay.
- Analisis de calidad de llamadas: transcripcion de conversaciones de atencion al cliente en ingles para extraer metricas, con la advertencia de que la salida no lleva puntuacion ni distingue hablantes.
- Evaluacion comparativa de modelos ASR pequenos: referencia de 244M que supera a modelos mas grandes en EdAcc, util para calibrar trade-offs tamano/precision en ingles conversacional.

## Benchmarks y rendimiento

WER agrupado sobre el split de test de EdAcc (28 hablantes y 14 conversaciones no vistas, 3.351 clips de hasta 30 s, 3.341 con palabras puntuables), decodificacion greedy.

| Modelo | Parametros | EdAcc test WER | LibriSpeech test-clean / test-other |
|---|---|---|---|
| Whisper-small, zero-shot | 244M | 22,5% | 3,3% / 7,5% |
| Whisper-medium, zero-shot | 769M | 19,8% | no disponible |
| Whisper-large-v3-turbo, zero-shot | 809M | 18,2% | no disponible |
| **Whisper-small-edacc** | 244M | **16,3%** (media 16,8%, desv. 0,4 en 3 semillas) | 3,9% / 8,6% |

- Frente a Whisper-small zero-shot: -6,2 puntos, intervalo del 95% [-8,7, -4,2] (bootstrap emparejado por hablantes).
- Frente a large-v3-turbo: -1,9 puntos, IC95% [-3,2, -0,7], pero el autor senala que la ventaja es de estilo de transcripcion. Re-puntuando sin repeticiones en ambos lados, empatan (0,0 puntos, [-0,8, +0,9]); eliminando tambien repeticiones y palabras discursivas ("yeah", "like", "so"...), turbo es 1,1 puntos mejor ([+0,5, +1,9]). En validacion estaban empatados incluso con la puntuacion oficial (23,9% vs 23,8%).
- Whisper-small zero-shot entro en bucle en 6 clips cortos (menos de 8 s), lo que anade unos 1,8 puntos a su WER. Excluyendo los 14 clips donde algun modelo entro en bucle: small zero-shot 20,7%, turbo 17,9%, este modelo 16,2%.
- En habla leida el modelo empeora: LibriSpeech WER aproximadamente un 16% relativo peor que Whisper-small zero-shot (sin replay habria sido un 40% peor).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,5-1 GB para los pesos (244M parametros), mas overhead de activaciones y del pipeline; cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: RTX 3060/4060 y superiores para tiempo real; A100/H100 no son necesarias por el tamano del modelo, aunque permiten mayor throughput por lotes.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas y en iGPU con suficiente memoria compartida.
- Despliegue: `transformers` pipeline, CTranslate2/faster-whisper (version ct2), y en general cualquier runtime compatible con Whisper-small (por ejemplo llama.cpp no aplica; vLLM y TGI no estan documentados para este checkpoint en la informacion disponible).
- Latencia y throughput: no disponibles en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | EdAcc test WER | LibriSpeech test-clean | Licencia |
|---|---|---|---|---|---|
| Whisper-small-edacc | 244M | 30 s | 16,3% | 3,9% | CC BY-SA 4.0 |
| Whisper-small (zero-shot) | 244M | 30 s | 22,5% | 3,3% | Apache 2.0 |
| Whisper-medium (zero-shot) | 769M | 30 s | 19,8% | no disponible | Apache 2.0 |
| Whisper-large-v3-turbo (zero-shot) | 809M | 30 s | 18,2% | no disponible | Apache 2.0 |

La comparativa se limita a la familia Whisper porque la model card no reporta comparaciones con otros sistemas ASR. La licencia CC BY-SA 4.0 es mas restrictiva que la Apache 2.0 del modelo base y obliga a compartir bajo la misma licencia las obras derivadas.

## Limitaciones y advertencias

- La salida es en minusculas y sin puntuacion; las muletillas y repeticiones se escriben literalmente, lo que exige post-proceso para muchos usos en produccion.
- Solo evaluado en clips de hasta 30 s; las grabaciones largas no se evaluaron y deben trocearse.
- Peor que el modelo base en habla leida: LibriSpeech WER aproximadamente un 16% relativo peor.
- Los grupos por acento tienen solo 2-6 hablantes de test, por lo que las cifras por acento son anecdoticas.
- No comparable directamente con los WER del paper de EdAcc: se descartaron segmentos de mas de 30 s y la normalizacion de texto difiere.
- Entrenado y evaluado solo con conversaciones casuales de videollamada en ingles; otros dominios, condiciones de ruido e idiomas no se probaron.
- Aun aparecen bucles raros (1 de 3.351 clips de test); un clip sintetico con una frase repetida devolvio repeticiones eliminadas o anadidas.
- Riesgo de alusiones y errores en palabras cotidianas mal oidas en habla rapida o con acento (60% de los errores en los 50 peores clips) y en nombres, titulos y palabras raras (21%).
- No apto para usos de alto riesgo (medico, legal, seguridad o identificacion de personas) ni como subtitulos sin revision.
- Licencia CC BY-SA 4.0: el uso comercial es posible pero obliga a atribucion y a compartir bajo la misma licencia las obras derivadas; ademas hereda las condiciones de EdAcc.
- No se redistribuye audio de los datasets; los sesgos de los corpus de origen (hablantes, tematicas, condiciones de grabacion) se trasladan al modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mddalwai/whisper-small-edacc
- Version CTranslate2: https://huggingface.co/mddalwai/whisper-small-edacc-ct2
- Codigo, splits y resultados: https://github.com/mohammaddalwai/speech-ft
- Dataset EdAcc: https://huggingface.co/datasets/edinburghcstr/edacc
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de EdAcc (Sanabria et al., ICASSP 2023): no disponible como enlace en la informacion proporcionada
- Paper de LibriSpeech (Panayotov et al., ICASSP 2015): no disponible como enlace en la informacion proporcionada
