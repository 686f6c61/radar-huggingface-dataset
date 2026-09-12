# Nampfiev1995/ctc-omniasr-char52-vi-en

## Resumen

El modelo `Nampfiev1995/ctc-omniasr-char52-vi-en` es un checkpoint entrenable de reconocimiento automatico del habla (ASR) construido sobre un encoder OmniASR de 300M de parametros, al que se le acopla una cabeza CTC (Connectionist Temporal Classification). Lo publica el usuario Nampfiev1995 en HuggingFace y esta orientado a la transcripcion de audio en vietnamita e ingles, segun se deduce del identificador del repositorio y del vocabulario incluido. El checkpoint contiene 340.801.204 parametros reales en formato safetensors, un total ligeramente superior a los 300M del encoder base porque incluye la cabeza de clasificacion CTC y las matrices asociadas al vocabulario.

La relevancia de esta publicacion es practica mas que de liderazgo en rankings: se trata de un checkpoint de investigacion con licencia no declarada, cero descargas y cero likes en el momento de la consulta, pensado para cargarse desde el repositorio `Speech-LLMs-CTC` mediante una clase `AudioCTCModel`. Su interes tecnico esta en el diseno del objetivo: un conjunto de 52 etiquetas CTC que combina caracteres base latinos y vietnamitas con cinco marcadores de tono y el limite de palabra `▁`, lo que permite modelar los tonos del vietnamita a nivel de caracter sin necesidad de un vocabulario de subpalabras extenso.

