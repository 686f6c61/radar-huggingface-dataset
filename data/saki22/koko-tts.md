# saki22/koko-tts

## Resumen

Koko-TTS es un modelo de sintesis de voz (text-to-speech) basado en flow-matching, desarrollado por el usuario saki22 y publicado en Hugging Face bajo licencia Apache-2.0. Con 24.593.097 parametros (aproximadamente 24,6 millones), se posiciona como un modelo ultraligero orientado a sintesis en tiempo real con un coste computacional muy bajo. La arquitectura es una UNet de estilo Matcha condicionada por representaciones de texto con RoPE (rotary position embeddings), y la generacion de audio final se delega en el vocoder Vocos Mel a 24 kHz.

El modelo esta entrenado exclusivamente en ingles sobre el dataset `jano3/libritts-r-128spk-vocos-mel`, compuesto por 23.165 muestras, y ofrece 128 identidades de voz (spk_id de 0 a 127) seleccionables en inferencia. La generacion controla temperatura, fuerza de classifier-free guidance (cfg_strength) y numero de pasos de integracion (n_steps), lo que permite ajustar el equilibrio entre calidad y velocidad.

Su relevancia actual radica en que demuestra que es posible obtener sintesis de voz inteligible y de calidad razonable con un modelo dos ordenes de magnitud mas pequeno que alternativas como XTTS-v2, ejecutable en CPU o en cualquier GPU de consumo. No obstante, al tratarse de un repositorio con 0 descargas y 0 likes, 0.2 GB de tamano y codigo personalizado (`trust_remote_code=True`), debe considerarse un modelo emergente y no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de estilo Matcha (flow-matching) con condicionamiento de texto mediante RoPE |
| Parametros totales | 24.593.097 (aprox. 24,6 M) |
| Longitud de contexto | no disponible (modelo TTS; procesa secuencias de texto de longitud variable) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas; pesos en safetensors) |
| Idiomas soportados | Ingles (en). El tokenizer integrado cubre caracteres latinos, cirilicos, arabes e IPA, lo que permite adaptacion a otros idiomas mediante fine-tuning |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con codigo personalizado (`custom_code`, requiere `trust_remote_code=True`) |
| Frecuencia de muestreo | 24.000 Hz |
| Vocoder | Vocos Mel 24 kHz (`charactr/vocos-mel-24khz`) |
| Voces disponibles | 128 identificadores de hablante (0 a 127) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

Koko-TTS sigue el paradigma de flow-matching aplicado a sintesis de voz, en la linea de los modelos Matcha-TTS: se aprende un campo de velocidad que transforma ruido gaussiano en una representacion mel, integrado mediante un solver ODE con un numero configurable de pasos (`n_steps=16` en el ejemplo oficial). El backbone es una UNet y la entrada de texto se codifica en representaciones condicionadas por RoPE. Sobre esta representacion mel actua el vocoder Vocos Mel de 24 kHz, que la convierte en forma de onda. El modelo incorpora un predictor de duraciones, ya que la perdida de entrenamiento se descompone en `flow_loss` y `duration_loss`, y el bucle de entrenamiento documentado recibe `durations`, `mel_target`, `mel_lengths` y `spk_id` como entradas.

