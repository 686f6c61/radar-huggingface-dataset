# myflow-ai/moonshine-tiny-zh-gguf

## Resumen

moonshine-tiny-zh-gguf es una conversión al formato GGUF del modelo de reconocimiento automático de voz UsefulSensors/moonshine-tiny-zh, publicada por el usuario myflow-ai para su uso con el motor de inferencia transcribe.cpp. El modelo base pertenece a la familia Moonshine de Moonshine AI (antes Useful Sensors) y consiste en un transformer encoder-decoder de 27.092.736 parámetros (unos 27 M) ajustado específicamente para mandarín. Su objetivo es la transcripción de voz a texto en chino a partir de audio PCM mono a 16 kHz, con un coste computacional muy bajo que lo hace apto para dispositivos de borde.

La relevancia de esta conversión radica en el formato: al estar en GGUF y soportar cuantizaciones F32, F16 y Q8_0, el modelo puede ejecutarse sin dependencias de Python ni de PyTorch mediante transcribe.cpp, con binarios de entre 34 MB y 105 MB. Frente a alternativas multilingües mucho mayores, Moonshine tiny apuesta por un preprocesado sin STFT ni banco de filtros mel, lo que reduce latencia y huella de memoria.

Esta ficha describe la variante cuantizada, no el modelo original: los pesos, la licencia MIT y los idiomas soportados se heredan del modelo base, mientras que el autor de la conversión solo aporta el empaquetado GGUF, la validación numérica frente a la referencia de Transformers y las cifras de rendimiento en CPU y Metal. No se trata de un modelo de propósito general: no traduce, no detecta idioma ni genera marcas de tiempo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de tres capas (sin STFT ni banco de filtros mel) |
| Parametros totales | 27.092.736 (27 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el decodificador se configura con max_length=192 tokens en la generacion de referencia) |
| Tipos de cuantizacion | F32 (105 MB), F16 (57 MB), Q8_0 (34 MB) |
| Idiomas soportados | chino (zh) unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base se distribuye en safetensors para Transformers |
| Entrada de audio | PCM mono a 16 kHz |
| Tarea | Transcripcion de voz a texto (automatic-speech-recognition) |
| Traduccion | no soportada |
| Deteccion de idioma | no soportada |
| Marcas de tiempo | no soportadas |
| Modo streaming | no soportado |
| Modelo base | UsefulSensors/moonshine-tiny-zh (commit 3306270, fijado el 2026-05-12) |
| Libreria de inferencia | transcribe.cpp (validado en el commit 90bf720) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de la familia Moonshine tiny: un transformer encoder-decoder de 27 M de parámetros que consume audio en crudo a 16 kHz. La innovación principal respecto a los pipelines ASR clásicos es que la entrada no pasa por una transformada de Fourier de corto plazo ni por un banco de filtros mel: un stem de tres capas convolucionales Conv1d procesa directamente las muestras PCM, lo que elimina el coste del preprocesado y permite una ventana de entrada variable. La salida es únicamente texto transcrito, sin etiquetas de tiempo ni identificacion de hablante.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Se sabe que esta variante concreta es un ajuste fino del Moonshine tiny original sobre mandarín y que el autor de la conversion no publica una cifra de CER por idioma para el modelo base; como referencia, la misma model card indica que la ejecucion de la version Transformers en F32 sobre MPS obtiene un 13,72 % de CER en el mismo manifiesto, valor que las conversiones F32 y F16 igualan dentro del ruido del intervalo de confianza bootstrap y del que Q8_0 se desvía típicamente menos de 0,1 puntos porcentuales.

## Capacidades

- Transcripcion de voz a texto en mandarín a partir de audio PCM mono a 16 kHz.
- Decodificacion greedy con num_beams=1 y max_length=192 en la configuracion por defecto, coincidente con la generation_config del modelo original.
- Inferencia sin dependencias de Python en CPU (x86 y ARM) y en GPU mediante Metal y Vulkan, segun transcribe.cpp.
- Ejecucion con huella de memoria reducida: de 34 MB (Q8_0) a 105 MB (F32) de pesos.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso; es un modelo puramente secuencial de audio a texto.
- No soporta traduccion automatica, deteccion de idioma ni generacion de marcas de tiempo.
- No soporta transcripcion en streaming: requiere el audio completo como entrada.
- Multilingue: no; unicamente chino.

## Casos de uso

- Transcripcion embebida en dispositivos de borde: con 34 MB en Q8_0 y una huella de memoria minima, el modelo puede integrarse en Raspberry Pi, moviles o hardware con recursos limitados para dictado y notas de voz en mandarín sin conexion a la nube.
- Subtitulado offline de reuniones en chino: dado que no genera marcas de tiempo, se usaria como motor de transcripcion por segmentos previamente troceados, generando el texto que luego se alinea con herramientas externas.
- Post-proceso de llamadas de atencion al cliente: transcripcion por lotes de grabaciones en mandarín para alimentar analitica de calidad, busqueda de palabras clave y clasificacion posterior con un LLM.
- Asistentes de voz para aplicaciones dirigidas al mercado chino: integrado en una app movil como etapa ASR, con el texto enviado despues a un modelo de lenguaje para la respuesta.
- Archivado y busqueda de audio historico: conversion masiva de archivos de audio en mandarín a texto indexable, aprovechando el bajo coste por hora de audio que sugieren los RTF medidos.
- Investigacion linguistica y construccion de corpus: generacion de transcripciones automaticas sobre grabaciones de campo en mandarín para su revision y anotacion posterior.
- Pipelines de datos para entrenamiento: produccion de transcripciones preliminares a gran escala que despues se filtran o corrigen manualmente antes de usarse como datos supervisados.
- Validacion de calidad de audio: el CER en FLEURS zh permite usarlo como referencia ligera para comparar canalizaciones de captura o de compresion de audio.

