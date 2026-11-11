# dakshp2005/whisper-medium-indic

## Resumen

`dakshp2005/whisper-medium-indic` es un ajuste fino del modelo `openai/whisper-medium` de OpenAI, orientado a reconocimiento automatico del habla (ASR) para hindi. Lo publica el usuario dakshp2005 en Hugging Face y se distribuye con licencia Apache 2.0. El modelo parte de la arquitectura encoder-decoder de Whisper, con aproximadamente 764 millones de parametros, y conserva la ventana de procesamiento de 30 segundos por pasada del modelo original.

El modelo resuelve la transcripcion de voz a texto en hindi, manteniendo el alfabeto devanagari de salida, y no esta pensado para traduccion. Su relevancia es limitada: se trata de un ajuste fino de caracter experimental, sin descargas ni validacion publica en el momento de la consulta, y con la model card incompleta (marcadores TODO sin rellenar en idiomas, dataset, hiperparametros y evaluacion).

La informacion disponible no permite confirmar el volumen ni la composicion de los datos de entrenamiento, los resultados de WER ni los hiperparametros empleados. Cualquier evaluacion en produccion deberia hacerse de forma independiente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder (`WhisperForConditionalGeneration`) |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por pasada (ventana fija de Whisper); audio mas largo requiere chunking |
| Tipos de cuantizacion | float32 en safetensors original; compatible con conversion a float16 e int8 via CTranslate2/faster-whisper |
| Idiomas soportados | hindi (`hi`) segun metadatos; la model card deja el campo de idiomas como TODO |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `openai/whisper-medium`, un transformer encoder-decoder con atencion completa, disenado para ASR multitarea. La entrada es audio mono a 16 kHz en formato float, con un maximo de 30 segundos por forward pass; la salida es texto en el alfabeto correspondiente al idioma, en este caso devanagari para hindi. La tarea configurada es `transcribe`, no `translate`.

Los detalles de entrenamiento no estan disponibles: la model card indica como TODO el dataset, el numero de horas de audio, el hardware (se menciona Kaggle como plataforma de ejecucion), la tasa de aprendizaje, el tamano de batch, los pasos o epocas, el warmup, la precision y el optimizador. Tampoco se especifica si hubo normalizacion de texto, si se filtraron clips de mas de 30 segundos ni si se aplico algun esquema de aumento de datos. El framework declarado es Hugging Face Transformers con `Seq2SeqTrainer`, aunque la version no se indica.

## Capacidades

- Transcripcion de voz a texto en hindi, manteniendo el alfabeto devanagari.
- Procesamiento de audio de hasta 30 segundos por pasada; audio mas largo requiere segmentacion con `chunk_length_s`.
- Inferencia por lotes y en streaming mediante chunking y deteccion de actividad de voz (VAD).
- Compatibilidad con `transformers` (`pipeline`, `AutoModelForSpeechSeq2Seq`) y con `faster-whisper`/CTranslate2 para CPU y GPU.
- No soporta traduccion: la tarea debe fijarse explicitamente como `transcribe`.
- No soporta identificacion de hablante ni diarizacion.
- No hay evidencia de soporte multilingue mas alla del hindi; el resto de idiomas de Whisper no han sido validados tras el ajuste.
- No dispone de tool calling, function calling ni capacidades de agente, al ser un modelo puramente ASR.

## Casos de uso