El entrenamiento se realizo sobre el dataset `jano3/libritts-r-128spk-vocos-mel` (23.165 filas), derivado de LibriTTS-R y preprocesado con mels de Vocos, con 128 hablantes. No se documenta el numero total de tokens ni de horas de audio, y tampoco se especifica si hubo fases de RLHF o DPO (poco habituales en TTS; no se mencionan). La model card incluye una guia de fine-tuning detallada que cubre la extraccion de mel con Vocos, el alineamiento de duraciones, la carga de pesos en modo entrenamiento y un bucle de optimizacion con AdamW (lr 1e-5, weight decay 1e-2, recorte de gradiente a norma 1.0). No se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida a 24 kHz.
- Seleccion de voz entre 128 hablantes mediante el parametro `spk_id` (0 a 127).
- Control de generacion en inferencia: `temperature`, `cfg_strength` y `n_steps`.
- Inferencia en GPU y CPU (el codigo de ejemplo selecciona `cuda` si esta disponible y cae a `cpu` en caso contrario).
- Fine-tuning sobre nuevos datasets, con soporte de entrenamiento end-to-end documentado.
- Adaptacion multilingue potencial: el tokenizer nativo cubre alfabetos latino, cirilico, arabe y simbolos IPA, aunque el modelo base solo fue entrenado en ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Locucion de articulos y blogs: dado su tamano de 24,6 M de parametros y su velocidad de inferencia, puede generar versiones en audio de textos largos fragmento a fragmento en un pipeline por lotes, con una de las 128 voces fijas para mantener consistencia de narrador.
- Asistentes de voz embebidos: al ejecutarse en CPU o en GPUs de gama baja, es adecuado para dispositivos con recursos limitados que necesiten respuestas habladas en ingles sin depender de la nube.
- Prototipado rapido de interfaces conversacionales: permite iterar sobre la experiencia de usuario de un asistente de voz sin incurrir en costes de API de TTS comerciales, ajustando `temperature` y `cfg_strength` para variar prosodia y estabilidad.
- Generacion de audiolibros con multiples personajes: los 128 identificadores de hablante permiten asignar voces distintas a narrador y personajes dentro de una misma produccion.
- Investigacion en sintesis de voz: su arquitectura flow-matching compacta y su guia de fine-tuning lo convierten en una base accesible para experimentar con adaptacion a nuevos idiomas o dominios con recursos de computo modestos.
- Pruebas de regresion y validacion de pipelines de audio: su bajo coste permite generar grandes lotes de muestras sinteticas para comprobar integraciones de vocoder, remuestreo o postprocesado sin consumir presupuesto significativo.
- Accesibilidad: conversion de contenido textual en ingles a voz para lectores de pantalla o aplicaciones de apoyo a personas con discapacidad visual.
- Generacion de datos sinteticos de voz: util para aumentar datasets de audio con 128 voces distintas en tareas de reconocimiento de hablante o entrenamiento de sistemas de deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MOS, WER, MCD ni comparaciones cuantitativas con otros sistemas TTS, y unicamente aporta muestras de audio de ejemplo para los hablantes 0, 46 y 123.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del modelo ocupan aproximadamente 98 MB en fp32 y 49 MB en fp16/bf16; sumando el vocoder Vocos Mel 24 kHz y los buffers intermedios, el consumo total es inferior a 1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo no requiere A100, H100 ni tarjetas de gama alta. Una RTX 3060, RTX 4090 o incluso una GPU integrada reciente pueden ejecutarlo sin problemas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU, como refleja el propio codigo de ejemplo del autor.
- Opciones de despliegue: PyTorch con `transformers` (`AutoModel.from_pretrained(..., trust_remote_code=True)`) y la libreria `vocos`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables directamente a este tipo de modelo con codigo personalizado. Tampoco se documenta exportacion a ONNX.
- Latencia y throughput estimados: no disponible. No se publican mediciones de RTF (real-time factor) ni de tiempo por frase. El unico parametro relacionado es `n_steps=16` en la configuracion de ejemplo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Koko-TTS que permitan una comparacion cuantitativa. La siguiente tabla recoge unicamente datos estructurales y de licencia; los valores de los modelos de referencia proceden de conocimiento publico general y no de la informacion proporcionada en esta ficha, por lo que deben verificarse antes de usarse en una decision.

| Modelo | Parametros | Licencia | Idiomas | Formato | Notas |
|---|---|---|---|---|---|
| Koko-TTS (saki22) | 24,6 M | Apache-2.0 | Ingles (entrenamiento) | safetensors + codigo personalizado | Vocoder Vocos; 128 voces; 24 kHz |
| Kokoro-82M | aprox. 82 M | Apache-2.0 | Multiples idiomas | safetensors / ONNX | Referencia publica en la misma categoria de TTS ligero |
| XTTS-v2 (Coqui) | aprox. 467 M | CPML (no comercial) | Multiples idiomas | safetensors | Clonacion de voz; licencia restrictiva |
| Piper | Variable segun voz | MIT | Multiples idiomas | ONNX | Orientado a dispositivos embebidos |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena sobre LibriTTS-R, un corpus derivado de audiolibros en ingles con una distribucion de hablantes limitada; las 128 voces heredan ese sesgo de acento, edad y estilo de locucion.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos, ruido, silencios anomalos o pronunciaciones incorrectas en palabras poco frecuentes, nombres propios y siglas.
- Limitacion idiomatica: el modelo base solo esta entrenado en ingles. Usar el tokenizer con otros alfabetos no implica que el modelo pronuncie correctamente otros idiomas sin un fine-tuning previo.
- Limitaciones de contexto: no se documenta una longitud maxima de texto por llamada; en la practica los modelos TTS de este tipo requieren fragmentar entradas largas, lo que puede introducir discontinuidades de prosodia entre fragmentos.
- Codigo personalizado: el repositorio usa `custom_code` y exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor no auditado. Es un riesgo de seguridad relevante en entornos de produccion.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente ni benchmarks publicados.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya al autor. Conviene revisar tambien la licencia del vocoder Vocos y la del dataset de entrenamiento, que son componentes separados.
- Fecha de publicacion: la model card indica el ano 2026 y el repositorio fue creado el 2026-09-20, lo que dificulta contrastar su historial de mantenimiento.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/saki22/koko-tts
- Dataset de entrenamiento: https://huggingface.co/datasets/jano3/libritts-r-128spk-vocos-mel
- Vocoder Vocos Mel 24 kHz: https://huggingface.co/charactr/vocos-mel-24khz
- Muestra de audio del hablante 0: https://raw.githubusercontent.com/laki35/sempls/main/spkr0.wav
- Muestra de audio del hablante 46: https://raw.githubusercontent.com/laki35/sempls/main/spkr46.wav
- Muestra de audio del hablante 123: https://raw.githubusercontent.com/laki35/sempls/main/spkr123.wav
- Busqueda web: no se han encontrado resultados relevantes sobre el modelo; los resultados devueltos correspondian a servicios de correo no relacionados con esta ficha.
