# OpenFlowLM/Whisper-V3-Turbo-NPU2

## Resumen

Whisper-V3-Turbo-NPU2 es un repositorio publicado por OpenFlowLM en HuggingFace que contiene un ajuste o conversion del modelo openai/whisper-large-v3-turbo, segun declara el campo `base_model` del propio repo. Se trata, por tanto, de un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz, no de un modelo de lenguaje generativo de proposito general. El repo no incluye documentacion propia: su model card reproduce literalmente la tarjeta de openai/whisper-large-v3-turbo, incluidos los ejemplos de codigo que apuntan al `model_id` original de OpenAI, por lo que no queda documentado en que consiste exactamente la intervencion de OpenFlowLM ni el sufijo "NPU2".

El modelo subyacente, whisper-large-v3-turbo, es una version podada de Whisper large-v3 en la que el numero de capas del decodificador se reduce de 32 a 4, manteniendo el encoder intacto. Esto da un total de aproximadamente 809 millones de parametros frente a los ~1550 millones de large-v3, con una ganancia de velocidad de decodificacion muy significativa y una degradacion de calidad descrita por OpenAI como menor. Fue entrenado sobre mas de 5 millones de horas de audio etiquetado de forma debilmente supervisada, lo que le otorga una capacidad de generalizacion zero-shot notable en dominios y acentos no vistos.