- Transcripcion de notas de voz y grabaciones en hindi: el modelo convierte audio de hasta 30 segundos por fragmento en texto devanagari, adecuado para apps de mensajeria que segmentan el audio previamente.
- Subtitulado de reuniones y clases en hindi: con `chunk_length_s=30` y VAD se pueden procesar grabaciones largas y generar subtitulos por segmentos con marcas temporales.
- Prototipado de asistentes de voz en hindi: al cargarse con `pipeline` de Transformers y admitir cuantizacion int8 via faster-whisper, sirve para validar flujos de STT antes de invertir en modelos mayores.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: la conversion a CTranslate2 con `compute_type="int8"` permite ejecutar en CPU con latencia aceptable para transcripcion diferida.
- Investigacion y experimentacion academica: al ser un ajuste fino abierto con licencia Apache 2.0, es util como linea base para comparar estrategias de ajuste de Whisper en lenguas indicas.
- Integracion en pipelines de accesibilidad: transcripcion de contenido audiovisual en hindi para generar subtitulos automaticos, siempre con revision humana por el riesgo de alucinaciones.
- Preprocesamiento de datos para otros modelos: conversion de corpus de audio hindi a texto para tareas posteriores de NLP, con filtrado por `no_speech_prob` para descartar segmentos dudosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla de evaluacion de la model card contiene unicamente marcadores TODO tanto para el modelo base como para el ajuste fino, sin valores de WER ni descripcion del conjunto de test o del protocolo de normalizacion.

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 3 GB solo para pesos, mas memoria de activaciones y buffers de audio; en la practica, entre 4 y 6 GB para inferencia por lotes pequenos.
- VRAM estimada en float16: aproximadamente 1,5-2 GB para pesos, con margen adicional para activaciones.
- VRAM estimada en int8 via CTranslate2: alrededor de 1 GB, apto para CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para float16 (RTX 3050, RTX 4060, T4); A100 o H100 no son necesarias para este tamano y solo aportarian throughput en lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM en float16, y en CPU con cuantizacion int8.
- Opciones de despliegue: `transformers` con `pipeline`, `faster-whisper` con CTranslate2 (recomendado para CPU y tiempo real), y conversion a otros runtimes compatibles con Whisper. No se documenta soporte especifico para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La model card no aporta mediciones; en funcion de la experiencia general con Whisper medium, se espera una latencia mayor que en modelos tiny/base, pero no hay datos publicados para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dakshp2005/whisper-medium-indic | 763.857.920 | 30 s por pasada | hindi | Apache 2.0 | Hugging Face, 0 descargas |
| openai/whisper-medium | 769 M (aproximado, segun model card del autor) | 30 s por pasada | multilingue (99 idiomas) | Apache 2.0 | Hugging Face, ampliamente usado |
| openai/whisper-small | no disponible en la informacion proporcionada | 30 s por pasada | multilingue | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | no disponible en la informacion proporcionada | 30 s por pasada | multilingue | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento (WER) para ninguno de los modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ventana fija de 30 segundos: el audio mas largo debe segmentarse; un chunking incorrecto puede cortar palabras y degradar la transcripcion.
- No es streaming nativo: el tiempo real requiere buffer, VAD y retranscripcion del buffer actual.
- Alucinaciones: Whisper puede generar texto sobre silencios, musica o ruido, o repetir frases; conviene filtrar por `no_speech_prob` y aplicar VAD.
- Audio telefonico a 8 kHz: la model card deja como TODO si el entrenamiento incluyo audio de calidad telefonica; si no fue asi, se espera una precision menor en llamadas.
- Code-mixing hindi-ingles: no se documenta como se maneja; se desconoce si el ingles se transcribe en alfabeto latino o transliterado.
- Sesgos: no se han documentado sesgos especificos, pero al ser un ajuste fino sin evaluacion publica no puede descartarse un sesgo hacia el dominio y los acentos presentes en los datos de entrenamiento, que tampoco se detallan.
- Cobertura limitada a hindi: no hay evidencia de buen rendimiento en otras lenguas indicas pese al nombre "indic" del repositorio.
- Model card incompleta: los campos de dataset, hiperparametros y evaluacion siguen como TODO, lo que impide reproducir el entrenamiento o verificar su calidad.
- Uso de alto riesgo: no apto para registros medicos o legales sin revision humana, tal como indica el propio autor.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad de validar el modelo y de cumplir las obligaciones de atribucion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dakshp2005/whisper-medium-indic
- Modelo base: https://huggingface.co/openai/whisper-medium
- Notebook de ajuste fino en Kaggle: https://www.kaggle.com/code/dakshpatel2005/whisper-finetune
- Paper de Whisper (referencia arXiv 2212.04356): https://arxiv.org/abs/2212.04356
- Repositorio de faster-whisper: no disponible en la informacion proporcionada
- Repositorio de Transformers: no disponible en la informacion proporcionada