No hay pipeline declarado, ni idiomas oficiales, ni licencia en los metadatos de HuggingFace. El autor documenta la estructura del repositorio (`config.yaml`, `model.safetensors`, `vocab.json`, `tokenizer_config.json`) y la referencia al encoder base `giangndm/omniASR-LLM-300M-encoder`, que constituye el unico punto de anclaje verificable sobre la arquitectura subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre encoder OmniASR-LLM-300M (encoder de tipo LLM con cabeza CTC) |
| Parametros totales | 340.801.204 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de ASR; no se declara ventana de audio) |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors; no hay GGUF) |
| Idiomas soportados | no disponible en metadatos; el vocabulario y el nombre del modelo apuntan a vietnamita e ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.yaml` |

## Arquitectura y entrenamiento

El modelo sigue un esquema clasico de ASR hibrido con encoder neuronal y decodificacion CTC no autorregresiva. El encoder de referencia es `giangndm/omniASR-LLM-300M-encoder`, un backbone de 300M de parametros de tipo LLM reutilizado como extractor de representaciones acusticas. Sobre el se anade una cabeza lineal CTC, cuyos parametros explican que el total del checkpoint (340,8M) supere los 300M del encoder. Al emplear CTC, el modelo no necesita un decodificador autoregresivo: predice directamente, para cada frame, una de las 52 etiquetas del vocabulario, incluyendo la etiqueta `[BLANK]` que permite alinear sin etiquetas temporales explicitas.

El vocabulario CTC esta formado por 52 etiquetas: `[BLANK]`, `[PAD]`, `[UNK]`, el limite de palabra `▁`, los digitos `0`-`9`, caracteres base latinos y vietnamitas, y cinco marcadores de tono del vietnamita. Este diseno es la innovacion destacable del checkpoint: al representar los tonos como etiquetas independientes sobre caracteres base, se evita depender de una tokenizacion BPE y se mantiene un vocabulario minimo y facil de auditar. El nombre interno del checkpoint de entrenamiento (`...gigaspeech_xs_full_finetune_continue_epoch1_plus2`) sugiere un ajuste fino sobre GigaSpeech en configuracion "extra small", con continuacion del entrenamiento durante epocas adicionales, aunque el autor no documenta ni el numero total de tokens, ni la composicion exacta del dataset, ni si se aplico RLHF o DPO (tecnicas ademas poco habituales en ASR con CTC).

## Capacidades

- Reconocimiento automatico del habla en vietnamita e ingles con salida a nivel de caracter, segun el vocabulario publicado (no confirmado oficialmente en la model card).
- Modelado explicito de los tonos del vietnamita mediante cinco marcadores tonales en el conjunto de etiquetas CTC.
- Prediccion de limites de palabra a traves de la etiqueta `▁`.
- Reconocimiento de digitos de forma aislada, al estar incluidos como etiquetas `0`-`9`.
- Decodificacion no autorregresiva mediante CTC, lo que reduce la latencia frente a esquemas encoder-decoder.
- Checkpoint entrenable: el repositorio se describe como "trainable checkpoint", por lo que admite continuar el ajuste fino.
- Integracion con la libreria del autor a traves de la clase `AudioCTCModel` (metodo `from_pretrained`).
- No se declara soporte de tool calling, function calling, capacidades de agente, vision, audio generativo ni modo de razonamiento extendido. No disponible.

## Casos de uso

- Transcripcion de audio en vietnamita para servicios de subtitulado: el vocabulario basado en caracteres con marcadores tonales evita errores de segmentacion tipicos de los tokenizadores BPE en una lengua tonal, y permite generar subtitulos con transcripcion literal.
- Reconocimiento de voz bilingue vietnamita-ingles en contact centers: el conjunto de 52 etiquetas cubre tanto caracteres latinos como vietnamitas, lo que resulta util en conversaciones donde el hablante alterna idiomas.
- Investigacion en ASR con CTC: al ser un checkpoint entrenable, sirve como punto de partida para experimentos de ajuste fino con vocabularios reducidos o para comparar estrategias de tokenizacion a nivel de caracter frente a subpalabras.
- Reproduccion de experimentos sobre GigaSpeech: al provenir de un ajuste fino sobre este corpus, es adecuado para replicar o extender configuraciones de entrenamiento en regimen "extra small".
- Extraccion de transcripciones para analitica de audio a gran escala: la decodificacion CTC es paralelizable y no requiere muestreo autoregresivo, lo que simplifica el procesamiento por lotes.
- Prototipado de asistentes de voz con reconocimiento de digitos: la inclusion de `0`-`9` como etiquetas permite transcribir numeros de telefono, importes o referencias sin postprocesado adicional.
- Evaluacion de la calidad de la tokenizacion caracter+tomo: util para equipos que comparan esquemas de vocabulario en lenguas tonales del sudeste asiatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en FP32 (340,8M parametros x 4 bytes), unos 0,7 GB en FP16/BF16 y alrededor de 0,35 GB en INT8. Son estimaciones a partir del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre resulta suficiente para la inferencia en FP16, incluidas NVIDIA RTX 3060, RTX 4060, RTX 4090, asi como A100 y H100 para despliegues por lotes de alto volumen.
- Cabe en GPU de consumo: si, con margen amplio. Una GTX 1650 de 4 GB o una RTX 3050 de 8 GB deberian poder ejecutar el modelo en FP16 sin problemas.
- CPU: al ser un modelo de 340M de parametros, la inferencia en CPU es viable para audios cortos, aunque con mayor latencia.
- Opciones de despliegue: el autor solo documenta la carga mediante la clase `AudioCTCModel` del repositorio `Speech-LLMs-CTC`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y al tratarse de un modelo CTC multimodal (audio) esas herramientas no serian directamente aplicables sin envoltorio propio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ctc-omniasr-char52-vi-en | 340,8M | no disponible | no disponible | HuggingFace, 0 descargas | CTC con vocabulario de 52 etiquetas caracter+tomo |
| Whisper small | 244M | ventana de audio de 30 s | MIT | HuggingFace, ampliamente desplegado | Encoder-decoder autorregresivo; sin soporte nativo de vietnamita en su version original |
| Whisper medium | 769M | ventana de audio de 30 s | MIT | HuggingFace, ampliamente desplegado | Mayor coste computacional; licencia permisiva verificable |
| Wav2Vec 2.0 Base | 95M | no disponible | MIT (segun variante) | HuggingFace | Arquitectura CTC auto-supervisada, referencia habitual en investigacion |

Las cifras de parametros de los modelos de comparacion corresponden a sus versiones publicas conocidas. No hay datos de rendimiento comparativo disponibles para el modelo objeto de esta ficha, por lo que la comparacion se limita a tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no hay autorizacion clara para produccion.
- Idiomas no declarados oficialmente: la atribucion vietnamita-ingles proviene del nombre del repositorio y del vocabulario incluido, no de metadatos verificados.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion externa.
- Ausencia total de benchmarks: no se puede estimar la tasa de error de palabras (WER) ni comparar con alternativas consolidadas.
- Riesgo de alucinacion y sustituciones: los modelos CTC con vocabulario de caracteres pueden producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no vistos.
- Modelo dependiente de una libreria concreta: la carga requiere la clase `AudioCTCModel` del repositorio `Speech-LLMs-CTC`, lo que limita la portabilidad a otros runtimes de inferencia.
- Cobertura limitada del vocabulario: al ser un conjunto de 52 etiquetas centrado en caracteres latinos y vietnamitas, no cubre signos de puntuacion ni alfabetos de terceros idiomas.
- Procedencia del entrenamiento poco documentada: la referencia a GigaSpeech aparece en el nombre interno del checkpoint, pero el autor no detalla composicion del dataset, horas de audio ni condiciones de grabacion.
- Sin informacion sobre sesgos: no se documentan sesgos de acento, genero, edad ni dialecto.
- Fecha de creacion del repositorio inusualmente avanzada (2026-09-11) respecto a la fecha de consulta, un dato a verificar antes de citarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Nampfiev1995/ctc-omniasr-char52-vi-en
- Encoder base referenciado en `config.yaml`: https://huggingface.co/giangndm/omniASR-LLM-300M-encoder
- Repositorio `Speech-LLMs-CTC`: mencionado en la model card, sin URL publica disponible
- Paper o blog del modelo: no disponible
- Demo: no disponible