Su relevancia practica radica en que es una de las variantes de ASR mas eficientes de la familia Whisper: cubre 99 idiomas, admite transcripcion y traduccion al ingles, marcas de tiempo a nivel de frase y de palabra, y se ejecuta comodamente en hardware de consumo. La contrapartida es que el repo de OpenFlowLM no aporta informacion verificable sobre el supuesto soporte NPU, el proceso de conversion ni las cuantizaciones aplicadas, y presenta cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para audio, derivado de Whisper large-v3 con decodificador podado |
| Parametros totales | ~809 M (heredados de openai/whisper-large-v3-turbo; no confirmado en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (1500 posiciones tras el downsampling); hasta 448 tokens por ventana de decodificacion |
| Tipos de cuantizacion | no disponible en la informacion del repo; el modelo base admite fp32, fp16 e int8 via CTranslate2 |
| Idiomas soportados | 99 idiomas declarados (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | MIT |
| Formato de pesos | no disponible; el repo ocupa 0,7 GB, compatible con `use_safetensors=True` segun los ejemplos de la model card |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder con preprocesado de audio en dos etapas. La entrada se muestrea a 16 kHz y se convierte en un espectrograma mel de 128 bandas sobre ventanas de 30 segundos, que se reduce a 1500 posiciones temporales antes de entrar en el encoder. El encoder mantiene las 32 capas de Whisper large-v3; el decodificador se poda de 32 a 4 capas, que es la unica diferencia estructural respecto a large-v3. OpenAI documenta este cambio en la discusion 2363 de su repositorio de GitHub, donde se explica que la poda se realizo eliminando capas del decodificador y ajustando despues el modelo resultante.

En cuanto a los datos de entrenamiento, la model card solo reproduce la afirmacion de OpenAI sobre Whisper: mas de 5 millones de horas de audio etiquetado con supervision debil, con capacidad de generalizacion zero-shot. No se especifica la composicion del dataset, el numero de tokens de texto, ni si hubo fases de RLHF o DPO (no aplica habitualmente en ASR). Tampoco se documenta en este repo el proceso concreto de OpenFlowLM: no hay informacion sobre el ajuste fino, la conversion a formato NPU ni el procedimiento de cuantizacion asociado al sufijo "NPU2". Las heuristicas de decodificacion disponibles son las estandar de Whisper: fallback por temperatura, condicionamiento en tokens previos, umbral de ratio de compresion zlib, umbral de log-probabilidad y umbral de ausencia de habla.

## Capacidades

- Transcripcion de voz a texto en 99 idiomas, con deteccion automatica del idioma de origen (o forzado mediante el parametro `language`).
- Traduccion de voz a texto en ingles para audio en cualquiera de los idiomas soportados, mediante `task="translate"`.
- Generacion de marcas de tiempo a nivel de frase (`return_timestamps=True`) y a nivel de palabra (`return_timestamps="word"`), aptas para subtitulado.
- Procesamiento de audio de longitud arbitraria mediante segmentacion en ventanas de 30 segundos, con soporte de batching (`batch_size`) para transcribir varios ficheros en paralelo.
- Robustez zero-shot ante dominios, acentos y condiciones acusticas no vistas, segun las afirmaciones de OpenAI sobre el modelo base.
- Decodificacion con heuristicas anti-alucinacion configurables: fallback de temperatura, umbrales de compresion y de log-probabilidad, y deteccion de ausencia de voz.
- Integracion con el ecosistema HuggingFace Transformers mediante `AutoModelForSpeechSeq2Seq`, `AutoProcessor` y la pipeline `automatic-speech-recognition`.
- No dispone de tool calling, function calling, modo agente ni razonamiento multi-paso: es un modelo puramente seq2seq de audio a texto.
- No se documenta soporte de diarizacion de hablantes, vision, audio generation ni streaming en tiempo real.

## Casos de uso

- Subtitulado automatico de video: transcribir la pista de audio y solicitar marcas de tiempo por palabra o por frase para generar ficheros SRT o VTT alineados con el habla, cubriendo contenido multilingue sin necesidad de un modelo distinto por idioma.
- Actas y notas de reunion: procesar la grabacion completa troceada en ventanas de 30 segundos y reconstruir la transcripcion, aprovechando la velocidad de decodificacion del decodificador de 4 capas para reducir el coste por hora de audio.
- Atencion al cliente y analitica de llamadas: transcribir grabaciones de call center y alimentar pipelines de busqueda, clasificacion o resumen posteriores; el modelo actua solo como capa de ASR y la logica de negocio se implementa aguas abajo.
- Traduccion de contenido audiovisual: usar `task="translate"` para obtener un texto en ingles a partir de audio en cualquier otro idioma, como paso previo a un pipeline de traduccion a un tercer idioma.
- Indexacion y busqueda semantica de archivos de audio: transcribir podcasts, entrevistas o clases magistrales para generar embeddings de texto y habilitar busqueda por contenido sobre el corpus transcrito.
- Accesibilidad para personas con discapacidad auditiva: generar transcripciones de avisos, clases o eventos en directo con latencia reducida, apoyandose en la decodificacion rapida del modelo turbo.
- Preprocesado de datasets de voz: convertir grandes volumenes de audio sin etiquetar en texto para tareas de etiquetado debil, mineria de datos o construccion de corpus paralelos multilingues.
- Despliegue en dispositivos con acelerador NPU: el sufijo "NPU2" sugiere un objetivo de ejecucion en aceleradores neuronales, pero al no existir documentacion asociada no es posible confirmar la compatibilidad ni el rendimiento en ese escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de OpenFlowLM no incluye tabla de resultados, y la busqueda web realizada no ha devuelto ninguna fuente tecnica relevante sobre este modelo (unicamente resultados sin relacion con el ambito del machine learning). La model card tampoco reproduce las cifras de WER de la tarjeta original de openai/whisper-large-v3-turbo.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,6 GB de pesos, con un pico de uso en torno a 2-3 GB incluyendo activaciones y buffers de decodificacion.
- VRAM estimada en int8: aproximadamente 0,8-1 GB de pesos, con pico en torno a 1,5-2 GB.
- GPU de datacenter: A100, H100, L40S o A10G, con margen sobrado para batching de decodificacion multiple.
- GPU de consumo: cabe en cualquier GPU con 4 GB o mas de VRAM, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4070 y RTX 4090; tambien en iGPU con memoria unificada suficiente.
- CPU: viable sin GPU gracias al reducido tamano, especialmente con backend CTranslate2 o whisper.cpp, aunque con throughput mucho menor.
- Opciones de despliegue: pipeline de Transformers (`automatic-speech-recognition`), CTranslate2/faster-whisper para inferencia optimizada, whisper.cpp para ejecucion local en CPU o Apple Silicon, y vLLM para servir en GPU (soporte de Whisper sujeto a version). TGI no cubre tareas de ASR.
- Latencia y throughput: no disponibles para este repositorio concreto. Como referencia cualitativa, la poda del decodificador de 32 a 4 capas reduce el coste de decodificacion de forma sustancial frente a large-v3, y el modelo base esta disenado para ser varias veces mas rapido.
- Almacenamiento: el repositorio ocupa 0,7 GB, inferior al peso tipico en fp16 del modelo base completo, lo que sugiere algun tipo de conversion o cuantizacion no documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenFlowLM/Whisper-V3-Turbo-NPU2 | ~809 M (heredados) | Ventanas de 30 s, 448 tokens/ventana | 99 | MIT | HF, 0 descargas |
| openai/whisper-large-v3-turbo | ~809 M | Ventanas de 30 s, 448 tokens/ventana | 99 | MIT | HF, ampliamente usado |
| openai/whisper-large-v3 | ~1550 M | Ventanas de 30 s, 448 tokens/ventana | 99 | MIT | HF, referencia de calidad |
| distil-whisper/distil-large-v3 | ~756 M | Ventanas de 30 s | Solo ingles | MIT | HF, optimizado solo para ingles |

Los datos de parametros y contexto corresponden a las especificaciones publicas de cada modelo base. No se dispone de datos de rendimiento comparativo (WER) para el repositorio de OpenFlowLM, por lo que no es posible establecer si la conversion "NPU2" introduce degradacion adicional respecto a openai/whisper-large-v3-turbo.

## Limitaciones y advertencias

- Model card no informativa: el README es una copia de la tarjeta de openai/whisper-large-v3-turbo, con ejemplos que apuntan al `model_id` de OpenAI. No describe el ajuste, la conversion ni el formato de pesos de este repositorio.
- Procedencia opaca del sufijo "NPU2": no hay documentacion sobre que acelerador NPU se soporta, ni sobre el proceso de exportacion o cuantizacion. No debe asumirse compatibilidad con un NPU concreto sin verificacion previa.
- Sin adopcion ni validacion comunitaria: cero descargas y cero likes en el momento de la ficha, lo que implica ausencia de evidencia externa sobre su correcto funcionamiento.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos con silencio, ruido, musica o habla solapada. Se recomienda usar los umbrales `no_speech_threshold`, `logprob_threshold` y `compression_ratio_threshold` para mitigarlo.
- Limite de ventana de 30 segundos: el audio largo requiere segmentacion y ensamblado manual, con riesgo de cortes en fronteras de ventana y de perdida de contexto entre segmentos.
- Sin diarizacion: el modelo no distingue hablantes; para transcripciones con multiples interlocutores hace falta un sistema externo.
- Cobertura desequilibrada entre idiomas: aunque se declaran 99 idiomas, la calidad es notablemente inferior en idiomas con pocos recursos (por ejemplo, la mayoria de las lenguas africanas o del sudeste asiatico incluidas en la lista) frente a ingles, espanol, frances o aleman.
- Licencia: el repo declara MIT, coherente con la licencia de los pesos de Whisper de OpenAI, lo que en principio permite uso comercial. Aun asi, al no estar documentada la cadena de transformacion aplicada por OpenFlowLM, conviene revisar el repositorio antes de integrarlo en produccion.
- Sin garantias de mantenimiento: el repositorio se creo y actualizo en la misma fecha (2 de octubre de 2026) y no muestra actividad posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenFlowLM/Whisper-V3-Turbo-NPU2
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Whisper large-v3 (modelo del que se poda el decodificador): https://huggingface.co/openai/whisper-large-v3
- Paper de Whisper (Radford et al., 2022): https://huggingface.co/papers/2212.04356 / https://arxiv.org/abs/2212.04356
- Discusion sobre la poda del decodificador de large-v3-turbo: https://github.com/openai/whisper/discussions/2363
- Repositorio de referencia de Whisper: https://github.com/openai/whisper
- Busqueda web realizada: no se han encontrado enlaces adicionales relevantes sobre este modelo; los resultados devueltos no guardan relacion con el ambito del machine learning y se han descartado.