## Benchmarks y rendimiento

Metricas publicadas en la model card para la conversion GGUF, medidas sobre el split de test de FLEURS-zh (945 enunciados) con la decodificacion por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192):

| Cuantizacion | Tamano | CER (FLEURS zh test) |
|---|---:|---:|
| F32 | 105 MB | 13,70 % |
| F16 | 57 MB | 13,70 % |
| Q8_0 | 34 MB | 13,78 % |
| Referencia Transformers F32 (MPS) | no disponible | 13,72 % |

Rendimiento de velocidad en factor de tiempo real (RTF):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de comprension del lenguaje, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 34 MB en Q8_0, 57 MB en F16 y 105 MB en F32, a los que hay que sumar el estado de activaciones y el buffer de audio (minimo en comparacion con los pesos).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4090, portatiles con GPU integrada e incluso aceleradores de borde. No requiere A100 ni H100.
- Funciona en CPU sin GPU: se han publicado mediciones en un AMD Ryzen 4750U con backend Vulkan y CPU, y en un Apple M4 Max con Metal y CPU.
- Opciones de despliegue: transcribe.cpp mediante compilacion con CMake y el binario transcribe-cli; el modelo base permite ademas despliegue con Transformers (MoonshineForConditionalGeneration) en PyTorch.
- El audio debe convertirse previamente a WAV mono a 16 kHz, por ejemplo con ffmpeg -i entrada.mp3 -ar 16000 -ac 1 salida.wav.
- Latencia y throughput: no se publican cifras absolutas de latencia; los RTF de 127 (Metal en M4 Max) y 56 (Vulkan en Ryzen 4750U) indican que el modelo procesa audio muy por encima de la velocidad de tiempo real en esos equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| moonshine-tiny-zh-gguf | 27 M | zh | PCM 16 kHz, sin contexto de texto publicado | MIT | GGUF | Conversion para transcribe.cpp, sin marcas de tiempo ni streaming |
| UsefulSensors/moonshine-tiny-zh | 27 M | zh | PCM 16 kHz | MIT | safetensors | Modelo base; referencia F32 con 13,72 % de CER en FLEURS-zh |
| Moonshine tiny original | 27 M | en | PCM 16 kHz | MIT | safetensors | Variante en ingles de la misma arquitectura; CER en chino no aplicable |
| Whisper tiny de OpenAI | 39 M (dato publico general, no verificado en la informacion proporcionada) | ~99 idiomas | Ventanas de 30 s con mel spectrograma | MIT | safetensors, GGUF y otros | Multilingue y con marcas de tiempo; mayor coste de preprocesado y de pesos |

No se dispone de cifras comparativas de CER homogeneas entre estos modelos dentro de la informacion proporcionada, por lo que la comparacion se limita a parametros, idiomas, licencia y formato.

## Limitaciones y advertencias

- Es un modelo de un solo idioma: unicamente chino (zh). No acepta ni transcribe otras lenguas y no realiza deteccion de idioma.
- No genera marcas de tiempo, por lo que no sirve por si solo para subtitulado sincronizado sin un paso de alineacion externo.
- No soporta streaming: necesita el audio completo, lo que limita su uso en aplicaciones de transcripcion en vivo.
- No traduce: la salida es siempre texto en mandarín.
- Riesgo de alucinacion y de bucles de generacion: la propia model card del modelo base recomienda limitar la longitud maxima de generacion en funcion de la duracion del audio (factor token_limit_factor) precisamente para evitarlos.
- La calidad medida es moderada: un CER del 13,70 % en FLEURS-zh implica un porcentaje apreciable de caracteres incorrectos, insuficiente para transcripcion legal o medica sin revision humana.
- Al ser un modelo de 27 M de parametros entrenado con datos no documentados en la informacion disponible, puede heredar sesgos de acento, dialecto, ruido de fondo y dominio de los corpus de entrenamiento; se desconoce su comportamiento en audio telefónico, con solapamiento de hablantes o con ruido intenso.
- La licencia MIT se hereda del modelo base y permite uso comercial siempre que se conserve el aviso de copyright y la licencia; conviene verificar los terminos completos en la model card upstream.
- El repositorio myflow-ai/moonshine-tiny-zh-gguf figura con 0 descargas, 0 me gusta y un tamano de repo de 0,0 GB en el momento de la consulta, mientras que los enlaces de descarga de la model card apuntan al espacio handy-computer/moonshine-tiny-zh-gguf. Conviene verificar de donde se descargan realmente los pesos antes de integrarlos en produccion.
- El CER publicado corresponde al split de test de FLEURS-zh (945 enunciados) con una decodificacion concreta; cambiar parametros de decodificacion puede alterar el resultado.

## Enlaces

- Modelo en HuggingFace (conversion GGUF): https://huggingface.co/myflow-ai/moonshine-tiny-zh-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-zh
- Commit fijado del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-zh/commit/3306270
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentacion de Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Paper de Moonshine: https://arxiv.org/abs/2509.02523
- Paper Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Codigo de Moonshine: https://github.com/moonshine-ai/moonshine
- Descargas GGUF referenciadas en la model card (espacio handy-computer): https://huggingface.co/handy-computer/moonshine-tiny-zh-gguf
